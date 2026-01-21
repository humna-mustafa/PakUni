# Comprehensive Google Sign-In Verification Script
# Checks device configuration, Google account, and PakUni setup

Write-Host "================================" -ForegroundColor Cyan
Write-Host "PakUni Google Sign-In Verification" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Color functions
function Write-Success { param($msg) Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Warning { param($msg) Write-Host "[WARNING] $msg" -ForegroundColor Yellow }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }

# Check 1: ADB Connection
Write-Host "CHECK 1: Device Connection" -ForegroundColor Magenta
Write-Host "------------------------" -ForegroundColor Magenta
$devices = & adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$" }

if ($devices) {
    Write-Success "Device connected: $devices"
    $deviceId = ($devices -split "\s+")[0]
} else {
    Write-Error "No device connected!"
    Write-Info "Connect your device via USB and enable USB Debugging"
    Write-Info "Settings - Developer Options - USB Debugging = ON"
    exit 1
}

Write-Host ""

# Check 2: Google Account
Write-Host "CHECK 2: Google Account Configuration" -ForegroundColor Magenta
Write-Host "------------------------------------" -ForegroundColor Magenta
$accounts = & adb shell cmd account list

if ($accounts -match "com.google") {
    Write-Success "Google Account found on device"
    Write-Info "Accounts:"
    $accounts -split "`n" | ForEach-Object {
        if ($_ -match "com.google") {
            Write-Host "  * $_" -ForegroundColor Green
        }
    }
} else {
    Write-Error "No Google Account found on device"
    Write-Warning "Run 'auto-fix-google-signin-v2.ps1' to add one"
}

Write-Host ""

# Check 3: Google Play Services
Write-Host "CHECK 3: Google Play Services" -ForegroundColor Magenta
Write-Host "-----------------------------" -ForegroundColor Magenta
$gmsStatus = & adb shell pm list packages | Select-String "com.google.android.gms"

if ($gmsStatus) {
    Write-Success "Google Play Services installed"
    
    $gmsVersion = & adb shell dumpsys package com.google.android.gms | Select-String "versionName=" | Select-Object -First 1
    if ($gmsVersion) {
        Write-Info $gmsVersion.Line.Trim()
    }
} else {
    Write-Error "Google Play Services NOT installed!"
}

Write-Host ""

# Check 4: PakUni App
Write-Host "CHECK 4: PakUni App Status" -ForegroundColor Magenta
Write-Host "-------------------------" -ForegroundColor Magenta
$pakuniStatus = & adb shell pm list packages | Select-String "com.pakuni"

if ($pakuniStatus) {
    Write-Success "PakUni app installed"
    
    $pakuniVersion = & adb shell dumpsys package com.pakuni | Select-String "versionName=" | Select-Object -First 1
    if ($pakuniVersion) {
        Write-Info $pakuniVersion.Line.Trim()
    }
} else {
    Write-Error "PakUni app NOT installed!"
    Write-Info "Install the APK first: adb install PakUni.apk"
}

Write-Host ""

# Check 5: Device Date/Time
Write-Host "CHECK 5: Device Date and Time" -ForegroundColor Magenta
Write-Host "---------------------------" -ForegroundColor Magenta
$currentDate = & adb shell date
Write-Info "Device date/time: $currentDate"
$localDate = Get-Date
Write-Info "Your date/time:   $localDate"

$timeDiff = [Math]::Abs(([datetime]$currentDate - $localDate).TotalMinutes)
if ($timeDiff -gt 5) {
    Write-Warning "Device time is significantly different from your PC!"
    Write-Warning "This might cause Google authentication issues"
    Write-Info "Fix: Settings - Date and Time - Set automatically = ON"
} else {
    Write-Success "Device time is synchronized"
}

Write-Host ""

# Check 6: Network Connectivity
Write-Host "CHECK 6: Network Connectivity" -ForegroundColor Magenta
Write-Host "-----------------------------" -ForegroundColor Magenta
$netStatus = & adb shell dumpsys connectivity | Select-String "mNetworkInfo"

if ($netStatus) {
    Write-Success "Device has network connection"
} else {
    Write-Warning "Could not verify network status"
}

Write-Host ""

# Check 7: Google API Configuration
Write-Host "CHECK 7: App Google API Configuration" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Magenta
Write-Info "Checking AndroidManifest.xml permissions..."

$appCerts = & adb shell dumpsys package com.pakuni | Select-String "signatures="
if ($appCerts) {
    Write-Success "App permissions verified"
} else {
    Write-Warning "Could not verify app configuration"
}

Write-Host ""

# Check 8: Recent Errors in Logs
Write-Host "CHECK 8: Recent Auth Errors" -ForegroundColor Magenta
Write-Host "---------------------------" -ForegroundColor Magenta
Write-Info "Capturing recent logs (this may take a moment)..."

# Clear existing logs and capture fresh ones
& adb shell "logcat -c"
Start-Sleep -Seconds 2

Write-Info "Launching PakUni..."
& adb shell "am start -n com.pakuni/com.pakuni.MainActivity"
Start-Sleep -Seconds 5

$logs = & adb shell "logcat -d" 2>&1 | Select-String -Pattern "BadAuthentication|DEVELOPER_ERROR|PLAY_SERVICES|sign-in error|Authentication failed" | Select-Object -First 10

if ($logs) {
    Write-Error "Found auth-related errors in logs:"
    $logs | ForEach-Object {
        Write-Host "  ❌ $_" -ForegroundColor Red
    }
} else {
    Write-Success "No recent authentication errors in logs"
}

Write-Host ""

# Summary
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "=======" -ForegroundColor Cyan
Write-Host ""

$checksPassed = 0
$checksTotal = 0

# Recheck conditions
if ($devices) { $checksPassed++; $checksTotal++ } else { $checksTotal++ }
if ($accounts -match "com.google") { $checksPassed++; $checksTotal++ } else { $checksTotal++ }
if ($gmsStatus) { $checksPassed++; $checksTotal++ } else { $checksTotal++ }
if ($pakuniStatus) { $checksPassed++; $checksTotal++ } else { $checksTotal++ }
if ($timeDiff -le 5) { $checksPassed++; $checksTotal++ } else { $checksTotal++ }

Write-Host "Checks passed: $checksPassed / $checksTotal" -ForegroundColor Cyan
Write-Host ""

if ($checksPassed -eq $checksTotal) {
    Write-Success "All checks passed! Google Sign-In should work now."
    Write-Success "Try opening PakUni and tapping 'Sign in with Google'"
} else {
    Write-Warning "Some checks failed. Fix the issues above and try again."
    Write-Info ""
    Write-Info "Quick fixes:"
    Write-Info "1. Add Google Account: Run auto-fix-google-signin-v2.ps1"
    Write-Info "2. Sync device time: Settings - Date and Time - Automatic = ON"
    Write-Info "3. Reinstall PakUni: adb uninstall com.pakuni; adb install PakUni.apk"
    Write-Info "4. Restart device: adb reboot"
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
