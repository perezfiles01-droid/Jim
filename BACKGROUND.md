# ADB EDRMS Utilization Report (Reporting Suite)

Project context for the ADB EDRMS Utilization Report. This file is the durable
source of truth for the project's purpose, stack, conventions, and data model.
Read it before starting work.

## 1. What ADB is

**One-liner:** ADB = Asian Development Bank. This project is the EDRMS
Utilization Report (the "Reporting Suite"), a set of dashboards that show how
the bank is adopting and using its EDRMS (Electronic Document and Records
Management System, vendor: AvePoint, running on SharePoint / Microsoft 365).

**Domain/purpose:** Records and IT governance stakeholders (the RAC committee
and ITD) use it to see declaration activity, site and library adoption, storage,
and retention across departments, so they can track EDRMS rollout and target
follow-up.

**Current state:** Partial prototype. Multiple standalone, single-file HTML
prototypes exist (Overview, Records Management, and Sites and Libraries) using
in-file sample data. The production target is Power BI. No backend or live data
connection has been built yet.

## 2. What to build first

**Status: done.** Delivered as the static site described in section 4.

**Task (as narrowed by the requester):** Integrate **two** dashboards, Sites and
Libraries plus Records Management, into one navigable prototype. Overview was
explicitly dropped from this pass. Everything was to stay exactly as it was in
the source prototypes except one change: in Sites and Libraries, the date range
filter on the "Sites created by department" panel moves to the right side of the
panel.

**Acceptance:** Opening one HTML file shows a working left-nav that switches
between the dashboards; every KPI card, drill-down, sort control, date range,
reset, and pager works; all sample numbers still reconcile (department and
library totals add up, treemap blocks sum to the in-range tile); no console
errors.

**Out of scope:** No backend, no real data connection, no Power BI file, no
build tooling. Do not restyle away from the ADB look. Do not touch the separate
Email Records Declaration stream.

**Follow-up changes since the first integration:**

1. The "Total Documents in EDRMS Compliant Sites" panel gained a date range and
   Reset filter, matching the one on "Total Declared Records" in position, style,
   and behaviour. This required a new `mdocs` monthly distribution on each
   department, since only `mrec` and `mphys` had one. Reset clears the dates and
   the drill path together, same as the records panel.
2. The always-on note under "Total Declared Records" ("Showing all declared
   records: 21,646. No date range applied.") was removed. The subtotal line now
   appears **only while a date range is actually applied**, on both panels, and
   is hidden entirely otherwise so it leaves no blank gap. The unfiltered total
   is already on the KPI card above, so the note was redundant; the filtered
   total is not shown anywhere else, so that variant was kept.

3. **Format and Storage added as a third dashboard**, built from an approved
   mockup. Structure follows the Sites and Libraries section-1 pattern: one
   band, then two KPI cards that are always open with their panel beneath, no
   click-to-toggle. Panel 1 is a four-column table (format, number of files,
   storage GB, avg file size MB) with in-cell bars scaled per column, a sort
   picker (Files, Storage, Avg file size) with a highest/lowest toggle, the
   active sort column highlighted in blue, and a totals row. Panel 2 is a
   horizontal bar chart of declared records by format with count and share.
   Decisions taken with the requester: KPI 1 shows total storage `46.7 GB`,
   KPI 2 shows the format name `PDF` (a deliberate exception to the
   title-and-number-only rule, since the value is categorical), default sort is
   Files highest first, and **no data dependency note is rendered** because it
   is covered verbally in the presentation.

   Average file size is **derived, never stored**: `storageGB * 1024 / files`.
   The eight format file counts are a decomposition of Total Declared Records,
   so they must sum to `ANNUAL_REC`. The Records Management module exposes
   `annualRec` for this, and Format and Storage runs a `console.assert` at load
   so the two dashboards cannot silently drift apart if department data changes.

**Known deviation, deliberately left alone:** both source prototypes emit em
dashes in visible text, which breaks the hard rule in section 8. They appear in
the department dropdown options (`ITD — Information Technology`) and as KPI
placeholder glyphs. These were inherited verbatim rather than fixed, because the
requester asked for exactly one change. Worth fixing in a later pass: the fix is
to change the separator in each `deptOptions` builder.

## 3. Tech stack

| Concern | Choice |
| --- | --- |
| Language | HTML5 + CSS3 + vanilla JavaScript (ES2020), no transpiler |
| Frameworks | None. Static site, no framework, no bundler, no build step. Classic scripts, not ES modules, so index.html also opens from disk. Production target is Power BI Desktop / Service, not a JS framework. |
| Database | None in the prototype (sample data lives in in-file JS arrays). Production target: PostgreSQL 16 as the EDRMS reporting store, read by Power BI. |
| Package manager | None for the prototypes (zero dependencies). npm is used only for optional Node deliverable scripts. |

**Other key deps** (for generated deliverables only, not the dashboard
runtime): Node.js with pptxgenjs (PPTX), Python 3 with openpyxl (XLSX), docx-js
(Word).

## 4. Where the code lives

**Repo:** `perezfiles01-droid/Jim` (the repo attached to this session, and the
only one currently available). Confirm if a different owner/repo is intended.

**Layout: one self-contained `index.html`.** Published with GitHub Pages, and
it also opens by double click. No other files, no build step, no dependencies.

**Why one file, after trying the alternatives.** This went single file, then per
dashboard folders, then flat per dashboard files, and back to single file. The
deciding constraint is that the only write path available is the GitHub web
uploader, driven by hand. Folders were flattened and files were silently
dropped. Flat files worked, but a change touching four of them meant four
downloads and a seven file upload, every time, and each of those is a chance to
miss one. One file means one download and one upload, always.

The isolation that motivated splitting is preserved inside the file rather than
by the filesystem. Each dashboard is a banner marked block holding its own
scoped CSS and its own closure, so editing one still means editing inside its
block and nothing else, and the diff still shows only that block changed. That
is what actually protects the other dashboards, not the file boundary.

Do not split this up again unless the write path changes to real git pushes.

**How the code is organised inside that structure:**

- Shared shell CSS (tokens, sidebar, header, `.band`, `.kpi`, `.panel`,
  `.pager`) sits in the first block of the `<style>` element.
- Each dashboard's CSS is **scoped** under a container class, `.dash-sl`,
  `.dash-rm`, `.dash-fs`. This is required, not cosmetic: the two source
  prototypes use the same class names with different values. `.sbar` is
  `200px 1fr 210px` in one and `210px 1fr 72px` in the other, and the
  `.seg.e` / `.seg.p` segment colours are **inverted** between them. `.kpis`,
  `.drange`, `.resetbtn`, `.legend`, and `select` also differ.
- Each dashboard's JS is an IIFE in its own banner marked block registering into
  `DASHBOARDS.sl` / `.rm` / `.fs`, exposing `{ver, crumb, asof, html, init}`.
  Only `F()` and `wirePager()` are shared, because only those two were byte
  identical. `pager()` and `deptOptions()` differ per dashboard and stay
  private: the Sites and Libraries `pager()` prints a row count on a single
  page, the Records Management one returns an empty string.
- **Only one dashboard is mounted in the DOM at a time.** `switchTo(key)`
  replaces `#view`, so both dashboards keep their original element ids
  (`s1-detail`, `s2-kpis`, and so on) with no renaming and therefore no risk of
  a missed reference. Nav switching also swaps the sidebar subtitle, breadcrumb,
  and the per-dashboard "data as of" line.
- Per-dashboard state (drill path, page, sort field, direction, which KPI is
  open) persists across nav switches via the IIFE closure. Date input values do
  not, since they are DOM state and the markup is replaced. Blank dates mean all
  time, so the numbers stay correct either way.

## 5. Data model / core entities

From the EDRMS database design and the prototype sample data:

- **Department:** code (e.g. ITD), name, and the managed-metadata term id used
  for grouping. NOTE: reliable department/division/unit grouping depends on the
  ADB master list being backfilled onto records and sites as managed metadata.
  Department and library grouping work today, division does not yet.
- **Site:** name, url, created date, owner, last-activity date. Sites created is
  the rollout metric.
- **Library:** name, unique SharePoint list id (ListId) and url, parent site.
  IMPORTANT: library display names repeat across sites, so libraries are keyed
  on ListId/url and always shown together with their parent site.
- **Record (declared record):** id, title, file type, created/declared date,
  library, HasPhysical flag (does it have a physical counterpart), retention
  label, retention applied date, retention duration, computed
  due-date-for-disposal, retention status.
- **Usage metrics (per site):** site visits and unique viewers over fixed 7, 30,
  and 90 day windows (SharePoint). Unique-viewer totals exist for 7 and 30 days
  only, not 90.
- **Storage:** measured per site today (M365), not per file. Per-library and
  per-format storage are data dependencies (need file size captured per file).

**Term store findings, verified in the tenant (Aug 2026).** These were checked
directly rather than assumed, because the project notes had recorded department
and division grouping as blocked without saying what exactly was missing.

- `Department Owner`, `Division`, `Record Department Owner`, `Record Division
  Owner` and `Record Unit Owner` are all **Managed Metadata** columns on the
  `ADB Baseline Document` content type, so the structure was never the problem.
- The **`Department` term set exists and is populated** with real ADB codes
  (ADBI, BIOC, BOD, BPMSD, CCSD, CRPN, CSD, CTL, CWRD and more beyond the first
  visible page). It is flat.
- The **`Division` term set is hierarchical**: each department code is a parent
  that expands to the divisions within it. So the department to division
  relationship is already modelled in the term store, and the drill down in
  Records Management is achievable without inventing a mapping.
- **Both column pairs share vocabularies.** `Department Owner` and `Record
  Department Owner` both bind to `Department`; `Division` and `Record Division
  Owner` both bind to `Division`. Choosing between the pairs is a question of
  which one is authoritative and gets populated, not of different value sets.
  Still open with the client.
- The real department codes **do not match the prototype's sample data** (ITD,
  SARD, OSFG and so on are invented; only CWRD happens to coincide), and there
  are likely far more than the fifteen or sixteen the dashboards assume. Sample
  data will need replacing wholesale, and pagination and treemap paging should be
  rechecked against the real count.
- Nothing is populated. No library default is set and no document carries a
  value, which is why every record shows an empty field.

**So the remaining work is a backfill, not a vocabulary build.** Two separate
tracks, and neither substitutes for the other: set column defaults per library or
folder so new documents inherit a value, and stamp existing documents through
Edit in grid view for small volumes or PnP PowerShell or Power Automate for
large ones. Defaults never apply retrospectively.

**The real blocker is the site to department mapping**, which is a records
decision rather than a technical one. Worth checking whether AvePoint Cloud
Governance already captured the owning department when each site was
provisioned, in which case the mapping may already exist.

**Site inventory** comes from SharePoint admin centre, Sites, Active sites,
which exports to CSV with site name, url, storage, created date and last
activity. That export feeds the mapping exercise and several Sites and Libraries
figures directly. It lists every site in the tenant though, not just EDRMS
compliant ones, so identifying the compliant subset is still open: candidates
are a naming convention, the `EDRMS Site Type` term set, or AvePoint's records.

**Access note.** The term store showed "view-only access to this term group",
so changes there need whoever holds Term Store Admin, usually ITD.

**Data-source tiers** used across the suite:

- **LIVE:** cheap in-EDRMS counts read on demand.
- **BATCH:** weekly cross-system scan, cached.
- **SPO:** SharePoint usage analytics.

## 6. API contracts / interfaces

None currently. The prototypes are static and read from the in-file sample-data
module. In production, Power BI connects directly to the data sources
(PostgreSQL, SharePoint, AvePoint Cloud Governance, Opus); there is no custom
REST API in scope.

The shared JS render helpers are the only "interface" to match:

```js
kpiCard({ title, value })
stackedBar({ rows, max })
treemap({ items })
sortableTable({ rows, sortField, dir, page })
dateRangeWithReset()
```

## 7. External integrations

Production targets, not wired in the prototype:

- **SharePoint / Microsoft 365 usage analytics:** site visits, unique viewers,
  storage per site.
- **AvePoint Cloud Governance:** site creation, go-live dates, adoption tags.
- **Managed-metadata term store:** department/division/unit backfill.
- **Opus:** physical records inventory, needed for full physical dashboards.

**Auth model:** Microsoft 365 / Power BI gateway auth in production. None in the
prototype.

**Config:** No secrets or env vars in the prototype. Production env var names
only (values are never committed): `PG_CONNECTION_STRING`,
`SHAREPOINT_TENANT_URL`, `CLOUD_GOVERNANCE_API_BASE`, `OPUS_API_BASE`.

## 8. Conventions and constraints

**Code style:** No formatter enforced on the prototypes. Keep 2-space indent,
plain ES2020, no external libraries.

**Patterns to follow:**

- One shared sample-data module.
- Small pure render helpers that return HTML strings.
- Click-to-open panels, with the first KPI in a section open by default.
- Pagination at 10 rows per page.
- Date ranges blank by default (blank means all), with a Reset that clears
  filters and returns to page 1.
- Treemap for "largest / most" magnitude views, sized and single-hue shaded by
  value.
- Sort controls offer a field picker plus a highest/lowest toggle.

**Hard rules:**

- No em dashes anywhere in visible text. Use commas, colons, parentheses, or
  hyphens.
- Keep the ADB palette: navy `0E1F35` / `10243E`, blue `0072BC`, teal `00A5A8`,
  green `5CA943`, grey-blue `9DB8D2`.
- KPI cards show title and number only.
- Always show a library with its parent site.
- Label vendor or preliminary numbers as estimates, and flag data dependencies
  (department backfill, per-file storage, disposition status, Opus) rather than
  presenting them as ready.
- Sample numbers must reconcile.

## 9. How to run and verify

- **Install:** none (no dependencies).
- **Run locally:** open `index.html` in a browser, or serve the folder with
  `python3 -m http.server 8000` and open `http://localhost:8000`. Check both,
  since only the served run catches a broken asset path or a 404.
- **Live site:** published with GitHub Pages from `main` at the repository root.
  Enable under Settings, Pages, Source "Deploy from a branch", branch `main`,
  folder `/ (root)`.
- **Tests:** none automated yet. Verify manually against the acceptance
  checklist in section 2.
- **Lint/typecheck:** none configured.
- **Optional deliverable scripts** (if present): `node build-deck.js`,
  `python3 build-workbook.py`.

## 10. Code in this repo

**Deliverable:**

- `EDRMS_Reporting_Suite_Integrated_v1.html` - Sites and Libraries + Records
  Management in one navigable file. See section 4 for its internal structure.

**Overview prototypes still present** (not yet integrated):

- `EDRMS_Reporting_Suite_Prototype_v18.html`
- `EDRMS_Reporting_Suite_Prototype_v19.html`

Note that the Overview prototype referenced elsewhere as `v20` is **not** in this
repo; the highest Overview versions available are v18 and v19.

**Source prototypes, deleted from the working tree** once the integrated file
superseded them. They are still in git history and can be recovered from commit
`bf0b56a` if the integration ever needs to be diffed against its sources:

- `EDRMS_Sites_and_Libraries_Dashboard_v1.html`
- `EDRMS_Records_Management_Dashboard_v3.html`

Recover with `git show bf0b56a:<filename> > <filename>`.

Every one of these is a self-contained HTML file with inline CSS and a single
`<script>` holding both sample data and render logic.

**This file is named `BACKGROUND.md`, not `CLAUDE.md`.** A short `CLAUDE.md`
stub sits alongside it and points here, because `CLAUDE.md` is the filename that
gets loaded automatically at the start of a session. Keep the stub in place, or
this file stops being picked up on its own.

## 11. Verification

The integrated prototype was checked in headless Chromium (Playwright driving
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`) across 100 assertions
covering: nav switching and header swaps, KPI totals, the four-level drill down,
date range filtering and reset, pagers, sort field and direction toggles,
department filters, the 90-day unique-viewer fallback note, treemap
reconciliation (in-range tile equals the sum of its blocks), the scoped CSS
values that differ between the two dashboards, absence of duplicate element ids,
and no horizontal overflow. Result: 100 of 100 passing, no console errors.

There is no automated test committed. Re-verify manually against the acceptance
checklist in section 2 after changes.
