// Leaderboard screen: rank, player, first bloods, score.
// Data comes from the get_leaderboard() function in Supabase
// (see database/leaderboard.sql). Sorted by score by default; the
// "First blood" filter sorts by first bloods instead (score breaks ties).

import { backend } from './backend.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let rows = null;      // last data from the server
let sortBy = 'score'; // 'score' | 'fb'

// Fetches the table. Returns rows, or throws an Error with a Romanian message.
export async function loadLeaderboard() {
  let b;
  try { b = await backend(); }
  catch { throw new Error('Nu ne putem conecta la server. Verifică conexiunea la internet.'); }
  try {
    rows = (await b.getLeaderboard()).map(r => ({
      name: r.username || 'Explorator', fb: Number(r.first_bloods) || 0, score: Number(r.score) || 0, me: !!r.is_me,
    }));
    return rows;
  } catch (e) {
    console.warn('[leaderboard]', e);
    const missing = /get_leaderboard|function .* does not exist|schema cache/i.test(String(e && (e.message || e.details)));
    throw new Error(missing
      ? 'Clasamentul nu este încă activat în baza de date. Rulați o dată database/leaderboard.sql în Supabase.'
      : 'Clasamentul nu a putut fi încărcat. Încearcă din nou.');
  }
}

// Rows in the current order, with ranks. Equal values share a rank.
export function ranked(list = rows || [], by = sortBy) {
  const key = r => by === 'fb' ? [r.fb, r.score] : [r.score, r.fb];
  const sorted = [...list].sort((a, b) => {
    const ka = key(a), kb = key(b);
    return kb[0] - ka[0] || kb[1] - ka[1] || a.name.localeCompare(b.name, 'ro');
  });
  let rank = 0, prev = null;
  return sorted.map((r, i) => {
    const k = key(r).join('|');
    if (k !== prev) { rank = i + 1; prev = k; }
    return { ...r, rank };
  });
}

export function setSort(by) { sortBy = by === 'fb' ? 'fb' : 'score'; return sortBy; }
export const getSort = () => sortBy;

// The signed-in player's own row (with rank by score), or null.
export function myStanding(list = rows || []) {
  return ranked(list, 'score').find(r => r.me) || null;
}

export function renderLeaderboard(el) {
  const list = ranked();
  if (!list.length) {
    el.innerHTML = '<div class="lb-empty"><strong>Încă nu e nimeni în clasament.</strong><p>Termină întrebările de la un loc și apari aici.</p></div>';
    return;
  }
  const medal = r => r.rank <= 3 ? ` m${r.rank}` : '';
  el.innerHTML = `<table class="lb">
    <thead><tr>
      <th scope="col" class="c-rank">Loc</th>
      <th scope="col">Utilizator</th>
      <th scope="col" class="c-num ${sortBy === 'fb' ? 'sorted' : ''}" title="Locuri la care toate răspunsurile au fost corecte din prima">First blood</th>
      <th scope="col" class="c-num ${sortBy === 'score' ? 'sorted' : ''}">Scor</th>
    </tr></thead>
    <tbody>${list.map(r => `<tr class="${r.me ? 'me' : ''}">
      <td class="c-rank"><span class="rank${medal(r)}">${r.rank}</span></td>
      <td class="c-name">${esc(r.name)}${r.me ? ' <span class="tag cur">Tu</span>' : ''}</td>
      <td class="c-num">${r.fb}</td>
      <td class="c-num"><b>${r.score}</b></td>
    </tr>`).join('')}</tbody>
  </table>`;
}
