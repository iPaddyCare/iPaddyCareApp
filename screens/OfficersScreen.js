import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../src/i18n/useTranslation';

import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getOfficers, getOrCreateConversation } from '../src/services/messagingService';

const { width, height } = Dimensions.get('window');

// No hardcoded data — officers fetched from Firestore

const OfficerCard = ({ officer, onContact, onMessage, onShareHistory, translate }) => {
  const handleCall = () => {
    if (!officer.phone) {
      showAppAlert(translate('noPhone'), translate('noPhoneDesc'));
      return;
    }
    Linking.openURL(`tel:${officer.phone}`).catch(() => {
      showAppAlert(translate('common.error'), translate('unableToCall'));
    });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${officer.email}?subject=${encodeURIComponent(translate('agriculturalInquiry'))}`).catch(() => {
      showAppAlert(translate('common.email'), `${translate('common.pleaseSendEmail')} ${officer.email}`);
    });
  };

  return (
    <View style={styles.officerCard}>
      <View style={styles.officerHeader}>
        <View style={styles.officerImageContainer}>
          <View style={styles.officerImagePlaceholder}>
            <Text style={styles.officerImageEmoji}>👨‍🌾</Text>
          </View>
          {officer.status === 'online' && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
        <View style={styles.officerInfo}>
          <View style={styles.officerNameRow}>
            <Text style={styles.officerName}>{officer.name || 'Officer'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: officer.status === 'online' ? '#10B981' : '#6B7280' }]}>
              <Text style={styles.statusText}>{officer.status === 'online' ? translate('online') : translate('offline')}</Text>
            </View>
          </View>
          <Text style={styles.officerTitle}>{officer.title || 'Agricultural Officer'}</Text>
          {(officer.rating > 0 || officer.experience) && (
            <View style={styles.officerRating}>
              {officer.rating > 0 && (
                <>
                  <Icon name="star" size={14} color="#FFB800" />
                  <Text style={styles.ratingText}>{officer.rating}</Text>
                </>
              )}
              {officer.experience ? (
                <Text style={styles.experienceText}>{officer.rating > 0 ? ' • ' : ''}{officer.experience}</Text>
              ) : null}
            </View>
          )}
        </View>
      </View>
      <View style={styles.officerDetails}>
        {officer.location ? (
          <View style={styles.detailRow}>
            <Icon name="map-marker" size={14} color="#666" />
            <Text style={styles.detailText}>{officer.location}</Text>
          </View>
        ) : null}
        {officer.specialization ? (
          <View style={styles.detailRow}>
            <Icon name="briefcase" size={14} color="#666" />
            <Text style={styles.detailText}>{officer.specialization}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.officerActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={handleCall}
          activeOpacity={0.7}
        >
          <Icon name="phone" size={16} color="#FFFFFF" />
          <Text style={styles.callButtonText}>{translate('call')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => onMessage(officer)}
          activeOpacity={0.7}
        >
          <Icon name="message-text" size={16} color="#FFFFFF" />
          <Text style={styles.messageButtonText}>{translate('message')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.emailButton]}
          onPress={handleEmail}
          activeOpacity={0.7}
        >
          <Icon name="email" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.officerSecondaryActions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => onContact(officer)}
          activeOpacity={0.7}
        >
          <Icon name="account-details" size={16} color="#0F5132" />
          <Text style={styles.secondaryButtonText}>{translate('contactDetails')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => onShareHistory(officer)}
          activeOpacity={0.7}
        >
          <Icon name="share-variant" size={16} color="#0F5132" />
          <Text style={styles.secondaryButtonText}>{translate('shareTestHistory')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function OfficersScreen({ navigation }) {
  const translate = useTranslation('officers');
  const { isAuthenticated, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficers();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const data = await getOfficers();
      setOfficers(data);
    } catch (error) {
      console.error('Error fetching officers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOfficers = officers.filter((officer) => {
    const name = (officer.name || '').toLowerCase();
    const spec = (officer.specialization || '').toLowerCase();
    const loc = (officer.location || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = name.includes(q) || spec.includes(q) || loc.includes(q);
    const matchesFilter = filter === 'all' ||
                         (filter === 'online' && officer.status === 'online');
    return matchesSearch && matchesFilter;
  });

  const handleContact = (officer) => {
    if (!isAuthenticated) {
      showAppAlert(
        translate('common.loginRequired'),
        translate('loginRequiredDesc'),
        [
          { text: translate('cancel'), style: 'cancel' },
          { text: translate('login'), onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    showAppAlert(
      translate('contactDetails'),
      `${officer.name}\n${officer.title}\n\n${translate('phone')}: ${officer.phone}\n${translate('common.email')}: ${officer.email}\n${translate('common.location')}: ${officer.location}`,
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('call'),
          onPress: () => Linking.openURL(`tel:${officer.phone}`).catch(() => {
            showAppAlert(translate('common.error'), translate('unableToCall'));
          }),
        },
        {
          text: translate('emailOfficer'),
          onPress: () => {
            const emailUrl = `mailto:${officer.email}?subject=${encodeURIComponent(translate('agriculturalInquiry'))}`;
            Linking.openURL(emailUrl).catch(() => {
              showAppAlert(translate('common.email'), `${translate('common.pleaseSendEmail')} ${officer.email}`);
            });
          },
        },
      ]
    );
  };

  const handleMessage = async (officer) => {
    if (!isAuthenticated) {
      showAppAlert(
        translate('common.loginRequired'),
        translate('loginRequiredDesc'),
        [
          { text: translate('cancel'), style: 'cancel' },
          { text: translate('login'), onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    try {
      const conversation = await getOrCreateConversation(user, officer);
      navigation.navigate('Message', {
        conversationId: conversation.id,
        officer,
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      showAppAlert(translate('common.error'), translate('couldNotStartConv'));
    }
  };

  const handleShareHistory = (officer) => {
    if (!isAuthenticated) {
      showAppAlert(
        translate('common.loginRequired'),
        translate('loginRequiredDesc'),
        [
          { text: translate('cancel'), style: 'cancel' },
          { text: translate('login'), onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    showAppAlert(
      translate('shareTestHistory'),
      `${translate('selectTests')} with ${officer.name}?`,
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('send'),
          onPress: () => {
            // In a real app, share test history from backend
            showAppAlert(translate('testHistoryShared'), translate('testHistorySharedDesc'));
          },
        },
      ]
    );
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
              <View style={styles.menuButtonPlaceholder} />
            </View>
          </View>

          <View style={styles.innerContent}>
            {/* Search Bar */}
            <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
              <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={translate('searchPlaceholder')}
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Filter Buttons */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <View style={styles.filterContainer}>
                <TouchableOpacity
                  style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                  onPress={() => setFilter('all')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                    {translate('all')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterButton, filter === 'online' && styles.filterButtonActive]}
                  onPress={() => setFilter('online')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, filter === 'online' && styles.filterTextActive]}>
                    {translate('onlineOnly')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterButton, { opacity: 0.4 }]}
                  disabled
                  activeOpacity={0.7}
                >
                  <Text style={styles.filterText}>
                    {officers.length} {officers.length === 1 ? 'officer' : 'officers'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Officers List */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{translate('availableOfficers')}</Text>
              {loading ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator size="large" color="#0F5132" />
                  <Text style={[styles.emptyStateText, { marginTop: 12 }]}>Loading officers...</Text>
                </View>
              ) : filteredOfficers.length > 0 ? (
                <View style={styles.officersContainer}>
                  {filteredOfficers.map((officer) => (
                    <OfficerCard
                      key={officer.id}
                      officer={officer}
                      onContact={handleContact}
                      onMessage={handleMessage}
                      onShareHistory={handleShareHistory}
                      translate={translate}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>👨‍🌾</Text>
                  <Text style={styles.emptyStateTitle}>{translate('noOfficers')}</Text>
                  <Text style={styles.emptyStateText}>{translate('noOfficersDesc')}</Text>
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
    paddingHorizontal: 60,
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
  menuButtonPlaceholder: {
    width: 48,
    height: 48,
    position: 'absolute',
    right: 24,
  },
  innerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    padding: 0,
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
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
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
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  officersContainer: {
    gap: 16,
  },
  officerCard: {
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
  officerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  officerImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  officerImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  officerImageEmoji: {
    fontSize: 32,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  officerInfo: {
    flex: 1,
  },
  officerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  officerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  officerTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  officerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 4,
  },
  experienceText: {
    fontSize: 12,
    color: '#666',
  },
  officerDetails: {
    marginBottom: 12,
    paddingLeft: 76,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  officerActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  callButton: {
    backgroundColor: '#10B981',
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  messageButton: {
    backgroundColor: '#2196F3',
  },
  messageButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  emailButton: {
    backgroundColor: '#FF6D00',
    flex: 0,
    paddingHorizontal: 12,
  },
  officerSecondaryActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F0F7F3',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F5132',
    marginLeft: 6,
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

