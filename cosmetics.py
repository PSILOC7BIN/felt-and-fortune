"""Cosmetic catalog: card backs, table mats, and coach (Ace) accessories, all bought with earned Stars.

Prices follow a four-step rarity ladder. Sets pay a one-time bonus when completed. Pro members get the
Pro Gold collection free; monthly event backs can only be earned through quests. Nothing is random.
"""
import datetime, random

RARITY = {'common': 150, 'rare': 400, 'epic': 900, 'legendary': 1800}
KIND_LABEL = {'back': 'Card back', 'felt': 'Table mat', 'coach': 'Coach style'}

# (id, kind, value, name, rarity, set, note)
_ITEMS = [
    # Card backs
    ('back-navy', 'back', 'navy', 'Navy Classic', 'common', None, 'Crisp casino blue.'),
    ('back-chevron', 'back', 'chevron', 'Chevron', 'common', None, 'Bold zigzag stripes.'),
    ('back-tartan', 'back', 'tartan', 'Highland Tartan', 'common', None, 'Warm plaid.'),
    ('back-neon', 'back', 'neon', 'Neon Card Back', 'rare', 'vegas', 'Purple-to-pink glow.'),
    ('back-aurora', 'back', 'aurora', 'Aurora', 'rare', None, 'Northern-lights teal.'),
    ('back-carbon', 'back', 'carbon', 'Carbon Fiber', 'rare', None, 'Sleek woven black.'),
    ('back-sakura', 'back', 'sakura', 'Sakura', 'rare', None, 'Cherry-blossom pink.'),
    ('back-artdeco', 'back', 'artdeco', 'Art Deco', 'epic', 'monte', 'Gold fans on black.'),
    ('back-galaxy', 'back', 'galaxy', 'Galaxy', 'epic', None, 'Stars in deep space.'),
    ('back-koi', 'back', 'koi', 'Koi Pond', 'epic', None, 'Gold koi on blue water.'),
    ('back-diamond', 'back', 'diamond', 'Diamond Card Back', 'legendary', 'highroller', 'Faceted silver.'),
    ('back-goldfoil', 'back', 'goldfoil', 'Gold Foil', 'legendary', None, 'Brushed gold with a crest.'),
    # Table mats
    ('felt-royal', 'felt', 'royal', 'Royal Blue', 'common', None, 'Classic tournament blue.'),
    ('felt-teal', 'felt', 'teal', 'Caribbean Teal', 'common', None, 'Bright island teal.'),
    ('felt-crimson', 'felt', 'crimson', 'Crimson', 'rare', None, 'Deep casino red.'),
    ('felt-velvet', 'felt', 'velvet', 'Purple Velvet', 'rare', None, 'Plush violet.'),
    ('felt-midnight', 'felt', 'midnight', 'Midnight', 'rare', None, 'Inky navy with silver print.'),
    ('felt-neon', 'felt', 'neon', 'Vegas Neon', 'epic', 'vegas', 'Black felt with glowing print.'),
    ('felt-monte', 'felt', 'monte', 'Monte Carlo', 'epic', 'monte', 'Burgundy with a gold rail.'),
    ('felt-gold', 'felt', 'gold', 'Gold Leaf', 'legendary', 'highroller', 'Gilded felt for high rollers.'),
    # Coach styles
    ('coach-bowtie', 'coach', 'bowtie', 'Bow Tie', 'common', None, 'Dressed for the casino.'),
    ('coach-visor', 'coach', 'visor', 'Dealer Visor', 'common', None, 'Old-school dealer shade.'),
    ('coach-headphones', 'coach', 'headphones', 'Headphones', 'common', None, 'Practice beats.'),
    ('coach-sunglasses', 'coach', 'sunglasses', 'Shades', 'rare', 'vegas', 'Too cool for the pit.'),
    ('coach-cowboy', 'coach', 'cowboy', 'Cowboy Hat', 'rare', None, 'Reno rodeo ready.'),
    ('coach-party', 'coach', 'party', 'Party Hat', 'rare', None, 'Celebrate every streak.'),
    ('coach-tophat', 'coach', 'tophat', 'Top Hat', 'epic', 'monte', 'Black tie, Monte Carlo style.'),
    ('coach-wizard', 'coach', 'wizard', 'Wizard Hat', 'epic', None, 'Counting is basically magic.'),
    ('coach-monocle', 'coach', 'monocle', 'Monocle', 'epic', None, 'Distinguished analysis.'),
    ('coach-crown', 'coach', 'crown', 'Crown', 'legendary', 'highroller', 'Royalty at the table.'),
]

# Pro Gold collection: free for Pro members.
_PRO = [
    ('back-pro', 'back', 'pro', 'Pro Gold Back', 'Black and gold monogram.'),
    ('felt-pro', 'felt', 'pro', 'Pro Gold Mat', 'Black felt with gold print.'),
    ('coach-pro', 'coach', 'pro', 'Pro Gold Chain', 'For members only.'),
]

SETS = {
    'vegas': {'name': 'Vegas Nights', 'bonus': 200},
    'monte': {'name': 'Monte Carlo', 'bonus': 400},
    'highroller': {'name': 'High Roller', 'bonus': 800},
}

CATALOG = {}
for _id, kind, value, name, rarity, set_id, note in _ITEMS:
    CATALOG[_id] = {'name': name, 'kind': kind, 'value': value, 'rarity': rarity, 'stars': RARITY[rarity], 'set': set_id, 'text': note}
for _id, kind, value, name, note in _PRO:
    CATALOG[_id] = {'name': name, 'kind': kind, 'value': value, 'rarity': 'legendary', 'stars': 0, 'pro': True, 'text': note}

# Monthly event backs (see quests.EVENTS): earn-only.
EVENT_BACKS = {
    'back-event-newyear': 'Midnight Countdown', 'back-event-hearts': 'Wild Hearts', 'back-event-clover': 'Lucky Clover',
    'back-event-spring': 'Spring Bloom', 'back-event-derby': 'Derby Silks', 'back-event-summer': 'Summer Sunset',
    'back-event-stripes': 'Stars and Stripes', 'back-event-neon': 'Neon Nights', 'back-event-school': 'Chalkboard',
    'back-event-haunted': 'Haunted Deck', 'back-event-harvest': 'Harvest Gold', 'back-event-winter': 'Winter Wonderdeck',
}
for _id, name in EVENT_BACKS.items():
    CATALOG[_id] = {'name': name, 'kind': 'back', 'value': _id[len('back-'):], 'rarity': 'epic', 'stars': None, 'event': True,
                    'text': 'Earned by finishing that month’s event.'}

DEFAULTS = {'felt': 'emerald', 'back': 'classic', 'coach': 'none'}


def featured(day):
    """Three buyable items, the same for everyone today. Rotates daily; no fake discounts."""
    pool = sorted(k for k, v in CATALOG.items() if v['stars'])
    rng = random.Random('featured:' + day)
    return rng.sample(pool, 3)


def set_progress(owned):
    out = []
    for sid, s in SETS.items():
        items = [k for k, v in CATALOG.items() if v.get('set') == sid]
        have = [k for k in items if k in owned]
        out.append({'id': sid, 'name': s['name'], 'bonus': s['bonus'], 'items': items, 'owned': len(have), 'total': len(items)})
    return out


def owns(owned, kind, value, pro):
    if value == DEFAULTS[kind]: return True
    for k, v in CATALOG.items():
        if v['kind'] == kind and v['value'] == value:
            return k in owned or (v.get('pro') and pro)
    return False
