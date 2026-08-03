import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { fetchInstagramMedia } from "@/lib/instagram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ALLOWED_HOSTS = [
  /tiktokcdn\.com$/i,
  /tiktokcdn-us\.com$/i,
  /ibytedtos\.com$/i,
  /cdninstagram\.com$/i,
  /fbcdn\.net$/i,
  /scontent.*\.cdninstagram\.com$/i,
  /scontent.*\.fbcdn\.net$/i,
  /i\.ytimg\.com$/i,
  /img\.youtube\.com$/i,
  /twimg\.com$/i,
  /redd\.it$/i,
  /pinimg\.com$/i,
];

function isAllowedHost(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return ALLOWED_HOSTS.some((re) => re.test(u.hostname));
  } catch {
    return false;
  }
}

async function fetchTikTokThumbnailUrl(postUrl: string): Promise<string | null> {
  try {
    const u = new URL("https://www.tiktok.com/oembed");
    u.searchParams.set("url", postUrl);
    const res = await fetch(u.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const thumb = json?.thumbnail_url;
    if (typeof thumb === "string" && /^https?:\/\//.test(thumb)) return thumb;
  } catch (e: any) {
    logger.warn("[thumbnail:download] tiktok oembed threw:", e?.message);
  }
  return null;
}

async function fetchInstagramThumbnailUrlSimple(postUrl: string): Promise<string | null> {
  try {
    // Simple approach: scrape og:image from the Instagram page
    const res = await fetch(postUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    
    // Try og:image first
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogMatch) {
      const thumbUrl = ogMatch[1].replace(/&amp;/g, "&");
      if (/^https?:\/\//.test(thumbUrl)) return thumbUrl;
    }
    
    // Fallback to og:video:thumbnail
    const ogVideoThumb = html.match(/<meta[^>]+property=["']og:video:thumbnail["'][^>]+content=["']([^"']+)["']/i);
    if (ogVideoThumb) {
      const thumbUrl = ogVideoThumb[1].replace(/&amp;/g, "&");
      if (/^https?:\/\//.test(thumbUrl)) return thumbUrl;
    }
    
    // Fallback to image URL in JSON
    const imgMatch = html.match(/"display_url"\s*:\s*"(https?:\\?\/\\?\/[^"]+)"/i);
    if (imgMatch) {
      const thumbUrl = imgMatch[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
      if (/^https?:\/\//.test(thumbUrl)) return thumbUrl;
    }
  } catch (e: any) {
    logger.warn("[thumbnail:download] Instagram page scrape failed:", e?.message);
  }
  return null;
}

async function fetchImageAsResponse(imageUrl: string, filename: string): Promise<Response | null> {
  if (!isAllowedHost(imageUrl)) return null;

  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/png,image/jpeg,*/*",
    "Accept-Language": "en-US,en;q=0.9",
  };
  if (/tiktokcdn/i.test(imageUrl)) {
    headers["Referer"] = "https://www.tiktok.com/";
    headers["Origin"] = "https://www.tiktok.com";
  } else if (/cdninstagram|scontent/i.test(imageUrl)) {
    headers["Referer"] = "https://www.instagram.com/";
  }

  try {
    const res = await fetch(imageUrl, { headers, redirect: "follow" });
    if (!res.ok || !res.body) return null;

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const contentLength = res.headers.get("content-length");
    const outHeaders = new Headers();
    const safeAscii = filename.replace(/[^\x20-\x7E]/g, "").replace(/"/g, "");
    outHeaders.set("Content-Disposition", `attachment; filename="${safeAscii}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    outHeaders.set("Content-Type", contentType);
    if (contentLength) outHeaders.set("Content-Length", contentLength);
    outHeaders.set("Cache-Control", "no-store");
    return new Response(res.body, { status: 200, headers: outHeaders });
  } catch (e: any) {
    logger.warn("[thumbnail:download] fetch image threw:", e?.message);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const { url, platform } = await request.json().catch(() => ({ url: null, platform: null }));
  if (!url || !platform) {
    return new Response("url and platform are required", { status: 400 });
  }

  let imageUrl: string | null = null;
  let filename = `${platform}-thumbnail.jpg`;

  if (platform === "tiktok") {
    imageUrl = await fetchTikTokThumbnailUrl(url);
  } else if (platform === "instagram") {
    // Use simpler page scraping approach first
    imageUrl = await fetchInstagramThumbnailUrlSimple(url);
    if (!imageUrl) {
      // Fallback to the more complex extraction
      try {
        const media = await fetchInstagramMedia(url);
        if (media && media.images.length > 0) {
          imageUrl = media.images[0];
          logger.log(`[thumbnail:download] Instagram thumbnail resolved via ${media.source} (fallback)`);
        } else {
          logger.warn("[thumbnail:download] fetchInstagramMedia returned no images");
        }
      } catch (e: any) {
        logger.error("[thumbnail:download] fetchInstagramMedia failed:", e?.message);
      }
    } else {
      logger.log("[thumbnail:download] Instagram thumbnail resolved via simple page scrape");
    }
  }

  if (!imageUrl) {
    logger.error(`[thumbnail:download] Could not resolve thumbnail URL for ${platform}`);
    return new Response(JSON.stringify({ error: "Could not resolve a fresh thumbnail URL" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = await fetchImageAsResponse(imageUrl, filename);
  if (response) return response;

  // If we resolved the URL but can't proxy it from the datacenter, tell the
  // client to download it directly from the browser (residential IP usually works).
  logger.log(`[thumbnail:download] Returning URL for client-side download: ${imageUrl}`);
  return new Response(JSON.stringify({ url: imageUrl, useClient: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
