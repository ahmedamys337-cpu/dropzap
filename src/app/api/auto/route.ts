import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { createReadStream } from "fs";
import { mkdir, readdir, stat, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import archiver from "archiver";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    // No -f flag → yt-dlp picks best available media for whatever the post
    // is. For video posts that means muxed best-video+best-audio (yt-dlp
    // runs ffmpeg internally). For image posts it dumps every image.
    //
    // We deliberately drop --no-playlist so Reddit galleries / Twitter
    // multi-image tweets / Threads carousels deliver every slide.
    const args = [
      url,
      "-o", join(workDir, "%(playlist_index|0)s-%(id)s.%(ext)s"),
      "--no-check-certificates",
      "--no-warnings",
      "--socket-timeout", "30",
      // Prefer mp4 container when remuxing isn't required, but don't force
      // it — Pinterest videos sometimes only ship as WebM.
      "--merge-output-format", "mp4",
    ];

    const { code, stderr } = await runYtDlp(args);
    if (code !== 0) {
      console.warn(`[auto:${platform}] yt-dlp failed:`, stderr.slice(0, 400));
      cleanup();
      const friendly = /private|login|account|not.*available|requires.*authentication/i.test(stderr)
        ? "This post is private, deleted, or requires login."
        : /unsupported url|no video formats/i.test(stderr)
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
