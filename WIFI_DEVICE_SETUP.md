# WiFi Device Development Setup

## Overview

Run PakUni app on physical Android devices connected via WiFi without USB cable. This guide covers:
- ✅ Running on Android Emulator
- ✅ Running on WiFi-connected physical device

---

## Part 1: Running on Android Emulator

### Step 1: Start Metro Bundler (Terminal 1)
```bash
npm start
```
Wait for: `Dev server ready. Press Ctrl+C to exit.`

### Step 2: Setup Port Forwarding (Terminal 2)
```bash
adb reverse tcp:8081 tcp:8081
```

### Step 3: Run the App
```bash
npm run android
```

**Done!** App loads in 30 seconds on the emulator.

### Reload App During Development
**In Metro Terminal (Terminal 1):**
- Press `r` - Reload JavaScript
- Press `d` - Open React Native Dev Menu
- Press `j` - Open DevTools

---

## Part 2: Running on WiFi Physical Device (NO USB)

### Prerequisites
✅ Physical Android device with:
- Android 7.0 or higher
- Connected to same WiFi network as computer
- Developer mode enabled
- USB Debugging enabled

---

### Step 1: Enable Developer Options on Device

**Android 12 and above:**
1. Go to **Settings** → **About phone**
2. Tap **Build number** 7 times
3. Go back to **Settings** → **System** → **Developer options**
4. Enable **USB Debugging**

**Android 11 and below:**
1. Go to **Settings** → **About phone**
2. Tap **Build number** 7 times
3. Go back to **Settings** → **Developer options**
4. Enable **USB Debugging**

---

### Step 2: Connect Device Over WiFi (Using USB temporarily)

**First Time Setup Only (requires USB cable temporarily):**

1. **Connect device to PC with USB cable**

2. **In PowerShell/Terminal, run:**
```bash
# Check device is connected
adb devices

# You should see your device listed
# (example: emulator-5554 device)
```

3. **Find device IP address:**
```bash
adb shell ip addr show wlan0
```
Look for IP starting with 192.168.x.x or 10.x.x.x

**Example output:**
```
3: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic wlan0
```
Here, IP is **192.168.1.100**

4. **Connect over WiFi:**
```bash
# Enable WiFi debugging on device
adb tcpip 5555

# Connect to device IP (replace with your actual IP)
adb connect 192.168.1.100:5555

# You can now REMOVE USB CABLE
```

5. **Verify WiFi connection:**
```bash
adb devices

# Should show:
# 192.168.1.100:5555    device
```

---

### Step 3: Run App on WiFi Device

**Terminal 1:**
```bash
npm start
```
Wait for: `Dev server ready. Press Ctrl+C to exit.`

**Terminal 2:**
```bash
# Setup port forwarding for WiFi device
adb -s 192.168.1.100:5555 reverse tcp:8081 tcp:8081

# Run the app
npm run android
```

**Done!** App installs and runs on your WiFi device.

---

## Running on Multiple Devices

### View Connected Devices
```bash
adb devices
```

**Example output:**
```
List of attached devices
emulator-5554          device
192.168.1.100:5555     device
192.168.1.105:5555     device
```

### Run on Specific Device
```bash
# Port forward for specific device
adb -s 192.168.1.100:5555 reverse tcp:8081 tcp:8081

# Install and run on specific device
npx react-native run-android --deviceId 192.168.1.100:5555
```

---

## Troubleshooting WiFi Connection

### Issue: "Cannot connect over WiFi"

**Solution 1: Ensure same network**
```bash
# On device, check WiFi network:
Settings → WiFi → Connected network name

# On PC, check WiFi network:
Settings → Network & Internet → WiFi → Connected network
# Both should be the same WiFi network
```

**Solution 2: Check firewall**
```bash
# Windows Firewall might block adb
# Open Windows Defender Firewall
# → Allow an app through firewall
# → Find "Java" or "Android Studio"
# → Check both "Private" and "Public" boxes
```

**Solution 3: Restart adb**
```bash
adb kill-server
adb start-server
adb devices
```

---

### Issue: "adb: connection refused"

**On Device:** Disable and re-enable USB Debugging
1. Settings → Developer options → USB Debugging (OFF)
2. Wait 3 seconds
3. Settings → Developer options → USB Debugging (ON)

**Try connecting again:**
```bash
adb connect 192.168.1.100:5555
```

---

### Issue: Device not found after WiFi disconnect

**Reconnect:**
```bash
# If device goes offline
adb disconnect 192.168.1.100:5555

# Reconnect
adb connect 192.168.1.100:5555
```

---

### Issue: "Port 8081 already in use"

```bash
# Kill Node process
Get-Process node | Stop-Process -Force

# Start fresh
npm start
```

---

## Advanced: Persistent WiFi Connection

### Auto-Connect on System Startup

**Create PowerShell script:** `scripts/auto-connect-device.ps1`

```powershell
# auto-connect-device.ps1
# Auto-connects to WiFi Android devices

$DEVICE_IPS = @(
    "192.168.1.100",
    "192.168.1.105"
)

foreach ($ip in $DEVICE_IPS) {
    Write-Host "Connecting to $ip..."
    adb connect $ip:5555
}

Write-Host "All devices connected"
adb devices
```

**Run script:**
```bash
powershell -ExecutionPolicy Bypass -File scripts/auto-connect-device.ps1
```

---

## Development Workflow

### Full Setup (WiFi Device):

**Terminal 1:**
```bash
npm start
```

**Terminal 2:**
```bash
# Connect device if needed
adb connect 192.168.1.100:5555

# Wait for device to appear
adb devices

# Setup port forward
adb -s 192.168.1.100:5555 reverse tcp:8081 tcp:8081

# Run app
npm run android
```

### During Development:

**On Device (without Metro Terminal):**
- Shake device → **Dev Menu** opens
- Tap **Reload** to refresh
- Tap **Dev Settings** for more options

**In Metro Terminal (Terminal 1):**
- Press `r` - Reload JavaScript
- Press `d` - Open Dev Menu
- Press `j` - Open Chrome DevTools

---

## View Logs from WiFi Device

```bash
# Get logs from specific device
adb -s 192.168.1.100:5555 logcat

# Filter React Native logs only
adb -s 192.168.1.100:5555 logcat | grep ReactNativeJS
```

---

## Performance Tips for WiFi Devices

1. **Same 5GHz WiFi** - Use 5GHz band for faster connection (if device supports)
2. **Close Range** - Keep device close to WiFi router for best signal
3. **Disable Other Network** - Turn off mobile data for cleaner connection
4. **Clear Cache** - If app is slow:
   ```bash
   npm start --reset-cache
   ```

---

## Quick Commands Reference

| Task | Command |
|------|---------|
| List devices | `adb devices` |
| Connect WiFi | `adb connect 192.168.1.100:5555` |
| Disconnect | `adb disconnect 192.168.1.100:5555` |
| Port forward | `adb reverse tcp:8081 tcp:8081` |
| View logs | `adb logcat` |
| Kill adb | `adb kill-server` |
| Restart adb | `adb start-server` |

---

## Quick Start Checklist

- [ ] Android device has Developer options enabled
- [ ] USB Debugging is ON
- [ ] Device connected to same WiFi as PC
- [ ] Device IP address noted (e.g., 192.168.1.100)
- [ ] Device connected: `adb connect 192.168.1.100:5555`
- [ ] Metro started: `npm start`
- [ ] Port forwarding: `adb reverse tcp:8081 tcp:8081`
- [ ] App running: `npm run android`
- [ ] USB cable REMOVED ✅

---

## Still Need Help?

See:
- `QUICK_START.md` - Basic setup
- `TROUBLESHOOTING.md` - Common issues
- `DEVELOPMENT.md` - Development details
