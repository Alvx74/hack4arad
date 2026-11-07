// Street routing via public OSRM servers, plus turn-by-turn text.
import { ROUTERS, ROUTE_QUERY, ROUTE_TIMEOUT_MS } from './config.js';
import { haversine, cardinal } from './geo.js';

// Returns a walking route or null:
//   coords  road geometry [[lat,lon]...] (starts/ends on the nearest walkable way)
//   origin, dest   the real start point and destination [lat,lon]
//   snapIn, snapOut   metres from origin to the road, and from the road to dest
//   track   origin → road → dest, used to follow the walker along the route
//   steps, dist (road metres), dur (seconds), label
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
      const coords = route.geometry.coordinates.map(p => [p[1], p[0]]);
      if (!coords.length) continue;
      const origin = [from.lat, from.lon], dest = [to.lat, to.lon];
      const snapIn = haversine(origin[0], origin[1], coords[0][0], coords[0][1]);
      const last = coords[coords.length - 1];
      const snapOut = haversine(last[0], last[1], dest[0], dest[1]);
      return {
        coords, origin, dest, snapIn, snapOut,
        track: [origin, ...coords, dest],
        steps: (route.legs && route.legs[0] && route.legs[0].steps) || [],
        dist: route.distance, dur: route.duration, label: r.label,
        speed: route.duration > 0 ? route.distance / route.duration : 1.3,
      };
    } catch { /* try the next server */ }
  }
  return null;
}

const TURNS = {
  left: 'Virează la stânga', right: 'Virează la dreapta',
  'slight left': 'Ține ușor stânga', 'slight right': 'Ține ușor dreapta',
  'sharp left': 'Virează brusc la stânga', 'sharp right': 'Virează brusc la dreapta',
};

export function stepText(s) {
  const m = s.maneuver || {}, nm = s.name || '';
  const on = nm ? ' pe ' + nm : '';
  switch (m.type) {
    case 'depart': return 'Pornește spre ' + cardinal(m.bearing_after || 0) + on;
    case 'arrive': return 'Ai ajuns la destinație';
    case 'roundabout': case 'rotary': return 'La sensul giratoriu, ia ieșirea ' + (m.exit || 1) + on;
    case 'exit roundabout': case 'exit rotary': return 'Ieși din sensul giratoriu' + on;
    case 'new name': return 'Continuă' + (nm ? on : ' înainte');
  }
  if (m.modifier === 'uturn') return 'Întoarce-te' + on;
  if (m.modifier === 'straight' || !m.modifier) return 'Continuă' + (nm ? on : ' înainte');
  return (TURNS[m.modifier] || 'Virează') + on;
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
