import { rand, pick, fmtNum, withDistractors } from './util.js';

// Rounding numbers up to 1 000 000 (KSSR Year 5, topic 1).
const PLACE_NAME = { 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands' };

// Level 6: decimals (KSSR Year 5) to a whole number, 1 or 2 decimal places. Works in thousandths
// (whole numbers), so there are no floating point surprises.
function roundDecimal() {
  const dp = pick([0, 1, 2]);
  let m = rand(1001, 99999); // 1.001 to 99.999
  if (m % 10 === 0) m += rand(1, 9); // always show three decimal digits
  const shown = (m / 1000).toFixed(3);
  const step = 10 ** (3 - dp);
  const r = Math.round(m / step);
  const fmt = v => (v / 10 ** dp).toFixed(dp);
  const ans = fmt(r);
  const digit = Math.floor(m / (step / 10)) % 10;
  const wrong = [r + (r * step > m ? -1 : 1), r + 2, r - 2].filter(v => v > 0).map(fmt)
    .filter(v => Number(v) !== Number(ans));
  const where = dp ? `${dp} decimal ${dp === 1 ? 'place' : 'places'}` : 'the nearest whole number';
  return {
    prompt: `Round <b>${shown}</b> to ${where}.`,
    speak: `Round ${shown} to ${where}.`,
    answer: ans,
    choices: withDistractors({ html: ans, value: ans }, wrong.map(v => ({ html: v, value: v })), 4, x => x.value),
    explanation: `Look at the ${['first', 'second', 'third'][dp]} digit after the decimal point. It is ${digit}, which is ${digit >= 5 ? '5 or more, so round up' : 'less than 5, so round down'}. The answer is ${ans}.`,
  };
}

export default {
  id: 'y5_rounding',
  mode: 'y5',
  name: 'Round the Rocket',
  topic: 'Rounding to 1 000 000',
  icon: 'rocket-launch',
  hue: 200,
  gameType: 'choice',
  generate(level) {
    if (level === 6) return roundDecimal();
    let place, n;
    if (level === 5) {
      // Just below a round number, so rounding up ripples through the 9s: 399 963 -> 400 000.
      place = pick([10, 100, 1000]);
      const big = place * 100;
      n = rand(1, Math.floor(999999 / big)) * big - rand(1, place / 2);
    } else {
      const cfg = [
        { max: 9999, places: [10, 100] }, { max: 99999, places: [1000] }, { max: 999999, places: [10000, 100000] },
        { max: 999999, places: [10, 100, 1000, 10000, 100000] },
      ][level - 1];
      place = pick(cfg.places);
      n = rand(place + 1, cfg.max);
      if (n % place === 0) n += rand(1, place - 1);
    }
    const ans = Math.round(n / place) * place;
    const other = ans > n ? ans - place : ans + place;
    const digit = Math.floor(n / (place / 10)) % 10;
    const cands = [
      other,
      Math.round(n / (place * 10)) * place * 10,
      place >= 100 ? Math.round(n / (place / 10)) * (place / 10) : null,
      ans + 2 * place,
      ans - 2 * place,
    ].filter(x => x !== null && x > 0);
    const opt = v => ({ html: fmtNum(v), value: v });
    return {
      prompt: `Round <b>${fmtNum(n)}</b> to the nearest ${fmtNum(place)}.`,
      speak: `Round ${n} to the nearest ${place}.`,
      answer: ans,
      choices: withDistractors(opt(ans), cands.map(opt), 4, x => String(x.value)),
      explanation: `Look at the digit to the right of the ${PLACE_NAME[place]} place. It is ${digit}, which is ${digit >= 5 ? '5 or more, so round up' : 'less than 5, so round down'}. The answer is ${fmtNum(ans)}.`,
    };
  },
};
