# EDRMS UTILIZATION REPORT: DATABASE TABLES

What the Utilization Report needs to exist in the database, written the same way
a SharePoint list is written: a table name, its columns, and what each column
holds. No code. Every figure on every dashboard in the prototype is traced back
to a column here.

**Two tables carry the whole report.**

| Table | One row per | What it feeds |
| --- | --- | --- |
| **Utilization Report Table** | document | Records Management, Sites and Libraries, Format and Storage, Retention, and the Overview |
| **Site Activity Table** | SharePoint site | Sites created, the treemap, Active Sites, Active Users |

Proposed database names, for the team who will build them: `utilization_report`
and `utilization_site_activity`, in a separate schema so the existing tables
that the EDRMS application owns are never touched.

---

## CAN IT BE ONE TABLE ONLY?

Almost. One table gets you roughly nine tenths of the report. Two things break,
and both break the same way, so they are worth understanding before deciding.

**1. A site with no documents in it disappears.**

The Sites and Libraries dashboard reports **1,057 EDRMS compliant sites
created**. If sites are counted from a table of documents, a site is only
counted when it has at least one document. A site created last month that nobody
has uploaded to yet has no rows, so it is invisible, and the site count comes out
too low. It gets worse over time, because the newest sites are the emptiest ones,
and rollout progress is exactly what that dashboard is for.

**2. Site visits and unique viewers are measured per site, not per document.**

The Records Management dashboard reports **site visits** and **unique viewers**
over 7, 30 and 90 days. Those are properties of a site. If a site had 4,812
visits last month and 6,000 documents in it, putting "4,812" on all 6,000
document rows means any total that adds the column up returns 28 million visits.
There is no way to put a per site number on a per document table and have it stay
correct when summed. This is the single most common way a report of this kind
produces a wrong number that nobody notices.

**Everything else fits in one table.** All of the declared record figures, the
department and division breakdowns, every drill down, all of the library figures,
all of the format and storage figures, and the whole Retention dashboard come
from the Utilization Report Table on its own.

So the answer is **two tables, not seven and not one.** The second one is small,
one row per site, about 1,057 rows, and it exists only because those two figures
cannot live anywhere else.

### Why this is simpler than the seven table version

An earlier draft split this into seven tables so that a refresh only ever had to
write about 21,646 declared records plus a few thousand summary rows. It is more
efficient and much harder to read.

This version writes one row per document, about 3.47 million rows, refreshed
weekly, replacing the previous week rather than adding to it. In PostgreSQL that
is a few gigabytes and a refresh measured in minutes, which is ordinary. The
trade is real but small, and what you get for it is a table that anyone can open
and understand without a diagram.

---

## HOW TO READ THE FIELD TYPES

Written in plain terms rather than database terms, so both audiences can read
this. For the team building it, the mapping is:

| Written here | In PostgreSQL |
| --- | --- |
| Text | `text` |
| Whole number | `integer` or `bigint` |
| Decimal number | `numeric` |
| Date | `date` |
| Date and time | `timestamptz` |
| Yes / No | `boolean` |
| Choice | `text`, restricted to the listed values |

**Bold column titles** are the ones the report cannot function without.

---

## TABLE 1. UTILIZATION REPORT TABLE

One row per document held in an EDRMS compliant site. This includes documents
that have **not** been declared as records, which is the point: without the
undeclared ones there is no denominator, and no declaration rate.

About 3.47 million rows. Replaced in full at each weekly refresh.

| S/N | Column Title | Field Type | Description | Field Values / Choices | Sample | Source | Remarks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Row ID | Whole number | Unique row identifier | | 1 | Generated | Primary key. No business meaning |
| 2 | **Snapshot Date** | Date | The date this data was captured | | 27 Jul 2026 | Refresh job | Same value on every row in a refresh. This is the "Data as of" line printed at the top right of every dashboard |
| 3 | Document ID | Text | SharePoint document identifier | | 1000-52341 | SharePoint | Stays the same if the file is renamed or moved |
| 4 | Document Name | Text | The filename | | Board Paper Q2.pdf | SharePoint | |
| 5 | Document URL | Text | Direct link to the document | | https://adb.sharepoint.com/sites/... | SharePoint | Lets a user click from the report to the document |
| 6 | File Extension | Text | File extension, lowercase | | pdf | SharePoint | |
| 7 | **Format Group** | Choice | The grouping the report displays | PDF, Word, Excel, PowerPoint, Email, Image files, Video files, All other formats | PDF | Derived from File Extension | The eight groups on the Format and Storage dashboard. Anything unrecognised falls into All other formats |
| 8 | **File Size (MB)** | Decimal number | Size of the file | | 2.4 | SharePoint | **Not captured today.** Every storage figure in the report depends on this. See Gap 2 |
| 9 | Document Created Date | Date and time | When the file was first uploaded | | 12 Mar 2026 09:14 | SharePoint | The date range filter on the Total Documents panel reads this |
| 10 | Document Modified Date | Date and time | When the file was last changed | | 04 Jun 2026 16:02 | SharePoint | |
| 11 | Folder Path | Text | Folder path inside the library | | /2026/Q2/Board | SharePoint | |
| 12 | **Library Name** | Text | The library the document sits in | | Annual Meetings | SharePoint | Fourth and deepest level of the drill down |
| 13 | Library URL | Text | Link to the library | | /sites/.../AnnualMeet | SharePoint | |
| 14 | Library ID | Text | Stable library identifier | | a869c724-ac4e-... | SharePoint | Libraries can be renamed. This does not change, so it is what the report should group on |
| 15 | Library Category | Choice | Type of library | Common Document Library, Procurement, and the other types held in the mapping list | Common Document Library | Retention Label Mapping list | Already maintained in `app_edrms_data_uat` as "Library Type" |
| 16 | **Site Name** | Text | The site the document sits in | | org_edrms_uat | SharePoint | Third level of the drill down |
| 17 | **Site URL** | Text | Link to the site | | https://adb.sharepoint.com/sites/edrms-cwrd | SharePoint | The column that joins this table to the Site Activity Table |
| 18 | Site Created Date | Date | When the site was created | | 18 Jan 2026 | SharePoint admin centre | **Not captured today.** See Gap 3 |
| 19 | **EDRMS Compliant** | Yes / No | Whether the site is an EDRMS compliant site | Yes, No | Yes | Needs a rule | **No rule exists today.** Everything the report calls "compliant" depends on it. See Gap 3 |
| 20 | Department Code | Text | Owning department, short code | | CWRD | Term store, via the site | See Gap 1 |
| 21 | **Department Name** | Text | Owning department, full name | | Central and West Asia Department | Term store, via the site | First level of every drill down and the department filter on six panels. See Gap 1 |
| 22 | Division Code | Text | Owning division, short code | | AFRM | Term store, via the site | See Gap 1 |
| 23 | **Division Name** | Text | Owning division, full name | | Afghanistan Resident Mission | Term store, via the site | Second level of the drill down. See Gap 1 |
| 24 | Unit Code | Text | Owning unit, short code | | AFRM-PA | Term store, via the site | Not used by any current dashboard. Included so the report can go one level deeper later without a database change |
| 25 | Unit Name | Text | Owning unit, full name | | Portfolio Administration Unit | Term store, via the site | |
| 26 | **Declared as Record** | Yes / No | Whether this document has been declared a record | Yes, No | Yes | Declared Records list | **The single most important column in the report.** Total Declared Records is the count of rows where this is Yes. The declaration rate is this count divided by the row count |
| 27 | **Declared Date** | Date and time | When the document was declared a record | | 12 Mar 2026 09:14 | Declared Records list | Blank when not declared. Every date range filter on declarations reads this |
| 28 | Declared By | Text | Who declared it | | jperez@adb.org | Declared Records list | Supports a declarations by user view |
| 29 | Declaration Type | Choice | How it was declared | Regular, Centralized | Regular | Declared Records list | |
| 30 | **Has Physical Counterpart** | Yes / No | Whether a physical copy of this record exists | Yes, No | No | Declared Records list | Drives the two colour split on every bar of the Total Declared Records chart |
| 31 | Physical Counterpart Retention | Choice | Retention that applies to the physical copy | Long Term, Permanent | Long Term | Retention Label Mapping list | Already maintained per library in `app_edrms_data_uat` |
| 32 | Retention Label | Text | The retention label applied | | 10 years after declaration | Retention Label Mapping list, or the item | |
| 33 | Retention Duration (Years) | Whole number | Retention period in years | | 10 | Retention Label Mapping list | Blank where the label is Permanent |
| 34 | Retention Label Applied Date | Date and time | When the label was applied to the item | | 12 Mar 2026 09:20 | SharePoint | **Never use this as the declaration date.** A label can be applied to a document that was never declared, so a report built on this date would date records that are not records. Use Declared Date |
| 35 | Due Date for Disposal | Date | When the record becomes due for disposal | | 12 Mar 2036 | Derived from Declared Date plus Retention Duration | Feeds the Retention dashboard |
| 36 | Retention Status | Choice | Where the record sits against its retention period | Active, Due for review, Due for disposal, Disposed, Permanent | Active | Derived from Due Date for Disposal | Feeds the Retention dashboard |
| 37 | Disposal Status | Choice | Where the record sits in the disposal process | Not due, Pending approval, Approved, Disposed | Not due | EDRMS application | Feeds the Retention dashboard |
| 38 | Sensitivity Label | Text | Sensitivity label on the document | | Internal | SharePoint | Not on any current dashboard. Included because it is free to collect and is the obvious next question after retention |
| 39 | Is Deleted | Yes / No | Whether the document has since been deleted | Yes, No | No | EDRMS application | Every count in the report excludes rows where this is Yes |
| 40 | Last Refreshed | Date and time | When this row was last written | | 27 Jul 2026 06:00 | Refresh job | Operational. Lets a failed or partial refresh be spotted |

**40 columns.**

---

## TABLE 2. SITE ACTIVITY TABLE

One row per SharePoint site. About 1,057 rows, one for every EDRMS compliant
site, plus any site being tracked toward compliance.

This table exists for the two things a document level table cannot do: count
sites that hold no documents, and hold visit and viewer counts that are measured
per site.

| S/N | Column Title | Field Type | Description | Field Values / Choices | Sample | Source | Remarks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Row ID | Whole number | Unique row identifier | | 1 | Generated | Primary key |
| 2 | Snapshot Date | Date | The date this data was captured | | 27 Jul 2026 | Refresh job | |
| 3 | **Site URL** | Text | Link to the site | | https://adb.sharepoint.com/sites/edrms-cwrd | SharePoint admin centre | The column that joins this table to the Utilization Report Table |
| 4 | **Site Name** | Text | Site display name | | EDRMS CWRD | SharePoint admin centre | |
| 5 | **Site Created Date** | Date | When the site was created | | 18 Jan 2026 | SharePoint admin centre | **Not captured today.** The treemap and its date range filter both read this. See Gap 3 |
| 6 | **EDRMS Compliant** | Yes / No | Whether this is an EDRMS compliant site | Yes, No | Yes | Needs a rule | **No rule exists today.** See Gap 3 |
| 7 | Department Code | Text | Owning department, short code | | CWRD | Term store or AvePoint | See Gap 1 |
| 8 | **Department Name** | Text | Owning department, full name | | Central and West Asia Department | Term store or AvePoint | The treemap is grouped by this. See Gap 1 |
| 9 | Division Code | Text | Owning division, short code | | AFRM | Term store or AvePoint | See Gap 1 |
| 10 | Division Name | Text | Owning division, full name | | Afghanistan Resident Mission | Term store or AvePoint | |
| 11 | **Site Visits (7 days)** | Whole number | Visits in the last 7 days | | 412 | Microsoft 365 usage reports | Active Sites, 7 day window |
| 12 | **Site Visits (30 days)** | Whole number | Visits in the last 30 days | | 4,812 | Microsoft 365 usage reports | Active Sites, 30 day window |
| 13 | **Site Visits (90 days)** | Whole number | Visits in the last 90 days | | 13,240 | Microsoft 365 usage reports | Active Sites, 90 day window |
| 14 | Unique Viewers (7 days) | Whole number | Distinct people who viewed, last 7 days | | 38 | Microsoft 365 usage reports | Active Users, 7 day window |
| 15 | Unique Viewers (30 days) | Whole number | Distinct people who viewed, last 30 days | | 122 | Microsoft 365 usage reports | Active Users, 30 day window |
| 16 | Unique Viewers (90 days) | Whole number | Distinct people who viewed, last 90 days | | (blank) | Microsoft 365 usage reports | **Microsoft does not return this figure.** At 90 days the dashboard falls back to site visits and shows an amber note saying so. Column kept so the behaviour is visible rather than hidden |
| 17 | Last Activity Date | Date | Most recent activity on the site | | 24 Jul 2026 | Microsoft 365 usage reports | Printed beside each bar on Active Sites |
| 18 | Total Storage (GB) | Decimal number | Storage used by the site | | 12.7 | SharePoint admin centre | Includes version history, so it will read higher than the sum of file sizes. Expected, not an error |
| 19 | Site Owner | Text | Primary site administrator | | jperez@adb.org | SharePoint admin centre | Who to contact about a site that has gone quiet |
| 20 | Is Active | Yes / No | Whether the site still exists | Yes, No | Yes | SharePoint admin centre | Closed sites stay in the table so historical figures do not change |
| 21 | Last Refreshed | Date and time | When this row was last written | | 27 Jul 2026 06:00 | Refresh job | |

**21 columns.**

---

## WHERE EVERY FIGURE COMES FROM

Every number in the prototype, and how it is produced. If a figure is not on this
list, it has no source.

| Dashboard | Figure | Table | How the number is produced | Ready? |
| --- | --- | --- | --- | --- |
| Records Management | Total Declared Records, 21,646 | Utilization Report Table | Count the rows where Declared as Record is Yes | Ready today |
| Records Management | Declared records by department | Utilization Report Table | The same count, grouped by Department Name | Blocked, Gap 1 |
| Records Management | The two colour split on each bar | Utilization Report Table | The same count, split by Has Physical Counterpart | Ready today |
| Records Management | Drill: department, division, site, library | Utilization Report Table | The same count, grouped by Division Name, then Site Name, then Library Name | Blocked, Gap 1 |
| Records Management | Date range on declared records | Utilization Report Table | Keep only rows where Declared Date falls in the range | Ready today |
| Records Management | Total Documents in EDRMS Compliant Sites, 3.47M | Utilization Report Table | Count all the rows where EDRMS Compliant is Yes | Needs the document scan |
| Records Management | Date range on total documents | Utilization Report Table | Keep only rows where Document Created Date falls in the range | Needs the document scan |
| Records Management | Active Departmental Sites | Site Activity Table | Rank sites by Site Visits for the chosen window | Needs the usage feed |
| Records Management | Last activity beside each site | Site Activity Table | Read Last Activity Date | Needs the usage feed |
| Records Management | Active Users | Site Activity Table | Rank sites by Unique Viewers for the chosen window | Needs the usage feed |
| Sites and Libraries | Total EDRMS Compliant Sites Created, 1,057 | Site Activity Table | Count the rows where EDRMS Compliant is Yes | Blocked, Gap 3 |
| Sites and Libraries | Sites created by department treemap | Site Activity Table | The same count, grouped by Department Name | Blocked, Gaps 1 and 3 |
| Sites and Libraries | Date range on the treemap | Site Activity Table | Keep only rows where Site Created Date falls in the range | Blocked, Gap 3 |
| Sites and Libraries | Libraries Declaration Rate | Utilization Report Table | Per Library ID: count all rows, count the rows where Declared as Record is Yes, and divide | Needs the document scan |
| Sites and Libraries | Largest Libraries, 43.1 GB | Utilization Report Table | Per Library ID, add up File Size (MB) | Needs the document scan and Gap 2 |
| Sites and Libraries | Average file size | Utilization Report Table | Per Library ID, total File Size divided by the row count | Needs the document scan and Gap 2 |
| Format and Storage | Storage Consumed by Format, 46.7 GB | Utilization Report Table | Per Format Group, add up File Size (MB) | Gap 2 |
| Format and Storage | Number of files by format | Utilization Report Table | Per Format Group, count the rows | Ready today |
| Format and Storage | Most Common Format, PDF | Utilization Report Table | The Format Group with the highest row count | Ready today |
| Format and Storage | Declared records by format | Utilization Report Table | Per Format Group, count the rows where Declared as Record is Yes | Ready today |
| Retention, not yet built | Records by retention status | Utilization Report Table | Per Retention Status, count the rows where Declared as Record is Yes | Ready today |
| Retention, not yet built | Records due for disposal | Utilization Report Table | Count the rows where Due Date for Disposal is in the next 12 months | Ready today |
| Every dashboard | The "Data as of" line | Both tables | Read Snapshot Date | Ready today |

Three answers appear in that last column, and they mean different things.

- **Ready today.** The data exists in the EDRMS database now. Nothing is needed
  beyond building the table.
- **Needs the document scan.** A weekly read of every document in every
  compliant site. It does not exist yet. It is the same single piece of work for
  all of those rows, and it is what turns the report from "records declared" into
  "records declared out of documents held".
- **Needs the usage feed.** A weekly read of the Microsoft 365 usage reports.
  Standard, and independent of everything else.
- **Blocked.** Something has to be decided or populated before the figure can
  exist at all. The three below.

---

## THE THREE GAPS

### Gap 1. There is no department or division on anything

Every department and division figure in the report depends on this, which is six
panels and every drill down.

The vocabularies exist and are populated in the term store. What does not exist
is the link from a site to its department. `ADBMeta`, the table that would hold
it per record, is empty and out of scope for release 2026.1.

The practical route is to attach the department to the **site** rather than to
each record, in the Site Activity Table, and let every document inherit it from
the site it lives in. That is one value per site, about 1,057 of them, instead of
one per record. AvePoint Cloud Governance may already hold it from when each site
was provisioned, in which case this is a export rather than a data entry
exercise. Worth checking before anything else, because it is the largest open
item in the report.

### Gap 2. File size is not captured

Every storage figure depends on it: the 46.7 GB headline, storage by format,
average file size, and Largest Libraries.

This is the smallest of the three. The EDRMS application already stores file
information for each record, and file size is one more value inside it, so no
change to the database structure is needed. Separately, the document scan
described above returns file size for every document as a matter of course, so
solving the scan solves most of this at the same time.

### Gap 3. There is no site created date, and no rule for what counts as compliant

Three figures depend on it: the 1,057 compliant sites, the treemap, and the date
range on the treemap.

The existing site list holds site URL, site name and project end date. It does
not hold when the site was created, and there is no recorded definition of what
makes a site EDRMS compliant. The created date can be read from the SharePoint
admin centre. The compliance rule is a decision rather than a technical problem,
and it needs to come from RAC: whether a site is compliant because it was
provisioned through the EDRMS process, because it carries a particular template,
or because it appears on a maintained list.

---

## WHAT WAS DELIBERATELY LEFT OUT

- **A separate department reference table.** Department and division names sit
  directly on both tables instead. It means a department with no sites and no
  documents will not appear in a filter list, which is a fair trade for removing
  a table and a join from something meant to be readable.
- **A declaration attempts table.** The EDRMS application already records every
  declaration attempt, including the ones that failed and why. That would support
  a declaration success rate dashboard, which does not exist in the prototype. It
  is worth building later, and it is a third table when it is.
- **Keeping every weekly snapshot.** Each refresh replaces the last. Trends over
  time would need history kept, which at 3.47 million rows a week should be a
  small monthly summary rather than full copies. No dashboard in the prototype
  shows a trend over time, so this is not needed yet.

---

## DECISIONS NEEDED

| # | Question | Who decides | Why it matters |
| --- | --- | --- | --- |
| 1 | What makes a site EDRMS compliant? | RAC | Three figures cannot be produced without it, and "compliant" appears in two dashboard titles |
| 2 | Does AvePoint hold the department for each site? | IT | Decides whether Gap 1 is an export or a manual mapping of about 1,057 sites |
| 3 | How often should the report refresh? | RAC | Assumed weekly. Daily is possible; the document scan is the part that sets the cost |
| 4 | Should documents in non compliant sites be captured too? | RAC | Assumed no. Capturing them would let the report show sites that ought to be onboarded |
| 5 | Is the 90 day Active Users fallback acceptable? | RAC | Microsoft does not return unique viewers at 90 days. The report currently shows site visits instead, with a note |
