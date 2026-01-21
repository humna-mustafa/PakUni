# IMMEDIATE FIX NEEDED - USB Connection Issue

## Current Problem
- Device keeps going OFFLINE/UNAUTHORIZED
- Likely USB cable or ADB daemon connection issue
- Need to re-establish stable connection

## IMMEDIATE STEPS TO TAKE NOW

### Step 1: Physical Device Check
1. **Disconnect the USB cable** from your device
2. Wait 5 seconds
3. **Reconnect the USB cable**
4. On your device screen, if you see the USB debugging prompt again:
   - Tap **"Allow"**
   - Check **"Always allow from this computer"**
   - Tap **"Allow"**

### Step 2: ADB Reset (in PowerShell)
```powershell
adb kill-server
Start-Sleep -Seconds 5
adb start-server
Start-Sleep -Seconds 3
adb devices
```

Wait for output showing `device` (not `offline` or `unauthorized`):
```
List of devices attached
07363251AS000734        device
```

### Step 3: Verify Connection
```powershell
adb shell getprop ro.build.version.release
```

This should return Android version (e.g., `13`, `14`). If it returns error, connection is not stable.

## If Still Having Issues

### Option A: Try Different USB Port
- Unplug device
- **Try a different USB port** on your computer (not a USB hub)
- Reconnect device
- Approve USB debugging on device
- Run: `adb devices`

### Option B: Update ADB Drivers (Windows)
```powershell
# Check current Android SDK platform-tools version
adb version

# If outdated, update Android SDK
# Open Android Studio > SDK Manager > SDK Tools > Platform Tools > Install
```

### Option C: Use WiFi Instead of USB
```powershell
# 1. Connect device via USB first (must be online)
adb devices
# Output should show 'device'

# 2. Get device IP
adb shell getprop dhcp.wlan0.ipaddress
# Output: 192.168.x.x

# 3. Connect over WiFi
adb connect 192.168.x.x:5555

# 4. Disconnect USB, verify WiFi connection
adb devices
# Should still show device connected
```

## Once Device is ONLINE

Run this command:
```powershell
cd e:\pakuni\PakUni\android
.\gradlew.bat installDebug
```

Monitor output - should see:
```
...
> Task :app:installDebug
Installing APK 'app-debug.apk' on '07363251AS000734'
```

Then app should launch on your device!

## Metro Bundler Status
- ✅ Already running on port 8081
- ✅ Waiting for app to connect
- When app starts, Metro will show bundle completion

---

**KEY POINT**: The USB connection is unstable. This is NOT a code issue - it's a hardware/driver issue.

**SOLUTION**: 
1. Try different USB port
2. Or switch to WiFi connection
3. Or reinstall Android USB drivers

Once stable connection is established, everything will work!
