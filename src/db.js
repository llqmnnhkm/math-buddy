// Local storage for profiles and progress. Everything stays on this device.
const KEY = 'mathbuddy:v1';

const blank = () => ({ profiles: [], current: null });

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || blank();
  } catch {
    return blank();
  }
}

const state = load();

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: keep playing in memory */
  }
}

const newSkill = () => ({
  level: 1, attempts: 0, correct: 0, recent: [], wrongRun: 0, mastery: 0, last: null,
});

const freshProgress = () => ({
  stars: 0, totalStars: 0, stickers: [], badges: [], skills: {}, best: {},
  streak: { count: 0, last: null }, sessions: [],
  egg: { cracks: 0, need: 2 }, creatures: [], trophies: {}, outfit: {}, closet: [],
});

/** Fill in fields added in later versions so older saved players keep working. */
export function upgradeProfile(p) {
  const base = freshProgress();
  for (const k of Object.keys(base)) if (p[k] === undefined) p[k] = base[k];
  return p;
}

/* ---------- Backup file ---------- */

const NOT_BACKUP = 'This is not a Math Buddy backup file.';

/** Every value in a backup must be plain data: ids made of safe characters, finite numbers. */
function checkValue(v, key) {
  if (typeof v === 'string') {
    // Names are escaped wherever they are shown; every other string is an id or a date.
    if (key !== 'name' && !/^[\w .:-]*$/.test(v)) throw new Error(NOT_BACKUP);
  } else if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new Error(NOT_BACKUP);
  } else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      if (!/^[\w .:-]*$/.test(k)) throw new Error(NOT_BACKUP);
      checkValue(x, k);
    }
  } else if (v !== null && typeof v !== 'boolean') throw new Error(NOT_BACKUP);
}

/** Parse and check a backup file's text. Returns its profiles, or throws with a short reason. */
export function readBackup(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(NOT_BACKUP); }
  if (data?.app !== 'math-buddy' || !Array.isArray(data.profiles)) throw new Error(NOT_BACKUP);
  for (const p of data.profiles) {
    if (typeof p?.id !== 'string' || typeof p.name !== 'string' || !p.name.trim() || typeof p.stars !== 'number') throw new Error(NOT_BACKUP);
    checkValue(p);
    // Each saved field must have the shape the app expects (a list stays a list), or the app would fail on every start.
    for (const [k, v] of Object.entries(freshProgress())) {
      if (p[k] !== undefined && (p[k] === null || Array.isArray(p[k]) !== Array.isArray(v) || typeof p[k] !== typeof v)) throw new Error(NOT_BACKUP);
    }
    if (Object.values(p.skills || {}).some(s => !s || typeof s !== 'object' || Array.isArray(s))) throw new Error(NOT_BACKUP);
  }
  return data.profiles;
}

export const db = {
  backup() { return JSON.stringify({ app: 'math-buddy', version: 1, saved: Date.now(), profiles: state.profiles }); },

  /** Replace every player with the ones from a checked backup (from readBackup). */
  restore(profiles) {
    state.profiles = profiles;
    state.current = null;
    save();
  },

  get profiles() { return state.profiles; },

  current() { return state.profiles.find(p => p.id === state.current) || null; },

  setCurrent(id) { state.current = id; save(); },

  addProfile(name, avatar) {
    const p = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name, avatar, mode: null, created: Date.now(), ...freshProgress(),
    };
    state.profiles.push(p);
    state.current = p.id;
    save();
    return p;
  },

  setMode(p, mode) { p.mode = mode; save(); },

  skill(p, id) { return (p.skills[id] ||= newSkill()); },

  resetProfile(id) {
    const p = state.profiles.find(x => x.id === id);
    if (p) { Object.assign(p, freshProgress()); save(); }
  },

  deleteProfile(id) {
    state.profiles = state.profiles.filter(x => x.id !== id);
    if (state.current === id) state.current = null;
    save();
  },
};
