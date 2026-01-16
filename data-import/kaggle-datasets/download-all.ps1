# PakUni Kaggle Datasets Downloader
# Run this script to download all datasets

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       PakUni - Kaggle Datasets Downloader                      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Check if kaggle is installed
$kaggleInstalled = Get-Command kaggle -ErrorAction SilentlyContinue
if (-not $kaggleInstalled) {
    Write-Host "`n❌ Kaggle CLI not found!" -ForegroundColor Red
    Write-Host "Please install it first:" -ForegroundColor Yellow
    Write-Host "   pip install kaggle" -ForegroundColor White
    Write-Host "`nThen set up your API key from https://www.kaggle.com/settings" -ForegroundColor Yellow
    Write-Host "Place kaggle.json in C:\Users\$env:USERNAME\.kaggle\" -ForegroundColor White
    exit 1
}

Write-Host "`n✅ Kaggle CLI found!" -ForegroundColor Green

$datasets = @(
    @{
        name = "HEC-Accredited Universities"
        path = "whisperingkahuna/hec-accredited-universities-of-pakistan-dataset"
        purpose = "Geolocation, Distance Education, Contact Info"
    },
    @{
        name = "Pakistan Intellectual Capital"
        path = "zusmani/pakistanintellectualcapitalcs"
        purpose = "Faculty Profiles, Research Areas"
    },
    @{
        name = "Pakistan Job Market"
        path = "zusmani/pakistans-job-market"
        purpose = "Career Insights, Job Trends"
    },
    @{
        name = "Intermediate Colleges"
        path = "tayyarhussain/all-the-intermediate-colleges-in-pakistan"
        purpose = "College Search for FSc Students"
    },
    @{
        name = "All Universities Basic"
        path = "tayyarhussain/all-of-the-universities-in-pakistan"
        purpose = "Cross-reference Data"
    },
    @{
        name = "Education Statistics 1947-2018"
        path = "tariqbashir/number-of-teachersstudents-in-pakistan-1947-2018"
        purpose = "Analytics and Insights"
    }
)

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n📥 Starting downloads to: $scriptDir`n" -ForegroundColor Cyan

foreach ($dataset in $datasets) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "📊 Downloading: $($dataset.name)" -ForegroundColor Yellow
    Write-Host "   Purpose: $($dataset.purpose)" -ForegroundColor White
    
    try {
        kaggle datasets download -d $dataset.path -p $scriptDir --unzip --force
        Write-Host "   ✅ Downloaded successfully!" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed to download: $_" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`n✅ Download Complete!" -ForegroundColor Green
Write-Host "`nFiles are in: $scriptDir" -ForegroundColor Cyan
Write-Host "`nNext step: Run the import script to merge data into PakUni:" -ForegroundColor Yellow
Write-Host "   node scripts/import-kaggle-data.js" -ForegroundColor White
