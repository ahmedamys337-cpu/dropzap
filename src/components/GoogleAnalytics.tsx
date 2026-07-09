"use client";

import Script from "next/script";

interface GoogleAnalyticsProps {
  measurementId?: string;
}

// Common bot user agents to exclude from analytics
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /java/i,
  /go-http-client/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
];

function isBot(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return BOT_PATTERNS.some(pattern => pattern.test(ua));
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const id = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!id) return null;

  // Don't load GA for bots to avoid skewing analytics
  if (isBot()) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
