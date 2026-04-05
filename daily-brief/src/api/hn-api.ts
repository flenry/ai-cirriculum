import { z } from 'zod';
import type { HNStory } from '../types/brief';

const HNHitSchema = z.object({
  objectID: z.string(),
  title: z.string(),
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
      id: hit.objectID,
      title: hit.title,
      url: hit.url ?? null,
      points: hit.points ?? 0,
      commentCount: hit.num_comments ?? 0,
      author: hit.author,
    }));
  } catch (err) {
    console.warn('[hn] Fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}
