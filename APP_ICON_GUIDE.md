# 📱 App Icon Replacement Guide

## Overview
You need to replace app icons in two places: **Android** and **iOS**. Each platform requires multiple sizes.

---

## 🟢 Android Icons

### Location
All Android icons are in: `android/app/src/main/res/mipmap-*/`

### Required Sizes
You need to create **2 versions** (square and round) for **5 different densities**:

| Density | Size | Square Icon | Round Icon |
|---------|------|-------------|------------|
| mdpi | 48x48 | `mipmap-mdpi/ic_launcher.png` | `mipmap-mdpi/ic_launcher_round.png` |
| hdpi | 72x72 | `mipmap-hdpi/ic_launcher.png` | `mipmap-hdpi/ic_launcher_round.png` |
| xhdpi | 96x96 | `mipmap-xhdpi/ic_launcher.png` | `mipmap-xhdpi/ic_launcher_round.png` |
| xxhdpi | 144x144 | `mipmap-xxhdpi/ic_launcher.png` | `mipmap-xxhdpi/ic_launcher_round.png` |
| xxxhdpi | 192x192 | `mipmap-xxxhdpi/ic_launcher.png` | `mipmap-xxxhdpi/ic_launcher_round.png` |

### Quick Method (Recommended)
1. Create your icon at **1024x1024** (or at least 192x192)
2. Use an online tool to generate all sizes:
   - https://icon.kitchen/ (recommended)
   - https://www.appicon.co/
   - https://makeappicon.com/
3. Download the generated Android icons
4. Replace all files in the `mipmap-*` folders

### Manual Method
1. Create your icon design
2. Export at each size listed above
3. Replace the files manually

---

## 🍎 iOS Icons

### Location
`ios/iPaddyCare/Images.xcassets/AppIcon.appiconset/`

### Required Sizes
iOS requires these sizes (from Contents.json):

| Size | Scale | Actual Size | Filename |
|------|-------|-------------|----------|
| 20x20 | 2x | 40x40 | `icon-20@2x.png` |
| 20x20 | 3x | 60x60 | `icon-20@3x.png` |
| 29x29 | 2x | 58x58 | `icon-29@2x.png` |
| 29x29 | 3x | 87x87 | `icon-29@3x.png` |
| 40x40 | 2x | 80x80 | `icon-40@2x.png` |
| 40x40 | 3x | 120x120 | `icon-40@3x.png` |
| 60x60 | 2x | 120x120 | `icon-60@2x.png` |
| 60x60 | 3x | 180x180 | `icon-60@3x.png` |
| 1024x1024 | 1x | 1024x1024 | `icon-1024.png` |

### Quick Method (Recommended)
1. Create your icon at **1024x1024**
2. Use Xcode:
   - Open `ios/iPaddyCare.xcworkspace` in Xcode
   - Select the project → Target "iPaddyCare" → General tab
   - Scroll to "App Icons and Launch Screen"
   - Drag your 1024x1024 icon into the AppIcon slot
   - Xcode will automatically generate all sizes

### Manual Method
1. Create your icon design
2. Export at each size listed above
3. Add them to `ios/iPaddyCare/Images.xcassets/AppIcon.appiconset/`
4. Update `Contents.json` to reference each file

---

## 🎨 Icon Design Tips

1. **No transparency**: Use a solid background
2. **Safe zone**: Keep important content within 80% of the icon (corners get rounded)
3. **Simple design**: Icons are small, so avoid fine details
4. **Square format**: Icons are square, but corners will be rounded automatically
5. **High quality**: Start with at least 1024x1024 for best results

---

## ✅ After Replacing Icons

### Android
```bash
# Rebuild the app
npm run android
```

### iOS
```bash
# Clean build folder in Xcode (Cmd+Shift+K)
# Then rebuild
npm run ios
```

Or rebuild in Xcode:
1. Product → Clean Build Folder (Cmd+Shift+K)
2. Product → Build (Cmd+B)

---

## 🛠️ Tools to Generate Icons

- **Icon Kitchen**: https://icon.kitchen/ (Free, recommended)
- **App Icon Generator**: https://www.appicon.co/ (Free)
- **MakeAppIcon**: https://makeappicon.com/ (Free)
- **Icon Generator**: https://icon-generator.net/ (Free)

Just upload your 1024x1024 icon and download the generated assets!

---

## 📝 Notes

- **Android round icons**: These are used on devices that support adaptive icons. Make sure they look good when cropped to a circle.
- **iOS**: The 1024x1024 icon is required for App Store submission.
- **Testing**: After replacing icons, uninstall the app completely and reinstall to see the new icon.

