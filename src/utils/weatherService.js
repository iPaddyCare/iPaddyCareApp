/**
 * Weather Service
 * Fetches current weather data based on device location
 * Uses OpenWeatherMap API (free tier available)
 */

const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your API key
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

class WeatherService {
  /**
   * Get current location coordinates
   * @returns {Promise<{latitude: number, longitude: number}>}
   */
  async getCurrentLocation() {
    try {
      // Try using @react-native-community/geolocation first
      try {
        const Geolocation = require('@react-native-community/geolocation').default;
        
        return new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              console.error('Location error:', error);
              reject(new Error('Failed to get location: ' + error.message));
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
            }
          );
        });
      } catch (e) {
        // Fallback to navigator.geolocation if available
        if (navigator && navigator.geolocation) {
          return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              (error) => {
                console.error('Location error:', error);
                reject(new Error('Failed to get location: ' + error.message));
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
              }
            );
          });
        }
        throw new Error('Geolocation not available');
      }
    } catch (error) {
      throw new Error('Geolocation not available. Please install @react-native-community/geolocation or enable location services.');
    }
  }

  /**
   * Fetch weather data for current location (or Malabe for demo)
   * Returns mock data for demo purposes (no API call)
   * @param {boolean} useDemoLocation - Use Malabe, Sri Lanka for demo
   * @returns {Promise<Object>} Weather data
   */
  async getCurrentWeather(useDemoLocation = true) {
    // Return mock weather data for demo (no API integration needed)
    return {
      success: true,
      data: {
        temperature: 28.5, // Typical temperature in Malabe, Sri Lanka
        humidity: 75,
        pressure: 1013,
        description: 'Partly cloudy',
        icon: '02d',
        windSpeed: 5.2,
        windDirection: 180,
        location: {
          city: 'Malabe',
          country: 'LK',
          coordinates: {
            latitude: 6.9271,
            longitude: 79.9612,
          },
        },
      },
      error: null,
    };
  }

  /**
   * Fetch weather data by coordinates
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Promise<Object>} Weather data
   */
  async getWeatherByCoordinates(latitude, longitude) {
    try {
      const url = `${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          temperature: data.main.temp,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          windSpeed: data.wind?.speed || 0,
          windDirection: data.wind?.deg || 0,
          location: {
            city: 'Malabe', // Hardcoded for demo
            country: data.sys.country,
            coordinates: {
              latitude,
              longitude,
            },
          },
        },
        error: null,
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to fetch weather data',
      };
    }
  }
}

export default new WeatherService();

