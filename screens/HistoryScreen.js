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
import { useLanguage } from '../src/context/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    title: 'Test History',
    subtitle: 'View all your test results',
    noTests: 'No Tests Yet',
    noTestsDesc: 'Start testing to see your results here',
    filter: 'Filter',
    all: 'All Tests',
    seedQuality: 'Seed Quality',
    moisture: 'Moisture',
    soilPH: 'Soil pH',
    pestDetection: 'Pest Detection',
    date: 'Date',
    time: 'Time',
    result: 'Result',
    viewDetails: 'View Details',
    delete: 'Delete',
    share: 'Share',
    export: 'Export',
    confirmDelete: 'Delete Test',
    confirmDeleteMessage: 'Are you sure you want to delete this test?',
    cancel: 'Cancel',
    deleteConfirm: 'Delete',
    testType: 'Test Type',
    location: 'Location',
    status: 'Status',
    completed: 'Completed',
    pending: 'Pending',
    failed: 'Failed',
    testDetails: 'Test Details',
    viewDetailsFor: 'View details for',
    deleted: 'Deleted',
    deletedDesc: 'Test has been deleted.',
    shareResult: 'Share',
    shareResultDesc: 'result',
    exportTitle: 'Export',
    exportDesc: 'Export all test results to CSV/PDF',
    test: 'test',
    tests: 'tests',
  },
  සිංහල: {
    title: 'පරීක්ෂණ ඉතිහාසය',
    subtitle: 'ඔබේ සියලුම පරීක්ෂණ ප්‍රතිඵල බලන්න',
    noTests: 'තවමත් පරීක්ෂණ නොමැත',
    noTestsDesc: 'ඔබේ ප්‍රතිඵල මෙහි දැකීමට පරීක්ෂණ ආරම්භ කරන්න',
    filter: 'පෙරහන',
    all: 'සියලුම පරීක්ෂණ',
    seedQuality: 'බීජ ගුණත්වය',
    moisture: 'තෙතමනය',
    soilPH: 'පස් pH',
    pestDetection: 'පළිබෝධ හඳුනාගැනීම',
    date: 'දිනය',
    time: 'වේලාව',
    result: 'ප්‍රතිඵලය',
    viewDetails: 'විස්තර බලන්න',
    delete: 'මකන්න',
    share: 'බෙදාගන්න',
    export: 'නිර්යාත කරන්න',
    confirmDelete: 'පරීක්ෂණය මකන්න',
    confirmDeleteMessage: 'ඔබට මෙම පරීක්ෂණය මැකීමට අවශ්‍යද?',
    cancel: 'අවලංගු කරන්න',
    deleteConfirm: 'මකන්න',
    testType: 'පරීක්ෂණ වර්ගය',
    location: 'ස්ථානය',
    status: 'තත්වය',
    completed: 'සම්පූර්ණ',
    pending: 'පොරොත්තුවෙන්',
    failed: 'අසාර්ථක',
    testDetails: 'පරීක්ෂණ විස්තර',
    viewDetailsFor: 'සඳහා විස්තර බලන්න',
    deleted: 'මකා දමන ලදී',
    deletedDesc: 'පරීක්ෂණය මකා දමා ඇත.',
    shareResult: 'බෙදාගන්න',
    shareResultDesc: 'ප්‍රතිඵලය',
    exportTitle: 'නිර්යාත කරන්න',
    exportDesc: 'සියලුම පරීක්ෂණ ප්‍රතිඵල CSV/PDF වෙත නිර්යාත කරන්න',
    test: 'පරීක්ෂණය',
    tests: 'පරීක්ෂණ',
  },
  தமிழ்: {
    title: 'சோதனை வரலாறு',
    subtitle: 'உங்கள் அனைத்து சோதனை முடிவுகளையும் காண்க',
    noTests: 'இன்னும் சோதனைகள் இல்லை',
    noTestsDesc: 'உங்கள் முடிவுகளை இங்கே பார்க்க சோதனையைத் தொடங்குங்கள்',
    filter: 'வடிகட்டு',
    all: 'அனைத்து சோதனைகள்',
    seedQuality: 'விதை தரம்',
    moisture: 'ஈரப்பதம்',
    soilPH: 'மண் pH',
    pestDetection: 'பூச்சி கண்டறிதல்',
    date: 'தேதி',
    time: 'நேரம்',
    result: 'முடிவு',
    viewDetails: 'விவரங்களைக் காண்க',
    delete: 'நீக்கு',
    share: 'பகிர்',
    export: 'ஏற்றுமதி',
    confirmDelete: 'சோதனையை நீக்கவும்',
    confirmDeleteMessage: 'இந்த சோதனையை நீக்க விரும்புகிறீர்களா?',
    cancel: 'ரத்துசெய்',
    deleteConfirm: 'நீக்கு',
    testType: 'சோதனை வகை',
    location: 'இடம்',
    status: 'நிலை',
    completed: 'முடிந்தது',
    pending: 'நிலுவையில்',
    failed: 'தோல்வி',
    testDetails: 'சோதனை விவரங்கள்',
    viewDetailsFor: 'இதற்கான விவரங்களைக் காண்க',
    deleted: 'நீக்கப்பட்டது',
    deletedDesc: 'சோதனை நீக்கப்பட்டது.',
    shareResult: 'பகிர்',
    shareResultDesc: 'முடிவு',
    exportTitle: 'ஏற்றுமதி',
    exportDesc: 'அனைத்து சோதனை முடிவுகளையும் CSV/PDF க்கு ஏற்றுமதி செய்',
    test: 'சோதனை',
    tests: 'சோதனைகள்',
  },
};

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

const TestCard = ({ test, onViewDetails, onDelete, onShare, t }) => {
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
        return t.completed;
      case 'pending':
        return t.pending;
      case 'failed':
        return t.failed;
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
          <Text style={styles.viewButtonText}>{t.viewDetails}</Text>
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
  const { selectedLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
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
    { id: 'all', label: t.all, icon: '📋' },
    { id: 'seedQuality', label: t.seedQuality, icon: '🌾' },
    { id: 'moisture', label: t.moisture, icon: '💧' },
    { id: 'soilPH', label: t.soilPH, icon: '🧪' },
    { id: 'pestDetection', label: t.pestDetection, icon: '🐛' },
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
        showAppAlert(t.testDetails, `${t.viewDetailsFor} ${test.title}`);
    }
  };

  const handleDelete = (test) => {
    showAppAlert(
      t.confirmDelete,
      t.confirmDeleteMessage,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.deleteConfirm,
          style: 'destructive',
          onPress: () => {
            // In a real app, delete from backend
            showAppAlert(t.deleted, t.deletedDesc);
          },
        },
      ]
    );
  };

  const handleShare = (test) => {
    showAppAlert(t.shareResult, `${t.shareResult} ${test.title} ${t.shareResultDesc}`);
  };

  const handleExport = () => {
    showAppAlert(t.exportTitle, t.exportDesc);
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
                <Text style={styles.headerTitle}>{t.title}</Text>
                <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
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
              <Text style={styles.sectionTitle}>{t.filter}</Text>
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
                  {selectedFilter === 'all' ? t.all : filters.find(f => f.id === selectedFilter)?.label}
                </Text>
                <Text style={styles.resultsCount}>{filteredTests.length} {filteredTests.length === 1 ? t.test : t.tests}</Text>
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
                      t={t}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>📊</Text>
                  <Text style={styles.emptyStateTitle}>{t.noTests}</Text>
                  <Text style={styles.emptyStateText}>{t.noTestsDesc}</Text>
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

