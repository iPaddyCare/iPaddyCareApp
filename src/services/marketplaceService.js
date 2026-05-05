/**
 * Marketplace Service — Firestore CRUD for products
 */
import firestore from '@react-native-firebase/firestore';
import RNFS from 'react-native-fs';
import {
  getDiseaseMatchKeySet,
  diseaseLabelMatchesKeys,
  normalizeTargetDiseasesForStorage,
  normalizeDiseaseForMatch,
} from './diseaseMatching';

const productsCollection = firestore().collection('products');

const PAGE_SIZE = 20;

/**
 * Derive stock status from quantity
 */
function getStockStatus(quantity) {
  const n = Number(quantity);
  if (!Number.isFinite(n) || n <= 0) return 'out_of_stock';
  if (n <= 5) return 'low_stock';
  return 'in_stock';
}

/**
 * Upload a product image to Firebase Storage and return the download URL.
 * @param {string} localUri - local file URI from image picker / resizer
 * @param {string} userId
 * @returns {Promise<string>} download URL
 */
export async function uploadProductImage(localUri, userId) {
  // Normalize content:// URIs on Android — copy to a readable temp file first
  let uploadUri = localUri;
  if (localUri.startsWith('content://')) {
    const tempPath = `${RNFS.CachesDirectoryPath}/upload_${Date.now()}.jpg`;
    await RNFS.copyFile(localUri, tempPath);
    uploadUri = `file://${tempPath}`;
  }

  const formData = new FormData();
  formData.append('file', {
    uri: uploadUri,
    type: 'image/jpeg',
    name: `product_${userId}_${Date.now()}.jpg`,
  });
  formData.append('upload_preset', 'ipaddycare_products');

  const response = await fetch('https://api.cloudinary.com/v1_1/dd6nsdcff/image/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || `Upload failed (${response.status})`);
  }

  return data.secure_url;
}

/**
 * Add a new product listing (status: pending)
 */
export async function addProduct(productData, user) {
  const doc = {
    productName: productData.productName,
    category: productData.category,
    price: Number(productData.price),
    description: productData.description,
    location: productData.location,
    phone: productData.phone,
    imageUrl: productData.imageUrl || null,
    activeIngredient: productData.activeIngredient || '',
    targetDiseases: productData.targetDiseases || [],
    targetDiseasesLower: normalizeTargetDiseasesForStorage(productData.targetDiseases || []),
    quantity: Number(productData.quantity) || 0,
    unit: productData.unit || 'units',
    stockStatus: getStockStatus(Number(productData.quantity) || 0),
    status: 'pending',
    userId: user.uid,
    seller: user.displayName || user.email?.split('@')[0] || 'Unknown',
    sellerEmail: user.email || '',
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
    views: 0,
  };

  const ref = await productsCollection.add(doc);
  return ref.id;
}

/**
 * Get approved products with optional category filter and pagination.
 * Returns { products, lastDoc, hasMore }.
 */
export async function getApprovedProducts(category = null, lastDoc = null, pageSize = PAGE_SIZE) {
  let query = productsCollection.where('status', '==', 'approved');

  if (category && category !== 'all') {
    query = query.where('category', '==', category);
  }

  query = query.orderBy('createdAt', 'desc').limit(pageSize);

  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();

  const results = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
  }));

  return {
    products: results,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    hasMore: snapshot.docs.length === pageSize,
  };
}

/**
 * Get current user's listings
 */
export async function getUserListings(userId) {
  const snapshot = await productsCollection
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
  }));
}

/**
 * Get pending products (for officer approval)
 */
export async function getPendingProducts() {
  const snapshot = await productsCollection
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
  }));
}

/**
 * Update product status (approve/decline)
 */
export async function updateProductStatus(productId, newStatus, declineReason = null) {
  console.log('[marketplace] updateProductStatus →', { productId, newStatus, hasReason: !!declineReason });
  if (!productId) {
    console.warn('[marketplace] updateProductStatus called with empty productId');
  }
  try {
    const ref = productsCollection.doc(productId);
    const snap = await ref.get();
    console.log('[marketplace] updateProductStatus exists?', snap.exists, 'path=', ref.path);
    if (!snap.exists) {
      throw new Error(`Product not found: ${ref.path}`);
    }
    const payload = {
      status: newStatus,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };
    if (newStatus === 'declined' && declineReason && declineReason.trim()) {
      payload.declineReason = declineReason.trim();
    }
    // Approving clears any prior decline reason so it doesn't linger on a re-approved doc.
    if (newStatus === 'approved') {
      payload.declineReason = firestore.FieldValue.delete();
    }
    await ref.update(payload);
    console.log('[marketplace] updateProductStatus OK', productId);
  } catch (e) {
    console.error('[marketplace] updateProductStatus FAILED', {
      productId,
      code: e?.code,
      message: e?.message,
    });
    throw e;
  }
}

/**
 * Update product fields
 */
export async function updateProduct(productId, data) {
  console.log('[marketplace] updateProduct →', { productId, keys: Object.keys(data || {}) });
  if (!productId) {
    console.warn('[marketplace] updateProduct called with empty productId');
  }
  try {
    const ref = productsCollection.doc(productId);
    const snap = await ref.get();
    console.log('[marketplace] updateProduct exists?', snap.exists, 'path=', ref.path);
    if (!snap.exists) {
      throw new Error(`Product not found: ${ref.path}`);
    }
    await ref.update({
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    console.log('[marketplace] updateProduct OK', productId);
  } catch (e) {
    console.error('[marketplace] updateProduct FAILED', {
      productId,
      code: e?.code,
      message: e?.message,
    });
    throw e;
  }
}

/**
 * Increment the view counter for a product (fire-and-forget safe).
 * Uses set({ merge: true }) so a missing doc won't throw firestore/not-found.
 */
export async function incrementProductViews(productId) {
  console.log('[marketplace] incrementProductViews →', productId);
  if (!productId) {
    console.warn('[marketplace] incrementProductViews called with empty productId');
    return;
  }
  try {
    const ref = productsCollection.doc(productId);
    await ref.set(
      { views: firestore.FieldValue.increment(1) },
      { merge: true },
    );
    console.log('[marketplace] incrementProductViews OK', productId);
  } catch (e) {
    console.error('[marketplace] incrementProductViews FAILED', {
      productId,
      code: e?.code,
      message: e?.message,
    });
  }
}

/**
 * Get approved products that target a specific disease/pest
 */
export async function getProductsByDisease(diseaseName) {
  if (!diseaseName || typeof diseaseName !== 'string') {
    return [];
  }

  let trimmed;
  try {
    trimmed = diseaseName.trim();
  } catch {
    return [];
  }
  if (!trimmed) {
    return [];
  }

  let matchKeys;
  try {
    matchKeys = getDiseaseMatchKeySet(trimmed);
  } catch (err) {
    console.warn('getProductsByDisease: building match keys failed', err);
    matchKeys = new Set();
  }

  const fallbackKey = normalizeDiseaseForMatch(trimmed);
  if ((!matchKeys || matchKeys.size === 0) && fallbackKey) {
    matchKeys = new Set([fallbackKey]);
  }
  if (!matchKeys || matchKeys.size === 0) {
    return [];
  }

  let snapshot;
  try {
    snapshot = await productsCollection
      .where('status', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .get();
  } catch (err) {
    console.warn('getProductsByDisease: Firestore query failed', err);
    return [];
  }

  const rows = [];
  try {
    for (const doc of snapshot.docs) {
      let data;
      try {
        data = doc.data();
      } catch {
        continue;
      }
      rows.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      });
    }
  } catch (err) {
    console.warn('getProductsByDisease: mapping docs failed', err);
    return [];
  }

  return rows.filter(product => {
    try {
      const diseases = Array.isArray(product.targetDiseases) ? product.targetDiseases : [];
      const diseasesLower = Array.isArray(product.targetDiseasesLower)
        ? product.targetDiseasesLower
        : [];
      const labels = [...diseases, ...diseasesLower];
      return labels.some(label => diseaseLabelMatchesKeys(label, matchKeys));
    } catch {
      return false;
    }
  });
}

/**
 * Delete a product
 */
export async function deleteProduct(productId) {
  await productsCollection.doc(productId).delete();
}

export default {
  uploadProductImage,
  addProduct,
  getApprovedProducts,
  getProductsByDisease,
  getUserListings,
  getPendingProducts,
  updateProductStatus,
  updateProduct,
  incrementProductViews,
  deleteProduct,
};
