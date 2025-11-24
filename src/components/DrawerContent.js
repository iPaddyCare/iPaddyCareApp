import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const translations = {
  English: {
    account: 'Account',
    notLoggedIn: 'Not logged in',
    login: 'Login',
    logout: 'Logout',
    home: 'Home',
    settings: 'Settings',
    testHistory: 'Test History',
    help: 'Help & Support',
    about: 'About',
    version: 'Version 1.0.0',
    logoutConfirm: 'Are you sure you want to logout?',
    yes: 'Yes',
    no: 'No',
  },
  සිංහල: {
    account: 'ගිණුම',
    notLoggedIn: 'පිවිසී නොමැත',
    login: 'පිවිසෙන්න',
    logout: 'ඉවත් වන්න',
    home: 'මුල් පිටුව',
    settings: 'සැකසුම්',
    testHistory: 'පරීක්ෂණ ඉතිහාසය',
    help: 'උදව් සහ සහාය',
    about: 'මෙහි ගැන',
    version: 'අනුවාදය 1.0.0',
    logoutConfirm: 'ඔබට ඉවත් වීමට අවශ්‍යද?',
    yes: 'ඔව්',
    no: 'නැත',
  },
  தமிழ்: {
    account: 'கணக்கு',
    notLoggedIn: 'உள்நுழையவில்லை',
    login: 'உள்நுழைக',
    logout: 'வெளியேற',
    home: 'முகப்பு',
    settings: 'அமைப்புகள்',
    testHistory: 'சோதனை வரலாறு',
    help: 'உதவி மற்றும் ஆதரவு',
    about: 'பற்றி',
    version: 'பதிப்பு 1.0.0',
    logoutConfirm: 'நீங்கள் வெளியேற விரும்புகிறீர்களா?',
    yes: 'ஆம்',
    no: 'இல்லை',
  },
};

export default function DrawerContent({ selectedLanguage = 'English' }) {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigation = useNavigation();
  const t = translations[selectedLanguage];

  const handleLogout = () => {
    Alert.alert(t.logout, t.logoutConfirm, [
      {
        text: t.no,
        style: 'cancel',
      },
      {
        text: t.yes,
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.closeDrawer();
        },
      },
    ]);
  };

  const handleLogin = () => {
    navigation.closeDrawer();
    // Navigate to root stack Login screen
    navigation.getParent()?.getParent()?.navigate('Login');
  };

  const menuItems = [
    { id: 'home', label: t.home, icon: '🏠', route: 'Home' },
    { id: 'history', label: t.testHistory, icon: '📊', route: 'History' },
    { id: 'settings', label: t.settings, icon: '⚙️', route: 'Settings' },
    { id: 'help', label: t.help, icon: '❓', route: 'Help' },
    { id: 'about', label: t.about, icon: 'ℹ️', route: 'About' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.accountSection}>
          <View style={styles.accountHeader}>
            <View style={styles.avatarContainer}>
              {isAuthenticated && user ? (
                <Text style={styles.avatarText}>
                  {user.displayName
                    ? user.displayName.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </Text>
              ) : (
                <Text style={styles.avatarText}>👤</Text>
              )}
            </View>
            <View style={styles.accountInfo}>
              {isAuthenticated && user ? (
                <>
                  <Text style={[
                    styles.accountName,
                    (selectedLanguage === 'සිංහල' || selectedLanguage === 'தமிழ்') && styles.textNonLatin
                  ]}>
                    {user.displayName || 'User'}
                  </Text>
                  <Text style={styles.accountEmail} numberOfLines={1}>
                    {user.email}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[
                    styles.accountName,
                    (selectedLanguage === 'සිංහල' || selectedLanguage === 'தமிழ்') && styles.textNonLatin
                  ]}>{t.notLoggedIn}</Text>
                  <TouchableOpacity onPress={handleLogin}>
                    <Text style={[
                      styles.loginLink,
                      (selectedLanguage === 'සිංහල' || selectedLanguage === 'தமிழ்') && styles.textNonLatin
                    ]}>{t.login}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          {isAuthenticated && (
            <View style={styles.accountBadge}>
              <View style={styles.badgeDot} />
              <Text style={[
                styles.badgeText,
                (selectedLanguage === 'සිංහල' || selectedLanguage === 'தமிழ்') && styles.textNonLatinSmall
              ]}>{t.account}</Text>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                navigation.closeDrawer();
                if (item.route) {
                  navigation.navigate(item.route);
                }
              }}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[
                styles.menuLabel,
                (selectedLanguage === 'සිංහල' || selectedLanguage === 'தமிழ்') && styles.textNonLatin
              ]}>{item.label}</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            
            <Text style={[
              styles.logoutText,
              (selectedLanguage === 'සිංහල' || selectedLanguage === 'தமிழ்') && styles.textNonLatin
            ]}>{t.logout}</Text>
          </TouchableOpacity>
        )}
        <Text style={[
          styles.versionText,
          (selectedLanguage === 'සිංහල' || selectedLanguage === 'தமிழ்') && styles.textNonLatinSmall
        ]}>{t.version}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  accountSection: {
    backgroundColor: '#0F5132',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  loginLink: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuArrow: {
    fontSize: 18,
    color: '#999',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E91E63',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  textNonLatin: {
    fontSize: 14,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  textNonLatinSmall: {
    fontSize: 11,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

