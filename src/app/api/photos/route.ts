import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { createReadStream } from "fs";
import { mkdir, stat, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import archiver from "archiver";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getGenericCookiesArgs, getCookieHeader } from "@/lib/ytdlp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// =============================================================================
// /api/photos
// Generic still-image / carousel downloader for Instagram and Facebook.
//
// Behaviour:
//   • Single-image post (one slide)        → returns the JPG directly.
//   • Multi-image carousel / album         → zips every slide into one file.
//
// Why a separate endpoint from /api/stream?
//   /api/stream is video-centric (best-video+audio + ffmpeg merge). For pure
//   stills we want a raw passthrough: yt-dlp downloads each image, we either
//   stream the lone file back or pipe a zip through archiver. No ffmpeg, no
//   transcoding, no quality loss.
//
// Replaces the older Instagram-only /api/instagram/photos. Facebook's photo
// posts (facebook.com/photo/?fbid=...) follow the same yt-dlp flow.
// =============================================================================

const ALLOWED_HOST_RE = [
  /(^|\.)instagram\.com$/i,
  /(^|\.)facebook\.com$/i,
  /(^|\.)fb\.watch$/i,
];

const IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|heic|heif)$/i;

function isAllowedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ALLOWED_HOST_RE.some((re) => re.test(u.hostname));
  } catch {
    return false;
  }
}

function platformPrefix(url: string): string {
  try {
    const h = new URL(url).hostname;
    if (/instagram\.com$/i.test(h)) return "instagram";
    if (/facebook\.com$|fb\.watch$/i.test(h)) return "facebook";
  } catch {}
  return "post";
}

function runYtDlpJson(args: string[], timeoutMs = 60000): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      try { proc.kill("SIGKILL"); } catch {}
      resolve({ code: 1, stdout, stderr: stderr + "\n[timeout] yt-dlp process timed out" });
    }, timeoutMs);
    proc.stdout?.on("data", (c: Buffer) => { stdout += c.toString(); });
    proc.stderr?.on("data", (c: Buffer) => { stderr += c.toString(); });
    proc.on("close", (code) => { clearTimeout(timer); resolve({ code: code ?? 1, stdout, stderr }); });
    proc.on("error", () => { clearTimeout(timer); resolve({ code: 1, stdout, stderr }); });
  });
}

// Pull image URLs out of yt-dlp's JSON metadata. Handles both single posts
// (top-level `display_url` / `thumbnail`) and carousels (`entries[]`).
// We deliberately prefer `display_url` (full-res original) over `thumbnail`
// (cropped). For video slides we skip — this endpoint is image-only.
function extractImageUrls(meta: any): string[] {
  const urls: string[] = [];
  const pick = (entry: any) => {
    if (!entry || typeof entry !== "object") return;
    // Try the most reliable image fields IG returns first, then fall back
    // to the highest-res thumbnail. We intentionally don't filter on
    // entry.formats — IG carousel image slides sometimes carry a stub
    // "format" with vcodec=none which made the old check skip them.
    let u: string | undefined =
      entry.display_url ||
      entry.url ||
      entry.thumbnail;
    if (!u && Array.isArray(entry.thumbnails) && entry.thumbnails.length > 0) {
      // Highest-resolution thumbnail (last one is usually largest)
      const t = entry.thumbnails[entry.thumbnails.length - 1];
      u = t?.url;
    }
    // Skip pure-video slides: they have an mp4 url, not a jpg.
    // Detect by ext field rather than guessing from formats.
    if (entry.ext && /^(mp4|m4v|mov|webm)$/i.test(entry.ext)) {
      // But still try thumbnail so a mixed post grabs the cover image
      u = entry.thumbnail || (Array.isArray(entry.thumbnails) ? entry.thumbnails.at(-1)?.url : undefined);
      // If we only have a thumbnail for a video, skip — user wants the Reel downloader
      if (!u) return;
      // Don't include video thumbnails in image-only output
      return;
    }
    if (typeof u === "string" && /^https?:\/\//.test(u)) urls.push(u);
  };
  if (Array.isArray(meta?.entries) && meta.entries.length > 0) {
    for (const e of meta.entries) pick(e);
  } else {
    pick(meta);
  }
  return urls;
}

// =============================================================================
// Instagram private-API extractor
//
// yt-dlp's IG extractor returns shallow carousel entries (no display_url,
// no thumbnails) on Render — even with -j and proper cookies. So for IG
// we hit IG's public-but-undocumented mobile API directly:
//
//   GET https://i.instagram.com/api/v1/media/{media_id}/info/
//   Headers:
//     X-IG-App-ID: 936619743392459     (constant for the web app)
//     User-Agent:   <Instagram mobile UA>
//     Cookie:       <session cookies>   (optional but recommended)
//
// This is the same endpoint IG's own web frontend calls. It returns full
// carousel data including image_versions2.candidates[].url for every slide.
// Works for public posts without cookies; cookies unlock private-followed
// posts.
//
// Shortcode → media_id conversion: IG shortcodes are base64-encoded big
// integers using a custom alphabet (A–Z, a–z, 0–9, -, _). We decode it back
// to the numeric ID the API expects.
// =============================================================================
const IG_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
function shortcodeToMediaId(shortcode: string): string | null {
  let id = BigInt(0);
  const SIXTY_FOUR = BigInt(64);
  for (const c of shortcode) {
    const idx = IG_ALPHABET.indexOf(c);
    if (idx < 0) return null;
    id = id * SIXTY_FOUR + BigInt(idx);
  }
  return id.toString();
}

function extractIgShortcode(url: string): string | null {
  // Matches /p/<code>, /reel/<code>, /tv/<code>, /reels/<code>
  const m = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  return m ? m[1] : null;
}

// Web-scraping fallback: fetch the Instagram post page and extract image
// URLs from embedded JSON blobs. This works even when the private API
// returns empty items (e.g. expired sessionid) because Instagram's HTML
// pages still embed post data in __additionalDataLoaded or preloaded
// GraphQL payloads for logged-out viewers of public posts.
async function scrapeInstagramPage(postUrl: string, cookieHeader: string): Promise<string[] | null> {
  const urls: string[] = [];
  const pageUrls = [
    postUrl,
    // Force www in case the user passed a mobile link
    postUrl.replace(/^https?:\/\/(m|l|www)\.instagram\.com/, "https://www.instagram.com"),
  ];
  // Deduplicate
  const unique = [...new Set(pageUrls)];

  for (const pageUrl of unique) {
    try {
      const res = await fetch(pageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        redirect: "follow",
      });
      if (!res.ok) continue;
      const html = await res.text();

      // Strategy 1: Look for high-res image URLs in the page's JSON blobs.
      // Instagram embeds display_url / src in various script payloads.
      // Pattern: "display_url":"https://scontent..."
      const displayUrlRe = /"display_url"\s*:\s*"(https?:\\?\/\\?\/[^"]+)"/gi;
      for (const m of html.matchAll(displayUrlRe)) {
        const u = m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
        if (/scontent/i.test(u) && /\.(jpg|jpeg|png|webp)/i.test(u)) {
          urls.push(u);
        }
      }

      // Strategy 2: og:image meta tag (single image posts)
      if (urls.length === 0) {
        const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        if (ogMatch) {
          const u = ogMatch[1].replace(/&amp;/g, "&");
          if (/scontent/i.test(u)) urls.push(u);
        }
      }

      // Strategy 3: Look for image_versions2 candidates in embedded JSON
      const candidatesRe = /"candidates"\s*:\s*\[\s*\{\s*"width"\s*:\s*\d+\s*,\s*"height"\s*:\s*\d+\s*,\s*"url"\s*:\s*"(https?:[^"]+)"/gi;
      for (const m of html.matchAll(candidatesRe)) {
        const u = m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
        if (/scontent/i.test(u) && !urls.includes(u)) urls.push(u);
      }

      if (urls.length > 0) break;
    } catch (e: any) {
      console.warn(`[photos:instagram] scrape ${pageUrl} threw:`, e?.message);
    }
  }

  // Deduplicate and prefer the highest resolution (longest URL often has
  // the most params = CDN transformations; but first display_url match
  // from the JSON is typically the original)
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const u of urls) {
    // Normalize by stripping the CDN edge token (everything after &)
    // for dedup purposes only
    const key = u.split("?")[0];
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(u);
    }
  }
  return deduped.length > 0 ? deduped : null;
}

async function fetchInstagramPublicJson(shortcode: string, cookieHeader: string): Promise<string[] | null> {
  const url = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "X-Requested-With": "XMLHttpRequest",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const text = await res.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { return null; }

    const media = json?.graphql?.shortcode_media || json?.media || json?.items?.[0];
    if (!media) {
      console.warn(`[photos:instagram] public JSON no media field. Keys: ${json ? Object.keys(json).join(",") : "null"}`);
      return null;
    }

    const urls: string[] = [];
    const edges = media?.edge_sidecar_to_children?.edges;
    if (Array.isArray(edges)) {
      for (const edge of edges) {
        const node = edge?.node;
        if (node?.__typename === "GraphImage" && node?.display_url) urls.push(node.display_url);
        if (node?.__typename === "GraphVideo" && node?.thumbnail_src) urls.push(node.thumbnail_src);
      }
    }
    if (urls.length === 0 && media?.display_url) urls.push(media.display_url);
    return urls.length > 0 ? urls : null;
  } catch (e: any) {
    console.warn(`[photos:instagram] public JSON fetch threw:`, e?.message);
    return null;
  }
}

async function fetchInstagramImageUrls(postUrl: string): Promise<string[] | null> {
  const shortcode = extractIgShortcode(postUrl);
  if (!shortcode) return null;
  const mediaId = shortcodeToMediaId(shortcode);
  if (!mediaId) return null;

  // Try cookies for both subdomains; IG sets some cookies on i.instagram.com
  // and others on www.instagram.com. Combine when both exist.
  const cookieHeader = [
    getCookieHeader("i.instagram.com"),
    getCookieHeader("www.instagram.com"),
  ].filter(Boolean).join("; ");
  const cookieNames = cookieHeader
    ? cookieHeader.split(";").map((p) => p.trim().split("=")[0]).filter(Boolean)
    : [];

  // Try both API hosts; sometimes one is blocked while the other works.
  const apiUrls = [
    `https://i.instagram.com/api/v1/media/${mediaId}/info/`,
    `https://www.instagram.com/api/v1/media/${mediaId}/info/`,
  ];

  const headers: Record<string, string> = {
    "X-IG-App-ID": "936619743392459",
    "User-Agent": "Instagram 219.0.0.12.117 Android (28/9; 480dpi; 1080x2137; samsung; SM-N960U; crownqltesq; qcom; en_US; 346138365)",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
  };
  if (cookieHeader) headers["Cookie"] = cookieHeader;

  let data: any = null;
  for (const apiUrl of apiUrls) {
    try {
      const res = await fetch(apiUrl, { headers, redirect: "follow" });
      if (!res.ok) continue;
      let text = "";
      try { text = await res.text(); } catch { continue; }
      try { data = JSON.parse(text); } catch { data = null; }
      if (data && data.items && data.items.length > 0) break;
      // Log what we actually got when items is missing/empty
      console.warn(`[photos:instagram] ${apiUrl} returned OK but items empty/missing. Keys: ${data ? Object.keys(data).join(",") : "null"}, status: ${data?.status}, body[:200]: ${text.slice(0, 200)}`);
      data = null; // reset so next URL is tried
    } catch (e: any) {
      console.warn(`[photos:instagram] fetch ${apiUrl} threw:`, e?.message);
    }
  }

  const item = data?.items?.[0];
  if (!item) {
    console.warn(`[photos:instagram] no items[0] in API response — trying public JSON endpoint`);
    // Fallback 1: Instagram's public JSON endpoint with __a=1&__d=dis. This
    // sometimes works for logged-out viewers when the private API returns empty.
    const publicJson = await fetchInstagramPublicJson(shortcode, cookieHeader);
    if (publicJson && publicJson.length > 0) {
      return publicJson;
    }

    // Fallback 2: scrape the Instagram post HTML page for embedded image data
    console.warn(`[photos:instagram] public JSON fallback empty — trying web page scrape fallback`);
    const scraped = await scrapeInstagramPage(postUrl, cookieHeader);
    if (scraped && scraped.length > 0) {
      return scraped;
    }
    return null;
  }

  const urls: string[] = [];
  // Carousel: items[0].carousel_media[] each with image_versions2.candidates[].url
  // Single image: items[0].image_versions2.candidates[].url
  // Video slides have video_versions[]; we skip those (image-only endpoint).
  const slides = Array.isArray(item.carousel_media) && item.carousel_media.length > 0
    ? item.carousel_media
    : [item];
  let skippedVideo = 0;
  for (const s of slides) {
    if (Array.isArray(s.video_versions) && s.video_versions.length > 0) {
      skippedVideo++;
      continue;
    }
    const candidates = s?.image_versions2?.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      // First candidate is the highest-resolution version
      const top = candidates[0]?.url;
      if (typeof top === "string" && /^https?:\/\//.test(top)) urls.push(top);
    }
  }
  return urls;
}

// =============================================================================
// Facebook photo extractor
//
// FB public photo URLs look like:
//   facebook.com/photo/?fbid=XXX&set=YYY
//   facebook.com/photo.php?fbid=XXX
//   facebook.com/<user>/photos/<set>/<id>/
//   m.facebook.com/photo.php?fbid=XXX
//
// yt-dlp gets bounced to /login/?next=... because FB requires session
// cookies for the desktop UI. The mobile mbasic site exposes the same
// photo as a static page with a clean og:image meta tag — no login wall
// for public photos. We fetch that, regex out og:image, done.
// =============================================================================
/**
 * Result type so callers can distinguish "post is genuinely empty" (null)
 * from "we got walled by FB on every mirror" (loginWalled=true). The latter
 * surfaces a more actionable error to the user.
 */
type FbPhotoResult =
  | { url: string; loginWalled?: false }
  | { url: null; loginWalled: boolean };

// Pull all photo fbids from an FB album set page. FB photo URLs of the form
// /photo/?fbid=X&set=a.Y only render the SINGLE photo with that fbid — the
// other album photos are loaded dynamically. To grab the full album we hit
// the album listing URL (/media/set/?set=a.Y) and harvest every fbid from
// the resulting HTML.
//
// Cap at 30 photos to keep latency / disk usage sane and avoid abuse.
// Harvest all photo fbids that appear on a given FB page (either the album
// listing /media/set/?set=a.Y or the in-album single-photo viewer
// /photo/?fbid=X&set=a.Y). FB embeds prev/next navigation data with all
// album fbids in the page's JSON blobs when the viewer is logged in.
//
// Regex passes are intentionally generous: mbasic uses `photo.php?fbid=N`,
// www uses `/photo/?fbid=N`, the GraphQL response embeds `"fbid":"N"` AND
// `"node_id":"N"`, and permalink-style URLs use `/photos/<set>/<fbid>/`.
function harvestFbidsFromHtml(html: string): string[] {
  const ids = new Set<string>();
  const patterns: RegExp[] = [
    /(?:photo\.php\?fbid=|\/photo\/\?fbid=)(\d{8,})/gi,
    /"fbid":"?(\d{8,})"?/gi,
    /\/photos\/[^"'\s\\]*?\/(\d{8,})(?:\/|\?|"|\\)/gi,
    /"id":"(\d{15,})"\s*,\s*"__typename":"Photo"/gi,
    /story_fbid=(\d{8,})/gi,
  ];
  for (const re of patterns) {
    for (const m of html.matchAll(re)) ids.add(m[1]);
  }
  return Array.from(ids);
}

async function fetchFacebookAlbumFbids(
  setParam: string,
  originalFbid: string | null,
  cookieHeader: string,
): Promise<string[]> {
  const ANDROID_UA =
    "Mozilla/5.0 (Linux; Android 4.4; Nexus 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Mobile Safari/537.36";
  const DESKTOP_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

  // The www photo viewer with `set=a.Y` is the most reliable source: its
  // JSON contains every album photo's fbid for the prev/next strip, and
  // we already know it doesn't login-wall when cookies are valid (it's
  // the same URL the single-photo extractor succeeds on).
  //
  // mbasic/m album listings come second — they often render a paginated
  // grid with explicit photo.php?fbid=N hrefs, but they login-wall more
  // often than the www photo viewer.
  const mirrors: { url: string; ua: string; label: string }[] = [];
  if (originalFbid) {
    mirrors.push({
      url: `https://www.facebook.com/photo/?fbid=${originalFbid}&set=${encodeURIComponent(setParam)}`,
      ua: DESKTOP_UA,
      label: "www-viewer",
    });
  }
  mirrors.push(
    { url: `https://mbasic.facebook.com/media/set/?set=${encodeURIComponent(setParam)}`, ua: ANDROID_UA, label: "mbasic-set" },
    { url: `https://m.facebook.com/media/set/?set=${encodeURIComponent(setParam)}`, ua: ANDROID_UA, label: "m-set" },
    { url: `https://www.facebook.com/media/set/?set=${encodeURIComponent(setParam)}`, ua: DESKTOP_UA, label: "www-set" },
  );

  // Aggregate fbids across mirrors so a partial result from one mirror
  // can be supplemented by another. Stop early once we have plenty.
  const all = new Set<string>();
  for (const m of mirrors) {
    try {
      const res = await fetch(m.url, {
        headers: {
          "User-Agent": m.ua,
          "Accept": "text/html,application/xhtml+xml,*/*",
          "Accept-Language": "en-US,en;q=0.9",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        redirect: "follow",
      });
      if (/\/(login|checkpoint|recover)/i.test(res.url) || !res.ok) continue;
      const html = await res.text();
      if (/Log in to Facebook|You must log in/i.test(html) && !/fbid/i.test(html)) continue;

      const ids = harvestFbidsFromHtml(html);
      for (const id of ids) all.add(id);

      // The www viewer reliably exposes every prev/next sibling — once
      // we get >= 2 ids from it, that's the whole album in nearly all
      // cases. Skip the slower /media/set/ mirrors.
      if (m.label === "www-viewer" && all.size >= 2) break;
    } catch (e: any) {
      console.warn(`[photos:facebook] album:${m.label} threw:`, e?.message);
    }
  }
  return Array.from(all).slice(0, 30);
}

async function fetchFacebookImageUrl(postUrl: string): Promise<FbPhotoResult> {
  // Extract fbid (the photo ID) from any URL shape FB uses.
  let fbid: string | null = null;
  let resolvedUrl = postUrl;
  try {
    const u = new URL(postUrl);
    fbid = u.searchParams.get("fbid");
    if (!fbid) {
      const m = u.pathname.match(/\/photos\/[^\/]+\/(\d+)/);
      if (m) fbid = m[1];
    }

    // /share/p/XXX and /share/r/XXX are short links that redirect to the real
    // permalink. Fetch them once to capture the final URL and extract fbid.
    if (!fbid && /^\/share\/(p|v|reel)\//i.test(u.pathname)) {
      const res = await fetch(postUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,*/*",
        },
        redirect: "follow",
      });
      resolvedUrl = res.url;
      const final = new URL(resolvedUrl);
      fbid = final.searchParams.get("fbid");
      if (!fbid) {
        const m2 = final.pathname.match(/\/photos\/[^\/]+\/(\d+)/);
        if (m2) fbid = m2[1];
      }
      // Also scan the final HTML for any fbid in case the URL is opaque.
      if (!fbid) {
        const html = await res.text();
        const m3 = html.match(/(?:photo\.php\?fbid=|\/photo\/\?fbid=|"fbid":"?)(\d{8,})/i);
        if (m3) fbid = m3[1];
      }
    }
  } catch {}

  // Pull cookies once. We log the count so deployment issues (no FB cookies
  // in MEDIA_COOKIES) are diagnosable from the server logs.
  const fbCookieHeader =
    getCookieHeader("www.facebook.com") ||
    getCookieHeader("facebook.com") ||
    getCookieHeader(".facebook.com") ||
    getCookieHeader("mbasic.facebook.com") ||
    getCookieHeader("m.facebook.com");
  const cookieNames = fbCookieHeader
    ? fbCookieHeader.split(";").map((p) => p.trim().split("=")[0]).filter(Boolean)
    : [];
  const hasSession = cookieNames.includes("c_user") && cookieNames.includes("xs");

  // Each candidate carries its own UA — desktop www.facebook.com needs a
  // modern desktop UA, while mbasic only renders for an old Android UA.
  const ANDROID_UA =
    "Mozilla/5.0 (Linux; Android 4.4; Nexus 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Mobile Safari/537.36";
  const DESKTOP_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

  type Candidate = { url: string; ua: string };
  const candidates: Candidate[] = [];
  if (fbid) {
    // mbasic + m.facebook give clean HTML when they don't login-wall.
    candidates.push({ url: `https://mbasic.facebook.com/photo.php?fbid=${fbid}`, ua: ANDROID_UA });
    candidates.push({ url: `https://m.facebook.com/photo.php?fbid=${fbid}`, ua: ANDROID_UA });
    // Desktop www.facebook.com path — when the user has valid FB cookies in
    // MEDIA_COOKIES this is the most reliable: scontent URLs are inlined
    // in the page's JSON blobs and the og:image is the real photo.
    candidates.push({ url: `https://www.facebook.com/photo/?fbid=${fbid}`, ua: DESKTOP_UA });
    candidates.push({ url: `https://www.facebook.com/photo.php?fbid=${fbid}`, ua: DESKTOP_UA });
  }
  // Last-ditch: rewrite the original to mbasic in case it carried params we
  // need (set=, id=) that the bare ?fbid= form doesn't.
  candidates.push({
    url: postUrl.replace(/(www|m|web)\.facebook\.com/i, "mbasic.facebook.com"),
    ua: ANDROID_UA,
  });

  // Reject FB logos and other static assets. Real photos live on
  // scontent*.fbcdn.net / external.fbcdn.net; chrome assets (logo, nav
  // icons) live on static.xx.fbcdn.net which the login-wall og:image
  // points to.
  const isRealPhoto = (u: string) => /^https:\/\/(?:scontent|external)[^/]*\.fbcdn\.net\//i.test(u);

  // Reject tiny thumbnails / profile pics. FB embeds the photo's owner
  // avatar at the top of every /photo page on scontent — without this
  // filter the first regex match is a 40x40 .png profile thumbnail, not
  // the real photo. Patterns:
  //   /c<x>.<y>.<w>.<h>(a|q)/     → cropped thumbnail (c0.0.40.40a)
  //   /s<w>x<h>/ , /p<w>x<h>/     → resized variants under ~200px
  //   /t39.30808-1/                → profile-pic CDN bucket
  //   /t1.6435-9/, /t31.18172-8/   → cover photos / story images, not photo
  const isThumbnailUrl = (u: string): boolean => {
    if (/\/c\d+\.\d+\.(\d+)\.(\d+)[a-z]?\//i.test(u)) {
      const m = u.match(/\/c\d+\.\d+\.(\d+)\.(\d+)[a-z]?\//i);
      if (m && (parseInt(m[1], 10) <= 200 || parseInt(m[2], 10) <= 200)) return true;
    }
    const sm = u.match(/\/[sp](\d+)x(\d+)\//i);
    if (sm && (parseInt(sm[1], 10) <= 200 || parseInt(sm[2], 10) <= 200)) return true;
    if (/\/t39\.30808-1\//i.test(u)) return true; // profile pics bucket
    return false;
  };

  // Score a scontent URL: bigger = better. Heavily penalize thumbnails so
  // they sort last. Used as a tiebreaker after JSON dimension parsing.
  const scoreUrl = (u: string, w?: number, h?: number): number => {
    if (isThumbnailUrl(u)) return -1;
    if (typeof w === "number" && typeof h === "number") return w * h;
    // Heuristic: t39.30808-6 is the "full photo" bucket
    return /\/t39\.30808-6\//i.test(u) ? 1_000_000 : 10_000;
  };

  let everWalled = false;

  for (const c of candidates) {
    try {
      const res = await fetch(c.url, {
        headers: {
          "User-Agent": c.ua,
          "Accept": "text/html,application/xhtml+xml,*/*",
          "Accept-Language": "en-US,en;q=0.9",
          ...(fbCookieHeader ? { Cookie: fbCookieHeader } : {}),
        },
        redirect: "follow",
      });

      // FB redirected us to a login/checkpoint URL → this mirror won't work.
      if (/\/(login|checkpoint|recover)/i.test(res.url)) {
        everWalled = true;
        continue;
      }
      if (!res.ok) continue;
      const html = await res.text();

      // Body-level login wall served at the original URL with HTTP 200.
      if (/Log in to Facebook|You must log in/i.test(html) && !/scontent[^/]*\.fbcdn\.net/i.test(html)) {
        everWalled = true;
        continue;
      }

      // Strategy: collect ALL candidate scontent image URLs from the page,
      // score them by dimensions / bucket type, pick the largest non-
      // thumbnail. FB embeds the owner's avatar near the top of every
      // /photo page, so a naive "first match wins" picks a 40x40 profile
      // pic instead of the real photo.
      type Cand = { url: string; score: number; src: string };
      const cands: Cand[] = [];
      const norm = (s: string) => s.replace(/\\\//g, "/").replace(/&amp;/g, "&");

      // 1. JSON shape: "uri":"https:\/\/scontent...","height":N,"width":N
      //    The width/height let us pick the actual full-resolution image.
      const jsonRe = /"uri":"(https:\\?\/\\?\/[^"\\]*scontent[^"\\]*\.(?:jpe?g|png|webp)[^"\\]*)"\s*,\s*"height":(\d+)\s*,\s*"width":(\d+)/gi;
      for (const m of html.matchAll(jsonRe)) {
        const u = norm(m[1]);
        if (!isRealPhoto(u)) continue;
        const w = parseInt(m[3], 10), h = parseInt(m[2], 10);
        cands.push({ url: u, score: scoreUrl(u, w, h), src: `json(${w}x${h})` });
      }

      // 2. og:image meta tag — usually the real photo when cookies are valid.
      const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
      if (og) {
        const u = norm(og[1]);
        if (isRealPhoto(u)) cands.push({ url: u, score: scoreUrl(u), src: "og:image" });
      }

      // 3. Anchor href to a full-size scontent jpeg (mbasic "View full size").
      for (const m of html.matchAll(/href=["'](https:\/\/[^"']*scontent[^"']*\.(?:jpe?g|png|webp)[^"']*)["']/gi)) {
        const u = norm(m[1]);
        if (isRealPhoto(u)) cands.push({ url: u, score: scoreUrl(u), src: "anchor" });
      }

      // 4. Any scontent URL anywhere in the HTML (last-resort sweep).
      for (const m of html.matchAll(/https:\\?\/\\?\/scontent[^"'\\\s]+\.(?:jpe?g|png|webp)[^"'\\\s]*/gi)) {
        const u = norm(m[0]);
        if (isRealPhoto(u)) cands.push({ url: u, score: scoreUrl(u), src: "sweep" });
      }

      // Dedupe by URL keeping the highest score.
      const byUrl = new Map<string, Cand>();
      for (const c of cands) {
        const prev = byUrl.get(c.url);
        if (!prev || c.score > prev.score) byUrl.set(c.url, c);
      }
      const ranked = Array.from(byUrl.values())
        .filter((c) => c.score >= 0)
        .sort((a, b) => b.score - a.score);

      if (ranked.length > 0) {
        const top = ranked[0];
        return { url: top.url };
      }
    } catch (e: any) {
      console.warn(`[photos:facebook] fetch ${c.url} threw:`, e?.message);
    }
  }
  return { url: null, loginWalled: everWalled };
}

async function fetchToFile(url: string, dest: string): Promise<{ ext: string }> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept": "image/avif,image/webp,image/png,image/jpeg,*/*",
    },
  });
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  const ext = ct.includes("png") ? ".png"
    : ct.includes("webp") ? ".webp"
    : ct.includes("heic") ? ".heic"
    : ".jpg";
  // Plain arrayBuffer→writeFile avoids the Node version sensitivity of
  // Readable.fromWeb (which was undefined under our Render runtime even
  // though the docs say it landed in 17). Carousel images are small (a
  // few MB max) so buffering is fine.
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest + ext, buf);
  return { ext };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.success) {
    return new Response(`Rate limited. Try again in ${limit.retryAfter}s`, { status: 429 });
  }
  const { url } = await request.json().catch(() => ({ url: null }));
  if (!url) return new Response("URL is required", { status: 400 });
  return handleDownload(url);
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.success) {
    return new Response(`Rate limited. Try again in ${limit.retryAfter}s`, { status: 429 });
  }
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return new Response("URL is required", { status: 400 });
  return handleDownload(url);
}

async function handleDownload(url: string): Promise<Response> {
  if (!isAllowedUrl(url)) {
    return new Response("Only Instagram and Facebook URLs are supported here", { status: 400 });
  }

  const platform = platformPrefix(url);
  const id = randomUUID().slice(0, 8);
  const workDir = join(tmpdir(), `photos-${platform}-${id}`);
  await mkdir(workDir, { recursive: true });
  const cleanup = () => rm(workDir, { recursive: true, force: true }).catch(() => {});

  try {
    // ── Instagram fast path: hit IG's private API directly ─────────────
    // yt-dlp's IG extractor returns shallow carousel entries on Render
    // (no display_url). Bypassing it with the private mobile API is
    // dramatically faster and actually returns full carousel data.
    if (platform === "instagram") {
      const igUrls = await fetchInstagramImageUrls(url);
      if (igUrls && igUrls.length > 0) {
        const downloaded: string[] = [];
        for (let i = 0; i < igUrls.length; i++) {
          const base = join(workDir, String(i + 1).padStart(2, "0"));
          try {
            const { ext } = await fetchToFile(igUrls[i], base);
            downloaded.push(`${String(i + 1).padStart(2, "0")}${ext}`);
          } catch (e: any) {
            console.warn(`[photos:instagram] image ${i + 1} fetch failed:`, e?.message);
          }
        }
        if (downloaded.length > 0) {
          if (downloaded.length === 1) {
            return streamSingleImage(join(workDir, downloaded[0]), downloaded[0], platform, cleanup);
          }
          return streamZip(workDir, downloaded, platform, cleanup);
        }
        // Fell through (all image fetches failed) → try yt-dlp below.
      }
      // igUrls null/empty → post might be a video, or API blocked us.
      // Fall through to yt-dlp which can handle other shapes.
    }

    // ── Facebook fast path: scrape FB across mirrors ───────────────────
    // yt-dlp itself gets bounced to /login/?next=... (and then errors with
    // "Unsupported URL: .../login/..."), so we try multiple FB hosts with
    // appropriate UAs + cookies. Returns either a CDN URL or a flag
    // indicating every mirror hit a login wall — the latter is a
    // deployment problem, not a "post is private" problem.
    if (platform === "facebook") {
      // Detect album: FB photo URLs of shape /photo/?fbid=X&set=a.Y are
      // single-photo viewers inside an album. To download the WHOLE album
      // we expand the set= param into the full list of fbids.
      let setParam: string | null = null;
      let originalFbid: string | null = null;
      try {
        const u = new URL(url);
        setParam = u.searchParams.get("set");
        originalFbid = u.searchParams.get("fbid");
        if (!originalFbid) {
          const mm = u.pathname.match(/\/photos\/[^\/]+\/(\d+)/);
          if (mm) originalFbid = mm[1];
        }
      } catch {}

      // Cookie header used by both album expansion and single-photo extractor.
      const fbCookieHeader =
        getCookieHeader("www.facebook.com") ||
        getCookieHeader("facebook.com") ||
        getCookieHeader(".facebook.com") ||
        getCookieHeader("mbasic.facebook.com") ||
        getCookieHeader("m.facebook.com");

      // Build the list of fbids to resolve. If we have a set= and a real
      // album expansion succeeds, use that (deduped, with the original
      // fbid first so the user gets their primary photo even if album
      // listing missed it). Otherwise just the single fbid.
      let fbids: string[] = [];
      if (setParam && /^a\./.test(setParam)) {
        const albumIds = await fetchFacebookAlbumFbids(setParam, originalFbid, fbCookieHeader);
        if (albumIds.length > 0) {
          const dedup = new Set<string>();
          if (originalFbid) dedup.add(originalFbid);
          for (const id of albumIds) dedup.add(id);
          fbids = Array.from(dedup);
        }
      }
      if (fbids.length === 0 && originalFbid) fbids = [originalFbid];

      // Resolve each fbid to a CDN image URL via the existing per-photo
      // extractor. Track login walls across all resolves: if EVERY one
      // walled, surface the actionable 403 error. If SOME succeeded, ship
      // what we have.
      const resolvedUrls: string[] = [];
      let anySuccess = false;
      let allWalled = true;
      for (const id of fbids) {
        const photoUrl = `https://www.facebook.com/photo/?fbid=${id}`;
        const r = await fetchFacebookImageUrl(photoUrl);
        if (r.url) {
          resolvedUrls.push(r.url);
          anySuccess = true;
          allWalled = false;
        } else if (!r.loginWalled) {
          allWalled = false;
        }
      }

      if (anySuccess) {
        // Dedupe by the photo's underlying numeric ID (the segment before
        // _n.jpg in an scontent URL) so equivalent variants don't double-up.
        const seen = new Set<string>();
        const unique: string[] = [];
        for (const u of resolvedUrls) {
          const key = (u.match(/\/(\d{6,})_[^\/]+_[no]\.(jpe?g|png|webp)/i)?.[1]) || u;
          if (!seen.has(key)) { seen.add(key); unique.push(u); }
        }

        const downloaded: string[] = [];
        for (let i = 0; i < unique.length; i++) {
          const base = join(workDir, String(i + 1).padStart(2, "0"));
          try {
            const { ext } = await fetchToFile(unique[i], base);
            downloaded.push(`${String(i + 1).padStart(2, "0")}${ext}`);
          } catch (e: any) {
            console.warn(`[photos:facebook] image ${i + 1} fetch failed:`, e?.message);
          }
        }
        if (downloaded.length === 1) {
          return streamSingleImage(join(workDir, downloaded[0]), downloaded[0], platform, cleanup);
        }
        if (downloaded.length > 1) {
          return streamZip(workDir, downloaded, platform, cleanup);
        }
        // Fall through if every image fetch failed.
      } else if (fbids.length > 0 && allWalled) {
        // Every mirror redirected to /login. yt-dlp will fail the same
        // way (it already tried and emitted "Unsupported URL: .../login/").
        // Skip the yt-dlp round-trip and surface a useful error so the
        // user / admin knows the cause is missing/expired FB cookies, not
        // a bug in the URL.
        cleanup();
        return new Response(
          "Facebook is requiring login to view this photo. " +
          "This usually means the post is restricted, OR the server's Facebook cookies (in MEDIA_COOKIES) are missing or expired. " +
          "Public photos do still work when valid FB cookies are configured.",
          { status: 403 },
        );
      }
      // fbResult.url null AND not walled → yt-dlp may still find it.
    }

    // Use -j (lowercase) which forces full extraction of every entry in a
    // playlist/carousel and prints ONE JSON object per entry (NDJSON).
    //
    // Why not -J (capital)? yt-dlp's IG extractor returns a shallow playlist
    // with -J — entries lack display_url/thumbnail. -j makes it actually
    // resolve each slide individually so we get the image URLs.
    //
    // --ignore-no-formats-error keeps image-only slides from aborting the
    // whole run with "No video formats found".
    const args = [
      url,
      "-j",
      "--ignore-no-formats-error",
      "--no-playlist-reverse",
      ...getGenericCookiesArgs(),
      "--no-check-certificates",
      "--no-warnings",
      "--socket-timeout", "30",
    ];

    const { code, stdout, stderr } = await runYtDlpJson(args);

    // Parse NDJSON: one entry per line. Tolerate non-zero exit if any lines
    // parsed successfully (yt-dlp may exit non-zero after warnings).
    const entries: any[] = [];
    for (const line of stdout.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t[0] !== "{") continue;
      try { entries.push(JSON.parse(t)); } catch {}
    }

    if (entries.length === 0) {
      console.warn(`[photos:${platform}] yt-dlp -j produced no entries (code=${code}):`, stderr.slice(0, 400));
      cleanup();
      const friendly = /private|login|account|not.*available/i.test(stderr)
        ? "This post is private, deleted, or requires login."
        : `Failed to fetch this ${platform} post.`;
      return new Response(friendly, { status: 502 });
    }

    // Walk every entry and pull image URLs. extractImageUrls() handles the
    // single-object case too (entries.length === 1 → single photo post).
    const imageUrls: string[] = [];
    for (const e of entries) imageUrls.push(...extractImageUrls(e));

    if (imageUrls.length === 0) {
      // Log a summary of the FIRST entry so we can see what yt-dlp returned
      // when extraction comes up empty (e.g. all slides were videos).
      const first = entries[0] || {};
      const summary = {
        entries: entries.length,
        ext: first.ext,
        has_display_url: !!first.display_url,
        has_url: !!first.url,
        has_thumbnail: !!first.thumbnail,
        thumbnails_count: Array.isArray(first.thumbnails) ? first.thumbnails.length : 0,
        formats_count: Array.isArray(first.formats) ? first.formats.length : 0,
        keys: Object.keys(first).slice(0, 25),
      };
      console.warn(`[photos:${platform}] no images extracted; first-entry summary:`, JSON.stringify(summary));
      cleanup();
      // Instagram specifically: if we got here, every extraction method failed
      // (private API, public JSON, web scrape, yt-dlp). The server IP is almost
      // certainly blocked by Instagram. Surface an actionable message.
      if (platform === "instagram") {
        return new Response(
          "Instagram is blocking this server's IP. For Instagram carousels and photos to work, the server needs fresh Instagram session cookies (sessionid) in the MEDIA_COOKIES/YOUTUBE_COOKIES environment variable, or a residential proxy. Public posts may still work once cookies are configured.",
          { status: 403 },
        );
      }
      return new Response(
        `No images found. If this is a video, use the ${platform === "instagram" ? "Reel" : "Video"} downloader instead.`,
        { status: 422 },
      );
    }

    // Download each image URL into workDir with a stable index prefix.
    const downloaded: string[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const base = join(workDir, String(i + 1).padStart(2, "0"));
      try {
        const { ext } = await fetchToFile(imageUrls[i], base);
        downloaded.push(`${String(i + 1).padStart(2, "0")}${ext}`);
      } catch (e: any) {
        console.warn(`[photos:${platform}] image ${i + 1} fetch failed:`, e?.message);
      }
    }

    if (downloaded.length === 0) {
      cleanup();
      return new Response("Failed to download any images from this post.", { status: 502 });
    }

    if (downloaded.length === 1) {
      return streamSingleImage(join(workDir, downloaded[0]), downloaded[0], platform, cleanup);
    }
    return streamZip(workDir, downloaded, platform, cleanup);
  } catch (e: any) {
    console.error(`[photos:${platform}] handler error:`, e?.message);
    cleanup();
    return new Response("Failed to download photos", { status: 500 });
  }
}

async function streamSingleImage(
  path: string,
  originalName: string,
  platform: string,
  cleanup: () => void,
): Promise<Response> {
  const stats = await stat(path);
  const ext = (originalName.match(/\.[a-z0-9]+$/i)?.[0] || ".jpg").toLowerCase();
  const friendlyName = `${platform}-photo${ext}`;

  const node = createReadStream(path);
  const web = new ReadableStream<Uint8Array>({
    start(controller) {
      node.on("data", (c) => { try { controller.enqueue(new Uint8Array(c as Buffer)); } catch {} });
      node.on("end", () => { try { controller.close(); } catch {}; cleanup(); });
      node.on("error", () => { try { controller.close(); } catch {}; cleanup(); });
    },
    cancel() { node.destroy(); cleanup(); },
  });

  const mime = ext === ".png" ? "image/png"
    : ext === ".webp" ? "image/webp"
    : ext === ".heic" || ext === ".heif" ? "image/heic"
    : "image/jpeg";

  return new Response(web, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${friendlyName}"`,
      "Content-Length": stats.size.toString(),
      "Cache-Control": "no-store",
    },
  });
}

function streamZip(
  workDir: string,
  images: string[],
  platform: string,
  cleanup: () => void,
): Response {
  // STORE-only: JPEGs already have minimal redundancy; spending CPU on
  // DEFLATE for a 5-slide IG carousel saves ~1% size for ~10x the time.
  const archive = archiver("zip", { zlib: { level: 0 } });
  let lastError: Error | null = null;
  archive.on("error", (err) => { lastError = err; });
  archive.on("warning", (err) => console.warn(`[photos:${platform}] archiver warn:`, err.message));

  images.forEach((img, i) => {
    const ext = (img.match(/\.[a-z0-9]+$/i)?.[0] || ".jpg").toLowerCase();
    archive.file(join(workDir, img), { name: `photo-${i + 1}${ext}` });
  });

  archive.finalize().catch((e) => {
    lastError = e;
    console.error(`[photos:${platform}] archive.finalize:`, e?.message);
  });

  const web = new ReadableStream<Uint8Array>({
    start(controller) {
      archive.on("data", (c: Buffer) => { try { controller.enqueue(new Uint8Array(c)); } catch {} });
      archive.on("end", () => {
        try { controller.close(); } catch {}
        cleanup();
        if (lastError) console.warn(`[photos:${platform}] zip ended after error:`, lastError.message);
      });
    },
    cancel() {
      try { archive.abort(); } catch {}
      cleanup();
    },
  });

  return new Response(web, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${platform}-photos.zip"`,
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
