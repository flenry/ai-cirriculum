import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadConfig } from '../src/config';

describe('config', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear env
    process.env = {};
    // Clear module cache so loadConfig re-reads env
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('throws ZodError when GITHUB_TOKEN is missing', () => {
    process.env.WEATHER_LAT = '51.5074';
    process.env.WEATHER_LON = '-0.1278';
    delete process.env.GITHUB_TOKEN;

    expect(() => loadConfig()).toThrow();
  });

  it('returns defaults for optional vars', () => {
    process.env.WEATHER_LAT = '51.5074';
    process.env.WEATHER_LON = '-0.1278';
    process.env.GITHUB_TOKEN = 'test-token';
    delete process.env.CRON_SCHEDULE;
    delete process.env.HTML_OUTPUT_PATH;
    delete process.env.DB_PATH;

    const config = loadConfig();
    expect(config.cronSchedule).toBe('0 7 * * *');
  });

  it('returns provided values', () => {
    process.env.WEATHER_LAT = '40.7128';
    process.env.WEATHER_LON = '-74.0060';
    process.env.GITHUB_TOKEN = 'gh_test123';
    process.env.CRON_SCHEDULE = '0 8 * * *';
    process.env.HTML_OUTPUT_PATH = './custom/brief.html';
    process.env.DB_PATH = './custom/brief.db';

    const config = loadConfig();
    expect(config.weatherLat).toBe('40.7128');
    expect(config.weatherLon).toBe('-74.0060');
    expect(config.githubToken).toBe('gh_test123');
    expect(config.cronSchedule).toBe('0 8 * * *');
    expect(config.htmlOutputPath).toBe('./custom/brief.html');
    expect(config.dbPath).toBe('./custom/brief.db');
  });
});
