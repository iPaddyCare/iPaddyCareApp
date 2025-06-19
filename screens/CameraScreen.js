import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function CameraScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Screen</Text>
      <Text style={styles.subtitle}>Camera functionality will be implemented here</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
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