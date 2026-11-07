// Per-user saved state: trail progress, best trivia scores, own photos.
// Stored in localStorage for now. To move it to a server, keep these
// method names and swap the bodies for API calls.

import { STORAGE_PREFIX } from './config.js';

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

    getPhoto(placeId) { const v = get('photo:' + placeId); return v && v.startsWith('data:image/') ? v : null; },
    setPhoto(placeId, dataUrl) { return set('photo:' + placeId, dataUrl); },
    removePhoto(placeId) { del('photo:' + placeId); },
  };
}
