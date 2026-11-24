# User testing script (15–20 minutes per person)

Goal: find out whether new users can get started, learn, and practice without help, and collect real numbers for the report (section 5.2) and slide 13.

## Before the session
- Send the tester the site link (or sit them at your laptop). Use a fresh browser window so they start logged out.
- Have this sheet open to record notes. Don’t help unless they’re stuck for more than about a minute; if you do help, note it.
- Say: *“I’m testing the website, not you. Please think out loud as you go.”*

## Tasks
| # | Task (read it to them) | Success = | Record |
|---|---|---|---|
| 1 | “Sign up and get a learning plan.” | Survey finished, plan shown, account created | Time, hesitations |
| 2 | “Finish the first lesson on your path.” | Lesson complete screen | Time, wrong turns |
| 3 | “Practice a skill you found hard, using any practice tool.” | Finishes a practice session (taps × and sees the summary) | Which tool, time |
| 4 | “Find the Deck Estimator and answer three questions.” | Three answers checked | Did they rotate the tray? |
| 5 | “Tell me how many XP you have, and what your daily goal is.” | Correct answer | Where they looked |
| 6 | “Send the developer feedback.” | Feedback sent (chat button in the sidebar or Profile) | — |

## Afterward (ask out loud, write down the answers)
1. What was the most confusing moment?
2. What would make you come back tomorrow?
3. On a scale of 1–5, how easy was it to use? (They also rate it in the feedback form.)

## Turn it into results
After all sessions, run:

```powershell
python scripts/study_report.py --since 2026-11-25 --csv study.csv
```

(Use the date your sessions started. On a hosted copy, run it where the database lives.) It prints completion rates, lesson accuracy, ratings by area, and every comment, without names or emails.

For the report, write: the number of testers, the task completion rate for each task, the mean rating, two or three recurring problems, and what you changed because of them. Only report what you actually observed.

## Observation sheet
| Tester | T1 | T2 | T3 | T4 | T5 | T6 | Notes |
|---|---|---|---|---|---|---|---|
| T1 | | | | | | | |
| T2 | | | | | | | |
| T3 | | | | | | | |
| T4 | | | | | | | |
| T5 | | | | | | | |
