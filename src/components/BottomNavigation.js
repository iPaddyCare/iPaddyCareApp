import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    home: 'Home',
    seedDetection: 'Seeds',
    moisture: 'Moisture',
    soilPH: 'Soil pH',
    pestDetection: 'Pest',
  },
  සිංහල: {
    home: 'මුල් පිටුව',
    seedDetection: 'බීජ',
    moisture: 'තෙතමනය',
    soilPH: 'පස් pH',
    pestDetection: 'පළිබෝධ',
  },
  தமிழ்: {
    home: 'முகப்பு',
    seedDetection: 'விதைகள்',
    moisture: 'ஈரப்பதம்',
    soilPH: 'மண் pH',
    pestDetection: 'பூச்சி',
  },
};

export default function BottomNavigation({ drawerNavigation }) {
  const navigation = useNavigation();
  const { selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
  
  // Use drawerNavigation if provided, otherwise try to get it from navigation context
  const drawerNav = drawerNavigation || navigation.getParent() || navigation;

  // Get current route name from navigation state
  const getCurrentRoute = () => {
    const state = navigation.getState();
    if (!state) return 'Home';
    
    // Navigate through nested navigators to find the active route
    let route = state.routes[state.index];
    while (route.state) {
      route = route.state.routes[route.state.index];
    }
    return route.name || 'Home';
  };

  const currentRoute = getCurrentRoute();

  // Hide on certain screens
  const hideOnRoutes = ['SeedCamera', 'DeviceConnection', 'Login'];
  if (hideOnRoutes.includes(currentRoute)) {
    return null;
  }

  const navItems = [
    {
      id: 'SeedDetection',
      label: t.seedDetection,
      icon: 'seed',
      route: 'SeedDetection',
      color: '#4CAF50',
    },
    {
      id: 'MoistureDetector',
      label: t.moisture,
      icon: 'water',
      route: 'MoistureDetector',
      color: '#2196F3',
    },
    {
      id: 'Home',
      label: t.home,
      icon: 'home',
      route: 'Home',
      color: '#0F5132',
      isCenter: true,
    },
    {
      id: 'SoilPH',
      label: t.soilPH,
      icon: 'test-tube',
      route: 'SoilPH',
      color: '#FF6D00',
    },
    {
      id: 'PestDetection',
      label: t.pestDetection,
      icon: 'bug',
      route: 'PestDetection',
      color: '#E91E63',
    },
  ];

  const handleNavigate = (targetRoute) => {
    if (targetRoute === currentRoute) return;
    
    // Navigate to the route through the Drawer Navigator to Main stack
    // BottomNavigation receives drawerNavigation prop from MainStackWithBottomNav
    try {
      // Navigate through Drawer to Main stack, then to target route
      drawerNav.navigate('Main', {
        screen: targetRoute,
      });
    } catch (e) {
      console.log('Navigation error:', e);
      // Fallback: try using CommonActions
      try {
        drawerNav.dispatch(
          CommonActions.navigate({
            name: 'Main',
            params: {
              screen: targetRoute,
            },
          })
        );
      } catch (e2) {
        console.log('CommonActions navigation error:', e2);
      }
    }
  };

  const isActive = (routeName) => {
    return currentRoute === routeName;
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const active = isActive(item.route);
          
          if (item.isCenter) {
            // Center home button - elevated/FAB style
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.centerButton}
                onPress={() => handleNavigate(item.route)}
                activeOpacity={0.8}
              >
                <View style={[styles.centerButtonInner, active && styles.centerButtonActive]}>
                  <Icon name={item.icon} size={28} color={active ? '#FFFFFF' : '#0F5132'} />
                </View>
                <Text style={[styles.centerLabel, active && styles.centerLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }

          // Side buttons
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.navIconContainer}>
                <Icon
                  name={item.icon}
                  size={24}
                  color={active ? item.color : '#999'}
                />
                {active && <View style={[styles.activeIndicator, { backgroundColor: item.color }]} />}
              </View>
              <Text
                style={[
                  styles.navLabel,
                  active && { color: item.color, fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 1000,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: 4,
    height: 72,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    minWidth: 60,
  },
  navIconContainer: {
    position: 'relative',
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  navLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24, // Elevate the center button
    minWidth: 70,
  },
  centerButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F7F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  centerButtonActive: {
    backgroundColor: '#0F5132',
    elevation: 8,
    shadowOpacity: 0.3,
  },
  centerLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  centerLabelActive: {
    color: '#0F5132',
    fontWeight: '700',
  },
});
