# Arad Explorer

A GPS walking trail through Arad. Each stop is a shadow on the map until you get close; then it reveals its story, photos and a short trivia round. Finishing the trivia sends you on to the next stop.

## Running it

The app is served over **HTTPS**: phones only allow GPS on HTTPS pages, and Supabase sign-in links should return to an HTTPS address.

```bash
python3 serve.py
# on this computer:  https://localhost:8443
# on your phone:     https://<your-computer's-IP>:8443   (same Wi-Fi; the address is printed)
```

`serve.py` needs only Python 3 and the `openssl` command. The first run creates a local certificate in `.certs/` (not committed). Browsers warn once because it is self-signed: choose *Advanced → Proceed* (Chrome) or *Accept the risk* (Firefox). If your computer's IP changes, run `python3 serve.py --new-cert`.

Opening `index.html` straight from disk won't work, because the browser blocks reading the data files. When published (GitHub Pages, Netlify, Vercel…) the site gets HTTPS automatically. All external services the app talks to (Supabase, map tiles, routing, Wikipedia/Commons) are already HTTPS.

## Project layout

```
index.html              page structure only (front page + app)
css/styles.css          all styling, theme colours at the top
js/config.js            settings: radius, map tiles, routing servers, data paths
js/app.js               main controller: screens, trail logic, sheet, trivia (Romanian UI text lives here and in index.html)
js/auth.js              account layer (Supabase email + password)
js/store.js             per-user progress and photos (browser) + scores (Supabase)
js/data.js              loads and validates the CSV database
js/csv.js               CSV parser
js/map.js               Leaflet map wrapper (pins, route line, user dot)
js/routing.js           walking directions (OSRM)
js/minigame.js          minigame placeholder (mountMinigame / unmountMinigame)
js/photos.js            photo lookup (own photo → CSV photo → Wikipedia placeholder)
js/geo.js               distance and formatting helpers
data/game-data.json     three selectable routes, 31 locations, trivia and 10 side quests
assets/photos/          drop real photos here
vendor/leaflet/         map library (BSD-2 licence)
```

## Game data

The current game catalogue lives in `data/game-data.json`.

- `routes` defines the three route choices shown after sign-in. Each route has an ordered `locationIds` list.
- `places` contains the location details and trivia. Every route stop has at least one question entry.
- Questions marked `placeholder: true` are intentionally unfinished. The stop shows the draft question and a "Continuă la oprirea următoare" button, which finishes the stop and routes to the next one like a completed quiz.
- `sidequests` contains the independent side-quest location IDs and categories. Side quests appear separately and unlock when the player's GPS position enters the interaction radius. Completing one does not advance the main route.
- Each place needs a unique `id`, a display name, and decimal-degree `lat` / `lon` coordinates.

**Coordinate note:** some newly added locations currently have provisional coordinates or addresses and should be checked on-site before the game is published. The catalogue includes a `coordinate_note` field to flag this.

To add a question, add an object to that place's `trivia` array with `q`, `o` (answer options), `a` (zero-based correct option index), and optional `e` (explanation). Replace a placeholder object once the question is ready.

## Trail rules

- Finishing the last stop of a route opens a congratulations screen (confetti, stops visited, correct answers) with "Începe un traseu nou", which opens the route picker.

- After sign-in, the player chooses one of the three routes. Directions point at the first unfinished stop on that selected route.
- A main-route stop is discovered when you're within the interaction radius (120 m by default, see `js/config.js`). Side quests are always on the map as unnamed gold stars; their name, story and questions (and their entry in the list) only appear while you are within that radius. They can be done in any order and don't move the main route on.
- The chosen route is remembered per account on the device; "Schimbă traseul" in the account menu opens the route picker again.
- The trail only moves on once that stop's trivia has been answered to the end; the route then switches to the next stop automatically.
- Walking directions start from wherever you are: a dotted line leads to the nearest street, then the solid line follows streets. The route is planned once and followed; it is only re-planned when you stray from it (35–90 m depending on GPS accuracy).
- Finished stops can be revisited from the list; "Înapoi la traseu" returns to the current stop.

## Developer tools

At the bottom of the app page there is a collapsed **ADVANCED** tab with testing tools: the interaction radius slider and a simulated position (tap the map or jump straight to a route stop or side quest). It is intentionally in English; everything else visitors see is Romanian.

## Phone layout

On phones (≤ 760 px wide, or portrait up to 1024 px) the map fills the screen under the header. Progress is a chip at the top, the next-stop card floats above a bottom bar (tap its handle for all directions), and the bottom bar opens pop-up panels: **Opriri**, **Misiuni** (with a badge when a side quest is nearby) and **Avansat** (the dev tools). The breakpoint is defined twice and must match: the phone section of `css/styles.css` and `MOBILE_MQ` in `js/app.js`.

## Dark mode

The moon/sun button in the header switches themes; the choice is saved in the browser (`arad-explorer:theme`). Without a choice, the app follows the device setting. Dark mode uses a black background; its colours are the `:root[data-theme="dark"]` block in `css/styles.css`; the map uses CARTO's dark tiles and lighter route colours (`MAP_COLORS_DARK` in `js/config.js`).

## Design

Simple and square: Roboto everywhere (18 px base), large bold titles, 2 px edges and hard offset shadows that press down when clicked. Colours come from the Arad coat of arms (`assets/brand/stema-arad.png`), also shown as the four-colour stripe under the header; they are variables at the top of `css/styles.css` (map colours in `js/config.js`).

- `js/sky.js`: the login background, drifting "constellations" that react to the mouse or finger (one still frame if the device asks for reduced motion).
- `js/tour.js`: the walkthrough shown the first time a player opens **Vizionare pe viu**; "Cum se joacă" in the account menu replays it.
- After sign-in the dashboard has two tiles: **Vizionare pe viu** (GPS map) and **Joc interactiv** (minigame).

## Photos

Each place's `photo` field in `data/game-data.json` can be:

- `commons:File name.jpg` – a free-licensed photo on Wikimedia Commons. The app asks Commons for a 960 px version and shows the author and licence under the photo (linked to the file page), which is what CC BY / CC BY-SA require.
- a path like `assets/photos/place.jpg` or any image URL, with the credit in `photoCredit`.

The team's own photos live in `assets/photos/<place-id>.jpg` (max 1280 px, JPEG). Leave the field empty and the stop shows "Încă nu avem o fotografie" with a link to search for one. Don't hotlink photos from Google Images: they are copyrighted. Use Commons, your own photos, or ones you have permission for.

## Leaderboard and first blood

After signing in, players land on a dashboard with two choices: **Explorează orașul** (the GPS map) and **Minijoc**. The header has **Clasament** (leaderboard).

Scoring: each place counts with the player's best score there (1 point per correct answer). If the player's **first** attempt at a place had every answer right, that place is a **first blood** and counts double. The leaderboard shows rank, player, first bloods and score; it is sorted by score, with a "First blood" toggle that sorts by first bloods instead.

**One-time setup:** run `database/leaderboard.sql` in Supabase → SQL Editor. It creates the `place_results` table (players can only read their own rows), `record_place_result()` (called after every finished quiz; the first call for a place decides first blood) and `get_leaderboard()` (names and totals only, no e-mails). Until it is run, the leaderboard screen says it isn't set up yet and the rest of the app works normally. Results from before the setup are not counted.

## Accounts (Supabase)

Sign-in uses Supabase email + password accounts (project `scplcjroxictdslyrfez`).

```
database/supabase.js    Supabase client (project URL + publishable key)
database/auth.js        sign up / in / out, password reset, auth events
database/profiles.js    the signed-in user's row in `profiles`
database/scores.js      save_place_score / place_scores, plus record_place_result and get_leaderboard
database/leaderboard.sql  one-time SQL for the leaderboard (run in Supabase)
js/backend.js           loads database/ lazily so the app still opens if Supabase is unreachable
js/auth.js              account layer for the UI: validation + Romanian error messages
```

What the front page does:

- **Intră în cont**: email + password.
- **Cont nou**: display name, email, password (min. 6 characters). The display name is stored as `display_name` in the user metadata; the name shown in the app comes from `profiles`, falling back to that metadata.
- **Ai uitat parola?**: sends a reset email; the link opens the app in "Alege o parolă nouă" mode.
- If "Confirm email" is on in Supabase, sign-up shows a message to confirm the address first.

Scores: when a trivia round ends with a new best score, it is sent with `save_place_score(p_place_id, p_score)`, where `p_place_id` is the location id from the CSV (e.g. `college`, text). On a device with no saved progress for that account, places with a score in `place_scores` count as finished, so the player continues where they left off. Trail progress itself (discovered / finished on this device) and own photos stay in the browser.

Supabase settings to check (Dashboard → Authentication → URL Configuration): set **Site URL** to where the app is hosted, and add the same address (and `https://localhost:8443/` for testing) to **Redirect URLs**, otherwise confirmation and reset links won't return to the app.
