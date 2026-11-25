"""Felt & Fortune economy: the Pro plan, practice Energy, Stars, streak freezes, daily quests, and leagues.

Design (see reports/Gamified app monetization and retention.md):
- Free keeps all basic-strategy learning; Pro unlocks counting/advantage-play units and unlimited Energy.
- Energy meters only standalone practice rounds; lessons, checkpoints, and mistake review are free.
- Stars are earned, never sold, and are separate from simulator chips. Nothing is random.
- Payments run in test mode until real billing (StoreKit / Play Billing / Stripe) is connected.
"""
import json, math, os, secrets, time
import quests as Q
import cosmetics as C
from datetime import date, timedelta

ENERGY_MAX = 25
ENERGY_REFILL_SECONDS = 58 * 60
ENERGY_EARN_CAP = 10                      # Energy earned back per day
ROUND_COST = {'challenge': 3}             # every other standalone round costs 1
FREE_TOOLS = {'weak'}                     # mistake review never costs Energy
FREEZE_MAX = 2
STREAK_MILESTONES = {3: 25, 7: 50, 14: 100, 30: 200, 100: 500}
FREE_FREEZE_AT = {3, 7}
DAILY_NEW_LESSONS = 2
LEAGUES = ['Bronze', 'Silver', 'Gold', 'Sapphire', 'Ruby', 'Emerald', 'Diamond']

PLANS = {
    'pro-monthly': {'name': 'Pro Monthly', 'price': 9.99, 'period': 'month', 'days': 30, 'trial': 0},
    'pro-annual': {'name': 'Pro Annual', 'price': 49.99, 'period': 'year', 'days': 365, 'trial': 14, 'perMonth': 4.17},
    'pro-lifetime': {'name': 'Pro Lifetime', 'price': 119.99, 'period': None, 'days': None, 'trial': 0},
}

POWERUPS = {
    'freeze': {'name': 'Streak Freeze', 'stars': 200, 'kind': 'freeze', 'text': 'Protects your streak for one missed day. Hold up to 2.'},
    'refill': {'name': 'Energy Refill', 'stars': 350, 'kind': 'refill', 'text': 'Fills your practice Energy to 25.'},
}
SHOP = {**POWERUPS, **C.CATALOG}
DEFAULT_LOOK = dict(C.DEFAULTS)
SET_DISCOUNT = .8


SCHEMA = '''
CREATE TABLE IF NOT EXISTS wallets(user_id TEXT PRIMARY KEY REFERENCES users(id), stars INTEGER DEFAULT 0, energy INTEGER DEFAULT 25,
    energy_at REAL, freezes INTEGER DEFAULT 0, earn_day TEXT, earned INTEGER DEFAULT 0, owned TEXT DEFAULT '[]', look TEXT DEFAULT '{}',
    repair_month TEXT, league INTEGER DEFAULT 0, league_week TEXT, birth_year INTEGER);
CREATE TABLE IF NOT EXISTS entitlements(user_id TEXT PRIMARY KEY REFERENCES users(id), plan TEXT, status TEXT, started REAL,
    trial_ends REAL, renews REAL, source TEXT, updated REAL);
CREATE TABLE IF NOT EXISTS star_log(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT REFERENCES users(id), delta INTEGER, reason TEXT, day TEXT, created REAL);
CREATE TABLE IF NOT EXISTS freeze_days(user_id TEXT REFERENCES users(id), day TEXT, kind TEXT, PRIMARY KEY(user_id, day));
CREATE TABLE IF NOT EXISTS rounds(id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), tool TEXT, cost INTEGER, created REAL, used INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS lesson_first(user_id TEXT REFERENCES users(id), lesson_id TEXT, day TEXT, PRIMARY KEY(user_id, lesson_id));
CREATE TABLE IF NOT EXISTS checkpoint_passes(user_id TEXT REFERENCES users(id), lesson_id TEXT, day TEXT, accuracy INTEGER, PRIMARY KEY(user_id, lesson_id, day));
CREATE TABLE IF NOT EXISTS quest_claims(user_id TEXT REFERENCES users(id), day TEXT, quest TEXT, PRIMARY KEY(user_id, day, quest));
CREATE TABLE IF NOT EXISTS milestone_claims(user_id TEXT REFERENCES users(id), streak_start TEXT, days INTEGER, PRIMARY KEY(user_id, streak_start, days));
'''

BILLING_MODE = os.environ.get('BILLING_MODE', 'test')   # 'test' until real store billing is connected


# ---------------------------------------------------------------------------------------------
# Wallet, plan, and Energy
# ---------------------------------------------------------------------------------------------

def wallet(c, uid):
    row = c.execute('SELECT * FROM wallets WHERE user_id=?', (uid,)).fetchone()
    if not row:
        c.execute('INSERT OR IGNORE INTO wallets(user_id, energy, energy_at) VALUES(?,?,?)', (uid, ENERGY_MAX, time.time()))
        row = c.execute('SELECT * FROM wallets WHERE user_id=?', (uid,)).fetchone()
    return dict(row)


def entitlement(c, uid, now=None):
    """The user's current plan: {'plan','pro','status','trialEnds','renews','source'}; free if none or lapsed."""
    now = now or time.time()
    row = c.execute('SELECT * FROM entitlements WHERE user_id=?', (uid,)).fetchone()
    if not row: return {'plan': 'free', 'pro': False, 'status': 'none'}
    e = dict(row)
    active = e['plan'] == 'pro-lifetime' or (e['renews'] or 0) > now or (e['trial_ends'] or 0) > now
    if e['status'] == 'canceled' and not active: active = False
    return {'plan': e['plan'] if active else 'free', 'pro': bool(active), 'status': e['status'] if active else 'expired',
            'trialEnds': e['trial_ends'] if (e['trial_ends'] or 0) > now else None, 'renews': e['renews'], 'source': e['source']}


def is_pro(c, uid):
    return entitlement(c, uid)['pro']


def energy(c, uid, now=None):
    """Current Energy after time-based refill (stored lazily)."""
    now = now or time.time(); w = wallet(c, uid)
    e, at = w['energy'], w['energy_at'] or now
    if e < ENERGY_MAX:
        gained = int((now - at) // ENERGY_REFILL_SECONDS)
        if gained:
            e = min(ENERGY_MAX, e + gained); at = now if e >= ENERGY_MAX else at + gained * ENERGY_REFILL_SECONDS
            c.execute('UPDATE wallets SET energy=?, energy_at=? WHERE user_id=?', (e, at, uid))
    else:
        at = now
    next_in = None if e >= ENERGY_MAX else max(0, int(ENERGY_REFILL_SECONDS - (now - at)))
    return e, next_in


def start_round(c, uid, tool):
    """Charge a standalone practice round up front (so it is never cut off). Returns (round_id, energy)."""
    cost = 0 if tool in FREE_TOOLS else ROUND_COST.get(tool, 1)
    pro = is_pro(c, uid)
    e, _ = energy(c, uid)
    if not pro and cost:
        if e < cost: return None, e
        c.execute('UPDATE wallets SET energy=energy-?, energy_at=CASE WHEN energy>=? THEN ? ELSE energy_at END WHERE user_id=?', (cost, ENERGY_MAX, time.time(), uid))
        e -= cost
    rid = secrets.token_hex(12)
    c.execute('INSERT INTO rounds(id,user_id,tool,cost,created) VALUES(?,?,?,?,?)', (rid, uid, tool, 0 if pro else cost, time.time()))
    return rid, e


def use_round(c, uid, rid, tool):
    """Consume a started round; free users must have one to log practice."""
    if tool in FREE_TOOLS or is_pro(c, uid): return True
    row = c.execute('SELECT * FROM rounds WHERE id=? AND user_id=? AND tool=? AND used=0 AND created>?', (str(rid or ''), uid, tool, time.time() - 3 * 3600)).fetchone()
    if not row: return False
    c.execute('UPDATE rounds SET used=1 WHERE id=?', (row['id'],))
    return True


def earn_energy(c, uid, day, amount):
    if amount <= 0 or is_pro(c, uid): return 0
    w = wallet(c, uid)
    earned = w['earned'] if w['earn_day'] == day else 0
    amount = max(0, min(amount, ENERGY_EARN_CAP - earned))
    if amount:
        e, _ = energy(c, uid)
        c.execute('UPDATE wallets SET energy=?, earn_day=?, earned=? WHERE user_id=?', (min(ENERGY_MAX, e + amount), day, earned + amount, uid))
    return amount


# ---------------------------------------------------------------------------------------------
# Stars, streaks, freezes
# ---------------------------------------------------------------------------------------------

def add_stars(c, uid, delta, reason, day):
    wallet(c, uid)
    c.execute('UPDATE wallets SET stars=stars+? WHERE user_id=?', (delta, uid))
    c.execute('INSERT INTO star_log(user_id,delta,reason,day,created) VALUES(?,?,?,?,?)', (uid, delta, reason, day, time.time()))
    return delta


def active_days(c, uid):
    days = {r[0] for r in c.execute('SELECT DISTINCT day FROM xp_log WHERE user_id=?', (uid,))}
    frozen = {r[0] for r in c.execute('SELECT day FROM freeze_days WHERE user_id=?', (uid,))}
    return days, frozen


def streak_info(c, uid, today):
    """(length, start_day, extended_today). Frozen days keep a streak alive without adding to it."""
    days, frozen = active_days(c, uid)
    cursor = date.fromisoformat(today)
    extended = today in days
    if not extended: cursor -= timedelta(days=1)
    length, start = 0, None
    while True:
        d = cursor.isoformat()
        if d in days: length += 1; start = d
        elif d not in frozen: break
        cursor -= timedelta(days=1)
        if length > 4000: break
    return length, start, extended


def apply_freezes(c, uid, today):
    """Use held Streak Freezes to cover days missed since the last active day (up to two days)."""
    days, frozen = active_days(c, uid)
    if not days: return []
    covered = days | frozen
    last = max(d for d in covered if d <= today)
    gap = (date.fromisoformat(today) - date.fromisoformat(last)).days - 1
    if gap <= 0: return []
    w = wallet(c, uid)
    if w['freezes'] < gap: return []                         # not enough freezes: the streak is broken
    used = []
    for i in range(1, gap + 1):
        d = (date.fromisoformat(last) + timedelta(days=i)).isoformat()
        c.execute('INSERT OR IGNORE INTO freeze_days VALUES(?,?,?)', (uid, d, 'freeze')); used.append(d)
    c.execute('UPDATE wallets SET freezes=freezes-? WHERE user_id=?', (len(used), uid))
    return used


def repair_offer(c, uid, today):
    """A broken streak can be repaired for free once a calendar month, within 48 hours of the first missed day."""
    days, frozen = active_days(c, uid)
    covered = {d for d in days | frozen if d < today}
    if not covered: return None
    last = max(covered)
    gap = (date.fromisoformat(today) - date.fromisoformat(last)).days - 1
    if gap < 1 or gap > 2: return None
    w = wallet(c, uid)
    if w['repair_month'] == today[:7]: return None
    # Only worth offering if there was a streak worth saving.
    cursor, length = date.fromisoformat(last), 0
    while cursor.isoformat() in days or cursor.isoformat() in frozen:
        length += cursor.isoformat() in days; cursor -= timedelta(days=1)
    if length < 2: return None
    return {'missed': [(date.fromisoformat(last) + timedelta(days=i)).isoformat() for i in range(1, gap + 1)], 'streak': length}


def repair(c, uid, today):
    offer = repair_offer(c, uid, today)
    if not offer: return None
    for d in offer['missed']: c.execute('INSERT OR IGNORE INTO freeze_days VALUES(?,?,?)', (uid, d, 'repair'))
    c.execute('UPDATE wallets SET repair_month=? WHERE user_id=?', (today[:7], uid))
    return offer


def streak_rewards(c, uid, today):
    """Grant milestone Stars and free freezes once per streak. Returns a list of celebration events."""
    length, start, _ = streak_info(c, uid, today)
    events = []
    if not start: return events
    for days, stars in STREAK_MILESTONES.items():
        if length >= days and c.execute('INSERT OR IGNORE INTO milestone_claims VALUES(?,?,?)', (uid, start, days)).rowcount:
            add_stars(c, uid, stars, f'streak-{days}', today)
            event = {'type': 'milestone', 'days': days, 'stars': stars}
            if days in FREE_FREEZE_AT and wallet(c, uid)['freezes'] < FREEZE_MAX:
                c.execute('UPDATE wallets SET freezes=freezes+1 WHERE user_id=?', (uid,)); event['freeze'] = True
            events.append(event)
    return events


# ---------------------------------------------------------------------------------------------
# Quests and leagues
# ---------------------------------------------------------------------------------------------

def week_start(day):
    d = date.fromisoformat(day)
    return (d - timedelta(days=d.weekday())).isoformat()


def league(c, uid, today):
    """Weekly league: rank by this week's XP among players in the same tier. Last week's finish moves you up or down."""
    w = wallet(c, uid); this_week = week_start(today)
    if w['league_week'] != this_week:
        tier = w['league'] or 0
        if w['league_week']:
            last = w['league_week']; end = (date.fromisoformat(last) + timedelta(days=7)).isoformat()
            board = c.execute('''SELECT wallets.user_id, COALESCE(SUM(xp_log.xp),0) xp FROM wallets LEFT JOIN xp_log ON xp_log.user_id=wallets.user_id
                                 AND xp_log.day>=? AND xp_log.day<? WHERE wallets.league=? GROUP BY wallets.user_id ORDER BY xp DESC''', (last, end, tier)).fetchall()
            ranked = [r for r in board if r['xp'] > 0]
            me = next((i for i, r in enumerate(ranked) if r['user_id'] == uid), None)
            if me is not None and len(ranked) >= 2:
                if me < max(1, len(ranked) // 5): tier = min(len(LEAGUES) - 1, tier + 1)
                elif me >= len(ranked) - max(1, len(ranked) // 5) and len(ranked) >= 5: tier = max(0, tier - 1)
        c.execute('UPDATE wallets SET league=?, league_week=? WHERE user_id=?', (tier, this_week, uid))
        w['league'] = tier
    end = (date.fromisoformat(this_week) + timedelta(days=7)).isoformat()
    rows = c.execute('''SELECT users.id, users.username, COALESCE(SUM(xp_log.xp),0) xp FROM wallets JOIN users ON users.id=wallets.user_id
                        LEFT JOIN xp_log ON xp_log.user_id=wallets.user_id AND xp_log.day>=? AND xp_log.day<?
                        WHERE wallets.league=? AND wallets.league_week=? GROUP BY users.id ORDER BY xp DESC, users.username LIMIT 30''',
                     (this_week, end, w['league'], this_week)).fetchall()
    return {'tier': w['league'], 'name': LEAGUES[w['league']], 'endsOn': end,
            'players': [{'username': r['username'], 'xp': r['xp'], 'me': r['id'] == uid} for r in rows]}


# ---------------------------------------------------------------------------------------------
# Snapshot for the client
# ---------------------------------------------------------------------------------------------

def set_price(set_id, owned):
    missing = [v['stars'] for k, v in C.CATALOG.items() if v.get('set') == set_id and k not in owned]
    return int(round(sum(missing) * SET_DISCOUNT / 10) * 10)


def grant(c, uid, item_ids, today, equip=None):
    """Add items to the collection, equip a single purchase, and pay set-completion bonuses once."""
    w = wallet(c, uid); owned = json.loads(w['owned'] or '[]')
    owned += [i for i in item_ids if i not in owned]
    look = {**DEFAULT_LOOK, **json.loads(w['look'] or '{}')}
    if equip: look[equip['kind']] = equip['value']
    c.execute('UPDATE wallets SET owned=?, look=? WHERE user_id=?', (json.dumps(owned), json.dumps(look), uid))
    for st in C.set_progress(owned):
        if st['owned'] == st['total'] and c.execute('INSERT OR IGNORE INTO badges VALUES(?,?,?)', (uid, 'set-' + st['id'], today)).rowcount:
            add_stars(c, uid, st['bonus'], 'set-' + st['id'], today)


def quests_ready(c, uid, today, daily_xp):
    b = Q.board(c, uid, today, daily_xp)
    return sum(1 for q in b['daily'] + b['weekly'] if q['done'] and not q['claimed']) + (b['allDaily']['ready'] and not b['allDaily']['claimed']) \
        + sum(1 for t in b['track'] if t['reached'] and not t['claimed'])


def wallet_add(c, uid, reward):
    """Apply non-Star quest rewards: Streak Freezes and Energy (both capped)."""
    if reward.get('freeze'):
        c.execute('UPDATE wallets SET freezes=MIN(?, freezes+?) WHERE user_id=?', (FREEZE_MAX, reward['freeze'], uid))
    if reward.get('energy'):
        e, _ = energy(c, uid)
        c.execute('UPDATE wallets SET energy=? WHERE user_id=?', (min(ENERGY_MAX, e + reward['energy']), uid))


def snapshot(c, uid, today, daily_xp):
    events = [{'type': 'freeze-used', 'days': used}] if (used := apply_freezes(c, uid, today)) else []
    events += streak_rewards(c, uid, today)
    w = wallet(c, uid); e, next_in = energy(c, uid); ent = entitlement(c, uid)
    length, _, extended = streak_info(c, uid, today)
    return {
        'plan': ent, 'stars': w['stars'], 'freezes': w['freezes'], 'freezeMax': FREEZE_MAX,
        'energy': None if ent['pro'] else e, 'energyMax': ENERGY_MAX, 'energyNextIn': None if ent['pro'] else next_in,
        'streak': length, 'streakToday': extended, 'repair': repair_offer(c, uid, today),
        'look': {**DEFAULT_LOOK, **json.loads(w['look'] or '{}')}, 'owned': json.loads(w['owned'] or '[]'),
        'questsReady': quests_ready(c, uid, today, daily_xp), 'events': events, 'billingMode': BILLING_MODE,
    }


class EconomyRoutes:
    """Mixed into the request handler. Uses self.c, self.user, self.data, self.client_day, self.send_json."""

    def economy_api(self, path, method, require, ApiError):
        c = self.c; uid = self.user['id']; d = self.data; today = self.client_day()
        plan = self.load_plan() if hasattr(self, 'load_plan') else None
        daily_xp = (plan or {}).get('dailyXp', 15)
        if path == '/api/me/economy' and method == 'GET':
            return self.send_json(snapshot(c, uid, today, daily_xp))
        if path == '/api/energy/start' and method == 'POST':
            tool = str(d.get('tool', ''))[:24]; require(tool, 'Choose a practice tool.')
            rid, e = start_round(c, uid, tool)
            if not rid:
                e, next_in = energy(c, uid)
                return self.send_json({'error': 'You’re out of Energy for now.', 'energy': e, 'energyNextIn': next_in, 'outOfEnergy': True}, 402)
            return self.send_json({'round': rid, 'energy': None if is_pro(c, uid) else e})
        if path == '/api/quests' and method == 'GET':
            return self.send_json({**Q.board(c, uid, today, daily_xp), 'rerollsAllowed': 2 if is_pro(c, uid) else 1})
        if path == '/api/quests/claim' and method == 'POST':
            reward = Q.claim(c, uid, today, str(d.get('quest', '')), daily_xp,
                             lambda n, why: add_stars(c, uid, n, why, today), lambda rw: wallet_add(c, uid, rw))
            require(reward, 'That quest isn’t ready to claim.')
            return self.send_json({'reward': reward, 'board': Q.board(c, uid, today, daily_xp), **snapshot(c, uid, today, daily_xp)})
        if path == '/api/quests/reroll' and method == 'POST':
            pro = is_pro(c, uid)
            require(Q.reroll(c, uid, today, int(d.get('slot', -1)), 2 if pro else 1), 'You’ve used today’s quest swap' + (' (Pro gets two)' if not pro else 's') + '.')
            return self.send_json({**Q.board(c, uid, today, daily_xp), 'rerollsAllowed': 2 if pro else 1})
        if path == '/api/streak/repair' and method == 'POST':
            require(repair(c, uid, today), 'There’s no streak to repair right now.')
            return self.send_json(snapshot(c, uid, today, daily_xp))
        if path == '/api/league' and method == 'GET':
            return self.send_json(league(c, uid, today))
        if path == '/api/store' and method == 'GET':
            w = wallet(c, uid); owned = json.loads(w['owned'] or '[]')
            wk = week_start(today); ends = (date.fromisoformat(wk) + timedelta(days=7)).isoformat()
            sets = [{**st, 'price': set_price(st['id'], owned)} for st in C.set_progress(owned)]
            return self.send_json({'plans': PLANS, 'powerups': POWERUPS, 'catalog': C.CATALOG, 'rarity': C.RARITY, 'sets': sets,
                                   'featured': {'items': C.featured(wk), 'ends': ends}, 'billingMode': BILLING_MODE, **snapshot(c, uid, today, daily_xp)})
        if path == '/api/store/buy' and method == 'POST':
            item_id = str(d.get('item', '')); item = SHOP.get(item_id); require(item, 'Unknown item.')
            w = wallet(c, uid); owned = json.loads(w['owned'] or '[]'); pro = is_pro(c, uid)
            if item['kind'] in ('freeze', 'refill'):
                require(w['stars'] >= item['stars'], 'You need more Stars for that.', 402)
                if item['kind'] == 'freeze': require(w['freezes'] < FREEZE_MAX, f'You can hold up to {FREEZE_MAX} freezes.')
                else:
                    require(not pro, 'Pro already has unlimited Energy.')
                    require(energy(c, uid)[0] < ENERGY_MAX, 'Your Energy is already full.')
                add_stars(c, uid, -item['stars'], 'buy-' + item_id, today)
                if item['kind'] == 'freeze': c.execute('UPDATE wallets SET freezes=freezes+1 WHERE user_id=?', (uid,))
                else: c.execute('UPDATE wallets SET energy=?, energy_at=? WHERE user_id=?', (ENERGY_MAX, time.time(), uid))
                return self.send_json(snapshot(c, uid, today, daily_xp))
            require(item_id not in owned, 'You already own this.')
            require(not item.get('event'), 'Event items are earned by finishing that month’s event.')
            if item.get('pro'): require(pro, 'The Pro Gold collection is included with Pro.', 402)
            else: require(w['stars'] >= item['stars'], 'You need more Stars for that.', 402)
            if item['stars']: add_stars(c, uid, -item['stars'], 'buy-' + item_id, today)
            grant(c, uid, [item_id], today, equip=item)
            return self.send_json(snapshot(c, uid, today, daily_xp))
        if path == '/api/store/buy-set' and method == 'POST':
            set_id = str(d.get('set', '')); require(set_id in C.SETS, 'Unknown set.')
            w = wallet(c, uid); owned = json.loads(w['owned'] or '[]')
            missing = [k for k, v in C.CATALOG.items() if v.get('set') == set_id and k not in owned]
            require(missing, 'You already own this whole set.')
            price = set_price(set_id, owned); require(w['stars'] >= price, 'You need more Stars for that.', 402)
            add_stars(c, uid, -price, 'buy-set-' + set_id, today)
            grant(c, uid, missing, today)
            return self.send_json(snapshot(c, uid, today, daily_xp))
        if path == '/api/store/equip' and method == 'POST':
            kind = str(d.get('kind', '')); value = str(d.get('value', '')); require(kind in DEFAULT_LOOK, 'Unknown item.')
            w = wallet(c, uid); owned = json.loads(w['owned'] or '[]')
            require(C.owns(owned, kind, value, is_pro(c, uid)), 'Unlock that look first.')
            look = {**DEFAULT_LOOK, **json.loads(w['look'] or '{}'), kind: value}
            c.execute('UPDATE wallets SET look=? WHERE user_id=?', (json.dumps(look), uid))
            return self.send_json(snapshot(c, uid, today, daily_xp))
        if path == '/api/billing/test-purchase' and method == 'POST':
            require(BILLING_MODE == 'test', 'Purchases go through the App Store, Google Play, or the web checkout.', 403)
            plan_id = str(d.get('plan', '')); p = PLANS.get(plan_id); require(p, 'Choose a plan.')
            now = time.time()
            trial_ends = now + p['trial'] * 86400 if p['trial'] and not c.execute('SELECT 1 FROM entitlements WHERE user_id=? AND trial_ends IS NOT NULL', (uid,)).fetchone() else None
            renews = None if p['days'] is None else (trial_ends or now) + p['days'] * 86400
            c.execute('''INSERT INTO entitlements VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET plan=excluded.plan, status=excluded.status,
                         started=excluded.started, trial_ends=COALESCE(excluded.trial_ends, entitlements.trial_ends), renews=excluded.renews, source=excluded.source, updated=excluded.updated''',
                      (uid, plan_id, 'trial' if trial_ends else 'active', now, trial_ends, renews, 'test', now))
            return self.send_json(snapshot(c, uid, today, daily_xp))
        if path == '/api/billing/cancel' and method == 'POST':
            ent = entitlement(c, uid); require(ent['pro'], 'You don’t have an active plan.')
            require(ent['plan'] != 'pro-lifetime', 'Lifetime access doesn’t renew, so there’s nothing to cancel.')
            if ent.get('trialEnds'):   # canceling during the trial ends it with no charge
                c.execute("UPDATE entitlements SET status='canceled', renews=NULL, trial_ends=?, updated=? WHERE user_id=?", (time.time() - 1, time.time(), uid))
            else:                      # keep access until the end of the paid period
                c.execute("UPDATE entitlements SET status='canceled', updated=? WHERE user_id=?", (time.time(), uid))
            return self.send_json(snapshot(c, uid, today, daily_xp))
        raise ApiError('Endpoint not found.', 404)
