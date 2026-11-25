"""Two more units (8 lessons) for every track, added before each track's checkout unit.

Facts used here are standard six-deck figures; strategy and index answers in the drills come from the engine.
"""


def more_units(h):
    teach, choice, tool, HARD_TC, EASY_TC = h['teach'], h['choice'], h['tool'], h['HARD_TC'], h['EASY_TC']

    def L(id, title, steps): return {'id': id, 'title': title, 'steps': steps}
    def U(id, title, tool_url, summary, skill, lessons): return {'id': id, 'title': title, 'tool': tool_url, 'summary': summary, 'skill': skill, 'test': None, 'lessons': lessons}

    smart = [
        U('sm9', 'Reading the Dealer', '/practice/strategy', 'How the dealer plays, and why their upcard drives every decision.', 'strategy', [
            L('sm9-1', 'The dealer has no choices', [
                teach('Fixed rules', 'The dealer must hit until reaching 17 or more. They can’t double, split, or stand early. That’s why their upcard tells you so much: you know exactly how they’ll play.', dealer=6),
                choice('The dealer has hard 16. What must they do?', ['Stand', 'Hit', 'It’s their choice'], 1, 'The dealer always hits 16 or less.'),
                choice('The dealer has hard 17. What must they do?', ['Stand', 'Hit'], 0, 'Every table makes the dealer stand on hard 17.'),
                choice('The felt says “Dealer hits soft 17”. The dealer has A‑6. What happens?', ['They stand', 'They hit'], 1, 'At an H17 table the dealer hits soft 17, which slightly favors the house.'),
                choice('Who acts first at the table?', ['The dealer', 'The players'], 1, 'Players act first, so a player who busts loses even if the dealer busts later. That’s the house’s main edge.'),
                tool('strategy', 8, pool='stiff'),
            ]),
            L('sm9-2', 'Bust cards in numbers', [
                teach('How often the dealer busts', 'With a 5 or 6 showing, the dealer busts about 42% of the time. With a 2 or 3, about 35–38%. With a 7 through 10, only about 21–26%. With an ace, about 17% once they’ve checked for blackjack.', dealer=5),
                choice('Which upcard busts the dealer most often?', ['2', '6', '10'], 1, 'The 5 and 6 are the weakest upcards, busting about 42% of the time.'),
                choice('Roughly how often does a dealer showing a 10 bust?', ['About 1 in 5', 'About 1 in 2', 'Almost never'], 0, 'About 21%.'),
                choice('Why is a dealer 6 weak?', ['They must hit a 16 most of the time', 'Sixes are unlucky', 'They can’t draw'], 0, 'A 6 often becomes a 16 that has to take another card.'),
                choice('Why is a dealer 7 much stronger than a 6?', ['A ten underneath makes 17, a pat hand', 'Sevens are lucky', 'The dealer can stand early'], 0, 'With a ten in the hole, 7 makes 17 and stops, while 6 makes 16 and must hit.'),
                tool('strategy', 10, pool='stiff'),
            ]),
            L('sm9-3', 'Why you hit 16 against a 10', [
                teach('Two bad options', '16 against a 10 is a losing hand either way. Standing, you win only when the dealer busts (about 1 in 5). Hitting busts often, but wins a little more often overall. Basic strategy picks the smaller loss.', cards=[10, 6], dealer=10),
                choice('You have 16 against a 9. Play?', ['Hit', 'Stand'], 0, 'Against 7 through ace, 16 needs help.', cards=[9, 7], dealer=9),
                choice('You have 13 against a 2. Play?', ['Hit', 'Stand'], 1, 'Stand on 13–16 against the dealer’s 2–6.', cards=[10, 3], dealer=2),
                choice('Is it “wrong” when hitting 16 busts?', ['Yes, you should have stood', 'No, a correct decision can still lose'], 1, 'Judge decisions by the odds, not by one result.'),
                tool('strategy', 12, pool='stiff'),
            ]),
            L('sm9-4', 'Upcard drills', [
                teach('Put it together', 'Look at the dealer’s card first, then your total. Weak upcards (2–6): let the dealer bust. Strong upcards (7–ace): improve your hand.'),
                choice('The dealer shows a 4 and you have 14. Play?', ['Hit', 'Stand'], 1, '4 is a bust card. Stand.', cards=[8, 6], dealer=4),
                choice('The dealer shows an 8 and you have 14. Play?', ['Hit', 'Stand'], 0, '8 is strong. Hit.', cards=[8, 6], dealer=8),
                tool('strategy', 14, pool='any'),
            ]),
        ]),
        U('sm10', 'Smart Sessions', '/practice/simulator', 'Plan a casino visit that’s fun, affordable, and under control.', 'bankroll', [
            L('sm10-1', 'Hands per hour', [
                teach('Speed changes your cost', 'A full table plays about 50–60 hands an hour. Playing alone with the dealer can reach 150–200. Each hand carries the same small edge, so more hands means a bigger expected loss per hour.'),
                choice('Which costs more per hour at the same bet?', ['A crowded table', 'Playing alone with the dealer'], 1, 'Many more hands an hour means more total edge paid.'),
                choice('$10 bets, 0.5% edge, 60 hands an hour. Expected cost per hour?', ['$0.30', '$3', '$30'], 1, '0.005 × $10 × 60 = $3.'),
                choice('Same game at 180 hands an hour?', ['$3', '$9', '$18'], 1, 'Three times the hands, three times the cost: $9.'),
                tool('strategy', 8, pool='any'),
            ]),
            L('sm10-2', 'Stop-loss and win goals', [
                teach('Limits that protect you', 'A stop-loss (leave after losing a set amount) and a win goal (leave after winning one) don’t change the house edge. They protect your budget and your mood, and that’s reason enough.'),
                choice('Does a win goal improve your odds?', ['Yes', 'No, but it helps you keep some winnings'], 1, 'Odds don’t change. Leaving ahead is still nice.'),
                choice('You hit your stop-loss. Best move?', ['Leave the table', 'Double your bet to win it back'], 0, 'Chasing losses is how a bad night becomes a disaster.'),
                choice('Which is a warning sign?', ['Betting money meant for bills', 'Playing within a set budget'], 0, 'If you’re betting needed money, stop and get support: 1-800-GAMBLER is free and confidential.'),
                tool('strategy', 8, pool='stiff'),
            ]),
            L('sm10-3', 'Table manners and tips', [
                teach('Good habits at the table', 'Use hand signals (tap to hit, wave to stand) because cameras record them. Place chips beside your bet to double or split. Tipping the dealer is common, often a small bet placed for them.'),
                choice('The signal to stand in a shoe game is…', ['Tap the table', 'Wave your hand over your cards'], 1, 'Wave to stand, tap to hit.'),
                choice('To double down, you…', ['Add chips beside your original bet', 'Stack chips on top of your bet'], 0, 'Place the double next to the original bet, never on top.'),
                choice('A common way to tip is…', ['A small bet placed for the dealer', 'Handing cash to the dealer mid-hand'], 0, 'Many players place a small bet for the dealer.'),
                tool('strategy', 8, pool='pair'),
            ]),
            L('sm10-4', 'Your session plan', [
                teach('Before you go', 'Pick a 3:2 table, set a budget you can afford to lose, divide it into sessions, choose a bet that gives you at least 20 bets per session, and decide your stop-loss and quit time in advance.'),
                choice('$300 budget, 3 sessions, at least 20 bets each. Largest bet?', ['$5', '$15', '$30'], 0, '$300 ÷ 3 = $100 a session; $100 ÷ 20 = $5.'),
                choice('What should you choose first?', ['A 3:2 table', 'The hottest-looking table'], 0, 'Rules matter. Hot tables don’t exist.'),
                tool('strategy', 12, pool='any'),
            ]),
        ]),
    ]

    strategy = [
        U('ms9', 'Rule-Set Changes', '/practice/strategy', 'Exactly which plays change with H17, no DAS, and surrender.', 'strategy', [
            L('ms9-1', 'When the dealer hits soft 17', [
                teach('H17 changes', 'At an H17 six-deck table: double 11 against an ace, double A‑8 against a 6, and double A‑7 against a 2. With surrender, also surrender 15 and 17 against an ace, and 8‑8 against an ace.', cards=[6, 5], dealer=1),
                choice('H17 table: 11 against an ace. Play?', ['Hit', 'Double'], 1, 'At H17 the dealer’s ace busts a little more often, so double 11.', cards=[6, 5], dealer=1),
                choice('H17 table: A‑8 against a 6. Play?', ['Stand', 'Double'], 1, 'At H17 double soft 19 against a 6 (stand if doubling isn’t allowed).', cards=[1, 8], dealer=6),
                choice('S17 table: 11 against an ace. Play?', ['Hit', 'Double'], 0, 'At S17 six-deck, hit 11 against an ace.', cards=[6, 5], dealer=1),
                tool('strategy', 10, pool='any', h17=True),
            ]),
            L('ms9-2', 'No doubling after splits', [
                teach('No-DAS changes', 'If you can’t double after splitting, some splits lose their value: split 2‑2 and 3‑3 only against 4–7, never split 4‑4, and split 6‑6 only against 3–6.', cards=[3, 3], dealer=3),
                choice('No DAS: 2‑2 against a 3. Play?', ['Split', 'Hit'], 1, 'Without DAS, split 2‑2 only against 4–7.', cards=[2, 2], dealer=3),
                choice('No DAS: 4‑4 against a 5. Play?', ['Split', 'Hit'], 1, 'Without DAS, play 4‑4 as an 8 and hit.', cards=[4, 4], dealer=5),
                choice('With DAS: 4‑4 against a 5. Play?', ['Split', 'Hit'], 0, 'With DAS, split 4‑4 against 5 and 6.', cards=[4, 4], dealer=5),
                tool('strategy', 10, pool='pair', das=False),
            ]),
            L('ms9-3', 'The surrender table', [
                teach('Late surrender', 'With late surrender, give up 16 against 9, 10, or ace, and 15 against a 10. Never surrender 8‑8 in a six-deck S17 game: split it.', cards=[10, 6], dealer=10),
                choice('16 against a 9 with surrender. Play?', ['Hit', 'Surrender'], 1, 'Surrender 16 against 9, 10, and ace.', cards=[9, 7], dealer=9),
                choice('15 against a 9 with surrender. Play?', ['Hit', 'Surrender'], 0, 'Surrender 15 only against a 10 in S17 six-deck.', cards=[10, 5], dealer=9),
                choice('8‑8 against a 10 with surrender (S17). Play?', ['Split', 'Surrender'], 0, 'Split 8‑8.', cards=[8, 8], dealer=10),
                tool('strategy', 10, pool='surrender', surrender=True),
            ]),
            L('ms9-4', 'Mixed-rule drill', [
                teach('Read the felt first', 'Before your first hand, check three rules: soft 17, DAS, and surrender. Then play the matching chart.'),
                choice('Which single rule change hurts you most?', ['H17', 'No DAS', '6:5 blackjack'], 2, '6:5 costs about 1.4%, far more than H17 (0.2%) or no DAS (0.14%).'),
                tool('strategy', 6, pool='any', h17=True, surrender=True),
                tool('strategy', 6, pool='any', das=False),
            ]),
        ]),
        U('ms10', 'Exam Prep', '/practice/strategy', 'Timed, mixed review of every chart until it’s automatic.', 'strategy', [
            L('ms10-1', 'Hard totals sprint', [
                teach('Hard totals', 'Hard 8 or less: hit. 9: double 3–6. 10: double 2–9. 11: double all but an ace (S17). 12: stand 4–6. 13–16: stand 2–6. 17+: stand.'),
                choice('Hard 9 against a 2. Play?', ['Double', 'Hit'], 1, 'Double 9 only against 3–6.', cards=[5, 4], dealer=2),
                tool('strategy', 12, pool='hard'),
            ]),
            L('ms10-2', 'Soft totals sprint', [
                teach('Soft totals', 'A‑2/A‑3: double 5–6. A‑4/A‑5: double 4–6. A‑6: double 3–6. A‑7: double 3–6 (S17), stand 2, 7, 8, hit 9–ace. A‑8+: stand.'),
                choice('A‑3 against a 4. Play?', ['Double', 'Hit'], 1, 'A‑2 and A‑3 double only against 5 and 6.', cards=[1, 3], dealer=4),
                tool('strategy', 12, pool='soft'),
            ]),
            L('ms10-3', 'Pairs sprint', [
                teach('Pairs', 'Always split A‑A and 8‑8. Never split 10‑10 or 5‑5. 9‑9: split 2–9 except 7. 7‑7: split 2–7. 6‑6: split 2–6. 2‑2/3‑3: split 2–7. 4‑4: split 5–6 (DAS).'),
                choice('9‑9 against a 7. Play?', ['Split', 'Stand'], 1, '18 beats the dealer’s likely 17, so stand.', cards=[9, 9], dealer=7),
                tool('strategy', 12, pool='pair'),
            ]),
            L('ms10-4', 'Full mixed exam', [
                teach('Everything at once', 'Mixed hands, mixed rules. Aim for 100%: every mistake is money left on the table.'),
                tool('strategy', 8, pool='any'),
                tool('strategy', 6, pool='any', h17=True),
            ]),
        ]),
    ]

    counter = [
        U('cc9', 'Counting at a Live Table', '/practice/count', 'Keep the count when cards fly from every seat.', 'counting', [
            L('cc9-1', 'Cancel in pairs', [
                teach('Pairs cancel', 'Count cards in pairs: a high card and a low card cancel to zero, so you can skip them. A 10 and a 5 together are 0. Only count what’s left over.', cards=[10, 5]),
                choice('K and 4 together count…', ['+1', '0', '−1'], 1, 'One high (−1) and one low (+1) cancel.'),
                choice('A, 6, and 2 together count…', ['+1', '+2', '−1'], 0, 'A is −1, 6 and 2 are +1 each: +1.'),
                choice('7, 8, and 9 together count…', ['0', '+3', '−3'], 0, '7, 8, and 9 are all neutral.'),
                tool('count', 5, cards=10, speed=750),
            ]),
            L('cc9-2', 'Seat by seat', [
                teach('Count in the same order every round', 'Count each player’s first two cards as they land, then hits as they come, then the dealer’s hand last. A steady order keeps you from double-counting.'),
                choice('When do you count the dealer’s hole card?', ['When it’s turned over', 'Never'], 0, 'Count it when it’s revealed.'),
                choice('A player busts and their cards are swept quickly. You…', ['Count them as they’re dealt, before the sweep', 'Ignore them'], 0, 'Count every card as it’s exposed.'),
                tool('count', 4, table=True, seats=3, speed=800),
            ]),
            L('cc9-3', 'Full table speed', [
                teach('More players, more cards', 'At a full table you see about 15–20 cards a round. Practice at speed until counting feels automatic, then add conversation.'),
                choice('A full seven-seat table shows about how many cards a round?', ['5', '15–20', '50'], 1, 'Two cards per player and dealer, plus hits.'),
                choice('You lose the count mid-shoe. Best move?', ['Guess and keep betting big', 'Bet the minimum until the next shuffle'], 1, 'A wrong count is worse than no count.'),
                tool('count', 4, table=True, seats=5, speed=700),
            ]),
            L('cc9-4', 'Penetration', [
                teach('How deep the cut is', 'Penetration is how much of the shoe is dealt before the shuffle. Counting gains most deep in the shoe, so 5 of 6 decks dealt is much better than 4 of 6.'),
                choice('Which game is better for a counter?', ['75% penetration', '83% penetration'], 1, 'Deeper penetration means more high counts.'),
                choice('A continuous shuffling machine means…', ['Counting doesn’t help', 'Counting works better'], 0, 'Cards go back in after each round, so the count never builds.'),
                tool('decks', 4, shoe=6, ask='remaining'),
                tool('truecount', 6, **EASY_TC),
            ]),
        ]),
        U('cc10', 'Insurance and Key Indices', '/practice/index', 'The few deviations that are worth the most.', 'deviations', [
            L('cc10-1', 'Insurance at +3', [
                teach('The most valuable index', 'Take insurance when the Hi‑Lo true count is +3 or higher. At +3, enough tens remain that the side bet pays for itself.', dealer=1),
                choice('True count +1, dealer shows an ace. Insurance?', ['Take it', 'Decline'], 1, 'Below +3, insurance loses.'),
                choice('True count +4, dealer shows an ace. Insurance?', ['Take it', 'Decline'], 0, 'At +3 or higher, insure.'),
                choice('“Even money” on your blackjack is…', ['The same as insurance', 'A different, better bet'], 0, 'Even money is insurance on a blackjack. Use the same +3 rule.'),
                tool('index', 10, insurance=True),
            ]),
            L('cc10-2', '16 against 10', [
                teach('Stand at zero or higher', 'Hit 16 against a 10 when the true count is negative. At 0 or higher, stand: the extra tens make hitting too risky.', cards=[10, 6], dealer=10),
                choice('16 vs 10 at true count +1. Play?', ['Hit', 'Stand'], 1, 'Stand at 0 or higher.', cards=[10, 6], dealer=10),
                choice('16 vs 10 at true count −2. Play?', ['Hit', 'Stand'], 0, 'Below 0, hit.', cards=[10, 6], dealer=10),
                tool('index', 10, hands=[16]),
            ]),
            L('cc10-3', 'Doubles and tens', [
                teach('More doubles at high counts', 'Double 10 against a 10 at +4. Double 9 against a 2 at +1. Split tens against a 6 at +4 and against a 5 at +5.', cards=[6, 4], dealer=10),
                choice('10 vs 10 at true count +5. Play?', ['Hit', 'Double'], 1, 'Double at +4 or higher.', cards=[6, 4], dealer=10),
                choice('10‑10 vs 6 at true count +2. Play?', ['Split', 'Stand'], 1, 'Split tens against 6 only at +4 or higher.', cards=[10, 10], dealer=6),
                tool('index', 10, hands=[9, 10, 11, 20]),
            ]),
            L('cc10-4', 'Stiff hands at low counts', [
                teach('Hit more when the count is negative', 'At negative counts small cards are rich, so stiffs hit more: 12 vs 4 hits below 0, 13 vs 2 hits below −1, and 12 vs 3 stands only at +2.', cards=[10, 2], dealer=4),
                choice('12 vs 4 at true count −1. Play?', ['Hit', 'Stand'], 0, 'Below 0, hit 12 vs 4.', cards=[10, 2], dealer=4),
                tool('index', 10, hands=[12, 13, 15, 16]),
            ]),
        ]),
    ]

    pro = [
        U('ap9', 'Table Selection', '/practice/simulator', 'Find the games that are worth playing.', 'craft', [
            L('ap9-1', 'Rules worth hunting', [
                teach('Rule value', 'Relative to a six-deck S17, DAS, no-surrender 3:2 game: H17 costs about 0.2%, no DAS about 0.14%, 6:5 about 1.4%. Late surrender gains about 0.07–0.09%, resplitting aces about 0.08%.'),
                choice('Which matters most?', ['3:2 vs 6:5', 'Surrender', 'Resplit aces'], 0, 'The payout dwarfs every other rule.'),
                choice('Six-deck H17 with surrender vs S17 without: roughly…', ['H17 game is clearly better', 'Close, S17 slightly better', 'Identical'], 1, '−0.2% for H17 against about +0.09% for surrender.'),
                tool('decks', 4, shoe=6),
                tool('truecount', 6, **HARD_TC),
            ]),
            L('ap9-2', 'Players and speed', [
                teach('Seats matter', 'More players means fewer hands per hour for you and fewer rounds per shoe. A heads-up game gives you the most hands at high counts, but also the most attention.'),
                choice('Which gives you more high-count hands per hour?', ['A full table', 'Two or three players'], 1, 'Fewer players, more rounds for you.'),
                choice('A counter often prefers…', ['Seats where they can see every card', 'A seat facing away from the table'], 0, 'You need to see the cards to count them.'),
                tool('count', 4, table=True, seats=4, speed=650),
            ]),
            L('ap9-3', 'Penetration and edge', [
                teach('Deeper is better', 'Edge grows with penetration. Moving from 4 to 5 decks dealt out of 6 can roughly double a counter’s win rate at the same spread.'),
                choice('Best of these six-deck games?', ['4 decks dealt, 1–12 spread', '5 decks dealt, 1–12 spread'], 1, 'Same spread, deeper cut, more edge.'),
                tool('decks', 4, shoe=6, ask='remaining'),
                tool('bet', 6, max=12),
            ]),
            L('ap9-4', 'Scout and decide', [
                teach('A quick checklist', 'Payout 3:2? Soft 17 rule? DAS and surrender? Penetration? Table minimum vs your bankroll? Heat from the pit? If the answers are poor, walk.'),
                choice('A 6:5 game with great penetration. Play?', ['Yes', 'No'], 1, 'The 6:5 payout erases most of a counter’s edge.'),
                tool('scenario', 1),
            ]),
        ]),
        U('ap10', 'Variance Lab', '/practice/simulator', 'Measure swings, risk, and how long the edge takes to show.', 'bankroll', [
            L('ap10-1', 'Standard deviation', [
                teach('Swings per hand', 'One blackjack hand has a standard deviation of about 1.15 bets. Over n hands, the swing grows with the square root of n, while the expected win grows with n.'),
                choice('SD of 100 hands at 1 unit?', ['About 11.5 units', 'About 115 units', 'About 1.15 units'], 0, '1.15 × √100 = 11.5.'),
                choice('SD of 10,000 hands at 1 unit?', ['115 units', '1,150 units', '11,500 units'], 0, '1.15 × √10,000 = 115.'),
                tool('truecount', 6, **HARD_TC),
            ]),
            L('ap10-2', 'Expected value vs swings', [
                teach('When does the edge show?', 'With a 1% edge, after 10,000 one-unit hands you expect +100 units with an SD of 115. You can still be behind. The edge only dominates over very long runs.'),
                choice('1% edge, 10,000 hands, 1 unit. Expected win?', ['10 units', '100 units', '1,000 units'], 1, '0.01 × 10,000 = 100.'),
                choice('Being behind after 10,000 hands with a real edge is…', ['Impossible', 'Quite possible'], 1, 'An SD of 115 against +100 EV leaves plenty of room to be down.'),
                tool('bet', 6, max=12),
            ]),
            L('ap10-3', 'N-zero', [
                teach('The long run, in hands', 'N₀ is the number of hands until expected win equals one standard deviation: (SD ÷ edge)². Smaller N₀ means your skill shows sooner.'),
                choice('SD 1.15, edge 1%. N₀ ≈ ?', ['1,300', '13,000', '130,000'], 1, '(1.15 ÷ 0.01)² ≈ 13,225.'),
                choice('Raising your edge from 1% to 2% makes N₀…', ['Half', 'A quarter', 'Double'], 1, 'N₀ scales with 1 ÷ edge².'),
                tool('truecount', 6, timer=6, **HARD_TC),
            ]),
            L('ap10-4', 'Risk targets', [
                teach('Choose your risk', 'Pick a risk of ruin you can live with, often 5% or less, then size your bets to your bankroll. Betting a fraction of Kelly cuts risk a lot for a small cost in growth.'),
                choice('Halving all bets with the same bankroll makes risk of ruin…', ['Much lower', 'Higher', 'Unchanged'], 0, 'It’s like doubling your bankroll in units.'),
                tool('bet', 8, max=16),
                tool('scenario', 1),
            ]),
        ]),
    ]
    return {'smart': smart, 'strategy': strategy, 'counter': counter, 'pro': pro}
