// Original creatures that hatch from eggs, plus the island bosses. Same flat style as Kiko.
const INK = '#2d2a32';

const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const c = v => Math.max(0, Math.min(255, v + amt));
  return `#${((c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).padStart(6, '0')}`;
};

function bodyPath(shape) {
  switch (shape) {
    case 'tall': return 'M60 14c22 0 34 20 34 46v34c0 10-8 16-18 16H44c-10 0-18-6-18-16V60c0-26 12-46 34-46z';
    case 'blob': return 'M60 22c26 0 44 18 44 44 0 26-16 44-44 44S16 92 16 66c0-26 18-44 44-44z';
    case 'pear': return 'M60 18c16 0 24 14 24 26 0 8 18 16 18 38 0 18-16 28-42 28S18 100 18 82c0-22 18-30 18-38 0-12 8-26 24-26z';
    default: return 'M60 20c28 0 46 20 46 46s-18 44-46 44-46-18-46-44 18-46 46-46z';
  }
}

function eyesSvg(count, y, angry = false) {
  const xs = count === 1 ? [60] : count === 2 ? [46, 74] : [40, 60, 80];
  const r = count === 1 ? 13 : 9;
  const brows = angry
    ? xs.map((x, i) => `<path d="M${x - r} ${y - r - 6} L${x + r} ${y - r - 6 + (i < xs.length / 2 ? 6 : -6)}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`).join('')
    : '';
  return xs.map(x => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x + 2}" cy="${y + 1}" r="${r * 0.5}" fill="${INK}"/><circle cx="${x + 4}" cy="${y - 2}" r="${r * 0.18}" fill="#fff"/>`).join('') + brows;
}

function topSvg(top, color) {
  const dark = shade(color, -40);
  switch (top) {
    case 'antenna': return `<path d="M48 26 L40 6 M72 26 L80 6" stroke="${dark}" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="6" r="6" fill="#ffd23f"/><circle cx="80" cy="6" r="6" fill="#ffd23f"/>`;
    case 'horns': return `<path d="M36 34 Q26 12 40 6 Q38 22 48 28Z M84 34 Q94 12 80 6 Q82 22 72 28Z" fill="#fff3d6"/>`;
    case 'leaf': return `<path d="M60 22 Q58 8 64 2" stroke="#4fb35f" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M63 6 Q80 -2 86 10 Q72 16 63 6Z" fill="#6bcb77"/>`;
    case 'spikes': return `<path d="M34 34 L40 14 L50 26 L60 8 L70 26 L80 14 L86 34Z" fill="${dark}"/>`;
    case 'tuft': return `<path d="M52 24 Q50 8 58 4 Q60 14 62 4 Q70 8 68 24Z" fill="${dark}"/>`;
    default: return '';
  }
}

function mouthSvg(kind, y) {
  switch (kind) {
    case 'teeth': return `<path d="M44 ${y} Q60 ${y + 16} 76 ${y}Z" fill="${INK}"/><rect x="51" y="${y}" width="6" height="5" fill="#fff"/><rect x="63" y="${y}" width="6" height="5" fill="#fff"/>`;
    case 'o': return `<ellipse cx="60" cy="${y + 4}" rx="6" ry="7" fill="${INK}"/><ellipse cx="60" cy="${y + 7}" rx="3.5" ry="3" fill="#ff8fab"/>`;
    case 'tongue': return `<path d="M46 ${y} Q60 ${y + 14} 74 ${y}" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M56 ${y + 6} Q60 ${y + 16} 64 ${y + 6}Z" fill="#ff8fab"/>`;
    default: return `<path d="M46 ${y} Q60 ${y + 12} 74 ${y}" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  }
}

/** Build a creature from parts. */
export function creatureSvg(c, { angry = false, crown = false } = {}) {
  const dark = shade(c.color, -35);
  const spots = c.spots
    ? `<circle cx="32" cy="80" r="6" fill="${dark}" opacity=".5"/><circle cx="90" cy="70" r="5" fill="${dark}" opacity=".5"/><circle cx="84" cy="94" r="4" fill="${dark}" opacity=".5"/>`
    : '';
  const crownSvg = crown
    ? '<path d="M40 22 L44 2 L54 14 L60 0 L66 14 L76 2 L80 22Z" fill="#ffc83d"/><circle cx="60" cy="10" r="3" fill="#ff5d5d"/>'
    : '';
  const eyeY = c.body === 'tall' ? 50 : 56;
  return `<svg class="art creature" viewBox="0 -6 120 126" role="img" aria-label="${c.name}">
    <ellipse cx="60" cy="112" rx="34" ry="5" fill="#000" opacity=".08"/>
    ${topSvg(c.top, c.color)}
    <ellipse cx="22" cy="82" rx="9" ry="13" fill="${dark}" transform="rotate(25 22 82)"/>
    <ellipse cx="98" cy="82" rx="9" ry="13" fill="${dark}" transform="rotate(-25 98 82)"/>
    <path d="${bodyPath(c.body)}" fill="${c.color}"/>
    <ellipse cx="60" cy="88" rx="24" ry="17" fill="${c.belly}" opacity=".9"/>
    ${spots}
    <ellipse cx="44" cy="110" rx="10" ry="6" fill="${dark}"/><ellipse cx="76" cy="110" rx="10" ry="6" fill="${dark}"/>
    ${eyesSvg(c.eyes, eyeY, angry)}
    ${mouthSvg(c.mouth, eyeY + 18)}
    <circle cx="30" cy="${eyeY + 14}" r="5" fill="#ff9aa2" opacity=".5"/><circle cx="90" cy="${eyeY + 14}" r="5" fill="#ff9aa2" opacity=".5"/>
    ${crownSvg}
  </svg>`;
}

export const CREATURES = [
  { id: 'bloop', name: 'Bloop', body: 'blob', color: '#7fd1ff', belly: '#e3f6ff', eyes: 2, top: 'none', mouth: 'smile', spots: false },
  { id: 'zibzab', name: 'Zibzab', body: 'tall', color: '#b98cff', belly: '#efe4ff', eyes: 3, top: 'antenna', mouth: 'teeth', spots: false },
  { id: 'momo', name: 'Momo', body: 'round', color: '#ff9ec4', belly: '#ffe6f0', eyes: 2, top: 'tuft', mouth: 'o', spots: false },
  { id: 'pip', name: 'Pip', body: 'pear', color: '#8fe08a', belly: '#e9fbe6', eyes: 1, top: 'leaf', mouth: 'smile', spots: false },
  { id: 'glim', name: 'Glim', body: 'round', color: '#ffd23f', belly: '#fff6cc', eyes: 1, top: 'antenna', mouth: 'tongue', spots: false },
  { id: 'toot', name: 'Toot', body: 'tall', color: '#ff8a5b', belly: '#ffe5d8', eyes: 2, top: 'horns', mouth: 'smile', spots: true },
  { id: 'fizz', name: 'Fizz', body: 'blob', color: '#4ad8c7', belly: '#dcfaf6', eyes: 3, top: 'spikes', mouth: 'smile', spots: false },
  { id: 'nubby', name: 'Nubby', body: 'pear', color: '#c9a27e', belly: '#f6e8da', eyes: 2, top: 'horns', mouth: 'teeth', spots: false },
  { id: 'wobbo', name: 'Wobbo', body: 'blob', color: '#6c8cff', belly: '#e2e8ff', eyes: 2, top: 'spikes', mouth: 'tongue', spots: true },
  { id: 'sprig', name: 'Sprig', body: 'tall', color: '#5cc98a', belly: '#e0f7ea', eyes: 2, top: 'leaf', mouth: 'o', spots: false },
  { id: 'dottie', name: 'Dottie', body: 'round', color: '#ff6b81', belly: '#ffe3e8', eyes: 2, top: 'none', mouth: 'smile', spots: true },
  { id: 'zoomer', name: 'Zoomer', body: 'pear', color: '#ffb347', belly: '#fff0d9', eyes: 3, top: 'tuft', mouth: 'tongue', spots: false },
];

export const creature = id => creatureSvg(CREATURES.find(c => c.id === id) || CREATURES[0]);

/** Mystery silhouette for creatures not hatched yet. */
export const silhouette = id => {
  const c = CREATURES.find(x => x.id === id) || CREATURES[0];
  return creatureSvg({ ...c, color: '#cfc9de', belly: '#cfc9de', spots: false }).replace('class="art creature"', 'class="art creature unknown"');
};

/* ---------- Eggs ---------- */

export function eggSvg(cracks, need) {
  const lines = [
    'M36 52 L46 60 L40 68 L50 74',
    'M84 46 L74 56 L82 62 L72 70',
    'M44 92 L54 86 L60 94 L68 86 L78 92',
    'M58 30 L62 40 L56 46',
  ];
  const shown = Math.round((Math.min(cracks, need) / need) * lines.length);
  return `<svg class="art egg" viewBox="0 0 120 130" role="img" aria-label="Mystery egg">
    <ellipse cx="60" cy="122" rx="30" ry="5" fill="#000" opacity=".08"/>
    <path d="M60 8C36 8 20 50 20 78c0 26 18 42 40 42s40-16 40-42C100 50 84 8 60 8z" fill="#fff6e0"/>
    <circle cx="44" cy="44" r="8" fill="#ffb3c7"/><circle cx="78" cy="70" r="11" fill="#9fd8ff"/>
    <circle cx="46" cy="96" r="7" fill="#b7ef9f"/><circle cx="70" cy="28" r="5" fill="#ffd23f"/>
    <ellipse cx="42" cy="34" rx="6" ry="12" fill="#fff" opacity=".7" transform="rotate(20 42 34)"/>
    ${lines.slice(0, shown).map(d => `<path d="${d}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
  </svg>`;
}

/* ---------- Island bosses ---------- */

export const BOSSES = {
  pre_count: { name: 'Count Grumble', color: '#ff7a59', body: 'round', eyes: 3, top: 'horns', mouth: 'teeth' },
  pre_balloon: { name: 'Captain Pop', color: '#ff6fae', body: 'blob', eyes: 1, top: 'spikes', mouth: 'teeth' },
  pre_add: { name: 'Sir Plus', color: '#55c271', body: 'tall', eyes: 2, top: 'horns', mouth: 'teeth' },
  pre_shapes: { name: 'Shapey Sue', color: '#f2b705', body: 'pear', eyes: 2, top: 'spikes', mouth: 'teeth' },
  y5_speed: { name: 'Turbo Tock', color: '#8a6cff', body: 'tall', eyes: 3, top: 'antenna', mouth: 'teeth' },
  y5_rounding: { name: 'Round Rex', color: '#3fa7e0', body: 'round', eyes: 2, top: 'spikes', mouth: 'teeth' },
  y5_fractions: { name: 'Slice Lord', color: '#f08a3c', body: 'blob', eyes: 2, top: 'horns', mouth: 'teeth' },
  y5_money: { name: 'Coin Crusher', color: '#2fb39a', body: 'pear', eyes: 3, top: 'horns', mouth: 'teeth' },
  pre_compare: { name: 'Greedy Gus', color: '#b06fe0', body: 'blob', eyes: 2, top: 'tuft', mouth: 'teeth' },
  pre_coins: { name: 'Sen Snatcher', color: '#e0a83a', body: 'round', eyes: 2, top: 'antenna', mouth: 'teeth' },
  y5_time: { name: 'Tick Tyrant', color: '#d9534f', body: 'tall', eyes: 1, top: 'spikes', mouth: 'teeth' },
};

export const bossSvg = skillId => {
  const b = BOSSES[skillId];
  return creatureSvg({ ...b, id: skillId, belly: shade(b.color, 60), spots: true }, { angry: true, crown: true });
};
