# Dashboard inventory

What exists today in the site, and what is still a placeholder. Nav order is
fixed; keep it. Each built dashboard owns one banner marked CSS block and one
banner marked JS block inside `index.html`; a change to one should never require
touching another's blocks.

| Nav entry | Key | Blocks | Status |
| --- | --- | --- | --- |
| Overview | `ov` | `overview` blocks | Built, the default on load |
| Records Management | `rm` | `recordsmanagement` blocks | Built |
| Department Performance | - | - | Placeholder, `class="dis"`. The only one left |
| File Plan | `fp` | `fileplan` blocks | Built |
| Sites and Libraries | `sl` | `sitesandlibraries` blocks | Built |
| Format and Storage | `fs` | `formatandstorage` blocks | Built |
| Retention | `rt` | `retention` blocks | Built |
| Data Design | `dd` | `datadesign` blocks | Built, a reference page not a dashboard |

Default on load is Overview, the first live entry. Data Design sits under its
own `Reference` nav group, below Operations, because it is documentation for the
build team rather than a report for RAC.

---

## Overview (`ov`)

An executive summary of the other dashboards, and the landing page.

**Every figure is read from the other modules' exported `summary` objects, never
restated here.** That is the whole design: a summary holding its own copy of the
numbers drifts from the detail it claims to summarise the first time either side
is edited. Adding a dashboard means adding a `summary` to it and a section here.

- Five headline KPI cards. Each is clickable and routes to the dashboard the
  figure came from.
- Records Management section: a donut of the physical counterpart split, a
  shared-scale comparison of documents held against records declared with the
  declaration rate called out, and the top 5 departments by declared records.
- Sites and Libraries section: a donut of library content declared against not
  yet declared, and the top 5 departments by compliant sites created.
- Format and Storage section: two donuts, share of storage and share of files,
  **using the same five formats in the same colours** so they can be read
  against each other. The callout underneath states the finding, that the format
  dominating storage is not the format dominating the file count.
- Every panel header carries a button through to the detailed dashboard.

Its "data as of" line quotes the **oldest** refresh across the dashboards it
summarises, not the newest, because a summary is only as current as its stalest
input.

Cross dashboard `console.assert` checks run at load: declared records against
the format file total, both donut splits against their parents, and each donut's
slices against the total it is drawn from.

## Records Management (`rm`)

Data as of Mon 20 Jul 2026 23:59, refreshed Tue 21 Jul 06:00.

**Section 1: declared records against total documents.** Two KPI cards that
toggle the panel below them.

- *Total Declared Records* (21,646). Stacked bars per department, grey-blue for
  without physical counterpart, teal for with. Click a bar to drill department
  to site to library, with a clickable breadcrumb back. Date range
  and Reset on the right; Reset clears dates and drill path together.
- *Total Documents in EDRMS Compliant Sites* (3.47M). Single orange bars, the
  same four-level drill, its own independent date range and Reset.

Both panels show a range summary line only while a range is applied. The
always-on "Showing all declared records" note was removed by request.

**The drill is three levels, Department to Site to Library.** Division was cut:
it was designed in `ADBMeta`, is empty on every row, and nothing in the tenant
supplies it, so a level that could never be populated was removed rather than
left to fail at build time. `SITESTEMS` is the former `DIVNAMES` and now only
names two sites apiece.

**Section 2: SharePoint sites and users governance.** Two KPI cards.

- *Active Departmental Sites*. Green bars ranked by site visits, with last
  activity. 7 / 30 / 90 day window buttons and a department filter.
- *Total EDRMS Users, monthly active*. Deep blue bars of unique viewers per
  site, at 7 or 30 days only. **There is no 90 day option**: Microsoft returns
  no unique viewer total at 90 days, so the button could only ever show
  something else. Site visits still offer 7, 30 and 90.

  The KPI is **not** the sum of the bars. Per site viewers come from
  `/sites/{id}/analytics` and count a person once per site, so summing them
  overstates headcount. The bankwide figure comes from
  `getSharePointActivityUserDetail(period='D30')`, one row per person. Both are
  shown, and the panel explains the gap, because a reader who adds up the bars
  would otherwise think the total is broken. A `console.assert` keeps the
  distinct figure below the sum.

16 departments, so two pages at 10 rows.

Exposes `annualRec` (21,646) so other dashboards can assert against it.

## Sites and Libraries (`sl`)

Data as of Sun 05 Jul 2026 23:59, refreshed Mon 06 Jul 06:00.

**Section 1: compliant site rollout.** One always-open KPI card, *Total EDRMS
Compliant Sites Created* (1,057).

- Treemap of sites created by department, sized and single-hue shaded by count,
  darker meaning more. Two summary tiles: all-time total and in-range total.
  The date range and Reset sit at the **right** of the tiles row, which was a
  specific requested change from their original position below it.
- 15 departments, 10 blocks per page. Blocks across both pages sum to the
  in-range tile.

**Section 2: library adoption and volume.** Two KPI cards that toggle the panel.

- *Libraries Declaration Rate* (4,283). Stacked bars, teal declared over
  grey-blue not yet declared, sized to total documents. Department filter, date
  range, Reset, sort by documents / records / rate with a direction toggle.
- *Largest Libraries* (43.1 GB). Single blue bars by storage. Sort by storage /
  documents / average file size.

15 libraries. Every row shows its parent site beneath the library name.

## Format and Storage (`fs`)

Data as of Sun 05 Jul 2026 23:59, refreshed Mon 06 Jul 06:00.

Structure follows the Sites and Libraries section-1 pattern: each KPI card is
always open with its panel beneath, no toggling.

- *Storage Consumed by Format* (46.7 GB) over a four-column table: format,
  number of files, storage GB, average file size MB. Each numeric cell has a
  data bar scaled to that column's own maximum. Sort picker offers Files,
  Storage, Avg file size, defaulting to **Files, highest first**, with the
  active column highlighted blue. A totals row closes the table.
- *Most Common Format* (`PDF`) over a horizontal bar chart of declared records
  by format, count and share, fixed sort by count descending.

Eight formats. `All other formats` sorts naturally by value and is not pinned
last. Average file size is derived, never stored. File counts sum to 21,646 and
are asserted against `DASHBOARDS.rm.annualRec`.

Renders no data-dependency caveat, by request, even though per-format storage is
a known dependency.

## Format data

| Format | Files | Storage GB |
| --- | --- | --- |
| PDF | 8,200 | 9.6 |
| Word | 5,100 | 3.0 |
| Excel | 3,050 | 2.7 |
| Email (.msg / .eml) | 2,100 | 0.6 |
| PowerPoint | 1,350 | 5.9 |
| Image files | 980 | 3.6 |
| Video files | 466 | 20.5 |
| All other formats | 400 | 0.8 |
| **Total** | **21,646** | **46.7** |

## Data Design (`dd`)

No data as of line: it prints "Design reference. Full detail in utilizationdb.md"
instead. It is the only module that returns `kind:"reference"`, which is how
`verify.js` knows not to demand a KPI card from it.

**The whole module is generated from `utilizationdb.md` by
`scratchpad/gen_dd.py` and `build_dd.py`.** Edit the markdown, rerun both, splice
the output over the `DASHBOARDS.dd` block. Never hand edit the arrays: they carry
61 columns of parallel data across three tables, and the tests compare them
against the document.
The generator converts markdown emphasis to HTML, and a test fails if any `**`
or backtick survives to the rendered page.

Sections, in order:

- **Can it be one table only?** The client asked directly, so the answer opens
  the page: three tables, and the three things that break under one.
- **Naming rule.** Columns keep the name they already have in the EDRMS
  database. `CreatedDate` stays `CreatedDate`, `ListId` stays `ListId`. JSON keys
  inside `FileMeta`, `EDRMSMeta` and `ADBMeta` become real columns keeping the
  key name. Only two names were invented, both because the existing name means
  something else: `FileModifiedDate` and `FileCreatedDate`, since `ModifiedDate`
  is the record row and `CreatedDate` is the declaration.
- **Can it be one table only?** now answers *three*, not two, and the third
  reason is that people cannot be counted from a table of sites.
- **What one row means.** The grain is `ListId` plus `ItemId`, not `DocumentId`,
  which is nullable. A UAT check returned 1,990 rows against 1,984 distinct
  `DocumentId`, so Total Declared Records counts distinct items, not rows.
- **The three tables**: 35, 19 and 7 columns, each a full width card over a
  numbered column table. The User Activity Table is the third grain, one row per
  person, and exists because Total EDRMS Users counts people and people cannot be
  counted from a table of sites.
- **Which figure each column produces, and how to source it**: all 61 columns,
  each with the figure it feeds, a status, its exact location in
  `Database_Design_12.03_2.xlsx` (sheet and spreadsheet row) and in live
  `drm-npr`, and **the system to go to** for the ones that do not exist.
- **Where every figure comes from**: 31 figures read from the other direction.
- **Where to go for each source**: the six systems.
- **The remaining gaps.** Gap 3 is no longer a RAC decision: the compliance
  marker is an installed app, visible per site in Site Contents.

The tally under the traceability tables is **counted at render time**, never
written down, so it cannot claim a number the table does not show.

Workbook references point at sheet `4 Records`, **the 2026.1 block at rows 56 to
82**. That sheet holds an older 1.3 block above it with different column names;
quoting the wrong block is the easy mistake. `ADBMaster`, `Library`,
`PhysicalRecords` and `favoritelocations` are in the workbook but were never
built.

## File Plan (`fp`)

The institutional file plan is the SharePoint term store, read as a report.
Answers the client's section 3.

- Two KPI cards, *Total Terms* (1,099) and *Term Sets* (45).
- Five category bars sized by term count, each showing its term set count and how
  many levels deep it runs.

**Source is confirmed, counts are not.** Three Graph calls, needing
`TermStore.Read.All`:

```
GET /termStore/groups                    the five categories
GET /termStore/groups/{groupId}/sets     the sets inside one
GET /termStore/sets/{setId}/children     the terms at one level
```

**The wrinkle worth knowing before anyone estimates it:** a file plan is a tree
and the API returns one level at a time, so counting every term under a category
means walking down through each level rather than reading a total. A loop, not a
blocker. `Depth` is recorded while walking at no extra cost, and it answers what
a file plan review usually asks anyway.

The amber note on the panel says the counts are illustrative until that walk is
run. Leave it there until it has been.

## Retention (`rt`)

Data as of Mon 20 Jul 2026 23:59, refreshed Tue 21 Jul 06:00.

Built because the data was already there. `Records` carries
`EDRMSDueDateForDisposal`, computed as label applied plus duration, so records
due for disposal is a count and next due date is a `MIN()` over a column that
exists today. Leaving it a placeholder was hiding a figure needing no new source.

- Two KPI cards, both always open: *Records Due for Disposal, next 12 months*
  (608) and *Next Due Date for Disposal*.
- **Disposal summary by library**, a sortable table over 15 libraries: library,
  site, records held, due within 12 months, next due date, inactive over 1 year.
  Record counts are the same figures Sites and Libraries shows, so the two
  reconcile.
- **Retention profile**, declared records by label over all 21,646, with
  `Permanent` drawn in grey blue and marked "Never due for disposal".

`PERMANENT` (2,460) is a named constant excluded from every disposal figure, with
an assertion enforcing it. A second assertion ties the label total to
`DASHBOARDS.rm.summary.declared`.

**Inactive over 1 year is the one figure here that is not ready.** It needs the
document scan, because an untouched document has no row until the scan creates
one, and the panel says so in an amber note rather than implying otherwise.

## Sites and Libraries, section 3 and 4

Added 10 August, answering the client's 1.1.1, 2.1.1.2, 2.1.1.3.x, 4.1, 4.3, 4.4
and 4.8.

**Section 3, site inventory.** *Active Sites* and *Inactive Sites, over 90 days*,
over a sortable table of site, department, owner, libraries, users, visits, last
activity and status.

**Inactive, not orphaned.** The word orphaned was dropped deliberately: the
client's own list pairs it with "sites without owners", which is a different
question. This figure measures idle time only and is named for that. Ownerless
sites are out of scope.

**Section 4, library health and growth.** *Active Libraries, last 90 days* and
*Library Growth Rate*, over a sortable table with three states rather than two,
because a library over the 180 day dormant threshold is a different conversation
from one that has merely gone quiet.

**The growth rate needs no snapshot history**, which is the thing people assume.
Every record carries `CreatedDate`, so records held at the start of the period is
the total minus those declared since. It is ready today.

## Known open items

- Overview is built. The older standalone prototypes v18 and v19 remain in the
  repo as reference only; there is no v20 despite older notes referencing one.
- **Department Performance is the only placeholder left.** Most of its data now
  exists: the site inventory covers owners, libraries, users and visits per site,
  and the drill covers the rest. What it needs is a screen, not a source.
- Em dashes are gone from the whole page. The department dropdowns use a hyphen
  and the pre-init KPI placeholders an ellipsis, so the rule holds everywhere for
  the first time. `verify.js` fails on any that come back.
- The separate Email Records Declaration stream is out of scope; do not touch it.
