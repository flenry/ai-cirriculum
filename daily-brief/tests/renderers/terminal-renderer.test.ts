import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToTerminal } from '../../src/renderers/terminal-renderer';
import type { DailyBrief } from '../../src/types/brief';

describe('renderers/terminal', () => {
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
    hnStories: [
      { id: '1', title: 'Story 1', url: 'https://example.com', points: 100, commentCount: 42, author: 'user1' },
      { id: '2', title: 'Story 2', url: 'https://example.com', points: 90, commentCount: 30, author: 'user2' },
      { id: '3', title: 'Story 3', url: 'https://example.com', points: 80, commentCount: 20, author: 'user3' },
      { id: '4', title: 'Story 4', url: 'https://example.com', points: 70, commentCount: 15, author: 'user4' },
      { id: '5', title: 'Story 5', url: 'https://example.com', points: 60, commentCount: 10, author: 'user5' },
      { id: '6', title: 'Story 6', url: 'https://example.com', points: 50, commentCount: 5, author: 'user6' },
    ],
    ghNotifications: [
      {
        id: '1',
        reason: 'mention',
        unread: true,
        title: 'Test PR',
        type: 'PullRequest',
        repo: 'owner/repo',
        repoUrl: 'https://github.com/owner/repo',
        humanUrl: 'https://github.com/owner/repo/pull/42',
        updatedAt: new Date().toISOString(),
      },
    ],
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

  let logSpy: any;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('renders full brief without throwing', () => {
    expect(() => renderToTerminal(fullBrief)).not.toThrow();
    expect(logSpy).toHaveBeenCalled();
  });

  it('renders null weather with unavailable notice', () => {
    renderToTerminal(partialBrief);
    const logged = logSpy.mock.calls.map((call: any[]) => call.join(' '));
    expect(logged.some((s: string) => s.includes('unavailable') || s.includes('Unavailable'))).toBe(true);
  });

  it('shows only top 5 HN stories', () => {
    renderToTerminal(fullBrief);
    const logged = logSpy.mock.calls.map((call: any[]) => call.join(' ')).join(' ');
    expect(logged).toContain('Story 5');
    expect(logged).not.toContain('Story 6');
  });
});
