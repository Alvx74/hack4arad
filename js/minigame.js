// Minigame placeholder.
//
// The header button "Minijoc" opens the #minigame screen and calls
// mountMinigame(root, ctx); leaving the screen calls unmountMinigame().
// Build the game inside `root` (a <div> in index.html). `ctx` gives
// read-only info about the player and trail, e.g. to unlock levels per stop.
//
//   ctx = { user: { id, name }, places: [...], completed: ['college', ...] }
//
// Nothing is implemented yet; the placeholder text in index.html stays visible.

export function mountMinigame(root, ctx) {
  void root; void ctx;
}

export function unmountMinigame() {}
