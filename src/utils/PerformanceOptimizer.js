/**
 * Performance optimization utilities for mobile pose detection
 */

class PerformanceOptimizer {
  constructor() {
    this.frameSkipCount = 0;
    this.maxFrameSkip = 2; // Process every 3rd frame
    this.lastProcessTime = 0;
    this.minProcessInterval = 33; // ~30 FPS max processing
    this.isLowPowerMode = false;
    this.batteryLevel = 100;
  }

  // Check if frame should be processed based on performance constraints
  shouldProcessFrame() {
    const now = Date.now();
    
    // Skip frames if processing too frequently
    if (now - this.lastProcessTime < this.minProcessInterval) {
      return false;
    }

    // Skip frames based on battery level
    if (this.isLowPowerMode || this.batteryLevel < 20) {
      this.frameSkipCount++;
      if (this.frameSkipCount % 3 !== 0) {
        return false;
      }
    } else {
      this.frameSkipCount++;
      if (this.frameSkipCount % 2 !== 0) {
        return false;
      }
    }

    this.lastProcessTime = now;
    return true;
  }

  // Optimize keypoints for processing
  optimizeKeypoints(keypoints) {
    if (!keypoints || keypoints.length < 33) {
      return null;
    }

    // Filter out low-confidence keypoints
    const optimizedKeypoints = keypoints.map(kp => ({
      x: Math.round(kp.x * 1000) / 1000, // Round to 3 decimal places
      y: Math.round(kp.y * 1000) / 1000,
      z: Math.round(kp.z * 1000) / 1000,
      visibility: Math.round(kp.visibility * 100) / 100 // Round to 2 decimal places
    }));

    return optimizedKeypoints;
  }

  // Reduce processing frequency based on stability
  adjustProcessingFrequency(exerciseStability) {
    if (exerciseStability > 0.9) {
      // Exercise is stable, reduce processing
      this.maxFrameSkip = 4;
      this.minProcessInterval = 50;
    } else if (exerciseStability > 0.7) {
      // Moderate stability
      this.maxFrameSkip = 2;
      this.minProcessInterval = 33;
    } else {
      // Low stability, increase processing
      this.maxFrameSkip = 1;
      this.minProcessInterval = 16;
    }
  }

  // Memory management
  clearOldData() {
    // Clear old pose data to prevent memory leaks
    if (typeof global !== 'undefined') {
      if (global.poseCache) {
        global.poseCache.clear();
      }
    }
  }

  // Battery optimization
  enableLowPowerMode() {
    this.isLowPowerMode = true;
    this.maxFrameSkip = 5;
    this.minProcessInterval = 100;
  }

  disableLowPowerMode() {
    this.isLowPowerMode = false;
    this.maxFrameSkip = 2;
    this.minProcessInterval = 33;
  }

  updateBatteryLevel(level) {
    this.batteryLevel = level;
    
    if (level < 20) {
      this.enableLowPowerMode();
    } else if (level > 50) {
      this.disableLowPowerMode();
    }
  }

  // Get optimal MediaPipe settings based on device performance
  getOptimalMediaPipeSettings(devicePerformance = 'medium') {
    const settings = {
      low: {
        modelComplexity: 0,
        smoothLandmarks: false,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
        enableSegmentation: false
      },
      medium: {
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        enableSegmentation: false
      },
      high: {
        modelComplexity: 2,
        smoothLandmarks: true,
        minDetectionConfidence: 0.3,
        minTrackingConfidence: 0.3,
        enableSegmentation: false
      }
    };

    return settings[devicePerformance] || settings.medium;
  }

  // Debounce function for feedback
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function for frequent updates
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

export default PerformanceOptimizer;
