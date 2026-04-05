import { describe, it, expect, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';
import { fetchWeather } from '../../src/api/weather-api';

describe('api/weather', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('returns WeatherData on success', async () => {
    const result = await fetchWeather('51.5074', '-0.1278');
    expect(result).not.toBeNull();
    expect(result!.tempC).toBe(15);
    expect(result!.description).toBe('Clear sky');
    expect(result!.feelsLikeC).toBe(13);
  });

  it('returns null on HTTP 500', async () => {
    console.warn = vi.fn();
    server.use(
      http.get('https://api.open-meteo.com/v1/forecast', () =>
        HttpResponse.json({}, { status: 500 })
      )
    );

    const result = await fetchWeather('51.5074', '-0.1278');
    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });

  it('returns null on Zod parse failure', async () => {
    console.warn = vi.fn();
    server.use(
      http.get('https://api.open-meteo.com/v1/forecast', () =>
        HttpResponse.json({ latitude: 'bad' })
      )
    );

    const result = await fetchWeather('51.5074', '-0.1278');
    expect(result).toBeNull();
  });

  it('returns WeatherData with null hourly fields when hourly is missing', async () => {
    server.use(
      http.get('https://api.open-meteo.com/v1/forecast', () =>
        HttpResponse.json({
          latitude: 51.5,
          longitude: -0.1,
          current_weather: { temperature: 15, windspeed: 14, weathercode: 0, is_day: 1 },
        })
      )
    );

    const result = await fetchWeather('51.5074', '-0.1278');
    expect(result).not.toBeNull();
    expect(result!.feelsLikeC).toBeNull();
    expect(result!.humidity).toBeNull();
  });
});
