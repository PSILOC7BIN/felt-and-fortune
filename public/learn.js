// Felt & Fortune Coach: onboarding survey, personalized plan, the learning path, and the lesson player.
import { Sound, ace, g, tableHTML } from './ui.js';
import { createRunner, questionsForStep, choiceQ } from './trainers.js';

export { Sound, ace, g };

export function createLearn(ctx) {
  const { $, $$, esc, api, go, paths, localDate } = ctx;

  const soundButton = () => `<button type="button" class="icon-btn sound-toggle" aria-pressed="${Sound.on}" aria-label="${Sound.on ? 'Turn sound off' : 'Turn sound on'}">${g(Sound.on ? 'speaker' : 'mute')}</button>`;
  function wireSound(root = document) {
    $$('.sound-toggle', root).forEach(b => b.onclick = () => {
      const on = Sound.toggle();
      $$('.sound-toggle').forEach(x => { x.setAttribute('aria-pressed', on); x.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on'); x.innerHTML = g(on ? 'speaker' : 'mute'); });
    });
  }
  const table = step => (step.cards || step.dealer ? tableHTML({ dealer: step.dealer, cards: step.cards, holeCard: !!step.dealer }) : '');
  function onKeys(handler) {
    const fn = e => { if (e.target.closest('input,textarea,select') || e.metaKey || e.ctrlKey || e.altKey) return; handler(e); };
    document.addEventListener('keydown', fn);
    ctx.onCleanup(() => document.removeEventListener('keydown', fn));
  }
  const choiceTiles = (options, selected) => `<div class="choice-list" role="radiogroup">${options.map((o, i) => `<button type="button" class="choice-tile ${selected === i ? 'selected' : ''}" role="radio" aria-checked="${selected === i}" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>`;
  const fmtDate = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  // -------------------------------------------------------------------------
  // Onboarding survey → plan → account
  // -------------------------------------------------------------------------
  async function startPage() {
    const { questions } = await api('/api/survey');
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem('ff-survey') || 'null'); } catch { saved = null; }
    const state = saved && typeof saved === 'object' && saved.answers ? saved : { i: 0, answers: {} };
    let phase = state.i >= questions.length ? 'building' : Object.keys(state.answers).length ? 'question' : 'intro';
    let plan = null;
    const persist = () => sessionStorage.setItem('ff-survey', JSON.stringify(state));

    $('#app').innerHTML = `<main id="main" class="coach-screen"><header class="coach-top"><button type="button" class="icon-btn" id="coach-close" aria-label="Exit to home">${g('close')}</button><div class="progress" role="progressbar" aria-label="Survey progress" aria-valuemin="0" aria-valuemax="${questions.length}"><span></span></div>${soundButton()}</header><section class="coach-body" id="coach-body" aria-live="polite"></section><footer class="coach-foot" id="coach-foot"></footer></main>`;
    wireSound();
    $('#coach-close').onclick = () => go('/');

    function setProgress() {
      const done = phase === 'intro' ? 0 : Math.min(state.i, questions.length);
      $('.coach-top .progress span').style.width = (done / questions.length * 100) + '%';
      $('.coach-top .progress').setAttribute('aria-valuenow', done);
    }
    function paint() {
      setProgress();
      const body = $('#coach-body'), foot = $('#coach-foot');
      foot.className = 'coach-foot';
      if (phase === 'intro') {
        body.innerHTML = `<div class="coach-intro">${ace('happy', 'ace-xl bob')}<h1>Hi, I’m Ace.</h1><p>Answer ${questions.length} quick questions, a few of them real blackjack checks. I’ll build a plan that takes you from where you are now to playing like a pro.</p></div>`;
        foot.innerHTML = `<a class="button ghost" href="/auth/login">I already have an account</a><button type="button" class="primary chunky" id="coach-next">Let’s go</button>`;
        $('#coach-next').onclick = () => { Sound.play('select'); phase = 'question'; paint(); };
        return;
      }
      if (phase === 'question') {
        const q = questions[state.i], selected = q.options.findIndex(o => o[0] === state.answers[q.id]);
        body.innerHTML = `<div class="coach-q">${q.kind === 'placement' ? '<span class="pill">Quick check</span>' : `<span class="pill quiet">Question ${state.i + 1} of ${questions.length}</span>`}<div class="speech">${ace(q.kind === 'placement' ? 'think' : 'happy', 'ace-sm')}<div class="bubble"><h1>${esc(q.prompt)}</h1></div></div>${table(q)}${choiceTiles(q.options.map(o => o[1]), selected)}</div>`;
        foot.innerHTML = `<button type="button" class="ghost" id="coach-back" ${state.i === 0 ? 'disabled' : ''}>${g('back')} Back</button><button type="button" class="primary chunky" id="coach-next" ${selected < 0 ? 'disabled' : ''}>${state.i === questions.length - 1 ? 'Build my plan' : 'Continue'}</button>`;
        const choose = i => {
          state.answers[q.id] = q.options[i][0]; persist(); Sound.play('select');
          $$('.choice-tile').forEach((b, j) => { b.classList.toggle('selected', i === j); b.setAttribute('aria-checked', i === j); });
          $('#coach-next').disabled = false;
        };
        $$('.choice-tile').forEach(b => b.onclick = () => choose(Number(b.dataset.i)));
        $('#coach-back').onclick = () => { state.i = Math.max(0, state.i - 1); persist(); paint(); };
        $('#coach-next').onclick = () => {
          if (!state.answers[q.id]) return;
          state.i++; persist(); Sound.play('tap');
          phase = state.i >= questions.length ? 'building' : 'question'; paint();
        };
        keyChoose = choose; keyCount = q.options.length;
        return;
      }
      if (phase === 'building') {
        body.innerHTML = `<div class="coach-building">${ace('think', 'ace-lg bob')}<h1>Building your plan…</h1><ul class="build-steps">${['Checking your strategy answers', 'Scoring your counting skills', 'Placing you on the path', 'Choosing your focus areas', 'Setting your daily goal'].map((t, i) => `<li style="--d:${i * 380}ms">${g('check')}${t}</li>`).join('')}</ul></div>`;
        foot.innerHTML = '';
        const started = Date.now();
        api('/api/plan/preview', 'POST', { answers: state.answers }).then(async r => {
          plan = r.plan;
          await new Promise(res => setTimeout(res, Math.max(0, 2100 - (Date.now() - started))));
          if (!document.body.contains(body)) return;
          phase = 'plan'; Sound.play('reveal'); paint();
        }).catch(error => {
          body.innerHTML = `<div class="coach-intro">${ace('oops', 'ace-lg')}<h1>That didn’t work</h1><p>${esc(error.message)}</p></div>`;
          foot.innerHTML = `<button type="button" class="primary chunky" id="coach-retry">Start over</button>`;
          $('#coach-retry').onclick = () => { state.i = 0; state.answers = {}; persist(); phase = 'intro'; paint(); };
        });
        return;
      }
      if (phase === 'plan') {
        body.innerHTML = planReveal(plan);
        const user = ctx.getUser();
        foot.innerHTML = `<button type="button" class="ghost" id="coach-redo">Retake</button><button type="button" class="primary chunky" id="coach-save">${user ? 'Save my plan' : 'Create my free account'}</button>`;
        $('#coach-redo').onclick = () => { state.i = 0; state.answers = {}; persist(); phase = 'question'; paint(); };
        $('#coach-save').onclick = async e => {
          if (!user) { phase = 'signup'; paint(); return; }
          e.currentTarget.disabled = true;
          try { await api('/api/path/plan', 'POST', { answers: state.answers }); sessionStorage.removeItem('ff-survey'); go(paths.learn); }
          catch (error) { ctx.toast(error.message); e.currentTarget.disabled = false; }
        };
        return;
      }
      if (phase === 'signup') {
        body.innerHTML = `<div class="coach-signup">${ace('happy', 'ace-md')}<h1>Save your plan</h1><p>Create a free account to keep your plan, progress, and streak.</p><form id="coach-signup" class="signup-card"><div class="field"><label for="su-username">Username</label><input id="su-username" name="username" required minlength="3" maxlength="30" pattern="[A-Za-z0-9_\\-]{3,30}" autocomplete="username" placeholder="Choose a username"></div><div class="field"><label for="su-email">Email</label><input id="su-email" name="email" type="email" required autocomplete="email" placeholder="you@example.com"></div><div class="field"><label for="su-password">Password</label><input id="su-password" name="password" type="password" required minlength="10" maxlength="256" autocomplete="new-password" placeholder="At least 10 characters"></div><div class="field"><label for="su-confirm">Confirm password</label><input id="su-confirm" name="confirm" type="password" required minlength="10" autocomplete="new-password"></div><label class="check-label field"><input name="terms" type="checkbox" required><span>I agree to the <a href="/terms" target="_blank">Terms of Use</a> and <a href="/privacy" target="_blank">Privacy Policy</a>.</span></label><p class="form-error" role="alert"></p></form><p class="muted small-print">Already have an account? <a href="/auth/login">Sign in</a>, then open My Path to retake this survey.</p></div>`;
        foot.innerHTML = `<button type="button" class="ghost" id="coach-plan">${g('back')} My plan</button><button type="submit" form="coach-signup" class="primary chunky" id="coach-create">Create account</button>`;
        $('#coach-plan').onclick = () => { phase = 'plan'; paint(); };
        $('#coach-signup').onsubmit = async e => {
          e.preventDefault();
          const f = e.target, err = $('.form-error', f), data = Object.fromEntries(new FormData(f));
          err.textContent = '';
          if (data.password !== data.confirm) { err.textContent = 'Passwords do not match.'; return; }
          $('#coach-create').disabled = true;
          try {
            const result = await api('/api/signup', 'POST', { username: data.username, email: data.email, password: data.password, survey: state.answers });
            ctx.setUser(result.user); sessionStorage.removeItem('ff-survey'); Sound.play('complete'); go(paths.learn);
          } catch (error) { err.textContent = error.message; $('#coach-create').disabled = false; }
        };
      }
    }
    let keyChoose = null, keyCount = 0;
    onKeys(e => {
      if (phase === 'question' && keyChoose && /^[1-9]$/.test(e.key) && Number(e.key) <= keyCount) keyChoose(Number(e.key) - 1);
      else if (e.key === 'Enter' && !e.target.closest('a,button')) { const next = $('#coach-next') || $('#coach-save'); if (next && !next.disabled) next.click(); }
    });
    paint();
  }

  function planReveal(plan) {
    return `<div class="plan-reveal">${ace('wow', 'ace-md pop')}<span class="pill">Your plan is ready</span><h1>${esc(plan.headline)}</h1><div class="plan-grid"><div class="stat-tile blue"><small>Level</small><strong>${esc(plan.level)}</strong></div><div class="stat-tile green"><small>Daily goal</small><strong>${plan.dailyXp} XP</strong><span>${plan.minutes} min · ${plan.lessonsPerDay} lesson${plan.lessonsPerDay > 1 ? 's' : ''}</span></div><div class="stat-tile orange"><small>Finish by</small><strong>${fmtDate(plan.finish)}</strong><span>${plan.remainingLessons} lessons</span></div><div class="stat-tile purple"><small>Goal</small><strong>${esc(plan.goalName)}</strong></div></div><div class="glass-card"><h2>Why this plan</h2><ul class="reasons">${plan.reasons.map(r => `<li>${g('check')}<span>${esc(r)}</span></li>`).join('')}</ul><p class="milestone">${g('trophy')}<span>${esc(plan.milestone.text)}</span></p></div></div>`;
  }


  // -------------------------------------------------------------------------
  // Learning path (rendered inside the app shell's #page)
  // -------------------------------------------------------------------------
  const OFFSETS = [0, 46, 72, 46, 0, -46, -72, -46];

  async function learnPage() {
    const state = await api('/api/path?day=' + localDate());
    if (!state.plan) {
      $('#page').innerHTML = `<div class="empty-path">${ace('happy', 'ace-xl bob')}<h1>Let’s build your path</h1><p>Answer a few quick questions and Ace will build a personalized plan, from where you are now to pro.</p><a class="button primary chunky" href="/start">Build my plan</a></div>`;
      return;
    }
    const { plan, units, stats, current } = state;
    const milestone = plan.milestone.unit;
    const byId = {}; units.forEach((u, ui) => u.lessons.forEach(l => byId[l.id] = { ...l, unit: u, ui }));
    const cur = current ? byId[current] : null;
    let n = 0;
    const unitHtml = units.map((u, ui) => {
      const tested = plan.testedOut.includes(u.id);
      const nodes = u.lessons.map((l, li) => {
        const off = OFFSETS[(n++) % OFFSETS.length];
        const ic = l.status === 'done' ? 'check' : l.status === 'locked' ? 'lock' : l.review ? 'dumbbell' : (ui === units.length - 1 && li === u.lessons.length - 1) ? 'trophy' : 'star';
        const label = `${l.title}: ${{ done: 'completed', tested: 'tested out', current: 'start here', open: 'available', locked: 'locked' }[l.status]}`;
        return `<div class="node-row" style="--x:${off}px">${l.id === current ? `<span class="start-bubble" aria-hidden="true">${stats.done ? 'Next' : 'Start'}</span>` : ''}<button type="button" class="node ${l.status} ${l.review ? 'review' : ''}" data-lesson="${l.id}" aria-label="${esc(label)}">${g(ic)}${l.status === 'current' ? '<span class="ring"></span>' : ''}</button>${l.id === current ? `<div class="node-ace" style="--side:${off > 0 ? -1 : 1}">${ace('happy', 'ace-sm bob')}</div>` : ''}</div>`;
      }).join('');
      const goal = u.id === milestone ? `<div class="goal-flag">${g('trophy')}<span>${esc(plan.goalName)} goal</span></div>` : '';
      return `<section class="unit c-${u.color}" id="${u.id}"><header class="unit-banner"><div><small>Unit ${ui + 1}${tested ? ' · Tested out' : plan.focus.includes(u.id) ? ' · Focus area' : ''}</small><h2>${esc(u.title)}</h2><p>${esc(u.summary)}</p>${u.note ? `<p class="unit-note">${esc(u.note)}</p>` : ''}</div>${u.tool ? `<a class="button unit-tool" href="${u.tool}">${g('dumbbell')} Practice</a>` : ''}</header><div class="nodes">${nodes}</div>${goal}</section>`;
    }).join('');
    const goalPct = Math.min(100, Math.round(stats.todayXp / stats.dailyXp * 100));
    const maxWeek = Math.max(stats.dailyXp, ...stats.week.map(w => w.xp));
    const strip = `<div class="stat-strip"><div class="chip streak ${stats.todayXp ? 'lit' : ''}" title="Day streak">${g('flame')}<b>${stats.streak}</b><span class="sr">day streak</span></div><div class="chip xp" title="Total XP">${g('bolt')}<b>${stats.xp}</b><span class="sr">XP</span></div><div class="chip progress-chip" title="Lessons finished">${g('star')}<b>${stats.done}/${stats.total}</b><span class="sr">lessons</span></div></div>`;
    const resume = cur ? `<a class="resume-card c-${cur.unit.color}" href="/learn/lesson/${cur.id}"><span class="resume-icon">${g('star')}</span><span class="resume-copy"><small>Unit ${cur.ui + 1} · ${esc(cur.unit.title)}</small><strong>${stats.done ? 'Continue' : 'Start'}: ${esc(cur.title)}</strong></span><span class="resume-go">${g('next')}</span></a>` : `<div class="resume-card c-gold"><span class="resume-icon">${g('trophy')}</span><span class="resume-copy"><small>Path complete</small><strong>You finished every lesson. Keep sharp in Practice.</strong></span></div>`;
    $('#page').innerHTML = `<div class="learn-layout"><div class="path-col"><div class="learn-mobile-stats">${strip}</div>${resume}<div class="path">${unitHtml}</div></div><aside class="learn-side">${strip}<div class="side-card"><div class="side-head"><h3>Daily goal</h3><span>${stats.todayXp}/${stats.dailyXp} XP</span></div><div class="goal-bar"><span style="width:${goalPct}%"></span></div><p class="muted">${goalPct >= 100 ? 'Goal reached. Nice work today!' : `${stats.dailyXp - stats.todayXp} XP to go. Lessons and practice both count.`}</p><div class="week" aria-label="XP this week">${stats.week.map(w => `<div class="day ${w.xp ? 'on' : ''}" title="${w.day}: ${w.xp} XP"><span style="height:${Math.max(4, w.xp / maxWeek * 100)}%"></span><small>${new Date(w.day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })}</small></div>`).join('')}</div></div><div class="side-card"><span class="pill">${esc(plan.level)}</span><h3 class="plan-title">${esc(plan.headline)}</h3><p class="muted">Finish by ${fmtDate(plan.finish)} at ${plan.minutes} min a day.</p><details><summary>Why this plan</summary><ul class="reasons">${plan.reasons.map(r => `<li>${g('check')}<span>${esc(r)}</span></li>`).join('')}</ul></details><a class="button small" href="/start">Retake placement</a></div></aside></div>`;

    const closePop = () => $$('.node-pop').forEach(p => p.remove());
    $$('.node').forEach(b => b.onclick = e => {
      e.stopPropagation();
      const open = b.parentElement.querySelector('.node-pop'); closePop(); if (open) return;
      const l = byId[b.dataset.lesson]; Sound.play('tap');
      const text = { done: `Best score ${l.best}%. Practice again for +5 XP.`, tested: 'You tested out of this. Review it any time.', current: 'Your next lesson. +10 XP', open: 'Ready when you are. +10 XP', locked: 'Finish the lessons before this one to unlock it.' }[l.status];
      const action = l.status === 'locked' ? '<button type="button" disabled>Locked</button>' : `<a class="button primary chunky" href="/learn/lesson/${l.id}">${l.status === 'done' || l.status === 'tested' ? 'Practice' : 'Start'}</a>`;
      b.insertAdjacentHTML('afterend', `<div class="node-pop c-${l.unit.color} ${l.status}" role="dialog" aria-label="${esc(l.title)}"><small>Unit ${l.ui + 1} · ${esc(l.unit.title)}</small><h3>${esc(l.title)}</h3><p>${text}</p>${action}</div>`);
    });
    const outside = e => { if (!e.target.closest('.node-pop')) closePop(); };
    document.addEventListener('click', outside);
    ctx.onCleanup(() => document.removeEventListener('click', outside));
    onKeys(e => { if (e.key === 'Escape') closePop(); });
    const target = current ? $(`[data-lesson="${current}"]`) : null;
    if (target && stats.done) setTimeout(() => target.scrollIntoView({ block: 'center' }), 30);
  }

  // -------------------------------------------------------------------------
  // Lesson player: every step, including embedded tools, runs through the shared runner.
  // -------------------------------------------------------------------------
  async function lessonPage(id) {
    $('#app').innerHTML = `<main id="main" class="coach-screen lesson"><div class="coach-body"><div class="loading"><span class="spinner"></span>Loading lesson…</div></div></main>`;
    let lesson;
    try { ({ lesson } = await api('/api/path/lesson/' + encodeURIComponent(id))); }
    catch (error) {
      $('#app').innerHTML = `<main id="main" class="coach-screen"><section class="coach-body"><div class="coach-intro">${ace('oops', 'ace-lg')}<h1>Can’t open this lesson</h1><p>${esc(error.message)}</p><a class="button primary chunky" href="${paths.learn}">Back to my path</a></div></section></main>`;
      return;
    }
    const queue = lesson.steps.flatMap(s => questionsForStep(s).map(q => Object.assign(q, { step: s, tries: 0 })));
    const questions = queue.filter(q => !q.teach).length;
    let pos = -1, firstTry = 0, combo = 0, finished = false;
    const results = [];

    $('#app').innerHTML = `<main id="main" class="coach-screen lesson c-${lesson.unit.color}"><header class="coach-top"><button type="button" class="icon-btn" id="lesson-quit" aria-label="Quit lesson">${g('close')}</button><div class="progress" role="progressbar" aria-label="Lesson progress" aria-valuemin="0" aria-valuemax="100"><span></span></div><span class="combo" aria-live="polite"></span>${soundButton()}</header><section class="coach-body" id="coach-body"></section><footer class="coach-foot" id="coach-foot"></footer><div class="sheet-shade" hidden><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="quit-title">${ace('oops', 'ace-sm')}<h2 id="quit-title">Quit this lesson?</h2><p>You’ll lose your progress in this lesson.</p><button type="button" class="primary chunky" id="keep-going">Keep learning</button><button type="button" class="ghost danger-text" id="quit-now">Quit</button></div></div></main>`;
    wireSound();
    const shade = $('.sheet-shade');
    $('#lesson-quit').onclick = () => { shade.hidden = false; $('#keep-going').focus(); };
    $('#keep-going').onclick = () => { shade.hidden = true; };
    $('#quit-now').onclick = () => go(paths.learn);
    function progress() {
      const pct = Math.round(Math.max(0, pos) / queue.length * 100);
      $('.coach-top .progress span').style.width = (finished ? 100 : pct) + '%';
      $('.coach-top .progress').setAttribute('aria-valuenow', pct);
      $('.combo').textContent = combo >= 3 && !finished ? `${combo} in a row!` : '';
    }
    const runner = createRunner({
      body: $('#coach-body'), foot: $('#coach-foot'),
      next: () => { pos++; progress(); return queue[pos] || null; },
      onResult: (q, r) => {
        results.push({ ...r.record, retry: q.tries > 0 });
        if (r.ok) { combo++; if (!q.tries) firstTry++; }
        else {
          combo = 0;
          if (q.tries < 2) {
            const again = q.kind === 'choice' ? choiceQ({ ...q.step, retry: true }) : q.remake ? q.remake() : null;
            if (again) queue.push(Object.assign(again, { step: q.step, tries: q.tries + 1, remake: q.remake }));
          }
        }
        progress();
      },
      onEmpty: finish,
      onKeyExtra: e => {
        if (!shade.hidden) { if (e.key === 'Escape') shade.hidden = true; return true; }
        if (e.key === 'Escape') { shade.hidden = false; return true; }
        return false;
      },
    });
    ctx.onCleanup(() => runner.destroy());
    runner.start();

    async function finish() {
      finished = true; progress();
      const body = $('#coach-body'), foot = $('#coach-foot');
      foot.className = 'coach-foot'; foot.innerHTML = '';
      body.innerHTML = `<div class="loading"><span class="spinner"></span>Saving…</div>`;
      try {
        const r = await api(`/api/path/lesson/${encodeURIComponent(lesson.id)}/complete`, 'POST', { results, day: localDate() });
        const goalHit = r.stats.todayXp >= r.stats.dailyXp && r.stats.todayXp - r.xp < r.stats.dailyXp;
        Sound.play('complete');
        body.innerHTML = `<div class="lesson-done">${ace('wow', 'ace-xl pop')}<h1>${r.accuracy === 100 ? 'Perfect lesson!' : 'Lesson complete!'}</h1>${goalHit ? `<p class="goal-hit">${g('flame')} Daily goal reached!</p>` : ''}<div class="plan-grid three"><div class="stat-tile yellow"><small>XP earned</small><strong>${g('bolt')} +${r.xp}</strong></div><div class="stat-tile green"><small>Accuracy</small><strong>${r.accuracy}%</strong></div><div class="stat-tile orange"><small>Streak</small><strong>${g('flame')} ${r.stats.streak}</strong></div></div><p class="muted">${firstTry} of ${questions} right on the first try.</p><div class="rate-lesson" id="rate-lesson"><span>How was this lesson?</span><div class="rate-stars">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="rate-star" data-n="${n}" aria-label="${n} out of 5">${g('star')}</button>`).join('')}</div></div></div>`;
        $$('.rate-star', body).forEach(b => b.onclick = async () => { const n = Number(b.dataset.n); $$('.rate-star', body).forEach(x => x.classList.toggle('on', Number(x.dataset.n) <= n)); try { await api('/api/feedback', 'POST', { rating: n, area: 'lesson', page: lesson.id }); $('#rate-lesson span').textContent = 'Thanks for the rating!'; } catch { /* optional */ } });
        foot.innerHTML = `${lesson.unit.tool ? `<a class="button ghost" href="${lesson.unit.tool}">${g('dumbbell')} Practice this skill</a>` : '<span></span>'}<button type="button" class="primary chunky" id="lesson-done">Continue</button>`;
        $('#lesson-done').onclick = () => go(paths.learn); $('#lesson-done').focus();
      } catch (error) {
        body.innerHTML = `<div class="coach-intro">${ace('oops', 'ace-lg')}<h1>Couldn’t save this lesson</h1><p>${esc(error.message)}</p></div>`;
        foot.innerHTML = `<span></span><button type="button" class="primary chunky" id="lesson-retry">Try again</button>`;
        $('#lesson-retry').onclick = finish;
      }
    }
  }

  return { startPage, learnPage, lessonPage };
}
