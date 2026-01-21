#!/bin/bash
# PakUni Google Account Auto-Setup Script
# Automatically adds Google Account to device via ADB

echo "🔧 PakUni Google Account Auto-Setup"
echo "===================================="

# Check if device is connected
adb devices | grep -q "device$"
if [ $? -ne 0 ]; then
    echo "❌ No Android device connected!"
    echo "Connect device via USB and enable USB Debugging"
    exit 1
fi

DEVICE=$(adb devices | grep "device$" | head -1 | awk '{print $1}')
echo "✅ Device found: $DEVICE"

# Step 1: Clear Google Play Services data for fresh setup
echo ""
echo "📋 Step 1: Preparing Google Play Services..."
adb shell pm clear com.google.android.gms 2>/dev/null
adb shell am force-stop com.google.android.gms 2>/dev/null
sleep 2

# Step 2: Open Google Settings to add account
echo ""
echo "📋 Step 2: Opening Google Account Setup..."
adb shell am start -n com.google.android.gms/com.google.android.gms.auth.uiflows.minutemaid.MinuteMaidActivity 2>/dev/null

sleep 3

# Step 3: Simulate account addition via Settings
echo ""
echo "📋 Step 3: Navigating to Add Account screen..."
adb shell am start -a android.settings.ADD_ACCOUNT_SETTINGS 2>/dev/null

sleep 2

# Step 4: Tap on Google option
echo ""
echo "📋 Step 4: Selecting Google Account type..."
# Simulate tap on Google option
adb shell input tap 540 400 2>/dev/null

sleep 3

echo ""
echo "⏳ Account setup dialog should now be open on your device"
echo "📱 Please:"
echo "   1. Enter your Google email"
echo "   2. Enter your Google password"
echo "   3. Accept all permissions"
echo "   4. Complete the setup"
echo ""
echo "⏱️  Waiting 45 seconds for manual input..."
sleep 45

# Step 5: Verify account was added
echo ""
echo "🔍 Verifying Google Account..."
adb shell cmd account list 2>/dev/null | grep -i google

if [ $? -eq 0 ]; then
    echo "✅ Google Account successfully added!"
else
    echo "⚠️  Could not verify account. Please check manually:"
    echo "   Settings → Accounts → Google"
fi

# Step 6: Restart Google Play Services
echo ""
echo "🔄 Restarting Google Play Services..."
adb shell am start -n com.google.android.gms/com.google.android.gms.chimera.GmsChimeraService 2>/dev/null
sleep 3

# Step 7: Clear PakUni app data for fresh sign-in
echo ""
echo "🗑️  Clearing PakUni cache..."
adb shell pm clear com.pakuni 2>/dev/null

# Step 8: Relaunch PakUni
echo ""
echo "🚀 Relaunching PakUni..."
adb shell am start -n com.pakuni/com.pakuni.MainActivity 2>/dev/null

sleep 3

echo ""
echo "✅ Setup Complete!"
echo "===================="
echo "You can now try Google Sign-In in PakUni"
echo ""
echo "If still having issues:"
echo "1. Ensure Google Account is in: Settings → Accounts"
echo "2. Restart your phone completely"
echo "3. Try again in PakUni"
