// Strategy charts: basic strategy for any rules, the Hi-Lo count plays (Illustrious 18 and Fab 4), and the bet ramp.
// A page in Tools, and a sheet that opens from any regular lesson (never in checkpoints or tests).
import { esc, $, $$, g, Sound } from './ui.js';
import { chartHTML } from './trainers.js';
import * as bj from './bj.js';

const vs = up => (up === 1 ? 'A' : String(up));
const ACT = { S: 'Stand', H: 'Hit', D: 'Double', P: 'Split' };
// Fab 4 late-surrender indices (6 decks, S17): surrender at or above the index.
const FAB4 = [[14, 10, 3], [15, 10, 0], [15, 9, 2], [15, 1, 1]];

export function deviationsHTML() {
  const rows = bj.INDICES.map(([t, up, idx, act]) => {
    const base = bj.basic(t === 20 ? [10, 10] : t >= 12 ? [10, t - 10] : [t - 4, 4], up, {});
    return `<tr><th>${t === 20 ? '10,10' : t} vs ${vs(up)}</th><td class="idx">${bj.signed(idx)}</td><td>${ACT[act]} at ${bj.signed(idx)} or higher</td><td class="muted">otherwise ${ACT[base] || base}</td></tr>`;
  }).join('');
  return `<div class="chart-wrap"><table class="dev-chart"><thead><tr><th>Hand</th><th>Index</th><th>Play</th><th></th></tr></thead><tbody><tr><th>Insurance</th><td class="idx">+3</td><td>Take insurance at +3 or higher</td><td class="muted">otherwise never</td></tr>${rows}</tbody></table>
    <h3 class="chart-sub">Fab 4 surrenders</h3><table class="dev-chart"><tbody>${FAB4.map(([t, up, i]) => `<tr><th>${t} vs ${vs(up)}</th><td class="idx">${bj.signed(i)}</td><td>Surrender at ${bj.signed(i)} or higher</td><td class="muted">where surrender is offered</td></tr>`).join('')}</tbody></table>
    <p class="chart-key">Indices are Hi‑Lo true counts for 6 decks, dealer stands on soft 17. Pairs follow basic strategy except 10,10.</p></div>`;
}

export function rampHTML(max = 12) {
  const tcs = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  return `<div class="chart-wrap"><table class="dev-chart ramp"><thead><tr><th>True count</th>${tcs.map(t => `<th>${bj.signed(t)}</th>`).join('')}</tr></thead><tbody><tr><th>Units</th>${tcs.map(t => `<td>${bj.rampBet(t, max)}</td>`).join('')}</tr></tbody></table><p class="chart-key">1 unit at +1 or lower, then true count − 1 units, up to ${max}.</p></div>`;
}

/** Tabs: basic (with rule toggles), count plays, bet ramp. */
function chartsBody(state, { compact = false } = {}) {
  const tab = (id, label) => `<button type="button" role="tab" class="ct-tab" data-ct="${id}" aria-selected="${state.tab === id}">${label}</button>`;
  const seg = (k, label, opts) => `<div class="seg-group"><span>${label}</span><div class="segmented" role="radiogroup" aria-label="${label}">${opts.map(([v, t]) => `<button type="button" role="radio" data-cr="${k}" data-v="${v}" aria-checked="${String(state[k]) === v}">${t}</button>`).join('')}</div></div>`;
  const rules = { h17: state.h17 === 'on', surrender: state.surrender === 'on', das: state.das === 'on' };
  return `<div class="ct-tabs" role="tablist">${tab('basic', 'Basic strategy')}${tab('count', 'Count plays')}${tab('ramp', 'Bet ramp')}</div>
    ${state.tab === 'basic' ? `<div class="settings-bar ct-rules">${seg('h17', 'Dealer soft 17', [['off', 'Stands'], ['on', 'Hits']])}${seg('das', 'Double after split', [['on', 'Yes'], ['off', 'No']])}${seg('surrender', 'Surrender', [['off', 'No'], ['on', 'Yes']])}</div>${chartHTML({ rules, highlight: state.highlight })}`
      : state.tab === 'count' ? deviationsHTML() : rampHTML()}${compact ? '' : ''}`;
}

function wire(root, state, repaint) {
  $$('[data-ct]', root).forEach(b => b.onclick = () => { state.tab = b.dataset.ct; Sound.play('select'); repaint(); });
  $$('[data-cr]', root).forEach(b => b.onclick = () => { state[b.dataset.cr] = b.dataset.v; Sound.play('select'); repaint(); });
}

export function chartsPage() {
  const state = { tab: 'basic', h17: 'off', das: 'on', surrender: 'off' };
  const paint = () => {
    $('#page').innerHTML = `<a class="back-link" href="/tools">${g('back')} Tools</a><header class="page-hero"><div><h1>Strategy charts</h1><p>Basic strategy for your table’s rules, the count-based plays that change it, and the bet ramp. Open them any time here, and from the Chart button in regular lessons.</p></div></header><section class="sim-card">${chartsBody(state)}</section>`;
    wire($('#page'), state, paint);
  };
  paint();
}

/** A sheet over a lesson. `rules` and `highlight` come from the current question when there is one. */
export function openChartSheet(container, { rules = {}, highlight = null, counting = false } = {}) {
  const state = { tab: 'basic', h17: rules.h17 ? 'on' : 'off', das: rules.das === false ? 'off' : 'on', surrender: rules.surrender ? 'on' : 'off', highlight };
  let shade = container.querySelector('.chart-shade');
  if (!shade) { container.insertAdjacentHTML('beforeend', '<div class="sheet-shade chart-shade"><div class="sheet wide" role="dialog" aria-modal="true" aria-label="Strategy charts"></div></div>'); shade = container.querySelector('.chart-shade'); }
  const sheet = shade.querySelector('.sheet');
  const paint = () => {
    sheet.innerHTML = `<h2>Strategy charts</h2>${chartsBody(state)}<button type="button" class="primary chunky" id="chart-close">Back to the lesson</button>`;
    wire(sheet, state, paint); sheet.querySelector('#chart-close').onclick = close;
  };
  const close = () => { shade.hidden = true; };
  if (counting) state.tab = 'basic';
  shade.hidden = false; paint();
  shade.onclick = e => { if (e.target === shade) close(); };
}
