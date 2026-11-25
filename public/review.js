// Proof of learning: skill ratings (Elo-style, per skill) and Hand Review of the exact decisions you missed.
import { esc, $, $$, g, ace, Sound, tableHTML, cardHTML } from './ui.js';
import { react } from './reactions.js';
import { paywall } from './economy.js';
import { whyHTML } from './ev.js';

const TIER_COLOR = { Beginner: '#8E8E93', Learner: '#0A84FF', Solid: '#34C759', Sharp: '#AF52DE', Expert: '#FF9F0A' };
const ACTIONS = [['H', 'Hit'], ['S', 'Stand'], ['D', 'Double'], ['P', 'Split'], ['R', 'Surrender']];

export function ratingBadge(s) {
  if (!s || s.overall == null) return '';
  const ch = s.change ? `<small class="${s.change > 0 ? 'up' : 'down'}">${s.change > 0 ? '▲' : '▼'} ${Math.abs(s.change)}</small>` : '';
  return `<span class="rating-badge" style="--tc:${TIER_COLOR[s.tier]}"><b>${s.overall}</b><span>${s.tier}</span>${ch}</span>`;
}

/** Sidebar card on Learn. */
export function skillsCard(s) {
  if (!s) return '';
  if (s.overall == null) return `<a class="side-card skills-card" href="/profile#skills"><div class="side-head"><h3>${g('chart')} Skill rating</h3></div><p class="muted small">Answer a few more questions and your skill rating appears here. It rises with correct decisions, more for harder ones.</p></a>`;
  const top = s.skills.filter(x => x.n >= 5).sort((a, b) => a.rating - b.rating).slice(0, 3);
  return `<a class="side-card skills-card" href="/profile#skills"><div class="side-head"><h3>${g('chart')} Skill rating</h3>${ratingBadge(s)}</div>
    ${top.length ? `<p class="muted small">Your three lowest skills:</p>${top.map(x => `<div class="skill-line"><span>${esc(x.name)}</span><b>${x.rating}</b></div>`).join('')}` : ''}</a>`;
}

/** Full panel on Profile. */
export function skillsPanel(s) {
  if (!s) return '';
  const max = 1700, min = 700;
  const spark = s.history.length > 1 ? (() => {
    const vals = s.history.map(h => h.overall), lo = Math.min(...vals) - 20, hi = Math.max(...vals) + 20;
    const pts = vals.map((v, i) => `${(i / (vals.length - 1) * 100).toFixed(1)},${(30 - (v - lo) / (hi - lo) * 30).toFixed(1)}`).join(' ');
    return `<svg class="rating-spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-label="Rating over time"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
  })() : '';
  return `<section class="panel mt" id="skills"><div class="side-head"><h3>Skill ratings</h3>${ratingBadge(s)}</div>
    <p class="muted">Each skill has its own rating. It goes up when you get a decision right, more for harder ones, and down when you miss. Tiers: Beginner, Learner (900), Solid (1100), Sharp (1300), Expert (1500).</p>${spark}
    <div class="skill-bars">${s.skills.map(x => `<div class="skill-bar"><span>${esc(x.name)}</span><div class="bar"><i style="width:${x.rating ? Math.max(4, (x.rating - min) / (max - min) * 100) : 0}%;--tc:${TIER_COLOR[x.tier] || '#C7C7CC'}"></i></div><b>${x.n >= 5 ? x.rating : x.n ? '…' : '—'}</b></div>`).join('')}</div>
    <p class="muted small">“…” means fewer than 5 answers so far.</p></section>`;
}

function scenario(m) {
  const d = m.data;
  if (['strategy', 'index', 'play'].includes(m.kind)) return `${tableHTML({ dealer: d.dealer, cards: d.cards })}${m.kind !== 'strategy' ? `<p class="tc-note">True count ${d.tc > 0 ? '+' : ''}${d.tc}</p>` : ''}`;
  if (m.kind === 'insurance') return `<p class="scenario">Dealer shows an ace. True count ${d.tc > 0 ? '+' : ''}${d.tc}. Insurance?</p>`;
  if (m.kind === 'count') return `<div class="mini-run">${(d.cards || []).map((c, i) => cardHTML(c, i)).join('')}</div><p class="scenario">Running count after these cards${d.start ? ` (starting at ${d.start})` : ''}?</p>`;
  if (m.kind === 'truecount') return `<p class="scenario">Running count ${d.rc}, ${d.decks} decks left. True count?</p>`;
  if (m.kind === 'decks') return `<p class="scenario">${d.shoe}-deck shoe, ${d.tray} decks in the discard tray. ${d.ask === 'remaining' ? 'Decks left to play?' : 'Decks in the tray?'}</p>`;
  if (m.kind === 'bet') return `<p class="scenario">True count ${d.tc > 0 ? '+' : ''}${d.tc}, ramp tops out at ${d.max || 12} units. Bet?</p>`;
  if (m.kind === 'choice') return `<p class="scenario">${esc(d.prompt || 'Concept question')}</p>`;
  return '';
}

function answerUI(m) {
  if (['strategy', 'index', 'play'].includes(m.kind)) return `<div class="retry-actions">${ACTIONS.filter(([k]) => (k !== 'R' || m.data.surrender) && (k !== 'P' || (m.data.cards?.length === 2 && Math.min(m.data.cards[0], 10) === Math.min(m.data.cards[1], 10))) && (k !== 'D' || (m.data.cards || []).length === 2)).map(([k, t]) => `<button type="button" data-give="${k}">${t}</button>`).join('')}</div>`;
  if (m.kind === 'insurance') return `<div class="retry-actions"><button type="button" data-give="Y">Take insurance</button><button type="button" data-give="N">No insurance</button></div>`;
  if (m.kind === 'choice') return `<div class="retry-actions"><button type="button" data-dismiss>Got it</button></div>`;
  return `<form class="retry-num"><input type="number" step="${m.kind === 'decks' ? '0.5' : '1'}" aria-label="Your answer" required><button type="submit">Check</button></form>`;
}

const FULL = { H: 'Hit', S: 'Stand', D: 'Double', P: 'Split', R: 'Surrender', Y: 'Take insurance', N: 'No insurance' };
/** After a retry: was it right, what you said the first time, the reason, and for strategy hands the value of every play. */
function feedback(m, given, res) {
  const shown = v => esc(FULL[v] || String(v ?? '—'));
  const why = m.kind === 'strategy' && m.data?.cards ? whyHTML(m.data.cards, m.data.dealer, { h17: !!m.data.h17, surrender: !!m.data.surrender, das: m.data.das !== false }, given) : '';
  return `<p><b>${res.ok ? 'Right!' : `Not quite: ${esc(res.answer)}.`}</b> The first time you said <b>${esc(m.given || '—')}</b>${res.ok ? '' : `, and now ${shown(given)}`}.</p>${m.explain ? `<p class="muted">${esc(m.explain)}</p>` : ''}${why}`;
}

/** Retry mode: every missed decision, one at a time, full screen. Choose first, then see the answer and the math. */
function retryRun(ctx, list, back) {
  const { api } = ctx;
  let i = 0, right = 0;
  ctx.$('#app').innerHTML = `<main id="main" class="coach-screen practice c-red"><header class="coach-top practice-top"><button type="button" class="icon-btn" id="rr-quit" aria-label="Back to Hand Review">${g('close')}</button><div class="pr-title"><span class="tool-icon sm">${g('book')}</span><div><strong>Hand Review</strong><small>Find the right play, then see why</small></div></div><div class="pr-stats"><span class="chip"><b id="rr-n"></b></span></div></header>
    <div class="round-bar" aria-hidden="true"><span id="rr-fill"></span></div><section class="coach-body" id="coach-body"></section><footer class="coach-foot" id="coach-foot"></footer></main>`;
  const body = $('#coach-body'), foot = $('#coach-foot');
  const leave = () => ctx.go('/practice/review');
  $('#rr-quit').onclick = leave;
  const show = () => {
    if (i >= list.length) {
      Sound.play('complete');
      body.innerHTML = `<div class="lesson-done">${ace(right === list.length ? 'wow' : 'happy', 'ace-xl pop')}<h1>${right === list.length ? 'All fixed!' : 'Review done'}</h1><p class="muted">${right} of ${list.length} right on the retry. Those are cleared; the rest stay for next time.</p></div>`;
      foot.className = 'coach-foot'; foot.innerHTML = `<span></span><button type="button" class="primary chunky" id="rr-done">Back to Hand Review</button>`; $('#rr-done').onclick = leave; return;
    }
    const m = list[i];
    $('#rr-n').textContent = `${i + 1}/${list.length}`; $('#rr-fill').style.width = `${i / list.length * 100}%`;
    body.innerHTML = `<div class="q"><p class="q-eyebrow">Missed on ${esc(m.day)}${m.data?.h17 ? ' · Dealer hits soft 17' : ''}${m.data?.surrender ? ' · Surrender allowed' : ''}</p>${scenario(m)}${answerUI(m)}<div class="retry-result rr" aria-live="polite"></div></div>`;
    foot.className = 'coach-foot'; foot.innerHTML = '<span class="foot-hint">Choose your play. The answer shows after.</span>';
    const send = async given => {
      $$('[data-give], .retry-num button', body).forEach(b => { b.disabled = true; });
      let res; try { res = await api('/api/review/retry', 'POST', { id: m.id, given }); } catch (e) { ctx.toast(e.message); return; }
      if (res.ok) right++;
      Sound.play(res.ok ? 'correct' : 'wrong'); react(res.ok, { anchor: body });
      const out = $('.retry-result', body); out.className = 'retry-result rr ' + (res.ok ? 'ok' : 'bad'); out.innerHTML = feedback(m, given, res);
      $('.retry-actions, .retry-num', body)?.remove();
      foot.className = 'coach-foot ' + (res.ok ? 'ok' : 'bad'); foot.innerHTML = `<span class="foot-hint">${res.ok ? 'Cleared from your review.' : 'It stays in your review for next time.'}</span><button type="button" class="primary chunky" id="rr-next">${i + 1 < list.length ? 'Next hand' : 'Finish'}</button>`;
      $('#rr-next').onclick = () => { i++; show(); }; $('#rr-next').focus();
    };
    $$('[data-give]', body).forEach(b => b.onclick = () => send(b.dataset.give));
    $('.retry-num', body)?.addEventListener('submit', e => { e.preventDefault(); const inp = $('input', body); send(inp.step === '0.5' ? Number(inp.value) : parseInt(inp.value, 10)); });
  };
  show();
}

export async function reviewPage(ctx) {
  const { api } = ctx;
  let filter = new URLSearchParams(location.search).get('skill') || '';
  const paint = async () => {
    const r = await api('/api/review' + (filter ? '?skill=' + encodeURIComponent(filter) : ''));
    const names = { 'strategy-hard': 'Hard totals', 'strategy-soft': 'Soft totals', 'strategy-pair': 'Pairs', count: 'Running count', decks: 'Deck estimation', truecount: 'True count', index: 'Index plays', insurance: 'Insurance', bet: 'Bet sizing', concept: 'Concepts' };
    ctx.$('#page').innerHTML = `<div class="review-page"><header class="page-hero"><div><h1>Hand Review</h1><p class="muted">The exact decisions you missed, with the right answer. Get one right on a retry and it’s cleared.</p></div><div class="flex">${r.mistakes.some(m => m.kind !== 'choice') ? `<button type="button" class="button primary" id="retry-all">${g('target')} Retry all</button>` : ''}<a class="button" href="/practice/weakness">${g('chart')} Weakness map</a></div></header>
      ${Object.keys(r.bySkill).length ? `<div class="chip-row"><button type="button" class="chip-toggle" data-skill="" aria-pressed="${!filter}">All (${r.open})</button>${Object.entries(r.bySkill).map(([k, n]) => `<button type="button" class="chip-toggle" data-skill="${k}" aria-pressed="${filter === k}">${esc(names[k] || k)} (${n})</button>`).join('')}</div>` : ''}
      ${r.mistakes.length ? `<div class="review-list">${r.mistakes.map(m => `<article class="review-card" data-id="${m.id}"><header><span class="pill">${esc(names[m.skill] || m.skill)}</span><small class="muted">${esc(m.day)}</small></header>${scenario(m)}
        <p class="find-first">${m.kind === 'choice' ? 'You missed this concept.' : 'Find the right play first. The answer shows after you choose.'}</p>
        ${answerUI(m)}<div class="retry-result" aria-live="polite"></div>${m.kind === 'choice' ? `<details><summary>Show the answer</summary><p>The right answer is <b>${esc(m.answer || '—')}</b>.</p>${m.explain ? `<p class="muted">${esc(m.explain)}</p>` : ''}</details>` : ''}</article>`).join('')}</div>`
        : `<div class="empty-review">${ace('cheer', 'ace-lg')}<h2>No missed hands</h2><p class="muted">Every decision you miss in lessons and practice shows up here so you can fix it.</p></div>`}
      ${r.limited ? `<button type="button" class="pro-banner" id="review-pro">${g('crown')}<span><strong>${r.open - r.freeLimit} more missed hands to review</strong><small>Free shows your ${r.freeLimit} most recent. Pro shows your full history.</small></span>${g('next')}</button>` : ''}</div>`;
    $$('[data-skill]').forEach(b => b.onclick = () => { filter = b.dataset.skill; history.replaceState(null, '', '/practice/review' + (filter ? '?skill=' + filter : '')); paint(); });
    $('#review-pro')?.addEventListener('click', () => paywall(ctx, 'Pro shows every hand you’ve missed, so you can fix them all.'));
    $('#retry-all')?.addEventListener('click', () => retryRun(ctx, r.mistakes.filter(m => m.kind !== 'choice'), paint));
    $$('.review-card').forEach(card => {
      const id = Number(card.dataset.id), out = $('.retry-result', card), m = r.mistakes.find(x => x.id === id);
      const send = async given => {
        try {
          const res = await api('/api/review/retry', 'POST', { id, given });
          Sound.play(res.ok ? 'correct' : 'wrong'); react(res.ok, { anchor: card });
          out.innerHTML = feedback(m, given, res);
          out.className = 'retry-result ' + (res.ok ? 'ok' : 'bad');
          $$('[data-give], .retry-num button', card).forEach(b => { b.disabled = true; });
          if (res.ok) { const done = document.createElement('button'); done.type = 'button'; done.className = 'small'; done.textContent = 'Clear it'; done.onclick = () => { card.classList.add('cleared'); setTimeout(() => card.remove(), 400); }; out.append(done); }
          else { const again = document.createElement('button'); again.type = 'button'; again.className = 'small'; again.textContent = 'Try again later'; again.onclick = () => { out.innerHTML = ''; $$('[data-give], .retry-num button', card).forEach(b => { b.disabled = false; }); }; out.append(again); }
        } catch (e) { ctx.toast(e.message); }
      };
      $$('[data-give]', card).forEach(b => b.onclick = () => send(b.dataset.give));
      $('[data-dismiss]', card)?.addEventListener('click', async () => { await api('/api/review/dismiss', 'POST', { id }); card.remove(); });
      $('.retry-num', card)?.addEventListener('submit', e => { e.preventDefault(); const v = $('input', card).value; send(card.querySelector('input').step === '0.5' ? Number(v) : parseInt(v, 10)); });
    });
  };
  await paint();
}
