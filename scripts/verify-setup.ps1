#!/usr/bin/env powershell
# PakUni Setup Verification Script
# Checks all prerequisites for running the app

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "PakUni Setup Verification" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$issues = 0

# Check 1: Node.js installed
Write-Host "[1/8] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js NOT found. Please install from nodejs.org" -ForegroundColor Red
    $issues++
}

# Check 2: npm installed
Write-Host "[2/8] Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm NOT found" -ForegroundColor Red
    $issues++
}

# Check 3: React Native CLI
Write-Host "[3/8] Checking React Native..." -ForegroundColor Yellow
try {
    $rnVersion = npx react-native --version
    Write-Host "✓ React Native available: $rnVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ React Native NOT accessible" -ForegroundColor Red
    $issues++
}

# Check 4: Android SDK/ADB
Write-Host "[4/8] Checking Android SDK (adb)..." -ForegroundColor Yellow
try {
    $adbVersion = adb version | Select-String "Android Debug Bridge"
    Write-Host "✓ ADB installed" -ForegroundColor Green
} catch {
    Write-Host "✗ ADB NOT found. Please check Android SDK installation" -ForegroundColor Red
    $issues++
}

# Check 5: Emulator connection
Write-Host "[5/8] Checking emulator connection..." -ForegroundColor Yellow
$devices = adb devices | Select-String -Pattern "emulator|device" | Where-Object { $_ -notmatch "List" }
if ($devices.Count -gt 0) {
    Write-Host "✓ Emulator/Device connected:" -ForegroundColor Green
    $devices | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
} else {
    Write-Host "⚠ No emulator/device connected" -ForegroundColor Yellow
    Write-Host "  → Start Android emulator from Android Studio" -ForegroundColor Yellow
}

# Check 6: Port 8081 availability
Write-Host "[6/8] Checking port 8081..." -ForegroundColor Yellow
try {
    $portCheck = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
    if ($portCheck) {
        Write-Host "⚠ Port 8081 is in use" -ForegroundColor Yellow
        Write-Host "  → Process: " $portCheck.OwningProcess -ForegroundColor Yellow
        Write-Host "  → Solution: Kill Metro bundler (Ctrl+C)" -ForegroundColor Yellow
    } else {
        Write-Host "✓ Port 8081 is available" -ForegroundColor Green
    }
} catch {
    Write-Host "✓ Port 8081 is available" -ForegroundColor Green
}

# Check 7: Project dependencies
Write-Host "[7/8] Checking project dependencies..." -ForegroundColor Yellow
$nodeModules = Test-Path "node_modules"
if ($nodeModules) {
    Write-Host "✓ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "⚠ node_modules missing" -ForegroundColor Yellow
    Write-Host "  → Run: npm install" -ForegroundColor Yellow
}

# Check 8: Android build files
Write-Host "[8/8] Checking Android build files..." -ForegroundColor Yellow
$androidBuild = Test-Path "android/app/build.gradle"
if ($androidBuild) {
    Write-Host "✓ Android build files present" -ForegroundColor Green
} else {
    Write-Host "✗ Android build files missing" -ForegroundColor Red
    $issues++
}

# Summary
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
if ($issues -eq 0) {
    Write-Host "OK All checks passed! Ready to run." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open Terminal 1: npm start" -ForegroundColor Yellow
    Write-Host "2. Open Terminal 2: .\scripts\run-app.ps1" -ForegroundColor Yellow
} else {
    Write-Host "FAILED Found $issues issue(s). Please fix above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Cyan
    Write-Host "- Install Node.js from nodejs.org" -ForegroundColor Yellow
    Write-Host "- Install Android Studio" -ForegroundColor Yellow
    Write-Host "- Run: npm install" -ForegroundColor Yellow
    Write-Host "- Start emulator from Android Studio" -ForegroundColor Yellow
}
Write-Host "=====================================" -ForegroundColor Cyan
