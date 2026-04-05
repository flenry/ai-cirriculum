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
