/**
 * Rice Variety Prediction API Service
 * Handles API calls to predict rice variety based on soil conditions
 */

import axios from 'axios';
import api from '../api/axios';

// Create axios instance
const apiClient = axios.create({
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

class RiceVarietyApiService {
  /**
   * Predict rice variety based on soil conditions
   * @param {Object} data - Soil condition data
   * @returns {Promise<Object>} Prediction result
   */
  async predictRiceVariety(data) {
    try {
      const requestBody = {
        EC_dS_m: data.EC_dS_m,
        lat: data.lat,
        lon: data.lon,
        pH: data.pH,
        prev_crop: data.prev_crop,
        season: data.season,
        soil_moisture_pct: data.soil_moisture_pct,
        soil_temp_C: data.soil_temp_C,
        soil_zone: data.soil_zone,
        texture: data.texture,
        top_n: data.top_n || 3,
        water_depth_cm: data.water_depth_cm,
      };
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));

      // Log the full URL being called
      const endpoint = "/rice-variety/predict";
      const fullUrl = `${api.defaults.baseURL}${endpoint}`;
      console.log('Calling API:', fullUrl);
      console.log('Base URL:', api.defaults.baseURL);

      const response = await api.post(endpoint, requestBody);
      console.log('API Response:', response.data);
      return {
        success: true,
        data: response.data,
        error: null,
      };
    } catch (error) {
      console.error('Rice variety prediction error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        baseURL: api.defaults.baseURL,
      });

      // Axios error handling
      if (axios.isAxiosError(error)) {
        let errorMessage = 'Network error';
        
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          errorMessage = `Cannot connect to API server. Please check:\n1. API server is running\n2. Correct API URL: ${api.defaults.baseURL}\n3. Device/emulator can reach the server`;
        } else if (error.response) {
          errorMessage = error.response?.data?.message || 
                        `Request failed with status ${error.response?.status}` ||
                        'Server error';
        } else if (error.request) {
          errorMessage = 'No response from server. Check network connection.';
        }
        
        return {
          success: false,
          data: null,
          error: errorMessage,
        };
      }

      return {
        success: false,
        data: null,
        error: error.message || 'Failed to predict rice variety',
      };
    }
  }

  /**
   * Validate input data according to API requirements
   * @param {Object} data - Data to validate
   * @returns {Object} Validation result
   */
  validateInput(data) {
    const errors = [];

    if (data.pH === undefined || data.pH < 0 || data.pH > 14) {
      errors.push('pH must be between 0 and 14');
    }

    if (
      data.soil_moisture_pct === undefined ||
      data.soil_moisture_pct < 0 ||
      data.soil_moisture_pct > 100
    ) {
      errors.push('Soil moisture must be between 0 and 100%');
    }

    if (data.EC_dS_m === undefined || data.EC_dS_m < 0) {
      errors.push('Electrical conductivity must be >= 0');
    }

    if (
      data.soil_temp_C === undefined ||
      data.soil_temp_C < 0 ||
      data.soil_temp_C > 50
    ) {
      errors.push('Soil temperature must be between 0 and 50°C');
    }

    if (data.water_depth_cm === undefined || data.water_depth_cm < 0) {
      errors.push('Water depth must be >= 0');
    }

    if (data.lat === undefined || data.lat < 5 || data.lat > 10) {
      errors.push('Latitude must be between 5 and 10 (Sri Lanka range)');
    }

    if (data.lon === undefined || data.lon < 79 || data.lon > 82) {
      errors.push('Longitude must be between 79 and 82 (Sri Lanka range)');
    }

    const validTextures = ['loamy', 'sandy', 'clayey'];
    if (!validTextures.includes(data.texture)) {
      errors.push(`Texture must be one of: ${validTextures.join(', ')}`);
    }

    const validPrevCrops = ['rice', 'maize', 'fallow', 'legume'];
    if (!validPrevCrops.includes(data.prev_crop)) {
      errors.push(`Previous crop must be one of: ${validPrevCrops.join(', ')}`);
    }

    const validSeasons = ['Maha', 'Yala'];
    if (!validSeasons.includes(data.season)) {
      errors.push(`Season must be one of: ${validSeasons.join(', ')}`);
    }

    const validSoilZones = ['Dry', 'Intermediate', 'Wet'];
    if (!validSoilZones.includes(data.soil_zone)) {
      errors.push(`Soil zone must be one of: ${validSoilZones.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default new RiceVarietyApiService();
