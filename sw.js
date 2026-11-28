// Offline support: cache the app shell, serve from cache first.
// Bump VERSION whenever you change any file. Phones then download the new
// version in the background and show "Update ready. Tap to restart".
const VERSION = 'mathbuddy-v11';
const FILES = [
  './', './index.html', './styles.css', './manifest.json',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
  './src/main.js', './src/db.js', './src/engine.js', './src/audio.js', './src/fx.js',
  './src/icons.js', './src/art.js', './src/creatures.js', './src/column.js', './src/skills/index.js', './src/skills/util.js',
  './src/skills/pre_count.js', './src/skills/pre_balloon.js', './src/skills/pre_add.js', './src/skills/pre_shapes.js',
  './src/skills/y5_speed.js', './src/skills/y5_fractions.js', './src/skills/y5_rounding.js', './src/skills/y5_money.js',
  './src/skills/pre_compare.js', './src/skills/pre_coins.js', './src/skills/y5_time.js',
];

self.addEventListener('install', e => {
  // cache: 'reload' skips the browser's HTTP cache so we never save an old file.
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))));
});

// The page asks for this when the child taps the update banner.
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    })),
  );
});
