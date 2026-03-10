import React, { useState } from 'react';
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
  Alert,
  Animated,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../src/context/LanguageContext';
import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getApprovedProducts } from '../src/services/marketplaceService';

const { width, height } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    title: 'Marketplace',
    subtitle: 'Buy & Sell Paddy Products',
    searchPlaceholder: 'Search products...',
    categories: 'Categories',
    allProducts: 'All Products',
    seeds: 'Seeds',
    fertilizers: 'Fertilizers',
    tools: 'Tools & Equipment',
    pesticides: 'Pesticides',
    herbicides: 'Herbicides',
    addProduct: 'Add Product',
    price: 'Price',
    location: 'Location',
    seller: 'Seller',
    contact: 'Contact Seller',
    noProducts: 'No products available',
    noProductsDesc: 'Be the first to list your product!',
    featured: 'Featured Products',
    recent: 'Recent Listings',
    filter: 'Filter',
    sort: 'Sort',
    priceLow: 'Price: Low to High',
    priceHigh: 'Price: High to Low',
    newest: 'Newest First',
    oldest: 'Oldest First',
    myListings: 'My Listings',
  },
  සිංහල: {
    title: 'වෙළඳපොළ',
    subtitle: 'වී නිෂ්පාදන මිලදී ගන්න සහ විකිණීම',
    searchPlaceholder: 'නිෂ්පාදන සොයන්න...',
    categories: 'කාණ්ඩ',
    allProducts: 'සියලුම නිෂ්පාදන',
    seeds: 'බීජ',
    fertilizers: 'සාරවත් පොහොර',
    tools: 'මෙවලම් සහ උපකරණ',
    pesticides: 'කෘමිනාශක',
    herbicides: 'වල් නාශක',
    addProduct: 'නිෂ්පාදනයක් එක් කරන්න',
    price: 'මිල',
    location: 'ස්ථානය',
    seller: 'විකුණන්නා',
    contact: 'විකුණන්නා හා සම්බන්ධ වන්න',
    noProducts: 'නිෂ්පාදන නොමැත',
    noProductsDesc: 'පළමුව ඔබේ නිෂ්පාදනය ලැයිස්තුගත කරන්න!',
    featured: 'විශේෂ නිෂ්පාදන',
    recent: 'මෑත ලැයිස්තු',
    filter: 'පෙරහන',
    sort: 'වර්ගීකරණය',
    priceLow: 'මිල: අඩු සිට ඉහළ',
    priceHigh: 'මිල: ඉහළ සිට අඩු',
    newest: 'නවතම',
    oldest: 'පැරණිතම',
    myListings: 'මගේ ලැයිස්තු',
  },
  தமிழ்: {
    title: 'சந்தை',
    subtitle: 'நெல் தயாரிப்புகளை வாங்கவும் விற்கவும்',
    searchPlaceholder: 'தயாரிப்புகளைத் தேடவும்...',
    categories: 'வகைகள்',
    allProducts: 'அனைத்து தயாரிப்புகள்',
    seeds: 'விதைகள்',
    fertilizers: 'உரங்கள்',
    tools: 'கருவிகள் மற்றும் உபகரணங்கள்',
    pesticides: 'பூச்சிக்கொல்லிகள்',
    herbicides: 'களைக்கொல்லிகள்',
    addProduct: 'தயாரிப்பைச் சேர்க்கவும்',
    price: 'விலை',
    location: 'இடம்',
    seller: 'விற்பனையாளர்',
    contact: 'விற்பனையாளரைத் தொடர்பு கொள்ளுங்கள்',
    noProducts: 'தயாரிப்புகள் இல்லை',
    noProductsDesc: 'முதல் தயாரிப்பை பட்டியலிடுங்கள்!',
    featured: 'சிறப்பு தயாரிப்புகள்',
    recent: 'சமீபத்திய பட்டியல்கள்',
    filter: 'வடிகட்டு',
    sort: 'வரிசைப்படுத்து',
    priceLow: 'விலை: குறைந்தது முதல் அதிகம்',
    priceHigh: 'விலை: அதிகம் முதல் குறைந்தது',
    newest: 'புதியது முதலில்',
    oldest: 'பழையது முதலில்',
    myListings: 'எனது பட்டியல்கள்',
  },
};

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

const ProductCard = ({ product, onContact, onPress }) => (
  <TouchableOpacity style={styles.productCard} activeOpacity={0.7} onPress={() => onPress(product)}>
    <View style={styles.productImageContainer}>
      <View style={styles.productImagePlaceholder}>
        <Text style={styles.productImageEmoji}>{categoryEmojis[product.category] || '📦'}</Text>
      </View>
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
  const { selectedLanguage } = useLanguage();
  const { isAuthenticated, isOfficer } = useAuth();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState(route?.params?.searchQuery || '');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchProducts = async (category = null) => {
    try {
      setLoading(true);
      const data = await getApprovedProducts(category);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch products every time the screen comes into focus or category changes
  useFocusEffect(
    React.useCallback(() => {
      fetchProducts(selectedCategory === 'all' ? null : selectedCategory);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, [selectedCategory])
  );

  const categories = [
    { id: 'all', label: t.allProducts, icon: '📦' },
    { id: 'seeds', label: t.seeds, icon: '🌾' },
    { id: 'fertilizers', label: t.fertilizers, icon: '🌱' },
    { id: 'tools', label: t.tools, icon: '🔧' },
    { id: 'pesticides', label: t.pesticides, icon: '🛡️' },
    { id: 'herbicides', label: t.herbicides, icon: '🧪' },
  ];

  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const name = (product.productName || product.title || '').toLowerCase();
    const desc = (product.description || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || desc.includes(q);
  });

  const handleProductPress = (product) => {
    setSelectedProduct(product);
    setDetailModalVisible(true);
  };

  const handleCall = (phone) => {
    const url = Platform.OS === 'ios' ? `telprompt:${phone}` : `tel:${phone}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open phone dialer.'));
  };

  const handleContact = (product) => {
    if (!isAuthenticated) {
      setDetailModalVisible(false);
      setTimeout(() => {
        Alert.alert(
          'Login Required',
          'Please login to contact sellers.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => navigation.navigate('Login') },
          ]
        );
      }, 300);
    } else if (product.phone) {
      handleCall(product.phone);
    }
  };

  const handleAddProduct = () => {
    if (isOfficer) {
      Alert.alert(
        'Access Restricted',
        'Officers cannot list products in the marketplace.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to add products.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
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

            {/* Categories */}
            <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitle}>{t.categories}</Text>
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
                  {selectedCategory === 'all' ? t.allProducts : categories.find(c => c.id === selectedCategory)?.label}
                </Text>
                <Text style={styles.productCount}>{filteredProducts.length} items</Text>
              </View>
              {filteredProducts.length > 0 ? (
                <View style={styles.productsGrid}>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onContact={handleContact}
                      onPress={handleProductPress}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>📦</Text>
                  <Text style={styles.emptyStateTitle}>{t.noProducts}</Text>
                  <Text style={styles.emptyStateText}>{t.noProductsDesc}</Text>
                  {isAuthenticated && !isOfficer && (
                    <TouchableOpacity
                      style={styles.addProductButton}
                      onPress={handleAddProduct}
                    >
                      <Icon name="plus" size={20} color="#FFFFFF" />
                      <Text style={styles.addProductButtonText}>{t.addProduct}</Text>
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

                  {/* Product Emoji */}
                  <View style={styles.modalEmojiContainer}>
                    <View style={styles.modalEmojiBg}>
                      <Text style={styles.modalEmoji}>
                        {categoryEmojis[selectedProduct.category] || '📦'}
                      </Text>
                    </View>
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
                          {selectedProduct.quantity > 0 ? ` (${selectedProduct.quantity} available)` : ''}
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
                      <Text style={styles.modalInfoTitle}>Seller Details</Text>
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
                      <Text style={styles.modalCloseBtnText}>Close</Text>
                    </TouchableOpacity>
                    {selectedProduct.phone && (
                      <TouchableOpacity
                        style={styles.modalContactBtn}
                        onPress={() => handleContact(selectedProduct)}
                      >
                        <Icon name="phone" size={20} color="#FFFFFF" />
                        <Text style={styles.modalContactBtnText}>Contact Seller</Text>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
  productImagePlaceholder: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageEmoji: {
    fontSize: 48,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 4,
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
  // --- Product Detail Modal ---
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

