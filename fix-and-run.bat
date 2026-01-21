@echo off
setlocal enabledelayedexpansion

echo ========================================
echo PakUni - Device & Google Sign-In Fix
echo ========================================
echo.

REM Step 1: Check device status
echo [1/6] Checking device status...
adb devices
timeout /t 2 /nobreak

REM Step 2: Clear app data to remove any corrupted state
echo.
echo [2/6] Clearing app data and cache...
adb shell pm clear com.pakuni
timeout /t 2 /nobreak

REM Step 3: Kill any existing Metro processes
echo.
echo [3/6] Cleaning up existing Metro processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    taskkill /PID %%a /F 2>nul
)
timeout /t 1 /nobreak

REM Step 4: Setup port forwarding
echo.
echo [4/6] Setting up ADB port forwarding...
adb reverse tcp:8081 tcp:8081
timeout /t 1 /nobreak

REM Step 5: Start Metro bundler in a new window
echo.
echo [5/6] Starting Metro bundler...
start "Metro Bundler" cmd /k npm start
timeout /t 15 /nobreak

REM Step 6: Build and install the app
echo.
echo [6/6] Building and installing app...
call npm run android

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Metro Bundler window is still open.
echo Press 'r' in Metro terminal to reload the app.
echo Press 'd' in Metro terminal to open Dev Menu.
echo.
pause
