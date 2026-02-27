require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const db = new Database(path.join(__dirname, 'radio_station.db'));
db.pragma('foreign_keys = ON');

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

        const user = db.prepare('SELECT * FROM users WHERE employee_number = ?').get(employee_number);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

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
    try {
        const {
            station_name,
            program_name,
            broadcast_date,
            episode_number,
            presenter_name,
            notes
        } = req.body;

        // Generate request number
        const count = db.prepare('SELECT COUNT(*) as count FROM folder_requests').get();
        const requestNumber = `REQ-${String(count.count + 1).padStart(5, '0')}`;

        const insert = db.prepare(`
            INSERT INTO folder_requests
            (request_number, requester_id, station_name, program_name, broadcast_date,
             episode_number, presenter_name, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_level1')
        `);

        const result = insert.run(
            requestNumber, req.user.id, station_name, program_name, broadcast_date,
            episode_number, presenter_name, notes
        );

        // Add to history
        db.prepare(`
            INSERT INTO request_history (request_id, actor_id, action, new_status)
            VALUES (?, ?, 'submitted', 'pending_level1')
        `).run(result.lastInsertRowid, req.user.id);

        const request = db.prepare('SELECT * FROM folder_requests WHERE id = ?').get(result.lastInsertRowid);
        res.json(request);
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ error: 'Failed to create request' });
    }
});

// Get all requests (filtered by role)
app.get('/api/requests', authenticateToken, (req, res) => {
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

        let whereClause = '';

        // Filter based on role
        if (req.user.role === 'requester') {
            whereClause = ` WHERE r.requester_id = ${req.user.id}`;
        } else if (req.user.role === 'level1') {
            whereClause = ` WHERE r.status IN ('pending_level1', 'pending_level2', 'pending_level3', 'approved', 'declined')`;
        } else if (req.user.role === 'level2') {
            whereClause = ` WHERE r.status IN ('pending_level2', 'pending_level3', 'approved', 'declined')`;
        } else if (req.user.role === 'level3') {
            whereClause = ` WHERE r.status IN ('pending_level3', 'approved', 'declined')`;
        }

        query += whereClause + ` ORDER BY r.submitted_at DESC`;

        const requests = db.prepare(query).all();
        res.json(requests);
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Get single request with history
app.get('/api/requests/:id', authenticateToken, (req, res) => {
    try {
        const request = db.prepare(`
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
            WHERE r.id = ?
        `).get(req.params.id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const history = db.prepare(`
            SELECT h.*, u.full_name as actor_name
            FROM request_history h
            LEFT JOIN users u ON h.actor_id = u.id
            WHERE h.request_id = ?
            ORDER BY h.created_at ASC
        `).all(req.params.id);

        res.json({
            request,
            history
        });
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({ error: 'Failed to fetch request' });
    }
});

// Approve/Decline request
app.post('/api/requests/:id/respond', authenticateToken, (req, res) => {
    try {
        const { decision, comment } = req.body;
        const requestId = req.params.id;

        // Get current request
        const request = db.prepare('SELECT * FROM folder_requests WHERE id = ?').get(requestId);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const currentStatus = request.status;
        let newStatus;
        let updateQuery;

        // State machine logic
        if (req.user.role === 'level1' && currentStatus === 'pending_level1') {
            newStatus = decision === 'approved' ? 'pending_level2' : 'declined';
            updateQuery = `
                UPDATE folder_requests
                SET level1_approver_id = ?,
                    level1_decision = ?,
                    level1_comment = ?,
                    level1_responded_at = datetime('now'),
                    status = ?
                WHERE id = ?
            `;
            db.prepare(updateQuery).run(req.user.id, decision, comment, newStatus, requestId);
        } else if (req.user.role === 'level2' && currentStatus === 'pending_level2') {
            newStatus = decision === 'approved' ? 'pending_level3' : 'declined';
            updateQuery = `
                UPDATE folder_requests
                SET level2_approver_id = ?,
                    level2_decision = ?,
                    level2_comment = ?,
                    level2_responded_at = datetime('now'),
                    status = ?
                WHERE id = ?
            `;
            db.prepare(updateQuery).run(req.user.id, decision, comment, newStatus, requestId);
        } else if (req.user.role === 'level3' && currentStatus === 'pending_level3') {
            newStatus = decision === 'approved' ? 'approved' : 'declined';
            updateQuery = `
                UPDATE folder_requests
                SET level3_approver_id = ?,
                    level3_decision = ?,
                    level3_comment = ?,
                    level3_responded_at = datetime('now'),
                    completed_at = datetime('now'),
                    status = ?
                WHERE id = ?
            `;
            db.prepare(updateQuery).run(req.user.id, decision, comment, newStatus, requestId);
        } else {
            return res.status(400).json({ error: 'Invalid approval level or status' });
        }

        // Add to history
        db.prepare(`
            INSERT INTO request_history (request_id, actor_id, action, comment, previous_status, new_status)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(requestId, req.user.id, decision, comment, currentStatus, newStatus);

        // Fetch updated request
        const updatedRequest = db.prepare(`
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
            WHERE r.id = ?
        `).get(requestId);

        res.json(updatedRequest);
    } catch (error) {
        console.error('Respond error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get dashboard stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    try {
        let stats = {};

        if (req.user.role === 'requester') {
            const result = db.prepare(`
                SELECT
                    SUM(CASE WHEN status = 'pending_level1' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status IN ('pending_level2', 'pending_level3') THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END) as declined
                FROM folder_requests
                WHERE requester_id = ?
            `).get(req.user.id);
            stats = result;
        } else {
            const statusFilter = {
                'level1': 'pending_level1',
                'level2': 'pending_level2',
                'level3': 'pending_level3'
            }[req.user.role];

            const result = db.prepare(`
                SELECT
                    SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END) as declined
                FROM folder_requests
            `).get(statusFilter);
            stats = result;
        }

        res.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    try {
        db.prepare('SELECT 1').get();
        res.json({ status: 'ok' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database: ${path.join(__dirname, 'radio_station.db')}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});
