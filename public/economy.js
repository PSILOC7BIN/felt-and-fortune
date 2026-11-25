// Economy UI: streak/Stars/Energy chips, the store, the Pro paywall, quests, leagues, and celebrations.
// The server is the source of truth (economy.py); this module only renders and calls it.
import { esc, $, $$, Sound, g, ace } from './ui.js';
import { react } from './reactions.js';

let cache = null, apiRef = null;
export const economyState = () => cache;
export const setEconomy = eco => { if (eco && 'stars' in eco) { cache = eco; applyLook(eco.look); paintChips(); } return cache; };

export async function loadEconomy(api, localDate) {
  apiRef = api;
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
    : `<button type="button" class="chip energy-chip ${eco.energy <= 5 ? 'low' : ''} ${eco.energyClaimIn === 0 && eco.energy < eco.energyMax ? 'claimable' : ''}" data-energy-open title="Energy: ${eco.energy}/${eco.energyMax}">${g('bolt')}<b data-energy>${eco.energy}</b><span class="sr">Energy, open the Energy panel</span></button>`;
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
  ['cards', 'Card counting, advantage play, and the Expert Lab', 'Hi‑Lo at a full table, index plays, bet ramps, Kelly, and 13 expert units past the Illustrious 18.'],
  ['bolt', 'Unlimited Energy', 'Practice and play Free Play as long as you like.'],
  ['chart', 'Bankroll Simulator and Casino Map', 'Plan a game, a spread, and a trip before you risk a dollar.'],
  ['shield', '14-day free trial, cancel any time', 'We email you 3 days before the trial ends.'],
];

export function paywall(ctx, reason = '') {
  Sound.play('reveal'); window.ffTrack?.('paywall_view', { reason: String(reason).slice(0, 80) });
  const { close } = openSheet(`<div class="paywall">${g('crown', 'paywall-crown')}<h2>Felt & Fortune Pro</h2>
    <p class="muted">${esc(reason || 'Go from playing smart to playing with an edge.')}</p>
    <ul class="perks">${PRO_PERKS.map(([ic, t, d]) => `<li><span class="tool-icon sm">${g(ic)}</span><span><strong>${t}</strong><small>${d}</small></span></li>`).join('')}</ul>
    <p class="muted small">Basic strategy, money management, and responsible-gambling lessons stay free forever.</p>
    <a class="button primary chunky" href="/store#pro" data-close>Try Pro free for 14 days</a><p class="muted small">Then $79.99 a year ($6.67/month), or $9.99 month to month.</p><button type="button" class="ghost" data-close>Not now</button></div>`);
  return close;
}

// ---- Energy panel: tap the Energy chip. Shows x/25, time until full, and the free hourly +5. ----------
const clock = t => t >= 3600 ? `${Math.floor(t / 3600)}h ${String(Math.floor(t % 3600 / 60)).padStart(2, '0')}m` : t >= 60 ? `${Math.floor(t / 60)}m ${String(t % 60).padStart(2, '0')}s` : `${t}s`;

export function energyPanel(ctx, { title = 'Energy', mood = null, after = null, onGain = null, quitHref = null, quitLabel = 'Quit' } = {}) {
  const api = ctx?.api || apiRef; if (!cache) return;
  let t0 = Date.now(), timer = null;
  const { host, close } = openSheet('<div class="energy-panel" id="energy-panel"></div>', { onClose: () => clearInterval(timer) });
  const left = v => v == null ? null : Math.max(0, v - Math.floor((Date.now() - t0) / 1000));
  const gain = (added, full) => {
    onGain?.(added, full);
    const box = $('.battery', host); if (box) { const f = document.createElement('span'); f.className = 'energy-float in-panel'; f.innerHTML = `+${added} ${g('bolt')}`; box.append(f); setTimeout(() => f.remove(), 1300); }
  };
  const paint = () => {
    const el = $('#energy-panel', host); if (!el) return;
    const eco = cache;
    if (eco.plan?.pro) {
      el.innerHTML = `<h2>${g('crown')} Unlimited Energy</h2><p class="muted">Pro never runs out. Practice as long as you like.</p><button type="button" class="primary chunky" data-close>Nice</button>`; return;
    }
    const max = eco.energyMax || 25, e = eco.energy ?? max, claimIn = left(eco.energyClaimIn || 0), fullIn = left(eco.energyFullIn), nextIn = left(eco.energyNextIn);
    const cells = Array.from({ length: 5 }, (_, i) => `<i class="${e >= (i + 1) * max / 5 ? 'on' : e > i * max / 5 ? 'part' : ''}"></i>`).join('');
    el.innerHTML = `${mood ? ace(mood, 'ace-md') : ''}<h2>${esc(title)}</h2>
      <div class="battery ${e <= 5 ? 'low' : ''}" role="img" aria-label="${e} of ${max} Energy"><div class="battery-body"><span class="battery-fill" style="width:${e / max * 100}%"></span><span class="battery-cells">${cells}</span><b class="battery-num">${g('bolt')} ${e}<small>/${max}</small></b></div><i class="battery-cap"></i></div>
      <p class="energy-when">${e >= max ? '<strong>Full!</strong> Each answer uses 1 Energy.' : `<strong>Full in <span data-left="full">${clock(fullIn)}</span></strong> · +1 every ${eco.energyRefillMinutes || 30} min`}</p>
      <div class="refill-list">
        <div class="refill-row free ${claimIn ? '' : 'ready'}"><span class="refill-ic">${g('gift')}</span><span class="refill-copy"><strong>Free Energy</strong><small>+${eco.energyClaim || 5} every hour, on the house</small></span>${claimIn ? `<span class="refill-wait">${g('rotr')} <span data-left="claim">${clock(claimIn)}</span></span>` : `<button type="button" class="primary small" id="ep-claim" ${e >= max ? 'disabled' : ''}>Claim +${eco.energyClaim || 5}</button>`}</div>
        <div class="refill-row"><span class="refill-ic chips">${g('chip')}</span><span class="refill-copy"><strong>Full refill</strong><small>Top up to ${max} right now</small></span><button type="button" class="small" id="ep-refill" ${eco.stars < 350 || e >= max ? 'disabled' : ''}>${g('chip')} 350</button></div>
        <a class="refill-row pro" href="/store#pro" data-close><span class="refill-ic crown">${g('crown')}</span><span class="refill-copy"><strong>Unlimited with Pro</strong><small>Never wait. Plus every counting course.</small></span><span class="refill-go">${g('next')}</span></a>
      </div>
      <p class="energy-tip">${g('flame')} Get 3 right in a row for +2 Energy. Reviewing mistakes is free.</p>
      ${after && e > 0 ? '<button type="button" class="primary chunky" id="ep-go">Keep going</button>' : ''}
      ${quitHref ? `<a class="button ghost" href="${quitHref}" data-close>${esc(quitLabel)}</a>` : `<button type="button" class="ghost" data-close>${after ? 'Not now' : 'Close'}</button>`}`;
    $('#ep-claim', el)?.addEventListener('click', async ev => {
      ev.currentTarget.disabled = true;
      try { const r = await api('/api/energy/claim', 'POST', {}); setEconomy(r); t0 = Date.now(); Sound.play('energy'); paint(); gain(r.added, false); }
      catch (err) { ctx?.toast?.(err.message); paint(); }
    });
    $('#ep-refill', el)?.addEventListener('click', async ev => {
      ev.currentTarget.disabled = true;
      try { const before = cache.energy; setEconomy(await api('/api/store/buy', 'POST', { item: 'refill' })); t0 = Date.now(); Sound.play('energy'); paint(); gain((cache.energy || 0) - before, true); }
      catch (err) { ctx?.toast?.(err.message); paint(); }
    });
    $('#ep-go', el)?.addEventListener('click', () => { close(); after(); });
  };
  paint();
  timer = setInterval(() => {
    const eco = cache; if (!eco || eco.plan?.pro) return;
    const claim = left(eco.energyClaimIn || 0), full = left(eco.energyFullIn), next = left(eco.energyNextIn);
    if ((eco.energyClaimIn && !claim) || (eco.energyNextIn && !next)) { if (apiRef) loadEconomy(apiRef, () => new Date().toLocaleDateString('en-CA')).then(() => { t0 = Date.now(); paint(); }); else paint(); return; }
    $$('[data-left="claim"]', host).forEach(x => x.textContent = clock(claim));
    $$('[data-left="full"]', host).forEach(x => x.textContent = clock(full));
  }, 1000);
  return close;
}

document.addEventListener('click', e => {
  const b = e.target.closest?.('[data-energy-open]'); if (!b || !cache) return;
  e.preventDefault(); Sound.play('tap'); energyPanel(null);
});

export function outOfEnergy(ctx, eco, after) {
  Sound.play('wrong');
  if (eco) setEconomy(eco);
  if (!cache) { loadEconomy(ctx.api, ctx.localDate).then(() => energyPanel(ctx, { title: 'Out of Energy', mood: 'oops', after })); return; }
  energyPanel(ctx, { title: 'Out of Energy', mood: 'oops', after });
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
const RARITY_LABEL = { common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', mythic: 'Event exclusive' };
const TABS = [['shop', 'star', 'Shop'], ['looks', 'cards', 'Looks'], ['chips', 'chip', 'Get chips'], ['pro', 'crown', 'Pro']];
const LOOKS = [['back', 'Card backs'], ['felt', 'Table mats'], ['coach', 'Coach outfits'], ['sets', 'Sets'], ['events', 'Event exclusives']];
const OLD_TAB = { featured: ['shop'], powerups: ['shop'], plans: ['pro'], back: ['looks', 'back'], felt: ['looks', 'felt'], coach: ['looks', 'coach'], sets: ['looks', 'sets'], events: ['looks', 'events'] };
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

export async function storePage(ctx, startTab = location.hash.slice(1) || 'shop') {
  const { api } = ctx;
  let st = await api('/api/store?day=' + ctx.localDate()); setEconomy(st);
  window.ffTrack?.('store_view', { tab: startTab });
  const test = st.billingMode === 'test';
  const [tab0, look0] = OLD_TAB[startTab] || [startTab];
  const S = { tab: TABS.some(t => t[0] === tab0) ? tab0 : 'shop', look: look0 || 'back', filter: 'all', selected: null, arming: null, preview: { ...st.look }, plan: 'pro-annual' };
  const fmtDate = ts => new Date(ts * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const day = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const owned = () => new Set(st.owned);
  const has = (id, it) => owned().has(id) || (it.pro && st.plan.pro);
  const equipped = (kind, value) => st.look[kind] === value;
  const page = ctx.$('#page');

  // ---- pieces ----
  const itemCard = (id, it) => {
    const mine = has(id, it), on = mine && equipped(it.kind, it.value), sel = S.selected === id;
    const tag = on ? `<span class="own-tag on">${g('check')} Equipped</span>` : mine ? '<span class="own-tag">Owned</span>'
      : it.event ? `<span class="own-tag event">${g('trophy')} Event</span>` : it.pro ? `<span class="own-tag pro">${g('crown')} Pro</span>`
      : `<span class="price ${st.stars >= it.stars ? '' : 'short'}">${g('chip')} ${it.stars.toLocaleString()}</span>`;
    return `<button type="button" class="item-card r-${it.rarity} ${on ? 'equipped' : ''} ${sel ? 'selected' : ''}" data-item="${id}" aria-pressed="${sel}">${artHTML(it.kind, it.value)}<span class="item-name">${esc(it.name)}</span><span class="rarity">${RARITY_LABEL[it.rarity]}</span>${tag}</button>`;
  };
  const defaultCard = kind => {
    const [v, name] = DEFAULT_ITEMS[kind], on = equipped(kind, v), id = 'default-' + kind;
    return `<button type="button" class="item-card r-starter ${on ? 'equipped' : ''} ${S.selected === id ? 'selected' : ''}" data-item="${id}">${artHTML(kind, v)}<span class="item-name">${name}</span><span class="rarity">Starter</span>${on ? `<span class="own-tag on">${g('check')} Equipped</span>` : '<span class="own-tag">Owned</span>'}</button>`;
  };
  const filtered = list => list.filter(([id, it]) => S.filter === 'all' || (S.filter === 'owned' && has(id, it)) || (S.filter === 'afford' && !has(id, it) && !it.event && !it.pro && st.stars >= it.stars));
  const kindGrid = kind => {
    const order = ['common', 'rare', 'epic', 'legendary'];
    const items = Object.entries(st.catalog).filter(([, it]) => it.kind === kind && !it.event).sort((a, b) => (a[1].pro - b[1].pro) || order.indexOf(a[1].rarity) - order.indexOf(b[1].rarity));
    const events = Object.entries(st.catalog).filter(([, it]) => it.kind === kind && it.event);
    const all = [...items, ...events], mine = all.filter(([id, it]) => has(id, it)).length + 1;
    const shown = filtered(items), shownEv = filtered(events);
    return `<div class="grid-head"><p class="collection-count">${g('check')} ${mine} of ${all.length + 1} collected</p>
      <div class="seg-mini" role="radiogroup" aria-label="Filter">${[['all', 'All'], ['owned', 'Owned'], ['afford', 'Can afford']].map(([k, t]) => `<button type="button" role="radio" aria-checked="${S.filter === k}" data-filter="${k}">${t}</button>`).join('')}</div></div>
      <div class="item-grid">${S.filter !== 'afford' ? defaultCard(kind) : ''}${shown.map(([id, it]) => itemCard(id, it)).join('')}</div>
      ${shown.length || S.filter !== 'afford' ? '' : `<p class="muted">Nothing you can afford yet. <a href="/quests">Earn chips</a> or <button type="button" class="linklike" data-tab="chips">get a pack</button>.</p>`}
`;
  };
  const eventsGrid = () => {
    const ev = Object.entries(st.catalog).filter(([, it]) => it.event);
    const mine = ev.filter(([id]) => owned().has(id)).length;
    return `<div class="event-hero">${g('trophy')}<div><strong>Event exclusives</strong><span>Each one is earned once, by finishing that month’s event. They are never sold, never come back, and put a badge on your profile.</span></div><b>${mine}/${ev.length}</b></div>
      <div class="item-grid events">${ev.map(([id, it]) => itemCard(id, it)).join('')}</div>`;
  };
  const setCard = s => {
    const done = s.owned === s.total;
    return `<div class="set-card"><div class="set-arts">${s.items.map(id => artHTML(st.catalog[id].kind, st.catalog[id].value)).join('')}</div><div class="set-copy"><h3>${esc(s.name)}</h3>
      <div class="set-bar"><span style="width:${Math.round(s.owned / s.total * 100)}%"></span></div><small>${s.owned} of ${s.total} collected · finish it for ${g('chip')} ${s.bonus} bonus chips</small></div>
      ${done ? `<span class="own-tag on">${g('check')} Complete</span>` : `<button type="button" class="${S.arming === 'set:' + s.id ? 'danger' : 'primary'}" data-set="${s.id}" ${st.stars >= s.price ? '' : 'disabled'}>${S.arming === 'set:' + s.id ? 'Tap to confirm' : `${g('chip')} ${s.price.toLocaleString()}`}<small>${S.arming === 'set:' + s.id ? `${s.price.toLocaleString()} chips` : 'the rest, 20% off'}</small></button>`}</div>`;
  };
  const pc = st.proContent || { units: 0, lessons: 0 };
  const COMPARE = [['Basic strategy, money management, and casino skills', true, true], ['Practice trainers and Free Play table', 'Energy', 'Unlimited'],
    [`Card counting, advantage play, and the Expert Lab (${pc.lessons} lessons)`, 'First unit', true], ['Hand Review history', 'Last 3 misses', 'Everything'],
    ['Bankroll Simulator', false, true], ['Casino Map', false, true], ['Pro Gold collection', false, true], ['Quest swaps a day', '1', '2']];
  const cell = v => v === true ? `<span class="yes">${g('check')}</span>` : v === false ? '<span class="no">—</span>' : `<span>${esc(v)}</span>`;
  const planPick = (id, p) => {
    const on = S.plan === id, yr = p.period === 'year';
    return `<button type="button" class="plan-pick ${on ? 'on' : ''}" data-pick="${id}" role="radio" aria-checked="${on}">${yr ? `<span class="plan-flag">Save ${p.save || 33}%</span>` : ''}<span class="pp-radio"></span><span class="pp-copy"><strong>${yr ? 'Yearly' : 'Monthly'}</strong><small>${yr ? `$${p.price.toFixed(2)} a year · ${p.trial}-day free trial` : 'Billed every month · cancel any time'}</small></span><span class="pp-price"><b>$${(yr ? p.perMonth : p.price).toFixed(2)}</b><small>/month</small></span></button>`;
  };
  const proPitch = () => {
    const p = st.plans[S.plan];
    return `<section class="pro-hero"><div class="pro-hero-copy">${ace('cheer', 'ace-lg')}<div><span class="pro-kicker">${g('crown')} Felt & Fortune Pro</span><h2>Go from playing smart to playing with an edge.</h2><p>Every counting and advantage-play lesson, the Expert Lab, unlimited practice, and the tools pros use to plan a trip.</p></div></div>
      <div class="pro-stats"><div><b>${pc.units}</b><span>Pro units</span></div><div><b>${pc.lessons}</b><span>Pro lessons</span></div><div><b>∞</b><span>Energy</span></div></div></section>
      <div class="pro-buy"><div class="plan-picks" role="radiogroup" aria-label="Choose a plan">${planPick('pro-annual', st.plans['pro-annual'])}${planPick('pro-monthly', st.plans['pro-monthly'])}</div>
      <button type="button" class="chunky pro-cta" data-plan="${S.plan}">${p.trial ? `Start your ${p.trial}-day free trial` : `Get Pro for $${p.price.toFixed(2)}/month`}</button>
      <p class="muted small pro-fine">${p.trial ? `Free for ${p.trial} days, then $${p.price.toFixed(2)} a year. We email you 3 days before the trial ends. Cancel in one tap.` : `$${p.price.toFixed(2)} every month until you cancel. Pro stays on until the period ends.`}</p></div>
      <div class="compare"><div class="compare-row head"><span></span><span>Free</span><span class="pro-col">${g('crown')} Pro</span></div>${COMPARE.map(([t, f, pr]) => `<div class="compare-row"><span>${esc(t)}</span>${cell(f)}<span class="pro-col">${cell(pr)}</span></div>`).join('')}</div>`;
  };
  const powerRow = () => `<div class="shop-grid">${Object.entries(st.powerups).map(([id, it]) => `<div class="shop-item">${artHTML(it.kind)}<div class="shop-copy"><strong>${esc(it.name)}</strong><small>${esc(it.text)}</small></div><button type="button" class="small ${S.arming === 'power:' + id ? 'danger' : st.stars >= it.stars ? 'primary' : ''}" data-power="${id}" ${st.stars >= it.stars ? '' : 'disabled'}>${S.arming === 'power:' + id ? 'Tap to confirm' : `${g('chip')} ${it.stars}`}</button></div>`).join('')}</div>`;
  const panes = {
    shop: () => {
      const set = st.sets.find(x => x.owned < x.total) || st.sets[0];
      return `${st.plan.pro ? '' : `<button type="button" class="pro-banner big" data-tab="pro">${ace('wink', 'ace-sm')}<span><strong>Try Pro free for 14 days</strong><small>Counting, the Expert Lab, unlimited Energy, and more. From $${st.plans['pro-annual'].perMonth.toFixed(2)}/month.</small></span><span class="pro-banner-go">See Pro ${g('next')}</span></button>`}
        <h3 class="sub-head">${g('bolt')} Power-ups <small>Keep your streak and your practice going</small></h3>${powerRow()}
        <h3 class="sub-head">${g('star')} This week’s picks <small>New picks ${day(st.featured.ends)}</small></h3><div class="item-grid">${st.featured.items.map(id => itemCard(id, st.catalog[id])).join('')}</div>
        <h3 class="sub-head">${g('gift')} Set of the week <small>Finish a set for bonus chips</small></h3>${setCard(set)}
        <button type="button" class="see-all" data-tab="looks">Browse every look ${g('next')}</button>`;
    },
    looks: () => `<div class="look-tabs" role="tablist" aria-label="Looks">${LOOKS.map(([k, t]) => `<button type="button" role="tab" aria-selected="${S.look === k}" data-look="${k}">${t}</button>`).join('')}</div>
      ${S.look === 'sets' ? `<p class="muted">Each set has a card back, a table mat, and a coach outfit. Buying the rest of a set costs 20% less, and finishing one pays a one-time bonus.</p><div class="set-list">${st.sets.map(setCard).join('')}</div>`
        : S.look === 'events' ? eventsGrid() : kindGrid(S.look)}`,
    chips: () => `<p class="muted">Chips buy card backs, table mats, coach outfits, freezes, and refills. They have no cash value and can never be used to bet. You also earn them from lessons, quests, and streaks.</p>
      <div class="pack-grid">${Object.entries(st.chipPacks).map(([id, p], i) => `<button type="button" class="pack-card ${i === 2 ? 'best' : ''}" data-pack="${id}">${i === 2 ? '<span class="plan-flag">Best value</span>' : ''}<span class="pack-art">${Array.from({ length: Math.min(4, i + 1) }, () => g('chip')).join('')}</span><strong>${p.chips.toLocaleString()} chips</strong><small>${esc(p.name)}</small>${p.bonus ? `<span class="pack-bonus">${esc(p.bonus)}</span>` : '<span class="pack-bonus">&nbsp;</span>'}<span class="pack-price">$${p.price.toFixed(2)}</span></button>`).join('')}</div>`,
    pro: () => `${st.plan.pro ? `<div class="plan-status"><strong>${g('crown')} You have ${esc(st.plans[st.plan.plan]?.name || 'Pro')}</strong><span class="muted">${st.plan.trialEnds ? `Free trial ends ${fmtDate(st.plan.trialEnds)}. We’ll email you 3 days before.` : st.plan.status === 'canceled' ? `Canceled. Pro stays on until ${fmtDate(st.plan.renews)}.` : st.plan.renews ? `Renews ${fmtDate(st.plan.renews)}.` : 'Lifetime access.'}</span>${st.plan.plan !== 'pro-lifetime' && st.plan.status !== 'canceled' ? '<button type="button" class="small" id="cancel-plan">Cancel subscription</button>' : ''}</div>` : proPitch()}
      <h3 class="sub-head">${g('crown')} Pro Gold collection <small>${st.plan.pro ? 'Claim each piece; it stays yours even if Pro ends.' : 'Included with Pro.'}</small></h3><div class="item-grid">${Object.entries(st.catalog).filter(([, it]) => it.pro).map(([id, it]) => itemCard(id, it)).join('')}</div>
      <p class="muted small"><button type="button" class="linklike" id="restore">Restore purchases</button> · <a href="/terms">Billing, cancellation, and refund terms</a></p>`,
  };

  // ---- detail panel (try-on + action) ----
  const detailHTML = () => {
    const look = S.preview;
    let body = '<p class="muted small">Tap anything to try it on your table.</p>';
    const id = S.selected;
    if (id) {
      const isDef = id.startsWith('default-'), kind = isDef ? id.slice(8) : st.catalog[id].kind;
      const it = isDef ? { name: DEFAULT_ITEMS[kind][1], kind, value: DEFAULT_ITEMS[kind][0], rarity: 'starter', text: DEFAULT_ITEMS[kind][2] } : st.catalog[id];
      const mine = isDef || has(id, it), on = equipped(it.kind, it.value), arming = S.arming === 'item:' + id;
      let action;
      if (on) action = `<span class="own-tag on big">${g('check')} Equipped</span>`;
      else if (mine && (isDef || owned().has(id))) action = `<button type="button" class="primary chunky" data-act="equip">Equip</button>`;
      else if (it.pro) action = st.plan.pro ? `<button type="button" class="primary chunky" data-act="claim">${g('crown')} Claim free</button>` : `<button type="button" class="chunky pro-button" data-tab="pro">${g('crown')} Included with Pro</button>`;
      else if (it.event) action = '<p class="muted small">Finish a monthly Quests event to earn event backs.</p><a class="button" href="/quests">See this month’s event</a>';
      else if (st.stars >= it.stars) action = `<button type="button" class="chunky ${arming ? 'danger' : 'primary'}" data-act="buy">${arming ? `Tap to confirm · ${it.stars.toLocaleString()} chips` : `${g('chip')} Buy for ${it.stars.toLocaleString()}`}</button>${arming ? '<button type="button" class="ghost small" data-act="cancel">Cancel</button>' : ''}`;
      else action = `<button type="button" class="chunky" disabled>${g('chip')} ${it.stars.toLocaleString()}</button><p class="muted small">You need ${(it.stars - st.stars).toLocaleString()} more chips. <a href="/quests">Earn chips</a> or <button type="button" class="linklike" data-tab="chips">get a pack</button>.</p>`;
      body = `<div class="pv-name"><strong>${esc(it.name)}</strong><span class="rarity r-${it.rarity}">${it.rarity === 'starter' ? 'Starter' : RARITY_LABEL[it.rarity]}</span></div><p class="muted small">${esc(it.text || '')}</p>${action}`;
    }
    return `<div class="pv-top"><h3>Your table</h3>${S.selected ? '<button type="button" class="ghost small" data-act="reset">Reset preview</button>' : ''}</div>${previewHTML(look)}<div class="pv-body">${body}</div>`;
  };

  // ---- render ----
  const wallet = () => `<div class="wallet-bar"><span class="chip stars-chip">${g('chip')}<b data-stars>${st.stars.toLocaleString()}</b><span>chips</span></span><span class="chip" title="Streak freezes">${g('snow')}<b>${st.freezes}/${st.freezeMax}</b></span>${st.plan.pro ? `<span class="chip pro-chip">${g('crown')}<b>Pro</b></span>` : `<span class="chip energy-chip">${g('bolt')}<b>${st.energy}</b></span>`}<button type="button" class="chip get-chips" data-tab="chips">Get chips</button></div>`;
  function render(keepScroll = true) {
    const y = window.scrollY;
    const side = S.tab === 'shop' || S.tab === 'looks';
    page.innerHTML = `<div class="store2 store3 store4 tab-${S.tab}"><header class="store-top"><div><h1>Store</h1><p class="muted">${{ shop: 'Power-ups, this week’s picks, and the set of the week.', looks: 'Dress your table and your coach. Tap anything to try it on.', chips: 'Top up your chips. No cash value, never used to bet.', pro: 'Everything in Felt & Fortune, with no limits.' }[S.tab]}</p></div>${wallet()}</header>
      <nav class="store-tabs" role="tablist" aria-label="Store sections">${TABS.map(([k, ic, label]) => `<button type="button" role="tab" aria-selected="${k === S.tab}" data-tab="${k}" class="${k === 'pro' && !st.plan.pro ? 'pro-tab' : ''}">${g(ic)}<span>${label}</span></button>`).join('')}</nav>
      <div class="store-body ${side ? '' : 'solo'}"><section class="store-pane" role="tabpanel">${panes[S.tab]()}</section>${side ? `<aside class="store-preview" id="store-preview" aria-label="Preview">${detailHTML()}</aside>` : ''}</div>
      ${test ? '<p class="test-banner small">Test mode: purchases are simulated and nothing is charged.</p>' : ''}</div>`;
    if (keepScroll) window.scrollTo(0, y);
  }
  const paintDetail = () => { const el = $('#store-preview'); if (el) el.innerHTML = detailHTML(); };
  const apply = snap => { st = { ...st, ...snap }; setEconomy(st); };
  const celebrate = (msg, big) => { Sound.play(big ? 'levelup' : 'unlock'); confetti({ count: big ? 120 : 60 }); ctx.toast(msg); };

  page.onclick = async e => {
    const t = e.target.closest('[data-tab],[data-look],[data-pick],[data-filter],[data-item],[data-act],[data-set],[data-power],[data-pack],[data-plan],#cancel-plan,#restore');
    if (!t) return;
    if (t.dataset.tab) { const [tb, lk] = OLD_TAB[t.dataset.tab] || [t.dataset.tab]; S.tab = tb; if (lk) S.look = lk; S.arming = null; history.replaceState(null, '', '/store#' + S.tab); Sound.play('tap'); render(false); window.scrollTo({ top: 0 }); return; }
    if (t.dataset.look) { S.look = t.dataset.look; S.filter = 'all'; S.arming = null; Sound.play('tick'); render(); return; }
    if (t.dataset.pick) { S.plan = t.dataset.pick; Sound.play('tick'); render(); return; }
    if (t.dataset.filter) { S.filter = t.dataset.filter; Sound.play('tick'); render(); return; }
    if (t.dataset.item) {
      if (!$('#store-preview')) { S.tab = 'looks'; S.look = st.catalog[t.dataset.item]?.kind || 'back'; render(false); }
      const id = t.dataset.item; S.selected = id; S.arming = null;
      const kind = id.startsWith('default-') ? id.slice(8) : st.catalog[id].kind, value = id.startsWith('default-') ? DEFAULT_ITEMS[kind][0] : st.catalog[id].value;
      S.preview = { ...st.look, [kind]: value }; Sound.play('pop');
      $$('.item-card.selected', page).forEach(x => x.classList.toggle('selected', false)); t.classList.add('selected');
      paintDetail();
      if (matchMedia('(max-width: 980px)').matches) $('#store-preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const act = t.dataset.act;
    if (act === 'reset') { S.selected = null; S.arming = null; S.preview = { ...st.look }; $$('.item-card.selected', page).forEach(x => x.classList.toggle('selected', false)); paintDetail(); return; }
    if (act === 'cancel') { S.arming = null; paintDetail(); return; }
    try {
      if (act === 'equip') {
        const id = S.selected, kind = id.startsWith('default-') ? id.slice(8) : st.catalog[id].kind, value = id.startsWith('default-') ? DEFAULT_ITEMS[kind][0] : st.catalog[id].value;
        apply(await api('/api/store/equip', 'POST', { kind, value })); Sound.play('select'); ctx.toast('Equipped.'); render(); return;
      }
      if (act === 'claim') { apply(await api('/api/store/buy', 'POST', { item: S.selected })); celebrate('Claimed!', false); render(); return; }
      if (act === 'buy') {
        if (S.arming !== 'item:' + S.selected) { S.arming = 'item:' + S.selected; Sound.play('tick'); paintDetail(); return; }
        const it = st.catalog[S.selected]; S.arming = null;
        apply(await api('/api/store/buy', 'POST', { item: S.selected })); celebrate(`${it.name} unlocked and equipped!`, it.rarity === 'legendary'); render(); return;
      }
      if (t.dataset.set) {
        const s = st.sets.find(x => x.id === t.dataset.set);
        if (S.arming !== 'set:' + s.id) { S.arming = 'set:' + s.id; Sound.play('tick'); render(); return; }
        S.arming = null; apply(await api('/api/store/buy-set', 'POST', { set: s.id })); st = await api('/api/store?day=' + ctx.localDate()); setEconomy(st); celebrate(`${s.name} complete! +${s.bonus} bonus chips`, true); render(); return;
      }
      if (t.dataset.power) {
        const id = t.dataset.power, it = st.powerups[id];
        if (S.arming !== 'power:' + id) { S.arming = 'power:' + id; Sound.play('tick'); render(); return; }
        S.arming = null; apply(await api('/api/store/buy', 'POST', { item: id })); Sound.play(it.kind === 'freeze' ? 'freeze' : 'energy'); ctx.toast(`${it.name} added.`); render(); return;
      }
      if (t.dataset.pack) {
        const p = st.chipPacks[t.dataset.pack];
        const { close } = openSheet(`<div class="confirm-buy"><span class="pack-art big">${g('chip')}${g('chip')}${g('chip')}</span><h2>${p.chips.toLocaleString()} chips</h2><p><b>$${p.price.toFixed(2)}</b>, charged once</p><p class="muted">Chips buy cosmetics and power-ups. They have no cash value and can’t be wagered, sold, or exchanged.</p>${test ? '<p class="test-banner">Test mode: nothing will be charged.</p>' : ''}<button type="button" class="primary chunky" id="confirm-pack">Buy for $${p.price.toFixed(2)}</button><button type="button" class="ghost" data-close>Cancel</button></div>`);
        $('#confirm-pack').onclick = async () => { try { const r = await api('/api/billing/test-chips', 'POST', { pack: t.dataset.pack }); apply(r); close(); celebrate(`+${r.added.toLocaleString()} chips`, true); render(); } catch (err) { ctx.toast(err.message); } };
        return;
      }
      if (t.dataset.plan) {
        const p = st.plans[t.dataset.plan];
        const { close } = openSheet(`<div class="confirm-buy">${g('crown', 'paywall-crown')}<h2>${esc(p.name)}</h2><p><b>$${p.price.toFixed(2)}${p.period ? ` per ${p.period}` : ' one time'}</b></p><p class="muted">${p.trial ? `Free for ${p.trial} days. Then $${p.price.toFixed(2)} every ${p.period} until you cancel. We’ll email you 3 days before the trial ends.` : p.period ? `$${p.price.toFixed(2)} now and every ${p.period} until you cancel. Pro stays on until the period ends.` : 'One payment, no renewal.'}</p>${test ? '<p class="test-banner">Test mode: nothing will be charged.</p>' : ''}<button type="button" class="primary chunky" id="confirm-buy">${p.trial ? 'Start free trial' : 'Confirm purchase'}</button><button type="button" class="ghost" data-close>Cancel</button></div>`);
        $('#confirm-buy').onclick = async () => { try { apply(await api('/api/billing/test-purchase', 'POST', { plan: t.dataset.plan })); close(); celebrate('Welcome to Pro!', true); render(); } catch (err) { ctx.toast(err.message); } };
        return;
      }
      if (t.id === 'cancel-plan') {
        const { close } = openSheet(`<h2>Cancel Pro?</h2><p class="muted">${st.plan.trialEnds ? 'Your trial ends now and you won’t be charged.' : 'You keep Pro until the end of the period you paid for.'} Your chips, streak, progress, and claimed items stay.</p><button type="button" class="danger chunky" id="confirm-cancel">Cancel subscription</button><button type="button" class="primary" data-close>Keep Pro</button>`);
        $('#confirm-cancel').onclick = async () => { try { apply(await api('/api/billing/cancel', 'POST', {})); close(); ctx.toast('Subscription canceled.'); render(); } catch (err) { ctx.toast(err.message); } };
        return;
      }
      if (t.id === 'restore') { await loadEconomy(api, ctx.localDate); ctx.toast(cache?.plan.pro ? 'Pro is active on this account.' : 'No purchases found for this account.'); }
    } catch (err) { S.arming = null; ctx.toast(err.message); render(); }
  };
  ctx.onCleanup?.(() => { page.onclick = null; });
  render(false);
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
      <div class="event-art">${artHTML('back', ev.reward.replace('back-', ''))}${ev.outfit ? artHTML('coach', ev.outfit.replace('coach-', '')) : ''}${ev.earned ? `<span class="event-badge">${g('check')}</span>` : ''}</div>
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
  const paint = () => { if (!host) return; host.innerHTML = pro ? `<span class="chip pro-chip energy-live" title="Pro: unlimited Energy">${g('crown')}<b>∞</b></span>` : `<button type="button" class="chip energy-live ${e <= 3 ? 'low' : ''}" title="Energy" data-energy-open>${g('bolt')}<b>${e}</b></button>`; };
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
    energyPanel(ctx, { title: 'Out of Energy', mood: 'oops', quitHref, quitLabel,
      onGain: (added, full) => { if (full) meter.refill(); else meter.sync((meter.value || 0) + added); },
      after: () => { btn.onclick = go; go?.(); } });
  };
}
