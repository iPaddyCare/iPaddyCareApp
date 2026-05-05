import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  TextInput,
  Modal,
  Animated,
  Linking,
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
import { getApprovedProducts, incrementProductViews } from '../src/services/marketplaceService';
import { getDiseaseMatchKeySet, diseaseLabelMatchesKeys } from '../src/services/diseaseMatching';
import { SL_DISTRICTS } from '../src/components/CityPickerModal';

const { width, height } = Dimensions.get('window');

const categoryEmojis = {
  seeds: '🌾',
  fertilizers: '🌱',
  tools: '🔧',
  pesticides: '🛡️',
  herbicides: '🧪',
};

const CategoryButton = ({ category, label, icon, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.categoryIcon}>{icon}</Text>
    <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ProductCard = ({ product, onPress }) => (
  <TouchableOpacity style={styles.productCard} activeOpacity={0.7} onPress={() => onPress(product)}>
    <View style={styles.productImageContainer}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.productImageEmoji}>{categoryEmojis[product.category] || '📦'}</Text>
        </View>
      )}
    </View>
    <View style={styles.productContent}>
      <Text style={styles.productTitle} numberOfLines={1}>{product.productName || product.title}</Text>
      <Text style={styles.productDescription} numberOfLines={1}>
        {product.description}
      </Text>
      <View style={styles.productFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Rs.</Text>
          <Text style={styles.priceValue}>{product.price?.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.locationContainer}>
        <Icon name="map-marker" size={14} color="#666" />
        <Text style={styles.locationText} numberOfLines={1}>{product.location}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function MarketplaceScreen({ navigation, route }) {
  const translate = useTranslation('marketplace');
  const { isAuthenticated, isOfficer } = useAuth();
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [searchQuery, setSearchQuery] = useState(route?.params?.searchQuery || '');
  const [sortBy, setSortBy] = useState('newest');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchProducts = async (category = null, reset = true) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      const result = await getApprovedProducts(category, reset ? null : lastDoc);
      if (reset) {
        setProducts(result.products);
      } else {
        setProducts(prev => [...prev, ...result.products]);
      }
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      const msg = error?.message || String(error);
      console.error('Error fetching products:', msg);
      if (error?.code) {
        console.error('Firestore code:', error.code);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;
    await fetchProducts(selectedCategory === 'all' ? null : selectedCategory, false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await getApprovedProducts(selectedCategory === 'all' ? null : selectedCategory, null);
      setProducts(result.products);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      const msg = error?.message || String(error);
      console.error('Error refreshing products:', msg);
      if (error?.code) {
        console.error('Firestore code:', error.code);
      }
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts(selectedCategory === 'all' ? null : selectedCategory, true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, [selectedCategory])
  );

  const categories = [
    { id: 'all', label: translate('allProducts'), icon: '📦' },
    { id: 'seeds', label: translate('seeds'), icon: '🌾' },
    { id: 'fertilizers', label: translate('fertilizers'), icon: '🌱' },
    { id: 'tools', label: translate('tools'), icon: '🔧' },
    { id: 'pesticides', label: translate('pesticides'), icon: '🛡️' },
    { id: 'herbicides', label: translate('herbicides'), icon: '🧪' },
  ];

  // Expand the search query into a set of normalized disease keys (covers aliases like
  // "brown spot" → its model_var / display name / aliases). Empty set if query isn't a
  // recognised disease name — in which case we just fall back to text matching.
  const diseaseMatchKeys = React.useMemo(
    () => (searchQuery ? getDiseaseMatchKeySet(searchQuery) : new Set()),
    [searchQuery],
  );

  const filteredProducts = [...products
    .filter((product) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = (product.productName || product.title || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const loc = (product.location || '').toLowerCase();
        const ingredient = (product.activeIngredient || '').toLowerCase();

        const textMatch =
          name.includes(q) ||
          desc.includes(q) ||
          loc.includes(q) ||
          ingredient.includes(q);

        // Disease-tag match: compare each tag on the product against the expanded key set
        let diseaseMatch = false;
        if (diseaseMatchKeys.size > 0) {
          const tags = Array.isArray(product.targetDiseases) ? product.targetDiseases : [];
          const tagsLower = Array.isArray(product.targetDiseasesLower) ? product.targetDiseasesLower : [];
          diseaseMatch =
            tags.some(tag => diseaseLabelMatchesKeys(tag, diseaseMatchKeys)) ||
            tagsLower.some(tag => diseaseMatchKeys.has(tag));
        }

        if (!textMatch && !diseaseMatch) return false;
      }
      if (selectedDistrict && product.location !== selectedDistrict) return false;
      return true;
    })
  ].sort((a, b) => {
    if (sortBy === 'priceLow') return a.price - b.price;
    if (sortBy === 'priceHigh') return b.price - a.price;
    if (sortBy === 'oldest') return a.createdAt - b.createdAt;
    return b.createdAt - a.createdAt;
  });

  // Search and district are client-side filters, so the server's `hasMore` reflects
  // the unfiltered page — not whether more *matching* items exist. When a client filter
  // is active and the visible list is empty, auto-paginate through the server results
  // until matches appear or the server is exhausted, capped to avoid runaway fetches.
  const autoLoadCountRef = useRef(0);
  const MAX_AUTO_LOADS = 5;

  useEffect(() => {
    autoLoadCountRef.current = 0;
  }, [searchQuery, selectedDistrict, selectedCategory]);

  useEffect(() => {
    const hasClientFilter = !!searchQuery || !!selectedDistrict;
    if (
      hasClientFilter &&
      filteredProducts.length === 0 &&
      hasMore &&
      !loading &&
      !loadingMore &&
      autoLoadCountRef.current < MAX_AUTO_LOADS
    ) {
      autoLoadCountRef.current += 1;
      fetchProducts(selectedCategory === 'all' ? null : selectedCategory, false);
    }
  }, [filteredProducts.length, hasMore, loading, loadingMore, searchQuery, selectedDistrict, selectedCategory]);

  const handleProductPress = (product) => {
    setSelectedProduct(product);
    setDetailModalVisible(true);
    incrementProductViews(product.id).catch(() => {});
  };

  const handleCall = (phone) => {
    const url = Platform.OS === 'ios' ? `telprompt:${phone}` : `tel:${phone}`;
    Linking.openURL(url).catch(() => showAppAlert(translate('common.error'), translate('couldNotDial')));
  };

  const handleContact = (product) => {
    if (!isAuthenticated) {
      setDetailModalVisible(false);
      setTimeout(() => {
        showAppAlert(
          translate('common.loginRequired'),
          translate('loginToContact'),
          [
            { text: translate('cancel'), style: 'cancel' },
            { text: translate('login'), onPress: () => navigation.navigate('Login') },
          ]
        );
      }, 300);
    } else if (product.phone) {
      handleCall(product.phone);
    }
  };

  const handleAddProduct = () => {
    if (isOfficer) {
      showAppAlert(
        translate('common.accessRestricted'),
        translate('officersCannotList'),
        [{ text: 'OK' }]
      );
      return;
    }

    if (!isAuthenticated) {
      showAppAlert(
        translate('common.loginRequired'),
        translate('loginToAdd'),
        [
          { text: translate('cancel'), style: 'cancel' },
          { text: translate('login'), onPress: () => navigation.navigate('Login') },
        ]
      );
    } else {
      navigation.navigate('AddProduct');
    }
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
              {isOfficer ? (
                <TouchableOpacity
                  style={styles.approvalButton}
                  onPress={() => navigation.navigate('ProductApproval')}
                >
                  <Icon name="check-circle" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddProduct}
                >
                  <Icon name="plus" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
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

            {/* Sort Pills */}
            <Animated.View style={[styles.sortContainer, { opacity: fadeAnim }]}>
              {[
                { id: 'newest', label: translate('newest') },
                { id: 'priceLow', label: translate('priceLow') },
                { id: 'priceHigh', label: translate('priceHigh') },
                { id: 'oldest', label: translate('oldest') },
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.sortPill, sortBy === option.id && styles.sortPillActive]}
                  onPress={() => setSortBy(option.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sortPillText, sortBy === option.id && styles.sortPillTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>

            {/* District filter pills */}
            <Animated.View style={[{ opacity: fadeAnim }, { marginBottom: 20 }]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.districtPillsContainer}
              >
                <TouchableOpacity
                  style={[styles.districtPill, !selectedDistrict && styles.districtPillActive]}
                  onPress={() => setSelectedDistrict(null)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.districtPillText, !selectedDistrict && styles.districtPillTextActive]}>
                    {translate('allDistricts')}
                  </Text>
                </TouchableOpacity>
                {SL_DISTRICTS.map(district => (
                  <TouchableOpacity
                    key={district}
                    style={[styles.districtPill, selectedDistrict === district && styles.districtPillActive]}
                    onPress={() => setSelectedDistrict(selectedDistrict === district ? null : district)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="map-marker"
                      size={12}
                      color={selectedDistrict === district ? '#FFFFFF' : '#666'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.districtPillText, selectedDistrict === district && styles.districtPillTextActive]}>
                      {district}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Categories */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{translate('categories')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {categories.map((category) => (
                  <CategoryButton
                    key={category.id}
                    category={category.id}
                    label={category.label}
                    icon={category.icon}
                    isActive={selectedCategory === category.id}
                    onPress={() => setSelectedCategory(category.id)}
                  />
                ))}
              </ScrollView>
            </Animated.View>

            {/* Products Grid */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <View style={styles.productsHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === 'all' ? translate('allProducts') : categories.find(c => c.id === selectedCategory)?.label}
                </Text>
                <Text style={styles.productCount}>{filteredProducts.length} items</Text>
              </View>
              {loading ? (
                <ActivityIndicator size="large" color="#0F5132" style={{ marginTop: 40 }} />
              ) : filteredProducts.length > 0 ? (
                <>
                  <View style={styles.productsGrid}>
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onPress={handleProductPress}
                      />
                    ))}
                  </View>
                  {hasMore && (
                    <TouchableOpacity
                      style={styles.loadMoreBtn}
                      onPress={handleLoadMore}
                      disabled={loadingMore}
                      activeOpacity={0.7}
                    >
                      {loadingMore ? (
                        <ActivityIndicator size="small" color="#0F5132" />
                      ) : (
                        <Text style={styles.loadMoreText}>{translate('loadMore')}</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              ) : loadingMore ? (
                <ActivityIndicator size="large" color="#0F5132" style={{ marginTop: 40 }} />
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>📦</Text>
                  <Text style={styles.emptyStateTitle}>{translate('noProducts')}</Text>
                  <Text style={styles.emptyStateText}>{translate('noProductsDesc')}</Text>
                  {isAuthenticated && !isOfficer && (
                    <TouchableOpacity
                      style={styles.addProductButton}
                      onPress={handleAddProduct}
                    >
                      <Icon name="plus" size={20} color="#FFFFFF" />
                      <Text style={styles.addProductButtonText}>{translate('addProduct')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </Animated.View>
          </View>
        </ScrollView>

        {/* Product Detail Modal */}
        <Modal visible={detailModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalDismissArea}
              activeOpacity={1}
              onPress={() => setDetailModalVisible(false)}
            />
            <View style={styles.modalContent}>
              {selectedProduct && (
                <>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalDragHandle} />
                  </View>

                  {/* Product Image / Emoji */}
                  <View style={styles.modalEmojiContainer}>
                    {selectedProduct.imageUrl ? (
                      <Image source={{ uri: selectedProduct.imageUrl }} style={styles.modalProductImage} />
                    ) : (
                      <View style={styles.modalEmojiBg}>
                        <Text style={styles.modalEmoji}>
                          {categoryEmojis[selectedProduct.category] || '📦'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.modalCategoryBadge}>
                      <Text style={styles.modalCategoryText}>
                        {(selectedProduct.category || '').charAt(0).toUpperCase() + (selectedProduct.category || '').slice(1)}
                      </Text>
                    </View>
                  </View>

                  {/* Product Info */}
                  <ScrollView
                    style={styles.modalBody}
                    contentContainerStyle={{ paddingBottom: 8 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.modalProductName}>
                      {selectedProduct.productName || selectedProduct.title}
                    </Text>

                    <View style={styles.modalPriceRow}>
                      <Text style={styles.modalPriceLabel}>Rs.</Text>
                      <Text style={styles.modalPriceValue}>
                        {selectedProduct.price?.toLocaleString()}
                      </Text>
                    </View>

                    {selectedProduct.quantity != null && (
                      <View style={styles.modalStockRow}>
                        <Icon
                          name={selectedProduct.quantity > 5 ? 'check-circle' : selectedProduct.quantity > 0 ? 'alert-circle' : 'close-circle'}
                          size={16}
                          color={selectedProduct.quantity > 5 ? '#10B981' : selectedProduct.quantity > 0 ? '#F59E0B' : '#EF4444'}
                        />
                        <Text style={[
                          styles.modalStockText,
                          { color: selectedProduct.quantity > 5 ? '#10B981' : selectedProduct.quantity > 0 ? '#F59E0B' : '#EF4444' },
                        ]}>
                          {selectedProduct.quantity > 5 ? 'In Stock' : selectedProduct.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                          {selectedProduct.quantity > 0
                            ? ` (${selectedProduct.quantity}${selectedProduct.unit ? ` ${selectedProduct.unit}` : ''} available)`
                            : ''}
                        </Text>
                      </View>
                    )}

                    {selectedProduct.activeIngredient ? (
                      <View style={styles.modalIngredientRow}>
                        <Icon name="flask" size={16} color="#0F5132" />
                        <Text style={styles.modalIngredientText}>
                          {selectedProduct.activeIngredient}
                        </Text>
                      </View>
                    ) : null}

                    <Text style={styles.modalDescription}>
                      {selectedProduct.description}
                    </Text>

                    <View style={styles.modalDivider} />

                    {/* Seller Info */}
                    <View style={styles.modalInfoSection}>
                      <Text style={styles.modalInfoTitle}>{translate('sellerDetails')}</Text>
                      <View style={styles.modalInfoRow}>
                        <View style={styles.modalInfoIcon}>
                          <Icon name="account" size={18} color="#0F5132" />
                        </View>
                        <Text style={styles.modalInfoText}>{selectedProduct.seller}</Text>
                      </View>
                      <View style={styles.modalInfoRow}>
                        <View style={styles.modalInfoIcon}>
                          <Icon name="map-marker" size={18} color="#0F5132" />
                        </View>
                        <Text style={styles.modalInfoText}>{selectedProduct.location}</Text>
                      </View>
                      {selectedProduct.phone && (
                        <View style={styles.modalInfoRow}>
                          <View style={styles.modalInfoIcon}>
                            <Icon name="phone" size={18} color="#0F5132" />
                          </View>
                          <Text style={styles.modalInfoText}>{selectedProduct.phone}</Text>
                        </View>
                      )}
                    </View>
                  </ScrollView>

                  {/* Action Buttons */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalCloseBtn}
                      onPress={() => setDetailModalVisible(false)}
                    >
                      <Text style={styles.modalCloseBtnText}>{translate('close')}</Text>
                    </TouchableOpacity>
                    {selectedProduct.phone && (
                      <TouchableOpacity
                        style={styles.modalContactBtn}
                        onPress={() => handleContact(selectedProduct)}
                      >
                        <Icon name="phone" size={20} color="#FFFFFF" />
                        <Text style={styles.modalContactBtnText}>{translate('contactSeller')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
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
  approvalButton: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
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
  sortContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  sortPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sortPillActive: {
    backgroundColor: '#0F5132',
    borderColor: '#0F5132',
  },
  sortPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  sortPillTextActive: {
    color: '#FFFFFF',
  },
  districtPillsContainer: {
    paddingRight: 20,
  },
  districtPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  districtPillActive: {
    backgroundColor: '#0F5132',
    borderColor: '#0F5132',
  },
  districtPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  districtPillTextActive: {
    color: '#FFFFFF',
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
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryButton: {
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
  categoryButtonActive: {
    backgroundColor: '#0F5132',
    borderColor: '#0F5132',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageEmoji: {
    fontSize: 48,
  },
  productContent: {
    padding: 10,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  productDescription: {
    fontSize: 11,
    color: '#888',
    marginBottom: 6,
  },
  productFooter: {
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: 11,
    color: '#666',
    marginRight: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F5132',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    flex: 1,
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
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.2)',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F5132',
  },
  // Product Detail Modal
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
    maxHeight: '82%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
  },
  modalEmojiContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  modalProductImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  modalEmojiBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#F0F7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E0EDE6',
  },
  modalEmoji: {
    fontSize: 40,
  },
  modalCategoryBadge: {
    backgroundColor: '#0F5132',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalCategoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalBody: {
    paddingHorizontal: 24,
  },
  modalProductName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalPriceLabel: {
    fontSize: 16,
    color: '#0F5132',
    fontWeight: '600',
    marginRight: 4,
  },
  modalPriceValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F5132',
  },
  modalDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  modalInfoSection: {
    marginBottom: 8,
  },
  modalInfoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalInfoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F0F7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalInfoText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  modalCloseBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
  modalContactBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: '#0F5132',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalContactBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalIngredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0F7F3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.1)',
  },
  modalIngredientText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F5132',
  },
  modalStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  modalStockText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
