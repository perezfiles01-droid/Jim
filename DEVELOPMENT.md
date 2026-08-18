# Dashboard Development Guide

**Last updated:** August 18, 2026  
**Critical update:** Browser-based testing is now mandatory to prevent runtime errors

## Before You Commit

### 1. Run the Browser Test

Every change to `index.html` must pass the browser-based verification test before committing:

```bash
node check-dashboard.js $(pwd)/index.html
```

**What it checks:**
- ✅ All five dashboards (overview, rd, dept-insights, visitor-details, disposal) initialize without throwing errors
- ✅ No `ReferenceError` from temporal dead zone (const/let used before declaration)
- ✅ No uncaught exceptions in script execution
- ✅ No console errors or failed assertions
- ✅ Chart visualizations and key UI elements render

**Expected output on success:**
```
✅ ALL TESTS PASSED - Dashboard is production ready
Safe to merge to main
```

**Expected output on failure:**
```
❌ TESTS FAILED - 1 error(s) found:
Error 1:
PAGEERROR: Cannot access 'pSites' before initialization
    at rd (index.html:3437:15)
    at DASHBOARDS.<anonymous> (index.html:3401:20)
    at index.html:3470:5

❌ DO NOT MERGE until all errors are fixed
```

### 2. Fix Test Failures Before Committing

Do not commit if the test fails. Common issues:

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot access 'X' before initialization` | Temporal dead zone: variable used before `const`/`let` declaration | Move `const X = ...` before any code that references `X` |
| `switchTo is not defined` | Function not in global scope or dashboard IIFE not fully closed | Check DASHBOARDS object and function definitions |
| `Cannot read property 'X' of undefined` | Element doesn't exist (querySelector returned null) or split failed | Verify element ID/class matches, check data availability |
| `Cannot read property 'map' of undefined` | Variable is undefined (split result is undefined) | Verify split() call worked, check input data |

**Process:**
1. Run test → See error
2. Open `index.html` and locate the error line
3. Fix the issue (usually: move declarations earlier)
4. Run test again → Verify passes
5. Only then commit

## Making Changes to index.html

### Pattern 1: Add a New Dashboard

```javascript
// ✅ CORRECT: All declarations first, then code
DASHBOARDS.mypage = (function() {
  // Step 1: Declare all const/let FIRST
  const SOME_CONSTANT = 42;
  const myData = split(...);
  
  // Step 2: Derived data/transformations
  const filtered = myData.filter(...);
  
  // Step 3: DOM and rendering logic
  function render() { ... }
  
  // Step 4: Return public API
  return { render };
})();
```

### Pattern 2: Add Data Transformation

```javascript
// ❌ WRONG: Use before declaration
const byDept = pSites.map(...);  // ReferenceError!
const pSites = split(...);       // Too late

// ✅ CORRECT: Declare first
const pSites = split(...);       // Declare
const byDept = pSites.map(...);  // Then use
```

### Pattern 3: Reference Another Dashboard

```javascript
// ✅ CORRECT: switchTo() is defined in global scope
DASHBOARDS.rd = (function() {
  function renderChart() {
    switchTo('overview');  // ✓ switchTo() is available globally
  }
  return { renderChart };
})();
```

## Understanding the Temporal Dead Zone (TDZ)

JavaScript's TDZ is **invisible to grep/diff** but **fatal at runtime**.

```javascript
// This looks fine to static analysis tools:
{
  console.log(x);      // Line 1: Looks OK, x is in scope
  const x = 42;        // Line 2: x declared
}
// But throws: ReferenceError: Cannot access 'x' before initialization
```

**Why it matters:**
- Your code has no syntax errors
- `grep` cannot detect the problem
- A peer reviewer might miss it in code review
- **Only runtime execution in a JavaScript engine catches it**

**Rule:** Always declare `const`/`let` before any code that references them in the same scope.

## Automated Testing (CI)

When you push to a `claude/**` branch or create a PR against `main`, GitHub Actions automatically:

1. ✅ Checks out your code
2. ✅ Installs Playwright
3. ✅ Runs `node check-dashboard.js index.html`
4. ✅ Reports pass/fail status

**You cannot merge a PR if the dashboard verification fails.**

This prevents broken code from reaching the live site.

## Workflow: Making and Committing Changes

```bash
# 1. Make changes to index.html
$ vim index.html

# 2. Test locally
$ node check-dashboard.js $(pwd)/index.html

# 3. If test fails, fix and re-test
$ node check-dashboard.js $(pwd)/index.html

# 4. Once test passes, commit
$ git add index.html
$ git commit -m "Add new feature: ..."

# 5. Push (CI will also verify)
$ git push origin claude/your-branch

# 6. After PR review & approval, merge to main
$ git checkout main && git merge --no-edit claude/your-branch && git push origin main
```

## Debugging a Test Failure

If the test fails and the error message is unclear:

### Step 1: Reproduce with Browser DevTools

```bash
# Start a local web server
python3 -m http.server 8000

# Open in browser
# http://localhost:8000/index.html

# Open DevTools (F12), check Console tab
# Look for red error messages
```

### Step 2: Check the Specific Line

The error message will reference `index.html:LINE:COL`. Open that line and:
- **TDZ error**: Look for `const`/`let` declarations that come after the error line
- **Undefined reference**: Check if the function/variable is defined globally or in the right scope
- **Selector error**: Verify element ID/class name matches

### Step 3: Check for Common Patterns

Look for these patterns in the changed code:

```javascript
// ❌ Pattern 1: Function not found
switchTo('rd');  // Error if switchTo() defined later in code

// ❌ Pattern 2: Variable in TDZ
const byDept = pSites.map(...);  // Error if pSites declared later
const pSites = split(...);

// ❌ Pattern 3: Missing IIFE closure
DASHBOARDS.newpage = (function() {
  return { render: ... }
// Missing })(); at the end
```

## When to Use the Fix Skill

If you've made multiple changes and the test finds issues, use the fix skill:

```
I made changes to the retention labels chart and now the dashboard throws:
"Cannot access 'pSites' before initialization" at line 3437

Here's what I changed:
[describe or paste the diff]
```

The fix skill will:
1. Diagnose the root cause
2. Show you the exact fix
3. Apply it automatically
4. Re-run the test to confirm

## Resources

- **Error Reference**: See CLAUDE.md section "Safeguards against the Temporal Dead Zone (TDZ) bug"
- **Code Review Checklist**: CLAUDE.md includes a pre-review checklist
- **Full Project Context**: CLAUDE.md, STATUS.md, BACKGROUND.md

---

**Remember:** Static code review cannot find runtime errors. **Always run the browser test before committing.**
