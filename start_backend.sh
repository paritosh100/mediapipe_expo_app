#!/bin/bash
echo "Starting Pose Coach Backend..."
echo ""
echo "Activating virtual environment..."
source env/bin/activate

echo ""
echo "Starting FastAPI server on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""
python backend/main.py

