// src/screens/HomeScreen.tsx

import * as React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Title style={styles.title}>🌾 Welcome to iPaddyCare</Title>
        <Paragraph style={styles.subtitle}>Your Smart Agriculture Assistant</Paragraph>

        <Card style={styles.card}>
          <Card.Content>
            <Button mode="contained" onPress={() => {}}>
              Seed Quality Detection
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Button mode="contained" onPress={() => {}}>
              Moisture Detector
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Button mode="contained" onPress={() => {}}>
              Soil pH Monitoring
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Button mode="contained" onPress={() => {}}>
              Pest & Disease Detection
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Button mode="contained" onPress={() => {}}>
              Marketplace
            </Button>
          </Card.Content>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginVertical: 8,
    elevation: 3,
  },
});

export default HomeScreen;