import type { DailyBrief } from '../types/brief';

const MAX_SUMMARY_LENGTH = 280;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function truncateSummary(summary: string): string {
  if (summary.length <= MAX_SUMMARY_LENGTH) {
    return summary;
  }
  const truncated = summary.slice(0, MAX_SUMMARY_LENGTH);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace === -1) {
    return truncated + '…';
  }
  return truncated.slice(0, lastSpace) + '…';
}

export function renderToHtml(brief: DailyBrief): string {
  const weatherSection = brief.weather
    ? `<div class="weather-line">${brief.weather.lat}°, ${brief.weather.lon}°: <span class="data-val">${brief.weather.tempC}°C</span>, feels like <span class="data-val">${brief.weather.feelsLikeC ?? 'N/A'}°C</span> | ${escapeHtml(brief.weather.description)}</div><div class="weather-line">Humidity: <span class="data-val">${brief.weather.humidity ?? 'N/A'}%</span> | Wind: <span class="data-val">${brief.weather.windSpeedKmh} km/h</span></div>`
    : '<p class="unavailable">⚠ Unavailable</p>';

  const storiesHtml = brief.hnStories.length > 0
    ? brief.hnStories
        .map(
          (story, i) =>
            `<li><span class="story-rank">${i + 1}.</span> <a href="${escapeHtml(story.url ?? '#')}">${escapeHtml(story.title)}</a> <span class="meta">(${escapeHtml(story.author)} — <span class="data-val">${story.points}</span> pts)</span></li>`
        )
        .join('')
    : '<p class="unavailable">⚠ Unavailable</p>';

  const ghHtml = brief.ghNotifications.length > 0
    ? brief.ghNotifications
        .map(
          (n) =>
            `<li><span class="gh-type">[${escapeHtml(n.type)}]</span> <span class="gh-repo">${escapeHtml(n.repo)}</span> — ${escapeHtml(n.title)} — <a href="${escapeHtml(n.humanUrl)}">${escapeHtml(n.humanUrl)}</a></li>`
        )
        .join('')
    : '<p class="unavailable">⚠ Unavailable</p>';

  let wikiHtml: string;
  if (brief.wikiArticle) {
    const thumbImg = brief.wikiArticle.thumbnailUrl
      ? `<img src="${escapeHtml(brief.wikiArticle.thumbnailUrl)}" alt="${escapeHtml(brief.wikiArticle.title)}" class="wiki-thumb">`
      : '';
    const truncatedSummary = truncateSummary(brief.wikiArticle.summary);
    wikiHtml = `<h3><a href="${escapeHtml(brief.wikiArticle.url)}">${escapeHtml(brief.wikiArticle.title)}</a></h3>${thumbImg}<p>${escapeHtml(truncatedSummary)}</p>`;
  } else {
    wikiHtml = '<p class="unavailable">⚠ Unavailable</p>';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Brief — ${escapeHtml(brief.generatedAt)}</title>
  <style>
    :root {
      --bg: #0d1117;
      --surface: #161b22;
      --surface-code: #1c2128;
      --border: #30363d;
      --border-subtle: #21262d;
      --text: #e6edf3;
      --text-muted: #8b949e;
      --accent: #f0883e;
      --link: #58a6ff;
      --success: #3fb950;
      --warning: #d29922;
      --error: #f85149;
    }

    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

    body {
      background: #0d1117;
      color: var(--text);
      font-family: 'Source Serif 4', Georgia, serif;
      max-width: 660px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.65;
    }

    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--link);
      margin-top: 0;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }

    h2 {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--accent);
      margin-top: 0;
      margin-bottom: 0.75rem;
      line-height: 1.2;
    }

    h3 {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }

    h3 a {
      color: var(--link);
      text-decoration: none;
    }

    .section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent);
      border-radius: 6px;
      padding: 1.25rem;
      margin: 1rem 0;
    }

    .section h2 {
      margin-top: 0;
      margin-bottom: 0.75rem;
    }

    a {
      color: var(--link);
      text-decoration: none;
    }

    .unavailable {
      color: var(--warning);
      font-style: italic;
    }

    time {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .masthead {
      border-bottom: 1px solid var(--border);
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }

    .weather-line {
      margin: 0.5rem 0;
    }

    .data-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      color: var(--text);
      background: var(--surface-code);
      padding: 1px 5px;
      border-radius: 3px;
    }

    .meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .story-list {
      list-style: none;
      padding: 0;
    }

    .story-list li {
      padding: 0.375rem 0;
      border-bottom: 1px solid var(--border-subtle);
    }

    .story-list .story-rank {
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
      display: inline-block;
      width: 1.5rem;
    }

    .gh-list {
      list-style: none;
      padding: 0;
    }

    .gh-list li {
      padding: 0.375rem 0;
      border-bottom: 1px solid var(--border-subtle);
    }

    .gh-type {
      font-family: 'JetBrains Mono', monospace;
      background: var(--surface-code);
      color: var(--text-muted);
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 0.75rem;
    }

    .gh-repo {
      color: var(--success);
    }

    .wiki-block {
      overflow: hidden;
    }

    .wiki-thumb {
      float: right;
      margin: 0 0 0.5rem 1rem;
      max-width: 120px;
      border-radius: 4px;
      border: 1px solid var(--border);
    }

    .wiki-block p {
      font-style: italic;
      line-height: 1.7;
    }
  </style>
</head>
<body>
  <div class="masthead">
    <h1>📰 Daily Brief</h1>
    <time>${escapeHtml(brief.generatedAt)}</time>
  </div>

  <div class="section" id="weather">
    <h2>🌤 Weather</h2>
    ${weatherSection}
  </div>

  <div class="section" id="hn-stories">
    <h2>📰 Top HN Stories</h2>
    <ol class="story-list">${storiesHtml}</ol>
  </div>

  <div class="section" id="github">
    <h2>🔔 GitHub Notifications</h2>
    <ul class="gh-list">${ghHtml}</ul>
  </div>

  <div class="section" id="wikipedia">
    <h2>📖 Wikipedia</h2>
    <div class="wiki-block">${wikiHtml}</div>
  </div>
</body>
</html>`;
}
