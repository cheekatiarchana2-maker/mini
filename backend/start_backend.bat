@echo off
echo Starting Electricity Consumption Backend...
cd /d "%~dp0"
call .\venv\Scripts\activate
python main.py
pause
