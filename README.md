# iPaddyCare - Smart Agricultural Toolkit

## 📋 Overview

**iPaddyCare** is a comprehensive React Native mobile application designed to empower paddy (rice) farmers with smart agricultural tools and technologies. The application integrates AI-powered detection systems, IoT sensors, and modern mobile technologies to provide farmers with real-time insights, recommendations, and tools for better crop management.

### Key Features

- **🌾 Seed Quality Detection**: AI-powered seed sorting and wild seed detection using camera-based image analysis
- **💧 Moisture Monitoring**: Real-time seed moisture measurement via ESP32 IoT devices (BLE/WiFi connectivity)
- **🧪 Soil pH Testing**: Smart soil analysis with instant pH testing and recommendations
- **🐛 Pest & Disease Detection**: Early detection system using camera-based pest identification
- **🛒 Marketplace**: Agricultural product marketplace for buying and selling farming supplies
- **👥 Officer Connection**: Direct communication with agricultural officers for expert advice
- **📊 Test History**: Comprehensive tracking and history of all agricultural tests
- **🌍 Multi-language Support**: Available in English, සිංහල (Sinhala), and தமிழ் (Tamil)
- **☁️ Weather Integration**: Real-time weather data for informed decision-making
- **🔐 Secure Authentication**: Firebase-based authentication with Google Sign-In and Apple Sign-In support

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile Application                        │
│                         (React Native)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Presentation Layer                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  │
│  │  │  Home    │  │  Seed    │  │ Moisture │  │   Soil   │ │  │
│  │  │  Screen  │  │Detection │  │ Detector │  │   pH     │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  │
│  │  │   Pest   │  │Marketplace│  │ Officers │  │  History │ │  │
│  │  │Detection │  │  Screen   │  │  Screen  │  │  Screen  │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Context Layer                          │  │
│  │  ┌──────────────┐          ┌──────────────┐             │  │
│  │  │  AuthContext │          │LanguageContext│             │  │
│  │  │  (Firebase)  │          │  (i18next)    │             │  │
│  │  └──────────────┘          └──────────────┘             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Service Layer                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  Firebase    │  │   ESP32      │  │    BLE       │  │  │
│  │  │   Service    │  │   Service    │  │   Service    │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  Prediction  │  │   Weather    │  │   Camera     │  │  │
│  │  │   Service    │  │   Service    │  │   Service    │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Firebase   │    │   ESP32      │    │   External   │
│   Backend    │    │   IoT Device │    │   APIs       │
│              │    │              │    │              │
│ • Auth       │    │ • Moisture   │    │ • Weather    │
│ • Database   │    │   Sensor     │    │ • Prediction │
│ • Storage    │    │ • BLE/WiFi   │    │   Models     │
│ • Messaging  │    │   Interface  │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Component Architecture

```
App.js (Root)
├── AuthProvider
│   └── LanguageProvider
│       └── NavigationContainer
│           └── RootNavigator
│               ├── LoginScreen
│               ├── OfficerLoginScreen
│               └── DrawerNavigator
│                   └── MainStack
│                       ├── HomeScreen
│                       ├── SeedDetectionScreen
│                       │   └── SeedCameraScreen
│                       ├── MoistureDetectorScreen
│                       │   └── DeviceConnectionScreen
│                       │   └── ReadingResultsScreen
│                       ├── SoilPHScreen
│                       ├── PestDetectionScreen
│                       ├── MarketplaceScreen
│                       │   ├── AddProductScreen
│                       │   └── MyListingsScreen
│                       ├── OfficersScreen
│                       │   └── MessageScreen
│                       ├── HistoryScreen
│                       ├── SettingsScreen
│                       ├── HelpScreen
│                       └── AboutScreen
│                   └── BottomNavigation
```

### Data Flow

1. **Authentication Flow**: User → LoginScreen → Firebase Auth → AuthContext → Navigation
2. **IoT Data Flow**: ESP32 Device → BLE/WiFi → BLEService/ESP32Service → Screen → Firebase Storage
3. **Image Processing Flow**: Camera → Image Capture → Prediction Service → Results → Screen
4. **Marketplace Flow**: User Input → Firebase Database → Marketplace Screen → Real-time Updates

---

## 📦 Dependencies

### Core Dependencies

#### React & React Native
- `react`: ^19.1.0
- `react-native`: ^0.80.0
- `@react-navigation/native`: ^7.1.13
- `@react-navigation/native-stack`: ^7.3.18
- `@react-navigation/drawer`: ^7.7.4

#### Firebase & Authentication
- `@react-native-firebase/app`: ^23.5.0
- `@react-native-firebase/auth`: ^23.5.0
- `@react-native-google-signin/google-signin`: ^16.0.0
- `@invertase/react-native-apple-authentication`: ^2.5.0

#### IoT & Device Communication
- `react-native-ble-plx`: ^3.5.0 (Bluetooth Low Energy for ESP32)
- Custom ESP32 Service (WiFi/HTTP communication)

#### Camera & Image Processing
- `react-native-vision-camera`: ^4.0.0
- `react-native-image-picker`: ^7.1.2

#### UI & Styling
- `react-native-paper`: ^5.14.5
- `react-native-vector-icons`: ^10.3.0
- `react-native-linear-gradient`: ^2.8.3
- `expo-linear-gradient`: ^14.1.5
- `lucide-react-native`: ^0.518.0
- `twrnc`: ^4.9.0

#### Internationalization
- `i18next`: ^25.2.1
- `react-i18next`: ^15.5.3

#### Utilities
- `react-native-gesture-handler`: ^2.26.0
- `react-native-reanimated`: ^3.18.0
- `react-native-safe-area-context`: ^5.4.1
- `react-native-screens`: ^4.11.1
- `@react-native-picker/picker`: ^2.11.0

### Development Dependencies

- `@babel/core`: ^7.25.2
- `@react-native/babel-preset`: ^0.80.0
- `@react-native/metro-config`: ^0.80.0
- `@react-native/eslint-config`: ^0.80.0
- `typescript`: ^5.0.4
- `jest`: ^29.6.3
- `eslint`: ^8.19.0
- `prettier`: ^2.8.8

### Platform-Specific Requirements

#### iOS
- CocoaPods for dependency management
- Xcode 14.0+
- iOS 13.0+
- Swift 5.0+

#### Android
- Gradle 8.0+
- Android SDK 33+
- Java 17+
- Android Studio

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iPaddyCare
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **iOS Setup**
   ```bash
   cd ios
   bundle install
   bundle exec pod install
   cd ..
   ```

4. **Configure Firebase**
   - Place `GoogleService-Info.plist` in `ios/iPaddyCare/`
   - Place `google-services.json` in `android/app/`
   - Update Firebase configuration in `src/utils/firebaseConfig.js`

5. **Start Metro Bundler**
   ```bash
   npm start
   # or
   yarn start
   ```

6. **Run the application**
   ```bash
   # iOS
   npm run ios
   # or
   yarn ios

   # Android
   npm run android
   # or
   yarn android
   ```

---

## 📱 Features in Detail

### 1. Seed Quality Detection
- Camera-based seed analysis
- AI-powered wild seed detection
- Seed variety identification
- Quality scoring and recommendations

### 2. Moisture Monitoring
- Real-time moisture readings via ESP32
- Bluetooth Low Energy (BLE) connectivity
- WiFi-based HTTP communication
- Historical data tracking
- Predictive analytics integration

### 3. Soil pH Testing
- Instant pH level measurement
- Soil condition analysis
- Fertilizer recommendations
- Historical pH tracking

### 4. Pest & Disease Detection
- Camera-based pest identification
- Disease pattern recognition
- Treatment recommendations
- Early warning system

### 5. Marketplace
- Product listing and browsing
- Buy/sell agricultural products
- Product approval system (for officers)
- User listings management

### 6. Officer Connection
- Direct messaging with agricultural officers
- Expert advice and recommendations
- Product approval workflows
- Officer inbox management

### 7. Multi-language Support
- English
- සිංහල (Sinhala)
- தமிழ் (Tamil)
- Dynamic language switching

---

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Google Sign-In, Apple Sign-In)
3. Enable Firestore Database
4. Enable Cloud Storage
5. Download configuration files for iOS and Android

### ESP32 Configuration
- See `ESP32_SETUP.md` for detailed ESP32 device setup
- Configure WiFi credentials on ESP32
- Set up BLE service UUIDs if using Bluetooth
- Configure HTTP endpoints for WiFi communication

### API Configuration
- Update prediction API endpoint in `src/utils/predictionService.js`
- Configure weather API keys in `src/utils/weatherService.js`

---

## 📂 Project Structure

```
iPaddyCare/
├── android/                 # Android native code
├── ios/                     # iOS native code
├── assets/                  # Static assets (images, etc.)
├── screens/                 # Screen components
│   ├── HomeScreen.js
│   ├── LoginScreen.js
│   ├── SeedDetectionScreen.js
│   ├── MoistureDetectorScreen.js
│   ├── SoilPHScreen.js
│   ├── PestDetectionScreen.js
│   ├── MarketplaceScreen.js
│   ├── OfficersScreen.js
│   └── ...
├── src/
│   ├── components/          # Reusable components
│   │   ├── BottomNavigation.js
│   │   └── DrawerContent.js
│   ├── context/             # React Context providers
│   │   ├── AuthContext.js
│   │   └── LanguageContext.js
│   └── utils/               # Utility services
│       ├── firebaseConfig.js
│       ├── bleService.js
│       ├── esp32Service.js
│       ├── predictionService.js
│       └── weatherService.js
├── App.js                   # Root component
├── package.json             # Dependencies
└── README.md               # This file
```

---

## 🧪 Testing

```bash
# Run tests
npm test
# or
yarn test
```

---

## 📝 Project History

### Version 0.0.1 (Current)
- Initial project setup with React Native 0.80.0
- Core navigation structure with Drawer and Stack navigators
- Firebase authentication integration
- Multi-language support (English, Sinhala, Tamil)
- Seed quality detection feature
- Moisture monitoring with ESP32 integration
- Soil pH testing functionality
- Pest & disease detection
- Marketplace implementation
- Officer connection and messaging system
- Test history tracking
- Weather integration
- Bottom navigation and drawer navigation
- Settings, Help, and About screens

### Development Milestones
- ✅ Project initialization and setup
- ✅ Firebase authentication (Google & Apple Sign-In)
- ✅ Navigation architecture
- ✅ Core agricultural features
- ✅ IoT device integration (ESP32)
- ✅ Multi-language support
- ✅ Marketplace functionality
- ✅ Officer communication system
- 🔄 AI model integration (in progress)
- 🔄 Advanced analytics (in progress)

---

## 🤝 Contributing

This project is part of an academic/research initiative. For contribution guidelines, please contact the project maintainers.

---

## 📄 License

[Specify your license here]

---

## 👥 Team

[Add team members and their roles]

---

## 📞 Support

For issues, questions, or contributions, please contact the development team or open an issue in the repository.

---

## 🔗 Additional Resources

- [ESP32 Setup Guide](./ESP32_SETUP.md)
- [App Icon Guide](./APP_ICON_GUIDE.md)
- [Reading Session Setup](./READING_SESSION_SETUP.md)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Last Updated**: [Current Date]
**Version**: 0.0.1
