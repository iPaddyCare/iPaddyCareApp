/**
 * Marketplace Service — Firestore CRUD for products
 */
import firestore from '@react-native-firebase/firestore';
import RNFS from 'react-native-fs';

const productsCollection = firestore().collection('products');

const PAGE_SIZE = 20;

/**
 * Derive stock status from quantity
 */
function getStockStatus(quantity) {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= 5) return 'low_stock';
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
    targetDiseasesLower: (productData.targetDiseases || []).map(d => d.toLowerCase().trim()),
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
  let query = productsCollection
    .where('status', '==', 'approved')
    .orderBy('createdAt', 'desc')
    .limit(pageSize);

  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();

  let results = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
  }));

  if (category && category !== 'all') {
    results = results.filter(p => p.category === category);
  }

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
export async function updateProductStatus(productId, newStatus) {
  await productsCollection.doc(productId).update({
    status: newStatus,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Update product fields
 */
export async function updateProduct(productId, data) {
  await productsCollection.doc(productId).update({
    ...data,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Increment the view counter for a product (fire-and-forget safe)
 */
export async function incrementProductViews(productId) {
  await productsCollection.doc(productId).update({
    views: firestore.FieldValue.increment(1),
  });
}

/**
 * Get approved products that target a specific disease/pest
 */
export async function getProductsByDisease(diseaseName) {
  const normalized = diseaseName.toLowerCase().trim();

  // Fetch all approved products and filter client-side for robust matching
  const snapshot = await productsCollection
    .where('status', '==', 'approved')
    .orderBy('createdAt', 'desc')
    .get();

  const results = snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }))
    .filter(product => {
      const diseases = product.targetDiseases || [];
      const diseasesLower = product.targetDiseasesLower || [];
      return diseasesLower.includes(normalized)
        || diseases.some(d => d.toLowerCase().trim() === normalized);
    });

  return results;
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
