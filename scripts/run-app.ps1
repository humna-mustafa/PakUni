#!/usr/bin/env powershell
# PakUni App Launcher Script
# This script sets up and runs the PakUni React Native app with proper configuration

$ErrorActionPreference = "Continue"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "PakUni React Native App Launcher" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if emulator is running
Write-Host "[1/5] Checking emulator..." -ForegroundColor Yellow
$devices = adb devices | Select-String -Pattern "emulator|device" | Where-Object { $_ -notmatch "List" }

if ($devices.Count -eq 0) {
    Write-Host "⚠️  No emulator detected. Please start an Android emulator first." -ForegroundColor Red
    Write-Host "   Start Android Studio and launch an emulator, then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Emulator is running" -ForegroundColor Green
Write-Host ""

# Kill any existing Metro bundler
Write-Host "[2/5] Cleaning up existing processes..." -ForegroundColor Yellow
try {
    $listeners = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
    if ($listeners) {
        $pids = $listeners | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            if ($pid -and $pid -ne 0) {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        Start-Sleep -Seconds 2
    }
    Write-Host "✓ Packager port cleaned (8081)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not auto-clean port 8081. Continuing..." -ForegroundColor Yellow
}
Write-Host ""

# Setup port forwarding
Write-Host "[3/5] Setting up port forwarding..." -ForegroundColor Yellow
adb reverse tcp:8081 tcp:8081
Write-Host "✓ Port forwarding configured (localhost:8081 -> emulator:8081)" -ForegroundColor Green
Write-Host ""

# Start Metro bundler in background
Write-Host "[4/5] Starting Metro bundler..." -ForegroundColor Yellow
Start-Process -WorkingDirectory (Get-Location) -FilePath "cmd.exe" -ArgumentList @(
    "/c",
    "npm",
    "start",
    "--",
    "--host",
    "0.0.0.0",
    "--port",
    "8081",
    "--reset-cache"
) -NoNewWindow -PassThru
Start-Sleep -Seconds 5
Write-Host "✓ Metro bundler started" -ForegroundColor Green
Write-Host ""

# Install and run the app
Write-Host "[5/5] Building and installing app..." -ForegroundColor Yellow
npm run android

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✓ App should be running now!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tips:" -ForegroundColor Cyan
Write-Host "  • Press 'r' in Metro console to reload the app" -ForegroundColor Yellow
Write-Host "  • Press 'd' in Metro console to open Dev Menu" -ForegroundColor Yellow
Write-Host "  • Check emulator screen for any errors" -ForegroundColor Yellow
Write-Host ""
