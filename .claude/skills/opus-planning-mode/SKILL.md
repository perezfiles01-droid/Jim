---
name: opus-planning-mode
description: |
  High-level analysis and confirmation layer for every prompt. This skill intercepts your request, provides a comprehensive summary of what will be done (like Opus 5 would reason), then asks for confirmation before proceeding.
  
  Get detailed plans, automatic bug verification after each change, and seamless orchestration with the fix skill. One-at-a-time implementation with automatic verification — no manual testing needed.
---

# Opus Planning Mode - Integrated with Fix Skill for Coordinated Workflows

## What This Skill Does

This skill adds a **planning and confirmation layer** to every request. Instead of jumping straight into execution, you get:

1. **Detailed Summary** — A comprehensive breakdown of what you're asking for, written in clear, easy-to-understand terms
2. **Analysis of Approach** — How the work will be tackled, what steps it involves, and what you should expect
3. **Confirmation** — A chance to review and confirm, ask for changes, or provide additional context before we proceed

The skill stays lightweight on tokens (Haiku-level consumption) while delivering Opus-level thinking and planning.

**New in this version:** When implementing multiple changes, this skill **automatically coordinates with the fix skill** to verify each change for bugs before proceeding to the next. You get a seamless orchestrated workflow without interruption.

## How It Works

### The Planning Phase

When you submit a request, the skill immediately:

1. **Reads your prompt** — understands what you're asking for
2. **Generates a detailed plan** — breaks down:
   - What will be done (summary)
   - How it will be approached (strategy and steps)
   - What you'll get at the end (deliverables)
   - Any important assumptions or dependencies
3. **Presents it clearly** — formatted so it's easy to scan and understand

### The Confirmation Phase

After presenting the plan, you'll see:

```
Does this plan look right? 

Say "Yes" to proceed, or tell me what to change/adjust, 
and I'll revise and ask for confirmation again.
```

**Three paths forward:**

- **"Yes"** → We proceed with execution immediately
- **"Change X" / "Actually, I also need..."** → We revise the plan and reconfirm
- **Any feedback** → We incorporate it and ask again

This loop continues until you're satisfied with the plan.

### Execution Phase with Integrated Bug Verification

Once you confirm "Yes", the skill steps back and we execute the request **with automatic bug verification**:

**For SINGLE changes:**
- Implement the change
- Commit and push
- Done

**For MULTIPLE changes:**
```
CHANGE 1
  → Implement
  → FIX SKILL AUTO-VERIFIES (bug check)
     ├─ Bugs found? → Auto-fix → Re-verify
     └─ No bugs? → Continue
  → Commit and proceed to Change 2

CHANGE 2
  → Implement  
  → FIX SKILL AUTO-VERIFIES (bug check)
     ├─ Bugs found? → Auto-fix → Re-verify
     └─ No bugs? → Continue
  → Commit and proceed to Change 3

... (repeat for each change)
```

**You only confirm once at the start.** Between changes, I automatically verify with the fix skill and keep you updated on progress. No interruptions, no manual testing needed.

## Summary of the Plan Includes

When the skill presents a plan, it covers:

- **What** — A clear statement of what the work involves
- **Why** — Context on the approach and why it makes sense
- **How** — Step-by-step or phase-by-phase breakdown
- **Deliverables** — What you'll have at the end
- **Scope** — What's included and what's not (if relevant)
- **Assumptions** — Any key assumptions about your setup, requirements, or intent
- **Timeline / Effort** — Rough sense of scope (quick, medium, complex)

## Key Behaviors

1. **Always plan first** — Every request gets this treatment, no exceptions
2. **Detailed but readable** — We aim for comprehensive without being overwhelming
3. **Conversational** — If you ask for changes, we revise and re-present (not just execute)
4. **Token-efficient** — Despite detailed analysis, stays at Haiku 4.5 token levels
5. **No wasted motion** — Once confirmed, we execute efficiently without re-planning

## CRITICAL: Incremental Implementation for Multiple Changes

### When You Have Multiple Changes to Make

**DO NOT apply multiple changes all at once.** This skill ensures that when you have several changes planned, they are implemented **one at a time with automatic bug verification between each**.

### Incremental Change Protocol (Now with Auto-Verification)

1. **Plan the full sequence** — Show all planned changes in the plan
2. **Execute FIRST change only** — Implement just the first change (not all of them)
3. **FIX SKILL AUTOMATICALLY VERIFIES** — I invoke the fix skill to check for bugs
4. **Check for bugs** — The fix skill analyzes your code and reports findings
5. **If bugs found:** 
   - Fix skill stops the workflow
   - Diagnoses and fixes the bug automatically
   - Re-tests to confirm bug is fixed
   - Only then proceed to next change
6. **If no bugs found:**
   - Commit that change
   - Push to repository
   - Then move to NEXT change (back to step 2)
7. **Repeat for each change** until all are implemented

### Why Incremental Matters

**Problem with "do all changes at once":**
```
❌ Apply changes 1, 2, 3, 4 all together
❌ Test everything
❌ Something is broken — which change caused it?
❌ Multiple bugs may be hiding each other
❌ Hard to pinpoint the problem
❌ Risky to rollback (loses all progress)
```

**Solution: incremental approach with automatic verification**
```
✅ Apply change 1 only
✅ FIX SKILL VERIFIES (automatic, no manual testing)
✅ If bug in change 1 → auto-fixed → verified
✅ Commit change 1
✅ Apply change 2 only
✅ FIX SKILL VERIFIES (automatic)
✅ If bug in change 2 → auto-fixed → verified
✅ Commit change 2
... (repeat for changes 3, 4, etc.)
```

### Benefits

| Benefit | How It Helps |
|---------|------------|
| **Isolation** | Each change is tested in isolation; easy to identify which change caused a bug |
| **Safer** | If something breaks, it's only one change — easy to fix or revert |
| **Automated verification** | Fix skill checks each change automatically — no manual testing |
| **Cleaner history** | Each commit represents a stable, working state |
| **Better debugging** | Fewer moving parts to investigate when something goes wrong |
| **Easier reviews** | Each commit is focused and easy to understand |
| **Prevents cascades** | A bug in change 1 won't hide bugs in changes 2, 3, 4 |
| **No interruptions** | Verification happens automatically; you're not waiting for manual testing |

### Example: Dashboard Update (With Auto-Verification)

**Goal:** Improve dashboard with 4 changes
- Change 1: Update KPI tile styling
- Change 2: Add new visitor filter
- Change 3: Improve pagination
- Change 4: Optimize data loading

**Correct Process (Now Automated):**
```
CHANGE 1: Update KPI tile styling
  → Apply only this change
  → FIX SKILL AUTO-VERIFIES
     ├─ Bugs found? → Auto-fix → Re-verify
     └─ No bugs? ✅ Commit
  ↓
CHANGE 2: Add new visitor filter
  → Apply only this change
  → FIX SKILL AUTO-VERIFIES
     ├─ Bugs found? → Auto-fix → Re-verify
     └─ No bugs? ✅ Commit
  ↓
CHANGE 3: Improve pagination
  → Apply only this change
  → FIX SKILL AUTO-VERIFIES
     ├─ Bugs found? → Auto-fix → Re-verify
     └─ No bugs? ✅ Commit
  ↓
CHANGE 4: Optimize data loading
  → Apply only this change
  → FIX SKILL AUTO-VERIFIES
     ├─ Bugs found? → Auto-fix → Re-verify
     └─ No bugs? ✅ Commit
  ↓
✅ All 4 changes deployed safely, one at a time, with auto-verification
```

### Handling Bugs During Implementation

If a bug is found during implementation of Change 3:

1. **Fix skill automatically detects it** during verification
2. **Fix skill diagnoses the bug** without requiring you to check console
3. **Fix skill fixes it automatically** 
4. **Fix skill re-tests to confirm** the fix worked
5. **Make sure Change 1 + 2 still work** — fix skill checks for side effects
6. **Bug fix committed** as part of Change 3
7. **Only then move to Change 4**

**Never skip a bug to get to the next change.** The fix skill handles this automatically so you don't have to decide.

## Integration with Fix Skill

**Important:** When using this skill for multi-change implementations:

- After EACH change is implemented, I automatically invoke the **fix skill** to verify for bugs
- The fix skill uses deep code analysis (no console needed) to find any issues
- If bugs are found, the fix skill:
  - Diagnoses the root cause
  - Fixes it automatically
  - Re-tests to confirm the fix works
  - Reports back before we proceed
- If no bugs are found, we proceed immediately to the next change

**This means you get all the safety of incremental development without any of the manual testing overhead.**

## Bug Diagnosis and Fixing Workflow

When you report a bug or encounter an issue, this skill automatically engages **Opus-level diagnostic reasoning** to:

### 1. **Root Cause Analysis**
   - **Reproduce** — Gather exact symptoms, when it occurs, what changed
   - **Search** — Trace related code, check for similar issues, examine dependencies
   - **Diagnose** — Identify the real cause (not just the symptom):
     - Is it a logic error, scope issue, type mismatch, or architectural problem?
     - What was the intent vs. what is actually happening?
     - Are there hidden dependencies or side effects?

### 2. **Impact Assessment**
   - **Scope** — What else might be affected by this bug?
   - **Risk** — Could the fix break something else?
   - **Related Bugs** — Are there similar patterns elsewhere in the code?

### 3. **Fix Proposal and Validation**
   - **Propose** — Present the fix with clear explanation of why it works
   - **Test** — Verify the fix locally before deployment
   - **Validate** — Confirm no regressions or new issues introduced

### Common Bug Patterns in Web Dashboards

The skill learns from bugs found in this project:

**Scope & Visibility Issues:**
- Functions defined in module closures not accessible to other modules (e.g., `pager()` function only accessible within Department Insights)
- Fix: Move shared utilities to global scope or pass as parameters

**CSS Layout Problems:**
- Fixed `min-width` constraints preventing responsive design (e.g., `min-width: 900px` forcing horizontal scroll)
- Proportional grid columns not working at different zoom levels
- Fix: Use flexible grid layouts (`1fr 120px`) with reduced min-width constraints

**Pagination & Data Rendering:**
- Page state not tracking correctly across drill switches
- Missing or incorrect array slicing for pagination display
- Fix: Ensure state variables are isolated per drill, verify slice boundaries

**Event Binding & Handlers:**
- Click handlers not wiring correctly after pagination adds new elements
- Fix: Wire handlers after each render, use event delegation

**Type & Reference Errors:**
- Calling functions from wrong scope, accessing undefined properties
- Fix: Verify scope chain, test function availability before calling

## How to Trigger Planning Mode

Simply submit your request naturally:

- **"Update the dashboard with these 3 changes..."** → Planning starts
- **"I need to redesign the KPI tiles and add..."** → Plan presented
- **"Fix these 5 bugs I found..."** → Detailed plan shown

The skill will:
1. Ask clarifying questions if needed
2. Present a detailed plan with all steps
3. Show what will be done and how
4. Ask for your confirmation before proceeding
5. **For multiple changes:** Automatically verify each change with the fix skill

## Example Flow

**Your request:**
```
I need to make 3 improvements to the Department Insights dashboard:
1. Improve the visitor filter styling
2. Add export functionality to the drill tables
3. Optimize the data loading performance
```

**What the skill presents:**
```
## Plan: Improve Department Insights Dashboard (3 Changes)

### Change 1: Improve Visitor Filter Styling
What: Update CSS and layout for visitor filter buttons and date pickers
How: 
- Adjust button spacing and sizing in CSS
- Improve mobile responsiveness
- Add hover/active states
Expected time: Quick (30 min)

### Change 2: Add Export Functionality
What: Let users export drill table data to CSV
How:
- Add "Export" button to drill tables
- Implement CSV generation function
- Wire button to export handler
Expected time: Medium (2-3 hours)

### Change 3: Optimize Data Loading
What: Cache department data to avoid re-fetching on filter changes
How:
- Implement simple in-memory cache
- Check cache before calling API/split functions
- Invalidate cache on relevant changes
Expected time: Medium (2 hours)

### Order of Implementation
1. Change 1 first (no dependencies)
2. Change 2 second (independent feature)
3. Change 3 third (performance optimization)

### Each change will be:
- Implemented individually
- Verified automatically by the fix skill for bugs
- If bugs found, automatically fixed and re-tested
- Committed separately for clean history
- Tested for side effects before proceeding

Does this plan look right?
```

**Your response:** `"Yes, proceed with Change 1"`

**Then:**
- I implement Change 1 only
- **Fix skill automatically verifies** for bugs
- If no bugs found, I commit and ask before moving to Change 2
- **No manual testing needed** — fix skill handles it automatically

## Key Principles

1. **Plan everything upfront** — Know the full scope before starting
2. **Implement one change at a time** — No bundling multiple features
3. **Auto-verify each change** — Fix skill checks for bugs automatically
4. **Fix bugs immediately** — Don't accumulate technical debt
5. **Commit frequently** — Each change is a separate commit
6. **Confirm between changes** — Get approval before moving forward (when needed)

---

## Token Consumption

This skill uses Haiku 4.5-level tokens for both planning and execution:
- **Planning phase:** Concise but comprehensive analysis
- **Auto-verification:** Fix skill analysis happens in parallel with minimal overhead
- **Bug diagnosis:** Deep root-cause analysis using Opus-level reasoning
- **Execution:** Efficient implementation once confirmed

The skill is designed to catch issues early and fix them thoroughly, preventing regressions through incremental validation and automatic bug verification.

---

**Version:** 1.2 (Integrated with fix skill for automatic bug verification on multi-change workflows)  
**Last Updated:** 2026-08-18
