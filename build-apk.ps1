#!/usr/bin/env pwsh
# Build APK script for PakUni

Set-Location "e:\pakuni\PakUni\android"
Write-Host "Starting Android APK build..." -ForegroundColor Green
Write-Host "Building Debug APK..." -ForegroundColor Cyan

# Execute gradlew
& "./gradlew.bat" assembleDebug

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    
    # Find the APK
    $apkPath = Get-ChildItem -Path ".\app\build\outputs\apk\debug" -Filter "*.apk" -Recurse | Select-Object -First 1
    
    if ($apkPath) {
        Write-Host "APK created at: $($apkPath.FullName)" -ForegroundColor Green
        Write-Host "APK size: $([math]::Round($apkPath.Length / 1MB, 2)) MB" -ForegroundColor Green
    }
} else {
    Write-Host "Build failed!" -ForegroundColor Red
}
