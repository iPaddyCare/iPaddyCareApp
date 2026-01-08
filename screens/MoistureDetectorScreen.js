import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ESP32Service from '../src/utils/esp32Service';
import BLEService from '../src/utils/bleService';
import WeatherService from '../src/utils/weatherService';
import PredictionService from '../src/utils/predictionService';
import { useLanguage } from '../src/context/LanguageContext';

const { width, height } = Dimensions.get('window');

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
    statusOverDried: 'Over Dried',
    statusGood: 'Good',
    statusNeedsDry: 'Needs to Dry',
    recommendationOverDried: 'Moisture level is too low. Seeds are over dried.',
    recommendationGood: 'Optimal moisture level (12-14%)',
    recommendationNeedsDry: 'Moisture level is too high. Seeds need to dry.',
    noDeviceConnected: 'No device connected',
    startReading: 'Start Reading',
    stopReading: 'Stop Reading',
    readingInProgress: 'Reading in Progress',
    readingProgress: 'Reading Progress',
    readingsCollected: 'Readings Collected',
    of: 'of',
    seconds: 'seconds',
    collectingReadings: 'Collecting readings...',
    liveReading: 'Live Reading',
    averageReading: 'Average Reading',
    viewResults: 'View Results',
    readingComplete: 'Reading Complete',
    readingDuration: 'Reading Duration',
    readingsCount: 'Readings Count',
    capSensor: 'Capacitive Sensor',
    sampleTemp: 'Sample Temperature',
    ambientTemp: 'Ambient Temperature',
    ambientHumidity: 'Ambient Humidity',
    sampleWeight: 'Sample Weight',
    location: 'Location',
    weather: 'Weather',
    celsius: '°C',
    percent: '%',
    grams: 'g',
    connectionInstructions: 'How to Connect Device',
    step1: 'Step 1: Add seeds to the device',
    step2: 'Step 2: Grind seeds using the built-in hand grinder',
    step3: 'Step 3: Turn on the Seed Moisture Detector device',
    step4: 'Step 4: Connect to the device via WiFi or Bluetooth',
    step5: 'Step 5: Tap "Start Reading" to begin measurement',
    instructionsNote: 'Make sure the device is powered on and within range before connecting.',
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
    statusOverDried: 'අධික වියළි',
    statusGood: 'හොඳ',
    statusNeedsDry: 'වියළීම අවශ්‍ය',
    recommendationOverDried: 'තෙතමන මට්ටම ඉතා අඩුය. බීජ වැඩියෙන් වියළී ඇත.',
    recommendationGood: 'ප්‍රශස්ත තෙතමන මට්ටම (12-14%)',
    recommendationNeedsDry: 'තෙතමන මට්ටම ඉහළය. බීජ වියළීම අවශ්‍යයි.',
    noDeviceConnected: 'උපාංගයක් සම්බන්ධ නොවීය',
    startReading: 'කියවීම ආරම්භ කරන්න',
    stopReading: 'කියවීම නවත්වන්න',
    readingInProgress: 'කියවීම සිදුවෙමින් පවතී',
    readingProgress: 'කියවීමේ ප්‍රගතිය',
    readingsCollected: 'එකතු කරන ලද කියවීම්',
    of: 'යි',
    seconds: 'තත්පර',
    collectingReadings: 'කියවීම් එකතු කරමින්...',
    liveReading: 'සජීවී කියවීම',
    averageReading: 'සාමාන්‍ය කියවීම',
    viewResults: 'ප්‍රතිඵල බලන්න',
    readingComplete: 'කියවීම සම්පූර්ණයි',
    readingDuration: 'කියවීමේ කාලය',
    readingsCount: 'කියවීම් ගණන',
    capSensor: 'ධාරිතා සංවේදකය',
    sampleTemp: 'නියමුන උෂ්ණත්වය',
    ambientTemp: 'පරිසර උෂ්ණත්වය',
    ambientHumidity: 'පරිසර ආර්ද්‍රතාව',
    sampleWeight: 'නියමුන බර',
    location: 'ස්ථානය',
    weather: 'කාලගුණය',
    celsius: '°C',
    percent: '%',
    grams: 'g',
    connectionInstructions: 'උපාංගය සම්බන්ධ කරන ආකාරය',
    step1: 'පියවර 1: උපාංගයට බීජ එකතු කරන්න',
    step2: 'පියවර 2: අතින් ක්‍රියාත්මක වන ග්‍රයින්ඩරය භාවිතා කර බීජ ග්‍රයින්ඩ් කරන්න',
    step3: 'පියවර 3: බීජ තෙතමනය අනාවරකය උපාංගය සක්‍රිය කරන්න',
    step4: 'පියවර 4: WiFi හෝ Bluetooth හරහා උපාංගයට සම්බන්ධ වන්න',
    step5: 'පියවර 5: මිනුම ආරම්භ කිරීමට "කියවීම ආරම්භ කරන්න" ඔබන්න',
    instructionsNote: 'සම්බන්ධ කිරීමට පෙර උපාංගය සක්‍රිය කර ඇති බවට සහ පරාසය තුළ ඇති බවට වග බලා ගන්න.',
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
    statusOverDried: 'அதிகமாக உலர்ந்தது',
    statusGood: 'நல்ல',
    statusNeedsDry: 'உலர்த்த வேண்டும்',
    recommendationOverDried: 'ஈரப்பத அளவு மிகவும் குறைவாக உள்ளது. விதைகள் அதிகமாக உலர்ந்துள்ளன.',
    recommendationGood: 'உகந்த ஈரப்பத அளவு (12-14%)',
    recommendationNeedsDry: 'ஈரப்பத அளவு அதிகமாக உள்ளது. விதைகளை உலர்த்த வேண்டும்.',
    noDeviceConnected: 'சாதனம் இணைக்கப்படவில்லை',
    startReading: 'வாசிப்பைத் தொடங்கவும்',
    stopReading: 'வாசிப்பை நிறுத்தவும்',
    readingInProgress: 'வாசிப்பு நடந்து கொண்டிருக்கிறது',
    readingProgress: 'வாசிப்பு முன்னேற்றம்',
    readingsCollected: 'சேகரிக்கப்பட்ட வாசிப்புகள்',
    of: 'இல்',
    seconds: 'வினாடிகள்',
    collectingReadings: 'வாசிப்புகளை சேகரிக்கிறது...',
    liveReading: 'நேரடி வாசிப்பு',
    averageReading: 'சராசரி வாசிப்பு',
    viewResults: 'முடிவுகளைக் காண்க',
    readingComplete: 'வாசிப்பு முடிந்தது',
    readingDuration: 'வாசிப்பு காலம்',
    readingsCount: 'வாசிப்புகள் எண்ணிக்கை',
    capSensor: 'கொள்ளளவு சென்சார்',
    sampleTemp: 'மாதிரி வெப்பநிலை',
    ambientTemp: 'சுற்றுப்புற வெப்பநிலை',
    ambientHumidity: 'சுற்றுப்புற ஈரப்பதம்',
    sampleWeight: 'மாதிரி எடை',
    location: 'இடம்',
    weather: 'வானிலை',
    celsius: '°C',
    percent: '%',
    grams: 'g',
    connectionInstructions: 'சாதனத்தை இணைக்கும் வழிமுறை',
    step1: 'படி 1: சாதனத்தில் விதைகளை சேர்க்கவும்',
    step2: 'படி 2: உள்ளமைக்கப்பட்ட கை அரைப்பான் பயன்படுத்தி விதைகளை அரைக்கவும்',
    step3: 'படி 3: விதை ஈரப்பத கண்டறியும் சாதனத்தை இயக்கவும்',
    step4: 'படி 4: WiFi அல்லது Bluetooth மூலம் சாதனத்துடன் இணைக்கவும்',
    step5: 'படி 5: அளவீட்டைத் தொடங்க "வாசிப்பைத் தொடங்கவும்" என்பதைத் தட்டவும்',
    instructionsNote: 'இணைப்பதற்கு முன் சாதனம் இயக்கத்தில் உள்ளது மற்றும் வரம்பிற்குள் உள்ளது என்பதை உறுதிப்படுத்தவும்.',
  },
};

export default function MoistureDetectorScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
  const [moistureData, setMoistureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const pollingActive = useRef(false);
  
  // Reading session state
  const [isReading, setIsReading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingDuration, setReadingDuration] = useState(0);
  const [readings, setReadings] = useState([]);
  const [liveReading, setLiveReading] = useState(null);
  const readingIntervalRef = useRef(null);
  const readingTimerRef = useRef(null);
  const readingStartTimeRef = useRef(null);
  const TARGET_READINGS = 10; // Collect 10 readings over 5 seconds
  const READING_DURATION = 5; // 5 seconds total
  
  // Weather state
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const moistureAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  // Fetch weather data on mount
  useEffect(() => {
    const loadWeather = async () => {
      setLoadingWeather(true);
      const result = await WeatherService.getCurrentWeather(true); // Use Malabe for demo
      if (result.success) {
        setWeatherData(result.data);
      }
      setLoadingWeather(false);
    };
    loadWeather();
  }, []);

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

  // Start reading session
  const startReading = async () => {
    if (!connected) {
      Alert.alert(t.error, t.noDeviceConnected);
      return;
    }

    setIsReading(true);
    setReadings([]);
    setReadingProgress(0);
    setReadingDuration(0);
    setLiveReading(null);
    readingStartTimeRef.current = Date.now();

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: READING_DURATION * 1000,
      useNativeDriver: false,
    }).start();

    // Update duration every second
    readingTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - readingStartTimeRef.current) / 1000);
      setReadingDuration(elapsed);
      setReadingProgress((elapsed / READING_DURATION) * 100);
    }, 1000);

    // Collect readings every 0.5 seconds (10 readings in 5 seconds)
    const interval = (READING_DURATION * 1000) / TARGET_READINGS;
    readingIntervalRef.current = setInterval(async () => {
      const wifiDevice = ESP32Service.getConnectedDevice();
      const bleDevice = BLEService.getConnectedDevice();
      
      let result;
      if (bleDevice) {
        result = await BLEService.readMoistureData();
      } else {
        result = await ESP32Service.fetchMoistureData();
      }

      if (result.success && result.data) {
        const reading = {
          // Capacitive sensor
          capSensorValue: result.data.moisture,
          // Sample temperature (DS18B20)
          sampleTemperature: result.data.sampleTemperature,
          // Ambient temperature (DHT22)
          ambientTemperature: result.data.ambientTemperature,
          // Ambient humidity (DHT22)
          ambientHumidity: result.data.ambientHumidity,
          // Sample weight (Load cell + HX711)
          sampleWeight: result.data.sampleWeight,
          // Legacy fields
          moisture: result.data.moisture,
          temperature: result.data.ambientTemperature || result.data.temperature,
          humidity: result.data.ambientHumidity || result.data.humidity,
          timestamp: new Date().toISOString(),
        };
        
        setLiveReading(reading);
        setReadings(prev => [...prev, reading]);
      }
    }, interval);

    // Auto-stop after READING_DURATION
    setTimeout(() => {
      stopReading();
    }, READING_DURATION * 1000);
  };

  // Stop reading session
  const stopReading = () => {
    setIsReading(false);
    
    if (readingIntervalRef.current) {
      clearInterval(readingIntervalRef.current);
      readingIntervalRef.current = null;
    }
    
    if (readingTimerRef.current) {
      clearInterval(readingTimerRef.current);
      readingTimerRef.current = null;
    }

    progressAnim.setValue(0);

    // Calculate average and navigate to results
    if (readings.length > 0) {
      const averageMoisture = readings.reduce((sum, r) => sum + r.moisture, 0) / readings.length;
      const averageCapSensor = readings.reduce((sum, r) => sum + (r.capSensorValue || 0), 0) / readings.length;
      const averageSampleTemp = readings.reduce((sum, r) => sum + (r.sampleTemperature || 0), 0) / readings.length;
      const averageAmbientTemp = readings.reduce((sum, r) => sum + (r.ambientTemperature || 0), 0) / readings.length;
      const averageAmbientHumidity = readings.reduce((sum, r) => sum + (r.ambientHumidity || 0), 0) / readings.length;
      const averageSampleWeight = readings.reduce((sum, r) => sum + (r.sampleWeight || 0), 0) / readings.length;

      // Fetch weather data
      WeatherService.getCurrentWeather(true).then(weatherResult => {
        const readingData = {
          averageMoisture,
          averageCapSensor,
          averageSampleTemp,
          averageAmbientTemp,
          averageAmbientHumidity,
          averageSampleWeight,
          temperature: averageAmbientTemp || null,
          humidity: averageAmbientHumidity || null,
          weather: weatherResult.success ? weatherResult.data : null,
          readings: readings,
          duration: readingDuration,
        };

        // Navigate to results screen
        navigation?.navigate('ReadingResults', { readingData });
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (readingIntervalRef.current) {
        clearInterval(readingIntervalRef.current);
      }
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
      }
    };
  }, []);

  // Get moisture status and recommendation
  // Thresholds: Below 12 = Over dried, 12-14 = Good, Above 14 = Needs to dry
  const getMoistureStatus = (moisture) => {
    if (moisture < 12) {
      return { status: t.statusOverDried, color: '#F44336', recommendation: t.recommendationOverDried };
    } else if (moisture >= 12 && moisture <= 14) {
      return { status: t.statusGood, color: '#4CAF50', recommendation: t.recommendationGood };
    } else {
      return { status: t.statusNeedsDry, color: '#FF9800', recommendation: t.recommendationNeedsDry };
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        <View style={styles.statusBarContainer} />
      </SafeAreaView>
      <SafeAreaView style={styles.safeAreaContent} edges={['left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 72 + insets.bottom + 20 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Hero Header */}
          <View style={styles.heroHeader}>
            <View style={styles.headerPattern} />
            <View style={styles.headerPattern2} />
            <View style={styles.headerContent}>
              {/* Menu Button */}
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => navigation.openDrawer()}
              >
                <Text style={styles.menuIcon}>☰</Text>
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{t.title}</Text>
              </View>
              <View style={styles.backButtonPlaceholder} />
            </View>
          </View>

          <View style={styles.innerContent}>

        {/* Weather Card */}
        {weatherData && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherRow}>
              <View style={styles.weatherIconContainer}>
                <Icon name="weather-partly-cloudy" size={24} color="#0F5132" />
              </View>
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherLocation}>{t.location}: Malabe</Text>
                <Text style={styles.weatherDescription}>
                  {weatherData.temperature.toFixed(1)}{t.celsius} • {weatherData.description}
                </Text>
              </View>
            </View>
          </View>
        )}

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

        {/* Start Reading Button */}
        {connected && !isReading && (
          <TouchableOpacity
            style={styles.startReadingButton}
            onPress={startReading}
          >
            <Icon name="play-circle" size={28} color="white" />
            <Text style={styles.startReadingButtonText}>{t.startReading}</Text>
          </TouchableOpacity>
        )}

        {/* Reading Session UI */}
        {isReading && (
          <View style={styles.readingSessionCard}>
            <View style={styles.readingSessionHeader}>
              <Icon name="chart-line" size={24} color="#0F5132" />
              <Text style={styles.readingSessionTitle}>{t.readingInProgress}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {t.readingsCollected}: {readings.length} {t.of} {TARGET_READINGS}
                </Text>
                <Text style={styles.progressText}>
                  {readingDuration} {t.seconds} / {READING_DURATION} {t.seconds}
                </Text>
              </View>
            </View>

            {/* Live Reading Display */}
            {liveReading && (
              <View style={styles.liveReadingCard}>
                <View style={styles.liveReadingHeader}>
                  <Icon name="pulse" size={20} color="#4CAF50" />
                  <Text style={styles.liveReadingTitle}>{t.liveReading}</Text>
                </View>
                
                {/* All Sensor Readings - Always show all 5 sensors */}
                <View style={styles.sensorReadingsGrid}>
                  {/* Capacitive Sensor */}
                  <View style={styles.sensorReadingItem}>
                    <Icon name="water" size={18} color="#2196F3" />
                    <Text style={styles.sensorReadingLabel}>{t.capSensor}</Text>
                    <Text style={styles.sensorReadingValue}>
                      {liveReading.capSensorValue !== null && liveReading.capSensorValue !== undefined
                        ? `${liveReading.capSensorValue.toFixed(1)}${t.percent}`
                        : liveReading.moisture !== null && liveReading.moisture !== undefined
                        ? `${liveReading.moisture.toFixed(1)}${t.percent}`
                        : `0.0${t.percent}`}
                    </Text>
                  </View>

                  {/* Sample Temperature (DS18B20) */}
                  <View style={styles.sensorReadingItem}>
                    <Icon name="thermometer" size={18} color="#FF9800" />
                    <Text style={styles.sensorReadingLabel}>{t.sampleTemp}</Text>
                    <Text style={styles.sensorReadingValue}>
                      {liveReading.sampleTemperature !== null && liveReading.sampleTemperature !== undefined
                        ? `${liveReading.sampleTemperature.toFixed(1)}${t.celsius}`
                        : `--${t.celsius}`}
                    </Text>
                  </View>

                  {/* Ambient Temperature (DHT22) */}
                  <View style={styles.sensorReadingItem}>
                    <Icon name="thermometer-lines" size={18} color="#F44336" />
                    <Text style={styles.sensorReadingLabel}>{t.ambientTemp}</Text>
                    <Text style={styles.sensorReadingValue}>
                      {liveReading.ambientTemperature !== null && liveReading.ambientTemperature !== undefined
                        ? `${liveReading.ambientTemperature.toFixed(1)}${t.celsius}`
                        : `--${t.celsius}`}
                    </Text>
                  </View>

                  {/* Ambient Humidity (DHT22) */}
                  <View style={styles.sensorReadingItem}>
                    <Icon name="water-percent" size={18} color="#9C27B0" />
                    <Text style={styles.sensorReadingLabel}>{t.ambientHumidity}</Text>
                    <Text style={styles.sensorReadingValue}>
                      {liveReading.ambientHumidity !== null && liveReading.ambientHumidity !== undefined
                        ? `${liveReading.ambientHumidity.toFixed(1)}${t.percent}`
                        : `--${t.percent}`}
                    </Text>
                  </View>

                  {/* Sample Weight (Load cell + HX711) */}
                  <View style={styles.sensorReadingItem}>
                    <Icon name="scale-balance" size={18} color="#4CAF50" />
                    <Text style={styles.sensorReadingLabel}>{t.sampleWeight}</Text>
                    <Text style={styles.sensorReadingValue}>
                      {liveReading.sampleWeight !== null && liveReading.sampleWeight !== undefined
                        ? `${liveReading.sampleWeight.toFixed(1)}${t.grams}`
                        : `--${t.grams}`}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Stop Button */}
            <TouchableOpacity
              style={styles.stopReadingButton}
              onPress={stopReading}
            >
              <Icon name="stop-circle" size={24} color="white" />
              <Text style={styles.stopReadingButtonText}>{t.stopReading}</Text>
            </TouchableOpacity>
          </View>
        )}

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

        {/* Connection Instructions - Show when not reading */}
        {!isReading && (
          <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
              <Icon name="information" size={24} color="#0F5132" />
              <Text style={styles.instructionsTitle}>{t.connectionInstructions}</Text>
            </View>
            <View style={styles.stepsContainer}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>{t.step1}</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>{t.step2}</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>{t.step3}</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>{t.step4}</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>5</Text>
                </View>
                <Text style={styles.stepText}>{t.step5}</Text>
              </View>
            </View>
            <View style={styles.instructionsNote}>
              <Icon name="lightbulb-outline" size={16} color="#666" />
              <Text style={styles.instructionsNoteText}>{t.instructionsNote}</Text>
            </View>
          </View>
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
      </SafeAreaView>
    </View>
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
  statusBarContainer: {
    height: 0,
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
    height: height * 0.2,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerPattern: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: [{ rotate: '45deg' }],
  },
  headerPattern2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    zIndex: 1,
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    top: 24,
    left: 16,
    zIndex: 10,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  menuIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  backButtonPlaceholder: {
    width: 48,
    height: 48,
    position: 'absolute',
    right: 24,
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
  startReadingButton: {
    marginHorizontal: 4,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    elevation: 4,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startReadingButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  readingSessionCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 24,
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
  readingSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  readingSessionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F5132',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  liveReadingCard: {
    backgroundColor: '#F8FBF9',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  liveReadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  liveReadingTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveReadingValue: {
    alignItems: 'center',
    marginBottom: 8,
  },
  liveReadingNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#4CAF50',
    letterSpacing: -1,
  },
  liveReadingSubtext: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  stopReadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
    elevation: 2,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  stopReadingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  weatherCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F7F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherInfo: {
    flex: 1,
  },
  weatherLocation: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 4,
  },
  weatherDescription: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  sensorReadingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
    justifyContent: 'space-between',
  },
  sensorReadingItem: {
    width: '48%',
    backgroundColor: '#F8FBF9',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  sensorReadingLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 4,
    textAlign: 'center',
  },
  sensorReadingValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F5132',
  },
  instructionsCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 24,
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
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F5132',
  },
  stepsContainer: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F5132',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    lineHeight: 22,
    paddingTop: 4,
  },
  instructionsNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8FBF9',
    borderRadius: 12,
  },
  instructionsNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    lineHeight: 20,
  },
});


