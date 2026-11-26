// Expected value of each play, for the "Why?" panel, Hand Review, and the weakness map.
// Infinite-deck model with a US dealer who peeks for blackjack: close to the real 4–8 deck numbers. Values are in
// bets (+0.12 = win 12% of your bet on average). Split: two hands, double after split if allowed, no resplit, one
// card to split aces.
import { total, isPair, basic, ACTIONS } from './bj.js';

const P = v => (v === 10 ? 4 / 13 : 1 / 13);
const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const add = (t, soft, v) => {
  let hard = soft ? t - 10 : t; hard += v;
  const s = (soft || v === 1) && hard + 10 <= 21;
  return [s ? hard + 10 : hard, s];
};

// Dealer's final total distribution (17–21, 22 = bust) from an upcard, given no dealer blackjack.
const dealerCache = new Map();
function dealer(up, h17) {
  const key = up + (h17 ? 'h' : 's');
  if (dealerCache.has(key)) return dealerCache.get(key);
  const out = { 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0 };
  const walk = (t, soft, p, cards) => {
    if (t > 21) { out[22] += p; return; }
    if (t > 17 || (t === 17 && !(soft && h17))) { out[t] += p; return; }
    for (const v of VALUES) {
      if (cards === 1 && ((up === 1 && v === 10) || (up === 10 && v === 1))) continue;   // peeked: no blackjack
      const norm = cards === 1 ? (up === 1 ? 9 / 13 : up === 10 ? 12 / 13 : 1) : 1;
      const [nt, ns] = add(t, soft, v);
      walk(nt, ns, p * P(v) / norm, cards + 1);
    }
  };
  walk(up === 1 ? 11 : up, up === 1, 1, 1);
  dealerCache.set(key, out);
  return out;
}

export function actionEVs(cards, up, rules = {}) {
  up = Math.min(up, 10);
  const { h17 = false, das = true, surrender = false } = rules;
  const d = dealer(up, h17);
  const stand = t => (t > 21 ? -1 : Object.entries(d).reduce((a, [dt, p]) => a + p * (dt == 22 || t > dt ? 1 : t < dt ? -1 : 0), 0));
  const memo = new Map();
  const best = (t, soft) => {   // best of hit/stand from here, without doubling
    if (t > 21) return -1;
    const k = t + (soft ? 's' : 'h'); if (memo.has(k)) return memo.get(k);
    let h = 0; for (const v of VALUES) { const [nt, ns] = add(t, soft, v); h += P(v) * best(nt, ns); }
    const r = Math.max(stand(t), h); memo.set(k, r); return r;
  };
  const hit = (t, soft) => VALUES.reduce((a, v) => { const [nt, ns] = add(t, soft, v); return a + P(v) * best(nt, ns); }, 0);
  const dbl = (t, soft) => 2 * VALUES.reduce((a, v) => { const [nt] = add(t, soft, v); return a + P(v) * stand(nt); }, 0);
  const { total: t, soft } = total(cards);
  const ev = { H: hit(t, soft), S: stand(t) };
  if (cards.length === 2) ev.D = dbl(t, soft);
  if (isPair(cards)) {
    const c = Math.min(cards[0], 10);
    let one = 0;
    for (const v of VALUES) {
      const [nt, ns] = add(c === 1 ? 11 : c, c === 1, v);
      one += P(v) * (c === 1 ? stand(nt) : Math.max(stand(nt), hit(nt, ns), das ? dbl(nt, ns) : -Infinity));
    }
    ev.P = 2 * one;
  }
  if (surrender && cards.length === 2) ev.R = -0.5;
  return ev;
}

/** The chart's play, every option's value, and what a given play costs (in % of the bet). */
export function explainPlay(cards, up, rules = {}, given = null) {
  const ev = actionEVs(cards, up, rules);
  const answer = basic(cards, up, rules);
  const right = ev[answer] ?? Math.max(...Object.values(ev));
  const cost = given && ev[given] !== undefined ? Math.max(0, right - ev[given]) : 0;
  const sorted = Object.entries(ev).sort((a, b) => b[1] - a[1]);
  const close = sorted.length > 1 && sorted[0][1] - sorted[1][1] < 0.01;
  return { ev, answer, cost, close };
}

const pct = v => `${v >= 0 ? '+' : '−'}${Math.abs(v * 100).toFixed(1)}%`;

/** A compact panel: one bar per option, the chart's play marked, and the cost of the pick. */
export function whyHTML(cards, up, rules = {}, given = null) {
  const { ev, answer, cost, close } = explainPlay(cards, up, rules, given);
  const vals = Object.values(ev), lo = Math.min(-1, ...vals), hi = Math.max(0.5, ...vals);
  const x = v => ((v - lo) / (hi - lo)) * 100, zero = x(0);
  const rows = Object.entries(ev).sort((a, b) => b[1] - a[1]).map(([a, v]) => {
    const l = Math.min(zero, x(v)), w = Math.abs(x(v) - zero);
    return `<li class="${a === answer ? 'best' : ''}${a === given && a !== answer ? ' picked' : ''}"><span class="why-act">${ACTIONS[a]}${a === answer ? ' ✓' : ''}</span><span class="why-bar"><i style="left:${l}%;width:${Math.max(1, w)}%"></i><b style="left:${zero}%"></b></span><span class="why-val">${pct(v)}</span></li>`;
  }).join('');
  const verdict = given && given !== answer
    ? (cost >= 0.0005 ? `${ACTIONS[given]} gives up about <b>${(cost * 100).toFixed(1)}% of your bet</b> every time this hand comes up.` : `${ACTIONS[given]} and ${ACTIONS[answer]} are almost exactly equal here; the chart picks ${ACTIONS[answer].toLowerCase()} by a hair.`)
    : close ? 'A close call: the top two plays are within 1% of each other.' : `${ACTIONS[answer]} is clearly best here.`;
  return `<div class="why-panel"><p class="why-head">Average result per bet for each play</p><ul class="why-list">${rows}</ul><p class="why-note">${verdict}</p></div>`;
}

// ---- Win / push / lose chances for each play, for plain-language explanations ----------------------------
/** Dealer's chance of busting (and each final total) from an upcard, given no dealer blackjack. */
export function dealerOutcomes(up, h17 = false) { return dealer(Math.min(up, 10), h17); }

/** For Stand, Hit (then best play), and Double: chance to win, push, and lose, out of 1. Surrender: lose half, always. */
export function outcomeChances(cards, up, rules = {}) {
  up = Math.min(up, 10);
  const { h17 = false, surrender = false } = rules;
  const d = dealer(up, h17);
  const vsDealer = t => {
    if (t > 21) return { w: 0, p: 0, l: 1 };
    let w = d[22], p = 0, l = 0;
    for (let dt = 17; dt <= 21; dt++) { if (t > dt) w += d[dt]; else if (t === dt) p += d[dt]; else l += d[dt]; }
    return { w, p, l };
  };
  const ev = t => { const o = vsDealer(t); return o.w - o.l; };
  const memo = new Map();
  // Final total distribution when you keep playing the better of hit/stand from here.
  const play = (t, soft) => {
    if (t > 21) return new Map([[22, 1]]);
    const k = t + (soft ? 's' : 'h'); if (memo.has(k)) return memo.get(k);
    const hit = new Map();
    for (const v of VALUES) { const [nt, ns] = add(t, soft, v); for (const [ft, p] of play(nt, ns)) hit.set(ft, (hit.get(ft) || 0) + P(v) * p); }
    const evHit = [...hit].reduce((a, [ft, p]) => a + p * ev(ft), 0);
    const r = ev(t) >= evHit ? new Map([[t, 1]]) : hit; memo.set(k, r); return r;
  };
  const sum = dist => { const o = { w: 0, p: 0, l: 0 }; for (const [ft, p] of dist) { const x = vsDealer(ft); o.w += p * x.w; o.p += p * x.p; o.l += p * x.l; } return o; };
  const { total: t, soft } = total(cards);
  const hitDist = new Map(), dblDist = new Map();
  for (const v of VALUES) {
    const [nt, ns] = add(t, soft, v);
    for (const [ft, p] of play(nt, ns)) hitDist.set(ft, (hitDist.get(ft) || 0) + P(v) * p);
    dblDist.set(nt > 21 ? 22 : nt, (dblDist.get(nt > 21 ? 22 : nt) || 0) + P(v));
  }
  const out = { S: vsDealer(t), H: sum(hitDist) };
  if (cards.length === 2) out.D = sum(dblDist);
  if (surrender && cards.length === 2) out.R = { w: 0, p: 0, l: 1, half: true };
  // Chance the very next card busts you, and the dealer's bust chance.
  out.bustNext = soft ? 0 : VALUES.reduce((a, v) => a + (t + v > 21 ? P(v) : 0), 0);
  out.dealerBust = d[22];
  return out;
}
