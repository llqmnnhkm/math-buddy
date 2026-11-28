// Speed Round answer boxes. Run with: node test/column.test.mjs  (no output means every check passed)
import assert from 'node:assert/strict';
import { readBoxes, answerBoxes, startBox } from '../src/column.js';

// vals[0] = ones, vals[1] = tens, ... as Speed Round stores them
const boxes = obj => Object.assign([], obj);

assert.equal(readBoxes([]), null);
assert.deepEqual(readBoxes(['3', '5']), { value: 53 });
assert.deepEqual(readBoxes(boxes({ 1: '5' })), { value: 50 }); // blank ones box under a filled tens box
assert.deepEqual(readBoxes(['3', undefined, '5']), { gap: 1 }); // empty tens between digits
assert.deepEqual(readBoxes(['0']), { value: 0 });
assert.deepEqual(readBoxes(['8', '0']), { value: 8 }); // a leading 0 is allowed

// Long division: typing the answer's digits left to right from the start box gives the answer.
for (let b = 2; b <= 9; b++) {
  for (let c = 2; c <= 99; c++) {
    const col = { a: b * c, b, op: 'div' };
    const n = answerBoxes(col);
    let active = startBox(col, c);
    assert.ok(active < n, `${b * c} ÷ ${b}: start box outside the boxes`);
    const vals = [];
    for (const d of String(c)) vals[active--] = d;
    assert.deepEqual(readBoxes(vals), { value: c }, `${b * c} ÷ ${b}`);
  }
}
