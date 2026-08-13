# CLIENT REQUIREMENTS, 13 AUGUST 2026: WHAT CHANGES

Read against two documents received from the client:

- `EDRMS_Dashboard_requirements_1.pptx`, 69 slides. Slides 1 to 12 are the
  client's annotated review of **our existing prototype**. Slides 13 to 69 are
  their own proposed design, screen by screen, with wireframe tables
- `R2026.4_Utilization_Report__Proposed_Metrics_6.docx`, a flat metric list

The two documents do not agree with each other. The deck is the design and the
Word list is a superset wish list containing several groups the deck never
draws (Security and Classification, Search Analytics, Risk Indicators). Where
they conflict, this note follows the deck, because the deck is the one with
layouts, click behaviour and the client's own review comments on our work.

This note is an assessment only. **No prototype code has been changed yet.**

**How to read the references.** Every requirement below cites where it came
from, so nothing here has to be taken on trust:

- `PPT s15` means slide 15 of `EDRMS_Dashboard_requirements_1.pptx`
- `DOC > Bankwide oversight` means that heading in
  `R2026.4_Utilization_Report__Proposed_Metrics_6.docx`. The Word file has no
  numbered sections, so it is cited by its heading path
- `STATUS s6` means section 6 of our own `STATUS.md`
- `T1 c27` means Table 1, column 27 of the database design, which is the same
  numbering used in `utilizationdb.md` and in the
  `EDRMS_Utilization_Report_Database_Design_v1.xlsx` workbook

---

## 0. THE HEADLINE

**The client has redesigned the report around six key views, not five, and the
five they name are not the five we built.** This is not a set of tweaks to the
existing dashboards. Nav, drill model and roughly half the panels change.

Both documents define this list: `PPT s13` names the six views, `PPT s14` gives
each one a question, an output and an action. The Word file mirrors them as its
top level headings.

| Their six key views | Where it is specified | Our five today | Status |
| --- | --- | --- | --- |
| Bank-wide Oversight | `PPT s13, s14, s15-s18, s34-s44`, `DOC > Bankwide oversight` | Overview, plus most of Records Management | Rebuild and merge |
| Department Insights | `PPT s13, s14, s19-s28, s53-s66`, `DOC > Department insight` | **Deleted on 10 August** | Rebuild from nothing, largest single piece of work |
| Project Insights, Sovereign and Nonsovereign | `PPT s13, s14, s36, s37, s38` | Does not exist | **New. No data source exists** |
| Institutional File Plan Insights | `PPT s13, s14, s29-s31, s47-s52`, `DOC > EDRMS Institutional File Plan insights` | A panel inside Retention | Promote to a dashboard, and it needs data we do not have |
| Retention and Disposal Insights | `PPT s13, s14, s32, s44-s46`, `DOC > Retention and Disposition Metrics` | Retention and File Plan | Closest match. Extend |
| Records and Archive Holdings | `PPT s13, s14, s33, s67-s69`, `DOC > Records and Archives Holdings` | Does not exist | **New. No data source exists** |
| (no equivalent) | | Sites and Libraries | Absorbed into Bank-wide and Department |
| (no equivalent) | `DOC > Format and Storage Analysis` only | Format and Storage | Kept in the Word list only, not in the deck. Demote to a panel |

Second headline: **the single most repeated column in the whole deck is
"Number of physical counterparts"**. It appears on 24 of the 57 design slides,
first at `PPT s15` and last at `PPT s66`. We hold `HasPhysical` at `T1 c27`, so
the *count* is answerable. The whole physical holdings world behind it, boxes,
folders, storage rooms, transfers and retrievals (`PPT s67-s69`), is not in any
system we have touched.

Third headline: **Division is back.** We removed the division tier on 10 August
because nothing populated it (`STATUS s7`, decision row "Division removed
entirely"). `PPT s41, s42, s54, s58` all ask for figures split by division.
That decision has to be reopened with them, or the requirement declined in
writing.

---

## 1. THEIR REVIEW OF WHAT WE ALREADY BUILT, SLIDES 4 TO 12

These are instructions to remove or move things. They are the cheapest changes
in the whole document and should be done first.

| Slide | What they said | What we do | Effort |
| --- | --- | --- | --- |
| 4 | Migration total is not a relevant top panel figure, and is a project concern rather than an ongoing one | Remove any migration framing from the Overview top panel | Small |
| 4 | Do not show one site total. Split it three ways: Department / RM / Office, Nonsovereign projects, Sovereign projects | Replace one KPI with three. **Blocked**, we cannot classify a site as sovereign or nonsovereign | Blocked |
| 5 | Total created sites should become an alphabetical table of departments with per department stats, sortable by documents, records or users | Replace the rollout treemap with a sortable department table | Medium |
| 5 | "Will there be EDRMS sites not created in Cloud Governance? What is the value of this?" | Answer the question. If every site comes through Cloud Governance the created-in-CG figure is noise and goes | Answer, then small |
| 6 | Comparison should be analytical, not obvious. Users vs documents vs records declared | Rebuild Compare as three named ratios (see section 2.3) | Medium |
| 6 | "Compare by library, how do you show hundreds of library options?" | Valid objection. Library comparison becomes a top N table, not a picker | Small |
| 7 | Site rollout is project only, will not be needed after go-live. **Remove it** | Delete the Compliant site rollout panel | Small, deletion |
| 8 | Active users per site should fold into the sites table, and also break down on the Department dashboard | Move it. Do not keep it as its own panel | Small |
| 9 | Records Management dashboard adds no insight. Its stats belong on the Overview | **Dissolve the Records Management dashboard** into Bank-wide Oversight | Medium |
| 10 | The declaration trend is genuinely useful, keep the date range. Wants it on the Overview, plus per department, office, RM and project. Asks what the default range is | Move the trend to Bank-wide. Add a department cut. **Answer the default range question**, propose current year | Medium |
| 11 | Migration dashboard not required at all | We have already removed it | Done |
| 12 | Content volume adds nothing except total size and storage growth. Amalgamate it | **Demote Format and Storage** to a panel on Bank-wide | Medium |

Net effect of slides 4 to 12 alone: **two of our five dashboards stop existing**
(Records Management, Format and Storage) and a third loses its main panel
(Sites and Libraries loses the rollout).

---

## 2. DASHBOARD 1: BANK-WIDE OVERSIGHT

Their slides 15 to 18 and 34 to 44. This replaces our Overview and absorbs
Records Management.

### 2.1 Top panel, slide 15 and 34

Eight KPI tiles, every one of them clickable through to a detail table.

| Tile | Asked at | In prototype? | In database design? | Verdict |
| --- | --- | --- | --- | --- |
| Active EDRMS sites, Department / RM / Office | `PPT s4, s15, s34, s35` | Partly, as one undivided site count | `T2 c6 IsEdrmsCompliant`, `T2 c14 LastActivityDate`, `T2 c7 ADBDepartmentOwner` | **Doable once the department list arrives.** Site type split needs a new site attribute |
| Active EDRMS sites, Nonsovereign projects | `PPT s4, s15, s34, s37` | No | No | **Blocked.** Nothing anywhere classifies a site as a project site. `STATUS s6`, "not designed in at all" |
| Active EDRMS sites, Sovereign projects | `PPT s4, s15, s34, s36` | No | No | **Blocked.** Same |
| Total EDRMS users | `PPT s15, s34, s39`, `DOC > Bankwide oversight` | Yes | `T3 c3 UserPrincipalName` | **Doable.** Note the tenant reality in `STATUS s5`: 30 licensed, 8 active |
| Total documents in EDRMS | `PPT s15, s34, s40`, `DOC > Bankwide oversight` | Yes | Table 1, all rows | **Doable in design, not yet in data.** `Records` holds declared only (`STATUS s1`), the undeclared denominator needs the weekly scan built |
| Total records declared | `PPT s15, s34, s41` | Yes | `T1 c23 IsDeclaredRecord` | **Doable today** |
| Total physical counterparts identified | `PPT s15, s34, s42` | No | `T1 c27 HasPhysical` | **Doable.** Column designed, never surfaced on a dashboard |
| Total records due for disposal | `PPT s34, s43` | Yes, on Retention | `T1 c32 EDRMSDueDateForDisposal` | **Doable.** Moves up to the top panel |

### 2.2 Overview of EDRMS sites, slides 16 and 35

An alphabetical table: Department / Office / RM, number of sites, documents,
records declared, physical counterparts. Then two summary rows for Nonsovereign
and Sovereign projects. **Every department name is a hyperlink into that
department's own dashboard.** Slide 35 adds indicators for sites created,
deleted, archived, and inactive over 90 days.

- Table itself: **not in the prototype**, we show a treemap. Doable
- Click through to a department dashboard: **not in the prototype**, and it is
  the single biggest build item in the deck
- Sites created: doable, `SiteCreatedDate` is confirmed from Graph
- Sites inactive over 90 days: doable, `LastActivityDate` is confirmed
- **Sites deleted**: partly. `IsDeleted` exists on the site table but nothing
  populates it from the tenant yet
- **Sites archived**: blocked. STATUS.md already records that archived has no
  definition. Ask them what archived means before anything is built

### 2.3 Comparison, slides 17 and 6

Three named comparisons, replacing our current compare panel:

1. Active users against number of documents
2. Active users against records declared
3. Documents against records declared, which is the declaration rate

All three are **doable**, and all three are per department, so all three wait on
the department list. The third is already on our Records Management dashboard.

### 2.4 Bank-wide declaration trend, slides 18 and 10

Already built and the client likes it. Changes: move it here, add a department,
office, RM and project cut, and set an explicit default range. **Doable**, except
the project cut.

### 2.5 The five drill-down tables behind the tiles, slides 39 to 43

This is where the requirement grows well past what we hold.

**Slide 39, users by department.** Wants users split into staff, contractors and
consultants, training completion, and onboarded since go-live. Plus percentage
active, never accessed, and not accessed in 90 days.

- Active, never accessed, 90 days idle: **doable**, Table 3 `LastActivityDate`
- Staff / contractor / consultant: **blocked.** No such attribute in the design
  or in the usage export. Their own slide 54 asks "Source: database of end
  users? Owned and maintained by?", so they do not know either
- Training completion, onboarded since go-live: **blocked.** This is an HR or
  LMS system, not SharePoint. It needs a maintained reference list

**Slide 40, documents by department.** Documents created or uploaded, users
creating documents, size in GB, month on month growth, average monthly storage
growth.

- Document count and size: **doable**, `FileCreatedDate` and `FileSize`, though
  `FileSize` is a new key that does not exist yet (Gap 2 in the design)
- Users creating documents: **blocked for undeclared documents.** We hold
  `CreatedBy` for declared records only. The scan would have to capture Author
- Month on month: **doable**, and this is exactly why we kept history on 12 August

**Slide 41, records declared by department.** Records declared, users declaring,
**and both of those per division**. Plus zero-declaration departments highlighted
and a declaration rate.

- By department: doable
- **By division: blocked by our own decision of 10 August.** Reopen or decline
- Zero declaration highlighting and declaration rate: doable

**Slide 42, physical counterparts by department.** Same shape, plus a "physical
counterpart completion rate", records turned over to RAC against records declared
with a physical counterpart.

- Count of records flagged with a physical counterpart: **doable**, `HasPhysical`
- **Turned over to RAC: blocked.** Nothing records a transfer. This is the RAC
  holdings system, see section 7

**Slide 43, records due for disposal by department.** Number due, next due date,
disposal approver, physical counterpart yes/no, and status Approved / Declined /
Extended. Plus disposed month on month, overdue list, pending approvals,
completion rate, and next quarter forecast.

- Number due, next due date, forecast, overdue: **doable**,
  `EDRMSDueDateForDisposal`
- **Disposal approver, the three statuses, records disposed, completion rate:
  blocked.** We removed `DisposalStatus` from the design on the grounds that it
  needs an application change. That judgement was right and this requirement is
  the proof that the application change is needed. **Escalate to the development
  team as a change request, not a reporting item**

### 2.6 Retention rollup on Bank-wide, slide 44

A Permanent versus Temporary retention split with departments provisioned,
libraries provisioned, records declared, physical counterparts, due for disposal
and disposed. Doable apart from **disposed**, and apart from **libraries
provisioned per retention term**, which needs the term to library link described
in section 5.

---

## 3. DASHBOARD 2: DEPARTMENT INSIGHTS

Their slides 19 to 28 and 53 to 66. Fourteen slides, the most detailed screen in
the deck, and **we deleted this dashboard on 10 August.** It comes back larger
than it was.

Every panel below is filtered to one department, reached by clicking a
department name on Bank-wide.

| Panel | Content | In prototype? | In DB design? | Verdict |
| --- | --- | --- | --- | --- |
| Top panel, slides 19 and 53 | Go-live date, sites, users, documents, records, physical counterparts, due for disposal. All clickable | No | Mostly yes | Doable except **Go-live date**, which is a reference list somebody maintains |
| Sites list, slides 20 and 55 | Site name, owners, documents, records, physical counterparts, due for disposal. Plus sites with no activity in 90 days, records declared month on month | Site inventory exists but is not per department | Yes, `SiteOwner` is confirmed against 1,899 of 1,918 sites | **Doable.** Note 19 sites have no owner at all |
| Users, slides 21 and 54 | Staff, contractors, consultants, training completion, onboarded since go-live, **by division**. Active user percentage, users who never accessed, new users | No | No | **Mostly blocked.** Only the activity figures are sourceable. See slide 39 above |
| Visitors, slides 22 and 56 | Total visitors, external, internal by department, access requests granted, access requests denied | No | `UniqueViewers7` and `UniqueViewersAllTime` only | **Mostly blocked.** Graph analytics gives a visitor count with no internal or external split. **Access requests are not in any reporting feed**, they are a SharePoint permission workflow. Their own slide asks "Is this data available in SharePoint / Cloud Governance?" The answer is no, not through the reporting APIs |
| Documents, slide 57 | Documents created and uploaded, users creating, size in GB, plus migrated documents and migrated size | No | Partly | Non-migration half doable. **Migration figures contradict their own slide 4 and 11**, where they said migration is not wanted. Query this with them |
| Record declaration, slides 23 and 58 | Records declared, users declaring, per division, with collapsible division rows, declared record size in GB, sites with no declaration in 90 days, declaration rate per site | Declaration figures exist but not per department | Yes at site level | **Doable except the division tier** |
| Physical counterpart, slides 42 and 59 | Same shape for physical records | No | `HasPhysical` only | Counts doable, RAC turnover blocked |
| Declaration trend, slide 24 | The trend we already built, scoped to one department | Yes, bank-wide only | Yes | **Doable** |
| Library usage, slides 25 and 61 to 66 | Library name, **number of users**, documents, records declared, physical counterparts. Six slides, one per file plan category | Library table exists without users | No | **Users per library is blocked.** STATUS.md already records this: SharePoint reports viewers per site, never per library. Everything else on these slides is doable. **The category grouping needs the term to library link, section 5** |
| Conventions, slides 26 and 53 | Link, date of approval, last updated, version number | No | No | **Doable but not a measurement.** A reference list somebody maintains, same conclusion we reached in STATUS.md section 6 |
| Disposal, slides 27 and 60 | Library, records due, next due date, approver, physical counterpart, three statuses, disposed count, disposed size | Pipeline exists bank-wide | Partly | Due dates doable, **approver and statuses blocked on the application change** |
| Programme dates, slides 28 and 53 | CSIS-IR audit, convention review, physical records review, refresher training, focals CoP schedule, each with a date and a status | No | No | **Doable but not a measurement.** A maintained reference list |

**Judgement on this dashboard:** roughly 60 percent of it is buildable from the
current design once the department list arrives. The remaining 40 percent is
three reference lists nobody has been named to maintain (go-live dates,
conventions, programme dates), one application change (disposal status), and two
genuine data limits (users per library, internal versus external visitors).

---

## 4. DASHBOARD 3: PROJECT INSIGHTS

Their slides 36, 37 and 38. **Entirely new, and entirely unsourced.**

Wanted: a Sovereign list and a Nonsovereign list, each keyed by project number
with the project name, showing sites, documents, records declared and physical
counterparts, each row clicking into a per project dashboard carrying facility
type, project number, modality, modality number, country or economy, project
status, effectivity date and actual closing date.

| Requirement | Asked at | Verdict |
| --- | --- | --- |
| Classify a site as a project site | `PPT s4, s13, s36, s37` | **Blocked.** Nothing in the term store, the usage export, Graph or `Records` distinguishes a project site from a departmental one |
| Sovereign versus Nonsovereign | `PPT s15, s16, s34, s36, s37`, `DOC > Bankwide oversight` | **Blocked.** Same. Already listed in `STATUS s6` as "no source anywhere" |
| Project number, name, modality, country, status, effectivity and closing dates | `PPT s38` header block, `PPT s36` and `PPT s37` table columns | **Blocked as reporting, solvable as an integration.** These are ADB operational data, they live in ADB's project systems, not in SharePoint. `T2 c17 ProjectEndDate` is the only project field the design holds |
| Per project metrics once a site is classified | `PPT s38` tile row | **Doable.** Every figure on `PPT s38` is a figure we can already produce. It is purely the classification that is missing |

**This is the cleanest single ask in the whole document and it hinges on one
thing:** a project site register mapping site URL to project number, plus a feed
of project attributes. If AvePoint Cloud Governance captures the project number
at site request time, this is one CSV and the whole dashboard unlocks. **Check
Cloud Governance before telling them it cannot be done.** That is the same
route already proposed for the department list.

---

## 5. DASHBOARD 4: INSTITUTIONAL FILE PLAN INSIGHTS

Their slides 29 to 31 and 47 to 52. Today this is one panel inside our Retention
dashboard. They want a dashboard with six screens.

Structure: five top level categories (Institutional Management, Administration,
People Management, Programs and Operations, Other), each with a screen listing
its top level terms, and for every term: departments provisioned, **libraries
provisioned**, documents, records declared, physical counterparts.

Plus, on every category screen, indicators for most used terms, least used and
unused terms as deletion candidates, new libraries created outside convention,
and requests for new libraries or terms.

| Requirement | Asked at | In prototype? | In DB design? | Verdict |
| --- | --- | --- | --- | --- |
| Term list by category | `PPT s29, s47`, `DOC > EDRMS Institutional File Plan insights` | A flat panel | `T4 c6 CategoryName`, `T4 c4 TermName`, `T4 c7 Depth` | **Designed, but the source does not exist.** `STATUS s6`, "The file plan: source unknown", is explicit: the five categories are in neither the term store nor Purview. The term store holds six dropdown value sets, 16 terms, one level deep. Purview holds 53 flat retention labels. **The institutional file plan is not in either system.** Until the client says where it lives, this whole dashboard is unbuildable |
| Documents, records, physical counterparts per term | `PPT s30, s31, s48-s52` | No | **No** | **Blocked by a missing join.** Table 4 has no key linking a term to a library or a document. Nothing in Table 1 carries a `TermId`. This is a **new column requirement**: either `TermId` on the document row, or a term to library mapping table |
| Libraries provisioned per term | `PPT s30, s31, s47-s52` | No | No | Same missing join |
| Departments provisioned per term | `PPT s47-s52` | No | No | Same missing join, plus the department list |
| Most used and unused terms | `PPT s48-s52`, the "Include indicators" note | No | Derivable once the join exists | Doable after the join |
| **New libraries created outside convention** | `PPT s48-s52`, same note | No | No | **Blocked on a definition.** Convention compliance means comparing a library name against an approved naming convention. Nobody has given us the convention |
| Requests for new libraries or terms | `PPT s48-s52`, same note | No | No | **Not a report.** This is a request workflow, most likely Cloud Governance |

**Judgement:** this dashboard has two blockers stacked on each other. Even if the
client tells us tomorrow where the file plan lives, the term to document join is
a design change and a scan change, not a report change. **Flag it early, it is
the longest lead time item in the document.**

---

## 6. DASHBOARD 5: RETENTION AND DISPOSAL INSIGHTS

Their slides 32 and 44 to 46. This is the closest match to something we already
have and needs the least surgery.

Structure: a Permanent retention screen and a Temporary retention screen, each
listing top level terms with departments provisioned, libraries provisioned,
documents, records declared, physical counterparts, retention label, records due
for disposal and records disposed. Temporary shows the label duration, 5, 10,
20 years.

| Requirement | Asked at | In prototype? | In DB design? | Verdict |
| --- | --- | --- | --- | --- |
| Permanent versus Temporary split | `PPT s32, s44, s45, s46` | Yes, the retention profile already excludes Permanent | `T1 c30 EDRMSDuration`, deliberately text so it holds Permanent | **Doable today** |
| Records due for disposal, 30 and 90 day windows | `PPT s32, s44, s46`, `DOC > Retention Dashboard` | Yes | `T1 c32 EDRMSDueDateForDisposal` | **Doable today** |
| Retention label breakdown with durations | `PPT s46`, the "5, 10, 20 years" row | Yes | `T1 c29 EDRMSRetentionLabel`, `T1 c30 EDRMSDuration` | **Doable today** |
| Records with and without a retention schedule | `DOC > Retention Compliance` | Partly | Null test on `T1 c29` | **Doable** |
| Libraries without mapped retention schedules | `DOC > Retention Compliance`, and `DOC > Risk and Compliance > Inactive libraries` | No | Retention Label Mapping list, `T1 c28` | **Held back deliberately.** `STATUS s11` next step 6: this depends on whether the mapping list keys libraries by `ListId` or by name. Check it, it is a small check that releases two metrics |
| Departments and libraries provisioned per term | `PPT s44, s45, s46` | No | No | Same missing term join as section 5 |
| **Records disposed** | `PPT s32, s44, s46, s60`, `DOC > Disposition completed` | No | **No** | **Blocked.** We removed `DisposalStatus` (`utilizationdb.md`, Table 1 note). There is no record of a disposal having happened |
| Disposition backlog, awaiting approval, approval backlog, overdue | `DOC > Retention Dashboard` and `DOC > Disposition Risk Indicators` | No | No | **Blocked on the same application change** |
| Physical records overdue for transfer | `DOC > Risk and Compliance`, last line | No | No | **Blocked**, RAC holdings, section 7 |

---

## 7. DASHBOARD 6: RECORDS AND ARCHIVE HOLDINGS

Their slides 33, 67, 68 and 69. **Entirely new.** Slide 33 literally says "RAC
suggestions?", so even the client treats this as unfinished.

Wanted: two tables, Storage and Retrieval, each broken down by location (Archives
Room, Records Center, Offsite Storage), with requests, requestors by department
and by RM, boxes stored, folders stored, month on month indicators, pending
request lists, disposal counts, and **room capacity with percentage available
storage**.

| Requirement | Asked at | Verdict |
| --- | --- | --- |
| Physical boxes, folders, storage locations, facilities | `PPT s68`, `DOC > Physical Records Holdings` | **Blocked.** `STATUS s6`, "not designed in at all", already records this: a `PhysicalRecords` table was designed in the workbook and never built, and no boxes, locations or facilities exist anywhere |
| Transfers to RAC, retrievals, loans, returns | `PPT s69`, `DOC > Records awaiting transfer` | **Blocked.** `PPT s67` says retrieval is processed in **eServe**. That is a separate system with no established feed |
| Room capacity and percent available | `PPT s68` and `PPT s69`, closing notes on both | **Blocked.** Physical facility data, not a system of record we have seen |
| Unverified files, missing files, due for verification | `DOC > Inventory Health` | **Blocked.** Same, and it implies a physical inventory process we have no visibility of |
| Storage location breakdown, HQ, field offices, offsite, records centre | `PPT s68`, `DOC > Storage Location Dashboard` | **Blocked.** Field office is already listed in `STATUS s6` as having no source anywhere |
| "Screenshot from IR Dashboard" | `PPT s67` | They are pointing at an existing internal dashboard. **Get access to it.** It may already hold most of this |
| "We would also like to learn what is available in Opus and how we can apply the features for our dashboard" | `PPT s67` | **A direct question to answer.** Not a metric |

**Judgement:** this is not a dashboard we can scope yet. It is a second data
source discovery exercise of the same size as the SharePoint one already done.
Recommend it is separated into its own workstream with its own timeline, rather
than held inside the utilization report and blocking delivery of the other five.

---

## 8. IN THE WORD LIST BUT NOT IN THE DECK

These appear only in `Proposed_Metrics_6.docx`. They are not drawn anywhere, and
we should confirm whether they are still wanted before costing them.

| Word heading | Metrics | Verdict |
| --- | --- | --- |
| `Risk and Compliance > Risk Indicators > Site Health` | Active, inactive over 300 days, orphaned sites | **Doable**, `T2 c14 LastActivityDate` and `T2 c16 SiteOwner`. Note `PPT s35` says 90 days and this heading says 300. **They contradict each other, ask which** |
| `Risk and Compliance > Site Trends` | New sites created, sites archived, site activity trend by month | Created and trend **doable** now that history is kept (`STATUS s7`, 12 Aug). **Sites archived blocked**, no definition |
| `Risk and Compliance > Library usage` | Most used libraries by views, downloads, uploads, edits | **Blocked.** No per library activity feed exists, only per site. Already in `STATUS s6` |
| `Risk and Compliance > Library usage` (rest) | Largest by volume, largest by storage, growth rate, inactive at 90 or 180 days, orphaned, no declared records, no retention mapping | **Mostly doable and mostly already built** on our Sites and Libraries dashboard. Orphaned libraries needs a library owner, which we do not hold |
| `Records Management Metrics > Records Quality` | Duplicated records by filename, orphaned records | **Doable**, a self join on `T1 c4 Title`. Cheap and new |
| `Format and Storage Analysis` | The eight format groups, files and storage each | **Already built.** Survives as a panel even though `PPT s12` demotes it. `T1 c7 FormatGroup` still needs the extension mapping from RAC (`STATUS s6`) |
| `Records Management Metrics > Records Declaration` | Declared by classification, by business process | **Blocked by the same term join** as section 5. Classification means the file plan term |
| `Security and Information Classification > Information Classification` | Records with and without sensitivity labels, by classification level | **Half doable.** `T1 c34 SensitivityLabelName` is in the design and is on no dashboard today. Restricted and confidential counts follow from it |
| `Security and Information Classification > Access Management` | Access requests, external sharing instances, permission exceptions | **Blocked.** These are audit log and permission data, not reporting APIs. A different Graph surface and a different permission set. Same answer as `PPT s56` |
| `Search and Usage Analytics` | Searches performed, successful searches, frequently searched categories, records accessed per month, most viewed and most downloaded records | **Blocked as designed.** SharePoint search analytics are tenant level and are not exposed per record. Most viewed and most downloaded are not available at document grain |
| `Records and Archives Holdings` | Total physical files, legacy records, boxes, locations, unverified, missing, due for verification | **Blocked**, section 7 |

---

## 9. SUMMARY: WHAT IS DOABLE

Every requirement in both documents has since been enumerated one by one in
`EDRMS_Utilization_Report_Requirements_2026-08-13.xlsx`, sheet
`Requirements register`. **These are the counted figures from that register, 123
requirements, and they replace the estimates first written here.** The estimate
was optimistic: it put "buildable now" at about 37 percent, and the actual count
is 21 percent.

| Category | Count | Share |
| --- | --- | --- |
| **Buildable now**, from the current 73 column design | 26 | 21 percent |
| **Buildable once the department list arrives** from RAC | 29 | 24 percent |
| **Needs a new column or a new join** in the design | 12 | 10 percent |
| **Needs an application change** by the development team | 7 | 6 percent |
| **Needs a reference list** somebody must maintain | 6 | 5 percent |
| **Needs a new data source** we have not touched | 32 | 26 percent |
| **Decision needed** before it can be scoped at all | 11 | 9 percent |
| **Total** | **123** | |

One register row is one work item. Where a slide asks for the same figure at two
levels, bank-wide and again per department, it is counted once at each level
because the two have different blockers.

By key view, which is where the shape of the problem shows:

| Key view | Requirements | Buildable now |
| --- | --- | --- |
| 1. Bank-wide Oversight | 42 | 11 |
| 2. Department Insights | 30 | 1 |
| 3. Project Insights | 5 | 0 |
| 4. Institutional File Plan Insights | 9 | 0 |
| 5. Retention and Disposal | 10 | 5 |
| 6. Records and Archive Holdings | 11 | 0 |
| 7. In the Word list only | 16 | 9 |

**Three of the six new dashboards have nothing at all that can be built today.**
Department Insights, the largest at 30 requirements, has exactly one.

So **45 percent of the requirement is deliverable on the design as it stands or
the moment the department list arrives**, and the
single highest value unblocker remains the one already at the top of STATUS.md:
**the site to department list.** It alone releases about a fifth of the
requirement and it is the precondition for the entire Department Insights
dashboard, which is fourteen of their fifty-seven design slides.

### The seven questions to send back, in priority order

1. **Where does the Institutional File Plan actually live?** It is in neither
   the term store nor Purview (`STATUS s6`). Blocks `PPT s29-s31` and
   `PPT s47-s52`, a whole dashboard. Already outstanding before these documents
   arrived, it is `STATUS s11` next step 2
2. **Is there a project site register?** Site URL to project number, sovereign or
   nonsovereign. Blocks `PPT s36, s37, s38`. Check AvePoint Cloud Governance
   first. It unlocks Project Insights completely and cheaply
3. **Division: in or out?** We removed it in `STATUS s7` because nothing
   populates it. `PPT s41, s42, s54, s58` ask for it. If it is in, who supplies
   the mapping
4. **Disposal status, approver, and disposed records.** Needed by `PPT s43, s44,
   s46, s60` and `DOC > Retention Dashboard`. This is a field in the EDRMS
   application, so a development change request, not a reporting one. Confirm
   they want to raise it with Mihal Le
5. **Who maintains the three reference lists?** Go-live dates (`PPT s19, s53`),
   conventions (`PPT s26, s53`) and programme dates (`PPT s28, s53`). These are
   not measurements and nothing can generate them
6. **Inactive is 90 days at `PPT s35` and 300 days at
   `DOC > Risk and Compliance > Site Health`.** Which
7. **Staff, contractor and consultant classification, and training completion**
   (`PPT s21, s39, s54`). `PPT s54` itself asks "Source: database of end users?
   Owned and maintained by?" Nothing in SharePoint holds it

### What can start immediately, without waiting on any answer

- Delete the site rollout panel, `PPT s7`
- Dissolve Records Management into Bank-wide, `PPT s9`
- Demote Format and Storage to a panel, `PPT s12`
- Move the declaration trend to Bank-wide and set a default range, `PPT s10`
- Fold active users per site into the sites table, `PPT s8`
- Rebuild the department treemap as a sortable alphabetical table, `PPT s5, s16`
- Rebuild Compare as the three named ratios, `PPT s6, s17`
- Surface `T1 c27 HasPhysical` as a physical counterpart count, `PPT s15`. It is
  designed, sourceable and on no screen today
- Surface `T1 c34 SensitivityLabelName`, `DOC > Information Classification`,
  same situation
- Add duplicate and orphaned record counts, `DOC > Records Quality`, a cheap new
  metric
- Check the Retention Label Mapping list's key, `STATUS s11` next step 6, which
  releases two held metrics

That list is real work with no external dependency, and it moves the prototype
most of the way to their slide 4 to 12 comments while the seven questions are
out.
