// Minimal RFC 4180 CSV reader: quoted fields, "" escapes,
// commas and line breaks inside quotes, CRLF or LF, optional BOM.

export function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false, i = 0;
  if (text.charCodeAt(0) === 0xfeff) i = 1;
  for (; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(v => v.trim() !== ''));
}

// Returns an array of objects keyed by the header row.
export function csvToObjects(text) {
  const [header, ...rows] = parseCSV(text);
  if (!header) return [];
  const keys = header.map(h => h.trim());
  return rows.map(r => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])));
}

export async function fetchCSV(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${url} (HTTP ${res.status})`);
  return csvToObjects(await res.text());
}
