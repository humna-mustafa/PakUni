# PakUni Quick Start Guide

## 🚀 Fast Setup (5 minutes)

### Prerequisites
- ✅ Node.js v20+ installed
- ✅ Android Studio installed
- ✅ Android emulator running

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Metro Bundler
Open **Terminal 1**:
```bash
npm start
```
Wait for message: `Dev server ready. Press Ctrl+C to exit.`

### Step 3: Setup Port Forwarding
Open **Terminal 2**:
```bash
adb reverse tcp:8081 tcp:8081
```

### Step 4: Run the App
```bash
npm run android
```

**Done!** The app should now load in your emulator.

---

## 🐛 Troubleshooting

### App Crashes Immediately
1. Make sure Metro is running (Terminal 1 should show "Dev server ready")
2. Run port forwarding: `adb reverse tcp:8081 tcp:8081`
3. Reinstall: `npm run android`

### Port 8081 Already in Use
```bash
# Kill the process using port 8081
Get-Process node | Stop-Process -Force
npm start
```

### No Emulator Connected
- Open Android Studio
- Click "Device Manager" (phone icon)
- Click the play button on any emulator to start it
- Wait 30 seconds for it to fully boot

### Blank/White Screen
```bash
# Clear Metro cache and rebuild
npm start --reset-cache
# In Terminal 2, press 'r' to reload
```

---

## 📱 Commands During Development

Once the app is running:

**In Metro Terminal (Terminal 1):**
- Press `r` - Reload JavaScript code
- Press `d` - Open React Native Dev Menu
- Press `j` - Open DevTools
- Press `Ctrl+C` - Stop Metro

**In Android Emulator:**
- Press `r + r` (volume rocker twice) - Reload app
- Shake device - Open Dev Menu

---

## 📋 Project Structure

```
PakUni/
├── src/
│   ├── screens/        # Screen components
│   ├── components/     # Reusable components
│   ├── navigation/     # Navigation setup
│   ├── data/          # Static data
│   ├── hooks/         # Custom hooks
│   ├── services/      # API services
│   ├── constants/     # App constants
│   └── utils/         # Utility functions
├── android/           # Android native code
├── ios/              # iOS native code
└── package.json      # Dependencies
```

---

## ✅ Working Features

- ✅ University listing and search
- ✅ University detail view
- ✅ Merit calculator
- ✅ Scholarships database
- ✅ Profile management
- ✅ Bottom tab navigation
- ✅ Error boundaries

---

## 🔄 If Still Stuck

### Nuclear Option (Complete Reset)
```bash
# Terminal 1: Stop everything
Ctrl+C

# Close emulator (or restart it in Android Studio)

# Terminal 2: Clean everything
rm -r node_modules .metro-cache
npm install

# Start fresh
npm start
# Wait 10 seconds
adb reverse tcp:8081 tcp:8081
npm run android
```

---

## 📚 More Help

- **Troubleshooting Guide**: See `TROUBLESHOOTING.md`
- **Android Setup**: See `ANDROID_STUDIO_SETUP.md`
- **Project Details**: See `README.md`

