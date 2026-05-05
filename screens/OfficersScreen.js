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
import { useLanguage } from '../src/context/LanguageContext';
import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getOfficers, getOrCreateConversation } from '../src/services/messagingService';

const { width, height } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    title: 'Connect Officer',
    subtitle: 'Get expert agricultural advice',
    searchPlaceholder: 'Search officers...',
    availableOfficers: 'Available Officers',
    yourArea: 'In Area',
    allAreas: 'All Areas',
    online: 'Online',
    offline: 'Offline',
    sendMessage: 'Send Message',
    shareTestHistory: 'Share Test History',
    contactDetails: 'Contact Details',
    phone: 'Phone',
    email: 'Email',
    location: 'Location',
    specialization: 'Specialization',
    experience: 'Experience',
    rating: 'Rating',
    call: 'Call',
    message: 'Message',
    emailOfficer: 'Email Officer',
    noOfficers: 'No Officers Available',
    noOfficersDesc: 'No agricultural officers found in your area',
    filter: 'Filter',
    all: 'All',
    onlineOnly: 'Online',
    sendTestHistory: 'Send Test History',
    selectTests: 'Select tests to share',
    send: 'Send',
    messageSent: 'Message Sent',
    messageSentDesc: 'Your message has been sent successfully',
    testHistoryShared: 'Test History Shared',
    testHistorySharedDesc: 'Test history has been shared with the officer',
    loginRequired: 'Login Required',
    loginRequiredDesc: 'Please login to contact officers',
    login: 'Login',
    cancel: 'Cancel',
    noPhone: 'No Phone',
    noPhoneDesc: 'This officer has not added a phone number yet.',
    error: 'Error',
    unableToCall: 'Unable to make phone call',
    pleaseSendEmail: 'Please send email to:',
    agriculturalInquiry: 'Agricultural Inquiry',
    couldNotStartConv: 'Could not start conversation. Please try again.',
  },
  සිංහල: {
    title: 'නිලධාරියා සම්බන්ධ වන්න',
    subtitle: 'විශේෂඥ කෘෂිකර්ම උපදෙස් ලබාගන්න',
    searchPlaceholder: 'නිලධාරීන් සොයන්න...',
    availableOfficers: 'ලබා ගත හැකි නිලධාරීන්',
    yourArea: 'ඔබේ ප්‍රදේශයේ',
    allAreas: 'සියලුම ප්‍රදේශ',
    online: 'සබැඳි',
    offline: 'අසබැඳි',
    sendMessage: 'පණිවිඩයක් යවන්න',
    shareTestHistory: 'පරීක්ෂණ ඉතිහාසය බෙදාගන්න',
    contactDetails: 'සම්බන්ධතා තොරතුරු',
    phone: 'දුරකථන',
    email: 'විද්‍යුත් තැපෑල',
    location: 'ස්ථානය',
    specialization: 'විශේෂඥත්වය',
    experience: 'අත්දැකීම්',
    rating: 'ශ්‍රේණිගත කිරීම',
    call: 'ඇමතුම',
    message: 'පණිවිඩය',
    emailOfficer: 'නිලධාරියාට විද්‍යුත් තැපෑල',
    noOfficers: 'නිලධාරීන් නොමැත',
    noOfficersDesc: 'ඔබේ ප්‍රදේශයේ කෘෂිකර්ම නිලධාරීන් හමු නොවීය',
    filter: 'පෙරහන',
    all: 'සියල්ල',
    onlineOnly: 'සබැඳි',
    sendTestHistory: 'පරීක්ෂණ ඉතිහාසය යවන්න',
    selectTests: 'බෙදාගැනීමට පරීක්ෂණ තෝරන්න',
    send: 'යවන්න',
    messageSent: 'පණිවිඩය යවන ලදී',
    messageSentDesc: 'ඔබේ පණිවිඩය සාර්ථකව යවන ලදී',
    testHistoryShared: 'පරීක්ෂණ ඉතිහාසය බෙදාගන්නා ලදී',
    testHistorySharedDesc: 'පරීක්ෂණ ඉතිහාසය නිලධාරියා සමඟ බෙදාගන්නා ලදී',
    loginRequired: 'පිවිසීම අවශ්‍යයි',
    loginRequiredDesc: 'නිලධාරීන් හා සම්බන්ධ වීමට කරුණාකර පිවිසෙන්න',
    login: 'පිවිසෙන්න',
    cancel: 'අවලංගු කරන්න',
    noPhone: 'දුරකථන අංකයක් නැත',
    noPhoneDesc: 'මෙම නිලධාරියා තවමත් දුරකථන අංකයක් එක් කර නැත.',
    error: 'දෝෂය',
    unableToCall: 'දුරකථන ඇමතුමක් ලබා දීමට නොහැකි විය',
    pleaseSendEmail: 'කරුණාකර විද්‍යුත් තැපෑල යවන්න:',
    agriculturalInquiry: 'කෘෂිකර්ම විමසීම',
    couldNotStartConv: 'සංවාදය ආරම්භ කළ නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.',
  },
  தமிழ்: {
    title: 'அதிகாரியை இணைக்கவும்',
    subtitle: 'நிபுணர் விவசாய ஆலோசனையைப் பெறுங்கள்',
    searchPlaceholder: 'அதிகாரிகளைத் தேடவும்...',
    availableOfficers: 'கிடைக்கும் அதிகாரிகள்',
    yourArea: 'உங்கள் பகுதியில்',
    allAreas: 'அனைத்து பகுதிகளும்',
    online: 'ஆன்லைன்',
    offline: 'ஆஃப்லைன்',
    sendMessage: 'செய்தி அனுப்ப',
    shareTestHistory: 'சோதனை வரலாற்றைப் பகிரவும்',
    contactDetails: 'தொடர்பு விவரங்கள்',
    phone: 'தொலைபேசி',
    email: 'மின்னஞ்சல்',
    location: 'இடம்',
    specialization: 'நிபுணத்துவம்',
    experience: 'அனுபவம்',
    rating: 'மதிப்பீடு',
    call: 'அழை',
    message: 'செய்தி',
    emailOfficer: 'அதிகாரிக்கு மின்னஞ்சல்',
    noOfficers: 'அதிகாரிகள் இல்லை',
    noOfficersDesc: 'உங்கள் பகுதியில் விவசாய அதிகாரிகள் கிடைக்கவில்லை',
    filter: 'வடிகட்டு',
    all: 'அனைத்தும்',
    onlineOnly: 'ஆன்லைன் மட்டும்',
    sendTestHistory: 'சோதனை வரலாற்றை அனுப்ப',
    selectTests: 'பகிர்வதற்கு சோதனைகளைத் தேர்ந்தெடுக்கவும்',
    send: 'அனுப்ப',
    messageSent: 'செய்தி அனுப்பப்பட்டது',
    messageSentDesc: 'உங்கள் செய்தி வெற்றிகரமாக அனுப்பப்பட்டது',
    testHistoryShared: 'சோதனை வரலாறு பகிரப்பட்டது',
    testHistorySharedDesc: 'சோதனை வரலாறு அதிகாரியுடன் பகிரப்பட்டது',
    loginRequired: 'உள்நுழைவு தேவை',
    loginRequiredDesc: 'அதிகாரிகளைத் தொடர்பு கொள்ள தயவுசெய்து உள்நுழையவும்',
    login: 'உள்நுழைக',
    cancel: 'ரத்துசெய்',
    noPhone: 'தொலைபேசி இல்லை',
    noPhoneDesc: 'இந்த அதிகாரி இன்னும் தொலைபேசி எண்ணைச் சேர்க்கவில்லை.',
    error: 'பிழை',
    unableToCall: 'தொலைபேசி அழைப்பு செய்ய முடியவில்லை',
    pleaseSendEmail: 'தயவுசெய்து மின்னஞ்சல் அனுப்பவும்:',
    agriculturalInquiry: 'விவசாய விசாரணை',
    couldNotStartConv: 'உரையாடலைத் தொடங்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  },
};

// No hardcoded data — officers fetched from Firestore

const OfficerCard = ({ officer, onContact, onMessage, onShareHistory, t }) => {
  const handleCall = () => {
    if (!officer.phone) {
      showAppAlert(t.noPhone, t.noPhoneDesc);
      return;
    }
    Linking.openURL(`tel:${officer.phone}`).catch(() => {
      showAppAlert(t.error, t.unableToCall);
    });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${officer.email}?subject=${encodeURIComponent(t.agriculturalInquiry)}`).catch(() => {
      showAppAlert(t.email, `${t.pleaseSendEmail} ${officer.email}`);
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
              <Text style={styles.statusText}>{officer.status === 'online' ? t.online : t.offline}</Text>
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
          <Text style={styles.callButtonText}>{t.call}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => onMessage(officer)}
          activeOpacity={0.7}
        >
          <Icon name="message-text" size={16} color="#FFFFFF" />
          <Text style={styles.messageButtonText}>{t.message}</Text>
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
          <Text style={styles.secondaryButtonText}>{t.contactDetails}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => onShareHistory(officer)}
          activeOpacity={0.7}
        >
          <Icon name="share-variant" size={16} color="#0F5132" />
          <Text style={styles.secondaryButtonText}>{t.shareTestHistory}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function OfficersScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
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
        t.loginRequired,
        t.loginRequiredDesc,
        [
          { text: t.cancel, style: 'cancel' },
          { text: t.login, onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    showAppAlert(
      t.contactDetails,
      `${officer.name}\n${officer.title}\n\n${t.phone}: ${officer.phone}\n${t.email}: ${officer.email}\n${t.location}: ${officer.location}`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.call,
          onPress: () => Linking.openURL(`tel:${officer.phone}`).catch(() => {
            showAppAlert(t.error, t.unableToCall);
          }),
        },
        {
          text: t.emailOfficer,
          onPress: () => {
            const emailUrl = `mailto:${officer.email}?subject=${encodeURIComponent(t.agriculturalInquiry)}`;
            Linking.openURL(emailUrl).catch(() => {
              showAppAlert(t.email, `${t.pleaseSendEmail} ${officer.email}`);
            });
          },
        },
      ]
    );
  };

  const handleMessage = async (officer) => {
    if (!isAuthenticated) {
      showAppAlert(
        t.loginRequired,
        t.loginRequiredDesc,
        [
          { text: t.cancel, style: 'cancel' },
          { text: t.login, onPress: () => navigation.navigate('Login') },
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
      showAppAlert(t.error, t.couldNotStartConv);
    }
  };

  const handleShareHistory = (officer) => {
    if (!isAuthenticated) {
      showAppAlert(
        t.loginRequired,
        t.loginRequiredDesc,
        [
          { text: t.cancel, style: 'cancel' },
          { text: t.login, onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    showAppAlert(
      t.shareTestHistory,
      `${t.selectTests} with ${officer.name}?`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.send,
          onPress: () => {
            // In a real app, share test history from backend
            showAppAlert(t.testHistoryShared, t.testHistorySharedDesc);
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
                <Text style={styles.headerTitle}>{t.title}</Text>
                <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
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
                placeholder={t.searchPlaceholder}
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
                    {t.all}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterButton, filter === 'online' && styles.filterButtonActive]}
                  onPress={() => setFilter('online')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, filter === 'online' && styles.filterTextActive]}>
                    {t.onlineOnly}
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
              <Text style={styles.sectionTitle}>{t.availableOfficers}</Text>
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
                      t={t}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>👨‍🌾</Text>
                  <Text style={styles.emptyStateTitle}>{t.noOfficers}</Text>
                  <Text style={styles.emptyStateText}>{t.noOfficersDesc}</Text>
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

