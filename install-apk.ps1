#!/usr/bin/env pwsh
# ============================================================================
# PakUni v1.0.0 - ONE-CLICK INSTALLER
# No Localhost Required - Uses Supabase Cloud Backend
# ============================================================================

# Configuration
$APK_FILE = "E:\pakuni\PakUni\android\app\build\outputs\apk\debug\PakUni-v1.0.0.apk"
$PACKAGE_NAME = "com.pakuni"
$ACTIVITY_NAME = "com.pakuni.MainActivity"

# Colors
$SUCCESS = 'Green'
$ERROR = 'Red'
$INFO = 'Cyan'
$WARNING = 'Yellow'

# ============================================================================
# FUNCTIONS
# ============================================================================

function Write-Header {
    Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                           ║" -ForegroundColor Cyan
    Write-Host "║              PakUni v1.0.0 - ONE-CLICK INSTALLER         ║" -ForegroundColor Cyan
    Write-Host "║                    No Localhost Required                  ║" -ForegroundColor Cyan
    Write-Host "║                                                           ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Verify-ADB {
    Write-Host "[1/5] Verifying ADB installation..." -ForegroundColor $INFO
    try {
        $adbVersion = adb version 2>&1 | Select-String "Android Debug Bridge"
        if ($adbVersion) {
            Write-Host "     ✅ ADB found: $($adbVersion[0])" -ForegroundColor $SUCCESS
            return $true
        }
    }
    catch {
        Write-Host "     ❌ ADB not found. Install Android SDK Platform-Tools" -ForegroundColor $ERROR
        Write-Host "     https://developer.android.com/tools/releases/platform-tools" -ForegroundColor $WARNING
        return $false
    }
}

function Check-APK {
    Write-Host "[2/5] Checking APK file..." -ForegroundColor $INFO
    if (Test-Path $APK_FILE) {
        $size = (Get-Item $APK_FILE).Length / 1MB
        Write-Host "     ✅ APK found: $(Split-Path -Leaf $APK_FILE)" -ForegroundColor $SUCCESS
        Write-Host "     ✅ Size: $([math]::Round($size, 2)) MB" -ForegroundColor $SUCCESS
        return $true
    }
    else {
        Write-Host "     ❌ APK not found at: $APK_FILE" -ForegroundColor $ERROR
        return $false
    }
}

function List-Devices {
    Write-Host "[3/5] Scanning for connected devices..." -ForegroundColor $INFO
    $output = adb devices
    $devices = $output | Select-String "device$" | Where-Object {$_ -notmatch "List of"}
    
    if ($devices.Count -gt 0) {
        Write-Host "     ✅ Found $($devices.Count) device(s):" -ForegroundColor $SUCCESS
        $devices | ForEach-Object { Write-Host "        • $_" -ForegroundColor $SUCCESS }
        return $true
    }
    else {
        Write-Host "     ❌ No devices found" -ForegroundColor $ERROR
        Write-Host "        • Connect USB cable" -ForegroundColor $WARNING
        Write-Host "        • Enable USB Debugging on device" -ForegroundColor $WARNING
        Write-Host "        • Tap 'Trust' on device prompt" -ForegroundColor $WARNING
        return $false
    }
}

function Install-APK {
    Write-Host "[4/5] Installing APK..." -ForegroundColor $INFO
    Write-Host "     Uninstalling old version (if exists)..." -ForegroundColor $INFO
    adb uninstall $PACKAGE_NAME 2>&1 | Out-Null
    
    Write-Host "     Installing $([System.IO.Path]::GetFileName($APK_FILE))..." -ForegroundColor $INFO
    $installOutput = adb install -r $APK_FILE 2>&1 | Select-String "Success|Failure|Error"
    
    if ($installOutput | Select-String "Success") {
        Write-Host "     ✅ Installation successful!" -ForegroundColor $SUCCESS
        return $true
    }
    else {
        Write-Host "     ❌ Installation failed" -ForegroundColor $ERROR
        if ($installOutput) {
            Write-Host "        Error: $($installOutput[0])" -ForegroundColor $ERROR
        }
        return $false
    }
}

function Launch-App {
    param([bool]$AutoLaunch)
    
    Write-Host "[5/5] Launching app..." -ForegroundColor $INFO
    
    if ($AutoLaunch) {
        adb shell am start -n "$PACKAGE_NAME/$ACTIVITY_NAME" 2>&1 | Out-Null
        Write-Host "     ✅ App launched!" -ForegroundColor $SUCCESS
        Write-Host "     ⏱️  App should appear in 3-5 seconds" -ForegroundColor $INFO
        return $true
    }
    else {
        Write-Host "     📱 Tap PakUni icon to launch app manually" -ForegroundColor $INFO
        Write-Host "     Or run: adb shell am start -n $PACKAGE_NAME/$ACTIVITY_NAME" -ForegroundColor $WARNING
        return $true
    }
}

function Show-Success {
    Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor $SUCCESS
    Write-Host "║                                                           ║" -ForegroundColor $SUCCESS
    Write-Host "║              ✅ INSTALLATION SUCCESSFUL! ✅              ║" -ForegroundColor $SUCCESS
    Write-Host "║                                                           ║" -ForegroundColor $SUCCESS
    Write-Host "║  📱 PakUni v1.0.0 is now installed and ready!           ║" -ForegroundColor $SUCCESS
    Write-Host "║                                                           ║" -ForegroundColor $SUCCESS
    Write-Host "║  What's Included:                                         ║" -ForegroundColor $SUCCESS
    Write-Host "║  ✅ 500+ Universities Database                           ║" -ForegroundColor $SUCCESS
    Write-Host "║  ✅ Supabase Cloud Backend (No Localhost!)              ║" -ForegroundColor $SUCCESS
    Write-Host "║  ✅ Offline-First Architecture                           ║" -ForegroundColor $SUCCESS
    Write-Host "║  ✅ Dark/Light Theme                                     ║" -ForegroundColor $SUCCESS
    Write-Host "║  ✅ Advanced Search & Filtering                          ║" -ForegroundColor $SUCCESS
    Write-Host "║                                                           ║" -ForegroundColor $SUCCESS
    Write-Host "║  App Size: 126.39 MB                                     ║" -ForegroundColor $SUCCESS
    Write-Host "║  Min Android: 5.0 (API 21+)                             ║" -ForegroundColor $SUCCESS
    Write-Host "║  Works Offline: Yes ✅                                   ║" -ForegroundColor $SUCCESS
    Write-Host "║                                                           ║" -ForegroundColor $SUCCESS
    Write-Host "║  Demo Account (Optional):                                ║" -ForegroundColor $SUCCESS
    Write-Host "║  Email:    student@pakuni.app                           ║" -ForegroundColor $SUCCESS
    Write-Host "║  Password: Student@2026!                                ║" -ForegroundColor $SUCCESS
    Write-Host "║                                                           ║" -ForegroundColor $SUCCESS
    Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor $SUCCESS
}

function Show-Error {
    Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor $ERROR
    Write-Host "║                                                           ║" -ForegroundColor $ERROR
    Write-Host "║                  ❌ INSTALLATION FAILED ❌               ║" -ForegroundColor $ERROR
    Write-Host "║                                                           ║" -ForegroundColor $ERROR
    Write-Host "║  Please check:                                            ║" -ForegroundColor $ERROR
    Write-Host "║  1. ADB is installed and working                         ║" -ForegroundColor $ERROR
    Write-Host "║  2. Device is connected via USB                          ║" -ForegroundColor $ERROR
    Write-Host "║  3. USB Debugging is enabled on device                   ║" -ForegroundColor $ERROR
    Write-Host "║  4. You tapped 'Trust' on device prompt                  ║" -ForegroundColor $ERROR
    Write-Host "║                                                           ║" -ForegroundColor $ERROR
    Write-Host "║  Troubleshooting:                                         ║" -ForegroundColor $ERROR
    Write-Host "║  adb kill-server                                         ║" -ForegroundColor $ERROR
    Write-Host "║  adb start-server                                        ║" -ForegroundColor $ERROR
    Write-Host "║  adb devices  (verify device shows 'device')            ║" -ForegroundColor $ERROR
    Write-Host "║                                                           ║" -ForegroundColor $ERROR
    Write-Host "║  See: INSTALL_NOW.md for detailed troubleshooting       ║" -ForegroundColor $ERROR
    Write-Host "║                                                           ║" -ForegroundColor $ERROR
    Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor $ERROR
}

# ============================================================================
# MAIN SCRIPT
# ============================================================================

Write-Header

# Step 1: Verify ADB
if (-not (Verify-ADB)) {
    Show-Error
    exit 1
}

# Step 2: Check APK
if (-not (Check-APK)) {
    Show-Error
    exit 1
}

# Step 3: List Devices
if (-not (List-Devices)) {
    Show-Error
    exit 1
}

# Step 4: Install APK
if (-not (Install-APK)) {
    Show-Error
    exit 1
}

# Step 5: Ask to launch
Write-Host "`n❓ Launch app now? (Y/n): " -ForegroundColor $INFO -NoNewline
$launch = Read-Host
if ($launch -ne 'n' -and $launch -ne 'N') {
    if (-not (Launch-App $true)) {
        Show-Error
        exit 1
    }
}

# Success!
Show-Success

# Optional: Verify installation
Write-Host "📋 Verifying installation..." -ForegroundColor $INFO
$check = adb shell pm list packages | Select-String $PACKAGE_NAME
if ($check) {
    Write-Host "✅ App verified in system packages" -ForegroundColor $SUCCESS
}

Write-Host "`n✨ Enjoy PakUni v1.0.0!" -ForegroundColor $SUCCESS
Write-Host "📚 Documentation: See INSTALL_NOW.md and PRODUCTION_INSTALLATION.md`n" -ForegroundColor $INFO
