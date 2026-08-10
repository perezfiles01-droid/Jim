# EDRMS Reports Utilization 2026.4

A working prototype of the report specified in **R2026.4 Utilization Report,
Proposed Metrics**. One self contained HTML file, eleven pages, 104 metrics.

This is a **new report**, not a revision of the earlier EDRMS Utilization
Report. The requirement asks for a different structure, a wider scope and, in
several places, different definitions. What the two have in common was kept and
rebuilt; what the requirement does not ask for was removed, division included.
`REQUIREMENTS.md` records every one of those decisions line by line.

**Live link, once Pages is on:** <https://perezfiles01-droid.github.io/Report/>
See `DEPLOY.md` for how to get there.

---

## What is in here

| File | What it is |
| --- | --- |
| `index.html` | **The report.** One file, no dependencies. Open it by double click |
| `REQUIREMENTS.md` | Every line of the requirement, mapped to the panel that carries it. Plus what was removed and why, and the six things the requirement leaves open |
| `DATA_SOURCES.md` | What the tenant can actually supply, tier by tier, grounded in the test tenant investigation |
| `DEPLOY.md` | Creating the repository, uploading, turning on GitHub Pages |
| `build.py` | Rebuilds `index.html` from `src/` |
| `verify.js` | 231 browser assertions. Run it after any change |
| `src/` | The 16 sources `index.html` is built from |

---

## The eleven pages

| Page | Requirement section |
| --- | --- |
| Bankwide oversight | 1, Impact statistics and executive summary |
| Risk and compliance | 2, Risk indicators, site health, site trends, library usage |
| Department insight | 3, Departmental overview, drilldown, conventions, programme dates |
| Records management | 5, Declaration, declaration performance, records quality |
| File plan insights | 4, Institutional file plan terms |
| Archives holdings | 6, Physical holdings, inventory health, storage locations |
| Format and storage | 7, Declared records by format, storage by format |
| Retention and disposition | 8, Retention dashboard, compliance, disposition risk |
| Security and classification | 9, Access management, information classification |
| Search and usage | 10, Information retrieval, top content |
| Data sources | Not in the requirement. See below |

**Data sources** is the one page the requirement did not ask for, and it is the
one to read first. It lists all 104 metrics against the thing in the tenant that
would actually produce each of them, and what has to happen before it exists.
A dashboard that shows a number without saying where it comes from is a mock up,
and a mock up is what gets signed off and then cannot be built.

---

## The feasibility chips

Every KPI card and every panel carries a chip saying which of nine sources the
number would come from. They are not decoration; they are the honest answer to
"can we actually have this?"

| Chip | Meaning | Metrics |
| --- | --- | --- |
| Ready today | A query against `public."Records"`, nothing else needed | 27 |
| Document scan | Needs the Microsoft Graph file scan job | 13 |
| Usage feed | Needs the M365 usage job | 16 |
| Site mapping | Needs the site to department mapping list | 11 |
| App detection | Needs to know which sites carry the EDRMS app | 7 |
| Term store | Needs read access to the managed metadata file plan | 7 |
| Reference list | A short maintained list somebody owns | 5 |
| Purview | Needs Purview and audit log access | 5 |
| Opus | Needs the physical records inventory connected | 13 |

The whole of `DATA_SOURCES.md` is an expansion of that table.

---

## The numbers

The figures are **illustrative samples**, not tenant extracts. They are shaped
to look like ADB at this stage of rollout so the layout can be judged honestly,
and they are internally consistent so nobody has to wonder whether a
disagreement between two pages is a data problem or a bug.

That consistency is enforced rather than hoped for. `src/data.js` derives every
total from the rows beneath it and asserts ten reconciliations at load: format
file counts equal declared records, the classification split equals declared
records, department sites equal field office sites equal project type sites,
facility holdings equal the physical total, and so on. Break one and the browser
console says so immediately.

No real staff names, no credentials, no tenant data.

---

## Working on it

```bash
python3 build.py                 # rebuild index.html from src/
node verify.js                   # 231 assertions in headless Chromium
```

`verify.js` needs `playwright-core` and a Chromium binary. It checks that every
page mounts, every control works, the totals reconcile across pages, there are
no duplicate element ids, no `undefined` or `NaN` reaches the screen, no em
dashes appear in visible text, and nothing overflows horizontally at 1440 or
1024 pixels.

**Never edit `index.html` directly.** It is generated. Edit `src/` and rebuild.

### How the sources fit together

```
src/shell.html   the page skeleton and the left nav
src/shell.css    tokens, sidebar, cards, panels, tables, chips
src/core.js      DASHBOARDS registry, formatting, and every render component
src/data.js      sample data plus the reconciliation assertions
src/bo.js …      one file per dashboard, each an IIFE registering itself
src/app.js       nav wiring, must load last
```

Every dashboard is written against the shared components in `core.js` rather
than hand rolled markup. With eleven pages that is the only thing that keeps
them looking like one report: a page cannot invent its own bar chart.

Only one dashboard is in the DOM at a time. `switchTo(key)` replaces `#view`, so
each module is free to use its own element ids without checking what another
module took. Per page state, the selected department, the sort column, the page
number, lives in the module closure and survives switching away and back.

---

## House rules carried over from the previous report

- **No em dashes in visible text.** Commas, colons, parentheses or hyphens.
  `verify.js` fails the build if one appears.
- **The ADB palette.** Navy `0E1F35` and `10243E`, blue `0072BC`, teal
  `00A5A8`, green `5CA943`, grey blue `9DB8D2`.
- **KPI cards show a title, a number and a source chip.** Nothing else.
- **Always show a library with its parent site.** Library names repeat across
  sites, so a library name alone is ambiguous.
- **Sample numbers must reconcile.** Enforced, see above.
- **Only visuals Power BI can reproduce natively.** Columns, bars, donuts,
  tables, treemaps. The production target is Power BI, and a prototype that
  shows something Power BI cannot draw is a promise nobody can keep.
