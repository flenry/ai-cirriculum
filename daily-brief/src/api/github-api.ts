import { z } from 'zod';
import { normaliseGitHubUrl } from '../lib/github-urls';
import type { GHNotification } from '../types/brief';

const GitHubNotificationSchema = z.object({
  id: z.string(),
  reason: z.string(),
  unread: z.boolean(),
  subject: z.object({
    title: z.string(),
    type: z.string(),
    url: z.string().nullable(),
  }),
  repository: z.object({
    full_name: z.string(),
    html_url: z.string(),
  }),
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
      id: n.id,
      reason: n.reason,
      unread: n.unread,
      title: n.subject.title,
      type: n.subject.type,
      repo: n.repository.full_name,
      repoUrl: n.repository.html_url,
      humanUrl: normaliseGitHubUrl(n.subject.url, n.subject.type, n.repository.html_url),
      updatedAt: n.updated_at,
    }));
  } catch (err) {
    console.warn('[github] Fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}
