// Daily Hand, Blackjack Rush, and Count Storm. The server picks, times, and grades every question.
import { esc, $, $$, g, ace, Sound, tableHTML, cardHTML, mountNumber } from './ui.js';
import { react } from './reactions.js';
import { whyHTML } from './ev.js';
import { paywall, confetti } from './economy.js';
import * as bj from './bj.js';

const ACT = bj.ACTIONS;
const rulesLine = r => `${r.h17 ? 'Dealer hits soft 17' : 'Dealer stands on soft 17'}${r.surrender ? ' · Surrender allowed' : ''}`;
const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
const vs = up => (up === 1 ? 'an ace' : 'a ' + bj.upName(up));
const actionRow = acts => `<div class="action-row">${acts.map(a => `<button type="button" class="act act-${a}" data-act="${a}"><span>${ACT[a]}</span><kbd>${a}</kbd></button>`).join('')}</div>`;

// ---- Daily Hand --------------------------------------------------------------------------------
/** Small card for the Learn sidebar and the Practice hub. */
export async function dailyCard(api, localDate, tile = false) {
  let d; try { d = await api('/api/daily?day=' + localDate()); } catch { return ''; }
  if (tile) return `<a class="weak-card daily-tile${d.given ? ' done' : ''}" href="/practice/daily"><span class="tool-icon">${g('star')}</span><span class="tool-copy"><strong>Daily Hand${d.streak ? ` · ${g('flame')} ${d.streak}` : ''}</strong><span>${d.given ? (d.ok ? 'Done for today. See how everyone played it.' : 'Done for today. See the math and the split.') : `${esc(bj.handLabel(d.cards))} vs ${d.dealer === 1 ? 'A' : bj.upName(d.dealer)}. One hand, same for everyone.`}</span></span>${g('next', 'tool-go')}</a>`;
  return `<a class="side-card daily-card${d.given ? ' done' : ''}" href="/practice/daily"><div class="side-head"><h3>${g('star')} Daily Hand</h3>${d.streak ? `<span class="chip">${g('flame')} ${d.streak}</span>` : ''}</div><p class="muted small">${d.given ? (d.ok ? 'You got today’s hand. See how everyone else did.' : 'Today’s hand is done. See the math and the community split.') : `${esc(bj.handLabel(d.cards))} against ${vs(d.dealer)}. One hand, everyone gets the same one. What’s your play?`}</p></a>`;
}

export async function dailyPage(ctx) {
  const { api, localDate } = ctx;
  const d = await api('/api/daily?day=' + localDate());
  const paint = r => {
    const done = r.given != null;
    const split = done ? Object.entries(r.split || {}).sort((a, b) => b[1] - a[1]) : [];
    $('#page').innerHTML = `<a class="back-link" href="/practice">${g('back')} Practice</a>
      <header class="page-hero"><div><h1>Daily Hand</h1><p>Everyone gets the same hand today. Answer once, then see the math and how the community played it. ${r.streak ? `${g('flame')} ${r.streak}-day streak.` : ''}</p></div></header>
      <section class="daily-wrap"><div class="q"><p class="q-eyebrow">${esc(rulesLine(r.rules))}</p><h1 class="q-title">You have ${esc(bj.handLabel(r.cards))} against ${vs(r.dealer)}.</h1>${tableHTML({ dealer: r.dealer, cards: r.cards })}
        ${done ? '' : actionRow(r.actions)}</div>
        ${done ? `<div class="daily-result ${r.ok ? 'ok' : 'bad'}"><h2>${r.ok ? `${g('check')} Right: ${ACT[r.answer]}` : `Not quite: ${ACT[r.answer]}`}${r.xp ? ` <span class="chip">+${r.xp} XP</span>` : ''}</h2>
          <p>${esc(bj.strategyReason(r.cards, r.dealer, r.answer, r.rules))}</p>
          ${r.cards.length === 2 ? whyHTML(r.cards, r.dealer, r.rules, r.given) : ''}
          <h3 class="sim-sub">How ${r.n} player${r.n === 1 ? '' : 's'} played it</h3>
          <ul class="daily-split">${split.map(([a, p]) => `<li class="${a === r.answer ? 'best' : ''}${a === r.given ? ' mine' : ''}"><span>${ACT[a]}${a === r.given ? ' (you)' : ''}</span><span class="bar"><i style="width:${p}%"></i></span><b>${p}%</b></li>`).join('')}</ul>
          <p class="muted small">${(r.split?.[r.answer] ?? 0) < 60 ? 'Most people miss this one. That’s why it’s today’s hand.' : 'Most players got this one.'} A new hand arrives at midnight.</p>
          <div class="flex"><a class="button primary" href="/tools/rush">${g('bolt')} Try Blackjack Rush</a><a class="button" href="/practice/weakness">${g('chart')} Your weakness map</a></div></div>` : ''}</section>`;
    $$('[data-act]').forEach(b => b.onclick = async () => {
      $$('[data-act]').forEach(x => { x.disabled = true; });
      try { const res = await api('/api/daily/answer', 'POST', { given: b.dataset.act, day: localDate() }); Sound.play(res.ok ? 'correct' : 'wrong'); react(res.ok, { anchor: $('.daily-wrap') }); if (res.ok) confetti({ count: 40 }); paint({ ...r, ...res }); }
      catch (e) { ctx.toast(e.message); $$('[data-act]').forEach(x => { x.disabled = false; }); }
    });
  };
  paint(d);
}

// ---- Rush and Storm ----------------------------------------------------------------------------
const MODES = {
  rush: { name: 'Blackjack Rush', glyph: 'bolt', color: 'orange', blurb: 'Three strikes and a shrinking clock. Hands get harder as you go: hard totals, soft hands, pairs, rule changes, then index plays at a true count.' },
  storm: { name: 'Count Storm', glyph: 'count', color: 'purple', blurb: 'Cards keep coming a few at a time. Add them to your Hi‑Lo running count before the clock runs out. Three strikes.' },
};

export async function rushPage(ctx, mode) {
  const { api, go, localDate, onCleanup } = ctx;
  const meta = MODES[mode];
  let timer = null, keyHandler = null, run = null, misses = [];
  const battleId = new URLSearchParams(location.search).get('battle'); let battle = null;
  const onKey = e => keyHandler?.(e);
  document.addEventListener('keydown', onKey);
  onCleanup(() => { clearTimeout(timer); document.removeEventListener('keydown', onKey); });
  const runsThisVisit = () => Number(sessionStorage.getItem('ff-rush-runs') || 0);

  $('#app').innerHTML = `<main id="main" class="coach-screen practice c-${meta.color}"><header class="coach-top practice-top"><button type="button" class="icon-btn" id="ru-quit" aria-label="Leave">${g('close')}</button><div class="pr-title"><span class="tool-icon sm">${g(meta.glyph)}</span><div><strong>${meta.name}</strong><small>Correct decisions and speed. No chips, no stakes.</small></div></div>
    <div class="pr-stats"><span class="chip" title="Score"><b id="ru-score">0</b></span><span class="hearts" id="ru-strikes" aria-label="Strikes"></span></div></header>
    <div class="round-bar rush-clock" aria-hidden="true"><span id="ru-clock"></span></div><section class="coach-body" id="coach-body"></section><footer class="coach-foot" id="coach-foot"></footer></main>`;
  const body = $('#coach-body'), foot = $('#coach-foot');
  $('#ru-quit').onclick = () => go('/tools');
  const strikes = (n, max = 3) => { $('#ru-strikes').innerHTML = Array.from({ length: max }, (_, i) => g('heart', i < max - n ? '' : 'lost')).join(''); };
  strikes(0);

  async function intro() {
    clearTimeout(timer); $('#ru-clock').style.cssText = 'width:0';
    let b = { week: [], friends: [], best: 0, runs: 0, left: null };
    try { b = await api('/api/rush/board?mode=' + mode + '&day=' + localDate()); } catch { /* optional */ }
    const list = (rows, empty) => rows.length ? `<ol class="rush-board">${rows.map(r => `<li><span>${esc(r.username)}</span><b>${r.best}</b></li>`).join('')}</ol>` : `<p class="muted small">${empty}</p>`;
    if (battleId) { try { battle = await api('/api/rush/battle/' + encodeURIComponent(battleId)); } catch (e) { ctx.toast(e.message); battle = null; } }
    const tired = runsThisVisit() >= 3;
    const battleHTML = battle ? `<div class="battle-card">${g('trophy')}<div><strong>${battle.mine ? 'Your battle' : `${esc(battle.host)} challenged you`}</strong><span>${battle.mine ? `You scored ${battle.hostScore}. Friends who open your link play the exact same hands.` : battle.played ? 'You already played this one.' : `They scored <b>${battle.hostScore}</b> on these exact hands. Beat it. Battles don’t use your free run.`}</span>${battle.challengers.length ? `<ol class="rush-board">${[{ username: battle.host + ' (host)', best: battle.hostScore }, ...battle.challengers.map(c => ({ username: c.username, best: c.score }))].sort((a, b) => b.best - a.best).map(r => `<li><span>${esc(r.username)}</span><b>${r.best}</b></li>`).join('')}</ol>` : ''}</div></div>` : '';
    body.innerHTML = `<div class="coach-intro rush-intro">${ace('happy', 'ace-lg bob')}<h1>${meta.name}</h1><p>${meta.blurb}</p>${battleHTML}
      <div class="plan-grid three"><div class="stat-tile yellow"><small>Your best</small><strong>${b.best}</strong></div><div class="stat-tile blue"><small>Runs</small><strong>${b.runs}</strong></div><div class="stat-tile purple"><small>Today</small><strong>${b.left == null ? 'Unlimited' : b.left ? '1 free run' : 'Used'}</strong></div></div>
      ${tired ? `<p class="break-note">${g('heart')} You’ve played a few runs in a row. A short break helps it stick.</p>` : ''}
      <div class="rush-boards"><div><h3>This week</h3>${list(b.week, 'No runs yet this week. Set the first score.')}</div><div><h3>You and friends</h3>${list(b.friends, 'Follow friends in Community to race them.')}</div></div></div>`;
    foot.className = 'coach-foot';
    const canBattle = battle && !battle.mine && !battle.played;
    if (b.left === 0 && !canBattle) { foot.innerHTML = `<span class="foot-hint">Free members get one run a day per mode.</span><button type="button" class="primary chunky" id="ru-pro">${g('crown')} Unlimited runs with Pro</button>`; $('#ru-pro').onclick = () => paywall(ctx, 'Pro has unlimited Rush and Count Storm runs.'); return; }
    if (battle && !canBattle) { foot.innerHTML = `<span class="foot-hint">${battle.mine ? 'Share your link with friends.' : 'You’ve played this battle.'}</span><a class="button primary chunky" href="/tools/${mode}">Play a normal run</a>`; return; }
    foot.innerHTML = `<span class="foot-hint">Enter to start</span><button type="button" class="primary chunky" id="ru-go">${canBattle ? 'Start the battle' : 'Start'}</button>`;
    $('#ru-go').onclick = start; keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); start(); } };
  }

  async function start() {
    keyHandler = null; misses = [];
    try { run = await api('/api/rush/start', 'POST', { mode, day: localDate(), battle: battle && !battle.mine && !battle.played ? battle.id : undefined }); } catch (e) { if (/Pro/.test(e.message)) paywall(ctx, e.message); else ctx.toast(e.message); return; }
    sessionStorage.setItem('ff-rush-runs', String(runsThisVisit() + 1));
    $('#ru-score').textContent = 0; strikes(0, run.maxStrikes); ask(run.q);
  }

  function clock(limit, onOut) {
    const bar = $('#ru-clock');
    bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth;
    bar.style.transition = `width ${limit}s linear`; bar.style.width = '0%';
    clearTimeout(timer); timer = setTimeout(onOut, limit * 1000);
  }

  function ask(q) {
    let sent = false;
    const send = async given => {
      if (sent) return; sent = true; clearTimeout(timer); keyHandler = null;
      $$('[data-act], #ru-check', body).forEach(b => { b.disabled = true; });
      let res; try { res = await api('/api/rush/answer', 'POST', { id: run.id, given }); } catch (e) { ctx.toast(e.message); return; }
      Sound.play(res.ok ? 'correct' : 'wrong');
      $('#ru-score').textContent = res.score; strikes(res.strikes, run.maxStrikes);
      if (!res.ok) misses.push({ q, given, res });
      const flash = document.createElement('div'); flash.className = 'rush-flash ' + (res.ok ? 'ok' : 'bad');
      flash.innerHTML = res.ok ? `${g('check')} ${res.score}` : `${res.late ? 'Too slow. ' : ''}${mode === 'storm' ? `Count was ${bj.signed(res.answerKey)}` : ACT[res.answerKey]}`;
      body.append(flash);
      setTimeout(() => (res.done ? over(res) : ask(res.q)), res.ok ? 380 : 1100);
    };
    if (mode === 'storm') {
      body.innerHTML = `<div class="q"><p class="q-eyebrow">${q.n === 0 ? 'Fresh shoe: the count starts at 0' : `Hand ${q.n + 1} · add these to your count`}</p><div class="storm-cards">${q.cards.map((c, i) => cardHTML(c, i, { cls: 'flash-in' })).join('')}</div><h1 class="q-title">Running count now?</h1><div class="answer-slot"></div></div>`;
      const n = mountNumber($('.answer-slot', body), { label: 'Running count', onChange: v => { const b = $('#ru-check'); if (b) b.disabled = v === null; } });
      foot.className = 'coach-foot'; foot.innerHTML = `<span class="foot-hint">Type the count, then Enter</span><button type="button" class="primary chunky" id="ru-check" disabled>Check</button>`;
      $('#ru-check').onclick = () => send(n.value);
      keyHandler = e => { if (e.key === 'Enter' && n.value !== null) { e.preventDefault(); send(n.value); } };
      clock(q.limit, () => send(n.value));
    } else {
      body.innerHTML = `<div class="q"><p class="q-eyebrow">${q.tc != null ? `<span class="tc-badge">True count ${bj.signed(q.tc)}</span> ` : ''}${esc(rulesLine(q.rules))}</p><h1 class="q-title">${esc(cap(bj.handLabel(q.cards)))} against ${vs(q.dealer)}</h1>${tableHTML({ dealer: q.dealer, cards: q.cards })}${actionRow(q.actions)}</div>`;
      foot.className = 'coach-foot'; foot.innerHTML = `<span class="foot-hint">Tap a play or press its key · ${q.limit}s</span>`;
      $$('[data-act]', body).forEach(b => b.onclick = () => send(b.dataset.act));
      keyHandler = e => { const k = e.key.toUpperCase(); if (q.actions.includes(k)) { e.preventDefault(); send(k); } };
      clock(q.limit, () => send('X'));
    }
  }

  function over(res) {
    clearTimeout(timer); keyHandler = null;
    Sound.play('complete'); if (res.newBest && res.score >= 5) confetti({ count: 80 });
    const last = misses.filter(m => mode === 'rush' && m.q.tc == null && m.q.cards.length === 2).slice(-1)[0];
    body.innerHTML = `<div class="lesson-done">${ace(res.newBest ? 'wow' : 'happy', 'ace-xl pop')}<h1>${res.newBest ? 'New personal best!' : 'Run over'}</h1>
      <div class="plan-grid three"><div class="stat-tile yellow"><small>Score</small><strong>${res.score}</strong></div><div class="stat-tile orange"><small>Best</small><strong>${res.best}</strong></div><div class="stat-tile purple"><small>XP</small><strong>+${Math.min(20, res.score)}</strong></div></div>
      ${misses.length ? `<h3 class="sim-sub">Your misses</h3><ul class="rush-misses">${misses.map(m => `<li>${mode === 'storm' ? `Count after ${m.q.cards.map(bj.rank).join(' ')}: you said ${m.given == null ? '—' : bj.signed(m.given)}, it was <b>${bj.signed(m.res.answerKey)}</b>` : `${esc(bj.handLabel(m.q.cards))} vs ${m.q.dealer === 1 ? 'A' : m.q.dealer}${m.q.tc != null ? ` at TC ${bj.signed(m.q.tc)}` : ''}: ${m.given === 'X' ? 'ran out of time' : ACT[m.given]} → <b>${ACT[m.res.answerKey]}</b>`}</li>`).join('')}</ul>` : ''}
      ${last ? whyHTML(last.q.cards, last.q.dealer, last.q.rules, last.given === 'X' ? null : last.given) : ''}</div>`;
    const wasBattle = battle && !battle.mine && !battle.played;
    if (wasBattle) body.insertAdjacentHTML('afterbegin', `<div class="battle-card result">${g('trophy')}<div><strong>${res.score > battle.hostScore ? `You beat ${esc(battle.host)}!` : res.score === battle.hostScore ? `Tied with ${esc(battle.host)}` : `${esc(battle.host)} wins this one`}</strong><span>You ${res.score} · ${esc(battle.host)} ${battle.hostScore}</span></div></div>`);
    foot.className = 'coach-foot'; foot.innerHTML = `<button type="button" class="ghost" id="ru-done">Back to Tools</button>${res.score > 0 && !wasBattle ? `<button type="button" class="button" id="ru-battle">${g('users')} Challenge a friend</button>` : ''}<button type="button" class="primary chunky" id="ru-again">Leaderboard and play again</button>`;
    $('#ru-done').onclick = () => go('/tools'); $('#ru-again').onclick = () => { if (wasBattle) { history.replaceState(null, '', '/tools/' + mode); battle = null; } intro(); }; $('#ru-again').focus();
    $('#ru-battle')?.addEventListener('click', async () => {
      const eco = await api('/api/me/economy').catch(() => null);
      if (!eco?.plan?.pro) { paywall(ctx, 'Pro members can challenge friends to battles on the exact same hands.'); return; }
      const url = `${location.origin}/tools/${mode}?battle=${run.id}`, text = `I scored ${res.score} in ${meta.name} on Felt & Fortune. Same hands, your turn:`;
      try { if (navigator.share) await navigator.share({ text, url }); else { await navigator.clipboard.writeText(`${text} ${url}`); ctx.toast('Battle link copied. Send it to a friend.'); } } catch { /* cancelled */ }
    });
  }
  intro();
}
