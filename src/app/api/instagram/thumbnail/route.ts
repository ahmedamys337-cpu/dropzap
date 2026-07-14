import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getVideoInfoSkipDownload } from "@/lib/ytdlp";
import { fetchInstagramThumbnailData, extractIgShortcode } from "@/lib/instagram";

const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

interface InstagramMedia {
  thumbnail: string;
  title: string;
  width?: number;
  height?: number;
}


async function fetchYtdlpThumbnail(url: string): Promise<InstagramMedia> {
  const info = await Promise.race([
    getVideoInfoSkipDownload(url),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("yt-dlp timeout")), 8000)
    ),
  ]);
  const thumbnail = info.thumbnail || info.thumbnails?.[0]?.url;
  if (!thumbnail) {
    throw new Error("No thumbnail found via yt-dlp");
  }
  return {
    thumbnail,
    title: info.title || "Instagram post",
    width: info.width,
    height: info.height,
  };
}

async function fetchScraperApiThumbnail(url: string): Promise<InstagramMedia> {
  const template = process.env.INSTAGRAM_SCRAPER_API_URL?.trim();
  if (!template) {
    throw new Error("Scraper API not configured (missing INSTAGRAM_SCRAPER_API_URL)");
  }

  const shortcode = extractIgShortcode(url);
  const populated = template
    .replace(/\{url\}/g, encodeURIComponent(url))
    .replace(/\{shortcode\}/g, encodeURIComponent(shortcode || ""));

  const method = (process.env.INSTAGRAM_SCRAPER_API_METHOD || "POST").toUpperCase();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": DESKTOP_UA,
  };

  let res: Response;
  if (method === "GET") {
    res = await fetch(populated, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
  } else {
    headers["Content-Type"] = "application/json";
    const bodyField = process.env.INSTAGRAM_SCRAPER_API_BODY_FIELD || "url";
    res = await fetch(populated, {
      method: "POST",
      headers,
      body: JSON.stringify({ [bodyField]: url }),
      signal: AbortSignal.timeout(8000),
    });
  }

  if (!res.ok) {
    throw new Error(`Scraper API returned ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "";
  let data: any;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const html = await res.text();
    // Try to find an image URL in the HTML.
    const imgMatch = html.match(/<img[^>]+src=["'](https?:[^"']+\.(?:jpg|jpeg|png|webp))["']/i);
    const thumbnail = imgMatch?.[1] ?? null;
    if (!thumbnail) {
      throw new Error("No image URL found in scraper HTML response");
    }
    return { thumbnail, title: "Instagram post" };
  }

  const thumbnail = findImageUrl(data);
  if (!thumbnail) {
    throw new Error("No thumbnail URL found in scraper API response");
  }
  return {
    thumbnail,
    title: findTitle(data) || "Instagram post",
  };
}

function findImageUrl(obj: any): string | null {
  if (!obj) return null;
  if (typeof obj === "string") {
    if (/\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(obj)) return obj;
    return null;
  }
  if (typeof obj !== "object") return null;
  // Direct fields common in downloader APIs
  for (const key of ["thumbnail", "cover", "image", "url", "preview", "src", "display_url"]) {
    const val = obj[key];
    if (typeof val === "string" && /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(val)) return val;
  }
  // Nested arrays (e.g. medias[0].url, images[0].url)
  for (const val of Object.values(obj)) {
    if (Array.isArray(val)) {
      for (const item of val) {
        const found = findImageUrl(item);
        if (found) return found;
      }
    } else if (typeof val === "object") {
      const found = findImageUrl(val);
      if (found) return found;
    }
  }
  return null;
}

function findTitle(obj: any): string | null {
  if (!obj || typeof obj !== "object") return null;
  for (const key of ["title", "caption", "description", "text", "name"]) {
    const val = obj[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  for (const val of Object.values(obj)) {
    if (Array.isArray(val)) {
      for (const item of val) {
        const found = findTitle(item);
        if (found) return found;
      }
    } else if (typeof val === "object") {
      const found = findTitle(val);
      if (found) return found;
    }
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
    if (!url || !/instagram\.com/i.test(url)) {
      return NextResponse.json(
        { error: "A valid Instagram URL is required" },
        { status: 400 }
      );
    }

    // Strategy 1-3: Use the consolidated extraction from lib/instagram.ts
    // (private API → public JSON → web scrape, all in one function).
    try {
      const data = await fetchInstagramThumbnailData(url);
      if (data) {
        return NextResponse.json(data);
      }
    } catch (e: any) {
      console.warn("[instagram/thumbnail] Consolidated extraction failed:", e.message);
    }

    // Strategy 5: yt-dlp as last resort.
    try {
      const data = await fetchYtdlpThumbnail(url);
      return NextResponse.json(data);
    } catch (ytdlpErr: any) {
      console.error("[instagram/thumbnail] yt-dlp fallback failed:", ytdlpErr.message);
    }

    // Strategy 6: Configurable third-party scraper API (e.g., GrabGram-style endpoint).
    try {
      const data = await fetchScraperApiThumbnail(url);
      return NextResponse.json(data);
    } catch (scraperErr: any) {
      console.warn("[instagram/thumbnail] Scraper API fallback failed:", scraperErr.message);
    }

    console.error(
      "[instagram/thumbnail] All strategies failed. Instagram is likely requiring authentication or blocking this server's IP. " +
        "Set MEDIA_COOKIES_INSTAGRAM (fresh Instagram session cookies), YOUTUBE_PROXIES, or INSTAGRAM_SCRAPER_API_URL to restore access."
    );
    return NextResponse.json(
      {
        error:
          "Instagram is blocking this request. Public posts can still be blocked when Instagram requires a login or rate-limits the server. " +
          "Fix options: set fresh Instagram cookies (MEDIA_COOKIES_INSTAGRAM), a proxy (YOUTUBE_PROXIES), or a third-party scraper URL (INSTAGRAM_SCRAPER_API_URL).",
      },
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
