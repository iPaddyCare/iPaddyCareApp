import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Initialize Firebase early - must be imported before any Firebase services
import '@react-native-firebase/app';

AppRegistry.registerComponent(appName, () => App);