# 🚀 Quick Start Guide

## Step 1: Verify Setup

Run the test script to verify all dependencies are installed correctly:

```bash
# Activate virtual environment (if not already active)
env\Scripts\activate  # Windows
# OR
source env/bin/activate  # Linux/Mac

# Run verification
python test_setup.py
```

If all tests pass, proceed to Step 2. If any fail, run:
```bash
pip install -r requirements.txt
```

## Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## Step 3: Start the Application

### Windows Users

**Terminal 1 - Backend:**
```bash
start_backend.bat
```

**Terminal 2 - Frontend:**
```bash
start_frontend.bat
```

### Linux/Mac Users

**Terminal 1 - Backend:**
```bash
chmod +x start_backend.sh
./start_backend.sh
```

**Terminal 2 - Frontend:**
```bash
chmod +x start_frontend.sh
./start_frontend.sh
```

## Step 4: Access the App

Open your browser and go to: **http://localhost:3000**

Allow camera permissions when prompted.

## Step 5: Start Exercising!

1. Select an exercise from the dropdown
2. Position yourself in frame
3. Start your workout
4. Get real-time feedback!

---

## Troubleshooting

### "Cannot find module" errors
```bash
# Reinstall Python dependencies
pip install -r requirements.txt

# Reinstall Node dependencies
cd frontend
npm install
```

### Port already in use
```bash
# Windows - Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac - Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Camera not working
- Use Chrome or Edge browser
- Check browser permissions
- Make sure you're on localhost (required for camera access)

---

For more details, see [SETUP.md](SETUP.md)

