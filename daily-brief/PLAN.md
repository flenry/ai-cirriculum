# Plan: daily-brief — Build

> **Version:** build-v1
> **Branch:** build/daily-brief-impl
> **Date:** 2026-04-05
> **Status:** Ready for implementation

---

## Goal

A working CLI tool (`pnpm brief`) that fetches weather/HN/GitHub/Wikipedia, renders chalk terminal output + dark HTML file, stores briefs in SQLite, with ≥ 90% test coverage and zero real network calls in the test suite.

---

## Must-Haves (goal-backward)

- [ ] `pnpm brief` runs end-to-end without error
- [ ] All 4 API modules return typed data or null/[] on failure — never throw out
- [ ] `DailyBrief` assembled via `Promise.allSettled` — one failure never blocks others
- [ ] SQLite persists every brief; prunes records > 30 days old before insert
- [ ] HTML file written to `HTML_OUTPUT_PATH`
- [ ] Chalk terminal output renders each section or a ⚠ notice
- [ ] `GITHUB_TOKEN` missing → section skipped, no crash
- [ ] `WEATHER_LAT`/`WEATHER_LON` missing → section skipped, no crash
- [ ] ≥ 90% statement coverage with MSW mocks (zero real network hits)

---

## Out of Scope

- No email delivery
- No web UI or dashboard
- No geocoding (lat/lon only)
- No multi-user support
- `--watch` mode: implement the scheduler wrapper but do not test node-cron internals

---

## Project scaffold (run before any task)

```bash
pnpm init
pnpm add drizzle-orm better-sqlite3 zod chalk dotenv node-cron
pnpm add -D typescript @types/node @types/better-sqlite3 drizzle-kit vitest msw tsx
npx tsc --init  # strict: true
```

`package.json` scripts:
```json
"brief": "tsx src/index.ts",
"test": "vitest run --coverage"
```

---

## Tasks

---

### Chunk 1: Types + Config

#### Task 1.1 — `src/types/brief.ts` — shared DailyBrief types

- **File:** `src/types/brief.ts` (create new)
- **What:** Export all shared TypeScript interfaces. Copy-paste these exactly:

```ts
export interface SectionStatus { ok: boolean; error?: string }
export interface WeatherData {
  lat: number; lon: number; tempC: number; feelsLikeC: number | null;
  humidity: number | null; description: string; windSpeedKmh: number; isDay: boolean;
}
export interface HNStory {
  id: string; title: string; url: string | null; points: number;
  commentCount: number; author: string;
}
export interface GHNotification {
  id: string; reason: string; unread: boolean; title: string; type: string;
  repo: string; repoUrl: string; humanUrl: string; updatedAt: string;
}
export interface WikiArticle {
  title: string; summary: string; url: string; thumbnailUrl: string | null;
}
export interface DailyBrief {
  generatedAt: string;
  weather: WeatherData | null;
  hnStories: HNStory[];
  ghNotifications: GHNotification[];
  wikiArticle: WikiArticle | null;
  status: {
    weather: SectionStatus; hn: SectionStatus;
    github: SectionStatus; wikipedia: SectionStatus;
  };
}
```

- **Input/Output:** No logic — pure type declarations
- **Outcome:** TypeScript compiles. All other modules can `import type { DailyBrief } from '../types/brief'`.
- **Test guidance:** No test needed — compilation is the test.
- **Edge cases:** None.

---

#### Task 1.2 — `src/config.ts` — env var loading with zod

- **File:** `src/config.ts` (create new)
- **Function signature:**
  ```ts
  export function loadConfig(): Config
  export interface Config {
    weatherLat: string; weatherLon: string; githubToken: string;
    cronSchedule: string; htmlOutputPath: string; dbPath: string;
  }
  ```
- **What:** Call `dotenv/config` at the top. Use zod to parse `process.env`. Required: `WEATHER_LAT`, `WEATHER_LON`, `GITHUB_TOKEN`. Optional with defaults: `CRON_SCHEDULE` (default `"0 7 * * *"`), `HTML_OUTPUT_PATH` (default `"./output/brief.html"`), `DB_PATH` (default `"./data/brief.db"`).

  **Pattern to follow (zod parse):**
  ```ts
  import 'dotenv/config';
  import { z } from 'zod';
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
    return { weatherLat: env.WEATHER_LAT, weatherLon: env.WEATHER_LON, ... };
  }
  ```

- **Error cases:** If `WEATHER_LAT`, `WEATHER_LON`, or `GITHUB_TOKEN` are missing, `EnvSchema.parse` throws — let it propagate.
- **Outcome:** Test `config: throws ZodError when GITHUB_TOKEN is missing` passes. Test `config: returns defaults for optional vars` passes.
- **Test guidance:**
  - Test file: `tests/config.test.ts`
  - `it('throws when GITHUB_TOKEN is missing', () => { delete process.env.GITHUB_TOKEN; expect(() => loadConfig()).toThrow(); })`
  - `it('uses default CRON_SCHEDULE', () => { /* set required vars, leave CRON_SCHEDULE unset */ expect(loadConfig().cronSchedule).toBe('0 7 * * *'); })`
- **Edge cases:** `WEATHER_LAT` can be negative (e.g., "-33.8"). Min(1) accepts negative strings. Do not validate as a number.

---

### Chunk 2: DB Layer

#### Task 2.1 — `src/db/schema.ts` — Drizzle table definition

- **File:** `src/db/schema.ts` (create new)
- **What:** Define the `briefs` table exactly as specified. Copy-paste this exactly:

```ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const briefs = sqliteTable('briefs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  generatedAt: text('generated_at').notNull().unique(),
  payload: text('payload').notNull(),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});
```

- **Outcome:** TypeScript compiles. `src/db/client.ts` can import `briefs` from this file.
- **Test guidance:** No test needed — Drizzle schema typing is the test.
- **Edge cases:** None.

---

#### Task 2.2 — `src/db/client.ts` — Drizzle DB client factory

- **File:** `src/db/client.ts` (create new)
- **Function signature:**
  ```ts
  export function createDb(dbPath: string): BetterSQLite3Database
  ```
- **What:** Accept a `dbPath` string, create the directory if it doesn't exist, open a `BetterSQLite3` connection, return a Drizzle client.

  **Exact pattern:**
  ```ts
  import Database from 'better-sqlite3';
  import { drizzle } from 'drizzle-orm/better-sqlite3';
  import { mkdirSync } from 'fs';
  import { dirname } from 'path';

  export function createDb(dbPath: string) {
    mkdirSync(dirname(dbPath), { recursive: true });
    const sqlite = new Database(dbPath);
    return drizzle(sqlite);
  }
  ```

- **Outcome:** Test `db/client: creates db file at specified path` passes.
- **Test guidance:**
  - Test file: `tests/db/client.test.ts`
  - Use `os.tmpdir()` path: `const db = createDb(path.join(os.tmpdir(), 'test-brief.db'))` — verify it doesn't throw and returns an object.
  - Clean up with `fs.unlinkSync` in `afterEach`.
- **Edge cases:** If directory already exists, `mkdirSync` with `{ recursive: true }` is a no-op — no error.

---

#### Task 2.3 — `src/db/prune.ts` — delete briefs older than 30 days

- **File:** `src/db/prune.ts` (create new)
- **Function signature:**
  ```ts
  export async function pruneOldBriefs(db: BetterSQLite3Database): Promise<void>
  ```
- **What:** Calculate cutoff = now − 30 days. Delete all rows where `generated_at < cutoff.toISOString()`. Use Drizzle `lt` operator.

  **Exact pattern:**
  ```ts
  import { lt } from 'drizzle-orm';
  import { briefs } from './schema';

  export async function pruneOldBriefs(db: ReturnType<typeof createDb>): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    await db.delete(briefs).where(lt(briefs.generatedAt, cutoff.toISOString()));
  }
  ```

- **Outcome:** Test `db/prune: deletes records older than 30 days` passes. Test `db/prune: keeps records exactly 29 days old` passes.
- **Test guidance:**
  - Test file: `tests/db/prune.test.ts`
  - Insert one row with `generated_at` = 31 days ago ISO string. Insert one row with `generated_at` = 29 days ago ISO string.
  - Call `pruneOldBriefs(db)`. Assert: old row deleted, young row still present.
  - Use in-memory SQLite: `createDb(':memory:')` — BUT note `better-sqlite3` uses `:memory:` as a special path, so just pass `':memory:'` and skip `mkdirSync` (guard with `if (dbPath !== ':memory:')` in `client.ts`).
- **Edge cases:** Row exactly 30 days old → its `generated_at` equals the cutoff exactly → `lt` is strict less-than → row IS deleted (equal to cutoff still falls within the prune window). Document this in a comment.

---

#### Task 2.4 — `src/db/store.ts` — insert brief with duplicate guard

- **File:** `src/db/store.ts` (create new)
- **Function signature:**
  ```ts
  export async function storeBrief(db: ReturnType<typeof createDb>, brief: DailyBrief): Promise<void>
  ```
- **What:** Check if a row with matching `generated_at` already exists. If it does, log a warning and return (no upsert, no crash). If not, insert `{ generatedAt: brief.generatedAt, payload: JSON.stringify(brief) }`.

  **Exact pattern:**
  ```ts
  import { eq } from 'drizzle-orm';
  import { briefs } from './schema';
  import type { DailyBrief } from '../types/brief';

  export async function storeBrief(db, brief: DailyBrief): Promise<void> {
    const existing = await db.select().from(briefs)
      .where(eq(briefs.generatedAt, brief.generatedAt)).limit(1);
    if (existing.length > 0) {
      console.warn(`[store] Duplicate brief for ${brief.generatedAt} — skipping insert`);
      return;
    }
    await db.insert(briefs).values({
      generatedAt: brief.generatedAt,
      payload: JSON.stringify(brief),
    });
  }
  ```

- **Outcome:** Test `db/store: inserts brief into db` passes. Test `db/store: skips duplicate generated_at with warning` passes.
- **Test guidance:**
  - Test file: `tests/db/store.test.ts`
  - Happy path: call `storeBrief(db, mockBrief)`, then query DB, assert 1 row, `payload` equals `JSON.stringify(mockBrief)`.
  - Duplicate: call `storeBrief` twice with same `mockBrief`. Assert still only 1 row. Spy on `console.warn`, assert it was called once with a string containing `"Duplicate"`.
  - `mockBrief`: minimal `DailyBrief` with `generatedAt: new Date().toISOString()` and empty arrays.
- **Edge cases:** `JSON.stringify(brief)` — `DailyBrief` is always serialisable (no circular refs, no `undefined` values in required fields).

---

### Chunk 3: Lib Utilities

#### Task 3.1 — `src/lib/weather-codes.ts` — WMO code → description map

- **File:** `src/lib/weather-codes.ts` (create new)
- **Function signature:**
  ```ts
  export function getWeatherDescription(code: number): string
  export const WEATHER_CODES: Record<number, string>
  ```
- **What:** Map WMO weather codes to human-readable descriptions. Must include at minimum:

  ```ts
  export const WEATHER_CODES: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
  };
  export function getWeatherDescription(code: number): string {
    return WEATHER_CODES[code] ?? `Unknown (code: ${code})`;
  }
  ```

- **Outcome:** Test `lib/weather-codes: known code 61 returns "Slight rain"` passes. Test `lib/weather-codes: unknown code 999 returns "Unknown (code: 999)"` passes.
- **Test guidance:**
  - Test file: `tests/lib/weather-codes.test.ts`
  - `expect(getWeatherDescription(0)).toBe('Clear sky')`
  - `expect(getWeatherDescription(61)).toBe('Slight rain')`
  - `expect(getWeatherDescription(999)).toBe('Unknown (code: 999)')`
- **Edge cases:** Code `0` is valid (not falsy-check safe — use `?? not ||`).

---

#### Task 3.2 — `src/lib/github-urls.ts` — API URL → human URL normalisation

- **File:** `src/lib/github-urls.ts` (create new)
- **Function signature:**
  ```ts
  export function normaliseGitHubUrl(apiUrl: string | null, type: string, repoUrl: string): string
  ```
- **What:** Convert GitHub API URLs to browser URLs. Rules:
  - If `type === 'PullRequest'`: replace `https://api.github.com/repos/` with `https://github.com/` AND replace `/pulls/` with `/pull/`
  - If `type === 'Issue'`: replace `https://api.github.com/repos/` with `https://github.com/` (keep `/issues/`)
  - Otherwise (or if `apiUrl` is null): return `repoUrl`

  **Exact pattern:**
  ```ts
  export function normaliseGitHubUrl(
    apiUrl: string | null, type: string, repoUrl: string
  ): string {
    if (!apiUrl) return repoUrl;
    if (type === 'PullRequest') {
      return apiUrl
        .replace('https://api.github.com/repos/', 'https://github.com/')
        .replace('/pulls/', '/pull/');
    }
    if (type === 'Issue') {
      return apiUrl.replace('https://api.github.com/repos/', 'https://github.com/');
    }
    return repoUrl;
  }
  ```

- **Outcome:** Test `lib/github-urls: PR API URL → browser URL` passes. Test `lib/github-urls: Issue API URL → browser URL` passes. Test `lib/github-urls: unknown type returns repoUrl` passes. Test `lib/github-urls: null apiUrl returns repoUrl` passes.
- **Test guidance:**
  - Test file: `tests/lib/github-urls.test.ts`
  - PR: `normaliseGitHubUrl('https://api.github.com/repos/owner/repo/pulls/42', 'PullRequest', 'https://github.com/owner/repo')` → `'https://github.com/owner/repo/pull/42'`
  - Issue: `normaliseGitHubUrl('https://api.github.com/repos/owner/repo/issues/7', 'Issue', 'https://github.com/owner/repo')` → `'https://github.com/owner/repo/issues/7'`
  - Unknown: `normaliseGitHubUrl('https://api.github.com/repos/owner/repo/releases/1', 'Release', 'https://github.com/owner/repo')` → `'https://github.com/owner/repo'`
  - Null: `normaliseGitHubUrl(null, 'PullRequest', 'https://github.com/owner/repo')` → `'https://github.com/owner/repo'`
- **Edge cases:** `apiUrl` can be `null` per the Zod schema — guard first.

---

### Chunk 4: API Layer

> **MSW setup required first.** Create `tests/mocks/handlers.ts` and `tests/setup.ts` before writing API tests.

#### Task 4.0 — `tests/mocks/handlers.ts` + `tests/setup.ts` — MSW setup

- **Files:** `tests/mocks/handlers.ts`, `tests/setup.ts` (create new)
- **What:** Set up MSW (Mock Service Worker) for Node environment.

  `tests/mocks/handlers.ts`:
  ```ts
  import { http, HttpResponse } from 'msw';
  export const handlers = [
    http.get('https://api.open-meteo.com/v1/forecast', () =>
      HttpResponse.json(OPEN_METEO_FIXTURE)),
    http.get('https://hn.algolia.com/api/v1/search', () =>
      HttpResponse.json(HN_FIXTURE)),
    http.get('https://api.github.com/notifications', () =>
      HttpResponse.json(GITHUB_FIXTURE)),
    http.get('https://en.wikipedia.org/api/rest_v1/page/random/summary', () =>
      HttpResponse.json(WIKIPEDIA_FIXTURE)),
  ];
  ```
  Define fixtures as constants at top of the file — minimal valid response shapes (1 story, 1 notification, etc).

  `tests/setup.ts`:
  ```ts
  import { setupServer } from 'msw/node';
  import { handlers } from './mocks/handlers';
  export const server = setupServer(...handlers);
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  ```

  `vitest.config.ts`:
  ```ts
  import { defineConfig } from 'vitest/config';
  export default defineConfig({
    test: {
      setupFiles: ['./tests/setup.ts'],
      coverage: { provider: 'v8', thresholds: { statements: 90 } },
    },
  });
  ```

- **Outcome:** Running `pnpm test` imports MSW setup without errors. All subsequent API tests use MSW interceptors.
- **Test guidance:** No standalone test for this file — it's infrastructure.
- **Edge cases:** `onUnhandledRequest: 'error'` will fail tests if any non-mocked URL is called — this enforces zero real network calls.

---

#### Task 4.1 — `src/api/weather-api.ts` — Open-Meteo fetch

- **File:** `src/api/weather-api.ts` (create new)
- **Function signature:**
  ```ts
  export async function fetchWeather(lat: string, lon: string): Promise<WeatherData | null>
  ```
- **What:** Fetch from Open-Meteo, validate with Zod, normalise to `WeatherData`. On any error (network, HTTP non-2xx, Zod parse fail), log warning to stderr and return `null`.

  **Zod schema (define in this file):**
  ```ts
  const OpenMeteoSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    current_weather: z.object({
      temperature: z.number(), windspeed: z.number(),
      weathercode: z.number(), is_day: z.number(),
    }),
    hourly: z.object({
      relativehumidity_2m: z.array(z.number()),
      apparent_temperature: z.array(z.number()),
    }).optional(),
  });
  ```

  **Fetch URL:**
  ```
  https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=relativehumidity_2m,apparent_temperature&forecast_days=1
  ```

  **Normalisation:**
  ```ts
  const data = OpenMeteoSchema.parse(await res.json());
  return {
    lat: data.latitude, lon: data.longitude,
    tempC: data.current_weather.temperature,
    feelsLikeC: data.hourly?.apparent_temperature[0] ?? null,
    humidity: data.hourly?.relativehumidity_2m[0] ?? null,
    description: getWeatherDescription(data.current_weather.weathercode),
    windSpeedKmh: data.current_weather.windspeed,
    isDay: data.current_weather.is_day === 1,
  };
  ```

  **Error pattern (copy for all API modules):**
  ```ts
  } catch (err) {
    console.warn('[weather] Fetch failed:', err instanceof Error ? err.message : err);
    return null;
  }
  ```

- **Outcome:** Test `api/weather: returns WeatherData on success` passes. Test `api/weather: returns null on HTTP error` passes. Test `api/weather: returns null on Zod parse failure` passes.
- **Test guidance:**
  - Test file: `tests/api/weather-api.test.ts`
  - Use `server.use(http.get(..., () => HttpResponse.json(fixture)))` to override MSW handler per-test
  - HTTP error: override with `() => HttpResponse.json({}, { status: 500 })`
  - Zod failure: override with `() => HttpResponse.json({ latitude: 'bad' })`
  - Assert `console.warn` was called on error paths (spy with `vi.spyOn(console, 'warn')`)
- **Edge cases:** `hourly` is optional in schema — if missing, `feelsLikeC` and `humidity` are `null`, not undefined.

---

#### Task 4.2 — `src/api/hn-api.ts` — Algolia HN fetch

- **File:** `src/api/hn-api.ts` (create new)
- **Function signature:**
  ```ts
  export async function fetchHNStories(): Promise<HNStory[]>
  ```
- **What:** Fetch from Algolia, validate with Zod, normalise hits to `HNStory[]`. On any error, log warning and return `[]` (empty array, not null).

  **Zod schema (define in this file):**
  ```ts
  const HNHitSchema = z.object({
    objectID: z.string(), title: z.string(),
    url: z.string().url().nullable().optional(),
    points: z.number().nullable().optional(),
    num_comments: z.number().nullable().optional(),
    author: z.string(),
  });
  const HNResponseSchema = z.object({ hits: z.array(HNHitSchema) });
  ```

  **Fetch URL:** `https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=10`

  **Normalisation:**
  ```ts
  return data.hits.map(hit => ({
    id: hit.objectID, title: hit.title, url: hit.url ?? null,
    points: hit.points ?? 0, commentCount: hit.num_comments ?? 0, author: hit.author,
  }));
  ```

- **Outcome:** Test `api/hn: returns HNStory[] on success` passes. Test `api/hn: returns [] on HTTP error` passes.
- **Test guidance:**
  - Test file: `tests/api/hn-api.test.ts`
  - Happy path: fixture with 2 hits; assert array length 2, first story has correct `id`, `title`, `points`.
  - Error path: 500 response → expect `[]` returned and `console.warn` called.
- **Edge cases:** `url` can be null/undefined in Algolia response — normalise to `null`. `points` can be null — normalise to `0`.

---

#### Task 4.3 — `src/api/github-api.ts` — GitHub notifications fetch

- **File:** `src/api/github-api.ts` (create new)
- **Function signature:**
  ```ts
  export async function fetchGHNotifications(token: string): Promise<GHNotification[]>
  ```
- **What:** Fetch from GitHub REST API with `Authorization: Bearer <token>` header. Validate with Zod. For each notification, call `normaliseGitHubUrl` to compute `humanUrl`. On any error (including missing/empty token), log warning and return `[]`.

  **Guard for empty token:**
  ```ts
  if (!token) {
    console.warn('[github] GITHUB_TOKEN not set — skipping notifications');
    return [];
  }
  ```

  **Zod schema (define in this file):**
  ```ts
  const GitHubNotificationSchema = z.object({
    id: z.string(), reason: z.string(), unread: z.boolean(),
    subject: z.object({ title: z.string(), type: z.string(), url: z.string().nullable() }),
    repository: z.object({ full_name: z.string(), html_url: z.string() }),
    updated_at: z.string(),
  });
  const GitHubNotificationsResponseSchema = z.array(GitHubNotificationSchema);
  ```

  **Normalisation:**
  ```ts
  return data.map(n => ({
    id: n.id, reason: n.reason, unread: n.unread,
    title: n.subject.title, type: n.subject.type,
    repo: n.repository.full_name, repoUrl: n.repository.html_url,
    humanUrl: normaliseGitHubUrl(n.subject.url, n.subject.type, n.repository.html_url),
    updatedAt: n.updated_at,
  }));
  ```

- **Outcome:** Test `api/github: returns GHNotification[] on success` passes. Test `api/github: returns [] when token is empty` passes. Test `api/github: returns [] on 401 response` passes.
- **Test guidance:**
  - Test file: `tests/api/github-api.test.ts`
  - Token empty: `fetchGHNotifications('')` → expect `[]`, `console.warn` called.
  - 401: use MSW to return status 401 → expect `[]`.
  - Happy path: fixture with 1 PR notification; assert `humanUrl` is browser URL (contains `/pull/` not `/pulls/`).
- **Edge cases:** `subject.url` can be null (Zod schema allows it) — `normaliseGitHubUrl` handles null by returning `repoUrl`.

---

#### Task 4.4 — `src/api/wikipedia-api.ts` — Wikipedia random summary

- **File:** `src/api/wikipedia-api.ts` (create new)
- **Function signature:**
  ```ts
  export async function fetchWikiArticle(): Promise<WikiArticle | null>
  ```
- **What:** Fetch from Wikipedia REST API. Validate with Zod. Truncate `extract` to 280 chars at a word boundary. On error, return `null`.

  **Zod schema:**
  ```ts
  const WikipediaSchema = z.object({
    title: z.string(), extract: z.string(),
    content_urls: z.object({ desktop: z.object({ page: z.string() }) }),
    thumbnail: z.object({ source: z.string() }).optional(),
  });
  ```

  **Truncation logic (exact implementation):**
  ```ts
  function truncateAtWord(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    const truncated = text.slice(0, maxLen);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
  }
  ```

  **Normalisation:**
  ```ts
  return {
    title: data.title,
    summary: truncateAtWord(data.extract, 280),
    url: data.content_urls.desktop.page,
    thumbnailUrl: data.thumbnail?.source ?? null,
  };
  ```

- **Outcome:** Test `api/wikipedia: returns WikiArticle on success` passes. Test `api/wikipedia: truncates extract at word boundary` passes. Test `api/wikipedia: does not truncate extract under 280 chars` passes. Test `api/wikipedia: returns null on HTTP error` passes.
- **Test guidance:**
  - Test file: `tests/api/wikipedia-api.test.ts`
  - Truncation: fixture with `extract` = 300-char string ending `"...hello world"` — assert `summary` ends at a word boundary (no split word), length ≤ 280.
  - Short extract: fixture with 100-char extract — assert `summary` equals the full extract.
  - Null thumbnail: no `thumbnail` in fixture → `thumbnailUrl` is `null`.
- **Edge cases:** `extract` exactly 280 chars → no truncation. `lastIndexOf(' ')` returns `-1` on a single-word string > 280 chars → return raw slice (no word boundary possible).

---

### Chunk 5: Service + Renderers

#### Task 5.1 — `src/services/brief-service.ts` — orchestrator

- **File:** `src/services/brief-service.ts` (create new)
- **Function signature:**
  ```ts
  export async function generateBrief(config: Config): Promise<DailyBrief>
  ```
- **What:** Call all 4 API fetchers concurrently using `Promise.allSettled`. Assemble `DailyBrief`. Each settled result maps to a section; rejected results produce null/[] with `status.ok = false`.

  **Exact pattern:**
  ```ts
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
  ```

- **Outcome:** Test `services/brief: assembles full brief on success` passes. Test `services/brief: weather section null when API returns null` passes. Test `services/brief: all sections fail gracefully` passes.
- **Test guidance:**
  - Test file: `tests/services/brief-service.test.ts`
  - Full brief: all MSW handlers return valid fixtures → assert all sections populated, all `status.ok = true`.
  - Partial: override MSW to return 500 for weather → assert `weather === null`, `status.weather.ok === false`, other sections still populated.
  - All fail: override all MSW handlers to 500 → `weather === null`, `hnStories === []`, etc., all `status.ok === false`.
- **Edge cases:** `fetchHNStories` returns `[]` on error (not null) — `status.hn.ok` should be `true` if the call fulfilled (even returning empty array is a fulfilled promise). Adjust: `status.hn.ok = hnResult.status === 'fulfilled'`.

---

#### Task 5.2 — `src/renderers/terminal-renderer.ts` — chalk terminal output

- **File:** `src/renderers/terminal-renderer.ts` (create new)
- **Function signature:**
  ```ts
  export function renderToTerminal(brief: DailyBrief): void
  ```
- **What:** Print formatted brief to stdout using chalk. Each section has a labelled header. Null sections print a dim ⚠ notice. Use these exact chalk styles:
  - Divider + header: `chalk.bold.cyan`
  - Section label: `chalk.bold.yellow`
  - Story points/count: `chalk.dim`
  - URLs: `chalk.blue.underline`
  - Warnings (null section): `chalk.dim('⚠ [Section] unavailable')`
  - Errors: `chalk.red`

  **Exact structure to print:**
  ```
  ════════════════════════════════════════
    📰 DAILY BRIEF — [formatted date]
  ════════════════════════════════════════

  🌤  WEATHER — [lat]°, [lon]°
    [temp]°C, feels like [feelsLike]°C | [description]
    Wind: [wind] km/h

  📰  TOP HN STORIES
    1. [pts pts] Title (author) — url
    ... (top 5 only)

  🔔  GITHUB NOTIFICATIONS ([count] unread)
    • [PR]  repo — title — humanUrl
    ... (up to 10)

  📖  WIKIPEDIA: [title]
    [summary]
    Read more: [url]

  ════════════════════════════════════════
  ```

  Show top 5 HN stories in terminal. Show up to 10 GitHub notifications.
  If `weather === null`: print `chalk.dim('  ⚠ Weather unavailable')`.
  If `wikiArticle === null`: print `chalk.dim('  ⚠ Wikipedia unavailable')`.
  If `ghNotifications.length === 0`: print `chalk.dim('  ⚠ No GitHub notifications')`.

- **Outcome:** Test `renderers/terminal: renders full brief without throwing` passes. Test `renderers/terminal: renders null weather section with warning` passes.
- **Test guidance:**
  - Test file: `tests/renderers/terminal-renderer.test.ts`
  - Spy on `process.stdout.write` or `console.log` — assert it was called.
  - Full brief: use `mockBrief` with all sections filled; call `renderToTerminal(mockBrief)`; assert no throw, `console.log` called at least 5 times.
  - Null weather: `mockBrief.weather = null`; assert output contains "unavailable" string.
  - Snapshot test optional — chalk colours complicate snapshots; prefer assertion-based.
- **Edge cases:** `feelsLikeC` can be null → render as `"N/A"`. `hnStories` is never null (always array) — just slice to 5.

---

#### Task 5.3 — `src/renderers/html-renderer.ts` — HTML file renderer

- **File:** `src/renderers/html-renderer.ts` (create new)
- **Function signature:**
  ```ts
  export function renderToHtml(brief: DailyBrief): string
  ```
- **What:** Return a complete HTML string. Dark background `#0d1117`, inline CSS, no external dependencies. Use ES6 template literals.

  **Required structure:**
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Daily Brief — [date]</title>
    <style>
      body { background: #0d1117; color: #c9d1d9; font-family: -apple-system, sans-serif; max-width: 640px; margin: 0 auto; padding: 2rem; }
      h1 { color: #58a6ff; }
      .section { background: #161b22; border-radius: 6px; padding: 1rem; margin: 1rem 0; }
      .section h2 { color: #f0883e; margin-top: 0; }
      a { color: #58a6ff; }
      .unavailable { color: #6e7681; font-style: italic; }
    </style>
  </head>
  <body>
    <header><h1>Daily Brief</h1><time>[generatedAt]</time></header>
    <section id="weather" class="section">...</section>
    <section id="hn-stories" class="section">...</section>
    <section id="github" class="section">...</section>
    <section id="wikipedia" class="section">...</section>
  </body>
  </html>
  ```

  - Show **all 10** HN stories (vs 5 in terminal).
  - Show **all** GitHub notifications.
  - Null sections render `<p class="unavailable">⚠ Unavailable</p>` — never omit.
  - All URLs rendered as `<a href="...">...</a>`.
  - Escape HTML in user-provided strings: title, summary, author — use a minimal `escapeHtml(s: string)` helper:
    ```ts
    function escapeHtml(s: string): string {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    ```

- **Outcome:** Test `renderers/html: returns valid HTML string` passes. Test `renderers/html: null sections render unavailable notice` passes. Test `renderers/html: escapes HTML in story titles` passes.
- **Test guidance:**
  - Test file: `tests/renderers/html-renderer.test.ts`
  - Assert return value `startsWith('<!DOCTYPE html>')`.
  - Null weather: `brief.weather = null` → assert output contains `'⚠ Unavailable'`.
  - XSS: story title `'<script>alert(1)</script>'` → assert output contains `'&lt;script&gt;'`.
  - All 10 HN stories: fixture with 10 stories; assert all 10 appear in output.
- **Edge cases:** `escapeHtml` must handle `&`, `<`, `>`. Ampersands in titles are common.

---

### Chunk 6: CLI Entry + Scheduler + Wiring

#### Task 6.1 — `src/services/scheduler.ts` — optional node-cron wrapper

- **File:** `src/services/scheduler.ts` (create new)
- **Function signature:**
  ```ts
  export function startScheduler(schedule: string, task: () => Promise<void>): void
  ```
- **What:** Wrap `node-cron`. Call `cron.schedule(schedule, task)`. Log the schedule on start.

  **Exact pattern:**
  ```ts
  import cron from 'node-cron';
  export function startScheduler(schedule: string, task: () => Promise<void>): void {
    console.log(`[scheduler] Starting with schedule: ${schedule}`);
    cron.schedule(schedule, () => { task().catch(console.error); });
  }
  ```

- **Outcome:** File compiles without TypeScript errors. No standalone test needed (node-cron internals not tested).
- **Test guidance:** Skip — this is a thin wrapper.
- **Edge cases:** `task()` rejections are caught and logged to prevent unhandled promise rejection crashing the process.

---

#### Task 6.2 — `src/index.ts` — CLI entry point

- **File:** `src/index.ts` (create new)
- **What:** Parse CLI args. Default behaviour (no flag or `--now`): run once. `--watch`: start scheduler. Both paths call `generateBrief`, then `renderToTerminal`, then `renderToHtml` + write file, then `storeBrief`.

  **Exact wiring pattern:**
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

- **Outcome:** `pnpm brief` runs without errors when `.env` is set. No unit test for `index.ts` (tested via integration).
- **Test guidance:** Manual smoke test only. Add to handover/build.md.
- **Edge cases:** `storeBrief` errors are caught and logged — DB failure must not stop terminal/HTML output.

---

#### Task 6.3 — Project scaffold files

- **Files to create:**
  - `package.json` (with `"brief": "tsx src/index.ts"` and `"test": "vitest run --coverage"` scripts)
  - `tsconfig.json` (strict mode, `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`, `"outDir": "dist"`)
  - `vitest.config.ts` (setupFiles, coverage thresholds)
  - `.env.example`
  - Updated `.gitignore` (add `output/`, `data/`)

  **`.env.example`:**
  ```
  WEATHER_LAT=51.5074
  WEATHER_LON=-0.1278
  GITHUB_TOKEN=your_github_pat_here
  CRON_SCHEDULE=0 7 * * *
  HTML_OUTPUT_PATH=./output/brief.html
  DB_PATH=./data/brief.db
  ```

- **Outcome:** `pnpm install` succeeds. `pnpm test` finds and runs test files.
- **Test guidance:** N/A.
- **Edge cases:** `tsconfig.json` must have `"esModuleInterop": true` for `import cron from 'node-cron'` default import.

---

## Execution Order

```
1.  Task 6.3  — scaffold (package.json, tsconfig, vitest.config)   [no deps]
2.  Task 1.1  — src/types/brief.ts                                  [no deps]
3.  Task 1.2  — src/config.ts                                       [deps: 1.1]
4.  Task 2.1  — src/db/schema.ts                                    [no deps]
5.  Task 2.2  — src/db/client.ts                                    [deps: 2.1]
6.  Task 2.3  — src/db/prune.ts                                     [deps: 2.2]
7.  Task 2.4  — src/db/store.ts                                     [deps: 2.2, 1.1]
8.  Task 3.1  — src/lib/weather-codes.ts                            [no deps]
9.  Task 3.2  — src/lib/github-urls.ts                              [no deps]
10. Task 4.0  — tests/mocks/handlers.ts + tests/setup.ts            [no deps]
11. Task 4.1  — src/api/weather-api.ts                              [deps: 3.1, 4.0]
12. Task 4.2  — src/api/hn-api.ts                                   [deps: 4.0]
13. Task 4.3  — src/api/github-api.ts                               [deps: 3.2, 4.0]
14. Task 4.4  — src/api/wikipedia-api.ts                            [deps: 4.0]
15. Task 5.1  — src/services/brief-service.ts                       [deps: 4.1–4.4, 1.2]
16. Task 5.2  — src/renderers/terminal-renderer.ts                  [deps: 1.1]
17. Task 5.3  — src/renderers/html-renderer.ts                      [deps: 1.1]
18. Task 6.1  — src/services/scheduler.ts                           [no deps]
19. Task 6.2  — src/index.ts                                        [deps: all]
```

---

## TODO

- [ ] Task 6.3: Scaffold — `package.json`, `tsconfig.json`, `vitest.config.ts`, `.env.example`, `.gitignore`
- [ ] Task 1.1: Types — `src/types/brief.ts`
- [ ] Task 1.2: Config — `src/config.ts` + `tests/config.test.ts`
- [ ] Task 2.1: DB Schema — `src/db/schema.ts`
- [ ] Task 2.2: DB Client — `src/db/client.ts` + `tests/db/client.test.ts`
- [ ] Task 2.3: DB Prune — `src/db/prune.ts` + `tests/db/prune.test.ts`
- [ ] Task 2.4: DB Store — `src/db/store.ts` + `tests/db/store.test.ts`
- [ ] Task 3.1: Lib weather-codes — `src/lib/weather-codes.ts` + `tests/lib/weather-codes.test.ts`
- [ ] Task 3.2: Lib github-urls — `src/lib/github-urls.ts` + `tests/lib/github-urls.test.ts`
- [ ] Task 4.0: MSW setup — `tests/mocks/handlers.ts` + `tests/setup.ts`
- [ ] Task 4.1: API weather — `src/api/weather-api.ts` + `tests/api/weather-api.test.ts`
- [ ] Task 4.2: API HN — `src/api/hn-api.ts` + `tests/api/hn-api.test.ts`
- [ ] Task 4.3: API GitHub — `src/api/github-api.ts` + `tests/api/github-api.test.ts`
- [ ] Task 4.4: API Wikipedia — `src/api/wikipedia-api.ts` + `tests/api/wikipedia-api.test.ts`
- [ ] Task 5.1: Service — `src/services/brief-service.ts` + `tests/services/brief-service.test.ts`
- [ ] Task 5.2: Terminal renderer — `src/renderers/terminal-renderer.ts` + `tests/renderers/terminal-renderer.test.ts`
- [ ] Task 5.3: HTML renderer — `src/renderers/html-renderer.ts` + `tests/renderers/html-renderer.test.ts`
- [ ] Task 6.1: Scheduler — `src/services/scheduler.ts`
- [ ] Task 6.2: CLI entry — `src/index.ts`
