import TFLite from 'react-native-fast-tflite';
import { Image } from 'react-native';

// Model path for Android: assets/models/rice_disease_effnet.tflite
// Model path for iOS: should be added to Xcode project
const MODEL_PATH = 'models/rice_disease_effnet.tflite';
const INPUT_SIZE = 224;

let model = null;
let initialized = false;

export async function initializeModel() {
  if (initialized) return true;

  try {
    model = await TFLite.loadModel(MODEL_PATH); 
    model.setNumThreads(4);
    model.setUseNNAPI(true);
    initialized = true;
    console.log('Pest Detection Model initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Pest Detection Model:', error);
    initialized = false;
    return false;
  }
}

async function preprocessImage(imageUri) {
  return new Promise((resolve, reject) => {
    Image.getSize(imageUri, (width, height) => {
      // Resize and normalize image to INPUT_SIZE x INPUT_SIZE
      // Convert to tensor format expected by TFLite
      const tensor = {
        data: null, // Will be filled by TFLite
        shape: [1, INPUT_SIZE, INPUT_SIZE, 3], // [batch, height, width, channels]
      };
      resolve(tensor);
    }, reject);
  });
}

export async function predict(imageUri) {
  if (!initialized || !model) {
    throw new Error('Pest Detection Model not initialized');
  }

  try {
    // TFLite predict expects image path directly
    const predictions = await model.predict(imageUri, INPUT_SIZE, INPUT_SIZE);
    
    // Get top prediction
    const topPrediction = predictions[0];
    
    return {
      disease: topPrediction.label || topPrediction.name,
      confidence: topPrediction.score || topPrediction.confidence,
      alternatives: predictions.slice(1, 3).map(p => ({
        name: p.label || p.name,
        confidence: p.score || p.confidence,
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

