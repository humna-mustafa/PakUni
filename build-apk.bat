@echo off
REM PakUni APK Build Script
REM This script builds the Android APK for the PakUni application

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ========================================
echo   PakUni Android APK Builder
echo ========================================
echo.

REM Check if gradlew exists
if not exist "android\gradlew.bat" (
    echo Error: gradlew.bat not found in android directory
    exit /b 1
)

REM Get build type from command line or use default
set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=Debug

echo Building %BUILD_TYPE% APK...
echo.

cd android

REM Execute the build
if /i "%BUILD_TYPE%"=="release" (
    call gradlew.bat assembleRelease
    set OUTPUT_DIR=app\build\outputs\apk\release
) else (
    call gradlew.bat assembleDebug
    set OUTPUT_DIR=app\build\outputs\apk\debug
)

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Build Successful!
    echo ========================================
    echo.
    echo APK Output Directory:
    echo %CD%\!OUTPUT_DIR!
    echo.
    
    REM List APK files
    if exist "!OUTPUT_DIR!" (
        echo APK Files:
        for /f "delims=" %%F in ('dir /b "!OUTPUT_DIR!\*.apk" 2^>nul') do (
            echo   - %%F
            for /F %%S in ('powershell -Command "(Get-Item '!OUTPUT_DIR!\%%F').Length / 1MB" 2^>nul') do echo     Size: %%S MB
        )
    )
) else (
    echo.
    echo ========================================
    echo   Build Failed!
    echo ========================================
    echo.
    echo Please check the error messages above.
)

cd ..
endlocal
