import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../src/context/LanguageContext';
import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { addProduct } from '../src/services/marketplaceService';

const { width, height } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    title: 'Add Product',
    subtitle: 'List your paddy product for sale',
    productName: 'Product Name',
    productNamePlaceholder: 'e.g., Premium Paddy Seeds',
    category: 'Category',
    selectCategory: 'Select Category',
    price: 'Price (Rs.)',
    pricePlaceholder: 'Enter price',
    description: 'Description',
    descriptionPlaceholder: 'Describe your product...',
    location: 'Location',
    locationPlaceholder: 'e.g., Colombo',
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
  },
  සිංහල: {
    title: 'නිෂ්පාදනයක් එක් කරන්න',
    subtitle: 'ඔබේ වී නිෂ්පාදනය විකිණීමට ලැයිස්තුගත කරන්න',
    productName: 'නිෂ්පාදන නම',
    productNamePlaceholder: 'උදා: විශේෂ වී බීජ',
    category: 'කාණ්ඩය',
    selectCategory: 'කාණ්ඩයක් තෝරන්න',
    price: 'මිල (රු.)',
    pricePlaceholder: 'මිල ඇතුළත් කරන්න',
    description: 'විස්තරය',
    descriptionPlaceholder: 'ඔබේ නිෂ්පාදනය විස්තර කරන්න...',
    location: 'ස්ථානය',
    locationPlaceholder: 'උදා: කොළඹ',
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
  },
  தமிழ்: {
    title: 'தயாரிப்பைச் சேர்க்கவும்',
    subtitle: 'உங்கள் நெல் தயாரிப்பை விற்பனைக்கு பட்டியலிடுங்கள்',
    productName: 'தயாரிப்பு பெயர்',
    productNamePlaceholder: 'எ.கா., பிரீமியம் நெல் விதைகள்',
    category: 'வகை',
    selectCategory: 'வகையைத் தேர்ந்தெடுக்கவும்',
    price: 'விலை (ரூ.)',
    pricePlaceholder: 'விலையை உள்ளிடவும்',
    description: 'விளக்கம்',
    descriptionPlaceholder: 'உங்கள் தயாரிப்பை விவரிக்கவும்...',
    location: 'இடம்',
    locationPlaceholder: 'எ.கா., கொழும்பு',
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

  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    location: '',
    phone: '',
    activeIngredient: '',
    targetDiseases: [],
  });

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDiseasePicker, setShowDiseasePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const closeAllPickers = () => {
    setShowCategoryPicker(false);
    setShowDiseasePicker(false);
  };

  React.useEffect(() => {
    if (isOfficer) {
      Alert.alert(
        'Access Restricted',
        'Officers cannot list products in the marketplace.',
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

  const handleCategorySelect = (categoryId) => {
    const showDiseases = categoryId === 'pesticides' || categoryId === 'herbicides';
    setFormData({
      ...formData,
      category: categoryId,
      targetDiseases: showDiseases ? formData.targetDiseases : [],
    });
    setShowCategoryPicker(false);
  };

  const toggleDisease = (disease) => {
    setFormData(prev => {
      const current = prev.targetDiseases;
      const updated = current.includes(disease)
        ? current.filter(d => d !== disease)
        : [...current, disease];
      return { ...prev, targetDiseases: updated };
    });
  };

  const showDiseaseField = formData.category === 'pesticides' || formData.category === 'herbicides';

  const handleSubmit = async () => {
    // Validation
    if (!formData.productName.trim()) {
      Alert.alert(t.error, t.fillAllFields);
      return;
    }
    if (!formData.category) {
      Alert.alert(t.error, t.selectCategoryError);
      return;
    }
    if (!formData.price.trim() || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      Alert.alert(t.error, t.invalidPrice);
      return;
    }
    if (!formData.quantity.trim() || isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) < 0) {
      Alert.alert(t.error, 'Please enter a valid quantity');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert(t.error, t.fillAllFields);
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert(t.error, t.fillAllFields);
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert(t.error, t.fillAllFields);
      return;
    }
    const phoneClean = formData.phone.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(phoneClean)) {
      Alert.alert(t.error, 'Please enter a valid Sri Lankan phone number (e.g., 0771234567)');
      return;
    }

    setSubmitting(true);
    try {
      await addProduct(formData, user);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert(t.error, 'Failed to submit product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryLabel = formData.category
    ? categories.find(c => c.id === formData.category)?.label[selectedLanguage] || ''
    : '';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F5132" translucent={false} />
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        <View style={styles.statusBarContainer} />
      </SafeAreaView>
      <SafeAreaView style={styles.safeAreaContent} edges={['left', 'right']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
              <View style={styles.backButton} />
            </View>
          </View>

          <View style={styles.innerContent}>
            {/* Product Name */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.label}>{t.productName} *</Text>
              <TextInput
                style={styles.input}
                placeholder={t.productNamePlaceholder}
                placeholderTextColor="#999"
                value={formData.productName}
                onChangeText={(text) => setFormData({ ...formData, productName: text })}
              />
            </Animated.View>

            {/* Category */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.label}>{t.category} *</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryText, !formData.category && styles.categoryPlaceholder]}>
                  {formData.category ? selectedCategoryLabel : t.selectCategory}
                </Text>
                <Icon name="chevron-down" size={24} color="#666" />
              </TouchableOpacity>
              {showCategoryPicker && (
                <View style={styles.categoryPicker}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        formData.category === category.id && styles.categoryOptionActive,
                      ]}
                      onPress={() => handleCategorySelect(category.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                      <Text
                        style={[
                          styles.categoryOptionText,
                          formData.category === category.id && styles.categoryOptionTextActive,
                        ]}
                      >
                        {category.label[selectedLanguage]}
                      </Text>
                      {formData.category === category.id && (
                        <Icon name="check" size={20} color="#0F5132" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Animated.View>

            {/* Target Diseases — only for pesticides/herbicides */}
            {showDiseaseField && (
              <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                <Text style={styles.label}>Target Diseases / Pests</Text>
                <Text style={styles.optionalLabel}>Select which diseases or pests this product treats</Text>
                <TouchableOpacity
                  style={styles.categorySelector}
                  onPress={() => setShowDiseasePicker(!showDiseasePicker)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryText, formData.targetDiseases.length === 0 && styles.categoryPlaceholder]}>
                    {formData.targetDiseases.length > 0
                      ? `${formData.targetDiseases.length} selected`
                      : 'Select diseases / pests'}
                  </Text>
                  <Icon name={showDiseasePicker ? 'chevron-up' : 'chevron-down'} size={24} color="#666" />
                </TouchableOpacity>
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
                {showDiseasePicker && (
                  <View style={styles.categoryPicker}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 250 }}>
                      {DISEASE_OPTIONS.map((disease) => {
                        const isSelected = formData.targetDiseases.includes(disease);
                        return (
                          <TouchableOpacity
                            key={disease}
                            style={[styles.categoryOption, isSelected && styles.categoryOptionActive]}
                            onPress={() => toggleDisease(disease)}
                            activeOpacity={0.7}
                          >
                            <Icon
                              name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                              size={20}
                              color={isSelected ? '#0F5132' : '#999'}
                              style={{ marginRight: 12 }}
                            />
                            <Text style={[styles.categoryOptionText, isSelected && styles.categoryOptionTextActive]}>
                              {disease}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                    <TouchableOpacity
                      style={styles.pickerDoneBtn}
                      onPress={() => setShowDiseasePicker(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.pickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Active Ingredient — only for pesticides/herbicides */}
            {showDiseaseField && (
              <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                <Text style={styles.label}>Active Ingredient / Chemical Composition *</Text>
                <Text style={styles.optionalLabel}>e.g., Mancozeb 64% + Metalaxyl 8% WP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter chemical composition"
                  placeholderTextColor="#999"
                  value={formData.activeIngredient}
                  onChangeText={(text) => setFormData({ ...formData, activeIngredient: text })}
                  onFocus={closeAllPickers}
                />
              </Animated.View>
            )}

            {/* Price & Quantity Row */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t.price} *</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.currencySymbol}>Rs.</Text>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      placeholder={t.pricePlaceholder}
                      placeholderTextColor="#999"
                      value={formData.price}
                      onChangeText={(text) => setFormData({ ...formData, price: text.replace(/[^0-9.]/g, '') })}
                      keyboardType="numeric"
                      onFocus={closeAllPickers}
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Quantity *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 50"
                    placeholderTextColor="#999"
                    value={formData.quantity}
                    onChangeText={(text) => setFormData({ ...formData, quantity: text.replace(/[^0-9]/g, '') })}
                    keyboardType="numeric"
                    onFocus={closeAllPickers}
                  />
                </View>
              </View>
            </Animated.View>

            {/* Description */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.label}>{t.description} *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t.descriptionPlaceholder}
                placeholderTextColor="#999"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onFocus={closeAllPickers}
              />
            </Animated.View>

            {/* Location */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.label}>{t.location} *</Text>
              <TextInput
                style={styles.input}
                placeholder={t.locationPlaceholder}
                placeholderTextColor="#999"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                onFocus={closeAllPickers}
              />
            </Animated.View>

            {/* Contact Info */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{t.contactInfo}</Text>
              <Text style={styles.label}>{t.phone} *</Text>
              <TextInput
                style={styles.input}
                placeholder={t.phonePlaceholder}
                placeholderTextColor="#999"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text.replace(/[^0-9]/g, '') })}
                keyboardType="phone-pad"
                maxLength={10}
                onFocus={() => {
                  closeAllPickers();
                  setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
                }}
              />
            </Animated.View>

            {/* Submit Button */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <TouchableOpacity
                style={[styles.submitButton, submitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={submitting}
              >
                <Icon name={submitting ? 'loading' : 'check-circle'} size={24} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : t.submit}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

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
                  description: '',
                  location: '',
                  phone: '',
                  activeIngredient: '',
                  targetDiseases: [],
                });
                navigation.goBack();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.successButtonText}>Done</Text>
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
});

