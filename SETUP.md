# Pose Coach - React + FastAPI Setup Guide

This project has been migrated from Streamlit to a modern React frontend with FastAPI backend.

## Architecture

- **Frontend**: React 18 + Vite (Port 3000)
- **Backend**: FastAPI + WebSocket (Port 8000)
- **Pose Detection**: YOLOv8n-pose (Ultralytics)
- **Voice Feedback**: Web Speech API (browser-based)

## Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- Webcam access

## Backend Setup

### 1. Create and activate virtual environment (if not already done)

**Windows:**
```bash
cd d:\Python_practice\Pose_detection_models
python -m venv env
.\env\Scripts\activate
```

**Linux/Mac:**
```bash
cd /path/to/Pose_detection_models
python -m venv env
source env/bin/activate
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Verify pose model exists

Make sure `pose_app/yolov8n-pose.pt` exists. If not, it will download automatically on first run.

### 4. Run the backend server

```bash
python backend/main.py
```

The backend will start on `http://localhost:8000`

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Frontend Setup

### 1. Install Node.js dependencies

Open a new terminal and navigate to the frontend directory:

```bash
cd d:\Python_practice\Pose_detection_models\frontend
npm install
```

### 2. Run the development server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Allow camera permissions when prompted
3. Select an exercise from the dropdown
4. The app will:
   - Display your webcam feed with pose overlay
   - Count reps automatically
   - Show current phase (up/down/etc.)
   - Provide voice feedback for form cues
   - Optionally log data for training

## Features

✅ Real-time pose detection with YOLOv8  
✅ 6 exercise types (Squat, Pushup, Lunge, Side Lunge, Hammer Curl, Chair Dip)  
✅ Automatic rep counting  
✅ Form phase detection  
✅ Voice feedback using Web Speech API  
✅ Optional dataset logging  
✅ Modern, responsive UI  
✅ WebSocket for low-latency video streaming  

## Project Structure

```
Pose_detection_models/
├── backend/
│   └── main.py                 # FastAPI backend with WebSocket
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── App.css            # Styling
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite configuration
│   └── package.json           # Node dependencies
├── pose_app/
│   ├── pose_tracker.py        # YOLOv8 pose tracking
│   ├── detectors.py           # Exercise detection logic
│   ├── geometry.py            # Geometric calculations
│   ├── tts.py                 # Text-to-speech (not used in React version)
│   ├── dataset.py             # Dataset logging
│   └── data/                  # Logged training data
├── requirements.txt           # Python dependencies
└── SETUP.md                   # This file
```

## API Endpoints

### REST Endpoints

- `GET /` - Health check
- `GET /exercises` - List available exercises

### WebSocket Endpoint

- `WS /ws/pose` - Real-time pose detection stream

**Message format (client → server):**
```json
{
  "type": "config",
  "exercise": "Squat",
  "log_enabled": false
}
```

```json
{
  "type": "frame",
  "data": "base64_encoded_image"
}
```

**Message format (server → client):**
```json
{
  "type": "result",
  "image": "base64_encoded_processed_image",
  "feedback": {
    "name": "Squat",
    "reps": 5,
    "phase": "down",
    "cues": ["Keep back straight"],
    "voice_cue": "Squat down"
  }
}
```

## Troubleshooting

### Backend issues

**Port 8000 already in use:**
```bash
# Find and kill the process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

**ImportError:**
- Make sure virtual environment is activated
- Reinstall requirements: `pip install -r requirements.txt`

### Frontend issues

**Port 3000 already in use:**
- Vite will automatically use the next available port (3001, 3002, etc.)
- Or edit `vite.config.js` to change the port

**Camera not working:**
- Check browser permissions
- Use HTTPS or localhost (required for camera access)
- Try a different browser (Chrome/Edge recommended)

**WebSocket connection failed:**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Check browser console for errors

## Performance Tips

- The app sends frames at ~10 FPS for optimal performance
- Adjust frame rate in `App.jsx` by changing the interval (default: 100ms)
- For slower machines, increase the interval to 150-200ms

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```

This creates an optimized build in `frontend/dist/`

### Backend
For production deployment, use:
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Differences from Streamlit Version

| Feature | Streamlit | React + FastAPI |
|---------|-----------|-----------------|
| Frontend Framework | Streamlit | React 18 + Vite |
| Backend | Streamlit | FastAPI |
| Video Streaming | streamlit-webrtc (WebRTC) | WebSocket |
| Voice Feedback | pyttsx3 (server-side) | Web Speech API (browser) |
| UI Customization | Limited CSS | Full CSS control |
| Performance | Good | Better (WebSocket) |
| Deployment | Streamlit Cloud | Custom (Vercel + Railway, etc.) |

## Next Steps

- Deploy backend to a cloud service (Railway, Render, AWS)
- Deploy frontend to Vercel or Netlify
- Add user authentication
- Store workout history in a database
- Add charts/analytics for progress tracking
- Implement additional exercises
- Add mobile responsiveness improvements

## License

Same as original project.

## Credits

- Original Streamlit version by: [Your Name]
- Migrated to React + FastAPI
- Uses YOLOv8 from Ultralytics

