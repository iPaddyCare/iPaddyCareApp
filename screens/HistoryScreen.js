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
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../src/i18n/useTranslation';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

// Sample test history data
const sampleTests = [
  {
    id: 1,
    type: 'seedQuality',
    title: 'Seed Quality Detection',
    result: 'Purity: 95.2% - Excellent quality',
    date: '2024-01-15',
    time: '10:30 AM',
    location: 'Colombo',
    status: 'completed',
    icon: '🌾',
    color: '#00C851',
  },
  {
    id: 2,
    type: 'moisture',
    title: 'Moisture Detection',
    result: 'Moisture: 12.5% - Optimal',
    date: '2024-01-14',
    time: '02:15 PM',
    location: 'Kandy',
    status: 'completed',
    icon: '💧',
    color: '#2196F3',
  },
  {
    id: 3,
    type: 'soilPH',
    title: 'Soil pH Test',
    result: 'pH Level: 6.2 - Slightly acidic',
    date: '2024-01-13',
    time: '09:00 AM',
    location: 'Gampaha',
    status: 'completed',
    icon: '🧪',
    color: '#FF6D00',
  },
  {
    id: 4,
    type: 'pestDetection',
    title: 'Pest Detection',
    result: 'No pests detected',
    date: '2024-01-12',
    time: '11:45 AM',
    location: 'Matale',
    status: 'completed',
    icon: '🐛',
    color: '#E91E63',
  },
  {
    id: 5,
    type: 'moisture',
    title: 'Moisture Detection',
    result: 'Moisture: 15.3% - Needs drying',
    date: '2024-01-11',
    time: '03:20 PM',
    location: 'Kurunegala',
    status: 'completed',
    icon: '💧',
    color: '#2196F3',
  },
  {
    id: 6,
    type: 'seedQuality',
    title: 'Seed Quality Detection',
    result: 'Purity: 88.5% - Good quality',
    date: '2024-01-10',
    time: '08:15 AM',
    location: 'Anuradhapura',
    status: 'completed',
    icon: '🌾',
    color: '#00C851',
  },
];

const FilterButton = ({ label, icon, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.filterButton, isActive && styles.filterButtonActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.filterIcon}>{icon}</Text>
    <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const TestCard = ({ test, onViewDetails, onDelete, onShare, translate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return translate('completed');
      case 'pending':
        return translate('pending');
      case 'failed':
        return translate('failed');
      default:
        return status;
    }
  };

  return (
    <View style={styles.testCard}>
      <View style={styles.testCardHeader}>
        <View style={[styles.testIconContainer, { backgroundColor: `${test.color}15` }]}>
          <Text style={styles.testIcon}>{test.icon}</Text>
        </View>
        <View style={styles.testHeaderContent}>
          <Text style={styles.testTitle}>{test.title}</Text>
          <View style={styles.testMeta}>
            <View style={styles.metaItem}>
              <Icon name="calendar" size={12} color="#666" />
              <Text style={styles.metaText}>{test.date}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="clock-outline" size={12} color="#666" />
              <Text style={styles.metaText}>{test.time}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(test.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(test.status)}</Text>
        </View>
      </View>
      <View style={styles.testCardBody}>
        <View style={styles.resultContainer}>
          <Icon name="check-circle" size={16} color={test.color} />
          <Text style={styles.resultText}>{test.result}</Text>
        </View>
        {test.location && (
          <View style={styles.locationContainer}>
            <Icon name="map-marker" size={14} color="#666" />
            <Text style={styles.locationText}>{test.location}</Text>
          </View>
        )}
      </View>
      <View style={styles.testCardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => onViewDetails(test)}
          activeOpacity={0.7}
        >
          <Icon name="eye" size={16} color="#0F5132" />
          <Text style={styles.viewButtonText}>{translate('common.viewDetails')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={() => onShare(test)}
          activeOpacity={0.7}
        >
          <Icon name="share-variant" size={16} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(test)}
          activeOpacity={0.7}
        >
          <Icon name="delete" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HistoryScreen({ navigation }) {
  const translate = useTranslation('history');
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [tests] = useState(sampleTests);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const filters = [
    { id: 'all', label: translate('all'), icon: '📋' },
    { id: 'seedQuality', label: translate('seedQuality'), icon: '🌾' },
    { id: 'moisture', label: translate('moisture'), icon: '💧' },
    { id: 'soilPH', label: translate('soilPH'), icon: '🧪' },
    { id: 'pestDetection', label: translate('pestDetection'), icon: '🐛' },
  ];

  const filteredTests = selectedFilter === 'all'
    ? tests
    : tests.filter(test => test.type === selectedFilter);

  const handleViewDetails = (test) => {
    // Navigate to appropriate detail screen based on test type
    switch (test.type) {
      case 'seedQuality':
        navigation.navigate('SeedDetection');
        break;
      case 'moisture':
        navigation.navigate('MoistureDetector');
        break;
      case 'soilPH':
        navigation.navigate('SoilPH');
        break;
      case 'pestDetection':
        navigation.navigate('PestDetection');
        break;
      default:
        showAppAlert(translate('testDetails'), `${translate('viewDetailsFor')} ${test.title}`);
    }
  };

  const handleDelete = (test) => {
    showAppAlert(
      translate('confirmDelete'),
      translate('confirmDeleteMessage'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('deleteConfirm'),
          style: 'destructive',
          onPress: () => {
            // In a real app, delete from backend
            showAppAlert(translate('deleted'), translate('deletedDesc'));
          },
        },
      ]
    );
  };

  const handleShare = (test) => {
    showAppAlert(translate('shareResult'), `${translate('shareResult')} ${test.title} ${translate('shareResultDesc')}`);
  };

  const handleExport = () => {
    showAppAlert(translate('exportTitle'), translate('exportDesc'));
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
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => navigation.openDrawer()}
              >
                <Text style={styles.menuIcon}>☰</Text>
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{translate('title')}</Text>
                <Text style={styles.headerSubtitle}>{translate('subtitle')}</Text>
              </View>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={handleExport}
              >
                <Icon name="download" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.innerContent}>
            {/* Filter Buttons */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{translate('common.filter')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContainer}
              >
                {filters.map((filter) => (
                  <FilterButton
                    key={filter.id}
                    label={filter.label}
                    icon={filter.icon}
                    isActive={selectedFilter === filter.id}
                    onPress={() => setSelectedFilter(filter.id)}
                  />
                ))}
              </ScrollView>
            </Animated.View>

            {/* Test Results */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <View style={styles.resultsHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedFilter === 'all' ? translate('all') : filters.find(f => f.id === selectedFilter)?.label}
                </Text>
                <Text style={styles.resultsCount}>{filteredTests.length} {filteredTests.length === 1 ? translate('test') : translate('tests')}</Text>
              </View>
              {filteredTests.length > 0 ? (
                <View style={styles.testsContainer}>
                  {filteredTests.map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      onViewDetails={handleViewDetails}
                      onDelete={handleDelete}
                      onShare={handleShare}
                      translate={translate}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>📊</Text>
                  <Text style={styles.emptyStateTitle}>{translate('noTests')}</Text>
                  <Text style={styles.emptyStateText}>{translate('noTestsDesc')}</Text>
                </View>
              )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    zIndex: 1,
    position: 'relative',
  },
  menuButton: {
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
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  exportButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  innerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: -0.3,
  },
  filtersContainer: {
    paddingRight: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterButtonActive: {
    backgroundColor: '#0F5132',
    borderColor: '#0F5132',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterLabelActive: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  testsContainer: {
    gap: 16,
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  testCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  testIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testIcon: {
    fontSize: 24,
  },
  testHeaderContent: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  testMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testCardBody: {
    marginBottom: 12,
    paddingLeft: 60,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  testCardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#F0F7F3',
    borderColor: '#0F5132',
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F5132',
    marginLeft: 6,
  },
  shareButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    paddingHorizontal: 12,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    paddingHorizontal: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

