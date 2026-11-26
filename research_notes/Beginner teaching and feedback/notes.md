# Teaching complete beginners a rule-heavy skill: intro screens, feedback, EV in plain language, mascot

Research notes for Felt & Fortune (Duolingo-style blackjack course). Written 2026-11-25.
Prompted by user testing: (1) the post-answer explanation was too short, easy to miss at the bottom, and hard to understand; (2) a beginner felt "thrown in the deep end" without the WHY; (3) testers want the first ~3 screens of a lesson to be explanation parts, each with its own animation; (4) the "Why?" panel's EV-as-%-of-bet came across as too mathematical.

Caveat on sources: effect sizes come from abstracts, publisher pages and secondary summaries reached through search. Where the full text was not read, the note says so. Blackjack numbers are approximate standard figures (multi-deck, dealer stands on soft 17, dealer peeks). **The app should generate the numbers it shows from its own strategy engine for its configured rules,** not copy them from these notes.

---

## 1. Introducing a new concept to novices

### 1.1 Mayer's multimedia principles (cognitive theory of multimedia learning)
| Principle | What it says | Evidence | Implication |
|---|---|---|---|
| **Segmenting** | A lesson broken into learner-paced parts works better than one continuous presentation | Mayer reports median d ≈ 0.79 (Mayer & Pilegard 2014; the earlier handbook gave ~0.98). The Rey et al. 2019 meta-analysis (56 investigations, 88 comparisons) found small-to-medium gains in retention and transfer, **lower cognitive load**, and longer learning time, for both system-paced and learner-paced segments. | Split the intro card into 2–4 tap-to-advance screens. Strongest effect when the material is complex, fast and new to the learner. |
| **Pre-training** | Teach the names and characteristics of the key parts *before* the main explanation | Supported in 13 of 16 tests, median d ≈ 0.75 (Mayer, Cambridge Handbook) | Screen 1 of a new concept should name the parts ("upcard", "hard total", "stiff") before any rule that uses them. |
| **Signaling** | Highlight the essential material with cues such as arrows, color and bold | Schneider, Beege, Nebel & Rey 2018 meta-analysis (103 studies, ~12k participants): g ≈ 0.53 retention, g ≈ 0.33 transfer (figures from a secondary summary). Alpizar et al. 2020: d ≈ 0.38. | Pulse the card being discussed and use one consistent accent color for "the thing that matters". |
| **Coherence** | Cut interesting but irrelevant words, pictures and sounds | Mayer: 10 of 11 tests, median d ≈ 1.32. Rey 2012 seductive-details meta-analysis: decorative extras **reduce** recall (d ≈ 0.30) and transfer (d ≈ 0.48), and do more damage under time limits. Harp & Mayer 1998: seductive details hurt most when they appear **early** in a lesson. | No casino flavor text, chip shimmer or mascot quips on intro screens. Flavor belongs at the end of a lesson. |
| **Spatial contiguity** | Put words next to the part of the picture they describe | Mayer: 9 of 9 tests, d ≈ 0.82 (older edition 1.11) | Put the label on the card itself ("dealer's upcard"), not in a caption below. |
| **Temporal contiguity** | Show a word and its visual at the same moment | Mayer: 8 of 8 tests, d ≈ 1.31. Noetel et al. meta-review rates contiguity and signaling among the largest effects. | Each animation beat starts with its sentence, not after it. |
| **Modality** | Spoken narration plus a graphic beats on-screen text plus a graphic, for fast system-paced material | Classic finding. A mobile app is mostly read silently and learner-paced, which weakens the effect (transient-information research: long spoken text is harmful). | Keep text short so it does not compete with the animation. Optional voiceover is nice-to-have, not required. |
| **Image principle** | Showing the instructor's (or agent's) image does not by itself improve learning | Small or near-zero effect (Mayer; Moreno et al. 2001: the agent's *voice*, not its image, carried the effect) | The mascot should not sit on the explanation screens. |

Sources: Mayer, *Cambridge Handbook of Multimedia Learning* chapters on essential and extraneous processing (https://www.cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/principles-for-managing-essential-processing-in-multimedia-learning-segmenting-pretraining-and-modality-principles/4110A2275F6DCD02DAB1F8B37BA7E5CE); Mayer 2021 table reproduced at UNH (https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-research-based-principles-for-designing-multimedia-instruction-mayer.pdf); Rey et al. 2019, *Educ Psych Rev* 31:389–419, doi 10.1007/s10648-018-9456-4; Schneider et al. 2018, *Educ Res Rev* 23:1–24 (summary: https://inspire.acu.edu.au/articles/signalling); Rey 2012 and Harp & Mayer 1998 via https://pmc.ncbi.nlm.nih.gov/articles/PMC6755318 and https://en.wikipedia.org/wiki/Seductive_details; Noetel et al. (https://pmc.ncbi.nlm.nih.gov/articles/PMC7940870); Spanjers et al. 2010 on segmenting animations (https://link.springer.com/doi/10.1007/s10648-010-9135-6).

**How many segments, and how much text per screen?** No study gives a magic number. What the evidence supports:
- Each segment should carry **one idea**, one cause-and-effect step (Mayer's definition of a segment).
- Working memory holds roughly 4 new chunks at once (Cowan's estimate, commonly cited in cognitive load theory). In practice that means 1 new term plus 1 relationship per screen.
- Segmenting helps most when the material is complex and new. So 2–4 segments suit a new concept, and 1 suits a small extension of an earlier idea.
- Rule of thumb from these principles (an inference, not a tested threshold): about 15–30 words per screen, one sentence plus an optional short line of emphasis. Anything longer becomes "read a paragraph", and testers already skip that.

### 1.2 Animation vs static images
- **Höffler & Leutner 2007** meta-analysis (26 studies, 76 comparisons): animation beats static pictures overall, d = 0.37 (95% CI 0.25–0.49). The advantage is larger when the animation is **representational**, meaning it depicts the very change being taught (d ≈ 0.40), than when it is decorative, and largest for realistic video (d ≈ 0.76). It is also largest for procedural-motor knowledge.
- Later meta-analyses put the advantage lower: Berney & Bétrancourt 2016 (140 comparisons) g ≈ 0.23; Castro-Alonso et al. 2019 g ≈ 0.23.
- **Transient information effect:** an animation vanishes as it plays, which taxes memory. Remedies are short segments, learner control (replay, pause) and keeping the final frame on screen.
- **Implication:** animate only things that actually *change*: a card being dealt, the hole card flipping, a total ticking up, a bust. Each animation should be short, 1–3 s per beat, and end on a static frame that stays visible while the learner reads. Add a "replay" affordance. Decorative motion breaks the coherence principle.

Sources: Höffler & Leutner 2007, *Learning and Instruction* 17(6), doi 10.1016/j.learninstruc.2007.09.013 (https://www.leibniz-ipn.de/en/research/publications/instructional-animation-versus-static-pictures-a-meta-analysis; PDF https://wikicap.ulb.be/images/e/ef/Hoffler_Leutner_2007.pdf); Berney & Bétrancourt (https://access.archive-ouverte.unige.ch/access/metadata/75bf6876-cb91-4e2c-8ac6-9d0767449449/download); summary of later meta-analyses (https://link.springer.com/article/10.1007/s11251-021-09541-w).

### 1.3 Worked examples, fading, expertise reversal
- **Worked-example effect:** novices learn more from studying solved examples than from solving equivalent problems, because problem solving spends working memory on search instead of schema building (Sweller; https://en.wikipedia.org/wiki/Worked-example_effect).
- **Fading** (Renkl, Atkinson & Große 2004, *Instr Sci* 32; Atkinson, Renkl & Merrill 2003, *J Educ Psych* 95): go from a fully worked example, to an example with the last step missing, to a full problem. **Backward fading** removes the final step first, and studies in elementary **probability** found it helps (https://faculty.engineering.asu.edu/mre/wp-content/uploads/sites/31/2020/02/Exp_Rev_LI06.pdf). Salden et al. 2010: adaptive fading beat fixed fading, which beat pure problem solving (https://link.springer.com/doi/10.1007/s11251-009-9107-8).
- **Expertise reversal effect** (Kalyuga, Ayres, Chandler & Sweller 2003; Kalyuga 2007, https://www.uky.edu/~gmswan3/EDC608/Kalyuga2007_Article_ExpertiseReversalEffectAndItsI.pdf): guidance that helps novices becomes redundant, and even harmful, for experienced learners. In practice: make explanations skippable and collapsible, show less guidance after mastery, and let placement-tested users skip intro screens.
- **For Felt & Fortune:** the "thrown in the deep end" complaint is the classic novice signature of problem solving before any worked example. The first hand after the intro should be a **worked hand** in which the app plays, narrates the reason and highlights the cue. Next comes a **completion hand**, where the app sets it up and the learner makes the final tap. Only then does free practice begin.

### 1.4 Comparison and contrasting cases
- **Alfieri, Nokes-Malach & Schunn 2013** (57 experiments, 336 tests): case comparison beats studying cases one at a time, d ≈ 0.50. The effect is bigger when learners look for similarities and differences, when the principle is stated *after* the comparison, and when the content is perceptual (https://www.lrdc.pitt.edu/Schunn/papers/ContrastingCasesMeta-AlfieriEtAl2013.pdf).
- **Rittle-Johnson & Star:** comparing worked examples side by side improved procedural flexibility and conceptual knowledge (https://cdn.vanderbilt.edu/t2-my/my-prd/wp-content/uploads/sites/3147/2020/01/RittleJohnson_Star_Durkin_2017_ComparisonChapter.pdf).
- **For Felt & Fortune:** blackjack is perfect for minimal pairs. Same player hand, two dealer upcards: "16 vs **6** → stand" next to "16 vs **10** → hit". Only one card differs, so the learner sees that the dealer card drives the decision. Then state the rule.

### 1.5 Retrieval practice and spacing
- Testing beats restudy: Rowland 2014 g ≈ 0.50, rising to g ≈ 0.69 for retention over a day (https://pubmed.ncbi.nlm.nih.gov/25150680/). Adesope et al. 2017 g ≈ 0.70, with multiple-choice at least as effective as recall, and the effect present with or without feedback (https://journals.sagepub.com/doi/10.1177/1475725717695149 ; Roediger & Karpicke).
- Spacing: Cepeda et al. 2008 (n > 1,350) found the best review gap is about 20–40% of the retention interval for a one-week test, falling to 5–10% for a one-year test (https://pubmed.ncbi.nlm.nih.gov/19076480/).
- **Timing inside a lesson:** explain (2–4 short screens), give a worked example, then *immediately* run a retrieval question on the same idea. Next, interleave it with older ideas later in the lesson. Bring it back in the next day's review. Retrieval should come right after explanation, but **not before** the learner has any basis for answering. Asking cold questions is what made the tester feel thrown in.

---

## 2. Feedback design

### 2.1 What the research says
- **Shute 2008, "Focus on Formative Feedback"** (*Rev Educ Res* 78:153–189; https://myweb.fsu.edu/vshute/pdf/shute%202008_b.pdf; ETS version https://www.ets.org/research/policy_research_reports/publications/report/2007/hslv.html). From the guideline tables, as summarized in secondary sources (the full PDF could not be parsed this session):
  - Feedback should be nonevaluative, supportive, timely and **specific**. It should focus on the task, not the learner.
  - **Elaborated feedback** (why it's right or wrong, plus a hint or worked step) generally beats **verification-only** feedback (right or wrong), especially for complex tasks and low-achieving or novice learners.
  - Present elaborated feedback in **manageable units**. Overly long or complex feedback is ignored or overloads the learner.
  - **Immediate feedback** suits novices, low achievers and procedural or rule learning. Delayed feedback can help transfer in high achievers.
  - Avoid praise aimed at the person and comparisons with others. Avoid feedback that gives the answer before the learner has tried.
- **Hattie & Timperley 2007** (*Rev Educ Res* 77:81–112; https://www.uky.edu/~gmswan3/575/Hattie_Timperly_2007.pdf). The three questions are *Where am I going? How am I doing? Where to next?* The four levels, with impact, are: task (useful), process (powerful), self-regulation (powerful), and self or praise (ineffective). **Novices need task-level feedback first** ("what's correct and why"), and process feedback ("the cue to look at") comes on top of it (https://www.aitsl.edu.au/docs/default-source/research-evidence/spotlight/feedback.pdf ; https://www.bera.ac.uk/blog/how-to-optimise-the-use-of-hattie-and-timperleys-feedback-levels-for-student-learning).
- **Wisniewski, Zierer & Hattie 2020** meta-analysis (435 studies, 994 effects, N > 61k): overall d = 0.48. **High-information feedback d = 0.99**, against 0.46 for corrective feedback and 0.24 for reinforcement or punishment such as "Correct! +10 XP". Feedback works better for cognitive and motor skills (https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full).
  - The headline number for the app: "Correct/Incorrect + XP" is the weakest category. Adding the *why* and *what to look at* roughly doubles the effect.

### 2.2 How products surface feedback
- **Duolingo:** a full-width colored banner rises from the bottom, green for correct and red for incorrect. It shows the correct answer and has an "Explain My Answer" button next to "Continue". The learner must answer before the explanation appears. EMA was a Max feature and became free in 2026 (https://blog.duolingo.com/explain-my-answer-now-free ; https://blog.duolingo.com/duolingo%2Dmax). Note that Duolingo's banner is **large and colored and uses sound plus haptics**, so it is hard to miss. A small grey panel at the bottom is not the same pattern.
- **Brilliant:** "learn by doing". Each section starts with the simplest useful case, uses visual models so the learner discovers *why* before the rule, and responds while reasoning is fresh. Wrong answers give a chance to revise rather than just a mark. The Koji tutor gives hints without giving the answer (https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/). This is self-description, not independent evaluation.
- **Codecademy:** a brief popup right after submission explains why the answer is right or wrong (https://www.codecademy.com/resources/blog/behind-the-build-designing-post-quiz-review).
- General mobile-quiz UX: feedback must name what the learner chose, say whether it was right, and make the next step clear. Never auto-advance before the learner has had time to read, and allow revisiting (https://screensdesign.com/articles/mobile-quiz-wrong-answer-feedback-ux/).
- Khan Academy hints, from known product behavior that was not re-verified this session: stepwise hints are revealed one at a time, and the last hint is the worked answer. This is a fading scaffold the learner controls.

### 2.3 What makes an explanation understandable to a novice
1. **Concrete before abstract.** Use the actual cards on the table ("your 10 and 6"), then the rule ("hard 16").
2. **One cue, one reason.** Name the single thing that decides it ("the dealer's 10"), and say why in everyday words ("dealer will usually end up with 17 or more").
3. **Contrast case.** "If the dealer showed a 6 instead, you'd stand", following Alfieri 2013.
4. **No undefined jargon.** Each term (stiff, soft, upcard, EV, true count) is pre-trained once (pre-training principle) and gets a tap-to-define tooltip afterwards.
5. **Analogy where it fits.** Insurance is "a side bet that the dealer has blackjack", not insurance in any protective sense. A soft hand is "a hand with a safety net, because the ace can drop from 11 to 1".
6. **Frequencies, not percentages of bet** (section 3).
7. **Correct-answer explanation too**, but shorter. A correct answer may be a guess, and confirming the reason consolidates it, since elaborated feedback helps on correct responses as well.

---

## 3. Explaining probability and expected value to non-mathematical people

### 3.1 Evidence
- **Natural frequencies:** Gigerenzer & Hoffrage 1995 (*Psych Rev*) found Bayesian accuracy rose from ~16% to ~46% when the information was given as counts ("out of 100 hands...") instead of probabilities. The result replicates across physicians, patients and law students (https://pages.ucsd.edu/~scoulson/203/GG_How_1995.pdf ; https://pmc.ncbi.nlm.nih.gov/articles/PMC4475789). The benefit is bigger for some people and is linked to numeracy (https://cambridge.org/core/services/aop-cambridge-core/content/view/7197DAAA5CC39185A3E4E02FD36A6FD0/S1930297500000681a.pdf/numeracy-frequency-and-bayesian-reasoning.pdf). Use a **constant reference class**, always "out of 100 hands like this".
- **Icon arrays:** Galesic, Garcia-Retamero & Gigerenzer 2009 found icon arrays improved accuracy for both low- and high-numeracy people (https://pure.mpg.de/pubman/item/item_2099767_5/component/file_2562291/MG_Using_2009.pdf). Garcia-Retamero & Galesic found they eliminate **denominator neglect**, with the biggest benefit for low numeracy (https://pmc.ncbi.nlm.nih.gov/articles/PMC2988162). Caveats: people with low graph literacy can be confused by visuals, so always pair the icons with the plain number (https://pure.mpg.de/pubman/item/item_2098431_7/component/file_3569483/Garcia_Communicating_2013_VerlPDF_final_LS.pdf). **Random-scatter** arrays read as riskier than grouped ones, so use **grouped** blocks (all wins together, then pushes, then losses) to keep comparisons honest (https://dlab.sauder.ubc.ca/sjdm/journal/21/210615/jdm210615.html).
- **Risk-communication best practice** from the same literature: use the same denominator for every option, compare options side by side, and give absolute numbers rather than relative ones ("loses 4 fewer bets per 100", not "8% better").

### 3.2 The blackjack-specific reframing
EV as a % of bet (−54.0% vs −53.5%) is accurate but meaningless to a beginner. Three better framings, in order of how concrete they are:
1. **Outcome counts** ("Out of 100 hands like this, standing wins about 23, because the dealer has to bust"). This uses the dealer-bust intuition directly.
2. **Money per 100 hands at a concrete bet** ("At $10 a hand, over 100 of these hands, standing costs about $540 and hitting about $535"). This is the form the LCB article uses, for example 8,8 vs 10 over 100 hands at $10 (https://lcb.org/articles/blackjack-16vsdealer10).
3. **The difference only** ("Hitting saves you about 1 bet every 200 of these hands"). Honest about close calls.

**Be honest about close calls.** 16 vs 10 is famously near-even between hit and stand. The real lesson is that both are bad, hitting is very slightly less bad, and surrender, where allowed, is clearly better: you lose exactly 50 bets per 100 instead of about 54. Overstating the gap would teach a false intuition. **Lead with the high-contrast hands** (11 vs 6, 12 vs 6, 18 vs 6, A-A, 8-8, 10-10, insurance), where the "out of 100" picture is vivid, and tag close calls as "close call" with a small icon.

Approximate dealer bust chance by upcard (S17, after peek; sources differ by 1–3 points because of rules and blackjack inclusion: https://www.deucescracked.com/blog/blackjack-dealer-bust-probability-by-upcard-data ; https://dotesports.com/casinos/blackjack/odds-chart ; https://pi.math.cornell.edu/~mec/2006-2007/Probability/Blackjack.htm):
2 ≈ 35% · 3 ≈ 37–38% · 4 ≈ 40% · 5 ≈ 42% · 6 ≈ 42% · 7 ≈ 26% · 8 ≈ 24% · 9 ≈ 23% · 10 ≈ 21–23% · A ≈ 12–17%.
**Plain version:** "Dealer shows 2–6, so they bust about **4 in 10** times. Dealer shows 7–A, so they bust about **1 in 4** times or less." This one icon-array contrast (40 red of 100 vs 23 red of 100) explains the whole stiff-hand section of the chart.

### 3.3 Phrasing patterns
- Pattern A (decision): "**[Action].** [Cue] means [what usually happens]. Out of 100 hands like this, [action] [result] vs [alternative] [result]."
- Pattern B (dealer model): "Think of the dealer's hidden card as a 10, since 10s are the most common card (4 of every 13). A 10 showing probably means 20."
- Pattern C (close call): "**Close call.** Both lose often. [Action] loses about [k] fewer bets per 100. If surrender is offered, that's best: you lose exactly half."
- Avoid: "EV −0.54", "−54% of bet", "house edge" before it is pre-trained, and relative comparisons ("1% better").

---

## 4. How popular products and explainers teach blackjack basics visually
- **Learning the chart in sections** is the near-universal method: hard totals, then soft, then pairs, then surrender and doubling. Learners start with the most common situations and drill with flashcards (CasinoBeats https://casinobeats.com/features/basic-blackjack-strategy/ ; Casino.org https://www.casino.org/blog/memorizing-basic-blackjack-strategy/ ; Udemy courses that "break it down into sections with memory aids"). Blackjack Apprenticeship's free materials follow the same idea with a downloadable chart and flashcard-style drills. Its official drill structure was not verified this session because search returned mirror or spam pages.
- **Explainer heuristics** used across YouTube and casino guides (Blackjack Apprenticeship, Casino.org, Wizard of Odds-style content):
  - **"Assume the hidden card is a 10."** This is a heuristic, not a fact: about 4 of every 13 cards are 10-valued. It makes the dealer's likely final hand easy to picture. Caveat: it is a mental model. Present it as "the most common card is a 10, so the dealer's hidden card is often a 10".
  - **"Stiff hands" (12–16):** hands that can bust with one hit. They form the core of the "dealer weak (2–6) vs dealer strong (7–A)" split.
  - **"Let the dealer bust"** against 2–6: stand on stiffs because the dealer must keep hitting until 17.
  - **"Never take insurance"** and "always split aces and 8s, never split 10s or 5s" are memorable absolute rules.
  - **Dealer-must-hit-to-17 animation:** showing the dealer forced to draw is the clearest visual of *why* stiffs stand against weak cards.
- **Trainer apps** (Blackjack Trainer 21, Learn Blackjack Strategy and others on the App Store) use sequential lessons followed by mixed drills and "flashcards for blackjack". This is retrieval practice, mostly with verification-only feedback. Felt & Fortune can beat them by explaining.
- **Visual metaphors that map to the research:**
  1. **Dealer bust meter:** a 10-segment bar (icon array of 10) filled red to about 4 for upcards 2–6 and about 2 for 7–A. It sits beside the dealer's upcard on intro screens and in the Why panel.
  2. **Ghost hole card:** a translucent "10" on the face-down card that fades in, labeled "often a 10". It animates the "assume a 10" heuristic.
  3. **Dealer's forced path:** the dealer draws card after card until reaching ≥17 or busting, each drawn card flying in. For a 6 upcard, the bust branch is shown often.
  4. **Bust zone on the player total:** a number line from 12 to 21 with "cards that bust you" highlighted. On 16, 8 of 13 card ranks bust you, which shows why 16 is a stiff.
  5. **Soft hand safety net:** the ace card visibly flips from "11" to "1" when a hit would bust.
  6. **Double = a second chip slides in plus exactly one card.**
  7. **Split = the pair slides apart into two hands.**
  8. **Count:** a running-count tally chip ticks +1 or −1 as each card flips. True count is "count ÷ decks left", shown as a discard tray emptying.

---

## 5. Multi-select vs single-choice
- **Knowledge checks:** single-best-answer MCQ works well for retrieval practice (Adesope 2017). Select-all items are harder to score and to give feedback on. If a multi-answer item is needed, **multiple true-false** (mark each option true or false) has higher reliability (Frisbie & Sweeney 1982; Kreiter & Frisbie 1989) and better detects misconceptions than "select all" (https://link.springer.com/article/10.1186/s40594-019-0169-0 ; https://pmc.ncbi.nlm.nih.gov/articles/PMC8725057). Partial-credit scoring of select-all is workable, with plus/minus or true/false scoring the best options (Betts et al.), but the scoring is hard for learners to understand.
- **Onboarding or profile questions** ("what do you want to learn?", "where do you play?") are a different case. They have no right answer, several can be true, and multi-select is natural. Survey research shows check-all-that-apply leads people to pick fewer options and **satisfice**, with a primacy bias. Forced yes/no per item gets deeper processing (Smyth et al. 2006; Pew 2019: ~3-point order effect for select-all vs 0 for forced choice; https://www.pewresearch.org/methods/2019/05/09/when-online-survey-respondents-only-select-some-that-apply/ ; https://digitalcommons.unl.edu/sociologyfacpub/674). For a short onboarding list (≤6 options) that only personalizes content, multi-select is fine. Randomizing option order is optional.
- **Placement questions:** use single-choice ("what's the right play: 12 vs 4?") or "I don't know yet" options. Never multi-select. Placement needs a clean right or wrong signal, and the "I don't know" button stops beginners from guessing their way into lessons that are too advanced.
- **Rule:** use multi-select only when (a) the question has no right answer, such as preferences or goals, or (b) the concept *itself* is a set ("Which of these are soft hands?"). In case (b), render it as tap-each-card true/false and give feedback per option.

---

## 6. Mascot animation and pedagogical agents
- **Duolingo + Rive:** Duolingo's characters are Rive state machines. Body states (idle, talk, reactions) run in parallel with mouth "viseme" states for lip sync, with 4 to 20+ mouth shapes (https://blog.duolingo.com/world-character-visemes). Practitioner write-ups, which are secondary and partly marketing, describe the typical state set: **idle** (breathing, blinks, eye darts, so the character feels alive without demanding attention), **speaking**, and **correct/incorrect reactions** triggered by app events (https://dev.to/uianimation/how-duolingo-uses-rive-for-their-character-animation-and-how-you-can-build-a-similar-rive-mascot-5d19). Idle loops should be **low amplitude** and slow. The reaction is a short burst tied to a meaningful event: correct answer, streak, lesson end.
- **Persona effect** (Lester et al., CHI 1997, Herman the Bug): a lifelike agent improves learners' *perception* of the experience even when it is not very expressive, and more expressive agents are rated more favorably (https://chi1997.acm.org/proceedings/paper/jl.html). That is a motivation and affect effect, not proof of better learning.
- **Learning effect is small:** Schroeder, Adesope & Gilbert 2013 meta-analysis (43 studies, 3,088 participants) found a small but significant learning benefit. It was larger for K-12 than for adults, and **agents using on-screen text beat narrated agents** (https://rex.libraries.wsu.edu/esploro/outputs/journalArticle/How-Effective-are-Pedagogical-Agents-for/99900601056901842). Castro-Alonso et al. 2021: g ≈ 0.20, with **2D agents (g ≈ 0.38) beating 3D (g ≈ 0.11)** (https://link.springer.com/article/10.1007/s10648-025-10050-2 and summary).
- **Cautions:**
  - The image principle says showing the agent's image doesn't help learning in itself.
  - Seductive-details research applies too: a moving, joking mascot on explanation screens competes for attention, and does the most damage early in a lesson (Harp & Mayer 1998; Rey 2012).
  - Hattie & Timperley rate "self-level" praise ("You're amazing!") as ineffective.
  - Do not make the mascot react visibly disappointed to a wrong answer. Shute advises against discouraging or controlling feedback.
- **Implication:**
  - The mascot is a 2D motivational host: lesson start, streaks, lesson complete, encouragement after a wrong answer.
  - It should *not* animate during intro explanation screens or while the learner reads feedback, beyond a still pose or slow idle.
  - When it "speaks" a tip, the text is the explanation itself, not a quip.

---

## Recommendations for Felt & Fortune

### A. New-concept intro screens ("Learn" segment before practice)
1. **2–4 intro screens per new concept (default 3), tap to advance, back allowed.** For a small extension of a known idea, use 1 screen.
2. **Each screen gets one sentence of ≤25 words (hard cap 30) plus an optional ≤8-word bold "takeaway" line.** No paragraphs.
3. **Each screen has exactly one animation that shows exactly that sentence** (temporal contiguity). The animation starts when the screen appears, runs 1–3 s, ends on a static frame that stays visible, and has a ↻ replay button. Labels sit *on* the cards and chips (spatial contiguity).
4. **Screen 1 = pre-training:** name the parts ("This is the dealer's **upcard**. The face-down one is the **hole card**."). Screen 2 = the cause-and-effect ("Dealer must keep hitting until 17..."). Screen 3 = the rule plus a contrast pair ("16 vs **6**: stand. 16 vs **10**: hit.").
5. **One accent color means "the deciding cue"**, the same color across intro, feedback and the Why panel (signaling).
6. **No flavor on intro screens:** no mascot motion, ambient chip animation, music stings or casino trivia (coherence; seductive details hurt most early).
7. **Then a worked hand:** the app plays it, narrates the cue, and the learner taps "Got it". Then a **completion hand**: the app sets up the situation and the learner makes the final tap, scaffolded with the cue highlighted. Only then come unscaffolded questions (fading). The first 2 practice questions target the new concept alone, and interleaving with older concepts comes after that.
8. **Expertise reversal:** when a learner placed in through the placement test, or has mastered the skill, collapse intro screens to a single "Quick recap" card with a "Show me" option. Scaffolding (cue highlight, worked hand) disappears after 3 consecutive correct answers on that skill and returns after 2 misses.

Sample intro sequence, "Stiff hands vs a weak dealer":
- S1 (23 words): "A **stiff** is a hard 12 to 16. One more card might bust you." Animation: 10♠6♥ dealt; a number line 12→21 shows the bust zone in red.
- S2 (22 words): "The dealer *must* hit until 17. Showing a 2–6, they bust about **4 in 10** times." Animation: dealer 6 upcard; a 10-icon bar fills 4 red; the dealer draws to bust.
- S3 (19 words): "So against 2–6, you stand on stiffs and **let the dealer bust.** Against 7–A, you usually hit." Animation: contrast pair 16 vs 6 (stand ✓) beside 16 vs 10 (hit ✓). Only the dealer card differs, and it pulses.

### B. Answer feedback
9. **Make feedback impossible to miss.** Use a full-width bottom sheet in a strong color, rising to at least 35–45% of screen height on wrong answers, with sound and haptic. The table above dims slightly. The **deciding cue on the table stays lit**, so the explanation and the cards are visible together. Keep the Continue button inside the sheet.
10. **Wrong answer:** the sheet **auto-expands** with:
    - (a) a headline: "**Hit** is the play" (the correct action, not "Incorrect")
    - (b) a 2–3 sentence plain-language why (≤45 words) that names the single cue and uses "out of 100 hands" framing when a number helps
    - (c) an optional contrast line ("If the dealer showed a 6, you'd stand.")
    - (d) a "See it" button that replays the relevant intro animation, plus "Why? (numbers)" for the detailed panel.
11. **Correct answer:** a compact banner with one ≤15-word reason ("Right: dealer's 6 busts often, so let them."). Tap to expand. The learner's eye should catch the reason, so don't just say "Correct!".
12. **No auto-advance** after wrong answers. Continue sits at least 600 ms after the sheet appears so it isn't tapped through by reflex.
13. **Re-ask the missed item** later in the same lesson (Duolingo-style), then add it to the spaced review queue (next day, then about 3 days, then about a week).
14. Praise is task-focused ("You spotted the weak dealer"), never person-focused. No mascot disappointment animations.
15. **Readability rule:** grade-6 reading level, every term defined on first use, card names written as you'd say them ("a 10 and a 6", not "T6").

### C. Plain-language explanation templates (≤45 words; numbers are illustrative; generate from the engine)
- **Hard total (stiff vs strong dealer), 16 vs 10, Hit:** "Close call, but **hit**. The dealer's 10 usually ends at 17 or more, so standing on 16 only wins if they bust, about 23 out of 100 hands. Hitting gives you a small extra chance. If surrender is offered, take it."
- **Hard total (stiff vs weak dealer), 13 vs 4, Stand:** "**Stand.** A dealer showing 4 has to keep hitting and busts about 40 out of 100 times. If you hit 13, you risk busting first. Let them take the risk."
- **Hard 12 vs 2/3 (exception), Hit:** "**Hit.** 12 only busts on a 10-value card, and a 2 or 3 isn't weak enough to wait for. Most cards (9 of 13) leave you safe."
- **Soft hand, A-7 (soft 18) vs 9, Hit:** "**Hit.** Your ace can count as 1, so one more card can't bust you. 18 usually loses to a dealer 9, which often makes 19. A free try to improve."
- **Soft double, A-6 vs 5, Double:** "**Double.** The dealer's 5 is weak (busts about 4 in 10), and your soft 17 can't bust on one card. When the dealer is likely to bust, put more money out."
- **Pair split, 8-8 vs 10, Split:** "**Split.** 16 is the worst hand in blackjack. Two hands starting with 8 each have a real shot at 18. You lose less over 100 hands by splitting than by playing 16."
- **Pair don't split, 10-10 vs 6, Stand:** "**Stand.** 20 already wins most hands. Splitting throws away a great hand for two average ones."
- **Pair, A-A, Split:** "**Always split aces.** Each ace plus a 10-value card (4 of every 13 cards) makes 21. Together they're only 2 or 12."
- **Hard double, 11 vs 6, Double:** "**Double.** About 4 in 13 cards are 10s, giving you 21. The dealer's 6 busts about 4 in 10 times. Best odds on the table, so put more money down."
- **Don't double, 11 vs Ace (rule-dependent), Hit:** "**Just hit.** The ace is the dealer's strongest card, so this isn't the time to put more money at risk." (Check against the engine's H17/S17 rules.)
- **Surrender, 16 vs 10 (surrender allowed), Surrender:** "**Surrender.** You give up half your bet and keep the other half. Playing on, you'd lose about 54 bets per 100 hands like this. Surrendering loses exactly 50. Losing less is winning here."
- **Insurance, offered vs dealer Ace, No:** "**Skip it.** Insurance is a side bet that the dealer has blackjack. It pays 2 to 1, so it needs better than a 1-in-3 chance, but only about 4 in 13 cards are 10s (31%). Over 100 insurance bets you lose about 7."
- **Counting, high count (e.g., TC +3), raise bet:** "**Bet more.** Lots of 10s and aces are left. That means more blackjacks for you (paid 3 to 2) and more dealer busts. This is when the odds lean your way."
- **Counting, low card seen:** "**+1.** Small cards (2–6) leaving the deck is good for you. What's left is richer in 10s and aces."

### D. "Why?" panel, plain-language template
Replace "EV −54.0% / −53.5% of bet" with this order (detail on demand):
```
WHY HIT?
[Icon array: 2 rows of 10 icons per option, grouped: green=win, grey=push, red=loss]

Out of 100 hands like this (you 16, dealer 10):
  Hit     → you'd lose about 54 bets            ← best (highlighted)
  Stand   → you'd lose about 54 bets
  Surrender → you'd lose exactly 50 bets        (if allowed)

At $10 a hand: hitting costs ~$5 less per 100 hands than standing.
Verdict: Close call. Both lose. Hitting loses a little less.

[Show the math ▸]  → reveals EV per $1 and % of bet for advanced users
```
Rules for the panel:
- Always use the same denominator: **"out of 100 hands like this"**.
- Show **counts or bets, not percentages of bet**, by default.
- Show **absolute differences** ("$5 less per 100 hands at $10"), never relative ones.
- Use **grouped icon arrays** (wins | pushes | losses together) with the number written next to them.
- Sort with the best play first. Tag plays within ~1 bet per 100 as **"Close call"** and plays that differ by more than 10 per 100 as **"Big mistake"**. This helps learners calibrate how much a mistake matters.
- Keep a **"Show the math"** expander for EV and % of bet (expertise reversal: advanced users want it).
- Optional second line using the dealer model: "Dealer's 10 + likely hidden 10 = 20. Your 16 needs them to bust (≈23 in 100)."

### E. Multi-select
16. Use multi-select only for onboarding preferences and goals (≤6 options, "pick any"). Use single-choice for all knowledge, placement and lesson questions, with an "I'm not sure yet" option in placement. Set-membership concepts ("which hands are soft?") become per-card true/false taps with per-card feedback.

### F. Mascot
17. Use a 2D Rive mascot with a state machine: `idle` (slow breathing, occasional blink, ≤5% screen motion), `cheer` (correct, ≤1 s), `encourage` (wrong: a calm, supportive pose, never sad or disappointed), `celebrate` (lesson end, streak), and `talk` for lesson-start greetings.
18. The mascot is **off-screen or still during intro screens and while the feedback sheet is open**. It never covers cards. Its speech bubbles carry instructional text only when the content is the explanation itself.
19. Don't count on the mascot for learning gains: the effects are small (g ≈ 0.2). Measure it as a retention and motivation feature, and A/B test it against a "reduced motion" setting, which should exist anyway for accessibility.

### G. Measure
20. Track: whether the feedback sheet was seen (dwell ≥1.5 s), "See it" replay taps, error rate on the first unscaffolded question after the intro, re-ask success rate, and the Why panel's expand rate before and after the plain-language change. Re-run the beginner usability test using the same tester's three complaints as the acceptance criteria.
