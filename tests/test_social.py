"""Friends: follow, friend board, unfollow, and cleanup on account deletion."""
import unittest
import server, test_coach
from test_coach import NEW


class SocialTests(unittest.TestCase):
    setUpClass = test_coach.CoachApiTests.__dict__['setUpClass']
    tearDownClass = test_coach.CoachApiTests.__dict__['tearDownClass']
    setUp = test_coach.CoachApiTests.setUp
    signup = test_coach.CoachApiTests.signup
    finish = test_coach.CoachApiTests.finish

    def test_follow_board_and_unfollow(self):
        a, _, _ = self.signup(NEW); b, _, _ = self.signup(NEW)
        b_name = b.call('/api/me')[1]['user']['username']
        self.assertEqual(a.call('/api/friends', 'POST', {'username': 'nobody-here'})[0], 400)
        self.assertEqual(a.call('/api/friends', 'POST', {'username': a.call('/api/me')[1]['user']['username']})[0], 400)
        self.finish(b, 'sm1-1')
        r = a.call('/api/friends', 'POST', {'username': b_name.upper()})[1]
        self.assertEqual([p['username'] for p in r['following']], [b_name])
        self.assertEqual(r['board'][0]['username'], b_name)            # b has XP this week, a has none
        self.assertEqual(b.call('/api/friends')[1]['followers'], 1)
        self.assertEqual(a.call('/api/friends/remove', 'POST', {'username': b_name})[1]['following'], [])

    def test_deleting_an_account_removes_follows(self):
        a, _, _ = self.signup(NEW); b, _, _ = self.signup(NEW)
        a.call('/api/friends', 'POST', {'username': b.call('/api/me')[1]['user']['username']})
        b.call('/api/account/delete', 'POST', {'password': 'Test-password-only-42'})
        self.assertEqual(a.call('/api/friends')[1]['following'], [])


if __name__ == '__main__':
    unittest.main()
