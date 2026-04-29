import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dropzap.app";
const SITE_NAME = "DropZap";
const SITE_TAGLINE = "Media Downloader";
const SITE_DESCRIPTION =
  "DropZap — the fastest free media downloader. Save videos from YouTube, Instagram Reels, TikTok, Twitter/X, Facebook, and Reddit in HD without watermarks. No signup, no limits.";

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
    default: `${SITE_NAME} — Free YouTube, Instagram, TikTok Downloader`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "DropZap: free video downloader for YouTube, Instagram Reels, TikTok & Twitter/X. HD quality, no watermark, no signup required.",
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
    "youtube downloader",
    "youtube video downloader",
    "youtube to mp3",
    "youtube to mp4",
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
    title: `${SITE_NAME} — Free YouTube, Instagram, TikTok & Twitter Video Downloader`,
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
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
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
        url: `${SITE_URL}/icon.svg`,
        width: 512,
        height: 512,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any (Web Browser)",
      description: SITE_DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "Download YouTube videos in HD/4K",
        "Download Instagram Reels and posts",
        "Download TikTok videos without watermark",
        "Download Twitter/X videos",
        "Download Facebook videos and Reels",
        "Download Reddit videos with sound",
        "Convert videos to MP3",
        "Bulk download queue",
        "YouTube thumbnail downloader",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to download a video with DropZap",
      description: "Download any video from YouTube, Instagram, TikTok or Twitter/X for free in 3 steps.",
      totalTime: "PT1M",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Copy the video URL",
          text: "Go to YouTube, Instagram, TikTok, or Twitter/X and copy the URL of the video you want to download.",
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
            text: "DropZap supports YouTube, Instagram (Reels & Posts), TikTok, Twitter/X, Facebook, and Reddit (with sound). You can also convert videos to MP3 and bulk-download multiple links.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
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
