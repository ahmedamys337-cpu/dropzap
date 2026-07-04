import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { createReadStream } from "fs";
import { stat, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import {
  getYoutubeStreamAuthArgs,
  getVideoInfo,
  pickYoutubeFormats,
  HAS_YOUTUBE_PROXY,
  getYoutubeProxyUrl,
  type PickedFormat,
} from "@/lib/ytdlp";
import { resolveViaCobalt, isCobaltConfigured } from "@/lib/cobalt";
import { getGenericCookiesArgs } from "@/lib/ytdlp";
import { fetchInstagramVideoUrl } from "@/lib/instagram";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

// Format the http_headers from yt-dlp into the single-blob string ffmpeg's
// -headers option expects. ffmpeg auto-supplies User-Agent if missing, so a
// missing http_headers field is fine.
function ffmpegHeaderBlob(h?: Record<string, string>): string {
  if (!h) return "";
  return Object.entries(h)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\r\n") + "\r\n";
}

// Live-streaming muxer. Pipes ffmpeg stdout directly to the HTTP response so
// the browser's download UI pops up immediately on the first byte instead of
// after the full server-side download completes. Tradeoffs:
//   • No Content-Length (unknown total before muxing finishes) → browser shows
//     "X MB downloaded" without a percentage. Acceptable.
//   • Fragmented mp4 (frag_keyframe+empty_moov+default_base_moof) is required
//     because we can't seek back to write the moov atom on a pipe. Plays in
//     every modern player (Chrome/Firefox/Safari/VLC/Win11 Movies & TV); fails
//     only on very old players (e.g. Win7 Windows Media Player).
//   • When HAS_YOUTUBE_PROXY is true, googlevideo URLs are IP-locked to the
//     proxy IP — pass it via -http_proxy so ffmpeg fetches succeed.
function runFfmpegStream(
  picked: { video: PickedFormat | null; audio: PickedFormat | null },
  audioOnly: boolean,
  safeName: string,
  proxyUrl: string | undefined,
): Response {
  const args: string[] = ["-loglevel", "error"];

  // Per-input options (-headers, -http_proxy) must precede their -i.
  const pushInput = (f: PickedFormat) => {
    const headers = ffmpegHeaderBlob(f.http_headers);
    if (headers) args.push("-headers", headers);
    if (proxyUrl) args.push("-http_proxy", proxyUrl);
    args.push("-i", f.url);
  };

  if (audioOnly) {
    if (!picked.audio) throw new Error("no audio format");
    pushInput(picked.audio);
    // MP3 is naturally streamable — no special muxer flags needed.
    args.push("-vn", "-c:a", "libmp3lame", "-q:a", "2", "-f", "mp3", "pipe:1");
  } else if (picked.video?.combined) {
    // Combined progressive stream (e.g. itag 18 360p) — audio is already
    // muxed into the URL. Single input, copy both streams, no -map needed.
    pushInput(picked.video);
    args.push(
      "-c", "copy",
      "-movflags", "frag_keyframe+empty_moov+default_base_moof",
      "-f", "mp4",
      "pipe:1",
    );
  } else {
    if (!picked.video || !picked.audio) throw new Error("missing v/a format");
    pushInput(picked.video);
    pushInput(picked.audio);
    args.push(
      "-map", "0:v:0",
      "-map", "1:a:0",
      "-c", "copy",
      // Streamable mp4 — moov atom written first, body chunked into fragments
      // so the file plays while still being written.
      "-movflags", "frag_keyframe+empty_moov+default_base_moof",
      "-f", "mp4",
      "pipe:1",
    );
  }

  const t0 = Date.now();
  const tag = audioOnly ? "audio" : "video";
  const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
  let stderr = "";
  let bytesOut = 0;
  let firstByteAt = 0;
  proc.stderr?.on("data", (c) => { stderr += c.toString(); });
  proc.on("close", (code) => {
    const dt = Date.now() - t0;
    const ttfb = firstByteAt ? firstByteAt - t0 : -1;
    if (code !== 0) console.warn(`[ffmpeg-stream:${tag}] stderr:`, stderr.slice(0, 500));
  });

  const webStream = new ReadableStream({
    start(controller) {
      proc.stdout!.on("data", (c: Buffer) => {
        if (!firstByteAt) {
          firstByteAt = Date.now();
        }
        bytesOut += c.length;
        try { controller.enqueue(new Uint8Array(c)); } catch {}
      });
      proc.stdout!.on("end", () => {
        try { controller.close(); } catch {}
      });
      proc.stdout!.on("error", () => {
        try { controller.close(); } catch {}
      });
    },
    cancel() {
      try { proc.kill("SIGKILL"); } catch {}
    },
  });

  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": audioOnly ? "audio/mpeg" : "video/mp4",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
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
    console.warn("[stream] missing URL");
    return new Response("URL required", { status: 400 });
  }

  const isYoutube = /youtu(?:\.be|be\.com)/i.test(url);
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
  // YOUTUBE PATH 1 — cobalt.tools (preferred)
  //
  // Cobalt's hosted infrastructure handles YouTube's anti-bot extraction,
  // returning a direct download URL we can redirect the user's browser to.
  // The file flows cobalt → user; our server just relays a small JSON call.
  // This bypasses every problem we hit running yt-dlp from a datacenter IP
  // (cookie geo-mismatch, PO-token gating, format-list thinning), and the
  // user gets full HD reliably.
  //
  // Fallback chain on failure: PATH 2 (yt-dlp ffmpeg streaming) → PATH 3
  // (yt-dlp temp-file). User never sees an error if any backend works.
  // =========================================================================
  if (isYoutube && isCobaltConfigured()) {
    try {
      const t0 = Date.now();
      const cap = heightParam && /^\d+$/.test(heightParam)
        ? Math.min(1080, parseInt(heightParam, 10))
        : 1080;
      // Cobalt only accepts these specific quality strings.
      const videoQuality = (
        cap >= 1080 ? "1080" :
        cap >= 720  ? "720"  :
        cap >= 480  ? "480"  :
        cap >= 360  ? "360"  : "360"
      ) as "1080" | "720" | "480" | "360";

      const r = await resolveViaCobalt({
        url,
        audio,
        videoQuality,
        audioFormat: audio ? "mp3" : undefined,
      });

      if (r) {
        // 302 redirect the browser straight to cobalt. The Content-Disposition
        // header on cobalt's response already triggers a download; the
        // attachment_filename query param ensures our preferred name wins.
        const target = new URL(r.url);
        // Some cobalt instances accept ?filename= overrides on tunnel URLs.
        if (!target.searchParams.has("filename")) {
          target.searchParams.set("filename", safeName);
        }
        return Response.redirect(target.toString(), 302);
      }
      console.warn(`[stream] cobalt returned no usable response in ${Date.now() - t0}ms; falling back`);
    } catch (e: any) {
      console.warn("[stream] cobalt error, falling back to yt-dlp:", e.message);
    }
  }

  // =========================================================================
  // YOUTUBE PATH 2 — yt-dlp + ffmpeg stdout piped straight to the browser
  //
  // The browser's download UI pops up on the first byte (vs. waiting for the
  // server to download + merge the entire file before sending). Total time
  // also drops because we pipeline server-download with client-write instead
  // of doing them sequentially.
  //
  // Proxy passthrough: googlevideo.com signed URLs are IP-locked to the
  // extracting IP. When HAS_YOUTUBE_PROXY is true we pass the same proxy to
  // ffmpeg via -http_proxy so the fetch succeeds; when it's false (cookies-
  // only or unproxied setup) the URL is bound to the server's IP and ffmpeg
  // fetches direct, saving any proxy bandwidth.
  //
  // We only fall back to the yt-dlp temp-file path if format selection or
  // ffmpeg startup fails — the streaming path covers ~all real videos.
  // =========================================================================
  if (isYoutube) {
    try {
      const info = await getVideoInfo(url);
      const heightCap = heightParam && /^\d+$/.test(heightParam)
        ? Math.min(1080, parseInt(heightParam, 10))
        : 1080;
      const picked = pickYoutubeFormats(info, heightCap, audio);

      // Stream when:
      //   audio-only request: need a pure audio pick.
      //   video request: need either (video + audio) or a combined stream.
      const canStream = audio
        ? !!picked.audio
        : !!picked.video && (!!picked.audio || !!picked.video.combined);
      if (canStream) {
        const proxyUrl = HAS_YOUTUBE_PROXY ? getYoutubeProxyUrl() : undefined;
        return runFfmpegStream(picked, audio, safeName, proxyUrl);
      }
    } catch (e: any) {
      console.warn("[stream] streaming ffmpeg path failed, falling back to yt-dlp:", e.message);
    }
  }

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
          return new Response(proxyRes.body, {
            status: 200,
            headers: {
              "Content-Type": ct,
              "Content-Disposition": `attachment; filename="${safeName}"`,
              "Cache-Control": "no-store",
            },
          });
        }
      }
    } catch (e: any) {
      console.warn("[stream] cobalt Instagram attempt failed, trying Instagram API:", e.message?.slice(0, 200));
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
            console.log(`[stream] Instagram API fallback succeeded in ${Date.now() - t0}ms: ${url}`);
            return new Response(proxyRes.body, {
              status: 200,
              headers: {
                "Content-Type": ct,
                "Content-Disposition": `attachment; filename="${safeName}"`,
                "Cache-Control": "no-store",
              },
            });
          }
        }
      } catch (e: any) {
        console.warn("[stream] Instagram API fallback failed:", e.message?.slice(0, 200));
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
          return new Response(proxyRes.body, {
            status: 200,
            headers: {
              "Content-Type": ct,
              "Content-Disposition": `attachment; filename="${safeName}"`,
              "Cache-Control": "no-store",
            },
          });
        }
      }
    } catch (e: any) {
      console.warn("[stream] cobalt Facebook attempt failed, falling back to yt-dlp:", e.message?.slice(0, 200));
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
    const args: string[] = [
      url,
      ...getGenericCookiesArgs(),
      "-o", tempTemplate,
      "--no-check-certificates",
      "--no-warnings",
      "--no-playlist",
      "--no-part",
      "--socket-timeout", "30",
      // Download 8 DASH fragments in parallel. This is the single biggest
      // speed win for YouTube HD downloads: the video and audio streams are
      // delivered in hundreds of small fragments, and serializing them over
      // a residential proxy was the root cause of the 2-5 minute wait.
      "--concurrent-fragments", "8",
      "-f", fmtArg,
    ];

    // --------------------------------------------------------------------
    // BANDWIDTH OPTIMIZATION (critical for paid residential proxies)
    // yt-dlp's default internal downloader routes fragment downloads
    // through --proxy too. For a 50 MB video that means 50 MB of proxy
    // bandwidth per download. Since the actual googlevideo.com CDN is not
    // IP-gated (signed URLs work from any IP), we use ffmpeg as the
    // external downloader and deliberately do NOT pass the proxy to it.
    // Result: yt-dlp still uses the proxy for the small metadata calls
    // (signature, manifest) while ffmpeg pulls the media bytes directly
    // from googlevideo.com. Typical savings: ~98% of proxy bandwidth.
    // --------------------------------------------------------------------
    if (isYoutube) {
      args.push("--external-downloader", "ffmpeg");
      args.push("--external-downloader-args", "ffmpeg:-loglevel error");
    }

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

    if (isYoutube) {
      args.push(
        "--extractor-args",
        "youtube:player_client=tv_embedded,android,ios,mweb,web,default",
      );
      args.push(...getYoutubeStreamAuthArgs());
    }

    let { code, stderr } = await runYtDlp(args);

    // Instagram: if cookies are configured but the request fails, try once
    // without them. Stale or region-locked cookies can cause 400 Bad Request
    // while the same request anonymously may succeed (or fail with a clearer
    // error that tells us the post is genuinely private/login-required).
    if (code !== 0 && isInstagram && getGenericCookiesArgs().length > 0) {
      console.warn("[stream] yt-dlp with cookies failed, retrying Instagram without cookies");
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
      console.warn(`[stream] yt-dlp error for ${isInstagram ? "instagram" : "generic"}: ${friendlyMsg}`, stderr.slice(0, 500));
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
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Content-Length": fileSize.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    unlink(expectedFinal).catch(() => {});
    return new Response("Download failed: " + err.message, { status: 500 });
  }
}
