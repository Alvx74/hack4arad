// Step-by-step walkthrough. Each step can highlight an element (a "hole" in a
// dark overlay) and shows a card next to it. Steps without a target show the
// card in the middle of the screen.
//
//   startTour([{ title, body, target: () => Element | null }], { onEnd })
//
// Keys: Enter / → next, ← back, Esc skip.

const $ = s => document.querySelector(s);
let steps = [], i = 0, onEnd = null, active = false;

function place() {
  const tour = $('#tour'), hole = $('#tourHole'), card = $('#tourCard');
  const st = steps[i], el = st.target ? st.target() : null;
  const vw = innerWidth, vh = innerHeight, pad = 8, gap = 14;
  card.style.left = card.style.top = '';
  if (!el || !el.getClientRects().length) {
    tour.classList.add('centered');
    hole.hidden = true;
    return;
  }
  tour.classList.remove('centered');
  hole.hidden = false;
  const r = el.getBoundingClientRect();
  const top = Math.max(4, r.top - pad), left = Math.max(4, r.left - pad);
  const bottom = Math.min(vh - 4, r.bottom + pad), right = Math.min(vw - 4, r.right + pad);
  Object.assign(hole.style, { top: top + 'px', left: left + 'px', width: (right - left) + 'px', height: (bottom - top) + 'px' });

  const cw = card.offsetWidth, ch = card.offsetHeight;
  let y;
  if (vh - bottom >= ch + gap) y = bottom + gap;             // below
  else if (top >= ch + gap) y = top - gap - ch;              // above
  else y = Math.max(12, (vh - ch) / 2);                      // big target: overlap, centered
  let x = Math.min(Math.max(12, (left + right) / 2 - cw / 2), vw - cw - 12);
  card.style.left = x + 'px'; card.style.top = y + 'px';
}

function show() {
  const st = steps[i];
  $('#tourStep').textContent = steps.length > 1 ? `${i + 1} / ${steps.length}` : '';
  $('#tourTitle').textContent = st.title;
  $('#tourBody').innerHTML = st.body;
  $('#tourNext').textContent = i === steps.length - 1 ? 'Gata!' : 'Mai departe';
  $('#tourSkip').hidden = i === steps.length - 1;
  const el = st.target ? st.target() : null;
  if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'instant' });
  $('#tour').hidden = false;
  requestAnimationFrame(place);
  $('#tourNext').focus();
}

function end() {
  if (!active) return;
  active = false;
  $('#tour').hidden = true;
  removeEventListener('resize', place);
  removeEventListener('scroll', place, true);
  document.removeEventListener('keydown', keys, true);
  const cb = onEnd; onEnd = null;
  if (cb) cb();
}

function keys(e) {
  if (!active) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); end(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); i--; show(); }
}

export function next() { if (i < steps.length - 1) { i++; show(); } else end(); }
export const skip = end;

export function startTour(list, opts = {}) {
  if (!list.length) return;
  if (active) end();
  steps = list; i = 0; onEnd = opts.onEnd || null; active = true;
  addEventListener('resize', place);
  addEventListener('scroll', place, true);
  document.addEventListener('keydown', keys, true);
  show();
}

export const tourActive = () => active;
