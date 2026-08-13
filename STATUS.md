# CURRENT STATUS

**Read this file first, before anything else in the repo.** It is the complete
record of where the EDRMS Utilization Report stands: what exists, what is proven,
what is assumed, what is blocked, and what was got wrong along the way.

`BACKGROUND.md` is still correct on the durable things (tech stack, ADB palette,
the no em dashes rule) but was written on 4 August and predates all of this.
**Where the two disagree, this file wins.**

Last updated 13 August 2026, after the client's dashboard requirements arrived
and the prototype was rebuilt around them.

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
| Bank-wide Oversight | `bw` | 8 top tiles, 5 drill tables, department table, 3 comparisons, declaration trend by month and by year, retention rollup, format groups, site and library health, records quality, classification, access and search |
| Department Insights | `dp` | Department picker driving everything. 8 tiles, 5 drills, site list, library usage by file plan category, trend, conventions, programme dates |
| Project Insights | `pj` | Sovereign and nonsovereign lists, single project profile. Layout only |
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

### Gap 3b, compliance. Rule known, query outstanding

A site is compliant when it has the **Declare as Record** button, which comes from
app `{B255A2AF-7F63-4A30-966A-5D5FD99F97D7}`, `digital-records-management-system`.

Site Contents shows the catalog and the installed app as **separate rows**:

```
Apps for SharePoint            List   3/5/2026  5:05 PM   <- the catalog
digital-records-management-    App    12/4/2025 2:11 PM   <- installed here
```

The `App` row carries a Modified date that differs between sites, so it is not a
bulk stamp. Whether it is the install date or an upgrade date is unproven; compare
it against `MIN(CreatedDate)` from `Records` per site to settle it.

**Outstanding:** which API returns that row across 1,057 sites.

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

**AvePoint is an export, not an integration.** Cloud Governance cannot write to
the database. If it holds the requesting department, that is a CSV loaded once.

---

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
check_tree.py          drill depth and every total matches its parent
```

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
9. **Ask Mihal how to detect the EDRMS app per site.** Gap 3b, 4 KPIs
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
