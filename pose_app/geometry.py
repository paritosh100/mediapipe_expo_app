from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple
import math


@dataclass
class Point:
    x: float
    y: float
    z: float = 0.0
    visibility: float = 1.0


def angle_between_three_points(a: Point, b: Point, c: Point) -> float:
    """Return angle ABC (at b) in degrees, safe against zero-length vectors."""
    ab = (a.x - b.x, a.y - b.y)
    cb = (c.x - b.x, c.y - b.y)
    ab_len = math.hypot(*ab)
    cb_len = math.hypot(*cb)
    if ab_len == 0 or cb_len == 0:
        return 0.0
    dot = (ab[0] * cb[0] + ab[1] * cb[1]) / (ab_len * cb_len)
    dot = max(-1.0, min(1.0, dot))
    return math.degrees(math.acos(dot))


def distance(a: Point, b: Point) -> float:
    return math.hypot(a.x - b.x, a.y - b.y)


def normalize_angle(angle_deg: float) -> float:
    while angle_deg < 0:
        angle_deg += 360
    while angle_deg >= 360:
        angle_deg -= 360
    return angle_deg


def torso_incline(shoulder_mid: Point, hip_mid: Point) -> float:
    """Return torso incline angle in degrees from horizontal (0=horizontal, 90=vertical)."""
    dx = hip_mid.x - shoulder_mid.x
    dy = hip_mid.y - shoulder_mid.y
    if dx == 0 and dy == 0:
        return 0.0
    angle = math.degrees(math.atan2(dy, dx))
    # Convert to [0..180] relative to horizontal
    angle = abs(angle)
    if angle > 180:
        angle = 360 - angle
    if angle > 180:
        angle = 180
    return angle


def midpoint(a: Point, b: Point) -> Point:
    return Point((a.x + b.x) / 2.0, (a.y + b.y) / 2.0)


def to_points(landmarks: List[Tuple[float, float, float, float]]) -> List[Point]:
    return [Point(*lm) for lm in landmarks]
