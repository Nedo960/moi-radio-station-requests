// Vercel Serverless API - Main Entry Point
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Database connection pool
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Auth middleware function
function authenticateToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new Error('Access denied');
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return user;
  } catch (err) {
    throw new Error('Invalid token');
  }
}

// Main handler
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const { method, url } = req;
  const path = url.replace('/api', '');

  try {
    // Route: POST /api/login
    if (method === 'POST' && path === '/login') {
      const { employee_number, password } = req.body;

      const db = getPool();
      const result = await db.query(
        'SELECT * FROM users WHERE employee_number = $1',
        [employee_number]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, employee_number: user.employee_number, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          employee_number: user.employee_number,
          full_name: user.full_name,
          role: user.role,
          department: user.department
        }
      });
    }

    // Route: GET /api/health
    if (method === 'GET' && path === '/health') {
      const db = getPool();
      await db.query('SELECT 1');
      return res.json({ status: 'ok' });
    }

    // Route: GET /api/requests
    if (method === 'GET' && path === '/requests') {
      const user = authenticateToken(req);
      const db = getPool();

      let query = `
        SELECT r.*,
               u.full_name as requester_name,
               l1.full_name as level1_approver_name,
               l2.full_name as level2_approver_name,
               l3.full_name as level3_approver_name
        FROM folder_requests r
        LEFT JOIN users u ON r.requester_id = u.id
        LEFT JOIN users l1 ON r.level1_approver_id = l1.id
        LEFT JOIN users l2 ON r.level2_approver_id = l2.id
        LEFT JOIN users l3 ON r.level3_approver_id = l3.id
      `;

      if (user.role === 'requester') {
        query += ` WHERE r.requester_id = ${user.id}`;
      } else if (user.role === 'level1') {
        query += ` WHERE r.status IN ('pending_level1', 'pending_level2', 'pending_level3', 'approved', 'declined')`;
      } else if (user.role === 'level2') {
        query += ` WHERE r.status IN ('pending_level2', 'pending_level3', 'approved', 'declined')`;
      } else if (user.role === 'level3') {
        query += ` WHERE r.status IN ('pending_level3', 'approved', 'declined')`;
      }

      query += ` ORDER BY r.submitted_at DESC`;

      const result = await db.query(query);
      return res.json(result.rows);
    }

    // Route: POST /api/requests (create new request)
    if (method === 'POST' && path === '/requests') {
      const user = authenticateToken(req);
      const db = getPool();
      const client = await db.connect();

      try {
        await client.query('BEGIN');

        const {
          station_name,
          program_name,
          broadcast_date,
          episode_number,
          presenter_name,
          notes
        } = req.body;

        const countResult = await client.query('SELECT COUNT(*) FROM folder_requests');
        const requestNumber = `REQ-${String(parseInt(countResult.rows[0].count) + 1).padStart(5, '0')}`;

        const result = await client.query(
          `INSERT INTO folder_requests
          (request_number, requester_id, station_name, program_name, broadcast_date,
           episode_number, presenter_name, notes, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_level1')
          RETURNING *`,
          [requestNumber, user.id, station_name, program_name, broadcast_date,
           episode_number, presenter_name, notes]
        );

        await client.query(
          `INSERT INTO request_history (request_id, actor_id, action, new_status)
          VALUES ($1, $2, 'submitted', 'pending_level1')`,
          [result.rows[0].id, user.id]
        );

        await client.query('COMMIT');
        return res.json(result.rows[0]);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    // Route: GET /api/dashboard/stats
    if (method === 'GET' && path === '/dashboard/stats') {
      const user = authenticateToken(req);
      const db = getPool();

      let stats = {};

      if (user.role === 'requester') {
        const result = await db.query(
          `SELECT
            COUNT(*) FILTER (WHERE status = 'pending_level1') as pending,
            COUNT(*) FILTER (WHERE status IN ('pending_level2', 'pending_level3')) as in_progress,
            COUNT(*) FILTER (WHERE status = 'approved') as approved,
            COUNT(*) FILTER (WHERE status = 'declined') as declined
          FROM folder_requests
          WHERE requester_id = $1`,
          [user.id]
        );
        stats = result.rows[0];
      } else {
        const statusFilter = {
          'level1': ['pending_level1'],
          'level2': ['pending_level2'],
          'level3': ['pending_level3']
        }[user.role];

        const result = await db.query(
          `SELECT
            COUNT(*) FILTER (WHERE status = ANY($1)) as pending,
            COUNT(*) FILTER (WHERE status = 'approved') as approved,
            COUNT(*) FILTER (WHERE status = 'declined') as declined
          FROM folder_requests`,
          [statusFilter]
        );
        stats = result.rows[0];
      }

      return res.json(stats);
    }

    // Default: Not found
    return res.status(404).json({ error: 'Not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
