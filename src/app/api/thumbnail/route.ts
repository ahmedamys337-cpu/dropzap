import { NextRequest } from "next/server";
import { execFile } from "child_process";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =============================================================================
// /api/thumbnail
//
// Generic "give me the cover image for this URL" endpoint, used by the per-
// platform Thumbnail Downloader sections (Instagram Reels, TikTok, Facebook,
// Twitter/X). yt-dlp already extracts a `thumbnail` URL as part of metadata
// for every supported platform, so we just:
//   1. ask yt-dlp for the URL with `--print "%(thumbnail)s"`
//   2. fetch the image server-side (avoids any CORS / CDN-token issues a
//      direct browser request would hit)
//   3. stream it back as an attachment so clicking the download button
//      saves a real file rather than navigating to the image
// =============================================================================

// Domains we accept. Anything else gets a 400 — we don't want to be a free
// generic yt-dlp gateway, this is just for thumbnail extraction on the
// platforms our own UI exposes.
const ALLOWED_DOMAINS = [
  /(^|\.)instagram\.com$/i,
  /(^|\.)tiktok\.com$/i,
  /(^|\.)facebook\.com$/i,
  /(^|\.)fb\.watch$/i,
  /(^|\.)twitter\.com$/i,
  /(^|\.)x\.com$/i,
];

function isAllowedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ALLOWED_DOMAINS.some((re) => re.test(u.hostname));
  } catch {
    return false;
  }
}

function platformPrefix(url: string): string {
  try {
    const h = new URL(url).hostname;
    if (/instagram\.com$/i.test(h)) return "instagram";
    if (/tiktok\.com$/i.test(h)) return "tiktok";
    if (/facebook\.com$|fb\.watch$/i.test(h)) return "facebook";
    if (/twitter\.com$|x\.com$/i.test(h)) return "twitter";
  } catch {}
  return "thumbnail";
}

function runYtDlpPrint(url: string, field: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    execFile(
      "yt-dlp",
      [
        url,
        "--print", `%(${field})s`,
        "--no-warnings",
        "--no-check-certificates",
        "--no-playlist",
        "--skip-download",
        "--socket-timeout", "20",
      ],
      { timeout: 25000, maxBuffer: 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          resolve({ stdout: stdout?.toString() || "", stderr: stderr?.toString() || err.message, code: 1 });
        } else {
          resolve({ stdout: stdout?.toString() || "", stderr: stderr?.toString() || "", code: 0 });
        }
      }
    );
  });
}

async function handle(url: string): Promise<Response> {
  if (!isAllowedUrl(url)) {
    return new Response("Only Instagram, TikTok, Facebook, and Twitter/X URLs are supported here", { status: 400 });
  }

  // Ask yt-dlp for the thumbnail URL. yt-dlp picks the highest-resolution
  // thumbnail variant per platform automatically.
  const t0 = Date.now();
  const { stdout, stderr, code } = await runYtDlpPrint(url, "thumbnail");
  const thumbUrl = stdout.split("\n").map((s) => s.trim()).find((s) => /^https?:\/\//.test(s));

  if (code !== 0 || !thumbUrl) {
    console.warn("[thumbnail] yt-dlp failed:", stderr.slice(0, 300));
    const friendly = /private|login|account|not.*available|404/i.test(stderr)
      ? "This post is private, deleted, or unavailable."
      : "Couldn't fetch thumbnail for this URL.";
    return new Response(friendly, { status: 502 });
  }
  console.log(`[thumbnail] resolved in ${Date.now() - t0}ms -> ${thumbUrl.slice(0, 90)}…`);

  // Server-side fetch of the actual bytes. We don't redirect because some
  // CDNs block hot-linked downloads or strip Content-Disposition; pulling
  // the bytes ourselves guarantees the browser saves a clean .jpg.
  let imgRes: Response;
  try {
    imgRes = await fetch(thumbUrl, {
      // Most platform CDNs accept anonymous GETs but reject default fetch
      // user-agents. A browsery UA defuses that without needing cookies.
      headers: { "User-Agent": "Mozilla/5.0 dropzap-thumbnail/1.0" },
    });
  } catch (e: any) {
    console.warn("[thumbnail] fetch failed:", e?.message);
    return new Response("Couldn't fetch thumbnail image", { status: 502 });
  }
  if (!imgRes.ok || !imgRes.body) {
    console.warn(`[thumbnail] CDN returned ${imgRes.status}`);
    return new Response(`Thumbnail CDN returned ${imgRes.status}`, { status: 502 });
  }

  // Pick a sensible filename + mime. Most platform thumbnails are JPEG;
  // TikTok occasionally serves WebP. Trust the response Content-Type when
  // present, fall back to jpeg.
  const platform = platformPrefix(url);
  const ct = imgRes.headers.get("content-type") || "image/jpeg";
  const ext = ct.includes("png") ? "png"
    : ct.includes("webp") ? "webp"
    : "jpg";
  const filename = `${platform}-thumbnail.${ext}`;

  const headers = new Headers();
  headers.set("Content-Type", ct);
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  headers.set("Cache-Control", "no-store");
  // Forward Content-Length when the CDN sent one so the browser can show
  // a real progress bar; for small thumbnails this is almost always set.
  const len = imgRes.headers.get("content-length");
  if (len) headers.set("Content-Length", len);

  return new Response(imgRes.body, { status: 200, headers });
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.success) {
    return new Response(`Rate limited. Try again in ${limit.retryAfter}s`, { status: 429 });
  }
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return new Response("URL is required", { status: 400 });
  return handle(url);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.success) {
    return new Response(`Rate limited. Try again in ${limit.retryAfter}s`, { status: 429 });
  }
  const body = await request.json().catch(() => ({} as any));
  const url = body?.url;
  if (!url) return new Response("URL is required", { status: 400 });
  return handle(url);
}
