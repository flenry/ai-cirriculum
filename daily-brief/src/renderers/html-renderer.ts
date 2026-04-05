import type { DailyBrief } from '../types/brief';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderToHtml(brief: DailyBrief): string {
  const weatherSection = brief.weather
    ? `<p>${brief.weather.lat}°, ${brief.weather.lon}°: ${brief.weather.tempC}°C, feels like ${brief.weather.feelsLikeC ?? 'N/A'}°C | ${escapeHtml(brief.weather.description)}</p><p>Humidity: ${brief.weather.humidity ?? 'N/A'}% | Wind: ${brief.weather.windSpeedKmh} km/h</p>`
    : '<p class="unavailable">⚠ Unavailable</p>';

  const storiesHtml = brief.hnStories.length > 0
    ? brief.hnStories
        .map(
          (story, i) =>
            `<li>${i + 1}. ${escapeHtml(story.title)} (${story.author}) — ${story.points} pts — <a href="${escapeHtml(story.url ?? '#')}">${escapeHtml(story.url ?? 'N/A')}</a></li>`
        )
        .join('')
    : '<p class="unavailable">⚠ Unavailable</p>';

  const ghHtml = brief.ghNotifications.length > 0
    ? brief.ghNotifications
        .map(
          (n) =>
            `<li><strong>[${escapeHtml(n.type)}]</strong> ${escapeHtml(n.repo)} — ${escapeHtml(n.title)} — <a href="${escapeHtml(n.humanUrl)}">${escapeHtml(n.humanUrl)}</a></li>`
        )
        .join('')
    : '<p class="unavailable">⚠ Unavailable</p>';

  const wikiHtml = brief.wikiArticle
    ? `<h3><a href="${escapeHtml(brief.wikiArticle.url)}">${escapeHtml(brief.wikiArticle.title)}</a></h3><p>${escapeHtml(brief.wikiArticle.summary)}</p>`
    : '<p class="unavailable">⚠ Unavailable</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Brief — ${escapeHtml(brief.generatedAt)}</title>
  <style>
    body { background: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; padding: 2rem; }
    h1 { color: #58a6ff; }
    .section { background: #161b22; border-radius: 6px; padding: 1rem; margin: 1rem 0; }
    .section h2 { color: #f0883e; margin-top: 0; }
    a { color: #58a6ff; }
    .unavailable { color: #6e7681; font-style: italic; }
    time { color: #6e7681; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>📰 Daily Brief</h1>
  <time>${escapeHtml(brief.generatedAt)}</time>

  <div class="section" id="weather">
    <h2>🌤 Weather</h2>
    ${weatherSection}
  </div>

  <div class="section" id="hn-stories">
    <h2>📰 Top HN Stories</h2>
    <ol>${storiesHtml}</ol>
  </div>

  <div class="section" id="github">
    <h2>🔔 GitHub Notifications</h2>
    <ul>${ghHtml}</ul>
  </div>

  <div class="section" id="wikipedia">
    <h2>📖 Wikipedia</h2>
    ${wikiHtml}
  </div>
</body>
</html>`;
}
