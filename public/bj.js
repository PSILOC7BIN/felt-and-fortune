// Blackjack math shared by every trainer and lesson. It mirrors engine.py exactly;
// tests/test_js_engine.py checks the two agree on every hand.
// Cards are 1–13: 1 is an ace, 11–13 are J, Q, K.

export function total(cards) {
  const value = cards.reduce((a, c) => a + Math.min(c, 10), 0);
  const soft = cards.includes(1) && value + 10 <= 21;
  return { total: value + (soft ? 10 : 0), soft };
}

export const hilo = c => (c >= 2 && c <= 6 ? 1 : c === 1 || c >= 10 ? -1 : 0);
export const isPair = cards => cards.length === 2 && Math.min(cards[0], 10) === Math.min(cards[1], 10);

/** Total-dependent basic strategy for 4–8 decks, doubles on any two cards, US peek. */
export function basic(cards, dealer, { h17 = false, das = true, surrender = false, split = true } = {}) {
  const { total: t, soft } = total(cards);
  const d = dealer === 1 ? 11 : Math.min(dealer, 10);
  const pair = isPair(cards);
  if (cards.length === 2 && !soft && surrender) {
    if ((t === 16 && d >= 9 && !pair) || (t === 15 && (d === 10 || (h17 && d === 11))) || (h17 && t === 17 && d === 11) || (h17 && pair && cards[0] === 8 && d === 11)) return 'R';
  }
  if (pair && split) {
    const c = Math.min(cards[0], 10);
    if (c === 1 || c === 8) return 'P';
    if ((c === 2 || c === 3) && d >= 2 && d <= 7 && (das || d >= 4)) return 'P';
    if (c === 4 && das && (d === 5 || d === 6)) return 'P';
    if (c === 6 && d >= 2 && d <= 6 && (das || d >= 3)) return 'P';
    if (c === 7 && d >= 2 && d <= 7) return 'P';
    if (c === 9 && ((d >= 2 && d <= 6) || d === 8 || d === 9)) return 'P';
  }
  const dbl = cards.length === 2;
  if (soft) {
    if (t >= 20) return 'S';
    if (t === 19) return h17 && d === 6 && dbl ? 'D' : 'S';
    if (t === 18) {
      if (((d >= 3 && d <= 6) || (h17 && d === 2)) && dbl) return 'D';
      return d <= 8 ? 'S' : 'H';
    }
    if (t === 17 && d >= 3 && d <= 6 && dbl) return 'D';
    if ((t === 15 || t === 16) && d >= 4 && d <= 6 && dbl) return 'D';
    if ((t === 13 || t === 14) && d >= 5 && d <= 6 && dbl) return 'D';
    return 'H';
  }
  if (t >= 17) return 'S';
  if (t >= 13) return d <= 6 ? 'S' : 'H';
  if (t === 12) return d >= 4 && d <= 6 ? 'S' : 'H';
  if (t === 11 && dbl && (d <= 10 || h17)) return 'D';
  if (t === 10 && dbl && d <= 9) return 'D';
  if (t === 9 && dbl && d >= 3 && d <= 6) return 'D';
  return 'H';
}

/** Common Hi‑Lo indices for six-deck S17, no surrender: [hard total, upcard (1 = ace), index, action]. */
export const INDICES = [[16, 10, 0, 'S'], [15, 10, 4, 'S'], [20, 5, 5, 'P'], [20, 6, 4, 'P'], [10, 10, 4, 'D'], [12, 3, 2, 'S'], [12, 2, 3, 'S'], [11, 1, 1, 'D'], [9, 2, 1, 'D'], [10, 1, 4, 'D'], [9, 7, 3, 'D'], [16, 9, 5, 'S'], [13, 2, -1, 'S'], [12, 4, 0, 'S'], [12, 5, -2, 'S'], [12, 6, -1, 'S'], [13, 3, -2, 'S']];
export const INSURANCE_INDEX = 3;

export function deviation(cards, dealer, tc, { das = true, split = true } = {}) {
  const { total: t, soft } = total(cards);
  if (basic(cards, dealer, { das, split }) === 'P') return 'P';
  if (!soft) {
    for (const [hand, up, index, action] of INDICES) {
      if (hand === t && Math.min(dealer, 10) === up && (action !== 'P' || (split && cards.length === 2 && cards.every(c => c >= 10)))) {
        if (action === 'D' && cards.length !== 2) break;
        return tc >= index ? action : action === 'S' ? 'H' : basic(cards, dealer, { das, split });
      }
    }
  }
  return basic(cards, dealer, { das, split });
}

export const findIndex = (cards, dealer) => {
  const { total: t, soft } = total(cards);
  if (soft) return null;
  return INDICES.find(([hand, up]) => hand === t && Math.min(dealer, 10) === up) || null;
};

/** True count, rounded down (toward negative infinity), as everywhere in this app. */
export const trueCount = (rc, decks) => Math.floor(rc / decks);

/** A simple bet ramp: 1 unit at TC +1 or lower, then TC − 1 units, capped. */
export const rampBet = (tc, max = 12) => Math.max(1, Math.min(max, tc - 1));

export const ACTIONS = { H: 'Hit', S: 'Stand', D: 'Double', P: 'Split', R: 'Surrender' };
export const rank = c => (c === 1 ? 'A' : c === 11 ? 'J' : c === 12 ? 'Q' : c === 13 ? 'K' : String(c));
export const upName = c => (c === 1 ? 'ace' : String(Math.min(c, 10)));
export const signed = n => (n > 0 ? `+${n}` : n === 0 ? '0' : `−${Math.abs(n)}`);
export const halves = n => (n % 1 === 0 ? String(n) : `${Math.floor(n) || ''}½`);

export function handLabel(cards) {
  const { total: t, soft } = total(cards);
  if (isPair(cards)) return cards[0] === 1 ? 'a pair of aces' : `a pair of ${Math.min(cards[0], 10)}s`;
  return `${soft ? 'soft' : 'hard'} ${t}`;
}

export function strategyReason(cards, dealer, act, rules = {}) {
  const { total: t, soft } = total(cards);
  const d = dealer === 1 ? 11 : Math.min(dealer, 10);
  const up = d === 11 ? 'an ace' : d === 8 ? 'an 8' : `a ${d}`;
  const pair = isPair(cards), pv = Math.min(cards[0], 10);
  if (act === 'R') return `Hard ${t} against ${up} loses so often that giving up half your bet is cheaper.`;
  if (act === 'P') return pv === 1 || pv === 8 ? 'Always split aces and eights.' : `Split ${pv}s against ${up}: two hands beat one weak total.`;
  if (pair && pv === 10) return 'Never split tens: 20 is already a winning hand.';
  if (pair && pv === 5) return 'Never split fives: play them as a hard 10.';
  if (soft) return { D: `Soft ${t} can’t bust, and ${up} is weak, so double.`, S: `Soft ${t} is strong enough to stand against ${up}.`, H: `Soft ${t} can’t bust in one card, so hit against ${up}.` }[act];
  if (act === 'D') return `${t} is a strong start against ${up}, so double.`;
  if (t >= 17) return 'Always stand on hard 17 or more.';
  if (act === 'S') return `${up[0].toUpperCase() + up.slice(1)} is a bust card, so stand on ${t} and let the dealer take the risk.`;
  if (t >= 12) return `Against ${up}, ${t} is too weak to stand. Hit.`;
  return `You can’t bust with ${t}, so hit${t >= 9 && t <= 11 ? ` (doubling ${t} only pays against weaker upcards)` : ''}.`;
}

// ---- dealing --------------------------------------------------------------
export const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = list => list[Math.floor(Math.random() * list.length)];
export const randomCard = () => randInt(1, 13);
export const ten = () => pick([10, 11, 12, 13]);
export function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  return list;
}

function hardCards(t) {
  const options = [];
  for (let a = 2; a <= 10; a++) { const b = t - a; if (b >= 2 && b <= 10 && a !== b) options.push([a, b]); }
  return pick(options).map(v => (v === 10 ? ten() : v));
}

/** Deal a two-card hand of a given kind: stiff, low, hard, soft, pair, or any. */
export function dealHand(pool = 'any') {
  if (pool === 'any') pool = pick(['hard', 'hard', 'soft', 'pair']);
  if (pool === 'hardsoft') pool = pick(['hard', 'soft']);
  let cards;
  if (pool === 'stiff') cards = hardCards(randInt(12, 17));
  else if (pool === 'low') cards = hardCards(randInt(8, 12));
  else if (pool === 'hard') cards = hardCards(randInt(5, 19));
  else if (pool === 'soft') cards = [1, randInt(2, 9)];
  else if (pool === 'softlow') cards = [1, randInt(2, 7)];
  else if (pool === 'surrender') cards = hardCards(pick([15, 16, 16, 17]));
  else { const r = randInt(1, 10); cards = r === 10 ? [ten(), ten()] : [r, r]; }
  return shuffle(cards);
}

/** Build a full strategy chart: rows of { label, cards, actions[2..A] }. */
export function chart(rules = {}) {
  const ups = [2, 3, 4, 5, 6, 7, 8, 9, 10, 1];
  const rows = [];
  for (let n = 5; n <= 20; n++) rows.push({ group: 'Hard', label: String(n), cards: n >= 12 ? [10, n - 10] : [2, n - 2] });
  for (let n = 2; n <= 9; n++) rows.push({ group: 'Soft', label: `A,${n}`, cards: [1, n] });
  for (let n = 2; n <= 10; n++) rows.push({ group: 'Pairs', label: n === 10 ? '10,10' : `${n},${n}`, cards: [n, n] });
  rows.push({ group: 'Pairs', label: 'A,A', cards: [1, 1] });
  for (const r of rows) r.actions = ups.map(up => basic(r.cards, up, rules));
  return { ups, rows };
}

/** Which chart row a hand belongs to (for highlighting). */
export function chartRow(cards) {
  if (isPair(cards)) return cards[0] === 1 ? 'A,A' : Math.min(cards[0], 10) === 10 ? '10,10' : `${cards[0]},${cards[0]}`;
  const { total: t, soft } = total(cards);
  if (soft && cards.length === 2) return `A,${t - 11}`;
  return String(Math.min(Math.max(t, 5), 20));
}
