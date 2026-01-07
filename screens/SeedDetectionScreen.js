import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { useLanguage } from '../src/context/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    title: 'Seed Quality Detection',
    subtitle: 'AI-powered paddy seed variety detection',
    description: 'Detect paddy seed varieties and identify wild seeds using AI technology',
    uploadImage: 'Upload Image',
    uploadImageDesc: 'Select an image from your gallery',
    liveDetection: 'Live Detection',
    liveDetectionDesc: 'Open camera for real-time detection',
    selectImage: 'Selected Image',
    processing: 'Analyzing...',
    detectionResult: 'Detection Result',
    detectedVariety: 'Detected Variety',
    wildSeedsDetected: 'Wild Seeds Detected',
    qualityScore: 'Quality Score',
    noImageSelected: 'No image selected',
    selectImageFirst: 'Please select an image first',
    permissionDenied: 'Permission Denied',
    photoPermissionMessage: 'Photo library permission is required to select images',
    error: 'Error',
    tryAgain: 'Try Again',
    analyzing: 'Analyzing seed quality...',
    selectOption: 'Select Detection Method',
  },
  සිංහල: {
    title: 'බීජ ගුණත්ව හඳුනාගැනීම',
    subtitle: 'AI බලයෙන් වී බීජ වර්ග හඳුනාගැනීම',
    description: 'AI තාක්ෂණය භාවිතා කරමින් වී බීජ වර්ග හඳුනාගෙන වල් බීජ හඳුනාගන්න',
    uploadImage: 'රූපය උඩුගත කරන්න',
    uploadImageDesc: 'ඔබේ ප්‍රදර්ශනයෙන් රූපයක් තෝරන්න',
    liveDetection: 'සජීවී හඳුනාගැනීම',
    liveDetectionDesc: 'තත්‍ය කාලීන හඳුනාගැනීම සඳහා කැමරාව විවෘත කරන්න',
    selectImage: 'තෝරාගත් රූපය',
    processing: 'විශ්ලේෂණය කරමින්...',
    detectionResult: 'හඳුනාගැනීමේ ප්‍රතිඵලය',
    detectedVariety: 'හඳුනාගත් වර්ගය',
    wildSeedsDetected: 'වල් බීජ හඳුනාගෙන ඇත',
    qualityScore: 'ගුණත්ව අගය',
    noImageSelected: 'රූපයක් තෝරාගෙන නොමැත',
    selectImageFirst: 'කරුණාකර මුලින්ම රූපයක් තෝරන්න',
    permissionDenied: 'අවසරය ප්‍රතික්ෂේප කරන ලදී',
    photoPermissionMessage: 'රූප තෝරාගැනීම සඳහා ඡායාරූප පුස්තකාල අවසරය අවශ්‍යයි',
    error: 'දෝෂය',
    tryAgain: 'නැවත උත්සාහ කරන්න',
    analyzing: 'බීජ ගුණත්වය විශ්ලේෂණය කරමින්...',
    selectOption: 'හඳුනාගැනීමේ ක්‍රමය තෝරන්න',
  },
  தமிழ்: {
    title: 'விதை தர கண்டறிதல்',
    subtitle: 'AI சக்தியால் நெல் விதை வகை கண்டறிதல்',
    description: 'AI தொழில்நுட்பத்தைப் பயன்படுத்தி நெல் விதை வகைகளை கண்டறிந்து காட்டு விதைகளை அடையாளம் காணவும்',
    uploadImage: 'படத்தை பதிவேற்றவும்',
    uploadImageDesc: 'உங்கள் புகைப்படத்திலிருந்து ஒரு படத்தைத் தேர்ந்தெடுக்கவும்',
    liveDetection: 'நேரடி கண்டறிதல்',
    liveDetectionDesc: 'நிகழ்நேர கண்டறிதலுக்கு கேமராவைத் திறக்கவும்',
    selectImage: 'தேர்ந்தெடுக்கப்பட்ட படம்',
    processing: 'பகுப்பாய்வு செய்கிறது...',
    detectionResult: 'கண்டறிதல் முடிவு',
    detectedVariety: 'கண்டறியப்பட்ட வகை',
    wildSeedsDetected: 'காட்டு விதைகள் கண்டறியப்பட்டன',
    qualityScore: 'தர மதிப்பு',
    noImageSelected: 'படம் தேர்ந்தெடுக்கப்படவில்லை',
    selectImageFirst: 'தயவுசெய்து முதலில் படத்தைத் தேர்ந்தெடுக்கவும்',
    permissionDenied: 'அனுமதி மறுக்கப்பட்டது',
    photoPermissionMessage: 'படங்களைத் தேர்ந்தெடுக்க புகைப்பட நூலக அனுமதி தேவை',
    error: 'பிழை',
    tryAgain: 'மீண்டும் முயற்சிக்கவும்',
    analyzing: 'விதை தரத்தை பகுப்பாய்வு செய்கிறது...',
    selectOption: 'கண்டறிதல் முறையைத் தேர்ந்தெடுக்கவும்',
  },
};

export default function SeedDetectionScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const t = translations[selectedLanguage];

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
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert(t.error, response.errorMessage || t.photoPermissionMessage);
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedImage({
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName,
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
      Alert.alert(t.error, t.selectImageFirst);
      return;
    }

    setProcessing(true);
    // TODO: Integrate with your AI model API
    // Simulating processing for now
    setTimeout(() => {
      setProcessing(false);
      setDetectionResult({
        variety: 'Basmati',
        wildSeeds: true,
        qualityScore: 92,
      });
    }, 2000);
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
                <Text style={styles.headerTitle}>{t.title}</Text>
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
                    <Text style={styles.actionTitle}>{t.uploadImage}</Text>
                    <Text style={styles.actionDescription}>{t.uploadImageDesc}</Text>
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
                    <Text style={styles.actionTitle}>{t.liveDetection}</Text>
                    <Text style={styles.actionDescription}>{t.liveDetectionDesc}</Text>
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
                  <Text style={styles.imageCardTitle}>{t.selectImage}</Text>
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
                      <Text style={styles.processButtonText}>{t.analyzing}</Text>
                    </View>
                  ) : (
                    <Text style={styles.processButtonText}>{t.processing}</Text>
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
                <Text style={styles.resultTitle}>{t.detectionResult}</Text>
                <View style={styles.resultContent}>
                  <View style={styles.resultRow}>
                    <View style={styles.resultLabelContainer}>
                      <Icon name="seed" size={20} color="#4CAF50" />
                      <Text style={styles.resultLabel}>{t.detectedVariety}</Text>
                    </View>
                    <Text style={styles.resultValue}>{detectionResult.variety}</Text>
                  </View>
                  <View style={styles.resultDivider} />
                  <View style={styles.resultRow}>
                    <View style={styles.resultLabelContainer}>
                      <Icon name={detectionResult.wildSeeds ? "alert-circle" : "check-circle"} size={20} color={detectionResult.wildSeeds ? "#F44336" : "#4CAF50"} />
                      <Text style={styles.resultLabel}>{t.wildSeedsDetected}</Text>
                    </View>
                    <Text style={[styles.resultValue, detectionResult.wildSeeds && styles.wildSeedsTrue]}>
                      {detectionResult.wildSeeds ? 'Yes' : 'No'}
        </Text>
                  </View>
                  <View style={styles.resultDivider} />
                  <View style={styles.resultRow}>
                    <View style={styles.resultLabelContainer}>
                      <Icon name="chart-line" size={20} color="#2196F3" />
                      <Text style={styles.resultLabel}>{t.qualityScore}</Text>
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
                <Text style={styles.emptyStateTitle}>{t.noImageSelected}</Text>
                <Text style={styles.emptyStateText}>{t.selectImageFirst}</Text>
              </Animated.View>
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
