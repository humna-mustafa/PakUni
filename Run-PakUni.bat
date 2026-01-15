@echo off
title PakUni App Launcher
color 0B
echo.
echo  ====================================================
echo   PakUni - Pakistan Universities Guide App
echo   Starting launcher...
echo  ====================================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -NoProfile -File "scripts\launch-pakuni.ps1"

REM Keep window open if there was an error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo An error occurred. Press any key to exit...
    pause > nul
)
