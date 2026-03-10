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
    title: 'Marketplace',
    subtitle: 'Buy & Sell Paddy Products',
    searchPlaceholder: 'Search products...',
    categories: 'Categories',
    allProducts: 'All Products',
    seeds: 'Seeds',
    fertilizers: 'Fertilizers',
    tools: 'Tools & Equipment',
    pesticides: 'Pesticides',
    organic: 'Organic Products',
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
    organic: 'කාබනික නිෂ්පාදන',
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
    organic: 'கரிம தயாரிப்புகள்',
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

// Sample product data (in a real app, this would come from a backend)
const sampleProducts = [
  {
    id: 1,
    title: 'Premium Paddy Seeds - Variety A',
    category: 'seeds',
    price: 2500,
    location: 'Colombo',
    seller: 'Farm Fresh Co.',
    image: '🌾',
    featured: true,
    description: 'High quality paddy seeds with 95% germination rate',
    status: 'approved',
  },
  {
    id: 2,
    title: 'Organic Fertilizer 50kg',
    category: 'fertilizers',
    price: 3500,
    location: 'Kandy',
    seller: 'Green Farm',
    image: '🌱',
    featured: true,
    description: 'Natural organic fertilizer for healthy crop growth',
    status: 'approved',
  },
  {
    id: 3,
    title: 'Harvesting Tools Set',
    category: 'tools',
    price: 4500,
    location: 'Gampaha',
    seller: 'Agri Tools',
    image: '🔧',
    featured: false,
    description: 'Complete set of harvesting tools for paddy farming',
    status: 'approved',
  },
  {
    id: 4,
    title: 'Eco-Friendly Pesticide',
    category: 'pesticides',
    price: 1800,
    location: 'Matale',
    seller: 'Safe Crop',
    image: '🛡️',
    featured: false,
    description: 'Environmentally safe pesticide for pest control',
    status: 'approved',
  },
  {
    id: 5,
    title: 'Organic Paddy Seeds',
    category: 'organic',
    price: 3200,
    location: 'Anuradhapura',
    seller: 'Organic Farms',
    image: '🌾',
    featured: true,
    description: 'Certified organic paddy seeds',
    status: 'approved',
  },
  {
    id: 6,
    title: 'NPK Fertilizer 25kg',
    category: 'fertilizers',
    price: 2200,
    location: 'Kurunegala',
    seller: 'Crop Care',
    image: '🌱',
    featured: false,
    description: 'Balanced NPK fertilizer for optimal growth',
    status: 'approved',
  },
].filter(product => product.status === 'approved' || !product.status); // Only show approved products

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

const ProductCard = ({ product, onContact }) => (
  <TouchableOpacity style={styles.productCard} activeOpacity={0.9}>
    <View style={styles.productImageContainer}>
      <View style={styles.productImagePlaceholder}>
        <Text style={styles.productImageEmoji}>{product.image}</Text>
      </View>
      {product.featured && (
        <View style={styles.featuredBadge}>
          <Icon name="star" size={12} color="#FFD700" />
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
    </View>
    <View style={styles.productContent}>
      <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
      <Text style={styles.productDescription} numberOfLines={2}>
        {product.description}
      </Text>
      <View style={styles.productFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Rs.</Text>
          <Text style={styles.priceValue}>{product.price.toLocaleString()}</Text>
        </View>
        <View style={styles.locationContainer}>
          <Icon name="map-marker" size={14} color="#666" />
          <Text style={styles.locationText}>{product.location}</Text>
        </View>
      </View>
      <View style={styles.sellerContainer}>
        <Icon name="account" size={14} color="#666" />
        <Text style={styles.sellerText}>{product.seller}</Text>
      </View>
      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => onContact(product)}
        activeOpacity={0.7}
      >
        <Icon name="phone" size={16} color="#FFFFFF" />
        <Text style={styles.contactButtonText}>Contact Seller</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function MarketplaceScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const { isAuthenticated, isOfficer } = useAuth();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products] = useState(sampleProducts);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const categories = [
    { id: 'all', label: t.allProducts, icon: '📦' },
    { id: 'seeds', label: t.seeds, icon: '🌾' },
    { id: 'fertilizers', label: t.fertilizers, icon: '🌱' },
    { id: 'tools', label: t.tools, icon: '🔧' },
    { id: 'pesticides', label: t.pesticides, icon: '🛡️' },
    { id: 'organic', label: t.organic, icon: '✨' },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContact = (product) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to contact sellers.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
    } else {
      Alert.alert(
        'Contact Seller',
        `Contact ${product.seller} about "${product.title}"`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => console.log('Call seller') },
          { text: 'Message', onPress: () => console.log('Message seller') },
        ]
      );
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
    padding: 12,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    lineHeight: 20,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 2,
  },
  priceValue: {
    fontSize: 18,
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
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sellerText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
});

