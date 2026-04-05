# Research Context

## Scope
Understand the domain, validate APIs, map technical constraints, identify unknowns.
Do NOT start implementing. Do NOT write PRD. Research only.

## What to Produce
A thorough brief covering:
- What exists (APIs, services, data sources — verified with live calls where possible)
- What was explored and ruled out (and why)
- Key unknowns for the board to resolve
- Technical constraints and risks

## Task Board
1. `list_tasks("todo")` — check for existing research tasks first
2. If none: `create_task("Research: [topic]", ...)`
3. Work on the task

## Write When Done → handover/research.md
```
## Decided
- [confirmed findings]

## Rejected
- [what was ruled out and why]

## Open
- [unknowns for board-prd to resolve]

## Output
- [key sources, verified endpoints, data shapes]
```

Then: `move_to_review` with summary of findings.
