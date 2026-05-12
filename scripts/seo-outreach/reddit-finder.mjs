// Reddit opportunity finder.
//
// Hits Reddit's public JSON API (no auth, no OAuth required for read).
// For each keyword:
//   1. Searches the global Reddit corpus
//   2. Searches each whitelisted subreddit specifically
// then dedupes by post permalink and filters by recency + engagement.
//
// Reddit's JSON API just appends `.json` to any URL. Search endpoint:
//   https://www.reddit.com/search.json?q=...&sort=new&t=day&limit=25
// Subreddit-scoped search:
//   https://www.reddit.com/r/<sub>/search.json?q=...&restrict_sr=1&sort=new&t=week&limit=25
//
// Rate limit: 60 req/min for unauthenticated. We make ~30/run, well within.

import {
  KEYWORDS,
  SUBREDDITS,
  MIN_REDDIT_SCORE,
  MIN_REDDIT_COMMENTS,
  MAX_THREAD_AGE_HOURS,
  TITLE_BLOCKLIST,
  AUTHOR_BLOCKLIST,
  REQUIRE_QUESTION_SHAPE,
  USER_AGENT,
} from "./config.mjs";
import { pickTemplate } from "./templates.mjs";

// We hit `old.reddit.com` instead of `www.reddit.com` because old's
// JSON endpoint has much more lenient unauth rate limits in 2024+.
// www.reddit.com aggressively pushes unauth callers toward OAuth and
// will 429 after just a few requests; old.reddit.com tolerates the
// ~30 requests/run we make. Same JSON shape, same data.
const REDDIT_BASE = "https://old.reddit.com";

// Throttle between requests. 1.2s × 30 reqs ≈ 36s of throttling,
// keeping us comfortably under any per-minute limits.
const THROTTLE_MS = 1200;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Single retry on 429 with exponential backoff. If we still get 429
// after a 30s wait, we give up on that query and move on — the daily
// run shouldn't hang for one slow keyword.
async function fetchReddit(url, attempt = 1) {
  await sleep(THROTTLE_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (res.status === 429 && attempt < 3) {
      const wait = 5000 * attempt;
      console.warn(`[reddit] 429 — waiting ${wait}ms then retrying (${attempt}/2)`);
      await sleep(wait);
      return fetchReddit(url, attempt + 1);
    }
    if (!res.ok) {
      console.warn(`[reddit] ${res.status} for ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[reddit] fetch failed for ${url}: ${err.message}`);
    return null;
  }
}

// Normalises a Reddit post object into the shape the digest expects.
function shapePost(child) {
  const p = child.data;
  return {
    title: p.title,
    subreddit: p.subreddit_name_prefixed, // e.g. "r/TikTokhelp"
    author: `u/${p.author}`,
    // Always emit www.reddit.com URLs in the report regardless of which
    // host we fetched from. The operator clicks these in a browser and
    // www is the canonical URL Reddit redirects to anyway.
    url: `https://www.reddit.com${p.permalink}`,
    score: p.score,
    numComments: p.num_comments,
    createdUtc: p.created_utc,
    ageHours: (Date.now() / 1000 - p.created_utc) / 3600,
    selftext: (p.selftext || "").slice(0, 280), // preview only
    flair: p.link_flair_text || null,
  };
}

function isRecent(post) {
  return post.ageHours <= MAX_THREAD_AGE_HOURS;
}

function passesEngagementFilter(post) {
  return post.score >= MIN_REDDIT_SCORE && post.numComments >= MIN_REDDIT_COMMENTS;
}

// Skip threads that already have a "Solved" / "Answered" flair — our
// reply adds no value there.
function isUnresolved(post) {
  if (!post.flair) return true;
  const f = post.flair.toLowerCase();
  return !(f.includes("solved") || f.includes("answered") || f.includes("closed"));
}

// Drop spam/NSFW/hiring/megathread titles before they pollute the digest.
function passesContentFilter(post) {
  const t = (post.title || "").toLowerCase();
  for (const bad of TITLE_BLOCKLIST) {
    if (t.includes(bad)) return false;
  }
  const author = post.author.replace(/^u\//, "").toLowerCase();
  if (AUTHOR_BLOCKLIST.includes(author)) return false;
  return true;
}

// "Looks like a real question" gate. The signal: question mark in title
// OR substantial selftext. Filters out announcements, news links, and
// drive-by image posts that match a keyword by coincidence.
function looksLikeQuestion(post) {
  if (!REQUIRE_QUESTION_SHAPE) return true;
  if (post.title.includes("?")) return true;
  if ((post.selftext || "").length >= 50) return true;
  // Title openers that strongly imply a question even without "?"
  const t = post.title.toLowerCase();
  const questionStarters = [
    "how ",
    "how-to",
    "how to",
    "why ",
    "what ",
    "where ",
    "which ",
    "is there",
    "anyone ",
    "best way",
    "help ",
    "help with",
    "can i ",
    "can someone",
    "does anyone",
    "looking ",
    "trying ",
    "need ",
    "stuck ",
    "not working",
  ];
  return questionStarters.some((q) => t.startsWith(q) || t.includes(` ${q}`));
}

// Defence in depth: even though we use quoted exact-phrase search,
// Reddit's relevance ranking sometimes returns marginal matches. We
// drop anything where the exact phrase doesn't appear in the title
// or selftext. This is the single highest-impact filter — went from
// 200 noisy results to ~5-15 high-quality ones in testing.
function isRelevant(post, keyword) {
  const haystack = `${post.title} ${post.selftext || ""}`.toLowerCase();
  return haystack.includes(keyword.toLowerCase());
}

export async function findRedditOpportunities() {
  const seen = new Set();
  const results = [];

  for (const keyword of KEYWORDS) {
    // Wrap the keyword in quotes so Reddit treats it as an exact
    // phrase. Without quotes, Reddit's search splits on whitespace and
    // matches posts where the words appear scattered throughout the
    // body, which produces enormous noise (a post about Dave Ramsey
    // saving for retirement would match "save tiktok").
    const q = encodeURIComponent(`"${keyword}"`);

    // 1. Global Reddit search — broad reach, picks up subs we haven't
    //    explicitly listed. Constrained to last week's posts via t=week.
    const globalUrl = `${REDDIT_BASE}/search.json?q=${q}&sort=new&t=week&limit=25`;
    const globalJson = await fetchReddit(globalUrl);
    if (globalJson?.data?.children) {
      for (const c of globalJson.data.children) {
        const post = shapePost(c);
        if (seen.has(post.url)) continue;
        if (!isRecent(post)) continue;
        if (!passesEngagementFilter(post)) continue;
        if (!isUnresolved(post)) continue;
        if (!passesContentFilter(post)) continue;
        if (!looksLikeQuestion(post)) continue;
        if (!isRelevant(post, keyword)) continue;
        seen.add(post.url);
        results.push({ ...post, keyword, source: "global" });
      }
    }

    // 2. Per-subreddit search — higher-signal subs we know are friendly
    //    to genuinely-helpful tool mentions. We only do this for the
    //    first 6 keywords to stay well under the rate limit.
    if (KEYWORDS.indexOf(keyword) < 6) {
      for (const sub of SUBREDDITS.slice(0, 6)) {
        const subUrl = `${REDDIT_BASE}/r/${sub}/search.json?q=${q}&restrict_sr=1&sort=new&t=week&limit=10`;
        const subJson = await fetchReddit(subUrl);
        if (!subJson?.data?.children) continue;
        for (const c of subJson.data.children) {
          const post = shapePost(c);
          if (seen.has(post.url)) continue;
          if (!isRecent(post)) continue;
          if (!passesEngagementFilter(post)) continue;
          if (!isUnresolved(post)) continue;
          if (!passesContentFilter(post)) continue;
          if (!looksLikeQuestion(post)) continue;
          if (!isRelevant(post, keyword)) continue;
          seen.add(post.url);
          results.push({ ...post, keyword, source: `r/${sub}` });
        }
      }
    }
  }

  // Sort: newest first, then highest engagement. Operator should
  // answer the freshest threads first since older ones drift off the
  // sub front page within hours.
  results.sort((a, b) => b.createdUtc - a.createdUtc);

  // Attach a suggested template draft to each.
  return results.map((r) => ({
    ...r,
    template: pickTemplate(r.title),
  }));
}
