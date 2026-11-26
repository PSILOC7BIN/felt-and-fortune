// Plain-language explanations for strategy decisions, for complete beginners and experts alike.
// Everything is said in "out of 100 hands" and dollars, never in percentages of a bet or expected value.
import { total, isPair, basic, ACTIONS } from './bj.js';
import { actionEVs, outcomeChances } from './ev.js';

const n100 = x => Math.round(x * 100);
const upWord = up => (up === 1 ? 'an ace' : up === 8 ? 'an 8' : `a ${Math.min(up, 10)}`);
const UP_NAME = up => (up === 1 ? 'ace' : String(Math.min(up, 10)));
const strong = up => up === 1 || up >= 7;
const money = x => `$${Math.round(Math.abs(x))}`;

/** A short reason (for the feedback bar) and a fuller one (for “Here’s why”). `given` is the learner’s play, if wrong. */
export function explain(cards, up, rules = {}, given = null) {
  const act = basic(cards, up, rules);
  const { total: t, soft } = total(cards);
  const o = outcomeChances(cards, up, rules), ev = actionEVs(cards, up, rules);
  const db = n100(o.dealerBust), pair = isPair(cards), pv = Math.min(cards[0], 10);
  const upTxt = upWord(up), Up = upTxt[0].toUpperCase() + upTxt.slice(1);
  const dealerLine = strong(up)
    ? `${Up} is a strong card for the dealer. Think of the hidden card as a 10: that would give them ${up === 1 ? 21 : Math.min(up, 10) + 10}. With ${upTxt} showing, the dealer busts only about ${db} times in 100.`
    : `${Up} is a weak card for the dealer. They must keep drawing until they reach 17, and from ${upTxt} they bust about ${db} times in 100.`;
  let short, why;
  if (act === 'R') {
    short = `Surrender: give up half your bet and keep the other half. ${t} against ${upTxt} loses so often that half back is the cheaper choice.`;
    why = `${dealerLine} Standing on ${t} would lose about ${n100(o.S.l)} of 100 hands, and hitting about ${n100(o.H.l)}. Surrendering always costs exactly half your bet, which over many hands costs less than playing it out.`;
  } else if (act === 'P') {
    short = pv === 1 ? 'Split aces: each ace starts a new hand worth 11, a great start.' : pv === 8 ? 'Split 8s: 16 is the worst total in blackjack, but each 8 is a decent start on its own.' : `Split ${pv}s: two hands starting with ${pv} do better than one ${pv * 2} against ${upTxt}.`;
    why = `Splitting turns your pair into two separate hands, each with its own bet. ${dealerLine} ${pv === 8 ? `Kept together, 16 against ${upTxt} loses about ${n100(o.S.l)} of 100 hands if you stand.` : pv === 1 ? 'Kept together, two aces are just a soft 12.' : ''} Over 100 hands at $10, splitting comes out about ${money((ev.P - Math.max(ev.H, ev.S, ev.D ?? -9)) * 1000)} better than the next-best play.`;
  } else if (pair && pv === 10) {
    short = 'Never split tens: 20 already wins most of the time.';
    why = `Standing on 20 against ${upTxt} wins about ${n100(o.S.w)} of 100 hands and ties about ${n100(o.S.p)}. Splitting throws away a great hand for two hands that each start at 10.`;
  } else if (act === 'D') {
    const dw = n100(o.D.w);
    short = `Double: you’re likely to win this hand, so put more money on it. You get exactly one more card.`;
    why = `Doubling adds a second bet the same size as the first, and you get one more card. ${soft ? `Your soft ${t} can’t bust with one card. ` : `With ${t}, any 10 (the most common card) gives you a strong total. `}${dealerLine} Doubled, you win about ${dw} of 100 hands. Over 100 hands at $10, doubling earns about ${money((ev.D - ev.H) * 1000)} more than just hitting.`;
  } else if (act === 'S') {
    if (!soft && t >= 17) {
      short = `Stand: hitting ${t} busts you too often.`;
      why = `Any card bigger than ${21 - t} would push you over 21, which happens about ${n100(o.bustNext)} times in 100. Standing on ${t} wins or ties about ${n100(o.S.w + o.S.p)} of 100 hands against ${upTxt}.`;
    } else if (soft) {
      short = `Stand: soft ${t} is already a good total against ${upTxt}.`;
      why = `“Soft” means you have an ace counting as 11. ${dealerLine} Soft ${t} wins or ties about ${n100(o.S.w + o.S.p)} of 100 hands if you stand, more than you’d get by drawing.`;
    } else {
      short = `Stand: let the dealer take the risk. ${Up} busts the dealer often.`;
      why = `${dealerLine} If you hit ${t}, you bust about ${n100(o.bustNext)} times in 100 before the dealer even plays. Standing wins whenever the dealer busts, so you lose about ${n100(o.S.l)} of 100 hands instead of ${n100(o.H.l)} by hitting.`;
    }
  } else {   // hit
    if (!soft && t <= 11) {
      short = `Hit: you can’t bust with ${t}, and any card makes your hand better.`;
      why = `The highest card is worth 10, so ${t} plus anything is at most ${t + 10}: no risk of going over 21. ${dealerLine} Standing on ${t} only wins when the dealer busts.`;
    } else if (soft) {
      short = `Hit: soft ${t} can’t bust with one card, and it’s not strong enough yet.`;
      why = `“Soft” means you have an ace counting as 11. If a big card would take you over 21, the ace simply counts as 1 instead, so one more card can’t bust you. ${dealerLine} Hitting loses about ${n100(o.H.l)} of 100 hands versus ${n100(o.S.l)} by standing.`;
    } else {
      short = `Hit: ${t} is unlikely to win against ${upTxt} unless you improve it.`;
      why = `${dealerLine} Standing on ${t} wins only when the dealer busts, about ${n100(o.S.w)} times in 100. Hitting busts you about ${n100(o.bustNext)} times in 100, but the cards that don’t bust you often give you a total that wins or ties, so you lose about ${n100(o.H.l)} of 100 hands instead of ${n100(o.S.l)}.`;
    }
  }
  if (given && given !== act && ev[given] !== undefined) {
    const diff = (ev[act] - ev[given]) * 1000;
    why += diff < 5 ? ` ${ACTIONS[given]} is almost as good here; it’s a close call.` : ` Choosing ${ACTIONS[given].toLowerCase()} instead costs about ${money(diff)} for every 100 hands you play at $10.`;
  }
  return { act, short, why };
}

/** “Here’s why”: the explanation plus, for each play, what happens out of 100 hands like this. */
export function whyHTML(cards, up, rules = {}, given = null) {
  const { act, why } = explain(cards, up, rules, given);
  const o = outcomeChances(cards, up, rules), ev = actionEVs(cards, up, rules);
  const rows = Object.keys(ev).sort((a, b) => ev[b] - ev[a]).map(a => {
    const net = ev[a] * 1000, cls = `${a === act ? 'best' : ''}${a === given && a !== act ? ' picked' : ''}`;
    const x = o[a];
    const bar = a === 'R' ? '<span class="wb-half">You always get half back</span>'
      : x ? `<span class="wb"><i class="w" style="width:${n100(x.w)}%"></i><i class="p" style="width:${n100(x.p)}%"></i><i class="l" style="width:${n100(x.l)}%"></i></span>` : '<span class="wb-half">Two hands, played separately</span>';
    const nums = a === 'R' ? 'Lose half, every time' : x ? `Win ${n100(x.w)} · Tie ${n100(x.p)} · Lose ${n100(x.l)}` : '';
    return `<li class="${cls}"><span class="why-act">${ACTIONS[a]}${a === act ? ' ✓' : ''}${a === given && a !== act ? ' (you)' : ''}</span>${bar}<span class="why-num">${nums}</span><span class="why-net ${net >= 0 ? 'up' : 'down'}">${net >= 0 ? '+' : '−'}${money(net)}</span></li>`;
  }).join('');
  return `<div class="why-panel"><p class="why-text">${why}</p><p class="why-head">Out of 100 hands like this, betting $10 each</p><ul class="why-list plain">${rows}</ul><p class="why-legend"><span class="k w"></span>win <span class="k p"></span>tie <span class="k l"></span>lose · the last column is how much you’d be up or down after all 100 hands. Doubles risk $20 a hand.</p></div>`;
}

/** The coach's walkthrough: short steps, each pointing at one thing on the table (you, the dealer, or a play). */
export function walkSteps(cards, up, rules = {}, given = null) {
  const act = basic(cards, up, rules);
  const { total: t, soft } = total(cards);
  const o = outcomeChances(cards, up, rules), ev = actionEVs(cards, up, rules);
  const pair = isPair(cards), pv = Math.min(cards[0], 10), upTxt = upWord(up), Up = upTxt[0].toUpperCase() + upTxt.slice(1);
  const pairName = pv === 1 ? 'aces' : `${pv}s`;
  const steps = [];
  steps.push({ at: 'you', text: pair ? `You have a pair of ${pairName}.` : soft ? `You have soft ${t}. The ace counts as 11, but it can drop to 1, so one card can’t bust you.` : `You have hard ${t}.` });
  steps.push({ at: 'dealer', text: strong(up) ? `The dealer shows ${upTxt}. That’s a strong card. Picture a 10 underneath: that makes ${up === 1 ? 21 : Math.min(up, 10) + 10}.` : `The dealer shows ${upTxt}. That’s a weak card. The dealer must keep drawing to 17 and busts about ${n100(o.dealerBust)} times in 100.` });
  if (act === 'R') {
    steps.push({ at: 'act:R', text: 'Surrender ends the hand and gives you back half your bet.' });
    steps.push({ at: 'act:R', text: `${t} against ${upTxt} loses about ${n100(o.S.l)} of 100 hands. Getting half back is cheaper. Surrender.` });
  } else if (act === 'P') {
    steps.push({ at: 'act:P', text: 'Splitting turns your pair into two hands, each with its own bet.' });
    steps.push({ at: 'act:P', text: pv === 8 ? '16 is the worst hand in blackjack. Two hands that start with 8 do much better. Split.' : pv === 1 ? 'Two aces together are just 12. Split, and each ace starts a new hand at 11.' : `Two hands starting with ${pv} do better than one ${pv * 2} here. Split.` });
  } else if (pair && pv === 10) {
    steps.push({ at: 'act:S', text: `20 already wins about ${n100(o.S.w)} of 100 hands. Never break it up. Stand.` });
  } else if (act === 'D') {
    steps.push({ at: 'act:D', text: 'Doubling puts in a second bet. You get exactly one more card.' });
    steps.push({ at: 'act:D', text: `Here you win about ${n100(o.D.w)} of 100 hands. When you’re likely to win, put more money out. Double.` });
  } else if (act === 'S') {
    if (!soft && t >= 17) steps.push({ at: 'act:H', text: `Hitting ${t} busts you about ${n100(o.bustNext)} times in 100.` }, { at: 'act:S', text: 'That’s too risky. Stand.' });
    else if (soft) steps.push({ at: 'act:S', text: `Soft ${t} already wins or ties about ${n100(o.S.w + o.S.p)} of 100 hands. Stand.` });
    else steps.push({ at: 'act:H', text: `If you hit ${t}, you bust about ${n100(o.bustNext)} times in 100.` }, { at: 'act:S', text: `Let the dealer take the risk instead. Standing loses ${n100(o.S.l)} of 100, hitting loses ${n100(o.H.l)}. Stand.` });
  } else {   // hit
    if (!soft && t <= 11) steps.push({ at: 'act:H', text: `No card can bust ${t}: the biggest card is 10. Hit.` });
    else if (soft) steps.push({ at: 'act:H', text: `Soft ${t} isn’t strong enough yet, and hitting can’t bust you. Hit.` });
    else steps.push({ at: 'act:S', text: `If you stand on ${t}, you only win when the dealer busts: about ${n100(o.S.w)} times in 100.` }, { at: 'act:H', text: `Hitting loses ${n100(o.H.l)} of 100 instead of ${n100(o.S.l)}. It loses less, so hit.` });
  }
  if (given && given !== act && ev[given] !== undefined) {
    const diff = (ev[act] - ev[given]) * 1000;
    steps.push({ at: 'act:' + given, text: diff < 5 ? `You picked ${ACTIONS[given].toLowerCase()}. That’s a close call, almost as good.` : `You picked ${ACTIONS[given].toLowerCase()}. Over 100 hands at $10, that costs about ${money(diff)} more.` });
  }
  return steps;
}
