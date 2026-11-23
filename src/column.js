// "Bentuk lazim" (column method): numbers lined up by place value, operator on the
// left, a line under the question and the answer below it. Division uses the long
// division (bahagi panjang) layout with the answer above the bracket.
import { fmtNum } from './skills/util.js';

const SYMBOL = { add: '+', sub: '−', mul: '×' };
const WORD = { add: 'plus', sub: 'minus', mul: 'times', div: 'divided by' };

/**
 * @param {{a:number,b:number,op:'add'|'sub'|'mul'|'div'}} col
 * @param {string} answer  text to show in the answer row ('' or '?')
 * @param {string} id      optional id for the answer element, so the game can update it
 */
export function columnForm({ a, b, op }, answer = '', id = '') {
  const A = fmtNum(a);
  const B = fmtNum(b);
  const idAttr = id ? ` id="${id}"` : '';
  const label = `${a} ${WORD[op]} ${b}`;

  if (op === 'div') {
    return `<div class="colform div" role="img" aria-label="${label}">
      <span></span><span class="col-ans"${idAttr}>${answer}</span>
      <span class="div-b">${B}</span><span class="div-a">${A}</span>
    </div>`;
  }

  // Room for the widest number, plus the operator and one extra digit for carrying.
  const w = Math.max(A.length, B.length) + 2;
  return `<div class="colform" style="--w:${w}ch" role="img" aria-label="${label}">
    <div class="col-row">${A}</div>
    <div class="col-row"><span class="col-op">${SYMBOL[op]}</span>${B}</div>
    <div class="col-line"></div>
    <div class="col-row col-ans"${idAttr}>${answer}</div>
    <div class="col-line double"></div>
  </div>`;
}
