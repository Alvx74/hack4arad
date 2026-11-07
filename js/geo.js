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

export const fmtDist = m => m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(2).replace('.', ',') + ' km';
export const fmtDur = s => { const m = Math.round(s / 60); return m < 1 ? 'sub 1 min' : m + ' min'; };

// --- Route tracking helpers -------------------------------------------------
// Lines are arrays of [lat, lon]. Distances are metres, computed on a local
// flat projection, which is accurate enough at city scale.

const proj = (lat, lon, lat0) => [lon * 111320 * Math.cos(lat0 * RAD), lat * 110540];

// Closest point on a line to pos: { dist, index (segment start), point:[lat,lon] }.
export function nearestOnLine(pos, line) {
  if (!line.length) return null;
  if (line.length === 1) return { dist: haversine(pos.lat, pos.lon, line[0][0], line[0][1]), index: 0, point: line[0] };
  const P = proj(pos.lat, pos.lon, pos.lat);
  let best = { dist: Infinity, index: 0, point: line[0] };
  for (let i = 0; i < line.length - 1; i++) {
    const A = proj(line[i][0], line[i][1], pos.lat), B = proj(line[i + 1][0], line[i + 1][1], pos.lat);
    const dx = B[0] - A[0], dy = B[1] - A[1], L2 = dx * dx + dy * dy;
    let t = L2 ? ((P[0] - A[0]) * dx + (P[1] - A[1]) * dy) / L2 : 0;
    t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(P[0] - (A[0] + t * dx), P[1] - (A[1] + t * dy));
    if (d < best.dist) {
      best = { dist: d, index: i, point: [line[i][0] + t * (line[i + 1][0] - line[i][0]), line[i][1] + t * (line[i + 1][1] - line[i][1])] };
    }
  }
  return best;
}

export function lineLength(line) {
  let s = 0;
  for (let i = 1; i < line.length; i++) s += haversine(line[i - 1][0], line[i - 1][1], line[i][0], line[i][1]);
  return s;
}
