"""Profile badges: event exclusives, finished sets, and achievements.

Event and set badges are stored when earned (quests.py, economy.py). Achievement badges are checked on
request and stored the first time they're met, so a badge never disappears once earned.
"""
import json
from datetime import date

import quests

# id: (name, how to earn it, icon, tier, test(stats) -> bool)
ACHIEVEMENTS = [
    ('first-lesson', 'First Hand', 'Finish your first lesson', 'star', 'bronze', lambda s: s['lessons'] >= 1),
    ('lessons-50', 'Regular', 'Finish 50 lessons', 'book', 'silver', lambda s: s['lessons'] >= 50),
    ('lessons-150', 'Scholar', 'Finish 150 lessons', 'book', 'gold', lambda s: s['lessons'] >= 150),
    ('perfect-10', 'Flawless', 'Score 100% on 10 lessons', 'check', 'silver', lambda s: s['perfect'] >= 10),
    ('checkpoint-1', 'Checkpoint', 'Pass your first checkpoint', 'shield', 'bronze', lambda s: s['checkpoints'] >= 1),
    ('checkpoint-10', 'Gatekeeper', 'Pass 10 checkpoints', 'shield', 'silver', lambda s: s['checkpoints'] >= 10),
    ('checkpoint-25', 'Unstoppable', 'Pass 25 checkpoints', 'shield', 'gold', lambda s: s['checkpoints'] >= 25),
    ('streak-7', 'Week Warrior', 'Reach a 7-day streak', 'flame', 'bronze', lambda s: s['streak'] >= 7),
    ('streak-30', 'Monthly Grind', 'Reach a 30-day streak', 'flame', 'silver', lambda s: s['streak'] >= 30),
    ('streak-100', 'Centurion', 'Reach a 100-day streak', 'flame', 'gold', lambda s: s['streak'] >= 100),
    ('sharp', 'Sharp', 'Get any skill rating to 1300', 'target', 'silver', lambda s: s['best_rating'] >= 1300),
    ('expert', 'Expert', 'Get any skill rating to 1500', 'target', 'gold', lambda s: s['best_rating'] >= 1500),
    ('placed-counter', 'Came in Counting', 'Place at Counter level or higher', 'count', 'silver', lambda s: s['level'] >= 4),
    ('placed-pro', 'Came in Hot', 'Ace every level of the placement check', 'trophy', 'gold', lambda s: s['level'] >= 5),
    ('table-500', 'Table Regular', 'Make 500 decisions at the Free Play table', 'cards', 'silver', lambda s: s['table'] >= 500),
    ('collector-10', 'Collector', 'Own 10 cosmetics', 'gem', 'bronze', lambda s: s['owned'] >= 10),
    ('collector-25', 'Curator', 'Own 25 cosmetics', 'gem', 'gold', lambda s: s['owned'] >= 25),
    ('expert-lab', 'Lab Graduate', 'Finish every Expert Lab lesson', 'crown', 'gold', lambda s: s['expert_done']),
    ('pro', 'Pro Member', 'Join Felt & Fortune Pro', 'crown', 'gold', lambda s: s['pro']),
]
ACH = {a[0]: a for a in ACHIEVEMENTS}
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


def _stats(c, uid, today):
    import coach, economy
    plan_row = c.execute('SELECT plan FROM plans WHERE user_id=?', (uid,)).fetchone()
    plan = json.loads(plan_row['plan']) if plan_row else {}
    done = {r['lesson_id']: r['best'] for r in c.execute('SELECT lesson_id, best FROM lesson_progress WHERE user_id=?', (uid,))}
    expert = [l['id'] for u in coach.TRACKS.get('expert', []) for l in u['lessons']]
    w = c.execute('SELECT owned FROM wallets WHERE user_id=?', (uid,)).fetchone()
    return {
        'lessons': len(done), 'perfect': sum(1 for v in done.values() if v == 100),
        'checkpoints': c.execute('SELECT COUNT(DISTINCT lesson_id) FROM checkpoint_passes WHERE user_id=?', (uid,)).fetchone()[0],
        'streak': economy.streak_info(c, uid, today)[0],
        'best_rating': (c.execute('SELECT MAX(rating) FROM skill_rating WHERE user_id=? AND n>=5', (uid,)).fetchone()[0] or 0),
        'level': int(plan.get('levelIndex') or 0),
        'table': c.execute("SELECT COALESCE(SUM(questions),0) FROM practice_log WHERE user_id=? AND tool='table'", (uid,)).fetchone()[0],
        'owned': len(json.loads((w['owned'] if w else None) or '[]')),
        'expert_done': bool(expert) and all(l in done for l in expert),
        'pro': economy.is_pro(c, uid),
    }


def describe(badge, earned):
    if badge.startswith('event-'):
        y, m = badge[6:].split('-'); name = quests.EVENTS[int(m)][0]
        return {'id': badge, 'name': name, 'desc': f'Finished the {MONTHS[int(m) - 1]} {y} event', 'icon': 'trophy', 'tier': 'event', 'earned': earned}
    if badge.startswith('set-'):
        import cosmetics
        s = cosmetics.SETS.get(badge[4:], {'name': badge[4:].title()})
        return {'id': badge, 'name': s['name'], 'desc': 'Completed the set', 'icon': 'gift', 'tier': 'set', 'earned': earned}
    a = ACH.get(badge)
    if not a: return None
    return {'id': badge, 'name': a[1], 'desc': a[2], 'icon': a[3], 'tier': a[4], 'earned': earned}


def award(c, uid, today=None):
    """Store any newly met achievements. Returns the ids awarded just now."""
    today = today or date.today().isoformat()
    s = _stats(c, uid, today)
    have = {r['badge'] for r in c.execute('SELECT badge FROM badges WHERE user_id=?', (uid,))}
    new = [a[0] for a in ACHIEVEMENTS if a[0] not in have and a[5](s)]
    for b in new: c.execute('INSERT OR IGNORE INTO badges VALUES(?,?,?)', (uid, b, today))
    return new


def shelf(c, uid, today=None, include_locked=True):
    new = award(c, uid, today)
    rows = c.execute('SELECT badge, earned FROM badges WHERE user_id=? ORDER BY earned DESC', (uid,)).fetchall()
    earned = [d for d in (describe(r['badge'], r['earned']) for r in rows) if d]
    order = {'event': 0, 'gold': 1, 'set': 2, 'silver': 3, 'bronze': 4}
    earned.sort(key=lambda d: (order.get(d['tier'], 9), d['earned']), reverse=False)
    got = {d['id'] for d in earned}
    locked = [{'id': a[0], 'name': a[1], 'desc': a[2], 'icon': a[3], 'tier': a[4], 'earned': None} for a in ACHIEVEMENTS if a[0] not in got] if include_locked else []
    return {'earned': earned, 'locked': locked, 'new': new, 'events': sum(1 for d in earned if d['tier'] == 'event')}


def top(c, uid, n=3):
    """A few badges to show next to a name (events first)."""
    rows = c.execute("SELECT badge, earned FROM badges WHERE user_id=? ORDER BY (badge LIKE 'event-%') DESC, earned DESC LIMIT ?", (uid, n)).fetchall()
    return [d for d in (describe(r['badge'], r['earned']) for r in rows) if d]
