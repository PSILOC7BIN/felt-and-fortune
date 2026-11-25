"""Account rights and transactional email: data export, account deletion, the mailer (with an outbox),
purchase receipts, and the trial-ending and renewal reminders that California and New York law require.

Email goes through SMTP when SMTP_HOST is set. Every message is also recorded in the `outbox` table, so the
reminders can be checked (and tested) without a mail server.
"""
import json, os, smtplib, time
from email.message import EmailMessage

SCHEMA = '''
CREATE TABLE IF NOT EXISTS outbox(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, to_addr TEXT, subject TEXT, body TEXT, kind TEXT, status TEXT, created REAL);
CREATE TABLE IF NOT EXISTS reminders(user_id TEXT, kind TEXT, ref TEXT, sent REAL, PRIMARY KEY(user_id, kind, ref));
CREATE TABLE IF NOT EXISTS prefs(user_id TEXT PRIMARY KEY, streak_email INTEGER DEFAULT 1, news_email INTEGER DEFAULT 0, break_until REAL DEFAULT 0);
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, anon TEXT, user_id TEXT, name TEXT, props TEXT, day TEXT, created REAL);
'''

TRIAL_NOTICE_DAYS = 3
RENEWAL_NOTICE_DAYS = 21


def origin():
    return os.environ.get('PUBLIC_ORIGIN', 'http://127.0.0.1:8000').rstrip('/')


def send(c, user, subject, body, kind):
    """Send an email (SMTP if configured) and record it in the outbox. Never raises."""
    status = 'logged'
    if os.environ.get('SMTP_HOST'):
        try:
            msg = EmailMessage(); msg['Subject'] = subject; msg['From'] = os.environ['SMTP_FROM']; msg['To'] = user['email']
            msg.set_content(body + f'\n\nFelt & Fortune · {origin()}\nYou’re receiving this because you have a Felt & Fortune account.')
            with smtplib.SMTP(os.environ['SMTP_HOST'], int(os.environ.get('SMTP_PORT', '587')), timeout=15) as smtp:
                smtp.starttls()
                if os.environ.get('SMTP_USER'): smtp.login(os.environ['SMTP_USER'], os.environ.get('SMTP_PASSWORD', ''))
                smtp.send_message(msg)
            status = 'sent'
        except Exception as e:  # keep the request working; the outbox shows the failure
            status = 'failed: ' + type(e).__name__
    c.execute('INSERT INTO outbox(user_id,to_addr,subject,body,kind,status,created) VALUES(?,?,?,?,?,?,?)',
              (user['id'], user['email'], subject, body, kind, status, time.time()))
    return status


def fmt_date(ts):
    return time.strftime('%B %d, %Y', time.localtime(ts)).replace(' 0', ' ')


def receipt(c, user, plan, ent):
    """Purchase or trial-start confirmation with the exact terms (ROSCA: disclose terms and confirm consent)."""
    price = f"${plan['price']:.2f}"
    if ent.get('trial_ends'):
        body = (f"Your {plan['name']} free trial has started.\n\n"
                f"Trial ends: {fmt_date(ent['trial_ends'])}. We’ll email you {TRIAL_NOTICE_DAYS} days before.\n"
                f"Unless you cancel before then, you’ll be charged {price} per {plan['period']}, renewing automatically.\n"
                f"Cancel any time: {origin()}/store#pro")
        subject = 'Your Felt & Fortune Pro trial has started'
    elif plan['period']:
        body = (f"Thanks for subscribing to {plan['name']}.\n\nCharged: {price} per {plan['period']}, renewing automatically "
                f"on {fmt_date(ent['renews'])} unless you cancel.\nCancel any time: {origin()}/store#pro")
        subject = 'Your Felt & Fortune Pro receipt'
    else:
        body = f"Thanks for buying {plan['name']}.\n\nCharged once: {price}. Pro is yours for good; nothing renews."
        subject = 'Your Felt & Fortune Pro Lifetime receipt'
    return send(c, user, subject, body, 'receipt')


def cancellation(c, user, ent):
    until = 'now (no charge was made)' if ent.get('ended_trial') else fmt_date(ent['renews'])
    return send(c, user, 'Your Felt & Fortune Pro subscription is canceled',
                f"Your subscription is canceled and won’t renew. Pro stays active until {until}.\n"
                f"Your Stars, streak, and progress are kept. You can rejoin any time at {origin()}/store#pro", 'cancel')


STREAK_HOUR = 18   # local server hour after which a not-yet-extended streak gets one nudge


def prefs(c, uid):
    row = c.execute('SELECT * FROM prefs WHERE user_id=?', (uid,)).fetchone()
    return dict(row) if row else {'user_id': uid, 'streak_email': 1, 'news_email': 0, 'break_until': 0}


def set_prefs(c, uid, **kw):
    p = prefs(c, uid); p.update({k: v for k, v in kw.items() if k in ('streak_email', 'news_email', 'break_until')})
    c.execute('INSERT INTO prefs VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET streak_email=excluded.streak_email, news_email=excluded.news_email, break_until=excluded.break_until',
              (uid, int(bool(p['streak_email'])), int(bool(p['news_email'])), float(p['break_until'] or 0)))
    return prefs(c, uid)


def streak_nudges(c, now=None):
    """One friendly email on days a streak of 2+ hasn't been extended yet, after STREAK_HOUR. Never guilt-tripping."""
    import economy
    now = now or time.time()
    if time.localtime(now).tm_hour < STREAK_HOUR: return 0
    today = time.strftime('%Y-%m-%d', time.localtime(now)); sent = 0
    for u in c.execute('SELECT DISTINCT users.* FROM users JOIN xp_log ON xp_log.user_id = users.id WHERE xp_log.day >= ?',
                       (time.strftime('%Y-%m-%d', time.localtime(now - 3 * 86400)),)).fetchall():
        p = prefs(c, u['id'])
        if not p['streak_email'] or (p['break_until'] or 0) > now: continue
        length, _, extended = economy.streak_info(c, u['id'], today)
        if extended or length < 2: continue
        if c.execute('INSERT OR IGNORE INTO reminders VALUES(?,?,?,?)', (u['id'], 'streak', today, now)).rowcount:
            send(c, u, f'Your {length}-day streak is waiting',
                 f"One lesson or practice round keeps your {length}-day streak going. It takes about five minutes.\n"
                 f"Pick up where you left off: {origin()}/learn\n\nDon’t want these? Turn streak emails off: {origin()}/profile#notifications", 'streak'); sent += 1
    return sent


def run_reminders(c, now=None):
    """Send trial-ending and renewal notices once each. Called periodically by the server."""
    now = now or time.time(); sent = 0
    rows = c.execute('''SELECT users.*, entitlements.plan AS ent_plan, entitlements.trial_ends, entitlements.renews, entitlements.status AS ent_status
                        FROM entitlements JOIN users ON users.id = entitlements.user_id''').fetchall()
    for r in rows:
        if r['ent_status'] == 'canceled': continue
        if r['trial_ends'] and now < r['trial_ends'] <= now + TRIAL_NOTICE_DAYS * 86400:
            ref = str(int(r['trial_ends']))
            if c.execute('INSERT OR IGNORE INTO reminders VALUES(?,?,?,?)', (r['id'], 'trial', ref, now)).rowcount:
                send(c, r, 'Your Felt & Fortune Pro trial ends soon',
                     f"Your free trial ends on {fmt_date(r['trial_ends'])}. After that you’ll be charged for Pro unless you cancel.\n"
                     f"Keep it, or cancel in one click: {origin()}/store#pro", 'trial-reminder'); sent += 1
        elif r['ent_plan'] == 'pro-annual' and r['renews'] and now < r['renews'] <= now + RENEWAL_NOTICE_DAYS * 86400 and not (r['trial_ends'] and r['trial_ends'] > now):
            ref = str(int(r['renews']))
            if c.execute('INSERT OR IGNORE INTO reminders VALUES(?,?,?,?)', (r['id'], 'renewal', ref, now)).rowcount:
                send(c, r, 'Your Felt & Fortune Pro renews soon',
                     f"Your yearly Pro plan renews on {fmt_date(r['renews'])} for $49.99.\nNo action needed to keep it. To cancel: {origin()}/store#pro",
                     'renewal-reminder'); sent += 1
    return sent + streak_nudges(c, now)


# ---------------------------------------------------------------------------------------------------
# Export and deletion
# ---------------------------------------------------------------------------------------------------
SKIP_COLUMNS = {'password', 'token'}
PRIVATE_TABLES = {'sessions', 'resets'}


def _tables(c):
    return [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")]


def _user_columns(c, table):
    cols = [r[1] for r in c.execute(f'PRAGMA table_info("{table}")')]
    return cols, [k for k in ('user_id', 'owner', 'sender', 'recipient') if k in cols]


def export(c, uid):
    """Everything stored about the user, as JSON-ready data (no password hashes or session tokens)."""
    out = {}
    user = dict(c.execute('SELECT * FROM users WHERE id=?', (uid,)).fetchone())
    out['account'] = {k: v for k, v in user.items() if k not in SKIP_COLUMNS}
    for t in _tables(c):
        if t in PRIVATE_TABLES or t == 'users': continue
        cols, keys = _user_columns(c, t)
        if not keys: continue
        where = ' OR '.join(f'"{k}"=?' for k in keys)
        rows = [{k: v for k, v in dict(r).items() if k not in SKIP_COLUMNS} for r in c.execute(f'SELECT * FROM "{t}" WHERE {where}', [uid] * len(keys))]
        if rows: out[t] = rows
    for t, rows in out.items():
        if isinstance(rows, list):
            for r in rows:
                for k in ('body', 'plan', 'answers', 'state', 'owned', 'look', 'props'):
                    if isinstance(r.get(k), str) and r[k][:1] in '{[':
                        try: r[k] = json.loads(r[k])
                        except ValueError: pass
    out['exported'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    return out


def delete(c, uid):
    """Permanently remove the account and everything tied to it."""
    owned = [r[0] for r in c.execute('SELECT id FROM records WHERE owner=?', (uid,))]
    if owned:
        marks = ','.join('?' * len(owned))
        c.execute(f'DELETE FROM members WHERE bankroll IN ({marks})', owned)
        c.execute(f'DELETE FROM records WHERE parent IN ({marks})', owned)
    for t in _tables(c):
        if t == 'users': continue
        _, keys = _user_columns(c, t)
        for k in keys: c.execute(f'DELETE FROM "{t}" WHERE "{k}"=?', (uid,))
    c.execute('DELETE FROM users WHERE id=?', (uid,))


# ---------------------------------------------------------------------------------------------------
# First-party funnel analytics (no third-party trackers)
# ---------------------------------------------------------------------------------------------------
EVENT_NAMES = {'landing_view', 'pricing_view', 'survey_start', 'plan_shown', 'signup', 'first_lesson', 'lesson_complete',
               'paywall_view', 'store_view', 'trial_start', 'purchase', 'cancel', 'quest_claim', 'practice_round'}


def track(c, name, anon=None, uid=None, props=None, day=None):
    if name not in EVENT_NAMES: return False
    c.execute('INSERT INTO events(anon,user_id,name,props,day,created) VALUES(?,?,?,?,?,?)',
              (str(anon or '')[:40] or None, uid, name, json.dumps(props or {})[:500], day or time.strftime('%Y-%m-%d'), time.time()))
    return True
