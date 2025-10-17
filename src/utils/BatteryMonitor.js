import { NativeModules, NativeEventEmitter } from 'react-native';

class BatteryMonitor {
  constructor() {
    this.batteryLevel = 100;
    this.isCharging = false;
    this.eventEmitter = null;
    this.listeners = [];
    this.optimizationCallback = null;
  }

  async initialize() {
    try {
      // For Android
      if (NativeModules.BatteryModule) {
        this.eventEmitter = new NativeEventEmitter(NativeModules.BatteryModule);
        this.setupBatteryListeners();
        await this.getBatteryStatus();
      } else {
        // Fallback: simulate battery monitoring
        this.simulateBatteryMonitoring();
      }
    } catch (error) {
      console.error('Error initializing battery monitor:', error);
      this.simulateBatteryMonitoring();
    }
  }

  setupBatteryListeners() {
    if (!this.eventEmitter) return;

    this.eventEmitter.addListener('BatteryLevelChanged', (data) => {
      this.batteryLevel = data.level;
      this.isCharging = data.isCharging;
      this.notifyListeners();
      this.triggerOptimization();
    });

    this.eventEmitter.addListener('BatteryStatusChanged', (data) => {
      this.isCharging = data.isCharging;
      this.notifyListeners();
    });
  }

  async getBatteryStatus() {
    try {
      if (NativeModules.BatteryModule) {
        const status = await NativeModules.BatteryModule.getBatteryStatus();
        this.batteryLevel = status.level;
        this.isCharging = status.isCharging;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error getting battery status:', error);
    }
  }

  // Fallback simulation for testing
  simulateBatteryMonitoring() {
    // Simulate battery drain
    setInterval(() => {
      if (!this.isCharging && this.batteryLevel > 0) {
        this.batteryLevel = Math.max(0, this.batteryLevel - 0.1);
        this.notifyListeners();
        this.triggerOptimization();
      }
    }, 30000); // Update every 30 seconds
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback({
          level: this.batteryLevel,
          isCharging: this.isCharging
        });
      } catch (error) {
        console.error('Error in battery listener:', error);
      }
    });
  }

  setOptimizationCallback(callback) {
    this.optimizationCallback = callback;
  }

  triggerOptimization() {
    if (this.optimizationCallback) {
      const optimizationLevel = this.getOptimizationLevel();
      this.optimizationCallback(optimizationLevel);
    }
  }

  getOptimizationLevel() {
    if (this.batteryLevel < 15) {
      return 'critical';
    } else if (this.batteryLevel < 30) {
      return 'low';
    } else if (this.batteryLevel < 50) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  getBatteryInfo() {
    return {
      level: this.batteryLevel,
      isCharging: this.isCharging,
      optimizationLevel: this.getOptimizationLevel()
    };
  }

  // Battery optimization recommendations
  getOptimizationRecommendations() {
    const recommendations = [];

    if (this.batteryLevel < 20) {
      recommendations.push('Enable power saving mode');
      recommendations.push('Reduce processing frequency');
      recommendations.push('Disable voice feedback');
    }

    if (this.batteryLevel < 50 && !this.isCharging) {
      recommendations.push('Consider connecting to charger');
    }

    return recommendations;
  }

  dispose() {
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners();
    }
    this.listeners = [];
    this.optimizationCallback = null;
  }
}

export default BatteryMonitor;
