/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.twimg.com' },
      { protocol: 'https', hostname: '**.tiktokcdn.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: '**.redd.it' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: false,
  },
  // Strip console.* in production builds (keeps console.error and
  // console.warn for actual error reporting, removes debug logs).
  // This shaves ~3-8KB off the client bundle and prevents accidental
  // leakage of internal state in user dev-tools.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },
  // Permanent redirects for programmatic SEO pages we removed.
  //
  // The 44 YouTube /download/youtube-* slugs were de-listed because their
  // CTA pointed to /youtube-downloader (which 308s to /), causing Google
  // to read each page as a dead-end and tank the entire cluster's
  // quality score. The non-YouTube slugs we trimmed (carousel devices,
  // year-tagged variants, etc.) are similarly retired.
  //
  // 308 instead of 404 because:
  //   • preserves any residual link equity to the homepage;
  //   • lets Google replace the URL in its index instead of leaving a
  //     "soft 404 / removed" entry that lingers for months;
  //   • avoids breaking any third-party backlinks pointing to old slugs.
  async redirects() {
    return [
      // Catch every /download/youtube-* and any other now-removed
      // long-tail variant we no longer ship. Wildcard the rest under
      // /download by checking against the live list at request time
      // would require middleware — for static SEO removal a coarse
      // redirect is correct.
      { source: '/download/youtube-:rest*', destination: '/', permanent: true },
      // 4 blog posts deleted in May 2026 because their CTAs all linked
      // to /youtube-downloader (which 308s to /). Their old slugs may
      // still be in GSC's index — redirecting to /blog preserves link
      // equity instead of returning a soft-404 stream.
      { source: '/blog/how-to-download-youtube-videos-2026', destination: '/blog', permanent: true },
      { source: '/blog/youtube-to-mp3-converter-guide', destination: '/blog', permanent: true },
      { source: '/blog/download-youtube-shorts', destination: '/blog', permanent: true },
      { source: '/blog/4k-video-downloader-free', destination: '/blog', permanent: true },
      // 2 duplicate posts merged into the longer May-9 versions. Both
      // old slugs are 301'd to the new canonical post so any backlinks
      // or GSC-indexed entries flow PageRank into the surviving page.
      {
        source: '/blog/tiktok-download-without-watermark',
        destination: '/blog/how-to-download-tiktok-without-watermark',
        permanent: true,
      },
      {
        source: '/blog/instagram-reels-downloader-guide',
        destination: '/blog/how-to-download-instagram-reels-on-iphone',
        permanent: true,
      },
    ];
  },
  async headers() {
    // Content-Security-Policy rationale:
    //   script-src   — 'unsafe-inline' is required by Next.js hydration scripts and
    //                  Adsterra ad tags. 'unsafe-eval' is included because some ad
    //                  networks use eval internally. Google Tag Manager + Adsterra
    //                  domains are explicitly allowlisted.
    //   style-src    — 'unsafe-inline' is required by Tailwind / shadcn inline styles.
    //   img-src      — Restricted to known CDN hostnames (the same set used in
    //                  next.config.js remotePatterns) plus data:/blob: for previews.
    //   connect-src  — Restricts which servers JS can talk to (XHR/fetch). Cobalt
    //                  API instances are included because /api/stream proxies IG
    //                  downloads through them. Adsterra/GA beacons are allowlisted.
    //   frame-src    — Ads deliver via iframes; wildcard is unavoidable here because
    //                  Adsterra serves creatives from rotating partner domains.
    //   object-src   — 'none' blocks Flash/Java plugin exploits entirely.
    //   base-uri     — 'self' prevents <base> tag injection attacks.
    //   worker-src   — blob: needed for any future web-worker downloads.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.highperformanceformat.com https://*.effectivecpmnetwork.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com https://*.cdninstagram.com https://*.twimg.com https://*.tiktokcdn.com https://*.fbcdn.net https://*.redd.it",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://api.cobalt.tools https://cobalt-api.kwiatekmiki.com https://co.eepy.today",
      "frame-src *",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "worker-src 'self' blob:",
    ].join("; ");

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Hashed Next.js assets are immutable — cache forever. The hash in
      // the filename guarantees cache invalidation when a file changes.
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Self-hosted fonts (if added under /fonts) — same immutable rule.
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Static AI/SEO files — long cache, but allow revalidation since
      // we may update llms.txt content without renaming the file.
      {
        source: '/llms.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
        ],
      },
      {
        source: '/llms-full.md',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
          { key: 'Content-Type', value: 'text/markdown; charset=utf-8' },
        ],
      },
      {
        source: '/icon.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/apple-icon.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // PNG/JPG/WebP/SVG/ICO/manifest in /public — content-addressed by
      // filename, never re-hashed by Next, so they're safe to cache
      // aggressively. Fixes the Lighthouse "use efficient cache
      // lifetimes" finding (~288 KiB of savings on the homepage).
      {
        source: '/:file(.*\\.(?:png|jpg|jpeg|webp|gif|svg|ico|webmanifest))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
