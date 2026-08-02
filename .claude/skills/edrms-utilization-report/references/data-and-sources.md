# Data model and sources

Contents:
1. Core entities
2. Source tiers
3. Production integrations
4. Known data dependencies (things that cannot be produced yet)
5. Reconciliation constraints
6. Sample data conventions

---

## 1. Core entities

**Department.** Code (for example `ITD`), name, and the managed-metadata term id
used for grouping. Department and library grouping work today. Division grouping
does not, because it depends on a backfill that has not happened.

**Site.** Name, url, created date, owner, last-activity date. Sites created is
the rollout metric.

**Library.** Name, unique SharePoint list id (`ListId`) and url, parent site.
Library display names repeat across sites, so libraries are keyed on ListId or
url, and are always shown together with their parent site. This is a hard rule,
not a preference: a bare library name is ambiguous to the reader.

**Record (declared record).** Id, title, file type, created and declared date,
library, `HasPhysical` flag (does it have a physical counterpart), retention
label, retention applied date, retention duration, computed due date for
disposal, retention status.

**Usage metrics, per site.** Site visits and unique viewers over fixed 7, 30,
and 90 day windows, from SharePoint. Unique viewer totals exist for 7 and 30
days only. At 90 days SharePoint does not return a unique viewer total, which is
why the Active Users panel falls back to site visits and explains itself.

**Storage.** Measured per site today, from Microsoft 365. Not per file.

## 2. Source tiers

Every figure in the suite belongs to one of three tiers. Knowing the tier tells
you how fresh a number can be and how expensive it is to produce.

| Tier | Meaning |
| --- | --- |
| **LIVE** | Cheap in-EDRMS counts, read on demand |
| **BATCH** | Weekly cross-system scan, cached |
| **SPO** | SharePoint usage analytics |

## 3. Production integrations

None of these are wired into the prototype. They are the targets for the real
Power BI report.

- **SharePoint / Microsoft 365 usage analytics** for site visits, unique
  viewers, and storage per site.
- **AvePoint Cloud Governance** for site creation, go-live dates, adoption tags.
- **Managed-metadata term store** for the department, division, and unit
  backfill.
- **Opus** for the physical records inventory, needed before any full physical
  records dashboard is possible.
- **PostgreSQL 16** as the EDRMS reporting store that Power BI reads.

Auth in production is Microsoft 365 / Power BI gateway auth. The prototype has
none and needs none.

Environment variable names only, never values, and never committed:
`PG_CONNECTION_STRING`, `SHAREPOINT_TENANT_URL`, `CLOUD_GOVERNANCE_API_BASE`,
`OPUS_API_BASE`.

## 4. Known data dependencies

These are figures the report shows or wants to show that **cannot actually be
produced today**. The client's standing rule is to flag them rather than let
them read as ready. The one exception recorded so far: the Format and Storage
dashboard deliberately renders no caveat, because the requester covers it
verbally during the presentation. Ask before assuming that exception extends to
anything else.

| Dependency | Blocks |
| --- | --- |
| Department, division, unit backfill onto records and sites as managed metadata | Reliable division-level grouping anywhere in the suite |
| File size captured per file | Per-library and per-format storage, so most of Format and Storage |
| Disposition status | Retention outcomes and any disposal reporting |
| Opus integration | Physical records dashboards beyond the HasPhysical flag |

## 5. Reconciliation constraints

Enforce these in code, not by hand. A `console.assert` is the cheapest possible
insurance and surfaces during verification as a console error.

- Department bars sum to the declared-records total.
- Treemap blocks across all pages sum to the in-range tile.
- Format file counts sum to Total Declared Records. Records Management exposes
  `annualRec` for exactly this, and Format and Storage asserts against it.
- Format storage values sum to the totals row.
- Share percentages sum to 100.0 after rounding. If they do not, the rounding
  needs handling rather than hiding.
- Average file size is derived, never stored: `storageGB * 1024 / files`. Derive
  anything that can be derived, so two columns cannot contradict each other.

## 6. Sample data conventions

- Sample data lives in in-file JS arrays inside each dashboard's closure, and is
  computed once at module level.
- `monthly(total, seed)` spreads an annual total across 12 months of 2026 and
  normalises exactly, so summing all 12 months returns the original total. This
  is what makes date filtering possible without changing unfiltered figures.
- `split(total, k, seed)` divides a total across k children and corrects the
  remainder onto the first child, so drill-down levels always sum to their
  parent.
- Date handling is deliberately simple: everything sits in calendar 2026, blank
  inputs mean all time, and a range is converted to whole month boundaries.
- When adding sample data, keep it plausible for a development bank and keep the
  totals reconciling. Fabricated precision is fine; fabricated inconsistency is
  not.
