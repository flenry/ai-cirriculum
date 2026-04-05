import { describe, it, expect, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';
import { fetchWikiArticle } from '../../src/api/wikipedia-api';

describe('api/wikipedia', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('returns WikiArticle on success', async () => {
    const result = await fetchWikiArticle();
    expect(result).not.toBeNull();
    expect(result!.title).toBe('Test Article');
    expect(result!.thumbnailUrl).toBeNull();
  });

  it('does not truncate extract under 280 chars', async () => {
    server.use(
      http.get('https://en.wikipedia.org/api/rest_v1/page/random/summary', () =>
        HttpResponse.json({
          title: 'Test',
          extract: 'This is a short extract.',
          content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Test' } },
        })
      )
    );

    const result = await fetchWikiArticle();
    expect(result!.summary).toBe('This is a short extract.');
  });

  it('truncates extract at word boundary', async () => {
    const longExtract = 'word '.repeat(60); // 300 chars
    server.use(
      http.get('https://en.wikipedia.org/api/rest_v1/page/random/summary', () =>
        HttpResponse.json({
          title: 'Test',
          extract: longExtract,
          content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Test' } },
        })
      )
    );

    const result = await fetchWikiArticle();
    expect(result!.summary.length).toBeLessThanOrEqual(280);
    // Since input is "word word ...", result should end with "word" (complete word)
    expect(result!.summary).toMatch(/word$/);
  });

  it('returns null on HTTP 500', async () => {
    console.warn = vi.fn();
    server.use(
      http.get('https://en.wikipedia.org/api/rest_v1/page/random/summary', () =>
        HttpResponse.json({}, { status: 500 })
      )
    );

    const result = await fetchWikiArticle();
    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });

  it('thumbnailUrl is null when thumbnail absent', async () => {
    const result = await fetchWikiArticle();
    expect(result!.thumbnailUrl).toBeNull();
  });
});
