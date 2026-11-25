// Weakness map: accuracy on every basic-strategy chart cell you've played, grouped into families, with your
// costliest leaks ranked by how often you miss them times what each miss costs. Every cell and family can be drilled.
import { esc, $, $$, g, ace, Sound } from './ui.js';
import { actionEVs } from './ev.js';
import * as bj from './bj.js';
import { paywall } from './economy.js';

const UPS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 1];
const upLabel = u => (u === 1 ? 'A' : String(u));
const ROWS = {
  Hard: Array.from({ length: 10 }, (_, i) => `H${8 + i}`),
  Soft: Array.from({ length: 8 }, (_, i) => `S${13 + i}`),
  Pairs: ['P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'PA'],
};
const rowLabel = cell => cell[0] === 'H' ? `Hard ${cell.slice(1)}` : cell[0] === 'S' ? `Soft ${cell.slice(1)} (A,${cell.slice(1) - 11})` : `${cell === 'PA' ? 'A' : cell.slice(1)},${cell === 'PA' ? 'A' : cell.slice(1)}`;
const shortLabel = cell => cell[0] === 'H' ? cell.slice(1) : cell[0] === 'S' ? `A,${cell.slice(1) - 11}` : cell === 'PA' ? 'A,A' : `${cell.slice(1)},${cell.slice(1)}`;

/** A two-card hand for a chart cell. */
export function cardsFor(cell) {
  if (cell[0] === 'P') return cell === 'PA' ? [1, 1] : cell === 'P10' ? [bj.ten(), bj.ten()] : [Number(cell.slice(1)), Number(cell.slice(1))];
  if (cell[0] === 'S') return [1, Number(cell.slice(1)) - 11];
  const t = Number(cell.slice(1)), opts = [];
  for (let a = 2; a <= 10; a++) { const b = t - a; if (b >= 2 && b <= 10 && a !== b && a < b) opts.push([a, b === 10 ? bj.ten() : b]); }
  return opts.length ? bj.pick(opts) : [10, t - 10];
}

// Families: groups of cells that share one idea, so a learner sees "soft doubles" instead of 14 separate cells.
const FAMILIES = [
  ['Stiff hands vs a weak dealer', 'Hard 12–16 against 2–6: let the dealer bust.', c => /^H1[2-6]$/.test(c.cell) && c.up >= 2 && c.up <= 6],
  ['Stiff hands vs a strong dealer', 'Hard 12–16 against 7–A: you have to hit.', c => /^H1[2-6]$/.test(c.cell) && (c.up >= 7 || c.up === 1)],
  ['Hard doubles', 'Hard 9, 10, and 11: when to double.', c => /^H(9|10|11)$/.test(c.cell)],
  ['Soft doubles', 'A,2 through A,7 against 2–6.', c => /^S1[3-8]$/.test(c.cell) && c.up >= 2 && c.up <= 6],
  ['Soft 18 and up', 'A,7 against 7–A, and soft 19–20.', c => (c.cell === 'S18' && (c.up >= 7 || c.up === 1)) || /^S(19|20)$/.test(c.cell)],
  ['Splitting pairs', 'Which pairs to split, and against what.', c => c.cell[0] === 'P'],
  ['Easy hands', 'Hard 8 and under, 17 and up.', c => /^H([5-8]|1[7-9]|2[01])$/.test(c.cell)],
];

function cost(cell, up) {
  // What a miss here costs at least: the gap between the best play and the next best.
  const v = Object.values(actionEVs(cardsFor(cell), up, {})).sort((a, b) => b - a);
  return v.length > 1 ? v[0] - v[1] : 0;
}

// ---- Skill Score: the house edge you actually face, given your mistakes -------------------------------
// Each first decision's miss rate (smoothed toward your overall rate) times what a miss costs there, weighted by how
// often that hand and upcard come up in a real game, added to the 0.40% edge perfect basic strategy faces (6 decks, S17).
const BASE_EDGE = 0.40, PV = v => (v === 10 ? 4 / 13 : 1 / 13);
export function skillScore(rows) {
  const attempts = rows.reduce((a, c) => a + c.attempts, 0), misses = rows.reduce((a, c) => a + c.misses, 0);
  if (attempts < 20) return null;
  const overall = misses / attempts, prior = 3, freq = new Map();
  for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) {
    if ((a === 1 && b === 10) || (a === 10 && b === 1)) continue;
    const cell = a === b ? (a === 1 ? 'PA' : `P${a}`) : a === 1 || b === 1 ? `S${11 + (a === 1 ? b : a)}` : `H${a + b}`;
    freq.set(cell, (freq.get(cell) || 0) + PV(a) * PV(b));
  }
  let cost = 0;
  for (const [cell, pc] of freq) for (let up = 1; up <= 10; up++) {
    const row = rows.find(r => r.cell === cell && r.up === up);
    const rate = row ? (row.misses + prior * overall) / (row.attempts + prior) : overall;
    const v = Object.values(actionEVs(cardsFor(cell), up, {})).sort((x, y) => y - x);
    cost += pc * PV(up) * rate * (v.length > 1 ? v[0] - v[1] : 0);
  }
  return { edge: BASE_EDGE + cost * 100, cost: cost * 100, attempts };
}

function scoreSpark(hist) {
  if (hist.length < 2) return '';
  const vals = hist.map(h => h.edge), lo = Math.min(...vals) - 0.05, hi = Math.max(...vals) + 0.05;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1) * 100).toFixed(1)},${(4 + (v - lo) / (hi - lo) * 32).toFixed(1)}`).join(' ');
  return `<svg class="score-spark" viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label="Skill Score over time, lower is better"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}

export async function weaknessPage(ctx) {
  const { api } = ctx;
  const data = await api('/api/weakness');
  const cells = data.cells.map(c => ({ ...c, rate: c.attempts ? (c.attempts - c.misses) / c.attempts : 1, cost: cost(c.cell, c.up) }));
  const at = (cell, up) => cells.find(c => c.cell === cell && c.up === up);
  const color = c => !c ? '' : c.attempts < 2 ? 'few' : c.rate >= 0.95 ? 'g4' : c.rate >= 0.85 ? 'g3' : c.rate >= 0.7 ? 'g2' : c.rate >= 0.5 ? 'g1' : 'g0';
  const chart = bj.chart({});
  const act = (cell, up) => { const r = chart.rows.find(x => x.label === shortLabel(cell)); return r ? r.actions[UPS.indexOf(up)] : bj.basic(cardsFor(cell), up, {}); };
  const grid = (name, rows) => `<div class="wk-grid-wrap"><h3>${name}</h3><table class="wk-grid"><thead><tr><th></th>${UPS.map(u => `<th>${upLabel(u)}</th>`).join('')}</tr></thead><tbody>${rows.map(cell => `<tr><th>${shortLabel(cell)}</th>${UPS.map(up => { const c = at(cell, up); return `<td><button type="button" class="wk-cell ${color(c)}" data-cell="${cell}" data-up="${up}" title="${esc(rowLabel(cell))} vs ${upLabel(up)}: ${c ? `${c.attempts - c.misses}/${c.attempts} right` : 'not played yet'}" aria-label="${esc(rowLabel(cell))} against ${upLabel(up)}, ${c ? `${Math.round(c.rate * 100)}% right of ${c.attempts}` : 'not played yet'}">${act(cell, up)}${c && c.misses ? `<small>${c.misses}</small>` : ''}</button></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
  const fam = FAMILIES.map(([name, blurb, test]) => { const cs = cells.filter(test), n = cs.reduce((a, c) => a + c.attempts, 0), miss = cs.reduce((a, c) => a + c.misses, 0); return { name, blurb, n, miss, rate: n ? (n - miss) / n : null, cells: cs }; });
  const leaks = cells.filter(c => c.misses).map(c => ({ ...c, score: c.misses / c.attempts * c.cost * Math.sqrt(c.attempts) })).sort((a, b) => b.score - a.score).slice(0, 8);
  const tracked = cells.reduce((a, c) => a + c.attempts, 0);
  const lost = tracked ? cells.reduce((a, c) => a + c.misses * c.cost, 0) / tracked : 0;
  const pro = data.pro;
  const score = skillScore(data.cells);
  let hist = [];
  if (score) { try { await api('/api/skillscore', 'POST', { edge: score.edge }); hist = (await api('/api/skillscore')).history; } catch { /* optional */ } }
  const scoreHTML = score ? `<section class="sim-card skill-score"><div class="ss-main"><small>Your Skill Score</small><strong>${score.edge.toFixed(2)}%</strong><span>You play like a <b>${score.edge.toFixed(2)}% house edge</b>. Perfect basic strategy faces ${BASE_EDGE.toFixed(2)}%; a typical casino player gives up about 2%.</span></div>
      <div class="ss-scale" aria-hidden="true"><i style="left:${Math.min(100, (score.edge - BASE_EDGE) / 2 * 100)}%"></i><span>Perfect</span><span>Typical player</span></div>
      <div class="ss-side">${pro ? (hist.length > 1 ? `${scoreSpark(hist)}<small>Last ${hist.length} days · lower is better</small>` : '<small>Your trend appears here as you practice.</small>') : `<button type="button" class="small" id="ss-pro">${g('crown')} Track your trend with Pro</button>`}<button type="button" class="small" id="ss-share">${g('next')} Share</button></div>
      <p class="field-hint">Based on ${score.attempts} first decisions, weighted by how often each hand comes up in a real 6-deck game. Hands you haven’t played use your overall miss rate.</p></section>`
    : `<p class="muted small">Play ${Math.max(1, 20 - tracked)} more strategy decisions to get your Skill Score: the house edge you actually face, given your mistakes.</p>`;

  $('#page').innerHTML = `<a class="back-link" href="/practice">${g('back')} Practice</a>
    <header class="page-hero"><div><h1>Weakness map</h1><p>Every basic-strategy hand you’ve played in lessons, trainers, and Free Play, colored by how often you get it right. Tap any cell to drill that exact hand.</p></div></header>
    ${tracked ? `<div class="plan-grid three wk-stats"><div class="stat-tile blue"><small>Decisions tracked</small><strong>${tracked}</strong></div><div class="stat-tile ${data.misses / tracked < 0.1 ? 'green' : 'orange'}"><small>Accuracy</small><strong>${Math.round((1 - data.misses / tracked) * 100)}%</strong></div><div class="stat-tile purple"><small>Mistakes cost you</small><strong>${(lost * 100).toFixed(2)}%</strong><span>of each bet, on the hands you’ve played</span></div></div>${scoreHTML}`
      : `<div class="empty-review">${ace('think', 'ace-lg')}<h2>No hands tracked yet</h2><p class="muted">Play a few strategy questions in lessons, the trainers, or Free Play and your map fills in here.</p><a class="button primary" href="/practice/skill/strategy-hard">Start with hard totals</a></div>`}
    ${tracked ? `<section class="sim-card"><h2 class="sim-step"><span>${g('target')}</span>Your costliest leaks</h2><p class="field-hint">Ranked by how often you miss the hand times what each miss costs.</p>
      ${leaks.length ? `<ol class="wk-leaks">${leaks.map((c, i) => `<li class="${!pro && i > 0 ? 'locked' : ''}"><span><b>${esc(rowLabel(c.cell))} vs ${upLabel(c.up)}</b><small>${c.attempts - c.misses}/${c.attempts} right · the chart says ${bj.ACTIONS[act(c.cell, c.up)].toLowerCase()} · each miss costs ≥ ${(c.cost * 100).toFixed(1)}%</small></span>${!pro && i > 0 ? `<span class="pro-tag">${g('crown')} Pro</span>` : `<button type="button" class="small" data-drill="${c.cell}:${c.up}">Drill</button>`}</li>`).join('')}</ol>
        ${leaks.length > 1 ? `<div class="flex">${pro ? `<button type="button" class="primary" data-drill="${leaks.map(c => `${c.cell}:${c.up}`).join(',')}">${g('target')} Drill all my leaks</button>` : `<button type="button" class="button" id="wk-pro">${g('crown')} See every leak with Pro</button>`}</div>` : ''}` : '<p class="muted">No misses on the hands you’ve played. Nice.</p>'}</section>
    <section class="sim-card"><h2 class="sim-step"><span>${g('chart')}</span>By family</h2><div class="wk-families">${fam.map((f, i) => `<div class="wk-family"><div><strong>${f.name}</strong><span>${f.blurb}</span></div><div class="wk-fam-bar"><i style="width:${f.rate == null ? 0 : Math.round(f.rate * 100)}%" class="${f.rate == null ? '' : f.rate >= 0.9 ? 'g' : f.rate >= 0.75 ? 'y' : 'r'}"></i></div><b>${f.rate == null ? '—' : Math.round(f.rate * 100) + '%'}</b><button type="button" class="small" data-family="${i}">Drill</button></div>`).join('')}</div></section>
    <section class="sim-card"><h2 class="sim-step"><span>${g('book')}</span>The chart, colored by your accuracy</h2><p class="field-hint wk-legend"><span class="wk-cell g4"></span>95%+ <span class="wk-cell g2"></span>70–85% <span class="wk-cell g0"></span>under 50% <span class="wk-cell few"></span>1 try <span class="wk-cell"></span>not played. Letters are the chart’s play (S17); small numbers are misses.</p>
      <div class="wk-grids">${grid('Hard', ROWS.Hard)}${grid('Soft', ROWS.Soft)}${grid('Pairs', ROWS.Pairs)}</div></section>` : ''}`;
  const drill = list => { sessionStorage.setItem('ff-drill', JSON.stringify(list)); Sound.play('select'); ctx.go('/practice/drill'); };
  $$('[data-drill]').forEach(b => b.onclick = () => drill(b.dataset.drill.split(',').map(x => { const [cell, up] = x.split(':'); return [cell, Number(up)]; })));
  $$('.wk-cell[data-cell]').forEach(b => b.onclick = () => drill([[b.dataset.cell, Number(b.dataset.up)]]));
  $$('[data-family]').forEach(b => b.onclick = () => {
    const [, , test] = FAMILIES[b.dataset.family];
    const all = Object.values(ROWS).flat().flatMap(cell => UPS.map(up => ({ cell, up }))).filter(test);
    drill(all.map(c => [c.cell, c.up]));
  });
  $('#ss-pro')?.addEventListener('click', () => paywall(ctx, 'Pro tracks your Skill Score every day so you can watch the edge you give away shrink.'));
  $('#ss-share')?.addEventListener('click', async () => {
    const text = `My blackjack Skill Score on Felt & Fortune: I play like a ${score.edge.toFixed(2)}% house edge (perfect is ${BASE_EDGE.toFixed(2)}%).`;
    try { if (navigator.share) await navigator.share({ text, url: location.origin }); else { await navigator.clipboard.writeText(text + ' ' + location.origin); ctx.toast('Copied to your clipboard.'); } } catch { /* cancelled */ }
  });
  $('#wk-pro')?.addEventListener('click', () => paywall(ctx, 'Pro ranks every leak in your game and drills them all at once.'));
}
