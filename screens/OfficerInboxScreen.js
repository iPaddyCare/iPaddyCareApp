import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../src/context/LanguageContext';
import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    inbox: 'Inbox',
    messages: 'Messages',
    noMessages: 'No messages yet',
    noMessagesDesc: 'You will see messages from users here',
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
    noMessagesDesc: 'පරිශීලකයන්ගෙන් පණිවිඩ මෙහි දිස්වනු ඇත',
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
    noMessagesDesc: 'பயனர்களிடமிருந்து செய்திகள் இங்கே தோன்றும்',
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

// Sample conversations (in a real app, this would come from backend)
const sampleConversations = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Kamal Perera',
    userEmail: 'kamal@example.com',
    lastMessage: 'Hello! I need advice on seed quality for my paddy field.',
    timestamp: '08:30 AM',
    date: 'Today',
    unread: true,
    unreadCount: 2,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Samantha Silva',
    userEmail: 'samantha@example.com',
    lastMessage: 'Thank you for your help with the soil pH test.',
    timestamp: 'Yesterday',
    date: 'Yesterday',
    unread: false,
    unreadCount: 0,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Priya Nadesan',
    userEmail: 'priya@example.com',
    lastMessage: 'Can you help me identify this pest?',
    timestamp: '2 days ago',
    date: '2 days ago',
    unread: true,
    unreadCount: 1,
  },
];

export default function OfficerInboxScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const { user, isOfficer } = useAuth();
  const t = translations[selectedLanguage];
  const [conversations, setConversations] = useState(sampleConversations);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // In a real app, fetch conversations from backend
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app, fetch conversations from backend
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationPress = (conversation) => {
    navigation.navigate('Message', {
      conversation: conversation,
      isOfficerView: true,
    });
  };

  const handleMarkAsRead = (conversationId) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unread: false, unreadCount: 0 }
          : conv
      )
    );
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
          onPress: () => {
            setConversations(prev => prev.filter(conv => conv.id !== conversationId));
          },
        },
      ]
    );
  };

  const formatDate = (date) => {
    if (date === 'Today') return t.today;
    if (date === 'Yesterday') return t.yesterday;
    return date;
  };

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
          <Icon name="magnify" size={20} color="#999" style={styles.searchIcon} />
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
        {filteredConversations.length > 0 ? (
          <ScrollView
            style={styles.conversationsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {filteredConversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                style={[
                  styles.conversationCard,
                  conversation.unread && styles.conversationCardUnread,
                ]}
                onPress={() => handleConversationPress(conversation)}
                activeOpacity={0.7}
              >
                <View style={styles.conversationHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {conversation.userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.userDetails}>
                      <View style={styles.userNameRow}>
                        <Text style={styles.userName}>{conversation.userName}</Text>
                        {conversation.unread && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>
                              {conversation.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.userEmail}>{conversation.userEmail}</Text>
                    </View>
                  </View>
                  <View style={styles.conversationActions}>
                    <Text style={styles.timestamp}>{formatDate(conversation.date)}</Text>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleMarkAsRead(conversation.id)}
                    >
                      <Icon
                        name={conversation.unread ? 'email-mark-as-unread' : 'email-open'}
                        size={18}
                        color="#666"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(conversation.id)}
                    >
                      <Icon name="delete-outline" size={18} color="#E91E63" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text
                  style={[
                    styles.lastMessage,
                    conversation.unread && styles.lastMessageUnread,
                  ]}
                  numberOfLines={2}
                >
                  {conversation.lastMessage}
                </Text>
                <View style={styles.conversationFooter}>
                  <Text style={styles.timeText}>{conversation.timestamp}</Text>
                  {conversation.unread && (
                    <View style={styles.newIndicator}>
                      <Text style={styles.newIndicatorText}>{t.newMessage}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
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

