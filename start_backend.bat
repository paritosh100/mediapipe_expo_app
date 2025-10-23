@echo off
echo Starting Pose Coach Backend...
echo.
echo Activating virtual environment...
call env\Scripts\activate.bat

echo.
echo Starting FastAPI server on http://localhost:8000
echo Press Ctrl+C to stop
echo.
python backend\main.py

