// Distance and formatting helpers.

const RAD = Math.PI / 180;

// Great-circle distance in metres.
export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371008.8, dLat = (lat2 - lat1) * RAD, dLon = (lon2 - lon1) * RAD;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const CARDINALS = ['nord', 'nord-nord-est', 'nord-est', 'est-nord-est', 'est', 'est-sud-est', 'sud-est', 'sud-sud-est',
  'sud', 'sud-sud-vest', 'sud-vest', 'vest-sud-vest', 'vest', 'vest-nord-vest', 'nord-vest', 'nord-nord-vest'];
export const cardinal = bearing => CARDINALS[Math.round(bearing / 22.5) % 16];

export const fmtDist = m => m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(2) + ' km';
export const fmtDur = s => { const m = Math.round(s / 60); return m < 1 ? 'sub 1 min' : m + ' min'; };
