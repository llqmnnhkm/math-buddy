import { rand, pick, shuffle, withDistractors } from './util.js';

// Malaysian coins for age 5: know the coins, count 10 sen coins, then add mixed coins.
// Sizes and colours follow the real coins: 5 sen smallest, 50 sen biggest, 20 sen gold.
const COIN = {
  5: { r: 36, fill: '#cfd5dd', rim: '#9aa5b1' },
  10: { r: 39, fill: '#d9dee5', rim: '#9aa5b1' },
  20: { r: 43, fill: '#f2c94c', rim: '#c79a1e' },
  50: { r: 48, fill: '#dde2e8', rim: '#8f9aa6' },
};

const coin = sen => {
  const c = COIN[sen];
  return `<svg class="coin" viewBox="0 0 100 100" role="img" aria-label="${sen} sen coin">
    <circle cx="50" cy="50" r="${c.r}" fill="${c.rim}"/><circle cx="50" cy="50" r="${c.r - 5}" fill="${c.fill}"/>
    <text x="50" y="55" text-anchor="middle" font-size="${c.r * 0.8}" font-weight="900" fill="#3d4650">${sen}</text>
    <text x="50" y="${55 + c.r * 0.45}" text-anchor="middle" font-size="${c.r * 0.32}" font-weight="700" fill="#3d4650">sen</text>
  </svg>`;
};

const coinRow = coins => `<div class="coins">${coins.map(coin).join('')}</div>`;
const sumOf = coins => coins.reduce((s, c) => s + c, 0);
/** count coins from kinds, biggest first, adding up to no more than max sen. */
function mixedCoins(count, kinds, max) {
  let coins;
  do coins = Array.from({ length: count }, () => pick(kinds)).sort((x, y) => y - x);
  while (sumOf(coins) > max);
  return coins;
}
const opt = v => ({ html: `${v} sen`, value: v });
const choose = (ans, wrong) => withDistractors(opt(ans), shuffle(wrong.filter(x => x > 0)).map(opt), 4, x => String(x.value));

export default {
  id: 'pre_coins',
  mode: 'pre',
  name: 'Corner Shop',
  topic: 'Malaysian coins',
  icon: 'coins',
  hue: 190,
  gameType: 'choice',
  generate(level) {
    if (level === 1) {
      const sen = pick([5, 10, 20, 50]);
      return {
        prompt: `Tap the <b>${sen} sen</b> coin!`,
        speak: `Tap the ${sen} sen coin!`,
        answer: sen,
        choices: shuffle([5, 10, 20, 50]).map(v => ({ html: coin(v), value: v })),
        choiceClass: 'shapes',
        explanation: `Look for the number ${sen} on the coin.`,
      };
    }
    if (level === 2) {
      // Count 10 sen coins in tens.
      const n = rand(1, 5);
      const ans = n * 10;
      return {
        prompt: 'How much money is this?',
        visual: coinRow(Array(n).fill(10)),
        answer: ans,
        choices: choose(ans, [n, ans + 10, ans - 10, ans + 20]),
        explanation: `Count in tens: ${Array.from({ length: n }, (_, i) => (i + 1) * 10).join(', ')}. That is ${ans} sen!`,
      };
    }
    if (level === 4) {
      // Count in fives or twenties.
      const [sen, n] = Math.random() < 0.5 ? [5, rand(2, 8)] : [20, rand(2, 5)];
      const ans = sen * n;
      return {
        prompt: 'How much money is this?',
        visual: coinRow(Array(n).fill(sen)),
        answer: ans,
        choices: choose(ans, [n, ans + sen, ans - sen, ans + 10]),
        explanation: `Count in ${sen === 5 ? 'fives' : 'twenties'}: ${Array.from({ length: n }, (_, i) => (i + 1) * sen).join(', ')}. That is ${ans} sen!`,
      };
    }
    if (level === 6) {
      // Pay exactly: which set of coins makes the price?
      const thing = pick(['sweet', 'pencil', 'eraser', 'balloon', 'apple']);
      const sets = new Map(); // total -> coins, so every choice has a different total
      while (sets.size < 4) {
        const coins = mixedCoins(rand(2, 3), [5, 10, 20, 50], 100);
        sets.set(sumOf(coins), coins);
      }
      const price = pick([...sets.keys()]);
      return {
        prompt: `A ${thing} costs ${price} sen. Tap the coins that make ${price} sen!`,
        answer: price,
        choices: shuffle([...sets]).map(([total, coins]) => ({ html: coinRow(coins), value: total })),
        choiceClass: 'coinsets',
        explanation: `Add the coins, biggest first: ${sets.get(price).join(' + ')} = ${price} sen.`,
      };
    }
    // Level 3: two or three coins up to 50 sen. Level 5: three or four, with 50 sen, up to 100 sen.
    const coins = level === 5 ? mixedCoins(rand(3, 4), [5, 10, 20, 50], 100) : mixedCoins(rand(2, 3), [5, 10, 20], 50);
    const ans = sumOf(coins);
    return {
      prompt: 'How much money altogether?',
      visual: coinRow(coins),
      answer: ans,
      choices: choose(ans, [ans + 5, ans - 5, ans + 10, coins.length]),
      explanation: `Start with the biggest coin and add: ${coins.join(' + ')} = ${ans} sen.`,
    };
  },
};
