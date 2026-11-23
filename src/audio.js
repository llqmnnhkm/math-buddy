// Read aloud (Web Speech API) and sound effects (Web Audio). No audio files needed.
let on = (() => { try { return localStorage.getItem('mathbuddy:sound') !== 'off'; } catch { return true; } })();
const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
let voice = null;

// Only English voices are used. Preferred natural sounding voices first, then any English voice.
const PREFERRED = [/Google UK English Female/i, /Samantha/i, /Karen/i, /Serena/i, /Libby|Sonia|Aria|Jenny/i, /Google US English/i];
function pickVoice() {
  const en = speechSynthesis.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang));
  voice = null;
  for (const re of PREFERRED) { voice = en.find(v => re.test(v.name)); if (voice) break; }
  voice ||= en.find(v => /^en[-_]GB/i.test(v.lang)) || en.find(v => /^en[-_](US|AU)/i.test(v.lang)) || en[0] || null;
}
if (hasSpeech) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

export const soundOn = () => on;

export function setSound(v) {
  on = v;
  try { localStorage.setItem('mathbuddy:sound', v ? 'on' : 'off'); } catch { /* ignore */ }
  if (!v) stopSpeech();
}

export function stopSpeech() { if (hasSpeech) speechSynthesis.cancel(); }

export function speak(text) {
  if (!on || !hasSpeech || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, ' '));
  u.lang = voice?.lang || 'en-GB'; // always English, even if the device language is Malay
  if (voice) u.voice = voice;
  u.rate = 0.9;
  u.pitch = 1.15;
  speechSynthesis.speak(u);
}

let ctx;
function tone(freq, start, dur, type = 'sine', vol = 0.18) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(start);
  o.stop(start + dur + 0.02);
}

export function sfx(kind) {
  if (!on) return;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    switch (kind) {
      case 'right': tone(660, t, 0.12); tone(880, t + 0.1, 0.2); break;
      case 'wrong': tone(240, t, 0.18, 'triangle', 0.14); tone(200, t + 0.12, 0.2, 'triangle', 0.12); break;
      case 'pop': tone(950, t, 0.05, 'square', 0.08); tone(320, t + 0.03, 0.1, 'square', 0.06); break;
      case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.12, 0.22)); break;
      case 'tap': tone(520, t, 0.05, 'sine', 0.07); break;
      case 'combo': [784, 988, 1175].forEach((f, i) => tone(f, t + i * 0.07, 0.12, 'triangle', 0.14)); break;
      case 'hit': tone(180, t, 0.12, 'square', 0.12); tone(660, t + 0.06, 0.12, 'sine', 0.16); break;
      case 'hatch': tone(300, t, 0.08, 'square', 0.08); [523, 784, 1047, 1319].forEach((f, i) => tone(f, t + 0.1 + i * 0.1, 0.25)); break;
      default: break;
    }
  } catch { /* audio not available */ }
}
