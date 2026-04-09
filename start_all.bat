@echo off
echo Cleaning up existing processes on port 8000 and 5173...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM curl.exe /T 2>nul

echo Launching Electricity Consumption Dashboard...
start cmd /k "cd /d %~dp0backend && start_backend.bat"
echo Waiting for backend to initialize...
timeout /t 5 >nul
start cmd /k "cd /d %~dp0frontend && start_frontend.bat"

echo Servers are starting! 
echo Opening browser to: http://127.0.0.1:5173
start 
pause
 http://127.0.0.1:5173