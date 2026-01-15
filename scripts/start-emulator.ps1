# PakUni - Start Android Emulator
# Run this to launch an Android emulator

$emulatorPath = "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe"

# List available AVDs
Write-Host "📱 Available Android Virtual Devices:" -ForegroundColor Cyan
$avds = & $emulatorPath -list-avds

if (-not $avds) {
    Write-Host "❌ No emulators found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create an emulator in Android Studio:" -ForegroundColor Yellow
    Write-Host "1. Open Android Studio" -ForegroundColor White
    Write-Host "2. Go to Tools → Device Manager" -ForegroundColor White
    Write-Host "3. Click 'Create Device'" -ForegroundColor White
    Write-Host "4. Select 'Pixel 7' → Next" -ForegroundColor White
    Write-Host "5. Download and select 'API 34' → Next → Finish" -ForegroundColor White
    Write-Host "6. Click Play button to start" -ForegroundColor White
    exit 1
}

Write-Host $avds -ForegroundColor Green
Write-Host ""

# Start the first available emulator
$firstAvd = ($avds | Select-Object -First 1).Trim()
Write-Host "🚀 Starting emulator: $firstAvd" -ForegroundColor Cyan

Start-Process -FilePath $emulatorPath -ArgumentList "-avd", $firstAvd -WindowStyle Minimized

Write-Host "✅ Emulator starting in background. Wait for it to boot before running the app." -ForegroundColor Green
