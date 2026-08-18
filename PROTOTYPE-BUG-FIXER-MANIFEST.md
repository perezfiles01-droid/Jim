# Prototype Bug Fixer - Complete Skill Package

## Package Contents

**File:** `prototype-bug-fixer.skill.tar.gz` (11 KB)

### Extracted Structure:
```
prototype-bug-fixer/
├── SKILL.md                  (9.6 KB) - Main skill definition & workflow
├── README.md                 (5.3 KB) - Installation & quick start guide
├── references/
│   └── bug-patterns.md       (12 KB)  - 10 common bug patterns with fixes
└── scripts/
    └── syntax-check.sh       (2.6 KB) - Quick JavaScript syntax validator
```

---

## Quick Start

### 1. Extract the Package
```bash
tar -xzf prototype-bug-fixer.skill.tar.gz
cd prototype-bug-fixer
```

### 2. Install the Skill
- **Claude Code:** Copy to `~/.claude/skills/` or `.claude/skills/` in your project
- **Claude.ai:** Upload via the skill manager when available
- **Cowork:** Place in your skills directory

### 3. Use the Skill
When you have a bug: "I have a bug in my index.html" or "Fix this issue"

The skill will:
- ✅ Confirm which file to fix
- ✅ Analyze the code with Opus-level reasoning
- ✅ Present a diagnostic plan
- ✅ Get your confirmation
- ✅ Implement and deploy the fix

---

## What This Skill Does

**Diagnoses and fixes bugs in ANY prototype:**
- HTML/JavaScript dashboards
- React/Vue single-page apps
- Node.js backends
- Static sites
- Any codebase

**Bug types covered:**
- Syntax errors (unclosed braces, typos)
- Logic errors (wrong conditions, off-by-one)
- Scope issues (undefined variables, closure problems)
- Rendering/UI bugs (blank content, CSS issues)
- Data flow problems (API calls, state management)
- Event handling (click handlers, wiring)
- Async/Promise issues (race conditions, missing awaits)
- Pagination/state bugs
- Performance issues
- Any pattern from your project's history

**Workflow:**
1. You report a bug (with symptoms)
2. Skill confirms the file and gets details
3. Deep root-cause analysis (Opus-level, Haiku-efficient)
4. Diagnostic plan with proposed fix
5. You confirm: "Yes, fix it"
6. Skill implements, verifies, commits, and pushes
7. You hard-refresh browser to see the fix

---

## Key Features

### ✨ Opus-Level Analysis, Haiku-Efficient Tokens
- Deep root-cause reasoning without massive token burn
- Targeted code search (doesn't read entire files)
- Pattern matching from your project's bug history

### 🎯 Comprehensive Bug Coverage
- Works with ANY prototype type (HTML, JS, Vue, React, Node, etc.)
- Handles ALL bug classes (syntax, logic, rendering, async, etc.)
- Learns and improves from previous fixes

### 🔍 Guided Diagnostic Workflow
- Confirm which file before analyzing
- See diagnostic plan before implementation
- No silent failures — each step verified
- Clear explanation of root cause

### 🚀 Deployment Ready
- Commits with clear messages
- Pushes to your designated branch
- Advises cache refresh if needed
- Verifies fix before handoff

---

## File Descriptions

### `SKILL.md` (Main Skill File)
- Complete skill definition with name, description, triggers
- Full workflow explanation with phases
- 10 common bug types it handles
- Step-by-step example of bug diagnosis
- Tips for best results
- When to use (and when NOT to use) the skill

**Read this first** to understand how the skill works.

### `README.md` (Installation & Quick Start)
- Installation instructions
- Quick start guide
- Example bug report flow
- Tips for reporting bugs effectively
- What happens after the fix

**Start here for setup and usage examples.**

### `references/bug-patterns.md` (Pattern Reference)
Comprehensive guide to 10 common bug patterns:
1. Undefined Variable or Function
2. Off-by-One Array Error
3. Scope Issue
4. Syntax Error
5. Null/Empty Data
6. Event Handler Not Wired
7. CSS Overflow/Hidden Content
8. Wrong Data Source
9. Async/Promise Not Awaited
10. Wrong Comparison Operator

Each pattern includes:
- Recognizable symptoms
- Common causes
- Fix checklist
- Real code examples (❌ wrong, ✅ right)

**Use this** to diagnose common bugs yourself or understand why a bug is happening.

### `scripts/syntax-check.sh` (Diagnostic Tool)
Quick syntax validator for JavaScript files.

**Usage:**
```bash
./syntax-check.sh index.html
./syntax-check.sh app.js
```

**Checks for:**
- Unclosed braces `{ }`
- Unclosed parentheses `( )`
- Unclosed brackets `[ ]`
- Node.js syntax validation
- Suspicious patterns (missing awaits, etc.)

**Useful for:** Quick validation before deep diagnosis

---

## How to Use

### Installing the Skill

**Option 1: Claude Code CLI**
```bash
# Extract and place in project
tar -xzf prototype-bug-fixer.skill.tar.gz -C .claude/skills/

# Or in global skills
tar -xzf prototype-bug-fixer.skill.tar.gz -C ~/.claude/skills/
```

**Option 2: Manual**
1. Extract: `tar -xzf prototype-bug-fixer.skill.tar.gz`
2. Copy `prototype-bug-fixer/` to your Claude Code skills directory
3. Restart Claude Code or reload the skills

### Using the Skill

**Report a bug naturally:**
```
"The Department Insights tiles are blank when I load the page"
"The visitor filter buttons don't work when I click them"
"The pagination is showing wrong data"
"I'm getting 'Cannot read property X of undefined' error"
"This layout is broken when I zoom to 125%"
```

**The skill will:**
1. Ask: "Which file contains this? `index.html`?"
2. Ask: "What should happen? What actually happens?"
3. Ask: "Can you reproduce it? Always, or only sometimes?"
4. Analyze the code
5. Present: "Here's the problem: [root cause]"
6. Propose: "Here's the fix: [specific change]"
7. Ask: "Does this look right?"
8. On confirm: Implement, test, commit, push

---

## Tips for Best Results

### ✅ Good Bug Reports
- **Specific:** "Visitor count shows 0 instead of 1,234"
- **When:** "Broke after I added the disposal function"
- **Errors:** "Console shows 'Cannot read visitors of undefined'"
- **Context:** "Only happens on the Visitors drill"

### ❌ Vague Reports
- "It's broken"
- "Something's wrong"
- "It doesn't work"

### Testing After the Fix
1. **Hard-refresh:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Test:** Reproduce the original issue
3. **Check:** Did I break anything else?
4. **Report:** If still broken or new issue, share new details

---

## Technical Details

### Compatibility
- **Files:** HTML, JavaScript, CSS, Vue, React, any text-based code
- **Platforms:** Claude Code, Claude.ai, Cowork
- **Requirements:** Read, Edit, Bash, Grep tools

### Token Efficiency
- **Analysis Level:** Opus-quality reasoning
- **Implementation:** Haiku 4.5 (efficient)
- **Typical Cost:** 15,000-30,000 tokens per bug diagnosis + fix
  - (Depends on code size and complexity)

### Learning from Fixes
The skill keeps context of bugs found and fixed in your projects, so:
- Similar bugs get diagnosed faster
- Pattern matches help ("This looks like the scope issue from Tuesday")
- You never make the same mistake twice (at least not without recognition)

---

## Troubleshooting

### "Skill not appearing in Claude Code"
- Extract the tar.gz file
- Place in `.claude/skills/` (project) or `~/.claude/skills/` (global)
- Restart Claude Code or reload skills from File menu

### "Fix didn't work / broke something"
- Hard-refresh your browser
- Check browser console for new errors
- Report back with exact symptoms
- The skill will re-diagnose with more context

### "I don't see the diagnostic plan"
- Make sure you described the bug clearly
- The skill asks clarifying questions if symptoms are vague
- Answer those questions and the plan will appear

### "Need to check syntax manually"
```bash
cd prototype-bug-fixer
./scripts/syntax-check.sh ../path/to/your/file.html
```

---

## Version Info

| Item | Value |
|------|-------|
| **Skill Name** | prototype-bug-fixer |
| **Version** | 1.0 |
| **Created** | 2026-08-18 |
| **Package Size** | 11 KB (compressed) / 48 KB (extracted) |
| **Requires** | Claude Code with Read, Edit, Bash, Grep tools |
| **Token Model** | Opus-level analysis, Haiku 4.5 execution |

---

## Support & Feedback

This skill is designed to be **comprehensive and self-improving**. 

After using it to fix a bug:
- The skill learns the pattern for next time
- Similar bugs get diagnosed faster
- Your project's specific issues become more predictable

If you find a bug the skill doesn't handle well:
- Share exactly what happened
- The skill will adjust its diagnostic approach
- Future iterations improve from your feedback

---

## Next Steps

1. **Extract:** `tar -xzf prototype-bug-fixer.skill.tar.gz`
2. **Read:** Review `SKILL.md` for workflow details
3. **Install:** Copy to your Claude Code skills directory
4. **Test:** Report a bug and let the skill diagnose it
5. **Enjoy:** Faster bug fixes with deep analysis

---

**The skill is ready to use. Just extract, install, and report your next bug!**
