import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { getYoutubeStreamAuthArgs } from "@/lib/ytdlp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const format = request.nextUrl.searchParams.get("f") || "best";
  // Preferred new contract: client passes h=<height> so we can always merge
  // the best video at that resolution with the best audio. The legacy f=<id>
  // path is kept for callers (non-YouTube) that don't pass a height.
  const heightParam = request.nextUrl.searchParams.get("h");
  const filename = request.nextUrl.searchParams.get("name") || "download.mp4";
  const audio = request.nextUrl.searchParams.get("audio") === "1";
  const expectedSize = request.nextUrl.searchParams.get("size");

  if (!url) {
    return new Response("URL required", { status: 400 });
  }

  // Build a yt-dlp format selector. For video downloads we ALWAYS try to
  // merge a video-only stream with a separate audio-only stream because on
  // modern YouTube the only progressive (audio+video) mp4 is 360p (itag 18).
  // Falling back through several alternatives means the request never hard-
  // fails just because a particular variant is unavailable.
  let fmtArg: string;
  if (audio) {
    fmtArg = "bestaudio[ext=m4a]/bestaudio";
  } else if (heightParam && /^\d+$/.test(heightParam)) {
    const h = heightParam;
    fmtArg =
      `bv*[height<=${h}][ext=mp4]+ba[ext=m4a]/` +
      `bv*[height<=${h}]+ba/` +
      `b[height<=${h}][ext=mp4]/` +
      `b[height<=${h}]/best`;
  } else if (format !== "best") {
    // Legacy: a specific format_id was provided. Try to merge audio onto it
    // so HD requests don't come back silent.
    fmtArg = `${format}+ba[ext=m4a]/${format}+ba/${format}/best[ext=mp4]/best`;
  } else {
    // Generic non-YouTube default (Instagram, TikTok, Facebook, ...). The
    // earlier 'best[ext=mp4]/best' fallback was matching audio-only mp4a
    // tracks on some Instagram reels, which produced "videos" that were
    // actually AAC audio in an mp4 container. Explicitly requiring a
    // video codec at every rung stops that from happening. The last bare
    // 'best' is a final safety net for extractors whose formats don't
    // advertise vcodec reliably.
    fmtArg =
      "bv*+ba/" +
      "b[vcodec!=none][acodec!=none]/" +
      "best[vcodec!=none][ext=mp4]/" +
      "best[vcodec!=none]/best";
  }

  const ext = audio ? "m4a" : "mp4";
  const safeName = filename.replace(/[^\w\s.-]/g, "").trim() || `download.${ext}`;

  try {
    const isYoutube = /youtu(?:\.be|be\.com)/i.test(url);

    const args: string[] = [
      url, "-o", "-",
      "--no-check-certificates", "--no-warnings", "--no-playlist",
      "-f", fmtArg,
    ];

    if (!audio) {
      // Force mp4 container for the merged output and use fragmented-mp4
      // ffmpeg flags so the muxer can write to stdout (regular mp4 needs to
      // seek back to write the moov atom, which a pipe cannot do).
      args.push("--merge-output-format", "mp4");
      args.push(
        "--postprocessor-args",
        "Merger:-movflags +frag_keyframe+empty_moov+default_base_moof"
      );
    }

    if (isYoutube) {
      args.push(
        "--extractor-args",
        "youtube:player_client=tv_embedded,android,ios,mweb,web,default"
      );
      args.push(...getYoutubeStreamAuthArgs());
    }

    const proc = spawn("yt-dlp", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let errorMsg = "";
    proc.stderr?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      if (text.includes("ERROR")) errorMsg += text;
    });

    const stream = new ReadableStream({
      start(controller) {
        proc.stdout?.on("data", (chunk: Buffer) => {
          try { controller.enqueue(new Uint8Array(chunk)); } catch {}
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
      cancel() {
        proc.kill("SIGTERM");
      },
    });

    const headers: Record<string, string> = {
      "Content-Type": audio ? "audio/mp4" : "video/mp4",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "no-store",
    };

    // Use client-provided filesize for Content-Length (enables progress bar)
    if (expectedSize && parseInt(expectedSize) > 0) {
      headers["Content-Length"] = expectedSize;
    }

    return new Response(stream, { status: 200, headers });
  } catch (err: any) {
    return new Response("Download failed: " + err.message, { status: 500 });
  }
}
