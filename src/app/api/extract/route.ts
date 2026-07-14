import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getGenericCookiesArgs, getProxyArgs } from "@/lib/ytdlp";
import { logger } from "@/lib/logger";

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

  try {
    const { url, audioOnly, formatId } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Single yt-dlp call: get info JSON which includes format URLs
    const args: string[] = [
      url,
      "--dump-single-json",
      "--no-check-certificates",
      "--no-warnings",
      "--no-playlist",
      "--skip-download",
      "--no-check-formats",
      ...getGenericCookiesArgs(),
      ...getProxyArgs(),
    ];

    const { stdout } = await execFileAsync("yt-dlp", args, {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
    });

    const info = JSON.parse(stdout);

    // Extract the best matching format URL from the JSON
    let downloadUrl = "";
    const formats = info.formats || [];

    if (audioOnly) {
      // Find best audio format
      const audioFmts = formats.filter((f: any) => f.acodec !== "none" && (f.vcodec === "none" || !f.vcodec));
      const best = audioFmts.length > 0
        ? audioFmts[audioFmts.length - 1]
        : formats.filter((f: any) => f.acodec !== "none").pop();
      downloadUrl = best?.url || "";
    } else if (formatId) {
      // Find specific format
      const match = formats.find((f: any) => f.format_id === formatId);
      downloadUrl = match?.url || "";
    }

    // Fallback: best combined or last format
    if (!downloadUrl) {
      const combined = formats.filter((f: any) => f.acodec !== "none" && f.vcodec !== "none");
      const best = combined.length > 0 ? combined[combined.length - 1] : formats[formats.length - 1];
      downloadUrl = best?.url || info.url || "";
    }

    if (!downloadUrl || !downloadUrl.startsWith("http")) {
      return NextResponse.json({ error: "Could not extract download URL" }, { status: 500 });
    }

    return NextResponse.json({
      downloadUrl,
      title: info.title || "download",
      thumbnail: info.thumbnail || "",
      duration: info.duration || 0,
      uploader: info.uploader || info.channel || "",
      ext: audioOnly ? "m4a" : "mp4",
    });
  } catch (err: any) {
    logger.error("Extract error:", err.message);
    return NextResponse.json(
      { error: "Failed to extract download link. Try again." },
      { status: 500 }
    );
  }
}
