// Casino Directory: a hand-built US map (Census state outlines, no map service) with researched,
// sourced, and dated blackjack rules for each casino.
import { esc, $, $$, Sound, g } from './ui.js';

const FULL = { x: 0, y: 0, w: 975, h: 610 };
const MIN_W = 6;

const ruleText = gm => [
  gm.decks ? `${gm.decks}D` : null, gm.payout, gm.soft17, gm.das === true ? 'DAS' : gm.das === false ? 'no DAS' : null,
  gm.surrender === 'late' ? 'LS' : gm.surrender === 'early' ? 'ES' : null, gm.rsa === true ? 'RSA' : null,
].filter(Boolean).join(' · ');

export function bestGame(c) {
  const known = c.games.filter(gm => gm.edge != null);
  return known.length ? known.reduce((a, b) => (b.edge < a.edge ? b : a)) : c.games[0] || null;
}

const rank = c => (bestGame(c)?.edge ?? 9) + (c.warning ? 5 : 0);

export function grade(c) {
  if (c.warning && /electronic/.test(c.warning)) return 'unknown';
  const b = bestGame(c);
  if (!b || b.edge == null) return c.games.length && c.games.every(gm => gm.payout === '6:5') ? 'poor' : 'unknown';
  return b.edge <= 0.5 ? 'great' : b.edge <= 0.8 ? 'good' : b.edge <= 1.2 ? 'fair' : 'poor';
}
const GRADE_TEXT = { great: 'Great rules', good: 'Good rules', fair: 'Fair rules', poor: 'Poor rules', unknown: 'Rules unverified' };

function freshness(c) {
  if (!c.verified) return { cls: 'stale', text: 'Source undated' };
  const year = +c.verified.slice(0, 4);
  const label = new Date(c.verified.length >= 7 ? c.verified + (c.verified.length === 7 ? '-01' : '') : c.verified + '-01-01').toLocaleDateString('en-US', c.verified.length >= 7 ? { month: 'short', year: 'numeric' } : { year: 'numeric' });
  return year >= 2025 ? { cls: 'fresh', text: `Checked ${label}` } : { cls: 'stale', text: `Reported ${label}: may have changed` };
}

export function createDirectory(ctx) {
  let map = null, data = null;
  async function load() {
    if (!map) [map, data] = await Promise.all([fetch('/us-map.json').then(r => r.json()), ctx.api('/api/casinos')]);
  }

  return async function directoryPage() {
    await load();
    const page = $('#page');
    const states = [...new Set(data.casinos.map(c => c.state))].sort();
    const f = { q: '', state: '', good: false, s17: false, ls: false };
    let view = { ...FULL }, focus = null, selected = null, anim = 0;

    page.innerHTML = `<div class="dir">
      <header class="dir-head"><div><h1>Casino Directory</h1><p class="muted">${data.casinos.length} casinos in ${states.length} states, with the blackjack rules each source reported and when. Rules change often: always confirm at the table.</p></div>
        <div class="dir-legend" aria-label="Pin colors">${['great', 'good', 'fair', 'poor', 'unknown'].map(k => `<span><i class="pin-dot ${k}"></i>${GRADE_TEXT[k]}</span>`).join('')}</div></header>
      <div class="dir-filters">
        <label class="dir-search">${g('search')}<input id="dir-q" type="search" placeholder="Search casinos or cities" aria-label="Search casinos or cities"></label>
        <select id="dir-state" aria-label="State"><option value="">All states</option>${states.map(s => `<option>${s}</option>`).join('')}</select>
        <button type="button" class="chip-toggle" data-f="good" aria-pressed="false">3:2 only</button>
        <button type="button" class="chip-toggle" data-f="s17" aria-pressed="false">Dealer stands on soft 17</button>
        <button type="button" class="chip-toggle" data-f="ls" aria-pressed="false">Surrender</button>
      </div>
      <div class="dir-body">
        <div class="dir-map-wrap"><svg id="dir-map" class="dir-map" role="img" aria-label="Map of the United States with casino pins"><g class="states"></g><path class="borders"></path><g class="pins"></g></svg>
          <div class="dir-map-tools"><button type="button" class="icon-btn" id="dir-out" aria-label="Zoom out">−</button><button type="button" class="icon-btn" id="dir-reset" aria-label="Show the whole country">${g('home')}</button></div>
          <p class="dir-hint muted" id="dir-hint">Tap a state or a cluster to zoom in.</p></div>
        <aside class="dir-list" id="dir-list" aria-live="polite"></aside>
      </div>
      <p class="dir-foot muted">Sources: rule surveys and casino pages listed on each casino, plus state outlines from the US Census Bureau. House edges marked ≈ are estimates from the rules. Educational information only.</p>
    </div>`;

    const svg = $('#dir-map');
    $('.states', svg).innerHTML = map.states.map(s => `<path d="${s.d}" data-id="${s.id}" data-name="${esc(s.name)}" class="state"></path>`).join('');
    $('.borders', svg).setAttribute('d', map.borders);
    const abbr = Object.fromEntries(data.casinos.map(c => [c.state, true]));
    const NAME_TO_ABBR = { Nevada: 'NV', 'New Jersey': 'NJ', Connecticut: 'CT', Pennsylvania: 'PA', 'New York': 'NY', Massachusetts: 'MA', Maryland: 'MD', Delaware: 'DE', Mississippi: 'MS', Louisiana: 'LA', Michigan: 'MI', Indiana: 'IN', Illinois: 'IL', Missouri: 'MO', Oklahoma: 'OK', Florida: 'FL', California: 'CA', Arizona: 'AZ', Colorado: 'CO', 'New Mexico': 'NM', Washington: 'WA', Iowa: 'IA', Ohio: 'OH', Kansas: 'KS', 'West Virginia': 'WV', 'Rhode Island': 'RI', Maine: 'ME', 'New Hampshire': 'NH', Oregon: 'OR', Minnesota: 'MN', Wisconsin: 'WI', 'South Dakota': 'SD', 'North Carolina': 'NC', Tennessee: 'TN', Arkansas: 'AR', Texas: 'TX', Alabama: 'AL', Georgia: 'GA', Kentucky: 'KY', Virginia: 'VA', Montana: 'MT', Idaho: 'ID', Wyoming: 'WY', Utah: 'UT', Nebraska: 'NE', 'North Dakota': 'ND', 'South Carolina': 'SC', Vermont: 'VT', Hawaii: 'HI', Alaska: 'AK', 'District of Columbia': 'DC' };
    const ABBR_NAME = Object.fromEntries(Object.entries(NAME_TO_ABBR).map(([n, a]) => [a, n]));
    $$('.state', svg).forEach(p => { if (abbr[NAME_TO_ABBR[p.dataset.name]]) p.classList.add('has'); });

    const match = c => {
      if (f.state && c.state !== f.state) return false;
      if (f.q && !`${c.name} ${c.city} ${c.state}`.toLowerCase().includes(f.q)) return false;
      if (f.good && !c.games.some(gm => gm.payout === '3:2')) return false;
      if (f.s17 && !c.games.some(gm => gm.soft17 === 'S17')) return false;
      if (f.ls && !c.games.some(gm => gm.surrender === 'late' || gm.surrender === 'early')) return false;
      return c.x != null;
    };
    const inView = c => c.x >= view.x && c.x <= view.x + view.w && c.y >= view.y && c.y <= view.y + view.h;

    function setView(target, animate = true) {
      cancelAnimationFrame(anim);
      const from = { ...view }, t0 = performance.now(), dur = animate && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 420 : 0;
      const step = now => {
        const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
        view = { x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e };
        svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
        drawPins();
        if (k < 1) anim = requestAnimationFrame(step); else { drawList(); }
      };
      anim = requestAnimationFrame(step);
    }
    function fit(x0, y0, x1, y1, pad = .18) {
      let w = Math.max(MIN_W, (x1 - x0) * (1 + pad * 2)), h = Math.max(MIN_W * FULL.h / FULL.w, (y1 - y0) * (1 + pad * 2));
      if (w / h > FULL.w / FULL.h) h = w * FULL.h / FULL.w; else w = h * FULL.w / FULL.h;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      return { x: cx - w / 2, y: cy - h / 2, w, h };
    }

    function clusters() {
      const k = view.w / svg.clientWidth || view.w / FULL.w, r = 30 * k, out = [];
      for (const c of data.casinos.filter(match)) {
        const near = out.find(cl => Math.hypot(cl.x - c.x, cl.y - c.y) < r);
        if (near) { near.items.push(c); near.x = near.items.reduce((s, i) => s + i.x, 0) / near.items.length; near.y = near.items.reduce((s, i) => s + i.y, 0) / near.items.length; }
        else out.push({ x: c.x, y: c.y, items: [c] });
      }
      return { out, k };
    }
    function drawPins() {
      const { out, k } = clusters();
      $('.pins', svg).innerHTML = out.map((cl, i) => {
        if (cl.items.length === 1) {
          const c = cl.items[0];
          return `<g class="pin ${grade(c)} ${selected === c.id ? 'sel' : ''}" data-id="${c.id}" transform="translate(${cl.x} ${cl.y}) scale(${k})" tabindex="0" role="button" aria-label="${esc(c.name)}, ${esc(c.city)}"><circle r="${selected === c.id ? 9 : 7}"></circle></g>`;
        }
        return `<g class="cluster" data-cluster="${i}" transform="translate(${cl.x} ${cl.y}) scale(${k})" tabindex="0" role="button" aria-label="${cl.items.length} casinos, zoom in"><circle r="${12 + Math.min(10, cl.items.length)}"></circle><text dy="4">${cl.items.length}</text></g>`;
      }).join('');
      $$('.pin', svg).forEach(p => { p.onclick = e => { e.stopPropagation(); open(p.dataset.id); }; p.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(p.dataset.id); } }; });
      $$('.cluster', svg).forEach(el => {
        const go = e => { e.stopPropagation(); const cl = out[+el.dataset.cluster]; Sound.play('tap'); const xs = cl.items.map(c => c.x), ys = cl.items.map(c => c.y); setView(fit(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), .6)); };
        el.onclick = go; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') go(e); };
      });
    }

    function card(c) {
      const b = bestGame(c), fr = freshness(c), gr = grade(c);
      return `<button type="button" class="dir-card ${selected === c.id ? 'sel' : ''}" data-id="${c.id}"><span class="pin-dot ${gr}"></span><span class="dir-card-copy"><strong>${esc(c.name)}</strong><small>${esc(c.city)}, ${c.state}</small>
        ${b ? `<span class="dir-best">Best: ${esc(ruleText(b) || b.name)}${b.edge != null ? ` · ${b.edgeSource === 'estimate' ? '≈' : ''}${b.edge.toFixed(2)}%` : ''}${b.min ? ` · ${esc(b.min.split(' ')[0])}` : ''}</span>` : ''}
        ${c.warning ? '<span class="fresh stale">Sources disagree</span>' : `<span class="fresh ${fr.cls}">${fr.text}</span>`}</span></button>`;
    }
    function drawList() {
      if (selected) return drawDetail();
      const rows = data.casinos.filter(c => match(c) && inView(c)).sort((a, b) => rank(a) - rank(b));
      const where = focus ? ABBR_NAME[focus] || focus : view.w < FULL.w * .95 ? 'this area' : 'the US';
      $('#dir-list').innerHTML = `<div class="dir-list-head"><strong>${rows.length} casino${rows.length === 1 ? '' : 's'}</strong><span class="muted"> in ${esc(where)}, best rules first</span></div>
        ${rows.length ? rows.map(card).join('') : '<p class="muted">No casinos match. Try clearing a filter or zooming out.</p>'}`;
      $$('.dir-card', $('#dir-list')).forEach(b => b.onclick = () => open(b.dataset.id));
    }
    function drawDetail() {
      const c = data.casinos.find(x => x.id === selected); if (!c) { selected = null; return drawList(); }
      const fr = freshness(c), native = !!window.FF_NATIVE;
      const cell = v => v === true ? 'Yes' : v === false ? 'No' : '<span class="muted">?</span>';
      $('#dir-list').innerHTML = `<div class="dir-detail"><button type="button" class="ghost small" id="dir-back">${g('back')} All casinos</button>
        <h2>${esc(c.name)}</h2><p class="muted">${esc(c.address)}, ${esc(c.city)}, ${c.state} ${esc(c.zip)}</p>
        <p><span class="badge ${grade(c)}">${GRADE_TEXT[grade(c)]}</span> <span class="fresh ${fr.cls}">${fr.text}</span></p>
        ${c.warning ? `<p class="dir-warn">${g('shield')} ${esc(c.warning)}</p>` : ''}
        ${c.update ? `<p class="dir-update"><strong>Latest report:</strong> ${esc(c.update)}</p>` : ''}
        ${c.special ? `<p class="muted small"><strong>Specialty games:</strong> ${esc(c.special)}</p>` : ''}
        <div class="table-wrap"><table class="dir-games"><thead><tr><th>Game</th><th>Decks</th><th>Pays</th><th>Soft 17</th><th>DAS</th><th>Surr.</th><th>Edge</th><th>Limits</th></tr></thead><tbody>
        ${c.games.map(gm => `<tr><td>${esc(gm.name)}${gm.notes ? `<small class="muted">${esc(gm.notes)}</small>` : ''}</td><td>${gm.decks ?? '?'}</td><td class="${gm.payout === '6:5' ? 'bad' : ''}">${gm.payout || '?'}</td><td>${gm.soft17 || '?'}</td><td>${cell(gm.das)}</td><td>${gm.surrender === 'none' ? 'No' : gm.surrender ? 'Yes' : '?'}</td><td>${gm.edge != null ? `${gm.edgeSource === 'estimate' ? '≈' : ''}${gm.edge.toFixed(2)}%` : '?'}</td><td>${esc([gm.min, gm.max].filter(Boolean).join(' – ') || '?')}</td></tr>`).join('')}
        </tbody></table></div>
        <p class="muted small">“?” means no current source confirmed it. A 6:5 payout costs about 1.4% more than 3:2.</p>
        <h3>Sources</h3><ul class="dir-sources">${c.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(new URL(s.url).hostname.replace(/^www\./, ''))}</a>${s.date ? ` <span class="muted">(${esc(s.date)})</span>` : ''}</li>`).join('') || '<li class="muted">No public source; rules unverified.</li>'}</ul>
        ${c.website && !native ? `<p class="muted small">Casino site: ${esc(new URL(c.website).hostname)}</p>` : ''}
        <h3>Player reports</h3><div id="player-reports" class="muted small">Loading…</div>
        <div class="flex"><a class="button" href="/community/reports?new=${encodeURIComponent(c.name)}&city=${encodeURIComponent(c.city + ', ' + c.state)}">Add a player report</a><a class="button primary" href="/practice/strategy" data-link>Practice basic strategy</a></div></div>`;
      ctx.api('/api/records?kind=casino').then(({ records }) => {
        const key = s => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const mine = records.filter(r => { const a = key(r.body.name || ''), b = key(c.name); return a && (a.includes(b) || b.includes(a)); });
        $('#player-reports').innerHTML = mine.length ? mine.map(r => `<a class="report-row" href="/community/reports?casino=${r.id}"><strong>${esc(r.body.heat || 'Unknown')} heat</strong> · ${esc((r.body.rules || '').slice(0, 90))}<small>${esc(r.username)} · ${new Date(r.updated * 1000).toLocaleDateString()}</small></a>`).join('') : 'No player reports yet. Been here lately? Add what you saw.';
      }).catch(() => { $('#player-reports').textContent = ''; });
      $('#dir-back').onclick = () => { selected = null; Sound.play('tap'); drawPins(); drawList(); };
    }
    function open(id) {
      selected = id; Sound.play('select');
      drawList();
      const c = data.casinos.find(x => x.id === id);
      if (c && view.w > 120) setView(fit(c.x - 10, c.y - 6, c.x + 10, c.y + 6, 0)); else { drawPins(); drawList(); }
      $('#dir-list').scrollTop = 0;
    }

    svg.addEventListener('click', e => {
      const st = e.target.closest('.state.has'); if (!st) return;
      const b = st.getBBox(); focus = NAME_TO_ABBR[st.dataset.name]; selected = null; Sound.play('tap');
      setView(fit(b.x, b.y, b.x + b.width, b.y + b.height, .06));
    });
    $('#dir-reset').onclick = () => { focus = null; selected = null; setView({ ...FULL }); };
    $('#dir-out').onclick = () => { const w = Math.min(FULL.w, view.w * 2.5), h = w * FULL.h / FULL.w; selected = null; setView(w >= FULL.w ? { ...FULL } : { x: view.x + view.w / 2 - w / 2, y: view.y + view.h / 2 - h / 2, w, h }); };
    $('#dir-q').oninput = e => { f.q = e.target.value.trim().toLowerCase(); selected = null; drawPins(); drawList(); };
    $('#dir-state').onchange = e => {
      f.state = e.target.value; selected = null;
      const pts = data.casinos.filter(c => c.state === f.state && c.x != null);
      if (pts.length) { focus = f.state; const xs = pts.map(c => c.x), ys = pts.map(c => c.y); setView(fit(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), .4)); } else { focus = null; setView({ ...FULL }); }
    };
    $$('.chip-toggle').forEach(b => b.onclick = () => { f[b.dataset.f] = !f[b.dataset.f]; b.setAttribute('aria-pressed', String(f[b.dataset.f])); Sound.play('tick'); drawPins(); drawList(); });
    const ro = new ResizeObserver(() => drawPins()); ro.observe(svg); ctx.onCleanup(() => ro.disconnect());
    svg.setAttribute('viewBox', `${FULL.x} ${FULL.y} ${FULL.w} ${FULL.h}`);
    const want = new URLSearchParams(location.search).get('casino');
    drawPins(); drawList();
    if (want && data.casinos.some(c => c.id === want)) open(want);
  };
}
