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
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from '../src/i18n/useTranslation';

import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserListings, deleteProduct, updateProduct } from '../src/services/marketplaceService';
import { normalizeTargetDiseasesForStorage } from '../src/services/diseaseMatching';
import CityPickerModal from '../src/components/CityPickerModal';
import PhoneInput from '../src/components/PhoneInput';
import PriceQuantitySheet from '../src/components/PriceQuantitySheet';
import llmService from '../src/services/LLMService';

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

const categoryEmojis = {
  seeds: '🌾',
  fertilizers: '🌱',
  tools: '🔧',
  pesticides: '🛡️',
  herbicides: '🧪',
};

const ListingCard = ({ listing, onEdit, onDelete, onMarkSold, translate }) => {
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
      case 'approved': return translate('active');
      case 'sold': return translate('sold');
      case 'pending': return translate('pending');
      case 'declined': return translate('declined');
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
              {translate('declineReasonLabel')} {listing.declineReason}
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
              <Text style={styles.editButtonText}>{translate('edit')}</Text>
            </TouchableOpacity>
          )}
          {listing.status === 'approved' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.soldButton]}
              onPress={() => onMarkSold(listing)}
              activeOpacity={0.7}
            >
              <Icon name="check-circle" size={16} color="#10B981" />
              <Text style={styles.soldButtonText}>{translate('markSold')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(listing)}
            activeOpacity={0.7}
          >
            <Icon name="delete" size={16} color="#EF4444" />
            <Text style={styles.deleteButtonText}>{translate('common.delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function MyListingsScreen({ navigation }) {
  const translate = useTranslation('myListings');
  const { isAuthenticated, user, isOfficer } = useAuth();
  const insets = useSafeAreaInsets();
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
  const [showEditDiseasePicker, setShowEditDiseasePicker] = useState(false);
  const [showEditCityPicker, setShowEditCityPicker] = useState(false);
  const [showEditPriceSheet, setShowEditPriceSheet] = useState(false);
  const [suggestingEditDiseases, setSuggestingEditDiseases] = useState(false);

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
    setShowEditDiseasePicker(false);
    setShowEditPriceSheet(false);
  };

  // Ask the LLM which diseases this product likely treats, mirroring the AddProduct flow.
  const handleSuggestEditDiseases = async () => {
    if (!editData) return;
    const hasSignal =
      editData.productName?.trim() ||
      editData.activeIngredient?.trim() ||
      editData.description?.trim();
    if (!hasSignal) {
      showAppAlert(translate('aiNotEnoughInfo'), translate('aiSuggestNoSignal'));
      return;
    }
    if (!llmService.isInitialized()) {
      const ok = await llmService.loadFromStorage().catch(() => false);
      if (!ok) {
        showAppAlert(translate('aiUnavailable'), translate('aiUnavailableMsg'));
        return;
      }
    }
    setSuggestingEditDiseases(true);
    try {
      const suggested = await llmService.inferDiseaseTagsForProduct(
        {
          productName: editData.productName,
          activeIngredient: editData.activeIngredient,
          description: editData.description,
          category: editData.category,
        },
        DISEASE_OPTIONS,
      );
      if (suggested.length === 0) {
        showAppAlert(translate('aiNoMatches'), translate('aiNoMatchesMsg'));
        return;
      }
      const existing = new Set(editData.targetDiseases);
      const added = suggested.filter(d => !existing.has(d));
      if (added.length === 0) {
        showAppAlert(translate('aiAlreadyTagged'), translate('aiAlreadyTaggedMsg'));
        return;
      }
      setEditData(prev => ({
        ...prev,
        targetDiseases: [...prev.targetDiseases, ...added],
      }));
      showAppAlert(translate('aiSuggestionsAdded'), `${translate('aiAddedPrefix')}${added.join(', ')}`);
    } catch (err) {
      console.error('[MyListings] disease suggestion failed:', err);
      showAppAlert(translate('aiSuggestionFailed'), err?.message || translate('aiCouldNotReach'));
    } finally {
      setSuggestingEditDiseases(false);
    }
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
    // Defensive: editData can theoretically be cleared mid-modal (refetch, navigation),
    // and reading .productName off null would crash the screen.
    if (!editData) return;

    const productName = (editData.productName || '').trim();
    const priceStr = String(editData.price ?? '').trim();
    const description = (editData.description || '').trim();
    const location = (editData.location || '').trim();
    const phone = (editData.phone || '').trim();

    if (!productName || !priceStr || !description || !location || !phone) {
      showAppAlert(translate('common.error'), translate('pleaseFillFields'));
      return;
    }
    if (productName.length < 3) {
      showAppAlert(translate('common.error'), translate('minName'));
      return;
    }
    if (description.length < 10) {
      showAppAlert(translate('common.error'), translate('minDescription'));
      return;
    }
    const priceNum = Number(priceStr);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      showAppAlert(translate('common.error'), translate('invalidPriceMsg'));
      return;
    }
    if (priceNum > 9_999_999) {
      showAppAlert(translate('common.error'), translate('maxPriceMsg'));
      return;
    }
    if (!/^0\d{9}$/.test(phone.replace(/\s/g, ''))) {
      showAppAlert(translate('common.error'), translate('invalidPhoneMsg'));
      return;
    }
    if (editShowDiseaseField && (!Array.isArray(editData.targetDiseases) || editData.targetDiseases.length === 0)) {
      showAppAlert(translate('common.error'), translate('selectAtLeastOneDisease'));
      return;
    }
    if (editShowDiseaseField && !(editData.activeIngredient || '').trim()) {
      showAppAlert(translate('common.error'), translate('activeIngredientRequired'));
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
        targetDiseasesLower: normalizeTargetDiseasesForStorage(editData.targetDiseases),
      };
      await updateProduct(editData.id, updatePayload);
      setListings(prev => prev.map(l => l.id === editData.id ? { ...l, ...updatePayload } : l));
      setEditModalVisible(false);
      showAppAlert(translate('listingUpdated'), translate('listingUpdatedMsg'));
    } catch (error) {
      console.error('Error updating listing:', error);
      showAppAlert(translate('common.error'), translate('failedUpdate'));
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = (listing) => {
    showAppAlert(
      translate('confirmDelete'),
      translate('confirmDeleteMessage'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('deleteConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(listing.id);
              setListings(prev => prev.filter(l => l.id !== listing.id));
              showAppAlert(translate('deleted'), translate('deletedMsg'));
            } catch (error) {
              console.error('Error deleting listing:', error);
              showAppAlert(translate('common.error'), translate('failedDelete'));
            }
          },
        },
      ]
    );
  };

  const handleMarkSold = (listing) => {
    showAppAlert(
      translate('markSold'),
      translate('soldMessage'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('soldConfirm'),
          onPress: async () => {
            try {
              await updateProduct(listing.id, { status: 'sold' });
              setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: 'sold' } : l));
              showAppAlert(translate('listingUpdated'), translate('soldUpdatedMsg'));
            } catch (error) {
              console.error('Error updating listing:', error);
              showAppAlert(translate('common.error'), translate('failedUpdate'));
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
              <Text style={styles.headerTitle}>{translate('title')}</Text>
              <Text style={styles.headerSubtitle}>{translate('subtitle')}</Text>
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
                <Text style={styles.headerTitle}>{translate('title')}</Text>
                <Text style={styles.headerSubtitle}>{translate('subtitle')}</Text>
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
                <Text style={styles.statLabel}>{translate('totalListings')}</Text>
              </View>
              <View style={[styles.statCard, styles.statCardActive]}>
                <Text style={[styles.statValue, styles.statValueActive]}>{activeListingsCount}</Text>
                <Text style={styles.statLabel}>{translate('activeListings')}</Text>
              </View>
              <View style={[styles.statCard, styles.statCardSold]}>
                <Text style={[styles.statValue, styles.statValueSold]}>{soldListingsCount}</Text>
                <Text style={styles.statLabel}>{translate('soldListings')}</Text>
              </View>
            </Animated.View>

            {/* Pending notice */}
            {pendingCount > 0 && (
              <Animated.View style={[styles.pendingNotice, { opacity: fadeAnim }]}>
                <Icon name="clock-outline" size={16} color="#F59E0B" />
                <Text style={styles.pendingNoticeText}>
                  {pendingCount} listing{pendingCount > 1 ? 's' : ''} {translate('pendingBadge')}
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
                      translate={translate}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>📦</Text>
                  <Text style={styles.emptyStateTitle}>{translate('noListings')}</Text>
                  <Text style={styles.emptyStateText}>{translate('noListingsDesc')}</Text>
                  <TouchableOpacity
                    style={styles.addProductButton}
                    onPress={handleAddProduct}
                  >
                    <Icon name="plus" size={20} color="#FFFFFF" />
                    <Text style={styles.addProductButtonText}>{translate('addFirstProduct')}</Text>
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
                <Text style={styles.modalTitle}>{translate('edit')}</Text>
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
                    <Text style={styles.modalLabel}>{translate('common.productName')}</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editData.productName}
                      onChangeText={(text) => setEditData({ ...editData, productName: text })}
                    />

                    {/* Active Ingredient — only for pesticides/herbicides.
                        Sits above Target Diseases so it can power the AI Suggest button. */}
                    {editShowDiseaseField && (
                      <>
                        <Text style={styles.modalLabel}>{translate('activeIngredient')}</Text>
                        <TextInput
                          style={styles.modalInput}
                          value={editData.activeIngredient}
                          onChangeText={(text) => setEditData({ ...editData, activeIngredient: text })}
                          placeholder="e.g., Mancozeb 64% + Metalaxyl 8% WP"
                          placeholderTextColor="#999"
                        />
                      </>
                    )}

                    {/* Target Diseases — only for pesticides/herbicides */}
                    {editShowDiseaseField && (
                      <>
                        <View style={styles.editSuggestRow}>
                          <Text style={[styles.modalLabel, { flex: 1, marginBottom: 0 }]}>
                            {translate('targetDiseases')}
                          </Text>
                          <TouchableOpacity
                            style={[styles.editSuggestBtn, suggestingEditDiseases && { opacity: 0.6 }]}
                            onPress={handleSuggestEditDiseases}
                            disabled={suggestingEditDiseases}
                            activeOpacity={0.7}
                          >
                            {suggestingEditDiseases ? (
                              <ActivityIndicator size="small" color="#0F5132" />
                            ) : (
                              <>
                                <Icon name="auto-fix" size={14} color="#0F5132" />
                                <Text style={styles.editSuggestBtnText}>{translate('suggest')}</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={styles.editLocationSelector}
                          onPress={() => setShowEditDiseasePicker(true)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.editLocationText, editData.targetDiseases.length === 0 && { color: '#999' }]}>
                            {editData.targetDiseases.length > 0
                              ? translate('nSelected').replace('{0}', editData.targetDiseases.length)
                              : translate('selectDiseases')}
                          </Text>
                          <Icon name="chevron-down" size={18} color="#666" />
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
                      </>
                    )}

                    {/* Price + Quantity + Unit — alarm-style wheel sheet */}
                    <Text style={styles.modalLabel}>{translate('priceAndQuantity')}</Text>
                    <TouchableOpacity
                      style={styles.editPriceQtySummary}
                      onPress={() => setShowEditPriceSheet(true)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.editPriceQtyHint}>{translate('priceLabel')}</Text>
                        <Text style={styles.editPriceQtyValue}>
                          Rs. {editData.price ? Number(editData.price).toLocaleString() : '—'}
                        </Text>
                      </View>
                      <View style={styles.editPriceQtyDivider} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.editPriceQtyHint}>{translate('quantityLabel')}</Text>
                        <Text style={styles.editPriceQtyValue}>
                          {editData.quantity !== undefined && editData.quantity !== null && editData.quantity !== ''
                            ? `${editData.quantity} ${editData.unit || 'kg'}`
                            : '—'}
                        </Text>
                      </View>
                      <Icon name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>

                    <Text style={styles.modalLabel}>{translate('description')}</Text>
                    <TextInput
                      style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top' }]}
                      value={editData.description}
                      onChangeText={(text) => setEditData({ ...editData, description: text })}
                      multiline
                    />

                    {/* Location — city picker */}
                    <Text style={styles.modalLabel}>{translate('common.location')}</Text>
                    <TouchableOpacity
                      style={styles.editLocationSelector}
                      onPress={() => setShowEditCityPicker(true)}
                      activeOpacity={0.7}
                    >
                      <Icon name="map-marker" size={16} color={editData.location ? '#0F5132' : '#999'} />
                      <Text style={[styles.editLocationText, !editData.location && { color: '#999' }]}>
                        {editData.location || translate('selectCity')}
                      </Text>
                      <Icon name="chevron-down" size={18} color="#666" />
                    </TouchableOpacity>

                    <Text style={styles.modalLabel}>{translate('phone')}</Text>
                    <PhoneInput
                      value={editData.phone}
                      onChangeText={(next) => setEditData({ ...editData, phone: next })}
                    />
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
                  <Text style={styles.modalSaveText}>{editSaving ? '...' : translate('saveChanges')}</Text>
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

        {/* Disease picker for edit modal — bottom sheet, multi-select */}
        <Modal
          visible={showEditDiseasePicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowEditDiseasePicker(false)}
        >
          <View style={styles.editSheetOverlay}>
            <TouchableOpacity
              style={styles.editSheetDismiss}
              activeOpacity={1}
              onPress={() => setShowEditDiseasePicker(false)}
            />
            <View style={[styles.editSheet, styles.editSheetTall, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <View style={styles.editSheetHandle} />
              <View style={styles.editSheetHeader}>
                <Text style={styles.editSheetTitle}>{translate('selectDiseasesHeader')}</Text>
                <TouchableOpacity
                  style={styles.editSheetClose}
                  onPress={() => setShowEditDiseasePicker(false)}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator>
                {DISEASE_OPTIONS.map(disease => {
                  const isSel = editData?.targetDiseases?.includes(disease);
                  return (
                    <TouchableOpacity
                      key={disease}
                      style={[styles.editSheetRow, isSel && styles.editSheetRowSelected]}
                      onPress={() => toggleEditDisease(disease)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={isSel ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={20}
                        color={isSel ? '#0F5132' : '#999'}
                        style={{ marginRight: 12 }}
                      />
                      <Text style={[styles.editSheetRowText, isSel && styles.editSheetRowTextSelected]}>
                        {disease}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                style={styles.editSheetDoneBtn}
                onPress={() => setShowEditDiseasePicker(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.editSheetDoneText}>
                  {translate('done')} {editData?.targetDiseases?.length ? `(${editData.targetDiseases.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Price + Quantity + Unit wheel sheet */}
        <PriceQuantitySheet
          visible={showEditPriceSheet}
          price={editData?.price ?? ''}
          quantity={editData?.quantity ?? ''}
          unit={editData?.unit ?? 'kg'}
          unitOptions={UNIT_OPTIONS}
          onClose={() => setShowEditPriceSheet(false)}
          onConfirm={({ price, quantity, unit }) => {
            setEditData(prev => prev ? { ...prev, price, quantity, unit } : prev);
          }}
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
  editSuggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 6,
  },
  editSuggestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F7F3',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.25)',
    minWidth: 88,
    justifyContent: 'center',
  },
  editSuggestBtnText: {
    fontSize: 12,
    color: '#0F5132',
    fontWeight: '700',
  },
  editPriceQtySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 60,
  },
  editPriceQtyHint: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  editPriceQtyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  editPriceQtyDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: 12,
  },
  editSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  editSheetDismiss: {
    flex: 1,
  },
  editSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: '60%',
  },
  editSheetTall: {
    maxHeight: '80%',
  },
  editSheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginBottom: 8,
  },
  editSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 4,
  },
  editSheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  editSheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  editSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 4,
  },
  editSheetRowSelected: {
    backgroundColor: '#F0F7F3',
  },
  editSheetRowText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  editSheetRowTextSelected: {
    color: '#0F5132',
    fontWeight: '700',
  },
  editSheetDoneBtn: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0F5132',
  },
  editSheetDoneText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
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
