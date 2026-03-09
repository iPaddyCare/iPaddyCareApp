/**
 * Prediction Service
 * Sends moisture reading data to seed-moisture prediction API
 * Returns predicted moisture percentage
 */

import api from '../api/axios';

class PredictionService {
  /**
   * Send moisture reading to prediction model
   * @param {Object} readingData - Moisture reading data
   * @param {number} readingData.averageMoisture - Average moisture percentage
   * @param {number} readingData.averageCapSensor - Capacitive sensor value
   * @param {number} readingData.averageSampleTemp - Sample temperature (°C)
   * @param {number} readingData.averageAmbientTemp - Ambient temperature (°C)
   * @param {number} readingData.averageAmbientHumidity - Ambient humidity (%)
   * @param {number} readingData.averageSampleWeight - Sample weight (g)
   * @param {number} readingData.temperature - Temperature (alias)
   * @param {number} readingData.humidity - Humidity (alias)
   * @returns {Promise<Object>} Prediction results with predicted_moisture
   */
  async getPrediction(readingData) {
    try {
      // Validate all required values - return error without sending request if any is null/missing
      const ambientHumidity = readingData.averageAmbientHumidity ?? readingData.humidity;
      const ambientTemperature = readingData.averageAmbientTemp ?? readingData.temperature;
      const capSensorValue = readingData.averageCapSensor ?? readingData.averageMoisture;
      const sampleTemperature = readingData.averageSampleTemp ?? readingData.temperature;
      const sampleWeight = readingData.averageSampleWeight;

      const missing = [];
      if (ambientHumidity == null) missing.push('ambient_humidity');
      if (ambientTemperature == null) missing.push('ambient_temperature');
      if (capSensorValue == null) missing.push('cap_sensor_value');
      if (sampleTemperature == null) missing.push('sample_temperature');
      if (sampleWeight == null || sampleWeight <= 0) missing.push('sample_weight');

      if (missing.length > 0) {
        return {
          success: false,
          data: this.getMockPrediction(readingData),
          error: `Missing required data: ${missing.join(', ')}. All sensor values must be available.`,
          isMock: true,
        };
      }

      // Calculate bulk density (g/cm³) from sample weight and volume
      const sampleVolume = 50; // cm³ (calibrate based on actual device)
      const bulkDensity = sampleWeight / sampleVolume;

      const requestBody = {
        ambient_humidity: parseFloat(Number(ambientHumidity).toFixed(2)),
        ambient_temperature: parseFloat(Number(ambientTemperature).toFixed(2)),
        // bulk_density: parseFloat(bulkDensity.toFixed(2)),
        bulk_density: 0.75,

        cap_sensor_value: parseFloat(Number(capSensorValue).toFixed(2)),
        sample_temperature: parseFloat(Number(sampleTemperature).toFixed(2)),
        sample_weight: parseFloat(Number(sampleWeight).toFixed(2)),
      };
      console.log('Request Body:', requestBody);
      const endpoint = '/seed-moisture/predict';

      const response = await api.post(endpoint, requestBody);
      console.log('Response:', response);
      const data = response.data;
      const predictedMoisture = data.predicted_moisture ?? null;

      if (predictedMoisture == null) {
        throw new Error('API did not return predicted_moisture');
      }

      return {
        success: true,
        data: {
          predicted_moisture: predictedMoisture,
          moisture: predictedMoisture, // Backward compatibility for ReadingResultsScreen
          raw: data,
        },
        error: null,
      };
    } catch (error) {
      console.error('Prediction error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Extract error message from API response
      let errorMessage = 'Failed to get prediction';
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

      // Return mock data for development/testing when API fails
      return {
        success: false,
        data: this.getMockPrediction(readingData),
        error: errorMessage,
        isMock: true,
      };
    }
  }

  /**
   * Generate mock prediction data for development
   * Format: { hours: 2, time: "11:00", status: "dry", predictedMoisture: 14.03 }
   * @param {Object} readingData 
   * @returns {Object} Mock prediction data
   */
  getMockPrediction(readingData) {
    const baseMoisture = readingData.averageMoisture || 15;
    
    // Calculate predicted moisture (simulate prediction model)
    // In real implementation, this would come from the ML model
    const predictedMoisture = baseMoisture * 0.935; // Example: slight reduction
    
    // Generate predictions in format: "Dry X hours from Y time"
    // If moisture > 14, needs to dry
    // If moisture < 12, over dried (no dry time needed)
    // If 12-14, good (no action needed)
    
    let todayPrediction = null;
    let tomorrowPrediction = null;
    
    // Use predicted moisture for schedule calculation
    const moistureForSchedule = predictedMoisture;
    
    if (moistureForSchedule > 14) {
      // Needs to dry - calculate hours needed
      const hoursNeeded = Math.ceil((moistureForSchedule - 14) / 2); // Rough calculation
      // Get current time and add 1 hour for start time
      const now = new Date();
      const startHour = now.getHours() + 1;
      const startTime = `${startHour.toString().padStart(2, '0')}:00`;
      
      todayPrediction = {
        hours: hoursNeeded,
        time: startTime,
        status: "dry",
      };
      tomorrowPrediction = {
        hours: Math.max(1, hoursNeeded - 1),
        time: "09:00",
        status: "dry",
      };
    } else if (moistureForSchedule < 12) {
      // Over dried - no dry time needed
      todayPrediction = {
        hours: 0,
        time: null,
        status: "over_dried",
      };
      tomorrowPrediction = {
        hours: 0,
        time: null,
        status: "over_dried",
      };
    } else {
      // Good moisture level
      todayPrediction = {
        hours: 0,
        time: null,
        status: "good",
      };
      tomorrowPrediction = {
        hours: 0,
        time: null,
        status: "good",
      };
    }

    return {
      today: todayPrediction,
      tomorrow: tomorrowPrediction,
      moisture: predictedMoisture,
    };
  }
}

export default new PredictionService();

