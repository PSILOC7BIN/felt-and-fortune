// Turns one short teaching sentence into an animation of exactly what it says: the cards, totals, dealer upcards,
// plays, counts, and numbers it names, and nothing it doesn't. Hand-made scenes are used only when the sentence
// describes that exact thing (the dealer drawing to 17, a bust, the Hi-Lo tags...). Prose with nothing to draw
// animates its own key numbers and words.
import { esc, cardHTML, feltPrint } from './ui.js';
import * as bj from './bj.js';

const felt = inner => `<div class="sc-felt">${feltPrint({ spots: false })}${inner}</div>`;
const card = (v, i, cls = '') => `<span class="sc-c" style="--i:${i}">${cardHTML(v, i, { cls })}</span>`;
const back = i => `<span class="sc-c" style="--i:${i}">${cardHTML(0, i, { back: true })}</span>`;
const tag = (txt, i, cls = '') => `<b class="sc-tag ${cls}" style="--i:${i}">${esc(txt)}</b>`;
const ACT = { hit: 'Hit', hits: 'Hit', stand: 'Stand', stands: 'Stand', double: 'Double', doubles: 'Double', split: 'Split', splits: 'Split', surrender: 'Surrender' };
const ACT_CLS = { Hit: 'H', Stand: 'S', Double: 'D', Split: 'P', Surrender: 'R' };
const cardOf = s => (/^(a|ace)$/i.test(s) ? 1 : Math.min(Number(s), 10));
const hardCards = t => (t >= 12 ? [10, t - 10] : t >= 4 ? [t - 2 > 9 ? 9 : t - 2, t - (t - 2 > 9 ? 9 : t - 2)] : [2, 2]);

// ---- hand-made scenes, each used only when the sentence says that exact thing --------------------------------------
const SPECIAL = [
  [/number cards count as their number/i, () => felt(`<div class="sc-row">${[2, 3, 4, 5, 6, 7, 8, 9].map((v, i) => `<span class="sc-c" style="--i:${i}">${cardHTML(v, i)}<em class="tag z">${v}</em></span>`).join('')}</div>`)],
  [/jacks?,? queens?,? and kings?/i, () => felt(`<div class="sc-row">${[11, 12, 13].map((v, i) => `<span class="sc-c" style="--i:${i}">${cardHTML(v, i)}<em class="tag z">10</em></span>`).join('')}</div>`)],
  [/ace counts? as 1 or 11/i, () => felt(`<div class="sc-row">${card(1, 0)}</div><div class="sc-flip"><span class="a">11</span><span class="b">1</span></div>`)],
  [/must hit until (reaching )?17|draws? to 16 and stand|hit until 17/i, () => felt(`<div class="sc-who">Dealer</div><div class="sc-row">${[6, 5, 2, 4].map((v, i) => card(v, i)).join('')}</div><div class="sc-tick">${[6, 11, 13, 17].map((v, i) => `<b style="--i:${i}" class="${v >= 17 ? 'stop' : ''}">${v}</b>`).join('')}</div>`)],
  [/over 21 is a bust|going over 21/i, () => felt(`<div class="sc-row">${card(10, 0)}${card(6, 1)}${card(9, 2)}</div><div class="sc-bust">25 · BUST</div>`)],
  [/closer to 21 than the dealer/i, () => felt(`<div class="sc-vs"><div><small>Dealer</small><div class="sc-row">${card(10, 0)}${card(8, 1)}</div><b>18</b></div><div class="sc-vs-mid">vs</div><div class="win"><small>You</small><div class="sc-row">${card(10, 2)}${card(9, 3)}</div><b>19</b></div></div>`)],
  [/ace plus a ten-value card|ace and a ten/i, () => felt(`<div class="sc-row sc-glow">${card(1, 0)}${card(13, 1)}</div>${tag('Blackjack', 2, 'gold')}`)],
  [/you and the dealer each get two cards/i, () => felt(`<div class="sc-who">Dealer</div><div class="sc-row">${card(9, 1)}${back(3)}</div><div class="sc-row">${card(10, 0)}${card(7, 2)}</div><div class="sc-who">You</div>`)],
  [/insurance bets half your stake/i, () => felt(`<div class="sc-who">Dealer</div><div class="sc-row">${card(1, 0)}${back(1)}</div><div class="sc-chips"><span class="chip-s" style="--i:2">Bet $10</span><span class="chip-s gold" style="--i:3">Insurance $5</span></div>`)],
];

// "Hit: take a card. Stand: keep your hand." Each play that is defined gets a tiny demo of exactly that definition.
function playDefs(t) {
  const defs = [];
  if (/\bhit:\s*take a card/i.test(t)) defs.push(['Hit', i => `<div class="sc-row">${card(10, i)}${card(4, i + 1)}${card(5, i + 2)}</div>`]);
  if (/\bstand:\s*keep your hand/i.test(t)) defs.push(['Stand', i => `<div class="sc-row">${card(10, i)}${card(8, i + 1)}</div>`]);
  if (/\bdouble:\s*double your bet/i.test(t)) defs.push(['Double', i => `<div class="sc-row">${card(5, i)}${card(6, i + 1)}<span class="sc-c sc-side" style="--i:${i + 3}">${cardHTML(9, i + 3)}</span></div><div class="sc-chips"><span class="chip-s" style="--i:${i}">$10</span><span class="chip-s" style="--i:${i + 2}">+$10</span></div>`]);
  if (/\bsplit:\s*turn a pair into two hands/i.test(t)) defs.push(['Split', i => `<div class="sc-split"><div class="l">${card(8, i)}${card(3, i + 2)}</div><div class="r">${card(8, i + 1)}${card(10, i + 3)}</div></div>`]);
  if (/surrender[^.]*give up half your bet/i.test(t)) defs.push(['Surrender', i => `<div class="sc-row">${card(10, i)}${card(6, i + 1)}</div><div class="sc-chips"><span class="chip-s half-out">$5 back</span><span class="chip-s lost">$5 lost</span></div>`]);
  if (!defs.length) return null;
  return felt(`<div class="sc-defs">${defs.map(([name, draw], k) => `<div class="sc-def"><span class="sc-act act-${ACT_CLS[name]}" style="--i:${k * 4}">${name}</span>${draw(k * 4)}</div>`).join('')}</div>`);
}

function hiLoScene(t) {
  const groups = [];
  if (/\b2 (through|to|-) ?6\b[^.]*\+1|2-6\s*:?\s*\+1/i.test(t)) groups.push([[2, 3, 4, 5, 6], '+1', 'p']);
  if (/\b7, 8,? and 9\b[^.]*\b0\b|7-9\s*:?\s*0/i.test(t)) groups.push([[7, 8, 9], '0', 'z']);
  if (/tens?[^.]{0,20}aces?[^.]{0,12}(-|−)1/i.test(t)) groups.push([[10, 12, 13, 1], '−1', 'm']);
  if (!groups.length) return null;
  let i = 0;
  return felt(`<div class="sc-groups">${groups.map(([cs, v, c]) => `<div class="sc-row">${cs.map(x => `<span class="sc-c" style="--i:${i++}">${cardHTML(x, i)}<em class="tag ${c}">${v}</em></span>`).join('')}</div>`).join('')}</div>`);
}

function pairCountScene(t) {
  // "5 + K is 0; 4 + 3 is +2": show exactly those pairs and their counts.
  const m = [...t.matchAll(/\b(\d|10|[AJQK])\s*\+\s*(\d|10|[AJQK])\s+is\s+([+-]?\d)/g)];
  if (!m.length) return null;
  const v = s => ({ A: 1, J: 11, Q: 12, K: 13 }[s] || Number(s));
  let i = 0;
  return felt(`<div class="sc-groups">${m.map(x => `<div class="sc-row">${card(v(x[1]), i++)}${card(v(x[2]), i++)}${tag(x[3].replace('-', '−'), i++)}</div>`).join('')}</div>`);
}

function divisionScene(t) {
  const m = t.match(/([+-]?\d+)\s*÷\s*(\d+(?:\.\d+)?|½)/);
  if (m) {
    const rc = Number(m[1]), d = m[2] === '½' ? 0.5 : Number(m[2]);
    return felt(`<div class="sc-div"><span>${bj.signed(rc)}</span><span class="op">÷</span><span>${m[2]}</span><span class="op">=</span><span class="r">${bj.signed(Math.floor(rc / d))}</span></div>`);
  }
  if (/running count ÷ decks|true count = running count/i.test(t)) return felt(`<div class="sc-div"><span class="w">running count</span><span class="op">÷</span><span class="w">decks left</span><span class="op">=</span><span class="r w">true count</span></div>`);
  return null;
}

// ---- strategy sentences: hands, upcards, plays, and true counts named in the text ---------------------------------
function upList(s) {
  const out = [];
  for (const part of s.split(/,|\band\b|\bor\b|\bexcept\b/)) {
    const r = part.trim().replace(/^(a|an)\s+/i, '');
    const m = r.match(/^(\d{1,2}|ace|a)\s*-\s*(\d{1,2}|ace|a)$/i);
    if (m) { const a = cardOf(m[1]), b = cardOf(m[2]) === 1 ? 11 : cardOf(m[2]); for (let x = a; x <= b && out.length < 10; x++) out.push(x === 11 ? 1 : x); }
    else if (/^(\d{1,2}|ace|a)$/i.test(r)) out.push(cardOf(r));
  }
  return [...new Set(out)].slice(0, 10);
}

function strategyScene(t) {
  const hands = [];
  const add = (cards, label) => { if (hands.length < 3 && !hands.some(h => h.label === label)) hands.push({ cards, label }); };
  for (const m of t.matchAll(/\bA-(\d)\b/g)) add([1, Number(m[1])], `A-${m[1]}`);
  for (const m of t.matchAll(/\b(\d{1,2})-\1\b/g)) add([Number(m[1]), Number(m[1])], `${m[1]}-${m[1]}`);
  for (const m of t.matchAll(/\b(soft|hard) (\d{1,2})\b/gi)) { const n = Number(m[2]); add(m[1].toLowerCase() === 'soft' ? [1, n - 11] : hardCards(n), `${m[1].toLowerCase()} ${n}`); }
  if (/aces and eights/i.test(t)) { add([1, 1], 'A-A'); add([8, 8], '8-8'); }
  if (/tens (or|and) fives/i.test(t)) { add([10, 10], '10-10'); add([5, 5], '5-5'); }
  for (const m of t.matchAll(/\bsplit (\d{1,2})s\b/gi)) add([Number(m[1]), Number(m[1])], `${m[1]}-${m[1]}`);
  for (const m of t.matchAll(/(?:^|[\s(:])(\d{1,2})(?=\s*(?:against|vs\.?|:\s*(?:double|stand|hit|split)))/gi)) { const n = Number(m[1]); if (n >= 4 && n <= 21) add(hardCards(n), String(n)); }
  for (const m of t.matchAll(/\b(?:with|double|stand on|on) (\d{1,2})\b/gi)) { const n = Number(m[1]); if (n >= 5 && n <= 21) add(hardCards(n), String(n)); }
  const ups = []; for (const m of t.matchAll(/(?:against|vs\.?|shows?)\s+((?:(?:a|an)\s+)?(?:\d{1,2}|ace|A)\b(?:\s*(?:,|and|or|-|except)\s*(?:(?:a|an)\s+)?(?:\d{1,2}|ace|A)\b)*)/gi)) for (const u of upList(m[1].replace(/\bA\b/g, 'ace'))) if (!ups.includes(u)) ups.push(u);
  if (/anything but an ace|all but an ace/i.test(t)) for (let u = 2; u <= 10; u++) if (!ups.includes(u)) ups.push(u);
  const acts = []; for (const m of t.toLowerCase().matchAll(/\b(hit|hits|stand|stands|double|doubles|split|splits|surrender)\b/g)) { const a = ACT[m[1]]; if (!acts.includes(a)) acts.push(a); }
  const tc = (t.match(/(?:at|true count of|count of)\s+([+-]\d+)/i) || [])[1];
  if (!hands.length && !ups.length) return null;
  if (!hands.length && !acts.length) return null;
  let i = 0;
  const handRow = hands.length ? `<div class="sc-hands">${hands.map(h => `<div class="sc-hand"><div class="sc-row">${h.cards.map(c => card(c, i++)).join('')}</div><small>${esc(h.label)}</small></div>`).join('')}</div>` : '';
  const upRow = ups.length ? `<div class="sc-ups"><span class="sc-who">Dealer shows</span><div class="sc-row small">${ups.map(u => card(u === 10 ? 10 : u, i++)).join('')}</div></div>` : '';
  const actRow = acts.length || tc ? `<div class="sc-acts">${tc ? tag(`True count ${tc.replace('-', '−')}`, i++, 'tc') : ''}${acts.map(a => `<span class="sc-act act-${ACT_CLS[a]}" style="--i:${i++}">${a}</span>`).join('')}</div>` : '';
  return felt(`${upRow}${handRow}${actRow}`);
}

// ---- prose: animate the sentence's own numbers, or its key words -----------------------------------------------------
// "Hit: tap the table. Stand: wave your hand..." Each play named with a colon gets its badge and its own words.
function playColons(t) {
  const items = [...t.matchAll(/\b(Hit|Stand|Double(?: or split)?|Split|Surrender)(?: \([^)]*\))?:\s*([^.;]+)/g)].map(m => [m[1], m[2].trim()]);
  if (!items.length) return null;
  return felt(`<div class="sc-defs list">${items.map(([a, d], k) => `<div class="sc-def row"><span class="sc-act act-${ACT_CLS[a.split(' ')[0]]}" style="--i:${k * 2}">${esc(a)}</span><span class="sc-def-txt" style="--i:${k * 2 + 1}">${esc(d)}</span></div>`).join('')}</div>`);
}

// A soft hand that takes a big card: the ace drops from 11 to 1 instead of busting.
function aceDrops(t) {
  if (!/ace (can )?drop(s)? (back )?to 1|ace (can )?fall(s)? back to 1|ace counts as 1 instead/i.test(t)) return null;
  return felt(`<div class="sc-row">${card(1, 0)}${card(6, 1)}${card(9, 2)}</div><div class="sc-flip"><span class="a">A = 11 → 26?</span><span class="b">A = 1 → 16</span></div>`);
}

// Prose: the sentence's own numbers (ranges, decimals, money, ratios, counts) or quoted phrases. Nothing invented.
function keyfacts(t) {
  const re = /\$\d[\d,]*(?:\.\d+)?|(?<![\w.])[+−-]?\d+(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?%|\b\d+:\d+\b|\b\d+[‑–-](?:to[‑–-])?\d+(?:\s+to\s+\d+[‑–-]\d+)?\s+spread|(?<![\w.])[+−-]\d+(?:\.\d+)?(?!\d)|\b\d[\d,]*(?:\.\d+)?(?:[–-]\d+(?:\.\d+)?)?\s*(?:hands?|bets?|units?|decks?|hours?|minutes?|players?|cards?|times|rounds?)\b/g;
  const facts = [...t.matchAll(re)].map(m => m[0]).filter((v, k, a) => a.indexOf(v) === k).slice(0, 4);
  if (facts.length) return felt(`<div class="sc-facts">${facts.map((f, k) => `<span class="sc-fact" style="--i:${k}">${esc(f.replace(/^-(\d)/, '−$1'))}</span>`).join('')}</div>`);
  const quoted = [...t.matchAll(/[“"]([^”"]{2,60})[”"]/g)].map(m => m[1]);
  if (quoted.length) return felt(`<div class="sc-facts words">${quoted.map((w, k) => `<span class="sc-fact" style="--i:${k}">${esc(w)}</span>`).join('')}</div>`);
  return '';   // nothing in this sentence to draw: just the words, no made-up picture
}


// More scenes, each only when the sentence says exactly that.
const NUMWORD = { aces: 1, twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6, sevens: 7, eights: 8, nines: 9, tens: 10 };
function moreScenes(t) {
  // "Weak upcards (2–6): let the dealer bust."  "Strong upcards (7–ace): improve your hand."
  let m = t.match(/\b(weak|small|strong|big) upcards? \((\d{1,2})\s*-\s*(\d{1,2}|ace)\)\s*:?\s*([^.]*)/i);
  if (m) { const ups = upList(`${m[2]}-${m[3]}`); let i = 0; return felt(`<div class="sc-ups"><span class="sc-who">Dealer shows</span><div class="sc-row small">${ups.map(u => card(u, i++)).join('')}</div></div>${m[4] ? tag(m[4].trim(), i) : ''}`); }
  // "Two eights make 16" / "Two aces make a weak soft 12"
  m = t.match(/\btwo (aces|twos|threes|fours|fives|sixes|sevens|eights|nines|tens) make (a weak |a )?(soft )?(\d{1,2})/i);
  if (m) { const v = NUMWORD[m[1].toLowerCase()]; return felt(`<div class="sc-row">${card(v, 0)}${card(v, 1)}</div>${tag(`${m[3] ? 'soft ' : ''}${m[4]}`, 2)}`); }
  // "A low card and a high card cancel out" / "A 10 and a 5 together are 0" / "a 5 and a king together"
  if (/low card and a high card|high card and a low card|\b10 and a 5 together|\b5 and a king together/i.test(t)) {
    const pair = /\b10 and a 5/i.test(t) ? [10, 5] : [5, 13];
    return felt(`<div class="sc-row">${pair.map((c, i) => `<span class="sc-c" style="--i:${i}">${cardHTML(c, i)}<em class="tag ${bj.hilo(c) > 0 ? 'p' : 'm'}">${bj.hilo(c) > 0 ? '+1' : '−1'}</em></span>`).join('')}${tag('= 0', 2)}</div>`);
  }
  // "The hole card counts only once it's turned over."
  if (/hole card counts only once/i.test(t)) return felt(`<div class="sc-who">Dealer</div><div class="sc-row">${card(9, 0)}<span class="sc-c sc-flipcard" style="--i:1"><span class="f back">${cardHTML(0, 1, { back: true })}</span><span class="f front">${cardHTML(6, 1)}</span></span></div>`);
  // The discard tray
  if (/discard tray|in the tray\b|read the tray/i.test(t) && !/\d/.test(t)) return felt(`<div class="sc-tray"><div class="stack">${Array.from({ length: 5 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div><span>Discard tray</span></div>`);
  return null;
}

/** Exactly-what-it-says animation for one teaching sentence (or '' when there is nothing to show). */
export function illustrate(text) {
  const t = text.replace(/[‑–]/g, '-').replace(/−/g, '-');
  for (const [re, build] of SPECIAL) if (re.test(t)) return build(t);
  return playDefs(t) || playColons(text) || aceDrops(t) || moreScenes(t) || hiLoScene(t) || pairCountScene(t) || divisionScene(t) || strategyScene(t) || keyfacts(text);
}
