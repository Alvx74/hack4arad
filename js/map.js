// Leaflet map wrapper. Leaflet itself is loaded as a global (window.L)
// from vendor/leaflet by index.html.
import { START, TILES, MAP_COLORS, MAP_COLORS_DARK } from './config.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export class TrailMap {
  constructor(el, { onMapClick, onMarkerClick, onTileError, dark = false }) {
    const C = dark ? MAP_COLORS_DARK : MAP_COLORS;
    this.dark = dark;
    const L = window.L;
    this.L = L;
    this.markers = {};
    this.map = L.map(el, { zoomControl: false }).setView(START, 15);
    let warned = false;
    this.tiles = L.tileLayer(this.tileUrl(dark), TILES.options).addTo(this.map).on('tileerror', () => {
      if (!warned) { warned = true; onTileError && onTileError(); }
    });
    // Solid line = walking on streets; dotted = getting to/from the nearest street,
    // or a straight-line guess while no street route is available.
    this.routeLine = L.polyline([], { color: C.route, weight: 6, opacity: 0.85, lineJoin: 'round' }).addTo(this.map);
    this.linkLine = L.polyline([], { color: C.route, weight: 4, opacity: 0.9, dashArray: '1 10', lineCap: 'round' }).addTo(this.map);
    this.acc = L.circle(START, { radius: 0, stroke: false, fillColor: C.accuracy, fillOpacity: 0.12, interactive: false });
    this.ring = L.circle(START, { radius: 500, color: C.ring, weight: 2, dashArray: '6 6', fillColor: C.ring, fillOpacity: 0.05, interactive: false });
    this.dot = L.circleMarker(START, { radius: 8, color: '#ffffff', weight: 3, fillColor: C.user, fillOpacity: 1, interactive: false });
    this.onMarkerClick = onMarkerClick;
    this.map.on('click', e => onMapClick && onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng }));
    if (window.ResizeObserver) new ResizeObserver(() => this.map.invalidateSize()).observe(el);
  }

  tileUrl(dark) { return dark ? TILES.url.replace('rastertiles/voyager', 'dark_all') : TILES.url; }

  // Switches map tiles and line colours between light and dark mode.
  setTheme(dark) {
    if (dark === this.dark) return;
    this.dark = dark;
    const C = dark ? MAP_COLORS_DARK : MAP_COLORS;
    this.tiles.setUrl(this.tileUrl(dark));
    this.routeLine.setStyle({ color: C.route });
    this.linkLine.setStyle({ color: C.route });
    this.ring.setStyle({ color: C.ring, fillColor: C.ring });
    this.acc.setStyle({ fillColor: C.accuracy });
    this.dot.setStyle({ fillColor: C.user });
  }

  // stops: [{ id, lat, lon, kind:'shadow'|'on'|'off'|'current', no, label, title }]
  setStops(stops) {
    const L = this.L, keep = new Set(stops.map(s => s.id));
    Object.keys(this.markers).forEach(id => {
      if (!keep.has(id)) { this.map.removeLayer(this.markers[id].m); delete this.markers[id]; }
    });
    stops.forEach(s => {
      const sig = s.kind + '|' + s.no + '|' + s.label;
      const html = s.kind === 'shadow'
        ? '<div class="pin shadow">?</div>'
        : `<div class="pin ${s.kind}">${s.no}<span class="pin-label">${esc(s.label)}</span></div>`;
      const icon = L.divIcon({ className: 'pin-wrap', html, iconSize: [34, 34], iconAnchor: [17, 17] });
      const cur = this.markers[s.id];
      if (!cur) {
        const m = L.marker([s.lat, s.lon], { icon, title: s.title, keyboard: false }).addTo(this.map);
        m.on('click', () => this.onMarkerClick && this.onMarkerClick(s.id));
        this.markers[s.id] = { m, sig };
      } else if (cur.sig !== sig) {
        cur.m.setIcon(icon); cur.m.options.title = s.title; cur.sig = sig;
      }
    });
  }

  clearStops() { this.setStops([]); }

  setUser(pos, radius) {
    if (pos) {
      const ll = [pos.lat, pos.lon];
      if (!this.map.hasLayer(this.ring)) { this.ring.addTo(this.map); this.acc.addTo(this.map); this.dot.addTo(this.map); }
      this.ring.setLatLng(ll); this.ring.setRadius(radius);
      this.acc.setLatLng(ll); this.acc.setRadius(pos.acc > 0 ? pos.acc : 0);
      this.dot.setLatLng(ll);
    } else if (this.map.hasLayer(this.ring)) {
      [this.ring, this.acc, this.dot].forEach(l => this.map.removeLayer(l));
    }
  }

  // solid: [[lat,lon]...]; dotted: list of such lines.
  setRoute(solid, dotted) {
    this.routeLine.setLatLngs(solid || []);
    this.linkLine.setLatLngs((dotted || []).filter(l => l.length > 1));
  }

  // pad = { top, right, bottom, left } in pixels, for parts of the map covered by UI.
  fitPoints(points, maxZoom = 17, pad) {
    if (!points.length) return;
    const p = Object.assign({ top: 50, right: 50, bottom: 50, left: 50 }, pad || {});
    if (points.length === 1) {
      this.map.setView(points[0], maxZoom);
      if (pad) this.map.panBy([(p.right - p.left) / 2, (p.bottom - p.top) / 2], { animate: false });
    } else {
      this.map.fitBounds(this.L.latLngBounds(points), { paddingTopLeft: [p.left, p.top], paddingBottomRight: [p.right, p.bottom], maxZoom });
    }
  }

  center(pos) { this.map.setView([pos.lat, pos.lon], Math.max(this.map.getZoom(), 17)); }
  zoomIn() { this.map.zoomIn(); }
  zoomOut() { this.map.zoomOut(); }
  refresh() { this.map.invalidateSize(); }
}
