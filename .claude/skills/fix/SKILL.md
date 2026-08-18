---
name: fix
description: |
  Diagnose and fix bugs in any code you create — HTML/JS dashboards, web apps, Vue/React components, Node.js backends, or any codebase. 
  
  When you report a bug or something's broken, use this skill to: (1) Confirm which file to fix; (2) Describe the symptoms; (3) Get deep Opus-level root-cause analysis; (4) See a diagnostic plan with proposed fix; (5) Implement and verify the fix; (6) Deploy changes (merge to main, push, hard refresh as needed).
  
  Bugs this skill finds and fixes: syntax errors, logic errors, rendering/UI issues, API/data flow problems, scope and reference errors, CSS layout bugs, event handling issues, async/Promise issues, type errors, regex failures, pagination/state bugs, and more.
  
  **Use this skill whenever you encounter a bug, issue, or unexpected behavior in any code.** Always confirm the file being fixed and get a diagnostic plan before implementing changes.
compatibility: Read, Edit, Bash, Grep
---

# Fix - Bug Diagnosis & Fixing Skill

Diagnose and fix bugs in any prototype — HTML/JS dashboards, web apps, backends, or other code you build. This skill uses deep root-cause analysis to find the real problem, not just the symptom.

## How It Works

### Phase 1: Confirm & Describe
When you report a bug, the skill asks:
- **Which file?** (e.g., `index.html`, `app.js`, `Dashboard.vue`)
- **What's broken?** (Describe the symptoms: what should happen, what actually happens)
- **When does it happen?** (Always, after specific action, in certain conditions?)
- **Any error messages?** (Browser console, server logs, etc.)

### Phase 2: Root-Cause Analysis  
The skill performs **Opus-level diagnostic reasoning**:

1. **Reproduce** — Trace the code path that runs when the bug occurs
2. **Search** — Look for syntax errors, logic flaws, missing functions, scope issues
3. **Diagnose** — Identify the REAL cause:
   - Is it a typo or syntax error?
   - Logic mistake (wrong comparison, missing check)?
   - Scope issue (undefined variable, function not in scope)?
   - Async/Promise bug (race condition, missing await)?
   - CSS/DOM issue (element hidden, wrong selector)?
   - Data flow break (API not called, state not updated)?
   - Other pattern match from this prototype's history?

4. **Impact Assessment** — What else might be affected?

### Phase 3: Diagnostic Plan & Fix
The skill presents:
- **What's wrong** — Clear explanation of the bug
- **Why it happens** — Root cause with code references
- **How to fix it** — Specific change with explanation
- **Confidence level** — HIGH/MEDIUM/LOW based on evidence

You review and confirm: **"Yes, fix it"** or suggest changes.

### Phase 4: Implement & Verify
Once confirmed:
1. Apply the fix to the code
2. Check for new/related bugs (similar patterns elsewhere?)
3. Verify the fix works (syntax check, logic trace, manual test)
4. Commit and push (per your repo's convention: usually merge to main immediately)
5. Tell you to hard-refresh if browser cache is involved

---

## Bugs This Skill Handles

### Syntax & Reference Errors
- Unclosed brackets, braces, quotes
- Undefined variables or functions
- Scope issues (variable not accessible)
- Typos in property names (`obj.propery` instead of `obj.property`)

### Logic Errors  
- Wrong comparison operators (`==` vs `===`, `>` vs `>=`)
- Inverted conditions (`if(!value)` when should be `if(value)`)
- Missing or wrong variable initialization
- Array slice/index off-by-one errors
- Incorrect loop conditions

### Rendering & DOM Issues
- Element not found (`querySelector` returns null)
- HTML not inserted (`.innerHTML` set to wrong element)
- CSS hiding content (wrong selector, conflicting rules)
- Event handlers not wired (click doesn't work)
- State not updated before re-render

### Data & Async Issues
- API not called or returns undefined
- `.then()` or `.await` missing
- Race condition (parallel operations interfere)
- Data split/transform applied wrong
- Filter/map creating empty results

### CSS Layout Issues
- `min-width`, `min-height` preventing responsive design
- Grid/flex not working at certain zoom levels
- Fixed positioning off-screen
- Overflow hidden/scroll causing truncation
- Z-index conflicts

### Pagination & State  
- Page counter not resetting when switching views
- Array slice boundaries wrong
- DOM elements duplicated after pagination adds new rows
- Click handlers not re-wired after page changes

### Common Patterns (This Prototype's History)
The skill learns from bugs already found and fixed in your projects and applies those patterns to new bugs.

---

## Step-by-Step Workflow

**You say:** 
```
The Department Insights tiles are blank when I load the dashboard
```

**Skill does:**
1. **Confirms:** "Which file is this in? `index.html`?"
2. **Gets symptoms:** "What should show (the 7 KPI cards with values), what actually shows (blank area)"
3. **Analyzes:** Reads code, finds `drawTiles()` function, checks if it's being called
4. **Diagnoses:** "Found it: `D()` returns undefined because DEPTS array is empty when init() runs"
5. **Proposes:**
   ```
   ## Fix Proposal
   Move DEPTS initialization before drawTiles() call
   Change line X from Y to Z
   Reason: DEPTS needs data before drawTiles() tries to use it
   ```
6. **Confirms:** "Does this look right?"
7. **Implements:** Applies fix, runs syntax check, commits, pushes
8. **Verifies:** "Tiles should now show values. Hard-refresh to clear cache, then check."

---

## Bug Diagnosis Triggers

Use this skill whenever you see:
- ❌ Blank screen or missing content
- ❌ "Cannot read property X of undefined" in console
- ❌ Button click does nothing
- ❌ Data not showing or showing wrong values
- ❌ Layout broken (scrollbar, misaligned, wrong colors)
- ❌ Pagination/drill-down not working
- ❌ Performance issue (slow render, infinite loop)
- ❌ Unexpected error in console
- ❌ "This worked before, now it's broken"
- ❌ Feature missing or incomplete

**You don't need to debug it yourself** — just describe what's wrong and let the skill find the cause.

---

## Key Behaviors

### Token Efficiency
Despite deep Opus-level analysis, the skill stays efficient:
- Searches targeted code sections first, not entire file
- Uses grep/pattern matching to narrow before deep read
- Focuses on the symptom's code path
- Explains why without rewriting the whole codebase
- Results in **one validated fix**, not trial-and-error

### Confidence-Based Approach
- **HIGH confidence**: Clear cause with simple fix (syntax error, typo, logic flaw)
- **MEDIUM confidence**: Multiple possibilities, fix handles main one
- **LOW confidence**: Need more info or user to test and feedback

You can ask for alternative hypotheses if the first fix doesn't work.

### Proactive Pattern Detection
The skill remembers bugs found before:
- "This looks like the scope issue we fixed in [previous work]"
- "This is the same CSS constraint problem as [before]"
- "Similar to the async race condition from [project X]"

This prevents regressions — you don't re-break things the same way twice.

### Stand Alone
Works in isolation — if you're in the middle of other work, say the bug fix is your only focus and the skill wraps up cleanly with commit/push/refresh guidance.

---

## Example: Real Bug Diagnosis

**Your report:**
```
The visitor filter buttons don't do anything when I click them. 
The filter is supposed to change the KPI values from 7/30/90/180 days, 
but clicking Last 30 Days does nothing.
```

**Skill analyzes:**
- Finds visitor filter buttons in HTML
- Looks for click handler wiring
- Searches for function called on click
- Checks if `applyVisitorFilter()` is defined
- Verifies DEPTS is being updated

**Skill reports:**
```
## Bug: Visitor Filter Buttons Don't Respond

### Symptoms
- Click event fires (button highlights)
- But KPI values don't change
- Filter state not persisting

### Root Cause
Line 2970: Button click handler calls `applyVisitorFilter()` 
But line 2460: `drawTiles()` reads from DEPTS directly, not from filter state
The filter updates the data, but drawTiles() uses stale cached values

### Fix
Add `rebuildALL()` after `applyVisitorFilter()` at line 2984
This ensures summation functions see updated visitor counts

### Confidence
HIGH - Button handler exists, data updates work, just missing the rebuild step
```

**You confirm:** "Yes, fix it"

**Skill fixes, verifies, commits, pushes**

---

## When NOT to Use This Skill

- **Feature request** ("Add a sort button") → Use general coding skill
- **Design question** ("Should this be red or blue?") → Ask design skill
- **Performance optimization** ("Make this faster") → Profile first, then use this if you find a specific bug
- **Test writing** → Use testing skill

**DO use this skill for:** bugs, unexpected behavior, errors, broken features, things that used to work.

---

## Tips for Best Results

1. **Be specific about symptoms:** "Blank" is less useful than "Visitor count shows 0 instead of 1,234"
2. **Say when it started:** "Worked yesterday after I added the disposal function" narrows the search
3. **Check console first:** Any error messages help (share them if you see red)
4. **Describe the impact:** "Only happens on the Visitors drill" vs "happens everywhere" guides the search
5. **Trust the analysis:** The skill looks at code paths you might not think of

---

## After the Fix

Once the fix is deployed:
- **Hard-refresh your browser** (Ctrl+Shift+R or Cmd+Shift+R on Mac) to clear cache
- **Test the specific scenario** that was broken
- **Check for side effects** ("Did I break something else?")
- If the fix didn't work or introduced a new issue, report back with the details and the skill will re-diagnose
