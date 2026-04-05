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
