import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';

export default function MapPickerScreen({ navigation, route }) {
  const { onLocationSelect, initialLocation } = route.params || {};
  
  // Redirect to coordinate input since Google Maps requires API key
  React.useEffect(() => {
    navigation.replace('CoordinateInput', {
      onLocationSelect,
      initialLocation: initialLocation || { lat: 7.5, lon: 80.5 },
    });
  }, []);

  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || { lat: 7.5, lon: 80.5 }
  );
  const [loading, setLoading] = useState(true);

  // HTML for Google Maps with marker
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        let map;
        let marker;
        
        function initMap() {
          const center = { lat: ${selectedLocation.lat}, lng: ${selectedLocation.lon} };
          
          map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: center,
            mapTypeId: 'roadmap',
            restriction: {
              latLngBounds: {
                north: 10.0,
                south: 5.0,
                east: 82.0,
                west: 79.0
              },
              strictBounds: false
            }
          });
          
          marker = new google.maps.Marker({
            position: center,
            map: map,
            draggable: true
          });
          
          map.addListener('click', function(e) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            marker.setPosition({ lat: lat, lng: lng });
            window.ReactNativeWebView.postMessage(JSON.stringify({ lat, lon: lng }));
          });
          
          marker.addListener('dragend', function(e) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            window.ReactNativeWebView.postMessage(JSON.stringify({ lat, lon: lng }));
          });
          
          window.ReactNativeWebView.postMessage('MAP_LOADED');
        }
      </script>
      <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=&callback=initMap"
        onerror="window.ReactNativeWebView.postMessage('MAP_ERROR')">
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    const data = event.nativeEvent.data;
    if (data === 'MAP_LOADED') {
      setLoading(false);
    } else if (data === 'MAP_ERROR') {
      setLoading(false);
      handleMapError();
    } else {
      try {
        const location = JSON.parse(data);
        setSelectedLocation(location);
      } catch (e) {
        console.error('Error parsing location:', e);
      }
    }
  };

  const handleConfirm = () => {
    if (onLocationSelect) {
      onLocationSelect(selectedLocation);
    }
    navigation.goBack();
  };

  const handleUseDefault = () => {
    const defaultLocation = { lat: 7.5, lon: 80.5 };
    if (onLocationSelect) {
      onLocationSelect(defaultLocation);
    }
    navigation.goBack();
  };

  const handleOpenCoordinateInput = () => {
    navigation.replace('CoordinateInput', {
      onLocationSelect,
      initialLocation: selectedLocation,
    });
  };

  const handleMapError = () => {
    Alert.alert(
      'Map Unavailable',
      'Google Maps requires an API key. Would you like to enter coordinates manually instead?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enter Manually', onPress: handleOpenCoordinateInput },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#0F5132" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={styles.placeholder} />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0F5132" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        <WebView
          source={{ html: mapHTML }}
          onMessage={handleMessage}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.locationInfo}>
          <Icon name="map-marker" size={20} color="#0F5132" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>Selected Location</Text>
            <Text style={styles.locationValue}>
              {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
            </Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.defaultButton}
            onPress={handleUseDefault}
          >
            <Text style={styles.defaultButtonText}>Use Default</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={handleOpenCoordinateInput}
          >
            <Icon name="keyboard" size={18} color="#0F5132" />
            <Text style={styles.manualButtonText}>Manual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Icon name="check" size={20} color="white" />
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  mapContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  locationTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F5132',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  defaultButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    gap: 6,
  },
  manualButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F5132',
  },
  defaultButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
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

