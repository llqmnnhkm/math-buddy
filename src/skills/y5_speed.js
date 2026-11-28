import { rand, pick, fmtNum } from './util.js';
import { columnForm } from '../column.js';

// Whole numbers and basic operations (KSSR Year 5, topic 1), shown in bentuk lazim.
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
    // KSSR Year 5 stays under 1 000 000, and multiplies or divides by one or two digits.
    const i = level - 1;
    if (op === 'add') {
      const hi = [500, 5000, 50000, 200000, 350000, 499999][i];
      a = rand(10, hi); b = rand(10, hi); ans = a + b; sym = '+';
    } else if (op === 'sub') {
      const hi = [999, 9999, 99999, 499999, 799999, 999999][i];
      a = rand(100, hi); b = rand(10, a); ans = a - b; sym = '−';
    } else if (op === 'mul') {
      const [[a1, a2], [b1, b2]] = [
        [[2, 12], [2, 9]], [[11, 99], [2, 9]], [[100, 999], [2, 9]],
        [[1000, 9999], [2, 9]], [[100, 999], [11, 99]], [[1000, 9999], [11, 99]],
      ][i];
      a = rand(a1, a2); b = rand(b1, b2); ans = a * b; sym = '×';
    } else {
      const [[b1, b2], [c1, c2]] = [
        null, [[2, 9], [2, 12]], [[2, 9], [11, 99]],
        [[2, 9], [100, 999]], [[11, 25], [11, 99]], [[11, 99], [100, 999]],
      ][i];
      b = rand(b1, b2);
      const c = rand(c1, c2);
      a = b * c; ans = c; sym = '÷';
    }
    const col = { a, b, op };
    return {
      prompt: 'Solve it!',
      speak: `${a} ${{ add: 'plus', sub: 'minus', mul: 'times', div: 'divided by' }[op]} ${b}`,
      text: `${fmtNum(a)} ${sym} ${fmtNum(b)}`,
      col,
      visual: columnForm(col), // used by the boss battle
      answer: ans,
      explanation: `${fmtNum(a)} ${sym} ${fmtNum(b)} = ${fmtNum(ans)}.`,
    };
  },
};
