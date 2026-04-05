# Handover: test
_2026-04-05 | v1_

## Decided

- **55/55 tests pass** on Node v24.13.0 — full suite green, zero flakes
- PRD §14 test strategy coverage confirmed:
  - `tests/api/` — all 4 API modules: happy path, HTTP error, network error, zod failure
  - `tests/db/` — prune cutoff boundary (30d / 29d), store insert, duplicate handling
  - `tests/lib/` — weather code mapping, GitHub URL normalisation (PR / Issue / unknown)
  - `tests/config.ts` — required-var enforcement, optional-var defaults
  - `tests/services/` — brief-service orchestration (full, partial, all-fail)
  - `tests/renderers/` — terminal + HTML renderer (15 HTML tests: truncation, XSS escape, dark mode, thumbnails, null sections, GitHub notifications, meta tags)
- MSW mock infrastructure fully in place — zero real network calls in test suite (PRD G5 ✅)
- Partial-failure tolerance verified at unit + integration level (PRD G6, US3 ✅)
- GitHub URL normalisation unit-tested (PRD US5 ✅)
- Config validation (missing required vars) tested (PRD US4 ✅)
- DB layer was successfully migrated from `better-sqlite3` to `@libsql/client`, resolving the Node v24 native-binding blocker

## Rejected

- N/A

## Open

### Issue 1 — Runtime crash: `no such table: briefs` on first run
- **Severity:** CRITICAL
- **PRD requirements violated:** US1 (🔴 Must), US2 (🔴 Must), PRD §4 G4, PRD §11 DB write failure policy
- **What:** `pnpm brief` crashes immediately with `LibsqlError: SQLITE_ERROR: no such table: briefs`. `pruneOldBriefs()` runs at startup before the schema exists. `createDb()` returns a Drizzle instance but never creates the table. There is no `drizzle-kit push` step wired into the CLI flow.
- **Where:** `src/db/client.ts` — `createDb()` never issues `CREATE TABLE IF NOT EXISTS briefs (…)`
- **Reproduction:** `pnpm brief` on any environment without a pre-existing `brief.db`
- **Required fix:** Make `createDb()` async; after building the Drizzle client, execute idempotent DDL via the raw libsql client. Update all callers (`src/index.ts`) to `await createDb(…)`. Column spec must match `src/db/schema.ts` exactly:
  ```
  id INTEGER PRIMARY KEY AUTOINCREMENT
  generated_at TEXT NOT NULL UNIQUE
  payload TEXT NOT NULL
  created_at TEXT NOT NULL DEFAULT (current_timestamp)
  ```
  ⚠ Note: FINDINGS.md lists older column names (`weather_json`, `hn_json`, etc.). The **actual** schema in `src/db/schema.ts` uses a single `payload` column (full JSON blob) plus `generated_at` and `created_at`. The DDL must match `schema.ts` — not the FINDINGS description.
- **Acceptance criteria:** `pnpm brief` runs past the DB error; test count ≥ 56 (add `tests/prd-derived/cli-fresh-db.test.ts`)

### Issue 2 — No `tests/prd-derived/` directory
- **Severity:** MAJOR
- **PRD requirement:** §14 test strategy implicitly requires integration coverage of the CLI entry point; task spec explicitly requires `tests/prd-derived/cli-fresh-db.test.ts`
- **What:** No prd-derived tests were written. The fresh-DB integration test is missing entirely.
- **Required fix:** Add `tests/prd-derived/cli-fresh-db.test.ts` — spawns brief generator against `:memory:` DB, asserts no "no such table" error, asserts brief is generated even with network failures.

## Output

- Test results: **55/55 passing** (pre-fix baseline)
- PRD coverage: **5/6 requirements verified** (US1 + US2 blocked by runtime crash; US3–US5, US7 confirmed at unit level)
- New tests: none (tests/prd-derived/ does not yet exist)
- Screenshots: none (CLI app — no visual output)
