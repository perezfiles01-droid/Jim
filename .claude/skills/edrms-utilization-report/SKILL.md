---
name: edrms-utilization-report
description: "Orient in the ADB EDRMS Utilization Report project and its deliverables: the prototype, the database design workbook, the requirement register and the checker workbook. Use this skill when the user mentions ADB, EDRMS, the Utilization Report, the Reporting Suite or the live site and the request is about the project as a whole rather than one side of it: what exists, what was decided, what the client asked for, what to deliver next, or how the pieces fit together. For building or changing what the report looks like, use edrms-frontend instead. For whether a figure can actually be produced, which column carries it, or any SQL, Graph call or table design question, use edrms-backend instead. Use this one when it is unclear which of those applies, because it carries the project context both of them assume."
---

# ADB EDRMS Utilization Report

## Which skill to use

Three skills cover this project, and they do not overlap.

| The request is about | Use |
| --- | --- |
| What the report looks like or how it behaves. Panels, charts, layout, captions, clicks | `edrms-frontend` |
| Whether a figure can be produced, where it comes from, SQL, Graph, table or column design | `edrms-backend` |
| The project itself. What exists, what was decided, what the client asked for, what is next | this one |

When a request needs both, answer the sourcing question first with
`edrms-backend`. A panel built on a figure that cannot be produced is worse than
no panel, and that order is what stops it being built.

## Read `STATUS.md` first, every time

`STATUS.md` at the repo root is the record of what is built, what is proven
against the test tenant, what is assumed, what is blocked and on whom, the
decisions already settled, and the errors made and corrected. It is written to
answer most questions in one pass.

`BACKGROUND.md` carries the durable context: what ADB and the report are, the
stack, the palette, the hard rules. It was written on 4 August 2026 and predates
the database design, the tenant investigation and the August revisions.
**Where the two disagree, `STATUS.md` wins.**

## What this is

The Asian Development Bank is rolling out an EDRMS (vendor AvePoint, on
SharePoint / Microsoft 365). This project is the **EDRMS Utilization Report**, a
suite of dashboards showing how the bank is adopting and using it. The RAC
committee and ITD use it to track rollout and target follow-up.

**The prototype is a specification, not the product.** The real report will be
built in Power BI. `index.html` exists so stakeholders can agree on layout and
behaviour first. If a visual has no native Power BI equivalent it does not
belong in it, however good it looks in a browser.

## The deliverables

| File | What it is |
| --- | --- |
| `index.html` | The prototype. One self contained file, six dashboards |
| `EDRMS_Utilization_Report_Checker_2026-08-13.xlsx` | Figure by figure: source, export, click by click steps, exact column heading, the arithmetic, the database column, the verdict |
| `EDRMS_Utilization_Report_Requirements_2026-08-13.xlsx` | The client requirement register, with the slide or section each came from |
| `EDRMS_Utilization_Report_Database_Design_v1.xlsx` | The design in the client's workbook format. 4 tables, 73 columns |
| `utilizationdb.md` | The same design as prose |
| `REQUIREMENTS_2026-08-13.md` | The requirement assessment as prose |
| `evidence_*.csv` | Real tenant exports, kept so claims can be checked rather than trusted |
| `EDRMS_Utilization_Report_Source_Data_v4.xlsx` | Element to source mapping. **Stale**, predates the August cut |

The checker workbook **must travel with the prototype** when it goes to the
committee. The prototype deliberately carries no source markers, so the checker
is the only place recording which figures can actually be produced.

## The six dashboards

The count and the order are the client's own, from slide 13 of their deck. Six,
not five and not eleven. An earlier eleven dashboard build was cut back to these
on their instruction, and the content worth keeping was folded in rather than
dropped.

| Key | Dashboard |
| --- | --- |
| `bw` | Bank-wide Oversight |
| `dp` | Department Insights |
| `pj` | Project Insights |
| `fp` | Institutional File Plan |
| `rd` | Retention and Disposal |
| `ra` | Records and Archive Holdings |

Do not add a seventh, and do not reorder. If something has no home, it belongs
inside one of these or it was not asked for.

## Where the project actually stands

Roughly a quarter of the client's requirements are buildable today. The rest
wait on a small number of blockers, each with a named owner, listed in `STATUS.md`.
The two that unblock the most:

- **The site to department list**, about 1,057 rows, once, from RAC. Every
  departmental split depends on it.
- **The weekly SharePoint document scan.** `public."Records"` holds declared
  records only, so every rate, percentage and "of the total" figure has no
  denominator until that scan exists.

The longest lead time item is the file plan term to document join, which has no
key anywhere and stays blocked even after the client says where the file plan
lives.

The bottleneck now is not building. It is the open questions for the client,
collected on the Questions sheet of the checker workbook.

## Working practice

**Verify by reading the real file.** Do not trust an expected column name, an
assumed API window, or a plausible figure. Section 8 of `STATUS.md` lists eleven
errors caught that way, several of which had survived weeks looking correct.
When something cannot be verified, say so and leave the cell blank. An
expectation written into a source column is indistinguishable from a verified
fact three weeks later.

**Nothing is final until the requester has looked at it.** This goes in front of
a bank committee. Present work as ready for review, never as done. Post one row
per request in their words, state every judgement call, everything you could not
do, and anything you changed that they did not ask for. Close by offering three
routes: approve, adjust, or **roll back**. Offering rollback explicitly matters,
because otherwise a half satisfied requester accepts work they are unhappy with.

Every delivered state is a commit, so any file at any point can be recovered
with `git show <ref>:<file>`. Nothing is ever stranded.

**Delivering.** Pushing from this environment works now, so changes to `main`
are live on Pages once pushed. Also send the files with `SendUserFile`, since
the requester keeps local copies. Earlier sessions could not push and delivered
by hand upload; if that returns, the upload page is
`https://github.com/perezfiles01-droid/Jim/upload/main`.

**Update `STATUS.md`** with what you built and any decision made, so the next
session does not re-ask.

## Reference files

- `references/design-system.md` colour tokens, component inventory, and the
  component to Power BI mapping
- `references/data-and-sources.md` the source tiers and known dependencies
- `scripts/utilization_tables.py` all 73 column definitions, the single source
  of truth for the design
- `scripts/build_checker.py` and `scripts/build_requirements.py` regenerate the
  two workbooks. `build_checker.py` refuses to build if a quoted export column
  heading is not a real column in the file it names
- `scripts/verify.js` and the `check_*.js` suite, the prototype checks
