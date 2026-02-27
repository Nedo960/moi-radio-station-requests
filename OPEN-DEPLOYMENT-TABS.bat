@echo off
echo ========================================
echo   Opening Deployment URLs
echo ========================================
echo.

REM Open Render - Create Database
echo [1/5] Opening Render - Create Database...
start "" "https://dashboard.render.com/new/database"
timeout /t 2 /nobreak >nul

REM Open Render - Create Web Service
echo [2/5] Opening Render - Create Web Service...
start "" "https://dashboard.render.com/select-repo?type=web"
timeout /t 2 /nobreak >nul

REM Open Netlify
echo [3/5] Opening Netlify...
start "" "https://app.netlify.com/start"
timeout /t 2 /nobreak >nul

REM Open deployment guide
echo [4/5] Opening Deployment Guide...
start "" "DEPLOY_NOW.md"
timeout /t 2 /nobreak >nul

REM Open GitHub
echo [5/5] Opening GitHub...
start "" "https://github.com"

echo.
echo ========================================
echo   All tabs opened!
echo ========================================
echo.
echo Follow DEPLOY_NOW.md for step-by-step instructions
echo.
pause
