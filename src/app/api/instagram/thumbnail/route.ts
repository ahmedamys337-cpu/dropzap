import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getVideoInfoSkipDownload } from "@/lib/ytdlp";

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";
const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

interface InstagramMedia {
  thumbnail: string;
  title: string;
  width?: number;
  height?: number;
}

function extractShortcode(url: string): string | null {
  const match = url.match(/(?:\/p\/|\/reel\/|\/tv\/|\/reels\/)([A-Za-z0-9_-]+)/);
  return match?.[1] ?? null;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#x22;/gi, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#x26;/gi, '&')
    .replace(/&#38;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/gi, '/')
    .replace(/&#47;/g, '/')
    .replace(/&#064;/g, '@')
    .replace(/&#x40;/gi, '@')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'");
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
  const raw = html.match(byProp)?.[1] ?? html.match(byContent)?.[1] ?? null;
  return raw ? decodeHtmlEntities(raw) : null;
}

function parseMediaNode(media: any): InstagramMedia | null {
  if (!media) return null;

  if (media.__typename === "GraphSidecar") {
    const firstChild = media.edge_sidecar_to_children?.edges?.[0]?.node;
    if (firstChild) {
      return parseMediaNode({ ...firstChild, edge_media_to_caption: media.edge_media_to_caption });
    }
  }

  let title = "Instagram post";
  const captionEdges = media.edge_media_to_caption?.edges;
  if (captionEdges && captionEdges.length > 0) {
    title = captionEdges[0].node.text || title;
  } else if (media.title) {
    title = media.title;
  }

  // Prefer thumbnail_src — it's Instagram's official cover image and
  // doesn't have a baked-in play button overlay like some display_url frames.
  const thumbnail =
    media.thumbnail_src || media.display_url || media.display_src;
  if (!thumbnail) return null;

  return {
    thumbnail,
    title,
    width: media.dimensions?.width,
    height: media.dimensions?.height,
  };
}

function findMediaNode(obj: any): any {
  if (!obj || typeof obj !== "object") return null;
  if (obj.__typename && (obj.display_url || obj.thumbnail_src || obj.display_src)) return obj;
  for (const key of Object.keys(obj)) {
    const found = findMediaNode(obj[key]);
    if (found) return found;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findMediaNode(item);
      if (found) return found;
    }
  }
  return null;
}

function extractFromEmbeddedJson(html: string): InstagramMedia | null {
  // window._sharedData is the classic Instagram payload.
  const sharedDataMatch = html.match(/window\._sharedData\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
  if (sharedDataMatch) {
    try {
      const data = JSON.parse(sharedDataMatch[1]);
      const media = data?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
      if (media) {
        const parsed = parseMediaNode(media);
        if (parsed) return parsed;
      }
    } catch {
      // ignore parse errors
    }
  }

  // Newer hydration uses <script type="application/json" data-sjs> blocks.
  const jsonMatches = html.matchAll(
    /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const match of jsonMatches) {
    try {
      const data = JSON.parse(match[1]);
      const media = findMediaNode(data);
      if (media) {
        const parsed = parseMediaNode(media);
        if (parsed) return parsed;
      }
    } catch {
      // ignore parse errors
    }
  }

  return null;
}

async function fetchHtmlThumbnail(url: string): Promise<InstagramMedia> {
  // Desktop UA is more likely to receive window._sharedData with full media info.
  const fetchWithUa = async (ua: string) => {
    const res = await fetch(url, {
      headers: {
        "User-Agent": ua,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.instagram.com/",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Instagram HTML returned ${res.status}`);
    return res.text();
  };

  let html: string;
  try {
    html = await fetchWithUa(DESKTOP_UA);
  } catch {
    html = await fetchWithUa(MOBILE_UA);
  }

  // Try embedded JSON first — it gives the original cover without play button overlay.
  const jsonData = extractFromEmbeddedJson(html);
  if (jsonData) return jsonData;

  const thumbnail = extractMeta(html, "og:image");
  if (!thumbnail) {
    throw new Error("No og:image found in Instagram HTML");
  }

  return {
    thumbnail,
    title: extractMeta(html, "og:title") || "Instagram post",
  };
}

async function fetchEmbedThumbnail(shortcode: string): Promise<InstagramMedia> {
  const res = await fetch(`https://www.instagram.com/p/${shortcode}/embed/`, {
    headers: {
      "User-Agent": DESKTOP_UA,
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

  const jsonData = extractFromEmbeddedJson(html);
  if (jsonData) return jsonData;

  const thumbnail = extractMeta(html, "og:image");
  if (!thumbnail) {
    throw new Error("No og:image found in Instagram embed");
  }

  return {
    thumbnail,
    title: extractMeta(html, "og:title") || "Instagram post",
  };
}

async function fetchYtdlpThumbnail(url: string): Promise<InstagramMedia> {
  const info = await getVideoInfoSkipDownload(url);
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

    // Strategy 1: Scrape the Instagram page HTML; prefer embedded JSON (HD, no play button).
    try {
      const data = await fetchHtmlThumbnail(url);
      return NextResponse.json(data);
    } catch (htmlErr: any) {
      console.warn("[instagram/thumbnail] HTML scrape failed:", htmlErr.message);
    }

    // Strategy 2: Try the public embed page.
    const shortcode = extractShortcode(url);
    if (shortcode) {
      try {
        const data = await fetchEmbedThumbnail(shortcode);
        return NextResponse.json(data);
      } catch (embedErr: any) {
        console.warn("[instagram/thumbnail] Embed fallback failed:", embedErr.message);
      }
    }

    // Strategy 3: yt-dlp as last resort.
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
