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

**Task:** Consolidate the standalone dashboard prototypes (Overview, Records
Management, Sites and Libraries) into one navigable single-page Reporting Suite
prototype: shared left-nav, shared header, and shared reusable components (KPI
cards, stacked bars, treemap, sortable paginated tables,
date-range-with-reset), all driven from one sample-data module.

**Acceptance:** Opening one HTML file shows a working left-nav that switches
between the dashboards; every KPI card, drill-down, sort control, date range,
reset, and pager works; all sample numbers still reconcile (department and
library totals add up, treemap blocks sum to the in-range tile); no console
errors.

**Out of scope:** No backend, no real data connection, no Power BI file, no
build tooling. Do not restyle away from the ADB look. Do not touch the separate
Email Records Declaration stream.

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

**Directory layout** (proposed for the consolidated prototype):

```
/
├── index.html                    # entry point, shell + nav, loads the rest
├── assets/
│   ├── styles.css                # ADB tokens + shared component styles
│   ├── data.js                   # single sample-data module (departments, sites, libraries, records)
│   └── components.js             # shared render helpers (kpiCard, stackedBar, treemap, table, pager, dateRange)
└── dashboards/
    ├── overview.js
    ├── records-management.js
    └── sites-and-libraries.js
```

**Entry point:** `index.html`

**Note:** the current prototypes are each a single self-contained `.html` file.
The task in section 2 is to refactor them into the layout above.

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

## 10. Existing code to work against

The current standalone prototypes to refactor (latest versions):

- `EDRMS_Sites_and_Libraries_Dashboard_v1.html`
- `EDRMS_Records_Management_Dashboard_v3.html`
- `EDRMS_Overview_Prototype_v20.html`

Each is a self-contained HTML file with inline CSS and a single `<script>`
holding both sample data and render logic.

**Status: these files have not yet been added to this repo.** They need to be
provided (committed here, or pasted in) before the section 2 refactor can begin.
