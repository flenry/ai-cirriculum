# Task: CR: Fix createDb — async + auto-create briefs table

**Status:** for-review
**Created:** 2026-04-05 18:14:06
**ID:** 202604051014064

---

## Description

Make createDb() async and execute CREATE TABLE IF NOT EXISTS briefs DDL after building the Drizzle client. Update all callers (src/index.ts, test files) to await createDb(). Column spec must match actual schema.ts: id, generated_at (UNIQUE), payload, created_at. Also add tests/prd-derived/cli-fresh-db.test.ts integration test.

## Expected Outcome

pnpm brief runs past DB error; 56+ tests pass; no regression; move_to_review with verdict

---

## Review

**Moved to Review:** 2026-04-05 18:16:09
**PR:** _(no PR — direct commit)_

### What Was Done

Made createDb() async and added idempotent CREATE TABLE IF NOT EXISTS briefs DDL (matching schema.ts exactly: id, generated_at UNIQUE, payload, created_at). Updated DrizzleDb type to Awaited<ReturnType<...>>. Updated src/index.ts to await createDb(). Refactored tests/db/prune.test.ts and store.test.ts to use async beforeAll + await createDb() instead of module-level sync call + manual DDL. Updated tests/db/client.test.ts to use async/await. Created tests/prd-derived/cli-fresh-db.test.ts with 5 new integration tests verifying fresh-DB initialisation (US1/US2 coverage).

### How It Was Tested

pnpm vitest run --pool=forks --poolOptions.forks.maxForks=2 → 60/60 tests pass across 14 test files (55 existing + 5 new). Deleted ./data/brief.db to simulate fresh install, ran pnpm brief — app initialised DB, ran all fetches, rendered terminal + HTML output with zero "no such table" errors.
