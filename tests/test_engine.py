import math
import unittest
from unittest.mock import patch
from engine import total, hilo, basic, deviation, simulate


class StrategyTests(unittest.TestCase):
    def test_soft_and_hard_totals(self):
        for cards,expected in [([1,7],(18,True)),([1,1,9],(21,True)),([1,1,10],(12,False)),([10,8,5],(23,False))]:
            with self.subTest(cards=cards): self.assertEqual(total(cards),expected)
    def test_balanced_hilo_shoe(self):
        self.assertEqual(sum(hilo(c) for c in range(1,14)),0)
        self.assertEqual([hilo(c) for c in [1,2,6,7,9,10,13]],[-1,1,1,0,0,-1,-1])
    def test_hard_strategy_boundary_cases(self):
        cases=[([10,2],3,'H'),([10,2],4,'S'),([10,6],10,'H'),([10,7],1,'S'),([4,5],2,'H'),([4,5],3,'D'),([6,4],9,'D'),([6,4],10,'H'),([5,6],10,'D'),([5,6],1,'H')]
        for cards,up,expected in cases:
            with self.subTest(cards=cards,up=up): self.assertEqual(basic(cards,up),expected)
    def test_h17_differences(self):
        for cards,up,s17,h17 in [([1,7],2,'S','D'),([1,8],6,'S','D'),([5,6],1,'H','D')]:
            self.assertEqual(basic(cards,up,False),s17)
            self.assertEqual(basic(cards,up,True),h17)
    def test_pairs_and_das(self):
        self.assertEqual(basic([8,8],10),'P')
        self.assertEqual(basic([1,1],1),'P')
        self.assertEqual(basic([9,9],7),'S')
        self.assertEqual(basic([9,9],9),'P')
        self.assertEqual(basic([4,4],5,das=True),'P')
        self.assertEqual(basic([4,4],5,das=False),'H')
        self.assertEqual(basic([2,2],2,das=False),'H')
    def test_surrender_and_restricted_actions(self):
        self.assertEqual(basic([10,6],10,surrender=True),'R')
        self.assertEqual(basic([8,8],10,surrender=True),'P')
        self.assertEqual(basic([8,8],1,h17=True,surrender=True),'R')
        self.assertEqual(basic([2,3,6],6),'H')
        self.assertEqual(basic([8,8],10,split=False),'H')
    def test_deviation_thresholds(self):
        self.assertEqual(deviation([10,6],10,-1),'H')
        self.assertEqual(deviation([10,6],10,0),'S')
        self.assertEqual(deviation([10,10],6,3),'S')
        self.assertEqual(deviation([10,10],6,4),'P')
        self.assertEqual(deviation([10,2],5,-3),'H')
    def test_reproducible_simulation(self):
        cfg={'rounds':3000,'seed':81}
        self.assertEqual(simulate(cfg),simulate(cfg))
    def test_simulation_accounting_and_scaling(self):
        cfg={'rounds':5000,'seed':4,'unit':1,'spread':[{'count':-20,'units':1,'hands':2}]}
        a=simulate(cfg);b=simulate({**cfg,'unit':2})
        self.assertEqual(a['played'],a['wins']+a['losses']+a['pushes'])
        self.assertEqual(a['profit'],a['trajectory'][-1][1])
        self.assertAlmostEqual(b['profit'],a['profit']*2)
        self.assertAlmostEqual(b['sd'],a['sd']*2)
        self.assertTrue(all(math.isfinite(v) for v in [a['ev'],a['sd'],a['risk']]))
    def test_invalid_simulation_inputs(self):
        for cfg in [{'rounds':0},{'decks':1},{'penetration':99},{'unit':float('nan')},{'spread':[]},{'spread':[{'count':0,'units':0,'hands':1}]}]:
            with self.subTest(cfg=cfg),self.assertRaises(ValueError): simulate(cfg)

    def test_indices_preserve_pair_splits(self):
        self.assertEqual(deviation([8,8],10,6),'P')
        self.assertEqual(deviation([8,8],10,6,split=False),'S')

    def test_split_limits_apply_to_each_initial_hand(self):
        # Synthetic all-eight shoes: every final hand busts, so losses reveal
        # precisely how many splits each of two starting hands received.
        def eights(shoe): shoe[:]=[8]*len(shoe)
        for limit in (1,2,4):
            with self.subTest(limit=limit),patch('engine.random.Random.shuffle',side_effect=eights):
                result=simulate({'rounds':1000,'maxHands':limit,'unit':1,'spread':[{'count':-20,'units':1,'hands':2}]})
                self.assertEqual(result['profit'],-1000*2*limit)
                self.assertEqual(result['averageBet'],2*limit)

    def test_restricted_rules_and_deviation_configuration(self):
        for rules in ({'maxHands':3},{'doubleRule':'invalid'},{'playMode':'deviations','h17':True},{'playMode':'deviations','decks':8},{'playMode':'deviations','surrender':True}):
            with self.subTest(rules=rules),self.assertRaises(ValueError): simulate({'rounds':1000,**rules})
        for rules in ({'maxHands':1,'splitAces':False,'doubleRule':'10-11'}, {'doubleRule':'9-11','das':False}, {'playMode':'deviations','rsa':True}):
            with self.subTest(rules=rules):
                result=simulate({'rounds':2000,**rules})
                self.assertEqual(result['rounds'],2000)
                self.assertTrue(all(math.isfinite(v) for v in result['ci']))

if __name__=='__main__': unittest.main()
