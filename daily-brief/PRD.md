# PRD — daily-brief

> **Version:** v1.1
> **Status:** Approved
> **Date:** 2026-04-05

## Changelog

| Version | Date       | Summary                                                        | PR/Commit  |
|---------|------------|----------------------------------------------------------------|------------|
| v1.0    | 2026-04-05 | Full PRD: API specs, schema, env, test strategy                | board-prd  |
| v1.1    | 2026-04-05 | Board review applied: API canon locked, scheduler model revised, Wikipedia upgraded, GitHub normalization required, partial-failure policy hardened | board-prd-2 |

---

## Executive Summary

**daily-brief** is a personal, zero-friction CLI tool that assembles a morning briefing from four live data sources — weather, top Hacker News stories, GitHub notifications, and a random Wikipedia article — then renders it as coloured terminal output and a self-contained HTML file.

It runs on demand via a single CLI command (`pnpm brief`) and can be wired to system cron for daily automation. The last 30 days of briefs are stored locally in SQLite. There is no server, no auth system, no email — just a fast, local, hackable daily digest.

---

## 1. Problem Statement

A developer's morning routine requires opening multiple tabs (weather, HN, GitHub, Wikipedia) across different contexts. This is slow, fragmented, and easy to skip. A single composable brief — run from the terminal or opened as an HTML file — replaces that friction with a single command.

The tool must work out of the box with minimal configuration (no paid API keys except GitHub PAT), be reliable enough to trust daily, and be simple enough to hack.

---

## 2. Goals

| # | Goal |
|---|------|
| G1 | Fetch from 4 data sources: Open-Meteo (weather), HN Algolia (stories), GitHub REST Notifications, Wikipedia REST random summary |
| G2 | Render as terminal output (chalk) and write a self-contained HTML file |
| G3 | Run via a single CLI command (`--now` flag); cron scheduling is external (system cron / crontab) — `node-cron` is available but not the primary operational model |
| G4 | Store last 30 days of briefs in SQLite via Drizzle ORM; prune at the start of each run |
| G5 | All external API calls mocked in tests — zero real network hits in the test suite |
| G6 | Partial failures are non-fatal: each section degrades independently; brief is always generated and stored |

---

## 3. Non-Goals (v1)

- No email sending — stdout and file only
- No web dashboard or frontend UI
- No user authentication or multi-user support
- No Slack/push notifications
- No built-in process manager — deployment is the user's responsibility
- No geocoding: weather location is configured as lat/lon only (no city-name lookup)

**v2 ideas:** email delivery via SendGrid, browser-based dashboard, push to Slack, city-name geocoding.

---

## 4. Tech Stack

| Concern         | Choice                       |
|-----------------|------------------------------|
| Language        | TypeScript (strict mode)     |
| Runtime         | Node.js 20+                  |
| Package manager | pnpm                         |
| Database        | SQLite + Drizzle ORM         |
| Scheduling      | External system cron (primary); `node-cron` optional via `--watch` flag |
| Terminal output | chalk                        |
| HTML output     | ES6 template literals (inline CSS, dark mode) |
| Validation      | zod                          |
| Testing         | Vitest + MSW                 |

---

## 5. Environment Variables (.env spec)

All config lives in a `.env` file at the project root. A `.env.example` ships with the repo.

| Variable           | Required | Default                  | Description |
|--------------------|----------|--------------------------|-------------|
| `WEATHER_LAT`      | ✅ yes   | —                        | Latitude for weather location (Open-Meteo) |
| `WEATHER_LON`      | ✅ yes   | —                        | Longitude for weather location (Open-Meteo) |
| `GITHUB_TOKEN`     | ✅ yes   | —                        | GitHub Personal Access Token (fine-grained PAT, `notifications` scope) |
| `CRON_SCHEDULE`    | no       | `0 7 * * *` (7am daily)  | node-cron expression (only used with `--watch` flag) |
| `HTML_OUTPUT_PATH` | no       | `./output/brief.html`    | Path where HTML file is written |
| `DB_PATH`          | no       | `./data/brief.db`        | SQLite database file path |

> **No OpenWeatherMap API key required.** Open-Meteo is free and key-less.
>
> **GITHUB_TOKEN behaviour:** If missing or invalid, GitHub notifications section is skipped with a warning. The brief is still generated.
>
> **Weather location:** Only lat/lon is supported in v1. There is no city-name input or geocoding. At least `WEATHER_LAT` and `WEATHER_LON` must be set, or the weather section is skipped with a warning.

---

## 6. API Specifications

### 6.1 Weather — Open-Meteo

**Endpoint:**
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={WEATHER_LAT}
  &longitude={WEATHER_LON}
  &current_weather=true
  &hourly=relativehumidity_2m,apparent_temperature
  &forecast_days=1
```

**Auth:** None — no API key required.

**Rate limit:** None meaningful for 1 call/day.

**Weather code mapping:** Open-Meteo returns numeric `weathercode` values (WMO standard). The implementation must map these to human-readable descriptions (e.g., `0 → "Clear sky"`, `61 → "Slight rain"`). A complete mapping table ships in `src/lib/weather-codes.ts`.

**Zod schema:**
```ts
// src/types/weather.ts
export const OpenMeteoResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  current_weather: z.object({
    temperature: z.number(),
    windspeed: z.number(),
    weathercode: z.number(),
    is_day: z.number(),
  }),
  hourly: z.object({
    relativehumidity_2m: z.array(z.number()),
    apparent_temperature: z.array(z.number()),
  }).optional(),
});

// Normalised internal type
export interface WeatherData {
  lat: number;
  lon: number;
  tempC: number;
  feelsLikeC: number | null;   // from hourly[0] apparent_temperature
  humidity: number | null;      // from hourly[0] relativehumidity_2m
  description: string;          // mapped from weathercode
  windSpeedKmh: number;
  isDay: boolean;
}
```

---

### 6.2 Hacker News — Algolia Front Page

**Endpoint:**
```
GET https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=10
```

**Auth:** None.

**Rate limit:** Generous public API — no practical concern for 1 call/day.

**Zod schema:**
```ts
// src/types/hn.ts
export const HNHitSchema = z.object({
  objectID: z.string(),
  title: z.string(),
  url: z.string().url().nullable().optional(),
  points: z.number().nullable().optional(),
  num_comments: z.number().nullable().optional(),
  author: z.string(),
});

export const HNResponseSchema = z.object({
  hits: z.array(HNHitSchema),
});

// Normalised internal type
export interface HNStory {
  id: string;
  title: string;
  url: string | null;
  points: number;
  commentCount: number;
  author: string;
}
```

Fetch top 10 stories. Terminal renders top 5; HTML renders all 10.

---

### 6.3 GitHub — Notifications

**Endpoint:**
```
GET https://api.github.com/notifications
```

**Auth:** `Authorization: Bearer <GITHUB_TOKEN>`, `Accept: application/vnd.github.v3+json`

**Rate limit:** 5 000 req/hr authenticated. 1 call/day — no concern.

**URL normalisation (required):** The `subject.url` returned by the API is an API URL (e.g. `https://api.github.com/repos/…/pulls/42`), not a human-facing URL. The implementation must convert these to browser-visible GitHub URLs:

| `subject.type` | API URL pattern | Human URL pattern |
|---|---|---|
| `PullRequest` | `…/repos/{owner}/{repo}/pulls/{n}` | `https://github.com/{owner}/{repo}/pull/{n}` |
| `Issue` | `…/repos/{owner}/{repo}/issues/{n}` | `https://github.com/{owner}/{repo}/issues/{n}` |
| other | leave as-is or use `repository.html_url` | — |

**Zod schema:**
```ts
// src/types/github.ts
export const GitHubNotificationSchema = z.object({
  id: z.string(),
  reason: z.string(),
  unread: z.boolean(),
  subject: z.object({
    title: z.string(),
    type: z.string(),
    url: z.string().nullable(),
  }),
  repository: z.object({
    full_name: z.string(),
    html_url: z.string(),
  }),
  updated_at: z.string(),
});

export const GitHubNotificationsResponseSchema = z.array(GitHubNotificationSchema);

// Normalised internal type
export interface GHNotification {
  id: string;
  reason: string;
  unread: boolean;
  title: string;
  type: string;
  repo: string;
  repoUrl: string;
  humanUrl: string;      // normalised browser URL (not the API URL)
  updatedAt: string;
}
```

Terminal: show up to 10. HTML: show all.

**Missing/invalid token behaviour:** Skip section, emit warning to stderr, set `ghNotifications: []`. Do not abort.

---

### 6.4 Wikipedia — Random Article Summary

**Endpoint:**
```
GET https://en.wikipedia.org/api/rest_v1/page/random/summary
```

**Auth:** None.

**Why this endpoint (not Action API):** Returns title + extract + canonical page URL in a single request. The Action API random endpoint returns only a page title/ID and requires a second fetch for the summary. The REST summary endpoint is simpler and produces higher-quality brief content.

**Zod schema:**
```ts
// src/types/wikipedia.ts
export const WikipediaResponseSchema = z.object({
  title: z.string(),
  extract: z.string(),
  content_urls: z.object({
    desktop: z.object({
      page: z.string(),
    }),
  }),
  thumbnail: z.object({
    source: z.string(),
  }).optional(),
});

// Normalised internal type
export interface WikiArticle {
  title: string;
  summary: string;         // first 280 chars of extract, truncated at word boundary
  url: string;
  thumbnailUrl: string | null;
}
```

---

## 7. Aggregated Brief Type

```ts
// src/types/brief.ts
export interface SectionStatus {
  ok: boolean;
  error?: string;
}

export interface DailyBrief {
  generatedAt: string;                    // ISO 8601 timestamp
  weather: WeatherData | null;
  hnStories: HNStory[];
  ghNotifications: GHNotification[];
  wikiArticle: WikiArticle | null;
  status: {                               // per-section fetch status
    weather: SectionStatus;
    hn: SectionStatus;
    github: SectionStatus;
    wikipedia: SectionStatus;
  };
}
```

---

## 8. SQLite Schema

**Table: `briefs`**

| Column         | Type    | Constraints                      | Description |
|----------------|---------|----------------------------------|-------------|
| `id`           | INTEGER | PRIMARY KEY AUTOINCREMENT        | Internal row ID |
| `generated_at` | TEXT    | NOT NULL, UNIQUE                 | ISO 8601 timestamp of brief generation |
| `payload`      | TEXT    | NOT NULL                         | Full `DailyBrief` JSON (stringified, includes `status` field) |
| `created_at`   | TEXT    | NOT NULL, DEFAULT current_time   | Row insert timestamp |

**Drizzle schema (`src/db/schema.ts`):**
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

**Pruning rule:** Delete rows where `generated_at < (now − 30 days)`. Runs **at the start of each brief generation**, before inserting the new record.

```ts
// Pseudocode — src/db/prune.ts
const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - 30);
await db.delete(briefs).where(lt(briefs.generatedAt, cutoff.toISOString()));
```

**Edge cases:**
- Row with `generated_at` exactly 30 days ago → deleted (boundary is exclusive: `< cutoff`).
- `storeBrief` called twice with the same `generated_at` → log warning, skip insert (do not upsert or crash).
- All briefs are partial (status.ok = false for all sections) → still stored. Partial is valid.

---

## 9. Rendering Spec

### 9.1 Terminal Output (chalk)

```
════════════════════════════════════════
  📰 DAILY BRIEF — Sun, 5 Apr 2026 07:00
════════════════════════════════════════

🌤  WEATHER — 51.5°N, -0.1°E
  15°C, feels like 13°C | Clear sky
  Wind: 14 km/h

📰  TOP HN STORIES
  1. [1234 pts] Title of story one (author) — https://…
  2. [980 pts]  Title of story two (author) — https://…
  … (top 5)

🔔  GITHUB NOTIFICATIONS (3 unread)
  • [PR]    owner/repo — Title of pull request — https://github.com/owner/repo/pull/42
  • [Issue] other/repo — Issue title — https://github.com/other/repo/issues/7
  … (up to 10)

📖  WIKIPEDIA: Article Title
  Short extract text, up to ~280 chars…
  Read more: https://en.wikipedia.org/wiki/…

════════════════════════════════════════
```

**chalk usage:**
- Header: `chalk.bold.cyan`
- Section labels: `chalk.bold.yellow`
- Story points / counts: `chalk.dim`
- URLs: `chalk.blue.underline`
- Section skipped (null): `chalk.dim` notice, e.g. `⚠ Weather unavailable`
- Errors/warnings: `chalk.red`

### 9.2 HTML File Output

Written to `HTML_OUTPUT_PATH` (default `./output/brief.html`). Single self-contained file with inline CSS, no external dependencies.

**Design:** dark background (`#0d1117`), card layout per section, system font stack, readable at 640 px. Dark mode first.

**Structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Daily Brief — [date]</title>
  <style>/* inline dark CSS */</style>
</head>
<body>
  <header>
    <h1>Daily Brief</h1>
    <time>[generated_at]</time>
  </header>
  <section id="weather"> … </section>
  <section id="hn-stories"> … </section>
  <section id="github"> … </section>
  <section id="wikipedia"> … </section>
</body>
</html>
```

Skipped sections (null data) render a visible `⚠ Unavailable` card — they are never omitted from the HTML.

---

## 10. Scheduling Model

**Primary model: single-run CLI command**

```bash
pnpm brief        # generate one brief immediately
pnpm brief --now  # alias; same behaviour
```

Users add this to their system crontab for daily automation:
```
0 7 * * * cd /path/to/daily-brief && pnpm brief >> /var/log/daily-brief.log 2>&1
```

**Optional: `--watch` flag**

When `pnpm brief --watch` is passed, `node-cron` is used to keep the process alive and fire on `CRON_SCHEDULE`. This is a convenience mode, not the recommended operational model. Users who rely on it accept the risk of missed runs if the process is killed.

**Why not node-cron as primary:**
- If the machine sleeps or reboots at scheduled time, the run is silently missed.
- System cron survives reboots and handles DST shifts correctly.
- A long-running Node process for a once-daily task is wasteful.

---

## 11. Error Handling Strategy

**Policy: best-effort brief — partial is valid, abort is never the answer.**

| Scenario                                    | Behaviour |
|---------------------------------------------|-----------|
| Open-Meteo error / missing lat+lon          | `weather: null`, `status.weather.ok = false`, log warning to stderr |
| HN Algolia error                            | `hnStories: []`, `status.hn.ok = false`, log warning |
| GitHub: missing/invalid token               | `ghNotifications: []`, `status.github.ok = false`, log warning |
| GitHub: rate-limited or API error           | Same as above |
| Wikipedia error                             | `wikiArticle: null`, `status.wikipedia.ok = false`, log warning |
| DB write failure                            | Log error to stderr, do NOT crash — brief still renders to terminal + HTML |
| HTML write failure                          | Log error, do NOT crash |
| All sections failed                         | Render empty brief with per-section `⚠ Unavailable` notices; still stored |
| Zod parse failure (valid HTTP, bad shape)   | Treat as API error; return null/[] for that section |

**Implementation:** Each API fetch is wrapped in `try/catch` at the service layer. The orchestrator assembles `DailyBrief` from resolved values (which may be null/[]). `Promise.allSettled` is used for concurrent fetching.

---

## 12. User Stories (Prioritised)

| # | Priority | Story |
|---|----------|-------|
| US1 | 🔴 Must | As a developer, I can run `pnpm brief` and get a formatted brief in my terminal within 5 seconds |
| US2 | 🔴 Must | As a developer, after running the brief, an HTML file is written that I can open in a browser |
| US3 | 🔴 Must | As a developer, if any one data source fails, the brief still generates with the remaining sections |
| US4 | 🔴 Must | As a developer, I can configure my weather location via `WEATHER_LAT` / `WEATHER_LON` in `.env` |
| US5 | 🔴 Must | As a developer, GitHub notifications show browser-clickable URLs, not API endpoint URLs |
| US6 | 🟠 Should | As a developer, I can wire the tool to system cron and trust it to fire every morning |
| US7 | 🟠 Should | The last 30 days of briefs are stored locally and old entries are pruned automatically |
| US8 | 🟡 Could | As a developer, I can use `--watch` to keep the process alive with node-cron scheduling |
| US9 | 🟡 Could | The Wikipedia section shows a readable 280-char summary + clickable article URL |

---

## 13. File Structure

```
src/
  api/
    weather-api.ts         — Open-Meteo fetch + validate, return WeatherData
    hn-api.ts              — Algolia fetch + validate, return HNStory[]
    github-api.ts          — REST notifications fetch + validate + URL normalise, return GHNotification[]
    wikipedia-api.ts       — REST random summary fetch + validate, return WikiArticle

  db/
    schema.ts              — Drizzle table definitions
    client.ts              — Drizzle client factory (accepts DB_PATH)
    prune.ts               — pruneOldBriefs(db): deletes records > 30 days old
    store.ts               — storeBrief(db, brief): insert; handles duplicate generated_at

  services/
    brief-service.ts       — orchestrator: calls all APIs via Promise.allSettled, assembles DailyBrief
    scheduler.ts           — optional node-cron wrapper (used by --watch flag only)

  renderers/
    terminal-renderer.ts   — renderToTerminal(brief: DailyBrief): void
    html-renderer.ts       — renderToHtml(brief: DailyBrief): string

  lib/
    weather-codes.ts       — WMO weather code → human description mapping table
    github-urls.ts         — normaliseGitHubUrl(apiUrl, type): string helper

  types/
    weather.ts
    hn.ts
    github.ts
    wikipedia.ts
    brief.ts

  config.ts                — loads + validates env vars with zod, exports Config
  index.ts                 — entry: parse CLI flags, run once (--now / default) or start --watch

output/
  brief.html               — last generated HTML brief (gitignored)

data/
  brief.db                 — SQLite database (gitignored)

tests/
  api/                     — unit tests: each module, happy path + error + zod failure
  db/                      — unit: prune cutoff, store, duplicate handling
  services/                — integration: brief-service with mocked API modules
  renderers/               — snapshot: terminal + HTML, full brief + partial brief
  lib/                     — unit: weather-codes mapping, github-urls normalisation
  mocks/
    handlers.ts            — MSW request handlers
  setup.ts                 — Vitest global setup (MSW server start/stop)
```

---

## 14. Test Strategy

**Framework:** Vitest + MSW  
**Coverage target:** ≥ 90% statement coverage  
**Policy:** Zero real network calls. All `fetch` calls intercepted via MSW handlers.

| Test type   | Location             | What to test |
|-------------|----------------------|--------------|
| Unit        | `tests/api/`         | Each API module: happy path, HTTP error, network error, zod parse failure |
| Unit        | `tests/db/`          | `pruneOldBriefs`: cutoff boundary (30d deleted, 29d kept); `storeBrief`: insert, duplicate handled |
| Unit        | `tests/lib/`         | Weather code mapping (known codes, unknown code fallback); GitHub URL normalisation (PR, Issue, unknown type) |
| Unit        | `tests/`             | `config.ts`: throws on missing required vars, defaults for optional |
| Integration | `tests/services/`    | `brief-service`: full brief, all-fail brief, mixed partial |
| Snapshot    | `tests/renderers/`   | Terminal + HTML: full brief, partial brief (null sections) |

**Key edge cases:**
- Open-Meteo: `WEATHER_LAT`/`WEATHER_LON` both missing → `weather: null`, no crash
- GitHub: `GITHUB_TOKEN` missing → `ghNotifications: []`, warning emitted
- GitHub URL normalisation: PR and Issue API URLs correctly converted; unknown type falls back to `repoUrl`
- Wikipedia: `extract` longer than 280 chars → truncated at word boundary
- Pruning: exactly 30-day-old row → deleted; 29-day-old → kept
- `storeBrief` called twice with same `generated_at` → second call is a no-op (no crash)
- `Promise.allSettled` in brief-service: one rejected → other sections unaffected
- All sections failed → brief stored with all `status.ok = false`

---

## 15. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Spec drift (research vs PRD conflict) | High (was unresolved) | High | **Resolved in v1.1.** API canon locked: Open-Meteo, Algolia, GitHub REST, Wikipedia REST summary |
| node-cron misses runs (sleep/reboot) | Medium | Medium | Primary model is single-run CLI + system cron; node-cron is opt-in `--watch` mode only |
| Open-Meteo weather code unmapped | Low | Low | Ship complete WMO code table in `src/lib/weather-codes.ts`; fallback to `"Unknown (code: N)"` |
| GitHub API URLs unreadable | Low (requirement) | High | URL normalisation is a hard requirement, tested in `tests/lib/github-urls.ts` |
| Wikipedia Action API weak UX | N/A | N/A | Resolved: REST summary endpoint chosen — returns title + extract + URL in one request |
| DB write failure corrupts run | Low | Low | DB errors are non-fatal; brief renders and exits successfully even if storage fails |
| HN Algolia indexing lag | Very Low | Low | Acceptable for a daily brief; lag is minutes, not hours |
| Zod schema drift (API changes shape) | Low | Medium | Strict Zod schemas at API boundary; failures caught and treated as section errors |

---

## 16. Open Questions → Build Agent Watch List

These were open at board stage and are resolved in v1.1. The build agent should note:

| Question | Resolution | Build note |
|----------|-----------|------------|
| City name vs lat/lon for weather? | **Lat/lon only in v1.** No geocoding. | `WEATHER_LAT` + `WEATHER_LON` required; skip with warning if missing |
| HTML output path configurable? | **Yes.** `HTML_OUTPUT_PATH`, default `./output/brief.html` | |
| DB pruning: before or after insert? | **Before insert**, at start of each run | Implemented in `src/db/prune.ts`, called first in brief-service |
| Firebase vs Algolia for HN? | **Algolia for v1** — simpler, single request | Document in README that Firebase is a potential v2 upgrade |
| Wikipedia Action API vs REST summary? | **REST summary** — title + extract + URL in one request | No second request needed |
| Scheduling: node-cron vs system cron? | **System cron primary**; node-cron opt-in via `--watch` | README must include crontab setup example |
| Partial-failure policy? | **Best-effort**: always generate, always store, per-section `status` field | `DailyBrief.status` is required output, not optional |

---

## 17. Success Metrics

| Metric | Target |
|--------|--------|
| Test coverage | ≥ 90% statement coverage |
| Section independence | All 4 sections can fail independently without crashing |
| Single-run latency | Brief generated within 5 seconds on a normal connection |
| HTML validity | Valid HTML5, renders in Firefox/Chrome |
| DB pruning | No brief older than 30 days retained after any run |
| GitHub URL quality | All PR and Issue notifications have browser-clickable URLs (not API URLs) |
| Wikipedia quality | Every article entry has title + ≥1 sentence extract + canonical URL |

---

## 18. Phase Breakdown

### Phase 1 — Foundation (Days 1–2)
- Project scaffold: `pnpm init`, TypeScript strict, Vitest config, MSW setup
- `src/config.ts`: env var loading + zod validation
- `src/db/`: Drizzle schema, client, `pruneOldBriefs`, `storeBrief`
- `src/lib/weather-codes.ts`: WMO code mapping table
- `src/lib/github-urls.ts`: API URL → human URL normalisation
- Tests: config, db, lib modules

### Phase 2 — API Layer (Days 3–4)
- `src/api/weather-api.ts`: Open-Meteo fetch + validate + normalise
- `src/api/hn-api.ts`: Algolia fetch + validate + normalise
- `src/api/github-api.ts`: REST notifications + URL normalisation
- `src/api/wikipedia-api.ts`: REST random summary + truncation
- Tests: all 4 API modules (happy path + error + zod failure)

### Phase 3 — Orchestration + Rendering (Days 5–6)
- `src/services/brief-service.ts`: `Promise.allSettled` orchestration, `DailyBrief` assembly with per-section status
- `src/renderers/terminal-renderer.ts`: chalk output
- `src/renderers/html-renderer.ts`: inline-CSS dark HTML
- Tests: brief-service integration, renderer snapshots

### Phase 4 — CLI + Scheduler (Day 7)
- `src/index.ts`: CLI flag parsing (`--now`, `--watch`)
- `src/services/scheduler.ts`: optional node-cron wrapper
- `pnpm brief` script in `package.json`
- README: usage, `.env.example`, crontab setup instructions

### Phase 5 — Polish + CI (Day 8)
- Coverage gate (`≥ 90%`) in Vitest config
- `.gitignore` for `output/`, `data/`, `.env`
- Final test run, coverage report
- PROGRESS.md update
