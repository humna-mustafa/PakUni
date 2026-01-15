# PakUni App Launch Checklist

## ✅ Pre-Flight Checklist

### System Requirements
- [ ] Node.js v20+ installed
- [ ] npm installed and updated
- [ ] Android Studio installed
- [ ] Java JDK 17/18 installed
- [ ] Android SDK with API 34 (or compatible)
- [ ] Android emulator created and tested

### Project Setup
- [ ] Project cloned/downloaded
- [ ] `npm install` completed
- [ ] `node_modules` folder exists
- [ ] `.metro-cache` cleared (if issues)
- [ ] `android/app/build.gradle` exists

### Environment
- [ ] `ANDROID_HOME` environment variable set
- [ ] `JAVA_HOME` environment variable set
- [ ] `adb` command works (`adb --version`)
- [ ] Emulator accessible (`adb devices`)

---

## 🚀 Startup Sequence

### Before Each Development Session

```
Step 1: Start Metro Bundler
├── npm start
├── Wait for "Dev server ready" message
└── Don't close this terminal

Step 2: Setup Port Forwarding
├── adb reverse tcp:8081 tcp:8081
└── (In separate terminal)

Step 3: Launch App
├── npm run android
├── Wait for app to appear in emulator
└── Should show home screen with data

Step 4: Verify App Works
├── Can see university list? ✓
├── Can search universities? ✓
├── Can open calculator? ✓
├── Can view profile? ✓
└── No red error screens? ✓
```

---

## 🐛 Troubleshooting Decision Tree

### App Won't Start

```
❓ Is Metro running?
├─ NO → Run: npm start
└─ YES → Continue

❓ Does Metro show "Dev server ready"?
├─ NO → Kill all Node processes, restart
└─ YES → Continue

❓ Is emulator connected?
├─ NO → Start emulator in Android Studio
└─ YES → Continue

❓ Is port forwarding set?
├─ NO → Run: adb reverse tcp:8081 tcp:8081
└─ YES → Run: npm run android

Still broken? → See TROUBLESHOOTING.md
```

---

### App Crashes on Launch

```
❓ Do you see "Cannot connect to Metro"?
├─ YES → Metro not accessible
│  └─ Solution: adb reverse tcp:8081 tcp:8081
└─ NO → Continue

❓ Do you see red error screen?
├─ YES → JavaScript error
│  └─ Check Metro console for error details
└─ NO → Continue

❓ Do you see white/blank screen?
├─ YES → Loading or render issue
│  └─ Wait 10 seconds, check logcat
└─ NO → Probably working!
```

---

### Port Issues

```
Port 8081 already in use?

Solution:
1. Find process: netstat -ano | findstr :8081
2. Kill it: taskkill /PID <PID> /F
3. Or: Get-Process node | Stop-Process -Force
4. Retry: npm start
```

---

### Emulator Issues

```
No emulator listed in 'adb devices'?

Solutions:
1. Open Android Studio
2. Click Device Manager (phone icon)
3. Click play button on an emulator
4. Wait 30+ seconds for it to boot
5. Retry: adb devices

Or start via command:
emulator -list-avds
emulator -avd Pixel_7_API_34
```

---

## 📊 Testing the App

### Home Screen Checklist
- [ ] Welcome banner displays
- [ ] Statistics cards show numbers
- [ ] University carousel scrolls
- [ ] Entry tests list visible
- [ ] Featured scholarships show
- [ ] "Get Started" button works

### Universities Screen Checklist
- [ ] University list loads
- [ ] Can search universities
- [ ] Filter by province works
- [ ] Filter by type works
- [ ] Tap university shows details
- [ ] Scroll loads more (pagination)

### Calculator Checklist
- [ ] Can select education system
- [ ] Can input marks
- [ ] Can select formula
- [ ] Can toggle Hafiz bonus
- [ ] Calculate button works
- [ ] Results display correctly

### Scholarships Checklist
- [ ] Scholarships list loads
- [ ] Can search scholarships
- [ ] Filter by type works
- [ ] Tap shows details modal
- [ ] Coverage % displays
- [ ] View Details → link works

### Profile Screen Checklist
- [ ] Profile information displays
- [ ] Settings toggles work
- [ ] Saved universities show
- [ ] Help links accessible
- [ ] About section visible

---

## 🔧 Command Reference

### Essential Commands

```bash
# Start Metro bundler
npm start

# Port forwarding (in second terminal)
adb reverse tcp:8081 tcp:8081

# Run on Android
npm run android

# Run on iOS
npm run ios

# View device logs
adb logcat

# Clear all caches
npm start --reset-cache

# Install dependencies
npm install

# Build for production
cd android && ./gradlew assembleRelease
```

### Debug Commands

```bash
# List connected devices
adb devices

# Clear app data
adb shell pm clear com.pakuni

# Force stop app
adb shell am force-stop com.pakuni

# Check port usage
netstat -ano | findstr :8081

# Kill Node processes
Get-Process node | Stop-Process -Force
```

---

## 📋 Daily Development Flow

### Morning: Start Fresh
```bash
# Terminal 1
npm start

# Terminal 2
adb reverse tcp:8081 tcp:8081
npm run android

# Keep Terminal 1 visible for logs
```

### During Development
```bash
# Make code changes
# Ctrl+S to save

# Code auto-reloads when you press 'r' in Terminal 1
# Or press 'r' twice for hard reload
```

### Testing Changes
```bash
# In Metro terminal:
r        # Reload JavaScript
d        # Dev Menu
j        # DevTools
Ctrl+C   # Stop Metro
```

### End of Day: Clean Shutdown
```bash
# Terminal 1: Press Ctrl+C to stop Metro
# Terminal 2: Close terminal
# Close emulator or leave running
```

---

## 🎯 Success Indicators

✅ **You're Ready When:**
- Metro says "Dev server ready"
- Emulator shows PakUni app
- Home screen displays universities
- Can tap and navigate screens
- No red error screens
- No white blank screens
- Console shows no critical errors

❌ **Problems If:**
- Cannot connect to Metro (red screen)
- App crashes on startup
- Emulator disconnected
- Port 8081 in use
- Node modules missing
- Build failures

---

## 📚 Documentation Files

- **QUICK_START.md** → 5-minute quick setup
- **TROUBLESHOOTING.md** → Common issues & fixes
- **DEVELOPMENT.md** → Full dev guide & features
- **ANDROID_STUDIO_SETUP.md** → Android environment setup
- **README.md** → Project overview

---

## 🆘 Getting Help

1. Check **TROUBLESHOOTING.md** for your issue
2. Review **Metro console** for error messages
3. Check **adb logcat** for Android errors
4. Read **DEVELOPMENT.md** for architecture
5. Review related screen code comments

---

**Last Updated:** January 14, 2026  
**Status:** Ready for development

