import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { fetchInstagramThumbnailData } from "@/lib/instagram";
import { logger } from "@/lib/logger";

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
  // 1. Try oEmbed with proper browser headers
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.thumbnail_url) {
        return {
          platform: "tiktok",
          title: data.title || "TikTok video",
          thumbnails: [{ label: "TikTok Cover", url: data.thumbnail_url, width: 1080, height: 1920 }],
        };
      }
    }
  } catch (e: any) {
    logger.warn("[thumbnail:tiktok] oembed failed:", e?.message);
  }

  // 2. Fallback: scrape the TikTok page for og:image meta tag
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const html = await res.text();
      // og:image
      const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
      if (ogMatch) {
        const thumbUrl = ogMatch[1].replace(/&amp;/g, "&");
        // og:title for the caption
        const titleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
        return {
          platform: "tiktok",
          title: titleMatch ? titleMatch[1] : "TikTok video",
          thumbnails: [{ label: "TikTok Cover", url: thumbUrl, width: 1080, height: 1920 }],
        };
      }
      // Also try og:video:thumbnail
      const ogVideoThumb = html.match(/<meta[^>]+property=["']og:video:thumbnail["'][^>]+content=["']([^"']+)["']/i);
      if (ogVideoThumb) {
        return {
          platform: "tiktok",
          title: "TikTok video",
          thumbnails: [{ label: "TikTok Cover", url: ogVideoThumb[1].replace(/&amp;/g, "&"), width: 1080, height: 1920 }],
        };
      }
    }
  } catch (e: any) {
    logger.warn("[thumbnail:tiktok] page scrape failed:", e?.message);
  }

  throw new Error("Could not fetch TikTok thumbnail. The video may be private or deleted.");
}

async function fetchInstagramThumbnail(url: string): Promise<ThumbnailResult> {
  const data = await fetchInstagramThumbnailData(url);
  if (!data) throw new Error("Instagram thumbnail extraction failed");
  return {
    platform: "instagram",
    title: data.title || "Instagram post",
    thumbnails: [
      {
        label: "Instagram Thumbnail",
        url: data.thumbnail,
        width: data.width,
        height: data.height,
      },
    ],
  };
}

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

async function fetchYouTubeThumbnail(url: string): Promise<ThumbnailResult> {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error("Could not extract YouTube video ID");

  let title = "YouTube Video";
  try {
    const oembed = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (oembed.ok) {
      const data = await oembed.json();
      title = data.title || title;
    }
  } catch {}

  const isShorts = /\/shorts\//i.test(url);
  const sizes = isShorts
    ? [
        { key: "oar2", label: "Max Resolution (Portrait)", width: 1080, height: 1920 },
        { key: "oarhqdefault", label: "High (Portrait)", width: 360, height: 640 },
        { key: "oarmqdefault", label: "Medium (Portrait)", width: 320, height: 568 },
        { key: "oardefault", label: "Default (Portrait)", width: 168, height: 298 },
      ]
    : [
        { key: "default", label: "Default", width: 120, height: 90 },
        { key: "mqdefault", label: "Medium", width: 320, height: 180 },
        { key: "hqdefault", label: "High", width: 480, height: 360 },
        { key: "sddefault", label: "Standard", width: 640, height: 480 },
        { key: "maxresdefault", label: "Max Resolution", width: 1280, height: 720 },
      ];

  return {
    platform: "youtube",
    title,
    thumbnails: sizes.map((s) => ({
      label: s.label,
      url: `https://i.ytimg.com/vi/${videoId}/${s.key}.jpg`,
      width: s.width,
      height: s.height,
    })),
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
    logger.error("Thumbnail error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch thumbnail." },
      { status: 500 }
    );
  }
}
