import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * Comprehensive list of Sri Lankan cities and towns.
 * Also exported so MarketplaceScreen can use it for district filter pills.
 */
export const SL_CITIES = [
  // Western Province — Colombo District
  'Colombo', 'Dehiwala', 'Moratuwa', 'Kesbewa', 'Maharagama',
  'Kaduwela', 'Kolonnawa', 'Sri Jayawardenepura Kotte', 'Boralesgamuwa',
  'Homagama', 'Avissawella', 'Padukka', 'Hanwella', 'Angoda',
  // Western Province — Gampaha District
  'Gampaha', 'Negombo', 'Wattala', 'Kelaniya', 'Ja-Ela',
  'Kadawatha', 'Ragama', 'Minuwangoda', 'Divulapitiya', 'Mirigama',
  'Veyangoda', 'Nittambuwa', 'Kiribathgoda',
  // Western Province — Kalutara District
  'Kalutara', 'Panadura', 'Horana', 'Beruwala', 'Aluthgama',
  'Matugama', 'Bandaragama', 'Ingiriya',
  // Central Province — Kandy District
  'Kandy', 'Peradeniya', 'Katugastota', 'Gampola', 'Talawakele',
  // Central Province — Matale District
  'Matale', 'Dambulla', 'Galewela', 'Rattota', 'Ukuwela',
  // Central Province — Nuwara Eliya District
  'Nuwara Eliya', 'Hatton', 'Nawalapitiya', 'Ginigathena', 'Kotagala',
  // Southern Province — Galle District
  'Galle', 'Hikkaduwa', 'Ambalangoda', 'Balapitiya', 'Elpitiya',
  'Karandeniya',
  // Southern Province — Matara District
  'Matara', 'Weligama', 'Mirissa', 'Akuressa', 'Deniyaya',
  'Dickwella', 'Kamburugamuwa',
  // Southern Province — Hambantota District
  'Hambantota', 'Tangalle', 'Tissamaharama', 'Beliatta',
  'Ambalantota', 'Weeraketiya',
  // Northern Province — Jaffna District
  'Jaffna', 'Nallur', 'Chavakachcheri', 'Point Pedro', 'Tellippalai',
  'Kopay', 'Manipay',
  // Northern Province — Other Districts
  'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya',
  // Eastern Province — Trincomalee District
  'Trincomalee', 'Kinniya', 'Mutur', 'Kantale',
  // Eastern Province — Batticaloa District
  'Batticaloa', 'Eravur', 'Chenkaladi',
  // Eastern Province — Ampara District
  'Ampara', 'Kalmunai', 'Sammanthurai', 'Pottuvil', 'Akkaraipattu',
  // North Western Province — Kurunegala District
  'Kurunegala', 'Kuliyapitiya', 'Narammala', 'Mawathagama',
  'Pannala', 'Ibbagamuwa', 'Wariyapola', 'Nikaweratiya', 'Giriulla',
  // North Western Province — Puttalam District
  'Puttalam', 'Chilaw', 'Wennappuwa', 'Marawila', 'Nattandiya',
  'Dankotuwa', 'Anamaduwa',
  // North Central Province — Anuradhapura District
  'Anuradhapura', 'Kekirawa', 'Mihintale', 'Medawachchiya',
  'Nochchiyagama', 'Eppawala', 'Thambuttegama',
  // North Central Province — Polonnaruwa District
  'Polonnaruwa', 'Kaduruwela', 'Medirigiriya', 'Hingurakgoda',
  // Uva Province — Badulla District
  'Badulla', 'Bandarawela', 'Welimada', 'Haputale', 'Ella',
  'Diyatalawa', 'Mahiyanganaya',
  // Uva Province — Monaragala District
  'Monaragala', 'Bibile', 'Wellawaya', 'Buttala', 'Medagama',
  // Sabaragamuwa Province — Ratnapura District
  'Ratnapura', 'Embilipitiya', 'Balangoda', 'Pelmadulla',
  'Kahawatta', 'Kuruwita',
  // Sabaragamuwa Province — Kegalle District
  'Kegalle', 'Mawanella', 'Warakapola', 'Rambukkana', 'Dehiowita',
  'Ruwanwella', 'Galigamuwa',
];

// Keep SL_DISTRICTS as an alias for backward compat with MarketplaceScreen pills
export const SL_DISTRICTS = SL_CITIES;

const CITY_GROUPS = [
  { label: 'Western — Colombo', cities: ['Colombo','Dehiwala','Moratuwa','Kesbewa','Maharagama','Kaduwela','Kolonnawa','Sri Jayawardenepura Kotte','Boralesgamuwa','Homagama','Avissawella','Padukka','Hanwella','Angoda'] },
  { label: 'Western — Gampaha', cities: ['Gampaha','Negombo','Wattala','Kelaniya','Ja-Ela','Kadawatha','Ragama','Minuwangoda','Divulapitiya','Mirigama','Veyangoda','Nittambuwa','Kiribathgoda'] },
  { label: 'Western — Kalutara', cities: ['Kalutara','Panadura','Horana','Beruwala','Aluthgama','Matugama','Bandaragama','Ingiriya'] },
  { label: 'Central — Kandy', cities: ['Kandy','Peradeniya','Katugastota','Gampola','Talawakele'] },
  { label: 'Central — Matale', cities: ['Matale','Dambulla','Galewela','Rattota','Ukuwela'] },
  { label: 'Central — Nuwara Eliya', cities: ['Nuwara Eliya','Ginigathena','Kotagala'] },
  { label: 'Southern — Galle', cities: ['Galle','Hikkaduwa','Ambalangoda','Balapitiya','Elpitiya','Karandeniya'] },
  { label: 'Southern — Matara', cities: ['Matara','Weligama','Mirissa','Akuressa','Deniyaya','Dickwella','Kamburugamuwa'] },
  { label: 'Southern — Hambantota', cities: ['Hambantota','Tangalle','Tissamaharama','Beliatta','Ambalantota','Weeraketiya'] },
  { label: 'Northern — Jaffna', cities: ['Jaffna','Nallur','Chavakachcheri','Point Pedro','Tellippalai','Kopay','Manipay'] },
  { label: 'Northern — Other', cities: ['Kilinochchi','Mannar','Mullaitivu','Vavuniya'] },
  { label: 'Eastern — Trincomalee', cities: ['Trincomalee','Kinniya','Mutur','Kantale'] },
  { label: 'Eastern — Batticaloa', cities: ['Batticaloa','Eravur','Chenkaladi'] },
  { label: 'Eastern — Ampara', cities: ['Ampara','Kalmunai','Sammanthurai','Pottuvil','Akkaraipattu'] },
  { label: 'North Western — Kurunegala', cities: ['Kurunegala','Kuliyapitiya','Narammala','Mawathagama','Pannala','Ibbagamuwa','Wariyapola','Nikaweratiya','Giriulla'] },
  { label: 'North Western — Puttalam', cities: ['Puttalam','Chilaw','Wennappuwa','Marawila','Nattandiya','Dankotuwa','Anamaduwa'] },
  { label: 'North Central — Anuradhapura', cities: ['Anuradhapura','Kekirawa','Mihintale','Medawachchiya','Nochchiyagama','Eppawala','Thambuttegama'] },
  { label: 'North Central — Polonnaruwa', cities: ['Polonnaruwa','Kaduruwela','Medirigiriya','Hingurakgoda'] },
  { label: 'Uva — Badulla', cities: ['Badulla','Bandarawela','Welimada','Haputale','Ella','Diyatalawa','Mahiyanganaya'] },
  { label: 'Uva — Monaragala', cities: ['Monaragala','Bibile','Wellawaya','Buttala','Medagama'] },
  { label: 'Sabaragamuwa — Ratnapura', cities: ['Ratnapura','Embilipitiya','Balangoda','Pelmadulla','Kahawatta','Kuruwita'] },
  { label: 'Sabaragamuwa — Kegalle', cities: ['Kegalle','Mawanella','Warakapola','Rambukkana','Dehiowita','Ruwanwella','Galigamuwa'] },
];

/**
 * CityPickerModal — bottom-sheet city picker for Sri Lanka.
 *
 * Props:
 *   visible    {boolean}
 *   selected   {string}   currently selected city (or '')
 *   onSelect   {(city: string) => void}
 *   onClose    {() => void}
 *   placeholder {string}
 */
export default function CityPickerModal({ visible, selected, onSelect, onClose, placeholder = 'Select City' }) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CITY_GROUPS;
    return CITY_GROUPS
      .map(group => ({
        ...group,
        cities: group.cities.filter(c => c.toLowerCase().includes(q)),
      }))
      .filter(group => group.cities.length > 0);
  }, [search]);

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  const handleSelect = (city) => {
    setSearch('');
    onSelect(city);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={handleClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select City</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.7}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={18} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
                <Icon name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* City list */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filtered.map(group => (
              <View key={group.label}>
                <Text style={styles.groupLabel}>{group.label}</Text>
                {group.cities.map(city => {
                  const isSelected = city === selected;
                  return (
                    <TouchableOpacity
                      key={city}
                      style={[styles.row, isSelected && styles.rowSelected]}
                      onPress={() => handleSelect(city)}
                      activeOpacity={0.7}
                    >
                      <Icon name="map-marker" size={16} color={isSelected ? '#0F5132' : '#999'} />
                      <Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>
                        {city}
                      </Text>
                      {isSelected && <Icon name="check" size={18} color="#0F5132" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            {filtered.length === 0 && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No cities found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    padding: 0,
  },
  list: {
    maxHeight: SCREEN_HEIGHT * 0.55,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 6,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
    gap: 10,
  },
  rowSelected: {
    backgroundColor: '#F0F7F3',
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  rowTextSelected: {
    color: '#0F5132',
    fontWeight: '700',
  },
  noResults: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
  },
});
