// src/screens/HomeScreen.tsx

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width } = Dimensions.get('window');

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  backgroundColor: string;
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon, 
  backgroundColor, 
  onPress 
}) => (
  <TouchableOpacity 
    style={[styles.featureCard, { backgroundColor }]} 
    onPress={onPress} 
    activeOpacity={0.8}
  >
    <View style={styles.cardHeader}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <View style={styles.cardArrow}>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDescription}>{description}</Text>
  </TouchableOpacity>
);

interface QuickActionProps {
  title: string;
  icon: string;
  onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, icon, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.quickActionIcon}>
      <Text style={styles.quickActionIconText}>{icon}</Text>
    </View>
    <Text style={styles.quickActionText}>{title}</Text>
  </TouchableOpacity>
);

const HomeScreen: React.FC = () => {
  const features = [
    {
      title: 'Seed Quality Detection',
      description: 'AI-powered seed sorting and purity analysis',
      icon: '🌱',
      backgroundColor: '#4CAF50',
      onPress: () => console.log('Seed Quality Detection pressed'),
    },
    {
      title: 'Moisture Detector',
      description: 'Real-time moisture monitoring and logging',
      icon: '💧',
      backgroundColor: '#2196F3',
      onPress: () => console.log('Moisture Detector pressed'),
    },
    {
      title: 'Soil pH Monitoring',
      description: 'Instant soil analysis with smart recommendations',
      icon: '🌿',
      backgroundColor: '#FF9800',
      onPress: () => console.log('Soil pH Monitoring pressed'),
    },
    {
      title: 'Pest & Disease Detection',
      description: 'Early detection through image recognition',
      icon: '🔍',
      backgroundColor: '#E91E63',
      onPress: () => console.log('Pest Detection pressed'),
    },
  ];

  const quickActions = [
    { title: 'Marketplace', icon: '🛒', onPress: () => console.log('Marketplace') },
    { title: 'Officer', icon: '👨‍🌾', onPress: () => console.log('Officer') },
    { title: 'History', icon: '📊', onPress: () => console.log('History') },
    { title: 'Profile', icon: '👤', onPress: () => console.log('Profile') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#133305" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appTitle}>🌾 iPaddyCare</Text>
        <Text style={styles.tagline}>Your Smart Agriculture Assistant</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Weather Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherLocation}>📍 Your Location</Text>
            <Text style={styles.weatherTemp}>28°C</Text>
            <Text style={styles.weatherDesc}>Perfect for farming</Text>
          </View>
          <Text style={styles.weatherIcon}>☀️</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </View>
        </View>

        {/* Main Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Activity</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Tests Done</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Issues Found</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  header: {
    backgroundColor: '#133305',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 5,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  weatherCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 15,
    padding: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  weatherDesc: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  weatherIcon: {
    fontSize: 40,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIconText: {
    fontSize: 24,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 50) / 2,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 32,
  },
  cardArrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
  statsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;