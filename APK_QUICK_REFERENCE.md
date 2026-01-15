# 🚀 PakUni APK Quick Reference Card

## 📦 APK Details

```
Filename:        app-debug.apk
Size:            126.39 MB
Location:        E:\pakuni\PakUni\android\app\build\outputs\apk\debug
Package:         com.pakuni
Version:         1.0.0
Min SDK:         Android 5.0 (API 21)
Target SDK:      Android 14.0 (API 34)
Architecture:    arm64-v8a (64-bit)
Build Type:      Debug
Status:          ✅ Ready to Install
```

---

## ⚡ Quick Commands

### Install APK
```powershell
adb install -r "E:\pakuni\PakUni\android\app\build\outputs\apk\debug\app-debug.apk"
```

### Launch App
```powershell
adb shell am start -n com.pakuni/com.pakuni.MainActivity
```

### Uninstall App
```powershell
adb uninstall com.pakuni
```

### Reinstall App
```powershell
adb install -r app-debug.apk
```

### Check if Installed
```powershell
adb shell pm list packages | findstr pakuni
```

### View App Logs
```powershell
adb logcat | findstr pakuni
```

### Clear App Data
```powershell
adb shell pm clear com.pakuni
```

---

## 🔨 Build Commands

### Debug APK (Fast, ~2-3 mins)
```powershell
cd e:\pakuni\PakUni\android
.\gradlew.bat assembleDebug --parallel
```

### Clean & Rebuild
```powershell
.\gradlew.bat clean
.\gradlew.bat assembleDebug --parallel
```

### Check Build Status
```powershell
.\gradlew.bat --status
```

### Stop Gradle Daemon
```powershell
.\gradlew.bat --stop
```

---

## 📱 Device Setup

### Enable USB Debugging
1. Settings > About Phone
2. Tap Build Number 7 times
3. Back to Settings > Developer Options
4. Enable USB Debugging
5. Connect via USB

### List Connected Devices
```powershell
adb devices
```

### Restart ADB
```powershell
adb kill-server
adb start-server
```

---

## 🎮 App Features

✅ 500+ University Database
✅ Advanced Search & Filtering
✅ Offline Support
✅ Dark/Light Theme
✅ Demo User Accounts
✅ Gesture Navigation
✅ Real-time Updates

---

## 📊 Build Optimization Stats

| Before | After |
|--------|-------|
| 15+ min | 2-3 min |
| 4 architectures | 1 architecture |
| 2GB memory | 4GB memory |
| Sequential | Parallel |
| ❌ | ✅ **6-8x faster** |

---

## 🔍 Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Device not found | `adb kill-server` then `adb start-server` |
| Installation failed | `adb uninstall com.pakuni` then reinstall |
| App crashes | Check logs: `adb logcat` |
| Slow build | Use: `.\gradlew.bat --parallel` |
| Out of memory | Restart: `.\gradlew.bat --stop` |

---

## 📂 Important Files

| File | Purpose |
|------|---------|
| app-debug.apk | The installable APK |
| android/gradle.properties | Build configuration |
| android/app/build.gradle | App build settings |
| INSTALLATION_GUIDE.md | Detailed install steps |
| DEPLOYMENT_SUMMARY.md | Complete deployment info |
| BUILD_SPEED_OPTIMIZATION.md | Optimization details |

---

## ✅ Pre-Installation Checklist

- [ ] APK file location verified
- [ ] Device connected via USB
- [ ] USB Debugging enabled
- [ ] ADB installed (`adb version` works)
- [ ] Device appears in `adb devices`
- [ ] ~200MB free space on device

---

## 🎯 Installation Steps (3 Steps)

### Step 1: Connect Device
```powershell
adb devices  # Verify device shows up
```

### Step 2: Install APK
```powershell
adb install -r "E:\pakuni\PakUni\android\app\build\outputs\apk\debug\app-debug.apk"
```

### Step 3: Launch App
```powershell
adb shell am start -n com.pakuni/com.pakuni.MainActivity
```

---

## 🚀 One-Liner Install & Launch

```powershell
adb install -r "E:\pakuni\PakUni\android\app\build\outputs\apk\debug\app-debug.apk" && adb shell am start -n com.pakuni/com.pakuni.MainActivity
```

---

## 📊 Supported Devices

✅ Android 5.0+ (API 21+)
✅ 99% of modern phones (Pixel, Samsung, OnePlus, Xiaomi, etc.)
✅ Android Emulators
✅ 2GB+ RAM minimum
✅ 200MB+ storage space

---

## 🔐 Security Notes

- **Debug APK**: For development only
- **Debug Signing**: Not for Play Store
- **Release APK**: Build for production deployment

---

## 📚 Documentation

| Document | When to Use |
|----------|-------------|
| INSTALLATION_GUIDE.md | Detailed install methods |
| DEPLOYMENT_SUMMARY.md | Complete deployment info |
| BUILD_SPEED_OPTIMIZATION.md | Build optimization details |
| QUICK_START.md | Getting started |
| TROUBLESHOOTING.md | Problem solving |

---

## 🔗 Resources

- **ADB Setup**: https://developer.android.com/tools/adb
- **Android Debug**: https://developer.android.com/studio/debug
- **React Native**: https://reactnative.dev

---

## 💡 Pro Tips

1. **Use `--parallel`** flag for faster builds
2. **Keep daemon running** for faster subsequent builds
3. **Use `-r` flag** to reinstall without uninstall
4. **Check logs** with `adb logcat | findstr pakuni`
5. **Enable offline mode** for faster builds

---

## 📞 Quick Help

```powershell
# Help with any issue
.\gradlew.bat help

# Check gradle version
.\gradlew.bat --version

# View all build tasks
.\gradlew.bat tasks

# Display daemon status
.\gradlew.bat --status
```

---

**Last Updated**: January 16, 2026
**APK Status**: ✅ Ready
**Build Time**: 2-3 minutes
**File Size**: 126.39 MB

