import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { createReadStream } from "fs";
import { mkdir, stat, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import archiver from "archiver";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getGenericCookiesArgs } from "@/lib/ytdlp";

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

async function fetchToFile(url: string, dest: string): Promise<{ ext: string }> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept": "image/avif,image/webp,image/png,image/jpeg,*/*",
    },
  });
  if (!res.ok || !res.body) throw new Error(`fetch ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  const ext = ct.includes("png") ? ".png"
    : ct.includes("webp") ? ".webp"
    : ct.includes("heic") ? ".heic"
    : ".jpg";
  const fs = await import("fs");
  const { Readable } = await import("stream");
  const { pipeline } = await import("stream/promises");
  await pipeline(
    Readable.fromWeb(res.body as any),
    fs.createWriteStream(dest + ext),
  );
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
    // Use -J (dump-single-json) instead of downloading. yt-dlp's Instagram
    // extractor errors with "No video formats found" on image-only posts when
    // asked to download, but its JSON metadata still includes display_url for
    // every slide. We then fetch those image URLs directly — bypasses the
    // video-format requirement entirely.
    // --ignore-no-formats-error: IG extractor still emits "No video formats"
    // for image-only posts even with -J. This flag downgrades that fatal
    // error to a warning so we still get the full JSON (with display_url
    // entries) on stdout.
    const args = [
      url,
      "-J",
      "--ignore-no-formats-error",
      ...getGenericCookiesArgs(),
      "--no-check-certificates",
      "--no-warnings",
      "--socket-timeout", "30",
    ];

    const { code, stdout, stderr } = await runYtDlpJson(args);

    // Even with --ignore-no-formats-error, some yt-dlp builds still set a
    // non-zero exit code while still emitting valid JSON on stdout. So we
    // try to parse stdout first; only fall through to the error response if
    // there's truly nothing usable.
    let meta: any = null;
    if (stdout.trim()) {
      try { meta = JSON.parse(stdout); } catch {}
    }
    if (!meta) {
      console.warn(`[photos:${platform}] yt-dlp -J failed (code=${code}):`, stderr.slice(0, 400));
      cleanup();
      const friendly = /private|login|account|not.*available/i.test(stderr)
        ? "This post is private, deleted, or requires login."
        : `Failed to fetch this ${platform} post.`;
      return new Response(friendly, { status: 502 });
    }

    const imageUrls = extractImageUrls(meta);
    if (imageUrls.length === 0) {
      // Log a compact summary so we can see what yt-dlp actually returned
      // when extraction comes up empty. This is critical for diagnosing
      // whether IG returned a video, an empty post, or an unfamiliar shape.
      const summary = {
        _type: meta?._type,
        ext: meta?.ext,
        has_display_url: !!meta?.display_url,
        has_url: !!meta?.url,
        has_thumbnail: !!meta?.thumbnail,
        thumbnails_count: Array.isArray(meta?.thumbnails) ? meta.thumbnails.length : 0,
        formats_count: Array.isArray(meta?.formats) ? meta.formats.length : 0,
        entries_count: Array.isArray(meta?.entries) ? meta.entries.length : 0,
        first_entry_keys: Array.isArray(meta?.entries) && meta.entries[0]
          ? Object.keys(meta.entries[0]).slice(0, 20)
          : [],
        first_entry_ext: meta?.entries?.[0]?.ext,
        title: typeof meta?.title === "string" ? meta.title.slice(0, 80) : undefined,
      };
      console.warn(`[photos:${platform}] no images extracted; meta summary:`, JSON.stringify(summary));
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
