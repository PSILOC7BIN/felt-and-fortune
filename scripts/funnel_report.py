"""Print the signup-to-paid funnel from first-party events.

    python scripts/funnel_report.py            # last 30 days
    python scripts/funnel_report.py 7          # last 7 days
"""
import os, sqlite3, sys, time

DB = os.environ.get('DATABASE_PATH', os.path.join(os.path.dirname(__file__), '..', 'data', 'felt-and-fortune.sqlite3'))
days = int(sys.argv[1]) if len(sys.argv) > 1 else 30
since = time.strftime('%Y-%m-%d', time.localtime(time.time() - days * 86400))
c = sqlite3.connect(DB)
steps = ['landing_view', 'survey_start', 'plan_shown', 'signup', 'first_lesson', 'paywall_view', 'store_view', 'trial_start', 'purchase', 'cancel']
print(f'Funnel since {since} (unique people per step)\n')
prev = None
for s in steps:
    n = c.execute("SELECT COUNT(DISTINCT COALESCE(user_id, anon)) FROM events WHERE name=? AND day>=?", (s, since)).fetchone()[0]
    rate = f'{n / prev * 100:5.1f}% of previous' if prev else ''
    print(f'{s:14} {n:7}  {rate}')
    if n: prev = n
