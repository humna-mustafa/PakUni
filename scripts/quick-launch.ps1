#!/usr/bin/env powershell
#Requires -Version 5.1
<#
.SYNOPSIS
    PakUni - Non-Interactive Quick Launch
.DESCRIPTION
    Automatically runs all steps to launch PakUni in an emulator without prompts.
    Use this for automated/scripted launches.
.NOTES
    For interactive mode with options, use: .\scripts\launch-pakuni.ps1
#>

param(
    [switch]$ResetCache,
    [switch]$CleanBuild,
    [switch]$SkipEmulator,
    [switch]$SkipMetro,
    [string]$Emulator = ""
)

$ErrorActionPreference = "Stop"

# Determine project root reliably
if ($PSScriptRoot) {
    $Script:ProjectRoot = Split-Path -Parent $PSScriptRoot
} else {
    $Script:ProjectRoot = Get-Location
}

$Script:AndroidSdkPath = "$env:LOCALAPPDATA\Android\Sdk"
$Script:EmulatorPath = "$Script:AndroidSdkPath\emulator\emulator.exe"
$Script:AdbPath = "$Script:AndroidSdkPath\platform-tools\adb.exe"

# Use system ADB if local not found
if (-not (Test-Path $Script:AdbPath)) {
    if (Get-Command "adb" -ErrorAction SilentlyContinue) {
        $Script:AdbPath = "adb"
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
#                              HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

function Write-Status {
    param([string]$Message, [string]$Status = "INFO")
    
    $icon = switch ($Status) {
        "SUCCESS" { "[OK]" }
        "FAIL"    { "[X]" }
        "WARN"    { "[!]" }
        "INFO"    { "[i]" }
        "RUN"     { "[~]" }
        default   { "[*]" }
    }
    
    $color = switch ($Status) {
        "SUCCESS" { "Green" }
        "FAIL"    { "Red" }
        "WARN"    { "Yellow" }
        "INFO"    { "Cyan" }
        "RUN"     { "Yellow" }
        default   { "White" }
    }
    
    Write-Host "  $icon $Message" -ForegroundColor $color
}

function Test-EmulatorRunning {
    try {
        $devices = & $Script:AdbPath devices 2>&1
        return $devices -match "emulator-\d+\s+device"
    } catch {
        return $false
    }
}

function Get-AvailableAVDs {
    try {
        if (Test-Path $Script:EmulatorPath) {
            $avdsOutput = & $Script:EmulatorPath -list-avds 2>&1
            # Handle single or multiple AVDs properly
            $avdList = @()
            
            # If it's a single string, just add it
            if ($avdsOutput -is [string]) {
                if ($avdsOutput.Trim() -ne "") {
                    $avdList += $avdsOutput.Trim()
                }
            } else {
                # It's an array of strings
                foreach ($line in $avdsOutput) {
                    if ($line -and $line.ToString().Trim() -ne "") {
                        $avdList += $line.ToString().Trim()
                    }
                }
            }
            return $avdList
        }
        return @()
    } catch {
        return @()
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
#                              MAIN SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════

# Don't clear the host to preserve output in non-interactive mode
Write-Host ""

Write-Host @"

  +=========================================================================+
  |           PakUni Quick Launch (Non-Interactive)                         |
  +=========================================================================+

"@ -ForegroundColor Cyan

$startTime = Get-Date
$success = $true
$stepNumber = 0
$totalSteps = 5

# ───────────────────────────────────────────────────────────────────────────────
# STEP 1: Prerequisites Check
# ───────────────────────────────────────────────────────────────────────────────
$stepNumber++
Write-Host "`n  [$stepNumber/$totalSteps] Checking prerequisites..." -ForegroundColor White

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Status "Node.js $nodeVersion" "SUCCESS"
} catch {
    Write-Status "Node.js not found! Install from nodejs.org" "FAIL"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version 2>&1
    Write-Status "npm v$npmVersion" "SUCCESS"
} catch {
    Write-Status "npm not found!" "FAIL"
    exit 1
}

# Check ADB
if (Test-Path $Script:AdbPath) {
    Write-Status "Android SDK (ADB) found" "SUCCESS"
} elseif (Get-Command "adb" -ErrorAction SilentlyContinue) {
    Write-Status "Android SDK (ADB) found in PATH" "SUCCESS"
} else {
    Write-Status "ADB not found! Install Android Studio" "FAIL"
    exit 1
}

# Check node_modules
$nodeModulesPath = Join-Path $Script:ProjectRoot "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Status "node_modules missing, installing..." "WARN"
    Push-Location $Script:ProjectRoot
    npm install
    Pop-Location
    
    if (Test-Path $nodeModulesPath) {
        Write-Status "Dependencies installed" "SUCCESS"
    } else {
        Write-Status "Failed to install dependencies" "FAIL"
        exit 1
    }
} else {
    Write-Status "node_modules present" "SUCCESS"
}

# ───────────────────────────────────────────────────────────────────────────────
# STEP 2: Start Emulator
# ───────────────────────────────────────────────────────────────────────────────
$stepNumber++
Write-Host "`n  [$stepNumber/$totalSteps] Checking emulator..." -ForegroundColor White

if ($SkipEmulator) {
    Write-Status "Emulator check skipped (using connected device)" "INFO"
} elseif (Test-EmulatorRunning) {
    Write-Status "Emulator already running" "SUCCESS"
} else {
    Write-Status "No emulator running, starting one..." "RUN"
    
    $avds = Get-AvailableAVDs
    
    if ($avds.Count -eq 0) {
        Write-Status "No AVDs found! Create one in Android Studio" "FAIL"
        Write-Host ""
        Write-Host "  To create an AVD:" -ForegroundColor Yellow
        Write-Host "  1. Open Android Studio" -ForegroundColor Gray
        Write-Host "  2. Tools → Device Manager" -ForegroundColor Gray
        Write-Host "  3. Create Device → Pixel 7 → API 34" -ForegroundColor Gray
        Write-Host ""
        exit 1
    }
    
    # Select emulator
    $avdName = ""
    if ($Emulator -and ($avds -contains $Emulator)) { 
        $avdName = $Emulator 
    } else { 
        $avdName = $avds[0]
    }
    
    Write-Status "Starting emulator: $avdName" "RUN"
    Start-Process -FilePath $Script:EmulatorPath -ArgumentList "-avd", $avdName, "-no-snapshot-load" -WindowStyle Minimized
    
    # Wait for boot
    Write-Host "  [~] Waiting for emulator to boot (max 90s)..." -ForegroundColor Yellow
    $timeout = 90
    $elapsed = 0
    
    while ($elapsed -lt $timeout) {
        Start-Sleep -Seconds 3
        $elapsed += 3
        
        if (Test-EmulatorRunning) {
            $bootStatus = & $Script:AdbPath shell getprop sys.boot_completed 2>&1
            if ($bootStatus -match "1") {
                Write-Status "Emulator booted successfully" "SUCCESS"
                break
            }
        }
        
        Write-Host "`r  [~] Boot progress: $elapsed/$timeout seconds   " -NoNewline -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    if (-not (Test-EmulatorRunning)) {
        Write-Status "Emulator failed to start in time" "WARN"
        Write-Host "  Continuing anyway - emulator might still be booting..." -ForegroundColor Yellow
    }
}

# ───────────────────────────────────────────────────────────────────────────────
# STEP 3: Setup Port Forwarding
# ───────────────────────────────────────────────────────────────────────────────
$stepNumber++
Write-Host "`n  [$stepNumber/$totalSteps] Setting up port forwarding..." -ForegroundColor White

try {
    & $Script:AdbPath reverse tcp:8081 tcp:8081 2>&1 | Out-Null
    Write-Status "Port forwarding configured (8081)" "SUCCESS"
} catch {
    Write-Status "Port forwarding failed (may still work)" "WARN"
}

# ───────────────────────────────────────────────────────────────────────────────
# STEP 4: Start Metro Bundler
# ───────────────────────────────────────────────────────────────────────────────
$stepNumber++
Write-Host "`n  [$stepNumber/$totalSteps] Starting Metro bundler..." -ForegroundColor White

if ($SkipMetro) {
    Write-Status "Metro start skipped (assuming already running)" "INFO"
} else {
    # Kill any existing Metro
    try {
        $portConnections = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
        if ($portConnections) {
            $pids = $portConnections | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($pid in $pids) {
                if ($pid -and $pid -ne 0) {
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                }
            }
            Start-Sleep -Seconds 2
            Write-Status "Cleaned existing Metro process" "INFO"
        }
    } catch {}
    
    # Start Metro in new window
    $metroArgs = "start -- --host 0.0.0.0 --port 8081"
    if ($ResetCache) {
        $metroArgs += " --reset-cache"
    }
    
    $metroScript = @"
cd '$Script:ProjectRoot'
`$host.UI.RawUI.WindowTitle = 'PakUni Metro Bundler'
Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host '  PakUni Metro Bundler' -ForegroundColor Yellow
Write-Host '  Press Ctrl+C to stop' -ForegroundColor Gray
Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan
npm $metroArgs
"@
    
    $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($metroScript))
    Start-Process powershell -ArgumentList "-NoExit", "-EncodedCommand", $encodedCommand
    
    # Wait for Metro
    Write-Host "  [~] Waiting for Metro to start..." -ForegroundColor Yellow
    $timeout = 20
    $elapsed = 0
    
    while ($elapsed -lt $timeout) {
        Start-Sleep -Seconds 2
        $elapsed += 2
        
        try {
            $portCheck = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
            if ($portCheck) {
                Write-Status "Metro bundler started" "SUCCESS"
                break
            }
        } catch {}
    }
    
    if ($elapsed -ge $timeout) {
        Write-Status "Metro may still be starting..." "WARN"
    }
}

# ───────────────────────────────────────────────────────────────────────────────
# STEP 5: Build and Install App
# ───────────────────────────────────────────────────────────────────────────────
$stepNumber++
Write-Host "`n  [$stepNumber/$totalSteps] Building and installing app..." -ForegroundColor White
Write-Host "  This may take a few minutes on first build..." -ForegroundColor Gray

Push-Location $Script:ProjectRoot

if ($CleanBuild) {
    Write-Status "Performing clean build..." "RUN"
    $androidBuild = Join-Path $Script:ProjectRoot "android\app\build"
    if (Test-Path $androidBuild) {
        Remove-Item -Recurse -Force $androidBuild -ErrorAction SilentlyContinue
    }
}

try {
    # Use npm run android instead of npx for better compatibility
    $buildProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm", "run", "android" `
        -WorkingDirectory $Script:ProjectRoot -NoNewWindow -PassThru -Wait
    
    if ($buildProcess.ExitCode -eq 0) {
        Write-Status "App built and installed successfully!" "SUCCESS"
    } else {
        Write-Status "Build failed with exit code: $($buildProcess.ExitCode)" "FAIL"
        $success = $false
    }
} catch {
    Write-Status "Build error: $($_.Exception.Message)" "FAIL"
    $success = $false
}

Pop-Location

# ───────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ───────────────────────────────────────────────────────────────────────────────
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "  ══════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray

if ($success) {
    Write-Host @"

  +=========================================================================+
  |                    SUCCESS! PakUni is running!                          |
  +=========================================================================+

"@ -ForegroundColor Green
    
    Write-Host "  Check your emulator - the app should be visible now!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Metro Shortcuts:" -ForegroundColor Yellow
    Write-Host "  ├── r = Reload app" -ForegroundColor White
    Write-Host "  ├── d = Open Dev Menu" -ForegroundColor White
    Write-Host "  └── j = Open Debugger" -ForegroundColor White
} else {
    Write-Host @"

  +=========================================================================+
  |                    Launch completed with errors                         |
  +=========================================================================+

"@ -ForegroundColor Red
    
    Write-Host "  Try running: .\scripts\launch-pakuni.ps1 for interactive mode" -ForegroundColor Yellow
    Write-Host "  Or run: .\scripts\quick-launch.ps1 -CleanBuild for a clean build" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Time: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Gray
Write-Host ""
