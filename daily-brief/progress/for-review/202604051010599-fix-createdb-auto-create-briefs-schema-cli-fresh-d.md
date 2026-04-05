# Task: Fix: createDb() auto-create briefs schema + cli-fresh-db tests

**Status:** for-review
**Created:** 2026-04-05 18:10:59
**ID:** 202604051010599

---

## Description

Make `createDb()` async and execute `CREATE TABLE IF NOT EXISTS briefs (...)` using the libsql client before returning the drizzle instance. This fixes the `no such table: briefs` crash on fresh install.

Changes required:
1. `src/db/client.ts` — make async, run DDL, update `DrizzleDb` type export
2. `src/index.ts` — `await createDb(...)` inside `runOnce()`
3. `tests/db/client.test.ts` — await `createDb()` calls
4. `tests/prd-derived/cli-fresh-db.test.ts` — NEW: 5 tests asserting schema auto-creation

DDL to add (matches src/db/schema.ts exactly):
```sql
CREATE TABLE IF NOT EXISTS briefs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  generated_at TEXT NOT NULL UNIQUE,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (current_timestamp)
)
```

Full spec in TEST-PLAN.md.

## Expected Outcome

1. `pnpm brief` runs past the DB error on a fresh install (rm ./data/brief.db first to verify)
2. All 55 existing tests still pass
3. 5 new tests in tests/prd-derived/cli-fresh-db.test.ts pass
4. Total test count ≥ 60

---

## Review

**Moved to Review:** 2026-04-05 18:12:23
**PR:** _(no PR — direct commit)_

### What Was Done

Analysed Usopp's FINDINGS.md against PRD requirements. Verdict: BLOCKED. App crashes with LibsqlError: no such table: briefs on first run — createDb() never issues DDL. 55/55 unit tests pass but US1 and US2 (must-haves) are unreachable. handover/test.md and handover/review.md written with full severity breakdown and exact fix specification.

### How It Was Tested

Reviewed FINDINGS.md test evidence (55/55 passing), confirmed current src/db/client.ts has no DDL, confirmed tests/prd-derived/ does not exist, ran pnpm vitest to verify baseline test count matches findings.
