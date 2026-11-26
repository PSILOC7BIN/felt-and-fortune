// Concept screens: every "New idea" step is split into up to three short parts, each with an animation that shows
// exactly what that part says (segmenting + signaling: one idea per screen, words next to the picture they describe).
// Scenes are chosen from the words of each part, and use the step's own cards when it has them.
import { esc, cardHTML, ace, g, feltPrint } from './ui.js';
import * as bj from './bj.js';
import { illustrate } from './illustrate.js';

const RULES = [
  ['heat', /pit|heat|back ?off|cover|camouflag|surveil|ban/i],
  ['index', /index|deviat|illustrious|fab 4/i],
  ['truecount', /true count|decks? (left|remaining)|divide/i],
  ['tray', /tray|discard|penetrat|cut card/i],
  ['count', /hi.?lo|running count|count(ing)? (cards|card)|\+1|−1|-1 |tens and aces|high cards|low cards|rich in|small cards/i],
  ['bet', /bet spread|spread|ramp|units?|bankroll|kelly|wager/i],
  ['edge', /house edge|edge|%|percent|expected|in the long run/i],
  ['insurance', /insurance|even money/i],
  ['surrender', /surrender/i],
  ['split', /split|pair/i],
  ['double', /doubl/i],
  ['blackjack', /blackjack|natural|3:2|6:5|pays/i],
  ['dealer17', /17|dealer (must|draws|hits|stands)|soft 17|h17|s17/i],
  ['ace', /\bace\b|soft/i],
  ['bust', /bust|over 21/i],
  ['deal', /two cards|face (up|down)|hole card|upcard|each get|dealt/i],
  ['stiff', /stiff|weak (card|upcard)|strong (card|upcard)|bust card|12.{0,4}16|against a (7|8|9|10|ace)/i],
  ['chart', /chart|basic strategy|table of plays/i],
  ['compare', /beat|closer|push|tie|higher total/i],
  ['total', /total|add|value|worth|face cards?/i],
];

function pickScene(text, fallback) {
  for (const [name, re] of RULES) if (re.test(text)) return name;
  return fallback;
}

/** Split a teaching text into at most three parts of whole sentences. */
export function segments(text) {
  const s = text.split(/(?<=[.!?])\s+(?=[A-Z0-9“"‘(+$−-])/).map(x => x.trim()).filter(Boolean);
  if (s.length <= 1) return [text];
  const n = Math.min(3, s.length), per = Math.ceil(s.length / n), out = [];
  for (let i = 0; i < s.length; i += per) out.push(s.slice(i, i + per).join(' '));
  return out;
}

const c = (v, i, cls = '') => `<span class="sc-c" style="--i:${i}">${cardHTML(v, i, { cls })}</span>`;
const back = i => `<span class="sc-c" style="--i:${i}">${cardHTML(0, i, { back: true })}</span>`;
const felt = inner => `<div class="sc-felt">${feltPrint({ spots: false })}${inner}</div>`;

/** An animated scene. `step` may carry cards/dealer to use. */
export function scene(name, step = {}) {
  const you = step.cards && step.cards.length ? step.cards : [10, 6], up = step.dealer || 10;
  const t = bj.total(you).total;
  switch (name) {
    case 'total': {
      const cards = step.cards || [13, 4, 3];
      let run = 0; const steps = cards.map(v => { run += v === 1 ? 1 : Math.min(v, 10); return run; });
      return felt(`<div class="sc-row">${cards.map((v, i) => c(v, i)).join('')}</div><div class="sc-tick">${steps.map((v, i) => `<b style="--i:${i}">${v}</b>`).join('')}</div><p class="sc-cap">Face cards count 10 · aces 1 or 11</p>`);
    }
    case 'ace':
      return felt(`<div class="sc-row">${c(1, 0)}${c(6, 1)}</div><div class="sc-flip"><span class="a">Soft 17 <small>ace = 11</small></span><span class="b">or 7 <small>ace = 1</small></span></div><p class="sc-cap">An ace counts 11 unless that would bust you</p>`);
    case 'bust':
      return felt(`<div class="sc-row">${c(10, 0)}${c(6, 1)}${c(9, 2, 'sc-late')}</div><div class="sc-bust">25 · BUST</div><p class="sc-cap">Over 21 loses right away, even if the dealer busts later</p>`);
    case 'dealer17': {
      const d = [6, 5, 2, 4];
      return felt(`<div class="sc-who">Dealer</div><div class="sc-row">${d.map((v, i) => c(v, i)).join('')}</div><div class="sc-tick">${[6, 11, 13, 17].map((v, i) => `<b style="--i:${i}" class="${v >= 17 ? 'stop' : ''}">${v}${v >= 17 ? ' · stands' : ''}</b>`).join('')}</div><p class="sc-cap">The dealer has no choices: draw below 17, stand on 17 or more</p>`);
    }
    case 'blackjack':
      return felt(`<div class="sc-row sc-glow">${c(1, 0)}${c(13, 1)}</div><div class="sc-chips"><span class="chip-s" style="--i:0">$10</span><span class="sc-arrow">→</span><span class="chip-s gold" style="--i:2">+$15</span></div><p class="sc-cap">Ace + a 10-value card as your first two = blackjack, paid 3 to 2</p>`);
    case 'compare':
      return felt(`<div class="sc-vs"><div><small>Dealer</small><div class="sc-row">${c(10, 0)}${c(8, 1)}</div><b>18</b></div><div class="sc-vs-mid">vs</div><div class="win"><small>You</small><div class="sc-row">${c(10, 2)}${c(9, 3)}</div><b>19 wins</b></div></div><p class="sc-cap">Closer to 21 without going over wins. Same total is a push</p>`);
    case 'double':
      return felt(`<div class="sc-row">${c(5, 0)}${c(6, 1)}<span class="sc-c sc-side" style="--i:3">${cardHTML(13, 3)}</span></div><div class="sc-chips"><span class="chip-s" style="--i:0">$10</span><span class="chip-s" style="--i:2">+$10</span></div><p class="sc-cap">Double your bet, take exactly one more card</p>`);
    case 'split': {
      const p = step.cards && bj.isPair(step.cards) ? step.cards[0] : 8;
      return felt(`<div class="sc-split"><div class="l">${c(p, 0)}${c(3, 2, 'sc-late')}</div><div class="r">${c(p, 1)}${c(10, 3, 'sc-late')}</div></div><div class="sc-chips"><span class="chip-s">$10</span><span class="chip-s" style="--i:2">$10</span></div><p class="sc-cap">A pair becomes two hands, each with its own bet</p>`);
    }
    case 'surrender':
      return felt(`<div class="sc-row">${c(10, 0)}${c(6, 1)}</div><div class="sc-chips"><span class="chip-s half-out">$5 back</span><span class="chip-s lost">$5</span></div><p class="sc-cap">Give up the hand, keep half your bet</p>`);
    case 'insurance':
      return felt(`<div class="sc-who">Dealer</div><div class="sc-row">${c(1, 0)}${back(1)}</div><div class="sc-chips"><span class="chip-s">Insurance?</span></div><p class="sc-cap">A side bet that the hidden card is a 10. Usually a bad bet</p>`);
    case 'stiff':
      return felt(`<div class="sc-who">Dealer</div><div class="sc-row">${c(up, 0)}<span class="sc-c sc-ghost" style="--i:1">${cardHTML(10, 1)}</span></div><p class="sc-assume">Assume a 10 underneath → ${up === 1 ? 21 : Math.min(up, 10) + 10}</p><div class="sc-row">${you.map((v, i) => c(v, i + 2)).join('')}</div><p class="sc-cap">You: ${t}. ${up === 1 || up >= 7 ? 'Strong dealer card: you need to improve' : 'Weak dealer card: the dealer may bust'}</p>`);
    case 'chart': {
      const rows = ['12', '13', '14', '15', '16'], ups = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'A'];
      return `<div class="sc-chart">${rows.map((r, i) => `<div class="sc-cr"><b>${r}</b>${ups.map((u, j) => `<span class="${(j <= 4 && !(r === '12' && j < 2)) ? 's' : 'h'}" style="--i:${i * 10 + j}">${(j <= 4 && !(r === '12' && j < 2)) ? 'S' : 'H'}</span>`).join('')}</div>`).join('')}<p class="sc-cap">Find your hand on the left, the dealer’s card across the top</p></div>`;
    }
    case 'count': {
      const cards = [4, 13, 6, 8, 1, 3]; let rc = 0;
      return felt(`<div class="sc-row">${cards.map((v, i) => { const h = bj.hilo(v); rc += h; return `<span class="sc-c" style="--i:${i}">${cardHTML(v, i)}<em class="tag ${h > 0 ? 'p' : h < 0 ? 'm' : 'z'}">${h > 0 ? '+1' : h < 0 ? '−1' : '0'}</em></span>`; }).join('')}</div><div class="sc-rc">Running count <b>${bj.signed(rc)}</b></div><p class="sc-cap">2–6: +1 · 7–9: 0 · tens and aces: −1</p>`);
    }
    case 'truecount':
      return felt(`<div class="sc-div"><span class="n">+6</span><span class="op">÷</span><span class="d">3 decks left</span><span class="op">=</span><span class="r">+2</span></div><p class="sc-cap">True count = running count ÷ decks still to be dealt</p>`);
    case 'tray':
      return felt(`<div class="sc-tray"><div class="stack">${Array.from({ length: 6 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div><span>3 decks in the tray → 3 left in a 6-deck shoe</span></div><p class="sc-cap">Glance at the discard tray to know how much shoe is left</p>`);
    case 'bet':
      return felt(`<div class="sc-ramp">${[[0, 1], [1, 1], [2, 1], [3, 2], [4, 3], [5, 4]].map(([tc, u], i) => `<div style="--i:${i}"><span class="stack">${Array.from({ length: u }, () => '<i></i>').join('')}</span><small>TC ${tc}</small></div>`).join('')}</div><p class="sc-cap">Bet small when the count is low, more as it rises</p>`);
    case 'edge':
      return felt(`<div class="sc-dots">${Array.from({ length: 100 }, (_, i) => `<i class="${i < 51 ? 'h' : 'y'}" style="--i:${i}"></i>`).join('')}</div><div class="sc-dot-key"><span><i class="h"></i>House wins 51</span><span><i class="y"></i>You win 49</span></div><p class="sc-cap">Out of every 100 decided hands, a small edge adds up over thousands</p>`);
    case 'index':
      return felt(`<div class="sc-meter"><div class="bar"><i></i><b class="mark">index 0</b></div><div class="sc-flip"><span class="a">Below: hit 16</span><span class="b">At or above: stand</span></div></div><p class="sc-cap">When the true count crosses a hand’s index, the right play changes</p>`);
    case 'heat':
      return felt(`<div class="sc-heat">${g('target')}<div class="meter"><i></i></div><span>Big jumps in your bets draw attention</span></div><p class="sc-cap">Look like a normal player: change bets gradually</p>`);
    default: // deal
      return felt(`<div class="sc-who">Dealer</div><div class="sc-row">${c(up, 1)}${back(3)}</div><div class="sc-row">${you.map((v, i) => c(v, i * 2)).join('')}</div><p class="sc-cap">You and the dealer get two cards; one dealer card is face down</p>`);
  }
}

/** The parts of a teaching step, each with a scene. */
export function conceptParts(step) {
  // Each part's animation is built from that part's own words: exactly what it says, nothing more. When a part has
  // several sentences that each have something to show, they play one after another, in step with the text.
  return segments(step.text || '').map(text => {
    const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z0-9“"‘(+$−-])/).filter(Boolean);
    const each = sentences.map(x => illustrate(x));
    if (sentences.length > 1 && each.filter(Boolean).length > 1) return { text, sentences, seq: each };
    return { text, sentences: [text], html: illustrate(text) };
  });
}

/** Render part `i` of a step into `el`. */
export function renderPart(el, step, parts, i, chartHTMLFn) {
  const p = parts[i];
  clearTimeout(el._seqTimer);
  const pic = p.seq ? `<div class="sc-seq">${p.seq.map((h, k) => `<div class="sc-step" data-k="${k}" ${k ? 'hidden' : ''}>${h || ''}</div>`).join('')}</div>` : p.html;
  const words = p.seq ? p.sentences.map((x, k) => `<span class="sc-sent" data-k="${k}">${esc(x)}</span>`).join(' ') : esc(p.text);
  el.innerHTML = `<div class="q teach concept"><div class="concept-top"><span class="pill">New idea</span><span class="concept-dots">${parts.map((_, k) => `<i class="${k === i ? 'on' : k < i ? 'done' : ''}"></i>`).join('')}</span></div><h1 class="q-title">${esc(step.title)}</h1>
    ${pic ? `<div class="concept-scene" aria-hidden="true">${pic}<button type="button" class="sc-replay" aria-label="Replay the animation">${g('rotl')}</button></div>` : ''}<p class="teach-text concept-text">${words}</p>${i === parts.length - 1 && step.tip ? `<p class="teach-tip">${g('star')}<span>${esc(step.tip)}</span></p>` : ''}${i === parts.length - 1 && step.chart && chartHTMLFn ? chartHTMLFn(step.chart) : ''}</div>`;
  if (p.seq) runSeq(el, p);
}

// Show each sentence's picture in turn (sentences with nothing to draw keep the previous picture), highlighting
// that sentence in the text. Ends on the last picture.
function runSeq(el, p) {
  clearTimeout(el._seqTimer);
  let k = 0;
  const show = () => {
    let pic = k; while (pic > 0 && !p.seq[pic]) pic--;
    el.querySelectorAll('.sc-step').forEach(s => { const on = Number(s.dataset.k) === pic; s.hidden = !on; if (on && !s.dataset.shown) { s.dataset.shown = '1'; } });
    el.querySelectorAll('.sc-sent').forEach(s => s.classList.toggle('on', Number(s.dataset.k) === k));
    if (k < p.sentences.length - 1) el._seqTimer = setTimeout(() => { k++; const st = el.querySelector(`.sc-step[data-k="${k}"]`); if (st && p.seq[k]) st.innerHTML = p.seq[k]; show(); }, 3600);
  };
  show();
}

/** Wire the replay button: re-inserting the scene restarts its animation. */
export function wireReplay(el, step, parts, i) {
  const b = el.querySelector('.sc-replay'); if (!b) return;
  b.onclick = () => { const p = parts[i]; if (p.seq) { renderPart(el, step, parts, i); wireReplay(el, step, parts, i); return; } const box = el.querySelector('.concept-scene'); const keep = b; box.innerHTML = p.html; box.append(keep); };
}
