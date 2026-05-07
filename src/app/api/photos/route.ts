import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { createReadStream } from "fs";
import { mkdir, readdir, stat, rm } from "fs/promises";
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

function runYtDlp(args: string[]): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr?.on("data", (c: Buffer) => { stderr += c.toString(); });
    proc.stdout?.on("data", () => {});
    proc.on("close", (code) => resolve({ code: code ?? 1, stderr }));
    proc.on("error", () => resolve({ code: 1, stderr }));
  });
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
    // playlist_index in the template gives us a stable slide ordering for
    // carousels. --no-playlist keeps us from accidentally following profile
    // listings; for albums yt-dlp still follows the in-post slide list.
    //
    // getGenericCookiesArgs() injects --cookies <file> when YOUTUBE_COOKIES
    // env var is set. Despite the name, the cookies file can hold IG/FB
    // cookies alongside YouTube's; yt-dlp filters by domain. Without
    // cookies, Instagram returns 401 / "login required" for many posts —
    // those failures are the most common cause of the user-visible
    // "Site wasn't available" download error.
    const args = [
      url,
      ...getGenericCookiesArgs(),
      "-o", join(workDir, "%(playlist_index)s-%(id)s.%(ext)s"),
      "--no-check-certificates",
      "--no-warnings",
      "--no-playlist",
      "--socket-timeout", "30",
    ];

    const { code, stderr } = await runYtDlp(args);
    if (code !== 0) {
      console.warn(`[photos:${platform}] yt-dlp failed:`, stderr.slice(0, 400));
      cleanup();
      const friendly = /private|login|account|not.*available/i.test(stderr)
        ? "This post is private, deleted, or requires login."
        : `Failed to fetch this ${platform} post.`;
      return new Response(friendly, { status: 502 });
    }

    const entries = await readdir(workDir);
    const images = entries.filter((n) => IMAGE_EXT_RE.test(n)).sort();
    const videos = entries.filter((n) => /\.mp4$/i.test(n));

    if (images.length === 0) {
      cleanup();
      const msg = videos.length > 0
        ? `This post contains only video. Use the ${platform === "instagram" ? "Reel" : "Video"} downloader instead.`
        : "No images found in this post.";
      return new Response(msg, { status: 422 });
    }

    if (images.length === 1) {
      return streamSingleImage(join(workDir, images[0]), images[0], platform, cleanup);
    }
    return streamZip(workDir, images, platform, cleanup);
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
