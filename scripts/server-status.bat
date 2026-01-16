@echo off
cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -File "scripts\reliable-metro-server.ps1" -Status
pause
