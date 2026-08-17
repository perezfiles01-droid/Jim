# CURRENT STATUS

**Read this file first, before anything else in the repo.** It is the complete
record of where the EDRMS Utilization Report stands: what exists, what is proven,
what is assumed, what is blocked, and what was got wrong along the way.

`BACKGROUND.md` is still correct on the durable things (tech stack, ADB palette,
the no em dashes rule) but was written on 4 August and predates all of this.
**Where the two disagree, this file wins.**

Last updated **17 August 2026**. The client's requirements deck arrived and is
now in the repo. All six dashboards were rebuilt against it, and a serious
arithmetic bug was found and fixed. See section 3 and section 8.

**The deck supersedes the notes.** Until 17 August every slide number in this
project came from `REQUIREMENTS_2026-08-13.md`, which was somebody's notes on a
deck nobody in this repo could open. `EDRMS_Dashboard_requirements_1.pptx` is now
here, with its text at `evidence_deck_text_2026-08-17.txt`, and
`REQUIREMENTS_AUDIT_2026-08-17.md` walks all 69 slides.
**Where this file, the notes or the register disagree with the deck, the deck
wins.** Reading it directly overturned a week of second-hand references and found
a panel removal that was an error.

---

## 0. HOW TO USE THIS FILE

| If you want | Go to |
| --- | --- |
| The single most important fact | Section 1 |
| What is built and where | Sections 2 and 3 |
| **What the client actually asked for** | `REQUIREMENTS_AUDIT_2026-08-17.md`, which reads the deck itself |
| The 18 questions to put to the client | `REQUIREMENTS_AUDIT_2026-08-17.md` section 4, and section 11 below |
| The database design | Section 4 |
| What is actually proven against the tenant | Section 5 |
| What is blocked and on whom | Section 6 |
| Decisions already made, do not reopen | Section 7 |
| Mistakes made and corrected, do not repeat | Section 8 |
| Tenant identifiers, links, scripts | Sections 9 and 10 |
| What to do next | Section 11 |

**The habit that has worked:** do not trust an expected column name, an assumed
API window, or a plausible figure. Every significant error in this project was
caught by exporting the real file and reading it. Section 8 lists them.

---

## 1. THE ONE THING TO KNOW

`public."Records"` in the `drm-npr` PostgreSQL database contains **declared
records only**, about 1,990 in UAT. It holds **no row at all** for an undeclared
document.

So every figure about declared records can be produced today. Every figure that
needs a denominator cannot, because the denominator does not exist in any system
yet. That single fact explains most of what is still open.

---

## 2. DELIVERABLES

| File | What it is | State |
| --- | --- | --- |
| `index.html` | The prototype. One self contained file, **6 dashboards** | Current |
| `EDRMS_Dashboard_requirements_1.pptx` | **The client's requirements deck, 69 slides. The authority on what is wanted** | Current |
| `evidence_deck_text_2026-08-17.txt` | The deck's text, extracted so it can be searched and quoted | Evidence |
| `REQUIREMENTS_AUDIT_2026-08-17.md` | **The audit.** All 69 slides walked: every requirement, its source, its table and column, its verdict, and 18 questions to put to the client | Current |
| `CLIENT_SLIDES_2026-08-16.md` | Transcription and analysis of the twelve images of 16 Aug. The images arrived as chat attachments and are not in the repo, so this file is the record | Current |
| `REQUIREMENTS_2026-08-13.md` | The requirement assessment as prose | **SECOND HAND.** Written from notes on the deck, before the deck was readable. Superseded by the audit |
| `EDRMS_Utilization_Report_Requirements_2026-08-13.xlsx` | The requirement register. 123 requirements with slide references and verdicts | **STALE.** Slide references are second hand, and the "In the prototype?" column predates 16 and 17 Aug |
| `EDRMS_Utilization_Report_Database_Design_v1.xlsx` | **The database design**, in the client's own workbook format. 4 tables, 73 columns | Current |
| `utilizationdb.md` | The same design as prose, no code | Current |
| `evidence_SharePointSiteUsageDetail_2026-08-12.csv` | Real tenant export, 2,575 rows | Evidence |
| `evidence_SharePointActivityUserDetail_2026-08-12.csv` | Real tenant export, 30 rows | Evidence |
| `evidence_CloudGovernance_WorkspaceReport_2026-08-14.csv` | **The compliance answer.** 1,209 workspaces, 93 columns | Evidence |
| `evidence_CG_GroupsExport_2026-08-14.csv` | 676 groups. Checked and rejected, see section 6 | Evidence |
| `compliant_sites.csv` | The 1,032 EDRMS sites, shaped for `-CompliantSiteList` | Derived |
| `EDRMS_Dashboard_Contents_2026-08-17.xlsx` | **The content workbook.** 233 rows, one sheet per dashboard, every name read off the prototype itself. What each thing is, what one of them counts, whether we can build it, from which file and column, and the steps | Current |
| `EDRMS_Dashboard_Content_Checker_2026-08-17.xlsx` | The earlier content checker, hand-listed | **SUPERSEDED** by the generated workbook above |
| `EDRMS_Utilization_Report_Checker_2026-08-14.xlsx` | The checker. 109 figures, each with the steps to reproduce it by hand | **STALE.** The 109 figures predate 16 and 17 Aug. Rerun `build_checker.py` |
| `kpi_brief_total_documents.html` | Work order for the Total Documents KPI | Current |
| `EDRMS_Utilization_Report_Source_Data_v4.xlsx` | Element to source mapping, 25 findings | **STALE**, predates the 10 Aug cut |
| `BACKGROUND.md` | Durable context, stack and palette | Still correct on those |

Everything is on `main` and served at
**https://perezfiles01-droid.github.io/Jim/**

---

## 3. THE PROTOTYPE: 6 DASHBOARDS

Nav order is fixed and is **the client's own order from PPT s13**. No
placeholders remain.

**On 13 August 2026 the prototype was rebuilt around the client's dashboard
requirements.** The five dashboards below replaced the five that had stood since
July. This is the single most important thing to know about the current state:
if you are looking for Records Management or Sites and Libraries, they are gone
on purpose, and their content was absorbed rather than dropped.

| Dashboard | Key | What is on it |
| --- | --- | --- |
| Bank-wide Oversight | `bw` | **10 top tiles** per s34, all clickable: eight open a drill, two navigate to another dashboard. Overview of EDRMS sites (s16 and s35, the same table), the sovereign and nonsovereign project lists as drills (s36, s37), Comparison, Records Declaration Trend |
| Department Insights | `dp` | Department picker driving everything. 7 tiles with the client's labels, 7 drills, site list sorted and paged, library usage by file plan category behind a picker, cumulative trend, conventions, programme dates (s53 to s66) |
| Project Insights | `pj` | One project's profile, s38 alone. Eight profile fields, 7 clickable tiles with drills, 3 charts. Reads the project list from Bank-wide rather than holding a second copy. Blocked on two sources, not one |
| Institutional File Plan | `fp` | Rollup with all five categories, then one screen per category: top stats, term table, and the five indicators s48 to s52 repeat (s47 to s52) |
| Retention and Disposal | `rd` | The s44 rollup as its landing screen, then permanent and temporary as two tables because they carry different columns (s44 to s46) |
| Records and Archive Holdings | `ra` | The two tables the client drew (s68, s69) with their own headings. **Every measure reads "Not captured"**, and a notice says the dashboard is not yet specified |

**Bank-wide has TEN tiles, not eight.** s34 lists two more than the notes did:
Retention and disposal insights, and Institutional File Plan insights. They are
**navigation** tiles. That is why s44 and s47 carry the Bank-wide banner while
s45, s46 and s48 to s52 do not: **the banner marks the route in, not the
ownership.** This had puzzled the project for a week.

**The deck is two documents.** s1 to s12 are the client critiquing the OLD
prototype, s13 to s33 the outline of the new one, s34 to s69 the detailed design.
**Where the outline and the detail disagree, the detail wins.**

**Removed on 13 August**, because the client specified six key views and
eleven would have presented four superseded screens as current: `ov`, `rm`,
`sl`, `fs`, `rt`. What the requirements still ask for was absorbed onto
Bank-wide: the 8 format groups (PPT s12 said amalgamate), site health, library
health and the library rankings.

**Removed earlier, on 10 to 12 August:** the Department Performance placeholder,
the Data Design reference page (`utilizationdb.md` holds all of it), and the
standalone File Plan dashboard. **The last of those has since been reversed**,
see section 7.

### The 16 August revision: Bank-wide cut back, Project Insights rebuilt

The client supplied **twelve slides on 16 August**, transcribed and analysed in
`CLIENT_SLIDES_2026-08-16.md`. The image files themselves are not in the repo,
they arrived as chat attachments; that file is the record. Two dashboards were
then revised to follow those slides and nothing else.

**Bank-wide lost ten panels, by instruction.** The screen had grown because five
dashboards were deleted on 13 August and their content was absorbed here rather
than dropped. The client looked at the result and asked for it off. Removed:
records declared by year, the retention and disposal rollup with its permanent
and temporary split, the Supporting detail band, site visits by month, format
and storage with the declared records by format group panel, the Risk and
compliance band, site health and library health.

**Nothing was deleted from `DATA`.** Retention and Disposal still reads
`PERMANENT` and `LABEL_TOTAL`, and every figure behind a removed panel is
untouched. The panels are unshown, not unsourced, so any of them can be restored
in one edit if the client changes their mind. `check_data.js` asserts all ten
stay off, in the same way it asserts the retained headings stay on.

**One thing was kept that the instruction would have removed.** Records declared
this month is a metrics document requirement and its only home was a tile on the
by-year panel. It moved to the trend panel rather than being lost. That is the
single deviation from the instruction, and it is a restoration, not an addition.

**Overview of EDRMS sites now carries the client's column names verbatim:**
Department / office / RM, Number of EDRMS SharePoint sites, Total number of
documents, Total number of records declared, Total number of physical
counterparts. Their table has no disposal column so ours no longer does either.
The names run long, so the header cells wrap and bottom align and the table
scrolls inside its panel. **Every name is now a link**: a department opens
Department Insights on that department, and the two project rows open Project
Insights on that facility type. That is their clickable note, and it is wired
through a new shared `openDashboard()` helper plus an optional `focus()` on the
target dashboard.

**Records Declaration Trend replaced Records declared over the last 12 months.**
It is now what they drew: a **cumulative** curve, a date range filter, no
department filter, the caption "Records declared across all EDRMS compliant
sites", and the Reset button kept.

**The reconciliation changed shape with it, and this is the part worth
remembering.** A per month series **sums** to the declared total. A cumulative
one does not: its **last point** equals the total. Asserting the wrong one
passes happily on a chart that is wrong by a factor of six. Both the sum on the
underlying monthly series and the endpoint on the derived curve are now
asserted, on Bank-wide and again per project.

**The date range snaps to whole months**, and the summary line says which months
are actually shown. The 12 August rule "no day level picker" was taken for the
**usage panels**, where a week is the smallest unit the M365 data holds. It does
not apply here: `public."Records"` carries a declaration timestamp per record, so
a day level cut is producible later. What cannot honour one today is this
prototype's monthly totals, which is a different limitation and a temporary one.

**Project Insights was rebuilt to their slide 1.** The eight field profile grid
stays. The tiles are now **seven, with the client's own labels, and all seven are
clickable** because all seven are underlined on their drawing; each opens its own
drill table, site by site, and the site rows sum to the project. The two donuts
were replaced by the three charts they drew: a users pie split staff,
consultants and contractors, the cumulative declaration trend, and documents
against records declared read site by site with the declaration rate alongside.
The project tables carry their column names verbatim and each row opens that
project below.

**A new blocker was found doing it.** Project Insights was recorded as waiting on
one missing thing, a site to project register. Their slide 1 adds a second: the
eight profile fields, facility type, modality, country, status, effectivity and
closing dates, come from an **ADB project system that has never been named in
this work**. Even with the register, the top third of that screen stays empty
without it. Both are now questions 2 and 7 in `CLIENT_SLIDES_2026-08-16.md`.

### 17 August: all six dashboards rebuilt to the deck

Department Insights, Institutional File Plan and Retention and Disposal were
rebuilt against `EDRMS_Dashboard_requirements_1.pptx` itself. **All six
dashboards now trace to a slide, and nothing on any of them traces to a word
list.**

**Department Insights, s53 to s66.** Seven tiles with the client's own labels,
all clickable per their note. The Go-Live date sits above them as s53 draws it
and reads Not captured. Seven drills, one per tile, with verbatim column names:
sites (s55, sorted and paged), users by division (s54), visitors (s56),
documents (s57), record declaration with collapsible division rows (s58),
physical counterpart (s59), disposal by library (s60). Library usage by file
plan category (s61 to s66) behind a picker rather than six screens. Cumulative
trend (s24). Conventions and programme dates (s26, s28).

**Institutional File Plan, s47 to s52.** The rollup with all five categories and
their column names, then one screen per category with the top stats, the term
table and the five indicators every one of s48 to s52 repeats. **Removed:
"Declaration by classification and business process". Neither "classification"
nor "business process" appears anywhere in 69 slides.**

**Retention and Disposal, s44 to s46.** The s44 rollup is now this dashboard's
landing screen, which is what the deck makes it: s44 is its slide 1, reached
from the Bank-wide tile of the same name. It was briefly duplicated on Bank-wide
and is not any more. s45 and s46 are drawn as **two tables**, because they carry
different columns: permanent has a document count and no retention label,
temporary has the label, the due date and the disposed count. **Removed:
"Disposition risk" and "Records with and without a schedule". Neither appears in
the deck.**

### The split bug: five copies, two ways wrong, totals silently broken

Found by an assert while rebuilding Department Insights, and it is the most
serious defect this project has had.

`split()` shared out a whole number across weights and existed in **five
near-identical copies**. It did `Math.max(1, round(total*w/s))` and then dumped
the remainder on the first element. With ITD's 104 sites sharing 75 records due,
the forced minimum of one pushed the sum to 104 and **the first row went to
minus 29**. Three of the five copies then clamped the negative to zero, which
fixed the appearance and **silently broke the total**: a department showed 103
records due against a real 75, and every assert checking that sum was reading
the clamped figure and passing.

Replaced with one shared `splitTotal()` using largest remainder: floor each
share, then hand the leftover units to the rows with the largest fractional
parts. Non-negative by construction, exact by construction, with its own asserts
for the case that broke it. **One definition, five call sites.**

The lesson is the one this project keeps relearning: a plausible number that
reconciles against another plausible number is not verification. The bug
survived because the checker compared two figures that were both wrong.

### 17 August: Records and Archive Holdings stripped of invented figures

**Client instruction: nothing from Opus.** Slide 67 is a screenshot of the IR
Dashboard with "We would also like to learn what is available in Opus and how we
can apply the features for our dashboard", and it puts retrieval in eServe. None
of that is a source we have, and the client has confirmed nothing from Opus goes
in.

**The dashboard was worse than an Opus dependency.** It printed 1,840 boxes,
9,260 folders, 78 percent of capacity used and retrieval counts per location,
none of which had any source. The capacity chart was the sharpest case: s68 asks
**us** "Can room capacity and % available storage capacity be included?", and we
were answering their open question with an invented chart.

**What it is now.** The two tables the client actually drew, s68 and s69, with
their own column headings including Remarks and their status vocabulary (loan,
return to owner, for disposal), and **every measure reading "Not captured"**. The
indicators each slide asks for are listed rather than drawn, because drawing them
means inventing them a second time. A notice at the top says the dashboard is not
yet specified and why.

**Why keep it at all.** s13 names it as one of the six key views, and s68 and s69
are drawn with real column headings, so the **shape is a requirement even though
the content has no source**. A reader can now see exactly what was asked for and
that nothing fills it, which is the conversation this dashboard needs to start.
Audit question 17.

**The general rule this settles.** Where a measure has no source anywhere, the
prototype prints "Not captured" rather than a plausible figure. Applied so far to
Turned over to RAC (s42), the disposal approver and the three status columns
(s43), and now the whole of Records and Archive Holdings.

### 17 August: the deck arrived, and the audit that followed

**`EDRMS_Dashboard_requirements_1.pptx` is now in the repo**, 69 slides, with its
text at `evidence_deck_text_2026-08-17.txt`. Until today every slide number in
this project came from `REQUIREMENTS_2026-08-13.md`, which was somebody's notes
on the deck. **`REQUIREMENTS_AUDIT_2026-08-17.md` replaces that**, and it is now
the authority: every requirement, its source, the table and column it lands in,
and where it fails, the exact question to put to the client.

**What the deck's own structure told us, which the notes had missed.**

1. **Bank-wide has TEN top panel tiles, not eight.** s34 lists two more:
   Retention and disposal insights, and Institutional File Plan insights. They
   are navigation tiles. **That is why s44 and s47 carry the Bank-wide banner
   while s45, s46 and s48 to s52 do not**: the banner marks the route in, not
   the ownership. This had puzzled the project for a week
2. **s16 and s35 are the same table**, once in the outline and once as the drill.
   It now appears once, as the drill behind tile 1
3. **s36 and s37 are Bank-wide screens**, so the sovereign and nonsovereign
   project lists moved there as the drills behind tiles 2 and 3. Project Insights
   is s38, one project's profile, and it now reads the project list from
   Bank-wide rather than keeping a second copy
4. **The deck is two documents.** s1 to s12 are the client critiquing the OLD
   prototype, s13 to s33 the outline of the new one, s34 to s69 the detailed
   design. Where the outline and the detail disagree, the detail wins

**One removal on 16 August was an error, and is corrected.** The retention and
disposal rollup **is drawn, on s44**, under the Bank-wide banner. It came off
because it was named in the instruction, not because it was undrawn. It is back.

**Eleven of the twelve removals were right**, confirmed against the deck's text
rather than a register. The words "site health", "library health", "duplicat",
"orphan", "sensitivit" and "classification" appear **nowhere in 69 slides**.
Format groups are demoted by s12 in the client's own words.

### 17 August, later: every unsourced measure comes OFF the page

**The "Not captured" convention is withdrawn.** It did its job, which was to
stop plausible figures being invented in cells nobody can fill, and the audit
trail it created is what made the removals below safe. But a screen dense with
empty cells reads as a broken report, and this goes to a committee.

**Client instruction: remove what cannot be captured.** The scope chosen was
**remove the columns, keep all six dashboards.** Records and Archive Holdings
survives, because s13 names it one of the six key views.

**What came off, and the question each one still leaves open:**

| Removed | Screen | Still blocked on |
| --- | --- | --- |
| Staff, contractor, consultant, training, onboarded | s39, s54 | The user register, question 3 |
| Turned over to RAC | s42 | A custody event, question 6 |
| Disposal approver, Approved, Declined, Extended | s43, s60 | The change request, question 7 |
| Number of records disposed | s44, s46 | The same change request |
| Records and users declared per division | s41, s42, s58, s59 | Division, question 5 |
| Go-Live date | s53 | The go-live date, question 4 |
| Documents migrated, users migrating, migrated size | s57 | s11 versus s57, question 9 |
| Visitors internal and external, access requests | s56 | Question 15, and a check we owe |
| Number of users per library | s61 to s66 | Nothing. **M365 reports activity per SITE, never per library.** No source will ever fill it |
| Physical counterpart completion rate | s42, s59 | Question 6 |
| Boxes, folders, requests, capacity, retrievals | s68, s69 | The whole dashboard, question 17 |

**Where a column was removed, a derivable one took its place** rather than
leaving a narrower table: declaration rate, share of department, share with a
counterpart, views per visitor. Those are arithmetic on columns already on the
row, so they add nothing to the sourcing burden.

**Records and Archive Holdings is now a specification, not a table.** s68 and
s69 are drawn with real column headings, so the shape is a requirement. They are
listed as **the columns each screen needs** rather than drawn as a grid of empty
cells, because a table of blanks reads as broken while a list of columns reads
as what this still is. The four KPI stats are gone.

**The absence is asserted, in three places.** `check_data.js` walks all six
dashboards and fails if the words "Not captured" or any `.nosrc` cell reappear.
`check_stage3.js` asserts records disposed is absent and that Holdings carries
two column specs. `check_department.js` asserts the Go-Live line is absent
rather than empty. **Asserting the absence is the point:** a later edit that
restores one of these would put a blank column in front of the committee, and
the removal record above is the only thing keeping the questions alive.

**The risk this accepts, stated plainly.** A gap the client can see is a
question they can answer. A gap we delete is a requirement that disappears. That
is why every removal is in the table above and in the content checker workbook,
and why the questions in `REQUIREMENTS_AUDIT_2026-08-17.md` section 4 are now
the **only** place several of these requirements survive. If that file is lost,
the requirements are lost with it.

### The superseded convention, kept as history

**A cell with no source prints "Not captured".** This is not
the source marker convention removed on 13 August, which badged sourceable
figures. It is the value of the cell. Applied to "Turned over to RAC" (s42, no
system records a physical custody event) and to the disposal approver and the
three status columns (s43, they need the change request). **An invented number in
a cell nobody can fill is the failure mode that would embarrass this report.**

**A reconciliation error found by an assert, worth recording.** The six named
projects had been given the client's own figures from s38, where one project
holds 9,596 declared records. This prototype's entire declared holding is 21,646,
so one project was 44 percent of the bank. **Project sites are a re-cut of the
estate, not an addition to it**, so project figures are now derived as a subset:
named projects sum to no more than their facility row, and the two facility rows
sum to no more than the bank-wide figure. All three are asserted.

**The design recommendation to put to the client.** Their deck puts the same four
measures, documents, records declared, physical counterparts and records due, on
nine different screens, grouped nine different ways. That is not nine
requirements, it is one measure set and six groupings. **Built once as a single
document-level table with a different `GROUP BY` per screen**, every screen
reconciles to the same bank-wide total by construction rather than by luck. This
changes nothing the client sees and a great deal about what it costs to maintain.

### The 17 August follow-up: everything undrawn comes off

Asked which Bank-wide elements trace to a slide, two did not: **Records quality**
(duplicated and orphaned records) and **Information classification** (sensitivity
labels, confidential and restricted counts). Both came from the proposed metrics
document, which is a word list with no screen drawn. The client asked for them
off, and they are off.

**This overrides the 14 August rule, it does not apply it.** That rule said a
panel comes off only if it is undrawn **and** unsourceable. Both of these are
buildable today: duplicates are a self join on `T1 c4 Title`, and
`T1 c34 SensitivityLabelName` is in the design. So the standard for Bank-wide is
now stricter than for the rest of the suite: **on this dashboard, undrawn is
enough.** Whether that standard should spread to the other five is not decided.

**Five metrics document requirements now have no home anywhere on the page:**
duplicated records, orphaned records, records with sensitivity labels, restricted
records, confidential records. They moved in `check_data.js` from the list
asserted present to the list asserted absent, so the loss is recorded rather than
silent, and any of them can be restored in one edit.

**Every band left on Bank-wide traces to a slide:** the top panel and its five
drills (`s15`, `s34`, `s39` to `s43`), Overview of EDRMS sites (`s16`, `s35`,
sortable per `s5`), Comparison (`s6`, `s17`), and Records Declaration Trend
(`s10`, `s18`, redrawn to the 16 August image).

**Slide numbers in this file are now first hand.** Every reference dated 17
August or later was checked against `evidence_deck_text_2026-08-17.txt`.
References dated 13 or 14 August came from the notes and have not all been
re-checked; treat those as indicative until they are. The twelve images of 16
August are a separate, unnumbered set and cannot be cited by slide.

**"Turned over to RAC" is fixed.** Bank-wide's physical counterpart drill printed
it as 58 percent of the counterpart count with nothing sourcing it. It now reads
"Not captured", because no system records a physical custody event (s42).

### The source marker convention, agreed 13 August

The redesign put roughly four fifths of the page beyond what any source can
fill, so a reader cannot tell a real figure from an aspiration by looking. Every
panel therefore carries one of four markers, or none at all:

| Marker | Meaning |
| --- | --- |
| no marker | Sourceable from the 73 column design as it stands |
| `.src.part` | Partly sourceable, and the marker says which half is not |
| `.src.dept` | Waiting only on the site to department list from RAC |
| `.src.none` | No source identified anywhere |
| `.src.ref` | Not a measurement at all. A list somebody must maintain |

An unsourceable cell prints the words **no source** rather than a plausible
number. This supersedes the 11 August decision that dashboards carry no caveat
boxes, which was taken when the prototype was five dashboards that all had a
source path.

### Captions name the measure, never its provenance

Agreed 13 August. A panel caption says what the figure is, not where it comes
from or how it was derived. No "sourceable today", no "reads FileCreatedDate",
no slide references, and **no computed numbers in a caption or a summary line**,
so a label does not change when the data behind it does. Source status lives in
this file and in the requirement register, not on the page.

**Site activity trend by month** was removed on 13 August and restored the same
day, now filterable by department and by period (3, 6 or 12 months). The cut it
offers is the one the source supports: the site activity table carries a visit
count and a department owner on the same row, so department is a real filter
rather than an invented one. Each month is split across departments by their
share of sites, so a department series always adds back up to the bank-wide one,
and `check_data.js` walks all sixteen to prove it.

**The rule that governs the arithmetic:** a range sums `SiteVisits7` and never
the 30, 90 or 180 day figures. Consecutive 7 day windows tile exactly, longer
ones overlap and would count most days several times over. Getting it wrong
produces a plausible wrong number, not an error.

### KPI cards: interactive or static, never ambiguous

A card with the `.tap` chevron promises a click. A card without one promises
nothing. **They must never disagree**, and `check_affordance.js` fails the build
when they do. 36 cards across the 6 dashboards.

Before 10 August every static card said "Opened below" and carried the selected
rail, so readers clicked and thought the page had hung.

### The base figures live in one place

`DATA`, in the `data.js` block, holds the departments, the declaration series,
the retention labels, the format groups and the site and library health figures.
Before 13 August each of these was owned by whichever dashboard displayed it and
read out of that dashboard's `summary`, so deleting a dashboard would have taken
the data with it. A figure that appears on three dashboards is now defined once
and read three times, and everything that must reconcile is asserted on load.

### The period control is gone with the usage panels

Until 13 August the usage panels offered **Last 7 / 30 / 90 / 180 days** and
**By month**, with deliberately **no day level calendar**: a week is the
smallest period the data holds, so asking for 8 to 15 January could only be
answered with 134 (which really covers 4 to 17), 0, or 78 (pro-rated, invented).
Constraining the input meant nobody could ask a question the data cannot answer.

The client's redesign carries no usage panels, so the control went with them.
**If usage panels ever return, that rule returns with them.** It is recorded
here because it is the kind of reasoning that is expensive to rediscover.

---

## 4. THE DATABASE DESIGN: 4 TABLES, 73 COLUMNS

| Table | One row per | Rows | Retained? |
| --- | --- | --- | --- |
| `rpt.utilization_report` | document | 3.47M | **Replaced** each week |
| `rpt.utilization_site_activity` | SharePoint site | 1,057 | **Retained** |
| `rpt.utilization_user_activity` | person | 9,400 | **Retained** |
| `rpt.utilization_file_plan` | term | a few hundred | **Retained** |

**Why four and not one.** A site with no documents vanishes from a document
count. Visit figures are per site and become nonsense repeated on document rows.
People cannot be counted from a table of sites, since someone in three sites
appears three times. File plan terms are none of those things.

**No audit base class**, unlike the application tables. Nobody edits a row a job
wrote. `SnapshotDate` and `RowLoadedDate` do that work.

**Thresholds are not stored.** `LastActivityDate` is a fact; "inactive after 90
days" is a judgement the report makes. Changing 90 to 120 is one edit in Power BI.

### The three query rules

Getting any of these wrong produces a plausible wrong number, not an error.

1. **Read the latest snapshot by default**, or 1,057 compliant sites silently
   becomes 55,000 after a year
2. **A range sums `SiteVisits7`**, never the 30/90/180 figures. Consecutive 7 day
   windows tile exactly; longer ones overlap and would count most days repeatedly
3. **Match on `ReportRefreshDate`, not `SnapshotDate`.** The first is what
   Microsoft measured, the second is when the job ran, and they differ

---

## 5. WHAT IS ACTUALLY PROVEN

73 columns. **15 confirmed with evidence, 36 still to test, 22 need no test.**
The `Verification tracker` sheet in the workbook has every one.

### Confirmed, with what proved it

| Column | Source | Evidence |
| --- | --- | --- |
| `SiteId` | Site usage CSV, `Site Id` | Populated on all 2,575 rows |
| `SiteVisits7/30/90` | `Page View Count` | Site usage CSV, period 30 |
| `LastActivityDate` (site) | `Last Activity Date` | 381 of 1,918 live sites |
| `StorageUsed` | `Storage Used (Byte)` | Sums to 142.4 GB |
| `SiteOwner` | `Owner Principal Name` | 1,899 of 1,918; **19 have none** |
| `ReportRefreshDate` | `Report Refresh Date` | 2026-08-10 with period 30 |
| `SiteCreatedDate` | Graph `createdDateTime` | Returns on every site |
| `UniqueViewersAllTime` | Graph `actorCount` | Returned 12 |
| `FileSize` | Graph `size` | 1,506 to 2,338,767 bytes |
| `UserPrincipalName` | `User Principal Name` | Activity CSV, 30 rows |
| `LastActivityDate` (user) | `Last Activity Date` | 25 of 30 rows |
| `ViewedOrEditedFileCount` | `Viewed Or Edited File Count` | **Only 8 of 30 above zero** |

### Measured tenant figures, quote these as real

| Figure | Value | How |
| --- | --- | --- |
| Sites in the tenant | 1,676 | `Get-PnPTenantSite` |
| Sites in the usage export | 2,575, of which 1,918 live | Site usage CSV |
| Sites holding documents | 1,071 | `File Count` above zero |
| Documents across them | 32,833 | Sum of `File Count` |
| Tenant storage | 142.4 GB | Sum of `Storage Used` |
| Sites without an owner | 19 | Blank `Owner Principal Name` |
| Licensed users | 30 | Activity CSV rows |
| **Monthly active users** | **8** | Rows with activity above zero |
| Rows in `Records` | ~1,990, 1,984 distinct documents | Direct query |
| Unique viewers, one site | `actionCount 5535, actorCount 12` | Graph analytics |
| Purview retention labels | 53, flat list | File plan page |

**1,057 compliant sites is NOT measured.** It is a placeholder inherited from an
earlier prototype. Say so whenever it comes up.

---

## 6. WHAT IS BLOCKED: 6 COLUMNS, 4 QUESTIONS

Shaded red in the workbook. **Nothing here is a technical limitation.**

| Column | Missing | Who resolves |
| --- | --- | --- |
| `ADBDepartmentOwner` (both tables) | A site to department list | **RAC**, ~1,057 rows, once |
| `IsEdrmsCompliant` (both tables) | How to detect the app across 1,057 sites | **Dev**, one query |
| `FormatGroup` | Which extensions map to the 8 groups | **RAC**, a short list |
| `CategoryName` | Where the institutional file plan lives | **Client** |

### Gap 1, department. Approach confirmed, list outstanding

`ADBDepartmentOwner` exists as a SharePoint column and is **empty on every row**.
The term store holds the vocabulary, not the assignment.

**The fix, confirmed feasible by Mihal Le on 10 Aug 2026:** load a site to
department mapping into `ADBSites` and let documents inherit through `SiteUrl`,
which every existing row already carries. **No migration.** His earlier "we need
migration" answer assumed department is stored per document; it is correct under
that assumption and irrelevant under ours.

Open with RAC: is it acceptable that every document in a CWRD site counts as
CWRD? The drill assumes yes.

### Gap 2, file size. CLOSED

Graph returns `size` on every item. Warning: folders return a **cumulative** size,
so the scan must filter to files only or storage is double counted.

### Gap 3a, site created date. CLOSED

Graph `/sites?search=*` returns `createdDateTime`.

### The test tenant and the ADB tenant

**The method transfers. The numbers do not.** Everything proved in this project
was proved against **7rkd12**, the test tenant. Treat the METHOD as valid for ADB
production: the same reports exist, under the same names, with the same column
headings, and the same rules govern them. Microsoft and AvePoint do not ship
different products to different tenants.

What does **not** transfer is any figure. 1,032 compliant sites, 1,676 sites,
32,833 files, 26,660 documents, 1,990 declared records, 53 retention labels: all
test tenant. Re-run each export against production and read the real number.

**Two things change for ADB, and only two.** Swap the tenant name in every admin
URL, so `7rkd12-admin.sharepoint.com` becomes ADB's equivalent. And point Cloud
Governance at ADB's own AvePoint Online Services instance. Every click path,
column name, Graph call and SQL statement is unchanged.

**The four exports that reproduce the whole project in production:**

| # | Export | Where | What it gives |
| --- | --- | --- | --- |
| 1 | **Cloud Governance Workspace report** | AvePoint Online Services, Cloud Governance, Directory, Workspace report, Export report, collect from Job monitor | The compliant site list via `EDRMS Site Type`, the site to department mapping via `Department`, plus owner, storage, activity, status. **Highest value single file in the project.** Ask Leah Bancale |
| 2 | **SharePoint site usage report** | admin.microsoft.com, Reports, Usage, SharePoint site usage, Export | `File Count` per site. Join to 1 on Site Id for the interim document total |
| 3 | **SharePoint activity user detail** | admin.microsoft.com, Reports, Usage, SharePoint activity, Export | One row per **licensed** user, not per active user. Filter on Viewed Or Edited File Count above zero |
| 4 | **The drm-npr database** | Any SQL client, `public."Records"` | Declared records only. Everything else needs the weekly scan, which needs export 1 to know which sites to scan |

Exports 2, 3 and 4 have been run against the test tenant and their columns are
verified. Export 1 has been run against the test tenant and its 93 columns are
profiled. **None has been run against production.**

### Gap 3b, compliance. CLOSED 14 August, by Cloud Governance

**The compliant site list is a business register, not a technical detection
problem.** That reframing is the whole answer, and it came from the client.

AvePoint Cloud Governance, Directory, **Workspace report**, exports 93 columns
with one row per workspace. The column **`EDRMS Site Type`** is the marker. In
the test tenant it is populated on **1,032 of 1,209** workspaces with a single
value, `EDRMS Project Site`. The 177 blanks are template and admin sites:
`edrmstemplate`, `template_drmdefault`, `app_edrms_data`.

**1,032 against the 1,057 placeholder** that has been in the prototype since
before this project. Nobody could justify that number. It was close.

`compliant_sites.csv` is that filtered list in the shape both scan scripts
already accept via `-CompliantSiteList`. **No code change was needed**, because
the compliance test was deliberately isolated in one function.

**Why the register beats the technical test.** A site RAC designated as EDRMS
where the app deployment failed vanishes entirely under an app-installed test,
and nobody ever learns it is broken. Under the register it appears with zero
declared records and somebody asks why. **That gap is a compliance finding worth
reporting**, and it exists only if you hold the business list.

**Leah Bancale confirmed on 14 August** that EDRMS sites exist which did not come
through Cloud Governance originally, and that those are converted to become
compliant. So the CG **created** list alone would be incomplete: it would miss
every converted site, and those are the older, established departmental sites
most likely to hold the largest volume of declared records.

**Four things still to do, none of them blocking:**

1. **Get the PRODUCTION export.** Everything above is structure learned from
   `7rkd12`. One export from Leah gives the real compliant count, the real
   department mapping and the real go-live dates. Highest value single file in
   the project.
2. **Confirm a converted site is recorded in Cloud Governance the same way a
   created one is.** If conversion is done by installing the app directly, there
   is a second list somewhere and it needs an owner.
3. **Validate the register against the app once**, on about twenty sites, both
   directions. A register records intent. The app records reality. They drift and
   nothing announces it.
4. **The 90 versus 300 day inactivity threshold** is still unanswered, and now
   sits on a live panel.

The earlier note stands as history: Site Contents shows the catalog and the
installed app as separate rows, and the `App` row's Modified date differs between
sites so it is not a bulk stamp. **That is no longer the route**, but it remains
the way to validate step 3 on a sample.

### Gap 1, department. Source found 14 August, with a complication

The same Cloud Governance export carries **`Department`, populated on 1,030 of
the 1,032** EDRMS sites. This is the site to department mapping RAC has been
asked for since the start, which 29 requirements and the whole Department
Insights dashboard have been waiting on.

**It is not clean. 240 sites carry several departments**, semicolon separated:
`ADBI;BOD`, `CWRD;SARD`, `ADBI;BOD;CSD;CWRD;SARD`. That is 23 percent.

**This contradicts a decision settled on 10 August**, that department attaches to
the site and every document inherits it, one department per site. Roughly a
quarter of sites do not work that way. Either a document counts to several
departments, **and then departmental totals will not sum to the bank-wide
figure**, or one department is chosen as primary and the rest are dropped.

**That is RAC's call and it is new.** It is the only finding of 14 August that
invalidates something already agreed, so it is the first thing to raise.

`Division` exists as a column in the export and is **empty on all 1,032 rows**.
That moves division from "we have not found the source" to "no source has it",
which is a much stronger thing to tell the client.

### What else the Cloud Governance export carries

All 100 percent populated over the 1,032, all previously missing or partial:

| Column | What it unblocks |
| --- | --- |
| `Last Active Time` | Site inactivity. The M365 usage export fills its equivalent on only **381 of 1,918** live sites |
| `Primary Business Owner` | Site ownership. The SharePoint export had **19 sites with no owner** |
| `Storage Used (GB)`, `Storage Quota (GB)` | Storage per site, plus quota, which no other source had |
| `External Sharing for Site` | Part of S/N 120, previously "needs new data source" |
| `Status` = Active / Locked / Archived | **S/N 15, sites archived**, blocked on "no definition". Cloud Governance has one |
| `Site Status` = Deleted | **S/N 14, sites deleted**, previously "needs new column or join" |
| `Created Time` | Site creation date. **NOT the EDRMS go-live date**, see below |

**Correction worth keeping.** `Created Time` was first written up as the per site
go-live date. That was an inference, not a measurement. It records when the
**site** was created. For a converted site the site existed first and became
EDRMS later, and **no column in the export records that date**. Every date column
was checked. The likely home is **Job monitor**, whose job types include
`Site manual import` and `Apply profile for site`, both timestamped.

### Two Cloud Governance reports that were checked and rejected

**Groups export**, 676 rows. `Site URL` and `EDRMS Site Type` are empty on every
row, so it does not join. Joining on the group email local part reaches only
**207 of the 1,032** EDRMS sites, and `Owners` and `Members` are **counts, not
names**, so it cannot produce users per department even where it joins.

That produced a finding worth more than the report: **1,028 of the 1,032 EDRMS
sites are `Team site (no Microsoft 365 group)`**. A site with no group has no
group membership, so **users per site cannot come from group membership at all**.
Together with the existing finding that SharePoint reports viewers per site and
never per library, every "who has access" requirement is harder than it looks:
S/N 23, S/N 51, S/N 56, and the visitors internal versus external split.

**User activity report** records Cloud Governance activity, not SharePoint
activity, so it cannot contribute to Total EDRMS Users.

### The file plan: source unknown

The five categories in requirement section 3 exist in **neither** system:

- **Term store** groups are ADB, ADB Exchange, ADB Test, ADB-Test, CPM Terms,
  Deleted Required, Emails, File Type, Finance. Inside `ADB` are six term sets
  (DRM Classification Information, Physical Record Justification, Physical Status,
  Deletion Required, EDRMS Declaration Status, EDRMS Site Type), 16 terms, 1 level
  deep. These are **dropdown value lists**, not a classification scheme
- **Purview file plan** holds 53 retention labels as a **flat list**. No term sets,
  no hierarchy, no depth

The requirement says "terms" five times, which is term store vocabulary. But the
term store does not hold it either. **This is a question for the client.**

### Not designed in at all, and why

| Wanted | Why not |
| --- | --- |
| Field office, sovereign / nonsovereign | No source anywhere |
| Users per library | SharePoint reports viewers per site only |
| Most used libraries | Same, no per library activity |
| Site activity trend by month | Needs history; now possible, see section 7 |
| Sites archived | Needs a definition first |
| Physical records, section 6 | `PhysicalRecords` designed in the workbook, never built. No boxes, locations or facilities anywhere |
| Disposal workflow (8.1.4 to 8.1.6, 8.3.3) | Needs `DisposalStatus`, an application change |
| Conventions and programme dates (2.1.3, 2.1.4) | Not measurements. A reference list somebody maintains |

---

## 7. DECISIONS MADE. DO NOT REOPEN

| Decision | Date | Detail |
| --- | --- | --- |
| Department is attached to the **site**, not the document | 10 Aug | Confirmed feasible by dev, no migration |
| Division removed entirely | 10 Aug | Empty in `ADBMeta`, nothing supplies it |
| Four tables, one per grain | 10 to 11 Aug | Document, site, person, term |
| Nothing pushes to PostgreSQL | 11 Aug | A job pulls. Microsoft and AvePoint cannot write to it |
| **History is kept** on the three small tables | 12 Aug | `SnapshotDate` in the primary key, job inserts |
| The Utilization Report Table is still replaced | 12 Aug | 180M rows a year otherwise, and unnecessary |
| Date range starts at the first job run | 12 Aug | History never captured cannot be recovered |
| No day level picker on usage panels | 12 Aug | A week is the smallest unit the data holds |
| Department is a **filter**, not a column | 11 Aug | The row is about a site |
| No amber caveat boxes on dashboards | 11 Aug | **SUPERSEDED 13 Aug.** See the source marker convention in section 3 |
| **Six dashboards, the client's own list** | 13 Aug | PPT s13 and s14. Not five, not eleven |
| **Division is back** | 13 Aug | Client instruction, reopening the 10 Aug removal. Still nothing populates it, so every panel carrying it is marked no source |
| **A standalone File Plan dashboard is back** | 13 Aug | Client instruction. PPT s13 names it a key view and s47 to s52 give it six screens |
| Base figures live in `DATA`, not in a dashboard | 13 Aug | Defined once, read six times, asserted on load |
| Unsourceable cells print "no source" | 13 Aug | Never a plausible number |
| **A panel comes off only if it is undrawn AND unsourceable** | 14 Aug | Client instruction, then narrowed. 3 panels cut, see below |
| **Bank-wide returns to the client's own screen** | 16 Aug | Client instruction. The ten panels absorbed on 13 Aug come off. Figures kept in `DATA`, panels unshown not unsourced |
| **The declaration trend is cumulative, not per month** | 16 Aug | Their drawing. A cumulative series ENDS at the total, it does not sum to it. Asserted both ways |
| **A day level range is allowed on declaration panels** | 16 Aug | The 12 Aug "no day level picker" rule was about the usage panels, where a week is the smallest unit the data holds. `Records` carries a per record declaration date, so it does not bind here |
| **Client column names are used verbatim** | 16 Aug | Client instruction. The design accommodates the long names rather than shortening them |
| **Undrawn is enough, on all six dashboards** | 17 Aug | Supersedes the 14 Aug rule. See below |
| **A cell with no source prints "Not captured"** | 17 Aug | The value of the cell, not a badge on the panel. Distinct from the source marker convention |
| **Nothing from Opus** | 17 Aug | Client instruction. s67 puts retrieval in eServe and asks what Opus offers. Neither is a source we hold |
| **The detailed design beats the outline** | 17 Aug | The deck disagrees with itself in places. s34 to s69 win over s13 to s33 |
| **No figure is a fixed fraction of a figure shown beside it** | 17 Aug | If the measure has a source it gets its own base figure in `DATA`. If it has none it comes off the page. Enforced by `check_literals.js` |
| **Every measure gets its own weight vector** | 17 Aug | Sharing one makes every ratio between two measures constant down the table. Found three times. `weights()` and `check_constants.js` |

### Undrawn is enough, all six dashboards. Settled 17 August

The 14 August rule said a panel comes off only if it is undrawn **and**
unsourceable. Bank-wide was held to a stricter standard on 17 August by client
instruction: **on that dashboard, undrawn was enough**, and Records quality and
Information classification came off even though both are buildable today. That
left two standards running side by side, which was recorded as undecided.

**It is now decided: undrawn is enough, everywhere.** If the client did not draw
it on a slide, it is not on the page, whether or not we could build it.

**This cost no removals.** Every panel on all six dashboards was traced to the
deck text before the decision was recorded, and all of them land on a slide,
including Conventions and programme dates, which is drawn on s26 and s28 despite
being a reference list rather than a measurement. The 17 August rebuild had
already reached this standard panel by panel; the rule now says so explicitly, so
the next addition is tested against it rather than argued about.

**What this rules out.** The proposed metrics document is a word list. Nobody drew
a screen for its 26 requirements and nobody said what a panel should show. Those
now need a client instruction to enter the prototype, not merely a source.

**Five requirements have no home anywhere as a result:** duplicated records,
orphaned records, records with sensitivity labels, restricted records,
confidential records. They sit in `check_data.js` on the list **asserted absent**,
so the loss is recorded rather than silent, and any of them is one edit to
restore.

### The 14 August cut: undrawn and unsourceable

The 123 requirements have two sources, and the register records which: **97 are
drawn on a slide** in the client's deck, **26 come from the proposed metrics
document only**. The metrics document is a word list. Nobody drew a screen for
those and nobody said what the panel should show.

Applied literally, "not on a slide means off the page" removed ten panels. That
was too blunt: **six of the ten were buildable today**, and one of them,
Declared records by format group, is asked for on **PPT s12** ("adds nothing
except total size and storage growth, amalgamate it"), which the register files
under the metrics document because that is where the detail is worded. Cutting
it contradicted a direct client instruction.

So the rule was narrowed. **A panel comes off only if it is both undrawn and
unsourceable.** Three panels and two tiles failed that test:

| Cut | Requirement | Why it cannot be built |
| --- | --- | --- |
| Search and usage analytics | S/N 121 to 123 | SharePoint search analytics are tenant level, not exposed per record |
| Access management | S/N 120 | Access requests and external sharing need audit log data, a different Graph surface |
| Physical inventory | S/N 103 | Needs a physical records system. No boxes, locations or facilities in any source |
| Tile: Most used libraries | S/N 111 | No per library activity feed exists, only per site |
| Tile: Orphaned libraries | S/N 114 | We hold a site owner, not a library owner |

**Restricted and confidential records, S/N 119, survived the Access management
cut** because they were already tiles on Information classification. They follow
from the sensitivity label, which is column 34 of the design.

**Everything else stayed**, including the seven panels the first pass removed:
site visits by month, format groups, site health, library health, records
quality, information classification, and records with and without a schedule.

**`check_data.js` asserts the decision in both directions:** eighteen retained
metrics headings must be on the page, ten withdrawn ones must stay off.
Asserting the absence is the point, since a later edit that restores one would
put an undeliverable panel in front of the committee, and undeliverable is worse
than missing.

**One rename, not a cut.** "What is computable, and what is not" on Retention
and Disposal maps to no requirement by title, but its contents are the disposal
due windows and records beyond retention period, S/N 40 and S/N 95, drawn on
s34 and s43. It is now "Records falling due, and records past retention", which
also brings it into line with the caption rule.

**Two open items this leaves.** Site health is on the page but its threshold is
unsettled: the deck says 90 days, the metrics document says 300, which is open
question 6. And the requirement register's "In the prototype?" column is stale
for these rows; it is generated by `build_requirements.py` and needs a rerun.

### Bank-wide reordered, 14 August

Bank-wide carries 42 of the 123 requirements and had grown to eleven panels, of
which **only five come from its own requirements**. The other six arrived on
13 August, when five dashboards were deleted and their content was absorbed here
rather than dropped. The client's Bank-wide is a compact screen: eight top tiles,
each opening a drill, plus a department table, a comparison, a declaration trend
and a retention rollup. That is s15, s34 and s39 to s43.

**The treemap is gone.** PPT s5 asked for a sortable alphabetical department
table to *replace* it, and the register's own action reads "replace the rollout
treemap with a sortable department table". The page was showing both. This was
an instruction half applied, not a design choice. `fp-tree` on Institutional
File Plan is a different chart and is untouched.

**Order now puts the client's own design first:** top tiles, drill container,
Overview of EDRMS sites, Comparison, declaration trend, retention rollup. Then a
**Supporting detail** band, and below it the absorbed panels: site activity
trend, format groups, site and library health, records quality and information
classification. Nothing was cut. The designed content simply stopped competing
with the absorbed content for the top of the screen.

**This is worth putting to the client.** Absorbing four dashboards onto
Bank-wide was our decision of 13 August, taken to avoid dropping requirements.
The client has never been asked whether Bank-wide is where they want it all, and
a seventh view would reopen the six key views decision from s13.

### Bank-wide requirements with no home

Not gaps in the layout, gaps in the sources:

| S/N | Wanted | Why not |
| --- | --- | --- |
| 2, 3, 12 | Sovereign and nonsovereign site counts and summary rows | No source anywhere |
| 7 | Total physical counterparts identified, a top panel tile | Buildable now, simply absent |
| 36, 37, 38 | Disposal approver, status, records disposed | Needs `DisposalStatus`, an application change |



## 8. ERRORS MADE AND CORRECTED. DO NOT REPEAT

Every one was caught by checking a real file rather than trusting an expectation.

| Error | Reality | How it surfaced |
| --- | --- | --- |
| `UniqueViewers30` marked sourceable | **Never existed.** Site analytics offers `allTime` and `lastSevenDays` only | Re-reading our own recorded findings |
| Unique viewers filed under "usage report" | Not in the export at all, which has no unique viewer column | Same |
| `Site URL` assumed populated | **Empty on all 2,575 rows.** `Site Id` is populated instead | Reading the actual CSV |
| `DisplayName` assumed in the activity export | Not there. Needs Graph or drop it | Reading the actual CSV |
| "Count the rows for monthly active users" | **30 rows, 8 active.** The export lists every licensed user | Reading the actual CSV |
| No `ReportRefreshDate` column | Visit counts had no dates attached at all | The client asked which dates a figure covers |
| Job run date assumed to be the measurement date | **Two day lag**, and it varies | `Report Refresh Date` 10 Aug on a 12 Aug export |
| "Division is nowhere" | Division **is** in the `ADBMeta` design. The missing thing is a SharePoint column, in one library checked | The client pushed back, correctly |
| "Active Users disproven" | Disproven for the usage CSV, not for per site analytics | The client's screenshot |
| `5.2.3` said to need the document scan | It does not. Library list minus `ListId`s in `Records` | Rechecking before building |
| Data Design docs deleted by a bad slice | Removing one section took two neighbours with it | A later edit failed to find its anchor |
| **`split()` broke department totals for four days** | A department showed 103 records due against a real 75 | An assert, while rebuilding Department Insights |
| Named projects given the client's own s38 figures | One project became 44% of the bank's entire declared holding | An assert |
| The sovereign tile read 112, the table beneath totalled 10 | The table showed only the three named projects, not the "Etc." row | Looking at the screen while taking a screenshot |
| The s44 retention rollup removed as undrawn | **It is drawn, on s44.** It came off because it was named in an instruction | Reading the deck once it was in the repo |
| "Share of users active" printed `(100-11)` | **89% on all 16 departments**, written as arithmetic so it read as computed | `check_constants.js`, which opens every drill |
| "Views per visitor" printed the string `"7.0"` | Page views were built as visitors times seven, so the ratio could be nothing else | The same, once it stopped requiring a `%` sign |
| `sitesFor()` split five measures by one weight vector | Every ratio constant down all 104 of ITD's sites. **Third time this fault has been found** | The same |
| Periodic weights `((i*7+n)%9)` | Nine distinct values across 104 sites, so a sorted page showed ten identical rows | The same |
| `SITES_CREATED*0.66` looked defensible | The 0.66 was a real measured ratio. Applying it to a **placeholder** total still prints a figure nobody counted | Reading the line while sweeping |

**The pattern:** an expectation written into a source column is indistinguishable
from a verified fact three weeks later. That is why the tracker keeps "my
expectation, unverified" and "your finding" in separate columns.

### 17 August, later still: the deliberate sweep for fabricated constants

Four invented constants had been found by accident, one at a time, because
somebody happened to ask what a number meant. Finding the fifth in front of the
committee was not acceptable, so the whole class was searched for on purpose.
**Two new checkers now do it, and they found eight more.**

**What a fabricated constant is, stated precisely, because "hardcoded number"
is the wrong test.** Every base figure in `DATA` is hardcoded on purpose and
disclosed as demo data. The defect is narrower: **a fixed ratio applied to a
figure displayed next to it.** It has no source, it reads as though it were
computed, and it makes the column it feeds say the same thing on every row
whatever the data. A reader sees "every department declares at 34%" and takes
it for a finding.

So the test is not "is this hardcoded" but **"does this vary when the data
varies"**.

| Found | Was | Now |
| --- | --- | --- |
| Share of users active, s39 drill | The literal `(100-11)`, printing **89% on all 16 departments**, written as arithmetic so it read as computed | The two counts on the row taken off the user count |
| Never accessed, no access in 90 days | `users*0.11` and `users*0.19` | `USERS_NEVER`, `USERS_IDLE90`, split independently |
| Users declaring, users creating | `users*0.34` and `users*0.71` | `USERS_DECLARING`, `USERS_CREATING`, split independently |
| Views per visitor, s56 | The literal string `"7.0"` on every row, because page views were built as visitors times seven | `VISITORS` and `PAGE_VIEWS` measured apart. The column now runs about 9 to 22 |
| Site visitors | `users*1.9` | `VISITORS`, split independently |
| Storage, everywhere it appeared | `docs/3400`, an assumed average document size printed as a computed total | `STORAGE_GB` and `RECORD_GB`, read not inferred |
| Records due with a counterpart | `due*0.31` | `DUE_WITH_PHYS` |
| Permanent physical counterparts | `WITH_PHYSICAL*0.21` | `PERM_PHYSICAL` |
| Sites used in the last 7 days | `SITES_CREATED*0.66` | `698`. The 0.66 was the test tenant's real 681 of 1,032, which is why it looked defensible: **applying a measured RATIO to a placeholder TOTAL still prints a figure nobody counted, and hides that behind arithmetic** |
| `LIB_GROWTH=0.107` | An invented monthly growth rate sitting in `DATA`, displayed nowhere, waiting to be used | Deleted |

**None of them came off the page**, because every one of these measures has a
source. They were only ever *derived* wrongly. `USERS_DECLARING` is still the
one line of SQL nobody has run, `SELECT COUNT(DISTINCT "CreatedBy")`.

**The shared weight vector, found for the third time.** `sitesFor()` split
records, documents, counterparts, disposals and users by ONE weight vector, so
every ratio between them was constant down the site list: ITD's declaration
rate read the same figure on all 104 of its sites. The same fault was in the
Institutional File Plan and in Retention and Disposal. It had already been
found and fixed twice, in the division tier and the library table, which is why
the fix is now a shared `weights(n,seed)` helper with the reasoning attached
rather than something to remember each time.

**A second, quieter fault in the same code.** The old weights were of the form
`((i*7+n)%9)`, which repeats every nine rows. ITD's 104 sites took only nine
distinct values, so a sorted page of ten showed **ten identical rows**.
`weights()` is deterministic but not periodic, and asserts that it is not.

**What independent measures cost, and why it is worth paying.** When declaring
was `users*0.34` it could not possibly exceed the user count: the nesting held
by construction and nobody had to think about it. Independent figures have to
be *made* to nest, which is what `splitWithin()` does, placing a total under
per-row ceilings and **moving the overflow to a row with room rather than
clamping it**. Clamping and losing the difference is exactly how the `split()`
bug broke department totals for four days. The nesting is now asserted per
department, not only bank-wide.

**The two checkers, and why there are two.** `check_constants.js` drives the
page and catches a constant by its effect. It found the two worst offenders
only because it opens **every drill on every dashboard on every department**:
the 89% was behind a card nobody had clicked, and `check_division.js` had
carried the constant-column test since 17 August but only ever saw the drill
that happens to be open on mount, and only matched values ending in `%`, so a
bare `7.0` was invisible to it.

`check_literals.js` reads the source instead, because **a constant that never
reaches a table cannot be caught by walking tables**. The worst one this project
has had reached none: "average monthly growth" was the string `"2.4%"` in a KPI
tile. It flags a percentage written as a literal and a data value scaled by an
unexplained constant, with an allowlist where **every accepted case states its
reason**, so an unexplained 0.34 cannot get back in quietly. Both were tested by
reintroducing the historical offenders and confirming they fail.

**Still carrying the old constants:**
`EDRMS_Prototype_with_project_sites_2026-08-17.html`, the frozen working copy
kept from before the project screens were withdrawn. It was not swept. If it is
ever revived, sweep it first.

**Also noticed, not acted on:** `divisionsFor()` is still defined and asserted
inside Bank-wide although the division tier was withdrawn on 17 August and
nothing renders it. Dead code for a withdrawn requirement.

### 17 August, last pass: the chrome comes off, and the labels name their window

Client instruction, twelve items. All applied.

**Removed from the shell.** The sidebar subtitle ("Bank-wide Oversight
Dashboard"), the header breadcrumb and the "Data as of Mon 20 Jul 2026 23:59,
refreshed Tue 21 Jul 06:00" stamp. The first two restated the selected view,
which the highlighted nav row already says. The stamp was a hardcoded pair of
timestamps: in the real report the refresh time belongs on the Power BI
dataset, not painted into the header. **`verify.js` now asserts all three are
absent**, and the checkers that used the breadcrumb to prove a tile navigated
read the highlighted nav row instead.

**Removed from Bank-wide.** The band caption "Adoption, usage, compliance and
trend across ADB ...", the trend summary line "Showing Aug 2025 to Jul 2026, 12
closed months", the "Closed months shown" tile, "Records declared this month",
and the "Used in the last 7 days" indicator.

Two of those are worth a note. The summary line **broke the caption rule
anyway**: a caption carries no computed numbers, and the date range control
above it already states the range in the reader's own input. And **"Records
declared this month" now has no home anywhere on the page**: it is a metrics
document requirement and this tile was its last home. Recorded here rather than
lost silently, and it is one edit to restore.

**"Used in the last 7 days" came off, "Inactive over 90 days" stayed.** The
7 day tile existed to show that "active" is used two ways in the deck and never
defined, lifecycle-active against recently-used. Showing both readings side by
side asked the reader to resolve an ambiguity that is ours to resolve with the
client. The question survives as audit question 16; the tile does not.

**"Share of users active" came off.** Earlier the same day the constants sweep
found it printing a literal 89 on every row. Corrected, it was still a fourth
column restating three already on the row.

**Titles now name the measure and its window.** "Total number of records due
for disposal" became "... , next 12 months" everywhere it appears, on both
dashboards and on the navigation tile. "Institutional File Plan insights"
became "File plan terms in use": a tile showing a number has to say what the
number counts, so the label is the measure and the destination moved to the
sub.

**THE ACTIVITY WINDOW, which was the client's sharpest question.** "Users with
recorded activity" carried no period at all, so a reader could not tell whether
it meant this month, 90 days, or ever. It now reads **"EDRMS users with
recorded activity, last 180 days"**, from a single `DATA.ACTIVITY_WINDOW`.

**180 is not our choice.** The Microsoft 365 SharePoint activity report is
offered over 7, 30, 90 or 180 days and nothing longer. There is no all-time
option and no custom range, so **a user who last opened EDRMS 200 days ago is
indistinguishable from one who never opened it**. That is a real limit on the
measure, not a display detail, and the label has to carry it or the reader
assumes the count is complete. Audit question 16.

**Column header renamed** from "Department" to "Department / office / RM" on
all six Bank-wide drills, matching the client's own s39 vocabulary and the
heading already used on the site table.

### The content workbook, generated from the prototype rather than typed

`EDRMS_Dashboard_Contents_2026-08-17.xlsx`, 233 rows over 5 sheets, one per
dashboard.

**The names are never typed.** `extract_contents.js` drives the live page,
opens **every drill on every dashboard**, and reads each label off the rendered
DOM. `build_content_workbook.py` writes the workbook from that JSON. So a name
in the workbook and a name on screen cannot disagree, because the workbook
holds no second copy of them. This was the client's own instruction: "do it
similar to how exactly the prototype is named so I will not get confused". The
previous checker workbook was hand-listed and described a prototype that no
longer existed within four days.

Ten columns: where on screen, what it is, the name verbatim, **what ONE of
these counts**, the verdict, which file, which column, how the number is built
one hop at a time, and what it is blocked on with the audit question.

Verdicts: **Ready 56, Needs the weekly scan 13, Needs the client 11, Not a
measure 37, To confirm 116.** "To confirm" means nothing has been checked
against a real export and the cells are **left blank**, which is the standing
rule: an expectation written into a source column is indistinguishable from a
verified fact three weeks later.

**A bug worth remembering from building it.** Setting `ws.freeze_panes` by
calling `ws.cell()` to get the anchor **materialises that cell**, so every
subsequent `append()` lands a row lower and each sheet began with a blank row.
Set it by reference, `ws.freeze_panes = "A2"`.

### 17 August: "Department / office / RM" everywhere, and a distinct count that was being summed

**The rename.** The six Bank-wide table headers went from "Department" to
"Department / office / RM" earlier in the day. Applied to everything else that
named the grouping: the five drill titles ("by department, office or RM"), the
four sub-captions, "Departments, offices and RMs in the list", "Departments,
offices and RMs with zero declarations", the five Department Insights "Share of
department / office / RM" columns, and the Comparison panel. Nothing on the
page now says "department" where an office or a resident mission is also meant.

**The defect the screenshot caught.** A site showed **23 declared records and
zero people who declared them.** A record cannot exist without somebody having
declared it, so that row was impossible, and it was on screen.

**The cause is a modelling error, not a rounding gap. A DISTINCT COUNT WAS
BEING SUMMED.** The per-site declarer figures were produced by splitting the
department's declarer count across its sites, as though each person belonged to
exactly one site. ITD has 128 sites and 109 people who declared, so the split
ran out and the remaining sites got zero.

**One person declaring in three sites is ONE at department level and THREE at
site level.** The site column legitimately sums to MORE than the department
figure, and forcing it to reconcile is precisely what produced the impossible
rows. The department tile stays a distinct count, the site rows are counted per
site, and the two are **no longer asserted to be equal**. What is asserted is
what actually holds:

- every site with records shows at least one declarer, and same for documents
- no site reports more declarers than creators, or more people than users
- no site reports more people declaring than records declared
- the site declarers **sum to at least** the department's distinct count

**A second fault surfaced underneath it.** That last assertion failed for SPD,
OAS and ERCD, and it was right to. `splitWithin` fills to the ceiling wherever
there is room, so a flat weight draw **saturated the small departments**: OAS
came out with 270 people declaring out of 270 users, a department where
literally everyone declares, while ITD sat at 109 of 1,136. Fixed with
`weightsLike()`, which sizes the weight by the population and jitters it. The
share now runs 27% to 41% across the sixteen and varies properly.

**Both new shaping expressions were caught by `check_literals.js`** and are in
its allowlist with their reasons, which is the point of that file: the only way
past it is to write down why a constant is not an invented ratio.

### The split bug. Five copies, two ways wrong, totals silently broken

The most serious defect this project has had. It was in the file from 13 August
and survived four days of passing checks.

`split()` shared a whole number across weights and existed in **five
near-identical copies**. It did `Math.max(1, round(total*w/s))` and then dumped
the remainder on the first element. With ITD's 104 sites sharing 75 records due,
the forced minimum of one pushed the sum to 104 and **the first row went to minus
29**. Three of the five copies then clamped the negative to zero, which fixed the
appearance and **silently broke the total**: the department showed 103 records due
against a real 75.

**Every assert checking that sum passed**, because it was comparing two figures
that were both wrong.

Replaced with one shared `splitTotal()` using largest-remainder allocation: floor
each share, then hand the leftover units to the rows with the largest fractional
parts. **Non-negative and exact by construction**, with its own asserts for the
case that broke it. One definition, five call sites.

**The lesson, which this project keeps relearning: a plausible number that
reconciles against another plausible number is not verification.** Reconciliation
proves two figures agree. It does not prove either is right. Where a figure can be
checked against something outside the page, check it there.

---

## 9. KEY IDENTIFIERS AND LINKS

```
Tenant            7rkd12,  JimTest@7rkd12.onmicrosoft.com
Production        asiandevbank.sharepoint.com  (different tenant, different numbers)
Database          drm-npr, PostgreSQL, schema public, table Records
Record grain      ListId + ItemId, both NOT NULL. Not DocumentId, which is nullable
EDRMS app         {B255A2AF-7F63-4A30-966A-5D5FD99F97D7}, digital-records-management-system
Entra probe app   86c791d3-edf7-4504-9b2e-fb14ae07811c  (EDRMS Report Probe)
Test sites        org_csd_1.4testsite, org_csd_1.3testsite, Traditional Test Site
Dev contact       Mihal Le
```

| What | Link |
| --- | --- |
| The live report | https://perezfiles01-droid.github.io/Jim/ |
| SharePoint admin | https://7rkd12-admin.sharepoint.com |
| Term store | Content services, Term store |
| Manage apps | `.../AdminHome.aspx#/manageApps` |
| Site usage report | https://admin.microsoft.com/#/reportsUsage/SharePointSiteUsage |
| User activity report | https://admin.microsoft.com/#/reportsUsage/SharePointActivity |
| Purview file plan | https://purview.microsoft.com, Records management, File plan |
| Graph Explorer | https://aka.ms/ge |

### Calls that are verified to work

```
GET /sites?search=*&$select=id,displayName,webUrl,createdDateTime&$top=999
GET /sites/{siteId}/drives                        libraries, list.id is the ListId key
GET /sites/{siteId}/analytics/allTime              actorCount
GET /reports/getSharePointSiteUsageDetail(period='D30')
GET /reports/getSharePointActivityUserDetail(period='D30')
GET /termStore/groups                              needs TermStore.Read.All
```

Permissions the job will need: `Sites.Read.All`, `Reports.Read.All`, and
`TermStore.Read.All` if the file plan table survives.

---

## 10. SCRIPTS, ALL IN `.claude/skills/edrms-utilization-report/scripts/`

### Verification, run from the repo root

```
verify.js              structural floor. Every dashboard mounts, no console errors
check_affordance.js    every KPI card looks like what it is
check_data.js          the DATA reconciliations, and that all 25 metrics document
                       headings still have somewhere to live
check_bankwide.js      Bank-wide: tiles, drills, department table, comparisons, trend
check_department.js    Department: walks all 16 departments, sites sum to the header
check_division.js      the division tier: children sum to parent, on screen
check_stage3.js        Project, File Plan, Retention and Disposal, Holdings
check_responsive.js    layout at 13 widths, 1920px down to 400px, which is zoom
check_constants.js     the fabricated constant sweep, on screen. Opens EVERY
                       drill on every dashboard, on every department
check_literals.js      the same sweep in the source. No browser, runs in a
                       second, catches the constants that never reach a table
check_tree.py          drill depth and every total matches its parent
```

### Generating the content workbook

```
node extract_contents.js /home/user/Jim/index.html > /tmp/contents.json
python3 build_content_workbook.py /tmp/contents.json \
        /home/user/Jim/EDRMS_Dashboard_Contents_2026-08-17.xlsx
```

The names come from the page, never from the script. Everything else comes
from the `SOURCES` table in the builder, which is hand maintained and
deliberately partial: an unknown stays blank and reads "To confirm".

**They take an absolute path.** `check_data.js index.html` fails with
`ERR_INVALID_URL`; it needs `/home/user/Jim/index.html`. `verify.js` tolerates
the relative form, which makes the difference easy to trip over.

**Retired on 13 Aug** with the dashboards they tested: `check_metrics.js`,
`check_retention.js`, `check_retention_fileplan.js`, `check_sitefilter.js`,
`check_period.js`. Their figure assertions live on in `check_data.js`.

`verify.js` is a **floor**. It passes on a page whose numbers are wrong. The
others check the numbers.

```bash
cd /tmp && npm i playwright-core          # once
node .claude/skills/.../verify.js /home/user/Jim/index.html
```

### Tenant scripts, run on Windows in PowerShell 7

```
simulate_refresh.ps1     the weekly job, writing a CSV instead of inserting
test_accumulation.ps1    runs the pull twice and proves history accumulates
```

**PnP 3.x only loads in PowerShell 7.** `CommandNotFoundException` on a PnP
cmdlet means the wrong shell. Check `$PSVersionTable.PSVersion`.

### Generators, never hand edit the outputs

```
utilization_tables.py    the 73 column definitions and their sources
build_dbdesign.py        builds the design workbook from them
elements.py, tenant.py, build_xlsx.py   build the source data workbook (STALE)
```

`build_dbdesign.py` **refuses to build** if a column has no source
classification, so nothing can arrive without saying how it gets a value.

---

## 11. NEXT STEPS

**The prototype is no longer the bottleneck.** It now shows the client exactly
what they designed, with every gap labelled. What is missing is answers, and
seven of them unblock most of the register.

### Send the questions. There are 18, not 7

**The full versions are in `REQUIREMENTS_AUDIT_2026-08-17.md` section 4**, each
written to be sent as it stands: what we need, why the screen cannot be built
without it, and what it becomes in the database. The seven-question list that
stood here until 17 August was written from the notes and is superseded.

**Send these four first.** They unblock the most for the least effort:

1. **Question 2, the project register.** One spreadsheet unblocks three screens
2. **Question 3, the user register.** **Their own s54 has already drawn the table
   they would need to give us**, down to the columns (Name, Staff status,
   Onboarded since go-live, Training completed, Date completed, Notes) and asks
   of itself "Source: Database of end users? Owned and maintained by?"
3. **Questions 12 and 13, the file plan and its join.** The longest lead item in
   the deck, and question 13 survives whatever the answer to 12 is

**Question 18 was added on 17 August: four file plan categories or five?** The
deck disagrees with itself. s29 lists four top-panel stats and omits Institutional
Management and Other; s47 lists five. The prototype follows s47 per the
detail-beats-outline rule, but this one needs confirming rather than inferring.

### Then, in parallel

8. **Get the site to department list from RAC.** 29 of the 123 requirements wait
   only on this, and all of Department Insights
9. ~~Ask Mihal how to detect the EDRMS app per site.~~ **DONE 14 Aug.** It was never an API problem. Cloud Governance holds the register. What replaces it: **ask Leah Bancale for the PRODUCTION Workspace report export**, which is now the highest value single file in the project
10. **Fill the verification tracker.** 36 columns left, 24 of them settled by
    one query to Mihal
11. **Rebuild the source data workbook as v5.** `elements.py` still holds the
    pre-cut 52 elements, so v4 describes a design that no longer exists
12. **Build the weekly scan.** The single biggest self-help item in the project:
    every document figure, every declaration rate and every storage figure waits
    on it, and **none of it needs the client**
13. **Rerun `build_requirements.py` and `build_checker.py`.** Both outputs are
    stale, and both describe a prototype that no longer exists. The register's
    "In the prototype?" column and the checker's 109 figures predate 16 and 17
    August entirely
14. **Two cheap unblocking checks**, neither needing anyone else:
    `GET /users?$select=userPrincipalName,department,jobTitle` against 7rkd12 for
    user to department, and `COUNT(DISTINCT "CreatedBy")` on `public."Records"`.
    **The second one now has a hole waiting for it.** `DATA.USERS_DECLARING` is
    demo data, and that single line of SQL replaces it with a measured figure.
    It is the cheapest real number left in the project

15. ~~The deliberate sweep for fabricated constants.~~ **DONE 17 Aug.** Eight more
    found, all fixed, and two checkers now hold the line. See section 3

### The user to department gap, new on 16 August

Gap 1 closed **site** to department on 14 August, from the Cloud Governance
`Department` column. **That does nothing for people.** Every requirement counting
users per department (s39, s54) needs a person to department mapping, and no
source in this project has one. Entra's `department` attribute is the untested
candidate, which is check 14 above.

#### 17 August: the Users export profiled properly, and a correction

The Cloud Governance **Users export** was reported in conversation on 16 August
as carrying `Department` on 228 of its 286 rows, which would have closed the
user to department gap with no client involvement. **That was wrong and it is
withdrawn.** Every column of that file has now been counted:

| Column | Filled |
| --- | --- |
| `User principal name` | **286 of 286** |
| `Display name` | 286 of 286 |
| `City` | **229 of 286** |
| `Last SharePoint activity date` | 32 of 286 |
| `Job title`, `Office`, `Country or region` | 16 of 286 |
| **`Department`** | **0 of 286** |
| `Company name` | 1 of 286 |

**`Department` is empty on every row.** The 229 was `City`. This is the same
shape as `Division`: the field exists in the system that would hold it and
nobody has populated it. It never reached this file, so nothing here needed
correcting, but it had already been promoted to a priority item and would have
been acted on.

**The lesson is the project's own and it was not applied:** the claim came from
reading a column name, not from counting the column. Every finding in the
Cloud Governance work came from `csv.DictReader` and a fill count, and this one
did not.

**What survives, and it is still worth having.** The export is keyed on
`User principal name`, populated on all 286, which is **the same key the M365
activity report uses**. So the join is sound; it is the payload that is empty.
If ADB populates `Department` in Entra, this file delivers user to department
with no new source and no client list. That is still question 3, and the ask is
now "please populate it", not "please send us a register".

#### 17 August: the user to site to department chain, tested and ruled out

The obvious fix was proposed: take the activity report row (user, last activity
date, **site id**), join the site id to the Workspace report, and read the
department off it. **The chain breaks at the first hop.** Every candidate was
counted rather than assumed:

| Export | Has a user? | Has a site? | Verdict |
| --- | --- | --- | --- |
| SharePoint activity user detail | Yes, `User Principal Name` | **No. 12 columns, not one names a site** | Cannot start the chain |
| SharePoint site usage detail | Only `Owner Principal Name` | Yes, `Site Id` + `Site URL` | The OWNER is not the users |
| CG User Activity Report | Yes, `User` + `Email address` | No. `Object Name` is a request or a person | Logs the CG CONSOLE (Submit 4,808, Log in 1,410), not site access |
| CG Groups export | No membership column at all | No | And only 241 of 2,575 sites are group backed |

**So no export we hold puts a user and a site on the same row.** That is a
stronger finding than "not found yet": four candidates, all counted, all ruled
out for a different reason.

**The one source that would carry it is the unified audit log**, Purview Audit
Search: `FileAccessed` and `PageViewed` carry `UserId` and `SiteUrl` together.
**UNVERIFIED in this tenant.** Nobody has run a search, checked the retention
window or confirmed the schema, so it is written here as the next test and not
as an answer. Audit question 3.

**Untested and promising:** the same export carries `Last SharePoint activity
date` as a DATE, not a windowed count. If that date is not itself derived from
the same 180 day Microsoft report, it answers the "how do we see users beyond
180 days" problem outright. Nobody has checked which it is. Audit question 16.

### The design recommendation to put to the client

The deck puts the same four measures, documents, records declared, physical
counterparts and records due, on **nine screens grouped six ways**. That is not
nine requirements. It is **one measure set and six groupings**. Built once as a
single document-level table with a different `GROUP BY` per screen, every screen
reconciles to the same bank-wide total **by construction rather than by luck**.

This changes nothing the client sees and a great deal about what it costs to
maintain. Given the split bug, "by construction" is worth more than it sounds.

### The one design change the requirements imply

**The file plan needs a join to a document.** Nothing links a term to a library
or a document: table 4 has no join key and table 1 carries no `TermId`. Every
figure on PPT s47 to s52 needs it, so it is a change to the design and to the
weekly scan rather than a report change. **It is the longest lead time item in
the deck** and it survives the answer to question 1, so it is worth raising now
rather than after the file plan is located.

---

## 12. ENVIRONMENT

- **Git push works.** Earlier in the project it returned 403; that cleared. Work
  on `main`, which is what GitHub Pages serves
- **The proxy blocks `sharepoint.com` and `github.io`** for direct HTTP from the
  agent. The client has to check tenant screens
- **Chromium is at** `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Never
  run `playwright install`
- **LibreOffice times out** even on tiny files. Workbook formulas cannot be
  recalculated here and must be verified by hand

---

## 13. HARD RULES

- **No em dashes in visible text.** Commas, colons, parentheses or hyphens.
  `verify.js` fails on any that appear
- **Figures must reconcile across dashboards.** The Overview reads other modules'
  `summary` objects and never restates a number
- **Visuals restricted to what Power BI can reproduce natively**
- **The ADB palette is fixed.** See `BACKGROUND.md`
- **Never hand edit a generated file.** Edit the generator and rerun
- **Never present a placeholder as measured.** Section 5 lists what is real
