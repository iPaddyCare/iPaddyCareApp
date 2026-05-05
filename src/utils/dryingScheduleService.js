const GOOD_MOISTURE_MIN = 12; // % - lower bound of good range
const GOOD_MOISTURE_MAX = 14; // % - upper bound of good range; dry until ≤ this
const TARGET_GOOD_MOISTURE = GOOD_MOISTURE_MAX; // target for "days to good" = dry until 14%

function parseTimeToMinutes(timeStr, fallbackMinutes) {
  if (!timeStr || typeof timeStr !== 'string') return fallbackMinutes;
  const hhmm = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr;
  const clean = hhmm.slice(0, 5);
  const [h, m] = clean.split(':').map((v) => Number(v));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return fallbackMinutes;
  return h * 60 + m;
}

function minutesToHHMM(totalMinutes) {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, Math.round(totalMinutes)));
  const h = String(Math.floor(clamped / 60)).padStart(2, '0');
  const m = String(clamped % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function getBestWindow(day, hasRain) {
  if (hasRain) return '09:00–11:00 (covered)';

  const sunriseMin = parseTimeToMinutes(day?.sunrise, 6 * 60);
  const sunsetMin = parseTimeToMinutes(day?.sunset, 18 * 60);
  const daylight = Math.max(240, sunsetMin - sunriseMin);
  const solarNoon = sunriseMin + daylight / 2;

  // Center a 3-hour window around solar noon; this tends to maximize drying.
  const halfWindow = 90;
  const start = Math.max(sunriseMin + 60, solarNoon - halfWindow);
  const end = Math.min(sunsetMin - 60, start + 180);
  const adjustedStart = Math.max(sunriseMin + 60, end - 180);

  return `${minutesToHHMM(adjustedStart)}–${minutesToHHMM(end)}`;
}

function getDryingScore(day) {
  const tempMax = day.tempMax ?? day.temperature ?? 25;
  const humidity = day.humidity ?? 70;
  const precip = day.precipitation ?? 0;
  const tempScore = Math.max(0, Math.min(1, (tempMax - 22) / 14));
  const humidityScore = Math.max(0, Math.min(1, (80 - humidity) / 35));
  const rainPenalty = precip >= 1 ? 0.45 : 1;
  return (tempScore * 0.6 + humidityScore * 0.4) * rainPenalty;
}

function optimizeDaysToTarget(modelDaysToTarget, dailyForecast) {
  const totalDays = Math.max(1, Math.ceil(modelDaysToTarget));
  const horizon = Math.min(totalDays, (dailyForecast || []).length || 1);
  const sample = (dailyForecast || []).slice(0, horizon);
  const avgScore =
    sample.length > 0 ? sample.reduce((sum, d) => sum + getDryingScore(d), 0) / sample.length : 0;

  let factor = 1;
  if (avgScore >= 0.75) factor = 0.7;
  else if (avgScore >= 0.55) factor = 0.8;
  else if (avgScore >= 0.4) factor = 0.9;

  return Math.max(1, Math.ceil(totalDays * factor));
}

/**
 * Estimate drying potential for one day from forecast.
 * Higher temp, lower humidity, no rain = more drying.
 * @param {Object} day - { tempMax, humidity, precipitation }
 * @param {number} moistureGap - Current moisture gap to target (%)
 * @returns {{ dryingPercent: number, isGoodDay: boolean, bestWindow: string }}
 */
function getDayDryingPotential(day, moistureGap = 1) {
  const tempMax = day.tempMax ?? day.temperature ?? 25;
  const humidity = day.humidity ?? 70;
  const precip = day.precipitation ?? 0;
  // Treat only meaningful rain as blocking drying window.
  const hasRain = precip >= 1;

  const tempFactor = Math.max(0, Math.min(1.6, (tempMax - 16) / 18));
  const humidityFactor = Math.max(0.2, (100 - humidity) / 75);
  const rainFactor = hasRain ? 0.25 : 1;
  const gap = Math.max(0, moistureGap);

  // Adaptive base drying: larger moisture gap -> faster expected reduction.
  const adaptiveBase = 0.35 + Math.min(1.2, gap * 0.11);
  let dryingPercent = adaptiveBase * tempFactor * humidityFactor * rainFactor;

  // Dynamic floor on non-rainy days so the fallback schedule still progresses.
  if (!hasRain) {
    const dynamicMin = Math.max(0.15, Math.min(0.9, gap * 0.06));
    if (dryingPercent < dynamicMin) dryingPercent = dynamicMin;
  }
  const isGoodDay = !hasRain && tempMax >= 20 && humidity <= 85;
  const bestWindow = getBestWindow(day, hasRain);

  return { dryingPercent, isGoodDay, bestWindow };
}

/**
 * Build drying schedule table: for each forecast day, estimate moisture at end of day and recommended window.
 * @param {number} currentMoisture - Current seed moisture %
 * @param {Array} dailyForecast - Array of { date, tempMax, tempMin, temperature, humidity, precipitation, precipitationType }
 * @param {number} targetMoisture - Target moisture % (default 13)
 * @returns {{ rows: Array, daysToTarget: number|null, targetMoisture: number }}
 */
function buildDryingSchedule(currentMoisture, dailyForecast, targetMoisture = TARGET_GOOD_MOISTURE) {
  if (currentMoisture <= targetMoisture) {
    return {
      rows: [],
      daysToTarget: 0,
      targetMoisture,
    };
  }

  const rows = [];
  let moisture = currentMoisture;
  let daysToTarget = null;

  for (let i = 0; i < (dailyForecast || []).length; i++) {
    const day = dailyForecast[i];
    const { dryingPercent, isGoodDay, bestWindow } = getDayDryingPotential(
      day,
      Math.max(0, moisture - targetMoisture)
    );

    moisture = Math.max(targetMoisture, moisture - dryingPercent);
    const reachedTarget = moisture <= targetMoisture && daysToTarget === null;
    if (reachedTarget) daysToTarget = i + 1;

    rows.push({
      dayIndex: i + 1,
      date: day.date,
      tempMax: day.tempMax ?? day.temperature,
      tempMin: day.tempMin ?? day.temperature,
      humidity: day.humidity,
      precipitation: day.precipitation ?? 0,
      bestWindow,
      isGoodDay,
      estimatedMoistureEnd: Math.round(moisture * 10) / 10,
      reachedTarget,
    });
  }

  return {
    rows,
    daysToTarget: daysToTarget ?? null,
    targetMoisture,
  };
}

function shiftDateString(dateStr, offsetDays) {
  if (!dateStr) return '';
  const dt = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return dateStr;
  dt.setDate(dt.getDate() + offsetDays);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default {
  buildDryingSchedule,
  buildScheduleFromPredictedDays(currentMoisture, dailyForecast, daysToTarget, targetMoisture = 13) {
    if (currentMoisture <= targetMoisture || !daysToTarget || daysToTarget <= 0) {
      return { rows: [], daysToTarget: 0, targetMoisture };
    }
    if (!dailyForecast || dailyForecast.length === 0) {
      return { rows: [], daysToTarget: Math.ceil(daysToTarget), targetMoisture };
    }

    const rows = [];
    const totalDays = optimizeDaysToTarget(daysToTarget, dailyForecast);
    const dailyDrop = (currentMoisture - targetMoisture) / totalDays;
    let moisture = currentMoisture;
    const base = dailyForecast[0];
    const fallbackDay = dailyForecast[dailyForecast.length - 1];

    for (let i = 0; i < totalDays; i++) {
      const srcDay = dailyForecast[i] || fallbackDay;
      const day = {
        ...srcDay,
        date: srcDay?.date || shiftDateString(base?.date, i),
      };
      const precip = day.precipitation ?? 0;
      const hasRain = precip >= 1;
      const bestWindow = getBestWindow(day, hasRain);

      moisture = Math.max(targetMoisture, moisture - dailyDrop);

      const reachedTarget = i + 1 >= totalDays;
      rows.push({
        dayIndex: i + 1,
        date: day.date,
        tempMax: day.tempMax ?? day.temperature,
        tempMin: day.tempMin ?? day.temperature,
        humidity: day.humidity,
        precipitation: precip,
        bestWindow,
        isGoodDay: !hasRain,
        estimatedMoistureEnd: Math.round(moisture * 10) / 10,
        reachedTarget,
      });
    }

    return { rows, daysToTarget: totalDays, targetMoisture };
  },
  TARGET_GOOD_MOISTURE,
  GOOD_MOISTURE_MIN,
  GOOD_MOISTURE_MAX,
};
