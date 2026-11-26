"""Builds public/looks.css: illustrated card backs and table-mat prints as inline SVG.

Run: python scripts/build_looks.py
Every design is original artwork drawn from simple shapes. Card backs are 100×140 SVGs used as
`--back-bg`; mats get a repeating print (`--felt-tile`) and a center emblem (`--felt-mark`).
"""
import math
import random


def stars(n, w, h, seed, rmin=.4, rmax=1.2, col='#fff', op=None):
    rng = random.Random(seed)
    return ''.join(f'<circle cx="{rng.uniform(3, w - 3):.1f}" cy="{rng.uniform(3, h - 3):.1f}" r="{rng.uniform(rmin, rmax):.2f}" fill="{col}"' + (f' opacity="{rng.uniform(*op):.2f}"' if op else '') + '/>' for _ in range(n))
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'public' / 'looks.css'

# ---- motifs (centered on 0,0, about 16 units across) ----------------------------------------------
HEART = 'M0 5C-1-1-8-2-8 3c0 4 4 7 8 10c4-3 8-6 8-10c0-5-7-4-8 2z'
SPADE = 'M0-9C-4-4-8-1-8 3c0 4 4 5 7 2l-1.5 6h5L9 5c3 3 7 2 7-2C16-1 4-4 0-9z'
SPADE = 'M0-9C-4-4-8-1-8 3c0 4 4 5 7 2l-1.5 6h5l-1.5-6c3 3 7 2 7-2C8-1 4-4 0-9z'
DIAMOND = 'M0-9L6.5 0 0 9-6.5 0z'
CLUB = '<circle cx="0" cy="-4.5" r="4"/><circle cx="-4.5" cy="1.5" r="4"/><circle cx="4.5" cy="1.5" r="4"/><path d="M-1.2 1h2.4l1.5 7h-5.4z"/>'


def star(r=8, inner=.45, n=5, rot=-90):
    pts = []
    for i in range(n * 2):
        rr = r if i % 2 == 0 else r * inner
        a = math.radians(rot + i * 180 / n)
        pts.append(f'{rr * math.cos(a):.1f} {rr * math.sin(a):.1f}')
    return 'M' + 'L'.join(pts) + 'z'


STAR = star()
BAT = 'M-12 0q3-5 6-1q1-3 3-4l2 2 1-2 1 2 2-2q2 1 3 4q3-4 6 1q-4-1-5 3q-2-2-4-1q-2 2-3 3q-1-1-3-3q-2-1-4 1q-1-4-5-3z'
PUMPKIN = '<ellipse cx="-4" cy="2" rx="5" ry="6" fill="#F97316"/><ellipse cx="4" cy="2" rx="5" ry="6" fill="#F97316"/><ellipse cx="0" cy="2" rx="5" ry="6.5" fill="#FB923C"/><path d="M0-4q1-4 3-5" stroke="#15803D" stroke-width="2" fill="none"/>'
GHOST = 'M-6 8V-1a6 6 0 0 1 12 0v9l-2-2-2 2-2-2-2 2-2-2z'


def flower(petal='#F472B6', mid='#FDE047', r=4.2, n=5):
    return ''.join(f'<circle cx="{r * math.cos(math.radians(i * 360 / n - 90)):.1f}" cy="{r * math.sin(math.radians(i * 360 / n - 90)):.1f}" r="{r * .78:.1f}" fill="{petal}"/>' for i in range(n)) + f'<circle r="{r * .55:.1f}" fill="{mid}"/>'


def clover(col='#22C55E', leaves=4):
    out = ''.join(f'<path transform="rotate({i * 360 / leaves})" d="M0 0C-1-3-6-5-6-8.5c0-3 4-4 6-1 2-3 6-2 6 1C6-5 1-3 0 0z" fill="{col}"/>' for i in range(leaves))
    return out + f'<path d="M0 0q3 6 1 11" stroke="{col}" stroke-width="1.6" fill="none"/>'


def snowflake(col='#fff', r=8, w=1.3):
    arms = ''
    for i in range(6):
        arms += f'<g transform="rotate({i * 60})"><path d="M0 0V-{r}M0 -{r * .55:.1f}l-2.5-2.5M0 -{r * .55:.1f}l2.5-2.5" /></g>'
    return f'<g stroke="{col}" stroke-width="{w}" stroke-linecap="round" fill="none">{arms}</g>'


def burst(col, r=10, n=12, w=1.4):
    lines = ''.join(f'<path d="M{r * .35 * math.cos(math.radians(i * 360 / n)):.1f} {r * .35 * math.sin(math.radians(i * 360 / n)):.1f}L{r * math.cos(math.radians(i * 360 / n)):.1f} {r * math.sin(math.radians(i * 360 / n)):.1f}"/>' for i in range(n))
    dots = ''.join(f'<circle cx="{(r + 2) * math.cos(math.radians(i * 360 / n + 15)):.1f}" cy="{(r + 2) * math.sin(math.radians(i * 360 / n + 15)):.1f}" r="1"/>' for i in range(n))
    return f'<g stroke="{col}" stroke-width="{w}" stroke-linecap="round">{lines}</g><g fill="{col}">{dots}</g>'


def koi(body='#F97316', spot='#fff'):
    return (f'<path d="M-10 0C-6-6 6-6 9 0C6 6-6 6-10 0z" fill="{body}"/><path d="M-9 0l-6-5 2 5-2 5z" fill="{body}" opacity=".85"/>'
            f'<circle cx="2" cy="-1.5" r="2" fill="{spot}"/><circle cx="-3" cy="1.5" r="1.6" fill="{spot}"/><circle cx="6.5" cy="-1" r=".9" fill="#111"/>')


# ---- card frame ---------------------------------------------------------------------------------------
def card(bg, inner='', frame='#ffffff', frame_op=.75, defs='', double=False):
    f2 = f'<rect x="10" y="10" width="80" height="120" rx="6" fill="none" stroke="{frame}" stroke-opacity="{frame_op * .6}" stroke-width="1"/>' if double else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" preserveAspectRatio="none"><defs>{defs}</defs>'
            f'<rect width="100" height="140" fill="{bg}"/>{inner}'
            f'<rect x="6" y="6" width="88" height="128" rx="8" fill="none" stroke="{frame}" stroke-opacity="{frame_op}" stroke-width="1.6"/>{f2}</svg>')


def pat(pid, w, h, body, bg=None, rot=0):
    b = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return f'<pattern id="{pid}" width="{w}" height="{h}" patternUnits="userSpaceOnUse" patternTransform="rotate({rot})">{b}{body}</pattern>'


def lin(gid, stops, x2=0, y2=1):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<linearGradient id="{gid}" x1="0" y1="0" x2="{x2}" y2="{y2}">{s}</linearGradient>'


def rad(gid, stops, cx=.5, cy=.5, r=.7):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<radialGradient id="{gid}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>'


def medallion(inner, ring='#fff', fill='none', r=17, cy=70):
    return f'<circle cx="50" cy="{cy}" r="{r}" fill="{fill}" stroke="{ring}" stroke-width="1.6"/><circle cx="50" cy="{cy}" r="{r - 3}" fill="none" stroke="{ring}" stroke-opacity=".5" stroke-width=".8"/><g transform="translate(50 {cy})">{inner}</g>'


def corners(sym, col, s=.55):
    return ''.join(f'<g transform="translate({x} {y}) scale({s})" fill="{col}">{sym}</g>' for x, y in ((18, 20), (82, 20), (18, 120), (82, 120)))


P = lambda d, fill: f'<path d="{d}" fill="{fill}"/>'

BACKS = {}

BACKS['classic'] = card('#B91C1C', '<rect x="6" y="6" width="88" height="128" fill="url(#p)"/>' + medallion(f'<g transform="scale(1.2)">{P(SPADE, "#fff")}</g>', fill='#991B1B'),
                        defs=pat('p', 10, 10, '<path d="M5 0L10 5 5 10 0 5z" fill="none" stroke="#F87171" stroke-width=".9"/>', '#B91C1C'))
BACKS['navy'] = card('#1E3A8A', '<rect width="100" height="140" fill="url(#p)"/>' + medallion('<path d="M-9-10h18v8c0 8-9 13-9 13S-9 6-9-2z" fill="#fff"/><path d="M-4-5h8M-4-1h6M-4-5v10" stroke="#1E3A8A" stroke-width="2"/>', fill='#1E40AF'),
                     defs=pat('p', 8, 8, '<path d="M0 0L8 8M8 0L0 8" stroke="#3B5BC9" stroke-width=".8"/>', '#1E3A8A'))
BACKS['chevron'] = card('#0F766E', '<rect width="100" height="140" fill="url(#p)"/>' + medallion(f'<g transform="scale(1.1)">{P(DIAMOND, "#FDE68A")}</g>', ring='#FDE68A', fill='#115E59'), frame='#FDE68A',
                        defs=pat('p', 16, 12, '<path d="M0 9L8 3 16 9" stroke="#14B8A6" stroke-width="3.2" fill="none"/>', '#0F766E'))
BACKS['tartan'] = card('#991B1B', '<rect width="100" height="140" fill="url(#p)"/>' + medallion(clover('#FDE68A', 3), ring='#FDE68A', fill='#7F1D1D'), frame='#FDE68A',
                       defs=pat('p', 24, 24, '<rect width="24" height="24" fill="#991B1B"/><rect x="0" y="8" width="24" height="6" fill="#14532D" opacity=".7"/><rect x="8" y="0" width="6" height="24" fill="#14532D" opacity=".7"/><rect x="0" y="18" width="24" height="1.4" fill="#FACC15" opacity=".8"/><rect x="18" y="0" width="1.4" height="24" fill="#FACC15" opacity=".8"/><rect x="0" y="3" width="24" height="1" fill="#000" opacity=".35"/><rect x="3" y="0" width="1" height="24" fill="#000" opacity=".35"/>'))
BACKS['neon'] = card('#150A2E', '<rect width="100" height="140" fill="url(#p)"/>' + medallion(f'<g transform="scale(1.1)"><path d="{SPADE}" fill="none" stroke="#F0ABFC" stroke-width="1.6"/></g>', ring='#22D3EE'), frame='#EC4899', frame_op=.9, double=True,
                     defs=pat('p', 22, 22, f'<g transform="translate(6 6) scale(.4)"><path d="{HEART}" fill="none" stroke="#EC4899" stroke-width="2.4"/></g><g transform="translate(17 17) scale(.4)"><path d="{DIAMOND}" fill="none" stroke="#22D3EE" stroke-width="2.4"/></g>', '#150A2E'))
BACKS['aurora'] = card('url(#g)', ''.join(f'<path d="M0 {y}Q25 {y - 22} 50 {y}T100 {y}V{y + 12}Q75 {y - 6} 50 {y + 12}T0 {y + 12}z" fill="{c}" opacity=".45"/>' for y, c in ((40, '#5EEAD4'), (62, '#A78BFA'), (84, '#34D399')))
                       + ''.join(f'<circle cx="{x}" cy="{y}" r=".9" fill="#fff"/>' for x, y in ((14, 18), (30, 28), (70, 16), (86, 30), (60, 110), (22, 120), (80, 124), (45, 22))), defs=lin('g', ((0, '#0B3B4F'), (1, '#1E1B4B'))))
BACKS['carbon'] = card('#111827', '<rect width="100" height="140" fill="url(#p)"/>' + medallion(f'<g transform="scale(1.2)">{P(SPADE, "url(#c)")}</g>', ring='#9CA3AF', fill='#0B0F17'), frame='#9CA3AF',
                       defs=pat('p', 8, 8, '<rect width="4" height="4" fill="#1F2937"/><rect x="4" y="4" width="4" height="4" fill="#1F2937"/><rect x="4" width="4" height="4" fill="#374151"/><rect y="4" width="4" height="4" fill="#374151"/>', '#111827') + lin('c', ((0, '#F9FAFB'), (.5, '#9CA3AF'), (1, '#E5E7EB'))))
BACKS['sakura'] = card('#FDF2F8', '<path d="M-5 120Q30 95 45 60T105 20" stroke="#7C2D12" stroke-width="3" fill="none"/><path d="M30 92Q22 78 26 66M62 44Q72 40 80 46" stroke="#7C2D12" stroke-width="2" fill="none"/>'
                       + ''.join(f'<g transform="translate({x} {y}) scale({s})">{flower("#F9A8D4", "#BE185D")}</g>' for x, y, s in ((42, 64, 1.3), (26, 66, 1), (64, 40, 1.1), (80, 46, .9), (20, 100, .8), (54, 54, .7), (88, 22, .8), (72, 100, .6), (35, 30, .6))), frame='#F472B6')
BACKS['artdeco'] = card('#0A0A0A', '<rect width="100" height="140" fill="url(#p)"/>' + ''.join(f'<path d="M50 70L{50 + 40 * math.cos(math.radians(a)):.1f} {70 + 40 * math.sin(math.radians(a)):.1f}" stroke="#D4AF37" stroke-width=".7" opacity=".7"/>' for a in range(0, 360, 15))
                        + medallion(f'<g transform="scale(1.1)">{P(DIAMOND, "#D4AF37")}</g>', ring='#D4AF37', fill='#0A0A0A'), frame='#D4AF37', frame_op=1, double=True,
                        defs=pat('p', 20, 12, '<path d="M0 12A10 10 0 0 1 20 12M3 12A7 7 0 0 1 17 12M6 12A4 4 0 0 1 14 12" stroke="#D4AF37" stroke-width=".8" fill="none" opacity=".55"/>', '#0A0A0A'))
BACKS['galaxy'] = card('url(#g)', '<ellipse cx="50" cy="70" rx="44" ry="16" transform="rotate(-30 50 70)" fill="#C4B5FD" opacity=".18"/><ellipse cx="50" cy="70" rx="30" ry="8" transform="rotate(-30 50 70)" fill="#F0ABFC" opacity=".25"/>'
                       + '<circle cx="50" cy="70" r="7" fill="#FDE68A"/><circle cx="72" cy="36" r="8" fill="#60A5FA"/><ellipse cx="72" cy="36" rx="13" ry="3" fill="none" stroke="#BFDBFE" stroke-width="1.2" transform="rotate(-20 72 36)"/>'
                       + stars(40, 100, 140, 'galaxy'), defs=rad('g', ((0, '#6D28D9'), (1, '#0F0A2A'))))
BACKS['koi'] = card('url(#g)', ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="#BAE6FD" stroke-width=".8" opacity=".6"/>' for x, y, r in ((30, 40, 8), (30, 40, 13), (70, 100, 9), (70, 100, 15)))
                    + '<g transform="translate(36 52) rotate(30) scale(1.4)">' + koi() + '</g><g transform="translate(64 92) rotate(210) scale(1.4)">' + koi('#FDE68A', '#F97316') + '</g>'
                    + '<ellipse cx="74" cy="34" rx="10" ry="7" fill="#15803D"/><path d="M74 34L84 31 83 37z" fill="#0EA5E9"/><ellipse cx="24" cy="112" rx="8" ry="6" fill="#16A34A"/><g transform="translate(72 30) scale(.6)">' + flower('#FBCFE8', '#F472B6') + '</g>',
                    defs=lin('g', ((0, '#0EA5E9'), (1, '#1E3A8A'))))
BACKS['diamond'] = card('#94A3B8', ''.join(f'<path d="M{x} {y}l7 12h-14z" fill="{c}"/>' for i, (x, y, c) in enumerate((x, y, ['#E2E8F0', '#CBD5E1', '#F8FAFC', '#94A3B8'][(x // 7 + y // 12) % 4]) for x in range(0, 105, 7) for y in range(0, 140, 12)))
                        + '<g transform="translate(50 70)"><path d="M-16-6L-8-16H8L16-6 0 18z" fill="#E0F2FE" stroke="#fff" stroke-width="1.2"/><path d="M-16-6H16M-8-16L-4-6 0 18M8-16L4-6 0 18M-4-6L0-16 4-6" stroke="#7DD3FC" stroke-width=".8" fill="none"/></g>', frame='#fff', frame_op=1, double=True)
BACKS['goldfoil'] = card('url(#g)', '<g transform="translate(50 70)" fill="none" stroke="#7A5B12" stroke-width="1.4">' + ''.join(f'<path d="M{s * 14} 12Q{s * 20} 0 {s * 12}-14" /><path d="M{s * 16} 6l{s * 4}-2M{s * 17} -1l{s * 4}-3M{s * 15}-8l{s * 3}-4"/>' for s in (-1, 1)) + '</g>'
                         + '<g transform="translate(50 64)"><path d="M-11 4l-3-12 7 5 7-9 7 9 7-5-3 12z" fill="#7A5B12"/><circle cx="0" cy="-12" r="1.6" fill="#7A5B12"/></g><text x="50" y="88" text-anchor="middle" font-family="Georgia,serif" font-size="9" font-weight="700" fill="#7A5B12">F &amp; F</text>',
                         frame='#7A5B12', frame_op=.8, double=True, defs=lin('g', ((0, '#B8860B'), (.35, '#FFE08A'), (.55, '#C9971C'), (.75, '#FFF1B8'), (1, '#A87B10')), 1, 1))
BACKS['pro'] = card('#0B0B0F', '<rect width="100" height="140" fill="url(#p)"/><rect x="26" y="46" width="48" height="48" rx="6" fill="#0B0B0F" stroke="#D4AF37" stroke-width="1.4" transform="rotate(45 50 70)"/>'
                    '<text x="50" y="75" text-anchor="middle" font-family="Georgia,serif" font-size="15" font-weight="700" fill="#D4AF37">F&amp;F</text><text x="50" y="86" text-anchor="middle" font-family="ui-rounded,sans-serif" font-size="5" letter-spacing="2" fill="#D4AF37">PRO</text>',
                    frame='#D4AF37', frame_op=1, double=True, defs=pat('p', 10, 10, '<path d="M0 0L10 10M10 0L0 10" stroke="#D4AF37" stroke-width=".5" opacity=".45"/>', '#0B0B0F'))
# New buyable backs
BACKS['suits'] = card('#FFFBF0', '<rect width="100" height="140" fill="url(#p)"/>' + medallion('<path d="M-11 4l-3-12 7 5 7-9 7 9 7-5-3 12z" fill="#B91C1C"/>', ring='#1C1C1E', fill='#FFFBF0'), frame='#1C1C1E', frame_op=.8,
                      defs=pat('p', 24, 24, f'<g transform="translate(6 6) scale(.45)">{P(SPADE, "#1C1C1E")}</g><g transform="translate(18 6) scale(.45)">{P(HEART, "#DC2626")}</g><g transform="translate(6 18) scale(.45)">{P(DIAMOND, "#DC2626")}</g><g transform="translate(18 18) scale(.45)" fill="#1C1C1E">{CLUB}</g>', '#FFFBF0'))
BACKS['compass'] = card('#E9D5A1', '<path d="M8 40Q30 30 50 44T92 36M8 100Q40 90 60 104T92 96" stroke="#A16207" stroke-width=".8" fill="none" stroke-dasharray="2 2"/>'
                        + '<g transform="translate(50 70)"><circle r="22" fill="none" stroke="#78350F" stroke-width="1.2"/><circle r="18" fill="none" stroke="#78350F" stroke-width=".6"/>'
                        + ''.join(f'<path transform="rotate({a})" d="M0-26L4 0 0 4-4 0z" fill="{"#B91C1C" if a == 0 else "#78350F"}"/>' for a in (0, 90, 180, 270)) + ''.join(f'<path transform="rotate({a})" d="M0-16L2.5 0-2.5 0z" fill="#A16207"/>' for a in (45, 135, 225, 315))
                        + '<text y="-29" text-anchor="middle" font-size="6" font-family="Georgia,serif" fill="#78350F">N</text></g>', frame='#78350F', double=True)
BACKS['jolly'] = card('#111111', '<rect width="100" height="140" fill="url(#p)"/><g transform="translate(50 66)"><path d="M-22 22L22-22M-22-22L22 22" stroke="#F5F5F4" stroke-width="5" stroke-linecap="round"/>'
                      '<path d="M-12-2a12 12 0 1 1 24 0v6h-4v5h-16v-5h-4z" fill="#F5F5F4"/><circle cx="-5" cy="-1" r="3.4" fill="#111"/><circle cx="5" cy="-1" r="3.4" fill="#111"/><path d="M-1 5l1-3 1 3z" fill="#111"/><path d="M-5 9v3M0 9v3M5 9v3" stroke="#111" stroke-width="1"/></g>',
                      frame='#D6B26E', frame_op=1, double=True, defs=pat('p', 12, 12, '<path d="M0 6h12" stroke="#2A2A2A" stroke-width="2.5"/>', '#111111', 45))
BACKS['noir'] = card('#1C1C1E', ''.join(f'<path d="M-10 {y}L110 {y - 50}" stroke="#E5E5EA" stroke-width="5" opacity=".12"/>' for y in range(20, 200, 14))
                     + '<circle cx="66" cy="38" r="12" fill="#F5F5F4" opacity=".9"/><path d="M28 98Q50 88 72 98L68 102Q50 94 32 102z" fill="#000"/><path d="M36 98Q38 80 50 80T64 98z" fill="#000"/><path d="M38 92Q50 90 62 92" stroke="#3A3A3C" stroke-width="2"/>', frame='#AEAEB2')
BACKS['mosaic'] = card('#0F4C5C', '<rect width="100" height="140" fill="url(#p)"/>' + medallion(f'<path d="{star(11, .55, 8, -90)}" fill="#E9B949"/>', ring='#E9B949', fill='#0F4C5C'), frame='#E9B949', frame_op=.9, double=True,
                       defs=pat('p', 20, 20, f'<g transform="translate(10 10)"><path d="{star(9, .6, 8, -90)}" fill="#E9B949" opacity=".9"/><path d="{star(5, .6, 8, -90)}" fill="#0F4C5C"/></g><path d="M0 0l3 3M20 0l-3 3M0 20l3-3M20 20l-3-3" stroke="#5EEAD4" stroke-width="1.2"/>', '#0F4C5C'))
BACKS['phoenix'] = card('url(#g)', '<g transform="translate(50 74)">' + ''.join(f'<path transform="scale({s} 1) rotate({r})" d="M0 0C10-10 24-12 38-30C30-10 26-4 6 4z" fill="{c}" opacity=".95"/>' for s in (1, -1) for r, c in ((0, '#FDE047'), (14, '#FB923C'), (28, '#EF4444')))
                        + '<path d="M0 6C-4-6-2-18 0-26 2-18 4-6 0 6z" fill="#FFF7ED"/><path d="M-3 4L0 34 3 4z" fill="#FDE047"/><circle cx="0" cy="-24" r="3.5" fill="#FFF7ED"/></g>'
                        + ''.join(f'<path d="M{x} 140Q{x - 4} 126 {x} 118Q{x + 4} 126 {x} 140" fill="#FDE047" opacity=".6"/>' for x in range(8, 100, 12)), frame='#FDE047', defs=lin('g', ((0, '#7F1D1D'), (1, '#EA580C'))))
BACKS['circuit'] = card('#064E3B', '<rect width="100" height="140" fill="url(#p)"/><rect x="34" y="54" width="32" height="32" rx="3" fill="#111827" stroke="#FCD34D" stroke-width="1.2"/>'
                        + ''.join(f'<path d="M{34 + i * 6} 54v-5M{34 + i * 6} 86v5M34 {58 + i * 6}h-5M66 {58 + i * 6}h5" stroke="#FCD34D" stroke-width="1.2"/>' for i in range(1, 5))
                        + f'<g transform="translate(50 70) scale(.8)">{P(SPADE, "#34D399")}</g>', frame='#34D399',
                        defs=pat('p', 28, 28, '<path d="M0 6H10L16 12V28M28 20H20L14 14M6 28V18" stroke="#10B981" stroke-width="1.1" fill="none"/><circle cx="10" cy="6" r="1.6" fill="#FCD34D"/><circle cx="20" cy="20" r="1.6" fill="#FCD34D"/><circle cx="6" cy="18" r="1.6" fill="#FCD34D"/>', '#064E3B'))
BACKS['nebula'] = card('#0B0620', ''.join(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{c}" opacity=".35" transform="rotate({r} {x} {y})"/>' for x, y, rx, ry, c, r in ((40, 50, 40, 20, '#EC4899', -30), (60, 90, 44, 18, '#6366F1', 20), (50, 70, 22, 12, '#F0ABFC', 0), (30, 110, 26, 10, '#22D3EE', -10)))
                       + stars(46, 100, 140, 'nebula') + f'<g transform="translate(50 70)"><path d="{star(7, .25, 4)}" fill="#fff"/></g>', frame='#F0ABFC')
BACKS['peacock'] = card('#0E4D64', '<rect width="100" height="140" fill="url(#p)"/>' + medallion('<ellipse rx="9" ry="12" fill="#0EA5A4"/><ellipse rx="6" ry="8.5" fill="#1D4ED8"/><ellipse rx="3" ry="4.5" fill="#111827"/>', ring='#FBBF24', fill='#065F46'), frame='#FBBF24',
                        defs=pat('p', 18, 22, '<path d="M9 22V4" stroke="#14B8A6" stroke-width=".6"/><ellipse cx="9" cy="8" rx="6" ry="7.5" fill="#059669"/><ellipse cx="9" cy="8" rx="4" ry="5" fill="#0EA5A4"/><ellipse cx="9" cy="8.5" rx="2.4" ry="3" fill="#1D4ED8"/><ellipse cx="9" cy="9" rx="1.1" ry="1.5" fill="#111827"/>', '#0E4D64'))
BACKS['rose'] = card('#4C0519', ''.join(f'<path d="M{x} 0Q{x + 8} 35 {x} 70T{x} 140" stroke="#166534" stroke-width="1.4" fill="none"/>' for x in (14, 86))
                     + '<g transform="translate(50 68)"><circle r="16" fill="#BE123C"/>' + ''.join(f'<path transform="rotate({a})" d="M0 0C6-4 12-2 12 4" stroke="#881337" stroke-width="1.6" fill="none"/>' for a in range(0, 360, 60)) + '<circle r="5" fill="#9F1239"/>'
                     + '<path d="M-6 16Q-14 22-10 30Q-4 24-2 18M6 16Q14 22 10 30Q4 24 2 18" fill="#15803D"/></g>', frame='#FDA4AF', double=True)
# Event backs: rich scenes, holographic finish (see the CSS at the bottom).
BACKS['event-newyear'] = card('url(#g)', ''.join(f'<g transform="translate({x} {y}) scale({s})">{burst(c, 10, 12)}</g>' for x, y, s, c in ((26, 30, 1.2, '#FDE047'), (74, 26, 1, '#F472B6'), (78, 108, 1.1, '#22D3EE'), (22, 110, .9, '#A78BFA'), (52, 18, .6, '#fff')))
                               + '<g transform="translate(50 70)"><circle r="17" fill="#0B1022" stroke="#FDE047" stroke-width="2"/><path d="M0 0V-12M0 0L1-12" stroke="#FDE047" stroke-width="2" stroke-linecap="round"/>' + ''.join(f'<circle cx="{13 * math.cos(math.radians(a)):.1f}" cy="{13 * math.sin(math.radians(a)):.1f}" r=".9" fill="#FDE047"/>' for a in range(0, 360, 30)) + '</g>'
                               + '<text x="50" y="100" text-anchor="middle" font-family="ui-rounded,sans-serif" font-weight="800" font-size="8" fill="#FDE047">MIDNIGHT</text>', frame='#FDE047', frame_op=.9, double=True, defs=lin('g', ((0, '#1E1B4B'), (1, '#020617'))))
BACKS['event-hearts'] = card('url(#g)', '<rect width="100" height="140" fill="url(#p)"/><g transform="translate(50 70) scale(2.4)"><path d="' + HEART + '" fill="#E11D48" stroke="#fff" stroke-width=".6"/></g>'
                              '<path d="M18 96L82 44" stroke="#FDE68A" stroke-width="2"/><path d="M82 44l-7 1 2 2-1 3zM18 96l4-6M18 96l6-3M21 94l4-6M21 94l6-3" stroke="#FDE68A" stroke-width="1.6" fill="#FDE68A"/>', frame='#fff', frame_op=.9, double=True,
                              defs=lin('g', ((0, '#FB7185'), (1, '#9F1239'))) + pat('p', 18, 18, f'<g transform="translate(5 5) scale(.42)"><path d="{HEART}" fill="#FFE4E6" opacity=".55"/></g><g transform="translate(14 13) scale(.3)"><path d="{HEART}" fill="#FDA4AF" opacity=".7"/></g>'))
BACKS['event-clover'] = card('url(#g)', '<path d="M8 120A42 42 0 0 1 92 120" stroke="#EF4444" stroke-width="3" fill="none"/><path d="M12 120A38 38 0 0 1 88 120" stroke="#FACC15" stroke-width="3" fill="none"/><path d="M16 120A34 34 0 0 1 84 120" stroke="#22C55E" stroke-width="3" fill="none"/><path d="M20 120A30 30 0 0 1 80 120" stroke="#3B82F6" stroke-width="3" fill="none"/>'
                              + ''.join(f'<g transform="translate({x} {y}) scale({s}) rotate({r})">{clover("#86EFAC")}</g>' for x, y, s, r in ((20, 22, .8, -20), (80, 30, .7, 15), (24, 74, .6, 10), (78, 78, .65, -10)))
                              + f'<g transform="translate(50 52) scale(1.7)">{clover("#22C55E")}</g><path d="M38 112a12 12 0 1 1 24 0" stroke="#FACC15" stroke-width="5" fill="none" stroke-linecap="round"/>', frame='#FACC15', double=True, defs=lin('g', ((0, '#166534'), (1, '#052E16'))))
BACKS['event-spring'] = card('url(#g)', ''.join(f'<g transform="translate({x} {y}) scale({s})">{flower(p, m)}</g>' for x, y, s, p, m in ((22, 24, 1.1, '#F9A8D4', '#FDE047'), (78, 22, 1, '#C4B5FD', '#FDE047'), (20, 116, 1, '#FDBA74', '#fff'), (80, 118, 1.2, '#F9A8D4', '#FDE047'), (50, 70, 2.6, '#FB7185', '#FEF3C7'), (36, 98, .7, '#93C5FD', '#fff'), (66, 42, .7, '#86EFAC', '#fff')))
                              + '<g transform="translate(70 92)"><path d="M0 0C-8-10-14-2-8 4C-14 8-6 14 0 4C6 14 14 8 8 4C14-2 8-10 0 0z" fill="#A78BFA"/><path d="M0-4V8" stroke="#4C1D95" stroke-width="1.4"/></g>', frame='#fff', defs=lin('g', ((0, '#ECFCCB'), (1, '#FCE7F3'))))
BACKS['event-derby'] = card('#F5F5F4', '<rect width="100" height="140" fill="url(#p)"/><g transform="translate(50 70)"><path d="M-14 14A16 16 0 1 1 14 14" stroke="#A16207" stroke-width="7" fill="none" stroke-linecap="round"/>' + ''.join(f'<circle cx="{16 * math.cos(math.radians(a)):.1f}" cy="{16 * math.sin(math.radians(a)):.1f}" r="1.3" fill="#FEF3C7"/>' for a in range(150, 400, 40)) + '</g>'
                             + ''.join(f'<g transform="translate({x} {y})">{flower("#DC2626", "#7F1D1D", 3.4, 6)}</g>' for x, y in ((36, 102), (50, 106), (64, 102))), frame='#1E3A8A', frame_op=1, double=True,
                             defs=pat('p', 20, 20, '<path d="M10 0L20 10 10 20 0 10z" fill="#DC2626"/><path d="M0 0L10 0 0 10zM20 0V10L10 0zM0 20V10L10 20zM20 20H10L20 10z" fill="#1E3A8A"/>', '#FACC15'))
BACKS['event-summer'] = card('url(#g)', '<circle cx="50" cy="78" r="22" fill="#FDE047"/>' + ''.join(f'<rect x="0" y="{y}" width="100" height="2.4" fill="#F97316" opacity=".9"/>' for y in (82, 88, 94))
                              + '<path d="M0 98Q25 92 50 98T100 98V140H0z" fill="#0E7490"/><path d="M0 108Q25 102 50 108T100 108" stroke="#67E8F9" stroke-width="1.5" fill="none"/>'
                              + '<path d="M16 98Q18 70 12 50" stroke="#3F1D0B" stroke-width="3" fill="none"/>' + ''.join(f'<path transform="translate(12 50) rotate({a})" d="M0 0Q10-6 22 2Q10-1 0 0z" fill="#14532D"/>' for a in (-40, 0, 40, 160, 200))
                              + '<path d="M86 98Q84 76 90 60" stroke="#3F1D0B" stroke-width="2.5" fill="none"/>' + ''.join(f'<path transform="translate(90 60) rotate({a}) scale(.8)" d="M0 0Q10-6 22 2Q10-1 0 0z" fill="#14532D"/>' for a in (-60, -20, 140, 190)), frame='#fff', defs=lin('g', ((0, '#7C3AED'), (.5, '#EC4899'), (1, '#F97316'))))
BACKS['event-stripes'] = card('#fff', ''.join(f'<rect y="{y}" width="100" height="10" fill="#B91C1C"/>' for y in range(0, 140, 20)) + '<rect width="52" height="60" fill="#1E3A8A"/>'
                               + ''.join(f'<g transform="translate({x} {y}) scale(.42)"><path d="{STAR}" fill="#fff"/></g>' for x in (8, 20, 32, 44) for y in (8, 20, 32, 44, 54)) + f'<g transform="translate(74 104) scale(1.1)">{burst("#1E3A8A", 11, 14)}</g>', frame='#FDE047', frame_op=1, double=True)
BACKS['event-neon'] = card('url(#g)', '<circle cx="50" cy="62" r="24" fill="url(#s)"/>' + ''.join(f'<rect x="20" y="{62 + i * 5}" width="60" height="{1.4 + i * .4}" fill="#1A0B33"/>' for i in range(1, 5))
                            + '<path d="M0 86H100" stroke="#F0ABFC" stroke-width="1.6"/>' + ''.join(f'<path d="M50 86L{x} 140" stroke="#22D3EE" stroke-width=".9"/>' for x in range(-70, 180, 20)) + ''.join(f'<path d="M0 {y}H100" stroke="#22D3EE" stroke-width=".9"/>' for y in (92, 100, 112, 128)),
                            frame='#F0ABFC', frame_op=1, double=True, defs=lin('g', ((0, '#0B0620'), (1, '#2E1065'))) + lin('s', ((0, '#FDE047'), (1, '#EC4899'))))
BACKS['event-school'] = card('#1F3D2B', '<g fill="none" stroke="#F5F5F4" stroke-width="1.1" opacity=".85" font-family="ui-rounded,sans-serif">'
                              '<text x="14" y="28" font-size="9" fill="#F5F5F4" stroke="none">TC = RC ÷ D</text><text x="56" y="120" font-size="10" fill="#F5F5F4" stroke="none">A+</text><text x="14" y="124" font-size="7" fill="#F5F5F4" stroke="none">2-6 = +1</text>'
                              '<path d="M60 22l6 8 10-16"/><circle cx="80" cy="56" r="6"/><path d="M20 50h14M27 43v14"/></g>'
                              '<g transform="translate(50 72)"><path d="M0-8C-14-14-18 4-10 14-6 18-2 16 0 14 2 16 6 18 10 14 18 4 14-14 0-8z" fill="#DC2626"/><path d="M0-8Q2-16 6-18" stroke="#78350F" stroke-width="2" fill="none"/><path d="M2-12Q10-18 12-10Q6-8 2-12z" fill="#22C55E"/></g>', frame='#A16207', frame_op=1)
BACKS['event-haunted'] = card('url(#g)', '<circle cx="70" cy="34" r="16" fill="#FEF3C7"/><circle cx="64" cy="30" r="3" fill="#FDE68A"/>' + ''.join(f'<g transform="translate({x} {y}) scale({s})"><path d="{BAT}" fill="#0B0611"/></g>' for x, y, s in ((30, 30, 1.1), (50, 46, .8), (82, 60, .7), (22, 60, .6)))
                               + '<path d="M0 0Q14 4 18 18M0 0Q4 14 18 18M0 0L18 18M6 0Q6 10 0 12M14 4Q10 12 4 16" stroke="#C4B5FD" stroke-width=".6" fill="none" opacity=".8"/>'
                               + f'<g transform="translate(30 112) scale(1.6)">{PUMPKIN}</g><g transform="translate(66 114) scale(1.2)">{PUMPKIN}</g><g transform="translate(50 84) scale(1.4)"><path d="{GHOST}" fill="#F5F5F4" opacity=".92"/><circle cx="-2" cy="0" r="1" fill="#111"/><circle cx="2" cy="0" r="1" fill="#111"/></g>',
                               frame='#F97316', frame_op=1, double=True, defs=lin('g', ((0, '#3B0764'), (1, '#0B0611'))))
BACKS['event-harvest'] = card('url(#g)', ''.join(f'<g transform="translate({x} 132) rotate({r})"><path d="M0 0V-60" stroke="#A16207" stroke-width="1.2"/>' + ''.join(f'<ellipse cx="{(-1) ** k * 3}" cy="{-60 + k * 5}" rx="2.4" ry="4" fill="#EAB308" transform="rotate({(-1) ** k * 25} {(-1) ** k * 3} {-60 + k * 5})"/>' for k in range(7)) + '</g>' for x, r in ((22, -12), (34, -4), (66, 4), (78, 12)))
                               + f'<g transform="translate(50 66) scale(2.2)">{PUMPKIN}</g>' + ''.join(f'<path transform="translate({x} {y}) rotate({r})" d="M0 0C-6-4-6-12 0-16 6-12 6-4 0 0z" fill="{c}"/>' for x, y, r, c in ((18, 24, -30, '#DC2626'), (80, 30, 30, '#EA580C'), (60, 22, 10, '#CA8A04'))),
                               frame='#FEF3C7', double=True, defs=lin('g', ((0, '#B45309'), (1, '#451A03'))))
BACKS['event-winter'] = card('url(#g)', ''.join(f'<g transform="translate({x} {y}) scale({s})">{snowflake("#fff", 7, 1.2)}</g>' for x, y, s in ((20, 22, .9), (80, 26, 1), (14, 64, .6), (86, 70, .7), (30, 40, .5), (72, 46, .5)))
                              + '<g transform="translate(50 64)">' + snowflake('#fff', 18, 2.2) + '</g>' + ''.join(f'<path d="M{x} 128l-10 0 10-22 10 22z" fill="#14532D"/><path d="M{x} 108l-5 8h10z" fill="#fff" opacity=".85"/>' for x in (22, 78))
                              + '<path d="M0 124Q50 112 100 124V140H0z" fill="#F0F9FF"/>', frame='#fff', frame_op=.95, double=True, defs=lin('g', ((0, '#38BDF8'), (1, '#1E3A8A'))))

# ---- table mats: a repeating print and a center emblem --------------------------------------------
def tile(body, w=60, h=60):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>'


def mark(body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100">{body}</svg>'


MATS = {
    'emerald': (None, mark(f'<g opacity=".14" fill="#fff"><g transform="scale(2.4)"><path d="{SPADE}"/></g></g>')),
    'royal': (tile(f'<g opacity=".07" fill="#fff" transform="translate(30 30) scale(.8)"><path d="M-11 4l-3-12 7 5 7-9 7 9 7-5-3 12z"/></g>'), mark('<g opacity=".16" fill="none" stroke="#fff" stroke-width="2"><circle r="30"/><circle r="25"/></g><g opacity=".2" fill="#fff" transform="scale(2)"><path d="M-11 4l-3-12 7 5 7-9 7 9 7-5-3 12z"/></g>')),
    'teal': (tile('<path d="M0 30Q15 20 30 30T60 30" stroke="#fff" stroke-width="1.4" fill="none" opacity=".09"/>', 60, 30), mark(f'<g opacity=".16" transform="scale(2.6) rotate(-20)">{koi("#fff", "#14B8A6")}</g>')),
    'crimson': (tile('<path d="M15 0L30 15 15 30 0 15z" fill="none" stroke="#FDE68A" stroke-width=".8" opacity=".12"/>', 30, 30), mark(f'<g opacity=".18" fill="#FDE68A" transform="scale(2.4)"><path d="{DIAMOND}"/></g>')),
    'velvet': (tile('<circle cx="20" cy="20" r="10" fill="none" stroke="#fff" stroke-width=".8" opacity=".08"/><circle cx="20" cy="20" r="4" fill="#fff" opacity=".06"/>', 40, 40), mark(f'<g opacity=".16">{flower("#fff", "#fff", 10, 6)}</g>')),
    'midnight': (tile('<circle cx="10" cy="12" r=".9" fill="#fff" opacity=".35"/><circle cx="44" cy="30" r=".6" fill="#fff" opacity=".3"/><circle cx="26" cy="50" r=".7" fill="#C7D2FE" opacity=".35"/>', 60, 60), mark(f'<g opacity=".22" fill="#E0E7FF" transform="scale(2.2)"><path d="{star(12, .45)}"/></g>')),
    'neon': (tile('<path d="M0 0H40M0 0V40" stroke="#22D3EE" stroke-width=".7" opacity=".18"/>', 40, 40), mark('<circle r="30" fill="none" stroke="#F472B6" stroke-width="2.5" opacity=".55"/><circle r="36" fill="none" stroke="#22D3EE" stroke-width="1.2" opacity=".45"/>' + f'<g transform="scale(1.9)"><path d="{SPADE}" fill="none" stroke="#F472B6" stroke-width="1.2" opacity=".7"/></g>')),
    'monte': (tile('<path d="M0 20Q10 10 20 20T40 20" stroke="#D4AF37" stroke-width=".8" fill="none" opacity=".12"/>', 40, 40), mark('<g fill="none" stroke="#D4AF37" opacity=".45" stroke-width="1.4"><circle r="32"/><circle r="27" stroke-dasharray="2 3"/></g><text y="7" text-anchor="middle" font-family="Georgia,serif" font-size="20" font-weight="700" fill="#D4AF37" opacity=".5">MC</text>')),
    'gold': (tile('<path d="M0 0L20 20M20 0L0 20" stroke="#3B2A05" stroke-width=".6" opacity=".12"/>', 20, 20), mark('<g opacity=".3" fill="#3B2A05"><path d="M-11 -2l-3-12 7 5 7-9 7 9 7-5-3 12z" transform="scale(1.6)"/></g>' + ''.join(f'<path transform="scale({s} 1)" d="M10 24Q30 16 28-12" stroke="#3B2A05" stroke-width="2" fill="none" opacity=".3"/>' for s in (1, -1)))),
    'pro': (tile('<path d="M0 0L24 24M24 0L0 24" stroke="#D4AF37" stroke-width=".5" opacity=".14"/>', 24, 24), mark('<rect x="-26" y="-26" width="52" height="52" rx="6" transform="rotate(45)" fill="none" stroke="#D4AF37" stroke-width="1.6" opacity=".7"/><text y="8" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#D4AF37" opacity=".8">F&amp;F</text>')),
    'starfield': (tile(stars(14, 80, 80, 'starfield', .5, 1.3, op=(.25, .6)), 80, 80), mark('<ellipse rx="40" ry="12" fill="#F0ABFC" opacity=".15" transform="rotate(-20)"/><circle r="9" fill="#FDE68A" opacity=".55"/><ellipse rx="18" ry="5" fill="none" stroke="#FDE68A" stroke-width="1.4" opacity=".55" transform="rotate(-20)"/>')),
    'ocean': (tile('<path d="M0 20Q10 12 20 20T40 20" stroke="#BAE6FD" stroke-width="1.2" fill="none" opacity=".18"/><path d="M0 34Q10 26 20 34T40 34" stroke="#BAE6FD" stroke-width=".8" fill="none" opacity=".12"/>', 40, 40),
              mark('<g opacity=".35" fill="none" stroke="#FEF3C7"><circle r="28" stroke-width="1.4"/>' + ''.join(f'<path transform="rotate({a})" d="M0-34L4 0 0 4-4 0z" fill="#FEF3C7" stroke="none"/>' for a in (0, 90, 180, 270)) + '</g>')),
    'noir': (tile('<path d="M-10 60L60 -10" stroke="#fff" stroke-width="7" opacity=".05"/>', 50, 50), mark('<g opacity=".25"><path d="M-22 12Q0 2 22 12L18 16Q0 8-18 16z" fill="#000"/><path d="M-14 12Q-12-8 0-8T14 12z" fill="#000"/></g>')),
    'marble': (tile('<path d="M0 30Q20 10 40 34T80 20M10 70Q30 50 50 64T90 60" stroke="#6B7280" stroke-width="1" fill="none" opacity=".35"/><path d="M30 0Q40 20 30 40" stroke="#9CA3AF" stroke-width=".6" fill="none" opacity=".4"/>', 80, 80), mark('<circle r="30" fill="none" stroke="#B8860B" stroke-width="2" opacity=".55"/>' + f'<g transform="scale(2)" fill="#B8860B" opacity=".55"><path d="{DIAMOND}"/></g>')),
    'jungle': (tile('<path d="M10 40C2 30 6 14 20 8C18 22 22 32 10 40z" fill="#86EFAC" opacity=".12"/><path d="M44 20C52 30 48 46 34 52C36 38 32 28 44 20z" fill="#4ADE80" opacity=".1"/>', 60, 60), mark('<g opacity=".22">' + ''.join(f'<path transform="rotate({a})" d="M0 0C-8-10-6-26 0-34C6-26 8-10 0 0z" fill="#BBF7D0"/>' for a in range(0, 360, 45)) + '</g>')),
}
MAT_COLORS = {   # new mats only; existing ones keep their colors in cosmetics.css
    'starfield': ('#1E1B4B', '#05031A', 'rgba(224, 231, 255, .6)', '#4C1D95', '#1E1B4B'),
    'ocean': ('#0E7490', '#083344', 'rgba(254, 243, 199, .6)', '#78350F', '#3F1D0B'),
    'noir': ('#3A3A3C', '#111113', 'rgba(229, 229, 234, .55)', '#1C1C1E', '#000'),
    'marble': ('#F5F5F4', '#D6D3D1', 'rgba(87, 83, 78, .7)', '#B8860B', '#7A5B12'),
    'jungle': ('#15803D', '#052E16', 'rgba(254, 249, 195, .6)', '#78350F', '#3F1D0B'),
}


def uri(svg):
    svg = svg.replace('%', '%25').replace('#', '%23').replace('<', '%3C').replace('>', '%3E').replace("'", '%27').replace('\n', '')
    return f"url('data:image/svg+xml,{svg}')"


def build():
    out = ['/* Generated by scripts/build_looks.py: illustrated card backs and table-mat prints. Do not edit by hand. */']
    for k, svg in BACKS.items():
        sel = ':root, .bk-classic' if k == 'classic' else f':root[data-back="{k}"], .bk-{k}'
        out.append(f'{sel} {{ --back-bg: {uri(svg)} center / 100% 100% no-repeat; }}')
    for k, (t, m) in MATS.items():
        sel = ':root, .mt-emerald' if k == 'emerald' else f':root[data-felt="{k}"], .mt-{k}'
        props = f'--felt-tile: {uri(t) if t else "none"}; --felt-mark: {uri(m)};'
        if k in MAT_COLORS:
            hi, lo, ink, ra, rb = MAT_COLORS[k]
            props += f' --felt-hi: {hi}; --felt-lo: {lo}; --felt-ink: {ink}; --rail-a: {ra}; --rail-b: {rb};'
        out.append(f'{sel} {{ {props} }}')
    out.append('''
/* Mats: print and emblem layered over the felt. */
.felt-table, .deal-table, .mat-art {
  background:
    var(--felt-mark, none) center 56% / auto 15% no-repeat,
    var(--felt-tile, none) 0 0 / auto repeat,
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, .035) 1px, transparent 1.5px) 0 0 / 5px 5px,
    radial-gradient(ellipse 120% 90% at 50% 0%, var(--felt-hi), var(--felt-lo)) !important;
}
.pc.back, .back-art { background: var(--back-bg) !important; }
/* Event exclusives: a holographic sheen that sweeps across the card. */
.back-art[class*="bk-event-"], .pc.back[class*="bk-event-"], :root[data-back^="event-"] .pc.back { position: relative; overflow: hidden; }
/* One clean sweep, then the band waits off the card until the next one: it never stops on the card. */
.back-art[class*="bk-event-"]::after, .pc.back[class*="bk-event-"]::after, :root[data-back^="event-"] .pc.back::after {
  content: ""; position: absolute; top: -25%; bottom: -25%; left: 0; width: 55%; pointer-events: none; mix-blend-mode: screen;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .55) 40%, rgba(147, 197, 253, .4) 52%, rgba(244, 114, 182, .35) 62%, transparent);
  transform: translateX(-130%) skewX(-18deg); animation: holo 5s cubic-bezier(.45, .05, .35, 1) infinite;
}
@keyframes holo { 0% { transform: translateX(-130%) skewX(-18deg); } 32%, 100% { transform: translateX(260%) skewX(-18deg); } }
@media (prefers-reduced-motion: reduce) { .back-art[class*="bk-event-"]::after, .pc.back[class*="bk-event-"]::after, :root[data-back^="event-"] .pc.back::after { animation: none; opacity: 0; } }
''')
    OUT.write_text('\n'.join(out) + '\n', encoding='utf-8')
    print(f'wrote {OUT} ({OUT.stat().st_size // 1024} KB, {len(BACKS)} backs, {len(MATS)} mats)')


if __name__ == '__main__':
    build()
