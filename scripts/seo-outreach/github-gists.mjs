/**
 * GitHub Gist Publisher  (DA 96)
 *
 * Creates a public GitHub Gist for each article that targets "github".
 * Gists are indexed by Google, appear in GitHub search, and provide a
 * high-authority backlink to dropzap.digital.
 *
 * Required env var:
 *   GITHUB_GIST_TOKEN — Personal Access Token with the "gist" scope.
 *   Create at: https://github.com/settings/tokens/new
 *   → Select scope: gist
 *
 * Frontmatter field to target this publisher:
 *   platforms: ["github"]
 *   OR
 *   platform: "github"
 */

const SITE_URL = "https://www.dropzap.digital";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Publish a single article as a GitHub Gist.
 * @param {{ meta: object, body: string, file: string }} article
 * @param {boolean} dryRun
 */
export async function publishToGitHubGist(article, dryRun = false) {
  const token = process.env.GITHUB_GIST_TOKEN;
  if (!token) {
    console.error(
      "❌ GitHub Gist: GITHUB_GIST_TOKEN not set.\n" +
        "   Create a Personal Access Token with the 'gist' scope at:\n" +
        "   https://github.com/settings/tokens/new"
    );
    return null;
  }

  // Build the filename from the article title (slug format)
  const slug = (article.meta.title || "dropzap-article")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  // Append a footer with a canonical backlink so every gist points home
  const contentWithBacklink =
    article.body.trimEnd() +
    `\n\n---\n\n> **Download free** at [DropZap](${SITE_URL}) — ` +
    `Instagram Reels, TikTok, Facebook, Twitter/X, Reddit, Pinterest & Threads.\n`;

  if (dryRun) {
    console.log(`[GitHub Gist DRY RUN] Would create gist: "${article.meta.title}" → ${slug}.md`);
    return null;
  }

  const payload = {
    description: article.meta.title || "DropZap Download Guide",
    public: true,
    files: {
      [`${slug}.md`]: { content: contentWithBacklink },
    },
  };

  const res = await fetch("https://api.github.com/gists", {
    method: "POST",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "DropZap-SEO/1.0",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (res.ok) {
    console.log(`✅ GitHub Gist created: ${data.html_url}`);
    await sleep(3000); // polite delay between gists
    return data.html_url;
  } else {
    console.error(`❌ GitHub Gist failed (${res.status}): ${JSON.stringify(data).slice(0, 200)}`);
    return null;
  }
}

/**
 * Publish ALL articles in the provided list that target "github".
 * @param {Array} articles - parsed articles array from loadArticles()
 * @param {boolean} dryRun
 */
export async function publishAllGists(articles, dryRun = false) {
  const targets = articles.filter((a) => {
    const p = a.meta.platform;
    const ps = a.meta.platforms;
    return p === "github" || (Array.isArray(ps) && ps.includes("github"));
  });

  if (targets.length === 0) {
    console.log("ℹ️  No articles targeting GitHub Gists. Add platform: \"github\" to frontmatter.");
    return;
  }

  console.log(`\n📌 GitHub Gists — publishing ${targets.length} article(s)…`);
  for (const article of targets) {
    console.log(`\n▶ [github] ${article.meta.title}`);
    await publishToGitHubGist(article, dryRun);
  }
}
