// Casino-ready test-out (Pro, one attempt a month) and its public certificate.
// Five timed sections at casino speed; no feedback until the end, like a real test-out.
import { esc, $, $$, g, ace, Sound, tableHTML, cardHTML, mountNumber } from './ui.js';
import { paywall, confetti } from './economy.js';
import * as bj from './bj.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const vs = up => (up === 1 ? 'an ace' : 'a ' + bj.upName(up));

export async function testoutPage(ctx) {
  const { api, go, localDate, onCleanup } = ctx;
  let timer = null, keyHandler = null, alive = true;
  const onKey = e => keyHandler?.(e);
  document.addEventListener('keydown', onKey);
  onCleanup(() => { alive = false; clearTimeout(timer); document.removeEventListener('keydown', onKey); });
  $('#app').innerHTML = `<main id="main" class="coach-screen practice c-gold"><header class="coach-top practice-top"><button type="button" class="icon-btn" id="to-quit" aria-label="Leave">${g('close')}</button><div class="pr-title"><span class="tool-icon sm">${g('trophy')}</span><div><strong>Casino-ready test-out</strong><small id="to-sub">Five sections at casino speed</small></div></div><div class="pr-stats"><span class="chip"><b id="to-n"></b></span></div></header>
    <div class="round-bar rush-clock" aria-hidden="true"><span id="to-clock"></span></div><section class="coach-body" id="coach-body"></section><footer class="coach-foot" id="coach-foot"></footer></main>`;
  const body = $('#coach-body'), foot = $('#coach-foot');
  let run = null;
  $('#to-quit').onclick = () => { if (run && !confirm('Leave the test-out? Today’s attempt will count as failed.')) return; go('/tools'); };

  const st = await api('/api/testout?day=' + localDate());
  body.innerHTML = `<div class="coach-intro testout-intro">${ace('think', 'ace-lg bob')}<h1>Casino-ready test-out</h1><p>The test serious counters take before playing for real money, at casino speed. Every answer is timed, and you see your results only at the end. Pass every section to earn a certificate you can share.</p>
    <ol class="to-sections">${st.sections.map(s => `<li><b>${esc(s.name)}</b><span>${s.items} question${s.items === 1 ? '' : 's'} · pass ${s.need}/${s.items}${s.name.startsWith('Running') ? ' · cards flash fast' : ` · ${s.seconds}s each`}</span></li>`).join('')}</ol>
    ${st.attempts.length ? `<h3 class="sim-sub">Your attempts</h3><ul class="to-attempts">${st.attempts.map(a => `<li><span>${esc(a.day)}</span><b class="${a.passed ? 'ok' : 'bad'}">${a.passed ? 'Passed' : a.finished ? 'Not yet' : 'Left early'}</b>${a.passed ? `<a href="/certificate/${a.id}">Certificate</a>` : ''}</li>`).join('')}</ul>` : ''}</div>`;
  foot.className = 'coach-foot';
  if (!st.pro) { foot.innerHTML = `<span class="foot-hint">One attempt a day with Pro.</span><button type="button" class="primary chunky" id="to-pro">${g('crown')} Get Pro</button>`; $('#to-pro').onclick = () => paywall(ctx, 'The casino-ready test-out and its certificate are part of Pro.'); return; }
  if (!st.available) { foot.innerHTML = `<span class="foot-hint">You’ve used today’s attempt. Come back tomorrow.</span><a class="button primary chunky" href="/practice">Keep practicing</a>`; return; }
  foot.innerHTML = `<span class="foot-hint">One attempt today. Find a quiet spot.</span><button type="button" class="primary chunky" id="to-go">Start the test</button>`;
  $('#to-go').onclick = async () => {
    try { run = await api('/api/testout/start', 'POST', { day: localDate() }); } catch (e) { ctx.toast(e.message); return; }
    ask(run.item);
  };

  function clock(sec, onOut) {
    const bar = $('#to-clock'); bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth;
    bar.style.transition = `width ${sec}s linear`; bar.style.width = '0%'; clearTimeout(timer); timer = setTimeout(onOut, sec * 1000);
  }

  async function ask(it) {
    $('#to-n').textContent = `${it.i + 1}/${it.total}`; $('#to-sub').textContent = it.section;
    let sent = false;
    const send = async given => {
      if (sent) return; sent = true; clearTimeout(timer); keyHandler = null; Sound.play('tap');
      let res; try { res = await api('/api/testout/answer', 'POST', { id: run.id, given }); } catch (e) { ctx.toast(e.message); return; }
      if (res.done) finish(res); else ask(res.item);
    };
    const numberFoot = (label, onReady) => {
      foot.className = 'coach-foot'; foot.innerHTML = `<span class="foot-hint">Type your answer, then Enter</span><button type="button" class="primary chunky" id="to-next" disabled>Next</button>`;
      const n = mountNumber($('.answer-slot', body), { label, onChange: v => { $('#to-next').disabled = v === null; } });
      $('#to-next').onclick = () => send(n.value);
      keyHandler = e => { if (e.key === 'Enter' && n.value !== null) { e.preventDefault(); send(n.value); } };
      onReady?.(n); return n;
    };
    if (it.sec === 'count') {
      body.innerHTML = `<div class="q"><p class="q-eyebrow">${it.cards.length} cards · start at 0</p><div class="flash-stage"><div class="flash-cards"><span class="flash-ready">Ready…</span></div></div><div class="answer-slot" hidden></div></div>`;
      foot.className = 'coach-foot'; foot.innerHTML = '<span class="foot-hint">Keep the running count</span>';
      clock(it.limit, () => send(null));
      await sleep(600);
      const stage = $('.flash-cards', body);
      for (const c of it.cards) { if (!alive || !stage.isConnected) return; stage.innerHTML = cardHTML(c, 0, { cls: 'flash-in' }); Sound.play('deal'); await sleep(it.flash * 1000); }
      stage.innerHTML = '<span class="flash-ready">Running count?</span>'; $('.answer-slot', body).hidden = false;
      numberFoot('Running count');
    } else if (it.sec === 'truecount' || it.sec === 'bet') {
      body.innerHTML = `<div class="q"><p class="q-eyebrow">${it.sec === 'bet' ? 'Ramp: 1 unit at +1 or lower, then true count − 1, up to 12' : 'Round down'}</p><h1 class="q-title">${it.sec === 'bet' ? 'How many units do you bet?' : 'What’s the true count?'}</h1><div class="tile-row">${it.sec === 'bet' ? `<div class="big-tile purple"><small>True count</small><strong>${bj.signed(it.tc)}</strong></div>` : `<div class="big-tile orange"><small>Running count</small><strong>${bj.signed(it.rc)}</strong></div><div class="big-tile teal"><small>Decks left</small><strong>${bj.halves(it.decks)}</strong></div>`}</div><div class="answer-slot"></div></div>`;
      numberFoot(it.sec === 'bet' ? 'Units' : 'True count'); clock(it.limit, () => send(null));
    } else {
      const acts = it.actions;
      body.innerHTML = `<div class="q"><p class="q-eyebrow">${it.tc != null ? `<span class="tc-badge">True count ${bj.signed(it.tc)}</span>` : 'Dealer hits soft 17 · Surrender allowed'}</p><h1 class="q-title">${esc(bj.handLabel(it.cards))} against ${vs(it.dealer)}</h1>${tableHTML({ dealer: it.dealer, cards: it.cards })}<div class="action-row">${acts.map(a => `<button type="button" class="act act-${a}" data-act="${a}"><span>${bj.ACTIONS[a]}</span><kbd>${a}</kbd></button>`).join('')}</div></div>`;
      foot.className = 'coach-foot'; foot.innerHTML = '<span class="foot-hint">Tap a play or press its key</span>';
      $$('[data-act]', body).forEach(b => b.onclick = () => send(b.dataset.act));
      keyHandler = e => { const k = e.key.toUpperCase(); if (acts.includes(k)) { e.preventDefault(); send(k); } };
      clock(it.limit, () => send(null));
    }
  }

  function finish(res) {
    run = null; $('#to-clock').style.width = '0';
    Sound.play(res.passed ? 'complete' : 'reveal'); if (res.passed) confetti({ count: 120 });
    body.innerHTML = `<div class="lesson-done">${ace(res.passed ? 'wow' : 'happy', 'ace-xl pop')}<h1>${res.passed ? 'You passed. You’re casino-ready.' : 'Not this time'}</h1>
      <ul class="to-results">${res.results.map(r => `<li class="${r.passed ? 'ok' : 'bad'}">${g(r.passed ? 'check' : 'close')}<span>${esc(r.name)}</span><b>${r.right}/${r.of}</b><small>need ${r.need}</small></li>`).join('')}</ul>
      <p class="muted">${res.passed ? 'Your certificate is ready to share.' : 'Practice the sections you missed. You can try again tomorrow.'}</p></div>`;
    foot.className = 'coach-foot'; foot.innerHTML = res.passed ? `<a class="button ghost" href="/tools">Back to Tools</a><a class="button primary chunky" href="/certificate/${res.certificate}">See your certificate</a>` : `<a class="button ghost" href="/tools">Back to Tools</a><a class="button primary chunky" href="/practice">Practice</a>`;
  }
}

/** Public certificate page: anyone with the link can view it. */
export async function certificatePage(ctx, id, chrome) {
  let cert = null;
  try { cert = await ctx.api('/api/certificate/' + encodeURIComponent(id)); } catch { /* not found */ }
  $('#app').innerHTML = chrome + `<main id="main" class="legal-page cert-page">${cert ? `<article class="certificate"><div class="cert-seal">${g('trophy')}</div><p class="cert-kicker">Felt &amp; Fortune</p><h1>Casino-ready certificate</h1><p class="cert-name">${esc(cert.username)}</p>
    <p>passed the casino-ready test-out on ${esc(new Date(cert.day + 'T00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }))}: running count at casino speed, true count conversion, Hi‑Lo index plays, bet ramp, and basic strategy, every answer timed.</p>
    <ul class="to-results">${cert.results.map(r => `<li class="ok">${g('check')}<span>${esc(r.name)}</span><b>${r.right}/${r.of}</b></li>`).join('')}</ul>
    <p class="cert-id">Certificate ${esc(cert.id)} · verify at ${esc(location.origin)}/certificate/${esc(cert.id)}</p>
    <p class="cert-fine">Educational achievement only. Felt &amp; Fortune never takes bets, and no skill removes the risk of losing money.</p>
    <div class="flex cert-actions"><button type="button" class="button" id="cert-print">${g('book')} Print</button><button type="button" class="button primary" id="cert-share">${g('next')} Share</button></div></article>`
    : `<h1>Certificate not found</h1><p>That link isn’t a valid certificate.</p>`}</main>`;
  $('#cert-print')?.addEventListener('click', () => print());
  $('#cert-share')?.addEventListener('click', async () => { const url = location.href; try { if (navigator.share) await navigator.share({ title: 'Casino-ready certificate', url }); else { await navigator.clipboard.writeText(url); ctx.toast('Link copied.'); } } catch { /* cancelled */ } });
}
