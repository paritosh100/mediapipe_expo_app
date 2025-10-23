from __future__ import annotations

import glob
import os
from typing import List
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib


DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "baseline_model.joblib")


def load_dataset(data_dir: str = DATA_DIR) -> pd.DataFrame:
    files = glob.glob(os.path.join(data_dir, "*.csv"))
    if not files:
        raise SystemExit("No dataset CSV files found. Use the app to collect samples.")
    frames = [pd.read_csv(f) for f in files]
    df = pd.concat(frames, ignore_index=True)
    return df


def train() -> None:
    df = load_dataset()
    # label could be phase or exercise
    y = df["exercise"].astype(str)
    X = df.drop(columns=["exercise", "label"])  # use all landmarks as features

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipe = Pipeline([
        ("scaler", StandardScaler(with_mean=False)),
        ("clf", LogisticRegression(max_iter=1000))
    ])
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    print(classification_report(y_test, y_pred))
    joblib.dump(pipe, MODEL_PATH)
    print(f"Saved baseline model to {MODEL_PATH}")


if __name__ == "__main__":
    train()
