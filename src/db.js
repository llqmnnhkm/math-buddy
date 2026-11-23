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

export const db = {
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
