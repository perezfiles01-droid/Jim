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
| 35 | Due Date for Disposal | Date | When the record becomes due for disposal | | 12 Mar 2036 | Derived from Retention Label Applied Date plus Retention Duration | The workbook defines it this way at `4 Records` row 81. Feeds the Retention dashboard |
| 36 | Retention Status | Choice | Where the record sits against its retention period | Active, Due for review, Due for disposal, Disposed, Permanent | Active | Derived from Due Date for Disposal | Feeds the Retention dashboard |
| 37 | Disposal Status | Choice | Where the record sits in the disposal process | Not due, Pending approval, Approved, Disposed | Not due | EDRMS application | Feeds the Retention dashboard |
| 38 | Sensitivity Label | Text | Sensitivity label on the document | | Internal | SharePoint | Not on any current dashboard. Included because it is free to collect and is the obvious next question after retention |
| 39 | Is Deleted | Yes / No | Whether the document has since been deleted | Yes, No | No | EDRMS application | Every count in the report excludes rows where this is Yes |
| 40 | Last Refreshed | Date and time | When this row was last written | | 27 Jul 2026 06:00 | Refresh job | Operational. Lets a failed or partial refresh be spotted |

**40 columns.**

---

## COLUMN BY COLUMN: WHAT EACH ONE IS FOR, AND WHETHER IT EXISTS TODAY

Every one of the 40 columns above, what it produces in the report, and exactly
where it can be found today.

**Read this first, or the table below will mislead you.** The Records table in
the database holds **declared records only**, about 21,646 of them. The
Utilization Report Table holds **every document**, about 3.47 million. So when a
row below says a column exists in `Records`, that means it exists **for the
declared 21,646**. For the other 3.45 million documents the same column comes
from the weekly SharePoint scan, which does not exist yet. That is one piece of
work covering columns 3 to 19 in one go, not nineteen separate problems.

**Workbook** means the uploaded `Database_Design_12.03_2.xlsx`. Sheet names and
row numbers are the actual sheet tabs and spreadsheet row numbers in that file.
The Records sheet holds two blocks; all references below are to the **2026.1
block, rows 56 to 82**, not the older 1.3 block above it.

**Live database** means `drm-npr`, schema `public`, which is what is actually
deployed. Four tables in the workbook were never built: `ADBMaster`, `Library`,
`PhysicalRecords` and `favoritelocations`.

| # | Column | Where it appears in the report | Exists today? | Workbook location | Live database location |
| --- | --- | --- | --- | --- | --- |
| 1 | Row ID | Not shown. Identifies each row so it can be updated or removed | New | Equivalent at `4 Records` row 56 (S/N 1) `Id` | `Records.Id` |
| 2 | Snapshot Date | The "Data as of" line at the top right of all five dashboards | **No** | Not in the workbook | Nowhere. Written by the refresh job |
| 3 | Document ID | Not shown. Identifies a document across refreshes, so a renamed or moved file is not counted twice | Yes | `4 Records` row 69 (S/N 14) `DocumentId` | `Records.DocumentId` |
| 4 | Document Name | Not shown on a chart. Makes an export or a click through readable | Yes | `4 Records` row 66 (S/N 11) `Title` | `Records.Title` |
| 5 | Document URL | Not shown on a chart. The click through from the report to the document | Derived | Built from rows 70, 72, 74 and 66 | Built from `SiteUrl`, `LibraryUrl`, `FolderPath`, `Title` |
| 6 | File Extension | Feeds Format Group. Not shown on its own | Yes, in JSON | `4 Records` row 75 (S/N 20) `FileMeta`, key `FileType` | `Records.FileMeta` key `FileType` |
| 7 | Format Group | **Format and Storage:** the 8 rows of the storage table, the Most Common Format KPI, the declared records by format bars. **Overview:** both format donuts | Derived | Not in the workbook. Grouped from File Extension | Grouped from File Extension |
| 8 | File Size (MB) | **Format and Storage:** the Storage GB column, the Avg file size column, the 46.7 GB KPI. **Sites and Libraries:** Largest Libraries bars, the 43.1 GB KPI, the avg file size sort. **Overview:** the storage donut and the storage KPI card | **No. Gap 2** | `4 Records` row 75 `FileMeta` holds FileType, FileCreatedDate, SensitivityLabelName and SensitivityLabelID. **There is no size key** | Missing from `Records.FileMeta`. One key to add, not a migration |
| 9 | Document Created Date | **Records Management:** the date range filter on the Total Documents panel | Yes, in JSON | `4 Records` row 75 (S/N 20) `FileMeta`, key `FileCreatedDate` | `Records.FileMeta` key `FileCreatedDate` |
| 10 | Document Modified Date | Not shown. Needed for any future stale content view | Yes, with a caveat | `4 Records` row 61 (S/N 6) `ModifiedDate` | `Records.ModifiedDate`. **This is when the record row changed, not when the file changed.** For the file itself, use the scan |
| 11 | Folder Path | Not shown. Builds Document URL and separates folders inside one library | Yes | `4 Records` row 74 (S/N 19) `FolderPath` | `Records.FolderPath` |
| 12 | Library Name | **Records Management:** level 4 of both drill downs. **Sites and Libraries:** the row label on Libraries Declaration Rate and on Largest Libraries | Yes | `4 Records` row 73 (S/N 18) `LibraryName` | `Records.LibraryName` |
| 13 | Library URL | Not shown. Click through to the library | Yes | `4 Records` row 72 (S/N 17) `LibraryUrl` | `Records.LibraryUrl` |
| 14 | Library ID | Not shown. The grouping key behind every library figure, because library names can change | Yes | `4 Records` row 67 (S/N 12) `ListId` | `Records.ListId` |
| 15 | Library Category | Not shown today. The natural grouping for Department Performance when it is built | Planned, but available elsewhere | `4 Records` row 76 (S/N 21) `ADBMeta`, key `ADBLibraryCategory`, marked **Future Enhancement**. Also `Library` sheet row 6 (R1.4) and `ADBMaster` rows 22 to 24 | `Records.ADBMeta` is empty. **Populated today** as "Library Type" in the Retention Label Mapping list in `app_edrms_data_uat` |
| 16 | Site Name | **Records Management:** level 3 of both drill downs, and the row label on Active Sites. **Sites and Libraries:** the "in <site>" sub label under each library | Yes | `4 Records` row 71 (S/N 16) `SiteName`. Also `Site` sheet row 14 (S/N 10) | `Records.SiteName` and `ADBSites.SiteName` |
| 17 | Site URL | Not shown. Joins this table to the Site Activity Table | Yes | `4 Records` row 70 (S/N 15) `SiteUrl`. Also `Site` sheet row 13 (S/N 9) | `Records.SiteUrl` and `ADBSites.SiteUrl` |
| 18 | Site Created Date | Not shown from this table. A copy of the Site Activity value, so documents can be filtered by site age without a join | **No. Gap 3** | `Site` sheet row 6 (S/N 2) is `CreatedDate`, but that is **when the row was created in EDRMS, not when the SharePoint site was created** | Not in `ADBSites`. Read from the SharePoint admin centre |
| 19 | EDRMS Compliant | **Records Management:** decides which documents count toward Total Documents in EDRMS Compliant Sites, 3.47M. Defines the population of the whole table | **No. Gap 3** | No such column and no rule anywhere in the workbook | Nowhere. A definition RAC has to give before it can be built |
| 20 | Department Code | Not shown. The short code behind the department filter values | **Planned only. Gap 1** | `4 Records` row 76 (S/N 21) `ADBMeta`, key `ADBDepartmentOwner`, marked **Future Enhancement**. Values in `ADBMaster` rows 13 to 15 | `Records.ADBMeta` is empty. `ADBMaster` was never built |
| 21 | Department Name | **Records Management:** level 1 of both drill downs and the department filter on 4 panels. **Sites and Libraries:** the department filter, and the treemap. **Overview:** both top 5 department lists | **Planned only. Gap 1** | Same as row 20. The vocabulary itself is populated in the SharePoint term store | Same as row 20 |
| 22 | Division Code | Not shown. The short code behind division values | **Planned only. Gap 1** | `4 Records` row 76 `ADBMeta`, key `ADBDivisionOwner`. Values in `ADBMaster` rows 16 to 18 | `Records.ADBMeta` is empty |
| 23 | Division Name | **Records Management:** level 2 of both drill downs | **Planned only. Gap 1** | Same as row 22 | Same as row 22 |
| 24 | Unit Code | Not shown. No current dashboard uses it | **Planned only** | `4 Records` row 76 `ADBMeta`, key `ADBUnitOwner`. Values in `ADBMaster` rows 19 to 21 | `Records.ADBMeta` is empty |
| 25 | Unit Name | Not shown. No current dashboard uses it | **Planned only** | Same as row 24 | Same as row 24 |
| 26 | Declared as Record | **Records Management:** Total Declared Records 21,646 and every bar under it. **Sites and Libraries:** the declared half of Libraries Declaration Rate. **Format and Storage:** declared records by format. **Overview:** 3 of the 5 KPI cards and both split donuts. **Retention:** every figure | Yes, implicitly | Not a column, because every row of the `4 Records` sheet already **is** a declared record | A row existing in `Records` means Yes. The No side comes from the scan |
| 27 | Declared Date | **Records Management:** the date range filter on Total Declared Records, and the in range subtotal line under it | Yes | `4 Records` row 59 (S/N 4) `CreatedDate`, described as "When the User Declared the file as a Record" | `Records.CreatedDate` |
| 28 | Declared By | Not shown today. Supports a declarations by user view | Yes | `4 Records` row 60 (S/N 5) `CreatedBy` | `Records.CreatedBy` |
| 29 | Declaration Type | Not shown. Separates Regular from Centralized declarations | Planned, release 2026.2 | `4 Records` row 82 (S/N 27) `DeclarationType` | Not deployed yet |
| 30 | Has Physical Counterpart | **Records Management:** the two colour split on every bar of Total Declared Records. **Overview:** the physical counterpart donut | Yes, in JSON | `4 Records` row 77 (S/N 22) `EDRMSMeta`, key `HasPhysical` | `Records.EDRMSMeta` key `HasPhysical` |
| 31 | Physical Counterpart Retention | Not shown. The retention that applies to the physical copy | Yes, outside the database | Not in the workbook | "Physical Counterpart" in the Retention Label Mapping list in `app_edrms_data_uat` |
| 32 | Retention Label | **Retention**, not yet built | Yes | `4 Records` row 78 (S/N 23) `EDRMSRetentionLabel` | `Records.EDRMSRetentionLabel`. Also "Retention Label" in the mapping list |
| 33 | Retention Duration (Years) | Feeds Due Date for Disposal | Yes | `4 Records` row 80 (S/N 25) `EDRMSDuration` | `Records.EDRMSDuration`. Also "Retention Duration" in the mapping list |
| 34 | Retention Label Applied Date | Feeds Due Date for Disposal. **Deliberately not used to date declarations** | Yes | `4 Records` row 79 (S/N 24) `EDRMSRetentionLabelApplied`, described as the basis for the duration computation | `Records.EDRMSRetentionLabelApplied` |
| 35 | Due Date for Disposal | **Retention**, not yet built: records due for disposal | Yes | `4 Records` row 81 (S/N 26) `EDRMSDueDateForDisposal`, defined there as RetentionLabelApplied plus Duration | `Records.EDRMSDueDateForDisposal` |
| 36 | Retention Status | **Retention**, not yet built: the status breakdown | Yes, in JSON | `4 Records` row 77 (S/N 22) `EDRMSMeta`, key `RetentionStatus`. Permitted values in `5 EDRMSMasters` rows 16 to 18 | `Records.EDRMSMeta` key `RetentionStatus`, values in `EDRMSMasters` |
| 37 | Disposal Status | **Retention**, not yet built: where a record sits in the disposal process | **No** | Not in the workbook | Nowhere. Needed only when Retention is built |
| 38 | Sensitivity Label | Not shown on any dashboard | Yes, in JSON | `4 Records` row 75 (S/N 20) `FileMeta`, key `SensitivityLabelName` | `Records.FileMeta` key `SensitivityLabelName` |
| 39 | Is Deleted | Every count on every dashboard excludes rows where this is Yes | Yes | `4 Records` row 65 (S/N 10) `IsDeleted` | `Records.IsDeleted` |
| 40 | Last Refreshed | Not shown. Operational, so a partial refresh can be spotted | **No** | Not in the workbook | Nowhere. Written by the refresh job |

### What that adds up to

| Status | Count | Which columns |
| --- | --- | --- |
| Already captured today | 24 | 1, 3, 4, 6, 9, 10, 11, 12, 13, 14, 16, 17, 26, 27, 28, 30, 31, 32, 33, 34, 35, 36, 38, 39 |
| Derived from a column already captured | 2 | 5 Document URL, 7 Format Group |
| Planned in the workbook but not built | 8 | 15, 20, 21, 22, 23, 24, 25, 29 |
| Not anywhere, and blocking a figure | 3 | 8 File Size, 18 Site Created Date, 19 EDRMS Compliant |
| Not anywhere, and blocking nothing | 3 | 2 Snapshot Date, 37 Disposal Status, 40 Last Refreshed |
| **Total** | **40** | |

The honest headline: **24 of the 40 columns already exist** for the declared
records, and the effort is concentrated in three places, which are the same three
gaps described further down. Nothing in this table is a surprise requirement.

### Columns that exist and were deliberately left out

- **`PhysicalRecordJustification`**, workbook `4 Records` row 77 `EDRMSMeta`,
  second key. The reason a physical counterpart exists. Free to add and it is
  the natural companion to column 30. Left out only because no dashboard shows
  it. Say the word and it becomes column 41.
- **`JobTriggerId`**, workbook `4 Records` row 57 (S/N 2). Groups records
  declared in the same batch. Belongs with declaration success rate, which is a
  dashboard that does not exist yet.
- **`RecordID`**, workbook `4 Records` row 58 (S/N 3). Internal to the EDRMS
  application. `DocumentId` is the identifier the report should key on.
- **`ModifiedBy`, `DeletedBy`, `DeletedDate`**, workbook rows 62, 64 and 63.
  Audit columns with no reporting use.

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
