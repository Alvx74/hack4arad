// Loads the Supabase helpers in database/ only when they are needed.
// If the Supabase library or server can't be reached, the rest of the app
// still loads and the sign-in form shows a readable error instead.

let loading = null;

export function backend() {
  if (!loading) {
    loading = Promise.all([
      import('../database/auth.js'),
      import('../database/profiles.js'),
      import('../database/scores.js'),
      import('../database/guide-chat.js'),
    ]).then(([auth, profiles, scores, chat]) => ({ ...auth, ...profiles, ...scores, ...chat }));
    loading.catch(() => { loading = null; });   // allow a retry later
  }
  return loading;
}
