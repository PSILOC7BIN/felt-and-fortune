// Drill builder and drill packs. Build a drill from any hands, upcards, and rules and play it now (free), save and
// tag your drills (Pro), or work through leveled packs; a level unlocks the next at 90% or better.
import { esc, $, $$, g, Sound } from './ui.js';
import { paywall } from './economy.js';

const UPS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 1];
const up = u => (u === 1 ? 'A' : String(u));
const HARD = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(t => [`H${t}`, String(t)]);
const SOFT = [13, 14, 15, 16, 17, 18, 19, 20].map(t => [`S${t}`, `A,${t - 11}`]);
const PAIRS = ['P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'PA'].map(p => [p, p === 'PA' ? 'A,A' : `${p.slice(1)},${p.slice(1)}`]);
const cross = (cells, ups) => cells.flatMap(c => ups.map(u => [c, u]));
const range = (a, b) => UPS.filter(u => (u === 1 ? 11 : u) >= a && (u === 1 ? 11 : u) <= b);
const r = (h17 = 'off', surrender = 'off', das = 'on') => ({ h17, surrender, das });

// Packs: three levels each, easiest first. Level 1 of every pack is free; the rest are Pro.
export const PACKS = [
  { id: 'stiffs', name: 'Stiff hands', glyph: 'shield', color: 'red', blurb: 'Hard 12–16, the hands that cost players most.', levels: [
    ['Against a weak dealer', cross(['H12', 'H13', 'H14', 'H15', 'H16'], range(2, 6)), r()],
    ['Against a strong dealer', cross(['H12', 'H13', 'H14', 'H15', 'H16'], range(7, 11)), r()],
    ['All upcards, H17 and surrender', cross(['H12', 'H13', 'H14', 'H15', 'H16'], UPS), r('mix', 'mix')]] },
  { id: 'doubles', name: 'Doubling', glyph: 'bolt', color: 'orange', blurb: 'When to double hard and soft hands.', levels: [
    ['Hard 9, 10, and 11', cross(['H9', 'H10', 'H11'], UPS), r()],
    ['Soft doubles', cross(['S13', 'S14', 'S15', 'S16', 'S17', 'S18'], range(2, 6)), r()],
    ['Every double, H17', cross(['H9', 'H10', 'H11', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19'], UPS), r('on')]] },
  { id: 'pairs', name: 'Pairs', glyph: 'cards', color: 'purple', blurb: 'Which pairs to split, and against what.', levels: [
    ['Always and never', cross(['PA', 'P8', 'P10', 'P5'], UPS), r()],
    ['Against a weak dealer', cross(['P2', 'P3', 'P4', 'P6', 'P7', 'P9'], range(2, 7)), r()],
    ['Every pair, no double after split', cross(PAIRS.map(p => p[0]), UPS), r('off', 'off', 'mix')]] },
  { id: 'rules', name: 'Rule changes', glyph: 'gear', color: 'teal', blurb: 'The plays that change with H17 and surrender.', levels: [
    ['Surrender spots', [['H16', 9], ['H16', 10], ['H16', 1], ['H15', 10], ['H15', 1], ['H17', 1], ['P8', 1]], r('on', 'on')],
    ['Hits soft 17 changes', [['H11', 1], ['S18', 2], ['S19', 6], ['H15', 1], ['P8', 1], ['S17', 2]], r('on')],
    ['Mixed rules', cross(['H11', 'H15', 'H16', 'H17', 'S17', 'S18', 'S19', 'P8'], [2, 6, 9, 10, 1]), r('mix', 'mix')]] },
];

const progress = () => { try { return JSON.parse(localStorage.getItem('ff-packs') || '{}'); } catch { return {}; } };
export function markPack(spec, pct, api) {
  if (!spec?.pack || pct < 90) return false;
  const p = progress(); const [id, lvl] = spec.pack.split(':'); p[id] = Math.max(p[id] || 0, Number(lvl) + 1);
  localStorage.setItem('ff-packs', JSON.stringify(p));
  api?.('/api/packs', 'POST', { pack: id, level: p[id] }).catch(() => {});   // saved to the account too, so it follows you
  return true;
}

export async function builderPage(ctx) {
  const { api, go } = ctx;
  let saved = { drills: [], pro: false };
  try { saved = await api('/api/drills'); } catch { /* optional */ }
  const pro = saved.pro;
  try { const srv = (await api('/api/packs')).progress, loc = progress(); for (const k in srv) loc[k] = Math.max(loc[k] || 0, srv[k]); localStorage.setItem('ff-packs', JSON.stringify(loc)); } catch { /* offline: local progress */ }
  let st = { cells: new Set(['H12', 'H13', 'H14', 'H15', 'H16']), ups: new Set(UPS), h17: 'off', surrender: 'off', das: 'on', size: 10 };
  try { const last = JSON.parse(localStorage.getItem('ff-builder') || 'null'); if (last) st = { ...st, ...last, cells: new Set(last.cells), ups: new Set(last.ups) }; } catch { /* default */ }
  const keep = () => localStorage.setItem('ff-builder', JSON.stringify({ ...st, cells: [...st.cells], ups: [...st.ups] }));
  const spec = () => ({ cells: cross([...st.cells], [...st.ups]), rules: { h17: st.h17, surrender: st.surrender, das: st.das }, size: st.size });
  const play = (sp, name, extra = {}) => { sessionStorage.setItem('ff-drill', JSON.stringify({ ...sp, name, home: '/tools/builder', ...extra })); Sound.play('select'); go('/practice/drill'); };
  const chips = (list, set, key) => `<div class="b-chips" data-group="${key}">${list.map(([v, t]) => `<button type="button" class="b-chip" data-v="${v}" aria-pressed="${set.has(v)}">${t}</button>`).join('')}<button type="button" class="b-all" data-all="${key}">All</button><button type="button" class="b-all" data-none="${key}">None</button></div>`;
  const seg = (key, label, opts) => `<div class="seg-group"><span>${label}</span><div class="segmented" role="radiogroup" aria-label="${label}">${opts.map(([v, t]) => `<button type="button" role="radio" data-seg="${key}" data-v="${v}" aria-checked="${String(st[key]) === v}">${t}</button>`).join('')}</div></div>`;
  const prog = progress();

  const paint = () => {
    const n = st.cells.size * st.ups.size;
    $('#page').innerHTML = `<a class="back-link" href="/tools">${g('back')} Tools</a>
      <header class="page-hero"><div><h1>Drill builder</h1><p>Pick exactly which hands, upcards, and rules to drill, or work through a pack level by level. Every answer still counts toward your skill ratings and weakness map.</p></div></header>
      <section class="sim-card"><h2 class="sim-step"><span>${g('trophy')}</span>Drill packs</h2><p class="field-hint">Score 90% or better on a level to unlock the next. Level 1 of every pack is free.</p>
        <div class="packs">${PACKS.map(p => `<div class="pack c-${p.color}"><div class="pack-head"><span class="tool-icon sm">${g(p.glyph)}</span><div><strong>${p.name}</strong><span>${p.blurb}</span></div></div><ol class="pack-levels">${p.levels.map(([t], i) => { const open = i === 0 || (prog[p.id] || 0) >= i, locked = i > 0 && !pro, done = (prog[p.id] || 0) > i; return `<li><button type="button" class="pack-level${done ? ' done' : ''}" data-pack="${p.id}" data-level="${i}" ${open || locked ? '' : 'disabled'}><span class="lvl">${done ? g('check') : i + 1}</span><span>${t}</span>${locked ? `<span class="pro-tag">${g('crown')} Pro</span>` : !open ? g('lock') : ''}</button></li>`; }).join('')}</ol></div>`).join('')}</div></section>
      <section class="sim-card"><h2 class="sim-step"><span>1</span>Hands</h2><h3 class="b-sub">Hard totals</h3>${chips(HARD, st.cells, 'hard')}<h3 class="b-sub">Soft hands</h3>${chips(SOFT, st.cells, 'soft')}<h3 class="b-sub">Pairs</h3>${chips(PAIRS, st.cells, 'pairs')}</section>
      <section class="sim-card"><h2 class="sim-step"><span>2</span>Dealer upcards</h2>${chips(UPS.map(u => [u, up(u)]), st.ups, 'ups')}</section>
      <section class="sim-card"><h2 class="sim-step"><span>3</span>Rules and length</h2><div class="settings-bar b-rules">${seg('h17', 'Dealer soft 17', [['off', 'Stands'], ['on', 'Hits'], ['mix', 'Mixed']])}${seg('surrender', 'Surrender', [['off', 'Off'], ['on', 'On'], ['mix', 'Mixed']])}${seg('das', 'Double after split', [['on', 'Allowed'], ['off', 'Not allowed'], ['mix', 'Mixed']])}${seg('size', 'Hands per round', [['10', '10'], ['20', '20'], ['30', '30']])}</div></section>
      <div class="sim-run"><button type="button" class="primary chunky large" id="b-go" ${n ? '' : 'disabled'}>${g('target')} Drill ${n} spot${n === 1 ? '' : 's'}</button>
        <div class="b-save"><input id="b-name" placeholder="Name this drill" maxlength="40"><input id="b-tag" placeholder="Tag (optional)" maxlength="20"><button type="button" id="b-save" ${n ? '' : 'disabled'}>${pro ? '' : g('crown') + ' '}Save</button></div></div>
      <section class="sim-card"><h2 class="sim-step"><span>${g('book')}</span>Your saved drills</h2>${!pro ? `<p class="muted">Save, name, and tag your own drills with Pro, and replay them any time on any device.</p>` : saved.drills.length ? `<div class="b-saved">${[...new Set(saved.drills.map(d => d.tag || 'Untagged'))].map(tag => `<h3 class="b-sub">${esc(tag)}</h3>${saved.drills.filter(d => (d.tag || 'Untagged') === tag).map(d => `<div class="b-drill"><span><strong>${esc(d.name)}</strong><small>${d.spec.cells.length} spots · ${d.spec.size} hands a round</small></span><button type="button" class="small primary" data-run="${d.id}">Drill</button><button type="button" class="small ghost" data-del="${d.id}" aria-label="Delete ${esc(d.name)}">${g('close')}</button></div>`).join('')}`).join('')}</div>` : '<p class="muted">No saved drills yet. Build one above and press Save.</p>'}</section>`;
    $$('.b-chips').forEach(box => {
      const key = box.dataset.group, set = key === 'ups' ? st.ups : st.cells, list = key === 'ups' ? UPS.map(u => [u]) : { hard: HARD, soft: SOFT, pairs: PAIRS }[key];
      $$('.b-chip', box).forEach(b => b.onclick = () => { const v = key === 'ups' ? Number(b.dataset.v) : b.dataset.v; set.has(v) ? set.delete(v) : set.add(v); keep(); paint(); });
      $('[data-all]', box).onclick = () => { list.forEach(([v]) => set.add(v)); keep(); paint(); };
      $('[data-none]', box).onclick = () => { list.forEach(([v]) => set.delete(v)); keep(); paint(); };
    });
    $$('[data-seg]').forEach(b => b.onclick = () => { st[b.dataset.seg] = b.dataset.seg === 'size' ? Number(b.dataset.v) : b.dataset.v; keep(); paint(); });
    $('#b-go').onclick = () => play(spec(), 'Custom drill');
    $('#b-save').onclick = async () => {
      if (!pro) { paywall(ctx, 'Save and tag your own drills with Pro.'); return; }
      const name = $('#b-name').value.trim(); if (!name) { ctx.toast('Give the drill a name first.'); $('#b-name').focus(); return; }
      try { await api('/api/drills', 'POST', { name, tag: $('#b-tag').value.trim(), spec: spec() }); saved = await api('/api/drills'); ctx.toast('Drill saved.'); paint(); } catch (e) { ctx.toast(e.message); }
    };
    $$('[data-run]').forEach(b => b.onclick = () => { const d = saved.drills.find(x => x.id === b.dataset.run); play(d.spec, d.name); });
    $$('[data-del]').forEach(b => b.onclick = async () => { await api('/api/drills/delete', 'POST', { id: b.dataset.del }); saved = await api('/api/drills'); paint(); });
    $$('[data-pack]').forEach(b => b.onclick = () => {
      const p = PACKS.find(x => x.id === b.dataset.pack), i = Number(b.dataset.level);
      if (i > 0 && !pro) { paywall(ctx, 'Every level of every drill pack is part of Pro.'); return; }
      const [title, cells, rules] = p.levels[i];
      play({ cells, rules, size: 15 }, `${p.name} · ${title}`, { pack: `${p.id}:${i}` });
    });
  };
  paint();
}
