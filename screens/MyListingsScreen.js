import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../src/context/LanguageContext';
import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    title: 'My Listings',
    subtitle: 'Manage your products',
    noListings: 'No Listings Yet',
    noListingsDesc: 'Start selling by adding your first product!',
    addFirstProduct: 'Add Your First Product',
    active: 'Active',
    sold: 'Sold',
    pending: 'Pending',
    edit: 'Edit',
    delete: 'Delete',
    markSold: 'Mark as Sold',
    viewDetails: 'View Details',
    confirmDelete: 'Delete Listing',
    confirmDeleteMessage: 'Are you sure you want to delete this listing?',
    cancel: 'Cancel',
    deleteConfirm: 'Delete',
    soldConfirm: 'Mark as Sold',
    soldMessage: 'This listing will be marked as sold.',
    totalListings: 'Total Listings',
    activeListings: 'Active',
    soldListings: 'Sold',
  },
  සිංහල: {
    title: 'මගේ ලැයිස්තු',
    subtitle: 'ඔබේ නිෂ්පාදන කළමනාකරණය කරන්න',
    noListings: 'තවමත් ලැයිස්තු නොමැත',
    noListingsDesc: 'ඔබේ පළමු නිෂ්පාදනය එක් කිරීමෙන් විකිණීම ආරම්භ කරන්න!',
    addFirstProduct: 'ඔබේ පළමු නිෂ්පාදනය එක් කරන්න',
    active: 'ක්‍රියාකාරී',
    sold: 'විකුණන ලදී',
    pending: 'පොරොත්තුවෙන්',
    edit: 'සංස්කරණය',
    delete: 'මකන්න',
    markSold: 'විකුණන ලදී ලෙස සලකුණු කරන්න',
    viewDetails: 'විස්තර බලන්න',
    confirmDelete: 'ලැයිස්තුව මකන්න',
    confirmDeleteMessage: 'ඔබට මෙම ලැයිස්තුව මැකීමට අවශ්‍යද?',
    cancel: 'අවලංගු කරන්න',
    deleteConfirm: 'මකන්න',
    soldConfirm: 'විකුණන ලදී ලෙස සලකුණු කරන්න',
    soldMessage: 'මෙම ලැයිස්තුව විකුණන ලදී ලෙස සලකුණු කරනු ලැබේ.',
    totalListings: 'සම්පූර්ණ ලැයිස්තු',
    activeListings: 'ක්‍රියාකාරී',
    soldListings: 'විකුණන ලදී',
  },
  தமிழ்: {
    title: 'எனது பட்டியல்கள்',
    subtitle: 'உங்கள் தயாரிப்புகளை நிர்வகிக்கவும்',
    noListings: 'இன்னும் பட்டியல்கள் இல்லை',
    noListingsDesc: 'உங்கள் முதல் தயாரிப்பைச் சேர்ப்பதன் மூலம் விற்பனையைத் தொடங்குங்கள்!',
    addFirstProduct: 'உங்கள் முதல் தயாரிப்பைச் சேர்க்கவும்',
    active: 'செயலில்',
    sold: 'விற்கப்பட்டது',
    pending: 'நிலுவையில்',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    markSold: 'விற்கப்பட்டதாகக் குறிக்கவும்',
    viewDetails: 'விவரங்களைக் காண்க',
    confirmDelete: 'பட்டியலை நீக்கவும்',
    confirmDeleteMessage: 'இந்த பட்டியலை நீக்க விரும்புகிறீர்களா?',
    cancel: 'ரத்துசெய்',
    deleteConfirm: 'நீக்கு',
    soldConfirm: 'விற்கப்பட்டதாகக் குறிக்கவும்',
    soldMessage: 'இந்த பட்டியல் விற்கப்பட்டதாகக் குறிக்கப்படும்.',
    totalListings: 'மொத்த பட்டியல்கள்',
    activeListings: 'செயலில்',
    soldListings: 'விற்கப்பட்டது',
  },
};

// Sample user listings (in a real app, this would come from backend)
const sampleUserListings = [
  {
    id: 1,
    title: 'Premium Paddy Seeds - Variety A',
    category: 'seeds',
    price: 2500,
    location: 'Colombo',
    status: 'active',
    image: '🌾',
    description: 'High quality paddy seeds with 95% germination rate',
    views: 45,
    createdAt: '2 days ago',
  },
  {
    id: 2,
    title: 'Organic Fertilizer 50kg',
    category: 'fertilizers',
    price: 3500,
    location: 'Kandy',
    status: 'active',
    image: '🌱',
    description: 'Natural organic fertilizer for healthy crop growth',
    views: 32,
    createdAt: '5 days ago',
  },
  {
    id: 3,
    title: 'Harvesting Tools Set',
    category: 'tools',
    price: 4500,
    location: 'Gampaha',
    status: 'sold',
    image: '🔧',
    description: 'Complete set of harvesting tools for paddy farming',
    views: 78,
    createdAt: '1 week ago',
  },
];

const ListingCard = ({ listing, onEdit, onDelete, onMarkSold, t }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'sold':
        return '#6B7280';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return t.active;
      case 'sold':
        return t.sold;
      case 'pending':
        return t.pending;
      default:
        return status;
    }
  };

  return (
    <View style={styles.listingCard}>
      <View style={styles.listingImageContainer}>
        <View style={styles.listingImagePlaceholder}>
          <Text style={styles.listingImageEmoji}>{listing.image}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(listing.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(listing.status)}</Text>
        </View>
      </View>
      <View style={styles.listingContent}>
        <Text style={styles.listingTitle} numberOfLines={2}>{listing.title}</Text>
        <View style={styles.listingPriceRow}>
          <Text style={styles.priceLabel}>Rs.</Text>
          <Text style={styles.priceValue}>{listing.price.toLocaleString()}</Text>
        </View>
        <View style={styles.listingMeta}>
          <View style={styles.metaItem}>
            <Icon name="map-marker" size={14} color="#666" />
            <Text style={styles.metaText}>{listing.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="eye" size={14} color="#666" />
            <Text style={styles.metaText}>{listing.views} views</Text>
          </View>
        </View>
        <Text style={styles.listingDate}>{listing.createdAt}</Text>
        <View style={styles.listingActions}>
          {listing.status === 'active' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => onEdit(listing)}
                activeOpacity={0.7}
              >
                <Icon name="pencil" size={16} color="#0F5132" />
                <Text style={styles.editButtonText}>{t.edit}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.soldButton]}
                onPress={() => onMarkSold(listing)}
                activeOpacity={0.7}
              >
                <Icon name="check-circle" size={16} color="#10B981" />
                <Text style={styles.soldButtonText}>{t.markSold}</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(listing)}
            activeOpacity={0.7}
          >
            <Icon name="delete" size={16} color="#EF4444" />
            <Text style={styles.deleteButtonText}>{t.delete}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function MyListingsScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
  const [fadeAnim] = useState(new Animated.Value(0));
  const [listings] = useState(sampleUserListings);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const activeListings = listings.filter(l => l.status === 'active').length;
  const soldListings = listings.filter(l => l.status === 'sold').length;

  const handleEdit = (listing) => {
    // Navigate to edit screen (for now, just show alert)
    Alert.alert('Edit Listing', `Edit "${listing.title}" - Feature coming soon!`);
  };

  const handleDelete = (listing) => {
    Alert.alert(
      t.confirmDelete,
      t.confirmDeleteMessage,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.deleteConfirm,
          style: 'destructive',
          onPress: () => {
            // In a real app, delete from backend
            Alert.alert('Deleted', 'Listing has been deleted.');
          },
        },
      ]
    );
  };

  const handleMarkSold = (listing) => {
    Alert.alert(
      t.markSold,
      t.soldMessage,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.soldConfirm,
          onPress: () => {
            // In a real app, update status in backend
            Alert.alert('Updated', 'Listing marked as sold.');
          },
        },
      ]
    );
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0F5132" translucent={false} />
        <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
          <View style={styles.statusBarContainer} />
        </SafeAreaView>
        <SafeAreaView style={styles.safeAreaContent} edges={['left', 'right']}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔒</Text>
            <Text style={styles.emptyStateTitle}>Login Required</Text>
            <Text style={styles.emptyStateText}>Please login to view your listings</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
                style={styles.addButton}
                onPress={handleAddProduct}
              >
                <Icon name="plus" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.innerContent}>
            {/* Stats Cards */}
            <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{listings.length}</Text>
                <Text style={styles.statLabel}>{t.totalListings}</Text>
              </View>
              <View style={[styles.statCard, styles.statCardActive]}>
                <Text style={[styles.statValue, styles.statValueActive]}>{activeListings}</Text>
                <Text style={styles.statLabel}>{t.activeListings}</Text>
              </View>
              <View style={[styles.statCard, styles.statCardSold]}>
                <Text style={[styles.statValue, styles.statValueSold]}>{soldListings}</Text>
                <Text style={styles.statLabel}>{t.soldListings}</Text>
              </View>
            </Animated.View>

            {/* Listings */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              {listings.length > 0 ? (
                <View style={styles.listingsContainer}>
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onMarkSold={handleMarkSold}
                      t={t}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>📦</Text>
                  <Text style={styles.emptyStateTitle}>{t.noListings}</Text>
                  <Text style={styles.emptyStateText}>{t.noListingsDesc}</Text>
                  <TouchableOpacity
                    style={styles.addProductButton}
                    onPress={handleAddProduct}
                  >
                    <Icon name="plus" size={20} color="#FFFFFF" />
                    <Text style={styles.addProductButtonText}>{t.addFirstProduct}</Text>
                  </TouchableOpacity>
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
  addButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  innerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  statCardActive: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  statCardSold: {
    borderColor: '#6B7280',
    borderWidth: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statValueActive: {
    color: '#10B981',
  },
  statValueSold: {
    color: '#6B7280',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  listingsContainer: {
    gap: 16,
  },
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  listingImageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingImagePlaceholder: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingImageEmoji: {
    fontSize: 56,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listingContent: {
    padding: 16,
  },
  listingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 22,
  },
  listingPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F5132',
  },
  listingMeta: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  listingDate: {
    fontSize: 11,
    color: '#999',
    marginBottom: 12,
  },
  listingActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: '#F0F7F3',
    borderColor: '#0F5132',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F5132',
    marginLeft: 6,
  },
  soldButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  soldButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 6,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
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
    marginBottom: 24,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F5132',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addProductButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: '#0F5132',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

