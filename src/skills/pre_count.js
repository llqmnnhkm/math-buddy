import { rand, pick, numChoices } from './util.js';

const ITEMS = [
  ['🍎', 'apples'], ['🐟', 'fish'], ['⭐', 'stars'], ['🚗', 'cars'],
  ['🍌', 'bananas'], ['🐥', 'chicks'], ['🎈', 'balloons'], ['🌸', 'flowers'],
];

export default {
  id: 'pre_count',
  mode: 'pre',
  name: 'Count With Me',
  topic: 'Counting',
  icon: '🍎',
  hue: 8,
  gameType: 'choice',
  generate(level) {
    const max = [5, 10, 20][level - 1];
    const n = rand(1, max);
    const [emoji, word] = pick(ITEMS);
    const items = Array.from({ length: n }, (_, i) => `<span style="animation-delay:${i * 60}ms">${emoji}</span>`).join('');
    return {
      prompt: `How many ${word}?`,
      visual: `<div class="items ${n > 10 ? 'many' : ''}">${items}</div>`,
      answer: n,
      choices: numChoices(n, 3, 3, 1),
      choiceClass: 'big',
      explanation: `Let's count together: ${Array.from({ length: n }, (_, i) => i + 1).join(', ')}. There are ${n}!`,
    };
  },
};
