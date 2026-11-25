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

    def log(self, client, tool, results):
        rid = client.call('/api/energy/start', 'POST', {'tool': tool})[1]['round']
        return client.call('/api/practice/log', 'POST', {'tool': tool, 'round': rid, 'results': results})

    def test_energy_per_answer_with_streak_bonus(self):
        client, _, _ = self.signup(NEW); uid = self.uid(client)
        self.assertEqual(client.call('/api/me/economy')[1]['energy'], 25)
        r = self.log(client, 'strategy', [item('strategy')] * 6)[1]
        self.assertEqual(r['energy'], {'energy': 23, 'spent': 6, 'bonus': 4})       # 6 answers, two runs of 3 correct
        r = self.log(client, 'strategy', [item('strategy', ok=False)] * 3)[1]
        self.assertEqual(r['energy']['energy'], 20)
        self.assertEqual(self.log(client, 'weak', [item('strategy', ok=False)] * 3)[1]['energy']['energy'], None)   # mistake review is free
        self.assertEqual(client.call('/api/me/economy')[1]['energy'], 20)
        self.assertEqual(client.call('/api/challenge/start', 'POST', {})[0], 200)   # the Shoe Challenge costs 3 up front
        self.assertEqual(client.call('/api/me/economy')[1]['energy'], 17)
        with server.db() as c: c.execute('UPDATE wallets SET energy=0, energy_at=? WHERE user_id=?', (time.time(), uid))
        status, body = client.call('/api/path/lesson/sm1-1')
        self.assertEqual((status, body.get('outOfEnergy')), (402, True))
        self.assertEqual(client.call('/api/energy/start', 'POST', {'tool': 'count'})[0], 402)
        self.assertEqual(client.call('/api/practice/log', 'POST', {'tool': 'count', 'results': [item('count')] * 3})[0], 402)
        client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-monthly'})
        self.assertEqual(client.call('/api/path/lesson/sm1-1')[0], 200)
        self.assertIsNone(client.call('/api/me/economy')[1]['energy'])

    def test_lessons_settle_energy(self):
        client, _, _ = self.signup(NEW)
        r = self.finish(client, 'sm1-1')[1]
        self.assertEqual(r['energy']['energy'], 25 - r['energy']['spent'] + r['energy']['bonus'] if r['energy']['spent'] < 25 else r['energy']['energy'])
        self.assertGreater(r['energy']['spent'], 0)
        self.assertGreater(r['energy']['bonus'], 0)

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
        self.assertEqual((eco['look']['felt'], eco['stars']), ('royal', 1000 - 400 - 150))
        self.assertEqual(client.call('/api/store/equip', 'POST', {'kind': 'felt', 'value': 'emerald'})[1]['look']['felt'], 'emerald')

    def test_sets_pro_gold_and_event_items(self):
        client, _, _ = self.signup(NEW); uid = self.uid(client)
        with server.db() as c: c.execute('UPDATE wallets SET stars=5000 WHERE user_id=?', (uid,))
        st = client.call('/api/store')[1]
        vegas = next(x for x in st['sets'] if x['id'] == 'vegas')
        self.assertEqual(vegas['price'], 1360)                        # (400 + 900 + 400) x 0.8
        self.assertEqual(len(st['featured']['items']), 3)
        eco = client.call('/api/store/buy-set', 'POST', {'set': 'vegas'})[1]
        self.assertEqual(eco['stars'], 5000 - 1360 + 200)             # set bonus paid once
        self.assertEqual(client.call('/api/store/buy-set', 'POST', {'set': 'vegas'})[0], 400)
        self.assertEqual(client.call('/api/store/equip', 'POST', {'kind': 'coach', 'value': 'sunglasses'})[1]['look']['coach'], 'sunglasses')
        self.assertEqual(client.call('/api/store/buy', 'POST', {'item': 'back-event-winter'})[0], 400)
        self.assertEqual(client.call('/api/store/buy', 'POST', {'item': 'back-pro'})[0], 402)
        client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-monthly'})
        self.assertIn('back-pro', client.call('/api/store/buy', 'POST', {'item': 'back-pro'})[1]['owned'])

    def test_chip_packs_add_chips_with_a_receipt(self):
        client, _, _ = self.signup(NEW); uid = self.uid(client)
        before = client.call('/api/me/economy')[1]['stars']
        r = client.call('/api/billing/test-chips', 'POST', {'pack': 'chips-1400'})[1]
        self.assertEqual((r['added'], r['stars']), (1400, before + 1400))
        self.assertEqual(client.call('/api/billing/test-chips', 'POST', {'pack': 'chips-999999'})[0], 400)
        self.assertIn('chipPacks', client.call('/api/store')[1])
        with server.db() as c:
            self.assertEqual(c.execute("SELECT COUNT(*) FROM outbox WHERE user_id=? AND kind='receipt'", (uid,)).fetchone()[0], 1)

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

    def test_quest_board_claims_rerolls_and_events(self):
        client, _, _ = self.signup(NEW); uid = self.uid(client)
        b = client.call('/api/quests')[1]
        self.assertEqual([q['tier'] for q in b['daily']], ['easy', 'medium', 'hard'])
        self.assertEqual(len({q['id'] for q in b['weekly']}), 2)
        self.assertEqual(client.call('/api/quests')[1]['daily'][0]['id'], b['daily'][0]['id'])      # picks are stable
        with server.db() as c: c.execute("UPDATE quest_picks SET quest='lesson1' WHERE user_id=? AND period=? AND slot=0", (uid, 'd:' + DAY()))
        self.assertEqual(client.call('/api/quests/claim', 'POST', {'quest': 'd:lesson1'})[0], 400)
        self.finish(client, 'sm1-1')
        r = client.call('/api/quests/claim', 'POST', {'quest': 'd:lesson1'})[1]
        self.assertEqual(r['reward'], {'stars': 5})
        self.assertEqual(client.call('/api/quests/claim', 'POST', {'quest': 'd:lesson1'})[0], 400)
        # One free reroll a day, only for unfinished quests.
        with server.db() as c: c.execute("UPDATE quest_picks SET quest='weak1' WHERE user_id=? AND period=? AND slot=1", (uid, 'd:' + DAY()))
        before = client.call('/api/quests')[1]['daily'][1]['id']
        self.assertNotEqual(client.call('/api/quests/reroll', 'POST', {'slot': 1})[1]['daily'][1]['id'], before)
        self.assertEqual(client.call('/api/quests/reroll', 'POST', {'slot': 2})[0], 400)
        self.assertEqual(client.call('/api/quests/claim', 'POST', {'quest': 'all-daily'})[0], 400)
        # Weekly dailies track and the monthly event.
        with server.db() as c:
            for i in range(20): c.execute('INSERT INTO quest_done VALUES(?,?,?,?)', (uid, f'd:{DAY()}x{i}', f'q{i}', DAY()))
        r = client.call('/api/quests/claim', 'POST', {'quest': 'track-10'})[1]
        self.assertEqual(r['reward'], {'stars': 60, 'freeze': 1})
        self.assertEqual(r['freezes'], 1)
        ev = r['board']['event']
        self.assertTrue(ev['earned'])
        self.assertIn(ev['reward'], client.call('/api/store')[1]['owned'])

    def test_free_energy_claim_is_hourly(self):
        client, _, _ = self.signup(NEW); uid = self.uid(client)
        self.assertEqual(client.call('/api/energy/claim', 'POST', {})[0], 400)            # already full
        with server.db() as c: c.execute('UPDATE wallets SET energy=10, energy_at=? WHERE user_id=?', (server.time.time(), uid))
        eco = client.call('/api/me/economy')[1]
        self.assertEqual((eco['energy'], eco['energyClaimIn'], eco['energyMax']), (10, 0, 25))
        self.assertGreater(eco['energyFullIn'], 0)
        r = client.call('/api/energy/claim', 'POST', {})[1]
        self.assertEqual((r['added'], r['energy']), (5, 15)); self.assertGreater(r['energyClaimIn'], 3500)
        self.assertEqual(client.call('/api/energy/claim', 'POST', {})[0], 429)            # once an hour
        with server.db() as c: c.execute('UPDATE energy_claims SET at=at-3601 WHERE user_id=?', (uid,))
        self.assertEqual(client.call('/api/energy/claim', 'POST', {})[1]['energy'], 20)

    def test_checkpoint_opens_at_skill_target(self):
        client, _, _ = self.signup(NEW); uid = self.uid(client)
        client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-monthly'})
        for l in coach.UNIT_BY_ID['sm1']['lessons']:
            self.assertEqual(self.finish(client, l['id'])[0], 200)
        with server.db() as c: c.execute('DELETE FROM skill_rating WHERE user_id=?', (uid,))
        st = client.call('/api/path')[1]
        self.assertEqual(st['current'], 'sm1-checkpoint')
        cp = st['units'][0]['lessons'][-1]
        self.assertEqual((cp['status'], cp['gate'][0]['skill'], cp['gate'][0]['met']), ('gated', 'strategy-hard', False))
        self.assertEqual(client.call('/api/path/lesson/sm1-checkpoint')[0], 423)
        with server.db() as c: c.execute("INSERT INTO skill_rating VALUES(?,?,?,?,?)", (uid, 'strategy-hard', 1700, 40, 0))
        self.assertEqual(client.call('/api/path/lesson/sm1-checkpoint')[0], 200)
        r = self.complete(client, 'sm1-checkpoint', DAY(0), ok=False)[1]
        self.assertEqual((r['checkpoint']['passed'], r['current']), (False, 'sm1-checkpoint'))
        r = self.complete(client, 'sm1-checkpoint', DAY(0))[1]
        self.assertEqual((r['checkpoint']['passed'], r['current']), (True, 'sm2-1'))   # one pass, same day, is enough

    def test_pro_units_and_trial(self):
        client, _, _ = self.signup({**NEW, 'goal': 'count'})
        state = client.call('/api/path')[1]
        self.assertFalse(state['units'][0]['pro']); self.assertTrue(next(u for u in state['units'] if u['id'] == 'cc2')['pro'])
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
