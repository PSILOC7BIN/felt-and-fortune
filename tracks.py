"""The four learning tracks. Each has 10 units and 38 lessons.

Unit keys: id, title, color, tool (practice page), summary, skill (focus-area tag), test (placement check that lets
a learner test out of the unit, or None), lessons. Lesson ids are unique across tracks.
"""
import copy

TRACK_META = {
    'smart': {'title': 'Smart Player', 'color': 'green', 'glyph': 'star', 'tagline': 'Play well, lose less, and enjoy the game.',
              'summary': 'Rules, a simple strategy that cuts the house edge to about half a percent, payouts and side bets, money management, myths, and casino know-how. No counting.'},
    'strategy': {'title': 'Strategy Master', 'color': 'blue', 'glyph': 'cards', 'tagline': 'Make the right play, every hand, at any table.',
                 'summary': 'Complete basic strategy for hard, soft, and paired hands, surrender and insurance, every common rule variation, house-edge math, and speed drills.'},
    'counter': {'title': 'Card Counter', 'color': 'orange', 'glyph': 'count', 'tagline': 'Track the cards and bet with the edge.',
                'summary': 'Hi‑Lo counting at a full table, true count and deck estimation, bet ramps, the key index plays, bankroll and risk, and casino craft.'},
    'pro': {'title': 'Advantage Pro', 'color': 'purple', 'glyph': 'trophy', 'tagline': 'Play like a professional, for the long run.',
            'summary': 'Full index sets including surrender, back-counting, spreads by game, Kelly betting and risk targets, game evaluation, camouflage, and team play.'},
}
TRACK_ORDER = ['smart', 'strategy', 'counter', 'pro']
PALETTE = ['green', 'blue', 'teal', 'indigo', 'orange', 'purple', 'pink', 'gold']


def build(h):
    teach, choice, gen, tool, chart, lib = h['teach'], h['choice'], h['gen'], h['tool'], h['chart'], h['lib']
    EASY_TC, HARD_TC = h['EASY_TC'], h['HARD_TC']

    def L(id, title, steps): return {'id': id, 'title': title, 'steps': steps}
    def R(old, new, title=None):  # reuse a lesson from the original library under a new id
        src = lib(old); return {'id': new, 'title': title or src['title'], 'steps': copy.deepcopy(src['steps'])}
    def U(id, title, tool_url, summary, skill, test, lessons): return {'id': id, 'title': title, 'tool': tool_url, 'summary': summary, 'skill': skill, 'test': test, 'lessons': lessons}

    # =========================================================================================
    # SMART PLAYER
    # =========================================================================================
    smart = [
        U('sm1', 'Table Basics', '/practice/strategy', 'Card values, totals, and how a round works.', 'basics', 'rules', [
            R('u1-1', 'sm1-1'), R('u1-2', 'sm1-2'), R('u1-3', 'sm1-3'),
            L('sm1-4', 'Reading the table', [
                teach('The layout', 'Each player has a betting circle. The dealer’s rules are printed on the felt: look for “Blackjack pays 3 to 2” and “Dealer must stand on all 17s”. A placard shows the minimum and maximum bet.'),
                choice('The felt says “Dealer hits soft 17”. What does that mean for you?', ['Nothing', 'A slightly worse game', 'A better game'], 1, 'H17 adds about 0.2% to the house edge.'),
                choice('The felt says “Blackjack pays 6 to 5”. Good table?', ['Yes', 'No, find a 3:2 table'], 1, '6:5 costs you about 1.4% more than 3:2. That’s more than all the rest of the house edge.'),
                choice('A $10–$500 placard means…', ['You must bet $500', 'Bets from $10 to $500', 'Each hand costs $10'], 1, 'It’s the table minimum and maximum bet.'),
                choice('Which seat has the best odds?', ['First base (dealer’s left)', 'Third base (dealer’s right)', 'They’re all the same'], 2, 'Every seat has the same odds. Where you sit doesn’t change the house edge.'),
                tool('strategy', 4, pool='stiff'),
            ]),
        ]),
        U('sm2', 'Your First Strategy', '/practice/strategy', 'The few rules that fix most mistakes.', 'strategy', 'strategy', [
            L('sm2-1', 'Stand on 17, mind the bust cards', [
                teach('Two simple rules', 'Always stand on hard 17 or more. With 12–16, stand if the dealer shows 2–6 (their bust cards) and hit if the dealer shows 7 or higher.', cards=[10, 6], dealer=5),
                choice('You have 15. The dealer shows a 4. Play?', ['Hit', 'Stand'], 1, 'The dealer’s 4 is a bust card. Let them take the risk.', cards=[9, 6], dealer=4),
                choice('You have 15. The dealer shows a 9. Play?', ['Hit', 'Stand'], 0, 'Against a 9 the dealer will usually make 19, so 15 needs help.', cards=[9, 6], dealer=9),
                tool('strategy', 10, pool='stiff'),
            ]),
            L('sm2-2', '12 is the exception', [
                teach('12 against 2 and 3', 'With 12, only the dealer’s 4, 5, and 6 are weak enough to stand. Against a 2 or 3, hit: you bust only on a ten.', cards=[10, 2], dealer=3),
                choice('You have 12. The dealer shows a 3. Play?', ['Hit', 'Stand'], 0, 'Hit 12 against 2 and 3.', cards=[7, 5], dealer=3),
                choice('What can bust a hard 12?', ['Any card over 5', 'Only a ten-value card', 'Nothing'], 1, '12 + 10 = 22. Every other card is safe.'),
                tool('strategy', 10, pool='stiff'),
            ]),
            L('sm2-3', 'When to double', [
                teach('Double when you’re ahead', 'Double 11 against anything but an ace. Double 10 against 2–9. Double 9 against 3–6. Doubling puts more money out when you’re the favorite.', cards=[6, 5], dealer=6),
                choice('You have 10. The dealer shows a 10. Play?', ['Double', 'Hit'], 1, 'Against a 10, 10 isn’t strong enough to double. Hit.', cards=[6, 4], dealer=10),
                tool('strategy', 12, pool='low'),
            ]),
            L('sm2-4', 'Splits that matter', [
                teach('Always and never', 'Always split aces and eights. Never split tens or fives. That alone fixes the most expensive pair mistakes.', cards=[8, 8]),
                choice('You have 10‑10. The dealer shows a 6. Play?', ['Split', 'Stand'], 1, '20 wins most of the time. Keep it.', cards=[10, 12], dealer=6),
                choice('You have 5‑5 against a 6. Play?', ['Split', 'Double', 'Hit'], 1, 'Play 5‑5 as a 10: double against 2–9.', cards=[5, 5], dealer=6),
                tool('strategy', 10, pool='pair'),
            ]),
        ]),
        U('sm3', 'Soft Hands Made Simple', '/practice/strategy', 'Aces that count 11, without the headaches.', 'strategy', 'strategy', [
            L('sm3-1', 'Soft hands can’t bust', [
                teach('Use the free card', 'A soft hand can take one card without busting, so soft 17 and below always hit or double, never stand.', cards=[1, 6]),
                choice('You have A‑6 against a 10. Play?', ['Stand on 17', 'Hit'], 1, 'Soft 17 is weak. Hitting can’t bust you.', cards=[1, 6], dealer=10),
                tool('strategy', 10, pool='softlow'),
            ]),
            L('sm3-2', 'Soft doubles', [
                teach('Double soft hands against weak upcards', 'Against 5 or 6, double almost every soft hand from A‑2 to A‑7. Against 3 and 4, double A‑4 through A‑7.', cards=[1, 4], dealer=5),
                tool('strategy', 12, pool='soft'),
            ]),
            L('sm3-3', 'Soft 18 and up', [
                teach('Soft 18', 'A‑7 stands against 2, 7, and 8, doubles against 3–6, and hits against 9, 10, or ace. Stand on soft 19 and soft 20.', cards=[1, 7], dealer=9),
                tool('strategy', 12, pool='soft'),
            ]),
        ]),
        U('sm4', 'Payouts and Side Bets', '/practice/strategy', 'Know what you’re paid, and what it costs.', 'payouts', None, [
            L('sm4-1', '3:2 versus 6:5', [
                teach('The payout that matters most', 'A blackjack comes about once every 21 hands. At 3:2 a $20 blackjack pays $30; at 6:5 it pays $24. That gap adds about 1.4% to the house edge.'),
                choice('A $20 blackjack at 3:2 pays…', ['$24', '$30', '$40'], 1, '$20 × 1.5 = $30.'),
                choice('A $20 blackjack at 6:5 pays…', ['$24', '$30', '$20'], 0, '$20 × 1.2 = $24.'),
                choice('A $15 blackjack at 3:2 pays…', ['$18', '$22.50', '$30'], 1, '$15 × 1.5 = $22.50.'),
                choice('Roughly how often do you get a blackjack?', ['1 hand in 5', '1 hand in 21', '1 hand in 100'], 1, 'About 4.8% of hands.'),
            ]),
            L('sm4-2', 'Insurance and even money', [
                teach('Insurance is a side bet', 'When the dealer shows an ace, insurance bets half your stake that the dealer has blackjack, paying 2:1. Without counting cards, it’s a losing bet, with a house edge of about 7%.'),
                teach('Even money is insurance', 'If you have blackjack and the dealer shows an ace, “even money” pays 1:1 right now. It’s exactly the same as taking insurance, so decline it too.'),
                choice('You don’t count cards. The dealer shows an ace. Take insurance?', ['Yes, always', 'No', 'Only with 20'], 1, 'Without a count, insurance always loses in the long run.', dealer=1),
                choice('You have blackjack; the dealer offers even money. Best choice?', ['Take it', 'Decline it'], 1, 'Declining pays 3:2 most of the time and wins more on average.', cards=[1, 13], dealer=1),
            ]),
            L('sm4-3', 'Side bets', [
                teach('Fun, but expensive', 'Side bets like Perfect Pairs and 21+3 pay big on rare hands, but their house edge is often 3% to over 10%, many times the edge on the main game with good strategy.'),
                choice('Main game edge with basic strategy ≈ 0.5%. A side bet’s edge ≈ 6%. Per dollar bet, the side bet costs about…', ['The same', '12 times more', 'Half as much'], 1, '6% ÷ 0.5% = 12.'),
                choice('A side bet pays 25:1 on a rare hand. Does a big payout mean a good bet?', ['Yes', 'No: the odds of hitting matter more'], 1, 'Payout and probability together set the edge.'),
                choice('Best way to enjoy side bets?', ['Skip them, or make them tiny and occasional', 'Bet them every hand', 'Bet big on them after a loss'], 0, 'Treat them as entertainment with a known cost.'),
            ]),
            L('sm4-4', 'Payouts in practice', [
                choice('You bet $25 and double down, then win. Total profit?', ['$25', '$50', '$75'], 1, 'Your bet becomes $50, and a win pays 1:1.'),
                choice('You bet $10, split eights, win one hand and lose the other. Net?', ['$0', '+$10', '−$10'], 0, 'One $10 win and one $10 loss cancel out.'),
                choice('You surrender a $30 bet. You lose…', ['$0', '$15', '$30'], 1, 'Surrender returns half.'),
                choice('You bet $20 and push. You get back…', ['$0', '$20', '$40'], 1, 'A push returns your bet.'),
                tool('strategy', 6, pool='any'),
            ]),
        ]),
        U('sm5', 'Money Management', '/practice/simulator', 'Budgets, bet sizes, and swings.', 'bankroll', None, [
            L('sm5-1', 'Set a budget', [
                teach('Decide before you play', 'Your session budget is money you can afford to lose for entertainment. Bring it, use it, and stop when it’s gone.'),
                choice('A good budget is money you…', ['Need for bills', 'Can afford to lose', 'Plan to win back'], 1, 'Never play with money you need.'),
                choice('You lost your budget. Best move?', ['Go to the ATM', 'Stop for the day', 'Double your bets'], 1, 'Stopping is the plan working.'),
                choice('A good habit for a casino trip?', ['Split the budget into sessions', 'Play it all at once', 'Borrow from friends'], 0, 'Smaller sessions keep one bad hour from ending the trip.'),
            ]),
            L('sm5-2', 'Bet size and session length', [
                teach('Think in bets', 'With a $300 budget and $10 bets, you have 30 bets. Swings of 10–15 bets in an hour are normal, so 30 bets can vanish quickly.'),
                choice('$300 budget, $25 bets. How many bets?', ['12', '25', '30'], 0, '$300 ÷ $25 = 12 bets.'),
                choice('You want a long session on a small budget. Best choice?', ['Lower your bet size', 'Raise your bet size', 'Play side bets'], 0, 'Smaller bets mean more hands from the same money.'),
                choice('Average loss per hour = edge × average bet × hands. Edge 0.5%, $20 bets, 80 hands. Loss per hour?', ['$0.80', '$8', '$80'], 1, '0.005 × $20 × 80 = $8 an hour, the price of the entertainment.'),
            ]),
            L('sm5-3', 'Swings are normal', [
                teach('Variance', 'Even with perfect strategy, you can win or lose many bets in an hour. A typical hand swings about 1.15 bets, and over 100 hands that grows to about 11.5 bets.'),
                choice('You lost 8 bets in an hour with perfect play. Most likely…', ['You played badly', 'Normal variance', 'The deck was stacked'], 1, 'Results that size are common either way.'),
                choice('You won 10 bets in an hour. That proves…', ['You have an edge', 'Nothing yet: it could be luck'], 1, 'Short-term wins don’t prove skill.'),
                tool('strategy', 6, pool='any'),
            ]),
            L('sm5-4', 'Winning and quitting', [
                choice('You’re up $150 on a $300 budget. Is there a “right” time to quit?', ['Yes, the house edge rises', 'No: each hand is independent, so quit when it stops being fun', 'Never quit while ahead'], 1, 'Quitting doesn’t change the math, but locking in part of a win is a fine personal rule.'),
                choice('A “stop-win” rule (quit after winning X) changes the house edge?', ['Yes', 'No'], 1, 'It changes your experience, not the edge.'),
                choice('A good way to track your results?', ['Log every session in Track', 'Remember the big wins', 'Only count losses'], 0, 'Honest records beat memory.'),
            ]),
        ]),
        U('sm6', 'Myths and Mistakes', '/practice/strategy', 'Beliefs that cost players money.', 'myths', None, [
            L('sm6-1', 'The gambler’s fallacy', [
                teach('Cards and luck have no memory', 'In a shuffled shoe, past wins and losses don’t make you “due”. Only the cards actually removed matter, and only card counters track that.'),
                choice('You lost five hands in a row. You’re now…', ['Due for a win', 'Exactly as likely to win as before', 'More likely to lose'], 1, 'Past results don’t change the next hand.'),
                choice('The dealer busted three times in a row. Next hand they’re…', ['Due to make a hand', 'Due to bust again', 'Neither'], 2, 'Streaks don’t predict the next hand.'),
            ]),
            L('sm6-2', 'Betting systems', [
                teach('Systems can’t beat the edge', 'Martingale (double after every loss) and similar systems rearrange wins and losses but can’t change the house edge. Martingale risks a huge loss to win one unit.'),
                choice('Martingale from $10: after 6 straight losses, your next bet is…', ['$60', '$320', '$640'], 2, '10, 20, 40, 80, 160, 320, then 640.'),
                choice('Can a betting system turn a negative game positive?', ['Yes, with the right one', 'No'], 1, 'Only changing the game (or counting) can do that.'),
                choice('What does a progression system really change?', ['The edge', 'How your results are distributed', 'Nothing at all'], 1, 'More small wins and rare large losses, or the reverse. Same average.'),
            ]),
            L('sm6-3', 'Table myths', [
                choice('A player at third base hits 16 and “takes the dealer’s bust card”. Did that hurt the table?', ['Yes', 'No: unknown cards are equally likely to help or hurt'], 1, 'Other players’ choices don’t change your long-run odds.'),
                choice('Is a “hot table” more likely to keep paying?', ['Yes', 'No'], 1, 'There’s no such thing in a fairly shuffled game.'),
                choice('Standing on 16 against a 10 because “the dealer always has 20”?', ['Correct', 'Slightly worse than hitting in basic strategy'], 1, 'Without counting, hitting 16 against a 10 is slightly better. (Counters stand at a true count of 0 or more.)'),
                tool('strategy', 6, pool='stiff'),
            ]),
            L('sm6-4', 'Mimic the dealer?', [
                teach('Why copying the dealer loses', 'Playing like the dealer (hit to 17, never double or split) gives the house about a 5.5% edge, because you bust first and lose even when the dealer busts later.'),
                choice('Mimicking the dealer gives the house about…', ['0.5%', '2%', '5.5%'], 2, 'Ten times the edge of basic strategy.'),
                choice('Why does the house win if you play like the dealer?', ['You act first and lose when you bust', 'The dealer gets better cards'], 0, 'Busting first is the house’s advantage.'),
                tool('strategy', 6, pool='any'),
            ]),
        ]),
        U('sm7', 'Casino Know-How', '/community/directory', 'Etiquette, signals, comps, and good tables.', 'craft', None, [
            L('sm7-1', 'Hand signals', [
                teach('Signals, not words', 'Dealers watch hand signals for the cameras. Hit: tap the table. Stand: wave your hand flat over your cards. Double or split: place matching chips beside your bet.'),
                choice('How do you signal “hit”?', ['Say “hit me”', 'Tap the table', 'Wave your hand'], 1, 'Tapping is the hit signal.'),
                choice('How do you signal “stand”?', ['Tap the table', 'Wave a flat hand over your cards'], 1, 'A horizontal wave means stand.'),
                choice('To double down, you…', ['Push your bet forward', 'Place an equal bet beside your original bet', 'Say “double”'], 1, 'Add an equal bet beside the first.'),
            ]),
            L('sm7-2', 'Etiquette', [
                choice('When can you touch your bet?', ['Any time', 'Not after the cards are dealt'], 1, 'Once cards are out, hands off your chips.'),
                choice('You want to change cash for chips. You…', ['Hand cash to the dealer', 'Place cash on the felt between hands'], 1, 'Dealers can’t take cash from your hand.'),
                choice('Is tipping the dealer required?', ['Yes', 'No, but it’s customary when you’re enjoying the game'], 1, 'Tips are optional; many players bet one for the dealer.'),
            ]),
            L('sm7-3', 'Comps and promotions', [
                teach('Comps are a rebate', 'Casinos give free meals or rooms based on your expected loss: average bet × hours × house edge. Comps return a fraction of that, so they don’t make the game free.'),
                choice('$25 bets, 4 hours, 80 hands an hour, 0.5% edge. Expected loss?', ['$4', '$40', '$400'], 1, '0.005 × $25 × 320 hands = $40.'),
                choice('Should you bet more to earn comps?', ['Yes', 'Only if the comps are worth more than the extra expected loss'], 1, 'Usually they’re worth less.'),
            ]),
            L('sm7-4', 'Pick a good table', [
                teach('Rules to look for', '3:2 blackjack, dealer stands on soft 17, double after split, and late surrender. Avoid 6:5. Fewer decks are slightly better when the other rules are the same.'),
                choice('Which table is better?', ['6:5, single deck', '3:2, six decks, S17'], 1, '6:5 costs far more than the single deck saves.'),
                choice('Which rule helps you most?', ['3:2 payouts', 'Free drinks', 'A faster dealer'], 0, 'A faster dealer actually raises your hourly cost.'),
                tool('strategy', 6, pool='any', surrender=True),
            ]),
        ]),
        U('sm8', 'Smart Player Checkout', '/practice/strategy', 'Prove you play well.', 'checkout', None, [
            L('sm8-1', 'Checkout: strategy', [tool('strategy', 16, pool='any')]),
            L('sm8-2', 'Checkout: money and myths', [
                choice('Edge 0.5%, $10 bets, 60 hands an hour. Expected loss per hour?', ['$3', '$30', '$0.30'], 0, '0.005 × $10 × 60 = $3.'),
                choice('After four losses, you should…', ['Bet more', 'Bet the same as planned'], 1, 'No hand is “due”.'),
                choice('Even money on your blackjack against an ace?', ['Take it', 'Decline it'], 1, 'Even money is insurance.'),
                choice('Best table?', ['6:5 S17', '3:2 H17', '3:2 S17 with surrender'], 2, 'Best rules win.'),
                tool('strategy', 8, pool='any', h17=True),
            ]),
            L('sm8-3', 'Final exam', [tool('strategy', 18, pool='any', surrender=True)]),
        ]),
    ]

    # =========================================================================================
    # STRATEGY MASTER
    # =========================================================================================
    strategy = [
        U('ms1', 'Hard Totals', '/practice/strategy', 'Hit, stand, or double with hard hands.', 'strategy', 'strategy', [
            R('u2-1', 'ms1-1'), R('u2-2', 'ms1-2'), R('u2-3', 'ms1-3'),
            L('ms1-4', 'Hard totals speed round', [teach('Speed builds confidence', 'Answer as fast as you can while staying accurate. Use the keys H, S, and D.'), tool('strategy', 20, pool='hard')]),
        ]),
        U('ms2', 'Soft Totals', '/practice/strategy', 'Hands with an ace counted as 11.', 'strategy', 'strategy', [
            R('u3-1', 'ms2-1'), R('u3-2', 'ms2-2'), R('u3-3', 'ms2-3'),
            L('ms2-4', 'Soft hands after hitting', [
                teach('Multi-card soft hands', 'A‑2‑3 is soft 16 and plays like any soft 16, except you can no longer double. When doubling isn’t allowed, a “double” becomes a hit, or a stand with soft 18 or 19.'),
                choice('A‑2‑3 (soft 16) against a 5. Play?', ['Double', 'Hit', 'Stand'], 1, 'You can’t double a three-card hand, so hit.', cards=[1, 2, 3], dealer=5),
                choice('A‑3‑4 (soft 18) against a 4. Play?', ['Double', 'Stand', 'Hit'], 1, 'Soft 18 would double, but with three cards you stand.', cards=[1, 3, 4], dealer=4),
                choice('A‑5‑2 (soft 18) against a 9. Play?', ['Stand', 'Hit'], 1, 'Soft 18 hits against 9, 10, and ace, with any number of cards.', cards=[1, 5, 2], dealer=9),
                choice('A‑2‑9 against a 10. What do you have?', ['Soft 22', 'Hard 12', 'Soft 12'], 1, 'The ace drops to 1: hard 12, so hit.', cards=[1, 2, 9], dealer=10),
                tool('strategy', 8, pool='soft'),
            ]),
        ]),
        U('ms3', 'Pairs', '/practice/strategy', 'Every split decision.', 'strategy', None, [
            R('u4-1', 'ms3-1'), R('u4-2', 'ms3-2'),
            L('ms3-3', 'Without double after split', [
                teach('When DAS isn’t allowed', 'Without double after split, some splits lose value: split 2s and 3s only against 4–7, 4s never, and 6s against 3–6.'),
                tool('strategy', 12, pool='pair', das=False),
                choice('No DAS: 4‑4 against a 5. Play?', ['Split', 'Hit'], 1, 'Without DAS, 4‑4 is a hit.', cards=[4, 4], dealer=5),
            ]),
        ]),
        U('ms4', 'Surrender and Insurance', '/practice/strategy', 'When to give up half, and why insurance loses.', 'strategy', None, [
            R('u4-3', 'ms4-1', 'Late surrender'),
            L('ms4-2', 'Insurance is a bad bet', [
                teach('Without a count, decline', 'Insurance pays 2:1 when the dealer has blackjack, but in a six-deck shoe that happens only about 31% of the time. You’d need 33% to break even.'),
                choice('Insurance breaks even when the dealer has blackjack about…', ['25%', '33%', '50%'], 1, 'At 2:1 you need one win in three.'),
                choice('Even money with your blackjack?', ['Take it', 'Decline it'], 1, 'It is insurance.', cards=[1, 12], dealer=1),
                choice('Who can profit from insurance?', ['Nobody', 'Card counters at high true counts'], 1, 'At a Hi‑Lo true count of +3 or more, it becomes a good bet.'),
            ]),
            L('ms4-3', 'Surrender on H17 tables', [
                teach('More surrenders with H17', 'On H17 tables, also surrender 15 against an ace, 17 against an ace, and 8‑8 against an ace.'),
                tool('strategy', 10, pool='surrender', surrender=True, h17=True),
            ]),
            L('ms4-4', 'Surrender checkpoint', [tool('strategy', 16, pool='any', surrender=True)]),
        ]),
        U('ms5', 'Rule Variations', '/practice/strategy', 'Adjust your play to the table.', 'strategy', None, [
            L('ms5-1', 'H17 versus S17', [
                teach('Plays that change with H17', 'With H17: double 11 against an ace, double A‑8 against a 6, and double A‑7 against a 2.'),
                tool('strategy', 14, pool='any', h17=True),
            ]),
            L('ms5-2', 'Double after split', [
                teach('DAS changes pair splits', 'With DAS you split more small pairs, because a good double often follows. Without DAS, play them tighter.'),
                tool('strategy', 12, pool='pair', das=True), tool('strategy', 8, pool='pair', das=False),
            ]),
            L('ms5-3', 'Decks and doubling rules', [
                teach('Fewer decks help a little', 'Going from eight decks to one cuts the house edge by about half a percent, all else equal. Restrictions like “double on 10–11 only” cost about 0.2%.'),
                choice('Which helps the player?', ['More decks', 'Fewer decks'], 1, 'Fewer decks raise the chance of blackjacks and good doubles.'),
                choice('“Double on 10 and 11 only” costs about…', ['0.02%', '0.2%', '2%'], 1, 'A modest but real cost.'),
                choice('Resplitting aces helps the player by about…', ['0.08%', '1%', '0%'], 0, 'A small plus.'),
            ]),
            L('ms5-4', 'Mixed rules drill', [tool('strategy', 10, pool='any', h17=True, surrender=True), tool('strategy', 10, pool='any', das=False)]),
        ]),
        U('ms6', 'House Edge Math', '/practice/simulator', 'What each rule is worth.', 'math', None, [
            L('ms6-1', 'What basic strategy buys', [
                teach('From 5.5% to 0.5%', 'Playing like the dealer gives the house about 5.5%. Perfect basic strategy in a good game cuts that to about 0.5%.'),
                choice('Basic strategy in a good six-deck game leaves the house about…', ['0.05%', '0.5%', '5%'], 1, 'About half a percent.'),
                choice('At 0.5%, $25 bets, 80 hands an hour, the hourly cost is…', ['$1', '$10', '$100'], 1, '0.005 × $25 × 80 = $10.'),
            ]),
            L('ms6-2', 'Rule values', [
                teach('Approximate values (six decks)', 'S17 instead of H17: +0.2%. Double after split: +0.14%. Late surrender: +0.08% (S17). 3:2 instead of 6:5: +1.4%.'),
                choice('Which single change helps the most?', ['Late surrender', '3:2 instead of 6:5', 'S17'], 1, '1.4% dwarfs the others.'),
                choice('A 6:5 game with every other good rule is still…', ['A good game', 'Worse than a typical 3:2 game'], 1, 'Nothing else makes up 1.4%.'),
                choice('Game A: H17, DAS. Game B: S17, no DAS. Which is better?', ['A', 'B', 'About the same'], 1, 'S17 (+0.2%) is worth more than DAS (+0.14%).'),
            ]),
            L('ms6-3', 'The cost of mistakes', [
                teach('Mistakes add up', 'One mistake an hour on a big decision, like standing on 12 against a 2 or never doubling 11, can double the house edge.'),
                choice('Which mistake costs the most?', ['Hitting 12 vs 4', 'Splitting 10‑10 vs 10', 'Standing on 12 vs 2'], 1, 'Breaking up a 20 against a 10 throws away a likely win.'),
                choice('Never doubling at all costs about…', ['0.1%', 'About 1.5%', '10%'], 1, 'Doubles and splits are where you win extra.'),
                tool('strategy', 10, pool='any'),
            ]),
            L('ms6-4', 'Choosing tables by the numbers', [
                choice('Table A: 3:2, H17, DAS, 6D. Table B: 3:2, S17, DAS, surrender, 6D. Better?', ['A', 'B'], 1, 'S17 and surrender both help.'),
                choice('Table A: 6:5 single deck. Table B: 3:2 eight decks, H17. Better?', ['A', 'B'], 1, '6:5 costs about 1.4%; the deck difference is about 0.5%.'),
                teach('Model it yourself', 'The Bankroll Simulator in Practice can show the hourly cost of any game with a flat bet.'),
            ]),
        ]),
        U('ms7', 'Speed and Accuracy', '/practice/strategy', 'Perfect play under time pressure.', 'strategy', None, [
            L('ms7-1', 'Rapid hard hands', [tool('strategy', 20, pool='hard')]),
            L('ms7-2', 'Rapid soft hands', [tool('strategy', 20, pool='soft')]),
            L('ms7-3', 'Rapid pairs', [tool('strategy', 20, pool='pair')]),
            L('ms7-4', 'Rapid everything', [tool('strategy', 24, pool='any', surrender=True)]),
        ]),
        U('ms8', 'Strategy Checkout', '/practice/strategy', 'Every rule set, no mistakes.', 'checkout', None, [
            L('ms8-1', 'Checkout: S17', [tool('strategy', 20, pool='any', surrender=True)]),
            L('ms8-2', 'Checkout: H17', [tool('strategy', 20, pool='any', h17=True, surrender=True)]),
            L('ms8-3', 'Final exam', [tool('strategy', 10, pool='any', das=False), tool('strategy', 14, pool='any', h17=True, surrender=True)]),
        ]),
    ]

    # =========================================================================================
    # CARD COUNTER
    # =========================================================================================
    counter = [
        U('cc1', 'Basic Strategy Refresher', '/practice/strategy', 'Counting only pays if your play is perfect.', 'strategy', 'strategy', [
            L('cc1-1', 'Hard and soft refresher', [teach('Strategy first', 'A counter’s edge is about 1%. Basic strategy mistakes can wipe it out, so make sure your play is automatic.'), tool('strategy', 16, pool='hardsoft')]),
            L('cc1-2', 'Pairs and surrender refresher', [tool('strategy', 10, pool='pair'), tool('strategy', 6, pool='surrender', surrender=True)]),
            L('cc1-3', 'Strategy checkpoint', [tool('strategy', 20, pool='any', surrender=True)]),
        ]),
        U('cc2', 'Hi‑Lo Running Count', '/practice/count', 'Track the shoe with one number.', 'counting', 'count', [
            R('u5-1', 'cc2-1'), R('u5-2', 'cc2-2'), R('u5-3', 'cc2-3'),
            L('cc2-4', 'Count a full table', [
                teach('Real rounds', 'Count every player’s cards, every hit, and the dealer’s hand. The hole card counts only once it’s turned over.'),
                tool('count', 3, table=True, seats=3, speed=850), tool('count', 2, table=True, seats=5, speed=750),
            ]),
        ]),
        U('cc3', 'True Count and Decks', '/practice/truecount', 'Read the tray and convert.', 'truecount', 'tc', [
            R('u6-1', 'cc3-1'), R('u6-2', 'cc3-2'), R('u6-3', 'cc3-3'),
            L('cc3-4', 'Eight-deck shoes', [
                teach('Bigger shoes', 'In an eight-deck game the tray holds more, and decks left start at 8. Convert the same way: running count ÷ decks left.'),
                tool('decks', 5, shoe=8), tool('decks', 4, shoe=8, ask='remaining'), tool('truecount', 6, **HARD_TC),
            ]),
        ]),
        U('cc4', 'Betting with the Count', '/practice/simulator', 'Bet more when you have the edge.', 'betting', None, [
            R('u7-1', 'cc4-1'), R('u7-2', 'cc4-2'), R('u7-3', 'cc4-3'),
            L('cc4-4', 'Units and bankroll', [
                teach('Size your unit', 'A common starting point is a bankroll of 1,000 units or more for a 1–12 shoe spread. With a $10,000 bankroll, that’s a $10 unit.'),
                choice('Bankroll $20,000, 1,000-unit rule. Unit size?', ['$10', '$20', '$200'], 1, '$20,000 ÷ 1,000 = $20.'),
                choice('With that $20 unit and a 1–12 spread, your top bet is…', ['$120', '$240', '$2,400'], 1, '12 × $20 = $240.'),
                tool('bet', 8, max=12),
            ]),
        ]),
        U('cc5', 'Index Plays', '/practice/index', 'Change your play when the count says so.', 'deviations', None, [
            R('u8-1', 'cc5-1'), R('u8-2', 'cc5-2'), R('u8-3', 'cc5-3'),
            L('cc5-4', 'Index review', [teach('All together', 'Insurance at +3, 16 vs 10 at 0, 15 vs 10 at +4, 12 vs 3 at +2, 11 vs A at +1, and the rest you’ve learned.'), tool('index', 16, insurance=True)]),
        ]),
        U('cc6', 'Bankroll and Risk', '/practice/simulator', 'Survive the swings.', 'bankroll', None, [R('u9-1', 'cc6-1'), R('u9-2', 'cc6-2'), R('u9-3', 'cc6-3')]),
        U('cc7', 'Casino Craft', '/community/directory', 'Good games and good conduct.', 'craft', None, [
            R('u10-1', 'cc7-1'), R('u10-2', 'cc7-2'), R('u10-3', 'cc7-3'),
            L('cc7-4', 'Counting under pressure', [
                teach('Distractions are the real test', 'Talking, drinks, and a fast dealer break counts. Practice a full table at speed, and keep your bet change smooth.'),
                tool('count', 2, table=True, seats=5, speed=650), tool('truecount', 6, timer=6, **HARD_TC),
            ]),
        ]),
        U('cc8', 'Counter Checkout', '/practice/challenge', 'Put it all together.', 'checkout', None, [
            R('u11-1', 'cc8-1'), R('u11-2', 'cc8-2'), R('u11-3', 'cc8-3'),
            L('cc8-4', 'Full-shoe practice', [teach('Like the Shoe Challenge', 'Several mini-shoes in a row: count, read the tray, convert, bet, and play.'), tool('scenario', 3)]),
        ]),
    ]

    # =========================================================================================
    # ADVANTAGE PRO
    # =========================================================================================
    pro = [
        U('ap1', 'Counting Refresher', '/practice/count', 'Fast, accurate, automatic.', 'counting', 'tc', [
            L('ap1-1', 'Full-table count', [tool('count', 3, table=True, seats=5, speed=700), tool('count', 2, cards=26, speed=450)]),
            L('ap1-2', 'Tray and conversion', [tool('decks', 6, shoe=6), tool('decks', 4, shoe=8), tool('truecount', 8, timer=6, **HARD_TC)]),
            L('ap1-3', 'Refresher scenarios', [tool('scenario', 3)]),
        ]),
        U('ap2', 'The Full Index Set', '/practice/index', 'Play indices and surrender indices.', 'deviations', None, [
            L('ap2-1', 'The playing indices', [teach('The core set', 'Insurance +3; 16 vs 10 at 0; 15 vs 10 +4; 10 vs 10 +4; 12 vs 3 +2; 12 vs 2 +3; 11 vs A +1; 9 vs 2 +1; 10 vs A +4; 9 vs 7 +3; 16 vs 9 +5; 13 vs 2 −1; 12 vs 4 0; 12 vs 5 −2; 12 vs 6 −1; 13 vs 3 −2.'), tool('index', 18, insurance=True)]),
            L('ap2-2', 'Surrender indices', [
                teach('Four surrender plays', 'With late surrender (S17): surrender 14 vs 10 at +3, 15 vs 10 at 0 or more, 15 vs 9 at +2, and 15 vs ace at +1.'),
                choice('15 vs 10, true count +1, surrender allowed. Play?', ['Surrender', 'Hit', 'Stand'], 0, 'Surrender 15 vs 10 at 0 or higher.', cards=[10, 5], dealer=10),
                choice('14 vs 10, true count +4. Play?', ['Hit', 'Surrender'], 1, 'The index is +3.', cards=[10, 4], dealer=10),
                choice('15 vs 9, true count +1. Play?', ['Surrender', 'Hit'], 1, 'The index is +2, so at +1 you hit.', cards=[10, 5], dealer=9),
                choice('15 vs ace, true count +2. Play?', ['Surrender', 'Hit'], 0, 'The index is +1.', cards=[10, 5], dealer=1),
                choice('14 vs 10, true count +2. Play?', ['Surrender', 'Hit'], 1, 'Below +3, hit.', cards=[9, 5], dealer=10),
            ]),
            L('ap2-3', 'Splitting tens and high counts', [teach('Rare but valuable', 'Split 10‑10 vs 6 at +4 and vs 5 at +5. Insurance at +3. These high-count plays earn a lot but draw attention.', cards=[10, 13], dealer=5), tool('index', 12, hands=[20, 16, 15], insurance=True)]),
            L('ap2-4', 'Index exam', [tool('index', 20, insurance=True)]),
        ]),
        U('ap3', 'Back-Counting', '/practice/count', 'Play only the good shoes.', 'betting', None, [
            L('ap3-1', 'Wonging in and out', [
                teach('Watch, then play', 'Count a table without betting. Enter when the true count reaches about +1 or +2, and leave when it drops to about −1. You skip most negative hands.'),
                choice('You’re back-counting. True count reaches +2. You…', ['Keep watching', 'Enter and bet', 'Leave'], 1, 'That’s a common entry point.'),
                choice('You’re playing and the true count falls to −1. You…', ['Keep betting the minimum', 'Leave the table'], 1, 'Wonging out skips the bad hands.'),
                tool('count', 2, table=True, seats=5, speed=700),
            ]),
            L('ap3-2', 'No mid-shoe entry', [
                choice('A sign says “No mid-shoe entry”. Wonging in is…', ['Allowed', 'Blocked: you must start at the shuffle'], 1, 'Then play from the top or find another table.'),
                choice('How do you profit at a “no mid-shoe entry” table?', ['You can’t', 'Play from the shuffle and wong out on bad counts'], 1, 'You can still leave when the count drops.'),
                choice('Why do casinos post “no mid-shoe entry”?', ['To stop back-counters', 'To speed up the game'], 0, 'It targets wonging.'),
            ]),
            L('ap3-3', 'Playing more hands', [
                teach('Two hands at high counts', 'At a high count, playing two hands puts more money on good cards with less variance than one bigger bet, because the two hands are only partly linked.'),
                choice('True count +5. Better: one hand of $200 or two hands of about $150?', ['One hand of $200', 'Two hands of about $150 each'], 1, 'More money in action, with risk that grows less than proportionally.'),
                choice('At negative counts, how many hands?', ['As few as possible, or none', 'Two', 'Three'], 0, 'Fewer hands means less money at a disadvantage.'),
            ]),
            L('ap3-4', 'Back-counting drill', [tool('count', 3, table=True, seats=5, speed=650), tool('truecount', 6, timer=5, **HARD_TC), tool('bet', 6, max=16)]),
        ]),
        U('ap4', 'Spreads by Game', '/practice/simulator', 'Match the spread to the game.', 'betting', None, [
            L('ap4-1', 'Shoe spreads', [teach('Shoes need a wide spread', 'Shoe games have fewer high counts, so counters use spreads of 1–12 or more, or back-count.'), tool('bet', 10, max=16)]),
            L('ap4-2', 'Pitch spreads', [
                teach('Single and double deck', 'Counts swing faster in pitch games, so a 1–4 to 1–8 spread can be enough, and it draws less attention.'),
                choice('Double deck: a common spread is…', ['1–2', '1–4 to 1–8', '1–50'], 1, 'Smaller spreads work in pitch games.'),
                choice('Why do pitch games need smaller spreads?', ['The edge swings faster with fewer cards', 'The rules are worse'], 0, 'Each card removed matters more.'),
                tool('bet', 6, max=8),
            ]),
            L('ap4-3', 'Cover and smoothing', [
                teach('Smooth your bets', 'Raise bets after wins and in steps rather than jumping from 1 to 12 units. It costs a little edge but looks natural.'),
                choice('A natural-looking raise?', ['1 unit to 12 units in one hand', 'Increase after a win, in steps'], 1, 'Parlaying after a win looks ordinary.'),
                choice('Smoothing your bets costs…', ['Nothing', 'A little win rate, for longevity'], 1, 'A trade worth making.'),
            ]),
            L('ap4-4', 'Spread drill', [tool('bet', 12, max=12), tool('scenario', 2)]),
        ]),
        U('ap5', 'Kelly and Risk', '/practice/simulator', 'Size every bet to your bankroll.', 'bankroll', None, [
            L('ap5-1', 'Kelly betting', [
                teach('Bet in proportion to edge', 'Kelly says bet bankroll × edge ÷ variance. Blackjack variance is about 1.33, so bet about 0.75% of bankroll per 1% of edge.'),
                choice('Bankroll $40,000, edge 1.5%. Full Kelly bet?', ['$300', '$450', '$600'], 1, '$40,000 × 0.015 ÷ 1.33 ≈ $450.'),
                choice('Many pros bet “half Kelly”. Why?', ['Lower risk and smaller swings', 'Higher win rate'], 0, 'Half Kelly gives about 75% of the growth with far less volatility.'),
            ]),
            L('ap5-2', 'Risk of ruin targets', [
                teach('Pick a risk you can live with', 'Pros often target a risk of ruin of 2–10%. Doubling the bankroll at the same bets squares the risk: 10% becomes 1%.'),
                choice('RoR 5% at current bets. Double the bankroll. New RoR?', ['2.5%', 'About 0.25%', '10%'], 1, '0.05² = 0.0025.'),
                choice('RoR 30% is…', ['Comfortable', 'Very aggressive'], 1, 'Nearly a one-in-three chance of going broke.'),
            ]),
            L('ap5-3', 'Resizing after swings', [
                choice('Your bankroll drops 40%. Kelly says…', ['Keep the same bets', 'Cut your bets about 40%'], 1, 'Bets scale with bankroll.'),
                choice('Your bankroll grows 50%. You can…', ['Raise bets proportionally', 'Never change bets'], 0, 'Growing bets with bankroll compounds the edge.'),
                choice('Trip bankroll versus total bankroll?', ['Same thing', 'Trip money is a slice; total bankroll sets the bet size'], 1, 'Size bets to the whole bankroll you’re willing to commit.'),
            ]),
            L('ap5-4', 'N₀ and hours', [
                choice('Edge 1.2%, SD 1.15 bets per hand. N₀ ≈ ?', ['920 hands', '9,200 hands', '92,000 hands'], 1, '(1.15 ÷ 0.012)² ≈ 9,184 hands.'),
                choice('At 100 hands an hour, that is about…', ['9 hours', '92 hours', '920 hours'], 1, 'About 92 hours before skill reliably shows.'),
                teach('Use the simulator', 'Run your exact game and spread in the Bankroll Simulator to see EV, risk, and N₀.'),
            ]),
        ]),
        U('ap6', 'Game Evaluation', '/practice/simulator', 'Which games are worth your time.', 'craft', None, [
            L('ap6-1', 'Penetration matters most', [
                teach('Deep is good', 'Penetration is the share of the shoe dealt before the shuffle. Going from 65% to 80% can roughly double a counter’s win rate.'),
                choice('Six decks, cut card 1 deck from the back. Penetration?', ['67%', '83%', '90%'], 1, '5 of 6 decks dealt ≈ 83%.'),
                choice('Which is usually more valuable to a counter?', ['Better penetration', 'Free drinks', 'A friendlier dealer'], 0, 'Penetration drives the frequency of high counts.'),
                tool('decks', 6, shoe=6, ask='remaining'),
            ]),
            L('ap6-2', 'Comparing games fairly', [
                teach('Compare win rate at equal risk', 'Comparing games by raw win rate is misleading if one needs a bigger spread. A standard approach (SCORE) compares win rate per $10,000 bankroll at the same risk of ruin.'),
                choice('Game A wins more per hour but needs triple the risk. Is A better?', ['Always', 'Not necessarily: compare at equal risk'], 1, 'Equal-risk comparison is the fair one.'),
                choice('Best tool here to compare two games?', ['The Bankroll Simulator', 'Guessing'], 0, 'Run both with the same bankroll.'),
            ]),
            L('ap6-3', 'Rules for counters', [
                choice('For a counter, which rule is most valuable?', ['Late surrender', 'Free drinks', '6:5 blackjack'], 0, 'Surrender saves a lot at high counts.'),
                choice('A continuous shuffling machine is…', ['Great for counters', 'Unbeatable by counting'], 1, 'The count never builds.'),
                choice('Hand-shuffled pitch game, 70% dealt, S17, DAS. Worth scouting?', ['Yes', 'No'], 0, 'A strong counting game.'),
            ]),
            L('ap6-4', 'Scouting drill', [teach('Record what you find', 'Log rules and penetration in the Game Directory so you can compare later.'), tool('decks', 6, shoe=8, ask='remaining'), tool('truecount', 6, **HARD_TC)]),
        ]),
        U('ap7', 'Camouflage and Longevity', '/community/directory', 'Keep your game for years.', 'craft', None, [
            L('ap7-1', 'Looking like a recreational player', [
                teach('Act natural', 'Talk, tip occasionally, don’t stare at the cards, and avoid instant big jumps in bets. Small costs to the edge buy a lot of playing time.'),
                choice('Which habit attracts attention?', ['Chatting with the dealer', 'Jumping from minimum to maximum the moment the count rises'], 1, 'Sudden jumps are the classic tell.'),
                choice('Taking an occasional “wrong” cover play costs…', ['Nothing', 'A little edge, to look ordinary'], 1, 'A deliberate trade.'),
            ]),
            L('ap7-2', 'Session discipline', [
                choice('A good session length to avoid attention?', ['Under about an hour at one table', 'Eight hours straight'], 0, 'Short sessions limit scrutiny and fatigue.'),
                choice('A pit boss starts watching closely. Sensible move?', ['Raise your bets', 'Finish the shoe and leave calmly'], 1, 'Leave before a back-off.'),
                tool('count', 2, table=True, seats=5, speed=650),
            ]),
            L('ap7-3', 'The legal line', [
                teach('Stay on the right side', 'Counting in your head is legal in most places. Using a device is illegal in many places, including Nevada. Casinos may still refuse your play or ban you from blackjack.'),
                choice('Which is legal in most places?', ['Counting in your head', 'A counting app at the table', 'A hidden computer'], 0, 'Your own memory only.'),
                choice('You’re asked to stop playing blackjack. You…', ['Argue', 'Leave politely'], 1, 'Never escalate.'),
            ]),
            L('ap7-4', 'Comps as cover', [
                choice('Asking for comps as a counter…', ['Draws attention', 'Can look like an ordinary player'], 1, 'Recreational players ask for comps.'),
                choice('Comps based on average bet × hours. For a counter, they are…', ['Pure extra value on top of the edge', 'A loss'], 0, 'You’re rated like a losing player while having the edge.'),
            ]),
        ]),
        U('ap8', 'Team Play and Pro Checkout', '/practice/challenge', 'Pool, spot, and prove it.', 'checkout', None, [
            L('ap8-1', 'Team concepts', [
                teach('Spotters and big players', 'Teams famously use spotters who count tables at minimum bets and signal a big player to join hot shoes. Pooling bankrolls cuts each member’s risk.'),
                choice('A spotter’s job?', ['Bet big', 'Count a table and signal when it’s good'], 1, 'The big player then bets only at high counts.'),
                choice('Why pool bankrolls?', ['Bigger combined bankroll means lower risk for the same bets', 'It changes the house edge'], 0, 'Risk falls as bankroll grows.'),
            ]),
            L('ap8-2', 'Pro checkout', [tool('index', 14, insurance=True), tool('scenario', 2)]),
            L('ap8-3', 'Final exam', [tool('scenario', 3), tool('count', 2, table=True, seats=5, speed=600), tool('strategy', 10, pool='any', surrender=True)]),
        ]),
    ]

    tracks = {'smart': smart, 'strategy': strategy, 'counter': counter, 'pro': pro}
    # Two more units per track, placed before each track's checkout unit.
    from tracks_more import more_units
    for tid, extra in more_units(h).items():
        tracks[tid][-1:-1] = extra
    more = extras(h)
    for units in tracks.values():
        for u in units:
            for l in u['lessons']:
                l['steps'] = l['steps'] + more.get(l['id'], [])
    add, trim = balance(h)
    for units in tracks.values():
        for u in units:
            for l in u['lessons']:
                l['steps'] = l['steps'] + add.get(l['id'], [])
                if l['id'] in trim:
                    for st in l['steps']:
                        if st['type'] == 'tool': st['reps'] = trim[l['id']]
    for tid, units in tracks.items():
        for i, u in enumerate(units):
            u['color'] = PALETTE[i % len(PALETTE)] if tid != 'smart' or i else 'green'
    return tracks


def extras(h):
    """Extra questions and drills appended to concept-heavy lessons, so every lesson has real depth."""
    choice, tool, HARD_TC, EASY_TC = h['choice'], h['tool'], h['HARD_TC'], h['EASY_TC']
    return {
        'sm4-1': [choice('A $50 blackjack at 3:2 pays…', ['$60', '$75', '$100'], 1, '$50 × 1.5 = $75.'),
                  choice('Over 100 blackjacks of $20 each, how much does 6:5 cost you versus 3:2?', ['$60', '$300', '$600'], 2, '$6 less per blackjack × 100 = $600.'),
                  tool('strategy', 4, pool='any')],
        'sm4-2': [choice('Insurance in a six-deck game has a house edge of about…', ['0.5%', '7%', '25%'], 1, 'Roughly 7%: far worse than the main game.'),
                  choice('Your $20 bet: insurance costs…', ['$5', '$10', '$20'], 1, 'Insurance is half your bet.'),
                  choice('Insurance wins when the dealer’s hole card is…', ['An ace', 'Any ten-value card', 'A small card'], 1, 'The dealer then has blackjack.'),
                  tool('strategy', 4, pool='any')],
        'sm4-3': [choice('You bet $5 on a side bet every hand for 200 hands with a 6% edge. Expected cost?', ['$6', '$60', '$600'], 1, '0.06 × $5 × 200 = $60.'),
                  choice('Same $5 on the main game at 0.5%? Expected cost over 200 hands?', ['$5', '$50', '$0.50'], 0, '0.005 × $5 × 200 = $5.')],
        'sm5-1': [choice('A $400 trip budget for 2 days and 2 sessions a day. Per session?', ['$100', '$200', '$400'], 0, '$400 ÷ 4 sessions.'),
                  choice('Best place for the rest of your money during a session?', ['In your pocket', 'In your room safe or the bank'], 1, 'Out of reach means out of temptation.'),
                  tool('strategy', 4, pool='stiff')],
        'sm5-2': [choice('$200 session, you want at least 20 bets. Largest bet?', ['$5', '$10', '$20'], 1, '$200 ÷ 20 = $10.'),
                  choice('Playing faster at the same bet makes your hourly loss…', ['Smaller', 'Bigger', 'The same'], 1, 'More hands × the same edge = more loss per hour.'),
                  tool('strategy', 4, pool='low')],
        'sm5-4': [choice('Is a winning night proof your strategy is right?', ['Yes', 'No: judge by correct decisions, not results'], 1, 'Results include luck.'),
                  tool('strategy', 6, pool='any')],
        'sm6-1': [choice('The last 10 hands had lots of small cards. A non-counter should…', ['Bet more', 'Bet the same; their strategy doesn’t change'], 1, 'Only card counters can use that information.'),
                  choice('Roulette landed red 8 times. Black is now…', ['More likely', 'Equally likely'], 1, 'Independent events have no memory.'),
                  choice('Which statement is true?', ['Losses make you due for a win', 'Each blackjack hand depends only on the cards left'], 1, 'That’s why counting works and “due” doesn’t.'),
                  tool('strategy', 4, pool='stiff')],
        'sm6-2': [choice('Paroli (double after a win) changes the house edge?', ['Yes', 'No'], 1, 'Like every progression, it rearranges results only.'),
                  choice('A $1,000 bankroll, Martingale from $10. How many straight losses wipe it out?', ['About 4', 'About 6', 'About 20'], 1, '10+20+40+80+160+320 = $630; the 7th bet of $640 isn’t affordable.'),
                  tool('strategy', 4, pool='any')],
        'sm7-1': [choice('In a face-up shoe game, can you touch the cards?', ['Yes', 'No'], 1, 'In shoe games, players don’t touch the cards.'),
                  choice('To split, you…', ['Separate the cards yourself', 'Place a matching bet beside your original bet'], 1, 'The dealer splits the cards.'),
                  tool('strategy', 4, pool='pair')],
        'sm7-2': [choice('Is it okay to give other players advice?', ['Only if they ask', 'Always'], 0, 'Unasked advice is the most common table annoyance.'),
                  choice('Taking a phone call at the table…', ['Is fine', 'Is usually not allowed during a hand'], 1, 'Many casinos forbid phones at the table.'),
                  tool('strategy', 4, pool='soft')],
        'sm7-3': [choice('Comps typically return what share of your expected loss?', ['All of it', 'About a fifth to a half', 'Double it'], 1, 'Comps are a partial rebate.'),
                  choice('A free buffet worth $25 for $40 of expected loss. Net?', ['You’re $15 ahead', 'You’re still $15 behind on average'], 1, 'Comps reduce, not erase, the cost.'),
                  choice('Players’ cards track…', ['Your bets and time played', 'Your strategy decisions'], 0, 'Ratings use average bet and hours.'),
                  tool('strategy', 4, pool='any')],
        'ms4-2': [choice('Six decks, dealer shows an ace. Chance of blackjack is about…', ['31%', '50%', '10%'], 0, '96 tens left in 311 unseen cards ≈ 31%.'),
                  choice('“Insure a good hand” (insuring your 20)?', ['Smart', 'Still a losing bet'], 1, 'Your hand doesn’t change the side bet’s odds.'),
                  tool('strategy', 6, pool='any', surrender=True)],
        'ms5-3': [choice('Single-deck 3:2 S17 versus six-deck 3:2 S17. Better for basic strategy?', ['Single deck', 'Six decks'], 0, 'Fewer decks help, all else equal.'),
                  choice('No doubling after split costs about…', ['0.14%', '1.4%', '0.01%'], 0, 'DAS is worth about 0.14%.'),
                  tool('strategy', 8, pool='any', das=False)],
        'ms6-1': [choice('Basic strategy at 0.5%, average $50 bet, 70 hands an hour. Hourly cost?', ['$1.75', '$17.50', '$175'], 1, '0.005 × $50 × 70 = $17.50.'),
                  choice('Same game playing like the dealer (5.5%). Hourly cost?', ['$19', '$192.50', '$1,925'], 1, '0.055 × $50 × 70 = $192.50: eleven times more.'),
                  tool('strategy', 8, pool='any')],
        'ms6-2': [choice('Six decks: 3:2, H17, DAS, no surrender. Approximate house edge?', ['0.2%', '0.6%', '2%'], 1, 'About 0.6% for this common game.'),
                  choice('Switching that game to S17 brings it to about…', ['0.4%', '0.8%', '0%'], 0, 'S17 is worth about 0.2%.'),
                  tool('strategy', 6, pool='any', h17=True)],
        'ms6-4': [choice('Table A: 3:2, S17, no DAS. Table B: 3:2, H17, DAS, surrender. Closest call?', ['A is clearly better', 'B is clearly better', 'They’re close'], 2, 'S17 (+0.2) versus DAS + surrender (+0.22): nearly equal.'),
                  choice('Which costs more per hour: a 1% worse game or playing 20% faster?', ['Depends on your bet and speed', 'Always the faster game'], 0, 'Hourly cost = edge × bet × hands.'),
                  tool('strategy', 8, pool='any', surrender=True)],
        'cc6-3': [choice('With a 1.5% edge and SD 1.15, N₀ ≈ ?', ['590 hands', '5,900 hands', '59,000 hands'], 1, '(1.15 ÷ 0.015)² ≈ 5,878.'),
                  tool('truecount', 6, **EASY_TC)],
        'ap2-2': [tool('index', 8, hands=[15, 16], insurance=False)],
        'ap3-1': [choice('Where does most of a counter’s profit come from?', ['A small share of hands at high counts', 'Every hand equally'], 0, 'That’s why skipping negative shoes helps.'),
                  tool('truecount', 6, timer=6, **HARD_TC)],
        'ap3-2': [choice('Another way to avoid bad counts at a no-entry table?', ['Take a bathroom break when the count drops', 'Bet more'], 0, 'A natural reason to sit out.'),
                  tool('count', 2, table=True, seats=4, speed=700)],
        'ap3-3': [choice('Two hands at a high count also means…', ['Using more cards per round, which helps when the count is high', 'Nothing changes'], 0, 'More of the good cards go to you.'),
                  tool('bet', 6, max=12), tool('scenario', 1)],
        'ap4-3': [choice('You won a 4-unit bet and the count rose to TC +6. A natural next bet is…', ['8 units (a parlay)', '16 units out of nowhere'], 0, 'Doubling up after a win looks like a hot streak.'),
                  choice('The count drops after a big bet. A smooth adjustment is…', ['Straight to 1 unit', 'Cut in steps over a couple of hands'], 1, 'Gradual changes draw less attention, at a small cost.'),
                  tool('bet', 8, max=12)],
        'ap5-1': [choice('Bankroll $10,000, edge 2%. Half-Kelly bet?', ['$75', '$150', '$300'], 0, 'Full Kelly ≈ $10,000 × 0.02 ÷ 1.33 ≈ $150; half is $75.'),
                  choice('Over-betting Kelly (2× Kelly)…', ['Grows faster', 'Grows no faster and greatly raises risk'], 1, 'Beyond Kelly, growth falls and risk soars.'),
                  tool('bet', 6, max=12)],
        'ap5-2': [choice('RoR 13.5% is a common reference point. Doubling the bankroll gives about…', ['6.75%', '1.8%', '0%'], 1, '0.135² ≈ 0.018.'),
                  choice('Which reduces RoR most for the same bets?', ['A smaller spread', 'A larger bankroll', 'Playing more hours'], 1, 'Bankroll is the lever.'),
                  choice('Same bankroll, but you halve every bet. RoR…', ['Falls a lot', 'Rises'], 0, 'Effectively doubles your bankroll in units.')],
        'ap5-4': [choice('Doubling your edge (with the same SD) changes N₀ by…', ['Half', 'A quarter', 'Double'], 1, 'N₀ scales with 1/edge².'),
                  tool('truecount', 6, **HARD_TC)],
        'ap6-2': [choice('Two games: A wins $40/hour at 13.5% RoR, B wins $50/hour at 30% RoR. At equal risk, which is likely better?', ['A', 'B'], 0, 'B’s extra win rate comes with far more risk.'),
                  tool('decks', 4, shoe=6, ask='remaining')],
        'ap6-3': [choice('Which hurts a counter most?', ['H17', '6:5 blackjack', 'No surrender'], 1, '6:5 costs about 1.4%, wiping out most of a counter’s edge.'),
                  tool('index', 6, insurance=True)],
        'ap7-1': [choice('Best way to handle a pit boss chatting with you?', ['Stop counting and leave instantly', 'Chat naturally and keep your play steady'], 1, 'Calm and friendly looks ordinary.'),
                  choice('Wearing a players’ card while counting…', ['Always unsafe', 'Common: it also earns comps'], 1, 'Many counters use one and manage their sessions.'),
                  tool('count', 2, table=True, seats=5, speed=650)],
        'ap7-3': [choice('Is it legal for a casino to ban you from blackjack for counting?', ['In many places, yes', 'Never'], 0, 'Private businesses can usually refuse play.'),
                  choice('A dealer offers to show you the hole card. You…', ['Use it', 'Decline: that crosses into cheating with the dealer'], 1, 'Collusion with a dealer is cheating.'),
                  tool('index', 6, insurance=True)],
        'ap7-4': [choice('Which counts as cover?', ['Occasional small bets at high counts', 'Never playing at negative counts'], 0, 'Small deliberate costs make your play look ordinary.'),
                  tool('scenario', 1)],
        'ap8-1': [choice('A team shares results so that…', ['Each player’s swings average out', 'Nobody loses a hand'], 0, 'Pooling smooths individual variance.'),
                  choice('Team play is…', ['Illegal', 'Legal, though casinos may still back you off'], 1, 'Pooling money and counting is legal; devices and collusion are not.'),
                  tool('count', 2, table=True, seats=5, speed=600), tool('bet', 6, max=16)],
    }


def balance(h):
    """Extra drills that even out the four tracks (each lands near 400 questions)."""
    tool, choice, HARD_TC, EASY_TC = h['tool'], h['choice'], h['HARD_TC'], h['EASY_TC']
    s = lambda n, **k: tool('strategy', n, **k)
    add = {}
    for i in range(1, 5): add[f'sm2-{i}'] = [s(4, pool='any')]
    for i in range(1, 4): add[f'sm3-{i}'] = [s(4, pool='soft')]
    for i in range(1, 5): add[f'sm5-{i}'] = add.get(f'sm5-{i}', []) + [s(4, pool='any')]
    for i in range(1, 5): add[f'sm6-{i}'] = [s(3, pool='any')]
    for i in range(1, 5): add[f'sm7-{i}'] = [s(3, pool='any', surrender=True)]
    add['sm4-3'] = [s(4, pool='any')]; add['sm8-2'] = [s(6, pool='any')]
    for i in range(1, 5): add[f'cc4-{i}'] = [tool('bet', 4, max=12)]
    for i in range(1, 4): add[f'cc6-{i}'] = [tool('truecount', 4, **EASY_TC)]
    add['cc7-2'] = [tool('decks', 3, shoe=6)]; add['cc7-3'] = [tool('truecount', 3, **HARD_TC)]
    for i in range(1, 5): add[f'ap6-{i}'] = [tool('truecount', 4, **HARD_TC)]
    for i in range(1, 5): add[f'ap3-{i}'] = add.get(f'ap3-{i}', []) + [tool('index', 3, insurance=True)]
    add['ap4-1'] = [tool('bet', 4, max=8)]; add['ap4-2'] = [tool('bet', 4, max=6)]
    add['ap5-3'] = [choice('After a 50% loss, half-Kelly bets should be…', ['Unchanged', 'About half what they were'], 1, 'Kelly bets track the bankroll.'), tool('bet', 4, max=12)]
    add['ap7-2'] = [tool('truecount', 4, timer=6, **HARD_TC)]
    add['ap5-4'] = add.get('ap5-4', []) + [tool('index', 4, insurance=True)]
    trim = {'ms7-1': 14, 'ms7-2': 14, 'ms7-3': 14, 'ms7-4': 16, 'ms8-1': 14, 'ms8-2': 14, 'ms1-4': 14, 'ms4-4': 12}
    add['sm8-1'] = [s(6, pool='any', surrender=True)]; add['sm1-4'] = [s(4, pool='any')]
    return add, trim
