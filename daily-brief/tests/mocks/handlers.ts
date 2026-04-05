import { http, HttpResponse } from 'msw';

export const OPEN_METEO_FIXTURE = {
  latitude: 51.5,
  longitude: -0.1,
  current_weather: { temperature: 15, windspeed: 14, weathercode: 0, is_day: 1 },
  hourly: { relativehumidity_2m: [60], apparent_temperature: [13] },
};

export const HN_FIXTURE = {
  hits: [
    {
      objectID: '1',
      title: 'Test Story',
      url: 'https://example.com',
      points: 100,
      num_comments: 42,
      author: 'testuser',
    },
  ],
};

export const GITHUB_FIXTURE = [
  {
    id: '1',
    reason: 'mention',
    unread: true,
    subject: {
      title: 'Test PR',
      type: 'PullRequest',
      url: 'https://api.github.com/repos/owner/repo/pulls/42',
    },
    repository: { full_name: 'owner/repo', html_url: 'https://github.com/owner/repo' },
    updated_at: '2026-04-05T07:00:00Z',
  },
];

export const WIKIPEDIA_FIXTURE = {
  title: 'Test Article',
  extract: 'This is a test extract that is short enough.',
  content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Test_Article' } },
};

export const handlers = [
  http.get('https://api.open-meteo.com/v1/forecast', () =>
    HttpResponse.json(OPEN_METEO_FIXTURE)
  ),
  http.get('https://hn.algolia.com/api/v1/search', () =>
    HttpResponse.json(HN_FIXTURE)
  ),
  http.get('https://api.github.com/notifications', () =>
    HttpResponse.json(GITHUB_FIXTURE)
  ),
  http.get('https://en.wikipedia.org/api/rest_v1/page/random/summary', () =>
    HttpResponse.json(WIKIPEDIA_FIXTURE)
  ),
];
