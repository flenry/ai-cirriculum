import { describe, it, expect, afterEach } from 'vitest';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { createDb } from '../../src/db/client';

describe('db/client', () => {
  afterEach(() => {
    // Clean up test DB file
    const testDbPath = path.join(os.tmpdir(), 'test-brief-client.db');
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('creates db at specified path', async () => {
    const dbPath = path.join(os.tmpdir(), 'test-brief-client.db');
    await expect(createDb(dbPath)).resolves.toBeDefined();
    expect(fs.existsSync(dbPath)).toBe(true);
  });

  it('works with :memory:', async () => {
    await expect(createDb(':memory:')).resolves.toBeDefined();
  });
});
