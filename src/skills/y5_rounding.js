import { rand, pick, fmtNum, withDistractors } from './util.js';

// Rounding numbers up to 1 000 000 (KSSR Year 5, topic 1).
const PLACE_NAME = { 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands' };

export default {
  id: 'y5_rounding',
  mode: 'y5',
  name: 'Round the Rocket',
  topic: 'Rounding to 1 000 000',
  icon: '🚀',
  hue: 200,
  gameType: 'choice',
  generate(level) {
    const cfg = level === 1 ? { max: 9999, places: [10, 100] }
      : level === 2 ? { max: 99999, places: [1000] }
        : { max: 999999, places: [10000, 100000] };
    const place = pick(cfg.places);
    let n = rand(place + 1, cfg.max);
    if (n % place === 0) n += rand(1, place - 1);
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
