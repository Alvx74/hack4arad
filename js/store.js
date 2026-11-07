// Per-user saved state.
//   On this device (localStorage): trail progress, best scores cache, own photos.
//   In Supabase (database/scores.js): best trivia score per place, tied to the account,
//   so a player who signs in on a new device keeps the stops they finished.

import { STORAGE_PREFIX } from './config.js';
import { backend } from './backend.js';

export function createUserStore(userId) {
  const base = STORAGE_PREFIX + 'user:' + userId + ':';
  const get = k => { try { return localStorage.getItem(base + k); } catch { return null; } };
  const set = (k, v) => { try { localStorage.setItem(base + k, v); return true; } catch { return false; } };
  const del = k => { try { localStorage.removeItem(base + k); } catch { /* ignore */ } };

  return {
    loadProgress() {
      try {
        const j = JSON.parse(get('progress'));
        if (j && Array.isArray(j.discovered) && Array.isArray(j.completed)) return j;
      } catch { /* fall through */ }
      return { discovered: [], completed: [] };
    },
    saveProgress(p) { set('progress', JSON.stringify(p)); },

    getBest(placeId) { const v = get('best:' + placeId); const n = parseInt(v, 10); return isNaN(n) ? undefined : n; },
    setBest(placeId, score) { set('best:' + placeId, String(score)); },
    clearBests(ids) { ids.forEach(id => del('best:' + id)); },

    // True once this device has saved any progress for this account.
    hasLocalProgress() { return get('progress') !== null; },

    // { placeId: bestScore } from the account, or null if it can't be reached.
    async loadRemoteScores() {
      try {
        const rows = await (await backend()).getMyScores();
        const best = {};
        (rows || []).forEach(r => {
          const id = r.place_id != null ? String(r.place_id) : null, sc = Number(r.score);
          if (id && !isNaN(sc)) best[id] = Math.max(best[id] ?? -1, sc);
        });
        return best;
      } catch (e) { console.warn('[scores] load failed', e); return null; }
    },
    async saveRemoteScore(placeId, score) {
      try { await (await backend()).savePlaceScore(placeId, score); return true; }
      catch (e) { console.warn('[scores] save failed', e); return false; }
    },

    getPhoto(placeId) { const v = get('photo:' + placeId); return v && v.startsWith('data:image/') ? v : null; },
    setPhoto(placeId, dataUrl) { return set('photo:' + placeId, dataUrl); },
    removePhoto(placeId) { del('photo:' + placeId); },
  };
}
