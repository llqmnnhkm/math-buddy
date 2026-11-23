import { db, save } from './db.js';
import { speak, sfx, setSound, soundOn, stopSpeech } from './audio.js';
import { mascot, mascotSay, confetti } from './fx.js';
import { skillsFor, getSkill } from './skills/index.js';
import { record, finishSession, buySticker, STICKERS, STICKER_COST, BADGES, MAX_LEVEL } from './engine.js';

const app = document.getElementById('app');
const $ = s => app.querySelector(s);
const $$ = s => [...app.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = a => a[Math.floor(Math.random() * a.length)];

const AVATARS = ['🐱', '🐶', '🐰', '🐼', '🦊', '🐯', '🐸', '🐵', '🦁', '🐨', '🐧', '🐢'];
const CHEERS = ['Great job!', 'Awesome!', 'You got it!', 'Super!', 'Well done!', 'Brilliant!', 'Fantastic!'];
const OOPS = ['Oops, try again!', 'Almost! Try once more.', 'Not quite. You can do it!'];
const BALLOON_COLORS = ['#ff6b6b', '#ffb703', '#6bcb77', '#4d96ff', '#c77dff', '#ff8fab'];

// gen changes whenever we leave a screen, so delayed callbacks from an old game do nothing.
let gen = 0;
let cleanup = null;
const later = (fn, ms) => { const g = gen; setTimeout(() => { if (g === gen) fn(); }, ms); };

function show(html, mode = '', keep = false) {
  if (!keep) gen++;
  if (cleanup) { cleanup(); cleanup = null; }
  stopSpeech();
  document.body.className = mode ? `mode-${mode}` : '';
  app.innerHTML = html;
  window.scrollTo(0, 0);
}

/* ---------- Home and profiles ---------- */

function home() {
  const ps = db.profiles;
  if (!ps.length) return createProfile(true);
  show(`<div class="screen center">
    <h1 class="title">Math Buddy</h1>
    ${mascot('Hi! Who is playing today?')}
    <div class="profile-grid">
      ${ps.map(p => `<button class="profile-card" data-id="${p.id}"><span class="avatar">${p.avatar}</span><span class="pname">${esc(p.name)}</span><small>⭐ ${p.stars}</small></button>`).join('')}
      <button class="profile-card add" id="add"><span class="avatar">➕</span><span class="pname">Add player</span></button>
    </div>
    <button class="link" id="parent">👪 Parent corner</button>
  </div>`);
  $$('.profile-card[data-id]').forEach(b => b.onclick = () => {
    sfx('tap');
    db.setCurrent(b.dataset.id);
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
      <div class="avatar-pick">${AVATARS.map((a, i) => `<button class="av ${i === 0 ? 'sel' : ''}" data-a="${a}">${a}</button>`).join('')}</div>
      <button class="btn" id="save">Let's go! 🚀</button>
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
      <button class="mode-card pre" data-m="pre"><span class="mode-icon">🧸</span><b>Little Learners</b><small>Age 5 · counting, numbers, shapes, adding</small></button>
      <button class="mode-card y5" data-m="y5"><span class="mode-icon">🚀</span><b>Standard 5</b><small>KSSR Year 5 · numbers, fractions, rounding, money</small></button>
    </div>
    <button class="link" id="back">Back</button>
  </div>`);
  $$('.mode-card').forEach(b => b.onclick = () => { sfx('tap'); db.setMode(p, b.dataset.m); map(); });
  $('#back').onclick = home;
}

/* ---------- Topic map ---------- */

function topbar(p, extra = '') {
  return `<header class="topbar">
    <button class="icon-btn" id="home" aria-label="Home">🏠</button>
    <div class="who">${p.avatar} ${esc(p.name)}</div>
    <div class="pill" title="Stars">⭐ ${p.stars}</div>
    <div class="pill" title="Day streak">🔥 ${p.streak.count}</div>
    ${extra}
  </header>`;
}

function map() {
  const p = db.current();
  if (!p) return home();
  if (!p.mode) return modeSelect();
  const list = skillsFor(p.mode);
  const hello = p.mode === 'pre' ? `Pick a game, ${esc(p.name)}!` : `Choose an island to explore, ${esc(p.name)}!`;
  show(`${topbar(p, `<button class="icon-btn" id="stickers" aria-label="Sticker book">📒</button><button class="icon-btn" id="sound" aria-label="Sound">${soundOn() ? '🔊' : '🔇'}</button>`)}
  <div class="screen">
    ${mascot(hello)}
    <div class="island-grid">
      ${list.map(s => {
        const st = db.skill(p, s.id);
        return `<button class="island" data-id="${s.id}" style="--hue:${s.hue}">
          <span class="island-icon">${s.icon}</span>
          <span class="island-name">${s.name}</span>
          <span class="island-topic">${s.topic}</span>
          <span class="lvl">${'●'.repeat(st.level)}${'○'.repeat(MAX_LEVEL - st.level)} Level ${st.level}</span>
          <span class="mbar"><i style="width:${st.mastery}%"></i></span>
        </button>`;
      }).join('')}
    </div>
    <button class="link" id="switch">Switch to ${p.mode === 'pre' ? 'Standard 5' : 'Little Learners'}</button>
  </div>`, p.mode);
  $('#home').onclick = home;
  $('#stickers').onclick = stickerBook;
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
  ({ choice: runChoice, balloon: runBalloon, speed: runSpeed })[skill.gameType](skill, p);
}

const progressBar = (skill, i, total) => `<header class="topbar">
  <button class="icon-btn" id="quit" aria-label="Quit">✖</button>
  <div class="dots">${Array.from({ length: total }, (_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('')}</div>
  <div class="who">${skill.icon}</div>
</header>`;

const bindQuit = () => { $('#quit').onclick = map; };

function cheer(p) {
  const c = pick(CHEERS);
  mascotSay(c, 'happy');
  if (p.mode === 'pre') speak(c);
}

function showHint(q) {
  const h = $('#hint');
  h.hidden = false;
  h.innerHTML = `💡 ${q.explanation}`;
  speak(q.explanation);
}

function levelNote(p, change) {
  if (change > 0) mascotSay('Level up! 🎉 Things get a bit harder now.', 'happy');
}

// Multiple choice: counting, adding, shapes, fractions, rounding, money.
function runChoice(skill, p) {
  const total = p.mode === 'pre' ? 5 : 10;
  let i = 0, first = 0;
  const next = () => {
    if (i >= total) return result(skill, p, { correct: first, total });
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
        i++;
        later(next, wrong >= 2 ? 2600 : 1200);
      } else {
        wrong++;
        b.classList.add('wrong');
        b.disabled = true;
        sfx('wrong');
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
  const next = () => {
    if (i >= total) return result(skill, p, { correct: first, total });
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
        i++;
        later(next, 1300);
      } else {
        wrong++;
        b.classList.remove('wobble');
        void b.offsetWidth;
        b.classList.add('wobble');
        sfx('wrong');
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
    <button class="icon-btn" id="quit" aria-label="Quit">✖</button>
    <div class="who">${skill.icon} ${skill.name}</div>
    <div class="pill" title="Best score">🏆 ${best}</div>
  </header>
  <div class="screen play speed">
    <div class="timer"><i id="tbar"></i></div>
    <div class="score">Score <b id="score">0</b> <span id="tleft">60s</span></div>
    <div class="question" id="q">
      ${mascot('Answer as many as you can in 60 seconds. Ready?', 'small')}
      <button class="btn" id="start">Start! ⚡</button>
    </div>
    <div class="answer" id="ans"></div>
    <div class="numpad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map(k => `<button data-k="${k}" class="${k === '✓' ? 'ok' : ''}">${k}</button>`).join('')}</div>
  </div>`, p.mode, true);
  bindQuit();

  let score = 0, wrongN = 0, input = '', q = null, running = false, lock = false, timer = null, end = 0;
  const ansEl = $('#ans'), qEl = $('#q');

  const newQ = () => {
    q = skill.generate(db.skill(p, skill.id).level);
    qEl.innerHTML = `<div class="qtext">${q.prompt}</div>`;
    input = '';
    ansEl.textContent = '';
    ansEl.className = 'answer';
  };
  const submit = () => {
    if (!running || lock || input === '') return;
    const ok = Number(input) === q.answer;
    record(p, skill.id, ok);
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
      ansEl.innerHTML = `<s>${esc(input)}</s> ${q.answer}`;
      later(() => { lock = false; if (running) newQ(); }, 1000);
    }
  };
  const key = k => {
    if (!running || lock) return;
    if (k === '⌫') input = input.slice(0, -1);
    else if (k === '✓') return submit();
    else if (input.length < 7) input += k;
    ansEl.textContent = input;
    sfx('tap');
  };
  $$('.numpad button').forEach(b => b.onclick = () => key(b.dataset.k));
  const onKey = e => {
    if (/^[0-9]$/.test(e.key)) key(e.key);
    else if (e.key === 'Backspace') key('⌫');
    else if (e.key === 'Enter') { e.preventDefault(); running ? key('✓') : $('#start')?.click(); }
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
        result(skill, p, { correct: score, total: score + wrongN, speed: true });
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
    <div class="rating">${[1, 2, 3].map(k => `<span class="${k <= out.rating ? 'on' : ''}" style="animation-delay:${k * 0.25}s">⭐</span>`).join('')}</div>
    <p class="big">${r.speed ? `${r.correct} correct in 60 seconds!` : `${r.correct} of ${r.total} right on the first try`}</p>
    <p class="earned">+${out.stars} ⭐</p>
    ${out.newBest ? '<div class="badge-new">🏆 New best score!</div>' : ''}
    ${out.newBadges.map(b => `<div class="badge-new">${b.icon} New badge: <b>${b.name}</b></div>`).join('')}
    <div class="row">
      <button class="btn" id="again">Play again 🔁</button>
      <button class="btn alt" id="map">Back to map 🗺️</button>
    </div>
  </div>`, p.mode);
  $('#again').onclick = () => play(skill.id);
  $('#map').onclick = map;
  sfx('win');
  confetti();
  speak(msg);
}

function stickerBook() {
  const p = db.current();
  show(`<header class="topbar">
    <button class="icon-btn" id="back" aria-label="Back">⬅</button>
    <div class="who">📒 Sticker Book</div>
    <div class="pill">⭐ ${p.stars}</div>
  </header>
  <div class="screen">
    ${mascot(`Each sticker costs ${STICKER_COST} stars. Tap one to collect it!`, 'small')}
    <div class="sticker-grid">
      ${STICKERS.map(s => {
        const own = p.stickers.includes(s);
        return `<button class="sticker ${own ? 'own' : ''}" data-s="${s}" aria-label="${own ? 'Collected sticker' : 'Locked sticker'}">${own ? s : '❔'}${own ? '' : `<small>⭐${STICKER_COST}</small>`}</button>`;
      }).join('')}
    </div>
    <h2>Badges</h2>
    <div class="badge-grid">
      ${BADGES.map(b => {
        const own = p.badges.includes(b.id);
        return `<div class="badge ${own ? 'own' : ''}"><span>${own ? b.icon : '🔒'}</span><b>${b.name}</b><small>${b.desc}</small></div>`;
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
      <h2>👪 Parent corner</h2>
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
  const weak = played.filter(x => x.s.attempts >= 5 && x.s.mastery < 60).sort((a, b) => a.s.mastery - b.s.mastery)[0];
  const week = p.sessions.filter(s => Date.now() - s.at < 7 * 864e5);
  const weekStars = week.reduce((a, s) => a + s.stars, 0);
  const modeName = p.mode === 'pre' ? 'Little Learners' : p.mode === 'y5' ? 'Standard 5' : 'No mode yet';
  return `<div class="card pcard">
    <div class="prow">
      <span class="avatar">${p.avatar}</span>
      <div class="pinfo"><b>${esc(p.name)}</b><small>${modeName}</small></div>
      <div class="pill">⭐ ${p.stars}</div>
      <div class="pill">🔥 ${p.streak.count}</div>
    </div>
    <p class="summary">This week: ${week.length} ${week.length === 1 ? 'round' : 'rounds'}, ${weekStars} stars earned.${weak ? ` Needs more practice: <b>${weak.sk.name}</b>.` : ''}</p>
    ${played.length ? `<div class="table-wrap"><table>
      <thead><tr><th>Skill</th><th>Level</th><th>Accuracy</th><th>Mastery</th><th>Last played</th></tr></thead>
      <tbody>${played.map(({ sk, s }) => `<tr>
        <td>${sk.icon} ${sk.name}</td>
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
    <button class="icon-btn" id="home" aria-label="Home">🏠</button>
    <div class="who">👪 Parent corner</div>
    <button class="icon-btn" id="sound" aria-label="Sound">${soundOn() ? '🔊' : '🔇'}</button>
  </header>
  <div class="screen parent">
    ${ps.length ? ps.map(parentCard).join('') : '<p class="muted">No players yet.</p>'}
    <p class="muted note">Progress is saved on this device only. Read aloud uses your device's built in English voice.</p>
  </div>`);
  $('#home').onclick = home;
  $('#sound').onclick = () => { setSound(!soundOn()); parent(); };
  $$('[data-act]').forEach(b => b.onclick = () => {
    if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Tap again to confirm'; return; }
    if (b.dataset.act === 'reset') db.resetProfile(b.dataset.id);
    else db.deleteProfile(b.dataset.id);
    parent();
  });
}

/* ---------- Helpers and start up ---------- */

function shake(el) {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

save();
home();
