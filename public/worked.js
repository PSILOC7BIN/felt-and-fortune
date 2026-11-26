// Worked examples: after a new idea, the app plays one example step by step (each step appears in turn, next to
// the thing it describes), then the learner's first question is marked "Your turn". Worked example → guided try →
// practice is the order the research recommends for beginners.
import { esc, $, $$, Sound, tableHTML, cardHTML, g } from './ui.js';
import { explain } from './explain.js';
import * as bj from './bj.js';

const sentences = t => (t.match(/[^.!?]+[.!?]+/g) || [t]).map(s => s.trim());
const vs = up => (up === 1 ? 'an ace' : 'a ' + bj.upName(up));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

function shell(title, visual, steps, extra = '') {
  return `<div class="q worked"><span class="pill worked-pill">${g('star')} Worked example</span><h1 class="q-title">${title}</h1>${visual}
    <ol class="worked-steps">${steps.map((s, i) => `<li style="--i:${i}"><span class="n">${i + 1}</span><span>${s}</span></li>`).join('')}</ol>${extra}</div>`;
}

/** Build a worked example that matches the kind of question `q` is, or null when there's no good one. */
export function workedFor(q) {
  const k = q?.recKind || q?.kind;
  if (k === 'strategy' && q.cards) return strategyExample(q);
  if (k === 'index' && q.data?.cards) return indexExample();
  if (k === 'count') return countExample();
  if (k === 'truecount') return trueCountExample();
  if (k === 'bet') return betExample();
  // Multiple-choice questions are each different, so a worked one would just give away the next answer.
  return null;
}

function teachQ(render) { return { kind: 'teach', teach: true, worked: true, render }; }

function strategyExample(q) {
  // Same kind of hand as the question that follows (hard, soft, or pair), with the same rules, but a different hand.
  const kind = bj.isPair(q.cards) ? 'pair' : bj.total(q.cards).soft ? 'soft' : 'hard';
  let cards, up, tries = 0;
  do { cards = bj.dealHand(kind); up = bj.randomCard(); tries++; } while (tries < 20 && bj.total(cards).total === bj.total(q.cards).total && Math.min(up, 10) === Math.min(q.dealer, 10));
  const rules = q.rules || {}, e = explain(cards, up, rules), act = e.act;
  const { total: t, soft } = bj.total(cards);
  const steps = [
    `Add up your hand: ${bj.isPair(cards) ? `a pair of ${bj.upName(cards[0]) === 'ace' ? 'aces' : bj.upName(cards[0]) + 's'}` : `${soft ? 'soft' : 'hard'} ${t}`}${soft ? ' (the ace counts as 11)' : ''}.`,
    ...sentences(e.why).slice(0, 2),
    `So the right play is <b>${bj.ACTIONS[act]}</b>.`,
  ];
  return teachQ(el => {
    el.innerHTML = shell(`${cap(bj.handLabel(cards))} against ${vs(up)}`, `${tableHTML({ dealer: up, cards })}<div class="action-row worked-acts">${['H', 'S', 'D', ...(bj.isPair(cards) ? ['P'] : [])].map(a => `<span class="act act-${a} ${a === act ? 'pick' : 'dim'}"><span>${bj.ACTIONS[a]}</span></span>`).join('')}</div>`, steps);
    Sound.play('reveal');
  });
}

function indexExample() {
  const [hand, up, index, action] = bj.pick(bj.INDICES.filter(i => i[0] !== 20));
  const cards = hand >= 12 ? [10, hand - 10] : [4, hand - 4], tc = index + 1 + Math.floor(Math.random() * 2);
  const base = bj.basic(cards, up);
  const steps = [`Basic strategy says <b>${bj.ACTIONS[base]}</b> with ${hand} against ${vs(up)}.`, `This hand has an index of ${bj.signed(index)}: at a true count of ${bj.signed(index)} or higher, the right play changes.`, `The true count is ${bj.signed(tc)}, at or above the index, so <b>${bj.ACTIONS[action]}</b> instead.`];
  return teachQ(el => { el.innerHTML = shell(`${hand} against ${vs(up)} at true count ${bj.signed(tc)}`, tableHTML({ dealer: up, cards }), steps); Sound.play('reveal'); });
}

function countExample() {
  const cards = [5, 13, 3, 8, 1, 6];
  let rc = 0; const run = cards.map(c => (rc += bj.hilo(c)));
  const steps = ['Give each card its tag: 2–6 are +1, 7–9 are 0, tens and aces are −1.', `Keep one running total as each card appears: ${run.map(bj.signed).join(', ')}.`, `After these six cards, the running count is <b>${bj.signed(rc)}</b>.`];
  return teachQ(el => {
    el.innerHTML = shell('Counting six cards', `<div class="worked-cards">${cards.map((c, i) => `<span class="wc" style="--i:${i}">${cardHTML(c, i)}<em class="${bj.hilo(c) > 0 ? 'p' : bj.hilo(c) < 0 ? 'm' : 'z'}">${bj.signed(bj.hilo(c))}</em><b>${bj.signed(run[i])}</b></span>`).join('')}</div>`, steps);
    Sound.play('reveal');
  });
}

function trueCountExample() {
  const steps = ['Take the running count: <b>+9</b>.', 'Look at the discard tray to see how many decks are left: about <b>2½</b>.', 'Divide: 9 ÷ 2.5 = 3.6. Always round down, so the true count is <b>+3</b>.'];
  return teachQ(el => { el.innerHTML = shell('Running count +9, 2½ decks left', `<div class="tile-row"><div class="big-tile orange"><small>Running count</small><strong>+9</strong></div><div class="big-tile teal"><small>Decks left</small><strong>2½</strong></div><div class="big-tile purple"><small>True count</small><strong>+3</strong></div></div>`, steps); Sound.play('reveal'); });
}

function betExample() {
  const steps = ['Find the true count: <b>+5</b>.', 'At +1 or lower, bet 1 unit. Above that, bet the true count minus 1.', '5 − 1 = <b>4 units</b>. At $25 a unit, that’s $100.'];
  return teachQ(el => { el.innerHTML = shell('True count +5: how much to bet?', `<div class="tile-row"><div class="big-tile purple"><small>True count</small><strong>+5</strong></div><div class="big-tile yellow"><small>Bet</small><strong>4 units</strong></div></div>`, steps); Sound.play('reveal'); });
}

function choiceExample(step) {
  return teachQ(el => {
    el.innerHTML = shell(esc(step.prompt), `${step.cards || step.dealer ? tableHTML({ dealer: step.dealer, cards: step.cards, holeCard: !!step.dealer }) : ''}<div class="choice-list">${step.options.map((o, i) => `<div class="choice-tile ${i === step.answer ? 'right' : 'dimmed'}"><span>${esc(o)}</span></div>`).join('')}</div>`,
      [...sentences(step.explain || '').slice(0, 2).map(esc), `So the answer is <b>${esc(step.options[step.answer])}</b>.`]);
    Sound.play('reveal');
  });
}

/** After each new idea in a lesson's queue, insert a worked example and mark the next question as the guided try. */
export function addWorkedExamples(queue) {
  const out = [];
  for (let i = 0; i < queue.length; i++) {
    out.push(queue[i]);
    if (!queue[i].teach || queue[i].worked) continue;
    if (queue[i + 1]?.teach) continue;                      // only after the last idea in a run
    const next = queue[i + 1]; if (!next) continue;
    const w = workedFor(next);
    if (!w) continue;
    w.step = queue[i].step; w.tries = 0;
    out.push(w); next.guided = true;
  }
  return out;
}
