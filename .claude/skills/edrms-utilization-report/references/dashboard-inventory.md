# Dashboard inventory

What exists today in `EDRMS_Reporting_Suite_Integrated_v1.html`, and what is
still a placeholder. Nav order is fixed; keep it.

| Nav entry | Key | Status |
| --- | --- | --- |
| Overview | - | Not integrated. Standalone prototypes v18 and v19 are in the repo |
| Records Management | `rm` | Built |
| Department Performance | - | Placeholder, `class="dis"` |
| Sites and Libraries | `sl` | Built |
| Format and Storage | `fs` | Built |
| Retention | - | Placeholder, `class="dis"` |

Default on load is Records Management, the first live entry.

---

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

## Known open items

- Overview is not integrated. v18 and v19 exist as standalone files; there is no
  v20 in the repo despite older notes referencing one.
- Department Performance and Retention are placeholders with no design yet.
- Records Management and Sites and Libraries still contain em dashes in their
  department dropdowns (`ITD — Information Technology`), inherited from the
  source prototypes and deliberately left alone. Fixing them means changing the
  separator in each `deptOptions` builder. Format and Storage is clean.
- The separate Email Records Declaration stream is out of scope; do not touch it.
