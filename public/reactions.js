// Answer reactions: Ace pops in with a random pose and line, plus one of several random effects.
// Correct answers celebrate; misses get a kind, varied reaction. Streaks of 3, 5, and 10 get bigger moments.
// Setting (Profile): full | subtle (Ace only) | off. Reduced-motion users get subtle.
import { ace, Sound } from './ui.js';

const PRAISE = ['Nailed it!', 'That’s the play!', 'Textbook!', 'Sharp!', 'Smooth move!', 'Perfect read!', 'Dealer’s worst nightmare!', 'Clean!', 'Money move!', 'Exactly right!', 'You’re dialed in!', 'Like a pro!'];
const COMFORT = ['Close one!', 'Shake it off.', 'Now you know.', 'Every pro missed that once.', 'Next hand’s yours.', 'Good try. Look at why.', 'That one’s sneaky.', 'Learning moment!'];
const STREAK = { 3: 'Three in a row!', 5: 'Five straight!', 10: 'Ten in a row. Unreal!', 15: 'Fifteen! You’re on fire!', 20: 'Twenty! Legendary!' };

const WIN_POSES = [['cheer', 'jump'], ['wow', 'spin'], ['wink', 'bounce'], ['love', 'dance'], ['cool', 'slide'], ['happy', 'flip']];
const LOSE_POSES = [['oops', 'shake'], ['sad', 'slump'], ['shock', 'jolt'], ['think', 'tilt']];
const WIN_FX = ['confetti', 'stars', 'chips', 'cards', 'fireworks', 'sparkle'];

const pick = (arr, avoid) => { let x; do { x = arr[Math.random() * arr.length | 0]; } while (arr.length > 1 && x === avoid); return x; };
let lastFx = null, lastPose = null, hideTimer = 0;

export const celebrateLevel = () => {
  const v = localStorage.getItem('ff-celebrate') || 'full';
  return v === 'full' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'subtle' : v;
};
export const setCelebrateLevel = v => localStorage.setItem('ff-celebrate', v);

// ---- particles ----------------------------------------------------------------------------------
const COLORS = ['#34C759', '#0A84FF', '#FF9F0A', '#FF375F', '#BF5AF2', '#FFD60A', '#64D2FF'];
function particles(kind, origin) {
  const cv = document.createElement('canvas'); cv.className = 'confetti'; cv.setAttribute('aria-hidden', 'true');
  document.body.append(cv);
  const dpr = devicePixelRatio || 1, W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr, x = cv.getContext('2d');
  const ox = (origin?.x ?? innerWidth / 2) * dpr, oy = (origin?.y ?? innerHeight * .45) * dpr;
  const R = (a, b) => a + Math.random() * (b - a);
  let bits = [], life = 110, gravity = .35;
  const add = (n, f) => { for (let i = 0; i < n; i++) bits.push(f(i)); };
  if (kind === 'confetti') add(110, () => ({ x: ox + R(-60, 60) * dpr, y: oy, vx: R(-11, 11) * dpr, vy: R(-15, -5) * dpr, s: R(4, 8) * dpr, c: pick(COLORS), a: R(0, 6), va: R(-.3, .3), shape: 'rect' }));
  if (kind === 'stars') add(26, i => { const ang = i / 26 * Math.PI * 2; const sp = R(6, 12) * dpr; return { x: ox, y: oy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 3 * dpr, s: R(7, 13) * dpr, c: pick(['#FFD60A', '#FFB800', '#FFF3B0']), a: 0, va: R(-.2, .2), shape: 'star', drag: .93 }; });
  if (kind === 'chips') { gravity = .5; add(34, () => ({ x: R(0, W), y: R(-H * .4, -20 * dpr), vx: R(-1, 1) * dpr, vy: R(2, 7) * dpr, s: R(10, 16) * dpr, c: pick(['#E53935', '#1E88E5', '#43A047', '#212121', '#8E24AA']), a: R(0, 6), va: R(-.15, .15), shape: 'chip' })); life = 130; }
  if (kind === 'cards') add(16, i => ({ x: ox, y: oy, vx: (i - 7.5) * 1.3 * dpr, vy: R(-16, -10) * dpr, s: 14 * dpr, c: '#fff', a: (i - 7.5) * .08, va: (i - 7.5) * .012, shape: 'card', suit: '♠♥♦♣'[i % 4] }));
  if (kind === 'fireworks') { gravity = .12; [[.3, .3], [.7, .25], [.5, .18]].forEach(([fx, fy], k) => { const c = pick(COLORS); add(40, i => { const ang = i / 40 * Math.PI * 2, sp = R(3, 7) * dpr; return { x: W * fx, y: H * fy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, s: 3 * dpr, c, a: 0, va: 0, shape: 'dot', drag: .95, delay: k * 14 }; }); }); life = 120; }
  if (kind === 'sparkle') { gravity = 0; add(30, () => { const ang = R(0, Math.PI * 2), r = R(30, 140) * dpr; return { x: ox + Math.cos(ang) * r, y: oy + Math.sin(ang) * r * .6, vx: 0, vy: R(-1.2, -.2) * dpr, s: R(5, 11) * dpr, c: pick(['#fff', '#FFE58A', '#BDE0FE']), a: 0, va: .05, shape: 'twinkle', delay: R(0, 30) | 0 }; }); life = 90; }
  let t = 0;
  (function frame() {
    x.clearRect(0, 0, W, H); t++;
    for (const b of bits) {
      if (b.delay && t < b.delay) continue;
      b.vy += gravity * dpr; if (b.drag) { b.vx *= b.drag; b.vy *= b.drag; }
      b.x += b.vx; b.y += b.vy; b.a += b.va;
      const fade = Math.max(0, 1 - t / life);
      x.save(); x.translate(b.x, b.y); x.rotate(b.a); x.globalAlpha = b.shape === 'twinkle' ? fade * Math.abs(Math.sin(t / 6 + b.s)) : fade; x.fillStyle = b.c;
      if (b.shape === 'rect') x.fillRect(-b.s, -b.s / 2, b.s * 2, b.s);
      else if (b.shape === 'dot') { x.beginPath(); x.arc(0, 0, b.s, 0, 7); x.fill(); }
      else if (b.shape === 'star' || b.shape === 'twinkle') { x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? b.s * .42 : b.s, an = i * Math.PI / 5 - Math.PI / 2; x.lineTo(Math.cos(an) * r, Math.sin(an) * r); } x.closePath(); x.fill(); }
      else if (b.shape === 'chip') { x.scale(1, .55); x.beginPath(); x.arc(0, 0, b.s, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = b.s * .22; x.setLineDash([b.s * .5, b.s * .5]); x.beginPath(); x.arc(0, 0, b.s * .78, 0, 7); x.stroke(); }
      else if (b.shape === 'card') { x.fillStyle = '#fff'; x.strokeStyle = '#D1D1D6'; x.lineWidth = dpr; x.beginPath(); x.roundRect(-b.s, -b.s * 1.4, b.s * 2, b.s * 2.8, 4 * dpr); x.fill(); x.stroke(); x.fillStyle = '♥♦'.includes(b.suit) ? '#E53935' : '#1C1C1E'; x.font = `${b.s * 1.3}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(b.suit, 0, 0); }
      x.restore();
    }
    if (t < life) requestAnimationFrame(frame); else cv.remove();
  })();
}

// ---- Ace pop-in -----------------------------------------------------------------------------------
function coach(mood, move, line, ok) {
  let host = document.getElementById('ace-react');
  if (!host) { host = document.createElement('div'); host.id = 'ace-react'; host.setAttribute('aria-live', 'polite'); document.body.append(host); }
  clearTimeout(hideTimer);
  host.className = `ace-react ${ok ? 'win' : 'lose'} m-${move}`;
  host.innerHTML = `<div class="ace-bubble">${line}</div><div class="ace-body">${ace(mood, 'ace-md')}</div>`;
  void host.offsetWidth; host.classList.add('show');
  hideTimer = setTimeout(() => host.classList.remove('show'), ok ? 1900 : 2300);
}

/** React to an answer. streak = correct answers in a row so far (including this one). */
export function react(ok, { streak = 0, anchor = null, line = null } = {}) {
  const level = celebrateLevel();
  if (level === 'off') return;
  const rect = anchor?.getBoundingClientRect?.();
  const origin = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
  if (ok) {
    const big = STREAK[streak];
    let pose = pick(WIN_POSES, lastPose); lastPose = pose;
    coach(big || line ? 'cheer' : pose[0], big || line ? 'jump' : pose[1], line || big || pick(PRAISE), true);
    if (level === 'full') {
      const fx = big ? (streak >= 10 ? 'fireworks' : 'confetti') : pick(WIN_FX, lastFx); lastFx = fx;
      particles(fx, origin);
      if (fx === 'chips') Sound.play('chips');
      if (big) setTimeout(() => Sound.play('streak'), 180);
    }
  } else {
    const pose = pick(LOSE_POSES, lastPose); lastPose = pose;
    coach(pose[0], pose[1], pick(COMFORT), false);
    if (level === 'full' && anchor) { anchor.classList.remove('miss-shake'); void anchor.offsetWidth; anchor.classList.add('miss-shake'); }
  }
}
