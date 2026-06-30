import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AdsterraAds from "@/components/AdsterraAds";

// `display: "swap"` eliminates FOIT (Flash of Invisible Text) — text
// renders immediately with the system fallback while Inter loads, then
// swaps in. Critical for LCP because next/font self-hosts the file
// but the swap timing is what Google's CWV measures.
const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";
const SITE_NAME = "DropZap";
const SITE_TAGLINE = "Media Downloader";
// Kept under 155 chars so Google does not rewrite it (SEO audit fix).
const SITE_DESCRIPTION =
  "Free downloader for Instagram Reels, TikTok, Facebook, Twitter/X, Reddit, Pinterest & Threads. HD quality. No watermark. No signup.";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Title kept inside the 30–60 char range Google displays in full.
  title: {
    default: `${SITE_NAME} — Free Instagram, TikTok & Facebook Downloader`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Technology",
  keywords: [
    "DropZap",
    "media downloader",
    "video downloader",
    "instagram downloader",
    "instagram reels downloader",
    "instagram video download",
    "tiktok downloader",
    "tiktok no watermark",
    "twitter video downloader",
    "x video downloader",
    "mp3 converter",
    "mp4 downloader",
    "save reels",
    "save tiktok",
    "online video downloader",
    "free video downloader",
    "hd video downloader",
    "4k video downloader",
    "no watermark downloader",
    "thumbnail downloader",
    "youtube thumbnail downloader",
    "instagram photo downloader",
    "instagram carousel downloader",
    "bulk video downloader",
  ],
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en": SITE_URL,
      "en-US": SITE_URL,
      "en-GB": SITE_URL,
      "en-CA": SITE_URL,
      "en-AU": SITE_URL,
      "en-IN": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Free Instagram, TikTok & Facebook Downloader`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
    creator: "@dropzap",
  },
  other: {
    "rss": `${SITE_URL}/feed.xml`,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.webmanifest",
  // PWA / Apple Web App meta tags. Lets iOS users "Add to Home Screen"
  // and launch DropZap as a standalone app with no browser chrome —
  // a small but real signal Google's mobile-friendliness ranking
  // factor weighs, and a meaningful return-user retention boost on
  // mobile (Add-to-Home-Screen users come back ~3x more often).
  appleWebApp: {
    capable: true,
    title: "DropZap",
    statusBarStyle: "black-translucent",
  },
  verification: {
    // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in your Render/host env to activate.
    // Get the code from: https://search.google.com/search-console
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION }
      : undefined,
  },
};

// Site-wide identity schemas only — WebSite and Organization.
// WebApplication, HowTo, and FAQPage are emitted per-page (homepage + each
// platform page) so they are never duplicated across routes. Duplicate
// structured-data types on the same URL cause Google to suppress or
// ignore all instances, costing rich-result eligibility sitewide.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: [
        SITE_TAGLINE,
        "DropZap Downloader",
        "DropZap Media Downloader",
        "DropZap.digital",
      ],
      description: SITE_DESCRIPTION,
      inLanguage: "en-US",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?url={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: [
        "DropZap Downloader",
        "DropZap Media Downloader",
        "DropZap.digital",
      ],
      disambiguatingDescription:
        "DropZap is a free web-based media downloader for Instagram, TikTok, Facebook, Twitter/X, Reddit, Pinterest, and Threads. Not affiliated with the DropZap iOS puzzle game by Amir Michail.",
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
      foundingDate: "2026-04-01",
      slogan: "Free media downloader — Instagram, TikTok, Facebook, Reddit, and more.",
      knowsAbout: [
        "Instagram Reels download",
        "TikTok video download without watermark",
        "Reddit video download with audio",
        "Facebook video and album download",
        "Twitter/X video download",
        "Pinterest pin download",
        "Threads media download",
        "YouTube thumbnail download",
        "Video to MP3 conversion",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "Is DropZap free?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap is 100% free with no subscription, no signup, and no hidden fees." } },
        { "@type": "Question", name: "Does DropZap remove TikTok watermarks?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap downloads TikTok videos from the source before the watermark is applied, so the downloaded MP4 has no TikTok logo or username overlay." } },
        { "@type": "Question", name: "Do I need to create an account?", acceptedAnswer: { "@type": "Answer", text: "No. DropZap never asks for your email, phone number, or social media login. Just paste the URL and download." } },
        { "@type": "Question", name: "Is there a daily download limit?", acceptedAnswer: { "@type": "Answer", text: "No. DropZap has no daily limit. You can download as many files as you need in a single session." } },
        { "@type": "Question", name: "Does DropZap work on iPhone?", acceptedAnswer: { "@type": "Answer", text: "Yes. Open DropZap in Safari on your iPhone, paste the URL, and download. The file saves to Files. Tap Share → Save Video for Camera Roll." } },
        { "@type": "Question", name: "Does DropZap work on Android?", acceptedAnswer: { "@type": "Answer", text: "Yes. Open DropZap in Chrome on Android, paste the URL, and download. The file saves directly to your Downloads folder and appears in your Gallery." } },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts preconnect removed — next/font self-hosts Inter,
           so there is no runtime fetch to fonts.googleapis.com. Keeping
           the preconnects would force an unused DNS+TLS handshake. */}
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <AdsterraAds />
      </body>
    </html>
  );
}
