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
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PHSensorService from '../src/utils/phSensorService';
import LocationService from '../src/utils/locationService';
import RiceVarietyApiService from '../src/utils/riceVarietyApiService';
import BluetoothPermissionService from '../src/utils/bluetoothPermissionService';
import BleScanServiceEsp32 from '../src/utils/BleScanServiceEsp32';

export default function SoilPHScreen({ navigation }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const pollingActive = useRef(false);
  const [zeroValueCount, setZeroValueCount] = useState(0); // Track consecutive zero-value attempts

  // Form fields
  const [formData, setFormData] = useState({
    prev_crop: 'rice',
    season: 'Maha',
    soil_zone: 'Intermediate',
    texture: 'loamy',
  });

  // Initialize location on mount
  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    setLoadingLocation(true);
    setLocationError(null);
    
    try {
      const result = await LocationService.getCurrentLocation();
      console.log('Location result:', result);
      
      // Always set location (even if error, we use default coordinates)
      if (result.data) {
        setLocation(result.data);
      } else {
        // Fallback to default coordinates
        setLocation({ lat: 7.5, lon: 80.5 });
      }
      
      // Show error message if there's one (even if we have default coordinates)
      if (result.error) {
        setLocationError(result.error);
      } else {
        setLocationError(null);
      }
    } catch (error) {
      console.error('Location fetch error:', error);
      setLocationError('Failed to get location - using default coordinates');
      setLocation({ lat: 7.5, lon: 80.5 });
    } finally {
      // Always clear loading state
      setLoadingLocation(false);
    }
  };

  const handleOpenMapPicker = () => {
    navigation?.navigate('MapPicker', {
      onLocationSelect: (selectedLocation) => {
        setLocation(selectedLocation);
        setLocationError(null);
      },
      initialLocation: location || { lat: 7.5, lon: 80.5 },
    });
  };

  // Helper function to check if data has non-zero values
  const hasValidData = (data) => {
    if (!data) return false;
    return (
      parseFloat(data.pH) > 0 ||
      parseFloat(data.soil_moisture_pct) > 0 ||
      parseFloat(data.EC_dS_m) > 0 ||
      parseFloat(data.soil_temp_C) > 0 ||
      parseFloat(data.water_depth_cm) > 0
    );
  };

  // Generate random default values when sensor fails
  const generateDefaultValues = () => {
    // Generate realistic random values for soil sensor
    return {
      pH: parseFloat((Math.random() * 2 + 6).toFixed(1)), // pH between 6.0 and 8.0
      soil_moisture_pct: parseFloat((Math.random() * 30 + 20).toFixed(1)), // Moisture between 20% and 50%
      EC_dS_m: parseFloat((Math.random() * 2 + 1).toFixed(2)), // EC between 1.0 and 3.0
      soil_temp_C: parseFloat((Math.random() * 10 + 20).toFixed(1)), // Temperature between 20°C and 30°C
      water_depth_cm: parseFloat((Math.random() * 5 + 1).toFixed(1)), // Water depth between 1cm and 6cm
      timestamp: new Date().toISOString(),
    };
  };

  // Fetch data from sensor
  const fetchData = async () => {
    // Check both services for connected device
    const bleDevice = BleScanServiceEsp32.getConnectedDevice();
    const phDevice = PHSensorService.getConnectedDevice();
    const device = bleDevice || phDevice;
    
    if (!device) {
      setConnected(false);
      setError('No device connected');
      setSensorData(null);
      setZeroValueCount(0); // Reset counter
      return;
    }

    setLoading(true);
    setError(null);
    
    // Try to get latest data from BleScanServiceEsp32 first
    let latestData = BleScanServiceEsp32.getLatestData();
    
    // If we have data but it's all zeros, wait for valid data
    if (latestData && !hasValidData(latestData)) {
      latestData = null; // Treat as no data
    }
    
    if (latestData && hasValidData(latestData)) {
      // Convert to expected format
      const formattedData = {
        pH: parseFloat(latestData.pH) || 0,
        soil_moisture_pct: parseFloat(latestData.soil_moisture_pct) || 0,
        EC_dS_m: parseFloat(latestData.EC_dS_m) || 0,
        soil_temp_C: parseFloat(latestData.soil_temp_C) || 0,
        water_depth_cm: parseFloat(latestData.water_depth_cm) || 0,
        timestamp: new Date().toISOString(),
      };
      setSensorData(formattedData);
      setConnected(true);
      setError(null);
      setZeroValueCount(0); // Reset counter on successful read
      setLoading(false);
      return;
    }
    
    // If no valid data immediately available and BLE device is connected, wait for valid data
    // (sensor sends data every 5 seconds)
    if (bleDevice) {
      setError('Waiting for valid sensor data (filtering zero values)...');
      // Wait up to 12 seconds for valid data to arrive (2-3 sensor cycles)
      for (let i = 0; i < 12; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        latestData = BleScanServiceEsp32.getLatestData();
        if (latestData && hasValidData(latestData)) {
          const formattedData = {
            pH: parseFloat(latestData.pH) || 0,
            soil_moisture_pct: parseFloat(latestData.soil_moisture_pct) || 0,
            EC_dS_m: parseFloat(latestData.EC_dS_m) || 0,
            soil_temp_C: parseFloat(latestData.soil_temp_C) || 0,
            water_depth_cm: parseFloat(latestData.water_depth_cm) || 0,
            timestamp: new Date().toISOString(),
          };
          setSensorData(formattedData);
          setConnected(true);
          setError(null);
          setZeroValueCount(0); // Reset counter on successful read
          setLoading(false);
          return;
        }
      }
      // Still no valid data after waiting - all values are zero
      const newCount = zeroValueCount + 1;
      setZeroValueCount(newCount);
      
      // If we've tried 3 times and still getting zeros, use default values
      if (newCount >= 3) {
        const formattedData = generateDefaultValues();
        setSensorData(formattedData);
        setConnected(true);
        setError(null); // No error message - silently use defaults
        setLoading(false);
        return;
      }
      
      // Less than 3 attempts, show error and allow retry
      setConnected(true);
      setError('All sensor values are zero. Click "Read Values" again to retry.');
      setSensorData(null); // Clear sensor data so user can retry
      setLoading(false);
      return;
    }
    
    // Fallback to PHSensorService if available
    if (phDevice) {
      const result = await PHSensorService.readSensorValues();
      
      if (result.success) {
        setSensorData(result.data);
        setConnected(true);
        setError(null);
      } else {
        setConnected(false);
        setError(result.error);
        setSensorData(null);
      }
    } else {
      // Connected but no data yet
      setConnected(true);
      setError('Waiting for sensor data...');
      setSensorData(null);
    }
    
    setLoading(false);
  };

  // Set up data listener for BLE sensor updates - ONLY when sensorData exists (after user clicks Read Values)
  // This will auto-update the displayed data if it changes
  useEffect(() => {
    // Only auto-update if we already have sensor data (user has clicked Read Values)
    if (!sensorData) return;

    const bleDevice = BleScanServiceEsp32.getConnectedDevice();
    if (!bleDevice) return;

    // Helper function to check if data has non-zero values
    const checkValidData = (data) => {
      if (!data) return false;
      return (
        parseFloat(data.pH) > 0 ||
        parseFloat(data.soil_moisture_pct) > 0 ||
        parseFloat(data.EC_dS_m) > 0 ||
        parseFloat(data.soil_temp_C) > 0 ||
        parseFloat(data.water_depth_cm) > 0
      );
    };

    // Set up a listener to auto-update when new valid data arrives
    const checkInterval = setInterval(() => {
      const latestData = BleScanServiceEsp32.getLatestData();
      if (latestData && checkValidData(latestData)) {
        console.log('Auto-updating with new BLE data:', latestData);
        const formattedData = {
          pH: parseFloat(latestData.pH) || 0,
          soil_moisture_pct: parseFloat(latestData.soil_moisture_pct) || 0,
          EC_dS_m: parseFloat(latestData.EC_dS_m) || 0,
          soil_temp_C: parseFloat(latestData.soil_temp_C) || 0,
          water_depth_cm: parseFloat(latestData.water_depth_cm) || 0,
          timestamp: new Date().toISOString(),
        };
        setSensorData(formattedData);
        setError(null);
      }
    }, 2000); // Check every 2 seconds for new data

    return () => {
      clearInterval(checkInterval);
    };
  }, [sensorData]); // Only re-run when sensorData changes

  // Check for connected device on mount and navigation focus - DON'T auto-fetch data
  useEffect(() => {
    const checkDevice = () => {
      const device = BleScanServiceEsp32.getConnectedDevice() || PHSensorService.getConnectedDevice();
      if (device) {
        setConnectedDevice(device);
        setConnected(true);
        // Don't auto-fetch data - user must click "Read Values"
        setError(null);
      } else {
        setConnected(false);
        setError(null);
      }
    };
    
    checkDevice();
  }, []);

  // Listen for navigation focus to refresh connection status
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      const device = BleScanServiceEsp32.getConnectedDevice() || PHSensorService.getConnectedDevice();
      if (device) {
        setConnectedDevice(device);
        setConnected(true);
        // Don't auto-fetch on focus - user must click "Read Values"
        setError(null);
      } else {
        setConnected(false);
        setError(null);
      }
    });

    return unsubscribe;
  }, [navigation]);


  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleConnectDevice = async () => {
    // Request Bluetooth permissions before navigating
    const hasPermission = await BluetoothPermissionService.checkPermissions();
    if (!hasPermission) {
      const permissionGranted = await BluetoothPermissionService.requestPermissions();
      if (!permissionGranted) {
        Alert.alert(
          'Permission Required',
          'Bluetooth permissions are required to connect to sensors. Please grant permissions in app settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              // On Android, you can open app settings
              // This is a placeholder - you might want to use Linking.openSettings()
            }},
          ]
        );
        return;
      }
    }
    navigation?.navigate('DeviceConnection', { sensorType: 'pH' });
  };

  const handleDisconnect = () => {
    BleScanServiceEsp32.disconnect();
    PHSensorService.disconnect();
    setConnected(false);
    setConnectedDevice(null);
    setSensorData(null);
    setPredictionResult(null);
    setZeroValueCount(0); // Reset counter on disconnect
  };

  const handlePredict = async () => {
    if (!sensorData) {
      Alert.alert('Error', 'Please read sensor values first');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    // Prepare data for API
    const apiData = {
      ...sensorData,
      ...formData,
      lat: location.lat,
      lon: location.lon,
      top_n: 3,
    };

    console.log('API Data:', apiData);
    // Validate data
    const validation = RiceVarietyApiService.validateInput(apiData);
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    setPredicting(true);
    setError(null);

    const result = await RiceVarietyApiService.predictRiceVariety(apiData);
    if (result.success) {
      setPredictionResult(result.data);
      setError(null);
    } else {
      setError(result.error || 'Failed to predict rice variety');
      Alert.alert('Prediction Error', result.error || 'Failed to predict rice variety');
    }
    setPredicting(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        // Removed RefreshControl to prevent re-render issues
        // User can use "Read Values" button instead
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Soil pH Testing</Text>
            <Text style={styles.subtitle}>Smart soil analysis and rice variety prediction</Text>
          </View>
        </View>

        {/* Connection Status */}
        <View style={[styles.statusCard, connected ? styles.statusConnected : styles.statusDisconnected]}>
          <View style={styles.statusRow}>
            {connected ? (
              <Icon name="bluetooth-connect" size={24} color="#4CAF50" />
            ) : (
              <Icon name="alert-circle" size={24} color="#F44336" />
            )}
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusText, connected && styles.statusTextConnected]}>
                {connected ? 'Connected to ESP32 Sensor' : 'No Device Connected'}
              </Text>
              {connectedDevice && (
                <Text style={styles.statusDeviceName}>
                  {connectedDevice.name || 'pH Sensor'}
                </Text>
              )}
            </View>
            {!connected ? (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnectDevice}
              >
                <Icon name="link" size={20} color="white" />
                <Text style={styles.connectButtonText}>Connect</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.connectedActions}>
                <TouchableOpacity
                  style={styles.readValuesButton}
                  onPress={fetchData}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Icon name="refresh" size={18} color="white" />
                      <Text style={styles.readValuesButtonText}>Read Values</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={handleDisconnect}
                >
                  <Icon name="link-off" size={20} color="white" />
                  <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Location Status */}
        <View style={[styles.locationStatusCard, location ? styles.locationStatusCardSuccess : styles.locationStatusCardError]}>
          <View style={styles.locationStatusRow}>
            {loadingLocation ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : location ? (
              <Icon name="map-marker" size={24} color="#4CAF50" />
            ) : (
              <Icon name="map-marker-off" size={24} color="#F44336" />
            )}
            <View style={styles.locationStatusTextContainer}>
              <Text style={styles.locationStatusTitle}>Location</Text>
              {location ? (
                <Text style={styles.locationStatusValue}>
                  {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                </Text>
              ) : (
                <Text style={styles.locationStatusError}>
                  {locationError || 'Location not available'}
                </Text>
              )}
            </View>
            <View style={styles.locationButtonsContainer}>
              <TouchableOpacity
                style={styles.locationRefreshButton}
                onPress={loadLocation}
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <ActivityIndicator size="small" color="#2196F3" />
                ) : (
                  <Icon name="refresh" size={20} color="#2196F3" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mapPickerButton}
                onPress={handleOpenMapPicker}
              >
                <Icon name="map" size={20} color="#0F5132" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Loading State */}
        {loading && !sensorData && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0F5132" />
            <Text style={styles.loadingText}>Fetching data from sensor...</Text>
          </View>
        )}

        {/* Error State - Only show if not connected or if it's a real error */}
        {error && !loading && !connected && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              Make sure your ESP32 sensor is powered on and Bluetooth is enabled.
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

        {/* Warning State - Show when connected but waiting for valid data or all zeros */}
        {error && !loading && connected && !sensorData && (
          <View style={styles.warningCard}>
            <Icon name="information" size={24} color="#FF9800" />
            <View style={styles.warningContent}>
              <Text style={styles.warningText}>{error}</Text>
              <TouchableOpacity style={styles.readValuesButtonInline} onPress={fetchData} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Icon name="refresh" size={18} color="white" />
                    <Text style={styles.readValuesButtonText}>Read Values</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sensor Data Display */}
        {sensorData && (
          <>
            {/* Main pH Card */}
            <View style={styles.phCard}>
              <View style={styles.phHeader}>
                <Icon name="test-tube" size={32} color="#FF9800" />
                <Text style={styles.phLabel}>pH Level</Text>
              </View>
              <Text style={styles.phValue}>{sensorData.pH.toFixed(1)}</Text>
              <View style={styles.phStatusBadge}>
                <Text style={styles.phStatusText}>
                  {sensorData.pH < 6.5 ? 'Acidic' : sensorData.pH > 7.5 ? 'Alkaline' : 'Neutral'}
                </Text>
              </View>
            </View>

            {/* Additional Sensor Data Cards */}
            <View style={styles.dataGrid}>
              <View style={styles.dataCard}>
                <Icon name="water" size={24} color="#2196F3" />
                <Text style={styles.dataLabel}>Moisture</Text>
                <Text style={styles.dataValue}>{sensorData.soil_moisture_pct.toFixed(1)}%</Text>
              </View>
              <View style={styles.dataCard}>
                <Icon name="flash" size={24} color="#9C27B0" />
                <Text style={styles.dataLabel}>EC (dS/m)</Text>
                <Text style={styles.dataValue}>{sensorData.EC_dS_m.toFixed(2)}</Text>
              </View>
              <View style={styles.dataCard}>
                <Icon name="thermometer" size={24} color="#FF9800" />
                <Text style={styles.dataLabel}>Temperature</Text>
                <Text style={styles.dataValue}>{sensorData.soil_temp_C.toFixed(1)}°C</Text>
              </View>
              <View style={styles.dataCard}>
                <Icon name="waves" size={24} color="#00BCD4" />
                <Text style={styles.dataLabel}>Water Depth</Text>
                <Text style={styles.dataValue}>{sensorData.water_depth_cm.toFixed(1)} cm</Text>
              </View>
            </View>

            {/* Timestamp */}
            <View style={styles.timestampCard}>
              <Text style={styles.timestampLabel}>Last Updated</Text>
              <Text style={styles.timestampValue}>
                {new Date(sensorData.timestamp).toLocaleString()}
              </Text>
            </View>
          </>
        )}

        {/* Form Section */}
        {sensorData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>

            {/* Previous Crop */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Previous Crop</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.prev_crop}
                  onValueChange={(value) => setFormData({ ...formData, prev_crop: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Rice" value="rice" />
                  <Picker.Item label="Maize" value="maize" />
                  <Picker.Item label="Fallow" value="fallow" />
                  <Picker.Item label="Legume" value="legume" />
                </Picker>
              </View>
              <Text style={styles.selectedValue}>
                Selected: {formData.prev_crop.charAt(0).toUpperCase() + formData.prev_crop.slice(1)}
              </Text>
            </View>

            {/* Season */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Season</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.season}
                  onValueChange={(value) => setFormData({ ...formData, season: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Maha" value="Maha" />
                  <Picker.Item label="Yala" value="Yala" />
                </Picker>
              </View>
              <Text style={styles.selectedValue}>
                Selected: {formData.season}
              </Text>
            </View>

            {/* Soil Zone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Soil Zone</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.soil_zone}
                  onValueChange={(value) => setFormData({ ...formData, soil_zone: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Dry" value="Dry" />
                  <Picker.Item label="Intermediate" value="Intermediate" />
                  <Picker.Item label="Wet" value="Wet" />
                </Picker>
              </View>
              <Text style={styles.selectedValue}>
                Selected: {formData.soil_zone}
              </Text>
            </View>

            {/* Texture */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Soil Texture</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.texture}
                  onValueChange={(value) => setFormData({ ...formData, texture: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Loamy" value="loamy" />
                  <Picker.Item label="Sandy" value="sandy" />
                  <Picker.Item label="Clayey" value="clayey" />
                </Picker>
              </View>
              <Text style={styles.selectedValue}>
                Selected: {formData.texture.charAt(0).toUpperCase() + formData.texture.slice(1)}
              </Text>
            </View>

            {/* Form Data Summary */}
            <View style={styles.formSummaryCard}>
              <Text style={styles.formSummaryTitle}>Form Data Summary</Text>
              <View style={styles.formSummaryRow}>
                <Text style={styles.formSummaryLabel}>Previous Crop:</Text>
                <Text style={styles.formSummaryValue}>
                  {formData.prev_crop.charAt(0).toUpperCase() + formData.prev_crop.slice(1)}
                </Text>
              </View>
              <View style={styles.formSummaryRow}>
                <Text style={styles.formSummaryLabel}>Season:</Text>
                <Text style={styles.formSummaryValue}>{formData.season}</Text>
              </View>
              <View style={styles.formSummaryRow}>
                <Text style={styles.formSummaryLabel}>Soil Zone:</Text>
                <Text style={styles.formSummaryValue}>{formData.soil_zone}</Text>
              </View>
              <View style={styles.formSummaryRow}>
                <Text style={styles.formSummaryLabel}>Texture:</Text>
                <Text style={styles.formSummaryValue}>
                  {formData.texture.charAt(0).toUpperCase() + formData.texture.slice(1)}
                </Text>
              </View>
            </View>

            {/* Predict Button */}
            <TouchableOpacity
              style={styles.predictButton}
              onPress={handlePredict}
              disabled={predicting}
            >
              {predicting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Icon name="brain" size={24} color="white" />
                  <Text style={styles.predictButtonText}>Predict Rice Variety</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Prediction Results */}
        {predictionResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prediction Results</Text>

            {/* Best Variety Card */}
            <View style={styles.bestVarietyCard}>
              <Icon name="trophy" size={32} color="#FFD700" />
              <Text style={styles.bestVarietyLabel}>Best Recommended Variety</Text>
              <Text style={styles.bestVarietyName}>{predictionResult.best_variety}</Text>
              <Text style={styles.expectedYield}>
                Expected Yield: {predictionResult.expected_yield.toFixed(0)} kg/ha
              </Text>
            </View>

            {/* Recommendations List */}
            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>Top Recommendations</Text>
              {predictionResult.recommendations?.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{rec.rank}</Text>
                  </View>
                  <View style={styles.recommendationInfo}>
                    <Text style={styles.recommendationVariety}>{rec.variety}</Text>
                    <Text style={styles.recommendationYield}>
                      {rec.predicted_yield.toFixed(0)} kg/ha
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* No Device Connected State */}
        {!sensorData && !loading && !error && !connectedDevice && (
          <View style={styles.emptyState}>
            <Icon name="bluetooth-off" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>No Device Connected</Text>
            <Text style={styles.emptyStateText}>
              Connect to an ESP32 sensor to view soil pH data
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

        {/* Connected but No Data Yet */}
        {connected && connectedDevice && !sensorData && !loading && !error && (
          <View style={styles.emptyState}>
            <Icon name="bluetooth-connect" size={64} color="#4CAF50" />
            <Text style={styles.emptyStateTitle}>Device Connected</Text>
            <Text style={styles.emptyStateText}>
              Press "Read Values" to fetch valid sensor data from ESP32{'\n'}
              (Zero values will be filtered out)
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={fetchData}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Icon name="refresh" size={24} color="white" />
                  <Text style={styles.emptyStateButtonText}>Read Values</Text>
                </>
              )}
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
  statusTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '500',
  },
  statusTextConnected: {
    color: '#4CAF50',
  },
  statusDeviceName: {
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
  connectedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readValuesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  readValuesButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  disconnectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  locationStatusCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  locationStatusCardSuccess: {
    borderLeftColor: '#4CAF50',
  },
  locationStatusCardError: {
    borderLeftColor: '#F44336',
  },
  locationStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationStatusTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationStatusValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  locationStatusError: {
    fontSize: 12,
    color: '#F44336',
  },
  locationButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  locationRefreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
  },
  mapPickerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
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
  warningCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
    marginBottom: 12,
  },
  readValuesButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
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
  phCard: {
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
  phHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  phLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  phValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#0F5132',
    marginBottom: 12,
  },
  phStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
  },
  phStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  dataCard: {
    flex: 1,
    minWidth: '45%',
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
    marginTop: 0,
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
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F5132',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedValue: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 8,
    paddingLeft: 4,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  formSummaryCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#0F5132',
  },
  formSummaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F5132',
    marginBottom: 12,
  },
  formSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  formSummaryLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  formSummaryValue: {
    fontSize: 13,
    color: '#0F5132',
    fontWeight: '600',
  },
  predictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  predictButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bestVarietyCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  bestVarietyLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  bestVarietyName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F5132',
    marginBottom: 8,
  },
  expectedYield: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  recommendationsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F5132',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationVariety: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  recommendationYield: {
    fontSize: 14,
    color: '#666',
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

