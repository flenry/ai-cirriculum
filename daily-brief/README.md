# daily-brief

> A personal daily brief generator that pulls weather, top HN stories, GitHub notifications, and a random Wikipedia article, then renders as a clean HTML email or terminal output on a cron schedule.

## Goals

- Fetch from 4 live APIs: OpenWeatherMap, HN Algolia, GitHub notifications, Wikipedia random
- Render as terminal output (chalk) and HTML file
- Schedule via cron — configurable time via env var
- Store last 30 days of briefs in SQLite
- All external API calls mocked in tests — zero real network hits in test suite

## Getting Started

**Prerequisites:** Node 20+ (Node 22 recommended for SQLite tests), pnpm

```bash
# Install dependencies
pnpm install

# Copy env template and fill in your values
cp .env.example .env
```

Edit `.env`:

```env
WEATHER_LAT=51.5074          # Your latitude
WEATHER_LON=-0.1278          # Your longitude
GITHUB_TOKEN=ghp_...         # GitHub Personal Access Token (notifications scope)
CRON_SCHEDULE=0 7 * * *      # When to run in --watch mode (default: 7am daily)
HTML_OUTPUT_PATH=./output/brief.html
DB_PATH=./data/brief.db
```

## Running

```bash
# Run once — prints to terminal and writes ./output/brief.html
pnpm brief

# Run on cron schedule (CRON_SCHEDULE env var, default 7am daily)
pnpm brief --watch
```

## Testing

```bash
# Run full test suite with coverage
pnpm test

# Note: DB tests (tests/db/) require Node ≤22 due to better-sqlite3 native bindings.
# All other tests (API, lib, renderers, services) pass on any Node version.
```

**Test coverage:** 13 test files, 51 tests. All API/lib/renderer/service tests pass on any Node version. DB tests require Node 20 or 22 (better-sqlite3 native binding issue on Node v24).

## Workflow

| Stage      | Chain          | Output                  |
|------------|----------------|-------------------------|
| Research   | `research`     | handover/research.md    |
| PRD        | `board-prd`   | PRD.md, handover/prd.md |
| Build      | `build`        | implementation + tests  |
| Test       | `build`        | handover/test.md        |
| Review     | `cr`           | handover/review.md      |

See [CLAUDE.md](CLAUDE.md) for routing table and project map.
See [PRD.md](PRD.md) for requirements.
See [PLAN.md](PLAN.md) for current task breakdown.
See [DESIGN.md](DESIGN.md) for HTML renderer design system (colors, fonts, layout).

_Last updated: 2026-04-05_
