import unittest, tempfile, threading, math, random
from datetime import date
from http.server import ThreadingHTTPServer
import server, coach, practice_api
from engine import hilo, deviation
from test_api import Client
from transcripts import item


class LessonToolSteps(unittest.TestCase):
    def test_every_tool_step_is_runnable(self):
        known = coach.TOOL_NAMES
        lessons = [l for u in coach.UNITS for l in u['lessons']] + [coach.find_lesson(u['id'] + '-review')[1] for u in coach.UNITS if u['skill'] in coach.REVIEW_POOLS]
        for lesson in lessons:
            for step in lesson['steps']:
                if step['type'] == 'tool':
                    self.assertIn(step['tool'], known, lesson['id'])
                    self.assertGreaterEqual(step['reps'], 1, lesson['id'])
                    self.assertIsInstance(step['config'], dict)
        for u in coach.UNITS:
            self.assertTrue(u['tool'].startswith('/'), u['id'])

    def test_lessons_are_substantial(self):
        for u in coach.UNITS:
            for l in u['lessons']:
                steps = coach.resolve_steps(l['steps'])
                n = sum((s['reps'] * 5 if s['tool'] == 'scenario' else s['reps']) if s['type'] == 'tool' else s['type'] != 'teach' for s in steps)
                self.assertGreaterEqual(n, 4, l['id'])

    def test_style_scales_tool_reps(self):
        steps = [coach.tool('strategy', 10)]
        self.assertEqual(coach.resolve_steps(steps, style='quiz')[0]['reps'], 12)
        self.assertEqual(coach.resolve_steps(steps, style='explain')[0]['reps'], 9)


class ShoeChallengeGrading(unittest.TestCase):
    def test_rounds_follow_a_real_shoe(self):
        state = practice_api.new_game(random.Random(3))
        rc = 0
        for r in state['rounds']:
            rc += sum(hilo(c) for c in r['cards'])
            self.assertEqual(r['rc'], rc)
            self.assertEqual(r['tray'] * 2, int(r['tray'] * 2))
            self.assertTrue(.5 <= r['tray'] <= 5.5)
        self.assertEqual(len(state['rounds']), practice_api.ROUNDS)

    def test_perfect_play_keeps_all_hearts(self):
        state = practice_api.new_game(random.Random(5))
        while state['round'] < len(state['rounds']):
            r = state['rounds'][state['round']]
            a = {'rc': r['rc']}
            tc = math.floor(r['rc'] / (state['shoe'] - r['tray']))
            if 'decks' in r['parts']: a.update(decks=r['tray'], tc=tc, bet=practice_api.ramp(tc))
            if 'play' in r['parts']: a['play'] = deviation(r['hand'], r['dealer'], tc)
            results, done = practice_api.grade_round(state, a)
            self.assertTrue(all(x['ok'] for x in results), results)
        self.assertEqual(state['hearts'], practice_api.HEARTS)
        self.assertTrue(done)

    def test_later_parts_use_the_players_own_count(self):
        state = practice_api.new_game(random.Random(8))
        state['round'] = 2  # round 3 asks for decks, tc, and bet
        r = state['rounds'][2]
        wrong_rc = r['rc'] + 4
        my_tc = math.floor(wrong_rc / (state['shoe'] - r['tray']))
        results, _ = practice_api.grade_round(state, {'rc': wrong_rc, 'decks': r['tray'], 'tc': my_tc, 'bet': practice_api.ramp(my_tc)})
        by = {x['part']: x['ok'] for x in results}
        self.assertEqual(by, {'rc': False, 'decks': True, 'tc': True, 'bet': True})
        self.assertEqual(state['hearts'], practice_api.HEARTS - 1)


class PracticeApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(); cls.previous = server.DB_PATH
        server.DB_PATH = cls.tmp.name + '/practice.sqlite'; server.initialize()
        cls.http = ThreadingHTTPServer(('127.0.0.1', 0), server.Handler); cls.base = 'http://127.0.0.1:' + str(cls.http.server_port)
        threading.Thread(target=cls.http.serve_forever, daemon=True).start()
        server.Handler.log_message = lambda *args: None

    @classmethod
    def tearDownClass(cls):
        cls.http.shutdown(); cls.http.server_close(); server.DB_PATH = cls.previous; cls.tmp.cleanup()

    def setUp(self):
        with server.RATE_LOCK: server.RATE.clear()
        self.c = Client(self.base); name = 'p' + server.secrets.token_hex(5)
        self.assertEqual(self.c.call('/api/signup', 'POST', {'username': name, 'email': name + '@example.test', 'password': 'Test-password-only-42'})[0], 200)

    def test_practice_log_regrades_and_caps_xp(self):
        results = [item('count')] * 25 + [item('count', ok=False)] * 5
        status, r = self.c.call('/api/practice/log', 'POST', {'tool': 'count', 'results': results, 'bestStreak': 12, 'seconds': 300, 'day': date.today().isoformat()})
        self.assertEqual((status, r['xp'], r['correct'], r['questions']), (200, practice_api.XP_CAP, 25, 30))
        status, r = self.c.call('/api/practice/log', 'POST', {'tool': 'count', 'results': [item('count', ok=False)] * 3})
        self.assertEqual((r['xp'], r['correct']), (0, 0))
        self.assertEqual(self.c.call('/api/practice/log', 'POST', {'tool': 'nope', 'results': [item('count')]})[0], 400)
        self.assertEqual(self.c.call('/api/practice/log', 'POST', {'tool': 'count', 'results': [{'kind': 'count', 'data': {'cards': [99]}, 'given': 0}]})[0], 400)
        self.assertEqual(self.c.call('/api/practice/log', 'POST', {'tool': 'count', 'questions': 5, 'correct': 5})[0], 400)
        self.assertEqual(Client(self.base).call('/api/practice/stats')[0], 401)

    def test_weak_spots_come_from_missed_skills(self):
        self.assertEqual(self.c.call('/api/practice/weak')[1]['skills'], [])
        results = [item('truecount', ok=False)] * 4 + [item('truecount')] * 2 + [item('strategy')] * 6 + [item('decks', ok=False)] * 2 + [item('decks')] * 3
        self.c.call('/api/practice/log', 'POST', {'tool': 'strategy', 'results': results})
        skills = [w['skill'] for w in self.c.call('/api/practice/weak')[1]['skills']]
        self.assertEqual(skills[0], 'truecount')
        self.assertIn('decks', skills)
        self.assertNotIn('strategy-hard', skills)

    def test_every_kind_grades_right_and_wrong(self):
        for k in ('strategy', 'count', 'decks', 'truecount', 'index', 'bet', 'play'):
            self.assertTrue(practice_api.grade_item(item(k)), k)
            self.assertFalse(practice_api.grade_item(item(k, ok=False)), k)

    def test_challenge_round_trip_hides_answers(self):
        status, g = self.c.call('/api/challenge/start', 'POST', {})
        self.assertEqual(status, 200)
        self.assertNotIn('rc', g['round'])
        status, r = self.c.call('/api/challenge/answer', 'POST', {'id': g['id'], 'answers': {'rc': 999}})
        self.assertEqual(status, 200)
        self.assertFalse(r['results'][0]['ok'])
        self.assertEqual(r['hearts'], practice_api.HEARTS - 1)
        other = Client(self.base); name = 'q' + server.secrets.token_hex(5)
        other.call('/api/signup', 'POST', {'username': name, 'email': name + '@example.test', 'password': 'Test-password-only-42'})
        self.assertEqual(other.call('/api/challenge/answer', 'POST', {'id': g['id'], 'answers': {'rc': 0}})[0], 400)

    def test_deck_drill_uses_half_decks(self):
        for _ in range(30):
            status, q = self.c.call('/api/drill/new', 'POST', {'mode': 'decks'})
            self.assertEqual(status, 200)
            status, r = self.c.call('/api/drill/answer', 'POST', {'id': q['id'], 'answer': 0})
            self.assertEqual(float(r['answer']) * 2 % 1, 0)


if __name__ == '__main__':
    unittest.main()
