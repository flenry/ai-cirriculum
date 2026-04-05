import { describe, it, expect, beforeAll, vi } from 'vitest';
import { briefs } from '../../src/db/schema';
import { createDb } from '../../src/db/client';
import { storeBrief } from '../../src/db/store';
import type { DrizzleDb } from '../../src/db/client';
import type { DailyBrief } from '../../src/types/brief';

describe('db/store', () => {
  let db: DrizzleDb;

  const mockBrief: DailyBrief = {
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
  };

  beforeAll(async () => {
    db = await createDb(':memory:');
  });

  it('inserts brief into db', async () => {
    await storeBrief(db, mockBrief);

    const rows = await db.select().from(briefs);
    expect(rows).toHaveLength(1);
    expect(JSON.parse(rows[0].payload).generatedAt).toBe(mockBrief.generatedAt);
  });

  it('skips duplicate generated_at with warning', async () => {
    console.warn = vi.fn();

    await storeBrief(db, mockBrief);

    const rows = await db.select().from(briefs);
    expect(rows).toHaveLength(1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(`Duplicate brief for ${mockBrief.generatedAt}`)
    );
  });
});
