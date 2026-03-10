/**
 * Marketplace Service — Firestore CRUD for products
 */
import firestore from '@react-native-firebase/firestore';

const productsCollection = firestore().collection('products');

/**
 * Derive stock status from quantity
 */
function getStockStatus(quantity) {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= 5) return 'low_stock';
  return 'in_stock';
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
 * Get approved products with optional category filter
 */
export async function getApprovedProducts(category = null) {
  let query = productsCollection.where('status', '==', 'approved');

  if (category && category !== 'all') {
    query = query.where('category', '==', category);
  }

  const snapshot = await query.orderBy('createdAt', 'desc').get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
  }));
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
 * Get approved products that target a specific disease/pest
 */
export async function getProductsByDisease(diseaseName) {
  const normalized = diseaseName.toLowerCase().trim();

  // Fetch all approved products and filter client-side for robust matching
  // (avoids needing composite Firestore indexes for every field combo)
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
      // Match on lowercase array, or case-insensitive check on original array
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
  addProduct,
  getApprovedProducts,
  getProductsByDisease,
  getUserListings,
  getPendingProducts,
  updateProductStatus,
  updateProduct,
  deleteProduct,
};
