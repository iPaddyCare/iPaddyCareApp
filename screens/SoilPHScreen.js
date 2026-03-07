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
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PHSensorService from '../src/utils/phSensorService';
import LocationService from '../src/utils/locationService';
import RiceVarietyApiService from '../src/utils/riceVarietyApiService';
import BluetoothPermissionService from '../src/utils/bluetoothPermissionService';
import BleScanServiceEsp32 from '../src/utils/BleScanServiceEsp32';
import { useLanguage } from '../src/context/LanguageContext';

const { width, height } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    title: 'Soil Analysis',
    subtitle: 'Smart soil analysis and rice variety prediction',
    connected: 'Connected to ESP32 Sensor',
    noDevice: 'No Device Connected',
    connect: 'Connect',
    connectDevice: 'Connect Device',
    readValues: 'Read Values',
    disconnect: 'Disconnect',
    location: 'Location',
    locationNotAvailable: 'Location not available',
    connectionError: 'Connection Error',
    errorHint: 'Make sure your ESP32 sensor is powered on and Bluetooth is enabled.',
    retry: 'Retry',
    fetching: 'Fetching data from sensor...',
    permissionRequired: 'Permission Required',
    permissionMessage: 'Bluetooth permissions are required to connect to sensors. Please grant permissions in app settings.',
    cancel: 'Cancel',
    openSettings: 'Open Settings',
    error: 'Error',
    readSensorFirst: 'Please read sensor values first',
    validationError: 'Validation Error',
    predictionError: 'Prediction Error',
    predictFailed: 'Failed to predict rice variety',
    phLevel: 'pH Level',
    acidic: 'Acidic',
    alkaline: 'Alkaline',
    neutral: 'Neutral',
    moisture: 'Moisture',
    ec: 'EC (dS/m)',
    temperature: 'Temperature',
    waterDepth: 'Water Depth',
    lastUpdated: 'Last Updated',
    additionalInfo: 'Additional Information',
    previousCrop: 'Previous Crop',
    cropRice: 'Rice',
    cropVegetable: 'Vegetable',
    cropMaize: 'Maize',
    cropFallow: 'Fallow',
    cropLegume: 'Legume',
    season: 'Season',
    maha: 'Maha',
    yala: 'Yala',
    soilZone: 'Soil Zone',
    zoneDry: 'Dry',
    zoneIntermediate: 'Intermediate',
    zoneWet: 'Wet',
    waterDepthCm: 'Water Depth (cm)',
    enterWaterDepth: 'Enter water depth',
    notSet: 'Not set',
    soilTexture: 'Soil Texture',
    textureLoamy: 'Loamy',
    textureSandy: 'Sandy',
    textureClayey: 'Clayey',
    formSummary: 'Form Data Summary',
    predictRiceVariety: 'Predict Rice Variety',
    predictionResults: 'Prediction Results',
    bestVariety: 'Best Recommended Variety',
    expectedYield: 'Expected Yield',
    topRecommendations: 'Top Recommendations',
    noDeviceTitle: 'No Device Connected',
    noDeviceText: 'Connect to an ESP32 sensor to view soil pH data',
    deviceConnected: 'Device Connected',
    pressReadValues: 'Press "Read Values" to fetch valid sensor data from ESP32',
    zeroValuesFiltered: '(Zero values will be filtered out)',
    selected: 'Selected',
    entered: 'Entered',
    kgHa: 'kg/ha',
    waitingForData: 'Waiting for valid sensor data (filtering zero values)...',
    waitingForSensorData: 'Waiting for sensor data...',
    allZerosRetry: 'All sensor values are zero. Click "Read Values" again to retry.',
    gatheringData: 'Gathering data',
    of: 'of',
    readings: 'readings',
    gatheringProgress: 'Gathering sensor readings...',
  },
  සිංහල: {
    title: 'මිරිදිය pH පරීක්ෂණය',
    subtitle: 'බුද්ධිමත් පස් විශ්ලේෂණය සහ වී ප්‍රභේද අනාවැකිය',
    connected: 'ESP32 සංවේදකයට සම්බන්ධ වී ඇත',
    noDevice: 'උපාංගයක් සම්බන්ධ නොවීය',
    connect: 'සම්බන්ධ වන්න',
    connectDevice: 'උපාංගය සම්බන්ධ කරන්න',
    readValues: 'අගයන් කියවන්න',
    disconnect: 'බිඳින්න',
    location: 'ස්ථානය',
    locationNotAvailable: 'ස්ථානය ලබා ගත නොහැක',
    connectionError: 'සම්බන්ධතා දෝෂය',
    errorHint: 'ඔබේ ESP32 සංවේදකය බලයට සම්බන්ධ කර ඇති බවට සහ Bluetooth සක්‍රිය කර ඇති බවට වග බලා ගන්න.',
    retry: 'නැවත උත්සාහ කරන්න',
    fetching: 'සංවේදකයෙන් දත්ත ලබා ගනිමින්...',
    permissionRequired: 'අවසරය අවශ්‍යයි',
    permissionMessage: 'සංවේදක සම්බන්ධ කිරීමට Bluetooth අවසර අවශ්‍යයි. කරුණාකර යෙදුම් සැකසුම්වල අවසර ලබා දෙන්න.',
    cancel: 'අවලංගු කරන්න',
    openSettings: 'සැකසුම් අරින්න',
    error: 'දෝෂය',
    readSensorFirst: 'කරුණාකර පළමුව සංවේදක අගයන් කියවන්න',
    validationError: 'සත්‍යාපන දෝෂය',
    predictionError: 'අනාවැකි දෝෂය',
    predictFailed: 'වී ප්‍රභේද අනාවැකිය ලබා ගත නොහැකි විය',
    phLevel: 'pH මට්ටම',
    acidic: 'අම්ලික',
    alkaline: 'ක්ෂාර',
    neutral: 'උදාසීන',
    moisture: 'ආර්ද්‍රතාව',
    ec: 'EC (dS/m)',
    temperature: 'උෂ්ණත්වය',
    waterDepth: 'ජල ගැඹුර',
    lastUpdated: 'අවසන් වරට යාවත්කාලීන කරන ලදී',
    additionalInfo: 'අමතර තොරතුරු',
    previousCrop: 'පෙර බෝගය',
    cropRice: 'වී',
    cropVegetable: 'එළවළු',
    cropMaize: 'බඩ ඉරිඟු',
    cropFallow: 'හිස්',
    cropLegume: 'පර්යන්ත',
    season: 'ඍතුව',
    maha: 'මහ',
    yala: 'යල',
    soilZone: 'පස් කලාපය',
    zoneDry: 'වියළි',
    zoneIntermediate: 'මධ්‍යම',
    zoneWet: 'තෙත්',
    waterDepthCm: 'ජල ගැඹුර (සෙ.මී.)',
    enterWaterDepth: 'ජල ගැඹුර ඇතුළත් කරන්න',
    notSet: 'සකසා නැත',
    soilTexture: 'පස් වයිනය',
    textureLoamy: 'ලොම්',
    textureSandy: 'වැලි',
    textureClayey: 'මැටි',
    formSummary: 'පෝරම් දත්ත සාරාංශය',
    predictRiceVariety: 'වී ප්‍රභේද අනාවැකිය',
    predictionResults: 'අනාවැකි ප්‍රතිඵල',
    bestVariety: 'හොඳම නිර්දේශිත ප්‍රභේදය',
    expectedYield: 'අපේක්ෂිත අස්වැන්න',
    topRecommendations: 'ඉහළ නිර්දේශ',
    noDeviceTitle: 'උපාංගයක් සම්බන්ධ නොවීය',
    noDeviceText: 'මිරිදිය pH දත්ත බැලීමට ESP32 සංවේදකයකට සම්බන්ධ වන්න',
    deviceConnected: 'උපාංගය සම්බන්ධ වී ඇත',
    pressReadValues: 'වලංගු සංවේදක දත්ත ලබා ගැනීමට "අගයන් කියවන්න" ඔබන්න',
    zeroValuesFiltered: '(ශුන්‍ය අගයන් පෙරහන ලැබේ)',
    selected: 'තෝරා ඇත',
    entered: 'ඇතුළත් කළා',
    kgHa: 'කි.ග්‍රෑ./හෙක්.',
    waitingForData: 'වලංගු සංවේදක දත්ත බලා සිටිමින් (ශුන්‍ය අගයන් පෙරහන ලැබේ)...',
    waitingForSensorData: 'සංවේදක දත්ත බලා සිටිමින්...',
    allZerosRetry: 'සියලු සංවේදක අගයන් ශුන්‍යයි. නැවත උත්සාහ කිරීමට "අගයන් කියවන්න" ඔබන්න.',
    gatheringData: 'දත්ත එකතු කිරීම',
    of: 'යි',
    readings: 'කියවීම්',
    gatheringProgress: 'සංවේදක කියවීම් එකතු කරමින්...',
  },
  தமிழ்: {
    title: 'மண் pH சோதனை',
    subtitle: 'ஸ்மார்ட் மண் பகுப்பாய்வு மற்றும் நெல் வகை கணிப்பு',
    connected: 'ESP32 சென்சாருடன் இணைக்கப்பட்டது',
    noDevice: 'சாதனம் இணைக்கப்படவில்லை',
    connect: 'இணைக்கவும்',
    connectDevice: 'சாதனத்தை இணைக்கவும்',
    readValues: 'மதிப்புகளைப் படிக்கவும்',
    disconnect: 'துண்டிக்கவும்',
    location: 'இடம்',
    locationNotAvailable: 'இடம் கிடைக்கவில்லை',
    connectionError: 'இணைப்பு பிழை',
    errorHint: 'உங்கள் ESP32 சென்சார் இயக்கத்தில் உள்ளது மற்றும் Bluetooth இயக்கப்பட்டுள்ளது என்பதை உறுதிப்படுத்தவும்.',
    retry: 'மீண்டும் முயற்சிக்கவும்',
    fetching: 'சென்சாரிலிருந்து தரவு பெறப்படுகிறது...',
    permissionRequired: 'அனுமதி தேவை',
    permissionMessage: 'சென்சார்களுடன் இணைக்க Bluetooth அனுமதிகள் தேவை. தயவுசெய்து பயன்பாட்டு அமைப்புகளில் அனுமதிகளை வழங்கவும்.',
    cancel: 'ரத்து',
    openSettings: 'அமைப்புகளைத் திறக்கவும்',
    error: 'பிழை',
    readSensorFirst: 'தயவுசெய்து முதலில் சென்சார் மதிப்புகளைப் படிக்கவும்',
    validationError: 'சரிபார்ப்பு பிழை',
    predictionError: 'கணிப்பு பிழை',
    predictFailed: 'நெல் வகையை கணிக்க முடியவில்லை',
    phLevel: 'pH அளவு',
    acidic: 'அமில',
    alkaline: 'கார',
    neutral: 'நடுநிலை',
    moisture: 'ஈரப்பதம்',
    ec: 'EC (dS/m)',
    temperature: 'வெப்பநிலை',
    waterDepth: 'நீர் ஆழம்',
    lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
    additionalInfo: 'கூடுதல் தகவல்',
    previousCrop: 'முந்தைய பயிர்',
    cropRice: 'நெல்',
    cropVegetable: 'காய்கறி',
    cropMaize: 'மக்காச்சோளம்',
    cropFallow: 'வீடு',
    cropLegume: 'பருப்பு',
    season: 'பருவம்',
    maha: 'மகா',
    yala: 'யாலா',
    soilZone: 'மண் மண்டலம்',
    zoneDry: 'வறண்ட',
    zoneIntermediate: 'இடைநிலை',
    zoneWet: 'ஈரமான',
    waterDepthCm: 'நீர் ஆழம் (செ.மீ.)',
    enterWaterDepth: 'நீர் ஆழத்தை உள்ளிடவும்',
    notSet: 'அமைக்கப்படவில்லை',
    soilTexture: 'மண் அமைப்பு',
    textureLoamy: 'களிமண்',
    textureSandy: 'மணல்',
    textureClayey: 'களிமண்',
    formSummary: 'படிவ தரவு சுருக்கம்',
    predictRiceVariety: 'நெல் வகையை கணிக்கவும்',
    predictionResults: 'கணிப்பு முடிவுகள்',
    bestVariety: 'சிறந்த பரிந்துரைக்கப்பட்ட வகை',
    expectedYield: 'எதிர்பார்க்கப்படும் மகசூல்',
    topRecommendations: 'முதன்மை பரிந்துரைகள்',
    noDeviceTitle: 'சாதனம் இணைக்கப்படவில்லை',
    noDeviceText: 'மண் pH தரவைக் காண ESP32 சென்சாருடன் இணைக்கவும்',
    deviceConnected: 'சாதனம் இணைக்கப்பட்டது',
    pressReadValues: 'செல்லுபடியான சென்சார் தரவைப் பெற "மதிப்புகளைப் படிக்கவும்" என்பதை அழுத்தவும்',
    zeroValuesFiltered: '(பூஜ்ய மதிப்புகள் வடிகட்டப்படும்)',
    selected: 'தேர்ந்தெடுக்கப்பட்டது',
    entered: 'உள்ளிடப்பட்டது',
    kgHa: 'கி.கி/ஹெக்.',
    waitingForData: 'செல்லுபடியான சென்சார் தரவைக் காத்திருக்கிறது (பூஜ்ய மதிப்புகள் வடிகட்டப்படுகின்றன)...',
    waitingForSensorData: 'சென்சார் தரவைக் காத்திருக்கிறது...',
    allZerosRetry: 'அனைத்து சென்சார் மதிப்புகளும் பூஜ்யம். மீண்டும் முயற்சிக்க "மதிப்புகளைப் படிக்கவும்" என்பதை அழுத்தவும்.',
    gatheringData: 'தரவை சேகரித்தல்',
    of: 'இல்',
    readings: 'வாசிப்புகள்',
    gatheringProgress: 'சென்சார் வாசிப்புகளை சேகரிக்கிறது...',
  },
};

export default function SoilPHScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
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

  // Gather 10 readings from BLE then average (only update UI on "Read Values" click)
  const GATHER_COUNT = 10;
  const [isGathering, setIsGathering] = useState(false);
  const [gatheringCount, setGatheringCount] = useState(0);
  const [liveGatheringData, setLiveGatheringData] = useState(null); // Current reading during gather (for progress UI)
  const lastGatheringAddTime = useRef(0);
  const gatheringIntervalRef = useRef(null);
  const gatheringReadingsRef = useRef([]);
  const gatheringStartTimeRef = useRef(0);
  const GATHER_TIMEOUT_MS = 120000; // 2 min max to collect 10 readings

  // Form fields
  const [formData, setFormData] = useState({
    prev_crop: 'rice',
    season: 'Maha',
    soil_zone: 'Intermediate',
    texture: 'loamy',
    water_depth_cm: 0,
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

  // Compute average of gathered readings
  const averageReadings = (readings) => {
    if (!readings || readings.length === 0) return null;
    const n = readings.length;
    return {
      pH: parseFloat((readings.reduce((s, r) => s + (parseFloat(r.pH) || 0), 0) / n).toFixed(1)),
      soil_moisture_pct: parseFloat((readings.reduce((s, r) => s + (parseFloat(r.soil_moisture_pct) || 0), 0) / n).toFixed(1)),
      EC_dS_m: parseFloat((readings.reduce((s, r) => s + (parseFloat(r.EC_dS_m) || 0), 0) / n).toFixed(2)),
      soil_temp_C: parseFloat((readings.reduce((s, r) => s + (parseFloat(r.soil_temp_C) || 0), 0) / n).toFixed(1)),
      water_depth_cm: parseFloat((readings.reduce((s, r) => s + (parseFloat(r.water_depth_cm) || 0), 0) / n).toFixed(1)),
      timestamp: new Date().toISOString(),
    };
  };

  // Fetch data from sensor (BLE: gather 10 readings then average; non-BLE: single read)
  const fetchData = async () => {
    const bleDevice = BleScanServiceEsp32.getConnectedDevice();
    const phDevice = PHSensorService.getConnectedDevice();
    const device = bleDevice || phDevice;

    if (!device) {
      setConnected(false);
      setError(t.noDevice);
      setSensorData(null);
      setZeroValueCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    // BLE: gather 10 readings then average; UI updates only when done (no real-time updates)
    if (bleDevice) {
      // Clear any previous gathering interval
      if (gatheringIntervalRef.current) {
        clearInterval(gatheringIntervalRef.current);
        gatheringIntervalRef.current = null;
      }
      gatheringReadingsRef.current = [];
      lastGatheringAddTime.current = 0;
      gatheringStartTimeRef.current = Date.now();
      setIsGathering(true);
      setGatheringCount(0);
      setLiveGatheringData(null);

      gatheringIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - gatheringStartTimeRef.current;
        if (elapsed > GATHER_TIMEOUT_MS) {
          clearInterval(gatheringIntervalRef.current);
          gatheringIntervalRef.current = null;
          setIsGathering(false);
          setLoading(false);
          setGatheringCount(0);
          setLiveGatheringData(null);
          const arr = gatheringReadingsRef.current;
          if (arr.length >= 1) {
            setSensorData(averageReadings(arr));
            setConnected(true);
            setError(null);
            setZeroValueCount(0);
          } else {
            setError(t.waitingForData);
          }
          return;
        }

        const latestData = BleScanServiceEsp32.getLatestData();
        if (!latestData || !hasValidData(latestData)) return;

        const now = Date.now();
        const canAdd = gatheringReadingsRef.current.length === 0 || (now - lastGatheringAddTime.current >= 4000);
        if (!canAdd) return;

        const formatted = {
          pH: parseFloat(latestData.pH) || 0,
          soil_moisture_pct: parseFloat(latestData.soil_moisture_pct) || 0,
          EC_dS_m: parseFloat(latestData.EC_dS_m) || 0,
          soil_temp_C: parseFloat(latestData.soil_temp_C) || 0,
          water_depth_cm: parseFloat(latestData.water_depth_cm) || 0,
          timestamp: new Date().toISOString(),
        };
        gatheringReadingsRef.current.push(formatted);
        lastGatheringAddTime.current = now;
        setGatheringCount(gatheringReadingsRef.current.length);
        setLiveGatheringData(formatted);

        if (gatheringReadingsRef.current.length >= GATHER_COUNT) {
          clearInterval(gatheringIntervalRef.current);
          gatheringIntervalRef.current = null;
          const averaged = averageReadings(gatheringReadingsRef.current);
          setSensorData(averaged);
          setConnected(true);
          setError(null);
          setZeroValueCount(0);
          setIsGathering(false);
          setLoading(false);
          setGatheringCount(0);
          setLiveGatheringData(null);
        }
      }, 1000);
      return;
    }

    // Non-BLE: single read from PHSensorService or wait for first valid (legacy)
    let latestData = BleScanServiceEsp32.getLatestData();
    if (latestData && !hasValidData(latestData)) latestData = null;
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
      setZeroValueCount(0);
      setLoading(false);
      return;
    }

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
      setConnected(true);
      setError(t.waitingForSensorData);
      setSensorData(null);
    }
    setLoading(false);
  };

  // No auto-update: UI only updates when user clicks "Read Values" (after gathering 10 readings and averaging for BLE)

  // Cleanup gathering interval on unmount
  useEffect(() => {
    return () => {
      if (gatheringIntervalRef.current) {
        clearInterval(gatheringIntervalRef.current);
        gatheringIntervalRef.current = null;
      }
    };
  }, []);

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
          t.permissionRequired,
          t.permissionMessage,
          [
            { text: t.cancel, style: 'cancel' },
            { text: t.openSettings, onPress: () => {
              // On Android, you can open app settings
              // This is a placeholder - you might want to use Linking.openSettings()
            }},
          ]
        );
        return;
      }
    }
    navigation?.navigate('DeviceConnectionSeedDetection', { sensorType: 'pH' }); //need to chnage to original page later
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
      Alert.alert(t.error, t.readSensorFirst);
      return;
    }

    if (!location) {
      Alert.alert(t.error, t.locationNotAvailable);
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
      Alert.alert(t.validationError, validation.errors.join('\n'));
      return;
    }

    setPredicting(true);
    setError(null);

    const result = await RiceVarietyApiService.predictRiceVariety(apiData);
    if (result.success) {
      setPredictionResult(result.data);
      setError(null);
    } else {
      setError(result.error || t.predictFailed);
      Alert.alert(t.predictionError, result.error || t.predictFailed);
    }
    setPredicting(false);
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
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => navigation?.openDrawer?.()}
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
            {/* Connection Status */}
            <View style={[styles.statusCard, connected ? styles.statusConnected : styles.statusDisconnected]}>
              <View style={styles.statusRow}>
                <View style={[styles.statusIconContainer, { backgroundColor: connected ? '#4CAF5020' : '#F4433620' }]}>
                  {connected ? (
                    <Icon name="bluetooth-connect" size={22} color="#4CAF50" />
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
                      {connectedDevice.name || 'pH Sensor'}
                    </Text>
                  )}
                </View>
                {!connected ? (
                  <TouchableOpacity style={styles.connectButton} onPress={handleConnectDevice}>
                    <Icon name="link" size={18} color="white" />
                    <Text style={styles.connectButtonText}>{t.connect}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.connectedActions}>
                    <TouchableOpacity
                      style={styles.readValuesButton}
                      onPress={fetchData}
                      disabled={loading || isGathering}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Icon name="refresh" size={18} color="white" />
                          <Text style={styles.readValuesButtonText}>{t.readValues}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
                      <Icon name="link-off" size={18} color="white" />
                      <Text style={styles.disconnectButtonText}>{t.disconnect}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Location Status */}
            <View style={[styles.locationStatusCard, location ? styles.locationStatusCardSuccess : styles.locationStatusCardError]}>
              <View style={styles.locationStatusRow}>
                <View style={[styles.locationIconContainer, { backgroundColor: location ? '#4CAF5020' : '#F4433620' }]}>
                  {loadingLocation ? (
                    <ActivityIndicator size="small" color="#2196F3" />
                  ) : location ? (
                    <Icon name="map-marker" size={22} color="#4CAF50" />
                  ) : (
                    <Icon name="map-marker-off" size={22} color="#F44336" />
                  )}
                </View>
                <View style={styles.locationStatusTextContainer}>
                  <Text style={styles.locationStatusTitle}>{t.location}</Text>
                  {location ? (
                    <Text style={styles.locationStatusValue}>
                      {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                    </Text>
                  ) : (
                    <Text style={styles.locationStatusError}>
                      {locationError || t.locationNotAvailable}
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
                  <TouchableOpacity style={styles.mapPickerButton} onPress={handleOpenMapPicker}>
                    <Icon name="map" size={20} color="#0F5132" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Gathering progress: collect 10 readings then average */}
            {isGathering && (
              <View style={styles.gatheringCard}>
                <View style={styles.gatheringHeader}>
                  <Icon name="chart-line" size={24} color="#0F5132" />
                  <Text style={styles.gatheringTitle}>{t.gatheringData}</Text>
                </View>
                <Text style={styles.gatheringProgressText}>{t.gatheringProgress}</Text>
                <View style={styles.gatheringProgressBarContainer}>
                  <View style={styles.gatheringProgressBar}>
                    <View
                      style={[
                        styles.gatheringProgressBarFill,
                        { width: `${(gatheringCount / GATHER_COUNT) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.gatheringCountText}>
                    {gatheringCount} {t.of} {GATHER_COUNT} {t.readings}
                  </Text>
                </View>
                {liveGatheringData && (
                  <View style={styles.gatheringLiveGrid}>
                    <View style={styles.gatheringLiveItem}>
                      <Icon name="test-tube" size={18} color="#FF9800" />
                      <Text style={styles.gatheringLiveLabel}>pH</Text>
                      <Text style={styles.gatheringLiveValue}>{liveGatheringData.pH.toFixed(1)}</Text>
                    </View>
                    <View style={styles.gatheringLiveItem}>
                      <Icon name="water" size={18} color="#2196F3" />
                      <Text style={styles.gatheringLiveLabel}>{t.moisture}</Text>
                      <Text style={styles.gatheringLiveValue}>{liveGatheringData.soil_moisture_pct.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.gatheringLiveItem}>
                      <Icon name="flash" size={18} color="#9C27B0" />
                      <Text style={styles.gatheringLiveLabel}>{t.ec}</Text>
                      <Text style={styles.gatheringLiveValue}>{liveGatheringData.EC_dS_m.toFixed(2)}</Text>
                    </View>
                    <View style={styles.gatheringLiveItem}>
                      <Icon name="thermometer" size={18} color="#FF9800" />
                      <Text style={styles.gatheringLiveLabel}>{t.temperature}</Text>
                      <Text style={styles.gatheringLiveValue}>{liveGatheringData.soil_temp_C.toFixed(1)}°C</Text>
                    </View>
                    <View style={styles.gatheringLiveItem}>
                      <Icon name="waves" size={18} color="#00BCD4" />
                      <Text style={styles.gatheringLiveLabel}>{t.waterDepth}</Text>
                      <Text style={styles.gatheringLiveValue}>{liveGatheringData.water_depth_cm.toFixed(1)} cm</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Loading State (non-BLE or initial load) */}
            {loading && !sensorData && !isGathering && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0F5132" />
                <Text style={styles.loadingText}>{t.fetching}</Text>
              </View>
            )}

            {/* Error State */}
            {error && !loading && !connected && (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>{t.connectionError}</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorHint}>{t.errorHint}</Text>
                <View style={styles.errorActions}>
                  <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                    <Text style={styles.retryButtonText}>{t.retry}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.connectDeviceButton} onPress={handleConnectDevice}>
                    <Icon name="link" size={20} color="white" />
                    <Text style={styles.connectDeviceButtonText}>{t.connectDevice}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Warning State */}
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
                        <Text style={styles.readValuesButtonText}>{t.readValues}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Sensor Data Display */}
            {sensorData && (
              <>
                <View style={styles.phCard}>
                  <View style={styles.phHeader}>
                    <Icon name="test-tube" size={32} color="#FF9800" />
                    <Text style={styles.phLabel}>{t.phLevel}</Text>
                  </View>
                  <Text style={styles.phValue}>{sensorData.pH.toFixed(1)}</Text>
                  <View style={styles.phStatusBadge}>
                    <Text style={styles.phStatusText}>
                      {sensorData.pH < 6.5 ? t.acidic : sensorData.pH > 7.5 ? t.alkaline : t.neutral}
                    </Text>
                  </View>
                </View>

                <View style={styles.dataGrid}>
                  <View style={styles.dataCard}>
                    <Icon name="water" size={24} color="#2196F3" />
                    <Text style={styles.dataLabel}>{t.moisture}</Text>
                    <Text style={styles.dataValue}>{sensorData.soil_moisture_pct.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.dataCard}>
                    <Icon name="flash" size={24} color="#9C27B0" />
                    <Text style={styles.dataLabel}>{t.ec}</Text>
                    <Text style={styles.dataValue}>{sensorData.EC_dS_m.toFixed(2)}</Text>
                  </View>
                  <View style={styles.dataCard}>
                    <Icon name="thermometer" size={24} color="#FF9800" />
                    <Text style={styles.dataLabel}>{t.temperature}</Text>
                    <Text style={styles.dataValue}>{sensorData.soil_temp_C.toFixed(1)}°C</Text>
                  </View>
                  <View style={styles.dataCard}>
                    <Icon name="waves" size={24} color="#00BCD4" />
                    <Text style={styles.dataLabel}>{t.waterDepth}</Text>
                    <Text style={styles.dataValue}>{sensorData.water_depth_cm.toFixed(1)} cm</Text>
                  </View>
                </View>

                <View style={styles.timestampCard}>
                  <Text style={styles.timestampLabel}>{t.lastUpdated}</Text>
                  <Text style={styles.timestampValue}>
                    {new Date(sensorData.timestamp).toLocaleString()}
                  </Text>
                </View>
              </>
            )}

            {/* Form Section */}
            {sensorData && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.additionalInfo}</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t.previousCrop}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.prev_crop}
                      onValueChange={(value) => setFormData({ ...formData, prev_crop: value })}
                      style={styles.picker}
                    >
                      <Picker.Item label={t.cropRice} value="rice" />
                      <Picker.Item label={t.cropVegetable} value="vegetable" />
                      <Picker.Item label={t.cropLegume} value="legume" />
                    </Picker>
                    <View style={styles.pickerValueOverlay} pointerEvents="none">
                      <Text style={styles.pickerValueText}>
                        {formData.prev_crop === 'rice' ? t.cropRice : formData.prev_crop === 'vegetable' ? t.cropVegetable : formData.prev_crop === 'fallow' ? t.cropFallow : t.cropLegume}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t.season}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.season}
                      onValueChange={(value) => setFormData({ ...formData, season: value })}
                      style={styles.picker}
                    >
                      <Picker.Item label={t.maha} value="Maha" />
                      <Picker.Item label={t.yala} value="Yala" />
                    </Picker>
                    <View style={styles.pickerValueOverlay} pointerEvents="none">
                      <Text style={styles.pickerValueText}>{formData.season === 'Maha' ? t.maha : t.yala}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t.soilZone}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.soil_zone}
                      onValueChange={(value) => setFormData({ ...formData, soil_zone: value })}
                      style={styles.picker}
                    >
                      <Picker.Item label={t.zoneDry} value="Dry" />
                      <Picker.Item label={t.zoneIntermediate} value="Intermediate" />
                      <Picker.Item label={t.zoneWet} value="Wet" />
                    </Picker>
                    <View style={styles.pickerValueOverlay} pointerEvents="none">
                      <Text style={styles.pickerValueText}>
                        {formData.soil_zone === 'Dry' ? t.zoneDry : formData.soil_zone === 'Intermediate' ? t.zoneIntermediate : t.zoneWet}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t.waterDepthCm}</Text>
                  <View style={styles.textInputRow}>
                    <TextInput
                      style={styles.textInput}
                      value={String(formData.water_depth_cm ?? '')}
                      placeholder={t.enterWaterDepth}
                      keyboardType="numeric"
                      onChangeText={(value) => setFormData({ ...formData, water_depth_cm: value })}
                    />
                  </View>
                  <Text style={styles.selectedValue}>
                    {t.entered}: {formData.water_depth_cm ? `${formData.water_depth_cm} cm` : t.notSet}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t.soilTexture}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.texture}
                      onValueChange={(value) => setFormData({ ...formData, texture: value })}
                      style={styles.picker}
                    >
                      <Picker.Item label={t.textureLoamy} value="loamy" />
                      <Picker.Item label={t.textureSandy} value="sandy" />
                      <Picker.Item label={t.textureClayey} value="clayey" />
                    </Picker>
                    <View style={styles.pickerValueOverlay} pointerEvents="none">
                      <Text style={styles.pickerValueText}>
                        {formData.texture === 'loamy' ? t.textureLoamy : formData.texture === 'sandy' ? t.textureSandy : t.textureClayey}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.formSummaryCard}>
                  <Text style={styles.formSummaryTitle}>{t.formSummary}</Text>
                  <View style={styles.formSummaryRow}>
                    <Text style={styles.formSummaryLabel}>{t.previousCrop}:</Text>
                    <Text style={styles.formSummaryValue}>
                      {formData.prev_crop === 'rice' ? t.cropRice : formData.prev_crop === 'vegetable' ? t.cropVegetable : formData.prev_crop === 'fallow' ? t.cropFallow : t.cropLegume}
                    </Text>
                  </View>
                  <View style={styles.formSummaryRow}>
                    <Text style={styles.formSummaryLabel}>{t.season}:</Text>
                    <Text style={styles.formSummaryValue}>{formData.season === 'Maha' ? t.maha : t.yala}</Text>
                  </View>
                  <View style={styles.formSummaryRow}>
                    <Text style={styles.formSummaryLabel}>{t.soilZone}:</Text>
                    <Text style={styles.formSummaryValue}>
                      {formData.soil_zone === 'Dry' ? t.zoneDry : formData.soil_zone === 'Intermediate' ? t.zoneIntermediate : t.zoneWet}
                    </Text>
                  </View>
                  <View style={styles.formSummaryRow}>
                    <Text style={styles.formSummaryLabel}>{t.waterDepthCm}:</Text>
                    <Text style={styles.formSummaryValue}>{formData.water_depth_cm ? `${formData.water_depth_cm}` : '-'}</Text>
                  </View>
                  <View style={styles.formSummaryRow}>
                    <Text style={styles.formSummaryLabel}>{t.soilTexture}:</Text>
                    <Text style={styles.formSummaryValue}>
                      {formData.texture === 'loamy' ? t.textureLoamy : formData.texture === 'sandy' ? t.textureSandy : t.textureClayey}
                    </Text>
                  </View>
                </View>

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
                      <Text style={styles.predictButtonText}>{t.predictRiceVariety}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Prediction Results */}
            {predictionResult && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.predictionResults}</Text>
                <View style={styles.bestVarietyCard}>
                  <Icon name="trophy" size={32} color="#FFD700" />
                  <Text style={styles.bestVarietyLabel}>{t.bestVariety}</Text>
                  <Text style={styles.bestVarietyName}>{predictionResult.best_variety}</Text>
                  <Text style={styles.expectedYield}>
                    {t.expectedYield}: {predictionResult.expected_yield.toFixed(0)} {t.kgHa}
                  </Text>
                </View>
                <View style={styles.recommendationsCard}>
                  <Text style={styles.recommendationsTitle}>{t.topRecommendations}</Text>
                  {predictionResult.recommendations?.map((rec, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>{rec.rank}</Text>
                      </View>
                      <View style={styles.recommendationInfo}>
                        <Text style={styles.recommendationVariety}>{rec.variety}</Text>
                        <Text style={styles.recommendationYield}>
                          {rec.predicted_yield.toFixed(0)} {t.kgHa}
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
                <Text style={styles.emptyStateTitle}>{t.noDeviceTitle}</Text>
                <Text style={styles.emptyStateText}>{t.noDeviceText}</Text>
                <TouchableOpacity style={styles.emptyStateButton} onPress={handleConnectDevice}>
                  <Icon name="link" size={24} color="white" />
                  <Text style={styles.emptyStateButtonText}>{t.connectDevice}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Connected but No Data Yet */}
            {connected && connectedDevice && !sensorData && !loading && !error && (
              <View style={styles.emptyState}>
                <Icon name="bluetooth-connect" size={64} color="#4CAF50" />
                <Text style={styles.emptyStateTitle}>{t.deviceConnected}</Text>
                <Text style={styles.emptyStateText}>
                  {t.pressReadValues}{'\n'}{t.zeroValuesFiltered}
                </Text>
                <TouchableOpacity style={styles.emptyStateButton} onPress={fetchData} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Icon name="refresh" size={24} color="white" />
                      <Text style={styles.emptyStateButtonText}>{t.readValues}</Text>
                    </>
                  )}
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
  statusTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 16,
    marginLeft: 0,
    color: '#F44336',
    fontWeight: '600',
  },
  statusTextConnected: {
    color: '#4CAF50',
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
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    elevation: 2,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  readValuesButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    elevation: 2,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disconnectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  locationStatusCard: {
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
  locationStatusCardSuccess: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  locationStatusCardError: {
    borderLeftWidth: 5,
    borderLeftColor: '#F44336',
  },
  locationStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationStatusTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationStatusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 4,
  },
  locationStatusValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  locationStatusError: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  locationButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  locationRefreshButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
  },
  mapPickerButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
  },
  gatheringCard: {
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
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  gatheringHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  gatheringTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F5132',
  },
  gatheringProgressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '600',
  },
  gatheringProgressBarContainer: {
    marginBottom: 16,
  },
  gatheringProgressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  gatheringProgressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  gatheringCountText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  gatheringLiveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  gatheringLiveItem: {
    width: '30%',
    minWidth: 90,
    backgroundColor: '#F8FBF9',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  gatheringLiveLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    marginTop: 4,
  },
  gatheringLiveValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F5132',
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
  warningCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 5,
    borderLeftColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  warningContent: {
    flex: 1,
  },
  warningText: {
    fontSize: 15,
    color: '#E65100',
    fontWeight: '600',
    marginBottom: 12,
  },
  readValuesButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    alignSelf: 'flex-start',
    elevation: 2,
  },
  phCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 28,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
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
    fontWeight: '600',
  },
  phValue: {
    fontSize: 64,
    fontWeight: '900',
    color: '#0F5132',
    marginBottom: 12,
    letterSpacing: -1,
  },
  phStatusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
  },
  phStatusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9800',
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 4,
    marginBottom: 20,
    gap: 12,
  },
  dataCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  dataLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 12,
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
  section: {
    marginHorizontal: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
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
    fontWeight: '600',
    marginTop: 8,
    paddingLeft: 4,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    position: 'relative',
  },
  picker: {
    height: 50,
  },
  pickerValueOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pickerValueText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  textInputRow: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  textInput: {
    height: 40,
    fontSize: 14,
    color: '#333',
  },
  formSummaryCard: {
    backgroundColor: '#F8FBF9',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#0F5132',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  formSummaryTitle: {
    fontSize: 16,
    fontWeight: '800',
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
    fontWeight: '600',
  },
  formSummaryValue: {
    fontSize: 13,
    color: '#0F5132',
    fontWeight: '700',
  },
  predictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    marginTop: 8,
    elevation: 4,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  predictButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bestVarietyCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  bestVarietyLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
  },
  bestVarietyName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F5132',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  expectedYield: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '700',
  },
  recommendationsCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F8FBF9',
    borderRadius: 16,
    marginBottom: 10,
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
    fontWeight: '800',
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationVariety: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  recommendationYield: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
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

