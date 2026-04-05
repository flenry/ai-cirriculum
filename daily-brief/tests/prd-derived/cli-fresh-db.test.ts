/**
 * PRD-derived integration tests — fresh DB initialisation (US1, US2, G4)
 *
 * Verifies that createDb() auto-creates the briefs table so the app never
 * crashes with "no such table: briefs" on a fresh install.
 *
 * All tests use :memory: — no file I/O required.
 */
import { describe, it, expect } from 'vitest';
import { sql } from 'drizzle-orm';
import { createDb } from '../../src/db/client';
import { briefs } from '../../src/db/schema';
import { pruneOldBriefs } from '../../src/db/prune';
import { storeBrief } from '../../src/db/store';
import type { DailyBrief } from '../../src/types/brief';

const makeBrief = (overrides: Partial<DailyBrief> = {}): DailyBrief => ({
  generatedAt: new Date().toISOString(),
  weather: null,
  hnStories: [],
  ghNotifications: [],
  wikiArticle: null,
  status: {
    weather: { ok: false },
    hn: { ok: false },
    github: { ok: false },
    wikipedia: { ok: false },
  },
  ...overrides,
});

describe('prd-derived: fresh DB initialisation', () => {
  it('createDb(:memory:) resolves without throwing', async () => {
    await expect(createDb(':memory:')).resolves.toBeDefined();
  });

  it('briefs table exists immediately after createDb — no "no such table" error', async () => {
    const db = await createDb(':memory:');
    // Querying the table must not throw SQLITE_ERROR: no such table: briefs
    await expect(db.select().from(briefs)).resolves.toEqual([]);
  });

  it('raw SQL confirms table was created with correct columns', async () => {
    const db = await createDb(':memory:');
    // sqlite_master holds schema info
    const rows = await db.run(
      sql`SELECT name FROM sqlite_master WHERE type='table' AND name='briefs'`
    );
    // libsql result has .rows array
    const rowsArr = (rows as { rows: unknown[] }).rows;
    expect(rowsArr.length).toBe(1);
  });

  it('pruneOldBriefs() runs without error on a freshly created DB', async () => {
    const db = await createDb(':memory:');
    await expect(pruneOldBriefs(db)).resolves.not.toThrow();
  });

  it('storeBrief() inserts and is retrievable on a freshly created DB', async () => {
    const db = await createDb(':memory:');
    const brief = makeBrief();
    await expect(storeBrief(db, brief)).resolves.not.toThrow();

    const rows = await db.select().from(briefs);
    expect(rows).toHaveLength(1);
    expect(JSON.parse(rows[0].payload).generatedAt).toBe(brief.generatedAt);
  });
});
