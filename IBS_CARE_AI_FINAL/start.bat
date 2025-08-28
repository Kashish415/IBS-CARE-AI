@echo off
echo Starting IBS Care AI...
echo.
echo This will start both backend and frontend servers.
echo.
pause

powershell -ExecutionPolicy Bypass -File "%~dp0start.ps1"

echo.
echo Script completed! Press any key to exit.
pause >nul
