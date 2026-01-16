# ============================================================
# Reliable Metro Server for React Native Development
# ============================================================
# Features:
# - Auto-restart on crash
# - Runs in background
# - Accessible from physical devices over WiFi
# - Status monitoring
# - Logs to file
# ============================================================

param(
    [switch]$Background,
    [switch]$Status,
    [switch]$Stop,
    [switch]$Logs,
    [int]$MaxRestarts = 10,
    [int]$RestartDelay = 3
)

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_DIR = Split-Path -Parent $SCRIPT_DIR
$LOG_DIR = Join-Path $PROJECT_DIR "logs"
$PID_FILE_PATH = Join-Path $LOG_DIR "metro-server.pid"
$LOG_FILE = Join-Path $LOG_DIR "metro-server.log"
$STATUS_FILE = Join-Path $LOG_DIR "metro-status.json"

# Create logs directory
if (-not (Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
}

# Get local IP address for WiFi access
function Get-LocalIP {
    $ip = Get-NetIPAddress -AddressFamily IPv4 | 
          Where-Object { $_.InterfaceAlias -match "Wi-Fi|WiFi|Ethernet|LAN" -and $_.IPAddress -notmatch "^127\." } | 
          Select-Object -First 1 -ExpandProperty IPAddress
    if (-not $ip) {
        $ip = (Get-NetIPAddress -AddressFamily IPv4 | 
               Where-Object { $_.IPAddress -notmatch "^127\." } | 
               Select-Object -First 1).IPAddress
    }
    return $ip
}

# Check server status
function Get-ServerStatus {
    if (Test-Path $STATUS_FILE) {
        return Get-Content $STATUS_FILE | ConvertFrom-Json
    }
    return $null
}

# Update status file
function Update-Status {
    param(
        [string]$State,
        [int]$ProcessId = 0,
        [int]$RestartCount = 0,
        [string]$Error = ""
    )
    
    $status = @{
        state = $State
        pid = $ProcessId
        restartCount = $RestartCount
        lastUpdate = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        localIP = Get-LocalIP
        port = 8081
        error = $Error
    }
    
    $status | ConvertTo-Json | Set-Content $STATUS_FILE
}

# Show status
if ($Status) {
    $status = Get-ServerStatus
    if ($status) {
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "   METRO SERVER STATUS" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        
        $stateColor = switch ($status.state) {
            "Running" { "Green" }
            "Starting" { "Yellow" }
            "Stopped" { "Red" }
            default { "White" }
        }
        
        Write-Host "  Status:        " -NoNewline
        Write-Host $status.state -ForegroundColor $stateColor
        Write-Host "  PID:           $($status.pid)"
        Write-Host "  Restart Count: $($status.restartCount)"
        Write-Host "  Last Update:   $($status.lastUpdate)"
        Write-Host ""
        Write-Host "  LOCAL ACCESS:" -ForegroundColor Yellow
        Write-Host "    http://localhost:8081"
        Write-Host ""
        Write-Host "  WIFI ACCESS (for physical device):" -ForegroundColor Yellow
        Write-Host "    http://$($status.localIP):8081" -ForegroundColor Green
        Write-Host ""
        
        if ($status.error) {
            Write-Host "  Last Error: $($status.error)" -ForegroundColor Red
        }
        
        # Check if process is actually running
        if ($status.pid -gt 0) {
            $process = Get-Process -Id $status.pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "  Process is ALIVE" -ForegroundColor Green
            } else {
                Write-Host "  Process is DEAD (stale PID)" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
    } else {
        Write-Host "`n  Server status unknown. Start with: .\scripts\reliable-metro-server.ps1" -ForegroundColor Yellow
    }
    exit 0
}

# Show logs
if ($Logs) {
    if (Test-Path $LOG_FILE) {
        Get-Content $LOG_FILE -Tail 50
    } else {
        Write-Host "No logs found." -ForegroundColor Yellow
    }
    exit 0
}

# Stop server
if ($Stop) {
    Write-Host "`nStopping Metro Server..." -ForegroundColor Yellow
    
    # Kill all node processes running Metro
    Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        if ($cmdLine -match "metro|react-native") {
            Write-Host "  Killing process $($_.Id)..." -ForegroundColor Gray
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
    }
    
    Update-Status -State "Stopped"
    Write-Host "Metro Server stopped." -ForegroundColor Green
    exit 0
}

# Main server function
function Start-MetroServer {
    $restartCount = 0
    $localIP = Get-LocalIP
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "   RELIABLE METRO SERVER" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Auto-restart: ON (max $MaxRestarts restarts)" -ForegroundColor Green
    Write-Host "  WiFi Access:  http://${localIP}:8081" -ForegroundColor Yellow
    Write-Host "  Local Access: http://localhost:8081" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Commands:" -ForegroundColor Gray
    Write-Host "    Ctrl+C    - Stop server" -ForegroundColor Gray
    Write-Host "    r         - Reload app on device" -ForegroundColor Gray
    Write-Host "    d         - Open dev menu" -ForegroundColor Gray
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Set-Location $PROJECT_DIR
    
    while ($restartCount -lt $MaxRestarts) {
        $restartCount++
        
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Starting Metro bundler (attempt $restartCount/$MaxRestarts)..." -ForegroundColor Cyan
        Update-Status -State "Starting" -RestartCount $restartCount
        
        # Start Metro with host binding for WiFi access
        $env:REACT_NATIVE_PACKAGER_HOSTNAME = $localIP
        
        try {
            # Start the process and capture output
            $process = Start-Process -FilePath "npx" `
                -ArgumentList "react-native", "start", "--host", "0.0.0.0" `
                -NoNewWindow `
                -PassThru `
                -RedirectStandardOutput $LOG_FILE `
                -RedirectStandardError "$LOG_DIR\metro-error.log"
            
            $process.Id | Set-Content $PID_FILE_PATH
            Update-Status -State "Running" -ProcessId $process.Id -RestartCount $restartCount
            
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Metro started with PID: $($process.Id)" -ForegroundColor Green
            Write-Host ""
            Write-Host "  Physical Device Setup:" -ForegroundColor Yellow
            Write-Host "  1. Connect device: adb connect <device-ip>:5555"
            Write-Host "  2. Port forward:   adb reverse tcp:8081 tcp:8081"
            Write-Host "  3. Run app:        npm run android"
            Write-Host ""
            Write-Host "  OR set Metro server in app:"
            Write-Host "  Settings -> Debug server host & port -> $localIP`:8081"
            Write-Host ""
            
            # Wait for process to exit
            $process.WaitForExit()
            $exitCode = $process.ExitCode
            
            if ($exitCode -eq 0) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Metro exited normally." -ForegroundColor Yellow
                break
            } else {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Metro crashed with exit code: $exitCode" -ForegroundColor Red
                Update-Status -State "Crashed" -RestartCount $restartCount -Error "Exit code: $exitCode"
            }
        }
        catch {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Error: $_" -ForegroundColor Red
            Update-Status -State "Error" -RestartCount $restartCount -Error $_.ToString()
        }
        
        if ($restartCount -lt $MaxRestarts) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Restarting in $RestartDelay seconds..." -ForegroundColor Yellow
            Start-Sleep -Seconds $RestartDelay
        }
    }
    
    if ($restartCount -ge $MaxRestarts) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Max restarts reached. Server stopped." -ForegroundColor Red
        Update-Status -State "Failed" -RestartCount $restartCount -Error "Max restarts reached"
    }
}

# Run in background
if ($Background) {
    Write-Host "Starting Metro Server in background..." -ForegroundColor Yellow
    
    $scriptPath = $MyInvocation.MyCommand.Path
    $job = Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$scriptPath`"" `
        -WindowStyle Hidden -PassThru
    
    Write-Host "Background process started with PID: $($job.Id)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Cyan
    Write-Host "  Check status: .\scripts\reliable-metro-server.ps1 -Status"
    Write-Host "  View logs:    .\scripts\reliable-metro-server.ps1 -Logs"
    Write-Host "  Stop server:  .\scripts\reliable-metro-server.ps1 -Stop"
    exit 0
}

# Run in foreground (default)
Start-MetroServer
