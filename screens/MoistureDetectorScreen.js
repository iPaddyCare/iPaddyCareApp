import React, { useState, useEffect, useRef } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ESP32Service from '../src/utils/esp32Service';

export default function MoistureDetectorScreen({ navigation }) {
  const [moistureData, setMoistureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const pollingActive = useRef(false);

  // Fetch data from ESP32
  const fetchData = async () => {
    const device = ESP32Service.getConnectedDevice();
    if (!device) {
      setConnected(false);
      setError('No device connected');
      setMoistureData(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    const result = await ESP32Service.fetchMoistureData();
    
    if (result.success) {
      setMoistureData(result.data);
      setConnected(true);
      setError(null);
    } else {
      setConnected(false);
      setError(result.error);
      setMoistureData(null);
    }
    
    setLoading(false);
  };

  // Start/Stop polling
  useEffect(() => {
    if (connected && !pollingActive.current) {
      pollingActive.current = true;
      ESP32Service.startPolling((result) => {
        if (result.success) {
          setMoistureData(result.data);
          setConnected(true);
          setError(null);
        } else {
          setConnected(false);
          setError(result.error);
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      ESP32Service.stopPolling();
      pollingActive.current = false;
    };
  }, [connected]);

  // Check for connected device and fetch data
  useEffect(() => {
    const device = ESP32Service.getConnectedDevice();
    if (device) {
      setConnectedDevice(device);
      fetchData();
    } else {
      setConnected(false);
      setError('No device connected');
    }
  }, []);

  // Listen for navigation focus to refresh connection status
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      const device = ESP32Service.getConnectedDevice();
      if (device) {
        setConnectedDevice(device);
        if (!connected) {
          fetchData();
        }
      }
    });

    return unsubscribe;
  }, [navigation, connected]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleConnectDevice = () => {
    navigation?.navigate('DeviceConnection');
  };

  // Get moisture status and recommendation
  const getMoistureStatus = (moisture) => {
    if (moisture < 30) {
      return { status: 'Low', color: '#F44336', recommendation: 'Water needed immediately' };
    } else if (moisture < 50) {
      return { status: 'Moderate', color: '#FF9800', recommendation: 'Monitor closely, may need watering soon' };
    } else if (moisture < 70) {
      return { status: 'Good', color: '#4CAF50', recommendation: 'Optimal moisture level' };
    } else {
      return { status: 'High', color: '#2196F3', recommendation: 'Moisture level is high, reduce watering' };
    }
  };

  const moistureStatus = moistureData ? getMoistureStatus(moistureData.moisture) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Moisture Monitor</Text>
            <Text style={styles.subtitle}>Real-time sensor data from ESP32</Text>
          </View>
        </View>

        {/* Connection Status */}
        <View style={[styles.statusCard, connected ? styles.statusConnected : styles.statusDisconnected]}>
          <View style={styles.statusRow}>
            {connected ? (
              <Icon name="wifi" size={24} color="#4CAF50" />
            ) : (
              <Icon name="alert-circle" size={24} color="#F44336" />
            )}
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusText, connected && styles.statusTextConnected]}>
                {connected ? 'Connected to ESP32' : 'No Device Connected'}
              </Text>
              {connectedDevice && (
                <Text style={styles.statusDeviceIp}>{connectedDevice.ip}</Text>
              )}
            </View>
            {!connected && (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnectDevice}
              >
                <Icon name="link" size={20} color="white" />
                <Text style={styles.connectButtonText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Loading State */}
        {loading && !moistureData && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0F5132" />
            <Text style={styles.loadingText}>Fetching data from ESP32...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              Make sure your ESP32 is powered on and connected to the same WiFi network.
            </Text>
            <View style={styles.errorActions}>
              <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.connectDeviceButton}
                onPress={handleConnectDevice}
              >
                <Icon name="link" size={20} color="white" />
                <Text style={styles.connectDeviceButtonText}>Connect Device</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Moisture Data Display */}
        {moistureData && (
          <>
            {/* Main Moisture Card */}
            <View style={styles.moistureCard}>
              <View style={styles.moistureHeader}>
                <Icon name="water" size={32} color="#2196F3" />
                <Text style={styles.moistureLabel}>Moisture Level</Text>
              </View>
              <Text style={styles.moistureValue}>{moistureData.moisture.toFixed(1)}%</Text>
              <View style={[styles.statusBadge, { backgroundColor: moistureStatus.color + '20' }]}>
                <Text style={[styles.statusBadgeText, { color: moistureStatus.color }]}>
                  {moistureStatus.status}
                </Text>
              </View>
              <Text style={styles.recommendation}>{moistureStatus.recommendation}</Text>
            </View>

            {/* Additional Data Cards */}
            <View style={styles.dataGrid}>
              {moistureData.temperature !== null && (
                <View style={styles.dataCard}>
                  <Icon name="thermometer" size={24} color="#FF9800" />
                  <Text style={styles.dataLabel}>Temperature</Text>
                  <Text style={styles.dataValue}>{moistureData.temperature.toFixed(1)}°C</Text>
                </View>
              )}

              {moistureData.humidity !== null && (
                <View style={styles.dataCard}>
                  <Icon name="water" size={24} color="#9C27B0" />
                  <Text style={styles.dataLabel}>Humidity</Text>
                  <Text style={styles.dataValue}>{moistureData.humidity.toFixed(1)}%</Text>
                </View>
              )}
            </View>

            {/* Timestamp */}
            <View style={styles.timestampCard}>
              <Text style={styles.timestampLabel}>Last Updated</Text>
              <Text style={styles.timestampValue}>
                {new Date(moistureData.timestamp).toLocaleString()}
              </Text>
            </View>
          </>
        )}

        {/* No Device Connected State */}
        {!moistureData && !loading && !error && !connectedDevice && (
          <View style={styles.emptyState}>
            <Icon name="alert-circle" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>No Device Connected</Text>
            <Text style={styles.emptyStateText}>
              Connect to an ESP32 device to view moisture data
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={handleConnectDevice}
            >
              <Icon name="link" size={24} color="white" />
              <Text style={styles.emptyStateButtonText}>Connect Device</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  statusDeviceIp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F5132',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusConnected: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  statusDisconnected: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  statusTextConnected: {
    color: '#4CAF50',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B6B6B',
  },
  errorCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
    marginBottom: 12,
  },
  errorHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  connectDeviceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  connectDeviceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  moistureCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  moistureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moistureLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  moistureValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#0F5132',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  dataGrid: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  dataCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dataLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  timestampCard: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  timestampLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  timestampValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F5132',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

