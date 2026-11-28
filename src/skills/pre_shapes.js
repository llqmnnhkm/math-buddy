import { pick, shuffle } from './util.js';

const star = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 ? 19 : 46, a = (i * Math.PI) / 5 - Math.PI / 2;
  return `${(50 + r * Math.cos(a)).toFixed(1)},${(53 + r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

const SHAPES = {
  circle: '<circle cx="50" cy="50" r="40"/>',
  square: '<rect x="12" y="12" width="76" height="76" rx="4"/>',
  triangle: '<polygon points="50,8 92,88 8,88"/>',
  rectangle: '<rect x="4" y="27" width="92" height="46" rx="4"/>',
  oval: '<ellipse cx="50" cy="50" rx="46" ry="30"/>',
  star: `<polygon points="${star}"/>`,
};
const DESC = {
  circle: 'is round, with no corners.',
  square: 'has 4 sides that are all the same length.',
  triangle: 'has 3 sides and 3 corners.',
  rectangle: 'has 4 sides: 2 long and 2 short.',
  oval: 'is like a stretched circle, with no corners.',
  star: 'has 5 points.',
};
// Level 6 asks by what the shape has. No oval there: "round, no corners" would fit it too.
const HAS = {
  circle: 'is round with no corners',
  square: 'has 4 sides all the same length',
  triangle: 'has 3 sides',
  rectangle: 'has 2 long sides and 2 short sides',
  star: 'has 5 points',
};
const COLORS = ['#ff6b6b', '#4d96ff', '#6bcb77', '#ffb703', '#c77dff', '#ff8fab'];
const svg = (s, c, turn = 0) =>
  `<svg viewBox="0 0 100 100" class="shape" fill="${c}"${turn ? ` style="transform:rotate(${turn}deg)"` : ''}>${SHAPES[s]}</svg>`;

export default {
  id: 'pre_shapes',
  mode: 'pre',
  name: 'Shape Hunt',
  topic: 'Shapes',
  icon: 'shapes',
  hue: 45,
  gameType: 'choice',
  generate(level) {
    // Levels 1-3: the 4 basic shapes, 2, 3, then 4 to choose from. From level 4: oval and star join in.
    const names = level === 6 ? Object.keys(HAS) : Object.keys(SHAPES).slice(0, level >= 4 ? 6 : 4);
    const target = pick(names);
    const n = Math.min(level + 1, 4);
    const opts = shuffle([target, ...shuffle(names.filter(x => x !== target)).slice(0, n - 1)]);
    const cols = shuffle(COLORS);
    // Level 5 turns the shapes: a square on its corner is still a square.
    const turn = () => (level === 5 ? pick([20, 45, 90, 135, 160]) : 0);
    const ask = level === 6 ? `the shape that ${HAS[target]}` : `the <b>${target}</b>`;
    return {
      prompt: `Tap ${ask}!`,
      speak: `Tap ${ask.replace(/<\/?b>/g, '')}!`,
      answer: target,
      choices: opts.map((s, i) => ({ html: svg(s, cols[i], turn()), value: s })),
      choiceClass: 'shapes',
      explanation: `A ${target} ${DESC[target]}`,
    };
  },
};
