require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    options: '-c search_path=radio_station,public'
});

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// ============= AUTH ROUTES =============

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { employee_number, password } = req.body;

        const result = await pool.query(
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

        res.json({
            token,
            user: {
                id: user.id,
                employee_number: user.employee_number,
                full_name: user.full_name,
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============= REQUEST ROUTES =============

// Create new request
app.post('/api/requests', authenticateToken, async (req, res) => {
    const client = await pool.connect();
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

        // Generate request number
        const countResult = await client.query('SELECT COUNT(*) FROM folder_requests');
        const requestNumber = `REQ-${String(parseInt(countResult.rows[0].count) + 1).padStart(5, '0')}`;

        const result = await client.query(
            `INSERT INTO folder_requests
            (request_number, requester_id, station_name, program_name, broadcast_date,
             episode_number, presenter_name, notes, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_level1')
            RETURNING *`,
            [requestNumber, req.user.id, station_name, program_name, broadcast_date,
             episode_number, presenter_name, notes]
        );

        // Add to history
        await client.query(
            `INSERT INTO request_history (request_id, actor_id, action, new_status)
            VALUES ($1, $2, 'submitted', 'pending_level1')`,
            [result.rows[0].id, req.user.id]
        );

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create request error:', error);
        res.status(500).json({ error: 'Failed to create request' });
    } finally {
        client.release();
    }
});

// Get all requests (filtered by role)
app.get('/api/requests', authenticateToken, async (req, res) => {
    try {
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

        // Filter based on role
        if (req.user.role === 'requester') {
            query += ` WHERE r.requester_id = ${req.user.id}`;
        } else if (req.user.role === 'level1') {
            query += ` WHERE r.status IN ('pending_level1', 'pending_level2', 'pending_level3', 'approved', 'declined')`;
        } else if (req.user.role === 'level2') {
            query += ` WHERE r.status IN ('pending_level2', 'pending_level3', 'approved', 'declined')`;
        } else if (req.user.role === 'level3') {
            query += ` WHERE r.status IN ('pending_level3', 'approved', 'declined')`;
        }

        query += ` ORDER BY r.submitted_at DESC`;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Get single request with history
app.get('/api/requests/:id', authenticateToken, async (req, res) => {
    try {
        const requestResult = await pool.query(
            `SELECT r.*,
                    u.full_name as requester_name,
                    l1.full_name as level1_approver_name,
                    l2.full_name as level2_approver_name,
                    l3.full_name as level3_approver_name
            FROM folder_requests r
            LEFT JOIN users u ON r.requester_id = u.id
            LEFT JOIN users l1 ON r.level1_approver_id = l1.id
            LEFT JOIN users l2 ON r.level2_approver_id = l2.id
            LEFT JOIN users l3 ON r.level3_approver_id = l3.id
            WHERE r.id = $1`,
            [req.params.id]
        );

        if (requestResult.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const historyResult = await pool.query(
            `SELECT h.*, u.full_name as actor_name
            FROM request_history h
            LEFT JOIN users u ON h.actor_id = u.id
            WHERE h.request_id = $1
            ORDER BY h.created_at ASC`,
            [req.params.id]
        );

        res.json({
            request: requestResult.rows[0],
            history: historyResult.rows
        });
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({ error: 'Failed to fetch request' });
    }
});

// Approve/Decline request
app.post('/api/requests/:id/respond', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { decision, comment } = req.body;
        const requestId = req.params.id;

        // Get current request
        const requestResult = await client.query(
            'SELECT * FROM folder_requests WHERE id = $1',
            [requestId]
        );

        if (requestResult.rows.length === 0) {
            throw new Error('Request not found');
        }

        const request = requestResult.rows[0];
        const currentStatus = request.status;
        let newStatus;
        let updateFields = {};

        // State machine logic
        if (req.user.role === 'level1' && currentStatus === 'pending_level1') {
            updateFields = {
                level1_approver_id: req.user.id,
                level1_decision: decision,
                level1_comment: comment,
                level1_responded_at: 'CURRENT_TIMESTAMP'
            };
            newStatus = decision === 'approved' ? 'pending_level2' : 'declined';
        } else if (req.user.role === 'level2' && currentStatus === 'pending_level2') {
            updateFields = {
                level2_approver_id: req.user.id,
                level2_decision: decision,
                level2_comment: comment,
                level2_responded_at: 'CURRENT_TIMESTAMP'
            };
            newStatus = decision === 'approved' ? 'pending_level3' : 'declined';
        } else if (req.user.role === 'level3' && currentStatus === 'pending_level3') {
            updateFields = {
                level3_approver_id: req.user.id,
                level3_decision: decision,
                level3_comment: comment,
                level3_responded_at: 'CURRENT_TIMESTAMP',
                completed_at: 'CURRENT_TIMESTAMP'
            };
            newStatus = decision === 'approved' ? 'approved' : 'declined';
        } else {
            throw new Error('Invalid approval level or status');
        }

        // Build update query
        const setClause = Object.keys(updateFields).map((key, idx) => {
            if (updateFields[key] === 'CURRENT_TIMESTAMP') {
                return `${key} = CURRENT_TIMESTAMP`;
            }
            return `${key} = $${idx + 2}`;
        }).join(', ');

        const values = [requestId, ...Object.values(updateFields).filter(v => v !== 'CURRENT_TIMESTAMP')];

        await client.query(
            `UPDATE folder_requests SET ${setClause}, status = $${values.length + 1} WHERE id = $1`,
            [...values, newStatus]
        );

        // Add to history
        await client.query(
            `INSERT INTO request_history (request_id, actor_id, action, comment, previous_status, new_status)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [requestId, req.user.id, decision, comment, currentStatus, newStatus]
        );

        await client.query('COMMIT');

        // Fetch updated request
        const updatedResult = await client.query(
            `SELECT r.*,
                    u.full_name as requester_name,
                    l1.full_name as level1_approver_name,
                    l2.full_name as level2_approver_name,
                    l3.full_name as level3_approver_name
            FROM folder_requests r
            LEFT JOIN users u ON r.requester_id = u.id
            LEFT JOIN users l1 ON r.level1_approver_id = l1.id
            LEFT JOIN users l2 ON r.level2_approver_id = l2.id
            LEFT JOIN users l3 ON r.level3_approver_id = l3.id
            WHERE r.id = $1`,
            [requestId]
        );

        res.json(updatedResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Respond error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// Get dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        let stats = {};

        if (req.user.role === 'requester') {
            const result = await pool.query(
                `SELECT
                    COUNT(*) FILTER (WHERE status = 'pending_level1') as pending,
                    COUNT(*) FILTER (WHERE status IN ('pending_level2', 'pending_level3')) as in_progress,
                    COUNT(*) FILTER (WHERE status = 'approved') as approved,
                    COUNT(*) FILTER (WHERE status = 'declined') as declined
                FROM folder_requests
                WHERE requester_id = $1`,
                [req.user.id]
            );
            stats = result.rows[0];
        } else {
            const statusFilter = {
                'level1': ['pending_level1'],
                'level2': ['pending_level2'],
                'level3': ['pending_level3']
            }[req.user.role];

            const result = await pool.query(
                `SELECT
                    COUNT(*) FILTER (WHERE status = ANY($1)) as pending,
                    COUNT(*) FILTER (WHERE status = 'approved') as approved,
                    COUNT(*) FILTER (WHERE status = 'declined') as declined
                FROM folder_requests`,
                [statusFilter]
            );
            stats = result.rows[0];
        }

        res.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Serve static files from React build (for production)
if (process.env.NODE_ENV === 'production') {
    const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');

    // Serve static files
    app.use(express.static(frontendBuildPath));

    // For any route that doesn't match API or static files, serve index.html
    // This handles React Router routes
    app.use((req, res, next) => {
        // If the request is for /api, let it through to API routes
        if (req.path.startsWith('/api')) {
            return next();
        }
        // Otherwise serve the React app
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.NODE_ENV === 'production') {
        console.log(`Serving frontend from: ${path.join(__dirname, '..', 'frontend', 'build')}`);
    }
});
