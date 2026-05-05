import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from '../src/i18n/useTranslation';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomNavigation from '../src/components/BottomNavigation';
import SeedDetectionService from '../src/utils/seedDetectionService';

const { width, height } = Dimensions.get('window');

export default function SeedDetectionScreen({ navigation }) {
  const translate = useTranslation('seedDetection');
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        showAppAlert(translate('common.error'), response.errorMessage || translate('photoPermissionMessage'));
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const mime = asset.type || 'image/jpeg';
        const imageBase64 = asset.base64
          ? `data:${mime};base64,${asset.base64}`
          : null;
        setSelectedImage({
          uri: asset.uri,
          type: mime,
          fileName: asset.fileName,
          imageBase64,
        });
        setDetectionResult(null);
      }
    });
  };

  const handleCameraLaunch = () => {
    navigation.navigate('SeedCamera');
  };

  const handleProcessImage = async () => {
    if (!selectedImage) {
      showAppAlert(translate('common.error'), translate('selectImageFirst'));
      return;
    }

    const imageBase64 = selectedImage.imageBase64;
    if (!imageBase64) {
      showAppAlert(translate('common.error'), translate('selectImageFirst'));
      return;
    }

    setProcessing(true);
    setDetectionResult(null);

    try {
      const result = await SeedDetectionService.predict(imageBase64);

      if (result.success && result.data) {
        const { predicted_class, confidence, class_id } = result.data;
        const qualityScore = confidence != null ? Math.round(Number(confidence) * 100) : 0;
        setDetectionResult({
          variety: predicted_class ?? 'Unknown',
          predicted_class,
          class_id,
          confidence: confidence != null ? Number(confidence) : 0,
          wildSeeds: false,
          qualityScore,
        });
      } else {
        showAppAlert(translate('common.error'), result.error || 'Detection failed');
      }
    } catch (err) {
      console.error('Process image error:', err);
      showAppAlert(translate('common.error'), err.message || 'Detection failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F5132" translucent={false} />
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        <View style={styles.statusBarContainer} />
      </SafeAreaView>
      <SafeAreaView style={styles.safeAreaContent} edges={['left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 72 + insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
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
                <Text style={styles.headerTitle}>{translate('title')}</Text>
              </View>
              <View style={styles.backButtonPlaceholder} />
            </View>
          </View>

          <View style={styles.innerContent}>
            {/* Action Buttons */}
            <Animated.View
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  marginTop: 20,
                },
              ]}
            >
              {/* Upload Image Button */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleImagePicker}
                activeOpacity={0.8}
              >
                <View style={styles.actionCardContent}>
                  <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E8' }]}>
                    <Icon name="image-plus" size={32} color="#4CAF50" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>{translate('uploadImage')}</Text>
                    <Text style={styles.actionDescription}>{translate('uploadImageDesc')}</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#999" />
                </View>
              </TouchableOpacity>

              {/* Live Detection Button */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleCameraLaunch}
                activeOpacity={0.8}
              >
                <View style={styles.actionCardContent}>
                  <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                    <Icon name="camera" size={32} color="#2196F3" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>{translate('liveDetection')}</Text>
                    <Text style={styles.actionDescription}>{translate('liveDetectionDesc')}</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#999" />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Selected Image Preview */}
            {selectedImage && (
              <Animated.View
                style={[
                  styles.imageCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <View style={styles.imageCardHeader}>
                  <Text style={styles.imageCardTitle}>{translate('selectImage')}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImage(null);
                      setDetectionResult(null);
                    }}
                  >
                    <Icon name="close-circle" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.processButton}
                  onPress={handleProcessImage}
                  disabled={processing}
                >
                  {processing ? (
                    <View style={styles.processButtonContent}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.processButtonText}>{translate('analyzing')}</Text>
                    </View>
                  ) : (
                    <Text style={styles.processButtonText}>{translate('processing')}</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Detection Result */}
            {detectionResult && (
              <Animated.View
                style={[
                  styles.resultCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <Text style={styles.resultTitle}>{translate('detectionResult')}</Text>
                <View style={styles.resultContent}>
                  <View style={styles.resultRow}>
                    <View style={styles.resultLabelContainer}>
                      <Icon name="seed" size={20} color="#4CAF50" />
                      <Text style={styles.resultLabel}>{translate('detectedVariety')}</Text>
                    </View>
                    <Text style={styles.resultValue}>{detectionResult.variety}</Text>
                  </View>
                  <View style={styles.resultDivider} />
                  <View style={styles.resultRow}>
                    <View style={styles.resultLabelContainer}>
                      <Icon name={detectionResult.wildSeeds ? "alert-circle" : "check-circle"} size={20} color={detectionResult.wildSeeds ? "#F44336" : "#4CAF50"} />
                      <Text style={styles.resultLabel}>{translate('wildSeedsDetected')}</Text>
                    </View>
                    <Text style={[styles.resultValue, detectionResult.wildSeeds && styles.wildSeedsTrue]}>
                      {detectionResult.wildSeeds ? 'Yes' : 'No'}
        </Text>
                  </View>
                  <View style={styles.resultDivider} />
                  <View style={styles.resultRow}>
                    <View style={styles.resultLabelContainer}>
                      <Icon name="chart-line" size={20} color="#2196F3" />
                      <Text style={styles.resultLabel}>{translate('qualityScore')}</Text>
                    </View>
                    <View style={styles.qualityContainer}>
                      <Text style={styles.resultValue}>{detectionResult.qualityScore}%</Text>
                      <View style={styles.qualityBar}>
                        <View style={[styles.qualityBarFill, { width: `${detectionResult.qualityScore}%` }]} />
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Placeholder when no image selected */}
            {!selectedImage && !detectionResult && (
              <Animated.View
                style={[
                  styles.emptyState,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <View style={styles.emptyIconContainer}>
                  <Icon name="image-outline" size={64} color="#CCC" />
                </View>
                <Text style={styles.emptyStateTitle}>{translate('noImageSelected')}</Text>
                <Text style={styles.emptyStateText}>{translate('selectImageFirst')}</Text>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNavigation />
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
    marginLeft: 4,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    marginTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 16,
    resizeMode: 'cover',
    backgroundColor: '#F0F0F0',
  },
  processButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  processButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    marginTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  resultContent: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  resultLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginLeft: 8,
  },
  resultValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  wildSeedsTrue: {
    color: '#F44336',
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  qualityContainer: {
    alignItems: 'flex-end',
  },
  qualityBar: {
    width: 120,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  qualityBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginTop: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
