import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';

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
        {/* <Stack.Screen name="SeedDetection" component={SeedDetectionScreen} /> */}
        {/* <Stack.Screen name="MoistureDetector" component={MoistureScreen} /> */}
        {/* <Stack.Screen name="SoilPH" component={SoilPHScreen} /> */}
        {/* <Stack.Screen name="PestDetection" component={PestDetectionScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}