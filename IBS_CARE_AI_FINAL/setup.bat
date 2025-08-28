@echo off
echo Starting IBS Care AI Setup...
echo.
echo This will open PowerShell as Administrator to run the setup script.
echo.
pause

powershell -ExecutionPolicy Bypass -File "%~dp0setup.ps1"

echo.
echo Setup completed! Press any key to exit.
pause >nul
