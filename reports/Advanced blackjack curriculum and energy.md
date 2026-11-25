# Advanced Blackjack Curriculum and Duolingo Energy: Research Report

Prepared for Felt & Fortune (18+, educational, no real-money gambling). Researched November 2026.

**How to read the confidence labels**
- **Verified:** the figure was checked against a cited source during this research.
- **Standard:** the figure is widely published in the advantage-play literature, but the primary source (usually a paid book) could not be fetched. Check it against the book before putting it in the app.
- **Unverified:** the figure came from secondary or forum sources, or is my own estimate. It needs checking before use.

Exact index numbers change with rules: deck count, S17 vs H17, DAS, and how the true count is rounded. The safest option for production content is to generate index sets with a simulator (CVData/CVIndex from [QFIT](https://www.qfit.com/)) or license them, rather than copying them from websites.

---

## PART A: Advanced curriculum

### A.0 Summary: proposed advanced units (22)

| # | Unit | Tier | Legal status |
|---|---|---|---|
| 1 | Fab 4 surrender indices | Advanced | Legal |
| 2 | Index sets by rules: S17 vs H17, shoe vs double deck | Advanced | Legal |
| 3 | Beyond the I18: full index sets and the "Hi-Lo Lite" | Advanced | Legal |
| 4 | Effects of removal: why counts work | Advanced | Legal (theory) |
| 5 | True-count accuracy: deck estimation, flooring vs truncating | Advanced | Legal |
| 6 | Penetration: the single biggest game variable | Advanced | Legal |
| 7 | Comparing games: DI, SCORE, N0, CE | Expert | Legal (theory) |
| 8 | Risk-averse indices and bet-optimal ramps | Expert | Legal |
| 9 | Other counting systems: tags, BC/PE/IC, which to choose | Advanced | Legal |
| 10 | Unbalanced counts: KO, IRC, pivot, key count | Advanced | Legal |
| 11 | Multi-level counts and ace side counts (Hi-Opt II, Omega II, Zen, Halves) | Expert | Legal |
| 12 | Composition-dependent strategy | Expert | Legal |
| 13 | Pitch games: single and double deck play | Expert | Legal |
| 14 | Multi-hand play, table hopping, and wonging math | Advanced | Legal |
| 15 | Variants: Spanish 21, Free Bet, Switch, Double Exposure, early surrender | Advanced | Legal |
| 16 | Side-bet advantage play: Lucky Ladies, 21+3, Royal Match, Over/Under | Expert | Legal |
| 17 | Shuffle tracking and ace sequencing | Expert | Legal without devices; casinos may bar |
| 18 | Hole carding, dealer tells, and warps | Expert | Grey area (see notes) |
| 19 | Where advantage play becomes cheating: devices, marking, edge sorting (Ivey) | Advanced | Illegal or ruled cheating |
| 20 | Bankroll for part-timers vs pros, trip bankrolls, re-sizing | Advanced | Legal |
| 21 | Paperwork and law: records, taxes, CTRs, structuring, ID, trespass | Advanced | Legal knowledge |
| 22 | Heat, cover, and the mental game, with practice standards and checkouts | Advanced | Legal |

Each unit is described below with: what it is, the facts to teach, drill ideas, difficulty tier, and legal or ethical notes.

---

### Unit 1: Fab 4 surrender indices
**What it is:** The four most valuable late-surrender index plays for Hi-Lo, from Don Schlesinger's *Blackjack Attack*.

**Teachable facts (6-deck S17 Hi-Lo; surrender if TC ≥ index). Verified via [Wizard of Odds, Hi-Lo page](https://wizardofodds.com/games/blackjack/card-counting/high-low/):**

| Play | Index |
|---|---|
| 14 vs 10 | +3 |
| 15 vs 10 | 0 |
| 15 vs 9 | +2 |
| 15 vs A | +1 |

- The Illustrious 18 plus the Fab 4 capture about 80–85% of the value of the full index set in a 6-deck game. The full set is worth more in 1- and 2-deck games. (Wizard of Odds, same page.)
- **H17 change (Standard):** under H17, surrendering 15 vs A is basic strategy (index about −1), and 17 vs A becomes a basic surrender. Several secondary sites list 15 vs A as +2. Verify which rule set each figure belongs to.
- **Interaction with the I18:** 15 vs 10 has a stand index of +4. When surrender is available, the surrender index of 0 overrides it at TC 0 to +3. Learners need to know which decision to check first: surrender, then split, double, and finally hit or stand.

**Drills:**
- Flash a hand, a dealer upcard, and a TC. The learner chooses Surrender, Hit, or Stand.
- "Order of operations" items, for example 15 vs 10 at TC +5. Surrender is still correct, because surrender is checked first.
- Rules-toggle items: the same hand shown under S17 and H17.

**Tier:** Advanced. **Legal:** fully legal mental skill.

---

### Unit 2: Index sets by rules (S17 vs H17, shoe vs double deck)
**What it is:** Index numbers are not universal. They shift with the dealer's soft-17 rule, the deck count, DAS, and surrender.

**Teachable facts:**
- **Illustrious 18, 6D S17 (Verified, [Wizard of Odds](https://wizardofodds.com/games/blackjack/card-counting/high-low/)):** Insurance +3; 16v10 0; 15v10 +4; TTv5 +5; TTv6 +4; 10v10 +4; 12v3 +2; 12v2 +3; 11vA +1; 9v2 +1; 10vA +4; 9v7 +3; 16v9 +5; 13v2 −1; 12v4 0; 12v5 −2; 12v6 −1; 13v3 −2.
- **H17 shoe changes (Standard; confirm in Blackjack Attack):** 11 vs A becomes a basic-strategy double (index about −1 instead of +1). Several stand and double indices against an ace move by 1–2 points. Secondary guides agree that "several deviation indices shift by 1–2 true count points under H17" ([blackjack-tutor guide](https://blackjack-tutor.pages.dev/guides/h17-vs-s17.html)).
- **Double deck (Standard):** basic strategy already doubles 9 vs 2 and 11 vs A, so those indices go negative. Insurance is closer to +2. In single deck, the Hi-Lo insurance index is about +1.4.
- **What rules are worth (Verified, [Wizard of Odds Appendix 4](https://wizardofodds.com/games/blackjack/appendix/4/)):**

| Rule | Effect on the player's EV |
|---|---|
| S17 instead of H17 | +0.19% |
| DAS | +0.16% |
| Late surrender | +0.09% |
| Resplit aces | +0.07% |
| 2 decks instead of 6 | +0.23% |
| 8 decks instead of 6 | −0.03% |

- Sample house edges from the same appendix: 6D S17 DAS LS RSA ≈ 0.28%; the same with H17 ≈ 0.47%.

**Drills:**
- "Spot the rule card": the learner reads a table placard and states the house edge to within 0.1%.
- Choose the right chart: the same hand under 6D H17 vs 2D S17.
- Rule-value arithmetic: build a house edge from a base value plus the rule adjustments.

**Tier:** Advanced. **Legal:** legal.

**Production note:** generate the S17/H17 × 1D/2D/6D/8D tables with CVIndex, or license them from QFIT or the *Blackjack Attack* publisher (Las Vegas Advisor/Huntington Press). Do not hand-copy them from mirror sites, many of which contradict each other.

---

### Unit 3: Beyond the I18 (full index sets and "Hi-Lo Lite")
**What it is:** The full Hi-Lo index set has over 100 entries. Snyder showed that grouping indices into a few round-number "blocks" keeps nearly all of the value.

**Teachable facts (Verified, [Snyder, "The Hi-Lo Lite," LVA](https://www.lasvegasadvisor.com/gambling-with-an-edge/the-hi-lo-lite/)):**

| Block | Plays (apply at that TC or higher) |
|---|---|
| +1 | Insurance; 16v10; 12v3, 12v4 |
| +5 | 16v9, 16vA; 15v10, 15vA; 12v2; 10v10, 10vA; A9v5, A9v6; TTv5, TTv6 |
| −1 | 13v2, 13v3; 12v5; 11vA; 10v9 |
| −5 | 17vA; 15v2; 14v2, 14v3; 13v4, 13v5; 12v6; 11v8–10; 10v8 |
| +10 | 16v8; 15v9; 14vA; A9v2–4; TTv3, TTv4 |

- Simulation results from the same article: single deck flat bet, Wong +0.477% vs Lite +0.462% (not significant). 6D with a 1–8 spread: +0.50% vs +0.51%. Reno 1D with a 1–4 spread: +1.32% vs +1.33%.
- **Lesson for learners:** precision on the top 20 or so indices matters far more than memorizing 150.

**Drills:**
- Block sorting: drag plays into the +1, +5, −1, −5, and +10 buckets.
- "Value ladder": rank plays by their dollar value.

**Tier:** Advanced. **Legal:** legal.

---

### Unit 4: Effects of removal (EoR), the theory behind every count
**What it is:** EoR is how much the player's edge changes when one card of a given rank is removed from a single deck.

**Teachable facts (Standard, from Griffin's *Theory of Blackjack*; Wizard of Odds publishes similar tables). Approximate single-deck EoR in % per card removed:**

| Card | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | T | A |
|---|---|---|---|---|---|---|---|---|---|---|
| EoR | +0.38 | +0.44 | +0.55 | +0.69 | +0.46 | +0.28 | 0.00 | −0.18 | −0.51 | −0.61 |

- Count tags are a rounded, scaled version of these numbers. The 5 is the most important small card and the ace the most important big card.
- Betting correlation (BC) is essentially the correlation between a count's tags and the EoRs.
- **Rule of thumb:** in Hi-Lo, each +1 of true count adds about +0.5% to the player's edge. The off-the-top edge is roughly −0.5% in a good 6-deck game.

**Drills:**
- "Which card hurts the player most when removed?"
- "Build your own count": the learner assigns integer tags and the app computes BC live as a correlation with the EoR vector. This is an excellent interactive exercise.

**Tier:** Advanced. **Legal:** theory.

---

### Unit 5: True-count accuracy (deck estimation, flooring vs truncating)
**What it is:** Converting the running count to a true count precisely and consistently.

**Teachable facts:**
- **Truncate:** drop the fraction toward zero (+2.7 → +2; −2.7 → −2).
- **Floor:** always round down (+2.7 → +2; −0.3 → −1).
- Flooring treats every TC between 0 and +1 as "0", which is good, because Hi-Lo TC +0.5 is still about a −0.25% game. Truncating lumps −0.9 to +0.9 together as 0, so the "0" bucket is less homogeneous.
- Index tables are generated for one specific method. Mixing methods costs a little EV. *Blackjack Attack* and CVData state which method each table assumes.
- **Deck estimation:** most pros estimate to the nearest half deck in shoes and the nearest quarter deck in pitch games. Wizard of Odds' simulation rounded to the nearest half deck.
- Dividing by full decks, half decks, or quarter decks changes the TC noticeably late in a shoe. For example, RC +6 with 1.5 decks left is TC +4. Estimate it as 2 decks and you get +3.

**Drills:**
- Discard-tray image: estimate decks played to the nearest half deck, within a time limit.
- RC + decks → TC under floor and truncate modes; the learner sees how the answers differ.
- Speed rounds: 20 conversions in 60 seconds.

**Tier:** Advanced. **Legal:** legal.

---

### Unit 6: Penetration, the single biggest game variable
**What it is:** Penetration is the fraction of the shoe dealt before the shuffle.

**Teachable facts:**
- High counts appear mostly deep in the shoe, so the edge rises non-linearly with penetration.
- A Colon/SBA simulation reported a 6D game at 5/6 penetration (83%) reaching +0.32% long-run edge with the same rules and bet schedule ([LVA, "Why Penetration Matters"](https://www.lasvegasadvisor.com/blog/why-penetration-matters/)). The same article recommends avoiding typical-rule games below 75% penetration.
- Snyder's frequency-distribution approach shows how the share of hands at TC ≥ +2 grows with depth ([LVA excerpt from *Beat the 6-Deck Game*](https://www.lasvegasadvisor.com/blog/an-excerpt-from-arnold-snyders-beat-the-6-deck-game/)).
- **Rule of thumb (Standard):** moving 6D penetration from 4.5 to 5 decks is worth more than any single rule change such as DAS or surrender.

**Drills:**
- "Read the cut card": estimate penetration from an image of where the cut card sits.
- "Which game would you play?" Choose between pairs of games, such as an H17 game with 85% penetration vs an S17 game with 70%, with the SCORE revealed afterward.

**Tier:** Advanced. **Legal:** legal.

---

### Unit 7: Comparing games with DI, SCORE, N0, and CE
**What it is:** Schlesinger's metrics for comparing games and bet spreads fairly ([Wikipedia: Don Schlesinger](https://en.wikipedia.org/wiki/Don_Schlesinger) credits him with DI and SCORE).

**Teachable facts.** The definitions are Standard. The algebra was derived here and should be checked against *Blackjack Attack* (3rd ed.).
- **EV and SD:** EV is win per round and SD is standard deviation per round, both in betting units.
- **DI (Desirability Index)** = 1000 × EV / SD. This is the ratio of expectation to risk, scaled up.
- **SCORE (Standardized Comparison of Risk and Expectation):** the expected win per 100 rounds for a $10,000 bankroll with optimal bet sizing at 13.5% risk of ruin. Algebraically, SCORE = DI², in dollars per 100 rounds.
- **N0** = (SD/EV)² = 1,000,000 / DI². This is the number of rounds until the expected win equals one standard deviation, and it links to the N0 topic the app already teaches.
- **CE (Certainty Equivalent):** the risk-adjusted win rate, roughly EV − Variance / (2 × Kelly bankroll multiple × bankroll). It is used to compare spreads for a player who bets less than full Kelly.
- **Example:** DI = 5 gives SCORE = $25 per 100 rounds and N0 = 40,000 rounds. DI = 10 gives SCORE = $100 and N0 = 10,000.

**Drills:**
- A calculator puzzle: given EV = 0.012 units and SD = 3.2 units, compute the DI (3.75) and the N0 (about 71,000).
- Rank three games by SCORE.
- A slider sim: adjust spread, penetration, and rules and watch the SCORE change.

**Tier:** Expert. **Legal:** theory.

---

### Unit 8: Risk-averse (RA) indices and optimal ramps
**What it is:** Standard indices maximize EV. Risk-averse indices (Schlesinger, *Blackjack Attack*) adjust index plays when you have a large bet out, so you maximize certainty equivalent (CE) rather than EV.

**Teachable facts (Standard):**
- RA indices are typically **higher** for doubles and splits, because putting more money out at a large bet adds variance.
- RA indices are **lower** for insurance and surrender, because they reduce variance. The RA insurance index for Hi-Lo is below +3.
- Bet-optimal ramps scale the bet roughly in proportion to the edge (advantage ÷ variance × bankroll), then round to chip units. Ramps from CVCX or *Blackjack Attack* charts are the reference.

**Drills:**
- "Big bet out": the same hand at the minimum bet and at the maximum bet. Does the play change?
- Ramp-building exercise with a Kelly-fraction slider. This links to the existing Kelly unit.

**Tier:** Expert. **Legal:** legal.

---

### Unit 9: Other counting systems (tags, BC, PE, IC)
**What it is:** A guided tour of the major counts and the trade-off between betting power and playing power.

**Teachable facts (Verified, [QFIT card-counting comparison](https://www.qfit.com/card-counting.htm); tags cross-checked with [Wikipedia: Card counting](https://en.wikipedia.org/wiki/Card_counting)):**

| System | A | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | T | BC | PE | IC |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Hi-Lo | −1 | 1 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | −1 | .97 | .51 | .76 |
| KO | −1 | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 0 | −1 | .98 | .55 | .78 |
| Red Seven | −1 | 1 | 1 | 1 | 1 | 1 | 0/1* | 0 | 0 | −1 | .98 | .54 | .78 |
| Hi-Opt I | 0 | 0 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | −1 | .88 | .61 | .85 |
| Hi-Opt II | 0 | 1 | 1 | 2 | 2 | 1 | 1 | 0 | 0 | −2 | .91 | .67 | .91 |
| Omega II | 0 | 1 | 1 | 2 | 2 | 2 | 1 | 0 | −1 | −2 | .92 | .67 | .85 |
| Zen | −1 | 1 | 1 | 2 | 2 | 2 | 1 | 0 | 0 | −2 | .96 | .63 | .85 |
| Wong Halves | −1 | .5 | 1 | 1 | 1.5 | 1 | .5 | 0 | −.5 | −1 | .99 | .56 | .72 |
| Uston APC | 0 | 1 | 2 | 2 | 3 | 2 | 2 | 1 | −1 | −3 | .91 | .69 | .90 |

\* Red Seven counts red 7s as +1 and black 7s as 0.

- **BC (betting correlation):** how well the count sizes bets. **PE (playing efficiency):** how well it guides strategy changes. **IC (insurance correlation):** how well it flags insurance.
- Ace-neutral counts (Hi-Opt, Omega) have higher PE but need an ace side count to bet well.
- PE "is not relevant to unbalanced systems and is only an estimate" (QFIT).
- Shoe games reward BC; pitch games reward PE.
- Snyder's historical view is that the gain from more complex counts is small ([LVA comparison](https://www.lasvegasadvisor.com/blog/whats-the-best-card-counting-system/)).

**Drills:**
- Tag recall per system.
- Speed counts in a chosen system.
- "Which system fits this game?" (8-deck shoe vs single deck).
- Convert the same card sequence under Hi-Lo and Zen.

**Tier:** Advanced. **Legal:** legal.

---

### Unit 10: Unbalanced counts (KO, IRC, pivot, key count)
**What it is:** KO (Vancura and Fuchs, *Knock-Out Blackjack*) counts 7 as +1, so the count is unbalanced and no true-count conversion is needed.

**Teachable facts:**
- **IRC (initial running count)** = −4 × (decks − 1) in the book's standard form. That gives 0 for 1 deck, −4 for 2, −20 for 6, and −28 for 8. A secondary site lists −27 for 8 decks, so the exact book values are Unverified and should be checked.
- **Key count:** the running count at which the player gains an edge. It is +1 in the book's standard setup ([LVA KO sample PDF](https://www.lasvegasadvisor.com/samples/KOBJ%20Sample.pdf)).
- **Pivot:** the running count at which the RC equals the TC for any number of decks remaining ([LVA](https://www.lasvegasadvisor.com/gambling-with-an-edge/?p=121730)).
- KO uses a handful of "matrix" plays at the key count instead of full indices.
- An LVA comparison found KO and Red 7 roughly equal in performance ([LVA "Battle of the Babies"](https://www.lasvegasadvisor.com/gambling-with-an-edge/evaluating-the-simplest-card-counting-systems/)).

**Drills:**
- "Start the shoe": the learner enters the IRC for N decks.
- RC → bet-unit decisions at key-count thresholds.
- Compare Hi-Lo and KO on the same shoe.

**Tier:** Advanced. **Legal:** legal.

---

### Unit 11: Multi-level counts and ace side counting
**What it is:** Level-2 and level-3 counts plus a separate ace count.

**Teachable facts:**
- Hi-Opt II has IC .91, the best insurance correlation among common counts.
- With an ace-neutral count, keep a side count of aces. A normal deck has 4 aces per 52 cards (1 per 13 cards).
- **Ace surplus** = aces remaining − expected aces for the cards remaining.
- **Betting adjustment (Standard approximation for level-2 counts):** add about 2 running-count points for each surplus ace when sizing bets. Do not use the adjusted count for playing decisions, except for insurance and some double-down decisions on 10 and 11.
- Zen and Halves count the ace in the main count, so they need no side count but give up some PE.
- **Practical caveat:** in modern shoe games, the extra gain from a level-2 count with an ace side count is small compared with the added error rate.

**Drills:**
- Dual-track drill: the learner keeps the main count plus the ace count, then reports both.
- "Adjust the RC for 3 surplus aces with 2 decks left."

**Tier:** Expert. **Legal:** legal.

---

### Unit 12: Composition-dependent (CD) strategy
**What it is:** Basic strategy that depends on the exact cards in your hand, not just the total.

**Teachable facts (Standard):**
- Multi-card 16 vs 10: stand on 3 or more cards (for example 4-4-8). Hit a two-card 16. This is the best-known CD play in shoe games.
- Single-deck examples: hit 10-2 vs 4, but stand 9-3 or 8-4 vs 4. Small hand cards already removed make the "big" composition worse to hit.
- The total value of CD over total-dependent strategy is small: a few hundredths of a percent in 1D and about 0.01% in 6D. The idea matters more in pitch games and for understanding EoR.
- See [Wizard of Odds' blackjack section](https://wizardofodds.com/games/blackjack/) for composition-dependent strategy tables.

**Drills:**
- "Same total, different cards": 10-6 vs 10 compared with 4-4-8 vs 10.
- Single-deck hand puzzles.

**Tier:** Expert. **Legal:** legal.

---

### Unit 13: Pitch games (single and double deck)
**What it is:** Hand-held 1D/2D games, which have different mechanics, indices, and heat.

**Teachable facts (Standard):**
- The off-the-top edge is better: 2D is about +0.23% better than 6D per the Appendix 4 table above.
- Cards are dealt face down, so players must count hands as they are revealed at the end.
- Indices are much more valuable in pitch games. More rounds have extreme counts, and the I18 alone captures less of the total value.
- The single-deck insurance index is about +1.4.
- Number of players matters: fewer players means more rounds per shuffle.
- Bet spreads must be smaller (1–4 is typical) because heat is higher.
- 6:5 blackjack (now common in 1D games) costs about 1.4% and generally ruins the game. This is standard Wizard of Odds data.

**Drills:**
- A hand-held "reveal sequence" counting drill: cards turn over in dealer-reveal order at the end of the round.
- A quarter-deck estimation drill.
- 6:5 vs 3:2 spot-the-trap item.

**Tier:** Expert. **Legal:** legal.

---

### Unit 14: Multi-hand play, table hopping, and wonging math
**What it is:** How playing more spots, or leaving bad shoes, changes EV and variance.

**Teachable facts:**
- Two hands at the same table are positively correlated. Wizard of Odds Appendix 4 tabulates the covariance for one to three hands ([link](https://wizardofodds.com/games/blackjack/appendix/4/)).
- **Rule of thumb (Standard):** two hands at about 75% of a single max bet have roughly the same risk as one max bet, with more money in action.
- Spreading to two hands in high counts "eats" fewer good cards per hand and gets more money on the table.
- **Wonging:** with no play at negative counts, the 6D Atlantic City Hi-Lo simulation in Snyder's article rose from +0.50% to +0.98% ([LVA](https://www.lasvegasadvisor.com/gambling-with-an-edge/the-hi-lo-lite/)).
- Many casinos post "no mid-shoe entry" (NMSE) rules to stop wonging.

**Drills:**
- Decision sim: stay, leave, or spread to two hands at a given TC.
- "Which uses more bankroll?" comparisons.

**Tier:** Advanced. **Legal:** legal, though casinos can enforce NMSE rules.

---

### Unit 15: Game variants and how their strategy differs

| Variant | Key rules | House edge (basic strategy) | Notable strategy changes | Source |
|---|---|---|---|---|
| Spanish 21 | 48-card decks (no 10-spots), bonuses for 21s, late surrender, often redoubling | 0.40% (S17); 0.42% (H17 with redouble); 0.76% (H17 without redouble) | Hit far more often, because fewer tens make busting less likely. Hit hard 17 vs A if surrender isn't available. Counting is weaker because the tens are missing. | [Wizard of Odds Spanish 21](https://wizardofodds.com/games/spanish-21/), [FAQ](https://wizardofodds.com/ask-the-wizard/spanish-21) |
| Free Bet | Free doubles on hard 9–11, free splits (not 10s), dealer 22 pushes | 1.04% | Take every free double and split. A push on a free bet counts as a loss, so play more aggressively. | [Wizard of Odds Free Bet](https://wizardofodds.com/games/free-bet-blackjack/) |
| Blackjack Switch | Two hands; swap the second cards; dealer 22 pushes; blackjack pays 1:1 | Roughly 0.13–0.58%, depending on rules and switch skill (Unverified) | Switch decisions require a separate chart. | [casino.org](https://www.casino.org/blackjack/switch/) |
| Double Exposure | Both dealer cards face up; ties lose; blackjack pays 1:1 | About 0.67% (Unverified, secondary source) | A completely different strategy chart. Players often stand on very low totals. | [PokerNews](https://www.pokernews.com/casino/double-exposure-blackjack.htm) |
| Early surrender | Surrender before the dealer checks for blackjack | Worth about +0.6% vs no surrender (Standard; verify) | Surrender many more hands against A and 10, including some hard 5–7 and 12–17 vs A. | Wizard of Odds (verify) |

**Drills:**
- "Same hand, different game": for example, 16 vs 10 in Spanish 21 vs standard blackjack.
- Rule-recognition quizzes.

**Tier:** Advanced. **Legal:** legal.

---

### Unit 16: Side-bet advantage play

| Bet | House edge (off the top) | Counting approach | Status |
|---|---|---|---|
| Lucky Ladies | 17.6–24.7% (6D, by paytable; Pay Table A 24.71%) | Ten-centric count. Tags (A..T): +1 for 2–9 and A, −2 for tens (the "10-count"). Secondary sources report Hi-Lo TC thresholds of about +6.5 to +7. | Paytables Verified ([Wizard of Odds](https://wizardofodds.com/games/blackjack/side-bets/lucky-ladies/)); thresholds Unverified ([onlinegambling.com](https://www.onlinegambling.com/blackjack/academy/lucky-ladies-side-bet/)) |
| 21+3 | Varies by paytable ([Wizard of Odds](https://wizardofodds.com/games/blackjack/side-bets/21plus3/)) | Suit counting for flushes. Forum analysis says the bet is "fairly immune to advantage play" without shuffle tracking. | Unverified ([WoV forum](https://wizardofvegas.com/forum/gambling/blackjack/25726-counting-21-3-side-bet/)) |
| Royal Match | Varies | Suit-balance counting (Snyder's *Big Book of Blackjack*). Vulnerable in single deck; edges can be large but rare. | Unverified ([WoV forum](https://wizardofvegas.com/forum/gambling/blackjack/9987-royal-match-side-bet/)) |
| Over/Under 13 | About 6.5–10% (secondary) | Historically vulnerable to a dedicated count (small vs large cards). Specific tags were not verified in this research. | Unverified |

**Teaching point:** side bets have huge house edges off the top but high EoR. A dedicated count can flip them positive at extreme counts. This works as a "math of high-variance bets" lesson.

**Drills:**
- "Is it positive now?" given a 10-density.
- Compute the edge of a paytable from given probabilities.

**Tier:** Expert. **Legal:** legal (a skill), but casinos often remove vulnerable side bets.

---

### Unit 17: Shuffle tracking and ace sequencing
**What it is:**
- **Shuffle tracking:** following slugs of high cards (or low cards) through a predictable hand shuffle, then cutting them in or out of play.
- **Ace sequencing:** remembering the card that precedes an ace, then betting when that card appears after the shuffle. Wikipedia notes that some teams cut to put an ace on a player's hand.

**Teachable facts:**
- Both require predictable manual shuffles.
- Automatic shuffling machines "interfere with the shuffle tracking variation of card counting by hiding the shuffle" ([Wikipedia](https://en.wikipedia.org/wiki/Card_counting)), and CSMs (continuous shufflers) defeat counting entirely.
- An ace as the player's first card is worth roughly +50% edge on that hand (Standard). That explains why sequencing is so powerful.

**Drills:** educational simulations only. For example, a "slug visualizer" showing how a riffle-and-strip shuffle mixes a 1-deck slug.

**Tier:** Expert. **Legal and ethics:** legal where no device is used. Casinos can bar players or change procedures. Keep this unit conceptual.

---

### Unit 18: Hole carding, dealer tells, and warps
**What it is:**
- **Hole carding:** seeing the dealer's hole card because of a sloppy dealer.
- **Tells:** reading dealer behavior when they peek.
- **Warps:** bent cards that reveal tens or aces.

**Teachable facts:**
- Perfect hole-card knowledge gives the player a very large edge (Standard: roughly +10% or more, depending on rules). Play changes drastically, for example hitting hard 17 against a made 20.
- Warps and tells are weaker and less reliable.

**Legal:**
- Seeing a card the dealer exposes, without any device or collusion, has generally been treated as legal in Nevada.
- Using a device, colluding with the dealer, or bending cards yourself is cheating. Deliberately warping cards is card marking.
- Court outcomes have varied, so present this as a legal grey area and **do not teach technique**. Teach the concept and how casinos defend against it.

**Tier:** Expert.

---

### Unit 19: Where advantage play becomes cheating
**Teachable facts:**
- **Devices:** Nevada NRS 465.075 makes it unlawful to use or possess "any computerized, electronic, electrical or mechanical device" designed to project outcomes or "keep track of cards" ([Justia NRS 465.075](https://law.justia.com/codes/nevada/2019/chapter-465/statute-465-075/); current text at the [Nevada Legislature](https://www.leg.state.nv.us/nrs/NRS-465.html)). Violations of NRS 465.070–465.085 are category B felonies under NRS 465.088 (check the current text).
- **Edge sorting (Ivey):** the UK Supreme Court in *Ivey v Genting Casinos* [2017] UKSC 67 (25 Oct 2017) unanimously held that Ivey's edge sorting at punto banco was cheating. About £7.7m was withheld ([UKSC case page](https://www.supremecourt.uk/cases/uksc-2016-0213.html)). Separately, a US federal judge (Hillman, D.N.J., 2016) ordered Ivey and Cheung Yin Sun to repay about $10.1m to the Borgata ([PokerNews](https://www.pokernews.com/news/2017/12/top-10-stories-of-2017-7-phil-ivey-loses-19m-court-battles-29597.htm)).
- **Counting itself:** counting is not illegal under US federal, state, or local law or British law, provided no device or outside person assists ([Wikipedia](https://en.wikipedia.org/wiki/Card_counting)).
- **Barring:** New Jersey casinos cannot bar counters (Uston, NJ Supreme Court). Nevada casinos can.
- **Macau** strictly prohibits devices.
- **Teaching frame:** use a "Legal / Grey / Cheating" sorting game.

**Tier:** Advanced. **Legal:** essential safety content.

---

### Unit 20: Bankroll for part-timers vs pros, trip bankrolls, re-sizing
**Teachable facts (Standard):**
- **Part-timer vs pro:** a part-timer with a replenishable bankroll can bet more aggressively (closer to full Kelly) relative to the money they set aside. A pro living off the bankroll needs much lower risk of ruin and a separate living-expense fund.
- **Trip bankroll:** the amount needed to survive a single trip at a chosen trip ROR. It is usually a fraction of the total bankroll. A rule of thumb is to bring about 30–40% of the total bank to a long trip.
- **Re-sizing:** scale bets down after losses (and up after wins) to keep the risk of ruin constant.
- **Standard deviation of results:** SD over N hands = SD per hand × √N. A typical per-hand SD with a spread is about 3 or more units.

**Drills:**
- A ruin simulator (Monte Carlo) showing trip vs total ROR.
- "How many units for a 5% ROR?"

**Tier:** Advanced. **Legal:** legal.

---

### Unit 21: Paperwork and law (records, taxes, CTRs, structuring, ID, trespass)
**Teachable facts (US):**
- **CTR:** casinos must file a Currency Transaction Report for cash-in or cash-out of more than $10,000 in a gaming day. Cash-in and cash-out are aggregated separately (31 CFR 1021.311) ([IRS tribal casino FAQ](https://www.irs.gov/node/386); [FinCEN casino FAQ](https://www.fincen.gov/resources/statutes-regulations/guidance/frequently-asked-questions-casino-record-keeping-reporting)).
- **Structuring:** deliberately splitting transactions to avoid a CTR is a federal crime (31 U.S.C. 5324). Penalties run up to 5 years and $250,000, and double in aggravated cases ([FinCEN CTR pamphlet](https://www.fincen.gov/system/files/shared/CTR-CPamphletBW.pdf)).
- **W-2G:** live table games such as blackjack generally do not trigger a W-2G ([LVA Q&A](https://www.lasvegasadvisor.com/question/taxable-table-games/); see the [IRS W-2G instructions](https://www.irs.gov/instructions/iw2g)). All gambling winnings are still taxable, so keep a session log with date, casino, table, buy-in, cash-out, and witnesses.
- **ID:** players must show ID once a CTR threshold is approached.
- **Trespass:** once a casino has barred you, returning can be criminal trespass (Nevada).
- Add a "not legal or tax advice" disclaimer to this unit.

**Drills:**
- "CTR or not?" scenarios.
- Build a session-log entry.

**Tier:** Advanced. **Legal:** this unit is legal knowledge.

---

### Unit 22: Heat, cover, mental game, practice standards, and checkouts
**Teachable facts (Standard; partly Unverified):**
- **Heat signals:** floor watching, a shuffle-up after you raise your bet, counting your chips, asking for ID.
- **Cover:** occasionally deviating from optimal play, parlaying bets, playing short sessions.
- **The back-off sequence:** the flat bet or shuffle-up comes first, then a back-off, then trespass.
- **Mental game:** tilt after losses, fatigue (accuracy drops sharply after an hour or two), and alcohol.
- **Practice standards (commonly cited community benchmarks; Unverified):**
  - Count down a single deck in under about 25 seconds, with zero errors.
  - Count down pairs of cards (cancellation).
  - Convert to TC under distraction.
  - Pass the I18 and Fab 4 at 100% within 2 seconds per decision.
  - Blackjack Apprenticeship runs a "checkout" test before members play with its team or bankroll programs. Its site blocked automated access, so its exact criteria could not be verified.

**Drills:**
- Timed deck countdown with a leaderboard.
- Distraction mode, with chatter audio and a dealer talking.
- A mock "checkout": a timed full-shoe count, TC conversions, and an index exam.

**Tier:** Advanced. **Legal:** legal.

---

### A.1 Placement test recommendation

**What comparable products do:**
- **Duolingo:** uses an adaptive placement test. Correct answers raise item difficulty and wrong answers lower it. Duolingo has blogged about grading improvements ([Duolingo blog: partial credit](https://blog.duolingo.com/partial-credit-improvements-to-duolingos-placement-test/)). Learners can also "Jump here" to test out of sections later.
- **Khan Academy:** encourages learners to jump straight to unit quizzes and tests to prove existing knowledge ([Khan Help](https://support.khanacademy.org/hc/en-us/articles/115002552631)).
- **Chess.com:** a self-selected skill level sets the starting rating (for example 400 or 800), which then adjusts with Glicko ([Chess.com support](https://support.chess.com/en/articles/8566476-what-is-the-glicko-rating-system)).
- **Lichess:** starts everyone at 1500 with a high rating deviation (provisional "?") under Glicko-2, so early results move the rating fast ([lichess rating systems](https://lichess.org/page/rating-systems)).

**Recommended design (CAT-lite):**
1. **Self-report first:** "Never played / know basic strategy / count cards / count and use indices." This sets the starting difficulty, as on Chess.com.
2. **Adaptive item selection** over about 12–16 items. Tag each item by skill: basic strategy, counting speed, TC, indices, money management, and advanced topics. Step difficulty up after a correct answer and down after a miss, as Duolingo does. Keep a per-skill estimate with uncertainty, as Glicko does.
3. **Placement rule:** place the learner at the first unit where they missed 2 or more items in that skill. Mark the earlier units as "tested out", but keep them open for review.
4. **Allow later test-outs:** add a "Jump here" unit test at each unit's entry point, as in Duolingo and Khan Academy.
5. **Separate fluency from knowledge:** include one or two timed items, such as a countdown or a TC under a clock. A counter who knows the indices but counts slowly should still get the speed drills.

**Suggested placement items (beginner → expert):**
1. What is a soft 17? (beginner)
2. Hard 16 vs dealer 10, basic strategy, no surrender? (Hit)
3. A,7 vs 9? (Hit)
4. 8,8 vs A in a game with no surrender? (Split)
5. Which rule is better for the player, S17 or H17? About how much is it worth? (~0.2%)
6. Hi-Lo tag of a 7? Of an ace? (0, −1)
7. Timed: running count after a 15-card sequence.
8. RC +9 with 3 decks left: what is the TC? (+3)
9. Hi-Lo insurance index in a 6-deck game? (+3)
10. 16 vs 10 at TC +1? (Stand)
11. 15 vs 9 at TC +3 with late surrender available? (Surrender)
12. Why does a game with 83% penetration beat one with 67%?
13. KO: what is the IRC for 6 decks? What is the key count?
14. Given EV = 1% and SD = 3.3, what is the DI? What is N0? (~3.0; ~109,000)
15. Legal, grey, or cheating: a phone app that counts for you in Nevada? (Illegal: NRS 465.075)
16. Lucky Ladies has a 24.7% house edge. What makes a dedicated count able to flip it positive? (High EoR of tens)

---

## PART B: Duolingo Energy system (short)

| Feature | What is known | Confidence |
|---|---|---|
| Launch | Announced on Duolingo's blog on 3 July 2025 for "a small number of users." Tested April–May 2025 and rolled out widely in late 2025 ([Duolingo blog](https://blog.duolingo.com/duolingo-energy/), [duoplanet](https://duoplanet.com/duolingo-energy-system/)). Replaces Hearts on mobile; desktop web reportedly still used Hearts ([duolingoguides](https://duolingoguides.com/duolingo-energy-system/)). | Medium-high |
| Maximum | 25 energy (a full battery). Duolingo's post says only "full battery." The 25 figure comes from third-party guides and is consistent across sources. | Medium-high |
| Cost | 1 energy per exercise (question), right or wrong. Reviewing mistakes at the end of a lesson is free (official). Legendary or harder lessons cost more in total because they contain more items. | High |
| Regeneration | "Fully recharges in about a day" (official). The fan wiki states about +1 per hour; a user reported a "full in 13 hours" timer; another review says up to 18 hours. | Low (rate varies, A/B tested) |
| Panel UI (tap the battery) | From community reports: shows current energy x/25 and the time until full, plus refill options (gems, watch an ad, try Super for unlimited). One user reported a free +5 option in January 2026. No official description was found. | Low-medium |
| Earning back | Get several answers in a row correct (official). Community reports: +1 to +5 per 5-correct streak, possibly +2 at 5 in a row and more at 10, and about +5 for a perfect lesson. Bonuses also come from adding a friend and from reward chests (official). | Mechanism high, amounts low |
| Ads | Rewarded ads give about +3 to +5 energy, depending on test group. | Medium |
| Gems | Full refill reported at 750 gems (iOS); 350 or 450 reported elsewhere (platform or test group). | Low |
| Super / Max | Unlimited energy. | High |
| Caveat | Duolingo calls Energy actively tested, so values differ by user cohort. | n/a |

**Takeaway for Felt & Fortune:** the copyable pattern is:
- 25 maximum, 1 energy per item, and a free mistake review.
- A slow recharge of about a day, with a visible "full in Xh" timer.
- Energy back on streaks of correct answers. This rewards accuracy instead of punishing errors, which is why Duolingo replaced Hearts. Their post says beginners were twice as likely to run out of hearts mid-lesson.
- A refill path through ads or gems, and unlimited energy for subscribers.

---

## Sources (main)
- Wizard of Odds: [Hi-Lo / I18 / Fab 4](https://wizardofodds.com/games/blackjack/card-counting/high-low/), [Appendix 4 (rules, variance, covariance)](https://wizardofodds.com/games/blackjack/appendix/4/), [Lucky Ladies](https://wizardofodds.com/games/blackjack/side-bets/lucky-ladies/), [Free Bet](https://wizardofodds.com/games/free-bet-blackjack/), [Spanish 21](https://wizardofodds.com/games/spanish-21/), [21+3](https://wizardofodds.com/games/blackjack/side-bets/21plus3/)
- QFIT: [counting system comparison](https://www.qfit.com/card-counting.htm)
- Las Vegas Advisor: [Hi-Lo Lite](https://www.lasvegasadvisor.com/gambling-with-an-edge/the-hi-lo-lite/), [Why Penetration Matters](https://www.lasvegasadvisor.com/blog/why-penetration-matters/), [KO sample](https://www.lasvegasadvisor.com/samples/KOBJ%20Sample.pdf), [Battle of the Babies](https://www.lasvegasadvisor.com/gambling-with-an-edge/evaluating-the-simplest-card-counting-systems/)
- Wikipedia: [Card counting](https://en.wikipedia.org/wiki/Card_counting), [Don Schlesinger](https://en.wikipedia.org/wiki/Don_Schlesinger)
- Law: [NRS 465.075](https://law.justia.com/codes/nevada/2019/chapter-465/statute-465-075/), [UKSC Ivey v Genting](https://www.supremecourt.uk/cases/uksc-2016-0213.html), [FinCEN casino FAQ](https://www.fincen.gov/resources/statutes-regulations/guidance/frequently-asked-questions-casino-record-keeping-reporting), [FinCEN CTR pamphlet](https://www.fincen.gov/system/files/shared/CTR-CPamphletBW.pdf), [IRS W-2G instructions](https://www.irs.gov/instructions/iw2g)
- Duolingo: [Energy blog post](https://blog.duolingo.com/duolingo-energy/), [duoplanet guide](https://duoplanet.com/duolingo-energy-system/), [duolingoguides](https://duolingoguides.com/duolingo-energy-system/), [placement test blog](https://blog.duolingo.com/partial-credit-improvements-to-duolingos-placement-test/)
- Placement comparisons: [Khan Academy help](https://support.khanacademy.org/hc/en-us/articles/115002552631), [Chess.com ratings](https://support.chess.com/en/articles/8566476-what-is-the-glicko-rating-system), [lichess rating systems](https://lichess.org/page/rating-systems)

**Not reachable during this research:** Blackjack Apprenticeship (blocked automated access with HTTP 403), the Duolingo fandom wiki (HTTP 402), and the primary books (*Blackjack Attack*, *Professional Blackjack*, *Knock-Out Blackjack*, *Theory of Blackjack*). Figures labelled Standard come from these books and should be checked against them.
