# MOI Radio Station Request System - Deployment Summary

## 🚀 Live URLs

- **Frontend (Netlify):** [Your Netlify URL]
- **Backend API (Railway):** https://web-production-7c153.up.railway.app/api
- **Database:** Railway PostgreSQL (automatically connected)

---

## 📋 Architecture Overview

### **Frontend**
- **Platform:** Netlify
- **Technology:** React 19.2.4
- **Auto-Deploy:** Yes (from GitHub `main` branch)
- **Base Directory:** `frontend`
- **Build Command:** `npm run build`
- **Publish Directory:** `frontend/build`

### **Backend API**
- **Platform:** Railway
- **Technology:** Node.js + Express 5.2.1
- **Auto-Deploy:** Yes (from GitHub `main` branch)
- **Port:** 8080 (Railway auto-assigns)
- **Root Directory:** Project root
- **Start Command:** `cd backend && node server.js`

### **Database**
- **Platform:** Railway PostgreSQL
- **Connection:** Automatic via `DATABASE_URL` environment variable
- **Tables:**
  - `users` - User accounts with bcrypt password hashing
  - `folder_requests` - Radio archive folder requests
  - `request_history` - Audit log of all request changes

---

## 👥 User Accounts (Test/Demo)

| Role | Employee Number | Password | Full Name | Department |
|------|----------------|----------|-----------|------------|
| Requester | 10001 | password123 | 📖 محطة القرآن الكريم | Radio Broadcasting |
| Level 1 Approver | 20001 | password123 | عيسى العنزي | Management |
| Level 2 Approver | 30001 | password123 | مشعل سعود الزمنان | Supervision |
| Level 3 Approver | 40001 | password123 | Eng. صادق | Archiving |

---

## 🔄 Deployment Workflow

### Automatic Deployment Process

**When you push to GitHub `main` branch:**

1. **Netlify** automatically:
   - Detects changes in `frontend/` folder
   - Installs dependencies (`npm install`)
   - Builds React app (`npm run build`)
   - Deploys to global CDN
   - Time: ~2-3 minutes

2. **Railway** automatically:
   - Detects changes in `backend/` folder
   - Installs dependencies
   - Restarts Node.js server
   - Time: ~1-2 minutes

**No manual deployment needed!** Just push to GitHub.

---

## 🛠️ Railway Services Setup

### What's in Railway Dashboard

You should have **2 services** (delete any others):

1. **✅ Postgres** (Database)
   - Type: PostgreSQL database
   - Status: Should show "Online"
   - Don't touch this!

2. **✅ web** (Backend API)
   - Type: Node.js application
   - URL: web-production-7c153.up.railway.app
   - Environment Variables:
     - `DATABASE_URL` (auto-set by Railway)
     - `JWT_SECRET` = `radio-station-workflow-secret-key-2026`

### If You See Extra Services
- Delete any service named `moi-radio-station-requests` (failed frontend attempt)
- Keep ONLY: Postgres + web

---

## 🔧 Environment Variables

### Netlify (Frontend)
```
REACT_APP_API_URL=https://web-production-7c153.up.railway.app/api
```

### Railway (Backend)
```
DATABASE_URL=postgresql://... (auto-set by Railway when you add Postgres)
JWT_SECRET=radio-station-workflow-secret-key-2026
```

---

## 📁 Project Structure

```
moi-radio-station-requests/
├── frontend/               # React frontend (deployed to Netlify)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── config.js      # API URL configuration
│   │   └── App.js
│   ├── public/
│   ├── package.json
│   └── netlify.toml       # Netlify configuration
│
├── backend/               # Node.js API (deployed to Railway)
│   ├── server.js          # Main Express server
│   ├── setup-db-postgres.js  # Database initialization script
│   ├── package.json
│   └── .env              # Local development only (NOT in git)
│
├── package.json           # Root package.json (minimal, for Railway)
└── README.md

```

---

## 🔐 Security Notes

1. **Database Setup Endpoint REMOVED**
   - The `/api/setup-database` endpoint has been removed for security
   - Database is already initialized with test users

2. **Password Hashing**
   - All passwords are hashed with bcrypt (10 rounds)
   - Never store plain text passwords

3. **JWT Authentication**
   - Tokens expire after 24 hours
   - Secret key stored in Railway environment variables

4. **CORS Enabled**
   - Backend accepts requests from any origin (for development)
   - Consider restricting to Netlify domain in production

---

## 🐛 Troubleshooting

### Frontend Issues

**"Failed to fetch" on login:**
- Check browser console (F12) for the API URL being called
- Verify `REACT_APP_API_URL` in Netlify environment variables
- Ensure Railway backend is online

**Frontend not updating:**
- Clear Netlify cache: Deploys → Trigger deploy → Clear cache and deploy

### Backend Issues

**Database connection errors:**
- Check Railway logs: Click web service → Deployments → View logs
- Verify `DATABASE_URL` variable exists in Railway
- Ensure Postgres service is running

**API returns 500 errors:**
- Check Railway deployment logs
- Common issue: Missing environment variables

---

## 🔄 How to Make Changes

### Update Frontend (UI Changes)

1. Edit files in `frontend/src/`
2. Test locally: `cd frontend && npm start`
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update frontend: describe your changes"
   git push
   ```
4. Netlify auto-deploys in 2-3 minutes

### Update Backend (API Changes)

1. Edit files in `backend/`
2. Test locally: `cd backend && npm start`
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update backend: describe your changes"
   git push
   ```
4. Railway auto-deploys in 1-2 minutes

### Database Changes

**To add new users manually:**
1. Go to Railway → Click Postgres service
2. Click "Data" tab
3. Run SQL query:
```sql
INSERT INTO users (employee_number, full_name, role, department, password_hash)
VALUES ('50001', 'New User', 'requester', 'Department Name',
        '$2b$10$...');  -- Use bcrypt to hash password
```

**Or use the setup script:**
```bash
cd backend
node setup-db-postgres.js
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/login` - User login

### Requests
- `GET /api/requests` - Get all requests (filtered by role)
- `POST /api/requests` - Create new request (requester only)
- `GET /api/requests/:id` - Get single request details
- `POST /api/requests/:id/respond` - Approve/decline request

### Dashboard
- `GET /api/dashboard/stats` - Get statistics for dashboard

### Health
- `GET /api/health` - Check if API is running

---

## 🎯 Future Enhancements

### Recommended Improvements

1. **User Management**
   - Add admin panel to create/edit users
   - Password reset functionality
   - Email notifications

2. **Request Features**
   - File attachments (upload documents)
   - Request status filters
   - Search and sort functionality
   - Export to PDF/Excel

3. **Security**
   - Restrict CORS to Netlify domain only
   - Add rate limiting
   - Implement refresh tokens
   - Add 2FA for sensitive accounts

4. **Monitoring**
   - Add error tracking (Sentry)
   - Analytics (Plausible or Google Analytics)
   - Uptime monitoring

5. **Custom Domain**
   - Connect custom domain to Netlify
   - Add SSL certificate (automatic with Netlify)

---

## 💾 Backup & Recovery

### Database Backup

**Manual Backup (Railway):**
1. Go to Railway → Postgres service → Data tab
2. Export data as SQL

**Automated Backup:**
- Railway Pro plan includes automatic daily backups
- Free tier: Set up a cron job to export data

### Code Backup
- All code is in GitHub
- Never delete the repository
- Create branches for experimental features

---

## 📞 Support & Resources

### Netlify
- Dashboard: https://app.netlify.com
- Docs: https://docs.netlify.com

### Railway
- Dashboard: https://railway.app/dashboard
- Docs: https://docs.railway.app

### GitHub Repository
- URL: https://github.com/Nedo960/moi-radio-station-requests
- Always push your changes here

---

## ✅ Deployment Checklist

When deploying to production:

- [ ] Update test user passwords to strong passwords
- [ ] Remove or disable test accounts (10001, 20001, 30001, 40001)
- [ ] Create real user accounts with proper employee numbers
- [ ] Update `JWT_SECRET` to a cryptographically random string
- [ ] Restrict CORS to Netlify domain only
- [ ] Add custom domain (optional)
- [ ] Set up error monitoring
- [ ] Test all workflows with real data
- [ ] Create database backup
- [ ] Document any custom configuration

---

## 🎓 Key Learnings

**What worked:**
- ✅ Separating frontend (Netlify) and backend (Railway)
- ✅ Using environment variables for configuration
- ✅ Auto-deployment from GitHub
- ✅ PostgreSQL for persistent data

**What didn't work:**
- ❌ Vercel (React 19 compatibility issues + serverless complexity)
- ❌ Railway monorepo (tried to serve frontend + backend together)
- ❌ In-memory mock data (not persistent)

**Best practice:**
- Keep frontend and backend separate
- Use managed databases (don't self-host)
- Test locally before pushing
- Use platform-specific features (Netlify for React, Railway for Node.js)

---

## 📝 Quick Reference

### Restart Everything
1. Netlify: Deploys → Trigger deploy → Deploy site
2. Railway: Click service → Deployments → Redeploy

### View Logs
- **Netlify:** Deploys → Click deployment → Deploy log
- **Railway:** Click service → Deployments → View logs

### Update Environment Variable
- **Netlify:** Site settings → Environment variables → Edit
- **Railway:** Click service → Variables → Edit

---

**Last Updated:** March 3, 2026
**Deployed By:** Nedo960
**Status:** ✅ Production Ready
