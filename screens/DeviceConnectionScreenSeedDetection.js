import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { showAppAlert } from '../src/components/AppAlert';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ESP32Service from '../src/utils/esp32Service';
import PHSensorService from '../src/utils/phSensorService';
import BluetoothPermissionService from '../src/utils/bluetoothPermissionService';
import BleScanServiceEsp32 from '../src/utils/BleScanServiceEsp32';
import { useLanguage } from '../src/context/LanguageContext';

const { width } = Dimensions.get('window');

// Language translations (matching DeviceConnectionScreen)
const translations = {
  English: {
    title: 'Connect Device',
    findDevice: 'Connect Soil pH Sensor',
    findDeviceBLE: 'Find Your ESP32 Soil Sensor',
    findDeviceWifi: 'Find Your ESP32 Device',
    bluetoothInstructions: 'Make sure Bluetooth is enabled on your phone and ESP32 sensor is powered on. Tap "Scan for Devices" to search for nearby sensors.',
    apModeInstructions: 'Connect your phone to ESP32\'s WiFi network (e.g., "ESP32-Moisture-Sensor"), then tap "Try 192.168.4.1" or scan.',
    wifiModeInstructions: 'Make sure ESP32 and phone are on the same WiFi network, then scan for devices.',
    manualIpEntry: 'Manual IP Entry',
    manualIpHint: 'If you know your ESP32\'s IP address, enter it here',
    quickConnect: 'Quick Connect (AP Mode)',
    quickConnectHint: 'If ESP32 is in Access Point mode, try the default IP:',
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
    noDevicesHintBLE: 'Tap "Scan for Devices" to search for Bluetooth sensors',
    deviceFound: 'Device Found!',
    deviceNotFound: 'Device Not Found',
    connectionFailed: 'Connection Failed',
    error: 'Error',
    enterIp: 'Please enter an IP address',
    invalidIp: 'Invalid IP',
    validIpHint: 'Please enter a valid IP address (e.g., 192.168.1.100)',
    permissionRequired: 'Permission Required',
    permissionMessage: 'Bluetooth permissions are required to scan for devices. Please grant permissions in app settings.',
    moisture: 'Moisture:',
    bleHelpHint: 'No ESP32-Soil-Sensor devices were found. Make sure:\n\n• ESP32 sensor is powered on\n• Bluetooth is enabled on your phone\n• ESP32 sensor is in range',
    wifiHelpHint: 'No ESP32 devices were found on your network. Make sure:\n\n• ESP32 is powered on\n• ESP32 is connected to WiFi\n• Your phone is on the same network\n• Try manual IP entry',
    failedScan: 'Failed to scan for devices',
    couldNotConnect: 'Could not connect to device',
    failedConnect: 'Failed to connect',
    foundEsp32At: 'Found ESP32 device at',
    failedTestDevice: 'Failed to test device',
    noEsp32At: 'No ESP32 device found at',
    noEsp32Hint: 'Make sure:\n\n• ESP32 is powered on\n• You\'re connected to ESP32 WiFi network\n• ESP32 is in AP mode',
  },
  සිංහල: {
    title: 'උපාංගය සම්බන්ධ කරන්න',
    findDevice: 'මිරිදිය pH සංවේදකය සම්බන්ධ කරන්න',
    findDeviceBLE: 'ඔබේ ESP32 පස් සංවේදකය සොයන්න',
    findDeviceWifi: 'ඔබේ ESP32 උපාංගය සොයන්න',
    bluetoothInstructions: 'ඔබේ දුරකථනයේ බ්ලූටූත් සක්‍රිය කර ඇති බවට සහ ESP32 සංවේදකය බලයට සම්බන්ධ කර ඇති බවට වග බලා ගන්න. අසල සංවේදක සොයා බැලීමට "උපාංග සොයන්න" ට තට්ටු කරන්න.',
    apModeInstructions: 'ඔබේ දුරකථනය ESP32 හි WiFi ජාලයට සම්බන්ධ කරන්න (උදා: "ESP32-Moisture-Sensor"), පසුව "192.168.4.1 උත්සාහ කරන්න" ට තට්ටු කරන්න හෝ සොයන්න.',
    wifiModeInstructions: 'ESP32 සහ දුරකථනය එකම WiFi ජාලයේ ඇති බවට වග බලා ගන්න, පසුව උපාංග සොයන්න.',
    manualIpEntry: 'අතින් IP ඇතුළත් කිරීම',
    manualIpHint: 'ඔබේ ESP32 හි IP ලිපිනය දන්නේ නම්, මෙහි ඇතුළත් කරන්න',
    quickConnect: 'ඉක්මන් සම්බන්ධතාව (AP ක්‍රමය)',
    quickConnectHint: 'ESP32 ප්‍රවේශ ලක්ෂ්‍ය ක්‍රමයේ නම්, පෙරනිමි IP උත්සාහ කරන්න:',
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
    noDevicesHintBLE: 'බ්ලූටූත් සංවේදක සොයා බැලීමට "උපාංග සොයන්න" ට තට්ටු කරන්න',
    deviceFound: 'උපාංගය හමු විය!',
    deviceNotFound: 'උපාංගය හමු නොවීය',
    connectionFailed: 'සම්බන්ධතාව අසාර්ථක විය',
    error: 'දෝෂය',
    enterIp: 'කරුණාකර IP ලිපිනයක් ඇතුළත් කරන්න',
    invalidIp: 'වලංගු නොවන IP',
    validIpHint: 'කරුණාකර වලංගු IP ලිපිනයක් ඇතුළත් කරන්න (උදා: 192.168.1.100)',
    permissionRequired: 'අවසරය අවශ්‍යයි',
    permissionMessage: 'උපාංග සොයා බැලීමට බ්ලූටූත් අවසර අවශ්‍යයි. කරුණාකර යෙදුම් සැකසුම්වල අවසර ලබා දෙන්න.',
    moisture: 'තෙතමනය:',
    bleHelpHint: 'ESP32-Soil-Sensor උපාංග හමු නොවීය. සහතික කරගන්න:\n\n• ESP32 සංවේදකයට බලය ලබා දී ඇත\n• ඔබේ දුරකථනයේ බ්ලූටූත් සක්‍රියයි\n• ESP32 සංවේදකය පරාසය තුළ ඇත',
    wifiHelpHint: 'ඔබේ ජාලයේ ESP32 උපාංග හමු නොවීය. සහතික කරගන්න:\n\n• ESP32 ට බලය ලබා දී ඇත\n• ESP32 WiFi වෙත සම්බන්ධ කර ඇත\n• ඔබේ දුරකථනය එම ජාලයේම ඇත\n• අතින් IP ඇතුළත් කිරීම උත්සාහ කරන්න',
    failedScan: 'උපාංග සඳහා සෙවීමට අසමත් විය',
    couldNotConnect: 'උපාංගයට සම්බන්ධ විය නොහැකි විය',
    failedConnect: 'සම්බන්ධ වීමට අසමත් විය',
    foundEsp32At: 'හමු වූ ESP32 උපාංගය',
    failedTestDevice: 'උපාංගය පරීක්ෂා කිරීමට අසමත් විය',
    noEsp32At: 'ESP32 උපාංගයක් හමු නොවීය',
    noEsp32Hint: 'සහතික කරගන්න:\n\n• ESP32 ට බලය ලබා දී ඇත\n• ඔබ ESP32 WiFi ජාලයට සම්බන්ධ වී ඇත\n• ESP32 AP ක්‍රමයේ ඇත',
  },
  தமிழ்: {
    title: 'சாதனத்தை இணைக்கவும்',
    findDevice: 'மண் pH சென்சாரை இணைக்கவும்',
    findDeviceBLE: 'உங்கள் ESP32 மண் சென்சாரைக் கண்டறியவும்',
    findDeviceWifi: 'உங்கள் ESP32 சாதனத்தைக் கண்டறியவும்',
    bluetoothInstructions: 'உங்கள் தொலைபேசியில் புளூடூத் இயக்கப்பட்டுள்ளது மற்றும் ESP32 சென்சார் இயக்கத்தில் உள்ளது என்பதை உறுதிப்படுத்தவும். அருகிலுள்ள சென்சார்களைத் தேட "சாதனங்களை ஸ்கேன் செய்யவும்" ஐத் தட்டவும்.',
    apModeInstructions: 'உங்கள் தொலைபேசியை ESP32 இன் WiFi நெட்வொர்க்குடன் இணைக்கவும் (எ.கா: "ESP32-Moisture-Sensor"), பின்னர் "192.168.4.1 ஐ முயற்சிக்கவும்" ஐத் தட்டவும் அல்லது ஸ்கேன் செய்யவும்.',
    wifiModeInstructions: 'ESP32 மற்றும் தொலைபேசி ஒரே WiFi நெட்வொர்க்கில் உள்ளன என்பதை உறுதிப்படுத்தவும், பின்னர் சாதனங்களை ஸ்கேன் செய்யவும்.',
    manualIpEntry: 'கைமுறை IP நுழைவு',
    manualIpHint: 'உங்கள் ESP32 இன் IP முகவரியை நீங்கள் அறிந்திருந்தால், இங்கே உள்ளிடவும்',
    quickConnect: 'விரைவு இணைப்பு (AP முறை)',
    quickConnectHint: 'ESP32 அணுகல் புள்ளி முறையில் இருந்தால், இயல்புநிலை IP ஐ முயற்சிக்கவும்:',
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
    noDevicesHintBLE: 'புளூடூத் சென்சார்களைத் தேட "சாதனங்களை ஸ்கேன் செய்யவும்" ஐத் தட்டவும்',
    deviceFound: 'சாதனம் கண்டறியப்பட்டது!',
    deviceNotFound: 'சாதனம் கண்டறியப்படவில்லை',
    connectionFailed: 'இணைப்பு தோல்வியடைந்தது',
    error: 'பிழை',
    enterIp: 'தயவுசெய்து IP முகவரியை உள்ளிடவும்',
    invalidIp: 'தவறான IP',
    validIpHint: 'தயவுசெய்து சரியான IP முகவரியை உள்ளிடவும் (எ.கா: 192.168.1.100)',
    permissionRequired: 'அனுமதி தேவை',
    permissionMessage: 'சாதனங்களை ஸ்கேன் செய்ய புளூடூத் அனுமதிகள் தேவை. தயவுசெய்து பயன்பாட்டு அமைப்புகளில் அனுமதிகளை வழங்கவும்.',
    moisture: 'ஈரப்பதம்:',
    bleHelpHint: 'ESP32-Soil-Sensor சாதனங்கள் கண்டறியப்படவில்லை. உறுதிப்படுத்தவும்:\n\n• ESP32 சென்சார் இயக்கப்பட்டுள்ளது\n• உங்கள் தொலைபேசியில் புளூடூத் இயக்கப்பட்டுள்ளது\n• ESP32 சென்சார் வரம்பிற்குள் உள்ளது',
    wifiHelpHint: 'உங்கள் நெட்வொர்க்கில் ESP32 சாதனங்கள் கண்டறியப்படவில்லை. உறுதிப்படுத்தவும்:\n\n• ESP32 இயக்கப்பட்டுள்ளது\n• ESP32 WiFi உடன் இணைக்கப்பட்டுள்ளது\n• உங்கள் தொலைபேசி அதே நெட்வொர்க்கில் உள்ளது\n• கைமுறை IP நுழைவை முயற்சிக்கவும்',
    failedScan: 'சாதனங்களை ஸ்கேன் செய்ய முடியவில்லை',
    couldNotConnect: 'சாதனத்துடன் இணைக்க முடியவில்லை',
    failedConnect: 'இணைக்க முடியவில்லை',
    foundEsp32At: 'கண்டறிந்த ESP32 சாதனம்',
    failedTestDevice: 'சாதனத்தை சோதிக்க முடியவில்லை',
    noEsp32At: 'ESP32 சாதனம் கண்டறியப்படவில்லை',
    noEsp32Hint: 'உறுதிப்படுத்தவும்:\n\n• ESP32 இயக்கப்பட்டுள்ளது\n• நீங்கள் ESP32 WiFi நெட்வொர்க்கில் இணைக்கப்பட்டுள்ளீர்கள்\n• ESP32 AP முறையில் உள்ளது',
  },
};

export default function DeviceConnectionScreenSeedDetection({ navigation, route }) {
  const { selectedLanguage } = useLanguage();
  const t = translations[selectedLanguage];
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState([]);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [manualIp, setManualIp] = useState('');
  const [testingManual, setTestingManual] = useState(false);
  
  // Determine if this is for BLE (pH sensor) or WiFi (moisture sensor)
  const isBLESensor = route?.params?.sensorType === 'pH' || route?.params?.sensorType === 'BLE';
  const service = isBLESensor ? PHSensorService : ESP32Service;
  console.log('isBLESensor', isBLESensor);
  // Check if already connected
  useEffect(() => {
    const connectedDevice = service.getConnectedDevice();
    if (connectedDevice) {
      if (isBLESensor) {
        setFoundDevices([{
          ...connectedDevice,
          status: 'connected',
        }]);
      } else {
        setFoundDevices([{
          ...connectedDevice,
          name: `ESP32-${connectedDevice.ip?.split('.').pop() || 'Device'}`,
          status: 'connected',
        }]);
      }
    }
  }, [isBLESensor]);

  const handleScan = async () => {
    setIsScanning(true);
    setFoundDevices([]);
    setScanProgress({ current: 0, total: 0 });

    try {
      if (isBLESensor) {
        console.log('Scanning for BLE devices');
        // Request Bluetooth permissions before scanning
        const hasPermission = await BluetoothPermissionService.checkPermissions();
        if (!hasPermission) {
          const permissionGranted = await BluetoothPermissionService.requestPermissions();
          if (!permissionGranted) {
            showAppAlert(t.permissionRequired, t.permissionMessage);
            setIsScanning(false);
            return;
          }
        }

        // BLE scan
        const devices = await BleScanServiceEsp32.scanForDevices(
          (device) => {
            // Device found callback
            setFoundDevices(prev => {
              // Avoid duplicates
              if (prev.find(d => d.id === device.id)) {
                return prev;
              }
              return [...prev, device];
            });
          },
          (current, total) => {
            // Progress callback
            setScanProgress({ current, total });
          }
        );

        if (devices.length === 0) {
          showAppAlert(t.noDevicesFound, t.bleHelpHint);
        }
      } else {
        // WiFi scan
        const devices = await service.scanForDevices(
          (device) => {
            // Device found callback
            setFoundDevices(prev => {
              // Avoid duplicates
              if (prev.find(d => d.ip === device.ip)) {
                return prev;
              }
              return [...prev, device];
            });
          },
          (current, total) => {
            // Progress callback
            setScanProgress({ current, total });
          }
        );

        if (devices.length === 0) {
          showAppAlert(t.noDevicesFound, t.wifiHelpHint);
        }
      }
    } catch (error) {
      showAppAlert(t.error, error.message || t.failedScan);
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
            
  //           showAppAlert(
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
  //             showAppAlert(
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
  //             showAppAlert(
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
  //         showAppAlert('Connection Failed', result.error || 'Could not connect to device');
  //       }
  //     } else {
  //       // WiFi connection
  //       service.configure(device.ip, device.port, device.endpoint);
  //       const testResult = await service.testConnection();
        
  //       if (testResult) {
  //         showAppAlert(
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
  //         showAppAlert('Connection Failed', 'Could not connect to device');
  //       }
  //     }
  //   } catch (error) {
  //     showAppAlert('Connection Error', error.message || 'Failed to connect');
  //   }
  // };
  const handleConnect = async (device) => {
    try {
      if (!isBLESensor) return;
  
      console.log('Connecting to BLE device', device);
  
      // Connect and listen
      const result = await BleScanServiceEsp32.connectAndListen(device, (data) => {
        console.log('Data callback:', data);
      });
  
      if (!result.success) {
        showAppAlert(t.connectionFailed, result.error || t.couldNotConnect);
        return;
      }
  
      PHSensorService.connectedDevice = result.device;
      PHSensorService.isConnected = true;
  
      console.log('Waiting for first sensor data...');
  
      // Wait for first data (from promise returned)
      const firstData = await result.firstDataPromise;
  
      if (firstData) {
        showAppAlert(
          t.connected,
          `Successfully connected to ${device.name || 'ESP32-Soil-Sensor'}\n\nSensor data received!`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        showAppAlert(
          t.connected,
          `Connected to ${device.name || 'ESP32-Soil-Sensor'}\n\nWaiting for sensor data...`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      showAppAlert(t.error, error.message || t.failedConnect);
    }
  };
  

  const handleDisconnect = () => {
    showAppAlert(
      t.disconnectDevice,
      t.disconnectConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.disconnect,
          style: 'destructive',
          onPress: () => {
            service.disconnect?.();
            setFoundDevices([]);
            showAppAlert(t.disconnected, t.disconnectedMessage);
          },
        },
      ]
    );
  };

  const handleManualTest = async () => {
    if (!manualIp.trim()) {
      showAppAlert(t.error, t.enterIp);
      return;
    }

    // Validate IP format (basic)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(manualIp.trim())) {
      showAppAlert(t.invalidIp, t.validIpHint);
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
        showAppAlert(t.deviceFound, `${t.foundEsp32At} ${device.ip}`);
      } else {
        showAppAlert(
          t.deviceNotFound,
          `No ESP32 device found at ${manualIp.trim()}. Make sure the device is online and the endpoint is correct.`
        );
      }
    } catch (error) {
      showAppAlert(t.error, error.message || t.failedTestDevice);
    } finally {
      setTestingManual(false);
    }
  };

  const connectedDevice = service.getConnectedDevice();

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
                    {isBLESensor ? t.scanningBluetooth : t.scanningNetwork}
                  </Text>
                </View>
              ) : (
                <View style={styles.scanButtonContent}>
                  <Icon name="magnify" size={24} color="white" style={styles.scanButtonIcon} />
                  <Text style={styles.scanButtonText}>
                    {isBLESensor ? t.scanForBluetooth : t.scanForDevices}
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
                  const isConnected = isBLESensor
                    ? (connectedDevice && connectedDevice.id === device.id)
                    : (connectedDevice && connectedDevice.ip === device.ip);
                  return (
                    <View key={isBLESensor ? `${device.id}-${index}` : `${device.ip}-${index}`} style={styles.deviceCard}>
                      <View style={styles.deviceHeader}>
                        <View style={styles.deviceInfo}>
                          <View style={styles.deviceIconContainer}>
                            {isConnected ? (
                              <Icon name="check-circle" size={24} color="#4CAF50" />
                            ) : (
                              <Icon name={isBLESensor ? "bluetooth" : "wifi"} size={24} color="#2196F3" />
                            )}
                          </View>
                          <View style={styles.deviceDetails}>
                            <Text style={styles.deviceName}>
                              {device.name || (isBLESensor ? 'ESP32-Soil-Sensor' : `ESP32-${device.ip?.split('.').pop()}`)}
                            </Text>
                            {isBLESensor ? (
                              <>
                                {device.rssi && (
                                  <Text style={styles.deviceIp}>BLE • RSSI: {device.rssi} dBm</Text>
                                )}
                              </>
                            ) : (
                              <>
                                <Text style={styles.deviceIp}>{device.ip}</Text>
                                {device.moisture !== undefined && (
                                  <Text style={styles.deviceMoisture}>
                                    {t.moisture} {device.moisture.toFixed(1)}%
                                  </Text>
                                )}
                              </>
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
                  name={isBLESensor ? 'bluetooth' : 'wifi'}
                  size={24}
                  color="#0F5132"
                />
                <Text style={styles.instructionsTitle}>{t.findDevice}</Text>
              </View>
              <Text style={styles.instructionsText}>
                {isBLESensor ? (
                  t.bluetoothInstructions
                ) : (
                  <>
                    <Text style={styles.instructionsBold}>AP Mode:</Text> {t.apModeInstructions}{'\n\n'}
                    <Text style={styles.instructionsBold}>WiFi Mode:</Text> {t.wifiModeInstructions}
                  </>
                )}
              </Text>
            </View>

            {/* Manual IP Entry - Only for WiFi */}
            {!isBLESensor && (
              <View style={styles.manualCard}>
                <Text style={styles.sectionTitle}>{t.manualIpEntry}</Text>
                <Text style={styles.sectionSubtitle}>{t.manualIpHint}</Text>

                <View style={styles.quickConnectCard}>
                  <Text style={styles.quickConnectLabel}>{t.quickConnect}</Text>
                  <Text style={styles.quickConnectHint}>{t.quickConnectHint}</Text>
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
                          showAppAlert(t.deviceFound, `${t.foundEsp32At} ${device.ip}`);
                        } else {
                          showAppAlert(
                            t.deviceNotFound,
                            `${t.noEsp32At} ${apIp}. ${t.noEsp32Hint}`
                          );
                        }
                      } catch (error) {
                        showAppAlert(t.error, error.message || t.failedTestDevice);
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
                <Icon name={isBLESensor ? "bluetooth-off" : "wifi-off"} size={48} color="#CCC" />
                <Text style={styles.emptyStateText}>{t.noDevicesFound}</Text>
                <Text style={styles.emptyStateSubtext}>
                  {isBLESensor ? t.noDevicesHintBLE : t.noDevicesHint}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
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

