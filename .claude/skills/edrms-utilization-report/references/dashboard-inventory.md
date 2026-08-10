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

Default on load is Overview, the first live entry. Every entry is now a report;
there is no documentation page in the nav.

**The Data Design page was removed on 10 August.** It rendered the database
design as a reference page inside the prototype, generated from
`utilizationdb.md` by `gen_dd.py` and `build_dd.py`. **Nothing was lost:**
`utilizationdb.md` remains the design document and still carries all four tables,
every column, and the figure by figure traceability. The generators went with the
page, since they had no other target. Both are in git history if the page is ever
wanted back.

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

**Section 3: declaration over time.** Added 10 August, answering the client's
5.1.2 and 5.1.4. *Records Declared This Month* and *Records Declared This Year*,
over a twelve month bar chart and a per year comparison since 2023.

Both read one column, `CreatedDate`, which is populated today, so neither waits
on the scan or the usage feed. The twelve monthly bars are summed from the
department data rather than typed, and an assertion ties their total to
`ANNUAL_REC`, so the chart cannot drift from the KPI above it.

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

## Known open items

- Overview is built. The older standalone prototypes v18 and v19 remain in the
  repo as reference only; there is no v20 despite older notes referencing one.
- `verify.js` still understands `kind:"reference"`, which no module now returns.
  That is deliberate: it is generic infrastructure for any future documentation
  page, not leftovers from this one.
- **Department Performance is the only placeholder left.** Most of its data now
  exists: the site inventory covers owners, libraries, users and visits per site,
  and the drill covers the rest. What it needs is a screen, not a source.
- Em dashes are gone from the whole page. The department dropdowns use a hyphen
  and the pre-init KPI placeholders an ellipsis, so the rule holds everywhere for
  the first time. `verify.js` fails on any that come back.
- The separate Email Records Declaration stream is out of scope; do not touch it.
