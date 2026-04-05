## Decided
- **Weather API**: Open-Meteo API is the best choice (free, no API key required, simple JSON response).
- **HN API**: Official Firebase Hacker News API (`https://hacker-news.firebaseio.com/v0/topstories.json`) is the standard and free.
- **GitHub Notifications**: GitHub REST API (`GET /notifications`) using a Personal Access Token (PAT).
- **Wikipedia**: MediaWiki Action API (`https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=1`) to get a random article.
- **Database**: SQLite with Drizzle ORM is ideal for lightweight, local storage of historical briefs.
- **Output formats**: Chalk for terminal output, simple inline CSS for HTML email.

## Rejected
- **OpenWeatherMap**: Requires an API key and registration, adding friction compared to Open-Meteo.
- **GraphQL for GitHub**: Overkill for just fetching notifications, REST is simpler.
- **Complex UI framework**: Unnecessary for a simple static HTML email/report.

## Open
- Should the weather location be specified by city name or exact coordinates?
- Where should the HTML output be saved by default?
- When exactly should the database pruning (keeping only 30 days) occur (before or after generating the new brief)?

## Output
### Verified Endpoints
- **Weather**: `GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true`
- **HN Top**: `GET https://hacker-news.firebaseio.com/v0/topstories.json` (returns array of IDs)
- **HN Item**: `GET https://hacker-news.firebaseio.com/v0/item/{id}.json` (returns article details)
- **GitHub**: `GET https://api.github.com/notifications` (Headers: `Authorization: Bearer {token}`, `Accept: application/vnd.github.v3+json`)
- **Wikipedia**: `GET https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=1`

### Data Shapes
- **Weather**: `{ "current_weather": { "temperature": 15.0, "windspeed": 10.0, "weathercode": 1 } }`
- **HN Item**: `{ "title": "...", "url": "...", "score": 100, "by": "user" }`
- **GitHub Notification**: `[{ "id": "...", "reason": "...", "subject": { "title": "...", "url": "..." } }]`
- **Wikipedia Random**: `{ "query": { "random": [{ "id": 123, "title": "..." }] } }`
