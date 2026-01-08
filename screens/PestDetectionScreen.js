import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  PermissionsAndroid,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Upload, CheckCircle, AlertCircle, X, MessageCircle, Send } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { TextInput } from 'react-native';
import { Camera as VisionCamera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ragService from '../src/services/ragService';
import pestDetectionService from '../src/services/pestDetectionService';
import llmService from '../src/services/LLMService';

const { width, height } = Dimensions.get('window');

export default function PestDetectionScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState(null);
  const [servicesReady, setServicesReady] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef(null);
  const mainScrollViewRef = useRef(null);
  const chatSectionRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Initialize services on mount
  useEffect(() => {
    initializeServices();
  }, []);

  // Animation on mount
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

  // Debug: Log when imageUri changes
  useEffect(() => {
    if (imageUri) {
      console.log('🖼️ imageUri state updated:', imageUri);
      console.log('🖼️ imageUri length:', imageUri.length);
      console.log('🖼️ imageUri starts with file://:', imageUri.startsWith('file://'));
    } else {
      console.log('🖼️ imageUri cleared');
    }
  }, [imageUri]);

  // Auto-scroll main view when new messages arrive
  useEffect(() => {
    if (showChat && chatMessages.length > 0 && mainScrollViewRef.current) {
      setTimeout(() => {
        mainScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [chatMessages, showChat]);

  // Scroll main view to chat section when chat opens
  useEffect(() => {
    if (showChat && mainScrollViewRef.current) {
      // Scroll to bottom of main ScrollView to show chat section
      setTimeout(() => {
        mainScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 400);
    }
  }, [showChat]);

  const initializeServices = async () => {
    try {
      // Initialize RAG service
      await ragService.initialize();
      
      // Initialize Pest Detection model
      await pestDetectionService.initializeModel();
      
      // Try to load LLM API key from storage
      await llmService.loadFromStorage();
      
      setServicesReady(true);
    } catch (error) {
      console.error('Failed to initialize services:', error);
      Alert.alert('Error', 'Failed to initialize detection services');
    }
  };


  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    if (!hasPermission) {
      const permissionResult = await requestPermission();
      if (!permissionResult) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }
    }
    setShowCamera(true);
  };

  const takePicture = async () => {
    try {
      if (!cameraRef.current) {
        Alert.alert('Error', 'Camera not ready');
        return;
      }
      
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
        photoFormat: 'jpeg', // Force JPEG - React Native Image can't render HEIC/HEIF
      });
      
      // Vision Camera returns raw path, React Native Image REQUIRES file:// prefix on Android
      const uri = `file://${photo.path}`;
      
      console.log('📸 Photo path:', photo.path);
      console.log('📸 Photo format:', photo.format || 'unknown');
      console.log('📸 Final URI:', uri);
      
      setImageUri(uri);
      setResult(null);
      setShowCamera(false);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          const uri = response.assets[0].uri;
          console.log('🖼️ Gallery image selected, URI:', uri);
          // Ensure proper URI format for Android
          const imagePath = Platform.OS === 'android' && !uri.startsWith('file://') && !uri.startsWith('content://')
            ? `file://${uri}`
            : uri;
          setImageUri(imagePath);
          setResult(null);
        }
      }
    );
  };

  const detectDisease = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    if (!servicesReady) {
      Alert.alert('Error', 'Services not ready yet');
      return;
    }

    setDetecting(true);
    setResult(null);

    try {
      // Step 1: Run CNN model to detect disease
      const prediction = await pestDetectionService.predict(imageUri);
      
      // Step 2: Use RAG to get solutions
      const solution = ragService.getSolution(prediction.disease);

      setResult({
        prediction,
        solution,
      });
    } catch (error) {
      console.error('Detection error:', error);
      Alert.alert('Error', 'Failed to detect disease. Please try again.');
    } finally {
      setDetecting(false);
    }
  };

  const clearImage = () => {
    setImageUri(null);
    setResult(null);
    setShowChat(false);
    setChatMessages([]);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !result || !result.solution.found) {
      return;
    }

    if (!llmService.isInitialized()) {
      setShowApiKeyModal(true);
      return;
    }

    const userMessage = chatInput.trim();
    setChatInput('');
    setSendingMessage(true);

    // Add user message to chat
    const newMessages = [...chatMessages, { role: 'user', content: userMessage }];
    setChatMessages(newMessages);

    try {
      // Get RAG context from current result
      const ragContext = result.solution;
      
      // Generate response using LLM with RAG context
      const response = await llmService.generateResponse(userMessage, ragContext);
      
      // Add AI response to chat
      setChatMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('Error', 'Failed to get response. Please check your internet connection and API key.');
      setChatMessages(newMessages.slice(0, -1)); // Remove user message on error
    } finally {
      setSendingMessage(false);
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
          ref={mainScrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 72 + insets.bottom + 20 }
          ]}
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
                onPress={() => navigation?.openDrawer?.()}
              >
                <Text style={styles.menuIcon}>☰</Text>
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Pest & Disease Detection</Text>
              </View>
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
              {!imageUri && (
                <>
                  {/* Camera Button */}
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={openCamera}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionCardContent}>
                      <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E8' }]}>
                        <Icon name="camera" size={32} color="#4CAF50" />
                      </View>
                      <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>Take Photo</Text>
                        <Text style={styles.actionDescription}>Capture plant images using camera</Text>
                      </View>
                      <Icon name="chevron-right" size={24} color="#999" />
                    </View>
                  </TouchableOpacity>

                  {/* Gallery Button */}
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={openGallery}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionCardContent}>
                      <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                        <Icon name="image-plus" size={32} color="#2196F3" />
                      </View>
                      <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>Choose from Gallery</Text>
                        <Text style={styles.actionDescription}>Select an image from your gallery</Text>
                      </View>
                      <Icon name="chevron-right" size={24} color="#999" />
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>

            {/* Selected Image Preview */}
            {imageUri && (
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
                  <Text style={styles.imageCardTitle}>Selected Image</Text>
                  <TouchableOpacity onPress={clearImage}>
                    <Icon name="close-circle" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <Image 
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                  onLoad={() => {
                    console.log('✅ Image loaded successfully');
                  }}
                  onError={(e) => {
                    console.error('❌ Image error:', e.nativeEvent);
                  }}
                />
                {!detecting && (
                  <View style={styles.imageActionsContainer}>
                    <TouchableOpacity
                      style={styles.processButton}
                      onPress={detectDisease}
                      disabled={!servicesReady}
                    >
                      <Text style={styles.processButtonText}>Detect Disease</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.changeImageButton}
                      onPress={handleImagePicker}
                    >
                      <Text style={styles.changeImageButtonText}>Change Image</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {detecting && (
                  <View style={styles.processButton}>
                    <View style={styles.processButtonContent}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.processButtonText}>Analyzing image...</Text>
                    </View>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Results */}
            {result && (
              <Animated.View
                style={[
                  styles.resultCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
            <View style={styles.resultHeader}>
              {result.solution.found ? (
                <CheckCircle size={24} color="#4CAF50" />
              ) : (
                <AlertCircle size={24} color="#FF9800" />
              )}
              <Text style={styles.resultTitle}>
                {result.solution.found ? 'Disease Detected' : 'Disease Not Found'}
              </Text>
            </View>

            {result.solution.found && (
              <>
                {/* Only show disease details if confidence >= 60% (or if it's "normal" - healthy crop) */}
                {result.prediction.confidence >= 0.6 || result.solution.diseaseName === 'Healthy Crop' ? (
                  <>
                    <View style={styles.diseaseInfo}>
                      <Text style={styles.diseaseName}>{result.solution.diseaseName}</Text>
                      {result.solution.aliases && result.solution.aliases.length > 0 && (
                        <View style={styles.aliasesContainer}>
                          <Text style={styles.aliasesLabel}>Also known as: </Text>
                          <Text style={styles.aliasesText}>
                            {result.solution.aliases.join(', ')}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.confidence}>
                        Confidence: {(result.prediction.confidence * 100).toFixed(1)}%
                      </Text>
                      {result.prediction.isLowConfidence && (
                        <View style={styles.lowConfidenceWarning}>
                          <AlertCircle size={16} color="#FF9800" />
                          <Text style={styles.lowConfidenceText}>
                            ⚠️ Low confidence prediction. The image may not be a paddy crop, or the prediction is uncertain. Please verify with an expert.
                          </Text>
                        </View>
                      )}
                      {result.solution.description && (
                        <Text style={styles.description}>{result.solution.description}</Text>
                      )}
                    </View>

                    {/* Solutions - only show if not "normal" */}
                    {result.solution.diseaseName !== 'Healthy Crop' && result.solution.solutions.length > 0 && (
                      <View style={styles.solutionsSection}>
                        <Text style={styles.solutionsTitle}>Treatment Solutions</Text>
                        {result.solution.solutions.map((solution, index) => (
                          <View key={index} style={styles.solutionCard}>
                            <View style={styles.solutionStep}>
                              <Text style={styles.stepNumber}>{solution.step}</Text>
                            </View>
                            <View style={styles.solutionContent}>
                              <Text style={styles.solutionTitle}>{solution.title}</Text>
                              <Text style={styles.solutionDescription}>{solution.description}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Prevention - only show if not "normal" */}
                    {result.solution.diseaseName !== 'Healthy Crop' && result.solution.prevention && result.solution.prevention.length > 0 && (
                      <View style={styles.preventionSection}>
                        <Text style={styles.preventionTitle}>Prevention Tips</Text>
                        {result.solution.prevention.map((tip, index) => (
                          <View key={index} style={styles.preventionItem}>
                            <Text style={styles.preventionBullet}>•</Text>
                            <Text style={styles.preventionText}>{tip}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.notFoundContainer}>
                    <Text style={styles.notFoundText}>
                      Prediction confidence is too low ({(result.prediction.confidence * 100).toFixed(1)}%).
                    </Text>
                    <Text style={styles.notFoundSubtext}>
                      The model is not confident enough to provide a reliable diagnosis. Please try with a clearer image of a paddy crop leaf, or consult with an agricultural expert.
                    </Text>
                  </View>
                )}
              </>
            )}

            {!result.solution.found && (
              <View style={styles.notFoundContainer}>
                <Text style={styles.notFoundText}>
                  The detected disease "{result.prediction.disease}" is not in our database.
                </Text>
                <Text style={styles.notFoundSubtext}>
                  Please consult with an agricultural expert for proper diagnosis and treatment.
                </Text>
              </View>
            )}
              </Animated.View>
            )}

            {/* Chat Section */}
            {result && result.solution.found && (
              <Animated.View
                ref={chatSectionRef}
                style={[
                  styles.chatSection,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
            <TouchableOpacity
              style={styles.chatToggle}
              onPress={() => setShowChat(!showChat)}
            >
              <MessageCircle size={20} color="#0F5132" />
              <Text style={styles.chatToggleText}>
                {showChat ? 'Hide Chat' : 'Ask Questions About This Disease'}
              </Text>
            </TouchableOpacity>

            {showChat && (
              <View style={styles.chatContainer}>
                <View style={styles.chatMessages}>
                  {chatMessages.length === 0 && (
                    <View style={styles.chatWelcome}>
                      <Text style={styles.chatWelcomeText}>
                        Ask me anything about {result.solution.diseaseName}!
                      </Text>
                      <Text style={styles.chatWelcomeSubtext}>
                        Example: "How do I prevent this disease?" or "What are the best treatment methods?"
                      </Text>
                    </View>
                  )}
                  {chatMessages.map((msg, index) => (
                    <View
                      key={index}
                      style={[
                        styles.chatMessage,
                        msg.role === 'user' ? styles.userMessage : styles.assistantMessage,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chatMessageText,
                          msg.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                        ]}
                      >
                        {msg.content}
                      </Text>
                    </View>
                  ))}
                  {sendingMessage && (
                    <View style={[styles.chatMessage, styles.assistantMessage]}>
                      <ActivityIndicator size="small" color="#0F5132" />
                    </View>
                  )}
                </View>

                <View style={styles.chatInputContainer}>
                  <TextInput
                    style={styles.chatInput}
                    placeholder="Ask a question..."
                    value={chatInput}
                    onChangeText={setChatInput}
                    multiline
                    editable={!sendingMessage}
                    onSubmitEditing={sendChatMessage}
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, sendingMessage && styles.sendButtonDisabled]}
                    onPress={sendChatMessage}
                    disabled={sendingMessage || !chatInput.trim()}
                  >
                    <Send size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
              </Animated.View>
            )}

            {/* Placeholder when no image selected */}
            {!imageUri && !result && (
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
                <Text style={styles.emptyStateTitle}>No image selected</Text>
                <Text style={styles.emptyStateText}>Please select an image to detect disease</Text>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

        {/* API Key Modal */}
        <Modal
          visible={showApiKeyModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowApiKeyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>API Key Required</Text>
              <Text style={styles.modalText}>
                To use the chat feature, you need an OpenAI API key. Get one from:
              </Text>
              <Text style={styles.modalLink}>• OpenAI: platform.openai.com/api-keys</Text>
              <Text style={styles.modalSubtext}>
                Note: Your API key should be in the .env file as OPENAI_API_KEY
              </Text>
              
              <TextInput
                style={styles.apiKeyInput}
                placeholder="Enter your OpenAI API key"
                value={apiKeyInput}
                onChangeText={setApiKeyInput}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowApiKeyModal(false);
                    setApiKeyInput('');
                  }}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={async () => {
                    if (apiKeyInput.trim()) {
                      try {
                        await llmService.initialize(apiKeyInput.trim());
                        setShowApiKeyModal(false);
                        setApiKeyInput('');
                        Alert.alert('Success', 'API key saved! You can now use the chat.');
                      } catch (error) {
                        Alert.alert('Error', 'Failed to save API key');
                      }
                    } else {
                      Alert.alert('Error', 'Please enter a valid API key');
                    }
                  }}
                >
                  <Text style={styles.modalButtonSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Camera Modal */}
        <Modal
          visible={showCamera}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowCamera(false)}
        >
          <SafeAreaView style={styles.cameraContainer}>
            {device && hasPermission ? (
              <>
                <VisionCamera
                  style={styles.camera}
                  device={device}
                  isActive={showCamera}
                  photo={true}
                  ref={cameraRef}
                />
                <View style={styles.cameraControls}>
                  <TouchableOpacity
                    style={styles.cameraCloseButton}
                    onPress={() => setShowCamera(false)}
                  >
                    <X size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={takePicture}
                  >
                    <View style={styles.captureButtonInner} />
                  </TouchableOpacity>
                  <View style={styles.cameraSpacer} />
                </View>
              </>
            ) : (
              <View style={styles.cameraPermissionContainer}>
                <Text style={styles.cameraPermissionText}>
                  Camera permission is required
                </Text>
                <TouchableOpacity
                  style={styles.cameraPermissionButton}
                  onPress={async () => {
                    const result = await requestPermission();
                    if (!result) {
                      Alert.alert('Permission Denied', 'Camera permission is required.');
                      setShowCamera(false);
                    }
                  }}
                >
                  <Text style={styles.cameraPermissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cameraCloseButton2}
                  onPress={() => setShowCamera(false)}
                >
                  <Text style={styles.cameraCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </Modal>
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
  innerContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
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
  imageActionsContainer: {
    gap: 12,
  },
  changeImageButton: {
    backgroundColor: '#6B6B6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  changeImageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  diseaseInfo: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultContent: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 4,
  },
  aliasesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    marginTop: 2,
  },
  aliasesLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  aliasesText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    flexShrink: 1,
  },
  confidence: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 8,
  },
  lowConfidenceWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  lowConfidenceText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
    lineHeight: 18,
  },
  description: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
  },
  solutionsSection: {
    marginBottom: 20,
  },
  solutionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 12,
  },
  solutionCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  solutionStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F5132',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  solutionContent: {
    flex: 1,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F5132',
    marginBottom: 4,
  },
  solutionDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
  },
  preventionSection: {
    marginTop: 8,
  },
  preventionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 12,
  },
  preventionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  preventionBullet: {
    fontSize: 16,
    color: '#0F5132',
    marginRight: 8,
  },
  preventionText: {
    flex: 1,
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
  },
  notFoundContainer: {
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  notFoundText: {
    fontSize: 16,
    color: '#E65100',
    marginBottom: 8,
    fontWeight: '600',
  },
  notFoundSubtext: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  chatSection: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  chatToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  chatToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F5132',
  },
  chatContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  chatMessages: {
    marginBottom: 12,
  },
  chatWelcome: {
    padding: 16,
    backgroundColor: '#F0F9F4',
    borderRadius: 8,
    marginBottom: 12,
  },
  chatWelcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F5132',
    marginBottom: 4,
  },
  chatWelcomeSubtext: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
  },
  chatMessage: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: '#0F5132',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
  },
  chatMessageText: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    backgroundColor: '#FAFBFC',
  },
  sendButton: {
    backgroundColor: '#0F5132',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalLink: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 4,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cameraCloseButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#0F5132',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F5132',
  },
  cameraSpacer: {
    width: 50,
  },
  cameraPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  cameraPermissionText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  cameraPermissionButton: {
    backgroundColor: '#0F5132',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  cameraPermissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraCloseButton2: {
    paddingVertical: 12,
  },
  cameraCloseButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalSubtext: {
    fontSize: 12,
    color: '#6B6B6B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 20,
    fontSize: 14,
    backgroundColor: '#FAFBFC',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
  },
  modalButtonSave: {
    backgroundColor: '#0F5132',
  },
  modalButtonCancelText: {
    color: '#6B6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
