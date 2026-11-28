import { rand, pick } from './util.js';
import { ITEMS, ITEM_IDS, itemRows } from '../art.js';

// More, less, same: tap the group with more (or fewer). Level 3 adds a "Same" button.
const COUNTABLE = ITEM_IDS.filter(id => id !== 'bird');
const group = (id, n, value) => ({ html: `<span role="img" aria-label="${n} ${ITEMS[id].word}">${itemRows(id, n)}</span>`, value });

export default {
  id: 'pre_compare',
  mode: 'pre',
  name: 'More or Less',
  topic: 'More, less & same',
  icon: 'scales',
  hue: 280,
  gameType: 'choice',
  generate(level) {
    const id = pick(COUNTABLE);
    const word = ITEMS[id].word;
    const max = level === 1 ? 5 : 10;
    const same = level === 3 && Math.random() < 0.3;
    const a = rand(1, max);
    let b = a;
    // Level 1 keeps the groups at least 2 apart, so the difference is easy to see.
    while (!same && (b === a || (level === 1 && Math.abs(a - b) < 2))) b = rand(1, max);
    const more = level === 1 || Math.random() < 0.5;
    const ask = more ? 'more' : 'fewer';

    const choices = [group(id, a, 'a'), group(id, b, 'b')];
    if (level === 3) choices.push({ html: 'Same', value: 'same' });
    const answer = a === b ? 'same' : (a > b) === more ? 'a' : 'b';
    const [hi, lo] = [Math.max(a, b), Math.min(a, b)];
    return {
      prompt: `Which group has ${ask} ${word}?`,
      answer,
      choices,
      choiceClass: 'groups',
      explanation: a === b
        ? `Both groups have ${a}. They are the same!`
        : `Count them: ${a} and ${b}. ${more ? `${hi} is more than ${lo}` : `${lo} is fewer than ${hi}`}.`,
    };
  },
};
