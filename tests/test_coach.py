import unittest, tempfile, threading, random
from datetime import date
from http.server import ThreadingHTTPServer
import server, coach
from test_api import Client
from transcripts import lesson_transcript, item

NEW = {'experience': 'new', 'goal': 'understand', 'quiz_hard': 'unsure', 'quiz_soft': 'unsure', 'quiz_count': 'unsure', 'quiz_tc': 'unsure', 'challenge': 'unsure', 'game': 'unsure', 'time': '5', 'style': 'explain'}
EXPERT = {'experience': 'pro', 'goal': 'pro', 'quiz_hard': 'hit', 'quiz_soft': 'hit', 'quiz_count': '1', 'quiz_tc': '3', 'challenge': 'betting', 'game': 'pitch', 'time': '20', 'style': 'quiz'}


class PlannerTests(unittest.TestCase):
    def test_beginner_gets_smart_player_from_the_start(self):
        plan = coach.build_plan(NEW, today=date(2026, 1, 1))
        self.assertEqual((plan['track'], plan['startUnit'], plan['testedOut']), ('smart', 'sm1', []))
        self.assertEqual(plan['level'], 'Rookie')
        self.assertEqual(plan['dailyXp'], 15)
        self.assertEqual(plan['milestone']['unit'], 'sm8')
        self.assertEqual(plan['focus'], ['sm2'])
        self.assertIn('Smart Player', plan['reasons'][0])

    def test_expert_gets_advantage_pro_and_tests_out(self):
        plan = coach.build_plan(EXPERT)
        self.assertEqual((plan['track'], plan['startUnit'], plan['testedOut']), ('pro', 'ap2', ['ap1']))
        self.assertEqual(set(plan['focus']), {'ap3', 'ap5'})
        self.assertIn('ap3', plan['notes'])
        self.assertEqual(plan['level'], 'Advantage Player')

    def test_self_reported_skill_needs_correct_checks(self):
        plan = coach.build_plan({**EXPERT, 'quiz_tc': 'unsure'})
        self.assertEqual((plan['track'], plan['startUnit']), ('counter', 'cc3'))
        plan = coach.build_plan({**EXPERT, 'quiz_tc': 'unsure', 'quiz_soft': 'unsure'})
        self.assertEqual((plan['track'], plan['startUnit']), ('strategy', 'ms1'))
        self.assertIn('ms1', plan['focus'])

    def test_each_goal_maps_to_a_track(self):
        base = {**NEW, 'experience': 'strategy', 'quiz_hard': 'hit', 'quiz_soft': 'hit'}
        self.assertEqual(coach.build_plan({**base, 'goal': 'understand'})['track'], 'smart')
        self.assertEqual(coach.build_plan({**base, 'goal': 'smarter'})['track'], 'strategy')
        self.assertEqual(coach.build_plan({**NEW, 'goal': 'smarter'})['track'], 'smart')
        self.assertEqual(coach.build_plan({**base, 'goal': 'count'})['track'], 'counter')
        self.assertEqual(coach.build_plan({**base, 'goal': 'pro'})['track'], 'counter')
        self.assertEqual(coach.build_plan({**NEW, 'goal': 'pro'})['track'], 'strategy')
        counted = coach.build_plan({**base, 'goal': 'count', 'quiz_count': '1'})
        self.assertEqual((counted['track'], counted['startUnit']), ('counter', 'cc3'))

    def test_chosen_track_keeps_placement(self):
        plan = coach.build_plan(EXPERT, track='strategy')
        self.assertEqual(plan['track'], 'strategy')
        self.assertEqual(plan['startUnit'], 'ms3')
        with self.assertRaises(ValueError): coach.build_plan(EXPERT, track='nope')

    def test_tracks_are_equal_and_large(self):
        sizes = {t: [coach.expected_questions(l['steps']) for u in coach.TRACKS[t] for l in u['lessons']] for t in coach.TRACK_ORDER}
        for t, qs in sizes.items():
            self.assertEqual(len(coach.TRACKS[t]), 8, t)
            self.assertEqual(len(qs), 30, t)
            self.assertGreaterEqual(min(qs), 5, t)
        totals = [sum(q) for q in sizes.values()]
        self.assertLess(max(totals) / min(totals), 1.15, totals)
        ids = [l['id'] for u in coach.UNITS for l in u['lessons']]
        self.assertEqual(len(ids), len(set(ids)))

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

    def test_tested_out_lessons_are_open_and_retake_keeps_progress(self):
        client, _, _ = self.signup(EXPERT)
        state = client.call('/api/path')[1]
        self.assertEqual(state['current'], 'ap2-1')
        self.assertEqual(client.call('/api/path/lesson/ap2-1')[0], 402)   # Advantage Pro beyond unit 1 is Pro
        client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-annual'})
        self.assertEqual(client.call('/api/path/lesson/ap1-2')[0], 200)
        self.assertEqual(client.call('/api/path/lesson/ap3-1')[0], 403)
        self.assertEqual(self.finish(client, 'ap2-1')[0], 200)
        status, state = client.call('/api/path/plan', 'POST', {'answers': NEW})
        self.assertEqual(status, 200)
        self.assertEqual(state['current'], 'sm1-1')
        self.assertEqual(state['stats']['xp'], 15)

    def test_switching_tracks_keeps_xp_and_progress(self):
        client, _, _ = self.signup(NEW)
        self.assertEqual(self.finish(client, 'sm1-1')[0], 200)
        status, st = client.call('/api/path/track', 'POST', {'track': 'counter'})
        self.assertEqual((status, st['plan']['track'], st['current']), (200, 'counter', 'cc1-1'))
        self.assertEqual(st['stats']['xp'], 15)
        self.assertEqual({t['id']: t['done'] for t in st['tracks']}['smart'], 1)
        self.assertEqual(client.call('/api/path/lesson/sm1-2')[0], 404)
        status, st = client.call('/api/path/track', 'POST', {'track': 'smart'})
        self.assertEqual(st['current'], 'sm1-2')
        self.assertEqual(client.call('/api/path/track', 'POST', {'track': 'nope'})[0], 400)

    def test_old_single_path_plans_are_upgraded(self):
        client, _, result = self.signup(NEW)
        uid = result['user']['id']
        with server.db() as c: c.execute("UPDATE plans SET plan=? WHERE user_id=?", ('{"version": 1, "startUnit": "u1", "testedOut": [], "focus": []}', uid))
        st = client.call('/api/path')[1]
        self.assertEqual((st['plan']['version'], st['plan']['track']), (2, 'smart'))

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
