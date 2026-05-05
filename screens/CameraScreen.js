import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useTranslation } from '../src/i18n/useTranslation';

export default function CameraScreen({ navigation }) {
  const translate = useTranslation('camera');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{translate('title')}</Text>
      <Text style={styles.subtitle}>{translate('subtitle')}</Text>
      <Button title={translate('goBack')} onPress={() => navigation.goBack()} />
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
