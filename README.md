# Pose Correction App - Mobile Fitness Coach

A real-time pose correction app for mobile devices that helps users perform exercises with proper form.

## 🏃‍♂️ Supported Exercises
- Push-ups
- Squats  
- Lunges
- Side Lunges
- Planks
- Chair Dips

## 🚀 Features
- **Real-time pose detection** using MediaPipe BlazePose
- **On-device processing** - no internet required
- **Instant feedback** with text overlays and voice instructions
- **Exercise recognition** - automatically detects which exercise you're doing
- **Form correction** - identifies common mistakes and provides guidance

## 📱 Platform Support
- Android (API 21+)
- iOS (12.0+)

## 🛠 Installation

### Prerequisites
- Node.js 16+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Setup
```bash
# Clone the repository
git clone <repo-url>
cd pose_correction_app

# Install dependencies
npm install

# For iOS
cd ios && pod install && cd ..

# Run the app
npx react-native run-android  # or run-ios
```

## 🏗 Architecture

The app uses a modular architecture with the following components:

1. **Camera Module**: Captures video frames
2. **Pose Detection**: MediaPipe BlazePose for keypoint extraction
3. **Exercise Classifier**: Identifies current exercise from pose data
4. **Form Corrector**: Analyzes form and identifies errors
5. **Feedback System**: Provides text and voice guidance
6. **UI Components**: React Native interface

## 📊 Performance
- **Latency**: <50ms per frame
- **Accuracy**: >90% pose detection
- **Battery**: Optimized for extended use
- **Storage**: <50MB app size

## 🔧 Development

### Project Structure
```
src/
├── components/          # React Native UI components
├── services/           # Core business logic
│   ├── poseDetection/  # MediaPipe integration
│   ├── exerciseClassifier/  # Exercise recognition
│   └── formCorrector/  # Form analysis
├── utils/              # Helper functions
└── types/              # TypeScript definitions
```

### Testing
```bash
npm test
```

## 📄 License
MIT License

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support
For issues and questions, please open a GitHub issue.
