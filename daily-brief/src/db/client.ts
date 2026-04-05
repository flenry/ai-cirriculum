import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

export function createDb(dbPath: string) {
  if (dbPath !== ':memory:') {
    mkdirSync(dirname(dbPath), { recursive: true });
  }
  const sqlite = new Database(dbPath);
  return drizzle(sqlite);
}

export type DrizzleDb = ReturnType<typeof createDb>;
