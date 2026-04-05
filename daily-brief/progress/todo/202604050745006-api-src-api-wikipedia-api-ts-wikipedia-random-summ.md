# Task: api: src/api/wikipedia-api.ts — Wikipedia random summary + truncation

**Status:** todo
**Created:** 2026-04-05 15:45:00
**ID:** 202604050745006

---

## Description

Create `src/api/wikipedia-api.ts`. Export `fetchWikiArticle(): Promise<WikiArticle | null>`.

Exact implementation:
```ts
import { z } from 'zod';
import type { WikiArticle } from '../types/brief';

const WikipediaSchema = z.object({
  title: z.string(), extract: z.string(),
  content_urls: z.object({ desktop: z.object({ page: z.string() }) }),
  thumbnail: z.object({ source: z.string() }).optional(),
});

function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
}

export async function fetchWikiArticle(): Promise<WikiArticle | null> {
  try {
    const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = WikipediaSchema.parse(await res.json());
    return {
      title: data.title,
      summary: truncateAtWord(data.extract, 280),
      url: data.content_urls.desktop.page,
      thumbnailUrl: data.thumbnail?.source ?? null,
    };
  } catch (err) {
    console.warn('[wikipedia] Fetch failed:', err instanceof Error ? err.message : err);
    return null;
  }
}
```

Test file: `tests/api/wikipedia-api.test.ts`
- Test: `'returns WikiArticle on success'` — default handler returns WIKIPEDIA_FIXTURE — assert `result.title === 'Test Article'`, `result.thumbnailUrl === null`
- Test: `'does not truncate extract under 280 chars'` — fixture with 50-char extract — assert `result.summary === extract` (unchanged)
- Test: `'truncates extract at word boundary'` — fixture with extract = `'word '.repeat(60)` (300 chars) — assert `result.summary.length <= 280`, `result.summary` does not end mid-word (ends with a space or complete word)
- Test: `'returns null on HTTP 500'` — override with 500 — assert null, warn called
- Test: `'thumbnailUrl is null when thumbnail absent'` — fixture without thumbnail field — assert `result.thumbnailUrl === null`

## Expected Outcome

Test `api/wikipedia: returns WikiArticle on success` passes. Test `api/wikipedia: truncates extract at word boundary` passes. Test `api/wikipedia: does not truncate extract under 280 chars` passes. File `src/api/wikipedia-api.ts` exports `fetchWikiArticle`.
