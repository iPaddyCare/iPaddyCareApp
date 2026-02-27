# iPaddyCare App Overview

**iPaddyCare** is a comprehensive React Native mobile application designed for paddy (rice) farming management. The application integrates modern technologies like On-Device Machine Learning (ML), Bluetooth Low Energy (BLE) IoT connectivity, and geographical mapping to provide end-to-end farming assistance. Additionally, it offers marketplace features for farm produce and agricultural supplies, along with direct communication channels with agricultural officers.

## Key Features & Core Modules

The app is divided into several main areas focusing on different aspects of smart agriculture:

### 1. 🌾 Crop Health & Disease Detection (ML + RAG)
- **Pest & Disease Detection (`PestDetectionScreen.js`)**: Uses on-device Machine Learning (via `onnxruntime-react-native`/`react-native-fast-tflite`) to identify crop diseases directly from camera images. It works completely **offline** to ensure reliability in remote farms without an internet connection.
- **RAG System (Retrieval-Augmented Generation)**: Uses a local JSON database component (`ragService.js`) to look up and provide treatment solutions and prevention tips based on the predicted disease.
- **Seed Quality Analysis (`SeedDetectionScreen.js`, `SeedCameraScreen.js`)**: Specialized module predicting and evaluating seed health directly from the app.

### 2. 📡 IoT Hardware Connectivity (Sensors)
- **Device Connection (`BLEScreen.js`, `DeviceConnectionScreen.js`)**: Connects to physical portable sensors (like moisture or pH meters) via Bluetooth Low Energy (`react-native-ble-plx`).
- **Environmental Readings (`MoistureDetectorScreen.js`, `SoilPHScreen.js`, `ReadingResultsScreen.js`)**: Processes real-time soil moisture and pH readings to optimize farming procedures and logging historical results (`HistoryScreen.js`).

### 3. 🛒 Agricultural Marketplace
- **Products & Listings (`MarketplaceScreen.js`, `MyListingsScreen.js`)**: A localized marketplace where farmers can sell their produce or buy supplies.
- **Vendor Tools (`AddProductScreen.js`, `ProductApprovalScreen.js`)**: Sellers can list their items, subject to an approval workflow before becoming publicly visible.

### 4. 👨‍🌾 Officer Communication & Support
- **Expert Access (`OfficersScreen.js`, `MessageScreen.js`)**: Allows farmers to chat directly with agricultural officers or experts to ask for help or report issues.
- **Officer Dashboard (`OfficerLoginScreen.js`, `OfficerInboxScreen.js`)**: A separate access mode and interface for officers to view and respond to farmer messages.

### 5. 🌍 Geolocation & Mapping
- **Mapping (`MapPickerScreen.js`, `CoordinateInputScreen.js`)**: Uses GPS coordinates and mapping interfaces (`@react-native-community/geolocation`, `react-native-webview`) to track farm or field locations, plot out land sizes, or report specific regional issues.

## Technical Stack & Architecture

- **Framework**: React Native (`0.80.0`)
- **UI & Styling**: React Native Paper, Tailwind classes via `twrnc`, vector icons (`lucide-react-native`, `react-native-vector-icons`), linear gradients (`react-native-linear-gradient`, `expo-linear-gradient`).
- **Navigation**: React Navigation v7 with a combination of Stack (`@react-navigation/native-stack`) and Drawer (`@react-navigation/drawer`) navigators.
- **State & Data**: Typical React Hooks ecosystem with external service files `src/services/`. Uses Firebase for Auth & Storage / NoSQL DBs.
- **Machine Learning**: Complete offline on-device inference using ONNX / TensorFlow Lite (`mlService.js`) paired with `react-native-vision-camera`.
- **Authentication**: Supports multiple sign-in methods including Apple Auth, Google Sign-in, and generic Firebase Auth APIs (`LoginScreen.js`).

## Project Structure

- `src/components/`: Reusable UI components.
- `src/services/`: Core logic providers, API clients, Firebase logic, RAG retrieval (`ragService.js`), and On-Device ML setup (`mlService.js`).
- `screens/`: Application views organized by feature sets.
- `assets/` & `ml/`: Static files, ML models (like TFLite/ONNX models for predictions), and icon guides.

## Ongoing Work / Next Steps
As defined by `ARCHITECTURE_DECISION.md` and repo state:
- Providing the definitive JSON local databases for offline solutions (e.g., `data/pest-disease-solutions.json`).
- Adding/training optimal CNN Models in `assets/models/` for pest detection.
