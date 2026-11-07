// Loads the trail from the CSV database and turns rows into place objects.
import { DATA } from './config.js';
import { fetchCSV } from './csv.js';

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f'];

function toPlace(row, triviaRows, warn) {
  const lat = parseFloat(row.lat), lon = parseFloat(row.lon);
  if (!row.id || !row.name || isNaN(lat) || isNaN(lon)) {
    throw new Error(`Location "${row.id || '?'}" needs id, name, lat and lon.`);
  }
  const trivia = [];
  triviaRows.forEach((t, n) => {
    const options = LETTERS.map(l => t['option_' + l]).filter(o => o !== undefined && o !== '');
    const answer = LETTERS.indexOf((t.correct || '').trim().toLowerCase());
    if (!t.question || options.length < 2 || answer < 0 || answer >= options.length) {
      warn(`trivia/${row.id}.csv row ${n + 2} skipped: needs a question, 2+ options and a valid "correct" letter.`);
      return;
    }
    trivia.push({ q: t.question, o: options, a: answer, e: t.explanation || '' });
  });
  return {
    id: row.id,
    name: row.name,
    short: row.short_name || row.name,
    category: row.category || '',
    kind: row.kind || '',
    address: row.address || '',
    lat, lon,
    hint: row.hint || 'Get closer to find out what this is.',
    photo: row.photo || '',
    photoCredit: row.photo_credit || '',
    wikipedia: row.wikipedia || '',
    text: (row.description || '').split(/\n\s*\n/).map(s => s.trim()).filter(Boolean),
    trivia,
  };
}

// Returns { places, path, warnings }.
export async function loadTrail() {
  const warnings = [];
  const warn = m => { warnings.push(m); console.warn('[data]', m); };

  const pathRows = await fetchCSV(DATA.path);
  const path = pathRows
    .map(r => ({ order: parseFloat(r.order), id: r.location_id }))
    .filter(r => r.id)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(r => r.id);
  if (!path.length) throw new Error('data/path.csv lists no locations.');

  const places = await Promise.all(path.map(async id => {
    const [loc] = await fetchCSV(DATA.location(id));
    if (!loc) throw new Error(`data/locations/${id}.csv is empty.`);
    if (loc.id !== id) warn(`locations/${id}.csv has id "${loc.id}"; using "${id}".`);
    loc.id = id;
    let triviaRows = [];
    try { triviaRows = await fetchCSV(DATA.trivia(id)); }
    catch (e) { warn(`No trivia file for "${id}" (${e.message}). The stop completes on discovery.`); }
    return toPlace(loc, triviaRows, warn);
  }));

  return { places, path, warnings };
}
