/**
 * Environment Configuration
 * API endpoints and configuration values
 */

const ENV = {
  API_BASE_URL: 'http://localhost:8000',
  API_VERSION: 'v1',
};

export const API_ENDPOINTS = {
  RICE_VARIETY_PREDICT: `${ENV.API_BASE_URL}/api/${ENV.API_VERSION}/rice-variety/predict`,
};

export default ENV;

