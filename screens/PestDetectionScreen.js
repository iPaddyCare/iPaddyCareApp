import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import BottomNavigation from '../src/components/BottomNavigation';

export default function PestDetectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pest & Disease Detection</Text>
        <Text style={styles.subtitle}>Early warning and diagnostics.</Text>
        <Text style={styles.description}>
          Upload plant images, run on-device detection, and access tailored treatment
          steps here in upcoming releases.
        </Text>
      </View>
      <BottomNavigation />
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

