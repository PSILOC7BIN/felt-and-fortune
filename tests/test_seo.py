"""Public tool pages, sitemap, and robots.txt."""
import unittest, urllib.request
from engine import basic
import seo, test_coach


class SeoTests(unittest.TestCase):
    setUpClass = test_coach.CoachApiTests.__dict__['setUpClass']
    tearDownClass = test_coach.CoachApiTests.__dict__['tearDownClass']

    def get(self, path):
        with urllib.request.urlopen(self.base + path) as r: return r.status, r.headers['Content-Type'], r.read().decode()

    def test_pages_render_publicly(self):
        for path in seo.PAGES:
            status, ctype, body = self.get(path)
            self.assertEqual(status, 200); self.assertIn('text/html', ctype)
            self.assertIn('<h1>', body); self.assertIn('href="/start"', body); self.assertIn('1-800-GAMBLER', body)

    def test_chart_matches_engine(self):
        body = seo.strategy_chart()
        row = '<tr><th>16</th>' + ''.join(f'<td class="a-{seo.ACT[a][1]}">{a}</td>' for a in (basic([10, 6], up, h17=False, das=True, surrender=True) for up in seo.UPS))
        self.assertIn(row, body)

    def test_sitemap_and_robots(self):
        _, ctype, body = self.get('/sitemap.xml')
        self.assertIn('xml', ctype); self.assertIn('/blackjack-strategy-chart</loc>', body)
        _, _, robots = self.get('/robots.txt')
        self.assertIn('Disallow: /api/', robots); self.assertIn('Sitemap:', robots)


if __name__ == '__main__':
    unittest.main()
