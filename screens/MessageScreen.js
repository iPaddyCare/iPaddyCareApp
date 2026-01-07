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
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../src/context/LanguageContext';
import { useAuth } from '../src/context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
  },
};

// Sample messages (in a real app, this would come from backend)
const sampleMessages = [
  {
    id: 1,
    text: 'Hello! I need advice on seed quality for my paddy field.',
    sender: 'user',
    timestamp: '10:30 AM',
    date: 'Today',
  },
  {
    id: 2,
    text: 'Hello! How can I help you with your agricultural needs today?',
    sender: 'officer',
    timestamp: '10:32 AM',
    date: 'Today',
  },

];

const MessageBubble = ({ message, isUser, t }) => (
  <View style={[styles.messageBubble, isUser ? styles.userMessage : styles.officerMessage]}>
    <Text style={[styles.messageText, isUser && styles.userMessageText]}>
      {message.text}
    </Text>
    <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
      {message.timestamp}
    </Text>
  </View>
);

export default function MessageScreen({ route, navigation }) {
  const { selectedLanguage } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const t = translations[selectedLanguage];
  const [fadeAnim] = useState(new Animated.Value(0));
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(sampleMessages);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef(null);

  const officer = route?.params?.officer || {
    id: 1,
    name: 'Dr. Kamal Perera',
    title: 'Senior Agricultural Officer',
    status: 'online',
    image: '👨‍🌾',
  };

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to send messages.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    setSending(true);
    const newMessage = {
      id: messages.length + 1,
      text: messageText.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
    };

    // Add user message
    setMessages([...messages, newMessage]);
    setMessageText('');

    // Simulate officer response (in a real app, this would come from backend)
    setTimeout(() => {
      const officerResponse = {
        id: messages.length + 2,
        text: 'Thank you for your message. I will get back to you shortly.',
        sender: 'officer',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
      };
      setMessages(prev => [...prev, officerResponse]);
      setSending(false);
    }, 1500);
  };

  const handleShareTestHistory = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to share test history.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    // Navigate to test history selection or show selection modal
    Alert.alert(
      t.shareTestHistory,
      t.selectTests,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t.sendTestHistory,
          onPress: () => {
            // In a real app, select tests and send
            const testHistoryMessage = {
              id: messages.length + 1,
              text: '📊 Test History Shared: 6 tests',
              sender: 'user',
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              date: 'Today',
            };
            setMessages(prev => [...prev, testHistoryMessage]);
            Alert.alert(t.testHistoryShared, t.testHistorySharedDesc);
          },
        },
      ]
    );
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
                  <Text style={styles.officerImageEmoji}>{officer.image}</Text>
                </View>
                {officer.status === 'online' && (
                  <View style={styles.onlineIndicator} />
                )}
              </View>
              <View style={styles.headerText}>
                <Text style={styles.officerName}>{officer.name}</Text>
                <Text style={styles.officerTitle}>{officer.title}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={handleShareTestHistory}
            >
              <Icon name="share-variant" size={20} color="#FFFFFF" />
            </TouchableOpacity>
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
            {messages.length > 0 ? (
              messages.map((message, index) => {
                const isUser = message.sender === 'user';
                const showDate = index === 0 || messages[index - 1].date !== message.date;
                return (
                  <View key={message.id}>
                    {showDate && (
                      <View style={styles.dateSeparator}>
                        <Text style={styles.dateText}>{message.date}</Text>
                      </View>
                    )}
                    <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
                      <MessageBubble message={message} isUser={isUser} t={t} />
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
            <TouchableOpacity
              style={styles.attachButton}
              onPress={handleShareTestHistory}
              activeOpacity={0.7}
            >
              <Icon name="paperclip" size={20} color="#666" />
            </TouchableOpacity>
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

