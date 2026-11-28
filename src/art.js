// Hand drawn SVG art in Kiko's style: flat colours, no outlines, soft highlights.
// Used for avatars, counting items, stickers and ten frames, instead of emoji.

const INK = '#2d2a32';

/* ---------- Animal avatars (viewBox 120 x 120, same face as Kiko) ---------- */

const eyes = (y = 58) => `
  <ellipse cx="44" cy="${y}" rx="6" ry="8" fill="${INK}"/><ellipse cx="76" cy="${y}" rx="6" ry="8" fill="${INK}"/>
  <circle cx="46" cy="${y - 3}" r="2" fill="#fff"/><circle cx="78" cy="${y - 3}" r="2" fill="#fff"/>`;
const mouth = `<path d="M60 77 q-6 7 -12 2 M60 77 q6 7 12 2" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
const nose = (c, rx = 5) => `<ellipse cx="60" cy="72" rx="${rx}" ry="3.6" fill="${c}"/>`;
const blush = `<circle cx="32" cy="74" r="6" fill="#ff9aa2" opacity=".55"/><circle cx="88" cy="74" r="6" fill="#ff9aa2" opacity=".55"/>`;
const head = c => `<ellipse cx="60" cy="66" rx="44" ry="40" fill="${c}"/>`;
const muzzle = c => `<ellipse cx="60" cy="80" rx="24" ry="17" fill="${c}"/>`;
const pointyEars = (c, inner) => `
  <polygon points="22,42 30,10 52,34" fill="${c}"/><polygon points="98,42 90,10 68,34" fill="${c}"/>
  <polygon points="27,36 31,19 44,32" fill="${inner}"/><polygon points="93,36 89,19 76,32" fill="${inner}"/>`;
const roundEars = (c, inner) => `
  <circle cx="26" cy="32" r="15" fill="${c}"/><circle cx="94" cy="32" r="15" fill="${c}"/>
  <circle cx="26" cy="32" r="8" fill="${inner}"/><circle cx="94" cy="32" r="8" fill="${inner}"/>`;

export const ANIMALS = {
  cat: {
    name: 'Cat',
    svg: `${pointyEars('#9aa5b1', '#ffd1dc')}${head('#9aa5b1')}${muzzle('#eef1f4')}${eyes()}${nose('#e8607a')}${mouth}${blush}
      <path d="M20 70 h-14 M20 76 h-12 M100 70 h14 M100 76 h12" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
  },
  dog: {
    name: 'Dog',
    svg: `${head('#c68b59')}
      <ellipse cx="20" cy="58" rx="13" ry="26" transform="rotate(18 20 58)" fill="#8d5b3a"/>
      <ellipse cx="100" cy="58" rx="13" ry="26" transform="rotate(-18 100 58)" fill="#8d5b3a"/>
      ${muzzle('#f3dcc5')}<ellipse cx="78" cy="52" rx="11" ry="9" fill="#f3dcc5"/>${eyes()}${nose(INK, 7)}${mouth}${blush}`,
  },
  rabbit: {
    name: 'Rabbit',
    svg: `<ellipse cx="42" cy="26" rx="11" ry="27" fill="#f1edf7"/><ellipse cx="78" cy="26" rx="11" ry="27" fill="#f1edf7"/>
      <ellipse cx="42" cy="26" rx="5" ry="19" fill="#ffc2d1"/><ellipse cx="78" cy="26" rx="5" ry="19" fill="#ffc2d1"/>
      ${head('#f1edf7')}${muzzle('#ffffff')}${eyes()}${nose('#ff8fab')}${mouth}${blush}`,
  },
  panda: {
    name: 'Panda',
    svg: `${roundEars(INK, INK)}${head('#fafafa')}
      <ellipse cx="42" cy="58" rx="12" ry="15" transform="rotate(25 42 58)" fill="${INK}"/>
      <ellipse cx="78" cy="58" rx="12" ry="15" transform="rotate(-25 78 58)" fill="${INK}"/>
      <circle cx="43" cy="57" r="5" fill="#fff"/><circle cx="77" cy="57" r="5" fill="#fff"/>
      <circle cx="44" cy="58" r="3" fill="${INK}"/><circle cx="76" cy="58" r="3" fill="${INK}"/>
      ${nose(INK)}${mouth}${blush}`,
  },
  fox: {
    name: 'Fox',
    svg: `${pointyEars('#f07c2a', '#ffe1c7')}${head('#f07c2a')}
      <path d="M16 70 Q38 64 60 92 Q82 64 104 70 Q96 104 60 106 Q24 104 16 70Z" fill="#fff7ef"/>
      ${eyes()}${nose(INK)}${mouth}${blush}`,
  },
  frog: {
    name: 'Frog',
    svg: `<circle cx="36" cy="34" r="18" fill="#6bcb77"/><circle cx="84" cy="34" r="18" fill="#6bcb77"/>
      ${head('#6bcb77')}
      <circle cx="36" cy="34" r="11" fill="#fff"/><circle cx="84" cy="34" r="11" fill="#fff"/>
      <circle cx="38" cy="35" r="6" fill="${INK}"/><circle cx="82" cy="35" r="6" fill="${INK}"/>
      <circle cx="40" cy="33" r="2" fill="#fff"/><circle cx="84" cy="33" r="2" fill="#fff"/>
      <path d="M34 76 Q60 98 86 76" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="28" cy="72" r="7" fill="#ff9aa2" opacity=".55"/><circle cx="92" cy="72" r="7" fill="#ff9aa2" opacity=".55"/>`,
  },
  bear: {
    name: 'Bear',
    svg: `${roundEars('#a0703f', '#d9a77a')}${head('#a0703f')}${muzzle('#e8c9a5')}${eyes()}${nose(INK, 7)}${mouth}${blush}`,
  },
  lion: {
    name: 'Lion',
    svg: `<circle cx="60" cy="64" r="55" fill="#e8902d"/>
      <circle cx="30" cy="34" r="10" fill="#ffcf5c"/><circle cx="90" cy="34" r="10" fill="#ffcf5c"/>
      ${head('#ffcf5c')}${muzzle('#fff3d6')}${eyes()}${nose('#8d5b3a', 7)}${mouth}${blush}`,
  },
};

export const ANIMAL_IDS = Object.keys(ANIMALS);

export const animal = (id, cls = '') =>
  `<svg class="art animal ${cls}" viewBox="0 0 120 120" aria-label="${(ANIMALS[id] || ANIMALS.cat).name}" role="img">${(ANIMALS[id] || ANIMALS.cat).svg}</svg>`;

/* ---------- Things to count (viewBox 64 x 64) ---------- */

const shine = (x, y, rx = 4, ry = 6) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".45"/>`;

export const ITEMS = {
  apple: {
    word: 'apples',
    svg: `<path d="M32 18c-6-5-20-4-22 10-2 13 7 28 15 29 3 0 5-2 7-2s4 2 7 2c8-1 17-16 15-29-2-14-16-15-22-10z" fill="#ff5d5d"/>
      <path d="M32 18c0-5 2-9 5-11" stroke="#7a4a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M35 13c5-5 12-4 14-2-3 5-9 6-14 2z" fill="#6bcb77"/>${shine(21, 30)}`,
  },
  fish: {
    word: 'fish',
    svg: `<polygon points="42,32 60,18 60,46" fill="#3a7be0"/>
      <ellipse cx="28" cy="32" rx="22" ry="14" fill="#4d96ff"/>
      <path d="M26 20 q6 -8 14 -2" fill="#3a7be0"/>
      <circle cx="17" cy="29" r="4.5" fill="#fff"/><circle cx="16" cy="29" r="2.4" fill="${INK}"/>
      <path d="M30 26 q4 6 0 12" stroke="#bfe0ff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  },
  star: {
    word: 'stars',
    svg: `<path d="M32 5l8 16.3 18 2.6-13 12.7 3.1 17.9L32 46l-16.1 8.5 3.1-17.9L6 23.9l18-2.6z" fill="#ffc83d" stroke="#ffc83d" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 14l4 8" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>`,
  },
  car: {
    word: 'cars',
    svg: `<path d="M15 30l7-12h20l9 12z" fill="#ff7a59"/>
      <rect x="5" y="28" width="54" height="17" rx="7" fill="#ff7a59"/>
      <path d="M20 29l4-8h7v8z M35 29v-8h6l6 8z" fill="#bfe6ff"/>
      <circle cx="18" cy="46" r="7" fill="${INK}"/><circle cx="46" cy="46" r="7" fill="${INK}"/>
      <circle cx="18" cy="46" r="2.6" fill="#ddd"/><circle cx="46" cy="46" r="2.6" fill="#ddd"/>
      <rect x="52" y="33" width="5" height="4" rx="2" fill="#ffe066"/>`,
  },
  flower: {
    word: 'flowers',
    svg: `<path d="M32 40v20" stroke="#4fb35f" stroke-width="4" stroke-linecap="round"/>
      <path d="M32 54c-8 0-12-6-12-6 6-2 11 1 12 6z" fill="#6bcb77"/>
      ${[0, 72, 144, 216, 288].map(a => `<circle cx="${32 + 12 * Math.sin(a * Math.PI / 180)}" cy="${26 - 12 * Math.cos(a * Math.PI / 180)}" r="9" fill="#ff8fab"/>`).join('')}
      <circle cx="32" cy="26" r="7.5" fill="#ffd23f"/>`,
  },
  ball: {
    word: 'balls',
    svg: `<circle cx="32" cy="32" r="24" fill="#ff5d5d"/>
      <path d="M10 26c14 6 30 6 44 0M10 38c14 6 30 6 44 0" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${shine(22, 20, 4, 5)}`,
  },
  cookie: {
    word: 'cookies',
    svg: `<circle cx="32" cy="32" r="24" fill="#e0a96d"/><circle cx="32" cy="32" r="19" fill="#eab97f"/>
      ${[[24, 24], [38, 22], [30, 36], [42, 38], [21, 40], [34, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#6b4226"/>`).join('')}`,
  },
  bird: {
    word: 'birds',
    svg: `<path d="M12 36 L2 30 L6 40 Z" fill="#3a7be0"/>
      <ellipse cx="28" cy="36" rx="18" ry="15" fill="#5aa9e6"/>
      <ellipse cx="25" cy="40" rx="10" ry="7" fill="#3a7be0"/>
      <circle cx="38" cy="26" r="12" fill="#5aa9e6"/>
      <polygon points="48,24 58,28 48,31" fill="#ffb703"/>
      <circle cx="41" cy="24" r="3" fill="${INK}"/><circle cx="42" cy="23" r="1" fill="#fff"/>
      <path d="M24 50v6 M32 50v6" stroke="#ffb703" stroke-width="3" stroke-linecap="round"/>`,
  },
};

export const ITEM_IDS = Object.keys(ITEMS);

export const item = (id, cls = '') => `<svg class="art item ${cls}" viewBox="0 0 64 64" aria-hidden="true">${ITEMS[id].svg}</svg>`;

/** Items laid out in rows of 5, so children can see "5 and 2 more". */
export const itemRows = (id, n, cls = '') => {
  const rows = [];
  for (let i = 0; i < n; i += 5) {
    rows.push(`<div class="irow">${Array.from({ length: Math.min(5, n - i) }, (_, k) =>
      `<span class="pop-in ${cls}" style="animation-delay:${(i + k) * 60}ms">${item(id)}</span>`).join('')}</div>`);
  }
  return `<div class="item-rows">${rows.join('')}</div>`;
};

/* ---------- Ten frames ---------- */

/**
 * Ten frame counters. groups: [{ n, color }] fill cells in order.
 * crossed: how many of the last counters are crossed out (taking away).
 */
export function tenFrames(groups, crossed = 0) {
  const cells = [];
  groups.forEach(g => { for (let i = 0; i < g.n; i++) cells.push(g.color); });
  const total = cells.length;
  const frames = Math.max(1, Math.ceil(total / 10));
  let out = '';
  for (let f = 0; f < frames; f++) {
    let dots = '';
    for (let i = 0; i < 10; i++) {
      const idx = f * 10 + i;
      const x = 14 + (i % 5) * 28, y = 14 + Math.floor(i / 5) * 28;
      let c = '';
      if (idx < total) {
        const gone = idx >= total - crossed;
        c = `<g class="pop-in" style="animation-delay:${idx * 70}ms;transform-origin:${x}px ${y}px">
          <circle cx="${x}" cy="${y}" r="10" fill="${cells[idx]}" ${gone ? 'opacity=".3"' : ''}/>
          ${gone ? `<path d="M${x - 9} ${y - 9}L${x + 9} ${y + 9}M${x + 9} ${y - 9}L${x - 9} ${y + 9}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` : ''}</g>`;
      }
      dots += `<rect x="${x - 14}" y="${y - 14}" width="28" height="28" fill="none" stroke="#c9c2dc" stroke-width="2"/>${c}`;
    }
    out += `<svg class="ten-frame" viewBox="-2 -2 144 60" aria-hidden="true"><rect x="0" y="0" width="140" height="56" rx="6" fill="#fff" stroke="#8f86aa" stroke-width="3"/>${dots}</svg>`;
  }
  return `<div class="frames${frames > 2 ? ' many' : ''}">${out}</div>`;
}

export const COUNTER_RED = '#ff5d5d';
export const COUNTER_BLUE = '#4d96ff';

/* ---------- Stickers ---------- */

const STICKER_BG = ['#ffe08a', '#c9f5dd', '#d6e8ff', '#ffd6e0', '#e6dcff', '#ffe1c7', '#d5f4f1', '#fff1b8'];

export const STICKER_IDS = [...ANIMAL_IDS.map(a => `animal:${a}`), ...ITEM_IDS.map(i => `item:${i}`)];

export function sticker(id, i = 0) {
  const [kind, name] = id.split(':');
  const art = kind === 'animal' ? animal(name) : item(name);
  return `<span class="sticker-art" style="--sbg:${STICKER_BG[i % STICKER_BG.length]}">${art}</span>`;
}
