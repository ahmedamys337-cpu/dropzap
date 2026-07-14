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
    const media = await fetchInstagramMedia(url);
    if (media && media.images.length > 0) {
      imageUrl = media.images[0];
    }
  }

  if (!imageUrl) {
    return new Response("Could not resolve a fresh thumbnail URL", { status: 502 });
  }

  const response = await fetchImageAsResponse(imageUrl, filename);
  if (response) return response;

  // If we resolved the URL but can't proxy it, let the browser fetch it directly.
  return Response.redirect(imageUrl, 302);
}
