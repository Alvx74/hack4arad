// Main controller: front page, trail state, GPS, route panel, stop sheet and trivia.
import { DEFAULT_RADIUS, ARRIVED_METERS } from './config.js';
import { loadTrail } from './data.js';
import { auth, validateUsername } from './auth.js';
import { createUserStore } from './store.js';
import { haversine, fmtDist, fmtDur } from './geo.js';
import { fetchRoute, stepText, currentStep } from './routing.js';
import { findPhoto, searchPhotosUrl, fileToDataUrl } from './photos.js';
import { TrailMap } from './map.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ===================== STATE ===================== */
const S = {
  places: [], path: [], byId: new Map(),
  user: null, store: null,
  prog: { discovered: [], completed: [] },
  radius: DEFAULT_RADIUS,
  sim: false, simPos: null, lastGps: null, pos: null, gpsErr: null, watchId: null,
  revisitId: null,          // a completed stop the user chose to walk back to
  sheetId: null, sheetMode: null,
  showAllShadows: false,
  quizzes: {},
  fitOnRoute: false,        // zoom to the new route once it arrives
};
let map = null;

const place = id => S.byId.get(id);
const isDisc = id => S.prog.discovered.includes(id);
const isDone = id => S.prog.completed.includes(id);
// The first stop on the path whose trivia isn't finished yet.
function activeIndex() {
  const i = S.path.findIndex(id => !(isDisc(id) && isDone(id)));
  return i < 0 ? S.path.length : i;
}
const activeId = () => S.path[activeIndex()] || null;
const isVisible = id => { const i = S.path.indexOf(id); return i >= 0 && (S.showAllShadows || i <= activeIndex()); };
const stopNo = id => S.path.indexOf(id) + 1;
const displayName = p => isDisc(p.id) ? p.name : 'Mystery stop ' + stopNo(p.id);
const distTo = p => S.pos ? haversine(S.pos.lat, S.pos.lon, p.lat, p.lon) : null;
const inRadius = p => { const d = distTo(p); return d !== null && d <= S.radius; };
// Directions always point at the current stop, unless the user picked a finished stop to revisit.
const routeTargetId = () => (S.revisitId && isDone(S.revisitId)) ? S.revisitId : activeId();
const saveProg = () => S.store && S.store.saveProgress(S.prog);

/* ===================== FRONT PAGE ===================== */
function showScreen(name) {
  $('#loading').hidden = name !== 'loading';
  $('#welcome').hidden = name !== 'welcome';
  $('#app').hidden = name !== 'app';
  $('#fatal').hidden = name !== 'fatal';
}

function renderWelcome() {
  const known = auth.knownUsers();
  $('#knownWrap').hidden = !known.length;
  $('#knownUsers').innerHTML = known.map(u =>
    `<button type="button" class="btn" data-act="pickuser" data-name="${esc(u.name)}">${esc(u.name)}</button>`).join('');
  $('#stopCount').textContent = S.path.length;
  $('#nameErr').textContent = '';
}

async function signIn(name) {
  try {
    const user = await auth.signIn(name);
    enterApp(user);
  } catch (e) {
    $('#nameErr').textContent = e.message;
  }
}

async function signOut() {
  closeSheet();
  stopGPS();
  await auth.signOut();
  S.user = null; S.store = null;
  renderWelcome(); showScreen('welcome');
  $('#username').value = '';
}

function enterApp(user) {
  S.user = user;
  S.store = createUserStore(user.id);
  S.prog = S.store.loadProgress();
  S.prog.discovered = S.prog.discovered.filter(id => S.byId.has(id));
  S.prog.completed = S.prog.completed.filter(id => S.byId.has(id));
  S.quizzes = {}; S.revisitId = null; S.sheetId = null;
  clearRoute(); listSig = '';
  $('#userName').textContent = user.name;
  showScreen('app');
  if (!map) initMap(); else { map.clearStops(); map.refresh(); }
  updateAll();
  fitTrail();
  startGPS();
}

/* ===================== MAP ===================== */
function initMap() {
  if (!window.L) {
    $('#mapMsg').hidden = false;
    $('#mapMsg').textContent = 'The map library could not be loaded. Reload the page.';
    return;
  }
  map = new TrailMap($('#map'), {
    onMapClick: ll => { if (S.sim) { S.simPos = ll; setSim(true); } },
    onMarkerClick: id => openSheet(id),
    onTileError: () => { $('#mapMsg').hidden = false; $('#mapMsg').textContent = 'Some map tiles failed to load. Check your connection.'; },
  });
}

function syncMap() {
  if (!map) return;
  map.setStops(S.path.filter(isVisible).map(id => {
    const p = place(id);
    if (!isDisc(id)) return { id, lat: p.lat, lon: p.lon, kind: 'shadow', no: stopNo(id), label: '', title: 'Undiscovered location' };
    return { id, lat: p.lat, lon: p.lon, kind: inRadius(p) ? 'on' : 'off', no: stopNo(id), label: p.short, title: p.name };
  }));
  map.setUser(S.pos, S.radius);
}

function fitTrail() {
  if (!map) return;
  const t = routeTargetId();
  const pts = t ? [[place(t).lat, place(t).lon]] : S.path.filter(isVisible).map(id => [place(id).lat, place(id).lon]);
  if (S.pos && t && haversine(S.pos.lat, S.pos.lon, pts[0][0], pts[0][1]) < 3000) pts.push([S.pos.lat, S.pos.lon]);
  map.fitPoints(pts);
}

function fitRoute() {
  if (!map) return;
  const r = routeState.data;
  if (r && r.coords.length) map.fitPoints(r.coords);
  else fitTrail();
}

/* ===================== GPS ===================== */
function startGPS() {
  if (!('geolocation' in navigator)) { S.gpsErr = 'This browser has no GPS support. Use the simulator under Testing tools.'; updateAll(); return; }
  stopGPS();
  S.gpsErr = null;
  try {
    S.watchId = navigator.geolocation.watchPosition(onGPS, onGPSErr, { enableHighAccuracy: true, maximumAge: 2000, timeout: 30000 });
  } catch { S.gpsErr = 'Could not start GPS here. Use the simulator under Testing tools.'; }
  updateAll();
}
function stopGPS() {
  if (S.watchId !== null) { try { navigator.geolocation.clearWatch(S.watchId); } catch { /* ignore */ } }
  S.watchId = null;
}
function onGPS(p) {
  S.gpsErr = null;
  S.lastGps = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy || 0 };
  if (!S.sim) S.pos = S.lastGps;
  updateAll();
}
function onGPSErr(err) {
  S.gpsErr = err.code === 1 ? 'Location permission denied. Allow location access for this page, or use the simulator.'
    : err.code === 2 ? 'Position unavailable. Retrying…' : 'GPS timed out. Still trying…';
  updateAll();
}
function setSim(on) {
  S.sim = on; $('#sim').checked = on;
  if (on) {
    if (!S.simPos) S.simPos = { lat: 46.1765, lon: 21.3216 };
    S.pos = { lat: S.simPos.lat, lon: S.simPos.lon, acc: 0 };
  } else S.pos = S.lastGps;
  updateAll();
}

/* ===================== TRAIL LOGIC ===================== */
function checkDiscovery() {
  const id = activeId(); if (!id || isDisc(id)) return;
  const p = place(id);
  if (!inRadius(p)) return;
  S.prog.discovered.push(id); saveProg();
  toast('Discovered: ' + p.name + '!');
  // A stop without trivia has nothing to answer, so it counts as done right away.
  if (!p.trivia.length) completeStop(id);
}

// Called once per stop, when its trivia has been answered for the first time.
function completeStop(id) {
  if (isDone(id)) return;
  S.prog.completed.push(id); saveProg();
  S.revisitId = null;
  clearRoute();
  const next = activeId();
  if (next) {
    toast('Stop ' + stopNo(id) + ' complete. Directions to stop ' + stopNo(next) + ' are on the map.');
    S.fitOnRoute = true;
  } else toast('Trail complete! 🎉');
}

/* ===================== ROUTING ===================== */
const routeState = { targetId: null, from: null, t: 0, status: 'idle', data: null };
let routeSeq = 0;

function clearRoute(why) {
  routeSeq++;
  Object.assign(routeState, { targetId: null, from: null, data: null, status: why === 'arrived' ? 'arrived' : 'idle' });
}

function maybeReroute() {
  const id = routeTargetId();
  if (!$('#showRoute').checked || !S.pos || !id) { if (routeState.status !== 'idle') clearRoute(); return; }
  const p = place(id);
  if (haversine(S.pos.lat, S.pos.lon, p.lat, p.lon) < ARRIVED_METERS) { if (routeState.status !== 'arrived') clearRoute('arrived'); return; }
  const changed = routeState.targetId !== id || routeState.status === 'arrived' || routeState.status === 'idle';
  const moved = routeState.from ? haversine(S.pos.lat, S.pos.lon, routeState.from.lat, routeState.from.lon) : Infinity;
  const age = Date.now() - routeState.t;
  const retry = routeState.status === 'error' && age > 20000;
  const drifted = routeState.status !== 'loading' && moved > 40 && age > 8000;
  if (!changed && !retry && !drifted) return;
  const my = ++routeSeq;
  routeState.targetId = id; routeState.from = { lat: S.pos.lat, lon: S.pos.lon }; routeState.t = Date.now();
  if (changed) routeState.data = null;
  routeState.status = 'loading';
  fetchRoute(routeState.from, p).then(res => {
    if (my !== routeSeq) return;
    routeState.t = Date.now();
    routeState.data = res; routeState.status = res ? 'ok' : 'error';
    renderRoute();
    if (S.fitOnRoute) { S.fitOnRoute = false; fitRoute(); }
  });
  renderRoute();
}

function renderRoute() {
  const id = routeTargetId(), empty = $('#routeEmpty'), body = $('#routeBody');
  const setLine = pts => map && map.setRoute(pts);
  $('#followBtn').hidden = !(S.revisitId && isDone(S.revisitId));
  const msg = t => { empty.hidden = false; body.hidden = true; empty.textContent = t; setLine([]); };
  if (!id) return msg('The trail is complete. Pick a finished stop in the list to walk back to it.');
  if (!$('#showRoute').checked) return msg('Route hidden.');
  if (!S.pos) return msg('Waiting for your location to plan a route…');

  const p = place(id), d = haversine(S.pos.lat, S.pos.lon, p.lat, p.lon);
  empty.hidden = true; body.hidden = false;
  $('#rTitle').textContent = (id === S.revisitId ? 'Revisiting ' : 'Stop ' + stopNo(id) + ': ') + displayName(p);
  if (routeState.status === 'arrived' || d < ARRIVED_METERS) {
    $('#rSummary').textContent = 'You’re here';
    $('#rNext').textContent = isDisc(id) ? 'Open the stop to read about it and answer the trivia.' : 'Keep going: you should be inside the radius any moment.';
    $('#rNote').textContent = ''; $('#rSteps').innerHTML = ''; setLine([]); return;
  }
  const r = routeState.data;
  if (routeState.status === 'ok' && r && routeState.targetId === id) {
    setLine(r.coords);
    $('#rSummary').textContent = fmtDist(r.dist) + ' · ' + fmtDur(r.dur);
    const ci = currentStep(r.steps, S.pos), nxt = ci >= 0 ? r.steps[Math.min(ci + 1, r.steps.length - 1)] : null;
    $('#rNext').textContent = nxt ? (ci + 1 < r.steps.length ? 'Next: ' : 'Then: ') + stepText(nxt) : 'Follow the highlighted route.';
    $('#rNote').textContent = r.label + ' along streets. It updates if you leave the path.';
    $('#rSteps').innerHTML = r.steps.map((s, i) => `<li class="${i === ci ? 'cur' : ''}">${esc(stepText(s))}${s.distance ? ' · ' + fmtDist(s.distance) : ''}</li>`).join('');
  } else if (routeState.status === 'loading') {
    setLine([[S.pos.lat, S.pos.lon], [p.lat, p.lon]]);
    $('#rSummary').textContent = 'Finding a route…';
    $('#rNext').textContent = 'Straight-line distance: ' + fmtDist(d);
    $('#rNote').textContent = ''; $('#rSteps').innerHTML = '';
  } else {
    setLine([[S.pos.lat, S.pos.lon], [p.lat, p.lon]]);
    $('#rSummary').textContent = fmtDist(d) + ' straight line';
    $('#rNext').textContent = 'Street directions are unavailable right now.';
    $('#rNote').textContent = 'The routing service could not be reached, so a straight line is shown. It will retry automatically.';
    $('#rSteps').innerHTML = '';
  }
}

/* ===================== PROGRESS / STATUS / LIST ===================== */
function renderProgress() {
  const a = activeIndex(), n = S.path.length;
  $('#progTitle').textContent = a >= n ? 'Trail complete' : 'Stop ' + (a + 1) + ' of ' + n;
  $('#progDots').innerHTML = S.path.map((id, i) =>
    `<span class="pdot ${isDisc(id) && isDone(id) ? 'done' : i === a ? 'cur' : ''}"></span>`).join('');
  let t;
  if (a >= n) t = 'You visited every stop on the trail. 🎉';
  else {
    const p = place(S.path[a]);
    t = isDisc(p.id)
      ? 'Answer the trivia at ' + p.name + (a + 1 < n ? ' to unlock the next stop.' : ' to complete the trail.')
      : 'Follow the route to the shadow and get within ' + S.radius + ' m to reveal it.';
  }
  $('#progText').textContent = t;
}

function renderStatus() {
  const dot = $('#gpsDot'), t = $('#gpsTitle'), s = $('#gpsSub');
  if (S.sim) { dot.className = 'dot wait'; t.textContent = 'Simulated position (test mode)'; }
  else if (S.lastGps) { dot.className = 'dot ok'; t.textContent = 'GPS live' + (S.lastGps.acc ? ' · accuracy ±' + Math.round(S.lastGps.acc) + ' m' : ''); }
  else if (S.gpsErr) { dot.className = 'dot err'; t.textContent = 'No GPS fix'; }
  else { dot.className = 'dot wait'; t.textContent = 'Waiting for GPS…'; }
  let sub = S.pos ? S.pos.lat.toFixed(5) + ', ' + S.pos.lon.toFixed(5) : '';
  if (S.gpsErr && !S.sim) sub = S.gpsErr + (sub ? ' · ' + sub : '');
  s.textContent = sub;
}

// Navigation control for a stop: the current stop is always the target,
// finished stops can be revisited, future stops can't be navigated to.
function navControl(id, inSheet) {
  if (id === routeTargetId() && !isDone(id)) {
    return `<button class="btn ${inSheet ? 'primary' : ''}" data-act="showroute">Show route</button>`;
  }
  if (!isDone(id)) return '';
  if (S.revisitId === id) return `<button class="btn" data-act="follow">Back to the trail</button>`;
  return `<button class="btn" data-act="revisit" data-id="${id}">Navigate here</button>`;
}

let listSig = '';
function renderList() {
  const ids = S.path.filter(isVisible), act = activeId();
  const sig = ids.map(id => id + (isDisc(id) ? 1 : 0) + (isDone(id) ? 1 : 0)).join('|') + '#' + S.revisitId + '#' + act;
  if (sig !== listSig) {
    listSig = sig;
    $('#placeList').innerHTML = ids.map(id => {
      const p = place(id), disc = isDisc(id);
      const tag = isDone(id) ? '<span class="tag done">Done</span>' : id === act ? '<span class="tag cur">Current</span>' : '<span class="tag">Locked</span>';
      return `<li class="place ${disc ? '' : 'shadow'}" id="pl-${id}">
        <div class="num">${disc ? stopNo(id) : '?'}</div>
        <div class="pinfo"><strong>${esc(displayName(p))}</strong> ${tag}<div class="muted">${disc ? esc(p.kind) : 'Undiscovered'}</div><div class="status" id="st-${id}"></div></div>
        <div class="pbtns">
          <button class="btn primary" data-act="open" data-id="${id}" id="op-${id}">${disc ? 'Open' : 'Inspect'}</button>
          ${navControl(id, false)}
        </div></li>`;
    }).join('');
  }
  ids.forEach(id => {
    const p = place(id), d = distTo(p), disc = isDisc(id), inr = d !== null && d <= S.radius;
    const li = document.getElementById('pl-' + id); if (!li) return;
    li.classList.toggle('on', disc && inr);
    document.getElementById('st-' + id).textContent = d === null ? 'Waiting for your location…'
      : disc ? (inr ? 'In range · ' + fmtDist(d) + ' away' : 'Locked · ' + fmtDist(d) + ' away (need ≤ ' + S.radius + ' m)')
        : fmtDist(d) + ' away · get within ' + S.radius + ' m to reveal';
    const op = document.getElementById('op-' + id); if (op) op.disabled = disc ? !inr : false;
  });
}

function buildTeleportButtons() {
  $('#tpBtns').innerHTML = S.path.map(id => `<button class="btn sm" data-act="tp" data-id="${id}">At ${esc(place(id).short)}</button>`).join('');
}

/* ===================== STOP SHEET ===================== */
const modeFor = p => !isDisc(p.id) ? 'shadow' : inRadius(p) ? 'full' : 'locked';

function openSheet(id) {
  if (!isVisible(id)) return;
  S.sheetId = id; renderSheet(); $('#sheet').hidden = false;
  const c = $('#sheetBody [data-act="close"]'); if (c) c.focus();
}
function closeSheet() {
  if (S.sheetId) delete S.quizzes[S.sheetId];
  S.sheetId = null; S.sheetMode = null; $('#sheet').hidden = true;
}

function renderSheet() {
  const p = place(S.sheetId); if (!p) { closeSheet(); return; }
  const mode = modeFor(p); S.sheetMode = mode;
  const nav = navControl(p.id, true);
  const close = '<button class="btn" data-act="close" aria-label="Close">✕</button>';
  let h;
  if (mode === 'shadow') {
    h = `<div class="sheet-head"><div><div class="kicker">Undiscovered</div><h2>Mystery stop ${stopNo(p.id)}</h2><div class="muted">${esc(p.hint)}</div></div>${close}</div>
      <div class="chips"><span class="chip" id="sheetDist"></span><span class="chip lock">Hidden</span></div>
      <div class="lockmsg"><strong>Get closer to reveal it.</strong><p>Walk to within ${S.radius} m of the shadow to discover what it is.</p></div><div class="sheet-nav" id="sheetNav">${nav}</div>`;
  } else {
    h = `<div class="sheet-head"><div><div class="kicker">${esc(p.kind)}</div><h2>${esc(p.name)}</h2><div class="muted">${esc(p.address)}</div></div>${close}</div>
      <div class="chips"><span class="chip" id="sheetDist"></span><span class="chip ${mode === 'full' ? 'ok' : 'lock'}">${mode === 'full' ? 'Unlocked' : 'Locked'}</span>${p.category ? `<span class="chip">${esc(p.category)}</span>` : ''}</div>`;
    if (mode === 'locked') {
      h += `<div class="lockmsg"><strong>Out of range.</strong><p>Photos, commentary and trivia are only available within ${S.radius} m of this place.</p></div><div class="sheet-nav" id="sheetNav">${nav}</div>`;
    } else {
      h += `<figure class="photo" id="photoBox"><div class="photo-loading">Loading photo…</div></figure><div class="pcap" id="photoCap"></div>`
        + p.text.map(t => `<p>${esc(t)}</p>`).join('')
        + `<div class="quiz" id="quiz"></div><div class="sheet-nav" id="sheetNav">${nav}</div>`;
    }
  }
  $('#sheetBody').innerHTML = h;
  updateSheetDist();
  if (mode === 'full') { renderPhoto(); renderQuiz(); }
}

function updateSheetDist() {
  const el = $('#sheetDist'); if (!el || !S.sheetId) return;
  const d = distTo(place(S.sheetId)); el.textContent = d === null ? 'Distance unknown' : fmtDist(d) + ' away';
}

function syncSheet() {
  if (!S.sheetId) return;
  if (!isVisible(S.sheetId)) { closeSheet(); return; }
  const mode = modeFor(place(S.sheetId));
  if (S.sheetMode === 'full' && mode !== 'full') { closeSheet(); toast('You left the ' + S.radius + ' m zone, so this place is locked again.'); }
  else if (mode !== S.sheetMode) renderSheet();
  else {
    updateSheetDist();
    const nav = $('#sheetNav'), html = navControl(S.sheetId, true);
    if (nav && nav.dataset.sig !== html) { nav.innerHTML = html; nav.dataset.sig = html; }
  }
}

/* ===================== PHOTOS ===================== */
let photoSeq = 0;
async function renderPhoto() {
  const p = place(S.sheetId); if (!p) return;
  const my = ++photoSeq;
  const own = S.store.getPhoto(p.id);
  const ph = await findPhoto(p, own);
  if (my !== photoSeq || S.sheetId !== p.id || S.sheetMode !== 'full') return;
  const box = $('#photoBox'), cap = $('#photoCap'); if (!box) return;
  if (ph) {
    box.innerHTML = `<img src="${esc(ph.src)}" alt="Photo of ${esc(p.name)}">`;
  } else {
    box.innerHTML = `<div class="photo-empty"><strong>No photo yet</strong>
      <a href="${esc(searchPhotosUrl(p))}" target="_blank" rel="noopener">Search photos of this place ↗</a></div>`;
  }
  const credit = ph ? (ph.link ? `<a href="${esc(ph.link)}" target="_blank" rel="noopener">${esc(ph.credit)}</a>` : esc(ph.credit)) : 'Add your own photo of this place';
  cap.innerHTML = `<span>${credit}</span>
    <span class="row" style="gap:6px"><label class="btn sm">${own ? 'Replace photo' : 'Add photo'}<input type="file" accept="image/*" hidden id="photoIn"></label>${own ? '<button class="btn sm" data-act="rmphoto">Remove</button>' : ''}</span>`;
}

async function handlePhotoFile(file) {
  const p = place(S.sheetId); if (!p || !file) return;
  try {
    const url = await fileToDataUrl(file);
    if (!S.store.setPhoto(p.id, url)) toast('Browser storage is full, so the photo was not saved.');
    if (S.sheetId === p.id && S.sheetMode === 'full') renderPhoto();
  } catch { toast('That file could not be read as an image.'); }
}

/* ===================== TRIVIA ===================== */
function renderQuiz() {
  const p = place(S.sheetId), box = $('#quiz'); if (!box) return;
  const q = S.quizzes[p.id], n = p.trivia.length, best = S.store.getBest(p.id);
  if (!n) { box.innerHTML = '<h3>Trivia</h3><p class="muted">No questions for this stop yet.</p>'; return; }
  const bestTxt = best !== undefined ? `<div class="muted" style="margin-bottom:8px">Best score here: ${best}/${n}</div>` : '';
  if (!q) {
    const lead = isDone(p.id) ? 'You already finished this stop. Play again for a better score.'
      : `${n} questions about this place. Answer them all to unlock the next stop.`;
    box.innerHTML = `<h3>Trivia</h3><p class="muted">${lead}</p>${bestTxt}<button class="btn primary" data-act="start">Start trivia</button>`;
    return;
  }
  if (q.done) {
    const msg = q.score === n ? 'Perfect score!' : q.score >= Math.ceil(n / 2) ? 'Nicely done.' : 'Look around and try again.';
    const next = activeId();
    let after = '';
    if (q.unlocked && next) {
      after = `<div class="next">Next up: stop ${stopNo(next)}, ${esc(displayName(place(next)))}. Your route has been updated.</div>
        <button class="btn primary" data-act="showroute">Show me the way</button> `;
    } else if (q.unlocked) after = '<div class="next">You finished the whole trail. 🎉</div>';
    box.innerHTML = `<h3>Trivia complete</h3><p class="big">${q.score}/${n}</p><p>${msg}</p>${bestTxt}${after}<button class="btn" data-act="again">Play again</button>`;
    return;
  }
  const t = p.trivia[q.i];
  box.innerHTML = `<h3>Trivia · Question ${q.i + 1} of ${n}</h3><p class="qtext">${esc(t.q)}</p>
    <div class="opts">${t.o.map((o, i) => {
      let cls = 'opt';
      if (q.chosen !== null) { if (i === t.a) cls += ' right'; else if (i === q.chosen) cls += ' wrong'; }
      return `<button class="${cls}" data-act="opt" data-i="${i}" ${q.chosen !== null ? 'disabled' : ''}>${esc(o)}</button>`;
    }).join('')}</div>`
    + (q.chosen !== null ? `<p><strong>${q.chosen === t.a ? 'Correct!' : 'Not quite.'}</strong> ${esc(t.e)}</p>
      <button class="btn primary" data-act="next">${q.i < n - 1 ? 'Next question' : 'See result'}</button>` : '');
}

function quizAct(act, el) {
  const p = place(S.sheetId); if (!p || S.sheetMode !== 'full') return;
  const n = p.trivia.length;
  if (act === 'start' || act === 'again') { S.quizzes[p.id] = { i: 0, score: 0, chosen: null, done: false }; renderQuiz(); return; }
  const q = S.quizzes[p.id]; if (!q) return;
  if (act === 'opt' && q.chosen === null) {
    q.chosen = parseInt(el.dataset.i, 10);
    if (q.chosen === p.trivia[q.i].a) q.score++;
  } else if (act === 'next' && q.chosen !== null) {
    if (q.i < n - 1) { q.i++; q.chosen = null; }
    else {
      q.done = true;
      const best = S.store.getBest(p.id);
      if (best === undefined || q.score > best) S.store.setBest(p.id, q.score);
      if (!isDone(p.id)) {
        q.unlocked = true;
        completeStop(p.id);   // the only place the trail advances
        updateAll(); renderQuiz(); return;
      }
    }
  }
  renderQuiz();
}

/* ===================== MISC ===================== */
let toastT = 0;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 4200);
}

function updateAll() {
  if (!S.user) return;
  checkDiscovery();
  renderProgress(); renderStatus(); renderList(); syncMap(); renderRoute(); syncSheet();
  maybeReroute();
}

function resetProgress() {
  S.prog = { discovered: [], completed: [] }; saveProg();
  S.store.clearBests(S.path);
  S.quizzes = {}; S.revisitId = null;
  closeSheet(); clearRoute(); listSig = '';
  if (map) map.clearStops();
  updateAll(); fitTrail(); toast('Progress reset. Heading back to stop 1.');
}

/* ===================== EVENTS ===================== */
function bindEvents() {
  $('#nameForm').addEventListener('submit', e => { e.preventDefault(); signIn($('#username').value); });
  $('#username').addEventListener('input', e => {
    const v = e.target.value.trim() ? validateUsername(e.target.value) : {};
    $('#nameErr').textContent = v.error || '';
  });

  document.addEventListener('click', e => {
    if (e.target === $('#sheet')) { closeSheet(); return; }
    const el = e.target.closest ? e.target.closest('[data-act]') : null; if (!el) return;
    const act = el.dataset.act, id = el.dataset.id;
    switch (act) {
      case 'pickuser': signIn(el.dataset.name); break;
      case 'signout': signOut(); break;
      case 'open': if (isVisible(id)) openSheet(id); break;
      case 'revisit': if (isDone(id)) { S.revisitId = id; S.fitOnRoute = true; listSig = ''; if (S.sheetId) renderSheet(); updateAll(); } break;
      case 'follow': S.revisitId = null; S.fitOnRoute = true; listSig = ''; if (S.sheetId) renderSheet(); updateAll(); break;
      case 'showroute': closeSheet(); fitRoute(); $('#routeCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); break;
      case 'close': closeSheet(); break;
      case 'start': case 'again': case 'opt': case 'next': quizAct(act, el); break;
      case 'rmphoto': { const p = place(S.sheetId); if (p) { S.store.removePhoto(p.id); renderPhoto(); } break; }
      case 'tp': { const p = place(id); if (p) { S.simPos = { lat: p.lat, lon: p.lon }; setSim(true); map && map.center(S.pos); } break; }
      case 'rreset': $('#radius').value = DEFAULT_RADIUS; S.radius = DEFAULT_RADIUS; $('#radiusVal').textContent = S.radius + ' m'; updateAll(); break;
      case 'resetprog': resetProgress(); break;
      case 'enable': startGPS(); break;
      case 'zin': map && map.zoomIn(); break;
      case 'zout': map && map.zoomOut(); break;
      case 'fit': fitTrail(); break;
      case 'locate': if (S.pos) map && map.center(S.pos); else toast('No position yet.'); break;
    }
  });

  document.addEventListener('change', e => {
    const id = e.target.id;
    if (id === 'photoIn') handlePhotoFile(e.target.files && e.target.files[0]);
    else if (id === 'sim') setSim(e.target.checked);
    else if (id === 'showRoute') { if (!e.target.checked) clearRoute(); updateAll(); }
    else if (id === 'allShadows') { S.showAllShadows = e.target.checked; listSig = ''; updateAll(); }
  });
  $('#radius').addEventListener('input', e => {
    S.radius = parseInt(e.target.value, 10); $('#radiusVal').textContent = S.radius + ' m'; updateAll();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.sheetId) closeSheet(); });
}

/* ===================== BOOT ===================== */
async function boot() {
  bindEvents();
  showScreen('loading');
  try {
    const trail = await loadTrail();
    S.places = trail.places; S.path = trail.path;
    S.byId = new Map(trail.places.map(p => [p.id, p]));
  } catch (e) {
    const local = location.protocol === 'file:';
    $('#fatalMsg').textContent = local
      ? 'The location database can’t be read when the page is opened straight from disk. Start a local web server in the project folder (for example: python3 -m http.server 8000) and open http://localhost:8000.'
      : 'The location database could not be loaded: ' + e.message;
    showScreen('fatal');
    return;
  }
  buildTeleportButtons();
  const user = await auth.getCurrentUser();
  if (user) enterApp(user);
  else { renderWelcome(); showScreen('welcome'); }
}

boot();
