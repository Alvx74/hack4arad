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
js/auth.js              username sign-in (swap for real accounts here)
js/store.js             per-user saved progress, scores and photos
js/data.js              loads and validates the CSV database
js/csv.js               CSV parser
js/map.js               Leaflet map wrapper (pins, route line, user dot)
js/routing.js           walking directions (OSRM)
js/photos.js            photo lookup (own photo → CSV photo → Wikipedia placeholder)
js/geo.js               distance and formatting helpers
data/path.csv           trail order
data/locations/<id>.csv one file per location
data/trivia/<id>.csv    one file per location's trivia questions
assets/photos/          drop real photos here
vendor/leaflet/         map library (BSD-2 licence)
```

## Adding a location

1. Copy `data/locations/_template.csv` to `data/locations/<id>.csv` and fill it in. The `id` inside the file should match the file name.
2. Copy `data/trivia/_template.csv` to `data/trivia/<id>.csv` and write the questions.
3. Add a row to `data/path.csv` with its position in the trail. Reordering the trail is just changing the `order` numbers.

Edit the CSVs in any spreadsheet app (save as CSV, UTF-8) or a text editor.

### Location columns

| column | meaning |
|---|---|
| `id` | short unique name, also the file name (`cityhall`) |
| `name` | full name shown once discovered |
| `short_name` | label next to the map pin |
| `category` | free-form grouping, e.g. `heritage`, `landmark`, `food` |
| `kind` | subtitle shown in the app, e.g. `Landmark · Civic building` |
| `address` | street address |
| `lat`, `lon` | coordinates in decimal degrees |
| `hint` | clue shown while the stop is still a shadow |
| `photo` | path or URL of a real photo, e.g. `assets/photos/cityhall.jpg`. Leave empty to use the Wikipedia placeholder |
| `photo_credit` | caption / credit for that photo |
| `wikipedia` | `lang:Article_Title` used for the placeholder photo, e.g. `en:Arad_Administrative_Palace` |
| `description` | the commentary. Put an empty line between paragraphs (keep the whole field in double quotes) |

### Trivia columns

`question, option_a, option_b, option_c, option_d, correct, explanation`. `correct` is the letter of the right option (`A`–`D`). Leave `option_c`/`option_d` empty for fewer answers. Any number of rows per location.

A location with no trivia file completes as soon as it's discovered.

## Trail rules

- Directions always point at the first unfinished stop on the path (stop 1 for a new user).
- A stop is discovered when you're within the interaction radius (300 m by default, see `js/config.js`).
- The trail only moves on once that stop's trivia has been answered to the end; the route then switches to the next stop automatically.
- Finished stops can be revisited from the list; "Înapoi la traseu" returns to the current stop.

## Developer tools

At the bottom of the app page there is a collapsed **ADVANCED** tab with testing tools: the interaction radius slider and a simulated position (tap the map or jump straight to a stop). It is intentionally in English; everything else visitors see is Romanian.

## Design

Colours come from the Arad coat of arms (`assets/brand/stema-arad.png`): blue, red, gold and oak-leaf green, defined as variables at the top of `css/styles.css` (map colours in `js/config.js`). Change them there for aesthetic tweaks.

## Photos

For each stop the app shows, in order: a photo the user added on their device, the `photo` from the CSV, or the lead image of the stop's Wikipedia article as a placeholder. To replace a placeholder, put the file in `assets/photos/` and set the `photo` and `photo_credit` columns. Only use photos you have the rights to.

## Accounts

Sign-in is username-only and stored in the browser (`js/auth.js`, `LocalUsernameAuth`). To move to real accounts, write a class with the same four methods (`getCurrentUser`, `signIn`, `signOut`, `knownUsers`) and export it as `auth`; then point `js/store.js` at your backend if progress should sync across devices.
