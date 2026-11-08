// "Ghizi locali": a small messaging app in the bottom-right corner.
//
//   initGuides({ routes: () => S.routes, place: id => S.byId.get(id) })
//
// Flow: round button → intro card ("Înapoi" / "Doresc un ghid") → the guides
// listed like a messenger while a loader searches ~5 s → one guide is picked →
// choose Traseul 1, 2 or 3 → chat with the guide → "Selectează o oră" →
// the guide accepts 75% of the time (start and end time), otherwise says they're busy.
// Everything here is a demo: nothing is sent anywhere.

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
const ACCEPT_CHANCE = 0.75;   // how often the guide is free at the chosen hour
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const km = m => (m / 1000).toFixed(1).replace('.', ',') + ' km';
const dur = min => (min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min` : `${min} min`);
const toMin = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const hhmm = min => { const d = ((min % 1440) + 1440) % 1440; return `${String(Math.floor(d / 60)).padStart(2, '0')}:${String(d % 60).padStart(2, '0')}`; };
const nowRounded = () => { const d = new Date(); return hhmm(Math.ceil((d.getHours() * 60 + d.getMinutes() + 30) / 15) * 15); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const ICON_CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z"/><circle cx="8.5" cy="9.5" r="1.2"/><circle cx="12" cy="9.5" r="1.2"/><circle cx="15.5" cy="9.5" r="1.2"/></svg>';
const ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const ICON_BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
const ICON_SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5z"/></svg>';

/* ---------- state ---------- */
let app = null;          // { routes(), place(id) }
let root, win, view;     // DOM
let guide = null, route = null, run = 0, booked = null;

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
  booked = null;
  const n = route.locationIds.length, min = tourMinutes(route.id, n);
  const first = app.place(route.locationIds[0]), last = app.place(route.locationIds[n - 1]);
  win.className = 'gd-win gd-full';
  view.innerHTML = `${header(esc(guide.name), '<i class="gd-dot inline"></i> online', 'list')}
    <div class="gd-body gd-chat">
      <div class="gd-msgs" aria-live="polite"></div>
    </div>
    <form class="gd-compose" novalidate>
      <label for="gdTime">Selectează o oră</label>
      <div class="gd-composerow">
        <input id="gdTime" type="time" step="900" value="${nowRounded()}" required>
        <button type="submit" class="btn primary gd-send" aria-label="Trimite">${ICON_SEND}<span>Trimite</span></button>
      </div>
    </form>`;
  view.querySelector('.gd-headtext').insertAdjacentHTML('beforebegin', avatar(guide, 'sm'));
  say('them', `Salut! Sunt ${guide.first}, ghid în Arad. 👋`);
  say('them', `Ai ales ${route.name}: ${n} opriri, de la ${first ? first.name : 'prima oprire'} până la ${last ? last.name : 'ultima oprire'}.`);
  say('them', `Traseul are ${km(ROUTE_METERS[route.id] || 0)} și durează cam ${dur(min)}, cu tot cu poveștile de la fiecare oprire. La ce oră vrei să începem?`);
  view.querySelector('.gd-compose').addEventListener('submit', e => { e.preventDefault(); askTime(); });
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

async function askTime() {
  const input = view.querySelector('#gdTime');
  const send = view.querySelector('.gd-send');
  if (!input.value) { input.focus(); return; }
  const start = input.value;
  const my = run;
  send.disabled = true; input.disabled = true;
  say('me', `Aș vrea să începem la ${start}.`);
  const typing = say('them typing', '');
  typing.innerHTML = '<i></i><i></i><i></i>';
  await sleep(1300 + Math.random() * 700);
  if (my !== run) return;
  typing.remove();
  if (Math.random() >= ACCEPT_CHANCE) {
    say('them', `Sunt ocupat${guide.fem ? 'ă' : ''} în acest interval orar.`);
    say('them', 'Poți alege altă oră?');
  } else {
    const n = route.locationIds.length, min = tourMinutes(route.id, n);
    const endMin = toMin(start) + min, end = hhmm(endMin);
    const first = app.place(route.locationIds[0]);
    booked = { start, end };
    say('them', `Super! Vom începe turul la ${start}.`);
    say('them', `Durează cam ${dur(min)}, deci terminăm pe la ${end}${endMin >= 1440 ? ' (a doua zi)' : ''}. Ne vedem la ${first ? first.name : 'prima oprire'}!`);
    say('note', `Tur programat: ${route.name}, ${start}–${end} cu ${guide.name}`);
  }
  send.disabled = false; input.disabled = false;
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
    else if (act === 'list') { guide = null; route = null; showIntro(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('open')) { e.stopPropagation(); close(); } }, true);
}
