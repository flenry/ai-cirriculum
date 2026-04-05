import { lt } from 'drizzle-orm';
import { briefs } from './schema';
import type { DrizzleDb } from './client';

export async function pruneOldBriefs(db: DrizzleDb): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  await db.delete(briefs).where(lt(briefs.generatedAt, cutoff.toISOString()));
}
