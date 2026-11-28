import { rand, pick, fmtNum, withDistractors, frac, fracWords } from './util.js';

// Time (KSSR Year 5, topic 4): years, decades and centuries.
const UNITS = [
  { one: 'decade', many: 'decades', years: 10 },
  { one: 'century', many: 'centuries', years: 100 },
];
const THINGS = ['A tree was planted', 'A school was built', 'A bridge was built', 'A clock tower was built'];
const opt = v => ({ html: fmtNum(v), value: v });
const choose = (ans, wrong) => withDistractors(opt(ans), wrong.filter(x => x > 0 && Number.isInteger(x)).map(opt), 4, x => String(x.value));

export default {
  id: 'y5_time',
  mode: 'y5',
  name: 'Time Travel',
  topic: 'Decades & centuries',
  icon: 'hourglass',
  hue: 50,
  gameType: 'choice',
  generate(level) {
    if (level === 4) {
      // Years and months.
      const y = rand(2, 9);
      if (Math.random() < 0.5) {
        return {
          prompt: `How many months are in ${y} years?`,
          answer: y * 12,
          choices: choose(y * 12, [y * 10, y * 12 + 12, y * 12 - 12, y * 7]),
          explanation: `1 year is 12 months, so ${y} years is ${y} × 12 = ${y * 12} months.`,
        };
      }
      const m = rand(1, 11);
      const ans = y * 12 + m;
      return {
        prompt: `${y} years and ${m} ${m === 1 ? 'month' : 'months'}. How many months is that?`,
        answer: ans,
        choices: choose(ans, [y * 10 + m, y + m, ans + 12, ans - 12]),
        explanation: `${y} years = ${y} × 12 = ${y * 12} months. Add ${m} more: ${ans} months.`,
      };
    }
    if (level === 5) {
      // Fractions of a century or decade: 3/4 of a century is 75 years.
      const century = Math.random() < 0.7;
      const [n, d] = pick(century ? [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [7, 10]] : [[1, 2], [1, 5], [2, 5], [3, 5], [4, 5]]);
      const size = century ? 100 : 10;
      const ans = (size / d) * n;
      const unit = century ? 'century' : 'decade';
      return {
        prompt: `What is ${frac(n, d).html} of a ${unit} in years?`,
        speak: `What is ${fracWords(n, d)} of a ${unit} in years?`,
        answer: ans,
        choices: choose(ans, [size / d, ans * 10, size - ans, (100 / size) * ans, ans + size / d]),
        explanation: `1 ${unit} is ${size} years. ${size} ÷ ${d} = ${size / d}, and ${n} × ${size / d} = ${ans} years.`,
      };
    }
    if (level === 6) {
      // Two steps: change both ages to years, then subtract.
      const age = () => [rand(1, 4), rand(1, 9)];
      let [a, b] = [age(), age()];
      while (a[0] * 100 + a[1] * 10 <= b[0] * 100 + b[1] * 10) [a, b] = [age(), age()];
      const [ya, yb] = [a[0] * 100 + a[1] * 10, b[0] * 100 + b[1] * 10];
      const say = ([c, d]) => `${c} ${c === 1 ? 'century' : 'centuries'} ${d} ${d === 1 ? 'decade' : 'decades'}`;
      return {
        prompt: `A temple is ${say(a)} old. A clock tower is ${say(b)} old. How many years older is the temple?`,
        answer: ya - yb,
        choices: choose(ya - yb, [ya + yb, (a[0] - b[0]) * 100 + Math.abs(a[1] - b[1]) * 10, ya - yb + 10, ya - yb - 10]),
        explanation: `The temple is ${ya} years old and the clock tower is ${yb} years old. ${ya} − ${yb} = ${ya - yb} years.`,
      };
    }
    if (level === 1) {
      // One unit at a time: decades or centuries to years, and back.
      const u = pick(UNITS);
      const other = u.years === 10 ? 100 : 10;
      const n = rand(2, 9);
      const years = n * u.years;
      if (Math.random() < 0.5) {
        return {
          prompt: `How many years are in ${n} ${u.many}?`,
          answer: years,
          choices: choose(years, [n * other, years + u.years, years - u.years, n + u.years]),
          explanation: `1 ${u.one} is ${u.years} years, so ${n} ${u.many} is ${n} × ${u.years} = ${fmtNum(years)} years.`,
        };
      }
      return {
        prompt: `How many ${u.many} are in ${fmtNum(years)} years?`,
        answer: n,
        choices: choose(n, [n + 1, n - 1, years / other, n * 10]),
        explanation: `1 ${u.one} is ${u.years} years, so ${fmtNum(years)} ÷ ${u.years} = ${n} ${u.many}.`,
      };
    }
    if (level === 2) {
      // Mixed units to years: 2 centuries 3 decades, or 4 decades 6 years.
      const big = Math.random() < 0.5;
      const a = rand(1, 9), b = rand(1, 9);
      const [ua, ub, sa, sb] = big ? ['century', 'decade', 100, 10] : ['decade', 'year', 10, 1];
      const ans = a * sa + b * sb;
      const name = (n, u) => `${n} ${n === 1 ? u : u === 'century' ? 'centuries' : `${u}s`}`;
      return {
        prompt: `${name(a, ua)} and ${name(b, ub)}. How many years is that?`,
        answer: ans,
        choices: choose(ans, [a * sb + b * sa, a * 10 + b, ans + sa, ans + sb, a * sa + b]),
        explanation: `${name(a, ua)} = ${fmtNum(a * sa)} years and ${name(b, ub)} = ${b * sb} ${b * sb === 1 ? 'year' : 'years'}. Together: ${fmtNum(ans)} years.`,
      };
    }
    if (Math.random() < 0.5) {
      // How many decades between two years.
      const start = rand(190, 200) * 10;
      const k = rand(2, 9);
      const end = start + k * 10;
      return {
        prompt: `${pick(THINGS)} in ${start}. How many decades old is it in ${end}?`,
        answer: k,
        choices: choose(k, [k * 10, k + 1, k - 1, k + 2]),
        explanation: `From ${start} to ${end} is ${end} − ${start} = ${k * 10} years. 10 years is 1 decade, so it is ${k} decades.`,
      };
    }
    // Take decades away from centuries.
    const c = rand(1, 5), d = rand(1, 9);
    const ans = c * 100 - d * 10;
    return {
      prompt: `${c} ${c === 1 ? 'century' : 'centuries'} take away ${d} ${d === 1 ? 'decade' : 'decades'}. How many years are left?`,
      answer: ans,
      choices: choose(ans, [c * 100 - d, c * 100 + d * 10, ans - 10, ans + 10]),
      explanation: `${c} ${c === 1 ? 'century' : 'centuries'} = ${c * 100} years and ${d} ${d === 1 ? 'decade' : 'decades'} = ${d * 10} years. ${c * 100} − ${d * 10} = ${ans} years.`,
    };
  },
};
