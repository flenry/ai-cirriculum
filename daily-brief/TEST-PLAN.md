# TEST-PLAN — DB Schema Auto-Creation Fix

> PRD-driven QA pass for the `createDb()` schema auto-creation fix.
> Derived from PRD v1.1 requirements, independent of what was previously tested.

---

## App Type

**CLI / terminal tool**

This is a Node.js CLI application. There is no server, no frontend, and no long-running process
by default.

---

## How to Run

```bash
# One-shot brief (primary mode — what the fix must unblock):
pnpm brief

# With watch/cron mode:
pnpm brief --watch

# Run tests only (safe RAM flags):
npx vitest run --pool=forks --poolOptions.forks.maxForks=2
```

Expected output shape for `pnpm brief`:
```
════════════════════════════════════════
  📰 DAILY BRIEF — [date]
════════════════════════════════════════
🌤  WEATHER ...
📰  TOP HN STORIES ...
🔔  GITHUB NOTIFICATIONS ...
📖  WIKIPEDIA: ...
════════════════════════════════════════
[brief] HTML written to ./output/brief.html
```

The run **must not** print `no such table: briefs` or any DB-related crash.

---

## Required Env Vars

| Variable           | Required | Status in `.env` |
|--------------------|----------|-------------------|
| `WEATHER_LAT`      | ✅ yes   | ✅ SET (`51.5074`) |
| `WEATHER_LON`      | ✅ yes   | ✅ SET (`-0.1278`) |
| `GITHUB_TOKEN`     | ✅ yes   | ✅ SET             |
| `CRON_SCHEDULE`    | no       | ✅ SET (default OK) |
| `HTML_OUTPUT_PATH` | no       | ✅ SET (default OK) |
| `DB_PATH`          | no       | ✅ SET (default OK) |

All required env vars are present. No user action needed.

---

## Requirements Coverage

### G4 — Store last 30 days in SQLite; prune at start of each run

> "G4: Store last 30 days of briefs in SQLite via Drizzle ORM; prune at the start of each run"

The root problem is here: `createDb()` does not auto-create the `briefs` table. Running
`pnpm brief` against a fresh install crashes with `no such table: briefs` when `pruneOldBriefs()`
executes before the table exists.

**Fix required:** `createDb()` must execute `CREATE TABLE IF NOT EXISTS briefs (...)` before
returning, so the table always exists when callers (prune, store) use it.

---

### US1 — `pnpm brief` works out of the box
- **Story:** "I can run `pnpm brief` and get a formatted brief in my terminal within 5 seconds"
- **Currently covered by:** `tests/services/brief-service.test.ts` (orchestration, all APIs mocked)
- **Gap:** No test asserts that `createDb()` produces a functional DB without manual migration.
  The existing `tests/db/client.test.ts` only checks that the file is created, not that the
  schema is initialised.
- **New test needed:** `tests/prd-derived/cli-fresh-db.test.ts` — assert that a freshly-created
  `:memory:` DB can immediately accept `pruneOldBriefs()` and `storeBrief()` calls without
  crashing.

---

### US3 — Partial failures are non-fatal
- **Story:** "If any one data source fails, the brief still generates"
- **Covered by:** `tests/services/brief-service.test.ts` — partial-failure and all-fail cases ✅
- **No gap.**

---

### US7 — Last 30 days stored, old entries pruned automatically
- **Story:** "The last 30 days of briefs are stored locally and old entries are pruned automatically"
- **Covered by:** `tests/db/prune.test.ts`, `tests/db/store.test.ts` ✅
- **Gap:** Both test files manually create the table via raw SQL in `beforeAll`. They do not
  test that `createDb()` itself provides the table. After the fix, the manual `CREATE TABLE`
  in those tests can be removed (it becomes redundant), but the tests themselves still pass.
  No new test required for prune/store behaviour — the existing tests cover the logic.

---

### PRD §8 — DB schema: `briefs` table columns match spec

The PRD specifies:
```
id           INTEGER  PRIMARY KEY AUTOINCREMENT
generated_at TEXT     NOT NULL, UNIQUE
payload      TEXT     NOT NULL
created_at   TEXT     NOT NULL, DEFAULT current_timestamp
```

The fix's `CREATE TABLE IF NOT EXISTS` DDL **must match exactly**:
- Column: `id INTEGER PRIMARY KEY AUTOINCREMENT`
- Column: `generated_at TEXT NOT NULL UNIQUE`
- Column: `payload TEXT NOT NULL`
- Column: `created_at TEXT NOT NULL DEFAULT (current_timestamp)`

Verified against `src/db/schema.ts` — these are the correct column names and types.

---

### US2 — HTML file written after run
- **Covered by:** `tests/renderers/html-renderer.test.ts` (15 tests) ✅
- **No gap related to the DB fix.**

---

### US5 — GitHub notifications show browser-clickable URLs
- **Covered by:** `tests/lib/github-urls.test.ts`, `tests/api/github-api.test.ts` ✅
- **No gap.**

---

### US9 — Wikipedia 280-char summary
- **Covered by:** `tests/renderers/html-renderer.test.ts` (truncation tests) ✅
- **No gap.**

---

## Existing Tests to Run

All 13 test files, 55 tests:

```bash
npx vitest run --pool=forks --poolOptions.forks.maxForks=2
```

| File | Tests | Status before fix |
|------|-------|-------------------|
| `tests/api/github-api.test.ts` | 4 | ✅ pass |
| `tests/api/hn-api.test.ts` | 4 | ✅ pass |
| `tests/api/weather-api.test.ts` | 4 | ✅ pass |
| `tests/api/wikipedia-api.test.ts` | 5 | ✅ pass |
| `tests/config.test.ts` | 3 | ✅ pass |
| `tests/db/client.test.ts` | 2 | ✅ pass |
| `tests/db/prune.test.ts` | 2 | ✅ pass |
| `tests/db/store.test.ts` | 2 | ✅ pass |
| `tests/lib/github-urls.test.ts` | 4 | ✅ pass |
| `tests/lib/weather-codes.test.ts` | 4 | ✅ pass |
| `tests/renderers/html-renderer.test.ts` | 15 | ✅ pass |
| `tests/renderers/terminal-renderer.test.ts` | 3 | ✅ pass |
| `tests/services/brief-service.test.ts` | 3 | ✅ pass |
| **Total** | **55** | **all pass** |

All 55 must still pass after the fix. No regressions.

---

## New Tests to Write

### `tests/prd-derived/cli-fresh-db.test.ts`

**What it tests:** PRD G4 / US1 / US7 — `createDb()` must produce a DB where the `briefs`
table is immediately usable without any manual migration step.

**Setup notes:**
- Use `@libsql/client` in-memory DB (`:memory:`) — no file system side-effects
- Do NOT use `better-sqlite3` — it has Node v24 compatibility issues (see CLAUDE.md)
- The existing DB tests already use `createDb(':memory:')` from `@libsql/client` ✅
- MSW server is already available via `tests/setup.ts` global — import `server` for API mocking

**Tests to implement:**

```ts
// tests/prd-derived/cli-fresh-db.test.ts

describe('createDb() — schema auto-creation (PRD G4 / US1)', () => {

  it('TC-1: createDb() with :memory: does not throw on pruneOldBriefs()', async () => {
    // Arrange
    const db = await createDb(':memory:');
    // Act + Assert — must not throw "no such table: briefs"
    await expect(pruneOldBriefs(db)).resolves.not.toThrow();
  });

  it('TC-2: createDb() with :memory: does not throw on storeBrief()', async () => {
    // Arrange
    const db = await createDb(':memory:');
    const mockBrief: DailyBrief = { /* minimal valid brief */ };
    // Act + Assert
    await expect(storeBrief(db, mockBrief)).resolves.not.toThrow();
  });

  it('TC-3: storeBrief() persists to DB, readable back via drizzle select', async () => {
    // Arrange
    const db = await createDb(':memory:');
    const mockBrief: DailyBrief = { /* minimal valid brief */ };
    // Act
    await storeBrief(db, mockBrief);
    // Assert
    const rows = await db.select().from(briefs);
    expect(rows).toHaveLength(1);
    expect(JSON.parse(rows[0].payload).generatedAt).toBe(mockBrief.generatedAt);
  });

  it('TC-4: createDb() at a fresh file path auto-creates schema (no migration needed)', async () => {
    // Arrange — use a temp file path, not :memory:
    const tmpPath = path.join(os.tmpdir(), `fresh-brief-${Date.now()}.db`);
    // Act
    const db = await createDb(tmpPath);
    // Assert — pruneOldBriefs must work on fresh file DB
    await expect(pruneOldBriefs(db)).resolves.not.toThrow();
    // Cleanup
    fs.unlinkSync(tmpPath);
  });

  it('TC-5: DrizzleDb type is unchanged (callers type-check)', () => {
    // Verifies that createDb() return type still satisfies DrizzleDb
    // This is a compile-time check — if createDb() becomes async, DrizzleDb
    // must be updated to Promise<DrizzleDb> or resolved type
    // Implementation: just call createDb and pass result to pruneOldBriefs
    // without explicit type annotation — TypeScript will catch mismatches
    const dbPromise = createDb(':memory:');
    expect(dbPromise).toBeInstanceOf(Promise);
  });

});
```

**File location:** `tests/prd-derived/cli-fresh-db.test.ts`

**Key assertions Usopp must write:**
1. `pruneOldBriefs(db)` resolves without throwing on a fresh `:memory:` DB
2. `storeBrief(db, brief)` resolves without throwing on a fresh `:memory:` DB
3. Data inserted by `storeBrief` is readable back via `db.select().from(briefs)`
4. Same behaviour on a fresh **file** DB (not just `:memory:`)
5. `createDb(':memory:')` returns a `Promise` (confirms the function is now async)

**Edge cases:**
- TC-1 is the direct regression test for the reported crash — if `CREATE TABLE IF NOT EXISTS`
  is missing from `createDb()`, this test throws `LibsqlError: no such table: briefs`
- TC-4 catches the real-world case (`DB_PATH=./data/brief.db` on a fresh install)
- TC-5 guards the type signature change — if callers are not updated to `await createDb()`,
  they'd pass a `Promise` to `pruneOldBriefs()` which would cause a type error

---

## Implementation Requirements for the Fix

### `src/db/client.ts` — must change

1. Make `createDb` `async` (returns `Promise<...>`)
2. After creating the libsql client, execute:
   ```sql
   CREATE TABLE IF NOT EXISTS briefs (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     generated_at TEXT NOT NULL UNIQUE,
     payload TEXT NOT NULL,
     created_at TEXT NOT NULL DEFAULT (current_timestamp)
   )
   ```
3. Return the drizzle instance after the DDL executes

### `src/index.ts` — must change

- `const db = createDb(config.dbPath)` → `const db = await createDb(config.dbPath)`
  (inside the already-async `runOnce()` function — no structural change needed)

### `tests/db/client.test.ts` — must change

- Both tests call `createDb(...)` synchronously; must `await` the result
- The `works with :memory:` test should also verify the table exists (or leave that to
  `tests/prd-derived/cli-fresh-db.test.ts`)

### `tests/db/prune.test.ts` and `tests/db/store.test.ts` — may simplify

- Currently use `db.run(sql\`CREATE TABLE IF NOT EXISTS...\`)` in `beforeAll`
- After the fix, `createDb(':memory:')` already creates the table — the manual DDL in
  `beforeAll` becomes redundant (but harmless due to `IF NOT EXISTS`)
- Usopp may optionally remove the manual DDL from these test files to keep them clean

### `DrizzleDb` type export — must change

```ts
// Before:
export type DrizzleDb = ReturnType<typeof createDb>;
// After:
export type DrizzleDb = Awaited<ReturnType<typeof createDb>>;
```

---

## Live Run Verification

After implementing the fix, verify:

```bash
# 1. Remove existing DB to simulate fresh install
rm -f ./data/brief.db

# 2. Run the brief
pnpm brief

# 3. Expected: no "no such table" error
# 4. Expected: terminal output renders (may fail on real API calls if env is stale — that's OK)
# 5. Expected: ./output/brief.html is written
# 6. Expected: ./data/brief.db is created with the briefs table
```

To confirm the DB was created correctly:
```bash
# Check table exists
sqlite3 ./data/brief.db ".tables"
# Expected output: briefs

# Check schema
sqlite3 ./data/brief.db ".schema briefs"
# Expected: CREATE TABLE briefs (id INTEGER PRIMARY KEY AUTOINCREMENT, ...)
```

---

## Test Count Target

| Scope | Count |
|-------|-------|
| Existing tests (must stay passing) | 55 |
| New tests in `tests/prd-derived/cli-fresh-db.test.ts` | 5 |
| **Target total** | **≥ 60** |

---

TEST PLAN READY — Usopp to execute
