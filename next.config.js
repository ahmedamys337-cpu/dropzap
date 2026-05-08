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
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
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
    ];
  },
};

module.exports = nextConfig;
