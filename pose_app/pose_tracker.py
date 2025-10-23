from __future__ import annotations

from dataclasses import dataclass
from typing import List, Tuple, Optional

import cv2
import numpy as np
from ultralytics import YOLO


@dataclass
class PoseResult:
    image_bgr: np.ndarray
    landmarks_px: List[Tuple[float, float, float, float]]  # x, y, z, visibility in pixel space (x,y)
    landmarks_norm: List[Tuple[float, float, float, float]]  # normalized [0..1]


class MediaPipePoseTracker:
    def __init__(self) -> None:
        # Use YOLOv8n Pose model (downloads on first run)
        self._model = YOLO("yolov8n-pose.pt")
        # Map COCO keypoints to MediaPipe-like indices our detectors use
        self._coco_to_mp = {
            5: 11,  # L_shoulder -> LEFT_SHOULDER
            6: 12,  # R_shoulder -> RIGHT_SHOULDER
            7: 13,  # L_elbow -> LEFT_ELBOW
            8: 14,  # R_elbow -> RIGHT_ELBOW
            9: 15,  # L_wrist -> LEFT_WRIST
            10: 16, # R_wrist -> RIGHT_WRIST
            11: 23, # L_hip -> LEFT_HIP
            12: 24, # R_hip -> RIGHT_HIP
            13: 25, # L_knee -> LEFT_KNEE
            14: 26, # R_knee -> RIGHT_KNEE
            15: 27, # L_ankle -> LEFT_ANKLE
            16: 28, # R_ankle -> RIGHT_ANKLE
        }

    def process_frame(self, frame_bgr: np.ndarray, draw: bool = True) -> Optional[PoseResult]:
        h, w = frame_bgr.shape[:2]
        # Inference
        results = self._model.predict(frame_bgr, verbose=False)
        if not results:
            return None
        r = results[0]
        if r.keypoints is None or len(r.keypoints) == 0 or r.boxes is None or len(r.boxes) == 0:
            return None
        # Pick the highest confidence person
        best_idx = int(np.argmax(r.boxes.conf.cpu().numpy()))
        kps_xy = r.keypoints.xy[best_idx].cpu().numpy()  # (17, 2)
        kps_conf = (
            r.keypoints.conf[best_idx].cpu().numpy()
            if r.keypoints.conf is not None
            else np.ones((kps_xy.shape[0],), dtype=np.float32)
        )

        # Initialize 33 MP-style entries
        landmarks_px: List[Tuple[float, float, float, float]] = [(0.0, 0.0, 0.0, 0.0)] * 33
        landmarks_norm: List[Tuple[float, float, float, float]] = [(0.0, 0.0, 0.0, 0.0)] * 33

        for coco_idx, mp_idx in self._coco_to_mp.items():
            x, y = kps_xy[coco_idx]
            v = float(kps_conf[coco_idx])
            landmarks_px[mp_idx] = (float(x), float(y), 0.0, v)
            landmarks_norm[mp_idx] = (float(x) / w, float(y) / h, 0.0, v)

        if draw:
            for _, mp_idx in self._coco_to_mp.items():
                x, y, _, vis = landmarks_px[mp_idx]
                if vis > 0:
                    cv2.circle(frame_bgr, (int(x), int(y)), 3, (0, 255, 0), -1)
        return PoseResult(image_bgr=frame_bgr, landmarks_px=landmarks_px, landmarks_norm=landmarks_norm)

    def close(self) -> None:
        pass
