import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { startDownload } from "@/lib/download-manager";

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
    const body = await request.json();
    const { url, formatId, audioOnly, bitrate, platform } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const jobId = startDownload({ url, formatId, audioOnly, bitrate, platform });

    return NextResponse.json({ jobId });
  } catch (err: any) {
    console.error("Start download error:", err.message);
    return NextResponse.json(
      { error: "Failed to start download." },
      { status: 500 }
    );
  }
}
