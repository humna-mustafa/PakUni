# Advanced Google Account Setup for PakUni
# This script automatically adds a Google Account to the device
# Handles the account setup UI programmatically

param(
    [string]$Email = "",
    [string]$Password = ""
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "PakUni: Advanced Account Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verify device is connected
$deviceCheck = & adb devices | Select-String "device$"
if (-not $deviceCheck) {
    Write-Host "[ERROR] No device connected!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Device connected" -ForegroundColor Green

# Step 1: Clear Google Play Services cache
Write-Host ""
Write-Host "Step 1: Clearing Google Play Services cache..." -ForegroundColor Yellow
& adb shell pm clear com.google.android.gms
Write-Host "[DONE]" -ForegroundColor Green

# Step 2: Clear PakUni cache
Write-Host ""
Write-Host "Step 2: Clearing PakUni app cache..." -ForegroundColor Yellow
& adb shell pm clear com.pakuni
Write-Host "[DONE]" -ForegroundColor Green

# Step 3: Stop Google Play Services
Write-Host ""
Write-Host "Step 3: Stopping Google Play Services..." -ForegroundColor Yellow
& adb shell am force-stop com.google.android.gms
Start-Sleep -Seconds 2
Write-Host "[DONE]" -ForegroundColor Green

# Step 4: Open Google Account Settings
Write-Host ""
Write-Host "Step 4: Opening Google Account setup dialog..." -ForegroundColor Yellow
& adb shell am start -a android.settings.ADD_ACCOUNT_SETTINGS
Start-Sleep -Seconds 3
Write-Host "[DONE]" -ForegroundColor Green

# Step 5: Simulate taps to navigate the setup UI
Write-Host ""
Write-Host "Step 5: Navigating account setup UI..." -ForegroundColor Yellow

# Wait for dialog to render
Start-Sleep -Seconds 2

# Tap on "Google" option (usually in the middle of account type list)
Write-Host "  - Tapping Google account option..." -ForegroundColor Cyan
& adb shell input tap 540 400
Start-Sleep -Seconds 2

# Additional tap to ensure selection
& adb shell input tap 540 400
Start-Sleep -Seconds 1

Write-Host "[DONE]" -ForegroundColor Green

# Step 6: Handle login UI if email is provided
if ($Email -and $Password) {
    Write-Host ""
    Write-Host "Step 6: Entering account credentials..." -ForegroundColor Yellow
    
    # Find email input field and tap it
    Start-Sleep -Seconds 2
    Write-Host "  - Tapping email field..." -ForegroundColor Cyan
    & adb shell input tap 540 300
    Start-Sleep -Seconds 1
    
    # Clear any existing text
    & adb shell input keyevent 211  # KEYCODE_MOVE_END
    & adb shell input keyevent 130  # KEYCODE_DEL for each character
    
    # Type email
    Write-Host "  - Entering email address..." -ForegroundColor Cyan
    & adb shell input text $Email
    Start-Sleep -Seconds 2
    
    # Tap Next button
    Write-Host "  - Tapping Next button..." -ForegroundColor Cyan
    & adb shell input tap 540 800
    Start-Sleep -Seconds 3
    
    # Enter password
    Write-Host "  - Entering password..." -ForegroundColor Cyan
    & adb shell input tap 540 350
    Start-Sleep -Seconds 1
    & adb shell input text $Password
    Start-Sleep -Seconds 2
    
    # Tap Next button
    Write-Host "  - Tapping Next button..." -ForegroundColor Cyan
    & adb shell input tap 540 800
    Start-Sleep -Seconds 3
    
    Write-Host "[DONE]" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Step 6: Waiting for manual account entry..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "!!! IMPORTANT !!!" -ForegroundColor Red
    Write-Host "Please complete the following on your phone:" -ForegroundColor Red
    Write-Host "1. Tap 'Google' if not already selected" -ForegroundColor Yellow
    Write-Host "2. Enter your Google email address" -ForegroundColor Yellow
    Write-Host "3. Enter your password" -ForegroundColor Yellow
    Write-Host "4. Accept all permission requests" -ForegroundColor Yellow
    Write-Host "5. Complete the setup" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Waiting 120 seconds for manual completion..." -ForegroundColor Magenta
    Write-Host ""
    
    for ($i = 120; $i -gt 0; $i--) {
        Write-Host -NoNewline "`r[$i seconds remaining...]"
        Start-Sleep -Seconds 1
    }
    Write-Host ""
    Write-Host "[DONE]" -ForegroundColor Green
}

# Step 7: Wait for account to be added
Write-Host ""
Write-Host "Step 7: Waiting for account to be registered..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "[DONE]" -ForegroundColor Green

# Step 8: Restart Google Play Services
Write-Host ""
Write-Host "Step 8: Restarting Google Play Services..." -ForegroundColor Yellow
& adb shell am startservice com.google.android.gms/.chimera.GmsChimeraService
Start-Sleep -Seconds 3
Write-Host "[DONE]" -ForegroundColor Green

# Step 9: Verify account was added
Write-Host ""
Write-Host "Step 9: Verifying account was added..." -ForegroundColor Yellow
$accounts = & adb shell cmd account list
if ($accounts -match "com.google") {
    Write-Host "[SUCCESS] Google Account found on device!" -ForegroundColor Green
    Write-Host $accounts
} else {
    Write-Host "[WARNING] Could not verify account yet" -ForegroundColor Yellow
    Write-Host "It may take a few seconds. Check device Settings > Accounts" -ForegroundColor Yellow
}

# Step 10: Relaunch PakUni
Write-Host ""
Write-Host "Step 10: Relaunching PakUni app..." -ForegroundColor Yellow
& adb shell am start -n com.pakuni/com.pakuni.MainActivity
Start-Sleep -Seconds 3
Write-Host "[DONE]" -ForegroundColor Green

# Final Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. PakUni app is now running on your device" -ForegroundColor Yellow
Write-Host "2. Try tapping 'Sign in with Google'" -ForegroundColor Yellow
Write-Host "3. You should now be able to sign in" -ForegroundColor Yellow
Write-Host ""
Write-Host "If it still doesn't work:" -ForegroundColor Yellow
Write-Host "- Check: Settings > Accounts > Google (account should be listed)" -ForegroundColor Cyan
Write-Host "- Restart your phone completely" -ForegroundColor Cyan
Write-Host "- Try Email/Password login as alternative" -ForegroundColor Cyan
Write-Host ""
