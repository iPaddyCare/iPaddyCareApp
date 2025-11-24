#!/bin/bash

echo "🔍 Verifying iOS Firebase Setup..."
echo ""

# Check if file exists
if [ -f "ios/iPaddyCare/GoogleService-Info.plist" ]; then
    echo "✅ GoogleService-Info.plist exists at ios/iPaddyCare/GoogleService-Info.plist"
else
    echo "❌ GoogleService-Info.plist NOT FOUND!"
    exit 1
fi

# Check bundle ID in config file
CONFIG_BUNDLE_ID=$(grep -A 1 "BUNDLE_ID" ios/iPaddyCare/GoogleService-Info.plist | tail -1 | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
echo "📦 Bundle ID in config file: $CONFIG_BUNDLE_ID"

# Check bundle ID in Xcode project
PROJECT_BUNDLE_ID=$(grep "PRODUCT_BUNDLE_IDENTIFIER" ios/iPaddyCare.xcodeproj/project.pbxproj | grep "com.ipaddycare" | head -1 | sed 's/.*= *"*\([^";]*\)"*;.*/\1/')
echo "📦 Bundle ID in Xcode project: $PROJECT_BUNDLE_ID"

if [ "$CONFIG_BUNDLE_ID" = "$PROJECT_BUNDLE_ID" ]; then
    echo "✅ Bundle IDs match!"
else
    echo "❌ Bundle IDs DO NOT MATCH!"
    echo "   Config: $CONFIG_BUNDLE_ID"
    echo "   Project: $PROJECT_BUNDLE_ID"
fi

# Check if file is in Resources build phase
if grep -q "GoogleService-Info.plist in Resources" ios/iPaddyCare.xcodeproj/project.pbxproj; then
    echo "✅ File is in Resources build phase"
else
    echo "❌ File NOT in Resources build phase!"
fi

echo ""
echo "📋 Next steps:"
echo "1. Open ios/iPaddyCare.xcworkspace in Xcode"
echo "2. Select project → Target 'iPaddyCare' → Build Phases"
echo "3. Verify 'GoogleService-Info.plist' is in 'Copy Bundle Resources'"
echo "4. Clean Build Folder (Cmd+Shift+K)"
echo "5. Rebuild the app"
echo ""
echo "If still failing, the file might not be getting copied to the bundle."
echo "Try removing and re-adding the file in Xcode."

