@echo off
echo ========================================
echo Restarting Eco-Maggie Development Server
echo ========================================
echo.
echo Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting development server...
echo.
npm run dev
