/**
 * TypeScript-style type definitions for the Pose Correction App
 * Note: This is JavaScript, but these serve as documentation for expected data structures
 */

// Keypoint structure from MediaPipe
export const Keypoint = {
  x: Number,        // Normalized x coordinate (0-1)
  y: Number,        // Normalized y coordinate (0-1)
  z: Number,        // Normalized z coordinate (0-1)
  visibility: Number // Confidence score (0-1)
};

// Pose detection results
export const PoseResult = {
  keypoints: Array,     // Array of 33 keypoints
  timestamp: Number,    // Timestamp in milliseconds
  confidence: Number    // Overall confidence score
};

// Exercise classification result
export const ExerciseResult = {
  exercise: String,     // Exercise name or null
  confidence: Number,   // Classification confidence (0-1)
  allScores: Object     // Scores for all exercises
};

// Form analysis result
export const FormAnalysis = {
  errors: Array,        // Array of error objects
  tips: Array,          // Array of tip strings
  score: Number,        // Overall form score (0-1)
  exercise: String,     // Exercise being analyzed
  phase: String,        // Exercise phase (static, dynamic, etc.)
  timestamp: Number     // Analysis timestamp
};

// Error object structure
export const FormError = {
  type: String,         // Error type identifier
  severity: Number,     // Error severity (0-1)
  message: String,      // User-friendly error message
  confidence: Number    // Detection confidence
};

// Battery status
export const BatteryStatus = {
  level: Number,        // Battery level (0-100)
  isCharging: Boolean,  // Whether device is charging
  optimizationLevel: String // Current optimization level
};

// Performance metrics
export const PerformanceMetrics = {
  frameRate: Number,    // Current FPS
  latency: Number,      // Processing latency in ms
  memoryUsage: Number,  // Memory usage in MB
  batteryLevel: Number  // Current battery level
};

// App configuration
export const AppConfig = {
  camera: {
    resolution: String,     // Camera resolution
    frameRate: Number,      // Target frame rate
    quality: String         // Video quality setting
  },
  processing: {
    modelComplexity: Number,    // MediaPipe model complexity (0-2)
    smoothingEnabled: Boolean,  // Whether to smooth landmarks
    minConfidence: Number       // Minimum detection confidence
  },
  feedback: {
    voiceEnabled: Boolean,      // Whether voice feedback is enabled
    textEnabled: Boolean,       // Whether text feedback is enabled
    vibrationEnabled: Boolean   // Whether vibration feedback is enabled
  }
};
