import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ESP32Service from '../src/utils/esp32Service';
import PHSensorService from '../src/utils/phSensorService';
import BluetoothPermissionService from '../src/utils/bluetoothPermissionService';
import BleScanServiceEsp32 from '../src/utils/BleScanServiceEsp32';
import { useTranslation } from '../src/i18n/useTranslation';

const { width } = Dimensions.get('window');

export default function DeviceConnectionScreenSeedDetection({ navigation, route }) {
  const translate = useTranslation('deviceConnectionSeed');
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState([]);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [manualIp, setManualIp] = useState('');
  const [testingManual, setTestingManual] = useState(false);
  
  // Determine if this is for BLE (pH sensor) or WiFi (moisture sensor)
  const isBLESensor = route?.params?.sensorType === 'pH' || route?.params?.sensorType === 'BLE';
  const service = isBLESensor ? PHSensorService : ESP32Service;
  console.log('isBLESensor', isBLESensor);
  // Check if already connected
  useEffect(() => {
    const connectedDevice = service.getConnectedDevice();
    if (connectedDevice) {
      if (isBLESensor) {
        setFoundDevices([{
          ...connectedDevice,
          status: 'connected',
        }]);
      } else {
        setFoundDevices([{
          ...connectedDevice,
          name: `ESP32-${connectedDevice.ip?.split('.').pop() || 'Device'}`,
          status: 'connected',
        }]);
      }
    }
  }, [isBLESensor]);

  const handleScan = async () => {
    setIsScanning(true);
    setFoundDevices([]);
    setScanProgress({ current: 0, total: 0 });

    try {
      if (isBLESensor) {
        console.log('Scanning for BLE devices');
        // Request Bluetooth permissions before scanning
        const hasPermission = await BluetoothPermissionService.checkPermissions();
        if (!hasPermission) {
          const permissionGranted = await BluetoothPermissionService.requestPermissions();
          if (!permissionGranted) {
            showAppAlert(translate('common.permissionRequired'), translate('permissionMessage'));
            setIsScanning(false);
            return;
          }
        }

        // BLE scan
        const devices = await BleScanServiceEsp32.scanForDevices(
          (device) => {
            // Device found callback
            setFoundDevices(prev => {
              // Avoid duplicates
              if (prev.find(d => d.id === device.id)) {
                return prev;
              }
              return [...prev, device];
            });
          },
          (current, total) => {
            // Progress callback
            setScanProgress({ current, total });
          }
        );

        if (devices.length === 0) {
          showAppAlert(translate('noDevicesFound'), translate('bleHelpHint'));
        }
      } else {
        // WiFi scan
        const devices = await service.scanForDevices(
          (device) => {
            // Device found callback
            setFoundDevices(prev => {
              // Avoid duplicates
              if (prev.find(d => d.ip === device.ip)) {
                return prev;
              }
              return [...prev, device];
            });
          },
          (current, total) => {
            // Progress callback
            setScanProgress({ current, total });
          }
        );

        if (devices.length === 0) {
          showAppAlert(translate('noDevicesFound'), translate('wifiHelpHint'));
        }
      }
    } catch (error) {
      showAppAlert(translate('common.error'), error.message || translate('failedScan'));
    } finally {
      setIsScanning(false);
    }
  };

  // const handleConnect = async (device) => {
  //   try {
  //     if (isBLESensor) {
  //       // BLE connection
  //       console.log('Connecting to BLE device', device);
        
  //       // Create a promise that resolves when first data is received
  //       let firstDataResolver = null;
  //       let dataReceived = false;
        
  //       const firstDataPromise = new Promise((resolve) => {
  //         firstDataResolver = resolve;
  //         // Timeout after 15 seconds if no data received (ESP32 sends every 5 seconds)
  //         setTimeout(() => {
  //           if (!dataReceived && firstDataResolver === resolve) {
  //             console.log('Timeout waiting for first data');
  //             resolve(null);
  //           }
  //         }, 15000);
  //       });
        
  //       // Set up data callback
  //       const dataCallback = (data) => {
  //         console.log('Received sensor data in callback:', data);
  //         // Resolve the promise with first data
  //         if (firstDataResolver && data && !dataReceived) {
  //           dataReceived = true;
  //           console.log('Resolving promise with data:', data);
  //           firstDataResolver(data);
  //           firstDataResolver = null;
  //         }
  //       };
        
  //       const result = await BleScanServiceEsp32.connectAndListen(device, dataCallback);
        
  //       if (result.success) {
  //         // Store connected device info in PHSensorService for compatibility
  //         // This allows SoilPHScreen to access the device
  //         PHSensorService.connectedDevice = result.device;
  //         PHSensorService.isConnected = true;
          
  //         console.log('Connection successful, waiting for first data...');
          
  //         // Wait for first data packet (sensor sends every 5 seconds)
  //         const firstData = await firstDataPromise;
  //         console.log('firstData received:', firstData);
  //         console.log('BleScanServiceEsp32.latestData:', BleScanServiceEsp32.getLatestData());
          
  //         if (firstData) {
  //           // Verify data is stored
  //           const storedData = BleScanServiceEsp32.getLatestData();
  //           console.log('Stored data after receiving:', storedData);
            
  //           showAppAlert(
  //             'Connected!',
  //             `Successfully connected to ${device.name || 'ESP32-Soil-Sensor'}\n\nSensor data received!`,
  //             [
  //               {
  //                 text: 'OK',
  //                 onPress: () => {
  //                   navigation.goBack();
  //                 },
  //               },
  //             ]
  //           );
  //         } else {
  //           // Connection successful but no data yet (timeout)
  //           // Check if data arrived anyway
  //           const storedData = BleScanServiceEsp32.getLatestData();
  //           console.log('No data in promise, but checking stored data:', storedData);
            
  //           if (storedData) {
  //             showAppAlert(
  //               'Connected!',
  //               `Successfully connected to ${device.name || 'ESP32-Soil-Sensor'}\n\nSensor data available!`,
  //               [
  //                 {
  //                   text: 'OK',
  //                   onPress: () => {
  //                     navigation.goBack();
  //                   },
  //                 },
  //               ]
  //             );
  //           } else {
  //             showAppAlert(
  //               'Connected!',
  //               `Successfully connected to ${device.name || 'ESP32-Soil-Sensor'}\n\nWaiting for sensor data...`,
  //               [
  //                 {
  //                   text: 'OK',
  //                   onPress: () => {
  //                     navigation.goBack();
  //                   },
  //                 },
  //               ]
  //             );
  //           }
  //         }
  //       } else {
  //         showAppAlert('Connection Failed', result.error || 'Could not connect to device');
  //       }
  //     } else {
  //       // WiFi connection
  //       service.configure(device.ip, device.port, device.endpoint);
  //       const testResult = await service.testConnection();
        
  //       if (testResult) {
  //         showAppAlert(
  //           'Connected!',
  //           `Successfully connected to ${device.name || device.ip}`,
  //           [
  //             {
  //               text: 'OK',
  //               onPress: () => {
  //                 navigation.goBack();
  //               },
  //             },
  //           ]
  //         );
  //       } else {
  //         showAppAlert('Connection Failed', 'Could not connect to device');
  //       }
  //     }
  //   } catch (error) {
  //     showAppAlert('Connection Error', error.message || 'Failed to connect');
  //   }
  // };
  const handleConnect = async (device) => {
    try {
      if (!isBLESensor) return;
  
      console.log('Connecting to BLE device', device);
  
      // Connect and listen
      const result = await BleScanServiceEsp32.connectAndListen(device, (data) => {
        console.log('Data callback:', data);
      });
  
      if (!result.success) {
        showAppAlert(translate('connectionFailed'), result.error || translate('couldNotConnect'));
        return;
      }
  
      PHSensorService.connectedDevice = result.device;
      PHSensorService.isConnected = true;
  
      console.log('Waiting for first sensor data...');
  
      // Wait for first data (from promise returned)
      const firstData = await result.firstDataPromise;
  
      if (firstData) {
        showAppAlert(
          translate('connected'),
          `Successfully connected to ${device.name || 'ESP32-Soil-Sensor'}\n\nSensor data received!`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        showAppAlert(
          translate('connected'),
          `Connected to ${device.name || 'ESP32-Soil-Sensor'}\n\nWaiting for sensor data...`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      showAppAlert(translate('common.error'), error.message || translate('failedConnect'));
    }
  };
  

  const handleDisconnect = () => {
    showAppAlert(
      translate('disconnectDevice'),
      translate('disconnectConfirm'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('disconnect'),
          style: 'destructive',
          onPress: () => {
            service.disconnect?.();
            setFoundDevices([]);
            showAppAlert(translate('disconnected'), translate('disconnectedMessage'));
          },
        },
      ]
    );
  };

  const handleManualTest = async () => {
    if (!manualIp.trim()) {
      showAppAlert(translate('common.error'), translate('enterIp'));
      return;
    }

    // Validate IP format (basic)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(manualIp.trim())) {
      showAppAlert(translate('invalidIp'), translate('validIpHint'));
      return;
    }

    setTestingManual(true);
    try {
      const device = await ESP32Service.testDevice(manualIp.trim());
      if (device) {
        setFoundDevices(prev => {
          if (prev.find(d => d.ip === device.ip)) {
            return prev;
          }
          return [...prev, device];
        });
        showAppAlert(translate('deviceFound'), `${translate('foundEsp32At')} ${device.ip}`);
      } else {
        showAppAlert(
          translate('deviceNotFound'),
          `No ESP32 device found at ${manualIp.trim()}. Make sure the device is online and the endpoint is correct.`
        );
      }
    } catch (error) {
      showAppAlert(translate('common.error'), error.message || translate('failedTestDevice'));
    } finally {
      setTestingManual(false);
    }
  };

  const connectedDevice = service.getConnectedDevice();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeAreaTop} />
      <View style={styles.safeAreaContent}>
        {/* Hero Header */}
        <View style={styles.heroHeader}>
          <View style={styles.headerPattern} />
          <View style={styles.headerPattern2} />
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.welcomeText}>{translate('title')}</Text>
            </View>
            <View style={styles.backButton} />
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.innerContent}>
            {/* Scan Button */}
            <TouchableOpacity
              style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
              onPress={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <View style={styles.scanButtonContent}>
                  <ActivityIndicator size="small" color="white" style={styles.scanButtonIcon} />
                  <Text style={styles.scanButtonText}>
                    {isBLESensor ? translate('scanningBluetooth') : translate('scanningNetwork')}
                  </Text>
                </View>
              ) : (
                <View style={styles.scanButtonContent}>
                  <Icon name="magnify" size={24} color="white" style={styles.scanButtonIcon} />
                  <Text style={styles.scanButtonText}>
                    {isBLESensor ? translate('scanForBluetooth') : translate('scanForDevices')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Scan Progress */}
            {isScanning && scanProgress.total > 0 && (
              <View style={styles.progressCard}>
                <Text style={styles.progressText}>
                  {translate('scanning')} {scanProgress.current} / {scanProgress.total}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(scanProgress.current / scanProgress.total) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Found Devices */}
            {foundDevices.length > 0 && (
              <View style={styles.devicesSection}>
                <Text style={styles.sectionTitle}>
                  {translate('foundDevices')} ({foundDevices.length})
                </Text>
                {foundDevices.map((device, index) => {
                  const isConnected = isBLESensor
                    ? (connectedDevice && connectedDevice.id === device.id)
                    : (connectedDevice && connectedDevice.ip === device.ip);
                  return (
                    <View key={isBLESensor ? `${device.id}-${index}` : `${device.ip}-${index}`} style={styles.deviceCard}>
                      <View style={styles.deviceHeader}>
                        <View style={styles.deviceInfo}>
                          <View style={styles.deviceIconContainer}>
                            {isConnected ? (
                              <Icon name="check-circle" size={24} color="#4CAF50" />
                            ) : (
                              <Icon name={isBLESensor ? "bluetooth" : "wifi"} size={24} color="#2196F3" />
                            )}
                          </View>
                          <View style={styles.deviceDetails}>
                            <Text style={styles.deviceName}>
                              {device.name || (isBLESensor ? 'ESP32-Soil-Sensor' : `ESP32-${device.ip?.split('.').pop()}`)}
                            </Text>
                            {isBLESensor ? (
                              <>
                                {device.rssi && (
                                  <Text style={styles.deviceIp}>BLE • RSSI: {device.rssi} dBm</Text>
                                )}
                              </>
                            ) : (
                              <>
                                <Text style={styles.deviceIp}>{device.ip}</Text>
                                {device.moisture !== undefined && (
                                  <Text style={styles.deviceMoisture}>
                                    {translate('moisture')} {device.moisture.toFixed(1)}%
                                  </Text>
                                )}
                              </>
                            )}
                          </View>
                        </View>
                        {isConnected && (
                          <View style={styles.connectedBadge}>
                            <Text style={styles.connectedBadgeText}>{translate('connected')}</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.deviceActions}>
                        {isConnected ? (
                          <TouchableOpacity
                            style={styles.disconnectButton}
                            onPress={handleDisconnect}
                          >
                            <Icon name="close-circle-outline" size={20} color="#F44336" />
                            <Text style={styles.disconnectButtonText}>{translate('disconnect')}</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={styles.connectButton}
                            onPress={() => handleConnect(device)}
                          >
                            <Icon name="check-circle" size={20} color="white" />
                            <Text style={styles.connectButtonText}>{translate('common.connect')}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <View style={styles.instructionsHeader}>
                <Icon
                  name={isBLESensor ? 'bluetooth' : 'wifi'}
                  size={24}
                  color="#0F5132"
                />
                <Text style={styles.instructionsTitle}>{translate('findDevice')}</Text>
              </View>
              <Text style={styles.instructionsText}>
                {isBLESensor ? (
                  translate('bluetoothInstructions')
                ) : (
                  <>
                    <Text style={styles.instructionsBold}>AP Mode:</Text> {translate('apModeInstructions')}{'\n\n'}
                    <Text style={styles.instructionsBold}>WiFi Mode:</Text> {translate('wifiModeInstructions')}
                  </>
                )}
              </Text>
            </View>

            {/* Manual IP Entry - Only for WiFi */}
            {!isBLESensor && (
              <View style={styles.manualCard}>
                <Text style={styles.sectionTitle}>{translate('manualIpEntry')}</Text>
                <Text style={styles.sectionSubtitle}>{translate('manualIpHint')}</Text>

                <View style={styles.quickConnectCard}>
                  <Text style={styles.quickConnectLabel}>{translate('quickConnect')}</Text>
                  <Text style={styles.quickConnectHint}>{translate('quickConnectHint')}</Text>
                  <TouchableOpacity
                    style={styles.quickConnectButton}
                    onPress={async () => {
                      const apIp = '192.168.4.1';
                      setManualIp(apIp);
                      setTestingManual(true);
                      try {
                        const device = await ESP32Service.testDevice(apIp);
                        if (device) {
                          setFoundDevices(prev => {
                            if (prev.find(d => d.ip === device.ip)) {
                              return prev;
                            }
                            return [...prev, device];
                          });
                          showAppAlert(translate('deviceFound'), `${translate('foundEsp32At')} ${device.ip}`);
                        } else {
                          showAppAlert(
                            translate('deviceNotFound'),
                            `${translate('noEsp32At')} ${apIp}. ${translate('noEsp32Hint')}`
                          );
                        }
                      } catch (error) {
                        showAppAlert(translate('common.error'), error.message || translate('failedTestDevice'));
                      } finally {
                        setTestingManual(false);
                      }
                    }}
                  >
                    <Icon name="wifi" size={20} color="white" />
                    <Text style={styles.quickConnectButtonText}>{translate('tryApIp')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.ipInput}
                    placeholder="192.168.4.1"
                    value={manualIp}
                    onChangeText={setManualIp}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={[styles.testButton, testingManual && styles.testButtonDisabled]}
                    onPress={handleManualTest}
                    disabled={testingManual}
                  >
                    {testingManual ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.testButtonText}>{translate('test')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* No Devices State */}
            {!isScanning && foundDevices.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name={isBLESensor ? "bluetooth-off" : "wifi-off"} size={48} color="#CCC" />
                <Text style={styles.emptyStateText}>{translate('noDevicesFound')}</Text>
                <Text style={styles.emptyStateSubtext}>
                  {isBLESensor ? translate('noDevicesHintBLE') : translate('noDevicesHint')}
                </Text>
              </View>
            )}

            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F5132',
  },
  safeAreaTop: {
    backgroundColor: '#0F5132',
  },
  safeAreaContent: {
    flex: 1,
    backgroundColor: '#F0F7F3',
  },
  heroHeader: {
    backgroundColor: '#0F5132',
    height: 160,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 24,
  },
  headerPattern: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '45deg' }],
  },
  headerPattern2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    zIndex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  innerContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  scanButton: {
    marginHorizontal: 4,
    marginBottom: 20,
    backgroundColor: '#0F5132',
    padding: 18,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonIcon: {
    marginRight: 12,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  progressCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  devicesSection: {
    marginHorizontal: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  deviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  deviceIconContainer: {
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  deviceIp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  deviceMoisture: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  connectedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  connectedBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  deviceActions: {
    marginTop: 12,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    padding: 14,
    borderRadius: 16,
    gap: 8,
    elevation: 3,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    padding: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F44336' + '30',
  },
  disconnectButtonText: {
    color: '#F44336',
    fontSize: 15,
    fontWeight: '700',
  },
  instructionsCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderLeftWidth: 5,
    borderLeftColor: '#0F5132',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 12,
    flex: 1,
  },
  instructionsText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  instructionsBold: {
    fontWeight: '700',
    color: '#0F5132',
  },
  manualCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontWeight: '500',
  },
  quickConnectCard: {
    backgroundColor: '#F8FBF9',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0F5132',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  quickConnectLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 6,
  },
  quickConnectHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 14,
    fontWeight: '500',
  },
  quickConnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  quickConnectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ipInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: '#0F5132',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
    elevation: 3,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 30,
  },
});

