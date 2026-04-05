# PRD — daily-brief

> **Version:** v1.0
> **Status:** Draft
> **Date:** 2026-04-05

## Changelog

| Version | Date       | Summary               | PR/Commit |
|---------|------------|-----------------------|-----------|
| v1.0    | 2026-04-05 | Initial PRD           | init      |

---

## Problem Statement

A personal daily brief generator that pulls weather, top HN stories, GitHub notifications, and a random Wikipedia article, then renders as a clean HTML email or terminal output on a cron schedule.

## Goals

- Fetch from 4 live APIs: OpenWeatherMap, HN Algolia, GitHub notifications, Wikipedia random
- Render as terminal output (chalk) and HTML file
- Schedule via cron — configurable time via env var
- Store last 30 days of briefs in SQLite
- All external API calls mocked in tests — zero real network hits in test suite

## Non-Goals

- No email sending in v1 — output to stdout and file only
- No web dashboard or frontend
- No auth system

## Tech Stack

TypeScript, pnpm, SQLite + Drizzle, Vitest

## User Stories

**US-1:** Fetch from 4 live APIs: OpenWeatherMap, HN Algolia, GitHub notifications, Wikipedia random

**US-2:** Render as terminal output (chalk) and HTML file

**US-3:** Schedule via cron — configurable time via env var

**US-4:** Store last 30 days of briefs in SQLite

**US-5:** All external API calls mocked in tests — zero real network hits in test suite

## Phase Breakdown

### Phase 1 — Foundation
- [ ] ...

### Phase 2 — Core
- [ ] ...

### Phase 3 — Polish
- [ ] ...

## Success Metrics

| Metric | Target |
|--------|--------|
| ...    | ...    |

## Open Questions

- ...
