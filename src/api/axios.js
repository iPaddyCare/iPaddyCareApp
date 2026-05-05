import axios from 'axios';
import { Platform } from 'react-native';

// Base URL from .env (react-native-dotenv → @env). See .env.example.
// Physical devices: localhost is the phone itself — use your deployed API URL or your Mac's LAN IP.
let API_URL;
try {
  const env = require('@env');
  API_URL = env.API_URL;
} catch (e) {
  console.warn('Could not load API_URL from @env, using default');
}

const DEFAULT_BASE_URL = 'https://ipaddycare-backend.onrender.com/api/v1';

const getBaseURL = () => {
  const fromEnv =
    typeof API_URL === 'string' && API_URL.trim().length > 0 ? API_URL.trim() : null;
  const baseUrl = fromEnv || DEFAULT_BASE_URL;
  if (__DEV__) {
    console.log('API_URL from env:', fromEnv ?? '(unset)');
    console.log('Platform:', Platform.OS);
    console.log('Using base URL:', baseUrl);
  }
  return baseUrl;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // Increased timeout for slower connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to log requests
api.interceptors.request.use(
  (config) => {
    // Only log in development
    if (__DEV__) {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    // Only log actual errors, not warnings
    if (error.message) {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    // Only log in development
    if (__DEV__) {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    // Better error handling - only log if it's a real error
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const url = error.config?.url || 'unknown';
      console.error(`API Error [${status}]: ${url}`);
      if (error.response.data) {
        console.error('Error details:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error: No response from server');
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
