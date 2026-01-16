# ============================================================
# Simple Reliable Metro Server
# ============================================================
# A straightforward script that runs Metro with auto-restart
# ============================================================

param(
    [switch]$Status,
    [switch]$Stop,
    [int]$MaxRestarts = 10
)

$PROJECT_DIR = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$LOG_DIR = Join-Path $PROJECT_DIR "logs"
$STATUS_FILE = Join-Path $LOG_DIR "metro-status.json"

# Create logs directory
if (-not (Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
}

# Get local IP address
function Get-LocalIP {
    try {
        $ip = (Get-NetIPAddress -AddressFamily IPv4 | 
               Where-Object { $_.InterfaceAlias -match "Wi-Fi|Ethernet" -and $_.IPAddress -notmatch "^127\." } | 
               Select-Object -First 1).IPAddress
        if (-not $ip) {
            $ip = (Get-NetIPAddress -AddressFamily IPv4 | 
                   Where-Object { $_.IPAddress -notmatch "^127\." -and $_.IPAddress -notmatch "^169\." } | 
                   Select-Object -First 1).IPAddress
        }
        return $ip
    } catch {
        return "localhost"
    }
}

# Save status
function Save-Status($state, $processId = 0) {
    @{
        state = $state
        processId = $processId
        lastUpdate = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        ip = Get-LocalIP
    } | ConvertTo-Json | Set-Content $STATUS_FILE -Force
}

# Stop command
if ($Stop) {
    Write-Host "`n  Stopping Metro Server..." -ForegroundColor Yellow
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Save-Status "Stopped"
    Write-Host "  Stopped." -ForegroundColor Green
    exit 0
}

# Status command
if ($Status) {
    if (Test-Path $STATUS_FILE) {
        $s = Get-Content $STATUS_FILE | ConvertFrom-Json
        Write-Host "`n  ===== METRO SERVER STATUS =====" -ForegroundColor Cyan
        Write-Host "  State:   $($s.state)"
        Write-Host "  IP:      $($s.ip)"
        Write-Host "  Updated: $($s.lastUpdate)"
        Write-Host ""
        Write-Host "  WiFi URL: http://$($s.ip):8081" -ForegroundColor Green
        Write-Host "  ================================" -ForegroundColor Cyan
    } else {
        Write-Host "`n  No status. Start with: npm run server" -ForegroundColor Yellow
    }
    exit 0
}

# Main
$localIP = Get-LocalIP
$restartCount = 0

Write-Host ""
Write-Host "  =============================================" -ForegroundColor Cyan
Write-Host "    PAKUNI - RELIABLE METRO SERVER" -ForegroundColor Cyan
Write-Host "  =============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "    WiFi Access:  http://${localIP}:8081" -ForegroundColor Green
Write-Host "    Local Access: http://localhost:8081" -ForegroundColor Yellow
Write-Host ""
Write-Host "    Auto-restart: Enabled (max $MaxRestarts)" -ForegroundColor Gray
Write-Host "    Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""
Write-Host "  =============================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PROJECT_DIR
$env:REACT_NATIVE_PACKAGER_HOSTNAME = $localIP

while ($restartCount -lt $MaxRestarts) {
    $restartCount++
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Starting Metro (attempt $restartCount/$MaxRestarts)..." -ForegroundColor Cyan
    Save-Status "Running"
    
    try {
        # Run Metro directly - keeps output visible
        npx react-native start --host 0.0.0.0
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Metro stopped normally." -ForegroundColor Yellow
            Save-Status "Stopped"
            break
        }
    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Error: $_" -ForegroundColor Red
    }
    
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Metro crashed. Restarting in 3 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

if ($restartCount -ge $MaxRestarts) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Max restarts reached." -ForegroundColor Red
    Save-Status "Failed"
}
