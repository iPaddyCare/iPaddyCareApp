# ML & RAG Setup Guide

## Overview
This app implements an **offline-first** disease detection system using:
1. **CNN Model** - For detecting diseases from images (on-device)
2. **RAG System** - For retrieving solutions from JSON database (offline)

## Architecture

```
User takes photo → CNN detects disease → RAG retrieves solutions → Display results
```

## Setup Steps

### 1. Install Required Dependencies

```bash
npm install react-native-image-picker
npm install @tensorflow/tfjs-react-native
npm install @tensorflow/tfjs-platform-react-native
# OR for TensorFlow Lite:
npm install react-native-fast-tflite
# OR for ONNX Runtime:
npm install onnxruntime-react-native
```

### 2. Add Your Disease Data

1. Place your JSON file at: `data/pest-disease-solutions.json`
2. Format should match the example structure (see existing file)
3. Each disease should have:
   - `name`: Disease name
   - `aliases`: Alternative names (optional)
   - `description`: Disease description
   - `severity`: "low", "medium", "high", "critical"
   - `solutions`: Array of treatment steps
   - `prevention`: Array of prevention tips

### 3. Add Your CNN Model

1. **Convert your model** to TensorFlow Lite (`.tflite`) or ONNX (`.onnx`)
2. Place model file in: `assets/models/disease_model.tflite`
3. Update `src/services/mlService.js`:
   ```javascript
   await mlService.initialize('assets/models/disease_model.tflite');
   ```

### 4. Model Training Tips

- **Input size**: 224x224 or 256x256 pixels
- **Classes**: Match disease names in your JSON file
- **Format**: TensorFlow Lite or ONNX for React Native compatibility
- **Size**: Keep under 50MB for mobile deployment

### 5. Update Android/iOS Permissions

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

**iOS** (`ios/iPaddyCare/Info.plist`):
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to take photos of plants for disease detection</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to select plant images</string>
```

## File Structure

```
iPaddyCareApp/
├── data/
│   └── pest-disease-solutions.json    # Your disease database
├── assets/
│   └── models/
│       └── disease_model.tflite      # Your CNN model
├── src/
│   ├── services/
│   │   ├── mlService.js              # CNN inference service
│   │   └── ragService.js             # RAG solution retrieval
│   └── ...
└── screens/
    └── PestDetectionScreen.js        # Main detection UI
```

## How It Works

1. **User captures/selects image** → `PestDetectionScreen.js`
2. **CNN detects disease** → `mlService.predict(imageUri)`
3. **RAG retrieves solutions** → `ragService.getSolution(diseaseName)`
4. **Results displayed** → Treatment steps, prevention tips

## Testing Without Model

The `mlService.js` currently returns mock predictions. To test:
1. Use the existing mock data
2. Replace with actual model once you have it trained

## Next Steps

1. ✅ Add your disease JSON data
2. ✅ Train/obtain CNN model
3. ✅ Integrate model into `mlService.js`
4. ✅ Test on device
5. ✅ Optimize model size if needed

## Resources

- TensorFlow Lite: https://www.tensorflow.org/lite
- ONNX Runtime: https://onnxruntime.ai/
- React Native Image Picker: https://github.com/react-native-image-picker/react-native-image-picker




