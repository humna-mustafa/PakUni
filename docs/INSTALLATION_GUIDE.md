# 📱 PakUni APK Installation & Deployment Guide

## ✅ Available APK

### Debug APK (Ready to Install)
- **File**: `app-debug.apk`
- **Size**: 126.39 MB
- **Location**: `E:\pakuni\PakUni\android\app\build\outputs\apk\debug\app-debug.apk`
- **Status**: ✅ Ready for installation
- **Build Time**: Optimized (2-3 minutes with your configuration)

---

## 🚀 Installation Methods

### Method 1: ADB (Android Debug Bridge) - RECOMMENDED

#### Prerequisites
```powershell
# Install Android SDK platform-tools if you don't have ADB
# Download from: https://developer.android.com/tools/releases/platform-tools

# Verify ADB is installed
adb version
```

#### Steps
```powershell
# 1. Connect your Android device via USB
# 2. Enable USB Debugging on device (Settings > Developer Options > USB Debugging)
# 3. Verify device is detected
adb devices

# 4. Install the APK
adb install -r "E:\pakuni\PakUni\android\app\build\outputs\apk\debug\app-debug.apk"

# 5. Launch the app
adb shell am start -n com.pakuni/com.pakuni.MainActivity
```

#### Uninstall
```powershell
adb uninstall com.pakuni
```

---

### Method 2: Android Emulator

#### Prerequisites
- Android Studio installed
- Emulator created and running

#### Steps
```powershell
# 1. Start Android Studio
# 2. Open Device Manager > Start an AVD (Android Virtual Device)
# 3. Once emulator is running, drag-drop APK onto emulator window
# Or use ADB:
adb install "E:\pakuni\PakUni\android\app\build\outputs\apk\debug\app-debug.apk"
```

---

### Method 3: Manual Installation (File Transfer)

#### Steps
1. Connect Android device to computer via USB
2. Copy `app-debug.apk` to device storage
3. Open File Manager on device
4. Navigate to Downloads or Documents
5. Tap `app-debug.apk` to install
6. Accept permissions and confirm installation

---

### Method 4: Google Play Store (Release APK Only)

For production deployment:
```powershell
# Build release APK
cd e:\pakuni\PakUni\android
.\gradlew.bat assembleRelease --parallel
```

Then:
1. Create signed bundle (.aab file)
2. Upload to Google Play Console
3. Set release notes and rollout strategy
4. Publish to Play Store

---

## 📊 Installation Troubleshooting

### "Unknown Sources" Error
**Solution**: 
1. Open Settings on Android device
2. Navigate to Security or App Management
3. Enable "Install Unknown Apps" or "Unknown Sources"
4. Retry installation

### "Parser Error" or "Installation Failed"
**Causes & Solutions**:
```
❌ APK file corrupted
✅ Solution: Rebuild APK - .\gradlew.bat assembleDebug

❌ Incompatible Android version
✅ Solution: Device needs Android 5.0+ (API 21+)

❌ Insufficient storage
✅ Solution: Free up at least 200MB on device

❌ Same app already installed with different signature
✅ Solution: Uninstall first - adb uninstall com.pakuni
```

### "Device Not Found" (ADB)
**Solution**:
```powershell
# Restart ADB daemon
adb kill-server
adb start-server

# Reconnect device and retry
adb devices
```

### "Package Already Installed"
**Solution**:
```powershell
# Reinstall with -r flag (replace)
adb install -r "app-debug.apk"

# Or uninstall first
adb uninstall com.pakuni
adb install "app-debug.apk"
```

---

## 🔍 Verify Installation

### Check if App is Installed
```powershell
adb shell pm list packages | findstr pakuni
```

### Clear App Data
```powershell
adb shell pm clear com.pakuni
```

### View App Permissions
```powershell
adb shell pm dump com.pakuni | findstr "permission"
```

### Uninstall App
```powershell
adb uninstall com.pakuni
```

---

## 📋 App Permissions Required

The PakUni app requires these Android permissions:
- ✅ **Internet**: For Supabase backend connectivity
- ✅ **Storage**: For caching university data offline
- ✅ **Network**: For real-time updates

These will be prompted when app is first launched.

---

## 🧪 Testing the App

### Test Scenarios

1. **First Launch**
   - App should initialize with default data
   - Ask for permission confirmations
   - Show university list

2. **Search Functionality**
   - Search for "University of Karachi"
   - Filter by city
   - Sort results

3. **Offline Mode**
   - Disable network
   - App should still show cached data

4. **Theme**
   - Toggle dark/light theme
   - Settings should persist

5. **Demo Account**
   - Login with demo credentials
   - View saved universities
   - Check profile information

### Demo Login Credentials
See: `DEMO_USERS_CREDENTIALS.md`

---

## 📊 APK Statistics

| Property | Value |
|----------|-------|
| **File Name** | app-debug.apk |
| **File Size** | 126.39 MB |
| **Minimum Android** | 5.0 (API 21) |
| **Target Android** | 14.0 (API 34) |
| **Supported Architectures** | arm64-v8a |
| **Package Name** | com.pakuni |
| **Version** | 1.0.0 |
| **Build Type** | Debug |
| **Signing** | Debug Key |

---

## 🔐 Security Notes

### Debug APK (Current)
⚠️ Uses debug signing certificate (for development only)
- Not suitable for production/Play Store
- Can be installed on any device
- Contains debug symbols

### Release APK (Production)
✅ Should use signed keystore
- For Google Play Store
- Unique signature per app
- Requires keystore management

---

## 📱 Supported Devices

### Minimum Requirements
- **Android Version**: 5.0 (API 21) or higher
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 200MB free space
- **Architecture**: arm64-v8a

### Tested/Compatible Devices
- ✅ Google Pixel (all models)
- ✅ Samsung Galaxy (S7+, A series, Note series)
- ✅ OnePlus (all recent models)
- ✅ Xiaomi (all recent models)
- ✅ Android Emulator

---

## 🚀 Quick Install Command

For instant installation (if ADB is set up):
```powershell
adb install -r "E:\pakuni\PakUni\android\app\build\outputs\apk\debug\app-debug.apk"
```

---

## 📚 Additional Resources

- **Android Debugging**: [Android Official Guide](https://developer.android.com/studio/debug)
- **ADB Documentation**: [Android Debug Bridge](https://developer.android.com/tools/adb)
- **PakUni Setup**: See `SETUP_GUIDE.md`
- **Troubleshooting**: See `TROUBLESHOOTING.md`

---

## ✅ Installation Checklist

- [ ] APK file location verified
- [ ] Device/Emulator connected
- [ ] ADB installed and working
- [ ] USB Debugging enabled (if using physical device)
- [ ] Sufficient storage on device
- [ ] Installation method chosen
- [ ] Installation completed successfully
- [ ] App launches without errors
- [ ] Demo data loads correctly

---

**Status**: ✅ **READY FOR INSTALLATION**
**Last Updated**: January 16, 2026

