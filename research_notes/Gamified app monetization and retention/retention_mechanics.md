# Retention and Engagement Mechanics of Duolingo and Similar Gamified Learning Apps

Scope note: about 20 search/fetch calls. Primary sources are Duolingo's blog, Duolingo research papers (KDD 2020 PDF read in full text), Lenny's Newsletter (Jorge Mazal, Feb 2023), Duolingo investor filings, and the Silverman & Barasch JCR 2023 abstract. Most numbers are company-reported A/B results given as **relative** changes. Third-party aggregator numbers are flagged.

## Streaks: mechanics (freeze, repair, Society, milestones) and reported effects

### Takeaway
Streaks are Duolingo's best-documented retention lever. The biggest win came from making streaks **easier to keep**: the streak was decoupled from the daily XP goal, and Streak Freezes and repair were added. Afterwards, the share of DAU on 7+ day streaks went from about 1/3 to more than 1/2. Individual streak tweaks usually move DAU by under 2% each, but they compound.

### Cited Findings
- **Decoupling the streak from the daily goal** (shipped around late 2019; reported Nov 19, 2020). A streak now needs only one lesson a day, not the chosen XP goal. Reported relative changes: +3.3% D14 retention, +1% daily active learners, +10.5% daily learners on a streak (+19% for new learners), and more than 40% more learners on a 7+ day streak. Before the change, almost 40% of learners who were active two days in a row without a streak had picked the "intense" goal. The change reduced how many learners hit their daily goal (no figure given). — [Duolingo blog, "Improving the streak" (2020)](https://blog.duolingo.com/improving-the-streak)
- **Share of DAU on 7+ day streaks:** "just over half" of daily learners, up from about a third a year earlier (2020). — [Duolingo blog (2020)](https://blog.duolingo.com/improving-the-streak). Mazal (Feb 2023) says this share rose almost 3x over roughly 2018–2022, to more than half of DAU. — [Lenny's Newsletter, Mazal (2023)](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth)
- **Absolute scale:** "over 6 million people on a streak of 7 days or more" as of Jan 31, 2022 — [Duolingo blog (2022)](https://blog.duolingo.com/how-duolingo-streak-builds-habit). Duolingo's FY2025 10-K is reported to cite about 43 million DAU with a 7+ day streak (search snippet; I did not open the filing to verify) — [Duolingo 10-K FY2025](https://www.sec.gov/Archives/edgar/data/1562088/000162828026012494/duol-20251231.htm). An aggregator claims more than 5 million users with 1+ year streaks; this is unverified. — [SQ Magazine](https://sqmagazine.co.uk/duolingo-statistics/)
- **Observational correlates (not causal):** learners with a 7-day streak are 2.4x more likely to use Duolingo the next day than learners without a streak — [Duolingo blog (2020)](https://blog.duolingo.com/improving-the-streak). Learners who reach a 7-day streak are 3.6x more likely to complete their course — [Duolingo blog (2022)](https://blog.duolingo.com/how-duolingo-streak-builds-habit)
- **Streak milestone animation** (celebrating milestones such as day 7): +1.7% in brand-new learners still active 7 days later (reported 2022). — [Duolingo blog (2022)](https://blog.duolingo.com/how-duolingo-streak-builds-habit)
- **Equipping up to 2 Streak Freezes** instead of 1: +0.38% relative daily active learners (2022). A freeze refill costs 400 gems (in-app currency) in a screenshot. — [Duolingo blog (2022)](https://blog.duolingo.com/how-duolingo-streak-builds-habit)
- **Streak Wager** (bet gems that you will keep a streak going): statistically significant gains in D1, D7 and D14 retention, with D7 up 14% (secondary citation of a Duolingo growth test; the original post was not fetched). — [search summary citing Duolingo/Lenny](https://www.lennysnewsletter.com/p/duolingo-streaks)
- **Rationale:** a small streak feels fragile in percentage terms. Going from 2 to 3 days is a 50% increase in length, while 200 to 201 is 0.5%. Early-streak protection and celebration therefore matter most. The blog openly credits loss aversion. — [Duolingo blog (2022)](https://blog.duolingo.com/how-duolingo-streak-builds-habit)
- **Streak Revival event (June 2025):** eligible learners could restore their longest-ever streak by opting in and doing 3 lessons. 15.4M learners revived streaks, including nearly 8M with no active streak when the event began. Duolingo called it "one of our most successful campaigns." — [Duolingo Q2 2025 shareholder letter (via search snippet)](https://investors.duolingo.com/static-files/961ce633-3cee-49d0-bd7a-2c63731d45fb)
- **Mazal (2023):** a 10-day streak "substantially" reduced drop-off; no number given. — [Lenny's Newsletter (2023)](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth)
- **Freeze churn claim:** a portfolio case study says freezes cut churn 21% for at-risk users. No primary source, so this is unverified. — [jiwonvyoo portfolio](https://jiwonvyoo.github.io/portfolio/case/duolingo/duo.html)
- **Other app:** Busuu saw a 15% rise in total sessions the month after adding streaks (Sensor Tower, observational). — [Sensor Tower](https://sensortower.com/blog/duolingo-streak-feature-app-engagement-growth)

### Inferences
- For a blackjack app, set the streak bar low (one short drill or hand set per day), separate from any optional daily XP goal. Give out 1–2 free freezes early, and celebrate days 3, 7, 14, 30, 100 and so on. Each tweak is small, but together they produced Duolingo's roughly 1/3 to 1/2 shift in 7+ day share.
- Repair and revival events look like high-return reactivation tools, and the Silverman & Barasch research below supports offering repair.

### Gaps
- I found no primary quantitative data on Streak Society (the VIP tier at 365+ days) or on paid Streak Repair conversion.
- The Streak Wager number is from a secondary citation; the original Duolingo post was not fetched.

## Leagues, leaderboards, social (Friends Quests, Friend Streaks), quests, badges, XP boosts, chests

### Takeaway
Leaderboards (weekly leagues) were Duolingo's single largest documented engagement win: +17% learning time and 3x more highly engaged learners. Social features show strong correlations but have no published controlled lifts. Leagues bring the main downsides: XP farming, cheating and burnout.

### Cited Findings
- **Leaderboards (first tested 2018):** overall learning time +17%, and "highly engaged learners" (1+ hour a day, 5 days a week) tripled. D1 and D7 retention improved with statistical significance. — [Mazal, Lenny's Newsletter (2023)](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth). Luis von Ahn has separately been quoted saying leaderboards "single-handedly increased the time that people spent on Duolingo by 20%" (TechCrunch; the article was not fetched). — [TechCrunch](https://techcrunch.com/?p=2145036)
- **League mechanics (blog, May 3, 2023):** 10 leagues today, up from 5 originally. Diamond is the top league. A new league starts every Sunday in the user's time zone. Learners are matched with people who have **similar study habits and a similar time zone**. The top 10 Diamond learners become eligible for the Diamond Tournament (quarterfinals, semifinals, finals; not held every week). Users with illegitimate XP are removed. Users opt out by turning off "Make My Profile Public." — [Duolingo blog (2023)](https://blog.duolingo.com/duolingo-leagues-leaderboards/)
- **Gamification that failed:** an early "moves counter" style gamification test was "completely neutral," with no change in retention or DAU. Referrals added only +3% new users. — [Mazal (2023)](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth)
- **Friend Streaks:** learners with at least 1 friend streak are 22% more likely to complete their daily lesson, and the effect grows with more friend streaks. The cap is 5, because a data-science review found users with 5+ friend streaks are already well-retained and few in number. — [Duolingo blog, Friend Streak product lessons](https://blog.duolingo.com/product-lessons-friend-streak/)
- **Friends:** learners who add friends are 5.6x more likely to finish their course (correlational). — [Duolingo blog](https://blog.duolingo.com/friends-social-features/). Q2 2024 shareholder letter: "over half of our DAUs now follow at least one friend," and Friends Quests and Leaderboards are credited with bringing learners back. — [Duolingo Q2 2024 8-K/letter](https://www.sec.gov/Archives/edgar/data/1562088/000156208824000203/q2fy24duolingo06-30x24shar.htm)
- **Friends Quests** pair users only with **active** friends, which means participants are self-selected and any participant vs. non-participant comparison is biased. — [Duolingo blog](https://blog.duolingo.com/friends-quests/)
- **Score system (2024):** Duolingo moved emphasis off XP and leagues toward course progress (per a fan newsletter). — [Duoplanet newsletter](https://newsletter.duoplanet.com/posts/did-duolingo-go-stale-in-2024)

### Inferences
- A small app cannot fill leagues of real peers early on. Possible substitutes are cohort-matched leagues, "similar study habits" matching, or asynchronous leaderboards against friends or seeded bots (disclosed honestly). Promotion and demotion give a weekly reason to come back on top of the daily streak.
- In a blackjack-strategy context, award XP for **accuracy on harder decisions** (soft totals, splits, deviations), not raw volume. This blunts farming of easy hands.

### Gaps
- I found no primary numbers for daily quests, monthly challenges and badges, XP Boosts, chests or Legendary levels. Duolingo has posts on these (for example [achievement badges](https://blog.duolingo.com/achievement-badges)), but none returned impact figures.
- Exact league group size (commonly said to be 30) and promotion/demotion counts were not confirmed from a primary source.

## Push notifications, email, widgets

### Takeaway
Duolingo's bandit-optimized reminder copy gave +0.5% DAU and +2% new-user retention over a strong baseline. The novelty "recency penalty" matters: reusing the same message costs about 0.5% of reward. Widgets are reported to work well but have no published lift.

### Cited Findings
- **Yancey & Settles, "A Sleeping, Recovering Bandit Algorithm for Optimizing Recurring Notifications," KDD 2020.** The Recovering Difference Softmax algorithm picks among notification templates for practice reminders. In a 2-week online test against a strong baseline it produced **+0.5% DAU, +0.4% lessons completed, and +2% new-user recurring retention**. The authors suggest new users are more sensitive because their habits are still forming. — [Paper PDF](https://research.duolingo.com/papers/yancey.kdd20.pdf)
- **How it works (same paper):**
  - The reward is the user opening the app within 2 hours of the notification.
  - "Sleeping" arms handle templates a user is not eligible for, such as streak-specific copy.
  - A recency penalty, decaying with a 15-day half-life, models novelty wearing off and recovering.
  - Always reusing the last template hurt reward by 0.5%.
  - The offline estimate predicted a 1.9% lift in 2-hour conversion; this was diluted online by organic activity.
  - A released dataset holds about 200M practice-reminder notifications over 35 days.
  - New templates can be added without special handling, because softmax exploration samples them.
  — [Paper PDF](https://research.duolingo.com/papers/yancey.kdd20.pdf); [Duolingo blog, "Hi, it's Duo"](https://blog.duolingo.com/hi-its-duo-the-ai-behind-the-meme/)
- **Mazal (2023):** notification work produced "dozens of small- and medium-size wins" that compounded into DAU gains year after year; no single number is given. — [Lenny's Newsletter (2023)](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth)
- **iOS widget (launched July 2022):** shows whether today's lesson is done plus the streak count. Learners called it as effective as push notifications. Half of learners with the widget installed have a 6+ month streak (selection effect). — [Duolingo blog, widget](https://blog.duolingo.com/widget-feature)

### Inferences
- A small app can approximate this cheaply with 5–15 reminder templates, Thompson or softmax selection on "opened within 2 hours," and a rule never to repeat the same template within about 2 weeks. Time the reminder around the user's usual practice time and add a streak-at-risk evening nudge.
- Expect small DAU lifts, but meaningful new-user retention gains.

### Gaps
- No public Duolingo numbers on email cadence, send-time optimization lifts, or notification opt-out and fatigue rates.

## Onboarding

### Takeaway
Duolingo's best-documented onboarding win is delayed signup plus softened signup walls: +8.2% DAU combined. Letting users finish a lesson before registering is the core pattern.

### Cited Findings
- Letting users "do a lesson, see the set of skills" before signing up "increase[d] those sign-up metrics significantly." Later optimization of hard and soft walls, including replacing a prominent button with a subtle "Later," gave **+8.2% DAU** (Gina Gotthilf, ex-VP Growth; First Round Review, original c. 2016–17, outside the 2020–26 window). — [First Round Review](https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker)
- Trade-off: users who never sign up provide no email for re-engagement. A 20% signup-lift figure in secondary blogs has no clear primary source. — [Taplytics](https://taplytics.com/blog/duolingo-ab-test-onboarding)
- Goal-setting caution: users who picked "intense" daily goals were less likely to keep streaks. Over-ambitious goals set at onboarding hurt retention. — [Duolingo blog (2020)](https://blog.duolingo.com/improving-the-streak)

### Inferences
- For blackjack, open with an immediate hands-on drill ("play 10 hands, see your accuracy") before asking for an account. Offer a placement quiz (for example, "do you know basic strategy?") to skip known material. Default to a modest daily goal.

### Gaps
- I found no primary 2020–26 numbers on Duolingo placement-test or goal-screen experiments, or on its "aha moment" definition.

## Learning design for long-term retention

### Takeaway
Duolingo's spaced-repetition model (half-life regression) improved daily engagement by 12%, as well as recall prediction. Practice that adapts to forgetting is both a learning tool and a retention tool.

### Cited Findings
- **Settles & Meeder, ACL 2016, "A Trainable Spaced Repetition Model for Language Learning":** half-life regression (HLR) cut recall-prediction error by more than 45% compared with baselines (Leitner, Pimsleur). Its error was nearly half that of Leitner. Deployed in an operational study, it **improved daily student engagement by 12%**. Dataset: 13M learning traces. (Pre-2020, but still the foundation.) — [ACL paper](https://preview.aclanthology.org/landing_page/P16-1174); [Duolingo blog](https://blog.duolingo.com/how-we-learn-how-you-learn)
- A 2026 PMLR paper revisits HLR with mixed effects plus random forests for personalized, explainable scheduling. — [Ilídio et al. (2026)](https://proceedings.mlr.press/v339/ilidio26a.html)
- Duolingo reframed its success metric toward "time spent learning well" (TSLW) rather than raw time. — [Duolingo blog](https://blog.duolingo.com/time-spent-learning-well)

### Inferences
- Blackjack strategy is a small, finite set of items: about 290 hard, soft and pair cells, plus deviations. That makes it well suited to per-cell spaced repetition with a "mistakes review" queue. Pace new content (for example, hard totals, then soft, then pairs, then surrender, then deviations, then counting) so the curriculum lasts months, and mix earlier cells back in as reviews.

### Gaps
- I found no primary metrics on Practice Hub, unit reviews or the 2022 path redesign.

## What similar apps do

### Takeaway
Streaks are nearly universal (Brilliant, Chess.com, Headspace, Busuu), but Duolingo is almost the only company that publishes experiment numbers.

### Cited Findings
- Brilliant defines a streak as consecutive days of learning. — [Brilliant help](https://brilliant.org/help/using-brilliant/what-is-a-streak)
- Chess.com launched a Streaks feature. Its Q1 2026 board report lists it as a highlight, with no numbers. — [Chess.com announcement](https://www.chess.com/news/view/announcing-streaks); [Chess.com Q1 2026 board report](https://www.chess.com/board-reports/2026-q1)
- Busuu saw +15% sessions after adding streaks. — [Sensor Tower](https://sensortower.com/blog/duolingo-streak-feature-app-engagement-growth)

### Gaps
- I found no public quantitative results for Elevate, Mimo, Drops, Memrise or Headspace mechanics.

## Downsides: streak anxiety, burnout, gaming XP, and mitigation

### Takeaway
Peer-reviewed evidence (JCR 2023) shows that a broken streak lowers later engagement, and that offering **repair** softens the effect. League XP races invite farming and cheating. The mitigations are freezes and repair, low streak bars, rewards weighted toward progress, and removing cheaters.

### Cited Findings
- **Silverman & Barasch, "On or Off Track: How (Broken) Streaks Affect Consumer Decisions," JCR 49(6), Apr 2023, 7 studies:**
  - Intact logged streaks increase later engagement compared with streaks shown as broken.
  - The effect depends on how behavior is *represented* in the log, independent of what the user actually did.
  - It is stronger when users blame themselves for the break, and weaker when repair is possible.
  - Users will pay a cost to repair a streak, or switch to a new activity (for example, a new language) rather than rebuild.
  - Barasch says messaging that highlights the failure "typically doesn't work."
  — [CU Boulder summary](https://www.colorado.edu/business/faculty-research/2023/04/19/or-track-how-broken-streaks-affect-consumer-decisions); [UDaily (2024)](https://udel.edu/udaily/2024/march/power-of-streaks-motivation-jackie-silverman)
- Duolingo concedes that breaking a streak "can have the opposite effect" and feel demotivating. — [Duolingo blog (2022)](https://blog.duolingo.com/how-duolingo-streak-builds-habit)
- **XP farming and cheating:** users repeat easy lessons, exploit timed practice, use bots, and sandbag a week to get placed in an easier league. Some report burnout or quitting, or skipping days rather than "waste" XP Boost windows. — [Kotaku (2023)](https://kotaku.com/duolingo-app-cheats-hacks-leagues-xp-why-duohacker-1850506482); [Android Authority](https://androidauthority.com/duolingo-xp-boost-ux-trap-3674572); [Duolingo Guides](https://duolingoguides.com/duolingo-leagues-cheating/)
- A qualitative academic case study (2022) documents gamification "misuse" in a language app: learners optimizing for points over learning. — [arXiv 2203.16175](https://ar5iv.labs.arxiv.org/html/2203.16175)
- Duolingo removes learners with illegitimate XP from Leaderboards, and users can opt out via a private profile. — [Duolingo blog (2023)](https://blog.duolingo.com/duolingo-leagues-leaderboards/)

### Inferences
- A blackjack app has an extra ethical dimension, because streak and loss-aversion mechanics sit close to gambling psychology. It would be prudent to:
  - avoid wagers that use real money or anything convertible
  - keep virtual chips clearly non-monetary
  - frame streaks around learning accuracy
  - offer free repair rather than shaming broken streaks
  - weight XP by decision difficulty and correctness, so farming easy hands pays little

### Gaps
- I found no peer-reviewed measurement of churn caused specifically by streak anxiety in learning apps. Duolingo's own data on users quitting after a streak break is not public.
