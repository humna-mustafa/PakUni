@echo off
setlocal enabledelayedexpansion
set PC_IP=192.168.1.7

echo [PakUni] Ensuring ADB is running...
adb start-server
adb devices

echo.
echo [PakUni] Checking if app is installed...
adb shell pm list packages 2>nul | findstr /C:"com.pakuni" >nul 2>&1
if !errorlevel! equ 0 goto APP_INSTALLED

:APP_NOT_INSTALLED
echo [PakUni] App NOT installed - Installing now...
echo [PakUni] This will build and install the app (may take 2-5 minutes)...
echo.

echo [PakUni] Starting Metro Server on %PC_IP%...
start "Metro" cmd /k "cd /d %~dp0 && npx react-native start --port 8081 --host 0.0.0.0"

echo [PakUni] Waiting for Metro to start...
timeout /t 8 /nobreak >nul

echo [PakUni] Building and installing app...
cd /d %~dp0
call npx react-native run-android

if !errorlevel! neq 0 (
    echo [ERROR] Build failed! Check the error messages above.
    pause
    exit /b 1
)

echo [PakUni] App installed successfully!
goto SETUP_CONNECTION

:APP_INSTALLED
echo [PakUni] App is already installed - Starting Metro and App...

echo [PakUni] Starting Metro Server on %PC_IP%...
start "Metro" cmd /k "cd /d %~dp0 && npx react-native start --reset-cache --port 8081 --host 0.0.0.0"

:SETUP_CONNECTION
echo [PakUni] Hardening device connection...
adb shell dumpsys deviceidle whitelist +com.pakuni >nul 2>&1
adb shell settings put global stay_on_while_plugged_in 3 >nul 2>&1

echo [PakUni] Setting up ADB Port Forwarding (USB)...
adb reverse --remove-all >nul 2>&1
adb reverse tcp:8081 tcp:8081

echo [PakUni] Starting App...
adb shell am force-stop com.pakuni >nul 2>&1
timeout /t 2 /nobreak >nul
adb shell am start -n com.pakuni/.MainActivity

echo.
echo ======================================================
echo WIFI INSTRUCTIONS (IF USB DISCONNECTED):
echo 1. Shake your phone - Dev Menu
echo 2. Settings - Debug server host for device
echo 3. Enter: %PC_IP%:8081
echo.
echo QUICK FIX (USB):
echo - Run: adb shell input keyevent 82  (then tap Reload)
echo ======================================================
echo.
pause
