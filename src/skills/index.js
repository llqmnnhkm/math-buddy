// Register every skill here. To add a skill: create a file with
// { id, mode, name, topic, icon, hue, gameType, generate(level) } and import it below.
import preCount from './pre_count.js';
import preBalloon from './pre_balloon.js';
import preAdd from './pre_add.js';
import preShapes from './pre_shapes.js';
import y5Speed from './y5_speed.js';
import y5Fractions from './y5_fractions.js';
import y5Rounding from './y5_rounding.js';
import y5Money from './y5_money.js';
import preCompare from './pre_compare.js';
import preCoins from './pre_coins.js';
import y5Time from './y5_time.js';

export const SKILLS = [
  preCount, preBalloon, preAdd, preShapes, preCompare, preCoins,
  y5Speed, y5Rounding, y5Fractions, y5Money, y5Time,
];
export const skillsFor = mode => SKILLS.filter(s => s.mode === mode);
export const getSkill = id => SKILLS.find(s => s.id === id);
