/**
 * Location Service
 * Handles getting current location (latitude and longitude)
 */

import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

class LocationService {
  /**
   * Request location permissions
   * @returns {Promise<boolean>} True if permission granted
   */
  async requestPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'iPaddyCare needs access to your location to provide accurate predictions.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Location permission error:', err);
        return false;
      }
    }
    // iOS permissions are handled via Info.plist
    return true;
  }

  /**
   * Get current location
   * @returns {Promise<Object>} Location data with lat and lon
   */
  async getCurrentLocation() {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return {
        success: false,
        error: 'Location permission denied',
        data: null,
      };
    }

    return new Promise((resolve) => {
      // Reduced timeout for faster response on emulators
      const timeoutId = setTimeout(() => {
        console.warn('Location timeout - using default coordinates (emulator or GPS unavailable)');
        resolve({
          success: true,
          data: {
            lat: 7.5,
            lon: 80.5,
          },
          error: 'Location timeout - using default coordinates. Please use map picker to select location.',
        });
      }, 10000); // 10 second timeout

      Geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          const { latitude, longitude } = position.coords;
          
          console.log('Location fetched:', { latitude, longitude });
          
          // Validate Sri Lanka coordinates
          if (latitude >= 5.0 && latitude <= 10.0 && longitude >= 79.0 && longitude <= 82.0) {
            resolve({
              success: true,
              data: {
                lat: latitude,
                lon: longitude,
              },
              error: null,
            });
          } else {
            // If outside Sri Lanka, use default Sri Lanka coordinates (Colombo area)
            resolve({
              success: true,
              data: {
                lat: 7.5,
                lon: 80.5,
              },
              error: 'Location outside Sri Lanka, using default coordinates',
            });
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error('Location error:', error);
          
          let errorMessage = 'Failed to get location';
          if (error.code === 1) {
            errorMessage = 'Location permission denied';
          } else if (error.code === 2) {
            errorMessage = 'Location unavailable (check GPS/emulator settings)';
          } else if (error.code === 3) {
            errorMessage = 'Location request timeout';
          } else {
            errorMessage = error.message || 'Failed to get location';
          }
          
          // Return default Sri Lanka coordinates on error
          resolve({
            success: true,
            data: {
              lat: 7.5,
              lon: 80.5,
            },
            error: errorMessage + ' - Using default coordinates',
          });
        },
        {
          enableHighAccuracy: false, // Set to false for faster response on emulators
          timeout: 10000, // 10 seconds timeout
          maximumAge: 60000, // Accept cached location up to 1 minute old
        }
      );
    });
  }
}

// Export singleton instance
export default new LocationService();

