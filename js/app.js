// Main controller: front page, trail state, GPS, route panel, stop sheet and trivia.
// All visitor-facing text is Romanian; the dev panel (?dev=1) stays in English.
import { DEFAULT_RADIUS, ARRIVED_METERS } from './config.js';
import { loadTrail } from './data.js';
import { auth, validateDisplayName, validateEmail, validatePassword, MIN_PASSWORD } from './auth.js';
import { createUserStore } from './store.js';
import { haversine, fmtDist, fmtDur, nearestOnLine, lineLength } from './geo.js';
import { fetchRoute, stepText, currentStep } from './routing.js';
import { findPhoto, searchPhotosUrl, fileToDataUrl } from './photos.js';
import { TrailMap } from './map.js';
import { mountMinigame, unmountMinigame } from './minigame.js';

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
const displayName = p => isDisc(p.id) ? p.name : 'Oprirea misterioasă ' + stopNo(p.id);
const distTo = p => S.pos ? haversine(S.pos.lat, S.pos.lon, p.lat, p.lon) : null;
const inRadius = p => { const d = distTo(p); return d !== null && d <= S.radius; };
// Directions always point at the current stop, unless the user picked a finished stop to revisit.
const routeTargetId = () => (S.revisitId && isDone(S.revisitId)) ? S.revisitId : activeId();
const saveProg = () => S.store && S.store.saveProgress(S.prog);

/* ===================== SCREENS / ACCOUNT ===================== */
let screen = 'loading';
function showScreen(name) {
  if (screen === 'minigame' && name !== 'minigame') unmountMinigame();
  screen = name;
  ['loading', 'welcome', 'app', 'minigame', 'fatal'].forEach(s => { $('#' + s).hidden = s !== name; });
  $('#hdrRight').hidden = name !== 'app' && name !== 'minigame';
  $('#minigameBtn').classList.toggle('active', name === 'minigame');
  closeMenu();
  window.scrollTo(0, 0);
}

/* ---------- account form (front page) ---------- */
// Modes: login | signup | forgot (send reset email) | recovery (set new password)
let authMode = 'login', authBusy = false;
const RECOVERY_IN_URL = /type=recovery/.test(location.hash);

function setAuthMode(mode, { keepMsg = false } = {}) {
  authMode = mode;
  const tabs = mode === 'login' || mode === 'signup';
  $('#authTabs').hidden = !tabs;
  $('#tabLogin').classList.toggle('on', mode === 'login');
  $('#tabSignup').classList.toggle('on', mode === 'signup');
  $('#tabLogin').setAttribute('aria-selected', String(mode === 'login'));
  $('#tabSignup').setAttribute('aria-selected', String(mode === 'signup'));
  const title = { forgot: 'Ai uitat parola?', recovery: 'Alege o parolă nouă' }[mode] || '';
  const lead = {
    forgot: 'Scrie emailul contului și îți trimitem un link pentru a seta o parolă nouă.',
    recovery: `Parola trebuie să aibă cel puțin ${MIN_PASSWORD} caractere.`,
  }[mode] || '';
  $('#authTitle').hidden = !title; $('#authTitle').textContent = title;
  $('#authLead').hidden = !lead; $('#authLead').textContent = lead;
  $('#fName').hidden = mode !== 'signup';
  $('#fEmail').hidden = mode === 'recovery';
  $('#fPass').hidden = mode === 'forgot';
  $('#passLabel').textContent = mode === 'recovery' ? 'Parola nouă' : 'Parolă';
  $('#authPass').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  $('#authSubmit').textContent = { login: 'Intră în cont', signup: 'Creează contul', forgot: 'Trimite linkul', recovery: 'Salvează parola' }[mode];
  $('#forgotLink').hidden = mode !== 'login';
  $('#backLink').hidden = mode !== 'forgot';
  if (!keepMsg) { authMsg(''); authOk(''); }
}
const authMsg = t => { $('#authErr').textContent = t; };
const authOk = t => { $('#authOk').hidden = !t; $('#authOk').textContent = t; };
function setBusy(on, label) {
  authBusy = on;
  const b = $('#authSubmit');
  b.classList.toggle('busy', on);
  if (on) { b.dataset.label = b.textContent; b.textContent = label; }
  else if (b.dataset.label) b.textContent = b.dataset.label;
}

function renderWelcome() {
  $('#stopCount').textContent = S.path.length;
  setAuthMode(authMode === 'recovery' ? 'recovery' : 'login');
}

async function submitAuth() {
  if (authBusy) return;
  authMsg(''); authOk('');
  const name = $('#authName').value, email = $('#authEmail').value, pass = $('#authPass').value;
  const fail = (msg, field) => { authMsg(msg); if (field) $(field).focus(); };
  try {
    if (authMode === 'login') {
      const e = validateEmail(email); if (e.error) return fail(e.error, '#authEmail');
      if (!pass) return fail('Scrie parola.', '#authPass');
      setBusy(true, 'Se verifică…');
      const user = await auth.signIn(e.email, pass);
      setBusy(false); $('#authPass').value = '';
      enterApp(user);
    } else if (authMode === 'signup') {
      const n = validateDisplayName(name); if (n.error) return fail(n.error, '#authName');
      const e = validateEmail(email); if (e.error) return fail(e.error, '#authEmail');
      const pw = validatePassword(pass); if (pw.error) return fail(pw.error, '#authPass');
      setBusy(true, 'Se creează contul…');
      const res = await auth.signUp(n.name, e.email, pass);
      setBusy(false); $('#authPass').value = '';
      if (res.needsConfirmation) {
        setAuthMode('login', { keepMsg: true });
        authOk(`Contul e creat. Ți-am trimis un email la ${e.email}: deschide linkul din el ca să-ți confirmi adresa, apoi intră în cont.`);
      } else enterApp(res.user);
    } else if (authMode === 'forgot') {
      const e = validateEmail(email); if (e.error) return fail(e.error, '#authEmail');
      setBusy(true, 'Se trimite…');
      await auth.requestPasswordReset(e.email);
      setBusy(false);
      setAuthMode('login', { keepMsg: true });
      authOk(`Dacă există un cont pentru ${e.email}, ți-am trimis un link pentru parola nouă. Verifică și dosarul Spam.`);
    } else if (authMode === 'recovery') {
      const pw = validatePassword(pass); if (pw.error) return fail(pw.error, '#authPass');
      setBusy(true, 'Se salvează…');
      await auth.setNewPassword(pass);
      setBusy(false); $('#authPass').value = '';
      history.replaceState(null, '', location.pathname);
      const user = await auth.getCurrentUser();
      if (user) { enterApp(user); toast('Parola a fost schimbată.'); }
      else { setAuthMode('login', { keepMsg: true }); authOk('Parola a fost schimbată. Intră în cont cu parola nouă.'); }
    }
  } catch (err) {
    setBusy(false);
    authMsg(err.message || 'Ceva n-a mers. Încearcă din nou.');
  }
}

async function signOut() {
  closeSheet();
  stopGPS();
  await auth.signOut();
  S.user = null; S.store = null;
  $('#authPass').value = '';
  renderWelcome(); showScreen('welcome');
}

function toggleMenu(force) {
  const m = $('#accountMenu'), open = force !== undefined ? force : m.hidden;
  m.hidden = !open; $('#accountBtn').setAttribute('aria-expanded', String(open));
}
const closeMenu = () => toggleMenu(false);

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
  syncFromAccount(user);
}

// Brings the account's saved scores onto this device. On a device that has
// no progress yet for this account, stops with a saved score count as done,
// so the player continues where they left off. Later, this device's own
// trail state wins (so "Ia traseul de la capăt" works), but best scores still merge.
async function syncFromAccount(user) {
  const store = S.store, fresh = !store.hasLocalProgress();
  const remote = await store.loadRemoteScores();
  if (!remote || S.user !== user) return;
  let changed = false;
  for (const [id, score] of Object.entries(remote)) {
    if (!S.byId.has(id)) continue;
    const local = store.getBest(id);
    if (local === undefined || score > local) store.setBest(id, score);
    if (fresh && !isDone(id)) { S.prog.discovered.includes(id) || S.prog.discovered.push(id); S.prog.completed.push(id); changed = true; }
  }
  if (changed) {
    saveProg(); listSig = ''; clearRoute();
    updateAll(); fitTrail();
    toast('Ți-am adus progresul salvat în cont.');
  }
}

/* ===================== MAP ===================== */
function initMap() {
  if (!window.L) {
    $('#mapMsg').hidden = false;
    $('#mapMsg').textContent = 'Harta nu a putut fi încărcată. Reîncarcă pagina.';
    return;
  }
  map = new TrailMap($('#map'), {
    onMapClick: ll => { if (S.sim) { S.simPos = ll; setSim(true); } },
    onMarkerClick: id => openSheet(id),
    onTileError: () => { $('#mapMsg').hidden = false; $('#mapMsg').textContent = 'O parte din hartă nu s-a încărcat. Verifică conexiunea la internet.'; },
  });
}

function syncMap() {
  if (!map) return;
  map.setStops(S.path.filter(isVisible).map(id => {
    const p = place(id);
    if (!isDisc(id)) return { id, lat: p.lat, lon: p.lon, kind: 'shadow', no: stopNo(id), label: '', title: 'Loc nedescoperit' };
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
  if (r && r.track.length) map.fitPoints(r.track);
  else fitTrail();
}

/* ===================== GPS ===================== */
function startGPS() {
  if (!('geolocation' in navigator)) { S.gpsErr = 'Browserul tău nu oferă acces la locație.'; updateAll(); return; }
  stopGPS();
  S.gpsErr = null;
  try {
    S.watchId = navigator.geolocation.watchPosition(onGPS, onGPSErr, { enableHighAccuracy: true, maximumAge: 2000, timeout: 30000 });
  } catch { S.gpsErr = 'Locația nu a putut fi pornită în acest browser.'; }
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
  S.gpsErr = err.code === 1
    ? 'Accesul la locație este blocat. Permite-l din setările browserului pentru această pagină, apoi apasă „Activează”.'
    : err.code === 2 ? 'Locația nu este disponibilă momentan. Încercăm din nou…' : 'Semnalul GPS întârzie. Încercăm în continuare…';
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
  toast('Ai descoperit: ' + p.name + '!');
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
    toast('Oprirea ' + stopNo(id) + ' e gata. Drumul spre oprirea ' + stopNo(next) + ' e pe hartă.');
    S.fitOnRoute = true;
  } else toast('Ai terminat traseul. Felicitări!');
}

/* ===================== ROUTING ===================== */
const routeState = { targetId: null, from: null, t: 0, status: 'idle', data: null };
let routeSeq = 0;

function clearRoute(why) {
  routeSeq++;
  Object.assign(routeState, { targetId: null, from: null, data: null, status: why === 'arrived' ? 'arrived' : 'idle' });
}

// How far from the planned path the walker may stray before we plan a new one.
// Grows with poor GPS accuracy so jitter doesn't trigger constant re-planning.
const offRouteLimit = () => Math.min(90, Math.max(35, ((S.pos && S.pos.acc) || 0) * 1.5));

function maybeReroute() {
  const id = routeTargetId();
  if (!S.pos || !id) { if (routeState.status !== 'idle') clearRoute(); return; }
  const p = place(id);
  if (haversine(S.pos.lat, S.pos.lon, p.lat, p.lon) < ARRIVED_METERS) { if (routeState.status !== 'arrived') clearRoute('arrived'); return; }
  const changed = routeState.targetId !== id || routeState.status === 'arrived' || routeState.status === 'idle';
  const age = Date.now() - routeState.t;
  const retry = routeState.status === 'error' && age > 20000;
  // The route is kept while the walker stays near it (including the dotted
  // link from where they started to the nearest street). Only leaving it re-plans.
  let strayed = false;
  if (routeState.status === 'ok' && routeState.data && age > 5000) {
    const n = nearestOnLine(S.pos, routeState.data.track);
    strayed = !n || n.dist > offRouteLimit();
  }
  if (!changed && !retry && !strayed) return;
  const my = ++routeSeq;
  routeState.targetId = id; routeState.from = { lat: S.pos.lat, lon: S.pos.lon }; routeState.t = Date.now();
  if (changed) routeState.data = null;
  routeState.status = routeState.data ? 'refresh' : 'loading';
  fetchRoute(routeState.from, p).then(res => {
    if (my !== routeSeq) return;
    routeState.t = Date.now();
    if (res) { routeState.data = res; routeState.status = 'ok'; }
    else routeState.status = routeState.data ? 'ok' : 'error';   // keep the old route if re-planning fails
    renderRoute();
    if (S.fitOnRoute) { S.fitOnRoute = false; fitRoute(); }
  });
  renderRoute();
}

// Splits the planned route into what is still ahead of the walker.
function routeAhead(r) {
  const n = nearestOnLine(S.pos, r.track);
  const last = r.track.length - 2;                 // index of the road-end → destination segment
  const ahead = [n.point, ...r.track.slice(n.index + 1)];
  let solid, dotted = [];
  if (n.index === 0) {                             // still getting to the street
    solid = r.coords;
    dotted.push([[S.pos.lat, S.pos.lon], r.coords[0]]);
  } else if (n.index >= last) {                    // past the street, walking to the place
    solid = [];
  } else {
    solid = [n.point, ...r.track.slice(n.index + 1, last + 1)];
    if (n.dist > 8) dotted.push([[S.pos.lat, S.pos.lon], n.point]);
  }
  if (r.snapOut > 8 || n.index >= last) dotted.push([n.index >= last ? [S.pos.lat, S.pos.lon] : r.coords[r.coords.length - 1], r.dest]);
  return { solid, dotted, remaining: lineLength(ahead) + (n.dist > 8 ? n.dist : 0), segment: n.index, last };
}

function renderRoute() {
  const id = routeTargetId(), empty = $('#routeEmpty'), body = $('#routeBody');
  const draw = (solid, dotted) => map && map.setRoute(solid, dotted);
  $('#followBtn').hidden = !(S.revisitId && isDone(S.revisitId));
  const msg = t => { empty.hidden = false; body.hidden = true; empty.textContent = t; draw([], []); };
  if (!id) return msg('Ai parcurs tot traseul. Poți reveni la orice oprire din lista de mai jos.');
  if (!S.pos) return msg('Așteptăm locația ta ca să-ți arătăm drumul…');

  const p = place(id), d = haversine(S.pos.lat, S.pos.lon, p.lat, p.lon);
  empty.hidden = true; body.hidden = false;
  $('#rTitle').textContent = (id === S.revisitId ? 'Revii la ' : stopNo(id) + '. ') + displayName(p);
  if (routeState.status === 'arrived' || d < ARRIVED_METERS) {
    $('#rSummary').textContent = 'Ai ajuns';
    $('#rNext').textContent = isDisc(id) ? 'Deschide oprirea din listă ca să citești povestea și să răspunzi la întrebări.' : 'Mai fă câțiva pași: locul se dezvăluie imediat.';
    $('#rNote').textContent = ''; $('#rSteps').innerHTML = ''; draw([], []); return;
  }
  const r = routeState.data;
  if (r && routeState.targetId === id && (routeState.status === 'ok' || routeState.status === 'refresh')) {
    const a = routeAhead(r);
    draw(a.solid, a.dotted);
    $('#rSummary').textContent = fmtDist(a.remaining) + ' · ' + fmtDur(a.remaining / r.speed) + ' pe jos';

    const toStreet = haversine(S.pos.lat, S.pos.lon, r.coords[0][0], r.coords[0][1]);
    let next, ci = -1;
    if (a.segment === 0 && toStreet > 15) next = 'Mergi până la cel mai apropiat drum (' + fmtDist(toStreet) + '), apoi urmează linia albastră.';
    else if (a.segment >= a.last) next = 'Ai ieșit de pe stradă: mai ai ' + fmtDist(d) + ' până la loc, pe linia punctată.';
    else {
      ci = currentStep(r.steps, S.pos);
      const nxt = ci >= 0 ? r.steps[Math.min(ci + 1, r.steps.length - 1)] : null;
      next = nxt ? (ci + 1 < r.steps.length ? 'Urmează: ' : 'Apoi: ') + stepText(nxt) : 'Urmează linia albastră de pe hartă.';
    }
    $('#rNext').textContent = next;

    const items = [];
    if (r.snapIn > 15) items.push(`<li class="${a.segment === 0 ? 'cur' : ''}">Mergi până la cel mai apropiat drum · ${fmtDist(r.snapIn)}</li>`);
    r.steps.forEach((s, i) => items.push(`<li class="${i === ci ? 'cur' : ''}">${esc(stepText(s))}${s.distance ? ' · ' + fmtDist(s.distance) : ''}</li>`));
    if (r.snapOut > 15) items.push(`<li class="${a.segment >= a.last ? 'cur' : ''}">De la drum până la loc · ${fmtDist(r.snapOut)}</li>`);
    $('#rSteps').innerHTML = items.join('');
    $('#rNote').textContent = r.label + '. Linia punctată arată bucățile din afara străzilor. Ruta se recalculează doar dacă te abați de la ea.';
  } else if (routeState.status === 'loading') {
    draw([], [[[S.pos.lat, S.pos.lon], [p.lat, p.lon]]]);
    $('#rSummary').textContent = fmtDist(d);
    $('#rNext').textContent = 'Căutăm cel mai bun drum…';
    $('#rNote').textContent = ''; $('#rSteps').innerHTML = '';
  } else {
    draw([], [[[S.pos.lat, S.pos.lon], [p.lat, p.lon]]]);
    $('#rSummary').textContent = fmtDist(d) + ' în linie dreaptă';
    $('#rNext').textContent = 'Indicațiile pe străzi nu sunt disponibile acum. Mergi în direcția liniei punctate de pe hartă.';
    $('#rNote').textContent = 'Serviciul de rute nu răspunde; reîncercăm automat.';
    $('#rSteps').innerHTML = '';
  }
}

/* ===================== PROGRESS / STATUS / LIST ===================== */
function renderProgress() {
  const a = activeIndex(), n = S.path.length;
  $('#progTitle').textContent = a >= n ? 'Traseu complet' : 'Oprirea ' + (a + 1) + ' din ' + n;
  $('#progDots').innerHTML = S.path.map((id, i) =>
    `<span class="pdot ${isDisc(id) && isDone(id) ? 'done' : i === a ? 'cur' : ''}"></span>`).join('');
  let t;
  if (a >= n) t = 'Ai vizitat toate opririle. Felicitări!';
  else {
    const p = place(S.path[a]);
    t = isDisc(p.id)
      ? 'Răspunde la întrebările de la ' + p.name + (a + 1 < n ? ' ca să deblochezi oprirea următoare.' : ' ca să termini traseul.')
      : 'Urmează drumul de pe hartă. Locul se dezvăluie când ajungi la ' + S.radius + ' m de el.';
  }
  $('#progText').textContent = t;
}

function renderStatus() {
  const dot = $('#gpsDot'), t = $('#gpsTitle'), help = $('#gpsHelp'), btn = $('#gpsBtn');
  btn.hidden = true; help.hidden = true;
  if (S.sim) { dot.className = 'dot wait'; t.textContent = 'Poziție simulată'; }
  else if (S.lastGps) { dot.className = 'dot ok'; t.textContent = 'Locație activă'; }
  else if (S.gpsErr) {
    dot.className = 'dot err'; t.textContent = 'Fără locație'; btn.hidden = false;
    help.hidden = false; help.textContent = S.gpsErr;
  } else { dot.className = 'dot wait'; t.textContent = 'Se caută locația…'; }
  $('#gpsSub').textContent = 'Position: ' + (S.pos ? S.pos.lat.toFixed(5) + ', ' + S.pos.lon.toFixed(5) : 'none')
    + (S.lastGps && S.lastGps.acc && !S.sim ? ' · GPS ±' + Math.round(S.lastGps.acc) + ' m' : '');
}

// Navigation control for a stop: the current stop is always the target,
// finished stops can be revisited, future stops can't be navigated to.
function navControl(id, inSheet) {
  if (id === routeTargetId() && !isDone(id)) {
    return `<button class="btn ${inSheet ? 'primary' : ''}" data-act="showroute">Arată drumul</button>`;
  }
  if (!isDone(id)) return '';
  if (S.revisitId === id) return `<button class="btn" data-act="follow">Înapoi la traseu</button>`;
  return `<button class="btn" data-act="revisit" data-id="${id}">Du-mă aici</button>`;
}

let listSig = '';
function renderList() {
  const ids = S.path.filter(isVisible), act = activeId();
  const sig = ids.map(id => id + (isDisc(id) ? 1 : 0) + (isDone(id) ? 1 : 0)).join('|') + '#' + S.revisitId + '#' + act;
  if (sig !== listSig) {
    listSig = sig;
    $('#placeList').innerHTML = ids.map(id => {
      const p = place(id), disc = isDisc(id), done = isDone(id);
      const tag = done ? '<span class="tag done">Vizitat</span>' : id === act ? '<span class="tag cur">Acum</span>' : '<span class="tag">Blocat</span>';
      return `<li class="place ${disc ? '' : 'shadow'} ${done ? 'done' : ''}" id="pl-${id}">
        <div class="num">${disc ? (done ? '✓' : stopNo(id)) : '?'}</div>
        <div class="pinfo"><strong>${esc(displayName(p))}</strong>${tag}<div class="sub2">${disc ? esc(p.kind) : esc(p.hint)}</div><div class="status" id="st-${id}"></div></div>
        <div class="pbtns">
          <button class="btn primary" data-act="open" data-id="${id}" id="op-${id}">${disc ? 'Deschide' : 'Indiciu'}</button>
          ${navControl(id, false)}
        </div></li>`;
    }).join('');
  }
  ids.forEach(id => {
    const p = place(id), d = distTo(p), disc = isDisc(id), inr = d !== null && d <= S.radius;
    const li = document.getElementById('pl-' + id); if (!li) return;
    li.classList.toggle('on', disc && inr);
    document.getElementById('st-' + id).textContent = d === null ? ''
      : disc ? (inr ? (d < ARRIVED_METERS ? 'Ești aici' : 'Se poate deschide · la ' + fmtDist(d)) : 'La ' + fmtDist(d) + ' · se deschide de aproape')
        : 'La ' + fmtDist(d) + ' de tine';
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
  const nav = `<div class="sheet-nav" id="sheetNav">${navControl(p.id, true)}</div>`;
  const close = '<button class="x" data-act="close" aria-label="Închide">✕</button>';
  let h;
  if (mode === 'shadow') {
    h = `<div class="sheet-head"><div><p class="kicker">Nedescoperit</p><h2>Oprirea misterioasă ${stopNo(p.id)}</h2></div>${close}</div>
      <div class="chips"><span class="chip" id="sheetDist"></span><span class="chip lock">Ascuns</span></div>
      <div class="lockmsg"><strong>Indiciu</strong><p>${esc(p.hint)}</p></div>
      <p class="muted">Apropie-te la ${S.radius} m de umbra de pe hartă ca să afli ce este.</p>${nav}`;
  } else {
    h = `<div class="sheet-head"><div><p class="kicker">${esc(p.kind)}</p><h2>${esc(p.name)}</h2><p class="muted" style="margin:4px 0 0">${esc(p.address)}</p></div>${close}</div>
      <div class="chips"><span class="chip" id="sheetDist"></span><span class="chip ${mode === 'full' ? 'ok' : 'lock'}">${mode === 'full' ? 'Deblocat' : 'Blocat'}</span></div>`;
    if (mode === 'locked') {
      h += `<div class="lockmsg"><strong>Ești prea departe.</strong><p>Fotografiile, povestea și întrebările se deschid când ești la cel mult ${S.radius} m de acest loc.</p></div>${nav}`;
    } else {
      h += `<figure class="photo" id="photoBox"><div class="photo-loading">Se încarcă fotografia…</div></figure><div class="pcap" id="photoCap"></div>`
        + p.text.map(t => `<p>${esc(t)}</p>`).join('')
        + `<div class="quiz" id="quiz"></div>${nav}`;
    }
  }
  $('#sheetBody').innerHTML = h;
  updateSheetDist();
  if (mode === 'full') { renderPhoto(); renderQuiz(); }
}

function updateSheetDist() {
  const el = $('#sheetDist'); if (!el || !S.sheetId) return;
  const d = distTo(place(S.sheetId)); el.textContent = d === null ? 'Distanță necunoscută' : 'La ' + fmtDist(d);
}

function syncSheet() {
  if (!S.sheetId) return;
  if (!isVisible(S.sheetId)) { closeSheet(); return; }
  const mode = modeFor(place(S.sheetId));
  if (S.sheetMode === 'full' && mode !== 'full') { closeSheet(); toast('Ai ieșit din zona de ' + S.radius + ' m, așa că locul s-a blocat din nou.'); }
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
  if (ph) box.innerHTML = `<img src="${esc(ph.src)}" alt="Fotografie: ${esc(p.name)}">`;
  else box.innerHTML = `<div class="photo-empty"><strong>Încă nu avem o fotografie</strong>
      <a href="${esc(searchPhotosUrl(p))}" target="_blank" rel="noopener">Caută fotografii cu acest loc ↗</a></div>`;
  const credit = ph ? (ph.link ? `<a href="${esc(ph.link)}" target="_blank" rel="noopener">${esc(ph.credit)}</a>` : esc(ph.credit)) : 'Poți adăuga propria fotografie';
  cap.innerHTML = `<span>${credit}</span>
    <span class="row" style="gap:6px"><label class="btn sm">${own ? 'Schimbă fotografia' : 'Adaugă fotografia ta'}<input type="file" accept="image/*" hidden id="photoIn"></label>${own ? '<button class="btn sm" data-act="rmphoto">Șterge</button>' : ''}</span>`;
}

async function handlePhotoFile(file) {
  const p = place(S.sheetId); if (!p || !file) return;
  try {
    const url = await fileToDataUrl(file);
    if (!S.store.setPhoto(p.id, url)) toast('Spațiul browserului e plin, fotografia nu a fost salvată.');
    if (S.sheetId === p.id && S.sheetMode === 'full') renderPhoto();
  } catch { toast('Fișierul nu a putut fi citit ca imagine.'); }
}

/* ===================== TRIVIA ===================== */
function renderQuiz() {
  const p = place(S.sheetId), box = $('#quiz'); if (!box) return;
  const q = S.quizzes[p.id], n = p.trivia.length, best = S.store.getBest(p.id);
  if (!n) { box.innerHTML = '<h3>Întrebări</h3><p class="muted">Încă nu sunt întrebări pentru acest loc.</p>'; return; }
  const bestTxt = best !== undefined ? `<p class="muted">Cel mai bun scor aici: ${best}/${n}</p>` : '';
  if (!q) {
    const lead = isDone(p.id) ? 'Ai terminat deja această oprire. Poți juca din nou pentru un scor mai bun.'
      : `${n} întrebări despre acest loc. Răspunde la toate ca să deblochezi oprirea următoare.`;
    box.innerHTML = `<h3>Întrebări</h3><p class="muted">${lead}</p>${bestTxt}<button class="btn primary" data-act="start">Începe</button>`;
    return;
  }
  if (q.done) {
    const msg = q.score === n ? 'Scor perfect!' : q.score >= Math.ceil(n / 2) ? 'Bravo!' : 'Uită-te în jur și mai încearcă.';
    const next = activeId();
    let after = '';
    if (q.unlocked && next) {
      after = `<div class="next">Urmează oprirea ${stopNo(next)}: ${esc(displayName(place(next)))}. Drumul s-a actualizat pe hartă.</div>
        <button class="btn primary" data-act="showroute">Arată-mi drumul</button> `;
    } else if (q.unlocked) after = '<div class="next">Ai terminat tot traseul. Felicitări!</div>';
    box.innerHTML = `<h3>Gata!</h3><p class="score">${q.score}/${n}</p><p>${msg}</p>${bestTxt}${after}<button class="btn" data-act="again">Joacă din nou</button>`;
    return;
  }
  const t = p.trivia[q.i];
  box.innerHTML = `<p class="kicker">Întrebarea ${q.i + 1} din ${n}</p><p class="qtext">${esc(t.q)}</p>
    <div class="opts">${t.o.map((o, i) => {
      let cls = 'opt';
      if (q.chosen !== null) { if (i === t.a) cls += ' right'; else if (i === q.chosen) cls += ' wrong'; }
      return `<button class="${cls}" data-act="opt" data-i="${i}" ${q.chosen !== null ? 'disabled' : ''}>${esc(o)}</button>`;
    }).join('')}</div>`
    + (q.chosen !== null ? `<p><strong>${q.chosen === t.a ? 'Corect!' : 'Nu chiar.'}</strong> ${esc(t.e)}</p>
      <button class="btn primary" data-act="next">${q.i < n - 1 ? 'Următoarea întrebare' : 'Vezi rezultatul'}</button>` : '');
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
      if (best === undefined || q.score > best) {
        S.store.setBest(p.id, q.score);
        S.store.saveRemoteScore(p.id, q.score).then(ok => { if (!ok) toast('Scorul nu a putut fi salvat în cont. Verifică conexiunea.'); });
      }
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
  if (!window.confirm('Sigur vrei să iei traseul de la capăt? Progresul și scorurile pentru „' + S.user.name + '” vor fi șterse.')) return;
  S.prog = { discovered: [], completed: [] }; saveProg();
  S.store.clearBests(S.path);
  S.quizzes = {}; S.revisitId = null;
  closeSheet(); clearRoute(); listSig = '';
  if (map) map.clearStops();
  updateAll(); fitTrail(); toast('Ai luat-o de la capăt. Prima oprire te așteaptă.');
}

/* ===================== EVENTS ===================== */
function bindEvents() {
  $('#authForm').addEventListener('submit', e => { e.preventDefault(); submitAuth(); });
  $('#authForm').addEventListener('input', () => authMsg(''));

  document.addEventListener('click', e => {
    if (e.target === $('#sheet')) { closeSheet(); return; }
    const el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!e.target.closest || !e.target.closest('#account')) closeMenu();
    if (!el) return;
    const act = el.dataset.act, id = el.dataset.id;
    switch (act) {
      case 'menu': toggleMenu(); break;
      case 'minigame':
        if (screen === 'minigame') { showScreen('app'); map && map.refresh(); break; }
        closeSheet(); showScreen('minigame');
        mountMinigame($('#minigameRoot'), { user: S.user, places: S.places, completed: [...S.prog.completed] });
        break;
      case 'backtomap': showScreen('app'); map && map.refresh(); break;
      case 'authmode': setAuthMode(el.dataset.mode); break;
      case 'peek': {
        const inp = $('#authPass'), show = inp.type === 'password';
        inp.type = show ? 'text' : 'password'; el.textContent = show ? 'Ascunde' : 'Arată';
        el.setAttribute('aria-label', show ? 'Ascunde parola' : 'Arată parola');
        break;
      }
      case 'signout': closeMenu(); signOut(); break;
      case 'resetprog': closeMenu(); resetProgress(); break;
      case 'open': if (isVisible(id)) openSheet(id); break;
      case 'revisit': if (isDone(id)) { S.revisitId = id; S.fitOnRoute = true; listSig = ''; if (S.sheetId) renderSheet(); updateAll(); } break;
      case 'follow': S.revisitId = null; S.fitOnRoute = true; listSig = ''; if (S.sheetId) renderSheet(); updateAll(); break;
      case 'showroute': closeSheet(); fitRoute(); $('.mapbox').scrollIntoView({ behavior: 'smooth', block: 'start' }); break;
      case 'close': closeSheet(); break;
      case 'start': case 'again': case 'opt': case 'next': quizAct(act, el); break;
      case 'rmphoto': { const p = place(S.sheetId); if (p) { S.store.removePhoto(p.id); renderPhoto(); } break; }
      case 'tp': { const p = place(id); if (p) { S.simPos = { lat: p.lat, lon: p.lon }; setSim(true); map && map.center(S.pos); } break; }
      case 'rreset': $('#radius').value = DEFAULT_RADIUS; S.radius = DEFAULT_RADIUS; $('#radiusVal').textContent = S.radius + ' m'; updateAll(); break;
      case 'enable': startGPS(); break;
      case 'zin': map && map.zoomIn(); break;
      case 'zout': map && map.zoomOut(); break;
      case 'fit': fitTrail(); break;
      case 'locate': if (S.pos) map && map.center(S.pos); else toast('Încă nu știm unde ești.'); break;
    }
  });

  document.addEventListener('change', e => {
    const id = e.target.id;
    if (id === 'photoIn') handlePhotoFile(e.target.files && e.target.files[0]);
    else if (id === 'sim') setSim(e.target.checked);
  });
  $('#radius').addEventListener('input', e => {
    S.radius = parseInt(e.target.value, 10); $('#radiusVal').textContent = S.radius + ' m'; updateAll();
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (S.sheetId) closeSheet(); else closeMenu();
  });
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
    console.error(e);
    $('#fatalMsg').textContent = location.protocol === 'file:'
      ? 'Datele traseului nu pot fi citite când pagina e deschisă direct de pe disc. Pornește un server local în folderul proiectului (de exemplu: python3 -m http.server 8000) și deschide http://localhost:8000.'
      : 'Datele traseului nu au putut fi încărcate. Reîncarcă pagina sau încearcă mai târziu.';
    showScreen('fatal');
    return;
  }
  buildTeleportButtons();
  // A password-reset link opens the page in recovery mode.
  const toRecovery = () => { authMode = 'recovery'; S.user = null; stopGPS(); renderWelcome(); showScreen('welcome'); };
  auth.onPasswordRecovery(toRecovery);
  if (RECOVERY_IN_URL) { toRecovery(); return; }
  const user = await auth.getCurrentUser();
  if (authMode === 'recovery') return;
  if (user) enterApp(user);
  else { renderWelcome(); showScreen('welcome'); }
}

boot();
