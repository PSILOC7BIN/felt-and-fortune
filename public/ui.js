// Shared look-and-feel pieces: sounds, the Ace mascot, glyphs, cards, the 3D discard tray, and inputs.
import { rank, halves } from './bj.js';

export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---- sound: synthesized cues (Web Audio), no audio files ----------------------------------------
// A small mix bus (compressor + generated room reverb) and a few voices: bell, marimba, pluck, and
// filtered noise for card snaps, chip clacks, and whooshes.
export const Sound = (() => {
  let ac = null, bus = null, wet = null, on = localStorage.getItem('ff-sound') !== 'off';
  function audio() {
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      ac = new C();
      const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4;
      const master = ac.createGain(); master.gain.value = .9;
      comp.connect(master).connect(ac.destination);
      bus = ac.createGain(); bus.connect(comp);
      // Room reverb from decaying stereo noise.
      const len = Math.floor(ac.sampleRate * 1.4), ir = ac.createBuffer(2, len, ac.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
      const verb = ac.createConvolver(); verb.buffer = ir;
      wet = ac.createGain(); wet.gain.value = .22; wet.connect(verb).connect(comp);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  const out = (node, reverb = true) => { node.connect(bus); if (reverb) node.connect(wet); };
  const env = (g, t, peak, attack, decay) => { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + attack + decay); };

  // Bell: a few sine partials with their own decays.
  function bell(f, at = 0, { gain = .12, decay = 1.1, bright = 1 } = {}) {
    const a = audio(); if (!a) return; const t = a.currentTime + at;
    [[1, 1], [2.0, .42 * bright], [3.01, .18 * bright], [4.2, .08 * bright]].forEach(([r, amp], i) => {
      const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f * r;
      env(g, t, gain * amp, .004, decay / (1 + i * .9)); o.connect(g); out(g); o.start(t); o.stop(t + decay + .1);
    });
  }
  // Marimba: warm and short.
  function marimba(f, at = 0, { gain = .14, decay = .32 } = {}) {
    const a = audio(); if (!a) return; const t = a.currentTime + at;
    [[1, 1], [4, .25], [9.9, .06]].forEach(([r, amp], i) => {
      const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f * r;
      env(g, t, gain * amp, .003, decay / (1 + i * 2)); o.connect(g); out(g); o.start(t); o.stop(t + decay + .05);
    });
  }
  // Pluck: triangle through a closing lowpass.
  function pluck(f, at = 0, { gain = .1, decay = .25, slide = 1 } = {}) {
    const a = audio(); if (!a) return; const t = a.currentTime + at;
    const o = a.createOscillator(), lp = a.createBiquadFilter(), g = a.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(f, t); if (slide !== 1) o.frequency.exponentialRampToValueAtTime(f * slide, t + decay);
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 6, t); lp.frequency.exponentialRampToValueAtTime(f * 1.2, t + decay);
    env(g, t, gain, .004, decay); o.connect(lp).connect(g); out(g); o.start(t); o.stop(t + decay + .05);
  }
  let noiseBuf = null;
  function noise(at = 0, { dur = .05, type = 'bandpass', freq = 2500, q = 1, gain = .1, sweep = 0, reverb = false } = {}) {
    const a = audio(); if (!a) return; const t = a.currentTime + at;
    if (!noiseBuf) { noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = noiseBuf; f.type = type; f.Q.value = q; f.frequency.setValueAtTime(freq, t); if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    env(g, t, gain, .003, dur); s.connect(f).connect(g); out(g, reverb); s.start(t); s.stop(t + dur + .05);
  }
  const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760, C7: 2093 };
  const sparkle = (at = 0, n = 4) => { for (let i = 0; i < n; i++) bell(2093 * Math.pow(2, (Math.random() * 7 | 0) / 12), at + i * .045, { gain: .03, decay: .5, bright: .4 }); };

  const fx = {
    tap: () => { noise(0, { dur: .018, type: 'highpass', freq: 2600, gain: .05 }); marimba(1200, 0, { gain: .03, decay: .05 }); },
    tick: () => noise(0, { dur: .012, type: 'bandpass', freq: 3800, q: 2, gain: .06 }),
    select: () => marimba(N.G5, 0, { gain: .1, decay: .2 }),
    deal: () => { noise(0, { dur: .05, type: 'bandpass', freq: 3200, q: .8, gain: .14, sweep: 1400 }); noise(.012, { dur: .02, type: 'highpass', freq: 5000, gain: .05 }); },
    chips: () => [0, .055, .1].forEach((d, i) => { noise(d, { dur: .025, type: 'bandpass', freq: 2300 + i * 300, q: 6, gain: .12 }); marimba(1700 + i * 120, d, { gain: .03, decay: .04 }); }),
    correct: () => { bell(N.E6, 0, { gain: .1, decay: .9 }); bell(N.A6, .085, { gain: .11, decay: 1.2 }); sparkle(.12, 2); },
    wrong: () => { pluck(196, 0, { gain: .12, decay: .3, slide: .75 }); pluck(147, .1, { gain: .1, decay: .38, slide: .8 }); },
    streak: () => [N.C6, N.E6, N.G6, N.C7].forEach((f, i) => bell(f, i * .07, { gain: .08, decay: .8 })),
    complete: () => { [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => marimba(f, i * .1, { gain: .13, decay: .35 })); [N.C6, N.E6, N.G6].forEach(f => bell(f, .42, { gain: .07, decay: 1.6 })); sparkle(.5, 6); },
    reveal: () => [N.G5, N.C6, N.E6].forEach((f, i) => bell(f, i * .07, { gain: .07, decay: .7 })),
    coin: () => { pluck(N.B5, 0, { gain: .08, decay: .06 }); bell(N.E6, .06, { gain: .09, decay: .55, bright: 1.3 }); },
    energy: () => { noise(0, { dur: .35, type: 'bandpass', freq: 500, q: 3, gain: .05, sweep: 3500, reverb: true }); [N.C6, N.G6].forEach((f, i) => bell(f, .2 + i * .08, { gain: .06, decay: .6 })); },
    freeze: () => { noise(0, { dur: .4, type: 'highpass', freq: 6000, gain: .03, reverb: true }); [N.A6, N.E6, N.C7, N.G6].forEach((f, i) => bell(f, i * .06, { gain: .045, decay: 1, bright: .5 })); },
    unlock: () => { noise(0, { dur: .2, type: 'bandpass', freq: 600, q: 2, gain: .05, sweep: 2600 }); bell(N.C6, .12, { gain: .09 }); bell(N.G6, .2, { gain: .09, decay: 1.4 }); sparkle(.3, 4); },
    levelup: () => { [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6].forEach((f, i) => marimba(f, i * .075, { gain: .12, decay: .3 })); [N.C6, N.E6, N.G6, N.C7].forEach(f => bell(f, .5, { gain: .06, decay: 2 })); sparkle(.55, 8); },
    whoosh: () => noise(0, { dur: .28, type: 'bandpass', freq: 350, q: 1.2, gain: .09, sweep: 3200, reverb: true }),
    pop: () => pluck(420, 0, { gain: .1, decay: .09, slide: 2.2 }),
    cheer: () => { [N.G5, N.C6, N.E6].forEach((f, i) => marimba(f, i * .05, { gain: .1, decay: .25 })); sparkle(.15, 3); },
  };
  return {
    play(name) { window.ffHaptic?.(name); if (on && fx[name]) { try { fx[name](); } catch { /* audio unavailable */ } } },
    get on() { return on; },
    toggle() { on = !on; localStorage.setItem('ff-sound', on ? 'on' : 'off'); if (on) fx.select(); return on; },
  };
})();

// ---- Ace, the mascot: an original playing-card character -----------------------------------
// Coach styles (Store cosmetics): accessories drawn on Ace's card. Card spans x 9–89, y 8–112.
const COACH_SKINS = {
  bowtie: '<path d="M37 98l12 5-12 5zM61 98l-12 5 12 5z" fill="#E11D48" stroke="#9F1239" stroke-width="1.5" stroke-linejoin="round"/><circle cx="49" cy="103" r="3" fill="#9F1239"/>',
  visor: '<path d="M14 26q35-16 70 0v6q-35-14-70 0z" fill="#16A34A"/><path d="M14 30q35-12 70 0l8 9q-43-18-86 0z" fill="#22C55E" opacity=".85"/>',
  headphones: '<path d="M13 52q0-44 36-44t36 44" fill="none" stroke="#1F2937" stroke-width="6" stroke-linecap="round"/><rect x="4" y="46" width="13" height="24" rx="6" fill="#EF4444"/><rect x="81" y="46" width="13" height="24" rx="6" fill="#EF4444"/>',
  sunglasses: '<rect x="26" y="47" width="21" height="15" rx="6" fill="#111827"/><rect x="52" y="47" width="21" height="15" rx="6" fill="#111827"/><path d="M47 52h5M20 51l6 1M79 51l-6 1" stroke="#111827" stroke-width="3" stroke-linecap="round"/><path d="M30 51l6-2" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>',
  cowboy: '<path d="M8 14q41 14 82 0q-4 8-41 10Q12 22 8 14z" fill="#92400E"/><path d="M28 14q2-20 21-20t21 20q-21 6-42 0z" fill="#B45309"/><path d="M28 12q21 5 42 0" stroke="#451A03" stroke-width="3" fill="none"/>',
  party: '<path d="M49 -20L33 14h32z" fill="#A855F7"/><path d="M41 -3l14 7M37 6l20 5" stroke="#FDE047" stroke-width="3"/><circle cx="49" cy="-21" r="5" fill="#F472B6"/>',
  tophat: '<rect x="22" y="6" width="54" height="6" rx="3" fill="#111"/><rect x="31" y="-22" width="36" height="30" rx="4" fill="#1C1C1E"/><rect x="31" y="0" width="36" height="5" fill="#DC2626"/>',
  wizard: '<path d="M49 -28L27 12h44z" fill="#4C1D95"/><path d="M18 12q31 8 62 0" stroke="#4C1D95" stroke-width="7" stroke-linecap="round"/><path d="M45 -8l2 4 4 1-4 2-1 4-2-4-4-1 4-2z" fill="#FDE047"/><circle cx="56" cy="2" r="2" fill="#FDE047"/>',
  monocle: '<circle cx="62" cy="56" r="11" fill="none" stroke="#B8860B" stroke-width="3"/><path d="M71 63q8 14 2 30" fill="none" stroke="#B8860B" stroke-width="1.5"/>',
  crown: '<path d="M26 12l4-22 10 12 9-16 9 16 10-12 4 22z" fill="#FACC15" stroke="#B45309" stroke-width="2" stroke-linejoin="round"/><circle cx="49" cy="4" r="3" fill="#EF4444"/><circle cx="35" cy="6" r="2.2" fill="#3B82F6"/><circle cx="63" cy="6" r="2.2" fill="#3B82F6"/>',
  pro: '<path d="M30 92q19 14 38 0" fill="none" stroke="#D4AF37" stroke-width="3.5" stroke-dasharray="3 2"/><circle cx="49" cy="101" r="6" fill="#D4AF37" stroke="#7A5B12" stroke-width="1.5"/><path d="M47 99h4M49 97v8" stroke="#7A5B12" stroke-width="1.5"/>',
  'dealer': {f: '<path d="M14 26q35-16 70 0v6q-35-14-70 0z" fill="#16A34A"/><path d="M14 30q35-12 70 0l8 9q-43-18-86 0z" fill="#22C55E" opacity=".85"/><path d="M9 86Q9 84 12 84L37 92 49 112H25Q9 112 9 98Z" fill="#B91C1C"/><path d="M89 86Q89 84 86 84L61 92 49 112H73Q89 112 89 98Z" fill="#B91C1C"/><path d="M37 92L49 112 61 92 49 96Z" fill="#fff"/><path d="M40 91l9 4-9 4zM58 91l-9 4 9 4z" fill="#111"/><circle cx="49" cy="95" r="2.3" fill="#111"/><circle cx="44" cy="104" r="1.8" fill="#FACC15"/><circle cx="54" cy="104" r="1.8" fill="#FACC15"/><path d="M14 96h8M76 96h8" stroke="#111" stroke-width="2.5"/>'},
  'tuxedo': {f: '<path d="M9 86Q9 84 12 84L37 92 49 112H25Q9 112 9 98Z" fill="#1C1C1E"/><path d="M89 86Q89 84 86 84L61 92 49 112H73Q89 112 89 98Z" fill="#1C1C1E"/><path d="M37 92L49 112 61 92 49 96Z" fill="#F2F2F7"/><path d="M40 91l9 4-9 4zM58 91l-9 4 9 4z" fill="#111"/><circle cx="49" cy="95" r="2.3" fill="#111"/><path d="M71 95h10l-1 5h-8z" fill="#E11D48"/><path d="M73 95l2-3 2 3 2-3 1 3" fill="#E11D48"/><circle cx="49" cy="104" r="1.2" fill="#333"/><circle cx="49" cy="108" r="1.2" fill="#333"/>'},
  'pirate': {f: '<path d="M8 18Q49 -2 90 18Q84 8 68 5Q60 -12 49 -12Q38 -12 30 5Q14 8 8 18Z" fill="#1C1C1E"/><path d="M13 16Q49 1 85 16" stroke="#D6B26E" stroke-width="2" fill="none"/><circle cx="49" cy="2" r="5.5" fill="#F5F5F4"/><circle cx="47" cy="1.5" r="1.2" fill="#111"/><circle cx="51" cy="1.5" r="1.2" fill="#111"/><path d="M43 9l12-6M43 3l12 6" stroke="#F5F5F4" stroke-width="1.6"/><path d="M18 38L84 70" stroke="#111" stroke-width="2.4"/><ellipse cx="62" cy="57" rx="10" ry="9" fill="#111"/><path d="M9 90Q49 104 89 90V100Q89 112 73 112H25Q9 112 9 100Z" fill="#B91C1C"/><path d="M9 98Q49 112 89 98" stroke="#7F1D1D" stroke-width="2" fill="none"/><path d="M80 94l10 12M84 92l2 16" stroke="#7F1D1D" stroke-width="3" stroke-linecap="round"/>'},
  'astronaut': {b: '<rect x="-2" y="40" width="10" height="44" rx="4" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="1.5"/>', f: '<circle cx="49" cy="58" r="48" fill="#BFE6FF" opacity=".18" stroke="#E5F3FF" stroke-width="4"/><path d="M20 30q10-14 26-17" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85" fill="none"/><path d="M9 94Q49 82 89 94V100Q89 112 73 112H25Q9 112 9 100Z" fill="#F2F2F7" stroke="#C7C7CC" stroke-width="1.5"/><rect x="60" y="97" width="13" height="9" rx="1.5" fill="#1D4ED8"/><path d="M62 101h9" stroke="#fff" stroke-width="1"/><circle cx="36" cy="102" r="4.5" fill="#FF3B30"/><circle cx="36" cy="102" r="2" fill="#FDE047"/><path d="M49 10V-8" stroke="#9CA3AF" stroke-width="2.5"/><circle cx="49" cy="-10" r="3.5" fill="#FF3B30"/>'},
  'detective': {f: '<path d="M6 18Q49 6 92 18Q86 25 49 23Q12 25 6 18Z" fill="#78350F"/><path d="M24 17Q24 -8 49 -8Q74 -8 74 17Q49 12 24 17Z" fill="#92400E"/><path d="M24 11Q49 6 74 11V16Q49 11 24 16Z" fill="#1C1C1E"/><path d="M44-7q5 5 10 0" stroke="#78350F" stroke-width="2" fill="none"/><path d="M9 86L34 93 28 112H25Q9 112 9 98Z" fill="#A16207"/><path d="M89 86L64 93 70 112H73Q89 112 89 98Z" fill="#A16207"/><path d="M34 93L49 112 64 93" fill="#FEF3C7"/><circle cx="41" cy="104" r="1.6" fill="#78350F"/><circle cx="88" cy="78" r="11" fill="#BFE6FF" fill-opacity=".35" stroke="#78350F" stroke-width="3.5"/><path d="M96 87l9 11" stroke="#78350F" stroke-width="5" stroke-linecap="round"/>'},
  'superhero': {b: '<path d="M16 24Q-6 74 -2 124H100Q104 74 82 24Z" fill="#DC2626"/>', f: '<path fill-rule="evenodd" d="M22 50Q36 40 49 49Q62 40 76 50Q78 64 62 65Q53 65 49 59Q45 65 36 65Q20 64 22 50ZM30 56a8 8 0 1 0 16 0a8 8 0 1 0-16 0ZM54 56a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z" fill="#1D4ED8"/><path d="M9 88Q49 100 89 88V100Q89 112 73 112H25Q9 112 9 100Z" fill="#1D4ED8"/><circle cx="49" cy="101" r="9" fill="#FACC15" stroke="#DC2626" stroke-width="1.5"/><path d="M46 95h7l-4 4h5l-9 7 3-5h-4z" fill="#DC2626"/><path d="M16 26L6 20M82 26l10-6" stroke="#B91C1C" stroke-width="4" stroke-linecap="round"/>'},
  'robe': {b: '<path d="M16 24Q-6 74 -2 124H100Q104 74 82 24Z" fill="#5B21B6"/>', f: '<path d="M9 84Q49 98 89 84V100Q89 112 73 112H25Q9 112 9 100Z" fill="#6D28D9"/><path d="M9 84Q49 98 89 84" stroke="#fff" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M20 91v3" stroke="#111" stroke-width="2" stroke-linecap="round"/><path d="M32 89v3" stroke="#111" stroke-width="2" stroke-linecap="round"/><path d="M44 88v3" stroke="#111" stroke-width="2" stroke-linecap="round"/><path d="M56 88v3" stroke="#111" stroke-width="2" stroke-linecap="round"/><path d="M68 89v3" stroke="#111" stroke-width="2" stroke-linecap="round"/><path d="M80 91v3" stroke="#111" stroke-width="2" stroke-linecap="round"/><circle cx="49" cy="100" r="4" fill="#FACC15"/>'},
  'event-newyear': {f: '<rect x="22" y="6" width="54" height="6" rx="3" fill="#B8860B"/><rect x="31" y="-22" width="36" height="30" rx="4" fill="#B8860B"/><rect x="31" y="0" width="36" height="5" fill="#1C1C1E"/><text x="49" y="-6" text-anchor="middle" font-family="ui-rounded,sans-serif" font-weight="900" font-size="10" fill="#1C1C1E">NYE</text><path d="M9 86Q9 84 12 84L37 92 49 112H25Q9 112 9 98Z" fill="#111"/><path d="M89 86Q89 84 86 84L61 92 49 112H73Q89 112 89 98Z" fill="#111"/><path d="M37 92L49 112 61 92 49 96Z" fill="#F2F2F7"/><path d="M40 91l9 4-9 4zM58 91l-9 4 9 4z" fill="#B8860B"/><circle cx="49" cy="95" r="2.3" fill="#B8860B"/><circle cx="12" cy="0" r="1.6" fill="#F472B6"/><circle cx="86" cy="-4" r="1.6" fill="#22D3EE"/><circle cx="6" cy="30" r="1.6" fill="#FDE047"/><circle cx="94" cy="34" r="1.6" fill="#A78BFA"/><circle cx="90" cy="8" r="1.6" fill="#FDE047"/>'},
  'event-hearts': {b: '<path d="M12 46Q-16 24 -12 70Q-6 63 0 72Q0 62 12 64Z" fill="#fff" stroke="#FBCFE8" stroke-width="2"/><path d="M86 46Q114 24 110 70Q104 63 98 72Q98 62 86 64Z" fill="#fff" stroke="#FBCFE8" stroke-width="2"/>', f: '<path d="M16 20Q49 2 82 20" stroke="#FB7185" stroke-width="4" fill="none"/><path d="M26 15V5M72 15V5" stroke="#FB7185" stroke-width="2"/><path transform="translate(26 0) scale(0.8)" d="M0 5C-1-1-8-2-8 3c0 4 4 7 8 10c4-3 8-6 8-10c0-5-7-4-8 2z" fill="#E11D48"/><path transform="translate(72 0) scale(0.8)" d="M0 5C-1-1-8-2-8 3c0 4 4 7 8 10c4-3 8-6 8-10c0-5-7-4-8 2z" fill="#E11D48"/><path transform="translate(49 98) scale(1.1)" d="M0 5C-1-1-8-2-8 3c0 4 4 7 8 10c4-3 8-6 8-10c0-5-7-4-8 2z" fill="#E11D48"/><path transform="translate(72 72) scale(0.45)" d="M0 5C-1-1-8-2-8 3c0 4 4 7 8 10c4-3 8-6 8-10c0-5-7-4-8 2z" fill="#FB7185"/>'},
  'event-clover': {f: '<path d="M14 17Q49 9 84 17Q84 23 49 23Q14 23 14 17Z" fill="#15803D"/><path d="M28 17L33 -16H65L70 17Q49 12 28 17Z" fill="#16A34A"/><rect x="32" y="3" width="34" height="7" fill="#111"/><rect x="44" y="2" width="10" height="9" rx="1" fill="none" stroke="#FACC15" stroke-width="2.2"/><path d="M9 90Q49 104 89 90V100Q89 112 73 112H25Q9 112 9 100Z" fill="#15803D"/><path transform="translate(49 100) rotate(0)" d="M0 0C-1-3-5-4-5-7c0-2.5 3.5-3.5 5-1 1.5-2.5 5-1.5 5 1C5-4 1-3 0 0z" fill="#86EFAC"/><path transform="translate(49 100) rotate(90)" d="M0 0C-1-3-5-4-5-7c0-2.5 3.5-3.5 5-1 1.5-2.5 5-1.5 5 1C5-4 1-3 0 0z" fill="#86EFAC"/><path transform="translate(49 100) rotate(180)" d="M0 0C-1-3-5-4-5-7c0-2.5 3.5-3.5 5-1 1.5-2.5 5-1.5 5 1C5-4 1-3 0 0z" fill="#86EFAC"/><path transform="translate(49 100) rotate(270)" d="M0 0C-1-3-5-4-5-7c0-2.5 3.5-3.5 5-1 1.5-2.5 5-1.5 5 1C5-4 1-3 0 0z" fill="#86EFAC"/>'},
  'event-spring': {f: '<circle cx="20.0" cy="12.0" r="3.0" fill="#F9A8D4"/><circle cx="23.8" cy="14.8" r="3.0" fill="#F9A8D4"/><circle cx="22.4" cy="19.2" r="3.0" fill="#F9A8D4"/><circle cx="17.6" cy="19.2" r="3.0" fill="#F9A8D4"/><circle cx="16.2" cy="14.8" r="3.0" fill="#F9A8D4"/><circle cx="20" cy="16" r="2.2" fill="#FDE047"/><circle cx="34.0" cy="4.0" r="3.0" fill="#C4B5FD"/><circle cx="37.8" cy="6.8" r="3.0" fill="#C4B5FD"/><circle cx="36.4" cy="11.2" r="3.0" fill="#C4B5FD"/><circle cx="31.6" cy="11.2" r="3.0" fill="#C4B5FD"/><circle cx="30.2" cy="6.8" r="3.0" fill="#C4B5FD"/><circle cx="34" cy="8" r="2.2" fill="#FDE047"/><circle cx="49.0" cy="1.0" r="3.0" fill="#FB7185"/><circle cx="52.8" cy="3.8" r="3.0" fill="#FB7185"/><circle cx="51.4" cy="8.2" r="3.0" fill="#FB7185"/><circle cx="46.6" cy="8.2" r="3.0" fill="#FB7185"/><circle cx="45.2" cy="3.8" r="3.0" fill="#FB7185"/><circle cx="49" cy="5" r="2.2" fill="#FDE047"/><circle cx="64.0" cy="4.0" r="3.0" fill="#FDBA74"/><circle cx="67.8" cy="6.8" r="3.0" fill="#FDBA74"/><circle cx="66.4" cy="11.2" r="3.0" fill="#FDBA74"/><circle cx="61.6" cy="11.2" r="3.0" fill="#FDBA74"/><circle cx="60.2" cy="6.8" r="3.0" fill="#FDBA74"/><circle cx="64" cy="8" r="2.2" fill="#FDE047"/><circle cx="78.0" cy="12.0" r="3.0" fill="#F9A8D4"/><circle cx="81.8" cy="14.8" r="3.0" fill="#F9A8D4"/><circle cx="80.4" cy="19.2" r="3.0" fill="#F9A8D4"/><circle cx="75.6" cy="19.2" r="3.0" fill="#F9A8D4"/><circle cx="74.2" cy="14.8" r="3.0" fill="#F9A8D4"/><circle cx="78" cy="16" r="2.2" fill="#FDE047"/><path d="M14 20Q49 0 84 20" stroke="#16A34A" stroke-width="2" fill="none"/><circle cx="84.0" cy="91.0" r="3.8" fill="#FDE047"/><circle cx="88.8" cy="94.5" r="3.8" fill="#FDE047"/><circle cx="87.0" cy="100.0" r="3.8" fill="#FDE047"/><circle cx="81.0" cy="100.0" r="3.8" fill="#FDE047"/><circle cx="79.2" cy="94.5" r="3.8" fill="#FDE047"/><circle cx="84" cy="96" r="2.8" fill="#F97316"/>'},
  'event-derby': {f: '<path d="M18 22Q18 -10 49 -10Q80 -10 80 22Z" fill="#1E3A8A"/><path d="M49 -10V22M18 8H80" stroke="#FACC15" stroke-width="5"/><path d="M14 22H90Q90 28 80 28H14Z" fill="#1E3A8A"/><circle cx="49" cy="-10" r="3" fill="#DC2626"/><path d="M9 86Q49 98 89 86V100Q89 112 73 112H25Q9 112 9 100Z" fill="#FACC15"/><path d="M25 92l5 8-5 8-5-8z" fill="#DC2626"/><path d="M41 92l5 8-5 8-5-8z" fill="#DC2626"/><path d="M57 92l5 8-5 8-5-8z" fill="#DC2626"/><path d="M73 92l5 8-5 8-5-8z" fill="#DC2626"/>'},
  'event-summer': {f: '<path d="M4 20Q49 6 94 20Q86 28 49 26Q12 28 4 20Z" fill="#FCD34D"/><path d="M26 19Q28 -2 49 -2Q70 -2 72 19Q49 14 26 19Z" fill="#FDE68A"/><path d="M26 14Q49 9 72 14V18Q49 13 26 18Z" fill="#F472B6"/><rect x="26" y="47" width="21" height="15" rx="6" fill="#0EA5E9"/><rect x="52" y="47" width="21" height="15" rx="6" fill="#0EA5E9"/><path d="M47 52h5" stroke="#0369A1" stroke-width="3"/><circle cx="18.0" cy="82.7" r="2.7" fill="#F472B6"/><circle cx="21.4" cy="85.2" r="2.7" fill="#F472B6"/><circle cx="20.1" cy="89.2" r="2.7" fill="#F472B6"/><circle cx="15.9" cy="89.2" r="2.7" fill="#F472B6"/><circle cx="14.6" cy="85.2" r="2.7" fill="#F472B6"/><circle cx="18" cy="86.28" r="2.0" fill="#fff"/><circle cx="30.0" cy="84.1" r="2.7" fill="#FDE047"/><circle cx="33.4" cy="86.6" r="2.7" fill="#FDE047"/><circle cx="32.1" cy="90.6" r="2.7" fill="#FDE047"/><circle cx="27.9" cy="90.6" r="2.7" fill="#FDE047"/><circle cx="26.6" cy="86.6" r="2.7" fill="#FDE047"/><circle cx="30" cy="87.72" r="2.0" fill="#fff"/><circle cx="42.0" cy="85.6" r="2.7" fill="#F97316"/><circle cx="45.4" cy="88.0" r="2.7" fill="#F97316"/><circle cx="44.1" cy="92.1" r="2.7" fill="#F97316"/><circle cx="39.9" cy="92.1" r="2.7" fill="#F97316"/><circle cx="38.6" cy="88.0" r="2.7" fill="#F97316"/><circle cx="42" cy="89.16" r="2.0" fill="#fff"/><circle cx="56.0" cy="85.6" r="2.7" fill="#F472B6"/><circle cx="59.4" cy="88.0" r="2.7" fill="#F472B6"/><circle cx="58.1" cy="92.1" r="2.7" fill="#F472B6"/><circle cx="53.9" cy="92.1" r="2.7" fill="#F472B6"/><circle cx="52.6" cy="88.0" r="2.7" fill="#F472B6"/><circle cx="56" cy="89.16" r="2.0" fill="#fff"/><circle cx="68.0" cy="84.1" r="2.7" fill="#FDE047"/><circle cx="71.4" cy="86.6" r="2.7" fill="#FDE047"/><circle cx="70.1" cy="90.6" r="2.7" fill="#FDE047"/><circle cx="65.9" cy="90.6" r="2.7" fill="#FDE047"/><circle cx="64.6" cy="86.6" r="2.7" fill="#FDE047"/><circle cx="68" cy="87.72" r="2.0" fill="#fff"/><circle cx="80.0" cy="82.7" r="2.7" fill="#F97316"/><circle cx="83.4" cy="85.2" r="2.7" fill="#F97316"/><circle cx="82.1" cy="89.2" r="2.7" fill="#F97316"/><circle cx="77.9" cy="89.2" r="2.7" fill="#F97316"/><circle cx="76.6" cy="85.2" r="2.7" fill="#F97316"/><circle cx="80" cy="86.28" r="2.0" fill="#fff"/>'},
  'event-stripes': {f: '<rect x="22" y="6" width="54" height="6" rx="3" fill="#1E3A8A"/><rect x="31" y="-24" width="36" height="32" rx="3" fill="#fff"/><rect x="33" y="-24" width="4.5" height="32" fill="#DC2626"/><rect x="42" y="-24" width="4.5" height="32" fill="#DC2626"/><rect x="51" y="-24" width="4.5" height="32" fill="#DC2626"/><rect x="60" y="-24" width="4.5" height="32" fill="#DC2626"/><rect x="31" y="0" width="36" height="6" fill="#1E3A8A"/><path transform="translate(37 3) scale(.3)" d="M0-8L2-2.5 8-2.5 3.2 1 5 7 0 3.5-5 7-3.2 1-8-2.5-2-2.5z" fill="#fff"/><path transform="translate(45 3) scale(.3)" d="M0-8L2-2.5 8-2.5 3.2 1 5 7 0 3.5-5 7-3.2 1-8-2.5-2-2.5z" fill="#fff"/><path transform="translate(53 3) scale(.3)" d="M0-8L2-2.5 8-2.5 3.2 1 5 7 0 3.5-5 7-3.2 1-8-2.5-2-2.5z" fill="#fff"/><path transform="translate(61 3) scale(.3)" d="M0-8L2-2.5 8-2.5 3.2 1 5 7 0 3.5-5 7-3.2 1-8-2.5-2-2.5z" fill="#fff"/><path d="M40 93l9 4-9 4zM58 93l-9 4 9 4z" fill="#1E3A8A"/><circle cx="49" cy="97" r="2.3" fill="#1E3A8A"/>'},
  'event-neon': {f: '<path d="M14 46Q49 38 86 46V64Q49 58 14 64Z" fill="#0B0620" stroke="#F0ABFC" stroke-width="2"/><path d="M20 54H80" stroke="#22D3EE" stroke-width="3" stroke-linecap="round"/><path d="M20 54H80" stroke="#22D3EE" stroke-width="8" opacity=".25" stroke-linecap="round"/><path d="M13 52q0-44 36-44t36 44" fill="none" stroke="#F0ABFC" stroke-width="4" stroke-linecap="round"/><rect x="4" y="44" width="12" height="22" rx="5" fill="#0B0620" stroke="#22D3EE" stroke-width="2"/><rect x="82" y="44" width="12" height="22" rx="5" fill="#0B0620" stroke="#22D3EE" stroke-width="2"/>'},
  'event-school': {f: '<path d="M49 -6L92 8 49 22 6 8Z" fill="#1C1C1E"/><path d="M26 15V24Q49 32 72 24V15" fill="#1C1C1E"/><path d="M49 8L84 12V30" stroke="#FACC15" stroke-width="2" fill="none"/><path d="M80 30h8l-1 8h-6z" fill="#FACC15"/><rect x="66" y="94" width="26" height="9" rx="4.5" fill="#FEF3C7" stroke="#A16207" stroke-width="1.2" transform="rotate(-20 79 98)"/><path d="M76 96l4 4" stroke="#DC2626" stroke-width="2.4"/>'},
  'event-haunted': {b: '<path d="M8 28Q-10 80 0 124H98Q108 80 90 28Z" fill="#111"/><path d="M8 28Q-6 76 2 120" stroke="#7F1D1D" stroke-width="3" fill="none"/>', f: '<path d="M9 82L-2 60 32 92ZM89 82L100 60 66 92Z" fill="#7F1D1D"/><path d="M32 92L49 112 66 92 49 98Z" fill="#111"/><path d="M44 74l2.5 6 2.5-6M51 74l2.5 6 2.5-6" fill="#fff" stroke="#111" stroke-width=".8"/><path d="M26 18Q49 10 72 18L49 30Z" fill="#111"/><circle cx="49" cy="102" r="4" fill="#DC2626"/>'},
  'event-harvest': {f: '<path d="M2 18Q49 2 96 18Q88 26 49 24Q10 26 2 18Z" fill="#D97706"/><path d="M24 17Q26 -10 49 -10Q72 -10 74 17Q49 12 24 17Z" fill="#F59E0B"/><path d="M24 12Q49 7 74 12" stroke="#7C2D12" stroke-width="4" fill="none"/><path d="M8 20l-4 8" stroke="#FCD34D" stroke-width="2" stroke-linecap="round"/><path d="M14 22l-2 8" stroke="#FCD34D" stroke-width="2" stroke-linecap="round"/><path d="M84 22l2 8" stroke="#FCD34D" stroke-width="2" stroke-linecap="round"/><path d="M90 20l4 8" stroke="#FCD34D" stroke-width="2" stroke-linecap="round"/><path d="M9 88Q49 100 89 88V100Q89 112 73 112H25Q9 112 9 100Z" fill="#2563EB"/><rect x="28" y="96" width="12" height="10" fill="#DC2626"/><path d="M28 96l12 10M40 96l-12 10" stroke="#FEF3C7" stroke-width="1"/><path d="M62 98h14" stroke="#FEF3C7" stroke-width="1.5" stroke-dasharray="2 2"/>'},
  'event-winter': {f: '<path d="M20 20Q30 -14 66 -18Q86 -16 92 6L84 10Q80 -4 68 -6Q58 4 76 18Z" fill="#DC2626"/><path d="M16 22Q49 8 80 22" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="88" cy="10" r="6" fill="#fff"/><path d="M12 86Q49 100 86 86L88 94Q49 108 10 94Z" fill="#16A34A"/><path d="M70 92l8 20h-10l-4-18z" fill="#16A34A"/><path d="M22 89.8v6" stroke="#fff" stroke-width="2"/><path d="M34 88.6v6" stroke="#fff" stroke-width="2"/><path d="M46 88.0v6" stroke="#fff" stroke-width="2"/><path d="M58 88.2v6" stroke="#fff" stroke-width="2"/><path d="M70 89.1v6" stroke="#fff" stroke-width="2"/>'}
};

export function ace(mood = 'happy', cls = '', skin = (typeof document !== 'undefined' && document.documentElement.dataset.coach) || 'none') {
  const K = '#1C1C1E';
  const sk = COACH_SKINS[skin] || '', skinBack = typeof sk === 'object' ? sk.b || '' : '', skinFront = typeof sk === 'object' ? sk.f || '' : sk;
  const dots = '<circle cx="38" cy="56" r="7" fill="#1C1C1E"/><circle cx="62" cy="56" r="7" fill="#1C1C1E"/><circle cx="40.5" cy="53.5" r="2.4" fill="#fff"/><circle cx="64.5" cy="53.5" r="2.4" fill="#fff"/>';
  const arcs = `<path d="M31 57q7-9 14 0M55 57q7-9 14 0" stroke="${K}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  const eyes = {
    wow: arcs, cheer: arcs,
    wink: `<circle cx="38" cy="56" r="7" fill="${K}"/><circle cx="40.5" cy="53.5" r="2.4" fill="#fff"/><path d="M55 57q7-6 14 0" stroke="${K}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`,
    love: '<path d="M38 63l-8-8a4.6 4.6 0 0 1 8-5 4.6 4.6 0 0 1 8 5z" fill="#FF2D55"/><path d="M62 63l-8-8a4.6 4.6 0 0 1 8-5 4.6 4.6 0 0 1 8 5z" fill="#FF2D55"/>',
    cool: `<rect x="27" y="49" width="20" height="12" rx="5" fill="${K}"/><rect x="53" y="49" width="20" height="12" rx="5" fill="${K}"/><path d="M47 53h6" stroke="${K}" stroke-width="3"/><path d="M31 52l5-1.5" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>`,
    shock: `<circle cx="38" cy="56" r="9" fill="#fff" stroke="${K}" stroke-width="3"/><circle cx="62" cy="56" r="9" fill="#fff" stroke="${K}" stroke-width="3"/><circle cx="38" cy="56" r="3.5" fill="${K}"/><circle cx="62" cy="56" r="3.5" fill="${K}"/>`,
    sad: dots,
  }[mood] || dots;
  const mouth = {
    happy: `<path d="M41 71q9 9 18 0" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    wow: `<path d="M39 68q11 17 22 0z" fill="#FF3B30" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>`,
    cheer: `<path d="M37 67q13 20 26 0z" fill="#FF3B30" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/><path d="M43 74q7 4 14 0" stroke="#FF8A80" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    wink: `<path d="M42 72q10 6 17-3" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    love: `<path d="M41 70q9 10 18 0" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    cool: `<path d="M42 73q9 3 16-4" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    shock: `<ellipse cx="50" cy="75" rx="6" ry="7" fill="${K}"/>`,
    sad: `<path d="M42 78q8-8 16 0" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M66 63q3 5 0 8q-3-3 0-8z" fill="#5AC8FA"/>`,
    oops: `<path d="M42 77q8-7 16 0" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    think: `<path d="M43 74h14" stroke="${K}" stroke-width="4" stroke-linecap="round"/>`,
  }[mood] || '';
  const brows = mood === 'oops' || mood === 'sad' ? `<path d="M30 44l12 4M70 44l-12 4" stroke="${K}" stroke-width="3.5" stroke-linecap="round"/>`
    : mood === 'think' ? `<path d="M31 45q7-4 14 0" stroke="${K}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
    : mood === 'shock' ? `<path d="M30 40q8-5 16 0M54 40q8-5 16 0" stroke="${K}" stroke-width="3.5" fill="none" stroke-linecap="round"/>` : '';
  return `<svg class="ace ace-${mood} ${cls}" viewBox="0 0 100 124" role="img" aria-label="Ace, the Felt &amp; Fortune coach">${skinBack}<rect x="11" y="14" width="80" height="104" rx="16" fill="#C7C7CC"/><rect x="9" y="8" width="80" height="104" rx="16" fill="#fff" stroke="#D1D1D6" stroke-width="3"/><text x="19" y="31" font-family="ui-rounded,system-ui,sans-serif" font-weight="800" font-size="17" fill="#007AFF">A</text><path d="M24 34c-4 4-6 6-3 8 1.5 1 3 0 3-1 0 1 1.5 2 3 1 3-2 1-4-3-8z" fill="#007AFF"/>${brows}${eyes}<circle cx="27" cy="69" r="5.5" fill="#FF2D55" opacity=".22"/><circle cx="73" cy="69" r="5.5" fill="#FF2D55" opacity=".22"/>${mouth}<path d="M50 88c-6 6-9 9-4.5 12 2.2 1.4 4.5 0 4.5-1.5 0 1.5 2.3 2.9 4.5 1.5 4.5-3 1.5-6-4.5-12z" fill="#007AFF" opacity=".9"/>${skinFront}</svg>`;
}

// ---- glyphs -------------------------------------------------------------------------------
const glyphs = {
  wrench: '<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>',
  star: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/>',
  check: '<path d="M4.5 12.5l4.8 4.8L19.5 7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>',
  lock: '<path d="M7 10V7.5a5 5 0 0 1 10 0V10h1a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 6 10zm2.5 0h5V7.5a2.5 2.5 0 0 0-5 0z"/>',
  flame: '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 1.5-4.5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  bolt: '<path d="M13.5 2L4 13.5h6.5L9 22l11-12.5h-6.8z"/>',
  dumbbell: '<path d="M3 9h2V7h3v10H5v-2H3zM21 9h-2V7h-3v10h3v-2h2zM8 11h8v2H8z"/>',
  trophy: '<path d="M7 3h10v2h4v3a5 5 0 0 1-4.3 5A5 5 0 0 1 13 16v3h3v2H8v-2h3v-3a5 5 0 0 1-3.7-3A5 5 0 0 1 3 8V5h4zm10 4v4a3 3 0 0 0 2-3V7zM5 7v1a3 3 0 0 0 2 3V7z"/>',
  speaker: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  close: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  next: '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  path: '<path d="M7 9.5c0 4 10 1 10 5.5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/>',
  chart: '<path d="M4 20V10h3.5v10zm6.25 0V4h3.5v16zm6.25 0v-7H20v7z"/>',
  users: '<path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3.9 3.1-6 7-6s7 2.1 7 6zm15.5 0c0-2-.6-3.7-1.8-5 3 .2 6.3 1.6 6.3 5z"/>',
  person: '<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-8 10c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5z"/>',
  cards: '<path d="M8.5 3h10a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 7 19.5v-15A1.5 1.5 0 0 1 8.5 3z"/><path d="M5.5 6.5L4 19a1.5 1.5 0 0 0 1.3 1.7l.7.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  count: '<path d="M4 4h16v16H4z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  stack: '<path d="M3 17l9 4 9-4M3 12.5l9 4 9-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 3l9 4-9 4-9-4z"/>',
  divide: '<circle cx="12" cy="5.5" r="2.2"/><circle cx="12" cy="18.5" r="2.2"/><path d="M4 12h16" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>',
  target: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="1.8"/>',
  shoe: '<path d="M3 18h18v3H3zM5 8l10-4 4 10H5z"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.6" fill="#fff"/><circle cx="16" cy="16" r="1.6" fill="#fff"/><circle cx="12" cy="12" r="1.6" fill="#fff"/>',
  rotl: '<path d="M4 12a8 8 0 1 0 2.3-5.7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M3 3v5h5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  rotr: '<path d="M20 12a8 8 0 1 1-2.3-5.7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M21 3v5h-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  heart: '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
  gear: '<path d="M10.3 2h3.4l.5 2.6 1.9.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.9 2.6.5v3.4l-2.6.5-.8 1.9 1.5 2.2-2.4 2.4-2.2-1.5-1.9.8-.5 2.6h-3.4l-.5-2.6-1.9-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.9L2 13.7v-3.4l2.6-.5.8-1.9-1.5-2.2 2.4-2.4 2.2 1.5 1.9-.8zM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" fill-rule="evenodd"/>',
  chat: '<path d="M4 4h16a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 17H9l-5 4v-4H4a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 4 4z"/>',
  book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H11v17H5.5A1.5 1.5 0 0 1 4 18.5zM13 3h5.5A1.5 1.5 0 0 1 20 4.5v14a1.5 1.5 0 0 1-1.5 1.5H13z"/>',
  chip: '<path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 3.2a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6z"/><path d="M10.6 2.1h2.8v3.3h-2.8zM10.6 18.6h2.8v3.3h-2.8zM2.1 10.6h3.3v2.8H2.1zM18.6 10.6h3.3v2.8h-3.3zM4.3 6.3l2-2 2.3 2.3-2 2zM15.4 17.4l2-2 2.3 2.3-2 2zM17.7 4.3l2 2-2.3 2.3-2-2zM6.6 15.4l2 2-2.3 2.3-2-2z"/><circle cx="12" cy="12" r="4.2"/>',
  search: '<path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.2 4.3-1.5 1.4-4.2-4.2A7.5 7.5 0 1 1 10.5 3zm0 2.2a5.3 5.3 0 1 0 0 10.6 5.3 5.3 0 0 0 0-10.6z"/>',
  home: '<path d="M12 3.2 2.8 11h2.7v9h5V14h3v6h5v-9h2.7z"/>',
  pin: '<path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7zm0 4.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z"/>',
  gem: '<path d="M7 3h10l4.5 5.5L12 21 2.5 8.5zm.9 2-2.4 3h4.1L11 5zm5.1 0 1.4 3h4.1l-2.4-3zM6 10l4.6 6.1L9 10zm9 0-1.6 6.1L18 10zm-3.9 0L12 15.2l1-5.2z"/>',
  crown: '<path d="M3 7.5l4.6 3.8L12 4.5l4.4 6.8L21 7.5l-1.8 11H4.8zM5 20h14v1.8H5z"/>',
  snow: '<path d="M11 2h2v8.3l7.2-4.1 1 1.7L14 12l7.2 4.1-1 1.7L13 13.7V22h-2v-8.3l-7.2 4.1-1-1.7L10 12 2.8 7.9l1-1.7L11 10.3z"/>',
  shield: '<path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5zm-1.2 14.2-3.9-3.9 1.5-1.5 2.4 2.4 5-5 1.5 1.5z"/>',
  gift: '<path d="M3 8h18v4H3zM4.5 13h6.5v8H4.5zM13 13h6.5v8H13zM12 7.5C10 4 7 3 6.2 4.5S7.5 7.8 12 7.5zm0 0C14 4 17 3 17.8 4.5S16.5 7.8 12 7.5z"/>',
};
export const g = (name, cls = '') => `<svg class="glyph ${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${glyphs[name] || ''}</svg>`;

// ---- playing cards -------------------------------------------------------------------------
const SUITS = ['♠', '♥', '♣', '♦'];
export function cardHTML(c, i = 0, { back = false, cls = '' } = {}) {
  if (back) return `<span class="pc back ${cls}" aria-label="Face-down card"></span>`;
  const s = SUITS[(c * 7 + i) % 4], red = s === '♥' || s === '♦', r = rank(c);
  const names = { '♠': 'spades', '♥': 'hearts', '♣': 'clubs', '♦': 'diamonds' };
  return `<span class="pc ${red ? 'red' : ''} ${cls}" style="--i:${i}" aria-label="${r === 'A' ? 'Ace' : r} of ${names[s]}"><b>${r}<i>${s}</i></b><em>${c >= 11 ? r : s}</em></span>`;
}

export function tableHTML({ dealer, cards, labels = true, holeCard = true }) {
  const d = dealer ? `<div class="hand dealer-hand"><div class="cards">${cardHTML(dealer, 0)}${holeCard ? cardHTML(0, 0, { back: true }) : ''}</div>${labels ? '<span class="hand-label">Dealer</span>' : ''}</div>` : '';
  const y = cards ? `<div class="hand you-hand">${labels ? '<span class="hand-label">You</span>' : ''}<div class="cards">${cards.map((c, i) => cardHTML(c, i + 1)).join('')}</div></div>` : '';
  return `<div class="felt-table bj-table${dealer ? ' has-dealer' : ''}">${dealer ? `<div class="dealer-ace" aria-hidden="true">${ace('happy', 'ace-dealer')}</div>` : ''}${d}${y}</div>`;
}

// ---- the 3D discard tray -------------------------------------------------------------------
// Scale: a card is 100 × 140 px (2.5 × 3.5 in); one deck of 52 cards stacks about 24 px high.
const DECK_PX = 24, CARD_W = 100, CARD_D = 140;

function box(w, h, d, cls) {
  const face = (name, fw, fh, tf) => `<div class="face ${name}" style="width:${fw}px;height:${fh}px;margin:${-fh / 2}px 0 0 ${-fw / 2}px;transform:${tf}"></div>`;
  return `<div class="box ${cls}" style="--w:${w}px;--h:${h}px;--d:${d}px">`
    + face('front', w, h, `translateZ(${d / 2}px)`) + face('back', w, h, `rotateY(180deg) translateZ(${d / 2}px)`)
    + face('right', d, h, `rotateY(90deg) translateZ(${w / 2}px)`) + face('left', d, h, `rotateY(-90deg) translateZ(${w / 2}px)`)
    + face('top', w, d, `rotateX(90deg) translateZ(${h / 2}px)`) + face('bottom', w, d, `rotateX(-90deg) translateZ(${h / 2}px)`) + '</div>';
}

/** Mount an interactive, rotatable 3D discard tray holding `decks` decks. Returns { destroy }. */
export function mountTray(el, { decks, shoe = 6, markers = false, reference = true }) {
  const trayH = shoe * DECK_PX + 14, stackH = Math.max(3, decks * DECK_PX);
  const markerLines = markers ? Array.from({ length: shoe - 1 }, (_, i) => `<div class="tray-mark" style="bottom:${(i + 1) * DECK_PX + 4}px"><span>${i + 1}</span></div>`).join('') : '';
  el.innerHTML = `<div class="tray3d" tabindex="0" role="img" aria-label="A discard tray for a ${shoe}-deck shoe. Drag, or use the arrow keys, to rotate it. Estimate how many decks it holds.">
    <div class="tray-scene"><div class="tray-rig">
      <div class="tray-floor"></div>
      <div class="obj" style="transform:translate3d(0,${-stackH / 2}px,0)">${box(CARD_W, stackH, CARD_D, 'stack')}</div>
      <div class="obj" style="transform:translate3d(0,${-trayH / 2}px,0)">${box(CARD_W + 18, trayH, CARD_D + 18, 'tray')}${markers ? `<div class="tray-marks" style="width:${CARD_W + 18}px;height:${trayH}px;margin:${-trayH / 2}px 0 0 ${-(CARD_W + 18) / 2}px;transform:translateZ(${-(CARD_D + 18) / 2 + 1}px)">${markerLines}</div>` : ''}</div>
      ${reference ? `<div class="obj" style="transform:translate3d(${CARD_W + 64}px,${-DECK_PX / 2}px,0)">${box(CARD_W, DECK_PX, CARD_D, 'stack ref')}</div><div class="obj ref-label" style="transform:translate3d(${CARD_W + 64}px,8px,${CARD_D / 2 + 4}px)">1 deck</div>` : ''}
    </div></div>
    <div class="tray-controls"><button type="button" class="icon-btn" data-rot="-1" aria-label="Rotate left">${g('rotl')}</button><span class="tray-hint">Drag to rotate</span><button type="button" class="icon-btn" data-rot="1" aria-label="Rotate right">${g('rotr')}</button></div>
  </div>`;
  const root = el.querySelector('.tray3d'), rig = el.querySelector('.tray-rig');
  let ry = -32, rx = -16, drag = null;
  const scene0 = el.querySelector('.tray-scene');
  const fit = () => Math.min(1, (scene0.clientWidth || 420) / 440, (scene0.clientHeight || 330) / (trayH + 150));
  const apply = () => { rig.style.transform = `translate(${reference ? -72 * fit() : 0}px, ${(trayH / 2 - 10) * fit()}px) scale(${fit()}) rotateX(${rx}deg) rotateY(${ry}deg)`; };
  const ro = new ResizeObserver(() => apply()); ro.observe(scene0);
  apply();
  const scene = el.querySelector('.tray-scene');
  scene.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, ry, rx }; scene.setPointerCapture(e.pointerId); root.classList.add('dragging'); });
  scene.addEventListener('pointermove', e => { if (!drag) return; ry = drag.ry + (e.clientX - drag.x) * .5; rx = Math.max(-75, Math.min(-8, drag.rx - (e.clientY - drag.y) * .4)); apply(); });
  const end = () => { drag = null; root.classList.remove('dragging'); };
  scene.addEventListener('pointerup', end); scene.addEventListener('pointercancel', end);
  el.querySelectorAll('[data-rot]').forEach(b => b.onclick = () => { ry += 30 * Number(b.dataset.rot); apply(); });
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') ry -= 15; else if (e.key === 'ArrowRight') ry += 15;
    else if (e.key === 'ArrowUp') rx = Math.max(-75, rx - 10); else if (e.key === 'ArrowDown') rx = Math.min(-8, rx + 10); else return;
    e.preventDefault(); apply();
  });
  return { root };
}

// ---- inputs -------------------------------------------------------------------------------
/** A big ± stepper in half-deck steps. */
export function mountStepper(el, { min = 0, max = 8, step = .5, value = null, label = 'decks', onChange }) {
  let v = value;
  el.innerHTML = `<div class="stepper" role="group" aria-label="${esc(label)}"><button type="button" class="step-btn" data-d="-1" aria-label="Less">−</button><output class="step-val" aria-live="polite">?</output><button type="button" class="step-btn" data-d="1" aria-label="More">+</button></div><p class="step-unit">${esc(label)}</p>`;
  const out = el.querySelector('output');
  const set = nv => { v = Math.max(min, Math.min(max, nv)); out.textContent = halves(v); Sound.play('tick'); onChange?.(v); };
  el.querySelectorAll('.step-btn').forEach(b => b.onclick = () => set(v === null ? (Number(b.dataset.d) > 0 ? min : max) : v + step * Number(b.dataset.d)));
  return { get value() { return v; }, set, key(e) { if (e.key === '+' || e.key === '=') { set(v === null ? min : v + step); return true; } if (e.key === '-' || e.key === '_') { set(v === null ? max : v - step); return true; } return false; } };
}

/** A signed whole-number answer box with a ± key, for counts. */
export function mountNumber(el, { label = 'Answer', onChange, placeholder = '?' }) {
  el.innerHTML = `<div class="num-entry"><button type="button" class="step-btn sign" aria-label="Switch plus or minus">±</button><input class="num-input" inputmode="numeric" autocomplete="off" aria-label="${esc(label)}" placeholder="${placeholder}" maxlength="4"></div>`;
  const input = el.querySelector('input');
  const read = () => { const s = input.value.replace(/[−–]/g, '-').trim(); return /^[+-]?\d{1,3}$/.test(s) ? Number(s) : null; };
  input.addEventListener('input', () => { input.value = input.value.replace(/[^\d+\-−]/g, ''); onChange?.(read()); });
  el.querySelector('.sign').onclick = () => { const s = input.value.replace(/[−–]/g, '-'); input.value = s.startsWith('-') ? s.slice(1) : '-' + s.replace(/^\+/, ''); onChange?.(read()); input.focus(); };
  setTimeout(() => input.focus({ preventScroll: true }), 30);
  return { get value() { return read(); }, input };
}

// ---- keep every question on one screen ----------------------------------------------------------
// Lesson and practice screens are exactly one viewport tall. When a question (title, table, and choices) is taller
// than the space above the footer, its content is zoomed down (to 60% at most) so the answers are never below the fold.
export function fitCoachScreens(root = document.getElementById('app')) {
  if (!root || typeof ResizeObserver === 'undefined') return;
  const watched = new WeakSet();
  let raf = 0;
  const fit = body => {
    const kids = [...body.children];
    if (!kids.length || body.classList.contains('fp-body')) return;
    kids.forEach(k => { k.style.zoom = ''; });
    const cs = getComputedStyle(body), pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const avail = body.clientHeight - pad, need = body.scrollHeight - pad;
    if (need <= avail + 1 || avail < 120) return;
    let z = Math.max(0.6, avail / need);
    kids.forEach(k => { k.style.zoom = z; });
    const again = body.scrollHeight - pad;   // text rewraps at a new zoom; correct once
    if (again > avail + 1 && z > 0.6) { z = Math.max(0.6, z * avail / again); kids.forEach(k => { k.style.zoom = z; }); }
  };
  const ro = new ResizeObserver(entries => entries.forEach(e => fit(e.target)));
  const scan = () => {
    raf = 0;
    document.querySelectorAll('.coach-screen .coach-body').forEach(b => { if (!watched.has(b)) { watched.add(b); ro.observe(b); } fit(b); });
  };
  new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(scan); }).observe(root, { childList: true, subtree: true });
  addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(scan); });
}
