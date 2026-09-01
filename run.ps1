# ======================================================================
#            NEXORA-SKILL ONE-CLICK POWERSHELL LAUNCHER
# ======================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                NEXORA-SKILL PLATFORM LAUNCHER" -ForegroundColor Green
Write-Host "      AI-Powered Skill Intelligence & Career Placement Platform" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Setup Node.js path if local
$localNode = "$env:LOCALAPPDATA\nodejs"
if (Test-Path $localNode) {
    $env:PATH = "$localNode;$env:PATH"
    Write-Host "[INFO] Added local Node.js path: $localNode" -ForegroundColor Gray
}

# 2. Setup Python environment
$pythonCmd = "python"
if (Test-Path "$ScriptDir\venv\Scripts\python.exe") {
    $pythonCmd = "$ScriptDir\venv\Scripts\python.exe"
    Write-Host "[INFO] Found virtual environment python." -ForegroundColor Gray
}

# 3. Setup PYTHONPATH
$env:PYTHONPATH = "$ScriptDir;$ScriptDir\backend"

Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\backend'; `$env:PYTHONPATH='$ScriptDir;$ScriptDir\backend'; & '$pythonCmd' -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[2/2] Starting Vite Frontend on http://localhost:3000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\frontend'; if (Test-Path '$localNode') { `$env:PATH='$localNode;' + `$env:PATH }; npm run dev"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  Services launched successfully!" -ForegroundColor Green
Write-Host "  - Frontend Portal: http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Green

Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"
