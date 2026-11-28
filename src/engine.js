// Adaptive difficulty, stars, streaks, stickers and badges.
import { db, save } from './db.js';
import { STICKER_IDS } from './art.js';
import { CREATURES } from './creatures.js';
import { OUTFITS } from './fx.js';

export const MAX_LEVEL = 3;
export const STICKER_COST = 10;

export const STICKERS = STICKER_IDS;

export const BADGES = [
  { id: 'first', icon: 'confetti', name: 'First Round', desc: 'Finish your first game' },
  { id: 'perfect', icon: 'seal-check', name: 'Perfect!', desc: 'Every answer right on the first try' },
  { id: 'stars50', icon: 'star', name: 'Star Collector', desc: 'Earn 50 stars' },
  { id: 'streak3', icon: 'fire', name: 'On Fire', desc: 'Play 3 days in a row' },
  { id: 'speed20', icon: 'lightning', name: 'Lightning', desc: 'Score 20 in a Speed Round' },
  { id: 'stickers5', icon: 'sticker', name: 'Sticker Fan', desc: 'Collect 5 stickers' },
  { id: 'combo5', icon: 'sparkle', name: 'Combo Star', desc: 'Get 5 in a row' },
  { id: 'hatch', icon: 'egg-crack', name: 'Egg Hatcher', desc: 'Hatch your first creature' },
  { id: 'boss', icon: 'sword', name: 'Boss Beater', desc: 'Beat an island boss' },
  { id: 'dress', icon: 'coat-hanger', name: 'Dress Up', desc: 'Buy an outfit for Kiko' },
];

export const BOSS_REWARD = 15;
const EGG_NEED = 4; // rounds per egg after the first one (the first needs 2)

const sum = a => a.reduce((x, y) => x + y, 0);

/**
 * Record one answer. Level goes up after 4 of the last 5 correct,
 * and down after 2 wrong in a row, so children win about 80% of the time.
 */
export function record(p, skillId, correct) {
  const s = db.skill(p, skillId);
  const before = s.level;
  s.attempts++;
  if (correct) s.correct++;
  s.recent = [...(s.recent || []), correct ? 1 : 0].slice(-5);
  s.wrongRun = correct ? 0 : (s.wrongRun || 0) + 1;

  if (s.recent.length >= 5 && sum(s.recent) >= 4 && s.level < MAX_LEVEL) {
    s.level++;
    s.recent = [];
  } else if (s.wrongRun >= 2 && s.level > 1) {
    s.level--;
    s.wrongRun = 0;
    s.recent = [];
  }

  const acc = s.recent.length ? sum(s.recent) / s.recent.length : 0;
  s.mastery = Math.round(((s.level - 1) + acc) / MAX_LEVEL * 100);
  s.last = Date.now();
  save();
  return s.level - before; // +1 level up, -1 level down, 0 same
}

const dayKey = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };

const daysSince = key => Math.round((fromKey(dayKey(new Date())) - fromKey(key)) / 864e5);
const STREAK_GAP = 2; // forgiving: one missed day keeps the streak going

function updateStreak(p) {
  const key = dayKey(new Date());
  const st = p.streak;
  if (!st.last) { st.count = 1; }
  else if (st.last !== key) st.count = daysSince(st.last) <= STREAK_GAP ? st.count + 1 : 1;
  st.last = key;
}

/** Streak to show: 0 once it has lapsed, even before the next round resets it. */
export const streakNow = p => (p.streak.last && daysSince(p.streak.last) <= STREAK_GAP ? p.streak.count : 0);

function checkBadges(p, r) {
  const earned = [];
  const give = id => {
    if (!p.badges.includes(id)) { p.badges.push(id); earned.push(BADGES.find(b => b.id === id)); }
  };
  give('first');
  if (!r.speed && r.total >= 5 && r.correct === r.total) give('perfect');
  if (p.totalStars >= 50) give('stars50');
  if (p.streak.count >= 3) give('streak3');
  if (r.speed && r.correct >= 20) give('speed20');
  if (p.stickers.length >= 5) give('stickers5');
  if ((r.bestCombo || 0) >= 5) give('combo5');
  if (r.boss && r.won) give('boss');
  return earned;
}

/** Close a round: award stars, update streak, best score and badges. */
export function finishSession(p, skillId, r) {
  const ratio = r.total ? r.correct / r.total : 0;
  const rating = r.speed
    ? (r.correct >= 20 ? 3 : r.correct >= 10 ? 2 : 1)
    : (ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1);
  const base = Math.max(1, r.speed ? Math.ceil(r.correct / 2) : r.correct);
  const bonus = r.bonus || 0;
  const stars = base + bonus;

  p.stars += stars;
  p.totalStars = (p.totalStars || 0) + stars;

  let newBest = false;
  if (r.speed && r.correct > (p.best[skillId] || 0)) { p.best[skillId] = r.correct; newBest = r.correct > 0; }

  updateStreak(p);
  logSession(p, skillId, r.correct, r.total, stars);
  const egg = crackEgg(p);
  const newBadges = checkBadges(p, r);
  save();
  return { stars, base, bonus, rating, newBest, newBadges, egg };
}

function logSession(p, id, correct, total, stars, extra = {}) {
  p.sessions.push({ id, correct, total, stars, at: Date.now(), ...extra });
  if (p.sessions.length > 300) p.sessions.splice(0, p.sessions.length - 300);
}

/* ---------- Eggs ---------- */

/** Every finished round cracks the egg a little. */
function crackEgg(p) {
  p.egg.cracks = Math.min(p.egg.need, p.egg.cracks + 1);
  return { cracks: p.egg.cracks, need: p.egg.need, ready: p.egg.cracks >= p.egg.need };
}

export const eggReady = p => p.egg.cracks >= p.egg.need;

/** Hatch a creature the player does not have yet (bonus stars once all are collected). */
export function hatchEgg(p) {
  if (!eggReady(p)) return null;
  const left = CREATURES.filter(c => !p.creatures.includes(c.id));
  let c, extraStars = 0;
  if (left.length) {
    c = left[Math.floor(Math.random() * left.length)];
    p.creatures.push(c.id);
  } else {
    c = CREATURES[Math.floor(Math.random() * CREATURES.length)];
    extraStars = 20;
    p.stars += extraStars;
    p.totalStars += extraStars;
  }
  p.egg = { cracks: 0, need: EGG_NEED };
  const newBadges = [];
  if (!p.badges.includes('hatch')) { p.badges.push('hatch'); newBadges.push(BADGES.find(b => b.id === 'hatch')); }
  save();
  return { creature: c, extraStars, newBadges, complete: !left.length };
}

/* ---------- Boss battles ---------- */

export function finishBoss(p, skillId, won, correct, total) {
  const stars = won ? BOSS_REWARD : 2;
  p.stars += stars;
  p.totalStars = (p.totalStars || 0) + stars;
  const firstWin = won && !p.trophies[skillId];
  if (won) p.trophies[skillId] = true;
  updateStreak(p);
  logSession(p, skillId, correct, total, stars, { boss: true, won });
  const egg = crackEgg(p);
  const newBadges = checkBadges(p, { boss: true, won, correct, total });
  save();
  return { stars, firstWin, newBadges, egg };
}

/* ---------- Kiko's closet ---------- */

export function buyOutfit(p, id) {
  const item = OUTFITS.find(o => o.id === id);
  if (!item || p.closet.includes(id) || p.stars < item.price) return false;
  p.stars -= item.price;
  p.closet.push(id);
  p.outfit[item.slot] = id;
  if (!p.badges.includes('dress')) p.badges.push('dress');
  save();
  return true;
}

/** Wear an owned item, or take it off if already worn. */
export function toggleOutfit(p, id) {
  const item = OUTFITS.find(o => o.id === id);
  if (!item || !p.closet.includes(id)) return;
  p.outfit[item.slot] = p.outfit[item.slot] === id ? null : id;
  save();
}

export function buySticker(p, sticker) {
  if (p.stars < STICKER_COST || p.stickers.includes(sticker)) return false;
  p.stars -= STICKER_COST;
  p.stickers.push(sticker);
  if (p.stickers.length >= 5 && !p.badges.includes('stickers5')) p.badges.push('stickers5');
  save();
  return true;
}
