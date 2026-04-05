import { describe, it, expect, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';
import { generateBrief } from '../../src/services/brief-service';
import type { Config } from '../../src/config';

describe('services/brief', () => {
  const mockConfig: Config = {
    weatherLat: '51.5',
    weatherLon: '-0.1',
    githubToken: 'test-token',
    cronSchedule: '0 7 * * *',
    htmlOutputPath: './output/brief.html',
    dbPath: ':memory:',
  };

  afterEach(() => {
    server.resetHandlers();
  });

  it('assembles full brief on success', async () => {
    console.warn = vi.fn();
    const brief = await generateBrief(mockConfig);

    expect(brief.weather).not.toBeNull();
    expect(brief.hnStories).toHaveLength(1);
    expect(brief.ghNotifications).toHaveLength(1);
    expect(brief.wikiArticle).not.toBeNull();
    expect(brief.status.weather.ok).toBe(true);
    expect(brief.status.hn.ok).toBe(true);
    expect(brief.status.github.ok).toBe(true);
    expect(brief.status.wikipedia.ok).toBe(true);
  });

  it('weather section null when API fails', async () => {
    console.warn = vi.fn();
    server.use(
      http.get('https://api.open-meteo.com/v1/forecast', () =>
        HttpResponse.json({}, { status: 500 })
      )
    );

    const brief = await generateBrief(mockConfig);
    expect(brief.weather).toBeNull();
    expect(brief.status.weather.ok).toBe(false);
    expect(brief.hnStories).toHaveLength(1);
  });

  it('all sections fail gracefully', async () => {
    console.warn = vi.fn();
    server.use(
      http.get('https://api.open-meteo.com/v1/forecast', () =>
        HttpResponse.json({}, { status: 500 })
      ),
      http.get('https://hn.algolia.com/api/v1/search', () =>
        HttpResponse.json({}, { status: 500 })
      ),
      http.get('https://api.github.com/notifications', () =>
        HttpResponse.json({}, { status: 500 })
      ),
      http.get('https://en.wikipedia.org/api/rest_v1/page/random/summary', () =>
        HttpResponse.json({}, { status: 500 })
      )
    );

    const brief = await generateBrief(mockConfig);
    expect(brief.weather).toBeNull();
    expect(brief.hnStories).toEqual([]);
    expect(brief.ghNotifications).toEqual([]);
    expect(brief.wikiArticle).toBeNull();
    expect(typeof brief.generatedAt).toBe('string');
  });
});
