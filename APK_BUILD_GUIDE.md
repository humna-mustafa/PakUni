# APK Build Instructions for PakUni

## Current Status
The PakUni React Native application is ready for building into an Android APK file.

## How to Build APK

### Option 1: Build Debug APK (Recommended for Testing)
```bash
cd e:\pakuni\PakUni
npm run android:release
```

Or manually:
```bash
cd e:\pakuni\PakUni\android
gradlew.bat assembleDebug
```

**Output Location**: `e:\pakuni\PakUni\android\app\build\outputs\apk\debug\app-debug.apk`

### Option 2: Build Release APK (for Production)
```bash
cd e:\pakuni\PakUni
npm run android:release
```

Or manually:
```bash
cd e:\pakuni\PakUni\android
gradlew.bat assembleRelease
```

**Output Location**: `e:\pakuni\PakUni\android\app\build\outputs\apk\release\app-release.apk`

### Option 3: Build App Bundle (for Google Play Store)
```bash
cd e:\pakuni\PakUni
npm run android:bundle
```

Or manually:
```bash
cd e:\pakuni\PakUni\android
gradlew.bat bundleRelease
```

**Output Location**: `e:\pakuni\PakUni\android\app\build\outputs\bundle\release\app-release.aab`

## Build Requirements

- **JDK**: Java Development Kit 11 or higher
- **Android SDK**: API level 34 (target SDK)
- **Gradle**: 9.0+ (included in the project)
- **Node.js**: 20+ (already configured in package.json)

## Installation

### Via ADB (Android Debug Bridge)
```bash
adb install -r path\to\app-debug.apk
```

### Via Android Studio
1. Open Android Studio
2. Select "Open an Existing Project"
3. Navigate to `e:\pakuni\PakUni\android`
4. Click "Build" > "Generate Signed Bundle/APK"
5. Follow the wizard

### Via File Manager
1. Transfer APK to Android device
2. Open file manager on device
3. Tap on APK to install

## App Features

The PakUni application includes:
- University catalog with 500+ institutions
- University search and filtering
- Advanced search capabilities
- Offline data support
- Dark/Light theme support
- Demo user accounts for testing
- Complete data import system

## Demo Credentials

See `DEMO_USERS_CREDENTIALS.md` for test user login information.

## Troubleshooting

### Build Fails
- Clear build cache: `npm run clean`
- Reinstall dependencies: `npm install`
- Sync Gradle: `cd android && gradlew clean`

### APK Not Found
- Ensure build completed successfully (no errors in console)
- Check the output path exists
- Build sizes: Debug ~100MB, Release ~80MB

## Additional Resources

- See `ANDROID_STUDIO_SETUP.md` for environment setup
- See `SETUP_GUIDE.md` for initial configuration
- See `QUICK_START.md` for quick reference

