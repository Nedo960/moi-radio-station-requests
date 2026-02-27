# 🚀 Deploy to Vercel - Simple Guide

Your code is ready! Follow these steps to deploy everything to Vercel.

---

## Part 1: Deploy via Vercel Dashboard (10 minutes)

### Step 1: Go to Vercel Dashboard

1. **Open:** https://vercel.com/new
2. **Click:** "Import Git Repository"
3. **Select:** Your GitHub repo `moi-radio-station-requests`
4. **Click:** "Import"

### Step 2: Configure Project Settings

**Framework Preset:** Other

**Root Directory:** `frontend` (click "Edit" and set this)

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```bash
build
```

**Install Command:**
```bash
npm install
```

### Step 3: Add Environment Variable

Click "Environment Variables" dropdown

Add this variable:
```
Name: REACT_APP_API_URL
Value: https://YOUR-PROJECT-NAME.vercel.app/api
```

⚠️ **NOTE:** You'll update this URL after deployment

Click **"Deploy"**

---

## Part 2: Add Backend API (5 minutes)

After frontend deploys:

### Step 1: Create API Directory

1. In Vercel dashboard, go to your project
2. Click "Settings" → "General"
3. Note your project name (e.g., `moi-radio-station-requests`)

### Step 2: Add Backend to GitHub

The backend is already in your repo under `/backend`!

Vercel will automatically detect it as serverless functions.

### Step 3: Create `vercel.json` in Root

This file is already created! It tells Vercel how to handle backend requests.

### Step 4: Redeploy

1. In Vercel dashboard → "Deployments"
2. Click "Redeploy" (top right)
3. Wait 2-3 minutes

---

## Part 3: Add Vercel Postgres Database (10 minutes)

### Step 1: Create Database

1. In your Vercel project dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Choose **"Postgres"**
5. Accept defaults
6. Click "Create"

**Wait 2-3 minutes for database to provision**

### Step 2: Connect Database to Project

1. Database will show "Connected to: [your-project]"
2. Click on database name
3. Go to ".env.local" tab
4. You'll see environment variables like:
   ```
   POSTGRES_URL="postgres://..."
   POSTGRES_PRISMA_URL="postgres://..."
   POSTGRES_URL_NON_POOLING="postgres://..."
   ```

### Step 3: Add to Your Project

1. Go back to your project
2. Click "Settings" → "Environment Variables"
3. Add these variables:

```
DATABASE_URL = [paste POSTGRES_URL value]
JWT_SECRET = radio-station-workflow-secret-key-2026
NODE_ENV = production
PORT = 5000
```

### Step 4: Initialize Database

You need to run the setup script. Two options:

**Option A: Via Vercel CLI (if it works)**
```bash
vercel env pull
npm run setup-db
```

**Option B: Via Database Query Tool**
1. In Vercel → Storage → Your Database
2. Click "Query" tab
3. Copy contents of `backend/setup-db-postgres.js` SQL statements
4. Run them manually

---

## Part 4: Update API URL (2 minutes)

Now that backend is deployed:

1. Copy your Vercel project URL (e.g., `https://moi-radio-requests.vercel.app`)
2. Go to Settings → Environment Variables
3. Update `REACT_APP_API_URL` to:
   ```
   https://YOUR-PROJECT.vercel.app/api
   ```
4. Click "Redeploy"

---

## Part 5: Test Your App! (5 minutes)

1. **Open your Vercel URL**
2. **Login with:** `10001` / `password123`
3. **Create a request**
4. **Logout and login as:** `20001` / `password123`
5. **Approve the request**

---

## 🌐 Add Custom Domain (Optional - Later)

When you're ready:

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `radio-requests.moi.gov.kw`
3. Follow DNS instructions
4. Vercel auto-configures SSL

---

## ⚠️ Important Notes

### Vercel Limits (Hobby/Free Plan):
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Serverless Functions (12 sec timeout)
- ⚠️ Postgres: 256 MB storage, 60 hours compute/month

### If You Need More:
- **Pro Plan:** $20/month
  - 1 TB bandwidth
  - Unlimited Postgres compute
  - Team collaboration

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify `Root Directory` is set to `frontend`
- Check all dependencies are in `package.json`

### API Not Working
- Verify backend files are in repo
- Check environment variables are set
- Check API routes in `vercel.json`

### Database Connection Error
- Verify DATABASE_URL is set correctly
- Check database is "Active" in Vercel Storage
- Run database initialization script

### CORS Errors
- Backend already configured for Vercel
- Check `server.js` has correct CORS origins
- Redeploy after any backend changes

---

## 📊 Your Deployment URLs

After deployment, you'll have:

**Frontend:** `https://your-project.vercel.app`
**Backend API:** `https://your-project.vercel.app/api/*`
**Database:** Managed in Vercel Storage

**All in one place!** ✨

---

## 🎉 Next Steps

1. Test all workflows
2. Share URL with team
3. Set up custom domain
4. Monitor usage in Vercel dashboard
5. Set up team access (Settings → Members)

---

**Need help?** Check Vercel docs: https://vercel.com/docs
