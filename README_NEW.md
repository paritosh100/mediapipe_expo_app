# 🏋️ Pose Coach - Real-time Exercise Feedback

A modern web application for real-time exercise form tracking and feedback using AI-powered pose detection.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+ with virtual environment already set up
- Node.js 18+ and npm
- Webcam

### Installation

**1. Install Backend Dependencies:**
```bash
# Activate your virtual environment
env\Scripts\activate  # Windows
# OR
source env/bin/activate  # Linux/Mac

# Install Python packages
pip install -r requirements.txt
```

**2. Install Frontend Dependencies:**
```bash
cd frontend
npm install
cd ..
```

### Running the Application

**Option 1: Using Helper Scripts (Recommended)**

**Windows:**
```bash
# Terminal 1 - Start Backend
start_backend.bat

# Terminal 2 - Start Frontend
start_frontend.bat
```

**Linux/Mac:**
```bash
# Terminal 1 - Start Backend
chmod +x start_backend.sh
./start_backend.sh

# Terminal 2 - Start Frontend
chmod +x start_frontend.sh
./start_frontend.sh
```

**Option 2: Manual Start**

**Terminal 1 - Backend:**
```bash
env\Scripts\activate  # Windows
# OR source env/bin/activate  # Linux/Mac
python backend/main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access the App

Open your browser and navigate to:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

## 📋 Features

- ✅ **Real-time Pose Detection** - Powered by YOLOv8n-pose
- ✅ **6 Exercise Types** - Squat, Pushup, Lunge, Side Lunge, Hammer Curl, Chair Dip
- ✅ **Automatic Rep Counting** - Smart detection of exercise phases
- ✅ **Form Feedback** - Real-time cues for proper form
- ✅ **Voice Guidance** - Browser-based text-to-speech
- ✅ **Dataset Logging** - Optional data collection for model training
- ✅ **Modern UI** - Responsive React interface
- ✅ **Low Latency** - WebSocket-based video streaming

## 🏗️ Architecture

```
┌─────────────────┐         WebSocket          ┌──────────────────┐
│                 │◄──────────────────────────►│                  │
│  React Frontend │   Video Frames & Results   │  FastAPI Backend │
│   (Port 3000)   │                             │   (Port 8000)    │
│                 │                             │                  │
└─────────────────┘                             └──────────────────┘
        │                                               │
        │                                               │
        ▼                                               ▼
  Web Speech API                              YOLOv8 Pose Detection
  (Voice Feedback)                            (Exercise Recognition)
```

## 📁 Project Structure

```
Pose_detection_models/
├── backend/
│   └── main.py                 # FastAPI server with WebSocket
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── App.css            # Component styles
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── pose_app/
│   ├── pose_tracker.py        # YOLOv8 wrapper
│   ├── detectors.py           # Exercise detection logic
│   ├── geometry.py            # Angle/distance calculations
│   ├── dataset.py             # Data logging
│   └── data/                  # Logged training data
├── requirements.txt           # Python dependencies
├── SETUP.md                   # Detailed setup guide
└── README_NEW.md             # This file
```

## 🔧 Configuration

### Adjust Frame Rate

Edit `frontend/src/App.jsx` line ~133:
```javascript
const interval = setInterval(() => {
  captureFrame();
}, 100); // Change to 150-200 for slower machines
```

### Change Ports

**Backend** - Edit `backend/main.py` line ~188:
```python
uvicorn.run(app, host="0.0.0.0", port=8000)  # Change port here
```

**Frontend** - Edit `frontend/vite.config.js`:
```javascript
server: {
  port: 3000,  // Change port here
}
```

Also update WebSocket URL in `frontend/src/App.jsx`:
```javascript
const WS_URL = 'ws://localhost:8000/ws/pose';  // Update if backend port changes
```

## 🐛 Troubleshooting

### Camera Not Working
- Grant browser camera permissions
- Use Chrome/Edge (best compatibility)
- Ensure you're on localhost or HTTPS

### WebSocket Connection Failed
- Check that backend is running on port 8000
- Look for errors in browser console (F12)
- Verify firewall isn't blocking the connection

### Backend ImportError
- Activate virtual environment: `env\Scripts\activate`
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## 📊 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

### Key Endpoints

- `GET /` - Health check
- `GET /exercises` - List available exercises
- `WS /ws/pose` - WebSocket for real-time pose detection

## 🎯 Usage Guide

1. **Start the application** (both backend and frontend)
2. **Allow camera access** when prompted by browser
3. **Select an exercise** from the dropdown menu
4. **Position yourself** so your full body is visible in frame
5. **Start exercising** - the app will:
   - Display your pose with keypoint overlays
   - Count your reps automatically
   - Show your current phase (up/down/etc.)
   - Provide voice cues for form correction
6. **Optional**: Enable "Log dataset" to save training data

## 🚢 Production Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the 'dist' folder
```

### Backend (Railway/Render/AWS)
```bash
# Install production dependencies
pip install -r requirements.txt

# Run with Gunicorn or similar
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🆚 Comparison with Streamlit Version

| Aspect | Streamlit | React + FastAPI |
|--------|-----------|-----------------|
| UI Framework | Streamlit | React + Vite |
| Backend | Streamlit | FastAPI |
| Video Streaming | WebRTC | WebSocket |
| Voice Feedback | pyttsx3 (server) | Web Speech API |
| Customization | Limited | Full control |
| Performance | Good | Excellent |
| Mobile Support | Basic | Better |

## 📝 Future Enhancements

- [ ] User authentication
- [ ] Workout history & analytics
- [ ] Progress charts
- [ ] More exercises
- [ ] Mobile app version
- [ ] Multi-user support
- [ ] Exercise programs/plans

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- **YOLOv8** by Ultralytics for pose detection
- **MediaPipe** pose landmark conventions
- Original exercise detection algorithms

## 📞 Support

For detailed setup instructions, see [SETUP.md](SETUP.md)

For issues, please check the Troubleshooting section or create an issue on GitHub.

---

**Enjoy your workouts with AI-powered form feedback! 💪**

