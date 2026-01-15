# 📌 PakUni Quick Reference Card

## Essential Commands (Copy & Paste)

### Start Development (Run Once Per Session)

```bash
# Terminal 1 - Metro Bundler
npm start

# Terminal 2 - App Installation & Port Forwarding
adb reverse tcp:8081 tcp:8081
npm run android
```

### During Development

```bash
# Reload app
Press 'r' in Terminal 1

# Dev Menu
Press 'd' in Terminal 1

# JavaScript Debugger
Press 'j' in Terminal 1

# Stop Metro
Press Ctrl+C in Terminal 1
```

---

## Troubleshooting Quick Fix

| Problem | Command |
|---------|---------|
| Metro won't start | `Get-Process node \| Stop-Process -Force` |
| Cannot connect to Metro | `adb reverse tcp:8081 tcp:8081` |
| Port 8081 in use | `Get-Process node \| Stop-Process -Force` |
| Emulator not connected | Start from Android Studio |
| Blank screen | Wait 10 seconds, press 'r' |
| Clear all cache | `npm start --reset-cache` |
| Reinstall app | `npm run android` |

---

## Directory Structure

```
src/
├── screens/       ← App pages
├── components/    ← UI elements  
├── navigation/    ← Navigation
├── data/         ← Universities, scholarships
├── constants/    ← Colors, spacing
├── hooks/        ← Reusable logic
├── services/     ← Supabase
└── utils/        ← Helpers

android/          ← Android code
ios/             ← iOS code
scripts/         ← Automation
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/screens/PremiumHomeScreen.tsx` | Home page |
| `src/screens/PremiumUniversitiesScreen.tsx` | University list |
| `src/screens/PremiumCalculatorScreen.tsx` | Merit calculator |
| `src/navigation/AppNavigator.tsx` | Navigation setup |
| `src/constants/theme.ts` | Colors, fonts, spacing |
| `src/data/index.ts` | All data exports |

---

## Common Tasks

### Add New Screen
1. Create file: `src/screens/MyScreen.tsx`
2. Add to `AppNavigator.tsx`
3. Import components needed

### Change Colors
1. Edit `src/constants/theme.ts`
2. Update COLORS object
3. Press 'r' to reload

### Add University Data
1. Edit `src/data/universities.ts`
2. Add new university object
3. Data auto-loads in lists

### Update Styles
1. Edit StyleSheet in component
2. Or change constants in `theme.ts`
3. Press 'r' to reload

---

## Important Paths

```
Package: com.pakuni
Metro: http://localhost:8081
Emulator: 10.0.2.2:8081 (auto-mapped)
App entry: index.js → App.tsx
```

---

## File Naming Conventions

- Screens: `ScreenName.tsx`
- Components: `ComponentName.tsx`
- Utils: `utilName.ts`
- Hooks: `useHookName.ts`
- Data: `dataName.ts`

---

## Debug Shortcuts

```
Metro Terminal:
r          Reload JS
d          Dev Menu
j          Debugger
Ctrl+C     Stop

Emulator (shake device):
Double tap React logo
Or press r twice fast
```

---

## Network & Services

```
Metro Server: http://localhost:8081
ADB Port: 8081
Device Port: 8081
Supabase: Configured in src/services/supabase.ts
```

---

## Performance Tips

✅ Use FlatList for long lists  
✅ Memoize expensive components  
✅ Use useMemo for calculations  
✅ Lazy load images  
✅ Use StyleSheet.create()  
✅ Avoid inline styles  

❌ Don't use map() for large lists  
❌ Don't create styles in render  
❌ Don't call functions in render  
❌ Don't use console.log in production  

---

## Testing Command

```bash
npm test
```

---

## Build for Production

```bash
cd android
./gradlew assembleRelease
```

---

## Clear & Reset

```bash
# Clear app data
adb shell pm clear com.pakuni

# Force stop app
adb shell am force-stop com.pakuni

# Clear Metro cache
npm start --reset-cache

# Clean everything
npm install
rm -r node_modules
npm start --reset-cache
```

---

## Configuration Files

- `package.json` - Dependencies
- `app.json` - App config
- `tsconfig.json` - TypeScript config
- `babel.config.js` - Babel config
- `metro.config.js` - Metro config
- `jest.config.js` - Test config
- `android/app/build.gradle` - Android build

---

## Documentation Quick Links

- QUICK_START.md - 5 min setup
- TROUBLESHOOTING.md - Fix issues
- DEVELOPMENT.md - Full guide
- LAUNCH_CHECKLIST.md - Deployment
- ANDROID_STUDIO_SETUP.md - Android env

---

## ADB Commands Cheat Sheet

```bash
# List devices
adb devices

# View logs
adb logcat

# Clear logs
adb logcat -c

# Clear app data
adb shell pm clear com.pakuni

# Stop app
adb shell am force-stop com.pakuni

# Port forward
adb reverse tcp:8081 tcp:8081

# Install APK
adb install path/to/app.apk

# Uninstall app
adb uninstall com.pakuni
```

---

## Emergency Commands

If everything breaks:

```bash
# 1. Stop everything
Ctrl+C in Metro terminal

# 2. Kill all Node processes
Get-Process node | Stop-Process -Force

# 3. Clean everything
rm -r node_modules
rm -r .metro-cache

# 4. Reinstall
npm install

# 5. Start fresh
npm start
adb reverse tcp:8081 tcp:8081
npm run android
```

---

## Remember

✅ Always run: `adb reverse tcp:8081 tcp:8081`  
✅ Always start: `npm start` first  
✅ Always keep: Metro terminal open  
✅ Always check: Console for errors  

❌ Don't close: Metro terminal  
❌ Don't forget: Port forwarding  
❌ Don't panic: Read docs first  
❌ Don't commit: node_modules  

---

## Need Help?

1. Check TROUBLESHOOTING.md
2. Check Metro console
3. Check adb logcat
4. Check DEVELOPMENT.md
5. Ask in dev team

---

**Bookmark This Page!** 🔖

Print or save for quick reference during development.

Last Updated: January 14, 2026

