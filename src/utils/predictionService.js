/**
 * Prediction Service
 * Sends moisture reading data to prediction model API
 * Returns predictions for today and tomorrow with time ranges
 */

// Replace with your actual prediction API endpoint
const PREDICTION_API_URL = 'https://your-prediction-api.com/predict';

class PredictionService {
  /**
   * Send moisture reading to prediction model
   * @param {Object} readingData - Moisture reading data
   * @param {number} readingData.averageMoisture - Average moisture percentage
   * @param {number} readingData.temperature - Temperature in Celsius
   * @param {number} readingData.humidity - Humidity percentage
   * @param {Object} readingData.weather - Weather data
   * @param {Array<Object>} readingData.readings - Array of individual readings
   * @returns {Promise<Object>} Prediction results
   */
  async getPrediction(readingData) {
    try {
      const requestBody = {
        moisture: readingData.averageMoisture,
        temperature: readingData.temperature || null,
        humidity: readingData.humidity || null,
        weather: readingData.weather || null,
        readings: readingData.readings || [],
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(PREDICTION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Prediction API error: ${response.status}`);
      }

      const data = await response.json();

      // Expected response format:
      // {
      //   "today": [
      //     { "time": "09:00", "status": "dry", "moisture": 45.2 },
      //     { "time": "14:00", "status": "dry", "moisture": 44.8 },
      //     { "time": "19:00", "status": "dry", "moisture": 44.5 },
      //   ],
      //   "tomorrow": [
      //     { "time": "09:00", "status": "dry", "moisture": 44.0 },
      //     { "time": "14:00", "status": "dry", "moisture": 43.5 },
      //     { "time": "19:00", "status": "dry", "moisture": 43.0 },
      //   ],
      //   "averageToday": 44.8,
      //   "averageTomorrow": 43.5,
      // }

      return {
        success: true,
        data: {
          today: data.today || [],
          tomorrow: data.tomorrow || [],
          averageToday: data.averageToday || null,
          averageTomorrow: data.averageTomorrow || null,
          raw: data,
        },
        error: null,
      };
    } catch (error) {
      console.error('Prediction error:', error);
      
      // Return mock data for development/testing
      return {
        success: false,
        data: this.getMockPrediction(readingData),
        error: error.message || 'Failed to get prediction. Using mock data.',
        isMock: true,
      };
    }
  }

  /**
   * Generate mock prediction data for development
   * Format: { hours: 2, time: "11:00", status: "dry" }
   * @param {Object} readingData 
   * @returns {Object} Mock prediction data
   */
  getMockPrediction(readingData) {
    const baseMoisture = readingData.averageMoisture || 15;
    
    // Generate predictions in format: "Dry X hours from Y time"
    // If moisture > 14, needs to dry
    // If moisture < 12, over dried (no dry time needed)
    // If 12-14, good (no action needed)
    
    let todayPrediction = null;
    let tomorrowPrediction = null;
    
    if (baseMoisture > 14) {
      // Needs to dry - calculate hours needed
      const hoursNeeded = Math.ceil((baseMoisture - 14) / 2); // Rough calculation
      todayPrediction = {
        hours: hoursNeeded,
        time: "11:00",
        status: "dry",
      };
      tomorrowPrediction = {
        hours: Math.max(1, hoursNeeded - 1),
        time: "12:00",
        status: "dry",
      };
    } else if (baseMoisture < 12) {
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
      moisture: baseMoisture,
    };
  }
}

export default new PredictionService();

