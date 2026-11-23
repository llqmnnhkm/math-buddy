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
    const max = [5, 10, 20][level - 1];
    const n = rand(1, max);
    // Half the time use ten frame counters, so children learn to see 5 and 10 at a glance.
    const useFrame = Math.random() < 0.5;
    const id = pick(COUNTABLE);
    const word = useFrame ? 'red dots' : ITEMS[id].word;
    return {
      prompt: `How many ${word}?`,
      visual: useFrame ? tenFrames([{ n, color: COUNTER_RED }]) : itemRows(id, n),
      answer: n,
      choices: numChoices(n, 3, 3, 1),
      choiceClass: 'big',
      explanation: `Let's count together: ${Array.from({ length: n }, (_, i) => i + 1).join(', ')}. There are ${n}!${useFrame && n >= 5 ? ' Tip: a full row has 5.' : ''}`,
    };
  },
};
