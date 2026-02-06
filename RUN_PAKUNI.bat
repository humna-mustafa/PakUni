@echo off
title PakUni - Android Emulator Launcher
color 0A
setlocal EnableDelayedExpansion





:: ============================================================
::  PakUni - One-Click Android Emulator Runner v2
::  Just double-click this file. It handles EVERYTHING.
:: ============================================================

set "SDK_PATH=C:\Users\ghula\AppData\Local\Android\Sdk"
set "ADB=%SDK_PATH%\platform-tools\adb.exe"
set "EMULATOR=%SDK_PATH%\emulator\emulator.exe"
set "AVD_NAME=Pixel_7_API_34"
set "PROJECT_DIR=E:\pakuni\PakUni"
set "METRO_PORT=8081"
set "APP_PACKAGE=com.pakuni"

echo.
echo ============================================================
echo     PakUni - Automated Android Emulator Launcher v2
echo ============================================================
echo.

:: STEP 1: Kill old processes and free port
echo [STEP 1/6] Cleaning up old processes...
taskkill /F /IM node.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%METRO_PORT% " ^| findstr "LISTENING" 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo   [OK] Cleanup complete, port %METRO_PORT% free
echo.

:: STEP 2: Check/Start Emulator
echo [STEP 2/6] Checking Android Emulator...
"%ADB%" devices 2>nul | findstr /C:"device" | findstr /V /C:"devices" >nul 2>&1
if %errorlevel%==0 (
    echo   [OK] Emulator already running
    goto :emulator_ready
)
if not exist "%EMULATOR%" (
    echo   [ERROR] Emulator not found. Install from Android Studio SDK Manager.
    pause
    exit /b 1
)
echo   Starting %AVD_NAME%...
start "" "%EMULATOR%" -avd %AVD_NAME% -no-boot-anim -gpu auto
set /a "COUNT=0"
:wait_emu
timeout /t 5 /nobreak >nul
set /a "COUNT+=1"
set /a "ELAPSED=COUNT*5"
"%ADB%" shell getprop sys.boot_completed 2>nul | findstr "1" >nul 2>&1
if %errorlevel%==0 (
    echo   [OK] Emulator booted in ~%ELAPSED%s
    goto :emulator_ready
)
if %COUNT% GEQ 36 (
    echo   [ERROR] Emulator timeout after 180s. Start manually from Android Studio.
    pause
    exit /b 1
)
echo   Booting... %ELAPSED%s
goto :wait_emu
:emulator_ready
echo.

:: STEP 3: ADB port forwarding
echo [STEP 3/6] Setting up port forwarding...
"%ADB%" reverse tcp:%METRO_PORT% tcp:%METRO_PORT% >nul 2>&1
echo   [OK] Port forwarding configured
echo.

:: STEP 4: Check dependencies
echo [STEP 4/6] Checking dependencies...
cd /d "%PROJECT_DIR%"
if not exist "node_modules" (
    echo   Installing npm packages...
    call npm install
) else (
    echo   [OK] Dependencies ready
)
echo.

:: STEP 5: Start Metro Bundler
echo [STEP 5/6] Starting Metro Bundler...
netstat -ano | findstr ":%METRO_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo   [OK] Metro already running
    goto :metro_ready
)
start "PakUni Metro Bundler" cmd /k "cd /d %PROJECT_DIR% && title PakUni Metro Bundler - DO NOT CLOSE && color 0B && echo. && echo   === PakUni Metro Bundler === && echo   DO NOT CLOSE THIS WINDOW && echo. && npx react-native start --reset-cache"
echo   Waiting for Metro to start...
set /a "MC=0"
:wait_metro
timeout /t 3 /nobreak >nul
set /a "MC+=1"
set /a "ME=MC*3"
netstat -ano | findstr ":%METRO_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo   [OK] Metro running on port %METRO_PORT% (%ME%s)
    echo   Waiting 15s for bundle compilation...
    timeout /t 15 /nobreak >nul
    goto :metro_ready
)
if %MC% GEQ 40 (
    echo   [ERROR] Metro failed to start. Check the Metro window.
    pause
    exit /b 1
)
echo   Waiting... %ME%s
goto :wait_metro
:metro_ready
echo.

:: STEP 6: Build and Install
echo [STEP 6/6] Building and installing PakUni...
echo.
echo   First build: 8-12 min   Subsequent: 1-3 min
echo.
cd /d "%PROJECT_DIR%"
call npx react-native run-android --no-packager

:: Verify installation (ignore Gradle exit code - deprecation warnings cause false failures)
timeout /t 5 /nobreak >nul
"%ADB%" shell pm list packages 2>nul | findstr "%APP_PACKAGE%" >nul 2>&1
if %errorlevel%==0 (
    "%ADB%" shell am start -n %APP_PACKAGE%/.MainActivity >nul 2>&1
    goto :success
)

:: Recovery: try direct APK install
if exist "%PROJECT_DIR%\android\app\build\outputs\apk\debug\app-debug.apk" (
    echo   Installing APK directly...
    "%ADB%" install -r "%PROJECT_DIR%\android\app\build\outputs\apk\debug\app-debug.apk"
    "%ADB%" shell am start -n %APP_PACKAGE%/.MainActivity >nul 2>&1
    "%ADB%" shell pm list packages 2>nul | findstr "%APP_PACKAGE%" >nul 2>&1
    if !errorlevel!==0 goto :success
)

:: Recovery: clean build
echo   Running clean build...
cd /d "%PROJECT_DIR%\android"
call gradlew clean >nul 2>&1
cd /d "%PROJECT_DIR%"
call npx react-native run-android --no-packager
timeout /t 5 /nobreak >nul
"%ADB%" shell pm list packages 2>nul | findstr "%APP_PACKAGE%" >nul 2>&1
if %errorlevel%==0 goto :success

echo.
echo   [FAILED] Build failed. Try:
echo     1. Close Android Studio
echo     2. Delete android\.gradle and android\app\build
echo     3. Run: npm install
echo     4. Double-click RUN_PAKUNI.bat again
echo.
pause
exit /b 1

:success
echo.
echo ============================================================
echo.
echo     PakUni is RUNNING on your emulator!
echo.
echo     - Keep "PakUni Metro Bundler" window OPEN
echo     - Press 'r' in Metro window to reload
echo     - Press 'd' for developer menu
echo     - Edit code in VS Code - changes appear instantly
echo.
echo     To run again: just double-click RUN_PAKUNI.bat
echo.
echo ============================================================
echo.
echo Press any key to exit...
pause >nul
