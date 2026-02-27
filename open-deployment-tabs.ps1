# PowerShell Script to Open All Deployment URLs
# Run this script to open all necessary tabs for deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Radio Station Request System" -ForegroundColor Cyan
Write-Host "  Deployment Helper Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Opening deployment URLs in your browser..." -ForegroundColor Yellow
Write-Host ""

# Wait a moment
Start-Sleep -Seconds 1

# Open Render - Create Database
Write-Host "[1/5] Opening Render - Create Database..." -ForegroundColor Green
Start-Process "https://dashboard.render.com/new/database"
Start-Sleep -Seconds 2

# Open Render - Dashboard (for later)
Write-Host "[2/5] Opening Render Dashboard..." -ForegroundColor Green
Start-Process "https://dashboard.render.com"
Start-Sleep -Seconds 2

# Open Netlify
Write-Host "[3/5] Opening Netlify..." -ForegroundColor Green
Start-Process "https://app.netlify.com/start"
Start-Sleep -Seconds 2

# Open deployment guide
Write-Host "[4/5] Opening Deployment Guide..." -ForegroundColor Green
$deployGuide = Join-Path $PSScriptRoot "DEPLOY_NOW.md"
Start-Process $deployGuide
Start-Sleep -Seconds 2

# Open GitHub repo (if exists)
Write-Host "[5/5] Opening GitHub..." -ForegroundColor Green
Start-Process "https://github.com"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All tabs opened!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Follow the instructions in DEPLOY_NOW.md" -ForegroundColor White
Write-Host "2. Start with Render (create database first)" -ForegroundColor White
Write-Host "3. Then deploy backend" -ForegroundColor White
Write-Host "4. Finally deploy frontend on Netlify" -ForegroundColor White
Write-Host ""
Write-Host "Good luck! 🚀" -ForegroundColor Green
Write-Host ""

# Keep window open
Read-Host "Press Enter to close this window"
