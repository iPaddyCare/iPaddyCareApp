import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
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
} from 'react-native';
import { Camera, Upload, CheckCircle, AlertCircle, X, MessageCircle, Send, Mic } from 'lucide-react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { TextInput } from 'react-native';
import Voice from '@react-native-voice/voice';
import ragService from '../src/services/ragService';
import pestDetectionService from '../src/services/pestDetectionService';
import llmService from '../src/services/LLMService';

export default function PestDetectionScreen() {
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
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  // Initialize services on mount
  useEffect(() => {
    initializeServices();
    setupVoiceRecognition();
    return () => {
      // Cleanup voice recognition
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

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

  // Setup voice recognition event handlers
  const setupVoiceRecognition = () => {
    Voice.onSpeechStart = () => {
      setIsRecording(true);
      console.log('🎤 Voice recognition started');
    };

    Voice.onSpeechEnd = () => {
      setIsRecording(false);
      console.log('🎤 Voice recognition ended');
    };

    Voice.onSpeechResults = (event) => {
      if (event.value && event.value.length > 0) {
        const text = event.value[0];
        setRecognizedText(text);
        setChatInput(text);
        console.log('🎤 Recognized text:', text);
      }
    };

    Voice.onSpeechError = (event) => {
      console.error('🎤 Voice recognition error:', event);
      setIsRecording(false);
      Alert.alert('Voice Error', 'Failed to recognize speech. Please try again.');
    };

    Voice.onSpeechPartialResults = (event) => {
      if (event.value && event.value.length > 0) {
        setRecognizedText(event.value[0]);
      }
    };
  };

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone for voice input.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  // Start voice recording
  const startVoiceRecording = async () => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Microphone permission is required for voice input.');
        return;
      }

      await Voice.start('en-US');
      setRecognizedText('');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      Alert.alert('Error', 'Failed to start voice recording. Please try again.');
    }
  };

  // Stop voice recording
  const stopVoiceRecording = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  // Toggle voice recording
  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
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

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          setImageUri(response.assets[0].uri);
          setResult(null);
        }
      }
    );
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
          setImageUri(response.assets[0].uri);
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Pest & Disease Detection</Text>
          <Text style={styles.subtitle}>Capture or upload plant images for AI-powered detection</Text>
        </View>

        {/* Image Selection */}
        <View style={styles.imageSection}>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <TouchableOpacity style={styles.removeButton} onPress={clearImage}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Camera size={48} color="#0F5132" />
              <Text style={styles.placeholderText}>Select an image to detect disease</Text>
              <View style={styles.placeholderButtons}>
                <TouchableOpacity style={styles.placeholderCameraButton} onPress={openCamera}>
                  <Camera size={20} color="#0F5132" />
                  <Text style={styles.placeholderButtonText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.placeholderGalleryButton} onPress={openGallery}>
                  <Upload size={20} color="#2196F3" />
                  <Text style={styles.placeholderGalleryButtonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!imageUri && (
            <View style={styles.imageOptionsContainer}>
              <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
                <Camera size={24} color="#fff" />
                <Text style={styles.cameraButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.galleryButton} onPress={openGallery}>
                <Upload size={24} color="#fff" />
                <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          {imageUri && !detecting && (
            <View style={styles.detectActionsContainer}>
              <TouchableOpacity style={styles.detectButton} onPress={detectDisease}>
                <Text style={styles.detectButtonText}>Detect Disease</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.changeImageButton} onPress={handleImagePicker}>
                <Text style={styles.changeImageButtonText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          )}

          {detecting && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0F5132" />
              <Text style={styles.loadingText}>Analyzing image...</Text>
            </View>
          )}
        </View>

        {/* Results */}
        {result && (
          <View style={styles.results}>
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
                <View style={styles.diseaseInfo}>
                  <Text style={styles.diseaseName}>{result.solution.diseaseName}</Text>
                  <Text style={styles.confidence}>
                    Confidence: {(result.prediction.confidence * 100).toFixed(1)}%
                  </Text>
                  {result.solution.description && (
                    <Text style={styles.description}>{result.solution.description}</Text>
                  )}
                </View>

                {/* Solutions */}
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

                {/* Prevention */}
                {result.solution.prevention && result.solution.prevention.length > 0 && (
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
          </View>
        )}

        {/* Chat Section */}
        {result && result.solution.found && (
          <View style={styles.chatSection}>
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
                    placeholder={isRecording ? "Listening..." : "Ask a question or tap mic..."}
                    value={chatInput}
                    onChangeText={setChatInput}
                    multiline
                    editable={!sendingMessage && !isRecording}
                    onSubmitEditing={sendChatMessage}
                  />
                  <TouchableOpacity
                    style={[
                      styles.micButton,
                      isRecording && styles.micButtonRecording,
                      sendingMessage && styles.micButtonDisabled
                    ]}
                    onPress={toggleVoiceRecording}
                    disabled={sendingMessage}
                  >
                    <Mic 
                      size={20} 
                      color={isRecording ? "#fff" : "#0F5132"} 
                      fill={isRecording ? "#fff" : "none"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sendButton, sendingMessage && styles.sendButtonDisabled]}
                    onPress={sendChatMessage}
                    disabled={sendingMessage || !chatInput.trim()}
                  >
                    <Send size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                {isRecording && (
                  <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>Recording... Speak now</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

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
                To use the chat feature, you need a Gemini API key. Get one from:
              </Text>
              <Text style={styles.modalLink}>• Google Gemini: makersuite.google.com</Text>
              <Text style={styles.modalSubtext}>
                Note: Your API key should be in the .env file as GEMINI_API_KEY
              </Text>
              
              <TextInput
                style={styles.apiKeyInput}
                placeholder="Enter your Gemini API key"
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B6B6B',
    lineHeight: 22,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    height: 300,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F5132',
    marginBottom: 20,
    textAlign: 'center',
  },
  placeholderButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  placeholderCameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0F5132',
    gap: 8,
  },
  placeholderGalleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    gap: 8,
  },
  placeholderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F5132',
  },
  placeholderGalleryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  actions: {
    marginBottom: 24,
  },
  imageOptionsContainer: {
    gap: 12,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 10,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 10,
  },
  galleryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detectActionsContainer: {
    gap: 12,
  },
  detectButton: {
    backgroundColor: '#0F5132',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  detectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  changeImageButton: {
    backgroundColor: '#6B6B6B',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeImageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B6B6B',
  },
  results: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F5132',
  },
  diseaseInfo: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 4,
  },
  confidence: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 8,
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
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    maxHeight: 300,
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
  micButton: {
    backgroundColor: '#F0F9F4',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0F5132',
  },
  micButtonRecording: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  micButtonDisabled: {
    opacity: 0.5,
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
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
  },
  recordingText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '600',
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
});
