import { rand, pick, frac, fracWords, withDistractors } from './util.js';

// Fractions, decimals and percentages (KSSR Year 5, topic 2).
function pizza(n, d) {
  const cx = 60, cy = 60, r = 52;
  const slices = Array.from({ length: d }, (_, i) => {
    const a1 = (i / d) * 2 * Math.PI - Math.PI / 2;
    const a2 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const fill = i < n ? '#f4a261' : '#fdebd0';
    return `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 0 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${fill}" stroke="#b5651d" stroke-width="2"/>`;
  }).join('');
  return `<svg viewBox="0 0 120 120" class="pizza">${slices}</svg>`;
}

// Fractions whose denominators divide 100, for percentage and decimal practice.
const CONVERT = [
  [1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 5, 20], [2, 5, 40], [3, 5, 60], [4, 5, 80],
  [1, 10, 10], [3, 10, 30], [7, 10, 70], [9, 10, 90], [1, 20, 5], [3, 20, 15], [7, 20, 35], [1, 25, 4],
];

export default {
  id: 'y5_fractions',
  mode: 'y5',
  name: 'Pizza Fractions',
  topic: 'Fractions, decimals & percentages',
  icon: '🍕',
  hue: 25,
  gameType: 'choice',
  generate(level) {
    if (level === 1) {
      const d = pick([2, 3, 4, 5, 6, 8]);
      const n = rand(1, d - 1);
      const cands = [[d - n, d], [n, d + 1], [n + 1, d], [n, d * 2], [Math.max(1, n - 1), d]]
        .filter(([a, b]) => a > 0 && a < b).map(([a, b]) => frac(a, b));
      return {
        prompt: 'What fraction of the pizza is shaded?',
        visual: pizza(n, d),
        answer: `${n}/${d}`,
        choices: withDistractors(frac(n, d), cands, 4, x => x.value),
        explanation: `The pizza has ${d} equal slices and ${n} are shaded, so it is ${frac(n, d).html}.`,
      };
    }
    if (level === 2) {
      const d = pick([5, 6, 7, 8, 9, 10, 12]);
      const a = rand(1, d - 2);
      const b = rand(1, d - 1 - a);
      const s = a + b;
      const cands = [frac(s, d * 2), frac(Math.min(s + 1, d - 1), d), frac(Math.max(1, Math.abs(a - b)), d), frac(s, d + 1)];
      return {
        prompt: 'Add the fractions.',
        speak: `What is ${fracWords(a, d)} plus ${fracWords(b, d)}?`,
        visual: `<div class="eq">${frac(a, d).html} + ${frac(b, d).html} = ?</div>`,
        answer: `${s}/${d}`,
        choices: withDistractors(frac(s, d), cands, 4, x => x.value),
        explanation: `The denominators are the same, so keep ${d} and add the numerators: ${a} + ${b} = ${s}. The answer is ${frac(s, d).html}.`,
      };
    }
    const [n, d, pct] = pick(CONVERT);
    const asPct = Math.random() < 0.5;
    const others = CONVERT.filter(x => x[2] !== pct).sort(() => Math.random() - 0.5).map(x => x[2]);
    const show = v => (asPct ? { html: `${v}%`, value: String(v) } : { html: String(v / 100), value: String(v / 100) });
    const ans = show(pct);
    return {
      prompt: `Write this fraction as a ${asPct ? 'percentage' : 'decimal'}.`,
      speak: `Write ${fracWords(n, d)} as a ${asPct ? 'percentage' : 'decimal'}.`,
      visual: `<div class="eq">${frac(n, d).html} = ?</div>`,
      answer: ans.value,
      choices: withDistractors(ans, others.map(show), 4, x => x.value),
      explanation: `Make the denominator 100: ${frac(n, d).html} = ${frac(n * (100 / d), 100).html} = ${pct}% = ${pct / 100}.`,
    };
  },
};
