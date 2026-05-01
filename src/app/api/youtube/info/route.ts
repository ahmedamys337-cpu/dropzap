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

    // Only accept standard YouTube heights. Phantom 8K/4K entries sometimes
    // appear from mis-reported player responses even though the video only
    // actually goes up to 1080p/1440p — keeping them would let users pick a
    // resolution that just stalls forever at download time.
    const STANDARD_HEIGHTS = new Set([144, 240, 360, 480, 720, 1080, 1440, 2160, 4320]);

    const rawFormats = (info.formats || []).filter((f: any) => {
      if (!f.height || !STANDARD_HEIGHTS.has(f.height)) return false;
      // Must look like a video stream (has vcodec OR is tagged as video-only).
      const isVideo =
        (f.vcodec && f.vcodec !== "none") ||
        (!f.vcodec && f.acodec === "none");
      if (!isVideo) return false;
      // Drop entries that have no size/bitrate hint at all — these are
      // almost always premium-gated or otherwise undownloadable placeholder
      // entries. Real formats always advertise at least one of these.
      const hasSizeHint = !!(f.filesize || f.filesize_approx || f.tbr || f.vbr);
      if (!hasSizeHint) return false;
      // Skip explicit premium-only tracks surfaced by some clients.
      const note = (f.format_note || "").toLowerCase();
      if (note.includes("premium")) return false;
      return true;
    });

    // Helpful diagnostic in Render logs when a video looks format-starved.
    console.log(
      `[youtube/info] ${info.id || ""} formats total=${info.formats?.length || 0} video=${rawFormats.length}`
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
