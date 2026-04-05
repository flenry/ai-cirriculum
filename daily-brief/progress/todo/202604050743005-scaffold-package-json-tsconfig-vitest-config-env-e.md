# Task: scaffold: package.json, tsconfig, vitest.config, .env.example

**Status:** todo
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
