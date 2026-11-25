"""Build content/casinos.json for the Game Directory from the researched casino notes.

Reads the JSON blocks in research_notes/US casino blackjack rules/*.md, normalizes each game's rules,
estimates the house edge where the source did not give one, checks coordinates against OpenStreetMap
(Nominatim, cached in scripts/geocode_cache.json, at most one request a second), and writes a compact
dataset the website and the apps both ship with.

    python scripts/build_casinos.py            # uses the geocode cache, looks up anything new
    python scripts/build_casinos.py --offline  # no network; keeps researched coordinates
"""
import json, math, re, sys, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NOTES = ROOT / 'research_notes' / 'US casino blackjack rules'
CACHE = ROOT / 'scripts' / 'geocode_cache.json'
OUT = ROOT / 'content' / 'casinos.json'   # served only to Pro members through /api/casinos
UA = 'FeltAndFortune-directory-builder/1.0'


def flag(v):
    """True/False for yes/no fields; None when unverified or unknown."""
    if isinstance(v, bool): return v
    if isinstance(v, (int, float)): return bool(v)
    s = str(v or '').strip().lower()
    if s.startswith(('yes', 'true', 'allowed', 'late', 'ls')): return True
    if s.startswith(('no', 'false', 'none', 'not')): return False
    return None


def surrender(v):
    s = str(v or '').lower()
    if 'early' in s and 'late' not in s: return 'early'
    if 'late' in s or s in ('ls', 'yes', 'true', '1'): return 'late'
    if s.startswith(('no', 'none', 'false', '0')): return 'none'
    return None


def decks(v):
    m = re.search(r'\d+', str(v or ''))
    return int(m[0]) if m else None


def payout(v):
    s = str(v or '')
    return '6:5' if '6:5' in s else '3:2' if '3:2' in s else ('1:1' if '1:1' in s else None)


def soft17(v):
    s = str(v or '').upper()
    return 'H17' if 'H17' in s else 'S17' if 'S17' in s else None


def double_rule(v):
    s = str(v or '').lower()
    if re.search(r'10\s*[-–&,]\s*11|10 or 11|10/11', s): return '10-11'
    if re.search(r'9\s*[-–]\s*11|9, 10', s): return '9-11'
    if 'any' in s: return 'any'
    return None


def edge(g):
    """Approximate house edge (%) from standard rule adjustments; None when key rules are unknown."""
    if g['decks'] is None or g['soft17'] is None or g['payout'] is None: return None
    e = {1: -0.48, 2: -0.19, 4: -0.06, 5: -0.03, 6: 0.0, 8: 0.02}.get(g['decks'], 0.0) + 0.40
    if g['soft17'] == 'H17': e += 0.20
    if g['das'] is False: e += 0.14
    if g['surrender'] == 'late': e -= 0.09 if g['soft17'] == 'H17' else 0.07
    if g['rsa']: e -= 0.08
    if g['double'] == '10-11': e += 0.18
    elif g['double'] == '9-11': e += 0.09
    if g['payout'] == '6:5': e += 1.39
    elif g['payout'] == '1:1': e += 2.27
    return round(e, 2)


def money(v):
    s = str(v or '')
    if 'unverified' in s.lower() or not re.search(r'\d', s): return None
    return s.strip()


def latest(dates):
    """The most recent YYYY, YYYY-MM or YYYY-MM-DD found in the source dates."""
    pat = r'(?:19|20)\d\d(?:-\d\d(?:-\d\d)?)?'
    # A page that was updated without re-checking these rows only counts for its first (survey) date.
    found = [m for d in dates for m in (re.findall(pat, d)[:1] if re.search(r'not re-?verified|not rechecked', d, re.I) else re.findall(pat, d))]
    return max(found, key=lambda x: (x + '-00-00')[:10]) if found else None


def caveat(r):
    """A short warning when sources disagree or live blackjack itself is unconfirmed."""
    text = ' '.join(str(r.get(k) or '') for k in ('status', 'rules_update_2026', 'notes'))
    low = text.lower()
    if 'electronic only' in low or 'live blackjack unverified' in low: return 'A 2026 source says this casino may now have electronic blackjack only.'
    if 'conflict' in low or 'contradict' in low or 'may no longer' in low: return 'Sources disagree on some rules here. Treat them as unconfirmed.'
    return None


def slug(name, city):
    return re.sub(r'[^a-z0-9]+', '-', f'{name} {city}'.lower()).strip('-')


def load_notes():
    out = []
    for f in sorted(NOTES.glob('*.md')):
        text = f.read_text(encoding='utf-8')
        for block in re.findall(r'```json\s*(.*?)```', text, re.S):
            try: data = json.loads(block)
            except json.JSONDecodeError as e: print(f'skip block in {f.name}: {e}'); continue
            if isinstance(data, list): out += [dict(r, _region=f.stem) for r in data if isinstance(r, dict) and r.get('name')]
    return out


def geocode(rec, cache, offline):
    key = f"{rec['name']}|{rec.get('address','')}|{rec['city']}|{rec['state']}"
    if key in cache: return cache[key]
    if offline: return None
    hit = None
    for q in (f"{rec.get('address','')}, {rec['city']}, {rec['state']} {rec.get('zip','')}", f"{rec['name']}, {rec['city']}, {rec['state']}"):
        url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q, 'format': 'json', 'limit': 1, 'countrycodes': 'us'})
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=20) as r:
                res = json.load(r)
        except Exception as e:
            print('geocode failed', rec['name'], e); res = []
        time.sleep(1.1)
        if res: hit = {'lat': float(res[0]['lat']), 'lng': float(res[0]['lon'])}; break
    cache[key] = hit
    return hit


def km(a, b):
    dlat, dlng = math.radians(b[0] - a[0]), math.radians(b[1] - a[1])
    h = math.sin(dlat / 2) ** 2 + math.cos(math.radians(a[0])) * math.cos(math.radians(b[0])) * math.sin(dlng / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(h))


def main():
    offline = '--offline' in sys.argv
    cache = json.loads(CACHE.read_text(encoding='utf-8')) if CACHE.exists() else {}
    casinos, seen = [], set()
    for r in load_notes():
        status = str(r.get('status', '')).lower()
        if any(w in status for w in ('closed', 'demolished', 'imploded', 'excluded')): continue
        cid = slug(r['name'], r.get('city', ''))
        if cid in seen: continue
        seen.add(cid)
        games = []
        for g in r.get('games') or []:
            n = {'name': str(g.get('name', 'Blackjack')).strip(), 'decks': decks(g.get('decks')), 'payout': payout(g.get('bj_payout')),
                 'soft17': soft17(g.get('soft17')), 'double': double_rule(g.get('double')), 'das': flag(g.get('das')),
                 'surrender': surrender(g.get('surrender')), 'rsa': flag(g.get('rsa')), 'min': money(g.get('min_bet')),
                 'max': money(g.get('max_bet')), 'csm': flag(g.get('csm')), 'notes': str(g.get('notes') or '').strip()[:240]}
            given = re.search(r'(\d+\.\d+)\s*%', str(g.get('house_edge') or ''))
            n['edge'] = float(given[1]) if given else edge(n)
            n['edgeSource'] = 'source' if given else ('estimate' if n['edge'] is not None else None)
            games.append(n)
        lat, lng = r.get('lat'), r.get('lng')
        geo = geocode(r, cache, offline)
        located = 'researched'
        if geo and isinstance(lat, (int, float)) and km((lat, lng), (geo['lat'], geo['lng'])) < 25: lat, lng, located = geo['lat'], geo['lng'], 'openstreetmap'
        elif geo and not isinstance(lat, (int, float)): lat, lng, located = geo['lat'], geo['lng'], 'openstreetmap'
        if not isinstance(lat, (int, float)): continue
        dates = [str(d) for d in (r.get('source_dates') or []) if d]
        urls = [str(u) for u in (r.get('source_urls') or []) if str(u).startswith('http')]
        casinos.append({'id': cid, 'name': r['name'], 'address': r.get('address', ''), 'city': r.get('city', ''), 'state': r.get('state', ''),
                        'zip': str(r.get('zip', '')), 'lat': round(lat, 5), 'lng': round(lng, 5), 'located': located,
                        'website': r.get('website') if str(r.get('website', '')).startswith('https://') else None,
                        'status': r.get('status', ''), 'region': r['_region'], 'sources': [{'url': u, 'date': dates[i] if i < len(dates) else None} for i, u in enumerate(urls)],
                        'verified': latest(dates), 'update': str(r.get('rules_update_2026') or '').strip() or None,
                        'special': str(r.get('special_games') or '').strip() or None, 'warning': caveat(r), 'games': games})
    CACHE.write_text(json.dumps(cache, indent=1, sort_keys=True), encoding='utf-8')
    casinos.sort(key=lambda c: (c['state'], c['city'], c['name']))
    OUT.write_text(json.dumps({'built': time.strftime('%Y-%m-%d'), 'casinos': casinos}, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'{len(casinos)} casinos, {sum(len(c["games"]) for c in casinos)} games, '
          f'{sum(c["located"] == "openstreetmap" for c in casinos)} located via OpenStreetMap -> {OUT}')


if __name__ == '__main__':
    main()
