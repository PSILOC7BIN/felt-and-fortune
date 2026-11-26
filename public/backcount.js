// Back-counting two tables: watch two shoes at once without playing, keep both running counts, and decide which
// table (if either) is worth sitting down at. The skill behind wonging. Count answers are graded on the server.
import { esc, $, $$, g, ace, Sound, cardHTML, mountNumber, feltPrint } from './ui.js';
import { startRound, loadEconomy, confetti } from './economy.js';
import * as bj from './bj.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const ROUNDS = 6;
const SPEEDS = { slow: 900, medium: 650, fast: 420 };

export async function backcountPage(ctx) {
  const { api, go, localDate, onCleanup } = ctx;
  let saved = {}; try { saved = JSON.parse(localStorage.getItem('ff-backcount') || '{}'); } catch { saved = {}; }
  const cfg = { speed: 'medium', entry: 2, ...saved };
  let alive = true, keyHandler = null;
  const onKey = e => keyHandler?.(e); document.addEventListener('keydown', onKey);
  onCleanup(() => { alive = false; document.removeEventListener('keydown', onKey); });
  $('#app').innerHTML = `<main id="main" class="coach-screen practice c-teal"><header class="coach-top practice-top"><button type="button" class="icon-btn" id="bc-quit" aria-label="Leave">${g('close')}</button><div class="pr-title"><span class="tool-icon sm">${g('count')}</span><div><strong>Back-count two tables</strong><small>Watch both shoes, enter the better one</small></div></div><div class="pr-stats"><span class="chip"><b id="bc-n">0/${ROUNDS}</b></span></div></header>
    <div class="round-bar" aria-hidden="true"><span id="bc-fill"></span></div><section class="coach-body bc-body" id="coach-body"></section><footer class="coach-foot" id="coach-foot"></footer></main>`;
  const body = $('#coach-body'), foot = $('#coach-foot');
  $('#bc-quit').onclick = () => go('/tools');

  function setup() {
    const seg = (k, label, opts) => `<div class="seg-group"><span>${label}</span><div class="segmented" role="radiogroup" aria-label="${label}">${opts.map(([v, t]) => `<button type="button" role="radio" data-bc="${k}" data-v="${v}" aria-checked="${String(cfg[k]) === String(v)}">${t}</button>`).join('')}</div></div>`;
    body.innerHTML = `<div class="coach-intro">${ace('think', 'ace-lg bob')}<h1>Back-count two tables</h1><p>Counters often stand behind a table and count without playing, then sit down only when the count is good. Here you watch two six-deck shoes at once. After each burst of cards, give both running counts and pick the table to enter.</p>
      <div class="settings-bar bc-set">${seg('speed', 'Card speed', [['slow', 'Slow'], ['medium', 'Medium'], ['fast', 'Fast']])}${seg('entry', 'Enter at true count', [[1, '+1'], [2, '+2'], [3, '+3']])}</div></div>`;
    $$('[data-bc]').forEach(b => b.onclick = () => { cfg[b.dataset.bc] = b.dataset.bc === 'entry' ? Number(b.dataset.v) : b.dataset.v; localStorage.setItem('ff-backcount', JSON.stringify(cfg)); Sound.play('select'); setup(); });
    foot.className = 'coach-foot'; foot.innerHTML = `<span class="foot-hint">${ROUNDS} rounds · 1 Energy</span><button type="button" class="primary chunky" id="bc-go">Start</button>`;
    $('#bc-go').onclick = start;
  }

  async function start() {
    const roundId = await startRound(ctx, 'backcount');
    if (!roundId) { setup(); return; }
    const shoe = () => bj.shuffle(Array.from({ length: 312 }, (_, i) => i % 13 + 1));
    const T = [{ shoe: shoe(), rc: 0 }, { shoe: shoe(), rc: 0 }];
    // Start each shoe partway through so the counts aren't always 0.
    for (const t of T) { const pre = 40 + Math.floor(Math.random() * 80); for (let i = 0; i < pre; i++) t.rc += bj.hilo(t.shoe.pop()); }
    const results = [], tally = { counts: 0, right: 0, picks: 0, pickRight: 0 };
    const started = Date.now();
    body.innerHTML = `<div class="coach-intro"><h2>Both tables are mid-shoe.</h2><p>Table A is at <b>${bj.signed(T[0].rc)}</b> and Table B at <b>${bj.signed(T[1].rc)}</b>. Count on from there.</p></div>`;
    foot.innerHTML = '<span class="foot-hint">Get ready…</span>'; await sleep(2600);
    for (let r = 0; r < ROUNDS && alive; r++) {
      $('#bc-n').textContent = `${r + 1}/${ROUNDS}`; $('#bc-fill').style.width = `${r / ROUNDS * 100}%`;
      const starts = T.map(t => t.rc);
      const deals = T.map(() => 6 + Math.floor(Math.random() * 8 + r));
      body.innerHTML = `<div class="bc-tables">${T.map((t, i) => `<div class="bc-table felt-table" data-t="${i}">${feltPrint({ spots: false })}<span class="bc-name">Table ${'AB'[i]}</span><div class="bc-card"></div><span class="bc-left">${bj.halves(Math.round(t.shoe.length / 26) / 2)} decks left</span></div>`).join('')}</div>`;
      foot.innerHTML = '<span class="foot-hint">Keep both counts</span>';
      const seen = [[], []], order = [];
      for (let i = 0; i < Math.max(...deals); i++) for (let k = 0; k < 2; k++) if (i < deals[k]) order.push(k);
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); if (Math.abs(i - j) < 3) [order[i], order[j]] = [order[j], order[i]]; }
      await sleep(500);
      for (const k of order) { if (!alive) return; const c = T[k].shoe.pop(); T[k].rc += bj.hilo(c); seen[k].push(c); $(`[data-t="${k}"] .bc-card`, body).innerHTML = cardHTML(c, 0, { cls: 'flash-in' }); Sound.play('deal'); await sleep(SPEEDS[cfg.speed]); $(`[data-t="${k}"] .bc-card`, body).innerHTML = ''; }
      const left = T.map(t => Math.max(0.5, Math.round(t.shoe.length / 26) / 2)), tcs = T.map((t, i) => Math.floor(t.rc / left[i]));
      const best = tcs[0] >= cfg.entry || tcs[1] >= cfg.entry ? (tcs[0] >= tcs[1] ? 0 : 1) : 2;
      const answer = await new Promise(resolve => {
        body.innerHTML = `<div class="q bc-ask"><h1 class="q-title">Running counts?</h1><div class="bc-inputs">${T.map((_, i) => `<label><span>Table ${'AB'[i]} · ${bj.halves(left[i])} decks left</span><div class="answer-slot" data-slot="${i}"></div></label>`).join('')}</div>
          <p class="q-eyebrow">Which table do you sit at? (enter at a true count of ${bj.signed(cfg.entry)} or better)</p><div class="segmented bc-pick" role="radiogroup" aria-label="Table to enter">${['Table A', 'Table B', 'Neither'].map((t, i) => `<button type="button" role="radio" data-pick="${i}" aria-checked="false">${t}</button>`).join('')}</div></div>`;
        let pick = null;
        const n = [0, 1].map(i => mountNumber($(`[data-slot="${i}"]`, body), { label: `Table ${'AB'[i]} running count`, onChange: ready }));
        function ready() { $('#bc-check').disabled = n.some(x => x.value === null) || pick === null; }
        $$('[data-pick]', body).forEach(b => b.onclick = () => { pick = Number(b.dataset.pick); $$('[data-pick]', body).forEach(x => x.setAttribute('aria-checked', String(x === b))); ready(); });
        foot.innerHTML = '<span class="foot-hint">Both counts, then a table</span><button type="button" class="primary chunky" id="bc-check" disabled>Check</button>';
        const go2 = () => { if (!$('#bc-check').disabled) { keyHandler = null; resolve({ counts: n.map(x => x.value), pick }); } };
        $('#bc-check').onclick = go2; keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); go2(); } };
      });
      answer.counts.forEach((v, i) => { results.push({ kind: 'count', data: { cards: seen[i], start: starts[i] }, given: v }); tally.counts++; if (v === T[i].rc) tally.right++; });
      tally.picks++; if (answer.pick === best) tally.pickRight++;
      const allOk = answer.counts.every((v, i) => v === T[i].rc) && answer.pick === best;
      Sound.play(allOk ? 'correct' : 'wrong');
      body.innerHTML = `<div class="q"><h1 class="q-title">${allOk ? `${g('check')} All right` : 'Round results'}</h1><ul class="results-list">${T.map((t, i) => `<li class="${answer.counts[i] === t.rc ? 'ok' : 'bad'}">${g(answer.counts[i] === t.rc ? 'check' : 'close')}<span>Table ${'AB'[i]}</span><b>${bj.signed(t.rc)} running · ${bj.signed(tcs[i])} true</b></li>`).join('')}<li class="${answer.pick === best ? 'ok' : 'bad'}">${g(answer.pick === best ? 'check' : 'close')}<span>Best move</span><b>${best === 2 ? 'Keep watching: neither table is at ' + bj.signed(cfg.entry) : `Sit at Table ${'AB'[best]}`}</b></li></ul><p class="muted small">Counts carry on from the right numbers.</p></div>`;
      foot.innerHTML = `<span></span><button type="button" class="primary chunky" id="bc-next">${r + 1 < ROUNDS ? 'Next round' : 'See results'}</button>`;
      await new Promise(res => { $('#bc-next').onclick = res; keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); keyHandler = null; res(); } }; });
    }
    if (!alive) return;
    let r = { xp: 0 };
    try { r = await api('/api/practice/log', 'POST', { tool: 'backcount', round: roundId, results, bestStreak: 0, seconds: Math.round((Date.now() - started) / 1000), day: localDate() }); } catch { /* still show the summary */ }
    await loadEconomy(api, localDate);
    const pct = Math.round(100 * (tally.right + tally.pickRight) / (tally.counts + tally.picks));
    Sound.play('complete'); if (pct >= 90) confetti({ count: 60 });
    $('#bc-fill').style.width = '100%';
    body.innerHTML = `<div class="lesson-done">${ace(pct >= 90 ? 'wow' : 'happy', 'ace-xl pop')}<h1>${pct >= 90 ? 'Sharp eyes!' : 'Session done'}</h1><div class="plan-grid three"><div class="stat-tile purple"><small>Counts right</small><strong>${tally.right}/${tally.counts}</strong></div><div class="stat-tile teal"><small>Right table</small><strong>${tally.pickRight}/${tally.picks}</strong></div><div class="stat-tile yellow"><small>XP</small><strong>+${r.xp || 0}</strong></div></div></div>`;
    foot.innerHTML = `<a class="button ghost" href="/tools">Back to Tools</a><button type="button" class="primary chunky" id="bc-again">Again</button>`;
    $('#bc-again').onclick = setup;
  }
  setup();
}
