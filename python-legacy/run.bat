@echo off
echo Starting AirPiano...
echo Using virtual environment...

if not exist ".venv\Scripts\activate.bat" (
    echo Error: Virtual environment not found. Please run setup.bat first or wait for the setup to finish.
    pause
    exit /b
)

call .venv\Scripts\activate.bat
python src\main.py
pause
