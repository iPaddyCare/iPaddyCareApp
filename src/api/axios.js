import axios from 'axios';
import { Platform } from 'react-native';

// Try to import API_URL from @env, fallback to default if not available
let API_URL;
try {
  const env = require('@env');
  API_URL = env.API_URL;
} catch (e) {
  console.warn('Could not load API_URL from @env, using default');
}

// Default API URL if not set in .env
// const DEFAULT_API_URL = 'http://localhost:8000/api/v1';

// Use the API_URL as-is, or default to localhost
// Note: For Android emulator, you may need to use 10.0.2.2 instead of localhost
// For physical devices, use your computer's IP address
// You can set API_URL in .env file to override this behavior
const getBaseURL = () => {
  const baseUrl = 'http://10.212.134.191:8000/api/v1';
  console.log('API_URL from env:', API_URL);
  console.log('Platform:', Platform.OS);
  console.log('Using base URL:', baseUrl);
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
