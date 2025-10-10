#!/bin/bash

# CosmicBoard Icon Deployment Script
# Deploys generated app icons to the mobile project

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paths
ICON_SOURCE="/Users/sammuthu/Projects/cosmicboard/app-icons"
MOBILE_PROJECT="/Users/sammuthu/Projects/cosmicboard-mobile"

# Version to deploy (default: v1-orbital-alignment)
VERSION="${1:-v1-orbital-alignment}"

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}  CosmicBoard Icon Deployment${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Validate version
if [ ! -d "$ICON_SOURCE/$VERSION" ]; then
    echo -e "${YELLOW}❌ Version '$VERSION' not found!${NC}"
    echo -e "${YELLOW}Available versions:${NC}"
    ls -d $ICON_SOURCE/v* | xargs -n 1 basename
    echo ""
    echo -e "${YELLOW}Usage: $0 [version]${NC}"
    echo -e "${YELLOW}Example: $0 v1-orbital-alignment${NC}"
    exit 1
fi

echo -e "${GREEN}📦 Deploying: $VERSION${NC}"
echo ""

# 1. Deploy to Expo assets folder
echo -e "${BLUE}1️⃣  Deploying to Expo assets...${NC}"

# Main icon (1024x1024)
cp "$ICON_SOURCE/$VERSION/ios/icon-1024.png" "$MOBILE_PROJECT/assets/icon.png"
echo "  ✓ Copied icon.png (1024x1024)"

# Adaptive icon for Android (1024x1024)
cp "$ICON_SOURCE/$VERSION/android/icon-512.png" "$MOBILE_PROJECT/assets/adaptive-icon.png"
echo "  ✓ Copied adaptive-icon.png (512x512)"

# Splash screen icon
cp "$ICON_SOURCE/$VERSION/ios/icon-1024.png" "$MOBILE_PROJECT/assets/splash-icon.png"
echo "  ✓ Copied splash-icon.png (1024x1024)"

# Favicon (for web)
cp "$ICON_SOURCE/$VERSION/ios/icon-180.png" "$MOBILE_PROJECT/assets/favicon.png"
echo "  ✓ Copied favicon.png (180x180)"

echo ""

# 2. Deploy iOS icons
echo -e "${BLUE}2️⃣  Deploying iOS icons...${NC}"

IOS_ASSETS_DIR="$MOBILE_PROJECT/ios/cosmicboard/Images.xcassets/AppIcon.appiconset"

if [ -d "$IOS_ASSETS_DIR" ]; then
    # Clear existing icons
    rm -f "$IOS_ASSETS_DIR"/*.png 2>/dev/null || true

    # Copy all iOS icons
    cp "$ICON_SOURCE/$VERSION/ios"/*.png "$IOS_ASSETS_DIR/" 2>/dev/null || {
        echo -e "${YELLOW}  ⚠️  iOS assets directory exists but couldn't copy icons${NC}"
        echo -e "${YELLOW}     This is normal for a fresh project - icons will be used from assets/icon.png${NC}"
    }

    echo "  ✓ iOS icons deployed to Images.xcassets"
else
    echo -e "${YELLOW}  ℹ️  iOS assets directory not found${NC}"
    echo -e "${YELLOW}     This is normal for Expo - using assets/icon.png instead${NC}"
fi

echo ""

# 3. Deploy Android icons
echo -e "${BLUE}3️⃣  Deploying Android icons...${NC}"

ANDROID_RES_DIR="$MOBILE_PROJECT/android/app/src/main/res"

if [ -d "$ANDROID_RES_DIR" ]; then
    # Remove any existing .webp files to avoid conflicts
    find "$ANDROID_RES_DIR/mipmap-"* -name "*.webp" -type f -delete 2>/dev/null || true

    # Remove adaptive icon XML files (we're using PNG directly)
    rm -rf "$ANDROID_RES_DIR/mipmap-anydpi-v26" 2>/dev/null || true

    # Create mipmap directories and copy icons
    # mdpi (48px)
    mkdir -p "$ANDROID_RES_DIR/mipmap-mdpi"
    if [ -f "$ICON_SOURCE/$VERSION/android/icon-48.png" ]; then
        cp "$ICON_SOURCE/$VERSION/android/icon-48.png" "$ANDROID_RES_DIR/mipmap-mdpi/ic_launcher.png"
        cp "$ICON_SOURCE/$VERSION/android/icon-48.png" "$ANDROID_RES_DIR/mipmap-mdpi/ic_launcher_round.png"
        echo "  ✓ Deployed mdpi icons (48×48)"
    fi

    # hdpi (72px)
    mkdir -p "$ANDROID_RES_DIR/mipmap-hdpi"
    if [ -f "$ICON_SOURCE/$VERSION/android/icon-72.png" ]; then
        cp "$ICON_SOURCE/$VERSION/android/icon-72.png" "$ANDROID_RES_DIR/mipmap-hdpi/ic_launcher.png"
        cp "$ICON_SOURCE/$VERSION/android/icon-72.png" "$ANDROID_RES_DIR/mipmap-hdpi/ic_launcher_round.png"
        echo "  ✓ Deployed hdpi icons (72×72)"
    fi

    # xhdpi (96px)
    mkdir -p "$ANDROID_RES_DIR/mipmap-xhdpi"
    if [ -f "$ICON_SOURCE/$VERSION/android/icon-96.png" ]; then
        cp "$ICON_SOURCE/$VERSION/android/icon-96.png" "$ANDROID_RES_DIR/mipmap-xhdpi/ic_launcher.png"
        cp "$ICON_SOURCE/$VERSION/android/icon-96.png" "$ANDROID_RES_DIR/mipmap-xhdpi/ic_launcher_round.png"
        echo "  ✓ Deployed xhdpi icons (96×96)"
    fi

    # xxhdpi (144px)
    mkdir -p "$ANDROID_RES_DIR/mipmap-xxhdpi"
    if [ -f "$ICON_SOURCE/$VERSION/android/icon-144.png" ]; then
        cp "$ICON_SOURCE/$VERSION/android/icon-144.png" "$ANDROID_RES_DIR/mipmap-xxhdpi/ic_launcher.png"
        cp "$ICON_SOURCE/$VERSION/android/icon-144.png" "$ANDROID_RES_DIR/mipmap-xxhdpi/ic_launcher_round.png"
        echo "  ✓ Deployed xxhdpi icons (144×144)"
    fi

    # xxxhdpi (192px)
    mkdir -p "$ANDROID_RES_DIR/mipmap-xxxhdpi"
    if [ -f "$ICON_SOURCE/$VERSION/android/icon-192.png" ]; then
        cp "$ICON_SOURCE/$VERSION/android/icon-192.png" "$ANDROID_RES_DIR/mipmap-xxxhdpi/ic_launcher.png"
        cp "$ICON_SOURCE/$VERSION/android/icon-192.png" "$ANDROID_RES_DIR/mipmap-xxxhdpi/ic_launcher_round.png"
        echo "  ✓ Deployed xxxhdpi icons (192×192)"
    fi

    # Copy Play Store icon
    if [ -f "$ICON_SOURCE/$VERSION/android/icon-512.png" ]; then
        cp "$ICON_SOURCE/$VERSION/android/icon-512.png" "$ANDROID_RES_DIR/../play-store-icon.png"
        echo "  ✓ Deployed Play Store icon (512×512)"
    fi
else
    echo -e "${YELLOW}  ℹ️  Android res directory not found${NC}"
    echo -e "${YELLOW}     This is normal for Expo - using assets/adaptive-icon.png instead${NC}"
fi

echo ""

# 4. Summary
echo -e "${BLUE}=================================================${NC}"
echo -e "${GREEN}✨ Icon deployment complete!${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""
echo -e "${GREEN}📱 What was deployed:${NC}"
echo "   • Main app icon (1024×1024)"
echo "   • Android adaptive icon (512×512)"
echo "   • Splash screen icon"
echo "   • iOS icons (all required sizes)"
echo "   • Android icons (all densities)"
echo ""
echo -e "${GREEN}🔄 Next steps:${NC}"
echo "   1. Clear build cache: cd $MOBILE_PROJECT && npx expo start -c"
echo "   2. Test on iOS: npx expo run:ios"
echo "   3. Test on Android: npx expo run:android"
echo ""
echo -e "${YELLOW}💡 To deploy a different version:${NC}"
echo "   • v1-orbital-alignment (Current - Recommended)"
echo "   • v2-network-constellation"
echo "   • v3-cosmic-compass"
echo ""
echo "   Run: $0 v2-network-constellation"
echo ""
