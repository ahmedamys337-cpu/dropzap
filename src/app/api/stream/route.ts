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
  type PickedFormat,
} from "@/lib/ytdlp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Run yt-dlp to download into a temp file. We deliberately avoid streaming
// directly to stdout because piping forces fragmented-mp4 output (so the
// muxer never has to seek back), and fragmented-mp4 with VP9/AV1 (which is
// what YouTube ships at >1080p) does not play in many consumer players —
// the audio decodes but the video track shows nothing. Writing to a real
// file lets ffmpeg produce a regular, seekable mp4 with a proper moov atom
// that plays everywhere AND lets us return a real Content-Length so the
// browser's download UI shows percentage / total size.
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

// Format the http_headers from yt-dlp into the single-blob string ffmpeg's
// -headers option expects. ffmpeg auto-supplies User-Agent if missing, so a
// missing http_headers field is fine.
function ffmpegHeaderBlob(h?: Record<string, string>): string {
  if (!h) return "";
  return Object.entries(h)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\r\n") + "\r\n";
}

// Run ffmpeg with direct googlevideo.com URLs. Produces a regular seekable
// mp4 (or mp3 for audio) and streams the finished file to the client with a
// real Content-Length. Crucially, ffmpeg has no knowledge of our proxy, so
// every byte of media flows direct from googlevideo to the server — zero
// proxy bandwidth.
async function runFfmpegMux(
  picked: { video: PickedFormat | null; audio: PickedFormat | null },
  audioOnly: boolean,
  safeName: string,
): Promise<Response> {
  const id = randomUUID().slice(0, 8);
  const outPath = join(tmpdir(), `dl-${id}.${audioOnly ? "mp3" : "mp4"}`);

  const args: string[] = ["-y", "-loglevel", "error"];

  if (audioOnly) {
    if (!picked.audio) throw new Error("no audio format");
    const headers = ffmpegHeaderBlob(picked.audio.http_headers);
    if (headers) args.push("-headers", headers);
    args.push("-i", picked.audio.url);
    // Transcode to MP3 VBR ~192kbps (-q:a 2). Always re-encode because the
    // source is m4a/AAC or webm/opus.
    args.push("-vn", "-c:a", "libmp3lame", "-q:a", "2", outPath);
  } else {
    if (!picked.video || !picked.audio) throw new Error("missing v/a format");
    const vHeaders = ffmpegHeaderBlob(picked.video.http_headers);
    const aHeaders = ffmpegHeaderBlob(picked.audio.http_headers);
    // Per-input headers must precede their -i. ffmpeg applies the most
    // recent -headers to the next -i.
    if (vHeaders) args.push("-headers", vHeaders);
    args.push("-i", picked.video.url);
    if (aHeaders) args.push("-headers", aHeaders);
    args.push("-i", picked.audio.url);
    args.push(
      "-map", "0:v:0",
      "-map", "1:a:0",
      "-c", "copy",
      "-movflags", "+faststart",
      "-f", "mp4",
      outPath,
    );
  }

  const code = await new Promise<number>((resolve) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    proc.stderr?.on("data", (c) => { stderr += c.toString(); });
    proc.on("close", (c) => {
      if (c !== 0) console.warn("[ffmpeg]", stderr.slice(0, 500));
      resolve(c ?? 1);
    });
    proc.on("error", () => resolve(1));
  });

  if (code !== 0) {
    unlink(outPath).catch(() => {});
    throw new Error("ffmpeg failed");
  }

  const stats = await stat(outPath);
  const nodeStream = createReadStream(outPath);
  const webStream = new ReadableStream({
    start(controller) {
      nodeStream.on("data", (c) => {
        try { controller.enqueue(new Uint8Array(c as Buffer)); } catch {}
      });
      nodeStream.on("end", () => {
        try { controller.close(); } catch {}
        unlink(outPath).catch(() => {});
      });
      nodeStream.on("error", () => {
        try { controller.close(); } catch {}
        unlink(outPath).catch(() => {});
      });
    },
    cancel() {
      nodeStream.destroy();
      unlink(outPath).catch(() => {});
    },
  });

  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": audioOnly ? "audio/mpeg" : "video/mp4",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Content-Length": stats.size.toString(),
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const format = request.nextUrl.searchParams.get("f") || "best";
  const heightParam = request.nextUrl.searchParams.get("h");
  const filename = request.nextUrl.searchParams.get("name") || "download.mp4";
  const audio = request.nextUrl.searchParams.get("audio") === "1";

  if (!url) return new Response("URL required", { status: 400 });

  const isYoutube = /youtu(?:\.be|be\.com)/i.test(url);

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
  // YOUTUBE FAST PATH — direct ffmpeg, NO proxy bytes for media
  //
  // Only enabled when there is NO residential proxy configured. YouTube
  // embeds the requesting IP into every signed googlevideo.com URL it
  // hands out, so a URL extracted via the proxy IP can ONLY be downloaded
  // from that same proxy IP. ffmpeg fetching it from the server's IP gets
  // a 403. With HAS_YOUTUBE_PROXY=true we therefore skip this fast path
  // and let the yt-dlp temp-file path handle the download (which uses the
  // proxy correctly, at the cost of proxy bandwidth).
  //
  // When HAS_YOUTUBE_PROXY is false (cookies-only or unproxied setup),
  // the cached extraction URL is bound to the server's IP, ffmpeg can
  // fetch it directly from googlevideo.com, and we get the ~0-proxy-byte
  // optimization for free.
  // =========================================================================
  if (isYoutube && !HAS_YOUTUBE_PROXY) {
    try {
      const info = await getVideoInfo(url);
      const heightCap = heightParam && /^\d+$/.test(heightParam)
        ? Math.min(1080, parseInt(heightParam, 10))
        : 1080;
      const picked = pickYoutubeFormats(info, heightCap, audio);

      if (picked.audio && (audio || picked.video)) {
        return await runFfmpegMux(picked, audio, safeName);
      }
    } catch (e: any) {
      console.warn("[stream] direct ffmpeg path failed, falling back to yt-dlp:", e.message);
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

    const { code, stderr } = await runYtDlp(args);
    if (code !== 0) {
      unlink(expectedFinal).catch(() => {});
      const msg = stderr.split("\n").find((l) => l.includes("ERROR")) || "yt-dlp failed";
      return new Response("Download failed: " + msg, { status: 500 });
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
