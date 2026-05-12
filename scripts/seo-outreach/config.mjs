// SEO outreach automation config.
//
// All knobs the daily run reads from. Edit this file to change which
// keywords/subreddits get monitored, which competitors get tracked,
// and how the digest is delivered. Everything else (reddit-finder,
// quora-finder, brand-mentions, digest) is generic and reads from here.

export const BRAND = {
  name: "DropZap",
  // Variants to track as brand mentions (lowercase compared).
  variants: ["dropzap", "dropzap.digital", "dropzap downloader"],
  // Canonical site URL — used to detect whether a mention page already
  // links back to us.
  siteUrl: "https://www.dropzap.digital",
  domain: "dropzap.digital",
};

// ---------------------------------------------------------------------------
// Keywords we want to find people asking about. Each one drives both the
// Reddit search and the Quora search-URL generation.
//
// Rule of thumb: pick phrases real users type when stuck. Avoid head-term
// spam ("video downloader") — those threads attract too many spammers and
// our reply gets buried. Long-tail problem-statements convert best.
// ---------------------------------------------------------------------------
export const KEYWORDS = [
  // TikTok
  "tiktok no watermark",
  "tiktok downloader not working",
  "snaptik not working",
  "ssstik down",
  "save tiktok without watermark",
  "tiktok slideshow download",

  // Instagram
  "instagram reels download",
  "snapinsta not working",
  "save instagram reels iphone",
  "download instagram carousel",
  "instagram story download",

  // Facebook / Reddit / others
  "facebook video download",
  "reddit video with sound download",
  "twitter video download",
  "pinterest video download",

  // Generic problem statements
  "best video downloader website",
  "free video downloader no watermark",
];

// ---------------------------------------------------------------------------
// Subreddits worth searching. We hit /r/<sub>/search.json scoped to each
// sub for high-signal results, then a global Reddit search for breadth.
//
// Mods of /r/InstagramReels, /r/Tiktokhelp, /r/iphone etc. tolerate
// genuinely helpful answers that include a tool link. Don't add subs
// where self-promotion is banned (e.g. /r/Android has a strict no-promo
// rule — we'd just get the post nuked).
// ---------------------------------------------------------------------------
// Verified-existing subreddits as of May 2026. If a sub gets banned or
// goes private, the reddit-finder logs a 403/404 and skips it — no
// crash. Periodically replace dead ones.
export const SUBREDDITS = [
  "Instagram",
  "InstagramReels",
  "redditmobile",
  "iphone",
  "ios",
  "AndroidQuestions",
  "techsupport",
  "NoStupidQuestions",
  "software",
  "AskTechnology",
  "help",
  "tipofmytongue",
];

// Minimum thread engagement we care about. We want active discussions
// where our answer will actually be seen — zero-comment / zero-score
// posts disappear within hours regardless of how good our reply is.
export const MIN_REDDIT_SCORE = 2;
export const MIN_REDDIT_COMMENTS = 1;
// Only surface threads from the last N hours.
export const MAX_THREAD_AGE_HOURS = 48;

// Spam / off-topic / sketchy-content blocklist. We skip threads whose
// title contains any of these. Mostly catches:
//   - Hiring / job posts that happened to mention "video"
//   - Leaked/NSFW content threads (legal liability + Google quality flag)
//   - Bot-pinned megathreads
//   - Foreign-language threads where our English reply adds no value
// Tune as you see false positives in the daily digest.
export const TITLE_BLOCKLIST = [
  "hiring",
  "[hiring]",
  "looking for",
  "for hire",
  "[for hire]",
  "leak",
  "leaked",
  "nude",
  "nsfw",
  "onlyfans",
  "of leak",
  "automoderator",
  "megathread",
  "weekly thread",
  "daily thread",
  "selling",
  "buying",
  "for sale",
  "wts",
  "wtb",
];

// Author blocklist — bots that post low-quality content and we don't
// want to reply to. AutoModerator's stickied threads in particular
// match a lot of keywords but are never real questions.
export const AUTHOR_BLOCKLIST = ["automoderator", "[deleted]"];

// A thread "looks like a question" if it has a question mark in the
// title OR has substantial selftext (>= 50 chars, suggesting the OP
// wrote out a real problem statement). Posts that are just a link or
// a one-line statement rarely become useful threads to answer in.
export const REQUIRE_QUESTION_SHAPE = true;

// ---------------------------------------------------------------------------
// Brand-mention tracker config.
//
// Uses Google Programmable Search (Custom Search JSON API). Free tier
// is 100 queries/day, which is plenty for a once-a-day run.
//
// Setup steps (also in README):
// 1. https://programmablesearchengine.google.com/ → Create new search engine
//    → Search the entire web → copy the "cx" (search engine ID).
// 2. https://console.cloud.google.com/apis/credentials → Create API key
//    → restrict to "Custom Search API".
// 3. Set GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX as env vars (locally) or
//    GitHub Actions secrets (for the daily cron).
//
// If either env var is missing, the brand-mention module gracefully
// skips — the rest of the digest still runs.
// ---------------------------------------------------------------------------
export const GOOGLE_CSE = {
  apiKey: process.env.GOOGLE_CSE_API_KEY || "",
  cx: process.env.GOOGLE_CSE_CX || "",
  // Number of result pages to fetch per query (1 page = 10 results).
  // 3 pages × 3 brand variants = 9 queries/day, well under the 100/day
  // free quota.
  pagesPerQuery: 3,
};

// ---------------------------------------------------------------------------
// Email delivery (optional). If RESEND_API_KEY is set, the daily digest
// also gets emailed. Otherwise it's only written to seo-reports/.
//
// Resend free tier = 100 emails/day, 3000/month. Plenty for a daily
// report. Sign up at https://resend.com — no credit card needed.
// ---------------------------------------------------------------------------
export const EMAIL = {
  resendApiKey: process.env.RESEND_API_KEY || "",
  fromAddress: process.env.SEO_EMAIL_FROM || "onboarding@resend.dev",
  toAddress: process.env.SEO_EMAIL_TO || "",
};

// User-Agent for all outbound HTTP. Reddit's API specifically requires
// a descriptive UA; generic "node-fetch" gets rate-limited harder.
export const USER_AGENT =
  "DropZap-SEO-Outreach/1.0 (https://www.dropzap.digital; daily opportunity finder)";
