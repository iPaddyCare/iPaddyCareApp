/**
 * Environment Configuration
 * API endpoints and configuration values
 */

const ENV = {
  API_BASE_URL: 'https://ipaddycare-backend.onrender.com',
  API_VERSION: 'v1',
  METEOSOURCE_API_KEY: '1gc67s6zwk1aijim6jpsunfygqpz8vk2wgm447br',
};

export const API_ENDPOINTS = {
  RICE_VARIETY_PREDICT: `${ENV.API_BASE_URL}/api/${ENV.API_VERSION}/rice-variety/predict`,
};

export default ENV;

