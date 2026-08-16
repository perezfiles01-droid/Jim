# CURRENT STATUS

**Read this file first, before anything else in the repo.** It is the complete
record of where the EDRMS Utilization Report stands: what exists, what is proven,
what is assumed, what is blocked, and what was got wrong along the way.

`BACKGROUND.md` is still correct on the durable things (tech stack, ADB palette,
the no em dashes rule) but was written on 4 August and predates all of this.
**Where the two disagree, this file wins.**

Last updated **14 August 2026**. Cloud Governance closed Gap 3b, the compliance
question that had blocked four KPIs since the start, and supplied the site to
department mapping. See section 6.

---

## 0. HOW TO USE THIS FILE

| If you want | Go to |
| --- | --- |
| The single most important fact | Section 1 |
| What is built and where | Sections 2 and 3 |
| **The client requirements of 13 Aug** | Section 3a, and the register workbook |
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
| `REQUIREMENTS_2026-08-13.md` | The client requirement assessment as prose | Current |
| `EDRMS_Utilization_Report_Requirements_2026-08-13.xlsx` | **The requirement register.** 123 requirements, each with its slide reference and a verdict | Current |
| `EDRMS_Utilization_Report_Database_Design_v1.xlsx` | **The database design**, in the client's own workbook format. 4 tables, 73 columns | Current |
| `utilizationdb.md` | The same design as prose, no code | Current |
| `evidence_SharePointSiteUsageDetail_2026-08-12.csv` | Real tenant export, 2,575 rows | Evidence |
| `evidence_SharePointActivityUserDetail_2026-08-12.csv` | Real tenant export, 30 rows | Evidence |
| `evidence_CloudGovernance_WorkspaceReport_2026-08-14.csv` | **The compliance answer.** 1,209 workspaces, 93 columns | Evidence |
| `evidence_CG_GroupsExport_2026-08-14.csv` | 676 groups. Checked and rejected, see section 6 | Evidence |
| `compliant_sites.csv` | The 1,032 EDRMS sites, shaped for `-CompliantSiteList` | Derived |
| `EDRMS_Utilization_Report_Checker_2026-08-14.xlsx` | **The checker.** 109 figures, each with the steps to reproduce it by hand | Current |
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
| Bank-wide Oversight | `bw` | 8 top tiles, 5 drill tables, Overview of EDRMS sites, 3 comparisons, Records Declaration Trend, records quality, classification. **Cut back to the client's own screen on 16 Aug**, see below |
| Department Insights | `dp` | Department picker driving everything. 8 tiles, 5 drills, site list, library usage by file plan category, trend, conventions, programme dates |
| Project Insights | `pj` | Sovereign and nonsovereign lists with the client's column names, project profile, 7 clickable tiles with drills, 3 charts. **Rebuilt to their slide on 16 Aug.** Still layout only, and now blocked on two sources, not one |
| Institutional File Plan | `fp` | 5 categories, terms per category, most and least used terms, classification and business process |
| Retention and Disposal | `rd` | Permanent and temporary screens, disposition risk, retention compliance |
| Records and Archive Holdings | `ra` | Storage, retrieval, inventory health. Layout only |

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

**A new convention: a cell with no source prints "Not captured".** This is not
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

**One caveat on all slide numbers in this file.** The deck itself,
`EDRMS_Dashboard_requirements_1.pptx`, is **not in the repo**. Every slide
reference traces to `REQUIREMENTS_2026-08-13.md`, which was built by walking the
deck on 13 August. The twelve images of 16 August are a separate, unnumbered set
and cannot be cited by slide.

**One defect was found by reading the slides, and it is still open.** Bank-wide's
physical counterpart drill prints "Turned over to RAC" as 58 percent of the
counterpart count. Nothing sources it, and by the 13 August rule an unsourceable
cell prints "no source" rather than a plausible number. It was left alone in this
revision because the client did not raise it and it sits inside a panel they kept,
but it should be fixed.

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

**The pattern:** an expectation written into a source column is indistinguishable
from a verified fact three weeks later. That is why the tracker keeps "my
expectation, unverified" and "your finding" in separate columns.

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
check_tree.py          drill depth and every total matches its parent
```

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

### Send the seven questions. In this order

The full versions are in `REQUIREMENTS_2026-08-13.md` section 9 and on the
`Questions to client` sheet of the register workbook.

1. **Where does the Institutional File Plan actually live?** It is in neither
   the term store nor Purview. Blocks a whole dashboard
2. **Is there a project site register?** Site URL to project number, sovereign
   or nonsovereign. Check AvePoint Cloud Governance first. Cheapest unblock in
   the whole deck: one CSV would make Project Insights real
3. **Division: who supplies it?** The client asked for the tier back on 13 Aug
   and it is built, but nothing populates it. The department list must carry it
4. **Disposal status, approver and disposed records** need a field in the EDRMS
   application. A development change request for Mihal Le, not a report change
5. **Who maintains the three reference lists?** Go-live dates, conventions,
   programme dates
6. **Is an inactive site 90 days or 300?** The deck says 90, the metrics
   document says 300
7. **Which system owns staff, contractor and consultant, and training?** The
   client's own PPT s54 asks the same question

### Then, in parallel

8. **Get the site to department list from RAC.** 29 of the 123 requirements wait
   only on this, and all of Department Insights
9. ~~Ask Mihal how to detect the EDRMS app per site.~~ **DONE 14 Aug.** It was never an API problem. Cloud Governance holds the register. What replaces it: **ask Leah Bancale for the PRODUCTION Workspace report export**, which is now the highest value single file in the project
10. **Fill the verification tracker.** 36 columns left, 24 of them settled by
    one query to Mihal
11. **Rebuild the source data workbook as v5.** `elements.py` still holds the
    pre-cut 52 elements, so v4 describes a design that no longer exists

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
