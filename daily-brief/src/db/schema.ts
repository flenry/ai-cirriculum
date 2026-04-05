import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const briefs = sqliteTable('briefs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  generatedAt: text('generated_at').notNull().unique(),
  payload: text('payload').notNull(),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});
