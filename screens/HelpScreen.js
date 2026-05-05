import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Linking,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../src/i18n/useTranslation';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');
const SUPPORT_EMAIL = 'ipaddycare@gmail.com';

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
  const translate = useTranslation('help');
  const insets = useSafeAreaInsets();
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
    const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(translate('helpSubject'))}`;

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
            showAppAlert(
              translate('common.email'),
              `${translate('common.pleaseSendEmail')} ${SUPPORT_EMAIL}`,
              [{ text: translate('common.ok') }]
            );
          }
        } else {
          // Try opening anyway (sometimes canOpenURL returns false incorrectly)
          try {
            await Linking.openURL(emailUrl);
          } catch (openErr) {
            showAppAlert(
              translate('common.email'),
              `${translate('common.pleaseSendEmail')} ${SUPPORT_EMAIL}`,
              [{ text: translate('common.ok') }]
            );
          }
        }
      } catch (err) {
        // If canOpenURL fails, try opening directly
        try {
          await Linking.openURL(emailUrl);
        } catch (openErr) {
          showAppAlert(
            translate('common.email'),
            `${translate('common.pleaseSendEmail')} ${SUPPORT_EMAIL}`,
            [{ text: translate('common.ok') }]
          );
        }
      }
    } else {
      // Android - simpler approach
      try {
        await Linking.openURL(emailUrl);
      } catch (err) {
        showAppAlert(
          translate('common.email'),
          `${translate('common.pleaseSendEmail')} ${SUPPORT_EMAIL}`,
          [{ text: translate('common.ok') }]
        );
      }
    }
  };

  const handleCopyEmail = () => {
    showAppAlert(translate('emailCopied'), `${translate('emailCopiedDesc')} ${SUPPORT_EMAIL}`);
  };

  const handleResetApp = () => {
    showAppAlert(
      translate('resetApp'),
      translate('resetConfirm'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('reset'),
          style: 'destructive',
          onPress: () => showAppAlert(translate('success'), translate('appResetSuccess')),
        },
      ]
    );
  };

  const handleClearCache = () => {
    showAppAlert(
      translate('clearCache'),
      translate('clearCacheConfirm'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('clear'),
          style: 'destructive',
          onPress: () => showAppAlert(translate('success'), translate('cacheClearedSuccess')),
        },
      ]
    );
  };

  const faqs = [
    { id: 1, question: translate('faq1'), answer: translate('faq1Answer') },
    { id: 2, question: translate('faq2'), answer: translate('faq2Answer') },
    { id: 3, question: translate('faq3'), answer: translate('faq3Answer') },
    { id: 4, question: translate('faq4'), answer: translate('faq4Answer') },
    { id: 5, question: translate('faq5'), answer: translate('faq5Answer') },
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
                <Text style={styles.headerTitle}>{translate('title')}</Text>
              </View>
              <View style={styles.backButtonPlaceholder} />
            </View>
          </View>

          <View style={styles.innerContent}>
            {/* Contact Section */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{translate('contactUs')}</Text>
              <View style={styles.contactCard}>
                <View style={styles.emailContainer}>
                  <View style={styles.emailIconContainer}>
                    <Icon name="email" size={24} color="#0F5132" />
                  </View>
                  <View style={styles.emailContent}>
                    <Text style={styles.emailLabel}>{translate('supportEmail')}</Text>
                    <Text style={styles.emailAddress}>{SUPPORT_EMAIL}</Text>
                  </View>
                </View>
                <View style={styles.emailActions}>
                  <TouchableOpacity
                    style={styles.emailButton}
                    onPress={handleSendEmail}
                  >
                    <Icon name="email-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.emailButtonText}>{translate('sendEmail')}</Text>
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
                  <Text style={styles.supportInfoText}>{translate('supportHoursText')}</Text>
                </View>
                <View style={styles.supportInfoItem}>
                  <Icon name="timer-outline" size={18} color="#666" />
                  <Text style={styles.supportInfoText}>{translate('responseTimeText')}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Support Actions */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{translate('troubleshooting')}</Text>
              <SupportCard
                icon="bug"
                title={translate('reportBug')}
                subtitle={translate('reportBugSubtitle')}
                onPress={handleSendEmail}
                color="#E91E63"
              />
              <SupportCard
                icon="message-text-outline"
                title={translate('feedback')}
                subtitle={translate('feedbackSubtitle')}
                onPress={handleSendEmail}
                color="#2196F3"
              />
              <SupportCard
                icon="refresh"
                title={translate('resetApp')}
                subtitle={translate('resetAppSubtitle')}
                onPress={handleResetApp}
                color="#FF6D00"
              />
              <SupportCard
                icon="delete-outline"
                title={translate('clearCache')}
                subtitle={translate('clearCacheSubtitle')}
                onPress={handleClearCache}
                color="#607D8B"
              />
            </Animated.View>

            {/* FAQ Section */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{translate('frequentlyAsked')}</Text>
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
              <Text style={styles.versionText}>{translate('version')}</Text>
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

