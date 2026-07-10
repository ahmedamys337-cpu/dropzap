import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface ThumbnailResult {
  platform: string;
  title: string;
  thumbnails: { label: string; url: string; width?: number; height?: number }[];
}

function detectPlatform(url: string): string {
  if (/tiktok\.com/i.test(url)) return "tiktok";
  if (/instagram\.com/i.test(url)) return "instagram";
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/twitter\.com|x\.com/i.test(url)) return "twitter";
  if (/facebook\.com|fb\.watch/i.test(url)) return "facebook";
  if (/reddit\.com/i.test(url)) return "reddit";
  if (/pinterest\.com/i.test(url)) return "pinterest";
  if (/threads\.net/i.test(url)) return "threads";
  return "unknown";
}

async function fetchTikTokThumbnail(url: string): Promise<ThumbnailResult> {
  const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("TikTok oembed failed");
  const data = await res.json();
  return {
    platform: "tiktok",
    title: data.title || "TikTok video",
    thumbnails: data.thumbnail_url
      ? [{ label: "TikTok Cover", url: data.thumbnail_url, width: 1080, height: 1920 }]
      : [],
  };
}

async function fetchInstagramThumbnail(url: string): Promise<ThumbnailResult> {
  // Reuse the Instagram thumbnail endpoint internally.
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital"}/api/instagram/thumbnail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Instagram thumbnail failed");
  return {
    platform: "instagram",
    title: data.title || "Instagram post",
    thumbnails: data.thumbnail ? [{ label: "Instagram Thumbnail", url: data.thumbnail }] : [],
  };
}

async function fetchYouTubeThumbnail(url: string): Promise<ThumbnailResult> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital"}/api/youtube/thumbnail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "YouTube thumbnail failed");
  return {
    platform: "youtube",
    title: data.title || "YouTube video",
    thumbnails: data.thumbnails || [],
  };
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

    const platform = detectPlatform(url);
    let result: ThumbnailResult;

    switch (platform) {
      case "tiktok":
        result = await fetchTikTokThumbnail(url);
        break;
      case "instagram":
        result = await fetchInstagramThumbnail(url);
        break;
      case "youtube":
        result = await fetchYouTubeThumbnail(url);
        break;
      default:
        return NextResponse.json(
          { error: "Thumbnail extraction is supported for TikTok, Instagram, and YouTube URLs only." },
          { status: 400 }
        );
    }

    if (!result.thumbnails || result.thumbnails.length === 0) {
      return NextResponse.json({ error: "No thumbnail found for this URL." }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Thumbnail error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch thumbnail." },
      { status: 500 }
    );
  }
}
