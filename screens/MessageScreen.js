import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../src/context/LanguageContext';
import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { sendMessage, subscribeToMessages, markAsRead } from '../src/services/messagingService';

const { width, height } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    typeMessage: 'Type a message...',
    send: 'Send',
    online: 'Online',
    offline: 'Offline',
    shareTestHistory: 'Share Test History',
    selectTests: 'Select tests to share',
    sendTestHistory: 'Send Test History',
    testHistoryShared: 'Test History Shared',
    testHistorySharedDesc: 'Test history has been shared',
    noMessages: 'No messages yet',
    noMessagesDesc: 'Start the conversation by sending a message',
    attachment: 'Attachment',
    sending: 'Sending...',
    loginRequired: 'Login Required',
    loginRequiredMsg: 'Please login to send messages.',
    cancel: 'Cancel',
    loginBtn: 'Login',
    error: 'Error',
    failedToSend: 'Failed to send message. Please try again.',
    today: 'Today',
    yesterday: 'Yesterday',
  },
  සිංහල: {
    typeMessage: 'පණිවිඩයක් ටයිප් කරන්න...',
    send: 'යවන්න',
    online: 'සබැඳි',
    offline: 'අසබැඳි',
    shareTestHistory: 'පරීක්ෂණ ඉතිහාසය බෙදාගන්න',
    selectTests: 'බෙදාගැනීමට පරීක්ෂණ තෝරන්න',
    sendTestHistory: 'පරීක්ෂණ ඉතිහාසය යවන්න',
    testHistoryShared: 'පරීක්ෂණ ඉතිහාසය බෙදාගන්නා ලදී',
    testHistorySharedDesc: 'පරීක්ෂණ ඉතිහාසය බෙදාගන්නා ලදී',
    noMessages: 'තවමත් පණිවිඩ නොමැත',
    noMessagesDesc: 'පණිවිඩයක් යවමින් සංවාදය ආරම්භ කරන්න',
    attachment: 'ඇමුණුම',
    sending: 'යවමින්...',
    loginRequired: 'පිවිසීම අවශ්‍යයි',
    loginRequiredMsg: 'පණිවිඩ යැවීමට කරුණාකර පිවිසෙන්න.',
    cancel: 'අවලංගු කරන්න',
    loginBtn: 'පිවිසෙන්න',
    error: 'දෝෂය',
    failedToSend: 'පණිවිඩය යැවීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.',
    today: 'අද',
    yesterday: 'ඊයේ',
  },
  தமிழ்: {
    typeMessage: 'செய்தியைத் தட்டச்சு செய்யவும்...',
    send: 'அனுப்ப',
    online: 'ஆன்லைன்',
    offline: 'ஆஃப்லைன்',
    shareTestHistory: 'சோதனை வரலாற்றைப் பகிரவும்',
    selectTests: 'பகிர்வதற்கு சோதனைகளைத் தேர்ந்தெடுக்கவும்',
    sendTestHistory: 'சோதனை வரலாற்றை அனுப்ப',
    testHistoryShared: 'சோதனை வரலாறு பகிரப்பட்டது',
    testHistorySharedDesc: 'சோதனை வரலாறு பகிரப்பட்டது',
    noMessages: 'இன்னும் செய்திகள் இல்லை',
    noMessagesDesc: 'செய்தியை அனுப்புவதன் மூலம் உரையாடலைத் தொடங்குங்கள்',
    attachment: 'இணைப்பு',
    sending: 'அனுப்புகிறது...',
    loginRequired: 'உள்நுழைவு தேவை',
    loginRequiredMsg: 'செய்திகளை அனுப்ப உள்நுழையவும்.',
    cancel: 'ரத்து',
    loginBtn: 'உள்நுழை',
    error: 'பிழை',
    failedToSend: 'செய்தியை அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    today: 'இன்று',
    yesterday: 'நேற்று',
  },
};

const formatTime = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date, t) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return t?.today || 'Today';
  if (d.toDateString() === yesterday.toDateString()) return t?.yesterday || 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const MessageBubble = ({ message, isUser }) => (
  <View style={[styles.messageBubble, isUser ? styles.userMessage : styles.officerMessage]}>
    <Text style={[styles.messageText, isUser && styles.userMessageText]}>
      {message.text}
    </Text>
    <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
      {formatTime(message.createdAt)}
    </Text>
  </View>
);

export default function MessageScreen({ route, navigation }) {
  const { selectedLanguage } = useLanguage();
  const { user, isAuthenticated, isOfficer } = useAuth();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef(null);

  const conversationId = route?.params?.conversationId;
  const officer = route?.params?.officer || {};
  // For officer inbox, the "other party" is the farmer
  const farmerName = route?.params?.farmerName || '';

  const senderRole = isOfficer ? 'officer' : 'farmer';

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    // Mark as read
    if (user) {
      markAsRead(conversationId, senderRole).catch(console.error);
    }

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId) return;

    if (!isAuthenticated) {
      showAppAlert(t.loginRequired, t.loginRequiredMsg, [
        { text: t.cancel, style: 'cancel' },
        { text: t.loginBtn, onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      await sendMessage(conversationId, text, user.uid, senderRole);
    } catch (error) {
      console.error('Error sending message:', error);
      showAppAlert(t.error, t.failedToSend);
      setMessageText(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F5132" translucent={false} />
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        <View style={styles.statusBarContainer} />
      </SafeAreaView>
 
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <SafeAreaView style={styles.safeAreaContent} edges={['left', 'right', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <View style={styles.officerImageContainer}>
                <View style={styles.officerImagePlaceholder}>
                  <Text style={styles.officerImageEmoji}>👨‍🌾</Text>
                </View>
                {officer.status === 'online' && (
                  <View style={styles.onlineIndicator} />
                )}
              </View>
              <View style={styles.headerText}>
                <Text style={styles.officerName}>
                  {isOfficer ? (farmerName || 'Farmer') : (officer.name || 'Officer')}
                </Text>
                <Text style={styles.officerTitle}>
                  {isOfficer ? 'Farmer' : (officer.title || 'Agricultural Officer')}
                </Text>
              </View>
            </View>
            <View style={styles.moreButton} />
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={[
              styles.messagesContent,
              { paddingBottom: 20, paddingTop: 20 }
            ]}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color="#0F5132" />
              </View>
            ) : messages.length > 0 ? (
              messages.map((message, index) => {
                const isMe = message.senderId === user?.uid;
                const msgDate = formatDate(message.createdAt, t);
                const prevDate = index > 0 ? formatDate(messages[index - 1].createdAt, t) : '';
                const showDate = index === 0 || msgDate !== prevDate;
                return (
                  <View key={message.id}>
                    {showDate && (
                      <View style={styles.dateSeparator}>
                        <Text style={styles.dateText}>{msgDate}</Text>
                      </View>
                    )}
                    <View style={[styles.messageRow, isMe && styles.userMessageRow]}>
                      <MessageBubble message={message} isUser={isMe} />
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>💬</Text>
                <Text style={styles.emptyStateTitle}>{t.noMessages}</Text>
                <Text style={styles.emptyStateText}>{t.noMessagesDesc}</Text>
              </View>
            )}
            {sending && (
              <View style={styles.sendingIndicator}>
                <Text style={styles.sendingText}>{t.sending}</Text>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <View style={styles.attachButton} />
            <TextInput
              style={styles.messageInput}
              placeholder={t.typeMessage}
              placeholderTextColor="#999"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!messageText.trim() || sending}
              activeOpacity={0.7}
            >
              <Icon name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F5132',
  },
  safeAreaTop: {
    backgroundColor: '#0F5132',
  },
  statusBarContainer: {
    height: 0,
  },
  keyboardView: {
    flex: 1,
  },
  safeAreaContent: {
    flex: 1,
    backgroundColor: '#F0F7F3',
  },
  keyboardView: {
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  officerImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  officerImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  officerImageEmoji: {
    fontSize: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0F5132',
  },
  headerText: {
    flex: 1,
  },
  officerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  officerTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#F0F7F3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  officerMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userMessage: {
    backgroundColor: '#0F5132',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    minHeight: 64,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A1A',
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F5132',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendingIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sendingText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

