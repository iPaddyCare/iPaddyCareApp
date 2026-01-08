import { NativeModules } from 'react-native';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';

const { PestDetectionModule } = NativeModules;
const INPUT_SIZE = 224;

const DISEASE_CLASSES = [
  'bacterial_leaf_blight',
  'bacterial_leaf_streak',
  'bacterial_panicle_blight',
  'blast',
  'brown_spot',
  'dead_heart',
  'downy_mildew',
  'hispa',
  'normal',
  'tungro',
];

let initialized = false;

// ---------------------- Initialize Model ----------------------
export async function initializeModel() {
  if (initialized) return true;
  if (!PestDetectionModule) throw new Error('Native module not found');
  console.log('🔹 Initializing TFLite model...');
  await PestDetectionModule.initializeModel();
  initialized = true;
  console.log('✅ Model initialized');
  return true;
}

// ---------------------- ALTERNATIVE Preprocessing (Try different methods) ----------------------
async function preprocessImageEfficientNet(imageUri) {
  console.log('📷 Preprocessing image (EfficientNet method):', imageUri);

  // Resize image
  const resized = await ImageResizer.createResizedImage(
    imageUri,
    INPUT_SIZE,
    INPUT_SIZE,
    'JPEG',
    100,
    0,
    undefined,
    false,
    { mode: 'stretch' }
  );

  let path = resized.uri || resized.path;
  if (path.startsWith('file://')) path = path.replace('file://', '');
  
  const base64 = await RNFS.readFile(path, 'base64');
  const raw = jpeg.decode(Buffer.from(base64, 'base64'), { useTArray: true });
  
  if (!raw?.data) throw new Error('Failed to decode image');
  
  console.log('🔹 Raw image decoded. Size:', raw.width + 'x' + raw.height);

  // TRY METHOD 1: Original method from your Python code
  // Let's test what tf.keras.applications.efficientnet.preprocess_input actually does
  
  const tensor = new Float32Array(INPUT_SIZE * INPUT_SIZE * 3);
  
  // Based on TensorFlow's efficientnet preprocess_input:
  // For EfficientNet models, it does: inputs = (inputs - [127.5, 127.5, 127.5]) / [127.5, 127.5, 127.5]
  // Which simplifies to: inputs = (inputs / 127.5) - 1
  
  for (let i = 0; i < INPUT_SIZE * INPUT_SIZE; i++) {
    const dataIdx = i * 4;
    const r = raw.data[dataIdx];
    const g = raw.data[dataIdx + 1];
    const b = raw.data[dataIdx + 2];
    
    const tensorIdx = i * 3;
    
    // Method 1: Simple scaling to [-1, 1] (common for EfficientNet)
    // This matches: (inputs / 127.5) - 1
    tensor[tensorIdx] = (r / 127.5) - 1.0;     // R
    tensor[tensorIdx + 1] = (g / 127.5) - 1.0; // G
    tensor[tensorIdx + 2] = (b / 127.5) - 1.0; // B
  }

  console.log('📊 First 6 preprocessed values:', 
    Array.from(tensor.slice(0, 6)).map(v => v.toFixed(2))
  );
  
  return tensor;
}

// ---------------------- Alternative: BGR with means ----------------------
async function preprocessImageEfficientNetBGR(imageUri) {
  console.log('📷 Preprocessing image (BGR + means method)');
  
  // ... same image loading code ...
  const resized = await ImageResizer.createResizedImage(
    imageUri,
    INPUT_SIZE,
    INPUT_SIZE,
    'JPEG',
    100,
    0,
    undefined,
    false,
    { mode: 'stretch' }
  );

  let path = resized.uri || resized.path;
  if (path.startsWith('file://')) path = path.replace('file://', '');
  
  const base64 = await RNFS.readFile(path, 'base64');
  const raw = jpeg.decode(Buffer.from(base64, 'base64'), { useTArray: true });
  
  const tensor = new Float32Array(INPUT_SIZE * INPUT_SIZE * 3);
  
  // ImageNet means for BGR order
  const IMAGENET_MEANS_BGR = [103.939, 116.779, 123.68];
  
  for (let i = 0; i < INPUT_SIZE * INPUT_SIZE; i++) {
    const dataIdx = i * 4;
    const r = raw.data[dataIdx];
    const g = raw.data[dataIdx + 1];
    const b = raw.data[dataIdx + 2];
    
    const tensorIdx = i * 3;
    
    // Convert RGB to BGR and subtract means
    tensor[tensorIdx] = (b - IMAGENET_MEANS_BGR[0]);     // B (blue)
    tensor[tensorIdx + 1] = (g - IMAGENET_MEANS_BGR[1]); // G (green)
    tensor[tensorIdx + 2] = (r - IMAGENET_MEANS_BGR[2]); // R (red)
  }
  
  console.log('📊 BGR First 6 values:', 
    Array.from(tensor.slice(0, 6)).map(v => v.toFixed(2))
  );
  
  return tensor;
}

// ---------------------- Alternative: No preprocessing (test) ----------------------
async function preprocessImageRaw(imageUri) {
  console.log('📷 Preprocessing image (Raw pixel values)');
  
  const resized = await ImageResizer.createResizedImage(
    imageUri,
    INPUT_SIZE,
    INPUT_SIZE,
    'JPEG',
    100,
    0,
    undefined,
    false,
    { mode: 'stretch' }
  );

  let path = resized.uri || resized.path;
  if (path.startsWith('file://')) path = path.replace('file://', '');
  
  const base64 = await RNFS.readFile(path, 'base64');
  const raw = jpeg.decode(Buffer.from(base64, 'base64'), { useTArray: true });
  
  const tensor = new Float32Array(INPUT_SIZE * INPUT_SIZE * 3);
  
  for (let i = 0; i < INPUT_SIZE * INPUT_SIZE; i++) {
    const dataIdx = i * 4;
    const tensorIdx = i * 3;
    
    // Just use raw RGB values (0-255)
    tensor[tensorIdx] = raw.data[dataIdx];         // R
    tensor[tensorIdx + 1] = raw.data[dataIdx + 1]; // G
    tensor[tensorIdx + 2] = raw.data[dataIdx + 2]; // B
  }
  
  console.log('📊 Raw First 6 values:', 
    Array.from(tensor.slice(0, 6)).map(v => v.toFixed(2))
  );
  
  return tensor;
}

// ---------------------- Softmax ----------------------
function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - maxLogit));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

// ---------------------- Prediction with different preprocessing methods ----------------------
export async function predict(imageUri) {
  if (!initialized) throw new Error('Model not initialized');

  console.log('🚀 Starting prediction...');
  
  // Try Method 1: Simple scaling [-1, 1]
  console.log('\n=== TRYING METHOD 1: Simple scaling [-1, 1] ===');
  const tensor1 = await preprocessImageEfficientNet(imageUri);
  const result1 = await runPrediction(tensor1, 'method1');
  
  // Try Method 2: BGR + means
  console.log('\n=== TRYING METHOD 2: BGR + ImageNet means ===');
  const tensor2 = await preprocessImageEfficientNetBGR(imageUri);
  const result2 = await runPrediction(tensor2, 'method2');
  
  // Try Method 3: Raw pixels
  console.log('\n=== TRYING METHOD 3: Raw pixels (0-255) ===');
  const tensor3 = await preprocessImageRaw(imageUri);
  const result3 = await runPrediction(tensor3, 'method3');
  
  // Compare results
  console.log('\n=== COMPARISON ===');
  console.log('Method 1 (simple):', result1.disease, `${(result1.confidence * 100).toFixed(2)}%`);
  console.log('Method 2 (BGR):', result2.disease, `${(result2.confidence * 100).toFixed(2)}%`);
  console.log('Method 3 (raw):', result3.disease, `${(result3.confidence * 100).toFixed(2)}%`);
  
  // Return the one with highest confidence
  const results = [result1, result2, result3];
  const bestResult = results.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );
  
  console.log('\n🏆 Best result:', bestResult.disease, `${(bestResult.confidence * 100).toFixed(2)}%`);
  
  return bestResult;
}

// ---------------------- Run single prediction ----------------------
async function runPrediction(tensor, methodName) {
  console.log(`📞 Calling native module (${methodName})...`);
  
  // Convert tensor to array safely
  const tensorArray = [];
  for (let i = 0; i < tensor.length; i++) {
    tensorArray.push(tensor[i]);
  }
  
  const result = await PestDetectionModule.predict(tensorArray);
  
  if (!result?.logits) {
    throw new Error(`Invalid logits from native module (${methodName})`);
  }
  
  console.log(`📥 Raw outputs (${methodName}):`, 
    result.logits.map((v, i) => `${DISEASE_CLASSES[i]}: ${v.toFixed(6)}`)
  );
  
  const outputs = result.logits;
  
  // Check if outputs are already probabilities
  const sum = outputs.reduce((a, b) => a + b, 0);
  const allPositive = outputs.every(v => v >= 0);
  
  console.log(`${methodName} - Sum: ${sum.toFixed(4)}, All positive: ${allPositive}`);
  
  let probabilities;
  if (allPositive && Math.abs(sum - 1.0) < 0.1) {
    console.log(`${methodName}: Outputs are already probabilities`);
    probabilities = outputs;
  } else {
    console.log(`${methodName}: Applying softmax to logits`);
    probabilities = softmax(outputs);
  }
  
  // Find max
  let maxIndex = 0;
  let maxProb = probabilities[0];
  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > maxProb) {
      maxProb = probabilities[i];
      maxIndex = i;
    }
  }
  
  // Get top 3
  const predictions = probabilities.map((p, i) => ({
    disease: DISEASE_CLASSES[i],
    probability: p
  }));
  
  predictions.sort((a, b) => b.probability - a.probability);
  
  return {
    disease: DISEASE_CLASSES[maxIndex],
    confidence: maxProb,
    method: methodName,
    rawOutputs: outputs,
    probabilities: predictions,
    topPrediction: predictions[0]
  };
}

// ---------------------- Debug: Test exact Python preprocessing ----------------------
export async function testExactPythonPreprocessing() {
  console.log('🐍 Testing EXACT Python preprocessing replication');
  
  // Based on Python output, the model expects:
  // 1. Image resized to 224x224
  // 2. EfficientNet preprocessing
  
  // Let me check what tf.keras.applications.efficientnet.preprocess_input actually returns
  console.log('Note: tf.keras.applications.efficientnet.preprocess_input:');
  console.log('For EfficientNetB0: mean = [0.485, 0.456, 0.406], std = [0.229, 0.224, 0.225]');
  console.log('Actually: preprocess_input does (inputs - mean) / std');
  
  return 'Check console for preprocessing details';
}

// ---------------------- Create test image from Python values ----------------------
export async function debugImagePreprocessing(imageUri) {
  console.log('🔍 DEBUG: Analyzing image preprocessing');
  
  const resized = await ImageResizer.createResizedImage(
    imageUri,
    INPUT_SIZE,
    INPUT_SIZE,
    'JPEG',
    100,
    0,
    undefined,
    false,
    { mode: 'stretch' }
  );

  let path = resized.uri || resized.path;
  if (path.startsWith('file://')) path = path.replace('file://', '');
  
  const base64 = await RNFS.readFile(path, 'base64');
  const raw = jpeg.decode(Buffer.from(base64, 'base64'), { useTArray: true });
  
  // Sample first pixel
  const r = raw.data[0];
  const g = raw.data[1];
  const b = raw.data[2];
  
  console.log('🔍 First pixel RGB:', { r, g, b });
  
  // Different preprocessing calculations
  console.log('\n🔍 Different preprocessing methods for first pixel:');
  console.log('1. Raw RGB:', [r, g, b]);
  console.log('2. Simple scaling [-1, 1]:', 
    [(r/127.5)-1, (g/127.5)-1, (b/127.5)-1].map(v => v.toFixed(4))
  );
  console.log('3. BGR + means (103.9, 116.8, 123.7):', 
    [(b-103.939), (g-116.779), (r-123.68)].map(v => v.toFixed(4))
  );
  console.log('4. Normalized [0, 1]:', 
    [r/255, g/255, b/255].map(v => v.toFixed(4))
  );
  
  // Check middle pixel too
  const midIdx = Math.floor(INPUT_SIZE * INPUT_SIZE / 2) * 4;
  const midR = raw.data[midIdx];
  const midG = raw.data[midIdx + 1];
  const midB = raw.data[midIdx + 2];
  
  console.log('\n🔍 Middle pixel RGB:', { r: midR, g: midG, b: midB });
  
  return {
    firstPixel: { r, g, b },
    middlePixel: { r: midR, g: midG, b: midB }
  };
}

// ---------------------- Quick prediction (use this if others fail) ----------------------
export async function predictQuick(imageUri) {
  if (!initialized) throw new Error('Model not initialized');
  
  console.log('⚡ Quick prediction');
  
  // Use the method that matches Python output
  const tensor = await preprocessImageEfficientNet(imageUri); // Simple scaling
  
  const tensorArray = [];
  for (let i = 0; i < tensor.length; i++) {
    tensorArray.push(tensor[i]);
  }
  
  console.log('First 10 values:', tensorArray.slice(0, 10).map(v => v.toFixed(2)));
  
  const result = await PestDetectionModule.predict(tensorArray);
  const outputs = result.logits;
  
  console.log('Raw outputs:', outputs);
  
  // Check if we need softmax
  const sum = outputs.reduce((a, b) => a + b, 0);
  const needsSoftmax = Math.abs(sum - 1.0) > 0.1;
  
  const probabilities = needsSoftmax ? softmax(outputs) : outputs;
  
  console.log('Probabilities:', probabilities.map(p => p.toFixed(4)));
  
  let maxIdx = 0;
  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > probabilities[maxIdx]) {
      maxIdx = i;
    }
  }
  
  return {
    disease: DISEASE_CLASSES[maxIdx],
    confidence: probabilities[maxIdx],
    allProbabilities: probabilities.map((p, i) => ({
      disease: DISEASE_CLASSES[i],
      probability: p
    }))
  };
}

export default { 
  initializeModel, 
  predict,
  predictQuick,
  debugImagePreprocessing,
  testExactPythonPreprocessing
};