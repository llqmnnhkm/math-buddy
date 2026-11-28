import { rand, pick, numChoices } from './util.js';
import { ITEMS, itemRows, tenFrames, COUNTER_RED, COUNTER_BLUE } from '../art.js';

const THINGS = ['apple', 'ball', 'cookie', 'star', 'fish'];

export default {
  id: 'pre_add',
  mode: 'pre',
  name: 'Add It Up',
  topic: 'Adding & taking away',
  icon: 'plus-minus',
  hue: 140,
  gameType: 'choice',
  generate(level) {
    if (level === 4) {
      // Adding within 20 on two ten frames: fill one frame to make 10, then count on.
      const a = rand(3, 12);
      const b = rand(Math.max(1, 11 - a), 20 - a);
      return {
        prompt: `${a} red and ${b} blue. How many altogether?`,
        visual: tenFrames([{ n: a, color: COUNTER_RED }, { n: b, color: COUNTER_BLUE }]),
        answer: a + b,
        choices: numChoices(a + b, 3, 2, 1),
        choiceClass: 'big',
        explanation: `${a} and ${b} more makes ${a + b}. A full frame is 10, then count on the rest!`,
      };
    }
    if (level === 5) {
      // Taking away within 20: the last counters are crossed out.
      const a = rand(11, 20);
      const b = rand(2, a - 1);
      return {
        prompt: `${a} dots. ${b} are crossed out. How many are left?`,
        visual: tenFrames([{ n: a, color: COUNTER_RED }], b),
        answer: a - b,
        choices: numChoices(a - b, 3, 2, 0),
        choiceClass: 'big',
        explanation: `${a} take away ${b} leaves ${a - b}. Count the dots that are not crossed out!`,
      };
    }
    if (level === 6) {
      // Missing number: how many more to make the total.
      const c = rand(5, 10);
      const a = rand(1, c - 1);
      return {
        prompt: `${a} and how many more make ${c}?`,
        visual: `<div class="stack"><div class="eq">${a} + ? = ${c}</div>${tenFrames([{ n: a, color: COUNTER_RED }])}</div>`,
        answer: c - a,
        choices: numChoices(c - a, 3, 2, 1),
        choiceClass: 'big',
        explanation: `Start at ${a} and count up to ${c}: ${Array.from({ length: c - a }, (_, i) => a + i + 1).join(', ')}. That is ${c - a} more!`,
      };
    }
    if (level === 3) {
      // Taking away within 10: some birds fly away.
      const a = rand(3, 10);
      const b = rand(1, a - 1);
      const ans = a - b;
      return {
        prompt: `${a} birds. ${b} fly away. How many are left?`,
        visual: `<div class="take-away">${itemRows('bird', ans)}<div class="flown">${itemRows('bird', b, 'gone')}</div></div>`,
        answer: ans,
        choices: numChoices(ans, 3, 2, 0),
        choiceClass: 'big',
        explanation: `${a} take away ${b} leaves ${ans}. Count the birds that stayed!`,
      };
    }
    if (level === 2) {
      // Adding within 10 on a ten frame, two colours.
      const a = rand(1, 8);
      const b = rand(1, 10 - a);
      return {
        prompt: `${a} red and ${b} blue. How many altogether?`,
        visual: tenFrames([{ n: a, color: COUNTER_RED }, { n: b, color: COUNTER_BLUE }]),
        answer: a + b,
        choices: numChoices(a + b, 3, 2, 1),
        choiceClass: 'big',
        explanation: `${a} and ${b} more makes ${a + b}. Count all the dots together!`,
      };
    }
    // Adding within 5 with pictures.
    const a = rand(1, 4);
    const b = rand(1, 5 - a);
    const id = pick(THINGS);
    const word = ITEMS[id].word;
    return {
      prompt: `${a} ${word} and ${b} more. How many altogether?`,
      visual: `<div class="sum-row"><div class="group">${itemRows(id, a)}</div><div class="op">+</div><div class="group">${itemRows(id, b)}</div></div>`,
      answer: a + b,
      choices: numChoices(a + b, 3, 2, 1),
      choiceClass: 'big',
      explanation: `${a} and ${b} more makes ${a + b}. Count them all together!`,
    };
  },
};
