"""Quests: three daily quests (easy, medium, hard), three weekly quests, a weekly "dailies" milestone track,
and a monthly event with a badge and an earn-only card back.

Quests reward learning quality (accuracy, consistency, review), never volume or chip results.
Quests are drawn at random per player per period from fixed pools, with one free daily reroll.
Rewards are fixed and shown up front; nothing is randomized or sold.
"""
import json, random, time
from datetime import date, timedelta

SCHEMA = '''
CREATE TABLE IF NOT EXISTS activity(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT REFERENCES users(id), day TEXT, kind TEXT,
    tool TEXT, questions INTEGER, pct INTEGER, streak INTEGER, created REAL);
CREATE TABLE IF NOT EXISTS quest_picks(user_id TEXT REFERENCES users(id), period TEXT, slot INTEGER, quest TEXT, PRIMARY KEY(user_id, period, slot));
CREATE TABLE IF NOT EXISTS quest_done(user_id TEXT REFERENCES users(id), period TEXT, quest TEXT, day TEXT, PRIMARY KEY(user_id, period, quest));
CREATE TABLE IF NOT EXISTS quest_rerolls(user_id TEXT REFERENCES users(id), day TEXT, PRIMARY KEY(user_id, day));
CREATE TABLE IF NOT EXISTS badges(user_id TEXT REFERENCES users(id), badge TEXT, earned TEXT, PRIMARY KEY(user_id, badge));
'''

TRAINERS = ('strategy', 'count', 'decks', 'truecount', 'index')

# id: (text, goal, metric). Metrics are computed from the activity log for the quest's period.
DAILY = {
    'easy': {
        'lesson1': ('Finish a lesson', 1, 'lessons'),
        'round1': ('Finish a practice round', 1, 'rounds'),
        'acc80': ('Score 80% or better in a practice round', 1, 'rounds80'),
        'review1': ('Replay a lesson you’ve finished', 1, 'replays'),
    },
    'medium': {
        'lessons2': ('Finish 2 lessons', 2, 'lessons'),
        'acc90x2': ('Score 90% or better in 2 practice rounds', 2, 'rounds90'),
        'tools2': ('Practice with 2 different trainers', 2, 'tools'),
        'weak1': ('Clear a Weak Spots round', 1, 'weak'),
        'goal': ('Reach your daily XP goal', 1, 'goal'),
    },
    'hard': {
        'perfect1': ('Finish a lesson with no mistakes', 1, 'perfect'),
        'flawless1': ('Get every answer right in a practice round', 1, 'flawless'),
        'streak15': ('Get 15 answers in a row right in practice', 15, 'beststreak'),
        'acc90x4': ('Score 90% or better in 4 practice rounds', 4, 'rounds90'),
    },
}
DAILY_STARS = {'easy': 5, 'medium': 10, 'hard': 15}
ALL_DAILY_BONUS = 15

WEEKLY = {
    'days5': ('Learn on 5 different days', 5, 'days'),
    'lessons8': ('Finish 8 lessons', 8, 'lessons'),
    'perfect3': ('Finish 3 lessons with no mistakes', 3, 'perfect'),
    'trainers5': ('Practice with all 5 skill trainers', 5, 'tools'),
    'acc90x10': ('Score 90% or better in 10 practice rounds', 10, 'rounds90'),
    'checkpoint1': ('Pass a unit checkpoint', 1, 'checkpoints'),
    'challenge1': ('Finish a Shoe Challenge', 1, 'challenges'),
    'weak3': ('Clear 3 Weak Spots rounds', 3, 'weak'),
}
WEEKLY_STARS = 40
WEEKLY_TRACK = [(5, {'stars': 30}), (10, {'stars': 60, 'freeze': 1}), (15, {'stars': 100, 'energy': 10})]

EVENT_GOAL = 20
EVENTS = {   # month -> event; each event card back can only be earned, never bought.
    1: ('New Year Countdown', 'back-event-newyear', 'Midnight Countdown'),
    2: ('Hearts Are Wild', 'back-event-hearts', 'Wild Hearts'),
    3: ('Lucky Clover Classic', 'back-event-clover', 'Lucky Clover'),
    4: ('Spring Shuffle', 'back-event-spring', 'Spring Bloom'),
    5: ('Derby Days', 'back-event-derby', 'Derby Silks'),
    6: ('Summer Shoe', 'back-event-summer', 'Summer Sunset'),
    7: ('Stars and Stripes', 'back-event-stripes', 'Stars and Stripes'),
    8: ('Neon Nights', 'back-event-neon', 'Neon Nights'),
    9: ('Back to School', 'back-event-school', 'Chalkboard'),
    10: ('Haunted High Card', 'back-event-haunted', 'Haunted Deck'),
    11: ('Harvest Hold ’Em', 'back-event-harvest', 'Harvest Gold'),
    12: ('Winter Wonderdeck', 'back-event-winter', 'Winter Wonderdeck'),
}


def week_start(day):
    d = date.fromisoformat(day); return (d - timedelta(days=d.weekday())).isoformat()


def record(c, uid, day, kind, tool=None, questions=0, pct=0, streak=0):
    c.execute('INSERT INTO activity(user_id,day,kind,tool,questions,pct,streak,created) VALUES(?,?,?,?,?,?,?,?)',
              (uid, day, kind, tool, questions, pct, streak, time.time()))


def metrics(c, uid, start, end, daily_xp=15):
    """Activity counts for days in [start, end)."""
    rows = c.execute('SELECT * FROM activity WHERE user_id=? AND day>=? AND day<?', (uid, start, end)).fetchall()
    rounds = [r for r in rows if r['kind'] == 'practice' and r['questions'] >= 3]
    lessons = [r for r in rows if r['kind'] == 'lesson']
    xp = dict(c.execute('SELECT day, SUM(xp) FROM xp_log WHERE user_id=? AND day>=? AND day<? GROUP BY day', (uid, start, end)).fetchall())
    return {
        'lessons': sum(1 for r in lessons if r['tool'] != 'replay'),
        'replays': sum(1 for r in lessons if r['tool'] == 'replay'),
        'perfect': sum(1 for r in lessons if r['pct'] == 100),
        'rounds': len(rounds),
        'rounds80': sum(1 for r in rounds if r['pct'] >= 80),
        'rounds90': sum(1 for r in rounds if r['pct'] >= 90),
        'flawless': sum(1 for r in rounds if r['pct'] == 100 and r['questions'] >= 5),
        'beststreak': max([r['streak'] for r in rounds] or [0]),
        'tools': len({r['tool'] for r in rounds if r['tool'] in TRAINERS}),
        'weak': sum(1 for r in rows if r['kind'] == 'practice' and r['tool'] == 'weak' and r['pct'] >= 80),
        'checkpoints': sum(1 for r in rows if r['kind'] == 'checkpoint'),
        'challenges': sum(1 for r in rows if r['kind'] == 'challenge'),
        'goal': int(any(v >= daily_xp for v in xp.values())),
        'days': len({r['day'] for r in rows} | set(xp)),
    }


def _pick(c, uid, period, slots):
    """Persisted random picks for a period: slots = list of candidate-id lists, one quest per slot."""
    have = {r['slot']: r['quest'] for r in c.execute('SELECT slot, quest FROM quest_picks WHERE user_id=? AND period=?', (uid, period))}
    rng = random.Random(f'{uid}:{period}')
    chosen = []
    for i, pool in enumerate(slots):
        if i in have: chosen.append(have[i]); continue
        q = rng.choice([p for p in pool if p not in chosen])
        c.execute('INSERT OR IGNORE INTO quest_picks VALUES(?,?,?,?)', (uid, period, i, q)); chosen.append(q)
    return chosen


def board(c, uid, today, daily_xp=15):
    """Everything the Quests tab shows, with progress; also records newly completed quests."""
    tomorrow = (date.fromisoformat(today) + timedelta(days=1)).isoformat()
    wk = week_start(today); wk_end = (date.fromisoformat(wk) + timedelta(days=7)).isoformat()
    month = today[:7]; m = int(today[5:7])
    m_end = (date(int(today[:4]) + (m == 12), m % 12 + 1, 1)).isoformat()

    dm = metrics(c, uid, today, tomorrow, daily_xp)
    wm = metrics(c, uid, wk, wk_end, daily_xp)
    dperiod, wperiod = 'd:' + today, 'w:' + wk

    tiers = ['easy', 'medium', 'hard']
    dpicks = _pick(c, uid, dperiod, [list(DAILY[t]) for t in tiers])
    wpicks = _pick(c, uid, wperiod, [list(WEEKLY)] * 2)
    done = {(r['period'], r['quest']) for r in c.execute('SELECT period, quest FROM quest_done WHERE user_id=? AND period IN (?,?)', (uid, dperiod, wperiod))}

    def item(period, qid, text, goal, metric, stars, tier=None):
        prog = min(goal, (dm if period == dperiod else wm)[metric])
        complete = (period, qid) in done
        if not complete and prog >= goal:
            c.execute('INSERT OR IGNORE INTO quest_done VALUES(?,?,?,?)', (uid, period, qid, today)); complete = True
        return {'id': qid, 'period': period, 'text': text, 'goal': goal, 'progress': prog, 'done': complete, 'stars': stars, 'tier': tier}

    daily = [item(dperiod, q, *DAILY[t][q], DAILY_STARS[t], t) for t, q in zip(tiers, dpicks)]
    weekly = [item(wperiod, q, *WEEKLY[q], WEEKLY_STARS) for q in wpicks]
    claim_keys = {r['quest'] for r in c.execute('SELECT quest FROM quest_claims WHERE user_id=? AND (day=? OR day=?)', (uid, 'q:' + dperiod, 'q:' + wperiod))}
    for q in daily + weekly: q['claimed'] = q['id'] in claim_keys

    # Weekly track: daily quests completed this week.
    dailies_week = c.execute("SELECT COUNT(*) FROM quest_done WHERE user_id=? AND period>=? AND period<? ", (uid, 'd:' + wk, 'd:' + wk_end)).fetchone()[0]
    track = [{'at': at, 'reward': rw, 'reached': dailies_week >= at, 'claimed': f'track-{at}' in claim_keys} for at, rw in WEEKLY_TRACK]
    all_bonus = {'stars': ALL_DAILY_BONUS, 'ready': all(q['done'] for q in daily), 'claimed': 'all-daily' in claim_keys}

    # Monthly event: quests completed this month.
    month_done = c.execute("SELECT COUNT(*) FROM quest_done WHERE user_id=? AND day>=? AND day<?", (uid, month + '-01', m_end)).fetchone()[0]
    name, item_id, back_name = EVENTS[m]
    badge = f'event-{month}'
    has_badge = c.execute('SELECT 1 FROM badges WHERE user_id=? AND badge=?', (uid, badge)).fetchone() is not None
    if month_done >= EVENT_GOAL and not has_badge:
        c.execute('INSERT OR IGNORE INTO badges VALUES(?,?,?)', (uid, badge, today)); has_badge = True
        w = c.execute('SELECT owned FROM wallets WHERE user_id=?', (uid,)).fetchone()
        owned = json.loads((w['owned'] if w else None) or '[]')
        if item_id not in owned:
            owned.append(item_id); c.execute('UPDATE wallets SET owned=? WHERE user_id=?', (json.dumps(owned), uid))
    days_left = (date.fromisoformat(m_end) - date.fromisoformat(today)).days
    rerolled = c.execute('SELECT COUNT(*) FROM quest_rerolls WHERE user_id=? AND day LIKE ?', (uid, today + '%')).fetchone()[0]
    badges = [dict(r) for r in c.execute('SELECT badge, earned FROM badges WHERE user_id=? ORDER BY earned DESC', (uid,))]
    return {'daily': daily, 'weekly': weekly, 'allDaily': all_bonus, 'track': track, 'dailiesThisWeek': dailies_week,
            'rerollsUsed': rerolled, 'weekEnds': wk_end, 'today': today,
            'event': {'name': name, 'month': month, 'goal': EVENT_GOAL, 'progress': min(EVENT_GOAL, month_done), 'badge': badge,
                      'earned': has_badge, 'reward': item_id, 'rewardName': back_name, 'daysLeft': days_left},
            'badges': badges}


def claim(c, uid, today, key, daily_xp, add_stars, wallet_add):
    """key: 'd:<id>', 'w:<id>', 'all-daily', or 'track-<n>'. Returns the reward dict or None."""
    b = board(c, uid, today, daily_xp)
    dperiod, wperiod = 'd:' + today, 'w:' + week_start(today)
    def mark(period, qkey):
        return c.execute('INSERT OR IGNORE INTO quest_claims VALUES(?,?,?)', (uid, 'q:' + period, qkey)).rowcount == 1
    if key.startswith(('d:', 'w:')):
        group = b['daily'] if key[0] == 'd' else b['weekly']
        q = next((q for q in group if q['id'] == key[2:]), None)
        if not q or not q['done'] or q['claimed']: return None
        if not mark(dperiod if key[0] == 'd' else wperiod, q['id']): return None
        add_stars(q['stars'], 'quest-' + q['id']); return {'stars': q['stars']}
    if key == 'all-daily':
        if not b['allDaily']['ready'] or b['allDaily']['claimed'] or not mark(dperiod, 'all-daily'): return None
        add_stars(ALL_DAILY_BONUS, 'quest-all-daily'); return {'stars': ALL_DAILY_BONUS}
    if key.startswith('track-'):
        t = next((t for t in b['track'] if f"track-{t['at']}" == key), None)
        if not t or not t['reached'] or t['claimed'] or not mark(wperiod, key): return None
        rw = t['reward']; add_stars(rw['stars'], 'quest-' + key); wallet_add(rw); return dict(rw)
    return None


def reroll(c, uid, today, slot, allowed=1):
    """Swap one unfinished daily quest for another of the same tier (one a day; Pro gets two)."""
    used = c.execute('SELECT COUNT(*) FROM quest_rerolls WHERE user_id=? AND day LIKE ?', (uid, today + '%')).fetchone()[0]
    if used >= allowed: return False
    period = 'd:' + today
    b = board(c, uid, today)
    if not 0 <= slot < 3 or b['daily'][slot]['done']: return False
    tier = ['easy', 'medium', 'hard'][slot]
    current = b['daily'][slot]['id']
    options = [q for q in DAILY[tier] if q != current]
    new = random.Random(f'{uid}:{today}:reroll{used}').choice(options)
    c.execute('UPDATE quest_picks SET quest=? WHERE user_id=? AND period=? AND slot=?', (new, uid, period, slot))
    c.execute('INSERT INTO quest_rerolls VALUES(?,?)', (uid, today if not used else f'{today}#{used}'))
    return True
