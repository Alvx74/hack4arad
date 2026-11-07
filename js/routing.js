// Street routing via public OSRM servers, plus turn-by-turn text.
import { ROUTERS, ROUTE_QUERY, ROUTE_TIMEOUT_MS } from './config.js';
import { haversine, cardinal } from './geo.js';

// Returns { coords:[[lat,lon]...], steps, dist, dur, label } or null.
export async function fetchRoute(from, to) {
  const c = `${from.lon},${from.lat};${to.lon},${to.lat}`;
  for (const r of ROUTERS) {
    try {
      const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), ROUTE_TIMEOUT_MS);
      const res = await fetch(r.url.replace('{c}', c) + ROUTE_QUERY, { signal: ctl.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      const j = await res.json();
      const route = j.code === 'Ok' && j.routes && j.routes[0];
      if (!route || !route.geometry) continue;
      return {
        coords: route.geometry.coordinates.map(p => [p[1], p[0]]),
        steps: (route.legs && route.legs[0] && route.legs[0].steps) || [],
        dist: route.distance, dur: route.duration, label: r.label,
      };
    } catch { /* try the next server */ }
  }
  return null;
}

export function stepText(s) {
  const m = s.maneuver || {}, nm = s.name || '';
  const on = nm ? ' onto ' + nm : '';
  switch (m.type) {
    case 'depart': return 'Head ' + cardinal(m.bearing_after || 0) + (nm ? ' on ' + nm : '');
    case 'arrive': return 'Arrive at your destination';
    case 'roundabout': case 'rotary': return 'At the roundabout, take exit ' + (m.exit || 1) + on;
    case 'exit roundabout': case 'exit rotary': return 'Exit the roundabout' + on;
    case 'new name': return 'Continue' + (nm ? ' on ' + nm : ' straight');
  }
  if (m.modifier === 'uturn') return 'Make a U-turn' + on;
  if (m.modifier === 'straight' || !m.modifier) return 'Continue' + (nm ? ' on ' + nm : ' straight');
  return 'Turn ' + m.modifier + on;
}

// Index of the step whose geometry is closest to pos, or -1.
export function currentStep(steps, pos) {
  if (!pos || !steps.length) return -1;
  let best = -1, bd = Infinity;
  steps.forEach((s, i) => {
    ((s.geometry && s.geometry.coordinates) || []).forEach(c => {
      const d = haversine(pos.lat, pos.lon, c[1], c[0]);
      if (d < bd) { bd = d; best = i; }
    });
  });
  return best;
}
