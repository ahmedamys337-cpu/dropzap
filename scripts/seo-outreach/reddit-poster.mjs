/**
 * Reddit Link/Article Poster  (DA 91)
 *
 * Posts DropZap guide articles to relevant subreddits via Reddit's OAuth API.
 * Reddit posts with genuine value drive high-DA dofollow backlinks and real traffic.
 *
 * Required env vars:
 *   REDDIT_CLIENT_ID      — From https://www.reddit.com/prefs/apps → script app → client_id
 *   REDDIT_CLIENT_SECRET  — client_secret from the same app
 *   REDDIT_USERNAME       — Your Reddit username (no r/ prefix)
 *   REDDIT_PASSWORD       — Your Reddit account password
 *
 * How to create a Reddit API app (one-time):
 *   1. Go to https://www.reddit.com/prefs/apps
 *   2. Click "Create App" → type: script
 *   3. Name: "DropZap SEO" — redirect: http://localhost
 *   4. Note the client_id (under "personal use script") and secret
 *
 * IMPORTANT — Reddit anti-spam rules:
 *   • Wait at least 10 minutes between posts to different subreddits.
 *   • Only post to subreddits that allow self-promo / tool links.
 *   • New accounts need karma before they can post to most subs.
 *   • Subreddits that ALLOW tool links: r/webtools, r/InternetIsBeautiful,
 *     r/UsefulWebsites, r/selfhosted, r/productivity.
 *   This script posts only to the "safe" list below by default.
 */

const USER_AGENT = "DropZap-SEO/1.0 (https://www.dropzap.digital)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Subreddits that explicitly allow useful web tool links.
// DO NOT add subreddits where self-promo is banned — it destroys the account.
const SAFE_SUBREDDITS = [
  { sub: "webtools", type: "link" },          // Specifically for web tools
  { sub: "InternetIsBeautiful", type: "link" }, // Cool websites, must be genuinely useful
  { sub: "UsefulWebsites", type: "link" },    // Useful websites, requires quality content
  { sub: "productivity", type: "self" },       // Self posts with how-to content work well
  { sub: "selfhosted", type: "self" },         // Tech-savvy audience appreciates yt-dlp tools
];

// Article topics mapped to the subreddit that fits best.
// These are the specific posts we'll submit — each one once.
const POST_QUEUE = [
  {
    subreddit: "webtools",
    title: "DropZap — free tool to download Instagram Reels, TikTok, Reddit (with audio), Twitter/X and more without watermarks",
    url: "https://www.dropzap.digital",
    type: "link",
    flair: null,
  },
  {
    subreddit: "UsefulWebsites",
    title: "DropZap.digital — Download TikTok without watermark, Instagram Reels, Reddit videos with audio, all on one site. Free, no signup.",
    url: "https://www.dropzap.digital",
    type: "link",
    flair: null,
  },
  {
    subreddit: "productivity",
    title: "How to quickly save social media videos for offline use (Instagram, TikTok, Reddit, Twitter) — step-by-step guide",
    selftext: `If you need to save videos from various platforms for offline viewing, presentations, or backups, here's a workflow that works across all of them:

**Instagram Reels & Posts**
Copy the share link → paste at [dropzap.digital/instagram-downloader](https://www.dropzap.digital/instagram-downloader) → tap Download. Works for single photos too. Carousels download as a ZIP.

**TikTok (no watermark)**
Tap Share → Copy Link in TikTok → paste at [dropzap.digital/tiktok-downloader](https://www.dropzap.digital/tiktok-downloader). The video saves without the TikTok logo.

**Reddit videos with audio**
Reddit stores video + audio as separate streams so the built-in "Save Video" gives you a silent file. Paste the post URL at [dropzap.digital/reddit-video-downloader](https://www.dropzap.digital/reddit-video-downloader) — it re-merges them automatically.

**Twitter / X**
Paste the tweet URL at [dropzap.digital/twitter-video-downloader](https://www.dropzap.digital/twitter-video-downloader).

All of these work in mobile Safari (iPhone → Files app) and Chrome (Android → Downloads folder). No app install, no signup, no limit.

Happy to answer specific-platform questions in the comments.`,
    type: "self",
    flair: null,
  },
];

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------
async function getRedditToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error(
      "Reddit: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD must all be set."
    );
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Reddit auth failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function submitPost(token, post, dryRun) {
  if (dryRun) {
    console.log(`[Reddit DRY RUN] r/${post.subreddit}: "${post.title}" (${post.type})`);
    return null;
  }

  const params = new URLSearchParams({
    api_type: "json",
    kind: post.type === "link" ? "link" : "self",
    sr: post.subreddit,
    title: post.title,
    resubmit: "false",
    nsfw: "false",
    spoiler: "false",
    sendreplies: "true",
  });

  if (post.type === "link") {
    params.set("url", post.url);
  } else {
    params.set("text", post.selftext || "");
  }

  if (post.flair) params.set("flair_text", post.flair);

  const res = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: params.toString(),
  });

  const data = await res.json();
  const errors = data?.json?.errors;
  const postUrl = data?.json?.data?.url;

  if (errors && errors.length > 0) {
    console.error(`❌ Reddit r/${post.subreddit} error: ${JSON.stringify(errors)}`);
    return null;
  }

  if (postUrl) {
    console.log(`✅ Reddit post live: ${postUrl}`);
    return postUrl;
  }

  console.error(`❌ Reddit unexpected response: ${JSON.stringify(data).slice(0, 300)}`);
  return null;
}

export async function runRedditPoster(dryRun = false) {
  if (
    !process.env.REDDIT_CLIENT_ID ||
    !process.env.REDDIT_CLIENT_SECRET ||
    !process.env.REDDIT_USERNAME ||
    !process.env.REDDIT_PASSWORD
  ) {
    console.log(
      "⚠️  Reddit poster skipped — credentials not set.\n" +
        "   Required: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD\n" +
        "   Create app at: https://www.reddit.com/prefs/apps"
    );
    return;
  }

  console.log(`\n🔴 Reddit — submitting ${POST_QUEUE.length} post(s)…`);

  let token;
  try {
    token = await getRedditToken();
  } catch (err) {
    console.error(`❌ Reddit auth failed: ${err.message}`);
    return;
  }

  for (const post of POST_QUEUE) {
    console.log(`\n▶ [reddit] r/${post.subreddit}: "${post.title.slice(0, 60)}…"`);
    await submitPost(token, post, dryRun);
    // Reddit requires 10 minutes between posts for new accounts; 
    // for established accounts 30s is fine in practice.
    if (!dryRun) await sleep(30000);
  }
}
