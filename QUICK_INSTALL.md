# 🚀 PakUni v1.2.0 - Installation Quick Start

## 📦 Files Available

```
PakUni-v1.2.0.apk          24.4 MB  - Ready to install
Install-PakUni.ps1         Script   - PowerShell installer
Install-PakUni.bat         Script   - Batch file installer
APK_INSTALLATION_v1.2.0.md Doc      - Detailed guide
```

---

## ⚡ Three Ways to Install

### Option 1: Using Installer Script (EASIEST)

**Windows Batch File:**
```
Double-click: Install-PakUni.bat

Then select:
  1 = Install only
  2 = Install & Launch
  3 = Uninstall
```

**Windows PowerShell:**
```powershell
# Install only
.\Install-PakUni.ps1

# Install and launch
.\Install-PakUni.ps1 -Launch

# Uninstall
.\Install-PakUni.ps1 -Uninstall
```

---

### Option 2: Direct ADB Command (FASTEST)

```powershell
adb install -r "PakUni-v1.2.0.apk"
```

Then launch:
```powershell
adb shell am start -n com.pakuni/.MainActivity
```

Or in one command:
```powershell
adb install -r "PakUni-v1.2.0.apk" && adb shell am start -n com.pakuni/.MainActivity
```

---

### Option 3: File Transfer (NO TOOLS)

1. Connect phone via USB
2. Copy `PakUni-v1.2.0.apk` to phone Downloads
3. Open Files app on phone
4. Tap `PakUni-v1.2.0.apk`
5. Tap Install
6. Open when complete

---

## ✅ Pre-Installation Checklist

Before installing, ensure:

- [ ] Android device connected via USB
- [ ] USB Debugging enabled (Settings > Developer Options > USB Debugging)
- [ ] Tapped "Trust" when computer connection prompted
- [ ] Sufficient storage on phone (200MB minimum)
- [ ] ADB installed (if using command line)

---

## 🎯 Step-by-Step: Using Batch Installer

**Easiest method - Just 3 steps:**

1. **Double-click** `Install-PakUni.bat`
2. **Select option** (2 to install & launch)
3. **Done!** App opens on your device

That's it! No command line needed.

---

## 📱 After Installation

### First Launch
- University list loads automatically
- 500+ universities available
- Works offline with bundled data

### Demo Accounts (Optional)
```
Email:    student@pakuni.app
Password: Student@2026!
```

### Features
✅ Search 500+ universities
✅ Offline browsing
✅ Dark/Light themes
✅ University details
✅ Advanced filtering

---

## 🔧 Troubleshooting

### "Device not found" Error
```
1. Disconnect USB cable
2. Reconnect USB cable
3. Tap "Trust" on phone
4. Try again
```

### "ADB not found" Error
```
1. Install Android SDK Platform Tools
2. Add to system PATH
3. Restart terminal/script
4. Try again
```

### "Installation failed" Error
```
1. Uninstall old version: adb uninstall com.pakuni
2. Clear cache: adb shell pm clear com.pakuni
3. Retry: adb install -r PakUni-v1.2.0.apk
```

### "Blank screen" After Launch
```
1. Wait 15 seconds (loading data)
2. Check internet connection
3. Restart app if needed
```

---

## 📊 Version Information

| Property | Value |
|----------|-------|
| **Version** | 1.2.0 |
| **File Size** | 24.4 MB |
| **APK Type** | Release (Production) |
| **Android** | 5.0+ (API 21+) |
| **Architecture** | arm64-v8a |
| **Build Status** | ✅ Success |

---

## 📥 Installation Summary

```
Version:         1.2.0 (Updated)
Previous:        1.1.0
Build Time:      1 minute 2 seconds
APK Size:        24.4 MB
Supported:       Android 5.0+
Status:          Ready to Install
```

---

## 🚀 Quick Commands Reference

```powershell
# Install only
adb install -r "PakUni-v1.2.0.apk"

# Install and launch
adb install -r "PakUni-v1.2.0.apk" && adb shell am start -n com.pakuni/.MainActivity

# Check if installed
adb shell pm list packages | findstr pakuni

# View app logs
adb logcat | findstr pakuni

# Clear app cache
adb shell pm clear com.pakuni

# Uninstall
adb uninstall com.pakuni
```

---

## 💡 Pro Tips

✅ Use **Install-PakUni.bat** for simplest installation
✅ Use **Option 2** (Install & Launch) to skip manual launch
✅ Keep `PakUni-v1.2.0.apk` in project root for easy access
✅ Backup APK file for offline distribution
✅ Share installer scripts with others

---

## 📞 Getting Help

**For detailed installation guide:** 
→ See `APK_INSTALLATION_v1.2.0.md`

**For troubleshooting:**
→ See `TROUBLESHOOTING.md`

**For demo accounts:**
→ See `DEMO_USERS_CREDENTIALS.md`

---

## ✨ What's New in v1.2.0

✅ Enhanced performance
✅ Improved UI responsiveness
✅ Better offline support
✅ Optimized data loading
✅ Faster app launch

---

**Ready to Install?**

Choose your method:
1. **Easiest**: Double-click `Install-PakUni.bat`
2. **Fast**: Run `adb install -r "PakUni-v1.2.0.apk"`
3. **No Tools**: File transfer via USB

**Installation takes 2-3 minutes!**

---

Generated: January 16, 2026  
Version: 1.2.0  
Status: ✅ Ready to Install
