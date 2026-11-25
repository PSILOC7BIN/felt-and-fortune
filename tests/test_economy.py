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
        # Pin the hard quest to one the finished lesson can't complete (a random pick like 'perfect1' would be done already).
        with server.db() as c: c.execute("UPDATE quest_picks SET quest='acc90x4' WHERE user_id=? AND period=? AND slot=2", (uid, 'd:' + DAY()))
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

    def test_placement_check_and_badges(self):
        from test_api import Client
        anon = Client(self.base)
        ok = {q['id']: coach.PLACEMENT_ANSWERS[q['id']] for q in coach.SURVEY if q.get('stage') == 1}
        r = anon.call('/api/placement/check', 'POST', {'stage': 1, 'answers': ok})[1]
        self.assertEqual((r['passed'], r['correct'], r['last']), (True, 3, False))
        self.assertFalse(anon.call('/api/placement/check', 'POST', {'stage': 4, 'answers': ok})[1]['passed'])
        client, _, _ = self.signup(NEW); uid = self.uid(client)
        self.finish(client, 'sm1-1')
        with server.db() as c: c.execute('INSERT INTO badges VALUES(?,?,?)', (uid, 'event-2026-10', '2026-10-30'))
        b = client.call('/api/badges')[1]
        ids = [x['id'] for x in b['earned']]
        self.assertEqual(ids[0], 'event-2026-10'); self.assertIn('first-lesson', ids); self.assertEqual(b['events'], 1)
        self.assertNotIn('first-lesson', [x['id'] for x in b['locked']])
        self.assertEqual(client.call('/api/friends')[1]['board'][0]['badges'][0]['tier'], 'event')

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


class ToolsAndPathTests(unittest.TestCase):
    setUpClass = EconomyTests.__dict__['setUpClass']
    tearDownClass = EconomyTests.__dict__['tearDownClass']
    setUp = EconomyTests.setUp
    signup = EconomyTests.signup
    log = EconomyTests.log

    def test_skill_trainers_log_and_move_their_rating(self):
        client, _, _ = self.signup(NEW)
        status, body = self.log(client, 'skill-strategy-hard', [item('strategy')] * 5)
        self.assertEqual(status, 200, body)
        skills = {s['skill']: s for s in client.call('/api/skills')[1]['skills']}
        self.assertGreater(skills['strategy-hard']['rating'], 1000)
        self.assertEqual(client.call('/api/energy/start', 'POST', {'tool': 'skill-nope'})[0], 200)   # starting is generic
        self.assertEqual(client.call('/api/practice/log', 'POST', {'tool': 'skill-nope', 'results': []})[0], 400)

    def test_free_units_come_before_one_block_of_pro_units(self):
        client, _, _ = self.signup(NEW)
        units = client.call('/api/path')[1]['units']
        flags = [u['pro'] for u in units]
        first_pro = flags.index(True)
        self.assertTrue(all(flags[first_pro:]), 'a free unit appears after a Pro unit')
        self.assertEqual(client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-monthly'})[0], 200)
        self.assertEqual([u['id'] for u in client.call('/api/path')[1]['units']], [u['id'] for u in coach.path_units(client.call('/api/path')[1]['plan'])])

    def test_checkpoint_gates_point_at_skill_trainers(self):
        self.assertTrue(all(v.startswith('/practice/skill/') for v in coach.SKILL_TOOL.values()))

    def test_casino_map_data_is_pro_only(self):
        from test_api import Client
        client, _, _ = self.signup(NEW)
        self.assertEqual(client.call('/api/casinos')[0], 402)
        self.assertEqual(Client(self.base).call('/api/casinos')[0], 401)
        self.assertEqual(client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-monthly'})[0], 200)
        status, body = client.call('/api/casinos')
        self.assertEqual(status, 200); self.assertGreater(len(body['casinos']), 100)
        import urllib.request, urllib.error
        with self.assertRaises(urllib.error.HTTPError) as e: urllib.request.urlopen(self.base + '/casinos.json')
        self.assertEqual(e.exception.code, 404)
        page = urllib.request.urlopen(self.base + '/blackjack-casino-rules').read().decode()
        self.assertNotIn('house edge ·', page); self.assertIn('Pro Casino Map', page)

    def test_weakness_map_tracks_each_chart_cell(self):
        import learning
        self.assertEqual(learning.cell_of({'kind': 'strategy', 'data': {'cards': [10, 6], 'dealer': 13}}), ('H16', 10))
        self.assertEqual(learning.cell_of({'kind': 'strategy', 'data': {'cards': [1, 7], 'dealer': 9}}), ('S18', 9))
        self.assertEqual(learning.cell_of({'kind': 'strategy', 'data': {'cards': [12, 13], 'dealer': 1}}), ('P10', 1))
        self.assertEqual(learning.cell_of({'kind': 'strategy', 'data': {'cards': [1, 1], 'dealer': 6}}), ('PA', 6))
        self.assertIsNone(learning.cell_of({'kind': 'count', 'data': {'cards': [2, 3]}}))
        client, _, _ = self.signup(NEW)
        self.assertEqual(self.log(client, 'drill', [item('strategy')] * 3 + [item('strategy', ok=False)])[0], 200)
        w = client.call('/api/weakness')[1]
        self.assertEqual(w['cells'], [{'cell': 'H16', 'up': 10, 'attempts': 4, 'misses': 1, 'last': w['cells'][0]['last']}])
        self.assertEqual((w['decisions'], w['misses'], w['pro']), (4, 1, False))


class ArcadeTests(unittest.TestCase):
    setUpClass = EconomyTests.__dict__['setUpClass']
    tearDownClass = EconomyTests.__dict__['tearDownClass']
    setUp = EconomyTests.setUp
    signup = EconomyTests.signup

    def test_daily_hand_once_a_day_with_split(self):
        import arcade
        a, _, _ = self.signup(NEW); b, _, _ = self.signup(NEW)
        day = DAY(); hand = arcade.daily_hand(day)
        self.assertNotIn('answer', a.call(f'/api/daily?day={day}')[1])          # never leaks before answering
        wrong = next(x for x in hand['actions'] if x != hand['answer'])
        r = a.call('/api/daily/answer', 'POST', {'given': hand['answer'], 'day': day})[1]
        self.assertTrue(r['ok']); self.assertEqual(r['xp'], 5); self.assertEqual(r['streak'], 1)
        self.assertEqual(a.call('/api/daily/answer', 'POST', {'given': wrong, 'day': day})[0], 409)
        r = b.call('/api/daily/answer', 'POST', {'given': wrong, 'day': day})[1]
        self.assertFalse(r['ok']); self.assertEqual(r['n'], 2); self.assertEqual(r['split'], {hand['answer']: 50, wrong: 50})
        self.assertEqual(b.call('/api/daily/answer', 'POST', {'given': 'Z', 'day': DAY(1)})[0], 400)

    def test_daily_hands_are_valid_every_day(self):
        import arcade
        for i in range(60):
            h = arcade.daily_hand(DAY(i)); self.assertIn(h['answer'], h['actions'])

    def test_rush_is_graded_and_limited_on_the_server(self):
        import arcade, json as _j
        client, _, _ = self.signup(NEW)
        run = client.call('/api/rush/start', 'POST', {'mode': 'rush'})[1]
        self.assertNotIn('answer', _j.dumps(run['q']).lower())
        with server.db() as c: q = _j.loads(c.execute('SELECT state FROM rush_runs WHERE id=?', (run['id'],)).fetchone()['state'])['q']
        r = client.call('/api/rush/answer', 'POST', {'id': run['id'], 'given': arcade.rush_answer(q)})[1]
        self.assertTrue(r['ok']); self.assertEqual(r['score'], 1)
        for _ in range(3): r = client.call('/api/rush/answer', 'POST', {'id': run['id'], 'given': 'X'})[1]
        self.assertTrue(r['done']); self.assertEqual((r['score'], r['strikes'], r['best']), (1, 3, 1))
        self.assertEqual(client.call('/api/rush/answer', 'POST', {'id': run['id'], 'given': 'H'})[0], 404)
        self.assertEqual(client.call('/api/rush/start', 'POST', {'mode': 'rush'})[0], 402)          # one free run a day
        self.assertEqual(client.call('/api/rush/start', 'POST', {'mode': 'storm'})[0], 200)         # per mode
        board = client.call('/api/rush/board?mode=rush')[1]
        self.assertEqual((board['best'], board['left'], board['week'][0]['best']), (1, 0, 1))

    def test_rush_late_answers_are_strikes(self):
        import arcade, json as _j
        client, _, _ = self.signup(NEW)
        run = client.call('/api/rush/start', 'POST', {'mode': 'rush'})[1]
        with server.db() as c:
            st = _j.loads(c.execute('SELECT state FROM rush_runs WHERE id=?', (run['id'],)).fetchone()['state']); st['asked'] -= 60
            c.execute('UPDATE rush_runs SET state=? WHERE id=?', (_j.dumps(st), run['id']))
        r = client.call('/api/rush/answer', 'POST', {'id': run['id'], 'given': arcade.rush_answer(st['q'])})[1]
        self.assertFalse(r['ok']); self.assertTrue(r['late'])

    def test_saving_drills_is_pro(self):
        client, _, _ = self.signup(NEW)
        spec = {'cells': [['H16', 10], ['S18', 9]], 'rules': {'h17': 'mix'}, 'size': 20}
        self.assertEqual(client.call('/api/drills', 'POST', {'name': 'Stiffs', 'spec': spec})[0], 402)
        client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-monthly'})
        self.assertEqual(client.call('/api/drills', 'POST', {'name': 'Stiffs', 'tag': 'Hard', 'spec': spec})[0], 201)
        self.assertEqual(client.call('/api/drills', 'POST', {'name': 'Bad', 'spec': {'cells': [['H16', 12]]}})[0], 400)
        d = client.call('/api/drills')[1]['drills']
        self.assertEqual((len(d), d[0]['tag'], d[0]['spec']['rules']['h17'], d[0]['spec']['size']), (1, 'Hard', 'mix', 20))
        client.call('/api/drills/delete', 'POST', {'id': d[0]['id']})
        self.assertEqual(client.call('/api/drills')[1]['drills'], [])


class ProgressTests(unittest.TestCase):
    setUpClass = EconomyTests.__dict__['setUpClass']
    tearDownClass = EconomyTests.__dict__['tearDownClass']
    setUp = EconomyTests.setUp
    signup = EconomyTests.signup

    def _answers(self, tid):
        import json as _j
        with server.db() as c: return [it['answer'] for it in _j.loads(c.execute('SELECT state FROM testouts WHERE id=?', (tid,)).fetchone()['state'])['items']]

    def test_testout_is_pro_monthly_and_certifies_a_pass(self):
        from test_api import Client
        client, _, _ = self.signup(NEW)
        self.assertEqual(client.call('/api/testout/start', 'POST', {})[0], 402)
        client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-monthly'})
        run = client.call('/api/testout/start', 'POST', {})[1]
        self.assertNotIn('answer', run['item'])
        for a in self._answers(run['id']): r = client.call('/api/testout/answer', 'POST', {'id': run['id'], 'given': a})[1]
        self.assertTrue(r['done']); self.assertTrue(r['passed']); self.assertTrue(all(s['passed'] for s in r['results']))
        cert = Client(self.base).call('/api/certificate/' + r['certificate'])          # public, no sign-in
        self.assertEqual(cert[0], 200); self.assertEqual(set(cert[1]), {'id', 'username', 'day', 'results'})
        self.assertEqual(client.call('/api/testout/start', 'POST', {})[0], 429)        # one attempt a month
        st = client.call('/api/testout')[1]; self.assertFalse(st['available']); self.assertTrue(st['attempts'][0]['passed'])

    def test_failed_testout_has_no_certificate(self):
        from test_api import Client
        client, _, _ = self.signup(NEW); client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-monthly'})
        run = client.call('/api/testout/start', 'POST', {})[1]
        for a in self._answers(run['id']): r = client.call('/api/testout/answer', 'POST', {'id': run['id'], 'given': 'nope'})[1]
        self.assertFalse(r['passed']); self.assertIsNone(r['certificate'])
        self.assertEqual(Client(self.base).call('/api/certificate/' + run['id'])[0], 404)

    def test_battle_replays_the_same_hands(self):
        import arcade, json as _j
        host, _, _ = self.signup(NEW); guest, _, _ = self.signup(NEW)
        host.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-monthly'})
        run = host.call('/api/rush/start', 'POST', {'mode': 'rush'})[1]; first = run['q']
        for _ in range(3): host.call('/api/rush/answer', 'POST', {'id': run['id'], 'given': 'X'})
        guest.call('/api/rush/start', 'POST', {'mode': 'rush'})                         # guest's free run today
        b = guest.call('/api/rush/start', 'POST', {'mode': 'rush', 'battle': run['id']})
        self.assertEqual(b[0], 200); self.assertEqual(b[1]['q']['cards'], first['cards']); self.assertEqual(b[1]['q']['dealer'], first['dealer'])
        with server.db() as c: q = _j.loads(c.execute('SELECT state FROM rush_runs WHERE id=?', (b[1]['id'],)).fetchone()['state'])['q']
        guest.call('/api/rush/answer', 'POST', {'id': b[1]['id'], 'given': arcade.rush_answer(q)})
        for _ in range(3): guest.call('/api/rush/answer', 'POST', {'id': b[1]['id'], 'given': 'X'})
        res = guest.call('/api/rush/battle/' + run['id'])[1]
        self.assertEqual((res['hostScore'], res['challengers'][0]['score'], res['played']), (0, 1, True))
        self.assertEqual(guest.call('/api/rush/start', 'POST', {'mode': 'rush', 'battle': run['id']})[0], 400)   # once per battle
        self.assertEqual(host.call('/api/rush/start', 'POST', {'mode': 'rush', 'battle': run['id']})[0], 400)    # not your own

    def test_skill_score_history_and_report(self):
        client, _, _ = self.signup(NEW)
        self.assertEqual(client.call('/api/skillscore', 'POST', {'edge': 0.62})[0], 200)
        self.assertEqual(client.call('/api/skillscore', 'POST', {'edge': 99})[0], 400)
        self.assertEqual(client.call('/api/skillscore')[1]['history'][-1]['edge'], 0.62)
        r = client.call('/api/report')[1]
        self.assertEqual(r['skillScore'][1], 0.62); self.assertIn('xp', r['this']); self.assertFalse(r['pro'])

    def test_weekly_email_goes_to_active_pro_members_on_monday(self):
        import progress, account, time as _t
        from datetime import datetime
        client, _, _ = self.signup(NEW); client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-monthly'})
        self.finish_lesson = None
        with server.db() as c:
            uid = c.execute('SELECT id FROM users ORDER BY created DESC LIMIT 1').fetchone()['id']
            c.execute('INSERT INTO xp_log(user_id,day,xp,lesson_id,created) VALUES(?,?,?,?,?)', (uid, DAY(-1), 10, 'sm1-1', _t.time()))
            monday = datetime.now(); 
            while monday.weekday() != 0: monday = monday.replace(day=monday.day) if False else datetime.fromtimestamp(monday.timestamp() + 86400)
            ts = monday.replace(hour=10).timestamp()
            n1 = progress.weekly_emails(c, ts); n2 = progress.weekly_emails(c, ts)
        self.assertGreaterEqual(n1, 1); self.assertEqual(n2, 0)
