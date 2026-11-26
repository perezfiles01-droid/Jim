# Project context

## WHERE REPORT CHANGES GO NOW: the developers' code port (read before anything else)

Standing instruction from the requester, 25 Nov 2026. **Every future change to
the EDRMS Utilization Report goes into the developers' code port**, in whichever
chat it is asked. That means any change to a dashboard, card, filter, table,
chart, colour, layout or import. The current version is 1.0.0.29. Ship it as their
`edrms-utilization-report.sppkg`, together with `UtilizationReport-src.zip`.

- Start with **`REPORT_HANDOFF.txt`**: the exact steps to continue in a new chat.
- Follow **`DEV_SOURCE_GUIDELINES.md`** for every such change. Its section
  "Picking up the work in a new session" covers:
  - where the latest zip is (Google Drive) and how to fetch it
  - how to install and build it
  - the formatting rules and the browser check
  - how to deliver: bump the version, update `CHANGES.md`, upload to Drive and
    send both files
- Also apply `BRANDING.md`, and leave no trace of AI.
- Ask the requester before making any change.
- **Do not make report changes in the old targets** unless the requester names one
  explicitly. The old targets are:
  - `index.html`, the GitHub Pages prototype
  - the Floot app
  - the 1.0.x web part, `EDRMS_Utilization_Report_SharePoint_2026-10-07.sppkg`
- Record each delivered version in `PORT_PLAN.md`.

## Read `STATUS.md` first. Before anything else, every time.

It is the complete record of the EDRMS Utilization Report: what is built, what is
proven against the test tenant, what is assumed, what is blocked and on whom, the
decisions already settled, and the mistakes made and corrected so they are not
repeated.

**It is written to be read in one pass and answer most questions without opening
another file.** Do that before reading the prototype, the database design or the
workbooks, and before asking the user to re-explain anything. Almost everything
asked in a new session is already answered there.

Then read **`BACKGROUND.md`** for the durable context: what ADB and the EDRMS
Utilization Report are, the tech stack, the ADB palette and the hard rules. It is
still correct on those, but it was written on 4 August 2026 and predates the
database design, the test tenant investigation and the August revisions.
**Where the two disagree, `STATUS.md` wins.**

There is also a skill at **`.claude/skills/edrms-utilization-report/`** covering
how to build, extend and verify the dashboards. It should trigger on its own for
any work on the Reporting Suite.

## Publishing: always merge to `main`, never ask

Standing instruction from the requester, 17 August 2026. **Every accepted change
is merged to `main` and pushed in the same turn it is made.** Do not leave work
sitting on a feature branch, and do not ask whether to publish it. `main` is
what GitHub Pages serves at https://perezfiles01-droid.github.io/Jim/, so an
unmerged change is an invisible one, and the requester checks the live site.

```
git checkout main && git merge --no-edit <branch> && git push origin main
git checkout <branch>
```

**If the requester says a change is not showing, it is almost certainly the
browser cache, not the deploy.** Pages serves HTML with a ten minute lifetime
and a plain refresh reuses it. Check `git show origin/main:index.html` for the
change before doubting the push, then tell them to hard reload with
Ctrl+Shift+R, or Cmd+Shift+R on a Mac.

Note that this repo's own comments quote the text of things that were removed,
so grepping for a removed caption will still find it. Check whether the hit is
inside a comment before concluding a removal did not land.

## App Catalog link (where the .sppkg is uploaded)

When the requester asks where to upload the web part, or for the App Catalog
link, send exactly this one and no other:

https://7rkd12.sharepoint.com/sites/appcatalog/_layouts/15/tenantAppCatalog.aspx/manageApps

Upload the `.sppkg` there and choose **Replace**. (Set by the requester,
22 Oct 2026. Do not send the `AppCatalog/Forms/AllItems.aspx` address.)

## KT video series

For any work on the EDRMS knowledge transfer videos, read
**`video/KT_SERIES_SESSION_HANDOFF.txt`** first and follow it exactly. Part 1
(`video/EDRMS_KT_Part1_Introduction.mp4`) is the approved reference for every part.

## Branding (colours and fonts)

Before any change to colours, fonts or styling of the report (web part or Floot),
read **`BRANDING.md`**. It holds the ADB palette, the font rules, which values are
verified, and where each colour is used in the code.

## Developers' source code

Before porting the report into the developers' code, or changing it there, read
**`DEV_SOURCE_GUIDELINES.md`**. It covers their exact structure and formatting,
Fluent UI for charts and tables, reusable components, and one mock data file.
The plan for that port, and its open questions, is **`PORT_PLAN.md`**.

## Data sources

Every utilization data source, held or still missing, is registered in
**`sources/README.md`**. New source files go in `sources/<tenant>/` and get a
row there. Check it before saying a figure has a source or has none.

## Current deliverables

| File | What it is |
| --- | --- |
| `index.html` | The prototype. One self contained file, 5 dashboards |
| `EDRMS_Utilization_Report_Database_Design_v1.xlsx` | The database design in the client's workbook format. 4 tables, 73 columns, with a verification tracker |
| `utilizationdb.md` | The same design as prose, no code |
| `evidence_*.csv` | Real tenant exports, kept so claims can be checked rather than trusted |
| `EDRMS_Utilization_Report_Source_Data_v4.xlsx` | Element to source mapping. **Stale**, predates the August cut |

## The habit that has caught every real error

Do not trust an expected column name, an assumed API window, or a plausible
figure. Export the real file and read it. `STATUS.md` section 8 lists eleven
errors found that way, several of which had survived for weeks looking correct.

When something cannot be verified, say so and leave the cell blank. An
expectation written into a source column is indistinguishable from a verified
fact three weeks later.

## Safeguards against the Temporal Dead Zone (TDZ) bug

### The Bug Pattern (August 18, 2026)

The dashboard encountered a critical runtime bug caused by accessing `const` or `let` 
variables before they were declared. In JavaScript, variables declared with `const`/`let` 
are in a "temporal dead zone" from the start of their scope until the line declaring them 
executes. Accessing them throws `ReferenceError: Cannot access 'X' before initialization`.

**What happened:**
- Added code in lines 3447-3452 that referenced `pSites[0]` and `tSites[0]`
- These variables were declared later at lines 3470-3471
- When the DASHBOARDS.rd IIFE executed, it hit the TDZ error and threw
- The entire script block aborted, leaving DASHBOARDS empty
- **Result: All five dashboards rendered blank** despite no syntax errors visible to grep/diff

**Why static code review missed it:**
- `grep` and `diff` cannot detect TDZ errors; they only see token positions
- A variable is syntactically valid anywhere in its scope; only runtime execution knows if it's in TDZ
- This bug is **invisible to human code review** without running the code in a JavaScript engine

### How We Fixed It (August 18, 2026)

Moved the declarations from lines 3470-3471 to lines 3437-3439, BEFORE any code that references them:

```javascript
// CORRECT: Declare before use
const TOTAL_SITES = 1032;
const pSites = split(...);
const tSites = split(...);

// Then the code that uses them
const byDept = pSites.map(...);  // ✓ pSites is already declared
const byRole = tSites.map(...);  // ✓ tSites is already declared
```

### Automated Safeguards (Mandatory from August 18, 2026 forward)

**1. Browser-Based Testing Before Merge**

Every change to `index.html` must pass a Playwright browser test that verifies:
- ✅ All five dashboards (overview, rd, dept-insights, visitor-details, disposal) mount without errors
- ✅ No `pageerror` events (script throws caught by browser)
- ✅ No `console.assert` failures
- ✅ No console errors or warnings in critical code paths
- ✅ Key UI elements render (charts, panels, filters)

**Run the test:**
```bash
node /tmp/claude-0/-home-user-Jim/3347333e-caa5-5959-909b-81096bafd1d1/scratchpad/check.js $(pwd)/index.html
```

This script exists at `.scratchpad/check.js` and should be run before committing.

**2. Code Review Checklist for JavaScript Changes**

Before reviewing changes to index.html, check:

- [ ] **Variable declarations precede use** — All `const`/`let` declared before any code in the same IIFE that references them
- [ ] **IIFE closure** — If adding code inside `DASHBOARDS.rd` or other IIFE, verify the opening `(function() {` exists and closing `})()` is present
- [ ] **Dependencies declared first** — Any split/transform/derived data declared before it's used in maps/filters
- [ ] **Function references** — Functions like `split()`, `CHART.hbars()`, `switchTo()` must be defined before the IIFE that calls them
- [ ] **Browser test passes** — Must pass check.js with zero errors before merge

**TDZ Pattern to Avoid:**
```javascript
// ❌ WRONG: Use before declaration
DASHBOARDS.rd = (function() {
  const byDept = pSites.map(...);  // ReferenceError: pSites is in TDZ
  const pSites = split(...);       // Declaration is too late
})();

// ✅ CORRECT: Declare before use
DASHBOARDS.rd = (function() {
  const pSites = split(...);       // Declare first
  const byDept = pSites.map(...);  // Then use it
})();
```

### Why This Happened

August 17–18, 2026: Reshaping the retention labels table added new by-department splits 
(lines 3447–3452) that read `pSites[0]` and `tSites[0]`, but the declarations were still 
on lines 3470–3471. No syntax error; code looks correct to grep. But JavaScript's TDZ 
rule means "in scope" ≠ "in your reach yet." Only runtime execution in a browser catches this.

### Lesson

**Static code review of JavaScript dashboard code is insufficient.** You MUST run the code 
in a browser and verify no runtime errors occur. Typos, logic flaws, and syntax errors may 
be visible to grep; temporal dead zone errors, async timing bugs, DOM selector misses, and 
event binding failures are only visible at runtime.

**Implementation rule:** Before any commit that changes `index.html`, run the Playwright 
test. If it reports errors, fix them and re-run before committing. Do not merge to `main` 
if the test fails.
