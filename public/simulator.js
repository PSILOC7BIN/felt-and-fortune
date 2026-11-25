// Bankroll Simulator (EV calculator): four starter presets, plus every input a counter needs (rules, penetration,
// a full bet spread by true count, back-counting, index plays) and pro metrics (SCORE, DI, N₀, bankroll for a target risk).
import { esc, $, $$, Sound, ace, g } from './ui.js';
import { houseEdge } from './edge.js';

const COUNTS = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];
const RAMPS = {
  flat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  r8: [1, 1, 1, 1, 1, 2, 3, 4, 6, 8, 8],
  r12: [1, 1, 1, 1, 1, 2, 4, 6, 8, 10, 12],
  r16: [1, 1, 1, 1, 2, 4, 8, 10, 12, 16, 16],
};
export const PRESETS = [
  { id: 'flat', name: 'Basic strategy, flat bet', blurb: 'No counting. Shows the house edge you face.', ramp: 'flat', wong: -20, wongOut: -20, playMode: 'basic' },
  { id: 'r8', name: 'Counting, 1–8 spread', blurb: 'A cautious spread that draws less attention.', ramp: 'r8', wong: -20, wongOut: -20, playMode: 'basic' },
  { id: 'r12', name: 'Counting, 1–12 spread', blurb: 'A typical shoe-game spread with Hi‑Lo indices.', ramp: 'r12', wong: -20, wongOut: -20, playMode: 'deviations' },
  { id: 'wong', name: 'Back-count, enter at +2', blurb: 'Only play when the true count is +2 or higher.', ramp: 'r12', wong: 2, wongOut: 0, playMode: 'deviations' },
];
const DEFAULTS = { preset: 'r12', bankroll: 10000, unit: 25, rph: 100, decks: 6, penetration: 75, h17: false, surrender: false, das: true, rsa: false, splitAces: true, maxHands: 4, doubleRule: 'any', payout: 1.5, rounds: 100000, hours: 100 };
const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n) || 0);
const num = (n, d = 0) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(n);
const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
const opt = (v, t, cur) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${t}</option>`;

function lineChart(points) {
  if (!points?.length) return '';
  const W = 760, H = 220, xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(0, ...ys), y1 = Math.max(0, ...ys);
  const X = x => 8 + (x - x0) / Math.max(1, x1 - x0) * (W - 16), Y = y => 10 + (1 - (y - y0) / Math.max(1, y1 - y0)) * (H - 20);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(' ');
  return `<svg class="sim-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Profit over the simulated rounds, ending at ${money(ys[ys.length - 1])}"><line x1="8" x2="${W - 8}" y1="${Y(0)}" y2="${Y(0)}" stroke="#C7C7CC" stroke-dasharray="4 4"/><path d="${d}" fill="none" stroke="${ys[ys.length - 1] >= 0 ? '#248A3D' : '#D70015'}" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
}

const spreadFrom = p => COUNTS.map((c, i) => ({ count: c, units: RAMPS[p.ramp][i], hands: p.id === 'wong' && c >= 5 ? 2 : 1 }));

export function createSimulator({ api, onCleanup }) {
  return async function simulatorPage() {
    let saved = {}; try { saved = JSON.parse(localStorage.getItem('ff-sim2') || '{}'); } catch { saved = {}; }
    const s = { ...DEFAULTS, ...saved };
    const preset = () => PRESETS.find(x => x.id === s.preset);
    if (!Array.isArray(s.spread) || s.spread.length !== COUNTS.length) s.spread = spreadFrom(preset() || PRESETS[2]);
    if (s.wong === undefined) Object.assign(s, { wong: (preset() || PRESETS[2]).wong, wongOut: (preset() || PRESETS[2]).wongOut, playMode: (preset() || PRESETS[2]).playMode });
    let alive = true, timer = null, last = null;
    onCleanup(() => { alive = false; clearTimeout(timer); });

    const field = (label, control, hint = '') => `<label class="sim-field"><span>${label}</span>${control}${hint ? `<small class="field-hint">${hint}</small>` : ''}</label>`;
    const sel = (id, opts, cur) => `<select id="${id}">${opts.map(([v, t]) => opt(v, t, cur)).join('')}</select>`;
    const spreadRows = () => s.spread.map((r, i) => `<tr><th>${i === 0 ? `${signed(r.count)} or lower` : i === s.spread.length - 1 ? `${signed(r.count)} or higher` : signed(r.count)}</th><td><input type="number" class="sp-units" data-i="${i}" min="0.5" max="1000" step="0.5" value="${r.units}" aria-label="Units at true count ${signed(r.count)}"></td><td><select class="sp-hands" data-i="${i}" aria-label="Hands at true count ${signed(r.count)}">${opt(1, '1 hand', r.hands)}${opt(2, '2 hands', r.hands)}</select></td><td class="sp-bet">${money(r.units * s.unit * r.hands)}</td></tr>`).join('');

    $('#page').innerHTML = `<a class="back-link" href="/tools">${g('back')} Tools</a>
      <header class="page-hero"><div><h1>Bankroll Simulator</h1><p>Plays real shuffled shoes with your rules, bet spread, and play, then tells you what to expect: win rate, swings, risk of ruin, and the numbers pros use to compare games.</p></div></header>
      <section class="sim-card"><h2 class="sim-step"><span>1</span>Start from a plan</h2><p class="field-hint">New to this? Pick a plan and press Run. Every setting below can be changed; editing the spread makes it your own custom plan.</p><div class="preset-grid" role="radiogroup" aria-label="Game plan">${PRESETS.map(x => `<button type="button" class="preset" role="radio" aria-checked="${s.preset === x.id}" data-p="${x.id}"><strong>${x.name}</strong><span>${x.blurb}</span></button>`).join('')}<button type="button" class="preset custom" role="radio" aria-checked="${s.preset === 'custom'}" data-p="custom" ${s.preset === 'custom' ? '' : 'disabled'}><strong>${g('gear')} Custom</strong><span>Your own spread and settings.</span></button></div></section>
      <section class="sim-card"><h2 class="sim-step"><span>2</span>Your money</h2><div class="sim-inputs">
        ${field('Bankroll', `<div class="affix"><i>$</i><input id="sim-bankroll" type="number" min="100" max="100000000" step="100" value="${s.bankroll}"></div>`)}
        ${field('Unit (your 1-unit bet)', `<div class="affix"><i>$</i><input id="sim-unit" type="number" min="1" max="100000" step="1" value="${s.unit}"></div>`)}
        ${field('Rounds per hour', `<input id="sim-rph" type="number" min="20" max="300" step="5" value="${s.rph}">`, 'About 100 heads-up, 60 at a full table')}</div></section>
      <section class="sim-card"><h2 class="sim-step"><span>3</span>Table rules</h2><div class="sim-inputs four">
        ${field('Decks', sel('sim-decks', [1, 2, 4, 5, 6, 8].map(n => [n, n === 1 ? '1 (single deck)' : `${n}`]), s.decks))}
        ${field('Penetration (%)', `<input id="sim-pen" type="number" min="50" max="90" step="1" value="${s.penetration}">`, 'How much of the shoe is dealt before the shuffle')}
        ${field('Dealer soft 17', sel('sim-h17', [[0, 'Stands (S17)'], [1, 'Hits (H17)']], s.h17 ? 1 : 0))}
        ${field('Blackjack pays', sel('sim-payout', [[1.5, '3:2'], [1.2, '6:5']], s.payout))}
        ${field('Double down', sel('sim-double', [['any', 'Any two cards'], ['9-11', '9–11 only'], ['10-11', '10–11 only']], s.doubleRule))}
        ${field('Double after split', sel('sim-das', [[1, 'Allowed'], [0, 'Not allowed']], s.das ? 1 : 0))}
        ${field('Late surrender', sel('sim-surr', [[0, 'Not offered'], [1, 'Offered']], s.surrender ? 1 : 0))}
        ${field('Split up to', sel('sim-maxh', [[4, '4 hands'], [2, '2 hands'], [1, 'No splits']], s.maxHands))}
        ${field('Split aces', sel('sim-sa', [[1, 'Allowed'], [0, 'Not allowed']], s.splitAces ? 1 : 0))}
        ${field('Resplit aces', sel('sim-rsa', [[0, 'No'], [1, 'Yes']], s.rsa ? 1 : 0))}</div></section>
      <section class="sim-card"><h2 class="sim-step"><span>4</span>Bet spread and play</h2>
        <div class="sim-inputs four">
          ${field('Playing decisions', sel('sim-play', [['basic', 'Basic strategy'], ['deviations', 'Hi‑Lo index plays + insurance']], s.playMode), 'Index plays need S17 and no surrender')}
          ${field('Enter the shoe', sel('sim-wong', [[-20, 'Play every round'], ...[-1, 0, 1, 2, 3].map(n => [n, `Back-count, enter at ${signed(n)}`])], s.wong))}
          ${field('Leave the shoe', sel('sim-wongout', [[-20, 'Never'], ...[-2, -1, 0, 1].map(n => [n, `When it drops below ${signed(n)}`])], s.wongOut))}
          ${field('Rounds to simulate', sel('sim-rounds', [[20000, '20,000 · fast'], [100000, '100,000'], [300000, '300,000'], [1000000, '1,000,000 · precise']], s.rounds))}</div>
        <div class="spread-wrap"><table class="spread-table"><thead><tr><th>True count</th><th>Units</th><th>Hands</th><th>Total bet</th></tr></thead><tbody id="sp-body">${spreadRows()}</tbody></table>
        <div class="spread-side"><p class="field-hint">Bet this many units at each true count. Playing two hands at high counts gets more money out at lower variance per dollar.</p><p class="spread-sum" id="sp-sum"></p><div class="flex"><button type="button" class="small" id="sp-x2">Double the spread</button><button type="button" class="small" id="sp-half">Halve it</button></div>
        <div class="solver"><h3>${g('target')} Solve my ramp</h3><p class="field-hint">Builds the bet spread that grows your bankroll fastest for the risk you choose (proportional Kelly betting on the Hi‑Lo edge at each true count, with these rules).</p>
          <div class="sim-inputs two">${field('Risk of ruin you accept', sel('sol-ror', [[1, '1%'], [2, '2%'], [5, '5%'], [10, '10%'], [13.5, '13.5% (full Kelly)']], s.solveRor ?? 5))}${field('Largest bet (units)', sel('sol-cap', [8, 12, 16, 24, 32, 50].map(n => [n, `${n} units`]), s.solveCap ?? 16))}</div>
          <button type="button" class="primary" id="sol-go">${g('target')} Solve</button><p class="field-hint" id="sol-note"></p></div></div></div>
      </section>
      <div class="sim-run"><button type="button" class="primary chunky large" id="sim-go">${g('chart')} Run simulation</button><span id="sim-status" class="muted" role="status"></span></div>
      <section id="sim-out" aria-live="polite"></section>
      <section class="sim-card"><h2 class="sim-step"><span>${g('chart')}</span>Compare games</h2><p class="field-hint">Add the current setup, change the rules or spread, add again, then rank them all by SCORE (win per 100 rounds at a $10,000 bankroll and 13.5% risk), the standard way pros compare games.</p>
        <ul class="cmp-list" id="cmp-list"></ul><div class="flex"><button type="button" class="small" id="cmp-add">${g('star')} Add this setup</button><button type="button" class="primary small" id="cmp-go">${g('chart')} Compare</button><button type="button" class="small ghost" id="cmp-clear">Clear</button></div><div id="cmp-out" aria-live="polite"></div></section>`;

    const paintSum = () => { const lo = Math.min(...s.spread.map(r => r.units * r.hands)), hi = Math.max(...s.spread.map(r => r.units * r.hands)); $('#sp-sum').innerHTML = `Spread <b>1–${num(hi / lo, 1)}</b> · ${money(lo * s.unit)} to ${money(hi * s.unit)}`; $$('.sp-bet').forEach((td, i) => { td.textContent = money(s.spread[i].units * s.unit * s.spread[i].hands); }); };
    const markCustom = () => { if (s.preset === 'custom') return; s.preset = 'custom'; const c = $('.preset.custom'); c.disabled = false; $$('.preset').forEach(x => x.setAttribute('aria-checked', String(x === c))); };
    const wireSpread = () => {
      $$('.sp-units').forEach(inp => inp.oninput = () => { const v = Number(inp.value); if (v > 0) { s.spread[inp.dataset.i].units = v; markCustom(); paintSum(); } });
      $$('.sp-hands').forEach(x => x.onchange = () => { s.spread[x.dataset.i].hands = Number(x.value); markCustom(); paintSum(); });
    };
    const scale = f => { s.spread.forEach(r => { r.units = Math.max(.5, Math.round(r.units * f * 2) / 2); }); s.spread[0].units = Math.max(.5, s.spread[0].units); $('#sp-body').innerHTML = spreadRows(); wireSpread(); markCustom(); paintSum(); };
    wireSpread(); paintSum();
    $('#sp-x2').onclick = () => scale(2); $('#sp-half').onclick = () => scale(.5);
    $('#sim-unit').oninput = () => { s.unit = Number($('#sim-unit').value) || s.unit; paintSum(); };
    ['#sim-play', '#sim-wong', '#sim-wongout'].forEach(id => $(id).addEventListener('change', markCustom));
    $$('.preset').forEach(b => b.onclick = () => {
      if (b.dataset.p === 'custom') return;
      const p = PRESETS.find(x => x.id === b.dataset.p); s.preset = p.id; s.spread = spreadFrom(p);
      $('#sim-play').value = p.playMode; $('#sim-wong').value = p.wong; $('#sim-wongout').value = p.wongOut;
      $('#sp-body').innerHTML = spreadRows(); wireSpread(); paintSum();
      $$('.preset').forEach(x => x.setAttribute('aria-checked', String(x === b))); Sound.play('select');
    });
    const read = () => {
      const n = id => Number($(id).value);
      Object.assign(s, { bankroll: n('#sim-bankroll'), unit: n('#sim-unit'), rph: n('#sim-rph'), decks: n('#sim-decks'), penetration: n('#sim-pen'), h17: n('#sim-h17') === 1, payout: n('#sim-payout'),
        doubleRule: $('#sim-double').value, das: n('#sim-das') === 1, surrender: n('#sim-surr') === 1, maxHands: n('#sim-maxh'), splitAces: n('#sim-sa') === 1, rsa: n('#sim-rsa') === 1,
        playMode: $('#sim-play').value, wong: n('#sim-wong'), wongOut: n('#sim-wongout'), rounds: n('#sim-rounds') });
      localStorage.setItem('ff-sim2', JSON.stringify(s));
    };
    const problem = () => {
      if (!(s.bankroll >= 100)) return 'Enter a bankroll of at least $100.';
      if (!(s.unit >= 1)) return 'Enter a unit of at least $1.';
      if (!(s.rph >= 20 && s.rph <= 300)) return 'Rounds per hour must be between 20 and 300.';
      if (!(s.penetration >= 50 && s.penetration <= 90)) return 'Penetration must be between 50% and 90%.';
      if (s.playMode === 'deviations' && (s.h17 || s.surrender)) return 'Index plays here are for S17 games without surrender. Change the rules or choose basic strategy.';
      if (s.wongOut > -20 && s.wong > -20 && s.wongOut > s.wong) return 'Your leave count must be at or below your entry count.';
      return '';
    };

    // ---- solve my ramp: bet ∝ edge / variance, scaled so the bankroll meets the chosen risk of ruin --------
    const RULE_MAP = () => ({ decks: String(s.decks), payout: s.payout === 1.2 ? '6:5' : '3:2', soft17: s.h17 ? 'H17' : 'S17', double: s.doubleRule, das: s.das ? 'yes' : 'no', surrender: s.surrender ? 'late' : 'none', split: s.maxHands === 2 ? '2' : '4', rsa: s.rsa ? 'yes' : 'no' });
    $('#sol-go').onclick = () => {
      read();
      const ror = Number($('#sol-ror').value) / 100, cap = Number($('#sol-cap').value); s.solveRor = ror * 100; s.solveCap = cap;
      const base = -houseEdge(RULE_MAP()) / 100, perTc = 0.005, variance = 1.33;
      const scale = -2 * s.bankroll / Math.log(ror);           // dollars per unit of (edge / variance)
      s.spread.forEach(r => { const e = base + perTc * r.count, bet = scale * e / variance; r.units = Math.min(cap, Math.max(1, Math.round(bet / s.unit * 2) / 2)); r.hands = 1; });
      $('#sp-body').innerHTML = spreadRows(); wireSpread(); markCustom(); paintSum(); localStorage.setItem('ff-sim2', JSON.stringify(s));
      const top = s.spread[s.spread.length - 1].units, first = s.spread.find(r => r.units > 1);
      $('#sol-note').innerHTML = top <= 1 ? `At ${(-base * 100).toFixed(2)}% house edge off the top and this bankroll, even a +7 count barely justifies more than 1 unit. A bigger bankroll, a smaller unit, or better rules would help.`
        : `Start raising at ${first ? (first.count > 0 ? '+' : '') + first.count : '+7'} and reach ${top} units. ${top >= cap ? `Your ${cap}-unit cap limits the top bets; ` : ''}Run the simulation to check the real risk, since the minimum bet at negative counts adds a little.`;
      Sound.play('select');
    };

    // ---- compare games ----------------------------------------------------------------------------------
    let cmp = []; try { cmp = JSON.parse(localStorage.getItem('ff-sim-cmp') || '[]'); } catch { cmp = []; }
    const label = x => `${x.decks}D ${x.h17 ? 'H17' : 'S17'} ${x.payout === 1.2 ? '6:5' : '3:2'} · ${x.penetration}% pen · 1–${Math.max(...x.spread.map(r => r.units * r.hands)) / Math.min(...x.spread.map(r => r.units * r.hands))} spread${x.wong > -20 ? ` · enter +${x.wong}` : ''}${x.playMode === 'deviations' ? ' · indices' : ''}`;
    const paintCmp = () => { $('#cmp-list').innerHTML = cmp.length ? cmp.map((x, i) => `<li><span>${esc(label(x))}</span><button type="button" class="small ghost" data-cmp-del="${i}" aria-label="Remove">${g('close')}</button></li>`).join('') : '<li class="muted">No setups yet.</li>'; $$('[data-cmp-del]').forEach(b => b.onclick = () => { cmp.splice(Number(b.dataset.cmpDel), 1); localStorage.setItem('ff-sim-cmp', JSON.stringify(cmp)); paintCmp(); }); };
    paintCmp();
    $('#cmp-add').onclick = () => { read(); if (cmp.length >= 6) { $('#cmp-out').innerHTML = '<p class="form-error">Compare up to 6 setups at once.</p>'; return; } cmp.push(JSON.parse(JSON.stringify(s))); localStorage.setItem('ff-sim-cmp', JSON.stringify(cmp)); paintCmp(); Sound.play('select'); };
    $('#cmp-clear').onclick = () => { cmp = []; localStorage.setItem('ff-sim-cmp', '[]'); paintCmp(); $('#cmp-out').innerHTML = ''; };
    $('#cmp-go').onclick = async () => {
      if (cmp.length < 2) { $('#cmp-out').innerHTML = '<p class="form-error">Add at least two setups to compare.</p>'; return; }
      const out = $('#cmp-out'), btn = $('#cmp-go'); btn.disabled = true; const rows = [];
      for (let i = 0; i < cmp.length; i++) {
        const x = cmp[i]; out.innerHTML = `<p class="muted"><span class="spinner"></span> Simulating setup ${i + 1} of ${cmp.length}…</p>`;
        const cfg = { bankroll: x.bankroll, unit: x.unit, rph: x.rph, decks: x.decks, penetration: x.penetration, h17: x.h17, das: x.das, surrender: x.surrender, rsa: x.rsa, payout: x.payout, wong: x.wong, wongOut: x.wongOut, rounds: 100000, seed: 7 + i, playMode: x.playMode, maxHands: x.maxHands, doubleRule: x.doubleRule, splitAces: x.splitAces, spread: x.spread };
        try {
          const job = await api('/api/simulate', 'POST', cfg); let st;
          do { await new Promise(r => setTimeout(r, 900)); if (!alive) return; st = await api('/api/simulate/' + job.id); } while (st.status === 'running');
          if (st.status === 'error') { rows.push({ x, error: st.error }); continue; }
          const r = st.result, pr = r.ev / x.rph, sr = r.sd / Math.sqrt(x.rph), di = r.ev > 0 ? 1000 * pr / sr : null;
          rows.push({ x, r, di, score: di ? di * di : null });
        } catch (e) { rows.push({ x, error: e.message }); }
      }
      btn.disabled = false;
      rows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || (b.r?.ev ?? -1e9) - (a.r?.ev ?? -1e9));
      out.innerHTML = `<div class="cmp-table-wrap"><table class="spread-table cmp-table"><thead><tr><th>#</th><th>Setup</th><th>Win/hour</th><th>SD/hour</th><th>Risk of ruin</th><th>SCORE</th><th>DI</th></tr></thead><tbody>${rows.map((w, i) => w.error ? `<tr><td>${i + 1}</td><td>${esc(label(w.x))}</td><td colspan="5" class="form-error">${esc(w.error)}</td></tr>` : `<tr class="${i === 0 && w.score ? 'best' : ''}"><td>${i + 1}</td><td>${esc(label(w.x))}</td><td>${money(w.r.ev)}</td><td>±${money(w.r.sd)}</td><td>${w.r.ev > 0 ? num(w.r.risk * 100, 1) + '%' : '100%'}</td><td>${w.score ? num(w.score, 1) : '—'}</td><td>${w.di ? num(w.di, 2) : '—'}</td></tr>`).join('')}</tbody></table></div><p class="field-hint">100,000 rounds each. SCORE and DI ignore bankroll and unit size, so they compare games fairly; win per hour and risk use each setup’s own bankroll.</p>`;
      Sound.play('reveal');
    };
    $('#sim-go').onclick = async () => {
      read();
      const out = $('#sim-out'), btn = $('#sim-go'), bad = problem();
      if (bad) { out.innerHTML = `<p class="form-error">${esc(bad)}</p>`; return; }
      const cfg = { bankroll: s.bankroll, unit: s.unit, rph: s.rph, decks: s.decks, penetration: s.penetration, h17: s.h17, das: s.das, surrender: s.surrender, rsa: s.rsa, payout: s.payout, wong: s.wong, wongOut: s.wongOut, rounds: s.rounds, seed: Math.floor(Math.random() * 1e6), playMode: s.playMode, maxHands: s.maxHands, doubleRule: s.doubleRule, splitAces: s.splitAces, spread: s.spread.map(r => ({ ...r })) };
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
          Sound.play('reveal'); last = { r: st.result, cfg }; show(st.result, cfg);
        };
        timer = setTimeout(poll, 500);
      } catch (e) { btn.disabled = false; $('#sim-status').textContent = ''; out.innerHTML = `<p class="form-error">${esc(e.message)}</p>`; }
    };

    function show(r, cfg) {
      const pos = r.ev > 0, risk = r.risk * 100;
      const perRound = r.ev / cfg.rph, sdRound = r.sd / Math.sqrt(cfg.rph);
      const di = pos ? 1000 * perRound / sdRound : null, score = pos ? di * di : null;
      const need = x => pos ? -Math.log(x) * r.sd * r.sd / (2 * r.ev) : null;
      const sentence = pos
        ? `With this plan you’d expect to win about <b>${money(r.ev)} an hour</b>, but any single hour swings by about <b>±${money(r.sd)}</b>. Your chance of losing the whole ${money(cfg.bankroll)} bankroll is about <b>${num(risk, 1)}%</b>, and it takes roughly <b>${num(r.n0)} hours</b> before skill reliably outweighs luck.`
        : `This plan loses about <b>${money(-r.ev)} an hour</b> on average, with swings of about <b>±${money(r.sd)}</b> per hour. ${cfg.spread.every(x => x.units === cfg.spread[0].units && x.hands === 1) ? 'That’s the house edge: basic strategy alone keeps it small but can’t beat it.' : 'At these rules or this spread, the count doesn’t overcome the house edge.'}`;
      const tile = (cls, label, value, sub) => `<div class="stat-tile ${cls}"><small>${label}</small><strong>${value}</strong><span>${sub}</span></div>`;
      $('#sim-out').innerHTML = `<section class="sim-card result"><h2 class="sim-step"><span>${g('check')}</span>What to expect</h2><p class="sim-sentence">${sentence}</p>
        <div class="plan-grid four">${tile(pos ? 'green' : 'orange', 'Win rate', money(r.ev), 'per hour')}${tile('blue', 'Swing (1 SD)', '±' + money(r.sd), 'per hour')}${tile('purple', 'Risk of ruin', pos ? num(risk, 1) + '%' : '100%', pos ? 'for this bankroll' : 'losing game')}${tile('yellow', 'N₀', pos ? num(r.n0) + ' h' : '—', 'hours to overcome luck')}</div>
        <h3 class="sim-sub">Pro numbers</h3>
        <div class="plan-grid four">${tile('teal', 'Player edge', (r.edge * 100).toFixed(2) + '%', 'of all money bet')}${tile('blue', 'Win per 100 rounds', money(perRound * 100), `${num(cfg.rph)} rounds an hour`)}${tile('purple', 'Average bet', money(r.averageInitial), `${num(r.averageInitial / cfg.unit, 1)} units, rounds played`)}${tile('green', 'Rounds played', num(r.played / r.rounds * 100) + '%', r.played < r.rounds ? 'the rest back-counted' : 'every round')}
        ${tile('orange', 'SCORE', pos ? num(score, 1) : '—', 'win/100 rounds at $10k, 13.5% risk')}${tile('yellow', 'DI', pos ? num(di, 2) : '—', 'desirability index')}${tile('pink', 'Bankroll for 5% risk', pos ? money(need(.05)) : '—', `1% risk: ${pos ? money(need(.01)) : '—'}`)}${tile('teal', 'Shoes dealt', num(r.shoes), `${num(r.rounds)} rounds`)}</div>
        <h3 class="sim-sub">Plan a trip</h3>
        <div class="trip"><label class="sim-field"><span>Hours you’ll play</span><input id="trip-h" type="number" min="1" max="10000" value="${s.hours}"></label><p id="trip-out"></p></div>
        <h3 class="sim-sub">One simulated run</h3>${lineChart(r.trajectory)}<p class="field-hint">Net ${money(r.profit)} over ${num(r.rounds)} rounds (${num(r.rounds / cfg.rph)} hours). The 95% range for the hourly win rate is ${money(r.ci[0])} to ${money(r.ci[1])}. Risk, N₀, SCORE, and DI are standard approximations, not guarantees. ${esc(r.model || '')}</p>
        <div class="flex"><button type="button" class="small" id="sim-export">${g('book')} Export results</button></div></section>`;
      const trip = () => { const h = Math.max(1, Number($('#trip-h').value) || 1); s.hours = h; localStorage.setItem('ff-sim2', JSON.stringify(s)); const ev = r.ev * h, sd = r.sd * Math.sqrt(h); $('#trip-out').innerHTML = `Expect <b>${money(ev)}</b>, but two times in three you’ll land between <b>${money(ev - sd)}</b> and <b>${money(ev + sd)}</b>, and 19 times in 20 between ${money(ev - 2 * sd)} and ${money(ev + 2 * sd)}. ${ev - 2 * sd < -cfg.bankroll * .5 ? 'A bad trip could cost over half your bankroll.' : ''}`; };
      $('#trip-h').oninput = trip; trip();
      $('#sim-export').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ settings: cfg, result: r }, null, 2)], { type: 'application/json' })); a.download = 'simulation.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
      $('#sim-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
}
