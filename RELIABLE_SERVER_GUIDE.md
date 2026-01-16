# Reliable Metro Server Guide

## Overview

A robust Metro bundler server that:
- ✅ **Auto-restarts** on crash (up to 10 times)
- ✅ **Runs in background** without blocking terminal
- ✅ **WiFi accessible** from physical Android devices
- ✅ **Status monitoring** to check server health
- ✅ **Logs** for debugging

---

## Quick Start

### Option 1: Double-click (Easiest)

| File | Description |
|------|-------------|
| `scripts\start-server.bat` | Start server (visible window) |
| `scripts\background-server.bat` | Start in background (hidden) |
| `scripts\server-status.bat` | Check server status |
| `scripts\stop-server.bat` | Stop the server |

### Option 2: NPM Commands

```bash
# Start reliable server (auto-restart enabled)
npm run server

# Start in background
npm run server:bg

# Check status
npm run server:status

# View logs
npm run server:logs

# Stop server
npm run server:stop
```

### Option 3: PowerShell Direct

```powershell
# Start server
.\scripts\reliable-metro-server.ps1

# Start in background
.\scripts\reliable-metro-server.ps1 -Background

# Check status
.\scripts\reliable-metro-server.ps1 -Status

# View logs
.\scripts\reliable-metro-server.ps1 -Logs

# Stop server
.\scripts\reliable-metro-server.ps1 -Stop
```

---

## Physical Device Setup (WiFi)

### Step 1: Start the Reliable Server

```bash
npm run server
```

You'll see output like:
```
============================================================
   RELIABLE METRO SERVER
============================================================

  Auto-restart: ON (max 10 restarts)
  WiFi Access:  http://192.168.1.100:8081
  Local Access: http://localhost:8081
```

### Step 2: Connect Your Android Device

```bash
# Enable wireless debugging (one-time with USB)
adb tcpip 5555

# Connect via WiFi (replace with YOUR device IP)
adb connect 192.168.1.105:5555

# Verify connection
adb devices
```

### Step 3: Setup Port Forwarding

```bash
# Forward port to device
adb reverse tcp:8081 tcp:8081
```

### Step 4: Run the App

```bash
npm run android
```

---

## Checking Server Status

Run this anytime to see if server is running:

```bash
npm run server:status
```

Example output:
```
========================================
   METRO SERVER STATUS
========================================

  Status:        Running
  PID:           12345
  Restart Count: 1
  Last Update:   2026-01-16 14:30:00

  LOCAL ACCESS:
    http://localhost:8081

  WIFI ACCESS (for physical device):
    http://192.168.1.100:8081

  Process is ALIVE

========================================
```

---

## Background Server

### Start in Background

```bash
npm run server:bg
```

The server runs hidden. You can:
- Close the terminal window
- Continue working
- Check status anytime

### Monitor Background Server

```bash
# Check if running
npm run server:status

# View recent logs
npm run server:logs

# Stop when done
npm run server:stop
```

---

## Troubleshooting

### "Port 8081 already in use"

```bash
# Stop all Metro processes
npm run server:stop

# Or manually kill
Get-Process node | Stop-Process -Force

# Start fresh
npm run server
```

### "Device cannot connect over WiFi"

1. **Check same network:**
   - Device and laptop must be on same WiFi

2. **Check your laptop's IP:**
   ```powershell
   ipconfig | findstr "IPv4"
   ```

3. **Windows Firewall:**
   - Allow Node.js through firewall
   - Or temporarily disable firewall for testing

4. **Port forwarding:**
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

### "Server keeps crashing"

Check logs for errors:

```bash
npm run server:logs
```

Common fixes:
```bash
# Clear cache
npm start --reset-cache

# Clean and rebuild
npm run clean
npm run android
```

### "Max restarts reached"

If server crashes 10 times:

1. Check error logs:
   ```bash
   type logs\metro-error.log
   ```

2. Fix the issue

3. Restart:
   ```bash
   npm run server
   ```

---

## Advanced Options

### Custom Max Restarts

```powershell
# Allow up to 20 restarts
.\scripts\reliable-metro-server.ps1 -MaxRestarts 20
```

### Custom Restart Delay

```powershell
# Wait 5 seconds between restarts
.\scripts\reliable-metro-server.ps1 -RestartDelay 5
```

### Combined Options

```powershell
.\scripts\reliable-metro-server.ps1 -Background -MaxRestarts 20 -RestartDelay 5
```

---

## File Locations

| File | Purpose |
|------|---------|
| `logs\metro-server.log` | Server output logs |
| `logs\metro-error.log` | Error logs |
| `logs\metro-status.json` | Status data |
| `logs\metro-server.pid` | Process ID |

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run server` | Start reliable server |
| `npm run server:bg` | Start in background |
| `npm run server:status` | Check status |
| `npm run server:logs` | View logs |
| `npm run server:stop` | Stop server |
| `npm run start:wifi` | Simple WiFi start (no auto-restart) |

---

## Integration with Development

### Typical Workflow

**Terminal 1: Start Server**
```bash
npm run server
```

**Terminal 2: Build & Run**
```bash
adb reverse tcp:8081 tcp:8081
npm run android
```

### During Development

- Server auto-restarts if Metro crashes
- Press `r` in server terminal to reload app
- Press `d` to open dev menu on device

---

## Need More Help?

See also:
- [WIFI_DEVICE_SETUP.md](WIFI_DEVICE_SETUP.md) - Detailed WiFi device guide
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development workflow
