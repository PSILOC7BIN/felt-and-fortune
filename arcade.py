"""Daily Hand and Rush: short, replayable formats graded on the server.

Daily Hand: everyone gets the same hard decision each day, answers once, then sees how the community split.
Rush: three strikes and a shrinking clock. Blackjack Rush asks for the right play as hands get harder (hard,
soft, pairs, rule changes, then index plays at a true count). Count Storm adds a few cards at a time and asks for the
running count. Questions are generated and timed here, so scores and leaderboards can be trusted.

Responsible design: scores count correct decisions and speed only, never chips or money, and free runs are limited.
"""
import json, random, secrets, time
from datetime import date, timedelta
from engine import basic, deviation, hilo, total, INDICES

SCHEMA = '''
CREATE TABLE IF NOT EXISTS daily_answers(user_id TEXT REFERENCES users(id), day TEXT, given TEXT, ok INTEGER, created REAL, PRIMARY KEY(user_id, day));
CREATE TABLE IF NOT EXISTS rush_runs(id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), mode TEXT, day TEXT, score INTEGER DEFAULT 0,
    strikes INTEGER DEFAULT 0, finished INTEGER DEFAULT 0, state TEXT, started REAL, ended REAL);
CREATE INDEX IF NOT EXISTS rush_by_mode ON rush_runs(mode, finished, score);
CREATE TABLE IF NOT EXISTS custom_drills(id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), name TEXT, tag TEXT, spec TEXT, created REAL);
'''

ACT = {'H': 'Hit', 'S': 'Stand', 'D': 'Double', 'P': 'Split', 'R': 'Surrender'}
STRIKES = 3
FREE_RUNS = 1            # per mode per day for free members
GRACE = 1.5              # seconds of network slack on the clock

# ---- Daily Hand -------------------------------------------------------------------------------
# Hands people get wrong: (cards, dealer, rules). One per day, cycling in a fixed shuffled order.
DAILY = [
    ([10, 6], 10, {}), ([10, 2], 3, {}), ([1, 7], 9, {}), ([1, 7], 2, {'h17': True}), ([1, 8], 6, {'h17': True}),
    ([9, 9], 7, {}), ([8, 8], 1, {'h17': True, 'surrender': True}), ([6, 5], 1, {'h17': True}), ([10, 5], 10, {'surrender': True}),
    ([4, 4], 5, {}), ([7, 5, 4], 10, {}), ([1, 2, 4], 3, {}), ([2, 2], 2, {}), ([1, 6], 2, {}), ([10, 3], 2, {}),
    ([9, 3], 4, {}), ([6, 6], 2, {}), ([1, 3], 4, {}), ([5, 4], 2, {}), ([5, 5], 9, {}), ([3, 3], 8, {}), ([7, 7], 8, {}),
    ([9, 7], 9, {'surrender': True}), ([1, 1], 1, {}), ([10, 10], 6, {}), ([2, 9], 1, {}), ([1, 4], 4, {}), ([9, 9], 1, {}),
    ([6, 4, 2], 4, {}), ([3, 2, 1, 1], 7, {}), ([1, 5], 3, {}), ([8, 8], 10, {}), ([5, 4], 7, {}), ([6, 6], 7, {}),
]
_ORDER = list(range(len(DAILY))); random.Random(21).shuffle(_ORDER)


def daily_hand(day):
    n = (date.fromisoformat(day) - date(2026, 1, 1)).days
    cards, dealer, rules = DAILY[_ORDER[n % len(DAILY)]]
    r = {'h17': False, 'surrender': False, 'das': True, **rules}
    answer = basic(cards, dealer, r['h17'], r['das'], r['surrender'] and len(cards) == 2, True)
    acts = ['H', 'S'] + (['D'] if len(cards) == 2 else []) + (['P'] if len(cards) == 2 and min(cards[0], 10) == min(cards[1], 10) else []) + (['R'] if r['surrender'] and len(cards) == 2 else [])
    return {'day': day, 'cards': cards, 'dealer': dealer, 'rules': r, 'actions': acts, 'answer': answer}


def daily_split(c, day):
    rows = dict(c.execute('SELECT given, COUNT(*) FROM daily_answers WHERE day=? GROUP BY given', (day,)).fetchall())
    n = sum(rows.values())
    return {'n': n, 'split': {k: round(100 * v / n) for k, v in rows.items()} if n else {}}


def daily_streak(c, uid, day):
    days = {r[0] for r in c.execute('SELECT day FROM daily_answers WHERE user_id=?', (uid,))}
    d, s = date.fromisoformat(day), 0
    if d.isoformat() not in days: d -= timedelta(days=1)
    while d.isoformat() in days: s += 1; d -= timedelta(days=1)
    return s


# ---- Rush ---------------------------------------------------------------------------------------
def _hard(t, rng):
    opts = [(a, t - a) for a in range(2, 11) if 2 <= t - a <= 10 and a < t - a]
    return list(rng.choice(opts)) if opts else [10, t - 10]


def rush_question(n, rng):
    """Question n (0-based) of a Blackjack Rush run: harder as n grows."""
    rules = {'h17': False, 'surrender': False}
    tc = None
    if n < 5: cards = _hard(rng.randint(8, 17), rng)
    elif n < 10: cards = [1, rng.randint(2, 9)]
    elif n < 15: v = rng.randint(1, 10); cards = [v, v]
    elif n < 22:
        kind = rng.choice(['hard', 'soft', 'pair'])
        cards = _hard(rng.randint(9, 17), rng) if kind == 'hard' else [1, rng.randint(2, 8)] if kind == 'soft' else [rng.randint(1, 10)] * 2
        rules = {'h17': rng.random() < .6, 'surrender': rng.random() < .5}
    else:
        t, up, idx, _ = rng.choice(INDICES)
        cards = [10, 10] if t == 20 else _hard(t, rng); tc = idx + rng.choice([-2, -1, 0, 1, 2])
        dealer = up
        return {'cards': cards, 'dealer': dealer, 'rules': rules, 'tc': tc, 'limit': _limit(n), 'n': n}
    dealer = rng.randint(1, 10)
    return {'cards': cards, 'dealer': dealer, 'rules': rules, 'tc': tc, 'limit': _limit(n), 'n': n}


def _limit(n): return round(max(3.0, 9.0 - 0.2 * n), 1)


def rush_answer(q):
    cards, dealer, r = q['cards'], q['dealer'], q['rules']
    if q.get('tc') is not None: return deviation(cards, dealer, q['tc'])
    return basic(cards, dealer, r['h17'], True, r['surrender'], True)


def storm_question(n, rng, rc):
    k = min(6, 2 + n // 4)
    cards = [rng.randint(1, 13) for _ in range(k)]
    return {'cards': cards, 'limit': round(max(3.5, 8.0 - 0.15 * n), 1), 'n': n, 'rc_after': rc + sum(hilo(x) for x in cards)}


def public_q(mode, q):
    if mode == 'storm': return {'cards': q['cards'], 'limit': q['limit'], 'n': q['n']}
    acts = ['H', 'S', 'D'] + (['P'] if min(q['cards'][0], 10) == min(q['cards'][1], 10) else []) + (['R'] if q['rules']['surrender'] else [])
    return {'cards': q['cards'], 'dealer': q['dealer'], 'rules': q['rules'], 'tc': q['tc'], 'limit': q['limit'], 'n': q['n'], 'actions': acts}


def week_start(day):
    d = date.fromisoformat(day); return (d - timedelta(days=d.weekday())).isoformat()


def board(c, mode, day, uid):
    wk = week_start(day)
    rows = c.execute('SELECT users.username, MAX(score) best FROM rush_runs JOIN users ON users.id=rush_runs.user_id WHERE mode=? AND finished=1 AND day>=? GROUP BY rush_runs.user_id ORDER BY best DESC, MIN(ended) LIMIT 15', (mode, wk)).fetchall()
    friends = [r[0] for r in c.execute('SELECT friend_id FROM follows WHERE user_id=?', (uid,))] + [uid]
    fr = c.execute(f'SELECT users.username, MAX(score) best FROM rush_runs JOIN users ON users.id=rush_runs.user_id WHERE mode=? AND finished=1 AND rush_runs.user_id IN ({",".join("?" * len(friends))}) GROUP BY rush_runs.user_id ORDER BY best DESC LIMIT 15', (mode, *friends)).fetchall()
    me = c.execute('SELECT COALESCE(MAX(score),0) best, COUNT(*) runs FROM rush_runs WHERE user_id=? AND mode=? AND finished=1', (uid, mode)).fetchone()
    return {'week': [dict(r) for r in rows], 'friends': [dict(r) for r in fr], 'best': me['best'], 'runs': me['runs']}


def runs_today(c, uid, mode, day):
    return c.execute('SELECT COUNT(*) FROM rush_runs WHERE user_id=? AND mode=? AND day=?', (uid, mode, day)).fetchone()[0]


def handle(h, path, method, require, ApiError):
    """Routes for /api/daily and /api/rush. `h` is the request handler (self)."""
    import economy
    c = h.c; uid = h.user['id']; d = h.data; today = h.client_day()
    if path == '/api/daily' and method == 'GET':
        hand = daily_hand(today); row = c.execute('SELECT given, ok FROM daily_answers WHERE user_id=? AND day=?', (uid, today)).fetchone()
        out = {k: hand[k] for k in ('day', 'cards', 'dealer', 'rules', 'actions')}
        out['streak'] = daily_streak(c, uid, today)
        if row: out.update({'given': row['given'], 'ok': bool(row['ok']), 'answer': hand['answer'], **daily_split(c, today)})
        return h.send_json(out)
    if path == '/api/daily/answer' and method == 'POST':
        hand = daily_hand(today); given = str(d.get('given', ''))
        require(given in hand['actions'], 'Choose one of the plays.')
        require(not c.execute('SELECT 1 FROM daily_answers WHERE user_id=? AND day=?', (uid, today)).fetchone(), 'You already answered today’s hand.', 409)
        ok = given == hand['answer']
        c.execute('INSERT INTO daily_answers VALUES(?,?,?,?,?)', (uid, today, given, int(ok), time.time()))
        if ok: c.execute('INSERT INTO xp_log(user_id,day,xp,lesson_id,created) VALUES(?,?,?,?,?)', (uid, today, 5, 'daily-hand', time.time()))
        return h.send_json({'given': given, 'ok': ok, 'answer': hand['answer'], 'xp': 5 if ok else 0, 'streak': daily_streak(c, uid, today), **daily_split(c, today)})

    if path == '/api/rush/board' and method == 'GET':
        from urllib.parse import urlparse, parse_qs
        mode = parse_qs(urlparse(h.path).query).get('mode', ['rush'])[0]
        require(mode in ('rush', 'storm'), 'Unknown mode.')
        pro = economy.is_pro(c, uid)
        return h.send_json({**board(c, mode, today, uid), 'pro': pro, 'left': None if pro else max(0, FREE_RUNS - runs_today(c, uid, mode, today))})
    if path == '/api/rush/start' and method == 'POST':
        mode = str(d.get('mode', 'rush')); require(mode in ('rush', 'storm'), 'Unknown mode.')
        if not economy.is_pro(c, uid):
            require(runs_today(c, uid, mode, today) < FREE_RUNS, 'Free members get one run a day. Pro has unlimited runs.', 402)
        h.throttle('rush', 30)
        seed = secrets.randbits(32); rng = random.Random(seed)
        q = storm_question(0, rng, 0) if mode == 'storm' else rush_question(0, rng)
        state = {'seed': seed, 'n': 0, 'rc': 0, 'q': q, 'asked': time.time(), 'draws': 1}
        rid = secrets.token_hex(10)
        c.execute('INSERT INTO rush_runs(id,user_id,mode,day,state,started) VALUES(?,?,?,?,?,?)', (rid, uid, mode, today, json.dumps(state), time.time()))
        return h.send_json({'id': rid, 'mode': mode, 'q': public_q(mode, q), 'strikes': 0, 'score': 0, 'maxStrikes': STRIKES})
    if path == '/api/rush/answer' and method == 'POST':
        row = c.execute('SELECT * FROM rush_runs WHERE id=? AND user_id=?', (str(d.get('id', '')), uid)).fetchone()
        require(row and not row['finished'], 'That run is over.', 404)
        mode, st = row['mode'], json.loads(row['state']); q = st['q']
        elapsed = time.time() - st['asked']; late = elapsed > q['limit'] + GRACE
        if mode == 'storm':
            try: given = int(d.get('given'))
            except (TypeError, ValueError): given = None
            right = q['rc_after']; st['rc'] = right
        else:
            given = str(d.get('given', '')); right = rush_answer(q)
        ok = not late and given == right
        score, strikes = row['score'] + (1 if ok else 0), row['strikes'] + (0 if ok else 1)
        done = strikes >= STRIKES
        result = {'ok': ok, 'late': late, 'answer': right if mode == 'storm' else ACT[right], 'answerKey': right, 'score': score, 'strikes': strikes, 'done': done}
        if mode != 'storm': result['asked'] = {'cards': q['cards'], 'dealer': q['dealer'], 'rules': q['rules'], 'tc': q['tc']}
        if done:
            c.execute('UPDATE rush_runs SET score=?, strikes=?, finished=1, ended=?, state=? WHERE id=?', (score, strikes, time.time(), json.dumps(st), row['id']))
            best = c.execute('SELECT MAX(score) FROM rush_runs WHERE user_id=? AND mode=? AND finished=1 AND id<>?', (uid, mode, row['id'])).fetchone()[0] or 0
            result.update({'best': max(best, score), 'newBest': score > best})
            if score: c.execute('INSERT INTO xp_log(user_id,day,xp,lesson_id,created) VALUES(?,?,?,?,?)', (uid, row['day'], min(20, score), 'rush:' + mode, time.time()))
            return h.send_json(result)
        rng = random.Random(st['seed'] + st['draws']); st['draws'] += 1; st['n'] += 1
        st['q'] = storm_question(st['n'], rng, st['rc']) if mode == 'storm' else rush_question(st['n'], rng)
        st['asked'] = time.time()
        c.execute('UPDATE rush_runs SET score=?, strikes=?, state=? WHERE id=?', (score, strikes, json.dumps(st), row['id']))
        result['q'] = public_q(mode, st['q'])
        return h.send_json(result)
    if path == '/api/drills' and method == 'GET':
        rows = c.execute('SELECT id, name, tag, spec, created FROM custom_drills WHERE user_id=? ORDER BY created DESC', (uid,)).fetchall()
        return h.send_json({'drills': [{**dict(r), 'spec': json.loads(r['spec'])} for r in rows], 'pro': economy.is_pro(c, uid)})
    if path == '/api/drills' and method == 'POST':
        require(economy.is_pro(c, uid), 'Saving drills is part of Pro.', 402)
        name = str(d.get('name', '')).strip()[:40]; tag = str(d.get('tag', '')).strip()[:20]; spec = d.get('spec')
        require(name, 'Give the drill a name.')
        require(isinstance(spec, dict) and isinstance(spec.get('cells'), list) and 1 <= len(spec['cells']) <= 300, 'Pick at least one hand.')
        require(all(isinstance(x, list) and len(x) == 2 and isinstance(x[0], str) and len(x[0]) <= 4 and x[1] in range(1, 11) for x in spec['cells']), 'Invalid hands.')
        require(c.execute('SELECT COUNT(*) FROM custom_drills WHERE user_id=?', (uid,)).fetchone()[0] < 50, 'You can save up to 50 drills.')
        clean = {'cells': spec['cells'], 'rules': {k: str((spec.get('rules') or {}).get(k, 'off'))[:6] for k in ('h17', 'surrender', 'das')}, 'size': max(5, min(40, int(spec.get('size') or 10)))}
        did = secrets.token_hex(8)
        c.execute('INSERT INTO custom_drills VALUES(?,?,?,?,?,?)', (did, uid, name, tag, json.dumps(clean), time.time()))
        return h.send_json({'id': did}, 201)
    if path == '/api/drills/delete' and method == 'POST':
        c.execute('DELETE FROM custom_drills WHERE id=? AND user_id=?', (str(d.get('id', '')), uid))
        return h.send_json({'ok': True})
    raise ApiError('Endpoint not found.', 404)
