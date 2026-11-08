// "Ghizi locali": a small messaging app in the bottom-right corner.
//
//   initGuides({ routes: () => S.routes, place: id => S.byId.get(id) })
//
// Flow: round button → intro card ("Înapoi" / "Doresc un ghid") → the guides
// listed like a messenger while a loader searches ~5 s → one guide is picked →
// choose Traseul 1, 2 or 3 → chat with the guide, who answers through Grok
// (supabase/functions/guide-chat keeps the API key on the server). Each guide
// has their own personality and a few free hours this session, which they
// suggest; the player writes freely in the text box. Nothing is really booked.
import { backend } from './backend.js';

/* ---------- guides ---------- */
const GUIDES = [
  { id: 'gheorghe-ardelean', name: 'Gheorghe Ardelean', about: 'Istoric, ghid în Arad de peste 20 de ani' },
  { id: 'andrei-balan',      name: 'Andrei Bălan',      about: 'Povești și legende din centrul vechi' },
  { id: 'ioana-crisan',      name: 'Ioana Crișan',      about: 'Arhitectură și clădiri de patrimoniu', fem: true },
  { id: 'radu-popa',         name: 'Radu Popa',         about: 'Tururi relaxate, în română și engleză' },
  { id: 'dan-muresan',       name: 'Dan Mureșan',       about: 'Malul Mureșului și parcurile orașului' },
].map(g => ({ ...g, photo: `assets/guides/${g.id}.jpg`, first: g.name.split(' ')[0] }));

/* ---------- tour length ----------
   Walking distance along the route's stops, measured on real streets with the
   OSRM foot router (routing.openstreetmap.de), side quests not included.
   Time = walking at a guided-group pace of 3.5 km/h + 10 minutes at every stop
   (the guide's story and the three questions). */
const ROUTE_METERS = { 'traseu-1': 2056, 'traseu-2': 2225, 'traseu-3': 2831 };
const PACE_M_PER_MIN = 3500 / 60;
const MIN_PER_STOP = 10;
export function tourMinutes(routeId, stops) {
  return Math.ceil((ROUTE_METERS[routeId] || 0) / PACE_M_PER_MIN + stops * MIN_PER_STOP);
}

/* ---------- helpers ---------- */
const SEARCH_MS = 5000;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const km = m => (m / 1000).toFixed(1).replace('.', ',') + ' km';
const dur = min => (min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min` : `${min} min`);
const hhmm = min => { const d = ((min % 1440) + 1440) % 1440; return `${String(Math.floor(d / 60)).padStart(2, '0')}:${String(d % 60).padStart(2, '0')}`; };

// A few free start times for the guide (today if there's still time, and tomorrow),
// every half hour between 09:00 and 18:00, at least an hour from now.
function freeSlots() {
  const d = new Date(), now = d.getHours() * 60 + d.getMinutes();
  const all = []; for (let m = 9 * 60; m <= 18 * 60; m += 30) all.push(m);
  const pick = (list, n) => list.sort(() => Math.random() - 0.5).slice(0, n).sort((a, b) => a - b);
  const today = pick(all.filter(m => m >= now + 60), 2).map(m => ({ day: 'azi', t: hhmm(m) }));
  const tomorrow = pick(all.slice(), today.length ? 2 : 3).map(m => ({ day: 'mâine', t: hhmm(m) }));
  return [...today, ...tomorrow];
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

const ICON_CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z"/><circle cx="8.5" cy="9.5" r="1.2"/><circle cx="12" cy="9.5" r="1.2"/><circle cx="15.5" cy="9.5" r="1.2"/></svg>';
const ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const ICON_BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
const ICON_SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg>';

/* ---------- state ---------- */
let app = null;          // { routes(), place(id) }
let root, win, view;     // DOM
let guide = null, route = null, run = 0, slots = [], hist = [], busy = false;

const avatar = (g, cls = '') => `<img class="gd-av ${cls}" src="${g.photo}" alt="" width="44" height="44" loading="lazy">`;

/* ---------- views ---------- */
function showIntro() {
  run++;
  win.className = 'gd-win gd-intro';
  view.innerHTML = `
    <div class="gd-introbody">
      <div class="gd-stack">${GUIDES.map(g => avatar(g)).join('')}</div>
      <p class="gd-title">Ai nevoie de un tur al orașului? Ghizii noștri sunt în ajutorul tău!</p>
      <div class="gd-actions">
        <button type="button" class="btn" data-gd="close">Înapoi</button>
        <button type="button" class="btn primary" data-gd="search">Doresc un ghid</button>
      </div>
    </div>`;
  view.querySelector('[data-gd=search]').focus({ preventScroll: true });
}

function messengerList(active = -1) {
  return `<ul class="gd-list">${GUIDES.map((g, i) => `
    <li class="gd-row${i === active ? ' on' : ''}" data-i="${i}">
      <span class="gd-avwrap">${avatar(g)}<i class="gd-dot"></i></span>
      <span class="gd-rowtext"><b>${esc(g.name)}</b><small>${esc(g.about)}</small></span>
      <time>acum</time>
    </li>`).join('')}</ul>`;
}

function header(title, sub, back) {
  return `<header class="gd-head">
    ${back ? `<button type="button" class="gd-icon" data-gd="${back}" aria-label="Înapoi">${ICON_BACK}</button>` : ''}
    <div class="gd-headtext"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div>
    <button type="button" class="gd-icon" data-gd="close" aria-label="Închide">${ICON_X}</button>
  </header>`;
}

async function search() {
  const my = ++run;
  win.className = 'gd-win gd-full';
  view.innerHTML = `${header('Ghizi Arad', `${GUIDES.length} ghizi online`)}
    <div class="gd-body">${messengerList()}
      <div class="gd-front" role="status" aria-live="polite">
        <div class="gd-card gd-loading">
          <div class="gd-loader" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
          <p>Se caută un ghid disponibil</p>
          <div class="gd-bar" aria-hidden="true"><i></i></div>
        </div>
      </div>
    </div>`;
  // the highlight sweeps through the guides in the background while searching
  const rows = [...view.querySelectorAll('.gd-row')];
  let k = 0;
  const sweep = setInterval(() => { rows.forEach((r, i) => r.classList.toggle('on', i === k % rows.length)); k++; }, 420);
  await sleep(SEARCH_MS);
  clearInterval(sweep);
  if (my !== run) return;
  const pick = Math.floor(Math.random() * GUIDES.length);
  guide = GUIDES[pick];
  rows.forEach((r, i) => r.classList.toggle('on', i === pick));
  chooseRoute();
}

function chooseRoute() {
  const routes = app.routes();
  const front = view.querySelector('.gd-front');
  front.innerHTML = `
    <div class="gd-card gd-found">
      ${avatar(guide, 'lg')}
      <p class="gd-found-t"><b>${esc(guide.name)}</b> este disponibil${guide.fem ? 'ă' : ''}!</p>
      <p class="gd-muted">Ce traseu vrei să faci?</p>
      <div class="gd-routes">${routes.map(r => {
        const n = r.locationIds.length, min = tourMinutes(r.id, n);
        return `<button type="button" class="gd-route" data-gd="route" data-id="${esc(r.id)}">
          <b>${esc(r.name)}</b><small>${n} opriri · ${km(ROUTE_METERS[r.id] || 0)} · ${dur(min)}</small></button>`;
      }).join('')}</div>
    </div>`;
  front.querySelector('.gd-route').focus({ preventScroll: true });
}

function openChat(routeId) {
  run++;
  route = app.routes().find(r => r.id === routeId);
  slots = freeSlots(); hist = []; busy = false;
  win.className = 'gd-win gd-full';
  view.innerHTML = `${header(esc(guide.name), '<i class="gd-dot inline"></i> online', 'list')}
    <div class="gd-body gd-chat"><div class="gd-msgs" aria-live="polite"></div></div>
    <div class="gd-quick" aria-label="Orele libere ale ghidului">${slots.map(x =>
      `<button type="button" class="gd-chip" data-gd="slot" data-text="Pot ${x.day} la ${x.t}.">${x.day} ${x.t}</button>`).join('')}</div>
    <form class="gd-compose" novalidate>
      <div class="gd-composerow">
        <input id="gdText" type="text" maxlength="400" autocomplete="off" placeholder="Scrie un mesaj…" aria-label="Mesaj către ghid">
        <button type="submit" class="btn primary gd-send" aria-label="Trimite">${ICON_SEND}<span>Trimite</span></button>
      </div>
    </form>`;
  view.querySelector('.gd-headtext').insertAdjacentHTML('beforebegin', avatar(guide, 'sm'));
  view.querySelector('.gd-compose').addEventListener('submit', e => { e.preventDefault(); send(view.querySelector('#gdText').value); });
  ask();   // the guide writes first: greeting + free hours
}

function say(who, text) {
  const box = view.querySelector('.gd-msgs');
  if (!box) return null;
  const el = document.createElement('div');
  el.className = `gd-msg ${who}`;
  el.textContent = text;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
  return el;
}

function setBusy(on) {
  busy = on;
  const b = view.querySelector('.gd-send');
  if (b) b.disabled = on;
  view.querySelectorAll('.gd-chip').forEach(c => { c.disabled = on; });
}

function send(text) {
  text = String(text || '').trim();
  if (!text || busy) return;
  const input = view.querySelector('#gdText');
  if (input) input.value = '';
  say('me', text);
  hist.push({ role: 'user', content: text });
  ask();
}

// Sends the conversation to the guide and shows the answer.
async function ask() {
  const my = run;
  setBusy(true);
  const typing = say('them typing', '');
  typing.innerHTML = '<i></i><i></i><i></i>';
  const n = route.locationIds.length;
  const payload = {
    guideId: guide.id,
    route: { name: route.name, stops: route.locationIds.map(id => (app.place(id) || {}).name || id),
             km: km(ROUTE_METERS[route.id] || 0).replace(' km', ''), minutes: tourMinutes(route.id, n) },
    slots: slots.map(x => `${x.day} la ${x.t}`),
    messages: hist,
  };
  let reply = null, problem = '';
  try {
    const b = await backend();
    reply = await b.guideChat(payload);
  } catch (e) {
    const status = e && e.context && e.context.status;
    console.warn('[guides]', e);
    problem = status === 404 ? 'Chatul cu ghizii nu este încă activat pe server.'
      : /fetch|network|load failed/i.test(String(e && e.message)) ? 'Nu ne putem conecta la server. Verifică internetul și încearcă din nou.'
      : 'Ghidul nu poate răspunde acum. Încearcă din nou peste puțin timp.';
  }
  if (my !== run) return;
  typing.remove();
  if (reply) { hist.push({ role: 'assistant', content: reply }); say('them', reply); }
  else {
    if (hist.length && hist[hist.length - 1].role === 'user') hist.pop();   // so the same message can be sent again
    say('note err', problem);
  }
  setBusy(false);
  const input = view.querySelector('#gdText');
  if (input && matchMedia('(hover: hover)').matches) input.focus({ preventScroll: true });
}

/* ---------- open / close ---------- */
function open() {
  root.classList.add('open');
  root.querySelector('.gd-fab').setAttribute('aria-expanded', 'true');
  if (!guide || !route) showIntro();
}
function close() {
  run++;
  root.classList.remove('open');
  root.querySelector('.gd-fab').setAttribute('aria-expanded', 'false');
  // a finished or cancelled search starts over next time; an open chat is kept
  if (!view.querySelector('.gd-chat')) { guide = null; route = null; }
}

export function initGuides(opts) {
  app = opts;
  root = document.createElement('div');
  root.className = 'gd';
  root.innerHTML = `
    <section class="gd-win gd-intro" role="dialog" aria-label="Ghizi locali"><div class="gd-view"></div></section>
    <button type="button" class="gd-fab" aria-label="Ghizi locali: mesaje" aria-expanded="false">
      <span class="gd-ic gd-ic-chat">${ICON_CHAT}</span><span class="gd-ic gd-ic-x">${ICON_X}</span>
    </button>`;
  document.body.appendChild(root);
  win = root.querySelector('.gd-win');
  view = root.querySelector('.gd-view');

  root.addEventListener('click', e => {
    if (e.target.closest('.gd-fab')) { root.classList.contains('open') ? close() : open(); return; }
    const b = e.target.closest('[data-gd]');
    if (!b) return;
    const act = b.dataset.gd;
    if (act === 'close') close();
    else if (act === 'search') search();
    else if (act === 'route') openChat(b.dataset.id);
    else if (act === 'slot') send(b.dataset.text);
    else if (act === 'list') { guide = null; route = null; showIntro(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('open')) { e.stopPropagation(); close(); } }, true);
}
