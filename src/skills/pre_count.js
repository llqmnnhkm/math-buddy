import { rand, pick, numChoices } from './util.js';
import { ITEMS, ITEM_IDS, itemRows, tenFrames, COUNTER_RED } from '../art.js';

const COUNTABLE = ITEM_IDS.filter(id => id !== 'bird');

export default {
  id: 'pre_count',
  mode: 'pre',
  name: 'Count With Me',
  topic: 'Counting',
  icon: 'hand-pointing',
  hue: 8,
  gameType: 'choice',
  generate(level) {
    const [min, max] = [[1, 5], [1, 10], [1, 20], [11, 30], [21, 40], [31, 50]][level - 1];
    const n = rand(min, max);
    // Half the time use ten frame counters, so children learn to see 5 and 10 at a glance.
    // Past 20, always ten frames: too many pictures to count one by one.
    const useFrame = n > 20 || Math.random() < 0.5;
    const id = pick(COUNTABLE);
    const word = useFrame ? 'red dots' : ITEMS[id].word;
    const tens = Math.floor(n / 10), ones = n % 10;
    return {
      prompt: `How many ${word}?`,
      visual: useFrame ? tenFrames([{ n, color: COUNTER_RED }]) : itemRows(id, n),
      answer: n,
      choices: numChoices(n, 3, level >= 4 ? 10 : 3, 1),
      choiceClass: 'big',
      explanation: n > 20
        ? `Count the full frames in tens: ${Array.from({ length: tens }, (_, i) => (i + 1) * 10).join(', ')}.${ones ? ` Then ${ones} more makes ${n}.` : ` That is ${n}!`}`
        : `Let's count together: ${Array.from({ length: n }, (_, i) => i + 1).join(', ')}. There are ${n}!${useFrame && n >= 5 ? ' Tip: a full row has 5.' : ''}`,
    };
  },
};
