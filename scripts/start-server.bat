@echo off
REM ============================================================
REM Quick Start - Reliable Metro Server
REM ============================================================
echo.
echo ============================================================
echo   PakUni - Reliable Metro Server
echo ============================================================
echo.

cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -File "scripts\reliable-metro-server.ps1" %*
