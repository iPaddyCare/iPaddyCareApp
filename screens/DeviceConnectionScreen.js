import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ESP32Service from '../src/utils/esp32Service';

export default function DeviceConnectionScreen({ navigation }) {
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState([]);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [manualIp, setManualIp] = useState('');
  const [testingManual, setTestingManual] = useState(false);

  // Check if already connected
  useEffect(() => {
    const connectedDevice = ESP32Service.getConnectedDevice();
    if (connectedDevice) {
      setFoundDevices([{
        ...connectedDevice,
        name: `ESP32-${connectedDevice.ip.split('.').pop()}`,
        status: 'connected',
      }]);
    }
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    setFoundDevices([]);
    setScanProgress({ current: 0, total: 0 });

    try {
      const devices = await ESP32Service.scanForDevices(
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
        Alert.alert(
          'No Devices Found',
          'No ESP32 devices were found on your network. Make sure:\n\n• ESP32 is powered on\n• ESP32 is connected to WiFi\n• Your phone is on the same network\n• Try manual IP entry'
        );
      }
    } catch (error) {
      Alert.alert('Scan Error', error.message || 'Failed to scan for devices');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async (device) => {
    try {
      ESP32Service.configure(device.ip, device.port, device.endpoint);
      const testResult = await ESP32Service.testConnection();
      
      if (testResult) {
        Alert.alert(
          'Connected!',
          `Successfully connected to ${device.name || device.ip}`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Connection Failed', 'Could not connect to device');
      }
    } catch (error) {
      Alert.alert('Connection Error', error.message || 'Failed to connect');
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Device',
      'Are you sure you want to disconnect?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            ESP32Service.disconnect();
            setFoundDevices([]);
            Alert.alert('Disconnected', 'Device has been disconnected');
          },
        },
      ]
    );
  };

  const handleManualTest = async () => {
    if (!manualIp.trim()) {
      Alert.alert('Error', 'Please enter an IP address');
      return;
    }

    // Validate IP format (basic)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(manualIp.trim())) {
      Alert.alert('Invalid IP', 'Please enter a valid IP address (e.g., 192.168.1.100)');
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
        Alert.alert('Device Found!', `Found ESP32 device at ${device.ip}`);
      } else {
        Alert.alert(
          'Device Not Found',
          `No ESP32 device found at ${manualIp.trim()}. Make sure the device is online and the endpoint is correct.`
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to test device');
    } finally {
      setTestingManual(false);
    }
  };

  const connectedDevice = ESP32Service.getConnectedDevice();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#0F5132" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect Device</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Icon name="wifi" size={24} color="#2196F3" />
          <Text style={styles.instructionsTitle}>Find Your ESP32 Device</Text>
          <Text style={styles.instructionsText}>
            <Text style={styles.instructionsBold}>AP Mode:</Text> Connect your phone to ESP32's WiFi network (e.g., "ESP32-Moisture-Sensor"), then tap "Try 192.168.4.1" or scan.{'\n\n'}
            <Text style={styles.instructionsBold}>WiFi Mode:</Text> Make sure ESP32 and phone are on the same WiFi network, then scan for devices.
          </Text>
        </View>

        {/* Manual IP Entry */}
        <View style={styles.manualCard}>
          <Text style={styles.sectionTitle}>Manual IP Entry</Text>
          <Text style={styles.sectionSubtitle}>
            If you know your ESP32's IP address, enter it here
          </Text>
          
          {/* Quick Connect for AP Mode */}
          <View style={styles.quickConnectCard}>
            <Text style={styles.quickConnectLabel}>Quick Connect (AP Mode)</Text>
            <Text style={styles.quickConnectHint}>
              If ESP32 is in Access Point mode, try the default IP:
            </Text>
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
                    Alert.alert('Device Found!', `Found ESP32 device at ${device.ip}`);
                  } else {
                    Alert.alert(
                      'Device Not Found',
                      `No ESP32 device found at ${apIp}. Make sure:\n\n• ESP32 is powered on\n• You're connected to ESP32 WiFi network\n• ESP32 is in AP mode`
                    );
                  }
                } catch (error) {
                  Alert.alert('Error', error.message || 'Failed to test device');
                } finally {
                  setTestingManual(false);
                }
              }}
            >
              <Icon name="wifi" size={20} color="white" />
              <Text style={styles.quickConnectButtonText}>Try 192.168.4.1</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputRow}>
            <TextInput
              style={styles.ipInput}
              placeholder="192.168.4.1 or 192.168.1.100"
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
                <Text style={styles.testButtonText}>Test</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
          onPress={handleScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <View style={styles.scanButtonContent}>
              <ActivityIndicator size="small" color="white" style={styles.scanButtonIcon} />
              <Text style={styles.scanButtonText}>Scanning Network...</Text>
            </View>
          ) : (
            <View style={styles.scanButtonContent}>
              <Icon name="magnify" size={24} color="white" style={styles.scanButtonIcon} />
              <Text style={styles.scanButtonText}>Scan for Devices</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Scan Progress */}
        {isScanning && scanProgress.total > 0 && (
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              Scanning... {scanProgress.current} / {scanProgress.total}
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
              Found Devices ({foundDevices.length})
            </Text>
            {foundDevices.map((device, index) => {
              const isConnected = connectedDevice && connectedDevice.ip === device.ip;
              return (
                <View key={`${device.ip}-${index}`} style={styles.deviceCard}>
                  <View style={styles.deviceHeader}>
                    <View style={styles.deviceInfo}>
                      <View style={styles.deviceIconContainer}>
                        {isConnected ? (
                          <Icon name="check-circle" size={24} color="#4CAF50" />
                        ) : (
                          <Icon name="wifi" size={24} color="#2196F3" />
                        )}
                      </View>
                      <View style={styles.deviceDetails}>
                        <Text style={styles.deviceName}>
                          {device.name || `ESP32-${device.ip.split('.').pop()}`}
                        </Text>
                        <Text style={styles.deviceIp}>{device.ip}</Text>
                        {device.moisture !== undefined && (
                          <Text style={styles.deviceMoisture}>
                            Moisture: {device.moisture.toFixed(1)}%
                          </Text>
                        )}
                      </View>
                    </View>
                    {isConnected && (
                      <View style={styles.connectedBadge}>
                        <Text style={styles.connectedBadgeText}>Connected</Text>
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
                        <Text style={styles.disconnectButtonText}>Disconnect</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.connectButton}
                        onPress={() => handleConnect(device)}
                      >
                        <Icon name="check-circle" size={20} color="white" />
                        <Text style={styles.connectButtonText}>Connect</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* No Devices State */}
        {!isScanning && foundDevices.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="wifi-off" size={48} color="#CCC" />
            <Text style={styles.emptyStateText}>No devices found</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap "Scan for Devices" to search your network
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  scrollView: {
    flex: 1,
  },
  instructionsCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginLeft: 12,
    marginBottom: 4,
    flex: 1,
  },
  instructionsText: {
    fontSize: 14,
    color: '#424242',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  instructionsBold: {
    fontWeight: '600',
    color: '#1976D2',
  },
  manualCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  quickConnectCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  quickConnectLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  quickConnectHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  quickConnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    gap: 8,
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
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  testButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scanButton: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#0F5132',
    padding: 18,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    fontWeight: 'bold',
  },
  progressCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
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
    margin: 16,
    marginTop: 0,
  },
  deviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  deviceIp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  deviceMoisture: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  connectedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectedBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deviceActions: {
    marginTop: 8,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  disconnectButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 30,
  },
});

