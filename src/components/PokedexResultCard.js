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
import { getApprovedProducts } from '../services/marketplaceService';

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

  // Fetch related marketplace products
  useEffect(() => {
    if (!showDetails || isHealthy) return;

    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        // Fetch pesticides and herbicides — most relevant for treatments
        const [pesticides, herbicides] = await Promise.all([
          getApprovedProducts('pesticides'),
          getApprovedProducts('herbicides'),
        ]);
        const all = [...pesticides, ...herbicides];

        // Try to match by disease/pest name in product name or description
        const diseaseName = (solution.diseaseName || prediction.disease || '').toLowerCase();
        const matched = all.filter(p => {
          const name = (p.productName || '').toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes(diseaseName) || desc.includes(diseaseName);
        });

        // Show matched products first, then fill with general products (max 3)
        const result = matched.length > 0
          ? matched.slice(0, 3)
          : all.slice(0, 3);
        setRelatedProducts(result);
      } catch (err) {
        console.log('Failed to fetch related products:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [showDetails, isHealthy]);

  // Type color theming (like Pokémon type colors)
  const typeColor = isHealthy ? '#2E7D32' : isPest ? '#E65100' : '#C62828';

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
        <View style={[styles.topStrip, { backgroundColor: typeColor }]}>
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
                  backgroundColor: prediction.confidence >= 0.6 ? '#4CAF50' : '#FF9800',
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
                    <View style={[styles.stepBadge, { backgroundColor: typeColor }]}>
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
            <Text style={styles.sectionTitle}>MARKETPLACE</Text>
            <View style={styles.divider} />

            {productsLoading && (
              <View style={styles.productsLoading}>
                <ActivityIndicator size="small" color={typeColor} />
                <Text style={styles.productsLoadingText}>Finding treatments...</Text>
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
                      <Text style={styles.productDesc} numberOfLines={1}>
                        {product.description}
                      </Text>
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
                      <View style={[styles.phoneBtn, { backgroundColor: typeColor }]}>
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
                style={[styles.browseAllBtn, { borderColor: typeColor }]}
                onPress={() => navigation.navigate('Marketplace', { searchQuery: solution.diseaseName })}
                activeOpacity={0.7}
              >
                <ShoppingCart size={14} color={typeColor} />
                <Text style={[styles.browseAllText, { color: typeColor }]}>
                  Browse All Treatments
                </Text>
                <ChevronRight size={14} color={typeColor} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom strip — Pokédex footer */}
        <View style={styles.bottomStrip}>
          <View style={styles.indicatorRow}>
            <View style={[styles.indicator, { backgroundColor: '#4CAF50' }]} />
            <View style={[styles.indicator, { backgroundColor: '#FF9800' }]} />
            <View style={[styles.indicator, { backgroundColor: '#C62828' }]} />
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
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#333',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  // Top strip
  topStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    margin: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bbb',
    backgroundColor: '#1a1a1a',
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  // Name plate
  namePlate: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#222',
  },
  aliases: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
  // Stats
  statsBox: {
    marginHorizontal: 16,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666',
    width: 45,
    letterSpacing: 1,
  },
  statBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#333',
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
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#666',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  divider: {
    height: 2,
    backgroundColor: '#ddd',
    borderRadius: 1,
    marginBottom: 10,
  },
  solutionRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    color: '#222',
    marginBottom: 3,
  },
  solutionDesc: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#4CAF50',
    marginRight: 10,
    marginTop: 6,
  },
  preventionText: {
    flex: 1,
    fontSize: 12,
    color: '#555',
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
    color: '#888',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    color: '#222',
  },
  productDesc: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
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
    color: '#2E7D32',
  },
  productSeller: {
    fontSize: 10,
    color: '#aaa',
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
    color: '#999',
    textAlign: 'center',
    paddingVertical: 12,
  },
  browseAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    marginTop: 4,
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
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    color: '#999',
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
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  notFoundSubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
});
