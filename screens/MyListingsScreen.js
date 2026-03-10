import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../src/context/LanguageContext';
import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserListings, deleteProduct, updateProduct } from '../src/services/marketplaceService';

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

const categoryEmojis = {
  seeds: '🌾',
  fertilizers: '🌱',
  tools: '🔧',
  pesticides: '🛡️',
  herbicides: '🧪',
};

const ListingCard = ({ listing, onEdit, onDelete, onMarkSold, t }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'sold':
        return '#6B7280';
      case 'pending':
        return '#F59E0B';
      case 'declined':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return t.active;
      case 'sold':
        return t.sold;
      case 'pending':
        return t.pending;
      default:
        return status;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  };

  return (
    <View style={styles.listingCard}>
      <View style={styles.listingImageContainer}>
        <View style={styles.listingImagePlaceholder}>
          <Text style={styles.listingImageEmoji}>{categoryEmojis[listing.category] || '📦'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(listing.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(listing.status)}</Text>
        </View>
      </View>
      <View style={styles.listingContent}>
        <Text style={styles.listingTitle} numberOfLines={2}>{listing.productName || listing.title}</Text>
        <View style={styles.listingPriceRow}>
          <Text style={styles.priceLabel}>Rs.</Text>
          <Text style={styles.priceValue}>{listing.price?.toLocaleString()}</Text>
        </View>
        <View style={styles.listingMeta}>
          <View style={styles.metaItem}>
            <Icon name="map-marker" size={14} color="#666" />
            <Text style={styles.metaText}>{listing.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="eye" size={14} color="#666" />
            <Text style={styles.metaText}>{listing.views || 0} views</Text>
          </View>
        </View>
        <Text style={styles.listingDate}>{formatDate(listing.createdAt)}</Text>
        <View style={styles.listingActions}>
          {listing.status !== 'sold' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(listing)}
              activeOpacity={0.7}
            >
              <Icon name="pencil" size={16} color="#0F5132" />
              <Text style={styles.editButtonText}>{t.edit}</Text>
            </TouchableOpacity>
          )}
          {listing.status === 'approved' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.soldButton]}
              onPress={() => onMarkSold(listing)}
              activeOpacity={0.7}
            >
              <Icon name="check-circle" size={16} color="#10B981" />
              <Text style={styles.soldButtonText}>{t.markSold}</Text>
            </TouchableOpacity>
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
  const { isAuthenticated, user, isOfficer } = useAuth();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
  const [fadeAnim] = useState(new Animated.Value(0));
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const data = await getUserListings(user.uid);
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated && user?.uid) {
      fetchListings();
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [isAuthenticated, user?.uid]);

  const activeListingsCount = listings.filter(l => l.status === 'approved').length;
  const soldListingsCount = listings.filter(l => l.status === 'sold').length;

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const handleEdit = (listing) => {
    setEditData({
      id: listing.id,
      productName: listing.productName || '',
      price: String(listing.price || ''),
      description: listing.description || '',
      location: listing.location || '',
      phone: listing.phone || '',
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editData.productName.trim() || !editData.price.trim() || !editData.description.trim() || !editData.location.trim() || !editData.phone.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const phoneClean = editData.phone.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(phoneClean)) {
      Alert.alert('Error', 'Please enter a valid phone number (e.g., 0771234567)');
      return;
    }
    setEditSaving(true);
    try {
      await updateProduct(editData.id, {
        productName: editData.productName,
        price: Number(editData.price),
        description: editData.description,
        location: editData.location,
        phone: editData.phone,
      });
      setListings(prev => prev.map(l => l.id === editData.id ? {
        ...l,
        productName: editData.productName,
        price: Number(editData.price),
        description: editData.description,
        location: editData.location,
        phone: editData.phone,
      } : l));
      setEditModalVisible(false);
      Alert.alert('Updated', 'Listing has been updated.');
    } catch (error) {
      console.error('Error updating listing:', error);
      Alert.alert('Error', 'Failed to update listing.');
    } finally {
      setEditSaving(false);
    }
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
          onPress: async () => {
            try {
              await deleteProduct(listing.id);
              setListings(prev => prev.filter(l => l.id !== listing.id));
              Alert.alert('Deleted', 'Listing has been deleted.');
            } catch (error) {
              console.error('Error deleting listing:', error);
              Alert.alert('Error', 'Failed to delete listing.');
            }
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
          onPress: async () => {
            try {
              await updateProduct(listing.id, { status: 'sold' });
              setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: 'sold' } : l));
              Alert.alert('Updated', 'Listing marked as sold.');
            } catch (error) {
              console.error('Error updating listing:', error);
              Alert.alert('Error', 'Failed to update listing.');
            }
          },
        },
      ]
    );
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  if (isOfficer) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0F5132" translucent={false} />
        <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
          <View style={styles.statusBarContainer} />
        </SafeAreaView>
        <SafeAreaView style={styles.safeAreaContent} edges={['left', 'right', 'bottom']}>
          <View style={styles.header}>
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
            <View style={styles.headerRight} />
          </View>
          <View style={styles.emptyState}>
            <Icon name="shield-off" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>Access Restricted</Text>
            <Text style={styles.emptyStateText}>Officers cannot list products in the marketplace.</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
                <Text style={[styles.statValue, styles.statValueActive]}>{activeListingsCount}</Text>
                <Text style={styles.statLabel}>{t.activeListings}</Text>
              </View>
              <View style={[styles.statCard, styles.statCardSold]}>
                <Text style={[styles.statValue, styles.statValueSold]}>{soldListingsCount}</Text>
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

        {/* Edit Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalKeyboard}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t.edit}</Text>
                  <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                  {editData && (
                    <>
                      <Text style={styles.modalLabel}>Product Name</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={editData.productName}
                        onChangeText={(text) => setEditData({ ...editData, productName: text })}
                      />
                      <Text style={styles.modalLabel}>Price (Rs.)</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={editData.price}
                        onChangeText={(text) => setEditData({ ...editData, price: text.replace(/[^0-9.]/g, '') })}
                        keyboardType="numeric"
                      />
                      <Text style={styles.modalLabel}>Description</Text>
                      <TextInput
                        style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top' }]}
                        value={editData.description}
                        onChangeText={(text) => setEditData({ ...editData, description: text })}
                        multiline
                      />
                      <Text style={styles.modalLabel}>Location</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={editData.location}
                        onChangeText={(text) => setEditData({ ...editData, location: text })}
                      />
                      <Text style={styles.modalLabel}>Phone</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={editData.phone}
                        onChangeText={(text) => setEditData({ ...editData, phone: text.replace(/[^0-9]/g, '') })}
                        keyboardType="phone-pad"
                        maxLength={10}
                      />
                    </>
                  )}
                </ScrollView>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalSaveBtn, editSaving && { opacity: 0.6 }]}
                    onPress={handleSaveEdit}
                    disabled={editSaving}
                  >
                    <Text style={styles.modalSaveText}>{editSaving ? 'Saving...' : 'Save'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboard: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#F5F7F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0F5132',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

