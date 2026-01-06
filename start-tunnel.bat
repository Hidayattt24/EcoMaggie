@echo off
echo ========================================
echo   ECOMAGGIE - LOCAL TUNNEL STARTER
echo ========================================
echo.
echo Starting tunnel on port 3000...
echo.
echo IMPORTANT:
echo 1. Copy the HTTPS URL that appears below
echo 2. Add "/api/payment/notification" to the end
echo 3. Paste in Midtrans Dashboard: Settings ^> Configuration ^> Payment Notification URL
echo.
echo Example:
echo   If URL is: https://abc-123.loca.lt
echo   Use: https://abc-123.loca.lt/api/payment/notification
echo.
echo ========================================
echo.

lt --port 3000

pause
