# daily-brief

> A personal daily brief generator that pulls weather, top HN stories, GitHub notifications, and a random Wikipedia article, then renders as a clean HTML email or terminal output on a cron schedule.

## Goals

- Fetch from 4 live APIs: OpenWeatherMap, HN Algolia, GitHub notifications, Wikipedia random
- Render as terminal output (chalk) and HTML file
- Schedule via cron — configurable time via env var
- Store last 30 days of briefs in SQLite
- All external API calls mocked in tests — zero real network hits in test suite

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
