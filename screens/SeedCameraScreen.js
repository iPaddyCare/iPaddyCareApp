import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { useTranslation } from '../src/i18n/useTranslation';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SeedDetectionService from '../src/utils/seedDetectionService';

const { width, height } = Dimensions.get('window');

export default function SeedCameraScreen({ navigation }) {
  const translate = useTranslation('seedCamera');
  const insets = useSafeAreaInsets();
  const [detections, setDetections] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const camera = useRef(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

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
        showAppAlert(translate('common.error'), result.error || translate('noDetection'));
      }
    } catch (err) {
      console.error('Capture & analyze error:', err);
      const message = err.message || 'Failed to analyze photo';
      showAppAlert(translate('common.error'), message);
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
          <Text style={styles.permissionTitle}>{translate('common.permissionDenied')}</Text>
          <Text style={styles.permissionText}>{translate('cameraPermissionMessage')}</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>{translate('tryAgain')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButtonPermission}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{translate('back')}</Text>
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
            <Text style={styles.backButtonText}>{translate('back')}</Text>
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
          <Text style={styles.headerTitle}>{translate('title')}</Text>
          <Text style={styles.headerSubtitle}>{translate('subtitle')}</Text>
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
              <Text style={styles.processingText}>{translate('detecting')}</Text>
            </View>
          )}

          {/* No Detection Message + Capture Button (visible in empty state) */}
          {!isProcessing && detections.length === 0 && (
            <View style={styles.noDetectionContainer}>
              <Icon name="seed-off" size={48} color="rgba(255,255,255,0.7)" />
              <Text style={styles.noDetectionText}>{translate('noDetection')}</Text>
              <Text style={styles.captureHint}>{translate('captureHint')}</Text>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCaptureAndAnalyze}
                activeOpacity={0.8}
              >
                <Icon name="camera" size={28} color="#FFFFFF" />
                <Text style={styles.captureButtonText}>{translate('captureAndAnalyze')}</Text>
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
                <Text style={styles.captureButtonText}>{translate('captureAndAnalyze')}</Text>
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
