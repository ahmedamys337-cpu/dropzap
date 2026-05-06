import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getVideoInfo } from "@/lib/ytdlp";
import { isCobaltConfigured } from "@/lib/cobalt";

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

    // Accept any reasonable video height. We previously hard-whitelisted the
    // landscape ladder {144,240,...,4320} which silently dropped every
    // format from portrait Shorts (where height is e.g. 1920) and any
    // video with a non-standard aspect ratio. Range check + video-stream
    // check is safer: it still excludes storyboards (vcodec='none') and
    // implausibly small/huge heights, but lets real videos through.
    // Cap at 1080p. YouTube only offers H.264 (avc1) up to 1080p; 1440p and
    // 2160p are VP9/AV1-only, and remuxing those into mp4 on the fly
    // produces files that don't play reliably on consumer players. Advertising
    // 2K/4K buttons that silently deliver audio-only files is worse than not
    // offering them at all, so we hide those tiers until we can ship a
    // proper VP9/AV1-aware pipeline.
    const rawFormats = (info.formats || []).filter((f: any) => {
      if (!f.height || f.height < 100 || f.height > 1080) return false;
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

    // Synthetic standard ladder. When YouTube's anti-bot has thinned the
    // response down to just 360p (or nothing) but cobalt.tools is still
    // able to deliver HD on demand, the UI must offer the higher tiers
    // anyway. We inject any missing rung from {1080,720,480,360} so the
    // user always sees the full picker; the actual click goes to /api/stream
    // which tries cobalt first and falls back to yt-dlp at the requested
    // height. Real yt-dlp formats win when present (they carry filesize).
    // Only inject the synthetic ladder when cobalt is REALLY configured
    // (API key or custom instance URL). The default public mirrors are
    // unreliable — api.cobalt.tools now 400s without an Api-Key, and the
    // community mirrors are frequently down. Advertising 1080p in that
    // case produces the exact bug we saw: UI shows HD buttons, user
    // clicks 1080p, cobalt fails, yt-dlp fallback only has 360p, user
    // receives a 360p file. Honesty > false options.
    if (isCobaltConfigured()) {
      const STANDARD = [1080, 720, 480, 360];
      for (const h of STANDARD) {
        if (!byHeight.has(h)) {
          byHeight.set(h, {
            format_id: `cobalt-${h}`,
            ext: "mp4",
            resolution: `${Math.round((h * 16) / 9)}x${h}`,
            height: h,
            filesize: null,
            vcodec: "avc1",
            acodec: "mp4a",
            format_note: "",
          });
        }
      }
    }

    const formats = Array.from(byHeight.values())
      .filter((f: any) => f.height >= 360 && f.height <= 1080)
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
