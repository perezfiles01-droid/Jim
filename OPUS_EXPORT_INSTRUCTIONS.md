# OPUS EXPORTS: WHAT TO PULL AND HOW

**Written 19 August 2026.** Instructions for generating the seven exports from
AvePoint Opus (Information management) that would feed the EDRMS Utilization
Report.

---

## 0. READ THIS FIRST

### Why this document exists

`STATUS.md` section 7 records **"Nothing from Opus"** as a settled decision,
taken 17 August. Read the reason it was settled:

> "None of that is a source we have, and the client has confirmed nothing from
> Opus goes in."

It was settled because **nobody in this project could see Opus**. That has
changed. The decision is not being overturned here, it is being put back to the
client with evidence, as audit question 17. These exports are the evidence.

### What is confirmed and what is not

Everything in this document marked **CONFIRMED** was read directly off the Opus
dashboard screenshot of 19 August 2026. Everything marked **EXPECTED** is the
normal pattern for this class of product and **must be verified in the tenant**,
not assumed.

This distinction is the whole discipline of this project. `STATUS.md` section 8
lists eleven errors caught by exporting the real file instead of trusting an
expected column name. Do not let an expectation in this document become a fact.

**If a click path below does not match what you see, the path is wrong, not the
tenant.** Write down what you actually saw and we correct this file.

### The trap, before you export anything

**Opus's managed records are not the EDRMS declared records.**

| Figure | Value | Source |
| --- | --- | --- |
| Opus managed records | **253** | Opus dashboard, 19 Aug |
| Rows in `public."Records"` | **~1,990** | drm-npr, direct query |
| Opus SharePoint nodes configured | **25** | Opus dashboard, 19 Aug |
| EDRMS compliant sites | **1,032** | Cloud Governance `EDRMS Site Type` |

Same tenant, different populations. Opus is a source for **lifecycle events and
physical holdings**. It is **not** a replacement denominator for declared
records. If the two are ever swapped, every bank-wide total silently breaks.

### Where exports land

**CONFIRMED** the left nav carries **Activity → Download center** and
**Activity → Job monitor**.

**EXPECTED** exports run as background jobs: you request one, watch it in Job
monitor, and collect the file from Download center. This is the same pattern as
Cloud Governance's Workspace report, which this project already uses. Do not sit
waiting on a browser download.

### Rules for every export below

1. **Export unfiltered.** Do not narrow by date, department, status or content
   source. The point is to read what is actually there, not what we expected.
2. **Export every column.** If the tool offers a column picker, select all.
3. **CSV or XLSX, whichever it offers.** Do not retype anything into a new
   sheet.
4. **Note the row count** shown on screen before you export, so we can tell a
   truncated file from a complete one.
5. **Name the file** `opus_<name>_2026-08-DD.csv` and put it in the repo root
   next to the other `evidence_*` files.

---

## EXPORT 1. PHYSICAL RECORDS EXPLORER

**Priority: highest.** This one file decides whether the Records and Archive
Holdings dashboard can exist at all. Today that dashboard has no source for any
measure and prints column specifications instead of a table.

### What it should fill

Deck slides 68 and 69, the two tables the client drew:

- Total number of boxes stored
- Total number of folders stored
- Location, as the row label on both tables
- Month on month new boxes and folders per department
- Physical counterparts identified but not transferred

### How to generate it

1. Open **Opus** from the AvePoint Confidence Platform, My services.
2. In the left nav find the **Physical records** section. **CONFIRMED** it sits
   below Reporting and above Activity.
3. Click **Explorer**. **CONFIRMED** this node exists.
4. **EXPECTED** you land on a tree or grid of physical items. If there is a
   folder tree on the left, click the **top level / root** so the grid shows
   everything, not one branch.
5. Clear any filter that is applied by default. Look for a filter chip, a funnel
   icon, or a search box with text already in it.
6. **EXPECTED** find **Export**, **Download**, or an icon of a sheet with a
   down arrow, on the grid toolbar or behind a **...** overflow menu.
7. If offered a column chooser, **select all columns**.
8. If offered a scope choice, pick **all items** or **current view with
   subfolders**, not **selected items**.
9. Submit, then go to **Activity → Job monitor** and wait for the job to finish.
10. Collect the file from **Activity → Download center**.

### What to check for in the header row

Do not assume these names. Report what is actually there.

| We need | Likely called something like |
| --- | --- |
| Item type, box against folder | Type, Record type, Container type, Template |
| A unique identifier | Barcode, Item ID, Record ID, Reference |
| Where it physically is | Location, Storage location, Current location |
| Who owns it | Department, Owner, Business unit, RM |
| When it arrived | Accession date, Created, Transfer date, Date stored |
| Current state | Status, Lifecycle state |
| Link to a digital record | Related record, Source item, Counterpart |

**The last row is the one to look hardest for.** If a physical item carries a
link back to a declared record, that closes audit question 6, "Turned over to
RAC" on slide 42, which came off the page for want of a custody event.

---

## EXPORT 2. PHYSICAL RECORDS LOCATIONS

**Priority: high, and it is a small file.** Do it immediately after Export 1.

### What it should fill

- The three row labels on slides 68 and 69: Archives Room, Records Center,
  Offsite Storage
- Slide 68 asks **us** a question: "Can room capacity and % available storage
  capacity be included?" This export is where the answer lives or does not.

### How to generate it

1. Left nav, **Physical records → Locations**. **CONFIRMED** this node exists.
2. **EXPECTED** a list or tree of storage locations.
3. Export it the same way as Export 1. If there is no export control, this list
   will be short enough to **screenshot in full** and that is acceptable for
   this one file only.

### What to check for

1. **Is Location a fixed list or free text?** If it is a maintained picklist,
   slide 68's three fixed rows hold. If it is free text typed per item, they do
   not, and that becomes a client question.
2. **Do the values match the client's three?** Archives Room, Records Center,
   Offsite Storage. Anything else, write down the real values.
3. **Is there a capacity field?** Anything named capacity, shelf count, maximum
   items, or occupancy. **If yes, slide 68's open question is answerable and
   that is a finding worth reporting on its own.**
4. **Is there a hierarchy?** Room, then aisle, then shelf. That changes what
   "location" means on the report.

---

## EXPORT 3. PHYSICAL RECORDS REQUESTS

**Priority: high.** This is the whole of slide 69.

**CONFIRMED** the dashboard tile reads **Physical records requests, Total 26,
Creation requests 1, Loan requests 25**. So the underlying list exists and is
already split the way the client needs it.

### What it should fill

- No. of requests, per location, slides 68 and 69
- Total number of requestors (departments), and (RMs)
- Total number of boxes retrieved, folders retrieved
- Status vocabulary: Loan, Return to owner, For Disposal
- No. and list of outstanding / pending requests, both slides

### How to generate it

1. On the Opus **Dashboard**, **Information lifecycle** tab, find the **Physical
   records requests** card. **CONFIRMED** it is the fourth card on the top row.
2. **Click the total, 26.** **CONFIRMED** the number is rendered as a link.
   **EXPECTED** it opens the underlying list.
3. If it does not, try **My tasks** in the left nav, or **Physical records →
   Explorer** and look for a Requests tab alongside the items grid.
4. Make sure you are seeing **all 26**, not just the 25 loans. If the list opens
   pre-filtered to Loan requests, clear the filter.
5. **Clear any date filter.** These lists often default to the last 30 days,
   which would hide the history the month-on-month indicators need.
6. Export, unfiltered, all columns. Collect from **Download center**.

### What to check for

| We need | Likely called something like |
| --- | --- |
| Who asked | Requestor, Requested by, Submitted by |
| Their department | Department, Business unit, Requestor department |
| Loan against creation | Request type, Type |
| What was requested | Item, Record, Box, Barcode |
| When | Request date, Submitted date |
| Where it went out from | Location |
| Current state | Status |
| Whether it is still open | Status, Due date, Return date |

**Two things matter most here.** First, whether **requestor carries a department**
or only a person. If only a person, "requestors (departments)" needs the same
site to department join we already run, and inherits the same 240 multi
department problem from `STATUS.md` Gap 1. Second, whether the **status
vocabulary matches the client's three words**: Loan, Return to owner, For
Disposal. If Opus uses different words, that is a mapping decision for RAC.

---

## EXPORT 4. MANUAL APPROVAL HISTORY

**Priority: high, and it is the one with the biggest consequence.**

**CONFIRMED** the dashboard tile reads **Manual approval status, Total 27,
Awaiting approval 23, Waiting for disposal 4**, and carries a **View history**
link.

### Why this one matters more than it looks

Four measures were **removed from the live prototype** on 17 August because no
field existed in the EDRMS application to fill them, and each was recorded as
blocked on a development change request:

| Removed | Slide | Recorded as blocked on |
| --- | --- | --- |
| Disposal approver | s43, s60 | The change request, question 7 |
| Approved, Declined, Extended | s43, s60 | The change request, question 7 |
| Number of records disposed | s44, s46 | The same change request |

**CONFIRMED** the Opus dashboard shows **Managed records, Destroyed 7**. If
disposition is approved and executed in Opus, then those four measures were
assessed against the wrong system, and **the change request may be
unnecessary**. That is the single most valuable thing these exports could prove.

### How to generate it

1. On the **Dashboard**, **Information lifecycle** tab, find the **Manual
   approval status** card.
2. Click **View history**. **CONFIRMED** this link exists on the card.
3. **Clear any date filter.** **EXPECTED** it defaults to a recent window. We
   need the full history, because month on month is a requirement.
4. Export, all columns. Collect from **Download center**.
5. Separately, click the **Destroyed 7** figure on the **Managed records** card
   and export whatever list it opens. Destroyed items may not appear in an
   approval history.

### What to check for

| We need | Likely called something like |
| --- | --- |
| Who approved | Approver, Reviewer, Actioned by, Assigned to |
| The outcome | Decision, Action, Result, Status |
| Whether Extended exists | Look specifically for extend, defer, postpone, retain longer |
| When | Decision date, Completed date, Action date |
| What was decided on | Record, Item, Title, ID |
| Which department it belonged to | Department, Owner, Workspace, Site |

**Look specifically for whether the outcome vocabulary includes all three of
Approved, Declined and Extended.** The client drew those three words on slides
43 and 60. Two out of three is still a finding, but it is a different one.

---

## EXPORT 5. THE REPORTING NODE INVENTORY

**Priority: do this before Exports 1 to 4 if you have five spare minutes.**

**CONFIRMED** the left nav carries a **Reporting** node with an expand arrow.
Nothing under it is visible in the screenshot.

A canned report almost always beats scraping a grid: it is designed to be
exported, it usually carries a date range, and it may already join things the
grids keep apart.

### How to generate it

1. Left nav, click the arrow beside **Reporting** to expand it.
2. **Write down every report name you see.** That list alone may replace half of
   this document.
3. Open any report whose name mentions: disposition, disposal, destruction,
   retention, lifecycle, physical, holdings, requests, loans, audit, or
   activity.
4. For each, note whether it offers a **date range**, a **department or content
   source filter**, and an **export** control.
5. Do the same for **Discovery and analysis** and **Content sources**, which are
   also collapsed in the screenshot.

### What to send back

Just the list of names, plus for each one whether it can be exported and whether
it takes a date range. I will tell you which to run.

---

## EXPORT 6. TERMS AND RULES

**Priority: medium.** This one resolves a number that does not currently add up.

**CONFIRMED** the Opus dashboard shows **Terms, Total 65, With rules applied 15,
No rules applied 50**.

This project has separately confirmed **53 Purview retention labels, a flat
list**, in the same tenant. **65 and 53 are not the same number**, so they are
not the same thing, or one of them is stale. That needs an answer before either
is quoted on slide 45 or 46.

### What it should fill

- Slide 46's **Retention label** column, the one showing 5, 10, 20 years
- The Term (Top level) row labels on slides 45 and 46
- The permanent against temporary split, which drives the whole Retention and
  Disposal dashboard

### How to generate it

1. Left nav, expand **Terms and rules**.
2. **EXPECTED** a list of terms, and separately a list of rules.
3. Export both, unfiltered, all columns.

### What to check for

1. **Is there a permanent flag, or a duration in years?** The prototype's
   `EDRMSDuration` is text so it can hold `Permanent` beside `10`. Whatever
   Opus uses needs to map onto that.
2. **Is the list flat or a hierarchy?** Slides 45 and 46 say "Term (Top level)",
   which only means something if there are lower levels.
3. **Does a term carry a department or a library?** If it does, that is a join
   this project does not currently have. `STATUS.md` records the term to
   document join as missing with no key anywhere.
4. **Why 65 and not 53.** Are the extra twelve Opus-native rules, physical
   records terms, or disabled entries?

---

## EXPORT 7. CONTENT SOURCES AND CONFIGURED NODES

**Priority: medium, but it answers a scope question that governs everything
else.**

**CONFIRMED** the dashboard shows **Nodes with settings configured by content
source**: SharePoint Online 25, OneDrive 1, Exchange Online 1, Physical Records
4, File System 4. And **Active records by content source**: SharePoint Online
102, Physical Records 104, File System 40.

**25 configured SharePoint nodes against 1,032 EDRMS compliant sites.**

### Why it matters

If Opus in production is configured on a handful of sites rather than all of
them, then anything sourced from Opus is a **sample, not a bank-wide figure**,
and no Opus measure can go on the Bank-wide Oversight dashboard at all. This
decides the ceiling on everything above.

### How to generate it

1. Left nav, expand **Content sources**.
2. Export or list the configured nodes for **SharePoint Online**.
3. Note the count, and whether the site names look like EDRMS sites.
   **CONFIRMED** the dashboard's top workspaces are **EDRMS-OPUS01 (66)**,
   **Demo Opus (31)** and **CSD-Administrative Site (5)**, which reads like a
   pilot rather than a rollout.
4. Do the same for **Physical Records**, 4 nodes.

### The question this produces for the client

**Is Opus deployed across all EDRMS compliant sites in production, or is this a
pilot?** Ask it of Leah Bancale alongside the Cloud Governance production
export, since it is the same conversation.

---

## WHAT TO SEND BACK

For each file: **the header row and the row count**. Nothing else is needed to
start. If a file is small, send the whole thing.

Plus, in plain text:

1. The list of report names under **Reporting**.
2. Whether any click path in this document did not match what you saw.
3. Whether **Location** is a picklist or free text.
4. Whether the approval outcomes include **Extended**.
5. Whether a physical item links back to a declared record.

Put the files in the repo root as `opus_<name>_2026-08-DD.csv`, matching the
existing `evidence_*` convention, so a later reader can check a claim rather
than trust it.

---

## WHAT THIS COULD CHANGE

If the exports carry what the dashboard suggests they carry:

| Currently | Would become |
| --- | --- |
| Records and Archive Holdings prints column specs and no data, s68 and s69 | A real dashboard, sourced |
| Disposal approver and Approved / Declined / Extended removed, s43 and s60 | Back on the page |
| Number of records disposed removed, s44 and s46 | Back on the page |
| "Turned over to RAC" removed, s42 | Possibly back, if a physical item links to its record |
| Slide 68's capacity question unanswered | Answered, either way |
| Audit question 17, "what should Records and Archive Holdings be" | Answerable with evidence |

**Three of those are measures the client drew and we took off the page.** That
is the case for putting Opus back to them.

### And two new questions for the client

1. **Is Opus deployed across all EDRMS sites in production, or is this a
   pilot?** 25 configured nodes against 1,032 compliant sites.
2. **Opus reports 65 terms, Purview reports 53 retention labels, same tenant.
   Which governs the file plan?**

---

## WHAT THIS DOES NOT CHANGE

The numbers. Everything on the Opus dashboard is **test tenant**: 253 managed
records, 104 physical records, 26 requests, 65 terms, 7 destroyed. Treat the
**method** as valid for ADB production and re-run every export there. This is
the same rule that governs the four existing exports in `STATUS.md` section 5,
and it has held every time.
