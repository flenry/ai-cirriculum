# Handover — PRD Stage

> Produced by: board-prd-2 (robin)
> Version: PRD v1.1
> Date: 2026-04-05

---

## Decided

- **Weather API**: Open-Meteo (`api.open-meteo.com/v1/forecast`) — free, no API key, lat/lon config only
- **HN API**: Algolia front-page search (`hn.algolia.com/api/v1/search?tags=front_page`) — single request, simpler than Firebase for v1
- **GitHub API**: REST Notifications (`api.github.com/notifications`) with fine-grained PAT (`notifications` scope)
- **GitHub URL normalisation**: API URLs (`api.github.com/repos/…`) must be converted to browser URLs (`github.com/…`) — hard requirement, tested
- **Wikipedia API**: REST random summary (`en.wikipedia.org/api/rest_v1/page/random/summary`) — returns title + extract + URL in one request; Action API rejected
- **Database**: SQLite + Drizzle ORM; 30-day rolling window; pruning runs before each insert
- **Scheduling model**: Single-run CLI (`pnpm brief`) is primary; system cron is the recommended production setup; `node-cron` is opt-in via `--watch` flag only
- **Partial failure policy**: Best-effort brief always generated and stored; per-section `status: { ok, error }` field in `DailyBrief`; no section failure aborts the run
- **Weather location**: Lat/lon only in v1 (`WEATHER_LAT` + `WEATHER_LON`); no city-name input or geocoding
- **Rendering**: chalk for terminal (dark colour scheme); ES6 template literals for HTML (inline CSS, dark mode, `#0d1117` background)
- **Test coverage target**: ≥ 90% statement coverage; zero real network calls (MSW)
- **WMO weather code mapping**: Ships as `src/lib/weather-codes.ts`; fallback to `"Unknown (code: N)"` for unmapped codes

---

## Rejected

- **OpenWeatherMap**: API key + account creation add friction; Open-Meteo is strictly better for a personal tool
- **Firebase official HN API**: Requires N+1 requests (ID list + individual item fetches); Algolia provides richer data in a single call; Firebase is a potential v2 upgrade
- **Wikipedia Action API**: Returns only page ID/title; requires a second request for extract; REST summary endpoint is better product fit
- **GraphQL for GitHub**: Overbuilt for notifications-only use case
- **node-cron as primary scheduler**: Silently misses runs on sleep/reboot; system cron is more reliable for a daily job
- **City-name weather input (v1)**: Geocoding adds hidden complexity; lat/lon is sufficient for v1

---

## Open

_(Questions the build agent should watch for and not assume resolved)_

- The `hourly` fields from Open-Meteo (`relativehumidity_2m`, `apparent_temperature`) are requested with `forecast_days=1` — the implementation should take `hourly[0]` as the current-hour value and document this assumption
- `storeBrief` duplicate handling: PRD says "log warning, skip insert" — confirm this should not upsert (overwrite) an existing record for the same `generated_at`
- HTML truncation of Wikipedia extract: truncate at word boundary within 280 chars — verify edge case where the entire extract is < 280 chars (no truncation needed)
- `--watch` flag documentation: README should clearly warn users that missed runs are possible if the process dies

---

## Output

- **PRD.md v1.1** — Full PRD rewritten from v1.0 baseline. Key changes vs v1.0:
  - API canon locked: replaced OpenWeatherMap → Open-Meteo; replaced Firebase HN → Algolia (already was Algolia in v1.0 but now explicitly resolved against research handover); replaced Wikipedia Action API → REST summary
  - Removed `OPENWEATHER_API_KEY` env var; added note that no weather API key is needed
  - Added `DailyBrief.status` per-section status field
  - Scheduling model revised: single-run CLI primary, node-cron opt-in via `--watch`
  - GitHub URL normalisation added as hard requirement with mapping table and test coverage requirement
  - `src/lib/` directory added for `weather-codes.ts` and `github-urls.ts`
  - Open Questions table converted to Build Agent Watch List (§16)
  - Phase Breakdown added (§18) covering 8 build days across 5 phases
  - Risks and Mitigations table updated to reflect resolved spec drift
