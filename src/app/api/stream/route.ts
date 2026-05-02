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
  // Preferred contract: client passes h=<height> so we can always merge the
  // best video at that resolution with the best audio.
  const heightParam = request.nextUrl.searchParams.get("h");
  const filename = request.nextUrl.searchParams.get("name") || "download.mp4";
  const audio = request.nextUrl.searchParams.get("audio") === "1";

  if (!url) return new Response("URL required", { status: 400 });

  // ---------- format selector ----------
  let fmtArg: string;
  if (audio) {
    // Pick the best audio-only stream regardless of container. yt-dlp's
    // post-processor will transcode it to mp3 below, so the source codec
    // (m4a, opus, webm…) does not matter.
    fmtArg = "bestaudio/best";
  } else if (heightParam && /^\d+$/.test(heightParam)) {
    const h = heightParam;
    // Prefer H.264 (avc1) at <=1080p — it's the most universally playable
    // codec. Above 1080p YouTube only ships VP9/AV1 so we accept those, but
    // we still always prefer m4a audio so the final mp4 has AAC audio.
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

  const id = randomUUID().slice(0, 8);
  // %(ext)s lets yt-dlp pick the right extension before post-processing;
  // after the audio extractor / video merger runs we'll resolve the actual
  // produced file by checking both possible suffixes.
  const tempBase = join(tmpdir(), `dl-${id}`);
  const tempTemplate = `${tempBase}.%(ext)s`;
  const expectedFinal = `${tempBase}.${ext}`;

  try {
    const isYoutube = /youtu(?:\.be|be\.com)/i.test(url);

    const args: string[] = [
      url,
      "-o", tempTemplate,
      "--no-check-certificates",
      "--no-warnings",
      "--no-playlist",
      "--no-part",
      "--socket-timeout", "30",
      "-f", fmtArg,
    ];

    if (audio) {
      // Re-encode the source audio to MP3 (VBR ~192kbps via -q 2). This
      // also fixes the previous 0-byte downloads where the source was
      // labeled m4a but turned out to be webm/opus, which the browser
      // refused to save under a .m4a name.
      args.push(
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "2",
      );
    } else {
      // Build a regular, seekable mp4 (NOT fragmented). Writing to a temp
      // file means ffmpeg can seek back to write the moov atom, so VP9 / AV1
      // 4K / 1440p downloads produce files that play correctly everywhere.
      args.push("--merge-output-format", "mp4");
      args.push("--remux-video", "mp4");
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
      // Clean up any stray temp file
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
      // Try common alternates (rare extension mismatch after post-processing)
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

    const headers: Record<string, string> = {
      "Content-Type": audio ? "audio/mpeg" : "video/mp4",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Content-Length": fileSize.toString(),
      "Cache-Control": "no-store",
    };

    return new Response(webStream, { status: 200, headers });
  } catch (err: any) {
    unlink(expectedFinal).catch(() => {});
    return new Response("Download failed: " + err.message, { status: 500 });
  }
}
