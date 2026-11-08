// Aradul Pixelat: entry point used by js/minigame.js.
//
//   mount(root)  builds the game inside root the first time, resumes it after
//   unmount()    pauses it (stops the loop and the keyboard listeners)
//
// The progress (outfit, visited places, badges) is saved in the browser
// under "aradPixelat_v2", the same key the original game used.
import { start, pause, resume } from './game.js';

const TEMPLATE = `
<div class="ap">
  <div class="ap-top">
    <div><p class="kicker">Joc interactiv</p><h1 class="ap-title">Aradul Pixelat</h1></div>
    <button class="btn sm" id="btnMap" type="button">Hartă <span class="ap-key" aria-hidden="true">M</span></button>
  </div>
  <div class="dash-line ap-hud">
    <span id="hudLoc"><b>Garderoba</b></span>
    <span>Insigne <b id="hudBadge">0/20</b></span>
    <span>Locuri vizitate <b id="hudVis">0/20</b></span>
  </div>
  <div class="ap-screen"><canvas id="cv" width="320" height="180" aria-label="Ecranul jocului"></canvas></div>
  <section class="ap-panel" id="panel" aria-live="polite">
    <div id="pCustom"></div>
    <div id="pMap" hidden></div>
    <div id="pHint" hidden></div>
    <div id="pDialog" hidden>
      <div class="ap-dlg">
        <canvas class="ap-port" id="portrait" width="28" height="30"></canvas>
        <div class="ap-dlg-body">
          <div class="ap-dname" id="dName"></div>
          <p class="ap-dtext" id="dText"></p>
          <div class="ap-dnext"><span id="dCount"></span><span><span class="ap-blink">▶</span> <kbd>E</kbd> sau atinge aici</span></div>
        </div>
      </div>
    </div>
    <div id="pQuiz" hidden></div>
  </section>
  <div class="ap-pad" id="pad">
    <div class="ap-grp">
      <button class="btn" type="button" data-k="left" aria-label="Stânga">◀</button>
      <button class="btn" type="button" data-k="right" aria-label="Dreapta">▶</button>
    </div>
    <div class="ap-grp">
      <button class="btn" type="button" data-k="run" aria-pressed="false">Fugi</button>
      <button class="btn primary" type="button" data-k="act">E</button>
    </div>
  </div>
</div>`;

// The game's two pixel fonts are only downloaded once the game is opened.
const FONTS = 'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600;700&family=VT323&display=swap';
function loadFonts() {
  if (document.querySelector('link[data-ap-fonts]')) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = FONTS; l.dataset.apFonts = '';
  document.head.appendChild(l);
}

let started = false;

export function mount(root) {
  if (!started) {
    loadFonts();
    root.innerHTML = TEMPLATE;
    start(root);
    started = true;
  } else resume();
}

export function unmount() {
  if (started) pause();
}
