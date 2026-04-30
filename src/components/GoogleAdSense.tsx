"use client";

import Script from "next/script";

interface GoogleAdSenseProps {
  client?: string;
}

/**
 * Loads the Google AdSense base script. Required for site verification and
 * for any <ins class="adsbygoogle"> ad unit to render.
 *
 * Reads the publisher ID (e.g. "ca-pub-1234567890123456") from the
 * NEXT_PUBLIC_ADSENSE_CLIENT environment variable, or from the optional
 * `client` prop. Renders nothing if no ID is configured.
 */
export default function GoogleAdSense({ client }: GoogleAdSenseProps) {
  const id = client || process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  if (!id) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${id}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
