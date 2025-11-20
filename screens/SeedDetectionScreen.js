import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

export default function SeedDetectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Seed Quality Detection</Text>
        <Text style={styles.subtitle}>AI-powered seed sorting coming soon.</Text>
        <Text style={styles.description}>
          This screen will host tools to scan your seed batches, detect wild paddy seeds,
          and provide quality metrics.
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

