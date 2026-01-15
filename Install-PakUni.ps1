# ======================================
# PakUni v1.2.0 Installer Script
# ======================================
# This script automatically installs PakUni on your Android device

param(
    [switch]$Launch,
    [switch]$Uninstall
)

# Colors for output
$colors = @{
    Success = "Green"
    Error = "Red"
    Info = "Cyan"
    Warning = "Yellow"
}

# Paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$apkPath = Join-Path $scriptDir "PakUni-v1.2.0.apk"
$packageName = "com.pakuni"
$mainActivity = "com.pakuni.MainActivity"

Write-Host "========================================" -ForegroundColor $colors.Info
Write-Host "  PakUni v1.2.0 Installer" -ForegroundColor $colors.Info
Write-Host "========================================" -ForegroundColor $colors.Info
Write-Host ""

# Check if APK exists
if (-not (Test-Path $apkPath)) {
    Write-Host "❌ ERROR: APK file not found at: $apkPath" -ForegroundColor $colors.Error
    Write-Host "Please ensure PakUni-v1.2.0.apk exists in the project root directory." -ForegroundColor $colors.Warning
    exit 1
}

Write-Host "✅ APK Found: PakUni-v1.2.0.apk (24.4 MB)" -ForegroundColor $colors.Success
Write-Host ""

# Check ADB
try {
    $adbVersion = adb version 2>&1
    Write-Host "✅ ADB Found" -ForegroundColor $colors.Success
} catch {
    Write-Host "❌ ERROR: ADB not found in system PATH" -ForegroundColor $colors.Error
    Write-Host "Please install Android SDK Platform Tools and add to PATH" -ForegroundColor $colors.Warning
    exit 1
}

Write-Host ""

# Check connected devices
Write-Host "Checking connected devices..." -ForegroundColor $colors.Info
$devices = adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$" }

if ($devices.Count -eq 0) {
    Write-Host "❌ ERROR: No Android devices found" -ForegroundColor $colors.Error
    Write-Host "Please:" -ForegroundColor $colors.Warning
    Write-Host "  1. Connect Android device via USB" -ForegroundColor $colors.Warning
    Write-Host "  2. Enable USB Debugging (Settings > Developer Options)" -ForegroundColor $colors.Warning
    Write-Host "  3. Tap 'Trust' when prompted" -ForegroundColor $colors.Warning
    Write-Host "  4. Run this script again" -ForegroundColor $colors.Warning
    exit 1
}

Write-Host "✅ Found device(s):" -ForegroundColor $colors.Success
$devices | ForEach-Object {
    $deviceName = $_ -replace '\s+device.*'
    Write-Host "   • $deviceName" -ForegroundColor $colors.Info
}

Write-Host ""

if ($Uninstall) {
    Write-Host "Uninstalling PakUni..." -ForegroundColor $colors.Warning
    adb uninstall $packageName
    Write-Host "✅ PakUni uninstalled" -ForegroundColor $colors.Success
    exit 0
}

# Install APK
Write-Host "Installing PakUni v1.2.0..." -ForegroundColor $colors.Info
$installResult = adb install -r $apkPath 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Installation successful!" -ForegroundColor $colors.Success
    Write-Host ""
    
    # Launch if requested
    if ($Launch) {
        Write-Host "Launching PakUni..." -ForegroundColor $colors.Info
        adb shell am start -n "$packageName/.$mainActivity"
        Write-Host "✅ App launched on device!" -ForegroundColor $colors.Success
    } else {
        Write-Host "To launch the app, use: adb shell am start -n $packageName/.$mainActivity" -ForegroundColor $colors.Info
        Write-Host "Or run: .\Install-PakUni.ps1 -Launch" -ForegroundColor $colors.Info
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $colors.Success
    Write-Host "  Installation Complete!" -ForegroundColor $colors.Success
    Write-Host "========================================" -ForegroundColor $colors.Success
} else {
    Write-Host "❌ Installation failed!" -ForegroundColor $colors.Error
    Write-Host "Error details:" -ForegroundColor $colors.Warning
    Write-Host $installResult -ForegroundColor $colors.Error
    exit 1
}
