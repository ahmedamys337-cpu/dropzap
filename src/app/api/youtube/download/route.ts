import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { join } from "path";
import { readFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import { getYoutubeAuthArgs } from "@/lib/ytdlp";

const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.success) {
    return NextResponse.json(
      { error: `Rate limited. Try again in ${limit.retryAfter}s` },
      { status: 429 }
    );
  }

  let tempPath = "";

  try {
    const { url, formatId, audioOnly, bitrate } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const id = randomUUID().slice(0, 8);
    const ext = audioOnly ? "mp3" : "mp4";
    tempPath = join(tmpdir(), `ytdl-${id}.${ext}`);

    const args: string[] = [url, "-o", tempPath, "--no-check-certificates", "--no-warnings"];

    if (audioOnly) {
      args.push("-x", "--audio-format", "mp3");
      if (bitrate) {
        args.push("--audio-quality", bitrate === "320" ? "0" : "5");
      }
    } else if (formatId) {
      args.push("-f", `${formatId}+bestaudio/best`);
      args.push("--merge-output-format", "mp4");
    } else {
      args.push("-f", "best[ext=mp4]/best");
    }

    // Add cookies + random proxy for YouTube (bypasses cloud IP block)
    args.push(...getYoutubeAuthArgs());

    await execFileAsync("yt-dlp", args, { timeout: 300000 });

    const fileBuffer = await readFile(tempPath);

    const headers = new Headers();
    headers.set("Content-Type", audioOnly ? "audio/mpeg" : "video/mp4");
    headers.set("Content-Disposition", `attachment; filename="download.${ext}"`);
    headers.set("Content-Length", fileBuffer.length.toString());

    // Clean up temp file in background
    unlink(tempPath).catch(() => {});

    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (err: any) {
    if (tempPath) unlink(tempPath).catch(() => {});
    console.error("YouTube download error:", err.message);
    return NextResponse.json(
      { error: "Download failed. The video may be restricted or unavailable." },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 300;
