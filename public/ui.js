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
};

export function ace(mood = 'happy', cls = '', skin = (typeof document !== 'undefined' && document.documentElement.dataset.coach) || 'none') {
  const K = '#1C1C1E';
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
  return `<svg class="ace ace-${mood} ${cls}" viewBox="0 0 100 124" role="img" aria-label="Ace, the Felt &amp; Fortune coach"><rect x="11" y="14" width="80" height="104" rx="16" fill="#C7C7CC"/><rect x="9" y="8" width="80" height="104" rx="16" fill="#fff" stroke="#D1D1D6" stroke-width="3"/><text x="19" y="31" font-family="ui-rounded,system-ui,sans-serif" font-weight="800" font-size="17" fill="#007AFF">A</text><path d="M24 34c-4 4-6 6-3 8 1.5 1 3 0 3-1 0 1 1.5 2 3 1 3-2 1-4-3-8z" fill="#007AFF"/>${brows}${eyes}<circle cx="27" cy="69" r="5.5" fill="#FF2D55" opacity=".22"/><circle cx="73" cy="69" r="5.5" fill="#FF2D55" opacity=".22"/>${mouth}<path d="M50 88c-6 6-9 9-4.5 12 2.2 1.4 4.5 0 4.5-1.5 0 1.5 2.3 2.9 4.5 1.5 4.5-3 1.5-6-4.5-12z" fill="#007AFF" opacity=".9"/>${COACH_SKINS[skin] || ''}</svg>`;
}

// ---- glyphs -------------------------------------------------------------------------------
const glyphs = {
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
  const d = dealer ? `<div class="hand"><span class="hand-label">${labels ? 'Dealer' : ''}</span><div class="cards">${cardHTML(dealer, 0)}${holeCard ? cardHTML(0, 0, { back: true }) : ''}</div></div>` : '';
  const y = cards ? `<div class="hand"><span class="hand-label">${labels ? 'You' : ''}</span><div class="cards">${cards.map((c, i) => cardHTML(c, i + 1)).join('')}</div></div>` : '';
  return `<div class="felt-table">${d}${y}</div>`;
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
