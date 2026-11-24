"""Practice tools on the server: session logging (with XP) and the server-graded Shoe Challenge."""
import json
import math
import random
import secrets
import time

from engine import hilo, deviation, basic, total

PRACTICE_TOOLS = ('strategy', 'count', 'decks', 'truecount', 'index')
SHOE = 6
ROUNDS = 12
HEARTS = 3
XP_CAP = 20


def ramp(tc, top=12):
    return max(1, min(top, tc - 1))


def round_half(x):
    return math.floor(x * 2 + .5) / 2


def new_game(rng=None):
    rng = rng or random.SystemRandom()
    shoe = [c for c in range(1, 14) for _ in range(4 * SHOE)]
    rng.shuffle(shoe)
    rounds, pos, rc = [], 0, 0
    for n in range(1, ROUNDS + 1):
        k = rng.randint(6, 10)
        cards = shoe[pos:pos + k]; pos += k
        rc += sum(hilo(c) for c in cards)
        tray = min(SHOE - .5, max(.5, round_half(pos / 52)))
        parts = ['rc']
        if n % 3 == 0: parts += ['decks', 'tc', 'bet']
        r = {'n': n, 'cards': cards, 'parts': parts, 'rc': rc, 'tray': tray}
        if n % 2 == 0:
            hand = [rng.randint(1, 13), rng.randint(1, 13)]
            while total(hand)[0] == 21: hand = [rng.randint(1, 13), rng.randint(1, 13)]
            r['hand'] = hand; r['dealer'] = rng.randint(1, 13); r['parts'] = parts + ['play']
        rounds.append(r)
    return {'v': 1, 'shoe': SHOE, 'rounds': rounds, 'round': 0, 'hearts': HEARTS, 'score': 0, 'streak': 0, 'best_streak': 0, 'log': []}


def public_round(state):
    r = state['rounds'][state['round']]
    out = {'n': r['n'], 'total': len(state['rounds']), 'cards': r['cards'], 'parts': r['parts'], 'shoe': state['shoe']}
    if 'decks' in r['parts']: out['tray'] = r['tray']
    if 'play' in r['parts']: out['hand'] = r['hand']; out['dealer'] = r['dealer']
    return out


def _num(v, kind=int):
    try:
        x = float(v)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(x): return None
    return int(x) if kind is int and x == int(x) else (x if kind is float else None)


def grade_round(state, answers):
    """Grade the current round. Later parts are graded from the player's own earlier answers,
    so one slip (a wrong count) isn't punished twice."""
    r = state['rounds'][state['round']]
    true_left = state['shoe'] - r['tray']
    results = []
    rc = _num(answers.get('rc'))
    results.append({'part': 'rc', 'ok': rc == r['rc'], 'correct': r['rc'], 'given': rc})
    tc_used = math.floor(r['rc'] / true_left)
    if 'decks' in r['parts']:
        d = _num(answers.get('decks'), float)
        results.append({'part': 'decks', 'ok': d == r['tray'], 'correct': r['tray'], 'given': d})
        base_rc = rc if rc is not None else r['rc']
        left = state['shoe'] - d if d is not None and .5 <= d <= state['shoe'] - .5 else true_left
        exp_tc = math.floor(base_rc / left)
        tc = _num(answers.get('tc'))
        results.append({'part': 'tc', 'ok': tc == exp_tc, 'correct': exp_tc, 'given': tc})
        tc_used = tc if tc is not None else exp_tc
        exp_bet = ramp(tc_used)
        bet = _num(answers.get('bet'))
        results.append({'part': 'bet', 'ok': bet == exp_bet, 'correct': exp_bet, 'given': bet})
    if 'play' in r['parts']:
        exp = deviation(r['hand'], r['dealer'], tc_used)
        play = str(answers.get('play', ''))
        results.append({'part': 'play', 'ok': play == exp, 'correct': exp, 'given': play or None, 'tc': tc_used})
    for res in results:
        if res['ok']:
            state['streak'] += 1; state['best_streak'] = max(state['best_streak'], state['streak'])
            state['score'] += 10 + min(10, 2 * (state['streak'] - 1))
        else:
            state['streak'] = 0; state['hearts'] -= 1
    state['hearts'] = max(0, state['hearts'])
    state['log'].append({'n': r['n'], 'results': results})
    state['round'] += 1
    done = state['hearts'] == 0 or state['round'] >= len(state['rounds'])
    return results, done


class PracticeRoutes:
    """Mixed into the request handler; uses self.c, self.user, self.data, send_json, require."""

    def practice_api(self, path, method, require, num, ApiError):
        c = self.c; uid = self.user['id']; d = self.data
        if path == '/api/practice/log' and method == 'POST':
            self.throttle('practice-log', 120)
            tool = str(d.get('tool', ''))
            require(tool in PRACTICE_TOOLS, 'Unknown practice tool.')
            q = int(num(d, 'questions', 1, 500)); ok = int(num(d, 'correct', 0, 500)); require(ok <= q, 'Invalid practice result.')
            streak = int(num(d, 'bestStreak', 0, 500)); secs = int(num(d, 'seconds', 0, 86400))
            day = self.client_day()
            c.execute('INSERT INTO practice_log(user_id,tool,questions,correct,best_streak,seconds,day,created) VALUES(?,?,?,?,?,?,?,?)', (uid, tool, q, ok, streak, secs, day, time.time()))
            xp = min(XP_CAP, ok)
            if xp: c.execute('INSERT INTO xp_log(user_id,day,xp,lesson_id,created) VALUES(?,?,?,?,?)', (uid, day, xp, 'practice:' + tool, time.time()))
            return self.send_json({'xp': xp, 'stats': self.practice_stats()})
        if path == '/api/practice/stats' and method == 'GET':
            return self.send_json(self.practice_stats())
        if path == '/api/challenge/start' and method == 'POST':
            self.throttle('challenge', 60)
            c.execute("DELETE FROM games WHERE user_id=? AND finished=0", (uid,))
            gid = secrets.token_hex(12); state = new_game()
            c.execute('INSERT INTO games(id,user_id,state,score,finished,created) VALUES(?,?,?,?,?,?)', (gid, uid, json.dumps(state), 0, 0, time.time()))
            return self.send_json({'id': gid, 'hearts': state['hearts'], 'score': 0, 'round': public_round(state)})
        if path == '/api/challenge/answer' and method == 'POST':
            row = c.execute('SELECT * FROM games WHERE id=? AND user_id=?', (str(d.get('id', '')), uid)).fetchone()
            require(row and not row['finished'], 'This challenge has ended. Start a new one.')
            require(time.time() - row['created'] < 7200, 'This challenge expired. Start a new one.')
            state = json.loads(row['state'])
            answers = d.get('answers'); require(isinstance(answers, dict), 'Send your answers.')
            prior = state['rounds'][state['round']]
            results, done = grade_round(state, answers)
            c.execute('UPDATE games SET state=?,score=?,finished=? WHERE id=?', (json.dumps(state), state['score'], int(done), row['id']))
            best = c.execute('SELECT MAX(score) FROM games WHERE user_id=? AND finished=1', (uid,)).fetchone()[0] or 0
            if done:
                xp = min(XP_CAP, state['score'] // 20)
                if xp: c.execute('INSERT INTO xp_log(user_id,day,xp,lesson_id,created) VALUES(?,?,?,?,?)', (uid, self.client_day(), xp, 'practice:challenge', time.time()))
            return self.send_json({'results': results, 'rc': prior['rc'], 'hearts': state['hearts'], 'score': state['score'], 'streak': state['streak'],
                                   'done': done, 'best': best, 'bestStreak': state['best_streak'],
                                   'round': None if done else public_round(state), 'xp': min(XP_CAP, state['score'] // 20) if done else 0})
        if path == '/api/challenge/leaderboard' and method == 'GET':
            rows = c.execute('SELECT users.username, MAX(games.score) best, COUNT(*) runs FROM games JOIN users ON users.id=games.user_id WHERE finished=1 GROUP BY games.user_id ORDER BY best DESC LIMIT 10').fetchall()
            return self.send_json({'players': [dict(r) for r in rows]})
        raise ApiError('Endpoint not found.', 404)

    def practice_stats(self):
        c = self.c; uid = self.user['id']
        tools = {r['tool']: dict(r) for r in c.execute('SELECT tool, COUNT(*) sessions, SUM(questions) questions, SUM(correct) correct, MAX(best_streak) best_streak FROM practice_log WHERE user_id=? GROUP BY tool', (uid,))}
        ch = c.execute('SELECT COUNT(*) runs, COALESCE(MAX(score),0) best FROM games WHERE user_id=? AND finished=1', (uid,)).fetchone()
        tools['challenge'] = {'tool': 'challenge', 'sessions': ch['runs'], 'best': ch['best']}
        return {'tools': tools}
