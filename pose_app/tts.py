from __future__ import annotations

import threading
import queue
from typing import Optional

try:
    import pyttsx3  # type: ignore
except Exception:  # pragma: no cover
    pyttsx3 = None  # Fallback if not installed


class TTSQueue:
    def __init__(self, rate: int = 185, volume: float = 1.0) -> None:
        self._enabled = pyttsx3 is not None
        self._queue: "queue.Queue[str]" = queue.Queue()
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._engine = None
        if self._enabled:
            self._engine = pyttsx3.init()
            self._engine.setProperty("rate", rate)
            self._engine.setProperty("volume", volume)
            self._thread = threading.Thread(target=self._run, daemon=True)
            self._thread.start()

    def speak(self, text: str) -> None:
        if not self._enabled:
            return
        if not text:
            return
        # Avoid flooding by ignoring duplicates if the last queued equals
        try:
            last = self._queue.queue[-1]  # type: ignore[attr-defined]
            if last == text:
                return
        except Exception:
            pass
        self._queue.put(text)

    def _run(self) -> None:
        assert self._engine is not None
        while not self._stop_event.is_set():
            try:
                text = self._queue.get(timeout=0.1)
            except queue.Empty:
                continue
            try:
                self._engine.say(text)
                self._engine.runAndWait()
            except Exception:
                # Swallow TTS errors to keep app running
                pass

    def shutdown(self) -> None:
        self._stop_event.set()
        if self._thread is not None:
            self._thread.join(timeout=1.0)
        try:
            if self._engine is not None:
                self._engine.stop()
        except Exception:
            pass
