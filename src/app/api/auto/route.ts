import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { createReadStream } from "fs";
import { mkdir, readdir, stat, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import archiver from "archiver";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { writeFile } from "fs/promises";
import { getGenericCookiesArgs, getCookieHeader } from "@/lib/ytdlp";
import { resolveViaCobalt } from "@/lib/cobalt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// =============================================================================
// /api/auto
// "Smart" downloader for platforms where a single user-pasted URL might be
// EITHER a video OR one or more images: Reddit, Twitter/X, Pinterest, Threads.
//
// Strategy: let yt-dlp do one download with no format restriction into a
// temp dir. Whatever ends up there tells us what kind of post it was:
//   • exactly one .mp4 / .webm / .mkv  → stream as MP4 attachment
//   • exactly one image                → stream as JPG/PNG/WEBP
//   • multiple images (gallery)        → zip as <platform>-album.zip
//   • mix (rare)                       → prefer video; ignore images
//
// Why one download instead of two probes? On Render free CPU, a probe + a
// real download = ~2× yt-dlp boot cost (~3-5s each). Letting yt-dlp do the
// real work in one shot is faster and the temp-file footprint is small for
// these platforms (no 4K mux required).
// =============================================================================

const ALLOWED_HOST_RE = [
  /(^|\.)reddit\.com$/i,
  /(^|\.)redd\.it$/i,
  /(^|\.)twitter\.com$/i,
  /(^|\.)x\.com$/i,
  /(^|\.)pinterest\.com$/i,
  /(^|\.)pinterest\.[a-z.]+$/i, // pinterest.co.uk, pinterest.fr, etc.
  /(^|\.)pin\.it$/i,
  /(^|\.)threads\.net$/i,
  /(^|\.)threads\.com$/i,
];

const VIDEO_EXT_RE = /\.(mp4|webm|mkv|mov)$/i;
const IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|heic|heif|gif)$/i;

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
    if (/reddit\.com$|redd\.it$/i.test(h)) return "reddit";
    if (/twitter\.com$|x\.com$/i.test(h)) return "twitter";
    if (/pinterest\.|pin\.it$/i.test(h)) return "pinterest";
    if (/threads\.(net|com)$/i.test(h)) return "threads";
  } catch {}
  return "post";
}

function runYtDlp(args: string[], timeoutMs = 90000): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    const timer = setTimeout(() => {
      try { proc.kill("SIGKILL"); } catch {}
      resolve({ code: 1, stderr: stderr + "\n[timeout] yt-dlp process timed out" });
    }, timeoutMs);
    proc.stderr?.on("data", (c: Buffer) => { stderr += c.toString(); });
    proc.stdout?.on("data", () => {});
    proc.on("close", (code) => { clearTimeout(timer); resolve({ code: code ?? 1, stderr }); });
    proc.on("error", () => { clearTimeout(timer); resolve({ code: 1, stderr }); });
  });
}

// =============================================================================
// Direct image extractors (bypass yt-dlp for image-only posts where it fails)
// =============================================================================

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function fetchImageToFile(url: string, dest: string): Promise<{ ext: string }> {
  const res = await fetch(url, {
    headers: { "User-Agent": BROWSER_UA, "Accept": "image/avif,image/webp,image/png,image/jpeg,*/*" },
  });
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  const ext = ct.includes("png") ? ".png"
    : ct.includes("webp") ? ".webp"
    : ct.includes("gif") ? ".gif"
    : ".jpg";
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest + ext, buf);
  return { ext };
}

// ── Reddit ───────────────────────────────────────────────────────────────────
// Reddit posts come in three image-bearing flavours that yt-dlp struggles with:
//   1. /media?url=https%3A%2F%2Fi.redd.it%2F...jpeg  (direct media wrapper)
//   2. /r/<sub>/comments/<id>/...                    (single-image post)
//   3. /gallery/<id> or /r/<sub>/comments/<id>/...   (multi-image gallery)
// For (1) we just decode the `url` query. For (2)/(3) Reddit conveniently
// supports a JSON view at <post_url>.json that returns full post data
// including media_metadata for galleries.
async function extractRedditImageUrls(postUrl: string): Promise<string[] | null> {
  try {
    const u = new URL(postUrl);
    // Case 1: /media?url=ENCODED
    if (u.pathname === "/media") {
      const inner = u.searchParams.get("url");
      if (inner && /^https?:\/\//.test(inner)) return [inner];
    }

    // Case 2/3: fetch <url>.json
    // Reddit's www host blocks most datacenter IPs. old.reddit.com is far more
    // lenient and returns the same JSON shape, so we try it first.
    const path = u.pathname.replace(/\/$/, "");
    const jsonUrl = `https://old.reddit.com${path}.json`;
    const cookieHeader = getCookieHeader("old.reddit.com") || getCookieHeader("reddit.com");
    const res = await fetch(jsonUrl, {
      headers: {
        "User-Agent": BROWSER_UA,
        "Accept": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!Array.isArray(data) || !data[0]?.data?.children?.[0]?.data) return null;
    const post = data[0].data.children[0].data;
    const urls: string[] = [];

    // Multi-image gallery: media_metadata is keyed by image ID; gallery_data
    // gives the ordered list of those IDs.
    if (post.is_gallery && post.media_metadata && post.gallery_data?.items) {
      for (const item of post.gallery_data.items) {
        const meta = post.media_metadata[item.media_id];
        // s = source (highest res); URL is HTML-entity encoded (&amp;)
        const src = meta?.s?.u || meta?.s?.gif;
        if (typeof src === "string") urls.push(src.replace(/&amp;/g, "&"));
      }
      if (urls.length > 0) return urls;
    }

    // Single image: post.url usually points straight at i.redd.it/<id>.jpg
    if (typeof post.url === "string" && /\.(jpe?g|png|gif|webp)(\?|$)/i.test(post.url)) {
      return [post.url];
    }
    // Fallback: preview.images[0].source.url
    const preview = post.preview?.images?.[0]?.source?.url;
    if (typeof preview === "string") return [preview.replace(/&amp;/g, "&")];

    return null;
  } catch (e: any) {
    console.warn(`[auto:reddit] extractor threw:`, e?.message);
    return null;
  }
}

// ── Twitter / X ───────────────────────────────────────────────────────────────
// X/Twitter now login-walls and bot-blocks most tweet pages. When yt-dlp
// can't find a video, we scrape the HTML for embedded image data. Public
// image tweets may still expose their media URLs in the initial JSON.
async function extractTwitterImageUrls(tweetUrl: string): Promise<string[] | null> {
  try {
    const res = await fetch(tweetUrl, {
      headers: {
        "User-Agent": BROWSER_UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();
    const urls: string[] = [];

    // 1. Embedded Next.js / Hydration JSON with tweet data.
    //    Looks like "media_url_https":"https://pbs.twimg.com/media/..."
    const re = /"media_url_https"\s*:\s*"([^"]+)"/gi;
    for (const m of html.matchAll(re)) {
      const u = m[1].replace(/\\/g, "");
      if (/https:\/\/pbs\.twimg\.com\/media\/[^"]+\.(?:jpe?g|png|webp)(?:\?|$)/i.test(u)) urls.push(u);
    }

    // 2. JSON shapes like: "url":"https://pbs.twimg.com/media/...?format=jpg&name=..."
    const altRe = /"url"\s*:\s*"([^"]+)"/gi;
    for (const m of html.matchAll(altRe)) {
      const u = m[1].replace(/\\/g, "");
      if (/https:\/\/pbs\.twimg\.com\/media\/[^"]+\.(?:jpe?g|png|webp)(?:\?|$)/i.test(u)) urls.push(u);
    }

    // 3. Upgrade every URL to original quality and dedupe by media ID.
    const seen = new Set<string>();
    const upgraded: string[] = [];
    for (const raw of urls) {
      const u = new URL(raw);
      // Force original quality. name=orig is the highest native quality; for
      // PNG/WebP images name=orig still works, so it's safe as a default.
      u.searchParams.set("name", "orig");
      const mediaId = u.pathname.replace(/^.*\/media\//, "").split(".")[0];
      if (seen.has(mediaId)) continue;
      seen.add(mediaId);
      upgraded.push(u.toString());
    }

    if (upgraded.length > 0) return upgraded;

    // 4. og:image tag (last resort: usually the first image, lower res).
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (og && og[1]) return [og[1].replace(/&amp;/g, "&")];
    return null;
  } catch (e: any) {
    console.warn(`[auto:twitter] extractor threw:`, e?.message);
    return null;
  }
}

// ── Pinterest ────────────────────────────────────────────────────────────────
// Pinterest's pin pages embed the pin data in a JSON blob inside
// <script id="__PWS_INITIAL_PROPS__">. We parse that blob to extract ONLY the
// main pin image(s). This avoids grabbing related-pin thumbnails, and it lets
// us detect video pins so we can fall through to yt-dlp/Cobalt for video.
async function extractPinterestImageUrls(pinUrl: string): Promise<string[] | null> {
  try {
    const res = await fetch(pinUrl, {
      headers: { "User-Agent": BROWSER_UA, "Accept": "text/html,*/*" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();

    // 1. og:image is the most reliable signal for the MAIN pin image.
    //    Pinterest sets it to the highest-quality canonical image for the pin,
    //    so use it directly and avoid accidentally grabbing related-pin thumbs.
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (og && og[1]) {
      const ogUrl = og[1].replace(/&amp;/g, "&");
      if (/i\.pinimg\.com/i.test(ogUrl)) return [ogUrl];
    }

    // 2. Parse the Pinterest initial-props JSON if present.
    const propsMatch = html.match(/<script[^>]*id=["']__PWS_INITIAL_PROPS__["'][^>]*>([^]*?)<\/script>/i);
    if (propsMatch) {
      try {
        const props = JSON.parse(propsMatch[1].replace(/^\s*<!--\s*/, "").replace(/\s*-->\s*$/, ""));
        const pins: Record<string, any>[] = [];
        const walk = (obj: any) => {
          if (!obj || typeof obj !== "object") return;
          if (Array.isArray(obj)) {
            for (const item of obj) walk(item);
            return;
          }
          for (const [k, v] of Object.entries(obj)) {
            if (k === "images" && v && typeof v === "object" && !Array.isArray(v)) {
              const img = v as Record<string, any>;
              if (img.orig || img["1200x"] || img["736x"]) {
                pins.push(obj as Record<string, any>);
              }
            }
            if (typeof v === "object") walk(v);
          }
        };
        walk(props);

        if (pins.length > 0) {
          const urlId = pinUrl.match(/\/pin\/(\d+)/)?.[1];
          const pin = urlId
            ? pins.find((p) => p.id === urlId || p.entityId === urlId || p.nativePinId === urlId)
            : pins[0];

          const target = pin || pins[0];
          const images = target.images as Record<string, any>;
          const best = images?.orig?.url || images?.["1200x"]?.url || images?.["736x"]?.url;
          if (best) return [best];
        }
      } catch (e) {
        // JSON parse failed, fall through to regex below.
      }
    }

    // 3. If this is a video pin, don't return images — let the video path run.
    if (/"vimeoId"|"video_url"|"isPlayable"\s*:\s*true|"hasRequiredAttribution"[^}]*"video"|"video"\s*:\s*\{/.test(html)) {
      return null;
    }

    // 4. Fallback: pick the largest single i.pinimg.com image in the page.
    const re = /https:\/\/i\.pinimg\.com\/(?:originals|1200x|736x|564x|474x|236x)\/[^"\\\s]+\.(?:jpe?g|png|gif|webp)/gi;
    const matches = html.match(re) || [];
    const byHash = new Map<string, { url: string; size: number }>();
    for (const u of matches) {
      const hashKey = u.replace(/\/i\.pinimg\.com\/[^/]+\//, "").split("?")[0];
      const size = u.includes("/originals/") ? 5 : u.includes("/1200x/") ? 4 : u.includes("/736x/") ? 3 : u.includes("/564x/") ? 2 : 1;
      const prev = byHash.get(hashKey);
      if (!prev || size > prev.size) {
        const upgraded = u.replace(/\/i\.pinimg\.com\/[^/]+\//, "/i.pinimg.com/originals/");
        byHash.set(hashKey, { url: upgraded, size });
      }
    }
    const values = Array.from(byHash.values());
    if (values.length > 0) {
      // Return only the single largest image. Pinterest carousels are rare and
      // the current regex is too noisy to reliably return multi-slide ZIPs.
      values.sort((a, b) => b.size - a.size);
      return [values[0].url];
    }
    return null;
  } catch (e: any) {
    console.warn(`[auto:pinterest] extractor threw:`, e?.message);
    return null;
  }
}

// Run an "image-only" path: download N image URLs into workDir and return
// the resulting filenames so the existing streamSingle/streamZip code can
// take over. Returns [] on total failure.
async function downloadImagesToWorkDir(urls: string[], workDir: string, platform: string): Promise<string[]> {
  const downloaded: string[] = [];
  for (let i = 0; i < urls.length; i++) {
    const base = join(workDir, String(i + 1).padStart(2, "0"));
    try {
      const { ext } = await fetchImageToFile(urls[i], base);
      downloaded.push(`${String(i + 1).padStart(2, "0")}${ext}`);
    } catch (e: any) {
      console.warn(`[auto:${platform}] image ${i + 1} fetch failed:`, e?.message);
    }
  }
  return downloaded;
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

async function handleDownload(url: string): Promise<Response> {
  if (!isAllowedUrl(url)) {
    return new Response("Only Reddit, Twitter/X, Pinterest, and Threads URLs are supported here", { status: 400 });
  }

  const platform = platformPrefix(url);
  const id = randomUUID().slice(0, 8);
  const workDir = join(tmpdir(), `auto-${platform}-${id}`);
  await mkdir(workDir, { recursive: true });
  const cleanup = () => rm(workDir, { recursive: true, force: true }).catch(() => {});

  try {
    // Pinterest pins are a special case: the page often contains a short
    // animated preview that yt-dlp treats as a video, even for static image
    // pins. For Pinterest we try the image extractor FIRST so image pins get
    // their original JPG/PNG, then fall back to yt-dlp for video-only pins.
    if (platform === "pinterest") {
      const imageUrls = await extractPinterestImageUrls(url);
      if (imageUrls && imageUrls.length > 0) {
        const downloaded = await downloadImagesToWorkDir(imageUrls, workDir, platform);
        if (downloaded.length === 1) {
          return streamSingle(join(workDir, downloaded[0]), downloaded[0], platform, "image", cleanup);
        }
        if (downloaded.length > 1) {
          return streamZip(workDir, downloaded, platform, "album", cleanup);
        }
      }
      // Image extractor returned nothing → fall through to yt-dlp for video.
    }

    // Cobalt handles X/Twitter, Reddit, and Pinterest/Threads videos more
    // reliably than yt-dlp from a datacenter IP because Cobalt maintains its
    // own extractors and auth. Try it first for video-capable platforms.
    if (platform === "twitter" || platform === "reddit" || platform === "pinterest" || platform === "threads") {
      try {
        const cobalt = await resolveViaCobalt({ url, videoQuality: "1080" });
        if (cobalt) {
          const target = new URL(cobalt.url);
          if (!target.searchParams.has("filename") && cobalt.filename) {
            target.searchParams.set("filename", cobalt.filename);
          }
          return Response.redirect(target.toString(), 302);
        }
      } catch (e: any) {
        console.warn(`[auto:${platform}] cobalt attempt failed:`, e?.message?.slice(0, 200));
      }
    }

    // No -f flag → yt-dlp picks best available media for whatever the post
    // is. For video posts that means muxed best-video+best-audio (yt-dlp
    // runs ffmpeg internally). For image posts it dumps every image.
    //
    // We deliberately drop --no-playlist so Reddit galleries / Twitter
    // multi-image tweets / Threads carousels deliver every slide.
    const args = [
      url,
      // Pass cookies (IG/FB/X cookies in the same file) — see getGeneric…
      // doc in lib/ytdlp.ts. Big success-rate bump for X video posts and
      // for Reddit NSFW (which 401s anonymously).
      ...getGenericCookiesArgs(),
      "-o", join(workDir, "%(playlist_index|0)s-%(id)s.%(ext)s"),
      "--no-check-certificates",
      "--no-warnings",
      "--socket-timeout", "30",
      // Prefer mp4 container when remuxing isn't required, but don't force
      // it — Pinterest videos sometimes only ship as WebM.
      "--merge-output-format", "mp4",
    ];

    const { code, stderr } = await runYtDlp(args);

    // If yt-dlp failed AND this looks like an image-only post, fall back to
    // platform-specific direct extractors. yt-dlp's "Unsupported URL",
    // "No video formats", and X/Twitter's "No video could be found in this tweet"
    // errors are the canonical signals an image post tripped the video-centric
    // extractor; we silently retry with the image path before bailing.
    if (code !== 0) {
      const looksImageOnly = /unsupported url|no video formats|no video could be found/i.test(stderr);
      if (looksImageOnly || platform === "twitter") {
        let imageUrls: string[] | null = null;
        if (platform === "reddit") imageUrls = await extractRedditImageUrls(url);
        else if (platform === "pinterest") imageUrls = await extractPinterestImageUrls(url);
        else if (platform === "twitter") imageUrls = await extractTwitterImageUrls(url);

        if (imageUrls && imageUrls.length > 0) {
          const downloaded = await downloadImagesToWorkDir(imageUrls, workDir, platform);
          if (downloaded.length === 1) {
            return streamSingle(join(workDir, downloaded[0]), downloaded[0], platform, "image", cleanup);
          }
          if (downloaded.length > 1) {
            return streamZip(workDir, downloaded, platform, "album", cleanup);
          }
        }
      }
      console.warn(`[auto:${platform}] yt-dlp failed:`, stderr.slice(0, 400));
      cleanup();
      const privateMsg = /private|login|account|not.*available|requires.*authentication/i.test(stderr);
      const unsupportedMsg = /unsupported url|no video formats/i.test(stderr);

      if (platform === "reddit") {
        return new Response(
          "Reddit is blocking this server's IP. Reddit downloads need fresh Reddit session cookies in the MEDIA_COOKIES environment variable (Netscape format). Without cookies, both yt-dlp and the Reddit API return blocks from datacenter IPs.",
          { status: 502 },
        );
      }

      if (platform === "threads") {
        return new Response(
          "Threads is not currently downloadable. Neither yt-dlp nor the self-hosted Cobalt instance supports Threads URLs from this server.",
          { status: 502 },
        );
      }

      const friendly = privateMsg
        ? "This post is private, deleted, or requires login."
        : unsupportedMsg
        ? "This URL doesn't appear to contain downloadable media."
        : `Failed to fetch this ${platform} post.`;
      return new Response(friendly, { status: 502 });
    }

    const entries = await readdir(workDir);
    const videos = entries.filter((n) => VIDEO_EXT_RE.test(n)).sort();
    const images = entries.filter((n) => IMAGE_EXT_RE.test(n)).sort();

    // Prefer video when present — a video tweet that also has a thumbnail
    // image should clearly download as the video, not the cover frame.
    if (videos.length === 1) {
      return streamSingle(join(workDir, videos[0]), videos[0], platform, "video", cleanup);
    }
    if (videos.length > 1) {
      // Rare (only Reddit threads-style posts hit this). Zip them so the
      // user gets all of them rather than picking one and silently
      // dropping the others.
      return streamZip(workDir, videos, platform, "videos", cleanup);
    }
    if (images.length === 1) {
      return streamSingle(join(workDir, images[0]), images[0], platform, "image", cleanup);
    }
    if (images.length > 1) {
      return streamZip(workDir, images, platform, "album", cleanup);
    }

    cleanup();
    return new Response("No downloadable media found in this post.", { status: 422 });
  } catch (e: any) {
    console.error(`[auto:${platform}] handler error:`, e?.message);
    cleanup();
    return new Response("Failed to download this post", { status: 500 });
  }
}

async function streamSingle(
  path: string,
  originalName: string,
  platform: string,
  kind: "video" | "image",
  cleanup: () => void,
): Promise<Response> {
  const stats = await stat(path);
  const ext = (originalName.match(/\.[a-z0-9]+$/i)?.[0] || (kind === "video" ? ".mp4" : ".jpg")).toLowerCase();
  const friendlyName = kind === "video"
    ? `${platform}-video${ext}`
    : `${platform}-photo${ext}`;

  const mime = kind === "video"
    ? (ext === ".webm" ? "video/webm" : ext === ".mkv" ? "video/x-matroska" : "video/mp4")
    : (ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg");

  const node = createReadStream(path);
  const web = new ReadableStream<Uint8Array>({
    start(controller) {
      node.on("data", (c) => { try { controller.enqueue(new Uint8Array(c as Buffer)); } catch {} });
      node.on("end", () => { try { controller.close(); } catch {}; cleanup(); });
      node.on("error", () => { try { controller.close(); } catch {}; cleanup(); });
    },
    cancel() { node.destroy(); cleanup(); },
  });

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
  files: string[],
  platform: string,
  label: "album" | "videos",
  cleanup: () => void,
): Response {
  const archive = archiver("zip", { zlib: { level: 0 } });
  let lastError: Error | null = null;
  archive.on("error", (err) => { lastError = err; });
  archive.on("warning", (err) => console.warn(`[auto:${platform}] archiver warn:`, err.message));

  files.forEach((f, i) => {
    const ext = (f.match(/\.[a-z0-9]+$/i)?.[0] || ".bin").toLowerCase();
    const stem = label === "videos" ? "video" : "photo";
    archive.file(join(workDir, f), { name: `${stem}-${i + 1}${ext}` });
  });

  archive.finalize().catch((e) => {
    lastError = e;
    console.error(`[auto:${platform}] archive.finalize:`, e?.message);
  });

  const web = new ReadableStream<Uint8Array>({
    start(controller) {
      archive.on("data", (c: Buffer) => { try { controller.enqueue(new Uint8Array(c)); } catch {} });
      archive.on("end", () => {
        try { controller.close(); } catch {}
        cleanup();
        if (lastError) console.warn(`[auto:${platform}] zip ended after error:`, lastError.message);
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
      "Content-Disposition": `attachment; filename="${platform}-${label}.zip"`,
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
