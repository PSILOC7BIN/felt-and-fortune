# Final report

The ACM-format final report (4–6 pages including references, submitted as PDF, due November 30).

| File | What it is |
|---|---|
| `content.py` | **Edit this.** All text, figures, the table, the algorithm, and references. |
| `build_report.py` | Pours `content.py` into the ACM template and exports the PDF through Microsoft Word. |
| `acm_submission_template.docx` | The course's ACM template (unchanged). |
| `figures/` | Screenshots of the app used in the report and the slides. |
| `Felt_and_Fortune_Final_Report.docx` / `.pdf` | Generated output. Submit the PDF. |

## Rebuild

```powershell
python -X utf8 report/build_report.py --layout
```

This prints the word count, any `[placeholders]` still left, the page count, and how full each page is. Keep the report at 6 pages or fewer. If it runs over, cut words rather than shrinking the type.

## Still to fill in

- Course number and name, institution, and email (author block and reference line)
- Section 5.2, User feedback: real results from classmates. Don’t report results that weren’t collected.
- Section 6.1, Significance: how the project meets the course objectives
- Section 4: confirm or remove “[and that the course expects one]”
- Acknowledgments: confirm the AI-tool wording matches the course policy
- References 13 and 14: open each link and add the date you accessed it. Also double-check every reference before submitting.
