import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
  PermissionsAndroid,
  Dimensions,
  Animated,
  StatusBar,
  Keyboard,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Upload, CheckCircle, AlertCircle, X, MessageCircle, Send, Mic } from 'lucide-react-native';
import Voice from '@react-native-voice/voice';
import { launchImageLibrary } from 'react-native-image-picker';
import { TextInput } from 'react-native';
import { Camera as VisionCamera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ragService from '../src/services/ragService';
import pestDetectionService from '../src/services/pestDetectionService';
import llmService from '../src/services/LLMService';
import PokedexResultCard from '../src/components/PokedexResultCard';
import { useLanguage } from '../src/context/LanguageContext';

const { width, height } = Dimensions.get('window');

const translations = {
  English: {
    headerTitle: 'Pest & Disease Detection',
    takePhoto: 'Take Photo',
    takePhotoDesc: 'Capture plant images using camera',
    chooseGallery: 'Choose from Gallery',
    chooseGalleryDesc: 'Select an image from your gallery',
    selectedImage: 'Selected Image',
    changeImage: 'Change Image',
    analyzing: 'Analyzing image...',
    detectPest: 'Detect Pest',
    detectDisease: 'Detect Disease',
    askPlaceholder: 'Ask a question...',
    readyToScan: 'Ready to Scan',
    readyToScanDesc: 'Take a photo or select an image of your crop to detect pests and diseases',
    apiKeyRequired: 'API Key Required',
    enterApiKey: 'Enter your OpenAI API key',
    cancel: 'Cancel',
    save: 'Save',
    grantPermission: 'Grant Permission',
    close: 'Close',
    error: 'Error',
    failedInit: 'Failed to initialize detection services',
    permissionDenied: 'Permission Denied',
    micRequired: 'Microphone permission is required for voice input.',
    notAvailable: 'Not Available',
    voiceUnavailable: 'Voice recognition is not available. This feature requires the legacy React Native architecture.',
    voiceError: 'Voice Error',
    voiceErrorMsg: 'Voice recognition failed to start. This module may not be compatible with the current React Native architecture.',
    cameraRequired: 'Camera permission is required to take photos.',
    cameraNotReady: 'Camera not ready',
    failedTakePic: 'Failed to take picture. Please try again.',
    selectImageFirst: 'Please select an image first',
    servicesNotReady: 'Services not ready yet',
    failedDetect: 'Failed to detect disease. Please try again.',
    failedResponse: 'Failed to get response. Please check your internet connection and API key.',
    success: 'Success',
    apiKeySaved: 'API key saved! You can now use the chat.',
    failedSaveKey: 'Failed to save API key',
    invalidApiKey: 'Please enter a valid API key',
    cameraPermDenied: 'Camera permission is required.',
    diseaseMode: 'Disease',
    pestMode: 'Pest',
    micPermissionTitle: 'Microphone Permission',
    micPermissionMsg: 'This app needs access to your microphone for voice input.',
    askMeLater: 'Ask Me Later',
    ok: 'OK',
    selectImage: 'Select Image',
    chooseOption: 'Choose an option',
    camera: 'Camera',
    gallery: 'Gallery',
    hideChat: 'Hide Chat',
    askAboutDisease: 'Ask Questions About This Disease',
    askMeAnythingAbout: 'Ask me anything about',
    chatExample: 'Example: "How do I prevent this disease?" or "What are the best treatment methods?"',
    listening: 'Listening...',
    apiKeyModalDesc: 'To use the chat feature, you need an OpenAI API key. Get one from:',
    apiKeyOpenAILink: '• OpenAI: platform.openai.com/api-keys',
    apiKeyEnvNote: 'Note: Your API key should be in the .env file as OPENAI_API_KEY',
    cameraPermissionRequired: 'Camera permission is required',
    voiceLangFallback: 'Language Not Supported',
    voiceLangFallbackMsg: 'Voice input is not available in your selected language on this device. Using English instead. Tip: install the offline voice pack for this language in your device settings.',
  },
  සිංහල: {
    headerTitle: 'කෘමී සහ රෝග හඳුනාගැනීම',
    takePhoto: 'ඡායාරූපයක් ගන්න',
    takePhotoDesc: 'කැමරාව භාවිතයෙන් ශාක රූප ග්‍රහණය කරන්න',
    chooseGallery: 'ගැලරියෙන් තෝරන්න',
    chooseGalleryDesc: 'ඔබේ ගැලරියෙන් රූපයක් තෝරන්න',
    selectedImage: 'තෝරාගත් රූපය',
    changeImage: 'රූපය වෙනස් කරන්න',
    analyzing: 'රූපය විශ්ලේෂණය කරමින්...',
    detectPest: 'කෘමියා හඳුනන්න',
    detectDisease: 'රෝගය හඳුනන්න',
    askPlaceholder: 'ප්‍රශ්නයක් අසන්න...',
    readyToScan: 'පරිලෝකනයට සූදානම්',
    readyToScanDesc: 'කෘමීන් සහ රෝග හඳුනා ගැනීමට ඔබේ බෝගයේ ඡායාරූපයක් ගන්න හෝ රූපයක් තෝරන්න',
    apiKeyRequired: 'API යතුර අවශ්‍යයි',
    enterApiKey: 'ඔබේ OpenAI API යතුර ඇතුළත් කරන්න',
    cancel: 'අවලංගු කරන්න',
    save: 'සුරකින්න',
    grantPermission: 'අවසර දෙන්න',
    close: 'වසන්න',
    error: 'දෝෂය',
    failedInit: 'හඳුනාගැනීමේ සේවා ආරම්භ කිරීමට අසමත් විය',
    permissionDenied: 'අවසරය ප්‍රතික්ෂේප කරන ලදී',
    micRequired: 'හඬ ආදානය සඳහා මයික්‍රෆෝන් අවසරය අවශ්‍ය වේ.',
    notAvailable: 'ලබා ගත නොහැක',
    voiceUnavailable: 'හඬ හඳුනාගැනීම ලබා ගත නොහැක. මෙම විශේෂාංගය legacy React Native ගෘහනිර්මාණ ශිල්පය අවශ්‍ය වේ.',
    voiceError: 'හඬ දෝෂය',
    voiceErrorMsg: 'හඬ හඳුනාගැනීම ආරම්භ කිරීමට අසමත් විය. මෙම මොඩියුලය වර්තමාන React Native ගෘහනිර්මාණ ශිල්පය සමඟ අනුකූල නොවිය හැක.',
    cameraRequired: 'ඡායාරූප ගැනීමට කැමරා අවසරය අවශ්‍ය වේ.',
    cameraNotReady: 'කැමරාව සූදානම් නැත',
    failedTakePic: 'ඡායාරූපයක් ගැනීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.',
    selectImageFirst: 'කරුණාකර පළමුව රූපයක් තෝරන්න',
    servicesNotReady: 'සේවා තවමත් සූදානම් නැත',
    failedDetect: 'රෝගය හඳුනාගැනීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.',
    failedResponse: 'ප්‍රතිචාරයක් ලබා ගැනීමට අසමත් විය. ඔබේ අන්තර්ජාල සම්බන්ධතාවය සහ API යතුර පරීක්ෂා කරන්න.',
    success: 'සාර්ථකයි',
    apiKeySaved: 'API යතුර සුරකින ලදී! ඔබට දැන් කතාබස් භාවිතා කළ හැක.',
    failedSaveKey: 'API යතුර සුරැකීමට අසමත් විය',
    invalidApiKey: 'කරුණාකර වලංගු API යතුරක් ඇතුළත් කරන්න',
    cameraPermDenied: 'කැමරා අවසරය අවශ්‍ය වේ.',
    diseaseMode: 'රෝගය',
    pestMode: 'කෘමියා',
    micPermissionTitle: 'මයික්‍රෆෝන් අවසරය',
    micPermissionMsg: 'හඬ ආදානය සඳහා මෙම යෙදුමට ඔබේ මයික්‍රෆෝනයට ප්‍රවේශය අවශ්‍ය වේ.',
    askMeLater: 'පසුව අසන්න',
    ok: 'හරි',
    selectImage: 'රූපයක් තෝරන්න',
    chooseOption: 'විකල්පයක් තෝරන්න',
    camera: 'කැමරාව',
    gallery: 'ගැලරිය',
    hideChat: 'කතාබස් සඟවන්න',
    askAboutDisease: 'මෙම රෝගය ගැන ප්‍රශ්න අසන්න',
    askMeAnythingAbout: 'ඕනෑම දෙයක් අසන්න',
    chatExample: 'උදා: "මෙම රෝගය වැළැක්විය හැක්කේ කෙසේද?" හෝ "හොඳම ප්‍රතිකාර ක්‍රම මොනවාද?"',
    listening: 'සවන් දෙමින්...',
    apiKeyModalDesc: 'කතාබස් විශේෂාංගය භාවිතා කිරීමට, ඔබට OpenAI API යතුරක් අවශ්‍යයි. එය ලබා ගන්න:',
    apiKeyOpenAILink: '• OpenAI: platform.openai.com/api-keys',
    apiKeyEnvNote: 'සටහන: ඔබේ API යතුර .env ගොනුවේ OPENAI_API_KEY ලෙස තිබිය යුතුය',
    cameraPermissionRequired: 'කැමරා අවසරය අවශ්‍ය වේ',
    voiceLangFallback: 'භාෂාව සහාය නොදක්වයි',
    voiceLangFallbackMsg: 'මෙම උපාංගයේ ඔබ තෝරාගත් භාෂාවෙන් හඬ ආදානය ලබා ගත නොහැක. ඉංග්‍රීසි භාවිතා කරයි. ඉඟිය: ඔබේ උපාංග සැකසුම්වල මෙම භාෂාව සඳහා නොබැඳි හඬ පැකේජය ස්ථාපනය කරන්න.',
  },
  தமிழ்: {
    headerTitle: 'பூச்சி மற்றும் நோய் கண்டறிதல்',
    takePhoto: 'புகைப்படம் எடு',
    takePhotoDesc: 'கேமராவைப் பயன்படுத்தி தாவர படங்களைப் பிடிக்கவும்',
    chooseGallery: 'கேலரியில் இருந்து தேர்வு செய்',
    chooseGalleryDesc: 'உங்கள் கேலரியிலிருந்து ஒரு படத்தைத் தேர்ந்தெடுக்கவும்',
    selectedImage: 'தேர்ந்தெடுக்கப்பட்ட படம்',
    changeImage: 'படத்தை மாற்று',
    analyzing: 'படத்தை பகுப்பாய்வு செய்கிறது...',
    detectPest: 'பூச்சியை கண்டறி',
    detectDisease: 'நோயை கண்டறி',
    askPlaceholder: 'கேள்வி கேளுங்கள்...',
    readyToScan: 'ஸ்கேன் செய்ய தயார்',
    readyToScanDesc: 'பூச்சிகள் மற்றும் நோய்களைக் கண்டறிய உங்கள் பயிரின் புகைப்படத்தை எடுக்கவும் அல்லது படத்தைத் தேர்ந்தெடுக்கவும்',
    apiKeyRequired: 'API விசை தேவை',
    enterApiKey: 'உங்கள் OpenAI API விசையை உள்ளிடவும்',
    cancel: 'ரத்து',
    save: 'சேமி',
    grantPermission: 'அனுமதி வழங்கு',
    close: 'மூடு',
    error: 'பிழை',
    failedInit: 'கண்டறிதல் சேவைகளைத் தொடங்க முடியவில்லை',
    permissionDenied: 'அனுமதி மறுக்கப்பட்டது',
    micRequired: 'குரல் உள்ளீட்டிற்கு மைக்ரோபோன் அனுமதி தேவை.',
    notAvailable: 'கிடைக்கவில்லை',
    voiceUnavailable: 'குரல் அங்கீகாரம் கிடைக்கவில்லை. இந்த அம்சத்திற்கு legacy React Native கட்டமைப்பு தேவை.',
    voiceError: 'குரல் பிழை',
    voiceErrorMsg: 'குரல் அங்கீகாரம் தொடங்கத் தவறிவிட்டது. இந்த தொகுதி தற்போதைய React Native கட்டமைப்புடன் இணக்கமாக இல்லாமல் இருக்கலாம்.',
    cameraRequired: 'புகைப்படங்கள் எடுக்க கேமரா அனுமதி தேவை.',
    cameraNotReady: 'கேமரா தயாராக இல்லை',
    failedTakePic: 'படம் எடுக்கத் தவறிவிட்டது. மீண்டும் முயற்சிக்கவும்.',
    selectImageFirst: 'முதலில் ஒரு படத்தைத் தேர்ந்தெடுக்கவும்',
    servicesNotReady: 'சேவைகள் இன்னும் தயாராக இல்லை',
    failedDetect: 'நோயைக் கண்டறிய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    failedResponse: 'பதிலைப் பெற முடியவில்லை. உங்கள் இணைய இணைப்பு மற்றும் API விசையைச் சரிபார்க்கவும்.',
    success: 'வெற்றி',
    apiKeySaved: 'API விசை சேமிக்கப்பட்டது! நீங்கள் இப்போது அரட்டையைப் பயன்படுத்தலாம்.',
    failedSaveKey: 'API விசையைச் சேமிக்க முடியவில்லை',
    invalidApiKey: 'சரியான API விசையை உள்ளிடவும்',
    cameraPermDenied: 'கேமரா அனுமதி தேவை.',
    diseaseMode: 'நோய்',
    pestMode: 'பூச்சி',
    micPermissionTitle: 'மைக்ரோபோன் அனுமதி',
    micPermissionMsg: 'குரல் உள்ளீட்டிற்காக இந்த பயன்பாட்டிற்கு உங்கள் மைக்ரோபோனுக்கான அணுகல் தேவை.',
    askMeLater: 'பிறகு கேள்',
    ok: 'சரி',
    selectImage: 'படத்தைத் தேர்ந்தெடு',
    chooseOption: 'ஒரு விருப்பத்தைத் தேர்ந்தெடு',
    camera: 'கேமரா',
    gallery: 'கேலரி',
    hideChat: 'அரட்டையை மறை',
    askAboutDisease: 'இந்த நோய் பற்றி கேள்விகள் கேள்',
    askMeAnythingAbout: 'எதைப் பற்றியும் கேள்',
    chatExample: 'உதா: "இந்த நோயை எவ்வாறு தடுப்பது?" அல்லது "சிறந்த சிகிச்சை முறைகள் என்ன?"',
    listening: 'கேட்கிறது...',
    apiKeyModalDesc: 'அரட்டை அம்சத்தைப் பயன்படுத்த, உங்களுக்கு OpenAI API விசை தேவை. இங்கே பெறவும்:',
    apiKeyOpenAILink: '• OpenAI: platform.openai.com/api-keys',
    apiKeyEnvNote: 'குறிப்பு: உங்கள் API விசை .env கோப்பில் OPENAI_API_KEY ஆக இருக்க வேண்டும்',
    cameraPermissionRequired: 'கேமரா அனுமதி தேவை',
    voiceLangFallback: 'மொழி ஆதரிக்கப்படவில்லை',
    voiceLangFallbackMsg: 'இந்த சாதனத்தில் நீங்கள் தேர்ந்தெடுத்த மொழியில் குரல் உள்ளீடு கிடைக்கவில்லை. ஆங்கிலம் பயன்படுத்தப்படுகிறது. குறிப்பு: உங்கள் சாதன அமைப்புகளில் இந்த மொழிக்கான ஆஃப்லைன் குரல் தொகுப்பை நிறுவவும்.',
  },
};

const VOICE_LOCALES = {
  English: 'en-US',
  සිංහල: 'si-LK',
  தமிழ்: 'ta-IN',
};

export default function PestDetectionScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const t = translations[selectedLanguage] || translations.English;
  const [detectionMode, setDetectionMode] = useState('disease'); // 'disease' or 'pest'
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
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef(null);
  const mainScrollViewRef = useRef(null);
  const chatInputRowRef = useRef(null);
  const chatInputFocusedRef = useRef(false);
  const [chatInputFocused, setChatInputFocused] = useState(false);

  // The chat input lives at the very bottom of the page. On Android with
  // adjustResize the ScrollView shrinks but doesn't re-scroll, so the input
  // ends up under the keyboard. Easiest reliable fix: when the keyboard shows
  // while chat is focused, scrollToEnd — that lands the input just above the
  // keyboard. We retry once after a beat in case the resize hasn't settled.
  const scrollChatInputIntoView = () => {
    const scroller = mainScrollViewRef.current;
    if (!scroller) return;
    scroller.scrollToEnd({ animated: true });
    setTimeout(() => scroller.scrollToEnd({ animated: false }), 120);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      if (chatInputFocusedRef.current) {
        scrollChatInputIntoView();
      }
    });
    // On Android, keyboardDidShow fires once but if the user dismisses+re-taps,
    // the frame metric updates without a fresh focus event in some flows.
    // keyboardDidChangeFrame catches those.
    const frameSub = Keyboard.addListener('keyboardDidChangeFrame', () => {
      if (chatInputFocusedRef.current) {
        scrollChatInputIntoView();
      }
    });
    return () => {
      showSub.remove();
      frameSub.remove();
    };
  }, []);
  const chatSectionRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Initialize services on mount
  useEffect(() => {
    initializeServices();
    if (Voice) {
      setupVoiceRecognition();
    }

    return () => {
      // Cleanup voice recognition
      if (Voice) {
        Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
      }
    };
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
      showAppAlert(t.error, t.failedInit);
    }
  };

  const setupVoiceRecognition = () => {
    if (!Voice) return;
    Voice.onSpeechStart = () => {
      setIsRecording(true);
      setRecognizedText('');
    };

    Voice.onSpeechRecognized = () => {
      // Speech recognized
    };

    Voice.onSpeechEnd = () => {
      setIsRecording(false);
    };

    Voice.onSpeechError = (e) => {
      const errorCode = e?.error?.code || e?.error?.message?.split('/')[0];
      // Code 11 = "Didn't understand" (no speech detected) — not a real error
      // Code 7 = "No match" — also non-fatal
      if (errorCode === '11' || errorCode === '7') {
        console.log('Speech not detected, ready to try again');
      } else {
        console.error('Speech recognition error:', e);
      }
      setIsRecording(false);
    };

    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        const text = e.value[0];
        setRecognizedText(text);
        setChatInput(text);
        setIsRecording(false);
      }
    };

    Voice.onSpeechPartialResults = (e) => {
      if (e.value && e.value.length > 0) {
        setRecognizedText(e.value[0]);
      }
    };
  };

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: t.micPermissionTitle,
            message: t.micPermissionMsg,
            buttonNeutral: t.askMeLater,
            buttonNegative: t.cancel,
            buttonPositive: t.ok,
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS permissions are handled in Info.plist
  };

  const startVoiceRecording = async () => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        showAppAlert(t.permissionDenied, t.micRequired);
        return;
      }

      // Check if native Voice module is available (not supported with New Architecture)
      const isAvailable = await Voice.isAvailable().catch(() => false);
      if (!isAvailable) {
        showAppAlert(t.notAvailable, t.voiceUnavailable);
        return;
      }
      // Fully destroy previous session, wait for cleanup, then re-register listeners
      try {
        await Voice.destroy();
      } catch (_) {}
      await new Promise(resolve => setTimeout(resolve, 300));
      setupVoiceRecognition();

      const preferredLocale = VOICE_LOCALES[selectedLanguage] || 'en-US';
      try {
        await Voice.start(preferredLocale);
      } catch (localeError) {
        // Locale not installed/supported on this device — fall back to English
        if (preferredLocale !== 'en-US') {
          console.warn(`Voice locale ${preferredLocale} not supported, falling back to en-US`);
          showAppAlert(t.voiceLangFallback, t.voiceLangFallbackMsg);
          await Voice.start('en-US');
        } else {
          throw localeError;
        }
      }
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      showAppAlert(t.voiceError, t.voiceErrorMsg);
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
    setIsRecording(false);
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };


  const handleImagePicker = () => {
    showAppAlert(
      t.selectImage,
      t.chooseOption,
      [
        { text: t.camera, onPress: openCamera },
        { text: t.gallery, onPress: openGallery },
        { text: t.cancel, style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    if (!hasPermission) {
      const permissionResult = await requestPermission();
      if (!permissionResult) {
        showAppAlert(t.permissionDenied, t.cameraRequired);
        return;
      }
    }
    setShowCamera(true);
  };

  const takePicture = async () => {
    try {
      if (!cameraRef.current) {
        showAppAlert(t.error, t.cameraNotReady);
        return;
      }
      
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
        photoFormat: 'jpeg', // Force JPEG - React Native Image can't render HEIC/HEIF
      });
      
      // Vision Camera returns raw path, React Native Image REQUIRES file:// prefix on Android
      const uri = `file://${photo.path}`;

      setImageUri(uri);
      setResult(null);
      setShowCamera(false);
    } catch (error) {
      console.error('Error taking picture:', error);
      showAppAlert(t.error, t.failedTakePic);
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
      showAppAlert(t.error, t.selectImageFirst);
      return;
    }

    if (!servicesReady) {
      showAppAlert(t.error, t.servicesNotReady);
      return;
    }

    setDetecting(true);
    setResult(null);

    try {
      // Step 1: Run the selected model
      const prediction = detectionMode === 'pest'
        ? await pestDetectionService.predictPest(imageUri)
        : await pestDetectionService.predictDisease(imageUri);

      // Step 2: Use RAG to get solutions
      const solution = ragService.getSolution(prediction.disease);

      setResult({
        prediction,
        solution,
      });

      // (Marketplace product fetch lives inside PokedexResultCard now.)
    } catch (error) {
      console.error('Detection error:', error);
      showAppAlert(t.error, t.failedDetect);
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
    if (!chatInput.trim() || !result?.solution?.found) {
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
      const response = await llmService.generateResponse(userMessage, ragContext, selectedLanguage);
      
      // Add AI response to chat
      setChatMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      showAppAlert(t.error, t.failedResponse);
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
            // BottomNavigation floats ~72px above the keyboard. When the chat
            // input is focused, add extra padding so scrollToEnd lifts the
            // input clear of the bottom nav.
            { paddingBottom: 72 + insets.bottom + 20 + (chatInputFocused ? 240 : 0) }
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
                <Text style={styles.headerTitle}>{t.headerTitle}</Text>
              </View>
            </View>
          </View>

          <View style={styles.innerContent}>
            {/* Detection Mode Toggle */}
            <View style={styles.modeToggleContainer}>
              <TouchableOpacity
                style={[styles.modeToggleBtn, detectionMode === 'disease' && styles.modeToggleBtnActive]}
                onPress={() => { setDetectionMode('disease'); setResult(null); }}
                activeOpacity={0.7}
              >
                <Icon name="leaf" size={18} color={detectionMode === 'disease' ? '#FFFFFF' : '#0F5132'} />
                <Text style={[styles.modeToggleText, detectionMode === 'disease' && styles.modeToggleTextActive]}>
                  {t.diseaseMode}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeToggleBtn, detectionMode === 'pest' && styles.modeToggleBtnActive]}
                onPress={() => { setDetectionMode('pest'); setResult(null); }}
                activeOpacity={0.7}
              >
                <Icon name="bug" size={18} color={detectionMode === 'pest' ? '#FFFFFF' : '#0F5132'} />
                <Text style={[styles.modeToggleText, detectionMode === 'pest' && styles.modeToggleTextActive]}>
                  {t.pestMode}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <Animated.View
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  marginTop: 16,
                },
              ]}
            >
              {!imageUri && (
                <>
                  {/* Camera Button */}
                  <TouchableOpacity
                    style={[styles.actionCard, { borderLeftWidth: 5, borderLeftColor: '#4CAF50' }]}
                    onPress={openCamera}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionCardContent}>
                      <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E8' }]}>
                        <Icon name="camera" size={32} color="#4CAF50" />
                      </View>
                      <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>{t.takePhoto}</Text>
                        <Text style={styles.actionDescription}>{t.takePhotoDesc}</Text>
                      </View>
                      <View style={styles.actionArrow}>
                        <Icon name="chevron-right" size={22} color="#0F5132" />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Gallery Button */}
                  <TouchableOpacity
                    style={[styles.actionCard, { borderLeftWidth: 5, borderLeftColor: '#2196F3' }]}
                    onPress={openGallery}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionCardContent}>
                      <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                        <Icon name="image-plus" size={32} color="#2196F3" />
                      </View>
                      <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>{t.chooseGallery}</Text>
                        <Text style={styles.actionDescription}>{t.chooseGalleryDesc}</Text>
                      </View>
                      <View style={styles.actionArrow}>
                        <Icon name="chevron-right" size={22} color="#0F5132" />
                      </View>
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
                  <Text style={styles.imageCardTitle}>{t.selectedImage}</Text>
                  <TouchableOpacity onPress={clearImage}>
                    <Icon name="close-circle" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <Image 
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                  onError={(e) => {
                    console.error('Image load error:', e.nativeEvent);
                  }}
                />
                {!detecting && (
                  <View style={styles.imageActionsContainer}>
                    {/* Hide Detect once results are in — Change Image lets the user
                        pick a new photo, which clears `result` and the button returns. */}
                    {!result && (
                      <TouchableOpacity
                        style={styles.processButton}
                        onPress={detectDisease}
                        disabled={!servicesReady}
                      >
                        <Icon name={detectionMode === 'pest' ? 'bug' : 'leaf'} size={18} color="#FFFFFF" />
                        <Text style={styles.processButtonText}>
                          {detectionMode === 'pest' ? t.detectPest : t.detectDisease}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.changeImageButton}
                      onPress={handleImagePicker}
                    >
                      <Text style={styles.changeImageButtonText}>{t.changeImage}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {detecting && (
                  <View style={styles.processButton}>
                    <View style={styles.processButtonContent}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.processButtonText}>{t.analyzing}</Text>
                    </View>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Results - Pokédex Card */}
            {result && (
              <PokedexResultCard
                imageUri={imageUri}
                prediction={result.prediction}
                solution={result.solution}
                navigation={navigation}
              />
            )}

            {/* Recommended products are now rendered inside PokedexResultCard
                (it has its own fetch + UI for "AVAILABLE TREATMENTS") — duplicate
                section removed to avoid double Firestore queries and double UI. */}

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
                {showChat ? t.hideChat : t.askAboutDisease}
              </Text>
            </TouchableOpacity>

            {showChat && (
              <View style={styles.chatContainer}>
                <View style={styles.chatMessages}>
                  {chatMessages.length === 0 && (
                    <View style={styles.chatWelcome}>
                      <Text style={styles.chatWelcomeText}>
                        {t.askMeAnythingAbout} {result.solution.diseaseName}!
                      </Text>
                      <Text style={styles.chatWelcomeSubtext}>
                        {t.chatExample}
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

                <View ref={chatInputRowRef} style={styles.chatInputContainer}>
                  <TextInput
                    style={styles.chatInput}
                    placeholder={t.askPlaceholder}
                    value={chatInput}
                    onChangeText={setChatInput}
                    multiline
                    editable={!sendingMessage && !isRecording}
                    onSubmitEditing={sendChatMessage}
                    onFocus={() => {
                      chatInputFocusedRef.current = true;
                      setChatInputFocused(true);
                      // First-tap path: keyboardDidShow may race onFocus; fire here too.
                      // The longer delay lets the new paddingBottom apply before we scroll.
                      setTimeout(scrollChatInputIntoView, 350);
                    }}
                    onBlur={() => {
                      chatInputFocusedRef.current = false;
                      setChatInputFocused(false);
                    }}
                  />
                  <TouchableOpacity
                    style={[
                      styles.micButton,
                      isRecording && styles.micButtonRecording,
                      sendingMessage && styles.micButtonDisabled,
                    ]}
                    onPress={toggleVoiceRecording}
                    disabled={sendingMessage}
                  >
                    <Mic size={20} color={isRecording ? "#fff" : "#0F5132"} />
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
                    <Text style={styles.recordingText}>
                      {recognizedText || t.listening}
                    </Text>
                  </View>
                )}
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
                  <Icon name="leaf-circle-outline" size={64} color="#0F5132" />
                </View>
                <Text style={styles.emptyStateTitle}>{t.readyToScan}</Text>
                <Text style={styles.emptyStateText}>{t.readyToScanDesc}</Text>
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
              <Text style={styles.modalTitle}>{t.apiKeyRequired}</Text>
              <Text style={styles.modalText}>
                {t.apiKeyModalDesc}
              </Text>
              <Text style={styles.modalLink}>{t.apiKeyOpenAILink}</Text>
              <Text style={styles.modalSubtext}>
                {t.apiKeyEnvNote}
              </Text>
              
              <TextInput
                style={styles.apiKeyInput}
                placeholder={t.enterApiKey}
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
                  <Text style={styles.modalButtonCancelText}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={async () => {
                    if (apiKeyInput.trim()) {
                      try {
                        await llmService.initialize(apiKeyInput.trim());
                        setShowApiKeyModal(false);
                        setApiKeyInput('');
                        showAppAlert(t.success, t.apiKeySaved);
                      } catch (error) {
                        showAppAlert(t.error, t.failedSaveKey);
                      }
                    } else {
                      showAppAlert(t.error, t.invalidApiKey);
                    }
                  }}
                >
                  <Text style={styles.modalButtonSaveText}>{t.save}</Text>
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
                  {t.cameraPermissionRequired}
                </Text>
                <TouchableOpacity
                  style={styles.cameraPermissionButton}
                  onPress={async () => {
                    const result = await requestPermission();
                    if (!result) {
                      showAppAlert(t.permissionDenied, t.cameraPermDenied);
                      setShowCamera(false);
                    }
                  }}
                >
                  <Text style={styles.cameraPermissionButtonText}>{t.grantPermission}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cameraCloseButton2}
                  onPress={() => setShowCamera(false)}
                >
                  <Text style={styles.cameraCloseButtonText}>{t.close}</Text>
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
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8F0EB',
    borderRadius: 14,
    padding: 4,
    marginTop: 16,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  modeToggleBtnActive: {
    backgroundColor: '#0F5132',
    elevation: 3,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modeToggleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F5132',
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 22,
  },
  actionIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
    color: '#888',
    lineHeight: 20,
  },
  actionArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    marginTop: 12,
    elevation: 6,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
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
    flexDirection: 'row',
    backgroundColor: '#0F5132',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 6,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  processButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  imageActionsContainer: {
    gap: 12,
  },
  changeImageButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0F5132',
  },
  changeImageButtonText: {
    color: '#0F5132',
    fontSize: 16,
    fontWeight: '700',
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
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    elevation: 6,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  chatToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    backgroundColor: '#F0F7F3',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(15,81,50,0.15)',
  },
  chatToggleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F5132',
  },
  chatContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 16,
  },
  chatMessages: {
    marginBottom: 12,
  },
  chatWelcome: {
    padding: 20,
    backgroundColor: '#F0F7F3',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.1)',
  },
  chatWelcomeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 6,
  },
  chatWelcomeSubtext: {
    fontSize: 14,
    color: '#888',
    lineHeight: 21,
  },
  chatMessage: {
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: '#0F5132',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  assistantMessage: {
    backgroundColor: '#F0F7F3',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.08)',
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
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 14,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    backgroundColor: '#F8F9FA',
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
    marginRight: 8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  modalText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  modalLink: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 4,
    fontWeight: '600',
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
    paddingHorizontal: 30,
    paddingBottom: 50,
    paddingTop: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  cameraCloseButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#0F5132',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
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
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    fontSize: 15,
    backgroundColor: '#F8F9FA',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F0F0F0',
  },
  modalButtonSave: {
    backgroundColor: '#0F5132',
    elevation: 4,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  modalButtonCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '700',
  },
  modalButtonSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  emptyIconContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: 'rgba(15,81,50,0.08)',
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  recommendedSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.1)',
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  recommendedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  recommendedSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 16,
    lineHeight: 17,
  },
  recommendedList: {
    paddingRight: 8,
    gap: 12,
  },
  recommendedCard: {
    width: 150,
    backgroundColor: '#F8FAF9',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  recommendedCardImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  recommendedCardImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#F0F7F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedCardBody: {
    padding: 10,
  },
  recommendedCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    lineHeight: 17,
  },
  recommendedCardPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 2,
  },
  recommendedCardLocation: {
    fontSize: 11,
    color: '#888',
  },
  viewMarketplaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F0F7F3',
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.15)',
  },
  viewMarketplaceBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F5132',
  },
});
