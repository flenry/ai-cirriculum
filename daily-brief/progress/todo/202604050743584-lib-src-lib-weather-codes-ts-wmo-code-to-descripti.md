# Task: lib: src/lib/weather-codes.ts — WMO code to description map

**Status:** todo
**Created:** 2026-04-05 15:43:58
**ID:** 202604050743584

---

## Description

Create `src/lib/weather-codes.ts`. Export a lookup map and a getter function.

Exact implementation (copy-paste):
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

IMPORTANT: Use `??` not `||` — code `0` is valid and falsy.

Test file: `tests/lib/weather-codes.test.ts`
- `it('returns description for code 0')` — `expect(getWeatherDescription(0)).toBe('Clear sky')`
- `it('returns description for code 61')` — `expect(getWeatherDescription(61)).toBe('Slight rain')`
- `it('returns unknown for unmapped code 999')` — `expect(getWeatherDescription(999)).toBe('Unknown (code: 999)')`
- `it('returns unknown for code 100')` — `expect(getWeatherDescription(100)).toBe('Unknown (code: 100)')`

## Expected Outcome

Test `lib/weather-codes: returns description for code 0` passes. Test `lib/weather-codes: returns unknown for unmapped code 999` passes. File `src/lib/weather-codes.ts` exports `getWeatherDescription` and `WEATHER_CODES`.
