@echo off
title Stop TFS Living Catalogue

echo Stopping services on ports 3000 and 4000...

for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":3000 .*LISTENING"') do taskkill /PID %%P /F >nul 2>nul
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":4000 .*LISTENING"') do taskkill /PID %%P /F >nul 2>nul

echo Localhost services stopped.
timeout /t 2 /nobreak >nul

