# Task: lib: src/lib/github-urls.ts — API URL to browser URL normalisation

**Status:** todo
**Created:** 2026-04-05 15:44:06
**ID:** 202604050744060

---

## Description

Create `src/lib/github-urls.ts`. Export `normaliseGitHubUrl(apiUrl, type, repoUrl)`.

Exact implementation:
```ts
export function normaliseGitHubUrl(
  apiUrl: string | null,
  type: string,
  repoUrl: string
): string {
  if (!apiUrl) return repoUrl;
  if (type === 'PullRequest') {
    return apiUrl
      .replace('https://api.github.com/repos/', 'https://github.com/')
      .replace('/pulls/', '/pull/');
  }
  if (type === 'Issue') {
    return apiUrl.replace('https://api.github.com/repos/', 'https://github.com/');
  }
  return repoUrl;
}
```

Test file: `tests/lib/github-urls.test.ts`
- PR: `normaliseGitHubUrl('https://api.github.com/repos/owner/repo/pulls/42', 'PullRequest', 'https://github.com/owner/repo')` → `'https://github.com/owner/repo/pull/42'`
- Issue: `normaliseGitHubUrl('https://api.github.com/repos/owner/repo/issues/7', 'Issue', 'https://github.com/owner/repo')` → `'https://github.com/owner/repo/issues/7'`
- Unknown type: `normaliseGitHubUrl('https://api.github.com/repos/owner/repo/releases/1', 'Release', 'https://github.com/owner/repo')` → `'https://github.com/owner/repo'`
- Null apiUrl: `normaliseGitHubUrl(null, 'PullRequest', 'https://github.com/owner/repo')` → `'https://github.com/owner/repo'`

## Expected Outcome

Test `lib/github-urls: PR API URL converts to browser URL` passes. Test `lib/github-urls: null apiUrl returns repoUrl` passes. File `src/lib/github-urls.ts` exports `normaliseGitHubUrl`.
