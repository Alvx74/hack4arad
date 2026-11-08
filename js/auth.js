// Account layer used by the app (Supabase email + password accounts).
//
// The rest of the app only uses the methods below, so the backend can be
// swapped without touching the UI. A user is { id, name, email }.
//
//   getCurrentUser()                       -> Promise<user | null>
//   signIn(email, password)                -> Promise<user>
//   signUp(name, email, password)          -> Promise<{ user } | { needsConfirmation: true }>
//   signInWithGoogle()                     -> leaves the page; back signed in (or with an error, see oauthError)
//   signOut()                              -> Promise<void>
//   requestPasswordReset(email)            -> Promise<void>
//   setNewPassword(password)               -> Promise<void>
//   onPasswordRecovery(callback)           -> called when a reset link was opened
//
// Every method throws Error with a Romanian message the UI can show as is.

import { backend } from './backend.js';

export const MIN_PASSWORD = 6;   // Supabase default; raise it here if the project requires more

const OFFLINE = 'Nu ne putem conecta la server. Verifică conexiunea la internet și încearcă din nou.';

// The page that email links (confirmation, password reset) should return to.
const returnUrl = () => location.origin + location.pathname;

export function validateDisplayName(raw) {
  const name = String(raw || '').trim().replace(/\s+/g, ' ');
  if (name.length < 2) return { error: 'Numele trebuie să aibă cel puțin 2 caractere.' };
  if (name.length > 24) return { error: 'Numele poate avea cel mult 24 de caractere.' };
  if (!/^[\p{L}\p{N} _.-]+$/u.test(name)) return { error: 'Numele poate conține doar litere, cifre, spații, puncte și cratime.' };
  return { name };
}
export function validateEmail(raw) {
  const email = String(raw || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Scrie o adresă de email validă.' };
  return { email };
}
export function validatePassword(raw) {
  if (String(raw || '').length < MIN_PASSWORD) return { error: `Parola trebuie să aibă cel puțin ${MIN_PASSWORD} caractere.` };
  return { password: raw };
}

// Turns Supabase errors into short Romanian messages.
function translate(e) {
  const m = String((e && (e.message || e.error_description)) || e || '');
  const code = e && e.code;
  if (code === 'invalid_credentials' || /invalid login credentials/i.test(m)) return 'Email sau parolă greșită.';
  if (code === 'user_already_exists' || /already (been )?registered/i.test(m)) return 'Există deja un cont cu acest email. Intră în cont.';
  if (code === 'email_not_confirmed' || /email not confirmed/i.test(m)) return 'Adresa de email nu e confirmată încă. Deschide linkul din emailul primit.';
  if (code === 'weak_password' || /password should|password is too weak/i.test(m)) return 'Parola e prea slabă. Folosește o parolă mai lungă, cu litere și cifre.';
  if (code === 'same_password') return 'Parola nouă trebuie să fie diferită de cea veche.';
  if (/rate limit|too many|security purposes/i.test(m)) return 'Prea multe încercări. Mai încearcă peste câteva minute.';
  if (/unable to validate email|invalid email|email address .* is invalid/i.test(m)) return 'Adresa de email nu este validă.';
  if (/signups not allowed/i.test(m)) return 'Crearea de conturi noi este oprită momentan.';
  if (/failed to fetch|networkerror|load failed|fetch/i.test(m)) return OFFLINE;
  console.warn('[auth]', e);
  return 'Ceva n-a mers. Încearcă din nou.';
}

async function api() {
  try { return await backend(); }
  catch (e) { console.warn('[auth] backend failed to load', e); throw new Error(OFFLINE); }
}

// Google accounts arrive with full_name / name instead of display_name. Turn it
// into a valid display name once and save it, so the leaderboard shows it too.
function nameFromGoogle(meta) {
  const raw = String(meta.full_name || meta.name || '').normalize('NFC');
  const clean = raw.replace(/[^\p{L}\p{N} _.-]+/gu, ' ').trim().replace(/\s+/g, ' ');
  if (clean.length <= 24) return clean;
  const first = clean.split(' ')[0];
  return (first.length >= 2 ? first : clean).slice(0, 24).trim();
}
async function ensureDisplayName(u, b) {
  const meta = u.user_metadata || {};
  if (meta.display_name) return u;
  const name = nameFromGoogle(meta);
  if (validateDisplayName(name).error) return u;
  try { return await b.setDisplayName(name) || u; }
  catch (e) { console.warn('[auth] could not save the display name', e); return { ...u, user_metadata: { ...meta, display_name: name } }; }
}

// After coming back from Google with an error (e.g. the player pressed Cancel),
// the address carries error / error_description. Returns a Romanian message or ''.
export function oauthError() {
  const p = new URLSearchParams(location.search + '&' + location.hash.replace(/^#/, ''));
  const err = p.get('error'), desc = p.get('error_description') || '';
  if (!err) return '';
  history.replaceState(null, '', location.pathname);
  if (err === 'access_denied') return 'Conectarea cu Google a fost anulată.';
  if (/provider is not enabled|unsupported provider/i.test(desc)) return 'Conectarea cu Google nu este activată încă pe server.';
  console.warn('[auth] oauth', err, desc);
  return 'Conectarea cu Google n-a reușit. Încearcă din nou.';
}

async function toUser(u, b) {
  u = await ensureDisplayName(u, b);
  let name = '';
  try {
    const p = await b.getMyProfile();
    name = p && (p.display_name || p.username || p.name) || '';
  } catch { /* profile row may not exist yet */ }
  name = name || (u.user_metadata && u.user_metadata.display_name) || (u.email || '').split('@')[0] || 'Explorator';
  return { id: u.id, name, email: u.email };
}

export const auth = {
  async getCurrentUser() {
    try {
      const b = await backend();
      const u = await b.getCurrentUser();
      return u ? await toUser(u, b) : null;
    } catch (e) { console.warn('[auth] no session', e); return null; }
  },

  async signIn(email, password) {
    const b = await api();
    try { const d = await b.signIn(email.trim(), password); return await toUser(d.user, b); }
    catch (e) { throw new Error(translate(e)); }
  },

  async signUp(name, email, password) {
    const b = await api();
    let d;
    try { d = await b.signUp(email.trim(), password, name, returnUrl()); }
    catch (e) { throw new Error(translate(e)); }
    // With "Confirm email" on, Supabase returns no session until the link is opened.
    // An existing confirmed address also comes back without a session (and no identities).
    if (d.user && Array.isArray(d.user.identities) && d.user.identities.length === 0) {
      throw new Error('Există deja un cont cu acest email. Intră în cont.');
    }
    if (!d.session) return { needsConfirmation: true };
    return { user: await toUser(d.user, b) };
  },

  async signInWithGoogle() {
    const b = await api();
    try { await b.signInWithGoogle(returnUrl()); }
    catch (e) {
      if ((e && e.code === 'provider_disabled') || /provider is not enabled|unsupported provider/i.test(String(e && e.message))) throw new Error('Conectarea cu Google nu este activată încă în Supabase (Authentication → Providers → Google).');
      throw new Error(translate(e));
    }
  },

  async signOut() {
    try { const b = await backend(); await b.signOut(); }
    catch (e) { console.warn('[auth] sign out', e); }
  },

  async requestPasswordReset(email) {
    const b = await api();
    try { await b.requestPasswordReset(email.trim(), returnUrl()); }
    catch (e) { throw new Error(translate(e)); }
  },

  async setNewPassword(password) {
    const b = await api();
    try { await b.updatePassword(password); }
    catch (e) { throw new Error(translate(e)); }
  },

  async onPasswordRecovery(callback) {
    try {
      const b = await backend();
      b.onAuthChange(event => { if (event === 'PASSWORD_RECOVERY') callback(); });
    } catch { /* offline: nothing to listen to */ }
  },
};
