import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/AuthContext';
import { useLanguage } from '../src/context/LanguageContext';
import BottomNavigation from '../src/components/BottomNavigation';

const { width, height } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    welcomeTo: 'Welcome to',
    appName: 'iPaddyCare',
    tagline: 'Smart Agricultural Toolkit',
    todaysOverview: "Today's Overview",
    activeTests: 'Active Tests',
    recommendations: 'Recommendations',
    officersOnline: 'Officers Online',
    coreFeatures: 'Core Features',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    seedQualityDetection: 'Seed Quality Detection',
    seedQualitySubtitle: 'AI-powered seed sorting',
    seedQualityDesc: 'Detect and remove wild paddy seeds',
    moistureMonitor: 'Seed Moisture Monitor',
    moistureSubtitle: 'Portable field testing',
    moistureDesc: 'Real-time moisture measurement',
    soilPHTesting: 'Soil pH Testing',
    soilPHSubtitle: 'Smart soil analysis',
    soilPHDesc: 'Instant pH testing & recommendations',
    pestDiseaseDetection: 'Pest & Disease Detection',
    pestDiseaseSubtitle: 'Early detection system',
    pestDiseaseDesc: 'Camera-based pest identification',
    connectOfficer: 'Connect Officer',
    marketplace: 'Marketplace',
    testHistory: 'Test History',
    settings: 'Settings',
    soilPHCompleted: 'Soil pH Test Completed',
    seedQualityAnalysis: 'Seed Quality Analysis',
    hoursAgo: 'hours ago',
    dayAgo: 'day ago',
    phLevelDesc: 'pH level: 6.2 - Slightly acidic. Lime application recommended.',
    purityDesc: 'Purity: 95.2% - Excellent quality seeds detected.'
  },
  සිංහල: {
    welcomeTo: 'ඔබට සාදරයෙන් පිළිගනිමු',
    appName: 'අයිපැඩිකෙයා',
    tagline: 'ස්මාර්ට් කෘෂිකර්ම මෙවලම්',
    todaysOverview: 'අද දවසේ සාරාංශය',
    activeTests: 'ක්‍රියාකාරී පරීක්ෂණ',
    recommendations: 'නිර්දේශ',
    officersOnline: 'සබැඳි නිලධාරීන්',
    coreFeatures: 'ප්‍රධාන විශේෂාංග',
    quickActions: 'ඉක්මන් ක්‍රියාමාර්ග',
    recentActivity: 'මෑත ක්‍රියාකලාපය',
    seedQualityDetection: 'බීජ ගුණත්ව හඳුනාගැනීම',
    seedQualitySubtitle: 'AI බලයෙන් බීජ වර්ගීකරණය',
    seedQualityDesc: 'වල් වී බීජ හඳුනාගෙන ඉවත් කරන්න',
    moistureMonitor: 'බීජ තෙතමනය මුරකරු',
    moistureSubtitle: 'පහසුකම් ක්ෂේත්‍ර පරීක්ෂණය',
    moistureDesc: 'තත්‍ය කාලීන තෙතමනය මැනීම',
    soilPHTesting: 'පස් pH පරීක්ෂණය',
    soilPHSubtitle: 'ස්මාර්ට් පස් විශ්ලේෂණය',
    soilPHDesc: 'ක්ෂණික pH පරීක්ෂණ සහ නිර්දේශ',
    pestDiseaseDetection: 'පළිබෝධ සහ රෝග හඳුනාගැනීම',
    pestDiseaseSubtitle: 'පූර්ව හඳුනාගැනීමේ පද්ධතිය',
    pestDiseaseDesc: 'කැමරා පදනම් කරගත් පළිබෝධ හඳුනාගැනීම',
    connectOfficer: 'නිලධාරීට සම්බන්ධ වන්න',
    marketplace: 'වෙළඳපොළ',
    testHistory: 'පරීක්ෂණ ඉතිහාසය',
    settings: 'සැකසුම්',
    soilPHCompleted: 'පස් pH පරීක්ෂණය සම්පූර්ණයි',
    seedQualityAnalysis: 'බීජ ගුණත්ව විශ්ලේෂණය',
    hoursAgo: 'පැය කට පෙර',
    dayAgo: 'දින කට පෙර',
    phLevelDesc: 'pH මට්ටම: 6.2 - සුලභ අම්ල. හුණු යෙදීම නිර්දේශ කරනු ලැබේ.',
    purityDesc: 'සංශුද්ධතාව: 95.2% - විශිෂ්ට ගුණත්ව බීජ හඳුනාගෙන ඇත.'
  },
  தமிழ்: {
    welcomeTo: 'உங்களை வரவேற்கிறோம்',
    appName: 'ஐபாட்டிகேர்',
    tagline: 'ஸ்மார்ட் விவசாய கருவித்தொகுப்பு',
    todaysOverview: 'இன்றைய மேலோட்டம்',
    activeTests: 'செயலில் உள்ள சோதனைகள்',
    recommendations: 'பரிந்துரைகள்',
    officersOnline: 'ஆன்லைன் அதிகாரிகள்',
    coreFeatures: 'முக்கிய அம்சங்கள்',
    quickActions: 'விரைவு நடவடிக்கைகள்',
    recentActivity: 'சமீபத்திய செயல்பாடு',
    seedQualityDetection: 'விதை தர கண்டறிதல்',
    seedQualitySubtitle: 'AI சக்தியால் விதை வகைப்படுத்தல்',
    seedQualityDesc: 'காட்டு நெல் விதைகளை கண்டறிந்து அகற்றவும்',
    moistureMonitor: 'விதை ஈரப்பத கண்காணிப்பு',
    moistureSubtitle: 'கையடக்க வயல் சோதனை',
    moistureDesc: 'நிகழ்நேர ஈரப்பத அளவீடு',
    soilPHTesting: 'மண் pH சோதனை',
    soilPHSubtitle: 'ஸ்மார்ட் மண் பகுப்பாய்வு',
    soilPHDesc: 'உடனடி pH சோதனை மற்றும் பரிந்துரைகள்',
    pestDiseaseDetection: 'பூச்சி மற்றும் நோய் கண்டறிதல்',
    pestDiseaseSubtitle: 'ஆரம்ப கண்டறிதல் அமைப்பு',
    pestDiseaseDesc: 'கேமரா அடிப்படையிலான பூச்சி அடையாளம்',
    connectOfficer: 'அதிகாரியுடன் இணைக்கவும்',
    marketplace: 'சந்தைக்கிடம்',
    testHistory: 'சோதனை வரலாறு',
    settings: 'அமைப்புகள்',
    soilPHCompleted: 'மண் pH சோதனை முடிவுற்றது',
    seedQualityAnalysis: 'விதை தர பகுப்பாய்வு',
    hoursAgo: 'மணி நேரம் முன்பு',
    dayAgo: 'நாள் முன்பு',
    phLevelDesc: 'pH அளவு: 6.2 - சற்று அமிலம். சுண்ணாம்பு பயன்பாடு பரிந்துரைக்கப்படுகிறது.',
    purityDesc: 'தூய்மை: 95.2% - சிறந்த தர விதைகள் கண்டறியப்பட்டன.'
  }
};

// Utility to bubble up to root navigator for cross-stack navigation
const navigateToRootRoute = (navigation, routeName) => {
  let parentNav = navigation;
  while (parentNav && parentNav.getParent()) {
    parentNav = parentNav.getParent();
  }
  parentNav?.navigate(routeName);
};

// FeatureCard component moved outside HomeScreen
const FeatureCard = ({ feature, index, fadeAnim, slideAnim, navigation, isAuthenticated, requireAuth }) => {
  const [cardScale] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (requireAuth && !isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to access this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => navigateToRootRoute(navigation, 'Login'),
          },
        ]
      );
    } else {
      navigation?.navigate(feature.route);
    }
  };

  return (
    <Animated.View style={[
      styles.featureCardContainer,
      {
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { scale: cardScale }
        ]
      }
    ]}>
      <TouchableOpacity
        style={styles.featureCard}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Background Pattern */}
        <View style={[styles.cardPattern, { backgroundColor: feature.accentColor }]} />

        {/* Main Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: feature.primaryColor }]}>
              <Text style={styles.iconText}>{feature.icon}</Text>
              <View style={[styles.iconGlow, { backgroundColor: feature.primaryColor }]} />
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={[styles.cardSubtitle, { color: feature.secondaryColor }]}>{feature.subtitle}</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>{feature.description}</Text>

          {/* Action Indicator */}
          <View style={styles.cardFooter}>
            <View style={[styles.actionIndicator, { backgroundColor: feature.primaryColor }]}>
              <Text style={styles.actionText}>→</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// QuickActionButton component moved outside HomeScreen
const QuickActionButton = ({ action, index, fadeAnim, slideAnim, navigation, isAuthenticated, requireAuth }) => {
  const [buttonScale] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (requireAuth && !isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to access this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => navigateToRootRoute(navigation, 'Login'),
          },
        ]
      );
    } else {
      navigation?.navigate(action.route);
    }
  };

  return (
    <Animated.View style={[
      styles.quickActionContainer,
      {
        opacity: fadeAnim,
        transform: [
          { scale: buttonScale },
          { translateY: slideAnim }
        ]
      }
    ]}>
      <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: action.lightColor }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.quickActionIconContainer, { backgroundColor: action.color }]}>
          <Text style={styles.quickActionIcon}>{action.icon}</Text>
          <View style={[styles.quickActionGlow, { backgroundColor: action.color }]} />
        </View>
        <Text style={styles.quickActionText}>{action.title}</Text>

        {/* Subtle pattern */}
        <View style={[styles.quickActionPattern, { borderColor: action.color }]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen({ navigation }) {
  const { selectedLanguage, changeLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const { isAuthenticated } = useAuth();

  const languages = ['English', 'සිංහල', 'தமிழ்'];
  const t = translations[selectedLanguage];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  const mainFeatures = [
    {
      id: 1,
      title: t.seedQualityDetection,
      subtitle: t.seedQualitySubtitle,
      icon: '🌾',
      primaryColor: '#00C851',
      secondaryColor: '#007E33',
      accentColor: '#E8F5E8',
      description: t.seedQualityDesc,
      route: 'SeedDetection'
    },
    {
      id: 2,
      title: t.moistureMonitor,
      subtitle: t.moistureSubtitle,
      icon: '💧',
      primaryColor: '#2196F3',
      secondaryColor: '#0D47A1',
      accentColor: '#E3F2FD',
      description: t.moistureDesc,
      route: 'MoistureDetector'
    },
    {
      id: 3,
      title: t.soilPHTesting,
      subtitle: t.soilPHSubtitle,
      icon: '🧪',
      primaryColor: '#FF6D00',
      secondaryColor: '#E65100',
      accentColor: '#FFF3E0',
      description: t.soilPHDesc,
      route: 'SoilPH'
    },
    {
      id: 4,
      title: t.pestDiseaseDetection,
      subtitle: t.pestDiseaseSubtitle,
      icon: '🐛',
      primaryColor: '#E91E63',
      secondaryColor: '#AD1457',
      accentColor: '#FCE4EC',
      description: t.pestDiseaseDesc,
      route: 'PestDetection'
    }
  ];

  const quickActions = [
    { title: t.connectOfficer, icon: '👥', color: '#9C27B0', lightColor: '#F3E5F5', route: 'Officers' },
    { title: t.marketplace, icon: '🛒', color: '#FF5722', lightColor: '#FBE9E7', route: 'Marketplace' },
    { title: t.testHistory, icon: '📊', color: '#607D8B', lightColor: '#ECEFF1', route: 'History' },
    { title: t.settings, icon: '⚙️', color: '#795548', lightColor: '#EFEBE9', route: 'Settings' }
  ];

  const handleLanguageChange = () => {
    const currentIndex = languages.indexOf(selectedLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    changeLanguage(languages[nextIndex]);
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
        {/* Background Pattern */}
        <View style={styles.headerPattern} />
        <View style={styles.headerPattern2} />

        {/* Content */}
        <Animated.View style={[
          styles.headerContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
            {/* Menu Button */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.openDrawer()}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.welcomeText}>{t.welcomeTo}</Text>
              <Text style={[
                styles.appName,
                // Reduce font size for Sinhala and Tamil appName on Android
                (Platform.OS === 'android' && (selectedLanguage === 'සිංහල' || selectedLanguage === 'தமிழ்')) && styles.appNameNonLatin,
              ]}>{t.appName}</Text>
            <Text style={styles.tagline}>{t.tagline}</Text>
          </View>

          {/* Language Selector */}
          <TouchableOpacity style={styles.languageSelector} onPress={handleLanguageChange}>
              <Text style={[
                styles.languageText,
                (selectedLanguage === 'සිංහල' || selectedLanguage === 'தமிழ்') && styles.languageTextNonLatin
              ]}>{selectedLanguage}</Text>
            <View style={styles.languageBorder} />
          </TouchableOpacity>
        </Animated.View>
      </View>

        <View style={styles.innerContent}>
        {/* Dashboard Stats */}
        <Animated.View style={[
          styles.dashboardCard,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
          <Text style={styles.dashboardTitle}>{t.todaysOverview}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#E8F5E8' }]}>
                <Text style={styles.statEmoji}>🧪</Text>
              </View>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>{t.activeTests}</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#00C851' }]} />
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                <Text style={styles.statEmoji}>💡</Text>
              </View>
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statLabel}>{t.recommendations}</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#FF6D00' }]} />
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#F3E5F5' }]}>
                <Text style={styles.statEmoji}>👥</Text>
              </View>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>{t.officersOnline}</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#9C27B0' }]} />
            </View>
          </View>
        </Animated.View>

        {/* Main Features */}
        <View style={styles.section}>
          <Animated.Text style={[
            styles.sectionTitle,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }]
            }
          ]}>
            {t.coreFeatures}
          </Animated.Text>
          {mainFeatures.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              fadeAnim={fadeAnim}
              slideAnim={slideAnim}
              navigation={navigation}
                isAuthenticated={isAuthenticated}
                requireAuth={true}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Animated.Text style={[
            styles.sectionTitle,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }]
            }
          ]}>
            {t.quickActions}
          </Animated.Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <QuickActionButton
                key={index}
                action={action}
                index={index}
                fadeAnim={fadeAnim}
                slideAnim={slideAnim}
                navigation={navigation}
                  isAuthenticated={isAuthenticated}
                  requireAuth={true}
              />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Animated.Text style={[
            styles.sectionTitle,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }]
            }
          ]}>
            {t.recentActivity}
          </Animated.Text>

          <Animated.View style={[
            styles.activityCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, { backgroundColor: '#FFF3E0' }]}>
                <Text style={styles.activityEmoji}>🧪</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{t.soilPHCompleted}</Text>
                <Text style={styles.activityTime}>2 {t.hoursAgo}</Text>
              </View>
              <View style={[styles.activityStatus, { backgroundColor: '#00C851' }]} />
            </View>
            <Text style={styles.activityDescription}>{t.phLevelDesc}</Text>
          </Animated.View>

          <Animated.View style={[
            styles.activityCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, { backgroundColor: '#E8F5E8' }]}>
                <Text style={styles.activityEmoji}>🌾</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{t.seedQualityAnalysis}</Text>
                <Text style={styles.activityTime}>1 {t.dayAgo}</Text>
              </View>
              <View style={[styles.activityStatus, { backgroundColor: '#2196F3' }]} />
            </View>
            <Text style={styles.activityDescription}>{t.purityDesc}</Text>
          </Animated.View>
        </View>

        </View>
      </ScrollView>
      </SafeAreaView>
      <BottomNavigation />
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
    height: height * 0.28,
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
    marginLeft: 50,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  appNameNonLatin: {
    fontSize: 28,
    includeFontPadding: false,
    paddingBottom: Platform.OS === 'android' ? 6 : 0,
    paddingTop: Platform.OS === 'android' ? 2 : 0,
    lineHeight: Platform.OS === 'android' ? 38 : undefined,
    textAlignVertical: 'center',
  },
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  languageSelector: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  languageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  languageTextNonLatin: {
    fontSize: Platform.OS === 'android' ? 11 : 12,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  languageBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  innerContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    marginTop: -32,
    marginHorizontal: 4,
    padding: 28,
    borderRadius: 28,
    elevation: 16,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.08)',
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    position: 'relative',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 85,
    letterSpacing: 0.2,
  },
  statIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
    marginLeft: 4,
    letterSpacing: -0.5,
  },
  featureCardContainer: {
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    overflow: 'visible',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardPattern: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.3,
  },
  cardContent: {
    padding: 26,
    zIndex: 1,
    overflow: 'hidden',
    borderRadius: 28,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  iconGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    borderRadius: 20,
  },
  iconText: {
    fontSize: 32,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 5,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.85,
  },
  cardDescription: {
    fontSize: 14.5,
    color: '#666',
    lineHeight: 22,
    marginBottom: 18,
    fontWeight: '400',
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  actionIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionContainer: {
    width: (width - 60) / 2,
    marginBottom: 16,
  },
  quickActionButton: {
    padding: 22,
    borderRadius: 22,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  quickActionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  quickActionGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    borderRadius: 18,
  },
  quickActionIcon: {
    fontSize: 24,
    color: 'white',
  },
  quickActionText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  quickActionPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderRadius: 18,
    opacity: 0.1,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 20,
    marginBottom: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.04)',
    borderTopColor: 'rgba(0,0,0,0.04)',
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  activityTime: {
    fontSize: 12.5,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activityStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  activityDescription: {
    fontSize: 14.5,
    color: '#666',
    lineHeight: 21,
    fontWeight: '400',
  },
  bottomSpacing: {
    height: 40,
  },
});