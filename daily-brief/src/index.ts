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
