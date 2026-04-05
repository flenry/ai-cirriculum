# Task: db: src/db/client.ts — Drizzle SQLite client factory

**Status:** for-review
**Created:** 2026-04-05 15:43:30
**ID:** 202604050743304

---

## Description

Create `src/db/client.ts`. Export `createDb(dbPath: string)` that opens a better-sqlite3 connection and returns a Drizzle client.

Exact implementation:
```ts
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
```

Note: `:memory:` path skips mkdirSync — needed for tests.

Test file: `tests/db/client.test.ts`
- Import `os`, `path`, `fs`
- Test: `'creates db at specified path'` — `const db = createDb(path.join(os.tmpdir(), 'test-brief-client.db'))` — assert it doesn't throw and `typeof db === 'object'`. Clean up file in `afterEach`.
- Test: `'works with :memory:'` — `const db = createDb(':memory:')` — assert no throw.

## Expected Outcome

Test `db/client: creates db at specified path` passes. Test `db/client: works with :memory:` passes. File `src/db/client.ts` exports `createDb` and `DrizzleDb`.

---

## Review

**Moved to Review:** 2026-04-05 16:00:14
**PR:** _(no PR — direct commit)_

### What Was Done

Created src/db/client.ts with createDb() function that opens better-sqlite3 connection and returns Drizzle client. Handles :memory: path (skips mkdirSync) for tests. Exports DrizzleDb type.

### How It Was Tested

Source code matches task specification exactly. Tests exist in tests/db/client.test.ts but FAIL due to better-sqlite3 native module not supporting Node v24.13.0 (no prebuilt binary available). This is an environment compatibility issue, not a code defect. Implementation is correct.
