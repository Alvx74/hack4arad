// Loads the three selectable trails and independent side quests from one JSON catalogue.
export async function loadTrail() {
  const res = await fetch('data/game-data.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('data/game-data.json (HTTP ' + res.status + ')');
  const data = await res.json();
  if (!Array.isArray(data.routes) || !Array.isArray(data.places) || !Array.isArray(data.sidequests)) {
    throw new Error('The game data must contain routes, places and sidequests.');
  }
  const places = data.places.map(p => {
    const lat = Number(p.lat), lon = Number(p.lon);
    if (!p.id || !p.name || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error('Location "' + (p.id || '?') + '" needs id, name, lat and lon.');
    }
    return {
      ...p, lat, lon, short: p.short || p.name, category: p.category || '',
      kind: p.kind || '', address: p.address || '', hint: p.hint || '',
      photo: p.photo || '', photoCredit: p.photoCredit || '', wikipedia: p.wikipedia || '',
      text: Array.isArray(p.text) ? p.text : [], trivia: Array.isArray(p.trivia) ? p.trivia : [],
    };
  });
  const byId = new Map(places.map(p => [p.id, p]));
  const routes = data.routes.map(route => {
    if (!route.id || !route.name || !Array.isArray(route.locationIds) || !route.locationIds.length) {
      throw new Error('Each route needs an id, name and at least one location.');
    }
    route.locationIds.forEach(id => { if (!byId.has(id)) throw new Error('Unknown location "' + id + '" in route "' + route.id + '".'); });
    return route;
  });
  const sidequests = data.sidequests.map(s => {
    if (!byId.has(s.id)) throw new Error('Unknown side quest location "' + s.id + '".');
    return { ...s, place: byId.get(s.id) };
  });
  return { places, routes, sidequests, warnings: data.coordinate_note ? [data.coordinate_note] : [] };
}
