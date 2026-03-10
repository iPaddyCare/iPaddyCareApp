import React, { useState, useEffect } from 'react';
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
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../src/context/LanguageContext';
import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPendingProducts, updateProductStatus } from '../src/services/marketplaceService';

const { width } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    title: 'Product Approvals',
    subtitle: 'Review and approve listings',
    pending: 'Pending Approval',
    approved: 'Approved',
    declined: 'Declined',
    noPending: 'No pending approvals',
    noPendingDesc: 'All listings have been reviewed',
    approve: 'Approve',
    decline: 'Decline',
    viewDetails: 'View Details',
    productName: 'Product Name',
    category: 'Category',
    price: 'Price',
    location: 'Location',
    seller: 'Seller',
    description: 'Description',
    approveConfirm: 'Approve Listing',
    approveMessage: 'Are you sure you want to approve this listing?',
    declineConfirm: 'Decline Listing',
    declineMessage: 'Are you sure you want to decline this listing?',
    reason: 'Reason (Optional)',
    reasonPlaceholder: 'Enter reason for decline...',
    approvedSuccess: 'Listing Approved',
    approvedMessage: 'The listing has been approved and is now visible in the marketplace.',
    declinedSuccess: 'Listing Declined',
    declinedMessage: 'The listing has been declined and removed.',
    cancel: 'Cancel',
    confirm: 'Confirm',
    status: 'Status',
    submitted: 'Submitted',
    lastUpdated: 'Last Updated',
  },
  සිංහල: {
    title: 'නිෂ්පාදන අනුමත කිරීම්',
    subtitle: 'ලැයිස්තු සමාලෝචනය කර අනුමත කරන්න',
    pending: 'අනුමත කිරීමට අපේක්ෂාවෙන්',
    approved: 'අනුමත කරන ලදී',
    declined: 'ප්‍රතික්ෂේප කරන ලදී',
    noPending: 'අපේක්ෂිත අනුමත කිරීම් නොමැත',
    noPendingDesc: 'සියලුම ලැයිස්තු සමාලෝචනය කර ඇත',
    approve: 'අනුමත කරන්න',
    decline: 'ප්‍රතික්ෂේප කරන්න',
    viewDetails: 'විස්තර බලන්න',
    productName: 'නිෂ්පාදන නම',
    category: 'කාණ්ඩය',
    price: 'මිල',
    location: 'ස්ථානය',
    seller: 'විකුණන්නා',
    description: 'විස්තර',
    approveConfirm: 'ලැයිස්තුව අනුමත කරන්න',
    approveMessage: 'ඔබට මෙම ලැයිස්තුව අනුමත කිරීමට අවශ්‍යද?',
    declineConfirm: 'ලැයිස්තුව ප්‍රතික්ෂේප කරන්න',
    declineMessage: 'ඔබට මෙම ලැයිස්තුව ප්‍රතික්ෂේප කිරීමට අවශ්‍යද?',
    reason: 'හේතුව (විකල්ප)',
    reasonPlaceholder: 'ප්‍රතික්ෂේප කිරීමේ හේතුව ඇතුළත් කරන්න...',
    approvedSuccess: 'ලැයිස්තුව අනුමත කරන ලදී',
    approvedMessage: 'ලැයිස්තුව අනුමත කරන ලද අතර දැන් වෙළඳපොළේ දෘශ්‍යමාන වේ.',
    declinedSuccess: 'ලැයිස්තුව ප්‍රතික්ෂේප කරන ලදී',
    declinedMessage: 'ලැයිස්තුව ප්‍රතික්ෂේප කරන ලද අතර ඉවත් කරන ලදී.',
    cancel: 'අවලංගු කරන්න',
    confirm: 'තහවුරු කරන්න',
    status: 'තත්වය',
    submitted: 'ඉදිරිපත් කරන ලදී',
    lastUpdated: 'අවසානයේ යාවත්කාලීන කරන ලදී',
  },
  தமிழ்: {
    title: 'தயாரிப்பு அனுமதிகள்',
    subtitle: 'பட்டியல்களை மதிப்பாய்வு செய்து அனுமதிக்கவும்',
    pending: 'அனுமதிக்கப்படும்',
    approved: 'அனுமதிக்கப்பட்டது',
    declined: 'நிராகரிக்கப்பட்டது',
    noPending: 'நிலுவையில் உள்ள அனுமதிகள் இல்லை',
    noPendingDesc: 'அனைத்து பட்டியல்களும் மதிப்பாய்வு செய்யப்பட்டன',
    approve: 'அனுமதி',
    decline: 'நிராகரி',
    viewDetails: 'விவரங்களைக் காண்க',
    productName: 'தயாரிப்பு பெயர்',
    category: 'வகை',
    price: 'விலை',
    location: 'இடம்',
    seller: 'விற்பனையாளர்',
    description: 'விளக்கம்',
    approveConfirm: 'பட்டியலை அனுமதிக்கவும்',
    approveMessage: 'இந்த பட்டியலை அனுமதிக்க விரும்புகிறீர்களா?',
    declineConfirm: 'பட்டியலை நிராகரிக்கவும்',
    declineMessage: 'இந்த பட்டியலை நிராகரிக்க விரும்புகிறீர்களா?',
    reason: 'காரணம் (விருப்பமானது)',
    reasonPlaceholder: 'நிராகரிப்பதற்கான காரணத்தை உள்ளிடவும்...',
    approvedSuccess: 'பட்டியல் அனுமதிக்கப்பட்டது',
    approvedMessage: 'பட்டியல் அனுமதிக்கப்பட்டு இப்போது சந்தையில் தெரியும்.',
    declinedSuccess: 'பட்டியல் நிராகரிக்கப்பட்டது',
    declinedMessage: 'பட்டியல் நிராகரிக்கப்பட்டு அகற்றப்பட்டது.',
    cancel: 'ரத்துசெய்',
    confirm: 'உறுதிப்படுத்த',
    status: 'நிலை',
    submitted: 'சமர்ப்பிக்கப்பட்டது',
    lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
  },
};

const categoryEmojis = {
  seeds: '🌾',
  fertilizers: '🌱',
  tools: '🔧',
  pesticides: '🛡️',
  herbicides: '🧪',
};

export default function ProductApprovalScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const { isOfficer } = useAuth();
  const t = translations[selectedLanguage];
  const [pendingProducts, setPendingProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await getPendingProducts();
      setPendingProducts(data);
    } catch (error) {
      console.error('Error fetching pending products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOfficer) {
      fetchPending();
    }
  }, [isOfficer]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchPending();
    setRefreshing(false);
  }, []);

  const handleApprove = (product) => {
    Alert.alert(
      t.approveConfirm,
      t.approveMessage,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.approve,
          onPress: async () => {
            try {
              await updateProductStatus(product.id, 'approved');
              setPendingProducts(prev => prev.filter(p => p.id !== product.id));
              Alert.alert(t.approvedSuccess, t.approvedMessage);
              setShowDetails(false);
              setSelectedProduct(null);
            } catch (error) {
              console.error('Error approving product:', error);
              Alert.alert('Error', 'Failed to approve product.');
            }
          },
        },
      ]
    );
  };

  const handleDecline = (product) => {
    Alert.alert(
      t.declineConfirm,
      t.declineMessage,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.decline,
          style: 'destructive',
          onPress: async () => {
            try {
              await updateProductStatus(product.id, 'declined');
              setPendingProducts(prev => prev.filter(p => p.id !== product.id));
              Alert.alert(t.declinedSuccess, t.declinedMessage);
              setShowDetails(false);
              setSelectedProduct(null);
            } catch (error) {
              console.error('Error declining product:', error);
              Alert.alert('Error', 'Failed to decline product.');
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  if (!isOfficer) {
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
            <Text style={styles.emptyStateText}>Only officers can access this screen.</Text>
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
      <SafeAreaView style={styles.safeAreaContent} edges={['left', 'right', 'bottom']}>
        {/* Header */}
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
          <View style={styles.headerRight}>
            {pendingProducts.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingProducts.length}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Products List */}
        {pendingProducts.length > 0 ? (
          <ScrollView
            style={styles.productsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {pendingProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <View style={styles.productIcon}>
                    <Text style={styles.productIconText}>{categoryEmojis[product.category] || '📦'}</Text>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.productName}</Text>
                    <Text style={styles.productCategory}>{product.category}</Text>
                    <View style={styles.productMeta}>
                      <Text style={styles.productPrice}>Rs. {product.price.toLocaleString()}</Text>
                      <Text style={styles.productLocation}>📍 {product.location}</Text>
                    </View>
                    <Text style={styles.productSeller}>👤 {product.seller}</Text>
                    <Text style={styles.productDate}>
                      {t.submitted}: {product.createdAt instanceof Date ? product.createdAt.toLocaleDateString() : ''}
                    </Text>
                  </View>
                </View>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description}
                </Text>
                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewDetails(product)}
                  >
                    <Icon name="eye" size={18} color="#0F5132" />
                    <Text style={styles.viewButtonText}>{t.viewDetails}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApprove(product)}
                  >
                    <Icon name="check-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.approveButtonText}>{t.approve}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => handleDecline(product)}
                  >
                    <Icon name="close-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.declineButtonText}>{t.decline}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="check-circle-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>{t.noPending}</Text>
            <Text style={styles.emptyStateText}>{t.noPendingDesc}</Text>
          </View>
        )}

        {/* Details Modal */}
        {showDetails && selectedProduct && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.viewDetails}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowDetails(false);
                    setSelectedProduct(null);
                  }}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.productName}:</Text>
                  <Text style={styles.detailValue}>{selectedProduct.productName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.category}:</Text>
                  <Text style={styles.detailValue}>{selectedProduct.category}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.price}:</Text>
                  <Text style={styles.detailValue}>Rs. {selectedProduct.price.toLocaleString()}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.location}:</Text>
                  <Text style={styles.detailValue}>{selectedProduct.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.seller}:</Text>
                  <Text style={styles.detailValue}>{selectedProduct.seller}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedProduct.sellerEmail}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.description}:</Text>
                  <Text style={styles.detailValue}>{selectedProduct.description}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t.status}:</Text>
                  <Text style={[styles.detailValue, styles.pendingStatus]}>
                    {t.pending}
                  </Text>
                </View>
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalDeclineButton}
                  onPress={() => {
                    handleDecline(selectedProduct);
                  }}
                >
                  <Icon name="close-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.modalDeclineButtonText}>{t.decline}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalApproveButton}
                  onPress={() => {
                    handleApprove(selectedProduct);
                  }}
                >
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.modalApproveButtonText}>{t.approve}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7F3',
  },
  safeAreaTop: {
    backgroundColor: '#0F5132',
  },
  statusBarContainer: {
    height: StatusBar.currentHeight || 0,
    backgroundColor: '#0F5132',
  },
  safeAreaContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F5132',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  badge: {
    backgroundColor: '#E91E63',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  productsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productIconText: {
    fontSize: 32,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F5132',
    marginRight: 12,
  },
  productLocation: {
    fontSize: 13,
    color: '#666',
  },
  productSeller: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  productDate: {
    fontSize: 11,
    color: '#999',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  viewButtonText: {
    color: '#0F5132',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F5132',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E91E63',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  pendingStatus: {
    color: '#FF9800',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  modalDeclineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalDeclineButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  modalApproveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalApproveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
});

