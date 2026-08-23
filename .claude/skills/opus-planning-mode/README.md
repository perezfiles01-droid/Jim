# Opus Planning Mode Skill

High-level analysis and confirmation layer for complex work. Creates detailed plans, asks for confirmation, then executes with verification.

## What It Does

1. **Analyzes your request** — Understands what you're asking for
2. **Creates a detailed plan** — Breaks down what, how, and why
3. **Asks for confirmation** — You review and approve before any work starts
4. **Executes step-by-step** — Implements changes one at a time
5. **Verifies each change** — Uses fix skill to catch bugs before merging
6. **Deploys to main** — Per standing instruction, merges each verified change immediately

## How to Invoke

**Explicitly:**
```
/opus-planning-mode

I need to make 3 improvements to the dashboard...
```

**Or naturally:**
```
I need to fix these 5 issues with the report. Can you create a plan first?
```

**Or via the Skill tool:**
```
/fix opus-planning-mode
[request details]
```

## The Workflow

### Step 1: Planning (You provide feedback)
```
You: "I need to update styling and add a new filter"

Me: "Here's my plan:

## Change 1: Update styling
- Modify CSS
- Improve layout
- ~30 minutes

## Change 2: Add new filter  
- Create filter UI
- Wire to data
- ~2 hours

Does this look right?"
```

### Step 2: Confirmation (You approve)
```
You: "Yes, proceed"

OR

You: "Actually, also add dark mode support"
Me: "Got it. Revised plan:
[updated plan]

Better?"
```

### Step 3: Execution (Automatic)
Once you say "Yes":
```
Change 1: Update styling
  ✓ Implement
  ✓ Verify with /fix
  ✓ Commit + Push + Merge
  → Next change...

Change 2: Add new filter
  ✓ Implement
  ✓ Verify with /fix
  ✓ Commit + Push + Merge
  → Next change...

✅ All changes deployed to main
```

**No asking for permission between changes.** One "Yes" approves the whole workflow.

## Key Features

| Feature | What It Does |
|---------|-------------|
| **Detailed Plans** | Break down complex work before starting |
| **Confirmation Gate** | Review and approve the approach first |
| **Incremental Implementation** | Each change done one at a time, separate commits |
| **Automatic Verification** | Invoke /fix after each change to check for bugs |
| **Auto-Fix** | If bugs found, I fix them and re-verify |
| **Clean Merges** | Each verified change lands on main immediately |
| **Progress Updates** | You see status as work completes |

## Common Scenarios

### Scenario 1: Simple Request
```
You: "Add a 'Back' button to the dashboard"
Me: "1-line plan: Add button to top-left, wire click handler, style consistently"
You: "Yes"
Me: [implement, verify, merge] Done ✅
```

### Scenario 2: Multiple Changes
```
You: "Improve dashboard UX - 4 things: ..."
Me: [detailed 4-change plan]
You: "Yes"
Me: [Change 1: implement→verify→merge] [Change 2: implement→verify→merge] ... Done ✅
```

### Scenario 3: Revise Plan
```
You: "Redesign the report. Here's what I need..."
Me: [initial plan]
You: "Also need mobile support"
Me: [revised plan with mobile included]
You: "Yes"
Me: [execute revised plan] ✅
```

## Verification Standards

After each change, I verify:

- ✅ **No syntax errors** — Code is valid
- ✅ **Logic is correct** — Does what it's supposed to
- ✅ **Variables in scope** — No "undefined" or temporal dead zone issues
- ✅ **Functions callable** — Everything used is available
- ✅ **User-ready** — Actually works as expected

Fix skill handles this automatically when I invoke `/fix`.

## What You Should Know

- **One "Yes" approves everything** — Changes execute without re-asking for permission
- **Each change is separate** — Different commits, easy to revert if needed
- **Verification is automatic** — I call /fix, review findings, fix issues if needed
- **Merges happen automatically** — Per standing instruction, verified changes land on main
- **Status updates keep you informed** — You see what deployed and what's next

## Troubleshooting

**Problem:** Skill seems stuck or repeating itself  
**Solution:** This usually means plan revision is needed. Provide specific feedback on what to change.

**Problem:** Not seeing status updates  
**Solution:** Ask for a progress update - I should be reporting what's happening.

**Problem:** Concerned about a change  
**Solution:** Before saying "Yes", ask questions or ask me to revise that part of the plan.

For detailed troubleshooting, see SKILL.md.
