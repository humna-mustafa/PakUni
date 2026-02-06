@echo off
title PakUni - Fast Android Emulator Launcher v3
color 0A
setlocal EnableDelayedExpansion

:: ============================================================
::  PakUni - Performance Optimized Launcher
::  Fixed infinite reload issues + emulator lag
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
echo     PakUni - Fast Performance Launcher v3
echo     Fixed: Infinite reloads + Emulator lag
echo ============================================================
echo.

:: STEP 1: Complete cleanup
echo [STEP 1/7] Complete system cleanup...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM adb.exe >nul 2>&1
taskkill /F /IM emulator.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo   [OK] Cleanup complete
echo.

:: STEP 2: Kill old Metro bundler processes
echo [STEP 2/7] Clearing port %METRO_PORT%...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%METRO_PORT% " 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo   [OK] Port free
echo.

:: STEP 3: START EMULATOR WITH PERFORMANCE FLAGS
echo [STEP 3/7] Starting emulator with performance optimizations...
echo   - GPU acceleration enabled
echo   - Memory: 4GB
echo   - CPU cores: 4
echo   - Fast boot enabled
start "" "%EMULATOR%" ^
    -avd %AVD_NAME% ^
    -gpu auto ^
    -memory 4096 ^
    -cores 4 ^
    -accel auto ^
    -no-boot-anim ^
    -no-audio ^
    -no-snapshot-load ^
    -wipe-data

echo   Waiting for emulator to boot fully (this may take 30-60 seconds)...
set /a "COUNT=0"
:wait_emu_boot
timeout /t 5 /nobreak >nul
set /a "COUNT+=1"
set /a "ELAPSED=COUNT*5"

"%ADB%" devices 2>nul | findstr /C:"device" | findstr /V /C:"devices" >nul 2>&1
if %errorlevel% neq 0 (
    if %COUNT% GEQ 48 (
        echo   [ERROR] Emulator timeout. Check Android Studio for issues.
        pause
        exit /b 1
    )
    echo   Booting... %ELAPSED%s
    goto :wait_emu_boot
)

:: Check boot complete
"%ADB%" shell getprop sys.boot_completed 2>nul | findstr "1" >nul 2>&1
if %errorlevel% neq 0 (
    echo   Boot in progress: %ELAPSED%s
    goto :wait_emu_boot
)

echo   [OK] Emulator ready in %ELAPSED%s
echo.

:: STEP 4: Optimize emulator runtime
echo [STEP 4/7] Optimizing emulator performance...
"%ADB%" shell settings put system screen_brightness 150 >nul 2>&1
"%ADB%" shell settings put system low_battery_mode 0 >nul 2>&1
"%ADB%" shell "setprop debug.atrace.tags.enableflags 0" >nul 2>&1
echo   [OK] System optimized
echo.

:: STEP 5: ADB port forwarding
echo [STEP 5/7] Configuring port forwarding...
"%ADB%" reverse tcp:%METRO_PORT% tcp:%METRO_PORT% >nul 2>&1
echo   [OK] Port forwarding set
echo.

:: STEP 6: Dependencies check
echo [STEP 6/7] Checking dependencies...
cd /d "%PROJECT_DIR%"
if not exist "node_modules" (
    call npm install --legacy-peer-deps
) else (
    echo   [OK] Ready
)
echo.

:: STEP 7: Metro + Build
echo [STEP 7/7] Starting Metro Bundler and building...
echo.
echo   If Metro reloads infinitely:
echo   - Close the Metro window
echo   - Edit: src/contexts/AuthContext.tsx
echo   - Remove any setInterval or continuous updates
echo.

:: Clear cache and start fresh Metro
if exist "%PROJECT_DIR%\.metro-cache" (
    rmdir /s /q "%PROJECT_DIR%\.metro-cache" >nul 2>&1
)

start "PakUni Metro Bundler" cmd /k "cd /d %PROJECT_DIR% && title PakUni Metro Bundler && color 0B && npx react-native start --reset-cache --max-workers=2"

:: Wait for Metro
set /a "MC=0"
:wait_metro_boot
timeout /t 3 /nobreak >nul
set /a "MC+=1"

netstat -ano | findstr ":%METRO_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo   [OK] Metro is ready
    timeout /t 10 /nobreak >nul
    goto :start_build
)

if %MC% GEQ 50 (
    echo   [ERROR] Metro failed. Check the Metro window.
    pause
    exit /b 1
)
goto :wait_metro_boot

:start_build
echo.
echo   Building app (first build: 8-12 min)...
cd /d "%PROJECT_DIR%"
call npx react-native run-android --no-packager --no-fallback

:: Verify
timeout /t 5 /nobreak >nul
"%ADB%" shell pm list packages 2>nul | findstr "%APP_PACKAGE%" >nul 2>&1
if %errorlevel%==0 (
    "%ADB%" shell am start -n %APP_PACKAGE%/.MainActivity >nul 2>&1
    goto :final_success
)

:: Recovery
echo   Installing from build cache...
if exist "%PROJECT_DIR%\android\app\build\outputs\apk\debug\app-debug.apk" (
    "%ADB%" install -r "%PROJECT_DIR%\android\app\build\outputs\apk\debug\app-debug.apk"
    "%ADB%" shell am start -n %APP_PACKAGE%/.MainActivity >nul 2>&1
)

:final_success
echo.
echo ============================================================
echo.
echo       PakUni is RUNNING!
echo.
echo   Performance Tips:
echo   - Keep Metro window open
echo   - If app still slow: Close Metro, wait 10s, restart
echo   - If infinite reload: Check src/contexts for setInterval
echo   - Max performance: Close other apps
echo.
echo ============================================================
echo.
pause
