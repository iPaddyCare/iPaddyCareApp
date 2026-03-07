import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ESP32Service from '../src/utils/esp32Service';
import PHSensorService from '../src/utils/phSensorService';
import BluetoothPermissionService from '../src/utils/bluetoothPermissionService';
import BleScanServiceEsp32 from '../src/utils/BleScanServiceEsp32';
import BLEService from '../src/utils/bleService';
import { useLanguage } from '../src/context/LanguageContext';

const { width } = Dimensions.get('window');

// Language translations
const translations = {
  English: {
    title: 'Connect Device',
    connectionMethod: 'Connection Method',
    wifi: 'WiFi',
    bluetooth: 'Bluetooth',
    findDevice: 'Connect Seed Moisture Detector',
    bluetoothMode: 'Bluetooth Mode:',
    bluetoothInstructions: 'Make sure the Seed Moisture Detector is powered on and Bluetooth is enabled. No WiFi network needed!',
    bluetoothPoint1: 'Device must be powered on',
    bluetoothPoint2: 'Bluetooth must be enabled on the device',
    bluetoothPoint3: 'Device should be within range (~10 meters)',
    apMode: 'Access Point Mode:',
    apModeInstructions: 'Connect your phone to the Seed Moisture Detector\'s WiFi network, then tap "Try 192.168.4.1" or scan.',
    wifiMode: 'WiFi Mode:',
    wifiModeInstructions: 'Make sure the Seed Moisture Detector and your phone are on the same WiFi network, then scan for devices.',
    manualIpEntry: 'Manual IP Entry',
    manualIpHint: 'If you know the Seed Moisture Detector\'s IP address, enter it here',
    quickConnect: 'Quick Connect (AP Mode)',
    quickConnectHint: 'If the device is in Access Point mode, try the default IP:',
    tryApIp: 'Try 192.168.4.1',
    test: 'Test',
    scanForDevices: 'Scan for Devices',
    scanForBluetooth: 'Scan for Bluetooth Devices',
    scanningNetwork: 'Scanning Network...',
    scanningBluetooth: 'Scanning Bluetooth...',
    scanning: 'Scanning...',
    foundDevices: 'Found Devices',
    connected: 'Connected',
    connect: 'Connect',
    disconnect: 'Disconnect',
    disconnectDevice: 'Disconnect Device',
    disconnectConfirm: 'Are you sure you want to disconnect?',
    cancel: 'Cancel',
    disconnected: 'Disconnected',
    disconnectedMessage: 'Device has been disconnected',
    noDevicesFound: 'No devices found',
    noDevicesHint: 'Tap "Scan for Devices" to search your network',
    deviceFound: 'Device Found!',
    deviceNotFound: 'Device Not Found',
    connectedSuccess: 'Connected!',
    connectionFailed: 'Connection Failed',
    connectionError: 'Connection Error',
    error: 'Error',
    ok: 'OK',
    invalidIp: 'Invalid IP',
    enterIp: 'Please enter an IP address',
    validIpHint: 'Please enter a valid IP address (e.g., 192.168.1.100)',
    bluetoothRequired: 'Bluetooth Required',
    enableBluetooth: 'Please enable Bluetooth in your device Settings to scan for Seed Moisture Detector.',
    bluetoothNotLinked: 'Bluetooth Module Not Linked',
    bluetoothNotLinkedMessage: 'The Bluetooth native module needs to be linked. Please:\n\n1. Open Terminal\n2. Run: cd ios && pod install\n3. Then rebuild: npx react-native run-ios\n\nOr use WiFi mode for now.',
    bluetoothNotSupported: 'Bluetooth Not Supported',
    bluetoothNotSupportedMessage: 'Bluetooth Low Energy is not supported on this device.\n\nThis usually happens on:\n• iOS Simulator (use a physical device)\n• Devices without BLE hardware\n\nPlease use WiFi mode to connect to the Seed Moisture Detector.',
    bluetoothNotEnabled: 'Bluetooth Not Enabled',
    bluetoothNotEnabledMessage: 'Please enable Bluetooth in your device Settings to scan for Seed Moisture Detector.',
    bluetoothPermission: 'Bluetooth Permission Required',
    bluetoothPermissionMessage: 'Please grant Bluetooth permissions in your device Settings to scan for Seed Moisture Detector.',
    moisture: 'Moisture:',
    successfullyConnected: 'Successfully connected to',
    viaBluetooth: 'via Bluetooth',
    couldNotConnect: 'Could not connect to device',
    failedToConnect: 'Failed to connect',
    deviceNotAtIp: 'Seed Moisture Detector not found at',
    deviceNotAtIpHint: 'Make sure the device is online and the endpoint is correct.',
    apModeDeviceNotFound: 'Seed Moisture Detector not found at',
    apModeDeviceNotFoundHint: 'Make sure:\n\n• Device is powered on\n• You\'re connected to the device\'s WiFi network\n• Device is in Access Point mode',
    failedToTest: 'Failed to test device',
  },
  සිංහල: {
    title: 'උපාංගය සම්බන්ධ කරන්න',
    connectionMethod: 'සම්බන්ධතා ක්‍රමය',
    wifi: 'WiFi',
    bluetooth: 'බ්ලූටූත්',
    findDevice: 'බීජ තෙතමනය අනාවරකය සම්බන්ධ කරන්න',
    bluetoothMode: 'බ්ලූටූත් ක්‍රමය:',
    bluetoothInstructions: 'බීජ තෙතමනය අනාවරකය බලයට සම්බන්ධ කර බ්ලූටූත් සක්‍රිය කර ඇති බවට වග බලා ගන්න. WiFi ජාලයක් අවශ්‍ය නොවේ!',
    bluetoothPoint1: 'උපාංගය බලයට සම්බන්ධ කර තිබිය යුතුය',
    bluetoothPoint2: 'උපාංගයේ බ්ලූටූත් සක්‍රිය කර තිබිය යුතුය',
    bluetoothPoint3: 'උපාංගය පරාසය තුළ තිබිය යුතුය (~10 මීටර්)',
    apMode: 'ප්‍රවේශ ලක්ෂ්‍ය ක්‍රමය:',
    apModeInstructions: 'ඔබේ දුරකථනය බීජ තෙතමනය අනාවරකයේ WiFi ජාලයට සම්බන්ධ කරන්න, පසුව "Try 192.168.4.1" ට තට්ටු කරන්න හෝ සොයන්න.',
    wifiMode: 'WiFi ක්‍රමය:',
    wifiModeInstructions: 'බීජ තෙතමනය අනාවරකය සහ දුරකථනය එකම WiFi ජාලයේ ඇති බවට වග බලා ගන්න, පසුව උපාංග සොයන්න.',
    manualIpEntry: 'අතින් IP ඇතුළත් කිරීම',
    manualIpHint: 'බීජ තෙතමනය අනාවරකයේ IP ලිපිනය දන්නේ නම්, මෙහි ඇතුළත් කරන්න',
    quickConnect: 'ඉක්මන් සම්බන්ධතාව (AP ක්‍රමය)',
    quickConnectHint: 'උපාංගය ප්‍රවේශ ලක්ෂ්‍ය ක්‍රමයේ නම්, පෙරනිමි IP උත්සාහ කරන්න:',
    tryApIp: '192.168.4.1 උත්සාහ කරන්න',
    test: 'පරීක්ෂා කරන්න',
    scanForDevices: 'උපාංග සොයන්න',
    scanForBluetooth: 'බ්ලූටූත් උපාංග සොයන්න',
    scanningNetwork: 'ජාලය සොයමින්...',
    scanningBluetooth: 'බ්ලූටූත් සොයමින්...',
    scanning: 'සොයමින්...',
    foundDevices: 'සොයාගත් උපාංග',
    connected: 'සම්බන්ධ වී ඇත',
    connect: 'සම්බන්ධ වන්න',
    disconnect: 'විසන්ධි කරන්න',
    disconnectDevice: 'උපාංගය විසන්ධි කරන්න',
    disconnectConfirm: 'ඔබට විසන්ධි කිරීමට අවශ්‍යද?',
    cancel: 'අවලංගු කරන්න',
    disconnected: 'විසන්ධි විය',
    disconnectedMessage: 'උපාංගය විසන්ධි කර ඇත',
    noDevicesFound: 'උපාංග හමු නොවීය',
    noDevicesHint: 'ඔබේ ජාලය සොයා බැලීමට "උපාංග සොයන්න" ට තට්ටු කරන්න',
    deviceFound: 'උපාංගය හමු විය!',
    deviceNotFound: 'උපාංගය හමු නොවීය',
    connectedSuccess: 'සම්බන්ධ විය!',
    connectionFailed: 'සම්බන්ධතාව අසාර්ථක විය',
    connectionError: 'සම්බන්ධතා දෝෂය',
    error: 'දෝෂය',
    ok: 'හරි',
    invalidIp: 'වලංගු නොවන IP',
    enterIp: 'කරුණාකර IP ලිපිනයක් ඇතුළත් කරන්න',
    validIpHint: 'කරුණාකර වලංගු IP ලිපිනයක් ඇතුළත් කරන්න (උදා: 192.168.1.100)',
    bluetoothRequired: 'බ්ලූටූත් අවශ්‍ය',
    enableBluetooth: 'බීජ තෙතමනය අනාවරකය සොයා බැලීමට ඔබේ උපාංග සැකසුම්වල බ්ලූටූත් සක්‍රිය කරන්න.',
    bluetoothNotLinked: 'බ්ලූටූත් මොඩියුලය සම්බන්ධ නොවීය',
    bluetoothNotLinkedMessage: 'බ්ලූටූත් ස්වදේශීය මොඩියුලය සම්බන්ධ කිරීමට අවශ්‍යය. කරුණාකර:\n\n1. Terminal විවෘත කරන්න\n2. Run: cd ios && pod install\n3. පසුව නැවත ගොඩනගන්න: npx react-native run-ios\n\nහෝ දැනට WiFi ක්‍රමය භාවිතා කරන්න.',
    bluetoothNotSupported: 'බ්ලූටූත් සහාය නොදක්වයි',
    bluetoothNotSupportedMessage: 'මෙම උපාංගයේ Bluetooth Low Energy සහාය නොදක්වයි.\n\nමෙය සාමාන්‍යයෙන් සිදු වන්නේ:\n• iOS Simulator (භෞතික උපාංගයක් භාවිතා කරන්න)\n• BLE දෘඩාංග නොමැති උපාංග\n\nකරුණාකර බීජ තෙතමනය අනාවරකයට සම්බන්ධ වීමට WiFi ක්‍රමය භාවිතා කරන්න.',
    bluetoothNotEnabled: 'බ්ලූටූත් සක්‍රිය නොවේ',
    bluetoothNotEnabledMessage: 'බීජ තෙතමනය අනාවරකය සොයා බැලීමට ඔබේ උපාංග සැකසුම්වල බ්ලූටූත් සක්‍රිය කරන්න.',
    bluetoothPermission: 'බ්ලූටූත් අවසරය අවශ්‍ය',
    bluetoothPermissionMessage: 'බීජ තෙතමනය අනාවරකය සොයා බැලීමට ඔබේ උපාංග සැකසුම්වල බ්ලූටූත් අවසර ලබා දෙන්න.',
    moisture: 'තෙතමනය:',
    successfullyConnected: 'සාර්ථකව සම්බන්ධ විය',
    viaBluetooth: 'බ්ලූටූත් හරහා',
    couldNotConnect: 'උපාංගයට සම්බන්ධ වීමට නොහැකි විය',
    failedToConnect: 'සම්බන්ධ වීමට අසාර්ථක විය',
    deviceNotAtIp: 'බීජ තෙතමනය අනාවරකය හමු නොවීය',
    deviceNotAtIpHint: 'උපාංගය සබැඳිව ඇති බවට සහ අන්ත ලක්ෂ්‍යය නිවැරදි බවට වග බලා ගන්න.',
    apModeDeviceNotFound: 'බීජ තෙතමනය අනාවරකය හමු නොවීය',
    apModeDeviceNotFoundHint: 'වග බලා ගන්න:\n\n• උපාංගය බලයට සම්බන්ධ කර ඇත\n• ඔබ උපාංගයේ WiFi ජාලයට සම්බන්ධ වී ඇත\n• උපාංගය ප්‍රවේශ ලක්ෂ්‍ය ක්‍රමයේ ඇත',
    failedToTest: 'උපාංගය පරීක්ෂා කිරීමට අසාර්ථක විය',
  },
  தமிழ்: {
    title: 'சாதனத்தை இணைக்கவும்',
    connectionMethod: 'இணைப்பு முறை',
    wifi: 'WiFi',
    bluetooth: 'புளூடூத்',
    findDevice: 'விதை ஈரப்பத கண்டறியும் சாதனத்தை இணைக்கவும்',
    bluetoothMode: 'புளூடூத் முறை:',
    bluetoothInstructions: 'விதை ஈரப்பத கண்டறியும் சாதனம் இயக்கத்தில் உள்ளது மற்றும் புளூடூத் இயக்கப்பட்டுள்ளது என்பதை உறுதிப்படுத்தவும். WiFi நெட்வொர்க் தேவையில்லை!',
    bluetoothPoint1: 'சாதனம் இயக்கத்தில் இருக்க வேண்டும்',
    bluetoothPoint2: 'சாதனத்தின் புளூடூத் இயக்கப்பட வேண்டும்',
    bluetoothPoint3: 'சாதனம் வரம்பிற்குள் இருக்க வேண்டும் (~10 மீட்டர்)',
    apMode: 'அணுகல் புள்ளி முறை:',
    apModeInstructions: 'உங்கள் தொலைபேசியை விதை ஈரப்பத கண்டறியும் சாதனத்தின் WiFi நெட்வொர்க்குடன் இணைக்கவும், பின்னர் "Try 192.168.4.1" ஐத் தட்டவும் அல்லது ஸ்கேன் செய்யவும்.',
    wifiMode: 'WiFi முறை:',
    wifiModeInstructions: 'விதை ஈரப்பத கண்டறியும் சாதனம் மற்றும் தொலைபேசி ஒரே WiFi நெட்வொர்க்கில் உள்ளன என்பதை உறுதிப்படுத்தவும், பின்னர் சாதனங்களை ஸ்கேன் செய்யவும்.',
    manualIpEntry: 'கைமுறை IP நுழைவு',
    manualIpHint: 'விதை ஈரப்பத கண்டறியும் சாதனத்தின் IP முகவரியை நீங்கள் அறிந்திருந்தால், இங்கே உள்ளிடவும்',
    quickConnect: 'விரைவு இணைப்பு (AP முறை)',
    quickConnectHint: 'சாதனம் அணுகல் புள்ளி முறையில் இருந்தால், இயல்புநிலை IP ஐ முயற்சிக்கவும்:',
    tryApIp: '192.168.4.1 ஐ முயற்சிக்கவும்',
    test: 'சோதனை',
    scanForDevices: 'சாதனங்களை ஸ்கேன் செய்யவும்',
    scanForBluetooth: 'புளூடூத் சாதனங்களை ஸ்கேன் செய்யவும்',
    scanningNetwork: 'நெட்வொர்க்கை ஸ்கேன் செய்கிறது...',
    scanningBluetooth: 'புளூடூத்தை ஸ்கேன் செய்கிறது...',
    scanning: 'ஸ்கேன் செய்கிறது...',
    foundDevices: 'கண்டறியப்பட்ட சாதனங்கள்',
    connected: 'இணைக்கப்பட்டது',
    connect: 'இணைக்கவும்',
    disconnect: 'துண்டிக்கவும்',
    disconnectDevice: 'சாதனத்தை துண்டிக்கவும்',
    disconnectConfirm: 'நீங்கள் துண்டிக்க விரும்புகிறீர்களா?',
    cancel: 'ரத்துசெய்',
    disconnected: 'துண்டிக்கப்பட்டது',
    disconnectedMessage: 'சாதனம் துண்டிக்கப்பட்டது',
    noDevicesFound: 'சாதனங்கள் கண்டறியப்படவில்லை',
    noDevicesHint: 'உங்கள் நெட்வொர்க்கைத் தேட "சாதனங்களை ஸ்கேன் செய்யவும்" ஐத் தட்டவும்',
    deviceFound: 'சாதனம் கண்டறியப்பட்டது!',
    deviceNotFound: 'சாதனம் கண்டறியப்படவில்லை',
    connectedSuccess: 'இணைக்கப்பட்டது!',
    connectionFailed: 'இணைப்பு தோல்வியடைந்தது',
    connectionError: 'இணைப்பு பிழை',
    error: 'பிழை',
    ok: 'சரி',
    invalidIp: 'தவறான IP',
    enterIp: 'தயவுசெய்து IP முகவரியை உள்ளிடவும்',
    validIpHint: 'தயவுசெய்து சரியான IP முகவரியை உள்ளிடவும் (எ.கா: 192.168.1.100)',
    bluetoothRequired: 'புளூடூத் தேவை',
    enableBluetooth: 'விதை ஈரப்பத கண்டறியும் சாதனத்தை ஸ்கேன் செய்ய உங்கள் சாதன அமைப்புகளில் புளூடூத்தை இயக்கவும்.',
    bluetoothNotLinked: 'புளூடூத் தொகுதி இணைக்கப்படவில்லை',
    bluetoothNotLinkedMessage: 'புளூடூத் சொந்த தொகுதி இணைக்கப்பட வேண்டும். தயவுசெய்து:\n\n1. Terminal ஐத் திறக்கவும்\n2. Run: cd ios && pod install\n3. பின்னர் மீண்டும் கட்டமைக்கவும்: npx react-native run-ios\n\nஅல்லது இப்போது WiFi முறையைப் பயன்படுத்தவும்.',
    bluetoothNotSupported: 'புளூடூத் ஆதரிக்கப்படவில்லை',
    bluetoothNotSupportedMessage: 'இந்த சாதனத்தில் Bluetooth Low Energy ஆதரிக்கப்படவில்லை.\n\nஇது பொதுவாக நடக்கும்:\n• iOS Simulator (ஒரு உடல் சாதனத்தைப் பயன்படுத்தவும்)\n• BLE வன்பொருள் இல்லாத சாதனங்கள்\n\nதயவுசெய்து விதை ஈரப்பத கண்டறியும் சாதனத்துடன் இணைக்க WiFi முறையைப் பயன்படுத்தவும்.',
    bluetoothNotEnabled: 'புளூடூத் இயக்கப்படவில்லை',
    bluetoothNotEnabledMessage: 'விதை ஈரப்பத கண்டறியும் சாதனத்தை ஸ்கேன் செய்ய உங்கள் சாதன அமைப்புகளில் புளூடூத்தை இயக்கவும்.',
    bluetoothPermission: 'புளூடூத் அனுமதி தேவை',
    bluetoothPermissionMessage: 'விதை ஈரப்பத கண்டறியும் சாதனத்தை ஸ்கேன் செய்ய உங்கள் சாதன அமைப்புகளில் புளூடூத் அனுமதிகளை வழங்கவும்.',
    moisture: 'ஈரப்பதம்:',
    successfullyConnected: 'வெற்றிகரமாக இணைக்கப்பட்டது',
    viaBluetooth: 'புளூடூத் வழியாக',
    couldNotConnect: 'சாதனத்துடன் இணைக்க முடியவில்லை',
    failedToConnect: 'இணைக்க முடியவில்லை',
    deviceNotAtIp: 'விதை ஈரப்பத கண்டறியும் சாதனம் கண்டறியப்படவில்லை',
    deviceNotAtIpHint: 'சாதனம் ஆன்லைனில் உள்ளது மற்றும் முனையம் சரியானது என்பதை உறுதிப்படுத்தவும்.',
    apModeDeviceNotFound: 'விதை ஈரப்பத கண்டறியும் சாதனம் கண்டறியப்படவில்லை',
    apModeDeviceNotFoundHint: 'உறுதிப்படுத்தவும்:\n\n• சாதனம் இயக்கத்தில் உள்ளது\n• நீங்கள் சாதனத்தின் WiFi நெட்வொர்க்குடன் இணைக்கப்பட்டுள்ளீர்கள்\n• சாதனம் அணுகல் புள்ளி முறையில் உள்ளது',
    failedToTest: 'சாதனத்தை சோதிக்க முடியவில்லை',
  },
};

export default function DeviceConnectionScreen({ navigation, route }) {
  const { selectedLanguage } = useLanguage();
  const t = translations[selectedLanguage];
  const [connectionMode, setConnectionMode] = useState('wifi'); // 'wifi' or 'bluetooth'
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState([]);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [manualIp, setManualIp] = useState('');
  const [testingManual, setTestingManual] = useState(false);
  const [bleInitialized, setBleInitialized] = useState(false);

  // Determine if this is for BLE (pH sensor) or WiFi (moisture sensor) - from route params
  const isBLESensor = route?.params?.sensorType === 'pH' || route?.params?.sensorType === 'BLE';
  const service = isBLESensor ? PHSensorService : ESP32Service;
  
  // If route specifies BLE sensor, set connection mode to bluetooth
  useEffect(() => {
    if (isBLESensor) {
      setConnectionMode('bluetooth');
    }
  }, [isBLESensor]);

  // Don't initialize BLE on mount - wait until user actually tries to use it
  // This prevents errors when the native module isn't linked yet
  useEffect(() => {
    return () => {
      // Cleanup - stopScan is async but cleanup can't await
      BLEService.stopScan().catch(err => console.error('Error stopping scan:', err));
      BleScanServiceEsp32.stopScan?.().catch(err => console.error('Error stopping BLE scan:', err));
    };
  }, []);

  // Check if already connected
  useEffect(() => {
    const wifiDevice = ESP32Service.getConnectedDevice();
    const bleDevice = BLEService.getConnectedDevice();
    const phBleDevice = isBLESensor ? PHSensorService.getConnectedDevice() : null;
    
    if (wifiDevice) {
      setFoundDevices([{
        ...wifiDevice,
        name: `Seed Moisture Detector-${wifiDevice.ip?.split('.').pop() || 'WiFi'}`,
        status: 'connected',
        type: 'wifi',
      }]);
      setConnectionMode('wifi');
    } else if (phBleDevice) {
      // BLE device from PHSensorService (pH sensor)
      setFoundDevices([{
        ...phBleDevice,
        name: phBleDevice.name || 'ESP32-Soil-Sensor',
        status: 'connected',
        type: 'ble',
      }]);
      setConnectionMode('bluetooth');
    } else if (bleDevice) {
      // BLE device from BLEService (moisture sensor)
      setFoundDevices([{
        ...bleDevice,
        name: bleDevice.name || 'Seed Moisture Detector-BLE',
        status: 'connected',
        type: 'ble',
      }]);
      setConnectionMode('bluetooth');
    }
  }, [isBLESensor]);

  const handleScan = async () => {
    setIsScanning(true);
    setFoundDevices([]);
    setScanProgress({ current: 0, total: 0 });

    try {
      if (connectionMode === 'bluetooth' || isBLESensor) {
        // BLE Scan - support both BleScanServiceEsp32 (pH sensor) and BLEService (moisture sensor)
        if (isBLESensor) {
          // Use BleScanServiceEsp32 for pH sensor (from HEAD)
          console.log('Scanning for BLE devices (pH sensor)');
          // Request Bluetooth permissions before scanning
          const hasPermission = await BluetoothPermissionService.checkPermissions();
          if (!hasPermission) {
            const permissionGranted = await BluetoothPermissionService.requestPermissions();
            if (!permissionGranted) {
              Alert.alert(
                t.bluetoothPermission || 'Permission Required',
                t.bluetoothPermissionMessage || 'Bluetooth permissions are required to scan for devices. Please grant permissions in app settings.'
              );
              setIsScanning(false);
              return;
            }
          }

          // BLE scan using BleScanServiceEsp32
          const devices = await BleScanServiceEsp32.scanForDevices(
            (device) => {
              // Device found callback
              setFoundDevices(prev => {
                // Avoid duplicates
                if (prev.find(d => d.id === device.id)) {
                  return prev;
                }
                return [...prev, { ...device, type: 'ble' }];
              });
            },
            (current, total) => {
              // Progress callback
              setScanProgress({ current, total });
            }
          );

          if (devices.length === 0) {
            Alert.alert(
              t.noDevicesFound || 'No Devices Found',
              'No ESP32-Soil-Sensor devices were found. Make sure:\n\n• ESP32 sensor is powered on\n• Bluetooth is enabled on your phone\n• ESP32 sensor is in range'
            );
          }
        } else {
          // Use BLEService for moisture sensor (from origin/dev)
          if (!bleInitialized) {
            try {
              const initialized = await BLEService.initialize();
              if (!initialized) {
                // Check if Bluetooth is enabled (iOS can't enable programmatically)
                const isEnabled = await BLEService.isBluetoothEnabled();
                if (!isEnabled) {
                  Alert.alert(
                    t.bluetoothRequired,
                    t.enableBluetooth,
                    [{ text: t.ok }]
                  );
                  setIsScanning(false);
                  return;
                }
                // If enabled but not initialized, try enabling (Android only)
                const enabled = await BLEService.enableBluetooth();
                if (!enabled) {
                  Alert.alert(
                    t.bluetoothRequired,
                    t.enableBluetooth,
                    [{ text: t.ok }]
                  );
                  setIsScanning(false);
                  return;
                }
              }
              setBleInitialized(true);
            } catch (error) {
              const errorMessage = error.message || '';
              if (errorMessage.includes('not available') || errorMessage.includes('NativeEventEmitter')) {
                Alert.alert(
                  t.bluetoothNotLinked,
                  t.bluetoothNotLinkedMessage,
                  [{ text: t.ok }]
                );
              } else if (errorMessage.includes('not supported') || errorMessage.includes('Unsupported')) {
                Alert.alert(
                  t.bluetoothNotSupported,
                  t.bluetoothNotSupportedMessage,
                  [{ text: t.ok }]
                );
              } else if (errorMessage.includes('not enabled') || errorMessage.includes('Bluetooth state') || errorMessage.includes('PoweredOff')) {
                Alert.alert(
                  t.bluetoothNotEnabled,
                  t.bluetoothNotEnabledMessage,
                  [{ text: t.ok }]
                );
              } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('permissions')) {
                Alert.alert(
                  t.bluetoothPermission,
                  t.bluetoothPermissionMessage,
                  [{ text: t.ok }]
                );
              } else {
                Alert.alert(
                  t.connectionError,
                  errorMessage || t.bluetoothPermissionMessage
                );
              }
              setIsScanning(false);
              return;
            }
          }

          const devices = await BLEService.scanForDevices(
            (device) => {
              setFoundDevices(prev => {
                if (prev.find(d => d.id === device.id)) {
                  return prev;
                }
                return [...prev, { ...device, type: 'ble' }];
              });
            },
            10000 // 10 second scan
          );

          if (devices.length === 0) {
            Alert.alert(
              t.noDevicesFound || 'No Devices Found',
              'No Seed Moisture Detector devices were found via Bluetooth. Make sure:\n\n• Device is powered on\n• Bluetooth is enabled on the device\n• Device is in BLE advertising mode\n• Device is within range'
            );
          }
        }
      } else {
        // WiFi Scan
        const devices = await ESP32Service.scanForDevices(
          (device) => {
            setFoundDevices(prev => {
              if (prev.find(d => d.ip === device.ip)) {
                return prev;
              }
              return [...prev, { ...device, type: 'wifi' }];
            });
          },
          (current, total) => {
            setScanProgress({ current, total });
          }
        );

        if (devices.length === 0) {
          Alert.alert(
            t.noDevicesFound || 'No Devices Found',
            'No Seed Moisture Detector devices were found on your network. Make sure:\n\n• Device is powered on\n• Device is connected to WiFi\n• Your phone is on the same network\n• Try manual IP entry'
          );
        }
      }
    } catch (error) {
      Alert.alert(t.connectionError || 'Scan Error', error.message || 'Failed to scan for devices');
    } finally {
      setIsScanning(false);
    }
  };

  // const handleConnect = async (device) => {
  //   try {
  //     if (isBLESensor) {
  //       // BLE connection
  //       console.log('Connecting to BLE device', device);
        
  //       // Create a promise that resolves when first data is received
  //       let firstDataResolver = null;
  //       let dataReceived = false;
        
  //       const firstDataPromise = new Promise((resolve) => {
  //         firstDataResolver = resolve;
  //         // Timeout after 15 seconds if no data received (ESP32 sends every 5 seconds)
  //         setTimeout(() => {
  //           if (!dataReceived && firstDataResolver === resolve) {
  //             console.log('Timeout waiting for first data');
  //             resolve(null);
  //           }
  //         }, 15000);
  //       });
        
  //       // Set up data callback
  //       const dataCallback = (data) => {
  //         console.log('Received sensor data in callback:', data);
  //         // Resolve the promise with first data
  //         if (firstDataResolver && data && !dataReceived) {
  //           dataReceived = true;
  //           console.log('Resolving promise with data:', data);
  //           firstDataResolver(data);
  //           firstDataResolver = null;
  //         }
  //       };
        
  //       const result = await BleScanServiceEsp32.connectAndListen(device, dataCallback);
        
  //       if (result.success) {
  //         // Store connected device info in PHSensorService for compatibility
  //         // This allows SoilPHScreen to access the device
  //         PHSensorService.connectedDevice = result.device;
  //         PHSensorService.isConnected = true;
          
  //         console.log('Connection successful, waiting for first data...');
          
  //         // Wait for first data packet (sensor sends every 5 seconds)
  //         const firstData = await firstDataPromise;
  //         console.log('firstData received:', firstData);
  //         console.log('BleScanServiceEsp32.latestData:', BleScanServiceEsp32.getLatestData());
          
  //         if (firstData) {
  //           // Verify data is stored
  //           const storedData = BleScanServiceEsp32.getLatestData();
  //           console.log('Stored data after receiving:', storedData);
            
  //           Alert.alert(
  //             'Connected!',
  //             `Successfully connected to ${device.name || 'ESP32-Soil-Sensor'}\n\nSensor data received!`,
  //             [
  //               {
  //                 text: 'OK',
  //                 onPress: () => {
  //                   navigation.goBack();
  //                 },
  //               },
  //             ]
  //           );
  //         } else {
  //           // Connection successful but no data yet (timeout)
  //           // Check if data arrived anyway
  //           const storedData = BleScanServiceEsp32.getLatestData();
  //           console.log('No data in promise, but checking stored data:', storedData);
            
  //           if (storedData) {
  //             Alert.alert(
  //               'Connected!',
  //               `Successfully connected to ${device.name || 'ESP32-Soil-Sensor'}\n\nSensor data available!`,
  //               [
  //                 {
  //                   text: 'OK',
  //                   onPress: () => {
  //                     navigation.goBack();
  //                   },
  //                 },
  //               ]
  //             );
  //           } else {
  //             Alert.alert(
  //               'Connected!',
  //               `Successfully connected to ${device.name || 'ESP32-Soil-Sensor'}\n\nWaiting for sensor data...`,
  //               [
  //                 {
  //                   text: 'OK',
  //                   onPress: () => {
  //                     navigation.goBack();
  //                   },
  //                 },
  //               ]
  //             );
  //           }
  //         }
  //       } else {
  //         Alert.alert('Connection Failed', result.error || 'Could not connect to device');
  //       }
  //     } else {
  //       // WiFi connection
  //       service.configure(device.ip, device.port, device.endpoint);
  //       const testResult = await service.testConnection();
        
  //       if (testResult) {
  //         Alert.alert(
  //           'Connected!',
  //           `Successfully connected to ${device.name || device.ip}`,
  //           [
  //             {
  //               text: 'OK',
  //               onPress: () => {
  //                 navigation.goBack();
  //               },
  //             },
  //           ]
  //         );
  //       } else {
  //         Alert.alert('Connection Failed', 'Could not connect to device');
  //       }
  //     }
  //   } catch (error) {
  //     Alert.alert('Connection Error', error.message || 'Failed to connect');
  //   }
  // };
  const handleConnect = async (device) => {
    try {
      if (device.type === 'ble' || device.id) {
        // BLE Connection - support both BleScanServiceEsp32 (pH sensor) and BLEService (moisture sensor)
        if (isBLESensor) {
          // Use BleScanServiceEsp32 for pH sensor (from HEAD)
          console.log('Connecting to BLE device (pH sensor)', device);
  
          // Connect and listen
          const result = await BleScanServiceEsp32.connectAndListen(device, (data) => {
            console.log('Data callback:', data);
          });
  
          if (!result.success) {
            Alert.alert(t.connectionFailed || 'Connection Failed', result.error || t.couldNotConnect || 'Could not connect to device');
            return;
          }
  
          PHSensorService.connectedDevice = result.device;
          PHSensorService.isConnected = true;
  
          console.log('Waiting for first sensor data...');
  
          // Wait for first data (from promise returned)
          const firstData = await result.firstDataPromise;
  
          if (firstData) {
            Alert.alert(
              t.connectedSuccess || 'Connected!',
              `${t.successfullyConnected || 'Successfully connected to'} ${device.name || 'ESP32-Soil-Sensor'}\n\nSensor data received!`,
              [{ text: t.ok || 'OK', onPress: () => navigation.goBack() }]
            );
          } else {
            Alert.alert(
              t.connectedSuccess || 'Connected!',
              `Connected to ${device.name || 'ESP32-Soil-Sensor'}\n\nWaiting for sensor data...`,
              [{ text: t.ok || 'OK', onPress: () => navigation.goBack() }]
            );
          }
        } else {
          // Use BLEService for moisture sensor (from origin/dev)
          const result = await BLEService.connectToDevice(device.id);
          
          if (result.success) {
            // Test reading data
            const dataResult = await BLEService.readMoistureData();
            
            Alert.alert(
              t.connectedSuccess,
              `${t.successfullyConnected} ${device.name || 'Seed Moisture Detector'} ${t.viaBluetooth}`,
              [
                {
                  text: t.ok,
                  onPress: () => {
                    navigation.goBack();
                  },
                },
              ]
            );
          } else {
            Alert.alert(t.connectionFailed, result.error || t.couldNotConnect);
          }
        }
      } else {
        // WiFi Connection
        ESP32Service.configure(device.ip, device.port, device.endpoint);
        const testResult = await ESP32Service.testConnection();
        
        if (testResult) {
          Alert.alert(
            t.connectedSuccess,
            `${t.successfullyConnected} ${device.name || device.ip}`,
            [
              {
                text: t.ok,
                onPress: () => {
                  navigation.goBack();
                },
              },
            ]
          );
        } else {
          Alert.alert(t.connectionFailed, t.couldNotConnect);
        }
      }
    } catch (error) {
      Alert.alert(t.connectionError, error.message || t.failedToConnect);
    }
  };
  

  const handleDisconnect = () => {
    Alert.alert(
      t.disconnectDevice,
      t.disconnectConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.disconnect,
          style: 'destructive',
          onPress: async () => {
            if (connectionMode === 'bluetooth' || isBLESensor) {
              if (isBLESensor) {
                // Disconnect from PHSensorService (pH sensor)
                PHSensorService.disconnect?.();
                BleScanServiceEsp32.disconnect?.();
              } else {
                // Disconnect from BLEService (moisture sensor)
                await BLEService.disconnect();
              }
            } else {
              ESP32Service.disconnect();
            }
            setFoundDevices([]);
            Alert.alert(t.disconnected, t.disconnectedMessage);
          },
        },
      ]
    );
  };

  const handleManualTest = async () => {
    if (!manualIp.trim()) {
      Alert.alert(t.error, t.enterIp);
      return;
    }

    // Validate IP format (basic)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(manualIp.trim())) {
      Alert.alert(t.invalidIp, t.validIpHint);
      return;
    }

    setTestingManual(true);
    try {
      const device = await ESP32Service.testDevice(manualIp.trim());
      if (device) {
        setFoundDevices(prev => {
          if (prev.find(d => d.ip === device.ip)) {
            return prev;
          }
          return [...prev, device];
        });
        Alert.alert(t.deviceFound, `${t.deviceFound} ${device.ip}`);
      } else {
        Alert.alert(
          t.deviceNotFound,
          `${t.deviceNotAtIp} ${manualIp.trim()}. ${t.deviceNotAtIpHint}`
        );
      }
    } catch (error) {
      Alert.alert(t.error, error.message || t.failedToTest);
    } finally {
      setTestingManual(false);
    }
  };

  // Get connected device based on current mode
  const wifiDevice = ESP32Service.getConnectedDevice();
  const bleDevice = BLEService.getConnectedDevice();
  const phBleDevice = isBLESensor ? PHSensorService.getConnectedDevice() : null;
  const connectedDevice = isBLESensor ? phBleDevice : (connectionMode === 'bluetooth' ? bleDevice : wifiDevice);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeAreaTop} />
      <View style={styles.safeAreaContent}>
        {/* Hero Header */}
        <View style={styles.heroHeader}>
          <View style={styles.headerPattern} />
          <View style={styles.headerPattern2} />
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.welcomeText}>{t.title}</Text>
            </View>
            <View style={styles.backButton} />
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.innerContent}>
        {/* Connection Mode Toggle */}
        <View style={styles.modeToggleContainer}>
          <Text style={styles.modeToggleLabel}>{t.connectionMethod}</Text>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                connectionMode === 'wifi' && styles.modeButtonActive,
              ]}
              onPress={() => {
                setConnectionMode('wifi');
                setFoundDevices([]);
                BLEService.stopScan().catch(err => console.error('Error stopping scan:', err));
              }}
            >
              <Icon 
                name="wifi" 
                size={20} 
                color={connectionMode === 'wifi' ? 'white' : '#666'} 
              />
              <Text
                style={[
                  styles.modeButtonText,
                  connectionMode === 'wifi' && styles.modeButtonTextActive,
                ]}
              >
                {t.wifi}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                connectionMode === 'bluetooth' && styles.modeButtonActive,
              ]}
              onPress={() => {
                setConnectionMode('bluetooth');
                setFoundDevices([]);
              }}
            >
              <Icon 
                name="bluetooth" 
                size={20} 
                color={connectionMode === 'bluetooth' ? 'white' : '#666'} 
              />
              <Text
                style={[
                  styles.modeButtonText,
                  connectionMode === 'bluetooth' && styles.modeButtonTextActive,
                ]}
              >
                {t.bluetooth}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
          onPress={handleScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <View style={styles.scanButtonContent}>
              <ActivityIndicator size="small" color="white" style={styles.scanButtonIcon} />
              <Text style={styles.scanButtonText}>
                {connectionMode === 'bluetooth' ? t.scanningBluetooth : t.scanningNetwork}
              </Text>
            </View>
          ) : (
            <View style={styles.scanButtonContent}>
              <Icon name="magnify" size={24} color="white" style={styles.scanButtonIcon} />
              <Text style={styles.scanButtonText}>
                {connectionMode === 'bluetooth' ? t.scanForBluetooth : t.scanForDevices}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Scan Progress */}
        {isScanning && scanProgress.total > 0 && (
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              {t.scanning} {scanProgress.current} / {scanProgress.total}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(scanProgress.current / scanProgress.total) * 100}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Found Devices */}
        {foundDevices.length > 0 && (
          <View style={styles.devicesSection}>
            <Text style={styles.sectionTitle}>
              {t.foundDevices} ({foundDevices.length})
            </Text>
            {foundDevices.map((device, index) => {
              // Check connection status - support both isBLESensor (pH) and device.type approaches
              const phBleDevice = isBLESensor ? PHSensorService.getConnectedDevice() : null;
              const wifiDevice = ESP32Service.getConnectedDevice();
              const bleDevice = BLEService.getConnectedDevice();
              const isConnected = 
                (isBLESensor && phBleDevice && phBleDevice.id === device.id) ||
                (device.type === 'ble' && bleDevice && bleDevice.id === device.id) ||
                (device.type === 'wifi' && wifiDevice && wifiDevice.ip === device.ip) ||
                (!device.type && !isBLESensor && wifiDevice && wifiDevice.ip === device.ip);
              
              // Determine device name
              const deviceName = device.name || 
                (isBLESensor ? 'ESP32-Soil-Sensor' : 
                 device.type === 'ble' ? `Seed Moisture Detector-${device.id?.substring(0, 8) || 'BLE'}` : 
                 `Seed Moisture Detector-${device.ip?.split('.').pop() || 'WiFi'}`);
              
              return (
                <View key={`${device.id || device.ip || index}-${index}`} style={styles.deviceCard}>
                  <View style={styles.deviceHeader}>
                    <View style={styles.deviceInfo}>
                      <View style={styles.deviceIconContainer}>
                        {isConnected ? (
                          <Icon name="check-circle" size={24} color="#4CAF50" />
                        ) : (device.type === 'ble' || isBLESensor) ? (
                          <Icon name="bluetooth" size={24} color="#2196F3" />
                        ) : (
                          <Icon name="wifi" size={24} color="#2196F3" />
                        )}
                      </View>
                      <View style={styles.deviceDetails}>
                        <Text style={styles.deviceName}>
                          {deviceName}
                        </Text>
                        <Text style={styles.deviceIp}>
                          {(device.type === 'ble' || isBLESensor) 
                            ? `BLE • RSSI: ${device.rssi || 'N/A'} dBm` 
                            : device.ip}
                        </Text>
                        {device.moisture !== undefined && (
                          <Text style={styles.deviceMoisture}>
                            {t.moisture} {device.moisture.toFixed(1)}%
                          </Text>
                        )}
                      </View>
                    </View>
                    {isConnected && (
                      <View style={styles.connectedBadge}>
                        <Text style={styles.connectedBadgeText}>{t.connected}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.deviceActions}>
                    {isConnected ? (
                      <TouchableOpacity
                        style={styles.disconnectButton}
                        onPress={handleDisconnect}
                      >
                        <Icon name="close-circle-outline" size={20} color="#F44336" />
                        <Text style={styles.disconnectButtonText}>{t.disconnect}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.connectButton}
                        onPress={() => handleConnect(device)}
                      >
                        <Icon name="check-circle" size={20} color="white" />
                        <Text style={styles.connectButtonText}>{t.connect}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <View style={styles.instructionsHeader}>
            <Icon 
              name={connectionMode === 'bluetooth' ? 'bluetooth' : 'wifi'} 
              size={24} 
              color="#0F5132" 
            />
            <Text style={styles.instructionsTitle}>{t.findDevice}</Text>
          </View>
          <Text style={styles.instructionsText}>
            {connectionMode === 'bluetooth' ? (
              <>
                <Text style={styles.instructionsBold}>{t.bluetoothMode}</Text> {t.bluetoothInstructions}{'\n\n'}
                • {t.bluetoothPoint1}{'\n'}
                • {t.bluetoothPoint2}{'\n'}
                • {t.bluetoothPoint3}
              </>
            ) : (
              <>
                <Text style={styles.instructionsBold}>{t.apMode}</Text> {t.apModeInstructions}{'\n\n'}
                <Text style={styles.instructionsBold}>{t.wifiMode}</Text> {t.wifiModeInstructions}
              </>
            )}
          </Text>
        </View>

        {/* Manual IP Entry - Only show for WiFi mode */}
        {connectionMode === 'wifi' && (
          <View style={styles.manualCard}>
            <Text style={styles.sectionTitle}>{t.manualIpEntry}</Text>
            <Text style={styles.sectionSubtitle}>
              {t.manualIpHint}
            </Text>
          
          {/* Quick Connect for AP Mode */}
          <View style={styles.quickConnectCard}>
            <Text style={styles.quickConnectLabel}>{t.quickConnect}</Text>
            <Text style={styles.quickConnectHint}>
              {t.quickConnectHint}
            </Text>
            <TouchableOpacity
              style={styles.quickConnectButton}
              onPress={async () => {
                const apIp = '192.168.4.1';
                setManualIp(apIp);
                setTestingManual(true);
                try {
                  const device = await ESP32Service.testDevice(apIp);
                  if (device) {
                    setFoundDevices(prev => {
                      if (prev.find(d => d.ip === device.ip)) {
                        return prev;
                      }
                      return [...prev, device];
                    });
                    Alert.alert(t.deviceFound, `${t.deviceFound} ${device.ip}`);
                  } else {
                    Alert.alert(
                      t.deviceNotFound,
                      `${t.apModeDeviceNotFound} ${apIp}. ${t.apModeDeviceNotFoundHint}`
                    );
                  }
                } catch (error) {
                  Alert.alert(t.error, error.message || t.failedToTest);
                } finally {
                  setTestingManual(false);
                }
              }}
            >
              <Icon name="wifi" size={20} color="white" />
              <Text style={styles.quickConnectButtonText}>{t.tryApIp}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputRow}>
            <TextInput
              style={styles.ipInput}
              placeholder="192.168.4.1"
              value={manualIp}
              onChangeText={setManualIp}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.testButton, testingManual && styles.testButtonDisabled]}
              onPress={handleManualTest}
              disabled={testingManual}
            >
              {testingManual ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.testButtonText}>{t.test}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        )}

        {/* No Devices State */}
        {!isScanning && foundDevices.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name={(connectionMode === 'bluetooth' || isBLESensor) ? "bluetooth-off" : "wifi-off"} size={48} color="#CCC" />
            <Text style={styles.emptyStateText}>{t.noDevicesFound}</Text>
            <Text style={styles.emptyStateSubtext}>
              {t.noDevicesHint}
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F5132',
  },
  safeAreaTop: {
    backgroundColor: '#0F5132',
  },
  safeAreaContent: {
    flex: 1,
    backgroundColor: '#F0F7F3',
  },
  heroHeader: {
    backgroundColor: '#0F5132',
    height: 160,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 24,
  },
  headerPattern: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '45deg' }],
  },
  headerPattern2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    zIndex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  innerContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  modeToggleContainer: {
    marginHorizontal: 4,
    marginBottom: 20,
  },
  modeToggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: '#0F5132',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modeButtonTextActive: {
    color: 'white',
  },
  instructionsCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderLeftWidth: 5,
    borderLeftColor: '#0F5132',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 12,
    flex: 1,
  },
  instructionsText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  instructionsBold: {
    fontWeight: '700',
    color: '#0F5132',
  },
  manualCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontWeight: '500',
  },
  quickConnectCard: {
    backgroundColor: '#F8FBF9',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0F5132',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  quickConnectLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F5132',
    marginBottom: 6,
  },
  quickConnectHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 14,
    fontWeight: '500',
  },
  quickConnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  quickConnectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ipInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: '#0F5132',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
    elevation: 3,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  scanButton: {
    marginHorizontal: 4,
    marginBottom: 20,
    backgroundColor: '#0F5132',
    padding: 18,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonIcon: {
    marginRight: 12,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  progressCard: {
    marginHorizontal: 4,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  devicesSection: {
    marginHorizontal: 4,
    marginBottom: 20,
  },
  deviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  deviceIconContainer: {
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  deviceIp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  deviceMoisture: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  connectedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  connectedBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  deviceActions: {
    marginTop: 12,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F5132',
    padding: 14,
    borderRadius: 16,
    gap: 8,
    elevation: 3,
    shadowColor: '#0F5132',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    padding: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F44336' + '30',
  },
  disconnectButtonText: {
    color: '#F44336',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 30,
  },
});

