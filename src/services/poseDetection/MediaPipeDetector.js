import { MediaPipePose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

class MediaPipeDetector {
  constructor() {
    this.pose = null;
    this.isInitialized = false;
    this.onResults = null;
  }

  async initialize() {
    try {
      this.pose = new MediaPipePose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.pose.setOptions({
        modelComplexity: 1, // 0, 1, or 2. Higher = more accurate but slower
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.pose.onResults((results) => {
        if (this.onResults) {
          this.onResults(results);
        }
      });

      this.isInitialized = true;
      console.log('MediaPipe Pose initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MediaPipe Pose:', error);
      throw error;
    }
  }

  async processFrame(videoElement) {
    if (!this.isInitialized) {
      throw new Error('MediaPipe Pose not initialized');
    }

    try {
      await this.pose.send({ image: videoElement });
    } catch (error) {
      console.error('Error processing frame:', error);
    }
  }

  setOnResultsCallback(callback) {
    this.onResults = callback;
  }

  // Extract keypoints in a standardized format
  extractKeypoints(results) {
    if (!results.poseLandmarks) {
      return null;
    }

    const keypoints = [];
    for (const landmark of results.poseLandmarks) {
      keypoints.push({
        x: landmark.x,
        y: landmark.y,
        z: landmark.z,
        visibility: landmark.visibility
      });
    }

    return {
      keypoints,
      timestamp: Date.now(),
      confidence: this.calculateOverallConfidence(keypoints)
    };
  }

  calculateOverallConfidence(keypoints) {
    const totalVisibility = keypoints.reduce((sum, kp) => sum + kp.visibility, 0);
    return totalVisibility / keypoints.length;
  }

  // Get specific body part keypoints
  getBodyPartKeypoints(keypoints, bodyPart) {
    const bodyPartMap = {
      // Head and shoulders
      nose: 0,
      leftEye: 2, rightEye: 5,
      leftEar: 7, rightEar: 8,
      leftShoulder: 11, rightShoulder: 12,
      
      // Arms
      leftElbow: 13, rightElbow: 14,
      leftWrist: 15, rightWrist: 16,
      
      // Torso
      leftHip: 23, rightHip: 24,
      
      // Legs
      leftKnee: 25, rightKnee: 26,
      leftAnkle: 27, rightAnkle: 28,
      leftHeel: 29, rightHeel: 30,
      leftFootIndex: 31, rightFootIndex: 32
    };

    if (bodyPartMap[bodyPart] !== undefined) {
      return keypoints[bodyPartMap[bodyPart]];
    }
    
    // Handle multiple keypoints for complex body parts
    if (bodyPart === 'shoulders') {
      return [keypoints[11], keypoints[12]];
    }
    if (bodyPart === 'hips') {
      return [keypoints[23], keypoints[24]];
    }
    if (bodyPart === 'knees') {
      return [keypoints[25], keypoints[26]];
    }
    if (bodyPart === 'ankles') {
      return [keypoints[27], keypoints[28]];
    }

    return null;
  }

  dispose() {
    if (this.pose) {
      this.pose.close();
      this.pose = null;
    }
    this.isInitialized = false;
  }
}

export default MediaPipeDetector;
