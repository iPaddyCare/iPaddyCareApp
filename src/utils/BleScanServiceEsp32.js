import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

const manager = new BleManager();

const SERVICE_UUID = '0000ff00-0000-1000-8000-00805f9b34fb';
const CHAR_UUID = '0000ff01-0000-1000-8000-00805f9b34fb';

class BleScanService {
    constructor() {
        this.connectedDevice = null;
        this.notificationSubscription = null;
        this.latestData = null;
        this.dataBuffer = ''; // Buffer for accumulating partial JSON data
    }

    scanForDevices(onDeviceFound) {
        return new Promise((resolve, reject) => {
            const foundDevices = [];

            manager.startDeviceScan(null, null, (error, device) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (device?.name === 'ESP32-Soil-Sensor') {
                    manager.stopDeviceScan();

                    foundDevices.push(device);
                    onDeviceFound?.(device);
                    resolve(foundDevices);
                }
            });

            // stop scan after 10 seconds
            setTimeout(() => {
                manager.stopDeviceScan();
                resolve(foundDevices);
            }, 10000);
        });
    }

    // async connectAndListen(device, onData) {
    //     try {
    //       // Connect to device
    //       const connected = await device.connect();
    //       await connected.discoverAllServicesAndCharacteristics();
      
    //       // Get the service
    //       const services = await connected.services();
    //       const service = services.find(s => s.uuid.toLowerCase() === SERVICE_UUID.toLowerCase());
      
    //       if (!service) {
    //         await connected.cancelConnection();
    //         return { success: false, error: 'Service not found on device' };
    //       }
      
    //       // Get the characteristic
    //       const characteristics = await service.characteristics();
    //       const characteristic = characteristics.find(c => c.uuid.toLowerCase() === CHAR_UUID.toLowerCase());
      
    //       if (!characteristic) {
    //         await connected.cancelConnection();
    //         return { success: false, error: 'Characteristic not found on device' };
    //       }
      
    //       console.log('Connected to characteristic:', characteristic.uuid);
      
    //       // Buffer to accumulate BLE chunks
    //       this.dataBuffer = '';
    //       this.latestData = null;
      
    //       // Promise to resolve with first full JSON
    //       let firstDataResolver;
    //       const firstDataPromise = new Promise(resolve => (firstDataResolver = resolve));
      
    //       // Start monitoring notifications
    //       this.notificationSubscription = characteristic.monitor((error, char) => {
    //         if (error) {
    //           console.error('Notification error:', error);
    //           return;
    //         }
      
    //         if (!char?.value) return;
      
    //         let chunk;
    //         try {
    //           // Try base64 decode first
    //           chunk = Buffer.from(char.value, 'base64').toString('utf8');
    //         } catch (e) {
    //           // fallback: use value as string
    //           chunk = char.value;
    //         }
      
    //         if (!chunk || chunk.length === 0) return;
      
    //         // Append chunk to buffer
    //         this.dataBuffer += chunk;
      
    //         // Process ALL complete JSON objects in the buffer (not just the first one)
    //         let processedAny = false;
    //         let maxIterations = 10; // Safety limit to prevent infinite loops
    //         let iterations = 0;
      
    //         while (iterations < maxIterations) {
    //           iterations++;
              
    //           // Find complete JSON by counting braces
    //           let braceCount = 0;
    //           let jsonStart = -1;
    //           let jsonEnd = -1;
      
    //           for (let i = 0; i < this.dataBuffer.length; i++) {
    //             if (this.dataBuffer[i] === '{') {
    //               if (braceCount === 0) {
    //                 jsonStart = i; // Mark start of JSON
    //               }
    //               braceCount++;
    //             } else if (this.dataBuffer[i] === '}') {
    //               braceCount--;
    //               if (braceCount === 0 && jsonStart >= 0) {
    //                 jsonEnd = i;
    //                 break; // Found complete JSON
    //               }
    //             }
    //           }
      
    //           // If we found a complete JSON object, parse it
    //           if (jsonStart >= 0 && jsonEnd >= 0 && jsonEnd > jsonStart) {
    //             const jsonString = this.dataBuffer.substring(jsonStart, jsonEnd + 1);
    //             try {
    //               const data = JSON.parse(jsonString);
                  
    //               // Successfully parsed JSON
    //               this.latestData = data;
    //               processedAny = true;
                  
    //               // Remove parsed JSON from buffer (keep anything after it)
    //               this.dataBuffer = this.dataBuffer.substring(jsonEnd + 1).trim();
                  
    //               // Call user callback
    //               if (onData) onData(data);
        
    //               // Resolve first data promise
    //               if (firstDataResolver) {
    //                 firstDataResolver(data);
    //                 firstDataResolver = null;
    //               }
        
    //               console.log('Received BLE JSON:', data);
    //             } catch (parseError) {
    //               console.warn('JSON parse error:', parseError, 'JSON string:', jsonString.substring(0, 100));
    //               // If parsing fails, remove the problematic JSON and continue
    //               this.dataBuffer = this.dataBuffer.substring(jsonEnd + 1).trim();
    //             }
    //           } else {
    //             // No complete JSON found, break the loop
    //             break;
    //           }
    //         }
      
    //         // Safety: reset buffer if it grows too large (indicates parsing issues)
    //         if (this.dataBuffer.length > 500) {
    //           console.warn('Buffer too large (' + this.dataBuffer.length + ' chars), resetting. Content:', this.dataBuffer.substring(0, 200));
              
    //           // Try to extract the last complete JSON before resetting
    //           const lastBrace = this.dataBuffer.lastIndexOf('}');
    //           if (lastBrace > 0) {
    //             let braceCount = 0;
    //             let jsonStart = -1;
    //             for (let i = lastBrace; i >= 0; i--) {
    //               if (this.dataBuffer[i] === '}') {
    //                 braceCount++;
    //               } else if (this.dataBuffer[i] === '{') {
    //                 braceCount--;
    //                 if (braceCount === 0) {
    //                   jsonStart = i;
    //                   break;
    //                 }
    //               }
    //             }
                
    //             if (jsonStart >= 0 && jsonStart < lastBrace) {
    //               try {
    //                 const jsonString = this.dataBuffer.substring(jsonStart, lastBrace + 1);
    //                 const data = JSON.parse(jsonString);
    //                 this.latestData = data;
    //                 if (onData) onData(data);
    //                 if (firstDataResolver) {
    //                   firstDataResolver(data);
    //                   firstDataResolver = null;
    //                 }
    //                 console.log('Recovered JSON from large buffer:', data);
    //               } catch (e) {
    //                 console.warn('Failed to recover JSON from buffer');
    //               }
    //             }
    //           }
              
    //           // Clear buffer but keep any incomplete JSON at the end
    //           const lastOpenBrace = this.dataBuffer.lastIndexOf('{');
    //           if (lastOpenBrace >= 0) {
    //             // Keep the incomplete JSON starting from the last {
    //             this.dataBuffer = this.dataBuffer.substring(lastOpenBrace);
    //           } else {
    //             // No incomplete JSON, clear everything
    //             this.dataBuffer = '';
    //           }
    //         }
    //       });
      
    //       // Store connected device info
    //       this.connectedDevice = {
    //         id: connected.id,
    //         name: connected.name || 'ESP32-Soil-Sensor',
    //         type: 'BLE',
    //         status: 'connected',
    //       };
      
    //       return {
    //         success: true,
    //         device: this.connectedDevice,
    //         firstDataPromise, // return promise for first JSON
    //       };
    //     } catch (error) {
    //       console.error('BLE connection error:', error);
    //       return { success: false, error: error.message || 'Failed to connect to device' };
    //     }
    //   }
    async connectAndListen(device, onData) {
        try {
            // 1. Connect and request higher MTU (helps prevent fragmentation)
            const connected = await device.connect();
            try {
                await connected.requestMTU(256); 
            } catch (e) {
                console.warn("MTU negotiation not supported, falling back to default.");
            }
            
            await connected.discoverAllServicesAndCharacteristics();
    
            // 2. Find Service & Characteristic
            const services = await connected.services();
            const service = services.find(s => s.uuid.toLowerCase() === SERVICE_UUID.toLowerCase());
            if (!service) throw new Error('Service not found');
    
            const characteristics = await service.characteristics();
            const characteristic = characteristics.find(c => c.uuid.toLowerCase() === CHAR_UUID.toLowerCase());
            if (!characteristic) throw new Error('Characteristic not found');
    
            console.log('Connected to characteristic:', characteristic.uuid);
    
            this.dataBuffer = '';
            let firstDataResolver;
            const firstDataPromise = new Promise(resolve => (firstDataResolver = resolve));
    
            // 3. Monitor Notifications
            this.notificationSubscription = characteristic.monitor((error, char) => {
                if (error) {
                    console.error('Notification error:', error);
                    return;
                }
    
                if (!char?.value) return;
    
                // Decode the chunk
                let chunk = '';
                try {
                    chunk = Buffer.from(char.value, 'base64').toString('utf8');
                } catch (e) {
                    chunk = char.value;
                }
    
                // Append to buffer
                this.dataBuffer += chunk;
    
                // 4. Process buffer using Newline (\n) as the delimiter
                if (this.dataBuffer.includes('\n')) {
                    let lines = this.dataBuffer.split('\n');
                    
                    // The last element is either empty or an incomplete JSON, keep it in buffer
                    this.dataBuffer = lines.pop();
    
                    for (let line of lines) {
                        let trimmedLine = line.trim();
                        if (!trimmedLine) continue;
    
                        try {
                            const data = JSON.parse(trimmedLine);
                            console.log('Valid JSON Received:', data);
                            
                            if (onData) onData(data);
                            if (firstDataResolver) {
                                firstDataResolver(data);
                                firstDataResolver = null;
                            }
                        } catch (parseError) {
                            console.error('JSON Parse Error. Line was:', trimmedLine);
                        }
                    }
                }
    
                // Safety check: if buffer still grows too large without a newline
                if (this.dataBuffer.length > 1000) {
                    this.dataBuffer = ''; 
                }
            });
    
            this.connectedDevice = {
                id: connected.id,
                name: connected.name || 'ESP32-Soil-Sensor',
                status: 'connected',
            };
    
            return { success: true, device: this.connectedDevice, firstDataPromise };
    
        } catch (error) {
            console.error('BLE connection error:', error);
            return { success: false, error: error.message };
        }
    }
      
    // async connectAndListen(device, onData) {
    //     try {
    //       // Connect to device
    //       const connected = await device.connect();
    //       await connected.discoverAllServicesAndCharacteristics();
      
    //       // Get the service
    //       const services = await connected.services();
    //       const service = services.find(
    //         s => s.uuid.toLowerCase() === SERVICE_UUID.toLowerCase()
    //       );
      
    //       if (!service) {
    //         await connected.cancelConnection();
    //         return { success: false, error: 'Service not found on device' };
    //       }
      
    //       // Get the characteristic
    //       const characteristics = await service.characteristics();
    //       const characteristic = characteristics.find(
    //         c => c.uuid.toLowerCase() === CHAR_UUID.toLowerCase()
    //       );
      
    //       if (!characteristic) {
    //         await connected.cancelConnection();
    //         return { success: false, error: 'Characteristic not found on device' };
    //       }
      
    //       console.log('Connected to characteristic:', characteristic.uuid);
      
    //       // Buffer to accumulate BLE chunks
    //       this.dataBuffer = '';
    //       this.latestData = null;
      
    //        // Start monitoring notifications
    //        this.notificationSubscription = characteristic.monitor((error, char) => {
    //          if (error) {
    //            console.error('Notification error:', error);
    //            return;
    //          }
 
    //          if (!char?.value) return;
 
    //          // Decode base64 chunk
    //          let chunk;
    //          try {
    //            chunk = Buffer.from(char.value, 'base64').toString('utf8');
    //          } catch (e) {
    //            console.error('Error decoding BLE chunk:', e);
    //            return;
    //          }
 
    //          // Append to buffer
    //          this.dataBuffer += chunk;
 
    //          // Check if we have complete JSON by counting braces
    //          const openBraces = (this.dataBuffer.match(/{/g) || []).length;
    //          const closeBraces = (this.dataBuffer.match(/}/g) || []).length;
 
    //          if (openBraces > 0 && openBraces === closeBraces) {
    //            try {
    //              // Parse full JSON
    //              const data = JSON.parse(this.dataBuffer);
    //              this.latestData = data;
    //              this.dataBuffer = ''; // Clear buffer
 
    //              console.log('Received full BLE JSON:', data);
 
    //              // Call callback (will be called for all data updates)
    //              if (onData) {
    //                onData(data);
    //              }
    //            } catch (parseError) {
    //              console.warn('Failed to parse JSON, waiting for more chunks:', parseError);
    //              // If buffer grows too big, reset it
    //              if (this.dataBuffer.length > 500) {
    //                console.warn('Buffer too large, resetting');
    //                this.dataBuffer = '';
    //              }
    //            }
    //          }
    //        });
      
    //       // Store connected device info
    //       this.connectedDevice = {
    //         id: connected.id,
    //         name: connected.name || 'ESP32-Soil-Sensor',
    //         type: 'BLE',
    //         status: 'connected',
    //       };
      
    //       return { success: true, device: this.connectedDevice };
    //     } catch (error) {
    //       console.error('BLE connection error:', error);
    //       return { success: false, error: error.message || 'Failed to connect to device' };
    //     }
    //   }
      

    getConnectedDevice() {
        return this.connectedDevice;
    }

    disconnect() {
        if (this.notificationSubscription) {
            this.notificationSubscription.remove();
            this.notificationSubscription = null;
        }
        this.connectedDevice = null;
        this.latestData = null;
        this.dataBuffer = ''; // Clear buffer on disconnect
    }

    getLatestData() {
        return this.latestData;
    }
}

export default new BleScanService();
