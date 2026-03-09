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
import RNFS from 'react-native-fs';
import { useLanguage } from '../src/context/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SeedDetectionService from '../src/utils/seedDetectionService';

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
    captureAndAnalyze: 'Capture & Analyze',
    captureHint: 'Tap button below to capture & analyze',
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
    captureAndAnalyze: 'ග්‍රහණය කර විශ්ලේෂණය කරන්න',
    captureHint: 'ග්‍රහණය කර විශ්ලේෂණය කිරීමට පහත බොත්තම තට්ටු කරන්න',
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
    captureAndAnalyze: 'பிடித்து பகுப்பாய்வு செய்',
    captureHint: 'பிடித்து பகுப்பாய்வு செய்ய கீழ் பொத்தானை தட்டவும்',
  },
};

export default function SeedCameraScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [detections, setDetections] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const camera = useRef(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const t = translations[selectedLanguage];

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleCaptureAndAnalyze = async () => {
    if (!camera.current || isProcessing) return;

    setIsProcessing(true);
    setDetections([]);

    try {
      const photo = await camera.current.takePhoto({ flash: 'off' });
      const filePath = photo.path.startsWith('file://') ? photo.path.replace('file://', '') : photo.path;

      if (!filePath || !(await RNFS.exists(filePath))) {
        throw new Error('Photo file not found. Please try again.');
      }

      const base64 = await RNFS.readFile(filePath, 'base64');
      const imageBase64 = `data:image/jpeg;base64,${base64}`;

      const result = await SeedDetectionService.predictLive(imageBase64);
      

      if (result.success && result.data && result.data.predictions && result.data.predictions.length > 0) {
        const list = result.data.predictions.map((p) => {
          const predictedClass = p.predicted_class || '';
          const isWild = /wild/i.test(predictedClass);
          return {
            variety: predictedClass || 'Unknown',
            confidence: p.confidence,
            isWild,
          };
        });
        setDetections(list);
      } else {
        Alert.alert(t.error, result.error || t.noDetection);
      }
    } catch (err) {
      console.error('Capture & analyze error:', err);
      const message = err.message || 'Failed to analyze photo';
      Alert.alert(t.error, message);
    } finally {
      setIsProcessing(false);
    }
  };

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
          photo={true}
          orientation="portrait"
        />

        {/* Detection Overlay */}
        <View style={styles.overlay} pointerEvents="box-none">
          {/* Processing Indicator */}
          {isProcessing && (
            <View style={styles.processingIndicator}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.processingText}>{t.detecting}</Text>
            </View>
          )}

          {/* No Detection Message + Capture Button (visible in empty state) */}
          {!isProcessing && detections.length === 0 && (
            <View style={styles.noDetectionContainer}>
              <Icon name="seed-off" size={48} color="rgba(255,255,255,0.7)" />
              <Text style={styles.noDetectionText}>{t.noDetection}</Text>
              <Text style={styles.captureHint}>{t.captureHint}</Text>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCaptureAndAnalyze}
                activeOpacity={0.8}
              >
                <Icon name="camera" size={28} color="#FFFFFF" />
                <Text style={styles.captureButtonText}>{t.captureAndAnalyze}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Detection Result - Top Right Corner */}
          {detections.length > 0 && (
            <View style={styles.resultTopRight}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.resultTopRightContent}
              >
                {detections.map((detection, index) => (
                  <View key={index} style={styles.resultCard}>
                    <View
                      style={[
                        styles.resultCardIcon,
                        { backgroundColor: detection.isWild ? '#F44336' + '30' : '#4CAF50' + '30' },
                      ]}
                    >
                      <Icon
                        name={detection.isWild ? 'alert-circle' : 'check-circle'}
                        size={16}
                        color={detection.isWild ? '#F44336' : '#4CAF50'}
                      />
                    </View>
                    <Text style={styles.resultCardVariety} numberOfLines={1}>{detection.variety}</Text>
                    <Text style={styles.resultCardQuality}>
                      {Math.round(detection.confidence * 100)}%
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Capture & Analyze Button when we have results (so user can capture again) */}
          {!isProcessing && detections.length > 0 && (
            <View style={[styles.captureButtonContainer, { bottom: 88 + insets.bottom }]}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCaptureAndAnalyze}
                activeOpacity={0.8}
              >
                <Icon name="camera" size={28} color="#FFFFFF" />
                <Text style={styles.captureButtonText}>{t.captureAndAnalyze}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
    padding: 24,
    borderRadius: 16,
    maxWidth: width * 0.85,
  },
  noDetectionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  captureHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 28,
    gap: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resultTopRight: {
    position: 'absolute',
    right: 12,
    top: 12,
    maxHeight: '55%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 12,
    minWidth: 180,
    maxWidth: 260,
    width: width * 0.7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  resultTopRightContent: {
    paddingVertical: 4,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  resultCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  resultCardVariety: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  resultCardQuality: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginLeft: 4,
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
