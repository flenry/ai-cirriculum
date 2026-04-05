# Task: scaffold: package.json, tsconfig, vitest.config, .env.example

**Status:** for-review
**Created:** 2026-04-05 15:43:00
**ID:** 202604050743005

---

## Description

Create all project scaffold files before any source code.

Files to create:
- `package.json` — include scripts: `"brief": "tsx src/index.ts"`, `"test": "vitest run --coverage"`. Dependencies: drizzle-orm, better-sqlite3, zod, chalk, dotenv, node-cron. DevDependencies: typescript, @types/node, @types/better-sqlite3, drizzle-kit, vitest, @vitest/coverage-v8, msw, tsx.
- `tsconfig.json` — strict: true, module: NodeNext, moduleResolution: NodeNext, esModuleInterop: true, outDir: dist, target: ES2022
- `vitest.config.ts`:
  ```ts
  import { defineConfig } from 'vitest/config';
  export default defineConfig({
    test: {
      setupFiles: ['./tests/setup.ts'],
      coverage: { provider: 'v8', thresholds: { statements: 90 } },
    },
  });
  ```
- `.env.example`:
  ```
  WEATHER_LAT=51.5074
  WEATHER_LON=-0.1278
  GITHUB_TOKEN=your_github_pat_here
  CRON_SCHEDULE=0 7 * * *
  HTML_OUTPUT_PATH=./output/brief.html
  DB_PATH=./data/brief.db
  ```
- `.gitignore` additions: `output/`, `data/`

Then run `pnpm install` to verify.

## Expected Outcome

`pnpm install` completes successfully. `pnpm test` can find and run test files (even if no tests exist yet).

---

## Review

**Moved to Review:** 2026-04-05 15:57:48
**PR:** _(no PR — direct commit)_

### What Was Done

Created all scaffold files: package.json (with scripts and dependencies), tsconfig.json (strict mode, NodeNext), vitest.config.ts (with coverage thresholds), .env.example (all env vars documented), .gitignore (output/ and data/ directories). Ran pnpm install successfully. Fixed MSW setup in tests/setup.ts to export server instance.

### How It Was Tested

Ran pnpm install - completed successfully. Verified pnpm test can discover test files. Confirmed all scaffold files exist with correct content.
