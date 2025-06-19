import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';

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
    moistureMonitor: 'Moisture Monitor',
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
    moistureMonitor: 'තෙතමනය මුරකරු',
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
    moistureMonitor: 'ஈரப்பத கண்காணிப்பு',
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

export default function HomeScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  
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
    setSelectedLanguage(languages[nextIndex]);
  };

  const FeatureCard = ({ feature, index }) => {
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
          onPress={() => navigation?.navigate(feature.route)}
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

  const QuickActionButton = ({ action, index }) => {
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
          onPress={() => navigation?.navigate(action.route)}
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D4F3C" />
      
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
          <View style={styles.headerText}>
            <Text style={styles.welcomeText}>{t.welcomeTo}</Text>
            <Text style={styles.appName}>{t.appName}</Text>
            <Text style={styles.tagline}>{t.tagline}</Text>
          </View>
          
          {/* Language Selector */}
          <TouchableOpacity style={styles.languageSelector} onPress={handleLanguageChange}>
            <Text style={styles.languageText}>{selectedLanguage}</Text>
            <View style={styles.languageBorder} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
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
            <FeatureCard key={feature.id} feature={feature} index={index} />
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
              <QuickActionButton key={index} action={action} index={index} />
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

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  heroHeader: {
    backgroundColor: '#0F5132',
    height: height * 0.25,
    position: 'relative',
    overflow: 'hidden',
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
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    zIndex: 1,
  },
  headerText: {
    flex: 1,
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
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  languageSelector: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  languageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  languageIndicator: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    backgroundColor: '#00C851',
    borderRadius: 3,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 4,
    padding: 24,
    borderRadius: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
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
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 80,
  },
  section: {
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
    marginLeft: 4,
  },
  featureCardContainer: {
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
    position: 'relative',
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
    padding: 24,
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconText: {
    fontSize: 32,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    color: '#777',
    lineHeight: 22,
    marginBottom: 16,
  },
  cardFooter: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  gradientLine: {
    flex: 1,
    height: '100%',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickActionIcon: {
    fontSize: 24,
    color: 'white',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingLeft: 36,
  },
  bottomSpacing: {
    height: 40,
  },
});