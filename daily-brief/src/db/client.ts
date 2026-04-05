import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

export async function createDb(dbPath: string) {
  if (dbPath !== ':memory:') {
    mkdirSync(dirname(dbPath), { recursive: true });
  }
  const client = createClient({
    url: dbPath === ':memory:' ? ':memory:' : 'file:' + dbPath,
  });
  await client.execute(`
    CREATE TABLE IF NOT EXISTS briefs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      generated_at TEXT NOT NULL UNIQUE,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    )
  `);
  return drizzle(client);
}

export type DrizzleDb = Awaited<ReturnType<typeof createDb>>;
