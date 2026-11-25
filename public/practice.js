// Practice: the tool hub, a focused page for each trainer, and the server-graded Shoe Challenge.
import { startRound, loadEconomy, setEconomy, chipsHTML, economyState, outOfEnergy, confetti, flyStars, countUp } from './economy.js';
import * as bj from './bj.js';
import { esc, $, $$, Sound, ace, g, tableHTML, cardHTML, mountTray, mountStepper, mountNumber } from './ui.js';
import { TOOLS, createRunner, strategyQ, countQ, decksQ, trueCountQ, indexQ, betQ, chartHTML } from './trainers.js';

export const SKILL_NAMES = { 'strategy-hard': 'Hard totals', 'strategy-soft': 'Soft totals', 'strategy-pair': 'Pairs', count: 'Running count', decks: 'Deck estimation', truecount: 'True count', index: 'Index plays', insurance: 'Insurance', bet: 'Bet sizing' };
const SKILL_MAKERS = { 'strategy-hard': () => strategyQ({ pool: 'hard' }), 'strategy-soft': () => strategyQ({ pool: 'soft' }), 'strategy-pair': () => strategyQ({ pool: 'pair' }), count: () => countQ({ cards: 10, speed: 800 }), decks: () => decksQ({ shoe: 6 }), truecount: () => trueCountQ({ rcMin: -16, rcMax: 22, deckOptions: [.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] }), index: () => indexQ({ insurance: false }), insurance: () => indexQ({ insurance: true, insuranceOnly: true }), bet: () => betQ() };

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Questions in one practice round (one round = 1 Energy for free players; Weak Spots is free).
const ROUND_SIZE = { strategy: 10, count: 3, decks: 5, truecount: 10, index: 10, weak: 10 };

// Each trainer's settings: [key, label, [[value, text], ...]]. The first option is the default.
const SETTINGS = {
  strategy: [['pool', 'Hands', [['any', 'All'], ['hard', 'Hard'], ['soft', 'Soft'], ['pair', 'Pairs'], ['stiff', 'Stiffs']]], ['h17', 'Dealer', [['s17', 'Stands soft 17'], ['h17', 'Hits soft 17']]], ['surrender', 'Surrender', [['off', 'Off'], ['on', 'On']]]],
  count: [['cards', 'Cards', [['8', '8'], ['16', '16'], ['26', 'Half deck'], ['52', 'Full deck']]], ['speed', 'Speed', [['1200', 'Slow'], ['800', 'Medium'], ['500', 'Fast'], ['300', 'Pro']]], ['per', 'Deal', [['1', 'One at a time'], ['2', 'Two at a time'], ['table3', 'Full table · 3 players'], ['table5', 'Full table · 5 players']]]],
  decks: [['shoe', 'Shoe', [['6', '6 decks'], ['8', '8 decks']]], ['ask', 'Question', [['tray', 'Decks in tray'], ['remaining', 'Decks left']]], ['guides', 'Help', [['ref', '1-deck reference'], ['lines', 'Deck lines'], ['none', 'None']]]],
  truecount: [['timer', 'Timer', [['0', 'Off'], ['8', '8 seconds'], ['4', '4 seconds']]], ['range', 'Range', [['easy', 'Easy'], ['hard', 'Hard']]]],
  index: [['set', 'Hands', [['all', 'All'], ['stiff', 'Stiffs'], ['double', 'Doubles'], ['tens', 'Splitting tens']]], ['ins', 'Insurance', [['on', 'Included'], ['off', 'Off']]]],
};

function makeQuestion(tool, s) {
  if (tool === 'strategy') return strategyQ({ pool: s.pool, h17: s.h17 === 'h17', surrender: s.surrender === 'on' });
  if (tool === 'count') return s.per.startsWith('table') ? countQ({ table: true, seats: Number(s.per.slice(5)), speed: Number(s.speed) }) : countQ({ cards: Number(s.cards), speed: Number(s.speed), perFlash: Number(s.per) });
  if (tool === 'decks') return decksQ({ shoe: Number(s.shoe), ask: s.ask, markers: s.guides === 'lines', reference: s.guides !== 'none' });
  if (tool === 'truecount') return s.range === 'easy' ? trueCountQ({ rcMin: -10, rcMax: 12, deckOptions: [1, 2, 3, 4, 5, 6], timer: Number(s.timer) }) : trueCountQ({ rcMin: -16, rcMax: 22, deckOptions: [.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5], timer: Number(s.timer) });
  if (tool === 'index') return indexQ({ hands: { all: null, stiff: [12, 13, 15, 16], double: [9, 10, 11], tens: [20] }[s.set], insurance: s.ins === 'on' });
}

export function createPractice(ctx) {
  const { api, go, paths, localDate, onCleanup } = ctx;
  const soundButton = () => `<button type="button" class="icon-btn sound-toggle" aria-pressed="${Sound.on}" aria-label="${Sound.on ? 'Turn sound off' : 'Turn sound on'}">${g(Sound.on ? 'speaker' : 'mute')}</button>`;
  const wireSound = () => $$('.sound-toggle').forEach(b => b.onclick = () => { const on = Sound.toggle(); $$('.sound-toggle').forEach(x => { x.setAttribute('aria-pressed', on); x.innerHTML = g(on ? 'speaker' : 'mute'); }); });

  // ---- hub ------------------------------------------------------------------------------------
  async function hub() {
    let stats = { tools: {} }, weak = [];
    try { [stats, { skills: weak }] = await Promise.all([api('/api/practice/stats'), api('/api/practice/weak')]); } catch { /* show the hub without stats */ }
    const line = t => {
      const s = stats.tools[t.id];
      if (t.id === 'challenge') return s?.sessions ? `Best score ${s.best} · ${s.sessions} run${s.sessions === 1 ? '' : 's'}` : 'Not played yet';
      if (t.id === 'simulator') return 'Model EV, swings, and risk of ruin';
      return s?.questions ? `${Math.round(s.correct / s.questions * 100)}% accurate · best streak ${s.best_streak}` : 'Not practiced yet';
    };
    const group = (title, ids) => `<h2 class="hub-group">${title}</h2><div class="tool-cards">${TOOLS.filter(t => ids.includes(t.id)).map(t => `<a class="tool-card c-${t.color}" href="/practice/${t.id}"><span class="tool-icon">${g(t.glyph)}</span><span class="tool-copy"><strong>${t.name}</strong><span>${t.purpose}</span><small>${line(t)}</small></span>${g('next', 'tool-go')}</a>`).join('')}</div>`;
    const eco = await loadEconomy(api, localDate);
    $('#page').innerHTML = `<header class="page-hero"><div><h1>Practice</h1><p>Each tool trains one skill. Lessons use the same tools, so practice here whenever a skill feels shaky. ${eco?.plan?.pro ? 'Pro: practice as much as you like.' : 'Each round uses 1 Energy (the Shoe Challenge uses 3). Weak Spots is always free.'}</p></div><div data-eco-chips>${chipsHTML(eco)}</div></header>`
      + (weak.length ? `<a class="weak-card" href="/practice/weak"><span class="tool-icon">${g('target')}</span><span class="tool-copy"><strong>Practice your weak spots</strong><span>A mixed session built from the skills you’ve missed most: ${weak.map(w => `${SKILL_NAMES[w.skill]} (${Math.round(w.rate * 100)}% missed)`).join(', ')}.</span></span>${g('next', 'tool-go')}</a>` : `<div class="weak-card empty"><span class="tool-icon">${g('target')}</span><span class="tool-copy"><strong>Weak spots</strong><span>Finish a few lessons or practice sessions and Ace will build a session from the skills you miss most.</span></span></div>`)
      + group('Skill trainers', ['strategy', 'count', 'decks', 'truecount', 'index'])
      + group('Put it all together', ['challenge'])
      + group('Plan your game', ['simulator']);
  }

  // ---- a trainer -------------------------------------------------------------------------------
  async function toolPage(tool) {
    let weakSkills = [];
    if (tool === 'weak') { try { weakSkills = (await api('/api/practice/weak')).skills.map(w => w.skill); } catch { weakSkills = []; } if (!weakSkills.length) { go('/practice'); return; } }
    const meta = tool === 'weak' ? { id: 'weak', name: 'Weak spots', glyph: 'target', color: 'red', purpose: weakSkills.map(k => SKILL_NAMES[k]).join(' · ') } : TOOLS.find(t => t.id === tool), defs = SETTINGS[tool] || [];
    let saved = {}; try { saved = JSON.parse(localStorage.getItem('ff-practice-' + tool) || '{}'); } catch { saved = {}; }
    const s = Object.fromEntries(defs.map(([k, , opts]) => [k, opts.some(o => o[0] === saved[k]) ? saved[k] : opts[0][0]]));
    const round = await startRound(ctx, tool);
    if (!round) { if (location.pathname !== '/practice') go('/practice'); return; }
    const size = ROUND_SIZE[tool] || 10;
    const stats = { questions: 0, correct: 0, streak: 0, best: 0, started: Date.now() }, results = [];
    let turn = 0, asked = 0, logged = false;
    const nextQ = () => { if (asked >= size) return null; asked++; return tool === 'weak' ? SKILL_MAKERS[weakSkills[turn++ % weakSkills.length]]() : makeQuestion(tool, s); };

    $('#app').innerHTML = `<main id="main" class="coach-screen practice c-${meta.color}">
      <header class="coach-top practice-top"><button type="button" class="icon-btn" id="pr-end" aria-label="End practice">${g('close')}</button><div class="pr-title"><span class="tool-icon sm">${g(meta.glyph)}</span><div><strong>${meta.name}</strong><small>${meta.purpose}</small></div></div>
        <div class="pr-stats"><span class="chip streak" title="Current streak">${g('flame')}<b id="pr-streak">0</b></span><span class="chip" title="Correct answers this round"><b id="pr-score">0/${size}</b></span></div>
        ${tool === 'strategy' ? `<button type="button" class="pill-btn" id="pr-chart">${g('book')} Chart</button>` : ''}${defs.length ? `<button type="button" class="icon-btn" id="pr-gear" aria-expanded="false" aria-controls="pr-settings" aria-label="Settings">${g('gear')}</button>` : ''}${soundButton()}</header>
      <div class="settings-bar" id="pr-settings" hidden>${defs.map(([k, label, opts]) => `<div class="seg-group"><span>${label}</span><div class="segmented" role="radiogroup" aria-label="${label}">${opts.map(([v, t]) => `<button type="button" role="radio" data-k="${k}" data-v="${v}" aria-checked="${s[k] === v}">${t}</button>`).join('')}</div></div>`).join('')}</div>
      <div class="round-bar" aria-hidden="true"><span id="round-fill"></span></div>
      <section class="coach-body" id="coach-body"></section><footer class="coach-foot" id="coach-foot"></footer>
      <div class="sheet-shade" hidden><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"></div></div></main>`;
    wireSound();
    const body = $('#coach-body'), foot = $('#coach-foot'), shade = $('.sheet-shade'), sheet = $('.sheet');
    const paintStats = () => { $('#pr-streak').textContent = stats.streak; $('#pr-score').textContent = `${stats.correct}/${size}`; $('.chip.streak').classList.toggle('lit', stats.streak > 0); $('#round-fill').style.width = Math.round(stats.questions / size * 100) + '%'; };
    const runner = createRunner({
      body, foot, next: nextQ,
      onResult: (q, r) => { results.push(r.record); stats.questions++; if (r.ok) { stats.correct++; stats.streak++; stats.best = Math.max(stats.best, stats.streak); } else stats.streak = 0; paintStats(); },
      onKeyExtra: e => { if (e.key === 'Escape' && !shade.hidden) { shade.hidden = true; return true; } return false; },
      onEmpty: () => endRound(),
    });
    onCleanup(() => runner.destroy());
    runner.start();

    const gear = $('#pr-gear');
    if (gear) gear.onclick = () => { const bar = $('#pr-settings'); bar.hidden = !bar.hidden; gear.setAttribute('aria-expanded', String(!bar.hidden)); };
    $$('[data-k]').forEach(b => b.onclick = () => {
      s[b.dataset.k] = b.dataset.v; localStorage.setItem('ff-practice-' + tool, JSON.stringify(s));
      $$(`[data-k="${b.dataset.k}"]`).forEach(x => x.setAttribute('aria-checked', String(x === b)));
      Sound.play('select'); runner.start();
    });
    $('#pr-chart')?.addEventListener('click', () => {
      const q = runner.current, rules = { h17: s.h17 === 'h17', surrender: s.surrender === 'on' };
      sheet.className = 'sheet wide';
      sheet.innerHTML = `<h2 id="sheet-title">Basic strategy · ${rules.h17 ? 'H17' : 'S17'}${rules.surrender ? ', surrender' : ''}</h2>${chartHTML({ rules, highlight: q?.cards ? { row: bj.chartRow(q.cards), up: q.dealer } : null })}<button type="button" class="primary chunky" id="sheet-close">Back to practice</button>`;
      shade.hidden = false; $('#sheet-close').onclick = () => { shade.hidden = true; }; $('#sheet-close').focus();
    });
    shade.onclick = e => { if (e.target === shade) shade.hidden = true; };

    async function endRound() {
      if (logged) return; logged = true;
      runner.destroy();
      if (!stats.questions) { go('/practice'); return; }
      let r = { xp: 0, stars: 0, energyBack: 0 };
      try { r = await api('/api/practice/log', 'POST', { tool, round, results, bestStreak: stats.best, seconds: Math.round((Date.now() - stats.started) / 1000), day: localDate() }); } catch { /* still show the summary */ }
      const eco = await loadEconomy(api, localDate);
      const pct = Math.round(stats.correct / stats.questions * 100);
      Sound.play(pct >= 90 ? 'complete' : 'reveal'); if (pct >= 90) confetti({ count: 70 });
      const pro = eco?.plan?.pro, cost = tool === 'weak' ? 0 : 1;
      sheet.className = 'sheet';
      sheet.innerHTML = `${ace(pct >= 90 ? 'wow' : 'happy', 'ace-md pop')}<h2 id="sheet-title">${pct === 100 ? 'Flawless round!' : pct >= 90 ? 'Great round!' : 'Round complete'}</h2><div class="plan-grid four"><div class="stat-tile green"><small>Accuracy</small><strong><span class="count" data-to="${pct}">0</span>%</strong></div><div class="stat-tile orange"><small>Best streak</small><strong>${g('flame')} ${stats.best}</strong></div><div class="stat-tile yellow"><small>XP</small><strong>${g('bolt')} +<span class="count" data-to="${r.xp}">0</span></strong></div><div class="stat-tile purple"><small>Stars</small><strong id="sum-stars">${g('star')} +<span class="count" data-to="${r.stars || 0}">0</span></strong></div></div>${r.energyBack ? `<p class="goal-hit">${g('bolt')} +${r.energyBack} Energy earned back for accuracy</p>` : pct < 90 && !pro ? '<p class="muted small">Score 90% or better to earn Stars. A perfect round earns 1 Energy back.</p>' : ''}
        <button type="button" class="primary chunky" id="sum-more">${cost && !pro ? `Next round · ${g('bolt')} ${cost}` : 'Next round'}</button><button type="button" class="ghost" id="sum-done">Done</button>`;
      shade.hidden = false;
      $$('.count', sheet).forEach((el, i) => setTimeout(() => countUp(el, Number(el.dataset.to)), 200 + i * 150));
      if (r.stars) setTimeout(() => flyStars($('#sum-stars'), 4), 700);
      $('#sum-done').onclick = () => go('/practice');
      $('#sum-more').onclick = () => toolPage(tool);
      $('#sum-more').focus();
    }
    $('#pr-end').onclick = () => { if (!stats.questions) { go('/practice'); return; } endRound(); };
  }

  // ---- Shoe Challenge ----------------------------------------------------------------------------
  async function challengePage() {
    const meta = TOOLS.find(t => t.id === 'challenge');
    $('#app').innerHTML = `<main id="main" class="coach-screen practice c-${meta.color}"><header class="coach-top practice-top"><button type="button" class="icon-btn" id="ch-quit" aria-label="Leave the challenge">${g('close')}</button><div class="pr-title"><span class="tool-icon sm">${g('trophy')}</span><div><strong>Shoe Challenge</strong><small id="ch-round">12 rounds · 6-deck shoe</small></div></div><div class="pr-stats"><span class="hearts" id="ch-hearts" aria-label="3 hearts left">${g('heart').repeat(3)}</span><span class="chip xp"><b id="ch-score">0</b></span></div>${soundButton()}</header><section class="coach-body" id="coach-body"></section><footer class="coach-foot" id="coach-foot"></footer></main>`;
    wireSound();
    const body = $('#coach-body'), foot = $('#coach-foot');
    $('#ch-quit').onclick = () => go('/practice');
    let game = null, keyHandler = null;
    const onKey = e => keyHandler?.(e);
    document.addEventListener('keydown', onKey); onCleanup(() => document.removeEventListener('keydown', onKey));
    const setHearts = h => { $('#ch-hearts').innerHTML = Array.from({ length: 3 }, (_, i) => g('heart', i < h ? '' : 'lost')).join(''); $('#ch-hearts').setAttribute('aria-label', `${h} heart${h === 1 ? '' : 's'} left`); };
    const foot1 = (label, enabled, onClick, hint = '') => { foot.className = 'coach-foot'; foot.innerHTML = `<span class="foot-hint">${hint}</span><button type="button" class="primary chunky" id="ch-next" ${enabled ? '' : 'disabled'}>${label}</button>`; $('#ch-next').onclick = onClick; };

    async function intro() {
      let board = { players: [] }; try { board = await api('/api/challenge/leaderboard'); } catch { /* optional */ }
      body.innerHTML = `<div class="coach-intro">${ace('happy', 'ace-lg bob')}<h1>Shoe Challenge</h1><p>Twelve rounds from a real shuffled six-deck shoe. Keep your running count across rounds. Every third round, read the discard tray, find the true count, and size your bet. Every other round, play a hand using the count. Each mistake costs a heart.</p>${board.players.length ? `<div class="leaderboard"><h2>Leaderboard</h2><ol>${board.players.map(p => `<li><span>${esc(p.username)}</span><b>${p.best}</b></li>`).join('')}</ol></div>` : ''}</div>`;
      foot1('Start', true, start, 'Enter to start');
      keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); start(); } };
    }
    async function start() {
      keyHandler = null;
      try { game = await api('/api/challenge/start', 'POST', {}); } catch (e) { if (/Energy/.test(e.message)) { await loadEconomy(api, localDate); outOfEnergy(ctx, economyState(), start); } else ctx.toast(e.message); return; }
      loadEconomy(api, localDate);
      setHearts(game.hearts); $('#ch-score').textContent = 0;
      playRound(game.round);
    }
    async function playRound(r) {
      $('#ch-round').textContent = `Round ${r.n} of ${r.total}`;
      const answers = {};
      // 1. Deal this round's cards.
      body.innerHTML = `<div class="q"><p class="q-eyebrow">Round ${r.n} · ${r.cards.length} cards</p><h1 class="q-title">${r.n === 1 ? 'Fresh shoe. The count starts at 0.' : 'Keep counting from where you left off.'}</h1><div class="flash-stage"><div class="flash-cards"><span class="flash-ready">${ace('think', 'ace-sm')}<b>Dealing…</b></span></div><div class="flash-progress"><span></span></div></div></div>`;
      foot.className = 'coach-foot'; foot.innerHTML = '<span></span>';
      const stage = $('.flash-cards', body), bar = $('.flash-progress span', body);
      await sleep(800);
      for (let i = 0; i < r.cards.length; i++) { if (!stage.isConnected) return; stage.innerHTML = cardHTML(r.cards[i], i, { cls: 'flash-in' }); bar.style.width = `${(i + 1) / r.cards.length * 100}%`; Sound.play('deal'); await sleep(750); }
      // 2. Ask each part in turn.
      for (const part of r.parts) {
        if (!body.isConnected) return;
        const v = await askPart(part, r, answers);
        answers[part] = v;
      }
      // 3. Grade on the server.
      let res;
      try { res = await api('/api/challenge/answer', 'POST', { id: game.id, answers }); } catch (e) { ctx.toast(e.message); return; }
      const allOk = res.results.every(x => x.ok);
      Sound.play(allOk ? 'correct' : 'wrong');
      setHearts(res.hearts); $('#ch-score').textContent = res.score;
      const fmt = (part, v) => v === null || v === undefined ? '—' : part === 'play' ? bj.ACTIONS[v] || v : part === 'decks' ? bj.halves(v) : part === 'bet' ? `${v} unit${v === 1 ? '' : 's'}` : bj.signed(v);
      const label = { rc: 'Running count', decks: 'Decks in tray', tc: 'True count', bet: 'Bet', play: 'Play' };
      body.innerHTML = `<div class="q"><h1 class="q-title">${allOk ? 'Clean round!' : 'Round results'}</h1><ul class="results-list">${res.results.map(x => `<li class="${x.ok ? 'ok' : 'bad'}">${g(x.ok ? 'check' : 'close')}<span>${label[x.part]}</span><b>${x.ok ? fmt(x.part, x.given) : `${fmt(x.part, x.given)} → ${fmt(x.part, x.correct)}`}</b></li>`).join('')}</ul>${res.done ? '' : `<p class="teach-tip">${g('count')}<span>The true running count is now ${bj.signed(res.rc)}. Continue from there.</span></p>`}</div>`;
      if (res.done) { foot1('See results', true, () => over(res)); keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); over(res); } }; }
      else { foot1('Next round', true, () => { keyHandler = null; playRound(res.round); }, 'Enter to continue'); keyHandler = e => { if (e.key === 'Enter') { e.preventDefault(); keyHandler = null; playRound(res.round); } }; }
      $('#ch-next').focus();
    }
    function askPart(part, r, answers) {
      return new Promise(resolve => {
        let ready = false, read = () => null;
        const done = () => { if (!ready) return; keyHandler = null; Sound.play('tap'); resolve(read()); };
        const ok = v => { ready = v; const b = $('#ch-next'); if (b) b.disabled = !v; };
        if (part === 'play') {
          const acts = ['H', 'S', 'D', ...(bj.isPair(r.hand) ? ['P'] : [])];
          body.innerHTML = `<div class="q"><p class="q-eyebrow">Play this hand using your true count</p><h1 class="q-title">You have ${bj.handLabel(r.hand)} against ${r.dealer === 1 ? 'an ace' : 'a ' + bj.upName(r.dealer)}.</h1>${tableHTML({ dealer: r.dealer, cards: r.hand })}<div class="action-row">${acts.map(a => `<button type="button" class="act act-${a}" data-act="${a}"><span>${bj.ACTIONS[a]}</span><kbd>${a}</kbd></button>`).join('')}</div></div>`;
          foot.className = 'coach-foot'; foot.innerHTML = '<span class="foot-hint">Tap a play or press its key</span>';
          const choose = a => { keyHandler = null; Sound.play('select'); resolve(a); };
          $$('[data-act]', body).forEach(b => b.onclick = () => choose(b.dataset.act));
          keyHandler = e => { const k = e.key.toUpperCase(); if (acts.includes(k)) { e.preventDefault(); choose(k); } };
          return;
        }
        const title = { rc: 'What’s the running count now?', decks: 'How many decks are in the discard tray?', tc: 'What’s the true count?', bet: 'How many units do you bet?' }[part];
        const sub = part === 'tc' ? `Your count ${answers.rc === null ? '?' : bj.signed(answers.rc)} ÷ ${answers.decks ? bj.halves(r.shoe - answers.decks) : '?'} decks left, rounded down` : part === 'bet' ? 'Ramp: 1 unit at +1 or lower, then true count − 1, up to 12' : part === 'decks' ? '6-deck shoe · nearest half deck' : 'Hi‑Lo, counting every card since the shuffle';
        body.innerHTML = `<div class="q"><p class="q-eyebrow">${sub}</p><h1 class="q-title">${title}</h1>${part === 'decks' ? '<div class="tray-row"><div class="tray-slot"></div><div class="answer-slot"></div></div>' : '<div class="answer-slot"></div>'}</div>`;
        foot1('Next', false, done, part === 'decks' ? 'Use − and + to answer' : 'Type your answer, then press Enter');
        if (part === 'decks') {
          mountTray($('.tray-slot', body), { decks: r.tray, shoe: r.shoe, reference: true });
          const st = mountStepper($('.answer-slot', body), { min: .5, max: r.shoe - .5, label: 'decks in the tray', onChange: () => ok(true) });
          read = () => st.value;
          keyHandler = e => { if (st.key(e)) e.preventDefault(); else if (e.key === 'Enter' && ready) { e.preventDefault(); done(); } };
        } else {
          const n = mountNumber($('.answer-slot', body), { label: title, onChange: v => ok(v !== null) });
          read = () => n.value;
          keyHandler = e => { if (e.key === 'Enter' && ready) { e.preventDefault(); done(); } };
        }
      });
    }
    function over(res) {
      keyHandler = null;
      Sound.play('complete');
      body.innerHTML = `<div class="lesson-done">${ace(res.hearts ? 'wow' : 'oops', 'ace-xl pop')}<h1>${res.hearts ? 'Shoe complete!' : 'Out of hearts'}</h1><div class="plan-grid three"><div class="stat-tile yellow"><small>Score</small><strong>${res.score}</strong></div><div class="stat-tile orange"><small>Best streak</small><strong>${g('flame')} ${res.bestStreak}</strong></div><div class="stat-tile green"><small>XP earned</small><strong>${g('bolt')} +${res.xp}</strong></div></div><p class="muted">${res.score >= res.best ? 'A new personal best!' : `Your best is ${res.best}.`}</p></div>`;
      foot.className = 'coach-foot'; foot.innerHTML = `<button type="button" class="ghost" id="ch-done">Back to Practice</button><button type="button" class="primary chunky" id="ch-again">Play again</button>`;
      $('#ch-done').onclick = () => go('/practice'); $('#ch-again').onclick = start; $('#ch-again').focus();
    }
    intro();
  }

  return { hub, toolPage, challengePage };
}
