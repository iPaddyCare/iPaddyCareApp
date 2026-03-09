/**
 * TripoSG Service — Image-to-3D model generation via Hugging Face Spaces
 * Uses the VAST-AI/TripoSG Gradio API (free, open-source)
 */
import RNFS from 'react-native-fs';

const SPACE_URL = 'https://vast-ai-triposg.hf.space';
const API_PREFIX = '/gradio_api';
const TIMEOUT = 180000; // 3 min timeout for 3D generation

/**
 * Upload a file to the Gradio space and get the file handle
 */
async function uploadFile(imageUri) {
  let filePath = imageUri;
  if (filePath.startsWith('file://')) filePath = filePath.replace('file://', '');

  const fileName = filePath.split('/').pop() || 'image.jpg';

  // React Native FormData uses {uri, type, name} objects, not Blob
  const formData = new FormData();
  formData.append('files', {
    uri: filePath.startsWith('/') ? `file://${filePath}` : filePath,
    type: 'image/jpeg',
    name: fileName,
  });

  const response = await fetch(`${SPACE_URL}${API_PREFIX}/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${errText}`);
  }

  const files = await response.json();
  return files[0];
}

/**
 * Call a Gradio API endpoint using the call/{fn}/stream pattern (Gradio 5.x)
 */
async function gradioCall(fnName, data) {
  // Step 1: Submit the call
  const submitResp = await fetch(`${SPACE_URL}${API_PREFIX}/call/${fnName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });

  if (!submitResp.ok) {
    const errText = await submitResp.text();
    throw new Error(`API ${fnName} submit failed (${submitResp.status}): ${errText}`);
  }

  const submitResult = await submitResp.json();
  const eventId = submitResult.event_id;

  if (!eventId) {
    throw new Error(`No event_id returned from ${fnName}`);
  }

  // Step 2: Poll the SSE stream for the result
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`${fnName} timed out after ${TIMEOUT / 1000}s`));
    }, TIMEOUT);

    const pollStream = async () => {
      try {
        const resp = await fetch(
          `${SPACE_URL}${API_PREFIX}/call/${fnName}/${eventId}`,
        );
        const text = await resp.text();

        // Parse SSE events
        const events = text.split('\n').filter(e => e.trim());
        for (let i = 0; i < events.length; i++) {
          const line = events[i];
          if (line.startsWith('event: ')) {
            const eventType = line.replace('event: ', '').trim();
            const dataLine = events[i + 1];
            if (!dataLine || !dataLine.startsWith('data: ')) continue;

            const eventData = JSON.parse(dataLine.replace('data: ', ''));

            if (eventType === 'complete') {
              clearTimeout(timeout);
              resolve(eventData);
              return;
            }

            if (eventType === 'error') {
              clearTimeout(timeout);
              reject(new Error(typeof eventData === 'string' ? eventData : JSON.stringify(eventData)));
              return;
            }
          }
        }

        // If no complete/error event found, keep polling
        setTimeout(pollStream, 3000);
      } catch (e) {
        clearTimeout(timeout);
        reject(e);
      }
    };

    pollStream();
  });
}

/**
 * Generate a 3D model from an image
 * @param {string} imageUri - Local image URI
 * @param {function} onProgress - Progress callback
 * @returns {Promise<string>} Local path to the GLB model file
 */
export async function generateModel(imageUri, onProgress) {
  try {
    // Step 1: Upload image
    onProgress?.('uploading');
    const fileHandle = await uploadFile(imageUri);
    const imageData = {
      path: fileHandle,
      url: `${SPACE_URL}${API_PREFIX}/file=${fileHandle}`,
      meta: { _type: 'gradio.FileData' },
    };

    // Step 2: Remove background
    onProgress?.('segmenting');
    const segResult = await gradioCall('run_segmentation', [imageData]);
    const segmentedImage = segResult?.[0];

    if (!segmentedImage) {
      throw new Error('Background removal failed');
    }

    // Step 3: Generate 3D model
    // Inputs per config: [segmented_image, seed, steps, cfg_scale, simplify_mesh, target_faces]
    onProgress?.('generating');
    const seed = 42;
    const inferenceSteps = 25;
    const cfgScale = 5.0;
    const simplifyMesh = false;
    const targetFaces = 50000;

    const modelResult = await gradioCall('image_to_3d', [
      segmentedImage, seed, inferenceSteps, cfgScale, simplifyMesh, targetFaces,
    ]);

    const modelFile = modelResult?.[0];
    if (!modelFile) {
      throw new Error('3D model generation failed');
    }

    // Get the model URL
    const modelUrl = modelFile.url || `${SPACE_URL}${API_PREFIX}/file=${modelFile.path || modelFile}`;

    // Step 4: Download GLB to local storage
    onProgress?.('downloading');
    const localPath = `${RNFS.CachesDirectoryPath}/model_${Date.now()}.glb`;
    await RNFS.downloadFile({
      fromUrl: modelUrl,
      toFile: localPath,
    }).promise;

    return localPath;
  } catch (error) {
    console.error('TripoSG generation error:', error);
    throw error;
  }
}

export default { generateModel };
