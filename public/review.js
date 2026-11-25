// Proof of learning: skill ratings (Elo-style, per skill) and Hand Review of the exact decisions you missed.
import { esc, $, $$, g, ace, Sound, tableHTML, cardHTML } from './ui.js';
import { react } from './reactions.js';
import { paywall } from './economy.js';

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
  if (['strategy', 'index', 'play'].includes(m.kind)) return `<div class="retry-actions">${ACTIONS.filter(([k]) => k !== 'R' || m.data.surrender).map(([k, t]) => `<button type="button" data-give="${k}">${t}</button>`).join('')}</div>`;
  if (m.kind === 'insurance') return `<div class="retry-actions"><button type="button" data-give="Y">Take insurance</button><button type="button" data-give="N">No insurance</button></div>`;
  if (m.kind === 'choice') return `<div class="retry-actions"><button type="button" data-dismiss>Got it</button></div>`;
  return `<form class="retry-num"><input type="number" step="${m.kind === 'decks' ? '0.5' : '1'}" aria-label="Your answer" required><button type="submit">Check</button></form>`;
}

export async function reviewPage(ctx) {
  const { api } = ctx;
  let filter = new URLSearchParams(location.search).get('skill') || '';
  const paint = async () => {
    const r = await api('/api/review' + (filter ? '?skill=' + encodeURIComponent(filter) : ''));
    const names = { 'strategy-hard': 'Hard totals', 'strategy-soft': 'Soft totals', 'strategy-pair': 'Pairs', count: 'Running count', decks: 'Deck estimation', truecount: 'True count', index: 'Index plays', insurance: 'Insurance', bet: 'Bet sizing', concept: 'Concepts' };
    ctx.$('#page').innerHTML = `<div class="review-page"><header class="page-hero"><div><h1>Hand Review</h1><p class="muted">The exact decisions you missed, with the right answer. Get one right on a retry and it’s cleared.</p></div><a class="button" href="/practice/weak">${g('target')} Drill weak spots</a></header>
      ${Object.keys(r.bySkill).length ? `<div class="chip-row"><button type="button" class="chip-toggle" data-skill="" aria-pressed="${!filter}">All (${r.open})</button>${Object.entries(r.bySkill).map(([k, n]) => `<button type="button" class="chip-toggle" data-skill="${k}" aria-pressed="${filter === k}">${esc(names[k] || k)} (${n})</button>`).join('')}</div>` : ''}
      ${r.mistakes.length ? `<div class="review-list">${r.mistakes.map(m => `<article class="review-card" data-id="${m.id}"><header><span class="pill">${esc(names[m.skill] || m.skill)}</span><small class="muted">${esc(m.day)}</small></header>${scenario(m)}
        <details><summary>Show what you answered and the right answer</summary><p>You said <b>${esc(m.given || '—')}</b>. The right answer is <b>${esc(m.answer || '—')}</b>.</p>${m.explain ? `<p class="muted">${esc(m.explain)}</p>` : ''}</details>
        ${answerUI(m)}<p class="retry-result" aria-live="polite"></p></article>`).join('')}</div>`
        : `<div class="empty-review">${ace('cheer', 'ace-lg')}<h2>No missed hands</h2><p class="muted">Every decision you miss in lessons and practice shows up here so you can fix it.</p></div>`}
      ${r.limited ? `<button type="button" class="pro-banner" id="review-pro">${g('crown')}<span><strong>${r.open - r.freeLimit} more missed hands to review</strong><small>Free shows your ${r.freeLimit} most recent. Pro shows your full history.</small></span>${g('next')}</button>` : ''}</div>`;
    $$('[data-skill]').forEach(b => b.onclick = () => { filter = b.dataset.skill; history.replaceState(null, '', '/practice/review' + (filter ? '?skill=' + filter : '')); paint(); });
    $('#review-pro')?.addEventListener('click', () => paywall(ctx, 'Pro shows every hand you’ve missed, so you can fix them all.'));
    $$('.review-card').forEach(card => {
      const id = Number(card.dataset.id), out = $('.retry-result', card);
      const send = async given => {
        try {
          const res = await api('/api/review/retry', 'POST', { id, given });
          Sound.play(res.ok ? 'correct' : 'wrong'); react(res.ok, { anchor: card });
          out.textContent = res.ok ? 'Right! Cleared from your review.' : `Not quite. The right answer is ${res.answer}.`;
          out.className = 'retry-result ' + (res.ok ? 'ok' : 'bad');
          if (res.ok) { card.classList.add('cleared'); setTimeout(() => { card.remove(); }, 1200); }
        } catch (e) { ctx.toast(e.message); }
      };
      $$('[data-give]', card).forEach(b => b.onclick = () => send(b.dataset.give));
      $('[data-dismiss]', card)?.addEventListener('click', async () => { await api('/api/review/dismiss', 'POST', { id }); card.remove(); });
      $('.retry-num', card)?.addEventListener('submit', e => { e.preventDefault(); const v = $('input', card).value; send(card.querySelector('input').step === '0.5' ? Number(v) : parseInt(v, 10)); });
    });
  };
  await paint();
}
