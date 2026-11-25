"""Skill ratings and Hand Review."""
import unittest
from engine import basic
import server, test_coach
from test_coach import NEW
from transcripts import item


class LearningTests(unittest.TestCase):
    setUpClass = test_coach.CoachApiTests.__dict__['setUpClass']
    tearDownClass = test_coach.CoachApiTests.__dict__['tearDownClass']
    setUp = test_coach.CoachApiTests.setUp
    signup = test_coach.CoachApiTests.signup

    def log(self, client, tool, results):
        rid = client.call('/api/energy/start', 'POST', {'tool': tool})[1]['round']
        return client.call('/api/practice/log', 'POST', {'tool': tool, 'round': rid, 'results': results})

    def test_ratings_rise_with_right_answers_and_fall_with_misses(self):
        client, _, _ = self.signup(NEW)
        self.assertIsNone(client.call('/api/skills')[1]['overall'])
        self.log(client, 'strategy', [item('strategy')] * 8)
        up = next(s for s in client.call('/api/skills')[1]['skills'] if s['skill'] == 'strategy-hard')
        self.assertGreater(up['rating'], 1000); self.assertEqual(up['n'], 8)
        s = client.call('/api/skills')[1]
        self.assertIsNotNone(s['overall']); self.assertIsNotNone(s['tier'])
        self.log(client, 'strategy', [item('strategy', ok=False)] * 5)
        down = next(x for x in client.call('/api/skills')[1]['skills'] if x['skill'] == 'strategy-hard')
        self.assertLess(down['rating'], up['rating'])

    def test_hand_review_free_limit_and_retry(self):
        client, _, _ = self.signup(NEW)
        self.log(client, 'strategy', [item('strategy', ok=False)] * 5)
        r = client.call('/api/review')[1]
        self.assertEqual((r['open'], len(r['mistakes']), r['limited']), (5, 3, True))
        m = r['mistakes'][0]
        self.assertEqual(m['answer'], {'H': 'Hit', 'S': 'Stand', 'D': 'Double', 'P': 'Split'}[basic([10, 6], 10)])
        wrong = 'S' if basic([10, 6], 10) != 'S' else 'H'
        self.assertFalse(client.call('/api/review/retry', 'POST', {'id': m['id'], 'given': wrong})[1]['ok'])
        self.assertTrue(client.call('/api/review/retry', 'POST', {'id': m['id'], 'given': basic([10, 6], 10)})[1]['ok'])
        self.assertEqual(client.call('/api/review')[1]['open'], 4)
        client.call('/api/billing/test-purchase', 'POST', {'plan': 'pro-monthly'})
        r = client.call('/api/review')[1]
        self.assertEqual((len(r['mistakes']), r['limited']), (4, False))

    def test_export_includes_ratings_and_mistakes(self):
        client, _, _ = self.signup(NEW)
        self.log(client, 'count', [item('count', ok=False)] * 3)
        data = client.call('/api/account/export')[1]
        self.assertIn('mistakes', data); self.assertIn('skill_rating', data)


if __name__ == '__main__':
    unittest.main()
