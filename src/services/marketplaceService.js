/**
 * Marketplace Service — Firestore CRUD for products
 */
import firestore from '@react-native-firebase/firestore';

const productsCollection = firestore().collection('products');

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
 * Delete a product
 */
export async function deleteProduct(productId) {
  await productsCollection.doc(productId).delete();
}

export default {
  addProduct,
  getApprovedProducts,
  getUserListings,
  getPendingProducts,
  updateProductStatus,
  updateProduct,
  deleteProduct,
};
