// Central settings. Change values here instead of hunting through the code.

export const APP_NAME = 'Arad Explorer';

// Everything saved in the browser starts with this prefix.
// Bump the version if the saved format ever changes incompatibly.
export const STORAGE_PREFIX = 'arad-explorer:v3:';

// Where the CSV database lives (relative to index.html).
// path.csv lists the trail order; each id there needs
// data/locations/<id>.csv and data/trivia/<id>.csv.
export const DATA = {
  path: 'data/path.csv',
  location: id => `data/locations/${encodeURIComponent(id)}.csv`,
  trivia: id => `data/trivia/${encodeURIComponent(id)}.csv`,
};

// A stop is revealed and unlocked at or below this distance (metres).
export const DEFAULT_RADIUS = 120;
// Below this distance the route panel says "You're here".
export const ARRIVED_METERS = 25;
// Map centre before any position is known.
export const START = [46.1765, 21.3216];

// In dark mode js/map.js swaps the CARTO style 'rastertiles/voyager' for 'dark_all'.
export const TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_543n_1_cd756e9b5676b81ffed0bc5c',
  options: {
    subdomains: 'abcd',
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

// Walking route services, tried in order. {c} = "lon,lat;lon,lat".
export const ROUTERS = [
  { url: 'https://routing.openstreetmap.de/routed-foot/route/v1/foot/{c}', label: 'Traseu pietonal' },
  { url: 'https://routing.openstreetmap.de/routed-foot/route/v1/driving/{c}', label: 'Traseu pietonal' },
  { url: 'https://router.project-osrm.org/route/v1/foot/{c}', label: 'Traseu pe străzi (aproximativ pentru mers pe jos)' },
];
export const ROUTE_QUERY = '?overview=full&geometries=geojson&steps=true';
export const ROUTE_TIMEOUT_MS = 9000;

// Placeholder photos come from the location's Wikipedia article
// when its CSV has no "photo" of its own.
export const WIKI_SUMMARY = (lang, title) =>
  `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
export const WIKI_IMAGE_WIDTH = 960;

// Map colours, taken from the Arad coat of arms (keep in sync with css/styles.css).
export const MAP_COLORS = {
  route: '#3c4a8f',
  ring: '#3c4a8f',
  accuracy: '#3c4a8f',
  user: '#b53a3c',
};
// Lighter blue so the route stays visible on the dark map.
export const MAP_COLORS_DARK = {
  route: '#8d98d6',
  ring: '#8d98d6',
  accuracy: '#8d98d6',
  user: '#d06563',
};

