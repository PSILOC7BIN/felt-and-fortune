import { explainPlay } from './ev.js';
// Free Play: real hands of blackjack against Ace from a six-deck shoe. Play however you like;
// every decision is checked against basic strategy and Ace tells you when a play was wrong.
// Wagers use a practice bankroll kept on this device. It is not chips and can't be bought.
import * as bj from './bj.js';
import { $, $$, Sound, ace, g, cardHTML } from './ui.js';
import { react } from './reactions.js';
import { startRound, energyMeter, outOfEnergy, economyState, loadEconomy } from './economy.js';

const DECKS = 6, CUT = 52 * DECKS * 0.25, HANDS_PER_ROUND = 8, MAX_HANDS = 4, START_BANK = 1000;
const BETS = [10, 25, 50, 100];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmt = n => Math.round(n).toLocaleString('en-US');

export async function freePlayPage(ctx, meta) {
  const { api, go, localDate, onCleanup } = ctx;
  let saved = {}; try { saved = JSON.parse(localStorage.getItem('ff-practice-table') || '{}'); } catch { saved = {}; }
  const rules = { h17: saved.h17 === 'h17', surrender: saved.surrender === 'on', count: saved.count === 'on' };
  let bet = BETS.includes(Number(saved.bet)) ? Number(saved.bet) : 25;
  let bank = Number(localStorage.getItem('ff-freeplay-bank'));
  if (!Number.isFinite(bank) || bank < BETS[0]) bank = START_BANK;
  const save = () => { localStorage.setItem('ff-practice-table', JSON.stringify({ h17: rules.h17 ? 'h17' : 's17', surrender: rules.surrender ? 'on' : 'off', count: rules.count ? 'on' : 'off', bet })); localStorage.setItem('ff-freeplay-bank', String(bank)); };

  let round = await startRound(ctx, 'table');
  if (!round) { if (location.pathname !== '/tools') go('/tools'); return; }

  // Session state.
  let shoe = [], rc = 0, results = [], phase = 'bet', busy = false, handsPlayed = 0, roundStarted = Date.now();
  const session = { decisions: 0, correct: 0, streak: 0, best: 0, roundBest: 0, net: 0 };
  let dealer = { cards: [], hidden: true, shown: 0 }, players = [], active = 0;

  const reshuffle = () => { shoe = bj.shuffle(Array.from({ length: 52 * DECKS }, (_, i) => i % 13 + 1)); rc = 0; };
  const draw = (seen = true) => { if (!shoe.length) reshuffle(); const c = shoe.pop(); if (seen) rc += bj.hilo(c); return c; };
  const tot = cards => bj.total(cards);
  const up = () => dealer.cards[0];
  const isBJ = h => h.cards.length === 2 && !h.fromSplit && tot(h.cards).total === 21;
  const label = cards => { const { total: t, soft } = tot(cards); return t > 21 ? `Bust ${t}` : soft && t < 21 ? `Soft ${t}` : String(t); };

  $('#app').innerHTML = `<main id="main" class="coach-screen practice freeplay c-${meta.color}">
    <header class="coach-top practice-top"><button type="button" class="icon-btn" id="fp-end" aria-label="Leave the table">${g('close')}</button><div class="pr-title"><span class="tool-icon sm">${g(meta.glyph)}</span><div><strong>${meta.name}</strong><small>Ace deals. Play your way; Ace flags any play that isn’t basic strategy.</small></div></div>
      <div class="pr-stats"><span class="chip streak" title="Right plays in a row">${g('flame')}<b id="fp-streak">0</b></span><span class="chip" title="Right plays this session"><b id="fp-acc">0/0</b></span><span id="energy-live"></span></div>
      <button type="button" class="icon-btn" id="fp-gear" aria-expanded="false" aria-controls="fp-settings" aria-label="Table rules">${g('gear')}</button></header>
    <div class="settings-bar" id="fp-settings" hidden>
      ${[['h17', 'Dealer', [['s17', 'Stands soft 17'], ['h17', 'Hits soft 17']]], ['surrender', 'Surrender', [['off', 'Off'], ['on', 'On']]], ['count', 'Count', [['off', 'Hidden'], ['on', 'Show running count']]]].map(([k, l, opts]) => `<div class="seg-group"><span>${l}</span><div class="segmented" role="radiogroup" aria-label="${l}">${opts.map(([v, t]) => `<button type="button" role="radio" data-k="${k}" data-v="${v}" aria-checked="${(k === 'h17' ? (rules.h17 ? 'h17' : 's17') : rules[k] ? 'on' : 'off') === v}">${t}</button>`).join('')}</div></div>`).join('')}
      <button type="button" class="ghost small" id="fp-reset">Reset practice bankroll</button></div>
    <section class="coach-body fp-body" id="coach-body">
      <div class="felt-table bj-table has-dealer fp-table">
        <div class="dealer-ace" aria-hidden="true">${ace('happy', 'ace-dealer')}</div>
        <div class="hand dealer-hand"><div class="cards" id="fp-dealer"></div><span class="hand-label" id="fp-dtotal">Dealer</span></div>
        <p class="fp-rules">Blackjack pays 3 to 2 · Dealer ${rules.h17 ? 'hits' : 'stands on'} soft 17</p>
        <div class="fp-hands" id="fp-hands"></div>
        <div class="fp-shoe" id="fp-shoe"></div>
      </div>
      <div class="fp-coach" id="fp-coach" aria-live="polite"></div>
    </section>
    <footer class="coach-foot fp-foot" id="coach-foot"></footer></main>`;

  const foot = $('#coach-foot'), coachBox = $('#fp-coach');
  const meter = energyMeter($('#energy-live'));
  const setAce = mood => { const el = $('.fp-table .dealer-ace'); if (el) el.innerHTML = ace(mood, 'ace-dealer'); };
  const say = (html, cls = '') => { coachBox.innerHTML = html ? `<div class="fp-tip ${cls}">${html}</div>` : ''; };

  function paintStats() {
    $('#fp-streak').textContent = session.streak; $('.chip.streak').classList.toggle('lit', session.streak > 0);
    $('#fp-acc').textContent = `${session.correct}/${session.decisions}`;
  }
  function paintShoe() {
    const left = shoe.length / 52, decks = Math.max(.5, Math.round(left * 2) / 2);
    $('#fp-shoe').innerHTML = `<span>${g('stack')} ${bj.halves(decks)} deck${decks === 1 ? '' : 's'} left</span>${rules.count ? `<span>Running ${bj.signed(rc)} · True ${bj.signed(bj.trueCount(rc, decks))}</span>` : ''}<span class="fp-bank">Practice bankroll <b>${fmt(bank)}</b></span>`;
  }
  // Only cards that are new since the last paint animate in.
  const cardsHTML = (cards, shown, hiddenAt = -1) => cards.map((c, j) => cardHTML(c, j, { back: j === hiddenAt, cls: j >= shown ? 'fp-new' : 'fp-still' })).join('');
  function paint() {
    $('#fp-dealer').innerHTML = cardsHTML(dealer.cards, dealer.shown, dealer.hidden ? 1 : -1);
    dealer.shown = dealer.cards.length;
    $('#fp-dtotal').textContent = !dealer.cards.length ? 'Dealer' : dealer.hidden ? `Dealer shows ${bj.upName(up()) === 'ace' ? 'an ace' : bj.upName(up())}` : `Dealer ${label(dealer.cards)}`;
    $('#fp-hands').innerHTML = players.map((h, i) => {
      const html = `<div class="hand fp-hand${phase === 'play' && i === active ? ' active' : ''}${h.result ? ' res-' + h.result.kind : ''}">
        <div class="cards">${cardsHTML(h.cards, h.shown || 0)}</div>
        <span class="hand-label">${players.length > 1 ? `Hand ${i + 1} · ` : 'You · '}${isBJ(h) ? 'Blackjack' : label(h.cards)}</span>
        <span class="fp-bet">Bet ${fmt(h.bet)}${h.doubled ? ' · doubled' : ''}</span>${h.result ? `<span class="fp-result">${h.result.text}</span>` : ''}</div>`;
      h.shown = h.cards.length; return html;
    }).join('');
    paintShoe();
  }

  function options(h) {
    const two = h.cards.length === 2;
    return { H: true, S: true, D: two, P: two && bj.isPair(h.cards) && players.length < MAX_HANDS, R: two && rules.surrender && players.length === 1 && !h.fromSplit };
  }

  // ---- footer states ------------------------------------------------------------------------------
  function betFoot(again = false) {
    phase = 'bet';
    foot.innerHTML = `<div class="fp-bets" role="radiogroup" aria-label="Bet">${BETS.map(b => `<button type="button" class="fp-disc d${b}" role="radio" data-bet="${b}" aria-checked="${b === bet}" ${b > bank ? 'disabled' : ''}>${b}</button>`).join('')}</div>
      <button type="button" class="primary chunky" id="fp-deal">${again ? 'Deal again' : 'Deal'}<kbd>Enter</kbd></button>`;
    $$('[data-bet]', foot).forEach(b => b.onclick = () => { bet = Number(b.dataset.bet); save(); Sound.play('chips'); $$('[data-bet]', foot).forEach(x => x.setAttribute('aria-checked', String(x === b))); });
    $('#fp-deal').onclick = deal;
  }
  function actionFoot() {
    const h = players[active], o = options(h);
    foot.innerHTML = `<div class="action-row fp-actions">${Object.entries(bj.ACTIONS).filter(([k]) => o[k]).map(([k, t]) => `<button type="button" class="act act-${k}" data-act="${k}"><span>${t}</span><kbd>${k}</kbd></button>`).join('')}</div>`;
    $$('[data-act]', foot).forEach(b => b.onclick = () => act(b.dataset.act));
  }

  // ---- a hand ---------------------------------------------------------------------------------------
  async function deal() {
    if (busy) return;
    if (meter.empty()) { await loadEconomy(api, localDate); outOfEnergy(ctx, economyState(), () => meter.refill()); return; }
    if (!round) { round = await startRound(ctx, 'table'); if (!round) return; roundStarted = Date.now(); }
    if (bank < bet) { if (bank < BETS[0]) { bank = START_BANK; ctx.toast('Practice bankroll reset to 1,000.'); } else bet = BETS.filter(b => b <= bank).pop(); }
    busy = true; phase = 'deal'; foot.innerHTML = '<span class="foot-hint">Dealing…</span>';
    let note = '';
    if (!shoe.length || shoe.length < CUT) { reshuffle(); note = 'Fresh six-deck shoe.' + (rules.count ? ' The count starts at 0.' : ''); }
    bank -= bet; save();
    players = [{ cards: [], bet, shown: 0 }]; active = 0; dealer = { cards: [], hidden: true, shown: 0 };
    setAce('happy'); say(note ? `${g('stack')}<span>${note}</span>` : '');
    for (const step of ['p', 'd', 'p', 'h']) {
      if (step === 'p') players[0].cards.push(draw()); else dealer.cards.push(draw(step === 'd'));
      Sound.play('deal'); paint(); await sleep(330);
      if (!$('#fp-hands')) return;
    }
    const p = players[0], peek = up() === 1 || up() >= 10, dealerBJ = peek && tot(dealer.cards).total === 21;
    if (isBJ(p) || dealerBJ) { await finish(); return; }
    phase = 'play'; busy = false; paint(); actionFoot();
    if (up() === 1) say(`${g('target')}<span>Ace up and no blackjack underneath. Basic strategy never takes insurance, so it isn’t offered here.</span>`);
  }

  async function act(a) {
    if (busy || phase !== 'play') return;
    const h = players[active], o = options(h);
    if (!o[a]) return;
    busy = true;
    const want = bj.basic(h.cards, up(), { h17: rules.h17, das: true, surrender: o.R, split: o.P });
    const ok = a === want, before = h.cards.slice();
    results.push({ kind: 'strategy', data: { cards: before, dealer: up(), h17: rules.h17, surrender: o.R, das: true, split: o.P }, given: a, explain: ok ? '' : bj.strategyReason(before, up(), want, rules) });
    session.decisions++;
    if (ok) { session.correct++; session.streak++; session.best = Math.max(session.best, session.streak); session.roundBest = Math.max(session.roundBest, session.streak); }
    else session.streak = 0;
    meter.answer(ok); paintStats();
    if (ok) { Sound.play('correct'); say(`${g('check')}<span><b>${bj.ACTIONS[a]} is right.</b> ${bj.strategyReason(before, up(), a, rules)}</span>`, 'ok'); }
    else {
      Sound.play('wrong'); react(false, { anchor: coachBox });
      say(`${ace('oops', 'ace-sm')}<span><b>Basic strategy says ${bj.ACTIONS[want]}, not ${bj.ACTIONS[a]}.</b> ${bj.strategyReason(before, up(), want, rules)}${(() => { const c = explainPlay(before, up(), rules, a).cost; return c >= 0.0005 ? ` ${bj.ACTIONS[a]} costs about ${(c * 100).toFixed(1)}% of your bet here.` : ' The two plays are nearly equal here.'; })()} You can keep playing your way.</span>`, 'bad');
    }
    if (a === 'H') { h.cards.push(draw()); Sound.play('deal'); if (tot(h.cards).total >= 21) h.done = true; }
    else if (a === 'S') h.done = true;
    else if (a === 'D') { bank -= h.bet; h.bet *= 2; h.doubled = true; h.cards.push(draw()); Sound.play('deal'); h.done = true; }
    else if (a === 'R') { h.surrendered = true; h.done = true; }
    else if (a === 'P') {
      bank -= h.bet;
      const second = { cards: [h.cards.pop()], bet: h.bet, fromSplit: true, shown: 1 };
      h.fromSplit = true; h.shown = 1; players.splice(active + 1, 0, second);
      h.cards.push(draw()); Sound.play('deal');
      if (h.cards[0] === 1) { second.cards.push(draw()); h.done = second.done = true; }   // split aces get one card each
      else if (tot(h.cards).total === 21) h.done = true;
    }
    save(); paint();
    await sleep(a === 'S' ? 120 : 380);
    await advance();
    busy = false;
  }

  async function advance() {
    while (active < players.length && players[active].done) {
      active++;
      const h = players[active];
      if (h && h.cards.length === 1) { await sleep(250); h.cards.push(draw()); Sound.play('deal'); if (tot(h.cards).total === 21) h.done = true; paint(); await sleep(250); }
    }
    if (active >= players.length) { await finish(); return; }
    paint(); actionFoot();
  }

  async function finish() {
    phase = 'done'; busy = true; foot.innerHTML = '<span class="foot-hint">Dealer’s turn…</span>';
    dealer.hidden = false; rc += bj.hilo(dealer.cards[1]); dealer.shown = 1; paint(); Sound.play('reveal'); await sleep(450);
    const live = players.some(h => !h.surrendered && tot(h.cards).total <= 21 && !isBJ(h));
    const dealerBJ = dealer.cards.length === 2 && tot(dealer.cards).total === 21;
    if (live && !dealerBJ) {
      while (true) {
        const { total: t, soft } = tot(dealer.cards);
        if (t > 17 || (t === 17 && !(soft && rules.h17))) break;
        dealer.cards.push(draw()); Sound.play('deal'); paint(); await sleep(480);
        if (!$('#fp-hands')) return;
      }
    }
    const d = tot(dealer.cards).total, dBust = d > 21;
    let net = 0;
    for (const h of players) {
      const t = tot(h.cards).total, stake = h.bet;
      let pay = 0, kind = 'lose', text = '';
      if (h.surrendered) { pay = stake / 2; kind = 'push'; text = `Surrendered · −${fmt(stake / 2)}`; }
      else if (isBJ(h) && !dealerBJ) { pay = stake * 2.5; kind = 'win'; text = `Blackjack! +${fmt(stake * 1.5)}`; }
      else if (isBJ(h) && dealerBJ) { pay = stake; kind = 'push'; text = 'Push'; }
      else if (dealerBJ) { text = `Dealer blackjack · −${fmt(stake)}`; }
      else if (t > 21) { text = `Bust · −${fmt(stake)}`; }
      else if (dBust || t > d) { pay = stake * 2; kind = 'win'; text = `Win +${fmt(stake)}`; }
      else if (t === d) { pay = stake; kind = 'push'; text = 'Push'; }
      else text = `Lose · −${fmt(stake)}`;
      bank += pay; net += pay - stake; h.result = { kind, text };
    }
    session.net += net; save();
    setAce(net > 0 ? 'cheer' : net < 0 ? 'think' : 'happy');
    Sound.play(net > 0 ? 'coin' : net < 0 ? 'pop' : 'tap');
    paint();
    handsPlayed++;
    if (handsPlayed % HANDS_PER_ROUND === 0) logRound();
    busy = false; betFoot(true);
    $('#fp-deal')?.focus();
  }

  // ---- logging: every few hands counts as one practice round (decisions graded on the server) ----
  async function logRound() {
    if (!results.length || !round) return null;
    const payload = { tool: 'table', round, results, bestStreak: session.roundBest, seconds: Math.round((Date.now() - roundStarted) / 1000), day: localDate() };
    results = []; round = null; session.roundBest = session.streak;
    try {
      const r = await api('/api/practice/log', 'POST', payload);
      if (r.energy && r.energy.energy != null) meter.sync(r.energy.energy);
      return r;
    } catch { return null; }
  }

  // ---- controls ----------------------------------------------------------------------------------------
  const onKey = e => {
    if (e.target.closest?.('input, textarea, select')) return;
    const k = e.key.toUpperCase();
    if (phase === 'play' && bj.ACTIONS[k]) { e.preventDefault(); act(k); }
    else if (phase === 'bet' && e.key === 'Enter') { e.preventDefault(); deal(); }
  };
  document.addEventListener('keydown', onKey);
  onCleanup(() => { document.removeEventListener('keydown', onKey); if (results.length) logRound(); });

  $('#fp-gear').onclick = () => { const bar = $('#fp-settings'); bar.hidden = !bar.hidden; $('#fp-gear').setAttribute('aria-expanded', String(!bar.hidden)); };
  $$('[data-k]').forEach(b => b.onclick = () => {
    const k = b.dataset.k, v = b.dataset.v;
    if (k === 'h17') rules.h17 = v === 'h17'; else rules[k] = v === 'on';
    $$(`[data-k="${k}"]`).forEach(x => x.setAttribute('aria-checked', String(x === b)));
    $('.fp-rules').textContent = `Blackjack pays 3 to 2 · Dealer ${rules.h17 ? 'hits' : 'stands on'} soft 17`;
    save(); paintShoe(); Sound.play('select');
    if (phase === 'play') actionFoot();
  });
  $('#fp-reset').onclick = () => { bank = START_BANK; save(); paintShoe(); ctx.toast('Practice bankroll reset to 1,000.'); if (phase === 'bet') betFoot(handsPlayed > 0); };
  $('#fp-end').onclick = async () => {
    if (busy && phase !== 'play') return;
    await logRound();
    if (session.decisions) ctx.toast(`${handsPlayed} hand${handsPlayed === 1 ? '' : 's'} · ${Math.round(session.correct / session.decisions * 100)}% right plays · ${session.net >= 0 ? '+' : '−'}${fmt(Math.abs(session.net))} practice bankroll`);
    go('/tools');
  };

  reshuffle(); paint(); paintStats();
  say(`${g('cards')}<span>Pick a bet and deal. Play every hand your way. When a play isn’t basic strategy, Ace tells you what the chart says and why.</span>`);
  betFoot();
  $('#fp-deal').focus();
}
