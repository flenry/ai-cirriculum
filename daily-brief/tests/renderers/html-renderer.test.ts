import { describe, it, expect } from 'vitest';
import { renderToHtml } from '../../src/renderers/html-renderer';
import type { DailyBrief } from '../../src/types/brief';

describe('renderers/html', () => {
  const fullBrief: DailyBrief = {
    generatedAt: new Date().toISOString(),
    weather: {
      lat: 51.5,
      lon: -0.1,
      tempC: 15,
      feelsLikeC: 13,
      humidity: 60,
      description: 'Clear sky',
      windSpeedKmh: 14,
      isDay: true,
    },
    hnStories: Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Story ${i + 1}`,
      url: 'https://example.com',
      points: 100 - i * 10,
      commentCount: 42 - i,
      author: `user${i + 1}`,
    })),
    ghNotifications: [],
    wikiArticle: {
      title: 'Test Article',
      summary: 'This is a test.',
      url: 'https://en.wikipedia.org/wiki/Test',
      thumbnailUrl: null,
    },
    status: {
      weather: { ok: true },
      hn: { ok: true },
      github: { ok: true },
      wikipedia: { ok: true },
    },
  };

  const partialBrief: DailyBrief = {
    ...fullBrief,
    weather: null,
    status: {
      ...fullBrief.status,
      weather: { ok: false },
    },
  };

  it('returns valid HTML string', () => {
    const result = renderToHtml(fullBrief);
    expect(result.startsWith('<!DOCTYPE html>')).toBe(true);
  });

  it('null sections render unavailable notice', () => {
    const result = renderToHtml(partialBrief);
    expect(result).toContain('⚠ Unavailable');
  });

  it('escapes HTML in story titles', () => {
    const xssBrief: DailyBrief = {
      ...fullBrief,
      hnStories: [
        {
          id: '1',
          title: '<script>alert(1)</script>',
          url: 'https://example.com',
          points: 100,
          commentCount: 42,
          author: 'user',
        },
      ],
    };

    const result = renderToHtml(xssBrief);
    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>');
  });

  it('renders all 10 HN stories', () => {
    const result = renderToHtml(fullBrief);
    expect(result).toContain('Story 10');
  });

  it('renders section even when null', () => {
    const emptyBrief: DailyBrief = {
      generatedAt: new Date().toISOString(),
      weather: null,
      hnStories: [],
      ghNotifications: [],
      wikiArticle: null,
      status: {
        weather: { ok: false },
        hn: { ok: false },
        github: { ok: false },
        wikipedia: { ok: false },
      },
    };

    const result = renderToHtml(emptyBrief);
    expect(result).toContain('id="weather"');
    expect(result).toContain('id="hn-stories"');
    expect(result).toContain('id="github"');
    expect(result).toContain('id="wikipedia"');
  });
});
