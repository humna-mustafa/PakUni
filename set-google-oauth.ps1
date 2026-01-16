#!/usr/bin/env pwsh
# Set Google OAuth Secret for PakUni Supabase Project
# Usage: .\set-google-oauth.ps1 -Secret "GOCSPX-your-secret-here"

param(
    [Parameter(Mandatory=$true)]
    [string]$Secret
)

$ProjectRef = "therewjnnidxlddgkaca"
$GoogleClientId = "69201457652-km6n3soj0dr4aq3m8845vboth14sm61j.apps.googleusercontent.com"

Write-Host "Setting Google OAuth for PakUni Supabase Project..." -ForegroundColor Cyan
Write-Host "Project: $ProjectRef" -ForegroundColor Gray
Write-Host "Client ID: $GoogleClientId" -ForegroundColor Gray

# Set environment variable
$env:SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET = $Secret

# Push config
Write-Host "`nPushing configuration to Supabase..." -ForegroundColor Yellow
echo "Y" | supabase config push --project-ref $ProjectRef

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Google OAuth configured successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. In Google Cloud Console, add this redirect URI:" -ForegroundColor White
    Write-Host "   https://$ProjectRef.supabase.co/auth/v1/callback" -ForegroundColor Yellow
    Write-Host "2. Build and test the app" -ForegroundColor White
} else {
    Write-Host "`n❌ Failed to push configuration" -ForegroundColor Red
    Write-Host "Please check your Supabase login status: supabase login" -ForegroundColor Yellow
}
