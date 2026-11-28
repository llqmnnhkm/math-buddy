// Every island's questions, plus backup files and streaks. Run with: node test/skills.test.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { SKILLS } from '../src/skills/index.js';
import { BOSSES } from '../src/creatures.js';
import { icon } from '../src/icons.js';
import { db, readBackup } from '../src/db.js';
import { streakNow, record, finishSession, MAX_LEVEL } from '../src/engine.js';
import { answerBoxes } from '../src/column.js';

/* ---------- Every skill is wired up ---------- */

const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
for (const f of readdirSync(new URL('../src/skills/', import.meta.url))) {
  assert.ok(sw.includes(`'./src/skills/${f}'`), `sw.js FILES is missing src/skills/${f}, so it won't work offline`);
}
for (const s of SKILLS) {
  assert.ok(BOSSES[s.id], `${s.id}: add a boss in creatures.js BOSSES`);
  assert.ok(icon(s.icon).includes('<path'), `${s.id}: icon "${s.icon}" is not in icons.js`);
}

/* ---------- Questions: one right answer among unique choices ---------- */

const UNIT = { century: 100, centuries: 100, decade: 10, decades: 10, year: 1, years: 1 };
const num = s => Number(s.replace(/ /g, ''));

// Work the answer out again from the question itself, for the new islands.
const expected = {
  y5_time(q) {
    const p = q.prompt;
    let m;
    if ((m = p.match(/^How many months are in (\d+) years\?/))) return m[1] * 12;
    if ((m = p.match(/^(\d+) years and (\d+) months?\. How many months/))) return m[1] * 12 + Number(m[2]);
    if ((m = p.match(/^How many years are in (\d+) (\w+)\?/))) return m[1] * UNIT[m[2]];
    if ((m = p.match(/^How many (\w+) are in ([\d ]+) years\?/))) return num(m[2]) / UNIT[m[1]];
    if ((m = p.match(/^(\d+) (\w+) and (\d+) (\w+)\. How many years/))) return m[1] * UNIT[m[2]] + m[3] * UNIT[m[4]];
    if ((m = p.match(/in (\d+)\. How many decades old is it in (\d+)\?/))) return (m[2] - m[1]) / 10;
    if ((m = p.match(/^(\d+) (\w+) take away (\d+) (\w+)\./))) return m[1] * UNIT[m[2]] - m[3] * UNIT[m[4]];
    if ((m = p.match(/<span>(\d+)<\/span><span>(\d+)<\/span><\/span> of a (century|decade) in years\?/))) return (m[1] * UNIT[m[3]]) / m[2];
    if ((m = p.match(/temple is (\d+) \w+ (\d+) \w+ old\. A clock tower is (\d+) \w+ (\d+) \w+ old/))) return (m[1] - m[3]) * 100 + (m[2] - m[4]) * 10;
    throw new Error(`unknown Time Travel question: ${p}`);
  },
  y5_rounding(q) {
    const m = q.prompt.match(/^Round <b>([\d .]+)<\/b> to (?:the nearest ([\d ]+)|(\d) decimal places?|the nearest whole number)\./);
    if (m[2]) return Math.round(num(m[1]) / num(m[2])) * num(m[2]);
    const dp = Number(m[3] ?? 0);
    const r = Math.round(Number(m[1].replace('.', '')) / 10 ** (3 - dp)); // shown with 3 decimals
    return (r / 10 ** dp).toFixed(dp);
  },
  y5_fractions(q) {
    let m;
    if ((m = q.prompt.match(/<span>(\d+)<\/span><span>(\d+)<\/span><\/span> of (\d+)\?/))) return (m[1] * m[3]) / m[2];
    if ((m = q.prompt.match(/^What is (\d+)% of (\d+)\?/))) return (m[1] * m[2]) / 100;
    if (q.visual?.includes(' + ')) { // adding: compare by value, the answer may use either denominator
      const [x, y] = [...q.visual.matchAll(/<span>(\d+)<\/span><span>(\d+)<\/span>/g)].map(f => f[1] / f[2]);
      return Math.abs(x + y - valueOf(q.answer)) < 1e-9 ? q.answer : `a fraction equal to ${x + y}`;
    }
    return undefined;
  },
  y5_money(q) {
    const sen = s => Math.round(parseFloat(s) * 100);
    let m;
    if ((m = q.prompt.match(/^(\d+) .+ cost RM([\d.]+) altogether/))) return sen(m[2]) / m[1];
    if ((m = q.prompt.match(/costs RM([\d.]+)\. Today it is (\d+)% off/))) return (sen(m[1]) * (100 - m[2])) / 100;
    if ((m = q.prompt.match(/saves RM([\d.]+) every day for (\d+) weeks, then buys a .+ for RM([\d.]+)\./))) return sen(m[1]) * 7 * m[2] - sen(m[3]);
    return undefined; // levels 1 to 3 are not worked out again here
  },
  pre_coins(q) {
    const coinSum = html => [...html.matchAll(/(\d+) sen coin/g)].reduce((s, x) => s + Number(x[1]), 0);
    let m = q.prompt.match(/Tap the <b>(\d+) sen<\/b>/);
    if (m) return Number(m[1]);
    if ((m = q.prompt.match(/costs (\d+) sen\. Tap the coins/))) { // every set of coins must add up to its value
      const bad = q.choices.find(c => coinSum(c.html) !== c.value);
      return bad ? `coins adding to ${bad.value}, not ${coinSum(bad.html)}` : Number(m[1]);
    }
    return coinSum(q.visual);
  },
  pre_compare(q) {
    if (q.prompt.startsWith('How many more')) {
      const [a, b] = [...q.visual.matchAll(/aria-label="(\d+) /g)].map(x => Number(x[1]));
      return Math.abs(a - b);
    }
    const [a, b] = q.choices.slice(0, 2).map(c => Number(c.html.match(/aria-label="(\d+) /)[1]));
    if (a === b) return 'same';
    return (a > b) === /\bmore\b/.test(q.prompt) ? 'a' : 'b';
  },
  pre_add(q) {
    let m;
    if ((m = q.prompt.match(/^(\d+) (?:red and|\w+ and) (\d+) (?:blue|more)\. How many altogether/))) return Number(m[1]) + Number(m[2]);
    if ((m = q.prompt.match(/^(\d+) (?:birds|dots)\. (\d+) (?:fly away|are crossed out)\. How many are left/))) return m[1] - m[2];
    if ((m = q.prompt.match(/^(\d+) and how many more make (\d+)\?/))) return m[2] - m[1];
    throw new Error(`unknown Add It Up question: ${q.prompt}`);
  },
};

// '3/4' or '0.75' as a number, so 2/4 can't sit next to the answer 1/2 as a "wrong" choice.
const valueOf = v => (/^\d+\/\d+$/.test(v) ? v.split('/')[0] / v.split('/')[1] : Number(v));
const SPEED = { add: (a, b) => a + b, sub: (a, b) => a - b, mul: (a, b) => a * b, div: (a, b) => a / b };

for (const s of SKILLS) {
  for (let level = 1; level <= MAX_LEVEL; level++) {
    for (let i = 0; i < 300; i++) {
      const q = s.generate(level);
      const where = `${s.id} level ${level}: "${q.prompt}"`;
      const want = expected[s.id]?.(q);
      if (want !== undefined) assert.equal(q.answer, want, `${where}: wrong answer`);
      if (s.gameType === 'speed') {
        const { a, b, op } = q.col;
        assert.equal(q.answer, SPEED[op](a, b), `${where}: ${a} ${op} ${b} wrong answer`);
        assert.ok(Number.isInteger(q.answer) && q.answer >= 0, `${where}: answer ${q.answer}`);
        assert.ok(String(q.answer).length <= answerBoxes(q.col), `${where}: answer doesn't fit its boxes`);
        continue;
      }
      const vals = (q.numbers ?? q.choices).map(c => String(c.value ?? c));
      assert.ok(vals.length >= 2, `${where}: fewer than 2 choices`);
      assert.equal(new Set(vals).size, vals.length, `${where}: duplicate choices ${vals}`);
      assert.equal(vals.filter(v => v === String(q.answer)).length, 1, `${where}: answer ${q.answer} not in ${vals}`);
      const ans = valueOf(String(q.answer));
      if (!Number.isNaN(ans)) {
        assert.equal(vals.filter(v => Math.abs(valueOf(v) - ans) < 1e-9).length, 1, `${where}: a wrong choice equals the answer ${q.answer} in ${vals}`);
      }
      if (typeof q.answer === 'number') {
        assert.ok(vals.every(v => Number.isInteger(Number(v)) && Number(v) >= 0), `${where}: odd choice in ${vals}`);
      }
    }
  }
}

/* ---------- Backup files ---------- */

// A backup the app makes itself, from a player who has played, must restore.
const player = db.addProfile("D'Arcy", 'cat');
record(player, 'y5_time', true);
finishSession(player, 'y5_time', { correct: 3, total: 5 });
assert.equal(readBackup(db.backup())[0].name, "D'Arcy");

const backup = profiles => JSON.stringify({ app: 'math-buddy', version: 1, profiles });
const good = { id: 'abc123', name: "D'Arcy & Co", stars: 3, streak: { count: 1, last: '2026-11-28' }, skills: { y5_time: { level: 2 } } };
assert.equal(readBackup(backup([good])).length, 1);
for (const [why, text] of [
  ['not JSON', 'hello'],
  ['another app', JSON.stringify({ app: 'other', profiles: [] })],
  ['html in an id', backup([{ ...good, avatar: '<img src=x onerror=alert(1)>' }])],
  ['html in a key', backup([{ ...good, trophies: { '<b>': true } }])],
  ['stars not a number', backup([{ ...good, stars: '5' }])],
  ['blank name', backup([{ ...good, name: ' ' }])],
  ['stickers not a list', backup([{ ...good, stickers: 5 }])],
  ['streak missing its object', backup([{ ...good, streak: null }])],
  ['a skill that is a number', backup([{ ...good, skills: { y5_time: 5 } }])],
]) assert.throws(() => readBackup(text), /not a Math Buddy backup/, `backup with ${why} should be refused`);

/* ---------- Streak shown on screen ---------- */

const dayKey = n => { const d = new Date(); d.setDate(d.getDate() - n); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
assert.equal(streakNow({ streak: { count: 5, last: dayKey(0) } }), 5);
assert.equal(streakNow({ streak: { count: 5, last: dayKey(2) } }), 5); // one missed day is forgiven
assert.equal(streakNow({ streak: { count: 5, last: dayKey(3) } }), 0);
assert.equal(streakNow({ streak: { count: 0, last: null } }), 0);
