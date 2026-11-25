"""Pro plan, Energy, Stars, streak freezes and repair, quests, pacing, checkpoints, and the age gate."""
import unittest, time
from datetime import date, timedelta
import server, economy, coach
import test_coach
from test_coach import NEW, EXPERT
from transcripts import lesson_transcript, item

TODAY = date.today()
DAY = lambda n=0: (TODAY + timedelta(days=n)).isoformat()


class EconomyTests(unittest.TestCase):
    setUpClass = test_coach.CoachApiTests.__dict__['setUpClass']
    tearDownClass = test_coach.CoachApiTests.__dict__['tearDownClass']
    setUp = test_coach.CoachApiTests.setUp
    signup = test_coach.CoachApiTests.signup
    finish = test_coach.CoachApiTests.finish

    def uid(self, client):
        return client.call('/api/me')[1]['user']['id']

    def complete(self, client, lesson_id, day, ok=True):
        steps = client.call(f'/api/path/lesson/{lesson_id}?day={day}')[1]['lesson']['steps']
        return client.call(f'/api/path/lesson/{lesson_id}/complete', 'POST', {'results': lesson_transcript(steps, ok), 'day': day})

    def test_adults_only(self):
        from test_api import Client
        c = Client(self.base); n = 'kid' + self.n
        status, body = c.call('/api/signup', 'POST', {'username': n, 'email': n + '@example.test', 'password': 'Test-password-only-42', 'birthYear': TODAY.year - 15})
        self.assertEqual(status, 403)
        self.assertEqual(c.call('/api/signup', 'POST', {'username': n, 'email': n + '@example.test', 'password': 'Test-password-only-42'})[0], 400)

    def test_energy_meters_free_practice_only(self):
        client, _, _ = self.signup(NEW)
        eco = client.call('/api/me/economy')[1]
        self.assertEqual((eco['energy'], eco['plan']['pro']), (25, False))
        # A logged round needs a started round, which costs Energy.
        self.assertEqual(client.call('/api/practice/log', 'POST', {'tool': 'count', 'results': [item('count')] * 3})[0], 402)
        for _ in range(8): self.assertEqual(client.call('/api/energy/start', 'POST', {'tool': 'strategy'})[0], 200)
        self.assertEqual(client.call('/api/challenge/start', 'POST', {})[0], 200)          # costs 3
        self.assertEqual(client.call('/api/me/economy')[1]['energy'], 14)
        self.assertEqual(client.call('/api/energy/start', 'POST', {'tool': 'weak'})[1]['energy'], 14)   # mistake review is free
        for _ in range(14): client.call('/api/energy/start', 'POST', {'tool': 'count'})
        status, body = client.call('/api/energy/start', 'POST', {'tool': 'count'})
        self.assertEqual((status, body['outOfEnergy']), (402, True))
        # Lessons never cost Energy.
        self.assertEqual(self.finish(client, 'sm1-1')[0], 200)
        # Pro is unlimited.
        client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-monthly'})
        status, body = client.call('/api/energy/start', 'POST', {'tool': 'count'})
        self.assertEqual((status, body['energy']), (200, None))

    def test_accurate_practice_earns_stars_and_energy_back(self):
        client, _, _ = self.signup(NEW)
        rid = client.call('/api/energy/start', 'POST', {'tool': 'count'})[1]['round']
        status, body = client.call('/api/practice/log', 'POST', {'tool': 'count', 'round': rid, 'results': [item('count')] * 15, 'bestStreak': 15, 'day': DAY()})
        self.assertEqual(status, 200)
        self.assertEqual((body['stars'] >= 5, body['energyBack']), (True, 2))
        self.assertEqual(client.call('/api/me/economy')[1]['energy'], 25)
        # A round can only be logged once.
        self.assertEqual(client.call('/api/practice/log', 'POST', {'tool': 'count', 'round': rid, 'results': [item('count')] * 5})[0], 402)

    def test_stars_buy_freezes_and_looks(self):
        client, _, _ = self.signup(NEW)
        self.assertEqual(client.call('/api/store/buy', 'POST', {'item': 'freeze'})[0], 402)
        r = self.finish(client, 'sm1-1')[1]
        self.assertGreaterEqual(r['stars'], 10)
        uid = self.uid(client)
        with server.db() as c: c.execute('UPDATE wallets SET stars=1000 WHERE user_id=?', (uid,))
        self.assertEqual(client.call('/api/store/buy', 'POST', {'item': 'freeze'})[1]['freezes'], 1)
        client.call('/api/store/buy', 'POST', {'item': 'freeze'})
        self.assertEqual(client.call('/api/store/buy', 'POST', {'item': 'freeze'})[0], 400)          # hold at most 2
        self.assertEqual(client.call('/api/store/equip', 'POST', {'kind': 'felt', 'value': 'royal'})[0], 400)
        eco = client.call('/api/store/buy', 'POST', {'item': 'felt-royal'})[1]
        self.assertEqual((eco['look']['felt'], eco['stars']), ('royal', 1000 - 400 - 300))
        self.assertEqual(client.call('/api/store/equip', 'POST', {'kind': 'felt', 'value': 'emerald'})[1]['look']['felt'], 'emerald')

    def test_freezes_cover_missed_days_and_repair_is_monthly(self):
        client, _, _ = self.signup(NEW); uid = self.uid(client)
        with server.db() as c:
            for n in (-4, -3, -2):
                c.execute('INSERT INTO xp_log(user_id,day,xp,lesson_id,created) VALUES(?,?,?,?,?)', (uid, DAY(n), 10, 'x', time.time()))
            c.execute('UPDATE wallets SET freezes=1 WHERE user_id=?', (uid,))
        eco = client.call(f'/api/me/economy?day={DAY()}')[1]
        self.assertEqual(eco['events'][0], {'type': 'freeze-used', 'days': [DAY(-1)]})
        self.assertEqual((eco['streak'], eco['freezes'], eco['repair']), (3, 1, None))   # used one, then earned one at the 3-day milestone
        # A second user with no freeze can repair once a month.
        other, _, _ = self.signup(NEW); oid = self.uid(other)
        with server.db() as c:
            for n in (-4, -3, -2):
                c.execute('INSERT INTO xp_log(user_id,day,xp,lesson_id,created) VALUES(?,?,?,?,?)', (oid, DAY(n), 10, 'x', time.time()))
        eco = other.call('/api/me/economy')[1]
        self.assertEqual((eco['streak'], eco['repair']['missed']), (0, [DAY(-1)]))
        self.assertEqual(other.call('/api/streak/repair', 'POST', {})[1]['streak'], 3)
        self.assertEqual(other.call('/api/streak/repair', 'POST', {})[0], 400)

    def test_streak_milestones_pay_once(self):
        client, _, _ = self.signup(NEW); uid = self.uid(client)
        with server.db() as c:
            for n in (-2, -1, 0):
                c.execute('INSERT INTO xp_log(user_id,day,xp,lesson_id,created) VALUES(?,?,?,?,?)', (uid, DAY(n), 10, 'x', time.time()))
        eco = client.call('/api/me/economy')[1]
        self.assertEqual([e['days'] for e in eco['events'] if e['type'] == 'milestone'], [3])
        self.assertEqual((eco['stars'], eco['freezes']), (25, 1))
        self.assertEqual(client.call('/api/me/economy')[1]['events'], [])

    def test_quests_claim_once(self):
        client, _, _ = self.signup(NEW)
        self.assertEqual(client.call('/api/quests/claim', 'POST', {'quest': 'lesson'})[0], 400)
        self.finish(client, 'sm1-1')
        before = client.call('/api/me/economy')[1]['stars']
        r = client.call('/api/quests/claim', 'POST', {'quest': 'lesson'})[1]
        self.assertEqual(r['stars'] if 'quests' not in r else r['stars'] - before, 15)
        self.assertEqual(client.call('/api/quests/claim', 'POST', {'quest': 'lesson'})[0], 400)

    def test_two_new_lessons_a_day(self):
        client, _, _ = self.signup(NEW)
        self.assertEqual(self.finish(client, 'sm1-1')[0], 200)
        self.assertEqual(self.finish(client, 'sm1-2')[0], 200)
        status, body = client.call('/api/path/lesson/sm1-3')
        self.assertEqual(status, 423)
        self.assertIn('tomorrow', body['error'])
        state = client.call('/api/path')[1]
        self.assertEqual(state['pacing']['blocked'], 'daily-cap')
        self.assertEqual(client.call('/api/path/lesson/sm1-1')[0], 200)                 # replays stay open
        self.assertEqual(client.call(f'/api/path/lesson/sm1-3?day={DAY(1)}')[0], 200)   # opens the next day

    def test_checkpoint_needs_two_days(self):
        server.PACING['daily_new'] = 99
        try:
            client, _, _ = self.signup(NEW); uid = self.uid(client)
            for l in coach.UNIT_BY_ID['sm1']['lessons']:
                self.assertEqual(self.finish(client, l['id'])[0], 200)
            self.assertEqual(client.call('/api/path')[1]['current'], 'sm1-checkpoint')
            self.assertEqual(client.call('/api/path/lesson/sm1-checkpoint')[0], 423)        # not the same day
            r = self.complete(client, 'sm1-checkpoint', DAY(1), ok=False)[1]
            self.assertEqual(r['checkpoint']['passed'], False)
            r = self.complete(client, 'sm1-checkpoint', DAY(1))[1]
            self.assertEqual((r['checkpoint']['passed'], r['current']), (True, 'sm1-checkpoint'))
            self.assertEqual(client.call(f'/api/path/lesson/sm1-checkpoint?day={DAY(1)}')[0], 423)   # again, but another day
            with server.db() as c: c.execute('INSERT INTO checkpoint_passes VALUES(?,?,?,?)', (uid, 'sm1-checkpoint', DAY(-5), 95))
            self.assertEqual(client.call('/api/path')[1]['current'], 'sm2-1')
        finally:
            server.PACING['daily_new'] = economy.DAILY_NEW_LESSONS

    def test_pro_units_and_trial(self):
        client, _, _ = self.signup({**NEW, 'goal': 'count'})
        state = client.call('/api/path')[1]
        self.assertFalse(state['units'][0]['pro']); self.assertTrue(state['units'][1]['pro'])
        eco = client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-annual'})[1]
        self.assertEqual((eco['plan']['pro'], eco['plan']['status'], eco['energy']), (True, 'trial', None))
        self.assertIsNotNone(eco['plan']['trialEnds'])
        eco = client.call('/api/billing/cancel', 'POST', {})[1]
        self.assertFalse(eco['plan']['pro'])                        # canceling in the trial ends it with no charge
        eco = client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-annual'})[1]
        self.assertEqual(eco['plan']['status'], 'active')            # one trial per account
        eco = client.call('/api/billing/cancel', 'POST', {})[1]
        self.assertTrue(eco['plan']['pro'])                          # paid period runs to its end
        self.assertEqual(client.call('/api/billing/test-purchase', 'POST', {'plan': 'gold'})[0], 400)


if __name__ == '__main__':
    unittest.main()
