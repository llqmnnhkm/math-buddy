# Math Buddy: Plan and Architecture

## Goals

* Maths practice for **5 year olds** and **Standard 5** pupils (KSSR Semakan 2017, Year 5)
* English content
* Used at home with parents: no login, progress saved on the device
* Fun first: it should feel like games, not worksheets

## Stack

**Phase 1 (current):** an offline PWA with no server

* Vanilla JS (ES modules), no build step, hosted on GitHub Pages
* localStorage for profiles and progress (can move to IndexedDB with Dexie.js if data grows)
* Web Speech API for read aloud, Web Audio for sound effects
* Service worker for offline use

**Phase 2 (optional):** Laravel + Filament

* Parent accounts and syncing across devices
* Admin panel to manage content, word problems and rewards

## App flow

```
Start → Choose or create child profile (name + avatar)
      → Mode: Little Learners (Age 5) or Standard 5
      → Topic map (islands) → Game → Stars + rewards
Parent corner (behind a maths gate) → progress per child, reset, delete
```

## Curriculum map

### Little Learners (Age 5)

| Skill | Status |
|---|---|
| Counting 1 to 20 (Count With Me) | ✅ Done |
| Number recognition (Pop the Balloon) | ✅ Done |
| Adding and taking away within 10 (Add It Up) | ✅ Done |
| Shapes: circle, square, triangle, rectangle (Shape Hunt) | ✅ Done |
| Matching and sorting | Planned |
| Patterns (Pattern Train) | Planned |
| More, less, same (More or Less) | ✅ Done |
| Comparing length and weight | Planned |
| Malaysian coins (Corner Shop) | ✅ Done |

### Standard 5 (KSSR Year 5)

| KSSR topic | Skill | Status |
|---|---|---|
| 1. Whole numbers and operations | Speed Round, Round the Rocket | ✅ Done |
| 2. Fractions, decimals and percentages | Pizza Fractions | ✅ Done |
| 3. Money | Night Market | ✅ Done |
| 4. Time | Time Travel (decades, centuries) | ✅ Done |
| 5. Measurement (length, mass, volume) | Planned | Planned |
| 6. Space (angles, polygons, perimeter, area, volume) | Planned | Planned |
| 7. Coordinates, ratio and proportion | Treasure Map | Planned |
| 8. Data handling | Planned | Planned |

## Question engine

Each skill is a generator: `generate(level)` returns `{ prompt, speak, visual, answer, choices, explanation }`.
This gives endless practice without writing a question bank by hand.

**Adaptive levels (1 to 3):** move up after 4 of the last 5 correct, and down after 2 wrong in a row.
This keeps children winning about 80% of the time.

**Game types:** `choice` (tap an answer), `balloon` (tap the floating balloon), `speed` (60 second number pad round).

## Making it fun

* **Kiko the cat** cheers, gives hints and reacts to every answer
* **Instant feedback:** sounds, bounce and confetti; gentle wobble for wrong answers, never a harsh buzzer
* **Short rounds:** 5 questions for age 5, 10 for Standard 5
* **Hints, not failure:** after 2 wrong tries, show the explanation and highlight the answer
* **Rewards:** stars, a sticker book (10 stars per sticker), badges
* **Daily streak:** forgiving, so one missed day does not reset it
* **Own art style, no emoji:** drawn animals and items in Kiko's style, ten frames for counting, Phosphor line icons
* **Local context:** night market food like roti canai, teh tarik, ringgit and sen, Malaysian names

## Data model (localStorage, key `mathbuddy:v1`)

```
profiles[]: id, name, avatar, mode, stars, totalStars, stickers[], badges[],
            streak { count, last }, best { skillId: score },
            skills { skillId: { level, attempts, correct, recent[], wrongRun, mastery, last } },
            sessions[] { id, correct, total, stars, at }
current: active profile id
```

## Roadmap

1. ✅ Core: profiles, modes, map, adaptive engine, rewards, PWA
2. ✅ First 4 games per mode
3. Remaining Little Learners skills (patterns, sorting, comparing length and weight)
4. Remaining Standard 5 topics (measurement, space, coordinates, data)
5. More game types: drag and drop, Pattern Train, Treasure Map grid
6. ✅ Mystery eggs, combo meter, boss battles, Kiko's Closet
7. 2 player "Race a parent" mode
8. Optional Laravel + Filament backend for accounts and sync
