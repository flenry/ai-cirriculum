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

  // Task 1.1 — Truncation bug (failing — renderer has bug)
  it('truncates Wikipedia summary at word boundary within 280 chars', () => {
    const longSummary = 'a '.repeat(150).trim(); // 299 chars
    const briefWithLongWiki: DailyBrief = {
      ...fullBrief,
      wikiArticle: {
        ...fullBrief.wikiArticle!,
        summary: longSummary,
      },
    };

    const result = renderToHtml(briefWithLongWiki);
    expect(result).toContain('…');
    expect(result).not.toContain(longSummary);
    const truncatedMatch = result.match(/<p>(.*?)<\/p>/);
    expect(truncatedMatch).not.toBeNull();
    const paragraph = truncatedMatch![1];
    expect(paragraph.endsWith('…')).toBe(true);
    expect(paragraph[paragraph.length - 2]).not.toBe(' ');
  });

  // Task 1.2 — Short summary preserved (passing)
  it('preserves Wikipedia summary under 280 chars without truncation', () => {
    const shortSummary = 'Short summary under limit.';
    const briefWithShortWiki: DailyBrief = {
      ...fullBrief,
      wikiArticle: {
        ...fullBrief.wikiArticle!,
        summary: shortSummary,
      },
    };

    const result = renderToHtml(briefWithShortWiki);
    expect(result).toContain(shortSummary);
    expect(result).not.toContain('…');
  });

  // Task 1.3 — Word-boundary edge case (failing — renderer has bug)
  it('truncates at last word boundary before 280 chars not mid-word', () => {
    const edgeSummary = 'a'.repeat(275) + ' boundary extra'; // 291 chars
    const briefWithEdgeWiki: DailyBrief = {
      ...fullBrief,
      wikiArticle: {
        ...fullBrief.wikiArticle!,
        summary: edgeSummary,
      },
    };

    const result = renderToHtml(briefWithEdgeWiki);
    expect(result).toContain('a'.repeat(275) + '…');
    expect(result).not.toContain('boundary');
  });

  // Task 1.4 — Dark mode color (passing)
  it('output contains dark mode background color #0d1117', () => {
    const result = renderToHtml(fullBrief);
    expect(/background:\s*#0d1117/.test(result)).toBe(true);
  });

  // Task 1.5 — XSS escaping on GitHub fields (passing)
  it('escapes HTML in GitHub notification fields', () => {
    const xssGhBrief: DailyBrief = {
      ...fullBrief,
      ghNotifications: [
        {
          id: '1',
          reason: 'review_requested',
          unread: true,
          title: '<b>title</b>',
          type: 'PullRequest',
          repo: '<script>repo</script>',
          repoUrl: 'https://github.com/repo',
          humanUrl: 'https://github.com/x?a=<evil>',
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    const result = renderToHtml(xssGhBrief);
    expect(result).toContain('&lt;script&gt;');
    expect(result).toContain('&lt;b&gt;');
    expect(result).toContain('&lt;evil&gt;');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('<b>');
  });

  // Task 1.6 — GitHub notifications render with data (passing)
  it('renders GitHub notifications with repo and title', () => {
    const ghBrief: DailyBrief = {
      ...fullBrief,
      ghNotifications: [
        {
          id: '1',
          reason: 'mention',
          unread: true,
          title: 'Fix login bug',
          type: 'Issue',
          repo: 'owner/repo',
          repoUrl: 'https://github.com/owner/repo',
          humanUrl: 'https://github.com/owner/repo/issues/1',
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          reason: 'team_mention',
          unread: false,
          title: 'Add dark mode',
          type: 'PullRequest',
          repo: 'owner/other',
          repoUrl: 'https://github.com/owner/other',
          humanUrl: 'https://github.com/owner/other/pull/2',
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    const result = renderToHtml(ghBrief);
    expect(result).toContain('owner/repo');
    expect(result).toContain('Fix login bug');
    expect(result).toContain('owner/other');
    expect(result).toContain('Add dark mode');
    expect(result).not.toContain('⚠ Unavailable');
  });

  // Task 1.7 — charset + viewport meta (passing)
  it('output contains charset and viewport meta tags', () => {
    const result = renderToHtml(fullBrief);
    expect(result).toContain('<meta charset="UTF-8">');
    expect(/meta name="viewport"/.test(result)).toBe(true);
  });

  // Task 1.8 — feelsLikeC null renders N/A (passing)
  it('renders N/A when feelsLikeC is null', () => {
    const briefWithNullFeels: DailyBrief = {
      ...fullBrief,
      weather: {
        ...fullBrief.weather!,
        feelsLikeC: null,
      },
    };

    const result = renderToHtml(briefWithNullFeels);
    expect(result).toContain('N/A');
    expect(result).not.toContain('null');
    expect(result).not.toContain('undefined');
  });

  // Task 1.9 — thumbnailUrl renders img (failing — renderer has gap)
  it('renders Wikipedia thumbnail img when thumbnailUrl is set', () => {
    const briefWithThumb: DailyBrief = {
      ...fullBrief,
      wikiArticle: {
        ...fullBrief.wikiArticle!,
        thumbnailUrl: 'https://upload.wikimedia.org/thumb.jpg',
      },
    };

    const result = renderToHtml(briefWithThumb);
    expect(result).toContain('<img');
    expect(result).toContain('thumb.jpg');
  });

  // Task 1.10 — thumbnailUrl null renders no img (passing after Task 2.2)
  it('does not render img when thumbnailUrl is null', () => {
    const result = renderToHtml(fullBrief);
    const wikiSectionMatch = result.match(/<div[^>]*id="wikipedia"[\s\S]*?<\/div>/);
    if (wikiSectionMatch) {
      expect(wikiSectionMatch[0]).not.toContain('wiki-thumb');
      expect(wikiSectionMatch[0]).not.toMatch(/<img[\s>]/);
    }
  });
});
