import { getCookieHeader } from "@/lib/ytdlp";

// =============================================================================
// Shared Instagram extraction helpers
//
// Used by both /api/photos (image/carousel downloads) and /api/stream
// (reel/video downloads). The mobile/private API returns full metadata for
// public posts without cookies; valid session cookies unlock private/restricted
// posts. We fall back to public JSON and web scraping when the private API
// is blocked or returns empty items.
// =============================================================================

const IG_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export function shortcodeToMediaId(shortcode: string): string | null {
  let id = BigInt(0);
  const SIXTY_FOUR = BigInt(64);
  for (const c of shortcode) {
    const idx = IG_ALPHABET.indexOf(c);
    if (idx < 0) return null;
    id = id * SIXTY_FOUR + BigInt(idx);
  }
  return id.toString();
}

export function extractIgShortcode(url: string): string | null {
  // Matches /p/<code>, /reel/<code>, /tv/<code>, /reels/<code>
  const m = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  return m ? m[1] : null;
}

export function getInstagramCookieHeader(): string {
  // Try cookies for both subdomains; IG sets some cookies on i.instagram.com
  // and others on www.instagram.com. Combine when both exist.
  return [
    getCookieHeader("i.instagram.com"),
    getCookieHeader("www.instagram.com"),
  ].filter(Boolean).join("; ");
}

// Web-scraping fallback: fetch the Instagram post page and extract media URLs
// from embedded JSON blobs. Works for logged-out viewers of public posts when
// the private API returns empty items.
async function scrapeInstagramPage(
  postUrl: string,
  cookieHeader: string,
): Promise<{ images: string[]; video: string | null } | null> {
  const images: string[] = [];
  let video: string | null = null;

  const pageUrls = [
    postUrl,
    // Force www in case the user passed a mobile link
    postUrl.replace(/^https?:\/\/(m|l|www)\.instagram\.com/, "https://www.instagram.com"),
  ];
  const unique = [...new Set(pageUrls)];

  for (const pageUrl of unique) {
    try {
      const res = await fetch(pageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        redirect: "follow",
      });
      if (!res.ok) continue;
      const html = await res.text();

      // Strategy 1: Extract embedded JSON data blocks (new IG format uses
      // xdt_shortcode_media, additionalData, and __typename fields).
      const embeddedJsonRe = /<script[^>]*type=["']text\/javascript["'][^>]*>([\s\S]*?)<\/script>/gi;
      const jsonCandidates: any[] = [];
      for (const m of html.matchAll(embeddedJsonRe)) {
        const script = m[1].trim();
        if (!script || script.length < 20) continue;
        if (script.includes("xdt_shortcode_media") || script.includes("shortcode_media") || script.includes("\"GraphImage\"")) {
          try {
            const jsonText = script.replace(/^[^\{]*/, "").replace(/;\s*$/, "");
            const parsed = JSON.parse(jsonText);
            jsonCandidates.push(parsed);
          } catch {}
        }
      }
      for (const parsed of jsonCandidates) {
        const media =
          parsed?.xdt_shortcode_media ||
          parsed?.shortcode_media ||
          parsed?.graphql?.shortcode_media ||
          parsed?.media ||
          parsed?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
        if (media) {
          const edges = media.edge_sidecar_to_children?.edges;
          if (Array.isArray(edges)) {
            for (const edge of edges) {
              const node = edge?.node;
              if (node?.__typename === "GraphImage" && node?.display_url) images.push(node.display_url);
              if (node?.__typename === "GraphVideo" && node?.video_url) video = node.video_url;
            }
          }
          if (images.length === 0 && media.display_url) images.push(media.display_url);
          if (!video && media.video_url) video = media.video_url;
        }
      }

      // Strategy 2: Look for high-res image URLs in the page's JSON blobs.
      const displayUrlRe = /"display_url"\s*:\s*"(https?:\\?\/\\?\/[^"]+)"/gi;
      for (const m of html.matchAll(displayUrlRe)) {
        const u = m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
        if (/(scontent|cdninstagram)/i.test(u) && /\.(jpg|jpeg|png|webp)/i.test(u)) {
          images.push(u);
        }
      }

      // Strategy 3: og:image meta tag (single image posts)
      const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
      if (ogMatch) {
        const u = ogMatch[1].replace(/&amp;/g, "&");
        if (/(scontent|cdninstagram)/i.test(u)) images.push(u);
      }

      // Strategy 4: Look for image_versions2 candidates in embedded JSON
      const candidatesRe = /"candidates"\s*:\s*\[\s*\{\s*"width"\s*:\s*\d+\s*,\s*"height"\s*:\s*\d+\s*,\s*"url"\s*:\s*"(https?:[^"]+)"/gi;
      for (const m of html.matchAll(candidatesRe)) {
        const u = m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
        if (/(scontent|cdninstagram)/i.test(u) && !images.includes(u)) images.push(u);
      }

      // Strategy 5: Extract a direct video URL from embedded JSON or og:video
      const videoUrlRe = /"video_url"\s*:\s*"(https?:\\?\/\\?\/[^"]+)"/gi;
      for (const m of html.matchAll(videoUrlRe)) {
        const u = m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
        if (/(scontent|cdninstagram)/i.test(u)) {
          video = u;
          break;
        }
      }
      if (!video) {
        const ogVideo = html.match(/<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]+property=["']og:video:url["'][^>]+content=["']([^"']+)["']/i);
        if (ogVideo) {
          const u = ogVideo[1].replace(/&amp;/g, "&");
          if (/(scontent|cdninstagram)/i.test(u)) video = u;
        }
      }

      if (images.length > 0 || video) break;
    } catch (e: any) {
      console.warn(`[instagram] scrape ${pageUrl} threw:`, e?.message);
    }
  }

  // Deduplicate images and prefer the highest resolution
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const u of images) {
    const key = u.split("?")[0];
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(u);
    }
  }
  return deduped.length > 0 || video ? { images: deduped, video } : null;
}

async function fetchInstagramPublicJson(
  shortcode: string,
  cookieHeader: string,
): Promise<{ images: string[]; video: string | null } | null> {
  const url = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "X-Requested-With": "XMLHttpRequest",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const text = await res.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { return null; }

    const media = json?.graphql?.shortcode_media || json?.media || json?.items?.[0];
    if (!media) {
      console.warn(`[instagram] public JSON no media field. Keys: ${json ? Object.keys(json).join(",") : "null"}`);
      return null;
    }

    const images: string[] = [];
    let video: string | null = null;

    const edges = media?.edge_sidecar_to_children?.edges;
    if (Array.isArray(edges)) {
      for (const edge of edges) {
        const node = edge?.node;
        if (node?.__typename === "GraphImage" && node?.display_url) images.push(node.display_url);
        if (node?.__typename === "GraphVideo" && node?.video_url) video = node.video_url;
      }
    }
    if (images.length === 0 && media?.display_url) images.push(media.display_url);
    if (!video && media?.video_url) video = media.video_url;

    return images.length > 0 || video ? { images, video } : null;
  } catch (e: any) {
    console.warn(`[instagram] public JSON fetch threw:`, e?.message);
    return null;
  }
}

// Fetch the raw media item from Instagram's private mobile API.
// Returns null if every attempt fails.
async function fetchInstagramPrivateMedia(
  postUrl: string,
): Promise<{ item: any; cookieHeader: string } | null> {
  const shortcode = extractIgShortcode(postUrl);
  if (!shortcode) return null;
  const mediaId = shortcodeToMediaId(shortcode);
  if (!mediaId) return null;

  const cookieHeader = getInstagramCookieHeader();

  const headers: Record<string, string> = {
    "X-IG-App-ID": "936619743392459",
    "User-Agent": "Instagram 219.0.0.12.117 Android (28/9; 480dpi; 1080x2137; samsung; SM-N960U; crownqltesq; qcom; en_US; 346138365)",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
  };
  if (cookieHeader) headers["Cookie"] = cookieHeader;

  const apiUrls = [
    `https://i.instagram.com/api/v1/media/${mediaId}/info/`,
    `https://www.instagram.com/api/v1/media/${mediaId}/info/`,
  ];

  for (const apiUrl of apiUrls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout per API endpoint
      const res = await fetch(apiUrl, { headers, redirect: "follow", signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) continue;
      let text = "";
      try { text = await res.text(); } catch { continue; }
      let data: any = null;
      try { data = JSON.parse(text); } catch { data = null; }
      if (data?.items?.length > 0) {
        return { item: data.items[0], cookieHeader };
      }
      console.warn(`[instagram] ${apiUrl} returned OK but items empty/missing. Keys: ${data ? Object.keys(data).join(",") : "null"}, status: ${data?.status}, body[:200]: ${text.slice(0, 200)}`);
    } catch (e: any) {
      console.warn(`[instagram] fetch ${apiUrl} threw:`, e?.message);
    }
  }
  return null;
}

// Extract a raw Instagram media item using private API, then public JSON, then
// web scraping. Each source is tried in order; the first one to return usable
// data wins. This mirrors the extraction already used in /api/photos.
async function fetchInstagramMedia(
  postUrl: string,
): Promise<{ images: string[]; video: string | null; source: string } | null> {
  const cookieHeader = getInstagramCookieHeader();

  // 1. Private API
  const privateResult = await fetchInstagramPrivateMedia(postUrl);
  if (privateResult) {
    const { item } = privateResult;
    const images: string[] = [];
    let video: string | null = null;

    const slides = Array.isArray(item.carousel_media) && item.carousel_media.length > 0
      ? item.carousel_media
      : [item];

    for (const s of slides) {
      if (Array.isArray(s.video_versions) && s.video_versions.length > 0) {
        video = s.video_versions[0]?.url || null;
      }

      // Try several places Instagram puts the full-resolution image URL.
      const candidates = s?.image_versions2?.candidates;
      let img: string | undefined =
        s?.display_uri ||
        s?.display_url ||
        s?.image_versions2?.additional_candidates?.igtv_first_frame?.url ||
        (Array.isArray(candidates) && candidates[0]?.url);
      if (!img && Array.isArray(s?.thumbnails) && s.thumbnails.length > 0) {
        img = s.thumbnails[s.thumbnails.length - 1]?.url;
      }
      if (!img && typeof s?.thumbnail === "string") {
        img = s.thumbnail;
      }
      if (typeof img === "string" && /^https?:\/\//.test(img)) images.push(img);
    }

    if (images.length > 0 || video) {
      return { images, video, source: "private-api" };
    }
  }

  const shortcode = extractIgShortcode(postUrl);
  if (!shortcode) return null;

  // 2. Public JSON
  const publicJson = await fetchInstagramPublicJson(shortcode, cookieHeader);
  if (publicJson && (publicJson.images.length > 0 || publicJson.video)) {
    return { ...publicJson, source: "public-json" };
  }

  // 3. Web scrape - fallback when APIs fail or are blocked.
  // Instagram's private API and public JSON endpoints are increasingly
  // rate-limited and change response shape. The page HTML still embeds
  // image URLs (display_url, candidates, og:image) for public posts, so
  // scraping is a useful last-resort for photos.
  const scraped = await scrapeInstagramPage(postUrl, cookieHeader);
  if (scraped && (scraped.images.length > 0 || scraped.video)) {
    return { ...scraped, source: "web-scrape" };
  }

  return null;
}

export async function fetchInstagramImageUrls(postUrl: string): Promise<string[] | null> {
  const media = await fetchInstagramMedia(postUrl);
  if (!media || media.images.length === 0) return null;
  return media.images;
}

export async function fetchInstagramVideoUrl(postUrl: string): Promise<string | null> {
  const media = await fetchInstagramMedia(postUrl);
  if (!media || !media.video) return null;
  console.log(`[instagram] video resolved via ${media.source}: ${postUrl}`);
  return media.video;
}

export async function fetchInstagramThumbnailData(
  postUrl: string,
): Promise<{ thumbnail: string; title: string; width?: number; height?: number } | null> {
  // Use the same robust extraction chain that makes the reel downloader work.
  const media = await fetchInstagramMedia(postUrl);
  if (!media || media.images.length === 0) return null;
  return { thumbnail: media.images[0], title: "Instagram post" };
}
