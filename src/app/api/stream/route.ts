import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { createReadStream } from "fs";
import { stat, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";
import { getYoutubeStreamAuthArgs } from "@/lib/ytdlp";

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
  // AUDIO PATH — temp-file
  // MP3 extraction requires ffmpeg post-processing, which needs a real file
  // (can't pipe extract-audio to stdout reliably). Acceptable: audio files
  // are small (~5-10 MB) so the wait before the browser sees bytes is short.
  // =========================================================================
  if (audio) {
    const id = randomUUID().slice(0, 8);
    const tempBase = join(tmpdir(), `dl-${id}`);
    const tempTemplate = `${tempBase}.%(ext)s`;
    const expectedFinal = `${tempBase}.mp3`;

    try {
      const args: string[] = [
        url,
        "-o", tempTemplate,
        "--no-check-certificates",
        "--no-warnings",
        "--no-playlist",
        "--no-part",
        "--socket-timeout", "30",
        "-f", fmtArg,
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "2",
      ];
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

      const stats = await stat(expectedFinal);
      const nodeStream = createReadStream(expectedFinal);
      const webStream = new ReadableStream({
        start(controller) {
          nodeStream.on("data", (c) => {
            try { controller.enqueue(new Uint8Array(c as Buffer)); } catch {}
          });
          nodeStream.on("end", () => {
            try { controller.close(); } catch {}
            unlink(expectedFinal).catch(() => {});
          });
          nodeStream.on("error", () => {
            try { controller.close(); } catch {}
            unlink(expectedFinal).catch(() => {});
          });
        },
        cancel() {
          nodeStream.destroy();
          unlink(expectedFinal).catch(() => {});
        },
      });

      return new Response(webStream, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Disposition": `attachment; filename="${safeName}"`,
          "Content-Length": stats.size.toString(),
          "Cache-Control": "no-store",
        },
      });
    } catch (err: any) {
      unlink(expectedFinal).catch(() => {});
      return new Response("Download failed: " + err.message, { status: 500 });
    }
  }

  // =========================================================================
  // VIDEO PATH — live stream via stdout
  // Since we cap at 1080p (guaranteed H.264/avc1 on YouTube), fragmented-mp4
  // piped to stdout plays in every player, and the browser gets the first
  // byte within 1-2 seconds. This removes the ~5 minute wait users saw with
  // the temp-file approach for HD videos.
  // =========================================================================
  try {
    const args: string[] = [
      url, "-o", "-",
      "--no-check-certificates",
      "--no-warnings",
      "--no-playlist",
      "-f", fmtArg,
      "--merge-output-format", "mp4",
      "--postprocessor-args",
      "Merger:-movflags +frag_keyframe+empty_moov+default_base_moof",
    ];
    if (isYoutube) {
      args.push(
        "--extractor-args",
        "youtube:player_client=tv_embedded,android,ios,mweb,web,default",
      );
      args.push(...getYoutubeStreamAuthArgs());
    }

    const proc = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr?.on("data", (c: Buffer) => { stderr += c.toString(); });

    const webStream = new ReadableStream({
      start(controller) {
        proc.stdout?.on("data", (c: Buffer) => {
          try { controller.enqueue(new Uint8Array(c)); } catch {}
        });
        proc.stdout?.on("end", () => {
          try { controller.close(); } catch {}
        });
        proc.stdout?.on("error", () => {
          try { controller.close(); } catch {}
        });
        proc.on("error", () => {
          try { controller.close(); } catch {}
        });
      },
      cancel() { proc.kill("SIGTERM"); },
    });

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return new Response("Download failed: " + err.message, { status: 500 });
  }
}
