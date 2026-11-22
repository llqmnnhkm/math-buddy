import { rand, pick, numChoices } from './util.js';

const THINGS = [['🍓', 'strawberries'], ['🐱', 'cats'], ['⚽', 'balls'], ['🍪', 'cookies'], ['🦆', 'ducks']];
const row = (emoji, n, cls = '') => Array.from({ length: n }, () => `<span class="${cls}">${emoji}</span>`).join('');

export default {
  id: 'pre_add',
  mode: 'pre',
  name: 'Add It Up',
  topic: 'Adding & taking away',
  icon: '➕',
  hue: 140,
  gameType: 'choice',
  generate(level) {
    if (level === 3) {
      // Taking away within 10
      const a = rand(3, 10);
      const b = rand(1, a - 1);
      const ans = a - b;
      return {
        prompt: `${a} birds. ${b} fly away. How many are left?`,
        visual: `<div class="items">${row('🐦', ans)}${row('🐦', b, 'gone')}</div>`,
        answer: ans,
        choices: numChoices(ans, 3, 2, 0),
        choiceClass: 'big',
        explanation: `${a} take away ${b} leaves ${ans}. Count the birds that stayed!`,
      };
    }
    const max = level === 1 ? 5 : 10;
    const a = rand(1, max - 1);
    const b = rand(1, max - a);
    const [emoji, word] = pick(THINGS);
    return {
      prompt: `${a} ${word} and ${b} more. How many altogether?`,
      visual: `<div class="sum-row"><div class="items">${row(emoji, a)}</div><div class="op">+</div><div class="items">${row(emoji, b)}</div></div>`,
      answer: a + b,
      choices: numChoices(a + b, 3, 2, 1),
      choiceClass: 'big',
      explanation: `${a} and ${b} more makes ${a + b}. Count them all together!`,
    };
  },
};
