# Math Buddy 🐱

A fun maths practice web app for two age groups, guided by **Kiko the cat**:

* **Little Learners (Age 5):** counting, number recognition, adding and taking away, shapes, more and fewer, Malaysian coins
* **Standard 5 (KSSR Year 5):** whole number operations, rounding to 1 000 000, fractions, decimals and percentages, money, decades and centuries

It is an offline first PWA with no login. Progress is saved on the device, and it can be installed to a phone or tablet home screen.

## Features

* Two modes with their own look, picked per child profile
* 11 games: Count With Me, Pop the Balloon, Add It Up, Shape Hunt, More or Less, Corner Shop, Speed Round, Round the Rocket, Pizza Fractions, Night Market, Time Travel
* Questions are generated on the fly, so practice never runs out
* Adaptive levels (1 to 6) on every island: up after 4 of the last 5 correct, down after 2 wrong in a row
* Read aloud for every question (Web Speech API), plus sound effects made with Web Audio (no audio files)
* Stars, a sticker book, badges, a forgiving daily streak and confetti
* **Mystery eggs:** every round cracks the egg; it hatches into one of 12 original creatures to collect
* **Combo meter:** 3 right in a row turns on x2 (bonus stars); every 5 in a row Kiko dances
* **Boss battles:** reach level 3 on an island to fight its boss (3 hearts, win a trophy and 15 stars)
* **Kiko's Closet:** spend stars on hats, glasses, neckwear and backgrounds for Kiko
* Hints after 2 wrong tries, with the correct answer highlighted
* No emoji: hand drawn SVG art in Kiko's style (avatars, counting items, stickers), ten frame counters for counting and adding, and Phosphor line icons for the interface
* Parent corner behind a simple maths gate: progress per skill, weekly summary, reset and delete, and a backup file to save and restore progress (for a new phone or after clearing the browser)

## Run locally

No build step. Serve the folder with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from disk will not work, because ES modules need a server.

Tests run with Node 22 or newer: `node test/column.test.mjs` (Speed Round answer boxes) and `node test/skills.test.mjs` (every island's questions, backup files, streaks). No output means they passed.

## Deploy to GitHub Pages

1. Push to GitHub.
2. Go to **Settings → Pages**, set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The app will be live at `https://<username>.github.io/math-buddy/`.

After changing any file, bump `VERSION` in `sw.js`. Installed copies download the new version in the background and show an "Update ready. Tap to restart" banner (never in the middle of a game).

## Project structure

```
index.html        App shell
styles.css        All styles (mode themes, animations)
manifest.json     PWA manifest
sw.js             Service worker (offline cache)
icons/            App icons
src/
  main.js         Screens: profiles, mode select, map, games, results, stickers, parent corner
  db.js           localStorage wrapper for profiles and progress
  engine.js       Adaptive levels, stars, streaks, stickers, badges
  audio.js        Read aloud and sound effects
  fx.js           Kiko mascot and confetti
  art.js          Drawn animals, counting items, ten frames, stickers
  creatures.js    Hatchable creatures, eggs and island bosses
  icons.js        Bundled Phosphor icons (MIT)
  skills/         One file per skill (question generator)
docs/PLAN.md      Product plan, curriculum map and roadmap
```

## Adding a new skill

Create `src/skills/<id>.js`:

```js
export default {
  id: 'y5_measure',
  mode: 'y5',               // 'pre' or 'y5'
  name: 'Measure Up',
  topic: 'Measurement',
  icon: 'scales',           // a name from src/icons.js
  hue: 120,                 // island colour
  gameType: 'choice',       // 'choice' | 'balloon' | 'speed'
  generate(level) {         // level is 1 to 6
    return {
      prompt: 'How many grams are in 3 kilograms?',
      speak: 'How many grams are in 3 kilograms?', // optional, for read aloud
      visual: '',                                 // optional HTML
      answer: 3000,
      choices: [3000, 300, 30, 3003],             // or { html, value } objects
      explanation: '1 kilogram is 1 000 grams, so 3 kilograms is 3 000 grams.',
    };
  },
};
```

Then import it in `src/skills/index.js`, give it a boss in `BOSSES` in `src/creatures.js`, and add the file to the `FILES` list in `sw.js`. `test/skills.test.mjs` fails if the boss or the `FILES` entry is missing, and checks every question has exactly one right answer among its choices. `src/skills/y5_time.js` is a short example to copy.

## Credits

Interface icons: [Phosphor Icons](https://phosphoricons.com) (MIT License). All other art is original SVG drawn for this app.
