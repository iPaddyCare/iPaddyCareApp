import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import SeedDetectionScreen from './screens/SeedDetectionScreen';
import MoistureDetectorScreen from './screens/MoistureDetectorScreen';
import SoilPHScreen from './screens/SoilPHScreen';
import PestDetectionScreen from './screens/PestDetectionScreen';
import DeviceConnectionScreen from './screens/DeviceConnectionScreen';
import DrawerContent from './src/components/DrawerContent';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Main Stack Navigator with Drawer
function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SeedDetection" 
        component={SeedDetectionScreen} 
        options={{ title: 'Seed Quality Detection' }}
      />
      <Stack.Screen 
        name="MoistureDetector" 
        component={MoistureDetectorScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SoilPH" 
        component={SoilPHScreen} 
        options={{ title: 'Soil pH Testing' }}
      />
      <Stack.Screen 
        name="PestDetection" 
        component={PestDetectionScreen} 
        options={{ title: 'Pest & Disease Detection' }}
      />
      <Stack.Screen 
        name="DeviceConnection" 
        component={DeviceConnectionScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Drawer Navigator that wraps Main Stack
function DrawerNavigator() {
  const { selectedLanguage } = useLanguage();

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <DrawerContent {...props} selectedLanguage={selectedLanguage} />
      )}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="Main" component={MainStack} />
    </Drawer.Navigator>
  );
}

// Root Navigator - handles auth flow
function RootNavigator({ navigationRef }) {
  const { isAuthenticated, loading } = useAuth();
  const [hasSkippedLogin, setHasSkippedLogin] = useState(false);

  useEffect(() => {
    // Reset skip state when user logs in
    if (isAuthenticated) {
      setHasSkippedLogin(false);
      // Navigate to Main when authenticated
      if (navigationRef.current?.isReady()) {
        navigationRef.current.navigate('Main');
      }
    }
  }, [isAuthenticated, navigationRef]);

  const handleSkip = () => {
    setHasSkippedLogin(true);
    // Navigate to Main immediately after skipping
    if (navigationRef.current?.isReady()) {
      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        })
      );
    } else {
      // If navigation not ready, wait a bit
      setTimeout(() => {
        if (navigationRef.current?.isReady()) {
          navigationRef.current.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            })
          );
        }
      }, 200);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F5132" />
      </View>
    );
  }

  // Determine which screen to show
  const showLogin = !isAuthenticated && !hasSkippedLogin;

  return (
    <Stack.Navigator 
      key={showLogin ? 'login' : 'main'} // Force re-render when switching
      initialRouteName={showLogin ? 'Login' : 'Main'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            onSkip={handleSkip}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Main" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}

export default function App() {
  const navigationRef = useRef(null);

  return (
    <AuthProvider>
      <LanguageProvider>
        <NavigationContainer 
          ref={navigationRef}
          onReady={() => {
            // Navigation container is ready
          }}
        >
          <RootNavigator navigationRef={navigationRef} />
        </NavigationContainer>
      </LanguageProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
  },
});