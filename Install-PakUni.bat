@echo off
REM ======================================
REM PakUni v1.2.0 Installer Batch Script
REM ======================================

setlocal enabledelayedexpansion

color 0F
title PakUni v1.2.0 Installer

echo.
echo ========================================
echo   PakUni v1.2.0 Installer
echo ========================================
echo.

REM Check if APK exists
if not exist "PakUni-v1.2.0.apk" (
    color 0C
    echo.
    echo [ERROR] APK file not found: PakUni-v1.2.0.apk
    echo.
    echo Please ensure this script is in the same directory as PakUni-v1.2.0.apk
    echo.
    pause
    exit /b 1
)

echo [OK] APK Found: PakUni-v1.2.0.apk ^(24.4 MB^)
echo.

REM Check ADB
adb version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo [ERROR] ADB not found in system PATH
    echo.
    echo Please install Android SDK Platform Tools and ensure ADB is in PATH
    echo.
    pause
    exit /b 1
)

echo [OK] ADB Found
echo.

REM Check connected devices
echo Checking connected devices...
adb devices | find "device" >nul
if errorlevel 1 (
    color 0C
    echo.
    echo [ERROR] No Android devices found
    echo.
    echo Please:
    echo   1. Connect Android device via USB
    echo   2. Enable USB Debugging ^(Settings ^> Developer Options^)
    echo   3. Tap 'Trust' when prompted
    echo   4. Run this script again
    echo.
    pause
    exit /b 1
)

color 0A
echo [OK] Device connected
echo.

echo ========================================
echo Installation Options
echo ========================================
echo.
echo 1. Install PakUni only
echo 2. Install and Launch PakUni
echo 3. Uninstall PakUni
echo 0. Exit
echo.

set /p choice="Enter your choice (0-3): "

if "%choice%"=="0" goto :end
if "%choice%"=="1" goto :install
if "%choice%"=="2" goto :install_launch
if "%choice%"=="3" goto :uninstall

color 0C
echo Invalid choice. Please try again.
pause
goto :start

:uninstall
echo.
echo Uninstalling PakUni...
adb uninstall com.pakuni
if errorlevel 1 (
    echo [ERROR] Uninstall failed
) else (
    color 0A
    echo [OK] PakUni uninstalled successfully
)
echo.
pause
goto :end

:install
echo.
echo Installing PakUni v1.2.0...
echo.
adb install -r "PakUni-v1.2.0.apk"
if errorlevel 1 (
    color 0C
    echo.
    echo [ERROR] Installation failed
    echo.
    pause
    exit /b 1
)

color 0A
echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo App is ready to use. Tap the PakUni icon to launch.
echo.
pause
goto :end

:install_launch
echo.
echo Installing PakUni v1.2.0...
echo.
adb install -r "PakUni-v1.2.0.apk"
if errorlevel 1 (
    color 0C
    echo.
    echo [ERROR] Installation failed
    echo.
    pause
    exit /b 1
)

echo.
echo Launching PakUni...
timeout /t 2 /nobreak
adb shell am start -n com.pakuni/.MainActivity

color 0A
echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo PakUni is now launching on your device...
echo.
pause
goto :end

:end
color 0F
exit /b 0
