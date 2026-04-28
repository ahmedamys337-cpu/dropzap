import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getVideoInfoSkipDownload } from "@/lib/ytdlp";

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

    const info = await getVideoInfoSkipDownload(url);

    const thumbnail = info.thumbnail || info.thumbnails?.[0]?.url;
    if (!thumbnail) {
      return NextResponse.json({ error: "No thumbnail found" }, { status: 404 });
    }

    return NextResponse.json({ thumbnail, title: info.title });
  } catch (err: any) {
    console.error("Instagram thumbnail error:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch Instagram thumbnail." },
      { status: 500 }
    );
  }
}
