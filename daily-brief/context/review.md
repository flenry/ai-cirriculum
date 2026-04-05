# Review Context

## Scope
Review the implementation. Rate every finding by severity. Give a verdict.

## Read First
1. handover/test.md — test results, failures, coverage
2. handover/build.md — what was built, known deviations

## Severity Scale
- **CRITICAL** — blocks merge, must fix before approval
- **MAJOR** — significant issue, should fix
- **MINOR** — worth fixing, not blocking
- **NIT** — style/preference, optional

## Review Criteria
Correctness + performance + security + no regressions

## Task Board
1. `list_tasks("todo")` — check for existing review tasks first
2. If none: `create_task("Review: [feature/CR]", ...)`

## Verdict
End your review with one of:
- ✅ **APPROVE** — ready to merge
- ⚠️ **APPROVE WITH COMMENTS** — merge after addressing MINORs
- ❌ **REJECT** — CRITICAL or MAJOR findings must be fixed first

## Write When Done → handover/review.md
```
## Decided
- Verdict: [APPROVE / APPROVE WITH COMMENTS / REJECT]
- [key findings]

## Rejected
- N/A

## Open
- [anything requiring follow-up]

## Output
- [list of findings with severity]
```

Then: `move_to_review` with verdict and PR link.
