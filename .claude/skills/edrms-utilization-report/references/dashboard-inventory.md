# Dashboard inventory

What exists today in the site, and what is still a placeholder. Nav order is
fixed; keep it. Each built dashboard owns one banner marked CSS block and one
banner marked JS block inside `index.html`; a change to one should never require
touching another's blocks.

| Nav entry | Key | Blocks | Status |
| --- | --- | --- | --- |
| Overview | `ov` | `overview` blocks | Built, the default on load |
| Records Management | `rm` | `recordsmanagement` blocks | Built |
| Sites and Libraries | `sl` | `sitesandlibraries` blocks | Built |
| Format and Storage | `fs` | `formatandstorage` blocks | Built |
| Retention & File Plan | `rt` | `retention` blocks | Built |

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
  activity, **a date range** and a department filter.

**The period control, settled 12 August.** Five choices: Last 7 / 30 / 90 / 180
days, and By month with a year and month picker.

**There is deliberately no day level calendar**, and that is the important part.
A week is the smallest period the data holds. Asked for 8 to 15 January, the
stored weeks are 4 to 10 and 11 to 17: the range cuts through both and neither
can be split. The three possible answers are 134 (every week touched, but that
is really 4 to 17), 0 (only whole weeks inside), or 78 (pro-rated). The last one
invents data and would be quoted as fact, which is unacceptable in a records
report. Constraining the input means a reader cannot ask a question the data
cannot answer.

A preset **reads one stored figure** from the newest row. By month **sums the
weekly tiles** whose refresh date falls in the month. Both are exact, and the
panel prints the period actually covered underneath.

Three rules the panels follow, and they are not interchangeable:

- **A range sums `SiteVisits7`**, never `SiteVisits30` or `SiteVisits90`.
  Consecutive 7 day windows tile exactly; 30 and 90 day windows overlap, so four
  weekly readings would count most days four times.
- **Distinct people are never summed.** Someone active in four weeks is one
  person. The bankwide figure counts distinct `UserPrincipalName` across the
  snapshots in the range, which is the only correct way to answer it.
- **The range cannot start before `HISTORY_START`**, the first refresh. The date
  inputs carry `min`, so an earlier date cannot be picked rather than silently
  returning nothing. History never captured cannot be recovered.

`check_daterange.js` covers all three, including that narrowing the range lowers
the figure and Reset restores it.
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

## Retention and File Plan (`rt`)

Data as of Mon 20 Jul 2026 23:59, refreshed Tue 21 Jul 06:00.

Built rather than left a placeholder because the data was already there.
`Records` carries `EDRMSDueDateForDisposal`, computed as label applied plus
duration, so records due for disposal is a count and next due date is a `MIN()`
over a column that exists today.

**The file plan lives here rather than on its own dashboard.** Two KPI cards and
five bars did not earn a nav entry, and the pairing is more than tidiness: in
records management the file plan and the retention schedule are the same
governance artifact seen from two sides. The plan says how content is classified;
retention says how long each class is kept.

Sections, in order:

- **Disposal pipeline.** Two static KPI cards, *Records Due for Disposal, next 12
  months* (608) and *Next Due Date for Disposal*, over a sortable table of 15
  libraries: library, site, records held, due within 12 months, next due date,
  inactive over 1 year. Tiles show the 30 day, 90 day and 12 month horizons,
  which nest by construction and are asserted to.
- **Retention compliance.** Records with and without a retention schedule, and
  records already past their disposal date.
- **Institutional file plan.** The five top level groups sized by term count,
  each showing its term set count and depth.
- **Retention profile.** Declared records by label, seven rows. Five retention
  periods plus two that are not periods at all: **Others**, for labels outside
  the standard 3, 5, 7 and 10 year set, and **No retention label**, for records
  whose label was removed. Each is drawn in its own colour so neither reads as a
  retention period, and each carries a one line explanation the way `Permanent`
  already did.

**`No retention label` and the compliance panel's "without a schedule" are the
same population**, so `NO_LABEL` is read from the `LABELS` array and
`WITH_SCHEDULE` is derived from it. Typing the figure twice is how two panels on
one dashboard start disagreeing.

`PERMANENT` (2,460) is a named constant excluded from every disposal figure, with
an assertion enforcing it. A second assertion ties the label total to
`DASHBOARDS.rm.summary.declared`.

**A record with no retention schedule has no due date**, so it sits outside every
disposal figure. That is why it is counted separately rather than left to vanish.

**Beyond retention does not mean still awaiting action.** Nothing records whether
a disposal was carried out. The four client metrics needing disposal state
(8.1.4, 8.1.5, 8.1.6, 8.3.3) are deliberately absent: they need a `DisposalStatus`
field the EDRMS application does not have.

**Inactive over 1 year is the one figure here that is not ready.** It needs the
document scan, because an untouched document has no row until the scan creates
one.

### The file plan source is the weakest claim in the suite

The panel assumes the file plan lives in the **SharePoint term store**. It may
instead live in **Microsoft Purview**, whose Records management area has a literal
File plan feature where retention labels carry classification descriptors. For an
EDRMS that is at least as likely. We know the term store holds departments and
divisions; we do not know it holds a file plan.

**Two tests settle it**, both a couple of minutes, and neither has been run:

- SharePoint admin centre, Content services, Term store. Is there a file plan
  group beside Department and Division?
- `https://purview.microsoft.com`, Solutions, Records management, File plan. Are
  the descriptors filled in?

If it turns out to be Purview, the panel keeps its shape and only the source side
is rewritten. The tree walking problem below disappears, since Purview returns
labels as a flat list.

Assuming the term store, three Graph calls, needing `TermStore.Read.All`:

```
GET /termStore/groups                    the categories
GET /termStore/groups/{groupId}/sets     the sets inside one
GET /termStore/sets/{setId}/children     the terms at one level
```

**The wrinkle worth knowing before anyone estimates it:** a file plan is a tree
and the API returns one level at a time, so counting every term under a category
means walking down through each level rather than reading a total. A loop, not a
blocker. `Depth` is recorded while walking at no extra cost.

**Every figure on that panel is invented**: the five category names, the counts,
the term set numbers, the depths. That is true of the whole prototype, but it
matters more here, because elsewhere the column a number will come from is known
and here even the system is not.

## KPI cards: interactive or static, never ambiguous

A card carrying the `.tap` chevron ("Click to open") promises a click. A card
without one promises nothing. **The two must never disagree**, and
`check_affordance.js` fails the build when they do.

| Class | Means | Looks like |
| --- | --- | --- |
| `.kpi` with `.tap` | Wired to a handler, toggles a panel | Pointer cursor, hover lift, blue rail when selected |
| `.kpi.stat` | Its panel is always open below it | No pointer, no hover, grey rail, a `.sub` line of context |

11 cards are interactive, 13 are static. Before 10 August every static card
still said "Opened below" and carried the selected-state rail, so readers clicked
them and thought the page had hung. That is what the check exists to prevent.

**A static card earns its second line.** Rather than a dead chevron, each carries
a `.sub` that says something the number alone does not: how many of a total, what
the comparison is, what is excluded.

## No caveat boxes

The amber `.note` panels were removed on 10 August, along with their CSS. Where a
note explained something a reader genuinely needs to trust the screen, that
sentence moved into the panel subtitle in ordinary text. The clearest case is
Total EDRMS Users: the per site bars sum to more than the bankwide figure,
and without a word of explanation that reads as a broken report rather than two
correct numbers answering different questions.

Caveats about what is not yet buildable belong in `STATUS.md` and the workbook,
which are read by the build team, not on a dashboard read by RAC.

## Known open items

- Overview is built. The older standalone prototypes v18 and v19 remain in the
  repo as reference only; there is no v20 despite older notes referencing one.
- `verify.js` still understands `kind:"reference"`, which no module now returns.
  That is deliberate: it is generic infrastructure for any future documentation
  page, not leftovers from this one.
- **No placeholders remain in the nav.** Department Performance was removed on
  10 August. Most of what it would have shown now lives elsewhere: the site
  inventory covers owners, libraries, users and visits per site, and the Records
  Management drill covers declarations by department.
- Em dashes are gone from the whole page. The department dropdowns use a hyphen
  and the pre-init KPI placeholders an ellipsis, so the rule holds everywhere for
  the first time. `verify.js` fails on any that come back.
- The separate Email Records Declaration stream is out of scope; do not touch it.
