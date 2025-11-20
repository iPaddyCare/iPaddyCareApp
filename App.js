import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import SeedDetectionScreen from './screens/SeedDetectionScreen';
import MoistureDetectorScreen from './screens/MoistureDetectorScreen';
import SoilPHScreen from './screens/SoilPHScreen';
import PestDetectionScreen from './screens/PestDetectionScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
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
          options={{ title: 'Moisture Monitor' }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}