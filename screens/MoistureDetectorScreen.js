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
  Animated,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ESP32Service from '../src/utils/esp32Service';
import BLEService from '../src/utils/bleService';
import { useLanguage } from '../src/context/LanguageContext';

const { width } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    title: 'Seed Moisture Monitor',
    subtitle: 'Real-time sensor data from ESP32',
    connected: 'Connected to ESP32',
    noDevice: 'No Device Connected',
    connect: 'Connect',
    connectDevice: 'Connect Device',
    fetching: 'Fetching data from ESP32...',
    connectionError: 'Connection Error',
    errorHint: 'Make sure your ESP32 is powered on and connected to the same WiFi network.',
    retry: 'Retry',
    moistureLevel: 'Moisture Level',
    temperature: 'Temperature',
    humidity: 'Humidity',
    lastUpdated: 'Last Updated',
    noDeviceTitle: 'No Device Connected',
    noDeviceText: 'Connect to an ESP32 device to view moisture data',
    statusLow: 'Low',
    statusModerate: 'Moderate',
    statusGood: 'Good',
    statusHigh: 'High',
    recommendationLow: 'Water needed immediately',
    recommendationModerate: 'Monitor closely, may need watering soon',
    recommendationGood: 'Optimal moisture level',
    recommendationHigh: 'Moisture level is high, reduce watering',
    noDeviceConnected: 'No device connected',
  },
  සිංහල: {
    title: 'බීජ තෙතමනය මුරකරු',
    subtitle: 'ESP32 වෙතින් තත්‍ය කාලීන සංවේදක දත්ත',
    connected: 'ESP32 වෙත සම්බන්ධ වී ඇත',
    noDevice: 'උපාංගයක් සම්බන්ධ නොවීය',
    connect: 'සම්බන්ධ වන්න',
    connectDevice: 'උපාංගය සම්බන්ධ කරන්න',
    fetching: 'ESP32 වෙතින් දත්ත ලබා ගනිමින්...',
    connectionError: 'සම්බන්ධතා දෝෂය',
    errorHint: 'ඔබේ ESP32 බලයට සම්බන්ධ කර ඇති බවට සහ එකම WiFi ජාලයට සම්බන්ධ වී ඇති බවට වග බලා ගන්න.',
    retry: 'නැවත උත්සාහ කරන්න',
    moistureLevel: 'තෙතමන මට්ටම',
    temperature: 'උෂ්ණත්වය',
    humidity: 'ආර්ද්‍රතාව',
    lastUpdated: 'අවසන් වරට යාවත්කාලීන කරන ලදී',
    noDeviceTitle: 'උපාංගයක් සම්බන්ධ නොවීය',
    noDeviceText: 'තෙතමන දත්ත බැලීමට ESP32 උපාංගයකට සම්බන්ධ වන්න',
    statusLow: 'අඩු',
    statusModerate: 'මධ්‍යම',
    statusGood: 'හොඳ',
    statusHigh: 'ඉහළ',
    recommendationLow: 'වහාම ජලය අවශ්‍ය',
    recommendationModerate: 'සමීපව නිරීක්ෂණය කරන්න, ඉක්මනින් ජලය අවශ්‍ය විය හැක',
    recommendationGood: 'ප්‍රශස්ත තෙතමන මට්ටම',
    recommendationHigh: 'තෙතමන මට්ටම ඉහළය, ජලය අඩු කරන්න',
    noDeviceConnected: 'උපාංගයක් සම්බන්ධ නොවීය',
  },
  தமிழ்: {
    title: 'விதை ஈரப்பத கண்காணிப்பு',
    subtitle: 'ESP32 இலிருந்து நிகழ்நேர சென்சார் தரவு',
    connected: 'ESP32 உடன் இணைக்கப்பட்டது',
    noDevice: 'சாதனம் இணைக்கப்படவில்லை',
    connect: 'இணைக்கவும்',
    connectDevice: 'சாதனத்தை இணைக்கவும்',
    fetching: 'ESP32 இலிருந்து தரவு பெறப்படுகிறது...',
    connectionError: 'இணைப்பு பிழை',
    errorHint: 'உங்கள் ESP32 ஆனது இயக்கத்தில் உள்ளது மற்றும் அதே WiFi நெட்வொர்க்குடன் இணைக்கப்பட்டுள்ளது என்பதை உறுதிப்படுத்தவும்.',
    retry: 'மீண்டும் முயற்சிக்கவும்',
    moistureLevel: 'ஈரப்பத அளவு',
    temperature: 'வெப்பநிலை',
    humidity: 'ஈரப்பதம்',
    lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
    noDeviceTitle: 'சாதனம் இணைக்கப்படவில்லை',
    noDeviceText: 'ஈரப்பத தரவைக் காண ESP32 சாதனத்துடன் இணைக்கவும்',
    statusLow: 'குறைந்த',
    statusModerate: 'மிதமான',
    statusGood: 'நல்ல',
    statusHigh: 'உயர்',
    recommendationLow: 'உடனடியாக நீர் தேவை',
    recommendationModerate: 'நெருக்கமாக கண்காணிக்கவும், விரைவில் நீர்ப்பாசனம் தேவைப்படலாம்',
    recommendationGood: 'உகந்த ஈரப்பத அளவு',
    recommendationHigh: 'ஈரப்பத அளவு உயர்ந்துள்ளது, நீர்ப்பாசனத்தை குறைக்கவும்',
    noDeviceConnected: 'சாதனம் இணைக்கப்படவில்லை',
  },
};

export default function MoistureDetectorScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const t = translations[selectedLanguage];
  const [moistureData, setMoistureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const pollingActive = useRef(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const moistureAnim = useRef(new Animated.Value(0)).current;

  // Fetch data from ESP32 (WiFi or BLE)
  const fetchData = async () => {
    const wifiDevice = ESP32Service.getConnectedDevice();
    const bleDevice = BLEService.getConnectedDevice();
    const device = wifiDevice || bleDevice;
    
    if (!device) {
      setConnected(false);
      setError(t.noDeviceConnected);
      setMoistureData(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    let result;
    if (bleDevice) {
      // Fetch from BLE
      result = await BLEService.readMoistureData();
    } else {
      // Fetch from WiFi
      result = await ESP32Service.fetchMoistureData();
    }
    
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
      const bleDevice = BLEService.getConnectedDevice();
      
      if (bleDevice) {
        // BLE polling - use interval since BLE doesn't have built-in polling
        const pollInterval = setInterval(async () => {
          const result = await BLEService.readMoistureData();
          if (result.success) {
            setMoistureData(result.data);
            setConnected(true);
            setError(null);
          } else {
            setConnected(false);
            setError(result.error);
          }
        }, 5000);
        
        return () => {
          clearInterval(pollInterval);
          pollingActive.current = false;
        };
      } else {
        // WiFi polling
        ESP32Service.startPolling((result) => {
          if (result.success) {
            setMoistureData(result.data);
            setConnected(true);
            setError(null);
          } else {
            setConnected(false);
            setError(result.error);
          }
        }, 5000);
        
        return () => {
          ESP32Service.stopPolling();
          pollingActive.current = false;
        };
      }
    }

    return () => {
      pollingActive.current = false;
    };
  }, [connected]);

  // Check for connected device and fetch data
  useEffect(() => {
    const wifiDevice = ESP32Service.getConnectedDevice();
    const bleDevice = BLEService.getConnectedDevice();
    const device = wifiDevice || bleDevice;
    
    if (device) {
      setConnectedDevice(device);
      fetchData();
    } else {
      setConnected(false);
      setError(t.noDeviceConnected);
    }
  }, []);

  // Listen for navigation focus to refresh connection status
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      const wifiDevice = ESP32Service.getConnectedDevice();
      const bleDevice = BLEService.getConnectedDevice();
      const device = wifiDevice || bleDevice;
      
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
      return { status: t.statusLow, color: '#F44336', recommendation: t.recommendationLow };
    } else if (moisture < 50) {
      return { status: t.statusModerate, color: '#FF9800', recommendation: t.recommendationModerate };
    } else if (moisture < 70) {
      return { status: t.statusGood, color: '#4CAF50', recommendation: t.recommendationGood };
    } else {
      return { status: t.statusHigh, color: '#2196F3', recommendation: t.recommendationHigh };
    }
  };

  const moistureStatus = moistureData ? getMoistureStatus(moistureData.moisture) : null;

  // Animate when data changes
  useEffect(() => {
    if (moistureData) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(moistureAnim, {
          toValue: moistureData.moisture / 100,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
      moistureAnim.setValue(0);
    }
  }, [moistureData]);

  // Calculate circular progress
  const getCircularProgress = () => {
    if (!moistureData) return 0;
    const moisture = moistureData.moisture;
    const circumference = 2 * Math.PI * 70; // radius = 70
    return (moisture / 100) * circumference;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeAreaTop} />
      <View style={styles.safeAreaContent}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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
                <Text style={styles.appName}>{t.title}</Text>
              </View>
              <View style={styles.backButton} />
            </View>
          </View>

          <View style={styles.innerContent}>

        {/* Connection Status */}
        <View style={[styles.statusCard, connected ? styles.statusConnected : styles.statusDisconnected]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIconContainer, { backgroundColor: connected ? '#4CAF50' + '20' : '#F44336' + '20' }]}>
              {connected ? (
                <Icon name="wifi" size={22} color="#4CAF50" />
              ) : (
                <Icon name="alert-circle" size={22} color="#F44336" />
              )}
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusText, connected && styles.statusTextConnected]}>
                {connected ? t.connected : t.noDevice}
              </Text>
              {connectedDevice && (
                <Text style={styles.statusDeviceIp}>
                  {connectedDevice.type === 'ble' 
                    ? `BLE • ${connectedDevice.name || connectedDevice.id?.substring(0, 8)}`
                    : connectedDevice.ip}
                </Text>
              )}
            </View>
            {!connected && (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnectDevice}
              >
                <Icon name="link" size={18} color="white" />
                <Text style={styles.connectButtonText}>{t.connect}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Loading State */}
        {loading && !moistureData && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0F5132" />
            <Text style={styles.loadingText}>{t.fetching}</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>{t.connectionError}</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              {t.errorHint}
            </Text>
            <View style={styles.errorActions}>
              <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                <Text style={styles.retryButtonText}>{t.retry}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.connectDeviceButton}
                onPress={handleConnectDevice}
              >
                <Icon name="link" size={20} color="white" />
                <Text style={styles.connectDeviceButtonText}>{t.connectDevice}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Moisture Data Display */}
        {moistureData && (
          <>
            {/* Main Moisture Card */}
            <Animated.View
              style={[
                styles.moistureCard,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.moistureCardGradient}>
                {/* Main Moisture Display */}
                <View style={styles.moistureDisplayContainer}>
                  <View style={[styles.moistureCircle, { borderColor: moistureStatus.color }]}>
                    <View style={[styles.moistureCircleGradient, { backgroundColor: moistureStatus.color + '08' }]}>
                      <View style={[styles.moistureIconContainer, { backgroundColor: moistureStatus.color + '20' }]}>
                        <Icon name="water" size={40} color={moistureStatus.color} />
                      </View>
                      <Text style={[styles.moistureValue, { color: moistureStatus.color }]}>
                        {moistureData.moisture.toFixed(1)}%
                      </Text>
                      <Text style={styles.moistureLabelSmall}>{t.moistureLevel}</Text>
                    </View>
                  </View>
                </View>

                {/* Status and Recommendation */}
                <View style={styles.moistureInfo}>
                  <View style={[styles.statusBadge, { backgroundColor: moistureStatus.color + '25' }]}>
                    <View style={[styles.statusDot, { backgroundColor: moistureStatus.color }]} />
                    <Text style={[styles.statusBadgeText, { color: moistureStatus.color }]}>
                      {moistureStatus.status}
                    </Text>
                  </View>
                  <View style={styles.recommendationContainer}>
                    <View style={[styles.recommendationIconContainer, { backgroundColor: moistureStatus.color + '15' }]}>
                      <Icon name="lightbulb-on" size={20} color={moistureStatus.color} />
                    </View>
                    <Text style={styles.recommendation}>
                      {moistureStatus.recommendation}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Additional Data Cards */}
            <View style={styles.dataGrid}>
              {moistureData.temperature !== null && (
                <Animated.View
                  style={[
                    styles.dataCard,
                    {
                      opacity: fadeAnim,
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <View style={styles.dataCardGradient}>
                    <View style={[styles.dataIconContainer, { backgroundColor: '#FF9800' + '20' }]}>
                      <Icon name="thermometer" size={28} color="#FF9800" />
                    </View>
                    <Text style={styles.dataLabel}>{t.temperature}</Text>
                    <Text style={styles.dataValue}>{moistureData.temperature.toFixed(1)}°C</Text>
                  </View>
                </Animated.View>
              )}

              {moistureData.humidity !== null && (
                <Animated.View
                  style={[
                    styles.dataCard,
                    {
                      opacity: fadeAnim,
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <View style={styles.dataCardGradient}>
                    <View style={[styles.dataIconContainer, { backgroundColor: '#9C27B0' + '20' }]}>
                      <Icon name="water" size={28} color="#9C27B0" />
                    </View>
                    <Text style={styles.dataLabel}>{t.humidity}</Text>
                    <Text style={styles.dataValue}>{moistureData.humidity.toFixed(1)}%</Text>
                  </View>
                </Animated.View>
              )}
            </View>

            {/* Timestamp */}
            <Animated.View
              style={[
                styles.timestampCard,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <Icon name="clock-outline" size={16} color="#999" />
              <Text style={styles.timestampLabel}>{t.lastUpdated}</Text>
              <Text style={styles.timestampValue}>
                {new Date(moistureData.timestamp).toLocaleString()}
              </Text>
            </Animated.View>
          </>
        )}

        {/* No Device Connected State */}
        {!moistureData && !loading && !error && !connectedDevice && (
          <View style={styles.emptyState}>
            <Icon name="alert-circle" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>{t.noDeviceTitle}</Text>
            <Text style={styles.emptyStateText}>
              {t.noDeviceText}
        </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={handleConnectDevice}
            >
              <Icon name="link" size={24} color="white" />
              <Text style={styles.emptyStateButtonText}>{t.connectDevice}</Text>
            </TouchableOpacity>
          </View>
        )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroHeader: {
    backgroundColor: '#0F5132',
    height: 180,
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
  appName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  innerContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
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
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    elevation: 2,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  statusCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  statusConnected: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  statusDisconnected: {
    borderLeftWidth: 5,
    borderLeftColor: '#F44336',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#F44336',
    fontWeight: '600',
  },
  statusTextConnected: {
    color: '#4CAF50',
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  errorCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 5,
    borderLeftColor: '#F44336',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#C62828',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 15,
    color: '#C62828',
    marginBottom: 14,
    fontWeight: '500',
  },
  errorHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
    fontWeight: '500',
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#F44336',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  connectDeviceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    padding: 14,
    borderRadius: 12,
    gap: 6,
    elevation: 2,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  connectDeviceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  moistureCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  moistureCardGradient: {
    padding: 28,
    alignItems: 'center',
    backgroundColor: '#F8FBF9',
  },
  moistureDisplayContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  moistureCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 5,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  moistureCircleGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  moistureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  circularProgressContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moistureValue: {
    fontSize: 52,
    fontWeight: '900',
    color: '#0F5132',
    marginBottom: 6,
    letterSpacing: -1,
  },
  moistureLabelSmall: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moistureInfo: {
    width: '100%',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 16,
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusBadgeText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    gap: 12,
    width: '100%',
  },
  recommendationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  recommendation: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  dataGrid: {
    flexDirection: 'row',
    marginHorizontal: 4,
    marginBottom: 20,
    gap: 12,
  },
  dataCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  dataCardGradient: {
    padding: 22,
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dataIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  dataLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dataValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F5132',
    letterSpacing: -0.5,
  },
  timestampCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#F8FBF9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  timestampLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  timestampValue: {
    fontSize: 13,
    color: '#666',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    fontWeight: '500',
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F5132',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    elevation: 3,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});


