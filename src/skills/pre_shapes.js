import { pick, shuffle } from './util.js';

const SHAPES = {
  circle: '<circle cx="50" cy="50" r="40"/>',
  square: '<rect x="12" y="12" width="76" height="76" rx="4"/>',
  triangle: '<polygon points="50,8 92,88 8,88"/>',
  rectangle: '<rect x="4" y="27" width="92" height="46" rx="4"/>',
};
const DESC = {
  circle: 'is round, with no corners.',
  square: 'has 4 sides that are all the same length.',
  triangle: 'has 3 sides and 3 corners.',
  rectangle: 'has 4 sides: 2 long and 2 short.',
};
const COLORS = ['#ff6b6b', '#4d96ff', '#6bcb77', '#ffb703', '#c77dff', '#ff8fab'];
const svg = (s, c) => `<svg viewBox="0 0 100 100" class="shape" fill="${c}">${SHAPES[s]}</svg>`;

export default {
  id: 'pre_shapes',
  mode: 'pre',
  name: 'Shape Hunt',
  topic: 'Shapes',
  icon: 'shapes',
  hue: 45,
  gameType: 'choice',
  generate(level) {
    const names = Object.keys(SHAPES);
    const target = pick(names);
    const n = level + 1; // 2, 3, then 4 shapes to choose from
    const opts = shuffle([target, ...shuffle(names.filter(x => x !== target)).slice(0, n - 1)]);
    const cols = shuffle(COLORS);
    return {
      prompt: `Tap the <b>${target}</b>!`,
      speak: `Tap the ${target}!`,
      answer: target,
      choices: opts.map((s, i) => ({ html: svg(s, cols[i]), value: s })),
      choiceClass: 'shapes',
      explanation: `A ${target} ${DESC[target]}`,
    };
  },
};
