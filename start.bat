@echo off
title Nexora-Skill Platform Launcher
color 0A
echo ======================================================================
echo                NEXORA-SKILL PLATFORM LAUNCHER
echo      AI-Powered Skill Intelligence & Career Placement Platform
echo ======================================================================
echo.

cd /d "%~dp0"

:: 1. Setup Node.js Path if not globally available
where npm >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%LOCALAPPDATA%\nodejs" (
        set "PATH=%LOCALAPPDATA%\nodejs;%PATH%"
        echo [INFO] Added local Node.js to PATH.
    ) else (
        echo [WARNING] Node.js / npm not found in system PATH.
    )
)

:: 2. Setup Python environment
set "PY_CMD=python"
if exist "venv\Scripts\python.exe" (
    set "PY_CMD=venv\Scripts\python.exe"
    echo [INFO] Using virtual environment python.
)

:: 3. Set PYTHONPATH
set "PYTHONPATH=%cd%;%cd%\backend"

echo [1/2] Starting FastAPI Backend Server on http://127.0.0.1:8000 ...
start "Nexora-Skill Backend" cmd /k "title Nexora-Skill Backend && cd /d "%~dp0backend" && set PYTHONPATH=%cd%\..;%cd% && %PY_CMD% -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting Vite Frontend Server on http://localhost:3000 ...
start "Nexora-Skill Frontend" cmd /k "title Nexora-Skill Frontend && cd /d "%~dp0frontend" && npm run dev"

echo.
echo ======================================================================
echo  All services are launching in separate windows!
echo  Frontend URL: http://localhost:3000
echo  Backend Docs: http://127.0.0.1:8000/docs
echo ======================================================================
echo.

timeout /t 3 >nul
start http://localhost:3000

echo Press any key to exit this launcher window (servers will keep running)...
pause >nul
