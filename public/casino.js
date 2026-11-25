// Casino Floor: practice under real conditions. A six-deck shoe dealt to a full table, a dealer with a personality,
// casino noise and chatter, dealer mistakes to catch, surprise count checks, bet sizing by the count, and (with Pit
// Boss Pete) a heat meter that ends the session if your spread gets too obvious. Scores count decisions, never chips.
import { esc, $, $$, g, ace, Sound, cardHTML, mountNumber } from './ui.js';
import { loadEconomy, paywall } from './economy.js';
import * as bj from './bj.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));
export const DEALERS = [
  { id: 'ace', name: 'Ace', mood: 'happy', blurb: 'Friendly and steady. A good first table.', speed: 1, chat: 0.15, errors: 0.05, heat: false, lines: ['Good luck, everybody.', 'Nice hand.', 'Shuffle coming up soon.', 'Insurance is open.', 'Big crowd tonight.'] },
  { id: 'sal', name: 'Speedy Sal', mood: 'wow', blurb: 'Deals fast and doesn’t wait. Your count has to keep up.', speed: 1.35, chat: 0.08, errors: 0.04, heat: false, lines: ['Let’s go, let’s go.', 'Bets up.', 'Next hand.', 'Quick decision, please.'] },
  { id: 'carla', name: 'Chatty Carla', mood: 'cheer', blurb: 'Never stops talking. Keep the count anyway.', speed: 0.95, chat: 0.55, errors: 0.05, heat: false, lines: ['Where are you all from?', 'My cousin plays every Tuesday.', 'Did you see the game last night?', 'Ooh, that’s a pretty hand.', 'I love this shoe.', 'Anybody want drinks?', 'Seven, eight, nine, I always lose count of the chips.'] },
  { id: 'dot', name: 'Dealer-Error Dot', mood: 'oops', blurb: 'Makes mistakes. Catch every bad total and wrong payout.', speed: 1, chat: 0.2, errors: 0.22, heat: false, lines: ['Oops, hang on.', 'Let me count that again.', 'Long shift.', 'Where was I?'] },
  { id: 'pete', name: 'Pit Boss Pete', mood: 'think', blurb: 'Watches your bets. Spread too obviously and you’re backed off.', speed: 1.05, chat: 0.12, errors: 0.05, heat: true, lines: ['Players, how are we doing?', 'Nice run you’re having.', 'Rated play tonight?', 'Mind if I watch a few hands?'] },
];
export const dealerOfMonth = () => DEALERS[new Date().getMonth() % DEALERS.length];
const ramp = tc => Math.max(1, Math.min(12, tc - 1));
const BETS = [1, 2, 3, 4, 6, 8, 10, 12];

// ---- ambience: brown noise, chip clinks, and dealer lines (speech synthesis) -----------------------------------
function ambience(level) {
  if (!Sound.on || !level) return { say() {}, stop() {} };
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return { say() {}, stop() {} };
  const ac = new C(), len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  let last = 0; for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const src = ac.createBufferSource(); src.buffer = buf; src.loop = true; const gain = ac.createGain(); gain.gain.value = 0.05 * level; src.connect(gain).connect(ac.destination); src.start();
  const clink = () => { const o = ac.createOscillator(), g2 = ac.createGain(); o.type = 'triangle'; o.frequency.value = 2400 + Math.random() * 1800; g2.gain.setValueAtTime(0.03 * level, ac.currentTime); g2.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.12); o.connect(g2).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.13); };
  const t = setInterval(() => { if (Math.random() < 0.35 * level) clink(); }, 700);
  return {
    say(text) { try { if (!('speechSynthesis' in window)) return; const u = new SpeechSynthesisUtterance(text); u.rate = 1.05; u.volume = Math.min(1, 0.5 + 0.2 * level); speechSynthesis.speak(u); } catch { /* no voice */ } },
    stop() { clearInterval(t); try { src.stop(); ac.close(); speechSynthesis.cancel(); } catch { /* closed */ } },
  };
}

export async function casinoPage(ctx) {
  const { api, go, localDate, onCleanup } = ctx;
  const eco = await loadEconomy(api, localDate), pro = !!eco?.plan?.pro;
  const free = dealerOfMonth();
  let saved = {}; try { saved = JSON.parse(localStorage.getItem('ff-casino') || '{}'); } catch { saved = {}; }
  const cfg = { dealer: free.id, seats: 4, rph: 75, distraction: 1, errors: true, betting: true, checks: true, ...(pro ? saved : {}) };
  if (!pro) Object.assign(cfg, { dealer: free.id, seats: 4, rph: 75, distraction: 1, errors: true, betting: true, checks: true });
  let amb = { say() {}, stop() {} }, alive = true, keyHandler = null;
  const onKey = e => keyHandler?.(e); document.addEventListener('keydown', onKey);
  onCleanup(() => { alive = false; amb.stop(); document.removeEventListener('keydown', onKey); });

  $('#app').innerHTML = `<main id="main" class="coach-screen practice c-green casino"><header class="coach-top practice-top"><button type="button" class="icon-btn" id="cf-quit" aria-label="Leave the table">${g('close')}</button><div class="pr-title"><span class="tool-icon sm">${g('pin')}</span><div><strong>Casino Floor</strong><small id="cf-sub">Real conditions, real speed</small></div></div><div class="pr-stats" id="cf-stats"></div></header>
    <section class="coach-body cf-body" id="coach-body"></section><footer class="coach-foot" id="coach-foot"></footer></main>`;
  const body = $('#coach-body'), foot = $('#coach-foot');
  $('#cf-quit').onclick = () => (session ? summary() : go('/tools'));
  let session = null;

  // ---- setup ------------------------------------------------------------------------------------------------
  function setup() {
    keyHandler = null;
    const lock = pro ? '' : 'disabled';
    const seg = (k, label, opts) => `<div class="seg-group"><span>${label}</span><div class="segmented" role="radiogroup" aria-label="${label}">${opts.map(([v, t]) => `<button type="button" role="radio" data-cf="${k}" data-v="${v}" aria-checked="${String(cfg[k]) === String(v)}" ${lock}>${t}</button>`).join('')}</div></div>`;
    body.innerHTML = `<div class="cf-setup"><h1>Pick your table</h1><p class="muted">${pro ? 'Every dealer and every condition is open to you.' : `This month’s free dealer is <b>${esc(free.name)}</b>. Pro opens every dealer and lets you set the conditions.`}</p>
      <div class="cf-dealers">${DEALERS.map(d => { const locked = !pro && d.id !== free.id; return `<button type="button" class="cf-dealer${cfg.dealer === d.id ? ' on' : ''}" data-dealer="${d.id}" ${locked ? 'data-locked="1"' : ''}>${ace(d.mood, 'ace-md')}<strong>${esc(d.name)}</strong><span>${esc(d.blurb)}</span>${d.id === free.id ? '<em class="cf-badge">Dealer of the month</em>' : locked ? `<em class="pro-tag">${g('crown')} Pro</em>` : ''}</button>`; }).join('')}</div>
      <div class="settings-bar cf-conds">${seg('seats', 'Other players', [[1, '1'], [2, '2'], [4, '4'], [6, '6']])}${seg('rph', 'Speed (rounds/hour)', [[60, '60'], [75, '75'], [100, '100'], [130, '130']])}${seg('distraction', 'Noise and chatter', [[0, 'Off'], [1, 'Low'], [2, 'Medium'], [3, 'Loud']])}${seg('errors', 'Dealer mistakes', [['true', 'On'], ['false', 'Off']])}${seg('betting', 'Bet by the count', [['true', 'On'], ['false', 'Off']])}${seg('checks', 'Surprise count checks', [['true', 'On'], ['false', 'Off']])}</div>
      ${pro ? '' : `<button type="button" class="pro-banner" id="cf-pro">${g('crown')}<span><strong>Every dealer, every condition</strong><small>Pick any dealer, crowd size, speed, and noise level with Pro.</small></span>${g('next')}</button>`}</div>`;
    $$('[data-dealer]').forEach(b => b.onclick = () => { if (b.dataset.locked) { paywall(ctx, 'Every Casino Floor dealer is part of Pro.'); return; } cfg.dealer = b.dataset.dealer; save(); setup(); });
    $$('[data-cf]').forEach(b => b.onclick = () => { const v = b.dataset.v; cfg[b.dataset.cf] = v === 'true' ? true : v === 'false' ? false : Number(v); save(); setup(); });
    $('#cf-pro')?.addEventListener('click', () => paywall(ctx, 'Pro opens every Casino Floor dealer and condition.'));
    foot.className = 'coach-foot'; foot.innerHTML = `<span class="foot-hint">Sound on for the full experience. Play as long as you like, then end the session for your report.</span><button type="button" class="primary chunky" id="cf-go">Sit down</button>`;
    $('#cf-go').onclick = start;
  }
  const save = () => { if (pro) localStorage.setItem('ff-casino', JSON.stringify(cfg)); };

  // ---- the session -------------------------------------------------------------------------------------------
  function newShoe() { const s = []; for (let d = 0; d < 6; d++) for (let r = 1; r <= 13; r++) for (let k = 0; k < 4; k++) s.push(r); return bj.shuffle(s); }
  function start() {
    const D = DEALERS.find(d => d.id === cfg.dealer) || free;
    amb.stop(); amb = ambience(cfg.distraction);
    session = { D, shoe: newShoe(), rc: 0, rounds: 0, started: Date.now(), plays: 0, playsRight: 0, bets: 0, betsRight: 0, checks: 0, checksRight: 0, errors: 0, caught: 0, falseCalls: 0, heat: 0, lastBet: 1, nextCheck: 3 + Math.floor(Math.random() * 4), backedOff: false, notes: [] };
    $('#cf-sub').textContent = `${D.name} · ${cfg.seats + 1} players · ${cfg.rph} rounds/hour`;
    amb.say(`Welcome to my table. I’m ${D.name.replace('Dealer-Error ', '')}.`);
    round();
  }
  const draw = () => { const c = session.shoe.pop(); session.rc += bj.hilo(c); return c; };
  const decksLeft = () => Math.max(0.5, Math.round(session.shoe.length / 52 * 2) / 2);
  const tc = () => Math.floor(session.rc / decksLeft());
  const pace = () => 48000 / cfg.rph / session.D.speed;     // ms per card: about 0.8 s at 60 rounds/hour, 0.37 s at 130
  const stats = () => { const s = session; $('#cf-stats').innerHTML = `<span class="chip" title="Rounds">${g('cards')} <b>${s.rounds}</b></span>${s.D.heat ? `<span class="chip heat" title="Heat"><span class="heat-bar"><i style="width:${Math.min(100, s.heat)}%"></i></span></span>` : ''}`; };

  async function round() {
    if (!alive || !session) return;
    const s = session; stats();
    if (s.shoe.length < 78) { s.shoe = newShoe(); s.rc = 0; amb.say('Shuffle.'); await banner('Shuffle. New shoe: the count starts at 0.'); }
    // 1. bet
    let bet = 1;
    if (cfg.betting) bet = await askBet();
    if (!alive || !session) return;
    // 2. deal
    const seats = cfg.seats + 1, me = Math.floor(seats / 2), hands = Array.from({ length: seats }, () => []), dealer = [];
    body.innerHTML = `<div class="deal-table bj-table has-dealer cf-table"><div class="dealer-ace" aria-hidden="true">${ace(s.D.mood, 'ace-dealer')}</div><div class="cf-say" id="cf-say" hidden></div><div class="seat dealer"><div class="cards"></div><span class="hand-label" id="cf-dtotal">Dealer</span></div>
      <div class="seats" style="--n:${seats}">${hands.map((_, i) => { const mid = (seats - 1) / 2, k = mid ? (i - mid) / mid : 0; return `<div class="seat${i === me ? ' me' : ''}" data-seat="${i}" style="--drop:${(1 - k * k).toFixed(2)};--tilt:${(-k * 10).toFixed(1)}deg"><div class="cards"></div><span class="hand-label">${i === me ? `You · ${bet}u` : 'Player'}</span></div>`; }).join('')}</div></div><p class="cf-status" id="cf-status" aria-live="polite"></p>`;
    foot.className = 'coach-foot'; foot.innerHTML = `<span class="foot-hint">Keep the count. ${cfg.errors ? 'Tap “That’s wrong!” if the dealer slips up.' : ''}</span><button type="button" class="ghost" id="cf-wrong" ${cfg.errors ? '' : 'hidden'}>That’s wrong!</button><button type="button" class="ghost" id="cf-end">End session</button>`;
    $('#cf-end').onclick = summary;
    let pendingError = null;
    $('#cf-wrong').onclick = () => { if (pendingError) { s.caught++; pendingError.caught = true; status(`${g('check')} Good catch: ${pendingError.truth}`, 'ok'); pendingError = null; } else { s.falseCalls++; status('No mistake there. Keep counting.', 'bad'); } };
    const put = (i, c, back = false) => { const box = i === 'd' ? $('.seat.dealer .cards', body) : $(`[data-seat="${i}"] .cards`, body); box?.insertAdjacentHTML('beforeend', back ? cardHTML(0, 0, { back: true, cls: 'flash-in' }) : cardHTML(c, 0, { cls: 'flash-in' })); Sound.play('deal'); };
    const step = () => sleep(pace());
    for (let i = 0; i < seats; i++) { hands[i].push(draw()); put(i, hands[i][0]); await step(); }
    dealer.push(draw()); put('d', dealer[0]); await step();
    for (let i = 0; i < seats; i++) { hands[i].push(draw()); put(i, hands[i][1]); await step(); }
    const hole = s.shoe.pop(); dealer.push(hole); put('d', 0, true); await step();
    if (!alive || !session) return;
    if (Math.random() < s.D.chat * (0.5 + cfg.distraction / 2)) amb.say(bj.pick(s.D.lines));
    const up = dealer[0], dealerBJ = bj.total(dealer).total === 21;
    const myHands = [{ cards: hands[me], bet, done: false }];
    if (!dealerBJ) {
      for (let i = 0; i < seats; i++) {
        if (i === me) { await playMine(myHands, up, put); continue; }
        while (bj.total(hands[i]).total < 21) { const a = bj.basic(hands[i], up, { split: false }); if (a !== 'H' && a !== 'D') break; hands[i].push(draw()); put(i, hands[i].at(-1)); await step(); if (a === 'D') break; }
        if (!alive || !session) return;
      }
    }
    // 3. dealer
    s.rc += bj.hilo(hole); const back = $('.seat.dealer .pc.back', body); if (back) back.outerHTML = cardHTML(hole, 0, { cls: 'flash-in' });
    await step();
    if (!dealerBJ && myHands.some(h => bj.total(h.cards).total <= 21)) while (bj.total(dealer).total < 17) { dealer.push(draw()); put('d', dealer.at(-1)); await step(); }
    const dt = bj.total(dealer).total;
    // 4. settle, maybe with a dealer mistake
    let net = 0;
    for (const h of myHands) { const t = bj.total(h.cards).total, nat = h.cards.length === 2 && t === 21 && myHands.length === 1; net += dealerBJ ? (nat ? 0 : -h.bet) : nat ? 1.5 * h.bet : t > 21 ? -h.bet : dt > 21 || t > dt ? h.bet : t < dt ? -h.bet : 0; }
    let sayTotal = dt > 21 ? 'Dealer busts.' : `Dealer has ${dt}.`, sayPay = net > 0 ? `You win ${net} unit${net === 1 ? '' : 's'}.` : net < 0 ? 'Dealer wins.' : 'Push.';
    if (cfg.errors && Math.random() < s.D.errors) {
      s.errors++;
      if (dt <= 21 && Math.random() < 0.5) { const wrong = dt + (Math.random() < 0.5 ? 1 : -1); pendingError = { truth: `the dealer has ${dt}, not ${wrong}` }; sayTotal = `Dealer has ${wrong}.`; }
      else if (net > 0) { const wrong = net === 1.5 * bet ? bet : Math.max(0.5, net - 1); pendingError = { truth: `you should be paid ${net} units, not ${wrong}` }; sayPay = `You win ${wrong} unit${wrong === 1 ? '' : 's'}.`; }
      else { const was = net; pendingError = { truth: was < 0 ? 'you lost this hand, the dealer paid it by mistake' : 'it was a push' }; sayPay = `You win ${bet} unit${bet === 1 ? '' : 's'}.`; }
    }
    $('#cf-dtotal').textContent = sayTotal.replace('.', ''); say(`${sayTotal} ${sayPay}`); amb.say(`${sayTotal} ${sayPay}`);
    await sleep(cfg.errors ? 3200 : 1400);
    if (pendingError && !pendingError.caught) { s.notes.push(`Missed a dealer mistake: ${pendingError.truth}.`); status(`The dealer slipped: ${pendingError.truth}.`, 'bad'); await sleep(1600); }
    pendingError = null;
    s.rounds++; s.heat = Math.max(0, s.heat - 7); stats();
    if (s.D.heat && s.heat >= 100) { s.backedOff = true; amb.say('Sir, you can play anything but blackjack.'); summary(); return; }
    // 5. surprise count check
    if (cfg.checks && s.rounds >= s.nextCheck) { s.nextCheck = s.rounds + 3 + Math.floor(Math.random() * 5); await countCheck(); }
    if (alive && session) round();
  }

  function say(text) { const b = $('#cf-say'); if (b) { b.hidden = false; b.textContent = text; } }
  function status(html, cls = '') { const p = $('#cf-status'); if (p) { p.className = 'cf-status ' + cls; p.innerHTML = html; } }
  async function banner(text) { body.innerHTML = `<div class="coach-intro">${ace(session.D.mood, 'ace-lg')}<h2>${esc(text)}</h2></div>`; foot.innerHTML = '<span></span>'; await sleep(1800); }

  function askBet() {
    const s = session, right = ramp(tc());
    return new Promise(resolve => {
      body.innerHTML = `<div class="q cf-bet"><p class="q-eyebrow">${esc(s.D.name)} · ${decksLeft()} decks left${s.D.heat ? ' · Pete is watching' : ''}</p><h1 class="q-title">Place your bet</h1><p class="muted">Ramp: 1 unit at +1 or lower, then true count − 1, up to 12. Keep the count in your head.</p><div class="cf-chips">${BETS.map(b => `<button type="button" class="fp-disc d${b <= 2 ? 10 : b <= 4 ? 25 : b <= 8 ? 50 : 100}" data-bet="${b}">${b}</button>`).join('')}</div></div>`;
      foot.className = 'coach-foot'; foot.innerHTML = '<span class="foot-hint">Tap a bet. The dealer won’t wait long.</span>';
      let done = false;
      const pick = b => {
        if (done) return; done = true; keyHandler = null; s.bets++; if (b === right) s.betsRight++; else s.notes.push(`Bet ${b} at true count ${bj.signed(tc())}; the ramp says ${right}.`);
        if (s.D.heat) { if (b >= 3 * s.lastBet && b >= 4) s.heat += 22 + 4 * (b / s.lastBet); if (b === 12) s.heat += 6; }
        s.lastBet = b; Sound.play('select'); resolve(b);
      };
      $$('[data-bet]', body).forEach(x => x.onclick = () => pick(Number(x.dataset.bet)));
      setTimeout(() => pick(s.lastBet <= 12 ? s.lastBet : 1), Math.max(3500, 9000 / s.D.speed));
    });
  }

  function playMine(myHands, up, put) {
    const s = session;
    return new Promise(async resolve => {
      for (let hi = 0; hi < myHands.length; hi++) {
        const h = myHands[hi];
        while (alive && bj.total(h.cards).total < 21) {
          const acts = ['H', 'S', ...(h.cards.length === 2 ? ['D'] : []), ...(h.cards.length === 2 && myHands.length === 1 && bj.isPair(h.cards) ? ['P'] : [])];
          const want = bj.basic(h.cards, up, { split: myHands.length === 1 });
          status(`Your hand${myHands.length > 1 ? ` ${hi + 1}` : ''}: ${esc(bj.handLabel(h.cards))}`);
          foot.querySelector('.cf-acts')?.remove();
          foot.insertAdjacentHTML('afterbegin', `<div class="action-row cf-acts">${acts.map(a => `<button type="button" class="act act-${a}" data-act="${a}"><span>${bj.ACTIONS[a]}</span><kbd>${a}</kbd></button>`).join('')}</div>`);
          const a = await new Promise(r => {
            let t = setTimeout(() => r('S'), Math.max(4000, 9000 / s.D.speed));
            const fire = x => { clearTimeout(t); keyHandler = null; r(x); };
            $$('.cf-acts [data-act]', foot).forEach(b => b.onclick = () => fire(b.dataset.act));
            keyHandler = e => { const k = e.key.toUpperCase(); if (acts.includes(k)) { e.preventDefault(); fire(k); } };
          });
          foot.querySelector('.cf-acts')?.remove();
          s.plays++; if (a === want) s.playsRight++; else s.notes.push(`${bj.handLabel(h.cards)} vs ${bj.upName(up)}: you chose ${bj.ACTIONS[a].toLowerCase()}, the chart says ${bj.ACTIONS[want].toLowerCase()}.`);
          status(a === want ? `${g('check')} ${bj.ACTIONS[a]}` : `${bj.ACTIONS[a]} · the chart says ${bj.ACTIONS[want]}`, a === want ? 'ok' : 'bad');
          if (a === 'S') break;
          if (a === 'P') { const second = { cards: [h.cards.pop()], bet: h.bet }; myHands.push(second); h.cards.push(draw()); second.cards.push(draw()); const seat = $('.seat.me .cards', body); seat.innerHTML = myHands.map(x => x.cards.map(c => cardHTML(c, 0)).join('')).join('<span class="cf-split"></span>'); continue; }
          h.cards.push(draw()); put($('.seat.me', body).dataset.seat, h.cards.at(-1)); await sleep(pace());
          if (a === 'D') { h.bet *= 2; break; }
        }
      }
      resolve();
    });
  }

  function countCheck() {
    const s = session, right = s.rc;
    return new Promise(resolve => {
      body.innerHTML = `<div class="q"><p class="q-eyebrow">Surprise count check</p><h1 class="q-title">What’s the running count?</h1><div class="answer-slot"></div></div>`;
      foot.className = 'coach-foot'; foot.innerHTML = '<span class="foot-hint">Type it, then Enter. Eight seconds.</span><button type="button" class="primary chunky" id="cf-check" disabled>Check</button>';
      let done = false;
      const n = mountNumber($('.answer-slot', body), { label: 'Running count', onChange: v => { $('#cf-check').disabled = v === null; } });
      const finish = async () => {
        if (done) return; done = true; keyHandler = null; clearTimeout(t); s.checks++;
        const ok = n.value === right; if (ok) s.checksRight++; else s.notes.push(`Count check: you said ${n.value == null ? 'nothing' : bj.signed(n.value)}, it was ${bj.signed(right)}.`);
        Sound.play(ok ? 'correct' : 'wrong');
        body.innerHTML = `<div class="coach-intro"><h2>${ok ? `${g('check')} Right: ${bj.signed(right)}` : `It was ${bj.signed(right)}`}</h2><p class="muted">${ok ? 'Keep it going.' : 'Pick it up from here: the count is now ' + bj.signed(right) + '.'}</p></div>`;
        await sleep(1500); resolve();
      };
      const t = setTimeout(finish, 8000);
      $('#cf-check').onclick = finish; keyHandler = e => { if (e.key === 'Enter' && n.value !== null) { e.preventDefault(); finish(); } };
    });
  }

  function summary() {
    const s = session; if (!s) { go('/tools'); return; }
    session = null; amb.stop(); keyHandler = null;
    const mins = (Date.now() - s.started) / 60000, rph = s.rounds && mins > 0.5 ? Math.round(s.rounds / mins * 60) : null;
    const pct = (a, b) => (b ? Math.round(100 * a / b) + '%' : '—');
    Sound.play('complete');
    body.innerHTML = `<div class="lesson-done cf-summary">${ace(s.backedOff ? 'oops' : 'happy', 'ace-xl pop')}<h1>${s.backedOff ? 'Backed off!' : 'Session over'}</h1>${s.backedOff ? '<p>Pete saw your bets jump with the count. Real counters spread more gradually and use cover: raise a step at a time, and don’t always drop straight back after a big bet.</p>' : ''}
      <div class="plan-grid four"><div class="stat-tile blue"><small>Rounds</small><strong>${s.rounds}</strong><span>${rph ? `${rph} an hour (target ${cfg.rph})` : ''}</span></div><div class="stat-tile green"><small>Plays right</small><strong>${pct(s.playsRight, s.plays)}</strong><span>${s.playsRight}/${s.plays}</span></div><div class="stat-tile purple"><small>Count checks</small><strong>${pct(s.checksRight, s.checks)}</strong><span>${s.checksRight}/${s.checks}</span></div><div class="stat-tile yellow"><small>Bets on the ramp</small><strong>${pct(s.betsRight, s.bets)}</strong><span>${s.betsRight}/${s.bets}</span></div></div>
      ${cfg.errors ? `<p><b>Dealer mistakes caught:</b> ${s.caught} of ${s.errors}${s.falseCalls ? ` · ${s.falseCalls} false call${s.falseCalls === 1 ? '' : 's'}` : ''}</p>` : ''}
      ${s.notes.length ? `<h3 class="sim-sub">What to work on</h3><ul class="rush-misses">${s.notes.slice(-8).map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : '<p class="muted">A clean session. Try a faster speed or a louder table.</p>'}</div>`;
    foot.className = 'coach-foot'; foot.innerHTML = `<a class="button ghost" href="/tools">Back to Tools</a><button type="button" class="primary chunky" id="cf-again">Another session</button>`;
    $('#cf-again').onclick = setup; $('#cf-stats').innerHTML = '';
  }

  setup();
}
