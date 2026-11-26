// "Why?" walkthrough: Ace steps off his dealer spot and walks around the same table you just played, stopping at
// your cards, his upcard, and the play buttons, explaining one short step at a time. Nothing else on the page changes.
import { $, $$, ace, Sound } from './ui.js';
import { walkSteps } from './explain.js';

export function walkthrough(body, { cards, dealer, rules = {}, given = null }, onEnd) {
  stopWalkthrough(body);
  const steps = walkSteps(cards, dealer, rules, given);
  const table = body.querySelector('.bj-table'), seat = table?.querySelector('.dealer-ace');
  if (!table || !steps.length) return null;
  const guide = document.createElement('div');
  guide.className = 'guide no-fit';
  guide.innerHTML = `<span class="guide-point" aria-hidden="true"></span><div class="guide-ace">${ace('think', 'ace-guide')}</div><div class="guide-bubble" role="dialog" aria-live="polite" aria-label="Ace explains"><p></p><div class="guide-nav"><button type="button" class="g-back">Back</button><span class="g-count"></span><button type="button" class="g-next primary">Next</button></div></div>`;
  const host = body.closest('.coach-screen') || body;   // the whole screen, so Ace can stand beside the table
  host.append(guide);
  if (seat) seat.style.visibility = 'hidden';
  let i = 0, lit = null;
  const target = at => at === 'you' ? body.querySelector('.you-hand .cards') : at === 'dealer' ? body.querySelector('.dealer-hand .pc') : body.querySelector(`.action-row [data-act="${at.slice(4)}"]`) || body.querySelector('.action-row');
  const place = el => {
    // Stand beside the table, level with the thing being explained, so the cards and buttons stay visible.
    const b = host.getBoundingClientRect(), r = el.getBoundingClientRect(), tb = table.getBoundingClientRect();
    const w = guide.offsetWidth, h = guide.offsetHeight;
    const right = tb.right + 14 + w <= b.right - 8, left = tb.left - 14 - w >= b.left + 8;
    let x, y;
    if (right || left) { x = (right ? tb.right + 14 : tb.left - 14 - w) - b.left; y = r.top + r.height / 2 - h / 2 - b.top; }
    else { x = (b.width - w) / 2; y = r.bottom + 10 - b.top; if (y + h > b.height - 8) y = r.top - h - 10 - b.top; }   // narrow screens
    y = Math.max(8, Math.min(b.height - h - 8, y));
    guide.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    guide.classList.toggle('flip', !right && left);
    // A small pointer from Ace toward the thing.
    const pt = guide.querySelector('.guide-point'); if (pt) pt.style.top = `${Math.max(14, Math.min(h - 14, r.top + r.height / 2 - b.top - y))}px`;
  };
  const show = () => {
    const s = steps[i], el = target(s.at);
    lit?.classList.remove('guide-lit'); lit = el; el?.classList.add('guide-lit');
    if (el) place(el);
    guide.querySelector('p').textContent = s.text;
    guide.querySelector('.g-count').textContent = `${i + 1} of ${steps.length}`;
    guide.querySelector('.g-back').disabled = i === 0;
    guide.querySelector('.g-next').textContent = i === steps.length - 1 ? 'Got it' : 'Next';
    guide.querySelector('.guide-ace').innerHTML = ace(i === steps.length - 1 ? 'happy' : 'think', 'ace-guide');
    Sound.play('tap');
  };
  const end = () => { stopWalkthrough(body); onEnd?.(); };
  guide.querySelector('.g-next').onclick = () => { if (i < steps.length - 1) { i++; show(); } else end(); };
  guide.querySelector('.g-back').onclick = () => { if (i > 0) { i--; show(); } };
  const key = e => { if (e.key === 'ArrowRight') { e.preventDefault(); guide.querySelector('.g-next').click(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); guide.querySelector('.g-back').click(); } else if (e.key === 'Escape') end(); };
  document.addEventListener('keydown', key);
  guide._cleanup = () => { document.removeEventListener('keydown', key); lit?.classList.remove('guide-lit'); if (seat) seat.style.visibility = ''; };
  // Start on the dealer's spot, then walk to the first stop.
  if (seat) { const b = host.getBoundingClientRect(), r = seat.getBoundingClientRect(); guide.style.transition = 'none'; guide.style.transform = `translate(${Math.round(r.left - b.left)}px, ${Math.round(r.top - b.top)}px)`; void guide.offsetWidth; guide.style.transition = ''; }
  requestAnimationFrame(show);
  return guide;
}

export function stopWalkthrough(body) {
  $$('.guide', body.closest('.coach-screen') || body).forEach(g => { g._cleanup?.(); g.remove(); });
}
