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

    // Only accept standard YouTube heights. Phantom non-ladder entries
    // (e.g. 1072p, 2880p) would clutter the UI; real YouTube videos always
    // fall on the standard rungs. Using a whitelist also naturally keeps
    // out stale 8K/4K placeholders that sometimes appear in player
    // responses for videos that don't actually offer those resolutions.
    const STANDARD_HEIGHTS = new Set([144, 240, 360, 480, 720, 1080, 1440, 2160, 4320]);

    const rawFormats = (info.formats || []).filter((f: any) => {
      if (!f.height || !STANDARD_HEIGHTS.has(f.height)) return false;
      // Must look like a video stream (has a video codec OR is explicitly
      // marked as a video-only DASH track via acodec==="none").
      const isVideo =
        (f.vcodec && f.vcodec !== "none") ||
        (!f.vcodec && f.acodec === "none");
      return isVideo;
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
