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
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../src/context/LanguageContext';
import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserListings, deleteProduct, updateProduct } from '../src/services/marketplaceService';
import CityPickerModal from '../src/components/CityPickerModal';

const { width, height } = Dimensions.get('window');

const UNIT_OPTIONS = ['kg', 'bags', 'litres', 'bundles', 'units'];

const DISEASE_OPTIONS = [
  'Blast (Magnaporthe grisea)',
  'Sheath Blight (Rhizoctonia solani)',
  'Brown spot',
  'Downy Mildew',
  'Bacterial Leaf Blight',
  'Bacterial Leaf Streak',
  'Bacterial Panicle Blight',
  'Dead Heart',
  'Hispa',
  'Tungro Disease',
  'Rice Leaf Roller',
  'Rice Leaf Caterpillar',
  'Rice Shell Pest',
  'Thrips',
  'Paddy Stem Maggot',
  'Asiatic Rice Borer',
  'Yellow Rice Borer',
  'Rice Gall Midge',
  'Brown Plant Hopper',
  'Rice Stem Fly',
  'Rice Water Weevil',
  'Rice Leaf Hopper',
];

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
    declined: 'Declined',
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
    declineReasonLabel: 'Decline reason:',
    pendingBadge: 'pending review',
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
    declined: 'ප්‍රතික්ෂේප කරන ලදී',
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
    declineReasonLabel: 'ප්‍රතික්ෂේප කිරීමේ හේතුව:',
    pendingBadge: 'සමාලෝචනය',
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
    declined: 'நிராகரிக்கப்பட்டது',
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
    declineReasonLabel: 'நிராகரிப்பு காரணம்:',
    pendingBadge: 'மதிப்பாய்வு',
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
      case 'approved': return '#10B981';
      case 'sold': return '#6B7280';
      case 'pending': return '#F59E0B';
      case 'declined': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return t.active;
      case 'sold': return t.sold;
      case 'pending': return t.pending;
      case 'declined': return t.declined;
      default: return status;
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
        {listing.imageUrl ? (
          <Image source={{ uri: listing.imageUrl }} style={styles.listingImage} />
        ) : (
          <View style={styles.listingImagePlaceholder}>
            <Text style={styles.listingImageEmoji}>{categoryEmojis[listing.category] || '📦'}</Text>
          </View>
        )}
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
        {listing.status === 'declined' && listing.declineReason ? (
          <View style={styles.declineReasonBanner}>
            <Icon name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.declineReasonText}>
              {t.declineReasonLabel} {listing.declineReason}
            </Text>
          </View>
        ) : null}
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
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    if (!user?.uid) return;
    setRefreshing(true);
    try {
      const data = await getUserListings(user.uid);
      setListings(data);
    } catch (error) {
      console.error('Error refreshing listings:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && user?.uid) {
        fetchListings();
      }
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, [isAuthenticated, user?.uid])
  );

  const activeListingsCount = listings.filter(l => l.status === 'approved').length;
  const soldListingsCount = listings.filter(l => l.status === 'sold').length;
  const pendingCount = listings.filter(l => l.status === 'pending').length;

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [showEditUnitPicker, setShowEditUnitPicker] = useState(false);
  const [showEditDiseasePicker, setShowEditDiseasePicker] = useState(false);
  const [showEditCityPicker, setShowEditCityPicker] = useState(false);

  const editShowDiseaseField = editData?.category === 'pesticides' || editData?.category === 'herbicides';

  const handleEdit = (listing) => {
    setEditData({
      id: listing.id,
      productName: listing.productName || '',
      price: String(listing.price || ''),
      quantity: String(listing.quantity || ''),
      unit: listing.unit || 'kg',
      description: listing.description || '',
      location: listing.location || '',
      phone: listing.phone || '',
      activeIngredient: listing.activeIngredient || '',
      targetDiseases: listing.targetDiseases || [],
      category: listing.category || '',
    });
    setEditModalVisible(true);
    setShowEditUnitPicker(false);
    setShowEditDiseasePicker(false);
  };

  const toggleEditDisease = (disease) => {
    setEditData(prev => {
      const current = prev.targetDiseases;
      const updated = current.includes(disease)
        ? current.filter(d => d !== disease)
        : [...current, disease];
      return { ...prev, targetDiseases: updated };
    });
  };

  const handleSaveEdit = async () => {
    if (
      !editData.productName.trim() ||
      !editData.price.trim() ||
      !editData.description.trim() ||
      !editData.location.trim() ||
      !editData.phone.trim()
    ) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const phoneClean = editData.phone.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(phoneClean)) {
      Alert.alert('Error', 'Please enter a valid phone number (e.g., 0771234567)');
      return;
    }
    if (editShowDiseaseField && editData.targetDiseases.length === 0) {
      Alert.alert('Error', 'Select at least one target disease/pest');
      return;
    }
    if (editShowDiseaseField && !editData.activeIngredient.trim()) {
      Alert.alert('Error', 'Active ingredient is required for pesticides/herbicides');
      return;
    }

    setEditSaving(true);
    try {
      const updatePayload = {
        productName: editData.productName,
        price: Number(editData.price),
        quantity: Number(editData.quantity) || 0,
        unit: editData.unit,
        description: editData.description,
        location: editData.location,
        phone: editData.phone,
        activeIngredient: editData.activeIngredient,
        targetDiseases: editData.targetDiseases,
        targetDiseasesLower: editData.targetDiseases.map(d => d.toLowerCase().trim()),
      };
      await updateProduct(editData.id, updatePayload);
      setListings(prev => prev.map(l => l.id === editData.id ? { ...l, ...updatePayload } : l));
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
            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#0F5132']}
              tintColor="#0F5132"
            />
          }
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
              {/* Add button with pending badge */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddProduct}
              >
                <Icon name="plus" size={24} color="#FFFFFF" />
                {pendingCount > 0 && (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
                  </View>
                )}
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

            {/* Pending notice */}
            {pendingCount > 0 && (
              <Animated.View style={[styles.pendingNotice, { opacity: fadeAnim }]}>
                <Icon name="clock-outline" size={16} color="#F59E0B" />
                <Text style={styles.pendingNoticeText}>
                  {pendingCount} listing{pendingCount > 1 ? 's' : ''} {t.pendingBadge}
                </Text>
              </Animated.View>
            )}

            {/* Listings */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              {loading ? (
                <ActivityIndicator size="large" color="#0F5132" style={{ marginTop: 40 }} />
              ) : listings.length > 0 ? (
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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <TouchableOpacity
              style={styles.modalDismissArea}
              activeOpacity={1}
              onPress={() => setEditModalVisible(false)}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalDragHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.edit}</Text>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Icon name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.modalBody}
                contentContainerStyle={{ paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {editData && (
                  <>
                    <Text style={styles.modalLabel}>Product Name *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editData.productName}
                      onChangeText={(text) => setEditData({ ...editData, productName: text })}
                    />

                    <Text style={styles.modalLabel}>Price (Rs.) *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editData.price}
                      onChangeText={(text) => setEditData({ ...editData, price: text.replace(/[^0-9.]/g, '') })}
                      keyboardType="numeric"
                    />

                    {/* Quantity + Unit */}
                    <Text style={styles.modalLabel}>Quantity *</Text>
                    <View style={styles.quantityRow}>
                      <TextInput
                        style={[styles.modalInput, { flex: 1, marginRight: 8 }]}
                        value={editData.quantity}
                        onChangeText={(text) => setEditData({ ...editData, quantity: text.replace(/[^0-9]/g, '') })}
                        keyboardType="numeric"
                        placeholder="e.g., 50"
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity
                        style={styles.editUnitSelector}
                        onPress={() => setShowEditUnitPicker(!showEditUnitPicker)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.editUnitText}>{editData.unit || 'kg'}</Text>
                        <Icon name="chevron-down" size={14} color="#666" />
                      </TouchableOpacity>
                    </View>
                    {showEditUnitPicker && (
                      <View style={styles.editPickerDropdown}>
                        {UNIT_OPTIONS.map(u => (
                          <TouchableOpacity
                            key={u}
                            style={[styles.editPickerOption, editData.unit === u && styles.editPickerOptionActive]}
                            onPress={() => {
                              setEditData({ ...editData, unit: u });
                              setShowEditUnitPicker(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.editPickerOptionText, editData.unit === u && styles.editPickerOptionTextActive]}>
                              {u}
                            </Text>
                            {editData.unit === u && <Icon name="check" size={14} color="#0F5132" />}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    <Text style={styles.modalLabel}>Description *</Text>
                    <TextInput
                      style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top' }]}
                      value={editData.description}
                      onChangeText={(text) => setEditData({ ...editData, description: text })}
                      multiline
                    />

                    {/* Location — city picker */}
                    <Text style={styles.modalLabel}>Location *</Text>
                    <TouchableOpacity
                      style={styles.editLocationSelector}
                      onPress={() => setShowEditCityPicker(true)}
                      activeOpacity={0.7}
                    >
                      <Icon name="map-marker" size={16} color={editData.location ? '#0F5132' : '#999'} />
                      <Text style={[styles.editLocationText, !editData.location && { color: '#999' }]}>
                        {editData.location || 'Select city'}
                      </Text>
                      <Icon name="chevron-down" size={18} color="#666" />
                    </TouchableOpacity>

                    <Text style={styles.modalLabel}>Phone *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editData.phone}
                      onChangeText={(text) => setEditData({ ...editData, phone: text.replace(/[^0-9]/g, '') })}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />

                    {/* Target Diseases — only for pesticides/herbicides */}
                    {editShowDiseaseField && (
                      <>
                        <Text style={styles.modalLabel}>Target Diseases / Pests *</Text>
                        <TouchableOpacity
                          style={styles.editLocationSelector}
                          onPress={() => setShowEditDiseasePicker(!showEditDiseasePicker)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.editLocationText, editData.targetDiseases.length === 0 && { color: '#999' }]}>
                            {editData.targetDiseases.length > 0
                              ? `${editData.targetDiseases.length} selected`
                              : 'Select diseases / pests'}
                          </Text>
                          <Icon name={showEditDiseasePicker ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
                        </TouchableOpacity>
                        {editData.targetDiseases.length > 0 && (
                          <View style={styles.editTagsContainer}>
                            {editData.targetDiseases.map(d => (
                              <TouchableOpacity
                                key={d}
                                style={styles.editTag}
                                onPress={() => toggleEditDisease(d)}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.editTagText}>{d}</Text>
                                <Icon name="close" size={12} color="#0F5132" />
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                        {showEditDiseasePicker && (
                          <View style={styles.editPickerDropdown}>
                            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                              {DISEASE_OPTIONS.map(disease => {
                                const isSel = editData.targetDiseases.includes(disease);
                                return (
                                  <TouchableOpacity
                                    key={disease}
                                    style={[styles.editPickerOption, isSel && styles.editPickerOptionActive]}
                                    onPress={() => toggleEditDisease(disease)}
                                    activeOpacity={0.7}
                                  >
                                    <Icon
                                      name={isSel ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                      size={18}
                                      color={isSel ? '#0F5132' : '#999'}
                                      style={{ marginRight: 10 }}
                                    />
                                    <Text style={[styles.editPickerOptionText, isSel && styles.editPickerOptionTextActive]}>
                                      {disease}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </ScrollView>
                            <TouchableOpacity
                              style={styles.pickerDoneBtn}
                              onPress={() => setShowEditDiseasePicker(false)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.pickerDoneText}>Done</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        <Text style={styles.modalLabel}>Active Ingredient / Chemical Composition *</Text>
                        <TextInput
                          style={styles.modalInput}
                          value={editData.activeIngredient}
                          onChangeText={(text) => setEditData({ ...editData, activeIngredient: text })}
                          placeholder="e.g., Mancozeb 64% + Metalaxyl 8% WP"
                          placeholderTextColor="#999"
                        />
                      </>
                    )}
                  </>
                )}
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelActionBtn}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveBtn, editSaving && { opacity: 0.6 }]}
                  onPress={handleSaveEdit}
                  disabled={editSaving}
                >
                  <Icon name={editSaving ? 'loading' : 'check'} size={18} color="#FFFFFF" />
                  <Text style={styles.modalSaveText}>{editSaving ? 'Saving...' : 'Save Changes'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* City picker for edit modal */}
        <CityPickerModal
          visible={showEditCityPicker}
          selected={editData?.location || ''}
          onSelect={(district) => {
            setEditData(prev => ({ ...prev, location: district }));
            setShowEditCityPicker(false);
          }}
          onClose={() => setShowEditCityPicker(false)}
        />
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
  headerRight: {
    width: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
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
    position: 'relative',
  },
  pendingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pendingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
  },
  pendingNoticeText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
  },
  innerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  listingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  declineReasonBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  declineReasonText: {
    flex: 1,
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '500',
    lineHeight: 18,
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 6,
    marginTop: 14,
    marginLeft: 2,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: 'rgba(15,81,50,0.12)',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editUnitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(15,81,50,0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 13,
    gap: 6,
    minWidth: 72,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  editUnitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  editLocationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(15,81,50,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  editLocationText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  editPickerDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  editPickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  editPickerOptionActive: {
    backgroundColor: '#F0F7F3',
  },
  editPickerOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  editPickerOptionTextActive: {
    color: '#0F5132',
    fontWeight: '700',
  },
  editTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  editTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F3',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.15)',
    gap: 4,
  },
  editTagText: {
    fontSize: 11,
    color: '#0F5132',
    fontWeight: '600',
  },
  pickerDoneBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#F0F7F3',
  },
  pickerDoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F5132',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  modalCancelActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  modalSaveBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#0F5132',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
