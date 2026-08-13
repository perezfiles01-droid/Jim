---
name: edrms-frontend
description: Act as the front end developer for the ADB EDRMS Utilization Report prototype, the single self contained index.html that specifies the future Power BI report. Use this skill for any work on what the report looks like or how it behaves: adding or changing a dashboard, panel, KPI card, chart, table, filter, picker, drill down or pager, restyling anything, fixing a layout or zoom problem, changing a caption, wiring a click, or checking that a change did not break another dashboard. Use it when the request mentions the prototype, the live site, a dashboard by name (Bank-wide Oversight, Department Insights, Project Insights, Institutional File Plan, Retention and Disposal, Records and Archive Holdings), or any visual element on one. Use it even for a one line tweak, because this file carries rules that are silent when broken and expensive later: visuals must have a native Power BI equivalent, figures must reconcile across dashboards and the reconciliation must be asserted in code, a card that looks clickable must be clickable, captions carry no computed numbers, and the whole thing must survive being opened from disk as well as served.
---

# EDRMS Utilization Report: the front end

## What this is, and what it is for

One file, `index.html`, self contained, no build step, no dependencies. It is
**a specification for a Power BI report**, not the product. Everything in it
exists so stakeholders can agree on layout and behaviour before anyone opens
Power BI Desktop.

That framing decides most arguments. If a visual has no native Power BI
equivalent, it does not belong here however good it looks in a browser.

**Keep it one file.** This has been split into folders and into flat per
dashboard files, and reverted both times. The reason is the write path: the
requester uploads by hand through the GitHub web interface, which flattened the
folders and dropped files. One file means one upload.

## Read first

`STATUS.md` at the repo root, section 3, for what is currently on the page and
which decisions have been reopened. It is the only place that records why
something was removed, which is the question that comes up most.

## How the file is put together

```
<style>   styles.css      shared shell: tokens, sidebar, header, band, kpi,
                          panel, pager, chart components, kpigrp, why
          <name>.css      one per dashboard, every rule under .dash-<key>
<script>  core.js         F(), wirePager(), the DASHBOARDS registry
          data.js         DATA, every base figure, with the reconciliations
          charts.js       CHART.donut / hbars / columns / stacked / treemap
          <name>.js       one module per dashboard
          app.js          switchTo() and nav wiring, runs last
```

Each dashboard is a banner marked block holding its own scoped CSS and its own
closure. Editing a dashboard means editing inside its block and nothing else, so
the diff still shows only that dashboard changed. **That is what protects the
others, not a file boundary.**

**Load order matters in two places.** `DATA` and the registry exist before any
dashboard uses them, and a dashboard that reads another's `summary` comes after
it.

**Only one dashboard is mounted at a time.** `switchTo()` replaces `#view`
entirely, so modules can keep their own element ids without collision. Per
dashboard state lives in the closure and survives switching.

## The six dashboards

Nav order is the client's own, from their slide 13. Do not reorder.

| Key | Dashboard |
| --- | --- |
| `bw` | Bank-wide Oversight |
| `dp` | Department Insights |
| `pj` | Project Insights |
| `fp` | Institutional File Plan |
| `rd` | Retention and Disposal |
| `ra` | Records and Archive Holdings |

## Rules that break the deliverable if you get them wrong

**No em dashes in visible text.** Commas, colons, parentheses or hyphens. It is
checked per dashboard, because a page level check passes or fails depending on
which one is mounted.

**Stay in the ADB palette.** Navy `#0E1F35` and `#10243E`, blue `#0072BC`, teal
`#00A5A8`, green `#5CA943`, grey-blue `#9DB8D2`, orange `#E8763C`, deep blue
`#1B5E82`. No new hues. If you need another step, take a tint of one already
present.

**Only visuals Power BI can reproduce natively.** The five helpers in
`charts.js` each map to one: `donut` to Donut chart, `hbars` to Clustered bar,
`columns` to Clustered column, `stacked` to Stacked bar, `treemap` to Treemap.
**Reach for these before writing another table.** If you need something with no
native equivalent, say so and propose the closest one.

**Figures must reconcile, and the reconciliation must be asserted in code.**
Department totals add up. A site's rows sum to its department. Format counts sum
to declared records. Never copy a number between modules by hand: expose it from
the owning module and `console.assert` against it. A silent divergence six
months from now is far worse than a noisy console. `verify.js` treats a console
error as a failure, so a broken assert fails the build.

**A card that looks clickable must be clickable.** A `.tap` chevron promises a
click; `.kpi.stat` promises nothing. They must never disagree, and
`check_affordance.js` reads each card's own `onclick`. **Per card handlers, not
delegation**, or that check cannot see them.

**Clicking a KPI must not rebuild the KPI grid.** Move the selected rail in
place and redraw only the panel below. Rebuilding the grid destroys the node
being clicked mid event and the selection is lost. This has been fixed once
already.

**Captions name the measure, never its provenance, and carry no computed
numbers.** No "sourceable today", no column names, no slide references, no
running totals in a summary line. A label must not change when the data behind
it does. Source status lives in `STATUS.md` and the checker workbook.

**No source markers on the page.** Removed 13 August. The prototype reads as a
finished report. Which figures can actually be produced is recorded in the
checker workbook, which must travel with the prototype when it goes to the
committee.

## Layout, and therefore zoom

**Browser zoom shrinks the CSS viewport.** 1440px at 200% is 720 CSS px. So a
sweep of widths is a sweep of zoom levels, and `check_responsive.js` does
exactly that, 1920px down to 400px.

**Never simulate zoom with `body{zoom}`.** It scales pixels but leaves media
queries reading the old width, so it reports faults a real browser never shows
and misses the ones it does. That mistake cost a full detour once.

Rules that keep it clean:

- Grids use `repeat(auto-fit, minmax(210px, 1fr))`, never a fixed column count
- KPI values use `clamp()`, never a fixed 30px
- Anything that can outgrow its panel sits in `.scrollx`, `.tmwrap`, or has
  `overflow-x:auto` of its own
- The page must never scroll sideways at any width
- A treemap block earns each line of text by having room for it. A short block
  drops the subtitle and shrinks the value, or the two collide

## Adding something

**1. Check the arithmetic first.** Extract the numbers, confirm they reconcile,
confirm derived columns really are derivable. If they do not add up, raise it
then, not after building.

**2. Put base figures in `DATA`,** not in a dashboard. A figure on three
dashboards is defined once and read three times. Add its reconciliation assert
at the bottom of the `data.js` block.

**3. Work inside the dashboard's own two blocks.** Scoped CSS under
`.dash-<key>`, module in its JS block. Anything touching the DOM goes in
`init()`, because the markup does not exist until `switchTo()` injects it.

**4. Mirror the house patterns.** Pagination at 10 rows. Filters with a Reset.
Sort controls with a field picker and a direction toggle. Click to open panels,
first one open by default. Always show a library with its parent site, because
library names repeat across sites.

**5. Verify.** See below, and add assertions for the numbers you changed.

**6. Update `STATUS.md`** with what you built and any decision made, so the next
session does not re-ask.

## Verification

```bash
cd /tmp && npm i playwright-core        # once per session
node <skill>/../edrms-utilization-report/scripts/verify.js /home/user/Jim/index.html
```

| Script | What it protects |
| --- | --- |
| `verify.js` | Every dashboard mounts, no console errors, no duplicate ids, no em dashes, no overflow |
| `check_responsive.js` | Layout at 13 widths, which is every zoom level |
| `check_affordance.js` | Every card looks like what it is |
| `check_data.js` | The `DATA` reconciliations, and that every requirement still has a home |
| `check_bankwide.js` `check_department.js` `check_division.js` `check_stage3.js` | The numbers on each dashboard |

**`verify.js` is a floor.** It passes on a page whose numbers are wrong. Add
assertions for what a stakeholder would notice: exact values, totals, every sort
field and direction, filters and resets, drill levels, and the reconciliation
sums.

**Check both entry points**, opened from disk and served over http. The file is
published by Pages but must also survive being opened by double click, since
that is how it gets shared.

**Run the suite twice.** A KPI click test can pass by luck once. If a checker
races a CSS transition, settle before clicking rather than loosening the
assertion.

## Change review and sign off

Nothing is final until the requester has looked at it and said so. This goes in
front of a bank committee, and a wrong number that reaches the published site
costs far more than a round of review.

**Never present work as done.** Present it as ready for review. After building
and verifying, post a table with one row per request, in their words:

```
| # | You asked for | Status | Evidence |
```

Then state, in plain sentences: every judgement call you made and why, anything
you could not do and why, and anything you changed that they did not ask for.
Close by offering three routes, not two: approve, adjust, or **roll back**.
Offering rollback explicitly matters, because otherwise a half satisfied
requester accepts work they are unhappy with rather than ask for a retreat.

Every delivered state is a commit, so any file at any point can be recovered
with `git show <ref>:<file>`. Nothing is ever stranded.

## Reference files

- `../edrms-utilization-report/references/design-system.md` colour tokens, the
  component inventory, and the component to Power BI mapping
- `../edrms-utilization-report/references/dashboard-inventory.md` what each
  dashboard holds
- `STATUS.md` section 3 at the repo root, the current state of the page
