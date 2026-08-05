# Dashboard inventory

What exists today in the site, and what is still a placeholder. Nav order is
fixed; keep it. Each built dashboard owns one banner marked CSS block and one
banner marked JS block inside `index.html`; a change to one should never require
touching another's blocks.

| Nav entry | Key | Blocks | Status |
| --- | --- | --- | --- |
| Overview | `ov` | `overview` blocks | Built, the default on load |
| Records Management | `rm` | `recordsmanagement` blocks | Built |
| Department Performance | - | - | Placeholder, `class="dis"` |
| Sites and Libraries | `sl` | `sitesandlibraries` blocks | Built |
| Format and Storage | `fs` | `formatandstorage` blocks | Built |
| Retention | - | - | Placeholder, `class="dis"` |
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
  to division to site to library, with a clickable breadcrumb back. Date range
  and Reset on the right; Reset clears dates and drill path together.
- *Total Documents in EDRMS Compliant Sites* (3.47M). Single orange bars, the
  same four-level drill, its own independent date range and Reset.

Both panels show a range summary line only while a range is applied. The
always-on "Showing all declared records" note was removed by request.

**Section 2: SharePoint sites and users governance.** Two KPI cards.

- *Active Departmental Sites*. Green bars ranked by site visits, with last
  activity. 7 / 30 / 90 day window buttons and a department filter.
- *Active Users*. Deep blue bars of unique viewers. At 90 days SharePoint
  returns no unique viewer total, so it falls back to site visits and shows an
  amber note saying so.

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
57 columns of parallel data and the tests compare them against the document.
The generator converts markdown emphasis to HTML, and a test fails if any `**`
or backtick survives to the rendered page.

Sections, in order:

- **Can it be one table only?** The client asked directly, so the answer opens
  the page: two tables, and the two things that break under one.
- **Naming rule.** Columns keep the name they already have in the EDRMS
  database. `CreatedDate` stays `CreatedDate`, `ListId` stays `ListId`. JSON keys
  inside `FileMeta`, `EDRMSMeta` and `ADBMeta` become real columns keeping the
  key name. Only two names were invented, both because the existing name means
  something else: `FileModifiedDate` and `FileCreatedDate`, since `ModifiedDate`
  is the record row and `CreatedDate` is the declaration.
- **The two tables**: 37 columns and 20 columns, each a full width card over a
  numbered column table.
- **Which figure each column produces, and how to source it**: all 57 columns,
  each with the figure it feeds, a status, its exact location in
  `Database_Design_12.03_2.xlsx` (sheet and spreadsheet row) and in live
  `drm-npr`, and **the system to go to** for the ones that do not exist.
- **Where every figure comes from**: 23 figures read from the other direction.
- **Where to go for each source**: the six systems.
- **The three gaps.**

The tally under the traceability tables is **counted at render time**, never
written down, so it cannot claim a number the table does not show.

Workbook references point at sheet `4 Records`, **the 2026.1 block at rows 56 to
82**. That sheet holds an older 1.3 block above it with different column names;
quoting the wrong block is the easy mistake. `ADBMaster`, `Library`,
`PhysicalRecords` and `favoritelocations` are in the workbook but were never
built.

## Known open items

- Overview is built. The older standalone prototypes v18 and v19 remain in the
  repo as reference only; there is no v20 despite older notes referencing one.
- Department Performance and Retention are placeholders with no design yet.
- Records Management and Sites and Libraries still contain em dashes in their
  department dropdowns (`ITD — Information Technology`), inherited from the
  source prototypes and deliberately left alone. Fixing them means changing the
  separator in each `deptOptions` builder. Format and Storage is clean.
- The separate Email Records Declaration stream is out of scope; do not touch it.
