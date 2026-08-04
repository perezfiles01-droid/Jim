# UTILIZATION REPORT DATABASE DESIGN

Tables required for the EDRMS Utilization Report, documented in the same format
as `Database_Design_12.03`. Everything the Reporting Suite displays is sourced
from these seven tables.

Proposed location: a separate schema `rpt` inside the existing `drm-npr`
PostgreSQL database. Not new tables in `public`, and not new columns on the
existing tables, because those are owned by `ADBWebServiceMI1` and managed by
Entity Framework migrations, so a hand added column can be dropped by the next
release. A separate schema is never touched by those migrations, and lets Power
BI be granted read access to reporting data without read access to live
declaration data.

---

## TABLE SUMMARY

| # | Table | Grain, one row per | Serves |
| --- | --- | --- | --- |
| 1 | `rpt_org_unit` | department, division or unit | All department and division filters and drill downs |
| 2 | `rpt_site` | SharePoint site | Sites created, treemap, compliant site count |
| 3 | `rpt_record` | declared record | Records Management, Retention, records by format |
| 4 | `rpt_library_snapshot` | snapshot date, library, file format | Total documents, declaration rate, all storage figures |
| 5 | `rpt_site_usage` | snapshot date, site | Active sites, active users, 7 / 30 / 90 day windows |
| 6 | `rpt_declaration_attempt` | declaration attempt | Declaration success rate, failure reasons |
| 7 | `rpt_refresh_log` | source system, per run | The "Data as of" line on every dashboard |

### Why seven, and why denormalized

Two grains are unavoidable. Declared records are held one row per record because
there are only about 21,646 of them and the report drills into individual
retention and physical counterpart detail. Everything else is held as periodic
aggregates, because 3.47 million documents at row grain would be expensive to
refresh weekly and no figure on any dashboard needs that detail.

Department, site and library names are repeated inside the fact tables rather
than held only in lookups. That is deliberate. It means Power BI can read a
single table for most figures without joins, and it keeps the load simple for
whoever maintains it. `rpt_org_unit` exists for the hierarchy itself, which is
needed for the drill down from department to division to unit.

### Legend for the Source column

| Marker | Meaning |
| --- | --- |
| `Records.X` | Column on the existing `public."Records"` table, available today |
| `Records.FileMeta.X` | Key inside the existing `FileMeta` jsonb column |
| `Records.EDRMSMeta.X` | Key inside the existing `EDRMSMeta` jsonb column |
| `Records.ADBMeta.X` | Key inside `ADBMeta`, **currently empty, out of scope for 2026.1** |
| `SPO Scan` | New weekly inventory scan of SharePoint via Microsoft Graph |
| `M365 Usage` | Microsoft 365 usage reports |
| `Admin Centre` | SharePoint admin centre, Active sites export |
| `Term Store` | SharePoint managed metadata term store |
| `Derived` | Computed during load from other columns |
| **`GAP`** | Not available today, see the Gaps section |

---

## 1. rpt_org_unit

Stores the ADB organisational hierarchy as a single self referencing table.
Departments, divisions and units in one place, so the drill down works at every
level without three separate tables.

| S/N | Column Title | Field Type | Description | Field Values / Choices | Sample | Source | Remarks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | OrgUnitKey | bigint | Primary Key | | 1 | Generated in this table | |
| 2 | TermId | uuid | Managed metadata term ID | | dfea6dd0-4ac3-... | Term Store | Join key back to SharePoint |
| 3 | OrgLevel | integer | Level in the hierarchy | 1 Department, 2 Division, 3 Unit | 1 | Derived | |
| 4 | OrgCode | text | Short code | | CWRD | Term Store | Unique within its parent |
| 5 | OrgName | text | Full name | | Central and West Asia Regional Department | Term Store | |
| 6 | ParentTermId | uuid | Term ID of the parent | | (null for departments) | Term Store | **GAP** in ADBMaster today, see Gaps |
| 7 | ParentCode | text | Code of the parent | | CWRD | Derived | Denormalized for convenience |
| 8 | OrgUnitType | text | Nature of the unit | Division, Resident Mission, Office | Resident Mission | Term Store | Regional departments mix both |
| 9 | IsActive | boolean | Still in the current org structure | true, false | true | Term Store | Keep false rows so history survives reorganisation |
| 10 | RowLoadedDate | timestamptz | When this row was last refreshed | | 2026-08-04 06:00:00+00 | Derived | |

---

## 2. rpt_site

One row per SharePoint site. This is the table that makes "sites created by
department" possible, and it is the thinnest area of the current design.

| S/N | Column Title | Field Type | Description | Field Values / Choices | Sample | Source | Remarks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | SiteKey | bigint | Primary Key | | 1 | Generated in this table | |
| 2 | SiteUrl | text | Full site URL, natural key | | https://asiandevbank.sharepoint.com/sites/org_csd_edrmssanitytest | Records.SiteUrl, Admin Centre | Unique |
| 3 | SiteName | text | Display name | | org_csd_edrmssanitytest | Records.SiteName | |
| 4 | SiteCreatedDate | date | Date the site itself was created | | 2025-11-20 | Admin Centre, or AvePoint | **GAP** Drives the sites created figures |
| 5 | IsEdrmsCompliant | boolean | Whether this is an EDRMS compliant site | true, false | true | **GAP** To be decided | Denominator of most of the report |
| 6 | ComplianceSource | text | How compliance was determined | Naming convention, EDRMS Site Type term, AvePoint flag, Manual | AvePoint flag | Derived | Records the basis so it can be audited |
| 7 | DepartmentCode | text | Owning department | | CWRD | **GAP** Site to department mapping | The single largest blocker |
| 8 | DepartmentName | text | Owning department, full name | | Central and West Asia Regional Department | Term Store | |
| 9 | DivisionCode | text | Owning division, where a site belongs to one | | AFRM | **GAP** Mapping | Often null, sites frequently span divisions |
| 10 | SiteTemplate | text | SharePoint template | | STS#3, GROUP#0 | Admin Centre | Useful for excluding non document sites |
| 11 | StorageBytes | bigint | Storage consumed at site level | | 1288490188 | M365, Admin Centre | Includes version history and recycle bin, see Remarks in Gaps |
| 12 | StorageQuotaBytes | bigint | Allocated quota | | 26843545600 | Admin Centre | |
| 13 | LastActivityDate | date | Most recent activity | | 2026-08-01 | M365 Usage | |
| 14 | ProjectEndDate | date | Project end date where applicable | | 2027-06-30 | ADBSites | Already exists in the current design |
| 15 | PrimaryAdminUpn | text | Primary site administrator | | jperez2.contractor@adb.org | Admin Centre | Useful for follow up targeting |
| 16 | IsActive | boolean | Site still exists | true, false | true | Admin Centre | Deleted sites kept so history survives |
| 17 | RowLoadedDate | timestamptz | When this row was last refreshed | | 2026-08-04 06:00:00+00 | Derived | |

---

## 3. rpt_record

One row per declared record. The main table behind Records Management, the
Retention dashboard, and declared records by format. Sourced almost entirely
from the existing `public."Records"` table.

| S/N | Column Title | Field Type | Description | Field Values / Choices | Sample | Source | Remarks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | RecordKey | bigint | Primary Key | | 1 | Generated in this table | |
| 2 | SourceRecordId | uuid | Id of the source row | | b8354f5c-2ad0-4416-... | Records.Id | Unique, used for incremental upsert |
| 3 | DocumentId | text | SharePoint Document ID | | 1000-520103266-203 | Records.DocumentId | |
| 4 | ItemId | integer | SharePoint item ID | | 203 | Records.ItemId | |
| 5 | ListId | uuid | SharePoint library ID | | a869c724-ac4f-4144-... | Records.ListId | The only safe library key, names repeat |
| 6 | Title | text | Filename | | Document1226.docx | Records.Title | |
| 7 | **DeclaredDate** | timestamptz | **When the file was declared as a record** | | 2025-12-26 18:22:21+00 | Records.CreatedDate | Documented as the declaration moment. Drives every date filter |
| 8 | DeclaredDateOnly | date | Date part, for grouping | | 2025-12-26 | Derived | Indexed, avoids casting in every query |
| 9 | DeclaredByUpn | text | Who declared it | | qlu1.contractor@adb.org | Records.CreatedBy | Populated today, confirmed in R1.2 data |
| 10 | DeclaredByName | text | Declarer display name | | Quennie Lu | Graph lookup | Optional, improves readability |
| 11 | DeclarationType | integer | Regular or centralized | 0 Regular, 1 Centralized | 0 | Records.DeclarationType | |
| 12 | JobTriggerId | text | Batch this declaration belonged to | | 2026-CEN000001 | Records.JobTriggerId | Null for single declarations |
| 13 | SiteUrl | text | Site the record lives in | | https://asiandevbank.sharepoint.com/sites/... | Records.SiteUrl | Denormalized, joins to rpt_site |
| 14 | SiteName | text | Site display name | | org_edrms_uat_admin | Records.SiteName | |
| 15 | LibraryName | text | Library the record lives in | | Annual Meetings | Records.LibraryName | Always displayed with SiteName |
| 16 | LibraryUrl | text | Library URL | | /sites/.../AnnualMeetings | Records.LibraryUrl | |
| 17 | FolderPath | text | Folder path inside the library | | AnnualMeet | Records.FolderPath | |
| 18 | DepartmentCode | text | Owning department | | CWRD | Records.ADBMeta.ADBDepartmentOwner | **GAP** Empty today, out of scope for 2026.1 |
| 19 | DepartmentName | text | Owning department, full name | | Central and West Asia Regional Department | Term Store | |
| 20 | DivisionCode | text | Owning division | | AFRM | Records.ADBMeta.ADBDivisionOwner | **GAP** Empty today |
| 21 | DivisionName | text | Owning division, full name | | Afghanistan Resident Mission | Term Store | |
| 22 | UnitCode | text | Owning unit | | AFRM-PA | Records.ADBMeta.ADBUnitOwner | **GAP** Empty today |
| 23 | UnitName | text | Owning unit, full name | | Portfolio Administration | Term Store | |
| 24 | LibraryCategory | text | Library category | | Project Records | Records.ADBMeta.ADBLibraryCategory | **GAP** Empty today |
| 25 | FileExtension | text | File extension, lowercase | | docx | Records.FileMeta.FileType | Marked "need to retrieve" in the R1.2 mapping |
| 26 | FormatGroup | text | Display grouping used by the report | PDF, Word, Excel, PowerPoint, Email, Image files, Video files, All other formats | Word | Derived | Groups the tail so charts stay readable |
| 27 | **FileSizeBytes** | bigint | Size of the file in bytes | | 51224 | Records.FileMeta.FileSizeBytes | **GAP** Not captured today, see Gaps |
| 28 | FileCreatedDate | timestamptz | When the file itself was created | | 2025-11-14 09:22:10+00 | Records.FileMeta.FileCreatedDate | Different from DeclaredDate |
| 29 | SensitivityLabelName | text | Sensitivity label | | Internal | Records.FileMeta.SensitivityLabelName | |
| 30 | SensitivityLabelId | uuid | Sensitivity label ID | | 817d4574-7375-4d17-... | Records.FileMeta.SensitivityLabelID | |
| 31 | HasPhysicalCounterpart | boolean | Whether a physical counterpart exists | true, false | true | Records.EDRMSMeta.HasPhysical | Drives the with and without physical split |
| 32 | PhysicalRecordJustification | text | Why a physical copy is held | | The physical record is required for legal or regulatory purposes by ADB | Records.EDRMSMeta.PhysicalRecordJustification | Only where HasPhysicalCounterpart is true |
| 33 | RetentionLabel | text | Retention label applied | | 10 years after declaration | Records.EDRMSRetentionLabel | |
| 34 | RetentionLabelApplied | timestamptz | When the label was applied | | 2025-12-26 18:22:09+00 | Records.EDRMSRetentionLabelApplied | Not the declaration date, see Gaps |
| 35 | RetentionDurationYears | smallint | Retention period in years | | 10 | Records.EDRMSDuration | Parsed to a number during load |
| 36 | DueDateForDisposal | date | Computed disposal due date | | 2035-12-26 | Records.EDRMSDueDateForDisposal | |
| 37 | RetentionStatus | text | Retention classification | Long Term, Short Term, Permanent | Long Term | Records.EDRMSMeta.RetentionStatus | |
| 38 | DisposalStatus | text | Where the record sits in disposal | Not Due, Due, Disposed, On Hold | Not Due | Derived | For the Retention dashboard, not yet built |
| 39 | IsDeleted | boolean | Soft delete flag | true, false | false | Records.IsDeleted | Keep deleted rows so trends do not change retrospectively |
| 40 | DeletedDate | timestamptz | When soft deleted | | (null) | Records.DeletedDate | |
| 41 | RowLoadedDate | timestamptz | When this row was last refreshed | | 2026-08-04 06:00:00+00 | Derived | |

---

## 4. rpt_library_snapshot

**The most important new table.** One row per snapshot date, per library, per
file format. This is the only source of information about documents that were
never declared, which is what the entire declaration rate and every storage
figure depend on.

The declaration database cannot supply any of this, because an undeclared
document produces no row anywhere in it.

| S/N | Column Title | Field Type | Description | Field Values / Choices | Sample | Source | Remarks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | SnapshotDate | date | Date the scan ran | | 2026-08-02 | SPO Scan | Part of the primary key |
| 2 | ListId | uuid | SharePoint library ID | | a869c724-ac4f-4144-... | SPO Scan | Part of the primary key |
| 3 | FileExtension | text | File extension, lowercase | | pdf | SPO Scan | Part of the primary key |
| 4 | FormatGroup | text | Display grouping | PDF, Word, Excel, PowerPoint, Email, Image files, Video files, All other formats | PDF | Derived | Same grouping as rpt_record |
| 5 | SiteUrl | text | Parent site | | https://asiandevbank.sharepoint.com/sites/... | SPO Scan | Denormalized |
| 6 | SiteName | text | Parent site name | | org_edrms_uat_admin | SPO Scan | Libraries are never shown without their site |
| 7 | LibraryName | text | Library name | | Annual Meetings | SPO Scan | |
| 8 | LibraryUrl | text | Library URL | | /sites/.../AnnualMeetings | SPO Scan | |
| 9 | DepartmentCode | text | Owning department | | CWRD | rpt_site, or SPO Scan | Denormalized so no join is needed |
| 10 | DepartmentName | text | Owning department, full name | | Central and West Asia Regional Department | Term Store | |
| 11 | DocumentCount | integer | Documents of this format in this library | | 8200 | SPO Scan | **The denominator** |
| 12 | DeclaredCount | integer | How many of them are declared records | | 640 | SPO Scan | Read from the item record flag |
| 13 | StorageBytes | bigint | Total bytes for this format in this library | | 10307921510 | SPO Scan | Graph returns size on every item |
| 14 | IsEdrmsCompliant | boolean | Whether the parent site is compliant | true, false | true | rpt_site | Denormalized for filtering |
| 15 | RowLoadedDate | timestamptz | When this row was written | | 2026-08-02 03:14:00+00 | Derived | |

**Volume.** Roughly 1,057 sites, a few libraries each, and the handful of
formats actually present in each, gives around 25,000 rows per snapshot. Keep
weekly snapshots for thirteen weeks and month end snapshots thereafter, and the
table stays under a few hundred thousand rows indefinitely while preserving
every trend the report needs.

---

## 5. rpt_site_usage

One row per snapshot date, per site. Usage figures come from Microsoft 365
rather than from the declaration database.

| S/N | Column Title | Field Type | Description | Field Values / Choices | Sample | Source | Remarks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | SnapshotDate | date | Date the usage report was pulled | | 2026-08-02 | M365 Usage | Part of the primary key |
| 2 | SiteUrl | text | Site | | https://asiandevbank.sharepoint.com/sites/... | M365 Usage | Part of the primary key |
| 3 | SiteName | text | Site display name | | org_edrms_uat_admin | M365 Usage | Denormalized |
| 4 | DepartmentCode | text | Owning department | | CWRD | rpt_site | Denormalized for the department filter |
| 5 | SiteVisits7 | integer | Site visits, last 7 days | | 412 | M365 Usage | |
| 6 | SiteVisits30 | integer | Site visits, last 30 days | | 1866 | M365 Usage | |
| 7 | SiteVisits90 | integer | Site visits, last 90 days | | 5203 | M365 Usage | |
| 8 | UniqueViewers7 | integer | Unique viewers, last 7 days | | 96 | M365 Usage | |
| 9 | UniqueViewers30 | integer | Unique viewers, last 30 days | | 241 | M365 Usage | |
| 10 | UniqueViewers90 | integer | Unique viewers, last 90 days | | (null) | Not available | **Microsoft 365 does not return this.** The dashboard already falls back to site visits at 90 days and says so |
| 11 | LastActivityDate | date | Most recent activity on the site | | 2026-08-01 | M365 Usage | |
| 12 | RowLoadedDate | timestamptz | When this row was written | | 2026-08-02 03:20:00+00 | Derived | |

---

## 6. rpt_declaration_attempt

One row per declaration attempt, successful or not. Sourced from the existing
`TrackingRecords` table, which already holds this and which no dashboard
currently uses.

| S/N | Column Title | Field Type | Description | Field Values / Choices | Sample | Source | Remarks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | AttemptKey | bigint | Primary Key | | 1 | Generated in this table | |
| 2 | SourceTrackingId | uuid | Id of the source row | | f351ff66-6667-4fed-... | TrackingRecords.Id | Unique, used for incremental upsert |
| 3 | AttemptedDate | timestamptz | When the attempt was made | | 2025-11-20 15:13:26+00 | TrackingRecords.CreatedDate | |
| 4 | AttemptedDateOnly | date | Date part, for grouping | | 2025-11-20 | Derived | |
| 5 | AttemptedByUpn | text | Who attempted the declaration | | willieco.contractor@adb.org | TrackingRecords.CreatedBy | |
| 6 | JobTriggerId | text | Batch, where applicable | | 2026-MUL000351 | TrackingRecords.JobTriggerId | |
| 7 | DeclarationType | integer | Type of declaration | 0 Regular, 1 Centralized | 1 | TrackingRecords.DeclarationType | |
| 8 | RecordType | integer | What was submitted | 0 Folder, 1 File, 2 Others | 1 | TrackingRecords.RecordType | Folders are always skipped |
| 9 | Result | integer | Outcome | 0 Successful, 1 Skipped, 2 Failed | 0 | TrackingRecords.Result | |
| 10 | ResultName | text | Outcome in words | Successful, Skipped, Failed | Successful | Derived | For readability on the dashboard |
| 11 | ErrorType | text | Category of the failure | No Sensitivity Label, Folder Declaration, Duplicate Declaration, General System Error, No Retention Label Mapping | No Sensitivity Label | TrackingRecords.ErrorType | **The most actionable adoption metric available** |
| 12 | ErrorLog | text | Detail of the failure | | File Still Open | TrackingRecords.ErrorLog | |
| 13 | SiteUrl | text | Where the attempt was made | | https://asiandevbank.sharepoint.com/sites/... | TrackingRecords.SiteUrl | |
| 14 | SiteName | text | Site display name | | org_edrms_uat_admin | TrackingRecords.SiteName | |
| 15 | LibraryName | text | Library | | Speeches and addresses | TrackingRecords.LibraryName | |
| 16 | DepartmentCode | text | Owning department | | CWRD | rpt_site | Denormalized |
| 17 | ResultingDocumentId | text | The record created, where successful | | 1000-2069952427-123 | TrackingRecords.DocumentId | Null where the attempt failed |
| 18 | RowLoadedDate | timestamptz | When this row was last refreshed | | 2026-08-04 06:00:00+00 | Derived | |

---

## 7. rpt_refresh_log

One row per source system per run. This is what the "Data as of" line on every
dashboard reads from.

| S/N | Column Title | Field Type | Description | Field Values / Choices | Sample | Source | Remarks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | RefreshKey | bigint | Primary Key | | 1 | Generated in this table | |
| 2 | SourceSystem | text | Which feed ran | Declaration DB, SPO Scan, M365 Usage, Term Store, Admin Centre | SPO Scan | Derived | |
| 3 | DataAsOf | timestamptz | The point in time the data represents | | 2026-08-02 23:59:00+00 | Derived | What the dashboard prints |
| 4 | StartedAt | timestamptz | When the run began | | 2026-08-03 02:00:00+00 | Derived | |
| 5 | CompletedAt | timestamptz | When the run finished | | 2026-08-03 03:14:00+00 | Derived | |
| 6 | RowsLoaded | bigint | Rows written by the run | | 24817 | Derived | |
| 7 | Status | text | Outcome of the run | Running, Success, Failed | Success | Derived | |
| 8 | Message | text | Error or note | | | Derived | |

**The Overview dashboard quotes the oldest successful `DataAsOf` across all
sources, not the newest**, because a summary is only as current as its stalest
input. That behaviour already exists in the prototype and this table is what
makes it truthful.

---

## WHERE EVERY FIGURE COMES FROM

| Dashboard figure | Table | Columns used |
| --- | --- | --- |
| Total Declared Records | `rpt_record` | count where IsDeleted is false |
| Declared by department, with and without physical | `rpt_record` | DepartmentCode, HasPhysicalCounterpart |
| Drill to division, site, library | `rpt_record` | DivisionCode, SiteName, LibraryName |
| Date range on declarations | `rpt_record` | DeclaredDateOnly |
| Declarations by user | `rpt_record` | DeclaredByUpn, DeclaredByName |
| Total Documents in compliant sites | `rpt_library_snapshot` | DocumentCount where IsEdrmsCompliant |
| Declaration rate | `rpt_library_snapshot` | DeclaredCount over DocumentCount |
| Libraries declaration rate | `rpt_library_snapshot` | LibraryName, SiteName, DocumentCount, DeclaredCount |
| Largest libraries by storage | `rpt_library_snapshot` | LibraryName, SiteName, StorageBytes |
| Files by format | `rpt_library_snapshot` | FormatGroup, DocumentCount |
| Storage by format | `rpt_library_snapshot` | FormatGroup, StorageBytes |
| Average file size | `rpt_library_snapshot` | StorageBytes over DocumentCount |
| Declared records by format | `rpt_record` | FormatGroup |
| Compliant sites created | `rpt_site` | SiteCreatedDate where IsEdrmsCompliant |
| Sites created by department, treemap | `rpt_site` | DepartmentCode, SiteCreatedDate |
| Active sites, site visits | `rpt_site_usage` | SiteVisits7, SiteVisits30, SiteVisits90 |
| Active users, unique viewers | `rpt_site_usage` | UniqueViewers7, UniqueViewers30 |
| Retention dashboard, not yet built | `rpt_record` | RetentionStatus, DueDateForDisposal, DisposalStatus |
| Declaration success rate, not yet built | `rpt_declaration_attempt` | Result, ErrorType |
| Data as of, every dashboard | `rpt_refresh_log` | DataAsOf, Status |

Every figure the Reporting Suite currently displays appears in this table. If a
new figure is added and cannot be traced to a row here, it has no source.

---

## GAPS

Ranked by what they block. Each is marked **GAP** in the tables above.

### Critical

**1. ADBMeta is empty and out of scope for release 2026.1.**
`ADB Document Owner` is blank across all sample tracking data. This supplies
DepartmentCode, DivisionCode, UnitCode and LibraryCategory on `rpt_record`.
Without it, every department and division figure in the report is impossible:
the treemap, the top five departments, the four level drill down, and the
department filters on three dashboards. This is a release scoping decision
rather than a technical gap, and it is the single largest open item.

**2. File size is not captured anywhere.**
`FileMeta` holds FileType, FileCreatedDate and sensitivity, but not size, and
size cannot be recovered later for a document that has since changed. It is one
additional key inside an existing `jsonb` column, so no schema migration is
required. Needed for FileSizeBytes on `rpt_record`.

Worth noting: **this only blocks per record storage.** Microsoft Graph returns
file size on every item, so `rpt_library_snapshot.StorageBytes` can be populated
by the scan without this change. Storage by library and by format, which is most
of the Format and Storage dashboard, is therefore solvable now.

**3. There is no site created date, compliance flag, or site to department
mapping.**
The `ADBSites` table carries site URL, name and project end date. It has none of
the three columns that "sites created by department" needs. Site created date
comes from the admin centre export. The compliance rule and the department
mapping both need a decision, and AvePoint Cloud Governance may already hold the
department from when each site was provisioned.

### High

**4. ADBMaster has no parent term reference.**
The term store models divisions as children of departments, verified in the
tenant by expanding CWRD to AFRM, ARRM, AZRM, CWEC, CWOC and CWOD. The current
flat TermId, TermTitle, TermValue structure loses that, so the department to
division drill down cannot be derived. `rpt_org_unit.ParentTermId` fixes it.

**5. The Library table does not exist, and had no ListId when proposed.**
Library display names repeat across sites, so a name alone cannot identify a
library. `ListId` is already present on `Records` and should be the key
everywhere.

### Medium

**6. Nothing is time sliced except declarations.**
Declaration trends work because each record carries a date. Storage, document
counts and adoption cannot be trended at all without the snapshot tables.

**7. There is no refresh audit.**
The dashboards print a "Data as of" line and nothing records when each source
was last loaded.

**8. Storage figures will not reconcile, by design.**
Site storage from Microsoft 365 includes version history and the recycle bin, so
`rpt_site.StorageBytes` can be several times the sum of
`rpt_library_snapshot.StorageBytes`, which counts current files only. Both are
legitimate and they measure different things. The dashboard must state which one
it is showing, and the two should never appear on the same page unlabelled.

---

## DECISIONS NEEDED BEFORE BUILDING

| # | Decision | Owner | Blocks |
| --- | --- | --- | --- |
| 1 | Will ADBMeta be populated, and in which release | Project, vendor | Every department and division figure |
| 2 | What identifies an EDRMS compliant site | Records, ITD | The denominator of most of the report |
| 3 | Where the site to department mapping comes from | Records | Sites created by department |
| 4 | Can FileSizeBytes be added to FileMeta | Vendor | Per record storage only |
| 5 | Which identity runs the inventory scan | ITD | Search and Graph are security trimmed. An identity that cannot see every site returns quietly low numbers rather than an error |
| 6 | Which storage definition the report means | Records | Whether storage figures can be trusted |
| 7 | Do all retention labels mark items as records | Records | Whether declared counts are accurate |
| 8 | What happens to disposed records in historical trends | Records | Whether past figures change retrospectively |
| 9 | Index the columns the report filters on | ITD | SharePoint refuses to filter a non indexed column past 5,000 items, and these libraries are far past it |
