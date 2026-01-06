import * as ort from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import { Image } from 'react-native';

// Model path: assets/models/paddy_efficientnet_b1.onnx
const MODEL_PATH = 'assets/models/paddy_efficientnet_b1.onnx';
const INPUT_SIZE = 224;

// TODO: Replace with your actual disease class names in the correct order
// This should match the order of outputs from your model
const DISEASE_CLASSES = [
  'Healthy',
  'Disease1',
  'Disease2',
  // ... add all your disease classes here in the correct order
];

let session = null;
let initialized = false;
let modelPath = null;

export async function initializeModel() {
  if (initialized) return true;

  try {
    // Copy model from assets to a temporary location (ONNX needs file path, not asset URI)
    const tempModelPath = `${RNFS.TemporaryDirectoryPath}/paddy_efficientnet_b1.onnx`;
    
    // Check if model already exists in temp location
    const exists = await RNFS.exists(tempModelPath);
    if (!exists) {
      // Copy from assets to temp location
      await RNFS.copyFileAssets(MODEL_PATH, tempModelPath);
    }
    
    modelPath = tempModelPath;
    
    // Load ONNX model
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['cpu'], // Use 'nnapi' for Android or 'coreml' for iOS for better performance
    });
    
    initialized = true;
    console.log('✅ Pest Detection Model (ONNX) initialized successfully');
    console.log('Input names:', session.inputNames);
    console.log('Output names:', session.outputNames);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Pest Detection Model:', error);
    initialized = false;
    return false;
  }
}

/**
 * Preprocess image for ONNX model
 * Converts image URI to normalized tensor [1, 3, 224, 224]
 * 
 * NOTE: This is a simplified version. For production, you'll need proper image processing:
 * 1. Install: npm install react-native-image-resizer
 * 2. Resize image to 224x224
 * 3. Convert to RGB array
 * 4. Normalize pixel values (divide by 255.0)
 * 5. Rearrange to NCHW format [1, 3, 224, 224]
 * 
 * For now, this creates a placeholder tensor. You'll need to implement proper preprocessing
 * after testing the model output format in Colab.
 */
async function preprocessImageSimple(imageUri) {
  try {
    // TODO: Implement proper image preprocessing
    // Steps needed:
    // 1. Read image from URI
    // 2. Resize to 224x224 (use react-native-image-resizer or similar)
    // 3. Extract RGB pixel values
    // 4. Normalize: pixel_value / 255.0
    // 5. Rearrange to [1, 3, 224, 224] format (NCHW: batch, channels, height, width)
    
    // Placeholder: Create tensor with zeros
    // Replace this with actual image processing
    const tensorData = new Float32Array(1 * 3 * INPUT_SIZE * INPUT_SIZE);
    tensorData.fill(0.5); // Placeholder - replace with actual normalized pixel values
    
    console.warn('⚠️ Using placeholder image preprocessing. Implement proper preprocessing for production.');
    
    return {
      data: tensorData,
      shape: [1, 3, INPUT_SIZE, INPUT_SIZE], // NCHW format
    };
  } catch (error) {
    console.error('Error preprocessing image:', error);
    throw error;
  }
}

/**
 * Apply softmax to convert logits to probabilities
 * @param {Float32Array|Array} logits - Raw logit values from model
 * @returns {Array} - Probabilities (sums to 1.0)
 */
function softmax(logits) {
  // Convert to array if needed
  const logitsArray = Array.from(logits);
  
  // Find max logit for numerical stability (prevents overflow)
  const maxLogit = Math.max(...logitsArray);
  
  // Compute exp(x_i - max) for each logit
  const expLogits = logitsArray.map(logit => Math.exp(logit - maxLogit));
  
  // Sum of all exp values
  const sumExp = expLogits.reduce((sum, val) => sum + val, 0);
  
  // Normalize to get probabilities
  const probabilities = expLogits.map(exp => exp / sumExp);
  
  return probabilities;
}

export async function predict(imageUri) {
  if (!initialized || !session) {
    throw new Error('Pest Detection Model not initialized');
  }

  try {
    // Preprocess image
    const preprocessed = await preprocessImageSimple(imageUri);
    
    // Create ONNX tensor
    const inputTensor = new ort.Tensor('float32', preprocessed.data, preprocessed.shape);
    
    // Prepare feeds (input name from model)
    const inputName = session.inputNames[0];
    const feeds = { [inputName]: inputTensor };
    
    // Run inference
    const results = await session.run(feeds);
    
    // Get output tensor (this contains raw logits, not probabilities)
    const outputName = session.outputNames[0];
    const outputTensor = results[outputName];
    const logits = outputTensor.data; // Float32Array of raw logits [1, num_classes]
    
    // Convert logits to probabilities using softmax
    const probabilities = softmax(logits);
    
    // Find top predictions
    const indexed = probabilities.map((prob, index) => ({
      index,
      probability: prob,
      disease: DISEASE_CLASSES[index] || `Class_${index}`,
    }));
    
    // Sort by probability (descending)
    indexed.sort((a, b) => b.probability - a.probability);
    
    // Get top prediction
    const topPrediction = indexed[0];
    
    // Get alternatives (2nd and 3rd)
    const alternatives = indexed.slice(1, 3);
    
    return {
      disease: topPrediction.disease,
      confidence: topPrediction.probability,
      alternatives: alternatives.map(alt => ({
        name: alt.disease,
        confidence: alt.probability,
      })),
    };
  } catch (error) {
    console.error('Failed to predict disease:', error);
    throw error;
  }
}

export default {
  initializeModel,
  predict,
};
