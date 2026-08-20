# Opus Planning Mode

High-level analysis and confirmation layer for every prompt with automatic bug verification and autonomous execution.

## What It Does

This skill provides:

1. **Detailed Planning** — Comprehensive breakdown of what will be done before starting
2. **Confirmation Gate** — Review and approve the plan before execution begins
3. **Autonomous Execution** — Once confirmed, implements changes end-to-end without interruption
4. **Automatic Verification** — Integrated with the fix skill to verify each change for bugs
5. **Seamless Orchestration** — Multi-change workflows with automatic verification between changes

## How to Use

Simply invoke with your request using the Skill tool:

```
Skill: opus-planning-mode
```

Or say naturally:

```
I need to make 3 improvements to the dashboard:
1. Update styling
2. Add new filter
3. Optimize performance
```

## The Workflow (TL;DR)

```
1. You submit request
2. Skill presents comprehensive plan
3. Skill asks: "Does this plan look right?"
4. You say: "Yes"
5. Skill executes FULLY AUTONOMOUSLY:
   → Implement change 1 only
   → Verify (auto-invoke fix skill)
   → If bugs: fix skill fixes them
   → Commit + Push + Merge to main
   → Brief status: "✅ Change 1 deployed"
   → Start change 2 (no asking for permission)
   → Repeat for all changes
   → Final status: "✅ All changes deployed"
```

**Key:** After "Yes", the skill runs uninterrupted. You're done. Check the result when it's finished.

## Features

- **Planning Phase**: Presents a clear plan with what, how, and why
- **Confirmation**: One simple "Yes" to proceed with execution (only ask once)
- **Autonomous Execution**: Implements, verifies, commits, pushes, and merges automatically
- **Silent Verification**: Fix skill automatically checks each change; only report bugs if found
- **Incremental Implementation**: Handles multiple changes one at a time with verification
- **Auto-Merge**: Each verified change is merged to main immediately (no asking)
- **Clean Commits**: Each change gets its own descriptive commit message
- **Status Updates**: Brief progress notifications showing what was deployed

## Verification Standards

Each change is verified on four critical dimensions:

1. **Syntax & Logic Correctness** — No broken code, proper structure
2. **Requirement Alignment** — Does it actually do what was requested?
3. **User Experience** — Is it intuitive and production-ready?
4. **Production Readiness** — Can users actually use it end-to-end?

Only changes passing all four dimensions are deployed to main.

## Critical Rules (Must Follow)

| Rule | Why | What Happens If Broken |
|------|-----|------------------------|
| **One "Yes" confirms plan** | Prevents endless confirmation loops | Skill asks "confirm?" multiple times after start |
| **Implement one change at a time** | Isolate bugs, clean git history | Multiple features bundled, hard to debug |
| **Auto-invoke fix skill after each change** | Verify before merge | Bad code ships to main |
| **Auto-merge when verified** | Deliver immediately per standing instruction | Changes sit on feature branch unused |
| **Don't ask for confirmation after "Yes"** | Autonomous execution, no interruption | Workflow stalls waiting for human input |
| **Report progress with status updates** | User knows what's happening | Silence after "Yes" = unclear if working |

## Integration

Works seamlessly with the fix skill to provide automatic bug diagnosis and fixing during multi-change workflows.

The fix skill is **automatically invoked** after each change is implemented, requiring no manual action from you.

## Troubleshooting

See SKILL.md "Troubleshooting: Skill Not Functioning" section for detailed diagnosis and fixes for common workflow issues.
