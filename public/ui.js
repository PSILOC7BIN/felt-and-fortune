// Shared look-and-feel pieces: sounds, the Ace mascot, glyphs, cards, the 3D discard tray, and inputs.
import { rank, halves } from './bj.js';

export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---- sound: small synthesized cues (Web Audio), no audio files -------------------------------
export const Sound = (() => {
  let ac = null, on = localStorage.getItem('ff-sound') !== 'off';
  function audio() {
    if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ac = new C(); }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, start, dur, { type = 'sine', gain = .16, slide = 0 } = {}) {
    const a = audio(); if (!a) return;
    const t = a.currentTime + start, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .03);
  }
  const fx = {
    tap: () => tone(660, 0, .05, { gain: .06 }),
    select: () => tone(523, 0, .09, { type: 'triangle', gain: .1, slide: 1.2 }),
    deal: () => tone(1400, 0, .035, { type: 'square', gain: .025, slide: .6 }),
    correct: () => { tone(784, 0, .12, { type: 'triangle' }); tone(1175, .09, .24, { type: 'triangle' }); },
    wrong: () => { tone(330, 0, .14, { type: 'sawtooth', gain: .05 }); tone(247, .12, .28, { type: 'sawtooth', gain: .05 }); },
    complete: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .11, i === 3 ? .55 : .16, { type: 'triangle', gain: .14 })),
    reveal: () => [659, 988, 1319].forEach((f, i) => tone(f, i * .07, .22, { gain: .07 })),
    tick: () => tone(880, 0, .03, { gain: .04 }),
    coin: () => { tone(1319, 0, .07, { type: 'square', gain: .05 }); tone(1976, .06, .22, { type: 'square', gain: .05 }); },
    energy: () => [440, 554, 659, 880].forEach((f, i) => tone(f, i * .05, .14, { type: 'sawtooth', gain: .035, slide: 1.05 })),
    freeze: () => [1568, 1319, 1760, 2093].forEach((f, i) => tone(f, i * .06, .3, { gain: .05 })),
    unlock: () => { tone(392, 0, .1, { type: 'triangle', gain: .12 }); tone(784, .08, .3, { type: 'triangle', gain: .12, slide: 1.5 }); },
    levelup: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * .08, i === 5 ? .7 : .18, { type: 'triangle', gain: .12 })),
    whoosh: () => tone(200, 0, .25, { type: 'sawtooth', gain: .03, slide: 4 }),
    pop: () => tone(600, 0, .06, { gain: .1, slide: 2 }),
  };
  return {
    play(name) { window.ffHaptic?.(name); if (on && fx[name]) { try { fx[name](); } catch { /* audio unavailable */ } } },
    get on() { return on; },
    toggle() { on = !on; localStorage.setItem('ff-sound', on ? 'on' : 'off'); if (on) fx.tap(); return on; },
  };
})();

// ---- Ace, the mascot: an original playing-card character -----------------------------------
export function ace(mood = 'happy', cls = '') {
  const eyes = mood === 'wow'
    ? '<path d="M31 57q7-9 14 0M55 57q7-9 14 0" stroke="#1C1C1E" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
    : '<circle cx="38" cy="56" r="7" fill="#1C1C1E"/><circle cx="62" cy="56" r="7" fill="#1C1C1E"/><circle cx="40.5" cy="53.5" r="2.4" fill="#fff"/><circle cx="64.5" cy="53.5" r="2.4" fill="#fff"/>';
  const mouth = {
    happy: '<path d="M41 71q9 9 18 0" stroke="#1C1C1E" stroke-width="4" fill="none" stroke-linecap="round"/>',
    wow: '<path d="M39 68q11 17 22 0z" fill="#FF3B30" stroke="#1C1C1E" stroke-width="3.5" stroke-linejoin="round"/>',
    oops: '<path d="M42 77q8-7 16 0" stroke="#1C1C1E" stroke-width="4" fill="none" stroke-linecap="round"/>',
    think: '<path d="M43 74h14" stroke="#1C1C1E" stroke-width="4" stroke-linecap="round"/>',
  }[mood] || '';
  const brows = mood === 'oops' ? '<path d="M30 44l12 4M70 44l-12 4" stroke="#1C1C1E" stroke-width="3.5" stroke-linecap="round"/>' : mood === 'think' ? '<path d="M31 45q7-4 14 0" stroke="#1C1C1E" stroke-width="3.5" fill="none" stroke-linecap="round"/>' : '';
  return `<svg class="ace ace-${mood} ${cls}" viewBox="0 0 100 124" role="img" aria-label="Ace, the Felt &amp; Fortune coach"><rect x="11" y="14" width="80" height="104" rx="16" fill="#C7C7CC"/><rect x="9" y="8" width="80" height="104" rx="16" fill="#fff" stroke="#D1D1D6" stroke-width="3"/><text x="19" y="31" font-family="ui-rounded,system-ui,sans-serif" font-weight="800" font-size="17" fill="#007AFF">A</text><path d="M24 34c-4 4-6 6-3 8 1.5 1 3 0 3-1 0 1 1.5 2 3 1 3-2 1-4-3-8z" fill="#007AFF"/>${brows}${eyes}<circle cx="27" cy="69" r="5.5" fill="#FF2D55" opacity=".22"/><circle cx="73" cy="69" r="5.5" fill="#FF2D55" opacity=".22"/>${mouth}<path d="M50 88c-6 6-9 9-4.5 12 2.2 1.4 4.5 0 4.5-1.5 0 1.5 2.3 2.9 4.5 1.5 4.5-3 1.5-6-4.5-12z" fill="#007AFF" opacity=".9"/></svg>`;
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
  search: '<path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.2 4.3-1.5 1.4-4.2-4.2A7.5 7.5 0 1 1 10.5 3zm0 2.2a5.3 5.3 0 1 0 0 10.6 5.3 5.3 0 0 0 0-10.6z"/>',
  home: '<path d="M12 3.2 2.8 11h2.7v9h5V14h3v6h5v-9h2.7z"/>',
  pin: '<path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7zm0 4.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z"/>',
  gem: '<path d="M7 3h10l4.5 5.5L12 21 2.5 8.5zm.9 2-2.4 3h4.1L11 5zm5.1 0 1.4 3h4.1l-2.4-3zM6 10l4.6 6.1L9 10zm9 0-1.6 6.1L18 10zm-3.9 0L12 15.2l1-5.2z"/>',
  crown: '<path d="M3 7.5l4.6 3.8L12 4.5l4.4 6.8L21 7.5l-1.8 11H4.8zM5 20h14v1.8H5z"/>',
  lock: '<path d="M12 2.5a5 5 0 0 1 5 5V10h1.5A1.5 1.5 0 0 1 20 11.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20.5v-9A1.5 1.5 0 0 1 5.5 10H7V7.5a5 5 0 0 1 5-5zm0 2.2a2.8 2.8 0 0 0-2.8 2.8V10h5.6V7.5A2.8 2.8 0 0 0 12 4.7z"/>',
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
