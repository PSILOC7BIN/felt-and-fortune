"""Proof of learning: Elo-style skill ratings per skill, and a Hand Review of the exact decisions a learner missed.

Ratings move after every graded decision: up more for beating hard items, down more for missing easy ones.
Missed decisions are stored with the server-computed right answer so they can be reviewed and retried.
"""
import json, math, time
from engine import basic, deviation, hilo, total
from practice_api import skill_of, grade_item, ramp, BadTranscript

SCHEMA = '''
CREATE TABLE IF NOT EXISTS skill_rating(user_id TEXT REFERENCES users(id), skill TEXT, rating REAL, n INTEGER, updated REAL, PRIMARY KEY(user_id, skill));
CREATE TABLE IF NOT EXISTS rating_log(user_id TEXT REFERENCES users(id), day TEXT, overall REAL, PRIMARY KEY(user_id, day));
CREATE TABLE IF NOT EXISTS mistakes(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT REFERENCES users(id), day TEXT, source TEXT, skill TEXT,
    kind TEXT, data TEXT, given TEXT, answer TEXT, explain TEXT, cleared INTEGER DEFAULT 0, created REAL);
CREATE TABLE IF NOT EXISTS decision_stats(user_id TEXT REFERENCES users(id), cell TEXT, up INTEGER, attempts INTEGER, misses INTEGER, last REAL,
    PRIMARY KEY(user_id, cell, up));
'''

START = 1000
SKILL_NAMES = {'strategy-hard': 'Hard totals', 'strategy-soft': 'Soft totals', 'strategy-pair': 'Pairs', 'count': 'Running count',
               'decks': 'Deck estimation', 'truecount': 'True count', 'index': 'Index plays', 'insurance': 'Insurance', 'bet': 'Bet sizing'}
TIERS = [(1500, 'Expert'), (1300, 'Sharp'), (1100, 'Solid'), (900, 'Learner'), (0, 'Beginner')]
ACTION = {'H': 'Hit', 'S': 'Stand', 'D': 'Double', 'P': 'Split', 'R': 'Surrender', 'Y': 'Take insurance', 'N': 'No insurance'}
FREE_REVIEW = 3   # free learners see their 3 most recent misses; Pro sees the full history


def tier(r): return next(name for floor, name in TIERS if r >= floor)


def difficulty(item):
    """Item difficulty on the rating scale."""
    k, d = item.get('kind'), item.get('data') or {}
    s = skill_of(item)
    base = {'strategy-hard': 1050, 'strategy-soft': 1200, 'strategy-pair': 1200, 'count': 1100, 'decks': 1250,
            'truecount': 1300, 'index': 1450, 'insurance': 1300, 'bet': 1350}.get(s, 1100)
    if k == 'strategy':
        base += 50 * sum(bool(x) for x in (d.get('h17'), d.get('surrender'), d.get('das') is False))
    if k == 'count':
        base += min(200, 8 * len(d.get('cards') or [])) + (100 if d.get('seats') else 0)
    if k == 'truecount':
        decks = d.get('decks')
        if isinstance(decks, (int, float)) and decks != int(decks): base += 80
    return base


def answer_of(item, choices=None):
    """The right answer, in words."""
    k, d = item.get('kind'), item.get('data') or {}
    try:
        if k == 'strategy': return ACTION.get(basic(d['cards'], d['dealer'], h17=bool(d.get('h17')), das=d.get('das', True) is not False, surrender=bool(d.get('surrender'))))
        if k in ('index', 'play'): return ACTION.get(deviation(d['cards'], d['dealer'], d['tc']))
        if k == 'insurance': return ACTION['Y' if d['tc'] >= 3 else 'N']
        if k == 'count': return str(int(d.get('start', 0)) + sum(hilo(c) for c in d['cards']))
        if k == 'decks': return str(d['tray'] if d.get('ask', 'tray') == 'tray' else d['shoe'] - d['tray'])
        if k == 'truecount': return str(math.floor(d['rc'] / d['decks']))
        if k == 'bet': return f"{ramp(d['tc'], d.get('max', 12))} units"
        if k == 'choice':
            opts = d.get('options') or []
            want = (choices or {}).get(d.get('prompt'))
            return str(opts[want]) if isinstance(want, int) and 0 <= want < len(opts) else None
    except (KeyError, TypeError, ZeroDivisionError, IndexError):
        return None
    return None


def given_text(item):
    k, g, d = item.get('kind'), item.get('given'), item.get('data') or {}
    if k in ('strategy', 'index', 'play', 'insurance'): return ACTION.get(g, str(g))
    if k == 'choice':
        opts = d.get('options') or []
        return str(opts[g]) if isinstance(g, int) and 0 <= g < len(opts) else str(g)
    if k == 'truecount' and d.get('timedOut'): return 'Time ran out'
    return '' if g is None else str(g)


def _overall(c, uid):
    rows = c.execute('SELECT rating, n FROM skill_rating WHERE user_id=? AND n>=5', (uid,)).fetchall()
    if not rows: return None
    w = sum(min(r['n'], 60) for r in rows)
    return round(sum(r['rating'] * min(r['n'], 60) for r in rows) / w)


def cell_of(item):
    """The basic-strategy chart cell for a strategy decision: ('H16', 10), ('S18', 9), ('P8', 1)... or None."""
    if item.get('kind') != 'strategy': return None
    d = item.get('data') or {}
    try:
        cards = [min(int(x), 10) for x in d['cards']]; up = min(int(d['dealer']), 10)
        if not 1 <= up <= 10 or len(cards) < 2 or not all(1 <= x <= 10 for x in cards): return None
        if len(cards) == 2 and cards[0] == cards[1]: return ('PA' if cards[0] == 1 else f'P{cards[0]}', up)
        t, soft = total(cards)
        if t > 21: return None
        return (f'S{t}', up) if soft else (f'H{min(max(t, 5), 21)}', up)
    except (KeyError, TypeError, ValueError):
        return None


def weakness(c, uid):
    rows = [dict(r) for r in c.execute('SELECT cell, up, attempts, misses, last FROM decision_stats WHERE user_id=?', (uid,))]
    return {'cells': rows, 'decisions': sum(r['attempts'] for r in rows), 'misses': sum(r['misses'] for r in rows)}


def record(c, uid, items, choices, source, day):
    """Update ratings and store misses for an already-validated transcript."""
    now = time.time(); ratings = {}
    for it in items:
        s = skill_of(it) if it.get('kind') != 'choice' else None
        try: ok = grade_item(it, choices)
        except BadTranscript: continue
        if s:
            if s not in ratings:
                row = c.execute('SELECT rating, n FROM skill_rating WHERE user_id=? AND skill=?', (uid, s)).fetchone()
                ratings[s] = [row['rating'], row['n']] if row else [START, 0]
            r, n = ratings[s]
            expected = 1 / (1 + 10 ** ((difficulty(it) - r) / 400))
            k = 40 if n < 20 else 24 if n < 100 else 16
            ratings[s] = [r + k * ((1 if ok else 0) - expected), n + 1]
        cell = cell_of(it)
        if cell:
            c.execute('INSERT INTO decision_stats VALUES(?,?,?,1,?,?) ON CONFLICT(user_id,cell,up) DO UPDATE SET attempts=attempts+1, misses=misses+excluded.misses, last=excluded.last',
                      (uid, cell[0], cell[1], 0 if ok else 1, now))
        if not ok and not it.get('retry'):
            c.execute('INSERT INTO mistakes(user_id,day,source,skill,kind,data,given,answer,explain,created) VALUES(?,?,?,?,?,?,?,?,?,?)',
                      (uid, day, source, s or 'concept', it.get('kind'), json.dumps(it.get('data') or {}), given_text(it), answer_of(it, choices),
                       str(it.get('explain') or '')[:400], now))
    for s, (r, n) in ratings.items():
        c.execute('INSERT INTO skill_rating VALUES(?,?,?,?,?) ON CONFLICT(user_id,skill) DO UPDATE SET rating=excluded.rating, n=excluded.n, updated=excluded.updated',
                  (uid, s, r, n, now))
    overall = _overall(c, uid)
    if overall is not None:
        c.execute('INSERT INTO rating_log VALUES(?,?,?) ON CONFLICT(user_id,day) DO UPDATE SET overall=excluded.overall', (uid, day, overall))


def summary(c, uid, today):
    rows = {r['skill']: r for r in c.execute('SELECT * FROM skill_rating WHERE user_id=?', (uid,))}
    skills = [{'skill': s, 'name': name, 'rating': round(rows[s]['rating']) if s in rows else None, 'n': rows[s]['n'] if s in rows else 0,
               'tier': tier(rows[s]['rating']) if s in rows and rows[s]['n'] >= 5 else None} for s, name in SKILL_NAMES.items()]
    overall = _overall(c, uid)
    prev = c.execute('SELECT overall FROM rating_log WHERE user_id=? AND day<? ORDER BY day DESC LIMIT 1', (uid, today)).fetchone()
    history = [dict(r) for r in c.execute('SELECT day, overall FROM rating_log WHERE user_id=? ORDER BY day DESC LIMIT 30', (uid,))][::-1]
    return {'overall': overall, 'tier': tier(overall) if overall is not None else None, 'change': round(overall - prev['overall']) if overall is not None and prev else None,
            'skills': skills, 'history': history}


def review(c, uid, pro, skill=None):
    q = 'SELECT * FROM mistakes WHERE user_id=? AND cleared=0' + (' AND skill=?' if skill else '') + ' ORDER BY id DESC LIMIT ?'
    args = [uid] + ([skill] if skill else []) + [50 if pro else FREE_REVIEW]
    rows = [dict(r, data=json.loads(r['data'])) for r in c.execute(q, args)]
    total_open = c.execute('SELECT COUNT(*) FROM mistakes WHERE user_id=? AND cleared=0', (uid,)).fetchone()[0]
    by_skill = {r['skill']: r['n'] for r in c.execute('SELECT skill, COUNT(*) n FROM mistakes WHERE user_id=? AND cleared=0 GROUP BY skill', (uid,))}
    return {'mistakes': rows, 'open': total_open, 'bySkill': by_skill, 'limited': not pro and total_open > FREE_REVIEW, 'freeLimit': FREE_REVIEW}


def retry(c, uid, mistake_id, given):
    row = c.execute('SELECT * FROM mistakes WHERE id=? AND user_id=?', (mistake_id, uid)).fetchone()
    if not row: return None
    item = {'kind': row['kind'], 'data': json.loads(row['data']), 'given': given}
    if row['kind'] == 'choice': return None
    try: ok = grade_item(item)
    except BadTranscript: return None
    if ok: c.execute('UPDATE mistakes SET cleared=1 WHERE id=?', (mistake_id,))
    return {'ok': ok, 'answer': row['answer']}
