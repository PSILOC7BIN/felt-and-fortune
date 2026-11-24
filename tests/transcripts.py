"""Build lesson and practice transcripts the way the browser does, for tests."""
import math
from engine import basic, deviation, hilo, total
import practice_api


def item(kind, ok=True):
    """One valid result of `kind`, answered correctly (or not)."""
    if kind == 'strategy':
        cards, dealer = [10, 6], 10
        right = basic(cards, dealer)
        return {'kind': 'strategy', 'data': {'cards': cards, 'dealer': dealer, 'h17': False, 'surrender': False}, 'given': right if ok else ('S' if right != 'S' else 'H')}
    if kind == 'count':
        cards = [2, 5, 13, 1, 6, 9]; rc = sum(hilo(c) for c in cards)
        return {'kind': 'count', 'data': {'cards': cards, 'start': 0}, 'given': rc if ok else rc + 1}
    if kind == 'decks':
        return {'kind': 'decks', 'data': {'tray': 2.5, 'shoe': 6, 'ask': 'tray'}, 'given': 2.5 if ok else 3}
    if kind == 'truecount':
        return {'kind': 'truecount', 'data': {'rc': 9, 'decks': 2, 'timedOut': False}, 'given': 4 if ok else 5}
    if kind == 'index':
        tc = 1
        return {'kind': 'index', 'data': {'cards': [10, 6], 'dealer': 10, 'tc': tc}, 'given': deviation([10, 6], 10, tc) if ok else 'H'}
    if kind == 'bet':
        return {'kind': 'bet', 'data': {'tc': 5, 'max': 12}, 'given': practice_api.ramp(5) if ok else 9}
    if kind == 'play':
        return {'kind': 'play', 'data': {'cards': [10, 6], 'dealer': 10, 'tc': 0}, 'given': deviation([10, 6], 10, 0) if ok else 'H'}
    raise ValueError(kind)


def lesson_transcript(steps, ok=True):
    """A full first-try transcript for a lesson as served by GET /api/path/lesson/<id>."""
    out = []
    for s in steps:
        if s['type'] == 'choice':
            given = s['answer'] if ok else (s['answer'] + 1) % len(s['options'])
            out.append({'kind': 'choice', 'data': {'prompt': s['prompt'], 'options': s['options'], 'cards': s.get('cards')}, 'given': given})
        elif s['type'] == 'tool':
            for _ in range(s['reps']):
                if s['tool'] == 'scenario': out += [item(k, ok) for k in ('count', 'decks', 'truecount', 'bet', 'play')]
                else: out.append(item(s['tool'], ok))
    return out
