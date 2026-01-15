# PakUni - Helper Scripts
# Run these in PowerShell from the PakUni folder

# ============================================
# CLEAN BUILD - Use when you have build errors
# ============================================
Write-Host "🧹 Cleaning PakUni build..." -ForegroundColor Cyan

# Stop Metro if running
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like "*Metro*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean node_modules
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
}

# Clean package-lock
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json"
}

# Clean Android build
if (Test-Path "android\.gradle") {
    Write-Host "Cleaning Gradle cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "android\.gradle"
}

if (Test-Path "android\app\build") {
    Write-Host "Cleaning app build..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "android\app\build"
}

# Clean Metro cache
if (Test-Path "$env:TEMP\metro-*") {
    Write-Host "Cleaning Metro cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "$env:TEMP\metro-*" -ErrorAction SilentlyContinue
}

# Reinstall dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "✅ Clean complete! Run 'npm start' then 'npx react-native run-android'" -ForegroundColor Green
