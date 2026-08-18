# Fix Skill

A comprehensive bug diagnosis and fixing skill for any code — HTML/JS dashboards, web apps, SPAs, backends, or any codebase.

## Contents

- **SKILL.md** — The main skill file with complete workflow and examples
- **references/bug-patterns.md** — Common bug patterns and how to fix them
- **scripts/syntax-check.sh** — Quick syntax validation script

## Installation

1. Save the skill file to your Claude Code skills directory
2. In Claude Code, the skill will appear in the available skills list
3. Use it by saying: "I have a bug in [file]" or "Fix this issue in my prototype"

## Quick Start

### Report a Bug
```
The Department Insights tiles are showing blank when I load the dashboard.
The visitor filter buttons don't do anything when clicked.
The pagination is showing the wrong data.
```

### The Skill Will:
1. ✅ Confirm which file to analyze
2. ✅ Ask for specific symptoms and reproduction steps  
3. ✅ Run deep root-cause analysis (Opus-level, Haiku-efficient)
4. ✅ Present diagnostic plan with proposed fix
5. ✅ Get your confirmation
6. ✅ Implement, verify, and deploy the fix

## Bug Types It Handles

- ✅ Syntax errors (unclosed braces, typos, etc.)
- ✅ Reference errors (undefined variables, scope issues)
- ✅ Logic errors (wrong comparison, inverted condition)
- ✅ Rendering/UI issues (blank content, hidden elements, CSS bugs)
- ✅ Data flow problems (API not called, state not updated, wrong totals)
- ✅ Event handling (click doesn't work, handlers not wired)
- ✅ Async/Promise issues (race conditions, missing await)
- ✅ Pagination/state bugs (wrong page, data slicing errors)
- ✅ Performance issues (infinite loops, slow renders)
- ✅ Any custom patterns specific to your projects

## Key Features

**Opus-Level Analysis, Haiku-Efficient**
- Deep root-cause diagnosis without excessive token usage
- Targeted code search (doesn't read entire files unnecessarily)
- Pattern matching from your project's bug history

**Comprehensive Coverage**
- Works with any prototype (HTML/JS, Vue, React, Node.js, etc.)
- Handles all bug types and error classes
- Learns from previous fixes in your projects

**Guided Workflow**
- Confirm which file before analyzing
- Get diagnostic plan before implementing
- No silent failures — each step verified

**Deployment Ready**
- Commits with clear messages
- Pushes to designated branch per your conventions
- Advises on cache refresh if needed

## Helper Tools

### Syntax Check Script
```bash
./scripts/syntax-check.sh index.html
./scripts/syntax-check.sh app.js
```

Quickly validates:
- Brace/parenthesis/bracket balance
- Node.js syntax validation
- Suspicious patterns (missing awaits, unbalanced logic)

### Bug Patterns Reference
See `references/bug-patterns.md` for 10 common patterns:
1. Undefined variables/functions
2. Off-by-one array errors
3. Scope issues
4. Syntax errors
5. Null/empty data
6. Event handlers not wired
7. CSS overflow/hidden content
8. Wrong data source
9. Async/Promise issues
10. Wrong comparison operators

Each pattern includes:
- Symptoms to recognize it
- Common causes
- Fix checklist
- Real code examples

## Example: Bug Report Flow

**You:** "The Disposal section KPI tiles disappeared after I made changes"

**Skill:** 
1. Confirms: "Which file? `index.html`?"
2. Asks: "What should show? What actually shows?"
3. Analyzes: Searches for `drawDisposal()`, checks if it's called from `drawDrill()`
4. Finds: Syntax error in disposal function (missing closing brace in template literal)
5. Proposes: "Add closing backtick at line X"
6. You confirm: "Yes, fix it"
7. Implements: Fixes the backtick, runs syntax check, commits, pushes
8. Verifies: "Tiles should render now. Hard-refresh to test."

## Triggering the Skill

**Use it when:**
- ❌ Something's broken in your prototype
- ❌ You see an error in the browser console
- ❌ A feature that worked yesterday doesn't work today
- ❌ Content is missing, wrong, or showing incorrectly
- ❌ Something hangs or crashes
- ❌ You need to understand WHY something is broken

**Don't use it for:**
- ✅ New feature requests
- ✅ Design/styling decisions
- ✅ Performance optimization (use profiler first)
- ✅ Test writing

## Tips for Best Results

1. **Describe the symptom specifically:**
   - ❌ "It's broken"
   - ✅ "The Visitor count shows 0 instead of 1,234"

2. **Say when it started:**
   - "Worked yesterday, broke when I added the disposal function"

3. **Include error messages:**
   - If you see red errors in the console, share them

4. **Explain the impact:**
   - "Only happens on the Visitors drill" narrows the search

5. **Be patient:**
   - Deep analysis takes a moment, but catches real causes

## After the Fix

1. **Hard-refresh your browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Test the specific scenario** that was broken
3. **Check for side effects** ("Did I break something else?")
4. **Report back** if the fix didn't work or introduced new issues

## Support

If a fix doesn't work:
- Share what you expected vs. what happened
- Say whether the fix was applied
- Check browser console for new errors
- The skill will re-diagnose with more information

The skill learns from every bug fix, so recurring patterns get caught faster next time.

---

**Version:** 1.0  
**Last Updated:** 2026-08-18  
**Token Efficiency:** Opus-level analysis, Haiku-4.5 token consumption
