@echo off
REM PakUni Optimized Android Build Script
REM This script builds the Android APK with maximum speed optimizations

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ========================================
echo   PakUni OPTIMIZED APK Builder
echo   (Fastest possible build)
echo ========================================
echo.

REM Stop any running Gradle daemons
echo Cleaning up Gradle daemons...
cd android
call gradlew.bat --stop >nul 2>&1

echo.
echo Configuration:
echo   - Architecture: arm64-v8a only (modern devices)
echo   - Parallel Build: Enabled
echo   - Memory: 4GB JVM
echo   - Estimated Time: 2-3 minutes
echo.
echo Starting optimized build...
echo.

REM Get build type from command line or use default
set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=Debug

REM Execute the build with optimized settings
if /i "%BUILD_TYPE%"=="release" (
    echo Building Release APK...
    call gradlew.bat assembleRelease -x test --parallel --info
    set OUTPUT_DIR=app\build\outputs\apk\release
) else (
    echo Building Debug APK...
    call gradlew.bat assembleDebug -x test --parallel --info
    set OUTPUT_DIR=app\build\outputs\apk\debug
)

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Build SUCCESSFUL!
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
            for /F %%S in ('powershell -Command "(Get-Item '!OUTPUT_DIR!\%%F').Length / 1MB" 2^>nul') do (
                echo     Size: %%S MB
            )
        )
    )
    echo.
    echo Build completed in approximately 2-3 minutes.
) else (
    echo.
    echo ========================================
    echo   Build FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
    echo Troubleshooting:
    echo   - Ensure JDK is installed
    echo   - Ensure Android SDK is installed
    echo   - Check that JAVA_HOME and ANDROID_HOME are set
)

cd ..
endlocal
