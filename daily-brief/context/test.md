# Test Context

## Scope
Verify the implementation against the PRD. Write and run tests.
Do NOT implement features. Report findings only.

## Read First
1. handover/build.md — what was built, known issues, deviations from PRD
2. PRD.md — success criteria and requirements to verify against

## Test Setup
Vitest + Playwright, 90% statement + branch coverage, unit + integration + E2E

## Task Board
1. `list_tasks("todo")` — check for existing test tasks first
2. If none: `create_task("Test: [feature]", ...)`

## Write When Done → handover/test.md
```
## Decided
- [what passed, coverage achieved]

## Rejected
- N/A

## Open
- [failures, gaps, issues found for review agent]

## Output
- Test results: [X/Y passing, Z% coverage]
- [any new test files created]
```

Then: `move_to_review` with test results summary.
