import React, { useState, useEffect } from 'react';
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
import { getPendingProducts } from '../services/marketplaceService';
import { useTranslation } from '../i18n/useTranslation';

export default function DrawerContent({
  navigation: drawerNavigation,
  selectedLanguage = 'English',
}) {
  const translate = useTranslation('drawer');
  const { user, isAuthenticated, isOfficer, signOut } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isOfficer) return;
    getPendingProducts()
      .then((products) => setPendingCount(products.length))
      .catch(() => setPendingCount(0));
  }, [isOfficer]);

  const getRootNavigation = () => {
    let parentNav = drawerNavigation;
    while (parentNav && parentNav.getParent()) {
      parentNav = parentNav.getParent();
    }
    return parentNav;
  };

  const handleLogout = () => {
    Alert.alert(translate('logout'), translate('logoutConfirm'), [
      {
        text: translate('common.no'),
        style: 'cancel',
      },
      {
        text: translate('common.yes'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          drawerNavigation.closeDrawer?.();
        },
      },
    ]);
  };

  const handleLogin = () => {
    drawerNavigation.closeDrawer?.();
    const rootNavigation = getRootNavigation();
    rootNavigation?.navigate('Login');
  };

  const handleNavigateToStack = (route) => {
    if (!route) return;
    drawerNavigation.navigate('Main', {
      screen: route,
    });
  };

  const menuItems = [
    { id: 'home', label: translate('home'), icon: '🏠', route: 'Home' },
    ...(isOfficer ? [
      { id: 'inbox', label: translate('common.inbox') || 'Inbox', icon: '📬', route: 'OfficerInbox' },
      { id: 'approvals', label: translate('approvals') || 'Approvals', icon: '✅', route: 'ProductApproval' },
    ] : []),
    { id: 'marketplace', label: translate('marketplace'), icon: '🛒', route: 'Marketplace' },
    ...(!isOfficer ? [{ id: 'myListings', label: translate('common.myListings'), icon: '📦', route: 'MyListings', requireAuth: true }] : []),
    { id: 'history', label: translate('testHistory'), icon: '📊', route: 'History' },
    { id: 'settings', label: translate('settings'), icon: '⚙️', route: 'Settings' },
    { id: 'help', label: translate('help'), icon: '❓', route: 'Help' },
    { id: 'about', label: translate('about'), icon: 'ℹ️', route: 'About' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.accountSection}>
          <View style={styles.accountHeader}>
            <View style={styles.avatarContainer}>
              {isAuthenticated && user && user.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  style={styles.avatarImage}
                />
              ) : isAuthenticated && user ? (
                <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {user.displayName
                    ? user.displayName.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </Text>
                </View>
              ) : (
                <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>👤</Text>
                </View>
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
                  ]}>{translate('notLoggedIn')}</Text>
                  <TouchableOpacity onPress={handleLogin}>
                    <Text style={[
                      styles.loginLink,
                      (selectedLanguage === 'සිංහල' || selectedLanguage === 'தமிழ்') && styles.textNonLatin
                    ]}>{translate('login')}</Text>
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
              ]}>{translate('account')}</Text>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems
            .filter((item) => !item.requireAuth || isAuthenticated)
            .map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => {
                  drawerNavigation.closeDrawer?.();
                  if (item.requireAuth && !isAuthenticated) {
                    handleLogin();
                  } else {
                    handleNavigateToStack(item.route);
                  }
                }}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[
                  styles.menuLabel,
                  (selectedLanguage === 'සිංහල' || selectedLanguage === 'தமிழ்') && styles.textNonLatin
                ]}>{item.label}</Text>
                {item.id === 'approvals' && isOfficer && pendingCount > 0 && (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{pendingCount}</Text>
                  </View>
                )}
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
            ]}>{translate('logout')}</Text>
          </TouchableOpacity>
        )}
        <Text style={[
          styles.versionText,
          (selectedLanguage === 'සිංහල' || selectedLanguage === 'தமிழ்') && styles.textNonLatinSmall
        ]}>{translate('version')}</Text>
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
    paddingTop: 100,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.35)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 5,
    letterSpacing: -0.3,
  },
  accountEmail: {
    fontSize: 14.5,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '400',
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
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 22,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  menuIcon: {
    fontSize: 26,
    marginRight: 18,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16.5,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  menuArrow: {
    fontSize: 20,
    color: '#999',
    fontWeight: '600',
  },
  menuBadge: {
    backgroundColor: '#E91E63',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F7',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#FFE5EA',
    elevation: 2,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#E91E63',
    letterSpacing: 0.2,
  },
  versionText: {
    fontSize: 12.5,
    color: '#888',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
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

