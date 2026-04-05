import { describe, it, expect, beforeAll } from 'vitest';
import { sql } from 'drizzle-orm';
import { briefs } from '../../src/db/schema';
import { createDb } from '../../src/db/client';
import { pruneOldBriefs } from '../../src/db/prune';

describe('db/prune', () => {
  const db = createDb(':memory:');

  beforeAll(() => {
    db.run(sql`CREATE TABLE IF NOT EXISTS briefs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      generated_at TEXT NOT NULL UNIQUE,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    )`);
  });

  it('deletes records older than 30 days', async () => {
    // Insert a 31-day-old record
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 31);

    // Insert a 29-day-old record
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 29);

    await db.insert(briefs).values({
      generatedAt: oldDate.toISOString(),
      payload: JSON.stringify({ test: 'old' }),
    });

    await db.insert(briefs).values({
      generatedAt: recentDate.toISOString(),
      payload: JSON.stringify({ test: 'recent' }),
    });

    await pruneOldBriefs(db);

    const remaining = await db.select().from(briefs);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].generatedAt).toBe(recentDate.toISOString());
  });

  it('keeps records exactly 29 days old', async () => {
    // Clear table for this test
    await db.delete(briefs);

    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 31);

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 29);

    await db.insert(briefs).values({
      generatedAt: oldDate.toISOString(),
      payload: JSON.stringify({ test: 'old' }),
    });

    await db.insert(briefs).values({
      generatedAt: recentDate.toISOString(),
      payload: JSON.stringify({ test: 'recent' }),
    });

    await pruneOldBriefs(db);

    const remaining = await db.select().from(briefs);
    expect(remaining).toHaveLength(1);
  });
});
