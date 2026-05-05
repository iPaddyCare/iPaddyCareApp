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
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Full URL:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error.message);
    return Promise.reject(error);
  }
);

export default api;
