/**
 * Messaging Service — Firestore CRUD for conversations & messages
 */
import firestore from '@react-native-firebase/firestore';

const conversationsRef = firestore().collection('conversations');

/**
 * Get or create a conversation between a farmer and an officer
 */
export async function getOrCreateConversation(farmer, officer) {
  // Check if conversation already exists
  const existing = await conversationsRef
    .where('farmerId', '==', farmer.uid)
    .where('officerId', '==', officer.id || officer.uid)
    .limit(1)
    .get();

  if (!existing.empty) {
    const doc = existing.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  // Create new conversation
  const newConvo = {
    farmerId: farmer.uid,
    farmerName: farmer.displayName || farmer.email?.split('@')[0] || 'Farmer',
    farmerEmail: farmer.email || '',
    officerId: officer.id || officer.uid,
    officerName: officer.name || officer.displayName || 'Officer',
    officerEmail: officer.email || '',
    lastMessage: '',
    lastMessageAt: firestore.FieldValue.serverTimestamp(),
    unreadByOfficer: 0,
    unreadByFarmer: 0,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  const ref = await conversationsRef.add(newConvo);
  return { id: ref.id, ...newConvo };
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(conversationId, text, senderId, senderRole) {
  const msgRef = conversationsRef.doc(conversationId).collection('messages');

  await msgRef.add({
    text,
    senderId,
    senderRole, // 'farmer' or 'officer'
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  // Update conversation metadata
  const unreadField = senderRole === 'farmer' ? 'unreadByOfficer' : 'unreadByFarmer';
  await conversationsRef.doc(conversationId).update({
    lastMessage: text,
    lastMessageAt: firestore.FieldValue.serverTimestamp(),
    [unreadField]: firestore.FieldValue.increment(1),
  });
}

/**
 * Subscribe to messages in a conversation (real-time)
 */
export function subscribeToMessages(conversationId, callback) {
  return conversationsRef
    .doc(conversationId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .onSnapshot(
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));
        callback(messages);
      },
      (error) => {
        console.error('Messages listener error:', error);
      },
    );
}

/**
 * Get conversations for a user (farmer or officer)
 */
export async function getConversations(userId, role) {
  const field = role === 'officer' ? 'officerId' : 'farmerId';
  const snapshot = await conversationsRef
    .where(field, '==', userId)
    .orderBy('lastMessageAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    lastMessageAt: doc.data().lastMessageAt?.toDate?.() || new Date(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
  }));
}

/**
 * Mark conversation as read
 */
export async function markAsRead(conversationId, role) {
  const field = role === 'officer' ? 'unreadByOfficer' : 'unreadByFarmer';
  await conversationsRef.doc(conversationId).update({
    [field]: 0,
  });
}

/**
 * Get all officers (from officers collection)
 */
export async function getOfficers() {
  const snapshot = await firestore()
    .collection('officers')
    .orderBy('name', 'asc')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Save/update officer profile when they sign up or log in
 */
export async function saveOfficerProfile(user) {
  const officerRef = firestore().collection('officers').doc(user.uid);
  const doc = await officerRef.get();

  const profile = {
    uid: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Officer',
    email: user.email || '',
    status: 'online',
    lastSeen: firestore.FieldValue.serverTimestamp(),
  };

  if (!doc.exists) {
    // First time — set defaults
    await officerRef.set({
      ...profile,
      title: 'Agricultural Officer',
      specialization: 'General Agriculture',
      location: 'Sri Lanka',
      phone: '',
      experience: '',
      rating: 0,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  } else {
    // Returning officer — update status
    await officerRef.update({
      status: 'online',
      lastSeen: firestore.FieldValue.serverTimestamp(),
      name: profile.name,
    });
  }
}

/**
 * Set officer offline
 */
export async function setOfficerOffline(userId) {
  await firestore().collection('officers').doc(userId).update({
    status: 'offline',
    lastSeen: firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId) {
  // Delete all messages in subcollection first
  const messagesSnap = await conversationsRef
    .doc(conversationId)
    .collection('messages')
    .get();

  const batch = firestore().batch();
  messagesSnap.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(conversationsRef.doc(conversationId));
  await batch.commit();
}

export default {
  getOrCreateConversation,
  sendMessage,
  subscribeToMessages,
  getConversations,
  markAsRead,
  getOfficers,
  saveOfficerProfile,
  setOfficerOffline,
  deleteConversation,
};
