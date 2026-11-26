// Practice: the tool hub, a focused page for each trainer, and the server-graded Shoe Challenge.
import { react } from './reactions.js';
import { energyMeter, guardContinue } from './economy.js';
import { startRound, loadEconomy, setEconomy, chipsHTML, economyState, outOfEnergy, confetti, flyStars, countUp } from './economy.js';
import * as bj from './bj.js';
import { esc, $, $$, Sound, ace, g, tableHTML, cardHTML, mountTray, mountStepper, mountNumber } from './ui.js';
import { freePlayPage } from './freeplay.js';
import { cardsFor } from './weakness.js';
import { markPack } from './builder.js';
import { dailyCard } from './arcade.js';
import { TOOLS, createRunner, strategyQ, countQ, decksQ, trueCountQ, indexQ, betQ, chartHTML } from './trainers.js';

export const SKILL_NAMES = { 'strategy-hard': 'Hard totals', 'strategy-soft': 'Soft totals', 'strategy-pair': 'Pairs', count: 'Running count', decks: 'Deck estimation', truecount: 'True count', index: 'Index plays', insurance: 'Insurance', bet: 'Bet sizing' };
const SKILL_MAKERS = { 'strategy-hard': () => strategyQ({ pool: 'hard' }), 'strategy-soft': () => strategyQ({ pool: 'soft' }), 'strategy-pair': () => strategyQ({ pool: 'pair' }), count: () => countQ({ cards: 10, speed: 800 }), decks: () => decksQ({ shoe: 6 }), truecount: () => trueCountQ({ rcMin: -16, rcMax: 22, deckOptions: [.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] }), index: () => indexQ({ insurance: false }), insurance: () => indexQ({ insurance: true, insuranceOnly: true }), bet: () => betQ() };

const SKILL_INFO = {
  'strategy-hard': { glyph: 'cards', color: 'blue', purpose: 'Hard totals against every upcard, with rule changes as you improve.' },
  'strategy-soft': { glyph: 'cards', color: 'teal', purpose: 'Soft hands: when to double, stand, or hit an ace hand.' },
  'strategy-pair': { glyph: 'cards', color: 'purple', purpose: 'Which pairs to split, and when the rules change that.' },
  count: { glyph: 'count', color: 'orange', purpose: 'Keep the Hi‑Lo running count as the cards come faster.' },
  decks: { glyph: 'stack', color: 'teal', purpose: 'Read the discard tray to the half deck.' },
  truecount: { glyph: 'divide', color: 'purple', purpose: 'Turn the running count into a true count, under a timer.' },
  index: { glyph: 'target', color: 'pink', purpose: 'The index plays where the count beats basic strategy.' },
  insurance: { glyph: 'shield', color: 'red', purpose: 'Take insurance only when the true count says so.' },
  bet: { glyph: 'chip', color: 'gold', purpose: 'Size your bet from the true count with a ramp.' },
};
const SKILL_GROUPS = [['Basic strategy', ['strategy-hard', 'strategy-soft', 'strategy-pair']], ['Counting', ['count', 'decks', 'truecount']], ['Playing the count', ['index', 'insurance', 'bet']]];
const NEXT_TIER = [[900, 'Learner'], [1100, 'Solid'], [1300, 'Sharp'], [1500, 'Expert']];
const EXTRA_TOOLS = [
  { id: 'rush', name: 'Blackjack Rush', glyph: 'bolt', color: 'orange', purpose: 'Three strikes, a shrinking clock, and harder hands every few answers. Weekly leaderboard.' },
  { id: 'storm', name: 'Count Storm', glyph: 'count', color: 'purple', purpose: 'Keep the running count as cards arrive faster. Three strikes.' },
  { id: 'backcount', name: 'Back-count two tables', glyph: 'count', color: 'teal', purpose: 'Watch two shoes at once, keep both counts, and pick the table worth sitting down at.' },
  { id: 'casino', name: 'Casino Floor', glyph: 'pin', color: 'green', purpose: 'A full table at real speed: other players, noise, a dealer with a personality, mistakes to catch, and surprise count checks.' },
  { id: 'testout', name: 'Casino-ready test-out', glyph: 'trophy', color: 'gold', purpose: 'Five timed sections at casino speed. Pass them all for a shareable certificate.' },
  { id: 'builder', name: 'Drill builder', glyph: 'gear', color: 'blue', purpose: 'Pick exact hands, upcards, and rules, or work through leveled drill packs.' },
];
const EDGE_TOOL = { id: 'edge', name: 'House Edge Calculator', glyph: 'divide', color: 'teal', purpose: 'Enter a table’s rules and see the house edge, what each rule costs, and your cost per hour.' };
const pick = a => a[Math.floor(Math.random() * a.length)];
// Harder versions of each skill's questions as the rating climbs (harder items move the rating more).
function skillQuestion(skill, r) {
  const hard = r >= 1150, harder = r >= 1300, chance = p => Math.random() < p;
  if (skill.startsWith('strategy-')) return strategyQ({ pool: skill.slice(9), h17: hard && chance(.5), surrender: hard && chance(.4), das: !(harder && chance(.3)) });
  if (skill === 'count') return r < 1050 ? countQ({ cards: 8, speed: 1000 }) : r < 1200 ? countQ({ cards: pick([12, 16]), speed: 800 }) : r < 1350 ? (chance(.5) ? countQ({ table: true, seats: 3, speed: 700 }) : countQ({ cards: 20, speed: 600, perFlash: 2 })) : (chance(.5) ? countQ({ table: true, seats: 5, speed: 500 }) : countQ({ cards: 26, speed: 400, perFlash: 2 }));
  if (skill === 'decks') return decksQ({ shoe: hard && chance(.5) ? 8 : 6, ask: hard && chance(.5) ? 'remaining' : 'tray', reference: !harder, markers: !hard });
  if (skill === 'truecount') return r < 1150 ? trueCountQ({ rcMin: -10, rcMax: 12, deckOptions: [1, 2, 3, 4, 5, 6] }) : trueCountQ({ rcMin: -16, rcMax: 22, deckOptions: [.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5], timer: r >= 1400 ? 4 : r >= 1250 ? 8 : 0 });
  if (skill === 'index') return indexQ({ insurance: false });
  if (skill === 'insurance') return indexQ({ insurance: true, insuranceOnly: true });
  if (skill === 'bet') return betQ({ max: hard ? pick([8, 12, 16]) : 12 });
  return SKILL_MAKERS[skill]();
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Questions in one practice round (one round = 1 Energy for free players; Weak Spots is free).
const ROUND_SIZE = { strategy: 10, count: 3, decks: 5, truecount: 10, index: 10, weak: 10, 'skill-count': 4, 'skill-decks': 6 };

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

  // ---- Practice: one trainer per skill rating ---------------------------------------------------
  async function hub() {
    const [weak, sk, path, rev] = await Promise.all([api('/api/practice/weak').then(r => r.skills).catch(() => []), api('/api/skills?day=' + localDate()).catch(() => ({ skills: [] })), api('/api/path?day=' + localDate()).catch(() => null), api('/api/review').catch(() => ({ open: 0 }))]);
    const eco = await loadEconomy(api, localDate);
    // The next checkpoint target for each skill on the learner's path.
    const targets = {};
    for (const u of path?.units || []) for (const l of u.lessons) if (l.checkpoint && !['done', 'tested', 'pro'].includes(l.status)) for (const gt of l.gate || []) if (!gt.met && !targets[gt.skill]) targets[gt.skill] = { target: gt.target, unit: u.title, current: l.status === 'gated' };
    const card = x => {
      const info = SKILL_INFO[x.skill], r = x.rating ?? 1000, t = targets[x.skill], i = NEXT_TIER.findIndex(n => n[0] > r), next = NEXT_TIER[i];
      const goal = t ? t.target : next ? next[0] : null, from = t ? Math.min(r, t.target - 200) : next ? (NEXT_TIER[i - 1]?.[0] ?? 800) : 0;
      const pct = goal ? Math.max(4, Math.min(100, Math.round((r - from) / Math.max(1, goal - from) * 100))) : 100;
      return `<a class="tool-card skill-card c-${info.color}${t?.current ? ' gating' : ''}" href="/practice/skill/${x.skill}"><span class="tool-icon">${g(info.glyph)}</span><span class="tool-copy skill-copy"><strong>${x.name}</strong><span>${info.purpose}</span>
        <span class="skill-meter" aria-hidden="true"><span style="width:${pct}%"></span></span><small>${x.n ? `<b>${x.rating}</b> ${x.tier || 'rating'}` : 'Not rated yet'}${t ? ` · ${t.current ? 'unlocks your checkpoint' : 'next checkpoint'} at <b>${t.target}</b>` : next ? ` · ${next[1]} at ${next[0]}` : ' · top tier'}</small></span>${g('next', 'tool-go')}</a>`;
    };
    const gating = Object.entries(targets).filter(([, t]) => t.current);
    $('#page').innerHTML = `<header class="page-hero"><div><h1>Practice</h1><p>One trainer for each skill rating. Every answer moves that rating, and the questions get harder as you improve. Checkpoints open when your ratings reach their targets. ${eco?.plan?.pro ? 'Pro: practice as much as you like.' : 'Each round uses 1 Energy. Weak Spots and Hand Review are free.'}</p></div><div data-eco-chips>${chipsHTML(eco)}</div></header>`
      + (gating.length ? `<div class="gate-banner">${g('shield')}<span><b>Your next checkpoint is waiting.</b> Raise ${gating.map(([k, t]) => `${SKILL_NAMES[k]} to ${t.target}`).join(' and ')} to unlock it.</span></div>` : '')
      + `<div class="practice-top-cards">${await dailyCard(api, localDate, true)}<a class="weak-card review-link" href="/practice/review"><span class="tool-icon">${g('book')}</span><span class="tool-copy"><strong>Hand Review</strong><span>${rev.open ? `${rev.open} missed decision${rev.open === 1 ? '' : 's'} to fix.` : 'Every hand you miss lands here.'}</span></span>${g('next', 'tool-go')}</a>`
      + `<a class="weak-card workout-tile" href="/practice/workout"><span class="tool-icon">${g('flame')}</span><span class="tool-copy"><strong>Daily Workout</strong><span>${eco?.plan?.pro ? 'Five minutes built from your leaks and lowest skills.' : 'A five-minute mixed session. Pro builds it from your weak spots.'}</span></span>${g('next', 'tool-go')}</a>`
      + `<a class="weak-card map-link" href="/practice/weakness"><span class="tool-icon">${g('chart')}</span><span class="tool-copy"><strong>Weakness map</strong><span>Your accuracy on every hand in the chart, and your costliest leaks.</span></span>${g('next', 'tool-go')}</a>`
      + (weak.length ? `<a class="weak-card" href="/practice/weak"><span class="tool-icon">${g('target')}</span><span class="tool-copy"><strong>Weak spots</strong><span>${weak.map(w => SKILL_NAMES[w.skill]).join(', ')}</span></span>${g('next', 'tool-go')}</a>` : `<div class="weak-card empty"><span class="tool-icon">${g('target')}</span><span class="tool-copy"><strong>Weak spots</strong><span>After a few sessions Ace builds one from your misses.</span></span></div>`) + '</div>'
      + SKILL_GROUPS.map(([title, ids]) => `<h2 class="hub-group">${title}</h2><div class="tool-cards skill-cards">${ids.map(id => card(sk.skills.find(x => x.skill === id) || { skill: id, name: SKILL_NAMES[id], n: 0 })).join('')}</div>`).join('')
      + `<p class="muted small hub-foot">Your <a href="/practice/report">weekly report</a> shows how this week compares with last. Looking for the configurable trainers, the Free Play table, the Shoe Challenge, or the calculators? They’re in <a href="/tools">Tools</a>.</p>`;
  }

  // ---- Tools: configurable trainers, play modes, and calculators --------------------------------
  async function toolsHub() {
    let stats = { tools: {} };
    try { stats = await api('/api/practice/stats'); } catch { /* show without stats */ }
    const eco = await loadEconomy(api, localDate), pro = eco?.plan?.pro;
    const line = t => {
      const s = stats.tools[t.id];
      if (t.id === 'challenge') return s?.sessions ? `Best score ${s.best} · ${s.sessions} run${s.sessions === 1 ? '' : 's'}` : 'Not played yet';
      if (t.id === 'simulator') return pro ? 'EV, swings, risk of ruin, SCORE' : 'Part of Pro';
      if (t.id === 'edge') return 'Free for everyone';
      if (t.id === 'rush' || t.id === 'storm') return pro ? 'Unlimited runs' : '1 free run a day';
      if (t.id === 'builder') return 'Build free · save and packs with Pro';
      if (t.id === 'backcount') { const s = stats.tools.backcount; return s?.questions ? `${Math.round(s.correct / s.questions * 100)}% of counts right` : 'Not used yet'; }
      if (t.id === 'casino') return pro ? 'Every dealer and condition' : 'Dealer of the month free';
      if (t.id === 'testout') return pro ? 'One attempt a month' : 'Part of Pro';
      return s?.questions ? `${Math.round(s.correct / s.questions * 100)}% accurate · best streak ${s.best_streak}` : 'Not used yet';
    };
    const all = [...TOOLS, EDGE_TOOL, ...EXTRA_TOOLS];
    const group = (title, ids) => `<h2 class="hub-group">${title}</h2><div class="tool-cards">${ids.map(id => all.find(t => t.id === id)).map(t => `<a class="tool-card c-${t.color}" href="/tools/${t.id}"><span class="tool-icon">${g(t.glyph)}</span><span class="tool-copy"><strong>${t.name}${t.id === 'simulator' && !pro ? ` <span class="pro-tag">${g('crown')} Pro</span>` : ''}</strong><span>${t.purpose}</span><small>${line(t)}</small></span>${g('next', 'tool-go')}</a>`).join('')}</div>`;
    $('#page').innerHTML = `<header class="page-hero"><div><h1>Tools</h1><p>Set up drills with any rules and speed, play real hands, and run the numbers on a game. Practice trains one skill rating at a time; Tools let you set things up your way.</p></div><div data-eco-chips>${chipsHTML(eco)}</div></header>`
      + group('Arcade', ['rush', 'storm'])
      + group('Calculators', ['edge', 'simulator'])
      + group('Configurable trainers', ['builder', 'strategy', 'count', 'backcount', 'decks', 'truecount', 'index'])
      + group('Play and prove it', ['casino', 'table', 'challenge', 'testout']);
  }

  // ---- a trainer -------------------------------------------------------------------------------
  async function toolPage(tool) {
    let weakSkills = [];
    if (tool === 'weak') { try { weakSkills = (await api('/api/practice/weak')).skills.map(w => w.skill); } catch { weakSkills = []; } if (!weakSkills.length) { go('/practice'); return; } }
    const skill = tool.startsWith('skill-') ? tool.slice(6) : null;
    let home = tool === 'workout' ? '/practice' : tool === 'drill' ? '/practice/weakness' : skill || tool === 'weak' ? '/practice' : '/tools';
    let drillCells = [], spec = {};
    if (tool === 'drill') {
      try { spec = JSON.parse(sessionStorage.getItem('ff-drill') || '[]'); } catch { spec = []; }
      if (Array.isArray(spec)) spec = { cells: spec };
      drillCells = spec.cells || []; home = spec.home || home;
      if (!drillCells.length) { go(home); return; }
    }
    const ruleOf = v => (v === 'mix' ? Math.random() < 0.5 : v === 'on');
    if (skill && !SKILL_INFO[skill]) { go('/practice'); return; }
    let rating = 1000, plan = [];
    if (tool === 'workout') {
      // Pro: built from your leaks and your two lowest skills. Free: a fixed mixed session.
      const eco0 = await loadEconomy(api, localDate);
      if (eco0?.plan?.pro) {
        let w = { cells: [] }, sk = { skills: [] };
        try { [w, sk] = await Promise.all([api('/api/weakness'), api('/api/skills?day=' + localDate())]); } catch { /* fall back below */ }
        const leaks = w.cells.filter(x => x.misses).sort((a, b) => b.misses / b.attempts - a.misses / a.attempts || b.misses - a.misses).slice(0, 4);
        const low = sk.skills.filter(x => x.n >= 5).sort((a, b) => a.rating - b.rating).slice(0, 2);
        plan = [...leaks.map(c => () => strategyQ({ hand: cardsFor(c.cell), up: c.up })), ...low.flatMap(x => [0, 1, 2].map(() => () => skillQuestion(x.skill, x.rating)))];
      }
      const fixed = [() => strategyQ({ pool: 'hard' }), () => strategyQ({ pool: 'soft' }), () => strategyQ({ pool: 'pair' }), () => strategyQ({ pool: 'stiff' }), () => countQ({ cards: 8, speed: 900 }), () => countQ({ cards: 12, speed: 800 }), () => trueCountQ({ rcMin: -10, rcMax: 12, deckOptions: [1, 2, 3, 4, 5] }), () => trueCountQ({ rcMin: -10, rcMax: 12, deckOptions: [1, 2, 3, 4, 5] }), () => betQ(), () => indexQ({ insurance: false })];
      while (plan.length < 10) plan.push(fixed[plan.length % fixed.length]);
      plan = plan.slice(0, 10).sort(() => Math.random() - 0.5);
    }
    if (skill) { try { rating = (await api('/api/skills?day=' + localDate())).skills.find(x => x.skill === skill)?.rating ?? 1000; } catch { /* default */ } }
    const meta = tool === 'workout' ? { id: 'workout', name: 'Daily Workout', glyph: 'flame', color: 'orange', purpose: 'About five minutes, built from your weakest spots' } : tool === 'drill' ? { id: 'drill', glyph: 'target', color: 'red', name: spec.name || 'Hand drill', purpose: drillCells.length === 1 ? 'One hand until it’s automatic' : `${drillCells.length} spots${spec.home ? '' : ' from your weakness map'}` } : skill ? { id: tool, name: SKILL_NAMES[skill] + ' trainer', ...SKILL_INFO[skill] } : tool === 'weak' ? { id: 'weak', name: 'Weak spots', glyph: 'target', color: 'red', purpose: weakSkills.map(k => SKILL_NAMES[k]).join(' · ') } : TOOLS.find(t => t.id === tool), defs = SETTINGS[tool] || [];
    let saved = {}; try { saved = JSON.parse(localStorage.getItem('ff-practice-' + tool) || '{}'); } catch { saved = {}; }
    const s = Object.fromEntries(defs.map(([k, , opts]) => [k, opts.some(o => o[0] === saved[k]) ? saved[k] : opts[0][0]]));
    const round = await startRound(ctx, tool);
    if (!round) { if (location.pathname !== home) go(home); return; }
    const size = tool === 'workout' ? plan.length : (tool === 'drill' && spec.size) || ROUND_SIZE[tool] || 10;
    const stats = { questions: 0, correct: 0, streak: 0, best: 0, started: Date.now() }, results = [];
    let turn = 0, asked = 0, logged = false;
    const nextQ = () => { if (asked >= size) return null; asked++; if (tool === 'workout') return plan[asked - 1](); if (tool === 'drill') { const [cell, up] = drillCells[Math.floor(Math.random() * drillCells.length)]; const rl = spec.rules || {}; return strategyQ({ hand: cardsFor(cell), up, h17: ruleOf(rl.h17), surrender: ruleOf(rl.surrender), das: rl.das === undefined ? true : ruleOf(rl.das) }); } return skill ? skillQuestion(skill, rating + 15 * stats.streak) : tool === 'weak' ? SKILL_MAKERS[weakSkills[turn++ % weakSkills.length]]() : makeQuestion(tool, s); };

    $('#app').innerHTML = `<main id="main" class="coach-screen practice c-${meta.color}">
      <header class="coach-top practice-top"><button type="button" class="icon-btn" id="pr-end" aria-label="End practice">${g('close')}</button><div class="pr-title"><span class="tool-icon sm">${g(meta.glyph)}</span><div><strong>${meta.name}</strong><small>${meta.purpose}</small></div></div>
        <div class="pr-stats"><span class="chip streak" title="Current streak">${g('flame')}<b id="pr-streak">0</b></span><span class="chip" title="Correct answers this round"><b id="pr-score">0/${size}</b></span><span id="energy-live"></span></div>
        ${tool === 'strategy' ? `<button type="button" class="pill-btn" id="pr-chart">${g('book')} Chart</button>` : ''}${defs.length ? `<button type="button" class="icon-btn" id="pr-gear" aria-expanded="false" aria-controls="pr-settings" aria-label="Settings">${g('gear')}</button>` : ''}${soundButton()}</header>
      <div class="settings-bar" id="pr-settings" hidden>${defs.map(([k, label, opts]) => `<div class="seg-group"><span>${label}</span><div class="segmented" role="radiogroup" aria-label="${label}">${opts.map(([v, t]) => `<button type="button" role="radio" data-k="${k}" data-v="${v}" aria-checked="${s[k] === v}">${t}</button>`).join('')}</div></div>`).join('')}</div>
      <div class="round-bar" aria-hidden="true"><span id="round-fill"></span></div>
      <section class="coach-body" id="coach-body"></section><footer class="coach-foot" id="coach-foot"></footer>
      <div class="sheet-shade" hidden><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"></div></div></main>`;
    wireSound();
    const body = $('#coach-body'), foot = $('#coach-foot'), shade = $('.sheet-shade'), sheet = $('.sheet');
    const meter = tool === 'weak' ? { answer() {}, empty: () => false, sync() {} } : energyMeter($('#energy-live'));
    const paintStats = () => { $('#pr-streak').textContent = stats.streak; $('#pr-score').textContent = `${stats.correct}/${size}`; $('.chip.streak').classList.toggle('lit', stats.streak > 0); $('#round-fill').style.width = Math.round(stats.questions / size * 100) + '%'; };
    const runner = createRunner({
      body, foot, next: nextQ,
      onResult: (q, r) => { results.push(r.record); meter.answer(r.ok); if (stats.questions + 1 < size) guardContinue(ctx, meter, foot, { quitHref: home, quitLabel: 'End practice' }); stats.questions++; if (r.ok) { stats.correct++; stats.streak++; stats.best = Math.max(stats.best, stats.streak); } else stats.streak = 0; paintStats(); },
      onKeyExtra: e => { if (e.key === 'Escape' && !shade.hidden) { shade.hidden = true; return true; } return false; },
      onEmpty: () => endRound(),
    });
    onCleanup(() => runner.destroy());
    // Don’t lose a round in progress to a stray reload or back swipe.
    const guard = e => { if (stats.questions > 0 && !logged) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', guard); onCleanup(() => window.removeEventListener('beforeunload', guard));
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
      if (!stats.questions) { go(home); return; }
      let r = { xp: 0, stars: 0, energyBack: 0 };
      try { r = await api('/api/practice/log', 'POST', { tool, round, results, bestStreak: stats.best, seconds: Math.round((Date.now() - stats.started) / 1000), day: localDate() }); } catch { /* still show the summary */ }
      const eco = await loadEconomy(api, localDate);
      const pct = Math.round(stats.correct / stats.questions * 100);
      if (tool === 'drill' && stats.questions >= size && markPack(spec, pct, api)) ctx.toast('Level passed! The next level is unlocked.');
      Sound.play(pct >= 90 ? 'complete' : 'reveal'); if (pct >= 90) confetti({ count: 70 });
      const pro = eco?.plan?.pro, cost = tool === 'weak' ? 0 : 1;
      sheet.className = 'sheet';
      sheet.innerHTML = `${ace(pct >= 90 ? 'wow' : 'happy', 'ace-md pop')}<h2 id="sheet-title">${pct === 100 ? 'Flawless round!' : pct >= 90 ? 'Great round!' : 'Round complete'}</h2><div class="plan-grid four"><div class="stat-tile green"><small>Accuracy</small><strong><span class="count" data-to="${pct}">0</span>%</strong></div><div class="stat-tile orange"><small>Best streak</small><strong>${g('flame')} ${stats.best}</strong></div><div class="stat-tile yellow"><small>XP</small><strong>${g('bolt')} +<span class="count" data-to="${r.xp}">0</span></strong></div><div class="stat-tile purple"><small>Chips</small><strong id="sum-stars">${g('chip')} +<span class="count" data-to="${r.stars || 0}">0</span></strong></div></div>${r.energyBack ? `<p class="goal-hit">${g('bolt')} +${r.energyBack} Energy earned back for accuracy</p>` : pct < 90 && !pro ? '<p class="muted small">Score 90% or better to earn chips. A perfect round earns 1 Energy back.</p>' : ''}
        <button type="button" class="primary chunky" id="sum-more">${cost && !pro ? `Next round · ${g('bolt')} ${cost}` : 'Next round'}</button><button type="button" class="ghost" id="sum-done">Done</button>`;
      shade.hidden = false;
      $$('.count', sheet).forEach((el, i) => setTimeout(() => countUp(el, Number(el.dataset.to)), 200 + i * 150));
      if (r.stars) setTimeout(() => flyStars($('#sum-stars'), 4), 700);
      $('#sum-done').onclick = () => go(home);
      $('#sum-more').onclick = () => toolPage(tool);
      $('#sum-more').focus();
    }
    $('#pr-end').onclick = () => { if (!stats.questions) { go(home); return; } endRound(); };
  }

  // ---- Shoe Challenge ----------------------------------------------------------------------------
  async function challengePage() {
    const meta = TOOLS.find(t => t.id === 'challenge');
    $('#app').innerHTML = `<main id="main" class="coach-screen practice c-${meta.color}"><header class="coach-top practice-top"><button type="button" class="icon-btn" id="ch-quit" aria-label="Leave the challenge">${g('close')}</button><div class="pr-title"><span class="tool-icon sm">${g('trophy')}</span><div><strong>Shoe Challenge</strong><small id="ch-round">12 rounds · 6-deck shoe</small></div></div><div class="pr-stats"><span class="hearts" id="ch-hearts" aria-label="3 hearts left">${g('heart').repeat(3)}</span><span class="chip xp"><b id="ch-score">0</b></span></div>${soundButton()}</header><section class="coach-body" id="coach-body"></section><footer class="coach-foot" id="coach-foot"></footer></main>`;
    wireSound();
    const body = $('#coach-body'), foot = $('#coach-foot');
    $('#ch-quit').onclick = () => go('/tools');
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
      react(allOk, { streak: allOk ? 1 : 0, anchor: body });
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
      foot.className = 'coach-foot'; foot.innerHTML = `<button type="button" class="ghost" id="ch-done">Back to Tools</button><button type="button" class="primary chunky" id="ch-again">Play again</button>`;
      $('#ch-done').onclick = () => go('/tools'); $('#ch-again').onclick = start; $('#ch-again').focus();
    }
    intro();
  }

  const tablePage = () => freePlayPage(ctx, TOOLS.find(t => t.id === 'table'));
  return { hub, toolsHub, toolPage, challengePage, tablePage };
}
