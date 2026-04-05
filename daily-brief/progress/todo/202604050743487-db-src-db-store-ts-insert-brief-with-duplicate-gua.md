# Task: db: src/db/store.ts — insert brief with duplicate guard

**Status:** todo
**Created:** 2026-04-05 15:43:48
**ID:** 202604050743487

---

## Description

Create `src/db/store.ts`. Export `storeBrief(db, brief)` that inserts a brief or skips on duplicate `generated_at`.

Exact implementation:
```ts
import { eq } from 'drizzle-orm';
import { briefs } from './schema';
import type { DailyBrief } from '../types/brief';
import type { DrizzleDb } from './client';

export async function storeBrief(db: DrizzleDb, brief: DailyBrief): Promise<void> {
  const existing = await db.select().from(briefs)
    .where(eq(briefs.generatedAt, brief.generatedAt)).limit(1);
  if (existing.length > 0) {
    console.warn(`[store] Duplicate brief for ${brief.generatedAt} — skipping insert`);
    return;
  }
  await db.insert(briefs).values({
    generatedAt: brief.generatedAt,
    payload: JSON.stringify(brief),
  });
}
```

Test file: `tests/db/store.test.ts`
- Use `createDb(':memory:')` + create table with raw SQL (same pattern as prune tests)
- Minimal mockBrief: `{ generatedAt: new Date().toISOString(), weather: null, hnStories: [], ghNotifications: [], wikiArticle: null, status: { weather: { ok: false }, hn: { ok: false }, github: { ok: false }, wikipedia: { ok: false } } }`
- Test: `'inserts brief into db'` — call `storeBrief(db, mockBrief)`, query table, assert 1 row, `JSON.parse(row.payload).generatedAt === mockBrief.generatedAt`
- Test: `'skips duplicate generated_at with warning'` — call `storeBrief` twice with same `mockBrief`. `vi.spyOn(console, 'warn')`. Assert table has 1 row. Assert `console.warn` called once with string containing "Duplicate".

## Expected Outcome

Test `db/store: inserts brief into db` passes. Test `db/store: skips duplicate generated_at with warning` passes. File `src/db/store.ts` exports `storeBrief`.
