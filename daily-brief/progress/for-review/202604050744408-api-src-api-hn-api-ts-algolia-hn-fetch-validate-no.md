# Task: api: src/api/hn-api.ts — Algolia HN fetch + validate + normalise

**Status:** for-review
**Created:** 2026-04-05 15:44:40
**ID:** 202604050744408

---

## Description

Create `src/api/hn-api.ts`. Export `fetchHNStories(): Promise<HNStory[]>`.

Exact implementation:
```ts
import { z } from 'zod';
import type { HNStory } from '../types/brief';

const HNHitSchema = z.object({
  objectID: z.string(), title: z.string(),
  url: z.string().url().nullable().optional(),
  points: z.number().nullable().optional(),
  num_comments: z.number().nullable().optional(),
  author: z.string(),
});
const HNResponseSchema = z.object({ hits: z.array(HNHitSchema) });

export async function fetchHNStories(): Promise<HNStory[]> {
  try {
    const res = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=10');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = HNResponseSchema.parse(await res.json());
    return data.hits.map(hit => ({
      id: hit.objectID, title: hit.title, url: hit.url ?? null,
      points: hit.points ?? 0, commentCount: hit.num_comments ?? 0, author: hit.author,
    }));
  } catch (err) {
    console.warn('[hn] Fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}
```

Test file: `tests/api/hn-api.test.ts`
- Test: `'returns HNStory[] on success'` — default handler returns HN_FIXTURE (1 story) — assert array length 1, `result[0].id === '1'`, `result[0].points === 100`
- Test: `'returns [] on HTTP 500'` — override handler with 500 — assert `[]` returned, `console.warn` called
- Test: `'normalises null url to null'` — fixture with `url: null` — assert `result[0].url === null`
- Test: `'normalises null points to 0'` — fixture with `points: null` — assert `result[0].points === 0`

## Expected Outcome

Test `api/hn: returns HNStory[] on success` passes. Test `api/hn: returns [] on HTTP 500` passes. File `src/api/hn-api.ts` exports `fetchHNStories`.

---

## Review

**Moved to Review:** 2026-04-05 16:03:30
**PR:** _(no PR — direct commit)_

### What Was Done

Created src/api/hn-api.ts with fetchHNStories() function. Fetches top 10 HN stories from Algolia API, validates with zod schema, normalises to HNStory[]. Handles null url/points/num_comments gracefully. Returns empty array on error with console.warn logging.

### How It Was Tested

Ran `npx vitest run tests/api/hn-api.test.ts` - all 4 tests pass: (1) returns HNStory[] on success, (2) returns [] on HTTP 500, (3) normalises null url to null, (4) normalises null points to 0.
