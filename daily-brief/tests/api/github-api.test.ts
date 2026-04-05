import { describe, it, expect, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';
import { fetchGHNotifications } from '../../src/api/github-api';

describe('api/github', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('returns GHNotification[] on success', async () => {
    const result = await fetchGHNotifications('test-token');
    expect(result).toHaveLength(1);
    expect(result[0].humanUrl).toBe('https://github.com/owner/repo/pull/42');
    expect(result[0].type).toBe('PullRequest');
  });

  it('returns [] when token is empty', async () => {
    console.warn = vi.fn();
    const result = await fetchGHNotifications('');
    expect(result).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });

  it('returns [] on 401 response', async () => {
    console.warn = vi.fn();
    server.use(
      http.get('https://api.github.com/notifications', () =>
        HttpResponse.json({}, { status: 401 })
      )
    );

    const result = await fetchGHNotifications('test-token');
    expect(result).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });

  it('returns [] on Zod failure', async () => {
    console.warn = vi.fn();
    server.use(
      http.get('https://api.github.com/notifications', () =>
        HttpResponse.json([{ bad: 'shape' }])
      )
    );

    const result = await fetchGHNotifications('test-token');
    expect(result).toEqual([]);
  });
});
