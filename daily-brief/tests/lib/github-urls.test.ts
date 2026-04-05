import { describe, it, expect } from 'vitest';
import { normaliseGitHubUrl } from '../../src/lib/github-urls';

describe('lib/github-urls', () => {
  it('PR API URL converts to browser URL', () => {
    const result = normaliseGitHubUrl(
      'https://api.github.com/repos/owner/repo/pulls/42',
      'PullRequest',
      'https://github.com/owner/repo'
    );
    expect(result).toBe('https://github.com/owner/repo/pull/42');
  });

  it('Issue API URL converts to browser URL', () => {
    const result = normaliseGitHubUrl(
      'https://api.github.com/repos/owner/repo/issues/7',
      'Issue',
      'https://github.com/owner/repo'
    );
    expect(result).toBe('https://github.com/owner/repo/issues/7');
  });

  it('unknown type returns repoUrl', () => {
    const result = normaliseGitHubUrl(
      'https://api.github.com/repos/owner/repo/releases/1',
      'Release',
      'https://github.com/owner/repo'
    );
    expect(result).toBe('https://github.com/owner/repo');
  });

  it('null apiUrl returns repoUrl', () => {
    const result = normaliseGitHubUrl(null, 'PullRequest', 'https://github.com/owner/repo');
    expect(result).toBe('https://github.com/owner/repo');
  });
});
