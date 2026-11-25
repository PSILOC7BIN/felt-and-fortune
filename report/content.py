"""Final report content. Edit this file, then run `python report/build_report.py`.

Inline markup: **bold**, *italic*, and citations as [@key] or [@key1,@key2] (numbered automatically,
in order of first citation). Anything in [square brackets] without @ is a placeholder to fill in.

Block types:
  ('h1', text) ('h2', text) ('h3', text)        headings (auto-numbered by the template)
  ('p', text)                                    paragraph (first after a heading is unindented)
  ('list', [items])                              numbered list
  ('figure', [image paths], width_in, caption, alt)   one image, or several side by side
  ('table', caption, col_widths_in, rows)        first row is the header
  ('algorithm', caption, [lines])                pseudocode
"""

META = {
    'title': 'Felt & Fortune: A Personalized, Gamified Learning Path from Blackjack Basics to Advantage Play',
    'short_title': 'Felt & Fortune',
    'subtitle': 'Final Project Report',
    'authors': [('Henry Chambers', '[Course number and name], [Institution], [email]')],
    'abstract': (
        'Free blackjack training tools exist, but they are scattered and rarely tell a beginner where to start. '
        'Felt & Fortune is a free, educational web application built around a personalized learning path. New users answer a ten-question '
        'survey that includes four real skill checks, and a transparent rule-based planner turns the answers into a '
        'plan (one of four tracks, a starting point, focus areas, a daily goal, and a finish date) with a reason for '
        'each decision. Each track is a gamified path of 30 lessons that embed seven single-purpose '
        'training tools, including a rotatable 3D discard tray, all driven by one verified strategy engine. This report '
        'describes the design, the development process, including two pivots (toolbox to coach, then coach-first app), '
        'and an evaluation based on 61 automated tests and cross-device walkthroughs.'
    ),
    'ccs': ['Applied computing → Interactive learning environments', 'Human-centered computing → Web-based interaction',
            'Computing methodologies → Knowledge representation and reasoning'],
    'keywords': 'gamification, adaptive learning, expert systems, onboarding, blackjack, web applications',
    'acm_ref': ('Henry Chambers. 2026. Felt & Fortune: A Personalized, Gamified Learning Path from Blackjack Basics '
                'to Advantage Play. Final project report, [Course number and name], [Institution].'),
}

BODY = [
    ('h1', 'Introduction'),
    ('p', 'Blackjack is one of the few casino games in which skill changes the long-run result. A player who follows '
          'basic strategy cuts the house edge to roughly half a percent in a good game [@baldwin,@wizard], and a player '
          'who also tracks the cards can shift the edge in their favor [@thorp]. The skills build on each other: card '
          'values and dealer rules, then basic strategy, then a running count, a true count, betting with the count, '
          'and finally count-based changes to strategy, known as index plays [@wong,@schlesinger].'),
    ('p', 'Free resources already cover each skill [@aptoolbox,@bjtools], but a set of tools does not tell a beginner '
          'where to start or an experienced player what to skip. Felt & Fortune therefore puts a coach in front of the '
          'tools (Figure 1). It contributes:'),
    ('list', [
        'A ten-question onboarding survey that combines experience, goals, and schedule with four real placement checks.',
        'A transparent rule-based planner that assigns one of four equal-sized tracks, places the learner, and explains why.',
        'Seven single-purpose training tools, embedded in a gamified lesson path and available on their own, all '
        'driven by one strategy engine so answers cannot drift from the charts.',
    ]),
    ('figure', ['figures/survey-placement.jpg', 'figures/plan-reveal.jpg', 'figures/lesson-feedback.jpg'], 1.3,
     'Figure 1: The onboarding flow on a phone. Left: a placement check. Center: the generated plan with its '
     'explanations. Right: instant feedback in a lesson.',
     'Three phone screenshots. Left: the mascot asks the best play for 16 against a dealer 10, over a green card table '
     'with answer tiles. Center: a plan screen assigning the Smart Player track, with level, daily goal, finish date and goal tiles. Right: a lesson '
     'question with the correct answer, Stand, highlighted in green and a “Nice!” feedback panel.'),

    ('h1', 'Background and Related Work'),
    ('h2', 'Blackjack strategy and card counting'),
    ('p', 'Baldwin et al. derived the first near-optimal blackjack strategy in 1956 [@baldwin]. Thorp showed that '
          'tracking removed cards can give the player an edge [@thorp], and later systems such as Hi‑Lo simplified '
          'counting to one running total: +1 for 2–6, 0 for 7–9, and −1 for tens and aces [@wong]. Dividing the running '
          'count by the decks remaining gives the true count, which drives both bet size and a short list of strategy '
          'deviations [@schlesinger]. Felt & Fortune’s engine implements basic strategy for four to eight decks and 17 '
          'common Hi‑Lo indices for six-deck, dealer-stands-on-soft-17 games.'),
    ('h2', 'Existing tools'),
    ('p', 'AP Toolbox bundles training, simulation, and tracking behind a subscription [@aptoolbox]; Blackjack.tools '
          'offers similar tools free [@bjtools]. This project’s contribution is therefore the personalized path, not free access.'),
    ('h2', 'Gamified and adaptive learning'),
    ('p', 'Deterding et al. define gamification as the use of game design elements in non-game contexts [@deterding], '
          'and Hamari et al. found mostly positive but context-dependent effects [@hamari]. Language apps use practice '
          'data to personalize review [@settles], and tutoring systems estimate what a learner already knows [@corbett]. '
          'Felt & Fortune’s planner follows the rule-based expert-system tradition [@buchanan].'),

    ('h1', 'System Design'),
    ('h2', 'Architecture'),
    ('p', 'A single-page application in plain HTML, CSS, and JavaScript talks to a Python server built only on the '
          'standard library, which handles authentication, permissions, validation, simulations, and the learning-path '
          'and practice APIs. SQLite stores accounts, bankrolls, sessions, plans, lesson and practice progress. The '
          'domain logic lives in `engine.py` (strategy, counting, simulation) and `coach.py` (survey, planner, '
          'curriculum). The browser’s trainers use `bj.js`, a JavaScript port of the engine that a test checks against '
          'the Python version on every hand. The project has no third-party dependencies.'),
    ('h2', 'Onboarding survey'),
    ('p', '“Get started” opens a full-screen survey led by Ace, an original playing-card mascot (Figure 1, left). Ten '
          'multiple-choice questions appear one at a time: experience, goal, four placement checks, hardest skill, game '
          'type, daily time, and learning style. The checks are real decisions (hard 16 against a 10, soft 18 against a '
          '9, a Hi‑Lo running count, and a true-count conversion), each with a “Not sure yet” option. An account is '
          'created only after the learner has seen their plan.'),
    ('h2', 'The Coach planner'),
    ('p', 'The planner is a small expert system, chosen over machine learning or an external AI service for '
          'transparency and zero running cost. It assigns a track by goal and proven skill (Algorithm 1), then places the '
          'learner sequentially: self-reported '
          'experience moves a learner forward only when the matching checks are also correct, and a stage is skipped '
          'only if every earlier stage is too. A learner who claims to count but misses the count check gets extra '
          'counting review instead. Table 1 lists the planner’s other rules.'),
    ('table', 'Table 1: How the remaining survey answers shape the plan', [1.8, 4.2], [
        ['Survey signal', 'Plan decision'],
        ['A missed check, or the hardest skill', 'Adds a focus-review lesson to the matching unit(s).'],
        ['Daily minutes', 'Lessons per day = minutes ÷ 5; daily goal = 15 XP per lesson; finish date from the remaining lessons.'],
        ['Game type; learning style', 'Adds unit notes (e.g., online games reshuffle); adjusts questions per block.'],
    ]),
    ('algorithm', 'ALGORITHM 1: Track choice and placement', [
        'understand → Smart Player;  count → Card Counter',
        'play smarter → Strategy Master if strategy proven, else Smart Player',
        'edge → Advantage Pro if true count proven, else Card Counter if strategy proven, else Strategy Master',
        'start ← unit 1; while start’s placement check is proven: start ← next unit',
    ]),
    ('p', 'Each rule that fires adds a sentence to a “Why this plan” list (“You got both strategy checks right, so '
          'you’ll test out of the basic strategy units and start counting.”), shown on the plan screen and in the '
          'path’s sidebar. Learners can browse and switch tracks at any time; XP and streak carry over, and progress is saved per track.'),
    ('h2', 'Seven tools, one job each'),
    ('p', 'An audit found overlapping tools (separate chart, drill, checkout, and career pages), so they were '
          'consolidated into seven, each with one purpose: a Strategy Trainer with the chart built in; a Count Trainer '
          'that deals cards at a chosen speed; a Deck Estimator with an interactive, rotatable 3D discard tray answered to '
          'the half deck; a timed True Count Trainer; an Index Trainer that includes insurance; a Shoe Challenge; and the '
          'Bankroll Simulator. The Shoe Challenge deals twelve rounds from a real shuffled six-deck shoe on the server and '
          'grades each round there, scoring the true count and bet from the player’s own count so one slip is not '
          'punished twice. Every tool is a reusable question component, so lessons embed the same tools.'),
    ('h2', 'Curriculum'),
    ('p', 'Each track has 8 units, 30 lessons, and about 400 graded questions: Smart Player (rules to casino know-how), '
          'Strategy Master (every hand and rule set), Card Counter (Hi‑Lo to index plays), and Advantage Pro (Kelly betting, team play). Lessons run up to about '
          '25 interactions: short explanation cards, harder concept questions (for example hourly SD, N₀, and risk of '
          'ruin), and embedded tools such as live hands, flashing card sequences, the 3D tray, and full mini-shoe '
          'scenarios that chain counting, conversion, betting, and play. Answers come from the same `basic()` and '
          '`deviation()` logic as the charts, so every answer and explanation agrees with the rest of the application.'),
    ('h2', 'Learning path and feedback loop'),
    ('p', 'My Path is a separate section of the site (Figure 2): colored unit banners above a winding column of '
          'lesson nodes that unlock in order. A sidebar shows the streak, experience points (XP), the daily goal, a '
          'seven-day chart, and the plan. A wrong answer shows the correct answer and a reason, and the question '
          'returns at the end of the lesson (up to twice). Lessons earn 10 XP the first time, 5 XP on replay, and 5 '
          'more if perfect. Each lesson and practice session sends a transcript of every question and answer; the '
          'server re-grades it with the Python engine and awards XP from its own score. The same data drives a '
          '“Weak spots” session built from the skills a learner misses most.'),
    ('figure', ['figures/learning-path.jpg'], 3.9,
     'Figure 2: My Path on a desktop browser, with the tab rail, the current track and its Change track button, unit '
     'banners, lesson nodes, and the daily goal and plan sidebar.',
     'Desktop screenshot of the learning path: the Learn, Practice, Track, Community, and Profile navigation rail; a '
     'Smart Player track card with 11 of 30 lessons and a Change track button; a Continue card for Unit 4, Payouts and '
     'Side Bets; a tested-out Table Basics unit with its lesson nodes; and a sidebar with the streak, XP, daily goal, and the plan.'),
    ('h2', 'Visual design'),
    ('p', 'The whole site was redesigned as a fusion of Apple’s design language (system colors, system fonts, '
          'frosted-glass navigation, segmented controls) [@applehig] and a mobile learning app (chunky pressable '
          'buttons, large answer tiles, a zigzag path, celebration screens). Several of Apple’s brightest colors fail '
          'the WCAG 4.5:1 contrast ratio for white text [@wcag], so every button and banner color was checked and '
          'deepened where needed. A dark appearance follows the device setting. The mascot, sounds, and logo are original.'),

    ('h1', 'Development Process'),
    ('p', 'The project began on September 14, 2026 as research into existing tools, first aiming to closely match '
          'one. Its signed-in features were unavailable and a copy would add little, so on September 21 the direction '
          'changed to an original product, Felt & Fortune, with a 1970s editorial identity, as presented in the '
          'proposal. A later review of the working prototype found duplication (the “EV Calculator” and “Monte Carlo '
          'Simulator” were the same page), so the two were merged, and the project moved to a private GitHub repository.'),
    ('p', 'The largest decision came late in the project. The author concluded that the site needed an intelligent '
          'feature [and that the course expects one: confirm or remove] and a clearer path for beginners. Three options '
          'were considered: a large language model that writes plans, a model that also writes lessons, or a '
          'rule-based planner over a fixed curriculum. A language model would add cost, setup, and the risk of '
          'confidently wrong blackjack math, so the rule-based design with engine-generated questions was chosen to keep '
          'content verifiable. A final pass made the learning app the whole site: one shell with Learn, Practice, '
          'Track, Community, and Profile tabs, with every older page ported into it and old addresses redirected.'),

    ('h1', 'Evaluation'),
    ('h2', 'Automated tests and walkthroughs'),
    ('p', 'All 61 tests pass. Beyond authentication, permissions, and the simulator, they check track choice and placement (an '
          'unproven self-reported level is not skipped ahead), equal track sizes, track switching, lesson unlocking and XP, and that every lesson’s tool '
          'steps are valid. A parity test compares the JavaScript and Python engines on every two-card hand, upcard, '
          'rule set, and true count from −6 to +8. Shoe Challenge tests confirm that perfect play keeps every heart, that '
          'later parts are graded from the player’s own count, and that answers stay hidden. Grading tests confirm '
          'that skipped questions, invented questions, and wrong answers are rejected or scored as wrong. The full flow was walked '
          'through at desktop, tablet, and phone widths, including an automated run through a whole lesson.'),
    ('h2', 'User feedback'),
    ('p', '[Pending: the proposal planned usability sessions with five to eight peers, targeting at least 90% task '
          'completion. Add the number of participants, completion rates, notable hesitations, and quotes here once '
          'sessions are run. Do not report results that have not been collected.]'),

    ('h1', 'Discussion'),
    ('h2', 'Significance'),
    ('p', '[Connect the project to the course objectives here, e.g., user-centered design, iterative development, '
          'testing, and responsible use of AI tools.] Beyond the course, the project applies a common education-technology '
          'pattern, short adaptive onboarding before the first lesson, and shows that personalization does not need a '
          'black box: every plan decision comes from a readable rule shown to the learner, so it can be checked and '
          'corrected. That matters when the subject involves money and risk, and the lessons teach that results are '
          'noisy, bankroll risk is real, and casinos may refuse play.'),
    ('h2', 'Limitations and future work'),
    ('p', 'The server re-grades every answer, but practice questions are still dealt in the browser, so a determined '
          'user could submit made-up hands. The planner’s thresholds come from the author’s judgment rather than learner '
          'data, and index plays assume six decks, S17, and no surrender. Next steps are server-dealt questions, spaced '
          'review over days [@settles], a placement model tuned on learner data, and language-model explanations '
          'checked against the engine before display.'),

    ('h1', 'Conclusion'),
    ('p', 'Felt & Fortune began as a toolbox and became a coach. A short survey with real skill checks, a transparent '
          'planner, and a gamified path built on a verified strategy engine give each learner a clear route from their '
          'first hand to advantage play, while the original drills, simulator, and tracker remain one click away.'),
]

ACKNOWLEDGMENTS = ('[Confirm wording against the course policy on AI tools:] Development used an AI coding assistant '
                   '(Claude Code) for implementation and testing support. The author directed the design, reviewed the '
                   'changes, and is responsible for the final work.')

REFERENCES = {
    'baldwin': 'Roger R. Baldwin, Wilbert E. Cantey, Herbert Maisel, and James P. McDermott. 1956. The optimum strategy in blackjack. *J. Amer. Statist. Assoc.* 51, 275 (1956), 429–439.',
    'wizard': 'Michael Shackleford. 2026. 4-Deck to 8-Deck Blackjack Strategy. Wizard of Odds. Retrieved September 21, 2026 from https://wizardofodds.com/games/blackjack/strategy/4-decks/',
    'thorp': 'Edward O. Thorp. 1966. *Beat the Dealer: A Winning Strategy for the Game of Twenty-One* (rev. ed.). Vintage Books, New York, NY.',
    'wong': 'Stanford Wong. 1994. *Professional Blackjack* (rev. ed.). Pi Yee Press, La Jolla, CA.',
    'schlesinger': 'Don Schlesinger. 2005. *Blackjack Attack: Playing the Pros’ Way* (3rd ed.). RGE Publishing, Oakland, CA.',
    'aptoolbox': 'AP Toolbox. 2026. AP Toolbox. Retrieved September 14, 2026 from https://www.ap-toolbox.com/',
    'bjtools': 'Blackjack.tools. 2026. Blackjack.tools. Retrieved September 21, 2026 from https://blackjack.tools/',
    'deterding': 'Sebastian Deterding, Dan Dixon, Rilla Khaled, and Lennart Nacke. 2011. From game design elements to gamefulness: defining “gamification”. In *Proceedings of the 15th International Academic MindTrek Conference* (MindTrek ’11). ACM, New York, NY, 9–15. https://doi.org/10.1145/2181037.2181040',
    'hamari': 'Juho Hamari, Jonna Koivisto, and Harri Sarsa. 2014. Does gamification work? A literature review of empirical studies on gamification. In *Proceedings of the 47th Hawaii International Conference on System Sciences* (HICSS ’14). IEEE, 3025–3034. https://doi.org/10.1109/HICSS.2014.377',
    'settles': 'Burr Settles and Brendan Meeder. 2016. A trainable spaced repetition model for language learning. In *Proceedings of the 54th Annual Meeting of the Association for Computational Linguistics* (ACL ’16). ACL, 1848–1858. https://doi.org/10.18653/v1/P16-1174',
    'corbett': 'Albert T. Corbett and John R. Anderson. 1994. Knowledge tracing: modeling the acquisition of procedural knowledge. *User Modeling and User-Adapted Interaction* 4, 4 (1994), 253–278. https://doi.org/10.1007/BF01099821',
    'buchanan': 'Bruce G. Buchanan and Edward H. Shortliffe (Eds.). 1984. *Rule-Based Expert Systems: The MYCIN Experiments of the Stanford Heuristic Programming Project*. Addison-Wesley, Reading, MA.',
    'applehig': 'Apple Inc. 2026. Human Interface Guidelines: Color. Retrieved [date] from https://developer.apple.com/design/human-interface-guidelines/color',
    'wcag': 'World Wide Web Consortium. 2023. Web Content Accessibility Guidelines (WCAG) 2.2. W3C Recommendation. Retrieved [date] from https://www.w3.org/TR/WCAG22/',
}
