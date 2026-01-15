# PakUni App Icon Setup Guide

## 🎯 Current Status

The app icon has been configured with **Android Adaptive Icons** (vector-based) which will work on Android 8.0+ devices. However, you still need to generate proper PNG assets for:

1. **Android legacy icons** (for Android 7.1 and below)
2. **iOS icons** (all required sizes)

---

## 🤖 Android Adaptive Icons (✅ DONE)

Adaptive icon files have been created:

| File | Location | Purpose |
|------|----------|---------|
| `ic_launcher_foreground.xml` | `drawable/` | Graduation cap logo (vector) |
| `ic_launcher_background.xml` | `drawable/` | Indigo gradient background |
| `ic_launcher.xml` | `mipmap-anydpi-v26/` | Adaptive icon definition |
| `ic_launcher_round.xml` | `mipmap-anydpi-v26/` | Round adaptive icon |

### Design Specifications
- **Background**: Indigo gradient (#6366F1 → #7C3AED)
- **Foreground**: White graduation cap with gold tassel, emerald book
- **Safe zone**: Centered within 66dp (of 108dp canvas)

---

## 📱 Generate PNG Assets

### Option 1: Use Android Studio (Recommended)

1. Open the `android/` folder in Android Studio
2. Right-click `res/` → **New** → **Image Asset**
3. Choose **Launcher Icons (Adaptive and Legacy)**
4. For **Foreground Layer**: Select `drawable/ic_launcher_foreground.xml`
5. For **Background Layer**: Select `drawable/ic_launcher_background.xml`
6. Click **Next** → **Finish**

This will generate all required PNG sizes for legacy Android.

### Option 2: Online Generator

Use [App Icon Generator](https://appicon.co/) or [Icon Kitchen](https://icon.kitchen/):

1. Create a 1024x1024 PNG of your icon design
2. Upload and download generated assets
3. Replace files in `mipmap-*` folders

---

## 🍎 iOS Icon Setup

iOS requires specific PNG files in `Images.xcassets/AppIcon.appiconset/`:

### Required Sizes

| Size | Scale | Filename | Use Case |
|------|-------|----------|----------|
| 20x20 | 2x | `Icon-20@2x.png` | Notifications |
| 20x20 | 3x | `Icon-20@3x.png` | Notifications |
| 29x29 | 2x | `Icon-29@2x.png` | Settings |
| 29x29 | 3x | `Icon-29@3x.png` | Settings |
| 40x40 | 2x | `Icon-40@2x.png` | Spotlight |
| 40x40 | 3x | `Icon-40@3x.png` | Spotlight |
| 60x60 | 2x | `Icon-60@2x.png` | Home Screen |
| 60x60 | 3x | `Icon-60@3x.png` | Home Screen |
| 1024x1024 | 1x | `Icon-1024.png` | App Store |

### Steps

1. Create a 1024x1024 PNG master icon
2. Generate all sizes using [App Icon Generator](https://appicon.co/)
3. Place files in `ios/PakUni/Images.xcassets/AppIcon.appiconset/`
4. Update `Contents.json` with correct filenames

---

## 🎨 Design Guidelines

### Brand Colors
```
Primary Indigo:  #6366F1
Accent Violet:   #8B5CF6
Emerald:         #10B981
Gold:            #F59E0B
Gold Light:      #FBBF24
```

### Icon Elements
- **Graduation Cap**: Symbol of education
- **Open Book**: Knowledge and learning
- **Golden Tassel**: Achievement and success
- **Stars**: Excellence and aspiration

### Safe Zones
- **Android**: Keep main elements within center 66dp of 108dp canvas
- **iOS**: Keep 10% padding from edges, avoid corners for rounded masks

---

## 🔧 Quick Commands

### Clean and Rebuild Android
```powershell
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Clean iOS Build
```bash
cd ios
rm -rf build
pod install
cd ..
npx react-native run-ios
```

---

## ✅ Verification

After generating icons:

1. **Android**: Install app and check home screen icon
2. **iOS**: Install app via Xcode and check home screen
3. **Both**: Check icon in app switcher and settings

The icon should display:
- Clear graduation cap silhouette
- Proper colors without pixelation
- Correct shape on all device launchers
