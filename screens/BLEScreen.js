import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  StyleSheet,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Camera, Droplets, TestTube, Bug, Users, ShoppingCart, FileText, Settings } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function IPaddyCareHome({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const languages = ['English', 'සිංහල', 'தமிழ்'];

  const mainFeatures = [
    {
      id: 1,
      title: 'Seed Quality Detection',
      subtitle: 'AI-powered seed sorting',
      icon: Camera,
      color: '#4CAF50',
      description: 'Detect and remove wild paddy seeds',
      route: 'SeedDetection'
    },
    {
      id: 2,
      title: 'Moisture Monitor',
      subtitle: 'Portable field testing',
      icon: Droplets,
      color: '#2196F3',
      description: 'Real-time moisture measurement',
      route: 'MoistureDetector'
    },
    {
      id: 3,
      title: 'Soil pH Testing',
      subtitle: 'Smart soil analysis',
      icon: TestTube,
      color: '#FF9800',
      description: 'Instant pH testing & recommendations',
      route: 'SoilPH'
    },
    {
      id: 4,
      title: 'Pest & Disease Detection',
      subtitle: 'Early detection system',
      icon: Bug,
      color: '#E91E63',
      description: 'Camera-based pest identification',
      route: 'PestDetection'
    }
  ];

  const quickActions = [
    { title: 'Connect Officer', icon: Users, color: '#9C27B0', route: 'Officers' },
    { title: 'Marketplace', icon: ShoppingCart, color: '#FF5722', route: 'Marketplace' },
    { title: 'Test History', icon: FileText, color: '#607D8B', route: 'History' },
    { title: 'Settings', icon: Settings, color: '#795548', route: 'Settings' }
  ];

  const FeatureCard = ({ feature, navigation }) => {
    const IconComponent = feature.icon;
    return (
      <TouchableOpacity 
        style={[styles.featureCard, { borderLeftColor: feature.color }]}
        onPress={() => navigation?.navigate(feature.route)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: feature.color + '15' }]}>
            <IconComponent size={32} color={feature.color} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>{feature.description}</Text>
      </TouchableOpacity>
    );
  };

  const QuickActionButton = ({ action }) => {
    const IconComponent = action.icon;
    return (
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => navigation?.navigate(action.route)}
        activeOpacity={0.7}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
          <IconComponent size={24} color="white" />
        </View>
        <Text style={styles.quickActionText}>{action.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>iPaddyCare</Text>
          <Text style={styles.tagline}>Smart Agricultural Toolkit</Text>
        </View>
        
        {/* Language Selector */}
        <TouchableOpacity style={styles.languageSelector}>
          <Text style={styles.languageText}>{selectedLanguage}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Weather/Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Today's Overview</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Active Tests</Text>
              <Text style={styles.statusValue}>3</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Recommendations</Text>
              <Text style={styles.statusValue}>2</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Officers Online</Text>
              <Text style={styles.statusValue}>12</Text>
            </View>
          </View>
        </View>

        {/* Main Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Features</Text>
          {mainFeatures.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} navigation={navigation} />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <QuickActionButton key={index} action={action} />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityTitle}>Soil pH Test Completed</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
            <Text style={styles.activityDescription}>
              pH level: 6.2 - Slightly acidic. Lime application recommended.
            </Text>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityTitle}>Seed Quality Analysis</Text>
            <Text style={styles.activityTime}>1 day ago</Text>
            <Text style={styles.activityDescription}>
              Purity: 95.2% - Excellent quality seeds detected.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeText: {
    color: '#C8E6C9',
    fontSize: 16,
    fontWeight: '400',
  },
  appName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  tagline: {
    color: '#C8E6C9',
    fontSize: 14,
    marginTop: 2,
  },
  languageSelector: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  languageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: 'white',
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureCard: {
    backgroundColor: 'white',
    marginBottom: 15,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardDescription: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
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
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 30,
  },
});