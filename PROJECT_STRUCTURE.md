# 📁 Pose Correction App - Project Structure

```
pose-correction-app/
├── 📱 App.js                          # Main app component with welcome screen
├── 📦 package.json                     # Dependencies and scripts
├── ⚙️ babel.config.js                  # Babel configuration
├── 🚇 metro.config.js                  # Metro bundler configuration
├── 📖 README.md                        # Project documentation
├── 🚀 SETUP_GUIDE.md                   # 10-day setup guide
├── 📁 PROJECT_STRUCTURE.md             # This file
├── 📋 requirements.txt                 # Python dependencies (for reference)
│
├── 📁 src/                             # Source code
│   ├── 📁 components/                  # React Native UI components
│   │   ├── 📱 CameraView.js            # Main camera component
│   │   ├── 🎨 PoseOverlay.js           # Pose visualization overlay
│   │   └── 💬 FeedbackDisplay.js       # Text and voice feedback
│   │
│   ├── 📁 services/                    # Core business logic
│   │   ├── 📁 poseDetection/           # Pose detection services
│   │   │   ├── 🔍 MediaPipeDetector.js # MediaPipe integration
│   │   │   └── 🛠 keypointUtils.js     # Keypoint processing utilities
│   │   │
│   │   ├── 📁 exerciseClassifier/      # Exercise recognition
│   │   │   └── 🏋️ ExerciseClassifier.js # Exercise classification logic
│   │   │
│   │   └── 📁 formCorrector/           # Form analysis and correction
│   │       └── ✅ FormCorrector.js     # Form correction rules and analysis
│   │
│   ├── 📁 utils/                       # Utility functions
│   │   ├── ⚡ PerformanceOptimizer.js  # Performance optimization
│   │   └── 🔋 BatteryMonitor.js        # Battery monitoring
│   │
│   ├── 📁 types/                       # Type definitions
│   │   └── 📝 index.js                 # Data structure definitions
│   │
│   └── 📁 __tests__/                   # Test files
│       ├── 🧪 PoseDetection.test.js    # Pose detection tests
│       ├── 🧪 ExerciseClassifier.test.js # Exercise classification tests
│       └── 🧪 FormCorrector.test.js    # Form correction tests
│
├── 📁 android/                         # Android-specific files
│   ├── 📁 app/
│   │   ├── 📁 src/main/
│   │   │   ├── 📄 AndroidManifest.xml  # Android permissions and config
│   │   │   └── 📁 java/                # Java/Kotlin source files
│   │   └── 📄 build.gradle             # Android build configuration
│   └── 📄 build.gradle                 # Root Android build file
│
├── 📁 ios/                             # iOS-specific files
│   ├── 📁 PoseCorrectionApp/
│   │   ├── 📄 Info.plist               # iOS app configuration
│   │   └── 📁 AppDelegate.m            # iOS app delegate
│   ├── 📄 Podfile                      # CocoaPods dependencies
│   └── 📄 PoseCorrectionApp.xcworkspace # Xcode workspace
│
├── 📁 scripts/                         # Build and deployment scripts
│   ├── 🔨 build.sh                     # Build script for Android/iOS
│   └── 🚀 deploy.sh                    # Deployment script
│
├── 📁 fastlane/                        # Fastlane automation
│   └── 📄 Fastfile                     # Fastlane configuration
│
└── 📁 docs/                            # Documentation (optional)
    ├── 📄 API.md                       # API documentation
    ├── 📄 ARCHITECTURE.md              # System architecture
    └── 📄 TROUBLESHOOTING.md           # Common issues and solutions
```

## 🎯 Key Files Explained

### Core App Files
- **`App.js`** - Main app component with welcome screen and permission handling
- **`package.json`** - All dependencies and npm scripts
- **`babel.config.js`** - Babel configuration for JavaScript transpilation
- **`metro.config.js`** - Metro bundler configuration for React Native

### Source Code (`src/`)
- **`components/`** - React Native UI components for camera, pose overlay, and feedback
- **`services/`** - Core business logic for pose detection, exercise classification, and form correction
- **`utils/`** - Performance optimization and battery monitoring utilities
- **`types/`** - Data structure definitions for better code documentation
- **`__tests__/`** - Unit tests for all major components

### Platform-Specific Files
- **`android/`** - Android-specific configuration, permissions, and build files
- **`ios/`** - iOS-specific configuration, Info.plist, and Xcode workspace

### Build & Deployment
- **`scripts/`** - Shell scripts for building and deploying the app
- **`fastlane/`** - Fastlane configuration for automated app store deployment

## 🚀 Quick Navigation

### To start development:
1. **Setup**: Follow `SETUP_GUIDE.md`
2. **Run**: `npx react-native run-android` or `npx react-native run-ios`
3. **Test**: `npm test`

### To modify pose detection:
- Edit: `src/services/poseDetection/MediaPipeDetector.js`
- Test: `src/__tests__/PoseDetection.test.js`

### To add new exercises:
- Edit: `src/services/exerciseClassifier/ExerciseClassifier.js`
- Edit: `src/services/formCorrector/FormCorrector.js`
- Test: `src/__tests__/ExerciseClassifier.test.js`

### To customize UI:
- Edit: `src/components/CameraView.js` - Main camera interface
- Edit: `src/components/PoseOverlay.js` - Pose visualization
- Edit: `src/components/FeedbackDisplay.js` - Feedback system

### To optimize performance:
- Edit: `src/utils/PerformanceOptimizer.js`
- Edit: `src/utils/BatteryMonitor.js`

### To deploy to app stores:
- Run: `./scripts/deploy.sh android playstore`
- Run: `./scripts/deploy.sh ios appstore`

## 📊 File Size Estimates

- **Total Project**: ~50MB
- **Source Code**: ~200KB
- **Dependencies**: ~45MB (node_modules)
- **Android Build**: ~25MB (APK)
- **iOS Build**: ~30MB (IPA)

## 🔧 Development Workflow

1. **Feature Development**: Add new files in appropriate `src/` subdirectories
2. **Testing**: Write tests in `src/__tests__/`
3. **Build**: Use `./scripts/build.sh` for testing
4. **Deploy**: Use `./scripts/deploy.sh` for app store releases

## 📱 Platform-Specific Notes

### Android
- Requires Android SDK 30+
- Camera permissions in `AndroidManifest.xml`
- Gradle build system

### iOS
- Requires Xcode 12+
- Camera permissions in `Info.plist`
- CocoaPods dependency management

---

**This structure is optimized for a 10-day development timeline with clear separation of concerns and easy navigation!** 🎯
