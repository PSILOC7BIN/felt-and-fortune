// Economy UI: streak/Stars/Energy chips, the store, the Pro paywall, quests, leagues, and celebrations.
// The server is the source of truth (economy.py); this module only renders and calls it.
import { esc, $, $$, Sound, g, ace } from './ui.js';

let cache = null;
export const economyState = () => cache;
export const setEconomy = eco => { if (eco && 'stars' in eco) { cache = eco; applyLook(eco.look); paintChips(); } return cache; };

export async function loadEconomy(api, localDate) {
  try { setEconomy(await api('/api/me/economy?day=' + localDate())); } catch { /* signed out or offline */ }
  return cache;
}

export function applyLook(look) {
  if (!look) return;
  document.documentElement.dataset.felt = look.felt;
  document.documentElement.dataset.back = look.back;
}

const mins = s => s >= 3600 ? `${Math.floor(s / 3600)}h ${Math.round(s % 3600 / 60)}m` : `${Math.max(1, Math.round(s / 60))}m`;

// ---- chips --------------------------------------------------------------------------------------
export function chipsHTML(eco, streakOverride) {
  if (!eco) return '';
  const streak = streakOverride ?? eco.streak;
  const energy = eco.plan.pro
    ? `<a class="chip pro-chip" href="/store" title="Pro: unlimited Energy">${g('crown')}<b>Pro</b></a>`
    : `<a class="chip energy-chip ${eco.energy <= 5 ? 'low' : ''}" href="/store" title="Practice Energy${eco.energyNextIn ? `: +1 in ${mins(eco.energyNextIn)}` : ''}">${g('bolt')}<b data-energy>${eco.energy}</b><span class="sr">Energy</span></a>`;
  return `<div class="eco-chips">
    <span class="chip streak ${eco.streakToday ? 'lit' : ''}" title="Day streak${eco.freezes ? ` · ${eco.freezes} freeze${eco.freezes > 1 ? 's' : ''} ready` : ''}">${g('flame')}<b>${streak}</b>${eco.freezes ? `<i class="freeze-dot" aria-label="${eco.freezes} streak freezes">${g('snow')}${eco.freezes > 1 ? eco.freezes : ''}</i>` : ''}<span class="sr">day streak</span></span>
    <a class="chip stars-chip" href="/store" title="Stars">${g('star')}<b data-stars>${eco.stars}</b><span class="sr">Stars</span></a>
    ${energy}</div>`;
}
function paintChips() { $$('[data-eco-chips]').forEach(el => { el.innerHTML = chipsHTML(cache); }); }

// ---- sheets -------------------------------------------------------------------------------------
export function openSheet(html, { wide = false, onClose } = {}) {
  const host = document.createElement('div'); host.className = 'sheet-shade eco-shade';
  host.innerHTML = `<div class="sheet ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.append(host);
  const close = () => { host.remove(); document.removeEventListener('keydown', esc_); onClose?.(); };
  const esc_ = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', esc_);
  host.addEventListener('click', e => { if (e.target === host || e.target.closest('[data-close]')) close(); });
  setTimeout(() => host.querySelector('button, a')?.focus(), 30);
  return { host, close };
}

const PRO_PERKS = [
  ['cards', 'All of Card Counter and Advantage Pro', 'Hi‑Lo at a full table, true count, bet ramps, index plays, Kelly betting, and team play.'],
  ['bolt', 'Unlimited practice Energy', 'Drill any tool as long as you like.'],
  ['shield', 'Cancel any time', 'Pro stays on until the end of the period you paid for.'],
];

export function paywall(ctx, reason = '') {
  Sound.play('reveal');
  const { close } = openSheet(`<div class="paywall">${g('crown', 'paywall-crown')}<h2>Felt & Fortune Pro</h2>
    <p class="muted">${esc(reason || 'Go from playing smart to playing with an edge.')}</p>
    <ul class="perks">${PRO_PERKS.map(([ic, t, d]) => `<li><span class="tool-icon sm">${g(ic)}</span><span><strong>${t}</strong><small>${d}</small></span></li>`).join('')}</ul>
    <p class="muted small">Basic strategy, money management, and responsible-gambling lessons stay free forever.</p>
    <a class="button primary chunky" href="/store#plans" data-close>See plans</a><button type="button" class="ghost" data-close>Not now</button></div>`);
  return close;
}

export function outOfEnergy(ctx, eco, after) {
  Sound.play('wrong');
  const canRefill = eco && eco.stars >= 350;
  const { close } = openSheet(`<div class="paywall">${ace('oops', 'ace-md')}<h2>Out of Energy</h2>
    <p class="muted">Practice rounds use Energy. You get 1 back about every hour${eco?.energyNextIn ? `, the next in ${mins(eco.energyNextIn)}` : ''}. Lessons, checkpoints, and Weak Spots never cost Energy.</p>
    <div class="energy-meter big"><span style="width:${Math.round((eco?.energy || 0) / 25 * 100)}%"></span></div>
    <button type="button" class="primary chunky" id="oe-refill" ${canRefill ? '' : 'disabled'}>${g('star')} Refill for 350 Stars</button>
    <a class="button chunky pro-button" href="/store#plans" data-close>${g('crown')} Unlimited with Pro</a>
    <a class="button ghost" href="/learn" data-close>Do a lesson instead</a></div>`);
  $('#oe-refill')?.addEventListener('click', async () => {
    try { setEconomy(await ctx.api('/api/store/buy', 'POST', { item: 'refill' })); Sound.play('energy'); close(); ctx.toast('Energy refilled.'); after?.(); } catch (e) { ctx.toast(e.message); }
  });
}

/** Start a standalone practice round. Returns the round id, or null if the player is out of Energy. */
export async function startRound(ctx, tool) {
  try {
    const r = await ctx.api('/api/energy/start', 'POST', { tool });
    if (cache && r.energy != null) { cache.energy = r.energy; paintChips(); }
    return r.round;
  } catch (e) {
    await loadEconomy(ctx.api, ctx.localDate);
    if (/Energy/.test(e.message)) outOfEnergy(ctx, cache); else ctx.toast(e.message);
    return null;
  }
}

// ---- celebrations -------------------------------------------------------------------------------
export function confetti({ count = 120, colors = ['#34C759', '#0A84FF', '#FF9F0A', '#FF375F', '#BF5AF2', '#FFD60A'] } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas'); cv.className = 'confetti'; cv.setAttribute('aria-hidden', 'true');
  document.body.append(cv);
  const dpr = devicePixelRatio || 1, W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr, x = cv.getContext('2d');
  const bits = Array.from({ length: count }, () => ({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35, vx: (Math.random() - .5) * 18 * dpr, vy: (-Math.random() * 16 - 6) * dpr,
    r: (4 + Math.random() * 6) * dpr, c: colors[Math.random() * colors.length | 0], a: Math.random() * 6, va: (Math.random() - .5) * .4, shape: Math.random() < .3 ? 'suit' : 'rect' }));
  const suits = ['♠', '♥', '♦', '♣'];
  let t = 0;
  (function frame() {
    x.clearRect(0, 0, W, H); t++;
    for (const b of bits) {
      b.vy += .45 * dpr; b.vx *= .99; b.x += b.vx; b.y += b.vy; b.a += b.va;
      x.save(); x.translate(b.x, b.y); x.rotate(b.a); x.globalAlpha = Math.max(0, 1 - t / 150); x.fillStyle = b.c;
      if (b.shape === 'suit') { x.font = `${b.r * 3}px sans-serif`; x.fillText(suits[(b.r | 0) % 4], 0, 0); } else x.fillRect(-b.r, -b.r / 2, b.r * 2, b.r);
      x.restore();
    }
    if (t < 150) requestAnimationFrame(frame); else cv.remove();
  })();
}

export function countUp(el, to, { from = 0, ms = 900 } = {}) {
  if (!el) return;
  const t0 = performance.now();
  const step = now => { const k = Math.min(1, (now - t0) / ms); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

export function flyStars(fromEl, n = 6) {
  const target = $('.stars-chip') || null;
  if (!fromEl || !target || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span'); s.className = 'fly-star'; s.innerHTML = g('star');
    s.style.left = a.left + a.width / 2 + 'px'; s.style.top = a.top + a.height / 2 + 'px';
    document.body.append(s);
    s.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 0 }, { transform: `translate(${(Math.random() - .5) * 80}px, ${-40 - Math.random() * 40}px) scale(1.2)`, opacity: 1, offset: .35 },
      { transform: `translate(${b.left - a.left - a.width / 2 + b.width / 2}px, ${b.top - a.top - a.height / 2 + b.height / 2}px) scale(.5)`, opacity: .9 }],
      { duration: 800 + i * 70, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => { s.remove(); if (i === n - 1) { target.classList.add('bump'); setTimeout(() => target.classList.remove('bump'), 400); Sound.play('coin'); } };
  }
}

/** Show streak freezes used and milestones the server reported. */
export function celebrateEvents(ctx, events = []) {
  for (const e of events) {
    if (e.type === 'freeze-used') { Sound.play('freeze'); ctx.toast(`A Streak Freeze kept your streak alive (${e.days.length} day${e.days.length > 1 ? 's' : ''}).`); }
    if (e.type === 'milestone') {
      confetti(); Sound.play('levelup');
      openSheet(`<div class="milestone">${g('flame', 'milestone-flame')}<h2>${e.days}-day streak!</h2><p class="muted">Habits are built one day at a time.</p><p class="reward">${g('star')} +${e.stars} Stars${e.freeze ? ` · ${g('snow')} a free Streak Freeze` : ''}</p><button type="button" class="primary chunky" data-close>Keep going</button></div>`);
    }
  }
}

// ---- side cards ---------------------------------------------------------------------------------
export function questsCard(eco) {
  if (!eco) return '';
  return `<div class="side-card quests"><div class="side-head"><h3>Daily quests</h3><span class="muted small">Resets at midnight</span></div>
    ${eco.quests.map(q => `<div class="quest ${q.claimed ? 'claimed' : q.done ? 'ready' : ''}"><div class="quest-copy"><strong>${esc(q.text)}</strong><div class="quest-bar"><span style="width:${Math.round(q.progress / q.goal * 100)}%"></span></div><small>${q.progress}/${q.goal}</small></div>
      ${q.claimed ? `<span class="quest-done">${g('check')}</span>` : `<button type="button" class="small ${q.done ? 'primary' : ''}" data-quest="${q.id}" ${q.done ? '' : 'disabled'}>${g('star')} ${q.stars}</button>`}</div>`).join('')}</div>`;
}

export function wireQuests(ctx, root = document) {
  $$('[data-quest]', root).forEach(b => b.onclick = async () => {
    b.disabled = true;
    try { const r = await ctx.api('/api/quests/claim', 'POST', { quest: b.dataset.quest, day: ctx.localDate() }); flyStars(b, 5); setEconomy(r); const card = b.closest('.quests'); if (card) { card.outerHTML = questsCard(r); wireQuests(ctx, root); } }
    catch (e) { ctx.toast(e.message); b.disabled = false; }
  });
}

export function repairCard(eco) {
  if (!eco?.repair) return '';
  return `<div class="repair-card">${g('flame')}<div><strong>Your ${eco.repair.streak}-day streak broke</strong><span>You can repair it for free once a month.</span></div><button type="button" class="primary small" id="repair-streak">Repair</button></div>`;
}
export function wireRepair(ctx, rerender) {
  $('#repair-streak')?.addEventListener('click', async () => {
    try { setEconomy(await ctx.api('/api/streak/repair', 'POST', { day: ctx.localDate() })); Sound.play('levelup'); confetti({ count: 60 }); ctx.toast('Streak repaired!'); rerender?.(); } catch (e) { ctx.toast(e.message); }
  });
}

export const LEAGUE_COLORS = ['#B87333', '#A8B2BD', '#E0B100', '#2F6FED', '#D7263D', '#1FAA59', '#7DD3FC'];
export function leagueCard(lg) {
  if (!lg) return '';
  const me = lg.players.findIndex(p => p.me);
  const top = lg.players.slice(0, 5);
  const ends = Math.max(0, Math.ceil((new Date(lg.endsOn + 'T00:00:00') - new Date()) / 86400000));
  return `<div class="side-card league"><div class="side-head"><h3><span class="league-gem" style="--lc:${LEAGUE_COLORS[lg.tier]}">${g('gem')}</span>${esc(lg.name)} League</h3><span class="muted small">${ends} day${ends === 1 ? '' : 's'} left</span></div>
    <ol class="league-list">${top.map((p, i) => `<li class="${p.me ? 'me' : ''}"><span class="rank">${i + 1}</span><span class="who">${esc(p.username)}</span><b>${p.xp} XP</b></li>`).join('')}${me >= 5 ? `<li class="me"><span class="rank">${me + 1}</span><span class="who">${esc(lg.players[me].username)}</span><b>${lg.players[me].xp} XP</b></li>` : ''}</ol>
    <p class="muted small">Finish in the top fifth to move up a league. XP comes from accurate lessons and practice.</p></div>`;
}

// ---- store --------------------------------------------------------------------------------------
const LOOK_SWATCH = { emerald: '#0E6B3A', royal: '#1D3F8F', crimson: '#8E1B2B', midnight: '#151B3B', gold: '#8C6A12', classic: '#C62828', neon: '#7C3AED', aurora: '#0EA5A4', diamond: '#64748B' };

export async function storePage(ctx) {
  const { api, esc: _e } = ctx;
  const st = await api('/api/store?day=' + ctx.localDate()); setEconomy(st);
  const plan = st.plan, test = st.billingMode === 'test';
  const fmtDate = ts => new Date(ts * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const planCard = (id, p, best) => {
    const total = `$${p.price.toFixed(2)}`;
    const per = p.period ? `${total} per ${p.period}` : `${total} once`;
    const trial = p.trial ? `${p.trial}-day free trial, then ${per}.` : p.period ? `${per}, renews automatically.` : 'One payment. Pro forever.';
    return `<div class="plan-card ${best ? 'best' : ''}">${best ? '<span class="plan-flag">Best value</span>' : ''}<h3>${esc(p.name)}</h3><p class="plan-price"><b>${total}</b>${p.period ? `<span>/${p.period}</span>` : ''}</p>${p.perMonth ? `<p class="muted small">Just $${p.perMonth}/month</p>` : '<p class="muted small">&nbsp;</p>'}
      <p class="plan-terms">${trial}${p.period ? ' Cancel any time here in the Store; you keep Pro until the period ends.' : ''}</p>
      <button type="button" class="${best ? 'primary' : ''} chunky" data-plan="${id}" ${plan.pro ? 'disabled' : ''}>${p.trial ? 'Start free trial' : p.period ? 'Subscribe' : 'Buy lifetime'}</button></div>`;
  };
  const owned = new Set(st.owned);
  const items = Object.entries(st.shop);
  const shopItem = ([id, it]) => {
    const isLook = it.kind === 'felt' || it.kind === 'back';
    const have = owned.has(id), on = isLook && st.look[it.kind] === it.value;
    const action = isLook && have ? `<button type="button" class="small" data-equip="${it.kind}:${it.value}" ${on ? 'disabled' : ''}>${on ? 'Equipped' : 'Use'}</button>`
      : `<button type="button" class="small ${st.stars >= it.stars ? 'primary' : ''}" data-buy="${id}" ${st.stars >= it.stars ? '' : 'disabled'}>${g('star')} ${it.stars}</button>`;
    const art = it.kind === 'freeze' ? `<span class="shop-art freeze">${g('snow')}</span>` : it.kind === 'refill' ? `<span class="shop-art energy">${g('bolt')}</span>` : `<span class="shop-art ${it.kind}" style="--sw:${LOOK_SWATCH[it.value]}"></span>`;
    return `<div class="shop-item">${art}<div class="shop-copy"><strong>${esc(it.name)}</strong><small>${esc(it.text || (it.kind === 'felt' ? 'Table felt for every trainer.' : 'Card back for every trainer.'))}</small></div>${action}</div>`;
  };
  ctx.$('#page').innerHTML = `<div class="store">
    <header class="store-hero"><div><h1>Store</h1><p class="muted">Stars are earned by learning, never bought. Spend them on freezes, refills, and new looks.</p></div><div class="store-wallet"><span class="chip stars-chip">${g('star')}<b data-stars>${st.stars}</b> Stars</span><span class="chip">${g('snow')}<b>${st.freezes}/${st.freezeMax}</b> freezes</span>${plan.pro ? `<span class="chip pro-chip">${g('crown')}<b>Pro</b></span>` : `<span class="chip energy-chip">${g('bolt')}<b>${st.energy}/${st.energyMax}</b> Energy</span>`}</div></header>
    ${test ? '<p class="test-banner">Test mode: purchases are simulated and nothing is charged. Real billing uses the App Store, Google Play, or a secure web checkout.</p>' : ''}
    <section id="plans" class="store-section"><h2>${g('crown')} Felt & Fortune Pro</h2>
      ${plan.pro ? `<div class="plan-status"><strong>You have ${esc(st.plans[plan.plan]?.name || 'Pro')}</strong><span class="muted">${plan.trialEnds ? `Free trial ends ${fmtDate(plan.trialEnds)}. We’ll remind you 3 days before.` : plan.status === 'canceled' ? `Canceled. Pro stays on until ${fmtDate(plan.renews)}.` : plan.renews ? `Renews ${fmtDate(plan.renews)}.` : 'Lifetime access.'}</span>${plan.plan !== 'pro-lifetime' && plan.status !== 'canceled' ? '<button type="button" class="small" id="cancel-plan">Cancel subscription</button>' : ''}</div>`
        : `<ul class="perks inline">${PRO_PERKS.map(([ic, t]) => `<li>${g(ic)} ${t}</li>`).join('')}</ul><div class="plan-cards">${planCard('pro-monthly', st.plans['pro-monthly'])}${planCard('pro-annual', st.plans['pro-annual'], true)}${planCard('pro-lifetime', st.plans['pro-lifetime'])}</div>`}
      <p class="muted small">Free forever: Smart Player, Strategy Master, the first unit of every track, all seven practice tools with daily Energy, and responsible-gambling help. <button type="button" class="linklike" id="restore">Restore purchases</button></p></section>
    <section class="store-section"><h2>${g('star')} Power-ups</h2><div class="shop-grid">${items.filter(([, it]) => it.kind === 'freeze' || it.kind === 'refill').map(shopItem).join('')}</div></section>
    <section class="store-section"><h2>${g('cards')} Table looks</h2><div class="shop-grid">
      <div class="shop-item"><span class="shop-art felt" style="--sw:${LOOK_SWATCH.emerald}"></span><div class="shop-copy"><strong>Emerald Felt</strong><small>The classic table.</small></div><button type="button" class="small" data-equip="felt:emerald" ${st.look.felt === 'emerald' ? 'disabled' : ''}>${st.look.felt === 'emerald' ? 'Equipped' : 'Use'}</button></div>
      <div class="shop-item"><span class="shop-art back" style="--sw:${LOOK_SWATCH.classic}"></span><div class="shop-copy"><strong>Classic Card Back</strong><small>The original red back.</small></div><button type="button" class="small" data-equip="back:classic" ${st.look.back === 'classic' ? 'disabled' : ''}>${st.look.back === 'classic' ? 'Equipped' : 'Use'}</button></div>
      ${items.filter(([, it]) => it.kind === 'felt' || it.kind === 'back').map(shopItem).join('')}</div></section>
  </div>`;
  const redo = () => storePage(ctx);
  $$('[data-plan]').forEach(b => b.onclick = () => {
    const p = st.plans[b.dataset.plan];
    const { close } = openSheet(`<div class="confirm-buy">${g('crown', 'paywall-crown')}<h2>${esc(p.name)}</h2><p><b>$${p.price.toFixed(2)}${p.period ? ` per ${p.period}` : ' one time'}</b></p>
      <p class="muted">${p.trial ? `Free for ${p.trial} days. Then $${p.price.toFixed(2)} is charged every ${p.period} until you cancel. We’ll remind you 3 days before the trial ends. Cancel any time in the Store or your device’s subscription settings.` : p.period ? `$${p.price.toFixed(2)} is charged now and every ${p.period} until you cancel. Cancel any time; Pro stays on until the period ends.` : 'One payment, no renewal.'}</p>
      ${test ? '<p class="test-banner">Test mode: nothing will be charged.</p>' : ''}<button type="button" class="primary chunky" id="confirm-buy">${p.trial ? 'Start free trial' : 'Confirm purchase'}</button><button type="button" class="ghost" data-close>Cancel</button></div>`);
    $('#confirm-buy').onclick = async () => {
      try { setEconomy(await api('/api/billing/test-purchase', 'POST', { plan: b.dataset.plan })); close(); confetti(); Sound.play('levelup'); ctx.toast('Welcome to Pro!'); redo(); } catch (e) { ctx.toast(e.message); }
    };
  });
  $('#cancel-plan')?.addEventListener('click', () => {
    const { close } = openSheet(`<h2>Cancel Pro?</h2><p class="muted">${plan.trialEnds ? 'Your trial ends now and you won’t be charged.' : 'You keep Pro until the end of the period you paid for.'} Your Stars, streak, and progress stay.</p><button type="button" class="danger chunky" id="confirm-cancel">Cancel subscription</button><button type="button" class="primary" data-close>Keep Pro</button>`);
    $('#confirm-cancel').onclick = async () => { try { setEconomy(await api('/api/billing/cancel', 'POST', {})); close(); ctx.toast('Subscription canceled.'); redo(); } catch (e) { ctx.toast(e.message); } };
  });
  $('#restore').onclick = async () => { await loadEconomy(api, ctx.localDate); ctx.toast(cache?.plan.pro ? 'Pro is active on this account.' : 'No purchases found for this account.'); };
  $$('[data-buy]').forEach(b => b.onclick = async () => {
    b.disabled = true;
    try { const r = await api('/api/store/buy', 'POST', { item: b.dataset.buy }); setEconomy(r); Sound.play('coin'); ctx.toast('Got it!'); redo(); } catch (e) { ctx.toast(e.message); b.disabled = false; }
  });
  $$('[data-equip]').forEach(b => b.onclick = async () => {
    const [kind, value] = b.dataset.equip.split(':');
    try { setEconomy(await api('/api/store/equip', 'POST', { kind, value })); Sound.play('select'); redo(); } catch (e) { ctx.toast(e.message); }
  });
}
