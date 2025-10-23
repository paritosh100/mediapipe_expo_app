from __future__ import annotations

import os
import sys
import base64
import json
from typing import Optional
from io import BytesIO

import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from pose_app.pose_tracker import MediaPipePoseTracker
from pose_app.detectors import (
    SquatDetector,
    PushupDetector,
    LungeDetector,
    SideLungeDetector,
    HammerCurlDetector,
    ChairDipDetector,
    ExerciseFeedback,
)
from pose_app.dataset import save_sample_csv, Sample

app = FastAPI(title="Pose Coach API")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXERCISE_MAP = {
    "Squat": SquatDetector,
    "Pushup": PushupDetector,
    "Lunge": LungeDetector,
    "Side Lunge": SideLungeDetector,
    "Hammer Curl": HammerCurlDetector,
    "Chair Dip": ChairDipDetector,
}


class PoseProcessor:
    def __init__(self, exercise_name: str, log_enabled: bool = False):
        self.tracker = MediaPipePoseTracker()
        self.detector = EXERCISE_MAP[exercise_name]()
        self.exercise_name = exercise_name
        self.log_enabled = log_enabled
        self.frame_count = 0
        self.last_phase: Optional[str] = None

    def process_frame(self, frame_bytes: bytes) -> dict:
        """Process a single frame and return results"""
        # Decode image from bytes
        nparr = np.frombuffer(frame_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"error": "Failed to decode image"}

        # Process pose
        result = self.tracker.process_frame(img, draw=True)
        overlay = img
        feedback_data = {
            "name": self.exercise_name,
            "reps": 0,
            "phase": "unknown",
            "cues": [],
            "voice_cue": None
        }

        if result is not None:
            feedback: ExerciseFeedback = self.detector.infer(result.landmarks_px)
            
            # Draw overlay text
            text = f"{feedback.name} | reps: {feedback.reps} | phase: {feedback.phase}"
            cv2.rectangle(overlay, (10, 10), (510, 60), (0, 0, 0), -1)
            cv2.putText(
                overlay, text, (20, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2, cv2.LINE_AA
            )

            # Check for voice cues
            voice_cue = None
            if self.last_phase != feedback.phase:
                self.last_phase = feedback.phase
                voice_cue = f"{feedback.name} {feedback.phase}"
            
            for cue in feedback.cues:
                if "rep" in cue:
                    voice_cue = cue

            feedback_data = {
                "name": feedback.name,
                "reps": feedback.reps,
                "phase": feedback.phase,
                "cues": feedback.cues,
                "voice_cue": voice_cue
            }

            # Dataset logging
            if self.log_enabled:
                self.frame_count += 1
                if self.frame_count % 5 == 0:
                    try:
                        save_sample_csv(
                            out_dir=os.path.join(os.path.dirname(__file__), "..", "pose_app", "data"),
                            sample=Sample(
                                exercise=self.exercise_name,
                                landmarks=result.landmarks_px,
                                label=feedback.phase
                            ),
                        )
                    except Exception as e:
                        print(f"Error saving sample: {e}")

        # Encode processed frame back to JPEG
        _, buffer = cv2.imencode('.jpg', overlay)
        img_base64 = base64.b64encode(buffer).decode('utf-8')

        return {
            "image": img_base64,
            "feedback": feedback_data
        }


@app.get("/")
async def root():
    return {"message": "Pose Coach API", "status": "running"}


@app.get("/exercises")
async def get_exercises():
    return {"exercises": list(EXERCISE_MAP.keys())}


@app.websocket("/ws/pose")
async def websocket_pose_endpoint(websocket: WebSocket):
    await websocket.accept()
    processor: Optional[PoseProcessor] = None
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle configuration messages
            if message.get("type") == "config":
                exercise = message.get("exercise", "Squat")
                log_enabled = message.get("log_enabled", False)
                processor = PoseProcessor(exercise, log_enabled)
                await websocket.send_json({"type": "config_ack", "exercise": exercise})
                continue
            
            # Handle frame processing
            if message.get("type") == "frame" and processor is not None:
                frame_data = message.get("data")
                if frame_data:
                    # Remove data URL prefix if present
                    if "," in frame_data:
                        frame_data = frame_data.split(",")[1]
                    
                    frame_bytes = base64.b64decode(frame_data)
                    result = processor.process_frame(frame_bytes)
                    
                    await websocket.send_json({
                        "type": "result",
                        **result
                    })
    
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

