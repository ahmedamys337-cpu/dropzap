import { NextRequest, NextResponse } from "next/server";
import { encodeShortUrl } from "@/lib/url-shortener";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const title = typeof body?.title === "string" ? body.title.trim() : "";

    if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";
    const code = encodeShortUrl(url);
    const shortUrl = `${siteUrl}/d/${code}`;

    return NextResponse.json({ shortUrl, code, originalUrl: url, title });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to shorten URL" }, { status: 500 });
  }
}
