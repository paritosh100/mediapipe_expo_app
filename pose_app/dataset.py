from __future__ import annotations

import csv
import os
from dataclasses import dataclass
from typing import List, Tuple

from .geometry import Point


@dataclass
class Sample:
    exercise: str
    landmarks: List[Tuple[float, float, float, float]]
    label: str  # e.g., phase or rep boundary


def ensure_dir(path: str) -> None:
    if not os.path.isdir(path):
        os.makedirs(path, exist_ok=True)


def save_sample_csv(out_dir: str, sample: Sample) -> None:
    ensure_dir(out_dir)
    rows = [[sample.exercise, sample.label] + list(map(str, lm)) for lm in sample.landmarks]
    out_path = os.path.join(out_dir, f"{sample.exercise}.csv")
    new_file = not os.path.exists(out_path)
    with open(out_path, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if new_file:
            header = ["exercise", "label"] + [f"lm{i}_{k}" for i in range(len(sample.landmarks)) for k in ["x","y","z","vis"]]
            writer.writerow(header)
        for row in rows:
            writer.writerow(row)


# Placeholder for future ML training hooks
# You can implement feature extraction, train/test split, and a classifier/regressor.
