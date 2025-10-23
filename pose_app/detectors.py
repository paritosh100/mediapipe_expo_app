from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from .geometry import Point, angle_between_three_points, midpoint, distance


# MediaPipe Pose landmark indices for readability
# https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
NOSE = 0
LEFT_SHOULDER = 11
RIGHT_SHOULDER = 12
LEFT_ELBOW = 13
RIGHT_ELBOW = 14
LEFT_WRIST = 15
RIGHT_WRIST = 16
LEFT_HIP = 23
RIGHT_HIP = 24
LEFT_KNEE = 25
RIGHT_KNEE = 26
LEFT_ANKLE = 27
RIGHT_ANKLE = 28


@dataclass
class ExerciseFeedback:
    name: str
    reps: int
    phase: str
    cues: List[str]


def _p(lm: Tuple[float, float, float, float]) -> Point:
    return Point(lm[0], lm[1], lm[2], lm[3])


class RepCounter:
    def __init__(self, down_phase: str = "down", up_phase: str = "up", thresh_down: float = 1.0, thresh_up: float = 1.0) -> None:
        self.reps = 0
        self.state = up_phase
        self.down_phase = down_phase
        self.up_phase = up_phase
        self._down_flag = False
        self._up_flag = False
        self._thresh_down = thresh_down
        self._thresh_up = thresh_up

    def update(self, down_condition: bool, up_condition: bool) -> Optional[int]:
        # Debounce using flags
        if down_condition and not self._down_flag:
            self._down_flag = True
            self.state = self.down_phase
        if not down_condition:
            self._down_flag = False

        if up_condition and not self._up_flag and self.state == self.down_phase:
            self._up_flag = True
            self.state = self.up_phase
            self.reps += 1
            return self.reps
        if not up_condition:
            self._up_flag = False
        return None


class SquatDetector:
    def __init__(self) -> None:
        self.counter = RepCounter(down_phase="down", up_phase="up")

    def infer(self, lms: List[Tuple[float, float, float, float]]) -> ExerciseFeedback:
        ls, rs = _p(lms[LEFT_SHOULDER]), _p(lms[RIGHT_SHOULDER])
        lh, rh = _p(lms[LEFT_HIP]), _p(lms[RIGHT_HIP])
        lk, rk = _p(lms[LEFT_KNEE]), _p(lms[RIGHT_KNEE])
        la, ra = _p(lms[LEFT_ANKLE]), _p(lms[RIGHT_ANKLE])

        # Use knee angle and hip height relative to ankle
        left_knee_angle = angle_between_three_points(lh, lk, la)
        right_knee_angle = angle_between_three_points(rh, rk, ra)
        knee_angle = (left_knee_angle + right_knee_angle) / 2.0

        hip_mid = midpoint(lh, rh)
        ankle_mid = midpoint(la, ra)
        hip_to_ankle = distance(hip_mid, ankle_mid)
        shoulder_mid = midpoint(ls, rs)
        shoulder_to_ankle = distance(shoulder_mid, ankle_mid)
        depth_ratio = hip_to_ankle / max(shoulder_to_ankle, 1e-6)

        cues: List[str] = []
        if knee_angle < 70:
            cues.append("Knees too closed; avoid collapsing")
        if knee_angle > 170:
            cues.append("Start bending knees to go down")

        down_condition = knee_angle < 100 or depth_ratio < 0.45
        up_condition = knee_angle > 160 and depth_ratio > 0.6
        rep = self.counter.update(down_condition, up_condition)
        if rep is not None:
            cues.append(f"Squat rep {rep}")

        return ExerciseFeedback(name="squat", reps=self.counter.reps, phase=self.counter.state, cues=cues)


class PushupDetector:
    def __init__(self) -> None:
        self.counter = RepCounter(down_phase="down", up_phase="up")

    def infer(self, lms: List[Tuple[float, float, float, float]]) -> ExerciseFeedback:
        ls, rs = _p(lms[LEFT_SHOULDER]), _p(lms[RIGHT_SHOULDER])
        le, re = _p(lms[LEFT_ELBOW]), _p(lms[RIGHT_ELBOW])
        lw, rw = _p(lms[LEFT_WRIST]), _p(lms[RIGHT_WRIST])

        left_elbow = angle_between_three_points(ls, le, lw)
        right_elbow = angle_between_three_points(rs, re, rw)
        elbow_angle = (left_elbow + right_elbow) / 2.0

        cues: List[str] = []
        if elbow_angle > 170:
            cues.append("Lower down")
        if elbow_angle < 80:
            cues.append("Keep elbows tucked")

        down_condition = elbow_angle < 95
        up_condition = elbow_angle > 165
        rep = self.counter.update(down_condition, up_condition)
        if rep is not None:
            cues.append(f"Pushup rep {rep}")

        return ExerciseFeedback(name="pushup", reps=self.counter.reps, phase=self.counter.state, cues=cues)


class LungeDetector:
    def __init__(self) -> None:
        self.counter = RepCounter(down_phase="down", up_phase="up")

    def infer(self, lms: List[Tuple[float, float, float, float]]) -> ExerciseFeedback:
        lh, rh = _p(lms[LEFT_HIP]), _p(lms[RIGHT_HIP])
        lk, rk = _p(lms[LEFT_KNEE]), _p(lms[RIGHT_KNEE])
        la, ra = _p(lms[LEFT_ANKLE]), _p(lms[RIGHT_ANKLE])

        left_knee = angle_between_three_points(lh, lk, la)
        right_knee = angle_between_three_points(rh, rk, ra)
        knee_angle = min(left_knee, right_knee)

        cues: List[str] = []
        if knee_angle > 170:
            cues.append("Step forward and lower knee")

        down_condition = knee_angle < 100
        up_condition = knee_angle > 165
        rep = self.counter.update(down_condition, up_condition)
        if rep is not None:
            cues.append(f"Lunge rep {rep}")

        return ExerciseFeedback(name="lunge", reps=self.counter.reps, phase=self.counter.state, cues=cues)


class SideLungeDetector:
    def __init__(self) -> None:
        self.counter = RepCounter(down_phase="down", up_phase="up")

    def infer(self, lms: List[Tuple[float, float, float, float]]) -> ExerciseFeedback:
        # Use hip-knee-ankle angle on the side with more bend
        lh, rh = _p(lms[LEFT_HIP]), _p(lms[RIGHT_HIP])
        lk, rk = _p(lms[LEFT_KNEE]), _p(lms[RIGHT_KNEE])
        la, ra = _p(lms[LEFT_ANKLE]), _p(lms[RIGHT_ANKLE])

        left_knee = angle_between_three_points(lh, lk, la)
        right_knee = angle_between_three_points(rh, rk, ra)
        knee_angle = min(left_knee, right_knee)

        cues: List[str] = []
        if knee_angle > 170:
            cues.append("Shift hips to one side and bend the knee")

        down_condition = knee_angle < 110
        up_condition = knee_angle > 165
        rep = self.counter.update(down_condition, up_condition)
        if rep is not None:
            cues.append(f"Side lunge rep {rep}")

        return ExerciseFeedback(name="side_lunge", reps=self.counter.reps, phase=self.counter.state, cues=cues)


class HammerCurlDetector:
    def __init__(self) -> None:
        self.counter = RepCounter(down_phase="down", up_phase="up")

    def infer(self, lms: List[Tuple[float, float, float, float]]) -> ExerciseFeedback:
        ls, rs = _p(lms[LEFT_SHOULDER]), _p(lms[RIGHT_SHOULDER])
        le, re = _p(lms[LEFT_ELBOW]), _p(lms[RIGHT_ELBOW])
        lw, rw = _p(lms[LEFT_WRIST]), _p(lms[RIGHT_WRIST])

        left_elbow = angle_between_three_points(ls, le, lw)
        right_elbow = angle_between_three_points(rs, re, rw)
        elbow_angle = (left_elbow + right_elbow) / 2.0

        cues: List[str] = []
        if elbow_angle > 160:
            cues.append("Curl up")
        if elbow_angle < 60:
            cues.append("Lower slowly; control the descent")

        down_condition = elbow_angle < 70
        up_condition = elbow_angle > 155
        rep = self.counter.update(down_condition, up_condition)
        if rep is not None:
            cues.append(f"Hammer curl rep {rep}")

        return ExerciseFeedback(name="hammer_curl", reps=self.counter.reps, phase=self.counter.state, cues=cues)


class ChairDipDetector:
    def __init__(self) -> None:
        self.counter = RepCounter(down_phase="down", up_phase="up")

    def infer(self, lms: List[Tuple[float, float, float, float]]) -> ExerciseFeedback:
        ls, rs = _p(lms[LEFT_SHOULDER]), _p(lms[RIGHT_SHOULDER])
        le, re = _p(lms[LEFT_ELBOW]), _p(lms[RIGHT_ELBOW])
        lw, rw = _p(lms[LEFT_WRIST]), _p(lms[RIGHT_WRIST])

        left_elbow = angle_between_three_points(ls, le, lw)
        right_elbow = angle_between_three_points(rs, re, rw)
        elbow = (left_elbow + right_elbow) / 2.0

        cues: List[str] = []
        if elbow > 160:
            cues.append("Lower body by bending elbows")
        if elbow < 80:
            cues.append("Push through palms to rise")

        down_condition = elbow < 95
        up_condition = elbow > 165
        rep = self.counter.update(down_condition, up_condition)
        if rep is not None:
            cues.append(f"Chair dip rep {rep}")

        return ExerciseFeedback(name="chair_dip", reps=self.counter.reps, phase=self.counter.state, cues=cues)
