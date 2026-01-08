import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useLanguage } from '../src/context/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    title: 'Live Seed Detection',
    subtitle: 'Point camera at seeds for real-time detection',
    back: 'Back',
    detecting: 'Detecting...',
    noDetection: 'No seeds detected',
    detectedVariety: 'Detected Variety',
    wildSeeds: 'Wild Seeds',
    quality: 'Quality',
    permissionDenied: 'Permission Denied',
    cameraPermissionMessage: 'Camera permission is required for live detection',
    error: 'Error',
    tryAgain: 'Try Again',
    yes: 'Yes',
    no: 'No',
  },
  සිංහල: {
    title: 'සජීවී බීජ හඳුනාගැනීම',
    subtitle: 'තත්‍ය කාලීන හඳුනාගැනීම සඳහා කැමරාව බීජ වෙත යොමු කරන්න',
    back: 'ආපසු',
    detecting: 'හඳුනාගනිමින්...',
    noDetection: 'බීජ හඳුනාගෙන නොමැත',
    detectedVariety: 'හඳුනාගත් වර්ගය',
    wildSeeds: 'වල් බීජ',
    quality: 'ගුණත්වය',
    permissionDenied: 'අවසරය ප්‍රතික්ෂේප කරන ලදී',
    cameraPermissionMessage: 'සජීවී හඳුනාගැනීම සඳහා කැමරා අවසරය අවශ්‍යයි',
    error: 'දෝෂය',
    tryAgain: 'නැවත උත්සාහ කරන්න',
    yes: 'ඔව්',
    no: 'නැත',
  },
  தமிழ்: {
    title: 'நேரடி விதை கண்டறிதல்',
    subtitle: 'நிகழ்நேர கண்டறிதலுக்காக கேமராவை விதைகளை நோக்கி பிடிக்கவும்',
    back: 'பின்',
    detecting: 'கண்டறிகிறது...',
    noDetection: 'விதைகள் கண்டறியப்படவில்லை',
    detectedVariety: 'கண்டறியப்பட்ட வகை',
    wildSeeds: 'காட்டு விதைகள்',
    quality: 'தரம்',
    permissionDenied: 'அனுமதி மறுக்கப்பட்டது',
    cameraPermissionMessage: 'நேரடி கண்டறிதலுக்கு கேமரா அனுமதி தேவை',
    error: 'பிழை',
    tryAgain: 'மீண்டும் முயற்சிக்கவும்',
    yes: 'ஆம்',
    no: 'இல்லை',
  },
};

// Mock detection function - replace with your actual ML model
const detectSeeds = (frame) => {
  // TODO: Replace with actual ML model inference
  // This is a placeholder that simulates detection
  // In real implementation, process frame with your model
  
  // Simulate detection with some randomness
  const shouldDetect = Math.random() > 0.3; // 70% chance of detection
  
  if (!shouldDetect) {
    return null;
  }

  // Simulate bounding boxes and detection results
  const detections = [];
  const numDetections = Math.floor(Math.random() * 3) + 1; // 1-3 detections
  
  // Available varieties: BG_375, suwadel, perumal, wild seeds
  const varieties = ['BG_375', 'suwadel', 'perumal'];
  
  for (let i = 0; i < numDetections; i++) {
    const isWild = Math.random() > 0.7; // 30% chance of wild seeds
    const variety = isWild ? 'wild seeds' : varieties[Math.floor(Math.random() * varieties.length)];
    
    detections.push({
      x: Math.random() * (width - 100) + 50,
      y: Math.random() * (height - 200) + 100,
      width: 80 + Math.random() * 60,
      height: 80 + Math.random() * 60,
      variety: variety,
      confidence: 0.7 + Math.random() * 0.25,
      isWild: isWild,
    });
  }
  
  return detections;
};

export default function SeedCameraScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [detections, setDetections] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const camera = useRef(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const detectionInterval = useRef(null);

  const t = translations[selectedLanguage];

  useEffect(() => {
    // Request camera permission on mount
    if (!hasPermission) {
      requestPermission();
    }

    return () => {
      // Cleanup interval
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, [hasPermission, requestPermission]);

  // Simulate real-time detection
  useEffect(() => {
    if (hasPermission && device) {
      // Simulate detection every 500ms
      detectionInterval.current = setInterval(() => {
        setIsProcessing(true);
        // Simulate detection delay
        setTimeout(() => {
          const mockDetections = detectSeeds(null);
          setDetections(mockDetections || []);
          setIsProcessing(false);
        }, 100);
      }, 500);

      return () => {
        if (detectionInterval.current) {
          clearInterval(detectionInterval.current);
        }
      };
    }
  }, [hasPermission, device]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.permissionContainer}>
          <Icon name="camera-off" size={64} color="#666" />
          <Text style={styles.permissionTitle}>{t.permissionDenied}</Text>
          <Text style={styles.permissionText}>{t.cameraPermissionMessage}</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>{t.tryAgain}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButtonPermission}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{t.back}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.permissionContainer}>
          <Icon name="camera-off" size={64} color="#666" />
          <Text style={styles.permissionTitle}>Camera Not Available</Text>
          <TouchableOpacity
            style={styles.backButtonPermission}
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
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        <View style={styles.statusBarContainer} />
      </SafeAreaView>
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 24 : 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          orientation="portrait"
        />

        {/* Detection Overlay */}
        <View style={styles.overlay}>
          {detections.map((detection, index) => (
            <View
              key={index}
              style={[
                styles.boundingBox,
                {
                  left: detection.x,
                  top: detection.y,
                  width: detection.width,
                  height: detection.height,
                  borderColor: detection.isWild ? '#F44336' : '#4CAF50',
                },
              ]}
            >
              {/* Label */}
              <View
                style={[
                  styles.labelContainer,
                  {
                    backgroundColor: detection.isWild ? '#F44336' : '#4CAF50',
                  },
                ]}
              >
                <Text style={styles.labelText}>{detection.variety}</Text>
                {detection.isWild && (
                  <View style={styles.wildBadge}>
                    <Text style={styles.wildBadgeText}>{t.wildSeeds}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Processing Indicator */}
          {isProcessing && (
            <View style={styles.processingIndicator}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.processingText}>{t.detecting}</Text>
            </View>
          )}

          {/* No Detection Message */}
          {!isProcessing && detections.length === 0 && (
            <View style={styles.noDetectionContainer}>
              <Icon name="seed-off" size={48} color="rgba(255,255,255,0.7)" />
              <Text style={styles.noDetectionText}>{t.noDetection}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Detection Summary */}
      {detections.length > 0 && (
        <View style={styles.summaryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.summaryContent}
          >
            {detections.map((detection, index) => (
              <View key={index} style={styles.summaryCard}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: detection.isWild ? '#F44336' + '20' : '#4CAF50' + '20' },
                  ]}
                >
                  <Icon
                    name={detection.isWild ? 'alert-circle' : 'check-circle'}
                    size={20}
                    color={detection.isWild ? '#F44336' : '#4CAF50'}
                  />
                </View>
                <Text style={styles.summaryVariety}>{detection.variety}</Text>
                <Text style={styles.summaryQuality}>
                  {Math.round(detection.confidence * 100)}%
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeAreaTop: {
    backgroundColor: '#000000',
  },
  statusBarContainer: {
    height: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  placeholder: {
    width: 40,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 8,
  },
  labelContainer: {
    position: 'absolute',
    top: -30,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  wildBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  wildBadgeText: {
    color: '#F44336',
    fontSize: 10,
    fontWeight: '700',
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  noDetectionContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    borderRadius: 16,
  },
  noDetectionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  summaryContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  summaryContent: {
    paddingHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryVariety: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryQuality: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#000000',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backButtonPermission: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
