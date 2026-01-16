@echo off
REM ============================================================
REM Start Metro Server in Background (Hidden Window)
REM ============================================================
cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -File "scripts\reliable-metro-server.ps1" -Background
echo.
echo Server started in background!
echo Use server-status.bat to check status
echo Use stop-server.bat to stop server
echo.
pause
