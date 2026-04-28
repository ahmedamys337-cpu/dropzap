import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
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

  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "Could not extract video ID" }, { status: 400 });
    }

    // No yt-dlp call needed — YouTube thumbnail URLs are predictable
    // Fetch title from oEmbed API (instant, no yt-dlp)
    let title = "YouTube Video";
    try {
      const oembed = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (oembed.ok) {
        const data = await oembed.json();
        title = data.title || title;
      }
    } catch {}

    const sizes = [
      { key: "default", label: "Default", width: 120, height: 90 },
      { key: "mqdefault", label: "Medium", width: 320, height: 180 },
      { key: "hqdefault", label: "High", width: 480, height: 360 },
      { key: "sddefault", label: "Standard", width: 640, height: 480 },
      { key: "maxresdefault", label: "Max Resolution", width: 1280, height: 720 },
    ];

    const thumbnails = sizes.map((s) => ({
      label: s.label,
      url: `https://img.youtube.com/vi/${videoId}/${s.key}.jpg`,
      width: s.width,
      height: s.height,
    }));

    return NextResponse.json({
      title,
      thumbnails,
    });
  } catch (err: any) {
    console.error("Thumbnail error:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch thumbnails." },
      { status: 500 }
    );
  }
}
