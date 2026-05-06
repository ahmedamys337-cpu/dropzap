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
// /api/instagram/photos
// Downloads still-image content from an Instagram URL:
//   • Single-image post (`instagram.com/p/...`) → returns the JPG directly.
//   • Multi-image carousel              → zips every slide and returns a .zip.
//
// We deliberately keep this separate from /api/stream because that endpoint is
// video-centric (selects best mp4 + audio, runs ffmpeg). For photos we want a
// raw passthrough — yt-dlp downloads each image, we either stream the lone
// file back or pipe a zip through archiver. No ffmpeg, no transcoding.
// =============================================================================

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

// Filter to actual image files yt-dlp produced. Instagram carousels can mix
// videos + photos in the same post (a "mixed carousel"); we hand off video
// slides to the video endpoint by simply ignoring them here, which means
// users get the photos and a hint to use the Reels tab for the video portion.
const IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|heic|heif)$/i;

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

// GET form lets the browser kick off the download via a plain <a download>
// link (same trigger pattern as /api/stream uses for videos). The query
// param mirrors the POST body so we can share validation logic.
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
  // Validate the URL is plausibly Instagram. Don't let arbitrary URLs through
  // — we'd just be a free yt-dlp gateway for the world.
  if (!/^https?:\/\/(www\.)?instagram\.com\//i.test(url)) {
    return new Response("Only Instagram URLs are supported", { status: 400 });
  }

  const id = randomUUID().slice(0, 8);
  const workDir = join(tmpdir(), `igphotos-${id}`);
  await mkdir(workDir, { recursive: true });

  const cleanup = () => rm(workDir, { recursive: true, force: true }).catch(() => {});

  try {
    // yt-dlp output template puts each carousel slide in its own file. We
    // request the highest-quality variant Instagram exposes; for stills
    // that is typically the original JPG (no transcoded copy exists).
    const args = [
      url,
      "-o", join(workDir, "%(playlist_index)s-%(id)s.%(ext)s"),
      "--no-check-certificates",
      "--no-warnings",
      "--no-playlist", // single post / carousel only, never the user's whole grid
      "--socket-timeout", "30",
    ];

    const { code, stderr } = await runYtDlp(args);
    if (code !== 0) {
      console.warn("[ig-photos] yt-dlp failed:", stderr.slice(0, 400));
      cleanup();
      const friendly = /private|login|account|not.*available/i.test(stderr)
        ? "This post is private, deleted, or requires login."
        : "Failed to fetch this Instagram post.";
      return new Response(friendly, { status: 502 });
    }

    // Collect image files from the work dir. Carousels with mixed photos +
    // videos will dump both; we keep only images so the download is a clean
    // photo-pack and direct the user to the Reels tab for any video slides.
    const entries = await readdir(workDir);
    const images = entries
      .filter((name) => IMAGE_EXT_RE.test(name))
      .sort(); // playlist_index prefix keeps slide order
    const videos = entries.filter((name) => /\.mp4$/i.test(name));

    if (images.length === 0) {
      cleanup();
      // Tell the user clearly when there's nothing for this tab to download.
      const msg = videos.length > 0
        ? "This post contains only video. Use the Reels & Videos tab instead."
        : "No images found in this post.";
      return new Response(msg, { status: 422 });
    }

    // Single-image: pipe the file straight back, no zip.
    if (images.length === 1) {
      return streamSingleImage(join(workDir, images[0]), images[0], cleanup);
    }

    // Multi-image carousel: build a zip on the fly.
    return streamZip(workDir, images, cleanup);

  } catch (e: any) {
    console.error("[ig-photos] handler error:", e?.message);
    cleanup();
    return new Response("Failed to download photos", { status: 500 });
  }
}

// ---------- streaming helpers --------------------------------------------

async function streamSingleImage(path: string, originalName: string, cleanup: () => void): Promise<Response> {
  const stats = await stat(path);
  const ext = (originalName.match(/\.[a-z0-9]+$/i)?.[0] || ".jpg").toLowerCase();
  const friendlyName = `instagram-photo${ext}`;

  const node = createReadStream(path);
  const web = new ReadableStream<Uint8Array>({
    start(controller) {
      node.on("data", (c) => {
        try { controller.enqueue(new Uint8Array(c as Buffer)); } catch {}
      });
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

function streamZip(workDir: string, images: string[], cleanup: () => void): Response {
  const archive = archiver("zip", { zlib: { level: 0 } }); // STORE only — JPEGs don't compress, save CPU
  let lastError: Error | null = null;
  archive.on("error", (err) => { lastError = err; });
  archive.on("warning", (err) => console.warn("[ig-photos] archiver warn:", err.message));

  // Append every image with a clean sequential name so the user sees
  // photo-1.jpg / photo-2.jpg in their unzipped folder rather than the
  // gnarly playlist_index-id originals.
  images.forEach((img, i) => {
    const ext = (img.match(/\.[a-z0-9]+$/i)?.[0] || ".jpg").toLowerCase();
    archive.file(join(workDir, img), { name: `photo-${i + 1}${ext}` });
  });

  // Kick off finalize (no Content-Length: zip is generated on the fly).
  archive.finalize().catch((e) => {
    lastError = e;
    console.error("[ig-photos] archive.finalize:", e?.message);
  });

  const web = new ReadableStream<Uint8Array>({
    start(controller) {
      archive.on("data", (c: Buffer) => {
        try { controller.enqueue(new Uint8Array(c)); } catch {}
      });
      archive.on("end", () => {
        try { controller.close(); } catch {}
        cleanup();
        if (lastError) console.warn("[ig-photos] zip ended with prior error:", lastError.message);
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
      "Content-Disposition": `attachment; filename="instagram-photos.zip"`,
      "Cache-Control": "no-store",
      // No Content-Length — zip stream is generated on the fly.
      "X-Accel-Buffering": "no",
    },
  });
}
