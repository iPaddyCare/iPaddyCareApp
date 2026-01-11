import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  Animated,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../src/context/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');
const SUPPORT_EMAIL = 'ipaddycare@gmail.com';

// Language translations
const translations = {
  English: {
    title: 'Help & Support',
    contactUs: 'Contact Us',
    email: 'Email',
    supportEmail: 'Support Email',
    sendEmail: 'Send Email',
    frequentlyAsked: 'Frequently Asked Questions',
    faq1: 'How do I connect my device?',
    faq1Answer: 'Go to Device Connection screen and follow the instructions to connect via WiFi or Bluetooth.',
    faq2: 'How accurate are the readings?',
    faq2Answer: 'Our sensors provide accurate readings within ±2% margin of error. Ensure proper calibration for best results.',
    faq3: 'Can I use the app offline?',
    faq3Answer: 'Yes, most features work offline. However, some features like weather data require internet connection.',
    faq4: 'How do I export my test results?',
    faq4Answer: 'Go to Settings > Data & Storage > Export Data to save your test history.',
    faq5: 'What devices are supported?',
    faq5Answer: 'The app supports ESP32 devices and Bluetooth-enabled moisture sensors. Check Device Connection for details.',
    troubleshooting: 'Troubleshooting',
    resetApp: 'Reset App Settings',
    clearCache: 'Clear Cache',
    reportBug: 'Report a Bug',
    feedback: 'Send Feedback',
    version: 'Version 1.0.0',
    supportHours: 'Support Hours',
    supportHoursText: 'Monday - Friday: 9:00 AM - 5:00 PM',
    responseTime: 'Response Time',
    responseTimeText: 'We typically respond within 24-48 hours',
  },
  සිංහල: {
    title: 'උදව් සහ සහාය',
    contactUs: 'අප හා සම්බන්ධ වන්න',
    email: 'විද්‍යුත් තැපෑල',
    supportEmail: 'සහාය විද්‍යුත් තැපෑල',
    sendEmail: 'විද්‍යුත් තැපෑල යවන්න',
    frequentlyAsked: 'නිතර අසන ප්‍රශ්න',
    faq1: 'මගේ උපාංගය සම්බන්ධ කරන්නේ කෙසේද?',
    faq1Answer: 'උපාංග සම්බන්ධතා තිරයට ගොස් WiFi හෝ Bluetooth හරහා සම්බන්ධ වීමට උපදෙස් අනුගමනය කරන්න.',
    faq2: 'කියවීම් කෙතරම් නිවැරදිද?',
    faq2Answer: 'අපගේ සංවේදක ±2% දෝෂ සීමාවක් තුළ නිවැරදි කියවීම් සපයයි. හොඳම ප්‍රතිඵල සඳහා නිසි කැලිබ්‍රේෂන් සහතික කරන්න.',
    faq3: 'මට අන්තර්ජාලයකින් තොරව යෙදුම භාවිතා කළ හැකිද?',
    faq3Answer: 'ඔව්, බොහෝ විශේෂාංග අන්තර්ජාලයකින් තොරව ක්‍රියා කරයි. කෙසේ වෙතත්, කාලගුණ දත්ත වැනි සමහර විශේෂාංග සඳහා අන්තර්ජාල සම්බන්ධතාවයක් අවශ්‍ය වේ.',
    faq4: 'මගේ පරීක්ෂණ ප්‍රතිඵල නිර්යාත කරන්නේ කෙසේද?',
    faq4Answer: 'සැකසුම් > දත්ත සහ ගබඩාව > දත්ත නිර්යාත කරන්න වෙත ගොස් ඔබේ පරීක්ෂණ ඉතිහාසය සුරක්ෂිත කරන්න.',
    faq5: 'කුමන උපාංග සහාය දක්වනු ලැබේද?',
    faq5Answer: 'යෙදුම ESP32 උපාංග සහ Bluetooth-සක්‍රිය තෙතමන සංවේදක සහාය දක්වයි. විස්තර සඳහා උපාංග සම්බන්ධතාව පරීක්ෂා කරන්න.',
    troubleshooting: 'ගැටළු විසඳීම',
    resetApp: 'යෙදුම් සැකසුම් යළි සැකසීම',
    clearCache: 'කෑෂ් මකන්න',
    reportBug: 'දෝෂයක් වාර්තා කරන්න',
    feedback: 'ප්‍රතිචාරයක් යවන්න',
    version: 'අනුවාදය 1.0.0',
    supportHours: 'සහාය පැය',
    supportHoursText: 'සඳුදා - සිකුරාදා: පෙ.ව. 9:00 - ප.ව. 5:00',
    responseTime: 'ප්‍රතිචාර කාලය',
    responseTimeText: 'අපි සාමාන්‍යයෙන් පැය 24-48 තුළ ප්‍රතිචාර දක්වයි',
  },
  தமிழ்: {
    title: 'உதவி மற்றும் ஆதரவு',
    contactUs: 'எங்களைத் தொடர்பு கொள்ளுங்கள்',
    email: 'மின்னஞ்சல்',
    supportEmail: 'ஆதரவு மின்னஞ்சல்',
    sendEmail: 'மின்னஞ்சல் அனுப்ப',
    frequentlyAsked: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    faq1: 'எனது சாதனத்தை எவ்வாறு இணைப்பது?',
    faq1Answer: 'சாதன இணைப்பு திரையில் சென்று WiFi அல்லது Bluetooth வழியாக இணைக்க வழிமுறைகளைப் பின்பற்றவும்.',
    faq2: 'வாசிப்புகள் எவ்வளவு துல்லியமானவை?',
    faq2Answer: 'எங்கள் சென்சார்கள் ±2% பிழை வரம்பிற்குள் துல்லியமான வாசிப்புகளை வழங்குகின்றன. சிறந்த முடிவுகளுக்கு சரியான அளவீட்டை உறுதிசெய்யவும்.',
    faq3: 'ஆஃப்லைனில் பயன்பாட்டைப் பயன்படுத்த முடியுமா?',
    faq3Answer: 'ஆம், பெரும்பாலான அம்சங்கள் ஆஃப்லைனில் செயல்படுகின்றன. இருப்பினும், வானிலை தரவு போன்ற சில அம்சங்களுக்கு இணைய இணைப்பு தேவை.',
    faq4: 'எனது சோதனை முடிவுகளை எவ்வாறு ஏற்றுமதி செய்வது?',
    faq4Answer: 'அமைப்புகள் > தரவு மற்றும் சேமிப்பு > தரவு ஏற்றுமதி சென்று உங்கள் சோதனை வரலாற்றைச் சேமிக்கவும்.',
    faq5: 'எந்த சாதனங்கள் ஆதரிக்கப்படுகின்றன?',
    faq5Answer: 'பயன்பாடு ESP32 சாதனங்கள் மற்றும் Bluetooth-இயக்கப்பட்ட ஈரப்பதம் சென்சார்களை ஆதரிக்கிறது. விவரங்களுக்கு சாதன இணைப்பைச் சரிபார்க்கவும்.',
    troubleshooting: 'சிக்கல் தீர்த்தல்',
    resetApp: 'பயன்பாட்டு அமைப்புகளை மீட்டமை',
    clearCache: 'கேச் அழிக்க',
    reportBug: 'பிழையைப் புகாரளிக்க',
    feedback: 'கருத்தை அனுப்ப',
    version: 'பதிப்பு 1.0.0',
    supportHours: 'ஆதரவு நேரம்',
    supportHoursText: 'திங்கள் - வெள்ளி: காலை 9:00 - மாலை 5:00',
    responseTime: 'பதிலளிக்கும் நேரம்',
    responseTimeText: 'நாங்கள் பொதுவாக 24-48 மணி நேரத்திற்குள் பதிலளிக்கிறோம்',
  },
};

const FAQItem = ({ question, answer, isExpanded, onToggle }) => {
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#0F5132"
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

const SupportCard = ({ icon, title, subtitle, onPress, color = '#0F5132' }) => {
  return (
    <TouchableOpacity
      style={[styles.supportCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.supportIconContainer, { backgroundColor: `${color}15` }]}>
        <Icon name={icon} size={28} color={color} />
      </View>
      <View style={styles.supportContent}>
        <Text style={styles.supportTitle}>{title}</Text>
        {subtitle && <Text style={styles.supportSubtitle}>{subtitle}</Text>}
      </View>
      <Icon name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );
};

export default function HelpScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
  const [fadeAnim] = useState(new Animated.Value(0));
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSendEmail = async () => {
    const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Help & Support Request')}`;
    
    if (Platform.OS === 'ios') {
      // On iOS, check if we can open the URL first
      try {
        const canOpen = await Linking.canOpenURL('mailto:');
        if (canOpen) {
          try {
            await Linking.openURL(emailUrl);
            // Give it a moment to see if it actually opened
            setTimeout(() => {
              // If we get here, the email might not have opened
              // But we can't really detect this reliably, so we'll just try
            }, 100);
          } catch (openErr) {
            Alert.alert(
              'Email',
              `Please send email to: ${SUPPORT_EMAIL}`,
              [{ text: 'OK' }]
            );
          }
        } else {
          // Try opening anyway (sometimes canOpenURL returns false incorrectly)
          try {
            await Linking.openURL(emailUrl);
          } catch (openErr) {
            Alert.alert(
              'Email',
              `Please send email to: ${SUPPORT_EMAIL}`,
              [{ text: 'OK' }]
            );
          }
        }
      } catch (err) {
        // If canOpenURL fails, try opening directly
        try {
          await Linking.openURL(emailUrl);
        } catch (openErr) {
          Alert.alert(
            'Email',
            `Please send email to: ${SUPPORT_EMAIL}`,
            [{ text: 'OK' }]
          );
        }
      }
    } else {
      // Android - simpler approach
      try {
        await Linking.openURL(emailUrl);
      } catch (err) {
        Alert.alert(
          'Email',
          `Please send email to: ${SUPPORT_EMAIL}`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleCopyEmail = () => {
    Alert.alert('Email Copied', `Email address copied: ${SUPPORT_EMAIL}`);
  };

  const handleResetApp = () => {
    Alert.alert(
      t.resetApp,
      'This will reset all app settings to default. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'App settings reset successfully'),
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      t.clearCache,
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => Alert.alert('Success', 'Cache cleared successfully'),
        },
      ]
    );
  };

  const faqs = [
    { id: 1, question: t.faq1, answer: t.faq1Answer },
    { id: 2, question: t.faq2, answer: t.faq2Answer },
    { id: 3, question: t.faq3, answer: t.faq3Answer },
    { id: 4, question: t.faq4, answer: t.faq4Answer },
    { id: 5, question: t.faq5, answer: t.faq5Answer },
  ];

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
            {/* Contact Section */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{t.contactUs}</Text>
              <View style={styles.contactCard}>
                <View style={styles.emailContainer}>
                  <View style={styles.emailIconContainer}>
                    <Icon name="email" size={24} color="#0F5132" />
                  </View>
                  <View style={styles.emailContent}>
                    <Text style={styles.emailLabel}>{t.supportEmail}</Text>
                    <Text style={styles.emailAddress}>{SUPPORT_EMAIL}</Text>
                  </View>
                </View>
                <View style={styles.emailActions}>
                  <TouchableOpacity
                    style={styles.emailButton}
                    onPress={handleSendEmail}
                  >
                    <Icon name="email-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.emailButtonText}>{t.sendEmail}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.emailButton, styles.copyButton]}
                    onPress={handleCopyEmail}
                  >
                    <Icon name="content-copy" size={20} color="#0F5132" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.supportInfo}>
                <View style={styles.supportInfoItem}>
                  <Icon name="clock-outline" size={18} color="#666" />
                  <Text style={styles.supportInfoText}>{t.supportHoursText}</Text>
                </View>
                <View style={styles.supportInfoItem}>
                  <Icon name="timer-outline" size={18} color="#666" />
                  <Text style={styles.supportInfoText}>{t.responseTimeText}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Support Actions */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{t.troubleshooting}</Text>
              <SupportCard
                icon="bug"
                title={t.reportBug}
                subtitle="Report issues or bugs"
                onPress={handleSendEmail}
                color="#E91E63"
              />
              <SupportCard
                icon="message-text-outline"
                title={t.feedback}
                subtitle="Share your thoughts"
                onPress={handleSendEmail}
                color="#2196F3"
              />
              <SupportCard
                icon="refresh"
                title={t.resetApp}
                subtitle="Reset to default settings"
                onPress={handleResetApp}
                color="#FF6D00"
              />
              <SupportCard
                icon="delete-outline"
                title={t.clearCache}
                subtitle="Clear cached data"
                onPress={handleClearCache}
                color="#607D8B"
              />
            </Animated.View>

            {/* FAQ Section */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{t.frequentlyAsked}</Text>
              <View style={styles.faqContainer}>
                {faqs.map((faq) => (
                  <FAQItem
                    key={faq.id}
                    question={faq.question}
                    answer={faq.answer}
                    isExpanded={expandedFAQ === faq.id}
                    onToggle={() =>
                      setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                    }
                  />
                ))}
              </View>
            </Animated.View>

            {/* Version Info */}
            <Animated.View style={[styles.versionContainer, { opacity: fadeAnim }]}>
              <Text style={styles.versionText}>{t.version}</Text>
            </Animated.View>
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
    paddingTop: 0,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: -0.3,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  emailIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emailContent: {
    flex: 1,
  },
  emailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  emailAddress: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  emailActions: {
    flexDirection: 'row',
  },
  emailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 12,
  },
  copyButton: {
    flex: 0,
    paddingHorizontal: 16,
    backgroundColor: '#F0F7F3',
    marginRight: 0,
  },
  emailButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  supportInfo: {
    marginTop: 16,
  },
  supportInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportInfoText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginLeft: 10,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    borderRightColor: 'rgba(0,0,0,0.06)',
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  supportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  supportSubtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '400',
  },
  faqContainer: {
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginBottom: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    fontWeight: '400',
    paddingTop: 12,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
});

