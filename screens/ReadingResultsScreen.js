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

  useEffect(() => {
    if (readingData) {
      loadPredictions();
    }
  }, [readingData]);

  const loadPredictions = async () => {
    setLoadingPredictions(true);
    setPredictionError(null);
    
    try {
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

  // Calculate bulk density (g/cm³) from weight and estimated volume
  // Assuming a standard sample container volume or calculate from dimensions
  const calculateBulkDensity = () => {
    // Using hardcoded sample weight of 5g
    const sampleWeight = 5; // grams
    // Standard sample container volume (adjust based on actual container)
    // For now, using a typical value - this should be calibrated based on actual device
    const sampleVolume = 50; // cm³ (adjust based on actual container)
    return sampleWeight / sampleVolume;
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
    // Schedule for Day 1 (Today: 11:00 - 14:00)
    const day1Schedule = {
      startTime: '11:00',
      endTime: '14:00',
      date: new Date(),
    };

    // Schedule for Day 2 (Tomorrow: 10:00 - 14:00)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day2Schedule = {
      startTime: '10:00',
      endTime: '14:00',
      date: tomorrow,
    };

    // Schedule notifications for both days
    const day1Success = await NotificationService.scheduleDryingNotifications(day1Schedule);
    const day2Success = await NotificationService.scheduleDryingNotifications(day2Schedule);
    
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
                    28{t.celsius}
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
                    5{t.grams}
                  </Text>
                </View>

                {/* Bulk Density */}
                <View style={styles.sensorReadingItem}>
                  <Icon name="cube-outline" size={20} color="#607D8B" />
                  <Text style={styles.sensorReadingLabel}>{t.bulkDensity}</Text>
                  <Text style={styles.sensorReadingValue}>
                    {calculateBulkDensity() !== null
                      ? `${calculateBulkDensity().toFixed(2)}${t.gPerCm3}`
                      : `--${t.gPerCm3}`}
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

            {/* Weather Card */}
            {readingData.weather && (
              <View style={styles.weatherCard}>
                <Text style={styles.weatherTitle}>{t.weather}</Text>
                <View style={styles.weatherRow}>
                  <View style={styles.weatherItem}>
                    <Text style={styles.weatherLabel}>{t.location}</Text>
                    <Text style={styles.weatherValue}>
                      {readingData.weather.location.city}, {readingData.weather.location.country}
                    </Text>
                  </View>
                  <View style={styles.weatherItem}>
                    <Text style={styles.weatherLabel}>{t.temperature}</Text>
                    <Text style={styles.weatherValue}>
                      {readingData.weather.temperature.toFixed(1)}{t.celsius}
                    </Text>
                  </View>
                </View>
                <Text style={styles.weatherDescription}>
                  {readingData.weather.description}
                </Text>
              </View>
            )}

            {/* Weather-Aware Drying Schedule */}
            <View style={styles.scheduleCard}>
              <Text style={styles.scheduleTitle}>{t.weatherAwareSchedule}</Text>
              
              {loadingPredictions ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0F5132" />
                  <Text style={styles.loadingText}>{t.loadingPredictions}</Text>
                </View>
              ) : (
                <>
                  {/* Day 1 Schedule */}
                  <View style={styles.scheduleDayContainer}>
                    <Text style={styles.scheduleDayTitle}>{t.today}</Text>
                    <View style={styles.scheduleItem}>
                      <View style={styles.scheduleItemHeader}>
                        <Icon name="clock-start" size={20} color="#4CAF50" />
                        <Text style={styles.scheduleItemLabel}>{t.scheduleStart}</Text>
                      </View>
                      <View style={styles.scheduleTimeContainer}>
                        <Text style={styles.scheduleDateText}>
                          {new Date().toLocaleDateString()}
                        </Text>
                        <Text style={styles.scheduleTimeText}>11:00</Text>
                      </View>
                    </View>
                    <View style={styles.scheduleItem}>
                      <View style={styles.scheduleItemHeader}>
                        <Icon name="clock-end" size={20} color="#F44336" />
                        <Text style={styles.scheduleItemLabel}>{t.scheduleEnd}</Text>
                      </View>
                      <View style={styles.scheduleTimeContainer}>
                        <Text style={styles.scheduleDateText}>
                          {new Date().toLocaleDateString()}
                        </Text>
                        <Text style={styles.scheduleTimeText}>14:00</Text>
                      </View>
                    </View>
                  </View>

                  {/* Day 2 Schedule */}
                  <View style={styles.scheduleDayContainer}>
                    <Text style={styles.scheduleDayTitle}>{t.tomorrow}</Text>
                    <View style={styles.scheduleItem}>
                      <View style={styles.scheduleItemHeader}>
                        <Icon name="clock-start" size={20} color="#4CAF50" />
                        <Text style={styles.scheduleItemLabel}>{t.scheduleStart}</Text>
                      </View>
                      <View style={styles.scheduleTimeContainer}>
                        <Text style={styles.scheduleDateText}>
                          {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </Text>
                        <Text style={styles.scheduleTimeText}>10:00</Text>
                      </View>
                    </View>
                    <View style={styles.scheduleItem}>
                      <View style={styles.scheduleItemHeader}>
                        <Icon name="clock-end" size={20} color="#F44336" />
                        <Text style={styles.scheduleItemLabel}>{t.scheduleEnd}</Text>
                      </View>
                      <View style={styles.scheduleTimeContainer}>
                        <Text style={styles.scheduleDateText}>
                          {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </Text>
                        <Text style={styles.scheduleTimeText}>14:00</Text>
                      </View>
                    </View>
                  </View>

                  {/* Notification Toggle */}
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
  scheduleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F5132',
    lineHeight: 24,
    marginBottom: 8,
  },
});

