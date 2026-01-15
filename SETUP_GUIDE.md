# PakUni - React Native CLI Setup Guide

## ✅ Prerequisites Status

| Requirement | Status | Version |
|-------------|--------|---------|
| Node.js (18+) | ✅ Installed | v22.20.0 |
| JDK (17+) | ✅ Installed | OpenJDK 21.0.8 |
| Android SDK | ✅ Installed | Located at `%LOCALAPPDATA%\Android\Sdk` |
| ANDROID_HOME | ✅ Set | `%LOCALAPPDATA%\Android\Sdk` |
| JAVA_HOME | ✅ Set | `C:\Program Files\Microsoft\jdk-21.0.8.9-hotspot` |

## 🚀 Quick Start Commands

### 1. Start Metro Bundler (Terminal 1)
```powershell
cd E:\pakuni\PakUni
npm start
```

### 2. Run on Android (Terminal 2)
```powershell
cd E:\pakuni\PakUni
npx react-native run-android
```

## 📱 Android Emulator Setup (One-Time)

### Option A: Using Android Studio (Recommended)
1. Open Android Studio
2. Go to **Tools → Device Manager**
3. Click **Create Device**
4. Select **Pixel 7** (or any phone)
5. Click **Next**
6. Download and select **API 34** (Android 14) or **API 35** (Android 15)
7. Click **Next → Finish**
8. Click the **Play ▶️** button to start the emulator

### Option B: Using Command Line
```powershell
# Install required SDK components via Android Studio SDK Manager first
# Then create AVD:
& "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin\avdmanager.bat" create avd -n "Pixel_7_API_34" -k "system-images;android-34;google_apis;x86_64" -d "pixel_7"

# Start emulator:
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_7_API_34
```

## 🔥 Fast Refresh (Hot Reload)

Fast Refresh is **enabled by default** in React Native 0.83+!

### How it works:
- Save any `.js`, `.jsx`, `.ts`, or `.tsx` file
- Changes appear instantly in the app
- Component state is preserved when possible

### Toggle Fast Refresh:
1. Press `d` in Metro terminal to open Dev Menu
2. Or shake the device/press `Ctrl+M` in emulator
3. Select "Enable/Disable Fast Refresh"

## 📲 Run on Real Android Device

### 1. Enable Developer Options on Phone
- Go to **Settings → About Phone**
- Tap **Build Number** 7 times
- Go back to **Settings → Developer Options**
- Enable **USB Debugging**

### 2. Connect and Verify
```powershell
# Check if device is connected
adb devices

# Should show your device like:
# List of devices attached
# XXXXXXX device
```

### 3. Run the App
```powershell
cd E:\pakuni\PakUni
npx react-native run-android
```

## 🔧 Troubleshooting

### Clean Build (Gradle Cache)
```powershell
cd E:\pakuni\PakUni\android
./gradlew clean
cd ..
npx react-native run-android
```

### Full Cache Clear
```powershell
cd E:\pakuni\PakUni

# Clean all caches
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\.gradle -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\app\build -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Reinstall
npm install

# Rebuild
npx react-native run-android
```

### Metro Cache Reset
```powershell
npx react-native start --reset-cache
```

### Common Build Errors

#### Error: "SDK location not found"
```powershell
# Create local.properties file
cd E:\pakuni\PakUni\android
echo "sdk.dir=$($env:LOCALAPPDATA -replace '\\','\\\\')\Android\Sdk" | Out-File -Encoding UTF8 local.properties
```

#### Error: "Could not find tools.jar"
Ensure JAVA_HOME points to JDK (not JRE):
```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.8.9-hotspot"
```

#### Error: "Execution failed for task ':app:installDebug'"
```powershell
# Uninstall existing app from device/emulator
adb uninstall com.pakuni
npx react-native run-android
```

#### Error: "Unable to load script"
Make sure Metro is running:
```powershell
npm start
```

## 📁 Project Structure

```
PakUni/
├── android/          # Android native code
├── ios/              # iOS native code (for future)
├── src/              # Your React Native code (create this)
│   ├── components/   # Reusable components
│   ├── screens/      # App screens
│   ├── navigation/   # Navigation setup
│   ├── services/     # API calls, utilities
│   └── assets/       # Images, fonts
├── App.tsx           # Main app entry
├── index.js          # App registration
└── package.json      # Dependencies
```

## 🛠️ Recommended VS Code Extensions

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- React Native Tools
- TypeScript Hero

## 📦 Useful Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Metro bundler |
| `npx react-native run-android` | Build and run on Android |
| `npx react-native run-android --mode=release` | Build release APK |
| `npm test` | Run tests |
| `npx react-native doctor` | Check environment setup |

## 🔄 Environment Variables (Already Set)

Add these to your PowerShell profile for persistence:
```powershell
# Add to $PROFILE
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:Path;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator"
```

---
**Created:** January 13, 2026  
**React Native Version:** 0.83.1  
**Project:** PakUni
