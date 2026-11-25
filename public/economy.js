// Economy UI: streak/Stars/Energy chips, the store, the Pro paywall, quests, leagues, and celebrations.
// The server is the source of truth (economy.py); this module only renders and calls it.
import { esc, $, $$, Sound, g, ace } from './ui.js';
import { react } from './reactions.js';

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
  document.documentElement.dataset.coach = look.coach || 'none';
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
    <a class="chip stars-chip" href="/store" title="Chips">${g('chip')}<b data-stars>${eco.stars}</b><span class="sr">chips</span></a>
    ${energy}</div>`;
}
function paintChips() {
  $$('[data-eco-chips]').forEach(el => { el.innerHTML = chipsHTML(cache); });
  const n = cache?.questsReady || 0;
  $$('.rail-link[data-tab="quests"]').forEach(el => { el.dataset.count = n; el.classList.toggle('has-count', n > 0); });
}

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
  Sound.play('reveal'); window.ffTrack?.('paywall_view', { reason: String(reason).slice(0, 80) });
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
    <button type="button" class="primary chunky" id="oe-refill" ${canRefill ? '' : 'disabled'}>${g('chip')} Refill for 350 chips</button>
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
    const s = document.createElement('span'); s.className = 'fly-star'; s.innerHTML = g('chip');
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
      openSheet(`<div class="milestone">${g('flame', 'milestone-flame')}<h2>${e.days}-day streak!</h2><p class="muted">Habits are built one day at a time.</p><p class="reward">${g('chip')} +${e.stars} chips${e.freeze ? ` · ${g('snow')} a free Streak Freeze` : ''}</p><button type="button" class="primary chunky" data-close>Keep going</button><button type="button" class="ghost" id="share-milestone">Share it</button></div>`);
      document.getElementById('share-milestone')?.addEventListener('click', async () => {
        const [{ shareProgress }, me, sk, path] = await Promise.all([import('./share.js'), ctx.api('/api/me'), ctx.api('/api/skills').catch(() => null), ctx.api('/api/path').catch(() => null)]);
        shareProgress(ctx, { username: me.user?.username || '', streak: e.days, rating: sk?.overall ?? null, tier: sk?.tier, lessons: path?.stats?.done || 0, track: path?.plan?.trackName || '' });
      });
    }
  }
}

// ---- side cards ---------------------------------------------------------------------------------
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
    <p class="muted small">Finish in the top fifth to move up a league. XP comes from accurate lessons and practice.</p><a class="small-link" href="/community/friends">${g('users')} Race your friends this week</a></div>`;
}

// ---- store --------------------------------------------------------------------------------------
const RARITY_LABEL = { common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
const TABS = [['featured', 'star', 'Featured'], ['back', 'cards', 'Card backs'], ['felt', 'stack', 'Table mats'], ['coach', 'person', 'Coach'], ['sets', 'gift', 'Sets'], ['powerups', 'bolt', 'Power-ups'], ['pro', 'crown', 'Pro']];
const DEFAULT_ITEMS = { back: ['classic', 'Classic Red', 'The original back.'], felt: ['emerald', 'Emerald', 'The classic table.'], coach: ['none', 'Just Ace', 'No accessories.'] };

export function artHTML(kind, value) {
  if (kind === 'back') return `<span class="back-art bk-${esc(value)}"></span>`;
  if (kind === 'felt') return `<span class="mat-art mt-${esc(value)}"></span>`;
  if (kind === 'coach') return `<span class="coach-art">${ace('happy', '', value)}</span>`;
  if (kind === 'freeze') return `<span class="shop-art freeze">${g('snow')}</span>`;
  return `<span class="shop-art energy">${g('bolt')}</span>`;
}

function previewHTML(look) {
  return `<div class="try-table mt-${esc(look.felt)}"><div class="try-cards"><span class="pc try-face"><b>A</b>♠</span><span class="pc back bk-${esc(look.back)}"></span></div><div class="try-coach">${ace('happy', 'ace-md', look.coach)}</div></div>`;
}

export async function storePage(ctx, tab = location.hash.slice(1) || 'featured') {
  const { api } = ctx;
  const st = await api('/api/store?day=' + ctx.localDate()); setEconomy(st); window.ffTrack?.('store_view', { tab });
  const plan = st.plan, test = st.billingMode === 'test', owned = new Set(st.owned);
  if (!TABS.some(t => t[0] === tab)) tab = 'featured';
  let preview = { ...st.look }, previewing = null;
  const fmtDate = ts => new Date(ts * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const day = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const equipped = (kind, value) => st.look[kind] === value;
  const has = (id, it) => owned.has(id) || (it.pro && plan.pro);

  const itemCard = (id, it) => {
    const mine = has(id, it), on = mine && equipped(it.kind, it.value);
    const status = on ? `<span class="own-tag on">${g('check')} Equipped</span>` : mine ? '<span class="own-tag">Owned</span>'
      : it.event ? `<span class="own-tag event">${g('trophy')} Event reward</span>` : it.pro ? `<span class="own-tag pro">${g('crown')} Pro</span>`
      : `<span class="price ${st.stars >= it.stars ? '' : 'short'}">${g('chip')} ${it.stars}</span>`;
    const short = !mine && !it.event && !it.pro && st.stars < it.stars ? `<small class="to-go">${it.stars - st.stars} more chips</small>` : '';
    return `<button type="button" class="item-card r-${it.rarity} ${on ? 'equipped' : ''}" data-item="${id}">${artHTML(it.kind, it.value)}<span class="item-name">${esc(it.name)}</span><span class="rarity">${RARITY_LABEL[it.rarity]}</span>${status}${short}</button>`;
  };
  const defaultCard = kind => {
    const [v, name, text] = DEFAULT_ITEMS[kind], on = equipped(kind, v);
    return `<button type="button" class="item-card r-starter ${on ? 'equipped' : ''}" data-default="${kind}">${artHTML(kind, v)}<span class="item-name">${name}</span><span class="rarity">Starter</span>${on ? `<span class="own-tag on">${g('check')} Equipped</span>` : '<span class="own-tag">Owned</span>'}</button>`;
  };
  const kindGrid = kind => {
    const items = Object.entries(st.catalog).filter(([, it]) => it.kind === kind && !it.event);
    const order = ['common', 'rare', 'epic', 'legendary'];
    items.sort((a, b) => (a[1].pro - b[1].pro) || order.indexOf(a[1].rarity) - order.indexOf(b[1].rarity));
    const events = Object.entries(st.catalog).filter(([, it]) => it.kind === kind && it.event);
    const have = items.filter(([id, it]) => has(id, it)).length + 1;
    return `<p class="collection-count">${g('check')} You own ${have + events.filter(([id]) => owned.has(id)).length} of ${items.length + events.length + 1}</p><div class="item-grid">${defaultCard(kind)}${items.map(([id, it]) => itemCard(id, it)).join('')}</div>
      ${events.length ? `<h3 class="sub-head">${g('trophy')} Event card backs <small>Earn one by finishing that month’s Quests event. Never sold.</small></h3><div class="item-grid">${events.map(([id, it]) => itemCard(id, it)).join('')}</div>` : ''}`;
  };
  const setCard = s => {
    const items = s.items.map(id => [id, st.catalog[id]]);
    const done = s.owned === s.total;
    return `<div class="set-card"><div class="set-arts">${items.map(([, it]) => artHTML(it.kind, it.value)).join('')}</div><div class="set-copy"><h3>${esc(s.name)}</h3>
      <div class="set-bar"><span style="width:${Math.round(s.owned / s.total * 100)}%"></span></div><small>${s.owned} of ${s.total} collected · Complete it for ${g('chip')} ${s.bonus} bonus chips</small></div>
      ${done ? `<span class="own-tag on">${g('check')} Complete</span>` : `<button type="button" class="primary" data-set="${s.id}" ${st.stars >= s.price ? '' : 'disabled'}>${g('chip')} ${s.price}<small>Get the rest · 20% off</small></button>`}</div>`;
  };
  const planCard = (id, p, best) => {
    const total = `$${p.price.toFixed(2)}`, per = p.period ? `${total} per ${p.period}` : `${total} once`;
    const terms = p.trial ? `${p.trial}-day free trial, then ${per}.` : p.period ? `${per}, renews automatically.` : 'One payment. Pro forever.';
    return `<div class="plan-card ${best ? 'best' : ''}">${best ? '<span class="plan-flag">Best value</span>' : ''}<h3>${esc(p.name)}</h3><p class="plan-price"><b>${total}</b>${p.period ? `<span>/${p.period}</span>` : ''}</p>${p.perMonth ? `<p class="muted small">Just $${p.perMonth}/month</p>` : '<p class="muted small">&nbsp;</p>'}<p class="plan-terms">${terms}${p.period ? ' Cancel any time here in the Store; you keep Pro until the period ends.' : ''}</p><button type="button" class="${best ? 'primary' : ''} chunky" data-plan="${id}" ${plan.pro ? 'disabled' : ''}>${p.trial ? 'Start free trial' : p.period ? 'Subscribe' : 'Buy lifetime'}</button></div>`;
  };
  const panes = {
    featured: () => {
      const vegas = st.sets.find(s => s.owned < s.total) || st.sets[0];
      return `<div class="featured-hero">${setCard(vegas)}</div><h3 class="sub-head">${g('chip')} This week’s picks <small>New picks ${day(st.featured.ends)}</small></h3><div class="item-grid">${st.featured.items.map(id => itemCard(id, st.catalog[id])).join('')}</div>
        ${plan.pro ? '' : `<button type="button" class="pro-banner" data-tab-go="pro">${g('crown')}<span><strong>Pro Gold collection</strong><small>A black-and-gold back, mat, and coach style, free with Pro.</small></span>${g('next')}</button>`}`;
    },
    back: () => kindGrid('back'), felt: () => kindGrid('felt'), coach: () => kindGrid('coach'),
    sets: () => `<p class="muted">Sets bundle a card back, a table mat, and a coach style. Buying the rest of a set costs 20% less than the pieces, and finishing one pays a one-time bonus.</p><div class="set-list">${st.sets.map(setCard).join('')}</div>`,
    powerups: () => `<div class="shop-grid">${Object.entries(st.powerups).map(([id, it]) => `<div class="shop-item">${artHTML(it.kind)}<div class="shop-copy"><strong>${esc(it.name)}</strong><small>${esc(it.text)}</small></div><button type="button" class="small ${st.stars >= it.stars ? 'primary' : ''}" data-power="${id}" ${st.stars >= it.stars ? '' : 'disabled'}>${g('chip')} ${it.stars}</button></div>`).join('')}</div>`,
    pro: () => `${plan.pro ? `<div class="plan-status"><strong>You have ${esc(st.plans[plan.plan]?.name || 'Pro')}</strong><span class="muted">${plan.trialEnds ? `Free trial ends ${fmtDate(plan.trialEnds)}. We’ll remind you 3 days before.` : plan.status === 'canceled' ? `Canceled. Pro stays on until ${fmtDate(plan.renews)}.` : plan.renews ? `Renews ${fmtDate(plan.renews)}.` : 'Lifetime access.'}</span>${plan.plan !== 'pro-lifetime' && plan.status !== 'canceled' ? '<button type="button" class="small" id="cancel-plan">Cancel subscription</button>' : ''}</div>`
      : `<ul class="perks inline">${PRO_PERKS.map(([ic, t]) => `<li>${g(ic)} ${t}</li>`).join('')}<li>${g('gift')} Pro Gold collection</li><li>${g('target')} 2 quest swaps a day</li></ul><div class="plan-cards">${planCard('pro-monthly', st.plans['pro-monthly'])}${planCard('pro-annual', st.plans['pro-annual'], true)}${planCard('pro-lifetime', st.plans['pro-lifetime'])}</div>`}
      <h3 class="sub-head">${g('crown')} Pro Gold collection <small>${plan.pro ? 'Claim each piece; it stays yours even if Pro ends.' : 'Included with Pro.'}</small></h3><div class="item-grid">${Object.entries(st.catalog).filter(([, it]) => it.pro).map(([id, it]) => itemCard(id, it)).join('')}</div>
      <p class="muted small">Free forever: Smart Player, Strategy Master, the first unit of every track, all seven practice tools with daily Energy, quests, and responsible-gambling help. <button type="button" class="linklike" id="restore">Restore purchases</button> · <a href="/terms">Billing, cancellation, and refund terms</a></p>`,
  };

  ctx.$('#page').innerHTML = `<div class="store2">
    <header class="store-top"><div><h1>Store</h1><p class="muted">Earn chips by learning, or pick up a pack. Chips buy looks and power-ups only.</p></div><div class="store-wallet sticky-wallet"><span class="chip stars-chip">${g('chip')}<b data-stars>${st.stars}</b><span>chips</span></span><span class="chip">${g('snow')}<b>${st.freezes}/${st.freezeMax}</b></span>${plan.pro ? `<span class="chip pro-chip">${g('crown')}<b>Pro</b></span>` : `<span class="chip energy-chip">${g('bolt')}<b>${st.energy}</b></span>`}<a class="chip earn-chip" href="/quests">${g('target')} Earn chips</a></div></header>
    ${test ? '<p class="test-banner">Test mode: purchases are simulated and nothing is charged.</p>' : ''}
    <div class="store-body"><div class="store-main"><nav class="store-tabs" role="tablist" aria-label="Store sections">${TABS.map(([k, ic, label]) => `<button type="button" role="tab" aria-selected="${k === tab}" data-tab="${k}">${g(ic)}<span>${label}</span></button>`).join('')}</nav>
      <section class="store-pane" role="tabpanel">${panes[tab]()}</section></div>
      <aside class="store-preview" aria-label="Preview"><h3>Your table</h3><div id="preview">${previewHTML(preview)}</div><p class="muted small" id="preview-note">Tap any item to try it on.</p><div id="preview-actions"></div></aside></div></div>`;

  const redo = (t = tab) => { history.replaceState(null, '', '/store#' + t); storePage(ctx, t); };
  $$('[data-tab]').forEach(b => b.onclick = () => { Sound.play('tap'); redo(b.dataset.tab); });
  $$('[data-tab-go]').forEach(b => b.onclick = () => redo(b.dataset.tabGo));

  const paintPreview = () => { $('#preview').innerHTML = previewHTML(preview); };
  const tryOn = (kind, value, label, actionHTML) => {
    preview = { ...st.look, [kind]: value }; paintPreview(); Sound.play('pop');
    $('#preview-note').textContent = `Previewing ${label}.`;
    $('#preview-actions').innerHTML = actionHTML;
    $('#preview').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };
  const confirmSpend = (title, stars, art, onYes) => {
    const { close } = openSheet(`<div class="confirm-buy">${art}<h2>${esc(title)}</h2><p class="reward">${g('chip')} ${stars} chips</p><p class="muted">You have ${st.stars} chips. You’ll have ${st.stars - stars} left.</p><button type="button" class="primary chunky" id="yes-spend">Spend ${stars} chips</button><button type="button" class="ghost" data-close>Cancel</button></div>`);
    $('#yes-spend').onclick = async () => { $('#yes-spend').disabled = true; try { await onYes(); close(); } catch (e) { ctx.toast(e.message); $('#yes-spend').disabled = false; } };
  };
  const equip = async (kind, value) => { setEconomy(await api('/api/store/equip', 'POST', { kind, value })); Sound.play('select'); ctx.toast('Equipped.'); redo(); };

  $$('[data-item]').forEach(b => b.onclick = () => {
    const id = b.dataset.item, it = st.catalog[id], mine = has(id, it);
    const ownedAlready = owned.has(id);
    let action;
    if (mine && ownedAlready) action = equipped(it.kind, it.value) ? '<span class="own-tag on">Equipped</span>' : `<button type="button" class="primary chunky" id="pv-equip">Equip</button>`;
    else if (it.pro) action = plan.pro ? `<button type="button" class="primary chunky" id="pv-claim">${g('crown')} Claim free</button>` : `<button type="button" class="chunky pro-button" data-tab-go="pro">${g('crown')} Get Pro</button>`;
    else if (it.event) action = '<p class="muted small">Finish a monthly Quests event to earn event backs.</p><a class="button" href="/quests">See this month’s event</a>';
    else action = `<button type="button" class="primary chunky" id="pv-buy" ${st.stars >= it.stars ? '' : 'disabled'}>${g('chip')} Buy for ${it.stars}</button>${st.stars < it.stars ? `<a class="button ghost" href="/quests">Earn ${it.stars - st.stars} more chips</a>` : ''}`;
    tryOn(it.kind, it.value, it.name, `<p class="pv-name"><strong>${esc(it.name)}</strong><span class="rarity r-${it.rarity}">${RARITY_LABEL[it.rarity]}</span></p><p class="muted small">${esc(it.text || '')}</p>${action}`);
    $('#pv-equip')?.addEventListener('click', () => equip(it.kind, it.value));
    $('#pv-claim')?.addEventListener('click', async () => { try { setEconomy(await api('/api/store/buy', 'POST', { item: id })); Sound.play('unlock'); confetti({ count: 60 }); redo(); } catch (e) { ctx.toast(e.message); } });
    $('#pv-buy')?.addEventListener('click', () => confirmSpend(it.name, it.stars, artHTML(it.kind, it.value), async () => {
      setEconomy(await api('/api/store/buy', 'POST', { item: id })); Sound.play('unlock'); confetti({ count: 70 }); ctx.toast(`${it.name} unlocked and equipped!`); redo();
    }));
    $$('#preview-actions [data-tab-go]').forEach(x => x.onclick = () => redo(x.dataset.tabGo));
  });
  $$('[data-default]').forEach(b => b.onclick = () => {
    const kind = b.dataset.default, [v, name] = DEFAULT_ITEMS[kind];
    tryOn(kind, v, name, equipped(kind, v) ? '<span class="own-tag on">Equipped</span>' : '<button type="button" class="primary chunky" id="pv-equip">Equip</button>');
    $('#pv-equip')?.addEventListener('click', () => equip(kind, v));
  });
  $$('[data-set]').forEach(b => b.onclick = () => {
    const s = st.sets.find(x => x.id === b.dataset.set);
    confirmSpend(`${s.name} set`, s.price, `<div class="set-arts">${s.items.map(id => artHTML(st.catalog[id].kind, st.catalog[id].value)).join('')}</div>`, async () => {
      setEconomy(await api('/api/store/buy-set', 'POST', { set: s.id })); Sound.play('levelup'); confetti(); ctx.toast(`${s.name} complete! +${s.bonus} bonus chips`); redo();
    });
  });
  $$('[data-power]').forEach(b => b.onclick = () => {
    const it = st.powerups[b.dataset.power];
    confirmSpend(it.name, it.stars, artHTML(it.kind), async () => { setEconomy(await api('/api/store/buy', 'POST', { item: b.dataset.power })); Sound.play(it.kind === 'freeze' ? 'freeze' : 'energy'); redo(); });
  });
  $$('[data-plan]').forEach(b => b.onclick = () => {
    const p = st.plans[b.dataset.plan];
    const { close } = openSheet(`<div class="confirm-buy">${g('crown', 'paywall-crown')}<h2>${esc(p.name)}</h2><p><b>$${p.price.toFixed(2)}${p.period ? ` per ${p.period}` : ' one time'}</b></p>
      <p class="muted">${p.trial ? `Free for ${p.trial} days. Then $${p.price.toFixed(2)} is charged every ${p.period} until you cancel. We’ll remind you 3 days before the trial ends. Cancel any time in the Store or your device’s subscription settings.` : p.period ? `$${p.price.toFixed(2)} is charged now and every ${p.period} until you cancel. Cancel any time; Pro stays on until the period ends.` : 'One payment, no renewal.'}</p>
      ${test ? '<p class="test-banner">Test mode: nothing will be charged.</p>' : ''}<button type="button" class="primary chunky" id="confirm-buy">${p.trial ? 'Start free trial' : 'Confirm purchase'}</button><button type="button" class="ghost" data-close>Cancel</button></div>`);
    $('#confirm-buy').onclick = async () => { try { setEconomy(await api('/api/billing/test-purchase', 'POST', { plan: b.dataset.plan })); close(); confetti(); Sound.play('levelup'); ctx.toast('Welcome to Pro!'); redo('pro'); } catch (e) { ctx.toast(e.message); } };
  });
  $('#cancel-plan')?.addEventListener('click', () => {
    const { close } = openSheet(`<h2>Cancel Pro?</h2><p class="muted">${plan.trialEnds ? 'Your trial ends now and you won’t be charged.' : 'You keep Pro until the end of the period you paid for.'} Your chips, streak, progress, and claimed Pro Gold items stay.</p><button type="button" class="danger chunky" id="confirm-cancel">Cancel subscription</button><button type="button" class="primary" data-close>Keep Pro</button>`);
    $('#confirm-cancel').onclick = async () => { try { setEconomy(await api('/api/billing/cancel', 'POST', {})); close(); ctx.toast('Subscription canceled.'); redo('pro'); } catch (e) { ctx.toast(e.message); } };
  });
  $('#restore')?.addEventListener('click', async () => { await loadEconomy(api, ctx.localDate); ctx.toast(cache?.plan.pro ? 'Pro is active on this account.' : 'No purchases found for this account.'); });
}

// ---- quests -------------------------------------------------------------------------------------
const TIER_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const until = iso => { const ms = new Date(iso + 'T00:00:00') - new Date(); const d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000); return d > 0 ? `${d}d ${h}h` : `${Math.max(1, h)}h`; };

export function questsCard(eco) {
  if (!eco) return '';
  const n = eco.questsReady || 0;
  return `<a class="side-card quest-link ${n ? 'ready' : ''}" href="/quests"><span class="tool-icon sm">${g('target')}</span><span><strong>Quests</strong><small>${n ? `${n} reward${n > 1 ? 's' : ''} ready to claim` : 'Daily and weekly goals for chips'}</small></span>${n ? `<b class="q-badge">${n}</b>` : g('next')}</a>`;
}
export function wireQuests() {}

export async function questsPage(ctx) {
  const { api } = ctx;
  const [b] = await Promise.all([api('/api/quests?day=' + ctx.localDate()), loadEconomy(api, ctx.localDate)]);
  const quest = q => `<div class="quest-row t-${q.tier || 'weekly'} ${q.claimed ? 'claimed' : q.done ? 'ready' : ''}">
      <span class="quest-tier">${q.tier ? TIER_LABEL[q.tier] : 'Weekly'}</span>
      <div class="quest-copy"><strong>${esc(q.text)}</strong><div class="quest-bar"><span style="width:${Math.round(q.progress / q.goal * 100)}%"></span></div><small>${q.progress} / ${q.goal}</small></div>
      ${q.claimed ? `<span class="quest-done">${g('check')}</span>` : q.done ? `<button type="button" class="primary claim" data-claim="${q.period[0]}:${q.id}">${g('chip')} ${q.stars}</button>` : `<span class="quest-reward">${g('chip')} ${q.stars}</span>`}
      ${q.tier && !q.done && b.rerollsUsed < b.rerollsAllowed ? `<button type="button" class="icon-btn swap" data-reroll="${['easy', 'medium', 'hard'].indexOf(q.tier)}" aria-label="Swap this quest" title="Swap this quest (${b.rerollsAllowed - b.rerollsUsed} left today)">${g('rotr')}</button>` : ''}</div>`;
  const ev = b.event, all = b.allDaily;
  const evPct = Math.round(ev.progress / ev.goal * 100);
  ctx.$('#page').innerHTML = `<div class="quests-page">
    <header class="page-hero"><div><h1>Quests</h1><p class="muted">Quests reward careful practice, not just time spent. Finish them for chips, freezes, and event rewards.</p></div><div data-eco-chips>${chipsHTML(cache)}</div></header>
    <section class="event-banner">
      <div class="event-art">${artHTML('back', ev.reward.replace('back-', ''))}${ev.earned ? `<span class="event-badge">${g('check')}</span>` : ''}</div>
      <div class="event-copy"><small>Monthly event · ${ev.daysLeft} day${ev.daysLeft === 1 ? '' : 's'} left</small><h2>${esc(ev.name)}</h2><p>${ev.earned ? `You earned the <b>${esc(ev.rewardName)}</b> card back and this month’s badge!` : `Finish ${ev.goal} quests this month to earn the <b>${esc(ev.rewardName)}</b> card back and a badge. Event items are never sold.`}</p>
        <div class="event-bar"><span style="width:${evPct}%"></span></div><small>${ev.progress} / ${ev.goal} quests</small></div>
    </section>
    <div class="quest-cols">
      <section class="side-card quest-panel"><div class="side-head"><h3>${g('flame')} Daily quests</h3><span class="muted small">New in ${until(new Date(Date.now() + 864e5).toISOString().slice(0, 10))}</span></div>
        ${b.daily.map(quest).join('')}
        <div class="quest-row bonus ${all.claimed ? 'claimed' : all.ready ? 'ready' : ''}"><span class="quest-tier">Bonus</span><div class="quest-copy"><strong>Finish all 3 daily quests</strong><div class="quest-bar"><span style="width:${Math.round(b.daily.filter(q => q.done).length / 3 * 100)}%"></span></div><small>${b.daily.filter(q => q.done).length} / 3</small></div>${all.claimed ? `<span class="quest-done">${g('check')}</span>` : all.ready ? `<button type="button" class="primary claim" data-claim="all-daily">${g('chip')} ${all.stars}</button>` : `<span class="quest-reward">${g('chip')} ${all.stars}</span>`}</div>
        <p class="muted small">${b.rerollsAllowed - b.rerollsUsed > 0 ? `You can swap ${b.rerollsAllowed - b.rerollsUsed} unfinished quest${b.rerollsAllowed - b.rerollsUsed > 1 ? 's' : ''} today.` : 'Quest swaps are used up for today.'}</p></section>
      <section class="side-card quest-panel"><div class="side-head"><h3>${g('chart')} Weekly</h3><span class="muted small">Ends in ${until(b.weekEnds)}</span></div>
        ${b.weekly.map(quest).join('')}
        <h4 class="track-title">Daily quests finished this week: ${b.dailiesThisWeek}</h4>
        <div class="week-track"><div class="week-track-bar"><span style="width:${Math.min(100, Math.round(b.dailiesThisWeek / 15 * 100))}%"></span></div>
          ${b.track.map(t => `<div class="milestone-node ${t.claimed ? 'claimed' : t.reached ? 'ready' : ''}" style="left:${t.at / 15 * 100}%"><span class="m-at">${t.at}</span>${t.claimed ? `<span class="m-reward">${g('check')}</span>` : t.reached ? `<button type="button" class="primary claim small" data-claim="track-${t.at}">${g('gift')}</button>` : `<span class="m-reward">${g('gift')}</span>`}<small>${g('chip')}${t.reward.stars}${t.reward.freeze ? ` + ${g('snow')}` : ''}${t.reward.energy ? ` + ${g('bolt')}${t.reward.energy}` : ''}</small></div>`).join('')}</div></section>
    </div>
    ${b.badges.length ? `<section class="side-card"><h3>${g('trophy')} Badges</h3><div class="badge-shelf">${b.badges.map(x => `<span class="badge-chip" title="Earned ${esc(x.earned)}">${g(x.badge.startsWith('set-') ? 'gift' : 'trophy')}${esc(x.badge.startsWith('set-') ? x.badge.slice(4).replace(/^./, c => c.toUpperCase()) + ' set' : new Date(x.badge.slice(6) + '-15').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + ' event')}</span>`).join('')}</div></section>` : ''}
  </div>`;
  $$('[data-claim]').forEach(btn => btn.onclick = async () => {
    btn.disabled = true;
    try {
      const r = await api('/api/quests/claim', 'POST', { quest: btn.dataset.claim, day: ctx.localDate() });
      setEconomy(r); flyStars(btn, Math.min(8, 3 + Math.round(r.reward.stars / 20))); Sound.play('coin');
      if (r.reward.freeze) setTimeout(() => Sound.play('freeze'), 500);
      setTimeout(() => questsPage(ctx), 1000);
    } catch (e) { ctx.toast(e.message); btn.disabled = false; }
  });
  $$('[data-reroll]').forEach(btn => btn.onclick = async () => {
    try { await api('/api/quests/reroll', 'POST', { slot: Number(btn.dataset.reroll), day: ctx.localDate() }); Sound.play('whoosh'); questsPage(ctx); } catch (e) { ctx.toast(e.message); }
  });
  if (ev.earned && !localStorage.getItem('ff-event-seen-' + ev.month)) { localStorage.setItem('ff-event-seen-' + ev.month, '1'); confetti(); Sound.play('levelup'); }
}


// ---- live Energy meter (lessons and practice) --------------------------------------------------------
// Mirrors the server's rule: 1 Energy per answer, +2 for every 3 correct in a row. Pro is unlimited.
export function energyMeter(host) {
  const eco = cache, pro = !!eco?.plan?.pro, max = eco?.energyMax || 25;
  let e = pro ? null : (eco?.energy ?? max), run = 0;
  const paint = () => { if (!host) return; host.innerHTML = pro ? `<span class="chip pro-chip energy-live" title="Pro: unlimited Energy">${g('crown')}<b>∞</b></span>` : `<span class="chip energy-live ${e <= 3 ? 'low' : ''}" title="Energy">${g('bolt')}<b>${e}</b></span>`; };
  const bonus = () => {
    const pill = host?.querySelector('.energy-live'); if (!pill) return;
    const r = pill.getBoundingClientRect(), f = document.createElement('span');
    f.className = 'energy-float'; f.innerHTML = `+2 ${g('bolt')}`;
    f.style.left = r.left + r.width / 2 + 'px'; f.style.top = r.top + 'px';
    document.body.append(f); setTimeout(() => f.remove(), 1300);
    pill.classList.add('bump'); setTimeout(() => pill.classList.remove('bump'), 400);
    Sound.play('energy');
  };
  paint();
  return {
    pro, get value() { return e },
    answer(ok) {
      if (pro) return;
      e = Math.max(0, e - 1); run = ok ? run + 1 : 0;
      if (ok && run % 3 === 0) { e = Math.min(max, e + 2); setTimeout(() => { bonus(); react(true, { line: '+2 Energy! Three in a row.' }); }, 350); }
      if (cache) cache.energy = e;
      paint();
    },
    empty() { return !pro && e <= 0; },
    sync(value) { if (!pro && value != null) { e = value; if (cache) cache.energy = e; paint(); } },
    refill() { e = max; paint(); },
  };
}

/** When Energy runs out mid-lesson or mid-round: the Continue button opens the refill sheet instead. */
export function guardContinue(ctx, meter, foot, { quitHref = '/learn', quitLabel = 'Quit' } = {}) {
  if (!meter.empty()) return;
  const btn = foot.querySelector('#run-primary'); if (!btn) return;
  const go = btn.onclick;
  btn.onclick = () => {
    Sound.play('wrong');
    const canRefill = (cache?.stars || 0) >= 350;
    const { close } = openSheet(`<div class="paywall">${ace('oops', 'ace-md')}<h2>Out of Energy</h2>
      <p class="muted">Every answer uses 1 Energy, and 3 right in a row earns 2 back. Energy refills over time, about 1 every 20 minutes.</p>
      <div class="energy-meter big"><span style="width:0%"></span></div>
      <button type="button" class="primary chunky" id="oe-refill" ${canRefill ? '' : 'disabled'}>${g('chip')} Refill for 350 chips</button>
      <a class="button chunky pro-button" href="/store#pro" data-close>${g('crown')} Unlimited with Pro</a>
      <a class="button ghost" href="${quitHref}" data-close>${quitLabel}</a></div>`);
    $('#oe-refill')?.addEventListener('click', async () => {
      try { setEconomy(await ctx.api('/api/store/buy', 'POST', { item: 'refill' })); meter.refill(); Sound.play('energy'); close(); btn.onclick = go; go?.(); }
      catch (e) { ctx.toast(e.message); }
    });
  };
}
