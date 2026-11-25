// Weekly report: this week against last, for Pro (free members see the headline and a preview).
import { esc, $, g } from './ui.js';
import { paywall } from './economy.js';

const delta = (a, b, lowerIsBetter = false) => {
  if (a == null || b == null) return '';
  const d = a - b; if (!d) return '<small class="same">same as last week</small>';
  const good = lowerIsBetter ? d < 0 : d > 0;
  return `<small class="${good ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'} ${Math.abs(Math.round(d * 100) / 100)} vs last week</small>`;
};

export async function reportPage(ctx) {
  const { api, localDate } = ctx;
  const r = await api('/api/report?day=' + localDate());
  const t = r.this, l = r.last;
  const tile = (cls, label, v, sub) => `<div class="stat-tile ${cls}"><small>${label}</small><strong>${v}</strong>${sub || ''}</div>`;
  const ends = new Date(r.week + 'T00:00'); ends.setDate(ends.getDate() + 6);
  $('#page').innerHTML = `<a class="back-link" href="/practice">${g('back')} Practice</a>
    <header class="page-hero"><div><h1>Your week</h1><p>${new Date(r.week + 'T00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} to ${ends.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, compared with the week before. ${r.pro ? 'Pro members also get this by email every Monday.' : ''}</p></div></header>
    <div class="plan-grid four">${tile('yellow', 'XP', t.xp, delta(t.xp, l.xp))}${tile('orange', 'Active days', `${t.activeDays}/7`, delta(t.activeDays, l.activeDays))}${tile('red', 'Streak', `${g('flame')} ${r.streak}`)}${tile('blue', 'Lessons', t.lessons, delta(t.lessons, l.lessons))}</div>
    <div class="report-more${r.pro ? '' : ' locked'}">
      <h2 class="hub-group">Practice</h2>
      <div class="plan-grid four">${tile('green', 'Practice rounds', t.rounds, delta(t.rounds, l.rounds))}${tile('teal', 'Accuracy', t.accuracy == null ? '—' : t.accuracy + '%', delta(t.accuracy, l.accuracy))}${tile('purple', 'Minutes practiced', t.minutes, delta(t.minutes, l.minutes))}${tile('pink', 'Daily Hands', `${t.dailyRight}/${t.dailyHands}`, '<small>right / played</small>')}</div>
      <h2 class="hub-group">Ratings and records</h2>
      <div class="plan-grid four">${tile('blue', 'Overall rating', r.rating[1] ?? '—', delta(r.rating[1], r.rating[0]))}${tile('purple', 'Skill Score', r.skillScore[1] == null ? '—' : r.skillScore[1].toFixed(2) + '%', delta(r.skillScore[1], r.skillScore[0], true))}${tile('orange', 'Rush best', t.rushBest, delta(t.rushBest, l.rushBest))}${tile('purple', 'Count Storm best', t.stormBest, delta(t.stormBest, l.stormBest))}</div>
      ${r.weakest.length ? `<div class="gate-banner">${g('target')}<span><b>Work on next:</b> ${r.weakest.map(s => `${esc(s.name)} (${s.rating})`).join(' and ')}. <a href="/practice/workout">Start a Daily Workout</a></span></div>` : ''}
    </div>
    ${r.pro ? '' : `<button type="button" class="pro-banner" id="rep-pro">${g('crown')}<span><strong>See your whole week with Pro</strong><small>Practice accuracy, ratings, Skill Score, and records against last week, plus a Monday email.</small></span>${g('next')}</button>`}`;
  $('#rep-pro')?.addEventListener('click', () => paywall(ctx, 'Pro shows your full weekly report and emails it every Monday.'));
}
