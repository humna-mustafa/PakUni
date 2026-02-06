@echo off
color 0A
title PakUni - Infinite Reload Diagnostics

echo.
echo ============================================================
echo     PakUni - Infinite Reload Diagnostics
echo ============================================================
echo.
echo This will help identify what's causing infinite reloads.
echo.

:: Check Metro terminal
echo 1. Looking at the Metro terminal, what is it showing?
echo    A) "BUNDLE ./index.js" (repeatedly)
echo    B) "ERROR in ..."
echo    C) File changes detected constantly
echo.

echo 2. Kill everything and clean
echo    Stopping Metro and emulator...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM emulator.exe >nul 2>&1
timeout /t 3 /nobreak >nul

echo 3. Clear Metro cache
if exist "E:\pakuni\PakUni\.metro-cache" (
    rmdir /s /q "E:\pakuni\PakUni\.metro-cache"
    echo   [OK] Metro cache cleared
)

echo 4. Clear watchman cache (if installed)
watchman watch-del-all >nul 2>&1

echo 5. Quick fixes applied:
echo    - Disabled NotificationBell periodic ring animation
echo    - Optimized metro.config.js
echo    - Created RUN_FAST.bat with performance settings
echo.

echo 6. Next steps - Use RUN_FAST.bat
echo    Double-click: E:\pakuni\PakUni\RUN_FAST.bat
echo.

echo If STILL reloading infinitely after running RUN_FAST.bat:
echo.
echo   Option A - Nuclear option (cleanest):
echo   1. Delete: android\.gradle and android\app\build
echo   2. Run: npm install
echo   3. Use: RUN_FAST.bat
echo.
echo   Option B - Check Node/watchman:
echo   1. taskkill /F /IM node.exe
echo   2. taskkill /F /IM watchman.exe
echo   3. npm start --reset-cache --max-workers=1
echo.

pause
