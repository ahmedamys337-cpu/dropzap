import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getVideoInfoSkipDownload } from "@/lib/ytdlp";

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";

function extractShortcode(url: string): string | null {
  const match = url.match(/(?:\/p\/|\/reel\/|\/tv\/|\/reels\/)([A-Za-z0-9_-]+)/);
  return match?.[1] ?? null;
}

function extractMeta(html: string, prop: string): string | null {
  const byProp = new RegExp(
    `<meta[^>]*property=["']${prop}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
  const byContent = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${prop}["']`,
    "i"
  );
  return html.match(byProp)?.[1] ?? html.match(byContent)?.[1] ?? null;
}

async function fetchHtmlThumbnail(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": MOBILE_UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.instagram.com/",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Instagram HTML returned ${res.status}`);
  }

  const html = await res.text();
  const thumbnail = extractMeta(html, "og:image");
  if (!thumbnail) {
    throw new Error("No og:image found in Instagram HTML");
  }

  return {
    thumbnail,
    title: extractMeta(html, "og:title") || "Instagram post",
  };
}

async function fetchEmbedThumbnail(shortcode: string) {
  const res = await fetch(`https://www.instagram.com/p/${shortcode}/embed/`, {
    headers: {
      "User-Agent": MOBILE_UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.instagram.com/",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Instagram embed returned ${res.status}`);
  }

  const html = await res.text();
  const thumbnail = extractMeta(html, "og:image");
  if (!thumbnail) {
    throw new Error("No og:image found in Instagram embed");
  }

  return {
    thumbnail,
    title: extractMeta(html, "og:title") || "Instagram post",
  };
}

async function fetchYtdlpThumbnail(url: string) {
  const info = await getVideoInfoSkipDownload(url);
  const thumbnail = info.thumbnail || info.thumbnails?.[0]?.url;
  if (!thumbnail) {
    throw new Error("No thumbnail found via yt-dlp");
  }
  return { thumbnail, title: info.title || "Instagram post" };
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
    if (!url || !/instagram\.com/i.test(url)) {
      return NextResponse.json(
        { error: "A valid Instagram URL is required" },
        { status: 400 }
      );
    }

    // Strategy 1: Scrape the Instagram page HTML directly for og:image.
    try {
      const data = await fetchHtmlThumbnail(url);
      return NextResponse.json(data);
    } catch (htmlErr: any) {
      console.warn("[instagram/thumbnail] HTML scrape failed:", htmlErr.message);
    }

    // Strategy 2: Try the public embed page (works for many public posts).
    const shortcode = extractShortcode(url);
    if (shortcode) {
      try {
        const data = await fetchEmbedThumbnail(shortcode);
        return NextResponse.json(data);
      } catch (embedErr: any) {
        console.warn("[instagram/thumbnail] Embed fallback failed:", embedErr.message);
      }
    }

    // Strategy 3: yt-dlp as last resort (requires cookies/proxies on blocked IPs).
    try {
      const data = await fetchYtdlpThumbnail(url);
      return NextResponse.json(data);
    } catch (ytdlpErr: any) {
      console.error("[instagram/thumbnail] yt-dlp fallback failed:", ytdlpErr.message);
    }

    return NextResponse.json(
      { error: "Failed to fetch Instagram thumbnail. The post may be private or restricted." },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("Instagram thumbnail error:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch Instagram thumbnail." },
      { status: 500 }
    );
  }
}
