# MOI Radio Station Request System

🎙️ **Multi-level approval workflow system for radio archive folder requests**

[![Status](https://img.shields.io/badge/Status-Production-success)]()
[![Frontend](https://img.shields.io/badge/Frontend-Netlify-00C7B7)]()
[![Backend](https://img.shields.io/badge/Backend-Railway-7C3AED)]()
[![Database](https://img.shields.io/badge/Database-PostgreSQL-316192)]()

## 📋 Overview

A complete workflow management system for handling radio station archive folder requests through a structured 3-level approval process.

**Workflow:** Requester → Level 1 Approval → Level 2 Approval → Level 3 Final Approval

## 🚀 Live Application

- **Frontend (Netlify):** [Your Netlify URL]
- **Backend API (Railway):** https://web-production-7c153.up.railway.app/api

## ✨ Features

- ✅ Multi-level approval workflow (3 levels)
- ✅ Role-based access control (Requester, Level 1, 2, 3)
- ✅ JWT authentication & authorization
- ✅ Real-time request status tracking
- ✅ Arabic/English bilingual interface
- ✅ Request history & audit trail
- ✅ Responsive design (desktop & mobile)
- ✅ Auto-deployment from GitHub

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Netlify   │────────▶│   Railway    │────────▶│  PostgreSQL  │
│  (Frontend) │  HTTPS  │  (Backend)   │   SQL   │  (Database)  │
└─────────────┘         └──────────────┘         └──────────────┘
    React 19              Node.js + Express         Railway PG
```

### Tech Stack

**Frontend:**
- React 19.2.4
- Modern CSS (Flexbox/Grid)
- JWT token management
- Deployed on Netlify

**Backend:**
- Node.js with Express 5.2.1
- PostgreSQL database
- Bcrypt password hashing
- JWT authentication
- Deployed on Railway

## 📁 Project Structure

```
moi-radio-station-requests/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── SubmitForm.js
│   │   │   ├── RequestList.js
│   │   │   ├── RequestModal.js
│   │   │   └── Notifications.js
│   │   ├── config.js        # API configuration
│   │   ├── App.js
│   │   └── index.css
│   ├── public/
│   ├── netlify.toml         # Netlify config
│   └── package.json
│
├── backend/                  # Express API server
│   ├── server.js            # Main server (PostgreSQL)
│   ├── setup-db-postgres.js # Database initialization
│   ├── package.json
│   └── .env (gitignored)
│
├── DEPLOYMENT_SUMMARY.md    # Complete deployment guide
├── package.json             # Root package for Railway
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL (for local development)
- Git

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Nedo960/moi-radio-station-requests.git
cd moi-radio-station-requests
```

2. **Set up Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
node setup-db-postgres.js  # Initialize database
npm start  # Starts on http://localhost:5000
```

3. **Set up Frontend** (in new terminal)
```bash
cd frontend
npm install
# Edit src/config.js - set API_URL to http://localhost:5000/api
npm start  # Starts on http://localhost:3000
```

4. **Login with test account:**
- Employee Number: `10001`
- Password: `password123`

## 🌐 Deployment

This project auto-deploys from GitHub `main` branch:

- **Frontend → Netlify:** Push to GitHub → Auto-builds & deploys
- **Backend → Railway:** Push to GitHub → Auto-deploys

See [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) for complete deployment guide.

## 👥 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Requester** | Radio station staff | Create requests, view own requests |
| **Level 1** | عيسى العنزي (Management) | Approve/decline pending_level1 requests |
| **Level 2** | مشعل سعود الزمنان (Supervision) | Approve/decline pending_level2 requests |
| **Level 3** | Eng. صادق (Archiving) | Final approve/decline pending_level3 requests |

## 🔐 Test Accounts

| Employee Number | Password | Role |
|----------------|----------|------|
| 10001 | password123 | Requester |
| 20001 | password123 | Level 1 Approver |
| 30001 | password123 | Level 2 Approver |
| 40001 | password123 | Level 3 Approver |

⚠️ **Change these passwords before production use!**

## 📊 API Endpoints

```
POST   /api/login                    # User authentication
GET    /api/requests                 # Get all requests (filtered by role)
POST   /api/requests                 # Create new request
GET    /api/requests/:id             # Get single request details
POST   /api/requests/:id/respond     # Approve/decline request
GET    /api/dashboard/stats          # Get dashboard statistics
GET    /api/health                   # Health check
```

## 🔄 Workflow States

```
pending_level1 → pending_level2 → pending_level3 → approved
       ↓                ↓                ↓
   declined        declined        declined
```

## 🛠️ Environment Variables

### Frontend (Netlify)
```
REACT_APP_API_URL=https://web-production-7c153.up.railway.app/api
```

### Backend (Railway)
```
DATABASE_URL=postgresql://...  (auto-set by Railway)
JWT_SECRET=your-secret-key-here
PORT=8080  (auto-set by Railway)
```

## 📝 Database Schema

**users**
- id, employee_number, full_name, role, department, password_hash, created_at

**folder_requests**
- id, request_number, requester_id, station_name, program_name, broadcast_date
- episode_number, presenter_name, notes, status, timestamps
- level1/2/3_approver_id, level1/2/3_comment, level1/2/3_decision

**request_history**
- id, request_id, actor_id, action, comment, previous_status, new_status, created_at

## 🔧 Troubleshooting

See [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md#-troubleshooting) for detailed troubleshooting guide.

## 📚 Documentation

- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Complete deployment & maintenance guide
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Original project specifications

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature-name`
2. Make your changes
3. Test locally
4. Push to GitHub: `git push origin feature-name`
5. Netlify/Railway will auto-deploy preview environments

## 📄 License

Private project for MOI Kuwait

## 🙏 Acknowledgments

- Built for Ministry of Information, Kuwait
- React team for React 19
- Netlify & Railway for deployment platforms

---

**Status:** ✅ Production Ready
**Last Updated:** March 3, 2026
**Maintained by:** Nedo960
