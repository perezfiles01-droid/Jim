---
name: edrms-utilization-report
description: Orient in the ADB EDRMS Utilization Report project and its deliverables: the prototype, the database design workbook, the requirement register and the checker workbook. Use this skill when the user mentions ADB, EDRMS, the Utilization Report, the Reporting Suite or the live site and the request is about the project as a whole rather than one side of it: what exists, what was decided, what the client asked for, what to deliver next, or how the pieces fit together. For building or changing what the report looks like, use edrms-frontend instead. For whether a figure can actually be produced, which column carries it, or any SQL, Graph call or table design question, use edrms-backend instead. Use this one when it is unclear which of those applies, because it carries the project context both of them assume.
---

# ADB EDRMS Utilization Report

## Which skill to use

Three skills cover this project, and they do not overlap.

| The request is about | Use |
| --- | --- |
| What the report looks like or how it behaves. Panels, charts, layout, captions, clicks | `edrms-frontend` |
| Whether a figure can be produced, where it comes from, SQL, Graph, table or column design | `edrms-backend` |
| The project itself. What exists, what was decided, what the client asked for, what is next | this one |

When a request needs both, answer the sourcing question first with
`edrms-backend`. A panel built on a figure that cannot be produced is worse than
no panel, and that order is what stops it being built.

## What this is

The Asian Development Bank is rolling out an EDRMS (Electronic Document and
Records Management System, vendor AvePoint, running on SharePoint / Microsoft
365). This project is the **EDRMS Utilization Report**, a suite of dashboards
showing how the bank is adopting and using it. Records and IT governance
stakeholders (the RAC committee and ITD) use it to track rollout and target
follow-up.

**The prototype is a specification, not the product.** The real report will be
built in Power BI. Everything here exists so stakeholders can agree on layout
and behaviour before anyone opens Power BI Desktop. That framing drives most of
the rules below: if a visual cannot be reproduced with a native Power BI visual,
it does not belong in the prototype, however good it looks in a browser.

**Deliverable:** one self-contained `index.html`, published with GitHub Pages
and also openable by double click. No other files, no build step, no
dependencies.

**Keep it one file.** This has been split into folders and into flat per
dashboard files and reverted both times. The reason is the write path: the
requester uploads by hand through the GitHub web interface, which flattened the
folders and dropped files, and which turns a four file change into a seven file
upload where missing one leaves the site broken in a way that is invisible from
the code. One file means one upload.

The isolation that splitting was meant to give is preserved inside the file.
Each dashboard is a banner marked block carrying its own scoped CSS and its own
closure:

```
<style>   styles.css block      shared shell
          <name>.css block      one per dashboard, all rules under .dash-<key>
<script>  core.js block         F(), wirePager(), the DASHBOARDS registry
          <name>.js block       one per dashboard
          app.js block          switchTo() and nav wiring, runs last
```

Editing a dashboard means editing inside its block and nothing else, so the diff
still shows only that dashboard changed. That is what protects the others, not
the file boundary. Do not split this up again unless the write path becomes a
real git push.

Load order matters in two places: the registry is created before any dashboard
uses it, and format and storage asserts against records management so it follows
it. Overview reads every other dashboard's `summary`, so it comes after them all.

Read `BACKGROUND.md` at the repo root for project context that changes over
time (current status, decisions taken, open items). This skill covers how to
work on it; `BACKGROUND.md` covers what is currently true.

## Rules that break the deliverable if you get them wrong

**No em dashes in visible text.** Use commas, colons, parentheses, or hyphens.
This is a client style rule and it is checked. Two source prototypes shipped
with em dashes in their department dropdowns (`ITD — Information Technology`);
those are a known, deliberately preserved exception. Never add new ones. Note
that a page-level em dash check passes or fails depending on which dashboard is
mounted, so check per dashboard, not once.

**Stay in the ADB palette.** Navy `#0E1F35` and `#10243E`, blue `#0072BC`, teal
`#00A5A8`, green `#5CA943`, grey-blue `#9DB8D2`. Orange `#E8763C` and deep blue
`#1B5E82` exist for specific series already in use. Do not introduce new hues;
if you need another step, take a tint of a colour already in the file.

**Figures must reconcile, and the reconciliation must be enforced in code.**
Department totals add up, treemap blocks sum to the in-range tile, format file
counts sum to total declared records, percentages sum to 100.0. When two
dashboards must agree on a number, do not copy it by hand and hope. Expose the
value from the owning module and `console.assert` against it, the way Format and
Storage asserts its file total against `DASHBOARDS.rm.annualRec`. A silent
divergence six months from now is much worse than a noisy console.

**Only visuals Power BI can reproduce natively.** See
`references/design-system.md` for the component-to-Power-BI mapping. Before
inventing a new visual, find its Power BI equivalent. If there isn't one, say so
and propose the closest native visual instead.

**KPI cards show a title and a number.** One deliberate exception exists (Most
Common Format shows `PDF`, a categorical value); flag it if you add another.

**Always show a library together with its parent site.** Library display names
repeat across sites, so a bare library name is ambiguous.

**Label vendor or preliminary numbers as estimates, and flag data
dependencies** rather than presenting them as ready, unless the requester
explicitly says they will cover it verbally. See `references/data-and-sources.md`
for what is and is not actually available today.

## How the site is put together, and why

`index.html` hosts a registry of dashboard modules. Understanding this is what lets
you add a dashboard without breaking the others.

```
shared shell CSS  ->  :root tokens, body, #side, nav, header, section,
                      .band, .kpi, .panel, .ptitle, .psub, .pager, .muted
scoped CSS        ->  .dash-rm, .dash-sl, .dash-fs   (one block per dashboard)
DASHBOARDS.<key>  ->  an IIFE returning {ver, crumb, asof, html, init}
switchTo(key)     ->  replaces #view, swaps header text, calls init()
```

**Why the CSS is scoped.** The source prototypes reuse the same class names with
different values. `.sbar` is `200px 1fr 210px` in one dashboard and
`210px 1fr 72px` in another, and the `.seg.e` / `.seg.p` segment colours are
*inverted* between them. `.kpis`, `.drange`, `.resetbtn`, `.legend`, `.toolbar`,
and `select` also differ. Sharing any of these silently restyles a dashboard you
weren't touching. When in doubt, scope it.

**Why each dashboard is a closure.** The modules define genuinely different
functions under the same names. Both `pager()` implementations exist for a
reason: the Sites and Libraries one prints a row count on a single page, the
Records Management one returns an empty string. Same for `deptOptions()`. Only
`F()` and `wirePager()` are shared, because only those were identical.

**Why only one dashboard is mounted at a time.** Every module kept its original
element ids (`s1-detail`, `s2-kpis`, and so on). Because `switchTo()` replaces
`#view` entirely, those ids never coexist, so no renaming was needed and no
handler could be broken by a mistyped id. Per-dashboard state (drill path, page,
sort field, which KPI is open) survives switching because it lives in the
closure. Date input values do not, since they are DOM state; blank dates mean
all time, so figures stay correct either way.

## Adding a new dashboard

This is the common request. Work in this order; the early steps catch most
problems before any code exists.

**1. Get the spec and check its arithmetic first.** Extract the data table from
the mockup and verify it reconciles before writing anything. Confirm derived
columns really are derivable (for example average file size = storage GB * 1024
/ files). If the numbers do not add up, raise it then, not after building.

**2. Claim a nav slot.** The sidebar in `index.html` already lists every planned
dashboard, with unbuilt ones marked `class="dis"`. Enable one by swapping
`class="dis"` for `data-d="<key>"`. Keep the existing nav order. Use a short
key: `rm`, `sl`, `fs`.

**3. Add two blocks to `index.html`.** A banner marked CSS block at the end of
the `<style>` element, and a banner marked JS block in the `<script>` element,
placed after anything it depends on. That is the whole wiring. Everything else
about the dashboard stays inside those two blocks, which is the point: a later
change to one dashboard should never require touching another dashboard's block.

**4. Write the scoped CSS.** All rules go under `.dash-<key>`. Only add rules
that differ from the shared shell block. Check the collision
list above.

**5. Add the module** in its JS block, after anything it depends on:

```js
DASHBOARDS.xx=(function(){
  /* data at module level, computed once */
  const DATA=[ ... ];
  /* console.assert here if a figure must agree with another dashboard */

  function draw(){ /* read state, write innerHTML, rewire handlers */ }

  const html=`<section class="dash-xx"> ... </section>`;

  function init(){
    /* write KPI values, wire clicks, run the initial draws */
  }

  return {ver:"...", crumb:"...", asof:"...", html, init};
})();
```

Anything that touches the DOM belongs in `init()`, not at module level, because
the markup does not exist until `switchTo()` injects it.

**6. Mirror the house patterns** rather than inventing new ones. Pagination at
10 rows. Date ranges blank by default, blank meaning all, with a Reset that
clears filters and returns to page 1. Sort controls offer a field picker plus a
highest/lowest toggle. Click-to-open KPI panels, first one open by default. A
range summary line appears only while a range is applied.

**7. Verify.** See below. Do not skip this.

**8. Update `BACKGROUND.md`** with what you built and any decision the requester
made, so the next session does not re-ask.

## Verification, before you deliver

Claims about this file need to be earned, not assumed.

`scripts/verify.js` bundles the generic checks so you do not have to rebuild the
harness each time. It needs Node plus a Chromium binary, which the Claude Code
remote environment has at `/opt/pw-browsers`. In an environment without them
(claude.ai chat, for instance) you cannot run it, so say plainly that the change
is unverified rather than implying it was checked.

```bash
cd /tmp && npm i playwright-core   # once per session
node <skill>/scripts/verify.js /home/user/Jim/index.html      # opened from disk
python3 -m http.server 8899 &                                # and served
node <skill>/scripts/verify.js http://localhost:8899/index.html
```

Check both entry points. The file is served by Pages but must also survive being
opened directly from disk, since that is how it gets shared outside the browser.

It checks every dashboard mounts, no console errors (which is also how a failed
reconciliation assert surfaces), no duplicate element ids, no em dashes per
dashboard, no horizontal overflow, and that only one section is mounted at a
time.

Then add assertions specific to what you built: exact cell values against the
mockup, totals, every sort field and direction, filters and resets, drill-down
levels, and the reconciliation sums. Aim to assert the numbers a stakeholder
would notice, not just that elements exist.

Report the real result. If something fails, say so and show the output.

## Change review and sign off

The requester has asked, explicitly, that nothing be treated as final until they
have looked at it and said so. Honour that. The reason is not ceremony: this
deliverable goes in front of a bank committee, and a wrong number that reaches
the published site is far more expensive than a round of review. Their upload
step is the last gate, so the review has to happen before it.

**Never present work as done.** Present it as ready for review, and be explicit
that nothing reaches the site until they upload.

After building and verifying, and **before** handing over any files, post a
review table that lets them check your work against what they actually asked
for. One row per request, in their words, not yours:

```
## Review, build 4

| # | You asked for | Status | Evidence |
|---|---------------|--------|----------|
| 1 | Move the date filter to the right | Done | screenshot, 9 assertions |
| 2 | Remove the "Showing all records" note | Done, with a judgement call | hidden only when unfiltered, see below |
| 3 | Add a Retention dashboard | Not done | blocked, no disposition data, see below |

Files to upload: index.html, retention.js
Unchanged: everything else
Verified: 178 of 178 assertions, no console errors
```

Then state, in plain sentences under the table:

- **Every judgement call you made**, with the reasoning, so they can overrule it.
- **Anything you could not do**, and why. Never quietly drop a request.
- **Anything you changed that they did not ask for**, however small.

Close by offering three routes, not two: approve and upload, adjust something
first, or roll back to the last approved state. Offering rollback explicitly
matters, because otherwise a half-satisfied requester tends to accept work they
are not happy with rather than ask for a retreat.

**After they upload, always verify what actually landed.** Fetch `origin/main`,
compare the blob hash of every file against your local copy, and confirm the
paths `index.html` requests all exist. This is not paranoia. It has already
caught the GitHub uploader flattening directories and dropping five files, and
the delivery path silently stripping hyphens out of filenames. Both produced a
site that looked broken for reasons invisible from the code alone. Report what
you find before they discover it.

**Rolling back is always possible, so say so plainly.** `origin/main` is exactly
what is live, and every delivered state is a local commit on the working branch,
tagged `approved/<date>` once the requester signs it off. Any file at any point
can be reproduced with `git show <ref>:<file>`, so a rollback means handing back
the previous version of the affected files for upload. Nothing is ever stranded.

## Delivering

Pushing from this environment currently fails with 403 (the session's git
credentials and GitHub App grant are read-only). Read access works, so you can
always pull the current state of the repo.

So: commit locally, then send the files with `SendUserFile` and point the user
at `https://github.com/perezfiles01-droid/Jim/upload/main`. Two recurring
gotchas worth mentioning to them: files download as `NAME (1).ext` if an older
copy sits in their Downloads folder, and uploading while viewing the repo at a
commit SHA rather than a branch hides GitHub's `Add file` button.

## Reference files

Read these when the task calls for them, rather than all at once.

- **`references/design-system.md`** - every colour token, the full component
  inventory with class names, and the component-to-Power-BI-visual mapping. Read
  before building any new visual or restyling an existing one.
- **`references/data-and-sources.md`** - the data model, where each figure comes
  from in production, the LIVE / BATCH / SPO source tiers, and the known data
  dependencies (things that cannot be produced yet). Read before adding data or
  claiming a number is available.
- **`references/dashboard-inventory.md`** - what each existing dashboard
  contains, its sample data, and its "data as of" line. Read when copying an
  existing dashboard's pattern or when a new dashboard must agree with one.
