// Every island's questions, plus backup files and streaks. Run with: node test/skills.test.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { SKILLS } from '../src/skills/index.js';
import { BOSSES } from '../src/creatures.js';
import { icon } from '../src/icons.js';
import { db, readBackup } from '../src/db.js';
import { streakNow, record, finishSession } from '../src/engine.js';

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
    if ((m = p.match(/^How many years are in (\d+) (\w+)\?/))) return m[1] * UNIT[m[2]];
    if ((m = p.match(/^How many (\w+) are in ([\d ]+) years\?/))) return num(m[2]) / UNIT[m[1]];
    if ((m = p.match(/^(\d+) (\w+) and (\d+) (\w+)\. How many years/))) return m[1] * UNIT[m[2]] + m[3] * UNIT[m[4]];
    if ((m = p.match(/in (\d+)\. How many decades old is it in (\d+)\?/))) return (m[2] - m[1]) / 10;
    if ((m = p.match(/^(\d+) (\w+) take away (\d+) (\w+)\./))) return m[1] * UNIT[m[2]] - m[3] * UNIT[m[4]];
    throw new Error(`unknown Time Travel question: ${p}`);
  },
  pre_coins(q) {
    const m = q.prompt.match(/Tap the <b>(\d+) sen<\/b>/);
    if (m) return Number(m[1]);
    return [...q.visual.matchAll(/(\d+) sen coin/g)].reduce((s, x) => s + Number(x[1]), 0);
  },
  pre_compare(q) {
    const [a, b] = q.choices.slice(0, 2).map(c => Number(c.html.match(/aria-label="(\d+) /)[1]));
    if (a === b) return 'same';
    return (a > b) === q.prompt.includes(' more ') ? 'a' : 'b';
  },
};

for (const s of SKILLS) {
  for (const level of [1, 2, 3]) {
    for (let i = 0; i < 300; i++) {
      const q = s.generate(level);
      const where = `${s.id} level ${level}: "${q.prompt}"`;
      if (expected[s.id]) assert.equal(q.answer, expected[s.id](q), `${where}: wrong answer`);
      if (s.gameType !== 'choice') continue;
      const vals = q.choices.map(c => String(c.value ?? c));
      assert.ok(vals.length >= 2, `${where}: fewer than 2 choices`);
      assert.equal(new Set(vals).size, vals.length, `${where}: duplicate choices ${vals}`);
      assert.equal(vals.filter(v => v === String(q.answer)).length, 1, `${where}: answer ${q.answer} not in ${vals}`);
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
