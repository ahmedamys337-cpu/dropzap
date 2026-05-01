import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getVideoInfo } from "@/lib/ytdlp";

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
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const info = await getVideoInfo(url);

    // Keep ANY video stream that yt-dlp reports a height for. We used to
    // restrict to ext=="mp4" which broke YouTube Shorts (often surfaced as
    // webm/vertical) and any video where the highest tier was DASH-only.
    // The /api/stream endpoint already remuxes DASH to mp4 with audio at
    // download time, so we don't need to gate-keep on container here.
    const rawFormats = (info.formats || []).filter(
      (f: any) => f.height && f.vcodec && f.vcodec !== "none"
    );

    // Dedupe by height, keeping the variant with the largest filesize so the
    // user gets the best quality at each resolution tier.
    const byHeight = new Map<number, any>();
    for (const f of rawFormats) {
      const existing = byHeight.get(f.height);
      const fSize = f.filesize || f.filesize_approx || 0;
      const eSize = existing ? existing.filesize || existing.filesize_approx || 0 : -1;
      if (!existing || fSize > eSize) byHeight.set(f.height, f);
    }

    const formats = Array.from(byHeight.values())
      .map((f: any) => ({
        format_id: f.format_id,
        ext: f.ext,
        resolution: f.resolution || `${f.width}x${f.height}`,
        height: f.height,
        filesize: f.filesize || f.filesize_approx || null,
        vcodec: f.vcodec,
        acodec: f.acodec,
        format_note: f.format_note || "",
      }))
      .sort((a: any, b: any) => a.height - b.height);

    return NextResponse.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      uploader: info.uploader || info.channel,
      view_count: info.view_count,
      formats,
    });
  } catch (err: any) {
    console.error("YouTube info error:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch video info. Check the URL and try again." },
      { status: 500 }
    );
  }
}
