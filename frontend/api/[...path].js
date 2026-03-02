// Vercel Serverless API - Mock Mode (No Database Required)
const jwt = require('jsonwebtoken');

// Mock users - password for all: password123
const MOCK_USERS = [
  { id: 1, employee_number: '10001', full_name: 'Quran Station', role: 'requester', department: 'Radio Broadcasting' },
  { id: 2, employee_number: '20001', full_name: 'عيسى العنزي', role: 'level1', department: 'Management' },
  { id: 3, employee_number: '30001', full_name: 'مشعل سعود الزمنان', role: 'level2', department: 'Supervision' },
  { id: 4, employee_number: '40001', full_name: 'Eng. صادق', role: 'level3', department: 'Archiving' }
];

let requests = [];
let requestCounter = 1;

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };

function auth(req) {
  const token = (req.headers['authorization'] || req.headers['Authorization'] || '').split(' ')[1];
  if (!token) throw new Error('Access denied');
  return jwt.verify(token, process.env.JWT_SECRET || 'radio-station-workflow-secret-key-2026');
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') { Object.entries(cors).forEach(([k,v]) => res.setHeader(k,v)); return res.status(200).json({}); }
  Object.entries(cors).forEach(([k,v]) => res.setHeader(k,v));

  // Extract path from query params (catch-all route) or URL
  let path = req.query.path ? '/' + (Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path) : req.url.split('?')[0];

  // Clean up path - remove /api prefix if present
  path = path.replace('/api/', '/').replace('/api', '');
  if (!path.startsWith('/')) path = '/' + path;

  // Add root endpoint for debugging
  if (path === '/' || path === '') {
    return res.json({ status: 'API is working', method: req.method, rawPath: req.query.path, endpoints: ['/health', '/login', '/requests', '/dashboard/stats'] });
  }

  try {
    if (req.method === 'POST' && path === '/login') {
      const { employee_number, password } = req.body;
      const user = MOCK_USERS.find(u => u.employee_number === employee_number);
      if (!user || password !== 'password123') return res.status(401).json({ error: 'Invalid credentials' });
      
      const token = jwt.sign({ id: user.id, employee_number: user.employee_number, role: user.role }, process.env.JWT_SECRET || 'radio-station-workflow-secret-key-2026', { expiresIn: '24h' });
      return res.json({ token, user });
    }
    
    if (req.method === 'GET' && path === '/health') return res.json({ status: 'ok' });
    
    if (req.method === 'GET' && path === '/requests') {
      const user = auth(req);
      let filtered = user.role === 'requester' ? requests.filter(r => r.requester_id === user.id) : requests;
      return res.json(filtered);
    }
    
    if (req.method === 'POST' && path === '/requests') {
      const user = auth(req);
      const newReq = { ...req.body, id: requestCounter++, request_number: `REQ-${String(requestCounter).padStart(5,'0')}`, requester_id: user.id, requester_name: MOCK_USERS.find(u=>u.id===user.id).full_name, status: 'pending_level1', submitted_at: new Date().toISOString() };
      requests.push(newReq);
      return res.json(newReq);
    }
    
    if (req.method === 'GET' && path.startsWith('/requests/')) {
      auth(req);
      const id = parseInt(path.split('/')[2]);
      const request = requests.find(r => r.id === id);
      if (!request) return res.status(404).json({ error: 'Not found' });
      return res.json({ request, history: [] });
    }
    
    if (req.method === 'POST' && path.match(/\/requests\/\d+\/respond/)) {
      const user = auth(req);
      const id = parseInt(path.split('/')[2]);
      const { decision, comment } = req.body;
      const request = requests.find(r => r.id === id);
      if (!request) return res.status(404).json({ error: 'Not found' });
      
      if (user.role === 'level1' && request.status === 'pending_level1') {
        request.level1_decision = decision; request.level1_comment = comment; request.status = decision === 'approved' ? 'pending_level2' : 'declined';
      } else if (user.role === 'level2' && request.status === 'pending_level2') {
        request.level2_decision = decision; request.level2_comment = comment; request.status = decision === 'approved' ? 'pending_level3' : 'declined';
      } else if (user.role === 'level3' && request.status === 'pending_level3') {
        request.level3_decision = decision; request.level3_comment = comment; request.status = decision === 'approved' ? 'approved' : 'declined';
      }
      return res.json(request);
    }
    
    if (req.method === 'GET' && path === '/dashboard/stats') {
      const user = auth(req);
      const userReqs = user.role === 'requester' ? requests.filter(r => r.requester_id === user.id) : requests;
      const stats = { pending: userReqs.filter(r=>r.status===`pending_${user.role}`||r.status==='pending_level1').length, approved: userReqs.filter(r=>r.status==='approved').length, declined: userReqs.filter(r=>r.status==='declined').length };
      return res.json(stats);
    }
    
    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
