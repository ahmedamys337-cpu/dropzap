import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Free Thumbnail Downloader — TikTok, Instagram, YouTube Covers",
  description:
    "Download TikTok, Instagram Reel, and YouTube video thumbnails in HD. Paste the post URL and grab the cover image instantly — no signup.",
  keywords: [
    "thumbnail downloader",
    "tiktok thumbnail downloader",
    "instagram thumbnail downloader",
    "youtube thumbnail downloader",
    "download tiktok cover",
    "download instagram reel cover",
    "save youtube thumbnail",
    "video cover downloader",
  ],
  alternates: { canonical: `${SITE_URL}/thumbnail-downloader` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/thumbnail-downloader`,
    title: "Free Thumbnail Downloader — TikTok, Instagram, YouTube Covers",
    description: "Download video cover images from TikTok, Instagram Reels, and YouTube in HD.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function ThumbnailDownloaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
