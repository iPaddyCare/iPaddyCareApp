import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { AlertCircle, ShoppingCart, Phone, ChevronRight } from 'lucide-react-native';
import { getApprovedProducts, getProductsByDisease } from '../services/marketplaceService';

const SEVERITY_COLORS = {
  high: { bg: '#C62828', text: '#fff' },
  medium: { bg: '#F57F17', text: '#fff' },
  low: { bg: '#2E7D32', text: '#fff' },
};

const categoryEmojis = {
  seeds: '🌾',
  fertilizers: '🌱',
  tools: '🔧',
  pesticides: '🛡️',
  herbicides: '🧪',
};

export default function PokedexResultCard({ imageUri, prediction, solution, navigation }) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Entry animation
  const cardScale = useSharedValue(0.92);
  const cardOpacity = useSharedValue(0);

  const entryStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const isHealthy = solution.diseaseName === 'Healthy Crop';
  const showDetails = prediction.confidence >= 0.6 || isHealthy;
  const isPest = prediction.type === 'pest';
  const confPercent = (prediction.confidence * 100).toFixed(1);

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 14, stiffness: 90 });
    cardOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
  }, []);

  // Fetch marketplace products that target the detected disease/pest
  useEffect(() => {
    if (!showDetails || isHealthy) return;

    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const diseaseName = solution.diseaseName || prediction.disease || '';
        const modelVar = prediction.disease || '';

        // Try to find products tagged for this disease using multiple name variants
        let products = [];
        if (diseaseName) {
          products = await getProductsByDisease(diseaseName);
        }
        // Also try the raw model variable name (e.g. "downy_mildew") if different
        if (products.length === 0 && modelVar && modelVar !== diseaseName) {
          products = await getProductsByDisease(modelVar);
        }

        // If no tagged products found, fall back to category-based listing
        if (products.length === 0) {
          const categories = isPest
            ? ['pesticides']
            : ['pesticides', 'herbicides'];
          const results = await Promise.all(
            categories.map(cat => getApprovedProducts(cat)),
          );
          products = results.flat();
        }

        setRelatedProducts(products.slice(0, 3));
      } catch (err) {
        console.log('Failed to fetch related products:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [showDetails, isHealthy, isPest, solution, prediction]);

  // Type color theming — app brand palette
  const typeColor = isHealthy ? '#0F5132' : isPest ? '#0F5132' : '#0F5132';
  const typeAccent = isHealthy ? '#2E7D32' : isPest ? '#E65100' : '#C62828';

  // Not found case
  if (!solution.found) {
    return (
      <Animated.View style={[styles.card, entryStyle]}>
        <View style={styles.cardInner}>
          <View style={styles.notFoundContent}>
            <AlertCircle size={32} color="#FF9800" />
            <Text style={styles.notFoundTitle}>Not Found in Database</Text>
            <Text style={styles.notFoundText}>
              The detected {isPest ? 'pest' : 'disease'} "{prediction.disease}" is not in our database.
            </Text>
            <Text style={styles.notFoundSubtext}>
              Please consult with an agricultural expert for proper diagnosis and treatment.
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.card, entryStyle]}>
      {/* Outer frame — like the Pokédex shell */}
      <View style={styles.cardInner}>

        {/* Top section — ID + Type */}
        <View style={[styles.topStrip, { backgroundColor: '#0F5132' }]}>
          <Text style={styles.dexId}>
            #{String(prediction.classIndex ?? 0).padStart(3, '0')}
          </Text>
          <View style={styles.topRight}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {isPest ? 'PEST' : isHealthy ? 'HEALTHY' : 'DISEASE'}
              </Text>
            </View>
            {!isHealthy && solution.severity && solution.severity !== 'none' && (
              <View style={[styles.severityBadge, {
                backgroundColor: (SEVERITY_COLORS[solution.severity] || SEVERITY_COLORS.medium).bg,
              }]}>
                <Text style={styles.typeBadgeText}>
                  {solution.severity.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Image display — clean with rounded inner frame */}
        <View style={styles.imageFrame}>
          <View style={styles.imageInner}>
            <Image source={{ uri: imageUri }} style={styles.mainImage} />
          </View>
          {/* Subtle inner shadow overlay */}
          <View style={styles.imageInnerShadow} pointerEvents="none" />
        </View>

        {/* Name plate */}
        <View style={styles.namePlate}>
          <Text style={styles.diseaseName}>{solution.diseaseName}</Text>
          {solution.aliases && solution.aliases.length > 0 && (
            <Text style={styles.aliases}>
              {solution.aliases.join(' · ')}
            </Text>
          )}
        </View>

        {/* Stat bar — Pokédex style */}
        <View style={styles.statsBox}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>CONF</Text>
            <View style={styles.statBarTrack}>
              <View style={[
                styles.statBarFill,
                {
                  width: `${Math.min(prediction.confidence * 100, 100)}%`,
                  backgroundColor: prediction.confidence >= 0.6 ? '#0F5132' : '#FF9800',
                },
              ]} />
            </View>
            <Text style={[
              styles.statValue,
              prediction.confidence < 0.6 && { color: '#FF9800' },
            ]}>
              {confPercent}%
            </Text>
          </View>
        </View>

        {/* Low confidence warning */}
        {!showDetails && (
          <View style={styles.lowConfWarning}>
            <AlertCircle size={14} color="#FF9800" />
            <Text style={styles.lowConfText}>
              Confidence too low for reliable diagnosis. Verify with an expert.
            </Text>
          </View>
        )}

        {/* Info section */}
        {showDetails && (
          <View style={styles.infoSection}>
            {solution.description ? (
              <View style={styles.descBox}>
                <Text style={styles.description}>{solution.description}</Text>
              </View>
            ) : null}

            {!isHealthy && solution.solutions && solution.solutions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>TREATMENT</Text>
                <View style={styles.divider} />
                {solution.solutions.map((sol, i) => (
                  <View key={i} style={styles.solutionRow}>
                    <View style={[styles.stepBadge, { backgroundColor: '#0F5132' }]}>
                      <Text style={styles.stepText}>{sol.step}</Text>
                    </View>
                    <View style={styles.solutionContent}>
                      <Text style={styles.solutionTitle}>{sol.title}</Text>
                      <Text style={styles.solutionDesc}>{sol.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {!isHealthy && solution.prevention && solution.prevention.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>PREVENTION</Text>
                <View style={styles.divider} />
                {solution.prevention.map((tip, i) => (
                  <View key={i} style={styles.preventionItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.preventionText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Marketplace Products */}
        {showDetails && !isHealthy && (
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>AVAILABLE TREATMENTS</Text>
            <View style={styles.divider} />

            {productsLoading && (
              <View style={styles.productsLoading}>
                <ActivityIndicator size="small" color="#0F5132" />
                <Text style={styles.productsLoadingText}>Loading marketplace...</Text>
              </View>
            )}

            {!productsLoading && relatedProducts.length > 0 && (
              <>
                {relatedProducts.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productCard}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (product.phone) {
                        Linking.openURL(`tel:${product.phone}`);
                      }
                    }}
                  >
                    <Text style={styles.productEmoji}>
                      {categoryEmojis[product.category] || '📦'}
                    </Text>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {product.productName}
                      </Text>
                      {product.activeIngredient ? (
                        <Text style={styles.productIngredient} numberOfLines={1}>
                          {product.activeIngredient}
                        </Text>
                      ) : (
                        <Text style={styles.productDesc} numberOfLines={1}>
                          {product.description}
                        </Text>
                      )}
                      <View style={styles.productMeta}>
                        <Text style={styles.productPrice}>
                          Rs. {product.price?.toLocaleString()}
                        </Text>
                        <Text style={styles.productSeller}>
                          {product.seller}
                        </Text>
                      </View>
                    </View>
                    {product.phone && (
                      <View style={[styles.phoneBtn, { backgroundColor: '#0F5132' }]}>
                        <Phone size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}

            {!productsLoading && relatedProducts.length === 0 && (
              <Text style={styles.noProductsText}>
                No treatments listed yet in the marketplace.
              </Text>
            )}

            {navigation && (
              <TouchableOpacity
                style={[styles.browseAllBtn, { borderColor: '#0F5132' }]}
                onPress={() => navigation.navigate('Marketplace', { searchQuery: solution.diseaseName })}
                activeOpacity={0.7}
              >
                <ShoppingCart size={14} color="#0F5132" />
                <Text style={[styles.browseAllText, { color: '#0F5132' }]}>
                  Browse All Treatments
                </Text>
                <ChevronRight size={14} color="#0F5132" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom strip */}
        <View style={styles.bottomStrip}>
          <View style={styles.indicatorRow}>
            <View style={[styles.indicator, { backgroundColor: '#0F5132' }]} />
            <View style={[styles.indicator, { backgroundColor: '#2E7D32' }]} />
            <View style={[styles.indicator, { backgroundColor: '#81C784' }]} />
          </View>
          <Text style={styles.footerText}>iPaddyCare</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    marginTop: 8,
  },
  cardInner: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.1)',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  // Top strip
  topStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dexId: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
  topRight: {
    flexDirection: 'row',
    gap: 6,
  },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  severityBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  typeBadgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  // Image frame
  imageFrame: {
    margin: 14,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.12)',
    backgroundColor: '#F0F7F3',
    overflow: 'hidden',
    position: 'relative',
  },
  imageInner: {
    height: 220,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.08)',
  },
  // Name plate
  namePlate: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F5132',
  },
  aliases: {
    fontSize: 12,
    color: '#6B8F7B',
    fontStyle: 'italic',
    marginTop: 2,
  },
  // Stats
  statsBox: {
    marginHorizontal: 16,
    backgroundColor: '#F0F7F3',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.08)',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F5132',
    width: 45,
    letterSpacing: 1,
  },
  statBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(15,81,50,0.12)',
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F5132',
    width: 50,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // Low confidence
  lowConfWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  lowConfText: {
    flex: 1,
    fontSize: 12,
    color: '#E65100',
    lineHeight: 17,
  },
  // Info section
  infoSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  descBox: {
    backgroundColor: '#F0F7F3',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.08)',
  },
  description: {
    fontSize: 13,
    color: '#3D6B52',
    lineHeight: 20,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F5132',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  divider: {
    height: 2,
    backgroundColor: 'rgba(15,81,50,0.1)',
    borderRadius: 1,
    marginBottom: 10,
  },
  solutionRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F7F3',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.08)',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  solutionContent: {
    flex: 1,
  },
  solutionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 3,
  },
  solutionDesc: {
    fontSize: 12,
    color: '#5A7D6A',
    lineHeight: 18,
  },
  preventionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0F5132',
    marginRight: 10,
    marginTop: 6,
  },
  preventionText: {
    flex: 1,
    fontSize: 12,
    color: '#5A7D6A',
    lineHeight: 18,
  },
  // Products section
  productsSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  productsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  productsLoadingText: {
    fontSize: 12,
    color: '#6B8F7B',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F3',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(15,81,50,0.08)',
  },
  productEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F5132',
  },
  productDesc: {
    fontSize: 11,
    color: '#6B8F7B',
    marginTop: 1,
  },
  productIngredient: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3D6B52',
    marginTop: 1,
    fontStyle: 'italic',
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F5132',
  },
  productSeller: {
    fontSize: 10,
    color: '#8BA89A',
  },
  phoneBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  noProductsText: {
    fontSize: 12,
    color: '#8BA89A',
    textAlign: 'center',
    paddingVertical: 12,
  },
  browseAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 4,
    backgroundColor: 'rgba(15,81,50,0.04)',
  },
  browseAllText: {
    fontWeight: '700',
    fontSize: 13,
  },
  // Bottom strip
  bottomStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F7F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15,81,50,0.08)',
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 5,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerText: {
    fontSize: 10,
    color: '#0F5132',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  // Not found
  notFoundContent: {
    padding: 24,
    alignItems: 'center',
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9800',
    marginTop: 12,
    marginBottom: 8,
  },
  notFoundText: {
    fontSize: 14,
    color: '#3D6B52',
    textAlign: 'center',
    lineHeight: 20,
  },
  notFoundSubtext: {
    fontSize: 13,
    color: '#6B8F7B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
});
