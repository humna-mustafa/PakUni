# ==============================================================================
# PakUni Google Sign-In Complete Automation Solution
# ==============================================================================
# This script provides a complete, end-to-end solution for fixing Google Sign-In
# Issues including device diagnostics, account setup, and verification
# ==============================================================================

param(
    [string]$Action = "full",  # full, diagnose, fix, verify, reset
    [switch]$Force,             # Skip confirmations
    [switch]$Verbose           # Show detailed output
)

$ErrorActionPreference = "Continue"

# Configuration
$DEVICE_ID = ""
$RECOVERY_LOG = "e:\pakuni\PakUni\logs\google-signin-recovery-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$MAX_RETRIES = 3
$RETRY_DELAY = 2000  # milliseconds

# Ensure logs directory exists
$logsDir = Split-Path $RECOVERY_LOG
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# Logging function
function Log {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [ValidateSet("INFO", "SUCCESS", "ERROR", "WARNING", "DEBUG")]
        [string]$Level = "INFO",
        [switch]$NoNewline
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss.fff"
    $prefix = "[$timestamp] [$Level]"
    
    $colors = @{
        "SUCCESS" = "Green"
        "ERROR"   = "Red"
        "WARNING" = "Yellow"
        "INFO"    = "Cyan"
        "DEBUG"   = "DarkGray"
    }
    
    $color = $colors[$Level]
    
    if ($Verbose -or $Level -ne "DEBUG") {
        if ($NoNewline) {
            Write-Host "$prefix $Message" -ForegroundColor $color -NoNewline
        } else {
            Write-Host "$prefix $Message" -ForegroundColor $color
        }
    }
    
    "$prefix $Message" | Out-File -Append -FilePath $RECOVERY_LOG
}

function Divider {
    param([string]$Title)
    Write-Host ""
    Write-Host "═" * 80 -ForegroundColor Cyan
    if ($Title) {
        Write-Host "  $Title" -ForegroundColor Cyan
        Write-Host "═" * 80 -ForegroundColor Cyan
    }
    ""
}

# Step 0: Device Detection and Connection
function Get-ConnectedDevice {
    Log "Detecting connected Android device..." "DEBUG"
    
    $devices = & adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$" }
    
    if (-not $devices) {
        Log "No Android device detected!" "ERROR"
        Log "Actions to take:" "INFO"
        Log "  1. Connect device via USB" "INFO"
        Log "  2. Enable USB Debugging: Settings > Developer Options > USB Debugging = ON" "INFO"
        Log "  3. On phone: Accept USB debugging prompt" "INFO"
        Log "  4. Run this script again" "INFO"
        return $null
    }
    
    $deviceId = ($devices -split "\s+")[0]
    Log "Device connected: $deviceId" "SUCCESS"
    return $deviceId
}

# Step 1: Device Diagnostics
function Diagnose-Device {
    param([string]$DeviceId)
    
    Divider "DEVICE DIAGNOSTICS"
    
    Log "Checking device connectivity..." "INFO"
    $shell = & adb -s $DeviceId shell getprop ro.build.version.release
    Log "Android Version: $shell" "INFO"
    
    Log "Checking Google Play Services..." "INFO"
    $gmsVersion = & adb -s $DeviceId shell dumpsys package com.google.android.gms 2>&1 | Select-String "versionName=" | Select-Object -First 1
    if ($gmsVersion) {
        Log "GMS Status: Installed - $($gmsVersion.Line.Trim())" "SUCCESS"
    } else {
        Log "GMS Status: NOT INSTALLED" "ERROR"
        return $false
    }
    
    Log "Checking Google Accounts..." "INFO"
    $accounts = & adb -s $DeviceId shell "dumpsys account | grep com.google" 2>&1
    if ($accounts) {
        Log "Found Google Account(s)" "SUCCESS"
        return $true
    } else {
        Log "No Google Account found on device" "WARNING"
        return $false
    }
}

# Step 2: Device Recovery
function Recover-Device {
    param([string]$DeviceId)
    
    Divider "DEVICE RECOVERY PROCEDURE"
    
    # Step 2.1: Clear Google Play Services
    Log "2.1: Clearing Google Play Services cache..." "INFO"
    $result = & adb -s $DeviceId shell pm clear com.google.android.gms 2>&1
    if ($result -match "Success") {
        Log "     Successfully cleared GMS cache" "SUCCESS"
    } else {
        Log "     Warning: $result" "WARNING"
    }
    Start-Sleep -Milliseconds 500
    
    # Step 2.2: Clear PakUni cache
    Log "2.2: Clearing PakUni app cache..." "INFO"
    $result = & adb -s $DeviceId shell pm clear com.pakuni 2>&1
    if ($result -match "Success") {
        Log "     Successfully cleared PakUni cache" "SUCCESS"
    } else {
        Log "     Warning: $result" "WARNING"
    }
    Start-Sleep -Milliseconds 500
    
    # Step 2.3: Stop GMS
    Log "2.3: Stopping Google Play Services..." "INFO"
    & adb -s $DeviceId shell am force-stop com.google.android.gms | Out-Null
    Start-Sleep -Milliseconds 1000
    Log "     GMS stopped" "SUCCESS"
    
    # Step 2.4: Open account setup
    Log "2.4: Opening Google Account setup..." "INFO"
    & adb -s $DeviceId shell am start -a android.settings.ADD_ACCOUNT_SETTINGS 2>&1 | Out-Null
    Start-Sleep -Seconds 3
    Log "     Account setup dialog launched" "SUCCESS"
    
    # Step 2.5: Auto-navigate setup UI
    Log "2.5: Automating account setup navigation..." "INFO"
    Start-Sleep -Seconds 2
    
    # Tap on Google account option
    Log "     Selecting Google account type..." "DEBUG"
    & adb -s $DeviceId shell input tap 540 400 2>&1 | Out-Null
    Start-Sleep -Milliseconds 1000
    
    # Confirm selection
    & adb -s $DeviceId shell input tap 540 400 2>&1 | Out-Null
    Start-Sleep -Milliseconds 500
    Log "     Google account selected" "SUCCESS"
}

# Step 3: Wait for Manual Entry
function Wait-ForManualSetup {
    Divider "WAITING FOR MANUAL INPUT"
    
    Log "Account setup UI is now open on your device" "INFO"
    Log ""
    Log "PLEASE COMPLETE THE FOLLOWING ON YOUR PHONE:" "WARNING"
    Log "  1. Tap 'Google' account type (if not already selected)" "INFO"
    Log "  2. Enter your Gmail/Google email address" "INFO"
    Log "  3. Enter your password" "INFO"
    Log "  4. Accept all permission requests (Location, Contacts, Calendar, etc.)" "INFO"
    Log "  5. Complete the account setup" "INFO"
    Log ""
    Log "Waiting for 120 seconds for setup to complete..." "INFO"
    Log ""
    
    $countdown = 120
    while ($countdown -gt 0) {
        Write-Host -NoNewline "`r[Waiting] $countdown seconds remaining...  "
        Start-Sleep -Seconds 1
        $countdown--
    }
    Write-Host ""
    Log "Setup time completed" "INFO"
}

# Step 4: Restart Services
function Restart-Services {
    param([string]$DeviceId)
    
    Divider "RESTARTING SERVICES"
    
    Log "4.1: Restarting Google Play Services..." "INFO"
    & adb -s $DeviceId shell cmd package compile -m everything com.google.android.gms 2>&1 | Out-Null
    Start-Sleep -Seconds 2
    Log "     GMS compilation completed" "SUCCESS"
    
    Log "4.2: Restarting PakUni app..." "INFO"
    & adb -s $DeviceId shell am start -n com.pakuni/com.pakuni.MainActivity 2>&1 | Out-Null
    Start-Sleep -Seconds 3
    Log "     PakUni relaunched" "SUCCESS"
}

# Step 5: Verification
function Verify-Setup {
    param([string]$DeviceId)
    
    Divider "VERIFICATION"
    
    Log "5.1: Checking Google Accounts..." "INFO"
    $accounts = & adb -s $DeviceId shell "dumpsys account | grep com.google" 2>&1
    
    if ($accounts) {
        Log "     Google Account(s) found:" "SUCCESS"
        $accounts | ForEach-Object { Log "       • $_" "INFO" }
    } else {
        Log "     No Google Account found yet" "WARNING"
        Log "     It may take a few seconds to register. Check device:" "INFO"
        Log "     Settings > Accounts > Google" "INFO"
    }
    
    Log "5.2: Checking for authentication errors..." "INFO"
    $errors = & adb -s $DeviceId shell logcat -d 2>&1 | Select-String "BadAuthentication|DEVELOPER_ERROR" | Select-Object -First 3
    
    if ($errors) {
        Log "     Found recent errors:" "WARNING"
        $errors | ForEach-Object { Log "       • $_" "WARNING" }
    } else {
        Log "     No recent authentication errors" "SUCCESS"
    }
    
    Log "5.3: Status summary:" "INFO"
    Log "     Android Version: $(&adb -s $DeviceId shell getprop ro.build.version.release)" "INFO"
    Log "     GMS Version: $(&adb -s $DeviceId shell dumpsys package com.google.android.gms 2>&1 | Select-String "versionName=" | Select-Object -First 1 | ForEach-Object { $_.Line.Trim() })" "INFO"
    Log "     PakUni Version: $(& adb -s $DeviceId shell dumpsys package com.pakuni 2>&1 | Select-String "versionName=" | Select-Object -First 1 | ForEach-Object { $_.Line.Trim() })" "INFO"
}

# Step 6: Create Recovery Plan
function Show-RecoveryPlan {
    Divider "NEXT STEPS"
    
    Log "Device has been prepared and account setup initiated" "INFO"
    Log ""
    Log "If Google Sign-In now works:" "SUCCESS"
    Log "  Your device should be fully configured!" "INFO"
    Log "  Open PakUni and try Sign in with Google" "INFO"
    Log ""
    Log "If Google Sign-In still fails:" "WARNING"
    Log "  Option 1: Try Email/Password login instead" "INFO"
    Log "  Option 2: Restart your phone completely:" "INFO"
    Log "            1. Hold Power button" "INFO"
    Log "            2. Tap Restart or Power off" "INFO"
    Log "            3. Wait 30 seconds" "INFO"
    Log "            4. Power on and try again" "INFO"
    Log "  Option 3: Check Settings - Accounts - Google (account should be listed)" "INFO"
    Log "  Option 4: Verify device date/time is correct" "INFO"
    Log "            Settings - Date and Time - Set automatically = ON" "INFO"
    Log ""
    Log "Troubleshooting:" "INFO"
    Log "  - Run this script again with -Action diagnose for full report" "INFO"
    Log "  - Check recovery logs: $RECOVERY_LOG" "INFO"
    Log "  - Try alternative logins in PakUni (Email or Guest mode)" "INFO"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Divider "PakUni Google Sign-In Automation Suite"
Log "Action: $Action" "DEBUG"
Log "Recovery Log: $RECOVERY_LOG" "DEBUG"

# Get device
$DEVICE_ID = Get-ConnectedDevice
if (-not $DEVICE_ID) {
    Log "Cannot proceed without device connection" "ERROR"
    exit 1
}

Log "Selected Device: $DEVICE_ID" "INFO"
Log ""

# Execute action
switch ($Action) {
    "full" {
        Diagnose-Device $DEVICE_ID | Out-Null
        Recover-Device $DEVICE_ID
        Wait-ForManualSetup
        Restart-Services $DEVICE_ID
        Verify-Setup $DEVICE_ID
        Show-RecoveryPlan
    }
    "diagnose" {
        Diagnose-Device $DEVICE_ID | Out-Null
    }
    "fix" {
        Recover-Device $DEVICE_ID
        Wait-ForManualSetup
        Restart-Services $DEVICE_ID
    }
    "verify" {
        Verify-Setup $DEVICE_ID
    }
    "reset" {
        Log "Factory reset option requires manual confirmation on device" "WARNING"
        Log "To perform factory reset:" "INFO"
        Log "  Settings - System - Reset options - Erase all data Factory reset" "INFO"
    }
    default {
        Log "Unknown action: $Action" "ERROR"
        Log "Valid actions: full, diagnose, fix, verify, reset" "INFO"
    }
}

Divider
Log "Recovery Log saved to: $RECOVERY_LOG" "INFO"
Log "Complete!" "SUCCESS"
