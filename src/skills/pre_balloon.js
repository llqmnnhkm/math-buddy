import { rand, shuffle } from './util.js';

export default {
  id: 'pre_balloon',
  mode: 'pre',
  name: 'Pop the Balloon',
  topic: 'Numbers',
  icon: 'balloon',
  hue: 330,
  gameType: 'balloon',
  generate(level) {
    const max = [5, 10, 20, 30, 50, 100][level - 1];
    const count = level === 1 ? 4 : 5;
    const target = rand(level >= 5 ? 11 : 1, max);
    const nums = new Set([target]);
    // From level 5 the other balloons look alike: digits swapped (47, 74), or one or ten away.
    if (level >= 5) {
      const alike = [+[...String(target)].reverse().join(''), target + 1, target - 1, target + 10, target - 10];
      for (const n of shuffle(alike)) if (n >= 1 && n <= max && nums.size < count) nums.add(n);
    }
    while (nums.size < count) nums.add(rand(1, max));
    return {
      prompt: `Pop the number <b>${target}</b>!`,
      speak: `Pop the number ${target}!`,
      answer: target,
      numbers: shuffle([...nums]),
      explanation: `Look for the balloon that says <b>${target}</b>.`,
    };
  },
};
