import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { join } from "path";
import { unlink, stat } from "fs/promises";
import { createReadStream } from "fs";
import { randomUUID } from "crypto";
import { withConcurrencyLimit } from "@/lib/concurrency";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    tempPath = join(tmpdir(), `tkdl-${id}.mp4`);

    await withConcurrencyLimit(async () => {
      await execFileAsync("yt-dlp", [
        url,
        "-o", tempPath,
        "--no-check-certificates",
        "--no-warnings",
        "-f", "best[ext=mp4]/best",
        "--no-watermark",
      ], { timeout: 120000 });
    });

    const fileStat = await stat(tempPath);
    const nodeStream = createReadStream(tempPath);
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk: any) => controller.enqueue(new Uint8Array(chunk)));
        nodeStream.on("end", () => {
          controller.close();
          setTimeout(() => unlink(tempPath).catch(() => {}), 5000);
        });
        nodeStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        nodeStream.destroy();
        unlink(tempPath).catch(() => {});
      },
    });

    const headers = new Headers();
    headers.set("Content-Type", "video/mp4");
    headers.set("Content-Disposition", 'attachment; filename="tiktok-video.mp4"');
    headers.set("Content-Length", fileStat.size.toString());

    return new Response(webStream, { status: 200, headers });
  } catch (err: any) {
    if (tempPath) unlink(tempPath).catch(() => {});
    console.error("TikTok download error:", err.message);
    return NextResponse.json(
      { error: "Failed to download TikTok video." },
      { status: 500 }
    );
  }
}
