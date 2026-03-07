import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CoordinateInputScreen({ navigation, route }) {
  const { onLocationSelect, initialLocation } = route.params || {};
  const [lat, setLat] = useState(initialLocation?.lat?.toString() || '7.5');
  const [lon, setLon] = useState(initialLocation?.lon?.toString() || '80.5');

  const handleConfirm = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for latitude and longitude');
      return;
    }

    // Validate Sri Lanka coordinates
    if (latitude < 5.0 || latitude > 10.0) {
      Alert.alert(
        'Invalid Latitude',
        'Latitude must be between 5.0 and 10.0 (Sri Lanka range)',
        [
          { text: 'Use Anyway', onPress: () => proceedWithLocation(latitude, longitude) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    if (longitude < 79.0 || longitude > 82.0) {
      Alert.alert(
        'Invalid Longitude',
        'Longitude must be between 79.0 and 82.0 (Sri Lanka range)',
        [
          { text: 'Use Anyway', onPress: () => proceedWithLocation(latitude, longitude) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    proceedWithLocation(latitude, longitude);
  };

  const proceedWithLocation = (latitude, longitude) => {
    if (onLocationSelect) {
      onLocationSelect({ lat: latitude, lon: longitude });
    }
    navigation.goBack();
  };

  const handleUseDefault = () => {
    if (onLocationSelect) {
      onLocationSelect({ lat: 7.5, lon: 80.5 });
    }
    navigation.goBack();
  };

  const handleUseCurrent = () => {
    if (initialLocation) {
      setLat(initialLocation.lat.toString());
      setLon(initialLocation.lon.toString());
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#0F5132" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter Location</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Icon name="information" size={24} color="#2196F3" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Location Coordinates</Text>
            <Text style={styles.infoText}>
              Enter latitude and longitude for Sri Lanka (Lat: 5-10, Lon: 79-82)
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Latitude</Text>
          <TextInput
            style={styles.input}
            value={lat}
            onChangeText={setLat}
            placeholder="7.5"
            keyboardType="numeric"
            autoCapitalize="none"
          />
          <Text style={styles.hint}>Range: 5.0 to 10.0 (Sri Lanka)</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.input}
            value={lon}
            onChangeText={setLon}
            placeholder="80.5"
            keyboardType="numeric"
            autoCapitalize="none"
          />
          <Text style={styles.hint}>Range: 79.0 to 82.0 (Sri Lanka)</Text>
        </View>

        {initialLocation && (
          <TouchableOpacity style={styles.currentButton} onPress={handleUseCurrent}>
            <Icon name="crosshairs-gps" size={20} color="#2196F3" />
            <Text style={styles.currentButtonText}>Use Current Location</Text>
          </TouchableOpacity>
        )}

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Preview</Text>
          <Text style={styles.previewValue}>
            {parseFloat(lat) || 0}, {parseFloat(lon) || 0}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.defaultButton} onPress={handleUseDefault}>
          <Text style={styles.defaultButtonText}>Use Default (7.5, 80.5)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Icon name="check" size={20} color="white" />
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  currentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  currentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  previewCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  defaultButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  defaultButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#0F5132',
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

