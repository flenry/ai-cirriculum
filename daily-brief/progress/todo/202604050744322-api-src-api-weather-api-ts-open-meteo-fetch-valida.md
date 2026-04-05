# Task: api: src/api/weather-api.ts — Open-Meteo fetch + validate + normalise

**Status:** todo
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
