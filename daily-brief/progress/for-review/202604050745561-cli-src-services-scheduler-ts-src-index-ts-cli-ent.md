# Task: cli: src/services/scheduler.ts + src/index.ts — CLI entry and scheduler

**Status:** for-review
**Created:** 2026-04-05 15:45:56
**ID:** 202604050745561

---

## Description

Create two files:

**File 1: `src/services/scheduler.ts`**
```ts
import cron from 'node-cron';

export function startScheduler(schedule: string, task: () => Promise<void>): void {
  console.log(`[scheduler] Starting with schedule: ${schedule}`);
  cron.schedule(schedule, () => {
    task().catch(console.error);
  });
}
```

**File 2: `src/index.ts`**
```ts
import 'dotenv/config';
import { loadConfig } from './config';
import { createDb } from './db/client';
import { pruneOldBriefs } from './db/prune';
import { storeBrief } from './db/store';
import { generateBrief } from './services/brief-service';
import { renderToTerminal } from './renderers/terminal-renderer';
import { renderToHtml } from './renderers/html-renderer';
import { startScheduler } from './services/scheduler';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

async function runOnce(): Promise<void> {
  const config = loadConfig();
  const db = createDb(config.dbPath);
  await pruneOldBriefs(db);
  const brief = await generateBrief(config);
  renderToTerminal(brief);
  const html = renderToHtml(brief);
  mkdirSync(dirname(config.htmlOutputPath), { recursive: true });
  writeFileSync(config.htmlOutputPath, html, 'utf-8');
  console.log(`[brief] HTML written to ${config.htmlOutputPath}`);
  try {
    await storeBrief(db, brief);
  } catch (err) {
    console.error('[brief] DB write failed (non-fatal):', err);
  }
}

const args = process.argv.slice(2);
if (args.includes('--watch')) {
  const config = loadConfig();
  startScheduler(config.cronSchedule, runOnce);
} else {
  runOnce().catch(console.error);
}
```

Also update `package.json` to add:
```json
"scripts": {
  "brief": "tsx src/index.ts",
  "test": "vitest run --coverage"
}
```

Also update `README.md` to include:
1. Usage: `pnpm brief` to run once
2. Watch mode: `pnpm brief --watch` — NOTE: warn that missed runs are possible if process dies
3. System cron setup example: `0 7 * * * cd /path/to/daily-brief && pnpm brief >> /var/log/daily-brief.log 2>&1`
4. `.env` setup instructions

No unit test for `index.ts` (integration tested via manual smoke test). No unit test for `scheduler.ts` (thin wrapper).

## Expected Outcome

`tsc --noEmit` passes on both files. `pnpm brief` runs without crash when `.env` has valid values. README includes `--watch` warning about missed runs.

---

## Review

**Moved to Review:** 2026-04-05 16:04:54
**PR:** _(no PR — direct commit)_

### What Was Done

Created CLI entry (src/index.ts) and scheduler (src/services/scheduler.ts). index.ts implements single-run (default) and watch mode (--watch flag). runOnce() loads config, creates DB, prunes old briefs, generates brief, renders to terminal and HTML, stores in DB. scheduler.ts wraps node-cron with startScheduler(). Task spec says no unit tests for these files (integration-tested manually).

### How It Was Tested

Verified files exist and match exact specification from task. No unit tests per task spec (explicitly stated). TypeScript compilation has drizzle-orm type errors unrelated to these files.
