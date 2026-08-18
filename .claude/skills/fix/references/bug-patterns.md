# Common Bug Patterns Reference

This guide helps identify bugs faster by recognizing common patterns. When diagnosing a bug, check if it matches one of these patterns.

## 1. Undefined Variable or Function

**Pattern:** "Cannot read property X of undefined" error in console

**Symptoms:**
- Script stops executing
- Functions don't run
- Values are undefined/null

**Common Causes:**
- Variable used before declaration
- Function not defined in current scope
- Async function result not awaited
- Element querySelector returns null (element doesn't exist)

**Fix Checklist:**
- [ ] Is the variable declared before use?
- [ ] Is the function defined in global or current scope?
- [ ] If async, is there an await or .then()?
- [ ] Does the DOM element exist?
- [ ] Is data loaded before trying to use it?

**Example:**
```javascript
// ❌ WRONG - drawTiles() called before D() defined
drawTiles(); // tries to call D() which doesn't exist yet
function D() { ... }

// ✅ RIGHT - define first, then call
function D() { ... }
drawTiles();
```

---

## 2. Off-by-One Array Error

**Pattern:** Pagination shows wrong data, array slice cuts off first/last item, loop runs one too many/few times

**Symptoms:**
- Table missing first or last row
- Pagination skips data
- Loop iterates 10 times instead of 9

**Common Causes:**
- Array index starts at 1 instead of 0
- Slice boundaries wrong: `slice(0, 10)` vs `slice(0, 11)`
- Loop condition uses `<=` instead of `<`
- Page calculation: `(page-1)*size` vs `page*size`

**Fix Checklist:**
- [ ] Does loop start at 0 or 1?
- [ ] Slice end index includes or excludes the boundary?
- [ ] Is pagination math: `(page-1)*pageSize` to `page*pageSize`?
- [ ] Test with exactly 10 items to verify boundaries

**Example:**
```javascript
// ❌ WRONG - slice(0, 10) gets items 0-9 (10 items), but start should be 0
const page = rows.slice(0, 10); // works for page 1
const page = rows.slice(10, 20); // works for page 2
// But if you're calculating: (page-1)*10, it should be (page-1)*10 to page*10

// ✅ RIGHT
const start = (page - 1) * pageSize;
const end = page * pageSize;
const pageData = rows.slice(start, end);
```

---

## 3. Scope Issue

**Pattern:** Function or variable works in one file/module but not another, "X is not defined"

**Symptoms:**
- Function defined in module A, can't be called from module B
- Variable exists but shows undefined in one context
- Global vs local confusion

**Common Causes:**
- Function defined inside IIFE/closure, not accessible outside
- Variable shadowed by same name in inner scope
- ES6 module export/import missing
- Variable declared with `let`/`const` in block scope, not accessible outside

**Fix Checklist:**
- [ ] Is the function/variable at global scope or inside a closure?
- [ ] Does module B have access to module A's code?
- [ ] Is it exported from module A and imported in module B?
- [ ] Any variable shadowing (same name used in different scopes)?

**Example:**
```javascript
// ❌ WRONG - pager() only accessible within Department Insights module
(function(){
  function pager() { ... } // local to this IIFE
  
  // Bank-wide module can't call pager()
  document.getElementById("bw-pager").innerHTML = pager(); // ERROR
})();

// ✅ RIGHT - move pager() to global scope
function pager() { ... } // now accessible everywhere

(function(){
  document.getElementById("dp-pager").innerHTML = pager(); // works
})();

(function(){
  document.getElementById("bw-pager").innerHTML = pager(); // works
})();
```

---

## 4. Syntax Error

**Pattern:** Script stops running, browser console shows red error on specific line

**Symptoms:**
- Nothing works after the error
- Page partially loads but stops
- All functionality broken

**Common Causes:**
- Unclosed bracket, brace, or parenthesis
- Missing or extra quote
- Wrong operator (`=` instead of `==`, `===`)
- Typo in keyword (e.g., `funciton` instead of `function`)

**Fix Checklist:**
- [ ] Are all `{` `}` matched?
- [ ] Are all `(` `)` matched?
- [ ] Are all strings quoted correctly?
- [ ] Any typos in keywords or function names?
- [ ] Template literals using backticks, not quotes?

**Example:**
```javascript
// ❌ WRONG - missing closing brace
if(condition) {
  doSomething()
  // forgot } here
  doAnotherThing();

// ✅ RIGHT
if(condition) {
  doSomething();
} // properly closed
doAnotherThing();
```

---

## 5. Null/Empty Data

**Pattern:** Values show 0, blank, or undefined; calculations give NaN

**Symptoms:**
- KPI tiles blank or show 0
- Tables empty
- Sums/counts show NaN or undefined

**Common Causes:**
- Data object not populated before using it
- Array empty when should have items
- Null checks missing before accessing properties
- API call hasn't completed yet

**Fix Checklist:**
- [ ] Is data loaded before trying to display it?
- [ ] Does the array/object have any items?
- [ ] Any null checks needed before `.property` access?
- [ ] If async data, is there a loading state?
- [ ] Are you reading from the right data source?

**Example:**
```javascript
// ❌ WRONG - trying to draw before data loads
drawTiles(); // expects D() to have data
const D = () => dept ? DEPTS.find(...) : null; // D() is null!

// ✅ RIGHT - make sure data exists first
function init() {
  // data already loaded at this point
  drawTiles(); // now D() has data
}
```

---

## 6. Event Handler Not Wired

**Pattern:** Button click does nothing, pagination doesn't work, dropdown selection ignored

**Symptoms:**
- Element is visible and clickable
- But action doesn't happen
- Console shows no error

**Common Causes:**
- `.onclick` never set
- Handler added to wrong element (parent/child mismatch)
- Handler added before element exists in DOM
- Dynamic elements: new rows added, but handlers only on original rows

**Fix Checklist:**
- [ ] Is the element's `.onclick` (or `.addEventListener`) actually called?
- [ ] Is the handler wired to the RIGHT element?
- [ ] Is the element in the DOM when handler is wired?
- [ ] After dynamically adding elements, are handlers re-wired?
- [ ] Check console for any error in the handler function?

**Example:**
```javascript
// ❌ WRONG - handler not wired
document.getElementById("my-button").innerHTML = `<button>Click me</button>`;
// Forgot to add: document.getElementById("my-button").onclick = () => { ... }

// ✅ RIGHT - wire the handler
document.getElementById("my-button").innerHTML = `<button>Click me</button>`;
document.getElementById("my-button").onclick = () => {
  console.log("Button clicked!");
};

// Or for dynamic elements:
document.querySelectorAll(".row").forEach(row => {
  row.onclick = () => { console.log("Row clicked"); };
});
```

---

## 7. CSS Overflow/Hidden Content

**Pattern:** Content exists in DOM but doesn't show, element hidden off-screen, text cut off

**Symptoms:**
- Element invisible but in page source
- Scrollbar appears unexpectedly
- Text truncated

**Common Causes:**
- `display: none` or `visibility: hidden`
- `overflow: hidden` cutting off content
- `max-height` or `max-width` too small
- `position: absolute` with wrong top/left/z-index
- `min-width` forcing horizontal scroll

**Fix Checklist:**
- [ ] Check `display`, `visibility`, `overflow` properties
- [ ] Any `max-width`/`max-height` constraints?
- [ ] If positioned absolutely, are top/left/z-index correct?
- [ ] Is a parent container hiding overflow?
- [ ] Try `display: block !important` to test visibility

**Example:**
```css
/* ❌ WRONG - min-width forces horizontal scroll */
.table {
  min-width: 900px;
  /* on mobile/narrow screen, forces scroll */
}

/* ✅ RIGHT - use flexible width */
.table {
  min-width: 0; /* allow shrinking */
  width: 100%;
  overflow-x: auto; /* scroll if needed */
}
```

---

## 8. Wrong Data Source

**Pattern:** Values look right but they're wrong; different dashboards show different numbers for same data

**Symptoms:**
- KPI shows 100, should be 50
- Numbers don't add up
- Department total ≠ sum of sites
- Visitor count wrong after filter

**Common Causes:**
- Reading from cache instead of filtered data
- Using old totals instead of recalculated sums
- Missing weight recalculation after filter
- Array vs single value confusion

**Fix Checklist:**
- [ ] Is the data source the intended one?
- [ ] After changes (filter, sort), is data recalculated?
- [ ] Are weights/splits applied correctly?
- [ ] Sum/total calculation matches the data it reads from?
- [ ] Debug: `console.log(dataSource)` to verify content

**Example:**
```javascript
// ❌ WRONG - reading from original total, not filtered
applyVisitorFilter(); // updates DEPTS.visitors
drawTiles(); // but uses d.visitors which still reads original cached total

// ✅ RIGHT - recalculate sum after filter
applyVisitorFilter();
rebuildALL(); // recalculates ALL.visitors from updated DEPTS
drawTiles(); // now gets correct filtered total
```

---

## 9. Async/Promise Not Awaited

**Pattern:** Code runs before async operation completes, data is undefined

**Symptoms:**
- "Cannot read X of undefined" even though X should exist
- Data missing until page refreshes
- Timing-dependent bugs (works sometimes, not always)

**Common Causes:**
- `.then()` chaining wrong
- Missing `await` in async function
- `.fetch()` used but result not awaited
- Callback provided but not called

**Fix Checklist:**
- [ ] Is async operation awaited or chained with `.then()`?
- [ ] Are dependent operations INSIDE the `.then()` or AFTER the `await`?
- [ ] Error handling: is `.catch()` added?
- [ ] Test: does it work if you `await` the operation?

**Example:**
```javascript
// ❌ WRONG - tries to use data before fetch completes
fetch('/api/data').then(r => r.json()).then(data => { /* ... */ });
drawTiles(); // runs immediately, data not loaded yet!

// ✅ RIGHT - draw after data loads
async function init() {
  const response = await fetch('/api/data');
  const data = await response.json();
  drawTiles(); // now data is ready
}

// Or with .then()
fetch('/api/data')
  .then(r => r.json())
  .then(data => {
    drawTiles(); // inside .then(), after data loads
  });
```

---

## 10. Wrong Comparison Operator

**Pattern:** Condition always true/false when should be opposite

**Symptoms:**
- Logic inverted (shows when should hide)
- Wrong values filtered out
- State stuck in one condition

**Common Causes:**
- `==` vs `===` (type coercion)
- `>` when should be `>=`
- `&&` when should be `||`
- Missing `!` (negation)
- Condition backwards

**Fix Checklist:**
- [ ] Are you comparing the right types? (use `===`)
- [ ] Boundary correct? (`>` vs `>=`)
- [ ] Logic correct? (`&&` vs `||`)
- [ ] Negation right? (`if(x)` vs `if(!x)`)
- [ ] Test with boundary values (0, -1, "", null)

**Example:**
```javascript
// ❌ WRONG - condition inverted
if(page < pages) { // show next button when can't go next
  showNextButton();
}

// ✅ RIGHT
if(page < pages) { // show next button when there are more pages
  showNextButton();
}

// ❌ WRONG - using > instead of >=
if(idle > 180) { // misses exactly 180
  markIdle();
}

// ✅ RIGHT
if(idle >= 180) { // includes exactly 180
  markIdle();
}
```

---

## Quick Diagnosis Checklist

When a bug occurs, run through this order:

1. **Console errors?** → Fix syntax/undefined error (1-3, 4)
2. **Data blank/0?** → Check data loading (5, 8)
3. **Wrong values?** → Check data source and math (8, 10)
4. **Button/UI doesn't work?** → Check event handler (6)
5. **Content hidden?** → Check CSS (7)
6. **Off-by-one results?** → Check array/pagination math (2)
7. **Variable undefined in one place?** → Check scope (3)

Most bugs fall into these 10 patterns. Once you recognize the pattern, the fix is usually straightforward.
