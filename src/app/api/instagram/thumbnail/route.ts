import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getVideoInfoSkipDownload, getCookieHeader } from "@/lib/ytdlp";

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

async function fetchInternalApiThumbnail(shortcode: string): Promise<InstagramMedia> {
  const cookieHeader = getCookieHeader("i.instagram.com");
  const headers: Record<string, string> = {
    "User-Agent": MOBILE_UA,
    Accept: "*/*",
    "X-IG-App-ID": "936619743392459",
    "X-Requested-With": "XMLHttpRequest",
    Referer: "https://www.instagram.com/",
  };
  if (cookieHeader) headers.Cookie = cookieHeader;

  const res = await fetch(`https://i.instagram.com/api/v1/media/${shortcode}/info/`, {
    headers,
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) {
    throw new Error(`Instagram internal API returned ${res.status}`);
  }

  const data = await res.json();
  const item = data?.items?.[0];
  if (!item) {
    throw new Error("No media item in internal API response");
  }

  // For carousels, use the first image's cover.
  let mediaNode: any = item;
  if (item.carousel_media && item.carousel_media.length > 0) {
    mediaNode = item.carousel_media[0];
  }

  const candidates = mediaNode.image_versions2?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error("No image candidates in internal API response");
  }

  const best = candidates.sort(
    (a: any, b: any) => (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0)
  )[0];

  const caption = item.caption?.text || mediaNode.caption?.text || "";
  return {
    thumbnail: best.url,
    title: caption || "Instagram post",
    width: best.width,
    height: best.height,
  };
}

async function fetchWebApiThumbnail(shortcode: string): Promise<InstagramMedia> {
  const cookieHeader = getCookieHeader("www.instagram.com");
  const headers: Record<string, string> = {
    "User-Agent": DESKTOP_UA,
    Accept: "*/*",
    "X-IG-App-ID": "936619743392459",
    Referer: "https://www.instagram.com/",
  };
  if (cookieHeader) headers.Cookie = cookieHeader;

  const res = await fetch(
    `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`,
    {
      headers,
      signal: AbortSignal.timeout(6000),
    }
  );

  if (!res.ok) {
    throw new Error(`Instagram web API returned ${res.status}`);
  }

  const data = await res.json();
  const media = data?.graphql?.shortcode_media;
  if (!media) {
    throw new Error("No media in Instagram web API response");
  }

  const parsed = parseMediaNode(media);
  if (!parsed) {
    throw new Error("Could not parse Instagram web API media");
  }
  return parsed;
}

async function fetchHtmlThumbnail(url: string): Promise<InstagramMedia> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": DESKTOP_UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.instagram.com/",
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) {
    throw new Error(`Instagram HTML returned ${res.status}`);
  }

  const html = await res.text();

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
    signal: AbortSignal.timeout(6000),
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

  const shortcode = extractShortcode(url);
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

    const shortcode = extractShortcode(url);

    // Strategy 1: Instagram internal API.
    if (shortcode) {
      try {
        const data = await fetchInternalApiThumbnail(shortcode);
        return NextResponse.json(data);
      } catch (apiErr: any) {
        console.warn("[instagram/thumbnail] Internal API failed:", apiErr.message);
      }
    }

    // Strategy 2: Instagram web API (?__a=1) — works for many public posts.
    if (shortcode) {
      try {
        const data = await fetchWebApiThumbnail(shortcode);
        return NextResponse.json(data);
      } catch (webErr: any) {
        console.warn("[instagram/thumbnail] Web API failed:", webErr.message);
      }
    }

    // Strategy 3: Scrape the Instagram page HTML; prefer embedded JSON.
    try {
      const data = await fetchHtmlThumbnail(url);
      return NextResponse.json(data);
    } catch (htmlErr: any) {
      console.warn("[instagram/thumbnail] HTML scrape failed:", htmlErr.message);
    }

    // Strategy 4: Try the public embed page.
    if (shortcode) {
      try {
        const data = await fetchEmbedThumbnail(shortcode);
        return NextResponse.json(data);
      } catch (embedErr: any) {
        console.warn("[instagram/thumbnail] Embed fallback failed:", embedErr.message);
      }
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
