# Task: db: src/db/prune.ts — delete briefs older than 30 days

**Status:** for-review
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

---

## Review

**Moved to Review:** 2026-04-05 16:00:35
**PR:** _(no PR — direct commit)_

### What Was Done

Created src/db/prune.ts with pruneOldBriefs() function that deletes brief rows where generated_at is more than 30 days old. Uses Drizzle ORM with lt() helper. Accepts DrizzleDb type. Implementation matches exact specification from task.

### How It Was Tested

Source code matches task specification exactly. Tests exist in tests/db/prune.test.ts but FAIL due to better-sqlite3 native module incompatibility with Node v24.13.0 (no prebuilt binary). This is an environment issue, not a code defect.
