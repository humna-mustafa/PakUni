# PakUni - Setup Google OAuth Secret
# Run this script with your Google Client Secret to enable Google Sign-In
#
# USAGE:
#   .\setup-google-oauth.ps1 -GoogleSecret "YOUR_GOOGLE_CLIENT_SECRET"
#
# HOW TO GET THE SECRET:
# 1. Go to: https://console.cloud.google.com/apis/credentials
# 2. Click on your Web Client OAuth credential
# 3. Copy the "Client Secret" value
# 4. Run this script with that secret

param(
    [Parameter(Mandatory=$true)]
    [string]$GoogleSecret
)

Write-Host "Setting Google OAuth Secret in Supabase..." -ForegroundColor Cyan

# Set the environment variable for the session
$env:SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET = $GoogleSecret

# Set the secret in Supabase
supabase secrets set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=$GoogleSecret

Write-Host ""
Write-Host "Pushing config to Supabase..." -ForegroundColor Cyan
supabase config push

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Google OAuth Secret has been configured!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Restart your Metro bundler: npx react-native start --reset-cache"
Write-Host "2. Run the app on your device"
Write-Host "3. Try Google Sign-In!"
