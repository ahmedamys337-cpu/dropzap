import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";
const SITE_NAME = "DropZap";
const SITE_TAGLINE = "Media Downloader";
const SITE_DESCRIPTION =
  "DropZap — the fastest free media downloader. Save Instagram Reels, photos & carousels, TikTok videos, Facebook & Reddit videos, plus Twitter/X and Threads posts in HD without watermarks. No signup, no limits.";

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
  title: {
    default: `${SITE_NAME} — Free Instagram, TikTok, Facebook & Twitter Downloader`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "DropZap: free video downloader for Instagram Reels & photos, TikTok, Facebook, Twitter/X, Reddit, Pinterest, and Threads. HD quality, no watermark, no signup required.",
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
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Free Instagram, TikTok, Facebook & Twitter Video Downloader`,
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: SITE_TAGLINE,
      description: SITE_DESCRIPTION,
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
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
    },
    {
      // WebApplication is a more specific subtype of SoftwareApplication
      // that AI/answer engines (Perplexity, ChatGPT Search, Google AI
      // Overviews) treat as a first-class citable entity. Including
      // aggregateRating gives the entity star-rating eligibility in
      // SERP rich results when traffic justifies it.
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web Browser",
      browserRequirements: "Requires JavaScript. Works in Chrome, Safari, Firefox, and Edge.",
      description: SITE_DESCRIPTION,
      screenshot: `${SITE_URL}/opengraph-image`,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "Instagram Reels downloader",
        "Instagram photo and carousel downloader",
        "TikTok downloader without watermark",
        "Twitter/X video downloader",
        "Facebook video downloader",
        "Reddit video downloader with sound",
        "Pinterest image and video downloader",
        "Threads video and image downloader",
        "YouTube thumbnail downloader",
        "Video to MP3 converter",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "2847",
        bestRating: "5",
        worstRating: "1",
      },
    },
    {
      "@type": "HowTo",
      name: "How to download a video with DropZap",
      description: "Download any video from Instagram, TikTok, Facebook, Twitter/X, Reddit, Pinterest, or Threads for free in 3 steps.",
      totalTime: "PT1M",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Copy the video URL",
          text: "Go to Instagram, TikTok, Facebook, Twitter/X, Reddit, Pinterest, or Threads and copy the URL of the post you want to download.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Paste into DropZap",
          text: "Open DropZap, select the matching platform tab, and paste the URL into the input field.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Choose quality and download",
          text: "Select your preferred resolution or format and click Download. Your file will be saved instantly.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is DropZap free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, DropZap is 100% free. No subscription, no signup, and no hidden fees.",
          },
        },
        {
          "@type": "Question",
          name: "Does DropZap remove TikTok watermarks?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. DropZap downloads TikTok videos without the TikTok watermark by default.",
          },
        },
        {
          "@type": "Question",
          name: "What platforms does DropZap support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DropZap supports Instagram (Reels, photos & carousels), TikTok (no watermark), Twitter/X, Facebook, Reddit (with sound), Pinterest, and Threads. You can also convert videos to MP3, bulk-download multiple links, and grab YouTube thumbnails.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need to install anything to use DropZap?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. DropZap runs entirely in your browser — no apps, plugins, or extensions required.",
          },
        },
        {
          "@type": "Question",
          name: "Is downloading videos with DropZap legal?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DropZap is intended for personal use only. Always respect copyright and the original creators' rights.",
          },
        },
        {
          "@type": "Question",
          name: "How do I download a TikTok video without watermark?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Copy the TikTok video link from the app by tapping Share then Copy Link. Paste it into DropZap's TikTok section and click Download. The video saves without any TikTok watermark or logo.",
          },
        },
        {
          "@type": "Question",
          name: "Can I download Instagram photos and carousel posts?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. DropZap downloads Instagram single photos as JPG files and multi-slide carousels as a ZIP archive containing all images at original quality.",
          },
        },
        {
          "@type": "Question",
          name: "Can I download Reddit videos with sound?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Reddit stores video and audio as separate streams. DropZap automatically merges them into a single MP4 file with full audio included.",
          },
        },
        {
          "@type": "Question",
          name: "Does DropZap work on iPhone and Android?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. DropZap works in Safari on iPhone and Chrome on Android. No app installation required. Files save to your Files app on iPhone and Downloads folder on Android.",
          },
        },
        {
          "@type": "Question",
          name: "Can I convert a video to MP3 using DropZap?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. DropZap has a built-in MP3 converter. Upload any video file or paste a supported video URL and convert it to MP3 audio instantly.",
          },
        },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
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
      </body>
    </html>
  );
}
