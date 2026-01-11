/**
 * Bluetooth Permission Service
 * Handles requesting Bluetooth permissions at runtime (required for Android 12+)
 */

import { Platform, PermissionsAndroid } from 'react-native';

class BluetoothPermissionService {
  /**
   * Request Bluetooth permissions
   * @returns {Promise<boolean>} True if all permissions granted
   */
  async requestPermissions() {
    if (Platform.OS !== 'android') {
      // iOS handles Bluetooth permissions automatically
      return true;
    }

    try {
      // Check Android version
      const androidVersion = Platform.Version;
      
      if (androidVersion >= 31) {
        // Android 12+ (API 31+) requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT
        // Note: These constants might not be available in older React Native versions
        // We'll use string literals as fallback
        const BLUETOOTH_SCAN = PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN || 'android.permission.BLUETOOTH_SCAN';
        const BLUETOOTH_CONNECT = PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT || 'android.permission.BLUETOOTH_CONNECT';
        
        const permissions = [BLUETOOTH_SCAN, BLUETOOTH_CONNECT];

        const results = await PermissionsAndroid.requestMultiple(permissions, {
          title: 'Bluetooth Permission',
          message: 'iPaddyCare needs Bluetooth permission to connect to ESP32 sensors.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });

        const scanGranted = results[BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED;
        const connectGranted = results[BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED;

        return scanGranted && connectGranted;
      } else {
        // Android 11 and below - need location permission for BLE scanning
        const locationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'iPaddyCare needs location permission to scan for Bluetooth devices.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        return locationGranted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Bluetooth permission error:', err);
      return false;
    }
  }

  /**
   * Check if Bluetooth permissions are granted
   * @returns {Promise<boolean>} True if permissions granted
   */
  async checkPermissions() {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const androidVersion = Platform.Version;
      
      if (androidVersion >= 31) {
        const BLUETOOTH_SCAN = PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN || 'android.permission.BLUETOOTH_SCAN';
        const BLUETOOTH_CONNECT = PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT || 'android.permission.BLUETOOTH_CONNECT';
        
        const scanGranted = await PermissionsAndroid.check(BLUETOOTH_SCAN);
        const connectGranted = await PermissionsAndroid.check(BLUETOOTH_CONNECT);
        return scanGranted && connectGranted;
      } else {
        const locationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return locationGranted;
      }
    } catch (err) {
      console.warn('Bluetooth permission check error:', err);
      return false;
    }
  }
}

export default new BluetoothPermissionService();

