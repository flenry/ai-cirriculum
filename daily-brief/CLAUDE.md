# daily-brief

> A personal daily brief generator that pulls weather, top HN stories, GitHub notifications, and a random Wikipedia article, then renders as a clean HTML email or terminal output on a cron schedule.

## Routing Table

Read the files listed for your stage. Skip everything else unless explicitly needed.

| Stage      | Load                                           | Skip           |
|------------|------------------------------------------------|----------------|
| research   | context/research.md                            | everything else |
| board-prd  | context/board-prd.md, handover/research.md     | everything else |
| build      | context/build.md, handover/prd.md              | everything else |
| test       | context/test.md, handover/build.md             | everything else |
| cr/review  | context/review.md, handover/test.md            | everything else |

## Project Map

```
src/api/, src/db/, src/services/, src/types/, src/components/, src/hooks/, src/lib/, src/pages/
```

## Naming Conventions

kebab-case files, PascalCase classes, camelCase functions, snake_case DB columns

## Always Use

Drizzle ORM, zod, pnpm, shadcn/ui

## Task Board

Before starting any work: `list_tasks("todo")` — work on existing tasks before creating new ones.
After completing work: `move_to_review` — never self-approve.
