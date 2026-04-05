import { z } from 'zod';
import type { WikiArticle } from '../types/brief';

const WikipediaSchema = z.object({
  title: z.string(),
  extract: z.string(),
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
