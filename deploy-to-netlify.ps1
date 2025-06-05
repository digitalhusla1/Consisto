# 🚀 Quick Netlify Deployment Script
# Run this in PowerShell from your project directory

Write-Host "🚀 Starting Netlify Deployment Process..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from your project directory." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project directory confirmed" -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Check if netlify directory exists
if (-not (Test-Path "netlify/functions")) {
    Write-Host "❌ Error: netlify/functions directory not found!" -ForegroundColor Red
    Write-Host "Please ensure you have the netlify functions set up." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Netlify functions directory found" -ForegroundColor Green

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ Environment file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: .env file not found. Make sure to set REPLICATE_API_TOKEN in Netlify." -ForegroundColor Yellow
}

# Add all files to git
Write-Host "📦 Adding files to git..." -ForegroundColor Yellow
git add .

# Commit changes
$commitMessage = "Deploy: Ready for Netlify - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m $commitMessage

Write-Host "✅ Files committed to git" -ForegroundColor Green

# Check if remote exists
$remoteExists = git remote get-url origin 2>$null
if (-not $remoteExists) {
    Write-Host ""
    Write-Host "🔗 Git remote not configured. Please add your GitHub repository:" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/yourusername/your-repo-name.git" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then run: git push -u origin main" -ForegroundColor Cyan
} else {
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    Write-Host "✅ Code pushed to GitHub" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Your code is ready for Netlify deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://netlify.com" -ForegroundColor White
Write-Host "2. Click 'New site from Git'" -ForegroundColor White
Write-Host "3. Connect your GitHub repository" -ForegroundColor White
Write-Host "4. Build settings:" -ForegroundColor White
Write-Host "   - Build command: npm run build" -ForegroundColor Cyan
Write-Host "   - Publish directory: ." -ForegroundColor Cyan
Write-Host "5. Set environment variable:" -ForegroundColor White
Write-Host "   - REPLICATE_API_TOKEN = your_actual_token" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Open pre-deployment test: http://localhost:3002/pre-deployment-test.html" -ForegroundColor Magenta
