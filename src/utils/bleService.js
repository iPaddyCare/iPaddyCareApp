/**
 * BLE Service for ESP32 Bluetooth Low Energy communication
 * Handles scanning, connecting, and data exchange via BLE
 */

import { Platform, PermissionsAndroid } from 'react-native';

// ESP32 BLE Service UUIDs (standard or custom)
const ESP32_SERVICE_UUID = '0000ff00-0000-1000-8000-00805f9b34fb'; // Common ESP32 service UUID
const MOISTURE_CHARACTERISTIC_UUID = '0000ff01-0000-1000-8000-00805f9b34fb'; // Moisture data characteristic

// Alternative: Use standard BLE service if ESP32 uses it
const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';

class BLEService {
  constructor() {
    this.manager = null; // Lazy initialization
    this.scanSubscription = null;
    this.connectedDevice = null;
    this.isScanning = false;
    this.bleModuleAvailable = false;
  }

  /**
   * Lazy load BLE Manager to avoid initialization errors
   */
  async getManager() {
    if (this.manager) {
      return this.manager;
    }

    try {
      // Dynamically import to avoid errors if module isn't linked
      const { BleManager } = require('react-native-ble-plx');
      this.manager = new BleManager();
      this.bleModuleAvailable = true;
      return this.manager;
    } catch (error) {
      console.error('Failed to initialize BLE Manager:', error);
      this.bleModuleAvailable = false;
      throw new Error('Bluetooth module not available. Please rebuild the app after installing react-native-ble-plx.');
    }
  }

  /**
   * Request Bluetooth permissions (Android)
   */
  async requestPermissions() {
    if (Platform.OS !== 'android') {
      return true; // iOS handles permissions automatically
    }

    try {
      // For Android 12+ (API 31+), we need BLUETOOTH_SCAN and BLUETOOTH_CONNECT
      if (Platform.Version >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // For older Android versions
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        return (
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  /**
   * Initialize BLE manager
   */
  async initialize() {
    try {
      // Get manager (lazy load)
      const manager = await this.getManager();
      
      // Request permissions first
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Bluetooth permissions not granted. Please grant permissions in app settings.');
      }

      const state = await manager.state();
      console.log('BLE State:', state);
      
      // Handle different BLE states
      if (state === 'Unsupported') {
        throw new Error('Bluetooth Low Energy is not supported on this device. Please use a physical device or WiFi mode.');
      }
      
      if (state === 'Unauthorized') {
        throw new Error('Bluetooth permissions not granted. Please grant permissions in app settings.');
      }
      
      if (state === 'PoweredOff') {
        throw new Error('Bluetooth is turned off. Please enable Bluetooth in Settings.');
      }
      
      return state === 'PoweredOn';
    } catch (error) {
      console.error('BLE initialization error:', error);
      throw error; // Re-throw to let caller handle it
    }
  }

  /**
   * Check if Bluetooth is enabled
   */
  async isBluetoothEnabled() {
    try {
      const manager = await this.getManager();
      const state = await manager.state();
      
      // Handle unsupported state
      if (state === 'Unsupported') {
        return false;
      }
      
      return state === 'PoweredOn';
    } catch (error) {
      return false;
    }
  }

  /**
   * Enable Bluetooth (Android only)
   * Note: iOS doesn't allow programmatic Bluetooth enabling
   */
  async enableBluetooth() {
    if (Platform.OS === 'ios') {
      // iOS doesn't allow programmatic Bluetooth enabling
      // User must enable it in Settings
      const isEnabled = await this.isBluetoothEnabled();
      return isEnabled;
    }
    
    try {
      const manager = await this.getManager();
      await manager.enable();
      return true;
    } catch (error) {
      console.error('Failed to enable Bluetooth:', error);
      return false;
    }
  }

  /**
   * Scan for ESP32 BLE devices
   * @param {Function} onDeviceFound - Callback when device is found
   * @param {number} scanDuration - Scan duration in milliseconds (default: 10000)
   * @returns {Promise<Array>} Array of found devices
   */
  async scanForDevices(onDeviceFound, scanDuration = 10000) {
    if (this.isScanning) {
      console.log('Scan already in progress');
      return [];
    }

    const foundDevices = [];
    this.isScanning = true;

    try {
      // Request permissions first
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Bluetooth permissions not granted. Please grant permissions in app settings.');
      }

      // Check if Bluetooth is enabled
      const isEnabled = await this.isBluetoothEnabled();
      if (!isEnabled) {
        if (Platform.OS === 'ios') {
          throw new Error('Bluetooth is not enabled. Please enable Bluetooth in iOS Settings > Bluetooth.');
        } else {
          // Android: try to enable programmatically
          const enabled = await this.enableBluetooth();
          if (!enabled) {
            throw new Error('Bluetooth is not enabled. Please enable Bluetooth in settings.');
          }
        }
      }

      // Get manager
      const manager = await this.getManager();
      
      // Start scanning
      this.scanSubscription = manager.startDeviceScan(
        null, // Scan for all devices (or filter by service UUIDs)
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('BLE scan error:', error);
            // If it's a permission error, stop scanning and throw
            if (error.message && error.message.includes('not authorized')) {
              this.stopScan();
              throw new Error('Bluetooth permissions not granted. Please grant permissions in app settings.');
            }
            return;
          }

          if (device) {
            // Filter for ESP32 devices (check name or service UUIDs)
            const deviceName = device.name || '';
            const isESP32 = 
              deviceName.toLowerCase().includes('esp32') ||
              deviceName.toLowerCase().includes('moisture') ||
              device.serviceUUIDs?.some(uuid => uuid.toLowerCase().includes('ff00')) ||
              device.serviceUUIDs?.some(uuid => uuid.toLowerCase().includes('esp32'));

            if (isESP32) {
              // Avoid duplicates
              if (!foundDevices.find(d => d.id === device.id)) {
                const deviceInfo = {
                  id: device.id,
                  name: device.name || `ESP32-${device.id.substring(0, 8)}`,
                  rssi: device.rssi,
                  serviceUUIDs: device.serviceUUIDs,
                  type: 'ble',
                  device: device, // Keep reference to BLE device
                };
                
                foundDevices.push(deviceInfo);
                if (onDeviceFound) {
                  onDeviceFound(deviceInfo);
                }
              }
            }
          }
        }
      );

      // Stop scanning after duration
      await new Promise(resolve => setTimeout(resolve, scanDuration));
      await this.stopScan();

      return foundDevices;
    } catch (error) {
      console.error('BLE scan error:', error);
      await this.stopScan();
      throw error;
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Stop scanning for devices
   */
  async stopScan() {
    try {
      if (this.manager) {
        // Stop the device scan (this also removes the subscription)
        this.manager.stopDeviceScan();
      }
      
      // Clean up subscription if it exists
      if (this.scanSubscription) {
        // Subscription might not have remove() method, so we just null it
        this.scanSubscription = null;
      }
    } catch (error) {
      console.error('Error stopping scan:', error);
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Connect to a BLE device
   * @param {string} deviceId - BLE device ID
   * @returns {Promise<Object>} Connected device
   */
  async connectToDevice(deviceId) {
    try {
      const manager = await this.getManager();
      const device = await manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevice = {
        id: deviceId,
        device: device,
        type: 'ble',
      };

      return {
        success: true,
        device: this.connectedDevice,
      };
    } catch (error) {
      console.error('BLE connection error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to device',
      };
    }
  }

  /**
   * Disconnect from current device
   */
  async disconnect() {
    if (this.connectedDevice?.device) {
      try {
        await this.connectedDevice.device.cancelConnection();
      } catch (error) {
        console.error('BLE disconnect error:', error);
      }
    }
    this.connectedDevice = null;
  }

  /**
   * Read moisture data from ESP32 via BLE
   * @returns {Promise<Object>} Moisture data
   */
  async readMoistureData() {
    if (!this.connectedDevice?.device) {
      return {
        success: false,
        error: 'No device connected',
      };
    }

    try {
      const device = this.connectedDevice.device;
      
      // Try to find the moisture characteristic
      // First, discover services if not already done
      const services = await device.services();
      
      let moistureCharacteristic = null;
      
      // Look for moisture characteristic in services
      for (const service of services) {
        const characteristics = await service.characteristics();
        moistureCharacteristic = characteristics.find(
          char => 
            char.uuid.toLowerCase().includes('ff01') ||
            char.uuid.toLowerCase().includes('moisture') ||
            char.uuid.toLowerCase().includes('data')
        );
        
        if (moistureCharacteristic) break;
      }

      if (!moistureCharacteristic) {
        // Try reading from first available characteristic
        for (const service of services) {
          const characteristics = await service.characteristics();
          if (characteristics.length > 0) {
            moistureCharacteristic = characteristics[0];
            break;
          }
        }
      }

      if (!moistureCharacteristic) {
        throw new Error('No readable characteristic found');
      }

      // Read data from characteristic
      const data = await moistureCharacteristic.read();
      const base64Data = data.value;
      
      // Decode base64 data
      // ESP32 typically sends JSON as string, then encoded to base64
      const decodedData = this.decodeBLEData(base64Data);
      
      return {
        success: true,
        data: {
          // Main moisture value (capacitive sensor)
          moisture: decodedData.cap_sensor_value || decodedData.moisture || decodedData.moistureLevel || decodedData.value || 0,
          // Sample temperature (DS18B20)
          sampleTemperature: decodedData.sample_temperature || decodedData.sampleTemperature || null,
          // Ambient temperature (DHT22)
          ambientTemperature: decodedData.ambient_temperature || decodedData.ambientTemperature || decodedData.temperature || decodedData.temp || null,
          // Ambient humidity (DHT22)
          ambientHumidity: decodedData.ambient_humidity || decodedData.ambientHumidity || decodedData.humidity || decodedData.hum || null,
          // Sample weight (Load cell + HX711)
          sampleWeight: decodedData.sample_weight || decodedData.sampleWeight || null,
          // Legacy fields for backward compatibility
          temperature: decodedData.ambient_temperature || decodedData.ambientTemperature || decodedData.temperature || decodedData.temp || null,
          humidity: decodedData.ambient_humidity || decodedData.ambientHumidity || decodedData.humidity || decodedData.hum || null,
          timestamp: decodedData.timestamp || new Date().toISOString(),
          raw: decodedData,
        },
      };
    } catch (error) {
      console.error('BLE read error:', error);
      return {
        success: false,
        error: error.message || 'Failed to read data from device',
      };
    }
  }

  /**
   * Decode BLE data (base64 to JSON)
   */
  decodeBLEData(base64Data) {
    try {
      // React Native compatible base64 decoding
      // The BLE library returns base64, we need to decode it
      // For React Native, we can use a simple approach
      
      // Try parsing the base64 directly as it might already be a JSON string
      // Some ESP32 implementations send JSON directly
      try {
        // First, try to decode if it's base64
        let decoded;
        if (typeof atob !== 'undefined') {
          decoded = atob(base64Data);
        } else {
          // React Native fallback - base64 might already be decoded
          decoded = base64Data;
        }
        
        // Try parsing as JSON
        const parsed = JSON.parse(decoded);
        return parsed;
      } catch (parseError) {
        // If not JSON, try to extract numeric values from the string
        const text = typeof atob !== 'undefined' ? atob(base64Data) : base64Data;
        const numbers = text.match(/\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
          return {
            moisture: parseFloat(numbers[0]) || 0,
            temperature: numbers[1] ? parseFloat(numbers[1]) : null,
            humidity: numbers[2] ? parseFloat(numbers[2]) : null,
            timestamp: new Date().toISOString(),
          };
        }
        
        // If base64Data is already a number string, try parsing directly
        const directNumber = parseFloat(base64Data);
        if (!isNaN(directNumber)) {
          return {
            moisture: directNumber,
            temperature: null,
            humidity: null,
            timestamp: new Date().toISOString(),
          };
        }
      }
    } catch (error) {
      console.error('Failed to decode BLE data:', error);
    }
    
    // Return default structure
    return {
      moisture: 0,
      temperature: null,
      humidity: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get connected device info
   */
  getConnectedDevice() {
    return this.connectedDevice;
  }

  /**
   * Cleanup
   */
  async destroy() {
    await this.stopScan();
    if (this.connectedDevice) {
      await this.disconnect();
    }
    if (this.manager) {
      this.manager.destroy();
      this.manager = null;
    }
  }
}

// Export singleton instance
export default new BLEService();

