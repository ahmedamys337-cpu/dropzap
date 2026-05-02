import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Test whether this server's IP can extract YouTube info WITHOUT any proxy.
// If this returns HD formats, you can remove YOUTUBE_PROXIES from Render env
// vars entirely — extraction will run at full speed from the datacenter IP,
// downloads will use the direct-ffmpeg fast path, and 1080p HD will land in
// ~5-10s instead of 90s.
//
// Visit: /api/youtube/test-noproxy?url=<youtube_url>
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Pass ?url=<youtube_url>" }, { status: 400 });
  }

  const start = Date.now();
  try {
    const { stdout } = await exec("yt-dlp", [
      url,
      "--dump-single-json",
      "--no-check-certificates",
      "--no-warnings",
      "--no-playlist",
      "--skip-download",
      "--no-check-formats",
      "--socket-timeout", "15",
      "--extractor-args", "youtube:player_client=tv_embedded,android",
    ], { timeout: 30000, maxBuffer: 10 * 1024 * 1024 });

    const data = JSON.parse(stdout);
    const formats = (data.formats || []).filter((f: any) => f.height);
    const heights = [...new Set(formats.map((f: any) => f.height))].sort((a: any, b: any) => b - a);
    const hasHd = heights.some((h: any) => h >= 720);
    const elapsed = Date.now() - start;

    return NextResponse.json({
      success: true,
      title: data.title,
      heights,
      hasHd,
      formatCount: formats.length,
      elapsedMs: elapsed,
      verdict: hasHd
        ? "✅ Render IP works without proxy! Remove YOUTUBE_PROXIES from env vars. Expect 5-10s downloads."
        : "⚠️ Render IP returns only low-res without proxy. Proxy is still needed.",
    });
  } catch (e: any) {
    const elapsed = Date.now() - start;
    return NextResponse.json({
      success: false,
      error: e.message?.slice(0, 300),
      elapsedMs: elapsed,
      verdict: "❌ Render IP cannot extract YouTube without proxy. Keep YOUTUBE_PROXIES set.",
    });
  }
}
