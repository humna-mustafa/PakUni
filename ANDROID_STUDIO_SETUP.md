# 🚨 REQUIRED: Android Studio Setup for PakUni

**Android Studio is now open. Follow these steps to install required SDK components:**

---

## Step 1: Install SDK Components

1. In Android Studio, go to **Settings** (Ctrl+Alt+S) or **File → Settings**
2. Navigate to **Languages & Frameworks → Android SDK**
3. In the **SDK Platforms** tab, check:
   - ☑️ **Android 15.0 (VanillaIceCream)** - API 35
   - ☑️ **Android 14.0 (UpsideDownCake)** - API 34

4. In the **SDK Tools** tab, check:
   - ☑️ **Android SDK Build-Tools 36**
   - ☑️ **Android SDK Command-line Tools (latest)**
   - ☑️ **Android Emulator**
   - ☑️ **Android SDK Platform-Tools**

5. Click **Apply** and wait for downloads to complete

---

## Step 2: Create an Android Emulator

1. Go to **Tools → Device Manager** (or click the phone icon in toolbar)
2. Click **Create Device** button
3. Select **Phone** category
4. Choose **Pixel 7** (recommended) → Click **Next**
5. Select **VanillaIceCream** (API 35) or **UpsideDownCake** (API 34)
   - Click the download icon if not already downloaded
6. Click **Next**
7. Name it: `Pixel_7_API_35` → Click **Finish**
8. Click the **▶️ Play button** to start the emulator

---

## Step 3: Verify Emulator is Running

Wait for the emulator to fully boot (you'll see the Android home screen).

Then come back to VS Code terminal and run:
```powershell
adb devices
```

You should see something like:
```
List of devices attached
emulator-5554   device
```

---

## Step 4: Run PakUni App

Once the emulator is running, in VS Code terminal:

**Terminal 1 - Start Metro:**
```powershell
cd E:\pakuni\PakUni
npm start
```

**Terminal 2 - Run on Android:**
```powershell
cd E:\pakuni\PakUni
npx react-native run-android
```

---

## 🎉 Success!

The PakUni app should now be running on your emulator!

- **Fast Refresh** is enabled by default - just save files to see changes
- Press `d` in Metro terminal to open Dev Menu
- Press `r` in Metro terminal to reload the app

---

## Troubleshooting

If you see "SDK location not found":
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

If build fails:
```powershell
cd E:\pakuni\PakUni\android
./gradlew clean
cd ..
npx react-native run-android
```
