import { db, save, upgradeProfile } from './db.js';
import { speak, sfx, setSound, soundOn, stopSpeech } from './audio.js';
import { mascot, mascotSay, confetti, setOutfit, kikoSvg, OUTFITS, SLOTS } from './fx.js';
import { skillsFor, getSkill } from './skills/index.js';
import {
  record, finishSession, buySticker, STICKERS, STICKER_COST, BADGES, MAX_LEVEL,
  hatchEgg, eggReady, finishBoss, buyOutfit, toggleOutfit,
} from './engine.js';
import { CREATURES, creature, silhouette, eggSvg, BOSSES, bossSvg } from './creatures.js';
import { numChoices, fmtNum } from './skills/util.js';
import { columnForm } from './column.js';
import { icon } from './icons.js';
import { animal, ANIMAL_IDS, sticker } from './art.js';

const app = document.getElementById('app');
const $ = s => app.querySelector(s);
const $$ = s => [...app.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = a => a[Math.floor(Math.random() * a.length)];

const AVATARS = ANIMAL_IDS;
const STAR = icon('star-fill', 'star');
const FIRE = icon('fire-fill', 'fire');
const CHEERS = ['Great job!', 'Awesome!', 'You got it!', 'Super!', 'Well done!', 'Brilliant!', 'Fantastic!'];
const OOPS = ['Oops, try again!', 'Almost! Try once more.', 'Not quite. You can do it!'];
const BALLOON_COLORS = ['#ff6b6b', '#ffb703', '#6bcb77', '#4d96ff', '#c77dff', '#ff8fab'];

// gen changes whenever we leave a screen, so delayed callbacks from an old game do nothing.
let gen = 0;
let cleanup = null;
let playing = false;
const later = (fn, ms) => { const g = gen; setTimeout(() => { if (g === gen) fn(); }, ms); };

function show(html, mode = '', keep = false) {
  if (!keep) { gen++; playing = false; }
  if (cleanup) { cleanup(); cleanup = null; }
  stopSpeech();
  if (!keep) document.querySelectorAll('.confetti').forEach(c => c.remove());
  document.body.className = mode ? `mode-${mode}` : '';
  setOutfit(db.current()?.outfit);
  app.innerHTML = html;
  window.scrollTo(0, 0);
  refreshUpdateBanner();
}

/* ---------- Home and profiles ---------- */

function home() {
  const ps = db.profiles;
  if (!ps.length) return createProfile(true);
  show(`<div class="screen center">
    <h1 class="title">Math Buddy</h1>
    ${mascot('Hi! Who is playing today?')}
    <div class="profile-grid">
      ${ps.map(p => `<button class="profile-card" data-id="${p.id}"><span class="avatar">${animal(p.avatar)}</span><span class="pname">${esc(p.name)}</span><small>${STAR} ${p.stars}</small></button>`).join('')}
      <button class="profile-card add" id="add"><span class="avatar add-ic">${icon('plus')}</span><span class="pname">Add player</span></button>
    </div>
    <button class="link" id="parent">${icon('users-three')} Parent corner</button>
  </div>`);
  $$('.profile-card[data-id]').forEach(b => b.onclick = () => {
    sfx('tap');
    db.setCurrent(b.dataset.id);
    setOutfit(db.current().outfit);
    db.current().mode ? map() : modeSelect();
  });
  $('#add').onclick = () => createProfile(false);
  $('#parent').onclick = parentGate;
}

function createProfile(first) {
  let avatar = AVATARS[0];
  const hello = first ? "Hi! I'm Kiko the cat. What's your name?" : "Let's add a new player!";
  show(`<div class="screen center">
    ${first ? '<h1 class="title">Math Buddy</h1>' : ''}
    ${mascot(hello)}
    <div class="card form">
      <label class="label" for="name">Name</label>
      <input id="name" maxlength="16" autocomplete="off" placeholder="e.g. Aiman">
      <div class="label">Pick your animal</div>
      <div class="avatar-pick">${AVATARS.map((a, i) => `<button class="av ${i === 0 ? 'sel' : ''}" data-a="${a}" aria-label="${a}">${animal(a)}</button>`).join('')}</div>
      <button class="btn" id="save">Let's go! ${icon('arrow-right')}</button>
      ${first ? '' : '<button class="link" id="cancel">Cancel</button>'}
    </div>
  </div>`);
  $$('.av').forEach(b => b.onclick = () => {
    $$('.av').forEach(x => x.classList.remove('sel'));
    b.classList.add('sel');
    avatar = b.dataset.a;
    sfx('tap');
  });
  const submit = () => {
    const input = $('#name');
    const name = input.value.trim();
    if (!name) { shake(input); input.focus(); return; }
    db.addProfile(name, avatar);
    sfx('win');
    modeSelect();
  };
  $('#save').onclick = submit;
  $('#name').onkeydown = e => { if (e.key === 'Enter') submit(); };
  if (!first) $('#cancel').onclick = home;
}

function modeSelect() {
  const p = db.current();
  show(`<div class="screen center">
    ${mascot(`Which one are you, ${esc(p.name)}?`)}
    <div class="mode-grid">
      <button class="mode-card pre" data-m="pre"><span class="mode-icon">${animal('rabbit')}</span><b>Little Learners</b><small>Age 5 · counting, numbers, shapes, adding</small></button>
      <button class="mode-card y5" data-m="y5"><span class="mode-icon rocket">${icon('rocket-launch')}</span><b>Standard 5</b><small>KSSR Year 5 · numbers, fractions, rounding, money</small></button>
    </div>
    <button class="link" id="back">Back</button>
  </div>`);
  $$('.mode-card').forEach(b => b.onclick = () => { sfx('tap'); db.setMode(p, b.dataset.m); map(); });
  $('#back').onclick = home;
}

/* ---------- Topic map ---------- */

function topbar(p, extra = '') {
  return `<header class="topbar">
    <button class="icon-btn" id="home" aria-label="Home">${icon('house')}</button>
    <div class="who"><span class="mini-av">${animal(p.avatar)}</span>${esc(p.name)}</div>
    <div class="pill" title="Stars">${STAR} ${p.stars}</div>
    <div class="pill" title="Day streak">${FIRE} ${p.streak.count}</div>
    ${extra}
  </header>`;
}

function map() {
  const p = db.current();
  if (!p) return home();
  if (!p.mode) return modeSelect();
  const list = skillsFor(p.mode);
  const hello = p.mode === 'pre' ? `Pick a game, ${esc(p.name)}!` : `Choose an island to explore, ${esc(p.name)}!`;
  setOutfit(p.outfit);
  const ready = eggReady(p);
  const left = p.egg.need - p.egg.cracks;
  show(`${topbar(p, `<button class="icon-btn" id="closet" aria-label="Kiko's closet">${icon('coat-hanger')}</button><button class="icon-btn" id="stickers" aria-label="My collection">${icon('sticker')}</button><button class="icon-btn" id="sound" aria-label="Sound">${icon(soundOn() ? 'speaker-high' : 'speaker-slash')}</button>`)}
  <div class="screen">
    ${mascot(hello)}
    <button class="egg-card ${ready ? 'ready' : ''}" id="egg">
      <span class="egg-mini">${eggSvg(p.egg.cracks, p.egg.need)}</span>
      <span class="egg-text"><b>${ready ? 'Your egg is ready to hatch!' : 'Mystery egg'}</b>
      <small>${ready ? 'Tap to hatch it' : `${left} more ${left === 1 ? 'round' : 'rounds'} to hatch`}</small></span>
      <span class="egg-count">${icon('egg-crack')} ${p.creatures.length}/${CREATURES.length}</span>
    </button>
    <div class="island-grid">
      ${list.map(s => {
        const st = db.skill(p, s.id);
        const bossOpen = st.level >= MAX_LEVEL || p.trophies[s.id];
        const won = p.trophies[s.id];
        return `<div class="island-wrap" style="--hue:${s.hue}">
          <button class="island" data-id="${s.id}">
            ${won ? `<span class="island-trophy" title="Boss beaten">${icon('trophy-fill', 'trophy')}</span>` : ''}
            <span class="island-icon">${icon(s.icon)}</span>
            <span class="island-name">${s.name}</span>
            <span class="island-topic">${s.topic}</span>
            <span class="lvl">${'●'.repeat(st.level)}${'○'.repeat(MAX_LEVEL - st.level)} Level ${st.level}</span>
            <span class="mbar"><i style="width:${st.mastery}%"></i></span>
          </button>
          ${bossOpen
            ? `<button class="boss-btn" data-boss="${s.id}">${icon('sword')} ${won ? 'Rematch' : 'Boss battle!'}</button>`
            : `<div class="boss-btn locked">${icon('lock-simple-fill')} Boss at level ${MAX_LEVEL}</div>`}
        </div>`;
      }).join('')}
    </div>
    <button class="link" id="switch">Switch to ${p.mode === 'pre' ? 'Standard 5' : 'Little Learners'}</button>
  </div>`, p.mode);
  $('#home').onclick = home;
  $('#stickers').onclick = stickerBook;
  $('#closet').onclick = () => closet();
  $('#egg').onclick = () => (eggReady(p) ? hatchScreen() : mascotSay(`Finish ${left} more ${left === 1 ? 'round' : 'rounds'} and your egg will hatch!`, 'happy'));
  $$('.boss-btn[data-boss]').forEach(b => b.onclick = () => { sfx('tap'); bossBattle(b.dataset.boss); });
  $('#sound').onclick = () => { setSound(!soundOn()); map(); };
  $('#switch').onclick = () => { db.setMode(p, p.mode === 'pre' ? 'y5' : 'pre'); map(); };
  $$('.island').forEach(b => b.onclick = () => { sfx('tap'); play(b.dataset.id); });
  if (p.mode === 'pre') speak(hello);
}

/* ---------- Games ---------- */

function play(id) {
  const skill = getSkill(id);
  const p = db.current();
  gen++;
  playing = true;
  ({ choice: runChoice, balloon: runBalloon, speed: runSpeed })[skill.gameType](skill, p);
}

const progressBar = (skill, i, total) => `<header class="topbar">
  <button class="icon-btn" id="quit" aria-label="Quit">${icon('x')}</button>
  <div class="dots">${Array.from({ length: total }, (_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('')}</div>
  <div class="combo" id="combo" hidden></div>
  <div class="who skill-ic">${icon(skill.icon)}</div>
</header>`;

/**
 * Combo meter: 3 right in a row on the first try turns on x2 (one bonus star per answer).
 * Every 5 in a row Kiko does a dance.
 */
function comboTracker() {
  let run = 0, bonus = 0, best = 0;
  const render = (bump = false) => {
    const el = document.getElementById('combo');
    if (!el) return;
    el.hidden = run < 3;
    el.innerHTML = `${icon('fire-fill', 'fire')} x2 <small>${run} in a row</small>`;
    if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  };
  return {
    render,
    hit(ok) {
      if (!ok) { run = 0; render(); return; }
      run++;
      best = Math.max(best, run);
      if (run >= 3) bonus++;
      render(true);
      if (run % 5 === 0) { sfx('combo'); mascotSay(`${run} in a row! You're on fire!`, 'dance'); }
      else if (run === 3) { sfx('combo'); mascotSay('3 in a row! Combo x2!', 'happy'); }
    },
    get bonus() { return bonus; },
    get best() { return best; },
  };
}

const bindQuit = () => { $('#quit').onclick = map; };

function cheer(p) {
  const c = pick(CHEERS);
  mascotSay(c, 'happy');
  if (p.mode === 'pre') speak(c);
}

function showHint(q) {
  const h = $('#hint');
  h.hidden = false;
  h.innerHTML = `${icon('lightbulb')} ${q.explanation}`;
  speak(q.explanation);
}

function levelNote(p, change) {
  if (change > 0) mascotSay('Level up! Things get a bit harder now.', 'happy');
}

// Multiple choice: counting, adding, shapes, fractions, rounding, money.
function runChoice(skill, p) {
  const total = p.mode === 'pre' ? 5 : 10;
  let i = 0, first = 0;
  const combo = comboTracker();
  const next = () => {
    if (i >= total) return result(skill, p, { correct: first, total, bonus: combo.bonus, bestCombo: combo.best });
    const q = skill.generate(db.skill(p, skill.id).level);
    let wrong = 0, done = false;
    show(`${progressBar(skill, i, total)}
    <div class="screen play">
      ${mascot(q.prompt, 'small')}
      ${q.visual ? `<div class="visual">${q.visual}</div>` : ''}
      <div class="choices ${q.choiceClass || ''}">
        ${q.choices.map((c, k) => `<button class="choice" data-k="${k}">${c.html ?? esc(c)}</button>`).join('')}
      </div>
      <div class="hint" id="hint" hidden></div>
    </div>`, p.mode, true);
    bindQuit();
    combo.render();
    speak(q.speak || q.prompt);
    const isRight = c => String(c.value ?? c) === String(q.answer);
    $$('.choice').forEach(b => b.onclick = () => {
      if (done) return;
      const c = q.choices[+b.dataset.k];
      if (isRight(c)) {
        done = true;
        b.classList.add('right');
        sfx('right');
        if (!wrong) first++;
        const change = record(p, skill.id, !wrong);
        cheer(p);
        levelNote(p, change);
        combo.hit(!wrong);
        i++;
        later(next, wrong >= 2 ? 2600 : 1200);
      } else {
        wrong++;
        b.classList.add('wrong');
        b.disabled = true;
        sfx('wrong');
        if (wrong === 1) combo.hit(false);
        mascotSay(pick(OOPS), 'oops');
        if (wrong === 2) {
          showHint(q);
          $$('.choice').forEach((x, k) => { if (isRight(q.choices[k])) x.classList.add('glow'); });
        }
      }
    });
  };
  next();
}

// Pop the Balloon: tap the balloon with the number Kiko says.
function runBalloon(skill, p) {
  const total = 5;
  let i = 0, first = 0;
  const combo = comboTracker();
  const next = () => {
    if (i >= total) return result(skill, p, { correct: first, total, bonus: combo.bonus, bestCombo: combo.best });
    const q = skill.generate(db.skill(p, skill.id).level);
    let wrong = 0, done = false;
    show(`${progressBar(skill, i, total)}
    <div class="screen play">
      ${mascot(q.prompt, 'small')}
      <div class="sky">
        ${q.numbers.map((n, k) => `<button class="balloon" data-n="${n}" style="--x:${((k + 0.5) / q.numbers.length) * 100}%;--d:${(k % 3) * 0.45}s;--c:${BALLOON_COLORS[k % BALLOON_COLORS.length]}"><span>${n}</span></button>`).join('')}
      </div>
      <div class="hint" id="hint" hidden></div>
    </div>`, p.mode, true);
    bindQuit();
    combo.render();
    speak(q.speak || q.prompt);
    $$('.balloon').forEach(b => b.onclick = () => {
      if (done || b.classList.contains('pop')) return;
      if (+b.dataset.n === q.answer) {
        done = true;
        b.classList.add('pop');
        sfx('pop');
        later(() => sfx('right'), 120);
        if (!wrong) first++;
        const change = record(p, skill.id, !wrong);
        cheer(p);
        levelNote(p, change);
        combo.hit(!wrong);
        i++;
        later(next, 1300);
      } else {
        wrong++;
        b.classList.remove('wobble');
        void b.offsetWidth;
        b.classList.add('wobble');
        sfx('wrong');
        if (wrong === 1) combo.hit(false);
        mascotSay(pick(OOPS), 'oops');
        if (wrong === 2) {
          showHint(q);
          $$('.balloon').forEach(x => { if (+x.dataset.n === q.answer) x.classList.add('glow'); });
        }
      }
    });
  };
  next();
}

// Speed Round: as many answers as possible in 60 seconds.
function runSpeed(skill, p) {
  const best = p.best[skill.id] || 0;
  show(`<header class="topbar">
    <button class="icon-btn" id="quit" aria-label="Quit">${icon('x')}</button>
    <div class="who"><span class="skill-ic">${icon(skill.icon)}</span> ${skill.name}</div>
    <div class="combo" id="combo" hidden></div>
    <div class="pill" title="Best score">${icon('trophy-fill', 'trophy')} ${best}</div>
  </header>
  <div class="screen play speed">
    <div class="timer"><i id="tbar"></i></div>
    <div class="score">Score <b id="score">0</b> <span id="tleft">60s</span></div>
    <div class="question" id="q">
      ${mascot('Answer as many as you can in 60 seconds. Ready?', 'small')}
      <button class="btn" id="start">Start! ${icon('lightning')}</button>
    </div>
    <div class="col-note" id="note"></div>
    <div class="numpad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map(k => `<button data-k="${k}" class="${k === 'ok' ? 'ok' : ''}" aria-label="${k === 'del' ? 'Delete' : k === 'ok' ? 'Check answer' : k}">${k === 'del' ? icon('backspace') : k === 'ok' ? icon('check-fill') : k}</button>`).join('')}</div>
  </div>`, p.mode, true);
  bindQuit();

  let score = 0, wrongN = 0, input = '', q = null, running = false, lock = false, timer = null, end = 0;
  const combo = comboTracker();
  const qEl = $('#q');
  let ansEl = null;

  const newQ = () => {
    q = skill.generate(db.skill(p, skill.id).level);
    qEl.innerHTML = columnForm(q.col, '', 'ans');
    ansEl = $('#ans');
    input = '';
    $('#note').textContent = '';
  };
  const submit = () => {
    if (!running || lock || input === '') return;
    const ok = Number(input) === q.answer;
    record(p, skill.id, ok);
    combo.hit(ok);
    lock = true;
    if (ok) {
      score++;
      $('#score').textContent = score;
      sfx('right');
      ansEl.classList.add('ok');
      later(() => { lock = false; if (running) newQ(); }, 250);
    } else {
      wrongN++;
      sfx('wrong');
      ansEl.classList.add('bad');
      ansEl.textContent = fmtNum(q.answer);
      $('#note').innerHTML = `You wrote <s>${esc(fmtNum(input))}</s>. The answer is <b>${fmtNum(q.answer)}</b>.`;
      later(() => { lock = false; if (running) newQ(); }, 1000);
    }
  };
  const key = k => {
    if (!running || lock) return;
    if (k === 'del') input = input.slice(0, -1);
    else if (k === 'ok') return submit();
    else if (input.length < 7) input += k;
    ansEl.textContent = input ? fmtNum(input) : '';
    sfx('tap');
  };
  $$('.numpad button').forEach(b => b.onclick = () => key(b.dataset.k));
  const onKey = e => {
    if (/^[0-9]$/.test(e.key)) key(e.key);
    else if (e.key === 'Backspace') key('del');
    else if (e.key === 'Enter') { e.preventDefault(); running ? key('ok') : $('#start')?.click(); }
  };
  document.addEventListener('keydown', onKey);
  cleanup = () => { running = false; clearInterval(timer); document.removeEventListener('keydown', onKey); };

  $('#start').onclick = () => {
    running = true;
    end = Date.now() + 60000;
    newQ();
    timer = setInterval(() => {
      const left = Math.max(0, end - Date.now());
      $('#tbar').style.width = `${left / 600}%`;
      $('#tleft').textContent = `${Math.ceil(left / 1000)}s`;
      if (left <= 0) {
        running = false;
        clearInterval(timer);
        result(skill, p, { correct: score, total: score + wrongN, speed: true, bonus: combo.bonus, bestCombo: combo.best });
      }
    }, 100);
  };
}

/* ---------- Results, stickers, badges ---------- */

function result(skill, p, r) {
  const out = finishSession(p, skill.id, r);
  const name = esc(p.name);
  const msg = out.rating === 3 ? `Amazing, ${name}! You're a superstar!`
    : out.rating === 2 ? `Great work, ${name}!`
      : `Good try, ${name}! Practice makes perfect.`;
  show(`<div class="screen center result">
    ${mascot(msg)}
    <div class="rating">${[1, 2, 3].map(k => `<span class="${k <= out.rating ? 'on' : ''}" style="animation-delay:${k * 0.25}s">${icon('star-fill')}</span>`).join('')}</div>
    <p class="big">${r.speed ? `${r.correct} correct in 60 seconds!` : `${r.correct} of ${r.total} right on the first try`}</p>
    <p class="earned">+${out.stars} ${STAR}</p>
    ${out.bonus ? `<p class="bonus-line">${icon('fire-fill', 'fire')} Includes +${out.bonus} combo bonus</p>` : ''}
    ${eggLine(out.egg)}
    ${out.newBest ? `<div class="badge-new">${icon('trophy-fill', 'trophy')} New best score!</div>` : ''}
    ${out.newBadges.map(b => `<div class="badge-new">${icon(b.icon)} New badge: <b>${b.name}</b></div>`).join('')}
    <div class="row">
      <button class="btn" id="again">${icon('arrow-counter-clockwise')} Play again</button>
      <button class="btn alt" id="map">${icon('map-trifold')} Back to map</button>
    </div>
  </div>`, p.mode);
  $('#again').onclick = () => play(skill.id);
  $('#map').onclick = map;
  $('#hatch')?.addEventListener('click', hatchScreen);
  sfx('win');
  confetti();
  speak(msg);
}

function eggLine(egg) {
  if (egg.ready) {
    return `<div class="egg-line ready"><span class="egg-mini">${eggSvg(egg.cracks, egg.need)}</span>
      <div><b>Your egg is ready to hatch!</b><button class="btn small" id="hatch">${icon('egg-crack')} Hatch it!</button></div></div>`;
  }
  const left = egg.need - egg.cracks;
  return `<div class="egg-line"><span class="egg-mini">${eggSvg(egg.cracks, egg.need)}</span>
    <div><b>Your egg cracked a little!</b><small>${left} more ${left === 1 ? 'round' : 'rounds'} to hatch.</small></div></div>`;
}

/* ---------- Hatching ---------- */

function hatchScreen() {
  const p = db.current();
  if (!eggReady(p)) return map();
  let taps = 0;
  const need = 3;
  show(`<div class="screen center hatch">
    ${mascot('Tap the egg to hatch it!')}
    <button class="hatch-egg" id="egg" aria-label="Tap the egg">${eggSvg(p.egg.need, p.egg.need)}</button>
    <p class="muted">Tap ${need} times</p>
  </div>`, p.mode);
  speak('Tap the egg to hatch it!');
  $('#egg').onclick = () => {
    taps++;
    const egg = $('#egg');
    egg.classList.remove('shake-egg');
    void egg.offsetWidth;
    egg.classList.add('shake-egg');
    sfx(taps < need ? 'tap' : 'hatch');
    if (taps < need) { mascotSay(taps === 1 ? 'Something is moving!' : 'Almost there!', 'happy'); return; }
    const out = hatchEgg(p);
    const c = out.creature;
    show(`<div class="screen center hatch">
      <div class="hatched">${creature(c.id)}</div>
      <h1 class="title">Meet ${c.name}!</h1>
      <p class="big">${out.complete ? `You found every creature! +${out.extraStars} bonus stars.` : `${c.name} joined your collection.`}</p>
      <p class="muted">${p.creatures.length} of ${CREATURES.length} creatures found. A new egg is waiting!</p>
      ${out.newBadges.map(b => `<div class="badge-new">${icon(b.icon)} New badge: <b>${b.name}</b></div>`).join('')}
      <div class="row">
        <button class="btn" id="coll">${icon('egg-crack')} My creatures</button>
        <button class="btn alt" id="map">${icon('map-trifold')} Back to map</button>
      </div>
    </div>`, p.mode);
    confetti();
    speak(`Meet ${c.name}!`);
    $('#coll').onclick = stickerBook;
    $('#map').onclick = map;
  };
}

/* ---------- Boss battles ---------- */

// Turn any question into tap-to-answer choices, so every island can have a boss.
function bossQuestion(skill) {
  const q = skill.generate(MAX_LEVEL);
  if (q.choices) return q;
  if (q.numbers) return { ...q, choices: q.numbers, choiceClass: 'big' };
  const spread = Math.max(3, Math.round(q.answer * 0.1));
  const choices = numChoices(q.answer, 4, spread, 0).map(n => ({ html: fmtNum(n), value: n }));
  return { ...q, choices, explanation: q.explanation || `The answer is ${fmtNum(q.answer)}.` };
}

function bossBattle(id) {
  const skill = getSkill(id);
  const p = db.current();
  const boss = BOSSES[id];
  const maxHp = p.mode === 'pre' ? 5 : 8;
  let hp = maxHp, hearts = 3, asked = 0, right = 0;
  gen++;
  playing = true;

  const bar = () => `<header class="topbar boss-top">
    <button class="icon-btn" id="quit" aria-label="Quit">${icon('x')}</button>
    <div class="hearts" aria-label="${hearts} hearts left">${[1, 2, 3].map(k => icon(k <= hearts ? 'heart-fill' : 'heart', k <= hearts ? 'heart on' : 'heart')).join('')}</div>
    <div class="who">${icon('sword')} Boss</div>
  </header>`;

  const intro = () => {
    show(`${bar()}<div class="screen center boss-intro">
      <div class="boss-art big">${bossSvg(id)}</div>
      <h1 class="title">${boss.name}</h1>
      <p class="big">Answer ${maxHp} questions right to win. You have 3 hearts!</p>
      <button class="btn" id="fight">${icon('sword')} Let's battle!</button>
    </div>`, p.mode, true);
    bindQuit();
    speak(`${boss.name} wants to battle! Answer ${maxHp} questions right to win.`);
    $('#fight').onclick = next;
  };

  const next = () => {
    if (hp <= 0) return end(true);
    if (hearts <= 0) return end(false);
    const q = bossQuestion(skill);
    asked++;
    let done = false;
    show(`${bar()}<div class="screen play">
      <div class="boss-arena">
        <div class="boss-art" id="boss">${bossSvg(id)}</div>
        <div class="boss-hp"><span>${boss.name}</span><div class="hpbar"><i style="width:${(hp / maxHp) * 100}%"></i></div></div>
      </div>
      ${mascot(q.prompt, 'small')}
      ${q.visual ? `<div class="visual">${q.visual}</div>` : ''}
      <div class="choices ${q.choiceClass || ''}">
        ${q.choices.map((c, k) => `<button class="choice" data-k="${k}">${c.html ?? esc(c)}</button>`).join('')}
      </div>
      <div class="hint" id="hint" hidden></div>
    </div>`, p.mode, true);
    bindQuit();
    speak(q.speak || q.prompt);
    const isRight = c => String(c.value ?? c) === String(q.answer);
    $$('.choice').forEach(b => b.onclick = () => {
      if (done) return;
      done = true;
      const bossEl = $('#boss');
      if (isRight(q.choices[+b.dataset.k])) {
        right++;
        hp--;
        b.classList.add('right');
        sfx('hit');
        bossEl.classList.add('hit');
        $('.hpbar i').style.width = `${(hp / maxHp) * 100}%`;
        mascotSay(hp > 0 ? pick(['Pow! Direct hit!', 'Take that!', 'Boom! Keep going!']) : 'Final hit!', 'happy');
        later(next, 1100);
      } else {
        hearts--;
        b.classList.add('wrong');
        sfx('wrong');
        bossEl.classList.add('laugh');
        $$('.choice').forEach((x, k) => { if (isRight(q.choices[k])) x.classList.add('glow'); });
        const h = $('#hint');
        h.hidden = false;
        h.innerHTML = `${icon('lightbulb')} ${q.explanation}`;
        $$('.hearts .heart.on')[hearts]?.classList.remove('on');
        mascotSay(hearts > 0 ? `Oh no, ${hearts} ${hearts === 1 ? 'heart' : 'hearts'} left!` : 'Out of hearts!', 'oops');
        later(next, 2600);
      }
    });
  };

  const end = won => {
    const out = finishBoss(p, id, won, right, asked);
    const name = esc(p.name);
    show(`<div class="screen center result">
      <div class="boss-art big ${won ? 'beaten' : ''}">${bossSvg(id)}</div>
      ${mascot(won ? `You beat ${boss.name}, ${name}!` : `${boss.name} won this time. Practise and try again!`)}
      ${won ? `<div class="trophy-big">${icon('trophy-fill', 'trophy')}</div>` : ''}
      <p class="earned">+${out.stars} ${STAR}</p>
      ${won && out.firstWin ? `<p class="big">You won the ${skill.name} trophy!</p>` : ''}
      ${eggLine(out.egg)}
      ${out.newBadges.map(b => `<div class="badge-new">${icon(b.icon)} New badge: <b>${b.name}</b></div>`).join('')}
      <div class="row">
        <button class="btn" id="again">${icon('arrow-counter-clockwise')} ${won ? 'Battle again' : 'Try again'}</button>
        <button class="btn alt" id="map">${icon('map-trifold')} Back to map</button>
      </div>
    </div>`, p.mode);
    $('#again').onclick = () => bossBattle(id);
    $('#map').onclick = map;
    $('#hatch')?.addEventListener('click', hatchScreen);
    if (won) { sfx('win'); confetti(); } else sfx('wrong');
    speak(won ? `You beat ${boss.name}!` : `${boss.name} won this time. Try again!`);
  };

  intro();
}

/* ---------- Kiko's closet ---------- */

function closet(slot = 'hat') {
  const p = db.current();
  setOutfit(p.outfit);
  const items = OUTFITS.filter(o => o.slot === slot);
  show(`<header class="topbar">
    <button class="icon-btn" id="back" aria-label="Back">${icon('arrow-left')}</button>
    <div class="who">Kiko's Closet</div>
    <div class="pill">${STAR} ${p.stars}</div>
  </header>
  <div class="screen center">
    <div class="closet-kiko" id="preview">${kikoSvg(p.outfit)}</div>
    <div class="tabs">${SLOTS.map(s => `<button class="tab ${s.id === slot ? 'on' : ''}" data-slot="${s.id}">${s.name}</button>`).join('')}</div>
    <div class="outfit-grid">
      ${items.map(o => {
        const own = p.closet.includes(o.id);
        const worn = p.outfit[o.slot] === o.id;
        return `<button class="outfit ${own ? 'own' : ''} ${worn ? 'worn' : ''}" data-id="${o.id}">
          <span class="outfit-art">${kikoSvg({ [o.slot]: o.id })}</span>
          <b>${o.name}</b>
          <small>${worn ? `${icon('check-fill')} Wearing` : own ? 'Tap to wear' : `${STAR} ${o.price}`}</small>
        </button>`;
      }).join('')}
    </div>
  </div>`, p.mode);
  $('#back').onclick = map;
  $$('.tab').forEach(b => b.onclick = () => { sfx('tap'); closet(b.dataset.slot); });
  $$('.outfit').forEach(b => b.onclick = () => {
    const o = OUTFITS.find(x => x.id === b.dataset.id);
    if (p.closet.includes(o.id)) { toggleOutfit(p, o.id); sfx('tap'); return closet(slot); }
    if (p.stars < o.price) {
      sfx('wrong');
      b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      return;
    }
    buyOutfit(p, o.id);
    sfx('win');
    closet(slot);
    confetti();
  });
}

function stickerBook() {
  const p = db.current();
  show(`<header class="topbar">
    <button class="icon-btn" id="back" aria-label="Back">${icon('arrow-left')}</button>
    <div class="who">My Collection</div>
    <div class="pill">${STAR} ${p.stars}</div>
  </header>
  <div class="screen">
    <h2>Creatures <small>${p.creatures.length}/${CREATURES.length}</small></h2>
    <div class="creature-grid">
      ${CREATURES.map(c => {
        const own = p.creatures.includes(c.id);
        return `<div class="creature-card ${own ? 'own' : ''}">${own ? creature(c.id) : silhouette(c.id)}<b>${own ? c.name : '???'}</b></div>`;
      }).join('')}
    </div>
    <h2>Trophies <small>${Object.keys(p.trophies).length}/${Object.keys(BOSSES).length}</small></h2>
    <div class="trophy-grid">
      ${Object.entries(BOSSES).map(([sid, b]) => {
        const sk = getSkill(sid);
        const own = p.trophies[sid];
        return `<div class="trophy-card ${own ? 'own' : ''}">${icon(own ? 'trophy-fill' : 'lock-simple-fill', own ? 'trophy' : '')}<b>${sk.name}</b><small>${own ? `Beat ${b.name}` : 'Not won yet'}</small></div>`;
      }).join('')}
    </div>
    <h2>Stickers</h2>
    ${mascot(`Each sticker costs ${STICKER_COST} stars. Tap one to collect it!`, 'small')}
    <div class="sticker-grid">
      ${STICKERS.map((s, i) => {
        const own = p.stickers.includes(s);
        return `<button class="sticker ${own ? 'own' : ''}" data-s="${s}" aria-label="${own ? 'Collected sticker' : 'Locked sticker'}">${own ? sticker(s, i) : `<span class="locked">${icon('lock-simple-fill')}</span><small>${STAR}${STICKER_COST}</small>`}</button>`;
      }).join('')}
    </div>
    <h2>Badges</h2>
    <div class="badge-grid">
      ${BADGES.map(b => {
        const own = p.badges.includes(b.id);
        return `<div class="badge ${own ? 'own' : ''}"><span class="bicon">${icon(own ? b.icon : 'lock-simple-fill')}</span><b>${b.name}</b><small>${b.desc}</small></div>`;
      }).join('')}
    </div>
  </div>`, p.mode);
  $('#back').onclick = map;
  $$('.sticker:not(.own)').forEach(b => b.onclick = () => {
    if (!buySticker(p, b.dataset.s)) {
      mascotSay(`You need ${STICKER_COST - p.stars} more stars. Keep playing!`, 'oops');
      sfx('wrong');
      return;
    }
    sfx('win');
    confetti();
    stickerBook();
  });
}

/* ---------- Parent corner ---------- */

function parentGate() {
  const a = 10 + Math.floor(Math.random() * 40);
  const b = 10 + Math.floor(Math.random() * 40);
  show(`<div class="screen center">
    <div class="card form">
      <h2>${icon('users-three')} Parent corner</h2>
      <p>Grown ups only! What is ${a} + ${b}?</p>
      <input id="g" inputmode="numeric" autocomplete="off" aria-label="Answer">
      <button class="btn" id="ok">Enter</button>
      <button class="link" id="back">Back</button>
    </div>
  </div>`);
  const go = () => {
    const input = $('#g');
    if (Number(input.value) === a + b) parent();
    else { input.value = ''; shake(input); }
  };
  $('#ok').onclick = go;
  $('#g').onkeydown = e => { if (e.key === 'Enter') go(); };
  $('#back').onclick = home;
}

function parentCard(p) {
  const played = Object.entries(p.skills)
    .filter(([, s]) => s.attempts > 0)
    .map(([id, s]) => ({ sk: getSkill(id), s }))
    .filter(x => x.sk);
  const acc = s => s.correct / s.attempts;
  const weak = played.filter(x => x.s.attempts >= 5 && acc(x.s) < 0.7).sort((a, b) => acc(a.s) - acc(b.s))[0];
  const week = p.sessions.filter(s => Date.now() - s.at < 7 * 864e5);
  const weekStars = week.reduce((a, s) => a + s.stars, 0);
  const modeName = p.mode === 'pre' ? 'Little Learners' : p.mode === 'y5' ? 'Standard 5' : 'No mode yet';
  return `<div class="card pcard">
    <div class="prow">
      <span class="avatar">${animal(p.avatar)}</span>
      <div class="pinfo"><b>${esc(p.name)}</b><small>${modeName}</small></div>
      <div class="pill">${STAR} ${p.stars}</div>
      <div class="pill">${FIRE} ${p.streak.count}</div>
    </div>
    <p class="summary">This week: ${week.length} ${week.length === 1 ? 'round' : 'rounds'}, ${weekStars} stars earned.${weak ? ` Needs more practice: <b>${weak.sk.name}</b>.` : ''}</p>
    ${played.length ? `<div class="table-wrap"><table>
      <thead><tr><th>Skill</th><th>Level</th><th>Accuracy</th><th>Mastery</th><th>Last played</th></tr></thead>
      <tbody>${played.map(({ sk, s }) => `<tr>
        <td><span class="skill-ic">${icon(sk.icon)}</span> ${sk.name}</td>
        <td>${s.level}/${MAX_LEVEL}</td>
        <td>${Math.round((s.correct / s.attempts) * 100)}%</td>
        <td><span class="mbar"><i style="width:${s.mastery}%"></i></span></td>
        <td>${new Date(s.last).toLocaleDateString('en-MY')}</td>
      </tr>`).join('')}</tbody>
    </table></div>` : '<p class="muted">No games played yet.</p>'}
    <div class="row">
      <button class="btn small alt" data-act="reset" data-id="${p.id}">Reset progress</button>
      <button class="btn small danger" data-act="delete" data-id="${p.id}">Delete player</button>
    </div>
  </div>`;
}

function parent() {
  const ps = db.profiles;
  show(`<header class="topbar">
    <button class="icon-btn" id="home" aria-label="Home">${icon('house')}</button>
    <div class="who">Parent corner</div>
    <button class="icon-btn" id="sound" aria-label="Sound">${icon(soundOn() ? 'speaker-high' : 'speaker-slash')}</button>
  </header>
  <div class="screen parent">
    ${ps.length ? ps.map(parentCard).join('') : '<p class="muted">No players yet.</p>'}
    <p class="muted note">Progress is saved on this device only. Read aloud uses your device's built in English voice.</p>
  </div>`);
  $('#home').onclick = home;
  $('#sound').onclick = () => { setSound(!soundOn()); parent(); };
  $$('[data-act]').forEach(b => b.onclick = () => {
    const p = db.profiles.find(x => x.id === b.dataset.id);
    if (!p) return;
    const name = esc(p.name);
    const isReset = b.dataset.act === 'reset';
    const what = isReset
      ? `This will erase all of ${name}'s stars, stickers, badges, levels and streak. ${name} will stay as a player.`
      : `This will remove ${name} and all of their progress from this device.`;
    confirmTwice({
      title1: isReset ? `Reset ${name}'s progress?` : `Delete ${name}?`,
      body1: what,
      title2: 'Are you sure?',
      body2: "This can't be undone.",
      yes: isReset ? 'Yes, reset everything' : 'Yes, delete player',
      onConfirm: () => {
        if (isReset) db.resetProfile(p.id); else db.deleteProfile(p.id);
        parent();
      },
    });
  });
}

// Two step confirmation for anything that erases progress.
function confirmTwice({ title1, body1, title2, body2, yes, onConfirm }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  const step = n => {
    overlay.innerHTML = `<div class="modal card" role="dialog" aria-modal="true">
      <div class="modal-step">Step ${n} of 2</div>
      <h2>${n === 1 ? title1 : title2}</h2>
      <p>${n === 1 ? body1 : body2}</p>
      <div class="row">
        <button class="btn alt small" data-m="cancel">Cancel</button>
        <button class="btn danger small" data-m="ok">${n === 1 ? 'Continue' : yes}</button>
      </div>
    </div>`;
    overlay.querySelector('[data-m=cancel]').onclick = close;
    overlay.querySelector('[data-m=ok]').onclick = () => {
      if (n === 1) step(2);
      else { close(); onConfirm(); }
    };
  };
  overlay.onclick = e => { if (e.target === overlay) close(); };
  step(1);
}

/* ---------- Updates ---------- */
// A new version downloads in the background. We wait for a tap before
// restarting, and never show the banner in the middle of a game.

let waitingWorker = null;
const banner = document.createElement('button');
banner.type = 'button';
banner.className = 'update-banner';
banner.hidden = true;
banner.innerHTML = '<b>Update ready.</b> Tap to restart the app. Your stars and progress stay.';
banner.onclick = () => {
  if (!waitingWorker) return;
  banner.disabled = true;
  banner.innerHTML = '<b>Updating…</b>';
  waitingWorker.postMessage('SKIP_WAITING');
};
document.body.prepend(banner);

function refreshUpdateBanner() {
  banner.hidden = !waitingWorker || playing;
}

function watchForUpdates(reg) {
  const found = w => {
    if (!w) return;
    const ready = () => {
      // Only an update if a version is already running (not the very first install).
      if (w.state === 'installed' && navigator.serviceWorker.controller) {
        waitingWorker = w;
        refreshUpdateBanner();
      }
    };
    ready();
    w.addEventListener('statechange', ready);
  };
  found(reg.waiting);
  reg.addEventListener('updatefound', () => found(reg.installing));

  const check = () => reg.update().catch(() => {});
  // Home Screen apps stay open for days, so also check whenever the app comes back.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
  setInterval(check, 30 * 60 * 1000);
}

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading || !waitingWorker) return;
    reloading = true;
    location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(watchForUpdates).catch(() => {});
  });
}

// Older versions saved emoji for avatars and stickers. Move them to the drawn set,
// and refund stars for any old sticker that no longer exists.
const OLD_AVATAR = { '🐱': 'cat', '🐶': 'dog', '🐰': 'rabbit', '🐼': 'panda', '🦊': 'fox', '🐸': 'frog', '🦁': 'lion', '🐯': 'lion', '🐨': 'bear', '🐵': 'bear', '🐧': 'panda', '🐢': 'frog' };
db.profiles.forEach(p => {
  upgradeProfile(p);
  if (!ANIMAL_IDS.includes(p.avatar)) p.avatar = OLD_AVATAR[p.avatar] || 'cat';
  const old = p.stickers.filter(s => !STICKERS.includes(s));
  if (old.length) { p.stars += old.length * STICKER_COST; p.stickers = p.stickers.filter(s => STICKERS.includes(s)); }
});

save();
home();
