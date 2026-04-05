# Task: config: src/config.ts — env var loading with zod

**Status:** todo
**Created:** 2026-04-05 15:43:18
**ID:** 202604050743185

---

## Description

Create `src/config.ts`. Load env vars with dotenv + zod. Required vars throw on missing; optional vars use defaults.

Exact implementation:
```ts
import 'dotenv/config';
import { z } from 'zod';

export interface Config {
  weatherLat: string; weatherLon: string; githubToken: string;
  cronSchedule: string; htmlOutputPath: string; dbPath: string;
}

const EnvSchema = z.object({
  WEATHER_LAT: z.string().min(1),
  WEATHER_LON: z.string().min(1),
  GITHUB_TOKEN: z.string().min(1),
  CRON_SCHEDULE: z.string().default('0 7 * * *'),
  HTML_OUTPUT_PATH: z.string().default('./output/brief.html'),
  DB_PATH: z.string().default('./data/brief.db'),
});

export function loadConfig(): Config {
  const env = EnvSchema.parse(process.env);
  return {
    weatherLat: env.WEATHER_LAT, weatherLon: env.WEATHER_LON,
    githubToken: env.GITHUB_TOKEN, cronSchedule: env.CRON_SCHEDULE,
    htmlOutputPath: env.HTML_OUTPUT_PATH, dbPath: env.DB_PATH,
  };
}
```

Test file: `tests/config.test.ts`
- Before each test, save and restore `process.env`
- Test: `'throws ZodError when GITHUB_TOKEN is missing'` — delete `process.env.GITHUB_TOKEN`, set `WEATHER_LAT` and `WEATHER_LON`, expect `loadConfig()` to throw
- Test: `'returns defaults for optional vars'` — set all 3 required vars, unset optional vars, assert `loadConfig().cronSchedule === '0 7 * * *'`
- Test: `'returns provided values'` — set all 6 vars, assert returned config matches

## Expected Outcome

Test `config: throws ZodError when GITHUB_TOKEN is missing` passes. Test `config: returns defaults for optional vars` passes. File `src/config.ts` exports `loadConfig` and `Config`.
