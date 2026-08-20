---
name: opus-planning-mode
description: |
  High-level analysis and confirmation layer for every prompt. This skill intercepts your request, provides a comprehensive summary of what will be done (like Opus 5 would reason), then asks for confirmation before proceeding.
  
  Get detailed plans, automatic bug verification after each change, seamless orchestration with the fix skill, and autonomous execution. One-at-a-time implementation with automatic verification — no manual testing needed. Once you confirm "Yes", the skill executes fully autonomously: implements each change, auto-verifies for bugs, commits, pushes, merges to main, and moves to the next change without interruption.
compatibility: Read, Edit, Bash, Grep, Agent
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

### Execution Phase with Integrated Verification & Autonomous Deployment

Once you confirm "Yes", the skill **executes fully autonomously** — you don't need to do anything else:

**For SINGLE changes:**
- Implement the change
- Comprehensive verification (see standards below)
- Commit and push
- Merge to main
- Deploy to live site
- Done ✅

**For MULTIPLE changes:**
```
CHANGE 1
  → Implement
  → COMPREHENSIVE VERIFICATION
     ├─ Issues found? → Fix → Re-verify → Continue
     └─ Fully compliant? → Continue
  → Commit → Push → Merge to main → Deploy
  ↓
CHANGE 2 (START AUTOMATICALLY)
  → Implement
  → COMPREHENSIVE VERIFICATION
     ├─ Issues found? → Fix → Re-verify → Continue
     └─ Fully compliant? → Continue
  → Commit → Push → Merge to main → Deploy
  ↓
CHANGE 3 (START AUTOMATICALLY)
  → Implement
  → COMPREHENSIVE VERIFICATION
     ├─ Issues found? → Fix → Re-verify → Continue
     └─ Fully compliant? → Continue
  → Commit → Push → Merge to main → Deploy
  ↓
✅ All changes deployed to live site — no interruptions
```

**You only confirm once at the start** ("Yes"). After that, I automatically:
- Execute each change
- Run comprehensive verification (functional + requirement alignment + UX check)
- Fix any issues found and re-verify
- Commit and push changes only when fully compliant
- Merge to main immediately when ready
- Progress to the next change without asking

**Status updates:** Brief progress notifications after each change is deployed (e.g., "✅ Change 2 deployed. Starting Change 3...")

## Comprehensive Verification Standards

After each change is implemented, verification checks **four critical dimensions**:

### 1. **Syntax & Logic Correctness**
- ✅ No unclosed braces, quotes, or brackets
- ✅ Functions exist and are callable
- ✅ Variables are defined and in scope
- ✅ No obvious logic errors (wrong operators, inverted conditions, etc.)

### 2. **Requirement Alignment** (NEW — Critical)
- ✅ Does the implementation actually do what was requested?
- ✅ Are all requested features present and working?
- ✅ Was anything from the requirement missed or partially implemented?
- ✅ Example: If requirement says "button highlight updates on click", verify it actually does — not just that the code has no syntax errors

### 3. **User Experience & Usability** (NEW — Critical)
- ✅ Is the feature intuitive and easy to use?
- ✅ Are UI states clear and communicative?
- ✅ Is it obvious to users what they should do next?
- ✅ Would a real user find this production-ready or would they notice issues?
- ✅ Example: Button highlight must visually show which filter is active — if it doesn't, it's not user-friendly even if code is correct

### 4. **Production Readiness**
- ✅ Can a user actually use this feature end-to-end?
- ✅ Are there any edge cases or gotchas?
- ✅ Does the feature work as users would expect?
- ✅ Is it better than the previous version or does it introduce problems?

### If Verification Fails on ANY Dimension:
- The change is NOT deployed
- The issue is diagnosed and fixed automatically
- Verification runs again
- Only when **all four dimensions pass** does the change merge to main

**This means:** "No syntax errors" ≠ "Ready to deploy". Ready to deploy means it actually works as intended and users will be satisfied.

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
3. **Conversational during planning** — If you ask for changes, we revise and re-present (not just execute)
4. **Token-efficient** — Despite detailed analysis, stays at Haiku 4.5 token levels
5. **No wasted motion** — Once confirmed, we execute fully autonomously without asking for approval between changes
6. **Fully autonomous execution** — After you confirm "Yes":
   - Each change is implemented, verified, committed, pushed, and merged automatically
   - No asking permission to continue to the next change
   - No asking permission to merge (ready = merged immediately)
   - Only report progress, don't wait for confirmation
7. **Silent verification** — Fix skill runs automatically after each change; only report if bugs found

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

## Integration with Comprehensive Verification

**Important:** When using this skill for multi-change implementations:

- After EACH change is implemented, I automatically perform **comprehensive verification** (not just syntax checking)
- Verification includes:
  1. **Code correctness** — syntax, logic, scope, references
  2. **Requirement alignment** — does it actually do what was requested?
  3. **User experience** — is it intuitive, usable, production-ready?
  4. **Functional testing** — does it work end-to-end as intended?

- If issues are found on ANY dimension:
  - I diagnose the root cause
  - Fix it automatically
  - Re-verify comprehensively
  - Only then proceed to next change

- If all four dimensions pass:
  - Change is ready to deploy
  - Commit, push, merge to main immediately
  - Proceed to next change

**This means:** You get safety, functionality, AND user satisfaction. "No bugs" doesn't just mean syntax is correct — it means the feature is actually usable and meets your requirements.

## Execution Control Flow (Critical Fix)

### When User Confirms "Yes"

The skill **immediately transitions to autonomous execution mode**. Here's the explicit control flow:

```
USER CONFIRMS "Yes"
  ↓
EXECUTION PHASE BEGINS (Skill now operates autonomously)
  ↓
FOR EACH CHANGE IN PLAN:
  ├─ 1. IMPLEMENT
  │    └─ Make the code change(s)
  │
  ├─ 2. VERIFY PHASE
  │    ├─ Invoke Fix skill automatically
  │    ├─ Fix skill analyzes code for bugs
  │    │  ├─ Bugs found? → Fix skill fixes, then re-verify (GOTO verify loop)
  │    │  └─ No bugs? → Continue
  │    ├─ Browser/runtime testing (run check.js if HTML change)
  │    │  ├─ Errors found? → Fix, re-test (GOTO verify loop)
  │    │  └─ Clean? → Continue
  │    └─ Requirement alignment check
  │       ├─ Missing feature or wrong behavior? → Fix, re-verify (GOTO verify loop)
  │       └─ Fully compliant? → Continue
  │
  ├─ 3. COMMIT & PUSH
  │    ├─ git add [changed files]
  │    ├─ git commit -m "Change X: [description]"
  │    └─ git push origin [branch]
  │
  ├─ 4. MERGE TO MAIN
  │    ├─ git checkout main
  │    ├─ git merge --no-edit [branch]
  │    ├─ git push origin main
  │    └─ git checkout [branch]
  │
  ├─ 5. STATUS REPORT
  │    └─ Brief message: "✅ Change X deployed. Starting Change Y..."
  │
  └─ (CONTINUE TO NEXT CHANGE)

ALL CHANGES COMPLETE
  ↓
FINAL STATUS: "✅ All changes deployed to main"
  ↓
END
```

### Verification Loop (Silent Unless Issues Found)

```
VERIFY CHANGE
  ↓
  ├─ SYNTAX CHECK (Read code, check braces, brackets, scope)
  │  └─ Issues? → Report + Fix
  │
  ├─ LOGIC CHECK (Trace execution paths, check operators, conditions)
  │  └─ Issues? → Report + Fix
  │
  ├─ REQUIREMENT ALIGNMENT (Does it do what was asked?)
  │  └─ Missing feature? → Report + Fix
  │
  ├─ UX/USABILITY (Would a user find this ready to use?)
  │  └─ Issues? → Report + Fix
  │
  ├─ RUNTIME TEST (If applicable: browser test, API check)
  │  └─ Errors? → Report + Fix
  │
  └─ All checks pass? → Mark READY TO DEPLOY
```

### Key Rules for Execution Phase

1. **No interruptions once "Yes" is given** — The skill runs to completion without asking for additional confirmations
2. **Silent verification** — Only report issues if they're found; if verification passes, don't narrate each step
3. **Auto-fix on verification failure** — When the fix skill finds a bug, it fixes it; no waiting for user input
4. **Re-verify after any fix** — Every fix is immediately re-tested to confirm it worked
5. **One change at a time** — Never bundle multiple changes in one commit; each change is isolated
6. **Auto-merge when ready** — Don't ask "should I merge?"; ready = merged immediately
7. **Track progress visually** — User sees: "Change 1 deployed → Change 2 deployed → All done"

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

## The "Yes" Transition: From Planning to Autonomous Execution

**THIS IS THE CRITICAL PART THAT MAKES THE SKILL WORK:**

### Planning Phase (User Input Required)
When you submit a request → Skill analyzes it → Skill presents comprehensive plan → **Skill STOPS and WAITS**

```
Skill: "Here's the plan: [plan details]

Does this plan look right? Say 'Yes' to proceed..."
```

### User Says "Yes"
Your single word "Yes" is the **execution trigger**. It signals:
- ✅ Plan is approved as-is
- ✅ Skill should NOW switch to autonomous execution mode
- ✅ Skill should STOP asking for confirmation
- ✅ Skill should implement and deploy all changes without further input

### Execution Phase (No User Input Required)
Skill transitions into autonomous mode and:
```
1. Implement change 1 (only change 1, not all of them)
2. Verify change 1 comprehensively (invoke fix skill automatically)
3. If bugs found → Fix skill fixes them → Re-verify
4. When verified: commit → push → merge to main
5. Brief progress update: "✅ Change 1 deployed. Starting Change 2..."
6. Implement change 2 (repeat verification and merge)
7. ... (continue for each change)
8. Final status: "✅ All changes deployed"
```

**IMPORTANT:** Between step 5 and 6, there is NO pause waiting for your confirmation. The skill automatically proceeds to the next change. You only confirm once ("Yes"), then the workflow runs to completion.

### If Plan Needs Revision (You Don't Say "Yes")
If the plan isn't quite right, you provide feedback:
```
You: "Actually, I also need to update the chart colors"
Skill: "Got it. Here's the revised plan: [updated plan]

Does this work now?"
```

Then the loop repeats until you say "Yes".

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

**Your response:** `"Yes"`

**Then (fully autonomous, no more confirmation needed):**
- I implement Change 1 only
- **Fix skill automatically verifies** for bugs (silent if none found)
- If bugs found: auto-fixed and re-verified
- Commit, push, and merge to main immediately
- Start Change 2 automatically (no asking for permission)
- Repeat for Changes 3, 4, etc.
- **Status updates only** — e.g., "✅ Change 1 deployed. Starting Change 2..."
- **You get notified when all changes are complete**

## Troubleshooting: "Skill Not Functioning"

If the skill doesn't seem to be working, here are the most common issues and fixes:

### Issue 1: Skill asks for confirmation multiple times after "Yes"
**Problem:** After you say "Yes", the skill should run autonomously, but it keeps asking "Does this look right?" or "Should I proceed?"

**Fix:** The skill should **switch modes** after "Yes". If this isn't happening, check:
- [ ] Skill is receiving your "Yes" message (not getting cut off or ignored)
- [ ] Skill is transitioning to execution phase (not stuck in planning loop)
- [ ] Each change is being implemented one at a time (not all bundled)
- [ ] Skill is committing and merging after each change (not staging everything at the end)

**Action:** If the skill asks for confirmation after you've already said "Yes", that means it's still in planning mode when it should be in execution mode. This is a critical bug in the workflow.

### Issue 2: Skill doesn't invoke fix skill for automatic verification
**Problem:** You say "Yes", changes get made, but they're committed without verification. The fix skill is never invoked.

**Fix:** After each change is implemented, the skill MUST invoke the fix skill automatically to verify no bugs were introduced. If this isn't happening:
- [ ] After implementing change 1, skill should call fix skill (not ask you to test)
- [ ] Fix skill output should appear (either "no bugs found" or bug diagnosis)
- [ ] If bugs found, fix skill should fix them automatically
- [ ] Only after verification passes should the commit happen

**Action:** If changes are being committed without fix skill verification, the autonomous verification workflow is broken.

### Issue 3: Skill doesn't auto-merge to main
**Problem:** Changes are committed and pushed, but not merged to main. They sit on the feature branch.

**Fix:** Standing instruction: "Every accepted change is merged to main, never ask". After each change is verified:
- [ ] `git checkout main`
- [ ] `git merge --no-edit [branch]`
- [ ] `git push origin main`
- [ ] `git checkout [branch]`

**Action:** If changes aren't auto-merging, check git history. Changes should be landing on main immediately after verification passes, not sitting on feature branches.

### Issue 4: Skill doesn't implement changes one at a time
**Problem:** Multiple changes get bundled into one big commit instead of separate commits.

**Fix:** The "incremental protocol" requires:
- [ ] Implement ONLY change 1 (not changes 1, 2, 3 all at once)
- [ ] Verify change 1
- [ ] Commit change 1
- [ ] Then implement change 2
- [ ] Each change is a separate commit with clear message

**Action:** If multiple changes are in one commit, the skill isn't following the incremental protocol correctly.

### Issue 5: Skill doesn't provide status updates
**Problem:** After you say "Yes", you get no feedback about what's happening.

**Fix:** The skill should provide brief status messages as it progresses:
```
✅ Change 1 (Improve visitor filter styling) deployed to main.
Starting Change 2 (Add export functionality)...

✅ Change 2 deployed to main.
Starting Change 3 (Optimize data loading)...

✅ Change 3 deployed to main.
All changes complete!
```

**Action:** If you're getting silence after "Yes", the skill might be executing but not reporting. Check git history to see if changes actually landed on main.

### How to Report a Skill Bug

If the skill isn't working as described above:

1. **Describe what you asked for** — Be specific about the request
2. **Describe what should happen** — Reference the workflow above
3. **Describe what actually happened** — What did the skill do instead?
4. **Provide evidence** — Git log, error messages, or specific behavior
5. **Example:** "I said 'Yes', but the skill asked 'Does this look right?' again. It's stuck in planning mode. Here's the git log showing no commits were made."

With this information, the skill can be debugged and fixed.

## Key Principles

1. **Plan everything upfront** — Know the full scope before starting
2. **One confirmation only** — You confirm the plan once ("Yes"), then everything runs autonomously
3. **Implement one change at a time** — No bundling multiple features
4. **Auto-verify each change** — Fix skill checks for bugs automatically
5. **Fix bugs immediately** — Don't accumulate technical debt
6. **Commit frequently** — Each change is a separate commit
7. **Auto-merge when ready** — No asking permission; ready = merged to main immediately
8. **No interruptions** — Once you say "Yes", the workflow runs uninterrupted until complete

---

## Token Consumption

This skill uses Haiku 4.5-level tokens for both planning and execution:
- **Planning phase:** Concise but comprehensive analysis
- **Auto-verification:** Fix skill analysis happens in parallel with minimal overhead
- **Bug diagnosis:** Deep root-cause analysis using Opus-level reasoning
- **Execution:** Efficient implementation once confirmed

The skill is designed to catch issues early and fix them thoroughly, preventing regressions through incremental validation and automatic bug verification.

---

**Version:** 2.1 (Comprehensive Verification with Requirement & UX Alignment)  
**Last Updated:** 2026-08-18  
**Changes in v2.1:**
- Comprehensive verification now checks four dimensions: syntax, requirement alignment, UX/usability, production readiness
- "No bugs" now means fully functional and user-ready, not just syntax-correct
- Verifies that implemented features actually match what was requested
- Checks user experience — is it intuitive and would users be satisfied?
- Won't deploy unless all four verification dimensions pass
- Auto-fixes any issues found and re-verifies before deploying

**Previous versions:**
- v2.0: Fully autonomous execution with auto-merge, silent bug verification
- v1.2: Integrated with fix skill for automatic bug verification on multi-change workflows
