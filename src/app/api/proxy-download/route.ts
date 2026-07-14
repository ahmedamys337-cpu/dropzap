import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = [
  /^i\.ytimg\.com$/i,
  /^img\.youtube\.com$/i,
  /cdninstagram\.com$/i,
  /fbcdn\.net$/i,
  /twimg\.com$/i,
  /tiktokcdn\.com$/i,
  /redd\.it$/i,
  /pinimg\.com$/i,
  /scontent.*\.cdninstagram\.com$/i,
];

function isAllowedHost(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return false;
    if (u.hostname.startsWith("169.254.")) return false;
    if (u.hostname.startsWith("10.")) return false;
    if (u.hostname.startsWith("192.168.")) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname)) return false;
    if (u.hostname === "0.0.0.0" || u.hostname === "::1") return false;
    return ALLOWED_HOSTS.some((re) => re.test(u.hostname));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const cdnUrl = request.nextUrl.searchParams.get("url");
  const filename = request.nextUrl.searchParams.get("name") || "download.mp4";

  if (!cdnUrl) {
    return new Response(JSON.stringify({ error: "URL required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isAllowedHost(cdnUrl)) {
    return new Response(JSON.stringify({ error: "URL host not allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Platform-specific headers make CDN blocks much less likely.
    const proxyHeaders: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "image/avif,image/webp,image/apng,image/png,image/jpeg,*/*",
      "Accept-Language": "en-US,en;q=0.9",
    };
    if (/tiktokcdn/i.test(cdnUrl)) {
      proxyHeaders["Referer"] = "https://www.tiktok.com/";
      proxyHeaders["Origin"] = "https://www.tiktok.com";
    } else if (/cdninstagram|scontent/i.test(cdnUrl)) {
      proxyHeaders["Referer"] = "https://www.instagram.com/";
    }

    // Fetch from CDN
    const cdnRes = await fetch(cdnUrl, {
      headers: proxyHeaders,
      redirect: "follow",
    });

    if (!cdnRes.ok || !cdnRes.body) {
      // Last resort: redirect the browser straight to the CDN URL. The user
      // may get the image opened inline, but it's better than a broken download.
      return Response.redirect(cdnUrl, 302);
    }

    // Get content info from CDN response
    const contentLength = cdnRes.headers.get("content-length");
    const contentType = cdnRes.headers.get("content-type") || "video/mp4";

    // Build response headers to force download
    const headers = new Headers();
    const safeAscii = filename.replace(/[^\x20-\x7E]/g, "").replace(/"/g, "");
    headers.set("Content-Disposition", `attachment; filename="${safeAscii}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    headers.set("Content-Type", contentType);
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    headers.set("Cache-Control", "no-store");

    // Pipe CDN stream directly to user (no disk, minimal memory)
    return new Response(cdnRes.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    logger.error("Proxy download error:", err.message);
    // Graceful fallback: send the user to the original URL instead of an error page.
    return Response.redirect(cdnUrl, 302);
  }
}
