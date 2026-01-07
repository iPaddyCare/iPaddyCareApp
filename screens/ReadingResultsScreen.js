import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../src/context/LanguageContext';
import PredictionService from '../src/utils/predictionService';

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
      
      if (result.success) {
        setPredictions(result.data);
      } else {
        setPredictionError(result.error);
        // Still set predictions if mock data is available
        if (result.data) {
          setPredictions(result.data);
        }
      }
    } catch (error) {
      setPredictionError(error.message);
    } finally {
      setLoadingPredictions(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'dry':
        return '#F44336';
      case 'moderate':
        return '#FF9800';
      case 'wet':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'dry':
        return t.dry;
      case 'moderate':
        return t.moderate;
      case 'wet':
        return t.wet;
      default:
        return status || '-';
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
            {/* Average Moisture Card */}
            <View style={styles.averageCard}>
              <Text style={styles.averageLabel}>{t.averageMoisture}</Text>
              <Text style={styles.averageValue}>
                {readingData.averageMoisture.toFixed(1)}{t.percent}
              </Text>
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
              {readingData.temperature && (
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Icon name="thermometer" size={20} color="#FF9800" />
                    <Text style={styles.summaryLabel}>{t.temperature}</Text>
                    <Text style={styles.summaryValue}>
                      {readingData.temperature.toFixed(1)}{t.celsius}
                    </Text>
                  </View>
                  {readingData.humidity && (
                    <View style={styles.summaryItem}>
                      <Icon name="water" size={20} color="#9C27B0" />
                      <Text style={styles.summaryLabel}>{t.humidity}</Text>
                      <Text style={styles.summaryValue}>
                        {readingData.humidity.toFixed(1)}{t.percent}
                      </Text>
                    </View>
                  )}
                </View>
              )}
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

            {/* Finalized Moisture Level */}
            <View style={styles.moistureLevelCard}>
              <Text style={styles.moistureLevelLabel}>{t.moisture}</Text>
              <Text style={styles.moistureLevelValue}>
                {readingData.averageMoisture.toFixed(1)}{t.percent}
              </Text>
            </View>

            {/* Predictions */}
            <View style={styles.predictionsCard}>
              <Text style={styles.predictionsTitle}>{t.predictions}</Text>
              
              {loadingPredictions ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0F5132" />
                  <Text style={styles.loadingText}>{t.loadingPredictions}</Text>
                </View>
              ) : predictions ? (
                <>
                  {/* Today Predictions */}
                  <View style={styles.predictionDay}>
                    <Text style={styles.predictionDayTitle}>{t.today}</Text>
                    {predictions.today ? (
                      <View style={styles.predictionCard}>
                        {predictions.today.status === 'good' ? (
                          <Text style={styles.predictionText}>{t.goodMoisture}</Text>
                        ) : predictions.today.status === 'over_dried' ? (
                          <Text style={styles.predictionText}>{t.overDried}</Text>
                        ) : predictions.today.hours > 0 ? (
                          <Text style={styles.predictionText}>
                            {t.dry} {predictions.today.hours} {predictions.today.hours === 1 ? t.hour : t.hours} {t.from} {predictions.today.time} {t.today.toLowerCase()}
                          </Text>
                        ) : (
                          <Text style={styles.predictionText}>No action needed</Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.noPredictionsText}>No predictions available</Text>
                    )}
                  </View>

                  {/* Tomorrow Predictions */}
                  <View style={styles.predictionDay}>
                    <Text style={styles.predictionDayTitle}>{t.tomorrow}</Text>
                    {predictions.tomorrow ? (
                      <View style={styles.predictionCard}>
                        {predictions.tomorrow.status === 'good' ? (
                          <Text style={styles.predictionText}>{t.goodMoisture}</Text>
                        ) : predictions.tomorrow.status === 'over_dried' ? (
                          <Text style={styles.predictionText}>{t.overDried}</Text>
                        ) : predictions.tomorrow.hours > 0 ? (
                          <Text style={styles.predictionText}>
                            {t.dry} {predictions.tomorrow.hours} {predictions.tomorrow.hours === 1 ? t.hour : t.hours} {t.from} {predictions.tomorrow.time} {t.tomorrow.toLowerCase()}
                          </Text>
                        ) : (
                          <Text style={styles.predictionText}>No action needed</Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.noPredictionsText}>No predictions available</Text>
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={32} color="#F44336" />
                  <Text style={styles.errorText}>{predictionError || t.predictionError}</Text>
                </View>
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
});

