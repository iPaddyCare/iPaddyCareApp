/**
 * Seed Detection Service
 * Sends image as base64 to seed detection API and returns predicted class.
 * API: POST /api/v1/seed-detection/predict
 * Payload: { image_base64: "data:image/jpeg;base64,..." }
 * Response: { class_id, confidence, predicted_class }
 */

import api from '../api/axios';

const SEED_DETECTION_ENDPOINT = '/seed-detection/predict';

/**
 * Call seed detection API with base64 image (data URI).
 * @param {string} imageBase64 - Data URI e.g. "data:image/jpeg;base64,/9j/4AAQ..."
 * @returns {Promise<{ success: boolean, data?: { class_id, confidence, predicted_class }, error?: string }>}
 */
async function predict(imageBase64) {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { success: false, data: null, error: 'Image data is required' };
  }

  try {
    const response = await api.post(SEED_DETECTION_ENDPOINT, {
      image_base64: imageBase64,
    });
    console.log('Seed detection response:', response.data);
    const data = response.data;
    const classId = data.class_id;
    const confidence = data.confidence;
    const predictedClass = data.predicted_class;

    if (predictedClass == null) {
      throw new Error('API did not return predicted_class');
    }

    return {
      success: true,
      data: {
        class_id: classId,
        confidence: confidence != null ? Number(confidence) : 0,
        predicted_class: predictedClass,
        raw: data,
      },
      error: null,
    };
  } catch (error) {
    console.error('Seed detection error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    let errorMessage = 'Failed to get seed detection result';
    if (error.response?.data) {
      const errData = error.response.data;
      if (errData.error) {
        errorMessage = errData.detail ? `${errData.error}: ${errData.detail}` : errData.error;
      } else if (errData.detail) {
        if (Array.isArray(errData.detail)) {
          errorMessage = errData.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else {
          errorMessage = errData.detail;
        }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      data: null,
      error: typeof errorMessage === 'string' ? errorMessage : 'Seed detection failed',
    };
  }
}

/**
 * Normalize API response to a predictions array (for multiple seeds in one image).
 * Handles: single { class_id, confidence, predicted_class } or multiple { predictions: [...] }.
 */
function normalizePredictions(data) {
  if (!data) return [];
  if (Array.isArray(data.predictions) && data.predictions.length > 0) {
    return data.predictions.map((p) => ({
      class_id: p.class_id,
      confidence: p.confidence != null ? Number(p.confidence) : 0,
      predicted_class: p.predicted_class ?? String(p.class_id ?? ''),
    }));
  }
  if (data.predicted_class != null || data.class_id != null) {
    return [
      {
        class_id: data.class_id,
        confidence: data.confidence != null ? Number(data.confidence) : 0,
        predicted_class: data.predicted_class ?? String(data.class_id ?? ''),
      },
    ];
  }
  return [];
}

/**
 * Live prediction: same API, but returns an array of predictions (supports multiple seeds in frame).
 * Use this for camera capture where the image may contain multiple seeds.
 *
 * @param {string} imageBase64 - Data URI e.g. "data:image/jpeg;base64,/9j/4AAQ..."
 * @returns {Promise<{ success: boolean, data?: { predictions: Array<{ class_id, confidence, predicted_class }> }, error?: string }>}
 */
async function predictLive(imageBase64) {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { success: false, data: null, error: 'Image data is required' };
  }

  try {
    const response = await api.post(SEED_DETECTION_ENDPOINT, {
      image_base64: imageBase64,
    });
    const data = response.data;
    const predictions = normalizePredictions(data);

    if (predictions.length === 0) {
      throw new Error('API did not return predicted_class or predictions');
    }

    return {
      success: true,
      data: { predictions, raw: data },
      error: null,
    };
  } catch (error) {
    console.error('Seed detection (live) error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    let errorMessage = 'Failed to get seed detection result';
    if (error.response?.data) {
      const errData = error.response.data;
      if (errData.error) {
        errorMessage = errData.detail ? `${errData.error}: ${errData.detail}` : errData.error;
      } else if (errData.detail) {
        if (Array.isArray(errData.detail)) {
          errorMessage = errData.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else {
          errorMessage = errData.detail;
        }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      data: null,
      error: typeof errorMessage === 'string' ? errorMessage : 'Seed detection failed',
    };
  }
}

export default { predict, predictLive, normalizePredictions };
