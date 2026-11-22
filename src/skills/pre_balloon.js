import { rand, shuffle } from './util.js';

export default {
  id: 'pre_balloon',
  mode: 'pre',
  name: 'Pop the Balloon',
  topic: 'Numbers',
  icon: '🎈',
  hue: 330,
  gameType: 'balloon',
  generate(level) {
    const max = [5, 10, 20][level - 1];
    const count = level === 1 ? 4 : 5;
    const target = rand(1, max);
    const nums = new Set([target]);
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
