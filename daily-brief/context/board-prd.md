# Board-PRD Context

## Scope
Translate research findings into a versioned PRD. Run the board process:
Robin briefs → Vegapunk researches → Law stress-tests → Robin writes final PRD.

## What to Produce
- Updated PRD.md (increment version in changelog table)
- handover/prd.md with key decisions for the build agent

## Versioning Rule
Every board-prd run = new PRD version. Update the changelog table in PRD.md:
| v1.1 | [today] | [what changed] | [PR/commit] |

## Task Board
1. `list_tasks("todo")` — check for existing PRD tasks first
2. If none: `create_task("PRD: [topic]", ...)`

## Write When Done → handover/prd.md
```
## Decided
- [requirements confirmed, approach chosen]

## Rejected
- [approaches ruled out by board]

## Open
- [questions build agent should watch for]

## Output
- PRD.md v[x.x] — [summary of what changed]
```

Then: `move_to_review` with PR link and version number.
