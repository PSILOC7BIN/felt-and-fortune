"""The browser's strategy engine (public/bj.js) must agree with engine.py on every decision."""
import itertools, json, shutil, subprocess, tempfile, unittest
from pathlib import Path
from engine import basic, deviation, hilo, total, INDICES

ROOT = Path(__file__).resolve().parents[1]
HANDS = [list(p) for p in itertools.product(range(1, 14), repeat=2)] + [[2, 3, 4], [1, 5, 2], [10, 2, 3], [1, 1, 5], [6, 5, 4], [1, 2, 3, 2]]
UPS = list(range(1, 14))
RULES = [dict(h17=h, das=d, surrender=s, split=p) for h, d, s, p in itertools.product([False, True], repeat=4)]

SCRIPT = """
import * as bj from './bj.mjs';
const [hands, ups, rules] = JSON.parse(process.argv[2]);
const out = {basic: [], deviation: [], hilo: [], total: []};
for (const r of rules) for (const h of hands) for (const u of ups) out.basic.push(bj.basic(h, u, r));
for (const h of hands) for (const u of ups) for (let tc = -6; tc <= 8; tc++) out.deviation.push(bj.deviation(h, u, tc));
for (let c = 1; c <= 13; c++) out.hilo.push(bj.hilo(c));
for (const h of hands) { const t = bj.total(h); out.total.push([t.total, t.soft]); }
out.indices = bj.INDICES;
console.log(JSON.stringify(out));
"""


@unittest.skipUnless(shutil.which('node'), 'Node.js is not installed')
class JsEngineParity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with tempfile.TemporaryDirectory() as tmp:
            shutil.copy(ROOT / 'public' / 'bj.js', Path(tmp) / 'bj.mjs')
            (Path(tmp) / 'run.mjs').write_text(SCRIPT, encoding='utf-8')
            arg = json.dumps([HANDS, UPS, RULES])
            r = subprocess.run(['node', 'run.mjs', arg], cwd=tmp, capture_output=True, text=True, timeout=120)
            if r.returncode: raise AssertionError(r.stderr)
            cls.js = json.loads(r.stdout)

    def test_basic_strategy_matches(self):
        py = [basic(h, u, **{'h17': r['h17'], 'das': r['das'], 'surrender': r['surrender'], 'split': r['split']}) for r in RULES for h in HANDS for u in UPS]
        self.assertEqual(len(py), len(self.js['basic']))
        mismatches = [i for i, (a, b) in enumerate(zip(py, self.js['basic'])) if a != b]
        self.assertEqual(mismatches, [])

    def test_deviations_match(self):
        py = [deviation(h, u, tc) for h in HANDS for u in UPS for tc in range(-6, 9)]
        self.assertEqual(py, self.js['deviation'])
        self.assertEqual([list(i) for i in INDICES], self.js['indices'])

    def test_counting_and_totals_match(self):
        self.assertEqual([hilo(c) for c in range(1, 14)], self.js['hilo'])
        self.assertEqual([list(total(h)) for h in HANDS], self.js['total'])


if __name__ == '__main__':
    unittest.main()
