import api from '../api/axios';

const ENDPOINT = '/drying-schedule/predict';

async function predictDryingSchedule(payload) {
  try {
    const response = await api.post(ENDPOINT, payload);
    return { success: true, data: response.data, error: null };
  } catch (error) {
    console.error('Drying schedule API error:', error?.message);
    const detail = error?.response?.data?.detail;
    const formattedDetail =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
        ? detail.map((d) => d?.msg || JSON.stringify(d)).join(', ')
        : detail
        ? JSON.stringify(detail)
        : null;
    return {
      success: false,
      data: null,
      error: formattedDetail || error?.message || 'Failed to predict drying schedule',
    };
  }
}

export default {
  predictDryingSchedule,
};
