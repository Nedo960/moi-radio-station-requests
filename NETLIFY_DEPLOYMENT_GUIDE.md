# Complete Deployment Guide: Netlify + Render
## Radio Station Request System - MOI

This guide will walk you through deploying the Radio Station Request System to production using **Netlify** for the frontend and **Render** for the backend and database.

**Total Time:** 1.5-2 hours
**Cost:** $0 (Free tiers on both platforms)

---

## 📋 Prerequisites

Before you begin, ensure you have:

- [ ] GitHub account (to push your code)
- [ ] Netlify account - Sign up at https://netlify.com (free)
- [ ] Render account - Sign up at https://render.com (free)
- [ ] Git installed on your computer
- [ ] Code is ready in the `raido station request folder`

---

## Part 1: Deploy Backend to Render (45 minutes)

### Step 1: Create PostgreSQL Database (10 minutes)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click **"New +"** button (top right)
   - Select **"PostgreSQL"**

2. **Configure Database**
   - **Name:** `radio-station-db`
   - **Database:** `radio_station`
   - **User:** `radio_admin`
   - **Region:** Choose **Europe (Frankfurt)** - closest to Kuwait
   - **PostgreSQL Version:** 16 (default)
   - **Instance Type:** Free
   - Click **"Create Database"**

3. **Wait for Database to Initialize** (2-3 minutes)
   - Status will change from "Creating" to "Available"

4. **Copy Database Connection URL** ⚠️ **IMPORTANT**
   - Once available, scroll down to "Connections"
   - Find **"Internal Database URL"** (NOT External)
   - Click the copy icon
   - It looks like: `postgresql://radio_admin:xxxxx@dpg-xxxxx/radio_station`
   - **Save this somewhere safe** - you'll need it next

---

### Step 2: Push Code to GitHub (15 minutes)

If your code isn't already on GitHub:

1. **Initialize Git Repository**
   ```bash
   cd "raido station request folder"
   git init
   git add .
   git commit -m "Initial commit - Radio Station Request System"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `moi-radio-station-requests`
   - Keep it Private or Public (your choice)
   - Do NOT initialize with README
   - Click **"Create repository"**

3. **Push Code to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/moi-radio-station-requests.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 3: Deploy Backend Web Service (20 minutes)

1. **Create New Web Service**
   - Back in Render dashboard
   - Click **"New +"** → **"Web Service"**

2. **Connect GitHub Repository**
   - Click **"Connect account"** under GitHub
   - Authorize Render to access your GitHub
   - Search for your repository: `moi-radio-station-requests`
   - Click **"Connect"**

3. **Configure Web Service**
   Fill in the following:

   | Field | Value |
   |-------|-------|
   | **Name** | `radio-station-backend` |
   | **Region** | Europe (Frankfurt) |
   | **Branch** | main |
   | **Root Directory** | `backend` |
   | **Environment** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free |

4. **Add Environment Variables** ⚠️ **CRITICAL**
   - Scroll down to **"Environment Variables"**
   - Click **"Add Environment Variable"**
   - Add these 4 variables:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | (Paste the Internal Database URL from Step 1) |
   | `JWT_SECRET` | `radio-station-workflow-secret-key-2026` |
   | `PORT` | `5000` |
   | `NODE_ENV` | `production` |

5. **Deploy**
   - Click **"Create Web Service"**
   - Render will start building your backend
   - This takes 3-5 minutes
   - Watch the logs - you should see: "Server running on port 5000"

6. **Copy Backend URL** 📝
   - Once deployed, you'll see a URL at the top:
   - Example: `https://radio-station-backend.onrender.com`
   - **Copy this URL** - you'll need it for frontend deployment

---

### Step 4: Initialize Database with User Accounts (5 minutes)

1. **Open Shell in Render**
   - In your backend service page
   - Click **"Shell"** tab (left sidebar)
   - A terminal will open

2. **Run Database Setup Script**
   ```bash
   npm run setup-db
   ```

3. **Verify Success**
   - You should see:
     ```
     ✅ Users table created
     ✅ Folder requests table created
     ✅ History table created
     ✅ Indexes created
     ✅ Created user: Quran Station (10001)
     ✅ Created user: عيسى العنزي (20001)
     ✅ Created user: مشعل سعود الزمنان (30001)
     ✅ Created user: Eng. صادق (40001)
     ```

4. **Test Backend API**
   - Open: `https://your-backend-url.onrender.com/api/health`
   - You should see: `{"status":"ok"}`
   - ✅ Backend is ready!

---

## Part 2: Deploy Frontend to Netlify (45 minutes)

### Step 5: Update CORS Settings in Backend (5 minutes)

Before deploying frontend, we need to allow it to connect to the backend.

1. **Edit `backend/server.js` in your code**
   - Find the CORS configuration (around line 20-22)
   - Update it to:

   ```javascript
   // Middleware
   app.use(cors({
     origin: [
       'http://localhost:3000',  // For local development
       'https://radio-station-backend.onrender.com',  // Backend itself
       // Netlify domain will be added after deployment
     ],
     credentials: true
   }));
   app.use(express.json());
   ```

2. **Commit and Push**
   ```bash
   git add backend/server.js
   git commit -m "Add CORS configuration for production"
   git push
   ```

   Render will automatically redeploy (takes 2-3 minutes).

---

### Step 6: Deploy Frontend to Netlify (30 minutes)

#### Option A: Drag & Drop (Easiest - 10 minutes)

1. **Build Frontend Locally**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

   This creates a `build/` folder.

2. **Configure API URL**
   - Before building, create `frontend/.env`:
   ```
   REACT_APP_API_URL=https://YOUR-BACKEND-URL.onrender.com/api
   ```
   Replace with your actual backend URL!

   Rebuild:
   ```bash
   npm run build
   ```

3. **Deploy to Netlify**
   - Go to https://app.netlify.com
   - Drag the `frontend/build` folder to the upload zone
   - Netlify will deploy it instantly
   - You'll get a URL like: `https://random-name.netlify.app`

4. **Set Environment Variable in Netlify**
   - In Netlify dashboard, click your site
   - Go to **Site settings** → **Environment variables**
   - Click **"Add a variable"**
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-backend-url.onrender.com/api`
   - Click **"Save"**
   - Click **"Trigger deploy"** to rebuild

---

#### Option B: GitHub Integration (Recommended - 15 minutes)

1. **Push Frontend to GitHub** (if not already)
   - Your frontend is in the same repo under `frontend/` directory

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click **"Add new site"** → **"Import an existing project"**
   - Select **"GitHub"**
   - Authorize Netlify
   - Choose your repository: `moi-radio-station-requests`

3. **Configure Build Settings**

   | Field | Value |
   |-------|-------|
   | **Branch** | main |
   | **Base directory** | `frontend` |
   | **Build command** | `npm run build` |
   | **Publish directory** | `frontend/build` |

4. **Add Environment Variable**
   - Click **"Show advanced"**
   - Click **"New variable"**
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-backend-url.onrender.com/api`

5. **Deploy**
   - Click **"Deploy site"**
   - Build takes 3-5 minutes
   - Watch the build logs
   - Once complete, you'll get a URL

---

### Step 7: Update CORS with Netlify URL (5 minutes)

1. **Copy Netlify URL**
   - Example: `https://moi-radio-requests.netlify.app`

2. **Update Backend CORS**
   - Edit `backend/server.js`:

   ```javascript
   app.use(cors({
     origin: [
       'http://localhost:3000',
       'https://radio-station-backend.onrender.com',
       'https://YOUR-NETLIFY-SITE.netlify.app',  // Add this line
     ],
     credentials: true
   }));
   ```

3. **Commit and Push**
   ```bash
   git add backend/server.js
   git commit -m "Add Netlify URL to CORS"
   git push
   ```

   Render will redeploy automatically.

---

### Step 8: Custom Domain (Optional - 10 minutes)

If you have a custom domain like `radio-requests.moi.gov.kw`:

1. **In Netlify Dashboard**
   - Go to **Domain settings**
   - Click **"Add custom domain"**
   - Enter: `radio-requests.moi.gov.kw`
   - Click **"Verify"**

2. **Configure DNS**
   - Netlify will give you DNS records to add
   - Add them in your domain registrar
   - Wait 10-60 minutes for DNS propagation

3. **Update CORS Again**
   - Add custom domain to backend CORS list
   - Commit and push

---

## Part 3: Testing & Verification (15 minutes)

### Final Checklist

Test these scenarios in order:

#### 1. Login Test
- [ ] Open Netlify URL in browser
- [ ] Login with: `10001` / `password123`
- [ ] Should see dashboard

#### 2. Create Request (Requester)
- [ ] Logged in as `10001`
- [ ] Click "طلب جديد" (New Request)
- [ ] Fill in form:
  - Station: Quran Station (auto-filled)
  - Program: القرآن الكريم
  - Broadcast Date: Today's date
  - Episode: EP-001
  - Presenter: محمد أحمد
  - Notes: اختبار النظام
- [ ] Submit
- [ ] Should see request in table with status "pending_level1"

#### 3. Level 1 Approval
- [ ] Logout
- [ ] Login as `20001` / `password123` (عيسى العنزي)
- [ ] Click on the request
- [ ] Add comment: "موافق - يرسل للمراقب"
- [ ] Click "الموافقة" (Approve)
- [ ] Status should change to "pending_level2"

#### 4. Level 2 Approval
- [ ] Logout
- [ ] Login as `30001` / `password123` (مشعل سعود الزمنان)
- [ ] Approve with comment: "موافق - يرسل لرئيس الأرشيف"
- [ ] Status → "pending_level3"

#### 5. Level 3 Approval
- [ ] Logout
- [ ] Login as `40001` / `password123` (Eng. صادق)
- [ ] Approve with comment: "تم الاعتماد النهائي"
- [ ] Status → "approved"
- [ ] Request should be marked complete

#### 6. Notifications Test
- [ ] Login as requester `10001`
- [ ] Check notifications bell (top right)
- [ ] Should see notification about approval
- [ ] Click "عرض الكل" to see all notifications

#### 7. Decline Test
- [ ] Create another request as `10001`
- [ ] Login as `20001`
- [ ] Decline with comment: "معلومات غير كاملة"
- [ ] Status should be "declined"

#### 8. Mobile Test
- [ ] Open site on phone
- [ ] Test login
- [ ] Test viewing requests
- [ ] Test creating request
- [ ] UI should be responsive

---

## 🎯 Success Criteria

Your deployment is successful if:

✅ All 4 user types can login
✅ Requests can be created
✅ Full approval workflow works (L1 → L2 → L3)
✅ Notifications appear correctly
✅ Timeline shows all approval steps
✅ Arabic text displays properly
✅ Works on desktop AND mobile
✅ No console errors in browser

---

## 📝 Important URLs to Save

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend (Netlify)** | https://your-site.netlify.app | User-facing website |
| **Backend (Render)** | https://your-backend.onrender.com | API server |
| **Database (Render)** | (Internal URL in Render dashboard) | PostgreSQL database |
| **GitHub Repo** | https://github.com/you/moi-radio-station-requests | Source code |

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Network Error" or "Failed to fetch"
**Cause:** CORS not configured properly
**Solution:**
1. Check backend CORS includes Netlify URL
2. Check Render logs: `https://dashboard.render.com` → Your service → Logs
3. Verify backend is running (green status in Render)

### Issue 2: Blank page on Netlify
**Cause:** Environment variable not set
**Solution:**
1. Check Netlify environment variables
2. Verify `REACT_APP_API_URL` is set correctly
3. Trigger new deploy in Netlify

### Issue 3: Backend gives "DATABASE_URL not defined"
**Cause:** Environment variable missing in Render
**Solution:**
1. Go to Render → Your service → Environment
2. Verify `DATABASE_URL` is set
3. Copy from PostgreSQL database "Internal Database URL"

### Issue 4: Login works but can't create requests
**Cause:** Database not initialized
**Solution:**
1. Open Render Shell
2. Run: `npm run setup-db`
3. Check for success messages

### Issue 5: Backend "sleeps" after 15 minutes
**This is normal for Render free tier**
- First request after sleep takes 30-60 seconds to wake up
- Subsequent requests are fast
- For production, consider upgrading to paid tier ($7/month)

### Issue 6: Arabic text shows as "??????"
**Cause:** Font or encoding issue
**Solution:**
1. Check browser encoding is UTF-8
2. Verify CSS includes proper font declarations
3. Database should use UTF-8 encoding (PostgreSQL default)

---

## 🚀 Next Steps

### For Production Use:

1. **Change Default Passwords**
   - Create new users with secure passwords
   - Remove demo accounts

2. **Set Up Custom Domain**
   - `radio-requests.moi.gov.kw`

3. **Enable SSL**
   - Netlify provides free SSL automatically
   - Render also has auto-SSL

4. **Set Up Monitoring**
   - Use Uptime Robot (free)
   - Monitor frontend and backend health endpoints

5. **Database Backups**
   - Render free tier: no automatic backups
   - Paid tier: automatic daily backups

6. **Upgrade to Paid Tiers** (Optional)
   - Render: $7/month for 24/7 uptime
   - Netlify: Free tier is usually sufficient

---

## 📞 Support Resources

- **Netlify Docs:** https://docs.netlify.com
- **Render Docs:** https://render.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## 🎉 You're Done!

Share these URLs with your team:
- **Production Site:** https://your-site.netlify.app
- **Test Accounts:**
  - Requester: 10001 / password123
  - Level 1: 20001 / password123
  - Level 2: 30001 / password123
  - Level 3: 40001 / password123

**Congratulations! Your Radio Station Request System is now live!** 🚀
