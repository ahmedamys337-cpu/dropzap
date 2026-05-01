import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const execFileAsync = promisify(execFile);

/**
 * Generic media probe for social posts (Instagram, Facebook, Pinterest,
 * Threads). Uses yt-dlp's single-JSON dump to figure out whether the URL is
 * a video, an image, or a carousel of multiple items, and returns a normalized
 * list the client can render and download per-item.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface MediaItem {
  type: "video" | "image";
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  ext?: string;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.success) {
    return NextResponse.json(
      { error: `Rate limited. Try again in ${limit.retryAfter}s` },
      { status: 429 },
    );
  }

  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const args = [
      url,
      "--dump-single-json",
      "--no-check-certificates",
      "--no-warnings",
      "--skip-download",
      // For IG/FB/Pinterest carousels we WANT the playlist output (all items);
      // yt-dlp already returns _type=playlist with entries when appropriate.
    ];

    const { stdout } = await execFileAsync("yt-dlp", args, {
      timeout: 45000,
      maxBuffer: 20 * 1024 * 1024,
    });

    const info = JSON.parse(stdout);
    const title: string = info.title || info.fulltitle || "";
    const platform: string = info.extractor_key || info.extractor || "unknown";

    const items: MediaItem[] = [];

    if (info._type === "playlist" && Array.isArray(info.entries)) {
      for (const entry of info.entries) {
        const item = normalizeEntry(entry);
        if (item) items.push(item);
      }
    } else {
      const item = normalizeEntry(info);
      if (item) items.push(item);
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No downloadable media found at that URL." },
        { status: 404 },
      );
    }

    return NextResponse.json({ title, platform, items });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "Media probe failed";
    // yt-dlp writes rich error context to stderr; surface the most useful bit
    const stderr = (err?.stderr || "").toString();
    const hint = stderr.includes("login required") || stderr.includes("private")
      ? "This post is private or requires login."
      : stderr.includes("Unsupported URL")
        ? "This platform or URL is not supported yet."
        : "Could not fetch media from that URL.";
    console.error("Media info error:", msg, stderr.slice(0, 500));
    return NextResponse.json({ error: hint }, { status: 500 });
  }
}

/**
 * Collapse a yt-dlp info object (single video/image or a carousel entry) into
 * a MediaItem. Returns null if nothing usable was found.
 */
function normalizeEntry(info: any): MediaItem | null {
  if (!info || typeof info !== "object") return null;

  const formats: any[] = Array.isArray(info.formats) ? info.formats : [];

  // Prefer an actual video format with both video + audio or at least video.
  const videoFormats = formats.filter(
    (f) => f && typeof f.url === "string" && f.vcodec && f.vcodec !== "none",
  );
  if (videoFormats.length > 0) {
    // Pick the highest-resolution video format yt-dlp found.
    const best = videoFormats.reduce((a, b) =>
      (b.height || 0) > (a.height || 0) ? b : a,
    );
    return {
      type: "video",
      url: best.url,
      thumbnail: info.thumbnail,
      width: best.width || info.width,
      height: best.height || info.height,
      ext: best.ext || "mp4",
    };
  }

  // Otherwise look for an image — yt-dlp sometimes exposes image URLs as the
  // top-level `url`, or in a thumbnails array, or as ext=jpg formats.
  const imageFormat = formats.find(
    (f) =>
      f &&
      typeof f.url === "string" &&
      (f.vcodec === "none" || !f.vcodec) &&
      (f.ext === "jpg" || f.ext === "jpeg" || f.ext === "png" || f.ext === "webp"),
  );
  if (imageFormat) {
    return {
      type: "image",
      url: imageFormat.url,
      width: imageFormat.width || info.width,
      height: imageFormat.height || info.height,
      ext: imageFormat.ext || "jpg",
    };
  }

  const directUrl = typeof info.url === "string" ? info.url : undefined;
  const looksLikeImage =
    directUrl && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(directUrl);
  if (looksLikeImage) {
    return {
      type: "image",
      url: directUrl!,
      width: info.width,
      height: info.height,
      ext: info.ext && info.ext !== "unknown" ? info.ext : "jpg",
    };
  }

  // Last resort: treat the best available thumbnail as the media
  const thumbnails: any[] = Array.isArray(info.thumbnails) ? info.thumbnails : [];
  if (thumbnails.length > 0) {
    const best = thumbnails.reduce((a, b) =>
      (b.width || 0) * (b.height || 0) > (a.width || 0) * (a.height || 0) ? b : a,
    );
    if (best?.url) {
      return {
        type: "image",
        url: best.url,
        width: best.width,
        height: best.height,
        ext: "jpg",
      };
    }
  }
  return null;
}
