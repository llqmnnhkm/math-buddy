import { rand, pick, shuffle, numChoices } from './util.js';
import { ITEMS, ITEM_IDS, itemRows } from '../art.js';

// More, less, same: tap the group with more (or fewer). From level 3 there is a "Same" button.
const COUNTABLE = ITEM_IDS.filter(id => id !== 'bird');
const groupArt = (id, n) => `<span role="img" aria-label="${n} ${ITEMS[id].word}">${itemRows(id, n)}</span>`;

export default {
  id: 'pre_compare',
  mode: 'pre',
  name: 'More or Less',
  topic: 'More, less & same',
  icon: 'scales',
  hue: 280,
  gameType: 'choice',
  generate(level) {
    // Level 5 and 6 use different things in each group, so children compare how many, not how they look.
    const [idA, idB] = level >= 5 ? shuffle(COUNTABLE).slice(0, 2) : Array(2).fill(pick(COUNTABLE));
    const max = [5, 10, 10, 20, 10, 10][level - 1];
    const same = level >= 3 && level <= 5 && Math.random() < 0.3;
    const a = rand(1, max);
    let b = a;
    // Level 1 keeps the groups at least 2 apart, so the difference is easy to see.
    while (!same && (b === a || (level === 1 && Math.abs(a - b) < 2))) b = rand(1, max);
    const [hi, lo] = [Math.max(a, b), Math.min(a, b)];

    if (level === 6) {
      const [more, fewer] = a > b ? [idA, idB] : [idB, idA];
      return {
        prompt: `How many more ${ITEMS[more].word} than ${ITEMS[fewer].word}?`,
        visual: `<div class="sum-row"><div class="group">${groupArt(idA, a)}</div><div class="group">${groupArt(idB, b)}</div></div>`,
        answer: hi - lo,
        choices: numChoices(hi - lo, 3, 2, 1),
        choiceClass: 'big',
        explanation: `Match them up in pairs: ${lo} and ${lo}. ${hi - lo} ${ITEMS[more].word} are left over, so there are ${hi - lo} more.`,
      };
    }

    const more = level === 1 || Math.random() < 0.5;
    const choices = [{ html: groupArt(idA, a), value: 'a' }, { html: groupArt(idB, b), value: 'b' }];
    if (level >= 3) choices.push({ html: 'Same', value: 'same' });
    const word = idA === idB ? ` ${ITEMS[idA].word}` : '';
    return {
      prompt: `Which group has ${more ? 'more' : 'fewer'}${word}?`,
      answer: a === b ? 'same' : (a > b) === more ? 'a' : 'b',
      choices,
      choiceClass: 'groups',
      explanation: a === b
        ? `Both groups have ${a}. They are the same!`
        : `Count them: ${a} and ${b}. ${more ? `${hi} is more than ${lo}` : `${lo} is fewer than ${hi}`}.`,
    };
  },
};
