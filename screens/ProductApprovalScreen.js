import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Image,
  RefreshControl,
  Modal,
  Platform,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from '../src/i18n/useTranslation';

import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPendingProducts, updateProductStatus } from '../src/services/marketplaceService';

const { width } = Dimensions.get('window');

const categoryEmojis = {
  seeds: '🌾',
  fertilizers: '🌱',
  tools: '🔧',
  pesticides: '🛡️',
  herbicides: '🧪',
};

export default function ProductApprovalScreen({ navigation }) {
  const translate = useTranslation('productApproval');
  const { isOfficer } = useAuth();
  const [pendingProducts, setPendingProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [declineModalProduct, setDeclineModalProduct] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [decliningSubmitting, setDecliningSubmitting] = useState(false);

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

  // Refetch pending products every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isOfficer) {
        fetchPending();
      }
    }, [isOfficer])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchPending();
    setRefreshing(false);
  }, []);

  const handleApprove = (product) => {
    showAppAlert(
      translate('approveConfirm'),
      translate('approveMessage'),
      [
        { text: translate('cancel'), style: 'cancel' },
        {
          text: translate('approve'),
          onPress: async () => {
            try {
              await updateProductStatus(product.id, 'approved');
              setPendingProducts(prev => prev.filter(p => p.id !== product.id));
              showAppAlert(translate('approvedSuccess'), translate('approvedMessage'));
              setShowDetails(false);
              setSelectedProduct(null);
            } catch (error) {
              console.error('Error approving product:', error);
              showAppAlert(translate('common.error'), translate('failedApprove'));
            }
          },
        },
      ]
    );
  };

  const handleDecline = (product) => {
    setDeclineModalProduct(product);
    setDeclineReason('');
  };

  const submitDecline = async () => {
    const product = declineModalProduct;
    if (!product) return;
    setDecliningSubmitting(true);
    try {
      await updateProductStatus(product.id, 'declined', declineReason);
      setPendingProducts(prev => prev.filter(p => p.id !== product.id));
      setDeclineModalProduct(null);
      setDeclineReason('');
      showAppAlert(translate('declinedSuccess'), translate('declinedMessage'));
      setShowDetails(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error declining product:', error);
      showAppAlert(translate('common.error'), translate('failedDecline'));
    } finally {
      setDecliningSubmitting(false);
    }
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
              <Text style={styles.headerTitle}>{translate('title')}</Text>
              <Text style={styles.headerSubtitle}>{translate('subtitle')}</Text>
            </View>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.emptyState}>
            <Icon name="shield-off" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>{translate('common.accessRestricted')}</Text>
            <Text style={styles.emptyStateText}>{translate('onlyOfficers')}</Text>
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
            <Text style={styles.headerTitle}>{translate('title')}</Text>
            <Text style={styles.headerSubtitle}>{translate('subtitle')}</Text>
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
                    {product.imageUrl ? (
                      <Image source={{ uri: product.imageUrl }} style={styles.productThumbImage} />
                    ) : (
                      <Text style={styles.productIconText}>{categoryEmojis[product.category] || '📦'}</Text>
                    )}
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
                      {translate('submitted')}: {product.createdAt instanceof Date ? product.createdAt.toLocaleDateString() : ''}
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
                    <Text style={styles.viewButtonText}>{translate('common.viewDetails')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApprove(product)}
                  >
                    <Icon name="check-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.approveButtonText}>{translate('approve')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => handleDecline(product)}
                  >
                    <Icon name="close-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.declineButtonText}>{translate('decline')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIconCircle}>
              <Icon name="check-circle-outline" size={56} color="#0F5132" />
            </View>
            <Text style={styles.emptyStateTitle}>{translate('noPending')}</Text>
            <Text style={styles.emptyStateText}>{translate('noPendingDesc')}</Text>
          </View>
        )}

        {/* Details Modal */}
        <Modal
          visible={showDetails && !!selectedProduct}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowDetails(false);
            setSelectedProduct(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalDismissArea}
              activeOpacity={1}
              onPress={() => {
                setShowDetails(false);
                setSelectedProduct(null);
              }}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalDragHandle} />
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <View style={styles.modalIconCircle}>
                    {selectedProduct?.imageUrl ? (
                      <Image source={{ uri: selectedProduct.imageUrl }} style={styles.modalThumbImage} />
                    ) : (
                      <Text style={{ fontSize: 24 }}>
                        {categoryEmojis[selectedProduct?.category] || '📦'}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>{selectedProduct?.productName}</Text>
                    <View style={styles.modalStatusBadge}>
                      <Icon name="clock-outline" size={12} color="#FF9800" />
                      <Text style={styles.modalStatusText}>{translate('pending')}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => {
                    setShowDetails(false);
                    setSelectedProduct(null);
                  }}
                >
                  <Icon name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              {selectedProduct && (
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                      <Icon name="tag-outline" size={18} color="#0F5132" />
                      <View style={styles.detailTextGroup}>
                        <Text style={styles.detailLabel}>{translate('category')}</Text>
                        <Text style={styles.detailValue}>{selectedProduct.category}</Text>
                      </View>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailRow}>
                      <Icon name="cash" size={18} color="#0F5132" />
                      <View style={styles.detailTextGroup}>
                        <Text style={styles.detailLabel}>{translate('common.price')}</Text>
                        <Text style={[styles.detailValue, { color: '#0F5132', fontWeight: '700' }]}>
                          Rs. {selectedProduct.price.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailRow}>
                      <Icon name="map-marker-outline" size={18} color="#0F5132" />
                      <View style={styles.detailTextGroup}>
                        <Text style={styles.detailLabel}>{translate('common.location')}</Text>
                        <Text style={styles.detailValue}>{selectedProduct.location}</Text>
                      </View>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailRow}>
                      <Icon name="account-outline" size={18} color="#0F5132" />
                      <View style={styles.detailTextGroup}>
                        <Text style={styles.detailLabel}>{translate('seller')}</Text>
                        <Text style={styles.detailValue}>{selectedProduct.seller}</Text>
                      </View>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailRow}>
                      <Icon name="email-outline" size={18} color="#0F5132" />
                      <View style={styles.detailTextGroup}>
                        <Text style={styles.detailLabel}>{translate('common.email')}</Text>
                        <Text style={styles.detailValue}>{selectedProduct.sellerEmail}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.descriptionCard}>
                    <Text style={styles.descriptionLabel}>{translate('description')}</Text>
                    <Text style={styles.descriptionValue}>{selectedProduct.description}</Text>
                  </View>
                  {selectedProduct.activeIngredient ? (
                    <View style={styles.ingredientCard}>
                      <Icon name="flask-outline" size={16} color="#0F5132" />
                      <Text style={styles.ingredientText}>{selectedProduct.activeIngredient}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.submittedDate}>
                    {translate('submitted')}: {selectedProduct.createdAt instanceof Date ? selectedProduct.createdAt.toLocaleDateString() : ''}
                  </Text>
                </ScrollView>
              )}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalDeclineButton}
                  onPress={() => handleDecline(selectedProduct)}
                >
                  <Icon name="close-circle" size={20} color="#E91E63" />
                  <Text style={styles.modalDeclineButtonText}>{translate('decline')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalApproveButton}
                  onPress={() => handleApprove(selectedProduct)}
                >
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.modalApproveButtonText}>{translate('approve')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Decline-reason modal — captures an optional explanation that the seller
            sees on their listing. Stored on the product as `declineReason`. */}
        <Modal
          visible={!!declineModalProduct}
          transparent
          animationType="fade"
          onRequestClose={() => !decliningSubmitting && setDeclineModalProduct(null)}
        >
          <Pressable
            style={styles.declineOverlay}
            onPress={() => !decliningSubmitting && setDeclineModalProduct(null)}
          >
            <Pressable style={styles.declineCard} onPress={() => {}}>
              <Text style={styles.declineTitle}>{translate('declineConfirm')}</Text>
              <Text style={styles.declineMessage}>{translate('declineMessage')}</Text>
              <Text style={styles.declineLabel}>{translate('reason')}</Text>
              <TextInput
                style={styles.declineInput}
                value={declineReason}
                onChangeText={setDeclineReason}
                placeholder={translate('reasonPlaceholder')}
                placeholderTextColor="#999"
                multiline
                maxLength={300}
                autoFocus
              />
              <View style={styles.declineActions}>
                <TouchableOpacity
                  style={[styles.declineCancelBtn, decliningSubmitting && { opacity: 0.5 }]}
                  onPress={() => !decliningSubmitting && setDeclineModalProduct(null)}
                  disabled={decliningSubmitting}
                  activeOpacity={0.7}
                >
                  <Text style={styles.declineCancelText}>{translate('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.declineConfirmBtn, decliningSubmitting && { opacity: 0.7 }]}
                  onPress={submitDecline}
                  disabled={decliningSubmitting}
                  activeOpacity={0.8}
                >
                  {decliningSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.declineConfirmText}>{translate('decline')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
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
  productThumbImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  modalThumbImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
    resizeMode: 'cover',
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
  emptyStateIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  modalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F0F7F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  modalStatusText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    maxHeight: 400,
  },
  detailCard: {
    backgroundColor: '#F9FBF9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F0E8',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  detailTextGroup: {
    flex: 1,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#E8F0E8',
    marginLeft: 30,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    color: '#1A1A1A',
    marginTop: 1,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F0E8',
  },
  descriptionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descriptionValue: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  ingredientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F7F3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  ingredientText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F5132',
    fontStyle: 'italic',
    flex: 1,
  },
  submittedDate: {
    fontSize: 11,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 8,
  },
  pendingStatus: {
    color: '#FF9800',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  modalDeclineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  modalDeclineButtonText: {
    color: '#E91E63',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  modalApproveButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalApproveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  declineOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  declineCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  declineTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  declineMessage: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
    marginBottom: 14,
  },
  declineLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  declineInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  declineActions: {
    flexDirection: 'row',
    gap: 10,
  },
  declineCancelBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  declineCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  declineConfirmBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C62828',
  },
  declineConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

