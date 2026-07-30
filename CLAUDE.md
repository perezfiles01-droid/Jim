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

**Status: done.** Delivered as `EDRMS_Reporting_Suite_Integrated_v1.html`.

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
| Frameworks | None. Single-file prototypes, no framework, no bundler, no build step. Production target is Power BI Desktop / Service, not a JS framework. |
| Database | None in the prototype (sample data lives in in-file JS arrays). Production target: PostgreSQL 16 as the EDRMS reporting store, read by Power BI. |
| Package manager | None for the prototypes (zero dependencies). npm is used only for optional Node deliverable scripts. |

**Other key deps** (for generated deliverables only, not the dashboard
runtime): Node.js with pptxgenjs (PPTX), Python 3 with openpyxl (XLSX), docx-js
(Word).

## 4. Where the code lives

**Repo:** `perezfiles01-droid/Jim` (the repo attached to this session, and the
only one currently available). Confirm if a different owner/repo is intended.

**Layout: single file. The `index.html` + `assets/` + `dashboards/` split
originally proposed here was dropped.** The requester's goal was that the
prototype stop being a hassle to open, and a split folder means keeping several
files together and serving them over a local HTTP server. One self-contained
file just opens by double-click. The internals are still organized (see below),
just concatenated into one deliverable.

**Entry point:** `EDRMS_Reporting_Suite_Integrated_v1.html`

**How that file is structured internally:**

- Shared shell CSS (tokens, sidebar, header, `.band`, `.kpi`, `.panel`,
  `.pager`) is global.
- Each dashboard's own CSS is **scoped** under a container class, `.dash-sl` for
  Sites and Libraries and `.dash-rm` for Records Management. This is required,
  not cosmetic: the two source prototypes use the same class names with
  different values. `.sbar` is `200px 1fr 210px` in one and `210px 1fr 72px` in
  the other, and the `.seg.e` / `.seg.p` segment colours are **inverted**
  between them. `.kpis`, `.drange`, `.resetbtn`, `.legend`, and `select` also
  differ.
- Each dashboard's JS lives in its own IIFE in `DASHBOARDS.sl` / `DASHBOARDS.rm`,
  exposing `{ver, crumb, asof, html, init}`. Only `F()` and `wirePager()` are
  shared, because only those two were byte identical. `pager()` and
  `deptOptions()` differ per dashboard and stay private: the Sites and Libraries
  `pager()` prints a row count on a single page, the Records Management one
  returns an empty string.
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
  `python3 -m http.server 8000` and open `http://localhost:8000`.
- **Tests:** none automated yet. Verify manually against the acceptance
  checklist in section 2.
- **Lint/typecheck:** none configured.
- **Optional deliverable scripts** (if present): `node build-deck.js`,
  `python3 build-workbook.py`.

## 10. Code in this repo

**Deliverable:**

- `EDRMS_Reporting_Suite_Integrated_v1.html` - Sites and Libraries + Records
  Management in one navigable file. See section 4 for its internal structure.

**Source prototypes** (kept for reference, superseded by the integrated file):

- `EDRMS_Sites_and_Libraries_Dashboard_v1.html`
- `EDRMS_Records_Management_Dashboard_v3.html`
- `EDRMS_Reporting_Suite_Prototype_v18.html`
- `EDRMS_Reporting_Suite_Prototype_v19.html`

Each is a self-contained HTML file with inline CSS and a single `<script>`
holding both sample data and render logic. Note that the Overview prototype
referenced elsewhere as `v20` is **not** in this repo; the highest Overview
versions available are v18 and v19.

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
