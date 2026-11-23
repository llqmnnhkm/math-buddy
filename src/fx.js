// Kiko the cat mascot (with outfits from the closet) and the confetti burst.
const INK = '#2d2a32';

const CAT = `
  <polygon points="22,38 30,8 50,30" fill="#f6a04d"/><polygon points="98,38 90,8 70,30" fill="#f6a04d"/>
  <polygon points="27,32 31,16 43,29" fill="#ffd1dc"/><polygon points="93,32 89,16 77,29" fill="#ffd1dc"/>
  <ellipse cx="60" cy="62" rx="44" ry="40" fill="#f6a04d"/>
  <ellipse cx="60" cy="78" rx="26" ry="20" fill="#fff3e0"/>
  <g class="eyes"><ellipse cx="44" cy="56" rx="6" ry="8" fill="${INK}"/><ellipse cx="76" cy="56" rx="6" ry="8" fill="${INK}"/>
  <circle cx="46" cy="53" r="2" fill="#fff"/><circle cx="78" cy="53" r="2" fill="#fff"/></g>
  <polygon points="56,70 64,70 60,75" fill="#e8607a"/>
  <path d="M60 75 q-6 7 -12 2 M60 75 q6 7 12 2" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="34" cy="70" r="6" fill="#ff9aa2" opacity=".6"/><circle cx="86" cy="70" r="6" fill="#ff9aa2" opacity=".6"/>
  <path d="M20 66 h-14 M20 72 h-12 M100 66 h14 M100 72 h12" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;

/* ---------- Kiko's closet ---------- */
// Each item is drawn in Kiko's own coordinates (head centre 60,62).

export const OUTFITS = [
  // Backgrounds sit behind Kiko
  { id: 'bg_sky', slot: 'bg', name: 'Sky', price: 15, svg: '<circle cx="60" cy="62" r="64" fill="#bfe6ff"/><circle cx="24" cy="30" r="10" fill="#fff"/><circle cx="34" cy="26" r="12" fill="#fff"/><circle cx="96" cy="100" r="9" fill="#fff"/>' },
  { id: 'bg_rainbow', slot: 'bg', name: 'Rainbow', price: 30, svg: '<circle cx="60" cy="62" r="64" fill="#ff8fab"/><circle cx="60" cy="62" r="56" fill="#ffd23f"/><circle cx="60" cy="62" r="48" fill="#8fe08a"/><circle cx="60" cy="62" r="40" fill="#7fd1ff"/>' },
  { id: 'bg_space', slot: 'bg', name: 'Space', price: 40, svg: `<circle cx="60" cy="62" r="64" fill="#2e2a5c"/>${[[18, 30], [100, 24], [26, 100], [96, 96], [60, 0], [8, 64], [112, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="#fff"/>`).join('')}<circle cx="102" cy="36" r="8" fill="#ffd23f"/>` },
  { id: 'bg_sunset', slot: 'bg', name: 'Sunset', price: 25, svg: '<circle cx="60" cy="62" r="64" fill="#ffb38a"/><path d="M-4 70 A64 64 0 0 0 124 70Z" fill="#ff7a8a"/>' },
  // Hats
  { id: 'hat_party', slot: 'hat', name: 'Party hat', price: 15, svg: '<polygon points="60,-24 42,22 78,22" fill="#7fd1ff"/><path d="M52 2 L68 6 M48 12 L72 16" stroke="#ff8fab" stroke-width="5"/><circle cx="60" cy="-24" r="7" fill="#ffd23f"/>' },
  { id: 'hat_crown', slot: 'hat', name: 'Crown', price: 40, svg: '<path d="M36 24 L38 -6 L50 10 L60 -12 L70 10 L82 -6 L84 24Z" fill="#ffc83d"/><rect x="36" y="18" width="48" height="8" rx="3" fill="#e9a400"/><circle cx="60" cy="8" r="4" fill="#ff5d5d"/><circle cx="46" cy="12" r="3" fill="#4d96ff"/><circle cx="74" cy="12" r="3" fill="#6bcb77"/>' },
  { id: 'hat_cap', slot: 'hat', name: 'Cap', price: 20, svg: '<path d="M32 26 C32 0 88 0 88 26Z" fill="#ff5d5d"/><path d="M82 24 C96 22 110 24 112 28 L84 30Z" fill="#d94444"/><circle cx="60" cy="4" r="4" fill="#fff"/>' },
  { id: 'hat_wizard', slot: 'hat', name: 'Wizard hat', price: 35, svg: '<path d="M60 -28 C70 -10 80 6 88 24 L32 24 C40 6 50 -10 60 -28Z" fill="#7b5cff"/><rect x="26" y="18" width="68" height="8" rx="4" fill="#5a3fd6"/><path d="M56 -2 l2 5 5 0 -4 3 2 5 -5 -3 -5 3 2 -5 -4 -3 5 0z" fill="#ffd23f"/><circle cx="70" cy="10" r="2.5" fill="#ffd23f"/>' },
  { id: 'hat_bow', slot: 'hat', name: 'Bow', price: 15, svg: '<path d="M84 22 L70 12 L72 32Z M84 22 L98 12 L96 32Z" fill="#ff6fae"/><circle cx="84" cy="22" r="5" fill="#e0408a"/>' },
  // Glasses
  { id: 'gl_round', slot: 'glasses', name: 'Round glasses', price: 15, svg: `<circle cx="44" cy="56" r="12" fill="#fff" fill-opacity=".25" stroke="${INK}" stroke-width="3"/><circle cx="76" cy="56" r="12" fill="#fff" fill-opacity=".25" stroke="${INK}" stroke-width="3"/><path d="M56 56 Q60 52 64 56" stroke="${INK}" stroke-width="3" fill="none"/>` },
  { id: 'gl_sun', slot: 'glasses', name: 'Sunglasses', price: 25, svg: `<path d="M28 48 H58 V58 Q58 68 46 68 H40 Q28 68 28 58Z M62 48 H92 V58 Q92 68 80 68 H74 Q62 68 62 58Z" fill="${INK}"/><path d="M58 52 H62" stroke="${INK}" stroke-width="3"/><path d="M33 52 L40 52" stroke="#fff" stroke-width="2.5" opacity=".6" stroke-linecap="round"/>` },
  { id: 'gl_star', slot: 'glasses', name: 'Star glasses', price: 30, svg: [44, 76].map(x => `<path d="M${x} 42 l4 9 10 1 -7.5 6.5 2.5 10 -9 -5.5 -9 5.5 2.5 -10 -7.5 -6.5 10 -1z" fill="#ff6fae" fill-opacity=".85" stroke="#e0408a" stroke-width="2" stroke-linejoin="round"/>`).join('') + '<path d="M54 56 H66" stroke="#e0408a" stroke-width="3"/>' },
  // Neck
  { id: 'nk_bowtie', slot: 'neck', name: 'Bow tie', price: 15, svg: '<path d="M60 104 L44 96 L44 112Z M60 104 L76 96 L76 112Z" fill="#ff5d5d"/><circle cx="60" cy="104" r="5" fill="#d94444"/>' },
  { id: 'nk_scarf', slot: 'neck', name: 'Scarf', price: 20, svg: '<path d="M28 94 Q60 112 92 94 L94 104 Q60 122 26 104Z" fill="#4d96ff"/><path d="M74 108 L80 128 L90 126 L84 106Z" fill="#3a7be0"/><path d="M36 100 L40 108 M50 104 L52 112 M66 104 L66 112" stroke="#fff" stroke-width="3" opacity=".6"/>' },
  { id: 'nk_medal', slot: 'neck', name: 'Gold medal', price: 35, svg: '<path d="M46 96 L56 116 M74 96 L64 116" stroke="#4d96ff" stroke-width="6"/><circle cx="60" cy="118" r="9" fill="#ffc83d"/><path d="M60 113 l1.8 3.6 4 .6 -2.9 2.8 .7 4 -3.6 -1.9 -3.6 1.9 .7 -4 -2.9 -2.8 4 -.6z" fill="#e9a400"/>' },
];

export const SLOTS = [
  { id: 'hat', name: 'Hats' },
  { id: 'glasses', name: 'Glasses' },
  { id: 'neck', name: 'Neck' },
  { id: 'bg', name: 'Backgrounds' },
];

let currentOutfit = {};
/** Set what Kiko is wearing for the active player. */
export const setOutfit = o => { currentOutfit = o || {}; };

const part = id => OUTFITS.find(x => x.id === id)?.svg || '';

/** Kiko with an outfit. */
export const kikoSvg = (outfit = currentOutfit) =>
  `<svg viewBox="-12 -32 144 166" aria-hidden="true">${part(outfit.bg)}${CAT}${part(outfit.neck)}${part(outfit.glasses)}${part(outfit.hat)}</svg>`;

export const mascot = (text, cls = '') =>
  `<div class="mascot ${cls}"><div class="kiko">${kikoSvg()}</div><div class="bubble" aria-live="polite">${text}</div></div>`;

export function mascotSay(text, mood) {
  const m = document.querySelector('.mascot');
  if (!m) return;
  m.querySelector('.bubble').innerHTML = text;
  const k = m.querySelector('.kiko');
  k.classList.remove('happy', 'oops', 'dance');
  void k.offsetWidth; // restart the animation
  if (mood) k.classList.add(mood);
}

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function confetti() {
  if (reduced()) return;
  const c = document.createElement('canvas');
  c.className = 'confetti';
  c.width = innerWidth;
  c.height = innerHeight;
  document.body.appendChild(c);
  const g = c.getContext('2d');
  const cols = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9f1c'];
  const ps = Array.from({ length: 150 }, () => ({
    x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.5,
    vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4,
    r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3,
    w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
    col: cols[Math.floor(Math.random() * cols.length)],
  }));
  const start = performance.now();
  (function frame(t) {
    g.clearRect(0, 0, c.width, c.height);
    for (const p of ps) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.r += p.vr;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r);
      g.fillStyle = p.col; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      g.restore();
    }
    if (t - start < 3200 && c.isConnected) requestAnimationFrame(frame); else c.remove();
  })(start);
}
