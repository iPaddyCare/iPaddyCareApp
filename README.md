# iPaddyCare - Smart Agricultural Toolkit

## 📋 Overview

**iPaddyCare** is a comprehensive React Native mobile application designed to empower paddy (rice) farmers with smart agricultural tools and technologies. The application integrates AI-powered detection systems, IoT sensors, and modern mobile technologies to provide farmers with real-time insights, recommendations, and tools for better crop management.

### Key Features

- **🌾 Seed Quality Detection**: AI-powered seed sorting and wild seed detection using YOLOv8 object detection model for image analysis
- **💧 Seed Moisture Monitoring**: Real-time seed moisture measurement via ESP32 IoT device (BLE) with Linear Regression model for pH prediction and weather-based seed drying schedule recommendations
- **🧪 Soil pH Testing**: Comprehensive multi-parameter soil analysis with ESP32 pH sensor device (BLE), GPS integration, and AI-powered rice variety prediction API
- **🐛 Pest & Disease Detection**: Advanced AI-powered pest and disease detection system using CNN models, RAG (Retrieval-Augmented Generation), and LLM-based chat assistance
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
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │   Pest       │  │     RAG      │  │     LLM      │  │  │
│  │  │ Detection    │  │   Service    │  │   Service    │  │  │
│  │  │  Service     │  │  (Offline)   │  │  (OpenAI)    │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  pH Sensor   │  │   Location   │  │   Rice       │  │  │
│  │  │   Service    │  │   Service    │  │   Variety    │  │  │
│  │  │   (BLE)      │  │   (GPS)      │  │   API        │  │  │
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
│   Firebase   │    │   ESP32 IoT  │    │   External   │
│   Backend    │    │   Devices    │    │   APIs       │
│              │    │              │    │              │
│ • Auth       │    │ • Moisture   │    │ • Weather    │
│ • Database   │    │   Sensor     │    │ • OpenAI     │
│ • Storage    │    │   (ESP32)    │    │   (LLM)      │
│ • Messaging  │    │ • pH Sensor  │    │ • Rice       │
└──────────────┘    │   (ESP32)    │    │   Variety    │
                    │ • BLE        │    │   API        │
                    │   Connection │    │              │
                    └──────────────┘    └──────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  TensorFlow  │    │   ESP32      │    │   ESP32      │
│    Lite      │    │  Moisture    │    │  pH Sensor   │
│  (CNN Model) │    │   Sensor     │    │   (BLE)      │
│   (Native)   │    │   (BLE)      │    │              │
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
│                       │   ├── SeedCameraScreen
│                       │   └── YOLOv8 Model (Seed Detection)
│                       ├── MoistureDetectorScreen (Seed Moisture)
│                       │   ├── DeviceConnectionScreen
│                       │   ├── ReadingResultsScreen
│                       │   ├── Linear Regression Model (pH Prediction)
│                       │   └── Seed Drying Schedule (Weather-based Time Slots)
│                       ├── SoilPHScreen
│                       │   ├── pH Sensor (BLE)
│                       │   ├── Location Service
│                       │   └── Rice Variety API
│                       ├── PestDetectionScreen
│                       │   ├── Camera Integration
│                       │   ├── CNN Model (TFLite)
│                       │   ├── RAG Service (Solutions)
│                       │   └── LLM Chat (Questions)
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
2. **IoT Data Flow**: ESP32 Devices → BLE → BLEService/ESP32Service → Screen → Firebase Storage
3. **Seed Detection Flow**: Camera/Gallery → Image Capture → YOLOv8 Model → Object Detection → Seed Classification → Results → Screen
4. **Seed Moisture Monitoring Flow**: 
   - ESP32 Moisture Device (BLE) → Sensor Data (cap_sensor_value, sample_temperature, ambient_temperature, ambient_humidity, sample_weight)
   - GPS Location → Location Service → Coordinates
   - Weather API → Weather Data & Forecasts
   - Combined Data (Sensor + GPS + Weather) → Linear Regression Model → pH Prediction + Weather Analysis
   - Weather Forecast Analysis → Seed Drying Schedule Generation → Optimal Time Slots Identification
   - Results (pH Prediction + Drying Schedule + Time Slots) → Screen
5. **Pest Detection Flow**: 
   - Camera/Gallery → Image Capture → TFLite CNN Model → Disease Classification
   - Disease Classification → RAG Service → Solution Retrieval (Offline)
   - User Questions → LLM Service (OpenAI) → Chat Responses
6. **Soil pH Testing Flow**:
   - ESP32 pH Device (BLE) → Sensor Data (pH, moisture, EC, temp, water depth)
   - GPS Location → Location Service → Coordinates
   - User Input (crop, season, soil zone, texture) → Form Data
   - Combined Data → Rice Variety API → Recommended Rice Varieties (Top 3)
7. **Marketplace Flow**: User Input → Firebase Database → Marketplace Screen → Real-time Updates

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
- `react-native-ble-plx`: ^3.5.0 (Bluetooth Low Energy for ESP32 devices)
- Custom ESP32 Service (WiFi/HTTP communication)
- **ESP32 Moisture Sensor Device** (BLE connection for seed moisture monitoring)
- **ESP32 pH Sensor Device** (BLE connection for soil pH testing)
- BLE Scan Service (ESP32 device scanning)

#### Camera & Image Processing
- `react-native-vision-camera`: ^4.0.0
- `react-native-image-picker`: ^7.1.2
- `react-native-image-resizer`: (For image preprocessing)
- `jpeg-js`: (Image processing for TFLite)
- `react-native-fs`: (File system operations)
- **YOLOv8 Model** (for seed detection - object detection model)

#### AI & Machine Learning
- **TensorFlow Lite** (Native Module - Custom implementation for pest detection)
- CNN model for disease classification (10 classes: bacterial leaf blight, blast, brown spot, etc.)
- **YOLOv8** (for seed quality detection - object detection model)
- **Linear Regression Model** (for moisture prediction)

#### LLM & AI Services
- OpenAI API (for LLM chat functionality)
- RAG (Retrieval-Augmented Generation) service (offline solution database)

#### Location & API Services
- Location Service (GPS integration for soil pH analysis and moisture monitoring)
- Weather Service (Real-time weather data and forecasting for moisture prediction)
- Rice Variety API Service (AI-powered rice variety recommendations)

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
- TensorFlow Lite library (for pest detection)

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS)
- OpenAI API Key (optional, for LLM chat feature in pest detection)

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

5. **Configure Environment Variables (Optional - for LLM chat)**
   - Create a `.env` file in the root directory
   - Add your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`
   - Note: LLM chat feature works with API key, but core pest detection works offline

6. **Start Metro Bundler**
   ```bash
   npm start
   # or
   yarn start
   ```

7. **Run the application**
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

### 1. Seed Quality Detection ⭐

**AI-powered seed analysis using YOLOv8 object detection model** with the following capabilities:

#### Core Features:
- **YOLOv8 Object Detection**: Uses YOLOv8 (You Only Look Once version 8) model for real-time seed detection and classification
- **Wild Seed Detection**: Identifies and distinguishes wild seeds from cultivated paddy seeds
- **Seed Variety Identification**: Classifies different paddy seed varieties
- **Quality Assessment**: Provides quality scoring and recommendations based on detected seeds

#### Technical Implementation:
- **YOLOv8 Model**: State-of-the-art object detection model for accurate seed detection and classification
- **Image Processing**: Camera-based image capture or gallery selection
- **Real-time Detection**: Fast inference for instant seed analysis
- **Visual Feedback**: Displays detected seeds with bounding boxes and classifications

#### Workflow:
1. User captures/selects image of paddy seeds
2. Image is preprocessed and fed to YOLOv8 model
3. Model detects and classifies seeds (varieties and wild seeds)
4. Results are displayed with quality scores and recommendations

#### Related Hardware:
- **Seed Sorter Machine**: A separate physical seed sorting machine is available for automated wild seed removal
  - **Note**: The seed sorter machine is **NOT connected** to the mobile app
  - The machine operates with its **own standalone software**
  - Users can manually use the detection results from the app to operate the seed sorter machine separately
  - The machine physically separates and removes wild seeds from seed batches based on detection results

### 2. Seed Moisture Monitoring ⭐

**Real-time seed moisture measurement with pH prediction and weather-based seed drying schedule** with the following capabilities:

#### Core Features:
- **Real-time Sensor Readings**: Continuous seed moisture measurement via dedicated ESP32 moisture sensor device
- **pH Prediction**: Linear Regression model predicts pH levels based on seed moisture sensor data
- **Bluetooth Low Energy (BLE) Connectivity**: Connects to ESP32 moisture sensor device via BLE
- **GPS Integration**: Location-based analysis using GPS coordinates
- **Weather Forecasting**: Real-time weather data and forecasting integration for optimal drying conditions
- **Seed Drying Schedule**: Intelligent time schedule generation for seed drying based on weather forecasts
- **Optimal Time Slots**: Recommends special time slots for seed drying when weather conditions are favorable
- **Historical Data Tracking**: Stores and analyzes historical seed moisture readings
- **Predictive Analytics**: Uses Linear Regression model to predict pH and future moisture levels based on sensor data, location, and weather conditions

#### Technical Implementation:
- **ESP32 Moisture Sensor Device**: Dedicated ESP32 IoT device for moisture monitoring (separate from pH sensor)
- **BLE Integration**: Connects to ESP32 moisture sensor device via Bluetooth Low Energy
- **IoT Sensor Parameters**: Reads multiple parameters from the ESP32 device:
  - **cap_sensor_value**: Capacitive sensor value for moisture measurement
  - **sample_temperature**: Temperature of the seed sample (°C)
  - **ambient_temperature**: Ambient air temperature (°C)
  - **ambient_humidity**: Ambient air humidity (%)
  - **sample_weight**: Weight of the seed sample (grams)
- **GPS Integration**: Location services for location-based weather and analysis
- **Weather Service**: Real-time weather data and forecasting API integration
- **Linear Regression Model**: Trained model for pH prediction and moisture analysis based on:
  - Sensor readings (cap_sensor_value, temperatures, humidity, weight)
  - GPS location coordinates
  - Weather data and forecasts
- **Weather-based Drying Schedule**: Analyzes weather forecasts to generate optimal seed drying schedules
- **Time Slot Recommendations**: Identifies special time slots when weather conditions are ideal for seed drying
- **Data Processing**: Model processes sensor readings, location, and weather data to provide pH predictions and drying recommendations
- **Historical Analysis**: Tracks trends and patterns in seed moisture data

#### Workflow:
1. User connects ESP32 moisture sensor device via Bluetooth (BLE)
2. GPS location is automatically detected or manually selected
3. Real-time weather data and forecasts are fetched based on location
4. Sensor readings are captured in real-time from the ESP32 moisture device:
   - Capacitive sensor value (moisture)
   - Sample temperature
   - Ambient temperature
   - Ambient humidity
   - Sample weight
5. Data (sensor readings + GPS + weather) is processed through Linear Regression model
6. Model predicts pH levels and analyzes current seed moisture conditions
7. System analyzes weather forecasts to identify optimal drying conditions
8. Intelligent seed drying schedule is generated with recommended time slots
9. Results are displayed with:
   - Predicted pH levels
   - Weather-based drying schedule
   - Recommended time slots for seed drying
   - Historical trends and recommendations

### 3. Soil pH Testing ⭐

**Comprehensive soil analysis and rice variety prediction system** with the following capabilities:

#### Core Features:
- **Multi-parameter Soil Sensing**: Real-time measurement of multiple soil parameters via dedicated ESP32 pH sensor device:
  - **pH Level**: Soil acidity/alkalinity measurement (0-14 scale)
  - **Soil Moisture**: Percentage moisture content
  - **Electrical Conductivity (EC)**: Soil salinity measurement (dS/m)
  - **Soil Temperature**: Temperature monitoring (°C)
  - **Water Depth**: Water level measurement (cm)

#### Technical Implementation:
- **ESP32 pH Sensor Device**: Dedicated ESP32 IoT device for soil pH testing (separate from moisture sensor)
- **Bluetooth Low Energy (BLE) Integration**: Connects to ESP32 pH sensor device via BLE
- **Real-time Data Updates**: Continuous monitoring with automatic data refresh
- **Location Services**: GPS integration for location-based analysis and map picker
- **Form-based Input**: Additional agricultural context fields:
  - Previous Crop (Rice, Maize, Fallow, Legume)
  - Season (Maha, Yala)
  - Soil Zone (Intermediate, Low Country, Up Country)
  - Texture (Loamy, Clay, Sandy)
- **Rice Variety Prediction API**: AI-powered recommendation system that suggests optimal rice varieties based on:
  - Soil pH and EC values
  - Soil moisture and temperature
  - Water depth
  - Location coordinates
  - Agricultural context (previous crop, season, soil zone, texture)
- **Sensor Data Validation**: Intelligent zero-value filtering and data validation
- **Connection Management**: Robust BLE connection handling with auto-reconnect capabilities

#### Workflow:
1. User connects ESP32 pH sensor device via Bluetooth (BLE)
2. Sensor readings are captured from the ESP32 pH device (pH, moisture, EC, temperature, water depth)
3. Location is automatically detected or manually selected via map
4. User fills additional form fields (crop, season, soil zone, texture)
5. Data is sent to Rice Variety Prediction API
6. API returns top 3 recommended rice varieties with suitability scores
7. Results are displayed with recommendations for optimal crop selection

#### Sensor Specifications:
- **pH Range**: 0-14 (typically 6.0-8.0 for paddy fields)
- **Moisture Range**: 0-100%
- **EC Range**: 0-10 dS/m
- **Temperature Range**: 0-50°C
- **Water Depth Range**: 0-50 cm

### 4. Pest & Disease Detection ⭐

**Advanced AI-powered pest and disease detection system** with the following capabilities:

#### Core Features:
- **CNN-based Disease Classification**: Uses TensorFlow Lite (TFLite) native module for real-time disease prediction
- **10 Disease Classes**: Detects common paddy diseases including:
  - Bacterial Leaf Blight
  - Bacterial Leaf Streak
  - Bacterial Panicle Blight
  - Blast
  - Brown Spot
  - Dead Heart
  - Downy Mildew
  - Hispa
  - Normal (healthy)
  - Tungro

#### Technical Implementation:
- **Image Capture**: Camera integration using React Native Vision Camera or gallery selection
- **Image Preprocessing**: Efficient image resizing and preprocessing for TFLite model input (224x224)
- **Model Inference**: Native TensorFlow Lite module for fast, on-device inference
- **Offline RAG Service**: Retrieval-Augmented Generation system that provides instant solutions based on detected diseases
  - Loads disease solution database from JSON
  - Provides treatment recommendations, prevention methods, and management strategies
  - Works completely offline
- **LLM Chat Assistant**: OpenAI-powered chat interface for asking questions about detected diseases
  - Requires OpenAI API key (optional feature)
  - Provides additional context and answers user questions
  - Can be enabled/disabled based on API key availability

#### Workflow:
1. User captures/selects image of affected paddy plant
2. Image is preprocessed and fed to CNN model
3. Model predicts disease class with confidence score
4. RAG service retrieves comprehensive solution from offline database
5. User can ask questions via LLM chat (if API key is configured)
6. Results are displayed with recommendations and treatment options

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

### ESP32 IoT Devices Configuration

The application uses **two separate ESP32 devices**:

#### ESP32 Moisture Sensor Device
- Dedicated ESP32 device for seed moisture monitoring
- Connection: Bluetooth Low Energy (BLE)
- See `ESP32_SETUP.md` for detailed device setup
- Set up BLE service UUIDs for Bluetooth connection
- Sensor Parameters Read:
  - `cap_sensor_value`: Capacitive sensor value for moisture measurement
  - `sample_temperature`: Temperature of the seed sample (°C)
  - `ambient_temperature`: Ambient air temperature (°C)
  - `ambient_humidity`: Ambient air humidity (%)
  - `sample_weight`: Weight of the seed sample (grams)
- GPS Integration: Location services enabled for weather-based analysis
- Weather API: Configure weather service for forecasting integration

#### ESP32 pH Sensor Device
- Dedicated ESP32 device for soil pH testing
- Connection: Bluetooth Low Energy (BLE)
- See `ESP32_SETUP.md` for detailed device setup
- Set up BLE service UUIDs for Bluetooth connection
- Configure sensor parameters for pH, EC, temperature, moisture, and water depth measurement

**Note**: Both ESP32 devices are separate hardware units that connect to the mobile app independently via Bluetooth.

### API Configuration

#### Weather API
- Configure weather API keys in `src/utils/weatherService.js`

#### Rice Variety API (for Soil pH Testing)
- Configure API endpoint in `src/utils/riceVarietyApiService.js`
- API endpoint: `/rice-variety/predict`
- Required data: pH, EC, moisture, temperature, water depth, location, agricultural context
- Returns: Top 3 recommended rice varieties with suitability scores

#### OpenAI API (Optional - for Pest Detection Chat)
- Create `.env` file in root directory
- Add: `OPENAI_API_KEY=your_api_key_here`
- Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Note: Pest detection core functionality works offline; API key only enables chat feature

### Machine Learning Model Configuration

#### YOLOv8 Model (Seed Detection)
- YOLOv8 model files should be included in the project
- Model handles object detection for seed classification and wild seed identification
- Configure model path and input/output parameters in seed detection service
- Input: Images (typically resized to model input dimensions)
- Output: Detected seeds with bounding boxes, classes, and confidence scores

#### Linear Regression Model (Seed Moisture - pH Prediction)
- Linear Regression model for pH prediction based on seed moisture sensor data
- Model trained on sensor data (cap_sensor_value, sample_temperature, ambient_temperature, ambient_humidity, sample_weight)
- Weather-based seed drying schedule generation
- Configure model parameters (coefficients, intercept) in seed moisture detection service
- Input: Sensor readings (cap_sensor_value, temperatures, humidity, weight), GPS location, weather forecasts
- Output: Predicted pH levels, seed drying schedule, optimal time slots for drying

### TensorFlow Lite Model Setup
- The CNN model for pest detection is integrated as a native module
- Model files should be included in the native project structure
- For Android: Model typically in `android/app/src/main/assets/`
- For iOS: Model typically in Xcode project bundle
- See native module implementation for model loading details

---

## 📂 Project Structure

```
iPaddyCare/
├── android/                 # Android native code
│   └── app/
│       └── src/main/
│           └── assets/      # TFLite model files
├── ios/                     # iOS native code
│   └── iPaddyCare/          # TFLite model files
├── assets/                  # Static assets (images, etc.)
├── screens/                 # Screen components
│   ├── HomeScreen.js
│   ├── LoginScreen.js
│   ├── SeedDetectionScreen.js
│   ├── MoistureDetectorScreen.js
│   ├── SoilPHScreen.js
│   ├── PestDetectionScreen.js  # Pest detection UI
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
│   ├── services/            # AI/ML Services
│   │   ├── pestDetectionService.js  # TFLite CNN model
│   │   ├── ragService.js            # RAG solution retrieval
│   │   └── LLMService.js            # OpenAI chat service
│   └── utils/               # Utility services
│       ├── firebaseConfig.js
│       ├── bleService.js
│       ├── esp32Service.js
│       ├── phSensorService.js        # pH sensor BLE service
│       ├── BleScanServiceEsp32.js    # ESP32 BLE scanning
│       ├── locationService.js        # GPS location service
│       ├── riceVarietyApiService.js  # Rice variety prediction API
│       ├── bluetoothPermissionService.js
│       ├── predictionService.js
│       └── weatherService.js
├── rag-data/                # RAG database
│   └── pest-disease-solutions.json  # Disease solutions database
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
- **Seed Quality Detection with YOLOv8**:
  - YOLOv8 object detection model integration
  - Wild seed detection and classification
  - Seed variety identification
  - Camera-based image analysis
  - Note: Seed sorter machine (separate hardware with standalone software) available for physical wild seed removal
- **Seed Moisture Monitoring with Linear Regression**:
  - Linear Regression model for pH prediction
  - ESP32 moisture sensor device integration (BLE connection)
  - GPS integration for location-based analysis
  - Weather forecasting integration for seed drying schedule
  - Intelligent seed drying schedule generation with optimal time slots
  - IoT sensor parameters: cap_sensor_value, sample_temperature, ambient_temperature, ambient_humidity, sample_weight
  - Real-time data collection and analysis
  - Historical data tracking and trend analysis
- **Soil pH Testing with Rice Variety Prediction**:
  - Multi-parameter soil sensing (pH, moisture, EC, temperature, water depth)
  - ESP32 pH sensor device integration via BLE (separate from moisture device)
  - Location-based analysis with GPS integration
  - Rice variety prediction API integration
  - Real-time sensor data monitoring
  - Agricultural context form (crop, season, soil zone, texture)
- **Pest & Disease Detection with AI/ML integration**:
  - TensorFlow Lite CNN model for disease classification
  - RAG (Retrieval-Augmented Generation) service for offline solutions
  - LLM chat integration (OpenAI) for interactive assistance
  - Camera integration for image capture
  - Support for 10 disease classes
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
- ✅ **Seed Detection with YOLOv8**:
  - ✅ YOLOv8 model integration
  - ✅ Object detection implementation
  - ✅ Seed classification system
  - ✅ Camera integration
- ✅ **Seed Moisture Monitoring with Linear Regression**:
  - ✅ Linear Regression model integration for pH prediction
  - ✅ ESP32 moisture sensor device connectivity (BLE)
  - ✅ GPS integration for location-based analysis
  - ✅ Weather forecasting integration
  - ✅ Seed drying schedule generation with optimal time slots
  - ✅ IoT sensor parameter collection (cap_sensor_value, temperatures, humidity, weight)
  - ✅ Real-time data processing
  - ✅ pH prediction and drying recommendations system
- ✅ **Soil pH Testing System**:
  - ✅ ESP32 pH sensor device BLE integration (separate device)
  - ✅ Multi-parameter soil sensing
  - ✅ Location services integration
  - ✅ Rice variety prediction API
  - ✅ Real-time data monitoring
- ✅ Multi-language support
- ✅ Marketplace functionality
- ✅ Officer communication system
- ✅ **Pest Detection AI/ML Integration**:
  - ✅ TensorFlow Lite native module
  - ✅ CNN model integration
  - ✅ RAG service implementation
  - ✅ LLM chat integration
  - ✅ Camera integration
- 🔄 Advanced analytics (in progress)
- 🔄 Model optimization (in progress)

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
- [TensorFlow Lite Documentation](https://www.tensorflow.org/lite)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

**Last Updated**: [Current Date]
**Version**: 0.0.1
