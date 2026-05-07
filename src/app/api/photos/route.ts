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

function runYtDlpJson(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    proc.stdout?.on("data", (c: Buffer) => { stdout += c.toString(); });
    proc.stderr?.on("data", (c: Buffer) => { stderr += c.toString(); });
    proc.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
    proc.on("error", () => resolve({ code: 1, stdout, stderr }));
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
  console.log(`[photos:instagram] shortcode=${shortcode} mediaId=${mediaId} cookieCount=${cookieNames.length} hasSessionId=${cookieNames.includes("sessionid")}`);

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
      console.log(`[photos:instagram] ${apiUrl} -> ${res.status}`);
      if (!res.ok) continue;
      try { data = await res.json(); } catch { data = null; }
      if (data) break;
    } catch (e: any) {
      console.warn(`[photos:instagram] fetch ${apiUrl} threw:`, e?.message);
    }
  }

  const item = data?.items?.[0];
  if (!item) {
    console.warn(`[photos:instagram] no items[0] in API response`);
    return null;
  }

  const urls: string[] = [];
  // Carousel: items[0].carousel_media[] each with image_versions2.candidates[].url
  // Single image: items[0].image_versions2.candidates[].url
  // Video slides have video_versions[]; we skip those (image-only endpoint).
  const slides = Array.isArray(item.carousel_media) && item.carousel_media.length > 0
    ? item.carousel_media
    : [item];
  for (const s of slides) {
    if (Array.isArray(s.video_versions) && s.video_versions.length > 0) continue;
    const candidates = s?.image_versions2?.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      // First candidate is the highest-resolution version
      const top = candidates[0]?.url;
      if (typeof top === "string" && /^https?:\/\//.test(top)) urls.push(top);
    }
  }
  return urls;
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
        console.log(`[photos:instagram] private-API got ${igUrls.length} image(s)`);
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
