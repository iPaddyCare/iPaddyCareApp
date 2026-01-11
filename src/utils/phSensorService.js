/**
 * pH Sensor Service
 * Handles BLE communication with ESP32 pH sensor device
 * 
 * ESP32 BLE Configuration:
 * - Service UUID: 0000ff00-0000-1000-8000-00805f9b34fb
 * - Characteristic UUID: 0000ff01-0000-1000-8000-00805f9b34fb
 * - Device Name: ESP32-Soil-Sensor
 * 
 * Expected JSON response format:
 * {
 *   "pH": 6.5,
 *   "soil_moisture_pct": 45.0,
 *   "EC_dS_m": 1.5,
 *   "soil_temp_C": 28.0,
 *   "water_depth_cm": 5.0
 * }
 */

import { BleManager } from 'react-native-ble-plx';
import BluetoothPermissionService from './bluetoothPermissionService';

const SERVICE_UUID = '0000ff00-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '0000ff01-0000-1000-8000-00805f9b34fb';
const DEVICE_NAME = 'ESP32-Soil-Sensor';

class PHSensorService {
  constructor() {
    this.manager = null; // Lazy initialization
    this.connectedDevice = null;
    this.device = null;
    this.characteristic = null;
    this.isConnected = false;
    this.readingInterval = null;
    this.notificationSubscription = null;
  }

  /**
   * Get or create BleManager instance (lazy initialization)
   * @returns {BleManager} BleManager instance
   * @throws {Error} If BleManager cannot be created
   */
  getManager() {
    if (!this.manager) {
      try {
        // Check if BleManager is available
        if (!BleManager || typeof BleManager !== 'function') {
          throw new Error('BleManager is not available. Please rebuild the app after installing react-native-ble-plx.');
        }
        this.manager = new BleManager();
        
        // Verify the manager was created successfully
        if (!this.manager) {
          throw new Error('Failed to create BleManager instance. Please rebuild the app.');
        }
      } catch (error) {
        console.error('Error creating BleManager:', error);
        throw new Error(
          'Bluetooth module not available. Please:\n' +
          '1. Rebuild the app: npx react-native run-android\n' +
          '2. Make sure Bluetooth permissions are granted\n' +
          '3. Restart the app'
        );
      }
    }
    return this.manager;
  }

  /**
   * Get connected device info
   * @returns {Object|null} Connected device information
   */
  getConnectedDevice() {
    return this.connectedDevice;
  }

  /**
   * Internal method to establish BLE connection
   * @param {Object} device - BLE device to connect to
   * @returns {Promise<Object>} Connection result
   */
  async _establishConnection(device) {
    const connectedDevice = await device.connect();
    await connectedDevice.discoverAllServicesAndCharacteristics();

    // Get service and characteristic
    const services = await connectedDevice.services();
    const service = services.find(s => s.uuid.toLowerCase() === SERVICE_UUID.toLowerCase());
    
    if (!service) {
      await connectedDevice.cancelConnection();
      return {
        success: false,
        error: 'Service not found on device',
      };
    }

    const characteristics = await service.characteristics();
    const characteristic = characteristics.find(
      c => c.uuid.toLowerCase() === CHARACTERISTIC_UUID.toLowerCase()
    );

    if (!characteristic) {
      await connectedDevice.cancelConnection();
      return {
        success: false,
        error: 'Characteristic not found on device',
      };
    }

    // Enable notifications
    this.notificationSubscription = characteristic.monitor((error, char) => {
      if (error) {
        console.error('Notification error:', error);
        return;
      }
      if (char && char.value) {
        try {
          // Decode base64 to string
          const base64Value = char.value;
          // Decode base64 - try atob first, fallback to manual decoding
          let jsonString;
          try {
            jsonString = atob(base64Value);
          } catch (e) {
            // Fallback: try parsing as direct JSON if atob fails
            jsonString = base64Value;
          }
          const data = JSON.parse(jsonString);
          // Store latest data
          this.latestData = data;
        } catch (e) {
          console.error('Error parsing BLE data:', e);
        }
      }
    });

    this.device = connectedDevice;
    this.characteristic = characteristic;
    this.connectedDevice = {
      id: connectedDevice.id,
      name: connectedDevice.name || DEVICE_NAME,
      type: 'pH',
      status: 'connected',
    };
    this.isConnected = true;

    return {
      success: true,
      device: this.connectedDevice,
    };
  }

  /**
   * Connect to pH sensor via BLE
   * @param {string} deviceId - BLE device ID (optional, will scan if not provided)
   * @returns {Promise<Object>} Connection result
   */
  async connect(deviceId = null) {
    try {
      // Request Bluetooth permissions first
      const hasPermission = await BluetoothPermissionService.checkPermissions();
      if (!hasPermission) {
        const permissionGranted = await BluetoothPermissionService.requestPermissions();
        if (!permissionGranted) {
          return {
            success: false,
            error: 'Bluetooth permissions are required to connect to sensors. Please grant permissions in app settings.',
          };
        }
      }

      // Initialize BLE manager (lazy initialization) with error handling
      let manager;
      try {
        manager = this.getManager();
      } catch (managerError) {
        console.error('Failed to get BleManager:', managerError);
        return {
          success: false,
          error: 'Bluetooth module not available. Please rebuild the app:\n1. Stop Metro bundler\n2. Run: cd android && ./gradlew clean\n3. Run: npx react-native run-android',
        };
      }

      // Check if manager is valid
      if (!manager || typeof manager.state !== 'function') {
        return {
          success: false,
          error: 'BleManager is not properly initialized. Please rebuild the app.',
        };
      }

      const state = await manager.state();
      if (state !== 'PoweredOn') {
        return {
          success: false,
          error: 'Bluetooth is not enabled. Please enable Bluetooth and try again.',
        };
      }

      if (deviceId) {
        // Connect to specific device
        const device = await manager.findDevice(deviceId);
        if (!device) {
          return {
            success: false,
            error: 'Device not found',
          };
        }
        return await this._establishConnection(device);
      } else {
        // Scan for ESP32-Soil-Sensor
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            manager.stopDeviceScan();
            resolve({
              success: false,
              error: 'ESP32-Soil-Sensor not found. Make sure the device is powered on and Bluetooth is enabled.',
            });
          }, 10000); // 10 second timeout

          manager.startDeviceScan(
            [SERVICE_UUID],
            null,
            async (error, device) => {
              if (error) {
                console.error('BLE scan error:', error);
                clearTimeout(timeout);
                manager.stopDeviceScan();
                resolve({
                  success: false,
                  error: error.message || 'BLE scan error',
                });
                return;
              }
              if (device && (device.name === DEVICE_NAME || device.name?.includes('ESP32'))) {
                clearTimeout(timeout);
                manager.stopDeviceScan();
                
                try {
                  const result = await this._establishConnection(device);
                  resolve(result);
                } catch (connError) {
                  console.error('BLE connection error:', connError);
                  resolve({
                    success: false,
                    error: connError.message || 'Failed to connect to sensor',
                  });
                }
              }
            }
          );
        });
      }
    } catch (error) {
      console.error('BLE connection error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to sensor',
      };
    }
  }

  /**
   * Disconnect from sensor
   */
  disconnect() {
    this.stopReading();
    
    if (this.notificationSubscription) {
      this.notificationSubscription.remove();
      this.notificationSubscription = null;
    }

    if (this.device) {
      this.device.cancelConnection();
      this.device = null;
    }

    this.characteristic = null;
    this.connectedDevice = null;
    this.isConnected = false;
    this.latestData = null;
  }

  /**
   * Read sensor values from BLE
   * @returns {Promise<Object>} Sensor data
   */
  async readSensorValues() {
    if (!this.isConnected || !this.characteristic) {
      return {
        success: false,
        error: 'Sensor not connected',
        data: null,
      };
    }

    try {
      // Read current value from characteristic
      const characteristic = await this.characteristic.read();
      const base64Value = characteristic.value;
      // Decode base64 - try atob first, fallback to direct parsing
      let jsonString;
      try {
        jsonString = atob(base64Value);
      } catch (e) {
        // Fallback: try parsing as direct JSON if atob fails
        jsonString = base64Value;
      }
      const data = JSON.parse(jsonString);

      return {
        success: true,
        data: {
          pH: parseFloat(data.pH) || 0,
          soil_moisture_pct: parseFloat(data.soil_moisture_pct) || 0,
          EC_dS_m: parseFloat(data.EC_dS_m) || 0,
          soil_temp_C: parseFloat(data.soil_temp_C) || 0,
          water_depth_cm: parseFloat(data.water_depth_cm) || 0,
          timestamp: new Date().toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error('BLE read error:', error);
      
      // Fallback to latest notification data if available
      if (this.latestData) {
        return {
          success: true,
          data: {
            pH: parseFloat(this.latestData.pH) || 0,
            soil_moisture_pct: parseFloat(this.latestData.soil_moisture_pct) || 0,
            EC_dS_m: parseFloat(this.latestData.EC_dS_m) || 0,
            soil_temp_C: parseFloat(this.latestData.soil_temp_C) || 0,
            water_depth_cm: parseFloat(this.latestData.water_depth_cm) || 0,
            timestamp: new Date().toISOString(),
          },
          error: null,
        };
      }

      return {
        success: false,
        error: error.message || 'Failed to read sensor values',
        data: null,
      };
    }
  }

  /**
   * Start continuous reading from sensor
   * @param {Function} callback - Callback function to receive data
   * @param {number} interval - Reading interval in milliseconds
   */
  startReading(callback, interval = 5000) {
    this.stopReading();

    // Read immediately
    this.readSensorValues().then(callback);

    // Then read at intervals
    this.readingInterval = setInterval(() => {
      this.readSensorValues().then(callback);
    }, interval);
  }

  /**
   * Stop continuous reading
   */
  stopReading() {
    if (this.readingInterval) {
      clearInterval(this.readingInterval);
      this.readingInterval = null;
    }
  }

  /**
   * Get connection status
   * @returns {boolean} Connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Scan for BLE devices
   * @param {Function} onDeviceFound - Callback when device is found
   * @param {Function} onProgress - Callback for scan progress
   * @returns {Promise<Array>} Array of found devices
   */
  async scanForDevices(onDeviceFound, onProgress) {
    const foundDevices = [];
    
    try {
      // Request Bluetooth permissions first
      const hasPermission = await BluetoothPermissionService.checkPermissions();
      if (!hasPermission) {
        const permissionGranted = await BluetoothPermissionService.requestPermissions();
        if (!permissionGranted) {
          throw new Error('Bluetooth permissions are required to scan for devices. Please grant permissions in app settings.');
        }
      }

      // Get manager with error handling
      let manager;
      try {
        manager = this.getManager();
      } catch (managerError) {
        console.error('Failed to get BleManager:', managerError);
        throw new Error(
          'Bluetooth module not available. Please rebuild the app:\n' +
          '1. Stop Metro bundler\n' +
          '2. Run: cd android && ./gradlew clean\n' +
          '3. Run: npx react-native run-android'
        );
      }

      // Check if manager is valid
      if (!manager || typeof manager.state !== 'function') {
        throw new Error('BleManager is not properly initialized. Please rebuild the app.');
      }

      const state = await manager.state();
      if (state !== 'PoweredOn') {
        throw new Error('Bluetooth is not enabled');
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          manager.stopDeviceScan();
          resolve(foundDevices);
        }, 10000); // 10 second timeout

        manager.startDeviceScan(
          [SERVICE_UUID],
          null,
          (error, device) => {
            if (error) {
              clearTimeout(timeout);
              manager.stopDeviceScan();
              reject(error);
              return;
            }

            if (device && (device.name === DEVICE_NAME || device.name?.includes('ESP32'))) {
              const deviceInfo = {
                id: device.id,
                name: device.name || DEVICE_NAME,
                type: 'BLE',
                rssi: device.rssi,
                isConnectable: device.isConnectable,
              };

              // Avoid duplicates
              if (!foundDevices.find(d => d.id === device.id)) {
                foundDevices.push(deviceInfo);
                if (onDeviceFound) {
                  onDeviceFound(deviceInfo);
                }
              }
            }
          }
        );
      });
    } catch (error) {
      console.error('BLE scan error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new PHSensorService();
