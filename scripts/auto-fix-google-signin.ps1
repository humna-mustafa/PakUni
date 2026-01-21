# PakUni Google Account Auto-Setup Script (PowerShell)
# Automatically adds Google Account to device via ADB
# Run as Administrator

Write-Host "🔧 PakUni Google Account Auto-Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if ADB is available
if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ADB not found in PATH!" -ForegroundColor Red
    Write-Host "Install Android SDK Platform Tools or add to PATH"
    exit 1
}

# Check if device is connected
$devices = adb devices | Select-Object -Skip 1
$connectedDevice = $devices | Where-Object { $_ -match "device$" } | Select-Object -First 1

if (-not $connectedDevice) {
    Write-Host "❌ No Android device connected!" -ForegroundColor Red
    Write-Host "Connect device via USB and enable USB Debugging" -ForegroundColor Yellow
    exit 1
}

$deviceId = ($connectedDevice -split "`t")[0]
Write-Host "✅ Device found: $deviceId" -ForegroundColor Green
Write-Host ""

# Step 1: Clear Google Play Services data
Write-Host "📋 Step 1: Preparing Google Play Services..." -ForegroundColor Yellow
adb shell pm clear com.google.android.gms 2>$null | Out-Null
adb shell am force-stop com.google.android.gms 2>$null | Out-Null
Start-Sleep -Seconds 2

# Step 2: Clear PakUni data
Write-Host "📋 Step 2: Clearing PakUni cache for fresh start..." -ForegroundColor Yellow
adb shell pm clear com.pakuni 2>$null | Out-Null

# Step 3: Open Google Account setup
Write-Host "📋 Step 3: Opening Google Account setup on device..." -ForegroundColor Yellow
adb shell am start -a android.settings.ADD_ACCOUNT_SETTINGS 2>$null | Out-Null
Start-Sleep -Seconds 3

# Step 4: Simulate tap on Google account option
Write-Host "📋 Step 4: Auto-selecting Google account type..." -ForegroundColor Yellow
adb shell input tap 540 400 2>$null | Out-Null
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "⏳ Account setup dialog should now be open on your device" -ForegroundColor Cyan
Write-Host "📱 Please complete these steps on your phone:" -ForegroundColor Cyan
Write-Host "   1️⃣  Enter your Google email address" -ForegroundColor White
Write-Host "   2️⃣  Enter your Google password" -ForegroundColor White
Write-Host "   3️⃣  Accept all permission requests" -ForegroundColor White
Write-Host "   4️⃣  Tap 'Continue' to finish setup" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Waiting 60 seconds for you to complete setup on device..." -ForegroundColor Yellow

# Progress bar
for ($i = 60; $i -gt 0; $i--) {
    Write-Progress -Activity "Waiting for account setup" -Status "$i seconds remaining" -PercentComplete ((60-$i)/60*100)
    Start-Sleep -Seconds 1
}
Write-Progress -Activity "Waiting for account setup" -Completed

Write-Host ""
Write-Host "🔍 Verifying Google Account was added..." -ForegroundColor Yellow
$accountList = adb shell cmd account list 2>$null
if ($accountList -match "google") {
    Write-Host "✅ Google Account successfully added!" -ForegroundColor Green
    Write-Host "Account(s) found: " -ForegroundColor Green
    $accountList | ForEach-Object { Write-Host "  • $_" -ForegroundColor Green }
} else {
    Write-Host "⚠️  Could not auto-verify account" -ForegroundColor Yellow
    Write-Host "Manual verification: Settings → Accounts → Google" -ForegroundColor Yellow
}

# Step 5: Restart Google services
Write-Host ""
Write-Host "🔄 Restarting Google Play Services..." -ForegroundColor Yellow
adb shell am startservice com.google.android.gms/.chimera.GmsChimeraService 2>$null | Out-Null
Start-Sleep -Seconds 3

# Step 6: Relaunch PakUni
Write-Host "🚀 Relaunching PakUni app..." -ForegroundColor Yellow
adb shell am start -n com.pakuni/com.pakuni.MainActivity 2>$null | Out-Null
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. You should see PakUni opening on your device" -ForegroundColor White
Write-Host "2. Tap the Google Sign-In button" -ForegroundColor White
Write-Host "3. It should now work! 🎉" -ForegroundColor White
Write-Host ""
Write-Host "If still having issues:" -ForegroundColor Yellow
Write-Host "• Make sure Google Account appears in: Settings → Accounts" -ForegroundColor White
Write-Host "• Restart your phone completely and try again" -ForegroundColor White
Write-Host "• Use Email/Password login as alternative" -ForegroundColor White
Write-Host ""

# Optional: Show more diagnostics
Write-Host ""
Write-Host "📊 Device diagnostics:" -ForegroundColor Cyan
Write-Host "Device ID: $deviceId" -ForegroundColor Gray
$gmsVersion = adb shell dumpsys package com.google.android.gms 2>$null | Select-String "versionName" | Select-Object -First 1
Write-Host "GMS Version: $gmsVersion" -ForegroundColor Gray
