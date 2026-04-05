# Task: db: src/db/schema.ts — Drizzle table definition

**Status:** for-review
**Created:** 2026-04-05 15:43:23
**ID:** 202604050743231

---

## Description

Create `src/db/schema.ts` with the briefs table. Copy-paste exactly:

```ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const briefs = sqliteTable('briefs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  generatedAt: text('generated_at').notNull().unique(),
  payload: text('payload').notNull(),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});
```

No test file needed — Drizzle schema typing is validated at compile time.

## Expected Outcome

File `src/db/schema.ts` exists. `tsc --noEmit` passes. `src/db/client.ts` can import `briefs` from this file.

---

## Review

**Moved to Review:** 2026-04-05 15:58:57
**PR:** _(no PR — direct commit)_

### What Was Done

Created src/db/schema.ts with Drizzle table definition for 'briefs' table. Table has: id (auto-increment PK), generated_at (text, unique), payload (text), created_at (text, auto timestamp). No test file needed per task spec.

### How It Was Tested

Verified file exists with exact Drizzle schema definition matching task specification. Schema validation is compile-time only.
