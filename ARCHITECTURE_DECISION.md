# Architecture Decision: On-Device ML + RAG

## Decision: Implement in Mobile App (Not Backend)

### Why Mobile App?

✅ **Offline-First**: Works without internet connection  
✅ **Privacy**: Images never leave the device  
✅ **Speed**: No network latency  
✅ **Cost**: No backend infrastructure needed  
✅ **User Experience**: Instant results  

### Architecture Flow

```
┌─────────────────┐
│  User takes     │
│  photo          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CNN Model      │  ← On-device inference
│  (TensorFlow    │     (mlService.js)
│   Lite/ONNX)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Disease Name   │
│  (e.g., "Brown  │
│   Spot")        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RAG Service    │  ← Offline JSON lookup
│  (ragService.js) │     (pest-disease-solutions.json)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Display        │
│  Solutions      │
└─────────────────┘
```

## Components Created

### 1. **RAG Service** (`src/services/ragService.js`)
- Loads disease data from JSON
- Searches by disease name (fuzzy matching)
- Returns treatment solutions and prevention tips
- **100% offline** - no network needed

### 2. **ML Service** (`src/services/mlService.js`)
- Handles CNN model loading
- Preprocesses images
- Runs inference
- Returns disease predictions with confidence scores
- **On-device** - uses TensorFlow Lite or ONNX

### 3. **Disease Database** (`data/pest-disease-solutions.json`)
- JSON file with all diseases, solutions, prevention
- Easy to update without app updates
- Can be bundled with app or downloaded

### 4. **UI Screen** (`screens/PestDetectionScreen.js`)
- Camera/Gallery integration
- Image display
- Detection button
- Results display with solutions

## What You Need to Do

### Step 1: Add Your JSON Data
Replace `data/pest-disease-solutions.json` with your actual disease data.

### Step 2: Train/Get CNN Model
- Train a CNN model on your disease dataset
- Convert to TensorFlow Lite (`.tflite`) or ONNX (`.onnx`)
- Place in `assets/models/`

### Step 3: Install Dependencies
```bash
npm install react-native-image-picker
# Choose one:
npm install @tensorflow/tfjs-react-native  # OR
npm install react-native-fast-tflite       # OR
npm install onnxruntime-react-native
```

### Step 4: Update mlService.js
Replace the mock prediction with actual model inference.

## When to Use Backend Instead?

Consider backend if:
- ❌ Model is too large (>100MB)
- ❌ Need frequent model updates
- ❌ Need cloud-based RAG with embeddings
- ❌ Want to collect user data for retraining

## Current Status

✅ Architecture designed  
✅ RAG service implemented  
✅ ML service structure created  
✅ UI screen created  
⏳ Waiting for: Your JSON data + CNN model  

## Next Steps

1. Add your disease JSON file
2. Train/obtain CNN model
3. Install dependencies
4. Integrate model
5. Test!

See `ML_SETUP_GUIDE.md` for detailed setup instructions.




