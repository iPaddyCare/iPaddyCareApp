import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../src/context/LanguageContext';
import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getConversations,
  markAsRead,
  deleteConversation,
} from '../src/services/messagingService';

const { width } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    inbox: 'Inbox',
    messages: 'Messages',
    noMessages: 'No messages yet',
    noMessagesDesc: 'You will see messages from farmers here',
    search: 'Search conversations...',
    unread: 'Unread',
    read: 'Read',
    reply: 'Reply',
    viewConversation: 'View Conversation',
    user: 'User',
    lastMessage: 'Last message',
    newMessage: 'New',
    today: 'Today',
    yesterday: 'Yesterday',
    markAsRead: 'Mark as Read',
    delete: 'Delete',
  },
  සිංහල: {
    inbox: 'එන ලිපි',
    messages: 'පණිවිඩ',
    noMessages: 'තවමත් පණිවිඩ නොමැත',
    noMessagesDesc: 'ගොවීන්ගෙන් පණිවිඩ මෙහි දිස්වනු ඇත',
    search: 'සංවාද සොයන්න...',
    unread: 'නොකියවූ',
    read: 'කියවූ',
    reply: 'පිළිතුරු දෙන්න',
    viewConversation: 'සංවාදය බලන්න',
    user: 'පරිශීලක',
    lastMessage: 'අවසාන පණිවිඩය',
    newMessage: 'නව',
    today: 'අද',
    yesterday: 'ඊයේ',
    markAsRead: 'කියවූ ලෙස සලකුණු කරන්න',
    delete: 'මකන්න',
  },
  தமிழ்: {
    inbox: 'இன்பாக்ஸ்',
    messages: 'செய்திகள்',
    noMessages: 'இன்னும் செய்திகள் இல்லை',
    noMessagesDesc: 'விவசாயிகளிடமிருந்து செய்திகள் இங்கே தோன்றும்',
    search: 'உரையாடல்களைத் தேடவும்...',
    unread: 'படிக்காத',
    read: 'படித்தது',
    reply: 'பதிலளிக்க',
    viewConversation: 'உரையாடலைக் காண்க',
    user: 'பயனர்',
    lastMessage: 'கடைசி செய்தி',
    newMessage: 'புதிய',
    today: 'இன்று',
    yesterday: 'நேற்று',
    markAsRead: 'படித்ததாகக் குறிக்க',
    delete: 'நீக்கு',
  },
};

const formatDate = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function OfficerInboxScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const { user, isOfficer } = useAuth();
  const t = translations[selectedLanguage];
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const data = await getConversations(user.uid, 'officer');
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  }, [user]);

  const filteredConversations = conversations.filter((conv) => {
    const name = (conv.farmerName || '').toLowerCase();
    const msg = (conv.lastMessage || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || msg.includes(q);
  });

  const handleConversationPress = async (conversation) => {
    // Mark as read when opening
    try {
      await markAsRead(conversation.id, 'officer');
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, unreadByOfficer: 0 } : c,
        ),
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }

    navigation.navigate('Message', {
      conversationId: conversation.id,
      farmerName: conversation.farmerName,
      officer: { name: user?.displayName || 'Officer' },
    });
  };

  const handleMarkAsRead = async (conversationId) => {
    try {
      await markAsRead(conversationId, 'officer');
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unreadByOfficer: 0 } : c,
        ),
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleDelete = (conversationId) => {
    Alert.alert(
      t.delete,
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation(conversationId);
              setConversations((prev) =>
                prev.filter((c) => c.id !== conversationId),
              );
            } catch (err) {
              console.error('Error deleting conversation:', err);
              Alert.alert('Error', 'Failed to delete conversation.');
            }
          },
        },
      ],
    );
  };

  const getDateLabel = (date) => {
    const label = formatDate(date);
    if (label === 'Today') return t.today;
    if (label === 'Yesterday') return t.yesterday;
    return label;
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0F5132"
        translucent={false}
      />
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        <View style={styles.statusBarContainer} />
      </SafeAreaView>
      <SafeAreaView
        style={styles.safeAreaContent}
        edges={['left', 'right', 'bottom']}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
          >
            <Icon name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t.inbox}</Text>
            <Text style={styles.headerSubtitle}>{t.messages}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon
            name="magnify"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t.search}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Conversations List */}
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#0F5132" />
            <Text style={[styles.emptyStateText, { marginTop: 12 }]}>
              Loading conversations...
            </Text>
          </View>
        ) : filteredConversations.length > 0 ? (
          <ScrollView
            style={styles.conversationsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {filteredConversations.map((conversation) => {
              const hasUnread =
                conversation.unreadByOfficer &&
                conversation.unreadByOfficer > 0;
              return (
                <TouchableOpacity
                  key={conversation.id}
                  style={[
                    styles.conversationCard,
                    hasUnread && styles.conversationCardUnread,
                  ]}
                  onPress={() => handleConversationPress(conversation)}
                  activeOpacity={0.7}
                >
                  <View style={styles.conversationHeader}>
                    <View style={styles.userInfo}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {(conversation.farmerName || 'F')
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.userDetails}>
                        <View style={styles.userNameRow}>
                          <Text style={styles.userName}>
                            {conversation.farmerName || 'Farmer'}
                          </Text>
                          {hasUnread && (
                            <View style={styles.unreadBadge}>
                              <Text style={styles.unreadBadgeText}>
                                {conversation.unreadByOfficer}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.userEmail}>
                          {conversation.farmerEmail || ''}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.conversationActions}>
                      <Text style={styles.timestamp}>
                        {getDateLabel(conversation.lastMessageAt)}
                      </Text>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleMarkAsRead(conversation.id)}
                      >
                        <Icon
                          name={
                            hasUnread
                              ? 'email-mark-as-unread'
                              : 'email-open'
                          }
                          size={18}
                          color="#666"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDelete(conversation.id)}
                      >
                        <Icon
                          name="delete-outline"
                          size={18}
                          color="#E91E63"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.lastMessage,
                      hasUnread && styles.lastMessageUnread,
                    ]}
                    numberOfLines={2}
                  >
                    {conversation.lastMessage || 'No messages yet'}
                  </Text>
                  <View style={styles.conversationFooter}>
                    <Text style={styles.timeText}>
                      {formatTime(conversation.lastMessageAt)}
                    </Text>
                    {hasUnread && (
                      <View style={styles.newIndicator}>
                        <Text style={styles.newIndicatorText}>
                          {t.newMessage}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="email-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>{t.noMessages}</Text>
            <Text style={styles.emptyStateText}>{t.noMessagesDesc}</Text>
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
    height: 0,
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
  headerContent: {
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  clearButton: {
    padding: 4,
  },
  conversationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  conversationCard: {
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
  conversationCardUnread: {
    backgroundColor: '#F0F7F3',
    borderLeftWidth: 4,
    borderLeftColor: '#0F5132',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F5132',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#0F5132',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
  },
  conversationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  actionButton: {
    padding: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  lastMessageUnread: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  newIndicator: {
    backgroundColor: '#0F5132',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
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
});
