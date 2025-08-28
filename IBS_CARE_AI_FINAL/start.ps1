# IBS Care AI Quick Start Script
# This script starts both backend and frontend servers

Write-Host "Starting IBS Care AI..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Host "Please run this script from the IBS_CARE_AI_FINAL directory" -ForegroundColor Red
    exit 1
}

# Function to start backend
function Start-Backend {
    Write-Host "`n Starting Backend Server..." -ForegroundColor Yellow
    Write-Host "Backend will be available at: http://127.0.0.1:8000" -ForegroundColor Cyan
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; .\.venv\Scripts\Activate.ps1; `$env:GOOGLE_APPLICATION_CREDENTIALS='$PWD\backend\keys\serviceAccount.json'; flask run --host=127.0.0.1 --port=8000"
}

# Function to start frontend
function Start-Frontend {
    Write-Host "`n Starting Frontend Server..." -ForegroundColor Yellow
    Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"
}

# Check if environment files exist
$frontendEnv = "frontend\.env.local"
$backendEnv = "backend\.env"

if (-not (Test-Path $frontendEnv)) {
    Write-Host "Frontend environment file not found!" -ForegroundColor Yellow
    Write-Host "Please copy frontend\env.template to frontend\.env.local and configure it" -ForegroundColor Red
    $startFrontend = $false
} else {
    $startFrontend = $true
}

if (-not (Test-Path $backendEnv)) {
    Write-Host " Backend environment file not found!" -ForegroundColor Yellow
    Write-Host "Please copy backend\env.template to backend\.env and configure it" -ForegroundColor Red
    $startBackend = $false
} else {
    $startBackend = $true
}

# Check if backend virtual environment exists
if (-not (Test-Path "backend\.venv")) {
    Write-Host " Backend virtual environment not found!" -ForegroundColor Yellow
    Write-Host "Please run: cd backend; python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt" -ForegroundColor Red
    $startBackend = $false
}

# Check if frontend dependencies are installed
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host " Frontend dependencies not installed!" -ForegroundColor Yellow
    Write-Host "Please run: cd frontend; npm install" -ForegroundColor Red
    $startFrontend = $false
}

if ($startBackend -and $startFrontend) {
    Write-Host "`n All checks passed! Starting servers..." -ForegroundColor Green
    
    # Start backend
    Start-Backend
    
    # Wait a moment for backend to start
    Start-Sleep -Seconds 3
    
    # Start frontend
    Start-Frontend
    
    Write-Host "`n Both servers are starting!" -ForegroundColor Green
    Write-Host "Backend: http://127.0.0.1:8000" -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "`nPress any key to exit this script (servers will continue running)..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} else {
    Write-Host "`n Please fix the issues above before starting the servers" -ForegroundColor Red
    Write-Host "`n See SETUP_GUIDE.md for detailed setup instructions" -ForegroundColor Cyan
    Write-Host "`nPress any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
