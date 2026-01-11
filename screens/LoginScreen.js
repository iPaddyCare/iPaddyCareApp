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
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/AuthContext';
import { useLanguage } from '../src/context/LanguageContext';

const translations = {
  English: {
    welcomeBack: 'Welcome Back',
    subtitle: 'Sign in to continue to iPaddyCare',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    signUp: 'Sign Up',
    forgotPassword: 'Forgot Password?',
    skip: 'Skip for Now',
    orContinueWith: 'or continue with',
    continueWithGoogle: 'Continue with Google',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    name: 'Full Name',
    confirmPassword: 'Confirm Password',
    createAccount: 'Create Account',
    resetPassword: 'Reset Password',
    enterEmail: 'Enter your email to reset password',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to Login',
    officerLogin: 'Login as Officer',
    officerLoginDesc: 'Are you an agricultural officer?',
  },
  සිංහල: {
    welcomeBack: 'ආපසු සාදරයෙන් පිළිගනිමු',
    subtitle: 'iPaddyCare වෙත යාමට පිවිසෙන්න',
    email: 'විද්‍යුත් තැපෑල',
    password: 'මුරපදය',
    login: 'පිවිසෙන්න',
    signUp: 'ලියාපදිංචි වන්න',
    forgotPassword: 'මුරපදය අමතකද?',
    skip: 'දැනට මඟ හරින්න',
    orContinueWith: 'නැතහොත් ඉදිරියට යන්න',
    continueWithGoogle: 'Google සමඟ ඉදිරියට',
    dontHaveAccount: 'ගිණුමක් නැතද?',
    alreadyHaveAccount: 'දැනටමත් ගිණුමක් ඇතද?',
    name: 'සම්පූර්ණ නම',
    confirmPassword: 'මුරපදය තහවුරු කරන්න',
    createAccount: 'ගිණුම සාදන්න',
    resetPassword: 'මුරපදය නැවත සැකසීම',
    enterEmail: 'මුරපදය නැවත සැකසීමට ඔබේ විද්‍යුත් තැපෑල ඇතුළත් කරන්න',
    sendResetLink: 'නැවත සැකසීමේ සබැඳිය යවන්න',
    backToLogin: 'පිවිසීමට ආපසු යන්න',
    officerLogin: 'නිලධාරියෙකු ලෙස පිවිසෙන්න',
    officerLoginDesc: 'ඔබ කෘෂිකර්ම නිලධාරියෙක්ද?',
  },
  தமிழ்: {
    welcomeBack: 'மீண்டும் வரவேற்கிறோம்',
    subtitle: 'iPaddyCare க்கு தொடர உள்நுழையவும்',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    login: 'உள்நுழைக',
    signUp: 'பதிவு செய்ய',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    skip: 'இப்போது தவிர்',
    orContinueWith: 'அல்லது தொடரவும்',
    continueWithGoogle: 'Google உடன் தொடரவும்',
    dontHaveAccount: 'கணக்கு இல்லையா?',
    alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    name: 'முழுப் பெயர்',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்த',
    createAccount: 'கணக்கை உருவாக்க',
    resetPassword: 'கடவுச்சொல்லை மீட்டமை',
    enterEmail: 'கடவுச்சொல்லை மீட்டமைக்க உங்கள் மின்னஞ்சலை உள்ளிடவும்',
    sendResetLink: 'மீட்டமைப்பு இணைப்பை அனுப்ப',
    backToLogin: 'உள்நுழைக்கு திரும்ப',
    officerLogin: 'அதிகாரியாக உள்நுழைக',
    officerLoginDesc: 'நீங்கள் விவசாய அதிகாரியா?',
  },
};

const languageOptions = Object.keys(translations);

export default function LoginScreen({ navigation, onSkip }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const { selectedLanguage, changeLanguage } = useLanguage();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const { signIn, signUp, resetPassword, signInWithGoogle, loading } = useAuth();

  const t = translations[selectedLanguage];

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (isResetPassword) {
      const result = await resetPassword(formData.email);
      if (result.success) {
        Alert.alert('Success', result.message || 'Password reset email sent!');
        setIsResetPassword(false);
        setFormData({ ...formData, email: '' });
      } else {
        Alert.alert('Error', result.error);
      }
      return;
    }

    if (isSignUp) {
      const result = await signUp(formData.email, formData.password, formData.name);
      if (result.success) {
        // Navigation will be handled by auth state change
        console.log('Registration successful');
      } else {
        console.error('Registration failed:', result.error);
        Alert.alert('Registration Failed', result.error);
      }
    } else {
      const result = await signIn(formData.email, formData.password);
      if (result.success) {
        // Navigation will be handled by auth state change
      } else {
        Alert.alert('Error', result.error);
      }
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else if (navigation) {
      navigation.navigate('Home');
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
            <Text style={styles.appName}>iPaddyCare</Text>
            <Text style={styles.welcomeText}>{t.welcomeBack}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
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
                        // Reduce font size for Sinhala and Tamil on Android
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
                <Text style={styles.resetText}>{t.enterEmail}</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t.email}</Text>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    value={formData.email}
                    onChangeText={(text) =>
                      setFormData({ ...formData, email: text })
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>{t.sendResetLink}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsResetPassword(false);
                    setErrors({});
                  }}
                  style={styles.linkButton}
                >
                  <Text style={styles.linkText}>{t.backToLogin}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {isSignUp && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t.name}</Text>
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
                    {errors.name && (
                      <Text style={styles.errorText}>{errors.name}</Text>
                    )}
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t.email}</Text>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    value={formData.email}
                    onChangeText={(text) => {
                      setFormData({ ...formData, email: text });
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t.password}</Text>
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    value={formData.password}
                    onChangeText={(text) => {
                      setFormData({ ...formData, password: text });
                      if (errors.password)
                        setErrors({ ...errors, password: null });
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                {isSignUp && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t.confirmPassword}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.confirmPassword && styles.inputError,
                      ]}
                      placeholder="Confirm your password"
                      placeholderTextColor="#999"
                      value={formData.confirmPassword}
                      onChangeText={(text) => {
                        setFormData({ ...formData, confirmPassword: text });
                        if (errors.confirmPassword)
                          setErrors({ ...errors, confirmPassword: null });
                      }}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                    {errors.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </View>
                )}

                {!isSignUp && (
                  <TouchableOpacity
                    onPress={() => setIsResetPassword(true)}
                    style={styles.forgotPasswordButton}
                  >
                    <Text style={styles.forgotPasswordText}>
                      {t.forgotPassword}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isSignUp ? t.createAccount : t.login}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.switchContainer}>
                  <Text style={styles.switchText}>
                    {isSignUp ? t.alreadyHaveAccount : t.dontHaveAccount}{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsSignUp(!isSignUp);
                      setErrors({});
                      setFormData({
                        email: '',
                        password: '',
                        name: '',
                        confirmPassword: '',
                      });
                    }}
                  >
                    <Text style={styles.switchLink}>
                      {isSignUp ? t.login : t.signUp}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* OAuth Buttons */}
                <View style={styles.oauthContainer}>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>{t.orContinueWith}</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity
                    style={[styles.oauthButton, styles.googleButton]}
                    onPress={async () => {
                      const result = await signInWithGoogle();
                      if (!result.success && !result.cancelled) {
                        Alert.alert('Error', result.error);
                      }
                    }}
                    disabled={loading}
                  >
                    <Image 
                      source={require('../assets/images/google.png')} 
                      style={styles.googleIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.oauthButtonText}>{t.continueWithGoogle}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>

          {/* Officer Login Link */}
          <Animated.View
            style={[
              styles.officerLoginContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.officerLoginDivider} />
            <Text style={styles.officerLoginText}>{t.officerLoginDesc}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('OfficerLogin')}
              style={styles.officerLoginButton}
            >
              <Text style={styles.officerLoginButtonText}>{t.officerLogin}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Skip Button */}
          <Animated.View
            style={[
              styles.skipContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>{t.skip}</Text>
            </TouchableOpacity>
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
    backgroundColor: '#FAFBFC',
  },
  safeAreaTop: {
    backgroundColor: '#0F5132',
  },
  statusBarContainer: {
    height: 0,
  },
  safeAreaContent: {
    flex: 1,
    backgroundColor: '#FAFBFC',
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
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 30,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '45deg' }],
  },
  headerPattern2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  languageChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 4,
  },
  languageChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  languageChipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  languageChipTextActive: {
    color: '#0F5132',
  },
  languageChipTextNonLatin: {
    fontSize: 11,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  formContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputError: {
    borderColor: '#E91E63',
    borderWidth: 2,
  },
  errorText: {
    color: '#E91E63',
    fontSize: 12,
    marginTop: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#0F5132',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#0F5132',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  switchText: {
    fontSize: 14,
    color: '#666',
  },
  switchLink: {
    fontSize: 14,
    color: '#0F5132',
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#0F5132',
    fontSize: 14,
    fontWeight: '600',
  },
  resetText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  skipContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  oauthContainer: {
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
  },
  oauthButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  officerLoginContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  officerLoginDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  officerLoginText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  officerLoginButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0F5132',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  officerLoginButtonText: {
    color: '#0F5132',
    fontSize: 16,
    fontWeight: '700',
  },
});

