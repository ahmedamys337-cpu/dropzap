import type { Metadata } from "next";
import MobileLandingPage from "@/components/MobileLandingPage";
import { getMobilePage } from "@/lib/mobile-pages-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";
const data = getMobilePage("iphone-video-downloader")!;

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  keywords: data.keywords,
  alternates: { canonical: `${SITE_URL}/iphone-video-downloader` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/iphone-video-downloader`,
    title: data.metaTitle,
    description: data.metaDescription,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: data.metaTitle,
    description: data.metaDescription,
  },
};

export default function IphoneVideoDownloaderPage() {
  return <MobileLandingPage data={data} />;
}
