# IBS Care AI Setup Script for Windows
# Run this script in PowerShell as Administrator

Write-Host "IBS Care AI Setup Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires Administrator privileges. Please run PowerShell as Administrator." -ForegroundColor Red
    exit 1
}

# Check PowerShell execution policy
Write-Host "Checking PowerShell execution policy..." -ForegroundColor Yellow
$currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
if ($currentPolicy -eq "Restricted") {
    Write-Host "Setting execution policy to RemoteSigned..." -ForegroundColor Yellow
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "Execution policy updated" -ForegroundColor Green
} else {
    Write-Host "Execution policy is already set to: $currentPolicy" -ForegroundColor Green
}

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js 20-22 from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python not found. Please install Python 3.11+ from https://python.org/" -ForegroundColor Red
    exit 1
}

# Check Git
Write-Host "Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git not found. Please install Git from https://git-scm.com/" -ForegroundColor Red
    exit 1
}

Write-Host "`n Prerequisites check completed!" -ForegroundColor Green
Write-Host "`n Next steps:" -ForegroundColor Cyan
Write-Host "1. Create Firebase project at https://console.firebase.google.com" -ForegroundColor White
Write-Host "2. Get Google Gemini API key at https://makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host "3. Run the following commands:" -ForegroundColor White
Write-Host "`n   # Frontend setup:" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "   # Create .env.local with your Firebase config" -ForegroundColor Gray
Write-Host "`n   # Backend setup:" -ForegroundColor Yellow
Write-Host "   cd ..\backend" -ForegroundColor Gray
Write-Host "   python -m venv .venv" -ForegroundColor Gray
Write-Host "   .\.venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   pip install -r requirements.txt" -ForegroundColor Gray
Write-Host "   # Create .env with your API keys" -ForegroundColor Gray
Write-Host "   # Place serviceAccount.json in backend/keys/" -ForegroundColor Gray
Write-Host "`n See SETUP_GUIDE.md for detailed instructions" -ForegroundColor Cyan

Write-Host "`n Setup script completed!" -ForegroundColor Green
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
