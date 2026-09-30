const API_BASE = 'https://api.github.com';

interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  html_url: string;
  labels: { name: string }[];
}

export function getGitHubConfig() {
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('wedcraft_github_token');
    const localRepo = localStorage.getItem('wedcraft_github_repo');
    return {
      token: (localToken || process.env.NEXT_PUBLIC_GITHUB_TOKEN || '').trim(),
      repo: (localRepo || process.env.NEXT_PUBLIC_GITHUB_REPO || 'princeidrisi24-code/supportgeneiAi').trim(),
    };
  }
  return {
    token: (process.env.NEXT_PUBLIC_GITHUB_TOKEN || '').trim(),
    repo: (process.env.NEXT_PUBLIC_GITHUB_REPO || 'princeidrisi24-code/supportgeneiAi').trim(),
  };
}

function getHeaders() {
  const { token } = getGitHubConfig();
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

export async function createIssue(
  title: string,
  body: string,
  labels: string[] = []
): Promise<GitHubIssue | null> {
  const { token, repo } = getGitHubConfig();
  if (!token || !repo) {
    console.warn('GitHub integration not configured. Set GitHub token in Settings or .env.local.');
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/repos/${repo}/issues`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        title,
        body,
        labels: ['wedding-task', ...labels],
      }),
    });

    if (!res.ok) {
      console.error('GitHub API error:', res.status, await res.text());
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('GitHub API request failed:', err);
    return null;
  }
}

export async function closeIssue(issueNumber: number): Promise<boolean> {
  const { token, repo } = getGitHubConfig();
  if (!token || !repo) return false;

  try {
    const res = await fetch(
      `${API_BASE}/repos/${repo}/issues/${issueNumber}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ state: 'closed' }),
      }
    );

    return res.ok;
  } catch (err) {
    console.error('Failed to close GitHub issue:', err);
    return false;
  }
}

export async function reopenIssue(issueNumber: number): Promise<boolean> {
  const { token, repo } = getGitHubConfig();
  if (!token || !repo) return false;

  try {
    const res = await fetch(
      `${API_BASE}/repos/${repo}/issues/${issueNumber}`,
      {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ state: 'open' }),
      }
    );

    return res.ok;
  } catch (err) {
    console.error('Failed to reopen GitHub issue:', err);
    return false;
  }
}

export function isGitHubConfigured(): boolean {
  const { token, repo } = getGitHubConfig();
  return Boolean(token && repo);
}
