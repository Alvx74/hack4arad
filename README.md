# Arad Explorer

A GPS walking trail through Arad. Each stop is a shadow on the map until you get close; then it reveals its story, photos and a short trivia round. Finishing the trivia sends you on to the next stop.

## Running it

The app reads its CSV database with `fetch`, so it has to be served over HTTP (opening `index.html` straight from disk won't work):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

GitHub Pages works too. GPS needs HTTPS (or `localhost`) on phones.

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

Colours come from the Arad coat of arms (`assets/brand/stema-arad.png`): blue, red, gold and oak-leaf green, defined as variables at the top of `css/styles.css` (map colours in `js/config.js`). Change them there for aesthetic tweaks.

## Photos

For each stop the app shows, in order: a photo the user added on their device, the `photo` from the CSV, or the lead image of the stop's Wikipedia article as a placeholder. To replace a placeholder, put the file in `assets/photos/` and set the `photo` and `photo_credit` columns. Only use photos you have the rights to.

## Accounts (Supabase)

Sign-in uses Supabase email + password accounts (project `scplcjroxictdslyrfez`).

```
database/supabase.js    Supabase client (project URL + publishable key)
database/auth.js        sign up / in / out, password reset, auth events
database/profiles.js    the signed-in user's row in `profiles`
database/scores.js      save_place_score RPC and the `place_scores` table
js/backend.js           loads database/ lazily so the app still opens if Supabase is unreachable
js/auth.js              account layer for the UI: validation + Romanian error messages
```

What the front page does:

- **Intră în cont**: email + password.
- **Cont nou**: display name, email, password (min. 6 characters). The display name is stored as `display_name` in the user metadata; the name shown in the app comes from `profiles`, falling back to that metadata.
- **Ai uitat parola?**: sends a reset email; the link opens the app in "Alege o parolă nouă" mode.
- If "Confirm email" is on in Supabase, sign-up shows a message to confirm the address first.

Scores: when a trivia round ends with a new best score, it is sent with `save_place_score(p_place_id, p_score)`, where `p_place_id` is the location id from the CSV (e.g. `college`, text). On a device with no saved progress for that account, places with a score in `place_scores` count as finished, so the player continues where they left off. Trail progress itself (discovered / finished on this device) and own photos stay in the browser.

Supabase settings to check (Dashboard → Authentication → URL Configuration): set **Site URL** to where the app is hosted, and add the same address (and `http://localhost:8000/` for testing) to **Redirect URLs**, otherwise confirmation and reset links won't return to the app.
