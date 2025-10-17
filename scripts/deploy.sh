#!/bin/bash

# Deployment script for Pose Correction App
# Usage: ./scripts/deploy.sh [android|ios] [playstore|appstore]

set -e

PLATFORM=${1:-android}
STORE=${2:-playstore}

echo "🚀 Deploying Pose Correction App to $PLATFORM ($STORE)"

# Check prerequisites
if [ "$PLATFORM" = "android" ]; then
    if ! command -v fastlane &> /dev/null; then
        echo "❌ Fastlane not found. Installing..."
        gem install fastlane
    fi
elif [ "$PLATFORM" = "ios" ]; then
    if ! command -v fastlane &> /dev/null; then
        echo "❌ Fastlane not found. Installing..."
        gem install fastlane
    fi
fi

# Build release version
echo "🔨 Building release version..."
./scripts/build.sh $PLATFORM release

# Deploy to store
if [ "$PLATFORM" = "android" ] && [ "$STORE" = "playstore" ]; then
    echo "📱 Deploying to Google Play Store..."
    cd android
    fastlane android deploy
    cd ..
    
elif [ "$PLATFORM" = "ios" ] && [ "$STORE" = "appstore" ]; then
    echo "🍎 Deploying to Apple App Store..."
    cd ios
    fastlane ios deploy
    cd ..
    
else
    echo "❌ Invalid platform/store combination"
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo "🎉 Your app is now live on the $STORE!"
