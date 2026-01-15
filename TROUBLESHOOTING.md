# PakUni App Troubleshooting Guide

## Common Issues and Solutions

### 1. **App Crashes Immediately on Launch**

**Problem**: App closes right after opening
- ❌ Metro is not running
- ❌ Port forwarding not configured
- ❌ Emulator not connected

**Solution**:
```bash
# Step 1: Start Metro bundler
npm start

# Step 2: In a new terminal, setup port forwarding
adb reverse tcp:8081 tcp:8081

# Step 3: Install and run the app
npm run android
```

---

### 2. **"Cannot connect to Metro" Error**

**Problem**: Red error screen showing Metro connection failure

**Causes**:
- Metro bundler not running
- Port 8081 already in use
- Firewall blocking the connection

**Solutions**:

**Option A**: Kill process on port 8081 (Windows)
```powershell
netstat -ano | findstr :8081
taskkill /PID <PID> /F
npm start
```

**Option B**: Use a different port
```bash
npm start -- --port 8082
# Then in app, change server port in dev menu
```

**Option C**: Check if Metro is actually running
```bash
npm start
# Wait 5-10 seconds for "Dev server ready" message
```

---

### 3. **"No emulator connected" Error**

**Problem**: App won't install - no emulator found

**Solution**:
```bash
# List all connected devices
adb devices

# If empty, start emulator from Android Studio
# Or use command line:
emulator -list-avds  # See available emulators
emulator -avd Pixel_7_API_34  # Start specific emulator
```

---

### 4. **"address already in use :::8081" Error**

**Problem**: Metro can't start because port is busy

**Solution**:
```powershell
# Find and kill process using port 8081
Get-NetTCPConnection -LocalPort 8081 | Stop-Process -Force
```

---

### 5. **App Loads but UI is Blank/Frozen**

**Problem**: App starts but shows white screen

**Causes**:
- Data loading issues
- Component render errors
- Navigation problems

**Solutions**:
```bash
# Clear bundler cache
rm -r $METRO_CACHE_DIR
npm start --reset-cache

# Or on Windows
rmdir /s node_modules\.cache
npm start
```

---

### 6. **JavaScript Errors in App**

**Problem**: See red error screen with JS exception

**Solution**:
```bash
# Check Metro console for detailed error logs
# Look for:
# - Import errors
# - Data parsing issues
# - Component lifecycle errors

# Reload app from Dev Menu
# Press 'd' in Metro terminal -> Reload JS Bundle
```

---

## Automated Launcher Script

Run this script to automatically setup and launch the app:

```powershell
.\scripts\run-app.ps1
```

This script will:
1. Check if emulator is running
2. Kill existing processes
3. Setup port forwarding
4. Start Metro bundler
5. Build and install the app

---

## Manual Complete Startup

If you prefer manual control:

**Terminal 1** (Metro bundler):
```bash
npm start
```

**Terminal 2** (Port forwarding and app):
```bash
adb reverse tcp:8081 tcp:8081
npm run android
```

---

## Quick Commands Reference

```bash
# Check devices
adb devices

# Clear app data
adb shell pm clear com.pakuni

# View live logs
adb logcat

# Filter for app errors
adb logcat | grep -i "pakuni\|error\|exception"

# Restart Metro on different port
npm start -- --port 8082

# Build APK (release)
./gradlew assembleRelease -p android/

# Clean build (if caching issues)
./gradlew clean -p android/
npm start --reset-cache
```

---

## Still Having Issues?

1. **Check Metro terminal** for bundling errors
2. **Check adb logcat** for runtime errors
3. **Check emulator screen** for visual errors
4. **Restart everything**:
   - Kill Metro (Ctrl+C)
   - Restart emulator
   - Run script again

---

## Development Tips

- **Reload app**: Press 'r' in Metro console
- **Open Dev Menu**: Press 'd' in Metro console or shake device
- **Debug JS**: Type 'j' in Metro console to open DevTools
- **View logs**: Keep Metro console visible while testing

