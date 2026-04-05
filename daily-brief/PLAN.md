# Plan — daily-brief

> **Status:** Planning
> **Started:** 2026-04-05

## Goal

A personal daily brief generator that pulls weather, top HN stories, GitHub notifications, and a random Wikipedia article, then renders as a clean HTML email or terminal output on a cron schedule.

## Must-Haves

- [ ] Fetch from 4 live APIs: OpenWeatherMap, HN Algolia, GitHub notifications, Wikipedia random
- [ ] Render as terminal output (chalk) and HTML file
- [ ] Schedule via cron — configurable time via env var
- [ ] Store last 30 days of briefs in SQLite
- [ ] All external API calls mocked in tests — zero real network hits in test suite

## Out of Scope

- No email sending in v1 — output to stdout and file only
- No web dashboard or frontend
- No auth system

## Tasks

_Robin generates this during the build chain. Entries below are placeholders._

### Phase 1 — Foundation
- [ ] ...

### Phase 2 — Core
- [ ] ...

### Phase 3 — Polish
- [ ] ...
