import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../src/context/LanguageContext';
import PredictionService from '../src/utils/predictionService';
import NotificationService from '../src/utils/notificationService';
import MeteosourceService from '../src/utils/meteosourceService';
import LocationService from '../src/utils/locationService';
import DryingScheduleService from '../src/utils/dryingScheduleService';
import DryingScheduleApiService from '../src/utils/dryingScheduleApiService';

const { width } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    title: 'Reading Results',
    averageMoisture: 'Average Moisture',
    readingSummary: 'Reading Summary',
    readingsCount: 'Readings Collected',
    duration: 'Duration',
    seconds: 'seconds',
    temperature: 'Temperature',
    humidity: 'Humidity',
    weather: 'Weather',
    currentWeather: 'Current weather',
    location: 'Location',
    predictions: 'Predictions',
    today: 'Today',
    tomorrow: 'Tomorrow',
    time: 'Time',
    status: 'Status',
    moisture: 'Moisture',
    dry: 'Dry',
    moderate: 'Moderate',
    wet: 'Wet',
    average: 'Average',
    hours: 'hours',
    hour: 'hour',
    from: 'from',
    goodMoisture: 'Good moisture level. No action needed.',
    overDried: 'Over dried. Moisture level is too low.',
    loadingPredictions: 'Loading predictions...',
    predictionError: 'Failed to load predictions',
    back: 'Back',
    celsius: '°C',
    percent: '%',
    predictedMoisture: 'Predicted Moisture',
    weatherAwareSchedule: 'Weather-Aware Drying Schedule',
    scheduleStart: 'Schedule Start',
    scheduleEnd: 'Schedule End',
    enableNotifications: 'Enable Notifications',
    notificationsEnabled: 'Notifications Enabled',
    notificationsDisabled: 'Notifications Disabled',
    sensorReadings: 'Sensor Readings',
    capSensorValue: 'Capacitive Sensor Value',
    sampleTemperature: 'Sample Temperature',
    ambientTemperature: 'Ambient Temperature',
    ambientHumidity: 'Ambient Humidity',
    sampleWeight: 'Sample Weight',
    bulkDensity: 'Bulk Density',
    grams: 'g',
    gPerCm3: 'g/cm³',
    noSchedule: 'No drying schedule needed',
    scheduleTime: 'Time',
    scheduleDate: 'Date',
    dryingTableDay: 'Day',
    dryingTableDate: 'Date',
    dryingTableTemp: 'Temp',
    dryingTableWindow: 'Best time to dry',
    dryingTableEstMoisture: 'Est. moisture',
    daysToGoodMoisture: 'Est. {{count}} day(s) to good moisture (~12–14%)',
    loadingForecast: 'Loading forecast...',
    forecastError: 'Could not load forecast',
    mm: 'mm',
  },
  සිංහල: {
    title: 'කියවීමේ ප්‍රතිඵල',
    averageMoisture: 'සාමාන්‍ය තෙතමනය',
    readingSummary: 'කියවීමේ සාරාංශය',
    readingsCount: 'එකතු කරන ලද කියවීම්',
    duration: 'කාලය',
    seconds: 'තත්පර',
    temperature: 'උෂ්ණත්වය',
    humidity: 'ආර්ද්‍රතාව',
    weather: 'කාලගුණය',
    currentWeather: 'වත්මන් කාලගුණය',
    location: 'ස්ථානය',
    predictions: 'අනාවැකි',
    today: 'අද',
    tomorrow: 'හෙට',
    time: 'වේලාව',
    status: 'තත්වය',
    moisture: 'තෙතමනය',
    dry: 'වියළි',
    moderate: 'මධ්‍යම',
    wet: 'තෙත්',
    average: 'සාමාන්‍ය',
    hours: 'පැය',
    hour: 'පැය',
    from: 'සිට',
    goodMoisture: 'හොඳ තෙතමන මට්ටම. කිසිදු ක්‍රියාවක් අවශ්‍ය නොවේ.',
    overDried: 'අධික වියළි. තෙතමන මට්ටම ඉතා අඩුය.',
    loadingPredictions: 'අනාවැකි පූරණය වෙමින්...',
    predictionError: 'අනාවැකි පූරණය කිරීමට අසමත් විය',
    back: 'ආපසු',
    celsius: '°C',
    percent: '%',
    predictedMoisture: 'අනාවැකි තෙතමනය',
    weatherAwareSchedule: 'කාලගුණ දැනුවත් වියළීමේ කාලසටහන',
    scheduleStart: 'කාලසටහන ආරම්භය',
    scheduleEnd: 'කාලසටහන අවසානය',
    enableNotifications: 'දැනුම්දීම් සක්‍රිය කරන්න',
    notificationsEnabled: 'දැනුම්දීම් සක්‍රියයි',
    notificationsDisabled: 'දැනුම්දීම් අක්‍රියයි',
    sensorReadings: 'සංවේදක කියවීම්',
    capSensorValue: 'ධාරිතා සංවේදක අගය',
    sampleTemperature: 'නියමුන උෂ්ණත්වය',
    ambientTemperature: 'පරිසර උෂ්ණත්වය',
    ambientHumidity: 'පරිසර ආර්ද්‍රතාව',
    sampleWeight: 'නියමුන බර',
    bulkDensity: 'ස්කන්ධ ඝනත්වය',
    grams: 'g',
    gPerCm3: 'g/cm³',
    noSchedule: 'වියළීමේ කාලසටහනක් අවශ්‍ය නොවේ',
    scheduleTime: 'වේලාව',
    scheduleDate: 'දිනය',
    dryingTableDay: 'දිනය',
    dryingTableDate: 'දිනය',
    dryingTableTemp: 'උෂ්ණය',
    dryingTableWindow: 'වියළීමට හොඳම කාලය',
    dryingTableEstMoisture: 'ඇස්ත. තෙතමනය',
    daysToGoodMoisture: 'හොඳ තෙතමනයට (~12–14%) ඇස්ත. {{count}} දින',
    loadingForecast: 'කාලගුණය පූරණය වෙමින්...',
    forecastError: 'කාලගුණය පූරණය කිරීමට අසමත් විය',
    mm: 'මි.මි.',
  },
  தமிழ்: {
    title: 'வாசிப்பு முடிவுகள்',
    averageMoisture: 'சராசரி ஈரப்பதம்',
    readingSummary: 'வாசிப்பு சுருக்கம்',
    readingsCount: 'சேகரிக்கப்பட்ட வாசிப்புகள்',
    duration: 'காலம்',
    seconds: 'வினாடிகள்',
    temperature: 'வெப்பநிலை',
    humidity: 'ஈரப்பதம்',
    weather: 'வானிலை',
    currentWeather: 'தற்போதைய வானிலை',
    location: 'இடம்',
    predictions: 'கணிப்புகள்',
    today: 'இன்று',
    tomorrow: 'நாளை',
    time: 'நேரம்',
    status: 'நிலை',
    moisture: 'ஈரப்பதம்',
    dry: 'வறண்ட',
    moderate: 'மிதமான',
    wet: 'ஈரமான',
    average: 'சராசரி',
    hours: 'மணி',
    hour: 'மணி',
    from: 'இலிருந்து',
    goodMoisture: 'நல்ல ஈரப்பத அளவு. எந்த நடவடிக்கையும் தேவையில்லை.',
    overDried: 'அதிகமாக உலர்ந்தது. ஈரப்பத அளவு மிகவும் குறைவாக உள்ளது.',
    loadingPredictions: 'கணிப்புகளை ஏற்றுகிறது...',
    predictionError: 'கணிப்புகளை ஏற்ற முடியவில்லை',
    back: 'பின்',
    celsius: '°C',
    percent: '%',
    predictedMoisture: 'கணிக்கப்பட்ட ஈரப்பதம்',
    weatherAwareSchedule: 'வானிலை அறிந்த உலர்த்தல் அட்டவணை',
    scheduleStart: 'அட்டவணை தொடக்கம்',
    scheduleEnd: 'அட்டவணை முடிவு',
    enableNotifications: 'அறிவிப்புகளை இயக்கவும்',
    notificationsEnabled: 'அறிவிப்புகள் இயக்கப்பட்டுள்ளன',
    notificationsDisabled: 'அறிவிப்புகள் முடக்கப்பட்டுள்ளன',
    sensorReadings: 'சென்சார் வாசிப்புகள்',
    capSensorValue: 'கொள்ளளவு சென்சார் மதிப்பு',
    sampleTemperature: 'மாதிரி வெப்பநிலை',
    ambientTemperature: 'சுற்றுப்புற வெப்பநிலை',
    ambientHumidity: 'சுற்றுப்புற ஈரப்பதம்',
    sampleWeight: 'மாதிரி எடை',
    bulkDensity: 'மொத்த அடர்த்தி',
    grams: 'g',
    gPerCm3: 'g/cm³',
    noSchedule: 'உலர்த்தல் அட்டவணை தேவையில்லை',
    scheduleTime: 'நேரம்',
    scheduleDate: 'தேதி',
    dryingTableDay: 'நாள்',
    dryingTableDate: 'தேதி',
    dryingTableTemp: 'வெப்பம்',
    dryingTableWindow: 'உலர்த்த சிறந்த நேரம்',
    dryingTableEstMoisture: 'மதி. ஈரப்பதம்',
    daysToGoodMoisture: 'நல்ல ஈரப்பதத்திற்கு (~12–14%) மதி. {{count}} நாள்(கள்)',
    loadingForecast: 'வானிலை ஏற்றுகிறது...',
    forecastError: 'வானிலையை ஏற்ற முடியவில்லை',
    mm: 'மி.மீ.',
  },
};

export default function ReadingResultsScreen({ route, navigation }) {
  const { selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
  const { readingData } = route.params || {};
  
  const [predictions, setPredictions] = useState(null);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [predictionError, setPredictionError] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [predictedMoisture, setPredictedMoisture] = useState(null);
  const [dryingSchedule, setDryingSchedule] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecastError, setForecastError] = useState(null);
  const [scheduleError, setScheduleError] = useState(null);
  const buildFallbackForecastData = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const date = `${y}-${m}-${d}`;
    const temp = readingData?.weather?.temperature ?? readingData?.temperature ?? readingData?.averageAmbientTemp;
    const humidity =
      readingData?.weather?.humidity ?? readingData?.humidity ?? readingData?.averageAmbientHumidity;
    const wind = readingData?.weather?.wind;
    const precipitation = readingData?.weather?.precipitation;
    const summary = readingData?.weather?.description || '';
    const city = readingData?.weather?.location?.city || '';
    const country = readingData?.weather?.location?.country || '';

    const hasCore =
      Number.isFinite(Number(temp)) &&
      Number.isFinite(Number(humidity)) &&
      Number.isFinite(Number(wind)) &&
      Number.isFinite(Number(precipitation));
    if (!hasCore) return null;

    return {
      current: {
        temperature: temp,
        humidity,
        summary,
        wind,
        precipitation,
      },
      daily: [
        {
          date,
          tempMax: temp,
          tempMin: temp,
          temperature: temp,
          humidity,
          precipitation,
          precipitationType: 'none',
          windSpeed: wind,
          summary,
        },
      ],
      placeName: city || 'Current location',
      country,
    };
  };
  const toFiniteNumber = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };


  useEffect(() => {
    if (readingData) {
      loadPredictions();
    }
  }, [readingData]);

  // Fetch real weather and forecast once (for weather card + drying schedule)
  useEffect(() => {
    if (!readingData) return;
    let cancelled = false;
    setLoadingForecast(true);
    setForecastError(null);
    (async () => {
      try {
        let lat, lon;
        // Prefer device location so weather and place name match user's actual location
        const loc = await LocationService.getCurrentLocation();
        if (loc.success && loc.data && typeof loc.data.lat === 'number' && typeof loc.data.lon === 'number') {
          lat = loc.data.lat;
          lon = loc.data.lon;
        } else {
          const coords = readingData.weather?.location?.coordinates;
          if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
            lat = coords.latitude;
            lon = coords.longitude;
          } else {
            throw new Error(loc?.error || 'Location unavailable');
          }
        }
        const [forecastResult, placeResult] = await Promise.all([
          MeteosourceService.getForecast(lat, lon),
          MeteosourceService.getNearestPlace(lat, lon),
        ]);
        if (cancelled) return;
        if (!forecastResult.success || !forecastResult.data) {
          setForecastError(forecastResult.error || 'Failed to load weather');
          setForecastData(buildFallbackForecastData());
          return;
        }
        const placeName = placeResult.success && placeResult.data ? placeResult.data.name : null;
        const country = placeResult.success && placeResult.data ? placeResult.data.country : '';
        setForecastData({
          current: forecastResult.data.current,
          daily: forecastResult.data.daily || [],
          placeName: placeName || 'Current location',
          country: country || '',
        });
      } catch (e) {
        if (!cancelled) {
          setForecastError(e.message || 'Failed to load weather');
          setForecastData(buildFallbackForecastData());
        }
      } finally {
        if (!cancelled) setLoadingForecast(false);
      }
    })();
    return () => { cancelled = true; };
  }, [readingData]);

  // Build drying schedule using backend model when moisture prediction is available.
  useEffect(() => {
    if (predictedMoisture == null) return;
    let cancelled = false;

    (async () => {
      try {
        setScheduleError(null);
        const fallbackForecast = buildFallbackForecastData();
        const daily = forecastData?.daily?.length
          ? forecastData.daily
          : fallbackForecast?.daily || [];
        if (!daily.length) {
          setScheduleError('Weather data unavailable for drying schedule');
          setDryingSchedule(null);
          return;
        }
        const d0 = daily[0] || {};
        const currentTemp = toFiniteNumber(forecastData?.current?.temperature ?? fallbackForecast?.current?.temperature, NaN);
        const currentWind = toFiniteNumber(
          forecastData?.current?.wind ?? fallbackForecast?.current?.wind,
          NaN
        );
        const currentPrecip = toFiniteNumber(
          forecastData?.current?.precipitation ?? fallbackForecast?.current?.precipitation,
          NaN
        );
        const moistureForDrying = Math.max(0, Math.min(100, toFiniteNumber(predictedMoisture, 13)));
        const payload = {
          current_moisture_pct: moistureForDrying,
          moisture_excess_pct: toFiniteNumber((moistureForDrying - 13).toFixed(2), 0),
          attempt_no: 1,
          weather_temp_max_c: toFiniteNumber(d0.tempMax ?? d0.temperature, currentTemp),
          weather_temp_min_c: toFiniteNumber(d0.tempMin ?? d0.temperature, currentTemp),
          weather_precip_mm: Math.max(0, toFiniteNumber(d0.precipitation, currentPrecip)),
          weather_wind_max_kmh: Math.max(0, toFiniteNumber(d0.windSpeed, currentWind)),
        };
        const hasAllPayloadValues = Object.values(payload).every((v) => Number.isFinite(Number(v)));
        if (!hasAllPayloadValues) {
          setScheduleError('Insufficient live weather values for model prediction');
          setDryingSchedule(null);
          return;
        }

        const result = await DryingScheduleApiService.predictDryingSchedule(payload);
        if (cancelled) return;

        if (!result.success || !result.data) {
          setScheduleError(String(result.error || 'Failed to predict drying schedule'));
          const fallback = DryingScheduleService.buildDryingSchedule(predictedMoisture, daily, 13);
          setDryingSchedule(fallback);
          return;
        }

        if (!result.data.needs_drying) {
          setDryingSchedule({ rows: [], daysToTarget: 0, targetMoisture: result.data.target_moisture ?? 13 });
          return;
        }

        const schedule = DryingScheduleService.buildScheduleFromPredictedDays(
          predictedMoisture,
          daily,
          result.data.days_to_target,
          result.data.target_moisture ?? 13
        );
        setDryingSchedule(schedule);
      } catch (e) {
        if (!cancelled) {
          setScheduleError(String(e?.message || 'Failed to predict drying schedule'));
          const fallbackForecast = buildFallbackForecastData();
          const daily = forecastData?.daily?.length ? forecastData.daily : fallbackForecast?.daily || [];
          if (daily.length) {
            const fallback = DryingScheduleService.buildDryingSchedule(predictedMoisture, daily, 13);
            setDryingSchedule(fallback);
          } else {
            setDryingSchedule(null);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [predictedMoisture, forecastData]);

  const loadPredictions = async () => {
    setLoadingPredictions(true);
    setPredictionError(null);
    
    try {
      console.log('Reading Data:', readingData);
      const result = await PredictionService.getPrediction(readingData);
      
      if (result.success || result.data) {
        setPredictions(result.data);
        // Set predicted moisture from prediction result or use average moisture
        if (result.data?.moisture !== undefined) {
          setPredictedMoisture(result.data.moisture);
        } else {
          setPredictedMoisture(readingData.averageMoisture);
        }
      } else {
        setPredictionError(result.error);
        // Use average moisture as predicted if prediction fails
        setPredictedMoisture(readingData.averageMoisture);
      }
    } catch (error) {
      setPredictionError(error.message);
      setPredictedMoisture(readingData.averageMoisture);
    } finally {
      setLoadingPredictions(false);
    }
  };

  // Bulk density container volume (cm³) – actual device container
  const SAMPLE_CONTAINER_VOLUME_CM3 = 39.58;

  // Calculate bulk density (g/cm³) from real sample weight and container volume
  const calculateBulkDensity = () => {
    const sampleWeight = readingData?.averageSampleWeight ?? null; // grams from HX711
    if (sampleWeight == null || sampleWeight <= 0) return null;
    return sampleWeight / SAMPLE_CONTAINER_VOLUME_CM3;
  };

  const handleNotificationToggle = async (value) => {
    setNotificationsEnabled(value);
    if (value) {
      // Request permissions and schedule notifications
      const granted = await NotificationService.requestPermissions();
      if (granted) {
        await scheduleNotifications();
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive schedule reminders.'
        );
        setNotificationsEnabled(false);
      }
    } else {
      // Cancel notifications
      await cancelNotifications();
    }
  };

  const scheduleNotifications = async () => {
    // Use real drying schedule when available (best window 10:00–14:00)
    const startTime = '10:00';
    const endTime = '14:00';
    let day1Schedule = { startTime, endTime, date: new Date() };
    let day2Schedule = null;
    if (dryingSchedule?.rows?.length >= 1) {
      const d1 = dryingSchedule.rows[0];
      day1Schedule = { startTime, endTime, date: new Date(d1.date + 'T12:00:00') };
      if (dryingSchedule.rows.length >= 2) {
        const d2 = dryingSchedule.rows[1];
        day2Schedule = { startTime, endTime, date: new Date(d2.date + 'T12:00:00') };
      }
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      day2Schedule = { startTime, endTime, date: tomorrow };
    }

    const day1Success = await NotificationService.scheduleDryingNotifications(day1Schedule);
    const day2Success = day2Schedule
      ? await NotificationService.scheduleDryingNotifications(day2Schedule)
      : true;
    
    if (day1Success && day2Success) {
      Alert.alert(
        'Notifications Scheduled',
        'You will be notified when the drying schedule starts and ends for both days.'
      );
    } else {
      Alert.alert(
        'Error',
        'Failed to schedule some notifications. Please try again.'
      );
      setNotificationsEnabled(false);
    }
  };

  const cancelNotifications = async () => {
    const success = await NotificationService.cancelAllNotifications();
    if (success) {
      Alert.alert('Notifications Cancelled', 'Drying schedule notifications have been cancelled.');
    }
  };


  if (!readingData) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
          <View style={styles.statusBarContainer} />
        </SafeAreaView>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>No reading data available</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{t.back}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        <View style={styles.statusBarContainer} />
      </SafeAreaView>
      <SafeAreaView style={styles.safeAreaContent} edges={['left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 72 + insets.bottom + 20 }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <View style={styles.headerBackButton} />
          </View>

          <View style={styles.content}>
            {/* Predicted Moisture Card */}
            {predictedMoisture !== null && (
              <View style={styles.predictedMoistureCard}>
                <Text style={styles.predictedMoistureLabel}>{t.predictedMoisture}</Text>
                <Text style={styles.predictedMoistureValue}>
                  {predictedMoisture.toFixed(2)}{t.percent}
                </Text>
              </View>
            )}


            {/* Sensor Readings Card */}
            <View style={styles.sensorReadingsCard}>
              <Text style={styles.sensorReadingsTitle}>{t.sensorReadings}</Text>
              <View style={styles.sensorReadingsGrid}>
                {/* Capacitive Sensor Value */}
                <View style={styles.sensorReadingItem}>
                  <Icon name="water" size={20} color="#2196F3" />
                  <Text style={styles.sensorReadingLabel}>{t.capSensorValue}</Text>
                  <Text style={styles.sensorReadingValue}>
                    {readingData.averageCapSensor !== undefined && readingData.averageCapSensor !== null
                      ? `${readingData.averageCapSensor.toFixed(1)}${t.percent}`
                      : '--'}
                  </Text>
                </View>

                {/* Sample Temperature */}
                <View style={styles.sensorReadingItem}>
                  <Icon name="thermometer" size={20} color="#FF9800" />
                  <Text style={styles.sensorReadingLabel}>{t.sampleTemperature}</Text>
                  <Text style={styles.sensorReadingValue}>
                    {readingData.averageSampleTemp !== undefined && readingData.averageSampleTemp !== null
                      ? `${readingData.averageSampleTemp.toFixed(1)}${t.celsius}`
                      : `--${t.celsius}`}
                  </Text>
                </View>

                {/* Ambient Temperature */}
                <View style={styles.sensorReadingItem}>
                  <Icon name="thermometer-lines" size={20} color="#F44336" />
                  <Text style={styles.sensorReadingLabel}>{t.ambientTemperature}</Text>
                  <Text style={styles.sensorReadingValue}>
                    {readingData.averageAmbientTemp !== undefined && readingData.averageAmbientTemp !== null
                      ? `${readingData.averageAmbientTemp.toFixed(1)}${t.celsius}`
                      : `--${t.celsius}`}
                  </Text>
                </View>

                {/* Ambient Humidity */}
                <View style={styles.sensorReadingItem}>
                  <Icon name="water-percent" size={20} color="#9C27B0" />
                  <Text style={styles.sensorReadingLabel}>{t.ambientHumidity}</Text>
                  <Text style={styles.sensorReadingValue}>
                    {readingData.averageAmbientHumidity !== undefined && readingData.averageAmbientHumidity !== null
                      ? `${readingData.averageAmbientHumidity.toFixed(1)}${t.percent}`
                      : `--${t.percent}`}
                  </Text>
                </View>

                {/* Sample Weight */}
                <View style={styles.sensorReadingItem}>
                  <Icon name="scale-balance" size={20} color="#4CAF50" />
                  <Text style={styles.sensorReadingLabel}>{t.sampleWeight}</Text>
                  <Text style={styles.sensorReadingValue}>
                    {readingData.averageSampleWeight !== undefined && readingData.averageSampleWeight !== null
                      ? `${readingData.averageSampleWeight.toFixed(1)}${t.grams}`
                      : `--${t.grams}`}
                  </Text>
                </View>

                {/* Bulk Density (derived from sample weight / container volume) */}
                <View style={styles.sensorReadingItem}>
                  <Icon name="cube-outline" size={20} color="#607D8B" />
                  <Text style={styles.sensorReadingLabel}>{t.bulkDensity}</Text>
                  <Text style={styles.sensorReadingValue}>
                    {(() => {
                      const density = calculateBulkDensity();
                      return density != null ? `${density.toFixed(2)}${t.gPerCm3}` : `--${t.gPerCm3}`;
                    })()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Reading Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{t.readingSummary}</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Icon name="counter" size={20} color="#666" />
                  <Text style={styles.summaryLabel}>{t.readingsCount}</Text>
                  <Text style={styles.summaryValue}>{readingData.readings.length}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Icon name="clock-outline" size={20} color="#666" />
                  <Text style={styles.summaryLabel}>{t.duration}</Text>
                  <Text style={styles.summaryValue}>
                    {readingData.duration} {t.seconds}
                  </Text>
                </View>
              </View>
            </View>

            {/* Current weather – real data from Meteosource */}
            {(forecastData?.current || readingData.weather || loadingForecast) && (
              <View style={styles.weatherCard}>
                <Text style={styles.weatherTitle}>{t.currentWeather}</Text>
                {loadingForecast ? (
                  <View style={styles.weatherLoadingRow}>
                    <ActivityIndicator size="small" color="#0F5132" />
                    <Text style={styles.weatherLoadingText}>{t.loadingForecast}</Text>
                  </View>
                ) : forecastData?.current ? (
                  <>
                    <View style={styles.weatherRow}>
                      <View style={styles.weatherItem}>
                        <Text style={styles.weatherLabel}>{t.location}</Text>
                        <Text style={styles.weatherValue}>
                          {forecastData.placeName}{forecastData.country ? `, ${forecastData.country}` : ''}
                        </Text>
                      </View>
                      <View style={styles.weatherItem}>
                        <Text style={styles.weatherLabel}>{t.temperature}</Text>
                        <Text style={styles.weatherValue}>
                          {(() => {
                            const temp = forecastData.current.temperature;
                            const num = typeof temp === 'number' ? temp : parseFloat(temp);
                            return Number.isFinite(num) ? num.toFixed(1) : '—';
                          })()}{t.celsius}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.weatherDescription}>
                      {forecastData.current.summary || ''}
                    </Text>
                    {forecastData.current.humidity != null && (
                      <Text style={styles.weatherSubtext}>
                        {t.humidity}: {forecastData.current.humidity}{t.percent}
                      </Text>
                    )}
                  </>
                ) : readingData.weather ? (
                  <>
                    <View style={styles.weatherRow}>
                      <View style={styles.weatherItem}>
                        <Text style={styles.weatherLabel}>{t.location}</Text>
                        <Text style={styles.weatherValue}>
                          {readingData.weather.location?.city}, {readingData.weather.location?.country}
                        </Text>
                      </View>
                      <View style={styles.weatherItem}>
                        <Text style={styles.weatherLabel}>{t.temperature}</Text>
                        <Text style={styles.weatherValue}>
                          {readingData.weather.temperature?.toFixed(1)}{t.celsius}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.weatherDescription}>
                      {readingData.weather.description || ''}
                    </Text>
                  </>
                ) : null}
              </View>
            )}

            {/* Weather-Aware Drying Schedule (Meteosource forecast + table) */}
            <View style={styles.scheduleCard}>
              <Text style={styles.scheduleTitle}>{t.weatherAwareSchedule}</Text>

              {loadingPredictions ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0F5132" />
                  <Text style={styles.loadingText}>{t.loadingPredictions}</Text>
                </View>
              ) : predictedMoisture != null && predictedMoisture < DryingScheduleService.GOOD_MOISTURE_MIN ? (
                <Text style={[styles.noScheduleText, { color: '#C62828' }]}>{t.overDried}</Text>
              ) : predictedMoisture != null && predictedMoisture >= DryingScheduleService.GOOD_MOISTURE_MIN && predictedMoisture <= DryingScheduleService.GOOD_MOISTURE_MAX ? (
                <Text style={styles.noScheduleText}>{t.goodMoisture}</Text>
              ) : loadingForecast ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0F5132" />
                  <Text style={styles.loadingText}>{t.loadingForecast}</Text>
                </View>
              ) : forecastError ? (
                <View style={styles.loadingContainer}>
                  <Icon name="weather-cloudy-alert" size={32} color="#999" />
                  <Text style={[styles.loadingText, { color: '#666' }]}>{t.forecastError}</Text>
                  <Text style={styles.scheduleSubtext}>{forecastError}</Text>
                </View>
              ) : dryingSchedule?.rows?.length > 0 ? (
                <>
                  {scheduleError ? (
                    <Text style={styles.scheduleSubtext}>{scheduleError}</Text>
                  ) : null}
                  {dryingSchedule.daysToTarget != null && dryingSchedule.daysToTarget > 0 && (
                    <Text style={styles.daysToTargetText}>
                      {t.daysToGoodMoisture.replace('{{count}}', String(dryingSchedule.daysToTarget))}
                    </Text>
                  )}
                  <View style={styles.dryingTableScroll}>
                    <View style={styles.dryingTable}>
                      <View style={styles.dryingTableHeader}>
                        <Text style={[styles.dryingTableHeaderCell, styles.dryingTableColDay]}>{t.dryingTableDay}</Text>
                        <Text style={[styles.dryingTableHeaderCell, styles.dryingTableColDate]}>{t.dryingTableDate}</Text>
                        <Text style={[styles.dryingTableHeaderCell, styles.dryingTableColTemp]}>{t.dryingTableTemp}</Text>
                        <Text style={[styles.dryingTableHeaderCell, styles.dryingTableColWindow]}>{t.dryingTableWindow}</Text>
                        <Text style={[styles.dryingTableHeaderCell, styles.dryingTableColMoist]}>{t.dryingTableEstMoisture}</Text>
                      </View>
                      {dryingSchedule.rows.map((row) => (
                        <View
                          key={`${row.date}-${row.dayIndex}`}
                          style={[
                            styles.dryingTableRow,
                            row.reachedTarget && styles.dryingTableRowTarget,
                          ]}
                        >
                          <Text style={[styles.dryingTableCell, styles.dryingTableColDay]}>{row.dayIndex}</Text>
                          <Text style={[styles.dryingTableCell, styles.dryingTableColDate]} numberOfLines={1}>
                            {row.date}
                          </Text>
                          <Text style={[styles.dryingTableCell, styles.dryingTableColTemp]}>
                            {row.tempMax != null ? `${Math.round(row.tempMax)}${t.celsius}` : '—'}
                          </Text>
                          <Text style={[styles.dryingTableCell, styles.dryingTableColWindow]} numberOfLines={1}>
                            {row.bestWindow || '10:00–14:00'}
                          </Text>
                          <Text style={[styles.dryingTableCell, styles.dryingTableColMoist, row.reachedTarget && styles.dryingTableCellTarget]}>
                            {row.estimatedMoistureEnd}{t.percent}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.notificationToggleContainer}>
                    <View style={styles.notificationToggleInfo}>
                      <Icon name="bell" size={20} color="#0F5132" />
                      <View style={styles.notificationToggleTextContainer}>
                        <Text style={styles.notificationToggleLabel}>{t.enableNotifications}</Text>
                        <Text style={styles.notificationToggleSubtext}>
                          {notificationsEnabled ? t.notificationsEnabled : t.notificationsDisabled}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={handleNotificationToggle}
                      trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                      thumbColor={notificationsEnabled ? '#FFFFFF' : '#F4F3F4'}
                    />
                  </View>
                </>
              ) : (
                <Text style={styles.noScheduleText}>{t.noSchedule}</Text>
              )}
            </View>
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
  header: {
    backgroundColor: '#0F5132',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  averageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  averageLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  averageValue: {
    fontSize: 64,
    fontWeight: '900',
    color: '#0F5132',
    letterSpacing: -2,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#F8FBF9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F5132',
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  weatherTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 16,
  },
  weatherRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  weatherItem: {
    flex: 1,
  },
  weatherLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F5132',
  },
  weatherDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  weatherSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  weatherLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  weatherLoadingText: {
    fontSize: 14,
    color: '#666',
  },
  predictionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  predictionsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 20,
  },
  predictionDay: {
    marginBottom: 24,
  },
  predictionDayTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 16,
  },
  scheduleDayContainer: {
    marginBottom: 24,
  },
  scheduleDayTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 16,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FBF9',
    borderRadius: 12,
    marginBottom: 8,
  },
  predictionTime: {
    width: 60,
  },
  predictionTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  predictionStatus: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  predictionStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  predictionStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  predictionMoisture: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F5132',
  },
  predictionAverage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
  },
  predictionAverageLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F5132',
  },
  predictionAverageValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F5132',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
    textAlign: 'center',
  },
  noPredictionsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  backButton: {
    backgroundColor: '#0F5132',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  moistureLevelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  moistureLevelLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moistureLevelValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#0F5132',
    letterSpacing: -2,
  },
  predictionCard: {
    backgroundColor: '#F8FBF9',
    padding: 20,
    borderRadius: 16,
    marginTop: 12,
  },
  predictionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F5132',
    lineHeight: 24,
  },
  predictedMoistureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  predictedMoistureLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  predictedMoistureValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#4CAF50',
    letterSpacing: -2,
  },
  sensorReadingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  sensorReadingsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 20,
  },
  sensorReadingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sensorReadingItem: {
    width: '48%',
    backgroundColor: '#F8FBF9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  sensorReadingLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  sensorReadingValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F5132',
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 20,
  },
  scheduleItem: {
    backgroundColor: '#F8FBF9',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  scheduleItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  scheduleItemLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F5132',
  },
  scheduleTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scheduleDateText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  scheduleTimeText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F5132',
  },
  notificationToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FBF9',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  notificationToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  notificationToggleTextContainer: {
    flex: 1,
  },
  notificationToggleLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 4,
  },
  notificationToggleSubtext: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  noScheduleText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  scheduleSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  daysToTargetText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 12,
  },
  dryingTableScroll: {
    marginBottom: 16,
  },
  dryingTable: {
    width: '100%',
  },
  dryingTableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#0F5132',
    borderRadius: 8,
    marginBottom: 6,
  },
  dryingTableHeaderCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dryingTableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F8FBF9',
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  dryingTableRowTarget: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  dryingTableCell: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  dryingTableCellTarget: {
    fontWeight: '800',
    color: '#2E7D32',
  },
  dryingTableColDay: { width: 24 },
  dryingTableColDate: { width: 66 },
  dryingTableColTemp: { width: 40 },
  dryingTableColWindow: { width: 98 },
  dryingTableColMoist: { width: 52, textAlign: 'right' },
  scheduleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F5132',
    lineHeight: 24,
    marginBottom: 8,
  },
});

