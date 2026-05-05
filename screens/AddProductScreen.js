import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../src/context/LanguageContext';
import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { addProduct, uploadProductImage } from '../src/services/marketplaceService';
import CityPickerModal from '../src/components/CityPickerModal';
import llmService from '../src/services/LLMService';
import { showAppAlert } from '../src/components/AppAlert';
import PhoneInput from '../src/components/PhoneInput';
import PriceQuantitySheet from '../src/components/PriceQuantitySheet';

const { width, height } = Dimensions.get('window');

const UNIT_OPTIONS = ['kg', 'bags', 'litres', 'bundles', 'units'];

const translations = {
  English: {
    title: 'Add Product',
    subtitle: 'List your paddy product for sale',
    productName: 'Product Name',
    productNamePlaceholder: 'e.g., Premium Paddy Seeds',
    category: 'Category',
    selectCategory: 'Select Category',
    price: 'Price',
    pricePlaceholder: 'Enter price',
    description: 'Description',
    descriptionPlaceholder: 'Describe your product...',
    location: 'Location',
    locationPlaceholder: 'Select city',
    contactInfo: 'Contact Information',
    phone: 'Phone Number',
    phonePlaceholder: 'Enter your phone number',
    addImage: 'Add Product Image',
    imageOptional: 'Optional',
    submit: 'Submit Listing',
    cancel: 'Cancel',
    success: 'Product Submitted!',
    successMessage: 'Your product has been submitted and is pending officer approval.',
    pendingApprovalMessage: 'Your product has been submitted and is pending officer approval. You will be notified once it is approved.',
    error: 'Error',
    fillAllFields: 'Please fill all required fields',
    invalidPrice: 'Please enter a valid price',
    selectCategoryError: 'Please select a category',
    invalidQuantity: 'Please enter a valid quantity',
    requiredActiveIngredient: 'Active ingredient is required for pesticides/herbicides',
    requiredTargetDiseases: 'Select at least one target disease/pest',
    minName: 'Product name must be at least 3 characters',
    minDescription: 'Description must be at least 10 characters',
    maxPrice: 'Price cannot exceed Rs. 9,999,999',
    invalidPhone: 'Please enter a valid Sri Lankan phone number (e.g., 0771234567)',
    activeIngredient: 'Active Ingredient / Chemical Composition',
    activeIngredientHint: 'e.g., Mancozeb 64% + Metalaxyl 8% WP',
    activeIngredientPlaceholder: 'Enter chemical composition',
    targetDiseases: 'Target Diseases / Pests',
    targetDiseasesHint: 'Select which diseases or pests this product treats',
    selectDiseases: 'Select diseases / pests',
    nSelected: '{0} selected',
    suggest: 'Suggest',
    priceAndQuantity: 'Price & Quantity',
    quantityLabel: 'Quantity',
    priceLabel: 'Price',
    tapAddPhoto: 'Tap to add photo',
    aiSuggestNoSignal: 'Fill in product name, active ingredient, or description first so we can suggest diseases.',
    aiNotEnoughInfo: 'Not enough info',
    aiUnavailable: 'AI unavailable',
    aiUnavailableMsg: 'OpenAI key not configured. Add OPENAI_API_KEY to your .env file to enable suggestions.',
    aiNoMatches: 'No confident matches',
    aiNoMatchesMsg: 'The AI could not confidently match this product to any disease. Try adding more detail to the active ingredient or description.',
    aiAlreadyTagged: 'Already tagged',
    aiAlreadyTaggedMsg: 'The AI suggested only diseases you have already selected.',
    aiSuggestionsAdded: 'Suggestions added',
    aiAddedPrefix: 'Added: ',
    aiSuggestionFailed: 'Suggestion failed',
    aiCouldNotReach: 'Could not reach the AI service.',
    accessRestricted: 'Access Restricted',
    officersCannotList: 'Officers cannot list products in the marketplace.',
    failedSubmit: 'Failed to submit product. Please try again.',
    selectUnit: 'Select Unit',
    selectDiseasesHeader: 'Select Diseases / Pests',
  },
  සිංහල: {
    title: 'නිෂ්පාදනයක් එක් කරන්න',
    subtitle: 'ඔබේ වී නිෂ්පාදනය විකිණීමට ලැයිස්තුගත කරන්න',
    productName: 'නිෂ්පාදන නම',
    productNamePlaceholder: 'උදා: විශේෂ වී බීජ',
    category: 'කාණ්ඩය',
    selectCategory: 'කාණ්ඩයක් තෝරන්න',
    price: 'මිල',
    pricePlaceholder: 'මිල ඇතුළත් කරන්න',
    description: 'විස්තරය',
    descriptionPlaceholder: 'ඔබේ නිෂ්පාදනය විස්තර කරන්න...',
    location: 'ස්ථානය',
    locationPlaceholder: 'දිස්ත්‍රික්කය තෝරන්න',
    contactInfo: 'සම්බන්ධතා තොරතුරු',
    phone: 'දුරකථන අංකය',
    phonePlaceholder: 'ඔබේ දුරකථන අංකය ඇතුළත් කරන්න',
    addImage: 'නිෂ්පාදන රූපය එක් කරන්න',
    imageOptional: 'විකල්ප',
    submit: 'ලැයිස්තුව ඉදිරිපත් කරන්න',
    cancel: 'අවලංගු කරන්න',
    success: 'නිෂ්පාදනය ඉදිරිපත් කරන ලදී!',
    successMessage: 'ඔබේ නිෂ්පාදනය ඉදිරිපත් කරන ලද අතර නිලධාරී අනුමත කිරීමට අපේක්ෂාවෙන් පවතී.',
    pendingApprovalMessage: 'ඔබේ නිෂ්පාදනය ඉදිරිපත් කරන ලද අතර නිලධාරී අනුමත කිරීමට අපේක්ෂාවෙන් පවතී. එය අනුමත කරන විට ඔබට දැනුම් දෙනු ලැබේ.',
    error: 'දෝෂය',
    fillAllFields: 'කරුණාකර සියලුම අවශ්‍ය ක්ෂේත්‍ර පුරවන්න',
    invalidPrice: 'කරුණාකර වලංගු මිලක් ඇතුළත් කරන්න',
    selectCategoryError: 'කරුණාකර කාණ්ඩයක් තෝරන්න',
    invalidQuantity: 'කරුණාකර වලංගු ප්‍රමාණයක් ඇතුළත් කරන්න',
    requiredActiveIngredient: 'කෘමිනාශක/වල් නාශක සඳහා ක්‍රියාකාරී අමිල අවශ්‍ය වේ',
    requiredTargetDiseases: 'අවම වශයෙන් එක් ඉලක්ක රෝගයක්/පළිඹු වර්ගයක් තෝරන්න',
    minName: 'නිෂ්පාදන නම අවම වශයෙන් අකුරු 3ක් විය යුතුය',
    minDescription: 'විස්තරය අවම වශයෙන් අකුරු 10ක් විය යුතුය',
    maxPrice: 'මිල රු. 9,999,999 ඉක්මවිය නොහැක',
    invalidPhone: 'කරුණාකර වලංගු ශ්‍රී ලංකා දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 0771234567)',
    activeIngredient: 'ක්‍රියාකාරී අමුද්‍රව්‍ය / රසායනික සංයුතිය',
    activeIngredientHint: 'උදා: මැන්කොසෙබ් 64% + මෙටලැක්සිල් 8% WP',
    activeIngredientPlaceholder: 'රසායනික සංයුතිය ඇතුළත් කරන්න',
    targetDiseases: 'ඉලක්ක රෝග / කෘමීන්',
    targetDiseasesHint: 'මෙම නිෂ්පාදනය ප්‍රතිකාර කරන රෝග හෝ කෘමීන් තෝරන්න',
    selectDiseases: 'රෝග / කෘමීන් තෝරන්න',
    nSelected: '{0} ක් තෝරා ඇත',
    suggest: 'යෝජනා කරන්න',
    priceAndQuantity: 'මිල සහ ප්‍රමාණය',
    quantityLabel: 'ප්‍රමාණය',
    priceLabel: 'මිල',
    tapAddPhoto: 'ඡායාරූපය එක් කිරීමට ස්පර්ශ කරන්න',
    aiSuggestNoSignal: 'යෝජනා කිරීමට පළමුව නිෂ්පාදන නම, ක්‍රියාකාරී අමුද්‍රව්‍ය හෝ විස්තරය පුරවන්න.',
    aiNotEnoughInfo: 'ප්‍රමාණවත් තොරතුරු නැත',
    aiUnavailable: 'AI ලබා ගත නොහැක',
    aiUnavailableMsg: 'OpenAI යතුර වින්‍යාසගත කර නැත. යෝජනා සක්‍රීය කිරීමට .env ගොනුවට OPENAI_API_KEY එක් කරන්න.',
    aiNoMatches: 'විශ්වාසනීය ගැළපීම් නැත',
    aiNoMatchesMsg: 'AI හට මෙම නිෂ්පාදනය කිසිම රෝගයකට විශ්වාසනීයව ගැළපීමට නොහැකි විය. ක්‍රියාකාරී අමුද්‍රව්‍ය හෝ විස්තරයට වැඩිපුර තොරතුරු එක් කරන්න.',
    aiAlreadyTagged: 'දැනටමත් ටැග් කර ඇත',
    aiAlreadyTaggedMsg: 'AI විසින් යෝජනා කළේ ඔබ දැනටමත් තෝරාගෙන ඇති රෝග පමණි.',
    aiSuggestionsAdded: 'යෝජනා එක් කරන ලදී',
    aiAddedPrefix: 'එක් කරන ලදී: ',
    aiSuggestionFailed: 'යෝජනා අසාර්ථකයි',
    aiCouldNotReach: 'AI සේවාවට සම්බන්ධ වීමට නොහැකි විය.',
    accessRestricted: 'ප්‍රවේශය සීමා කර ඇත',
    officersCannotList: 'නිලධාරීන්ට වෙළඳපොළේ නිෂ්පාදන ලැයිස්තුගත කළ නොහැක.',
    failedSubmit: 'නිෂ්පාදනය ඉදිරිපත් කිරීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.',
    selectUnit: 'ඒකකය තෝරන්න',
    selectDiseasesHeader: 'රෝග / කෘමීන් තෝරන්න',
  },
  தமிழ்: {
    title: 'தயாரிப்பைச் சேர்க்கவும்',
    subtitle: 'உங்கள் நெல் தயாரிப்பை விற்பனைக்கு பட்டியலிடுங்கள்',
    productName: 'தயாரிப்பு பெயர்',
    productNamePlaceholder: 'எ.கா., பிரீமியம் நெல் விதைகள்',
    category: 'வகை',
    selectCategory: 'வகையைத் தேர்ந்தெடுக்கவும்',
    price: 'விலை',
    pricePlaceholder: 'விலையை உள்ளிடவும்',
    description: 'விளக்கம்',
    descriptionPlaceholder: 'உங்கள் தயாரிப்பை விவரிக்கவும்...',
    location: 'இடம்',
    locationPlaceholder: 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்',
    contactInfo: 'தொடர்பு தகவல்',
    phone: 'தொலைபேசி எண்',
    phonePlaceholder: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
    addImage: 'தயாரிப்பு படத்தைச் சேர்க்கவும்',
    imageOptional: 'விருப்பமானது',
    submit: 'பட்டியலை சமர்ப்பிக்கவும்',
    cancel: 'ரத்துசெய்',
    success: 'தயாரிப்பு சமர்ப்பிக்கப்பட்டது!',
    successMessage: 'உங்கள் தயாரிப்பு சமர்ப்பிக்கப்பட்டு அதிகாரி அனுமதிக்காக நிலுவையில் உள்ளது.',
    pendingApprovalMessage: 'உங்கள் தயாரிப்பு சமர்ப்பிக்கப்பட்டு அதிகாரி அனுமதிக்காக நிலுவையில் உள்ளது. அது அனுமதிக்கப்படும்போது உங்களுக்கு அறிவிக்கப்படும்.',
    error: 'பிழை',
    fillAllFields: 'தயவுசெய்து அனைத்து தேவையான புலங்களையும் நிரப்பவும்',
    invalidPrice: 'தயவுசெய்து சரியான விலையை உள்ளிடவும்',
    selectCategoryError: 'தயவுசெய்து வகையைத் தேர்ந்தெடுக்கவும்',
    invalidQuantity: 'தயவுசெய்து சரியான அளவை உள்ளிடவும்',
    requiredActiveIngredient: 'பூச்சிக்கொல்லிகள்/களைக்கொல்லிகளுக்கு செயலில் உள்ள பொருள் தேவை',
    requiredTargetDiseases: 'குறைந்தது ஒரு இலக்கு நோய்/பூச்சியைத் தேர்ந்தெடுக்கவும்',
    minName: 'தயாரிப்பு பெயர் குறைந்தது 3 எழுத்துகளாக இருக்க வேண்டும்',
    minDescription: 'விளக்கம் குறைந்தது 10 எழுத்துகளாக இருக்க வேண்டும்',
    maxPrice: 'விலை ரூ. 9,999,999 ஐ தாண்டக்கூடாது',
    invalidPhone: 'தயவுசெய்து சரியான இலங்கை தொலைபேசி எண்ணை உள்ளிடவும் (எ.கா., 0771234567)',
    activeIngredient: 'செயலில் உள்ள பொருள் / இரசாயன கலவை',
    activeIngredientHint: 'எ.கா., மான்கோசெப் 64% + மெட்டாலாக்சில் 8% WP',
    activeIngredientPlaceholder: 'இரசாயன கலவையை உள்ளிடவும்',
    targetDiseases: 'இலக்கு நோய்கள் / பூச்சிகள்',
    targetDiseasesHint: 'இந்த தயாரிப்பு எந்த நோய்கள் அல்லது பூச்சிகளுக்கு சிகிச்சை அளிக்கிறது என்பதைத் தேர்ந்தெடுக்கவும்',
    selectDiseases: 'நோய்கள் / பூச்சிகளைத் தேர்ந்தெடுக்கவும்',
    nSelected: '{0} தேர்ந்தெடுக்கப்பட்டது',
    suggest: 'பரிந்துரை',
    priceAndQuantity: 'விலை & அளவு',
    quantityLabel: 'அளவு',
    priceLabel: 'விலை',
    tapAddPhoto: 'புகைப்படத்தைச் சேர்க்க தொடவும்',
    aiSuggestNoSignal: 'நாங்கள் நோய்களை பரிந்துரைக்க முதலில் தயாரிப்பு பெயர், செயலில் உள்ள பொருள் அல்லது விளக்கத்தை நிரப்பவும்.',
    aiNotEnoughInfo: 'போதிய தகவல் இல்லை',
    aiUnavailable: 'AI கிடைக்கவில்லை',
    aiUnavailableMsg: 'OpenAI விசை உள்ளமைக்கப்படவில்லை. பரிந்துரைகளை இயக்க .env கோப்பில் OPENAI_API_KEY ஐச் சேர்க்கவும்.',
    aiNoMatches: 'நம்பகமான பொருத்தங்கள் இல்லை',
    aiNoMatchesMsg: 'இந்த தயாரிப்பை எந்த நோய்க்கும் நம்பகமாக பொருத்த AI ஆல் முடியவில்லை. செயலில் உள்ள பொருள் அல்லது விளக்கத்தில் கூடுதல் விவரங்களைச் சேர்க்க முயற்சிக்கவும்.',
    aiAlreadyTagged: 'ஏற்கனவே குறிக்கப்பட்டது',
    aiAlreadyTaggedMsg: 'AI நீங்கள் ஏற்கனவே தேர்ந்தெடுத்த நோய்களை மட்டுமே பரிந்துரைத்தது.',
    aiSuggestionsAdded: 'பரிந்துரைகள் சேர்க்கப்பட்டன',
    aiAddedPrefix: 'சேர்க்கப்பட்டது: ',
    aiSuggestionFailed: 'பரிந்துரை தோல்வியடைந்தது',
    aiCouldNotReach: 'AI சேவையை அடைய முடியவில்லை.',
    accessRestricted: 'அணுகல் கட்டுப்படுத்தப்பட்டது',
    officersCannotList: 'அதிகாரிகள் சந்தையில் தயாரிப்புகளை பட்டியலிட முடியாது.',
    failedSubmit: 'தயாரிப்பை சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    selectUnit: 'அலகைத் தேர்ந்தெடுக்கவும்',
    selectDiseasesHeader: 'நோய்கள் / பூச்சிகளைத் தேர்ந்தெடுக்கவும்',
  },
};

const DISEASE_OPTIONS = [
  'Blast (Magnaporthe grisea)',
  'Sheath Blight (Rhizoctonia solani)',
  'Brown spot',
  'Downy Mildew',
  'Bacterial Leaf Blight',
  'Bacterial Leaf Streak',
  'Bacterial Panicle Blight',
  'Dead Heart',
  'Hispa',
  'Tungro Disease',
  'Rice Leaf Roller',
  'Rice Leaf Caterpillar',
  'Rice Shell Pest',
  'Thrips',
  'Paddy Stem Maggot',
  'Asiatic Rice Borer',
  'Yellow Rice Borer',
  'Rice Gall Midge',
  'Brown Plant Hopper',
  'Rice Stem Fly',
  'Rice Water Weevil',
  'Rice Leaf Hopper',
];

const categories = [
  { id: 'seeds', label: { English: 'Seeds', සිංහල: 'බීජ', தமிழ்: 'விதைகள்' }, icon: '🌾' },
  { id: 'fertilizers', label: { English: 'Fertilizers', සිංහල: 'සාරවත් පොහොර', தமிழ்: 'உரங்கள்' }, icon: '🌱' },
  { id: 'tools', label: { English: 'Tools & Equipment', සිංහල: 'මෙවලම් සහ උපකරණ', தமிழ்: 'கருவிகள் மற்றும் உபகரணங்கள்' }, icon: '🔧' },
  { id: 'pesticides', label: { English: 'Pesticides', සිංහල: 'කෘමිනාශක', தமிழ்: 'பூச்சிக்கொல்லிகள்' }, icon: '🛡️' },
  { id: 'herbicides', label: { English: 'Herbicides', සිංහල: 'වල් නාශක', தமிழ்: 'களைக்கொல்லிகள்' }, icon: '🧪' },
];

export default function AddProductScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const { user, isAuthenticated, isOfficer } = useAuth();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
  const [fadeAnim] = useState(new Animated.Value(0));

  const scrollRef = useRef(null);
  const phoneRowRef = useRef(null);
  const phoneFocusedRef = useRef(false);

  // Bring the phone input above the keyboard. We can't rely on Android's auto-scroll —
  // it only nudges enough to expose the field, not enough to clear the label above it.
  // Using a ref+listener approach because onFocus alone only fires reliably on the
  // first tap; subsequent taps on the same input race the keyboard show event.
  const scrollPhoneIntoView = () => {
    if (!phoneRowRef.current || !scrollRef.current) return;
    const scrollNode = scrollRef.current.getInnerViewNode?.() ?? scrollRef.current;
    phoneRowRef.current.measureLayout(
      scrollNode,
      (_x, y) => {
        scrollRef.current.scrollTo({ y: Math.max(0, y - 80), animated: true });
      },
      () => {},
    );
  };

  // Re-scroll any time the keyboard shows while the phone field is focused — covers
  // the "second tap" case where onFocus doesn't fire but the keyboard re-appears.
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (phoneFocusedRef.current) {
        scrollPhoneIntoView();
      }
    });
    return () => sub.remove();
  }, []);

  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    price: '',
    quantity: '',
    unit: 'kg',
    description: '',
    location: '',
    phone: '',
    activeIngredient: '',
    targetDiseases: [],
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [imageUri, setImageUri] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showDiseasePicker, setShowDiseasePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suggestingDiseases, setSuggestingDiseases] = useState(false);
  const [showPriceSheet, setShowPriceSheet] = useState(false);

  // Lazily load OpenAI key from .env so the Suggest button works without the user
  // having to visit PestDetectionScreen first.
  useEffect(() => {
    if (!llmService.isInitialized()) {
      llmService.loadFromStorage().catch(() => {});
    }
  }, []);

  const closeAllPickers = () => {
    setShowCategoryPicker(false);
    setShowDiseasePicker(false);
    setShowUnitPicker(false);
  };

  React.useEffect(() => {
    if (isOfficer) {
      showAppAlert(
        t.accessRestricted,
        t.officersCannotList,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [isOfficer, navigation, fadeAnim]);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets?.[0]) return;
    const asset = result.assets[0];
    try {
      const resized = await ImageResizer.createResizedImage(
        asset.uri, 800, 800, 'JPEG', 75
      );
      setImageUri(resized.uri);
    } catch {
      setImageUri(asset.uri);
    }
  };

  const handleCategorySelect = (categoryId) => {
    const showDiseases = categoryId === 'pesticides' || categoryId === 'herbicides';
    setFormData({
      ...formData,
      category: categoryId,
      targetDiseases: showDiseases ? formData.targetDiseases : [],
    });
    setShowCategoryPicker(false);
    setFieldErrors(prev => ({ ...prev, category: undefined }));
  };

  const toggleDisease = (disease) => {
    setFormData(prev => {
      const current = prev.targetDiseases;
      const updated = current.includes(disease)
        ? current.filter(d => d !== disease)
        : [...current, disease];
      return { ...prev, targetDiseases: updated };
    });
    setFieldErrors(prev => ({ ...prev, targetDiseases: undefined }));
  };

  // Ask the LLM which diseases this product likely treats, based on whatever the seller
  // has typed so far. Suggestions get merged with existing selections (never overwrites).
  const handleSuggestDiseases = async () => {
    const hasSignal =
      formData.productName.trim() ||
      formData.activeIngredient.trim() ||
      formData.description.trim();
    if (!hasSignal) {
      showAppAlert(t.aiNotEnoughInfo, t.aiSuggestNoSignal);
      return;
    }

    if (!llmService.isInitialized()) {
      const ok = await llmService.loadFromStorage().catch(() => false);
      if (!ok) {
        showAppAlert(t.aiUnavailable, t.aiUnavailableMsg);
        return;
      }
    }

    setSuggestingDiseases(true);
    try {
      const suggested = await llmService.inferDiseaseTagsForProduct(
        {
          productName: formData.productName,
          activeIngredient: formData.activeIngredient,
          description: formData.description,
          category: formData.category,
        },
        DISEASE_OPTIONS,
      );

      if (suggested.length === 0) {
        showAppAlert(t.aiNoMatches, t.aiNoMatchesMsg);
        return;
      }

      // Merge: keep existing selections, add new ones, preserve order.
      const existing = new Set(formData.targetDiseases);
      const added = suggested.filter(d => !existing.has(d));
      if (added.length === 0) {
        showAppAlert(t.aiAlreadyTagged, t.aiAlreadyTaggedMsg);
        return;
      }

      setFormData(prev => ({
        ...prev,
        targetDiseases: [...prev.targetDiseases, ...added],
      }));
      setFieldErrors(prev => ({ ...prev, targetDiseases: undefined }));
      showAppAlert(t.aiSuggestionsAdded, `${t.aiAddedPrefix}${added.join(', ')}`);
    } catch (err) {
      console.error('[AddProduct] disease suggestion failed:', err);
      showAppAlert(t.aiSuggestionFailed, err?.message || t.aiCouldNotReach);
    } finally {
      setSuggestingDiseases(false);
    }
  };

  const showDiseaseField = formData.category === 'pesticides' || formData.category === 'herbicides';

  const setField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const errors = {};

    if (!formData.productName.trim()) {
      errors.productName = t.fillAllFields;
    } else if (formData.productName.trim().length < 3) {
      errors.productName = t.minName;
    }

    if (!formData.category) {
      errors.category = t.selectCategoryError;
    }

    if (showDiseaseField && formData.targetDiseases.length === 0) {
      errors.targetDiseases = t.requiredTargetDiseases;
    }

    if (showDiseaseField && !formData.activeIngredient.trim()) {
      errors.activeIngredient = t.requiredActiveIngredient;
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price.trim() || isNaN(priceNum) || priceNum <= 0) {
      errors.price = t.invalidPrice;
    } else if (priceNum > 9999999) {
      errors.price = t.maxPrice;
    }

    const qtyNum = parseInt(formData.quantity, 10);
    if (!formData.quantity.trim() || isNaN(qtyNum) || qtyNum < 0) {
      errors.quantity = t.invalidQuantity;
    }

    if (!formData.description.trim()) {
      errors.description = t.fillAllFields;
    } else if (formData.description.trim().length < 10) {
      errors.description = t.minDescription;
    }

    if (!formData.location) {
      errors.location = t.fillAllFields;
    }

    if (!formData.phone.trim()) {
      errors.phone = t.fillAllFields;
    } else {
      const phoneClean = formData.phone.replace(/\s/g, '');
      if (!/^0\d{9}$/.test(phoneClean)) {
        errors.phone = t.invalidPhone;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Scroll to top so user sees errors
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      let imageUrl = null;
      if (imageUri) {
        setImageUploading(true);
        imageUrl = await uploadProductImage(imageUri, user.uid);
        setImageUploading(false);
      }
      await addProduct({ ...formData, imageUrl }, user);
      setShowSuccessModal(true);
    } catch (error) {
      setImageUploading(false);
      console.error('Error adding product:', error);
      showAppAlert(t.error, t.failedSubmit);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryLabel = formData.category
    ? categories.find(c => c.id === formData.category)?.label[selectedLanguage] || ''
    : '';

  const inputStyle = (key) => [
    styles.input,
    fieldErrors[key] && styles.inputError,
  ];

  const selectorStyle = (key) => [
    styles.categorySelector,
    fieldErrors[key] && styles.inputError,
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F5132" translucent={false} />
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        <View style={styles.statusBarContainer} />
      </SafeAreaView>
      <SafeAreaView style={styles.safeAreaContent} edges={['left', 'right']}>
        {/* Android handles keyboard via AndroidManifest's adjustResize; using
            KeyboardAvoidingView here too caused the form to over-scroll on Android
            (e.g. tapping the phone field jumped the input off-screen). iOS still
            needs KAV with 'padding' to lift the input above the keyboard. */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 72 + insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={closeAllPickers}
        >
          {/* Hero Header */}
          <View style={styles.heroHeader}>
            <View style={styles.headerPattern} />
            <View style={styles.headerPattern2} />
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
              </View>
              <View style={styles.headerSpacer} />
            </View>
          </View>

          <View style={styles.innerContent}>
            {/* Product Name */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.label}>{t.productName}</Text>
              <TextInput
                style={inputStyle('productName')}
                placeholder={t.productNamePlaceholder}
                placeholderTextColor="#999"
                value={formData.productName}
                onChangeText={(text) => setField('productName', text)}
              />
              {fieldErrors.productName && (
                <Text style={styles.fieldError}>{fieldErrors.productName}</Text>
              )}
            </Animated.View>

            {/* Category */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.label}>{t.category}</Text>
              <TouchableOpacity
                style={selectorStyle('category')}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryText, !formData.category && styles.categoryPlaceholder]}>
                  {formData.category ? selectedCategoryLabel : t.selectCategory}
                </Text>
                <Icon name="chevron-down" size={24} color="#666" />
              </TouchableOpacity>
              {fieldErrors.category && (
                <Text style={styles.fieldError}>{fieldErrors.category}</Text>
              )}
            </Animated.View>

            {/* Active Ingredient — only for pesticides/herbicides.
                Sits above Target Diseases so it can power the AI Suggest button below. */}
            {showDiseaseField && (
              <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                <Text style={styles.label}>{t.activeIngredient}</Text>
                <Text style={styles.optionalLabel}>{t.activeIngredientHint}</Text>
                <TextInput
                  style={inputStyle('activeIngredient')}
                  placeholder={t.activeIngredientPlaceholder}
                  placeholderTextColor="#999"
                  value={formData.activeIngredient}
                  onChangeText={(text) => setField('activeIngredient', text)}
                  onFocus={closeAllPickers}
                />
                {fieldErrors.activeIngredient && (
                  <Text style={styles.fieldError}>{fieldErrors.activeIngredient}</Text>
                )}
              </Animated.View>
            )}

            {/* Target Diseases — only for pesticides/herbicides */}
            {showDiseaseField && (
              <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                <View style={styles.suggestRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>{t.targetDiseases}</Text>
                    <Text style={styles.optionalLabel}>{t.targetDiseasesHint}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.suggestBtn, suggestingDiseases && styles.suggestBtnDisabled]}
                    onPress={handleSuggestDiseases}
                    disabled={suggestingDiseases}
                    activeOpacity={0.7}
                  >
                    {suggestingDiseases ? (
                      <ActivityIndicator size="small" color="#0F5132" />
                    ) : (
                      <>
                        <Icon name="auto-fix" size={16} color="#0F5132" />
                        <Text style={styles.suggestBtnText}>{t.suggest}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={selectorStyle('targetDiseases')}
                  onPress={() => setShowDiseasePicker(!showDiseasePicker)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryText, formData.targetDiseases.length === 0 && styles.categoryPlaceholder]}>
                    {formData.targetDiseases.length > 0
                      ? t.nSelected.replace('{0}', formData.targetDiseases.length)
                      : t.selectDiseases}
                  </Text>
                  <Icon name={showDiseasePicker ? 'chevron-up' : 'chevron-down'} size={24} color="#666" />
                </TouchableOpacity>
                {fieldErrors.targetDiseases && (
                  <Text style={styles.fieldError}>{fieldErrors.targetDiseases}</Text>
                )}
                {/* Selected tags */}
                {formData.targetDiseases.length > 0 && (
                  <View style={styles.diseaseTagsContainer}>
                    {formData.targetDiseases.map((disease) => (
                      <TouchableOpacity
                        key={disease}
                        style={styles.diseaseTag}
                        onPress={() => toggleDisease(disease)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.diseaseTagText}>{disease}</Text>
                        <Icon name="close" size={14} color="#0F5132" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Animated.View>
            )}

            {/* Price + Quantity + Unit — tappable summary opens an alarm-style wheel sheet */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.label}>{t.priceAndQuantity}</Text>
              <TouchableOpacity
                style={[
                  styles.priceQtySummary,
                  (fieldErrors.price || fieldErrors.quantity) && styles.inputError,
                ]}
                onPress={() => {
                  closeAllPickers();
                  setShowPriceSheet(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.priceQtyCol}>
                  <Text style={styles.priceQtyHint}>{t.priceLabel}</Text>
                  <Text style={styles.priceQtyValue}>
                    Rs. {formData.price ? Number(formData.price).toLocaleString() : '—'}
                  </Text>
                </View>
                <View style={styles.priceQtyDivider} />
                <View style={styles.priceQtyCol}>
                  <Text style={styles.priceQtyHint}>{t.quantityLabel}</Text>
                  <Text style={styles.priceQtyValue}>
                    {formData.quantity !== undefined && formData.quantity !== null && formData.quantity !== ''
                      ? `${formData.quantity} ${formData.unit}`
                      : '—'}
                  </Text>
                </View>
                <Icon name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {(fieldErrors.price || fieldErrors.quantity) && (
                <Text style={styles.fieldError}>
                  {fieldErrors.price || fieldErrors.quantity}
                </Text>
              )}
            </Animated.View>

            {/* Description */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.label}>{t.description}</Text>
              <TextInput
                style={[inputStyle('description'), styles.textArea]}
                placeholder={t.descriptionPlaceholder}
                placeholderTextColor="#999"
                value={formData.description}
                onChangeText={(text) => setField('description', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onFocus={closeAllPickers}
              />
              {fieldErrors.description && (
                <Text style={styles.fieldError}>{fieldErrors.description}</Text>
              )}
            </Animated.View>

            {/* Location — city picker */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.label}>{t.location}</Text>
              <TouchableOpacity
                style={selectorStyle('location')}
                onPress={() => {
                  closeAllPickers();
                  setShowCityPicker(true);
                }}
                activeOpacity={0.7}
              >
                <Icon name="map-marker" size={18} color={formData.location ? '#0F5132' : '#999'} style={{ marginRight: 8 }} />
                <Text style={[styles.categoryText, !formData.location && styles.categoryPlaceholder]}>
                  {formData.location || t.locationPlaceholder}
                </Text>
                <Icon name="chevron-down" size={24} color="#666" />
              </TouchableOpacity>
              {fieldErrors.location && (
                <Text style={styles.fieldError}>{fieldErrors.location}</Text>
              )}
            </Animated.View>

            {/* Contact Info */}
            <Animated.View
              ref={phoneRowRef}
              style={[styles.section, { opacity: fadeAnim }]}
            >
              <Text style={styles.sectionTitle}>{t.contactInfo}</Text>
              <Text style={styles.label}>{t.phone}</Text>
              <PhoneInput
                value={formData.phone}
                onChangeText={(next) => setField('phone', next)}
                error={!!fieldErrors.phone}
                onFocus={() => {
                  phoneFocusedRef.current = true;
                  closeAllPickers();
                  // First tap: keyboard isn't open yet, so onFocus fires before
                  // keyboardDidShow. Trigger a scroll here too in case the listener
                  // missed the first event for any reason.
                  setTimeout(scrollPhoneIntoView, 250);
                }}
                onBlur={() => {
                  phoneFocusedRef.current = false;
                }}
              />
              {fieldErrors.phone && (
                <Text style={styles.fieldError}>{fieldErrors.phone}</Text>
              )}
            </Animated.View>

            {/* Product Image */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.label}>{t.addImage} <Text style={styles.optionalLabel}>({t.imageOptional})</Text></Text>
              <View style={styles.imagePickerWrapper}>
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Icon name="camera-plus" size={32} color="#0F5132" />
                      <Text style={styles.imagePlaceholderText}>{t.tapAddPhoto}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {imageUri && (
                  <TouchableOpacity
                    style={styles.imageRemoveFab}
                    onPress={() => setImageUri(null)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon name="close" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>

            {/* Submit Button */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <TouchableOpacity
                style={[styles.submitButton, (submitting || imageUploading) && { opacity: 0.6 }]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={submitting || imageUploading}
              >
                <Icon name={(submitting || imageUploading) ? 'loading' : 'check-circle'} size={24} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  {imageUploading ? 'Uploading image...' : submitting ? 'Submitting...' : t.submit}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Category Picker — bottom sheet so it doesn't push form content around */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetDismissArea}
            activeOpacity={1}
            onPress={() => setShowCategoryPicker(false)}
          />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.sheetDragHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t.selectCategory}</Text>
              <TouchableOpacity
                style={styles.sheetCloseBtn}
                onPress={() => setShowCategoryPicker(false)}
                activeOpacity={0.7}
              >
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.sheetList}
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {categories.map((category) => {
                const isSelected = formData.category === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.sheetRow, isSelected && styles.sheetRowSelected]}
                    onPress={() => handleCategorySelect(category.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                    <Text style={[styles.sheetRowText, isSelected && styles.sheetRowTextSelected]}>
                      {category.label[selectedLanguage]}
                    </Text>
                    {isSelected && <Icon name="check" size={20} color="#0F5132" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Unit Picker — bottom sheet */}
      <Modal
        visible={showUnitPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowUnitPicker(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetDismissArea}
            activeOpacity={1}
            onPress={() => setShowUnitPicker(false)}
          />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.sheetDragHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t.selectUnit}</Text>
              <TouchableOpacity
                style={styles.sheetCloseBtn}
                onPress={() => setShowUnitPicker(false)}
                activeOpacity={0.7}
              >
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.sheetList}
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {UNIT_OPTIONS.map((u) => {
                const isSelected = formData.unit === u;
                return (
                  <TouchableOpacity
                    key={u}
                    style={[styles.sheetRow, isSelected && styles.sheetRowSelected]}
                    onPress={() => {
                      setField('unit', u);
                      setShowUnitPicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.sheetRowText, isSelected && styles.sheetRowTextSelected]}>{u}</Text>
                    {isSelected && <Icon name="check" size={20} color="#0F5132" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Disease Picker — bottom sheet, multi-select with Done button */}
      <Modal
        visible={showDiseasePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDiseasePicker(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetDismissArea}
            activeOpacity={1}
            onPress={() => setShowDiseasePicker(false)}
          />
          <View style={[styles.sheet, styles.sheetTall, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.sheetDragHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t.selectDiseasesHeader}</Text>
              <TouchableOpacity
                style={styles.sheetCloseBtn}
                onPress={() => setShowDiseasePicker(false)}
                activeOpacity={0.7}
              >
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.sheetList}
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator
            >
              {DISEASE_OPTIONS.map((disease) => {
                const isSelected = formData.targetDiseases.includes(disease);
                return (
                  <TouchableOpacity
                    key={disease}
                    style={[styles.sheetRow, isSelected && styles.sheetRowSelected]}
                    onPress={() => toggleDisease(disease)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={20}
                      color={isSelected ? '#0F5132' : '#999'}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={[styles.sheetRowText, isSelected && styles.sheetRowTextSelected]}>{disease}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.sheetDoneBtn}
              onPress={() => setShowDiseasePicker(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.sheetDoneText}>
                Done {formData.targetDiseases.length > 0 ? `(${formData.targetDiseases.length})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Price + Quantity + Unit alarm-style wheel picker */}
      <PriceQuantitySheet
        visible={showPriceSheet}
        price={formData.price}
        quantity={formData.quantity}
        unit={formData.unit}
        unitOptions={UNIT_OPTIONS}
        onClose={() => setShowPriceSheet(false)}
        onConfirm={({ price, quantity, unit }) => {
          setFormData(prev => ({ ...prev, price, quantity, unit }));
          setFieldErrors(prev => ({ ...prev, price: undefined, quantity: undefined }));
        }}
      />

      {/* City Picker Modal */}
      <CityPickerModal
        visible={showCityPicker}
        selected={formData.location}
        onSelect={(district) => {
          setField('location', district);
          setShowCityPicker(false);
        }}
        onClose={() => setShowCityPicker(false)}
      />

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconCircle}>
              <Icon name="check-bold" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>{t.success}</Text>
            <Text style={styles.successMessage}>
              {t.pendingApprovalMessage || t.successMessage}
            </Text>
            <View style={styles.successInfoRow}>
              <Icon name="clock-outline" size={16} color="#6B8F7B" />
              <Text style={styles.successInfoText}>
                An officer will review your listing shortly
              </Text>
            </View>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                setFormData({
                  productName: '',
                  category: '',
                  price: '',
                  quantity: '',
                  unit: 'kg',
                  description: '',
                  location: '',
                  phone: '',
                  activeIngredient: '',
                  targetDiseases: [],
                });
                setImageUri(null);
                setFieldErrors({});
                navigation.navigate('MyListings');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.successButtonText}>View My Listings</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    height: height * 0.18,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    zIndex: 1,
    position: 'relative',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerSpacer: {
    width: 48,
    height: 48,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  innerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    marginLeft: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    marginLeft: 4,
  },
  optionalLabel: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
    marginTop: -4,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  fieldError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  currencySymbol: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    paddingLeft: 16,
    paddingRight: 8,
  },
  priceInput: {
    flex: 1,
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    gap: 4,
    minWidth: 64,
    justifyContent: 'center',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  priceQtySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 64,
  },
  priceQtyCol: {
    flex: 1,
  },
  priceQtyHint: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  priceQtyValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  priceQtyDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: 12,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1,
  },
  categoryPlaceholder: {
    color: '#999',
  },
  categoryPicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  categoryOptionActive: {
    backgroundColor: '#F0F7F3',
  },
  categoryOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: '#0F5132',
    fontWeight: '700',
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerDoneBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#F0F7F3',
  },
  pickerDoneText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F5132',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheetDismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: '60%',
  },
  sheetTall: {
    maxHeight: '80%',
  },
  sheetDragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  sheetList: {
    flexGrow: 0,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 4,
  },
  sheetRowSelected: {
    backgroundColor: '#F0F7F3',
  },
  sheetRowText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  sheetRowTextSelected: {
    color: '#0F5132',
    fontWeight: '700',
  },
  sheetDoneBtn: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0F5132',
  },
  sheetDoneText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F5132',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F5132',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#5A7D6A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  successInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F7F3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 24,
  },
  successInfoText: {
    fontSize: 13,
    color: '#6B8F7B',
  },
  successButton: {
    backgroundColor: '#0F5132',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    elevation: 3,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  diseaseTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
  },
  suggestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F7F3',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.25)',
    minWidth: 92,
    justifyContent: 'center',
  },
  suggestBtnDisabled: {
    opacity: 0.6,
  },
  suggestBtnText: {
    fontSize: 13,
    color: '#0F5132',
    fontWeight: '600',
  },
  diseaseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F3',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.15)',
    gap: 4,
  },
  diseaseTagText: {
    fontSize: 12,
    color: '#0F5132',
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  imagePicker: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(15,81,50,0.2)',
    borderStyle: 'dashed',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#F0F7F3',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F5132',
  },
  imagePickerWrapper: {
    position: 'relative',
  },
  imageRemoveFab: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
