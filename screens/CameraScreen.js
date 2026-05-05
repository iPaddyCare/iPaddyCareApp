import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useLanguage } from '../src/context/LanguageContext';

const translations = {
  English: {
    title: 'Camera Screen',
    subtitle: 'Camera functionality will be implemented here',
    goBack: 'Go Back',
  },
  සිංහල: {
    title: 'කැමරා තිරය',
    subtitle: 'කැමරා ක්‍රියාකාරිත්වය මෙහි ක්‍රියාත්මක කෙරෙනු ඇත',
    goBack: 'ආපසු යන්න',
  },
  தமிழ்: {
    title: 'கேமரா திரை',
    subtitle: 'கேமரா செயல்பாடு இங்கே செயல்படுத்தப்படும்',
    goBack: 'திரும்பு',
  },
};

export default function CameraScreen({ navigation }) {
  const { selectedLanguage } = useLanguage();
  const t = translations[selectedLanguage] || translations.English;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.title}</Text>
      <Text style={styles.subtitle}>{t.subtitle}</Text>
      <Button title={t.goBack} onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
});
