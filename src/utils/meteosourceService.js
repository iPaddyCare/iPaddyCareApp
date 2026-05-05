/**
 * Meteosource Weather API Service
 * Fetches current weather and daily forecast for drying schedule.
 * https://www.meteosource.com/documentation
 */

import ENV from '../config/env';

const METEOSOURCE_BASE = 'https://www.meteosource.com/api/v1/free';

/**
 * Fetch current weather and daily forecast for a location.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
async function getForecast(lat, lon) {
  const key = ENV.METEOSOURCE_API_KEY;
  if (!key) {
    return { success: false, error: 'Meteosource API key not configured' };
  }

  const url = `${METEOSOURCE_BASE}/point?lat=${lat}&lon=${lon}&sections=current,daily&timezone=auto&language=en&units=metric&key=${key}`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (!response.ok) {
      const message = json.detail || json.message || `HTTP ${response.status}`;
      return { success: false, error: message };
    }

    const rawCurrent = json.current;
    const current = rawCurrent
      ? {
          temperature: parseFloat(rawCurrent.temperature) ?? rawCurrent.temperature,
          humidity: rawCurrent.humidity != null ? Number(rawCurrent.humidity) : null,
          summary: rawCurrent.summary ?? '',
          wind: rawCurrent.wind?.speed ?? 0,
          precipitation: rawCurrent.precipitation?.total ?? 0,
        }
      : null;

    const daily = (json.daily?.data || []).map((d) => {
      const allDay = d.all_day || {};
      const astro = d.astronomy || {};
      return {
        date: d.day,
        summary: d.summary,
        tempMax: allDay.temperature_max ?? allDay.temperature,
        tempMin: allDay.temperature_min ?? allDay.temperature,
        temperature: allDay.temperature,
        humidity: allDay.humidity ?? null,
        precipitation: allDay.precipitation?.total ?? 0,
        precipitationType: allDay.precipitation?.type ?? 'none',
        windSpeed: allDay.wind?.speed ?? 0,
        sunrise: d.sunrise ?? allDay.sunrise ?? astro.sunrise ?? null,
        sunset: d.sunset ?? allDay.sunset ?? astro.sunset ?? null,
      };
    });

    return {
      success: true,
      data: {
        lat: json.lat,
        lon: json.lon,
        timezone: json.timezone,
        current,
        daily,
      },
    };
  } catch (err) {
    console.error('Meteosource fetch error:', err);
    return {
      success: false,
      error: err.message || 'Failed to fetch forecast',
    };
  }
}

/**
 * Get nearest place name for coordinates (for weather card location).
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<{ success: boolean, data?: { name, country }, error?: string }>}
 */
async function getNearestPlace(lat, lon) {
  const key = ENV.METEOSOURCE_API_KEY;
  if (!key) {
    return { success: false, error: 'Meteosource API key not configured' };
  }

  const url = `${METEOSOURCE_BASE}/nearest_place?lat=${lat}&lon=${lon}&language=en&key=${key}`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (!response.ok) {
      return { success: false, error: json.detail || `HTTP ${response.status}` };
    }

    return {
      success: true,
      data: {
        name: json.name || 'Current location',
        country: json.country || '',
      },
    };
  } catch (err) {
    console.error('Meteosource nearest_place error:', err);
    return {
      success: false,
      error: err.message || 'Failed to get location name',
    };
  }
}

export default {
  getForecast,
  getNearestPlace,
};
