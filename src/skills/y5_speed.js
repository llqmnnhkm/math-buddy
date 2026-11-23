import { rand, pick, fmtNum } from './util.js';

// Whole numbers and basic operations (KSSR Year 5, topic 1).
export default {
  id: 'y5_speed',
  mode: 'y5',
  name: 'Speed Round',
  topic: 'Whole numbers & operations',
  icon: 'lightning',
  hue: 260,
  gameType: 'speed',
  generate(level) {
    const ops = level === 1 ? ['add', 'sub', 'mul'] : ['add', 'sub', 'mul', 'div'];
    const op = pick(ops);
    let a, b, ans, sym;
    if (op === 'add') {
      const hi = [500, 5000, 50000][level - 1];
      a = rand(10, hi); b = rand(10, hi); ans = a + b; sym = '+';
    } else if (op === 'sub') {
      const hi = [999, 9999, 99999][level - 1];
      a = rand(100, hi); b = rand(10, a); ans = a - b; sym = '−';
    } else if (op === 'mul') {
      if (level === 1) { a = rand(2, 12); b = rand(2, 9); }
      else if (level === 2) { a = rand(11, 99); b = rand(2, 9); }
      else { a = rand(100, 999); b = rand(2, 9); }
      ans = a * b; sym = '×';
    } else {
      b = rand(2, 9);
      const c = level === 2 ? rand(2, 12) : rand(11, 99);
      a = b * c; ans = c; sym = '÷';
    }
    return { prompt: `${fmtNum(a)} ${sym} ${fmtNum(b)} = ?`, answer: ans };
  },
};
