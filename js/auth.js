// Identification layer.
//
// The rest of the app only uses the four methods below, so replacing
// LocalUsernameAuth with a real account system (Firebase, Supabase, your
// own API...) means writing another class with the same methods and
// changing the `auth` export at the bottom. A user is { id, name }.
//
//   getCurrentUser() -> Promise<user | null>
//   signIn(username) -> Promise<user>          throws Error with a readable message
//   signOut()        -> Promise<void>
//   knownUsers()     -> user[]                  for "continue as" shortcuts (may be [])

import { STORAGE_PREFIX } from './config.js';

const K_CURRENT = STORAGE_PREFIX + 'auth:current';
const K_USERS = STORAGE_PREFIX + 'auth:users';

const read = (k, fallback) => {
  try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fallback; } catch { return fallback; }
};
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };

export function validateUsername(raw) {
  const name = String(raw || '').trim().replace(/\s+/g, ' ');
  if (name.length < 2) return { error: 'Use at least 2 characters.' };
  if (name.length > 24) return { error: 'Use at most 24 characters.' };
  if (!/^[\p{L}\p{N} _.-]+$/u.test(name)) return { error: 'Letters, numbers, spaces, dots, dashes and underscores only.' };
  return { name, id: name.toLowerCase() };
}

// Username-only sign-in stored on this device. No password: anyone using
// the same browser can pick any name. Fine for a demo, not for real accounts.
export class LocalUsernameAuth {
  #user = read(K_CURRENT, null);

  async getCurrentUser() { return this.#user; }

  async signIn(username) {
    const v = validateUsername(username);
    if (v.error) throw new Error(v.error);
    const users = read(K_USERS, []);
    const existing = users.find(u => u.id === v.id);
    const user = { id: v.id, name: existing ? existing.name : v.name };
    write(K_USERS, [{ ...user, lastSeen: Date.now() }, ...users.filter(u => u.id !== v.id)].slice(0, 8));
    write(K_CURRENT, user);
    this.#user = user;
    return user;
  }

  async signOut() {
    this.#user = null;
    try { localStorage.removeItem(K_CURRENT); } catch { /* ignore */ }
  }

  knownUsers() { return read(K_USERS, []).map(({ id, name }) => ({ id, name })); }
}

export const auth = new LocalUsernameAuth();
