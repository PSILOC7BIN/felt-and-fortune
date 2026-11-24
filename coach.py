"""Felt & Fortune Coach: onboarding survey, rule-based plan builder, and the lesson curriculum.

The planner is a transparent expert system. It scores survey answers (including four short
placement questions), places the learner in the curriculum, flags focus areas, sets a daily
goal, and explains each decision so the learner can see why the plan looks the way it does.
"""
import math
import random
from datetime import date, timedelta

from engine import basic, total, hilo, deviation, INDICES

# ---------------------------------------------------------------------------
# Survey
# ---------------------------------------------------------------------------

SURVEY = [
    {'id': 'experience', 'prompt': 'How well do you know blackjack?', 'options': [
        ['new', 'I’ve never really played'],
        ['casual', 'I know the rules and play for fun'],
        ['strategy', 'I play with a basic strategy chart'],
        ['counter', 'I’ve tried counting cards'],
        ['pro', 'I count seriously and want to sharpen up'],
    ]},
    {'id': 'goal', 'prompt': 'What do you want out of this?', 'options': [
        ['understand', 'Understand the game and the math'],
        ['smarter', 'Play smarter and lose less'],
        ['count', 'Learn to count cards'],
        ['pro', 'Play with a real long-term edge'],
    ]},
    {'id': 'quiz_hard', 'kind': 'placement', 'prompt': 'You have 16 and the dealer shows a 10. Six decks, no surrender. What’s the best play?',
     'cards': [10, 6], 'dealer': 10, 'options': [
        ['hit', 'Hit'], ['stand', 'Stand'], ['double', 'Double'], ['unsure', 'Not sure yet'],
    ]},
    {'id': 'quiz_soft', 'kind': 'placement', 'prompt': 'You have A‑7 (soft 18) and the dealer shows a 9. What’s the best play?',
     'cards': [1, 7], 'dealer': 9, 'options': [
        ['stand', 'Stand'], ['hit', 'Hit'], ['double', 'Double'], ['unsure', 'Not sure yet'],
    ]},
    {'id': 'quiz_count', 'kind': 'placement', 'prompt': 'Using Hi‑Lo, what’s the running count after these cards?',
     'cards': [2, 5, 13, 1, 6, 9], 'options': [
        ['-1', '−1'], ['0', '0'], ['1', '+1'], ['3', '+3'], ['unsure', 'What’s Hi‑Lo?'],
    ]},
    {'id': 'quiz_tc', 'kind': 'placement', 'prompt': 'The running count is +9 with 3 decks left to play. What’s the true count?', 'options': [
        ['3', '+3'], ['6', '+6'], ['12', '+12'], ['unsure', 'Not sure yet'],
    ]},
    {'id': 'challenge', 'prompt': 'What feels hardest right now?', 'options': [
        ['chart', 'Remembering the right play'],
        ['speed', 'Keeping up with the cards'],
        ['betting', 'Knowing how much to bet'],
        ['discipline', 'Staying disciplined and calm'],
        ['unsure', 'Not sure yet'],
    ]},
    {'id': 'game', 'prompt': 'Where do you play, or plan to?', 'options': [
        ['shoe', 'Six- or eight-deck shoe games'],
        ['pitch', 'Single- or double-deck games'],
        ['online', 'Online, or not in casinos yet'],
        ['unsure', 'Not sure'],
    ]},
    {'id': 'time', 'prompt': 'How much time can you practice each day?', 'options': [
        ['5', '5 minutes · casual'], ['10', '10 minutes · regular'], ['15', '15 minutes · serious'], ['20', '20+ minutes · intense'],
    ]},
    {'id': 'style', 'prompt': 'How do you like to learn?', 'options': [
        ['quiz', 'Jump in and practice'],
        ['explain', 'Short explanations first'],
        ['mix', 'A mix of both'],
    ]},
]

PLACEMENT_ANSWERS = {'quiz_hard': 'hit', 'quiz_soft': 'hit', 'quiz_count': '1', 'quiz_tc': '3'}


def public_survey():
    """The survey without placement answers."""
    return [{k: v for k, v in q.items()} for q in SURVEY]


def validate_answers(answers):
    if not isinstance(answers, dict):
        raise ValueError('Survey answers must be an object.')
    clean = {}
    for q in SURVEY:
        value = str(answers.get(q['id'], ''))
        if value not in {o[0] for o in q['options']}:
            raise ValueError('Please answer every survey question.')
        clean[q['id']] = value
    return clean


# ---------------------------------------------------------------------------
# Curriculum
# ---------------------------------------------------------------------------

def teach(title, text, cards=None, dealer=None):
    step = {'type': 'teach', 'title': title, 'text': text}
    if cards: step['cards'] = cards
    if dealer: step['dealer'] = dealer
    return step


def choice(prompt, options, answer, explain, cards=None, dealer=None):
    step = {'type': 'choice', 'prompt': prompt, 'options': options, 'answer': answer, 'explain': explain}
    if cards: step['cards'] = cards
    if dealer: step['dealer'] = dealer
    return step


def gen(kind, count, **opts):
    return {'type': 'gen', 'kind': kind, 'count': count, **opts}


def tool(name, reps, **config):
    """An interactive step: the browser runs the named trainer `reps` times with this config."""
    return {'type': 'tool', 'tool': name, 'reps': reps, 'config': config}


def chart(title, text, groups, **rules):
    return {'type': 'teach', 'title': title, 'text': text, 'chart': {'groups': groups, 'rules': rules}}


TOOL_NAMES = {'strategy', 'count', 'decks', 'truecount', 'index', 'bet', 'scenario'}
EASY_TC = dict(rcMin=-8, rcMax=12, deckOptions=[1, 2, 3, 4, 5])
HARD_TC = dict(rcMin=-16, rcMax=22, deckOptions=[.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5])

UNITS = [
    {'id': 'u1', 'title': 'Table Basics', 'skill': 'basics', 'color': 'green', 'tool': '/practice/strategy',
     'summary': 'Card values, hand totals, payouts, and how a round plays out.',
     'lessons': [
        {'id': 'u1-1', 'title': 'Card values and totals', 'steps': [
            teach('Every card has a value', 'Number cards count as their number. Jacks, queens, and kings all count as 10. An ace counts as 1 or 11, whichever helps your hand more.', cards=[1, 13, 7]),
            gen('total', 4),
            teach('Hard and soft hands', 'A hand is soft when it holds an ace counted as 11, like A‑6 (soft 17). One more card can’t bust it, because the ace can drop back to 1. Every other hand is hard.', cards=[1, 6]),
            gen('total', 4, soft=True),
            choice('What is A + 6 + 9?', ['16', '26', 'Soft 16'], 0, 'Counting the ace as 11 would make 26, a bust, so it counts as 1: 1 + 6 + 9 = hard 16.', cards=[1, 6, 9]),
            choice('What is A + A + 9?', ['11', 'Soft 21', '21, a blackjack'], 1, 'One ace counts as 11 and the other as 1: 11 + 1 + 9 = soft 21. It’s not a blackjack, which needs exactly two cards.', cards=[1, 1, 9]),
            choice('You hold soft 17 (A‑6) and draw a 10. What do you have now?', ['Bust (27)', 'Hard 17', 'Soft 17'], 1, 'The ace drops to 1: 1 + 6 + 10 = hard 17. Soft hands can’t bust on one card.', cards=[1, 6, 10]),
            gen('total', 3),
        ]},
        {'id': 'u1-2', 'title': 'How a round works', 'steps': [
            teach('Beat the dealer', 'You and the dealer each get two cards, and one of the dealer’s cards, the upcard, is face up. Get closer to 21 than the dealer without going over. Going over 21 is a bust.'),
            choice('You bust, then the dealer busts too. What happens?', ['It’s a push', 'You lose your bet', 'You win'], 1, 'You act first. Once you bust, your bet is gone, even if the dealer busts later. That ordering is where the house edge comes from.'),
            teach('Blackjack pays extra', 'An ace plus a ten-value card as your first two cards is a blackjack. At a good table it pays 3:2. Avoid 6:5 tables: they pay less on every blackjack and add over 1% to the house edge.', cards=[1, 12]),
            choice('Your $25 blackjack pays 3:2. How much do you win?', ['$25', '$30', '$37.50'], 2, '3:2 means $3 for every $2 bet: $25 × 1.5 = $37.50.'),
            choice('The same $25 blackjack at a 6:5 table pays…', ['$30', '$37.50', '$50'], 0, '6:5 pays $25 × 1.2 = $30, which is $7.50 less every time.'),
            choice('You have 20. The dealer shows a 10, checks, and turns over an ace. What happens?', ['You win', 'Push', 'You lose'], 2, 'The dealer has blackjack, which beats any hand except your own blackjack.', cards=[10, 13], dealer=10),
            choice('You and the dealer both have 19. Result?', ['You win', 'Push: you keep your bet', 'You lose'], 1, 'Equal totals are a push.'),
            choice('Which of these is a blackjack?', ['7‑7‑7', 'A‑K', '10‑9‑2'], 1, 'Only a two-card ace plus a ten-value card counts as a blackjack.'),
        ]},
        {'id': 'u1-3', 'title': 'Dealer rules and your options', 'steps': [
            teach('The dealer has no choices', 'The dealer must hit until reaching 17 or more. On S17 tables the dealer stands on soft 17; on H17 tables the dealer hits it. S17 is better for you, by about 0.2%.'),
            choice('The dealer has 16. What must the dealer do?', ['Stand', 'Hit', 'It depends on your hand'], 1, 'The dealer always hits below 17, no matter what you hold.'),
            choice('On an H17 table the dealer has A‑6. What happens?', ['The dealer stands', 'The dealer hits', 'The dealer may choose'], 1, 'A‑6 is soft 17, and H17 means the dealer hits soft 17.', cards=[1, 6]),
            choice('The dealer has 6‑5‑6. On an H17 table, what happens?', ['The dealer hits', 'The dealer stands'], 1, '6 + 5 + 6 is hard 17. Every table stands on hard 17; H17 only changes soft 17.', cards=[6, 5, 6]),
            teach('Your five options', 'Hit: take a card. Stand: keep your hand. Double: double your bet and take exactly one card. Split: turn a pair into two hands with a second bet. Surrender (where allowed): give up half your bet before playing.'),
            choice('What happens after you double down?', ['You can keep hitting', 'You get exactly one more card', 'You get your bet back'], 1, 'Doubling doubles the bet and gives you one card. Then your hand is done.'),
            choice('You bet $20 and surrender. What do you get back?', ['$0', '$10', '$20'], 1, 'Surrender returns half your bet.'),
            teach('Try the trainer', 'Next, a few real hands. Tap a play, or press H, S, D, or P. You’ll learn the full strategy in the next units; for now, go with your gut and read the reasons.'),
            tool('strategy', 5, pool='stiff'),
        ]},
    ]},
    {'id': 'u2', 'title': 'Hard Totals', 'skill': 'strategy', 'color': 'blue', 'tool': '/practice/strategy',
     'summary': 'The core of basic strategy: when to hit, stand, or double.',
     'lessons': [
        {'id': 'u2-1', 'title': 'Stiff hands', 'steps': [
            teach('Always stand on 17 or more', 'A hard 17 or higher busts too often if you hit. Stand every time.'),
            teach('13 to 16: watch the upcard', 'With 13–16, stand when the dealer shows 2–6 and hit when the dealer shows 7 through ace. Small upcards are bust cards for the dealer, so let the dealer take the risk.', cards=[10, 5], dealer=6),
            chart('The hard-total chart', 'Here’s the hard-total section of the chart for a six-deck, S17 game. The stiff hands, 12 to 16, are where most mistakes happen.', ['Hard']),
            tool('strategy', 12, pool='stiff'),
        ]},
        {'id': 'u2-2', 'title': '12 and the doubling hands', 'steps': [
            teach('12 is special', 'Stand on 12 only against a 4, 5, or 6. Against a 2 or 3, hit: the dealer is less likely to bust.', cards=[10, 2], dealer=4),
            teach('Double when you’re ahead', 'Double 11 against 2–10. Double 10 against 2–9. Double 9 against 3–6. Otherwise, hit. On H17 tables, also double 11 against an ace.', cards=[6, 5], dealer=6),
            tool('strategy', 12, pool='low'),
            choice('On an H17 table you have 11 against an ace. The play?', ['Hit', 'Double'], 1, 'When the dealer hits soft 17, doubling 11 against an ace gains value.', cards=[6, 5], dealer=1),
            choice('You have 9 against a 2. The play?', ['Double', 'Hit', 'Stand'], 1, 'Double 9 only against 3–6.', cards=[5, 4], dealer=2),
        ]},
        {'id': 'u2-3', 'title': 'Hard totals checkpoint', 'steps': [
            tool('strategy', 16, pool='hard'),
            teach('H17 changes a few plays', 'When the dealer hits soft 17, the dealer busts a little more and makes better hands a little more. Watch the rule line above each hand.'),
            tool('strategy', 6, pool='hard', h17=True),
        ]},
    ]},
    {'id': 'u3', 'title': 'Soft Totals', 'skill': 'strategy', 'color': 'teal', 'tool': '/practice/strategy',
     'summary': 'Playing hands with an ace counted as 11.',
     'lessons': [
        {'id': 'u3-1', 'title': 'Soft doubles', 'steps': [
            teach('Soft hands can’t bust', 'Because the ace can fall back to 1, one more card can’t bust a soft hand. That makes them great doubling hands against weak upcards.', cards=[1, 4]),
            teach('The soft doubling pattern', 'Double A‑2 and A‑3 against 5–6. A‑4 and A‑5 against 4–6. A‑6 against 3–6. Otherwise hit soft 17 and below.', cards=[1, 6], dealer=4),
            chart('The soft chart', 'The doubling window widens as the soft total rises. Notice how soft 17 and below never stand.', ['Soft']),
            tool('strategy', 12, pool='softlow'),
        ]},
        {'id': 'u3-2', 'title': 'Soft 18 and up', 'steps': [
            teach('Soft 18 is tricky', 'A‑7: double against 3–6, stand against 2, 7, and 8, and hit against 9, 10, or ace. Soft 18 isn’t strong enough to stand against those big upcards.', cards=[1, 7], dealer=9),
            teach('Soft 19 and 20', 'Stand on soft 19 and soft 20. On H17 tables, double A‑8 against a 6, and double A‑7 against a 2.'),
            tool('strategy', 12, pool='soft'),
            choice('H17 table: A‑8 against a 6. The play?', ['Stand', 'Double'], 1, 'With H17, soft 19 doubles against a 6.', cards=[1, 8], dealer=6),
        ]},
        {'id': 'u3-3', 'title': 'Hard and soft checkpoint', 'steps': [
            tool('strategy', 16, pool='hardsoft'),
            tool('strategy', 6, pool='soft', h17=True),
        ]},
    ]},
    {'id': 'u4', 'title': 'Pairs & Surrender', 'skill': 'strategy', 'color': 'indigo', 'tool': '/practice/strategy',
     'summary': 'When to split, and when to give up half.',
     'lessons': [
        {'id': 'u4-1', 'title': 'Always and never', 'steps': [
            teach('Always split aces and eights', 'Two aces make a weak soft 12; split, they start two strong hands. Two eights make 16, the worst total; split, they become two hands starting at 8.', cards=[8, 8]),
            teach('Never split tens or fives', '10‑10 is already 20. Keep it. 5‑5 is a 10: play it like one and double against 2–9.', cards=[5, 5]),
            tool('strategy', 10, pool='pair'),
        ]},
        {'id': 'u4-2', 'title': 'The rest of the pairs', 'steps': [
            teach('Split against weak upcards', 'With double after split: split 2s, 3s, and 7s against 2–7. Split 6s against 2–6. Split 4s only against 5–6. Split 9s against 2–9 except 7, then stand.', cards=[9, 9], dealer=7),
            chart('The pairs chart', 'Every pair at a glance. Split = Sp.', ['Pairs']),
            tool('strategy', 14, pool='pair'),
        ]},
        {'id': 'u4-3', 'title': 'Surrender and the full chart', 'steps': [
            teach('Late surrender', 'Where it’s offered, surrender hard 16 against 9, 10, or ace, and hard 15 against a 10. You lose half your bet, which is less than you’d lose on average by playing these hands out.', cards=[10, 6], dealer=10),
            choice('Surrender is allowed. You have 8‑8 against a 10 in a six-deck S17 game. Best play?', ['Split', 'Surrender', 'Hit'], 0, 'Eights are split, even against a 10. (On H17 tables, 8‑8 surrenders against an ace.)', cards=[8, 8], dealer=10),
            tool('strategy', 8, pool='surrender', surrender=True),
            teach('The whole chart', 'Everything together: hard totals, soft totals, pairs, and surrender. This is the final basic strategy checkpoint.'),
            tool('strategy', 14, pool='any', surrender=True),
        ]},
    ]},
    {'id': 'u5', 'title': 'Hi‑Lo Running Count', 'skill': 'counting', 'color': 'orange', 'tool': '/practice/count',
     'summary': 'Track the shoe with one simple number.',
     'lessons': [
        {'id': 'u5-1', 'title': 'Card tags', 'steps': [
            teach('Why counting works', 'Tens and aces help you: more blackjacks, and more dealer busts. Small cards help the dealer. When more big cards are left, you have the edge.'),
            teach('The Hi‑Lo tags', '2 through 6 count +1. 7, 8, and 9 count 0. Tens, faces, and aces count −1. A full deck adds up to 0.', cards=[5, 8, 12]),
            choice('What is the Hi‑Lo tag for a 6?', ['+1', '0', '−1'], 0, '2 through 6 are +1.', cards=[6]),
            choice('What is the Hi‑Lo tag for an ace?', ['+1', '0', '−1'], 2, 'Tens, faces, and aces are −1.', cards=[1]),
            choice('What is the Hi‑Lo tag for a 7?', ['+1', '0', '−1'], 1, '7, 8, and 9 are neutral.', cards=[7]),
            choice('What is the Hi‑Lo tag for a queen?', ['+1', '0', '−1'], 2, 'Face cards count as tens: −1.', cards=[12]),
            teach('Watch the cards fly', 'Cards will now be dealt one at a time. Keep a running total in your head, then type it in. Use ± for negative counts.'),
            tool('count', 3, cards=4, speed=1400),
            tool('count', 3, cards=6, speed=1100),
        ]},
        {'id': 'u5-2', 'title': 'Keeping a running count', 'steps': [
            teach('Cancel pairs', 'A low card and a high card cancel out. When you see a 5 and a king together, skip them. It is much faster than adding one card at a time.', cards=[4, 13]),
            tool('count', 4, cards=8, speed=950),
            teach('Two at a time', 'Real tables show cards in pairs and groups. Count the pair as one number: 5 + K is 0; 4 + 3 is +2.'),
            tool('count', 3, cards=12, speed=1100, perFlash=2),
        ]},
        {'id': 'u5-3', 'title': 'Count faster', 'steps': [
            teach('Speed comes from practice', 'Aim to count down a full deck in under 25 seconds with no mistakes. These rounds get longer and faster.'),
            tool('count', 3, cards=16, speed=700),
            tool('count', 2, cards=26, speed=550),
            choice('You count down a full deck and finish at +2. What does that mean?', ['The deck was rich in tens', 'You made a mistake somewhere', 'Nothing, any count is possible'], 1, 'Hi‑Lo is balanced: a complete deck always sums to 0.'),
        ]},
    ]},
    {'id': 'u6', 'title': 'True Count', 'skill': 'truecount', 'color': 'purple', 'tool': '/practice/truecount',
     'summary': 'Read the discard tray and turn the running count into a true count.',
     'lessons': [
        {'id': 'u6-1', 'title': 'Why true count', 'steps': [
            teach('The same count means different things', 'A running count of +6 with 6 decks left is only about break-even. With 1 deck left, it’s a big edge. The true count fixes this.'),
            teach('Divide by decks left', 'True count = running count ÷ decks remaining. This app rounds down: +9 with 2 decks left is +4.5, so +4. Negative counts round down too: −3 ÷ 2 = −1.5, so −2.'),
            tool('truecount', 8, **EASY_TC),
            choice('Running count +3 with half a deck left. True count?', ['+1', '+3', '+6'], 2, '+3 ÷ 0.5 = +6. Dividing by less than one deck makes the true count bigger.'),
        ]},
        {'id': 'u6-2', 'title': 'Estimating decks', 'steps': [
            teach('Read the discard tray', 'Estimate how many decks are in the discard tray, then subtract from the shoe size. Answer to the nearest half deck. Drag the tray to rotate it; the orange stack is one deck for reference.'),
            tool('decks', 4, shoe=6, markers=True),
            teach('Now without the lines', 'Real trays have no markings. Compare against the one-deck reference and your own sense of height.'),
            tool('decks', 4, shoe=6),
            tool('decks', 4, shoe=6, ask='remaining'),
            tool('decks', 2, shoe=8),
        ]},
        {'id': 'u6-3', 'title': 'True count drills', 'steps': [
            teach('Faster, harder', 'Halves, negatives, and a timer. Real games won’t wait for you.'),
            tool('truecount', 8, **HARD_TC),
            tool('truecount', 6, timer=8, **HARD_TC),
        ]},
    ]},
    {'id': 'u7', 'title': 'Betting with the Count', 'skill': 'betting', 'color': 'yellow', 'tool': '/practice/simulator',
     'summary': 'Bet more when you have the edge.',
     'lessons': [
        {'id': 'u7-1', 'title': 'Where the edge comes from', 'steps': [
            teach('A small edge, rising', 'In a good six-deck game the house starts with about a 0.5% edge. Each +1 of true count shifts about 0.5% to you, so near TC +1 you’re roughly even and above it you have the edge.'),
            choice('About what is your edge at a true count of +4?', ['−0.5%', 'About +1.5%', 'About +4%'], 1, 'Roughly (4 − 1) × 0.5% = 1.5%. Small, but you can bet into it.'),
            choice('About what is your edge at a true count of −2?', ['About −2%', 'About −1.5%', 'About +1%'], 1, '(−2 − 1) × 0.5% = −1.5%: a clear house edge.'),
            choice('At a true count of −2, you should…', ['Bet your minimum, or leave', 'Bet big to win it back', 'Take insurance'], 0, 'Negative counts favor the house. Bet the minimum or step away.'),
            choice('About what is your edge at a true count of +6?', ['+0.5%', 'About +2.5%', 'About +6%'], 1, '(6 − 1) × 0.5% = 2.5%. This is when your big bets go out.'),
            choice('Why does a high count help the player more than the dealer?', ['Blackjacks pay you 3:2 but the dealer only wins 1:1', 'The dealer can’t see the count', 'High cards help the dealer bust less'], 0, 'Both sides get more blackjacks, but only yours pay 3:2. You can also double and split, and you can stand on stiffs while the dealer must hit them.'),
            teach('Convert first', 'Every bet decision starts from the true count. Warm up your conversions.'),
            tool('truecount', 5, **EASY_TC),
        ]},
        {'id': 'u7-2', 'title': 'Building a bet ramp', 'steps': [
            teach('Think in units', 'A unit is your minimum bet. A simple ramp: 1 unit at TC +1 or lower, then (TC − 1) units above that, capped at your max. A 1‑to‑12 spread is common in shoe games.'),
            tool('bet', 10, max=12),
            teach('Caps matter', 'A smaller cap lowers risk and attention, at the cost of some win rate. Now the cap is 8 units.'),
            tool('bet', 5, max=8),
            choice('Why cap your maximum bet?', ['To control risk and attention', 'Because the edge stops growing', 'It’s required by law'], 0, 'Bigger spreads earn more, but they increase risk and draw attention from the casino.'),
        ]},
        {'id': 'u7-3', 'title': 'Count, convert, bet', 'steps': [
            teach('Back-counting', 'Wonging means counting a table without playing, joining when the count rises (say TC +2), and leaving when it falls (say TC −1). It cuts out hands you’d play at a disadvantage.'),
            choice('You’re back-counting and the true count rises to +3. What do you do?', ['Keep watching', 'Join and bet with the count', 'Leave the casino'], 1, 'That’s a good time to jump in.'),
            teach('All the steps in a row', 'Count the cards, read the tray, convert, and size the bet. The last question asks you to play a hand with the count; index plays come next unit, so use basic strategy if you’re unsure.'),
            tool('scenario', 2),
        ]},
    ]},
    {'id': 'u8', 'title': 'Index Plays', 'skill': 'deviations', 'color': 'pink', 'tool': '/practice/index',
     'summary': 'Change your play when the count says so.',
     'lessons': [
        {'id': 'u8-1', 'title': 'Insurance and 16 vs 10', 'steps': [
            teach('Insurance at +3', 'Insurance is a side bet that the dealer has blackjack. It pays 2:1. Normally it’s a bad bet, but at a Hi‑Lo true count of +3 or higher, take it.'),
            teach('The most valuable index', 'Hard 16 against a 10: stand at a true count of 0 or higher, otherwise hit. Hard 15 against a 10: stand at +4 or higher. Hard 16 against a 9: stand at +5 or higher.', cards=[10, 6], dealer=10),
            tool('index', 12, hands=[16, 15], insurance=True),
        ]},
        {'id': 'u8-2', 'title': 'Doubling indices', 'steps': [
            teach('Double more when the count is high', '10 vs 10: double at +4. 11 vs ace: double at +1. 9 vs 2: double at +1. 10 vs ace: double at +4. 9 vs 7: double at +3.'),
            tool('index', 14, hands=[9, 10, 11], insurance=False),
        ]},
        {'id': 'u8-3', 'title': 'Stiff hand indices', 'steps': [
            teach('12 and 13', 'Stand with 12 vs 2 at +3 and vs 3 at +2. Stand with 12 vs 4 at 0 or higher, 12 vs 5 at −2 or higher, 12 vs 6 at −1 or higher. Stand with 13 vs 2 at −1 or higher and 13 vs 3 at −2 or higher.'),
            teach('Splitting tens', 'At very high counts, split 10‑10 against a 5 (at +5) or a 6 (at +4). It’s a strong play, but it draws a lot of attention.', cards=[10, 13], dealer=6),
            tool('index', 14, hands=[12, 13, 20], insurance=True),
        ]},
    ]},
    {'id': 'u9', 'title': 'Bankroll & Risk', 'skill': 'bankroll', 'color': 'red', 'tool': '/practice/simulator',
     'summary': 'Survive the swings long enough for the edge to show up.',
     'lessons': [
        {'id': 'u9-1', 'title': 'EV vs variance', 'steps': [
            teach('Expectation is a long-run average', 'Expected value (EV) per hour = edge × average bet × hands per hour. Any single session can end far from it.'),
            choice('Your edge is 1%, your average bet is $100, and you play 100 hands an hour. EV per hour?', ['$10', '$100', '$1,000'], 1, '0.01 × $100 × 100 = $100 per hour.'),
            teach('Swings are huge', 'A blackjack hand has a standard deviation (SD) of about 1.15 bets. Over n hands, SD grows with √n: 100 hands is 1.15 × √100 = 11.5 bets.'),
            choice('Same game: about what is one SD per hour?', ['$115', '$1,150', '$11,500'], 1, '1.15 × $100 × √100 = $1,150, more than eleven times the hourly EV.'),
            choice('A counter with a real edge loses for three sessions in a row. Most likely…', ['The edge is gone', 'That’s normal variance', 'The casino is cheating'], 1, 'Swings are large compared with a small edge. Judge your play by accuracy and EV, not by short-term results.'),
            choice('Edge 1.5%, average bet $50, 80 hands an hour. EV per hour?', ['$6', '$60', '$600'], 1, '0.015 × $50 × 80 = $60.'),
            choice('As you play more hours, which grows faster?', ['EV: it grows with hours', 'SD: it grows with the square root of hours'], 0, 'EV grows in a straight line; SD grows only with √hours. That is why the edge eventually wins out.'),
            choice('100 hours at $100 EV and $1,150 SD per hour. Total EV and SD?', ['EV $10,000, SD $11,500', 'EV $10,000, SD $115,000', 'EV $1,000, SD $11,500'], 0, 'EV: 100 × $100 = $10,000. SD: $1,150 × √100 = $11,500. Even after 100 hours, a loss is still quite possible.'),
        ]},
        {'id': 'u9-2', 'title': 'Risk of ruin', 'steps': [
            teach('Size your bankroll', 'Risk of ruin (RoR) is the chance of losing your whole bankroll before the edge pays off. Under the usual approximation, doubling the bankroll at the same bets squares the risk.'),
            choice('Your risk of ruin is 10%. You double your bankroll and keep the same bets. New risk, approximately?', ['5%', '1%', '20%'], 1, '0.10 squared is 0.01: about 1%.'),
            choice('If you double your unit size and keep the same bankroll, your risk of ruin…', ['Goes up', 'Stays the same', 'Goes down'], 0, 'The same money now covers fewer bets.'),
            choice('Your risk of ruin is 20%. You double your bankroll at the same bets. New risk, approximately?', ['10%', 'About 4%', '40%'], 1, '0.20 squared is 0.04: about 4%.'),
            choice('Which change lowers risk of ruin without lowering your edge?', ['A bigger bankroll for the same bets', 'Playing faster', 'Spreading bigger at high counts'], 0, 'More bankroll per unit is the cleanest way to cut risk.'),
            teach('Kelly betting', 'The Kelly bet is bankroll × edge ÷ variance. Blackjack’s variance per hand is about 1.33, so bet roughly 0.75% of your bankroll for each 1% of edge.'),
            choice('With a $10,000 bankroll and a 1% edge, about what is the Kelly bet?', ['$75', '$100', '$1,000'], 0, '$10,000 × 0.01 ÷ 1.33 ≈ $75.'),
            choice('Only play with money that…', ['You can afford to lose', 'You need for rent', 'You borrowed'], 0, 'Even a winning player can lose in the short run. Never use money you need.'),
        ]},
        {'id': 'u9-3', 'title': 'N₀ and tracking results', 'steps': [
            teach('N₀: when skill shows', 'N₀ is how many hands it takes for expected winnings to equal one SD: (SD ÷ edge)². Before N₀, luck dominates your results.'),
            choice('With a 1% edge and an SD of 1.15 bets per hand, N₀ is about…', ['1,300 hands', '13,000 hands', '130,000 hands'], 1, '(1.15 ÷ 0.01)² = 13,225 hands.'),
            choice('If your edge doubles to 2%, N₀ becomes about…', ['6,600 hands', '3,300 hands', '26,000 hands'], 1, '(1.15 ÷ 0.02)² ≈ 3,300. Doubling the edge cuts N₀ by four.'),
            choice('At 100 hands an hour, 13,000 hands is about…', ['13 hours', '130 hours', '1,300 hours'], 1, '13,000 ÷ 100 = 130 hours of play before skill reliably shows.'),
            choice('What should you track to judge your play?', ['Only profit', 'EV, hours, and profit', 'Only wins'], 1, 'EV tells you how well you played; profit includes luck. Log both in Track.'),
            teach('Model it', 'The Bankroll Simulator in Practice plays millions of hands with your rules and spread, and reports EV, SD, risk of ruin, and N₀.'),
        ]},
    ]},
    {'id': 'u10', 'title': 'Casino Craft', 'skill': 'craft', 'color': 'graphite', 'tool': '/community/directory',
     'summary': 'Choose good games and play responsibly.',
     'lessons': [
        {'id': 'u10-1', 'title': 'Game selection', 'steps': [
            teach('Find good rules', 'Look for 3:2 blackjack, S17, double after split, late surrender, and deep penetration. Avoid 6:5 games and continuous shuffling machines: they can’t be counted.'),
            choice('Which game can’t be counted?', ['Six-deck shoe, 75% dealt', 'Continuous shuffling machine', 'Double deck, 65% dealt'], 1, 'A continuous shuffler puts discards back into play, so the count never builds.'),
            choice('A six-deck shoe has the cut card placed with 1½ decks behind it. Penetration?', ['25%', '67%', '75%'], 2, '4½ of 6 decks are dealt: 75%.'),
            choice('Which is the better game for a counter?', ['6 decks, 65% penetration', '6 decks, 80% penetration'], 1, 'Deeper penetration means more hands at high counts.'),
            tool('decks', 3, shoe=6, ask='remaining'),
        ]},
        {'id': 'u10-2', 'title': 'Rules of conduct', 'steps': [
            teach('Know the rules', 'Counting in your head is legal in most places, but casinos can refuse your action or ask you to leave. Using any device to help you count is illegal in many places, including Nevada.'),
            choice('A casino asks you to stop playing blackjack. Best response?', ['Argue with security', 'Politely leave', 'Switch to a device'], 1, 'Stay polite, cash out, and go. Never use counting devices.'),
            choice('Which habit draws the most attention?', ['Small, steady bets', 'Jumping from 1 unit to 12 units at once', 'Tipping the dealer'], 1, 'Sudden large bet jumps are the classic giveaway.'),
            choice('Which of these is legal in most places?', ['Counting in your head', 'A counting app on your phone at the table', 'A hidden computer'], 0, 'Your own memory is legal; devices are illegal in many places.'),
            choice('A casino “backs you off” from blackjack. What does that mean?', ['You broke the law', 'They’ve chosen not to take your blackjack action', 'You owe them money'], 1, 'A back-off is a business decision, not an accusation of a crime. Leave politely.'),
            choice('Why vary your bets with some care rather than jumping straight to the max?', ['It hides the count from the dealer', 'Gradual changes look more natural and draw less attention', 'Big jumps lower your edge'], 1, 'The edge is the same; the attention isn’t.'),
        ]},
        {'id': 'u10-3', 'title': 'Discipline', 'steps': [
            teach('Your edge depends on accuracy', 'Fatigue, alcohol, and tilt cause mistakes, and mistakes erase a small edge fast. Set a time limit and leave when you’re not sharp.'),
            choice('After two hours, you’re making counting mistakes. You should…', ['Keep going', 'Raise your bets to finish faster', 'Take a break or end the session'], 2, 'Tired counting costs more than it earns.'),
            choice('You’re down 40 units tonight with a real edge. What does the math say?', ['Raise your bets to win it back', 'Your edge on the next hand is the same as before', 'Quit counting'], 1, 'Past results don’t change the next hand. Chasing losses with bigger bets raises risk, not edge.'),
            choice('A good reason to set a session time limit is…', ['It changes the house edge', 'Accuracy drops when you’re tired', 'Casinos require it'], 1, 'Your edge exists only while your play is accurate.'),
            tool('count', 2, cards=16, speed=650),
        ]},
    ]},
    {'id': 'u11', 'title': 'Pro Checkout', 'skill': 'checkout', 'color': 'gold', 'tool': '/practice/challenge',
     'summary': 'Prove it all together.',
     'lessons': [
        {'id': 'u11-1', 'title': 'Checkout I', 'steps': [tool('strategy', 10, pool='any', surrender=True), tool('count', 2, cards=20, speed=600), tool('truecount', 6, timer=8, **HARD_TC)]},
        {'id': 'u11-2', 'title': 'Checkout II', 'steps': [tool('index', 10, insurance=True), tool('decks', 4, shoe=8), tool('bet', 5, max=12)]},
        {'id': 'u11-3', 'title': 'Final exam', 'steps': [teach('The final exam', 'Three full mini-shoes: count, read the tray, convert, bet, and play with the count. Then a last round of mixed hands.'), tool('scenario', 3), tool('strategy', 8, pool='any', h17=True)]},
    ]},
]

UNIT_BY_ID = {u['id']: u for u in UNITS}
SKILL_UNITS = {
    'basics': ['u1'], 'strategy': ['u2', 'u3', 'u4'], 'counting': ['u5'], 'truecount': ['u6'],
    'betting': ['u7'], 'deviations': ['u8'], 'bankroll': ['u9'], 'craft': ['u10'],
}
REVIEW_POOLS = {
    'u2': [tool('strategy', 14, pool='hard')], 'u3': [tool('strategy', 14, pool='soft')], 'u4': [tool('strategy', 14, pool='pair')],
    'u5': [tool('count', 4, cards=10, speed=800), tool('count', 2, cards=16, speed=650)],
    'u6': [tool('decks', 4, shoe=6), tool('truecount', 10, **HARD_TC)],
    'u7': [tool('bet', 10, max=12), choice('Back-counting means…', ['Counting without playing until the count is good', 'Counting backwards', 'Playing two hands'], 0, 'You watch, then join when the count favors you.')],
    'u8': [tool('index', 14, insurance=True)],
    'u9': [choice('Which lowers risk of ruin?', ['A bigger bankroll', 'Bigger bets', 'Playing tired'], 0, 'More bankroll per unit lowers the chance of going broke.'),
           choice('Edge 1.5%, average bet $50, 80 hands an hour. EV per hour?', ['$6', '$60', '$600'], 1, '0.015 × $50 × 80 = $60.'),
           choice('Your risk of ruin is 20%. You double your bankroll at the same bets. New risk?', ['10%', 'About 4%', '40%'], 1, '0.2 squared is 0.04.')],
}

# ---------------------------------------------------------------------------
# Planner
# ---------------------------------------------------------------------------

LEVELS = ['Rookie', 'Player', 'Strategist', 'Counter', 'Advantage Player']
UNIT_ORDER = [u['id'] for u in UNITS]


def build_plan(answers, today=None):
    a = validate_answers(answers)
    today = today or date.today()
    reasons = []
    exp_rank = ['new', 'casual', 'strategy', 'counter', 'pro'].index(a['experience'])
    hard_ok = a['quiz_hard'] == PLACEMENT_ANSWERS['quiz_hard']
    soft_ok = a['quiz_soft'] == PLACEMENT_ANSWERS['quiz_soft']
    count_ok = a['quiz_count'] == PLACEMENT_ANSWERS['quiz_count']
    tc_ok = a['quiz_tc'] == PLACEMENT_ANSWERS['quiz_tc']

    # Placement: skip a stage only when every earlier stage is also proven.
    start = 'u1'
    if exp_rank >= 1:
        start = 'u2'
        reasons.append('You already know the rules, so Table Basics is marked complete. You can still review it any time.')
    else:
        reasons.append('You’re starting from the very beginning with card values and how a round works.')
    if start == 'u2' and hard_ok and soft_ok and exp_rank >= 2:
        start = 'u5'
        reasons.append('You got both strategy checks right, so you’ll test out of the basic strategy units and start counting.')
    elif start == 'u2' and (hard_ok or soft_ok):
        reasons.append('You got one strategy check right. You’ll start with basic strategy and move quickly through what you know.')
    if start == 'u5' and count_ok:
        start = 'u6'
        reasons.append('Your running count was correct, so you’ll start with true count conversion.')
        if tc_ok and exp_rank >= 3:
            start = 'u7'
            reasons.append('You converted to a true count correctly, so you’ll start where the money is: betting with the count.')

    # Focus areas: missed placement checks plus the self-reported challenge.
    focus = set()
    if not hard_ok: focus.add('u2')
    if not soft_ok: focus.add('u3')
    if not count_ok and exp_rank >= 3:
        focus.add('u5')
        reasons.append('You said you’ve counted before, but the count check was off, so the counting units get extra review.')
    if not tc_ok and exp_rank >= 3: focus.add('u6')
    challenge_map = {'chart': ['u2', 'u3', 'u4'], 'speed': ['u5', 'u6'], 'betting': ['u7', 'u9'], 'discipline': ['u9']}
    challenge_reason = {
        'chart': 'You said remembering plays is hardest, so the strategy units each get an extra review lesson.',
        'speed': 'You want to keep up with the cards, so the counting units each get an extra speed review.',
        'betting': 'Bet sizing is your sticking point, so betting and bankroll get extra review.',
        'discipline': 'Discipline matters most to you, so Bankroll & Risk gets extra review.',
    }
    for u in challenge_map.get(a['challenge'], []): focus.add(u)
    if a['challenge'] in challenge_reason: reasons.append(challenge_reason[a['challenge']])
    start_i = UNIT_ORDER.index(start)
    focus = {u for u in focus if UNIT_ORDER.index(u) >= start_i and u in REVIEW_POOLS}

    # Pace.
    minutes = int(a['time'])
    lessons_per_day = {5: 1, 10: 2, 15: 3, 20: 4}[minutes]
    daily_xp = lessons_per_day * 15
    remaining = sum(len(UNIT_BY_ID[u]['lessons']) + (1 if u in focus else 0) for u in UNIT_ORDER[start_i:])
    days = math.ceil(remaining / lessons_per_day)
    finish = today + timedelta(days=days)
    reasons.append(f'At {minutes} minutes a day (about {lessons_per_day} lesson{"s" if lessons_per_day > 1 else ""}), you’ll finish the pro path in about {days} days.')

    # Goal milestone and game notes.
    milestone_unit = {'understand': 'u4', 'smarter': 'u4', 'count': 'u6', 'pro': 'u11'}[a['goal']]
    if UNIT_ORDER.index(milestone_unit) < start_i: milestone_unit = 'u11'
    milestone_text = {
        'u4': 'Your goal: perfect basic strategy. You’ll be playing better than almost everyone at the table.',
        'u6': 'Your goal: count a shoe and convert to a true count.',
        'u11': 'Your goal: pass the Pro Checkout and play with a real edge.',
    }[milestone_unit]
    notes = {}
    if a['game'] == 'pitch':
        notes['u6'] = 'In single- and double-deck games, estimate to the nearest half deck, or even closer. Each card matters more.'
        notes['u7'] = 'Pitch games are often beaten with smaller spreads, like 1–4, because the count swings faster.'
    if a['game'] == 'online':
        notes['u5'] = 'Most online blackjack reshuffles every hand, so counting won’t help there. Learn it for live games.'
        notes['u10'] = 'When you start playing live, these game-selection habits matter most.'
        reasons.append('Most online games reshuffle constantly, so your path notes where counting does and doesn’t apply.')
    if a['game'] == 'shoe':
        notes['u7'] = 'Shoe games usually need a bigger spread, such as 1–12, or back-counting.'
    for u in focus:
        notes.setdefault(u, 'This is one of your focus areas, so you’ll get an extra review lesson here.')

    style = a['style']
    level = LEVELS[{'u1': 0, 'u2': 1, 'u5': 2, 'u6': 3, 'u7': 4}[start]]
    goal_names = {'understand': 'Understand the Game', 'smarter': 'Play Smarter', 'count': 'Learn to Count', 'pro': 'Play with an Edge'}
    weeks = max(1, round(days / 7))
    headline = f'{UNIT_BY_ID[start]["title"]} to Pro in about {weeks} week{"s" if weeks != 1 else ""}'
    return {
        'version': 1,
        'level': level,
        'goal': a['goal'],
        'goalName': goal_names[a['goal']],
        'headline': headline,
        'startUnit': start,
        'testedOut': UNIT_ORDER[:start_i],
        'focus': sorted(focus, key=UNIT_ORDER.index),
        'milestone': {'unit': milestone_unit, 'text': milestone_text},
        'notes': notes,
        'style': style,
        'minutes': minutes,
        'lessonsPerDay': lessons_per_day,
        'dailyXp': daily_xp,
        'remainingLessons': remaining,
        'days': days,
        'finish': finish.isoformat(),
        'reasons': reasons,
    }


def lesson_order(plan):
    """All lesson ids in path order, including any focus-area review lessons."""
    out = []
    for u in UNITS:
        out += [l['id'] for l in u['lessons']]
        if u['id'] in plan.get('focus', []): out.append(u['id'] + '-review')
    return out


def path_units(plan):
    units = []
    for u in UNITS:
        lessons = [{'id': l['id'], 'title': l['title']} for l in u['lessons']]
        if u['id'] in plan.get('focus', []): lessons.append({'id': u['id'] + '-review', 'title': 'Focus review', 'review': True})
        units.append({'id': u['id'], 'title': u['title'], 'summary': u['summary'], 'color': u['color'], 'tool': u['tool'],
                      'note': plan.get('notes', {}).get(u['id']), 'lessons': lessons})
    return units


def find_lesson(lesson_id):
    for u in UNITS:
        if lesson_id == u['id'] + '-review' and u['id'] in REVIEW_POOLS:
            return u, {'id': lesson_id, 'title': u['title'] + ': Focus review', 'steps': REVIEW_POOLS[u['id']]}
        for l in u['lessons']:
            if l['id'] == lesson_id: return u, l
    return None, None


# ---------------------------------------------------------------------------
# Step generators
# ---------------------------------------------------------------------------

ACTIONS = {'H': 'Hit', 'S': 'Stand', 'D': 'Double', 'P': 'Split'}
TEN = [10, 11, 12, 13]


def _ten(rng): return rng.choice(TEN)


def _hard_cards(rng, t):
    """Two non-pair, ace-free cards totaling t (5–19)."""
    options = [(a, t - a) for a in range(2, 11) if 2 <= t - a <= 10 and a != t - a]
    a, b = rng.choice(options)
    return [_ten(rng) if a == 10 else a, _ten(rng) if b == 10 else b]


def _strategy_hand(rng, pool):
    if pool in ('any', 'hardsoft'):
        pool = rng.choice(['hard', 'soft'] + (['pair'] if pool == 'any' else []))
    if pool == 'stiff': cards = _hard_cards(rng, rng.randint(12, 17))
    elif pool == 'low': cards = _hard_cards(rng, rng.randint(8, 12))
    elif pool == 'hard': cards = _hard_cards(rng, rng.randint(8, 17))
    elif pool == 'softlow': cards = [1, rng.randint(2, 7)]
    elif pool == 'soft': cards = [1, rng.randint(2, 9)]
    else:
        r = rng.choice([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        cards = [r, r] if r != 10 else [_ten(rng), _ten(rng)]
    rng.shuffle(cards)
    return cards


def _hand_label(cards):
    t, soft = total(cards)
    if len(cards) == 2 and min(cards[0], 10) == min(cards[1], 10):
        n = 'A' if cards[0] == 1 else str(min(cards[0], 10))
        return f'a pair of {n}s' if n != 'A' else 'a pair of aces'
    return f'soft {t}' if soft else f'hard {t}'


def _up_label(up): return 'an ace' if up == 1 else ('a ' + str(min(up, 10)) if min(up, 10) != 8 else 'an 8')


def _strategy_step(rng, pool):
    cards = _strategy_hand(rng, pool)
    up = rng.randint(1, 13)
    act = basic(cards, up, h17=False, das=True, surrender=False)
    pair = len(cards) == 2 and min(cards[0], 10) == min(cards[1], 10)
    opts = ['H', 'S', 'D'] + (['P'] if pair else [])
    why = _strategy_reason(cards, up, act)
    return choice(f'You have {_hand_label(cards)} against {_up_label(up)}. What’s the play?', [ACTIONS[o] for o in opts], opts.index(act), why, cards=cards, dealer=up)


def _strategy_reason(cards, up, act):
    t, soft = total(cards)
    d = 11 if up == 1 else min(up, 10)
    up_s = 'ace' if d == 11 else str(d)
    pair = len(cards) == 2 and min(cards[0], 10) == min(cards[1], 10)
    if act == 'P': return f'Split this pair against a {up_s}.' if not (pair and min(cards[0], 10) in (1, 8)) else 'Always split aces and eights.'
    if pair and min(cards[0], 10) == 10: return 'Never split tens. 20 is a great hand.'
    if soft:
        return {'D': f'Soft {t} is a doubling hand against a {up_s}.', 'S': f'Soft {t} stands against a {up_s}.', 'H': f'Soft {t} can’t bust, so take a card against a {up_s}.'}[act]
    if act == 'D': return f'{t} is a strong start against a {up_s}, so double.'
    if t >= 17: return 'Always stand on hard 17 or more.'
    if act == 'S': return f'The dealer’s {up_s} is a bust card, so stand on {t} and let the dealer take the risk.'
    if 12 <= t <= 16: return f'Against a {up_s}, {t} is too weak to stand. Hit.'
    return f'You can’t bust with {t}, so hit.'


def _numeric_options(rng, answer, spread=(-2, -1, 1, 2)):
    picks = {answer}
    for delta in rng.sample(list(spread), len(spread)):
        if len(picks) == 4: break
        picks.add(answer + delta)
    opts = sorted(picks)
    return opts


def _signed(n): return f'+{n}' if n > 0 else ('0' if n == 0 else f'−{abs(n)}')


def _count_step(rng, n):
    cards = [rng.randint(1, 13) for _ in range(n)]
    rc = sum(hilo(c) for c in cards)
    opts = _numeric_options(rng, rc)
    tags = ' '.join(_signed(hilo(c)) for c in cards)
    return choice('What’s the running count?', [_signed(o) for o in opts], opts.index(rc), f'Tags: {tags} → {_signed(rc)}.', cards=cards)


def _tc_step(rng):
    decks = rng.choice([1, 1.5, 2, 2.5, 3, 4, 5])
    rc = rng.randint(-10, 16)
    tc = math.floor(rc / decks)
    opts = _numeric_options(rng, tc)
    d = f'{decks:g}'
    exact = rc / decks
    why = f'{_signed(rc)} ÷ {d} = {_signed(tc)}.' if exact == tc else f'{_signed(rc)} ÷ {d} = {_signed(round(exact, 2))}, rounded down to {_signed(tc)}.'
    return choice(f'Running count {_signed(rc)}, {d} deck{"s" if decks != 1 else ""} left. True count?', [_signed(o) for o in opts], opts.index(tc), why)


def _deviation_step(rng, hands=None):
    pool = [i for i in INDICES if not hands or i[0] in hands]
    hand, up, index, action = rng.choice(pool)
    cards = [10, hand - 10] if hand >= 12 else [4, hand - 4]
    if hand == 20: cards = [_ten(rng), _ten(rng)]
    elif cards[0] == 10: cards[0] = _ten(rng)
    dealer = up if up != 10 else _ten(rng)
    tc = rng.randint(index - 2, index + 3)
    act = deviation(cards, dealer, tc)
    pair = hand == 20
    opts = ['H', 'S', 'D'] + (['P'] if pair else [])
    name = 'ace' if up == 1 else str(up)
    if tc >= index: why = f'The index for {hand} vs {name} is {_signed(index)}. You’re at or above it, so {ACTIONS[act].lower()}.'
    else: why = f'The index for {hand} vs {name} is {_signed(index)}. You’re below it, so {ACTIONS[act].lower()}.'
    return choice(f'True count {_signed(tc)}. You have {_hand_label(cards)} against {_up_label(dealer)}. What’s the play?', [ACTIONS[o] for o in opts], opts.index(act), why, cards=cards, dealer=dealer)


def _total_step(rng, soft=False):
    if soft: cards = [1, rng.randint(2, 9)]
    else:
        cards = [rng.randint(2, 13), rng.randint(2, 13)]
        if rng.random() < .4: cards.append(rng.randint(2, 6))
        while total(cards)[0] > 21: cards = [rng.randint(2, 9), rng.randint(2, 9)]
    rng.shuffle(cards)
    t, is_soft = total(cards)
    correct = f'Soft {t}' if is_soft else str(t)
    if is_soft: opts = [f'Soft {t}', str(t - 10), f'Hard {t}']
    else: opts = [str(o) for o in _numeric_options(rng, t, (-1, 1, 10))[:3]]
    if correct not in opts: opts[0] = correct
    rng.shuffle(opts)
    why = 'The ace counts as 11 without busting, so it’s soft.' if is_soft else 'Face cards count as 10; add them up.'
    return choice('What’s this hand’s total?', opts, opts.index(correct), why, cards=cards)


def resolve_steps(steps, rng=None, style='mix'):
    rng = rng or random.SystemRandom()
    out = []
    for s in steps:
        if s['type'] == 'tool':
            reps = s['reps'] + (2 if style == 'quiz' and s['reps'] >= 4 else -1 if style == 'explain' and s['reps'] > 4 else 0)
            out.append({**s, 'reps': reps}); continue
        if s['type'] != 'gen':
            out.append(dict(s)); continue
        n = s['count'] + (1 if style == 'quiz' else -1 if style == 'explain' and s['count'] > 3 else 0)
        for _ in range(n):
            if s['kind'] == 'strategy': out.append(_strategy_step(rng, s.get('pool', 'any')))
            elif s['kind'] == 'count': out.append(_count_step(rng, s.get('cards', 5)))
            elif s['kind'] == 'truecount': out.append(_tc_step(rng))
            elif s['kind'] == 'deviation': out.append(_deviation_step(rng, s.get('hands')))
            elif s['kind'] == 'total': out.append(_total_step(rng, s.get('soft', False)))
    return out
