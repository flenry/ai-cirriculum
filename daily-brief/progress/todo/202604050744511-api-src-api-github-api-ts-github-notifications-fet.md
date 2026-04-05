# Task: api: src/api/github-api.ts — GitHub notifications fetch + URL normalise

**Status:** todo
**Created:** 2026-04-05 15:44:51
**ID:** 202604050744511

---

## Description

Create `src/api/github-api.ts`. Export `fetchGHNotifications(token: string): Promise<GHNotification[]>`.

Exact implementation:
```ts
import { z } from 'zod';
import { normaliseGitHubUrl } from '../lib/github-urls';
import type { GHNotification } from '../types/brief';

const GitHubNotificationSchema = z.object({
  id: z.string(), reason: z.string(), unread: z.boolean(),
  subject: z.object({ title: z.string(), type: z.string(), url: z.string().nullable() }),
  repository: z.object({ full_name: z.string(), html_url: z.string() }),
  updated_at: z.string(),
});
const GitHubResponseSchema = z.array(GitHubNotificationSchema);

export async function fetchGHNotifications(token: string): Promise<GHNotification[]> {
  if (!token) {
    console.warn('[github] GITHUB_TOKEN not set — skipping notifications');
    return [];
  }
  try {
    const res = await fetch('https://api.github.com/notifications', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = GitHubResponseSchema.parse(await res.json());
    return data.map(n => ({
      id: n.id, reason: n.reason, unread: n.unread,
      title: n.subject.title, type: n.subject.type,
      repo: n.repository.full_name, repoUrl: n.repository.html_url,
      humanUrl: normaliseGitHubUrl(n.subject.url, n.subject.type, n.repository.html_url),
      updatedAt: n.updated_at,
    }));
  } catch (err) {
    console.warn('[github] Fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}
```

Test file: `tests/api/github-api.test.ts`
- Test: `'returns GHNotification[] on success'` — default handler returns GITHUB_FIXTURE (1 PR) — assert length 1, `result[0].humanUrl === 'https://github.com/owner/repo/pull/42'` (not API URL), `result[0].type === 'PullRequest'`
- Test: `'returns [] when token is empty string'` — `fetchGHNotifications('')` — assert `[]`, `console.warn` called
- Test: `'returns [] on 401 response'` — override with `{ status: 401 }` — assert `[]`, warn called
- Test: `'returns [] on Zod failure'` — override with bad shape — assert `[]`

## Expected Outcome

Test `api/github: returns GHNotification[] on success` passes. Test `api/github: returns [] when token is empty` passes. Test `api/github: humanUrl is browser URL not API URL` passes. File `src/api/github-api.ts` exports `fetchGHNotifications`.
