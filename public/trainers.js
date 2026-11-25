// The trainers: question generators shared by the Practice tools and the lessons.
// A question renders into a container, tells the runner when it can be checked, and grades itself.
import { react } from './reactions.js';
import * as bj from './bj.js';
import { esc, $, $$, Sound, ace, g, cardHTML, tableHTML, mountTray, mountStepper, mountNumber } from './ui.js';

const PRAISE = ['Nice!', 'Great job!', 'Correct!', 'You got it!', 'Sharp!', 'Exactly!', 'Spot on!'];
const sleep = ms => new Promise(r => setTimeout(r, ms));

export const TOOLS = [
  { id: 'strategy', name: 'Strategy Trainer', glyph: 'cards', color: 'blue', purpose: 'Find the right play for any hand, with the chart one tap away.', lesson: 'Basic strategy' },
  { id: 'count', name: 'Count Trainer', glyph: 'count', color: 'orange', purpose: 'Keep a Hi‑Lo running count while cards are dealt at speed.', lesson: 'Running count' },
  { id: 'decks', name: 'Deck Estimator', glyph: 'stack', color: 'teal', purpose: 'Judge how many decks are in a 3D discard tray, to the half deck.', lesson: 'Deck estimation' },
  { id: 'truecount', name: 'True Count Trainer', glyph: 'divide', color: 'purple', purpose: 'Divide the running count by decks left, fast and under a timer.', lesson: 'True count' },
  { id: 'index', name: 'Index Trainer', glyph: 'target', color: 'pink', purpose: 'Know when the true count changes the right play, plus insurance.', lesson: 'Index plays' },
  { id: 'challenge', name: 'Shoe Challenge', glyph: 'trophy', color: 'gold', purpose: 'Play through a shoe: count, estimate, convert, bet, and play. Three hearts.', lesson: 'Everything together' },
  { id: 'simulator', name: 'Bankroll Simulator', glyph: 'chart', color: 'green', purpose: 'See what a game and bet spread do to your bankroll over thousands of hours.', lesson: 'Bankroll and risk' },
];

// ---------------------------------------------------------------------------------------------
// Question makers. Each returns { kind, render(el, ctx), check(), key?(e), instant? }.
// ctx.ready(bool) enables Check; ctx.submit() checks now (used by instant answers and timers).
// ---------------------------------------------------------------------------------------------

function actionButtons(actions) {
  return `<div class="action-row">${actions.map(a => `<button type="button" class="act act-${a}" data-act="${a}"><span>${bj.ACTIONS[a]}</span><kbd>${a}</kbd></button>`).join('')}</div>`;
}
function wireActions(el, q, ctx) {
  $$('[data-act]', el).forEach(b => b.onclick = () => { if (q.chosen) return; q.chosen = b.dataset.act; b.classList.add('chosen'); Sound.play('select'); ctx.submit(); });
  q.key = e => { const k = e.key.toUpperCase(); const b = $(`[data-act="${k}"]`, el); if (b && !b.disabled && !q.chosen) { b.click(); return true; } return false; };
}
function markActions(el, chosen, right) {
  $$('[data-act]', el).forEach(b => { b.disabled = true; if (b.dataset.act === right) b.classList.add('right'); else if (b.dataset.act === chosen) b.classList.add('wrong'); });
}

export function strategyQ({ pool = 'any', h17 = false, surrender = false, das = true, prompt } = {}) {
  const cards = bj.dealHand(pool), dealer = bj.randomCard();
  const rules = { h17, surrender, das };
  const answer = bj.basic(cards, dealer, rules);
  const acts = ['H', 'S', 'D', ...(bj.isPair(cards) ? ['P'] : []), ...(surrender ? ['R'] : [])];
  const q = {
    kind: 'strategy', cards, dealer, rules, instant: true, data: { cards, dealer, h17, surrender, das },
    render(el, ctx) {
      el.innerHTML = `<div class="q"><p class="q-eyebrow">${h17 ? 'Dealer hits soft 17' : 'Dealer stands on soft 17'}${surrender ? ' · Surrender allowed' : ''}</p><h1 class="q-title">${esc(prompt || `You have ${bj.handLabel(cards)} against ${bj.upName(dealer) === 'ace' ? 'an ace' : 'a ' + bj.upName(dealer)}.`)}</h1>${tableHTML({ dealer, cards })}${actionButtons(acts)}</div>`;
      wireActions(el, q, ctx);
    },
    check(el) { q.given = q.chosen; markActions(el, q.chosen, answer); return { ok: q.chosen === answer, answer: bj.ACTIONS[answer], explain: bj.strategyReason(cards, dealer, answer, rules) }; },
  };
  return q;
}

export function indexQ({ hands = null, insurance = true, insuranceOnly = false } = {}) {
  if (insuranceOnly || (insurance && Math.random() < .18)) {
    const tc = bj.randInt(-1, 6), take = tc >= bj.INSURANCE_INDEX;
    const q = {
      kind: 'index', recKind: 'insurance', data: { tc }, instant: true,
      render(el, ctx) {
        el.innerHTML = `<div class="q"><p class="q-eyebrow"><span class="tc-badge">True count ${bj.signed(tc)}</span></p><h1 class="q-title">The dealer shows an ace. Take insurance?</h1>${tableHTML({ dealer: 1, cards: bj.dealHand('hard') })}<div class="action-row"><button type="button" class="act act-S" data-act="Y"><span>Take it</span><kbd>Y</kbd></button><button type="button" class="act act-H" data-act="N"><span>Decline</span><kbd>N</kbd></button></div></div>`;
        $$('[data-act]', el).forEach(b => b.onclick = () => { if (q.chosen) return; q.chosen = b.dataset.act; Sound.play('select'); ctx.submit(); });
        q.key = e => { const k = e.key.toUpperCase(); if ((k === 'Y' || k === 'N') && !q.chosen) { $(`[data-act="${k}"]`, el).click(); return true; } return false; };
      },
      check(el) { q.given = q.chosen; const right = take ? 'Y' : 'N'; markActions(el, q.chosen, right); return { ok: q.chosen === right, answer: take ? 'Take insurance' : 'Decline', explain: `Insurance pays when the true count is +3 or higher. At ${bj.signed(tc)}, ${take ? 'take it' : 'decline'}.` }; },
    };
    return q;
  }
  const pool = bj.INDICES.filter(i => !hands || hands.includes(i[0]));
  const [hand, up, index, action] = bj.pick(pool);
  let cards = hand >= 12 ? [bj.ten(), hand - 10] : [4, hand - 4];
  if (hand === 20) cards = [bj.ten(), bj.ten()];
  const dealer = up === 10 ? bj.ten() : up;
  const tc = bj.randInt(index - 3, index + 3);
  const answer = bj.deviation(cards, dealer, tc), base = bj.basic(cards, dealer);
  const acts = ['H', 'S', 'D', ...(hand === 20 ? ['P'] : [])];
  const q = {
    kind: 'index', data: { cards, dealer, tc }, instant: true,
    render(el, ctx) {
      el.innerHTML = `<div class="q"><p class="q-eyebrow"><span class="tc-badge">True count ${bj.signed(tc)}</span></p><h1 class="q-title">You have ${bj.handLabel(cards)} against ${up === 1 ? 'an ace' : 'a ' + up}.</h1>${tableHTML({ dealer, cards })}${actionButtons(acts)}</div>`;
      wireActions(el, q, ctx);
    },
    check(el) {
      q.given = q.chosen;
      markActions(el, q.chosen, answer);
      const name = `${hand} vs ${up === 1 ? 'A' : up}`;
      const explain = tc >= index ? `The index for ${name} is ${bj.signed(index)}. At ${bj.signed(tc)} you’re at or above it: ${bj.ACTIONS[answer].toLowerCase()}${answer !== base ? ` instead of the basic-strategy ${bj.ACTIONS[base].toLowerCase()}` : ''}.` : `The index for ${name} is ${bj.signed(index)}. At ${bj.signed(tc)} you’re below it: ${bj.ACTIONS[answer].toLowerCase()}.`;
      return { ok: q.chosen === answer, answer: bj.ACTIONS[answer], explain };
    },
  };
  return q;
}

/** Deal a realistic round to a full table: players hit by basic strategy, then the dealer flips and draws. */
function dealRound(seats) {
  const draw = bj.randomCard, steps = [];
  const hands = Array.from({ length: seats }, () => []), dealer = [];
  for (let s = 0; s < seats; s++) { const c = draw(); hands[s].push(c); steps.push({ to: s, c }); }
  const up = draw(); dealer.push(up); steps.push({ to: 'd', c: up });
  for (let s = 0; s < seats; s++) { const c = draw(); hands[s].push(c); steps.push({ to: s, c }); }
  const hole = draw(); dealer.push(hole); steps.push({ to: 'd', hole: true });
  for (let s = 0; s < seats; s++) {
    for (let k = 0; k < 6 && bj.total(hands[s]).total < 21; k++) {
      const act = bj.basic(hands[s], up, { split: false });
      if (act !== 'H' && act !== 'D') break;
      const c = draw(); hands[s].push(c); steps.push({ to: s, c });
      if (act === 'D') break;
    }
  }
  steps.push({ to: 'd', flip: true, c: hole });
  while (bj.total(dealer).total < 17) { const c = draw(); dealer.push(c); steps.push({ to: 'd', c }); }
  const counted = steps.filter(s => !s.hole).map(s => s.c);
  return { steps, counted };
}

export function countQ({ cards: n = 8, speed = 900, perFlash = 1, start = 0, prompt, table = false, seats = 3 } = {}) {
  if (table) return tableCountQ({ seats, speed, start, prompt });
  const cards = Array.from({ length: n }, bj.randomCard);
  const answer = start + cards.reduce((a, c) => a + bj.hilo(c), 0);
  let num, dealt = false;
  const q = {
    kind: 'count', hint: 'Type the count (± for negatives), then press Enter',
    render(el, ctx) {
      el.innerHTML = `<div class="q"><p class="q-eyebrow">${n} cards · ${perFlash > 1 ? 'two at a time · ' : ''}${(speed / 1000).toFixed(speed < 1000 ? 2 : 1).replace(/0$/, '')} s each</p><h1 class="q-title">${esc(prompt || (start ? `The count is ${bj.signed(start)} coming in. Keep counting.` : 'Keep the running count.'))}</h1><p class="sr">This drill shows cards visually, one at a time. They are not read aloud, because announcing them would give away the count.</p><div class="flash-stage" aria-live="off"><div class="flash-cards"><span class="flash-ready">${ace('think', 'ace-sm')}<b>Get ready…</b></span></div><div class="flash-progress"><span></span></div></div><div class="answer-slot" hidden></div></div>`;
      const stage = $('.flash-cards', el), bar = $('.flash-progress span', el);
      (async () => {
        await sleep(900);
        for (let i = 0; i < n; i += perFlash) {
          if (!el.isConnected) return;
          stage.innerHTML = cards.slice(i, i + perFlash).map((c, j) => cardHTML(c, i + j, { cls: 'flash-in' })).join('');
          bar.style.width = `${Math.min(n, i + perFlash) / n * 100}%`;
          Sound.play('deal');
          await sleep(speed);
        }
        if (!el.isConnected) return;
        stage.innerHTML = `<span class="flash-ready">${g('count')}<b>What’s the running count?</b></span>`;
        const slot = $('.answer-slot', el); slot.hidden = false;
        num = mountNumber(slot, { label: 'Running count', onChange: v => ctx.ready(v !== null) });
        dealt = true;
      })();
    },
    check() {
      const v = num?.value; q.given = dealt ? v : null;
      const tags = cards.map(c => `${bj.rank(c)} ${bj.signed(bj.hilo(c))}`).join(', ');
      return { ok: dealt && v === answer, answer: bj.signed(answer), explain: `${start ? `Started at ${bj.signed(start)}. ` : ''}${tags.length > 160 ? `High cards ${cards.filter(c => bj.hilo(c) < 0).length}, low cards ${cards.filter(c => bj.hilo(c) > 0).length}` : tags} → ${bj.signed(answer)}.` };
    },
    cards, answer, data: { cards, start },
  };
  return q;
}

function tableCountQ({ seats = 3, speed = 900, start = 0, prompt }) {
  const { steps, counted } = dealRound(seats);
  const answer = start + counted.reduce((a, c) => a + bj.hilo(c), 0);
  let num, dealt = false;
  const q = {
    kind: 'count', hint: 'Type the count (± for negatives), then press Enter', data: { cards: counted, start }, answer, cards: counted,
    render(el, ctx) {
      el.innerHTML = `<div class="q"><p class="q-eyebrow">Full table · ${seats} players · ${(speed / 1000).toFixed(2).replace(/0$/, '')} s per card</p><h1 class="q-title">${esc(prompt || 'Count every card as the round is dealt and played.')}</h1><p class="sr">This drill shows cards visually, one at a time. They are not read aloud, because announcing them would give away the count.</p><div class="deal-table" aria-live="off"><div class="seat dealer"><span class="hand-label">Dealer</span><div class="cards"></div></div><div class="seats">${Array.from({ length: seats }, (_, i) => `<div class="seat" data-seat="${i}"><div class="cards"></div><span class="hand-label">Player ${i + 1}</span></div>`).join('')}</div><p class="deal-status">${ace('think', 'ace-xs')}<b>Get ready…</b></p></div><div class="answer-slot" hidden></div></div>`;
      const status = $('.deal-status b', el);
      (async () => {
        await sleep(900);
        status.textContent = 'Dealing…';
        let i = 0;
        for (const s of steps) {
          if (!el.isConnected) return;
          const box = s.to === 'd' ? $('.seat.dealer .cards', el) : $(`[data-seat="${s.to}"] .cards`, el);
          if (s.flip) { const back = $('.pc.back', box); if (back) back.outerHTML = cardHTML(s.c, 7, { cls: 'flash-in' }); status.textContent = 'Dealer reveals and draws…'; }
          else box.insertAdjacentHTML('beforeend', s.hole ? cardHTML(0, 0, { back: true, cls: 'flash-in' }) : cardHTML(s.c, i++, { cls: 'flash-in' }));
          Sound.play('deal');
          await sleep(s.hole ? speed / 2 : speed);
        }
        if (!el.isConnected) return;
        status.textContent = 'What’s the running count?';
        const slot = $('.answer-slot', el); slot.hidden = false;
        num = mountNumber(slot, { label: 'Running count', onChange: v => ctx.ready(v !== null) });
        dealt = true;
      })();
    },
    check() {
      const v = num?.value; q.given = dealt ? v : null;
      const hi = counted.filter(c => bj.hilo(c) < 0).length, lo = counted.filter(c => bj.hilo(c) > 0).length;
      return { ok: dealt && v === answer, answer: bj.signed(answer), explain: `${counted.length} cards were seen: ${lo} low (+1) and ${hi} high (−1)${start ? `, starting from ${bj.signed(start)}` : ''}. The hole card counts once it’s turned over.` };
    },
  };
  return q;
}

export function decksQ({ shoe = 6, markers = false, reference = true, ask = 'tray', decks = null } = {}) {
  const tray = decks ?? bj.randInt(1, shoe * 2 - 1) / 2;
  const left = shoe - tray, answer = ask === 'tray' ? tray : left;
  let step;
  const q = {
    kind: 'decks', tray, shoe, data: { tray, shoe, ask }, hint: 'Use + and −, then press Enter',
    render(el, ctx) {
      el.innerHTML = `<div class="q"><p class="q-eyebrow">${shoe}-deck shoe · answer to the nearest half deck</p><h1 class="q-title">${ask === 'tray' ? 'How many decks are in the discard tray?' : 'How many decks are left to play?'}</h1><div class="tray-row"><div class="tray-slot"></div><div class="answer-slot"></div></div></div>`;
      mountTray($('.tray-slot', el), { decks: tray, shoe, markers, reference });
      step = mountStepper($('.answer-slot', el), { min: ask === 'tray' ? .5 : .5, max: shoe - .5, label: ask === 'tray' ? 'decks in the tray' : 'decks left', onChange: () => ctx.ready(true) });
      q.key = e => step.key(e);
    },
    check() { q.given = step.value; return { ok: step.value === answer, answer: `${bj.halves(answer)} deck${answer === 1 ? '' : 's'}`, explain: `The tray holds ${bj.halves(tray)} deck${tray === 1 ? '' : 's'}, so ${bj.halves(left)} of ${shoe} are left to play.${ask === 'tray' ? '' : ' Decks left = shoe size − decks in the tray.'}` }; },
  };
  return q;
}

export function trueCountQ({ rcMin = -10, rcMax = 16, deckOptions = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5], timer = 0, rc = null, decks = null } = {}) {
  const R = rc ?? bj.randInt(rcMin, rcMax), D = decks ?? bj.pick(deckOptions), answer = bj.trueCount(R, D);
  let num, timerId;
  const q = {
    kind: 'truecount', hint: 'Type the true count (± for negatives), then press Enter',
    render(el, ctx) {
      el.innerHTML = `<div class="q"><p class="q-eyebrow">True count = running count ÷ decks left, rounded down</p><h1 class="q-title">What’s the true count?</h1><div class="tile-row"><div class="big-tile blue"><small>Running count</small><strong>${bj.signed(R)}</strong></div><div class="big-tile teal"><small>Decks left</small><strong>${bj.halves(D)}</strong></div></div>${timer ? '<div class="timer"><span></span></div>' : ''}<div class="answer-slot"></div></div>`;
      num = mountNumber($('.answer-slot', el), { label: 'True count', onChange: v => ctx.ready(v !== null) });
      if (timer) {
        const bar = $('.timer span', el); bar.style.transitionDuration = `${timer}s`;
        requestAnimationFrame(() => requestAnimationFrame(() => bar.style.width = '0%'));
        timerId = setTimeout(() => { q.timedOut = true; ctx.submit(); }, timer * 1000);
      }
    },
    check() {
      clearTimeout(timerId);
      const exact = R / D, v = q.timedOut ? null : num.value;
      q.data = { rc: R, decks: D, timedOut: !!q.timedOut }; q.given = v;
      const how = exact === answer ? `${bj.signed(R)} ÷ ${bj.halves(D)} = ${bj.signed(answer)}.` : `${bj.signed(R)} ÷ ${bj.halves(D)} = ${bj.signed(Math.round(exact * 100) / 100)}, rounded down to ${bj.signed(answer)}.`;
      return { ok: v === answer, answer: bj.signed(answer), explain: (q.timedOut ? 'Out of time. ' : '') + how };
    },
    destroy() { clearTimeout(timerId); },
  };
  return q;
}

export function betQ({ max = 12, unit = 25, tc = null } = {}) {
  const T = tc ?? bj.randInt(-3, 9), answer = bj.rampBet(T, max);
  let num;
  const q = {
    kind: 'bet', hint: 'Type the number of units, then press Enter',
    render(el, ctx) {
      el.innerHTML = `<div class="q"><p class="q-eyebrow">Ramp: 1 unit at +1 or lower, then true count − 1 units, up to ${max}</p><h1 class="q-title">How many units do you bet?</h1><div class="tile-row"><div class="big-tile purple"><small>True count</small><strong>${bj.signed(T)}</strong></div><div class="big-tile gold"><small>1 unit</small><strong>$${unit}</strong></div></div><div class="answer-slot"></div></div>`;
      num = mountNumber($('.answer-slot', el), { label: 'Units to bet', onChange: v => ctx.ready(v !== null) });
    },
    check() { q.data = { tc: T, max }; q.given = num.value; return { ok: num.value === answer, answer: `${answer} unit${answer === 1 ? '' : 's'} ($${answer * unit})`, explain: T <= 1 ? `At ${bj.signed(T)} the house has the edge, so bet the minimum: 1 unit.` : answer === max && T - 1 > max ? `TC − 1 is ${T - 1}, but your ramp caps at ${max} units.` : `TC − 1 = ${T} − 1 = ${answer} unit${answer === 1 ? '' : 's'}.` }; },
  };
  return q;
}

export function choiceQ(step) {
  let selected = -1;
  const q = {
    kind: 'choice', hint: 'Pick an answer (or press 1–4), then press Enter',
    render(el, ctx) {
      el.innerHTML = `<div class="q">${step.retry ? '<span class="pill warn">Let’s try that again</span>' : ''}<h1 class="q-title">${esc(step.prompt)}</h1>${step.cards || step.dealer ? tableHTML({ dealer: step.dealer, cards: step.cards, holeCard: !!step.dealer }) : ''}<div class="choice-list" role="radiogroup">${step.options.map((o, i) => `<button type="button" class="choice-tile" role="radio" aria-checked="false" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div></div>`;
      const choose = i => { selected = i; Sound.play('select'); $$('.choice-tile', el).forEach((b, j) => { b.classList.toggle('selected', i === j); b.setAttribute('aria-checked', i === j); }); ctx.ready(true); };
      $$('.choice-tile', el).forEach(b => b.onclick = () => choose(Number(b.dataset.i)));
      q.key = e => { if (/^[1-9]$/.test(e.key) && Number(e.key) <= step.options.length) { choose(Number(e.key) - 1); return true; } return false; };
    },
    check(el) {
      q.data = { prompt: step.prompt, options: step.options, cards: step.cards || null }; q.given = selected;
      $$('.choice-tile', el).forEach((b, j) => { b.disabled = true; b.classList.remove('selected'); if (j === step.answer) b.classList.add('right'); else if (j === selected) b.classList.add('wrong'); });
      return { ok: selected === step.answer, answer: step.options[step.answer], explain: step.explain || '' };
    },
  };
  return q;
}

export function teachQ(step) {
  return {
    kind: 'teach', teach: true,
    render(el) {
      el.innerHTML = `<div class="q teach"><span class="pill">New idea</span><h1 class="q-title">${esc(step.title)}</h1>${step.cards || step.dealer ? tableHTML({ dealer: step.dealer, cards: step.cards, holeCard: !!step.dealer && !!step.cards }) : ''}${step.chart ? chartHTML(step.chart) : ''}<p class="teach-text">${esc(step.text)}</p>${step.tip ? `<p class="teach-tip">${g('star')}<span>${esc(step.tip)}</span></p>` : ''}</div>`;
    },
  };
}

/** A strategy chart, optionally only some groups, with a highlighted cell. */
export function chartHTML(opts = {}) {
  const { groups = ['Hard', 'Soft', 'Pairs'], rules = {}, highlight = null } = typeof opts === 'object' ? opts : {};
  const { ups, rows } = bj.chart(rules);
  const head = `<tr><th></th>${ups.map(u => `<th>${u === 1 ? 'A' : u}</th>`).join('')}</tr>`;
  const body = rows.filter(r => groups.includes(r.group)).map(r => `<tr class="${highlight && highlight.row === r.label ? 'hl-row' : ''}"><th>${r.group === 'Hard' ? r.label : r.label}</th>${r.actions.map((a, i) => `<td class="ch-${a} ${highlight && highlight.row === r.label && Math.min(highlight.up, 10) === Math.min(ups[i], 10) ? 'hl' : ''}">${a === 'P' ? 'Sp' : a === 'R' ? 'Rs' : a}</td>`).join('')}</tr>`).join('');
  return `<div class="chart-wrap"><table class="strat-chart" aria-label="Basic strategy chart"><thead>${head}</thead><tbody>${body}</tbody></table><p class="chart-key"><span class="ch-H">H</span> Hit <span class="ch-S">S</span> Stand <span class="ch-D">D</span> Double <span class="ch-P">Sp</span> Split${rules.surrender ? ' <span class="ch-R">Rs</span> Surrender' : ''}</p></div>`;
}

/** A guided mini-shoe: count a round, read the tray, convert, size the bet, then play the hand. */
export function scenarioQs({ shoe = 6 } = {}) {
  const start = bj.randInt(-3, 6), round = countQ({ cards: bj.randInt(8, 12), speed: 800, start, prompt: `Mid-shoe, the count is ${bj.signed(start)}. Count this round.` });
  const tray = bj.randInt(2, shoe * 2 - 3) / 2, left = shoe - tray;
  const rc = round.answer, tc = bj.trueCount(rc, left);
  const hand = bj.dealHand('any'), dealer = bj.randomCard();
  // The final hand is played with the count: use deviations at this true count.
  const answer = bj.deviation(hand, dealer, tc);
  const acts = ['H', 'S', 'D', ...(bj.isPair(hand) ? ['P'] : [])];
  const final = {
    kind: 'scenario-play', recKind: 'play', data: { cards: hand, dealer, tc }, instant: true,
    render(el, ctx) { el.innerHTML = `<div class="q"><p class="q-eyebrow"><span class="tc-badge">True count ${bj.signed(tc)}</span></p><h1 class="q-title">Your bet is out. You have ${bj.handLabel(hand)} against ${dealer === 1 ? 'an ace' : 'a ' + bj.upName(dealer)}.</h1>${tableHTML({ dealer, cards: hand })}${actionButtons(acts)}</div>`; wireActions(el, final, ctx); },
    check(el) { final.given = final.chosen; markActions(el, final.chosen, answer); const idx = bj.findIndex(hand, dealer); return { ok: final.chosen === answer, answer: bj.ACTIONS[answer], explain: idx ? `With an index of ${bj.signed(idx[2])} for ${idx[0]} vs ${idx[1] === 1 ? 'A' : idx[1]}, at ${bj.signed(tc)}: ${bj.ACTIONS[answer].toLowerCase()}.` : bj.strategyReason(hand, dealer, answer) }; },
  };
  return [
    round,
    decksQ({ shoe, decks: tray, ask: 'remaining', reference: true }),
    trueCountQ({ rc, decks: left }),
    betQ({ tc }),
    final,
  ];
}

// ---------------------------------------------------------------------------------------------
// Runner: draws a question in `body`, drives Check/Continue in `foot`, and reports results.
// ---------------------------------------------------------------------------------------------
export function createRunner({ body, foot, next, onResult, onEmpty, onKeyExtra }) {
  let q = null, checked = false, ready = false, streak = 0;
  function setFoot(html, cls = '') { foot.className = 'coach-foot ' + cls; foot.innerHTML = html; }
  function primary() { return $('#run-primary', foot); }
  function show() {
    q?.destroy?.();
    q = next();
    if (!q) { onEmpty?.(); return; }
    checked = false; ready = false;
    const ctx = { ready: v => { ready = v; const b = primary(); if (b && !checked) b.disabled = !v; }, submit: () => check() };
    body.innerHTML = '';
    if (q.teach) setFoot(`<span></span><button type="button" class="primary chunky" id="run-primary">Continue</button>`);
    else if (q.instant) setFoot(`<span class="foot-hint">Tap an answer or press its key</span>`);
    else setFoot(`<span class="foot-hint">${q.hint || 'Press Enter to check'}</span><button type="button" class="primary chunky" id="run-primary" disabled>Check</button>`);
    q.render(body, ctx);
    body.scrollTop = 0;
    if (primary()) primary().onclick = () => (q.teach ? advance() : check());
  }
  function check() {
    if (checked || q.teach) return;
    checked = true;
    const r = q.check(body);
    r.record = { kind: q.recKind || q.kind, data: q.data, given: q.given ?? null };
    Sound.play(r.ok ? 'correct' : 'wrong');
    streak = r.ok ? streak + 1 : 0;
    react(r.ok, { streak, anchor: body.querySelector('.felt-table, .deal-table, .tray-row, .choice-grid, .answers') || body });
    setFoot(`<div class="verdict">${ace(r.ok ? 'wow' : 'oops', 'ace-xs')}<div><strong>${r.ok ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : 'Correct answer: ' + esc(r.answer)}</strong><p>${esc(r.explain || '')}</p></div></div><button type="button" class="primary chunky" id="run-primary">Continue</button>`, r.ok ? 'ok' : 'bad');
    primary().onclick = advance; primary().focus({ preventScroll: true });
    onResult?.(q, r);
  }
  function advance() { Sound.play('tap'); show(); }
  function onKey(e) {
    if (!q || e.metaKey || e.ctrlKey || e.altKey) return;
    if (onKeyExtra?.(e)) return;
    const typing = e.target.closest?.('input,textarea,select');
    if (e.key === 'Enter') {
      const b = primary(); if (b && !b.disabled && (typing || !e.target.closest?.('button,a'))) { e.preventDefault(); b.click(); }
      return;
    }
    if (typing || checked) return;
    if (q.key && q.key(e)) e.preventDefault();
  }
  document.addEventListener('keydown', onKey);
  return { start: show, destroy() { q?.destroy?.(); document.removeEventListener('keydown', onKey); }, get current() { return q; } };
}

/** Turn a lesson step (from the server) into one or more questions. */
export function questionsForStep(step) {
  if (step.type === 'teach') return [teachQ(step)];
  if (step.type === 'choice') return [choiceQ(step)];
  if (step.type === 'tool') {
    const reps = step.reps || 1, c = step.config || {};
    if (step.tool === 'scenario') return Array.from({ length: reps }, () => scenarioQs(c)).flat();
    const make = { strategy: strategyQ, count: countQ, decks: decksQ, truecount: trueCountQ, index: indexQ, bet: betQ }[step.tool];
    if (!make) return [];
    return Array.from({ length: reps }, () => Object.assign(make(c), { remake: () => make(c) }));
  }
  return [];
}
