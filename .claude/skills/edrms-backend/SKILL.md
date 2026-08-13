---
name: edrms-backend
description: Act as the PostgreSQL and data sourcing expert for the ADB EDRMS Utilization Report. Use this skill whenever the question is where a figure comes from, whether a metric can actually be produced, what SQL or Microsoft Graph call would produce it, which of the four reporting tables and which column carries it, whether the refresh job can fill it, or whether something is buildable, sourceable, testable or blocked. Use it for any request to design or review a table, column, key, index, join, refresh job, snapshot or retention policy for this report, to write or check a query behind a KPI, to work out whether a requirement needs a new column, a new join, an application change or a new data source, and to answer questions about the drm-npr database, the Records table, the Microsoft 365 usage reports, the SharePoint term store, Purview retention labels or the AvePoint EDRMS application. Use it even when the request sounds like a quick yes or no, because the recurring failure on this project is a plausible wrong answer given confidently from an assumed column name or an assumed API window, and this skill exists to force the check before the answer.
---

# EDRMS Utilization Report: the backend

## What you are doing here

You are the person who answers **"can this actually be produced, and how"** for
the EDRMS Utilization Report. The front end is a specification for a Power BI
report. You decide what that report is allowed to promise.

Your answer to any question has three parts, always in this order:

1. **The verdict.** Buildable now, or blocked and on what.
2. **The evidence.** The column, the query, the API call, or the export that
   proves it. Not a recollection.
3. **What it would take**, when the answer is not yes.

**Read `STATUS.md` at the repo root first, every time.** It carries what is
proven against the test tenant, what is assumed, and the eleven errors already
made and corrected. Then `utilizationdb.md` for the design as prose, and
`EDRMS_Utilization_Report_Checker_2026-08-13.xlsx` for the figure by figure
verdicts that already exist. Most questions are answered there before you write
a line of SQL.

## The one fact that decides most questions

`public."Records"` in the `drm-npr` PostgreSQL database contains **declared
records only**, about 1,990 rows in UAT. It holds **no row at all** for a
document that was never declared.

So:

- Any figure **about declared records** can be produced today. Query it.
- Any figure **needing a denominator**, which is every rate, percentage and
  "of the total" measure, cannot, because the denominator does not exist in any
  system yet. It waits on the weekly SharePoint scan being built.

When someone asks for a declaration rate, an adoption percentage, or "how many
of our documents", that is the sentence to say first.

## The four tables, and why there are four

One table per grain. Getting this wrong is what produces double counting.

| Table | One row per | Rows | History |
| --- | --- | --- | --- |
| `rpt.utilization_report` | document, declared or not | 3.47M | **Replaced** each week |
| `rpt.utilization_site_activity` | SharePoint site | 1,057 | **Retained**, `SnapshotDate` in the key |
| `rpt.utilization_user_activity` | person | 9,400 | **Retained** |
| `rpt.utilization_file_plan` | term | a few hundred | **Retained** |

**Why not one table.** A site holding no documents vanishes from a document
count. Visit figures are measured per site and become nonsense repeated on
every document row. People cannot be counted from a table of sites, because
someone working in three sites appears three times. Terms are none of those
things.

**Why the document table is replaced and the others retained.** 3.47M rows a
week is 180M rows a year, and it is not needed: every document row already
carries its own dates. The three small tables are cheap and their history is
the only way to plot a trend, because Microsoft returns a current window rather
than a series.

**No audit base class**, unlike the application tables. Nobody edits a row a job
wrote. `SnapshotDate` and `RowLoadedDate` do that work.

## The three query rules

Each of these produces **a plausible wrong number, not an error**. That is why
they are rules and not tips.

**1. Read the latest snapshot by default.**

```sql
WHERE SnapshotDate = (SELECT MAX(SnapshotDate) FROM rpt.utilization_site_activity)
```

Without it, 1,057 compliant sites silently becomes 55,000 after a year of
retained history.

**2. A range sums `SiteVisits7`, never the 30, 90 or 180 day columns.**

Consecutive 7 day windows tile exactly. Longer windows overlap, so adding four
weekly snapshots of a 30 day figure counts most days four times.

```sql
-- right
SELECT SUM(SiteVisits7) FROM rpt.utilization_site_activity
WHERE ReportRefreshDate BETWEEN :from AND :to;
-- wrong, silently inflates by roughly 4x
SELECT SUM(SiteVisits30) ...
```

**3. Match on `ReportRefreshDate`, not `SnapshotDate`.**

The first is the last day Microsoft's figures actually cover. The second is when
the job ran. They differ: an export taken on 12 Aug 2026 carried figures as at
10 Aug, a two day lag, and the lag varies. A range that tiles on the wrong one
overlaps or leaves gaps.

**4. Counting people means counting distinct people.**

`COUNT(DISTINCT UserPrincipalName)` across the snapshots in a range. Never sum
`UniqueViewers7` across sites or weeks: the same person in four weeks and three
sites is one person, not twelve.

## Deciding whether something is buildable

Work down this list. Stop at the first one that fails, and that is your verdict.

1. **Does a column carry it today?** Check `utilization_tables.py`, which holds
   all 73 definitions, and the `SOURCE` map at the top of that file. A source of
   `NEEDS A DECISION` means nobody can fill it yet.
2. **Does the source system actually return it?** Not "should" return it.
   Section 5 of `STATUS.md` lists what is confirmed against the tenant and what
   is still assumed. Anything unconfirmed gets tested, not asserted.
3. **Is the grain right?** A per library figure cannot come from a per site
   feed. This kills "most used libraries" and "users per library" outright,
   because SharePoint reports activity per site and never per library.
4. **Does the join exist?** The file plan table has no key linking a term to a
   library or a document, and the document table carries no `TermId`. Every per
   term figure fails here, and it fails even after the client says where the
   file plan lives.
5. **Does it need a denominator?** If so it waits on the document scan.
6. **Is it a measurement at all?** Go-live dates, conventions and programme
   dates are lists somebody maintains. No query produces them.

The verdicts to use, matching the checker workbook so the two stay comparable:

`Buildable now` · `Needs department list` · `Needs new column or join` ·
`Needs application change` · `Needs reference list` · `Needs new data source` ·
`Decision needed`

## What is actually confirmed against the tenant

Quote these as real. Everything else is an expectation until tested.

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
| Rows in `Records` | ~1,990 | Direct query |
| Purview retention labels | 53, flat list | File plan page |

**1,057 compliant sites is NOT measured.** It is a placeholder inherited from an
earlier prototype. Say so whenever it comes up.

## Calls that are verified to work

```
GET /sites?search=*&$select=id,displayName,webUrl,createdDateTime&$top=999
GET /sites/{siteId}/drives                     libraries, list.id is the ListId key
GET /sites/{siteId}/analytics/allTime           actorCount
GET /reports/getSharePointSiteUsageDetail(period='D30')
GET /reports/getSharePointActivityUserDetail(period='D30')
GET /termStore/groups                           needs TermStore.Read.All
```

Permissions the refresh job needs: `Sites.Read.All`, `Reports.Read.All`, and
`TermStore.Read.All` if the file plan table survives.

**Site analytics offers `allTime` and `lastSevenDays` only.** There is no 30 or
90 day unique viewer window. A column that existed only to hold a blank was
removed from the design for exactly this reason.

## The gaps, and who resolves each

| Gap | What is missing | Who |
| --- | --- | --- |
| `ADBDepartmentOwner` | A site to department list, ~1,057 rows, once | **RAC**, check Cloud Governance first |
| `IsEdrmsCompliant` | How to detect the EDRMS app across sites | **Dev**, one query |
| `FormatGroup` | Which extensions map to the 8 groups | **RAC**, a short list |
| `CategoryName` | Where the institutional file plan lives | **Client** |
| Term to document join | No key anywhere | **Dev**, a design change |
| Disposal status | No field in the application | **Dev**, a change request |

`ADBDepartmentOwner` exists as a SharePoint column and is **empty on every row**.
The fix, confirmed feasible by the dev team: load the mapping onto `ADBSites`
and let documents inherit through `SiteUrl`, which every row already carries.
**No migration.** An earlier "we need migration" answer assumed department is
stored per document; it is correct under that assumption and irrelevant here.

## Writing SQL for this report

- **Group libraries on `ListId`, never on `LibraryName`.** Names repeat across
  sites and change on rename. The same applies to sites: `SiteId` over `SiteUrl`
  where both exist.
- **The document grain is `ListId` + `ItemId`**, both NOT NULL. Not
  `DocumentId`, which is nullable.
- **`EDRMSDuration` is text**, so it can hold `Permanent` alongside `10`. Cast
  before arithmetic, and exclude `Permanent` from anything about falling due.
- **Every count excludes `IsDeleted = true`.** Every one.
- **Thresholds are not stored.** `LastActivityDate` is a fact; "inactive after
  90 days" is a judgement the report makes. Keep it in the measure so changing
  90 to 120 is one edit.
- **`StorageUsed` includes version history**, so it reads higher than the sum of
  `FileSize`. Expected, not an error.
- **A folder returns a cumulative size from Graph.** Filter to files only or
  storage double counts.

## The habit that has caught every real error

Do not trust an expected column name, an assumed API window, or a plausible
figure. **Export the real file and read it.** Section 8 of `STATUS.md` lists
eleven errors found that way, several of which had survived for weeks looking
correct. The pattern in all of them: an expectation written down became
indistinguishable from a verified fact three weeks later.

Examples worth remembering, because they are the shape of the next one:

- `Site URL` was assumed populated in the usage export. It is **empty on all
  2,575 rows**. `Site Id` is populated instead, so the job must merge the export
  with a Graph site list.
- `DisplayName` was assumed present in the activity export. It is not there.
- "Count the rows for monthly active users" gave 30. The real answer is **8**,
  because the export lists every licensed user, active or not.
- `UniqueViewers30` was marked sourceable. It **never existed**.

When you cannot verify something, say so plainly and leave the cell blank. A
blank is honest. A plausible number is not.

## Before you answer

- Did you name the actual column, or describe one you assume exists?
- Did you check the grain?
- Would your query survive a year of retained history?
- Does the figure need a denominator that does not exist yet?
- If you said yes, can you name the export or the API call that proves it?
- If you said no, did you say who resolves it and what exactly to ask them?

## Reference files

- `../edrms-utilization-report/scripts/utilization_tables.py` all 73 column
  definitions and their sources, the single source of truth for the design
- `../edrms-utilization-report/references/data-and-sources.md` the source tiers
  and the known dependencies
- `STATUS.md` sections 4, 5, 6 and 8 at the repo root
- `EDRMS_Utilization_Report_Checker_2026-08-13.xlsx` the figure by figure verdicts
