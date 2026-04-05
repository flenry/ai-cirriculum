# Task: db: src/db/prune.ts — delete briefs older than 30 days

**Status:** todo
**Created:** 2026-04-05 15:43:39
**ID:** 202604050743390

---

## Description

Create `src/db/prune.ts`. Export `pruneOldBriefs(db)` that deletes rows where `generated_at < cutoff`.

Exact implementation:
```ts
import { lt } from 'drizzle-orm';
import { briefs } from './schema';
import type { DrizzleDb } from './client';

export async function pruneOldBriefs(db: DrizzleDb): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  // Note: 'lt' is strict less-than, so rows exactly at cutoff ARE deleted
  await db.delete(briefs).where(lt(briefs.generatedAt, cutoff.toISOString()));
}
```

Test file: `tests/db/prune.test.ts`
- Use `createDb(':memory:')` for all tests
- Before tests, run `db.run(sql\`CREATE TABLE IF NOT EXISTS briefs (...)\`)` OR use drizzle migrate/push to create the table
- Insert a row with `generated_at` = 31 days ago ISO string
- Insert a row with `generated_at` = 29 days ago ISO string
- Call `pruneOldBriefs(db)`
- Assert: `await db.select().from(briefs)` returns exactly 1 row (the 29-day-old one)

IMPORTANT: To create the table in tests, use:
```ts
import { sql } from 'drizzle-orm';
db.run(sql`CREATE TABLE IF NOT EXISTS briefs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  generated_at TEXT NOT NULL UNIQUE,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (current_timestamp)
)`);
```

## Expected Outcome

Test `db/prune: deletes records older than 30 days` passes. Test `db/prune: keeps records exactly 29 days old` passes.
