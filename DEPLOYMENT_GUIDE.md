# Deployment Guide - Netlify & Render

## Overview
This guide will help you deploy the Radio Station Request System to production using:
- **Netlify** for the React frontend
- **Render** for the Node.js backend + PostgreSQL database

---

## Prerequisites

1. **GitHub Account** - To push code to repository
2. **Netlify Account** - Free tier available at https://netlify.com
3. **Render Account** - Free tier available at https://render.com
4. **Git Installed** - To push code

---

## Step 1: Prepare Backend for PostgreSQL (Render)

### Update Backend Configuration

**Create new file: `backend/server.js`** (PostgreSQL version)
- Copy from `backend/server-sqlite.js`
- Replace `better-sqlite3` with `pg` (PostgreSQL client)
- Update database connection to use `DATABASE_URL` from environment

**Update `backend/package.json`**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server-sqlite.js"
  },
  "dependencies": {
    "pg": "^8.11.0",
    "better-sqlite3": "^9.4.0"
  }
}
```

**Create `backend/setup-db-postgres.js`**
- PostgreSQL version of database setup
- Will run once on Render to initialize database

---

## Step 2: Deploy Backend to Render

### Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - Name: `radio-station-db`
   - Database: `radio_station`
   - User: `radio_admin`
   - Region: Choose closest to Kuwait (Europe - Frankfurt)
4. Click **"Create Database"**
5. **Copy the "External Database URL"** - You'll need this!

### Deploy Backend Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (or upload code)
3. Fill in:
   - Name: `radio-station-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Instance Type: `Free`
4. Add Environment Variables:
   - `DATABASE_URL` = (paste External Database URL from above)
   - `JWT_SECRET` = `radio-station-workflow-secret-key-2026`
   - `PORT` = `5000`
5. Click **"Create Web Service"**
6. **Copy the deployed URL** (e.g., `https://radio-station-backend.onrender.com`)

### Initialize Database

1. After deployment, go to Render dashboard
2. Open your web service
3. Click **"Shell"** tab
4. Run: `node setup-db-postgres.js`
5. Verify users created successfully

---

## Step 3: Deploy Frontend to Netlify

### Update Frontend API URLs

**Edit `frontend/src/components/Login.js`**
```javascript
// Change from:
const response = await fetch('http://localhost:5000/api/login', {

// To:
const response = await fetch('https://radio-station-backend.onrender.com/api/login', {
```

**Update all fetch calls in:**
- `Dashboard.js`
- `RequestModal.js`
- `NewRequestModal.js`
- `Notifications.js`

**Search and replace:**
- Find: `http://localhost:5000`
- Replace: `https://radio-station-backend.onrender.com` (your actual Render URL)

### Build Frontend

```bash
cd frontend
npm run build
```

This creates a `build/` folder with production files.

### Deploy to Netlify

**Option 1: Drag & Drop (Easiest)**
1. Go to https://app.netlify.com
2. Drag the `frontend/build` folder to the upload area
3. Done! Netlify will give you a URL

**Option 2: GitHub Integration (Recommended)**
1. Push code to GitHub
2. Go to Netlify → **"Add new site"** → **"Import existing project"**
3. Connect GitHub repository
4. Configure:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/build`
5. Click **"Deploy"**

### Configure Netlify Settings

1. Go to **Site settings** → **Build & deploy**
2. Set environment variables (if needed)
3. Go to **Domain settings**
4. Add custom domain (optional): `radio-requests.moi.gov.kw`

---

## Step 4: Update Backend CORS

**Edit `backend/server.js`**
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-netlify-site.netlify.app',  // Add your Netlify URL
    'https://radio-requests.moi.gov.kw'       // Add custom domain if applicable
  ],
  credentials: true
}));
```

Redeploy backend on Render after this change.

---

## Step 5: Testing

### Test Checklist
- [ ] Login with test accounts
- [ ] Create new folder request
- [ ] Approve as Level 1 (عيسى العنزي)
- [ ] Approve as Level 2 (مشعل سعود الزمنان)
- [ ] Approve as Level 3 (صادق خاجه)
- [ ] Check notifications
- [ ] Test decline functionality
- [ ] Verify email format in timeline
- [ ] Check mobile responsiveness
- [ ] Test with multiple users simultaneously

### Share URLs
- **Frontend**: `https://your-app.netlify.app`
- **Backend**: `https://radio-station-backend.onrender.com`

---

## Environment Variables Reference

### Backend (Render)
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=radio-station-workflow-secret-key-2026
PORT=5000
NODE_ENV=production
```

### Frontend (Netlify) - Optional
```
REACT_APP_API_URL=https://radio-station-backend.onrender.com
```

---

## Quick Deployment Checklist

### Before Deploying
- [ ] Test locally with both servers running
- [ ] Update all API URLs in frontend
- [ ] Create production `.env` files
- [ ] Remove test credentials from UI (optional)
- [ ] Test with production database

### Backend Deployment
- [ ] Create PostgreSQL database on Render
- [ ] Deploy backend web service
- [ ] Set environment variables
- [ ] Run database setup script
- [ ] Test API endpoints

### Frontend Deployment
- [ ] Update API URLs to production backend
- [ ] Build production bundle (`npm run build`)
- [ ] Deploy to Netlify
- [ ] Test all features
- [ ] Update CORS on backend

### Post-Deployment
- [ ] Test login with all 4 roles
- [ ] Create sample request
- [ ] Test full approval workflow
- [ ] Check notifications work
- [ ] Verify mobile responsiveness
- [ ] Share URL with team

---

## Troubleshooting

### Frontend can't reach backend
- Check CORS settings in backend
- Verify backend URL is correct in frontend
- Check Render backend is running (not sleeping)

### Database connection failed
- Verify `DATABASE_URL` is correct in Render
- Check PostgreSQL instance is running
- Ensure setup script was run successfully

### Build fails on Netlify
- Check Node version compatibility
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Render free tier limitations
- Backend sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Consider upgrading for production use

---

## Production Recommendations

1. **Custom Domain**: Set up `radio-requests.moi.gov.kw`
2. **SSL Certificate**: Automatic with Netlify/Render
3. **Monitoring**: Set up Uptime Robot or similar
4. **Backups**: Enable automatic database backups on Render
5. **Upgrade Plans**: Consider paid tiers for 24/7 uptime
6. **Error Tracking**: Add Sentry or similar service
7. **Analytics**: Add Google Analytics (optional)

---

## Team Testing Guidelines

### Share with Team
1. Send Netlify URL to team
2. Provide test credentials:
   - Requester: 10001 / password123
   - Level 1: 20001 / password123
   - Level 2: 30001 / password123
   - Level 3: 40001 / password123

### Testing Scenarios
1. **Happy Path**: Create → Approve L1 → Approve L2 → Approve L3
2. **Decline Path**: Create → Decline at any level
3. **Multiple Requests**: Create several requests simultaneously
4. **Notifications**: Check all users see correct notifications
5. **Mobile**: Test on phones/tablets

### Feedback Collection
- UI/UX improvements
- Translation fixes
- Performance issues
- Feature requests
- Bug reports

---

## Expected Timeline

| Task | Time |
|------|------|
| Setup Render accounts | 10 min |
| Create PostgreSQL database | 5 min |
| Deploy backend to Render | 15 min |
| Update frontend API URLs | 10 min |
| Deploy frontend to Netlify | 10 min |
| Testing & fixes | 30-60 min |
| **Total** | **1.5-2 hours** |

---

## Support & Resources

- **Netlify Docs**: https://docs.netlify.com
- **Render Docs**: https://render.com/docs
- **PostgreSQL Connection**: Check Render dashboard for connection string
- **Logs**: Both platforms provide real-time logs in dashboard

---

**Ready for tomorrow's deployment!** 🚀

Follow this guide step-by-step and you'll have the system live for team testing.
