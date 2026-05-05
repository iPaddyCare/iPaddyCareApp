import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Switch,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/AuthContext';
import { useLanguage } from '../src/context/LanguageContext';
import { useTranslation } from '../src/i18n/useTranslation';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const SettingItem = ({ icon, label, value, onPress, rightComponent, showArrow = true }) => {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconContainer}>
          <Icon name={icon} size={22} color="#0F5132" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingLabel}>{label}</Text>
          {value && <Text style={styles.settingValue}>{value}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && !rightComponent && (
          <Icon name="chevron-right" size={24} color="#999" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const SettingSection = ({ title, children }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

export default function SettingsScreen({ navigation }) {
  const { selectedLanguage, changeLanguage } = useLanguage();
  const translate = useTranslation('settings');
  const { user, isAuthenticated, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoConnectEnabled, setAutoConnectEnabled] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  const [moistureUnit, setMoistureUnit] = useState('percentage');
  const [theme, setTheme] = useState('system');

  const languages = ['English', 'සිංහල', 'தமிழ்'];

  const handleLanguageChange = () => {
    const currentIndex = languages.indexOf(selectedLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    changeLanguage(languages[nextIndex]);
  };

  const handleLogout = () => {
    showAppAlert(translate('logout'), translate('logoutConfirm'), [
      {
        text: translate('common.no'),
        style: 'cancel',
      },
      {
        text: translate('common.yes'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.navigate('Home');
        },
      },
    ]);
  };

  const handleClearCache = () => {
    showAppAlert(translate('clearCache'), translate('clearCacheConfirm'), [
      {
        text: translate('common.no'),
        style: 'cancel',
      },
      {
        text: translate('common.yes'),
        onPress: () => {
          // TODO: Implement cache clearing
          showAppAlert(translate('success'), translate('cacheCleared'));
        },
      },
    ]);
  };

  const handleExportData = () => {
    // TODO: Implement data export
    showAppAlert(translate('exportDataTitle'), translate('exportDataMsg'));
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
            {/* Profile Header Section */}
            {isAuthenticated && user && (
              <View style={styles.profileHeader}>
                <View style={styles.profileAvatarContainer}>
                  {user.photoURL ? (
                    <Image
                      source={{ uri: user.photoURL }}
                      style={styles.profileAvatar}
                    />
                  ) : (
                    <View style={styles.profileAvatarFallback}>
                      <Text style={styles.profileAvatarText}>
                        {user.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : user.email.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.profileName}>
                  {user.displayName || 'User'}
                </Text>
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
            )}

            {/* Account Section */}
            {isAuthenticated && (
              <SettingSection title={translate('account')}>
                <SettingItem
                  icon="account"
                  label={translate('profile')}
                  value={user?.displayName || user?.email}
                  onPress={() => showAppAlert(translate('profileTitle'), translate('profileMsg'))}
                />
                <SettingItem
                  icon="package-variant"
                  label={translate('common.myListings')}
                  onPress={() => navigation.navigate('MyListings')}
                />
                <SettingItem
                  icon="email"
                  label={translate('common.email')}
                  value={user?.email}
                  onPress={() => showAppAlert(translate('common.email'), translate('emailMsg'))}
                />
                <SettingItem
                  icon="lock"
                  label={translate('common.password')}
                  onPress={() => showAppAlert(translate('common.password'), translate('passwordMsg'))}
                />
              </SettingSection>
            )}

            {/* Preferences Section */}
            <SettingSection title={translate('preferences')}>
              <SettingItem
                icon="translate"
                label={translate('language')}
                value={selectedLanguage}
                onPress={handleLanguageChange}
              />
              <SettingItem
                icon="bell"
                label={translate('notifications')}
                rightComponent={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                    thumbColor="#FFFFFF"
                  />
                }
                showArrow={false}
              />
              <SettingItem
                icon="palette"
                label={translate('theme')}
                value={theme === 'system' ? translate('system') : theme === 'light' ? translate('light') : translate('dark')}
                onPress={() => {
                  const themes = ['system', 'light', 'dark'];
                  const currentIndex = themes.indexOf(theme);
                  const nextIndex = (currentIndex + 1) % themes.length;
                  setTheme(themes[nextIndex]);
                }}
              />
            </SettingSection>

            {/* Device Section */}
            <SettingSection title={translate('device')}>
              <SettingItem
                icon="bluetooth-connect"
                label={translate('autoConnect')}
                rightComponent={
                  <Switch
                    value={autoConnectEnabled}
                    onValueChange={setAutoConnectEnabled}
                    trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                    thumbColor="#FFFFFF"
                  />
                }
                showArrow={false}
              />
              <SettingItem
                icon="timer"
                label={translate('connectionTimeout')}
                value="30 seconds"
                onPress={() => showAppAlert(translate('timeoutTitle'), translate('timeoutMsg'))}
              />
            </SettingSection>

            {/* Measurement Units Section */}
            <SettingSection title={translate('measurement')}>
              <SettingItem
                icon="thermometer"
                label={translate('temperature')}
                value={temperatureUnit === 'celsius' ? translate('celsius') : translate('fahrenheit')}
                onPress={() => {
                  setTemperatureUnit(temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius');
                }}
              />
              <SettingItem
                icon="water"
                label={translate('moisture')}
                value={moistureUnit === 'percentage' ? translate('percentage') : translate('decimal')}
                onPress={() => {
                  setMoistureUnit(moistureUnit === 'percentage' ? 'decimal' : 'percentage');
                }}
              />
            </SettingSection>

            {/* Data & Storage Section */}
            <SettingSection title={translate('data')}>
              <SettingItem
                icon="delete"
                label={translate('clearCache')}
                onPress={handleClearCache}
              />
              <SettingItem
                icon="download"
                label={translate('exportData')}
                onPress={handleExportData}
              />
            </SettingSection>

            {/* About Section */}
            <SettingSection title={translate('about')}>
              <SettingItem
                icon="information"
                label={translate('version')}
                value="1.0.0"
                onPress={() => {}}
              />
              <SettingItem
                icon="file-document"
                label={translate('terms')}
                onPress={() => showAppAlert(translate('termsTitle'), translate('termsMsg'))}
              />
              <SettingItem
                icon="shield-lock"
                label={translate('privacy')}
                onPress={() => showAppAlert(translate('privacyTitle'), translate('privacyMsg'))}
              />
              <SettingItem
                icon="help-circle"
                label={translate('help')}
                onPress={() => navigation.navigate('Help')}
              />
            </SettingSection>

            {/* Logout Button */}
            {isAuthenticated && (
              <View style={styles.logoutSection}>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <Icon name="logout" size={22} color="#E91E63" />
                  <Text style={styles.logoutText}>{translate('logout')}</Text>
                </TouchableOpacity>
              </View>
            )}
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
  },
  backButtonPlaceholder: {
    width: 48,
    height: 48,
    position: 'absolute',
    right: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  innerContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  profileHeader: {
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
  profileAvatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#0F5132',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  profileAvatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F5132',
  },
  profileAvatarText: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 15,
    color: '#666',
    fontWeight: '400',
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
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  settingValue: {
    fontSize: 13.5,
    color: '#666',
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F7',
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFE5EA',
    elevation: 2,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#E91E63',
    marginLeft: 10,
    letterSpacing: 0.2,
  },
});

