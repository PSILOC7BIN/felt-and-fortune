# Quest / Mission System Design (daily, weekly, event) for a Blackjack Learning App

Research date: 2026-11-24. Most game-structure figures come from wikis and guide sites and change often between patches. Treat exact numbers as "typical at time of writing", not current canon.

## Typical structures: counts, refresh times, random pools, rerolls

### Takeaway
The industry norm is a small daily set (2 to 4 quests, most often 3) drawn at random from a pool, a weekly layer (3 to 7 quests, or a "complete N dailies" meta-goal), a bank or carry-over so a missed day is not lost, and about one free reroll per day. Duolingo, the closest analogue for a learning app, uses exactly 3 Daily Quests plus a monthly badge for completing enough quests that month, plus a weekly co-op Friends Quest.

### Cited Findings
- **Hearthstone:** players hold up to 3 daily and 3 weekly quests at once. A new daily is granted each day when a slot is open, and a new set of up to 3 weeklies arrives every Monday. Rerolls are limited to one daily and one weekly per day. Legendary (event) quests cannot be rerolled. — [Hearthstone Wiki: Quests](https://hearthstone.wiki.gg/wiki/Quests); [Hearthstone Wiki: Daily quest](https://hearthstone.wiki.gg/wiki/Daily_quest)
- **Hearthstone reward tiers:** dailies at roughly 800/900/1000 XP (some at 1500). Blizzard later raised 800 XP dailies to 900. Weeklies come in 2500 XP and 1750 XP tiers: one weekly is drawn from the 2500 tier and two from the 1750 tier, so the difficulty mix is built into the draw. — [Hearthstone Wiki: Quests](https://hearthstone.wiki.gg/wiki/Quests); [Blizzard: Revamping Progression & Rewards](https://playhearthstone.com/news/23534414)
- **Marvel Snap:** 2 daily missions (one Normal, one Hard) drop every 8 hours. Normal pays 50 Credits + 25 Season XP. Hard has doubled requirements for doubled rewards. The mission log holds at most 6 missions, so players who miss sessions can catch up. — [Out of Cards: Daily missions in Marvel Snap](https://outof.cards/marvel-snap/guides/272-a-guide-to-daily-missions-in-marvel-snap/); [Marvel Snap Zone: Missions](https://marvelsnapzone.com/guides/missions/)
- **Marvel Snap weekly meta-quest:** the Weekly Challenge is "complete N daily missions" with milestone rewards at 5/10/15/20/25. For example, 5 gives 100 Credits + 10 Gold + 100 Season XP, and 15 gives 250 Credits + 25 Gold + 300 Season XP. It resets Monday 7 PM PT. One older source said 35 dailies were required, which conflicts with the 25 in most guides. — [Marvel Snap Zone: Missions](https://marvelsnapzone.com/guides/missions/); [Out of Cards guide](https://outof.cards/marvel-snap/guides/272-a-guide-to-daily-missions-in-marvel-snap/)
- **Marvel Snap mission bank:** players can reportedly store up to 10 mission refills, so the Weekly Challenge stays finishable after missed days. This was an unannounced change, so verify it. — [Marvel Snap Zone PSA](https://marvelsnapzone.com/psa-players-can-now-save-up-to-10-mission-refills-daily-reset-time/)
- **Apex Legends:** 3 daily challenges drawn at random from a pool of 200+ (Season 2, 2019), plus 7 weeklies. Three weeklies grant a full Battle Pass level and the other four or five grant 1 to 5 Stars. The wiki lists the first daily reroll as free, then escalating costs of 200, 500 and 1,000 Legend Tokens, resetting daily. Completing all dailies gives 10 Stars, which equals one Battle Pass level. — [EA: Battle Pass challenges details](https://www.ea.com/news/battle-pass-challenges-details); [Apex Legends Wiki: Star](https://apexlegends.wiki.gg/wiki/Star). Note: the EA page describes the 2019 system, and the current values come from the wiki only.
- **Fortnite:** has repeatedly removed and restored dailies. Season 10 replaced Daily and Weekly challenges with "Missions" locked behind the Battle Pass. Chapter 2 Remix had 3 fixed dailies with a 20K XP bonus for each of the first three completed per 24 hours. In Chapter 6 Season 1, merging the per-mode daily tabs and cutting XP drew "becoming a chore" complaints. — [GameSpot: Season 10 changes](https://www.gamespot.com/articles/fortnite-season-10-big-changes-to-how-daily-and-we/1100-6468825/); [GamesRadar: Fortnite quests](https://gamesradar.com/fortnite-quests); [GamesRadar: Chapter 6 chore complaints](https://www.gamesradar.com/games/fortnite/fortnite-players-lament-the-battle-royale-is-becoming-a-chore-as-xp-changes-make-leveling-up-much-slower-in-chapter-6s-debut-season)
- **Genshin Impact:** 4 Daily Commissions per day, unlocked at Adventure Rank 12. Guides commonly cite about 10 Primogems each plus a completion bonus for finishing all four. Sources disagree on the bonus: 20 Primogems, or 20 or 40 Resin with 500 Adventure XP. Version 4.1 reworked it toward Honkai: Star Rail's model, where other activities can earn the same daily reward ("Encounter Points"). — [Game8 / guides via search](https://game8.co/games/Genshin-Impact/archives/297423); [Prima Games: Encounter Points](https://primagames.com/gaming/how-to-get-daily-commission-rewards-with-encounter-points-in-genshin-impact); [Yahoo: 4.1 rework](https://sg.news.yahoo.com/genshin-impact-to-get-new-daily-commissions-system-similar-to-honkai-star-rail-in-version-41-090941318.html)
- **Pokémon GO Field Research:** the first Field Research task completed each day earns 1 stamp, and extra tasks that day earn nothing more. 7 stamps unlock a Research Breakthrough with a monthly-rotating featured encounter. **The days do not need to be consecutive, and progress does not reset if you miss a day.** Special (story) Research cannot be discarded and does not award stamps. — [Bulbapedia: Research Breakthrough](https://bulbapedia.bulbagarden.net/wiki/Research_Breakthrough); [Bulbapedia: Field Research](https://bulbapedia.bulbagarden.net/wiki/Field_Research); [Niantic Help: Types of research](https://niantic.helpshift.com/hc/faq/45-types-of-research)
- **Duolingo Daily Quests:** 3 per day, earning gems and other rewards. In 2025 Duolingo "boosted rewards for learners who complete all three Daily Quests", which is a completion bonus. It also redesigned chest-opening to be more enjoyable. — [Duolingo Blog: 2025 Highlights (Dec 10, 2025)](https://blog.duolingo.com/product-highlights/); [Duolingo Guides: Quests](https://duolingoguides.com/what-is-a-quest-in-duolingo/)
- **Duolingo Monthly Quest / badge:** complete enough quests within the month to earn a collectible badge that can only be earned that month. Third-party guides put the requirement anywhere from 20 to 100 quests depending on the version. Official numbers were not found. — [Deconstructor of Fun (Apr 14, 2025)](https://www.deconstructoroffun.com/blog/2025/4/14/duolingo-how-the-15b-app-uses-gaming-principles-to-supercharge-dau-growth); [Lingoly: Monthly badge](https://lingoly.io/duolingo-monthly-badge/)
- **Duolingo Friends Quests (launched Sept 9, 2022):** one per week. Duolingo randomly pairs you with one mutual follower and assigns a random challenge, for example earn X XP or complete N perfect lessons. There are 5 days to finish it, and pairing happens Tuesdays after 1 p.m. EST if you did at least one lesson that week. Friends Quests are worth more "Quest Points" toward the monthly badge than daily challenges. You can opt out in settings, and preset "nudge" messages are available. In 2025 a universal matching system let learners without friends join. — [Duolingo Blog: Friends Quests](https://blog.duolingo.com/friends-quests/); [Duolingo Blog: 2025 Highlights](https://blog.duolingo.com/product-highlights/)

### Inferences
- **Daily count:** 3 dailies is the modal choice across Hearthstone, Apex, Fortnite (Remix) and Duolingo. For a learning app with short sessions, 3 dailies of about 5 to 10 minutes total is the safest default.
- **Weekly structure:** two designs dominate. (a) 3 to 7 distinct weeklies (Hearthstone 3, Apex 7), or (b) a "complete N dailies" milestone track (Marvel Snap 5/10/15/20/25, Pokémon GO 7 stamps, Duolingo monthly). Pattern (b) is simpler and reinforces daily habit without extra cognitive load.
- **Forgiveness is standard:** most designs include a carry-over or forgiveness mechanism (Hearthstone slot accumulation up to 3, the Marvel Snap 6-mission log and refill bank, non-consecutive Pokémon GO stamps). A blackjack app should let dailies stack up to 2 or 3 days, and count "days with any quest done" rather than requiring consecutive days.
- **Rerolls:** one free reroll per day per tier is standard (Hearthstone, Apex). Escalating-cost rerolls only make sense with a premium currency. For a learning app, 1 free daily reroll is enough. Event or "story" quests should be non-rerollable, like Hearthstone Legendary quests and Pokémon GO Special Research.
- **Refresh time:** a single fixed daily reset in the user's local time (Pokémon GO uses local midnight) is simplest. Weekly reset on a fixed day.

### Gaps
- Clash Royale's current quest structure was not researched in this pass.
- Official current Duolingo quest point values and monthly thresholds were not found. Only third-party guides exist, and they conflict.
- No source documented how the pool algorithms are weighted (for example, avoiding repeats or matching the player's preferred mode). The Hearthstone forums complain about reroll algorithms, but nothing official was found.

## Difficulty tiers, reward scaling, meta-quests, milestone tracks, season-pass linkage

### Takeaway
Games encode difficulty as explicit reward tiers. Typical spreads are about 1x / 1.1x / 1.25x for dailies (Hearthstone 800 to 1000 XP), 2x for "Hard" (Marvel Snap), and weeklies worth about 2 to 3x a daily. A completion bonus for finishing the full daily set (Genshin, Duolingo, Apex) and a milestone track for N completions are near-universal. Quests mostly feed a season or battle-pass track rather than paying out only currency.

### Cited Findings
- Hearthstone weeklies are drawn so that one comes from the 2500 XP tier and two from the 1750 XP tier, making the weekly set a deliberate mix of 1 hard and 2 medium. Dailies are 800 to 1000 XP, and weekly XP is about 2 to 3x a daily. Quest XP feeds the Rewards Track, which is the primary source of gold and rewards. — [Hearthstone Wiki: Quests](https://hearthstone.wiki.gg/wiki/Quests)
- In Marvel Snap, Hard missions are explicitly "double requirements for double rewards" (Normal is 50 Credits + 25 Season XP). — [Out of Cards guide](https://outof.cards/marvel-snap/guides/272-a-guide-to-daily-missions-in-marvel-snap/)
- Marvel Snap's weekly milestones escalate in rewards (100 → 200 → 250 Credits and 100 → 200 → 300 Season XP across 5/10/15 dailies). — [Marvel Snap Zone: Missions](https://marvelsnapzone.com/guides/missions/)
- In Apex, completing all dailies gives 10 Stars, which equals one Battle Pass level. Weeklies split into 3 that grant a full level and others worth 1 to 5 Stars. — [Apex Legends Wiki: Star](https://apexlegends.wiki.gg/wiki/Star); [EA](https://www.ea.com/news/battle-pass-challenges-details)
- Genshin and Duolingo both pay a bonus for completing the full daily set (Genshin's Katheryne bonus; Duolingo's 2025 boost for finishing all three). — [Duolingo 2025 Highlights](https://blog.duolingo.com/product-highlights/); [Prima Games](https://primagames.com/gaming/how-to-get-daily-commission-rewards-with-encounter-points-in-genshin-impact)
- Duolingo gives the social Friends Quest more Quest Points toward the monthly badge than solo dailies, so the harder, social quest is weighted higher. — [Duolingo Blog: Friends Quests](https://blog.duolingo.com/friends-quests/)
- Streak Freezes are sometimes handed out as random rewards for completing lessons, so a protection item doubles as a quest or chest reward. — [Deconstructor of Fun](https://www.deconstructoroffun.com/blog/2025/4/14/duolingo-how-the-15b-app-uses-gaming-principles-to-supercharge-dau-growth)

### Inferences
- **Suggested blackjack parameters:**
  - 3 dailies per day as 1 Easy (1x reward), 1 Medium (about 1.5x) and 1 Hard (about 2x).
  - A "complete all 3" bonus of about +50% of the day's total.
  - A weekly track of "complete N dailies" with milestones at about 5/10/15 out of a possible 21. Hitting the top tier should not require perfect daily attendance; 15 of 21 is about 70%.
  - Optionally 1 to 3 distinct weekly quests worth about 3x a daily.
- **Reward type:** rewards should flow into one progression track (cosmetic season track or levels) plus soft currency for the shop. That mirrors how Hearthstone, Marvel Snap and Apex route quests into a pass.
- **Weighting:** follow Duolingo's lead and weight learning-quality or social quests higher.

### Gaps
- No public source gave a principled formula for reward ratios. The ratios above are inferred from observed tiers.

## Evidence on retention and engagement, and pitfalls

### Takeaway
No publicly available controlled A/B result was found that isolates the retention lift from daily quests. The evidence is (a) correlational industry data (daily mechanics are over-represented in top-grossing games), (b) company statements (Duolingo credits streaks as its top DAU lever and says social quests bring learners back more often), and (c) a peer-reviewed survey showing players experience these mechanics as both motivating and as FOMO or chores. Blizzard's 2024 Hearthstone episode is a clear, documented case of over-tuning difficulty and having to revert.

### Cited Findings
- GameRefinery reports that daily mechanics (daily gifts, daily quests) are more common in the top-100-grossing iOS games than outside it, in the US, China and Japan. This is correlation, not measured lift. Mid-core games tend to gate daily rewards behind tasks or quests, while casual and casino games give gifts directly. — [GameRefinery: Appointment mechanics](https://www.gamerefinery.com/keep-your-players-in-game-with-appointment-mechanics/)
- An academic paper on daily quest design for mobile arcade games (Korea, 2019) notes that repetitive similar tasks risk "becoming tedious duties". — [KoreaScience PDF](https://koreascience.kr/article/JAKO201924064455372.pdf)
- **Frommel & Mandryk (2022)**, "Daily Quests or Daily Pests?" (Proc. ACM HCI, vol. 6, DOI 10.1145/3549489): a mixed-methods survey of 178 players. Engagement rewards (daily logins, repeatable challenges, seasonal items) were experienced as motivating by some and as FoMO-inducing, obligations or chores by others. The quantitative scales (motivation regulation, passion orientation) support players holding both views at once. The authors warn these mechanics can "encourage unhealthy play" and give design recommendations; the specific recommendations were not extracted. — [Utrecht University portal](https://research-portal.uu.nl/en/publications/daily-quests-or-daily-pests-the-benefits-and-pitfalls-of-engageme/)
- **Hearthstone Patch 29.2 (April 2024):** Blizzard made weekly quests harder but worth more XP because "many players routinely completed their Weekly Quests through their regular play." After backlash Blizzard said "we pushed too far," cut requirements back with a hotfix while keeping the extra XP, and later fully reverted requirements and XP to pre-29.2 values. Its stated principle: "reward players for their additional efforts, not make those rewards outside of their reach." — [Blizzard: Update on Weekly Quests](https://news.blizzard.com/en-us/article/24087316/update-on-weekly-quests); [Blizzard Watch (May 2024)](https://blizzardwatch.com/2024/05/23/hearthstone-weekly-quests-harder/); [Blizzard progression update (Oct 2024)](https://news.blizzard.com/en-us/article/24148498/hearthstone-progression-update)
- Fortnite players complained that the game was "becoming a chore" when the Chapter 6 changes slowed XP and merged quest tabs. — [GamesRadar](https://www.gamesradar.com/games/fortnite/fortnite-players-lament-the-battle-royale-is-becoming-a-chore-as-xp-changes-make-leveling-up-much-slower-in-chapter-6s-debut-season)
- PC Gamer published opinion pieces arguing that dailies are tedious and that games hurt themselves to inflate engagement numbers. These are opinion, not data. — [PC Gamer: Daily quests aren't fun](https://www.pcgamer.com/daily-quests-arent-fun-theyre-tedious); [PC Gamer: phoney engagement numbers](https://pcgamer.com/gaming-industry/im-so-sick-of-games-that-shoot-themselves-in-the-foot-just-to-boost-phoney-player-engagement-numbers)
- **Duolingo company statements:**
  - Its Q2 2024 shareholder letter says social features such as Friends Quests and Leaderboards encourage learners to come back more often. — [Duolingo 8-K Q2 FY2024](https://www.sec.gov/Archives/edgar/data/1562088/000156208824000203/q2fy24duolingo06-30x24shar.htm)
  - Learners who follow friends are "5.6x more likely" to finish their course (correlational). — [Duolingo Blog: Friends Quests](https://blog.duolingo.com/friends-quests/)
  - Learners with at least one Friend Streak are 22% more likely to complete their daily lesson. This is a different feature from quests. — [Duolingo Blog: Friend Streak](https://blog.duolingo.com/friend-streak/)
- Duolingo PMs call Streaks "the product's most important lever in driving DAUs." About 9M users have a streak of a year or longer. Improvements in current-user retention (CURR) drove about 4x DAU growth over roughly 5 years. Daily Quests are framed as encouraging longer sessions and daily retention, but no quest-specific numbers are given. — [Deconstructor of Fun (Apr 14, 2025)](https://www.deconstructoroffun.com/blog/2025/4/14/duolingo-how-the-15b-app-uses-gaming-principles-to-supercharge-dau-growth)
- **Learning-app evidence:**
  - In a gamified university app (St. Gallen, about 1,600 students), engagement measured as time spent and questions answered correlated significantly with learning success. — [Univ. St. Gallen](https://alexandria.unisg.ch/server/api/core/bitstreams/53413cfe-608f-4740-bf6e-8a9f6eb2f7f2/content)
  - A 2023 study of badges in a gamified accounting app found that instructor-set goal thresholds need data-driven evaluation to motivate optimally. — [Telematics & Informatics Reports 2023](https://publikationen.ub.uni-frankfurt.de/files/79036/1-s2.0-S2772503023000324-main.pdf)
  - Findings on badges and leaderboards are mixed across studies, with some showing gains and some none. — [Springer, J. Comput. Educ. 2025](https://link.springer.com/article/10.1007/s40692-025-00366-x)

### Inferences
- Expect quests to be one useful retention lever, not a transformative one. The strongest documented driver in the learning space is the streak plus social layer (Duolingo). Quests probably work best as the "what to do today" content that a streak counts.
- **Tuning rule from Hearthstone 2024:** dailies and weeklies should be completable through normal, healthy play. Do not raise requirements to force extra sessions. If most users already complete them, that is acceptable in a learning app, because the goal is habit formation, not revenue.
- **Pitfalls to avoid:**
  - Hard daily resets that wipe progress. Use carry-over and non-consecutive counting instead.
  - Long grind counts.
  - Quests tied to raw time or hands played.
  - Expiring, high-value rewards (FOMO).
  - Quests that push "play more hands" in a gambling-adjacent product. This is an extra concern here because volume-based blackjack quests could normalize gambling-style persistence. Prefer accuracy and review targets over volume targets.

### Gaps
- No published A/B lift for daily quests was found, from Duolingo or any game studio. Duolingo's widely cited streak and leaderboard experiments were not verified in this pass.
- The specific design recommendations in Frommel & Mandryk (2022) need the full PDF.
- No GDC Vault talk on quests was retrieved in this pass.

## Event quests: limited-time themed events, cadence and length

### Takeaway
Event and limited-time quests follow a monthly and seasonal rhythm. Examples are Duolingo's monthly badge (one calendar month, collectible only that month), Pokémon GO's monthly-rotating breakthrough reward, Hearthstone Legendary event quest chains (non-rerollable), and multi-week battle-pass seasons. Weekly co-op quests (Duolingo Friends Quest) run about 5 days.

### Cited Findings
- Duolingo Monthly Badges must be earned within the month they are offered, while Achievements can be earned anytime. — [Lingoly](https://lingoly.io/duolingo-monthly-badge/); [Duolingo Guides](https://duolingoguides.com/how-to-receive-monthly-badge-on-duolingo-the-next-month/)
- Duolingo Daily Quests can reference time-limited events, for example "complete one XP Ramp Up Challenge". — [Deconstructor of Fun](https://www.deconstructoroffun.com/blog/2025/4/14/duolingo-how-the-15b-app-uses-gaming-principles-to-supercharge-dau-growth)
- The Pokémon GO Research Breakthrough featured encounter rotates every month. — [Bulbapedia: Research Breakthrough](https://bulbapedia.bulbagarden.net/wiki/Research_Breakthrough)
- Hearthstone Legendary Quests are a special event quest series that cannot be rerolled. — [Hearthstone Wiki: Quests](https://hearthstone.wiki.gg/wiki/Quests)
- Duolingo Friends Quest runs a 5-day window each week. — [Duolingo Blog](https://blog.duolingo.com/friends-quests/)
- Frommel & Mandryk list seasonal items such as holiday skins among engagement rewards that some players experience as FoMO. — [Utrecht portal](https://research-portal.uu.nl/en/publications/daily-quests-or-daily-pests-the-benefits-and-pitfalls-of-engageme/)

### Inferences
- **Recommended cadence:**
  - A monthly themed challenge (for example, "December: Soft Hands Month", or a holiday theme) with a collectible badge for completing about 15 to 20 quests that month.
  - Optionally a 1 to 2 week mini-event, such as a 5 to 7 step themed quest chain, every 4 to 6 weeks.
- To limit FOMO, consider making past event badges earnable later as a lesser "archive" version, or keeping the threshold well below full attendance.

### Gaps
- No quantitative data was found on the best event length or how often events should run.
- Clash Royale and Marvel Snap event cadence were not researched.

## Quests that reward learning quality (accuracy, spaced review) rather than raw time

### Takeaway
The most transferable example is Duolingo's use of quality-based quest goals, such as "complete N perfect lessons" in Friends Quests, alongside XP goals. Little direct research compares quality-based with volume-based quests. The general gamification literature suggests goal thresholds should be calibrated from usage data, and that adaptive, performance-personalized gamification outperforms fixed schemes.

### Cited Findings
- Duolingo Friends Quest challenge types include earning a set amount of XP and completing a set number of perfect lessons, which mixes volume and accuracy goals. — [Duolingo Blog: Friends Quests](https://blog.duolingo.com/friends-quests/)
- Instructor-set learning goals (badge thresholds) should be evaluated with data to get an optimal motivational effect. — [Langenhagen 2023, Telematics & Informatics Reports](https://publikationen.ub.uni-frankfurt.de/files/79036/1-s2.0-S2772503023000324-main.pdf)
- A study cited secondhand found that only adaptive gamification (narrative plus performance-based personalization) significantly improved student outcomes, compared with competition or collaboration conditions. The year was not confirmed. — [Springer, J. Comput. Educ. 2025](https://link.springer.com/article/10.1007/s40692-025-00366-x)
- Engagement measured as questions answered correlated with learning success, so practice volume does matter. — [Univ. St. Gallen](https://alexandria.unisg.ch/server/api/core/bitstreams/53413cfe-608f-4740-bf6e-8a9f6eb2f7f2/content)
- Genshin 4.1 and Honkai: Star Rail let several different activities satisfy the same daily reward, an example of quest flexibility instead of forcing one task. — [Yahoo: Genshin 4.1](https://sg.news.yahoo.com/genshin-impact-to-get-new-daily-commissions-system-similar-to-honkai-star-rail-in-version-41-090941318.html)

### Inferences
- **Example quest pool for a blackjack trainer, by tier:**
  - Easy: "Finish 1 drill session", "Review 5 due flashcards".
  - Medium: "Play 20 hands at 90%+ basic-strategy accuracy", "Clear your spaced-review queue".
  - Hard: "Get 15 correct soft-hand decisions in a row", "Hit 95% on a counting drill at speed X".
- **Weekly quality quests:** for example, "Improve your weakest chart cell category", or "Review on 4 different days" (spacing, not cramming).
- **Avoid:** "Play 200 hands", "Win X chips", or anything tied to winning or money outcomes. Outcome-based quests reward luck and gambling-style persistence, not learning.
- **Adaptive targeting:** draw quests from the user's weak areas, such as spaced-review due items and error-prone hands. This matches the adaptive-gamification evidence.
- **Threshold calibration:** after launch, set accuracy thresholds from observed completion rates. A reasonable target is about 70 to 85% completion for Easy and Medium and about 40 to 60% for Hard. This is an inferred design heuristic, not a sourced figure.
- **Session cap:** cap quest-relevant progress per day, as Pokémon GO allows only 1 stamp per day, so quests reward regular spaced practice rather than marathon sessions.

### Gaps
- No controlled study was found comparing accuracy-based and volume-based quests.
- No source was found on quests that explicitly reward spaced review. This is design inference from spaced-repetition principles, which were not researched here.
- Duolingo's internal findings on XP farming and leaderboard gaming were not verified in this pass.
