import { getGithubLastEdit } from 'fumadocs-core/content/github';

export type DocsGithubConfig = {
  owner: string;
  repo: string;
  /**
   * SHA or ref (branch/tag) to link against.
   *
   * Note: `fumadocs-ui` does NOT default this at runtime, so we always provide one.
   */
  sha: string;
  /**
   * GitHub API authorization header value.
   *
   * Examples:
   * - `Bearer <token>`
   * - `token <token>`
   */
  token?: string;
};

function normalizeAuthToken(token: string): string {
  const trimmed = token.trim();
  if (!trimmed) return '';
  // If it already looks like "Bearer …" / "token …" / etc, keep it.
  if (/\s/.test(trimmed)) return trimmed;
  return `Bearer ${trimmed}`;
}

export function getDocsGithubConfig(): DocsGithubConfig | null {
  const explicitOwner = process.env.DOCS_GITHUB_OWNER ?? process.env.GITHUB_OWNER;
  const explicitRepo = process.env.DOCS_GITHUB_REPO ?? process.env.GITHUB_REPO;

  let owner = explicitOwner;
  let repo = explicitRepo;

  // GitHub Actions provides this as "owner/repo"
  if ((!owner || !repo) && process.env.GITHUB_REPOSITORY) {
    const [o, r] = process.env.GITHUB_REPOSITORY.split('/');
    if (!owner) owner = o;
    if (!repo) repo = r;
  }

  // Vercel provides these
  if (
    (!owner || !repo) &&
    process.env.VERCEL_GIT_REPO_OWNER &&
    process.env.VERCEL_GIT_REPO_SLUG
  ) {
    if (!owner) owner = process.env.VERCEL_GIT_REPO_OWNER;
    if (!repo) repo = process.env.VERCEL_GIT_REPO_SLUG;
  }

  if (!owner || !repo) return null;

  const sha =
    process.env.DOCS_GITHUB_SHA ??
    process.env.DOCS_GITHUB_BRANCH ??
    process.env.GITHUB_REF_NAME ??
    process.env.GITHUB_HEAD_REF ??
    process.env.GITHUB_BRANCH ??
    process.env.VERCEL_GIT_COMMIT_REF ??
    process.env.CF_PAGES_BRANCH ??
    'main';

  const rawToken =
    process.env.DOCS_GITHUB_TOKEN ??
    process.env.GITHUB_TOKEN ??
    process.env.GIT_TOKEN;
  const token = rawToken ? normalizeAuthToken(rawToken) : undefined;

  return { owner, repo, sha, token };
}

export function getDocsRepoFilePath(pagePath: string): string {
  const clean = pagePath.replace(/^\/+/, '');
  return `content/docs/${clean}`;
}

let githubRateLimited = false;

export async function safeGetDocsGithubLastEditTime(
  config: DocsGithubConfig,
  repoFilePath: string,
): Promise<Date | null> {
  if (githubRateLimited) return null;

  // Default behavior: skip in dev to avoid hammering GitHub.
  // Enable with `DOCS_GITHUB_LAST_EDIT_IN_DEV=1` (or `true`).
  const dev = process.env.NODE_ENV === 'development';
  const devEnabled =
    process.env.DOCS_GITHUB_LAST_EDIT_IN_DEV === '1' ||
    process.env.DOCS_GITHUB_LAST_EDIT_IN_DEV === 'true';
  if (dev && !devEnabled) return null;

  try {
    return await getGithubLastEdit({
      owner: config.owner,
      repo: config.repo,
      sha: config.sha,
      token: config.token,
      path: repoFilePath,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes('rate limit')) githubRateLimited = true;
    return null;
  }
}

