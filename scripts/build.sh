#!/bin/bash

# Build script for Pose Correction App
# Usage: ./scripts/build.sh [android|ios] [debug|release]

set -e

PLATFORM=${1:-android}
BUILD_TYPE=${2:-debug}

echo "🚀 Building Pose Correction App for $PLATFORM ($BUILD_TYPE)"

# Check if React Native CLI is installed
if ! command -v react-native &> /dev/null; then
    echo "❌ React Native CLI not found. Installing..."
    npm install -g react-native-cli
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
if [ "$PLATFORM" = "android" ]; then
    cd android && ./gradlew clean && cd ..
elif [ "$PLATFORM" = "ios" ]; then
    cd ios && xcodebuild clean && cd ..
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# iOS specific setup
if [ "$PLATFORM" = "ios" ]; then
    echo "🍎 Setting up iOS dependencies..."
    cd ios && pod install && cd ..
fi

# Build the app
echo "🔨 Building $PLATFORM app ($BUILD_TYPE)..."

if [ "$PLATFORM" = "android" ]; then
    if [ "$BUILD_TYPE" = "release" ]; then
        react-native run-android --variant=release
    else
        react-native run-android
    fi
elif [ "$PLATFORM" = "ios" ]; then
    if [ "$BUILD_TYPE" = "release" ]; then
        react-native run-ios --configuration Release
    else
        react-native run-ios
    fi
fi

echo "✅ Build completed successfully!"

# Optional: Run tests
if [ "$BUILD_TYPE" = "debug" ]; then
    echo "🧪 Running tests..."
    npm test
fi

echo "🎉 All done! Your app is ready."
