// Bankroll Simulator: presets, three key inputs, one Run button, and plain-language results.
import { esc, $, $$, Sound, ace, g } from './ui.js';

const COUNTS = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];
const RAMPS = {
  flat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  r8: [1, 1, 1, 1, 1, 2, 3, 4, 6, 8, 8],
  r12: [1, 1, 1, 1, 1, 2, 4, 6, 8, 10, 12],
  r16: [1, 1, 1, 1, 2, 4, 8, 10, 12, 16, 16],
};
export const PRESETS = [
  { id: 'flat', name: 'Basic strategy, flat bet', blurb: 'No counting. Shows the house edge you face.', ramp: 'flat', wong: -20, playMode: 'basic' },
  { id: 'r8', name: 'Counting, 1–8 spread', blurb: 'A cautious spread that draws less attention.', ramp: 'r8', wong: -20, playMode: 'basic' },
  { id: 'r12', name: 'Counting, 1–12 spread', blurb: 'A typical shoe-game spread with Hi‑Lo indices.', ramp: 'r12', wong: -20, playMode: 'deviations' },
  { id: 'wong', name: 'Back-count, enter at +2', blurb: 'Only play when the true count is +2 or higher.', ramp: 'r12', wong: 2, playMode: 'deviations' },
];
const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n) || 0);
const num = (n, d = 0) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(n);

function lineChart(points) {
  if (!points?.length) return '';
  const W = 760, H = 220, xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(0, ...ys), y1 = Math.max(0, ...ys);
  const X = x => 8 + (x - x0) / Math.max(1, x1 - x0) * (W - 16), Y = y => 10 + (1 - (y - y0) / Math.max(1, y1 - y0)) * (H - 20);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(' ');
  return `<svg class="sim-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Profit over the simulated rounds, ending at ${money(ys[ys.length - 1])}"><line x1="8" x2="${W - 8}" y1="${Y(0)}" y2="${Y(0)}" stroke="#C7C7CC" stroke-dasharray="4 4"/><path d="${d}" fill="none" stroke="${ys[ys.length - 1] >= 0 ? '#248A3D' : '#D70015'}" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
}

export function createSimulator({ api, onCleanup }) {
  return async function simulatorPage() {
    let saved = {}; try { saved = JSON.parse(localStorage.getItem('ff-sim') || '{}'); } catch { saved = {}; }
    const s = { preset: 'r12', bankroll: 10000, unit: 25, rph: 100, decks: 6, penetration: 75, h17: false, surrender: false, payout: 1.5, rounds: 100000, ...saved };
    let alive = true, timer = null;
    onCleanup(() => { alive = false; clearTimeout(timer); });
    const p = () => PRESETS.find(x => x.id === s.preset) || PRESETS[2];

    $('#page').innerHTML = `<a class="back-link" href="/practice">${g('back')} Practice</a>
      <header class="page-hero"><div><h1>Bankroll Simulator</h1><p>Plays thousands of shuffled shoes with your rules and bet spread, then tells you what to expect: hourly win rate, swings, and your chance of going broke.</p></div></header>
      <section class="sim-card"><h2 class="sim-step"><span>1</span>Pick a game plan</h2><div class="preset-grid" role="radiogroup" aria-label="Game plan">${PRESETS.map(x => `<button type="button" class="preset" role="radio" aria-checked="${s.preset === x.id}" data-p="${x.id}"><strong>${x.name}</strong><span>${x.blurb}</span></button>`).join('')}</div></section>
      <section class="sim-card"><h2 class="sim-step"><span>2</span>Your money</h2><div class="sim-inputs">
        <label class="sim-field"><span>Bankroll</span><div class="affix"><i>$</i><input id="sim-bankroll" type="number" min="100" max="100000000" step="100" value="${s.bankroll}"></div></label>
        <label class="sim-field"><span>Unit (minimum bet)</span><div class="affix"><i>$</i><input id="sim-unit" type="number" min="1" max="100000" step="1" value="${s.unit}"></div></label>
        <label class="sim-field"><span>Hands per hour</span><input id="sim-rph" type="number" min="20" max="300" step="10" value="${s.rph}"></label></div>
        <details class="sim-advanced"><summary>Table rules and accuracy</summary><div class="sim-inputs">
          <label class="sim-field"><span>Decks</span><select id="sim-decks">${[4, 6, 8].map(n => `<option value="${n}" ${s.decks === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          <label class="sim-field"><span>Penetration</span><select id="sim-pen">${[65, 70, 75, 80, 85].map(n => `<option value="${n}" ${s.penetration === n ? 'selected' : ''}>${n}%</option>`).join('')}</select></label>
          <label class="sim-field"><span>Dealer</span><select id="sim-h17"><option value="0" ${s.h17 ? '' : 'selected'}>Stands on soft 17</option><option value="1" ${s.h17 ? 'selected' : ''}>Hits soft 17</option></select></label>
          <label class="sim-field"><span>Blackjack pays</span><select id="sim-payout"><option value="1.5" ${s.payout === 1.5 ? 'selected' : ''}>3:2</option><option value="1.2" ${s.payout === 1.2 ? 'selected' : ''}>6:5</option></select></label>
          <label class="sim-field"><span>Rounds to simulate</span><select id="sim-rounds">${[[20000, '20,000 · fast'], [100000, '100,000'], [500000, '500,000 · precise']].map(([v, t]) => `<option value="${v}" ${s.rounds === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
        </div><p class="field-hint">Index plays need six decks, S17, and no surrender; other rules use basic strategy. Double after split is on.</p></details></section>
      <div class="sim-run"><button type="button" class="primary chunky large" id="sim-go">${g('chart')} Run simulation</button><span id="sim-status" class="muted" role="status"></span></div>
      <section id="sim-out" aria-live="polite"></section>`;

    $$('.preset').forEach(b => b.onclick = () => { s.preset = b.dataset.p; $$('.preset').forEach(x => x.setAttribute('aria-checked', String(x === b))); Sound.play('select'); });
    const read = () => {
      s.bankroll = Number($('#sim-bankroll').value); s.unit = Number($('#sim-unit').value); s.rph = Number($('#sim-rph').value);
      s.decks = Number($('#sim-decks').value); s.penetration = Number($('#sim-pen').value); s.h17 = $('#sim-h17').value === '1';
      s.payout = Number($('#sim-payout').value); s.rounds = Number($('#sim-rounds').value);
      localStorage.setItem('ff-sim', JSON.stringify(s));
    };
    $('#sim-go').onclick = async () => {
      read();
      const pr = p(), ramp = RAMPS[pr.ramp];
      const deviations = pr.playMode === 'deviations' && s.decks === 6 && !s.h17;
      const cfg = { bankroll: s.bankroll, unit: s.unit, rph: s.rph, decks: s.decks, penetration: s.penetration, h17: s.h17, das: true, surrender: false, rsa: false, payout: s.payout, wong: pr.wong, rounds: s.rounds, seed: Math.floor(Math.random() * 1e6), playMode: deviations ? 'deviations' : 'basic', maxHands: 4, doubleRule: 'any', splitAces: true, spread: COUNTS.map((c, i) => ({ count: c, units: ramp[i], hands: 1 })) };
      const out = $('#sim-out'), btn = $('#sim-go');
      btn.disabled = true; $('#sim-status').innerHTML = '<span class="spinner"></span> Dealing shoes…';
      out.innerHTML = `<div class="sim-loading">${ace('think', 'ace-md bob')}<p>Playing ${num(s.rounds)} rounds…</p></div>`;
      try {
        const job = await api('/api/simulate', 'POST', cfg);
        const poll = async () => {
          if (!alive) return;
          const st = await api('/api/simulate/' + job.id);
          if (st.status === 'running') { timer = setTimeout(poll, 900); return; }
          btn.disabled = false; $('#sim-status').textContent = '';
          if (st.status === 'error') { out.innerHTML = `<p class="form-error">${esc(st.error)}</p>`; return; }
          Sound.play('reveal'); show(st.result, cfg, pr);
        };
        timer = setTimeout(poll, 500);
      } catch (e) { btn.disabled = false; $('#sim-status').textContent = ''; out.innerHTML = `<p class="form-error">${esc(e.message)}</p>`; }
    };

    function show(r, cfg, pr) {
      const pos = r.ev > 0, risk = r.risk * 100;
      const sentence = pos
        ? `With this plan you’d expect to win about <b>${money(r.ev)} an hour</b>, but any single hour swings by about <b>±${money(r.sd)}</b>. Your chance of losing the whole ${money(cfg.bankroll)} bankroll is about <b>${num(risk, 1)}%</b>, and it takes roughly <b>${num(r.n0)} hours</b> before skill reliably outweighs luck.`
        : `This plan loses about <b>${money(-r.ev)} an hour</b> on average, with swings of about <b>±${money(r.sd)}</b> per hour. ${pr.id === 'flat' ? 'That’s the house edge: basic strategy alone keeps it small but can’t beat it.' : 'At these rules or this spread, the count doesn’t overcome the house edge.'}`;
      $('#sim-out').innerHTML = `<section class="sim-card result"><h2 class="sim-step"><span>${g('check')}</span>What to expect</h2><p class="sim-sentence">${sentence}</p>
        <div class="plan-grid four"><div class="stat-tile ${pos ? 'green' : 'orange'}"><small>Win rate</small><strong>${money(r.ev)}</strong><span>per hour</span></div><div class="stat-tile blue"><small>Swing (1 SD)</small><strong>±${money(r.sd)}</strong><span>per hour</span></div><div class="stat-tile purple"><small>Risk of ruin</small><strong>${pos ? num(risk, 1) + '%' : '100%'}</strong><span>${pos ? 'approximate' : 'losing game'}</span></div><div class="stat-tile yellow"><small>N₀</small><strong>${r.n0 ? num(r.n0) : '∞'}</strong><span>hours</span></div></div>
        <h3 class="sim-sub">One simulated run</h3>${lineChart(r.trajectory)}<p class="field-hint">Net ${money(r.profit)} over ${num(r.rounds)} rounds (${num(r.rounds / cfg.rph)} hours). The 95% range for the hourly win rate is ${money(r.ci[0])} to ${money(r.ci[1])}. Risk and N₀ are approximations, not guarantees.</p>
        <div class="flex"><button type="button" class="small" id="sim-export">${g('book')} Export results</button></div></section>`;
      $('#sim-export').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ settings: cfg, result: r }, null, 2)], { type: 'application/json' })); a.download = 'simulation.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
      $('#sim-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
}
