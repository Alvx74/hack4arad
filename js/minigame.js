// Joc interactiv: the "Aradul Pixelat" game (js/game/).
//
// The dashboard tile opens the #minigame screen and calls mountMinigame(root);
// leaving the screen calls unmountMinigame(). The game code is loaded only the
// first time it is opened, so the map part of the site stays light.

let game = null, wanted = false;

export async function mountMinigame(root) {
  wanted = true;
  try {
    game = game || await import('./game/index.js');
  } catch (e) {
    console.error('[minigame]', e);
    root.innerHTML = '<div class="mg-empty"><h2>Jocul nu s-a încărcat</h2><p class="muted">Reîncarcă pagina și încearcă din nou.</p></div>';
    return;
  }
  if (wanted) game.mount(root);   // the player may have left while it was loading
}

export function unmountMinigame() {
  wanted = false;
  if (game) game.unmount();
}
