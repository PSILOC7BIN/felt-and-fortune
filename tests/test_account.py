"""Data export, account deletion, receipts, trial/renewal reminders, and first-party analytics events."""
import json, time, unittest, urllib.request
import server, account
import test_coach
from test_coach import NEW


class AccountTests(unittest.TestCase):
    setUpClass = test_coach.CoachApiTests.__dict__['setUpClass']
    tearDownClass = test_coach.CoachApiTests.__dict__['tearDownClass']
    setUp = test_coach.CoachApiTests.setUp
    signup = test_coach.CoachApiTests.signup
    finish = test_coach.CoachApiTests.finish

    def uid(self, client):
        return client.call('/api/me')[1]['user']['id']

    def test_export_has_my_data_and_no_secrets(self):
        client, _, _ = self.signup(NEW)
        self.finish(client, 'sm1-1')
        status, data = client.call('/api/account/export')
        self.assertEqual(status, 200)
        self.assertNotIn('password', data['account'])
        self.assertEqual(data['plans'][0]['plan']['track'], 'smart')
        self.assertTrue(any(r['lesson_id'] == 'sm1-1' for r in data['lesson_progress']))
        self.assertNotIn('sessions', data)

    def test_delete_needs_password_and_removes_everything(self):
        client, _, _ = self.signup(NEW); uid = self.uid(client)
        self.finish(client, 'sm1-1')
        self.assertEqual(client.call('/api/account/delete', 'POST', {'password': 'wrong-password'})[0], 400)
        self.assertEqual(client.call('/api/account/delete', 'POST', {'password': 'Test-password-only-42'})[0], 200)
        self.assertIsNone(client.call('/api/me')[1]['user'])
        with server.db() as c:
            for t in ('users', 'plans', 'lesson_progress', 'xp_log', 'wallets', 'sessions', 'records', 'activity'):
                col = 'id' if t == 'users' else 'owner' if t == 'records' else 'user_id'
                self.assertEqual(c.execute(f'SELECT COUNT(*) FROM {t} WHERE {col}=?', (uid,)).fetchone()[0], 0, t)

    def test_receipts_and_cancellation_emails(self):
        client, _, _ = self.signup(NEW); uid = self.uid(client)
        client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-annual'})
        client.call('/api/billing/cancel', 'POST', {})
        with server.db() as c:
            kinds = [r['kind'] for r in c.execute('SELECT kind FROM outbox WHERE user_id=? ORDER BY id', (uid,))]
            body = c.execute("SELECT body FROM outbox WHERE user_id=? AND kind='receipt'", (uid,)).fetchone()['body']
        self.assertEqual(kinds, ['receipt', 'cancel'])
        self.assertIn('$49.99', body); self.assertIn('Trial ends', body)

    def test_trial_reminder_sent_once(self):
        client, _, _ = self.signup(NEW); uid = self.uid(client)
        client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-annual'})
        with server.db() as c:
            self.assertEqual(account.run_reminders(c), 0)                       # 14 days out: too early
            later = time.time() + 12 * 86400
            account.run_reminders(c, later)
            account.run_reminders(c, later + 3600)
            n = c.execute("SELECT COUNT(*) FROM outbox WHERE user_id=? AND kind='trial-reminder'", (uid,)).fetchone()[0]
        self.assertEqual(n, 1)

    def test_streak_nudge_once_and_respects_prefs(self):
        from datetime import date, timedelta
        evening = time.mktime(date.today().timetuple()) + 19 * 3600
        days = [(date.today() - timedelta(days=n)).isoformat() for n in (2, 1)]
        made = []
        for _ in range(3):
            client, _, _ = self.signup(NEW); uid = self.uid(client); made.append((client, uid))
            with server.db() as c:
                for d in days: c.execute('INSERT INTO xp_log(user_id,day,xp,lesson_id,created) VALUES(?,?,?,?,?)', (uid, d, 10, 'x', time.time()))
        made[1][0].call('/api/prefs', 'POST', {'streak_email': False})
        made[2][0].call('/api/prefs', 'POST', {'breakDays': 7})
        with server.db() as c:
            account.streak_nudges(c, evening); account.streak_nudges(c, evening + 60)
            counts = [c.execute("SELECT COUNT(*) FROM outbox WHERE user_id=? AND kind='streak'", (u,)).fetchone()[0] for _, u in made]
            self.assertEqual(account.streak_nudges(c, evening - 6 * 3600), 0)          # too early in the day
        self.assertEqual(counts, [1, 0, 0])

    def test_events_whitelist(self):
        client, _, _ = self.signup(NEW); uid = self.uid(client)
        client.call('/api/events', 'POST', {'name': 'paywall_view', 'props': {'from': 'test'}})
        client.call('/api/events', 'POST', {'name': 'not_a_real_event'})
        with server.db() as c:
            names = {r['name'] for r in c.execute('SELECT name FROM events WHERE user_id=?', (uid,))}
        self.assertIn('signup', names); self.assertIn('paywall_view', names); self.assertNotIn('not_a_real_event', names)


if __name__ == '__main__':
    unittest.main()
