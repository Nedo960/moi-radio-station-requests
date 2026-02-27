@echo off
echo ========================================
echo   MOI Radio Station - Vercel Deployment
echo ========================================
echo.

echo Opening Vercel Dashboard...
start "" "https://vercel.com/new"

echo.
echo ========================================
echo   Quick Deployment Steps:
echo ========================================
echo.
echo 1. Select your GitHub repo: moi-radio-station-requests
echo 2. Set Root Directory to: frontend
echo 3. Build Command: npm run build
echo 4. Output Directory: build
echo 5. Add Environment Variable:
echo    REACT_APP_API_URL = https://your-project.vercel.app/api
echo 6. Click Deploy!
echo.
echo Full instructions in VERCEL_DEPLOY.md
echo.
pause

echo Opening deployment guide...
start "" "VERCEL_DEPLOY.md"
