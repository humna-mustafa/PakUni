#!/usr/bin/env powershell
#Requires -Version 5.1
<#
.SYNOPSIS
    PakUni - Quick Status Check & Troubleshooter
.DESCRIPTION
    Quickly diagnose issues with your React Native development environment
#>

$ErrorActionPreference = "Continue"
$Script:ProjectRoot = Split-Path -Parent $PSScriptRoot
$Script:AndroidSdkPath = "$env:LOCALAPPDATA\Android\Sdk"

Clear-Host

Write-Host @"

    ╔═══════════════════════════════════════════════════════════════════╗
    ║           PakUni - Quick Status Check & Troubleshooter            ║
    ╚═══════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

$issues = @()
$warnings = @()

# ═══════════════════════════════════════════════════════════════════════════════
#                              STATUS CHECKS
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "  🔍 ENVIRONMENT STATUS" -ForegroundColor Yellow
Write-Host "  ──────────────────────────────────────────────────────────" -ForegroundColor DarkGray

# Node.js
Write-Host "  " -NoNewline
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js: " -NoNewline -ForegroundColor Green
    Write-Host $nodeVersion -ForegroundColor White
} catch {
    Write-Host "❌ Node.js: " -NoNewline -ForegroundColor Red
    Write-Host "NOT INSTALLED" -ForegroundColor Red
    $issues += "Install Node.js from https://nodejs.org"
}

# npm
Write-Host "  " -NoNewline
try {
    $npmVersion = npm --version 2>&1
    Write-Host "✅ npm:     " -NoNewline -ForegroundColor Green
    Write-Host "v$npmVersion" -ForegroundColor White
} catch {
    Write-Host "❌ npm:     " -NoNewline -ForegroundColor Red
    Write-Host "NOT INSTALLED" -ForegroundColor Red
    $issues += "npm should come with Node.js"
}

# Java/JDK
Write-Host "  " -NoNewline
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    if ($javaVersion) {
        Write-Host "✅ Java:    " -NoNewline -ForegroundColor Green
        Write-Host $javaVersion -ForegroundColor White
    } else {
        throw "no java"
    }
} catch {
    Write-Host "⚠️ Java:    " -NoNewline -ForegroundColor Yellow
    Write-Host "Not detected (may be OK if Android Studio has its own)" -ForegroundColor Gray
}

# ADB
Write-Host "  " -NoNewline
$adbPath = "$Script:AndroidSdkPath\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    $adbVer = & $adbPath version 2>&1 | Select-Object -First 1
    Write-Host "✅ ADB:     " -NoNewline -ForegroundColor Green
    Write-Host $adbVer -ForegroundColor White
} elseif (Get-Command "adb" -ErrorAction SilentlyContinue) {
    $adbVer = adb version 2>&1 | Select-Object -First 1
    Write-Host "✅ ADB:     " -NoNewline -ForegroundColor Green
    Write-Host "$adbVer (from PATH)" -ForegroundColor White
    $adbPath = "adb"
} else {
    Write-Host "❌ ADB:     " -NoNewline -ForegroundColor Red
    Write-Host "NOT FOUND" -ForegroundColor Red
    $issues += "Install Android Studio and Android SDK"
}

# Emulator
Write-Host "  " -NoNewline
$emulatorPath = "$Script:AndroidSdkPath\emulator\emulator.exe"
if (Test-Path $emulatorPath) {
    Write-Host "✅ Emulator:" -NoNewline -ForegroundColor Green
    Write-Host " Installed" -ForegroundColor White
} else {
    Write-Host "⚠️ Emulator:" -NoNewline -ForegroundColor Yellow
    Write-Host " Not at default path" -ForegroundColor Gray
    $warnings += "Android Emulator not found at expected location"
}

Write-Host ""
Write-Host "  📱 DEVICE/EMULATOR STATUS" -ForegroundColor Yellow
Write-Host "  ──────────────────────────────────────────────────────────" -ForegroundColor DarkGray

# Connected devices
Write-Host "  " -NoNewline
try {
    $devices = & $adbPath devices 2>&1
    $connectedDevices = @()
    foreach ($line in $devices) {
        if ($line -match "^(emulator-\d+|[\w\d]+)\s+device$") {
            $connectedDevices += $matches[1]
        }
    }
    
    if ($connectedDevices.Count -gt 0) {
        Write-Host "✅ Connected: " -NoNewline -ForegroundColor Green
        Write-Host ($connectedDevices -join ", ") -ForegroundColor White
    } else {
        Write-Host "⚠️ Connected: " -NoNewline -ForegroundColor Yellow
        Write-Host "No devices/emulators connected" -ForegroundColor Gray
        $warnings += "No emulator running. Start one from Android Studio or use the launcher."
    }
} catch {
    Write-Host "❌ Connected: " -NoNewline -ForegroundColor Red
    Write-Host "Could not check" -ForegroundColor Red
}

# Available AVDs
Write-Host "  " -NoNewline
if (Test-Path $emulatorPath) {
    $avds = & $emulatorPath -list-avds 2>&1
    $avdList = @($avds | Where-Object { $_ -and $_.Trim() -ne "" })
    if ($avdList.Count -gt 0) {
        Write-Host "✅ AVDs:      " -NoNewline -ForegroundColor Green
        Write-Host ($avdList -join ", ") -ForegroundColor White
    } else {
        Write-Host "⚠️ AVDs:      " -NoNewline -ForegroundColor Yellow
        Write-Host "No virtual devices configured" -ForegroundColor Gray
        $warnings += "Create an AVD in Android Studio > Tools > Device Manager"
    }
} else {
    Write-Host "⚠️ AVDs:      " -NoNewline -ForegroundColor Yellow
    Write-Host "Cannot check (emulator not found)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "  🔌 PORT STATUS" -ForegroundColor Yellow
Write-Host "  ──────────────────────────────────────────────────────────" -ForegroundColor DarkGray

# Port 8081 (Metro)
Write-Host "  " -NoNewline
try {
    $port8081 = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
    if ($port8081) {
        $process = Get-Process -Id $port8081.OwningProcess -ErrorAction SilentlyContinue
        Write-Host "🔵 Port 8081: " -NoNewline -ForegroundColor Blue
        Write-Host "IN USE by $($process.ProcessName) (Metro running)" -ForegroundColor White
    } else {
        Write-Host "⚪ Port 8081: " -NoNewline -ForegroundColor Gray
        Write-Host "Available (Metro not running)" -ForegroundColor White
    }
} catch {
    Write-Host "⚪ Port 8081: " -NoNewline -ForegroundColor Gray
    Write-Host "Available" -ForegroundColor White
}

# Port 5554/5555 (Emulator)
Write-Host "  " -NoNewline
try {
    $emulatorPorts = Get-NetTCPConnection -LocalPort 5554,5555 -State Listen -ErrorAction SilentlyContinue
    if ($emulatorPorts) {
        Write-Host "🔵 Port 5554: " -NoNewline -ForegroundColor Blue
        Write-Host "Emulator connected" -ForegroundColor White
    } else {
        Write-Host "⚪ Port 5554: " -NoNewline -ForegroundColor Gray
        Write-Host "No emulator" -ForegroundColor White
    }
} catch {
    Write-Host "⚪ Port 5554: " -NoNewline -ForegroundColor Gray
    Write-Host "Checking..." -ForegroundColor White
}

Write-Host ""
Write-Host "  📂 PROJECT STATUS" -ForegroundColor Yellow
Write-Host "  ──────────────────────────────────────────────────────────" -ForegroundColor DarkGray

# node_modules
Write-Host "  " -NoNewline
$nodeModulesPath = Join-Path $Script:ProjectRoot "node_modules"
if (Test-Path $nodeModulesPath) {
    $packageCount = (Get-ChildItem -Path $nodeModulesPath -Directory).Count
    Write-Host "✅ node_modules: " -NoNewline -ForegroundColor Green
    Write-Host "$packageCount packages" -ForegroundColor White
} else {
    Write-Host "❌ node_modules: " -NoNewline -ForegroundColor Red
    Write-Host "MISSING - run 'npm install'" -ForegroundColor Red
    $issues += "Run 'npm install' to install dependencies"
}

# package-lock.json
Write-Host "  " -NoNewline
$lockFile = Join-Path $Script:ProjectRoot "package-lock.json"
if (Test-Path $lockFile) {
    Write-Host "✅ package-lock: " -NoNewline -ForegroundColor Green
    Write-Host "Present" -ForegroundColor White
} else {
    Write-Host "⚠️ package-lock: " -NoNewline -ForegroundColor Yellow
    Write-Host "Missing (will be created on install)" -ForegroundColor Gray
}

# Android build
Write-Host "  " -NoNewline
$buildGradle = Join-Path $Script:ProjectRoot "android\app\build.gradle"
if (Test-Path $buildGradle) {
    Write-Host "✅ Android:      " -NoNewline -ForegroundColor Green
    Write-Host "build.gradle present" -ForegroundColor White
} else {
    Write-Host "❌ Android:      " -NoNewline -ForegroundColor Red
    Write-Host "build.gradle MISSING" -ForegroundColor Red
    $issues += "Android project files are missing"
}

# Previous build
Write-Host "  " -NoNewline
$appBuild = Join-Path $Script:ProjectRoot "android\app\build"
if (Test-Path $appBuild) {
    $apkPath = Join-Path $appBuild "outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        $apkInfo = Get-Item $apkPath
        Write-Host "✅ Last build:   " -NoNewline -ForegroundColor Green
        Write-Host "$($apkInfo.LastWriteTime)" -ForegroundColor White
    } else {
        Write-Host "⚪ Last build:   " -NoNewline -ForegroundColor Gray
        Write-Host "No APK found" -ForegroundColor White
    }
} else {
    Write-Host "⚪ Last build:   " -NoNewline -ForegroundColor Gray
    Write-Host "Never built" -ForegroundColor White
}

# ═══════════════════════════════════════════════════════════════════════════════
#                              SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "  ══════════════════════════════════════════════════════════" -ForegroundColor DarkGray

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host ""
    Write-Host "  ✅ Everything looks good! Ready to run." -ForegroundColor Green
} else {
    if ($issues.Count -gt 0) {
        Write-Host ""
        Write-Host "  ❌ ISSUES TO FIX:" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "     • $issue" -ForegroundColor Red
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "  ⚠️ WARNINGS:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "     • $warning" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "  ══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  QUICK ACTIONS:" -ForegroundColor Cyan
Write-Host "  ├── Run app:      .\scripts\launch-pakuni.ps1" -ForegroundColor White
Write-Host "  ├── Start Metro:  npm start" -ForegroundColor White
Write-Host "  ├── Build app:    npx react-native run-android" -ForegroundColor White
Write-Host "  └── Clean build:  .\scripts\clean-build.ps1" -ForegroundColor White
Write-Host ""
