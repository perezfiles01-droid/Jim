# EDRMS UTILIZATION REPORT: DATABASE TABLES

What the Utilization Report needs to exist in the database, written the same way
a SharePoint list is written: a table name, its columns, and what each column
holds. No code. Every figure on every dashboard in the prototype is traced back
to a column here.

**Four tables carry the whole report**, one per grain.

| Table | One row per | What it feeds |
| --- | --- | --- |
| **Utilization Report Table** | document | Records Management, Sites and Libraries, Format and Storage, Retention, and the Overview |
| **Site Activity Table** | SharePoint site | Sites created, the treemap, the site inventory, Active and Inactive sites |
| **User Activity Table** | person | Total EDRMS Users, counted as distinct people rather than summed site memberships |
| **File Plan Table** | term | Total terms and the five category counts. The taxonomy that classifies the content, rather than the content |

Proposed database names, for the team who will build them: `utilization_report`,
`utilization_site_activity`, `utilization_user_activity` and `utilization_file_plan`,
in a separate schema
so the existing tables that the EDRMS application owns are never touched.

**Everything here is buildable from what the tenant returns today.** Columns that
depended on a person supplying a list, a rule nobody had written, or a change to
the EDRMS application were removed rather than carried as hopeful placeholders.
Division is the largest of those removals: it was designed in `ADBMeta`, it is
empty on every row, and nothing in SharePoint supplies it, so the drill is now
**Department, Site, Library**.

---

## COLUMN NAMING RULE

**Where a column already exists in the EDRMS database, it keeps the exact same
name here.** `CreatedDate` stays `CreatedDate`, not "Declared Date".
`ListId` stays `ListId`, not "Library ID". Renaming makes a column impossible to
trace back to where it came from, and the report is not worth that cost.

Three consequences worth knowing before reading the tables.

**1. JSON keys become real columns, keeping the key name.** `FileMeta`,
`EDRMSMeta` and `ADBMeta` are single JSON fields in `public."Records"` holding
several values each. A reporting table cannot filter or total a value buried
inside JSON efficiently, so each key becomes its own column and **keeps the key
name exactly**. `FileMeta` key `FileType` becomes a column called `FileType`.

**2. `CreatedDate` means the declaration date.** In `public."Records"` it is
described as "Date when an Item is Created; When the User Declared the file as a
Record". That is the date every declaration filter in the report reads. It is
not the date the file was made, which is `FileCreatedDate`.

**3. Two names had to be invented because the existing name means something
else.** `ModifiedDate` in `Records` is when the **record row** changed, not when
the **file** changed, so the file's own date is `FileModifiedDate`. Everything
else marked NEW below is genuinely new and named to match the surrounding
convention.

---

## THE GRAIN: WHAT ONE ROW MEANS

One row is **one SharePoint item**, identified by `ListId` plus `ItemId`
together. Not by `DocumentId`.

`DocumentId` looks like the natural identifier and it is nullable, so it cannot
carry that job on its own. A check against UAT returned **1,990 rows against
1,984 distinct `DocumentId`**, a gap of six. Whether those six are documents
declared twice or rows with no `DocumentId` at all, the conclusion is the same:
`ListId` and `ItemId` are both `NOT NULL` in `public."Records"` and together they
locate exactly one item in exactly one library, so they are the safe identity.

This matters for one figure. **Total Declared Records should count distinct
items, not rows**, so that a document declared twice is one record and not two.
On the UAT data that is a difference of six in 1,990, which changes nothing
visually and everything about whether two people building two reports get the
same number. It is a definition RAC should sign off once, in writing.

---

## HOW TO READ THE FIELD TYPES

| Written here | In PostgreSQL |
| --- | --- |
| Text | `text` |
| Unique ID | `uuid` |
| Whole number | `integer` or `bigint` |
| Decimal number | `numeric` |
| Date | `date` |
| Date and time | `timestamptz` |
| Yes / No | `boolean` |
| Choice | `text`, restricted to the listed values |

---

## CAN IT BE ONE TABLE ONLY?

Almost. One table gets you roughly nine tenths of the report. Three things break.

**1. A site with no documents in it disappears.** Sites and Libraries reports
**1,057 EDRMS compliant sites created**. If sites are counted from a table of
documents, a site is only counted once it holds at least one document. A site
created last month that nobody has uploaded to yet is invisible, so the count
comes out low, and it gets worse over time because the newest sites are the
emptiest ones.

**2. Site visits and unique viewers are measured per site, not per document.**
If a site had 4,812 visits last month and holds 6,000 documents, putting 4,812
on all 6,000 rows means any total that adds the column up returns 28 million
visits. There is no way to put a per site figure on a per document table and
have it stay correct when summed.

**3. People cannot be counted from a table of sites.** Total EDRMS Users asks
how many **people** used EDRMS. Someone working in three sites appears in three
site rows, so adding up the per site viewer counts counts them three times.

Everything else fits in one table. So the answer is **three tables**, one per
grain: one row per document, one row per site, one row per person. The second
and third are small, about 1,057 and 9,400 rows, and each exists only because
its grain cannot be reached from the others.

---

## TABLE 1. UTILIZATION REPORT TABLE

One row per document held in an EDRMS compliant site, **including documents that
have not been declared**. Without the undeclared ones there is no denominator
and no declaration rate.

About 3.47 million rows. Replaced in full at each weekly refresh.

| S/N | Column Title | Field Type | Description | Field Values / Choices | Sample | Source | Remarks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Id | Unique ID | Unique row identifier | | 3f2a...b81c | Generated | Primary key. Produces no figure. `Records.Id` is a `uuid`, so this is one too |
| 2 | SnapshotDate | Date | The date this data was captured | | 27 Jul 2026 | Refresh job | **NEW.** Same value on every row in a refresh. The "Data as of" line on every dashboard |
| 3 | DocumentId | Text | SharePoint Document ID | | 1000-52341 | `Records.DocumentId` | Survives a rename or a move, so a document is never counted twice |
| 4 | Title | Text | Filename of the file | | Board Paper Q2.pdf | `Records.Title` | |
| 5 | DocumentUrl | Text | Direct link to the document | | https://adb.sharepoint.com/sites/... | Built from SiteUrl, LibraryUrl, FolderPath and Title | **NEW.** Derived, not stored anywhere today |
| 6 | FileType | Text | File extension, lowercase | | pdf | `Records.FileMeta` key `FileType` | Flattened out of the JSON, keeping the key name |
| 7 | FormatGroup | Choice | The grouping the report displays | PDF, Word, Excel, PowerPoint, Email, Image files, Video files, All other formats | PDF | Derived from FileType | **NEW.** The eight groups on Format and Storage. Anything unrecognised falls into All other formats |
| 8 | FileSize | Whole number | Size of the file in bytes | | 2516582 | `Records.FileMeta` key `FileSize` | **NEW KEY, does not exist yet.** Every storage figure depends on it. See Gap 2. Bytes rather than MB so nothing is rounded before it is totalled |
| 9 | FileCreatedDate | Date and time | When the file itself was created | | 12 Mar 2026 09:14 | `Records.FileMeta` key `FileCreatedDate` | The date range on the Total Documents panel reads this. Not the declaration date |
| 10 | FileModifiedDate | Date and time | When the file itself was last changed | | 04 Jun 2026 16:02 | SharePoint scan | **NEW.** Named this way because `Records.ModifiedDate` already means when the record row changed |
| 11 | FolderPath | Text | Folder path inside the library | | /2026/Q2/Board | `Records.FolderPath` | |
| 12 | LibraryName | Text | Name of the library holding the file | | Annual Meetings | `Records.LibraryName` | Fourth and deepest level of the drill down |
| 13 | LibraryUrl | Text | URL of the library | | /sites/.../AnnualMeet | `Records.LibraryUrl` | |
| 14 | LibraryLastActivityDate | Date | When anything in the library last changed | | 22 Jul 2026 | Microsoft Graph | **NEW.** `lastModifiedDateTime` on the drive, from the same `GET /sites/{id}/drives` call that supplies `LibraryCount`. Repeated on every document row of that library, the same way `SiteCreatedDate` is, so a library can be judged active or dormant without a join |
| 15 | ListId | Unique ID | SharePoint library ID | | a869c724-ac4e-... | `Records.ListId`, a `uuid` | Libraries can be renamed. This does not change, so every library figure groups on this |
| 16 | ItemId | Whole number | SharePoint item ID within the library | | 203 | `Records.ItemId` | With ListId this identifies exactly one item. Together they are the identity of a row. See the grain section above |
| 17 | ADBLibraryCategory | Text | Library category | Common Document Library, Procurement, and the other values in the mapping list | Common Document Library | `Records.ADBMeta` key `ADBLibraryCategory` | ADBMeta is empty. Populated today as "Library Type" in the Retention Label Mapping list |
| 18 | SiteName | Text | Name of the site holding the file | | org_edrms_uat | `Records.SiteName` | Third level of the drill down |
| 19 | SiteUrl | Text | URL of the site holding the file | | https://adb.sharepoint.com/sites/edrms-cwrd | `Records.SiteUrl` | Joins this table to the Site Activity Table |
| 20 | SiteCreatedDate | Date | When the SharePoint site was created | | 18 Jan 2026 | SharePoint admin centre | **NEW.** A copy from the Site Activity Table. See Gap 3 |
| 21 | IsEdrmsCompliant | Yes / No | Whether the parent site is an EDRMS compliant site | true, false | true | Needs a rule | **NEW.** No rule exists anywhere today. See Gap 3 |
| 22 | ADBDepartmentOwner | Text | Owning department | | CWRD | `Records.ADBMeta` key `ADBDepartmentOwner` | ADBMeta is marked Future Enhancement and is empty. See Gap 1 |
| 23 | IsDeclaredRecord | Yes / No | Whether this document has been declared a record | true, false | true | Derived at load | **NEW.** true if the document appears in `Records`, false otherwise. **The single most important column in the report** |
| 24 | CreatedDate | Date and time | Date when the user declared the file as a record | | 12 Mar 2026 09:14 | `Records.CreatedDate` | Blank when not declared. Every declaration date filter reads this |
| 25 | CreatedBy | Text | Email or ID of the user that declared the record | | jperez@adb.org | `Records.CreatedBy` | |
| 26 | DeclarationType | Whole number | Regular or centralized declaration, as a code | | 1 | `Records.DeclarationType` | **Deployed today** as an `integer`. The code to label mapping needs confirming with the development team |
| 27 | HasPhysical | Yes / No | Whether the file has a physical counterpart | true, false | false | `Records.EDRMSMeta` key `HasPhysical` | Drives the two colour split on every bar of Total Declared Records |
| 28 | PhysicalCounterpartRetention | Choice | Retention that applies to the physical copy | Long Term, Permanent | Long Term | Retention Label Mapping list, column "Physical Counterpart" | Maintained per library, not per document |
| 29 | EDRMSRetentionLabel | Text | Retention label applied to the file | | 10 years after declaration | `Records.EDRMSRetentionLabel` | |
| 30 | EDRMSDuration | Text | Duration length of the retention label | | 10 | `Records.EDRMSDuration` | **Stored as text, not a number**, so it can hold Permanent alongside 10. Cast before doing arithmetic on it |
| 31 | EDRMSRetentionLabelApplied | Date and time | Date the retention label was applied | | 12 Mar 2026 09:20 | `Records.EDRMSRetentionLabelApplied` | **Never use this to date a declaration.** A label can be applied to a document that was never declared. Use CreatedDate |
| 32 | EDRMSDueDateForDisposal | Date | Computed EDRMSRetentionLabelApplied plus EDRMSDuration | | 12 Mar 2036 | `Records.EDRMSDueDateForDisposal` | The workbook defines the computation this way |
| 33 | RetentionStatus | Text | Retention classification based on the duration | Values maintained in `EDRMSMasters` | Active | `Records.EDRMSMeta` key `RetentionStatus` | |
| 34 | SensitivityLabelName | Text | Sensitivity label on the file | | Internal | `Records.FileMeta` key `SensitivityLabelName` | Not on any current dashboard |
| 35 | IsDeleted | Yes / No | Soft delete flag | true, false | false | `Records.IsDeleted` | Every count on every dashboard excludes rows where this is true |
| 36 | RowLoadedDate | Date and time | When this row was last written | | 27 Jul 2026 06:00 | Refresh job | **NEW.** Operational. Lets a failed or partial refresh be spotted |

**36 columns**, down from 38. `ADBDivisionOwner` and `ADBUnitOwner` were removed because nothing in the tenant populates them and no panel reads them, and `DisposalStatus` because it needs a new field in the EDRMS application, while every disposal figure on the Retention dashboard is already computable from `EDRMSDueDateForDisposal`. 24 of the remaining columns hold data today.

---

## TABLE 2. SITE ACTIVITY TABLE

One row per SharePoint site. About 1,057 rows.

Exists for the two things a document level table cannot do: count sites that
hold no documents, and hold visit and viewer counts measured per site.

| S/N | Column Title | Field Type | Description | Field Values / Choices | Sample | Source | Remarks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Id | Whole number | Unique row identifier | | 1 | Generated | Primary key. Same name as `Site.Id` in the workbook |
| 2 | SnapshotDate | Date | The date this data was captured | | 27 Jul 2026 | Refresh job | **NEW** |
| 3 | SiteUrl | Text | URL of the site | | https://adb.sharepoint.com/sites/edrms-cwrd | `ADBSites.SiteUrl` | Joins this table to the Utilization Report Table |
| 4 | SiteName | Text | Name of the site | | EDRMS CWRD | `ADBSites.SiteName` | |
| 5 | SiteCreatedDate | Date | When the SharePoint site was created | | 18 Jan 2026 | SharePoint admin centre | **NEW.** The treemap and its date range both read this. See Gap 3 |
| 6 | IsEdrmsCompliant | Yes / No | Whether this is an EDRMS compliant site | true, false | true | Needs a rule | **NEW.** See Gap 3 |
| 7 | ADBDepartmentOwner | Text | Owning department | | CWRD | Term store or AvePoint | **NEW on this table.** Same name as the ADBMeta key. See Gap 1 |
| 8 | SiteVisits7 | Whole number | Site visits, last 7 days | | 412 | Microsoft 365 usage reports | **NEW** |
| 9 | SiteVisits30 | Whole number | Site visits, last 30 days | | 4812 | Microsoft 365 usage reports | **NEW** |
| 10 | SiteVisits90 | Whole number | Site visits, last 90 days | | 13240 | Microsoft 365 usage reports | **NEW** |
| 11 | UniqueViewers7 | Whole number | Unique viewers, last 7 days | | 38 | Microsoft 365 usage reports | **NEW** |
| 12 | UniqueViewers30 | Whole number | Unique viewers, last 30 days | | 122 | Microsoft 365 usage reports | **NEW** |
| 13 | LibraryCount | Whole number | Number of document libraries in the site | | 12 | Microsoft Graph | **NEW.** `GET /sites/{id}/drives`, counted. Answers "libraries per site" directly |
| 14 | LastActivityDate | Date | Most recent activity on the site | | 24 Jul 2026 | Microsoft 365 usage reports | **NEW.** Printed beside each bar on Active Sites |
| 15 | StorageUsed | Whole number | Storage used by the site, in bytes | | 13636370432 | SharePoint admin centre | **NEW.** Includes version history, so it reads higher than the sum of FileSize. Expected, not an error |
| 16 | SiteOwner | Text | Primary site administrator | | jperez@adb.org | SharePoint admin centre | **NEW.** Who to contact about a site that has gone quiet |
| 17 | ProjectEndDate | Date | Project end date for the site | | 31 Dec 2027 | `ADBSites.ProjectEndDate` | Already exists. Not on a dashboard yet, and the obvious basis for a site closure view |
| 18 | IsDeleted | Yes / No | Soft delete flag | true, false | false | `ADBSites.IsDeleted` | Closed sites stay in the table so historical figures do not change |
| 19 | RowLoadedDate | Date and time | When this row was last written | | 27 Jul 2026 06:00 | Refresh job | **NEW** |

**19 columns.**

`ADBDivisionOwner` is gone with the rest of the division design.
`UniqueViewers90` is gone because Microsoft does not return it: the column
existed only to hold a blank and justify a fallback, and the dashboard no longer
offers a 90 day unique viewer window at all.

**Inactivity is derived, not stored.** A site is inactive when
`LastActivityDate` is more than 90 days old. Storing a flag would mean a site
silently changing state between refreshes with nothing recording when, so the
report computes it and the threshold stays a single number that can be changed
in one place. The same rule at library level uses `LibraryLastActivityDate`.

---

## TABLE 3. USER ACTIVITY TABLE

One row per person who used SharePoint in the window. About 9,400 rows.

**Why a third table.** The client asks for Total EDRMS Users as monthly active
users. That is a count of **people**, and people cannot be counted from the Site
Activity Table: someone who works in three sites appears in three rows, so
summing `UniqueViewers30` counts them three times. A row per person is the only
shape that answers the question, and it is the same reason the site table exists
separately from the document table. Three grains, three tables.

It is small and it is one call, so the cost is close to nothing.

| S/N | Column Title | Field Type | Description | Field Values / Choices | Sample | Source | Remarks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Id | Whole number | Unique row identifier | | 1 | Generated | Primary key |
| 2 | SnapshotDate | Date | The date this data was captured | | 27 Jul 2026 | Refresh job | **NEW** |
| 3 | UserPrincipalName | Text | The person's sign in name | | jperez@adb.org | Microsoft 365 usage reports | **NEW.** The identity of the row. Counting distinct values of this is the whole point of the table |
| 4 | DisplayName | Text | The person's display name | | J Perez | Microsoft 365 usage reports | **NEW** |
| 5 | LastActivityDate | Date | Their most recent SharePoint activity | | 24 Jul 2026 | Microsoft 365 usage reports | **NEW.** Filter on this for the 7 or 30 day window |
| 6 | ViewedOrEditedFileCount | Whole number | Files they viewed or edited in the window | | 42 | Microsoft 365 usage reports | **NEW.** Separates heavy users from people who opened one thing |
| 7 | RowLoadedDate | Date and time | When this row was last written | | 27 Jul 2026 06:00 | Refresh job | **NEW** |

**7 columns.** All of them come from one call,
`getSharePointSiteUsageDetail`'s sibling `getSharePointActivityUserDetail(period='D30')`,
which returns one row per user and needs the same `Reports.Read.All` permission
the site usage feed already requires.

**Monthly active users** is then `COUNT(DISTINCT UserPrincipalName)` over the
latest snapshot. It will be **lower** than the sum of `UniqueViewers30` across
sites, and that is correct, not a reconciliation failure. The Records Management
dashboard shows both figures side by side and explains the difference, because a
reader who adds up the bars will otherwise think the total is broken.

---

## TABLE 4. FILE PLAN TABLE

One row per term in the institutional file plan. A few hundred to a few thousand
rows depending on how deep the plan runs.

**Why a fourth table.** The file plan is the SharePoint term store. Its terms are
not documents, not sites and not people, so none of the other three tables can
hold them. It is also the only table here whose source is not SharePoint content
at all: it is the taxonomy that classifies the content.

| S/N | Column Title | Field Type | Description | Field Values / Choices | Sample | Source | Remarks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Id | Whole number | Unique row identifier | | 1 | Generated | Primary key |
| 2 | SnapshotDate | Date | The date this data was captured | | 27 Jul 2026 | Refresh job | **NEW** |
| 3 | TermId | Unique ID | The term's own identifier | | 6f2c...9a41 | Microsoft Graph term store | **NEW.** Stable across a rename, so counts do not jump when someone edits a label |
| 4 | TermName | Text | The term's label | | Procurement Planning | Microsoft Graph term store | **NEW** |
| 5 | TermSetName | Text | The term set the term belongs to | | Procurement | Microsoft Graph term store | **NEW** |
| 6 | CategoryName | Text | The top level group | Administration, People Management, Programme and operation, Compliance and oversight, Risk management | Programme and operation | Microsoft Graph term store | **NEW.** The five categories the report groups by |
| 7 | Depth | Whole number | How many levels down the term sits | | 3 | Derived while walking the tree | **NEW.** Records how deep the plan actually runs, which is the thing a file plan review usually wants to know |
| 8 | RowLoadedDate | Date and time | When this row was last written | | 27 Jul 2026 06:00 | Refresh job | **NEW** |

**8 columns.** All from the Graph term store API, which needs `TermStore.Read.All`:

```
GET /termStore/groups                    the five categories
GET /termStore/groups/{groupId}/sets     the sets inside one
GET /termStore/sets/{setId}/children     the terms at one level
```

**The one thing to know before estimating this.** A file plan is a tree, and the
API returns **one level at a time**. Counting every term under Administration
means walking down through each level, not reading a total. That is a loop rather
than a blocker, and it is why this is a small job instead of a free one. Recording
`Depth` while walking costs nothing and answers a question a file plan review
usually asks anyway.

---

## COLUMN BY COLUMN: WHICH FIGURE IT PRODUCES, AND HOW TO SOURCE IT

**Read this first, or the table will mislead you.** `public."Records"` holds
**declared records only**, about 21,646 of them. The Utilization Report Table
holds **every document**, about 3.47 million. So where a row says a column
exists in `Records`, it exists **for the declared 21,646**. For the other 3.45
million documents the same column comes from the weekly SharePoint scan. That is
one piece of work covering rows 3 to 23 in one go, not twenty separate problems.

**Where it is today** cites `Database_Design_12.03_2.xlsx` by sheet and actual
spreadsheet row, and the live `drm-npr` database, schema `public`.
All `4 Records` references are to the **2026.1 block, rows 56 to 82**, not the
older 1.3 block above it. `ADBMaster`, `Library`, `PhysicalRecords` and
`favoritelocations` are in the workbook but were never built.

### Table 1: Utilization Report Table

| # | Column | Which figure it produces | Status | Where it is today | How to source it |
| --- | --- | --- | --- | --- | --- |
| 1 | Id | **None.** Identifies the row so a refresh can update or remove it. It does **not** produce Total Declared Records: that figure counts distinct ListId plus ItemId pairs where IsDeclaredRecord is true and IsDeleted is false | Exists | `4 Records` row 56 (S/N 1) `Id`. Live `Records.Id` | Generated by the refresh job |
| 2 | SnapshotDate | The "Data as of" line, top right of all five dashboards | **NEW** | Not in the workbook | Written by the refresh job. Set it once per run |
| 3 | DocumentId | **None directly.** Stops a renamed or moved file being counted twice, so it protects every count on every dashboard | Exists | `4 Records` row 69 (S/N 14). Live `Records.DocumentId` | EDRMS database for declared. **Microsoft Graph** returns it for the rest |
| 4 | Title | **None on a chart.** Makes an export or a click through readable | Exists | `4 Records` row 66 (S/N 11). Live `Records.Title` | EDRMS database, then Microsoft Graph for the rest |
| 5 | DocumentUrl | **None.** The click through from the report to the document | Derived | Not stored. Built from rows 70, 72, 74, 66 | Assemble at load from SiteUrl, LibraryUrl, FolderPath and Title |
| 6 | FileType | Feeds FormatGroup. Also the Format label on each row of the Storage Consumed by Format table | Exists | `4 Records` row 75 (S/N 20) `FileMeta` key `FileType`. Live `Records.FileMeta` | EDRMS database, then Microsoft Graph for the rest |
| 7 | FormatGroup | **Format and Storage:** all 8 rows of Storage Consumed by Format, the Most Common Format KPI (PDF), the declared records by format bars. **Overview:** the share of storage donut and the share of files donut | Derived | Not in the workbook | A lookup list mapping extension to group. RAC owns the list; the eight groups are already fixed in the prototype |
| 8 | FileSize | **Format and Storage:** the Storage GB column, the Avg file size MB column, the 46.7 GB KPI. **Sites and Libraries:** Largest Libraries bars, the 43.1 GB KPI, the avg file size sort. **Overview:** the storage KPI card and the share of storage donut | **Missing. Gap 2** | `4 Records` row 75 `FileMeta` holds FileType, FileCreatedDate, SensitivityLabelName and SensitivityLabelID. **No size key** | Two routes, and you want both. **Microsoft Graph** returns `size` on every driveItem, so the weekly scan gets it at no extra cost. For declared records captured at declaration time, add a `FileSize` key to the `FileMeta` JSON the EDRMS application already writes: a JSON key, not a database migration |
| 9 | FileCreatedDate | **Records Management:** the date range filter on the Total Documents in EDRMS Compliant Sites panel | Exists | `4 Records` row 75 (S/N 20) `FileMeta` key `FileCreatedDate`. Live `Records.FileMeta` | EDRMS database, then Microsoft Graph `createdDateTime` for the rest |
| 10 | FileModifiedDate | **None today.** Needed for any future stale content view | **NEW** | `Records.ModifiedDate` exists but means when the record row changed, not the file | Microsoft Graph `lastModifiedDateTime`, from the same scan |
| 11 | FolderPath | **None.** Builds DocumentUrl and separates folders inside one library | Exists | `4 Records` row 74 (S/N 19). Live `Records.FolderPath` | EDRMS database, then Microsoft Graph for the rest |
| 12 | LibraryName | **Records Management:** level 4 of both drill downs. **Sites and Libraries:** the row label on Libraries Declaration Rate and on Largest Libraries | Exists | `4 Records` row 73 (S/N 18). Live `Records.LibraryName` | EDRMS database, then Microsoft Graph for the rest |
| 13 | LibraryUrl | **None.** Click through to the library | Exists | `4 Records` row 72 (S/N 17). Live `Records.LibraryUrl` | EDRMS database, then Microsoft Graph for the rest |
| 14 | LibraryLastActivityDate | **Sites and Libraries:** Active Libraries, Inactive Libraries, the Long dormant tile and the Last activity column | **NEW** | Nowhere | **Microsoft Graph** `lastModifiedDateTime` on the drive, from the same `GET /sites/{id}/drives` call that supplies `LibraryCount` |
| 15 | ListId | **None directly.** The grouping key behind Libraries Declaration Rate and Largest Libraries, because library names can change | Exists | `4 Records` row 67 (S/N 12). Live `Records.ListId` | EDRMS database, then Microsoft Graph for the rest |
| 16 | ItemId | **None on its own.** With ListId it identifies the row, which is what stops a document declared twice being counted twice | Exists | `4 Records` row 68 (S/N 13). Live `Records.ItemId` | EDRMS database, then Microsoft Graph for the rest |
| 17 | ADBLibraryCategory | **None today.** The natural grouping for Department Performance when it is built | Planned | `4 Records` row 76 (S/N 21) `ADBMeta`, marked **Future Enhancement**. Also `Library` row 6 and `ADBMaster` rows 22 to 24, neither built. Live `Records.ADBMeta` is empty | **Available now without waiting for ADBMeta.** The Retention Label Mapping list in `app_edrms_data_uat` holds it as "Library Type" per library. Join on library and you have it today |
| 18 | SiteName | **Records Management:** level 3 of both drill downs, and the row label on Active Departmental Sites. **Sites and Libraries:** the "in site" sub label under each library | Exists | `4 Records` row 71 (S/N 16). Also `Site` row 14. Live `Records.SiteName` and `ADBSites.SiteName` | EDRMS database. `ADBSites` also carries it for every tracked site |
| 19 | SiteUrl | **None.** Joins this table to the Site Activity Table | Exists | `4 Records` row 70 (S/N 15). Also `Site` row 13. Live `Records.SiteUrl` and `ADBSites.SiteUrl` | EDRMS database and `ADBSites` |
| 20 | SiteCreatedDate | **None from this table.** A copy of the Site Activity value, so a document can be filtered by site age without a join | **Missing. Gap 3** | `Site` row 6 is `CreatedDate`, but that is when the **row** was created in EDRMS, not when the **SharePoint site** was created. Not in `ADBSites` | **SharePoint admin centre**, Active sites view, the "Created" column, exportable to CSV. **Microsoft Graph** `/sites` returns `createdDateTime` for a scripted version. **AvePoint Cloud Governance** holds the provisioning date if the site was provisioned through it |
| 21 | IsEdrmsCompliant | **Records Management:** decides which documents count toward Total Documents in EDRMS Compliant Sites, 3.47M. Defines the population of the entire table | **Missing. Gap 3** | No such column and no rule anywhere in the workbook or the database | **No system holds this. It is a definition, not a lookup.** RAC picks one of three: a maintained list of compliant site URLs, which is simplest and can start today in a SharePoint list beside the Retention Label Mapping list; a site template check, if compliant sites use a distinct template; or an **AvePoint Cloud Governance** flag, if compliant sites are provisioned through a specific request form |
| 22 | ADBDepartmentOwner | **Records Management:** level 1 of both drill downs, and the department filter on 4 panels. **Sites and Libraries:** the department filter and the treemap grouping. **Overview:** top 5 departments by declared records and top 5 by compliant sites | **Designed, empty. Gap 1** | `4 Records` row 76 (S/N 21) `ADBMeta` key `ADBDepartmentOwner`, marked **Future Enhancement**. Values in `ADBMaster` rows 13 to 15, never built. Live `Records.ADBMeta` is empty | **The vocabulary already exists**, populated in the **SharePoint term store** under Managed Metadata. What is missing is the link from a site to its department. Best source: **AvePoint Cloud Governance**, which records the requesting department when a site is provisioned. Fallback: RAC maintains a site to department list once, about 1,057 rows, in a SharePoint list. **Attach it to the site, not to each record**, and every document inherits it |
| 23 | IsDeclaredRecord | **Records Management:** Total Declared Records 21,646 and every bar under it, counted over distinct items rather than rows. **Sites and Libraries:** the declared half of Libraries Declaration Rate and the rate itself. **Format and Storage:** declared records by format. **Overview:** 3 of the 5 KPI cards, the physical counterpart donut, the library declared donut, the share of files donut. **Retention:** every figure | **NEW, but free** | Not a column today, because every row in `Records` already **is** a declared record | Derived at load: true where the document is present in `Records`, false where the scan found it but `Records` does not. Costs nothing beyond running the scan |
| 24 | CreatedDate | **Records Management:** the date range filter on Total Declared Records, and the in range subtotal line under it | Exists | `4 Records` row 59 (S/N 4), described as "When the User Declared the file as a Record". Live `Records.CreatedDate` | EDRMS database. Blank for undeclared documents, which is correct |
| 25 | CreatedBy | **None today.** Supports a declarations by user view | Exists | `4 Records` row 60 (S/N 5). Live `Records.CreatedBy` | EDRMS database |
| 26 | DeclarationType | **None today.** Separates Regular from Centralized declarations | Exists | `4 Records` row 82 (S/N 27) shows it as release 2026.2, but the deployed table has it as an `integer` today | EDRMS database, available now. Confirm the code to label mapping with the development team |
| 27 | HasPhysical | **Records Management:** the two colour split on every bar of Total Declared Records. **Overview:** the physical counterpart donut | Exists | `4 Records` row 77 (S/N 22) `EDRMSMeta` key `HasPhysical`. Live `Records.EDRMSMeta` | EDRMS database. Undeclared documents are neither, so leave it blank rather than false |
| 28 | PhysicalCounterpartRetention | **None today** | Exists, outside the database | Not in the workbook | **Retention Label Mapping list** in `app_edrms_data_uat`, column "Physical Counterpart". Maintained per library, so join on library |
| 29 | EDRMSRetentionLabel | **Retention**, not yet built | Exists | `4 Records` row 78 (S/N 23). Live `Records.EDRMSRetentionLabel` | EDRMS database. Also per library in the Retention Label Mapping list |
| 29 | EDRMSDuration | Feeds EDRMSDueDateForDisposal | Exists | `4 Records` row 80 (S/N 25). Live `Records.EDRMSDuration` | EDRMS database. Also "Retention Duration" per library in the mapping list |
| 30 | EDRMSRetentionLabelApplied | Feeds EDRMSDueDateForDisposal. **Deliberately not used to date declarations** | Exists | `4 Records` row 79 (S/N 24), described as the basis for the duration computation. Live `Records.EDRMSRetentionLabelApplied` | EDRMS database |
| 32 | EDRMSDueDateForDisposal | **Retention**, not yet built: records due for disposal | Exists | `4 Records` row 81 (S/N 26), defined as RetentionLabelApplied plus Duration. Live `Records.EDRMSDueDateForDisposal` | EDRMS database, already computed |
| 33 | RetentionStatus | **Retention**, not yet built: the status breakdown | Exists | `4 Records` row 77 (S/N 22) `EDRMSMeta` key `RetentionStatus`. Permitted values in `5 EDRMSMasters` rows 16 to 18. Live `Records.EDRMSMeta` | EDRMS database, with the value list from `EDRMSMasters` |
| 34 | SensitivityLabelName | **None on any dashboard** | Exists | `4 Records` row 75 (S/N 20) `FileMeta` key `SensitivityLabelName`. Live `Records.FileMeta` | EDRMS database, then Microsoft Graph for the rest |
| 35 | IsDeleted | **Every count on every dashboard** excludes rows where this is true | Exists | `4 Records` row 65 (S/N 10). Live `Records.IsDeleted` | EDRMS database. For undeclared documents, absence from the next scan is the delete signal |
| 36 | RowLoadedDate | **None.** Operational, so a partial refresh can be spotted | **NEW** | Not in the workbook | Written by the refresh job |

### Table 2: Site Activity Table

| # | Column | Which figure it produces | Status | Where it is today | How to source it |
| --- | --- | --- | --- | --- | --- |
| 1 | Id | **None.** Identifies the row | Exists | `Site` row 5 (S/N 1) | Generated by the refresh job |
| 2 | SnapshotDate | The "Data as of" line | **NEW** | Not in the workbook | Written by the refresh job |
| 3 | SiteUrl | **None.** Joins to the Utilization Report Table | Exists | `Site` row 13 (S/N 9). Live `ADBSites.SiteUrl` | `ADBSites`, or the SharePoint admin centre export |
| 4 | SiteName | **Records Management:** the row label on Active Departmental Sites and Active Users | Exists | `Site` row 14 (S/N 10). Live `ADBSites.SiteName` | `ADBSites`, or the SharePoint admin centre export |
| 5 | SiteCreatedDate | **Sites and Libraries:** the treemap of sites created by department, and the date range filter above it | **Missing. Gap 3** | `Site` row 6 `CreatedDate` is the row's creation, not the site's. Not in `ADBSites` | **SharePoint admin centre**, Active sites, the "Created" column, exportable to CSV. Or **Microsoft Graph** `/sites` `createdDateTime`. Or **AvePoint Cloud Governance** provisioning date |
| 6 | IsEdrmsCompliant | **Sites and Libraries:** Total EDRMS Compliant Sites Created, 1,057, and everything drawn from it | **Missing. Gap 3** | Nowhere | A RAC definition. See row 19 of Table 1 |
| 7 | ADBDepartmentOwner | **Sites and Libraries:** the treemap grouping and the department filter. **Overview:** top 5 departments by compliant sites | **Missing. Gap 1** | Nowhere. `ADBSites` has no department column | **AvePoint Cloud Governance** provisioning record first. Fallback: RAC maintains the site to department list once. **This is the single highest value item in the whole report**, because attaching it here fixes it for all 3.47 million documents at once |
| 8 | SiteVisits7 | **Records Management:** Active Departmental Sites, the 7 day window | **NEW** | Nowhere | **Microsoft 365 admin centre**, Reports, Usage, SharePoint site usage. Or the **Microsoft Graph reports API**, `getSharePointSiteUsageDetail(period='D7')` |
| 9 | SiteVisits30 | **Records Management:** Active Departmental Sites, the 30 day window, and the Active Sites KPI | **NEW** | Nowhere | Same report at `period='D30'` |
| 10 | SiteVisits90 | **Records Management:** Active Departmental Sites, the 90 day window. Site visits are available at 90 days even though unique viewers are not | **NEW** | Nowhere | Same report at `period='D90'` |
| 11 | UniqueViewers7 | **Records Management:** Active Users, the 7 day window | **NEW** | Nowhere | Same report, the "Visited Page Count" and unique viewer fields |
| 12 | UniqueViewers30 | **Records Management:** Active Users, the 30 day window, and the Active Users KPI | **NEW** | Nowhere | Same report at `period='D30'` |
| 13 | LibraryCount | **Sites and Libraries:** the Libraries column on the site inventory, and the "libraries across them" tile | **NEW** | Nowhere | **Microsoft Graph** `GET /sites/{id}/drives`, counted. Verified against the test tenant |
| 14 | LastActivityDate | **Sites and Libraries:** the Last activity column and the Active / Inactive split. **Records Management:** the "last activity" text beside each bar on Active Departmental Sites | **NEW** | Nowhere | Same Microsoft 365 usage report, "Last Activity Date" column |
| 15 | StorageUsed | **None today.** Sites and Libraries measures storage from FileSize instead | **NEW** | Nowhere | **SharePoint admin centre**, Active sites, the "Storage used" column. Note it includes version history, so it will not match the sum of FileSize |
| 16 | SiteOwner | **Sites and Libraries:** the Site owner column on the site inventory. Who to contact about a site that has gone quiet | **NEW** | Nowhere | **SharePoint admin centre**, Active sites, the "Primary admin" column |
| 17 | ProjectEndDate | **None today.** The obvious basis for a site closure view | Exists | `Site` row 15 (S/N 11). Live `ADBSites.ProjectEndDate` | `ADBSites`, already populated |
| 17 | IsDeleted | Excludes closed sites from current figures without changing historical ones | Exists | `Site` row 12 (S/N 8). Live `ADBSites.IsDeleted` | `ADBSites`, already populated. A site missing from the next admin centre export is the delete signal |
| 19 | RowLoadedDate | **None.** Operational | **NEW** | Not in the workbook | Written by the refresh job |

---

### Table 3: User Activity Table

| # | Column | Which figure it produces | Status | Where it is today | How to source it |
| --- | --- | --- | --- | --- | --- |
| 1 | Id | **None.** Identifies the row | **NEW** | Nowhere | Generated by the refresh job |
| 2 | SnapshotDate | The "Data as of" line | **NEW** | Nowhere | Written by the refresh job |
| 3 | UserPrincipalName | **Records Management:** Total EDRMS Users, counted distinct. The only column the headline figure needs | **NEW** | Nowhere | **Microsoft Graph** `getSharePointActivityUserDetail(period='D30')`, one row per person |
| 4 | DisplayName | **None.** Readability when the list is inspected | **NEW** | Nowhere | Same call |
| 5 | LastActivityDate | Filters the count to a 7 or 30 day window | **NEW** | Nowhere | Same call |
| 6 | ViewedOrEditedFileCount | **None today.** Separates heavy users from one time visitors, and the obvious basis for an adoption view | **NEW** | Nowhere | Same call |
| 7 | RowLoadedDate | **None.** Operational | **NEW** | Nowhere | Written by the refresh job |


### Table 4: File Plan Table

| # | Column | Which figure it produces | Status | Where it is today | How to source it |
| --- | --- | --- | --- | --- | --- |
| 1 | Id | **None.** Identifies the row | **NEW** | Nowhere | Generated by the refresh job |
| 2 | SnapshotDate | The "Data as of" line | **NEW** | Nowhere | Written by the refresh job |
| 3 | TermId | **None.** Keeps a count stable when a term is renamed | **NEW** | Nowhere | **Microsoft Graph** term store |
| 4 | TermName | **None on a chart.** Readability when the plan is inspected | **NEW** | Nowhere | Same source |
| 5 | TermSetName | **File Plan:** the "N term sets" line under each category | **NEW** | Nowhere | Same source |
| 6 | CategoryName | **File Plan:** the five category bars and their shares | **NEW** | Nowhere | Same source, `GET /termStore/groups` |
| 7 | Depth | **File Plan:** the "N levels deep" line, and the deepest branch note | **NEW** | Nowhere | Derived while walking the tree, at no extra cost |
| 8 | RowLoadedDate | **None.** Operational | **NEW** | Nowhere | Written by the refresh job |


## WHERE EVERY FIGURE COMES FROM

The same information read from the other direction: every number in the
prototype, and how it is produced. If a figure is not on this list, it has no
source.

| Dashboard | Figure | Table | How the number is produced | Ready? |
| --- | --- | --- | --- | --- |
| Records Management | Total Declared Records, 21,646 | Utilization Report Table | Count the distinct ListId plus ItemId pairs where IsDeclaredRecord is true and IsDeleted is false | Ready today |
| Records Management | Declared records by department | Utilization Report Table | The same count, grouped by ADBDepartmentOwner | Blocked, Gap 1 |
| Records Management | The two colour split on each bar | Utilization Report Table | The same count, split by HasPhysical | Ready today |
| Records Management | Drill: department, site, library | Utilization Report Table | The same count, regrouped by SiteName, then LibraryName. Level 1 needs ADBDepartmentOwner; levels 2 and 3 are ready today | Level 1 blocked, Gap 1 |
| Records Management | Date range on declared records | Utilization Report Table | Keep only rows where CreatedDate falls in the range | Ready today |
| Records Management | Total Documents in compliant sites, 3.47M | Utilization Report Table | Count all the rows where IsEdrmsCompliant is true | Needs the scan |
| Records Management | Date range on total documents | Utilization Report Table | Keep only rows where FileCreatedDate falls in the range | Needs the scan |
| Records Management | Active Departmental Sites | Site Activity Table | Rank sites by SiteVisits7, SiteVisits30 or SiteVisits90 | Needs the usage feed |
| Records Management | Last activity beside each site | Site Activity Table | Read LastActivityDate | Needs the usage feed |
| Records Management | Unique viewers per site | Site Activity Table | Rank sites by UniqueViewers7 or UniqueViewers30 | Needs the usage feed |
| Records Management | Total EDRMS Users, monthly active | **User Activity Table** | Count distinct UserPrincipalName in the latest snapshot. **Not** the sum of UniqueViewers30, which counts a person once per site | Needs the usage feed |
| Sites and Libraries | Total Compliant Sites Created, 1,057 | Site Activity Table | Count the rows where IsEdrmsCompliant is true | Blocked, Gap 3 |
| Sites and Libraries | Sites created by department treemap | Site Activity Table | The same count, grouped by ADBDepartmentOwner | Blocked, Gaps 1 and 3 |
| Sites and Libraries | Date range on the treemap | Site Activity Table | Keep only rows where SiteCreatedDate falls in the range | Blocked, Gap 3 |
| Sites and Libraries | Libraries Declaration Rate | Utilization Report Table | Per ListId, count all rows, count the rows where IsDeclaredRecord is true, and divide | Needs the scan |
| Sites and Libraries | Largest Libraries, 43.1 GB | Utilization Report Table | Per ListId, add up FileSize | Needs the scan, and Gap 2 |
| Sites and Libraries | Average file size | Utilization Report Table | Per ListId, total FileSize divided by the row count | Needs the scan, and Gap 2 |
| Sites and Libraries | Site owner | Site Activity Table | Read SiteOwner | Ready today |
| Sites and Libraries | Libraries per site | Site Activity Table | Read LibraryCount | Needs one Graph call |
| Sites and Libraries | Visits and users per site | Site Activity Table | Read SiteVisits30 and UniqueViewers30 | Needs the usage feed |
| Sites and Libraries | Active and Inactive sites | Site Activity Table | Inactive where LastActivityDate is more than 90 days old, active otherwise | Needs the usage feed |
| Sites and Libraries | Active Libraries, last 90 days | Utilization Report Table | Count distinct ListId where LibraryLastActivityDate is within 90 days | Needs one Graph call |
| Sites and Libraries | Inactive and Long dormant libraries | Utilization Report Table | The same count at the 90 and 180 day thresholds | Needs one Graph call |
| Sites and Libraries | Library Growth Rate | Utilization Report Table | Records declared during the period, divided by the records held at the start. Both come from CreatedDate, so **no snapshot history is needed** | Ready today |
| Sites and Libraries | New records this period, per library | Utilization Report Table | Count the declared rows per ListId where CreatedDate falls in the period | Ready today |
| Format and Storage | Storage Consumed by Format, 46.7 GB | Utilization Report Table | Per FormatGroup, add up FileSize | Blocked, Gap 2 |
| Format and Storage | Number of files by format | Utilization Report Table | Per FormatGroup, count the rows | Ready today |
| Format and Storage | Most Common Format, PDF | Utilization Report Table | The FormatGroup with the highest row count | Ready today |
| Format and Storage | Declared records by format | Utilization Report Table | Per FormatGroup, count the rows where IsDeclaredRecord is true | Ready today |
| Retention | Declared records by retention label | Utilization Report Table | Per EDRMSRetentionLabel, count the declared rows | Ready today |
| Retention | Records Due for Disposal, next 12 months | Utilization Report Table | Count the declared rows where EDRMSDueDateForDisposal falls in the next 12 months. Permanent labels have no due date and drop out on their own | Ready today |
| Retention | Next Due Date for Disposal | Utilization Report Table | The earliest EDRMSDueDateForDisposal still ahead of today | Ready today |
| Retention | Disposal summary per library | Utilization Report Table | The same two figures grouped by ListId, with LibraryName for the label | Ready today |
| Retention | Inactive over 1 year | Utilization Report Table | Count the rows where FileModifiedDate is more than a year old. **The one figure on the Retention dashboard that is not ready**, because an untouched document has no row until the scan creates one | Needs the scan |
| File Plan | Total Terms | **File Plan Table** | Count the rows in the latest snapshot | Needs the term store walk |
| File Plan | Term Sets | **File Plan Table** | Count distinct TermSetName | Needs the term store walk |
| File Plan | Terms by category | **File Plan Table** | Count the rows grouped by CategoryName | Needs the term store walk |
| File Plan | How deep the plan runs | **File Plan Table** | The maximum Depth, overall and per category | Needs the term store walk |
| Every dashboard | The "Data as of" line | All four tables | Read SnapshotDate | Ready today |

---

## WHERE TO GO FOR EACH SOURCE

Six systems supply everything. This is the practical answer to "where do I get
this".

| Source | What to open | What it gives you |
| --- | --- | --- |
| **EDRMS database** | `drm-npr`, schema `public`, table `Records` | 24 of the 37 columns, for the 21,646 declared records only |
| **Microsoft Graph, weekly scan** | A scheduled job walking every document library in every compliant site | The same columns for the other 3.45 million documents, plus `size` and `lastModifiedDateTime`. **This is the single biggest missing piece and it unlocks Total Documents, the declaration rate, and every storage figure** |
| **SharePoint admin centre** | Active sites view, exportable to CSV | Site created date, storage used, primary admin, last activity |
| **Microsoft 365 usage reports** | Admin centre, Reports, Usage, SharePoint site usage. Or the Graph reports API | Site visits and unique viewers at 7, 30 and 90 days |
| **AvePoint Cloud Governance** | The provisioning records for EDRMS sites | Department per site, and the provisioning date. **Check this before anyone starts mapping sites by hand** |
| **Retention Label Mapping list** | `app_edrms_data_uat`, the list you already maintain | Library Type, Retention Label, Retention Duration, Physical Counterpart, all per library |

Two things are not in any system and have to be **decided** rather than found:
`IsEdrmsCompliant`, which is a RAC definition, and the extension to format group
mapping behind `FormatGroup`, which is a short list RAC signs off once.

---

## THE THREE GAPS

### Gap 1. Nothing records which department owns a site

The only remaining data gap that needs a person rather than code.

`ADBDepartmentOwner` exists as a SharePoint column and is **empty on every row**,
which is why `ADBMeta` is empty. The vocabulary exists and is populated in the
**SharePoint term store**, but a vocabulary is a list of valid answers, not the
answer. The missing link is site to department.

Attach it to the **site**, in the Site Activity Table, and let every document
inherit it through `SiteUrl`, which every row already carries. That is about
1,057 values instead of 3.47 million, and it works for existing documents as
well as new ones with no migration. Confirmed feasible by the development team
on 10 August 2026.

**AvePoint Cloud Governance** may already hold it from provisioning, which turns
this from a data entry exercise into an export. Check that first.

The one thing to confirm with RAC: is it acceptable that every document in a
CWRD site counts as CWRD? The drill down assumes yes.

### Gap 2. File size is not captured

Blocks the 46.7 GB headline, storage by format, average file size and Largest
Libraries.

The smallest of the three, and it has two independent routes.
**Microsoft Graph returns `size` on every item**, so the weekly scan solves the
library and format figures on its own. Adding a `FileSize` key to the existing
`FileMeta` JSON solves per record storage and is a JSON key, not a migration.

### Gap 3. There is no site created date, and no rule for what counts as compliant

Blocks the 1,057 compliant sites, the treemap, and the treemap's date range.

The created date is a straight read from the **SharePoint admin centre**. The
compliance rule is a decision RAC has to make: a maintained list, a template
check, or an AvePoint provisioning flag. Until it exists, "EDRMS compliant"
appears in two dashboard titles with nothing behind it.

---

## DECISIONS NEEDED

| # | Question | Who decides | Why it matters |
| --- | --- | --- | --- |
| 1 | What makes a site EDRMS compliant? | RAC | Three figures cannot be produced without it, and the phrase appears in two dashboard titles |
| 2 | Does AvePoint Cloud Governance hold the department for each site? | IT | Decides whether Gap 1 is an export or a manual mapping of about 1,057 sites |
| 3 | Which extensions map to which of the eight format groups? | RAC | A short list, signed off once. Without it `FormatGroup` has no rule |
| 4 | How often should the report refresh? | RAC | Assumed weekly. The document scan is the part that sets the cost |
| 5 | Is the 90 day Active Users fallback acceptable? | RAC | Microsoft does not return unique viewers at 90 days. The report shows site visits instead, with a note |
| 6 | Does a document declared twice count once or twice? | RAC | UAT shows 1,990 rows against 1,984 distinct DocumentId. The report counts distinct items, so once. Worth signing off so two reports cannot use two rules |

---

## WHAT WAS DELIBERATELY LEFT OUT

- **`PhysicalRecordJustification`**, `4 Records` row 77, second key in
  `EDRMSMeta`. Free to add and the natural companion to `HasPhysical`. Left out
  only because no dashboard shows it.
- **`JobTriggerId`**, `4 Records` row 57, and the whole `TrackingRecords` table,
  which already records every declaration attempt including failures and their
  reasons. That supports a declaration success rate dashboard, which does not
  exist in the prototype. It would be a third table when it does.
- **A separate department reference table.** Department sits directly on both
  tables instead. A department with no sites and no documents will not appear in
  a filter list, which is a fair trade for removing a join.
- **Division, unit, field office, and the sovereign or nonsovereign split.**
  All four are attributes nothing in the tenant supplies. Division and unit were
  designed in `ADBMeta` and are empty on every row; field office and the project
  split have no column anywhere. Each would need its own column on a list RAC has
  not yet been asked for, so none is carried as a placeholder. If they are wanted
  later they are extra columns on the same site mapping, not new mechanisms.
- **Users per library.** SharePoint reports viewers per **site**. There is no
  list level equivalent in any usage report, so a per library user count has no
  source and is not designed in.
- **The site go live date.** The EDRMS app carries a per site install date, but
  whether it survives a version upgrade is unproven, so no column depends on it
  yet.
- **Keeping every weekly snapshot.** Each refresh replaces the last. No
  dashboard in the prototype shows a trend over time.
