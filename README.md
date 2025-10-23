# Pose Coach (Squat, Pushups, Lunges, Side Lunges, Hammer Curls, Chair Dips)

Real-time exercise feedback using MediaPipe pose tracking, with on-screen text and voice cues.

## Your environment (detected key libs)
- OpenCV 4.8.1.78
- MediaPipe 0.10.21
- NumPy 1.26.4
- Streamlit 1.50.0 + streamlit-webrtc 0.63.11
- pyttsx3 2.90 (added) for local TTS
- scikit-learn 1.3.2 for baseline training

## Quickstart
```bash
# From workspace root
python -m pip install -r requirements.txt  # installs only new deps (pyttsx3, joblib)
streamlit run pose_app/app.py
```

- Pick an exercise from the dropdown.
- Allow webcam access.
- Perform reps; you will see counts and hear voice cues.

## Project layout
```
pose_app/
  app.py            # Streamlit/WebRTC entry
  pose_tracker.py   # MediaPipe wrapper
  detectors.py      # Heuristic detectors for 6 exercises
  geometry.py       # Angle and distance utilities
  tts.py            # Async TTS queue
  dataset.py        # Logging utilities for CSV dataset
  train_baseline.py # Baseline sklearn trainer
```

## Datasets and training
- Use `pose_app/dataset.py` to log samples per frame while running the app (extend: hook into `app.py` to periodically save landmarks with labels).
- After collecting CSVs under `pose_app/data/`, train a baseline model:
```bash
python pose_app/train_baseline.py
```
- Replace heuristic `detectors.py` with a learned model if desired.

Public datasets to consider:
- FitRec / Exercise classification datasets (search on `paperswithcode.com`)
- Human3.6M (pose sequences; needs adaptation)
- Kinetics subsets for fitness actions (video-level; requires pose extraction)

## Mobile integration
Two paths:
- React Native or Flutter app using on-device MediaPipe Tasks Pose to stream landmarks, send to a minimal API, or run heuristics on-device. Reuse the same thresholds/logic from `detectors.py`.
- Android (Kotlin) / iOS (Swift) with Mediapipe Tasks SDK. Implement speech via platform TTS. The model-free heuristics port easily.

For a quick mobile MVP:
- Build a simple React Native app using `react-native-vision-camera` for frames
- Run MediaPipe Pose via `mediapipe/tasks-vision` in a native module
- Port the elbow/knee angle detectors and thresholds from `detectors.py`

## Notes
- Lighting and camera placement matter; use a side view for pushups and chair dips.
- Thresholds are heuristic; tune per user and camera.
- TTS volume/rate can be adjusted in `tts.py`.
