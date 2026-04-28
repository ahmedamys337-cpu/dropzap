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

    const formats = (info.formats || [])
      .filter((f: any) => f.height && f.ext === "mp4" && f.vcodec !== "none")
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
      .reduce((acc: any[], f: any) => {
        if (!acc.find((a: any) => a.height === f.height)) acc.push(f);
        return acc;
      }, [])
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
