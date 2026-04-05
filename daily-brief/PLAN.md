# Plan: Fix createDb — async DDL + fresh-DB integration tests

## Goal
`pnpm brief` runs without crashing on a fresh install; `briefs` table is auto-created by `createDb()` before any queries run; 60+ tests pass.

## Must-Haves (goal-backward)
- [ ] `createDb()` is async and issues `CREATE TABLE IF NOT EXISTS briefs (…)` matching `schema.ts` exactly
- [ ] All callers of `createDb()` use `await`
- [ ] `DrizzleDb` type updated to reflect async return
- [ ] `tests/db/client.test.ts` updated to `await createDb()`
- [ ] `tests/prd-derived/cli-fresh-db.test.ts` added with ≥5 tests
- [ ] All 55 existing tests still pass + 5 new = 60 total

## Out of Scope
- schema.ts — do NOT modify
- store.ts, prune.ts, any service/renderer files (except fixing callers)
- prune.test.ts and store.test.ts — already have `beforeAll` DDL workaround; leave as-is

## Tasks

### Chunk 1: Fix createDb()
- [ ] Task 1.1: Make `createDb()` async, add DDL execution
  - Files: `src/db/client.ts`
  - DDL must match `src/db/schema.ts`: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `generated_at TEXT NOT NULL UNIQUE`, `payload TEXT NOT NULL`, `created_at TEXT NOT NULL DEFAULT (current_timestamp)`
  - Update `DrizzleDb` type to `Awaited<ReturnType<typeof createDb>>`
  - Outcome: file compiles, DB initialises with table on fresh path and `:memory:`

### Chunk 2: Update callers
- [ ] Task 2.1: `src/index.ts` — change `createDb(config.dbPath)` → `await createDb(config.dbPath)`
- [ ] Task 2.2: `tests/db/client.test.ts` — add `async` + `await` to all `createDb()` calls; update type assertions

### Chunk 3: New integration tests
- [ ] Task 3.1: Create `tests/prd-derived/cli-fresh-db.test.ts`
  - Tests: (1) createDb(':memory:') resolves without error, (2) table exists after createDb, (3) can insert a brief, (4) pruneOldBriefs runs without error, (5) storeBrief completes without error
  - Uses `:memory:` — no file I/O

## Execution Order
1. Task 1.1
2. Task 2.1, 2.2 (parallel, depend on 1.1)
3. Task 3.1 (depends on 1.1)
4. Run `pnpm test` — must be 60/60 green
5. Run `pnpm brief` — must not crash with "no such table"

## TODO
- [ ] Task 1.1 — src/db/client.ts async + DDL
- [ ] Task 2.1 — src/index.ts await
- [ ] Task 2.2 — tests/db/client.test.ts await
- [ ] Task 3.1 — tests/prd-derived/cli-fresh-db.test.ts
- [ ] pnpm test ≥ 60 green
- [ ] pnpm brief no crash
