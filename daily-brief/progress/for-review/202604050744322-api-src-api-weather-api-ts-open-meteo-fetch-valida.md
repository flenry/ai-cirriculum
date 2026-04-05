# Task: api: src/api/weather-api.ts — Open-Meteo fetch + validate + normalise

**Status:** for-review
**Created:** 2026-04-05 15:44:32
**ID:** 202604050744322

---

## Description

Create `src/api/weather-api.ts`. Export `fetchWeather(lat: string, lon: string): Promise<WeatherData | null>`.

Exact implementation pattern:
```ts
import { z } from 'zod';
import { getWeatherDescription } from '../lib/weather-codes';
import type { WeatherData } from '../types/brief';

const OpenMeteoSchema = z.object({
  latitude: z.number(), longitude: z.number(),
  current_weather: z.object({
    temperature: z.number(), windspeed: z.number(),
    weathercode: z.number(), is_day: z.number(),
  }),
  hourly: z.object({
    relativehumidity_2m: z.array(z.number()),
    apparent_temperature: z.array(z.number()),
  }).optional(),
});

export async function fetchWeather(lat: string, lon: string): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,apparent_temperature&forecast_days=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  } catch (err) {
    console.warn('[weather] Fetch failed:', err instanceof Error ? err.message : err);
    return null;
  }
}
```

Test file: `tests/api/weather-api.test.ts`
- Import `server` from `../setup`, import `http, HttpResponse` from `msw`
- Test: `'returns WeatherData on success'` — default MSW handler returns OPEN_METEO_FIXTURE — assert `result.tempC === 15`, `result.description === 'Clear sky'`, `result.feelsLikeC === 13`
- Test: `'returns null on HTTP 500'` — `server.use(http.get('https://api.open-meteo.com/v1/forecast', () => HttpResponse.json({}, { status: 500 })))` — assert result is null, `console.warn` called
- Test: `'returns null on Zod parse failure'` — return `{ latitude: 'bad' }` — assert null, warn called
- Test: `'returns null when hourly is missing'` — return fixture without `hourly` — assert `feelsLikeC === null`, `humidity === null` (not null return — the fetch succeeds)

## Expected Outcome

Test `api/weather: returns WeatherData on success` passes. Test `api/weather: returns null on HTTP 500` passes. Test `api/weather: returns null on Zod parse failure` passes. File `src/api/weather-api.ts` exports `fetchWeather`.

---

## Review

**Moved to Review:** 2026-04-05 16:03:18
**PR:** _(no PR — direct commit)_

### What Was Done

Created src/api/weather-api.ts with fetchWeather() function. Fetches from Open-Meteo API, validates response with zod schema, normalises to WeatherData type. Uses getWeatherDescription() for WMO code mapping. Handles missing hourly data gracefully (returns null for feelsLikeC/humidity). Returns null on any error with console.warn logging.

### How It Was Tested

Ran `npx vitest run tests/api/weather-api.test.ts` - all 4 tests pass: (1) returns WeatherData on success with correct data, (2) returns null on HTTP 500, (3) returns null on Zod parse failure, (4) returns WeatherData with null hourly fields when hourly is missing.
