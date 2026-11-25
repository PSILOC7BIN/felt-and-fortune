# Felt & Fortune

## Approved direction, November 23, 2026 (supersedes the September 1970s palette)

### Product

Free blackjack training, simulations, results tracking, bankroll collaboration, and community tools. No subscriptions or payment gates. Educational simulations and user-entered records, not wagering or casino transactions.

**Sign-up is now an AI-planned learning path.** "Get started" opens a 10-question multiple-choice survey (experience, goal, four real placement checks, hardest skill, game type, daily time, learning style). The Coach planner turns the answers into a personal plan, and the visitor creates an account to save it. The plan drives **My Path** (`/learn`), the app's home, with a winding lesson path, XP, streaks, and a daily goal. Each unit links to its Practice tool.

### App-first structure (November 23, second pass)

The learning app is the whole site. Signed-in visitors land on **Learn**; one shell (rail on desktop, bottom tab bar on phones) holds **Learn, Practice, Track, Community, Profile**. Every older page lives inside it and old `/dashboard/...` addresses redirect.

**Seven tools, one job each** (each is a standalone Practice page *and* a building block inside lessons):
Strategy Trainer (chart built in) · Count Trainer (cards dealt at speed) · Deck Estimator (rotatable 3D tray, half-deck answers only) · True Count Trainer (timed) · Index Trainer (with insurance) · Shoe Challenge (server-dealt six-deck shoe, server-graded, three hearts, leaderboard) · Bankroll Simulator. Removed as duplicates: Interactive Tutorial, separate Charts page, Checkouts, Career Mode, Dashboard.

Lessons embed the tools (live hands, flashing counts, the 3D tray, timed conversions, bet sizing, mini-shoe scenarios) and run up to ~25 interactions. Browser trainers use `public/bj.js`, a port of `engine.py` that `tests/test_js_engine.py` checks on every hand.

### The "AI" planner

The planner is a transparent, rule-based expert system (`coach.py`, `build_plan`). No external AI service is used, by choice. It:

- assigns one of four goal-based tracks (Smart Player, Strategy Master, Card Counter, Advantage Pro) from the learner's goal and proven skill (`choose_track`);
- places the learner in that track, and tests them out of units only when the placement checks back up their self-reported level;
- adds focus-area review lessons from missed checks and the learner's stated hardest skill;
- sets a daily XP goal and finish date from their available time;
- adds game-specific notes (shoe, pitch, or online) and a goal milestone;
- explains every decision in a "Why this plan" list.

Each track (`tracks.py`) has 8 units, 30 lessons, and roughly 400 graded questions (kept within 15% of one another by a test). Learners can browse and switch tracks from Learn (`POST /api/path/track`); XP and streaks carry over and progress is saved per track. Old single-path plans are rebuilt from the stored answers on load. The original 11-unit lessons live on in `coach.py` as a library the tracks reuse. Practice questions are generated from the strategy engine (`engine.py`), so basic-strategy and index answers always match the charts and drills.

### Visual direction

A fusion of Apple's system design and a playful learning-app feel, applied across the whole site:

- **Apple:** system colors (`#007AFF` blue, `#34C759` green, `#FF9500` orange, `#AF52DE` purple, `#5856D6` indigo, `#FF2D55` pink, `#F2F2F7` background), SF / system fonts with rounded headlines, frosted-glass navigation, segmented controls, and an iMessage-style messages view.
- **Learning app:** chunky 3D buttons with a pressable bottom edge, big tappable answer tiles, a zigzag lesson path, a progress bar, green and red answer sheets, XP, streaks, and short synthesized sound cues (Web Audio, mutable).
- **Mascot:** Ace, an original friendly playing-card character with several moods. Do not use other companies' mascots, sounds, or branding.
- Banner and button text uses deeper shades of the system colors to keep contrast readable.

## Current engineering status

The workspace contains a Python/SQLite application and a browser interface. Prototype features include authentication, the onboarding survey and planner, the learning path, session tracking, CSV import/export, bankroll membership, server-checked drills, simulations, forum records, directory reports, and direct messages. These are prototype implementations, not a completed production release.

The test suite has 61 passing tests, including planner, learning-path, practice, grading, Shoe Challenge, and JS/Python engine parity tests. Lessons and practice send transcripts that the server re-grades (questions are still dealt in the browser). Also built: Weak Spots practice, a daily-goal setting, dark mode (Profile → Appearance), a full-table Count Trainer mode, an in-app feedback form with `scripts/study_report.py` and `docs/user-testing.md`, and deployment files (`DEPLOY.md`). SMTP account recovery still requires configuration.

The existing SQLite filename is retained to preserve local records. The name does not appear in the interface. Use `scripts/qa_server.py` (port 8001) for browser testing against an isolated database.
