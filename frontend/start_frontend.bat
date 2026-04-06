@echo off
echo Starting Electricity Consumption Frontend...
cd /d "%~dp0"
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in PATH.
    pause
    exit /b 1
)
npm run dev -- --host
pause
