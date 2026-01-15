#!/usr/bin/env powershell
#Requires -Version 5.1
<#
.SYNOPSIS
    PakUni - Complete App Launcher with Interactive Menu
.DESCRIPTION
    A comprehensive script to run PakUni React Native app in Android emulator
    with full error handling, progress tracking, and interactive options.
.AUTHOR
    PakUni Development Team
.VERSION
    2.0.0
#>

# ═══════════════════════════════════════════════════════════════════════════════
#                              CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$Script:ProjectRoot = Split-Path -Parent $PSScriptRoot
$Script:LogFile = Join-Path $Script:ProjectRoot "logs\launch-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$Script:AndroidSdkPath = "$env:LOCALAPPDATA\Android\Sdk"
$Script:EmulatorPath = "$Script:AndroidSdkPath\emulator\emulator.exe"
$Script:AdbPath = "$Script:AndroidSdkPath\platform-tools\adb.exe"
$Script:MetroPort = 8081

# ═══════════════════════════════════════════════════════════════════════════════
#                              HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Ensure log directory exists
    $logDir = Split-Path $Script:LogFile -Parent
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    Add-Content -Path $Script:LogFile -Value $logEntry -ErrorAction SilentlyContinue
}

function Write-Banner {
    Clear-Host
    $banner = @"

    ╔═══════════════════════════════════════════════════════════════════════╗
    ║                                                                       ║
    ║     ██████╗  █████╗ ██╗  ██╗██╗   ██╗███╗   ██╗██╗                   ║
    ║     ██╔══██╗██╔══██╗██║ ██╔╝██║   ██║████╗  ██║██║                   ║
    ║     ██████╔╝███████║█████╔╝ ██║   ██║██╔██╗ ██║██║                   ║
    ║     ██╔═══╝ ██╔══██║██╔═██╗ ██║   ██║██║╚██╗██║██║                   ║
    ║     ██║     ██║  ██║██║  ██╗╚██████╔╝██║ ╚████║██║                   ║
    ║     ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝                   ║
    ║                                                                       ║
    ║              🎓 Pakistan Universities Guide App 🎓                    ║
    ║                     React Native App Launcher                         ║
    ║                                                                       ║
    ╚═══════════════════════════════════════════════════════════════════════╝

"@
    Write-Host $banner -ForegroundColor Cyan
}

function Write-Step {
    param(
        [int]$StepNumber,
        [int]$TotalSteps,
        [string]$Message,
        [string]$Status = "RUNNING"
    )
    
    $progressBar = ""
    $completed = [math]::Floor(($StepNumber / $TotalSteps) * 20)
    $remaining = 20 - $completed
    $progressBar = ("█" * $completed) + ("░" * $remaining)
    
    $statusColor = switch ($Status) {
        "RUNNING"  { "Yellow" }
        "SUCCESS"  { "Green" }
        "FAILED"   { "Red" }
        "SKIPPED"  { "DarkYellow" }
        "WARNING"  { "Magenta" }
        default    { "White" }
    }
    
    $statusIcon = switch ($Status) {
        "RUNNING"  { "⏳" }
        "SUCCESS"  { "✅" }
        "FAILED"   { "❌" }
        "SKIPPED"  { "⏭️" }
        "WARNING"  { "⚠️" }
        default    { "🔄" }
    }
    
    Write-Host ""
    Write-Host "    [$progressBar] " -NoNewline -ForegroundColor DarkGray
    Write-Host "[$StepNumber/$TotalSteps] " -NoNewline -ForegroundColor White
    Write-Host "$statusIcon " -NoNewline
    Write-Host "$Message" -ForegroundColor $statusColor
    
    Write-Log "$Message" $Status
}

function Write-SubStep {
    param([string]$Message, [string]$Color = "Gray")
    Write-Host "           → $Message" -ForegroundColor $Color
    Write-Log "  $Message"
}

function Write-ProgressSpinner {
    param([string]$Message, [int]$Seconds)
    
    $spinChars = @('⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏')
    $endTime = (Get-Date).AddSeconds($Seconds)
    $i = 0
    
    while ((Get-Date) -lt $endTime) {
        Write-Host "`r           $($spinChars[$i % $spinChars.Length]) $Message..." -NoNewline -ForegroundColor DarkYellow
        Start-Sleep -Milliseconds 100
        $i++
    }
    Write-Host "`r           ✓ $Message completed." -ForegroundColor Green
}

function Show-Menu {
    param(
        [string]$Title,
        [string[]]$Options,
        [string]$DefaultOption = "1"
    )
    
    Write-Host ""
    Write-Host "    ╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "    ║  $Title" -NoNewline -ForegroundColor Cyan
    $padding = [Math]::Max(1, 60 - $Title.Length - 2)
    Write-Host (" " * $padding) -NoNewline
    Write-Host "║" -ForegroundColor Cyan
    Write-Host "    ╠════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    
    $index = 1
    foreach ($option in $Options) {
        $defaultMark = if ($index.ToString() -eq $DefaultOption) { " (default)" } else { "" }
        Write-Host "    ║  " -NoNewline -ForegroundColor Cyan
        Write-Host "[$index]" -NoNewline -ForegroundColor Yellow
        Write-Host " $option$defaultMark" -NoNewline -ForegroundColor White
        $optPadding = [Math]::Max(1, 56 - $option.Length - $defaultMark.Length)
        Write-Host (" " * $optPadding) -NoNewline
        Write-Host "║" -ForegroundColor Cyan
        $index++
    }
    
    Write-Host "    ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "    Enter your choice [$DefaultOption]: " -NoNewline -ForegroundColor Yellow
    
    $choice = Read-Host
    if ([string]::IsNullOrWhiteSpace($choice)) {
        $choice = $DefaultOption
    }
    
    return $choice
}

function Show-Confirmation {
    param([string]$Message, [bool]$DefaultYes = $true)
    
    $default = if ($DefaultYes) { "Y/n" } else { "y/N" }
    Write-Host ""
    Write-Host "    ❓ $Message [$default]: " -NoNewline -ForegroundColor Yellow
    
    $response = Read-Host
    if ([string]::IsNullOrWhiteSpace($response)) {
        return $DefaultYes
    }
    
    return $response -match "^[Yy]"
}

function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Get-EmulatorStatus {
    try {
        $devices = & $Script:AdbPath devices 2>&1 | Select-String -Pattern "emulator-\d+\s+device"
        return $devices.Count -gt 0
    } catch {
        return $false
    }
}

function Get-AvailableEmulators {
    try {
        $avds = & $Script:EmulatorPath -list-avds 2>&1
        if ($avds -and $avds.Count -gt 0) {
            return $avds | Where-Object { $_ -and $_.Trim() -ne "" }
        }
        return @()
    } catch {
        return @()
    }
}

function Get-ConnectedDevices {
    try {
        $devices = & $Script:AdbPath devices 2>&1
        $connected = @()
        foreach ($line in $devices) {
            if ($line -match "^(emulator-\d+|[\w\d]+)\s+device$") {
                $connected += $matches[1]
            }
        }
        return $connected
    } catch {
        return @()
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
#                              CHECK FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

function Test-Prerequisites {
    $totalChecks = 7
    $currentCheck = 0
    $issues = @()
    $warnings = @()
    
    Write-Host ""
    Write-Host "    ────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "    📋 PREREQUISITES CHECK" -ForegroundColor White
    Write-Host "    ────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    # Check 1: Node.js
    $currentCheck++
    Write-Step -StepNumber $currentCheck -TotalSteps $totalChecks -Message "Checking Node.js installation" -Status "RUNNING"
    try {
        $nodeVersion = node --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-SubStep "Node.js version: $nodeVersion" "Green"
            
            # Check Node version >= 20
            $versionNum = [int]($nodeVersion -replace '[^\d].*', '' -replace 'v', '')
            if ($versionNum -lt 20) {
                $warnings += "Node.js version $nodeVersion is below recommended v20+"
                Write-SubStep "Warning: Recommended version is v20+" "Yellow"
            }
        } else {
            throw "Node.js not found"
        }
    } catch {
        $issues += "Node.js is not installed. Download from https://nodejs.org"
        Write-SubStep "Node.js NOT FOUND" "Red"
    }
    
    # Check 2: npm
    $currentCheck++
    Write-Step -StepNumber $currentCheck -TotalSteps $totalChecks -Message "Checking npm installation" -Status "RUNNING"
    try {
        $npmVersion = npm --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-SubStep "npm version: v$npmVersion" "Green"
        } else {
            throw "npm not found"
        }
    } catch {
        $issues += "npm is not installed"
        Write-SubStep "npm NOT FOUND" "Red"
    }
    
    # Check 3: Android SDK (ADB)
    $currentCheck++
    Write-Step -StepNumber $currentCheck -TotalSteps $totalChecks -Message "Checking Android SDK (ADB)" -Status "RUNNING"
    if (Test-Path $Script:AdbPath) {
        $adbVersion = & $Script:AdbPath version 2>&1 | Select-Object -First 1
        Write-SubStep "ADB found: $adbVersion" "Green"
    } elseif (Test-Command "adb") {
        $adbVersion = adb version 2>&1 | Select-Object -First 1
        Write-SubStep "ADB found in PATH: $adbVersion" "Green"
        $Script:AdbPath = "adb"
    } else {
        $issues += "Android SDK (ADB) not found. Install Android Studio."
        Write-SubStep "ADB NOT FOUND" "Red"
    }
    
    # Check 4: Emulator
    $currentCheck++
    Write-Step -StepNumber $currentCheck -TotalSteps $totalChecks -Message "Checking Android Emulator" -Status "RUNNING"
    if (Test-Path $Script:EmulatorPath) {
        $avds = Get-AvailableEmulators
        if ($avds.Count -gt 0) {
            Write-SubStep "Found $($avds.Count) AVD(s): $($avds -join ', ')" "Green"
        } else {
            $warnings += "No Android Virtual Devices (AVDs) found. Create one in Android Studio."
            Write-SubStep "No AVDs configured" "Yellow"
        }
    } else {
        $warnings += "Android Emulator not found at default location"
        Write-SubStep "Emulator path not found" "Yellow"
    }
    
    # Check 5: Project dependencies
    $currentCheck++
    Write-Step -StepNumber $currentCheck -TotalSteps $totalChecks -Message "Checking project dependencies" -Status "RUNNING"
    $nodeModulesPath = Join-Path $Script:ProjectRoot "node_modules"
    if (Test-Path $nodeModulesPath) {
        $moduleCount = (Get-ChildItem -Path $nodeModulesPath -Directory).Count
        Write-SubStep "node_modules found ($moduleCount packages)" "Green"
    } else {
        $warnings += "node_modules not found. Run 'npm install' first."
        Write-SubStep "node_modules NOT FOUND - npm install required" "Yellow"
    }
    
    # Check 6: Android build files
    $currentCheck++
    Write-Step -StepNumber $currentCheck -TotalSteps $totalChecks -Message "Checking Android build configuration" -Status "RUNNING"
    $buildGradle = Join-Path $Script:ProjectRoot "android\app\build.gradle"
    if (Test-Path $buildGradle) {
        Write-SubStep "Android build.gradle found" "Green"
    } else {
        $issues += "Android build files missing"
        Write-SubStep "build.gradle NOT FOUND" "Red"
    }
    
    # Check 7: Port 8081
    $currentCheck++
    Write-Step -StepNumber $currentCheck -TotalSteps $totalChecks -Message "Checking Metro port (8081)" -Status "RUNNING"
    try {
        $portInUse = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
        if ($portInUse) {
            $processId = $portInUse.OwningProcess
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            $warnings += "Port 8081 is in use by $($process.ProcessName) (PID: $processId)"
            Write-SubStep "Port 8081 IN USE by $($process.ProcessName)" "Yellow"
        } else {
            Write-SubStep "Port 8081 is available" "Green"
        }
    } catch {
        Write-SubStep "Port 8081 is available" "Green"
    }
    
    # Return results
    return @{
        Issues = $issues
        Warnings = $warnings
        HasIssues = $issues.Count -gt 0
        HasWarnings = $warnings.Count -gt 0
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
#                              ACTION FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

function Start-Emulator {
    param([string]$AvdName = "")
    
    Write-Host ""
    Write-Host "    ────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "    📱 STARTING ANDROID EMULATOR" -ForegroundColor White
    Write-Host "    ────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    # Check if emulator is already running
    if (Get-EmulatorStatus) {
        Write-Host ""
        Write-Host "    ✅ An emulator is already running!" -ForegroundColor Green
        
        $devices = Get-ConnectedDevices
        foreach ($device in $devices) {
            Write-SubStep "Connected: $device" "Green"
        }
        return $true
    }
    
    # Get available AVDs
    $avds = Get-AvailableEmulators
    
    if ($avds.Count -eq 0) {
        Write-Host ""
        Write-Host "    ❌ No Android Virtual Devices found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "    To create an AVD:" -ForegroundColor Yellow
        Write-Host "    1. Open Android Studio" -ForegroundColor White
        Write-Host "    2. Go to Tools → Device Manager" -ForegroundColor White
        Write-Host "    3. Click 'Create Device'" -ForegroundColor White
        Write-Host "    4. Select 'Pixel 7' → Next" -ForegroundColor White
        Write-Host "    5. Download 'API 34' → Next → Finish" -ForegroundColor White
        Write-Host ""
        return $false
    }
    
    # Select AVD
    if ([string]::IsNullOrWhiteSpace($AvdName)) {
        if ($avds.Count -eq 1) {
            $AvdName = $avds[0].Trim()
            Write-Host ""
            Write-Host "    📱 Using emulator: " -NoNewline -ForegroundColor Cyan
            Write-Host $AvdName -ForegroundColor Yellow
        } else {
            $choice = Show-Menu -Title "Select an Emulator" -Options $avds -DefaultOption "1"
            $index = [int]$choice - 1
            if ($index -ge 0 -and $index -lt $avds.Count) {
                $AvdName = $avds[$index].Trim()
            } else {
                $AvdName = $avds[0].Trim()
            }
        }
    }
    
    Write-Host ""
    Write-Host "    🚀 Launching emulator: $AvdName" -ForegroundColor Cyan
    Write-Log "Starting emulator: $AvdName"
    
    # Start emulator in background
    try {
        $emulatorArgs = @(
            "-avd", $AvdName,
            "-no-snapshot-load",
            "-no-audio"
        )
        
        Start-Process -FilePath $Script:EmulatorPath -ArgumentList $emulatorArgs -WindowStyle Minimized
        
        Write-Host ""
        Write-Host "    ⏳ Waiting for emulator to boot..." -ForegroundColor Yellow
        
        # Wait for emulator to boot (max 120 seconds)
        $timeout = 120
        $elapsed = 0
        $bootComplete = $false
        
        while ($elapsed -lt $timeout -and -not $bootComplete) {
            Start-Sleep -Seconds 3
            $elapsed += 3
            
            # Check if device is connected
            $devices = Get-ConnectedDevices
            if ($devices.Count -gt 0) {
                # Check boot status
                $bootStatus = & $Script:AdbPath shell getprop sys.boot_completed 2>&1
                if ($bootStatus -match "1") {
                    $bootComplete = $true
                }
            }
            
            # Progress indicator
            $progress = [math]::Floor(($elapsed / $timeout) * 100)
            Write-Host "`r    ⏳ Boot progress: $progress% ($elapsed/$timeout seconds)     " -NoNewline -ForegroundColor Yellow
        }
        
        Write-Host ""
        
        if ($bootComplete) {
            Write-Host ""
            Write-Host "    ✅ Emulator booted successfully!" -ForegroundColor Green
            Start-Sleep -Seconds 2
            return $true
        } else {
            Write-Host ""
            Write-Host "    ⚠️ Emulator boot timeout. It might still be starting..." -ForegroundColor Yellow
            Write-Host "       Please wait for the emulator to fully load." -ForegroundColor Yellow
            return $true
        }
    } catch {
        Write-Host ""
        Write-Host "    ❌ Failed to start emulator: $($_.Exception.Message)" -ForegroundColor Red
        Write-Log "Emulator start failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Stop-MetroBundler {
    Write-Host ""
    Write-Host "    🧹 Cleaning up Metro bundler..." -ForegroundColor Yellow
    
    try {
        # Find and kill processes on port 8081
        $portConnections = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
        if ($portConnections) {
            $pids = $portConnections | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($pid in $pids) {
                if ($pid -and $pid -ne 0) {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-SubStep "Stopping $($process.ProcessName) (PID: $pid)" "Yellow"
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    }
                }
            }
            Start-Sleep -Seconds 2
            Write-SubStep "Metro bundler cleaned" "Green"
        } else {
            Write-SubStep "No process on port 8081" "Gray"
        }
        return $true
    } catch {
        Write-SubStep "Warning: Could not clean port 8081" "Yellow"
        return $true
    }
}

function Install-Dependencies {
    Write-Host ""
    Write-Host "    ────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "    📦 INSTALLING DEPENDENCIES" -ForegroundColor White
    Write-Host "    ────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    Push-Location $Script:ProjectRoot
    
    try {
        Write-Host ""
        Write-Host "    Running npm install..." -ForegroundColor Yellow
        Write-Log "Running npm install"
        
        $installOutput = npm install 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ Dependencies installed successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "    ❌ npm install failed!" -ForegroundColor Red
            Write-Host $installOutput -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "    ❌ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

function Start-MetroBundler {
    param([bool]$ResetCache = $false)
    
    Write-Host ""
    Write-Host "    ────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "    ⚡ STARTING METRO BUNDLER" -ForegroundColor White
    Write-Host "    ────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    # First clean up any existing Metro
    Stop-MetroBundler
    
    Push-Location $Script:ProjectRoot
    
    try {
        # Setup port forwarding
        Write-Host ""
        Write-Host "    Setting up port forwarding..." -ForegroundColor Yellow
        & $Script:AdbPath reverse tcp:8081 tcp:8081 2>&1 | Out-Null
        Write-SubStep "Port forwarding configured (8081)" "Green"
        
        # Build Metro arguments
        $metroArgs = @("start", "--", "--host", "0.0.0.0", "--port", "8081")
        if ($ResetCache) {
            $metroArgs += "--reset-cache"
            Write-SubStep "Cache reset enabled" "Yellow"
        }
        
        Write-Host ""
        Write-Host "    Launching Metro bundler in new window..." -ForegroundColor Yellow
        
        # Start Metro in a new PowerShell window
        $metroScript = @"
Set-Location '$Script:ProjectRoot'
`$host.UI.RawUI.WindowTitle = 'PakUni Metro Bundler'
Write-Host '════════════════════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host '  PakUni Metro Bundler' -ForegroundColor Yellow
Write-Host '  Press Ctrl+C to stop' -ForegroundColor Gray
Write-Host '════════════════════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''
npm $($metroArgs -join ' ')
Write-Host ''
Write-Host 'Metro bundler stopped. Press any key to close...' -ForegroundColor Yellow
`$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"@
        
        $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($metroScript))
        Start-Process powershell -ArgumentList "-NoExit", "-EncodedCommand", $encodedCommand
        
        Write-Host ""
        Write-Host "    ⏳ Waiting for Metro to start..." -ForegroundColor Yellow
        
        # Wait for Metro to be ready
        $timeout = 30
        $elapsed = 0
        $metroReady = $false
        
        while ($elapsed -lt $timeout -and -not $metroReady) {
            Start-Sleep -Seconds 2
            $elapsed += 2
            
            try {
                $portCheck = Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue
                if ($portCheck) {
                    $metroReady = $true
                }
            } catch {}
            
            Write-Host "`r    ⏳ Metro starting: $elapsed/$timeout seconds     " -NoNewline -ForegroundColor Yellow
        }
        
        Write-Host ""
        
        if ($metroReady) {
            Write-Host ""
            Write-Host "    ✅ Metro bundler is running!" -ForegroundColor Green
            Write-Log "Metro bundler started successfully"
            return $true
        } else {
            Write-Host ""
            Write-Host "    ⚠️ Metro may still be starting..." -ForegroundColor Yellow
            return $true
        }
    } catch {
        Write-Host ""
        Write-Host "    ❌ Failed to start Metro: $($_.Exception.Message)" -ForegroundColor Red
        Write-Log "Metro start failed: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        Pop-Location
    }
}

function Build-And-Install-App {
    param([bool]$CleanBuild = $false)
    
    Write-Host ""
    Write-Host "    ────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "    🔨 BUILDING AND INSTALLING APP" -ForegroundColor White
    Write-Host "    ────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    Push-Location $Script:ProjectRoot
    
    try {
        if ($CleanBuild) {
            Write-Host ""
            Write-Host "    Cleaning previous build..." -ForegroundColor Yellow
            
            # Clean Android build cache
            $gradleCache = Join-Path $Script:ProjectRoot "android\.gradle"
            $appBuild = Join-Path $Script:ProjectRoot "android\app\build"
            
            if (Test-Path $appBuild) {
                Remove-Item -Recurse -Force $appBuild -ErrorAction SilentlyContinue
                Write-SubStep "Cleaned app/build" "Green"
            }
        }
        
        Write-Host ""
        Write-Host "    Running react-native run-android..." -ForegroundColor Yellow
        Write-Host "    This may take several minutes on first build..." -ForegroundColor Gray
        Write-Host ""
        Write-Log "Starting Android build"
        
        # Run the build
        $buildProcess = Start-Process -FilePath "npx" -ArgumentList "react-native", "run-android" `
            -WorkingDirectory $Script:ProjectRoot -NoNewWindow -PassThru -Wait
        
        if ($buildProcess.ExitCode -eq 0) {
            Write-Host ""
            Write-Host "    ✅ App built and installed successfully!" -ForegroundColor Green
            Write-Log "Build completed successfully"
            return $true
        } else {
            Write-Host ""
            Write-Host "    ❌ Build failed with exit code: $($buildProcess.ExitCode)" -ForegroundColor Red
            Write-Log "Build failed with exit code: $($buildProcess.ExitCode)" "ERROR"
            return $false
        }
    } catch {
        Write-Host ""
        Write-Host "    ❌ Build error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Log "Build error: $($_.Exception.Message)" "ERROR"
        return $false
    } finally {
        Pop-Location
    }
}

function Invoke-CleanBuild {
    Write-Host ""
    Write-Host "    ────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "    🧹 FULL CLEAN BUILD" -ForegroundColor White
    Write-Host "    ────────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    
    Push-Location $Script:ProjectRoot
    
    $steps = 6
    $current = 0
    
    try {
        # Step 1: Stop Metro
        $current++
        Write-Step -StepNumber $current -TotalSteps $steps -Message "Stopping Metro bundler" -Status "RUNNING"
        Stop-MetroBundler
        Write-Step -StepNumber $current -TotalSteps $steps -Message "Metro bundler stopped" -Status "SUCCESS"
        
        # Step 2: Clean node_modules
        $current++
        Write-Step -StepNumber $current -TotalSteps $steps -Message "Removing node_modules" -Status "RUNNING"
        $nodeModulesPath = Join-Path $Script:ProjectRoot "node_modules"
        if (Test-Path $nodeModulesPath) {
            Remove-Item -Recurse -Force $nodeModulesPath -ErrorAction SilentlyContinue
            Write-SubStep "node_modules removed" "Green"
        } else {
            Write-SubStep "node_modules not found" "Gray"
        }
        Write-Step -StepNumber $current -TotalSteps $steps -Message "node_modules cleaned" -Status "SUCCESS"
        
        # Step 3: Clean Android build
        $current++
        Write-Step -StepNumber $current -TotalSteps $steps -Message "Cleaning Android build cache" -Status "RUNNING"
        
        $androidPaths = @(
            "android\.gradle",
            "android\app\build",
            "android\build"
        )
        
        foreach ($path in $androidPaths) {
            $fullPath = Join-Path $Script:ProjectRoot $path
            if (Test-Path $fullPath) {
                Remove-Item -Recurse -Force $fullPath -ErrorAction SilentlyContinue
                Write-SubStep "$path cleaned" "Green"
            }
        }
        Write-Step -StepNumber $current -TotalSteps $steps -Message "Android cache cleaned" -Status "SUCCESS"
        
        # Step 4: Clean Metro cache
        $current++
        Write-Step -StepNumber $current -TotalSteps $steps -Message "Cleaning Metro cache" -Status "RUNNING"
        $metroCachePath = "$env:TEMP\metro-*"
        Remove-Item -Path $metroCachePath -Recurse -Force -ErrorAction SilentlyContinue
        Write-SubStep "Metro cache cleaned" "Green"
        Write-Step -StepNumber $current -TotalSteps $steps -Message "Metro cache cleaned" -Status "SUCCESS"
        
        # Step 5: Reinstall dependencies
        $current++
        Write-Step -StepNumber $current -TotalSteps $steps -Message "Installing dependencies" -Status "RUNNING"
        Write-Host ""
        npm install 2>&1 | Out-Host
        Write-Host ""
        Write-Step -StepNumber $current -TotalSteps $steps -Message "Dependencies installed" -Status "SUCCESS"
        
        # Step 6: Summary
        $current++
        Write-Step -StepNumber $current -TotalSteps $steps -Message "Clean build complete" -Status "SUCCESS"
        
        Write-Host ""
        Write-Host "    ✅ Full clean completed successfully!" -ForegroundColor Green
        Write-Host "       Run this script again to build the app." -ForegroundColor Cyan
        
        return $true
    } catch {
        Write-Host ""
        Write-Host "    ❌ Clean build failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
#                              MAIN MENU
# ═══════════════════════════════════════════════════════════════════════════════

function Show-MainMenu {
    Write-Banner
    
    $menuOptions = @(
        "🚀 Quick Launch (Auto-setup everything and run app)",
        "📱 Start/Select Emulator only",
        "⚡ Start Metro Bundler only",
        "🔨 Build & Install App only",
        "🧹 Full Clean Build (fix issues)",
        "🔍 Run Prerequisites Check",
        "📦 Install Dependencies (npm install)",
        "❌ Exit"
    )
    
    $choice = Show-Menu -Title "What would you like to do?" -Options $menuOptions -DefaultOption "1"
    return $choice
}

function Invoke-QuickLaunch {
    Write-Host ""
    Write-Host "    ════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "    🚀 QUICK LAUNCH - Full Setup and Run" -ForegroundColor Yellow
    Write-Host "    ════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $totalSteps = 5
    $currentStep = 0
    $success = $true
    
    # Step 1: Prerequisites check
    $currentStep++
    Write-Step -StepNumber $currentStep -TotalSteps $totalSteps -Message "Checking prerequisites" -Status "RUNNING"
    $prereqResult = Test-Prerequisites
    
    if ($prereqResult.HasIssues) {
        Write-Host ""
        Write-Host "    ❌ Critical issues found:" -ForegroundColor Red
        foreach ($issue in $prereqResult.Issues) {
            Write-Host "       • $issue" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "    Please fix the above issues and try again." -ForegroundColor Yellow
        return $false
    }
    
    Write-Step -StepNumber $currentStep -TotalSteps $totalSteps -Message "Prerequisites OK" -Status "SUCCESS"
    
    # Check if dependencies need to be installed
    $nodeModulesPath = Join-Path $Script:ProjectRoot "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        $currentStep++
        Write-Step -StepNumber $currentStep -TotalSteps $totalSteps -Message "Installing dependencies" -Status "RUNNING"
        if (-not (Install-Dependencies)) {
            Write-Step -StepNumber $currentStep -TotalSteps $totalSteps -Message "Dependencies failed" -Status "FAILED"
            return $false
        }
        Write-Step -StepNumber $currentStep -TotalSteps $totalSteps -Message "Dependencies installed" -Status "SUCCESS"
    }
    
    # Step 2: Start emulator
    $currentStep++
    Write-Step -StepNumber $currentStep -TotalSteps $totalSteps -Message "Starting emulator" -Status "RUNNING"
    if (-not (Start-Emulator)) {
        $continue = Show-Confirmation "Emulator issue detected. Continue anyway?" $false
        if (-not $continue) {
            return $false
        }
    }
    Write-Step -StepNumber $currentStep -TotalSteps $totalSteps -Message "Emulator ready" -Status "SUCCESS"
    
    # Step 3: Start Metro
    $currentStep++
    Write-Step -StepNumber $currentStep -TotalSteps $totalSteps -Message "Starting Metro bundler" -Status "RUNNING"
    
    # Ask about cache reset
    $resetCache = Show-Confirmation "Reset Metro cache? (Recommended for first run)" $true
    
    if (-not (Start-MetroBundler -ResetCache $resetCache)) {
        Write-Step -StepNumber $currentStep -TotalSteps $totalSteps -Message "Metro bundler failed" -Status "FAILED"
        return $false
    }
    Write-Step -StepNumber $currentStep -TotalSteps $totalSteps -Message "Metro bundler running" -Status "SUCCESS"
    
    # Step 4: Build and install
    $currentStep++
    Write-Step -StepNumber $currentStep -TotalSteps $totalSteps -Message "Building and installing app" -Status "RUNNING"
    if (-not (Build-And-Install-App -CleanBuild $false)) {
        Write-Step -StepNumber $currentStep -TotalSteps $totalSteps -Message "Build failed" -Status "FAILED"
        
        $retry = Show-Confirmation "Build failed. Try clean build?" $true
        if ($retry) {
            if (-not (Build-And-Install-App -CleanBuild $true)) {
                return $false
            }
        } else {
            return $false
        }
    }
    Write-Step -StepNumber $currentStep -TotalSteps $totalSteps -Message "App installed" -Status "SUCCESS"
    
    # Success!
    Write-Host ""
    Write-Host "    ════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "    🎉 SUCCESS! PakUni is now running!" -ForegroundColor Green
    Write-Host "    ════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "    📱 The app should be visible on your emulator." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "    Keyboard shortcuts in Metro terminal:" -ForegroundColor Yellow
    Write-Host "    ├── r = Reload app" -ForegroundColor White
    Write-Host "    ├── d = Open Dev Menu" -ForegroundColor White
    Write-Host "    └── j = Open Debugger" -ForegroundColor White
    Write-Host ""
    Write-Host "    Log file: $Script:LogFile" -ForegroundColor Gray
    Write-Host ""
    
    return $true
}

# ═══════════════════════════════════════════════════════════════════════════════
#                              ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════

try {
    # Ensure we're in the right directory
    if (-not (Test-Path (Join-Path $Script:ProjectRoot "package.json"))) {
        Write-Host "❌ Error: Could not find PakUni project at $Script:ProjectRoot" -ForegroundColor Red
        exit 1
    }
    
    # Main loop
    $exitScript = $false
    
    while (-not $exitScript) {
        $choice = Show-MainMenu
        
        switch ($choice) {
            "1" {
                # Quick Launch
                Invoke-QuickLaunch
                Write-Host ""
                Write-Host "    Press any key to continue..." -ForegroundColor Gray
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "2" {
                # Start Emulator
                Start-Emulator
                Write-Host ""
                Write-Host "    Press any key to continue..." -ForegroundColor Gray
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "3" {
                # Start Metro
                $resetCache = Show-Confirmation "Reset Metro cache?" $false
                Start-MetroBundler -ResetCache $resetCache
                Write-Host ""
                Write-Host "    Press any key to continue..." -ForegroundColor Gray
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "4" {
                # Build App
                $cleanBuild = Show-Confirmation "Perform clean build?" $false
                Build-And-Install-App -CleanBuild $cleanBuild
                Write-Host ""
                Write-Host "    Press any key to continue..." -ForegroundColor Gray
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "5" {
                # Full Clean Build
                $confirm = Show-Confirmation "This will delete node_modules and rebuild. Continue?" $true
                if ($confirm) {
                    Invoke-CleanBuild
                }
                Write-Host ""
                Write-Host "    Press any key to continue..." -ForegroundColor Gray
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "6" {
                # Prerequisites Check
                Write-Banner
                Test-Prerequisites
                
                Write-Host ""
                Write-Host "    Press any key to continue..." -ForegroundColor Gray
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "7" {
                # Install Dependencies
                Install-Dependencies
                Write-Host ""
                Write-Host "    Press any key to continue..." -ForegroundColor Gray
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
            "8" {
                # Exit
                $exitScript = $true
                Write-Host ""
                Write-Host "    👋 Goodbye! Happy coding!" -ForegroundColor Cyan
                Write-Host ""
            }
            default {
                Write-Host ""
                Write-Host "    ⚠️ Invalid option. Please try again." -ForegroundColor Yellow
                Start-Sleep -Seconds 1
            }
        }
    }
} catch {
    Write-Host ""
    Write-Host "    ❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Stack trace:" -ForegroundColor DarkRed
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed
    Write-Log "Unexpected error: $($_.Exception.Message)" "ERROR"
    exit 1
}
