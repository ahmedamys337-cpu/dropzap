import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { withConcurrencyLimit } from "@/lib/concurrency";
import { tmpdir } from "os";
import { join } from "path";
import { writeFile, readFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";
import { logger } from "@/lib/logger";

const execFileAsync = promisify(execFile);

function safeMp3Filename(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").replace(/[^\w\s.-]/g, "").trim() || "audio";
  return `attachment; filename="${base}.mp3"; filename*=UTF-8''${encodeURIComponent(base + ".mp3")}`;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.success) {
    return NextResponse.json(
      { error: `Rate limited. Try again in ${limit.retryAfter}s` },
      { status: 429 }
    );
  }

  let inputPath = "";
  let outputPath = "";

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 500MB." }, { status: 400 });
    }

    const id = randomUUID().slice(0, 8);
    const ext = file.name.split(".").pop() || "mp4";
    inputPath = join(tmpdir(), `convert-${id}.${ext}`);
    outputPath = join(tmpdir(), `convert-${id}.mp3`);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    await withConcurrencyLimit(async () => {
      await execFileAsync("ffmpeg", [
        "-i", inputPath,
        "-vn",
        "-acodec", "libmp3lame",
        "-ab", "192k",
        "-ar", "44100",
        "-y",
        outputPath,
      ], { timeout: 300000 });
    });

    const mp3Buffer = await readFile(outputPath);

    // Clean up
    unlink(inputPath).catch(() => {});
    unlink(outputPath).catch(() => {});

    const headers = new Headers();
    headers.set("Content-Type", "audio/mpeg");
    headers.set("Content-Disposition", safeMp3Filename(file.name));
    headers.set("Content-Length", mp3Buffer.length.toString());

    return new NextResponse(mp3Buffer, { status: 200, headers });
  } catch (err: any) {
    if (inputPath) unlink(inputPath).catch(() => {});
    if (outputPath) unlink(outputPath).catch(() => {});
    logger.error("MP3 conversion error:", err.message);
    return NextResponse.json(
      { error: "Conversion failed. Make sure ffmpeg is installed." },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 300;
