// Programmatic SEO: hand-curated long-tail landing pages.
//
// Why this file is small (~30 pages, not 200):
//   Google's "Discovered – currently not indexed" classifier penalizes
//   sites that ship hundreds of templated pages with near-identical body
//   text. We previously had 194 such pages and only 3 indexed. To fix
//   that we (a) trimmed each platform to its 5–6 strongest commercial-
//   intent keywords and (b) diversified the body generator so each slug
//   produces a genuinely different page (different intro, different
//   section ordering, platform-specific tip, slug-specific FAQ).
//
// YouTube is intentionally absent: /youtube-downloader currently 308s to
// /, so any /download/youtube-* page would CTA into a redirect — Google
// reads that as a dead end and de-indexes the whole cluster. Restore
// these once YouTube downloads work again.
//
// Each page is built statically at build time via generateStaticParams
// in @/app/download/[slug]/page.tsx, so adding/removing slugs is free at
// runtime — only the build manifest changes.

export interface ProgrammaticPage {
  slug: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  platform: string;
  platformSlug: string;
  body: string;
}

interface Variant {
  slug: string;
  keyword: string;
  /** Optional explicit quality tier (e.g. "1080p", "HD") used in the body. */
  quality?: string;
  /** Optional device focus (e.g. "iPhone", "Android") used in the body. */
  device?: string;
  /** Free-form differentiator paragraph for "X-alternative" style slugs. */
  extra?: string;
}

interface Template {
  pattern: string;
  platform: string;
  platformSlug: string;
  variants: Variant[];
}

// =============================================================================
// Trimmed variant list — 5–6 best per platform, ~30 total.
// Picked for: highest commercial intent + lowest competing volume + still
// a real DropZap feature. Removed all "X-2026", generic "free X downloader",
// and most device-specific permutations because they all rendered as the
// same templated page and tanked indexability.
// =============================================================================
const templates: Template[] = [
  {
    pattern: "tiktok",
    platform: "TikTok",
    platformSlug: "/tiktok-downloader",
    variants: [
      { slug: "tiktok-downloader-no-watermark", keyword: "TikTok downloader no watermark" },
      { slug: "tiktok-to-mp4", keyword: "TikTok to MP4" },
      { slug: "tiktok-to-mp3", keyword: "TikTok to MP3" },
      { slug: "tiktok-slideshow-downloader", keyword: "TikTok slideshow downloader" },
      { slug: "tiktok-photo-downloader", keyword: "TikTok photo downloader", extra: "TikTok's photo-mode slideshows live at a different API endpoint than regular videos — many tools fail silently on them. DropZap detects the photo-mode URL pattern and returns every slide as a single ZIP file at original resolution." },
      { slug: "snaptik-alternative", keyword: "SnapTik alternative", extra: "DropZap is a SnapTik alternative without forced redirects, fake CAPTCHAs, or the second-page interstitial that other tools use to inflate ad impressions." },
      { slug: "ssstik-alternative", keyword: "ssstik alternative", extra: "DropZap is a captcha-free ssstik alternative. ssstik increasingly shows reCAPTCHA challenges that our server-side fetch architecture avoids entirely." },
      { slug: "tiktok-hd-no-watermark", keyword: "TikTok HD no watermark", quality: "HD" },
      { slug: "tiktok-1080p-downloader", keyword: "TikTok 1080p downloader", quality: "1080p" },
    ],
  },
  {
    pattern: "instagram",
    platform: "Instagram",
    platformSlug: "/instagram-downloader",
    variants: [
      { slug: "instagram-reels-downloader", keyword: "Instagram Reels downloader" },
      { slug: "instagram-photo-downloader", keyword: "Instagram photo downloader" },
      { slug: "instagram-carousel-downloader", keyword: "Instagram carousel downloader" },
      { slug: "instagram-story-downloader", keyword: "Instagram Story downloader", extra: "Instagram Stories expire after 24 hours and aren't directly downloadable from the official app for posts other than your own. DropZap handles public-account Story URLs by hitting the same CDN endpoint Instagram's web client uses, returning the MP4 or JPG before it expires." },
      { slug: "instagram-video-downloader", keyword: "Instagram video downloader" },
      { slug: "instagram-igtv-downloader", keyword: "Instagram IGTV downloader" },
      { slug: "instagram-profile-picture-downloader", keyword: "Instagram profile picture downloader", extra: "Profile pictures on Instagram are stored at low resolution in the public profile view (150px), but the original is available at up to 320px on the CDN. DropZap fetches the original full-size version." },
      { slug: "snapinsta-alternative", keyword: "SnapInsta alternative", extra: "DropZap is a SnapInsta alternative that doesn't break every time Instagram rotates its private GraphQL endpoints — we ship updates the same week IG changes their API." },
      { slug: "instagram-1080p-downloader", keyword: "Instagram 1080p downloader", quality: "1080p" },
      { slug: "instagram-reels-mp4", keyword: "Instagram Reels MP4" },
    ],
  },
  {
    pattern: "twitter",
    platform: "Twitter/X",
    platformSlug: "/twitter-video-downloader",
    variants: [
      { slug: "twitter-video-downloader-online", keyword: "Twitter video downloader online" },
      { slug: "x-video-downloader", keyword: "X video downloader" },
      { slug: "twitter-gif-downloader", keyword: "Twitter GIF downloader" },
      { slug: "twitter-to-mp4", keyword: "Twitter to MP4" },
      { slug: "ssstwitter-alternative", keyword: "ssstwitter alternative", extra: "DropZap is a ssstwitter alternative that resolves the highest-bitrate variant rather than the 360p fallback most extractors fall back to when the X CDN throttles." },
      { slug: "twitter-1080p-downloader", keyword: "Twitter 1080p downloader", quality: "1080p" },
    ],
  },
  {
    pattern: "facebook",
    platform: "Facebook",
    platformSlug: "/facebook-video-downloader",
    variants: [
      { slug: "facebook-video-downloader-hd", keyword: "Facebook video downloader HD", quality: "HD" },
      { slug: "facebook-reels-downloader", keyword: "Facebook Reels downloader" },
      { slug: "facebook-watch-downloader", keyword: "Facebook Watch downloader" },
      { slug: "fb-video-downloader", keyword: "FB video downloader" },
      { slug: "fbdown-alternative", keyword: "FBDown alternative", extra: "DropZap is an FBDown alternative that handles the new Meta video player URLs (post-2024 GraphQL) — most older tools still scrape the deprecated mobile mirror and silently fail." },
      { slug: "facebook-page-video-downloader", keyword: "Facebook page video downloader" },
    ],
  },
  {
    pattern: "reddit",
    platform: "Reddit",
    platformSlug: "/reddit-video-downloader",
    variants: [
      { slug: "reddit-video-downloader-with-sound", keyword: "Reddit video downloader with sound" },
      { slug: "reddit-gif-downloader", keyword: "Reddit GIF downloader" },
      { slug: "redditsave-alternative", keyword: "RedditSave alternative", extra: "DropZap is a RedditSave alternative that always merges the separate audio track Reddit splits out — no more silent downloads when the post has its own DASH audio stream." },
      { slug: "v-redd-it-downloader", keyword: "v.redd.it downloader" },
      { slug: "reddit-audio-extractor", keyword: "Reddit audio extractor" },
      { slug: "reddit-cross-post-downloader", keyword: "Reddit cross-post downloader" },
    ],
  },
];

// =============================================================================
// Diversified body generator
//
// Goal: every slug yields measurably different markup so Google's near-
// duplicate detector treats them as distinct pages. We achieve this with:
//
//   1. Deterministic slug-hash → picks one of N intros, one of N section
//      orderings, one of N CTA blurbs.
//   2. Platform-specific tip block (real technical detail unique to each
//      platform — watermark logic, audio merging, etc).
//   3. Slug-specific FAQ pulled from a per-platform FAQ pool, with the
//      keyword swapped in so each page asks subtly different questions.
//   4. Variant-specific paragraphs (quality / device / extra) injected
//      at slug-hash-determined positions.
//
// Determinism matters: build output must be stable across deploys, so we
// use a simple sum-of-char-codes hash rather than Math.random().
// =============================================================================

function slugHash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

const platformTips: Record<string, string[]> = {
  TikTok: [
    `<p>TikTok serves two parallel video URLs for every clip: a watermarked one (used by their share button) and a clean one (used by their CDN cache). DropZap resolves the clean variant directly so the file you save has no logo overlay or trailing username crawl.</p>`,
    `<p>Most "no-watermark" tools just re-encode the watermarked file with a black border crop, which loses ~12% of the original frame. DropZap pulls the source MP4 from TikTok's <code>video_aweme</code> response, so what you download is bit-identical to what TikTok stores internally.</p>`,
    `<p>For slideshow posts (multiple still images with a music track), TikTok stores each image as a separate JPEG plus the audio as an isolated MP3. DropZap zips all slides + the audio together so you can rebuild the slideshow offline.</p>`,
  ],
  Instagram: [
    `<p>Instagram's web app lazily resolves carousel slides — the first slide is in the initial HTML but slides 2–10 only load when you swipe. DropZap calls the same <code>/api/v1/media/{id}/info/</code> endpoint Instagram itself uses, so every slide in the carousel is resolved in a single request.</p>`,
    `<p>Reels and Posts share a media format internally but live behind different rate limits. DropZap routes Reels through the mobile API path and Posts through the GraphQL one, which avoids the "rate limit exceeded" wall that hits other tools when you download more than 3–4 items in a row.</p>`,
    `<p>IGTV videos can be up to 60 minutes long and are encoded in segments (5–10 second .ts chunks behind a manifest). DropZap stitches the manifest server-side and delivers a single MP4 — no more broken playback in QuickTime or VLC.</p>`,
  ],
  "Twitter/X": [
    `<p>X serves video as adaptive HLS — there's no single "the MP4". DropZap parses the playlist and selects the highest-bitrate variant your post actually has (X often caps lower than the requested 1080p). The result is the best variant available, not a guessed default.</p>`,
    `<p>Twitter GIFs are MP4 files internally (looped, no audio). DropZap exposes them as either .mp4 or true animated .gif on request — true GIF being useful for Slack / Discord embeds that won't autoplay MP4.</p>`,
    `<p>Twitter Spaces and live videos use a separate Periscope-derived backend with rotating shard URLs. DropZap resolves the active shard at request time so the link you paste right now produces a valid download even minutes after the live ends.</p>`,
  ],
  Facebook: [
    `<p>Facebook splits video and audio into separate DASH streams behind a heavily-obfuscated GraphQL response. DropZap's extractor keys off the <code>browser_native_hd_url</code> + <code>playable_url_dash</code> fields rather than the deprecated <code>video_url</code> field most older tools still scrape.</p>`,
    `<p>For Watch and Reels, Facebook embeds the highest-quality URL only when the request comes from an authenticated session. DropZap forwards your stored cookies to FB's CDN so HD/1080p actually returns 1080p instead of silently downgrading to 480p.</p>`,
    `<p>Page videos (vs personal-profile videos) live behind a different permission check — the same <code>/watch/?v=</code> URL behaves differently depending on which actor type owns the post. DropZap normalizes both into the same response shape so users don't see "private video" errors for posts that are actually public.</p>`,
  ],
  Reddit: [
    `<p>Reddit videos hosted on v.redd.it are DASH-segmented with audio in a parallel stream. Tools that grab only <code>fallback_url</code> get silent video — DropZap probes <code>DASH_AUDIO_128.mp4</code>, <code>HLS_AUDIO_128.mp4</code>, and the legacy <code>audio</code> fallback in that order, then merges with ffmpeg server-side.</p>`,
    `<p>For cross-posts, the video lives on the original subreddit's <code>media</code> field, not the cross-post itself. DropZap walks <code>crosspost_parent_list</code> when present so a v.redd.it URL pasted from an x-post resolves to the actual file.</p>`,
    `<p>Reddit GIFs are usually MP4 internally but i.redd.it hosts a few thousand truly animated GIFs from before the v.redd.it migration. DropZap detects the host and returns the appropriate file format without forcing a re-encode.</p>`,
  ],
};

const introTemplates: ((kw: string, p: string) => string)[] = [
  (kw, p) => `<p>If you've been hunting for a working <strong>${kw}</strong>, DropZap is the path of least resistance: paste a link, get a file, no account, no captcha, no 30-second countdown ad. Every download is processed on our servers and streamed straight back to you — nothing is stored, nothing is shared.</p>`,
  (kw, p) => `<p><strong>${kw}</strong> sounds like a solved problem until the tool you used last week is broken or behind a paywall. DropZap is a free, browser-based ${p} extractor that's actively maintained — when ${p} ships an API change, we ship an update the same week.</p>`,
  (kw, p) => `<p>DropZap is a <strong>${kw}</strong> built for one job and built well: pull the actual source media from ${p} without watermarks, without re-encoding, and without making you install anything. Works in every modern browser.</p>`,
  (kw, p) => `<p>Need a quick <strong>${kw}</strong> that doesn't require an app, a sign-up, or a credit card? DropZap lives at a single URL, runs entirely in your browser tab, and finishes most downloads in under ten seconds.</p>`,
];

const ctaTemplates: ((kw: string, p: string, ps: string) => string)[] = [
  (kw, p, ps) => `<h2>Three steps</h2>
<ol>
<li>Open ${p} in another tab and copy the post / video URL.</li>
<li>Paste it into <a href="${ps}">DropZap's ${p} downloader</a>.</li>
<li>Click <strong>Download</strong>. The file lands in your default download folder.</li>
</ol>`,
  (kw, p, ps) => `<h2>How to use this ${kw}</h2>
<ol>
<li>From ${p}, hit the share button and copy the link (or copy the URL straight from the address bar on desktop).</li>
<li>Open the <a href="${ps}">DropZap ${p} tool</a> and paste the URL into the input.</li>
<li>Press <strong>Download</strong> — DropZap resolves the source media and pushes it to your browser.</li>
</ol>`,
  (kw, p, ps) => `<h2>Workflow</h2>
<p>Copy the ${p} URL → paste it into <a href="${ps}">${ps}</a> → click Download. That's the entire interaction. There's no account creation step, no email confirmation, and no upgrade prompt halfway through.</p>`,
];

const whyBlocks: ((kw: string) => string)[] = [
  (kw) => `<h2>Why DropZap over the alternatives</h2>
<ul>
<li><strong>No watermark, no re-encode</strong> — what you download is bit-identical to what the platform serves its own client.</li>
<li><strong>No login, no email</strong> — the tool is genuinely free, not "free with required signup".</li>
<li><strong>No bait pop-ups</strong> — one ad block, never an interstitial, never a download timer.</li>
<li><strong>Works on mobile</strong> — the same UI scales to iPhone Safari and Android Chrome with no app install.</li>
<li><strong>Active maintenance</strong> — when platforms break their public extractors, we patch within days, not months.</li>
</ul>`,
  (kw) => `<h2>What makes this different</h2>
<p>Every other ${kw} you'll find is one of three things: an ad-stuffed mirror that scrapes the same broken endpoint, a Chrome extension that wants invasive permissions, or a desktop app that hasn't shipped an update since 2022. DropZap is a single-purpose web tool that resolves source media directly, ships frequent updates, and never asks you to install anything.</p>
<p>Concretely:</p>
<ul>
<li>No popunder ads or fake "click here to download" buttons.</li>
<li>No registration wall after 3 downloads.</li>
<li>No silent quality downgrades to maximize ad-revenue-per-byte.</li>
<li>No data harvesting — we don't keep request logs beyond rate-limit windows.</li>
</ul>`,
];

function buildFaq(kw: string, platform: string, platformSlug: string, hash: number): string {
  // Each platform has 6 candidate Q/As; we deterministically pick 3 based
  // on the slug hash so different pages emphasize different angles.
  const pool: Record<string, [string, string][]> = {
    TikTok: [
      [`Does the ${kw} actually remove the TikTok watermark?`, `Yes. We pull from TikTok's clean CDN variant rather than re-cropping the watermarked file, so there's no white logo flash and no username scroll at the bottom.`],
      [`Can I download age-restricted or region-locked TikToks?`, `Public videos that you can view in a normal browser session work. Region-locked videos require the post owner's region — DropZap can't bypass geofencing.`],
      [`Does it work for TikTok slideshow posts?`, `Yes — every image in the slideshow plus the background audio is bundled into a single zip download.`],
      [`What's the maximum quality?`, `Whatever TikTok stored at upload. For most modern uploads that's 1080×1920 at the original bitrate; older posts may cap at 720p.`],
      [`Will TikTok block my account for using this?`, `No. DropZap runs entirely server-side and doesn't touch your TikTok session.`],
      [`Does it support TikTok Lite or TikTok web?`, `Both. Any URL that resolves to a video page on tiktok.com or vm.tiktok.com works.`],
    ],
    Instagram: [
      [`Can I download Instagram Reels with the ${kw}?`, `Yes. Reels, Posts, IGTV, and Carousel albums all work via the same paste-and-download flow.`],
      [`Does it work for private accounts?`, `Only if you're logged in to that account on DropZap's server (which requires an admin-side cookie). Public accounts work without any setup.`],
      [`How do you get every slide in a carousel?`, `We call Instagram's own <code>/api/v1/media/{id}/info/</code> endpoint, which returns the full <code>carousel_media</code> array in one shot — no swiping, no per-slide requests.`],
      [`Can it download Instagram Stories?`, `Public Stories work for the duration they're live. After 24 hours Instagram deletes them server-side and they become unrecoverable.`],
      [`What resolution do I get?`, `For Reels, the original upload — typically 1080×1920. For photos, the highest <code>image_versions2</code> candidate, which is the source upload.`],
      [`Will Instagram know I downloaded?`, `No. DropZap fetches public metadata; nothing is logged on your IG account.`],
    ],
    "Twitter/X": [
      [`Does the ${kw} work for both twitter.com and x.com URLs?`, `Yes. Both domains route to the same backend — the only difference is the domain name in the URL bar.`],
      [`Can I download Twitter GIFs as actual GIFs (not MP4)?`, `Yes. Twitter stores them as MP4 internally but DropZap can transcode to true animated GIF on request — useful for chat embeds that don't autoplay video.`],
      [`Does it work for protected (locked) tweets?`, `No. Locked accounts require a follower-relationship check that DropZap doesn't perform.`],
      [`What about Twitter Spaces or live broadcasts?`, `Spaces work as long as the live is still active or has a recorded replay. Live broadcasts work during the live and for ~24h after.`],
      [`Why does my download sometimes come back at 720p when the tweet has 1080p?`, `Twitter caps non-Premium uploads at 720p — DropZap returns the actual highest variant the tweet was encoded in, which may be 720p even if the Twitter player offers a "1080p" option (often a synthetic upscale).`],
      [`Is there a download limit per day?`, `There's a per-IP rate limit (~30/min) to deter abuse, but no daily cap for normal use.`],
    ],
    Facebook: [
      [`Will the ${kw} download HD or just SD?`, `HD when Facebook serves it. We forward authenticated cookies so the FB CDN returns the real HD variant rather than silently downgrading to 480p.`],
      [`Can I download Reels and Watch videos?`, `Yes — both are supported via the same input. For Reels the result is a vertical 1080×1920 MP4; for Watch it's whatever aspect ratio the original was uploaded in.`],
      [`What about private group videos?`, `Only if your logged-in account is a member of that group AND the server has the corresponding cookies. For most users, public-only is the practical scope.`],
      [`Does it work for fb.watch short links?`, `Yes. fb.watch URLs are resolved to their canonical /watch/?v= form before extraction.`],
      [`Is the audio included?`, `Always. Facebook splits audio into a separate DASH track but DropZap merges them server-side before delivery.`],
      [`Can I batch-download an entire Facebook page's videos?`, `Not via the UI — that would be platform abuse. Single-video URLs only.`],
    ],
    Reddit: [
      [`Does the ${kw} include the audio track?`, `Yes — that's the whole point. Reddit splits audio into a separate stream and most tools forget to merge it. DropZap probes DASH_AUDIO_128, HLS_AUDIO_128, and the legacy fallback in that order.`],
      [`What about cross-posts (xposts)?`, `Cross-posts resolve to the original subreddit's media file via <code>crosspost_parent_list</code>. The download is identical to what you'd get from the source post.`],
      [`Does it work for NSFW subreddits?`, `Yes. SFW/NSFW status doesn't change the download path — though we'd suggest only downloading content you have a right to view.`],
      [`Why is my Reddit GIF coming back as MP4?`, `Reddit converted nearly all GIFs to MP4 in 2017 to save bandwidth. DropZap returns whatever the host actually stores; only true i.redd.it/*.gif URLs come back as GIF.`],
      [`Can I extract just the audio?`, `Yes — use the audio-only flow on the Reddit downloader page to get an .mp3 of the merged audio track.`],
      [`Does this work for old.reddit.com URLs?`, `Yes. Old Reddit, new Reddit, and the share-link domain (redd.it) all normalize to the same backend lookup.`],
    ],
  };
  const qas = pool[platform] || [];
  if (qas.length === 0) return "";
  const picks = [
    qas[hash % qas.length],
    qas[(hash >>> 3) % qas.length],
    qas[(hash >>> 6) % qas.length],
  ].filter((qa, i, arr) => arr.findIndex((x) => x[0] === qa[0]) === i);

  const items = picks.map(([q, a]) => `<h3>${q.replace(/\$\{kw\}/g, kw)}</h3>\n<p>${a}</p>`).join("\n\n");
  return `<h2>Frequently Asked Questions</h2>\n${items}`;
}

function generateBody(v: Variant, platform: string, platformSlug: string): string {
  const hash = slugHash(v.slug);
  const intro = introTemplates[hash % introTemplates.length](v.keyword, platform);
  const cta = ctaTemplates[(hash >>> 4) % ctaTemplates.length](v.keyword, platform, platformSlug);
  const why = whyBlocks[(hash >>> 8) % whyBlocks.length](v.keyword);
  const tipPool = platformTips[platform] || [];
  const tip = tipPool.length > 0 ? tipPool[(hash >>> 12) % tipPool.length] : "";
  const faq = buildFaq(v.keyword, platform, platformSlug, hash);

  // Variant-specific paragraphs slot in only when relevant; their position
  // is also hash-determined so two pages with the same {device, quality}
  // pair (e.g. two iPhone slugs on different platforms) don't end up with
  // visually identical layouts.
  const qualityPara = v.quality
    ? `<h2>${v.quality} quality</h2>\n<p>This page is specifically for ${v.quality} downloads. DropZap requests the ${v.quality} variant from ${platform}'s CDN when available; if the original upload doesn't include that tier, you'll get the next-highest available rather than an error.</p>`
    : "";
  const devicePara = v.device
    ? `<h2>On ${v.device}</h2>\n<p>DropZap is browser-only on ${v.device} — there's no app to install. On iOS Safari, downloads land in the Files app's Downloads folder; on Android Chrome, in the standard Download directory accessible from any file manager. From there, save into your camera roll / gallery if you want it in the photo timeline.</p>`
    : "";
  const extraPara = v.extra ? `<p>${v.extra}</p>` : "";

  // Section ordering is one of two stable layouts, hash-picked. Both
  // include every section but in a different sequence so adjacent slugs
  // don't render top-to-bottom-identical.
  const layout = hash & 1;
  if (layout === 0) {
    return [
      intro,
      qualityPara,
      cta,
      tip,
      devicePara,
      why,
      extraPara,
      faq,
    ].filter(Boolean).join("\n\n");
  } else {
    return [
      intro,
      cta,
      qualityPara,
      why,
      tip,
      devicePara,
      extraPara,
      faq,
    ].filter(Boolean).join("\n\n");
  }
}

export const programmaticPages: ProgrammaticPage[] = templates.flatMap((t) =>
  t.variants.map((v) => ({
    slug: v.slug,
    title: `${v.keyword} — Free Online ${t.platform} Downloader | DropZap`,
    h1: `${v.keyword} — Free & Fast`,
    description: `${v.keyword} online for free. Download ${t.platform} videos in HD quality. No watermark, no signup. Works on all devices.`,
    keywords: [v.keyword, `${v.keyword} free`, `${v.keyword} online`, `${t.platform.toLowerCase()} downloader`],
    platform: t.platform,
    platformSlug: t.platformSlug,
    body: generateBody(v, t.platform, t.platformSlug),
  }))
);
