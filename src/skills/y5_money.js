import { rand, pick, shuffle, rm, withDistractors } from './util.js';
import { icon } from '../icons.js';

// Money (KSSR Year 5, topic 3), set at a night market stall. Prices are in sen.
const FOOD = [
  ['roti canai', 150], ['teh tarik', 220], ['nasi lemak', 350],
  ['kuih', 80], ['air sirap', 180], ['ais kacang', 450],
  ['murtabak', 700], ['apam balik', 300], ['cendol', 400], ['satay (5 sticks)', 500],
];
// Whole ringgit prices, for discounts and savings.
const SALE = [
  ['wau kite', 25], ['batik scarf', 40], ['storybook', 12], ['school bag', 45],
  ['pair of sandals', 20], ['toy car', 16], ['water bottle', 18], ['badminton racket', 60],
];
const NAMES = ['Aiman', 'Mei Ling', 'Priya', 'Farah', 'Daniel', 'Siti', 'Arjun', 'Hana'];

export default {
  id: 'y5_money',
  mode: 'y5',
  name: 'Night Market',
  topic: 'Money',
  icon: 'storefront',
  hue: 160,
  gameType: 'choice',
  generate(level) {
    const name = pick(NAMES);
    const count = level === 1 ? 2 : rand(2, 3);
    const items = shuffle(FOOD).slice(0, count).map(([n, p]) => ({ n, p, q: level === 3 ? rand(1, 4) : 1 }));
    const total = items.reduce((s, it) => s + it.p * it.q, 0);
    const lines = items.map(it => `<div class="rline"><span>${it.q > 1 ? `${it.q} × ` : ''}${it.n}</span><span>${it.q > 1 ? `${it.q} × ` : ''}${rm(it.p)}</span></div>`).join('');
    const receipt = `<div class="receipt"><div class="rhead">${icon('storefront')} Night Market</div>${lines}</div>`;
    const opt = v => ({ html: rm(v), value: v });
    const near = v => [v + 10, v - 10, v + 50, v - 50, v + 100, v - 100, v + 20].filter(x => x > 0);
    const choose = (ans, wrong) => withDistractors(opt(ans), shuffle(wrong.filter(x => x > 0 && x !== ans)).map(opt), 4, x => String(x.value));
    const slip = (...rows) => `<div class="receipt"><div class="rhead">${icon('storefront')} Night Market</div>${rows.map(([l, r]) => `<div class="rline"><span>${l}</span><span>${r}</span></div>`).join('')}</div>`;

    if (level === 4) {
      // Price of one from the total: 4 roti canai cost RM6.00.
      const [n, p] = pick(FOOD.filter(([f]) => !f.includes('(')));
      const q = rand(2, 6);
      return {
        prompt: `${q} ${n} cost ${rm(p * q)} altogether. How much is one?`,
        visual: slip([`${q} × ${n}`, rm(p * q)]),
        answer: p,
        choices: choose(p, [...near(p), p * q - p, p * 2]),
        explanation: `Share the total equally: ${rm(p * q)} ÷ ${q} = ${rm(p)}.`,
      };
    }
    if (level === 5) {
      // Discount: a percentage off a whole ringgit price.
      const [n, ringgit] = pick(SALE);
      const price = ringgit * 100;
      const pct = pick([10, 20, 25, 50]);
      const off = (price * pct) / 100;
      const ans = price - off;
      return {
        prompt: `A ${n} costs ${rm(price)}. Today it is ${pct}% off. How much is it now?`,
        speak: `A ${n} costs ${ringgit} ringgit. Today it is ${pct} percent off. How much is it now?`,
        answer: ans,
        choices: choose(ans, [off, price - pct * 100, price + off, ...near(ans)]),
        explanation: `${pct}% of ${rm(price)} is ${rm(price)} ÷ 100 × ${pct} = ${rm(off)}. Take it away: ${rm(price)} − ${rm(off)} = ${rm(ans)}.`,
      };
    }
    if (level === 6) {
      // Two steps: save up, then spend.
      // At least RM1 a day for 2 weeks (RM14), so there is always something to buy.
      const daily = pick([100, 150, 200, 250, 300]);
      const weeks = rand(2, 4);
      const saved = daily * weeks * 7;
      const [n, ringgit] = pick(SALE.filter(([, r]) => r * 100 < saved));
      const ans = saved - ringgit * 100;
      return {
        prompt: `${name} saves ${rm(daily)} every day for ${weeks} weeks, then buys a ${n} for ${rm(ringgit * 100)}. How much money is left?`,
        answer: ans,
        choices: choose(ans, [saved, daily * weeks - ringgit * 100, ans + daily, ans - daily, ...near(ans)]),
        explanation: `${weeks} weeks are ${weeks * 7} days, so ${name} saves ${weeks * 7} × ${rm(daily)} = ${rm(saved)}. Then ${rm(saved)} − ${rm(ringgit * 100)} = ${rm(ans)}.`,
      };
    }

    if (level === 1) {
      return {
        prompt: `${name} buys these. What is the total?`,
        visual: receipt,
        answer: total,
        choices: withDistractors(opt(total), shuffle(near(total)).map(opt), 4, x => String(x.value)),
        explanation: `Add the prices: ${items.map(it => rm(it.p)).join(' + ')} = ${rm(total)}.`,
      };
    }
    const pay = [1000, 2000, 5000].find(v => v > total) || 10000;
    const change = pay - total;
    return {
      prompt: `${name} pays with ${rm(pay)}. How much change?`,
      visual: receipt,
      answer: change,
      choices: withDistractors(opt(change), shuffle([...near(change), total]).map(opt), 4, x => String(x.value)),
      explanation: `First the total: ${items.map(it => (it.q > 1 ? `${it.q} × ${rm(it.p)}` : rm(it.p))).join(' + ')} = ${rm(total)}. Then the change: ${rm(pay)} − ${rm(total)} = ${rm(change)}.`,
    };
  },
};
