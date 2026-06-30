/**
 * Tumblr Publisher  (DA 75)
 *
 * Posts articles to your Tumblr blog via the Tumblr v2 API (OAuth 1.0a).
 *
 * Required env vars:
 *   TUMBLR_BLOG_NAME          — Your blog name, e.g. "dropzap-media" (no .tumblr.com)
 *   TUMBLR_CONSUMER_KEY       — From https://www.tumblr.com/oauth/apps → Consumer Key
 *   TUMBLR_CONSUMER_SECRET    — From the same app page → Consumer Secret
 *   TUMBLR_ACCESS_TOKEN       — Your personal OAuth token
 *   TUMBLR_TOKEN_SECRET       — Your personal OAuth token secret
 *
 * How to get the access token (one-time setup):
 *   1. Go to https://www.tumblr.com/oauth/apps → Register new app
 *   2. Note Consumer Key + Consumer Secret
 *   3. Run the interactive authorize script:
 *        node scripts/seo-outreach/tumblr-auth.mjs
 *      (it will print the access_token + token_secret for you to copy into .env.local)
 *
 * Frontmatter field:
 *   platform: "tumblr"  OR  platforms: ["tumblr"]
 */

import crypto from "crypto";

const SITE_URL = "https://www.dropzap.digital";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// OAuth 1.0a signing helpers
// ---------------------------------------------------------------------------
function percentEncode(str) {
  return encodeURIComponent(String(str))
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

function buildOAuthHeader(method, url, bodyParams, consumerKey, consumerSecret, token, tokenSecret) {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: token,
    oauth_version: "1.0",
  };

  // Merge all params for signature base string
  const allParams = { ...oauthParams, ...bodyParams };
  const sortedKeys = Object.keys(allParams).sort();
  const paramString = sortedKeys
    .map((k) => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join("&");

  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString),
  ].join("&");

  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  const signature = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");

  oauthParams.oauth_signature = signature;

  const headerValue =
    "OAuth " +
    Object.keys(oauthParams)
      .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
      .join(", ");

  return headerValue;
}

// ---------------------------------------------------------------------------
// Publish
// ---------------------------------------------------------------------------
export async function publishToTumblr(article, dryRun = false) {
  const blogName = process.env.TUMBLR_BLOG_NAME;
  const consumerKey = process.env.TUMBLR_CONSUMER_KEY;
  const consumerSecret = process.env.TUMBLR_CONSUMER_SECRET;
  const accessToken = process.env.TUMBLR_ACCESS_TOKEN;
  const tokenSecret = process.env.TUMBLR_TOKEN_SECRET;

  if (!blogName || !consumerKey || !consumerSecret || !accessToken || !tokenSecret) {
    console.error(
      "❌ Tumblr: One or more env vars missing.\n" +
        "   Required: TUMBLR_BLOG_NAME, TUMBLR_CONSUMER_KEY, TUMBLR_CONSUMER_SECRET,\n" +
        "             TUMBLR_ACCESS_TOKEN, TUMBLR_TOKEN_SECRET\n" +
        "   See https://www.tumblr.com/oauth/apps to create an app."
    );
    return null;
  }

  const contentWithBacklink =
    article.body.trimEnd() +
    `\n\n---\n\nDownload free at **[DropZap](${SITE_URL})** — Instagram Reels, TikTok, Facebook, ` +
    `Twitter/X, Reddit, Pinterest & Threads. No watermark. No signup.\n`;

  const tags = Array.isArray(article.meta.tags)
    ? article.meta.tags
    : (article.meta.tags || "").split(",").map((t) => t.trim()).filter(Boolean);

  const apiUrl = `https://api.tumblr.com/v2/blog/${blogName}.tumblr.com/post`;

  const bodyParams = {
    type: "text",
    title: article.meta.title || "DropZap Download Guide",
    body: contentWithBacklink,
    tags: tags.join(","),
    state: "published",
    format: "markdown",
    native_inline_images: "true",
  };

  if (dryRun) {
    console.log(`[Tumblr DRY RUN] Would post: "${article.meta.title}" to ${blogName}.tumblr.com`);
    return null;
  }

  const authHeader = buildOAuthHeader(
    "POST",
    apiUrl,
    bodyParams,
    consumerKey,
    consumerSecret,
    accessToken,
    tokenSecret
  );

  const form = new URLSearchParams(bodyParams);

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const data = await res.json();

  if (res.ok && data.meta?.status === 201) {
    const postId = data.response?.id;
    const postUrl = `https://${blogName}.tumblr.com/post/${postId}`;
    console.log(`✅ Tumblr post created: ${postUrl}`);
    await sleep(5000);
    return postUrl;
  } else {
    console.error(`❌ Tumblr failed (${res.status}): ${JSON.stringify(data).slice(0, 300)}`);
    return null;
  }
}

export async function publishAllTumblr(articles, dryRun = false) {
  const targets = articles.filter((a) => {
    const p = a.meta.platform;
    const ps = a.meta.platforms;
    return p === "tumblr" || (Array.isArray(ps) && ps.includes("tumblr"));
  });

  if (targets.length === 0) {
    console.log("ℹ️  No articles targeting Tumblr.");
    return;
  }

  console.log(`\n🌀 Tumblr — publishing ${targets.length} article(s)…`);
  for (const article of targets) {
    console.log(`\n▶ [tumblr] ${article.meta.title}`);
    await publishToTumblr(article, dryRun);
  }
}
