import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import './App.css';

const EXERCISES = [
  "Squat",
  "Pushup", 
  "Lunge",
  "Side Lunge",
  "Hammer Curl",
  "Chair Dip"
];

const WS_URL = 'ws://localhost:8000/ws/pose';

function App() {
  const webcamRef = useRef(null);
  const wsRef = useRef(null);
  const [selectedExercise, setSelectedExercise] = useState('Squat');
  const [logEnabled, setLogEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [feedback, setFeedback] = useState({
    name: '',
    reps: 0,
    phase: 'unknown',
    cues: []
  });
  const [lastVoiceCue, setLastVoiceCue] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const processingRef = useRef(false);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        // Send initial config
        ws.send(JSON.stringify({
          type: 'config',
          exercise: selectedExercise,
          log_enabled: logEnabled
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'config_ack') {
          console.log('Config acknowledged:', data.exercise);
        } else if (data.type === 'result') {
          if (data.image) {
            setProcessedImage(`data:image/jpeg;base64,${data.image}`);
          }
          if (data.feedback) {
            setFeedback(data.feedback);
            
            // Handle voice cue
            if (data.feedback.voice_cue) {
              setLastVoiceCue(data.feedback.voice_cue);
              speakText(data.feedback.voice_cue);
            }
          }
          processingRef.current = false;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Update config when exercise or log settings change
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'config',
        exercise: selectedExercise,
        log_enabled: logEnabled
      }));
    }
  }, [selectedExercise, logEnabled]);

  // Text-to-speech function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Capture and send frame to backend
  const captureFrame = useCallback(() => {
    if (
      webcamRef.current &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN &&
      !processingRef.current
    ) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        processingRef.current = true;
        wsRef.current.send(JSON.stringify({
          type: 'frame',
          data: imageSrc
        }));
      }
    }
  }, []);

  // Set up frame capture interval
  useEffect(() => {
    if (!isCapturing) {
      // Reset feedback when stopped
      setProcessedImage(null);
      setFeedback({
        name: '',
        reps: 0,
        phase: 'unknown',
        cues: []
      });
      return;
    }
    
    const interval = setInterval(() => {
      captureFrame();
    }, 100); // Capture every 100ms (~10 FPS)

    return () => clearInterval(interval);
  }, [captureFrame, isCapturing]);

  return (
    <div className="app">
      <header className="header">
        <h1>🏋️ Pose Coach: Real-time Exercise Feedback</h1>
      </header>

      <main className="main-content">
        <div className="controls">
          <div className="control-group">
            <label htmlFor="exercise-select">Choose exercise:</label>
            <select
              id="exercise-select"
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="select-input"
            >
              {EXERCISES.map(exercise => (
                <option key={exercise} value={exercise}>{exercise}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <button
              onClick={() => setIsCapturing(!isCapturing)}
              className={`start-stop-btn ${isCapturing ? 'stop' : 'start'}`}
              disabled={!isConnected}
            >
              {isCapturing ? '⏸ Stop' : '▶ Start'}
            </button>
          </div>

          <div className="control-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={logEnabled}
                onChange={(e) => setLogEnabled(e.target.checked)}
              />
              <span>Log dataset</span>
            </label>
            {logEnabled && (
              <small className="help-text">Logging saves under pose_app/data/</small>
            )}
          </div>

          <div className="status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '● Connected' : '○ Disconnected'}
            </span>
          </div>
        </div>

        <div className="video-container">
          <div className="webcam-wrapper">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user"
              }}
              className="webcam-hidden"
            />
          </div>
          
          {processedImage && (
            <div className="processed-video">
              <img src={processedImage} alt="Processed pose" />
            </div>
          )}
          
          {!processedImage && (
            <div className="placeholder">
              <p>
                {!isConnected 
                  ? 'Connecting to server...' 
                  : !isCapturing 
                    ? 'Press START to begin workout tracking' 
                    : 'Initializing camera...'}
              </p>
            </div>
          )}
        </div>

        <div className="feedback-panel">
          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">Exercise:</span>
              <span className="stat-value">{feedback.name || selectedExercise}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Reps:</span>
              <span className="stat-value">{feedback.reps}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Phase:</span>
              <span className="stat-value phase">{feedback.phase}</span>
            </div>
          </div>
          
          {feedback.cues && feedback.cues.length > 0 && (
            <div className="cues">
              <h3>Form Cues:</h3>
              <ul>
                {feedback.cues.map((cue, idx) => (
                  <li key={idx}>{cue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Uses YOLOv8 Pose for tracking • Heuristic algorithms for rep counting • Web Speech API for voice cues</p>
      </footer>
    </div>
  );
}

export default App;

