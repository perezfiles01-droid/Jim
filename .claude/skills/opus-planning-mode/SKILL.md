---
name: opus-planning-mode
description: |
  High-level analysis and confirmation layer for complex requests. Provides a comprehensive summary of what will be done (like Opus 5 would reason), then asks for confirmation before proceeding.
  
  Creates detailed plans, verifies each change with the fix skill, and implements changes one at a time. Once you confirm "Yes", executes autonomously: implements, verifies, commits, pushes, and merges each change to main without interruption.
compatibility: Read, Edit, Bash, Grep, Agent, Skill
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

## Execution Control Flow

### When User Confirms "Yes"

After you confirm "Yes", the skill **enters autonomous execution mode** and implements changes according to this workflow:

```
USER CONFIRMS "Yes"
  ↓
EXECUTION BEGINS (No more confirmations needed)
  ↓
FOR EACH CHANGE IN PLAN:
  ├─ 1. IMPLEMENT
  │    └─ Make the code change(s)
  │
  ├─ 2. VERIFY WITH FIX SKILL
  │    ├─ Invoke /fix skill to analyze for bugs
  │    ├─ Bugs found? → fix skill outputs diagnosis
  │    │              → I fix the issues
  │    │              → Re-verify with fix skill
  │    │              → Repeat until clean
  │    └─ No bugs? → Continue
  │
  ├─ 3. COMMIT & PUSH
  │    ├─ git add [changed files]
  │    ├─ git commit -m "Change X: [description]"
  │    └─ git push origin [branch]
  │
  ├─ 4. MERGE TO MAIN (Per standing instruction)
  │    ├─ git checkout main
  │    ├─ git merge --no-edit [branch]
  │    ├─ git push origin main
  │    └─ git checkout [branch]
  │
  ├─ 5. STATUS REPORT
  │    └─ Brief message: "✅ Change X deployed. Starting Change Y..."
  │
  └─ (CONTINUE TO NEXT CHANGE - no pause, no asking for permission)

ALL CHANGES COMPLETE
  ↓
FINAL STATUS: "✅ All changes deployed to main"
```

### Verification Checklist

When verifying each change, I check:

- ✅ **Syntax & Correctness** — No broken code, proper structure, all braces/brackets closed
- ✅ **Requirement Alignment** — Does it actually do what was requested?
- ✅ **Logic & Scope** — Variables declared before use, functions in scope, no temporal dead zone issues
- ✅ **User Experience** — Is it intuitive and production-ready?
- ✅ **Runtime Testing** — For HTML changes, run browser tests (e.g., check.js)

### Key Behaviors During Execution

1. **No interruptions after "Yes"** — Workflow runs to completion, one change at a time
2. **Auto-invoke fix skill** — After implementing each change, I call the fix skill automatically (no manual testing)
3. **Silent verification** — Only report issues if found; clean changes don't need narration
4. **Auto-fix and re-verify** — When fix skill finds a bug, I fix it and re-verify immediately
5. **One change at a time** — Each change is isolated in its own commit
6. **Auto-merge per standing instruction** — Each verified change is merged to main immediately (standing instruction from 17 August 2026)
7. **Progress updates** — Brief status after each change completes

## How Verification Works With Fix Skill

When I implement a change, here's how verification happens:

### 1. Invoke Fix Skill
```bash
/fix
```
This analyzes the code I just changed for:
- Syntax errors and logic bugs
- Variables properly declared and in scope
- Functions available where they're called
- Type mismatches and reference errors
- Temporal dead zone issues (especially in dashboards)

### 2. Review Fix Skill's Findings

Fix skill reports:
- ✅ **No issues found** → Code is clean, proceed to commit
- ❌ **Issues found** → Get specific findings (file, line, description)

### 3. Fix & Re-Verify

If issues are found:
- I read the specific findings
- I make corrections to the code
- I invoke /fix again to re-verify
- Repeat until clean

### 4. Commit When Verified

Only after fix skill confirms no issues do I:
- `git add` the changed files
- `git commit` with a clear message
- `git push` to the feature branch
- `git merge` to main per standing instruction

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

## How The Skill Works: Planning → Confirmation → Execution

### Phase 1: Planning (Your Input Required)

When you invoke the skill with a request:

1. I analyze what you're asking for
2. I break it down into specific changes
3. I present a **detailed plan** with:
   - What each change involves
   - How I'll approach it
   - What the end result will be
   - Any assumptions or dependencies

```
You: "I need to make 3 improvements to the dashboard..."

Me: "Here's my plan:

## Change 1: Update styling
What: Modify CSS and layout
How: [step by step]
Time: ~30 min

## Change 2: Add filter
What: New visitor filter
How: [step by step]
Time: ~1-2 hours

## Change 3: Optimize data
What: Cache department data
How: [step by step]
Time: ~2 hours

Does this plan look right? Say 'Yes' to proceed, or tell me what to change."
```

### Phase 2: Confirmation (Your Decision)

You have three options:

**Option A: Say "Yes"** → I proceed to Phase 3 (execution)

**Option B: Ask for changes** → I revise the plan and ask again
```
You: "Can you also update the chart colors in Change 1?"
Me: "Got it. Here's the revised plan: [updated]

Does this work now?"
```

**Option C: Add more context** → I incorporate it and re-present
```
You: "Actually, the dashboard should also support mobile"
Me: "Got it. Here's how I'll handle that: [revised plan]

Better?"
```

The loop continues until you confirm with "Yes".

### Phase 3: Execution (No More Confirmations)

Once you say "Yes":

```
CHANGE 1: Update styling
  → Implement the change
  → Verify with /fix skill (check for bugs)
  → If bugs found: fix + re-verify
  → Commit + Push + Merge to main
  ✅ Change 1 deployed.

CHANGE 2: Add filter
  → Implement the change
  → Verify with /fix skill
  → If bugs found: fix + re-verify
  → Commit + Push + Merge to main
  ✅ Change 2 deployed.

CHANGE 3: Optimize data
  → Implement the change
  → Verify with /fix skill
  → If bugs found: fix + re-verify
  → Commit + Push + Merge to main
  ✅ Change 3 deployed.

ALL DONE ✅
```

**Key:** After "Yes", I don't ask permission again. Each change goes through the full cycle automatically.

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

## Troubleshooting

If the skill doesn't seem to be working as expected:

### Issue 1: Skill doesn't create a clear plan
**Problem:** After invoking the skill, I jump straight into implementation or present a vague plan.

**Fix:** The planning phase should always present:
- [ ] **What** — Clear statement of what work involves
- [ ] **How** — Step-by-step breakdown of approach
- [ ] **Why** — Context on why this approach makes sense
- [ ] **Order** — If multiple changes, clear sequence
- [ ] **Verification** — How each change will be tested

**Action:** Tell me to "create a detailed plan first" if I skip this step.

### Issue 2: Skill asks for confirmation repeatedly during execution
**Problem:** After you say "Yes", I keep asking for permission between changes.

**Fix:** Once "Yes" is given, the workflow should proceed without interruption:
- [ ] Implement change 1 → Verify → Commit → Merge
- [ ] Automatically start change 2 (no pause)
- [ ] Repeat for each change
- [ ] Only report status, don't ask for permission

**Action:** If I'm asking permission between changes, tell me to "proceed with the next change automatically" or "stop asking for confirmation."

### Issue 3: Skill doesn't use fix skill for verification
**Problem:** Changes are being committed without checking for bugs first.

**Fix:** After implementing each change, I must:
- [ ] Invoke the fix skill explicitly: `/fix`
- [ ] Review fix skill's findings
- [ ] Fix any issues found and re-verify
- [ ] Only commit when clean

**Action:** Tell me to "verify this change with /fix skill" if I skip verification.

### Issue 4: Skill doesn't merge to main automatically
**Problem:** Changes sit on the feature branch instead of landing on main.

**Fix:** Standing instruction (from CLAUDE.md): Every accepted change merges to main immediately:
```bash
git checkout main
git merge --no-edit [branch]
git push origin main
git checkout [branch]
```

**Action:** If changes aren't on main, check git log and remind me of the standing instruction.

### Issue 5: Skill bundles multiple changes into one commit
**Problem:** Instead of separate commits for each change, all changes land in one large commit.

**Fix:** The "incremental protocol" requires strict separation:
- [ ] Each change gets its own commit with a clear message
- [ ] Commit message format: "Change N: [description]"
- [ ] One logical change per commit
- [ ] Easy to see which commit introduced which feature

**Action:** If commits are too large, ask me to "split this into separate commits by change."

### Issue 6: Skill doesn't provide progress updates
**Problem:** After saying "Yes", you get silence until the end, making it unclear what's happening.

**Fix:** I should provide clear progress messages:
```
✅ Change 1 (Update styling) verified and deployed to main.
→ Now implementing Change 2 (Add filter)...

✅ Change 2 deployed to main.
→ Now implementing Change 3 (Optimize performance)...

✅ All 3 changes deployed to main.
```

**Action:** Ask for a progress update if I'm being silent.

## Key Principles

1. **Plan upfront, execute later** — I present the full plan before doing any implementation
2. **One "Yes" confirms everything** — You approve the plan once, then I execute all changes without further confirmation
3. **Incremental implementation** — Each change is implemented and deployed separately, not bundled
4. **Verify every change** — I invoke /fix skill after each change to catch bugs before merging
5. **Fix bugs immediately** — If fix skill finds issues, I fix and re-verify before committing
6. **Clean git history** — Each change gets its own commit with a clear message
7. **Merge to main immediately** — Per standing instruction, verified changes land on main right away (not left on feature branch)
8. **Progress updates** — I tell you when each change deploys so you know what's happening

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
