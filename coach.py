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
    # ---- Placement: five stages, easiest first. The test stops at the first stage you don't pass. ----
    {'id': 'p_total', 'kind': 'placement', 'stage': 1, 'prompt': 'What’s this hand’s total?', 'cards': [1, 6, 9], 'options': [
        ['16', '16'], ['26', '26'], ['s16', 'Soft 16'], ['unsure', 'Not sure']]},
    {'id': 'p_pay', 'kind': 'placement', 'stage': 1, 'prompt': 'You bet $20 and get a blackjack at a 3:2 table. How much do you win?', 'options': [
        ['20', '$20'], ['30', '$30'], ['40', '$40'], ['unsure', 'Not sure']]},
    {'id': 'p_dealer', 'kind': 'placement', 'stage': 1, 'prompt': 'The dealer has a hard 16. What must the dealer do?', 'cards': [10, 6], 'options': [
        ['hit', 'Hit'], ['stand', 'Stand'], ['choose', 'Whatever the dealer wants'], ['unsure', 'Not sure']]},
    {'id': 'quiz_hard', 'kind': 'placement', 'stage': 2, 'prompt': 'You have 16 and the dealer shows a 10. Six decks, no surrender. What’s the best play?',
     'cards': [10, 6], 'dealer': 10, 'options': [['hit', 'Hit'], ['stand', 'Stand'], ['double', 'Double'], ['unsure', 'Not sure']]},
    {'id': 'quiz_soft', 'kind': 'placement', 'stage': 2, 'prompt': 'You have A‑7 (soft 18) and the dealer shows a 9. What’s the best play?',
     'cards': [1, 7], 'dealer': 9, 'options': [['stand', 'Stand'], ['hit', 'Hit'], ['double', 'Double'], ['unsure', 'Not sure']]},
    {'id': 'p_eleven', 'kind': 'placement', 'stage': 2, 'prompt': 'You have 11 and the dealer shows a 6. What’s the best play?',
     'cards': [6, 5], 'dealer': 6, 'options': [['hit', 'Hit'], ['stand', 'Stand'], ['double', 'Double'], ['unsure', 'Not sure']]},
    {'id': 'p_eights', 'kind': 'placement', 'stage': 2, 'prompt': 'You have a pair of 8s and the dealer shows a 10. What’s the best play?',
     'cards': [8, 8], 'dealer': 10, 'options': [['hit', 'Hit'], ['stand', 'Stand'], ['split', 'Split'], ['unsure', 'Not sure']]},
    {'id': 'p_nines', 'kind': 'placement', 'stage': 3, 'prompt': 'You have a pair of 9s and the dealer shows a 7. What’s the best play?',
     'cards': [9, 9], 'dealer': 7, 'options': [['hit', 'Hit'], ['stand', 'Stand'], ['split', 'Split'], ['unsure', 'Not sure']]},
    {'id': 'p_soft15', 'kind': 'placement', 'stage': 3, 'prompt': 'You have A‑4 (soft 15) and the dealer shows a 5. What’s the best play?',
     'cards': [1, 4], 'dealer': 5, 'options': [['hit', 'Hit'], ['stand', 'Stand'], ['double', 'Double'], ['unsure', 'Not sure']]},
    {'id': 'p_65', 'kind': 'placement', 'stage': 3, 'prompt': 'A table pays 6:5 on blackjack instead of 3:2. About how much does that add to the house edge?', 'options': [
        ['0.1', '0.1%'], ['1.4', '1.4%'], ['5', '5%'], ['unsure', 'Not sure']]},
    {'id': 'p_insure', 'kind': 'placement', 'stage': 3, 'prompt': 'The dealer shows an ace. Should a basic-strategy player (not counting) take insurance?', 'options': [
        ['good', 'Only with a strong hand'], ['never', 'Never'], ['always', 'Always'], ['unsure', 'Not sure']]},
    {'id': 'quiz_count', 'kind': 'placement', 'stage': 4, 'prompt': 'Using Hi‑Lo, what’s the running count after these cards?',
     'cards': [2, 5, 13, 1, 6, 9], 'options': [['-1', '−1'], ['0', '0'], ['1', '+1'], ['3', '+3'], ['unsure', 'What’s Hi‑Lo?']]},
    {'id': 'quiz_tc', 'kind': 'placement', 'stage': 4, 'prompt': 'The running count is +9 with 3 decks left to play. What’s the true count?', 'options': [
        ['3', '+3'], ['6', '+6'], ['12', '+12'], ['unsure', 'Not sure']]},
    {'id': 'p_tray', 'kind': 'placement', 'stage': 4, 'prompt': 'Six-deck shoe. About 2½ decks are in the discard tray. How many decks are left to play?', 'options': [
        ['2.5', '2½'], ['3.5', '3½'], ['4', '4'], ['unsure', 'Not sure']]},
    {'id': 'p_tags', 'kind': 'placement', 'stage': 4, 'prompt': 'In Hi‑Lo, which cards count as +1?', 'options': [
        ['low', '2 through 6'], ['mid', '7 through 9'], ['high', 'Tens and aces'], ['unsure', 'Not sure']]},
    {'id': 'p_16v10', 'kind': 'placement', 'stage': 5, 'prompt': 'Hi‑Lo true count +1, shoe game, no surrender. You have 16 against a 10. What’s the index play?',
     'cards': [10, 6], 'dealer': 10, 'options': [['hit', 'Hit'], ['stand', 'Stand'], ['unsure', 'Not sure']]},
    {'id': 'p_ins_idx', 'kind': 'placement', 'stage': 5, 'prompt': 'At what Hi‑Lo true count does insurance become a good bet?', 'options': [
        ['1', '+1'], ['3', '+3'], ['6', '+6'], ['unsure', 'Not sure']]},
    {'id': 'p_kelly', 'kind': 'placement', 'stage': 5, 'prompt': 'Bankroll $10,000, edge 1%, variance about 1.3. A full-Kelly bet is closest to…', 'options': [
        ['8', '$8'], ['77', '$77'], ['770', '$770'], ['unsure', 'Not sure']]},
    {'id': 'p_ror', 'kind': 'placement', 'stage': 5, 'prompt': 'Your risk of ruin is 10%. You double your bankroll and keep the same bets. Risk of ruin becomes about…', 'options': [
        ['5', '5%'], ['1', '1%'], ['20', '20%'], ['unsure', 'Not sure']]},
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

PLACEMENT_ANSWERS = {'p_total': '16', 'p_pay': '30', 'p_dealer': 'hit', 'quiz_hard': 'hit', 'quiz_soft': 'hit', 'p_eleven': 'double', 'p_eights': 'split',
                     'p_nines': 'split', 'p_soft15': 'double', 'p_65': '1.4', 'p_insure': 'never',
                     'quiz_count': '1', 'quiz_tc': '3', 'p_tray': '3.5', 'p_tags': 'low',
                     'p_16v10': 'stand', 'p_ins_idx': '3', 'p_kelly': '77', 'p_ror': '1'}
STAGES = {1: 'Table basics', 2: 'Core strategy', 3: 'The full chart', 4: 'Card counting', 5: 'Advantage play'}
STAGE_SKILLS = {2: {'strategy'}, 3: {'strategy'}, 4: {'counting', 'truecount'}, 5: {'deviations', 'bankroll'}}


def stage_questions(stage): return [q for q in SURVEY if q.get('stage') == stage]


def stage_result(stage, answers):
    """(passed, correct, total). A stage passes with at most one miss and no 'Not sure'."""
    qs = stage_questions(stage)
    right = sum(1 for q in qs if str(answers.get(q['id'], '')) == PLACEMENT_ANSWERS[q['id']])
    unsure = any(str(answers.get(q['id'], '')) in ('unsure', 'skip', '') for q in qs)
    return (right >= len(qs) - 1 and not unsure), right, len(qs)


def placement(answers):
    """Level 0–5: the number of stages passed in a row, plus the ids of missed questions in passed stages."""
    level, missed = 0, []
    for st in sorted(STAGES):
        ok, _, _ = stage_result(st, answers)
        if not ok: break
        level = st
        missed += [q['id'] for q in stage_questions(st) if str(answers.get(q['id'])) != PLACEMENT_ANSWERS[q['id']]]
    return level, missed


def public_survey():
    """The survey without placement answers."""
    return [{k: v for k, v in q.items()} for q in SURVEY]


def validate_answers(answers):
    if not isinstance(answers, dict):
        raise ValueError('Survey answers must be an object.')
    clean = {}
    for q in SURVEY:
        value = str(answers.get(q['id'], ''))
        if q.get('kind') == 'placement' and value in ('', 'skip'): value = 'skip'   # the test stopped before this stage
        elif value not in {o[0] for o in q['options']}:
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
            teach('Count a real table', 'In a casino you see a whole round: every player’s cards, their hits, and the dealer’s hand. The hole card counts only once the dealer turns it over.'),
            tool('count', 3, table=True, seats=3, speed=850),
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
            tool('count', 2, table=True, seats=5, speed=650),
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

LIBRARY = {l['id']: l for u in UNITS for l in u['lessons']}  # the original lessons, reused by the tracks

import tracks as _tracks
import tracks_expert as _expert
TRACK_META = {**_tracks.TRACK_META, 'expert': _expert.EXPERT_META}
TRACK_ORDER = _tracks.TRACK_ORDER + ['expert']
_H = {'teach': teach, 'choice': choice, 'gen': gen, 'tool': tool, 'chart': chart, 'lib': lambda i: LIBRARY[i], 'EASY_TC': EASY_TC, 'HARD_TC': HARD_TC}
TRACKS = _tracks.build(_H)
TRACKS['expert'] = _expert.build(_H)
UNITS = [u for t in TRACK_ORDER for u in TRACKS[t]]          # every unit in every track
UNIT_BY_ID = {u['id']: u for u in UNITS}
TRACK_OF_UNIT = {u['id']: t for t in TRACK_ORDER for u in TRACKS[t]}

# Review lessons for focus areas, by the unit's skill.
REVIEW_POOLS = {
    'strategy': [tool('strategy', 14, pool='any')],
    'counting': [tool('count', 3, cards=10, speed=800), tool('count', 2, table=True, seats=3, speed=800)],
    'truecount': [tool('decks', 4, shoe=6), tool('truecount', 10, **HARD_TC)],
    'betting': [tool('bet', 10, max=12), choice('Back-counting means…', ['Counting without playing until the count is good', 'Counting backwards', 'Playing two hands'], 0, 'You watch, then join when the count favors you.')],
    'deviations': [tool('index', 14, insurance=True)],
    'bankroll': [choice('Which lowers risk of ruin?', ['A bigger bankroll', 'Bigger bets', 'Playing tired'], 0, 'More bankroll per unit lowers the chance of going broke.'),
                 choice('Edge 1.5%, average bet $50, 80 hands an hour. EV per hour?', ['$6', '$60', '$600'], 1, '0.015 × $50 × 80 = $60.'),
                 choice('Your risk of ruin is 20%. You double your bankroll at the same bets. New risk?', ['10%', 'About 4%', '40%'], 1, '0.2 squared is 0.04.')],
}

# ---------------------------------------------------------------------------
# Planner: choose a track, place the learner in it, and explain every decision.
# ---------------------------------------------------------------------------

LEVELS = ['Rookie', 'Player', 'Strategist', 'Sharp Strategist', 'Counter', 'Advantage Player']


def placed_units(level):
    """Units a learner already knows at this placement level. They stay open for review but aren't required."""
    S, ST, C, P = ([u['id'] for u in TRACKS[t]] for t in TRACK_ORDER[:4])
    out = []
    if level >= 1: out += ['sm1']
    if level >= 2: out += ['sm2', 'sm3', 'sm9']
    if level >= 3: out += [u for u in S if u not in out] + ST + ['cc1']
    if level >= 4: out += ['cc2', 'cc3', 'cc9', 'ap1']
    if level >= 5: out += [u for u in C if u not in out]
    return out


GOAL_PATH = {'understand': 'smart', 'smarter': 'strategy', 'count': 'counter', 'pro': 'pro'}
PHASE = {'smart': 'Foundations', 'strategy': 'Perfect strategy', 'counter': 'Card counting', 'pro': 'Advantage play', 'expert': 'Expert lab'}


def path_order(goal):
    """Every learner covers every unit they don't already know. The goal changes the order: what you care about
    comes sooner, and prerequisites always come first (strategy before counting, counting before advantage play)."""
    S, ST, C, P = ([u['id'] for u in TRACKS[t]] for t in TRACK_ORDER[:4])
    X = [u['id'] for t in TRACK_ORDER[4:] for u in TRACKS[t]]
    core_s, rest_s = S[:3], S[3:]          # rules + simple strategy first, then money, myths, casino skills
    core_st, rest_st = ST[:4], ST[4:]      # hard, soft, pairs, surrender/insurance first, then rule sets and drills
    if goal == 'understand': return S + ST + C + P + X
    if goal == 'smarter': return core_s + ST + rest_s + C + P + X
    if goal == 'count': return core_s + core_st + C + rest_st + rest_s + P + X
    return core_s + core_st + C + P + X + rest_st + rest_s       # 'pro'


def choose_track(a):
    """The path's name and why it's ordered the way it is. Returns (path key, reason)."""
    key = GOAL_PATH[a['goal']]
    why = {
        'understand': 'You want to understand the game, so your path puts the rules, the strategy, and the money side first, then builds to counting and advantage play.',
        'smarter': 'You want to play smarter, so your path gets you to perfect basic strategy quickly, then covers money, casino skills, counting, and advantage play.',
        'count': 'You want to learn to count, so your path goes to counting as soon as your strategy is solid. The remaining strategy and casino lessons come after.',
        'pro': 'You want a real edge, so your path runs through counting, advantage play, and the expert lab first. Rule-set drills and casino lessons come last.',
    }[a['goal']]
    return key, why


def build_plan(answers, today=None, track=None):
    a = validate_answers(answers)
    today = today or date.today()
    level, missed = placement(a)
    key, why = choose_track(a)
    placed = placed_units(level)
    order = path_order(a['goal'])
    todo = [UNIT_BY_ID[u] for u in order if u not in placed]
    first = todo[0]
    reasons = [why]
    if placed:
        reasons.append(f'Your placement check showed you already know {STAGES[level].lower() if level < 5 else "everything up to advantage play"}'
                       f'{"" if level == 5 else " and everything before it"}, so you skip {len(placed)} units of material you know. '
                       f'Your path starts at {first["title"]}, which is your Unit 1. The units you skipped stay open if you want a refresher.')
    else:
        reasons.append('Your path starts at the very beginning, with how a hand plays out. Everything builds from there.')
    reasons.append(f'You have {len(todo)} units and {sum(len(u["lessons"]) for u in todo)} lessons ahead, all the way to expert-level play.')

    # Focus areas: an extra review lesson in the first remaining unit that trains each skill you missed or find hardest.
    weak = set()
    for qid in missed:
        st = next(q['stage'] for q in SURVEY if q['id'] == qid); weak |= STAGE_SKILLS.get(st, set())
    for nxt in (level + 1, level + 2): weak |= STAGE_SKILLS.get(nxt, set())   # the areas you're about to reach
    weak |= {'chart': {'strategy'}, 'speed': {'counting', 'truecount'}, 'betting': {'betting', 'bankroll'}, 'discipline': {'bankroll'}}.get(a['challenge'], set())
    focus = []
    for skill in sorted(weak):
        u = next((u for u in todo if u['skill'] == skill), None)
        if u and skill in REVIEW_POOLS and u['id'] not in focus: focus.append(u['id'])
    if focus:
        reasons.append('From your answers and the skill you find hardest, these units get an extra review lesson: ' + ', '.join(UNIT_BY_ID[f]['title'] for f in focus) + '.')

    minutes = int(a['time']); per = {5: 1, 10: 2, 15: 3, 20: 4}[minutes]
    remaining = sum(len(u['lessons']) + (u['id'] in focus) for u in todo)
    days = math.ceil(remaining / per)
    reasons.append(f'At {minutes} minutes a day (about {per} lesson{"s" if per > 1 else ""}), that takes about {days} days. Each unit ends with a checkpoint that opens once your skill rating is high enough.')

    notes = {}
    first_of = lambda skill: next((u['id'] for u in todo if u['skill'] == skill), None)
    if a['game'] == 'pitch' and first_of('betting'): notes[first_of('betting')] = 'Pitch games are often beaten with smaller spreads, like 1–4 or 1–8, because the count swings faster.'
    if a['game'] == 'shoe' and first_of('betting'): notes[first_of('betting')] = 'Shoe games usually need a bigger spread, such as 1–12, or back-counting.'
    if a['game'] == 'online' and first_of('counting'): notes[first_of('counting')] = 'Most online blackjack reshuffles every hand, so counting won’t help there. Learn it for live games.'
    for f in focus: notes.setdefault(f, 'This is one of your focus areas, so you’ll get an extra review lesson here.')

    meta = TRACK_META[key]; months = max(1, round(days / 30))
    goal_names = {'understand': 'Understand the Game', 'smarter': 'Play Smarter', 'count': 'Learn to Count', 'pro': 'Play with an Edge'}
    return {
        'version': 4, 'track': key, 'trackName': meta['title'], 'tagline': meta['tagline'], 'nextTrack': None, 'order': order,
        'level': LEVELS[level], 'levelIndex': level, 'goal': a['goal'], 'goalName': goal_names[a['goal']],
        'headline': f'You start at {first["title"]}: about {months} month{"s" if months != 1 else ""} of lessons ahead',
        'startUnit': first['id'], 'startTitle': first['title'], 'testedOut': placed, 'placed': placed, 'focus': focus,
        'stages': {str(st): stage_result(st, a)[1:] for st in STAGES},
        'milestone': {'unit': order[-1], 'text': 'Finish every unit and you’ll know blackjack inside out, up to expert-level advantage play.'},
        'notes': notes, 'style': a['style'], 'minutes': minutes, 'lessonsPerDay': per, 'dailyXp': per * 15,
        'remainingLessons': remaining, 'days': days, 'finish': (today + timedelta(days=days)).isoformat(), 'reasons': reasons,
    }


def plan_units(plan):
    return [UNIT_BY_ID[u] for u in plan['order']] if plan.get('order') else TRACKS[plan['track']]


# ---------------------------------------------------------------------------
# Pro content and unit checkpoints
# ---------------------------------------------------------------------------

# Free: all of Smart Player and Strategy Master, the first unit of Card Counter and Advantage Pro,
# and whichever unit a learner's own path starts at (so advanced learners also get a free taste at their level).
PRO_TRACKS = ('counter', 'pro', 'expert')
PRO_UNITS = {u['id'] for t in PRO_TRACKS if t in TRACKS for u in TRACKS[t][(0 if t == 'expert' else 1):]}
CHECKPOINT_PASS = 90          # accuracy needed on a checkpoint attempt

TRACK_BASE = {'smart': 1100, 'strategy': 1150, 'counter': 1200, 'pro': 1250, 'expert': 1300}
SKILL_TOOL = {'strategy-hard': '/practice/strategy', 'strategy-soft': '/practice/strategy', 'strategy-pair': '/practice/strategy',
              'count': '/practice/count', 'decks': '/practice/decks', 'truecount': '/practice/truecount', 'index': '/practice/index',
              'insurance': '/practice/index', 'bet': '/practice/bet'}


def _gate_skills(u, track):
    if u.get('gate'): return list(u['gate'])
    sk, title = u['skill'], u['title'].lower()
    early = track in ('smart', 'strategy')
    if sk == 'strategy':
        if 'soft' in title: return ['strategy-soft']
        if 'pair' in title: return ['strategy-pair']
        return ['strategy-hard'] if early or 'refresher' not in title else ['strategy-hard', 'strategy-soft', 'strategy-pair']
    if sk == 'counting': return ['count'] if track == 'counter' else ['count', 'truecount']
    if sk == 'truecount': return ['truecount', 'decks']
    if sk == 'betting': return ['bet']
    if sk == 'deviations': return ['index', 'insurance'] if 'insurance' in title else ['index']
    if sk == 'checkout':
        return {'smart': ['strategy-hard', 'strategy-soft'], 'strategy': ['strategy-hard', 'strategy-soft', 'strategy-pair'],
                'counter': ['count', 'truecount', 'index', 'bet'], 'pro': ['truecount', 'index', 'bet']}.get(track, ['truecount', 'index'])
    return ['strategy-hard'] if early else ['truecount']


def _gate(u, track, pos):
    target = TRACK_BASE.get(track, 1300) + min(100, 15 * pos) + (50 if u['skill'] == 'checkout' else 0)
    return [(sk, target) for sk in _gate_skills(u, track)]


GATES = {u['id']: _gate(u, t, i) for t in TRACKS for i, u in enumerate(TRACKS[t])}


def _drills(u, track):
    """Harder than the lessons: more reps, mixed house rules, faster cards, and timers."""
    sk, title = u['skill'], u['title'].lower()
    early = track == 'smart'
    if sk == 'strategy':
        pool = 'soft' if 'soft' in title else 'pair' if 'pair' in title else 'hard' if 'hard' in title else 'any'
        if early: return [tool('strategy', 16, pool=pool)]
        return [tool('strategy', 14, pool=pool), tool('strategy', 8, pool='any', h17=True, surrender=True)]
    if sk == 'counting': return [tool('count', 3, cards=14, speed=550), tool('count', 2, table=True, seats=5, speed=650)]
    if sk == 'truecount': return [tool('decks', 4, shoe=6, ask='remaining'), tool('truecount', 12, timer=6, **HARD_TC)]
    if sk == 'betting': return [tool('bet', 12, max=12), tool('truecount', 6, timer=6, **HARD_TC)]
    if sk == 'deviations': return [tool('index', 18, insurance=True)]
    if sk == 'checkout':
        if track in ('smart', 'strategy'): return [tool('strategy', 20, pool='any', surrender=track == 'strategy')]
        return [tool('count', 2, table=True, seats=5, speed=600), tool('truecount', 8, timer=6, **HARD_TC), tool('index', 10, insurance=True), tool('bet', 6, max=12)]
    if early or track == 'strategy': return [tool('strategy', 12, pool='any')]
    return [tool('truecount', 8, timer=6, **HARD_TC), tool('index', 8, insurance=True)]


def checkpoint(u, track='smart'):
    """End-of-unit mastery check: the unit's concept questions plus drills that are harder than the lessons."""
    choices = [st for l in u['lessons'] for st in l['steps'] if st['type'] == 'choice']
    steps = [teach('Checkpoint', f'Show you’ve mastered {u["title"]}. Score {CHECKPOINT_PASS}% or better to unlock the next unit. '
                   'It’s harder than the lessons: questions from the whole unit, faster drills, and mixed house rules.')]
    steps += choices[-8:] + _drills(u, track)
    return {'id': u['id'] + '-checkpoint', 'title': u['title'] + ': Checkpoint', 'steps': steps, 'checkpoint': True}


CHECKPOINTS = {u['id'] + '-checkpoint': checkpoint(u, TRACK_OF_UNIT[u['id']]) for u in UNITS}


def lesson_order(plan):
    """All lesson ids on the plan's path, in order, including focus-area reviews and unit checkpoints."""
    out = []
    for u in plan_units(plan):
        out += [l['id'] for l in u['lessons']]
        if u['id'] in plan.get('focus', []): out.append(u['id'] + '-review')
        out.append(u['id'] + '-checkpoint')
    return out


def path_units(plan):
    units = []
    placed = set(plan.get('placed') or plan.get('testedOut') or [])
    first = next((u['id'] for u in plan_units(plan) if u['id'] not in placed), None)
    for u in plan_units(plan):
        lessons = [{'id': l['id'], 'title': l['title']} for l in u['lessons']]
        if u['id'] in plan.get('focus', []): lessons.append({'id': u['id'] + '-review', 'title': 'Focus review', 'review': True})
        lessons.append({'id': u['id'] + '-checkpoint', 'title': 'Checkpoint', 'checkpoint': True})
        units.append({'id': u['id'], 'title': u['title'], 'summary': u['summary'], 'color': u['color'], 'tool': u['tool'],
                      'note': plan.get('notes', {}).get(u['id']), 'pro': u['id'] in PRO_UNITS and u['id'] != first, 'placed': u['id'] in placed,
                      'gate': [{'skill': sk, 'target': t, 'tool': SKILL_TOOL.get(sk, '/practice')} for sk, t in GATES.get(u['id'], [])], 'phase': PHASE[TRACK_OF_UNIT[u['id']]], 'lessons': lessons})
    return units


def track_summaries():
    return [{'id': t, **TRACK_META[t], 'units': len(TRACKS[t]), 'lessons': sum(len(u['lessons']) for u in TRACKS[t]),
             'unitTitles': [u['title'] for u in TRACKS[t]]} for t in TRACK_ORDER]


def find_lesson(lesson_id):
    if lesson_id in CHECKPOINTS:
        return UNIT_BY_ID[lesson_id[:-len('-checkpoint')]], CHECKPOINTS[lesson_id]
    for u in UNITS:
        if lesson_id == u['id'] + '-review' and u['skill'] in REVIEW_POOLS:
            return u, {'id': lesson_id, 'title': u['title'] + ': Focus review', 'steps': REVIEW_POOLS[u['skill']]}
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


def expected_questions(steps, style='mix'):
    """How many original (first-try) questions a lesson asks, after learning-style scaling."""
    n = 0
    for s in resolve_steps(steps, style=style):
        if s['type'] == 'tool': n += s['reps'] * (5 if s['tool'] == 'scenario' else 1)
        elif s['type'] == 'choice': n += 1
    return n
