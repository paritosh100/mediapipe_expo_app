from __future__ import annotations

import os
import sys
import av
import cv2
import numpy as np
import streamlit as st
from streamlit_webrtc import webrtc_streamer, VideoTransformerBase
from typing import Optional

# Add project root to path for absolute imports
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
from pose_app.tts import TTSQueue
from pose_app.dataset import save_sample_csv, Sample


EXERCISE_MAP = {
    "Squat": SquatDetector,
    "Pushup": PushupDetector,
    "Lunge": LungeDetector,
    "Side Lunge": SideLungeDetector,
    "Hammer Curl": HammerCurlDetector,
    "Chair Dip": ChairDipDetector,
}


class PoseTransformer(VideoTransformerBase):
    def __init__(self, exercise_name: str, tts: TTSQueue, log_enabled: bool) -> None:
        self.tracker = MediaPipePoseTracker()
        self.detector = EXERCISE_MAP[exercise_name]()
        self.exercise_name = exercise_name
        self.tts = tts
        self.log_enabled = log_enabled
        self.frame_count = 0
        self.last_phase: Optional[str] = None

    def recv(self, frame: av.VideoFrame) -> av.VideoFrame:
        img = frame.to_ndarray(format="bgr24")
        result = self.tracker.process_frame(img, draw=True)
        overlay = img
        if result is not None:
            feedback: ExerciseFeedback = self.detector.infer(result.landmarks_px)
            # Draw overlay text
            text = f"{feedback.name} | reps: {feedback.reps} | phase: {feedback.phase}"
            cv2.rectangle(overlay, (10, 10), (10 + 500, 60), (0, 0, 0), -1)
            cv2.putText(
                overlay, text, (20, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2, cv2.LINE_AA
            )
            # Voice cues when phase changes or new rep
            if self.last_phase != feedback.phase:
                self.last_phase = feedback.phase
                self.tts.speak(f"{feedback.name} {feedback.phase}")
            for cue in feedback.cues:
                if "rep" in cue:
                    self.tts.speak(cue)

            # Dataset logging every N frames
            if self.log_enabled:
                self.frame_count += 1
                if self.frame_count % 5 == 0:  # reduce dataset size
                    try:
                        save_sample_csv(
                            out_dir=os.path.join(os.path.dirname(__file__), "data"),
                            sample=Sample(exercise=self.exercise_name, landmarks=result.landmarks_px, label=feedback.phase),
                        )
                    except Exception:
                        pass
        return av.VideoFrame.from_ndarray(overlay, format="bgr24")


def main() -> None:
    st.set_page_config(page_title="Pose Coach", page_icon="🏋️", layout="wide")
    st.title("Pose Coach: Real-time Exercise Feedback")

    # Custom CSS to size and center video
    st.markdown("""
    <style>
    video {
        max-width: 375px !important;
        max-height: 280px !important;
        width: 375px !important;
        height: auto !important;
        display: block !important;
        margin: 0 auto !important;
    }
    div[data-testid="stVideo"] {
        max-width: 375px !important;
        margin: 0 auto !important;
    }
    div[data-testid="stVideo"] > div {
        max-width: 375px !important;
    }
    </style>
    """, unsafe_allow_html=True)

    cols = st.columns(3)
    with cols[0]:
        exercise = st.selectbox("Choose exercise", list(EXERCISE_MAP.keys()), index=0)
    with cols[1]:
        log_enabled = st.toggle("Log dataset", value=False, help="Save landmarks to CSV periodically for training")
    with cols[2]:
        st.caption("Logging saves under pose_app/data/")

    tts = TTSQueue()

    def factory() -> PoseTransformer:
        return PoseTransformer(exercise, tts, log_enabled)

    webrtc_streamer(
        key="pose-coach",
        video_transformer_factory=factory,
        media_stream_constraints={"video": {"width": 640, "height": 480}, "audio": False},
        async_processing=True,
    )

    st.markdown("---")
    st.caption("Uses MediaPipe for pose tracking; heuristics for rep counting; local TTS for voice cues.")


if __name__ == "__main__":
    main()
