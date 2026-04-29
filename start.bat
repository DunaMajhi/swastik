@echo off
title SwastikForce App
echo ============================================
echo    Starting SwastikForce Application...
echo ============================================
echo.

cd /d "%~dp0backend"
start "SwastikForce Backend" cmd /k "npm run dev"

cd /d "%~dp0frontend"
start "SwastikForce Frontend" cmd /k "npm run dev"

timeout /t 5 >nul
start http://localhost:5173

echo.
echo  Backend  → http://localhost:5000
echo  Frontend → http://localhost:5173
echo.
echo  Browser should open automatically.
echo  Close this window anytime.
echo ============================================
