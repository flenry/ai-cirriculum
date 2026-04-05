# Task: service: src/services/brief-service.ts — Promise.allSettled orchestrator

**Status:** for-review
**Created:** 2026-04-05 15:45:13
**ID:** 202604050745130

---

## Description

Create `src/services/brief-service.ts`. Export `generateBrief(config: Config): Promise<DailyBrief>`.

Exact implementation:
```ts
import { fetchWeather } from '../api/weather-api';
import { fetchHNStories } from '../api/hn-api';
import { fetchGHNotifications } from '../api/github-api';
import { fetchWikiArticle } from '../api/wikipedia-api';
import type { Config } from '../config';
import type { DailyBrief } from '../types/brief';

export async function generateBrief(config: Config): Promise<DailyBrief> {
  const [weatherResult, hnResult, ghResult, wikiResult] = await Promise.allSettled([
    fetchWeather(config.weatherLat, config.weatherLon),
    fetchHNStories(),
    fetchGHNotifications(config.githubToken),
    fetchWikiArticle(),
  ]);

  const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null;
  const hnStories = hnResult.status === 'fulfilled' ? (hnResult.value ?? []) : [];
  const ghNotifications = ghResult.status === 'fulfilled' ? (ghResult.value ?? []) : [];
  const wikiArticle = wikiResult.status === 'fulfilled' ? wikiResult.value : null;

  return {
    generatedAt: new Date().toISOString(),
    weather, hnStories, ghNotifications, wikiArticle,
    status: {
      weather: { ok: weather !== null },
      hn: { ok: hnResult.status === 'fulfilled' },
      github: { ok: ghResult.status === 'fulfilled' },
      wikipedia: { ok: wikiArticle !== null },
    },
  };
}
```

Test file: `tests/services/brief-service.test.ts`
- Set up mock `config`: `{ weatherLat: '51.5', weatherLon: '-0.1', githubToken: 'test-token', cronSchedule: '0 7 * * *', htmlOutputPath: './output/brief.html', dbPath: ':memory:' }`
- Test: `'assembles full brief on success'` — all MSW default handlers active — assert `brief.weather !== null`, `brief.hnStories.length === 1`, `brief.ghNotifications.length === 1`, `brief.wikiArticle !== null`, all `status.ok === true`
- Test: `'sets weather null and status false when weather API fails'` — `server.use(http.get('https://api.open-meteo.com/...', () => HttpResponse.json({}, { status: 500 })))` — assert `brief.weather === null`, `brief.status.weather.ok === false`, other sections still populated
- Test: `'handles all sections failing'` — override all 4 handlers with 500 — assert all sections null/[], `brief.generatedAt` is still a valid ISO string

## Expected Outcome

Test `services/brief: assembles full brief on success` passes. Test `services/brief: weather section null when API fails` passes. Test `services/brief: all sections fail gracefully` passes. File `src/services/brief-service.ts` exports `generateBrief`.

---

## Review

**Moved to Review:** 2026-04-05 16:04:05
**PR:** _(no PR — direct commit)_

### What Was Done

Created src/services/brief-service.ts with generateBrief() function. Uses Promise.allSettled() to fetch all 4 data sources in parallel (weather, HN, GitHub, Wikipedia). Assembles DailyBrief with per-section status (ok/error). Implements partial failure policy - brief always generated even if some APIs fail.

### How It Was Tested

Ran `npx vitest run tests/services/brief-service.test.ts` - all 3 tests pass: (1) assembles full brief on success, (2) weather section null when API fails, (3) all sections fail gracefully.
