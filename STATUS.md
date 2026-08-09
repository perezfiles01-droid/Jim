# CURRENT STATUS

Where the EDRMS Utilization Report actually stands. **Read this before BACKGROUND.md**:
BACKGROUND.md is the durable project context and is still correct about the tech
stack, the palette and the hard rules, but it was written on 4 August and predates
everything below.

Last updated 9 August 2026.

---

## 1. THE ONE THING TO KNOW

`public."Records"` in the `drm-npr` PostgreSQL database contains **declared
records only**, about 1,990 in UAT. It holds **no row at all** for an undeclared
document.

So every figure about declared records can be produced today. Every figure that
needs a denominator cannot, because the denominator does not exist in any system
yet. That single fact explains most of what is still open.

---

## 2. THE BOARD

52 visual elements in the prototype. Every one of them is **buildable**. Nothing
is unknown any more.

| Status | Count | Waiting on |
| --- | --- | --- |
| Ready today | 14 | Nothing. The data is in `Records`. Point a query at it |
| Needs the document scan | 17 | Code. One Microsoft Graph job |
| Needs the usage feed | 8 | Code. A smaller job over the M365 usage reports |
| **Blocked** | **12** | **Two asks to RAC.** Not impossible, waiting on a person |
| Derived | 1 | Reads the other elements |

**"Blocked" never means impossible.** It means a human has to supply a list or
make a decision.

### The 12 blocked, and the two asks that clear them

**Ask 1, a list from RAC: site to department and division.** Clears 8:

1. Records Management, declared records per department
2. Records Management, drill level 1 Department
3. Records Management, drill level 2 Division
4. Records Management, documents per department
5. Records Management, department filter
6. Sites and Libraries, sites created by department treemap
7. Overview, top 5 departments by declared records
8. Overview, top 5 departments by compliant sites

**Ask 2, a decision from RAC: what makes a site EDRMS compliant?** Clears 4:

9. Sites and Libraries, Total EDRMS Compliant Sites Created, the 1,057 KPI
10. Sites and Libraries, all time total tile
11. Sites and Libraries, in range total tile
12. Sites and Libraries, date range on the treemap

Note both clusters sit on two dashboards, and neither dashboard goes dark.
Records Management keeps Total Declared Records, the physical counterpart split,
the site and library drill levels and its date filter. Sites and Libraries keeps
every library figure.

---

## 3. DELIVERABLES AND WHAT EACH IS FOR

| File | What it is |
| --- | --- |
| `index.html` | The prototype. Single self contained file, 5 dashboards plus a Data Design reference page |
| `utilizationdb.md` | The database design in the client's own workbook format. Two tables, 58 columns, no code |
| `EDRMS_Utilization_Report_Source_Data_v4.xlsx` | **The working document.** Every element mapped to its source, the gaps, the action plan, 25 findings with evidence |
| `BACKGROUND.md` | Durable project context. Still correct on stack, palette, hard rules |
| `STATUS.md` | This file |

Earlier workbook versions v1 to v3 are kept for the audit trail. **v4 is current.**
A v5 is warranted, see section 9.

---

## 4. THE DESIGN, SETTLED

**Two tables**, not one and not seven.

| Table | One row per | Why it must exist |
| --- | --- | --- |
| `rpt.utilization_report` | document | Holds declared AND undeclared together. Without the undeclared there is no denominator and no declaration rate |
| `rpt.utilization_site_activity` | SharePoint site | A site with no documents would vanish from the site count, and visit counts are per site so repeating them on every document row makes any total nonsense |

**The grain is one SharePoint item, identified by `ListId` + `ItemId`.** Not
`DocumentId`, which is nullable. UAT returned 1,990 rows against 1,984 distinct
`DocumentId`. Both `ListId` and `ItemId` are `NOT NULL`.

**Total Declared Records counts distinct items, not rows**, so a document
declared twice is one record. RAC to sign off.

**Columns keep the database's own names.** `CreatedDate` stays `CreatedDate`, not
"Declared Date". JSON keys inside `FileMeta`, `EDRMSMeta` and `ADBMeta` become
real columns keeping the key name. Only two names were invented, both because the
existing name means something else: `FileCreatedDate` and `FileModifiedDate`,
since `CreatedDate` is the declaration and `ModifiedDate` is the record row.

---

## 5. THE GAPS

### Gap 1, department and division. THE LARGEST OPEN ITEM

**Cause traced end to end.** The SharePoint column `ADBDepartmentOwner` exists on
the library, is named exactly like the `ADBMeta` key, and is **empty on every
row**. So `ADBMeta` is empty because nobody fills in the SharePoint column. **The
fix is upstream of the database.** No amount of database work reaches it.

Division is designed in `ADBMeta` too, but **no `ADBDivisionOwner` column was
found in the one library inspected**. Caveat: that is one library in one test
site, a hint rather than proof. Worth checking a second library. It does not
change the plan, because both are empty either way.

**The fix.** Do not tag 3.47 million documents. The report's own drill goes
Department to Division to Site to Library, so department is already a property of
the **site**. Map site to department and division once, about 1,057 rows, load it
as the Site Activity Table, and let documents inherit from their site. No
SharePoint change, no application change. Full plan on the "Gap 1 action plan"
sheet of the workbook.

**Ask AvePoint Cloud Governance first.** If it recorded the requesting department
at provisioning, this is an export rather than data entry.

**Shortcut.** Only 977 of 2,359 sites in the test tenant hold any documents. Fill
the top 100 by document count and mark the rest Unassigned: an hour instead of a
day, and the report becomes meaningful immediately.

**The question that decides easy or hard:** is it acceptable that every document
in a CWRD site counts as CWRD? The drill down already assumes yes. Confirm it.

### Gap 2, file size. CLOSED

Microsoft Graph returns `size` on every file unprompted. Verified on real items
from 1,506 bytes to 2,338,767. The `FileMeta.FileSize` change is now optional,
wanted only for per record detail at declaration time.

**Warning that came with it:** folders are returned as items with a **cumulative**
size, one observed at 5,163,738 bytes. Summing every item double counts storage.
**The scan must filter to files only.**

### Gap 3a, site created date. CLOSED

`GET /sites?search=*` returns `createdDateTime` alongside `webUrl` and
`displayName`. `org_csd_1.4testsite` was created 2025-09-25. No admin centre
export needed.

It unblocks no element on its own, because everything using the created date also
needs the compliance rule or department.

**Watch item:** one site reported `createdDateTime` ten days *after* its
`lastModifiedDateTime`, probably a restore. The treemap is built on created date,
so such sites land in the wrong bucket. Count them on the real data.

### Gap 3b, the compliance rule. OPEN, but with a strong candidate

**The rule may already exist and nobody has called it that.** The test tenant
holds `No mapping library1`, a real library full of real documents where
declaration **fails** with *"No Library and Retention Label Mapping found"*.

So the **Retention Label Mapping list** in `app_edrms_data_uat` is already the
enforced registry of what EDRMS manages. Proposed rule: a library is in scope if
it appears in that list; a site is compliant if it holds at least one mapped
library. No new list, no new process, and RAC already maintains it.

**Ruled out:** `Root Web Template` does not distinguish EDRMS sites. Both test
sites report "Team Site", along with 2,078 of 2,359 sites in the tenant.

---

## 6. EVIDENCE GATHERED, 8 AUGUST 2026

25 findings are recorded with their evidence on the "Test tenant findings" sheet
of the workbook. The ones that changed decisions:

- **Graph returns file size on every file.** Gap 2 closed.
- **Folder sizes are cumulative.** A bug caught before the scan was written.
- **`ListId` matches SharePoint's own list GUID.** The join key is verifiable.
- **`No mapping library1` proves declaration is already gated** by the Retention
  Label Mapping list. Gap 3b has an answer.
- **Documents in unmapped libraries are undeclarable, not undeclared.** If counted
  in the denominator the declaration rate can never reach 100 percent.
- **The usage export has no unique viewers column.** 23 columns, and
  `Visited Page Count` is unique *pages*, not people.
- **But `/sites/{id}/analytics/allTime` does**, returning `actorCount`. Verified:
  `actionCount 5535, actorCount 12`. **Active Users has a source.**
- **`File Count` in the usage export gives Total Documents** per site, 26,660
  across 977 sites. That KPI left the document scan.
- **`Site URL` is empty on all 2,359 rows** of the usage CSV, while
  `Owner Principal Name` holds real UPNs, so it is not ordinary concealment, which
  was already switched off. Resolve `Site Id` through Graph instead.
- **The five usage CSVs reconcile exactly.** 2,359 detail rows minus 657 deleted
  equals the 1,702 in the site count file. **Filter `Is Deleted` or every count
  runs 28 percent high.**
- **Microsoft data ran three days behind** on the export date. The "Data as of"
  line must quote *their* refresh date, not the job run time.
- **`Item is a Record` is populated and reliable**, so `IsDeclaredRecord` can be
  read straight from SharePoint. Keep the match against `Records` as a **cross
  check**: any row where SharePoint says record and `Records` does not is a
  document labelled without being declared, which is the failure mode the client
  raised weeks ago and nobody could measure.
- **`RetentionLabelAppliedForCalculated` matches the native compliance timestamp**
  on every row, so it is derived rather than typed by hand. It is still writable.
- **Due Date for Disposal = Retention Label Applied + Duration**, confirmed from
  the live calculated column formula. Not Declared Date plus duration.

---

## 7. KEY IDENTIFIERS

Test tenant `7rkd12`, connected as `JimTest@7rkd12.onmicrosoft.com`.

```
Site      org_csd_1.4testsite
  siteId  414bd9e3-7f1e-43bf-8e41-65d7b9b94df0
  webId   06aacb5e-268a-41d9-a7d7-b0cb8d4d1c10
  Graph   7rkd12.sharepoint.com,414bd9e3-7f1e-43bf-8e41-65d7b9b94df0,06aacb5e-268a-41d9-a7d7-b0cb8d4d1c10
  22 libraries, 2,547 files, 18.7 GB, created 2025-09-25

Libraries
  Annual Meetings  387ed159-b632-45af-b4d4-c6fd96d8ee33
  Budget           a09d42b9-5b7a-4a07-b6c7-8c600a74eef6

Site      org_csd_1.3testsite
  siteId  ef7198c7-f04c-420d-8c5c-2cebf6272cb6
  webId   d51a0e85-950e-4031-a0b0-7bf43feb7c50
```

Database `drm-npr`, schema `public`. Deployed tables: `Records`,
`TrackingRecords`, `JobTriggers`, `QueueRecords`, `ADBSites`, `EDRMSMasters`.
**Never built despite being in the workbook:** `ADBMaster`, `Library`,
`PhysicalRecords`, `favoritelocations`.

Workbook references are to `Database_Design_12.03_2.xlsx`, sheet `4 Records`,
**the 2026.1 block at rows 56 to 82**. That sheet has an older 1.3 block above it
with different column names; quoting the wrong block is the easy mistake.
`_2` and `_4` of that workbook are content identical.

---

## 8. DECISIONS OPEN WITH RAC

| # | Question | Why it matters |
| --- | --- | --- |
| 1 | What makes a site EDRMS compliant? | 4 figures, and the phrase appears in two dashboard titles |
| 2 | Do documents in unmapped libraries count in Total Documents? | They are undeclarable. Counting them caps the declaration rate below 100 percent permanently |
| 3 | Does a document declared twice count once or twice? | Recommend once, distinct `ListId` + `ItemId` |
| 4 | Is department by site acceptable? | Decides whether Gap 1 is a week or a quarter |
| 5 | What counts as a document? Folders, versions, system files | Moves the 3.47M and the rate substantially |
| 6 | Which extensions map to which of the 8 format groups | Without it `FormatGroup` has no rule |
| 7 | Is the 90 day Active Users fallback acceptable? | Microsoft does not return unique viewers at 90 days and says so on its own page |

---

## 9. NEXT STEPS

1. **Build v5 of the workbook.** Test D passed, so Active Users and Unique
   viewers per site move from Blocked to Needs the usage feed. Blocked goes 14 to
   12, the usage feed 6 to 8. The version where the workbook can say "nothing
   unknown remains".
2. **Reconcile the unique viewer numbers.** The Site usage page showed 22 unique
   viewers; Graph `allTime` returned 12 for `org_csd_1.4testsite`. All time should
   exceed 90 days, so either the screenshot was a different site or the two count
   different things. Resolve before building on it.
3. **Build the pre-filled site mapping spreadsheet.** Needs the output of
   `GET /sites?search=*&$select=id,displayName,webUrl,createdDateTime&$top=999`.
   One row per site, department and division blank, headings matching
   `rpt.utilization_site_activity`.
4. **Email IT about AvePoint Cloud Governance.** Could collapse Gap 1 to an export.
5. **The join test.** Query `Records` for
   `ListId = '387ed159-b632-45af-b4d4-c6fd96d8ee33'`, enumerate Annual Meetings,
   match on `ItemId`. First end to end proof of the design, on data small enough
   to check by hand.

**Windows available for unique viewers:** `allTime` and `lastSevenDays` only. No
30 day option, and Microsoft states the 90 day figure is unavailable. The
prototype's 7 / 30 / 90 buttons do not map perfectly. Small design conversation.

---

## 10. ENVIRONMENT CONSTRAINTS

- **Git push returns 403.** Session credentials are read only. Commit locally,
  then deliver files to the user with `SendUserFile`. Do not retry the push.
- **LibreOffice cannot run here.** It times out even on a two cell file, so
  `recalc.py` cannot verify workbook formulas. **Verify formula results by hand**
  against the source data and say so. This already caught a real bug: a `COUNTIF`
  pointing at column G, the calculation text, instead of column H, the status.
- **The Microsoft 365 connector flaps.** It disconnects and reconnects through a
  session. Check with `ListConnectors`; `enabledInChat: false` with
  `connected: true` means it is toggled off for the chat, not broken.
- **The proxy blocks `github.io` and `sharepoint.com`** for direct HTTP. Use the
  connector, not `curl`.
- **No hyphens in filenames.** The user's download path strips them.

---

## 11. HOW TO REBUILD THINGS

**The workbook.** Scripts are in `.claude/skills/edrms-utilization-report/scripts/`:

```
elements.py     the 52 elements, the base data
tenant.py       what each round of investigation changed, plus the findings
build_xlsx.py   builds the workbook from both
```

Run `build_xlsx.py`. Edit `OUT` for the version. **Never hand edit the workbook**,
edit the data and rebuild.

**The Data Design page inside `index.html`.** Generated from `utilizationdb.md`:

```
gen_dd.py    parses the markdown
build_dd.py  emits the JavaScript module
```

Run both, then splice the output over the `DASHBOARDS.dd` block. The tests compare
the page against the document, so they cannot drift.

**Verification.** Test suites are in the session scratchpad, not the repo.
`.claude/skills/edrms-utilization-report/scripts/verify.js` is the generic floor
and is in the repo. Serve `index.html` over http and run it with `playwright-core`
against `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Two em dash failures
in the department dropdowns are known, pre-existing and deliberately left alone.
