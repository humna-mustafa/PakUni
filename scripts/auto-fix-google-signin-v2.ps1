# PakUni Google Account Auto-Setup Script
# Automatically adds Google Account to device via ADB

Write-Host "PakUni Google Account Auto-Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if ADB is available
if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
    Write-Host "ADB not found in PATH!" -ForegroundColor Red
    exit 1
}

# Check if device is connected
$devices = adb devices | Select-Object -Skip 1
$connectedDevice = $devices | Where-Object { $_ -match "device" } | Select-Object -First 1

if (-not $connectedDevice) {
    Write-Host "No Android device connected!" -ForegroundColor Red
    exit 1
}

$deviceId = ($connectedDevice -split "`t")[0]
Write-Host "Device found: $deviceId" -ForegroundColor Green
Write-Host ""

# Step 1: Clear Google Play Services data
Write-Host "Step 1: Preparing Google Play Services..." -ForegroundColor Yellow
adb shell pm clear com.google.android.gms 2>$null | Out-Null
adb shell am force-stop com.google.android.gms 2>$null | Out-Null
Start-Sleep -Seconds 2

# Step 2: Clear PakUni data
Write-Host "Step 2: Clearing PakUni cache..." -ForegroundColor Yellow
adb shell pm clear com.pakuni 2>$null | Out-Null

# Step 3: Open Google Account setup
Write-Host "Step 3: Opening Google Account setup..." -ForegroundColor Yellow
adb shell am start -a android.settings.ADD_ACCOUNT_SETTINGS 2>$null | Out-Null
Start-Sleep -Seconds 3

# Step 4: Tap on Google option
Write-Host "Step 4: Auto-selecting Google account type..." -ForegroundColor Yellow
adb shell input tap 540 400 2>$null | Out-Null
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Account setup dialog is now open on your device" -ForegroundColor Cyan
Write-Host "Please complete these steps on your phone:" -ForegroundColor Cyan
Write-Host "  1. Enter your Google email address" -ForegroundColor White
Write-Host "  2. Enter your Google password" -ForegroundColor White
Write-Host "  3. Accept all permission requests" -ForegroundColor White
Write-Host "  4. Tap Continue to finish" -ForegroundColor White
Write-Host ""
Write-Host "Waiting 60 seconds for setup..." -ForegroundColor Yellow

# Wait for user to complete setup
Start-Sleep -Seconds 60

Write-Host ""
Write-Host "Verifying Google Account..." -ForegroundColor Yellow
$accountList = adb shell cmd account list 2>$null
Write-Host $accountList -ForegroundColor Green

# Step 5: Restart Google services
Write-Host ""
Write-Host "Restarting Google Play Services..." -ForegroundColor Yellow
adb shell am startservice com.google.android.gms/.chimera.GmsChimeraService 2>$null | Out-Null
Start-Sleep -Seconds 3

# Step 6: Relaunch PakUni
Write-Host "Relaunching PakUni app..." -ForegroundColor Yellow
adb shell am start -n com.pakuni/com.pakuni.MainActivity 2>$null | Out-Null
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now try Google Sign-In in PakUni" -ForegroundColor Cyan
Write-Host ""
Write-Host "If still having issues:" -ForegroundColor Yellow
Write-Host "  - Check Settings > Accounts for Google account" -ForegroundColor White
Write-Host "  - Restart your phone completely" -ForegroundColor White
Write-Host "  - Use Email/Password login as alternative" -ForegroundColor White
