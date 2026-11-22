// Kiko the cat mascot and the confetti burst.
const CAT = `<svg viewBox="0 0 120 120" aria-hidden="true">
  <polygon points="22,38 30,8 50,30" fill="#f6a04d"/><polygon points="98,38 90,8 70,30" fill="#f6a04d"/>
  <polygon points="27,32 31,16 43,29" fill="#ffd1dc"/><polygon points="93,32 89,16 77,29" fill="#ffd1dc"/>
  <ellipse cx="60" cy="62" rx="44" ry="40" fill="#f6a04d"/>
  <ellipse cx="60" cy="78" rx="26" ry="20" fill="#fff3e0"/>
  <g class="eyes"><ellipse cx="44" cy="56" rx="6" ry="8" fill="#2d2a32"/><ellipse cx="76" cy="56" rx="6" ry="8" fill="#2d2a32"/>
  <circle cx="46" cy="53" r="2" fill="#fff"/><circle cx="78" cy="53" r="2" fill="#fff"/></g>
  <polygon points="56,70 64,70 60,75" fill="#e8607a"/>
  <path d="M60 75 q-6 7 -12 2 M60 75 q6 7 12 2" stroke="#2d2a32" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="34" cy="70" r="6" fill="#ff9aa2" opacity=".6"/><circle cx="86" cy="70" r="6" fill="#ff9aa2" opacity=".6"/>
  <path d="M20 66 h-14 M20 72 h-12 M100 66 h14 M100 72 h12" stroke="#2d2a32" stroke-width="2" stroke-linecap="round"/>
</svg>`;

export const mascot = (text, cls = '') =>
  `<div class="mascot ${cls}"><div class="kiko">${CAT}</div><div class="bubble" aria-live="polite">${text}</div></div>`;

export function mascotSay(text, mood) {
  const m = document.querySelector('.mascot');
  if (!m) return;
  m.querySelector('.bubble').innerHTML = text;
  const k = m.querySelector('.kiko');
  k.classList.remove('happy', 'oops');
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
    if (t - start < 3200) requestAnimationFrame(frame); else c.remove();
  })(start);
}
