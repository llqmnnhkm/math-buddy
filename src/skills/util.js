export const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** KSSR style number formatting with spaces: 1 000 000 */
export const fmtNum = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Sen (integer) to ringgit text: 350 -> RM3.50 */
export const rm = sen => `RM${(sen / 100).toFixed(2)}`;

/** n unique numeric choices around the answer, never below min. */
export function numChoices(ans, n, spread, min = 0) {
  const set = new Set([ans]);
  let guard = 0;
  while (set.size < n && guard++ < 200) {
    const d = ans + rand(-spread, spread);
    if (d >= min) set.add(d);
  }
  let k = 1;
  while (set.size < n) set.add(ans + k++);
  return shuffle([...set]);
}

/** Answer plus up to (n-1) distinct distractors taken in order from candidates. */
export function withDistractors(ans, candidates, n = 4, key = x => String(x)) {
  const out = [ans];
  const seen = new Set([key(ans)]);
  for (const c of candidates) {
    if (out.length >= n) break;
    if (c === null || c === undefined || seen.has(key(c))) continue;
    seen.add(key(c));
    out.push(c);
  }
  return shuffle(out);
}

/** Fraction as stacked HTML, with a comparable value. */
export const frac = (n, d) => ({
  html: `<span class="frac"><span>${n}</span><span>${d}</span></span>`,
  value: `${n}/${d}`,
});

const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];
const DEN_WORDS = { 2: 'half', 3: 'third', 4: 'quarter', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth', 12: 'twelfth', 20: 'twentieth', 25: 'twenty fifth' };

/** Fraction in words for read aloud: 3/4 -> "three quarters" */
export function fracWords(n, d) {
  const den = DEN_WORDS[d] || `over ${d}`;
  if (!DEN_WORDS[d]) return `${n} over ${d}`;
  const plural = n === 1 ? den : (d === 2 ? 'halves' : `${den}s`);
  return `${NUM_WORDS[n] ?? n} ${plural}`;
}
