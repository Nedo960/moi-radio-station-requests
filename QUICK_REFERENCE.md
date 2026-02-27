# Quick Reference - Radio Station Request System

## 📌 Deployment Checklist

### ✅ Backend Deployment (Render)
- [ ] Create PostgreSQL database on Render
- [ ] Copy Internal Database URL
- [ ] Push code to GitHub
- [ ] Create Web Service on Render
- [ ] Set environment variables (DATABASE_URL, JWT_SECRET, PORT, NODE_ENV)
- [ ] Run `npm run setup-db` in Render Shell
- [ ] Test backend: `https://your-backend.onrender.com/api/health`
- [ ] Copy backend URL for frontend

### ✅ Frontend Deployment (Netlify)
- [ ] Set REACT_APP_API_URL environment variable in Netlify
- [ ] Deploy via GitHub integration or drag-and-drop
- [ ] Wait for build to complete
- [ ] Test frontend login
- [ ] Copy Netlify URL

### ✅ Final Configuration
- [ ] Update CORS in backend to include Netlify URL
- [ ] Test full workflow: create → approve L1 → L2 → L3
- [ ] Test notifications
- [ ] Test on mobile
- [ ] Share URLs with team

---

## 🔗 Important URLs

### Local Development
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production
- Frontend (Netlify): `https://your-site.netlify.app`
- Backend (Render): `https://your-backend.onrender.com`
- Backend Health Check: `https://your-backend.onrender.com/api/health`

---

## 🔐 Test Accounts

| Role | Employee # | Password | Arabic Name |
|------|-----------|----------|-------------|
| Requester | 10001 | password123 | Quran Station |
| Level 1 | 20001 | password123 | عيسى العنزي |
| Level 2 | 30001 | password123 | مشعل سعود الزمنان |
| Level 3 | 40001 | password123 | Eng. صادق |

---

## 🌐 Environment Variables

### Backend (Render)
```
DATABASE_URL=postgresql://user:pass@host:port/database
JWT_SECRET=radio-station-workflow-secret-key-2026
PORT=5000
NODE_ENV=production
```

### Frontend (Netlify)
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## 🛠️ Common Commands

### Local Development

#### Backend
```bash
cd backend
npm install               # Install dependencies
npm run dev              # Run with SQLite (local)
npm run setup-db-local   # Initialize SQLite database
npm start                # Run with PostgreSQL (production mode)
npm run setup-db         # Initialize PostgreSQL database
```

#### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm start            # Run development server (port 3000)
npm run build        # Build for production
```

### Production Deployment

#### Initial Setup
```bash
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Update Deployment
```bash
# Make changes
git add .
git commit -m "Update feature X"
git push origin main
# Render and Netlify auto-deploy on push
```

---

## 📊 API Endpoints

### Auth
- `POST /api/login` - Login with employee_number and password

### Requests
- `GET /api/requests` - Get all requests (filtered by role)
- `GET /api/requests/:id` - Get single request with history
- `POST /api/requests` - Create new request
- `POST /api/requests/:id/respond` - Approve or decline request

### Dashboard
- `GET /api/dashboard/stats` - Get statistics for current user

### Health
- `GET /api/health` - Check if backend is running

---

## 🔄 Workflow States

```
pending_level1 → (L1 approves) → pending_level2
pending_level2 → (L2 approves) → pending_level3
pending_level3 → (L3 approves) → approved

At any level: → (decline) → declined
```

---

## 🚨 Troubleshooting

### Frontend can't connect to backend
1. Check REACT_APP_API_URL is set in Netlify
2. Check CORS includes Netlify URL in backend
3. Check backend is running (green in Render dashboard)
4. Check browser console for errors

### Login fails
1. Check database was initialized: `npm run setup-db`
2. Check DATABASE_URL is correct in Render
3. Check backend logs in Render dashboard

### Changes not showing up
1. Frontend: Trigger new deploy in Netlify
2. Backend: Git push triggers auto-deploy on Render
3. Clear browser cache

### Backend sleeps (Render free tier)
- Normal behavior after 15 min of inactivity
- First request takes 30-60 seconds to wake up
- Consider paid tier ($7/month) for 24/7 uptime

---

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Mobile Chrome (Android 10+)

---

## 🔒 Security Notes

### Production Checklist
- [ ] Change JWT_SECRET to random string
- [ ] Use strong passwords for real user accounts
- [ ] Remove demo accounts
- [ ] Enable HTTPS (automatic on Netlify/Render)
- [ ] Set up database backups (Render paid tier)
- [ ] Monitor logs regularly

### CORS Configuration
Only allow trusted domains:
```javascript
app.use(cors({
  origin: [
    'https://radio-requests.moi.gov.kw',
    'https://your-site.netlify.app'
  ],
  credentials: true
}));
```

---

## 📈 Performance Tips

### Frontend
- Images are already optimized in the project
- React build is production-optimized
- Netlify serves with CDN automatically

### Backend
- Database indexes already configured
- Connection pooling enabled
- Render caches npm packages

---

## 💡 Feature Flags

Current features:
- ✅ Multi-level approval workflow
- ✅ Real-time notifications
- ✅ Request history/timeline
- ✅ Role-based access control
- ✅ Arabic UI support
- ✅ Responsive mobile design

Future enhancements (not implemented):
- ❌ Email notifications
- ❌ File upload attachments
- ❌ Advanced reporting
- ❌ Search/filter requests
- ❌ Export to PDF/Excel

---

## 📞 Getting Help

### Documentation
- Full deployment guide: `NETLIFY_DEPLOYMENT_GUIDE.md`
- Project summary: `PROJECT_SUMMARY.md`
- Code examples: `CODE_SNIPPETS.md`

### Platform Docs
- Netlify: https://docs.netlify.com
- Render: https://render.com/docs
- React: https://react.dev

### Logs & Debugging
- **Netlify Logs:** Site → Deploys → Click build → View logs
- **Render Logs:** Dashboard → Service → Logs tab
- **Browser Console:** F12 → Console tab

---

## 🎯 Testing Scenarios

### Happy Path
1. Login as 10001
2. Create request
3. Login as 20001 → Approve
4. Login as 30001 → Approve
5. Login as 40001 → Approve
6. Login as 10001 → See approved status

### Decline Path
1. Login as 10001
2. Create request
3. Login as 20001 → Decline with reason
4. Login as 10001 → See declined status

### Notifications
1. Create 3 requests as 10001
2. Login as 20001
3. See 3 notifications
4. Click bell icon
5. Mark as read

---

**Last Updated:** February 2026
**Version:** 1.0.0
