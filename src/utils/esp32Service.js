/**
 * ESP32 Service
 * Handles communication with ESP32 device for moisture sensor data
 * 
 * ESP32 Setup:
 * - Connect ESP32 to WiFi
 * - Create a web server that returns JSON data
 * - Example ESP32 endpoint: http://192.168.1.100/moisture
 * 
 * Expected JSON response format:
 * {
 *   "moisture": 45.5,
 *   "temperature": 25.3,
 *   "humidity": 60.2,
 *   "timestamp": "2024-01-15T10:30:00Z"
 * }
 */

const DEFAULT_PORT = 80;
const DEFAULT_ENDPOINT = '/moisture';

class ESP32Service {
  constructor() {
    this.baseUrl = null;
    this.connectedDevice = null; // Store connected device info
    this.isConnected = false;
    this.pollingInterval = null;
    this.pollInterval = 5000; // Poll every 5 seconds
  }

  /**
   * Configure ESP32 connection details
   * @param {string} ip - ESP32 IP address
   * @param {number} port - ESP32 port (default: 80)
   * @param {string} endpoint - API endpoint (default: '/moisture')
   */
  configure(ip, port = DEFAULT_PORT, endpoint = DEFAULT_ENDPOINT) {
    if (!ip) {
      throw new Error('IP address is required');
    }
    this.baseUrl = `http://${ip}:${port}${endpoint}`;
    this.connectedDevice = { ip, port, endpoint };
    console.log('ESP32 Service configured:', this.baseUrl);
  }

  /**
   * Get connected device info
   * @returns {Object|null} Connected device information
   */
  getConnectedDevice() {
    return this.connectedDevice;
  }

  /**
   * Disconnect from current device
   */
  disconnect() {
    this.stopPolling();
    this.baseUrl = null;
    this.connectedDevice = null;
    this.isConnected = false;
  }

  /**
   * Test if a device at given IP is an ESP32 moisture sensor
   * @param {string} ip - IP address to test
   * @param {number} port - Port number (default: 80)
   * @param {string} endpoint - Endpoint to test (default: '/moisture')
   * @returns {Promise<Object>} Device info if found, null otherwise
   */
  async testDevice(ip, port = DEFAULT_PORT, endpoint = DEFAULT_ENDPOINT) {
    const testUrl = `http://${ip}:${port}${endpoint}`;
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 2000);
      });

      const response = await Promise.race([
        fetch(testUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        timeoutPromise,
      ]);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      // Check if response has moisture data
      if (data.moisture !== undefined || data.moistureLevel !== undefined || data.value !== undefined) {
        return {
          ip,
          port,
          endpoint,
          name: data.deviceName || `ESP32-${ip.split('.').pop()}`,
          moisture: data.moisture || data.moistureLevel || data.value,
          status: 'online',
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Scan network for ESP32 devices
   * Scans common IP ranges including ESP32 AP mode (192.168.4.x)
   * @param {Function} onDeviceFound - Callback when device is found
   * @param {Function} onProgress - Callback for scan progress
   * @returns {Promise<Array>} Array of found devices
   */
  async scanForDevices(onDeviceFound, onProgress) {
    const foundDevices = [];
    
    // First, quickly check the default ESP32 AP IP (192.168.4.1)
    // This is the most common IP when ESP32 is in Access Point mode
    try {
      const defaultAPDevice = await this.testDevice('192.168.4.1');
      if (defaultAPDevice) {
        foundDevices.push(defaultAPDevice);
        if (onDeviceFound) {
          onDeviceFound(defaultAPDevice);
        }
        if (onProgress) {
          onProgress(1, 1);
        }
      }
    } catch (error) {
      // Ignore error, continue with scan
    }
    
    const commonRanges = [
      { base: '192.168.4', start: 1, end: 254 }, // ESP32 AP mode range (prioritize)
      { base: '192.168.1', start: 1, end: 254 },
      { base: '192.168.0', start: 1, end: 254 },
      { base: '10.0.0', start: 1, end: 254 },
    ];

    // Limit scan to first 50 IPs per range for performance
    // But scan more IPs for 192.168.4.x (AP mode) since it's common
    const maxScanPerRange = 50;
    const maxScanAPRange = 100; // Scan more for AP mode range
    let totalScanned = foundDevices.length > 0 ? 1 : 0; // Count the default AP check
    let totalToScan = foundDevices.length > 0 ? 1 : 0;

    // Calculate total
    commonRanges.forEach((range, index) => {
      const maxScan = range.base === '192.168.4' ? maxScanAPRange : maxScanPerRange;
      totalToScan += Math.min(range.end - range.start + 1, maxScan);
    });

    for (const range of commonRanges) {
      // Skip 192.168.4.1 if we already found it
      if (range.base === '192.168.4' && foundDevices.some(d => d.ip === '192.168.4.1')) {
        continue;
      }
      
      const maxScan = range.base === '192.168.4' ? maxScanAPRange : maxScanPerRange;
      const end = Math.min(range.start + maxScan - 1, range.end);
      
      // Create array of IPs to test
      const ipPromises = [];
      for (let i = range.start; i <= end; i++) {
        const ip = `${range.base}.${i}`;
        ipPromises.push(
          this.testDevice(ip).then(device => {
            totalScanned++;
            if (onProgress) {
              onProgress(totalScanned, totalToScan);
            }
            if (device) {
              foundDevices.push(device);
              if (onDeviceFound) {
                onDeviceFound(device);
              }
            }
            return device;
          }).catch(() => {
            totalScanned++;
            if (onProgress) {
              onProgress(totalScanned, totalToScan);
            }
            return null;
          })
        );
      }

      // Test IPs in batches of 10 for better performance
      const batchSize = 10;
      for (let i = 0; i < ipPromises.length; i += batchSize) {
        await Promise.all(ipPromises.slice(i, i + batchSize));
      }
    }

    return foundDevices;
  }

  /**
   * Fetch moisture data from ESP32
   * @returns {Promise<Object>} Moisture sensor data
   */
  async fetchMoistureData() {
    if (!this.baseUrl) {
      return {
        success: false,
        data: null,
        error: 'No device configured. Please connect a device first.',
      };
    }

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });

      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(this.baseUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        timeoutPromise,
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.isConnected = true;
      
      return {
        success: true,
        data: {
          // Main moisture value (capacitive sensor)
          moisture: data.cap_sensor_value || data.moisture || data.moistureLevel || data.value || 0,
          // Sample temperature (DS18B20)
          sampleTemperature: data.sample_temperature || data.sampleTemperature || null,
          // Ambient temperature (DHT22)
          ambientTemperature: data.ambient_temperature || data.ambientTemperature || data.temperature || data.temp || null,
          // Ambient humidity (DHT22)
          ambientHumidity: data.ambient_humidity || data.ambientHumidity || data.humidity || data.hum || null,
          // Sample weight (Load cell + HX711)
          sampleWeight: data.sample_weight || data.sampleWeight || null,
          // Legacy fields for backward compatibility
          temperature: data.ambient_temperature || data.ambientTemperature || data.temperature || data.temp || null,
          humidity: data.ambient_humidity || data.ambientHumidity || data.humidity || data.hum || null,
          timestamp: data.timestamp || new Date().toISOString(),
          raw: data, // Keep raw data for debugging
        },
        error: null,
      };
    } catch (error) {
      this.isConnected = false;
      console.error('ESP32 fetch error:', error);
      
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to connect to ESP32',
      };
    }
  }

  /**
   * Start polling ESP32 for data
   * @param {Function} callback - Callback function to receive data
   * @param {number} interval - Polling interval in milliseconds
   */
  startPolling(callback, interval = this.pollInterval) {
    this.stopPolling(); // Stop any existing polling
    
    // Fetch immediately
    this.fetchMoistureData().then(callback);
    
    // Then poll at intervals
    this.pollingInterval = setInterval(() => {
      this.fetchMoistureData().then(callback);
    }, interval);
  }

  /**
   * Stop polling ESP32
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Test connection to ESP32
   * @returns {Promise<boolean>} True if connected successfully
   */
  async testConnection() {
    const result = await this.fetchMoistureData();
    return result.success;
  }

  /**
   * Get connection status
   * @returns {boolean} Connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
export default new ESP32Service();

