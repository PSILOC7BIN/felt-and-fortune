"""Friends: follow other learners by username and compare streaks, weekly XP, and skill ratings.

Following is one-way, like Duolingo. People who follow you can see your streak, this week's XP, and your
overall skill rating, nothing else.
"""
import time
from datetime import date, timedelta

SCHEMA = '''
CREATE TABLE IF NOT EXISTS follows(user_id TEXT REFERENCES users(id), friend_id TEXT REFERENCES users(id), created REAL, PRIMARY KEY(user_id, friend_id));
'''
MAX_FOLLOWS = 200


def _card(c, uid, today, week_start, streak_info, overall):
    u = c.execute('SELECT id, username FROM users WHERE id=?', (uid,)).fetchone()
    end = (date.fromisoformat(week_start) + timedelta(days=7)).isoformat()
    xp = c.execute('SELECT COALESCE(SUM(xp),0) FROM xp_log WHERE user_id=? AND day>=? AND day<?', (uid, week_start, end)).fetchone()[0]
    import badges
    return {'username': u['username'], 'streak': streak_info(c, uid, today)[0], 'weekXp': xp, 'rating': overall(c, uid),
            'badges': [{'name': b['name'], 'icon': b['icon'], 'tier': b['tier']} for b in badges.top(c, uid)]}


def friends(c, uid, today):
    import economy, learning
    wk = economy.week_start(today)
    ids = [r[0] for r in c.execute('SELECT friend_id FROM follows WHERE user_id=? ORDER BY created DESC', (uid,))]
    me = {**_card(c, uid, today, wk, economy.streak_info, learning._overall), 'me': True}
    people = [_card(c, f, today, wk, economy.streak_info, learning._overall) for f in ids]
    followers = c.execute('SELECT COUNT(*) FROM follows WHERE friend_id=?', (uid,)).fetchone()[0]
    board = sorted([me] + people, key=lambda p: (-p['weekXp'], p['username'].lower()))
    return {'following': people, 'followers': followers, 'board': board, 'weekEnds': (date.fromisoformat(wk) + timedelta(days=7)).isoformat()}


def follow(c, uid, username):
    row = c.execute('SELECT id FROM users WHERE username=? COLLATE NOCASE', (str(username).strip()[:30],)).fetchone()
    if not row: return 'No player has that username.'
    if row['id'] == uid: return 'That’s you!'
    if c.execute('SELECT COUNT(*) FROM follows WHERE user_id=?', (uid,)).fetchone()[0] >= MAX_FOLLOWS: return f'You can follow up to {MAX_FOLLOWS} players.'
    c.execute('INSERT OR IGNORE INTO follows VALUES(?,?,?)', (uid, row['id'], time.time()))
    return None


def unfollow(c, uid, username):
    row = c.execute('SELECT id FROM users WHERE username=? COLLATE NOCASE', (str(username).strip()[:30],)).fetchone()
    if row: c.execute('DELETE FROM follows WHERE user_id=? AND friend_id=?', (uid, row['id']))
