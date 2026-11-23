# Felt & Fortune

Henry Chambers · Solo project

11 presentation slides, 10 minutes total. Slides 12–14 are Q&A backups.

## 1. Felt & Fortune (25 seconds)

My project is Felt & Fortune, a free website for blackjack practice and performance analysis. I am building it as a solo project. The goal is to connect learning, practice, simulations, and results tracking in one interface. Today I will explain the problem, the design, and how I plan to evaluate and finish it by November 30.

Sources: Project scope and solo ownership: Henry Chambers, user instructions, September 21, 2026.

Cover: original AI-generated decorative artwork. It depicts a concept, not a product screenshot.

## 2. The problem (55 seconds)

The target user is someone learning blackjack strategy or trying to practice more consistently. Memorizing a chart is only one part of that process. A learner also needs feedback on individual decisions and a way to see which skills still need work. Another issue is that short-term results can hide mistakes. Someone can win a session while making poor decisions, or lose while following a sound strategy. Existing tools already address parts of this problem, but the learning process can still involve separate charts, calculators, and spreadsheets. My hypothesis is that a more connected workflow can reduce that friction. I will test that hypothesis with classmates rather than assume every learner has the same needs.



## 3. Existing solutions (65 seconds)

I researched AP Toolbox and Blackjack.tools as the closest examples. AP Toolbox combines training, simulations, tracking, and community features. Its public page advertised a subscription after a trial when I inspected it. Blackjack.tools is especially important because it already offers free tools, including calculators, strategy practice, a results tracker, and forums. That means I cannot honestly claim that free access alone makes this project unique. Spreadsheets are another practical alternative for logging results, although the user must build the structure and calculations. My contribution is an independently built interface that connects these tasks around a clear practice workflow. I will use the existing products to understand common requirements, while developing my own visual identity and implementation.

Sources: https://www.ap-toolbox.com/ — public feature and subscription descriptions observed September 14, 2026. Signed-in tools were unavailable.

https://blackjack.tools/ — public feature and free-access descriptions checked September 21, 2026.

Spreadsheet comparison: design analysis, not a measured usability finding.

## 4. The proposed experience (60 seconds)

The main user journey has four stages. First, the user studies the rules and charts. Second, the user practices specific skills such as basic strategy or keeping a running count. The application gives immediate feedback and records accuracy. Third, the user changes a simulation setting, such as table rules or a bet spread, to explore how the model behaves. Finally, the user reviews sessions and progress over time. A typical path might begin with a mistake in a practice drill, continue with another attempt, and end with a clearer understanding of the correct decision. The website does not need the user to place a wager to complete that learning loop. The design question is whether the transitions between these stages feel clear and useful.



## 5. Feature scope (55 seconds)

The planned feature set is broad, so I need a clear delivery order. My first priority is a complete core journey: learn a concept, practice it, run a simulation, and save a session. That includes charts, training feedback, calculation controls, and data import and export. The broader feature set includes deck estimation, deviations, checkouts, progress tracking, and community tools. Shared bankrolls also require careful permission handling because one user should not be able to access another person’s private records. Some of these modules already exist in the prototype, but implementation is different from being ready for release. I will stabilize the core experience first, then validate the wider feature set. All access remains free, and the site does not accept or execute wagers.



## 6. Visual direction (55 seconds)

The visual direction has changed from closely matching AP Toolbox to creating an original identity. Felt & Fortune will use a 1970s color palette with cream, burnt orange, mustard, olive, and espresso. The supplied Monograph example suggests large editorial type and generous spacing. I also want to borrow general discovery patterns from Stake.us, such as clear navigation and browsable collections of activities. The subject matter and behavior remain educational tools. The screenshot here is a design reference, not a screenshot of my final website. The current prototype still needs its complete visual redesign. I will also check contrast, keyboard access, and small-screen layouts so that the retro aesthetic does not interfere with using the tools.

Sources: Monograph screenshot supplied by Henry Chambers, September 21, 2026. Shown for design reference.

https://stake.us/ — public navigation and category layout checked September 21, 2026.

Palette and proposed identity: original design direction for this project.

## 7. Implementation plan (60 seconds)

The current architecture is intentionally small enough for a solo semester project. The browser handles the interface using HTML, CSS, and JavaScript. A Python server handles authentication, permissions, validation, and simulation jobs. SQLite stores the application data. The prototype already includes modules for training, tracking, collaboration, and simulations, so this proposal builds on an initial implementation rather than starting from a blank repository. However, I am not treating those modules as finished. The next work includes the original visual design, integration testing, and validation of mathematical assumptions. Keeping a small stack reduces setup complexity, but it also means I need to document deployment limits and backup requirements. Email recovery still needs an email service, and public hosting would be a separate deployment step.

Sources: Implementation evidence: public/app.js, public/styles.css, server.py, and engine.py in the project workspace.

Status reflects the prototype as of September 21, 2026, not a production release.

## 8. Evaluation plan (75 seconds)

I will evaluate correctness, usability, interpretation, privacy, and responsive behavior. For correctness, I will test supported strategy decisions against documented fixtures and compare simulation behavior with published benchmarks under matching assumptions. For usability, I plan to recruit five to eight peers and ask each person to find a drill, complete it, run a simulation, and save a session. The target is at least ninety percent completion across those tasks. I will record errors and where people hesitate. I also want at least eighty percent of participants to explain what a confidence interval means, because showing a number is not enough if users misread it. Permission tests will cover unrelated users, viewers, editors, and bankroll owners. Finally, I will check keyboard use and layouts at 390, 768, 1024, and 1440 pixels. These are proposed targets, not results from a completed study.

Sources: All participant counts and acceptance thresholds are proposed evaluation targets.

Strategy reference: https://wizardofodds.com/games/blackjack/strategy/4-decks/

Variance reference: https://wizardofodds.com/games/blackjack/variance/

## 9. Solo ownership and feedback (60 seconds)

This is a solo project, so I am responsible for every workstream. That includes defining requirements, designing the interface, writing and integrating the application, checking the calculations, and preparing the final demonstration. My collaboration plan is therefore a feedback plan rather than a division of coding responsibilities. I will keep one task board and review progress each week. I will bring scope and design questions to instructor checkpoints, then invite peers to complete usability tasks once the core workflow is stable. Peer participants provide feedback rather than serving as development teammates. I also plan to keep changes small enough to understand and review, with reproducible test steps. Using development tools does not remove my responsibility to understand the implementation or validate the behavior I present.



## 10. Timeline to November 30 (65 seconds)

The schedule works backward from the November thirtieth deadline. In the first week I will finish the proposal and confirm the requirements and evaluation plan. The next two weeks focus on the original identity and responsive interface. From October twelfth through November first, I will integrate and stabilize the core workflow across training, tracking, and simulations. Early November is for shared features and peer usability sessions, followed by a period dedicated to correctness, accessibility, and regression testing. The final week is reserved for documentation, rehearsal, and unexpected fixes. These dates are a proposed plan rather than a claim that the work is already complete. If the scope becomes too large, I will protect the validated core workflow and reduce polish on secondary features before sacrificing the quality of the main tasks.

Sources: Deadline: November 30, supplied by Henry Chambers. Year 2026 follows the current semester context.

Phase dates and checkpoints are proposed planning estimates.

## 11. Felt & Fortune (25 seconds)

Felt & Fortune brings free practice and analysis into one original interface. I will judge the project by the accuracy of its supported tools and whether users can complete and understand the main workflow. I have a working prototype to build on, a defined evaluation plan, and a November thirtieth deadline. I am ready for your questions.



## 12. Q&A: scope and differentiation (backup)

Use these answers if asked about novelty, feasibility, or prototype status. Do not claim that this is the first free blackjack toolkit. Acknowledge Blackjack.tools as an existing free option. Explain that a student project can contribute through design, integration, and careful evaluation without inventing a new mathematical method. If asked about development assistance, describe the tools used and your review process honestly, following the course policy.



## 13. Q&A: accuracy, data, and cost (backup)

Expected value is the average outcome under the model’s assumptions. A confidence interval expresses sampling uncertainty in that estimate, and it is not the same as the range of possible session outcomes. The current engine supports a documented subset of blackjack rules. Do not imply professional certification or support for every casino variation. Community reports need dates and authors because conditions can change. The local stack has no required paid software dependencies, but public hosting and email may have costs. The project has no wagering, deposit, or withdrawal system.



## 14. Research references (backup)

The product comparison distinguishes observations from proposed design choices. AP Toolbox public pages informed feature scope, but its private tools were unavailable because the user did not want a trial. An authorized Blackjack.tools session provided workflow examples without copying its private user data. Stake.us serves only as a visual discovery reference. The Monograph screenshot came from the user. Source-specific citations also appear in the relevant slide notes.

Sources: https://www.ap-toolbox.com/

https://blackjack.tools/

https://stake.us/

wizardofodds.com/games/blackjack/strategy/4-decks/

wizardofodds.com/games/blackjack/variance/