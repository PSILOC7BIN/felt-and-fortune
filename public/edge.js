// House Edge Calculator (free, in the app): pick a table's rules and see the edge, what each rule costs, and what it
// costs per hour at your bet. Rule effects are standard approximations for a basic strategy player, relative to a
// 6-deck, S17, double-after-split, no-surrender, peek game (about 0.40%).
import { $, $$, Sound, g } from './ui.js';

const BASE = 0.40;
const RULES = [
  ['decks', 'Decks', [['1', '1 deck', -0.48], ['2', '2 decks', -0.19], ['4', '4 decks', -0.06], ['5', '5 decks', -0.03], ['6', '6 decks', 0], ['8', '8 decks', 0.02]], '6'],
  ['payout', 'Blackjack pays', [['3:2', '3:2', 0], ['7:5', '7:5', 0.45], ['6:5', '6:5', 1.39], ['1:1', '1:1 (even money)', 2.27]], '3:2'],
  ['soft17', 'Dealer soft 17', [['S17', 'Stands', 0], ['H17', 'Hits', 0.20]], 'S17'],
  ['double', 'Double down on', [['any', 'Any two cards', 0], ['9-11', '9–11 only', 0.09], ['10-11', '10–11 only', 0.18]], 'any'],
  ['das', 'Double after split', [['yes', 'Allowed', 0], ['no', 'Not allowed', 0.14]], 'yes'],
  ['surrender', 'Surrender', [['none', 'Not offered', 0], ['late', 'Late surrender', -0.07], ['early', 'Early surrender (rare)', -0.62]], 'none'],
  ['split', 'Split up to', [['4', '4 hands', 0], ['3', '3 hands', 0.03], ['2', '2 hands', 0.10], ['any', 'Unlimited', -0.01]], '4'],
  ['rsa', 'Resplit aces', [['no', 'No', 0], ['yes', 'Yes', -0.08]], 'no'],
  ['hsa', 'Hit split aces', [['no', 'No', 0], ['yes', 'Yes', -0.19]], 'no'],
  ['peek', 'Dealer hole card', [['peek', 'Peeks for blackjack (US)', 0], ['enhc', 'No hole card (European)', 0.11]], 'peek'],
  ['shuffle', 'Shuffle', [['cut', 'Cut card (hand shuffle or shoe)', 0], ['csm', 'Continuous shuffler', 0]], 'cut'],
];
// Cut-card effect: dealing to a cut card slightly favors the house, more with fewer decks (Wizard of Odds puts it
// around 0.1–0.15% for one deck and a few hundredths of a percent for shoes). A continuous shuffler has none.
const CUT_CARD = { 1: 0.13, 2: 0.06, 4: 0.03, 5: 0.02, 6: 0.02, 8: 0.01 };

/** House edge for a basic strategy player, in %, from rule choices keyed like RULES. Used by the simulator too. */
export function houseEdge(s) {
  let e = BASE;
  for (const [k, , opts, def] of RULES) { const o = opts.find(x => x[0] === (s[k] ?? def)) || opts.find(x => x[0] === def); let d = o[2]; if (k === 'surrender' && s[k] === 'late' && s.soft17 === 'H17') d = -0.09; if (k === 'shuffle' && (s[k] ?? def) === 'cut') d = CUT_CARD[s.decks ?? '6'] ?? 0.02; e += d; }
  return e;
}
const PRESETS = [
  ['Downtown Vegas double deck', { decks: '2', payout: '3:2', soft17: 'H17', double: 'any', das: 'yes', surrender: 'none', split: '4', rsa: 'no', hsa: 'no', peek: 'peek' }],
  ['Strip 6-deck shoe', { decks: '6', payout: '3:2', soft17: 'S17', double: 'any', das: 'yes', surrender: 'late', split: '4', rsa: 'yes', hsa: 'no', peek: 'peek' }],
  ['Typical regional 6-deck', { decks: '6', payout: '3:2', soft17: 'H17', double: 'any', das: 'yes', surrender: 'none', split: '4', rsa: 'no', hsa: 'no', peek: 'peek' }],
  ['6:5 single deck', { decks: '1', payout: '6:5', soft17: 'H17', double: 'any', das: 'no', surrender: 'none', split: '2', rsa: 'no', hsa: 'no', peek: 'peek' }],
];

export async function edgePage({ onCleanup }) {
  let s = Object.fromEntries(RULES.map(r => [r[0], r[3]]));
  try { s = { ...s, ...JSON.parse(localStorage.getItem('ff-edge') || '{}') }; } catch { /* defaults */ }
  let bet = Number(localStorage.getItem('ff-edge-bet')) || 25, rph = Number(localStorage.getItem('ff-edge-rph')) || 70;
  $('#page').innerHTML = `<a class="back-link" href="/tools">${g('back')} Tools</a>
    <header class="page-hero"><div><h1>House Edge Calculator</h1><p>Enter a table’s rules and see how much the house keeps from a perfect basic strategy player, which rules cost you most, and what that means per hour at your bet. Free for everyone.</p></div></header>
    <section class="sim-card"><h2 class="sim-step"><span>1</span>Start from a common game</h2><div class="edge-presets">${PRESETS.map(([n], i) => `<button type="button" class="pill-btn" data-preset="${i}">${n}</button>`).join('')}</div></section>
    <div class="edge-layout"><section class="sim-card"><h2 class="sim-step"><span>2</span>Table rules</h2><div class="sim-inputs two">${RULES.map(([k, label, opts]) => `<label class="sim-field"><span>${label}</span><select data-rule="${k}">${opts.map(([v, t]) => `<option value="${v}" ${s[k] === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`).join('')}</div>
      <h2 class="sim-step mt"><span>3</span>Your game</h2><div class="sim-inputs two"><label class="sim-field"><span>Average bet</span><div class="affix"><i>$</i><input id="edge-bet" type="number" min="1" max="100000" value="${bet}"></div></label><label class="sim-field"><span>Hands per hour</span><input id="edge-rph" type="number" min="10" max="300" value="${rph}"></label></div></section>
    <section class="sim-card edge-out" aria-live="polite"><div class="edge-big"><small>House edge</small><strong id="edge-val"></strong><span id="edge-grade"></span></div><p id="edge-cost" class="sim-sentence"></p><h3 class="sim-sub">What each rule does</h3><ul class="edge-list" id="edge-list"></ul><p class="field-hint">Approximations for a perfect basic strategy player, relative to a 6-deck, stands-on-soft-17 game with double after split (0.40%). Mistakes cost more than any rule: a typical player gives up 1–2% to errors. Card counting can flip a good game to a player edge; try the Bankroll Simulator.</p></section></div>`;
  const paint = () => {
    let e = BASE; const parts = [];
    for (const [k, label, opts, def] of RULES) { const o = opts.find(x => x[0] === s[k]) || opts.find(x => x[0] === def); let d = o[2]; if (k === 'surrender' && s[k] === 'late' && s.soft17 === 'H17') d = -0.09; if (k === 'shuffle' && o[0] === 'cut') d = CUT_CARD[s.decks] ?? 0.02; e += d; if (d) parts.push([label, o[1], d]); }
    parts.sort((a, b) => Math.abs(b[2]) - Math.abs(a[2]));
    $('#edge-val').textContent = (e < 0 ? '−' : '') + Math.abs(e).toFixed(2) + '%';
    const grade = e < 0 ? ['A rare player-edge game', 'great'] : e <= 0.35 ? ['Excellent game', 'great'] : e <= 0.6 ? ['Good game', 'good'] : e <= 1 ? ['Mediocre game', 'meh'] : ['Avoid this table', 'bad'];
    $('#edge-grade').textContent = grade[0]; $('.edge-big').dataset.grade = grade[1];
    const hr = e / 100 * bet * rph;
    $('#edge-cost').innerHTML = e > 0 ? `At <b>$${bet}</b> a hand and <b>${rph}</b> hands an hour, the house expects to win about <b>$${hr.toFixed(2)} an hour</b> from you, or <b>$${(hr * 4).toFixed(0)}</b> over a 4-hour session.` : `With perfect basic strategy you’d have a tiny edge here, about <b>$${(-hr).toFixed(2)} an hour</b>. Games like this are very rare.`;
    $('#edge-list').innerHTML = parts.length ? parts.map(([l, t, d]) => `<li class="${d > 0 ? 'bad' : 'good'}"><span>${l}: <b>${t}</b></span><b>${d > 0 ? '+' : '−'}${Math.abs(d).toFixed(2)}%</b></li>`).join('') : '<li><span>These are the baseline rules.</span><b>0.00%</b></li>';
    localStorage.setItem('ff-edge', JSON.stringify(s)); localStorage.setItem('ff-edge-bet', bet); localStorage.setItem('ff-edge-rph', rph);
  };
  $$('[data-rule]').forEach(sel => sel.onchange = () => { s[sel.dataset.rule] = sel.value; Sound.play('select'); paint(); });
  $$('[data-preset]').forEach(b => b.onclick = () => { s = { shuffle: s.shuffle || 'cut', ...PRESETS[b.dataset.preset][1] }; $$('[data-rule]').forEach(sel => { sel.value = s[sel.dataset.rule]; }); Sound.play('select'); paint(); });
  $('#edge-bet').oninput = () => { bet = Math.max(1, Number($('#edge-bet').value) || 1); paint(); };
  $('#edge-rph').oninput = () => { rph = Math.max(1, Number($('#edge-rph').value) || 1); paint(); };
  paint();
  onCleanup?.(() => {});
}
