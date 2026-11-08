# Arad Explorer

A GPS walking trail through Arad. Each stop is a shadow on the map until you get close; then it reveals its story, photos and a short trivia round. Finishing the trivia sends you on to the next stop.

## Running it

The app is served over **HTTPS**: phones only allow GPS on HTTPS pages, and Supabase sign-in links should return to an HTTPS address.

```bash
python3 serve.py
# on this computer:  https://localhost:8443
# on your phone:     https://<your-computer's-IP>:8443   (same Wi-Fi; the address is printed)
```

Typing just `localhost:8443` also works: plain HTTP on that port is redirected to HTTPS.

`serve.py` needs only Python 3 (3.8 or newer) and the `openssl` command. The first run creates a local certificate in `.certs/` (not committed). Browsers warn once because it is self-signed: choose *Advanced → Proceed* (Chrome) or *Accept the risk* (Firefox). If your computer's IP changes, run `python3 serve.py --new-cert`.

If something goes wrong:

| What you see | What to do |
|---|---|
| Browser: "Your connection is not private" / `NET::ERR_CERT_AUTHORITY_INVALID` | Normal for a local certificate: *Advanced → Proceed to localhost*. Firefox: *Advanced → Accept the risk*. |
| Terminal: "The browser has not accepted the local certificate yet" | Same as above, it disappears once you proceed. |
| Terminal: "port 8443 is already in use" | Another `serve.py` is running: close it (Ctrl+C in its terminal) or run `python3 serve.py --port 9443`. |
| Terminal: "openssl was not found" | `sudo apt install openssl` |
| Phone can't connect | Same Wi-Fi as the computer; use the "on your phone" address the terminal prints; if your IP changed: `python3 serve.py --new-cert`. Some firewalls need port 8443 allowed (`sudo ufw allow 8443/tcp`). |

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
js/minigame.js          loads the game (js/game/) the first time "Joc interactiv" is opened
js/game/                Aradul Pixelat, the pixel-art side-scroller (see below)
css/game.css            the game's frame and panel styles
js/photos.js            photo lookup (own photo → CSV photo → Wikipedia placeholder)
js/geo.js               distance and formatting helpers
data/game-data.json     three selectable routes, 31 locations, trivia and 10 side quests
assets/photos/          drop real photos here
vendor/leaflet/         map library (BSD-2 licence)
```

## Game data

The current game catalogue lives in `data/game-data.json`.

- `routes` defines the three route choices shown after sign-in. Each route has an ordered `locationIds` list.
- `places` contains the location details and trivia: three questions for every route stop and one for every side quest, taken from the team's final lists in `data/source/` (Locatii_Importante.txt, SideQuest.txt). Answer positions are mixed, so the right answer isn't always first.
- Questions marked `placeholder: true` are intentionally unfinished. The stop shows the draft question and a "Continuă la oprirea următoare" button, which finishes the stop and routes to the next one like a completed quiz.
- `sidequests` contains the independent side-quest location IDs and categories. Side quests appear separately and unlock when the player's GPS position enters the interaction radius. Completing one does not advance the main route.
- Each place needs a unique `id`, a display name, and decimal-degree `lat` / `lon` coordinates.

**Coordinate note:** some newly added locations currently have provisional coordinates or addresses and should be checked on-site before the game is published. The catalogue includes a `coordinate_note` field to flag this.

To add a question, add an object to that place's `trivia` array with `q`, `o` (answer options), `a` (zero-based correct option index), and optional `e` (explanation). Replace a placeholder object once the question is ready.

## Trail rules

- Finishing the last stop of a route opens a congratulations screen (confetti, stops visited, correct answers) with "Începe un traseu nou", which opens the route picker.

- After sign-in, the player chooses one of the three routes. Directions point at the first unfinished stop on that selected route.
- A main-route stop is discovered when you're within the interaction radius (72 m by default; the testing slider goes up to 300 m, see `js/config.js`). Side quests are always on the map as unnamed gold stars; their name, story and questions (and their entry in the list) only appear while you are within that radius. They can be done in any order and don't move the main route on.
- The chosen route is remembered per account on the device; "Schimbă traseul" in the account menu opens the route picker again.
- The trail only moves on once that stop's trivia has been answered to the end; the route then switches to the next stop automatically.
- Walking directions start from wherever you are: a dotted line leads to the nearest street, then the solid line follows streets. The route is planned once and followed; it is only re-planned when you stray from it (35–90 m depending on GPS accuracy).
- Finished stops can be revisited from the list; "Înapoi la traseu" returns to the current stop.

## Developer tools

At the bottom of the app page there is a collapsed **ADVANCED** tab with testing tools: the interaction radius slider and a simulated position (tap the map or jump straight to a route stop or side quest). It is intentionally in English; everything else visitors see is Romanian.

## Layout (mobile first)

`css/styles.css` is written for phones first; one block at the end (**DESKTOP**) extends it for wide screens.

- **Phone** (≤ 760 px wide, or portrait up to 1024 px): the map fills the screen under the header. Progress is a chip at the top, the next-stop card floats above a bottom bar (tap its handle for all directions), and the bottom bar opens pop-up panels: **Opriri**, **Misiuni** (with a badge when a side quest is nearby) and **Avansat** (the dev tools).
- **Desktop**: the same full-screen map, and the three pop-up panels plus the next-stop card become a fixed sidebar on the right, so the bottom bar disappears.

The breakpoint is defined twice and must match: the DESKTOP query in `css/styles.css` is the exact opposite of `MOBILE_MQ` in `js/app.js`.

## Dark mode

The moon/sun button in the header switches themes; the choice is saved in the browser (`arad-explorer:theme`). Without a choice, the app follows the device setting. Dark mode uses a black background; its colours are the `:root[data-theme="dark"]` block in `css/styles.css`; the map uses CARTO's dark tiles and lighter route colours (`MAP_COLORS_DARK` in `js/config.js`).

## Design

Simple and square: Roboto everywhere (17 px base on phones, 18 px on desktop), large bold titles, rounded-square buttons and no shadows. Every edge is a 2 px border in the colour opposite to its fill: light surfaces get a dark border, coloured fills get a white border with a ring in their own colour, and dark mode flips them. Surfaces over the map and the login sky are see-through (blurred), with an opaque fallback for browsers without blur. Neutral buttons swap to the opposite colours on hover. Colours are muted versions of the Arad coat of arms (`assets/brand/stema-arad.png`): blue `#3c4a8f`, red `#b53a3c`, gold `#d6ab45`, green `#4d7a4f`, also shown as the four-colour stripe under the header. They are variables at the top of `css/styles.css` (map colours in `js/config.js`, confetti in `js/confetti.js`, login sky in `js/sky.js`).

- `js/sky.js`: the login background, drifting "constellations" that react to the mouse or finger (one still frame if the device asks for reduced motion).
- `js/tour.js`: the walkthrough shown the first time a player opens **Vizionare pe viu**; "Cum se joacă" in the account menu replays it.
- After sign-in the dashboard has two tiles: **Vizionare pe viu** (GPS map) and **Joc interactiv** (the game below).

## Ghizi locali (chat with Grok)

The red message button in the bottom-right corner (after sign-in) opens a small messaging app: "Ai nevoie de un tur al orașului?" → **Doresc un ghid** shows the five guides like a messenger while it searches for about 5 seconds → one guide is picked at random → choose Traseul 1, 2 or 3 → chat with that guide. The guide writes first, introduces themself and suggests the hours they are free (two today if there's still time, two tomorrow; also shown as quick-reply chips); the player writes anything in the text box. The guide confirms a time with the end time, or says they're busy and suggests their free hours. It is a demo: nothing is really booked.

The answers come from an AI model through a Supabase Edge Function, `supabase/functions/guide-chat`: **Google Gemini (free tier)** when the secret `GEMINI_API_KEY` is set (key from https://aistudio.google.com/apikey, model `gemini-flash-latest`, change with `GEMINI_MODEL`), otherwise **Grok (xAI, paid)** with `XAI_API_KEY` (`GROK_MODEL`, default `grok-latest`). Free-tier Gemini prompts may be used by Google to improve its products, so don't type personal data in the chat. The key is a Supabase secret and never reaches the browser or this repository. Each guide's name and personality are defined in that function (on the server):

| Guide | Personality |
|---|---|
| Gheorghe Ardelean, 63 | retired historian, calm and a little solemn, precise dates and anecdotes |
| Andrei Bălan, 38 | energetic storyteller, jokes, Arad's legends, the odd emoji |
| Ioana Crișan, 31 | architect, organised, façades and building styles |
| Radu Popa, 34 | relaxed, friendly, short answers, a bit of English |
| Dan Mureșan, 56 | hiker and nature lover, the Mureș bank and parks, practical tips |

**One-time setup** (needs the [Supabase CLI](https://supabase.com/docs/guides/cli) and access to the project):

```bash
supabase login
supabase functions deploy guide-chat --project-ref scplcjroxictdslyrfez
supabase secrets set GEMINI_API_KEY=<key from aistudio.google.com/apikey> --project-ref scplcjroxictdslyrfez
# or, paid: supabase secrets set XAI_API_KEY=<Grok key> --project-ref scplcjroxictdslyrfez
```

Or in the dashboard: *Edge Functions → Deploy a new function → Via Editor* with the contents of `index.ts`, and *Edge Functions → Secrets* → `GEMINI_API_KEY` (or `XAI_API_KEY`). It is currently deployed as **`rapid-handler`**; the name the site calls is `FUNCTION_NAME` in `database/guide-chat.js`. Only signed-in players can call it. Until it is deployed, the chat shows "Chatul cu ghizii nu este încă activat pe server." Never put the key in the site's code: the repository and the site are public.

Code: `js/guides.js` (the app), `database/guide-chat.js` (calls the function), `css/guides.css`, photos in `assets/guides/`.

Tour length (side quests not included): the walking distance between the route's stops on real streets (OSRM foot router), walked at a guided-group pace of 3.5 km/h, plus 10 minutes at each stop.

| Route | Stops | Distance | Time |
|---|---|---|---|
| Traseul 1 | 7 | 2,06 km | 1 h 46 min |
| Traseul 2 | 7 | 2,23 km | 1 h 49 min |
| Traseul 3 | 6 | 2,83 km | 1 h 49 min |

## Joc interactiv: Aradul Pixelat

A pixel-art side-scroller through the three routes: dress your character in the wardrobe, pick a route on the stylised map, walk the street, talk to locals and answer three questions per place to earn its badge (at least 2 correct). Keyboard: ← → / A D walk, Shift run, E talk or enter, M map, 1–4 answer. Phones and tablets get touch buttons.

At the start of each route a ghost of the person the street is named after (General Ion Dragalina, Avram Iancu, Aurel Vlaicu) tells who they were, why they matter to Arad and why the street carries their name.

It is loaded only when the tile is opened, and pauses (no drawing loop, no keyboard listeners) when you leave the screen. Progress is saved in the browser under `aradPixelat_v2`.

```
js/game/index.js       mount(root) / unmount(): builds the screen, loads the two pixel fonts
js/game/game.js        state, panels (wardrobe, map, hints, dialogue, quiz), input, loop
js/game/core.js        canvas size and the shared drawing target / frame counter
js/game/font.js        3×5 pixel font for text drawn on the canvas
js/game/draw.js        windows, roofs, trees, lamps and other small drawing helpers
js/game/people.js      characters, costumes and NPCs
js/game/outfit.js      wardrobe options and the saved progress
js/game/locations.js   the 20 places and the game's own questions
js/game/landmarks.js   the buildings, drawn from photos
js/game/streets.js     the three routes as walkable streets
js/game/patrons.js     the ghosts at the start of each route: Dragalina, Avram Iancu, Aurel Vlaicu
js/game/interiors.js   rooms you can walk into
```

The title, HUD, screen frame and touch buttons use the site's theme; the panel under the screen keeps the game's own pixel look. The game keeps its own question texts (`locations.js`), separate from `data/game-data.json`.

## Photos

Each place's `photo` field in `data/game-data.json` can be:

- `commons:File name.jpg` – a free-licensed photo on Wikimedia Commons. The app asks Commons for a 960 px version and shows the author and licence under the photo (linked to the file page), which is what CC BY / CC BY-SA require.
- a path like `assets/photos/place.jpg` or any image URL, with the credit in `photoCredit`.

The team's own photos live in `assets/photos/<place-id>.jpg` (max 1280 px, JPEG). Leave the field empty and the stop shows "Încă nu avem o fotografie" with a link to search for one. Don't hotlink photos from Google Images: they are copyrighted. Use Commons, your own photos, or ones you have permission for.

## Leaderboard and first blood

After signing in, players land on a dashboard with two choices: **Explorează orașul** (the GPS map) and **Minijoc**. The header has **Clasament** (leaderboard).

Scoring: each place counts with the player's best score there (1 point per correct answer). If the player's **first** attempt at a place had every answer right, that place is a **first blood** and counts double. The leaderboard shows rank, player, first bloods and score; it is sorted by score, with a "First blood" toggle that sorts by first bloods instead.

**One-time setup:** run `database/leaderboard.sql` in Supabase → SQL Editor (safe to run again after updates). Every account appears on the leaderboard, with 0 points until it finishes a stop. It creates the `place_results` table (players can only read their own rows), `record_place_result()` (called after every finished quiz; the first call for a place decides first blood) and `get_leaderboard()` (names and totals only, no e-mails). Until it is run, the leaderboard screen says it isn't set up yet and the rest of the app works normally. Results from before the setup are not counted.

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
- **Continuă cu Google** (on both tabs; "Creează cont cu Google" on *Cont nou*): one button creates the account the first time and signs in afterwards. The player's Google name is shortened to a valid display name (first name if the full name is over 24 characters) and saved as `display_name`, so the leaderboard shows it.
- **Ai uitat parola?**: sends a reset email; the link opens the app in "Alege o parolă nouă" mode.
- If "Confirm email" is on in Supabase, sign-up shows a message to confirm the address first.

Scores: when a trivia round ends with a new best score, it is sent with `save_place_score(p_place_id, p_score)`, where `p_place_id` is the location id from the CSV (e.g. `college`, text). On a device with no saved progress for that account, places with a score in `place_scores` count as finished, so the player continues where they left off. Trail progress itself (discovered / finished on this device) and own photos stay in the browser.

**Google sign-in setup (one time):**

1. Google Cloud Console → *APIs & Services* → *OAuth consent screen*: app name "Arad Explorer", your support email, publish it (or add testers).
2. *Credentials* → *Create credentials* → *OAuth client ID* → *Web application*. Under **Authorised redirect URIs** add `https://scplcjroxictdslyrfez.supabase.co/auth/v1/callback`.
3. Supabase → *Authentication* → *Sign In / Providers* → **Google**: turn it on, paste the Client ID and Client Secret, save.
4. Make sure the app's address (and `https://localhost:8443/`) is in Supabase's **Redirect URLs** (below).

Until this is done the button shows "Conectarea cu Google nu este activată încă pe server." and email accounts keep working.

Supabase settings to check (Dashboard → Authentication → URL Configuration): set **Site URL** to where the app is hosted, and add the same address (and `https://localhost:8443/` for testing) to **Redirect URLs**, otherwise confirmation and reset links won't return to the app.
