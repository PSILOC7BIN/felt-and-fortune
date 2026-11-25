"""Proof of progress: the casino-ready test-out and its public certificate, Rush Battles, Skill Score history,
and the weekly report (page and Monday email).

The test-out is generated, timed, and graded here. A certificate is issued only for a passed attempt and can be
viewed by anyone with its link, showing the username, date, and section scores, never any account details.
"""
import json, math, random, secrets, time
from datetime import date, timedelta
from engine import basic, deviation, hilo, INDICES
from practice_api import ramp

SCHEMA = '''
CREATE TABLE IF NOT EXISTS testouts(id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), month TEXT, state TEXT, results TEXT,
    passed INTEGER DEFAULT 0, finished INTEGER DEFAULT 0, started REAL, ended REAL);
CREATE TABLE IF NOT EXISTS rush_battles(run TEXT PRIMARY KEY, source TEXT);
CREATE TABLE IF NOT EXISTS skill_scores(user_id TEXT REFERENCES users(id), day TEXT, edge REAL, PRIMARY KEY(user_id, day));
'''

GRACE = 2.0
# name, items, seconds per item (deck items add time for the cards), pass mark
SECTIONS = [('count', 2, 15, 2), ('truecount', 8, 6, 7), ('index', 12, 6, 11), ('bet', 6, 6, 5), ('strategy', 15, 5, 14)]
SECTION_NAMES = {'count': 'Running count at casino speed', 'truecount': 'True count conversion', 'index': 'Index plays',
                 'bet': 'Bet ramp (1–12 units)', 'strategy': 'Basic strategy under H17 and surrender'}
FLASH = 0.55             # seconds per card in the count section


def _hard(t, rng):
    opts = [(a, t - a) for a in range(2, 11) if 2 <= t - a <= 10 and a < t - a]
    return list(rng.choice(opts)) if opts else [10, t - 10]


def exam_items(rng):
    items = []
    for sec, n, secs, _ in SECTIONS:
        for _ in range(n):
            if sec == 'count':
                cards = [rng.randint(1, 13) for _ in range(rng.randint(26, 34))]
                items.append({'sec': sec, 'cards': cards, 'flash': FLASH, 'limit': round(len(cards) * FLASH + secs, 1), 'answer': sum(hilo(c) for c in cards)})
            elif sec == 'truecount':
                decks = rng.choice([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]); rc = rng.randint(-14, 22)
                items.append({'sec': sec, 'rc': rc, 'decks': decks, 'limit': secs, 'answer': math.floor(rc / decks)})
            elif sec == 'index':
                t, up, idx, _ = rng.choice(INDICES); cards = [10, 10] if t == 20 else _hard(t, rng); tc = idx + rng.choice([-2, -1, 0, 1, 2])
                acts = ['H', 'S', 'D'] + (['P'] if t == 20 else [])
                items.append({'sec': sec, 'cards': cards, 'dealer': up, 'tc': tc, 'actions': acts, 'limit': secs, 'answer': deviation(cards, up, tc)})
            elif sec == 'bet':
                tc = rng.randint(-3, 12)
                items.append({'sec': sec, 'tc': tc, 'limit': secs, 'answer': ramp(tc, 12)})
            else:
                kind = rng.choice(['hard', 'hard', 'soft', 'pair'])
                cards = _hard(rng.randint(8, 17), rng) if kind == 'hard' else [1, rng.randint(2, 9)] if kind == 'soft' else [rng.randint(1, 10)] * 2
                up = rng.randint(1, 10)
                acts = ['H', 'S', 'D', 'R'] + (['P'] if kind == 'pair' else [])
                items.append({'sec': sec, 'cards': cards, 'dealer': up, 'h17': True, 'surrender': True, 'actions': acts, 'limit': secs,
                              'answer': basic(cards, up, True, True, True, True)})
    return items


def public_item(it, i, total):
    return {k: v for k, v in it.items() if k != 'answer'} | {'i': i, 'total': total, 'section': SECTION_NAMES[it['sec']]}


def grade(state):
    by = {}
    for it, a in zip(state['items'], state['answers']):
        s = by.setdefault(it['sec'], [0, 0]); s[1] += 1; s[0] += int(a['ok'])
    results = [{'sec': sec, 'name': SECTION_NAMES[sec], 'right': by.get(sec, [0, 0])[0], 'of': n, 'need': need, 'passed': by.get(sec, [0, 0])[0] >= need}
               for sec, n, _, need in SECTIONS]
    return results, all(r['passed'] for r in results)


def testout_status(c, uid, today):
    import economy
    month = today[:7]
    used = c.execute('SELECT COUNT(*) FROM testouts WHERE user_id=? AND month=?', (uid, month)).fetchone()[0]
    rows = c.execute('SELECT id, started, results, passed, finished FROM testouts WHERE user_id=? ORDER BY started DESC LIMIT 6', (uid,)).fetchall()
    nxt = (date.fromisoformat(month + '-01') + timedelta(days=32)).replace(day=1).isoformat()
    return {'pro': economy.is_pro(c, uid), 'available': used == 0, 'nextAttempt': nxt if used else None,
            'attempts': [{'id': r['id'], 'day': date.fromtimestamp(r['started']).isoformat(), 'passed': bool(r['passed']), 'finished': bool(r['finished']),
                          'results': json.loads(r['results'] or '[]')} for r in rows],
            'sections': [{'name': SECTION_NAMES[s], 'items': n, 'seconds': secs, 'need': need} for s, n, secs, need in SECTIONS]}


def certificate(c, cid):
    row = c.execute('SELECT testouts.*, users.username FROM testouts JOIN users ON users.id=testouts.user_id WHERE testouts.id=? AND passed=1', (cid,)).fetchone()
    if not row: return None
    return {'id': row['id'], 'username': row['username'], 'day': date.fromtimestamp(row['ended']).isoformat(), 'results': json.loads(row['results'])}


# ---- weekly report --------------------------------------------------------------------------------
def week_bounds(day):
    d = date.fromisoformat(day); start = d - timedelta(days=d.weekday())
    return start.isoformat(), (start - timedelta(days=7)).isoformat()


def report(c, uid, day):
    import economy, learning
    this, last = week_bounds(day)
    def span(a, b):
        xp = c.execute('SELECT COALESCE(SUM(xp),0) FROM xp_log WHERE user_id=? AND day>=? AND day<?', (uid, a, b)).fetchone()[0]
        lessons = c.execute("SELECT COUNT(*) FROM xp_log WHERE user_id=? AND day>=? AND day<? AND lesson_id NOT LIKE 'practice:%' AND lesson_id NOT LIKE 'rush:%' AND lesson_id<>'daily-hand'", (uid, a, b)).fetchone()[0]
        p = c.execute('SELECT COUNT(*) rounds, COALESCE(SUM(questions),0) q, COALESCE(SUM(correct),0) ok, COALESCE(SUM(seconds),0) secs FROM practice_log WHERE user_id=? AND day>=? AND day<?', (uid, a, b)).fetchone()
        daily = c.execute('SELECT COUNT(*), COALESCE(SUM(ok),0) FROM daily_answers WHERE user_id=? AND day>=? AND day<?', (uid, a, b)).fetchone()
        rush = c.execute("SELECT COALESCE(MAX(score),0) FROM rush_runs WHERE user_id=? AND mode='rush' AND finished=1 AND day>=? AND day<?", (uid, a, b)).fetchone()[0]
        storm = c.execute("SELECT COALESCE(MAX(score),0) FROM rush_runs WHERE user_id=? AND mode='storm' AND finished=1 AND day>=? AND day<?", (uid, a, b)).fetchone()[0]
        days = c.execute('SELECT COUNT(DISTINCT day) FROM xp_log WHERE user_id=? AND day>=? AND day<?', (uid, a, b)).fetchone()[0]
        return {'xp': xp, 'lessons': lessons, 'rounds': p['rounds'], 'questions': p['q'], 'accuracy': round(100 * p['ok'] / p['q']) if p['q'] else None,
                'minutes': round(p['secs'] / 60), 'dailyHands': daily[0], 'dailyRight': daily[1], 'rushBest': rush, 'stormBest': storm, 'activeDays': days}
    end = (date.fromisoformat(this) + timedelta(days=7)).isoformat()
    def rating_at(b):
        r = c.execute('SELECT overall FROM rating_log WHERE user_id=? AND day<? ORDER BY day DESC LIMIT 1', (uid, b)).fetchone()
        return r[0] if r else None
    def edge_at(b):
        r = c.execute('SELECT edge FROM skill_scores WHERE user_id=? AND day<? ORDER BY day DESC LIMIT 1', (uid, b)).fetchone()
        return r[0] if r else None
    skills = learning.summary(c, uid, day)['skills']
    return {'week': this, 'this': span(this, end), 'last': span(last, this), 'rating': [rating_at(this), rating_at(end)], 'skillScore': [edge_at(this), edge_at(end)],
            'streak': economy.streak_info(c, uid, day)[0], 'weakest': sorted([s for s in skills if s['n'] >= 5], key=lambda s: s['rating'])[:2],
            'pro': economy.is_pro(c, uid)}


def weekly_emails(c, now=None):
    """Monday morning progress email for Pro members who practiced in the last two weeks and allow progress emails."""
    import account, economy
    now = now or time.time(); lt = time.localtime(now)
    if lt.tm_wday != 0 or lt.tm_hour < 9: return 0
    today = time.strftime('%Y-%m-%d', lt); sent = 0
    last_week_day = (date.fromisoformat(today) - timedelta(days=1)).isoformat()
    for u in c.execute('SELECT DISTINCT users.* FROM users JOIN xp_log ON xp_log.user_id=users.id WHERE xp_log.day>=?', ((date.fromisoformat(today) - timedelta(days=14)).isoformat(),)).fetchall():
        if not economy.is_pro(c, u['id']) or not account.prefs(c, u['id'])['streak_email']: continue
        if not c.execute('INSERT OR IGNORE INTO reminders VALUES(?,?,?,?)', (u['id'], 'weekly', today, now)).rowcount: continue
        r = report(c, u['id'], last_week_day); t = r['this']
        lines = [f"{t['activeDays']} active day{'s' if t['activeDays'] != 1 else ''}, {t['xp']} XP, {t['lessons']} lessons, {t['rounds']} practice rounds."]
        if t['accuracy'] is not None: lines.append(f"Practice accuracy: {t['accuracy']}%.")
        if r['skillScore'][1] is not None: lines.append(f"Skill Score: you play like a {r['skillScore'][1]:.2f}% house edge.")
        if r['weakest']: lines.append('Work on next: ' + ', '.join(s['name'] for s in r['weakest']) + '.')
        account.send(c, u, 'Your week at the table', '\n'.join(lines) + f"\n\nFull report: {account.origin()}/practice/report\n\nDon’t want these? Turn progress emails off: {account.origin()}/profile#notifications", 'weekly'); sent += 1
    return sent


def handle(h, path, method, require, ApiError):
    import economy
    c = h.c; uid = h.user['id']; d = h.data; today = h.client_day()
    # ---- test-out
    if path == '/api/testout' and method == 'GET': return h.send_json(testout_status(c, uid, today))
    if path == '/api/testout/start' and method == 'POST':
        require(economy.is_pro(c, uid), 'The casino-ready test-out is part of Pro.', 402)
        require(testout_status(c, uid, today)['available'], 'You get one test-out attempt a month. Keep practicing for the next one.', 429)
        rng = random.Random(secrets.randbits(32)); items = exam_items(rng)
        state = {'items': items, 'answers': [], 'asked': time.time()}
        tid = secrets.token_hex(10)
        c.execute('INSERT INTO testouts(id,user_id,month,state,started) VALUES(?,?,?,?,?)', (tid, uid, today[:7], json.dumps(state), time.time()))
        return h.send_json({'id': tid, 'item': public_item(items[0], 0, len(items))})
    if path == '/api/testout/answer' and method == 'POST':
        row = c.execute('SELECT * FROM testouts WHERE id=? AND user_id=?', (str(d.get('id', '')), uid)).fetchone()
        require(row and not row['finished'], 'That test-out is over.', 404)
        st = json.loads(row['state']); i = len(st['answers']); it = st['items'][i]
        late = time.time() - st['asked'] > it['limit'] + GRACE
        g = d.get('given')
        if it['sec'] in ('index', 'strategy'): ok = str(g) == it['answer']
        else:
            try: ok = int(g) == it['answer']
            except (TypeError, ValueError): ok = False
        ok = ok and not late
        st['answers'].append({'ok': ok, 'late': late}); st['asked'] = time.time()
        if len(st['answers']) == len(st['items']):
            results, passed = grade(st)
            c.execute('UPDATE testouts SET state=?, results=?, passed=?, finished=1, ended=? WHERE id=?', (json.dumps(st), json.dumps(results), int(passed), time.time(), row['id']))
            return h.send_json({'ok': ok, 'late': late, 'done': True, 'results': results, 'passed': passed, 'certificate': row['id'] if passed else None})
        c.execute('UPDATE testouts SET state=? WHERE id=?', (json.dumps(st), row['id']))
        return h.send_json({'ok': ok, 'late': late, 'done': False, 'item': public_item(st['items'][i + 1], i + 1, len(st['items']))})
    # ---- battles
    if path.startswith('/api/rush/battle/') and method == 'GET':
        src = c.execute('SELECT rush_runs.*, users.username FROM rush_runs JOIN users ON users.id=rush_runs.user_id WHERE rush_runs.id=? AND finished=1', (path.split('/')[-1],)).fetchone()
        require(src, 'That battle doesn’t exist.', 404)
        rows = c.execute('SELECT users.username, rush_runs.score, rush_runs.user_id FROM rush_battles JOIN rush_runs ON rush_runs.id=rush_battles.run JOIN users ON users.id=rush_runs.user_id WHERE rush_battles.source=? AND rush_runs.finished=1 ORDER BY score DESC', (src['id'],)).fetchall()
        return h.send_json({'id': src['id'], 'mode': src['mode'], 'host': src['username'], 'hostScore': src['score'], 'mine': src['user_id'] == uid,
                            'played': any(r['user_id'] == uid for r in rows), 'challengers': [{'username': r['username'], 'score': r['score']} for r in rows]})
    # ---- skill score history
    if path == '/api/skillscore' and method == 'POST':
        edge = float(d.get('edge')); require(-2 <= edge <= 50, 'Invalid score.')
        c.execute('INSERT INTO skill_scores VALUES(?,?,?) ON CONFLICT(user_id,day) DO UPDATE SET edge=excluded.edge', (uid, today, round(edge, 3)))
        return h.send_json({'ok': True})
    if path == '/api/skillscore' and method == 'GET':
        pro = economy.is_pro(c, uid)
        rows = [dict(r) for r in c.execute('SELECT day, edge FROM skill_scores WHERE user_id=? ORDER BY day DESC LIMIT 90', (uid,))][::-1]
        return h.send_json({'pro': pro, 'history': rows if pro else rows[-1:]})
    if path == '/api/report' and method == 'GET': return h.send_json(report(c, uid, today))
    raise ApiError('Endpoint not found.', 404)


def start_battle_run(c, uid, mode, source_id):
    """For arcade.py: the seed to replay, or an error message."""
    import economy
    src = c.execute('SELECT * FROM rush_runs WHERE id=? AND finished=1', (source_id,)).fetchone()
    if not src or src['mode'] != mode: return None, 'That battle doesn’t exist.'
    if src['user_id'] == uid: return None, 'That’s your own run. Send the link to a friend.'
    if not economy.is_pro(c, src['user_id']): return None, 'Battles are hosted by Pro members.'
    if c.execute('SELECT 1 FROM rush_battles JOIN rush_runs ON rush_runs.id=rush_battles.run WHERE source=? AND rush_runs.user_id=?', (source_id, uid)).fetchone():
        return None, 'You already played this battle.'
    return json.loads(src['state'])['seed'], None
