import { NativeModules } from 'react-native';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';

const { PestDetectionModule } = NativeModules;
const INPUT_SIZE = 224;

// Disease model classes (existing model - 10 classes)
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

// Pest model classes (new model - 12 classes)
const PEST_CLASSES = [
  'Rice Leaf Roller',
  'Rice Leaf Caterpillar',
  'Rice Shell Pest',
  'Thrips',
  'Paddy Stem Maggot',
  'Asiatic Rice Borer',
  'Yellow Rice Borer',
  'Rice Gall Midge',
  'Brown Plant Hopper',
  'Rice Stem Fly',
  'Rice Water Weevil',
  'Rice Leaf Hopper',
];

let initialized = false;

// ---------------------- Initialize Models ----------------------
export async function initializeModel() {
  if (initialized) return true;
  if (!PestDetectionModule) throw new Error('Native module not found');
  console.log('Initializing TFLite models (disease + pest)...');
  await PestDetectionModule.initializeModel();
  initialized = true;
  console.log('Both models initialized');
  return true;
}

// ---------------------- Preprocessing ----------------------
async function preprocessImage(imageUri) {
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

  const tensor = new Float32Array(INPUT_SIZE * INPUT_SIZE * 3);

  // EfficientNet preprocessing: (pixels / 127.5) - 1 → range [-1, 1]
  for (let i = 0; i < INPUT_SIZE * INPUT_SIZE; i++) {
    const dataIdx = i * 4;
    const tensorIdx = i * 3;
    tensor[tensorIdx] = (raw.data[dataIdx] / 127.5) - 1.0;       // R
    tensor[tensorIdx + 1] = (raw.data[dataIdx + 1] / 127.5) - 1.0; // G
    tensor[tensorIdx + 2] = (raw.data[dataIdx + 2] / 127.5) - 1.0; // B
  }

  return tensor;
}

// ---------------------- Softmax ----------------------
function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - maxLogit));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

// ---------------------- Convert tensor to plain array ----------------------
function tensorToArray(tensor) {
  const arr = [];
  for (let i = 0; i < tensor.length; i++) {
    arr.push(tensor[i]);
  }
  return arr;
}

// ---------------------- Process model output ----------------------
function processOutput(outputs, classNames) {
  const sum = outputs.reduce((a, b) => a + b, 0);
  const allPositive = outputs.every(v => v >= 0);

  let probabilities;
  if (allPositive && Math.abs(sum - 1.0) < 0.1) {
    probabilities = outputs;
  } else {
    probabilities = softmax(outputs);
  }

  let maxIdx = 0;
  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > probabilities[maxIdx]) {
      maxIdx = i;
    }
  }

  const predictions = probabilities.map((p, i) => ({
    name: classNames[i],
    probability: p,
  }));
  predictions.sort((a, b) => b.probability - a.probability);

  return {
    disease: classNames[maxIdx],
    confidence: probabilities[maxIdx],
    predictions,
  };
}

// ---------------------- Disease Detection ----------------------
export async function predictDisease(imageUri) {
  if (!initialized) throw new Error('Models not initialized');

  const tensor = await preprocessImage(imageUri);
  const tensorArray = tensorToArray(tensor);
  const result = await PestDetectionModule.predict(tensorArray);

  if (!result?.logits) throw new Error('Invalid response from disease model');

  const output = processOutput(result.logits, DISEASE_CLASSES);
  return {
    ...output,
    type: 'disease',
  };
}

// ---------------------- Pest Detection ----------------------
export async function predictPest(imageUri) {
  if (!initialized) throw new Error('Models not initialized');

  const tensor = await preprocessImage(imageUri);
  const tensorArray = tensorToArray(tensor);
  const result = await PestDetectionModule.predictPest(tensorArray);

  if (!result?.logits) throw new Error('Invalid response from pest model');

  const output = processOutput(result.logits, PEST_CLASSES);
  return {
    ...output,
    type: 'pest',
  };
}

// ---------------------- Run both models, pick best ----------------------
export async function predict(imageUri) {
  if (!initialized) throw new Error('Models not initialized');

  // Preprocess once, reuse for both models
  const tensor = await preprocessImage(imageUri);
  const tensorArray = tensorToArray(tensor);

  // Run both models in parallel
  const [diseaseResult, pestResult] = await Promise.all([
    PestDetectionModule.predict(tensorArray),
    PestDetectionModule.predictPest(tensorArray),
  ]);

  const diseaseOutput = processOutput(diseaseResult.logits, DISEASE_CLASSES);
  const pestOutput = processOutput(pestResult.logits, PEST_CLASSES);

  console.log(`Disease model: ${diseaseOutput.disease} (${(diseaseOutput.confidence * 100).toFixed(1)}%)`);
  console.log(`Pest model: ${pestOutput.disease} (${(pestOutput.confidence * 100).toFixed(1)}%)`);

  // Pick the model with higher confidence
  const winner = diseaseOutput.confidence >= pestOutput.confidence
    ? { ...diseaseOutput, type: 'disease' }
    : { ...pestOutput, type: 'pest' };

  console.log(`Winner: ${winner.type} → ${winner.disease} (${(winner.confidence * 100).toFixed(1)}%)`);

  return winner;
}

export async function predictQuick(imageUri) {
  return predict(imageUri);
}

export default {
  initializeModel,
  predict,
  predictQuick,
  predictDisease,
  predictPest,
};
