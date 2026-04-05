# Build Context

## Scope
Implement the PRD exactly. No scope creep. Flag deviations explicitly.
Follow TDD: Usopp writes failing tests first, then implement to pass them.

## Read First
1. handover/prd.md — decisions, rejected approaches, open questions
2. PRD.md — full requirements (read on demand, not upfront)
3. PLAN.md — task breakdown Robin generates at chain start

## Tech Stack
TypeScript, pnpm, SQLite + Drizzle, Vitest

## File Structure
```
src/api/, src/db/, src/services/, src/types/, src/components/, src/hooks/, src/lib/, src/pages/
```

## Conventions
kebab-case files, PascalCase classes, camelCase functions, snake_case DB columns

## Always Use
Drizzle ORM, zod, pnpm, shadcn/ui

## Task Board
1. `list_tasks("todo")` — work on existing tasks before creating new ones
2. Robin creates tasks from PLAN.md at chain start
3. Zoro calls `move_to_review` when implementation + tests pass

## Write When Done → handover/build.md
```
## Decided
- [key implementation choices]

## Rejected
- [approaches tried and ruled out]

## Open
- [known issues, shortcuts, things test agent should watch]

## Output
- [key files built, with one-line purpose each]
```
