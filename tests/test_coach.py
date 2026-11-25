import unittest, tempfile, threading, random
from datetime import date
from http.server import ThreadingHTTPServer
import server, coach
from test_api import Client
from transcripts import lesson_transcript, item

NEW = {'experience': 'new', 'goal': 'understand', 'quiz_hard': 'unsure', 'quiz_soft': 'unsure', 'quiz_count': 'unsure', 'quiz_tc': 'unsure', 'challenge': 'unsure', 'game': 'unsure', 'time': '5', 'style': 'explain'}
EXPERT = {'experience': 'pro', 'goal': 'pro', **coach.PLACEMENT_ANSWERS, 'challenge': 'betting', 'game': 'pitch', 'time': '20', 'style': 'quiz'}


class PlannerTests(unittest.TestCase):
    def test_tracks_are_equal_and_large(self):
        sizes = {t: [coach.expected_questions(l['steps']) for u in coach.TRACKS[t] for l in u['lessons']] for t in coach.TRACK_ORDER[:4]}
        for t, qs in sizes.items():
            self.assertEqual(len(coach.TRACKS[t]), 10, t)
            self.assertEqual(len(qs), 38, t)
            self.assertGreaterEqual(min(qs), 5, t)
        totals = [sum(q) for q in sizes.values()]
        self.assertLess(max(totals) / min(totals), 1.15, totals)
        ids = [l['id'] for u in coach.UNITS for l in u['lessons']]
        self.assertEqual(len(ids), len(set(ids)))
        expert = coach.TRACKS['expert']
        self.assertEqual((len(expert), sum(len(u['lessons']) for u in expert)), (13, 39))
        for u in expert:
            prompts = [st['prompt'] for l in u['lessons'] for st in l['steps'] if st['type'] == 'choice']
            self.assertEqual(len(prompts), len(set(prompts)), u['id'])
            for l in u['lessons']: self.assertGreaterEqual(coach.expected_questions(l['steps']), 5, l['id'])

    def test_finish_date_matches_pace(self):
        plan = coach.build_plan({**NEW, 'time': '10'}, today=date(2026, 1, 1))
        self.assertEqual(plan['days'], -(-plan['remainingLessons'] // 2))
        self.assertEqual(plan['finish'], date.fromordinal(date(2026, 1, 1).toordinal() + plan['days']).isoformat())

    def test_invalid_answers_rejected(self):
        with self.assertRaises(ValueError): coach.build_plan({**NEW, 'time': '999'})
        with self.assertRaises(ValueError): coach.build_plan({'experience': 'new'})

    def test_every_lesson_resolves_to_valid_questions(self):
        rng = random.Random(7)
        ids = [l['id'] for u in coach.UNITS for l in u['lessons']] + [u['id'] + '-review' for u in coach.UNITS if u['skill'] in coach.REVIEW_POOLS]
        for _ in range(20):
            for lesson_id in ids:
                for step in coach.resolve_steps(coach.find_lesson(lesson_id)[1]['steps'], rng):
                    if step['type'] == 'choice':
                        self.assertTrue(0 <= step['answer'] < len(step['options']), (lesson_id, step))
                        self.assertEqual(len(set(step['options'])), len(step['options']), (lesson_id, step))

    def test_generated_strategy_answers_match_engine(self):
        rng = random.Random(11)
        for _ in range(500):
            step = coach._strategy_step(rng, 'any')
            expected = coach.ACTIONS[coach.basic(step['cards'], step['dealer'])]
            self.assertEqual(step['options'][step['answer']], expected)


    def test_placement_starts_you_at_your_level(self):
        everything = {u['id'] for u in coach.UNITS}
        new = coach.build_plan(NEW, today=date(2026, 1, 1))
        self.assertEqual((new['startUnit'], new['placed'], new['level'], new['version']), ('sm1', [], 'Rookie', 4))
        self.assertEqual(set(new['order']), everything)
        expert = coach.build_plan(EXPERT)
        self.assertEqual((expert['startUnit'], expert['level']), ('ap2', 'Advantage Player'))
        self.assertIn('cc5', expert['placed']); self.assertNotIn('ap2', expert['placed'])
        # Passing basics and core strategy but not the full chart: start at hard totals.
        mid = {**NEW, 'goal': 'count', **{q['id']: coach.PLACEMENT_ANSWERS[q['id']] for q in coach.SURVEY if q.get('stage') in (1, 2)}}
        plan = coach.build_plan(mid)
        self.assertEqual((plan['startUnit'], plan['level']), ('ms1', 'Strategist'))
        self.assertEqual(set(plan['placed']), {'sm1', 'sm2', 'sm3', 'sm9'})
        # One miss per stage is allowed; "not sure" stops the test.
        self.assertTrue(coach.stage_result(1, {'p_total': '16', 'p_pay': '20', 'p_dealer': 'hit'})[0])
        self.assertFalse(coach.stage_result(1, {'p_total': '16', 'p_pay': '30', 'p_dealer': 'unsure'})[0])

    def test_expert_start_unit_is_free(self):
        units = coach.path_units(coach.build_plan(EXPERT))
        first = next(u for u in units if not u['placed'])
        self.assertEqual((first['id'], first['pro']), ('ap2', False))
        self.assertTrue(next(u for u in units if u['id'] == 'ap3')['pro'])

    def test_goal_sets_the_order_with_prerequisites_first(self):
        order = lambda goal: coach.build_plan({**NEW, 'goal': goal})['order']
        self.assertEqual(order('understand')[3], 'sm4')
        self.assertEqual(order('smarter')[3], 'ms1')
        cnt = order('count')
        self.assertLess(cnt.index('ms1'), cnt.index('cc1')); self.assertLess(cnt.index('cc1'), cnt.index('sm4'))
        pro = order('pro')
        self.assertLess(pro.index('cc8'), pro.index('ap1')); self.assertLess(pro.index('ap8'), pro.index('ms5'))
        self.assertEqual(coach.build_plan({**NEW, 'goal': 'count'})['track'], 'counter')

    def test_focus_comes_from_misses_and_struggles(self):
        plan = coach.build_plan({**NEW, 'goal': 'count'})
        self.assertIn('sm2', plan['focus'])                              # missed strategy checks
        expert = coach.build_plan(EXPERT)
        self.assertIn('ap3', expert['focus'])                            # finds betting hardest: first remaining betting unit
        self.assertNotIn('sm2', expert['focus'])


class CoachApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(); cls.previous = server.DB_PATH
        server.DB_PATH = cls.tmp.name + '/coach.sqlite'; server.initialize()
        cls.http = ThreadingHTTPServer(('127.0.0.1', 0), server.Handler); cls.base = 'http://127.0.0.1:' + str(cls.http.server_port)
        threading.Thread(target=cls.http.serve_forever, daemon=True).start()
        server.Handler.log_message = lambda *args: None

    @classmethod
    def tearDownClass(cls):
        cls.http.shutdown(); cls.http.server_close(); server.DB_PATH = cls.previous; cls.tmp.cleanup()

    def setUp(self):
        with server.RATE_LOCK: server.RATE.clear()
        self.n = server.secrets.token_hex(4)

    def signup(self, survey=None):
        client = Client(self.base); name = 'learner' + self.n + server.secrets.token_hex(2)
        body = {'username': name, 'email': name + '@example.test', 'password': 'Test-password-only-42', 'birthYear': 1995}
        if survey is not None: body['survey'] = survey
        status, result = client.call('/api/signup', 'POST', body)
        return client, status, result

    def test_survey_and_preview_are_public(self):
        anon = Client(self.base)
        status, result = anon.call('/api/survey')
        self.assertEqual(status, 200)
        self.assertEqual(len(result['questions']), len(coach.SURVEY))
        self.assertNotIn('answer', str(result))
        status, result = anon.call('/api/plan/preview', 'POST', {'answers': NEW})
        self.assertEqual((status, result['plan']['startUnit']), (200, 'sm1'))
        self.assertEqual(anon.call('/api/plan/preview', 'POST', {'answers': {}})[0], 400)
        self.assertEqual(anon.call('/api/path')[0], 401)

    def test_signup_with_survey_creates_path(self):
        client, status, _ = self.signup(NEW)
        self.assertEqual(status, 200)
        status, state = client.call('/api/path?day=' + date.today().isoformat())
        self.assertEqual(status, 200)
        self.assertEqual(state['current'], 'sm1-1')
        lessons = {l['id']: l for u in state['units'] for l in u['lessons']}
        self.assertEqual(lessons['sm1-1']['status'], 'current')
        self.assertEqual(lessons['sm1-2']['status'], 'locked')
        self.assertEqual(state['stats']['xp'], 0)

    def test_bad_survey_does_not_create_account(self):
        _, status, _ = self.signup({**NEW, 'goal': 'nope'})
        self.assertEqual(status, 400)

    def finish(self, client, lesson_id, ok=True, **extra):
        steps = client.call('/api/path/lesson/' + lesson_id)[1]['lesson']['steps']
        return client.call(f'/api/path/lesson/{lesson_id}/complete', 'POST', {'results': lesson_transcript(steps, ok), 'day': date.today().isoformat(), **extra})

    def test_lessons_unlock_in_order_and_award_xp(self):
        client, _, _ = self.signup(NEW)
        self.assertEqual(client.call('/api/path/lesson/sm1-2')[0], 403)
        status, result = client.call('/api/path/lesson/sm1-1')
        self.assertEqual(status, 200)
        self.assertTrue(any(s['type'] == 'choice' for s in result['lesson']['steps']))
        status, result = self.finish(client, 'sm1-1')
        self.assertEqual((status, result['xp'], result['accuracy'], result['first']), (200, 15, 100, True))
        self.assertEqual(result['current'], 'sm1-2')
        self.assertEqual(result['stats']['streak'], 1)
        status, again = self.finish(client, 'sm1-1', ok=False)
        self.assertEqual((again['xp'], again['first'], again['accuracy'], again['stats']['xp']), (5, False, 0, 20))
        self.assertEqual(client.call('/api/path/lesson/sm1-2')[0], 200)
        self.assertEqual(client.call('/api/path/lesson/nope/complete', 'POST', {'results': [item('count')]})[0], 404)

    def test_server_regrades_lessons(self):
        client, _, _ = self.signup(NEW)
        steps = client.call('/api/path/lesson/sm1-1')[1]['lesson']['steps']
        results = lesson_transcript(steps)
        # A browser claiming success can't skip questions or invent choice answers.
        self.assertEqual(client.call('/api/path/lesson/sm1-1/complete', 'POST', {'results': results[:-1]})[0], 400)
        forged = [dict(r) for r in results]
        forged[-1] = {'kind': 'choice', 'data': {'prompt': 'Made-up question?', 'options': ['a']}, 'given': 0}
        self.assertEqual(client.call('/api/path/lesson/sm1-1/complete', 'POST', {'results': forged})[0], 400)
        # Wrong answers are scored as wrong, whatever the browser says.
        half = [dict(r) for r in results]
        for r in half[::2]:
            if r['kind'] == 'choice': r['given'] = (r['given'] + 1) % len(r['data']['options'])
        status, res = client.call('/api/path/lesson/sm1-1/complete', 'POST', {'results': half})
        self.assertEqual(status, 200)
        self.assertLess(res['accuracy'], 100)


    def test_paths_cannot_be_switched_and_retake_locks_after_starting(self):
        client, _, _ = self.signup(NEW)
        self.assertEqual(client.call('/api/path/track', 'POST', {'track': 'counter'})[0], 410)
        self.assertEqual(client.call('/api/path/plan', 'POST', {'answers': {**NEW, 'goal': 'count'}})[0], 200)   # not started yet
        self.assertEqual(self.finish(client, 'sm1-1')[0], 200)
        self.assertEqual(client.call('/api/path/plan', 'POST', {'answers': NEW})[0], 409)

    def test_older_plans_are_upgraded_and_keep_progress(self):
        client, _, result = self.signup(NEW)
        self.finish(client, 'sm1-1')
        uid = result['user']['id']
        with server.db() as c: c.execute("UPDATE plans SET plan=? WHERE user_id=?", ('{"version": 2, "track": "smart", "testedOut": ["sm1"], "focus": []}', uid))
        st = client.call('/api/path')[1]
        self.assertEqual((st['plan']['version'], st['plan']['testedOut']), (4, []))
        self.assertEqual(st['units'][0]['lessons'][0]['status'], 'done')
        self.assertEqual(st['current'], 'sm1-2')

    def test_free_learners_skip_pro_units(self):
        client, _, _ = self.signup({**NEW, 'goal': 'count'})
        st = client.call('/api/path')[1]
        cc2 = next(u for u in st['units'] if u['id'] == 'cc2')
        self.assertTrue(cc2['pro']); self.assertEqual({l['status'] for l in cc2['lessons']}, {'pro'})
        self.assertEqual(client.call('/api/path/lesson/cc2-1')[0], 402)
        client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-monthly'})
        st = client.call('/api/path')[1]
        self.assertEqual({l['status'] for l in next(u for u in st['units'] if u['id'] == 'cc2')['lessons']}, {'locked'})

    def test_daily_goal_can_change(self):
        client, _, _ = self.signup(NEW)
        status, st = client.call('/api/path/goal', 'POST', {'minutes': 20})
        self.assertEqual((status, st['plan']['dailyXp'], st['plan']['lessonsPerDay']), (200, 60, 4))
        self.assertEqual(client.call('/api/path/goal', 'POST', {'minutes': 7})[0], 400)

    def test_account_without_plan(self):
        client, _, _ = self.signup()
        self.assertEqual(client.call('/api/path')[1], {'plan': None})
        self.assertEqual(client.call('/api/path/lesson/sm1-1')[0], 409)


if __name__ == '__main__':
    unittest.main()
