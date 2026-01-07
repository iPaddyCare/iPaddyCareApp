import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

export default function SoilPHScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Soil pH Testing</Text>
        <Text style={styles.subtitle}>Smart soil analysis toolkit.</Text>
        <Text style={styles.description}>
          This module will guide you through soil sampling, capture pH readings, and
          translate the results into clear fertilizer and amendment instructions.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#4F4F4F',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 24,
  },
});

