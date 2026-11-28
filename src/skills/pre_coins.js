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
    // Two or three different coins, biggest first, total up to 50 sen.
    let coins;
    do coins = Array.from({ length: rand(2, 3) }, () => pick([5, 10, 20])).sort((x, y) => y - x);
    while (coins.reduce((s, c) => s + c, 0) > 50);
    const ans = coins.reduce((s, c) => s + c, 0);
    return {
      prompt: 'How much money altogether?',
      visual: coinRow(coins),
      answer: ans,
      choices: choose(ans, [ans + 5, ans - 5, ans + 10, coins.length]),
      explanation: `Start with the biggest coin and add: ${coins.join(' + ')} = ${ans} sen.`,
    };
  },
};
