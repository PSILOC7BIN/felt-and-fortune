# Felt & Fortune site audit (app-v2 branch, 2026-11-25)

Method: crawled every signed-in route in the browser (no JavaScript errors), reviewed the code and data model, and compared against the research notes in this folder and the two earlier reports.

## Already strong
- Personalized onboarding: 10-question survey with 4 real skill checks; goal-based track assignment; test-outs; "why this plan" explanations.
- Four tracks × 38 lessons (152), 40 unit checkpoints (90% on two separate days), 2-new-lessons-a-day pacing, spaced review via Weak Spots.
- Seven single-purpose trainers graded on the server by the strategy engine (decision graded, not outcome); JS/Python engine parity test.
- Economy: Pro plan (test billing), Energy only on standalone practice, earned-only Stars, freezes and repair, quests (daily/weekly/monthly event), weekly leagues, cosmetics with live preview, sets, no randomized paid rewards.
- Casino map: 145 casinos, 300 games, sourced and dated, conflict warnings.
- Responsible play page, 18+ signup, honest house-edge messaging; themes (Midnight Felt, Daylight); new answer reactions and sound engine.
- 74 automated tests.

## Problems found
1. **Free-claims leftovers** (fixed in this pass): hero pill "Free", "No subscription. No trial clock.", FAQ "Is it really free? Yes", "Free forever" badge, "Create Your Free Account", footer "no payments", About/Terms "free application", page title "Free Forever".
2. **Two overlapping directories**: Community has "Casino Map" (curated) and "Player Reports" (old user-submitted "Game Directory" with its own list/map toggle). Confusing; reports should attach to casinos on the map.
3. **Track tab is a real-money casino session/profit tracker** (sessions, bankrolls, profit charts, CSV import). It predates the learning product, overlaps poorly with it, and is the feature most likely to read as a "gambling aid" under Apple 5.3.4 and to conflict with responsible-play positioning. Consider removing from the app build or reframing as a "practice log" / variance journal.
4. **Level naming confusion**: Profile shows "Level: Counter" while the learner is on the Smart Player track (level comes from placement, not progress).
5. **No skill rating**: progress is XP and lesson counts; research suggests a visible skill number (accuracy score or Elo-style rating per skill) is what proves learning and drives retention.
6. **No account deletion in-app** (Apple requires it; Google requires a web deletion URL); **no data export**.
7. **No email infrastructure**: password reset needs SMTP; trial-ending reminders (NY/CA law), receipts, and win-back/streak emails are impossible today.
8. **No reminders/notifications** (web push or email): the single biggest proven retention lever after streaks.
9. **No analytics/funnel measurement**: cannot measure visitor→signup→trial→paid or A/B test anything.
10. **No public free tools/SEO pages**: strategy charts, house-edge calculator, count trainer demo are behind login; competitors (Wizard of Odds, BJA mini-course) use free tools/content as the acquisition funnel.
11. **Community is empty** (forum, messages) with no seeding, moderation tools, or reasons to post; no friends/following, so leagues have no social layer.
12. **About page still describes "an independent student project" referencing AP Toolbox**; Terms/Privacy are provisional and do not cover billing, refunds, or data deletion.
13. **No onboarding after signup** (first-run tour of Learn/Practice/Quests/Store); new tabs (Quests, Store) are unexplained.
14. **No mistake history**: learners can't review the exact hands they missed (Weak Spots drills skills, not the actual missed decisions).
15. **Mobile web layout** is a scaled desktop layout (the user's own test confirmed); a thumb-first app layout is deferred until the site is complete.
16. **Performance**: ~12 CSS and ~10 JS files loaded unbundled; fine on desktop, slower on mobile networks.
17. **Content format**: text-and-drill only; no short video or animated explainers, which competitors (BJA, poker trainers) use heavily.
