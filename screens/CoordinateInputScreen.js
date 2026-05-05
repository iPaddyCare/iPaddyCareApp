import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../src/context/LanguageContext';

const translations = {
  English: {
    headerTitle: 'Enter Location',
    locationCoords: 'Location Coordinates',
    locationCoordsDesc: 'Enter latitude and longitude for Sri Lanka (Lat: 5-10, Lon: 79-82)',
    latitude: 'Latitude',
    longitude: 'Longitude',
    latitudeRange: 'Range: 5.0 to 10.0 (Sri Lanka)',
    longitudeRange: 'Range: 79.0 to 82.0 (Sri Lanka)',
    useCurrentLocation: 'Use Current Location',
    preview: 'Preview',
    useDefault: 'Use Default (7.5, 80.5)',
    confirm: 'Confirm',
    invalidInput: 'Invalid Input',
    invalidInputMsg: 'Please enter valid numbers for latitude and longitude',
    invalidLatitude: 'Invalid Latitude',
    invalidLatitudeMsg: 'Latitude must be between 5.0 and 10.0 (Sri Lanka range)',
    invalidLongitude: 'Invalid Longitude',
    invalidLongitudeMsg: 'Longitude must be between 79.0 and 82.0 (Sri Lanka range)',
    useAnyway: 'Use Anyway',
    cancel: 'Cancel',
  },
  සිංහල: {
    headerTitle: 'ස්ථානය ඇතුළත් කරන්න',
    locationCoords: 'ස්ථාන ඛණ්ඩාංක',
    locationCoordsDesc: 'ශ්‍රී ලංකාව සඳහා අක්ෂාංශ සහ දේශාංශ ඇතුළත් කරන්න (අක්ෂාංශ: 5-10, දේශාංශ: 79-82)',
    latitude: 'අක්ෂාංශය',
    longitude: 'දේශාංශය',
    latitudeRange: 'පරාසය: 5.0 සිට 10.0 (ශ්‍රී ලංකාව)',
    longitudeRange: 'පරාසය: 79.0 සිට 82.0 (ශ්‍රී ලංකාව)',
    useCurrentLocation: 'වර්තමාන ස්ථානය භාවිතා කරන්න',
    preview: 'පෙරදසුන',
    useDefault: 'පෙරනිමිය භාවිතා කරන්න (7.5, 80.5)',
    confirm: 'තහවුරු කරන්න',
    invalidInput: 'වලංගු නොවන ආදානය',
    invalidInputMsg: 'කරුණාකර අක්ෂාංශ සහ දේශාංශ සඳහා වලංගු සංඛ්‍යා ඇතුළත් කරන්න',
    invalidLatitude: 'වලංගු නොවන අක්ෂාංශය',
    invalidLatitudeMsg: 'අක්ෂාංශය 5.0 සහ 10.0 අතර විය යුතුය (ශ්‍රී ලංකා පරාසය)',
    invalidLongitude: 'වලංගු නොවන දේශාංශය',
    invalidLongitudeMsg: 'දේශාංශය 79.0 සහ 82.0 අතර විය යුතුය (ශ්‍රී ලංකා පරාසය)',
    useAnyway: 'කෙසේවෙතත් භාවිතා කරන්න',
    cancel: 'අවලංගු කරන්න',
  },
  தமிழ்: {
    headerTitle: 'இடத்தை உள்ளிடவும்',
    locationCoords: 'இட ஆயத்தொலைவுகள்',
    locationCoordsDesc: 'இலங்கைக்கான அட்சரேகை மற்றும் தீர்க்கரேகையை உள்ளிடவும் (அட்சரேகை: 5-10, தீர்க்கரேகை: 79-82)',
    latitude: 'அட்சரேகை',
    longitude: 'தீர்க்கரேகை',
    latitudeRange: 'வரம்பு: 5.0 முதல் 10.0 (இலங்கை)',
    longitudeRange: 'வரம்பு: 79.0 முதல் 82.0 (இலங்கை)',
    useCurrentLocation: 'தற்போதைய இடத்தைப் பயன்படுத்தவும்',
    preview: 'முன்னோட்டம்',
    useDefault: 'இயல்புநிலையைப் பயன்படுத்தவும் (7.5, 80.5)',
    confirm: 'உறுதிப்படுத்தவும்',
    invalidInput: 'தவறான உள்ளீடு',
    invalidInputMsg: 'அட்சரேகை மற்றும் தீர்க்கரேகைக்கு சரியான எண்களை உள்ளிடவும்',
    invalidLatitude: 'தவறான அட்சரேகை',
    invalidLatitudeMsg: 'அட்சரேகை 5.0 மற்றும் 10.0 இடையே இருக்க வேண்டும் (இலங்கை வரம்பு)',
    invalidLongitude: 'தவறான தீர்க்கரேகை',
    invalidLongitudeMsg: 'தீர்க்கரேகை 79.0 மற்றும் 82.0 இடையே இருக்க வேண்டும் (இலங்கை வரம்பு)',
    useAnyway: 'எப்படியும் பயன்படுத்து',
    cancel: 'ரத்து செய்',
  },
};

export default function CoordinateInputScreen({ navigation, route }) {
  const { selectedLanguage } = useLanguage();
  const t = translations[selectedLanguage] || translations.English;
  const { onLocationSelect, initialLocation } = route.params || {};
  const [lat, setLat] = useState(initialLocation?.lat?.toString() || '7.5');
  const [lon, setLon] = useState(initialLocation?.lon?.toString() || '80.5');

  const handleConfirm = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      showAppAlert(t.invalidInput, t.invalidInputMsg);
      return;
    }

    // Validate Sri Lanka coordinates
    if (latitude < 5.0 || latitude > 10.0) {
      showAppAlert(
        t.invalidLatitude,
        t.invalidLatitudeMsg,
        [
          { text: t.useAnyway, onPress: () => proceedWithLocation(latitude, longitude) },
          { text: t.cancel, style: 'cancel' },
        ]
      );
      return;
    }

    if (longitude < 79.0 || longitude > 82.0) {
      showAppAlert(
        t.invalidLongitude,
        t.invalidLongitudeMsg,
        [
          { text: t.useAnyway, onPress: () => proceedWithLocation(latitude, longitude) },
          { text: t.cancel, style: 'cancel' },
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
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Icon name="information" size={24} color="#2196F3" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>{t.locationCoords}</Text>
            <Text style={styles.infoText}>
              {t.locationCoordsDesc}
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.latitude}</Text>
          <TextInput
            style={styles.input}
            value={lat}
            onChangeText={setLat}
            placeholder="7.5"
            keyboardType="numeric"
            autoCapitalize="none"
          />
          <Text style={styles.hint}>{t.latitudeRange}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.longitude}</Text>
          <TextInput
            style={styles.input}
            value={lon}
            onChangeText={setLon}
            placeholder="80.5"
            keyboardType="numeric"
            autoCapitalize="none"
          />
          <Text style={styles.hint}>{t.longitudeRange}</Text>
        </View>

        {initialLocation && (
          <TouchableOpacity style={styles.currentButton} onPress={handleUseCurrent}>
            <Icon name="crosshairs-gps" size={20} color="#2196F3" />
            <Text style={styles.currentButtonText}>{t.useCurrentLocation}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>{t.preview}</Text>
          <Text style={styles.previewValue}>
            {parseFloat(lat) || 0}, {parseFloat(lon) || 0}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.defaultButton} onPress={handleUseDefault}>
          <Text style={styles.defaultButtonText}>{t.useDefault}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Icon name="check" size={20} color="white" />
          <Text style={styles.confirmButtonText}>{t.confirm}</Text>
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

