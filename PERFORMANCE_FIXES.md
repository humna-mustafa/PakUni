# PakUni - Performance & Infinite Reload Fixes

## 🔧 What Was Fixed

### 1. **Metro Configuration Optimized** (`metro.config.js`)
- Increased watchman timeout for stability
- Limited max workers to 2 (prevents CPU overload)
- Configured proper cache and timeout settings
- Enabled inline requires for faster bundling

### 2. **Infinite Reload Triggers Disabled**
- **NotificationBell.tsx**: Disabled periodic ring animation (every 30s)
- Prevents constant state updates triggering fast-refresh loops

### 3. **New Fast Launcher** (`RUN_FAST.bat`)
- Emulator starts with performance flags:
  - GPU acceleration enabled
  - 4GB RAM allocation
  - 4 CPU cores
  - No boot animation/audio
  - Wipe-data for clean state
- Auto-clears Metro cache before bundling
- 2 worker threads (prevents thread explosion)

---

## 📱 How to Use

### **First Time or After Slow Performance:**
```batch
Double-click: RUN_FAST.bat
```

This will:
1. Stop all old processes
2. Start emulator with performance settings
3. Configure port forwarding
4. Launch Metro Bundler
5. Build and run the app

**Expected times:**
- First build: 8-12 minutes (normal for React Native + 30+ dependencies)
- Subsequent builds: 1-3 minutes

---

## ⚡ Performance Tips

### If App Still Slow After Launch:
1. **Close the Metro window**
2. **Wait 10-15 seconds**
3. **Double-click RUN_FAST.bat again**
4. Don't touch anything while rebuilding

### If Still Getting Infinite Reloads:
```batch
Double-click: FIX_INFINITE_RELOAD.bat
```

Then run:
```batch
Double-click: RUN_FAST.bat
```

---

## 🔍 What's Happening When You See "Reloading connected app(s)..."

This is **normal** and happens when:
- ✅ Metro detects code changes
- ✅ Fast Refresh reloads the bundle
- ✅ App updates in the emulator

**NOT normal:**
- ❌ Reloading 5+ times per second continuously
- ❌ Emulator system UI completely frozen
- ❌ Errors in Metro terminal

---

## 💻 System Requirements

**Recommended for smooth performance:**
- RAM: 16GB+ (you have this ✓)
- CPU: Quad-core or better (you have this ✓)
- GPU: With hardware acceleration support

**Per your setup:**
- Laptop has plenty of resources
- Any slowness is likely software configuration, not hardware

---

## 🛠️ Advanced Troubleshooting

### If problems persist:

**Option 1 - Clean everything:**
```bash
# Close all terminals
taskkill /F /IM node.exe
taskkill /F /IM emulator.exe
taskkill /F /IM java.exe

# Delete cache folders
rmdir /s /q android\.gradle
rmdir /s /q android\app\build
rmdir /s /q node_modules\.cache
del /q .metro-cache

# Reinstall
npm install
```

**Option 2 - Check Metro logs for errors:**
1. Look at the Metro terminal window
2. Look for red `ERROR` text
3. Copy full error message
4. It usually points to specific file causing issues

**Option 3 - Verify emulator health:**
```bash
adb devices
adb shell "getprop sys.boot_completed"
adb shell "top -n 1 -o %MEM" | head -10
```

---

## 📊 Key Files Modified

1. **metro.config.js** - Performance tuning
2. **src/components/NotificationBell.tsx** - Disabled auto-ring
3. **RUN_PAKUNI.bat** - Original launcher (enhanced)
4. **RUN_FAST.bat** - New optimized launcher
5. **FIX_INFINITE_RELOAD.bat** - Diagnostic tool

---

## 🚀 Next Steps

1. **Immediate:** Double-click `RUN_FAST.bat`
2. **Wait for build** (8-12 min first time)
3. **App should be smooth** on Pixel 7 emulator
4. **If slow:** Restart using the script again

---

## ❓ FAQ

**Q: Why does the first build take so long?**
A: React Native compiles ~30 native modules (Google Sign-in, Supabase, Fast Image, etc.). This is normal.

**Q: Can I edit code while it's running?**
A: Yes! Save file → Metro reloads → Changes appear instantly (Fast Refresh)

**Q: Why disable the bell animation?**
A: It was ringing every 30 seconds, triggering re-renders that caused Metro reloads.

**Q: Is the app now broken?**
A: No, the bell will still ring when you get notifications. We just disabled the automatic ring for stability.

---

## 🎯 Summary

Your issue was:
1. **Emulator not optimized** for performance
2. **Periodic animations** triggering constant reloads
3. **Metro configuration** too aggressive for development

Now fixed with optimized launcher and disabled auto-triggers.

**Run `RUN_FAST.bat` for best performance!**
