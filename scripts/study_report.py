"""Summarize a user-testing session from the app's database.

Usage:
  python scripts/study_report.py --since 2026-11-25            (uses DATABASE_PATH or data/ap-toolbox.sqlite3)
  python scripts/study_report.py --db path/to.sqlite3 --since 2026-11-25 --csv study.csv

Reports, for accounts created on or after --since: how many signed up through the survey, how many finished
a lesson and a practice session, lesson accuracy, ratings by area, and every comment. Only aggregates and
the testers' own comments are printed; no emails or passwords.
"""
import argparse, csv, os, sqlite3, statistics
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--db', default=os.environ.get('DATABASE_PATH', str(ROOT / 'data' / 'ap-toolbox.sqlite3')))
    ap.add_argument('--since', required=True, help='YYYY-MM-DD: only accounts created on or after this day')
    ap.add_argument('--csv', help='optional path for a per-tester CSV')
    a = ap.parse_args()
    since = datetime.fromisoformat(a.since).timestamp()
    c = sqlite3.connect(a.db); c.row_factory = sqlite3.Row
    users = c.execute('SELECT id, username, created FROM users WHERE created >= ? ORDER BY created', (since,)).fetchall()
    if not users:
        print('No accounts were created since', a.since); return
    ids = [u['id'] for u in users]; q = ','.join('?' * len(ids))
    plans = {r[0] for r in c.execute(f'SELECT user_id FROM plans WHERE user_id IN ({q})', ids)}
    lessons = {}
    for r in c.execute(f'SELECT user_id, COUNT(*) n, AVG(best) acc FROM lesson_progress WHERE user_id IN ({q}) GROUP BY user_id', ids): lessons[r[0]] = (r[1], r[2])
    practice = {}
    for r in c.execute(f'SELECT user_id, COUNT(*) n, SUM(questions) qs, SUM(correct) ok FROM practice_log WHERE user_id IN ({q}) GROUP BY user_id', ids): practice[r[0]] = (r[1], r[2], r[3])
    challenge = {r[0]: r[1] for r in c.execute(f'SELECT user_id, MAX(score) FROM games WHERE finished=1 AND user_id IN ({q}) GROUP BY user_id', ids)}
    fb = c.execute(f'SELECT user_id, rating, area, page, comment FROM feedback WHERE user_id IN ({q}) ORDER BY created', ids).fetchall()

    n = len(users)
    pct = lambda k: f'{k}/{n} ({round(100 * k / n)}%)'
    print(f'Testers (accounts created since {a.since}): {n}')
    print('Built a plan through the survey:  ', pct(len(plans)))
    print('Finished at least one lesson:     ', pct(len(lessons)))
    print('Finished a practice session:      ', pct(len(practice)))
    print('Finished a Shoe Challenge:        ', pct(len(challenge)))
    if lessons:
        accs = [v[1] for v in lessons.values()]
        print(f'Lessons per tester: mean {statistics.mean(v[0] for v in lessons.values()):.1f}; first-try accuracy: mean {statistics.mean(accs):.0f}%, median {statistics.median(accs):.0f}%')
    if practice:
        qs = sum(v[1] for v in practice.values()); ok = sum(v[2] for v in practice.values())
        print(f'Practice: {qs} questions answered, {round(100 * ok / qs)}% correct')
    if fb:
        print(f'\nFeedback: {len(fb)} responses, mean rating {statistics.mean(r["rating"] for r in fb):.2f} / 5')
        for area in sorted({r['area'] for r in fb}):
            rs = [r['rating'] for r in fb if r['area'] == area]
            print(f'  {area:<10} n={len(rs):<3} mean {statistics.mean(rs):.2f}')
        comments = [r for r in fb if (r['comment'] or '').strip()]
        if comments:
            print('\nComments:')
            for r in comments: print(f'  [{r["area"]}, {r["rating"]}/5] {r["comment"].strip()}')
    else:
        print('\nNo feedback responses yet.')
    if a.csv:
        with open(a.csv, 'w', newline='', encoding='utf-8') as f:
            w = csv.writer(f); w.writerow(['tester', 'plan', 'lessons', 'lesson_accuracy', 'practice_sessions', 'challenge_best', 'ratings'])
            for i, u in enumerate(users, 1):
                l = lessons.get(u['id'], (0, None)); p = practice.get(u['id'], (0, 0, 0))
                w.writerow([f'T{i}', u['id'] in plans, l[0], round(l[1]) if l[1] is not None else '', p[0], challenge.get(u['id'], ''), ' '.join(str(r['rating']) for r in fb if r['user_id'] == u['id'])])
        print('\nWrote', a.csv, '(testers are numbered T1, T2, … with no names)')


if __name__ == '__main__':
    main()
