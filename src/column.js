// "Bentuk lazim" (column method). Every digit sits in its own place value column,
// so the answer boxes line up exactly under the ones, tens, hundreds...
// Division uses the long division (bahagi panjang) layout with boxes above the bracket.

const SYMBOL = { add: '+', sub: '−', mul: '×' };
const WORD = { add: 'plus', sub: 'minus', mul: 'times', div: 'divided by' };
const PLACE = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions'];

/** How many answer boxes: every place the answer could reach. */
export function answerBoxes({ a, b, op }) {
  const la = String(a).length;
  const lb = String(b).length;
  if (op === 'add') return Math.max(la, lb) + 1;
  if (op === 'mul') return la + lb;
  return la; // subtraction and division never need more places than the first number
}

/** Columns have a little extra room on the left where a thousands space would go. */
const template = n => Array.from({ length: n }, (_, i) => {
  const r = n - 1 - i; // place value of this column (0 = ones)
  return r % 3 === 2 && r < n - 1 ? 'calc(var(--cw) + 0.35em)' : 'var(--cw)';
}).join(' ');

const digitCells = (num, row, colOf) => String(num).split('').reverse()
  .map((d, r) => `<span class="cd" style="grid-row:${row};grid-column:${colOf(r)}">${d}</span>`).join('');

const boxCells = (n, row, colOf, interactive) => Array.from({ length: n }, (_, r) => {
  const tag = interactive ? 'button' : 'span';
  const extra = interactive ? ` type="button" aria-label="${PLACE[r] || 'digit'} box"` : '';
  return `<${tag} class="box" data-r="${r}"${extra} style="grid-row:${row};grid-column:${colOf(r)}"></${tag}>`;
}).join('');

/**
 * @param {{a:number,b:number,op:'add'|'sub'|'mul'|'div'}} col
 * @param {{interactive?:boolean}} opts  interactive: boxes are buttons the child can tap
 */
export function columnForm({ a, b, op }, { interactive = false } = {}) {
  const n = answerBoxes({ a, b, op });
  const label = `${a} ${WORD[op]} ${b}`;

  if (op === 'div') {
    // columns: divisor | bracket | one column per digit of the dividend
    const colOf = r => 3 + (n - 1 - r);
    return `<div class="colform div" role="group" aria-label="${label}" style="grid-template-columns:auto auto ${template(n)}">
      ${boxCells(n, 1, colOf, interactive)}
      <span class="div-line" style="grid-row:2;grid-column:3 / -1"></span>
      <span class="div-b" style="grid-row:3;grid-column:1">${b}</span>
      <span class="div-bracket" style="grid-row:2 / 4;grid-column:2"></span>
      ${digitCells(a, 3, colOf)}
    </div>`;
  }

  // columns: operator | one column per place value
  const colOf = r => 2 + (n - 1 - r);
  return `<div class="colform" role="group" aria-label="${label}" style="grid-template-columns:auto ${template(n)}">
    ${digitCells(a, 1, colOf)}
    <span class="col-op" style="grid-row:2;grid-column:1">${SYMBOL[op]}</span>
    ${digitCells(b, 2, colOf)}
    <span class="col-line" style="grid-row:3;grid-column:1 / -1"></span>
    ${boxCells(n, 4, colOf, interactive)}
    <span class="col-line double" style="grid-row:5;grid-column:1 / -1"></span>
  </div>`;
}

/** Show a number in the boxes by place value (used to reveal the right answer). */
export function fillBoxes(root, value, cls = '') {
  const s = String(value).split('').reverse();
  root.querySelectorAll('.box').forEach(box => {
    const r = +box.dataset.r;
    box.textContent = s[r] ?? '';
    box.className = `box ${cls}`.trim();
  });
}
