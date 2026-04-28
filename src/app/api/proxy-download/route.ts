import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cdnUrl = request.nextUrl.searchParams.get("url");
  const filename = request.nextUrl.searchParams.get("name") || "download.mp4";

  if (!cdnUrl) {
    return new Response(JSON.stringify({ error: "URL required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Fetch from CDN
    const cdnRes = await fetch(cdnUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!cdnRes.ok || !cdnRes.body) {
      return new Response(JSON.stringify({ error: "Failed to fetch from source" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get content info from CDN response
    const contentLength = cdnRes.headers.get("content-length");
    const contentType = cdnRes.headers.get("content-type") || "video/mp4";

    // Build response headers to force download
    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
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
    console.error("Proxy download error:", err.message);
    return new Response(JSON.stringify({ error: "Download failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
