"""Independent 4–8 deck US peek blackjack engine. See docs/MATH.md."""
import math
import random


def total(cards):
    value = sum(min(c, 10) for c in cards)
    soft = 1 in cards and value + 10 <= 21
    return value + (10 if soft else 0), soft


def hilo(card):
    return 1 if 2 <= card <= 6 else -1 if card == 1 or card >= 10 else 0


def basic(cards, dealer, h17=False, das=True, surrender=False, split=True):
    """Total dependent strategy, 4–8 decks, doubles any two cards, US peek."""
    t, soft = total(cards)
    d = 11 if dealer == 1 else min(dealer, 10)
    pair = len(cards) == 2 and min(cards[0], 10) == min(cards[1], 10)
    if len(cards) == 2 and not soft and surrender:
        if (t == 16 and d >= 9 and not pair) or (t == 15 and (d == 10 or (h17 and d == 11))) or (h17 and t == 17 and d == 11) or (h17 and pair and cards[0] == 8 and d == 11):
            return 'R'
    if pair and split:
        c = min(cards[0], 10)
        if c in (1, 8): return 'P'
        if c in (2, 3) and 2 <= d <= 7 and (das or d >= 4): return 'P'
        if c == 4 and das and d in (5, 6): return 'P'
        if c == 6 and 2 <= d <= 6 and (das or d >= 3): return 'P'
        if c == 7 and 2 <= d <= 7: return 'P'
        if c == 9 and (2 <= d <= 6 or d in (8, 9)): return 'P'
    double = len(cards) == 2
    if soft:
        if t >= 20: return 'S'
        if t == 19: return 'D' if h17 and d == 6 and double else 'S'
        if t == 18:
            if (3 <= d <= 6 or (h17 and d == 2)) and double: return 'D'
            return 'S' if d <= 8 else 'H'
        if t == 17 and 3 <= d <= 6 and double: return 'D'
        if t in (15, 16) and 4 <= d <= 6 and double: return 'D'
        if t in (13, 14) and 5 <= d <= 6 and double: return 'D'
        return 'H'
    if t >= 17: return 'S'
    if t >= 13: return 'S' if d <= 6 else 'H'
    if t == 12: return 'S' if 4 <= d <= 6 else 'H'
    if t == 11 and double and (d <= 10 or h17): return 'D'
    if t == 10 and double and d <= 9: return 'D'
    if t == 9 and double and 3 <= d <= 6: return 'D'
    return 'H'


# Common Hi-Lo indices for six-deck S17, no surrender; not the reference's proprietary tiers.
INDICES = [(16,10,0,'S'),(15,10,4,'S'),(20,5,5,'P'),(20,6,4,'P'),(10,10,4,'D'),(12,3,2,'S'),(12,2,3,'S'),(11,1,1,'D'),(9,2,1,'D'),(10,1,4,'D'),(9,7,3,'D'),(16,9,5,'S'),(13,2,-1,'S'),(12,4,0,'S'),(12,5,-2,'S'),(12,6,-1,'S'),(13,3,-2,'S')]


def deviation(cards, dealer, tc, das=True, split=True):
    t, soft = total(cards)
    # An index for a hard total must not override a basic-strategy pair split.
    if basic(cards, dealer, das=das, split=split)=='P': return 'P'
    if not soft:
        for hand, up, index, action in INDICES:
            if hand == t and min(dealer, 10) == up and (action != 'P' or (split and len(cards) == 2 and all(c >= 10 for c in cards))):
                if action == 'D' and len(cards) != 2: break
                return action if tc >= index else ('H' if action == 'S' else basic(cards, dealer, das=das, split=split))
    return basic(cards, dealer, das=das, split=split)


def simulate(config):
    """Shoe-level Monte Carlo, correlated hands settled against a shared dealer."""
    rng = random.Random(int(config.get('seed', 42)))
    rounds = int(config.get('rounds', 100000))
    decks = int(config.get('decks', 6))
    pen = float(config.get('penetration', 75)) / 100
    h17 = bool(config.get('h17', False))
    das = bool(config.get('das', True))
    surrender = bool(config.get('surrender', False))
    rsa = bool(config.get('rsa', False))
    split_aces = bool(config.get('splitAces', True))
    max_hands = int(config.get('maxHands', 4))
    double_rule = str(config.get('doubleRule', 'any'))
    play_mode = str(config.get('playMode', 'basic'))
    payout = float(config.get('payout', 1.5))
    bankroll = float(config.get('bankroll', 10000))
    rph = float(config.get('rph', 100))
    unit = float(config.get('unit', 10))
    wong = int(config.get('wong', -20))
    spreads = config.get('spread', [{'count': -3, 'units': 1, 'hands': 1}, {'count': 1, 'units': 2, 'hands': 1}, {'count': 2, 'units': 4, 'hands': 1}, {'count': 3, 'units': 8, 'hands': 1}, {'count': 4, 'units': 12, 'hands': 1}])
    if not 1000 <= rounds <= 1000000 or decks not in (4,6,8) or not .25 <= pen <= .9 or not 0 < unit <= 100000 or not 0 < bankroll <= 1e9 or not 1 <= rph <= 1000 or payout not in (1.2,1.5) or not -20 <= wong <= 10:
        raise ValueError('Invalid simulation settings.')
    if max_hands not in (1,2,4) or double_rule not in ('any','10-11','9-11') or play_mode not in ('basic','deviations'):
        raise ValueError('Invalid play rules.')
    if play_mode=='deviations' and (h17 or surrender or decks!=6):
        raise ValueError('The implemented Hi-Lo indices require six decks, S17 and no surrender.')
    if not isinstance(spreads,list) or not 1 <= len(spreads) <= 20: raise ValueError('Supply 1–20 bet spread rows.')
    spreads = sorted(spreads, key=lambda s: int(s['count']))
    for s in spreads:
        if not -20 <= int(s['count']) <= 20 or not 0 < float(s['units']) <= 1000 or int(s['hands']) not in (1,2): raise ValueError('Invalid bet spread.')
    if len({int(s['count']) for s in spreads})!=len(spreads): raise ValueError('Bet spread thresholds must be unique.')
    shoe=[]; rc=0; reshuffles=0
    profits=[]; trajectory=[]; wagered=0; played=0; wins=0; losses=0; pushes=0
    cumulative=0; shoe_profit=0; shoe_rounds=0; blocks=[]
    def draw():
        nonlocal rc
        c=shoe.pop(); rc+=hilo(c); return c
    def settle_round(tc, wager, hands_count):
        nonlocal wagered, rc
        players=[[draw()] for _ in range(hands_count)]
        dealer=[draw()]
        for p in players: p.append(draw())
        # The hole card is removed from the shoe but not counted until revealed.
        hole=shoe.pop()
        dealer.append(hole)
        dealer_bj=total(dealer)[0]==21
        result=0.; hands=[]; split_counts=[1]*hands_count
        # Insurance is decided before the hole card is revealed.
        insurance_tc=math.floor(rc/max(.25,(len(shoe)+1)/52))
        if play_mode=='deviations' and dealer[0]==1 and insurance_tc>=3:
            insurance=wager/2*hands_count
            wagered+=insurance
            result+=insurance*2 if dealer_bj else -insurance
        for group,cards in enumerate(players):
            wagered+=wager
            natural=total(cards)[0]==21
            if dealer_bj:
                result+=0 if natural else -wager
            elif natural: result+=wager*payout
            else: hands.append({'cards':cards,'bet':wager,'split':False,'ace':False,'group':group})
        i=0
        while i<len(hands):
            hand=hands[i]; cards=hand['cards']
            while total(cards)[0]<21:
                can_split=split_counts[hand['group']]<max_hands and (split_aces or cards[0]!=1)
                action=basic(cards,dealer[0],h17,das,surrender and not hand['split'],can_split)
                if play_mode=='deviations' and action!='P':
                    live_tc=math.floor(rc/max(.25,(len(shoe)+1)/52))
                    indexed=deviation(cards,dealer[0],live_tc,das=das,split=can_split)
                    if indexed!='P' or can_split: action=indexed
                if action=='D' and double_rule!='any':
                    permitted=total(cards)[0] in ((10,11) if double_rule=='10-11' else (9,10,11))
                    if not permitted: action='S' if total(cards)[1] and total(cards)[0]>=18 else 'H'
                if hand['ace']:
                    action='P' if rsa and len(cards)==2 and cards==[1,1] and can_split else 'S'
                if action=='P':
                    c=cards.pop(); cards.append(draw())
                    hand['split']=True; hand['ace']=c==1
                    hands.append({'cards':[c,draw()],'bet':wager,'split':True,'ace':c==1,'group':hand['group']})
                    split_counts[hand['group']]+=1
                    wagered+=wager
                    continue
                if action=='D' and hand['split'] and not das:
                    action='S' if total(cards)[1] and total(cards)[0]>=18 else 'H'
                if action=='R': result-=hand['bet']/2; hand['done']=True; break
                if action=='S': break
                if action=='D': wagered+=hand['bet']; hand['bet']*=2; cards.append(draw()); break
                cards.append(draw())
            i+=1
        rc+=hilo(hole)
        if any(not h.get('done') and total(h['cards'])[0]<=21 for h in hands):
            while total(dealer)[0]<17 or (h17 and total(dealer)==(17,True)): dealer.append(draw())
        dt=total(dealer)[0]
        for hand in hands:
            if hand.get('done'): continue
            t=total(hand['cards'])[0]
            result+=-hand['bet'] if t>21 else hand['bet'] if dt>21 or t>dt else -hand['bet'] if t<dt else 0
        return result
    for round_no in range(rounds):
        if len(shoe)<max(52,52*decks*(1-pen)):
            if shoe_rounds: blocks.append((shoe_profit,shoe_rounds))
            shoe=[c for _ in range(decks) for c in range(1,14) for _ in range(4)]
            rng.shuffle(shoe);rc=0;reshuffles+=1;shoe_profit=0;shoe_rounds=0
        tc=math.floor(rc/max(.25,len(shoe)/52))
        spread=spreads[0]
        for s in spreads:
            if tc>=int(s['count']): spread=s
        if tc<wong:
            # Observe a complete flat-bet round; do not charge it to the player.
            before=wagered;settle_round(tc,unit,1);wagered=before;p=0
        else:
            p=settle_round(tc,unit*float(spread['units']),int(spread['hands']));played+=1
            wins+=p>0;losses+=p<0;pushes+=p==0
        profits.append(p);cumulative+=p;shoe_profit+=p;shoe_rounds+=1
        if round_no%max(1,rounds//200)==0: trajectory.append([round_no+1,cumulative])
    if shoe_rounds: blocks.append((shoe_profit,shoe_rounds))
    trajectory.append([rounds,cumulative])
    mean=cumulative/rounds
    variance=sum((p-mean)**2 for p in profits)/(rounds-1)
    # Cluster robust uncertainty using independent shuffled shoes.
    residual=sum((p-mean*n)**2 for p,n in blocks)
    se=math.sqrt(residual*len(blocks)/max(1,len(blocks)-1))/rounds
    ev=mean*rph; sd=math.sqrt(variance*rph)
    return {'rounds':rounds,'played':played,'wins':wins,'losses':losses,'pushes':pushes,'shoes':reshuffles,'profit':cumulative,'ev':ev,'sd':sd,'ci':[ev-1.96*se*rph,ev+1.96*se*rph],'risk':min(1,math.exp(-2*mean*bankroll/variance)) if mean>0 and variance else 1,'n0':variance/(mean*mean)/rph if mean>0 else None,'averageBet':wagered/max(1,played),'edge':cumulative/wagered if wagered else 0,'trajectory':trajectory,'seed':config.get('seed',42),'model':f'{play_mode}; Hi-Lo bet selection; US peek. Risk and N₀ are diffusion approximations.'}
