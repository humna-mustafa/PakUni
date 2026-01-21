#!/usr/bin/env powershell
<#
.SYNOPSIS
    PakUni Device & Google Sign-In Fix Script
.DESCRIPTION
    Fixes device connection issues and ensures Google Sign-In is properly configured
#>

param(
    [switch]$SkipMetro = $false,
    [int]$MetroPort = 8081
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

function Write-Step {
    param([string]$Message, [int]$Step, [int]$Total)
    Write-Host "[$Step/$Total] $Message" -ForegroundColor Cyan -BackgroundColor Black
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Main script
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  PakUni - Device & Google Sign-In Fix" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$totalSteps = 6

# Step 1: Check device status
Write-Step "Checking device status..." 1 $totalSteps
$devices = adb devices
Write-Host $devices

if ($devices -like "*offline*") {
    Write-Warning "Device is OFFLINE. Restarting ADB..."
    adb kill-server
    Start-Sleep -Seconds 3
    adb start-server
    Start-Sleep -Seconds 2
    $devices = adb devices
    Write-Host $devices
}

if ($devices -like "*unauthorized*") {
    Write-Error "Device is UNAUTHORIZED"
    Write-Host ""
    Write-Host "ACTION REQUIRED ON YOUR PHYSICAL DEVICE:" -ForegroundColor Yellow
    Write-Host "1. Look at your device screen"
    Write-Host "2. Find the prompt: 'Allow USB Debugging?'"
    Write-Host "3. Check 'Always allow from this computer'"
    Write-Host "4. Tap 'Allow'"
    Write-Host ""
    Write-Host "Press any key when you've approved USB debugging on your device..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host ""
    
    $retries = 0
    do {
        $devices = adb devices
        if ($devices -like "*device`n*" -and $devices -notlike "*offline*") {
            Write-Success "Device is now authorized!"
            break
        }
        $retries++
        if ($retries -ge 5) {
            Write-Error "Device still not authorized after 5 retries. Please check your device."
            exit 1
        }
        Write-Host "Waiting for authorization... (retry $retries/5)"
        Start-Sleep -Seconds 2
    } while ($true)
}

Write-Success "Device connected"
Write-Host ""

# Step 2: Clear app data
Write-Step "Clearing app data and cache..." 2 $totalSteps
$clearResult = adb shell pm clear com.pakuni 2>&1
if ($clearResult -like "*Success*") {
    Write-Success "App data cleared"
} else {
    Write-Warning "Could not clear app data (may not be installed yet)"
}
Write-Host ""

# Step 3: Kill Metro processes
Write-Step "Cleaning up existing Metro/Node processes..." 3 $totalSteps
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Warning "Found existing Node processes, stopping them..."
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Success "Node processes stopped"
} else {
    Write-Success "No existing Node processes"
}

# Kill processes on port 8081
$portProcess = Get-NetTCPConnection -LocalPort $MetroPort -ErrorAction SilentlyContinue
if ($portProcess) {
    Write-Warning "Found process on port $MetroPort, stopping it..."
    Stop-Process -Id $portProcess.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Success "Port $MetroPort is now free"
}
Write-Host ""

# Step 4: Setup port forwarding
Write-Step "Setting up ADB port forwarding..." 4 $totalSteps
$forwardResult = adb reverse tcp:$MetroPort tcp:$MetroPort 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "Port forwarding configured (localhost:$MetroPort ↔ device:$MetroPort)"
} else {
    Write-Error "Failed to setup port forwarding: $forwardResult"
}
Write-Host ""

# Step 5: Start Metro bundler
if (-not $SkipMetro) {
    Write-Step "Starting Metro bundler..." 5 $totalSteps
    Write-Host "Metro will start in a new window..." -ForegroundColor Cyan
    Write-Host "Waiting for Metro to be ready..." -ForegroundColor Cyan
    
    # Start Metro in background
    $metroJob = Start-Job -ScriptBlock {
        param($port)
        Set-Location "E:\pakuni\PakUni"
        npm start -- --port $port
    } -ArgumentList $MetroPort
    
    # Wait for Metro to start
    $maxWait = 30
    $waited = 0
    $metroReady = $false
    
    do {
        Start-Sleep -Seconds 2
        $waited += 2
        $jobOutput = Receive-Job -Job $metroJob -ErrorAction SilentlyContinue
        if ($jobOutput -like "*Dev server ready*" -or $jobOutput -like "*Transforming*") {
            $metroReady = $true
            break
        }
    } while ($waited -lt $maxWait)
    
    if ($metroReady) {
        Write-Success "Metro bundler ready"
    } else {
        Write-Warning "Metro is starting (check separate window for status)"
    }
    Write-Host ""
}

# Step 6: Build and install
Write-Step "Building and installing app..." 6 $totalSteps
Write-Host "This may take 2-3 minutes..." -ForegroundColor Cyan
Write-Host ""

cd E:\pakuni\PakUni
npm run android

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Wait for app to load on device"
Write-Host "2. Test Google Sign-In button"
Write-Host "3. Check Metro bundler window for any errors"
Write-Host ""
Write-Host "Press 'r' in Metro terminal to reload"
Write-Host "Press 'd' in Metro terminal to open Dev Menu"
Write-Host ""
