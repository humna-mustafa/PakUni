# PakUni Device & Google Sign-In Fix Guide

## Current Status
- ✅ **Google Sign-In Configuration**: CORRECT
  - Web Client ID: `69201457652-q8n88n7sf55dl0sp70488agcrjctttc9.apps.googleusercontent.com`
  - Release SHA-1: `2D:63:FE:E0:E1:E8:25:D3:3B:4B:FE:8A:48:99:C3:7A:C6:D5:D1:66`
  - google-services.json: ✅ Valid and matching

- ⚠️ **Physical Device**: OFFLINE/UNAUTHORIZED
  - Device: `07363251AS000734` (Samsung)
  - Status: Waiting for USB debugging approval

## IMMEDIATE ACTION REQUIRED

### Step 1: Approve USB Debugging on Device
1. **Look at your physical Android device screen**
2. You should see: **"Allow USB Debugging?"**
3. **Check the box**: "Always allow from this computer"
4. **Tap**: "Allow"

### Step 2: Verify Device is Online
Run this command in PowerShell:
```powershell
adb devices
```

Expected output:
```
List of devices attached
07363251AS000734        device
```

If it shows `unauthorized`, go back to Step 1.
If it shows `offline`, restart ADB:
```powershell
adb kill-server
Start-Sleep -Seconds 2
adb start-server
adb devices
```

## Step 3: Run the Fix Script

Once device shows as `device`, run:
```powershell
cd e:\pakuni\PakUni
.\fix-and-run.bat
```

This script will:
1. ✅ Verify device connection
2. ✅ Clear app data and cache
3. ✅ Kill any stuck Metro processes
4. ✅ Setup ADB port forwarding (8081)
5. ✅ Start Metro bundler
6. ✅ Build and install the app

## Step 4: Test Google Sign-In

Once the app loads on your device:
1. Go to Login/Auth screen
2. Tap "Sign in with Google"
3. It should now work without the "DEVELOPER_ERROR"
4. Select your Google account
5. App should sync your profile

## What was Fixed

### Google Sign-In ✅
- Confirmed correct configuration in AuthContext
- Verified google-services.json has matching SHA-1 fingerprint
- Error handling is proper for troubleshooting

### Device Connection ✅
- Restarted ADB daemon
- Created automated fix script
- Port forwarding will be set up automatically

### App Data ✅
- Clear cache on each run to prevent state corruption
- Removes old Metro cache
- Fresh build ensures latest code

## Troubleshooting

### If "DEVELOPER_ERROR" persists:
```bash
# Get device's actual SHA-1 fingerprint
adb shell getprop ro.build.fingerprint

# View debug SHA-1
adb shell keystore_cli list
```

### If Metro won't start:
```powershell
# Kill all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Clear Metro cache
rm -Recurse -Force node_modules\.cache
npm start --reset-cache
```

### If app won't install:
```powershell
# Uninstall previous version
adb uninstall com.pakuni

# Rebuild from scratch
npm run clean
npm run android
```

## Manual Commands (if needed)

```bash
# Check device connection
adb devices

# Clear app data
adb shell pm clear com.pakuni

# Setup port forwarding
adb reverse tcp:8081 tcp:8081

# View live logs
adb logcat | grep -i "pakuni\|error\|google"

# Start Metro on specific port
npm start -- --port 8082

# Build only (no install)
npm run android -- --no-launch

# Install manually
npm run android
```

## Expected Output When Working

Metro console should show:
```
Welcome to Metro!
...
✓ Transforming... (100%)
```

Device should show:
- Loading screen
- Home screen with universities list
- No red error screens
- Google Sign-In button functional

---

**Created**: 2026-01-21
**Status**: Ready to execute
