import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { join } from "path";
import { readFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";

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
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const id = randomUUID().slice(0, 8);
    tempPath = join(tmpdir(), `igdl-${id}.mp4`);

    await execFileAsync("yt-dlp", [
      url,
      "-o", tempPath,
      "--no-check-certificates",
      "--no-warnings",
      "-f", "best[ext=mp4]/best",
    ], { timeout: 120000 });

    const fileBuffer = await readFile(tempPath);
    unlink(tempPath).catch(() => {});

    const headers = new Headers();
    headers.set("Content-Type", "video/mp4");
    headers.set("Content-Disposition", 'attachment; filename="instagram-reel.mp4"');
    headers.set("Content-Length", fileBuffer.length.toString());

    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (err: any) {
    if (tempPath) unlink(tempPath).catch(() => {});
    console.error("Instagram download error:", err.message);
    return NextResponse.json(
      { error: "Failed to download Instagram reel. It may be private or unavailable." },
      { status: 500 }
    );
  }
}
