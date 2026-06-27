---
platform: devto
title: "How DropZap Handles Instagram and TikTok Downloads: A Technical Walkthrough"
tags: ["webdev", "nextjs", "api", "typescript", "tools"]
canonical_url: "https://www.dropzap.digital"
status: draft
---

# How DropZap Handles Instagram and TikTok Downloads: A Technical Walkthrough

[DropZap](https://www.dropzap.digital) is a free social media video downloader built with Next.js 14. It handles Instagram, TikTok, Twitter/X, Facebook, Reddit, Pinterest, and Threads — all from one interface. I want to walk through the technical approach behind the two most complex platforms: **Instagram** and **TikTok**.

---

## Stack Overview

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Download engine:** `yt-dlp` via Node child process
- **Audio merging:** `ffmpeg` (for Reddit, and some formats)
- **UI:** Tailwind CSS + shadcn/ui
- **Hosting:** Render / Railway (Docker container)

---

## Instagram Download Flow

Instagram is complex because it serves three distinct content types that require different handling:

### 1. Reels and Video Posts

The API route `/api/stream` receives the Instagram post URL from the client. The server spawns `yt-dlp` with the URL and `--format bestvideo+bestaudio/best` flags.

```typescript
// Simplified — actual route handles cookies + proxies
const result = await execa('yt-dlp', [
  '--format', 'bestvideo+bestaudio/best',
  '--merge-output-format', 'mp4',
  '--output', '-',  // pipe to stdout
  instagramUrl
]);
```

The raw bytes are streamed back to the client via a `ReadableStream`. This avoids writing temp files to disk on the server, keeping the container stateless.

### 2. Photos (Single Image Posts)

For photo posts, `yt-dlp` extracts the direct CDN URL of the JPEG. We then proxy the CDN response to the client with `Content-Disposition: attachment` headers so the browser triggers a download instead of navigating to the image.

### 3. Carousels (Multi-Slide Posts)

Carousels are the trickiest. A single Instagram carousel URL can contain 2–20 slides. `yt-dlp` returns them as a playlist of individual entries.

The server:
1. Runs `yt-dlp --dump-json` to get the manifest of all slide URLs
2. Fetches each slide in parallel using `Promise.all`
3. Packages them into a ZIP using the `archiver` npm package
4. Streams the ZIP to the client

```typescript
import archiver from 'archiver';

const archive = archiver('zip', { zlib: { level: 5 } });
// pipe archive to response
res.setHeader('Content-Type', 'application/zip');
archive.pipe(res);

for (const [i, slideUrl] of slides.entries()) {
  const imageStream = await fetch(slideUrl).then(r => r.body);
  archive.append(imageStream, { name: `slide-${i + 1}.jpg` });
}

await archive.finalize();
```

---

## TikTok Download Flow

TikTok is more aggressive about blocking programmatic access than Instagram. The key challenges:

### Watermark Removal

TikTok serves two versions of each video:
- A "watermarked" version (with the floating TikTok logo + username)
- A "no-watermark" version accessible via a different CDN path

`yt-dlp` knows which endpoint to hit for the no-watermark version because it parses TikTok's internal API response, which includes a `play_addr_h264` field pointing to the clean copy. This is the same mechanism that tools like ssstik and SnapTik use.

### Rate Limiting and Anti-Bot

TikTok's API endpoints rotate and require specific request headers (`User-Agent`, `Referer`, and a session token derived from the device signature). `yt-dlp` maintains an updater that tracks these header requirements and patches them when TikTok changes their scheme — which happens roughly every 2–4 weeks.

This is why keeping `yt-dlp` updated is critical. In the Dockerfile:

```dockerfile
# Always pull the latest yt-dlp binary at build time
RUN pip install --upgrade yt-dlp
```

On production, a weekly cron job runs `yt-dlp --update-to nightly` to stay ahead of TikTok API changes.

---

## Rate Limiting on the DropZap Side

The app applies a server-side rate limiter (1 request per 5 seconds per IP) using an in-memory `Map` to track timestamps. No Redis needed for the traffic levels a free tool receives — if this ever needed to scale horizontally, swapping to Redis would be a one-line change.

```typescript
// lib/rate-limit.ts
const requests = new Map<string, number>();

export function checkRateLimit(ip: string): boolean {
  const last = requests.get(ip) ?? 0;
  const now = Date.now();
  if (now - last < 5000) return false; // 5 second window
  requests.set(ip, now);
  return true;
}
```

---

## Performance Decisions

**Code splitting:** Every downloader tab is loaded via `next/dynamic` with `ssr: false`. Only Instagram (the default tab) is statically bundled. This cut unused-JS budget by ~317 KiB in a PageSpeed audit.

**Streaming responses:** Video bytes are streamed from `yt-dlp`'s stdout directly to the HTTP response. The server never writes a temp file to disk. This matters both for latency and for running on containers with limited ephemeral storage.

**No client-side state persistence:** The download history feature was removed after user feedback that it confused people. `localStorage` had a habit of showing stale "pending" entries. Simpler is better.

---

## Try It

The live tool is at [dropzap.digital](https://www.dropzap.digital). Instagram is the default tab; TikTok is next. Paste any public post URL, hit Download.

If you're building something similar and have questions about any specific part of the architecture — cookie handling, the archiver pipeline, the yt-dlp subprocess management — ask in the comments.
