import { rand, pick, shuffle, rm, withDistractors } from './util.js';

// Money (KSSR Year 5, topic 3), set at a pasar malam stall. Prices are in sen.
const FOOD = [
  ['roti canai', 150, '🫓'], ['teh tarik', 220, '🥤'], ['nasi lemak', 350, '🍛'],
  ['kuih', 80, '🍡'], ['air sirap', 180, '🧃'], ['ais kacang', 450, '🍧'],
  ['murtabak', 700, '🥙'], ['apam balik', 300, '🥞'], ['cendol', 400, '🍨'], ['satay (5 sticks)', 500, '🍢'],
];
const NAMES = ['Aiman', 'Mei Ling', 'Priya', 'Farah', 'Daniel', 'Siti', 'Arjun', 'Hana'];

export default {
  id: 'y5_money',
  mode: 'y5',
  name: 'Pasar Malam',
  topic: 'Money',
  icon: '🛍️',
  hue: 160,
  gameType: 'choice',
  generate(level) {
    const name = pick(NAMES);
    const count = level === 1 ? 2 : rand(2, 3);
    const items = shuffle(FOOD).slice(0, count).map(([n, p, e]) => ({ n, p, e, q: level === 3 ? rand(1, 4) : 1 }));
    const total = items.reduce((s, it) => s + it.p * it.q, 0);
    const lines = items.map(it => `<div class="rline"><span>${it.e} ${it.q > 1 ? `${it.q} × ` : ''}${it.n}</span><span>${it.q > 1 ? `${it.q} × ` : ''}${rm(it.p)}</span></div>`).join('');
    const receipt = `<div class="receipt"><div class="rhead">🏮 Pasar Malam</div>${lines}</div>`;
    const opt = v => ({ html: rm(v), value: v });
    const near = v => [v + 10, v - 10, v + 50, v - 50, v + 100, v - 100, v + 20].filter(x => x > 0);

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
