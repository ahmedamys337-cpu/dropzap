import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { createReadStream } from "fs";
import { stat, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import {
  getGenericCookiesArgs,
  getProxyArgs,
} from "@/lib/ytdlp";
import { resolveViaCobalt } from "@/lib/cobalt";
import { fetchInstagramVideoUrl } from "@/lib/instagram";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { withConcurrencyLimit } from "@/lib/concurrency";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Allowed platforms for security / abuse prevention.
const ALLOWED_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "tiktok.com",
  "www.tiktok.com",
  "vm.tiktok.com",
  "twitter.com",
  "x.com",
  "www.twitter.com",
  "www.x.com",
  "facebook.com",
  "www.facebook.com",
  "fb.watch",
  "reddit.com",
  "www.reddit.com",
  "pinterest.com",
  "www.pinterest.com",
  "threads.net",
  "www.threads.net",
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "m.youtube.com",
]);

function isAllowedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return ALLOWED_HOSTS.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function contentDispositionHeader(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "");
  const utf8 = encodeURIComponent(filename);
  return `attachment; filename="${ascii || "download"}"; filename*=UTF-8''${utf8}`;
}

// Run yt-dlp to download into a temp file. We deliberately avoid streaming
// directly to stdout because piping forces fragmented-mp4 output (so the
// muxer never has to seek back), and fragmented-mp4 with VP9/AV1 (which is
// what YouTube ships at >1080p) does not play in many consumer players —
// the audio decodes but the video track shows nothing. Writing to a real
// file lets ffmpeg produce a regular, seekable mp4 with a proper moov atom
// that plays everywhere AND lets us return a real Content-Length so the
// browser's download UI shows percentage / total size.
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

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.success) {
    return new Response(`Rate limited. Try again in ${limit.retryAfter}s`, { status: 429 });
  }

  const url = request.nextUrl.searchParams.get("url");
  const format = request.nextUrl.searchParams.get("f") || "best";
  const heightParam = request.nextUrl.searchParams.get("h");
  const filename = request.nextUrl.searchParams.get("name") || "download.mp4";
  const audio = request.nextUrl.searchParams.get("audio") === "1";

  if (!url) {
    return new Response("URL required", { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return new Response("URL not supported. Please paste a link from Instagram, TikTok, Twitter/X, Facebook, Reddit, Pinterest, Threads, or YouTube.", { status: 400 });
  }

  const isYoutube = /youtu(?:\.be|be\.com)/i.test(url);
  if (isYoutube) {
    return new Response("YouTube video downloads are disabled.", { status: 400 });
  }

  const isInstagram = (() => { try { return /(?:^|\.)instagram\.com$/i.test(new URL(url).hostname); } catch { return false; } })();

  // ---------- format selector ----------
  let fmtArg: string;
  if (audio) {
    fmtArg = "bestaudio/best";
  } else if (heightParam && /^\d+$/.test(heightParam)) {
    // Cap at 1080p. YouTube offers H.264 (avc1) up to 1080p which muxes
    // cleanly into (fragmented) mp4 and plays everywhere. We hard-prefer
    // avc1 so the streaming merge never ends up with VP9/AV1 (which would
    // produce silent-video files on many players).
    const h = Math.min(1080, parseInt(heightParam, 10));
    fmtArg =
      `bv*[height<=${h}][vcodec^=avc1]+ba[ext=m4a]/` +
      `bv*[height<=${h}][ext=mp4]+ba[ext=m4a]/` +
      `bv*[height<=${h}]+ba[ext=m4a]/` +
      `bv*[height<=${h}]+ba/` +
      `b[height<=${h}][ext=mp4]/` +
      `b[height<=${h}]/best`;
  } else if (format !== "best") {
    fmtArg = `${format}+ba[ext=m4a]/${format}+ba/${format}/best[ext=mp4]/best`;
  } else {
    // Generic non-YouTube default (Instagram, TikTok, Facebook…). Every
    // rung MUST require a real video codec — Instagram exposes audio-only
    // mp4a tracks that match best[ext=mp4] and produce silent-video files.
    fmtArg =
      "bv*[vcodec!=none]+ba[acodec!=none]/" +
      "b[vcodec!=none][acodec!=none]/" +
      "best[vcodec!=none][ext=mp4]/" +
      "best[vcodec!=none]";
  }

  const ext = audio ? "mp3" : "mp4";
  const safeName =
    filename.replace(/[^\w\s.-]/g, "").trim() || `download.${ext}`;

  // =========================================================================
  // INSTAGRAM PATH — hybrid fallback chain
  //
  // 1. cobalt.tools (fastest when it works; keeps the server's IP away from
  //    Instagram's anti-bot systems).
  // 2. Instagram's own private mobile API / public JSON / web scrape. This uses
  //    the same extraction logic as /api/photos and often succeeds for public
  //    posts even when yt-dlp is blocked on datacenter IPs.
  // 3. yt-dlp with cookies (last resort).
  //
  // We proxy the bytes through our server so the client-side fetch()+blob flow
  // works without CORS issues.
  // =========================================================================
  if (isInstagram) {
    try {
      const igCobalt = await resolveViaCobalt({ url, audio });
      if (igCobalt) {
        const proxyRes = await fetch(igCobalt.url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; Dropzap/1.0)" },
          signal: AbortSignal.timeout(30000),
        });
        if (proxyRes.ok && proxyRes.body) {
          const ct = proxyRes.headers.get("Content-Type") || (audio ? "audio/mpeg" : "video/mp4");
          const cl = proxyRes.headers.get("Content-Length");
          const headers: Record<string, string> = {
            "Content-Type": ct,
            "Content-Disposition": contentDispositionHeader(safeName),
            "Cache-Control": "no-store",
          };
          if (cl) headers["Content-Length"] = cl;
          return new Response(proxyRes.body, { status: 200, headers });
        }
      }
    } catch (e: any) {
      // Silently fall through; no need to log in production.
    }

    // Fallback 2: Instagram's own API / public JSON / web scrape.
    // Audio-only Instagram is not a real thing, so skip this for audio requests.
    if (!audio) {
      try {
        const t0 = Date.now();
        const igVideoUrl = await fetchInstagramVideoUrl(url);
        if (igVideoUrl) {
          const proxyRes = await fetch(igVideoUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
              "Accept": "video/webm,video/mp4,video/*,*/*",
              "Referer": "https://www.instagram.com/",
            },
            signal: AbortSignal.timeout(30000),
          });
          if (proxyRes.ok && proxyRes.body) {
            const ct = proxyRes.headers.get("Content-Type") || "video/mp4";
            const cl = proxyRes.headers.get("Content-Length");
            const headers: Record<string, string> = {
              "Content-Type": ct,
              "Content-Disposition": contentDispositionHeader(safeName),
              "Cache-Control": "no-store",
            };
            if (cl) headers["Content-Length"] = cl;
            return new Response(proxyRes.body, { status: 200, headers });
          }
        }
      } catch {
        // Fall through to yt-dlp.
      }
    }
  }

  // =========================================================================
  // FACEBOOK PATH — cobalt.tools first
  // Facebook video posts now require login cookies on almost every request
  // from datacenter IPs. Cobalt maintains its own Facebook session handling,
  // so try it before falling through to the yt-dlp temp-file path.
  // =========================================================================
  const isFacebook = (() => { try { return /(?:^|\.)facebook\.com$/i.test(new URL(url).hostname) || /^https?:\/\/fb\.watch/i.test(url); } catch { return false; } })();
  if (isFacebook) {
    try {
      const fbCobalt = await resolveViaCobalt({ url, audio, videoQuality: "1080" });
      if (fbCobalt) {
        const proxyRes = await fetch(fbCobalt.url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; Dropzap/1.0)" },
          signal: AbortSignal.timeout(30000),
        });
        if (proxyRes.ok && proxyRes.body) {
          const ct = proxyRes.headers.get("Content-Type") || (audio ? "audio/mpeg" : "video/mp4");
          const cl = proxyRes.headers.get("Content-Length");
          const headers: Record<string, string> = {
            "Content-Type": ct,
            "Content-Disposition": contentDispositionHeader(safeName),
            "Cache-Control": "no-store",
          };
          if (cl) headers["Content-Length"] = cl;
          return new Response(proxyRes.body, { status: 200, headers });
        }
      }
    } catch {
      // Fall through to yt-dlp.
    }
  }

  // =========================================================================
  // UNIFIED TEMP-FILE PATH
  // Why not stream directly to the client? Because yt-dlp has to download
  // BOTH the video-only and audio-only DASH streams fully before it can
  // merge them — so "piping to stdout" still buffers both files completely
  // before any byte reaches the browser. The user ends up staring at a
  // yellow spinner for 2-5 minutes with no feedback.
  //
  // Instead we download to a temp file in parallel (concurrent-fragments),
  // which is 3-5× faster than the serial DASH download yt-dlp does by
  // default. Then we stream the finished file with a real Content-Length so
  // the browser shows accurate MB/percentage. The file is a regular
  // seekable mp4 (not fragmented) that plays in every player.
  // =========================================================================
  const id = randomUUID().slice(0, 8);
  const tempBase = join(tmpdir(), `dl-${id}`);
  const tempTemplate = `${tempBase}.%(ext)s`;
  const expectedFinal = `${tempBase}.${ext}`;

  try {
    const result = await withConcurrencyLimit(async () => {
    const args: string[] = [
      url,
      ...getProxyArgs(),
      ...getGenericCookiesArgs(),
      "-o", tempTemplate,
      "--no-check-certificates",
      "--no-warnings",
      "--no-playlist",
      "--no-part",
      "--socket-timeout", "30",
      // Download 8 DASH fragments in parallel to speed up platforms that
      // deliver video and audio as fragmented streams.
      "--concurrent-fragments", "8",
      "-f", fmtArg,
    ];

    if (audio) {
      args.push(
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "2",
      );
    } else {
      // Regular seekable mp4 (NOT fragmented) — ffmpeg can seek back to
      // write a proper moov atom, so the file plays in every player
      // including Windows default ones.
      args.push("--merge-output-format", "mp4");
    }

    let { code, stderr } = await runYtDlp(args);

    // Instagram: if cookies are configured but the request fails, try once
    // without them. Stale or region-locked cookies can cause 400 Bad Request
    // while the same request anonymously may succeed (or fail with a clearer
    // error that tells us the post is genuinely private/login-required).
    if (code !== 0 && isInstagram && getGenericCookiesArgs().length > 0) {
      const argsNoCookies = args.filter((a, i) => !(a === "--cookies" || (i > 0 && args[i - 1] === "--cookies")));
      ({ code, stderr } = await runYtDlp(argsNoCookies));
    }

    if (code !== 0) {
      unlink(expectedFinal).catch(() => {});
      // Map common yt-dlp errors to user-friendly messages.
      let friendlyMsg: string;
      if (/empty media response/i.test(stderr)) {
        friendlyMsg = isInstagram
          ? "Instagram requires login cookies to download this content. Set MEDIA_COOKIES in your Render environment variables with your Instagram session cookies (Netscape format)."
          : "The platform returned an empty response. The content may be private or restricted.";
      } else if (/This content is only available for registered users who follow this account/i.test(stderr)) {
        friendlyMsg = "This Instagram post is from a private account. Only followers can download private content. Ask the account owner to make the post public, or download it directly from the Instagram app.";
      } else if (/private|login required|sign.?in|not accessible|authentication required|not.*available.*login/i.test(stderr)) {
        friendlyMsg = isInstagram
          ? "Instagram is requiring login for this post from the server. If it's a public post, add Instagram session cookies to the MEDIA_COOKIES or MEDIA_COOKIES_INSTAGRAM environment variable. If it's private, it can't be downloaded."
          : "This post is private or requires login to download.";
      } else if (/not available|has been removed|no longer available|unavailable/i.test(stderr)) {
        friendlyMsg = "This content is no longer available or has been removed.";
      } else if (/HTTP Error 400|400 Bad Request|Bad Request/i.test(stderr)) {
        friendlyMsg = isInstagram
          ? "Instagram rejected the request (400 Bad Request). Your cookies may be stale, or this post is private. Try refreshing your Instagram cookies, or use the Photos & Carousel downloader if this is a photo post."
          : "The platform rejected the request (400 Bad Request).";
      } else if (/unsupported url|unable to extract|no video formats/i.test(stderr)) {
        friendlyMsg = "This URL type is not supported. Please paste a direct post or reel link.";
      } else if (/timeout/i.test(stderr)) {
        friendlyMsg = "Download timed out. The server is busy — please try again in a moment.";
      } else {
        const rawErr = stderr.split("\n").find((l) => l.includes("ERROR")) || "Download failed";
        friendlyMsg = rawErr.length > 250 ? rawErr.slice(0, 250) + "\u2026" : rawErr;
      }
      return new Response(friendlyMsg, { status: 500 });
    }

    // Resolve the file yt-dlp actually produced
    let finalPath = expectedFinal;
    let stats;
    try {
      stats = await stat(finalPath);
    } catch {
      const alternates = audio
        ? [`${tempBase}.m4a`, `${tempBase}.opus`, `${tempBase}.webm`]
        : [`${tempBase}.webm`, `${tempBase}.mkv`];
      for (const p of alternates) {
        try { stats = await stat(p); finalPath = p; break; } catch {}
      }
    }
    if (!stats) {
      return new Response("Download failed: output file missing", { status: 500 });
    }

    const fileSize = stats.size;
    const nodeStream = createReadStream(finalPath);
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => {
          try { controller.enqueue(new Uint8Array(chunk as Buffer)); } catch {}
        });
        nodeStream.on("end", () => {
          try { controller.close(); } catch {}
          unlink(finalPath).catch(() => {});
        });
        nodeStream.on("error", () => {
          try { controller.close(); } catch {}
          unlink(finalPath).catch(() => {});
        });
      },
      cancel() {
        nodeStream.destroy();
        unlink(finalPath).catch(() => {});
      },
    });

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": audio ? "audio/mpeg" : "video/mp4",
        "Content-Disposition": contentDispositionHeader(safeName),
        "Content-Length": fileSize.toString(),
        "Cache-Control": "no-store",
      },
    });
    });
    return result;
  } catch (err: any) {
    // Cleanup any temp files that may have been created.
    const cleanups = [expectedFinal, `${tempBase}.m4a`, `${tempBase}.opus`, `${tempBase}.webm`, `${tempBase}.mkv`];
    await Promise.all(cleanups.map((p) => unlink(p).catch(() => {})));
    return new Response("Download failed: " + (err.message || "Unknown error"), { status: 500 });
  }
}
