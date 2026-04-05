# daily-brief

> A personal daily brief generator that pulls weather, top HN stories, GitHub notifications, and a random Wikipedia article, then renders as a clean HTML email or terminal output on a cron schedule.

## Routing Table

Read the files listed for your stage. Skip everything else unless explicitly needed.

| Stage      | Load                                           | Skip           |
|------------|------------------------------------------------|----------------|
| research   | context/research.md                            | everything else |
| board-prd  | context/board-prd.md, handover/research.md     | everything else |
| build      | context/build.md, handover/prd.md              | everything else |
| test       | context/test.md, handover/build.md             | everything else |
| cr/review  | context/review.md, handover/test.md            | everything else |

## Tech Stack

- **Runtime**: Node.js (ESM, `tsx` for execution)
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm
- **ORM**: Drizzle ORM + better-sqlite3
- **Validation**: zod
- **Scheduling**: node-cron
- **Rendering**: chalk (terminal), raw HTML string (file output)
- **Testing**: Vitest + MSW (API mocking)

## Project Structure

```
daily-brief/
├── src/
│   ├── api/                  # One module per data source
│   │   ├── weather-api.ts    # OpenWeatherMap (no API key needed for free tier)
│   │   ├── hn-api.ts         # HN Algolia search API
│   │   ├── github-api.ts     # GitHub notifications REST API
│   │   └── wikipedia-api.ts  # Wikipedia random article REST API
│   ├── db/
│   │   ├── client.ts         # createDb(path) → Drizzle DB instance
│   │   ├── schema.ts         # Drizzle schema: briefs table
│   │   ├── store.ts          # storeBrief(db, brief)
│   │   └── prune.ts          # pruneOldBriefs(db) — keeps last 30 days
│   ├── lib/
│   │   ├── weather-codes.ts  # WMO code → human description
│   │   └── github-urls.ts    # notification → HTML URL converter
│   ├── renderers/
│   │   ├── terminal-renderer.ts  # chalk-based terminal output
│   │   └── html-renderer.ts      # standalone HTML file renderer
│   ├── services/
│   │   ├── brief-service.ts  # generateBrief(config) → DailyBrief
│   │   └── scheduler.ts      # startScheduler(cron, fn) wraps node-cron
│   ├── types/
│   │   └── brief.ts          # All shared TypeScript interfaces
│   ├── config.ts             # loadConfig() — zod-validated env vars
│   └── index.ts              # CLI entry: --watch for cron, default = run once
├── tests/                    # Mirrors src/ structure
│   ├── mocks/                # MSW handlers + server setup
│   └── setup.ts              # Vitest global setup (starts MSW server)
├── .env.example              # Required env vars template
├── output/                   # HTML brief output (gitignored)
├── data/                     # SQLite DB (gitignored)
├── DESIGN.md                 # HTML renderer design system (colors, fonts, layout)
├── PRD.md                    # Full product requirements v1.1
└── PLAN.md                   # Build-stage micro-task breakdown
```

## Key Conventions

- kebab-case files, PascalCase classes, camelCase functions, snake_case DB columns
- All API modules export a single async function, return typed data or throw
- Partial brief policy: failed sections produce `null` data + `status.ok = false`, never abort the whole brief
- All external HTTP in tests is intercepted via MSW — zero real network calls
- DB layer uses Drizzle ORM with better-sqlite3 (synchronous SQLite)

## Current State (2026-04-05)

**Test-expansion stage complete.** Full implementation + deep HTML renderer tests.

- ✅ 4 API modules (weather, HN, GitHub, Wikipedia) with zod validation
- ✅ DB layer: schema, client, store, prune (30-day retention)
- ✅ 2 renderers: terminal (chalk) and HTML file
- ✅ brief-service orchestrator with partial-failure tolerance
- ✅ Scheduler wrapper (node-cron) + CLI entry point
- ✅ MSW mock infrastructure — all API tests pass
- ✅ HTML renderer: 15 tests covering truncation, XSS escaping, dark mode, thumbnails, null handling, GitHub notifications, meta tags
- ⚠️ DB tests fail on Node v24 — better-sqlite3 lacks prebuilt binary for Node v24.13.0/darwin/arm64. Tests pass on Node ≤22.

**Known Issue:** `better-sqlite3@12.8.0` doesn't ship a prebuilt native binding for Node v24. Use Node 20 or 22 for DB tests, or run `pnpm rebuild better-sqlite3` to compile from source.

## Design System

**Read [`DESIGN.md`](DESIGN.md) before touching `src/renderers/html-renderer.ts`.**

The HTML output follows a strict "Refined GitHub-Dark meets Editorial Print" design system defined in `DESIGN.md`. It specifies exact hex colors, font pairings (Playfair Display / Source Serif 4 / JetBrains Mono), spacing, component inventory, and the Wikipedia truncation rule. Deviating from these specs without updating `DESIGN.md` first is not allowed.

## How to Work on This

- Run the brief once: `pnpm brief`
- Run with cron scheduler: `pnpm brief --watch`
- Run tests (non-DB): all API, lib, renderer, and service tests pass on any Node version
- DB tests require Node ≤22 or rebuilt native bindings

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `WEATHER_LAT` | ✅ | — | Latitude for weather lookup |
| `WEATHER_LON` | ✅ | — | Longitude for weather lookup |
| `GITHUB_TOKEN` | ✅ | — | GitHub Personal Access Token |
| `CRON_SCHEDULE` | ❌ | `0 7 * * *` | Cron expression for `--watch` mode |
| `HTML_OUTPUT_PATH` | ❌ | `./output/brief.html` | Where to write the HTML brief |
| `DB_PATH` | ❌ | `./data/brief.db` | SQLite database file path |

## Always Use

Drizzle ORM, zod, pnpm

## Task Board

Before starting any work: `list_tasks("todo")` — work on existing tasks before creating new ones.
After completing work: `move_to_review` — never self-approve.

_Last updated: 2026-04-05_
