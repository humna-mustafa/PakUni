@echo off
echo =====================================================
echo   PakUni - Kaggle Datasets Manual Download Guide
echo =====================================================
echo.
echo The Kaggle API requires an API key. To set it up:
echo.
echo 1. Go to https://www.kaggle.com/settings
echo 2. Click "Create New Token" under the API section
echo 3. A file 'kaggle.json' will be downloaded
echo 4. Move it to: C:\Users\%USERNAME%\.kaggle\kaggle.json
echo.
echo OR download datasets manually from these URLs:
echo.
echo =====================================================
echo.
echo 1. HEC Universities (geolocation, distance education)
echo    https://www.kaggle.com/datasets/whisperingkahuna/hec-accredited-universities-of-pakistan-dataset
echo.
echo 2. Pakistan Intellectual Capital (faculty profiles)
echo    https://www.kaggle.com/datasets/zusmani/pakistanintellectualcapitalcs
echo.
echo 3. Pakistan Job Market (career insights - 7000 jobs)
echo    https://www.kaggle.com/datasets/zusmani/pakistans-job-market
echo.
echo 4. Intermediate Colleges (for FSc students)
echo    https://www.kaggle.com/datasets/tayyarhussain/all-the-intermediate-colleges-in-pakistan
echo.
echo 5. All Universities Basic (validation data)
echo    https://www.kaggle.com/datasets/tayyarhussain/all-of-the-universities-in-pakistan
echo.
echo =====================================================
echo.
echo After downloading, extract CSV files to:
echo   %~dp0data-import\kaggle-datasets\
echo.
echo Then run: npm run kaggle:all
echo.
pause
