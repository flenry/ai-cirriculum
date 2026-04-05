import { describe, it, expect, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';
import { fetchHNStories } from '../../src/api/hn-api';

describe('api/hn', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('returns HNStory[] on success', async () => {
    const result = await fetchHNStories();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].points).toBe(100);
  });

  it('returns [] on HTTP 500', async () => {
    console.warn = vi.fn();
    server.use(
      http.get('https://hn.algolia.com/api/v1/search', () =>
        HttpResponse.json({}, { status: 500 })
      )
    );

    const result = await fetchHNStories();
    expect(result).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });

  it('normalises null url to null', async () => {
    server.use(
      http.get('https://hn.algolia.com/api/v1/search', () =>
        HttpResponse.json({
          hits: [
            { objectID: '1', title: 'Test', url: null, points: 10, num_comments: 5, author: 'user' },
          ],
        })
      )
    );

    const result = await fetchHNStories();
    expect(result[0].url).toBeNull();
  });

  it('normalises null points to 0', async () => {
    server.use(
      http.get('https://hn.algolia.com/api/v1/search', () =>
        HttpResponse.json({
          hits: [
            { objectID: '1', title: 'Test', url: 'https://example.com', points: null, num_comments: 5, author: 'user' },
          ],
        })
      )
    );

    const result = await fetchHNStories();
    expect(result[0].points).toBe(0);
  });
});
