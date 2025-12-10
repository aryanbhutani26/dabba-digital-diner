@echo off
echo ========================================
echo   Indiya Restaurant - Local Print Server Setup
echo ========================================
echo.

echo Creating local print server directory...
mkdir local-print-server 2>nul
cd local-print-server

echo Copying files...
copy ..\local-print-server.js server.js
copy ..\local-print-server-package.json package.json
copy ..\local-print-server.env .env

echo Installing dependencies...
call npm install

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the local print server:
echo   1. cd local-print-server
echo   2. npm start
echo.
echo The server will run on: http://localhost:3001
echo Kitchen Printer: 192.168.1.227:9100
echo Bill Desk Printer: 192.168.1.251:9100
echo.
echo Press any key to continue...
pause >nul