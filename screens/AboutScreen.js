import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Animated,
  Linking,
  Image,
  Platform,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../src/i18n/useTranslation';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');
const APP_VERSION = '1.0.0';
const SUPPORT_EMAIL = 'ipaddycare@gmail.com';
const WEBSITE_URL = 'https://ipaddycare.vercel.app/';

const InfoCard = ({ icon, title, subtitle, onPress, color = '#0F5132' }) => {
  return (
    <TouchableOpacity
      style={[styles.infoCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.infoIconContainer, { backgroundColor: `${color}15` }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        {subtitle && <Text style={styles.infoSubtitle}>{subtitle}</Text>}
      </View>
      {onPress && <Icon name="chevron-right" size={24} color="#999" />}
    </TouchableOpacity>
  );
};

export default function AboutScreen({ navigation }) {
  const translate = useTranslation('about');
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSendEmail = async () => {
    const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(translate('aboutSubject'))}`;

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

  const handleOpenWebsite = () => {
    Linking.openURL(WEBSITE_URL).catch((err) => {
      showAppAlert(translate('common.error'), translate('unableToOpenWebsite'));
    });
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
                <Text style={styles.headerTitle}>{translate('title')}</Text>
              </View>
              <View style={styles.backButtonPlaceholder} />
            </View>
          </View>

          <View style={styles.innerContent}>
            {/* App Info Section */}
            <Animated.View style={[styles.section, { opacity: fadeAnim, marginTop: 20 }]}>
              <View style={styles.appInfoCard}>
                <View style={styles.appLogoContainer}>
                  <Image
                    source={require('../assets/images/app-logo.png')}
                    style={styles.appLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.appName}>{translate('appName')}</Text>
                <Text style={styles.appTagline}>{translate('tagline')}</Text>
                <View style={styles.versionBadge}>
                  <Text style={styles.versionText}>{translate('version')} {APP_VERSION}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Description */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.descriptionText}>{translate('description')}</Text>
            </Animated.View>

            {/* Features Section */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{translate('features')}</Text>
              <View style={styles.featuresGrid}>
                <View style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: '#E8F5E8' }]}>
                    <Text style={styles.featureEmoji}>🌾</Text>
                  </View>
                  <Text style={styles.featureTitle}>{translate('feature1')}</Text>
                  <Text style={styles.featureDesc}>{translate('feature1Desc')}</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: '#E3F2FD' }]}>
                    <Text style={styles.featureEmoji}>💧</Text>
                  </View>
                  <Text style={styles.featureTitle}>{translate('feature2')}</Text>
                  <Text style={styles.featureDesc}>{translate('feature2Desc')}</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: '#FFF3E0' }]}>
                    <Text style={styles.featureEmoji}>🧪</Text>
                  </View>
                  <Text style={styles.featureTitle}>{translate('feature3')}</Text>
                  <Text style={styles.featureDesc}>{translate('feature3Desc')}</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: '#FCE4EC' }]}>
                    <Text style={styles.featureEmoji}>🐛</Text>
                  </View>
                  <Text style={styles.featureTitle}>{translate('feature4')}</Text>
                  <Text style={styles.featureDesc}>{translate('feature4Desc')}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Technology Section */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{translate('technology')}</Text>
              <InfoCard
                icon="code-tags"
                title={translate('builtWith')}
                subtitle={translate('crossPlatformDesc')}
                color="#2196F3"
              />
              <InfoCard
                icon="brain"
                title={translate('aiPowered')}
                subtitle={translate('mlAiDesc')}
                color="#9C27B0"
              />
              <InfoCard
                icon="chip"
                title={translate('iotIntegration')}
                subtitle={translate('esp32Desc')}
                color="#FF6D00"
              />
            </Animated.View>

            {/* Contact Section */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{translate('contact')}</Text>
              <InfoCard
                icon="email"
                title={translate('supportEmail')}
                subtitle={SUPPORT_EMAIL}
                onPress={handleSendEmail}
                color="#0F5132"
              />
              <InfoCard
                icon="web"
                title={translate('website')}
                subtitle={translate('websiteUrl')}
                onPress={handleOpenWebsite}
                color="#607D8B"
              />
            </Animated.View>

            {/* Legal Section */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <InfoCard
                icon="shield-check"
                title={translate('privacyPolicy')}
                subtitle={translate('privacyPolicyDesc')}
                color="#4CAF50"
              />
              <InfoCard
                icon="file-document"
                title={translate('termsOfService')}
                subtitle={translate('termsDesc')}
                color="#FF9800"
              />
            </Animated.View>

            {/* Acknowledgments */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{translate('acknowledgments')}</Text>
              <View style={styles.acknowledgmentCard}>
                <Text style={styles.acknowledgmentText}>{translate('acknowledgmentsText')}</Text>
              </View>
            </Animated.View>

            {/* Copyright */}
            <Animated.View style={[styles.copyrightContainer, { opacity: fadeAnim }]}>
              <Text style={styles.copyrightText}>{translate('copyrightText')}</Text>
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
  descriptionText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#555',
    lineHeight: 24,
    textAlign: 'justify',
    marginLeft: 7,
    marginRight: 7,
  },
  appInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginTop: -32,
    marginHorizontal: 4,
    elevation: 12,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.08)',
    marginBottom: 24,
  },
  appLogoContainer: {
    marginBottom: 20,
  },
  appLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#E8F5E8',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  versionBadge: {
    backgroundColor: '#F0F7F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0F5132',
  },
  versionText: {
    fontSize: 13,
    color: '#0F5132',
    fontWeight: '700',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureEmoji: {
    fontSize: 32,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  infoCard: {
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
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '400',
  },
  acknowledgmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  acknowledgmentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    fontWeight: '400',
    textAlign: 'center',
  },
  copyrightContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    textAlign: 'center',
  },
});

