import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';

export default function MoistureDetectorScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Moisture Monitor</Text>
        <Text style={styles.subtitle}>Portable field testing dashboard.</Text>
        <Text style={styles.description}>
          Soon you will be able to pair moisture sensors, view live readings, and receive
          alerts and recommendations tailored to your crop stage.
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

