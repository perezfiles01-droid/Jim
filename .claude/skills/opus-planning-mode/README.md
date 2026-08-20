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

Simply invoke with your request:

```
/opus-planning-mode change the header from "Compliance review" to "Records Declaration"
```

Or use the command directly:

```
1. make 3 improvements to the dashboard:
   - Update styling
   - Add new filter
   - Optimize performance
```

## Features

- **Planning Phase**: Presents a clear plan with what, how, and why
- **Confirmation**: One simple "Yes" to proceed with execution
- **Autonomous Execution**: Implements, verifies, commits, pushes, and merges automatically
- **Bug Verification**: Automatically checks each change with the fix skill
- **Incremental Implementation**: Handles multiple changes one at a time with verification
- **Clean Commits**: Each change gets its own descriptive commit message

## Verification Standards

Each change is verified on four critical dimensions:

1. **Syntax & Logic Correctness** — No broken code, proper structure
2. **Requirement Alignment** — Does it actually do what was requested?
3. **User Experience** — Is it intuitive and production-ready?
4. **Production Readiness** — Can users actually use it end-to-end?

Only changes passing all four dimensions are deployed to main.

## Integration

Works seamlessly with the fix skill to provide automatic bug diagnosis and fixing during multi-change workflows.
