import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../src/context/AuthContext';
import { useLanguage } from '../src/context/LanguageContext';
import { useTranslation } from '../src/i18n/useTranslation';

import { saveOfficerProfile } from '../src/services/messagingService';

const languageOptions = ['English', 'සිංහල', 'தமிழ்'];

export default function OfficerLoginScreen({ navigation, onSkip }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const { selectedLanguage, changeLanguage } = useLanguage();
  const translate = useTranslation('officerLogin');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const { signInAsOfficer, signUpAsOfficer, resetPassword, signInWithGoogle, signOut, loading } = useAuth();

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    } else if (!formData.email.endsWith('@agri.gov.lk')) {
      newErrors.email = translate('invalidEmail');
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (isResetPassword && !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (isResetPassword && !formData.email.endsWith('@agri.gov.lk')) {
      newErrors.email = translate('invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (isResetPassword) {
      const result = await resetPassword(formData.email);
      if (result.success) {
        showAppAlert(translate('success'), result.message || translate('passwordResetSent'));
        setIsResetPassword(false);
        setFormData({ ...formData, email: '' });
      } else {
        showAppAlert(translate('common.error'), result.error);
      }
      return;
    }

    if (isSignUp) {
      const result = await signUpAsOfficer(formData.email, formData.password, formData.name);
      if (result.success) {
        console.log('Officer registration successful');
        const currentUser = auth().currentUser;
        if (currentUser) saveOfficerProfile(currentUser).catch(console.error);
      } else {
        console.error('Officer registration failed:', result.error);
        showAppAlert(translate('registrationFailed'), result.error);
      }
    } else {
      const result = await signInAsOfficer(formData.email, formData.password);
      if (result.success) {
        const currentUser = auth().currentUser;
        if (currentUser) saveOfficerProfile(currentUser).catch(console.error);
      } else {
        showAppAlert(translate('common.error'), result.error);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      // Check if email is @agri.gov.lk
      if (result.user?.email && !result.user.email.endsWith('@agri.gov.lk')) {
        showAppAlert(translate('accessDenied'), translate('invalidEmail'));
        // Sign out if not officer email
        await signOut();
      }
    } else if (!result.cancelled) {
      showAppAlert(translate('common.error'), result.error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F5132" translucent={false} />
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        <View style={styles.statusBarContainer} />
      </SafeAreaView>
      <SafeAreaView style={styles.safeAreaContent} edges={['left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.headerBackground}>
                <View style={styles.headerPattern} />
                <View style={styles.headerPattern2} />
              </View>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
              >
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.appName}>iPaddyCare</Text>
              <Text style={styles.welcomeText}>{translate('welcomeBack')}</Text>
              <Text style={styles.subtitle}>{translate('subtitle')}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{translate('officerOnly')}</Text>
              </View>
              <View style={styles.languageSelector}>
                {languageOptions.map((language) => {
                  const isActive = selectedLanguage === language;
                  return (
                    <TouchableOpacity
                      key={language}
                      onPress={() => changeLanguage(language)}
                      style={[
                        styles.languageChip,
                        isActive && styles.languageChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.languageChipText,
                          isActive && styles.languageChipTextActive,
                          (Platform.OS === 'android' && (language === 'සිංහල' || language === 'தமிழ்')) && styles.languageChipTextNonLatin,
                        ]}
                      >
                        {language}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            {/* Form */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {isResetPassword ? (
                <>
                  <Text style={styles.resetText}>{translate('enterEmail')}</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{translate('common.email')}</Text>
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder="officer@agri.gov.lk"
                      placeholderTextColor="#999"
                      value={formData.email}
                      onChangeText={(text) =>
                        setFormData({ ...formData, email: text })
                      }
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  </View>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>{translate('sendResetLink')}</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => {
                      setIsResetPassword(false);
                      setErrors({});
                    }}
                  >
                    <Text style={styles.linkText}>{translate('backToLogin')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {isSignUp && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>{translate('name')}</Text>
                      <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        placeholder="Enter your full name"
                        placeholderTextColor="#999"
                        value={formData.name}
                        onChangeText={(text) =>
                          setFormData({ ...formData, name: text })
                        }
                        autoCapitalize="words"
                      />
                      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{translate('common.email')}</Text>
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder="officer@agri.gov.lk"
                      placeholderTextColor="#999"
                      value={formData.email}
                      onChangeText={(text) =>
                        setFormData({ ...formData, email: text })
                      }
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{translate('common.password')}</Text>
                    <TextInput
                      style={[styles.input, errors.password && styles.inputError]}
                      placeholder="Enter your password"
                      placeholderTextColor="#999"
                      value={formData.password}
                      onChangeText={(text) =>
                        setFormData({ ...formData, password: text })
                      }
                      secureTextEntry
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                  </View>

                  {isSignUp && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>{translate('confirmPassword')}</Text>
                      <TextInput
                        style={[styles.input, errors.confirmPassword && styles.inputError]}
                        placeholder="Confirm your password"
                        placeholderTextColor="#999"
                        value={formData.confirmPassword}
                        onChangeText={(text) =>
                          setFormData({ ...formData, confirmPassword: text })
                        }
                        secureTextEntry
                      />
                      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        {isSignUp ? translate('createAccount') : translate('login')}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {!isSignUp && (
                    <TouchableOpacity
                      style={styles.linkButton}
                      onPress={() => setIsResetPassword(true)}
                    >
                      <Text style={styles.linkText}>{translate('forgotPassword')}</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>{translate('orContinueWith')}</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <Text style={styles.googleButtonText}>{translate('continueWithGoogle')}</Text>
                  </TouchableOpacity>

                  <View style={styles.switchContainer}>
                    <Text style={styles.switchText}>
                      {isSignUp ? translate('alreadyHaveAccount') : translate('dontHaveAccount')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setIsSignUp(!isSignUp);
                        setErrors({});
                        setFormData({
                          email: formData.email,
                          password: '',
                          name: '',
                          confirmPassword: '',
                        });
                      }}
                    >
                      <Text style={styles.switchLink}>
                        {isSignUp ? translate('login') : translate('signUp')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7F3',
  },
  safeAreaTop: {
    backgroundColor: '#0F5132',
  },
  statusBarContainer: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#0F5132',
  },
  safeAreaContent: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#0F5132',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    ...(Platform.OS === 'ios' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    }),
    ...(Platform.OS === 'android' && {
      elevation: 0,
    }),
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerPattern: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerPattern2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  languageChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  languageChipActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  languageChipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  languageChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  languageChipTextNonLatin: {
    fontSize: 11,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#E91E63',
  },
  errorText: {
    color: '#E91E63',
    fontSize: 12,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#0F5132',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#0F5132',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  googleButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchText: {
    color: '#666',
    fontSize: 14,
  },
  switchLink: {
    color: '#0F5132',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  resetText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
});

